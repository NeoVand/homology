// Consistency checks for the glossaries of chapters 3.1 and 3.2: KaTeX
// compiles, keys are unique, cross-references and anchors resolve, and every
// <Term t="…"> used in the two chapters exists in the assembled glossary.
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import katex from 'katex';
import { katexOptions } from '$lib/katex/macros.js';
import { glossaryByKey } from '$lib/content/glossary';
import { entries as cycles } from '$lib/content/glossary/homology--cycles-and-boundaries';
import { entries as chains } from '$lib/content/glossary/homology--chains';

const page = (id: string) => readFileSync(`src/routes/(book)/${id}/+page.svelte`, 'utf8');
const chapters = [
	{ id: 'homology/cycles-and-boundaries', list: cycles },
	{ id: 'homology/chains', list: chains }
];

describe('glossary entries of chapters 3.1 and 3.2', () => {
	const all = [...cycles, ...chains];

	it('have unique keys and 15–30 entries per chapter', () => {
		expect(new Set(all.map((e) => e.key)).size).toBe(all.length);
		for (const { list } of chapters) {
			expect(list.length).toBeGreaterThanOrEqual(15);
			expect(list.length).toBeLessThanOrEqual(30);
		}
	});

	it('are the entries the assembled glossary actually shows (no earlier chapter owns the key)', () => {
		for (const e of all) expect(glossaryByKey.get(e.key)?.chapter, e.key).toBe(e.chapter);
	});

	it('every \\( … \\) segment compiles with KaTeX', () => {
		for (const e of all) {
			const re = /\\\((.+?)\\\)/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(e.def))) {
				const tex = m[1];
				expect(() => katex.renderToString(tex, { ...katexOptions, throwOnError: true }), `${e.key}: ${tex}`).not.toThrow();
			}
		}
	});

	it('see-also keys exist in the glossary', () => {
		for (const e of all) for (const s of e.see ?? []) expect(glossaryByKey.has(s), `${e.key} → ${s}`).toBe(true);
	});

	it('anchors point at ids that exist in the chapter', () => {
		for (const { id, list } of chapters) {
			const src = page(id);
			for (const e of list) {
				expect(e.chapter).toBe(id);
				if (e.anchor) expect(src.includes(`id="${e.anchor}"`), `${e.key} → #${e.anchor}`).toBe(true);
			}
		}
	});

	it('every <Term t="…"> used in the two chapters exists in the glossary', () => {
		for (const { id } of chapters) {
			for (const m of page(id).matchAll(/<Term t="([^"]+)"/g)) {
				expect(glossaryByKey.has(m[1]), `${id}: ${m[1]}`).toBe(true);
			}
		}
	});
});
