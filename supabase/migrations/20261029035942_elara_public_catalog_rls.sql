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
