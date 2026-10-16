import { describe, expect, it } from 'vitest';
import { people, biographyLink } from './people';

const pages = import.meta.glob<string>('/src/routes/**/+page.svelte', { query: '?raw', import: 'default', eager: true });
const portraits = Object.keys(import.meta.glob('/static/portraits/*.webp')).map((f) => f.replace(/^.*\/(.*)\.webp$/, '$1'));

const usedKeys = () => {
	const out: string[] = [];
	for (const src of Object.values(pages)) {
		for (const m of src.matchAll(/<History[^>]*\speople="([^"]+)"/g)) out.push(...m[1].split(',').map((s) => s.trim()));
	}
	return out;
};

describe('people and portraits', () => {
	it('has a name, dates and a biography for everyone', () => {
		for (const p of Object.values(people)) {
			expect(p.name.length, p.key).toBeGreaterThan(2);
			expect(p.dates, p.key).toMatch(/\d/);
			expect(biographyLink(p), p.key).toMatch(/^https:\/\//);
		}
	});

	it('knows every person a history box shows, and has their portrait', () => {
		const missing = usedKeys().filter((k) => !people[k] || !portraits.includes(k));
		expect(missing).toEqual([]);
	});

	it('shows each portrait in at most one history box', () => {
		const keys = usedKeys();
		expect(keys.filter((k, i) => keys.indexOf(k) !== i)).toEqual([]);
	});
});
