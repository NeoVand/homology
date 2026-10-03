import { notation } from '$lib/content/notation';
import { tex } from '$lib/katex/render';
import { chapterById } from '$lib/content/toc';

export const prerender = true;

export function load() {
	return {
		groups: notation.map((g) => ({
			title: g.title,
			rows: g.rows.map((r) => {
				const ch = chapterById.get(r.chapter);
				return { html: tex(r.tex), read: r.read, meaning: r.meaning, chapter: r.chapter, num: ch?.num ?? '', title: ch?.title ?? '' };
			})
		}))
	};
}
