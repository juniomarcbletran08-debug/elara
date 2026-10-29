ALTER FUNCTION public.elara_variant_reservation_guard() SET search_path = public, pg_temp;
ALTER FUNCTION public.elara_variant_stock_guard() SET search_path = public, pg_temp;

CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_variant_id ON public.order_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
