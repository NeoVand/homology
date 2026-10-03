// The notation index: every symbol used in the book, how to read it aloud,
// what it means, and where it is introduced.

export interface NotationRow {
	tex: string;
	read: string;
	meaning: string;
	chapter: string;
}

export interface NotationGroup {
	title: string;
	rows: NotationRow[];
}

export const notation: NotationGroup[] = [
	{
		title: 'Logic',
		rows: [
			{ tex: 'P \\land Q', read: 'P and Q', meaning: 'both statements are true', chapter: 'prelude/reading-math' },
			{ tex: 'P \\lor Q', read: 'P or Q', meaning: 'at least one is true (inclusive or)', chapter: 'prelude/reading-math' },
			{ tex: '\\lnot P', read: 'not P', meaning: 'the negation of P', chapter: 'prelude/reading-math' },
			{ tex: 'P \\Rightarrow Q', read: 'P implies Q; if P then Q', meaning: 'whenever P holds, Q holds', chapter: 'prelude/reading-math' },
			{ tex: 'P \\Leftrightarrow Q', read: 'P if and only if Q', meaning: 'P and Q are equivalent', chapter: 'prelude/reading-math' },
			{ tex: '\\forall x', read: 'for all x', meaning: 'universal quantifier', chapter: 'prelude/reading-math' },
			{ tex: '\\exists x', read: 'there exists an x', meaning: 'existential quantifier', chapter: 'prelude/reading-math' },
			{ tex: ':=', read: 'is defined to be', meaning: 'introduces a new name', chapter: 'prelude/reading-math' },
			{ tex: '\\blacksquare \\;\\text{or}\\; \\square', read: 'end of proof', meaning: 'the argument is complete', chapter: 'prelude/reading-math' }
		]
	},
	{
		title: 'Sets and functions',
		rows: [
			{ tex: 'x \\in A', read: 'x is an element of A', meaning: 'membership', chapter: 'foundations/sets-and-functions' },
			{ tex: 'A \\subseteq B', read: 'A is a subset of B', meaning: 'every element of A is in B', chapter: 'foundations/sets-and-functions' },
			{ tex: '\\varnothing', read: 'the empty set', meaning: 'the set with no elements', chapter: 'foundations/sets-and-functions' },
			{ tex: 'A \\cup B,\\ A \\cap B,\\ A \\setminus B', read: 'union, intersection, difference', meaning: 'combining sets', chapter: 'foundations/sets-and-functions' },
			{ tex: 'A \\times B', read: 'A cross B', meaning: 'all ordered pairs (a, b)', chapter: 'foundations/sets-and-functions' },
			{ tex: '\\setb{x \\in X}{P(x)}', read: 'the set of x in X such that P(x)', meaning: 'set-builder notation', chapter: 'foundations/sets-and-functions' },
			{ tex: 'f\\colon X \\to Y', read: 'f is a function from X to Y', meaning: 'X is the domain, Y the codomain', chapter: 'foundations/sets-and-functions' },
			{ tex: 'x \\mapsto f(x)', read: 'x maps to f of x', meaning: 'what f does to an element', chapter: 'foundations/sets-and-functions' },
			{ tex: 'g \\circ f', read: 'g after f', meaning: 'composition: first f, then g', chapter: 'foundations/sets-and-functions' },
			{ tex: 'f^{-1}(B)', read: 'the preimage of B under f', meaning: 'everything f sends into B (exists even if f has no inverse)', chapter: 'foundations/sets-and-functions' },
			{ tex: '\\id_X', read: 'the identity on X', meaning: 'the function that changes nothing', chapter: 'foundations/sets-and-functions' }
		]
	},
	{
		title: 'Sameness and quotients',
		rows: [
			{ tex: 'x \\sim y', read: 'x is equivalent to y', meaning: 'an equivalence relation', chapter: 'foundations/equivalence' },
			{ tex: '[x]', read: 'the class of x', meaning: 'everything equivalent to x', chapter: 'foundations/equivalence' },
			{ tex: 'X/{\\sim}', read: 'X mod tilde', meaning: 'the quotient set of classes', chapter: 'foundations/equivalence' },
			{ tex: '\\cong', read: 'is isomorphic to / homeomorphic to', meaning: 'the same up to renaming / stretching', chapter: 'foundations/groups' },
			{ tex: '\\simeq', read: 'is homotopy equivalent to', meaning: 'the same up to deformation', chapter: 'topology/homotopy' }
		]
	},
	{
		title: 'Groups and linear algebra',
		rows: [
			{ tex: '\\Z,\\ \\Q,\\ \\R,\\ \\C', read: 'integers, rationals, reals, complex numbers', meaning: 'the number systems', chapter: 'prelude/reading-math' },
			{ tex: '\\Z/n', read: 'Z mod n', meaning: 'integers on a clock with n hours', chapter: 'foundations/groups' },
			{ tex: '\\ker \\varphi,\\ \\im \\varphi', read: 'kernel, image', meaning: 'what is crushed to zero; what is reached', chapter: 'foundations/groups' },
			{ tex: 'G/H', read: 'G mod H', meaning: 'quotient group: collapse each coset to a point', chapter: 'foundations/abelian-groups' },
			{ tex: 'A \\oplus B', read: 'A direct sum B', meaning: 'pairs (a, b), added componentwise', chapter: 'foundations/abelian-groups' },
			{ tex: '\\Z^r \\oplus \\Z/d_1 \\oplus \\cdots', read: 'free part plus torsion', meaning: 'every finitely generated abelian group looks like this', chapter: 'foundations/abelian-groups' },
			{ tex: '\\rank A', read: 'rank of A', meaning: 'the number of independent columns / the size of the free part', chapter: 'foundations/linear-algebra' },
			{ tex: 'V^*', read: 'V dual', meaning: 'the space of measurements (linear functions) on V', chapter: 'foundations/linear-algebra' },
			{ tex: 'A^{\\mathsf T}', read: 'A transpose', meaning: 'rows become columns; pulls measurements back', chapter: 'foundations/linear-algebra' }
		]
	},
	{
		title: 'Spaces',
		rows: [
			{ tex: '\\R^n', read: 'R n', meaning: 'n-dimensional Euclidean space', chapter: 'topology/spaces' },
			{ tex: 'S^n,\\ D^n', read: 'the n-sphere, the n-disk', meaning: 'S¹ is a circle, S² the surface of a ball', chapter: 'topology/spaces' },
			{ tex: 'T^2,\\ K,\\ \\RP^2,\\ \\Sigma_g', read: 'torus, Klein bottle, projective plane, genus-g surface', meaning: 'the surfaces of the book', chapter: 'topology/gluing' },
			{ tex: 'X \\vee Y', read: 'X wedge Y', meaning: 'two spaces joined at a point', chapter: 'topology/gluing' },
			{ tex: 'X/A', read: 'X mod A', meaning: 'crush the subspace A to a single point', chapter: 'topology/gluing' },
			{ tex: '\\pi_1(X)', read: 'pi one of X', meaning: 'the fundamental group: loops up to deformation', chapter: 'topology/homotopy' },
			{ tex: '\\chi(X)', read: 'chi of X', meaning: 'Euler characteristic: V − E + F and its generalisations', chapter: 'topology/euler-characteristic' }
		]
	},
	{
		title: 'Chains and homology',
		rows: [
			{ tex: '[v_0, v_1, \\dots, v_k]', read: 'the oriented simplex v-zero … v-k', meaning: 'a k-simplex with a chosen order of vertices', chapter: 'topology/simplicial-complexes' },
			{ tex: 'C_k(K;G)', read: 'k-chains of K with coefficients in G', meaning: 'formal sums of k-simplices', chapter: 'homology/chains' },
			{ tex: '\\partial_k', read: 'boundary', meaning: 'sends a simplex to the signed sum of its faces', chapter: 'homology/chains' },
			{ tex: '\\partial \\circ \\partial = 0', read: 'the boundary of a boundary is zero', meaning: 'the fundamental identity', chapter: 'homology/chains' },
			{ tex: 'Z_k,\\ B_k', read: 'k-cycles, k-boundaries', meaning: 'kernel of ∂ₖ, image of ∂ₖ₊₁', chapter: 'homology/homology-groups' },
			{ tex: 'H_k(X) = Z_k / B_k', read: 'the k-th homology of X', meaning: 'cycles modulo boundaries: k-dimensional holes', chapter: 'homology/homology-groups' },
			{ tex: 'b_k', read: 'the k-th Betti number', meaning: 'the rank of Hₖ: how many independent k-holes', chapter: 'homology/homology-groups' },
			{ tex: '\\tilde H_k', read: 'reduced homology', meaning: 'homology with one copy of ℤ removed from H₀', chapter: 'homology/homology-groups' },
			{ tex: 'f_*', read: 'f lower star', meaning: 'the map a continuous map induces on homology (pushes forward)', chapter: 'homology/invariance' },
			{ tex: 'H_k(X, A)', read: 'relative homology of X rel A', meaning: 'homology after crushing A', chapter: 'homology/exact-sequences' }
		]
	},
	{
		title: 'Cochains and cohomology',
		rows: [
			{ tex: 'C^k(K;G) = \\Hom(C_k(K), G)', read: 'k-cochains', meaning: 'measurements on k-simplices', chapter: 'cohomology/cochains' },
			{ tex: '\\delta', read: 'coboundary', meaning: '(δφ)(σ) = φ(∂σ): discrete gradient, curl, …', chapter: 'cohomology/cochains' },
			{ tex: 'H^k(X;G) = Z^k / B^k', read: 'the k-th cohomology of X', meaning: 'cocycles modulo coboundaries: obstructions', chapter: 'cohomology/cohomology-groups' },
			{ tex: '\\ip{\\varphi}{c}', read: 'phi evaluated on c', meaning: 'pairing a measurement with a place', chapter: 'cohomology/cohomology-groups' },
			{ tex: 'f^*', read: 'f upper star', meaning: 'the induced map on cohomology (pulls back)', chapter: 'cohomology/cohomology-groups' },
			{ tex: '\\alpha \\smile \\beta', read: 'alpha cup beta', meaning: 'the cup product of cohomology classes', chapter: 'cohomology/cup-product' },
			{ tex: '[M]', read: 'the fundamental class of M', meaning: 'the whole closed oriented manifold as one cycle', chapter: 'cohomology/poincare-duality' },
			{ tex: '\\check H^k(\\mathcal U; G)', read: 'Čech cohomology of the cover U', meaning: 'cohomology built from overlaps of an open cover', chapter: 'cohomology/sheaves' }
		]
	},
	{
		title: 'Calculus and forms',
		rows: [
			{ tex: '\\Omega^k(M)', read: 'k-forms on M', meaning: 'things you integrate over k-dimensional pieces', chapter: 'cohomology/differential-forms' },
			{ tex: 'd', read: 'exterior derivative', meaning: 'unifies gradient, curl and divergence; d∘d = 0', chapter: 'cohomology/differential-forms' },
			{ tex: '\\alpha \\wedge \\beta', read: 'alpha wedge beta', meaning: 'the wedge product: oriented area/volume', chapter: 'cohomology/differential-forms' },
			{ tex: '\\int_{\\partial M} \\omega = \\int_M d\\omega', read: 'Stokes’ theorem', meaning: 'boundary values equal total derivative inside', chapter: 'cohomology/differential-forms' },
			{ tex: 'H^k_{\\dR}(M)', read: 'de Rham cohomology', meaning: 'closed forms modulo exact forms', chapter: 'cohomology/de-rham' },
			{ tex: 'd\\theta', read: 'the angle form', meaning: '(−y dx + x dy)/(x² + y²): closed but not exact on ℝ²∖0', chapter: 'cohomology/de-rham' }
		]
	},
	{
		title: 'Categories',
		rows: [
			{ tex: '\\Set,\\ \\Top,\\ \\Ab', read: 'the categories of sets, spaces, abelian groups', meaning: 'objects with their structure-preserving maps', chapter: 'big-picture/categories' },
			{ tex: 'F\\colon \\mathcal C \\to \\mathcal D', read: 'a functor from C to D', meaning: 'a structure-preserving map between categories', chapter: 'big-picture/categories' },
			{ tex: '\\mathcal C^{\\mathrm{op}}', read: 'C op', meaning: 'the same category with all arrows reversed', chapter: 'big-picture/categories' },
			{ tex: '\\eta\\colon F \\Rightarrow G', read: 'a natural transformation from F to G', meaning: 'a choice-free way to turn F into G', chapter: 'big-picture/categories' },
			{ tex: '\\Ext,\\ \\Tor', read: 'Ext and Tor', meaning: 'derived functors that measure failures of exactness', chapter: 'big-picture/homological-algebra' }
		]
	}
];
