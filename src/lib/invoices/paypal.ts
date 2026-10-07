// PayPal Orders v2 over plain fetch. Venmo uses the same orders; it is
// offered by the JS SDK buttons on the pay page (enable-funding=venmo).

import type { Invoice } from "./db";
import { toDecimalString } from "./money";

interface PayPalConfig {
	PAYPAL_API_BASE: string;
	PAYPAL_CLIENT_ID: string;
	PAYPAL_CLIENT_SECRET: string;
}

async function accessToken(env: PayPalConfig): Promise<string> {
	const res = await fetch(`${env.PAYPAL_API_BASE}/v1/oauth2/token`, {
		method: "POST",
		headers: {
			Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: "grant_type=client_credentials",
	});
	const body = (await res.json()) as { access_token?: string };
	if (!res.ok || !body.access_token) throw new Error(`PayPal auth failed (${res.status})`);
	return body.access_token;
}

async function call<T>(env: PayPalConfig, path: string, init: { method: string; body?: unknown }): Promise<T> {
	const token = await accessToken(env);
	const res = await fetch(`${env.PAYPAL_API_BASE}${path}`, {
		method: init.method,
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: init.body === undefined ? undefined : JSON.stringify(init.body),
	});
	const text = await res.text();
	if (!res.ok) throw new Error(`PayPal ${init.method} ${path} failed (${res.status}): ${text.slice(0, 500)}`);
	return (text ? JSON.parse(text) : {}) as T;
}

export interface PayPalOrder {
	id: string;
	status: string;
	purchase_units?: { custom_id?: string; amount?: { currency_code: string; value: string } }[];
}

/** Creates an order for the invoice's amount; returns the order ID for the SDK. */
export async function createOrder(env: PayPalConfig, invoice: Invoice): Promise<string> {
	const order = await call<PayPalOrder>(env, "/v2/checkout/orders", {
		method: "POST",
		body: {
			intent: "CAPTURE",
			purchase_units: [
				{
					// custom_id comes back on the capture webhook; invoice_id makes
					// PayPal itself refuse a second completed payment for this invoice.
					custom_id: invoice.id,
					invoice_id: invoice.id,
					description: invoice.description.slice(0, 127),
					amount: {
						currency_code: invoice.currency,
						value: toDecimalString(invoice.amount_cents),
					},
				},
			],
		},
	});
	return order.id;
}

export async function getOrder(env: PayPalConfig, orderId: string): Promise<PayPalOrder> {
	return call<PayPalOrder>(env, `/v2/checkout/orders/${encodeURIComponent(orderId)}`, { method: "GET" });
}

export async function captureOrder(env: PayPalConfig, orderId: string): Promise<PayPalOrder> {
	return call<PayPalOrder>(env, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
		method: "POST",
	});
}

/**
 * Asks PayPal whether a webhook delivery is genuine. PayPal checks the
 * signature headers against the event body and our webhook ID.
 */
export async function verifyWebhook(
	env: PayPalConfig & { PAYPAL_WEBHOOK_ID: string },
	headers: Headers,
	event: unknown,
): Promise<boolean> {
	const get = (name: string) => headers.get(name);
	const fields = {
		auth_algo: get("paypal-auth-algo"),
		cert_url: get("paypal-cert-url"),
		transmission_id: get("paypal-transmission-id"),
		transmission_sig: get("paypal-transmission-sig"),
		transmission_time: get("paypal-transmission-time"),
	};
	if (!env.PAYPAL_WEBHOOK_ID || Object.values(fields).some((v) => !v)) return false;

	const result = await call<{ verification_status?: string }>(
		env,
		"/v1/notifications/verify-webhook-signature",
		{ method: "POST", body: { ...fields, webhook_id: env.PAYPAL_WEBHOOK_ID, webhook_event: event } },
	);
	return result.verification_status === "SUCCESS";
}

/** The parts of a PAYMENT.CAPTURE.COMPLETED event this site reads. */
export interface PayPalCaptureEvent {
	id: string;
	event_type: string;
	resource: {
		id: string;
		status?: string;
		custom_id?: string;
		amount?: { currency_code: string; value: string };
	};
}
