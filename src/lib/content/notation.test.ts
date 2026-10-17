import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { notation } from './notation';
import { chapterById } from './toc';
import { macros } from '$lib/katex/macros.js';

describe('notation index', () => {
	const rows = notation.flatMap((g) => g.rows);

	it('renders every symbol', () => {
		const bad = rows.filter((r) => {
			try {
				katex.renderToString(r.tex, { macros: { ...macros }, throwOnError: true, strict: 'ignore' });
				return false;
			} catch {
				return true;
			}
		});
		expect(bad.map((r) => r.tex)).toEqual([]);
	});

	it('names a real chapter for every symbol', () => {
		expect(rows.filter((r) => !chapterById.has(r.chapter)).map((r) => r.tex)).toEqual([]);
	});

	it('lists each symbol once', () => {
		const seen = new Set<string>();
		const twice = rows.filter((r) => (seen.has(r.tex) ? true : (seen.add(r.tex), false)));
		expect(twice.map((r) => r.tex)).toEqual([]);
	});
});
