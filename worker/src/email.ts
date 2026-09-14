type EmailEnv = {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  RESEND_FROM_NAME?: string;
};

type ResendMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
  idempotencyKey: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendEmail(env: EmailEnv, message: ResendMessage): Promise<void> {
  if (!env.RESEND_API_KEY || !env.RESEND_FROM_EMAIL || !env.RESEND_FROM_NAME) {
    throw new Error("Email service is not configured.");
  }
  if (!EMAIL_PATTERN.test(message.to) || (message.replyTo && !EMAIL_PATTERN.test(message.replyTo))) {
    throw new Error("Email address is invalid.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
      "Idempotency-Key": message.idempotencyKey,
    },
    body: JSON.stringify({
      from: `${env.RESEND_FROM_NAME} <${env.RESEND_FROM_EMAIL}>`,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    console.error("Resend rejected email", { status: response.status, idempotencyKey: message.idempotencyKey });
    throw new Error("Email delivery failed.");
  }
}