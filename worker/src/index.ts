import { Hono } from "hono";
import { FormsSubmit } from "./endpoints/formsSubmit";
import { QuoteSubmit } from "./endpoints/quotes";
import {
  ReviewAuthConfig,
  ReviewAuthLogout,
  ReviewAuthSession,
  ReviewGoogleLogin,
} from "./endpoints/reviewAuth";
import {
  ReviewCreateInvitation,
  ReviewGetInvitation,
  ReviewListAdmin,
  ReviewListPublished,
  ReviewModerate,
  ReviewPublicOptions,
  ReviewSubmit,
} from "./endpoints/reviews";

const app = new Hono<{ Bindings: Env }>();

const REVIEW_ORIGIN = "https://review.alphazonelabs.com";
const MAIN_ORIGIN = "https://alphazonelabs.com";
const LOCAL_ORIGINS = new Set(["http://localhost:5173", "http://127.0.0.1:5173"]);

function isAllowedOrigin(origin: string | null) {
  return origin === REVIEW_ORIGIN || origin === MAIN_ORIGIN || LOCAL_ORIGINS.has(origin || "");
}

function addCorsHeaders(c: any) {
  const origin = c.req.header("Origin") || null;
  if (isAllowedOrigin(origin)) {
    c.header("Access-Control-Allow-Origin", origin);
    c.header("Vary", "Origin");
    c.header("Access-Control-Allow-Credentials", "true");
  }
  c.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  c.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

app.use("*", async (c, next) => {
  if (c.req.method === "OPTIONS" && c.req.path.startsWith("/api/")) {
    addCorsHeaders(c);
    return c.body(null, 204);
  }

  await next();

  if (c.req.path.startsWith("/api/")) addCorsHeaders(c);

  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");

  const isReviewAuthApi = c.req.path.startsWith("/api/auth/") || c.req.path.startsWith("/api/reviews");
  const csp = isReviewAuthApi
    ? "default-src 'self'; script-src 'self' https://accounts.google.com/gsi/client https://accounts.google.com; frame-src https://accounts.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https://oauth2.googleapis.com;"
    : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self';";
  c.header("Content-Security-Policy", csp);
});

app.options("/api/forms", FormsSubmit);
app.post("/api/forms", FormsSubmit);
app.post("/api/quotes", QuoteSubmit);

app.get("/api/auth/config", ReviewAuthConfig);
app.post("/api/auth/google", ReviewGoogleLogin);
app.get("/api/auth/session", ReviewAuthSession);
app.post("/api/auth/logout", ReviewAuthLogout);

app.post("/api/reviews/invitations", ReviewCreateInvitation);
app.get("/api/reviews", ReviewListAdmin);
app.post("/api/reviews/:id/moderate", ReviewModerate);
app.get("/api/reviews/invitation/:token", ReviewGetInvitation);
app.post("/api/reviews/invitation/:token", ReviewSubmit);
app.options("/api/reviews/published", ReviewPublicOptions);
app.get("/api/reviews/published", ReviewListPublished);

app.get("/", (c) => c.json({ ok: true, service: "Alpha Zone Labs forms and review authentication" }));

export default app;
