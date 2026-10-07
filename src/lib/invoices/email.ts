// Invoice emails: the link to pay, the client's receipt, and notices to Alex.

import { type EmailConfig, emailLayout as layout, escapeHtml, sendEmail as send } from "../email";
import type { Invoice, VerifiedPayment } from "./db";
import { formatMoney } from "./money";

function payUrl(origin: string, invoice: Invoice): string {
	return `${origin}/pay/${invoice.token}`;
}

/** Emails the client their invoice link. */
export async function sendInvoiceEmail(env: EmailConfig, origin: string, invoice: Invoice): Promise<void> {
	if (!invoice.client_email) throw new Error("Invoice has no client email");
	const amount = formatMoney(invoice.amount_cents, invoice.currency);
	const url = payUrl(origin, invoice);
	const due = invoice.due_date ? `Due ${invoice.due_date}.` : "";
	await send(env, {
		to: invoice.client_email,
		subject: `Invoice from ${env.EMAIL_FROM_NAME}: ${amount}`,
		text: [
			`Hi ${invoice.client_name},`,
			"",
			`Here is your invoice for ${invoice.description}: ${amount}. ${due}`.trim(),
			"",
			`View and pay it here: ${url}`,
			"",
			"You can pay by card, PayPal, or Venmo.",
			"",
			env.EMAIL_FROM_NAME,
		].join("\n"),
		html: layout(
			`<p>Hi ${escapeHtml(invoice.client_name)},</p>
			<p>Here is your invoice for <strong>${escapeHtml(invoice.description)}</strong>: <strong>${amount}</strong>. ${escapeHtml(due)}</p>
			<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:10px 18px;background:#2f8f2f;color:#fff;text-decoration:none;border-radius:6px">View and pay invoice</a></p>
			<p>You can pay by card, PayPal, or Venmo.</p>
			<p>${escapeHtml(env.EMAIL_FROM_NAME)}</p>`,
		),
	});
}

/** Emails the client a receipt after their payment is applied. */
export async function sendReceiptEmail(env: EmailConfig, origin: string, invoice: Invoice): Promise<void> {
	if (!invoice.client_email) return;
	const amount = formatMoney(invoice.amount_cents, invoice.currency);
	const method = invoice.provider === "paypal" ? "PayPal" : "card (Stripe)";
	const url = payUrl(origin, invoice);
	await send(env, {
		to: invoice.client_email,
		subject: `Receipt: ${amount} paid to ${env.EMAIL_FROM_NAME}`,
		text: [
			`Hi ${invoice.client_name},`,
			"",
			`Thank you. Your payment of ${amount} for ${invoice.description} was received via ${method}.`,
			`Reference: ${invoice.provider_txn ?? invoice.id}`,
			"",
			`Invoice: ${url}`,
			"",
			env.EMAIL_FROM_NAME,
		].join("\n"),
		html: layout(
			`<p>Hi ${escapeHtml(invoice.client_name)},</p>
			<p>Thank you. Your payment of <strong>${amount}</strong> for ${escapeHtml(invoice.description)} was received via ${method}.</p>
			<p>Reference: ${escapeHtml(invoice.provider_txn ?? invoice.id)}</p>
			<p><a href="${escapeHtml(url)}">View invoice</a></p>
			<p>${escapeHtml(env.EMAIL_FROM_NAME)}</p>`,
		),
	});
}

/** Tells Alex an invoice was paid, or that a payment needs a manual refund or check. */
export async function sendOwnerNotice(
	env: EmailConfig,
	origin: string,
	invoice: Invoice,
	payment: VerifiedPayment,
	kind: "paid" | "needs_review",
): Promise<void> {
	if (!env.NOTIFY_EMAIL) return;
	const paid = formatMoney(payment.amountCents, payment.currency);
	const subject =
		kind === "paid"
			? `Paid: ${invoice.client_name} ${paid} via ${payment.provider}`
			: `Action needed: unapplied ${payment.provider} payment from ${invoice.client_name}`;
	const detail =
		kind === "paid"
			? `${invoice.client_name} paid ${paid} for "${invoice.description}" via ${payment.provider}.`
			: `A verified ${payment.provider} payment of ${paid} (${payment.providerTxn}) was not applied to the invoice for ${invoice.client_name} (status: ${invoice.status}, amount due: ${formatMoney(invoice.amount_cents, invoice.currency)}). It may be a double payment or an amount mismatch, and may need a manual refund.`;
	const admin = `${origin}/admin/invoices`;
	await send(env, {
		to: env.NOTIFY_EMAIL,
		subject,
		text: `${detail}\n\n${admin}`,
		html: layout(`<p>${escapeHtml(detail)}</p><p><a href="${escapeHtml(admin)}">Open invoices admin</a></p>`),
	});
}
