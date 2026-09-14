# Review workflow deployment

The repository now contains the complete review invitation, submission, moderation, and publishing workflow. The remaining steps create the Cloudflare D1 database and add deployment secrets.

## 1. Create the D1 database

From the `worker` directory:

```bash
npx wrangler d1 create azl-reviews
```

Copy the generated `database_id` into `worker/wrangler.jsonc`:

```jsonc
"d1_databases": [
  {
    "binding": "REVIEWS_DB",
    "database_name": "azl-reviews",
    "database_id": "PASTE_GENERATED_DATABASE_ID"
  }
],
```

Place this top-level block after `routes` and before `vars`.

## 2. Apply the database migration

```bash
npx wrangler d1 migrations apply azl-reviews --remote
```

The migration file is `worker/migrations/0001_reviews.sql`.

## 3. Add Worker secrets

```bash
npx wrangler secret put AUTH_COOKIE_SECRET
npx wrangler secret put SENDGRID_API_KEY
```

`AUTH_COOKIE_SECRET` should be a long random value. `SENDGRID_API_KEY` must have permission to send mail.

## 4. Verify the sender

The configured sender is `info@alphazonelabs.com`. It must be verified in SendGrid through Single Sender Verification or Domain Authentication.

## 5. Deploy

```bash
npx wrangler deploy
```

Cloudflare Pages should also rebuild the review frontend with:

```text
Build command: npm run build:review
Output directory: review-dist
```

The main Alpha Zone Labs site must be rebuilt and deployed for approved reviews to appear on the homepage.

## 6. Test the complete workflow

1. Sign in at `https://review.alphazonelabs.com`.
2. Send a review request from the dashboard.
3. Open the unique link from the email.
4. Submit a rating and review.
5. Return to the dashboard and approve it.
6. Confirm it appears on `https://alphazonelabs.com` after the main-site deployment.

## Runtime endpoints

- `POST /api/reviews/invitations` — authenticated invitation email
- `GET /api/reviews` — authenticated moderation list
- `POST /api/reviews/:id/moderate` — authenticated approve or deny
- `DELETE /api/reviews/:id` — authenticated permanent review deletion
- `GET /api/reviews/invitation/:token` — validate customer link
- `POST /api/reviews/invitation/:token` — submit customer review
- `GET /api/reviews/published` — public approved-review feed
