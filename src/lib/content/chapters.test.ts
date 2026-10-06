// Structural checks for every chapter page: figures are numbered
// <chapter>.<k> in order, every section heading has a unique id, and each
// chapter ends with exercises, a summary and further reading (the last
// chapter ends with explorations and a study guide instead).
import { describe, expect, it } from 'vitest';
import { chapters } from '$lib/content/toc';

const pages = import.meta.glob('/src/routes/\\(book\\)/*/*/+page.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

describe('every chapter', () => {
	it('has a page', () => {
		for (const c of chapters) expect(pages[`/src/routes/(book)/${c.id}/+page.svelte`], c.id).toBeTypeOf('string');
	});

	for (const c of chapters) {
		const src = () => pages[`/src/routes/(book)/${c.id}/+page.svelte`] ?? '';

		it(`${c.num} ${c.id}: numbers its figures ${c.num}.1, ${c.num}.2, …`, () => {
			const nums = [...src().matchAll(/<Figure\b[^>]*>/g)].map((m) => m[0].match(/\snum="([^"]*)"/)?.[1]);
			expect(nums.length).toBeGreaterThanOrEqual(5);
			expect(nums).toEqual(nums.map((_, k) => `${c.num}.${k + 1}`));
		});

		it(`${c.num} ${c.id}: has unique section ids and the closing sections`, () => {
			const ids = [...src().matchAll(/<h2 id="([^"]+)"/g)].map((m) => m[1]);
			expect(new Set(ids).size).toBe(ids.length);
			if (c.id === 'big-picture/horizons') {
				// the last chapter closes with explorations, a study guide and an envoi instead
				expect(ids).toEqual(expect.arrayContaining(['explorations', 'study-guide', 'closing']));
				return;
			}
			expect(ids).toContain('summary');
			expect(ids).toContain('further-reading');
			expect(ids).toContain('exercises');
		});
	}
});
