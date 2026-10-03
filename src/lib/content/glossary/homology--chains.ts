import type { GlossaryEntry } from './types';

const chapter = 'homology/chains';

export const entries: GlossaryEntry[] = [
	{
		key: 'chain',
		term: 'Chain (k-chain)',
		def: 'An inventory of *k*-simplices. Mod 2, a set of *k*-simplices, added by symmetric difference; with integer coefficients, a formal sum \\(\\sum a_\\sigma \\sigma\\) of oriented *k*-simplices, added coefficient by coefficient.',
		chapter,
		anchor: 'def-chain-mod-2',
		see: ['chain-group', 'integer-chain']
	},
	{
		key: 'zero-chain',
		term: 'Zero chain',
		def: 'The chain with every coefficient \\(0\\) (mod 2: the empty set of simplices), written \\(0\\).',
		chapter,
		anchor: 'def-chain-mod-2'
	},
	{
		key: 'chain-group',
		term: 'Chain group',
		def: '\\(C_k(K)\\): all integer *k*-chains of \\(K\\), the free abelian group on the *k*-simplices, \\(\\cong \\Z^{n_k}\\). Mod 2, \\(C_k(K;\\Z/2)\\) is a vector space over \\(\\Z/2\\) of dimension \\(n_k\\).',
		chapter,
		anchor: 'def-chain-group-mod-2'
	},
	{
		key: 'integer-chain',
		term: 'Integer chain',
		def: 'A formal sum \\(\\sum a_\\sigma \\sigma\\) with integer coefficients: \\(-\\sigma\\) is \\(\\sigma\\) traversed the other way, \\(2\\sigma\\) is \\(\\sigma\\) traversed twice. Reducing the coefficients mod 2 gives a mod-2 chain.',
		chapter,
		anchor: 'def-integer-chain'
	},
	{
		key: 'facet',
		term: 'Facet (codimension-one face)',
		def: 'A face of a simplex obtained by deleting exactly one vertex. A *k*-simplex has \\(k+1\\) facets: a triangle has three edges, a tetrahedron four triangles.',
		chapter,
		anchor: 'boundary-mod-2'
	},
	{
		key: 'boundary-operator',
		term: 'Boundary operator ∂',
		def: 'The map \\(\\partial_k\\colon C_k \\to C_{k-1}\\) sending a simplex to the (signed) sum of its facets and extended to chains by linearity. Mod 2, \\(\\partial c\\) is the set of faces occurring an odd number of times: the loose ends of a set of edges, the rim of a set of triangles.',
		chapter,
		anchor: 'def-signed-boundary',
		see: ['boundary-formula', 'boundary-of-a-boundary']
	},
	{
		key: 'boundary-formula',
		term: 'Boundary formula',
		def: '\\(\\partial[v_0, \\dots, v_k] = \\sum_{i=0}^k (-1)^i [v_0, \\dots, \\hat v_i, \\dots, v_k]\\): the alternating sum of the faces, the *i*-th leaving out the *i*-th vertex. For an edge, \\(\\partial[v_0,v_1] = v_1 - v_0\\) (head minus tail).',
		chapter,
		anchor: 'def-signed-boundary'
	},
	{
		key: 'hat-notation',
		term: 'Hat notation',
		def: 'A hat over an entry of a list means “leave it out”: \\([v_0, \\hat v_1, v_2] = [v_0, v_2]\\).',
		chapter,
		anchor: 'def-signed-boundary'
	},
	{
		key: 'head-minus-tail',
		term: 'Head minus tail',
		def: 'The boundary of an oriented edge from \\(v_0\\) to \\(v_1\\): \\(\\partial[v_0, v_1] = v_1 - v_0\\). Along a path the middle vertices cancel and only the endpoints survive.',
		chapter,
		anchor: 'integer-chains'
	},
	{
		key: 'extend-linearly',
		term: 'Extending linearly',
		def: 'Defining a map on all chains from its values on single simplices by \\(\\partial(\\sum a_\\sigma \\sigma) = \\sum a_\\sigma \\partial\\sigma\\). The result respects sums: \\(\\partial(c + c\') = \\partial c + \\partial c\'\\).',
		chapter,
		anchor: 'def-signed-boundary'
	},
	{
		key: 'boundary-of-a-boundary',
		term: '∂∘∂ = 0',
		def: 'The boundary of a boundary is zero: each face of a face lies in exactly two faces, counted twice (mod 2) or with opposite signs (over \\(\\Z\\)). Consequence: every boundary is a cycle, \\(B_k \\subseteq Z_k\\).',
		chapter,
		anchor: 'thm-dd'
	},
	{
		key: 'oriented-simplex',
		term: 'Oriented simplex',
		def: 'A simplex with a chosen order of its vertices, two orders counting as the same if they differ by an even number of swaps. Reversing the orientation negates it: \\([v_1, v_0] = -[v_0, v_1]\\). By convention we write vertices in increasing order.',
		chapter,
		anchor: 'orientation'
	},
	{
		key: 'reordering-sign',
		term: 'Sign of a reordering',
		def: '\\(+1\\) if a reordering of a list can be done with an even number of swaps, \\(-1\\) if it needs an odd number. Reordering an oriented simplex multiplies it (and its boundary) by this sign: \\([2,0,1] = [0,1,2]\\), \\([0,2,1] = -[0,1,2]\\).',
		chapter,
		anchor: 'orientation'
	},
	{
		key: 'coherent-orientation',
		term: 'Coherently oriented',
		def: 'Neighbouring triangles are coherently oriented when they turn the same way, so that they cross their shared edge in opposite directions and it cancels in the boundary of their sum.',
		chapter,
		anchor: 'integer-chains'
	},
	{
		key: 'boundary-matrix',
		term: 'Boundary matrix',
		def: 'The matrix of \\(\\partial_k\\): one row per \\((k-1)\\)-simplex, one column per *k*-simplex; column *j* lists the coefficients of the boundary of the *j*-th simplex. Consecutive boundary matrices multiply to zero.',
		chapter,
		anchor: 'def-boundary-matrix'
	},
	{
		key: 'chain-complex',
		term: 'Chain complex',
		def: 'A sequence of abelian groups (or vector spaces) \\(C_k\\) with maps \\(\\partial_k\\colon C_k \\to C_{k-1}\\) such that \\(\\partial_{k-1} \\circ \\partial_k = 0\\) for every *k*.',
		chapter,
		anchor: 'def-chain-complex',
		see: ['cycle-group', 'boundary-group']
	},
	{
		key: 'differential',
		term: 'Differential (of a chain complex)',
		def: 'Another name for the maps \\(\\partial_k\\) of a chain complex, borrowed from the \\(d\\) of calculus, which also satisfies \\(d \\circ d = 0\\).',
		chapter,
		anchor: 'def-chain-complex'
	},
	{
		key: 'simplicial-chain-complex',
		term: 'Simplicial chain complex',
		def: 'The chain groups \\(C_k(K)\\) of a simplicial complex \\(K\\) together with its boundary maps (or the same with coefficients mod 2).',
		chapter,
		anchor: 'chain-complexes'
	},
	{
		key: 'cycle-group',
		term: 'Cycles Zₖ',
		def: '\\(Z_k = \\ker\\partial_k\\): the *k*-chains with zero boundary. Since \\(\\partial_0 = 0\\), every 0-chain is a cycle.',
		chapter,
		anchor: 'def-cycles-boundaries'
	},
	{
		key: 'boundary-group',
		term: 'Boundaries Bₖ',
		def: '\\(B_k = \\im\\partial_{k+1}\\): the *k*-chains of the form \\(\\partial c\\). Because \\(\\partial\\partial = 0\\), \\(B_k \\subseteq Z_k\\); the gap between them is homology.',
		chapter,
		anchor: 'def-cycles-boundaries'
	}
];
