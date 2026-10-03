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

const OPEN_INLINE = '\\(';
const CLOSE_INLINE = '\\)';
const OPEN_DISPLAY = '\\[';
const CLOSE_DISPLAY = '\\]';

/**
 * Render one TeX string to HTML.
 * @param {string} tex
 * @param {boolean} display
 */
export function renderTeX(tex, display) {
	const html = katex.renderToString(tex, { ...katexOptions, displayMode: display });
	return display ? `<span class="math-block">${html}</span>` : html;
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
			out += `{@html ${JSON.stringify(html)}}`;
			i = end + 2;
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
		markup({ content, filename }) {
			if (filename && !include.test(filename)) return;
			if (filename && filename.includes('node_modules')) return;
			if (!content.includes(OPEN_INLINE) && !content.includes(OPEN_DISPLAY)) return;

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
