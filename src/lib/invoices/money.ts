/** "$1,234.50" */
export function formatMoney(cents: number, currency: string): string {
	return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

/** Cents to a PayPal amount string: 123450 -> "1234.50". */
export function toDecimalString(cents: number): string {
	return (cents / 100).toFixed(2);
}

/** A PayPal amount string to cents: "1234.50" -> 123450. NaN if malformed. */
export function fromDecimalString(value: string): number {
	return /^\d+(\.\d{1,2})?$/.test(value) ? Math.round(Number(value) * 100) : Number.NaN;
}

/** Parses an admin-entered amount like "1,234.5" or "$80" into cents, or null. */
export function parseAmountInput(input: string): number | null {
	const cleaned = input.replace(/[$,\s]/g, "");
	const cents = fromDecimalString(cleaned);
	return Number.isInteger(cents) && cents > 0 ? cents : null;
}
