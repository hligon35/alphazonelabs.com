import { z } from "zod";
import type { AppContext } from "../types";
import { sendEmail } from "../email";

const MAX_FIELD_LENGTH = 10_000;

const FormSubmitSchema = z.object({
	formType: z.enum(["contact", "project"]),
	data: z.record(z.string(), z.unknown()).default({}),
	honeypot: z.string().max(200).optional().default(""),
	pageUrl: z.string().url().max(500).optional(),
});

function getAllowedOrigins(env: Env): string[] {
	const configured = (env.ALLOWED_ORIGINS || "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

	const defaults = [
		"https://alphazonelabs.com",
		"https://www.alphazonelabs.com",
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"https://hligon35.github.io",
	];

	return Array.from(new Set([...configured, ...defaults]));
}

function corsHeaders(origin: string | null, env: Env): Record<string, string> {
	if (!origin) return {};
	const allowed = getAllowedOrigins(env);
	if (!allowed.includes(origin)) return {};

	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
		"Access-Control-Max-Age": "86400",
		Vary: "Origin",
	};
}

function normalizeString(value: unknown): string {
	if (value == null) return "";
	if (Array.isArray(value)) return value.map((v) => normalizeString(v)).join(", ");
	return String(value);
}

function sanitizeField(value: unknown): string {
	const text = normalizeString(value).replace(/\r\n/g, "\n");
	return text.length > MAX_FIELD_LENGTH ? `${text.slice(0, MAX_FIELD_LENGTH)}…` : text;
}

function displayOrNotProvided(value: string): string {
	const trimmed = value.trim();
	return trimmed ? trimmed : "(not provided)";
}

function escapeHtml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}

function pickReplyTo(data: Record<string, unknown>): string | undefined {
	const candidates = [data.email, data.contactEmail, data["emailAddress"]];
	for (const candidate of candidates) {
		const email = normalizeString(candidate).trim();
		if (email && /^\S+@\S+\.\S+$/.test(email)) return email;
	}
	return undefined;
}

function pickFirstNonEmpty(data: Record<string, unknown>, keys: string[]): string {
	for (const key of keys) {
		const value = data[key];
		const text = normalizeString(value).trim();
		if (text) return text;
	}
	return "";
}

function allowedOrigin(origin: string | null, env: Env): boolean {
	return !!origin && getAllowedOrigins(env).includes(origin);
}

export async function FormsSubmit(c: AppContext) {
	const origin = c.req.header("Origin") || null;
	const cors = corsHeaders(origin, c.env);

	if (c.req.method === "OPTIONS") {
		return new Response(null, { status: 204, headers: cors });
	}
	if (!allowedOrigin(origin, c.env)) return c.json({ ok: false, error: "Request origin is not allowed." }, 403);
	if (Number(c.req.header("Content-Length") || 0) > 64_000) return c.json({ ok: false, error: "Request is too large." }, 413, cors);

	let parsed: z.infer<typeof FormSubmitSchema>;
	try {
		const body = await c.req.json();
		parsed = FormSubmitSchema.parse(body);
	} catch {
		return c.json({ ok: false, error: "Invalid JSON body." }, 400, { ...cors, "Content-Type": "application/json" });
	}

	if (parsed.honeypot && parsed.honeypot.trim().length > 0) {
		return c.json({ ok: true }, 200, { ...cors, "Content-Type": "application/json" });
	}

	const database = c.env.REVIEWS_DB;
	if (!database) return c.json({ ok: false, error: "Form service is not configured." }, 503, cors);

	const data = parsed.data || {};
	const isProject = parsed.formType === "project";
	const name = sanitizeField(pickFirstNonEmpty(data, ["fullName", "name"])).trim();
	const email = sanitizeField(pickFirstNonEmpty(data, ["email", "contactEmail", "emailAddress"])).trim();
	const phone = sanitizeField(pickFirstNonEmpty(data, ["phone", "phoneNumber", "contactPhone", "tel"])).trim();
	const company = sanitizeField(pickFirstNonEmpty(data, ["company", "companyName", "business", "businessName", "organization", "org"])).trim();
	const website = sanitizeField(pickFirstNonEmpty(data, ["website", "url", "siteUrl"])).trim();
	const budget = sanitizeField(pickFirstNonEmpty(data, ["budget", "projectBudget"])).trim();
	const timeline = sanitizeField(pickFirstNonEmpty(data, ["timeline", "deadline", "timeframe", "desiredTimeline"])).trim();
	const contactSubject = sanitizeField(pickFirstNonEmpty(data, ["subject", "topic"])).trim();
	const message = sanitizeField(pickFirstNonEmpty(data, ["message"])).trim();
	const details = sanitizeField(pickFirstNonEmpty(data, ["details", "projectDetails", "description", "message"])).trim();
	if (name.length < 2 || email.length < 5 || !/^\S+@\S+\.\S+$/.test(email)) {
		return c.json({ ok: false, error: "Please provide a valid name and email address." }, 400, cors);
	}
	if ((isProject && details.length < 10) || (!isProject && message.length < 2)) {
		return c.json({ ok: false, error: "Please provide more detail about your request." }, 400, cors);
	}

	const now = new Date().toISOString();
	const idempotencyKey = c.req.header("Idempotency-Key")?.trim() || crypto.randomUUID();
	const submissionId = crypto.randomUUID();
	const sourcePage = parsed.pageUrl || origin || "unknown";
	try {
		await database.prepare(
			`INSERT INTO form_submissions
			 (id, request_type, name, email, phone, company, project_details, status, source_page, created_at, updated_at, metadata_json, idempotency_key)
			 VALUES (?, ?, ?, ?, ?, ?, ?, 'received', ?, ?, ?, ?, ?)`,
		).bind(submissionId, parsed.formType, name, email, phone, company, details || message, sourcePage, now, now, JSON.stringify(data), idempotencyKey).run();
	} catch (error) {
		if (String(error).toLowerCase().includes("unique")) return c.json({ ok: true, duplicate: true }, 200, cors);
		console.error("Form persistence failed", { submissionId });
		return c.json({ ok: false, error: "We could not save your request." }, 503, cors);
	}

	const subject = isProject
			? "New Project Request - Alpha Zone Labs"
			: "New Contact Message - Alpha Zone Labs";

	const gridPairs: Array<[string, string]> = isProject
		? [
			["Name", displayOrNotProvided(name)],
			["Company", displayOrNotProvided(company)],
			["Email", displayOrNotProvided(email)],
			["Phone Number", displayOrNotProvided(phone)],
			["Website", displayOrNotProvided(website)],
			["Budget", displayOrNotProvided(budget)],
			["Timeline", displayOrNotProvided(timeline)],
		]
		: [
			["Name", displayOrNotProvided(name)],
			["Email", displayOrNotProvided(email)],
			["Phone Number", displayOrNotProvided(phone)],
			["Subject", displayOrNotProvided(contactSubject)],
		];

	const longLabel = isProject ? "Details" : "Message";
	const longValue = isProject ? displayOrNotProvided(details || message) : displayOrNotProvided(message);

	const lines: string[] = [];
	lines.push(subject);
	lines.push("");
	for (const [label, value] of gridPairs) lines.push(`${label}: ${value}`);
	lines.push("");
	lines.push(`${longLabel}:`);
	lines.push(longValue);

	const replyTo = pickReplyTo(data);
	const htmlRows = gridPairs.map(([label, value]) => {
		const safeLabel = escapeHtml(label);
		const safeValue = escapeHtml(value).replaceAll("\n", "<br>");
		return `
			<tr>
				<td style="padding:0 0 12px 0;">
					<div style="padding:14px 16px;border:1px solid #e7e5e4;border-radius:14px;background:#ffffff;">
						<div style="margin:0 0 6px 0;color:#7f0010;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">${safeLabel}</div>
						<div style="color:#171717;font-size:14px;line-height:1.6;">${safeValue}</div>
					</div>
				</td>
			</tr>`;
	}).join("");

	const longValueHtml = escapeHtml(longValue).replaceAll("\n", "<br>");
	const longLabelHtml = escapeHtml(longLabel);
	const requestTypeLabel = isProject ? "Project Request" : "Contact Request";
	const introCopy = isProject
			? "A new project inquiry came in from Alpha Zone Labs."
			: "A new contact message came in from Alpha Zone Labs.";
	const replyToHtml = replyTo ? `<div style="margin-top:14px;padding:12px 14px;border-radius:12px;background:#fff4dd;border:1px solid #e6b84a;color:#7f0010;font-size:13px;line-height:1.5;"><strong style="color:#171717;">Reply-to:</strong> ${escapeHtml(replyTo)}</div>` : "";

	const html = `
		<div style="margin:0;padding:32px 18px;background:#fff9ec;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;color:#171717;line-height:1.6;">
			<div style="max-width:720px;margin:0 auto;">
				<div style="margin-bottom:18px;padding:22px 24px;border-radius:22px;background:linear-gradient(135deg,#c1121f,#7f0010);color:#ffffff;box-shadow:0 18px 50px rgba(28,25,23,0.12);">
					<div style="margin:0 0 10px 0;color:#fff1cc;font-size:11px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;">${requestTypeLabel}</div>
					<h1 style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;font-weight:700;color:#ffffff;">${escapeHtml(subject)}</h1>
					<p style="margin:0;font-size:14px;line-height:1.7;color:#fff1cc;">${introCopy}</p>
				</div>
				<div style="padding:22px 24px;border:1px solid #e7e5e4;border-radius:22px;background:#fffcf8;box-shadow:0 10px 30px rgba(28,25,23,0.06);">
					<h2 style="margin:0 0 16px 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.2;color:#171717;">Request details</h2>
					<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;font-size:14px;">
						${htmlRows || ""}
						<tr><td style="padding:4px 0 0 0;"><div style="padding:16px;border:1px solid #e7e5e4;border-radius:16px;background:#ffffff;"><div style="margin:0 0 8px 0;color:#7f0010;font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;">${longLabelHtml}</div><div style="color:#171717;font-size:14px;line-height:1.7;">${longValueHtml}</div></div></td></tr>
					</table>
					${replyToHtml}
				</div>
				<div style="padding:14px 8px 0;color:#6b7280;font-size:12px;line-height:1.6;text-align:center;">Sent from Alpha Zone Labs form submissions.</div>
			</div>
		</div>`;

	try {
		await sendEmail(c.env, {
			to: c.env.FORMS_TO_EMAIL,
			subject,
			text: lines.join("\n"),
			html,
			replyTo,
			idempotencyKey: `form-notification-${submissionId}`,
		});
		if (email) {
			await sendEmail(c.env, {
				to: email,
				subject: "We received your request - Alpha Zone Labs",
				text: `Hi ${name},\n\nWe received your request and will follow up soon.\n\nAlpha Zone Labs`,
				idempotencyKey: `form-confirmation-${submissionId}`,
			});
		}
		await database.prepare("UPDATE form_submissions SET notification_status = 'sent', confirmation_status = ?, status = 'processed', updated_at = ? WHERE id = ?")
			.bind(email ? "sent" : "not_requested", new Date().toISOString(), submissionId).run();
	} catch (error) {
		console.error("Form email delivery failed", { submissionId });
		await database.prepare("UPDATE form_submissions SET notification_status = 'failed', status = 'email_failed', updated_at = ? WHERE id = ?")
			.bind(new Date().toISOString(), submissionId).run();
		return c.json({ ok: false, error: "Your request was saved, but email delivery is temporarily unavailable." }, 502, cors);
	}

	return c.json({ ok: true }, 200, { ...cors, "Content-Type": "application/json" });
}
