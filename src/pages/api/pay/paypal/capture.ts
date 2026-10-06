import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getInvoiceByToken } from "../../../../lib/invoices/db";
import { captureOrder, getOrder } from "../../../../lib/invoices/paypal";

// Called by the PayPal buttons after the client approves. Body: { token, orderId }.
// Capturing moves the money; the invoice is marked paid only by the verified
// PAYMENT.CAPTURE.COMPLETED webhook.
export const POST: APIRoute = async ({ request }) => {
	const body = (await request.json().catch(() => ({}))) as { token?: unknown; orderId?: unknown };
	const invoice = await getInvoiceByToken(env.DB, String(body.token ?? ""));
	if (!invoice) return Response.json({ error: "not_found" }, { status: 404 });
	// Don't take a second payment for an invoice that is already settled.
	if (invoice.status !== "open") return Response.json({ error: invoice.status }, { status: 409 });

	const orderId = String(body.orderId ?? "");
	if (!/^[A-Z0-9]{5,32}$/.test(orderId)) return Response.json({ error: "bad_order" }, { status: 400 });

	try {
		// The order must be one we created for this invoice.
		const order = await getOrder(env, orderId);
		if (order.purchase_units?.[0]?.custom_id !== invoice.id) {
			return Response.json({ error: "order_mismatch" }, { status: 400 });
		}
		const captured = await captureOrder(env, orderId);
		return Response.json({ status: captured.status });
	} catch (error) {
		console.error("[pay/paypal/capture]", error);
		return Response.json({ error: "paypal_error" }, { status: 502 });
	}
};
