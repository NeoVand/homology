import type { GlossaryEntry } from './types';
import { entries as prelude } from './prelude';
import { entries as foundations } from './foundations';
import { entries as topology } from './topology';
import { entries as homology } from './homology';
import { entries as cohomology } from './cohomology';
import { entries as bigPicture } from './big-picture';

export type { GlossaryEntry };

const all = [...prelude, ...foundations, ...topology, ...homology, ...cohomology, ...bigPicture];

// Later parts may refine a term first defined earlier; keep the first definition.
const seen = new Set<string>();
export const glossary: GlossaryEntry[] = all.filter((e) => {
	if (seen.has(e.key)) return false;
	seen.add(e.key);
	return true;
});

export const glossaryByKey = new Map(glossary.map((e) => [e.key, e]));
