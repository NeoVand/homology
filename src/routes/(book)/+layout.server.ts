// Each chapter's reference list: the works its <Cite> tags name, read from the
// chapter's source when the site is built, so the list is complete and in
// order of first citation without anything having to run in the browser.
import { citedKeys } from '$lib/content/bib';

const sources = import.meta.glob<string>('./**/+page.svelte', { query: '?raw', import: 'default', eager: true });

export const load = ({ route }) => {
	const file = `./${(route.id ?? '').replace(/^\/\(book\)\//, '')}/+page.svelte`;
	return { cited: citedKeys(sources[file] ?? '') };
};
