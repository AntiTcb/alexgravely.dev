// Secrets come from .dev.vars.example via `pnpm cf-typegen`. This one is
// optional (only needed when TURNSTILE_SITE_KEY is set), so it's declared here.
declare namespace Cloudflare {
	interface Env {
		TURNSTILE_SECRET_KEY?: string;
	}
}
