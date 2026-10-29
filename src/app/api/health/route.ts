import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({
      status: "degraded",
      service: "elara-storefront",
      database: "not_configured",
      publicCatalog: "supabase_rest",
    }, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const db = await getDb();
    const result = await db.prepare("SELECT 1 AS ok").first<{ ok: number }>();
    if (Number(result?.ok) !== 1) throw new Error("Database ping did not return the expected value.");
    return Response.json({
      status: "ok",
      service: "elara-storefront",
      database: "connected",
      publicCatalog: "supabase_rest",
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({
      status: "degraded",
      service: "elara-storefront",
      database: "unavailable",
      publicCatalog: "supabase_rest",
    }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
