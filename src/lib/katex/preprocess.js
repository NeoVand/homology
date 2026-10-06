// A Svelte markup preprocessor that renders LaTeX at build time.
//
// In any .svelte file, write inline math as  \( ... \)  and display math as
// \[ ... \]  directly in the template. Before Svelte parses the file, every
// such segment is replaced by  {@html "…prerendered KaTeX…"} , so TeX braces
// never collide with Svelte's own {expressions}.
//
// Rules (enforced with helpful errors):
//   • math is only allowed in template text — not inside <script>/<style>,
//     not inside {expressions}, and not inside a tag's attributes
//     (pass math to components through snippets/children instead);
//   • a TeX error fails the build and points at the file and formula.

import katex from 'katex';
import { katexOptions } from './macros.js';
import { attachPunctuation, labelKatex } from './a11y.js';

const OPEN_INLINE = '\\(';
const CLOSE_INLINE = '\\)';
const OPEN_DISPLAY = '\\[';
const CLOSE_DISPLAY = '\\]';
// punctuation that should stay glued to the inline math it follows
const TRAILING_PUNCT = /[.,;:!?)’”]/;

// top-level commands whose effect would be lost if a formula were cut in pieces
const STYLE_SWITCH = /^\\(?:color|displaystyle|textstyle|scriptstyle|scriptscriptstyle|rm|bf|it|sf|tt|cal|tiny|small|normalsize|large|Large|LARGE|huge|Huge)$/;

/**
 * Split display TeX at its top-level \qquad — the space that separates
 * independent formulas set side by side ("a = b, \qquad c = d"). Spaces inside
 * braces, environments or \left…\right pairs are left alone.
 * @param {string} tex
 * @returns {string[]}
 */
export function splitDisplay(tex) {
	const parts = [];
	let depth = 0;
	let start = 0;
	for (let i = 0; i < tex.length; i++) {
		const c = tex[i];
		if (c === '{') depth++;
		else if (c === '}') depth--;
		else if (c === '\\') {
			const cmd = /^\\(?:[a-zA-Z]+|.)/.exec(tex.slice(i))?.[0] ?? '\\';
			if (cmd === '\\begin' || cmd === '\\left') depth++;
			else if (cmd === '\\end' || cmd === '\\right') depth--;
			else if (depth === 0 && cmd === '\\qquad') {
				parts.push(tex.slice(start, i));
				start = i + cmd.length;
			} else if (depth === 0 && STYLE_SWITCH.test(cmd)) return [tex];
			i += cmd.length - 1;
		}
	}
	parts.push(tex.slice(start));
	const out = parts.map((s) => s.trim()).filter(Boolean);
	return out.length ? out : [tex];
}

/**
 * Render one TeX string to HTML.
 *
 * Display math is responsive. Formulas set side by side with \qquad become
 * separate pieces that wrap onto their own lines when the column is narrow,
 * and each piece is set in display style but with inline line-breaking, so a
 * long equation can break after a relation or an operator instead of running
 * off the edge of a phone.
 * @param {string} tex
 * @param {boolean} display
 */
export function renderTeX(tex, display) {
	if (!display) return labelKatex(katex.renderToString(tex, { ...katexOptions, displayMode: false }), tex);
	const pieces = splitDisplay(tex).map((t) => {
		let html;
		try {
			html = katex.renderToString(`\\displaystyle ${t}`, { ...katexOptions, displayMode: false });
		} catch (e) {
			// a few environments (CD diagrams) exist only in display mode; they cannot break anyway
			if (!(e instanceof Error) || !/display mode/i.test(e.message)) throw e;
			return labelKatex(katex.renderToString(t, { ...katexOptions, displayMode: true }), t);
		}
		return `<span class="katex-display">${labelKatex(html, t)}</span>`;
	});
	return `<span class="math-block">${pieces.join('')}</span>`;
}

/** Count consecutive backslashes immediately before index i. */
function backslashesBefore(src, i) {
	let n = 0;
	for (let j = i - 1; j >= 0 && src[j] === '\\'; j--) n++;
	return n;
}

/** Line number (1-based) of index i, for error messages. */
function lineOf(src, i) {
	let line = 1;
	for (let j = 0; j < i && j < src.length; j++) if (src[j] === '\n') line++;
	return line;
}

/**
 * Find the closing delimiter for math that opened just before `from`.
 * The closer must be an unescaped "\)" or "\]" (odd number of backslashes,
 * i.e. the backslash that starts the delimiter is not itself escaped).
 */
function findClose(src, from, close) {
	let i = from;
	while (true) {
		i = src.indexOf(close, i);
		if (i === -1) return -1;
		// the delimiter's own backslash is at i; it must not be escaped
		if (backslashesBefore(src, i) % 2 === 0) return i;
		i += 1;
	}
}

/**
 * Transform template markup (script/style already masked out).
 * @param {string} src
 * @param {string} filename
 */
function transform(src, filename) {
	let out = '';
	let i = 0;
	let braceDepth = 0; // inside a Svelte {expression}
	let inTag = false; // between '<name' and '>'
	let quote = ''; // current attribute quote char when inTag
	const n = src.length;

	while (i < n) {
		const c = src[i];

		// HTML comments: copy verbatim
		if (!inTag && braceDepth === 0 && src.startsWith('<!--', i)) {
			const end = src.indexOf('-->', i + 4);
			const stop = end === -1 ? n : end + 3;
			out += src.slice(i, stop);
			i = stop;
			continue;
		}

		if (braceDepth > 0) {
			// Inside a JS expression — track nested braces and skip strings.
			if (c === '"' || c === "'" || c === '`') {
				let j = i + 1;
				while (j < n && src[j] !== c) {
					if (src[j] === '\\') j++;
					j++;
				}
				out += src.slice(i, j + 1);
				i = j + 1;
				continue;
			}
			if (c === '{') braceDepth++;
			else if (c === '}') braceDepth--;
			out += c;
			i++;
			continue;
		}

		if (inTag) {
			if (quote) {
				if (c === quote) quote = '';
				else if (c === '{') {
					braceDepth = 1;
					out += c;
					i++;
					continue;
				}
			} else if (c === '"' || c === "'") quote = c;
			else if (c === '{') {
				braceDepth = 1;
				out += c;
				i++;
				continue;
			} else if (c === '>') inTag = false;

			if (
				(src.startsWith(OPEN_INLINE, i) || src.startsWith(OPEN_DISPLAY, i)) &&
				backslashesBefore(src, i) % 2 === 0
			) {
				throw new Error(
					`[katex] ${filename}:${lineOf(src, i)} — math inside a tag attribute is not supported. ` +
						`Pass it through a snippet/children instead (e.g. {#snippet title()}…{/snippet}).`
				);
			}
			out += c;
			i++;
			continue;
		}

		// Plain template text.
		if (c === '{') {
			braceDepth = 1;
			out += c;
			i++;
			continue;
		}
		if (c === '<' && /[A-Za-z/!]/.test(src[i + 1] ?? '')) {
			inTag = true;
			quote = '';
			out += c;
			i++;
			continue;
		}

		// A spaced em dash stays with the word before it: the space becomes a
		// no-break space, so a line can end with "—" but never begin with it.
		if (c === ' ' || c === '\n' || c === '\t') {
			let j = i;
			while (j < n && (src[j] === ' ' || src[j] === '\n' || src[j] === '\t')) j++;
			const prev = out[out.length - 1] ?? '>';
			if (src[j] === '—' && prev !== '>' && !/\s/.test(prev)) {
				out += '\u00a0';
				i = j;
				continue;
			}
		}

		const isInline = src.startsWith(OPEN_INLINE, i);
		const isDisplay = !isInline && src.startsWith(OPEN_DISPLAY, i);
		if ((isInline || isDisplay) && backslashesBefore(src, i) % 2 === 0) {
			const close = isInline ? CLOSE_INLINE : CLOSE_DISPLAY;
			const start = i + 2;
			const end = findClose(src, start, close);
			if (end === -1) {
				throw new Error(
					`[katex] ${filename}:${lineOf(src, i)} — unclosed ${isInline ? '\\(' : '\\['} math delimiter.`
				);
			}
			const tex = src.slice(start, end).trim();
			let html;
			try {
				html = renderTeX(tex, isDisplay);
			} catch (e) {
				const msg = e instanceof Error ? e.message : String(e);
				throw new Error(`[katex] ${filename}:${lineOf(src, i)} — ${msg}\n    in: ${tex}`);
			}
			// Punctuation that directly follows inline math goes inside the formula's
			// last box, so a line never starts with a stray full stop or comma. (A
			// nowrap wrapper is not enough: browsers allow a break after KaTeX's
			// inline-block boxes whatever the wrapper says.) Breaks inside the
			// formula, after = or +, are still allowed.
			let k = end + 2;
			if (isInline) while (k < n && TRAILING_PUNCT.test(src[k])) k++;
			if (k > end + 2) html = attachPunctuation(html, src.slice(end + 2, k));
			out += `{@html ${JSON.stringify(html)}}`;
			i = k;
			continue;
		}

		out += c;
		i++;
	}
	return out;
}

/**
 * @param {{ include?: RegExp }} [options]
 * @returns {import('svelte/compiler').PreprocessorGroup}
 */
export function katexPreprocess(options = {}) {
	const include = options.include ?? /\.svelte$/;
	return {
		name: 'katex-math',
		// (also keeps spaced em dashes with the word before them; see transform)
		markup({ content, filename }) {
			if (filename && !include.test(filename)) return;
			if (filename && filename.includes('node_modules')) return;
			if (!content.includes(OPEN_INLINE) && !content.includes(OPEN_DISPLAY) && !/\s—/.test(content)) return;

			// Mask <script> and <style> blocks so they are never touched.
			/** @type {string[]} */
			const blocks = [];
			const masked = content.replace(/<(script|style)(\s[^>]*)?>[\s\S]*?<\/\1>/g, (m) => {
				blocks.push(m);
				return `\u0000${blocks.length - 1}\u0000`;
			});
			const transformed = transform(masked, filename ?? 'unknown');
			const code = transformed.replace(/\u0000(\d+)\u0000/g, (_, k) => blocks[Number(k)]);
			return { code };
		}
	};
}
