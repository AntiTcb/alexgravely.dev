// Outgoing email through Cloudflare Email Sending (the EMAIL send_email binding).

export interface EmailConfig {
	EMAIL: SendEmail;
	EMAIL_FROM: string;
	EMAIL_FROM_NAME: string;
	NOTIFY_EMAIL: string;
}

export interface Message {
	to: string;
	subject: string;
	text: string;
	html: string;
	/** Defaults to NOTIFY_EMAIL, so replies reach Alex. */
	replyTo?: string;
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

/** Wraps an HTML body in a minimal, email-client-friendly page. */
export function emailLayout(bodyHtml: string): string {
	return `<!doctype html><html><body style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#222;max-width:560px;margin:0 auto;padding:16px">${bodyHtml}</body></html>`;
}

export async function sendEmail(env: EmailConfig, message: Message): Promise<void> {
	await env.EMAIL.send({
		from: { email: env.EMAIL_FROM, name: env.EMAIL_FROM_NAME },
		replyTo: message.replyTo ?? (env.NOTIFY_EMAIL || undefined),
		to: message.to,
		subject: message.subject,
		text: message.text,
		html: message.html,
	});
}
