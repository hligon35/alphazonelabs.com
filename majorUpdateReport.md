# Major update report

## Implemented

- Created and switched to the required `major-update` branch.
- Added explicit Worker production, preview, and development environments and removed the stale root Wrangler asset configuration from the production path.
- Added placeholder-only `.env.example` and `worker/.dev.vars.example` files.
- Added a reusable Resend HTTPS email module with fixed configured sender validation and idempotency headers.
- Added D1 tables for form submissions, quote requests, and review audit records.
- Hardened project form submission with origin checks, payload limits, server validation, D1 persistence, idempotency, Resend notification/confirmation, and client loading/error states.
- Added a validated Worker quote endpoint and routed both quote wizards through it instead of Google Apps Script/no-cors submission.
- Refreshed the checked-in review deployment artifact so `review-dist/submit.html` exists.
- Added Worker `typecheck` and `test` scripts and fixed existing review JSON fallback type errors.

## Verification

- `npm run build` passed.
- `npm run build:quote` passed with the existing Vite warning for the legacy non-module `enhancements.js` script.
- `npm run build:review` passed.
- `cd worker && npm run typecheck` passed.
- `node --check quote-app/main.js`, `quote-app/start.js`, and `quote-app/enhancements.js` passed.

## Unresolved blockers

- No local Cloudflare account, D1 database, Resend account, Google OAuth configuration, or dashboard credentials were available, so remote migrations, email delivery, authentication, and production route verification could not be exercised.
- Review invitations still contain the existing SendGrid implementation and plaintext invitation-token schema; these require a follow-up migration to hashed expiring tokens and the shared Resend module before production launch.
- Review moderation still uses `denied` rather than the requested `rejected` state and does not yet write audit rows.
- Automated Worker tests, browser tests, link checks, secret scanning, and monthly GitHub Actions maintenance workflow remain to be added.
- Quote pricing is intentionally stored as server-owned zero until the business pricing rules are defined; client-submitted totals are not trusted.
- Generated deployment directories are tracked by the existing repository workflow and were rebuilt; review the generated diff before committing.

## Required dashboard actions

1. Verify the Resend domain and create the production `RESEND_API_KEY` secret.
2. Configure Google OAuth redirect origins and the production administrator allowlist.
3. Confirm the D1 database ID, apply migrations, and configure Cloudflare routes for the three production hostnames.
4. Configure Cloudflare Pages projects for `docs`, `quote-dist`, and `review-dist`.

## Deployment commands after review

```text
npm ci
npm run build
npm run build:quote
npm run build:review
cd worker
npm ci
npm run typecheck
npm run deploy -- --env production
```