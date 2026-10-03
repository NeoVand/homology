import type { GlossaryEntry } from './types';

const chapter = 'homology/computing';

export const entries: GlossaryEntry[] = [
	{
		key: 'torsion-class',
		term: 'Torsion class',
		def: 'A homology class \\([z] \\ne 0\\) with \\(m[z] = 0\\) for some whole number \\(m \\ge 2\\): the cycle \\(z\\) does not bound, but its multiple \\(mz\\) does. The smallest such \\(m\\) is its order.',
		chapter,
		anchor: 'def-torsion',
		see: ['homology-torsion']
	},
	{
		key: 'homology-torsion',
		term: 'Torsion (in homology)',
		def: 'The finite part of \\(H_k(K) \\cong \\Z^{b_k} \\oplus \\Z/d_1 \\oplus \\cdots \\oplus \\Z/d_m\\), made of all classes of finite order. The Klein bottle has \\(\\Z/2\\) torsion in \\(H_1\\); the torus has none.',
		chapter,
		anchor: 'def-torsion',
		see: ['torsion-class', 'invariant-factors']
	},
	{
		key: 'integer-row-operations',
		term: 'Integer row and column operations',
		def: 'Swapping two rows (or columns), negating one, or adding an integer multiple of one to another. These are exactly the moves that can be undone without fractions; they amount to changing bases of the chain groups.',
		chapter
	},
	{
		key: 'invariant-factors',
		term: 'Invariant factors',
		def: 'The diagonal entries \\(d_1 \\mid d_2 \\mid \\cdots\\) of the Smith normal form of an integer matrix. For \\(\\partial_{k+1}\\), those bigger than \\(1\\) are the orders of the torsion summands of \\(H_k\\).',
		chapter,
		anchor: 'thm-snf',
		see: ['homology-from-smith']
	},
	{
		key: 'homology-from-smith',
		term: 'Homology from the Smith normal form',
		def: '\\(H_k \\cong \\Z^{n_k - r_k - r_{k+1}} \\oplus \\bigoplus_{d_i > 1} \\Z/d_i\\), where \\(r_j = \\rank\\partial_j\\) and the \\(d_i\\) are the invariant factors of \\(\\partial_{k+1}\\).',
		chapter,
		anchor: 'thm-homology-snf'
	},
	{
		key: 'rank-over-a-field',
		term: 'Rank over a field',
		def: 'The number of pivots left after row reduction. The same integer matrix can have different ranks over different fields: \\(\\partial_2\\) of the projective plane has rank \\(9\\) over \\(\\Z/2\\) and \\(10\\) over \\(\\Q\\), because one pivot is \\(2\\).',
		chapter
	},
	{
		key: 'pivot',
		term: 'Pivot',
		def: 'In row reduction, the non-zero entry used to clear the rest of its column. The rank of a matrix is the number of pivots.',
		chapter
	},
	{
		key: 'clash-cycle',
		term: 'Clash cycle',
		def: 'For any choice of orientations \\(\\varepsilon_t\\) of the triangles of a closed surface, \\(\\partial(\\sum \\varepsilon_t t) = 2c\\). The cycle \\(c\\) of clashing edges has a class that does not depend on the choice; it is zero exactly when the surface is orientable, and otherwise has order two.',
		chapter
	},
	{
		key: 'top-homology',
		term: 'Top homology and orientability',
		def: 'A closed connected surface has \\(H_2 \\cong \\Z\\) if it is orientable and \\(H_2 = 0\\) if it is not. With \\(\\Z/2\\) coefficients, \\(H_2 \\cong \\Z/2\\) always.',
		chapter,
		anchor: 'thm-top-homology'
	},
	{
		key: 'projective-line',
		term: 'Projective line',
		def: 'In the six-vertex projective plane, any of the ten triangles of edges that are not faces, such as \\(1 \\to 2 \\to 4 \\to 1\\). Each represents the non-zero class of \\(H_1(\\RP^2) \\cong \\Z/2\\).',
		chapter
	},
	{
		key: 'rational-betti-number',
		term: 'Rational Betti number',
		def: '\\(\\dim H_k(K;\\Q)\\), equal to the rank of the free part of \\(H_k(K)\\). Torsion is invisible over \\(\\Q\\) because one may divide.',
		chapter
	},
	{
		key: 'mod-p-betti-number',
		term: 'Mod-p Betti number',
		def: '\\(\\dim H_k(K;\\Z/p)\\) for a prime \\(p\\). It exceeds the rational Betti number when \\(H_k\\) or \\(H_{k-1}\\) has torsion of order divisible by \\(p\\).',
		chapter,
		see: ['universal-coefficient-count']
	},
	{
		key: 'universal-coefficient-count',
		term: 'Universal coefficients (counting form)',
		def: '\\(\\dim H_k(K;\\Z/p) = b_k + t_k + t_{k-1}\\), where \\(t_k\\) counts the torsion summands of \\(H_k(K)\\) of order divisible by \\(p\\). Integer homology determines homology with any coefficients.',
		chapter
	},
	{
		key: 'column-reduction',
		term: 'Column reduction',
		def: 'The \\(\\Z/2\\) algorithm that reduces the columns of a boundary matrix from left to right while recording which original columns were added. Columns that become zero give cycles. It is the engine of persistent homology.',
		chapter
	},
	{
		key: 'elementary-collapse',
		term: 'Elementary collapse',
		def: 'Removing a simplex together with a free face, a face that belongs to no other simplex. It does not change homology, and is used to shrink complexes before computing.',
		chapter
	},
	{
		key: 'discrete-morse-theory',
		term: 'Discrete Morse theory',
		def: 'A systematic way of pairing off simplices that can be collapsed, leaving a much smaller complex (or chain complex) with the same homology.',
		chapter,
		see: ['elementary-collapse']
	},
	{
		key: 'sparse-matrix',
		term: 'Sparse matrix',
		def: 'A matrix most of whose entries are zero. Boundary matrices are extremely sparse: each column of \\(\\partial_k\\) has at most \\(k+1\\) non-zero entries.',
		chapter
	},
	{
		key: 'coefficient-explosion',
		term: 'Coefficient explosion',
		def: 'The growth of huge intermediate integers during exact elimination over \\(\\Z\\). Computing modulo several primes avoids it and still detects torsion.',
		chapter
	},
	{
		key: 'wrapped-disk',
		term: 'Wrapped disk (Moore space)',
		def: 'A disk whose rim is glued around a circle \\(p\\) times. Its first homology is \\(\\Z/p\\); for \\(p = 2\\) it is the projective plane.',
		chapter
	},
	{
		key: 'boys-surface',
		term: "Boy's surface",
		def: 'A model of the real projective plane in three-dimensional space. Like every such model it must pass through itself: it is an immersion, not an embedding.',
		chapter
	}
];
