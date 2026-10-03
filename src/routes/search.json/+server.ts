import { json } from '@sveltejs/kit';
import { chapters } from '$lib/content/toc';
import { glossary } from '$lib/content/glossary';
import { notation } from '$lib/content/notation';
import { renderMathInText, tex } from '$lib/katex/render';

export const prerender = true;

// Raw chapter sources, read at build time, to index section headings.
const sources = import.meta.glob('/src/routes/\\(book\\)/**/+page.svelte', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

function plain(s: string): string {
	return s
		.replace(/<[^>]+>/g, '')
		.replace(/\\[()[\]]/g, '')
		.replace(/\\[a-zA-Z]+/g, ' ')
		.replace(/[{}_^]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

export function GET() {
	const items: {
		type: 'chapter' | 'section' | 'term' | 'symbol';
		title: string;
		/** pre-rendered HTML for the title (may contain KaTeX) */
		html?: string;
		text: string;
		path: string;
		hash?: string;
		where: string;
	}[] = [];

	for (const c of chapters) {
		items.push({ type: 'chapter', title: c.title, text: `${c.subtitle} — ${c.blurb}`, path: `/${c.id}/`, where: `Chapter ${c.num}` });
		const src = sources[`/src/routes/(book)/${c.id}/+page.svelte`] ?? '';
		for (const m of src.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)) {
			const raw = m[2].trim();
			if (['exercises', 'summary', 'further-reading'].includes(m[1])) continue;
			items.push({
				type: 'section',
				title: plain(raw),
				html: renderMathInText(raw.replace(/<[^>]+>/g, '')),
				text: '',
				path: `/${c.id}/`,
				hash: m[1],
				where: `§${c.num} ${c.title}`
			});
		}
	}
	for (const g of glossary) {
		const ch = chapters.find((c) => c.id === g.chapter);
		items.push({
			type: 'term',
			title: g.term,
			text: plain(g.def),
			html: renderMathInText(g.def),
			path: '/glossary/',
			hash: g.key,
			where: ch ? `Glossary · §${ch.num}` : 'Glossary'
		});
	}
	for (const grp of notation) {
		for (const r of grp.rows) {
			items.push({
				type: 'symbol',
				title: r.read,
				text: `${r.meaning} ${r.tex}`,
				html: tex(r.tex),
				path: '/notation/',
				where: `Notation · ${grp.title}`
			});
		}
	}
	return json(items);
}
