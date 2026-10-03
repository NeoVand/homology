import type { GlossaryEntry } from './types';

const chapter = 'foundations/sets-and-functions';

export const entries: GlossaryEntry[] = [
	{
		key: 'set',
		term: 'Set',
		def: 'A collection of objects, its *elements*. A set is determined by which things belong to it: order and repetition do not matter, so \\(\\{1,2\\} = \\{2,1,1\\}\\).',
		chapter,
		anchor: 'def-set',
		see: ['element', 'subset']
	},
	{
		key: 'element',
		term: 'Element (∈)',
		def: '\\(x\\in X\\), read “\\(x\\) is an element of \\(X\\)”, means that \\(x\\) is one of the things in the set \\(X\\); \\(x\\notin X\\) means it is not.',
		chapter,
		anchor: 'def-set',
		see: ['set']
	},
	{
		key: 'empty-set',
		term: 'Empty set (∅)',
		def: 'The unique set with no elements, \\(\\varnothing\\). It is a subset of every set. Note that \\(\\{\\varnothing\\}\\) is not empty: it has one element.',
		chapter,
		anchor: 'sets',
		see: ['set', 'subset']
	},
	{
		key: 'set-builder-notation',
		term: 'Set-builder notation',
		def: '\\(\\{x\\in X \\mid P(x)\\}\\), read “the set of all \\(x\\) in \\(X\\) such that \\(P(x)\\)”: the elements of \\(X\\) for which the statement \\(P(x)\\) is true. Some books write a colon instead of the bar.',
		chapter,
		anchor: 'sets',
		see: ['set']
	},
	{
		key: 'subset',
		term: 'Subset (⊆)',
		def: '\\(A\\subseteq B\\) means every element of \\(A\\) is an element of \\(B\\). Two sets are equal exactly when each is a subset of the other.',
		chapter,
		anchor: 'def-subset',
		see: ['double-inclusion', 'set']
	},
	{
		key: 'union',
		term: 'Union (∪)',
		def: '\\(A\\cup B = \\{x \\mid x\\in A \\text{ or } x\\in B\\}\\): everything in at least one of the two sets (“or” is inclusive).',
		chapter,
		anchor: 'def-set-operations',
		see: ['intersection']
	},
	{
		key: 'intersection',
		term: 'Intersection (∩)',
		def: '\\(A\\cap B = \\{x \\mid x\\in A \\text{ and } x\\in B\\}\\): what the two sets have in common. Sets with \\(A\\cap B=\\varnothing\\) are *disjoint*.',
		chapter,
		anchor: 'def-set-operations',
		see: ['union']
	},
	{
		key: 'set-difference',
		term: 'Set difference (∖)',
		def: '\\(A\\setminus B = \\{x\\in A \\mid x\\notin B\\}\\), read “\\(A\\) minus \\(B\\)”: remove from \\(A\\) whatever lies in \\(B\\).',
		chapter,
		anchor: 'def-set-operations',
		see: ['complement']
	},
	{
		key: 'complement',
		term: 'Complement',
		def: 'Inside a fixed universe \\(U\\), the complement of \\(A\\) is \\(A^c = U\\setminus A\\). De Morgan: \\((A\\cup B)^c = A^c\\cap B^c\\) and \\((A\\cap B)^c = A^c\\cup B^c\\).',
		chapter,
		anchor: 'def-set-operations',
		see: ['set-difference']
	},
	{
		key: 'cartesian-product',
		term: 'Cartesian product (×)',
		def: '\\(A\\times B\\) is the set of ordered pairs \\((a,b)\\) with \\(a\\in A\\), \\(b\\in B\\) — picture a grid. For finite sets, \\(|A\\times B| = |A|\\cdot|B|\\). Example: the torus is \\(S^1\\times S^1\\).',
		chapter,
		anchor: 'def-product',
		see: ['ordered-pair']
	},
	{
		key: 'ordered-pair',
		term: 'Ordered pair',
		def: 'A pair \\((a,b)\\) with a first and a second entry; \\((a,b)=(c,d)\\) exactly when \\(a=c\\) and \\(b=d\\). Unlike the set \\(\\{a,b\\}\\), order matters.',
		chapter,
		anchor: 'def-product',
		see: ['cartesian-product']
	},
	{
		key: 'function',
		term: 'Function (map)',
		def: 'A rule \\(f\\colon X\\to Y\\) assigning to *each* element \\(x\\) of the domain \\(X\\) *exactly one* element \\(f(x)\\) of the codomain \\(Y\\). Written \\(x\\mapsto f(x)\\).',
		chapter,
		anchor: 'def-function',
		see: ['domain', 'injective', 'surjective']
	},
	{
		key: 'domain',
		term: 'Domain and codomain',
		def: 'For \\(f\\colon X\\to Y\\), the domain \\(X\\) is where inputs come from and the codomain \\(Y\\) is where outputs must land. Changing either one changes the function.',
		chapter,
		anchor: 'def-function',
		see: ['function', 'image']
	},
	{
		key: 'image',
		term: 'Image',
		def: 'For \\(f\\colon X\\to Y\\) and \\(A\\subseteq X\\), the image \\(f(A) = \\{f(a) \\mid a\\in A\\}\\) is where the elements of \\(A\\) land. The image of \\(f\\) is \\(f(X)\\).',
		chapter,
		anchor: 'def-preimage',
		see: ['preimage']
	},
	{
		key: 'preimage',
		term: 'Preimage',
		def: 'For \\(f\\colon X\\to Y\\) and \\(B\\subseteq Y\\), \\(f^{-1}(B) = \\{x\\in X \\mid f(x)\\in B\\}\\): everyone who lands in \\(B\\). It exists even when \\(f\\) has no inverse, and it respects unions, intersections and complements.',
		chapter,
		anchor: 'def-preimage',
		see: ['image', 'function']
	},
	{
		key: 'injective',
		term: 'Injective (one-to-one)',
		def: '\\(f\\) is injective if \\(f(x)=f(x\')\\) implies \\(x=x\'\\): different inputs never collide.',
		chapter,
		anchor: 'def-injective',
		see: ['surjective', 'bijective']
	},
	{
		key: 'surjective',
		term: 'Surjective (onto)',
		def: '\\(f\\colon X\\to Y\\) is surjective if every \\(y\\in Y\\) equals \\(f(x)\\) for some \\(x\\): nothing in the codomain is missed.',
		chapter,
		anchor: 'def-injective',
		see: ['injective', 'bijective']
	},
	{
		key: 'bijective',
		term: 'Bijective (bijection)',
		def: 'Both injective and surjective: a perfect matching between domain and codomain. Exactly the functions that have an inverse.',
		chapter,
		anchor: 'def-injective',
		see: ['inverse-function', 'cardinality']
	},
	{
		key: 'composition',
		term: 'Composition (∘)',
		def: 'For \\(f\\colon X\\to Y\\) and \\(g\\colon Y\\to Z\\), \\(g\\circ f\\colon X\\to Z\\) is \\((g\\circ f)(x) = g(f(x))\\), read “\\(g\\) after \\(f\\)”: first \\(f\\), then \\(g\\). Associative, but order matters.',
		chapter,
		anchor: 'def-composition',
		see: ['identity-map', 'commutative-diagram']
	},
	{
		key: 'identity-map',
		term: 'Identity map',
		def: '\\(\\id_X\\colon X\\to X\\), \\(x\\mapsto x\\). It changes nothing: \\(f\\circ\\id_X = f = \\id_Y\\circ f\\).',
		chapter,
		anchor: 'functions',
		see: ['composition', 'inverse-function']
	},
	{
		key: 'inverse-function',
		term: 'Inverse function',
		def: '\\(g\\colon Y\\to X\\) with \\(g\\circ f = \\id_X\\) and \\(f\\circ g = \\id_Y\\). It exists exactly when \\(f\\) is bijective, and is written \\(f^{-1}\\) (not to be confused with the preimage, which always exists).',
		chapter,
		anchor: 'def-inverse',
		see: ['bijective', 'preimage']
	},
	{
		key: 'commutative-diagram',
		term: 'Commutative diagram',
		def: 'A picture of sets (dots) and functions (arrows) in which any two paths of arrows with the same start and end give the same composite: “all roads lead to the same place.”',
		chapter,
		anchor: 'def-commutative-diagram',
		see: ['composition']
	},
	{
		key: 'cardinality',
		term: 'Cardinality',
		def: 'The size of a set. \\(|X| = n\\) means there is a bijection \\(\\{1,\\dots,n\\}\\to X\\); two sets have the same cardinality when there is a bijection between them.',
		chapter,
		anchor: 'def-cardinality',
		see: ['countable', 'bijective']
	},
	{
		key: 'countable',
		term: 'Countable, uncountable',
		def: 'A set is countable if it is finite or can be listed as a sequence (a bijection with \\(\\N\\)). \\(\\Z\\) and \\(\\Q\\) are countable; \\(\\R\\) is uncountable (Cantor).',
		chapter,
		anchor: 'counting',
		see: ['cardinality']
	},
	{
		key: 'power-set',
		term: 'Power set',
		def: 'The set \\(\\mathcal P(X)\\) of all subsets of \\(X\\). If \\(|X| = n\\) then \\(|\\mathcal P(X)| = 2^n\\): each subset is a string of \\(n\\) in/out switches.',
		chapter,
		anchor: 'counting',
		see: ['subset', 'cardinality']
	}
];
