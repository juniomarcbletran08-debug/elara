import {getEnv,getRuntimeValue} from "@/lib/db";
import {isAdminAuthorized,sameOrigin,requestIdentity,consumeRateLimit} from "@/lib/security";
import {jsonError,jsonOk} from "@/lib/http";
export const dynamic="force-dynamic";
const MAX_BYTES=8*1024*1024;
function detectImage(bytes:Uint8Array):{mime:string;extension:string}|null{
 if(bytes.length>=3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return{mime:"image/jpeg",extension:"jpg"};
 if(bytes.length>=8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return{mime:"image/png",extension:"png"};
 if(bytes.length>=12&&String.fromCharCode(...bytes.slice(0,4))==="RIFF"&&String.fromCharCode(...bytes.slice(8,12))==="WEBP")return{mime:"image/webp",extension:"webp"};
 if(bytes.length>=12&&String.fromCharCode(...bytes.slice(4,8))==="ftyp"&&["avif","avis"].includes(String.fromCharCode(...bytes.slice(8,12))))return{mime:"image/avif",extension:"avif"};
 return null;
}
export async function POST(request:Request){
 if(!sameOrigin(request))return jsonError("Origen no permitido.",403);
 if(!(await isAdminAuthorized(request)))return jsonError("No autorizado.",401);
 if(!await consumeRateLimit("image-upload",requestIdentity(request),30,3600))return jsonError("Se alcanzó el límite temporal de cargas.",429);
 const length=Number(request.headers.get("content-length")||0);if(length>MAX_BYTES+20000)return jsonError("La imagen supera el límite de 8 MB.",413);
 let data:FormData;try{data=await request.formData()}catch{return jsonError("Formulario de carga inválido.",400)}
 const entry=data.get("file");
 if(!(entry instanceof File))return jsonError("Selecciona un archivo de imagen.",400);
 if(entry.size<1||entry.size>MAX_BYTES)return jsonError("La imagen debe pesar entre 1 byte y 8 MB.",413);
 const buffer=await entry.arrayBuffer();const detected=detectImage(new Uint8Array(buffer));
 if(!detected||entry.type!==detected.mime)return jsonError("Formato de imagen no admitido o contenido que no coincide con su tipo. Usa JPEG, PNG, WEBP o AVIF.",415);
 const mediaBase=await getRuntimeValue("PUBLIC_MEDIA_URL");
 if(!mediaBase)return jsonError("Configura PUBLIC_MEDIA_URL después de enlazar el bucket público de imágenes.",503);
 let base:URL;try{base=new URL(mediaBase)}catch{return jsonError("PUBLIC_MEDIA_URL debe ser una URL HTTPS válida.",503)}
 if(base.protocol!=="https:"||base.username||base.password||base.search||base.hash)return jsonError("PUBLIC_MEDIA_URL debe ser HTTPS y no incluir credenciales ni parámetros.",503);
 try{
  const env=await getEnv();if(!env.PRODUCT_IMAGES)return jsonError("Falta el binding R2 PRODUCT_IMAGES.",503);
  const key="products/"+new Date().toISOString().slice(0,7)+"/"+crypto.randomUUID()+"."+detected.extension;
  await env.PRODUCT_IMAGES.put(key,buffer,{httpMetadata:{contentType:detected.mime,cacheControl:"public, max-age=31536000, immutable"}});
  return jsonOk({url:base.toString().replace(/\/$/,"")+"/"+key,key,contentType:detected.mime,size:entry.size},201);
 }catch{return jsonError("No se pudo subir la imagen al almacenamiento. Revisa el binding R2.",503)}
}
