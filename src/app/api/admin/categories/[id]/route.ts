import {getDb} from "@/lib/db";
import {isAdminAuthorized,sameOrigin} from "@/lib/security";
import {slugify} from "@/lib/format";
export const dynamic="force-dynamic";
type Body={name?:unknown;description?:unknown;sortOrder?:unknown};
function validText(v:unknown,min:number,max:number):v is string{return typeof v==="string"&&v.trim().length>=min&&v.trim().length<=max}
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 const {id}=await params;let b:Body;try{b=await request.json() as Body}catch{return Response.json({error:"JSON inválido."},{status:400})}
 if(!validText(b.name,2,100)||!validText(b.description??"",0,1200))return Response.json({error:"Revisa el nombre y la descripción."},{status:400});
 const sort=Number(b.sortOrder??0);if(!Number.isSafeInteger(sort)||sort<0||sort>10000)return Response.json({error:"Orden inválido."},{status:400});
 try{const db=await getDb();const old=await db.prepare("SELECT id FROM categories WHERE id=?").bind(id).first<{id:string}>();if(!old)return Response.json({error:"Categoría no encontrada."},{status:404});await db.prepare("UPDATE categories SET name=?,slug=?,description=?,sort_order=? WHERE id=?").bind(b.name.trim(),slugify(b.name)+"-"+id.slice(0,6),(b.description??"").trim(),sort,id).run();return Response.json({updated:true})}catch{return Response.json({error:"No se pudo actualizar la categoría."},{status:409})}
}
export async function DELETE(request:Request,{params}:{params:Promise<{id:string}>}){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 if(!(await isAdminAuthorized(request)))return Response.json({error:"No autorizado."},{status:401});
 const {id}=await params;try{const db=await getDb();const old=await db.prepare("SELECT id FROM categories WHERE id=?").bind(id).first<{id:string}>();if(!old)return Response.json({error:"Categoría no encontrada."},{status:404});await db.prepare("DELETE FROM categories WHERE id=?").bind(id).run();return Response.json({deleted:true})}catch{return Response.json({error:"No se pudo eliminar la categoría."},{status:409})}
}
