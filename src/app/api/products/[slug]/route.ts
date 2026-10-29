import { getPublishedProduct } from "@/lib/supabase-public";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const row = await getPublishedProduct(slug);
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
      },
    }, { headers: { "Cache-Control": "public, max-age=30, s-maxage=60" } });
  } catch {
    return Response.json({ error: "El producto no está disponible." }, { status: 503 });
  }
}
