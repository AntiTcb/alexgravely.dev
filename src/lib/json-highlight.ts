// Server-side JSON syntax highlighting for the home page. Produces
// highlight.js-style class names, and turns URL and email strings into links.

const TOKEN =
	/("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],])/g;

const URL_RE = /^https?:\/\//;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

function escapeHtml(text: string): string {
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function stringToken(raw: string): string {
	const value = JSON.parse(raw) as string;
	const shown = escapeHtml(raw);
	let href: string | undefined;
	if (URL_RE.test(value)) href = value;
	else if (EMAIL_RE.test(value)) href = `mailto:${value}`;
	const inner = href
		? `<a href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${shown}</a>`
		: shown;
	return `<span class="hljs-string">${inner}</span>`;
}

export function highlightJson(value: unknown): string {
	const source = JSON.stringify(value, null, 2);
	let html = "";
	let last = 0;
	for (const m of source.matchAll(TOKEN)) {
		html += escapeHtml(source.slice(last, m.index));
		const [whole, str, colon, num, literal, punct] = m;
		if (str !== undefined && colon !== undefined) {
			html += `<span class="hljs-attr">${escapeHtml(str)}</span>${colon}`;
		} else if (str !== undefined) {
			html += stringToken(str);
		} else if (num !== undefined) {
			html += `<span class="hljs-number">${num}</span>`;
		} else if (literal !== undefined) {
			html += `<span class="hljs-literal">${literal}</span>`;
		} else if (punct !== undefined) {
			html += `<span class="hljs-punctuation">${punct}</span>`;
		}
		last = m.index + whole.length;
	}
	return html + escapeHtml(source.slice(last));
}
