import { getDb } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const db = await getDb();
    const row = await db.prepare("SELECT p.id,p.name,p.slug,p.description,p.price_cents,p.sale_price_cents,p.images_json,p.sku,c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=? AND p.status='published' LIMIT 1")
      .bind(slug).first<Record<string, unknown>>();
    if (!row) return Response.json({ error: "Producto no encontrado." }, { status: 404 });
    let images: string[] = [];
    try {
      const parsed: unknown = JSON.parse(String(row.images_json ?? "[]"));
      if (Array.isArray(parsed)) images = parsed.filter((v): v is string => typeof v === "string").slice(0, 12);
    } catch { /* invalid product image JSON is treated as an empty gallery */ }
    return Response.json({
      product: {
        id: row.id, name: row.name, slug: row.slug, description: row.description,
        sku: row.sku, category_name: row.category_name,
        price: Number(row.sale_price_cents ?? row.price_cents), images,
      }
    }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } });
  } catch {
    return Response.json({ error: "El producto no está disponible." }, { status: 503 });
  }
}
