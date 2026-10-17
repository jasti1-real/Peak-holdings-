ALTER TABLE payment_requests ADD COLUMN purpose TEXT NOT NULL DEFAULT 'deposit' CHECK(purpose IN ('deposit','product_purchase'));
ALTER TABLE payment_requests ADD COLUMN product_purchase_id TEXT REFERENCES product_purchases(id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_purchase ON payment_requests(product_purchase_id);