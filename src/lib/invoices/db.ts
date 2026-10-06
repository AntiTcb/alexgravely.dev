// Invoice storage in D1 (tables in migrations/0001_invoices.sql).

export type InvoiceStatus = "open" | "paid" | "void";
export type Provider = "stripe" | "paypal";

export interface Invoice {
	id: string;
	token: string;
	client_name: string;
	client_email: string | null;
	description: string;
	amount_cents: number;
	currency: string;
	status: InvoiceStatus;
	due_date: string | null;
	provider: Provider | null;
	provider_txn: string | null;
	paid_at: string | null;
	emailed_at: string | null;
	created_at: string;
}

export interface PaymentEvent {
	id: number;
	invoice_id: string;
	provider: Provider;
	event_id: string;
	event_type: string;
	provider_txn: string | null;
	amount_cents: number | null;
	currency: string | null;
	applied: number;
	received_at: string;
}

/** 32 random bytes, base64url: the secret part of a /pay link. */
function newToken(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(32));
	let binary = "";
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export async function getInvoiceByToken(db: D1Database, token: string): Promise<Invoice | null> {
	// Skip the query for anything that can't be a token.
	if (!TOKEN_RE.test(token)) return null;
	return db.prepare("SELECT * FROM invoices WHERE token = ?").bind(token).first<Invoice>();
}

export async function getInvoice(db: D1Database, id: string): Promise<Invoice | null> {
	return db.prepare("SELECT * FROM invoices WHERE id = ?").bind(id).first<Invoice>();
}

export async function listInvoices(db: D1Database): Promise<Invoice[]> {
	const { results } = await db
		.prepare("SELECT * FROM invoices ORDER BY created_at DESC, rowid DESC")
		.all<Invoice>();
	return results;
}

export interface NewInvoice {
	client_name: string;
	client_email: string | null;
	description: string;
	amount_cents: number;
	currency?: string;
	due_date: string | null;
}

export async function createInvoice(db: D1Database, input: NewInvoice): Promise<Invoice> {
	const invoice = await db
		.prepare(
			`INSERT INTO invoices (id, token, client_name, client_email, description, amount_cents, currency, due_date)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)
			 RETURNING *`,
		)
		.bind(
			crypto.randomUUID(),
			newToken(),
			input.client_name,
			input.client_email,
			input.description,
			input.amount_cents,
			input.currency ?? "USD",
			input.due_date,
		)
		.first<Invoice>();
	if (!invoice) throw new Error("Invoice insert returned no row");
	return invoice;
}

/** Voids an open invoice. Returns false if it wasn't open. */
export async function voidInvoice(db: D1Database, id: string): Promise<boolean> {
	const result = await db
		.prepare("UPDATE invoices SET status = 'void' WHERE id = ? AND status = 'open'")
		.bind(id)
		.run();
	return result.meta.changes > 0;
}

export async function markEmailed(db: D1Database, id: string): Promise<void> {
	await db.prepare("UPDATE invoices SET emailed_at = datetime('now') WHERE id = ?").bind(id).run();
}

export interface VerifiedPayment {
	provider: Provider;
	/** Provider's event ID, used to ignore replays. */
	eventId: string;
	eventType: string;
	invoiceId: string;
	/** Stripe PaymentIntent ID or PayPal capture ID. */
	providerTxn: string;
	amountCents: number;
	currency: string;
}

export type PaymentOutcome =
	/** The invoice was open and is now paid. */
	| "applied"
	/** Same event ID seen before; nothing changed. */
	| "duplicate"
	/** Recorded but not applied: already paid by another payment, void, or the amount didn't match. Needs a human. */
	| "needs_review"
	/** Recorded but not applied: a second event for the payment that already paid this invoice. */
	| "already_applied"
	/** No invoice with that ID. */
	| "unknown_invoice";

/**
 * Records a verified, completed payment and marks the invoice paid if it is
 * still open and the amount and currency match exactly. Safe to call more
 * than once per event: replays are ignored.
 */
export async function recordPayment(db: D1Database, p: VerifiedPayment): Promise<PaymentOutcome> {
	const invoice = await getInvoice(db, p.invoiceId);
	if (!invoice) return "unknown_invoice";

	// One transaction: the conditional update, then the event row whose
	// `applied` flag is the update's change count. The update is skipped if
	// this event was already recorded, and the insert is a no-op on replay.
	const [update, insert] = await db.batch([
		db
			.prepare(
				`UPDATE invoices
				 SET status = 'paid', provider = ?, provider_txn = ?, paid_at = datetime('now')
				 WHERE id = ? AND status = 'open' AND amount_cents = ? AND currency = ?
				   AND NOT EXISTS (SELECT 1 FROM payment_events WHERE provider = ? AND event_id = ?)`,
			)
			.bind(p.provider, p.providerTxn, p.invoiceId, p.amountCents, p.currency, p.provider, p.eventId),
		db
			.prepare(
				`INSERT INTO payment_events
				   (invoice_id, provider, event_id, event_type, provider_txn, amount_cents, currency, applied)
				 VALUES (?, ?, ?, ?, ?, ?, ?, changes())
				 ON CONFLICT (provider, event_id) DO NOTHING`,
			)
			.bind(p.invoiceId, p.provider, p.eventId, p.eventType, p.providerTxn, p.amountCents, p.currency),
	]);

	if (insert.meta.changes === 0) return "duplicate";
	if (update.meta.changes > 0) return "applied";
	if (invoice.provider === p.provider && invoice.provider_txn === p.providerTxn) return "already_applied";
	return "needs_review";
}

export interface ReviewItem extends PaymentEvent {
	client_name: string;
	invoice_status: InvoiceStatus;
	invoice_amount_cents: number;
	invoice_currency: string;
}

/**
 * Verified payments that did not mark their invoice paid and are not just a
 * second notice for the payment that did: double payments, payments on void
 * invoices, and amount mismatches. These need a manual refund or follow-up.
 */
export async function listPaymentsNeedingReview(db: D1Database): Promise<ReviewItem[]> {
	const { results } = await db
		.prepare(
			`SELECT e.*, i.client_name, i.status AS invoice_status,
			        i.amount_cents AS invoice_amount_cents, i.currency AS invoice_currency
			 FROM payment_events e JOIN invoices i ON i.id = e.invoice_id
			 WHERE e.applied = 0
			   AND NOT (e.provider IS i.provider AND e.provider_txn IS i.provider_txn)
			 ORDER BY e.received_at DESC`,
		)
		.all<ReviewItem>();
	return results;
}
