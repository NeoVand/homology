// The glossary is assembled from one file per chapter, e.g.
//   src/lib/content/glossary/homology--chains.ts  (chapter id with "/" → "--")
// each exporting `entries: GlossaryEntry[]`. This keeps parallel authors from
// ever editing the same file.
import type { GlossaryEntry } from './types';
import { chapterById } from '../toc';

export type { GlossaryEntry };

const modules = import.meta.glob<{ entries: GlossaryEntry[] }>('./*--*.ts', { eager: true });

const all: GlossaryEntry[] = [];
for (const path of Object.keys(modules).sort((a, b) => {
	// order by chapter order in the book
	const ia = chapterById.get(a.slice(2, -3).replace('--', '/'))?.index ?? 999;
	const ib = chapterById.get(b.slice(2, -3).replace('--', '/'))?.index ?? 999;
	return ia - ib;
})) {
	all.push(...(modules[path].entries ?? []));
}

// If two chapters define the same key, the earlier chapter wins.
const seen = new Set<string>();
export const glossary: GlossaryEntry[] = all.filter((e) => {
	if (seen.has(e.key)) return false;
	seen.add(e.key);
	return true;
});

export const glossaryByKey = new Map(glossary.map((e) => [e.key, e]));
