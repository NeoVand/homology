import { describe, expect, it } from 'vitest';
import { katexPreprocess } from './preprocess.js';

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

	it('keeps punctuation after short inline math on the same line', () => {
		const code = run('<p>so \\(a = b\\). Then \\(c\\), and (\\(d\\)).</p>');
		expect(code.match(/<span class="math-nw">/g)).toHaveLength(3);
		expect(code).toMatch(/<span class="math-nw">\{@html "[^"]*(?:\\"[^"]*)*"\}\.<\/span>/);
		expect(code).toContain('}).</span>');
	});

	it('leaves math without trailing punctuation unwrapped', () => {
		expect(run('<p>\\(x\\) is</p>')).not.toContain('math-nw');
		expect(run('<p>\\(x\\) — and</p>')).not.toContain('math-nw');
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
