import { getDb } from "@/lib/db";
import { adminCookie, clearAdminCookie, createAdminSession, hashLoginIp, isAdminAuthorized, sameOrigin, verifyAdminPassword } from "@/lib/security";

export const dynamic="force-dynamic";
const secure=process.env.NODE_ENV==="production";

export async function GET(request:Request){
  return Response.json({authenticated:await isAdminAuthorized(request)},{headers:{"Cache-Control":"no-store"}});
}

export async function POST(request:Request){
  if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
  if(Number(request.headers.get("content-length")||0)>8192)return Response.json({error:"Solicitud demasiado grande."},{status:413});
  let body:unknown;
  try{body=await request.json()}catch{return Response.json({error:"JSON inválido."},{status:400})}
  const password=body&&typeof body==="object"&&"password" in body?(body as {password?:unknown}).password:null;
  if(typeof password!=="string"||password.length<1||password.length>512)return Response.json({error:"Credenciales inválidas."},{status:400});
  try{
    if(!process.env.ADMIN_PASSWORD_HASH||!process.env.ADMIN_SESSION_SECRET||process.env.ADMIN_SESSION_SECRET.length<32)
      return Response.json({error:"El administrador aún no está configurado."},{status:503});
    const ip=request.headers.get("cf-connecting-ip")||"local";
    const ipHash=await hashLoginIp(ip);
    const db=await getDb();
    const count=await db.prepare("SELECT COUNT(*) AS attempts FROM admin_login_attempts WHERE ip_hash=? AND attempted_at > datetime('now','-15 minutes')").bind(ipHash).first<{attempts:number}>();
    if(Number(count?.attempts||0)>=8)return Response.json({error:"Demasiados intentos. Prueba de nuevo en 15 minutos."},{status:429});
    await db.prepare("INSERT INTO admin_login_attempts (id,ip_hash) VALUES (?,?)").bind(crypto.randomUUID(),ipHash).run();
    if(!(await verifyAdminPassword(password)))return Response.json({error:"Credenciales inválidas."},{status:401});
    await db.prepare("DELETE FROM admin_login_attempts WHERE ip_hash=?").bind(ipHash).run();
    const token=await createAdminSession();
    return Response.json({authenticated:true},{headers:{"Set-Cookie":adminCookie(token,secure),"Cache-Control":"no-store"}});
  }catch{return Response.json({error:"No se pudo validar la sesión. Revisa la configuración del servidor."},{status:503})}
}

export async function DELETE(request:Request){
  if(!sameOrigin(request))return Response.json({error:"Origen no permitido."},{status:403});
  return Response.json({authenticated:false},{headers:{"Set-Cookie":clearAdminCookie(secure),"Cache-Control":"no-store"}});
}
