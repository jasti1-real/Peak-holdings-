PRAGMA foreign_keys=ON;
-- Snapshot approved terms for each confirmed purchase at its first eligible Uganda-midnight run.
-- Unique purchase_id prevents term changes from rewriting an existing purchase's schedule.
CREATE TABLE IF NOT EXISTS purchase_earning_terms (
  purchase_id TEXT PRIMARY KEY REFERENCES product_purchases(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_amount_ugx INTEGER NOT NULL CHECK(daily_amount_ugx > 0),
  duration_days INTEGER NOT NULL CHECK(duration_days > 0),
  start_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS purchase_earning_terms_user_idx ON purchase_earning_terms(user_id);
