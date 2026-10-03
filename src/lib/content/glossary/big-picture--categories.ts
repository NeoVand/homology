import type { GlossaryEntry } from './types';

const chapter = 'big-picture/categories';

export const entries: GlossaryEntry[] = [
	{
		key: 'category',
		term: 'Category',
		def: 'A collection of *objects* together with, for each pair of objects, a set of *arrows* between them, with an identity arrow on each object and an associative composition. Examples: sets and functions (\\(\\Set\\)), abelian groups and homomorphisms (\\(\\Ab\\)), spaces and continuous maps (\\(\\Top\\)).',
		chapter,
		anchor: 'def-category',
		see: ['morphism', 'functor']
	},
	{
		key: 'morphism',
		term: 'Morphism (arrow)',
		def: 'An arrow \\(f\\colon A\\to B\\) of a category: something with a source and a target that can be composed with arrows that start where it ends. In familiar categories the arrows are structure-preserving maps, but in general they need not be functions at all.',
		chapter,
		anchor: 'def-category',
		see: ['category', 'hom-set']
	},
	{
		key: 'identity-arrow',
		term: 'Identity arrow',
		def: 'The arrow \\(1_A\\colon A\\to A\\) that every object of a category carries, which changes nothing under composition: \\(f\\circ 1_A = f = 1_B\\circ f\\).',
		chapter,
		anchor: 'def-category',
		see: ['category', 'identity-map']
	},
	{
		key: 'hom-set',
		term: 'Hom-set',
		def: 'The set \\(\\mathcal C(A,B)\\), also written \\(\\Hom_{\\mathcal C}(A,B)\\), of all arrows from \\(A\\) to \\(B\\) in a category \\(\\mathcal C\\). The name comes from *homomorphism*.',
		chapter,
		anchor: 'def-category',
		see: ['morphism']
	},
	{
		key: 'homotopy-category',
		term: 'Homotopy category',
		def: 'The category \\(\\mathsf{hTop}\\) whose objects are spaces and whose arrows are homotopy classes of continuous maps. Its isomorphisms are exactly the homotopy equivalences, and homology is a functor on it.',
		chapter,
		anchor: 'gallery',
		see: ['homotopy-equivalence', 'category']
	},
	{
		key: 'poset',
		term: 'Poset (as a category)',
		def: 'A partially ordered set — a set with a relation \\(\\le\\) that is reflexive, antisymmetric and transitive — viewed as a category with exactly one arrow \\(a\\to b\\) when \\(a\\le b\\) and none otherwise. Transitivity gives composition and reflexivity gives identities.',
		chapter,
		anchor: 'gallery',
		see: ['category']
	},
	{
		key: 'diagram-chase',
		term: 'Diagram chase',
		def: 'A proof that follows a single element around a commutative diagram, using commutativity and exactness at each step. The snake lemma is the classic example.',
		chapter,
		anchor: 'reading-diagrams',
		see: ['commutative-diagram', 'snake-lemma']
	},
	{
		key: 'isomorphism-in-a-category',
		term: 'Isomorphism (in a category)',
		def: 'An arrow \\(f\\colon A\\to B\\) with an inverse \\(g\\colon B\\to A\\): \\(g\\circ f = 1_A\\) and \\(f\\circ g = 1_B\\). One word for bijections, group isomorphisms, homeomorphisms and (in the homotopy category) homotopy equivalences.',
		chapter,
		anchor: 'def-iso',
		see: ['isomorphism', 'homotopy-category']
	},
	{
		key: 'functor',
		term: 'Functor',
		def: 'A map between categories, \\(F\\colon\\mathcal C\\to\\mathcal D\\): it sends objects to objects and arrows to arrows, preserving identities and composition, \\(F(g\\circ f) = F(g)\\circ F(f)\\). Homology \\(H_n\\colon\\Top\\to\\Ab\\) is the motivating example.',
		chapter,
		anchor: 'def-functor',
		see: ['functoriality', 'contravariant-functor', 'natural-transformation']
	},
	{
		key: 'forgetful-functor',
		term: 'Forgetful functor',
		def: 'A functor that forgets structure, such as \\(\\Grp\\to\\Set\\), which sends a group to its underlying set and a homomorphism to its underlying function.',
		chapter,
		anchor: 'functors',
		see: ['functor']
	},
	{
		key: 'based-space',
		term: 'Based space',
		def: 'A space with a chosen point (its basepoint). Based maps send basepoint to basepoint; based spaces and based maps form the category \\(\\Top_*\\), on which the fundamental group is a functor.',
		chapter,
		anchor: 'functors',
		see: ['fundamental-group', 'basepoint']
	},
	{
		key: 'opposite-category',
		term: 'Opposite category',
		def: 'The category \\(\\mathcal C\\op\\) with the same objects as \\(\\mathcal C\\) and every arrow reversed: an arrow \\(A\\to B\\) in \\(\\mathcal C\\op\\) is an arrow \\(B\\to A\\) in \\(\\mathcal C\\).',
		chapter,
		anchor: 'def-op',
		see: ['contravariant-functor']
	},
	{
		key: 'contravariant-functor',
		term: 'Contravariant functor',
		def: 'A functor that reverses arrows: \\(f\\colon A\\to B\\) goes to \\(F(f)\\colon F(B)\\to F(A)\\), and \\(F(g\\circ f) = F(f)\\circ F(g)\\). Equivalently, a functor \\(\\mathcal C\\op\\to\\mathcal D\\). Cohomology, dual spaces, \\(\\Hom(-,G)\\) and preimages are contravariant.',
		chapter,
		anchor: 'contravariance',
		see: ['opposite-category', 'functor', 'pullback']
	},
	{
		key: 'natural-transformation',
		term: 'Natural transformation',
		def: 'A way of comparing two functors \\(F, G\\colon\\mathcal C\\to\\mathcal D\\): an arrow \\(\\eta_X\\colon F(X)\\to G(X)\\) for each object \\(X\\), such that \\(G(f)\\circ\\eta_X = \\eta_Y\\circ F(f)\\) for every arrow \\(f\\colon X\\to Y\\). Natural maps are the ones defined without arbitrary choices.',
		chapter,
		anchor: 'def-nat',
		see: ['naturality-square', 'natural-isomorphism']
	},
	{
		key: 'naturality-square',
		term: 'Naturality square',
		def: 'For a family \\(\\eta\\) of arrows between functors \\(F\\) and \\(G\\), the square formed by \\(F(f)\\), \\(G(f)\\), \\(\\eta_X\\) and \\(\\eta_Y\\) for an arrow \\(f\\colon X\\to Y\\). The family is a natural transformation when every such square commutes.',
		chapter,
		anchor: 'def-nat',
		see: ['natural-transformation', 'commutative-diagram']
	},
	{
		key: 'natural-isomorphism',
		term: 'Natural isomorphism',
		def: 'A natural transformation each of whose components is an isomorphism. A finite-dimensional vector space is naturally isomorphic to its double dual; it is isomorphic to its dual, but not naturally.',
		chapter,
		anchor: 'def-nat',
		see: ['natural-transformation', 'double-dual']
	},
	{
		key: 'double-dual',
		term: 'Double dual',
		def: 'The dual of the dual, \\(V^{**}\\). For finite-dimensional \\(V\\), evaluation \\(v\\mapsto(\\varphi\\mapsto\\varphi(v))\\) is an isomorphism \\(V\\to V^{**}\\) that needs no choice of basis — the standard example of a natural isomorphism.',
		chapter,
		anchor: 'double-dual',
		see: ['dual-space', 'natural-isomorphism']
	},
	{
		key: 'universal-property',
		term: 'Universal property',
		def: 'A description of an object by the arrows into it or out of it: for example, a map into a product is the same thing as a pair of maps into the factors. An object with a universal property is unique up to a unique isomorphism.',
		chapter,
		anchor: 'universal-properties',
		see: ['categorical-product', 'coproduct', 'cokernel']
	},
	{
		key: 'categorical-product',
		term: 'Product (in a category)',
		def: 'An object \\(P\\) with arrows \\(p_1\\colon P\\to A\\) and \\(p_2\\colon P\\to B\\) such that every pair of arrows \\(X\\to A\\), \\(X\\to B\\) comes from exactly one arrow \\(X\\to P\\). The Cartesian product of sets and of spaces, the direct product of groups.',
		chapter,
		anchor: 'def-product',
		see: ['universal-property', 'coproduct']
	},
	{
		key: 'coproduct',
		term: 'Coproduct',
		def: 'The dual of a product: an object \\(Q\\) with arrows from \\(A\\) and from \\(B\\) such that every pair of arrows \\(A\\to X\\), \\(B\\to X\\) comes from exactly one arrow \\(Q\\to X\\). The disjoint union for sets and spaces; the direct sum \\(A\\oplus B\\) for abelian groups, where it is also the product.',
		chapter,
		anchor: 'coproducts',
		see: ['categorical-product', 'direct-sum']
	},
	{
		key: 'equivalence-of-categories',
		term: 'Equivalence of categories',
		def: 'Functors \\(F\\colon\\mathcal C\\to\\mathcal D\\) and \\(G\\colon\\mathcal D\\to\\mathcal C\\) whose round trips \\(G\\circ F\\) and \\(F\\circ G\\) are naturally isomorphic to the identity functors. Finite-dimensional vector spaces are equivalent to the category of matrices.',
		chapter,
		anchor: 'def-equivalence',
		see: ['natural-isomorphism', 'functor']
	},
	{
		key: 'additive-category',
		term: 'Additive category',
		def: 'A category in which arrows between any two objects form an abelian group, composition distributes over addition, there is a zero object, and finite direct sums exist (each both a product and a coproduct).',
		chapter,
		anchor: 'additive-abelian',
		see: ['abelian-category']
	},
	{
		key: 'abelian-category',
		term: 'Abelian category',
		def: 'An additive category in which every arrow has a kernel and a cokernel and the first isomorphism theorem holds. Abelian groups, vector spaces, chain complexes and sheaves of abelian groups are examples; exact sequences, homology and all of homological algebra make sense in any of them.',
		chapter,
		anchor: 'additive-abelian',
		see: ['additive-category', 'exact-sequence', 'first-isomorphism-theorem']
	}
];
