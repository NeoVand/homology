import type { GlossaryEntry } from './types';

const chapter = 'cohomology/poincare-duality';

export const entries: GlossaryEntry[] = [
	{
		key: 'poincare-duality',
		term: 'Poincaré duality',
		def: 'For a closed orientable \\(n\\)-manifold, \\(H^k(M;\\Z) \\cong H_{n-k}(M;\\Z)\\) for every \\(k\\); with \\(\\Z/2\\) coefficients the same holds for every closed manifold. The isomorphism is cap product with the fundamental class.',
		chapter,
		anchor: 'poincare-duality',
		see: ['fundamental-class', 'cap-product', 'dual-cell-decomposition']
	},
	{
		key: 'betti-number-symmetry',
		term: 'Symmetry of Betti numbers',
		def: 'For a closed orientable \\(n\\)-manifold, \\(b_k = b_{n-k}\\): the list of Betti numbers reads the same backwards (the torus has \\(1, 2, 1\\)). Mod 2 Betti numbers are palindromes for every closed manifold.',
		chapter,
		anchor: 'consequences',
		see: ['poincare-duality', 'betti-number']
	},
	{
		key: 'odd-dimensional-euler-characteristic',
		term: 'Euler characteristic in odd dimensions',
		def: 'Every closed manifold of odd dimension has \\(\\chi = 0\\): in \\(\\sum_k (-1)^k b_k\\), the terms for \\(k\\) and \\(n-k\\) have equal Betti numbers but opposite signs, so they cancel.',
		chapter,
		anchor: 'odd-euler',
		see: ['betti-number-symmetry', 'euler-poincare-formula']
	},
	{
		key: 'fundamental-class',
		term: 'Fundamental class',
		def: 'For a closed, connected, orientable \\(n\\)-manifold \\(M\\), the class \\([M] \\in H_n(M;\\Z) \\cong \\Z\\) of the sum of all top simplices, coherently oriented: the whole manifold as a cycle. Evaluating a top-dimensional cochain on it is the discrete version of integrating over \\(M\\).',
		chapter,
		anchor: 'def-fundamental-class',
		see: ['mod-2-fundamental-class', 'coherent-orientation', 'orientable']
	},
	{
		key: 'mod-2-fundamental-class',
		term: 'Mod-2 fundamental class',
		def: 'The class \\([M]_2 \\in H_n(M;\\Z/2)\\) of the plain sum of all top simplices. It exists for every closed manifold, orientable or not, because mod 2 every face is counted twice and the signs no longer matter.',
		chapter,
		anchor: 'def-fundamental-class',
		see: ['fundamental-class']
	},
	{
		key: 'dual-cell',
		term: 'Dual cell',
		def: 'For a \\(k\\)-simplex \\(\\sigma\\) of a triangulated \\(n\\)-manifold, the \\((n-k)\\)-dimensional cell \\(\\sigma^*\\) built from the barycentric subdivision, running outwards from the barycentre of \\(\\sigma\\). It crosses \\(\\sigma\\) in exactly one point: a vertex has a dual face, an edge a dual edge, a triangle of a surface a dual vertex.',
		chapter,
		anchor: 'def-dual-cells',
		see: ['dual-cell-decomposition', 'barycentric-subdivision']
	},
	{
		key: 'dual-cell-decomposition',
		term: 'Dual cell decomposition',
		def: 'The cell decomposition \\(K^*\\) of a triangulated closed manifold formed by all the dual cells. Matching each simplex with its dual cell turns cochains of \\(K\\) into chains of \\(K^*\\) and the coboundary into the boundary — the idea behind Poincaré duality.',
		chapter,
		anchor: 'def-dual-cells',
		see: ['dual-cell', 'poincare-duality']
	},
	{
		key: 'poincare-dual',
		term: 'Poincaré dual (of a loop)',
		def: 'For an oriented closed curve \\(C\\) on an oriented surface, the class \\(\\mathrm{PD}[C] \\in H^1\\) of the fence along \\(C\\) that counts \\(+1\\) each time a path crosses \\(C\\) from its left to its right, and \\(-1\\) the other way.',
		chapter,
		anchor: 'def-poincare-dual',
		see: ['fence', 'intersection-number']
	},
	{
		key: 'cap-product',
		term: 'Cap product',
		def: 'The operation \\(\\sigma \\frown \\varphi = \\varphi([v_0, \\dots, v_p])\\cdot[v_p, \\dots, v_n]\\) combining an \\(n\\)-chain and a \\(p\\)-cochain into an \\((n-p)\\)-chain: the cochain is spent on the front face and the back face survives. It satisfies \\(\\ip{\\psi}{c \\frown \\varphi} = \\ip{\\varphi \\smile \\psi}{c}\\).',
		chapter,
		anchor: 'def-cap',
		see: ['cup-product', 'duality-map']
	},
	{
		key: 'duality-map',
		term: 'Duality map',
		def: 'For a closed oriented \\(n\\)-manifold, the map \\(D(\\varphi) = [M] \\frown \\varphi\\) from \\(H^p(M)\\) to \\(H_{n-p}(M)\\). The modern statement of Poincaré duality is that it is an isomorphism.',
		chapter,
		anchor: 'cap-product',
		see: ['cap-product', 'fundamental-class', 'poincare-duality']
	},
	{
		key: 'intersection-number',
		term: 'Intersection number',
		def: 'For oriented closed curves \\(C_1, C_2\\) on an oriented surface, crossing each other cleanly, the sum over crossing points of \\(+1\\) or \\(-1\\) according to whether \\(C_2\\) crosses \\(C_1\\) from right to left or from left to right. It depends only on the homology classes, and equals the cup product of the Poincaré duals evaluated on \\([M]\\).',
		chapter,
		anchor: 'def-intersection-number',
		see: ['poincare-dual', 'intersection-pairing']
	},
	{
		key: 'intersection-pairing',
		term: 'Intersection pairing',
		def: 'The pairing between \\(H_k(M)\\) and \\(H_{n-k}(M)\\) of a closed oriented \\(n\\)-manifold that counts signed intersections of cycles. By Poincaré duality it is perfect over a field: every nonzero class is met a nonzero number of times by some class of complementary dimension.',
		chapter,
		anchor: 'intersections',
		see: ['intersection-number', 'intersection-form']
	},
	{
		key: 'intersection-form',
		term: 'Intersection form',
		def: 'For a closed oriented \\(2m\\)-manifold, the pairing \\(Q(\\alpha, \\beta) = \\ip{\\alpha \\smile \\beta}{[M]}\\) on \\(H^m(M;\\Z)\\) modulo torsion, written as a square matrix of integers. It is symmetric when \\(m\\) is even, antisymmetric when \\(m\\) is odd, and unimodular.',
		chapter,
		anchor: 'def-intersection-form',
		see: ['unimodular', 'signature', 'cup-product']
	},
	{
		key: 'unimodular',
		term: 'Unimodular',
		def: 'A square integer matrix (or pairing) is unimodular if its determinant is \\(\\pm 1\\), so that its inverse also has integer entries. Poincaré duality makes every intersection form unimodular.',
		chapter,
		anchor: 'def-intersection-form',
		see: ['intersection-form', 'determinant']
	},
	{
		key: 'signature',
		term: 'Signature',
		def: 'The number of positive eigenvalues minus the number of negative ones of a symmetric form. The signature of the intersection form is an invariant of a closed oriented 4-manifold: \\(1\\) for \\(\\CP^2\\), \\(0\\) for \\(S^2 \\times S^2\\).',
		chapter,
		anchor: 'intersection-form',
		see: ['intersection-form']
	},
	{
		key: 'relative-cohomology',
		term: 'Relative cohomology',
		def: 'The cohomology \\(H^k(M, A)\\) of the cochains that vanish on every simplex of a subspace \\(A\\): measurements that ignore \\(A\\). For a manifold with boundary, taking \\(A = \\partial M\\) gives measurements that ignore the rim.',
		chapter,
		anchor: 'lefschetz',
		see: ['relative-homology', 'lefschetz-duality']
	},
	{
		key: 'lefschetz-duality',
		term: 'Lefschetz duality',
		def: 'Poincaré duality for a compact orientable \\(n\\)-manifold with boundary: \\(H^k(M, \\partial M) \\cong H_{n-k}(M)\\) and \\(H^k(M) \\cong H_{n-k}(M, \\partial M)\\). On an annulus, the core circle and a rung from rim to rim are dual to each other.',
		chapter,
		anchor: 'lefschetz',
		see: ['poincare-duality', 'relative-cohomology']
	},
	{
		key: 'alexander-duality',
		term: 'Alexander duality',
		def: 'For a compact, locally contractible, nonempty proper subspace \\(K\\) of the sphere \\(S^n\\), \\(\\tilde H_i(S^n \\setminus K) \\cong \\tilde H^{n-i-1}(K)\\): the homology of the space around \\(K\\) depends only on the cohomology of \\(K\\). It implies the Jordan curve theorem, and that every knot complement has \\(H_1 \\cong \\Z\\).',
		chapter,
		anchor: 'alexander',
		see: ['jordan-curve-theorem', 'linking-number']
	},
	{
		key: 'linking-number',
		term: 'Linking number',
		def: 'How many times a closed curve \\(\\gamma\\) winds around a knot or another closed curve \\(K\\) in space: the multiple of the meridian class that \\(\\gamma\\) represents in \\(H_1(\\R^3 \\setminus K) \\cong \\Z\\). Gauss gave an integral formula for it in 1833; it is also the signed number of times \\(\\gamma\\) pierces a Seifert surface of \\(K\\).',
		chapter,
		anchor: 'alexander',
		see: ['alexander-duality', 'seifert-surface', 'winding-number']
	},
	{
		key: 'seifert-surface',
		term: 'Seifert surface',
		def: 'An oriented surface in space whose boundary is a given knot. It is the fence of the cohomology class "linking number with the knot": the linking number of a loop is the signed number of times it pierces the surface. For the unknot it is a disk.',
		chapter,
		anchor: 'alexander',
		see: ['linking-number', 'fence']
	}
];
