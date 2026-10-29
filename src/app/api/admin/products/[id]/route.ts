import { getDb } from "@/lib/db";
import { isAdminAuthorized, sameOrigin } from "@/lib/security";
import { slugify } from "@/lib/format";
export const dynamic="force-dynamic";
type Body={name?:unknown;description?:unknown;sku?:unknown;priceCents?:unknown;salePriceCents?:unknown;status?:unknown;categoryId?:unknown;images?:unknown};
function stringIn(v:unknown,min:number,max:number):v is string{return typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max}
function secureImageUrl(v:unknown):v is string{if(typeof v!=="string")return false;try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password}catch{return false}}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
  if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
  const {id}=await params;let text:string;try{text=await request.text()}catch{return Response.json({error:"Solicitud inválida."},{status:400})}
  if(new TextEncoder().encode(text).length>24000)return Response.json({error:"Solicitud demasiado grande."},{status:413});
  let b:Body;try{b=JSON.parse(text) as Body}catch{return Response.json({error:"JSON inválido."},{status:400})}
  if(!stringIn(b.name,2,140)||!stringIn(b.description??"",0,5000)||!stringIn(b.sku,2,64))return Response.json({error:"Revisa nombre, descripción y SKU."},{status:400});
  const name=b.name.trim();const description=String(b.description??"").trim();const sku=b.sku.trim();
  if(!Number.isSafeInteger(b.priceCents)||Number(b.priceCents)<0)return Response.json({error:"Precio inválido."},{status:400});
  const price=Number(b.priceCents);
  const sale=b.salePriceCents===null||b.salePriceCents===undefined||b.salePriceCents===""?null:Number(b.salePriceCents);
  if(sale!==null&&(!Number.isSafeInteger(sale)||sale<0||sale>=price))return Response.json({error:"El precio promocional debe ser menor al precio normal."},{status:400});
  if(b.status!=="draft"&&b.status!=="published"&&b.status!=="archived")return Response.json({error:"Estado inválido."},{status:400});
  const images=b.images===undefined?null:Array.isArray(b.images)&&b.images.length<=12&&b.images.every(secureImageUrl)?b.images as string[]:undefined;
  if(images===undefined)return Response.json({error:"Las imágenes deben ser URL HTTPS (máximo 12)."},{status:400});
  if(b.status==="published"&&images!==null&&images.length===0)return Response.json({error:"Un producto publicado debe conservar al menos una imagen."},{status:400});
  const categoryId=b.categoryId===null||b.categoryId===undefined||b.categoryId===""?null:b.categoryId;
  if(categoryId!==null&&!stringIn(categoryId,1,128))return Response.json({error:"Categoría inválida."},{status:400});
  try{
    const db=await getDb();const existing=await db.prepare("SELECT id,images_json FROM products WHERE id=?").bind(id).first<{id:string;images_json:string}>();
    if(!existing)return Response.json({error:"Producto no encontrado."},{status:404});
    const imagesJson=images===null?existing.images_json:JSON.stringify(images);
    let imageList:unknown;try{imageList=JSON.parse(imagesJson)}catch{imageList=[]}
    if(b.status==="published"){
      if(!Array.isArray(imageList)||imageList.length===0||!imageList.every(secureImageUrl))return Response.json({error:"Un producto publicado debe tener al menos una imagen HTTPS válida."},{status:400});
      const count=await db.prepare("SELECT COUNT(*) AS count FROM product_variants WHERE product_id=? AND active=1").bind(id).first<{count:number}>();
      if(Number(count?.count||0)<1)return Response.json({error:"Añade al menos una variante activa con su talla, color y stock antes de publicar."},{status:400});
    }
    if(categoryId!==null){const c=await db.prepare("SELECT id FROM categories WHERE id=?").bind(categoryId).first<{id:string}>();if(!c)return Response.json({error:"La categoría no existe."},{status:400});}
    await db.prepare("UPDATE products SET name=?,slug=?,description=?,category_id=?,price_cents=?,sale_price_cents=?,sku=?,images_json=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?")
      .bind(name,slugify(name)+"-"+id.slice(0,6),description,categoryId as string|null,price,sale,sku,imagesJson,b.status,id).run();
    return Response.json({updated:true},{headers:{"Cache-Control":"no-store"}});
  }catch{return Response.json({error:"No se pudo actualizar. Revisa SKU y categoría."},{status:409})}
}
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
  if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
  if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
  const {id}=await params;try{const db=await getDb();const product=await db.prepare("SELECT id FROM products WHERE id=?").bind(id).first<{id:string}>();if(!product)return Response.json({error:"Producto no encontrado."},{status:404});await db.prepare("DELETE FROM products WHERE id=?").bind(id).run();return Response.json({deleted:true},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"No se pudo eliminar el producto."},{status:409})}
}
