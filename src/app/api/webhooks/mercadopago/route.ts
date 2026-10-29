import {getDb,getRuntimeValue} from "@/lib/db";
import {secureTextEqual} from "@/lib/security";
import {jsonError,jsonOk} from "@/lib/http";

export const dynamic="force-dynamic";
type Notice={id?:string|number;type?:string;action?:string;data?:{id?:string|number}};
type Payment={id:number|string;status:string;status_detail?:string;transaction_amount:number;currency_id:string;external_reference:string;live_mode:boolean;payment_method_id?:string};
async function validateSignature(signature:string,requestId:string,dataId:string,secret:string):Promise<boolean>{
 const fields:Record<string,string>={};
 for(const part of signature.split(",")){const index=part.indexOf("=");if(index>0)fields[part.slice(0,index).trim()]=part.slice(index+1).trim();}
 if(!fields.ts||!fields.v1||!/^\d+$/.test(fields.ts)||!/^([0-9a-f]{64})$/i.test(fields.v1))return false;
 const manifest="id:"+dataId.toLowerCase()+";request-id:"+requestId+";ts:"+fields.ts+";";
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const bytes=new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(manifest)));
 const digest=Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
 return secureTextEqual(digest,fields.v1.toLowerCase());
}
export async function POST(request:Request){
 const signature=request.headers.get("x-signature")||"";const requestId=request.headers.get("x-request-id")||"";
 const url=new URL(request.url);let body:Notice;
 try{body=await request.json() as Notice}catch{return jsonError("JSON inválido.",400)}
 const dataId=url.searchParams.get("data.id")||String(body.data?.id||"");
 if(!dataId||dataId.length>120)return jsonError("Falta el identificador del pago.",400);
 if(body.type&&body.type!=="payment")return jsonOk({received:true,ignored:true});
 const webhookSecret=await getRuntimeValue("MP_WEBHOOK_SECRET");
 if(!webhookSecret)return jsonError("Webhook no configurado.",503);
 if(!requestId||!await validateSignature(signature,requestId,dataId,webhookSecret))return jsonError("Firma del webhook inválida.",401);
 const mode=(await getRuntimeValue("MP_MODE"))||"test";
 const token=await getRuntimeValue(mode==="production"?"MP_ACCESS_TOKEN_PROD":"MP_ACCESS_TOKEN_TEST");
 if(!token)return jsonError("Credenciales de Mercado Pago no configuradas.",503);
 let payment:Payment;
 try{
  const res=await fetch("https://api.mercadopago.com/v1/payments/"+encodeURIComponent(dataId),{headers:{Authorization:"Bearer "+token,Accept:"application/json"},signal:AbortSignal.timeout(10000)});
  if(!res.ok)return jsonError("No se pudo verificar el pago con el proveedor.",502);
  payment=await res.json() as Payment;
 }catch{return jsonError("No se pudo consultar el estado del pago.",502)}
 if(!payment||String(payment.id)!==dataId)return jsonError("Respuesta del proveedor no válida.",502);
 const db=await getDb().catch(()=>null);if(!db)return jsonError("Base de datos no disponible.",503);
 const eventKey=String(body.id??(String(payment.id)+":"+String(body.action??payment.status)));
 try{
  await db.prepare("INSERT INTO webhook_events(id,provider,event_key) VALUES(?,?,?) ON CONFLICT(provider,event_key) DO NOTHING").bind(crypto.randomUUID(),"mercadopago",eventKey).run();
  const event=await db.prepare("SELECT processed_at FROM webhook_events WHERE provider=? AND event_key=?").bind("mercadopago",eventKey).first<{processed_at:string|null}>();
  if(event?.processed_at)return jsonOk({received:true,duplicate:true});
  const order=await db.prepare("SELECT id,order_number,total_cents,payment_status,status FROM orders WHERE id=? AND channel='mercadopago' LIMIT 1").bind(payment.external_reference).first<{id:string;order_number:string;total_cents:number;payment_status:string;status:string}>();
  if(!order)return jsonError("El pedido asociado no existe.",404);
  const expectedLive=mode==="production";const amount=Math.round(Number(payment.transaction_amount)*100);
  if(payment.currency_id!=="PEN"||amount!==Number(order.total_cents)||Boolean(payment.live_mode)!==expectedLive)return jsonError("El monto, moneda o entorno del pago no coincide con el pedido.",409);
  const paymentRow=await db.prepare("SELECT id FROM payments WHERE provider=? AND provider_payment_id=?").bind("mercadopago",String(payment.id)).first<{id:string}>();
  const paymentId=paymentRow?.id||crypto.randomUUID();
  const statements=[];
  statements.push(db.prepare(paymentRow
    ?"UPDATE payments SET status=?,amount_cents=?,raw_status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?"
    :"INSERT INTO payments(id,order_id,provider,provider_payment_id,status,amount_cents,raw_status) VALUES(?,?,?,?,?,?,?)"
  ).bind(...(paymentRow?[payment.status,amount,payment.status_detail||"",paymentId]:[paymentId,order.id,"mercadopago",String(payment.id),payment.status,amount,payment.status_detail||""])));
  if(payment.status==="approved"){
   statements.push(db.prepare("UPDATE product_variants SET stock_on_hand=stock_on_hand-(SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi WHERE oi.order_id=? AND oi.variant_id=product_variants.id),stock_reserved=MAX(0,stock_reserved-(SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi WHERE oi.order_id=? AND oi.variant_id=product_variants.id)) WHERE id IN (SELECT variant_id FROM order_items WHERE order_id=? AND variant_id IS NOT NULL) AND EXISTS(SELECT 1 FROM orders WHERE id=? AND payment_status='pending')").bind(order.id,order.id,order.id,order.id));
   statements.push(db.prepare("UPDATE orders SET payment_status='approved',status='paid',updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='pending'").bind(order.id));
  }else if(["rejected","cancelled"].includes(payment.status)){
   statements.push(db.prepare("UPDATE product_variants SET stock_reserved=MAX(0,stock_reserved-(SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi WHERE oi.order_id=? AND oi.variant_id=product_variants.id)) WHERE id IN (SELECT variant_id FROM order_items WHERE order_id=? AND variant_id IS NOT NULL) AND EXISTS(SELECT 1 FROM orders WHERE id=? AND payment_status='pending')").bind(order.id,order.id,order.id));
   statements.push(db.prepare("UPDATE orders SET payment_status=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='pending'").bind(payment.status,payment.status==="rejected"?"payment_rejected":"cancelled",order.id));
  }else if(["refunded","charged_back"].includes(payment.status)){
   statements.push(db.prepare("UPDATE orders SET payment_status=?,status='needs_review',updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='approved'").bind(payment.status,order.id));
  }
  if(payment.status!=="pending"&&payment.status!=="in_process"&&payment.status!=="authorized"){
   statements.push(db.prepare("UPDATE webhook_events SET processed_at=CURRENT_TIMESTAMP WHERE provider=? AND event_key=?").bind("mercadopago",eventKey));
  }
  await db.batch(statements);
  return jsonOk({received:true});
 }catch{return jsonError("No se pudo aplicar el evento de pago. Mercado Pago puede volver a notificarlo.",503)}
}
