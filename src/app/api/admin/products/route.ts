import { getDb } from "@/lib/db";
import { isAdminAuthorized, sameOrigin } from "@/lib/security";
import { slugify } from "@/lib/format";
export const dynamic="force-dynamic";

type ProductInput={name?:unknown;description?:unknown;sku?:unknown;priceCents?:unknown;salePriceCents?:unknown;status?:unknown;categoryId?:unknown;images?:unknown};
function validString(value:unknown,min:number,max:number):value is string{return typeof value==="string"&&value.trim().length>=min&&value.trim().length<=max}
function validImages(value:unknown):string[]|null{
  if(value===undefined)return [];
  if(!Array.isArray(value)||value.length>12||!value.every(v=>typeof v==="string"))return null;
  const urls=value as string[];
  if(urls.some(v=>{try{const u=new URL(v);return u.protocol!=="https:"}catch{return true}}))return null;
  return urls;
}
export async function GET(request:Request){
  if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
  try{
    const db=await getDb();
    const rows=await db.prepare("SELECT id,name,slug,description,category_id,price_cents,sale_price_cents,sku,status,images_json,created_at,updated_at FROM products ORDER BY created_at DESC LIMIT 200").all<Record<string,unknown>>();
    return Response.json({products:rows.results},{headers:{"Cache-Control":"no-store"}});
  }catch{return Response.json({error:"No se pudo consultar el catálogo."},{status:503})}
}
export async function POST(request:Request){
  if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
  if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
  let text:string;try{text=await request.text()}catch{return Response.json({error:"Solicitud inválida."},{status:400})}
  if(new TextEncoder().encode(text).length>24000)return Response.json({error:"Solicitud demasiado grande."},{status:413});
  let body:ProductInput;try{body=JSON.parse(text) as ProductInput}catch{return Response.json({error:"JSON inválido."},{status:400})}
  if(!validString(body.name,2,140)||!validString(body.description??"",0,5000)||!validString(body.sku,2,64))return Response.json({error:"Revisa nombre, descripción y SKU."},{status:400});
  const name=body.name.trim();const description=String(body.description??"").trim();const sku=body.sku.trim();
  if(!Number.isSafeInteger(body.priceCents)||Number(body.priceCents)<0)return Response.json({error:"El precio debe ser un entero no negativo en céntimos."},{status:400});
  const price=Number(body.priceCents);
  const sale=body.salePriceCents===null||body.salePriceCents===undefined||body.salePriceCents===""?null:Number(body.salePriceCents);
  if(sale!==null&&(!Number.isSafeInteger(sale)||sale<0||sale>=price))return Response.json({error:"El precio promocional debe ser menor que el precio normal."},{status:400});
  const status=body.status===undefined?"draft":body.status;
  if(status!=="draft"&&status!=="published")return Response.json({error:"Estado de publicación inválido."},{status:400});
  if(status==="published")return Response.json({error:"Crea primero el producto como borrador, añade una imagen y una variante activa con stock, y publícalo editándolo después."},{status:400});
  const images=validImages(body.images);
  if(!images)return Response.json({error:"Las imágenes deben ser URL HTTPS válidas (máximo 12)."},{status:400});
  if(status==="published"&&images.length===0)return Response.json({error:"Añade al menos una imagen HTTPS antes de publicar."},{status:400});
  const categoryId=body.categoryId===null||body.categoryId===undefined||body.categoryId===""?null:body.categoryId;
  if(categoryId!==null&&!validString(categoryId,1,128))return Response.json({error:"Categoría inválida."},{status:400});
  const id=crypto.randomUUID();const slug=slugify(name)+"-"+id.slice(0,6);
  try{
    const db=await getDb();
    if(categoryId!==null){const c=await db.prepare("SELECT id FROM categories WHERE id=?").bind(categoryId).first<{id:string}>();if(!c)return Response.json({error:"La categoría no existe."},{status:400});}
    await db.prepare("INSERT INTO products (id,name,slug,description,category_id,price_cents,sale_price_cents,sku,images_json,status) VALUES (?,?,?,?,?,?,?,?,?,?)")
      .bind(id,name,slug,description,categoryId as string|null,price,sale,sku,JSON.stringify(images),status).run();
    return Response.json({product:{id,name,slug,status,price_cents:price,sale_price_cents:sale}},{status:201,headers:{"Cache-Control":"no-store"}});
  }catch{return Response.json({error:"No se pudo guardar el producto. Comprueba que el SKU no esté duplicado."},{status:409})}
}
