import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import postgres from "postgres";

type SqlValue = string | number | boolean | null | undefined;
type PgRows<T> = T[] & { count?: number; command?: string };
type SqlExecutor = {
  unsafe<T extends readonly unknown[] = Record<string, unknown>[]>(query: string, parameters?: readonly SqlValue[]): Promise<T>;
};

export type D1Result<T = Record<string, unknown>> = {
  results: T[];
  success: boolean;
  meta?: { changes?: number; last_row_id?: number; duration?: number };
};

export type D1Statement = {
  bind(...values: (string | number | boolean | null)[]): D1Statement;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
};

export type D1Database = {
  prepare(sql: string): D1Statement;
  batch<T = Record<string, unknown>>(statements: D1Statement[]): Promise<D1Result<T>[]>;
};

export type R2Bucket = {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | ReadableStream,
    options?: { httpMetadata?: { contentType?: string; cacheControl?: string } },
  ): Promise<unknown>;
};

export type AppEnv = {
  DB?: D1Database;
  PRODUCT_IMAGES?: R2Bucket;
  [key: string]: unknown;
};

let sqlClient: ReturnType<typeof postgres> | undefined;
let supabaseStorage: SupabaseClient | undefined;

function getSqlClient(): ReturnType<typeof postgres> {
  if (sqlClient) return sqlClient;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "Falta DATABASE_URL. Usa la cadena de conexión del pooler compartido de Supabase (modo transacción, puerto 6543) en las variables de entorno de Vercel.",
    );
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL no es una URL PostgreSQL válida.");
  }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error("DATABASE_URL debe usar el protocolo postgresql://.");
  }

  // Vercel Functions are serverless/IPv4-oriented; use Supabase's shared pooler.
  // Transaction mode requires prepared statements to be disabled.
  sqlClient = postgres(url, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    ssl: "require",
    onnotice: () => undefined,
  });
  return sqlClient;
}

function normalizeSql(source: string): string {
  let parameter = 0;
  return source
    .replace(/\?/g, () => "$" + String(++parameter))
    .replace(/\bMAX\s*\(\s*0\s*,/gi, "GREATEST(0,");
}

class PostgresStatement implements D1Statement {
  private values: SqlValue[] = [];

  constructor(private readonly source: string) {}

  bind(...values: (string | number | boolean | null)[]): D1Statement {
    this.values = values;
    return this;
  }

  private query(): { sql: string; values: SqlValue[] } {
    return { sql: normalizeSql(this.source), values: this.values };
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return execute<T>(getSqlClient() as unknown as SqlExecutor, this.query());
  }

  async first<T = Record<string, unknown>>(): Promise<T | null> {
    const result = await this.all<T>();
    return result.results[0] ?? null;
  }

  async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return execute<T>(getSqlClient() as unknown as SqlExecutor, this.query());
  }
}

class PostgresDatabase implements D1Database {
  prepare(sql: string): D1Statement {
    return new PostgresStatement(sql);
  }

  async batch<T = Record<string, unknown>>(statements: D1Statement[]): Promise<D1Result<T>[]> {
    if (!statements.length) return [];
    const client = getSqlClient();
    return client.begin(async (transaction) => {
      const executor = transaction as unknown as SqlExecutor;
      const results: D1Result<T>[] = [];
      for (const statement of statements) {
        if (!(statement instanceof PostgresStatement)) {
          throw new Error("La transacción contiene una sentencia no compatible.");
        }
        results.push(await execute<T>(executor, statement["query"]()));
      }
      return results;
    });
  }
}

async function execute<T>(
  executor: SqlExecutor,
  query: { sql: string; values: SqlValue[] },
): Promise<D1Result<T>> {
  const rows = (await executor.unsafe(query.sql, query.values)) as unknown as PgRows<T>;
  return {
    results: Array.from(rows),
    success: true,
    meta: { changes: Number(rows.count ?? rows.length) },
  };
}

function getStorageClient(): SupabaseClient | null {
  if (supabaseStorage) return supabaseStorage;
  const url = process.env.SUPABASE_URL;
  // Supabase secret/service-role key is server-only. Never prefix it with NEXT_PUBLIC_.
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) return null;
  supabaseStorage = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return supabaseStorage;
}

function getProductImageBucket(): R2Bucket | undefined {
  const client = getStorageClient();
  if (!client) return undefined;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "elara-product-images";
  return {
    async put(key, value, options) {
      let body: ArrayBuffer | ArrayBufferView;
      if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        body = value as ArrayBuffer | ArrayBufferView;
      } else {
        body = await new Response(value as ReadableStream).arrayBuffer();
      }
      const { error } = await client.storage.from(bucketName).upload(key, body, {
        contentType: options?.httpMetadata?.contentType,
        cacheControl: options?.httpMetadata?.cacheControl,
        upsert: false,
      });
      if (error) throw new Error("Supabase Storage: " + error.message);
    },
  };
}

const database = new PostgresDatabase();

export async function getEnv(): Promise<AppEnv> {
  return {
    DB: database,
    PRODUCT_IMAGES: getProductImageBucket(),
  };
}

export async function getDb(): Promise<D1Database> {
  // Fail early instead of returning an object that fails later inside a query.
  getSqlClient();
  return database;
}

export async function getRuntimeValue(key: string): Promise<string | undefined> {
  return typeof process !== "undefined" ? process.env[key] : undefined;
}
