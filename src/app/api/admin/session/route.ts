import {getDb,getRuntimeValue} from "@/lib/db";
import {adminCookie,clearAdminCookie,createAdminSession,hashLoginIp,isAdminAuthorized,sameOrigin,verifyAdminPassword} from "@/lib/security";
export const dynamic="force-dynamic";
export async function GET(request:Request){return Response.json({authenticated:await isAdminAuthorized(request)},{headers:{"Cache-Control":"no-store"}})}
export async function POST(request:Request){
 if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
 let text:string;try{text=await request.text()}catch{return Response.json({error:"Solicitud inválida."},{status:400})}
 if(new TextEncoder().encode(text).length>8192)return Response.json({error:"Solicitud demasiado grande."},{status:413});
 let body:unknown;try{body=JSON.parse(text)}catch{return Response.json({error:"JSON inválido."},{status:400})}
 const password=body&&typeof body==="object"&&"password" in body?(body as {password?:unknown}).password:null;
 if(typeof password!=="string"||password.length<1||password.length>512)return Response.json({error:"Credenciales inválidas."},{status:400});
 try{
  const passwordHash=await getRuntimeValue("ADMIN_PASSWORD_HASH");const secret=await getRuntimeValue("ADMIN_SESSION_SECRET");
  if(!passwordHash||!secret||secret.length<32)return Response.json({error:"El administrador aún no está configurado."},{status:503});
  const ip=request.headers.get("cf-connecting-ip")||"local";const ipHash=await hashLoginIp(ip);const db=await getDb();
  const count=await db.prepare("SELECT COUNT(*) AS attempts FROM admin_login_attempts WHERE ip_hash=? AND attempted_at > datetime('now','-15 minutes')").bind(ipHash).first<{attempts:number}>();
  if(Number(count?.attempts||0)>=8)return Response.json({error:"Demasiados intentos. Prueba de nuevo en 15 minutos."},{status:429});
  await db.prepare("INSERT INTO admin_login_attempts(id,ip_hash) VALUES(?,?)").bind(crypto.randomUUID(),ipHash).run();
  if(!(await verifyAdminPassword(password,passwordHash)))return Response.json({error:"Credenciales inválidas."},{status:401});
  await db.prepare("DELETE FROM admin_login_attempts WHERE ip_hash=?").bind(ipHash).run();
  const token=await createAdminSession();const secure=new URL(request.url).protocol==="https:";
  return Response.json({authenticated:true},{headers:{"Set-Cookie":adminCookie(token,secure),"Cache-Control":"no-store"}});
 }catch{return Response.json({error:"No se pudo validar la sesión. Revisa la configuración del servidor."},{status:503})}
}
export async function DELETE(request:Request){if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});const secure=new URL(request.url).protocol==="https:";return Response.json({authenticated:false},{headers:{"Set-Cookie":clearAdminCookie(secure),"Cache-Control":"no-store"}})}
