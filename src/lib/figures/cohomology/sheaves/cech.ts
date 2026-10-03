// Čech cohomology of covers of the circle by open arcs, with constant
// coefficients G (= ℝ here; the integer computations are identical).
//
// Č⁰ = one number per arc (a locally constant function on a connected arc is
// a constant); Č¹ = one number per *connected component* of each pairwise
// overlap U_i ∩ U_j, i < j. The coboundary is (δf)_ij = f_j − f_i on every
// component of U_i ∩ U_j.
import { rankReal, type Mat } from './reals';

const TAU = Math.PI * 2;

/** An open arc of the circle: angles start < θ < start + length (radians). */
export interface Arc {
	start: number;
	length: number;
}

/** Open intervals (in absolute angle, start in [0, 2π)) making up A ∩ B. */
export function arcIntersection(A: Arc, B: Arc): Arc[] {
	const a = ((A.start % TAU) + TAU) % TAU;
	const s = (((B.start - a) % TAU) + TAU) % TAU; // B's start relative to A's
	const pieces: [number, number][] =
		s + B.length <= TAU
			? [[s, s + B.length]]
			: [
					[s, TAU],
					[0, s + B.length - TAU]
				];
	const out: Arc[] = [];
	for (const [p, q] of pieces) {
		const lo = Math.max(p, 0);
		const hi = Math.min(q, A.length);
		if (hi - lo > 1e-12) out.push({ start: (a + lo) % TAU, length: hi - lo });
	}
	// two pieces that touch (wrap-around at A's start) form one component
	if (out.length === 2) {
		const [u, v] = out;
		const end = (x: Arc) => (x.start + x.length) % TAU;
		if (Math.abs(end(v) - u.start) < 1e-12 || Math.abs(end(u) - v.start) < 1e-12) {
			const first = Math.abs(end(v) - u.start) < 1e-12 ? v : u;
			return [{ start: first.start, length: u.length + v.length }];
		}
	}
	return out;
}

export interface CechCircle {
	arcs: Arc[];
	/** one entry per component of a pairwise overlap: which pair, and the piece */
	overlaps: { i: number; j: number; piece: Arc }[];
	/** δ⁰ as a matrix: rows = overlap components, columns = arcs */
	delta: Mat;
	/** is every triple intersection empty? (then every 1-cochain is a cocycle) */
	noTriples: boolean;
	h0: number;
	h1: number;
}

/** The Čech complex Č⁰ → Č¹ of a cover of the circle by arcs. */
export function cechCircle(arcs: Arc[]): CechCircle {
	const overlaps: CechCircle['overlaps'] = [];
	for (let i = 0; i < arcs.length; i++)
		for (let j = i + 1; j < arcs.length; j++)
			for (const piece of arcIntersection(arcs[i], arcs[j])) overlaps.push({ i, j, piece });
	const delta: Mat = overlaps.map(({ i, j }) => arcs.map((_, k) => (k === j ? 1 : k === i ? -1 : 0)));
	let noTriples = true;
	for (let i = 0; i < arcs.length; i++)
		for (let j = i + 1; j < arcs.length; j++)
			for (let k = j + 1; k < arcs.length; k++)
				for (const p of arcIntersection(arcs[i], arcs[j])) if (arcIntersection(p, arcs[k]).length) noTriples = false;
	const r = overlaps.length ? rankReal(delta) : 0;
	return { arcs, overlaps, delta, noTriples, h0: arcs.length - r, h1: noTriples ? overlaps.length - r : NaN };
}

/** The standard three-arc cover: each arc 160°, centred 120° apart. */
export function threeArcs(width = (160 * Math.PI) / 180): Arc[] {
	return [0, 1, 2].map((k) => ({ start: (k * TAU) / 3 + Math.PI / 2 - width / 2, length: width }));
}

/** Two arcs, each 250° wide, centred at top and bottom: they meet in two pieces. */
export function twoArcs(width = (250 * Math.PI) / 180): Arc[] {
	return [
		{ start: Math.PI / 2 - width / 2, length: width },
		{ start: (3 * Math.PI) / 2 - width / 2, length: width }
	];
}

/**
 * Three arcs: try to absorb the overlap data c = (c01, c12, c02) as differences
 * of numbers on the arcs. f0 = 0, f1 = c01, f2 = c02 matches the 01 and 02
 * overlaps; the 12 overlap then is off by the holonomy c01 + c12 − c02.
 */
export function absorb3(c01: number, c12: number, c02: number) {
	const f = [0, c01, c02];
	return { f, holonomy: c01 + c12 - c02 };
}

/** Two arcs U, V meeting in W1 ⊔ W2: the class of (c1, c2) is c2 − c1. */
export function absorb2(c1: number, c2: number) {
	return { f: [0, c1], holonomy: c2 - c1 };
}

/** Matrices for the text: δ⁰ for three arcs (rows 01, 02, 12), two arcs, and the naive one-edge nerve. */
export const delta3: Mat = [
	[-1, 1, 0],
	[-1, 0, 1],
	[0, -1, 1]
];
export const delta2: Mat = [
	[-1, 1],
	[-1, 1]
];
export const deltaNaive: Mat = [[-1, 1]];

export function dims(delta: Mat, nCochains0: number) {
	const r = rankReal(delta);
	return { h0: nCochains0 - r, h1: delta.length - r };
}
