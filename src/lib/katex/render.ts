// Runtime KaTeX helpers (used by <TeX> and by build-time endpoints).
import katex from 'katex';
import { katexOptions } from './macros.js';
import { attachPunctuation, labelKatex } from './a11y.js';

const cache = new Map<string, string>();

/** Render a TeX string to HTML. Never throws: errors render as red source. */
export function tex(src: string, display = false): string {
	const key = (display ? 'D|' : 'I|') + src;
	const hit = cache.get(key);
	if (hit !== undefined) return hit;
	let html: string;
	try {
		html = labelKatex(katex.renderToString(src, { ...katexOptions, displayMode: display, throwOnError: false, output: 'html' }), src);
	} catch {
		html = `<span class="tex-error">${escapeHtml(src)}</span>`;
	}
	if (cache.size > 2000) cache.clear();
	cache.set(key, html);
	return html;
}

export function escapeHtml(s: string): string {
	return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

/**
 * Render a plain-text string that may contain \( … \) and \[ … \] math into HTML.
 * Text outside math is HTML-escaped, except that *emphasis* and **strong** are supported.
 */
export function renderMathInText(s: string): string {
	let out = '';
	let i = 0;
	while (i < s.length) {
		const a = s.indexOf('\\(', i);
		const b = s.indexOf('\\[', i);
		let start = -1;
		let display = false;
		if (a !== -1 && (b === -1 || a < b)) start = a;
		else if (b !== -1) {
			start = b;
			display = true;
		}
		if (start === -1) {
			out += inline(s.slice(i));
			break;
		}
		out += inline(s.slice(i, start));
		const close = display ? '\\]' : '\\)';
		const end = s.indexOf(close, start + 2);
		if (end === -1) {
			out += inline(s.slice(start));
			break;
		}
		const body = s.slice(start + 2, end);
		i = end + 2;
		if (display) {
			out += `<span class="math-block">${tex(body, true)}</span>`;
		} else {
			// punctuation right after inline math stays with it (see attachPunctuation)
			let k = i;
			while (k < s.length && /[.,;:!?)’”]/.test(s[k])) k++;
			out += k > i ? attachPunctuation(tex(body, false), s.slice(i, k)) : tex(body, false);
			i = k;
		}
	}
	return out;
}

function inline(t: string): string {
	return escapeHtml(t)
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/\*(.+?)\*/g, '<em>$1</em>');
}
