const SESSION_COOKIE = "elara_admin";
const SESSION_SECONDS = 8 * 60 * 60;
const encoder = new TextEncoder();

function hexToBytes(hex: string): Uint8Array {
  if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) throw new Error("Invalid hex");
  const out = new Uint8Array(hex.length / 2);
  for (let i=0;i<out.length;i++) out[i]=parseInt(hex.slice(i*2,i*2+2),16);
  return out;
}
function toBase64Url(bytes: Uint8Array): string {
  let binary="";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
}
function fromBase64Url(value: string): Uint8Array {
  const normalized=value.replace(/-/g,"+").replace(/_/g,"/");
  const binary=atob(normalized+"=".repeat((4-normalized.length%4)%4));
  return Uint8Array.from(binary, ch=>ch.charCodeAt(0));
}
function constantTimeEqual(a:Uint8Array,b:Uint8Array):boolean {
  if(a.length!==b.length)return false;
  let diff=0;
  for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  return diff===0;
}
async function sign(value:string):Promise<Uint8Array>{
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!secret||secret.length<32)throw new Error("ADMIN_SESSION_SECRET must have at least 32 characters");
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value)));
}

export async function verifyAdminPassword(password:string,encoded=process.env.ADMIN_PASSWORD_HASH||""):Promise<boolean>{
  try{
    const parts=encoded.split("$");
    if(parts.length!==4||parts[0]!=="pbkdf2")return false;
    const iterations=Number(parts[1]);
    if(!Number.isInteger(iterations)||iterations<100000||iterations>600000)return false;
    const salt=hexToBytes(parts[2]);
    const expected=hexToBytes(parts[3]);
    if(salt.length<16||expected.length!==32)return false;
    const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
    const actual=new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt,iterations,hash:"SHA-256"},key,256));
    return constantTimeEqual(actual,expected);
  }catch{return false;}
}

export async function createAdminSession():Promise<string>{
  const exp=Math.floor(Date.now()/1000)+SESSION_SECONDS;
  const payload=String(exp)+":"+toBase64Url(crypto.getRandomValues(new Uint8Array(18)));
  return toBase64Url(encoder.encode(payload))+"."+toBase64Url(await sign(payload));
}
export async function isAdminAuthorized(request:Request):Promise<boolean>{
  try{
    const cookie=request.headers.get("cookie")||"";
    const pair=cookie.split(";").map(v=>v.trim()).find(v=>v.startsWith(SESSION_COOKIE+"="));
    if(!pair)return false;
    const token=pair.slice(SESSION_COOKIE.length+1);
    const parts=token.split(".");
    if(parts.length!==2)return false;
    const payloadBytes=fromBase64Url(parts[0]);
    const payload=new TextDecoder().decode(payloadBytes);
    const exp=Number(payload.split(":")[0]);
    if(!Number.isSafeInteger(exp)||exp<=Math.floor(Date.now()/1000))return false;
    return constantTimeEqual(await sign(payload),fromBase64Url(parts[1]));
  }catch{return false;}
}
export function adminCookie(token:string,secure:boolean):string{
  return SESSION_COOKIE+"="+token+"; Path=/; HttpOnly; SameSite=Strict; Max-Age="+SESSION_SECONDS+(secure?"; Secure":"");
}
export function clearAdminCookie(secure:boolean):string{
  return SESSION_COOKIE+"=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"+(secure?"; Secure":"");
}
export function sameOrigin(request:Request):boolean{
  const origin=request.headers.get("origin");
  return !!origin&&origin===new URL(request.url).origin;
}
export async function hashLoginIp(ip:string):Promise<string>{
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!secret||secret.length<32)throw new Error("Admin session secret is not configured");
  const digest=await crypto.subtle.digest("SHA-256",encoder.encode(secret+":admin-login:"+ip));
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,"0")).join("");
}
