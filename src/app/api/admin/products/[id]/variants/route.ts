import {getDb} from "@/lib/db";
import {isAdminAuthorized,sameOrigin} from "@/lib/security";
export const dynamic="force-dynamic";
type VariantInput={size?:unknown;color?:unknown;sku?:unknown;stock?:unknown;active?:unknown};
const str=(v:unknown,min:number,max:number):v is string=>typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max;
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 const {id}=await params;try{const db=await getDb();const product=await db.prepare("SELECT id FROM products WHERE id=?").bind(id).first<{id:string}>();if(!product)return Response.json({error:"Producto no encontrado."},{status:404});const rows=await db.prepare("SELECT id,product_id,size,color,sku,stock_on_hand,stock_reserved,active FROM product_variants WHERE product_id=? ORDER BY size,color").bind(id).all<Record<string,unknown>>();return Response.json({variants:rows.results},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"No se pudieron consultar las variantes."},{status:503})}
}
export async function POST(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 const {id:productId}=await params;let text:string;try{text=await request.text()}catch{return Response.json({error:"Solicitud inválida."},{status:400})}
 if(new TextEncoder().encode(text).length>10000)return Response.json({error:"Solicitud demasiado grande."},{status:413});
 let b:VariantInput;try{b=JSON.parse(text) as VariantInput}catch{return Response.json({error:"JSON inválido."},{status:400})}
 if(!str(b.size,1,60)||!str(b.color,1,60)||!str(b.sku,2,80))return Response.json({error:"Indica talla, color y un SKU válido."},{status:400});
 const stock=Number(b.stock);if(!Number.isSafeInteger(stock)||stock<0||stock>100000)return Response.json({error:"El stock debe ser un entero entre 0 y 100000."},{status:400});
 const active=b.active===undefined?true:b.active;if(typeof active!=="boolean")return Response.json({error:"Estado de variante inválido."},{status:400});
 try{const db=await getDb();const product=await db.prepare("SELECT id FROM products WHERE id=?").bind(productId).first<{id:string}>();if(!product)return Response.json({error:"Producto no encontrado."},{status:404});const id=crypto.randomUUID();await db.prepare("INSERT INTO product_variants(id,product_id,size,color,sku,stock_on_hand,active) VALUES(?,?,?,?,?,?,?)").bind(id,productId,b.size.trim(),b.color.trim(),b.sku.trim(),stock,active?1:0).run();return Response.json({variant:{id,product_id:productId,size:b.size.trim(),color:b.color.trim(),sku:b.sku.trim(),stock_on_hand:stock,stock_reserved:0,active:active?1:0}},{status:201})}catch{return Response.json({error:"No se pudo guardar. Revisa que el SKU y la combinación de talla/color no estén duplicados."},{status:409})}
}
