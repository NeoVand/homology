import type { GlossaryEntry } from './types';

const chapter = 'foundations/groups';

export const entries: GlossaryEntry[] = [
	{
		key: 'symmetry',
		term: 'Symmetry',
		def: 'A move that leaves an object looking exactly as it did before, such as turning an equilateral triangle by 120°. Doing one symmetry after another gives another symmetry, so the symmetries of an object form a group.',
		chapter,
		anchor: 'symmetry',
		see: ['group', 'dihedral-group']
	},
	{
		key: 'binary-operation',
		term: 'Binary operation',
		def: 'A rule that combines two elements \\(a, b\\) of a set, in order, into one element \\(a * b\\). Examples: \\(+\\) on numbers, composition \\(\\circ\\) of moves.',
		chapter,
		anchor: 'def-group',
		see: ['group']
	},
	{
		key: 'group',
		term: 'Group',
		def: 'A set with an operation that is closed, associative, has an identity element and inverses. Groups capture symmetry (moves of a triangle) and counting (clock arithmetic) in one definition.',
		chapter,
		anchor: 'def-group',
		see: ['abelian-group', 'identity-element', 'inverse-element', 'associativity']
	},
	{
		key: 'associativity',
		term: 'Associativity',
		def: 'The rule \\((a * b) * c = a * (b * c)\\): brackets do not matter, so a long product can be written without them. Subtraction is not associative: \\((5-3)-1 \\neq 5-(3-1)\\).',
		chapter,
		anchor: 'def-group',
		see: ['group']
	},
	{
		key: 'identity-element',
		term: 'Identity element',
		def: 'The element that does nothing: \\(e * a = a * e = a\\) for every \\(a\\). Written \\(e\\) (or \\(1\\)) in general groups and \\(0\\) in abelian groups. A group has exactly one.',
		chapter,
		anchor: 'def-group',
		see: ['group', 'inverse-element']
	},
	{
		key: 'inverse-element',
		term: 'Inverse (of an element)',
		def: 'The element that undoes \\(a\\): \\(a^{-1}\\) with \\(a a^{-1} = a^{-1} a = e\\). In additive notation it is written \\(-a\\). Each element has exactly one inverse, and \\((ab)^{-1} = b^{-1}a^{-1}\\).',
		chapter,
		anchor: 'def-group',
		see: ['identity-element', 'group']
	},
	{
		key: 'cayley-table',
		term: 'Cayley table',
		def: 'The multiplication table of a finite group: the entry in row \\(g\\), column \\(h\\) is \\(g h\\). Every element appears exactly once in each row and each column (the “Sudoku property”).',
		chapter,
		anchor: 'cayley-tables',
		see: ['group', 'cancellation-law']
	},
	{
		key: 'cancellation-law',
		term: 'Cancellation law',
		def: 'In a group, \\(ab = ac\\) implies \\(b = c\\) (multiply on the left by \\(a^{-1}\\)), and similarly on the right. It is why no element repeats in a row or column of a Cayley table.',
		chapter,
		anchor: 'cayley-tables',
		see: ['cayley-table']
	},
	{
		key: 'integers-mod-n',
		term: 'Integers mod n (ℤ/n)',
		def: 'The group of “clock arithmetic” with \\(n\\) hours: the elements \\(0, 1, \\dots, n-1\\), added by adding and then wrapping around past \\(n\\). Never written \\(\\Z_n\\) in this book; \\(\\Z/2\\) is also written \\(\\mathbb F_2\\).',
		chapter,
		anchor: 'clock',
		see: ['cyclic-group', 'group']
	},
	{
		key: 'dihedral-group',
		term: 'Dihedral group D₃',
		def: 'The six symmetries of an equilateral triangle: three rotations \\(e, r, r^2\\) and three flips \\(f_1, f_2, f_3\\). It is the smallest group that is not abelian: \\(r f_1 \\neq f_1 r\\).',
		chapter,
		anchor: 'symmetry',
		see: ['symmetry', 'abelian-group']
	},
	{
		key: 'order-of-a-group',
		term: 'Order of a group',
		def: 'The number of elements of a group \\(G\\), written \\(|G|\\). For example \\(|\\Z/n| = n\\) and \\(|D_3| = 6\\); the group \\(\\Z\\) has infinite order.',
		chapter,
		anchor: 'examples',
		see: ['order-of-an-element']
	},
	{
		key: 'trivial-group',
		term: 'Trivial group',
		def: 'The group with only one element, its identity: \\(\\{0\\}\\) (or \\(\\{e\\}\\)), usually written simply \\(0\\).',
		chapter,
		anchor: 'examples',
		see: ['group']
	},
	{
		key: 'klein-four-group',
		term: 'Symmetries of a rectangle',
		def: 'The four symmetries \\(e, h, v, t\\) of a non-square rectangle (two flips and a half turn). Each one is undone by itself, so it is not isomorphic to \\(\\Z/4\\); it is often called the Klein four-group.',
		chapter,
		anchor: 'isomorphism',
		see: ['isomorphism']
	},
	{
		key: 'abelian-group',
		term: 'Abelian group',
		def: 'A group in which order never matters: \\(ab = ba\\) for all \\(a, b\\). Named after Niels Henrik Abel. Abelian groups are usually written additively (\\(+\\), \\(0\\), \\(-a\\)); all the groups of homology are abelian.',
		chapter,
		anchor: 'abelian',
		see: ['group', 'additive-notation']
	},
	{
		key: 'additive-notation',
		term: 'Additive notation',
		def: 'The convention of writing an abelian group operation as \\(a + b\\), the identity as \\(0\\), the inverse as \\(-a\\), and \\(a + \\dots + a\\) (\\(k\\) times) as \\(ka\\). A plus sign promises that the order of terms does not matter.',
		chapter,
		anchor: 'additive-notation',
		see: ['abelian-group']
	},
	{
		key: 'subgroup',
		term: 'Subgroup',
		def: 'A subset \\(H\\) of a group that is itself a group with the same operation: it contains the identity and is closed under the operation and under inverses. Written \\(H \\le G\\). Example: the even integers in \\(\\Z\\).',
		chapter,
		anchor: 'subgroups',
		see: ['group', 'generated-subgroup']
	},
	{
		key: 'multiples-subgroup',
		term: 'Multiples of n (nℤ)',
		def: 'The subgroup \\(n\\Z = \\{\\dots, -2n, -n, 0, n, 2n, \\dots\\}\\) of the integers. Every subgroup of \\(\\Z\\) is of this form.',
		chapter,
		anchor: 'subgroups-of-z',
		see: ['subgroup']
	},
	{
		key: 'generated-subgroup',
		term: 'Subgroup generated by an element',
		def: '\\(\\langle a \\rangle\\), the smallest subgroup containing \\(a\\): all the multiples \\(ka\\) for \\(k \\in \\Z\\) (all powers \\(a^k\\) in multiplicative notation).',
		chapter,
		anchor: 'generators',
		see: ['generator', 'cyclic-group']
	},
	{
		key: 'generator',
		term: 'Generator',
		def: 'An element (or set of elements) from which every element of the group can be built using the group operation and inverses. \\(1\\) generates \\(\\Z\\); \\(r\\) and \\(f_1\\) together generate \\(D_3\\).',
		chapter,
		anchor: 'generators',
		see: ['generated-subgroup', 'cyclic-group']
	},
	{
		key: 'cyclic-group',
		term: 'Cyclic group',
		def: 'A group generated by a single element: \\(G = \\langle a \\rangle\\). Every cyclic group is isomorphic to \\(\\Z\\) or to some \\(\\Z/n\\).',
		chapter,
		anchor: 'generators',
		see: ['generator', 'integers-mod-n']
	},
	{
		key: 'order-of-an-element',
		term: 'Order of an element',
		def: 'The smallest \\(k \\ge 1\\) with \\(ka = 0\\) (or \\(a^k = e\\)); infinite if there is none. It equals the size of \\(\\langle a \\rangle\\). In \\(\\Z/n\\), the element \\(k\\) has order \\(n / \\gcd(n, k)\\).',
		chapter,
		anchor: 'order',
		see: ['generated-subgroup', 'order-of-a-group']
	},
	{
		key: 'gcd',
		term: 'Greatest common divisor',
		def: '\\(\\gcd(a, b)\\), the largest whole number dividing both \\(a\\) and \\(b\\). For example \\(\\gcd(12, 18) = 6\\). Numbers with \\(\\gcd = 1\\) are called coprime.',
		chapter,
		anchor: 'order',
		see: ['order-of-an-element']
	},
	{
		key: 'homomorphism',
		term: 'Homomorphism',
		def: 'A function between groups that respects the operation: \\(\\varphi(a + b) = \\varphi(a) + \\varphi(b)\\) (or \\(\\varphi(ab) = \\varphi(a)\\varphi(b)\\)). It automatically sends \\(0\\) to \\(0\\) and \\(-a\\) to \\(-\\varphi(a)\\).',
		chapter,
		anchor: 'def-homomorphism',
		see: ['kernel', 'isomorphism']
	},
	{
		key: 'kernel',
		term: 'Kernel',
		def: '\\(\\ker \\varphi\\), everything a homomorphism sends to \\(0\\): “what gets crushed”. It is a subgroup, and \\(\\varphi\\) is injective exactly when \\(\\ker\\varphi = \\{0\\}\\). In homology, cycles are the kernel of the boundary map.',
		chapter,
		anchor: 'kernel-image',
		see: ['homomorphism', 'image-of-a-homomorphism']
	},
	{
		key: 'image-of-a-homomorphism',
		term: 'Image (of a homomorphism)',
		def: '\\(\\im \\varphi = \\{\\varphi(a)\\}\\), everything a homomorphism reaches: “the shadow”. It is a subgroup of the target. In homology, boundaries are the image of the boundary map.',
		chapter,
		anchor: 'kernel-image',
		see: ['kernel', 'homomorphism']
	},
	{
		key: 'sign-homomorphism',
		term: 'Sign of a symmetry',
		def: 'The homomorphism \\(D_3 \\to \\{+1, -1\\}\\) sending rotations to \\(+1\\) (the triangle stays face up) and flips to \\(-1\\) (it is turned over). Its kernel is the subgroup of rotations.',
		chapter,
		anchor: 'def-homomorphism',
		see: ['homomorphism', 'dihedral-group']
	},
	{
		key: 'isomorphism',
		term: 'Isomorphism',
		def: 'A bijective homomorphism: a renaming of the elements of one group as those of another that turns one table into the other. Groups related by one are isomorphic, \\(G \\cong H\\): “the same group with different names”.',
		chapter,
		anchor: 'isomorphism',
		see: ['homomorphism']
	}
];
