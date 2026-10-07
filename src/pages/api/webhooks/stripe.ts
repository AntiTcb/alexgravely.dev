import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleVerifiedPayment } from "../../../lib/invoices/payments";
import { type StripeCheckoutEvent, verifyStripeEvent } from "../../../lib/invoices/stripe";

// Configure in the Stripe dashboard for checkout.session.completed and
// checkout.session.async_payment_succeeded.
const PAID_EVENTS = new Set(["checkout.session.completed", "checkout.session.async_payment_succeeded"]);

export const POST: APIRoute = async ({ request, url }) => {
	const raw = await request.text();
	const event = await verifyStripeEvent<StripeCheckoutEvent>(
		raw,
		request.headers.get("Stripe-Signature"),
		env.STRIPE_WEBHOOK_SECRET,
	);
	if (!event) return new Response("Invalid signature", { status: 400 });

	const session = event.data?.object;
	// Ignore other events, and completed sessions whose money hasn't arrived
	// yet (async methods send async_payment_succeeded later).
	if (!PAID_EVENTS.has(event.type) || session?.object !== "checkout.session" || session.payment_status !== "paid") {
		return new Response("Ignored", { status: 200 });
	}

	const invoiceId = session.metadata?.invoice_id ?? session.client_reference_id;
	if (!invoiceId || session.amount_total == null || !session.currency) {
		console.error("[webhooks/stripe] session missing invoice or amount", session.id);
		return new Response("Ignored", { status: 200 });
	}

	const outcome = await handleVerifiedPayment(env, url.origin, {
		provider: "stripe",
		eventId: event.id,
		eventType: event.type,
		invoiceId,
		providerTxn: session.payment_intent ?? session.id,
		amountCents: session.amount_total,
		currency: session.currency.toUpperCase(),
	});
	return Response.json({ outcome });
};
