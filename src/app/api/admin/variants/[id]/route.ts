import {getDb} from "@/lib/db";
import {isAdminAuthorized,sameOrigin} from "@/lib/security";
export const dynamic="force-dynamic";
type Body={size?:unknown;color?:unknown;sku?:unknown;stock?:unknown;active?:unknown};
const valid=(v:unknown,min:number,max:number):v is string=>typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max;
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 const {id}=await params;let b:Body;try{b=await request.json() as Body}catch{return Response.json({error:"JSON inválido."},{status:400})}
 if(!valid(b.size,1,60)||!valid(b.color,1,60)||!valid(b.sku,2,80))return Response.json({error:"Talla, color o SKU inválidos."},{status:400});
 const stock=Number(b.stock);if(!Number.isSafeInteger(stock)||stock<0||stock>100000)return Response.json({error:"El stock debe ser un entero entre 0 y 100000."},{status:400});
 if(typeof b.active!=="boolean")return Response.json({error:"Estado de variante inválido."},{status:400});
 try{const db=await getDb();const old=await db.prepare("SELECT id,stock_reserved FROM product_variants WHERE id=?").bind(id).first<{id:string;stock_reserved:number}>();if(!old)return Response.json({error:"Variante no encontrada."},{status:404});if(stock<Number(old.stock_reserved))return Response.json({error:"El stock no puede ser inferior a las unidades reservadas por pedidos."},{status:409});await db.prepare("UPDATE product_variants SET size=?,color=?,sku=?,stock_on_hand=?,active=? WHERE id=?").bind(b.size.trim(),b.color.trim(),b.sku.trim(),stock,b.active?1:0,id).run();return Response.json({updated:true},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"No se pudo actualizar. Revisa el SKU y la combinación de talla/color."},{status:409})}
}
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 const {id}=await params;try{const db=await getDb();const linked=await db.prepare("SELECT id FROM order_items WHERE variant_id=? LIMIT 1").bind(id).first<{id:string}>();if(linked)return Response.json({error:"Esta variante ya tiene pedidos asociados. Desactívala en lugar de eliminarla."},{status:409});const res=await db.prepare("DELETE FROM product_variants WHERE id=?").bind(id).run();if(!res.meta?.changes)return Response.json({error:"Variante no encontrada."},{status:404});return Response.json({deleted:true})}catch{return Response.json({error:"No se pudo eliminar la variante."},{status:409})}
}
