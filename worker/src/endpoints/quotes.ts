import { z } from "zod";
import type { AppContext } from "../types";
import { sendEmail } from "../email";

const QuoteSchema = z.object({
  submittedAt: z.string().max(100),
  contact: z.object({ businessName: z.string().trim().min(1).max(160), contactName: z.string().trim().min(1).max(120), contactEmail: z.string().email().max(254) }),
  goals: z.array(z.string().max(500)).max(100),
  selectedPlatforms: z.array(z.string().max(200)).max(20),
  customerFeatures: z.array(z.string().max(200)).max(20),
  ownerFeatures: z.array(z.string().max(200)).max(20),
  monthlyBudget: z.string().max(120).optional(), projectBudget: z.string().max(120).optional(), timeline: z.string().max(120).optional(), success: z.string().max(500).optional(), source: z.string().max(300),
}).passthrough();

function json(c: AppContext, body: unknown, status = 200) { return c.json(body, status as 200, { "Cache-Control": "no-store" }); }

export async function QuoteSubmit(c: AppContext) {
  const origin = c.req.header("Origin") || "";
  if (!(c.env.ALLOWED_ORIGINS || "").split(",").map((value) => value.trim()).includes(origin)) return json(c, { ok: false, error: "Request origin is not allowed." }, 403);
  if (Number(c.req.header("Content-Length") || 0) > 100_000) return json(c, { ok: false, error: "Request is too large." }, 413);
  let payload: z.infer<typeof QuoteSchema>;
  try { payload = QuoteSchema.parse(await c.req.json()); } catch { return json(c, { ok: false, error: "The quote request is invalid." }, 400); }
  const database = c.env.REVIEWS_DB;
  if (!database) return json(c, { ok: false, error: "Quote service is not configured." }, 503);
  const id = crypto.randomUUID();
  const quoteId = `AZL-${new Date().getUTCFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const now = new Date().toISOString();
  const idempotencyKey = c.req.header("Idempotency-Key")?.trim() || crypto.randomUUID();
  try {
    await database.prepare(`INSERT INTO quote_requests (id, quote_id, name, email, payload_json, total_cents, created_at, updated_at, idempotency_key) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)`).bind(id, quoteId, payload.contact.contactName, payload.contact.contactEmail.toLowerCase(), JSON.stringify(payload), now, now, idempotencyKey).run();
  } catch (error) {
    if (String(error).toLowerCase().includes("unique")) return json(c, { ok: true, duplicate: true, quoteId });
    console.error("Quote persistence failed", { id });
    return json(c, { ok: false, error: "We could not save your quote request." }, 503);
  }
  const summary = [`Quote ID: ${quoteId}`, `Business: ${payload.contact.businessName}`, `Contact: ${payload.contact.contactName}`, `Email: ${payload.contact.contactEmail}`, `Project budget: ${payload.projectBudget || "Not provided"}`, `Timeline: ${payload.timeline || "Not provided"}`, "", ...payload.goals].join("\n");
  try {
    await sendEmail(c.env, { to: c.env.FORMS_TO_EMAIL, subject: `New quote request ${quoteId}`, text: summary, idempotencyKey: `quote-notification-${id}` });
    await sendEmail(c.env, { to: payload.contact.contactEmail, subject: `Quote request received: ${quoteId}`, text: `Thanks for contacting Alpha Zone Labs. Your request ID is ${quoteId}. We will follow up soon.`, idempotencyKey: `quote-confirmation-${id}` });
    await database.prepare("UPDATE quote_requests SET status = 'processed', notification_status = 'sent', confirmation_status = 'sent', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
  } catch {
    console.error("Quote email delivery failed", { id });
    await database.prepare("UPDATE quote_requests SET status = 'email_failed', notification_status = 'failed', updated_at = ? WHERE id = ?").bind(new Date().toISOString(), id).run();
    return json(c, { ok: false, error: "Your request was saved, but delivery is temporarily unavailable." }, 502);
  }
  return json(c, { ok: true, quoteId }, 201);
}