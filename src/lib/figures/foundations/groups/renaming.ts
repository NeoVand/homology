// Data and logic for the "isomorphism is a renaming" figure: two groups with
// four elements, and the six renamings that send the identity to 0.

export type FourGroup = 'square' | 'rect';

export const fourGroups: Record<FourGroup, { names: string[]; words: string[]; table: number[][] }> = {
	square: {
		names: ['e', '\\rho', '\\rho^2', '\\rho^3'],
		words: ['do nothing', 'quarter turn', 'half turn', 'three-quarter turn'],
		table: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i + j) % 4))
	},
	rect: {
		names: ['e', 'h', 'v', 't'],
		words: ['do nothing', 'flip top↔bottom', 'flip left↔right', 'half turn'],
		// e, h, v, t: each squares to e; any two different non-identity ones give the third
		table: [
			[0, 1, 2, 3],
			[1, 0, 3, 2],
			[2, 3, 0, 1],
			[3, 2, 1, 0]
		]
	}
};

/** the six bijections with e ↦ 0: the numbers given to elements 1, 2, 3 */
export const renamings = [
	[1, 2, 3],
	[3, 2, 1],
	[2, 1, 3],
	[1, 3, 2],
	[2, 3, 1],
	[3, 1, 2]
];

export interface Cell {
	renamed: number;
	want: number;
	ok: boolean;
}

/** Compare the renamed table of a group with the addition table of ℤ/4, cell by cell. */
export function compare(kind: FourGroup, ri: number): Cell[][] {
	const G = fourGroups[kind];
	const name = [0, ...renamings[ri]];
	const elOf: Record<number, number> = Object.fromEntries(name.map((q, el) => [q, el]));
	return [0, 1, 2, 3].map((p) =>
		[0, 1, 2, 3].map((q) => {
			const renamed = name[G.table[elOf[p]][elOf[q]]];
			const want = (p + q) % 4;
			return { renamed, want, ok: renamed === want };
		})
	);
}
