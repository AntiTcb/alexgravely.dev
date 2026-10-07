import type { AstroGlobal } from "astro";

/** EmDash's ADMIN role level (@emdash-cms/auth Role.ADMIN). */
const ADMIN_ROLE = 50;

/**
 * Gate for site pages that only Alex may use. Reuses the EmDash admin login:
 * EmDash's middleware puts the signed-in user on `locals.user` for every
 * route. Returns a redirect to the EmDash login (or a 403) when not allowed,
 * otherwise null.
 */
export function requireAdmin(Astro: AstroGlobal): Response | null {
	const user = Astro.locals.user;
	if (!user) {
		const login = new URL("/_emdash/admin/login", Astro.url);
		login.searchParams.set("redirect", Astro.url.pathname + Astro.url.search);
		return Astro.redirect(login.pathname + login.search);
	}
	if (user.role < ADMIN_ROLE) {
		return new Response("Forbidden", { status: 403 });
	}
	return null;
}

/** True if a state-changing request came from this site (CSRF check). */
export function isSameOrigin(request: Request, url: URL): boolean {
	const origin = request.headers.get("Origin");
	return origin !== null && origin === url.origin;
}
