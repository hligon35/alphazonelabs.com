# Alpha Zone Labs Admin Portal

The admin portal is designed for `https://admin.alphazonelabs.com` and uses Google Identity Services with server-side verification in the existing Cloudflare Worker.

## Frontend deployment

Create a Cloudflare Pages project from this repository with:

- Build command: `npm run build:review`
- Build output directory: `review-dist`
- Root directory: repository root
- Custom domain: `admin.alphazonelabs.com`

## Google OAuth configuration

Create a Google OAuth 2.0 Web application client and add:

- Authorized JavaScript origin: `https://admin.alphazonelabs.com`

The Google client ID is public and must be configured on the Worker as `GOOGLE_CLIENT_ID`.

## Worker configuration

Configure these Worker values:

- `GOOGLE_CLIENT_ID`: Google OAuth web client ID
- `ALLOWED_GOOGLE_EMAILS`: comma-separated allowlist, for example `owner@example.com,manager@example.com`
- `AUTH_COOKIE_SECRET`: long random secret used to sign the secure session cookie

Use a normal Worker variable for `GOOGLE_CLIENT_ID` and `ALLOWED_GOOGLE_EMAILS`. Store `AUTH_COOKIE_SECRET` as a Wrangler secret:

```bash
cd worker
npx wrangler secret put AUTH_COOKIE_SECRET
```

Route these paths on the admin subdomain to the Worker:

- `admin.alphazonelabs.com/api/auth/*`

The Pages deployment serves the login and dashboard pages. The Worker route handles Google verification and secure sessions.

## Current scope

The Google sign-in flow, email allowlist enforcement, secure session cookie, session check, sign-out, responsive login layout, and dashboard shell are implemented. The review invitation, review submission, storage, approval, rejection, and homepage publishing workflow will be connected next.
