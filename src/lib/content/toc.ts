// The table of contents: the single source of truth for parts, chapters,
// their URLs, ordering, and prerequisites. Layouts, navigation, the map,
// and prev/next links are all derived from this file.

export interface Chapter {
	/** stable id, e.g. "homology/chains" — equals the route path without slashes at the ends */
	id: string;
	/** number within the book, e.g. "3.2" */
	num: string;
	title: string;
	subtitle: string;
	/** one or two sentences for cards and meta descriptions */
	blurb: string;
	/** chapter ids that should be read first */
	prereqs: string[];
	/** rough reading time in minutes */
	minutes: number;
}

export interface Part {
	id: string;
	numeral: string; // roman numeral for display
	title: string;
	tagline: string;
	color: string; // CSS colour token for the part
	chapters: Chapter[];
}

export const parts: Part[] = [
	{
		id: 'prelude',
		numeral: '0',
		title: 'Prelude',
		tagline: 'Why holes? And how to read the language they are written in.',
		color: 'var(--gold)',
		chapters: [
			{
				id: 'prelude/shape-of-a-question',
				num: '0.1',
				title: 'The Shape of a Question',
				subtitle: 'Holes, invariants, and the journey ahead',
				blurb:
					'What does it mean for two shapes to be “the same”? Why would anyone count holes? A tour of the ideas this book will build, from Euler’s polyhedra to modern data science.',
				prereqs: [],
				minutes: 35
			},
			{
				id: 'prelude/reading-math',
				num: '0.2',
				title: 'How to Read Mathematics',
				subtitle: 'Symbols, definitions, theorems and proofs',
				blurb:
					'A gentle guide to mathematical notation and logic: sets of symbols, Greek letters, quantifiers, “if and only if”, and how definitions, theorems and proofs fit together.',
				prereqs: [],
				minutes: 45
			}
		]
	},
	{
		id: 'foundations',
		numeral: 'I',
		title: 'Foundations',
		tagline: 'The language of structure: sets, functions, groups, and linear algebra.',
		color: 'var(--blue)',
		chapters: [
			{
				id: 'foundations/sets-and-functions',
				num: '1.1',
				title: 'Sets and Functions',
				subtitle: 'Collections and the arrows between them',
				blurb:
					'Sets, subsets, products, and functions — injective, surjective, bijective — plus composition, images and preimages. The vocabulary everything else is written in.',
				prereqs: ['prelude/reading-math'],
				minutes: 45
			},
			{
				id: 'foundations/equivalence',
				num: '1.2',
				title: 'Equivalence and Quotients',
				subtitle: 'The art of declaring different things the same',
				blurb:
					'Equivalence relations, partitions, and quotient sets: the single idea behind clock arithmetic, gluing shapes together, and homology itself.',
				prereqs: ['foundations/sets-and-functions'],
				minutes: 45
			},
			{
				id: 'foundations/groups',
				num: '1.3',
				title: 'Groups',
				subtitle: 'The algebra of symmetry and of counting',
				blurb:
					'What a group is and why mathematicians care: integers, clocks and symmetries; subgroups, homomorphisms, kernels and images.',
				prereqs: ['foundations/equivalence'],
				minutes: 55
			},
			{
				id: 'foundations/abelian-groups',
				num: '1.4',
				title: 'Abelian Groups and Formal Sums',
				subtitle: 'Quotients, free groups, and the shape of every finite answer',
				blurb:
					'Cosets and quotient groups, the first isomorphism theorem, direct sums, free abelian groups of formal sums, and the classification theorem: ℤʳ ⊕ torsion.',
				prereqs: ['foundations/groups'],
				minutes: 55
			},
			{
				id: 'foundations/linear-algebra',
				num: '1.5',
				title: 'Linear Algebra',
				subtitle: 'Vectors, matrices, kernels, images — and duality',
				blurb:
					'Vector spaces over ℝ and over ℤ/2, linear maps as matrices, kernel and image, rank–nullity, quotient spaces, dual spaces and transposes, and the Smith normal form.',
				prereqs: ['foundations/abelian-groups'],
				minutes: 80
			}
		]
	},
	{
		id: 'topology',
		numeral: 'II',
		title: 'Shapes',
		tagline: 'Topology: what survives when you stretch, bend and squeeze.',
		color: 'var(--teal)',
		chapters: [
			{
				id: 'topology/spaces',
				num: '2.1',
				title: 'Spaces and Continuity',
				subtitle: 'Rubber-sheet geometry made precise',
				blurb:
					'From distance to open sets to topological spaces; continuity as “no tearing”; homeomorphism, and why a coffee cup is a doughnut.',
				prereqs: ['foundations/sets-and-functions'],
				minutes: 55
			},
			{
				id: 'topology/gluing',
				num: '2.2',
				title: 'Gluing Spaces Together',
				subtitle: 'Cylinders, tori, Klein bottles and projective planes from a square',
				blurb:
					'Quotient spaces in action: fold and glue a square into a cylinder, Möbius band, torus, sphere, Klein bottle and real projective plane.',
				prereqs: ['topology/spaces', 'foundations/equivalence'],
				minutes: 45
			},
			{
				id: 'topology/homotopy',
				num: '2.3',
				title: 'Homotopy',
				subtitle: 'Shapes up to continuous deformation',
				blurb:
					'Homotopies of maps, homotopy equivalence, deformation retractions, contractible spaces, and a first look at loops and the fundamental group.',
				prereqs: ['topology/spaces'],
				minutes: 50
			},
			{
				id: 'topology/manifolds',
				num: '2.4',
				title: 'Manifolds and Surfaces',
				subtitle: 'Spaces that look flat up close',
				blurb:
					'Charts and atlases, smooth manifolds and tangent spaces, orientability and the Möbius band, and the classification of surfaces.',
				prereqs: ['topology/gluing'],
				minutes: 60
			},
			{
				id: 'topology/simplicial-complexes',
				num: '2.5',
				title: 'Simplicial Complexes',
				subtitle: 'Building shapes from triangles',
				blurb:
					'Simplices, simplicial complexes, triangulations, orientations, abstract complexes, and CW complexes — the combinatorial raw material of homology.',
				prereqs: ['topology/gluing'],
				minutes: 60
			},
			{
				id: 'topology/euler-characteristic',
				num: '2.6',
				title: 'The Euler Characteristic',
				subtitle: 'V − E + F, and the first topological invariant',
				blurb:
					'Euler’s polyhedron formula, why V − E + F never changes under subdivision, χ = 2 − 2g, and the hint that a deeper theory is hiding underneath.',
				prereqs: ['topology/simplicial-complexes'],
				minutes: 40
			}
		]
	},
	{
		id: 'homology',
		numeral: 'III',
		title: 'Homology',
		tagline: 'Counting holes with algebra.',
		color: 'var(--gold)',
		chapters: [
			{
				id: 'homology/cycles-and-boundaries',
				num: '3.1',
				title: 'Cycles and Boundaries',
				subtitle: 'A hole is a cycle that bounds nothing',
				blurb:
					'The central intuition of homology, without any algebra yet: loops, the regions they enclose, and the loops that enclose nothing at all.',
				prereqs: ['topology/euler-characteristic'],
				minutes: 50
			},
			{
				id: 'homology/chains',
				num: '3.2',
				title: 'Chains and the Boundary Operator',
				subtitle: 'Adding up simplices, and the boundary of a boundary',
				blurb:
					'Chains with ℤ/2 and ℤ coefficients, orientations, the boundary operator ∂, the fundamental fact ∂∘∂ = 0, and chain complexes.',
				prereqs: ['homology/cycles-and-boundaries', 'foundations/abelian-groups'],
				minutes: 45
			},
			{
				id: 'homology/homology-groups',
				num: '3.3',
				title: 'Homology Groups',
				subtitle: 'Cycles modulo boundaries',
				blurb:
					'The definition Hₙ = ker ∂ₙ / im ∂ₙ₊₁, Betti numbers, and complete computations for the point, circle, disk, sphere and torus.',
				prereqs: ['homology/chains'],
				minutes: 50
			},
			{
				id: 'homology/computing',
				num: '3.4',
				title: 'Computing Homology',
				subtitle: 'Matrices, ranks, and the Smith normal form',
				blurb:
					'Homology as linear algebra: boundary matrices, rank computations, torsion from the Smith normal form, the Klein bottle and projective plane — and a live homology calculator.',
				prereqs: ['homology/homology-groups', 'foundations/linear-algebra'],
				minutes: 50
			},
			{
				id: 'homology/invariance',
				num: '3.5',
				title: 'Maps, Invariance, and First Triumphs',
				subtitle: 'Functoriality and the fixed-point theorems',
				blurb:
					'Continuous maps induce maps on homology; homotopy invariance; singular homology; and the payoff: Brouwer’s fixed point theorem, degree, and the hairy ball theorem.',
				prereqs: ['homology/homology-groups', 'topology/homotopy'],
				minutes: 60
			},
			{
				id: 'homology/exact-sequences',
				num: '3.6',
				title: 'Exact Sequences and Mayer–Vietoris',
				subtitle: 'Computing by cutting and pasting',
				blurb:
					'Exactness, the long exact sequence, relative homology, the Mayer–Vietoris sequence, and cellular homology — the power tools of computation.',
				prereqs: ['homology/invariance'],
				minutes: 45
			},
			{
				id: 'homology/persistence',
				num: '3.7',
				title: 'Persistent Homology',
				subtitle: 'The shape of data',
				blurb:
					'From point clouds to simplicial complexes, filtrations, barcodes and persistence diagrams: how homology finds robust structure in noisy data.',
				prereqs: ['homology/computing'],
				minutes: 65
			}
		]
	},
	{
		id: 'cohomology',
		numeral: 'IV',
		title: 'Cohomology',
		tagline: 'Measuring obstructions: from local to global.',
		color: 'var(--violet)',
		chapters: [
			{
				id: 'cohomology/cochains',
				num: '4.1',
				title: 'Cochains: Measuring Shapes',
				subtitle: 'Potentials, gradients, and impossible staircases',
				blurb:
					'Instead of adding up pieces of a shape, assign numbers to them. Potentials and their differences, Kirchhoff’s laws, and the puzzle of locally consistent but globally impossible data.',
				prereqs: ['homology/homology-groups'],
				minutes: 55
			},
			{
				id: 'cohomology/cohomology-groups',
				num: '4.2',
				title: 'Cohomology Groups',
				subtitle: 'Cocycles modulo coboundaries',
				blurb:
					'The cochain complex, δ∘δ = 0, cohomology groups and their computation, contravariance, and the Universal Coefficient Theorem with its surprising torsion shift.',
				prereqs: ['cohomology/cochains', 'foundations/linear-algebra'],
				minutes: 40
			},
			{
				id: 'cohomology/differential-forms',
				num: '4.3',
				title: 'Differential Forms',
				subtitle: 'Calculus that knows about shape',
				blurb:
					'Line integrals, 1-forms as stacks of sheets, the wedge product, the exterior derivative unifying grad, curl and div, d∘d = 0, and the generalized Stokes theorem.',
				prereqs: ['topology/manifolds', 'foundations/linear-algebra'],
				minutes: 50
			},
			{
				id: 'cohomology/de-rham',
				num: '4.4',
				title: 'de Rham Cohomology',
				subtitle: 'Closed forms that are not exact',
				blurb:
					'The vortex field around a puncture, closed versus exact forms, the Poincaré lemma, de Rham’s theorem, and integration as the pairing of homology with cohomology.',
				prereqs: ['cohomology/differential-forms', 'cohomology/cohomology-groups'],
				minutes: 40
			},
			{
				id: 'cohomology/cup-product',
				num: '4.5',
				title: 'The Cup Product',
				subtitle: 'Cohomology is a ring',
				blurb:
					'Multiplying cohomology classes: wedge products of forms, the simplicial cup product, and two spaces with identical homology that cohomology tells apart.',
				prereqs: ['cohomology/de-rham'],
				minutes: 50
			},
			{
				id: 'cohomology/poincare-duality',
				num: '4.6',
				title: 'Poincaré Duality',
				subtitle: 'The mirror inside every manifold',
				blurb:
					'Dual cell decompositions, Hᵏ ≅ Hₙ₋ₖ for closed oriented manifolds, intersection numbers, and why cup products count intersections.',
				prereqs: ['cohomology/cup-product'],
				minutes: 40
			},
			{
				id: 'cohomology/sheaves',
				num: '4.7',
				title: 'Sheaves and Čech Cohomology',
				subtitle: 'From local data to global truth',
				blurb:
					'Open covers and nerves, Čech cochains, sheaves and the gluing axiom, and cohomology as the precise measure of why local solutions fail to glue.',
				prereqs: ['cohomology/cohomology-groups'],
				minutes: 60
			},
			{
				id: 'cohomology/characteristic-classes',
				num: '4.8',
				title: 'Curvature and Characteristic Classes',
				subtitle: 'When geometry knows topology',
				blurb:
					'Vector bundles and their twisting, the hairy ball theorem, Gauss–Bonnet, Euler and Chern classes, magnetic monopoles and topological matter.',
				prereqs: ['cohomology/de-rham', 'cohomology/poincare-duality'],
				minutes: 50
			}
		]
	},
	{
		id: 'big-picture',
		numeral: 'V',
		title: 'The Bigger Picture',
		tagline: 'Categories, homological algebra, and where the road leads.',
		color: 'var(--rose)',
		chapters: [
			{
				id: 'big-picture/categories',
				num: '5.1',
				title: 'Categories and Functors',
				subtitle: 'The mathematics of mathematics',
				blurb:
					'Objects and arrows, functors and natural transformations, commutative diagrams and universal properties — the language that makes “homology is a functor” precise.',
				prereqs: ['homology/invariance'],
				minutes: 55
			},
			{
				id: 'big-picture/homological-algebra',
				num: '5.2',
				title: 'Homological Algebra',
				subtitle: 'Ext, Tor, spectral sequences and axioms',
				blurb:
					'Chain complexes in the abstract, derived functors, Ext and Tor, a first glimpse of spectral sequences, and the Eilenberg–Steenrod axioms that characterize homology.',
				prereqs: ['big-picture/categories', 'cohomology/cohomology-groups'],
				minutes: 45
			},
			{
				id: 'big-picture/horizons',
				num: '5.3',
				title: 'Horizons',
				subtitle: 'Where homology leads next',
				blurb:
					'Hodge theory, generalized cohomology theories, homotopy groups, applications from sensor networks to physics, and a guide to further study.',
				prereqs: ['big-picture/homological-algebra'],
				minutes: 35
			}
		]
	}
];

export const chapters: (Chapter & { part: Part; index: number })[] = parts.flatMap((part) =>
	part.chapters.map((c) => ({ ...c, part }))
).map((c, index) => ({ ...c, index }));

export const chapterById = new Map(chapters.map((c) => [c.id, c]));

/** Route id like "/(book)/homology/chains" → chapter id "homology/chains". */
export function chapterIdFromRoute(routeId: string | null | undefined): string {
	if (!routeId) return '';
	return routeId
		.split('/')
		.filter((seg) => seg && !(seg.startsWith('(') && seg.endsWith(')')))
		.join('/');
}

export function neighbours(id: string) {
	const c = chapterById.get(id);
	if (!c) return { prev: undefined, next: undefined };
	return { prev: chapters[c.index - 1], next: chapters[c.index + 1] };
}
