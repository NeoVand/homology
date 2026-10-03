import { json } from '@sveltejs/kit';
import { glossary } from '$lib/content/glossary';
import { renderMathInText } from '$lib/katex/render';
import { chapterById } from '$lib/content/toc';

export const prerender = true;

// Pre-rendered at build time so that glossary popovers never need KaTeX in the browser.
export function GET() {
	const data: Record<string, { term: string; html: string; chapter: string; num: string; title: string; anchor?: string }> = {};
	for (const e of glossary) {
		const ch = chapterById.get(e.chapter);
		data[e.key] = {
			term: e.term,
			html: renderMathInText(e.def),
			chapter: e.chapter,
			num: ch?.num ?? '',
			title: ch?.title ?? '',
			anchor: e.anchor
		};
	}
	return json(data);
}
