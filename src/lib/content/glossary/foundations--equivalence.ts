import type { GlossaryEntry } from './types';

const chapter = 'foundations/equivalence';

export const entries: GlossaryEntry[] = [
	{
		key: 'relation',
		term: 'Relation',
		def: 'A relation on a set \\(X\\) is a subset \\(R\\subseteq X\\times X\\): a yes-or-no question about ordered pairs. We write \\(x\\sim y\\) when \\((x,y)\\in R\\).',
		chapter,
		anchor: 'def-relation',
		see: ['equivalence-relation', 'cartesian-product']
	},
	{
		key: 'reflexive-relation',
		term: 'Reflexive',
		def: 'A relation is reflexive if every element is related to itself: \\(x\\sim x\\) for all \\(x\\). In the arrow picture, every dot carries a loop.',
		chapter,
		anchor: 'def-equivalence-relation',
		see: ['equivalence-relation']
	},
	{
		key: 'symmetric-relation',
		term: 'Symmetric (relation)',
		def: 'A relation is symmetric if \\(x\\sim y\\) always implies \\(y\\sim x\\). In the arrow picture, every arrow has a partner coming back.',
		chapter,
		anchor: 'def-equivalence-relation',
		see: ['equivalence-relation']
	},
	{
		key: 'transitive-relation',
		term: 'Transitive',
		def: 'A relation is transitive if \\(x\\sim y\\) and \\(y\\sim z\\) always imply \\(x\\sim z\\): every two-step path has a one-step shortcut. “Close to” is *not* transitive.',
		chapter,
		anchor: 'def-equivalence-relation',
		see: ['equivalence-relation']
	},
	{
		key: 'equivalence-relation',
		term: 'Equivalence relation',
		def: 'A relation that is reflexive, symmetric and transitive: the precise meaning of “declaring things the same.” Example: congruence modulo \\(n\\) on \\(\\Z\\).',
		chapter,
		anchor: 'def-equivalence-relation',
		see: ['equivalence-class', 'partition', 'quotient-set']
	},
	{
		key: 'congruence-mod-n',
		term: 'Congruence modulo n',
		def: '\\(x\\equiv y \\pmod n\\) means that \\(n\\) divides \\(x-y\\), i.e. \\(x\\) and \\(y\\) leave the same remainder on division by \\(n\\). Example: \\(15\\equiv 3\\pmod{12}\\).',
		chapter,
		anchor: 'prop-congruence',
		see: ['equivalence-relation', 'integers-mod-n']
	},
	{
		key: 'divides',
		term: 'Divides (n | m)',
		def: '\\(n\\mid m\\), read “\\(n\\) divides \\(m\\)”, means \\(m = nk\\) for some integer \\(k\\). It is a statement (true or false), not a fraction.',
		chapter,
		see: ['congruence-mod-n']
	},
	{
		key: 'equivalence-class',
		term: 'Equivalence class',
		def: 'The class of \\(x\\) is \\([x] = \\{y\\in X : y\\sim x\\}\\), everything equivalent to \\(x\\). Two classes are either equal or disjoint, and \\([x]=[y]\\) exactly when \\(x\\sim y\\).',
		chapter,
		anchor: 'def-class',
		see: ['representative', 'partition', 'quotient-set']
	},
	{
		key: 'representative',
		term: 'Representative',
		def: 'Any element of an equivalence class, used as a name for the whole class. A class has as many names as members: in \\(\\Z/3\\), \\([1]=[4]=[-2]\\).',
		chapter,
		anchor: 'def-class',
		see: ['equivalence-class', 'well-defined']
	},
	{
		key: 'partition',
		term: 'Partition',
		def: 'A way of chopping a set into non-empty, non-overlapping pieces (blocks) that together cover it. Partitions and equivalence relations are the same thing: the blocks are the classes.',
		chapter,
		anchor: 'def-partition',
		see: ['equivalence-relation', 'equivalence-class']
	},
	{
		key: 'quotient-set',
		term: 'Quotient set',
		def: 'The set \\(X/{\\sim}\\) of all equivalence classes, one element per class. Each class is a *single* element of the quotient, however many members it has.',
		chapter,
		anchor: 'def-quotient',
		see: ['quotient-projection', 'equivalence-class', 'integers-mod-n']
	},
	{
		key: 'quotient-projection',
		term: 'Projection to a quotient',
		def: 'The map \\(q\\colon X\\to X/{\\sim}\\), \\(q(x) = [x]\\), sending each element to its class. It is surjective, and \\(q(x) = q(y)\\) exactly when \\(x\\sim y\\).',
		chapter,
		anchor: 'def-quotient',
		see: ['quotient-set']
	},
	{
		key: 'integers-mod-n',
		term: 'Integers modulo n (ℤ/n)',
		def: 'The quotient of \\(\\Z\\) by congruence modulo \\(n\\): the \\(n\\)-element set \\(\\Z/n = \\{[0],[1],\\dots,[n-1]\\}\\), pictured as the positions of a clock hand. Its arithmetic comes in §1.3.',
		chapter,
		anchor: 'quotient',
		see: ['congruence-mod-n', 'quotient-set', 'clock-arithmetic']
	},
	{
		key: 'parity',
		term: 'Parity',
		def: 'Whether an integer is even or odd. The two parities are the two classes of congruence modulo 2, so \\(\\Z/2 = \\{\\text{even},\\text{odd}\\}\\).',
		chapter,
		see: ['integers-mod-n']
	},
	{
		key: 'generated-equivalence-relation',
		term: 'Generated equivalence relation',
		def: 'The smallest equivalence relation containing a given relation \\(R\\): \\(x\\sim y\\) when \\(x=y\\) or one can walk from \\(x\\) to \\(y\\) by finitely many steps along pairs of \\(R\\), in either direction. Gluing instructions generate equivalence relations.',
		chapter,
		anchor: 'def-generated',
		see: ['gluing', 'equivalence-relation']
	},
	{
		key: 'gluing',
		term: 'Gluing (identification)',
		def: 'Building a new shape as a quotient by declaring points the same. Gluing the ends of \\([0,1]\\) gives a circle; gluing opposite sides of a square gives a torus.',
		chapter,
		anchor: 'gluing',
		see: ['quotient-set', 'generated-equivalence-relation']
	},
	{
		key: 'constant-on-classes',
		term: 'Constant on classes (factoring through a quotient)',
		def: 'A function \\(F\\colon X\\to Y\\) is constant on classes if \\(x\\sim x\'\\) implies \\(F(x)=F(x\')\\). Then \\(F = f\\circ q\\) for exactly one \\(f\\colon X/{\\sim}\\to Y\\): \\(F\\) “factors through” the quotient.',
		chapter,
		anchor: 'thm-descent',
		see: ['well-defined', 'quotient-projection']
	}
];
