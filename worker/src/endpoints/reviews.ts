import type { AppContext } from "../types";
import { getAuthorizedReviewSession } from "./reviewAuth";

type ReviewEnv = Env & {
  REVIEWS_DB?: D1Database;
  REVIEWS_MEDIA?: R2Bucket;
  SENDGRID_API_KEY?: string;
  REVIEW_FROM_EMAIL?: string;
  REVIEW_SITE_URL?: string;
  REVIEW_LOGO_URL?: string;
  ALLOWED_ORIGINS?: string;
};

type InvitationRow = {
  id: string;
  token: string;
  customer_name: string;
  customer_email: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  submitted_at: string | null;
};

type ReviewRow = {
  id: string;
  invitation_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  status: string;
  created_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  image_key: string | null;
  image_content_type: string | null;
};

function json(c: AppContext, body: unknown, status = 200, headers: Record<string, string> = {}) {
  return c.json(body, status as 200, { "Cache-Control": "no-store", ...headers });
}

function db(c: AppContext): D1Database | null {
  return (c.env as ReviewEnv).REVIEWS_DB || null;
}

function media(c: AppContext): R2Bucket | null {
  return (c.env as ReviewEnv).REVIEWS_MEDIA || null;
}

function imageUrl(key: string | null): string | null {
  return key ? `/api/reviews/media/${encodeURIComponent(key)}` : null;
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function clean(value: unknown, max = 5000): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function allowedOrigin(c: AppContext): string {
  const origin = c.req.header("Origin") || "";
  const allowed = new Set(
    ((c.env as ReviewEnv).ALLOWED_ORIGINS || "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );
  return allowed.has(origin) ? origin : "https://alphazonelabs.com";
}

function publicHeaders(c: AppContext): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(c),
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

async function requireAdmin(c: AppContext) {
  const session = await getAuthorizedReviewSession(c);
  if (!session) return { response: json(c, { error: "Authentication required." }, 401), session: null };
  return { response: null, session };
}

async function sendReviewEmail(env: ReviewEnv, invitation: InvitationRow): Promise<void> {
  if (!env.SENDGRID_API_KEY) throw new Error("SENDGRID_API_KEY is not configured.");
  const from = env.REVIEW_FROM_EMAIL || "info@alphazonelabs.com";
  const siteUrl = (env.REVIEW_SITE_URL || "https://review.alphazonelabs.com").replace(/\/$/, "");
  const logoUrl = env.REVIEW_LOGO_URL || "https://raw.githubusercontent.com/hligon35/hldesignedit.com/main/alpha-zone-labs-logo.png";
  const reviewUrl = `${siteUrl}/submit.html?token=${encodeURIComponent(invitation.token)}`;
  const firstName = invitation.customer_name.split(/\s+/)[0] || "there";

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: invitation.customer_email, name: invitation.customer_name || undefined }] }],
      from: { email: from, name: "Alpha Zone Labs" },
      subject: "How was your experience with Alpha Zone Labs?",
      content: [
        {
          type: "text/plain",
          value: `Hi ${firstName},\n\nThank you for working with Alpha Zone Labs. We would appreciate a brief review of your experience.\n\nLeave your review: ${reviewUrl}\n\nThank you,\nAlpha Zone Labs`,
        },
        {
          type: "text/html",
          value: `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @media only screen and (max-width:620px) {
      .email-wrap { padding:20px 12px !important; }
      .email-layout, .email-layout tbody, .email-layout tr, .email-layout td { display:block !important; width:100% !important; }
      .logo-cell { padding:0 0 20px !important; text-align:center !important; }
      .logo-cell img { width:270px !important; max-width:80vw !important; }
      .content-cell { padding:28px 22px !important; }
      .content-cell h1 { font-size:28px !important; }
    }
  </style>
</head>
<body style="margin:0;background:#fff8e8;font-family:Arial,sans-serif;color:#171717">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#fff8e8">
    <tr>
      <td class="email-wrap" align="center" style="padding:36px 16px">
        <table role="presentation" class="email-layout" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:1140px;table-layout:fixed">
          <tr>
            <td class="logo-cell" width="285" valign="middle" align="center" style="width:285px;padding:24px 32px 24px 0">
              <img src="${logoUrl}" width="285" alt="Alpha Zone Labs" style="display:block;width:285px;max-width:100%;height:auto;border:0">
            </td>
            <td width="600" valign="middle" align="center" style="width:600px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;margin:0 auto">
                <tr>
                  <td class="content-cell" valign="middle" style="background:#fff;border:1px solid #e7e5e4;border-radius:20px;padding:36px;text-align:left">
                    <p style="margin:0 0 12px;color:#7f0010;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase">Alpha Zone Labs</p>
                    <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:30px;line-height:1.15">Tell us about your experience.</h1>
                    <p style="margin:0 0 16px;line-height:1.7">Hi ${firstName},</p>
                    <p style="margin:0 0 24px;line-height:1.7">Thank you for working with Alpha Zone Labs. Your feedback helps us improve and helps future customers understand what it is like to work with us.</p>
                    <p style="margin:0 0 28px"><a href="${reviewUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#9f0712;color:#fff;text-decoration:none;font-weight:700">Leave a review</a></p>
                    <p style="margin:0;color:#57534e;font-size:13px;line-height:1.6">This private link is connected to your review invitation.</p>
                  </td>
                </tr>
              </table>
            </td>
            <td width="285" aria-hidden="true" style="width:285px;font-size:0;line-height:0">&nbsp;</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`SendGrid rejected the email (${response.status}): ${detail.slice(0, 300)}`);
  }
}

export async function ReviewPublicOptions(c: AppContext) {
  return new Response(null, { status: 204, headers: publicHeaders(c) });
}

export async function ReviewCreateInvitation(c: AppContext) {
  const auth = await requireAdmin(c);
  if (auth.response) return auth.response;
  const database = db(c);
  if (!database) return json(c, { error: "REVIEWS_DB is not configured." }, 503);

  const body = await c.req.json<{ name?: string; email?: string }>().catch(() => ({}) as { name?: string; email?: string });
  const customerName = clean(body.name, 120);
  const customerEmail = clean(body.email, 254).toLowerCase();
  if (!customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    return json(c, { error: "A valid customer email is required." }, 400);
  }

  const invitation: InvitationRow = {
    id: crypto.randomUUID(),
    token: randomToken(),
    customer_name: customerName,
    customer_email: customerEmail,
    status: "created",
    created_at: new Date().toISOString(),
    sent_at: null,
    submitted_at: null,
  };

  await database.prepare(
    `INSERT INTO review_invitations (id, token, customer_name, customer_email, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(invitation.id, invitation.token, invitation.customer_name, invitation.customer_email, invitation.status, invitation.created_at).run();

  try {
    await sendReviewEmail(c.env as ReviewEnv, invitation);
    invitation.status = "sent";
    invitation.sent_at = new Date().toISOString();
    await database.prepare("UPDATE review_invitations SET status = ?, sent_at = ? WHERE id = ?")
      .bind(invitation.status, invitation.sent_at, invitation.id).run();
  } catch (error) {
    await database.prepare("UPDATE review_invitations SET status = ? WHERE id = ?").bind("email_failed", invitation.id).run();
    return json(c, { error: error instanceof Error ? error.message : "The invitation could not be emailed." }, 502);
  }

  return json(c, { ok: true, invitation: { id: invitation.id, email: invitation.customer_email, status: invitation.status } }, 201);
}

export async function ReviewListAdmin(c: AppContext) {
  const auth = await requireAdmin(c);
  if (auth.response) return auth.response;
  const database = db(c);
  if (!database) return json(c, { error: "REVIEWS_DB is not configured." }, 503);

  const results = await database.prepare(
        `SELECT r.id, r.invitation_id, r.customer_name, r.customer_email, r.rating, r.review_text,
          r.status, r.created_at, r.moderated_at, r.moderated_by, r.image_key, r.image_content_type
     FROM reviews r ORDER BY r.created_at DESC LIMIT 200`,
  ).all<ReviewRow>();
  return json(c, { reviews: (results.results || []).map((review) => ({ ...review, image_url: imageUrl(review.image_key) })) });
}

export async function ReviewAnalytics(c: AppContext) {
  const auth = await requireAdmin(c);
  if (auth.response) return auth.response;
  const database = db(c);
  if (!database) return json(c, { error: "REVIEWS_DB is not configured." }, 503);
  const [summary, ratings, invitations] = await Promise.all([
    database.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending, SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) AS approved, SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) AS rejected, ROUND(AVG(CASE WHEN status = 'approved' THEN rating END), 2) AS average_rating FROM reviews").first<Record<string, number>>(),
    database.prepare("SELECT rating, COUNT(*) AS count FROM reviews WHERE status = 'approved' GROUP BY rating ORDER BY rating").all<{ rating: number; count: number }>(),
    database.prepare("SELECT status, COUNT(*) AS count FROM review_invitations GROUP BY status ORDER BY status").all<{ status: string; count: number }>(),
  ]);
  return json(c, { summary: summary || {}, ratings: ratings.results || [], invitations: invitations.results || [] });
}

export async function ReviewModerate(c: AppContext) {
  const auth = await requireAdmin(c);
  if (auth.response || !auth.session) return auth.response;
  const database = db(c);
  if (!database) return json(c, { error: "REVIEWS_DB is not configured." }, 503);

  const id = c.req.param("id");
  const body = await c.req.json<{ action?: string }>().catch(() => ({}) as { action?: string });
  const action = clean(body.action, 20).toLowerCase();
  const nextStatus = action === "approve" ? "approved" : action === "reject" ? "rejected" : "";
  if (!nextStatus) return json(c, { error: "Action must be approve or reject." }, 400);

  const result = await database.prepare(
    "UPDATE reviews SET status = ?, moderated_at = ?, moderated_by = ? WHERE id = ?",
  ).bind(nextStatus, new Date().toISOString(), auth.session.email, id).run();
  if (!result.meta.changes) return json(c, { error: "Review not found." }, 404);
  await database.prepare("INSERT INTO review_audit_log (id, actor_email, action, entity_type, entity_id, created_at) VALUES (?, ?, ?, 'review', ?, ?)")
    .bind(crypto.randomUUID(), auth.session.email, nextStatus, id, new Date().toISOString()).run();
  return json(c, { ok: true, id, status: nextStatus });
}

export async function ReviewDelete(c: AppContext) {
  const auth = await requireAdmin(c);
  if (auth.response || !auth.session) return auth.response;
  const database = db(c);
  if (!database) return json(c, { error: "REVIEWS_DB is not configured." }, 503);

  const id = clean(c.req.param("id"), 100);
  const review = await database.prepare("SELECT id, image_key FROM reviews WHERE id = ?")
    .bind(id)
    .first<{ id: string; image_key: string | null }>();
  if (!review) return json(c, { error: "Review not found." }, 404);

  const deletedAt = new Date().toISOString();
  await database.batch([
    database.prepare("DELETE FROM reviews WHERE id = ?").bind(id),
    database.prepare(
      "INSERT INTO review_audit_log (id, actor_email, action, entity_type, entity_id, created_at) VALUES (?, ?, 'deleted', 'review', ?, ?)",
    ).bind(crypto.randomUUID(), auth.session.email, id, deletedAt),
  ]);

  if (review.image_key && media(c)) {
    try {
      await media(c)?.delete(review.image_key);
    } catch {
      // A deleted review must not be restored because media cleanup was unsuccessful.
    }
  }

  return json(c, { ok: true, id, deleted: true });
}

export async function ReviewGetInvitation(c: AppContext) {
  const database = db(c);
  if (!database) return json(c, { error: "Review service is not configured." }, 503);
  const token = clean(c.req.param("token"), 128);
  const invitation = await database.prepare(
    "SELECT id, customer_name, customer_email, status FROM review_invitations WHERE token = ?",
  ).bind(token).first<{ id: string; customer_name: string; customer_email: string; status: string }>();
  if (!invitation) return json(c, { error: "This review invitation is invalid." }, 404);
  if (invitation.status === "submitted") return json(c, { error: "A review has already been submitted with this link." }, 409);
  return json(c, { invitation: { name: invitation.customer_name, email: invitation.customer_email } });
}

export async function ReviewSubmit(c: AppContext) {
  const database = db(c);
  if (!database) return json(c, { error: "Review service is not configured." }, 503);
  const token = clean(c.req.param("token"), 128);
  const contentType = c.req.header("Content-Type") || "";
  let submittedName = "";
  let rating = 0;
  let reviewText = "";
  let image: File | null = null;
  if (contentType.includes("multipart/form-data")) {
    const form = await c.req.raw.formData();
    submittedName = clean(form.get("name"), 120);
    rating = Number(form.get("rating"));
    reviewText = clean(form.get("review"), 3000);
    const candidate = form.get("image");
    image = candidate instanceof File && candidate.size > 0 ? candidate : null;
  } else {
    const body = await c.req.json<{ name?: string; rating?: number; review?: string }>().catch(() => ({}) as { name?: string; rating?: number; review?: string });
    rating = Number(body.rating);
    reviewText = clean(body.review, 3000);
    submittedName = clean(body.name, 120);
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json(c, { error: "Select a rating from 1 to 5." }, 400);
  if (reviewText.length < 10) return json(c, { error: "Please provide at least 10 characters of feedback." }, 400);
  if (image && (!media(c) || image.size > 2_000_000 || !["image/jpeg", "image/png", "image/webp"].includes(image.type))) return json(c, { error: "Image must be a JPG, PNG, or WebP file under 2 MB." }, 400);

  const invitation = await database.prepare(
    "SELECT id, customer_name, customer_email, status FROM review_invitations WHERE token = ?",
  ).bind(token).first<{ id: string; customer_name: string; customer_email: string; status: string }>();
  if (!invitation) return json(c, { error: "This review invitation is invalid." }, 404);
  if (invitation.status === "submitted") return json(c, { error: "A review has already been submitted with this link." }, 409);

  const now = new Date().toISOString();
  const reviewId = crypto.randomUUID();
  let imageKey: string | null = null;
  if (image && media(c)) {
    imageKey = `reviews/${reviewId}.${image.type.split("/")[1]}`;
    await media(c)?.put(imageKey, image.stream(), { httpMetadata: { contentType: image.type, cacheControl: "public, max-age=31536000, immutable" } });
  }
  await database.batch([
    database.prepare(
      `INSERT INTO reviews (id, invitation_id, customer_name, customer_email, rating, review_text, status, created_at, image_key, image_content_type)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`,
    ).bind(reviewId, invitation.id, submittedName || invitation.customer_name, invitation.customer_email, rating, reviewText, now, imageKey, image?.type || null),
    database.prepare("UPDATE review_invitations SET status = 'submitted', submitted_at = ? WHERE id = ?").bind(now, invitation.id),
  ]);
  return json(c, { ok: true, message: "Thank you. Your review was submitted for approval." }, 201);
}

export async function ReviewListPublished(c: AppContext) {
  const database = db(c);
  if (!database) return json(c, { reviews: [] }, 200, publicHeaders(c));
  const results = await database.prepare(
    `SELECT id, customer_name, rating, review_text, created_at, image_key
     FROM reviews WHERE status = 'approved' ORDER BY moderated_at DESC, created_at DESC LIMIT 12`,
  ).all<{ id: string; customer_name: string; rating: number; review_text: string; created_at: string; image_key: string | null }>();
  return json(c, { reviews: (results.results || []).map((review) => ({ ...review, image_url: imageUrl(review.image_key) })) }, 200, publicHeaders(c));
}

export async function ReviewMedia(c: AppContext) {
  const bucket = media(c);
  if (!bucket) return new Response("Not found", { status: 404 });
  const key = decodeURIComponent(c.req.param("key"));
  const object = await bucket.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
}
