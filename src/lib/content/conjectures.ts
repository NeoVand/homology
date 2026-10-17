// The book's conjectures and open problems: one record each, shown in the
// chapter where it fits by  <Conjecture k="goldbach">…</Conjecture>,  and all
// together on the Open Problems page. Text fields may hold inline math \\( … \\)
// and *emphasis*. Statuses are as of `ASOF`; check them again before changing it.

export const ASOF = 'October 2026';

export type ProblemStatus = 'open' | 'proved' | 'disproved' | 'independent' | 'claimed';

export interface Problem {
	key: string;
	name: string;
	/** a conjecture asserts something; a problem asks a question */
	kind: 'conjecture' | 'problem';
	posed: { by: string; year: number | string };
	/** the statement, for a reader of the chapter it sits in */
	statement: string;
	status: ProblemStatus;
	/** who settled it, when, and how (for every status but open) */
	settled?: { by: string; year: number | string; how: string };
	/** what is known: partial results, records, evidence */
	known: string;
	/** something concrete a curious reader can try */
	wayIn?: string;
	/** the chapter whose box shows it */
	chapter: string;
	/** bibliography keys */
	cite: string[];
}

export const problems: Problem[] = [];

export const problemByKey = new Map(problems.map((p) => [p.key, p]));

/** the label on the box: Conjecture, Open problem, Problem */
export function problemLabel(p: Problem): string {
	if (p.kind === 'conjecture') return 'Conjecture';
	return p.status === 'open' ? 'Open problem' : 'Problem';
}

/** the badge: "Open since 1742", "Proved in 2003", … */
export function statusText(p: Problem): string {
	switch (p.status) {
		case 'open':
			return `Open since ${p.posed.year}`;
		case 'proved':
			return p.kind === 'conjecture' ? `Proved in ${p.settled?.year}` : `Solved in ${p.settled?.year}`;
		case 'disproved':
			return `Disproved in ${p.settled?.year}`;
		case 'independent':
			return 'Neither provable nor disprovable';
		case 'claimed':
			return `Solution claimed in ${p.settled?.year}`;
	}
}

export const statusColor: Record<ProblemStatus, string> = {
	open: 'var(--rose)',
	proved: 'var(--green)',
	disproved: 'var(--amber)',
	independent: 'var(--blue)',
	claimed: 'var(--amber)'
};
