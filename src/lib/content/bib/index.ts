// The book's bibliography. Every work cited anywhere in the book lives in one
// of the files in ./entries (one per chapter or topic, so that several people
// can add to it at once); this module merges them and formats citations.
//
// In a chapter, cite a work with  <Cite k="hatcher2002" loc="§2.1" />.  The
// chapter's reference list is built from those tags when the site is built.

export type WorkKind = 'book' | 'paper' | 'notes' | 'video' | 'web' | 'interactive' | 'letter' | 'thesis';

export interface Work {
	/** short stable id, e.g. "hatcher2002" */
	key: string;
	/** full names, in the order printed on the work */
	authors: string[];
	/** how the authors appear in an inline citation, when the last word of each
	 *  name is wrong, e.g. "de Rham", "Mac Lane", "Eilenberg & Mac Lane" */
	label?: string;
	year: number | string;
	title: string;
	/** journal (with volume and pages), publisher, or series, as it should be printed */
	venue?: string;
	/** where a reader can read it: a free copy when one exists, else the publisher's page */
	url?: string;
	doi?: string;
	arxiv?: string;
	free?: boolean;
	kind?: WorkKind;
}

const modules = import.meta.glob<{ works: Work[] }>('./entries/*.ts', { eager: true });

function merge(): Map<string, Work> {
	const map = new Map<string, Work>();
	for (const [file, mod] of Object.entries(modules)) {
		for (const w of mod.works) {
			const prev = map.get(w.key);
			if (prev && JSON.stringify(prev) !== JSON.stringify(w)) {
				throw new Error(`[bib] "${w.key}" is defined twice, differently (second time in ${file})`);
			}
			map.set(w.key, w);
		}
	}
	return map;
}

export const bibliography: Map<string, Work> = merge();

export function getWork(key: string): Work | undefined {
	return bibliography.get(key);
}

const family = (name: string) => name.trim().split(/\s+/).pop() ?? name;

/** "Hatcher", "Edelsbrunner & Harer", "Cohen-Steiner et al." */
export function authorLabel(w: Work): string {
	if (w.label) return w.label;
	const a = w.authors;
	if (a.length === 0) return w.title;
	if (a.length === 1) return family(a[0]);
	if (a.length === 2) return `${family(a[0])} & ${family(a[1])}`;
	return `${family(a[0])} et al.`;
}

/** "Hatcher 2002" */
export function shortCite(w: Work): string {
	return `${authorLabel(w)} ${w.year}`;
}

/** "Allen Hatcher", "A and B", "A, B and C" */
export function authorList(w: Work): string {
	const a = w.authors;
	if (a.length <= 1) return a[0] ?? '';
	return `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`;
}

/** the best link for a work: its own url, else its DOI, else arXiv */
export function workLink(w: Work): string | undefined {
	if (w.url) return w.url;
	if (w.doi) return `https://doi.org/${w.doi}`;
	if (w.arxiv) return `https://arxiv.org/abs/${w.arxiv}`;
	return undefined;
}

/** keys cited in a chunk of Svelte source, in order of first appearance */
export function citedKeys(source: string): string[] {
	const seen = new Set<string>();
	for (const m of source.matchAll(/<Cite\b[^>]*?\bk="([^"]+)"/g)) {
		for (const k of m[1].split(',').map((s) => s.trim())) if (k) seen.add(k);
	}
	return [...seen];
}
