// Whole-book consistency checks for the glossary: every definition's math
// compiles, every cross-reference and anchor resolves, and every <Term t="…">
// used anywhere in the book names an existing entry.
import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { katexOptions } from '$lib/katex/macros.js';
import { glossary, glossaryByKey } from '$lib/content/glossary';
import { chapterById } from '$lib/content/toc';

const pages = import.meta.glob('/src/routes/\\(book\\)/*/*/+page.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;
const components = import.meta.glob('/src/**/*.svelte', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const page = (chapter: string) => pages[`/src/routes/(book)/${chapter}/+page.svelte`];

describe('the glossary', () => {
	it('has entries with known chapters', () => {
		expect(glossary.length).toBeGreaterThan(500);
		for (const e of glossary) expect(chapterById.has(e.chapter), `${e.key}: ${e.chapter}`).toBe(true);
	});

	it('has math that compiles', () => {
		for (const e of glossary) {
			for (const m of e.def.matchAll(/\\\((.+?)\\\)/g)) {
				expect(() => katex.renderToString(m[1], { ...katexOptions, throwOnError: true }), `${e.key}: ${m[1]}`).not.toThrow();
			}
		}
	});

	it('has see-also keys that exist', () => {
		for (const e of glossary) for (const s of e.see ?? []) expect(glossaryByKey.has(s), `${e.key} → ${s}`).toBe(true);
	});

	it('has anchors that exist in their chapters', () => {
		for (const e of glossary) {
			if (!e.anchor) continue;
			const src = page(e.chapter);
			expect(src, `no page for ${e.chapter}`).toBeTypeOf('string');
			expect(src.includes(`id="${e.anchor}"`), `${e.key} → ${e.chapter}#${e.anchor}`).toBe(true);
		}
	});

	it('defines every term used in the book', () => {
		for (const [path, src] of Object.entries(components)) {
			for (const m of src.matchAll(/<Term\s+t="([^"]+)"/g)) expect(glossaryByKey.has(m[1]), `${path}: ${m[1]}`).toBe(true);
		}
	});
});
