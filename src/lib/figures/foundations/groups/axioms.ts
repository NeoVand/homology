// Candidate (set, operation) pairs for the "Group or impostor?" figure.
// Each verdict is written out by hand (and checked in groups.test.ts against
// brute force on finite sets or samples); `why` may contain \( … \) math.
import { compose, D3 } from './d3';

export interface Verdict {
	/** true = holds, false = fails, null = does not even make sense */
	ok: boolean | null;
	why: string;
}

export interface Candidate {
	id: string;
	/** TeX for the set and the operation, e.g. "\\Z" and "+" */
	set: string;
	op: string;
	/** a short name in words */
	name: string;
	/** sample elements the reader can pick for the test bench */
	sample: number[];
	apply: (a: number, b: number) => number;
	inSet: (x: number) => boolean;
	/** TeX for one value */
	fmt: (x: number) => string;
	closure: Verdict;
	assoc: Verdict;
	identity: Verdict;
	inverses: Verdict;
	abelian: boolean | null;
	note: string;
}

const tol = (x: number, y: number) => Math.abs(x - y) < 1e-9;
const isInt = (x: number) => Number.isInteger(x);
const fmtNum = (x: number) => {
	if (isInt(x)) return x < 0 ? '-' + Math.abs(x) : String(x);
	const s = (Math.round(x * 1000) / 1000).toString();
	return s.startsWith('-') ? '-' + s.slice(1) : s;
};
const m = (a: number, n: number) => ((a % n) + n) % n;

export const candidates: Candidate[] = [
	{
		id: 'Z+',
		set: '\\Z',
		op: '+',
		name: 'the integers under addition',
		sample: [-7, -3, -1, 0, 1, 2, 5, 8],
		apply: (a, b) => a + b,
		inSet: isInt,
		fmt: fmtNum,
		closure: { ok: true, why: 'The sum of two integers is an integer.' },
		assoc: { ok: true, why: 'Brackets never matter when adding: \\((a+b)+c = a+(b+c)\\).' },
		identity: { ok: true, why: '\\(0\\) does nothing: \\(a + 0 = 0 + a = a\\).' },
		inverses: { ok: true, why: 'The inverse of \\(a\\) is \\(-a\\), because \\(a + (-a) = 0\\).' },
		abelian: true,
		note: 'The most important group in this book.'
	},
	{
		id: 'N+',
		set: '\\N',
		op: '+',
		name: 'the natural numbers 0, 1, 2, … under addition',
		sample: [0, 1, 2, 3, 5, 8],
		apply: (a, b) => a + b,
		inSet: (x) => isInt(x) && x >= 0,
		fmt: fmtNum,
		closure: { ok: true, why: 'Adding two natural numbers gives a natural number.' },
		assoc: { ok: true, why: 'Addition of numbers is always associative.' },
		identity: { ok: true, why: '\\(0\\) is a natural number, and \\(a + 0 = a\\).' },
		inverses: {
			ok: false,
			why: 'Solving \\(3 + x = 0\\) needs \\(x = -3\\), which is not a natural number. Only \\(0\\) has an inverse.'
		},
		abelian: true,
		note: 'Counting without debts: you can add, but you cannot undo.'
	},
	{
		id: 'Z-',
		set: '\\Z',
		op: '-',
		name: 'the integers under subtraction',
		sample: [-4, -1, 0, 1, 2, 3, 5],
		apply: (a, b) => a - b,
		inSet: isInt,
		fmt: fmtNum,
		closure: { ok: true, why: 'The difference of two integers is an integer.' },
		assoc: { ok: false, why: '\\((5-3)-1 = 1\\) but \\(5-(3-1) = 3\\): the brackets matter.' },
		identity: {
			ok: false,
			why: '\\(a - 0 = a\\), but \\(0 - a = -a\\), which is not \\(a\\) (unless \\(a = 0\\)). No element does nothing on both sides.'
		},
		inverses: { ok: null, why: 'With no identity element, “inverse” has nothing to mean.' },
		abelian: false,
		note: 'Subtraction is better seen as adding an inverse: \\(a - b = a + (-b)\\).'
	},
	{
		id: 'R+',
		set: '\\R',
		op: '+',
		name: 'the real numbers under addition',
		sample: [-2.5, -1, -0.25, 0, 0.5, 1, 1.75, 3],
		apply: (a, b) => a + b,
		inSet: () => true,
		fmt: fmtNum,
		closure: { ok: true, why: 'The sum of two real numbers is a real number.' },
		assoc: { ok: true, why: 'Addition is associative.' },
		identity: { ok: true, why: '\\(0\\).' },
		inverses: { ok: true, why: 'The inverse of \\(a\\) is \\(-a\\).' },
		abelian: true,
		note: 'A continuous cousin of \\(\\Z\\): it will reappear wrapped around a circle.'
	},
	{
		id: 'Rx',
		set: '\\R',
		op: '\\times',
		name: 'the real numbers under multiplication',
		sample: [-2, -0.5, 0, 0.5, 1, 2, 3],
		apply: (a, b) => a * b,
		inSet: () => true,
		fmt: fmtNum,
		closure: { ok: true, why: 'The product of two real numbers is a real number.' },
		assoc: { ok: true, why: 'Multiplication is associative: \\((ab)c = a(bc)\\).' },
		identity: { ok: true, why: '\\(1\\): \\(1 \\cdot a = a \\cdot 1 = a\\).' },
		inverses: { ok: false, why: '\\(0 \\cdot x = 0\\) for every \\(x\\), never \\(1\\): zero has no inverse.' },
		abelian: true,
		note: 'One bad element spoils it. Remove it and see what happens.'
	},
	{
		id: 'R*x',
		set: '\\R \\setminus \\{0\\}',
		op: '\\times',
		name: 'the nonzero real numbers under multiplication',
		sample: [-2, -0.5, 0.25, 0.5, 1, 2, 4],
		apply: (a, b) => a * b,
		inSet: (x) => x !== 0,
		fmt: fmtNum,
		closure: { ok: true, why: 'A product of two nonzero numbers is never zero.' },
		assoc: { ok: true, why: 'Multiplication is associative.' },
		identity: { ok: true, why: '\\(1\\).' },
		inverses: { ok: true, why: 'The inverse of \\(a\\) is \\(1/a\\), which is nonzero.' },
		abelian: true,
		note: 'Same numbers, different operation, different group.'
	},
	{
		id: 'odd+',
		set: '\\text{odd integers}',
		op: '+',
		name: 'the odd integers under addition',
		sample: [-5, -3, -1, 1, 3, 5, 7],
		apply: (a, b) => a + b,
		inSet: (x) => isInt(x) && m(x, 2) === 1,
		fmt: fmtNum,
		closure: { ok: false, why: '\\(3 + 5 = 8\\) is even: adding two odd numbers leaves the set.' },
		assoc: { ok: true, why: 'Addition is associative (whenever the sums make sense).' },
		identity: { ok: false, why: 'The only number that does nothing under \\(+\\) is \\(0\\), and \\(0\\) is not odd.' },
		inverses: { ok: null, why: 'With no identity element, “inverse” has nothing to mean.' },
		abelian: true,
		note: 'Compare the even integers, which do form a group.'
	},
	{
		id: 'pm1',
		set: '\\{+1, -1\\}',
		op: '\\times',
		name: 'the two signs under multiplication',
		sample: [1, -1],
		apply: (a, b) => a * b,
		inSet: (x) => x === 1 || x === -1,
		fmt: (x) => (x === 1 ? '+1' : '-1'),
		closure: { ok: true, why: 'All four products are \\(\\pm 1\\).' },
		assoc: { ok: true, why: 'Multiplication is associative.' },
		identity: { ok: true, why: '\\(+1\\).' },
		inverses: { ok: true, why: 'Each sign is its own inverse: \\((-1)(-1) = +1\\).' },
		abelian: true,
		note: 'Two elements. Its table has the same pattern as \\(\\Z/2\\).'
	},
	{
		id: 'Z6+',
		set: '\\Z/6',
		op: '+',
		name: 'the integers mod 6 under addition',
		sample: [0, 1, 2, 3, 4, 5],
		apply: (a, b) => m(a + b, 6),
		inSet: (x) => isInt(x) && x >= 0 && x < 6,
		fmt: fmtNum,
		closure: { ok: true, why: 'Clock addition never leaves the clock.' },
		assoc: { ok: true, why: 'It is inherited from ordinary addition: add, then reduce.' },
		identity: { ok: true, why: '\\(0\\).' },
		inverses: { ok: true, why: 'The inverse of \\(a\\) is \\(6 - a\\) (and \\(0\\) is its own inverse).' },
		abelian: true,
		note: 'A finite group: six elements.'
	},
	{
		id: 'Z6x',
		set: '\\Z/6 \\setminus \\{0\\}',
		op: '\\times',
		name: 'the nonzero integers mod 6 under multiplication',
		sample: [1, 2, 3, 4, 5],
		apply: (a, b) => m(a * b, 6),
		inSet: (x) => isInt(x) && x >= 1 && x < 6,
		fmt: fmtNum,
		closure: { ok: false, why: '\\(2 \\cdot 3 = 6 = 0\\) in \\(\\Z/6\\), and \\(0\\) has been removed.' },
		assoc: { ok: true, why: 'Inherited from ordinary multiplication.' },
		identity: { ok: true, why: '\\(1\\).' },
		inverses: { ok: false, why: '\\(2 \\cdot x\\) is always \\(0\\), \\(2\\) or \\(4\\) in \\(\\Z/6\\), never \\(1\\): \\(2\\) has no inverse.' },
		abelian: true,
		note: 'Compare with mod 5 below: 6 is not prime.'
	},
	{
		id: 'Z5x',
		set: '\\Z/5 \\setminus \\{0\\}',
		op: '\\times',
		name: 'the nonzero integers mod 5 under multiplication',
		sample: [1, 2, 3, 4],
		apply: (a, b) => m(a * b, 5),
		inSet: (x) => isInt(x) && x >= 1 && x < 5,
		fmt: fmtNum,
		closure: { ok: true, why: '5 is prime, so a product of numbers not divisible by 5 is not divisible by 5.' },
		assoc: { ok: true, why: 'Inherited from ordinary multiplication.' },
		identity: { ok: true, why: '\\(1\\).' },
		inverses: { ok: true, why: '\\(1\\cdot 1 = 1\\), \\(2 \\cdot 3 = 6 = 1\\), \\(4 \\cdot 4 = 16 = 1\\).' },
		abelian: true,
		note: 'A group of four elements: the powers of 2 are 2, 4, 3, 1.'
	},
	{
		id: 'Zx',
		set: '\\Z',
		op: '\\times',
		name: 'the integers under multiplication',
		sample: [-3, -1, 0, 1, 2, 3],
		apply: (a, b) => a * b,
		inSet: isInt,
		fmt: fmtNum,
		closure: { ok: true, why: 'The product of two integers is an integer.' },
		assoc: { ok: true, why: 'Multiplication is associative.' },
		identity: { ok: true, why: '\\(1\\).' },
		inverses: { ok: false, why: '\\(2 \\cdot x = 1\\) needs \\(x = \\tfrac12\\), which is not an integer.' },
		abelian: true,
		note: 'Only \\(1\\) and \\(-1\\) have inverses.'
	},
	{
		id: 'sq',
		set: '\\text{rotations of a square}',
		op: '\\circ',
		name: 'turning a square by multiples of 90°',
		sample: [0, 90, 180, 270],
		apply: (a, b) => m(a + b, 360),
		inSet: (x) => [0, 90, 180, 270].includes(x),
		fmt: (x) => `${x}^\\circ`,
		closure: { ok: true, why: 'Two quarter-turn multiples add up to a quarter-turn multiple (counting 360° as 0°).' },
		assoc: { ok: true, why: 'Composing moves is always associative (it is composition of functions).' },
		identity: { ok: true, why: 'The rotation by \\(0^\\circ\\).' },
		inverses: { ok: true, why: 'Undo a turn by turning back: \\(90^\\circ\\) is undone by \\(270^\\circ\\).' },
		abelian: true,
		note: 'Its table has exactly the pattern of \\(\\Z/4\\).'
	},
	{
		id: 'D3',
		set: 'D_3',
		op: '\\circ',
		name: 'the six symmetries of a triangle',
		sample: [0, 1, 2, 3, 4, 5],
		apply: (a, b) => compose(a, b),
		inSet: (x) => isInt(x) && x >= 0 && x < 6,
		fmt: (x) => D3[x].tex,
		closure: { ok: true, why: 'Doing one symmetry and then another leaves the triangle in its slot.' },
		assoc: { ok: true, why: 'Composition of moves (functions) is associative.' },
		identity: { ok: true, why: 'The do-nothing move \\(e\\).' },
		inverses: { ok: true, why: 'Rotations are undone by rotating back; each flip undoes itself.' },
		abelian: false,
		note: 'A group, but not abelian: try \\(a = r\\), \\(b = f_1\\).'
	}
];

export const sameValue = tol;
