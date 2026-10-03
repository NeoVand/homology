// The spaces of the chapter, as small Δ-complexes with hand-drawn fences.
// Every multiplication table shown in the chapter is computed here, from the
// fences, by the front-face/back-face formula (see cup.test.ts / spaces.test.ts).
import { bettiMod, BIG_PRIME, cup11, delta1, evaluate, fromOrderedTriangles, fundamentalCycle, mod, orientTriangles, type Delta2 } from './cup';
import { arcCrossings, chord, fenceCochain, genus2Model, squareModel, type FlatModel, type Pt } from './flat';

/**
 * S¹ ∨ S¹ ∨ S² as a simplicial complex: two hollow triangles (0,1,2) and
 * (0,3,4) and a hollow tetrahedron (0,5,6,7), all sharing the vertex 0.
 */
export function wedgeDelta(): Delta2 {
	return fromOrderedTriangles(
		8,
		[
			[0, 5, 6],
			[0, 5, 7],
			[0, 6, 7],
			[5, 6, 7]
		],
		[
			[0, 1],
			[1, 2],
			[0, 2],
			[0, 3],
			[3, 4],
			[0, 4]
		]
	);
}

export interface CupSpace {
	id: string;
	/** plain-text name for buttons */
	name: string;
	/** TeX name, e.g. "T^2" */
	tex: string;
	coeff: 'Z' | 'Z2';
	/** TeX for H⁰, H¹, H² */
	groups: [string, string, string];
	/** Betti numbers over the coefficient field (ℚ for 'Z') */
	betti: [number, number, number];
	/** names (TeX) and colours of the basis of H¹ */
	classes: { tex: string; color: string }[];
	/** TeX name of the generator of H² */
	gen: string;
	/** table[i][j] = ⟨x_i ⌣ x_j, [M]⟩ (mod 2 for 'Z2') */
	table: number[][];
	/** the flat picture, with the fences (absent for the wedge, which is drawn by hand) */
	model?: FlatModel;
	fences?: Pt[][][];
	pushoffs?: Pt[][][];
	/** cochains of the fences (for the wedge: indicator cochains) */
	cochains: number[][];
	/** a sentence (may contain \( \) math) */
	moral: string;
}

const GOLD = 'var(--gold-bright)';
const TEAL = 'var(--teal)';
const VIOLET = 'var(--violet)';
const BLUE = 'var(--blue)';

function check(D: Delta2, cochains: number[][], coeff: 'Z' | 'Z2') {
	for (const c of cochains)
		if (!delta1(D, c).every((x) => (coeff === 'Z' ? x === 0 : mod(x, 2) === 0))) throw new Error('fence is not a cocycle');
}

function tableOf(D: Delta2, cochains: number[][], cycle: number[], coeff: 'Z' | 'Z2'): number[][] {
	return cochains.map((a) => cochains.map((b) => {
		const v = evaluate(cup11(D, a, b), cycle);
		return coeff === 'Z' ? v : mod(v, 2);
	}));
}

/** A chord across the side pair of `side`, oriented so that its fence cochain is +1 on that side's edge. */
function dualChord(M: FlatModel, side: number, lambda: number): Pt[] {
	const c = chord(M, side, lambda);
	const f = fenceCochain(M, [c]);
	const e = M.edgeSegs.findIndex((segs) => segs.some((s) => s.side === side));
	return f[e] > 0 ? c : [...c].reverse();
}

const vline = (x: number): Pt[][] => [
	[
		[x, 0],
		[x, 1]
	]
];
const hlineLeft = (y: number): Pt[][] => [
	[
		[1, y],
		[0, y]
	]
];
const seg = (a: Pt, b: Pt): Pt[][] => [[a, b]];

function torusSpace(coeff: 'Z' | 'Z2'): CupSpace {
	const M = squareModel('torus', 3);
	const fences = [vline(0.45), hlineLeft(0.58)];
	const pushoffs = [vline(0.62), hlineLeft(0.76)];
	const cochains = fences.map((F) => fenceCochain(M, F, coeff === 'Z'));
	check(M.D, cochains, coeff);
	const cycle = coeff === 'Z' ? orientTriangles(M.D)! : fundamentalCycle(M.D, 'Z2')!;
	const Z = coeff === 'Z';
	return {
		id: Z ? 'torus' : 'torus2',
		name: Z ? 'Torus' : 'Torus, mod 2',
		tex: 'T^2',
		coeff,
		groups: Z ? ['\\Z', '\\Z^2', '\\Z'] : ['\\Z/2', '(\\Z/2)^2', '\\Z/2'],
		betti: bettiMod(M.D, Z ? BIG_PRIME : 2),
		classes: [
			{ tex: '\\alpha', color: GOLD },
			{ tex: '\\beta', color: TEAL }
		],
		gen: '\\gamma',
		table: tableOf(M.D, cochains, cycle, coeff),
		model: M,
		fences,
		pushoffs,
		cochains,
		moral: Z
			? 'The two fences cross once, so \\(\\alpha\\smile\\beta=\\gamma\\) generates \\(H^2\\); swapping the order flips the sign; each fence can be slid off itself, so the squares vanish.'
			: 'Mod 2 the signs disappear: \\(\\alpha\\beta=\\beta\\alpha=\\gamma\\), and still every square is zero.'
	};
}

function wedgeSpace(): CupSpace {
	const D = wedgeDelta();
	const e = (a: number, b: number) => D.edges.findIndex(([x, y]) => x === a && y === b);
	const cochains = [D.edges.map((_, i) => (i === e(1, 2) ? 1 : 0)), D.edges.map((_, i) => (i === e(3, 4) ? 1 : 0))];
	check(D, cochains, 'Z');
	const S = orientTriangles(D)!;
	return {
		id: 'wedge',
		name: 'Sphere with two circles',
		tex: 'S^1\\vee S^1\\vee S^2',
		coeff: 'Z',
		groups: ['\\Z', '\\Z^2', '\\Z'],
		betti: bettiMod(D, BIG_PRIME),
		classes: [
			{ tex: '\\alpha', color: GOLD },
			{ tex: '\\beta', color: TEAL }
		],
		gen: '\\gamma',
		table: tableOf(D, cochains, S, 'Z'),
		cochains,
		moral: 'The fences live on different circles and never meet, and the sphere carries no degree-1 class at all: every product is \\(0\\). Same groups as the torus, different ring.'
	};
}

function genus2Space(): CupSpace {
	const M = genus2Model();
	const S0 = orientTriangles(M.D)!;
	const sgn = S0[0] === M.triFlatSign[0] ? 1 : -1;
	const Sigma = S0.map((x) => x * sgn);
	const fences = [0, 1, 4, 5].map((side) => [dualChord(M, side, 0.5)]);
	const pushoffs = [0, 1, 4, 5].map((side) => [dualChord(M, side, 0.74)]);
	const cochains = fences.map((F) => fenceCochain(M, F));
	check(M.D, cochains, 'Z');
	return {
		id: 'genus2',
		name: 'Genus two',
		tex: '\\Sigma_2',
		coeff: 'Z',
		groups: ['\\Z', '\\Z^4', '\\Z'],
		betti: bettiMod(M.D, BIG_PRIME),
		classes: [
			{ tex: '\\alpha_1', color: GOLD },
			{ tex: '\\beta_1', color: TEAL },
			{ tex: '\\alpha_2', color: VIOLET },
			{ tex: '\\beta_2', color: BLUE }
		],
		gen: '\\gamma',
		table: tableOf(M.D, cochains, Sigma, 'Z'),
		model: M,
		fences,
		pushoffs,
		cochains,
		moral: 'Two copies of the torus table, one for each handle. Fences on different handles never meet, so their products vanish.'
	};
}

function rp2Space(): CupSpace {
	const M = squareModel('rp2', 3);
	const fences = [seg([0, 0.4], [1, 0.6])];
	const pushoffs = [seg([0, 0.57], [1, 0.43])];
	const cochains = fences.map((F) => fenceCochain(M, F, false));
	check(M.D, cochains, 'Z2');
	return {
		id: 'rp2',
		name: 'Projective plane, mod 2',
		tex: '\\RP^2',
		coeff: 'Z2',
		groups: ['\\Z/2', '\\Z/2', '\\Z/2'],
		betti: bettiMod(M.D, 2),
		classes: [{ tex: 'x', color: GOLD }],
		gen: '\\gamma',
		table: tableOf(M.D, cochains, fundamentalCycle(M.D, 'Z2')!, 'Z2'),
		model: M,
		fences,
		pushoffs,
		cochains,
		moral: 'Every copy of the fence crosses the original once (two “lines” always meet), so \\(x\\smile x = \\gamma \\neq 0\\): a square that survives.'
	};
}

function kleinSpace(): CupSpace {
	const M = squareModel('klein', 3);
	const fences = [vline(0.45), seg([0, 0.42], [1, 0.58])];
	const pushoffs = [vline(0.62), seg([0, 0.62], [1, 0.38])];
	const cochains = fences.map((F) => fenceCochain(M, F, false));
	check(M.D, cochains, 'Z2');
	return {
		id: 'klein',
		name: 'Klein bottle, mod 2',
		tex: 'K',
		coeff: 'Z2',
		groups: ['\\Z/2', '(\\Z/2)^2', '\\Z/2'],
		betti: bettiMod(M.D, 2),
		classes: [
			{ tex: '\\alpha', color: GOLD },
			{ tex: '\\beta', color: TEAL }
		],
		gen: '\\gamma',
		table: tableOf(M.D, cochains, fundamentalCycle(M.D, 'Z2')!, 'Z2'),
		model: M,
		fences,
		pushoffs,
		cochains,
		moral: 'The same groups as the torus mod 2 — but the fence \\(\\beta\\) runs through the twist and cannot be slid off itself, so \\(\\beta\\smile\\beta=\\gamma\\neq 0\\).'
	};
}

/** All spaces of the explorer, in display order. */
export function cupSpaces(): CupSpace[] {
	return [torusSpace('Z'), wedgeSpace(), genus2Space(), rp2Space(), kleinSpace(), torusSpace('Z2')];
}

/** Crossing points of fence i with fence j (or with the push-off of i when i = j). */
export function crossingsFor(S: CupSpace, i: number, j: number) {
	if (!S.fences || !S.pushoffs) return [];
	return arcCrossings(S.fences[i], i === j ? S.pushoffs[i] : S.fences[j]);
}

/** TeX for a table entry: k·gen, or 0. */
export function entryTeX(v: number, gen: string): string {
	if (v === 0) return '0';
	if (v === 1) return gen;
	if (v === -1) return '-' + gen;
	return `${v}${gen}`;
}
