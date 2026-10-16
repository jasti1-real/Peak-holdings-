# Peak Holdings — Cloudflare application foundation
Responsive four-tab web application with Cloudflare Worker API and D1 schema.

## Deploy
1. Create a Cloudflare D1 database named peak-holdings-db.
2. Replace REPLACE_WITH_D1_DATABASE_ID in wrangler.toml with its actual ID.
3. Install Wrangler: npm install -D wrangler
4. Apply schema: npx wrangler d1 migrations apply peak-holdings-db --remote
5. Deploy: npx wrangler deploy

## Security / financial scope
Registration/login use PBKDF2 password hashing and Secure, HttpOnly session cookies. Financial actions are deliberately not enabled yet. Before accepting real money, complete MarzPay API and signed webhook integration, idempotent reconciliation, audited accounting, and review the business's legal authority and product disclosures. Never commit API secrets. Product return/referral claims from the brief are not enabled as real offers.
