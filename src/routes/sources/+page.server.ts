// For the bibliography on this page: which chapters cite each work, read from
// the chapters' <Cite> tags when the site is built.
import { citedKeys } from '$lib/content/bib';
import { chapters } from '$lib/content/toc';

const sources = import.meta.glob<string>('/src/routes/\\(book\\)/*/*/+page.svelte', { query: '?raw', import: 'default', eager: true });

export const load = () => {
	const citedIn: Record<string, string[]> = {};
	for (const ch of chapters) {
		for (const key of citedKeys(sources[`/src/routes/(book)/${ch.id}/+page.svelte`] ?? '')) {
			(citedIn[key] ??= []).push(ch.id);
		}
	}
	return { citedIn };
};
