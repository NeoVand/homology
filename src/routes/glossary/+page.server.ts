import { glossary } from '$lib/content/glossary';
import { renderMathInText } from '$lib/katex/render';
import { chapterById } from '$lib/content/toc';

export const prerender = true;

export function load() {
	const entries = glossary
		.map((e) => {
			const ch = chapterById.get(e.chapter);
			return {
				key: e.key,
				term: e.term,
				html: renderMathInText(e.def),
				chapter: e.chapter,
				num: ch?.num ?? '',
				title: ch?.title ?? '',
				anchor: e.anchor ?? null,
				see: (e.see ?? []).filter((k) => glossary.some((g) => g.key === k))
			};
		})
		.sort((a, b) => a.term.localeCompare(b.term, 'en', { sensitivity: 'base' }));
	return { entries };
}
