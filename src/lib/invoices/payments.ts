// What both webhooks do once a payment is verified.

import { getInvoice, recordPayment, type PaymentOutcome, type VerifiedPayment } from "./db";
import { sendOwnerNotice, sendReceiptEmail } from "./email";

/**
 * Records the payment and sends the receipt and owner notices. Email failures
 * are logged, not thrown: the payment is already recorded, and a webhook
 * error would only make the provider retry a delivery we've handled.
 */
export async function handleVerifiedPayment(
	env: Env,
	origin: string,
	payment: VerifiedPayment,
): Promise<PaymentOutcome> {
	const outcome = await recordPayment(env.DB, payment);
	console.log(`[payments] ${payment.provider} ${payment.eventId} -> ${outcome}`);

	if (outcome === "applied" || outcome === "needs_review") {
		const invoice = await getInvoice(env.DB, payment.invoiceId);
		if (invoice) {
			const sends =
				outcome === "applied"
					? [sendReceiptEmail(env, origin, invoice), sendOwnerNotice(env, origin, invoice, payment, "paid")]
					: [sendOwnerNotice(env, origin, invoice, payment, "needs_review")];
			for (const result of await Promise.allSettled(sends)) {
				if (result.status === "rejected") console.error("[payments] email failed:", result.reason);
			}
		}
	}
	return outcome;
}
