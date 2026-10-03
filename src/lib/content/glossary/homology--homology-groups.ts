import type { GlossaryEntry } from './types';

const chapter = 'homology/homology-groups';

export const entries: GlossaryEntry[] = [
	{
		key: 'homology',
		term: 'Homology',
		def: 'The algebraic measurement of holes. For each dimension \\(k\\), the homology group \\(H_k(X)\\) consists of the \\(k\\)-dimensional cycles of \\(X\\), where two cycles count as the same when they differ by a boundary.',
		chapter,
		anchor: 'def-homology',
		see: ['homology-group', 'betti-number']
	},
	{
		key: 'cycle-group',
		term: 'Cycle group',
		def: 'The group \\(Z_k = \\ker\\partial_k\\) of \\(k\\)-chains whose boundary is zero: the \\(k\\)-cycles.',
		chapter,
		anchor: 'def-cycles-boundaries',
		see: ['boundary-group']
	},
	{
		key: 'boundary-group',
		term: 'Boundary group',
		def: 'The group \\(B_k = \\im\\partial_{k+1}\\) of \\(k\\)-chains that are boundaries of \\((k+1)\\)-chains. Because \\(\\partial\\partial = 0\\), every boundary is a cycle: \\(B_k \\subseteq Z_k\\).',
		chapter,
		anchor: 'def-cycles-boundaries',
		see: ['cycle-group']
	},
	{
		key: 'homology-group',
		term: 'Homology group',
		def: 'The quotient \\(H_k(K) = Z_k/B_k = \\ker\\partial_k / \\im\\partial_{k+1}\\): the \\(k\\)-cycles, with two cycles counted as the same when their difference is a boundary.',
		chapter,
		anchor: 'def-homology',
		see: ['homology-class', 'homologous']
	},
	{
		key: 'homology-class',
		term: 'Homology class',
		def: 'The coset \\([z] = z + B_k\\) of a cycle \\(z\\): the cycle together with everything obtained from it by adding boundaries. The elements of \\(H_k\\) are homology classes.',
		chapter,
		anchor: 'def-homology'
	},
	{
		key: 'homologous',
		term: 'Homologous cycles',
		def: 'Two cycles \\(z, z\'\\) are homologous, \\(z \\sim z\'\\), when \\(z - z\' = \\partial c\\) is a boundary. Then \\([z] = [z\']\\). Geometrically, the chain \\(c\\) fills the space between them.',
		chapter,
		anchor: 'def-homology'
	},
	{
		key: 'betti-number',
		term: 'Betti number',
		def: 'The rank \\(b_k\\) of \\(H_k\\): the number of independent \\(k\\)-dimensional holes. \\(b_0\\) counts pieces, \\(b_1\\) independent loops, \\(b_2\\) cavities. Over a field \\(F\\) it is \\(\\dim H_k(K;F)\\). Often written \\(\\beta_k\\).',
		chapter,
		anchor: 'def-betti',
		see: ['rank-formula']
	},
	{
		key: 'rank-formula',
		term: 'Rank formula',
		def: 'Over a field, \\(b_k = n_k - \\rank\\partial_k - \\rank\\partial_{k+1}\\), where \\(n_k\\) is the number of \\(k\\)-simplices. It follows from rank–nullity.',
		chapter,
		anchor: 'thm-rank-formula',
		see: ['betti-number']
	},
	{
		key: 'homology-with-coefficients',
		term: 'Homology with coefficients',
		def: '\\(H_k(K;G)\\): the same construction with chains whose coefficients lie in \\(G\\), for instance \\(\\Z/2\\) (chains are then sets of simplices) or \\(\\Q\\). Plain \\(H_k(K)\\) means integer coefficients.',
		chapter,
		see: ['mod-2-homology']
	},
	{
		key: 'mod-2-homology',
		term: 'Mod-2 homology',
		def: 'Homology with coefficients in \\(\\Z/2\\). Chains are sets of simplices and orientations never matter, which makes it the simplest homology to compute; but it forgets torsion of odd order and confuses some different spaces, such as the torus and the Klein bottle.',
		chapter
	},
	{
		key: 'zeroth-homology',
		term: 'Zeroth homology',
		def: '\\(H_0(K) \\cong \\Z^c\\), where \\(c\\) is the number of path components; a basis is given by one vertex from each component.',
		chapter,
		anchor: 'thm-h0'
	},
	{
		key: 'augmentation',
		term: 'Augmentation',
		def: 'The homomorphism \\(\\varepsilon\\colon C_0 \\to \\Z\\) that adds up the coefficients of a 0-chain. It vanishes on boundaries, since \\(\\varepsilon([v]-[u]) = 0\\).',
		chapter,
		anchor: 'def-reduced',
		see: ['reduced-homology']
	},
	{
		key: 'reduced-homology',
		term: 'Reduced homology',
		def: 'The homology \\(\\tilde H_k\\) of the augmented chain complex. \\(\\tilde H_0\\) counts pieces minus one and \\(\\tilde H_k = H_k\\) for \\(k \\ge 1\\), so a point has no reduced homology and \\(\\tilde H_k(S^n)\\) is \\(\\Z\\) exactly for \\(k = n\\).',
		chapter,
		anchor: 'def-reduced'
	},
	{
		key: 'euler-poincare-formula',
		term: 'Euler–Poincaré formula',
		def: '\\(\\chi(K) = \\sum (-1)^k n_k = \\sum (-1)^k b_k\\): the alternating count of simplices equals the alternating sum of Betti numbers, over any field.',
		chapter,
		anchor: 'thm-euler-poincare'
	},
	{
		key: 'positive-simplex',
		term: 'Positive simplex',
		def: 'When a complex is built one simplex at a time, a \\(k\\)-simplex whose boundary was already a boundary. Adding it creates a new \\(k\\)-cycle and raises \\(b_k\\) by one.',
		chapter,
		see: ['negative-simplex']
	},
	{
		key: 'negative-simplex',
		term: 'Negative simplex',
		def: 'A \\(k\\)-simplex whose boundary was a cycle that did not yet bound. Adding it fills that cycle in, killing a \\((k-1)\\)-class and lowering \\(b_{k-1}\\) by one.',
		chapter,
		see: ['positive-simplex']
	},
	{
		key: 'two-cycle',
		term: '2-cycle',
		def: 'A 2-chain with zero boundary, such as the four faces of a hollow tetrahedron oriented consistently, or all the coherently oriented triangles of a closed orientable surface.',
		chapter
	},
	{
		key: 'cavity',
		term: 'Cavity',
		def: 'An informal name for a non-zero class in \\(H_2\\): a region enclosed by a 2-cycle that is not filled in, like the inside of a hollow sphere.',
		chapter
	},
	{
		key: 'seam-crossing-count',
		term: 'Seam-crossing count',
		def: 'On a surface drawn as a glued square, the signed number of times a chain crosses a seam. It vanishes on every boundary, so it can prove that a loop does not bound. It is a first example of a cocycle.',
		chapter
	},
	{
		key: 'homology-generator',
		term: 'Generators of homology',
		def: 'Cycles whose classes generate \\(H_k\\). On the torus the bottom row \\(a\\) and the left column \\(b\\) of the grid generate \\(H_1 \\cong \\Z^2\\). Generators are never unique: any homologous cycles work as well.',
		chapter
	}
];
