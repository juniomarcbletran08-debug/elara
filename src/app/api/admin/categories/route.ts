import {getDb} from "@/lib/db";
import {isAdminAuthorized,sameOrigin} from "@/lib/security";
import {slugify} from "@/lib/format";
export const dynamic="force-dynamic";
type Body={name?:unknown;description?:unknown;sortOrder?:unknown};
function validText(v:unknown,min:number,max:number):v is string{return typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max}
export async function GET(request:Request){
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 try{const db=await getDb();const rows=await db.prepare("SELECT id,name,slug,description,sort_order,created_at FROM categories ORDER BY sort_order,name LIMIT 200").all<Record<string,unknown>>();return Response.json({categories:rows.results},{headers:{"Cache-Control":"no-store"}})}catch{return Response.json({error:"No se pudieron consultar las categorías."},{status:503})}
}
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 let b:Body;try{b=await request.json() as Body}catch{return Response.json({error:"JSON inválido."},{status:400})}
 if(!validText(b.name,2,100)||!validText(b.description??"",0,1200))return Response.json({error:"Revisa el nombre y la descripción."},{status:400});
 const name=b.name.trim();const description=String(b.description??"").trim();
 const sort=Number(b.sortOrder??0);if(!Number.isSafeInteger(sort)||sort<0||sort>10000)return Response.json({error:"Orden inválido."},{status:400});
 const id=crypto.randomUUID();const slug=slugify(name)+"-"+id.slice(0,6);
 try{const db=await getDb();await db.prepare("INSERT INTO categories(id,name,slug,description,sort_order) VALUES(?,?,?,?,?)").bind(id,name,slug,description,sort).run();return Response.json({category:{id,name,slug}},{status:201})}catch{return Response.json({error:"No se pudo guardar; revisa los datos."},{status:409})}
}
