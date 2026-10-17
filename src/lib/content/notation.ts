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
			{ tex: '\\deg f', read: 'the degree of f', meaning: 'how many times a map of spheres wraps, counted with signs', chapter: 'homology/invariance' },
			{ tex: 'H_k(X, A)', read: 'relative homology of X rel A', meaning: 'homology after crushing A', chapter: 'homology/exact-sequences' },
			{ tex: '\\partial_*', read: 'the connecting map', meaning: 'Hₙ(C) → Hₙ₋₁(A) in a long exact sequence: a cycle back to the boundary it came from', chapter: 'homology/exact-sequences' }
		]
	},
	{
		title: 'Knots',
		rows: [
			{ tex: '\\overline K', read: 'K bar', meaning: 'the mirror image of the knot K', chapter: 'homology/knots' },
			{ tex: 'K_1 \\# K_2', read: 'K one sum K two', meaning: 'the connected sum: cut both open and join the ends', chapter: 'homology/knots' },
			{ tex: '\\mu,\\ \\lambda', read: 'mu, lambda', meaning: 'meridian and longitude: once around the knot’s tube, once along it', chapter: 'homology/knots' },
			{ tex: '\\operatorname{lk}(\\gamma, K)', read: 'the linking number of gamma and K', meaning: 'how often γ winds around K, with signs: [γ] = lk(γ, K)[μ]', chapter: 'homology/knots' },
			{ tex: 'B_n,\\ \\sigma_i', read: 'the braid group on n strands; sigma i', meaning: 'braids on n strands; σᵢ swaps the strands in places i and i + 1 once', chapter: 'homology/knots' },
			{ tex: 'g(K)', read: 'the genus of K', meaning: 'the least genus of a Seifert surface for K', chapter: 'homology/knots' },
			{ tex: 'w(D)', read: 'the writhe of D', meaning: 'the sum of the signs of the crossings of a diagram', chapter: 'homology/knots' },
			{ tex: '\\langle D \\rangle', read: 'the bracket of D', meaning: 'the Kauffman bracket: a sum over the states of a diagram', chapter: 'homology/knots' },
			{ tex: 'V_K(t)', read: 'the Jones polynomial of K', meaning: '(−A³)^(−w) ⟨D⟩ with A = t^(−1/4)', chapter: 'homology/knots' },
			{ tex: '\\Delta_K(t)', read: 'the Alexander polynomial of K', meaning: 'det(V − tVᵀ) for a Seifert matrix V', chapter: 'homology/knots' },
			{ tex: '\\mathit{Kh}^{i,j}(K)', read: 'Khovanov homology of K', meaning: 'a bigraded homology whose graded Euler characteristic is the Jones polynomial', chapter: 'homology/knots' },
			{ tex: 'u(K)', read: 'the unknotting number of K', meaning: 'the fewest crossing changes that untie K', chapter: 'homology/knots' }
		]
	},
	{
		title: 'Persistence',
		rows: [
			{ tex: 'U_r', read: 'U r', meaning: 'the union of the balls of radius r around the data points', chapter: 'homology/persistence' },
			{ tex: '\\check C_r(P)', read: 'the Čech complex of P at scale r', meaning: 'a simplex for every set of points whose balls share a point', chapter: 'homology/persistence' },
			{ tex: '\\mathrm{VR}_r(P)', read: 'the Vietoris–Rips complex of P at scale r', meaning: 'a simplex for every set of points whose balls meet in pairs', chapter: 'homology/persistence' },
			{ tex: '[b, d)', read: 'a bar from b to d', meaning: 'a class born at scale b that dies at scale d', chapter: 'homology/persistence' },
			{ tex: 'b_k^{r,s}', read: 'the persistent Betti number', meaning: 'how many k-classes alive at r are still alive at s', chapter: 'homology/persistence' },
			{ tex: 'd_B', read: 'bottleneck distance', meaning: 'how far apart two persistence diagrams are', chapter: 'homology/persistence' }
		]
	},
	{
		title: 'Cochains and cohomology',
		rows: [
			{ tex: 'C^k(K;G) = \\Hom(C_k(K), G)', read: 'k-cochains', meaning: 'measurements on k-simplices', chapter: 'cohomology/cochains' },
			{ tex: '\\ip{\\varphi}{c}', read: 'phi paired with c', meaning: 'pairing a measurement with a place', chapter: 'cohomology/cochains' },
			{ tex: '\\delta', read: 'coboundary', meaning: '(δφ)(σ) = φ(∂σ): discrete gradient, curl, …', chapter: 'cohomology/cochains' },
			{ tex: 'H^k(X;G) = Z^k / B^k', read: 'the k-th cohomology of X', meaning: 'cocycles modulo coboundaries: obstructions', chapter: 'cohomology/cohomology-groups' },
			{ tex: 'f^*', read: 'f upper star', meaning: 'the induced map on cohomology (pulls back)', chapter: 'cohomology/cohomology-groups' },
			{ tex: '\\Ext(A, \\Z)', read: 'Ext of A and Z', meaning: 'for finitely generated A, its torsion; it carries the torsion of Hₖ₋₁ into Hᵏ', chapter: 'cohomology/cohomology-groups' },
			{ tex: '\\alpha \\smile \\beta', read: 'alpha cup beta', meaning: 'the cup product of cohomology classes', chapter: 'cohomology/cup-product' },
			{ tex: '[M]', read: 'the fundamental class of M', meaning: 'the whole closed oriented manifold as one cycle', chapter: 'cohomology/cup-product' },
			{ tex: 'c \\frown \\varphi', read: 'c cap phi', meaning: 'the cap product: a p-cochain eats the front p-face of a chain, leaving the back face', chapter: 'cohomology/poincare-duality' },
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
		title: 'Curvature and bundles',
		rows: [
			{ tex: 'K', read: 'Gaussian curvature', meaning: 'the product of the two principal curvatures at a point of a surface', chapter: 'cohomology/characteristic-classes' },
			{ tex: '\\iint_M K\\,dA = 2\\pi\\chi(M)', read: 'Gauss–Bonnet', meaning: 'total curvature is topology', chapter: 'cohomology/characteristic-classes' },
			{ tex: 'w_1(E)', read: 'the first Stiefel–Whitney class', meaning: 'in H¹(B; ℤ/2): zero exactly when E is orientable', chapter: 'cohomology/characteristic-classes' },
			{ tex: 'e(E)', read: 'the Euler class', meaning: 'the obstruction to a nowhere-zero section; e(TM) gives χ(M)', chapter: 'cohomology/characteristic-classes' },
			{ tex: 'c_1(L)', read: 'the first Chern class', meaning: 'in H²(B; ℤ): the twisting of a complex line bundle', chapter: 'cohomology/characteristic-classes' }
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
	},
	{
		title: 'Horizons',
		rows: [
			{ tex: '\\pi_n(X)', read: 'the n-th homotopy group of X', meaning: 'maps of the n-sphere into X, up to homotopy', chapter: 'big-picture/horizons' },
			{ tex: 'K(G, n)', read: 'an Eilenberg–MacLane space', meaning: 'a space whose only homotopy group is G, in degree n', chapter: 'big-picture/horizons' },
			{ tex: '[X, S^1]', read: 'maps from X to the circle, up to homotopy', meaning: 'the same as H¹(X; ℤ)', chapter: 'big-picture/horizons' },
			{ tex: '\\Delta = dd^* + d^*d', read: 'the Hodge Laplacian', meaning: 'its kernel, the harmonic forms, picks one form in each class', chapter: 'big-picture/horizons' },
			{ tex: '\\mathcal H^k', read: 'harmonic k-forms', meaning: 'forms with Δω = 0; isomorphic to de Rham cohomology', chapter: 'big-picture/horizons' },
			{ tex: 'K^0(X)', read: 'K-theory of X', meaning: 'vector bundles on X, made into a group', chapter: 'big-picture/horizons' }
		]
	}
];
