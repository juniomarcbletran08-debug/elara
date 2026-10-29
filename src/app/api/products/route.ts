import { listPublishedProducts } from "@/lib/supabase-public";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const rows = await listPublishedProducts(category);
    const products = rows.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      sku: p.sku,
      category_name: p.category_name,
      price: Number(p.sale_price_cents ?? p.price_cents),
      images: parseImages(p.images_json),
    }));
    return Response.json(
      { products },
      { headers: { "Cache-Control": "public, max-age=30, s-maxage=60, stale-while-revalidate=300" } },
    );
  } catch {
    return Response.json({ error: "El catálogo no está disponible. Revisa la conexión y las políticas de Supabase." }, { status: 503 });
  }
}

function parseImages(value: unknown): string[] {
  try {
    const parsed: unknown = JSON.parse(String(value ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string").slice(0, 12) : [];
  } catch { return []; }
}
