import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Result<T = Record<string, unknown>> = { results:T[]; success:boolean; meta?:{changes?:number;last_row_id?:number;duration?:number} };
export type D1Statement = {
  bind(...values:(string|number|null)[]):D1Statement;
  all<T=Record<string,unknown>>():Promise<D1Result<T>>;
  first<T=Record<string,unknown>>():Promise<T|null>;
  run<T=Record<string,unknown>>():Promise<D1Result<T>>;
};
export type D1Database = { prepare(sql:string):D1Statement; batch<T=Record<string,unknown>>(statements:D1Statement[]):Promise<D1Result<T>[]> };
export type R2Bucket = { put(key:string,value:ArrayBuffer|ArrayBufferView|ReadableStream,options?:{httpMetadata?:{contentType?:string;cacheControl?:string}}):Promise<unknown> };
export type AppEnv = { DB?:D1Database; PRODUCT_IMAGES?:R2Bucket; [key:string]:unknown };

export async function getEnv():Promise<AppEnv>{
  const context=await getCloudflareContext({async:true}) as unknown as {env?:AppEnv};
  if(!context.env)throw new Error("No se encontró el entorno de Cloudflare.");
  return context.env;
}
export async function getDb():Promise<D1Database>{
  const env=await getEnv();
  if(!env.DB)throw new Error("Falta el binding D1 DB. Configúralo en wrangler.jsonc y aplica las migraciones.");
  return env.DB;
}
export async function getRuntimeValue(key:string):Promise<string|undefined>{
  try{const context=await getCloudflareContext({async:true}) as unknown as {env?:Record<string,unknown>};const value=context.env?.[key];if(typeof value==="string")return value;}catch{}
  return typeof process!=="undefined"?process.env[key]:undefined;
}
