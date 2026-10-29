import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const db = await getDb();
    const query = category
      ? db.prepare("SELECT p.id,p.name,p.slug,p.description,p.price_cents,p.sale_price_cents,p.images_json,p.sku,c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.status='published' AND c.slug=? ORDER BY p.created_at DESC LIMIT 100").bind(category)
      : db.prepare("SELECT p.id,p.name,p.slug,p.description,p.price_cents,p.sale_price_cents,p.images_json,p.sku,c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.status='published' ORDER BY p.created_at DESC LIMIT 100");
    const result = await query.all<Record<string, unknown>>();
    const products = result.results.map((p) => ({
      id: p.id, name: p.name, slug: p.slug, description: p.description, sku: p.sku,
      category_name: p.category_name,
      price: Number(p.sale_price_cents ?? p.price_cents),
      images: parseImages(p.images_json),
    }));
    return Response.json({ products }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" } });
  } catch {
    return Response.json({ error: "El catálogo no está disponible. Revisa la configuración de D1." }, { status: 503 });
  }
}

function parseImages(value: unknown): string[] {
  try {
    const parsed: unknown = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, 12) : [];
  } catch { return []; }
}
