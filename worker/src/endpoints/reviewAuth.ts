import type { AppContext } from "../types";

type ReviewAuthEnv = Env & {
  GOOGLE_CLIENT_ID?: string;
  ALLOWED_GOOGLE_EMAILS?: string;
  AUTH_COOKIE_SECRET?: string;
  ENVIRONMENT?: string;
  LOCAL_AUTH_BYPASS?: string;
  LOCAL_ADMIN_EMAIL?: string;
};

export type ReviewSession = {
  email: string;
  name?: string;
  exp: number;
};

const COOKIE_NAME = "azl_review_session";
const SESSION_SECONDS = 60 * 60 * 12;

function json(c: AppContext, body: unknown, status = 200, headers: Record<string, string> = {}) {
  return c.json(body, status as 200, { "Cache-Control": "no-store", ...headers });
}

function base64UrlEncode(value: string): string {
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return atob(padded);
}

function bytesToBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes));
  return base64UrlEncode(binary);
}

async function signValue(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return bytesToBase64Url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}

async function createSession(payload: ReviewSession, secret: string): Promise<string> {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  return `${encoded}.${await signValue(encoded, secret)}`;
}

async function readSession(token: string, secret: string): Promise<ReviewSession | null> {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;
  const expected = await signValue(encoded, secret);
  if (signature !== expected) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encoded)) as ReviewSession;
    if (!payload.email || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("Cookie") || "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

function allowedEmails(env: ReviewAuthEnv): Set<string> {
  return new Set(
    (env.ALLOWED_GOOGLE_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isLocalDevelopment(c: AppContext, env: ReviewAuthEnv): boolean {
  const requestHost = `${c.req.url} ${c.req.header("Host") || ""}`;
  const localHost = /(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|\s|$)/i.test(requestHost);
  return env.ENVIRONMENT !== "production" && localHost;
}

function sessionCookie(c: AppContext, token: string, maxAge: number): string {
  const secure = new URL(c.req.url).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function getAuthorizedReviewSession(c: AppContext): Promise<ReviewSession | null> {
  const env = c.env as ReviewAuthEnv;
  if (isLocalDevelopment(c, env)) {
    return { email: (env.LOCAL_ADMIN_EMAIL || "local-admin@example.com").toLowerCase(), name: "Local administrator", exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS };
  }
  if (!env.AUTH_COOKIE_SECRET) return null;
  const token = getCookie(c.req.raw, COOKIE_NAME);
  const session = token ? await readSession(token, env.AUTH_COOKIE_SECRET) : null;
  if (!session || !allowedEmails(env).has(session.email.toLowerCase())) return null;
  return session;
}

export async function ReviewLocalDevLogin(c: AppContext) {
  const env = c.env as ReviewAuthEnv;
  if (!isLocalDevelopment(c, env)) return json(c, { error: "Local development authentication is disabled." }, 403);
  const secret = env.AUTH_COOKIE_SECRET || "local-development-only-cookie-secret";
  const token = await createSession(
    { email: (env.LOCAL_ADMIN_EMAIL || "local-admin@example.com").toLowerCase(), name: "Local administrator", exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS },
    secret,
  );
  return json(c, { ok: true }, 200, { "Set-Cookie": sessionCookie(c, token, SESSION_SECONDS) });
}

export async function ReviewAuthConfig(c: AppContext) {
  const env = c.env as ReviewAuthEnv;
  if (!env.GOOGLE_CLIENT_ID) return json(c, { error: "GOOGLE_CLIENT_ID is not configured." }, 503);
  return json(c, { clientId: env.GOOGLE_CLIENT_ID });
}

export async function ReviewGoogleLogin(c: AppContext) {
  const env = c.env as ReviewAuthEnv;
  if (!env.GOOGLE_CLIENT_ID || !env.AUTH_COOKIE_SECRET) {
    return json(c, { error: "Google authentication is not fully configured." }, 503);
  }

  let credential = "";
  try {
    const body = await c.req.json<{ credential?: string }>();
    credential = body.credential?.trim() || "";
  } catch {
    return json(c, { error: "Invalid sign-in request." }, 400);
  }

  if (!credential) return json(c, { error: "Google credential is required." }, 400);

  const verification = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
  if (!verification.ok) return json(c, { error: "Google could not verify this sign-in." }, 401);

  const profile = await verification.json<{
    aud?: string;
    email?: string;
    email_verified?: string;
    name?: string;
  }>();

  const email = profile.email?.trim().toLowerCase() || "";
  if (profile.aud !== env.GOOGLE_CLIENT_ID || profile.email_verified !== "true" || !email) {
    return json(c, { error: "This Google account could not be verified." }, 401);
  }

  const allowed = allowedEmails(env);
  if (!allowed.size || !allowed.has(email)) {
    return json(c, { error: "This Google account is not authorized for the review portal." }, 403);
  }

  const token = await createSession(
    { email, name: profile.name, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS },
    env.AUTH_COOKIE_SECRET,
  );

  return json(c, { ok: true, email }, 200, { "Set-Cookie": sessionCookie(c, token, SESSION_SECONDS) });
}

export async function ReviewAuthSession(c: AppContext) {
  const env = c.env as ReviewAuthEnv;
  if (!env.AUTH_COOKIE_SECRET) return json(c, { error: "Authentication is not configured." }, 503);
  const session = await getAuthorizedReviewSession(c);
  if (!session) return json(c, { error: "Authentication required." }, 401);
  return json(c, { email: session.email, name: session.name || "" });
}

export async function ReviewAuthLogout(c: AppContext) {
  const secure = new URL(c.req.url).protocol === "https:" ? "; Secure" : "";
  const cookie = `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`;
  return json(c, { ok: true }, 200, { "Set-Cookie": cookie });
}
