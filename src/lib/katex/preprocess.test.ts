import { describe, expect, it } from 'vitest';
import { katexPreprocess, renderTeX, splitDisplay } from './preprocess.js';

const run = (content: string) => {
	const out = katexPreprocess().markup!({ content, filename: 'Test.svelte' }) as { code: string } | undefined;
	return out?.code ?? content;
};

describe('the KaTeX preprocessor', () => {
	it('renders inline and display math in template text', () => {
		const code = run('<p>Let \\(x^2\\) be</p>\n\\[ \\partial\\partial = 0 \\]');
		expect(code).toContain('{@html "');
		expect(code).toContain('math-block');
		expect(code).not.toContain('\\(');
	});

	it('splits display math at top-level \\qquad only', () => {
		expect(splitDisplay('a = b, \\qquad c = d.')).toEqual(['a = b,', 'c = d.']);
		expect(splitDisplay('x \\qquad\\text{and}\\qquad y')).toEqual(['x', '\\text{and}', 'y']);
		expect(splitDisplay('\\left\\{ a \\qquad b \\right\\}')).toHaveLength(1);
		expect(splitDisplay('\\begin{aligned} a &= b \\qquad c \\end{aligned}')).toHaveLength(1);
		expect(splitDisplay('\\underbrace{a \\qquad b}_{c}')).toHaveLength(1);
		expect(splitDisplay('\\color{red} a \\qquad b')).toHaveLength(1);
		expect(splitDisplay('\\{ a \\qquad b')).toEqual(['\\{ a', 'b']);
	});

	it('sets each display piece in display style, with inline line-breaking', () => {
		const html = renderTeX('a = b + c, \\qquad \\sum_i x_i', true);
		expect(html.match(/class="katex-display"/g)).toHaveLength(2);
		expect(html.match(/class="katex-base"/g)!.length).toBeGreaterThan(2);
		expect(html).toContain('aria-label="a = b + c,"');
	});

	it('still renders display-only environments such as CD diagrams', () => {
		const html = renderTeX('\\begin{CD} X @>{f}>> Y \\\\ @VVV @VVV \\\\ Z @>>> W \\end{CD}', true);
		expect(html.match(/class="katex-display"/g)).toHaveLength(1);
		expect(html).toContain('role="math"');
	});

	it('sets punctuation after inline math inside the formula, so it cannot start a line', () => {
		const code = run('<p>so \\(a = b\\). Then \\(c\\), and (\\(d\\)).</p>');
		expect(code.match(/class=\\"mpunct\\"/g)).toHaveLength(3);
		expect(code).toContain('<span class=\\"mpunct\\">.</span></span></span></span>"} Then');
		expect(code).toContain('<span class=\\"mpunct\\">).</span>');
		expect(code).not.toMatch(/"\}[.,)]/);
	});

	it('keeps a spaced em dash with the word before it', () => {
		expect(run('<p>empty — a picture</p>')).toContain('empty\u00a0— a picture');
		expect(run('<p>empty\n\t— a picture</p>')).toContain('empty\u00a0— a picture');
		expect(run('<p>\\(x\\) — and</p>')).toMatch(/"\}\u00a0— and/);
		expect(run('<span class="dash">—</span>')).toContain('>—<');
		expect(run('<p>\n\t— Hatcher</p>')).toContain('\n\t— Hatcher');
	});

	it('leaves math without trailing punctuation alone', () => {
		expect(run('<p>\\(x\\) is</p>')).not.toContain('mpunct');
		expect(run('<p>\\(x\\) — and</p>')).not.toContain('mpunct');
	});

	it('gives every formula an accessible name', () => {
		const code = run('<p>\\(\\cyc{z} = \\partial c\\)</p>');
		expect(code).toContain('role=\\"math\\" aria-label=\\"{z} = \\\\partial c\\"');
	});

	it('refuses math inside attributes and unclosed delimiters', () => {
		expect(() => run('<Figure title="\\(x\\)"></Figure>')).toThrow(/attribute/);
		expect(() => run('<p>\\(x</p>')).toThrow(/unclosed/);
	});

	it('does not touch script and style blocks', () => {
		const src = '<script>const s = "\\\\(x\\\\)";</script>\n<p>\\(y\\)</p>';
		const code = run(src);
		expect(code).toContain('<script>const s = "\\\\(x\\\\)";</script>');
	});
});
