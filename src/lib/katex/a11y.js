// KaTeX's HTML output is marked aria-hidden, because it expects a MathML copy
// for assistive technology. We ship HTML only (the MathML copy doubled the size
// of every chapter), so instead each formula gets role="math" and an
// aria-label holding a lightly cleaned version of its TeX source.

const COLOUR_MACROS = /\\(?:cyc|bdy|chn|hole|hlb|hlg)\b/g;

/**
 * The text a screen reader announces for a formula.
 * @param {string} tex
 */
export function spokenTeX(tex) {
	return tex
		.replace(COLOUR_MACROS, '')
		.replace(/\\(?:,|;|:|!|quad|qquad)/g, ' ')
		.replace(/\\(?:left|right|bigl|bigr|Bigl|Bigr|big|Big|displaystyle|textstyle|allowbreak|nobreak)\b/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

/** @param {string} s */
function escapeAttr(s) {
	return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Give rendered KaTeX HTML an accessible name.
 * @param {string} html output of katex.renderToString with output: 'html'
 * @param {string} tex the source it was rendered from
 */
export function labelKatex(html, tex) {
	return html.replace('<span class="katex">', `<span class="katex" role="math" aria-label="${escapeAttr(spokenTeX(tex))}">`);
}
