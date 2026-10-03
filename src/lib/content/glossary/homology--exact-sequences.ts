import type { GlossaryEntry } from './types';

const chapter = 'homology/exact-sequences';

export const entries: GlossaryEntry[] = [
	{
		key: 'long-exact-sequence',
		term: 'Long exact sequence',
		def: 'An exact sequence that goes on in both directions, typically \\(\\cdots\\to H_n(A)\\to H_n(B)\\to H_n(C)\\to H_{n-1}(A)\\to\\cdots\\). Knowing most of the groups and maps lets you solve for the rest.',
		chapter,
		anchor: 'thm-zigzag',
		see: ['connecting-homomorphism', 'zig-zag-lemma']
	},
	{
		key: 'short-exact-sequence-of-chain-complexes',
		term: 'Short exact sequence of chain complexes',
		def: 'Chain maps \\(0\\to A_\\bullet\\to B_\\bullet\\to C_\\bullet\\to 0\\) such that \\(0\\to A_n\\to B_n\\to C_n\\to0\\) is short exact in every degree \\(n\\). Example: \\(0\\to C(A)\\to C(X)\\to C(X,A)\\to0\\).',
		chapter,
		anchor: 'long-exact-sequence',
		see: ['zig-zag-lemma']
	},
	{
		key: 'zig-zag-lemma',
		term: 'Zig-zag lemma',
		def: 'A short exact sequence of chain complexes induces a long exact sequence in homology, with connecting maps \\(\\partial_*\\colon H_n(C)\\to H_{n-1}(A)\\). In homological algebra it is a form of the snake lemma.',
		chapter,
		anchor: 'thm-zigzag',
		see: ['connecting-homomorphism', 'long-exact-sequence']
	},
	{
		key: 'connecting-homomorphism',
		term: 'Connecting homomorphism',
		def: 'The map \\(\\partial_*\\colon H_n(C)\\to H_{n-1}(A)\\) in a long exact sequence: lift a cycle of \\(C\\) to \\(B\\), take its boundary, and pull the result back to \\(A\\). For a pair it literally takes the boundary of a relative cycle.',
		chapter,
		anchor: 'thm-zigzag',
		see: ['zig-zag-lemma']
	},
	{
		key: 'relative-chain',
		term: 'Relative chains',
		def: 'The quotient groups \\(C_n(X,A) = C_n(X)/C_n(A)\\): chains in \\(X\\), where chains lying in the subspace \\(A\\) count as zero.',
		chapter,
		anchor: 'def-relative',
		see: ['relative-homology']
	},
	{
		key: 'relative-cycle',
		term: 'Relative cycle',
		def: 'A chain in \\(X\\) whose boundary lies in \\(A\\) (not necessarily zero). The whole disk is a relative cycle of \\((D^2,S^1)\\).',
		chapter,
		anchor: 'def-relative',
		see: ['relative-homology', 'relative-boundary']
	},
	{
		key: 'relative-boundary',
		term: 'Relative boundary',
		def: 'A chain of the form \\(\\partial d + a\\) with \\(a\\) a chain in \\(A\\): a boundary, once chains in \\(A\\) are ignored.',
		chapter,
		anchor: 'def-relative',
		see: ['relative-cycle']
	},
	{
		key: 'relative-homology',
		term: 'Relative homology',
		def: '\\(H_n(X,A)\\): the homology of the relative chains \\(C_n(X)/C_n(A)\\). For good pairs it is the reduced homology of \\(X/A\\): homology after crushing \\(A\\) to a point.',
		chapter,
		anchor: 'def-relative',
		see: ['good-pair', 'long-exact-sequence-of-a-pair', 'excision']
	},
	{
		key: 'good-pair',
		term: 'Good pair',
		def: 'A pair \\((X,A)\\) with \\(A\\) a nonempty closed subspace that is a deformation retract of some neighbourhood in \\(X\\), e.g. a subcomplex. For good pairs \\(H_n(X,A)\\cong\\tilde H_n(X/A)\\).',
		chapter,
		anchor: 'thm-good-pairs',
		see: ['relative-homology']
	},
	{
		key: 'long-exact-sequence-of-a-pair',
		term: 'Long exact sequence of a pair',
		def: '\\(\\cdots\\to H_n(A)\\to H_n(X)\\to H_n(X,A)\\to H_{n-1}(A)\\to\\cdots\\), coming from the short exact sequence of chains \\(0\\to C(A)\\to C(X)\\to C(X,A)\\to0\\).',
		chapter,
		anchor: 'relative-homology',
		see: ['relative-homology', 'connecting-homomorphism']
	},
	{
		key: 'local-homology',
		term: 'Local homology',
		def: 'The groups \\(H_k(X, X\\setminus\\{x\\})\\), which depend only on a neighbourhood of the point \\(x\\). In \\(\\mathbb R^n\\) they are \\(\\mathbb Z\\) for \\(k = n\\) and \\(0\\) otherwise, so they detect dimension.',
		chapter,
		anchor: 'relative-homology',
		see: ['excision', 'invariance-of-dimension']
	},
	{
		key: 'excision',
		term: 'Excision',
		def: 'If \\(Z\\subseteq A\\subseteq X\\) and the closure of \\(Z\\) lies in the interior of \\(A\\), then \\(H_n(X\\setminus Z, A\\setminus Z)\\cong H_n(X,A)\\): what happens deep inside \\(A\\) does not matter. It makes homology local.',
		chapter,
		anchor: 'thm-excision',
		see: ['relative-homology', 'mayer-vietoris-sequence']
	},
	{
		key: 'mayer-vietoris-sequence',
		term: 'Mayer–Vietoris sequence',
		def: 'For \\(X = U\\cup V\\) (open sets): the long exact sequence \\(\\cdots\\to H_n(U\\cap V)\\to H_n(U)\\oplus H_n(V)\\to H_n(X)\\to H_{n-1}(U\\cap V)\\to\\cdots\\). Inclusion–exclusion for holes.',
		chapter,
		anchor: 'thm-mv',
		see: ['connecting-homomorphism', 'excision']
	},
	{
		key: 'cellular-chain-complex',
		term: 'Cellular chain complex',
		def: 'For a CW complex, \\(C^{\\mathrm{CW}}_n = H_n(X^n, X^{n-1})\\), the free abelian group on the \\(n\\)-cells, with boundary maps built from the long exact sequences of skeleta.',
		chapter,
		anchor: 'def-cellular',
		see: ['cellular-homology', 'cellular-boundary-formula']
	},
	{
		key: 'cellular-homology',
		term: 'Cellular homology',
		def: 'The homology of the cellular chain complex, isomorphic to singular homology. Hatcher calls it “homology squared”; it computes homology from one generator per cell.',
		chapter,
		anchor: 'thm-cellular',
		see: ['cellular-chain-complex']
	},
	{
		key: 'cellular-boundary-formula',
		term: 'Cellular boundary formula',
		def: '\\(d(e^n_\\alpha) = \\sum_\\beta d_{\\alpha\\beta}e^{n-1}_\\beta\\), where \\(d_{\\alpha\\beta}\\) is the degree of “attach the boundary of \\(e_\\alpha\\), then collapse everything except \\(e_\\beta\\)”: how often the boundary runs over \\(e_\\beta\\), with signs.',
		chapter,
		anchor: 'cellular-homology',
		see: ['cellular-chain-complex', 'degree']
	},
	{
		key: 'exponent-sum',
		term: 'Exponent sum',
		def: 'The number of times a letter occurs in a word, counting \\(a\\) as \\(+1\\) and \\(a^{-1}\\) as \\(-1\\). For a disk glued along a word, it is the coefficient of that edge in the cellular boundary of the face.',
		chapter,
		anchor: 'cellular-homology',
		see: ['cellular-boundary-formula']
	},
	{
		key: 'real-projective-space',
		term: 'Real projective space',
		def: '\\(\\mathbb{RP}^n\\): the sphere \\(S^n\\) with opposite points identified, i.e. the lines through the origin in \\(\\mathbb R^{n+1}\\). It has one cell in each dimension, with cellular boundary \\(d_k = 1 + (-1)^k\\).',
		chapter,
		anchor: 'cellular-examples',
		see: ['cellular-homology']
	},
	{
		key: 'complex-projective-space',
		term: 'Complex projective space',
		def: '\\(\\mathbb{CP}^n\\): the complex lines through the origin in \\(\\mathbb C^{n+1}\\). It has one cell in each even dimension \\(0,2,\\dots,2n\\), so \\(H_{2k}\\cong\\mathbb Z\\) and odd groups vanish.',
		chapter,
		anchor: 'cellular-examples',
		see: ['cellular-homology']
	},
	{
		key: 'dunce-cap',
		term: 'Dunce cap',
		def: 'The space obtained from a triangle by gluing its sides according to the word \\(aaa^{-1}\\). It is contractible, although no triangulation of it can be collapsed face by face to a point.',
		chapter,
		anchor: 'exercises',
		see: ['cellular-homology']
	},
	{
		key: 'splitting',
		term: 'Split short exact sequence',
		def: 'A short exact sequence \\(0\\to A\\to B\\to C\\to 0\\) in which \\(B\\cong A\\oplus C\\) compatibly with the maps. Every short exact sequence of abelian groups ending in a free group such as \\(\\mathbb Z\\) splits.',
		chapter,
		anchor: 'torus-and-klein',
		see: ['short-exact-sequence']
	}
];
