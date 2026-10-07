import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getInvoiceByToken } from "../../../../lib/invoices/db";
import { createOrder } from "../../../../lib/invoices/paypal";

// Called by the PayPal buttons. Body: { token }. Returns { id } (the order ID).
export const POST: APIRoute = async ({ request }) => {
	const { token } = (await request.json().catch(() => ({}))) as { token?: unknown };
	const invoice = await getInvoiceByToken(env.DB, String(token ?? ""));
	if (!invoice) return Response.json({ error: "not_found" }, { status: 404 });
	if (invoice.status !== "open") return Response.json({ error: invoice.status }, { status: 409 });

	try {
		return Response.json({ id: await createOrder(env, invoice) });
	} catch (error) {
		console.error("[pay/paypal/create]", error);
		return Response.json({ error: "paypal_error" }, { status: 502 });
	}
};
