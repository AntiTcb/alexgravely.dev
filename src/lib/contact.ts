import { type EmailConfig, emailLayout, escapeHtml, sendEmail } from "./email";

export interface ContactInput {
	name: string;
	email: string;
	subject: string | null;
	message: string;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const LIMITS = { name: 200, email: 254, subject: 200, message: 5000 };

/** Returns the cleaned input, or an error message for the visitor. */
export function parseContactForm(form: FormData): ContactInput | string {
	const get = (key: string) => String(form.get(key) ?? "").trim();
	const input = {
		name: get("name"),
		email: get("email"),
		subject: get("subject") || null,
		message: get("message"),
	};
	if (!input.name || !input.email || !input.message) return "Please fill in your name, email, and message.";
	if (!EMAIL_RE.test(input.email)) return "Please check your email address.";
	if (
		input.name.length > LIMITS.name ||
		input.email.length > LIMITS.email ||
		(input.subject?.length ?? 0) > LIMITS.subject ||
		input.message.length > LIMITS.message
	) {
		return "That message is too long.";
	}
	return input;
}

/** Checks a Turnstile token with Cloudflare. */
export async function verifyTurnstile(secret: string, token: string, ip: string | null): Promise<boolean> {
	if (!token) return false;
	const body = new FormData();
	body.set("secret", secret);
	body.set("response", token);
	if (ip) body.set("remoteip", ip);
	const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
	const result = (await res.json()) as { success?: boolean };
	return result.success === true;
}

export async function saveContactMessage(db: D1Database, input: ContactInput): Promise<number> {
	const row = await db
		.prepare("INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?) RETURNING id")
		.bind(input.name, input.email, input.subject, input.message)
		.first<{ id: number }>();
	if (!row) throw new Error("Contact insert returned no row");
	return row.id;
}

export async function markContactEmailed(db: D1Database, id: number): Promise<void> {
	await db.prepare("UPDATE contact_messages SET emailed = 1 WHERE id = ?").bind(id).run();
}

/** Forwards a message to Alex, with Reply-To set to the visitor. */
export async function sendContactNotice(env: EmailConfig, input: ContactInput): Promise<void> {
	const subject = `Contact form: ${input.subject ?? `message from ${input.name}`}`;
	await sendEmail(env, {
		to: env.NOTIFY_EMAIL,
		replyTo: input.email,
		subject: subject.slice(0, 200),
		text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
		html: emailLayout(
			`<p><strong>From:</strong> ${escapeHtml(input.name)} &lt;${escapeHtml(input.email)}&gt;</p>
			<p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`,
		),
	});
}
