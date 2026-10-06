import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { getInvoiceByToken } from "../../../lib/invoices/db";
import { createCheckoutSession } from "../../../lib/invoices/stripe";

// Form POST from /pay/[token]. The browser sends only the token; the amount
// and description come from the database.
export const POST: APIRoute = async ({ request, url, redirect }) => {
	const form = await request.formData();
	const token = String(form.get("token") ?? "");
	const invoice = await getInvoiceByToken(env.DB, token);
	if (!invoice) return new Response("Not found", { status: 404 });

	const page = `${url.origin}/pay/${invoice.token}`;
	if (invoice.status !== "open") return redirect(page, 303);

	try {
		const checkoutUrl = await createCheckoutSession(env, invoice, {
			success: `${page}?paid=1`,
			cancel: `${page}?cancelled=1`,
		});
		return redirect(checkoutUrl, 303);
	} catch (error) {
		console.error("[pay/stripe]", error);
		return redirect(`${page}?error=stripe`, 303);
	}
};
