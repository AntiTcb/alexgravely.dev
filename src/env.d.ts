// Secrets aren't in wrangler.jsonc, so `wrangler types` can't see them.
declare namespace Cloudflare {
	interface Env {
		STRIPE_SECRET_KEY: string;
		STRIPE_WEBHOOK_SECRET: string;
		PAYPAL_CLIENT_SECRET: string;
		PAYPAL_WEBHOOK_ID: string;
	}
}
