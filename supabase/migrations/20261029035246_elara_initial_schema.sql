-- ÉLARA PostgreSQL baseline. Tables are accessed from server-side Vercel routes.
CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  category_id text REFERENCES public.categories(id) ON DELETE SET NULL,
  price_cents bigint NOT NULL CHECK (price_cents >= 0),
  sale_price_cents bigint CHECK (sale_price_cents IS NULL OR (sale_price_cents >= 0 AND sale_price_cents < price_cents)),
  sku text NOT NULL UNIQUE,
  images_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '',
  sku text NOT NULL UNIQUE,
  stock_on_hand integer NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
  stock_reserved integer NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0 AND stock_reserved <= stock_on_hand),
  active smallint NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  UNIQUE(product_id, size, color)
);

CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  order_number text NOT NULL UNIQUE,
  access_code_hash text,
  customer_name text NOT NULL,
  customer_email text NOT NULL DEFAULT '',
  customer_phone text NOT NULL,
  shipping_address text NOT NULL DEFAULT '',
  shipping_city text NOT NULL DEFAULT '',
  customer_reference text NOT NULL DEFAULT '',
  channel text NOT NULL CHECK (channel IN ('whatsapp','mercadopago')),
  status text NOT NULL DEFAULT 'pending_confirmation',
  payment_status text NOT NULL DEFAULT 'pending',
  currency text NOT NULL DEFAULT 'PEN' CHECK (currency = 'PEN'),
  subtotal_cents bigint NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents bigint NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents bigint NOT NULL CHECK (total_cents >= 0),
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id text REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id text REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_label text NOT NULL DEFAULT '',
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price_cents bigint NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents bigint NOT NULL CHECK (line_total_cents >= 0)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id text PRIMARY KEY,
  order_id text NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  provider text NOT NULL,
  provider_payment_id text,
  preference_id text,
  status text NOT NULL DEFAULT 'pending',
  amount_cents bigint NOT NULL CHECK (amount_cents >= 0),
  raw_status text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_provider_external
  ON public.payments(provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id text PRIMARY KEY,
  provider text NOT NULL,
  event_key text NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, event_key)
);

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id text PRIMARY KEY,
  ip_hash text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_admin_attempts_recent ON public.admin_login_attempts(ip_hash, attempted_at);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products(status, category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON public.orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

CREATE TABLE IF NOT EXISTS public.rate_limits (
  bucket text NOT NULL,
  key_hash text NOT NULL,
  window_start bigint NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY(bucket, key_hash, window_start)
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON public.rate_limits(window_start);

CREATE OR REPLACE FUNCTION public.elara_variant_reservation_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stock_reserved > NEW.stock_on_hand OR NEW.stock_reserved < 0
     OR (NEW.active <> 1 AND NEW.stock_reserved > OLD.stock_reserved) THEN
    RAISE EXCEPTION 'inventory reservation failed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS variant_reservation_guard ON public.product_variants;
CREATE TRIGGER variant_reservation_guard
BEFORE UPDATE OF stock_reserved, active ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.elara_variant_reservation_guard();

CREATE OR REPLACE FUNCTION public.elara_variant_stock_guard()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.stock_on_hand < 0 OR NEW.stock_reserved > NEW.stock_on_hand THEN
    RAISE EXCEPTION 'inventory stock update failed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS variant_stock_guard ON public.product_variants;
CREATE TRIGGER variant_stock_guard
BEFORE UPDATE OF stock_on_hand ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.elara_variant_stock_guard();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
