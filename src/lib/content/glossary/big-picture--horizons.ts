import type { GlossaryEntry } from './types';

const chapter = 'big-picture/horizons';

export const entries: GlossaryEntry[] = [
	{
		key: 'hodge-laplacian',
		term: 'Hodge Laplacian',
		def: 'On differential forms, \\(\\Delta = dd^* + d^*d\\); on the edges of a simplicial complex, \\(L_1 = \\delta_0\\delta_0^{\\mathsf T} + \\delta_1^{\\mathsf T}\\delta_1\\). Its kernel is the space of harmonic forms or flows, one dimension for each independent cohomology class.',
		chapter,
		anchor: 'def-hodge-laplacian',
		see: ['harmonic-form', 'hodge-decomposition', 'hodge-theorem']
	},
	{
		key: 'harmonic-form',
		term: 'Harmonic form',
		def: 'A differential form \\(\\omega\\) with \\(\\Delta\\omega = 0\\); on a closed manifold this means it is both closed (\\(d\\omega = 0\\)) and co-closed (\\(d^*\\omega = 0\\)). On the flat torus the harmonic 1-forms are the constant forms \\(a\\,dx + b\\,dy\\).',
		chapter,
		anchor: 'thm-hodge',
		see: ['hodge-theorem', 'harmonic-flow', 'de-rham-cohomology']
	},
	{
		key: 'hodge-theorem',
		term: 'Hodge theorem',
		def: 'On a closed oriented Riemannian manifold, every de Rham cohomology class contains exactly one harmonic form, and \\(\\Omega^k = d\\,\\Omega^{k-1}\\oplus d^*\\Omega^{k+1}\\oplus\\mathcal H^k\\) orthogonally. On a simplicial complex the same splitting is computed by least squares.',
		chapter,
		anchor: 'thm-hodge',
		see: ['harmonic-form', 'hodge-decomposition', 'hodge-laplacian']
	},
	{
		key: 'harmonic-representative',
		term: 'Harmonic representative',
		def: 'The unique harmonic cocycle (or form) in a cohomology class. Among all representatives it has the least energy, spreading the class as evenly as possible.',
		chapter,
		anchor: 'hodge-discrete',
		see: ['hodge-theorem', 'harmonic-flow', 'circular-coordinates']
	},
	{
		key: 'circular-coordinates',
		term: 'Circular coordinates',
		def: 'Angles for the points of a data set, found from an integer 1-cocycle — using \\(H^1(X;\\Z)\\cong[X,S^1]\\) — after smoothing it to its harmonic representative by least squares. Introduced by de Silva, Morozov and Vejdemo-Johansson.',
		chapter,
		anchor: 'circular-coordinates',
		see: ['persistent-cohomology', 'harmonic-representative', 'cocycle']
	},
	{
		key: 'persistent-cohomology',
		term: 'Persistent cohomology',
		def: 'The cohomology version of persistent homology. Over a field it has the same barcode, but each bar comes with a cocycle — which is what circular coordinates need.',
		chapter,
		anchor: 'circular-coordinates',
		see: ['persistent-homology', 'barcode', 'circular-coordinates']
	},
	{
		key: 'k-theory',
		term: 'K-theory',
		def: 'A generalized cohomology theory built from vector bundles: \\(K^0(X)\\) consists of formal differences \\([E]-[F]\\) of complex vector bundles over \\(X\\), up to stable equivalence. Created by Atiyah and Hirzebruch around 1961, after Grothendieck’s algebraic version.',
		chapter,
		anchor: 'k-theory',
		see: ['bott-periodicity', 'generalized-cohomology-theory']
	},
	{
		key: 'bott-periodicity',
		term: 'Bott periodicity',
		def: 'Complex K-theory repeats with period two: \\(K^n(\\mathrm{pt})\\) is \\(\\Z\\) for even \\(n\\) and \\(0\\) for odd \\(n\\). Proved by Raoul Bott in 1959.',
		chapter,
		anchor: 'k-theory',
		see: ['k-theory']
	},
	{
		key: 'cobordism',
		term: 'Cobordism',
		def: 'Two closed \\(n\\)-manifolds are cobordant if together they form the boundary of a compact \\((n+1)\\)-manifold. Cobordism classes form groups and a generalized homology theory; for surfaces (unoriented), a closed surface bounds exactly when its Euler characteristic is even.',
		chapter,
		anchor: 'cobordism',
		see: ['generalized-cohomology-theory', 'euler-characteristic']
	},
	{
		key: 'eilenberg-maclane-space',
		term: 'Eilenberg–MacLane space',
		def: 'A space \\(K(G,n)\\) whose only nonzero homotopy group is \\(\\pi_n = G\\). It represents cohomology: \\(H^n(X;G)\\cong[X,K(G,n)]\\) for cell complexes \\(X\\). Examples: \\(S^1 = K(\\Z,1)\\) and \\(\\CP^\\infty = K(\\Z,2)\\).',
		chapter,
		anchor: 'spectra',
		see: ['homotopy-group', 'spectrum']
	},
	{
		key: 'spectrum',
		term: 'Spectrum',
		def: 'A sequence of spaces \\(E_0, E_1, E_2, \\dots\\), each equivalent to the loop space of the next. By Brown’s theorem (1962) every generalized cohomology theory is represented by a spectrum; their study is stable homotopy theory.',
		chapter,
		anchor: 'spectra',
		see: ['eilenberg-maclane-space', 'generalized-cohomology-theory']
	},
	{
		key: 'homotopy-group',
		term: 'Homotopy group',
		def: '\\(\\pi_n(X)\\) is the group of homotopy classes of maps from the \\(n\\)-sphere into \\(X\\) that send a chosen point to a chosen point. \\(\\pi_1\\) is the fundamental group; \\(\\pi_n\\) is abelian for \\(n\\ge 2\\). Unlike homology, \\(\\pi_k(S^2)\\) is nonzero for infinitely many \\(k\\).',
		chapter,
		anchor: 'homotopy-groups',
		see: ['fundamental-group', 'hopf-fibration', 'hurewicz-theorem']
	},
	{
		key: 'hopf-fibration',
		term: 'Hopf fibration',
		def: 'The map \\(S^3\\to S^2\\), \\((z_1,z_2)\\mapsto z_1/z_2\\), under which the preimage of every point is a circle, any two of them linked once. Found by Heinz Hopf in 1931, it generates \\(\\pi_3(S^2)\\cong\\Z\\).',
		chapter,
		anchor: 'hopf-fibration',
		see: ['hopf-invariant', 'homotopy-group', 'linking-number']
	},
	{
		key: 'hopf-invariant',
		term: 'Hopf invariant',
		def: 'For a map \\(S^3\\to S^2\\), the linking number of the preimages of two points. It does not change under homotopy, and it equals 1 for the Hopf map.',
		chapter,
		anchor: 'hopf-fibration',
		see: ['hopf-fibration', 'linking-number']
	},
	{
		key: 'linking-number',
		term: 'Linking number',
		def: 'An integer counting how many times one closed curve in space winds around another. Gauss gave a double integral for it, and it does not change as the curves move without passing through each other.',
		chapter,
		anchor: 'hopf-fibration',
		see: ['hopf-invariant', 'winding-number']
	},
	{
		key: 'riemann-roch',
		term: 'Riemann–Roch theorem',
		def: 'For a line bundle \\(L\\) of degree \\(d\\) on a compact Riemann surface of genus \\(g\\): \\(\\dim H^0(L)-\\dim H^1(L) = d+1-g\\). Sheaf cohomology on the left, topology on the right.',
		chapter,
		anchor: 'sheaves',
		see: ['sheaf-cohomology']
	},
	{
		key: 'etale-cohomology',
		term: 'Étale cohomology',
		def: 'A cohomology theory built by Grothendieck and his school for shapes defined by polynomial equations over any field, including finite fields. With it Pierre Deligne proved the last of the Weil conjectures in 1974.',
		chapter,
		anchor: 'sheaves',
		see: ['sheaf-cohomology', 'derived-functor']
	},
	{
		key: 'categorification',
		term: 'Categorification',
		def: 'Promoting a number or polynomial to a homology theory whose Euler characteristic recovers it, as Khovanov homology does for the Jones polynomial. Betti numbers are the original example: their alternating sum is \\(\\chi\\).',
		chapter,
		anchor: 'applications',
		see: ['khovanov-homology', 'euler-characteristic']
	},
	{
		key: 'khovanov-homology',
		term: 'Khovanov homology',
		def: 'A homology theory of knots (Mikhail Khovanov, 2000) whose graded Euler characteristic is the Jones polynomial. Kronheimer and Mrowka proved in 2011 that it detects the unknot.',
		chapter,
		anchor: 'applications',
		see: ['categorification']
	},
	{
		key: 'topological-complexity',
		term: 'Topological complexity',
		def: 'Michael Farber’s measure of how many separate continuous rules a motion planner on a configuration space needs. Cup products in cohomology give lower bounds; one rule suffices only for a contractible space.',
		chapter,
		anchor: 'applications',
		see: ['cup-product', 'contractible']
	},
	{
		key: 'tqft',
		term: 'Topological quantum field theory',
		def: 'In Atiyah’s axioms (1988), in effect a functor from a category whose objects are manifolds and whose arrows are cobordisms between them, to vector spaces.',
		chapter,
		anchor: 'applications',
		see: ['cobordism', 'functor']
	}
];
