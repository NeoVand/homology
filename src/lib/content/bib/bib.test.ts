import { describe, expect, it } from 'vitest';
import { authorLabel, bibliography, citedKeys, shortCite, workLink } from './index';

const pages = import.meta.glob<string>('/src/routes/**/+page.svelte', { query: '?raw', import: 'default', eager: true });

describe('the bibliography', () => {
	it('has well-formed entries', () => {
		expect(bibliography.size).toBeGreaterThan(30);
		for (const w of bibliography.values()) {
			expect(w.key, w.key).toMatch(/^[a-z0-9-]+$/);
			expect(w.authors.length + (w.label ? 1 : 0), w.key).toBeGreaterThan(0);
			expect(String(w.year), w.key).toMatch(/\d/);
			expect(w.title.length, w.key).toBeGreaterThan(2);
			// every work can be found: a link, or at least where it was printed
			expect(!!workLink(w) || !!w.venue, w.key).toBe(true);
			if (w.doi) expect(w.doi, w.key).toMatch(/^10\.\d{4,}\//);
		}
	});

	it('formats inline citations', () => {
		const h = bibliography.get('hatcher2002')!;
		expect(shortCite(h)).toBe('Hatcher 2002');
		expect(authorLabel(bibliography.get('edelsbrunnerharer2010')!)).toBe('Edelsbrunner & Harer');
		expect(authorLabel(bibliography.get('ceh2007')!)).toBe('Cohen-Steiner et al.');
	});

	it('knows every work the chapters cite', () => {
		expect(Object.keys(pages).length).toBeGreaterThan(30);
		const missing: string[] = [];
		for (const [file, src] of Object.entries(pages)) {
			for (const key of citedKeys(src)) {
				if (!bibliography.has(key)) missing.push(`${file}: ${key}`);
			}
		}
		expect(missing).toEqual([]);
	});

	it('reads cite keys from source in order of first appearance', () => {
		expect(citedKeys('<Cite k="b" /> x <Cite k="a,b" loc="§1" /> <Cite text k="c" />')).toEqual(['b', 'a', 'c']);
	});
});
