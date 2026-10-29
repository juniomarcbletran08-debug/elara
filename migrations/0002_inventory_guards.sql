CREATE TABLE IF NOT EXISTS rate_limits (
  bucket TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(bucket,key_hash,window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(bucket,window_start);

CREATE TRIGGER IF NOT EXISTS variant_reservation_guard
BEFORE UPDATE OF stock_reserved ON product_variants
WHEN NEW.stock_reserved > NEW.stock_on_hand OR NEW.stock_reserved < 0 OR (NEW.active != 1 AND NEW.stock_reserved > OLD.stock_reserved)
BEGIN
  SELECT RAISE(ABORT, 'inventory reservation failed');
END;

CREATE TRIGGER IF NOT EXISTS variant_stock_guard
BEFORE UPDATE OF stock_on_hand ON product_variants
WHEN NEW.stock_on_hand < 0 OR NEW.stock_reserved > NEW.stock_on_hand
BEGIN
  SELECT RAISE(ABORT, 'inventory stock update failed');
END;
