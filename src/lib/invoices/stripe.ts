// Stripe over plain fetch: Checkout Sessions and webhook verification.
// Webhook signatures are checked with Web Crypto, which Workers support
// natively (Stripe's Node verifier relies on node:crypto).

import type { Invoice } from "./db";

interface StripeConfig {
	STRIPE_API_BASE: string;
	STRIPE_SECRET_KEY: string;
}

/** Creates a Checkout Session for the invoice and returns its hosted URL. */
export async function createCheckoutSession(
	env: StripeConfig,
	invoice: Invoice,
	urls: { success: string; cancel: string },
): Promise<string> {
	// Everything here comes from the database row, never from the browser.
	const form = new URLSearchParams({
		mode: "payment",
		success_url: urls.success,
		cancel_url: urls.cancel,
		client_reference_id: invoice.id,
		"metadata[invoice_id]": invoice.id,
		"payment_intent_data[metadata][invoice_id]": invoice.id,
		"payment_intent_data[description]": invoice.description,
		"line_items[0][quantity]": "1",
		"line_items[0][price_data][currency]": invoice.currency.toLowerCase(),
		"line_items[0][price_data][unit_amount]": String(invoice.amount_cents),
		"line_items[0][price_data][product_data][name]": invoice.description,
	});
	if (invoice.client_email) form.set("customer_email", invoice.client_email);

	const res = await fetch(`${env.STRIPE_API_BASE}/v1/checkout/sessions`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: form,
	});
	const body = (await res.json()) as { url?: string; error?: { message?: string } };
	if (!res.ok || !body.url) {
		throw new Error(`Stripe Checkout Session failed (${res.status}): ${body.error?.message ?? "no URL"}`);
	}
	return body.url;
}

const encoder = new TextEncoder();

function hexToBytes(hex: string): Uint8Array<ArrayBuffer> | null {
	if (!/^(?:[0-9a-f]{2})+$/i.test(hex)) return null;
	const out = new Uint8Array(new ArrayBuffer(hex.length / 2));
	for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
	return out;
}

/**
 * Verifies a `Stripe-Signature` header against the raw request body.
 * Returns the parsed event, or null if the signature is missing, wrong, or
 * older than `toleranceSeconds`.
 */
export async function verifyStripeEvent<T = unknown>(
	rawBody: string,
	header: string | null,
	secret: string,
	toleranceSeconds = 300,
	nowSeconds = Math.floor(Date.now() / 1000),
): Promise<T | null> {
	if (!header || !secret) return null;

	let timestamp: number | undefined;
	const signatures: string[] = [];
	for (const part of header.split(",")) {
		const [key, value] = part.split("=", 2);
		if (key === "t") timestamp = Number(value);
		else if (key === "v1" && value) signatures.push(value);
	}
	if (!timestamp || !Number.isFinite(timestamp) || signatures.length === 0) return null;
	if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) return null;

	const key = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["verify"],
	);
	const signed = encoder.encode(`${timestamp}.${rawBody}`);
	for (const sig of signatures) {
		const bytes = hexToBytes(sig);
		// crypto.subtle.verify compares in constant time.
		if (bytes && (await crypto.subtle.verify("HMAC", key, bytes, signed))) {
			return JSON.parse(rawBody) as T;
		}
	}
	return null;
}

/** The parts of a Checkout Session event this site reads. */
export interface StripeCheckoutEvent {
	id: string;
	type: string;
	data: {
		object: {
			id: string;
			object: string;
			payment_status?: string;
			amount_total?: number | null;
			currency?: string | null;
			payment_intent?: string | null;
			client_reference_id?: string | null;
			metadata?: Record<string, string> | null;
		};
	};
}
