import {getDb,getRuntimeValue} from "@/lib/db";
import {consumeRateLimit,requestIdentity,sameOrigin} from "@/lib/security";
import {buildWhatsAppOrderMessage,createOrder,getWhatsAppUrl,quoteLines,releaseOrderReservation} from "@/lib/orders";
import {isEmail,jsonError,jsonOk,readJsonObject,validPhone} from "@/lib/http";
import {STORE} from "@/lib/config";

export const dynamic="force-dynamic";
const maxBody=24000;
export async function POST(request:Request){
 if(!sameOrigin(request))return jsonError("Origen no permitido.",403);
 if(!await consumeRateLimit("checkout",requestIdentity(request),8,600))return jsonError("Has realizado demasiadas solicitudes. Espera unos minutos y vuelve a intentarlo.",429);
 const body=await readJsonObject(request,maxBody);
 if(!body)return jsonError("Solicitud JSON inválida o demasiado grande.",400);
 const customerName=typeof body.customerName==="string"?body.customerName.trim():"";
 const phone=typeof body.phone==="string"?body.phone.trim():"";
 const email=typeof body.email==="string"?body.email.trim():"";
 const address=typeof body.address==="string"?body.address.trim():"";
 const city=typeof body.city==="string"?body.city.trim():"";
 const reference=typeof body.reference==="string"?body.reference.trim():"";
 const method=body.method;
 if(customerName.length<2||customerName.length>140)return jsonError("Introduce tu nombre completo.",400);
 if(!validPhone(phone))return jsonError("Introduce un teléfono válido.",400);
 if(email&&!isEmail(email))return jsonError("El correo electrónico no es válido.",400);
 if(address.length>240||city.length>120||reference.length>500)return jsonError("Revisa los datos de entrega.",400);
 if(method!=="whatsapp"&&method!=="mercadopago")return jsonError("Método de pedido no válido.",400);
 let lines;
 try{lines=await quoteLines(body.items)}catch(e){return jsonError(e instanceof Error?e.message:"No se pudo validar el carrito.",409)}
 const siteUrl=(await getRuntimeValue("APP_URL"))||new URL(request.url).origin;
 if(method==="whatsapp"){
  try{
   const order=await createOrder({customerName,email,phone,address,city,reference,method:"whatsapp",lines,shippingCents:0,shippingPending:true});
   const message=buildWhatsAppOrderMessage(order,customerName,lines,siteUrl);
   return jsonOk({orderNumber:order.orderNumber,accessCode:order.accessCode,totalCents:order.totalCents,subtotalCents:order.subtotalCents,shippingPending:true,whatsappUrl:getWhatsAppUrl(message)},201);
  }catch{return jsonError("No se pudo registrar la solicitud de pedido. Inténtalo de nuevo.",503)}
 }
 const rawShipping=await getRuntimeValue("SHIPPING_FLAT_CENTS");
 if(rawShipping===undefined||rawShipping.trim()===""||!Number.isSafeInteger(Number(rawShipping))||Number(rawShipping)<0)return jsonError("El pago online no está habilitado: configura el coste real de envío antes de cobrar.",503);
 const shippingCents=Number(rawShipping);
 const baseUrl=siteUrl.replace(/\/$/,"");
 if(!baseUrl.startsWith("https://")&&process.env.NODE_ENV==="production")return jsonError("La URL pública debe usar HTTPS para habilitar el pago.",503);
 const mode=(await getRuntimeValue("MP_MODE"))||"test";
 const token=await getRuntimeValue(mode==="production"?"MP_ACCESS_TOKEN_PROD":"MP_ACCESS_TOKEN_TEST");
 if(!token)return jsonError("Mercado Pago no está configurado para este entorno.",503);
 let order:{id:string;orderNumber:string;accessCode:string;subtotalCents:number;shippingCents:number;totalCents:number}|null=null;
 const db=await getDb().catch(()=>null);
 if(!db)return jsonError("La base de datos no está disponible.",503);
 try{
  order=await createOrder({customerName,email,phone,address,city,reference,method:"mercadopago",lines,shippingCents,shippingPending:false});
  await db.prepare("INSERT INTO payments(id,order_id,provider,status,amount_cents) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),order.id,"mercadopago","pending",order.totalCents).run();
  const items=lines.map(line=>({id:line.variant_sku,title:line.name+" — "+line.size+" / "+line.color,quantity:line.quantity,currency_id:"PEN",unit_price:Number((line.unit_price_cents/100).toFixed(2))}));
  if(shippingCents>0)items.push({id:"shipping",title:"Envío",quantity:1,currency_id:"PEN",unit_price:Number((shippingCents/100).toFixed(2))});
  const preference={
   items,
   external_reference:order.id,
   notification_url:baseUrl+"/api/webhooks/mercadopago",
   back_urls:{success:baseUrl+"/checkout/resultado?status=success",failure:baseUrl+"/checkout/resultado?status=failure",pending:baseUrl+"/checkout/resultado?status=pending"},
   auto_return:baseUrl.startsWith("https://")?"approved":undefined,
   payer:{name:customerName,email:email||undefined},
   statement_descriptor:STORE.name.replace(/[^A-Za-z0-9 ]/g,"").slice(0,13)||"ELARA",
   metadata:{order_number:order.orderNumber,environment:mode},
  };
  const response=await fetch("https://api.mercadopago.com/checkout/preferences",{method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json","X-Idempotency-Key":"elara-pref-"+order.id},body:JSON.stringify(preference),signal:AbortSignal.timeout(12000)});
  const data=await response.json().catch(()=>({})) as {id?:string;init_point?:string;sandbox_init_point?:string;message?:string};
  const checkoutUrl=mode==="production"?data.init_point:data.sandbox_init_point||data.init_point;
  if(!response.ok||!data.id||!checkoutUrl)throw new Error("No se pudo crear la preferencia de Mercado Pago.");
  await db.prepare("UPDATE payments SET preference_id=?,updated_at=CURRENT_TIMESTAMP WHERE order_id=? AND provider='mercadopago'").bind(data.id,order.id).run();
  await db.prepare("UPDATE orders SET checkout_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(checkoutUrl,order.id).run();
  return jsonOk({orderNumber:order.orderNumber,accessCode:order.accessCode,checkoutUrl,totalCents:order.totalCents},201);
 }catch{
  if(order){
   await releaseOrderReservation(order.id).catch(()=>undefined);
   await db.prepare("UPDATE orders SET status='payment_setup_failed',payment_status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='pending'").bind(order.id).run().catch(()=>undefined);
   await db.prepare("UPDATE payments SET status='failed',updated_at=CURRENT_TIMESTAMP WHERE order_id=? AND provider='mercadopago'").bind(order.id).run().catch(()=>undefined);
  }
  return jsonError("No se pudo iniciar el pago. No se ha confirmado ningún cobro; inténtalo de nuevo o contáctanos.",502);
 }
}
