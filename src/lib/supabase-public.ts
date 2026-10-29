import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type PublicProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  sale_price_cents: number | null;
  images_json: string;
  sku: string;
  category_name: string | null;
};

export type PublicVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  stock_on_hand: number;
  stock_reserved: number;
  active: number;
};

export type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort_order?: number;
};

let publicClient: SupabaseClient | undefined;

export function getPublicSupabase(): SupabaseClient {
  if (publicClient) return publicClient;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Falta SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY.");
  publicClient = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  return publicClient;
}

function mapProduct(row: any): PublicProduct {
  const relation = Array.isArray(row.category) ? row.category[0] : row.category;
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    price_cents: Number(row.price_cents),
    sale_price_cents: row.sale_price_cents == null ? null : Number(row.sale_price_cents),
    images_json: typeof row.images_json === "string" ? row.images_json : "[]",
    sku: String(row.sku),
    category_name: relation?.name ? String(relation.name) : null,
  };
}

export async function listPublishedProducts(category?: string | null): Promise<PublicProduct[]> {
  const client = getPublicSupabase();
  const selection = category
    ? "id,name,slug,description,price_cents,sale_price_cents,images_json,sku,category:categories!inner(name,slug)"
    : "id,name,slug,description,price_cents,sale_price_cents,images_json,sku,category:categories(name,slug)";
  let query = client
    .from("products")
    .select(selection)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);
  if (category) query = query.eq("category.slug", category);
  const { data, error } = await query;
  if (error) throw new Error("No se pudo consultar el catálogo de Supabase: " + error.message);
  return (data ?? []).map(mapProduct);
}

export async function getPublishedProduct(slug: string): Promise<PublicProduct | null> {
  const client = getPublicSupabase();
  const { data, error } = await client
    .from("products")
    .select("id,name,slug,description,price_cents,sale_price_cents,images_json,sku,category:categories(name,slug)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("No se pudo consultar el producto: " + error.message);
  return data ? mapProduct(data) : null;
}

export async function listActiveVariants(productId: string): Promise<PublicVariant[]> {
  const client = getPublicSupabase();
  const { data, error } = await client
    .from("product_variants")
    .select("id,size,color,sku,stock_on_hand,stock_reserved,active")
    .eq("product_id", productId)
    .eq("active", 1)
    .order("size", { ascending: true })
    .order("color", { ascending: true });
  if (error) throw new Error("No se pudieron consultar las variantes: " + error.message);
  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    size: String(row.size ?? ""),
    color: String(row.color ?? ""),
    sku: String(row.sku),
    stock_on_hand: Number(row.stock_on_hand),
    stock_reserved: Number(row.stock_reserved),
    active: Number(row.active),
  }));
}

export async function listPublicCategories(): Promise<PublicCategory[]> {
  const client = getPublicSupabase();
  const { data, error } = await client
    .from("categories")
    .select("id,name,slug,description,sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .limit(100);
  if (error) throw new Error("No se pudieron consultar las categorías: " + error.message);
  return (data ?? []).map((row: any) => ({
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    sort_order: Number(row.sort_order ?? 0),
  }));
}
