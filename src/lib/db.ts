import { getCloudflareContext } from "@opennextjs/cloudflare";

export type D1Result<T = Record<string, unknown>> = {
  results: T[];
  success: boolean;
  meta?: { changes?: number; last_row_id?: number; duration?: number };
};
export type D1Statement = {
  bind(...values: (string | number | null)[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
};
export type D1Database = {
  prepare(sql: string): D1Statement;
  batch<T = Record<string, unknown>>(statements: D1Statement[]): Promise<D1Result<T>[]>;
};
type AppEnv = { DB?: D1Database };

export async function getDb(): Promise<D1Database> {
  const context = await getCloudflareContext({ async: true }) as unknown as { env?: AppEnv };
  if (!context.env?.DB) {
    throw new Error("Falta el binding D1 DB. Configúralo en wrangler.jsonc y aplica las migraciones.");
  }
  return context.env.DB;
}
