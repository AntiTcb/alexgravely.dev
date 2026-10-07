import { getEmDashCollection, getEmDashEntry } from "emdash";

/** The single profile entry (slug "main"). */
export async function getProfile() {
	const { entry, error } = await getEmDashEntry("profile", "main");
	if (error) throw error;
	return entry;
}

interface PortfolioOptions {
	/** Only entries marked "Featured". */
	featured?: boolean;
	/** Only entries marked "Show on résumé". */
	resume?: boolean;
}

/**
 * Portfolio sites, in sort order. Every page that lists the portfolio should
 * go through this, so adding an entry in the CMS updates the whole site.
 */
export async function getPortfolio({ featured, resume }: PortfolioOptions = {}) {
	const { entries, error } = await getEmDashCollection("portfolio", {
		orderBy: { sort_order: "asc", name: "asc" },
	});
	if (error) throw error;
	// Filtered here rather than with `where`, whose public type only covers
	// string values. The collection is small enough that this costs nothing.
	return entries.filter(
		(e) => (!featured || e.data.featured) && (!resume || e.data.show_on_resume),
	);
}

export type PortfolioEntry = Awaited<ReturnType<typeof getPortfolio>>[number];

/** Editable title and intro for a site page ("projects", "services", ...). */
export async function getPageText(slug: string) {
	const { entry, error } = await getEmDashEntry("pages", slug);
	if (error) throw error;
	return entry;
}

export async function getServices() {
	const { entries, error } = await getEmDashCollection("services", {
		orderBy: { sort_order: "asc", title: "asc" },
	});
	if (error) throw error;
	return entries;
}
