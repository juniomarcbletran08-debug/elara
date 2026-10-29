import {getDb} from "@/lib/db";
import {sha256} from "@/lib/security";
import {formatPEN} from "@/lib/format";
import {STORE,whatsappUrl} from "@/lib/config";

export type PricedLine={product_id:string;variant_id:string;name:string;slug:string;sku:string;variant_sku:string;size:string;color:string;unit_price_cents:number;quantity:number;stock_on_hand:number;stock_reserved:number;image_url:string|null};
export function generateOrderNumber(){const d=new Date();const day=String(d.getFullYear())+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0");return "ELA-"+day+"-"+crypto.randomUUID().replace(/-/g,"").slice(0,6).toUpperCase();}
export async function quoteLines(input:unknown):Promise<PricedLine[]>{
 if(!Array.isArray(input)||input.length<1||input.length>30)throw new Error("El carrito debe contener entre 1 y 30 líneas.");
 const db=await getDb();const output:PricedLine[]=[];const seen=new Set<string>();
 for(const item of input){
  if(!item||typeof item!=="object")throw new Error("Hay un producto no válido en el carrito.");
  const row=item as Record<string,unknown>;
  if(typeof row.productId!=="string"||typeof row.variantId!=="string"||!Number.isInteger(row.quantity)||Number(row.quantity)<1||Number(row.quantity)>20)throw new Error("Revisa las cantidades del carrito.");
  if(seen.has(row.variantId))throw new Error("El carrito contiene variantes duplicadas.");seen.add(row.variantId);
  const p=await db.prepare("SELECT p.id AS product_id,p.slug,p.name,p.sku,p.price_cents,p.sale_price_cents,v.id AS variant_id,v.sku AS variant_sku,v.size,v.color,v.stock_on_hand,v.stock_reserved,v.active,p.images_json FROM products p JOIN product_variants v ON v.product_id=p.id WHERE p.id=? AND v.id=? AND p.status='published' AND v.active=1 LIMIT 1").bind(row.productId,row.variantId).first<Record<string,unknown>>();
  if(!p)throw new Error("Uno de los productos ya no está disponible.");
  const available=Number(p.stock_on_hand)-Number(p.stock_reserved);if(available<Number(row.quantity))throw new Error("Stock insuficiente para "+String(p.name)+" ("+String(p.size)+", "+String(p.color)+").");
  let image:string|null=null;try{const parsed:unknown=JSON.parse(String(p.images_json||"[]"));if(Array.isArray(parsed)&&typeof parsed[0]==="string")image=parsed[0]}catch{}
  const price=Number(p.sale_price_cents??p.price_cents);
  output.push({product_id:String(p.product_id),variant_id:String(p.variant_id),name:String(p.name),slug:String(p.slug),sku:String(p.sku),variant_sku:String(p.variant_sku),size:String(p.size),color:String(p.color),unit_price_cents:price,quantity:Number(row.quantity),stock_on_hand:Number(p.stock_on_hand),stock_reserved:Number(p.stock_reserved),image_url:image});
 }
 return output;
}
export async function createOrder(options:{customerName:string;email:string;phone:string;address:string;city:string;reference:string;method:"whatsapp"|"mercadopago";lines:PricedLine[];shippingCents:number;shippingPending:boolean}){
 const db=await getDb();const id=crypto.randomUUID();const accessCode=crypto.randomUUID().replace(/-/g,"").slice(0,16).toUpperCase();const accessHash=await sha256(accessCode);const orderNumber=generateOrderNumber();const subtotal=options.lines.reduce((s,l)=>s+l.unit_price_cents*l.quantity,0);const total=subtotal+options.shippingCents;
 const status=options.method==="whatsapp"?"pending_confirmation":"pending_payment";
 const statements=[db.prepare("INSERT INTO orders(id,order_number,access_code_hash,customer_name,customer_email,customer_phone,shipping_address,shipping_city,customer_reference,channel,status,payment_status,currency,subtotal_cents,shipping_cents,total_cents) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,orderNumber,accessHash,options.customerName,options.email,options.phone,options.address,options.city,options.reference,options.method,status,"pending","PEN",subtotal,options.shippingCents,total)];
 for(const line of options.lines)statements.push(db.prepare("INSERT INTO order_items(id,order_id,product_id,variant_id,product_name,variant_label,quantity,unit_price_cents,line_total_cents) VALUES(?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,line.product_id,line.variant_id,line.name,line.size+" · "+line.color,line.quantity,line.unit_price_cents,line.unit_price_cents*line.quantity));
 if(options.method==="mercadopago")for(const line of options.lines)statements.push(db.prepare("UPDATE product_variants SET stock_reserved=stock_reserved+? WHERE id=?").bind(line.quantity,line.variant_id));
 await db.batch(statements);
 return {id,orderNumber,accessCode,subtotalCents:subtotal,shippingCents:options.shippingCents,totalCents:total};
}
export async function releaseOrderReservation(orderId:string){const db=await getDb();await db.prepare("UPDATE product_variants SET stock_reserved=MAX(0,stock_reserved-(SELECT COALESCE(SUM(quantity),0) FROM order_items WHERE order_id=? AND variant_id=product_variants.id)) WHERE id IN (SELECT variant_id FROM order_items WHERE order_id=?)").bind(orderId,orderId).run();}
export function buildWhatsAppOrderMessage(order:{orderNumber:string;accessCode:string;totalCents:number},customerName:string,lines:PricedLine[],baseUrl:string){
 const productLines=lines.map(l=>"• "+l.name+" — talla "+l.size+", color "+l.color+", x"+l.quantity+" — "+formatPEN(l.unit_price_cents*l.quantity/100)+"\n  "+baseUrl.replace(/\/$/,"")+"/producto/"+l.slug).join("\n");
 const subtotal=lines.reduce((s,l)=>s+l.unit_price_cents*l.quantity,0);
 return "Hola, "+STORE.name+". Quiero solicitar este pedido (pendiente de confirmación):\n\nPedido: "+order.orderNumber+"\nCliente: "+customerName+"\nCódigo de consulta: "+order.accessCode+"\n\n"+productLines+"\n\nSubtotal: "+formatPEN(subtotal/100)+"\nEnvío: por confirmar\nTotal provisional: "+formatPEN(order.totalCents/100)+"\n\nPor favor, confirmen disponibilidad, envío y total final. Aún no es una compra pagada.";
}
export function getWhatsAppUrl(message:string){return whatsappUrl(message);}
