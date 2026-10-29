export function jsonError(message:string,status=400):Response{return Response.json({error:message},{status,headers:{"Cache-Control":"no-store"}})}
export function jsonOk<T extends Record<string,unknown>>(data:T,status=200):Response{return Response.json(data,{status,headers:{"Cache-Control":"no-store"}})}
export async function readJsonObject(request:Request,maxBytes=20000):Promise<Record<string,unknown>|null>{
 try{const text=await request.text();if(new TextEncoder().encode(text).length>maxBytes)return null;const value:unknown=JSON.parse(text);return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null}catch{return null}
}
export function isEmail(value:string):boolean{return value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
export function validPhone(value:string):boolean{return value.length>=8&&value.length<=24&&/^\+?[0-9 ()-]+$/.test(value)}
