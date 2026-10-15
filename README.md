# Peak Holdings

Responsive mobile-first white-and-blue frontend foundation for Peak Holdings.

## Planned architecture
- Frontend: Cloudflare Pages
- API: Cloudflare Workers
- Database: Cloudflare D1
- Payments: Marzpay collections/disbursement, after credentials and provider API details are configured
- PWA: manifest and service worker to be added before installable production release

## Current status
This commit establishes the UI foundation and product catalogue. Registration/login forms are intentionally not connected to persistent accounts yet; balances, bonuses, deposits, withdrawals, referrals, and earnings are not real or stored. Do not use this frontend to accept real money until server-side authentication, ledger accounting, payment webhook signature verification, idempotency, rate limits, and admin controls have been implemented and tested.

## Product catalogue
The ten product price, daily-income and duration figures are displayed as provided. Displayed total return is calculated as daily income × duration; these figures are not a guarantee of actual returns.

## Next steps
1. Add Worker API and D1 schema/migrations.
2. Implement secure phone-number authentication and password hashing.
3. Implement immutable transaction ledger and idempotent Marzpay webhooks.
4. Add PWA manifest/service worker and product imagery.
5. Configure Pages deployment and Worker/D1 bindings in Cloudflare.
