import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { fromDecimalString } from "../../../lib/invoices/money";
import { handleVerifiedPayment } from "../../../lib/invoices/payments";
import { type PayPalCaptureEvent, verifyWebhook } from "../../../lib/invoices/paypal";

// Configure in the PayPal developer dashboard for PAYMENT.CAPTURE.COMPLETED.
export const POST: APIRoute = async ({ request, url }) => {
	let event: PayPalCaptureEvent;
	try {
		event = (await request.json()) as PayPalCaptureEvent;
	} catch {
		return new Response("Bad request", { status: 400 });
	}

	let verified = false;
	try {
		verified = await verifyWebhook(env, request.headers, event);
	} catch (error) {
		// PayPal unreachable: fail so PayPal retries the delivery later.
		console.error("[webhooks/paypal] verification call failed", error);
		return new Response("Verification unavailable", { status: 503 });
	}
	if (!verified) return new Response("Invalid signature", { status: 400 });

	if (event.event_type !== "PAYMENT.CAPTURE.COMPLETED") return new Response("Ignored", { status: 200 });

	const capture = event.resource;
	const amountCents = capture?.amount ? fromDecimalString(capture.amount.value) : Number.NaN;
	if (!capture?.custom_id || !capture.id || !Number.isInteger(amountCents)) {
		console.error("[webhooks/paypal] capture missing invoice or amount", event.id);
		return new Response("Ignored", { status: 200 });
	}

	const outcome = await handleVerifiedPayment(env, url.origin, {
		provider: "paypal",
		eventId: event.id,
		eventType: event.event_type,
		invoiceId: capture.custom_id,
		providerTxn: capture.id,
		amountCents,
		currency: capture.amount!.currency_code.toUpperCase(),
	});
	return Response.json({ outcome });
};
