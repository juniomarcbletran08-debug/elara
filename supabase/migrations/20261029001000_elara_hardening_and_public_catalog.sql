-- Tighten PostgreSQL function resolution, index foreign keys, and expose only published catalogue rows via the Data API.
ALTER FUNCTION public.elara_variant_reservation_guard() SET search_path = public, pg_temp;
ALTER FUNCTION public.elara_variant_stock_guard() SET search_path = public, pg_temp;

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

DROP POLICY IF EXISTS elara_public_read_published_products ON public.products;
CREATE POLICY elara_public_read_published_products
ON public.products FOR SELECT TO anon, authenticated
USING (status = 'published');

DROP POLICY IF EXISTS elara_public_read_used_categories ON public.categories;
CREATE POLICY elara_public_read_used_categories
ON public.categories FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.category_id = categories.id AND p.status = 'published'
  )
);

DROP POLICY IF EXISTS elara_public_read_active_variants ON public.product_variants;
CREATE POLICY elara_public_read_active_variants
ON public.product_variants FOR SELECT TO anon, authenticated
USING (
  active = 1 AND EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_variants.product_id AND p.status = 'published'
  )
);
