import { describe, expect, it } from 'vitest';
import katex from 'katex';
import { katexOptions } from '$lib/katex/macros.js';
import { entries as groups } from '$lib/content/glossary/homology--homology-groups';
import { entries as computing } from '$lib/content/glossary/homology--computing';

describe('glossary entries of chapters 3.3 and 3.4', () => {
	const all = [...groups, ...computing];
	it('have unique keys, the homology key, and 15–30 entries per chapter', () => {
		expect(new Set(all.map((e) => e.key)).size).toBe(all.length);
		expect(groups.some((e) => e.key === 'homology')).toBe(true);
		for (const list of [groups, computing]) {
			expect(list.length).toBeGreaterThanOrEqual(15);
			expect(list.length).toBeLessThanOrEqual(30);
		}
	});
	it('every \\( … \\) segment compiles with KaTeX', () => {
		for (const e of all) {
			const re = /\\\((.+?)\\\)/g;
			let m: RegExpExecArray | null;
			while ((m = re.exec(e.def))) {
				expect(() => katex.renderToString(m![1], { ...katexOptions, throwOnError: true }), `${e.key}: ${m[1]}`).not.toThrow();
			}
		}
	});
	it('see-also keys point to entries that exist in these chapters', () => {
		const keys = new Set(all.map((e) => e.key));
		for (const e of all) for (const s of e.see ?? []) expect(keys.has(s), `${e.key} → ${s}`).toBe(true);
	});
});
