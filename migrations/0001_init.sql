PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  sale_price_cents INTEGER CHECK (sale_price_cents IS NULL OR (sale_price_cents >= 0 AND sale_price_cents < price_cents)),
  sku TEXT NOT NULL UNIQUE,
  images_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL UNIQUE,
  stock_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
  stock_reserved INTEGER NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0 AND stock_reserved <= stock_on_hand),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0,1)),
  UNIQUE(product_id, size, color)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  access_code_hash TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL DEFAULT '',
  shipping_city TEXT NOT NULL DEFAULT '',
  customer_reference TEXT NOT NULL DEFAULT '',
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp','mercadopago')),
  status TEXT NOT NULL DEFAULT 'pending_confirmation',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  currency TEXT NOT NULL DEFAULT 'PEN',
  subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
  shipping_cents INTEGER NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  checkout_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  variant_id TEXT REFERENCES product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
  line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_payment_id TEXT,
  preference_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  amount_cents INTEGER NOT NULL CHECK (amount_cents >= 0),
  raw_status TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_provider_external
ON payments(provider, provider_payment_id) WHERE provider_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  event_key TEXT NOT NULL,
  processed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider, event_key)
);

CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  attempted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_attempts_recent ON admin_login_attempts(ip_hash, attempted_at);
CREATE INDEX IF NOT EXISTS idx_products_published ON products(status, category_id);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
