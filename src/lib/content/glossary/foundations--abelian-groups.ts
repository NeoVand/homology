import type { GlossaryEntry } from './types';

const chapter = 'foundations/abelian-groups';

export const entries: GlossaryEntry[] = [
	{
		key: 'coset',
		term: 'Coset',
		def: 'A shifted copy \\(a + H = \\{a + h : h \\in H\\}\\) of a subgroup \\(H\\). Two cosets are either equal or disjoint, and \\(a + H = b + H\\) exactly when \\(a - b \\in H\\). The cosets of \\(3\\Z\\) in \\(\\Z\\) are \\(3\\Z\\), \\(1 + 3\\Z\\) and \\(2 + 3\\Z\\).',
		chapter,
		anchor: 'def-coset',
		see: ['quotient-group', 'index-of-a-subgroup']
	},
	{
		key: 'index-of-a-subgroup',
		term: 'Index of a subgroup',
		def: 'The number of cosets of \\(H\\) in \\(G\\), written \\([G : H]\\). For finite groups it equals \\(|G| / |H|\\).',
		chapter,
		anchor: 'lagrange',
		see: ['coset', 'lagranges-theorem']
	},
	{
		key: 'lagranges-theorem',
		term: 'Lagrange’s theorem',
		def: 'In a finite group the size of every subgroup divides the size of the group, because the cosets cut the group into pieces of equal size. In particular the order of every element divides \\(|G|\\).',
		chapter,
		anchor: 'lagrange',
		see: ['coset', 'index-of-a-subgroup']
	},
	{
		key: 'quotient-group',
		term: 'Quotient group',
		def: '\\(G/H\\) (“\\(G\\) mod \\(H\\)”): the cosets of \\(H\\), each treated as a single element, added by \\((a + H) + (b + H) = (a + b) + H\\). It is \\(G\\) with every element of \\(H\\) declared to be zero. Homology groups are quotient groups.',
		chapter,
		anchor: 'def-quotient',
		see: ['coset', 'quotient-homomorphism']
	},
	{
		key: 'quotient-homomorphism',
		term: 'Quotient homomorphism',
		def: 'The map \\(q\\colon G \\to G/H\\), \\(a \\mapsto a + H\\), sending each element to its coset. It is surjective and its kernel is exactly \\(H\\).',
		chapter,
		anchor: 'def-quotient',
		see: ['quotient-group', 'kernel']
	},
	{
		key: 'circle-group',
		term: 'The circle ℝ/ℤ',
		def: 'The real numbers modulo the integers: numbers that differ by a whole number are identified. Wrapping the real line around a circle of circumference 1 shows that \\(\\R/\\Z\\) is a circle; adding cosets adds angles.',
		chapter,
		anchor: 'circle',
		see: ['quotient-group']
	},
	{
		key: 'integer-lattice',
		term: 'Integer lattice',
		def: '\\(\\Z^2 = \\Z \\oplus \\Z\\), the points of the plane with whole-number coordinates, added coordinate by coordinate. A sublattice is a subgroup of it, such as the integer combinations of two vectors.',
		chapter,
		anchor: 'lattice-quotients',
		see: ['direct-sum', 'fundamental-domain']
	},
	{
		key: 'fundamental-domain',
		term: 'Fundamental domain',
		def: 'For a sublattice spanned by \\(v\\) and \\(w\\), the half-open parallelogram \\(\\{sv + tw : 0 \\le s, t < 1\\}\\). It contains exactly one point of each coset, so the number of cosets is its area \\(|\\det(v\\ w)|\\).',
		chapter,
		anchor: 'lattice-quotients',
		see: ['integer-lattice', 'coset']
	},
	{
		key: 'first-isomorphism-theorem',
		term: 'First Isomorphism Theorem',
		def: 'For a homomorphism \\(\\varphi\\colon G \\to H\\), the rule \\(a + \\ker\\varphi \\mapsto \\varphi(a)\\) is a well-defined isomorphism \\(G/\\ker\\varphi \\cong \\im\\varphi\\): collapse what \\(\\varphi\\) cannot see, and what remains is exactly what it reaches.',
		chapter,
		anchor: 'first-isomorphism',
		see: ['quotient-group', 'kernel']
	},
	{
		key: 'direct-sum',
		term: 'Direct sum',
		def: '\\(G \\oplus H\\), the pairs \\((g, h)\\) added coordinate by coordinate: two groups side by side, like two independent dials. Examples: \\(\\Z^2 = \\Z \\oplus \\Z\\), and \\(\\Z/2 \\oplus \\Z/2\\), the symmetries of a rectangle.',
		chapter,
		anchor: 'direct-sums',
		see: ['chinese-remainder-theorem']
	},
	{
		key: 'chinese-remainder-theorem',
		term: 'Chinese remainder theorem',
		def: '\\(\\Z/m \\oplus \\Z/n \\cong \\Z/mn\\) exactly when \\(\\gcd(m, n) = 1\\). For example \\(\\Z/2 \\oplus \\Z/3 \\cong \\Z/6\\), but \\(\\Z/2 \\oplus \\Z/2\\) is not \\(\\Z/4\\).',
		chapter,
		anchor: 'crt',
		see: ['direct-sum', 'cyclic-group']
	},
	{
		key: 'formal-sum',
		term: 'Formal sum',
		def: 'An integer combination of named pieces, such as \\(2a - b + 3c\\), kept as an inventory rather than evaluated. Formal sums are added coefficient by coefficient. Chains in homology are formal sums of edges, triangles, and so on.',
		chapter,
		anchor: 'free-abelian-groups',
		see: ['free-abelian-group']
	},
	{
		key: 'free-abelian-group',
		term: 'Free abelian group',
		def: 'The group \\(\\Z[S]\\) of formal sums of the elements of a set \\(S\\) with integer coefficients. If \\(S\\) has \\(k\\) elements it is a copy of \\(\\Z^k\\). The chain groups of homology are free abelian groups.',
		chapter,
		anchor: 'def-free',
		see: ['formal-sum', 'basis-of-a-free-abelian-group', 'rank-of-an-abelian-group']
	},
	{
		key: 'basis-of-a-free-abelian-group',
		term: 'Basis (of a free abelian group)',
		def: 'A set of elements such that every element is a combination of them with integer coefficients in exactly one way. In \\(\\Z^2\\), \\(\\{(1,0), (1,1)\\}\\) is a basis but \\(\\{(2,0), (0,1)\\}\\) is not, because we may not divide by 2.',
		chapter,
		anchor: 'bases',
		see: ['free-abelian-group', 'rank-of-an-abelian-group']
	},
	{
		key: 'rank-of-an-abelian-group',
		term: 'Rank (of an abelian group)',
		def: 'The number of copies of \\(\\Z\\) in \\(G \\cong \\Z^r \\oplus (\\text{finite part})\\): the size of a basis of the free part. The rank of a homology group is called a Betti number.',
		chapter,
		anchor: 'classification',
		see: ['classification-of-abelian-groups', 'torsion-subgroup']
	},
	{
		key: 'extension-by-linearity',
		term: 'Defining a map on a basis',
		def: 'A homomorphism out of a free abelian group can be defined by choosing, freely, where each basis element goes; it then extends uniquely: \\(\\varphi(\\sum n_s s) = \\sum n_s \\varphi(s)\\). The boundary map of homology is defined this way.',
		chapter,
		anchor: 'linearity',
		see: ['free-abelian-group', 'homomorphism']
	},
	{
		key: 'presentation',
		term: 'Presentation (generators and relations)',
		def: '\\(\\langle a, b, \\dots \\mid \\text{relations} \\rangle\\): the abelian group generated by the given symbols subject only to the given relations (and their consequences). It is the free abelian group on the generators modulo the subgroup generated by the relations.',
		chapter,
		anchor: 'presentations',
		see: ['relation-matrix', 'quotient-group']
	},
	{
		key: 'relation-matrix',
		term: 'Relation matrix',
		def: 'The integer matrix of a presentation, with one row per generator and one column per relation. The group it presents is \\(\\Z^m\\) modulo the span of its columns; integer row and column operations do not change the group.',
		chapter,
		anchor: 'presentations',
		see: ['presentation', 'invariant-factors']
	},
	{
		key: 'invariant-factors',
		term: 'Invariant factors',
		def: 'The numbers \\(d_1 \\mid d_2 \\mid \\dots \\mid d_k\\) (each dividing the next) in \\(G \\cong \\Z^r \\oplus \\Z/d_1 \\oplus \\dots \\oplus \\Z/d_k\\). They appear on the diagonal when a relation matrix is diagonalised (its Smith normal form).',
		chapter,
		anchor: 'classification',
		see: ['classification-of-abelian-groups', 'relation-matrix']
	},
	{
		key: 'finitely-generated',
		term: 'Finitely generated',
		def: 'A group is finitely generated if finitely many of its elements generate it. \\(\\Z^3\\) and every finite group are; \\(\\Q\\) is not. Homology groups of finite complexes are finitely generated.',
		chapter,
		anchor: 'classification',
		see: ['classification-of-abelian-groups']
	},
	{
		key: 'classification-of-abelian-groups',
		term: 'Classification of finitely generated abelian groups',
		def: 'Every finitely generated abelian group is \\(\\Z^r \\oplus \\Z/d_1 \\oplus \\dots \\oplus \\Z/d_k\\) with \\(d_1 \\mid d_2 \\mid \\dots \\mid d_k\\), and the numbers \\(r, d_1, \\dots, d_k\\) are determined by the group. So every homology group is a list of numbers.',
		chapter,
		anchor: 'thm-classification',
		see: ['rank-of-an-abelian-group', 'torsion-subgroup', 'invariant-factors']
	},
	{
		key: 'torsion-element',
		term: 'Torsion element',
		def: 'An element of finite order: some multiple \\(ka\\) with \\(k \\ge 1\\) is \\(0\\). In \\(\\Z \\oplus \\Z/2\\), the element \\((0, 1)\\) is torsion and \\((1, 0)\\) is not.',
		chapter,
		anchor: 'torsion',
		see: ['torsion-subgroup', 'order-of-an-element']
	},
	{
		key: 'torsion-subgroup',
		term: 'Torsion subgroup',
		def: 'The subgroup of all torsion elements of an abelian group: the finite part \\(\\Z/d_1 \\oplus \\dots \\oplus \\Z/d_k\\) of the classification. In homology it detects “twisting”, such as the \\(\\Z/2\\) in the first homology of the Klein bottle.',
		chapter,
		anchor: 'torsion',
		see: ['torsion-element', 'classification-of-abelian-groups']
	},
	{
		key: 'torsion-free',
		term: 'Torsion-free',
		def: 'Having no torsion elements other than \\(0\\). A finitely generated torsion-free abelian group is free, \\(\\cong \\Z^r\\); without “finitely generated” this fails (\\(\\Q\\) is torsion-free but not free).',
		chapter,
		anchor: 'torsion',
		see: ['torsion-subgroup', 'free-abelian-group']
	},
	{
		key: 'exact-sequence',
		term: 'Exact sequence',
		def: 'A chain of homomorphisms \\(\\dots \\to A \\xto{f} B \\xto{g} C \\to \\dots\\) in which, at every inner group, the image of the incoming map equals the kernel of the outgoing one: what \\(f\\) produces is exactly what \\(g\\) kills.',
		chapter,
		anchor: 'exact-sequences',
		see: ['short-exact-sequence', 'kernel']
	},
	{
		key: 'short-exact-sequence',
		term: 'Short exact sequence',
		def: 'An exact sequence \\(0 \\to A \\xto{f} B \\xto{g} C \\to 0\\): \\(f\\) is injective, \\(g\\) is surjective and \\(\\im f = \\ker g\\), so \\(C \\cong B / f(A)\\). Example: \\(0 \\to \\Z \\xto{\\times n} \\Z \\to \\Z/n \\to 0\\).',
		chapter,
		anchor: 'short-exact',
		see: ['exact-sequence']
	}
];
