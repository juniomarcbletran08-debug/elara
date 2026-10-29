import {getDb} from "@/lib/db";
import {consumeRateLimit,requestIdentity,secureTextEqual,sha256,sameOrigin} from "@/lib/security";
import {jsonError,jsonOk,readJsonObject} from "@/lib/http";
export const dynamic="force-dynamic";
export async function POST(request:Request){
 if(!sameOrigin(request))return jsonError("Origen no permitido.",403);
 if(!await consumeRateLimit("order-lookup",requestIdentity(request),6,600))return jsonError("Demasiadas consultas. Espera unos minutos.",429);
 const body=await readJsonObject(request,4000);if(!body)return jsonError("Solicitud inválida.",400);
 const orderNumber=typeof body.orderNumber==="string"?body.orderNumber.trim().toUpperCase():"";
 const code=typeof body.accessCode==="string"?body.accessCode.trim().toUpperCase():"";
 if(!/^ELA-\d{8}-[A-F0-9]{6}$/.test(orderNumber)||! /^[A-F0-9]{16}$/.test(code))return jsonError("Introduce el número de pedido y el código de consulta válidos.",400);
 try{
  const db=await getDb();const order=await db.prepare("SELECT id,order_number,access_code_hash,status,payment_status,currency,subtotal_cents,shipping_cents,total_cents,channel,created_at,updated_at FROM orders WHERE order_number=? LIMIT 1").bind(orderNumber).first<Record<string,unknown>>();
  if(!order||typeof order.access_code_hash!=="string"||!await secureTextEqual(await sha256(code),order.access_code_hash))return jsonError("No encontramos un pedido con esos datos.",404);
  const items=await db.prepare("SELECT product_name,variant_label,quantity,unit_price_cents,line_total_cents FROM order_items WHERE order_id=? ORDER BY id").bind(order.id as string).all<Record<string,unknown>>();
  return jsonOk({order:{orderNumber:order.order_number,status:order.status,paymentStatus:order.payment_status,currency:order.currency,subtotalCents:order.subtotal_cents,shippingCents:order.shipping_cents,totalCents:order.total_cents,channel:order.channel,createdAt:order.created_at,updatedAt:order.updated_at,items:items.results.map(i=>({name:i.product_name,variant:i.variant_label,quantity:i.quantity,unitPriceCents:i.unit_price_cents,lineTotalCents:i.line_total_cents}))}});
 }catch{return jsonError("No se pudo consultar el pedido.",503)}
}
