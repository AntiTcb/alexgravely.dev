import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
	markContactEmailed,
	parseContactForm,
	saveContactMessage,
	sendContactNotice,
	verifyTurnstile,
} from "../../lib/contact";

// Form POST from /contact. It's a public form, so no origin check: spam is
// handled by the honeypot and, when configured, Turnstile.
export const POST: APIRoute = async ({ request, redirect }) => {
	const form = await request.formData();
	const back = (params: Record<string, string>) => redirect(`/contact?${new URLSearchParams(params)}#form`, 303);

	// Honeypot: real visitors never see or fill this field. Pretend success.
	if (String(form.get("website") ?? "") !== "") return back({ sent: "1" });

	if (env.TURNSTILE_SITE_KEY) {
		const ok =
			!!env.TURNSTILE_SECRET_KEY &&
			(await verifyTurnstile(
				env.TURNSTILE_SECRET_KEY,
				String(form.get("cf-turnstile-response") ?? ""),
				request.headers.get("CF-Connecting-IP"),
			).catch(() => false));
		if (!ok) return back({ error: "Please complete the verification and try again." });
	}

	const input = parseContactForm(form);
	if (typeof input === "string") return back({ error: input });

	const id = await saveContactMessage(env.DB, input);
	try {
		await sendContactNotice(env, input);
		await markContactEmailed(env.DB, id);
	} catch (error) {
		// Saved in D1 either way; the email is a convenience.
		console.error("[contact] email failed", error);
	}
	return back({ sent: "1" });
};
