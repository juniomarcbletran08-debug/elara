import {getDb} from "@/lib/db";
import {isAdminAuthorized,sameOrigin} from "@/lib/security";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 try{const db=await getDb();const orders=await db.prepare("SELECT id,order_number,customer_name,customer_email,customer_phone,shipping_city,channel,status,payment_status,currency,subtotal_cents,shipping_cents,total_cents,created_at,updated_at FROM orders ORDER BY created_at DESC LIMIT 200").all<Record<string,unknown>>();const items=await db.prepare("SELECT oi.order_id,oi.product_name,oi.variant_label,oi.quantity,oi.unit_price_cents,oi.line_total_cents FROM order_items oi JOIN orders o ON o.id=oi.order_id ORDER BY o.created_at DESC LIMIT 600").all<Record<string,unknown>>();const byOrder=new Map<string,Record<string,unknown>[]>();for(const item of items.results){const key=String(item.order_id);byOrder.set(key,[...(byOrder.get(key)||[]),item]);}return Response.json({orders:orders.results.map(o=>({...o,items:byOrder.get(String(o.id))||[]}))},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"No se pudieron consultar los pedidos."},{status:503})}
}
export async function PATCH(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 let b:unknown;try{b=await request.json()}catch{return Response.json({error:"JSON inválido."},{status:400})}
 if(!b||typeof b!=="object"||!("id" in b)||!("status" in b))return Response.json({error:"Datos incompletos."},{status:400});
 const {id,status} = b as {id:unknown;status:unknown};
 if(typeof id!=="string"||id.length>128||(status!=="fulfilled"&&status!=="cancelled"))return Response.json({error:"Transición de estado no permitida."},{status:400});
 try{
  const db=await getDb();const order=await db.prepare("SELECT id,status,payment_status,channel FROM orders WHERE id=?").bind(id).first<{id:string;status:string;payment_status:string;channel:string}>();
  if(!order)return Response.json({error:"Pedido no encontrado."},{status:404});
  if(status==="fulfilled"&&order.payment_status!=="approved")return Response.json({error:"Solo puedes completar un pedido con pago aprobado."},{status:409});
  if(status==="cancelled"&&order.payment_status==="approved")return Response.json({error:"Un pedido pagado requiere el proceso de devolución correspondiente; no se cancela desde este panel."},{status:409});
  if(status==="cancelled"&&order.payment_status==="pending"){
   const statements=[];
   if(order.channel==="mercadopago")statements.push(db.prepare("UPDATE product_variants SET stock_reserved=MAX(0,stock_reserved-(SELECT COALESCE(SUM(oi.quantity),0) FROM order_items oi WHERE oi.order_id=? AND oi.variant_id=product_variants.id)) WHERE id IN (SELECT variant_id FROM order_items WHERE order_id=? AND variant_id IS NOT NULL) AND EXISTS(SELECT 1 FROM orders WHERE id=? AND payment_status='pending')").bind(id,id,id));
   statements.push(db.prepare("UPDATE orders SET status='cancelled',payment_status='cancelled',updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status='pending'").bind(id));
   await db.batch(statements);
  }else{
   const result=await db.prepare("UPDATE orders SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=? AND payment_status=?").bind(status,id,order.payment_status).run();
   if(!result.meta?.changes)return Response.json({error:"El estado del pedido cambió; recarga y vuelve a intentarlo."},{status:409});
  }
  return Response.json({updated:true},{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({error:"No se pudo actualizar el pedido."},{status:409})}
}
