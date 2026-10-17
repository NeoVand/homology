import { describe, expect, it } from 'vitest';
import { problems, statusText } from './conjectures';
import { chapterById } from './toc';
import { getWork } from './bib';
import { renderMathInText } from '$lib/katex/render';

const pages = import.meta.glob<string>('/src/routes/\\(book\\)/*/*/+page.svelte', { query: '?raw', import: 'default', eager: true });

/** every <Conjecture k="…"> in the book, with the chapter it is in */
const uses = Object.entries(pages).flatMap(([file, src]) => {
	const chapter = file.replace(/^\/src\/routes\/\(book\)\/(.*)\/\+page\.svelte$/, '$1');
	return [...src.matchAll(/<Conjecture\b[^>]*?\bk="([^"]+)"/g)].map((m) => ({ key: m[1], chapter }));
});

const texOk = (s: string) => {
	const html = renderMathInText(s);
	return !html.includes('katex-error') && !html.includes('tex-error');
};

describe('the conjectures and open problems', () => {
	it('are each shown once, in the chapter they belong to', () => {
		for (const p of problems) {
			const where = uses.filter((u) => u.key === p.key);
			expect(where.length, p.key).toBe(1);
			expect(where[0].chapter, p.key).toBe(p.chapter);
		}
		const unknown = uses.filter((u) => !problems.some((p) => p.key === u.key));
		expect(unknown).toEqual([]);
	});

	it('have unique keys, real chapters, sources, and a word on how they were settled', () => {
		const keys = problems.map((p) => p.key);
		expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
		for (const p of problems) {
			expect(chapterById.has(p.chapter), p.key).toBe(true);
			expect(p.cite.length, p.key).toBeGreaterThan(0);
			for (const c of p.cite) expect(getWork(c), `${p.key}: ${c}`).toBeDefined();
			if (p.status !== 'open') expect(p.settled, p.key).toBeDefined();
			expect(statusText(p)).not.toMatch(/undefined/);
		}
	});

	it('typeset', () => {
		for (const p of problems) {
			for (const s of [p.statement, p.known, p.wayIn ?? '', p.settled?.how ?? '']) expect(texOk(s), `${p.key}: ${s}`).toBe(true);
		}
	});
});
