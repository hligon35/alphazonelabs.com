# Alpha Zone Labs launch readiness

## Local setup

Run `npm ci`, then copy `worker/.dev.vars.example` to `worker/.dev.vars` and replace every placeholder locally. Start the public site with `npm run dev`, the quote app with `npm run dev:quote`, the review app with `npm run dev:review`, and the Worker with `cd worker && npm ci && npm run dev`.

Apply local D1 migrations with Wrangler after creating a local database. Production migrations must be reviewed and applied with `wrangler d1 migrations apply azl-reviews --remote` from `worker`.

## Environment and email

`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_FROM_NAME` are server-only Worker secrets. `FORMS_TO_EMAIL`, `FORMS_DISPLAY_TO_EMAIL`, `AUTH_COOKIE_SECRET`, `GOOGLE_CLIENT_ID`, `ALLOWED_GOOGLE_EMAILS`, `ADMIN_SITE_URL`, and `ALLOWED_ORIGINS` are Worker variables. Configure the Resend sending domain before production deployment. No browser bundle should contain a secret.

## Deployment

Build all checked-in Pages artifacts with `npm run build`, `npm run build:quote`, and `npm run build:review`. Deploy the Worker from `worker` with `npm run deploy -- --env production` after applying migrations and setting secrets with Wrangler. Configure Cloudflare Pages or custom domains so the main site, quote site, and admin site use the generated directories and the Worker API routes do not overlap with static asset routes.

## Operations

Review invitations require a configured Google OAuth client and an allowlist. Production authentication fails closed when either the cookie secret or Google configuration is absent. Review moderation should be tested with a non-production account before publishing. Keep deployment rollback instructions and Resend domain verification details in the Cloudflare project runbook.
