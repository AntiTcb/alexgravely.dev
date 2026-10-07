// CMS datetime fields arrive as ISO strings at midnight UTC, so read their
// calendar parts in UTC.

type DateInput = string | Date;

function toDate(value: DateInput): Date {
	return value instanceof Date ? value : new Date(value);
}

/** "January 2022" */
export function formatMonthYear(value: DateInput): string {
	return toDate(value).toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
}

/** "January 2022 - Present", or "May 2013 - September 2013" */
export function formatRange(start: DateInput, end?: DateInput | null): string {
	return `${formatMonthYear(start)} - ${end ? formatMonthYear(end) : "Present"}`;
}

/** "2008-01-01", for passing a calendar date to client code. */
export function toDateOnly(value: DateInput): string {
	return toDate(value).toISOString().slice(0, 10);
}

/** Whole years from `birth` to `now`. */
export function ageOn(birth: DateInput, now = new Date()): number {
	const b = toDate(birth);
	let age = now.getUTCFullYear() - b.getUTCFullYear();
	const beforeBirthday =
		now.getUTCMonth() < b.getUTCMonth() ||
		(now.getUTCMonth() === b.getUTCMonth() && now.getUTCDate() < b.getUTCDate());
	if (beforeBirthday) age--;
	return age;
}

/** The earliest of the given dates, ignoring missing ones. */
export function earliest(values: (DateInput | null | undefined)[]): Date | undefined {
	const times = values.filter((v): v is DateInput => v != null).map((v) => toDate(v).getTime());
	return times.length > 0 ? new Date(Math.min(...times)) : undefined;
}
