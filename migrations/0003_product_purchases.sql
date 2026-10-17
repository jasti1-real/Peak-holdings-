CREATE TABLE IF NOT EXISTS product_purchases (
 id TEXT PRIMARY KEY,
 user_id TEXT NOT NULL REFERENCES users(id),
 product_id INTEGER NOT NULL REFERENCES products(id),
 amount_ugx INTEGER NOT NULL CHECK(amount_ugx > 0),
 status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','failed','cancelled')),
 provider_reference TEXT UNIQUE,
 created_at TEXT DEFAULT CURRENT_TIMESTAMP,
 updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_purchases_user_status ON product_purchases(user_id,status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_created ON payment_requests(user_id,created_at);
