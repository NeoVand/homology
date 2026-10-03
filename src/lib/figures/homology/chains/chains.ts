// Helpers for §3.2: the small complexes drawn in the figures, chains written
// as TeX, the boundary of an *ordered* simplex (any vertex order), and the
// bookkeeping behind the "boundary of a boundary" pictures.
import { SimplicialComplex, boundaryFaces, key, type Simplex } from '$lib/math/complex';

export type Pt = [number, number];

// ── complexes used by the figures ──────────────────────────────────────────

const hex = (i: number, r: number, cx: number, cy: number): Pt => {
	const th = (Math.PI / 3) * i;
	return [Math.round((cx + r * Math.cos(th)) * 10) / 10, Math.round((cy + r * Math.sin(th)) * 10) / 10];
};

/**
 * The fan of Figure 3.2.1: a hexagon around a centre 0, with five of its six
 * triangles filled; the sixth, [0,1,6], is an empty hole (its edges are present).
 */
export const fan = {
	K: new SimplicialComplex([
		[0, 1, 2],
		[0, 2, 3],
		[0, 3, 4],
		[0, 4, 5],
		[0, 5, 6],
		[0, 6],
		[0, 1],
		[1, 6]
	]),
	// vertex 0 in the middle; 1 bottom-left, then clockwise on screen: 2 bottom-right, 3 right, 4 top-right, 5 top-left, 6 left
	pos: [[300, 180] as Pt, hex(2, 140, 300, 180), hex(1, 140, 300, 180), hex(0, 140, 300, 180), hex(5, 140, 300, 180), hex(4, 140, 300, 180), hex(3, 140, 300, 180)]
};

/** Two triangles sharing the diagonal [1,2] of a square (Figures 3.2.5 and 3.2.6). */
export const square = {
	K: new SimplicialComplex([
		[0, 1, 2],
		[1, 2, 3]
	]),
	// 0 bottom-left, 1 bottom-right, 2 top-left, 3 top-right (screen coordinates)
	pos: [[150, 290] as Pt, [330, 290] as Pt, [150, 110] as Pt, [330, 110] as Pt]
};

/** The square plus an empty triangle on top (Figures 3.2.6–3.2.7): a hole at 2-3-4. */
export const house = {
	K: new SimplicialComplex([
		[0, 1, 2],
		[1, 2, 3],
		[2, 4],
		[3, 4]
	]),
	pos: [[120, 300] as Pt, [280, 300] as Pt, [120, 150] as Pt, [280, 150] as Pt, [200, 40] as Pt]
};

// ── writing chains ─────────────────────────────────────────────────────────

/** [0,1,2] as TeX. */
export const simplexTeX = (s: number[]) => `[${s.join(',')}]`;

/**
 * An integer chain as TeX, e.g. "[0,1] - [0,2] + 2[1,2]". `wrap` can colour
 * each term. The zero chain is written "0".
 */
export function chainTeX(K: SimplicialComplex, k: number, coeffs: number[], wrap: (t: string, i: number) => string = (t) => t): string {
	const parts: string[] = [];
	coeffs.forEach((c, i) => {
		if (!c) return;
		const s = K.simplices[k][i];
		const body = k === 0 ? `${s[0]}` : simplexTeX(s);
		const mag = Math.abs(c) === 1 ? '' : String(Math.abs(c));
		const term = wrap(`${mag}${body}`, i);
		if (parts.length === 0) parts.push(c < 0 ? `-${term}` : term);
		else parts.push(c < 0 ? `- ${term}` : `+ ${term}`);
	});
	return parts.length ? parts.join(' ') : '0';
}

/** A mod-2 chain (a set of simplex indices) as TeX: "[0,1] + [1,2]", or "0". */
export function setTeX(K: SimplicialComplex, k: number, idx: number[], wrap: (t: string, i: number) => string = (t) => t): string {
	const sorted = [...idx].sort((a, b) => a - b);
	if (!sorted.length) return '0';
	return sorted.map((i) => wrap(k === 0 ? `${K.simplices[k][i][0]}` : simplexTeX(K.simplices[k][i]), i)).join(' + ');
}

// ── ordered simplices ──────────────────────────────────────────────────────

/** Sign of the permutation that sorts `order` (+1 even, −1 odd). */
export function permSign(order: number[]): 1 | -1 {
	let sign = 1;
	const a = [...order];
	for (let i = 0; i < a.length; i++)
		for (let j = i + 1; j < a.length; j++) if (a[i] > a[j]) sign = -sign;
	return sign as 1 | -1;
}

/**
 * The boundary of the ordered simplex [w0, …, wk] (vertices in any order),
 * term by term: face (in the order inherited from w) and its sign (−1)^i.
 */
export function orderedBoundaryTerms(order: number[]): { omit: number; face: number[]; sign: 1 | -1 }[] {
	return order.map((_, i) => ({ omit: order[i], face: order.filter((_, j) => j !== i), sign: (i % 2 === 0 ? 1 : -1) as 1 | -1 }));
}

/**
 * The same boundary rewritten with every face in increasing order: a face
 * written in another order equals ± the sorted face, by the sign of the
 * reordering. Returns sorted-face key → coefficient.
 */
export function orderedBoundary(order: number[]): Map<string, number> {
	const out = new Map<string, number>();
	for (const { face, sign } of orderedBoundaryTerms(order)) {
		const sorted = [...face].sort((a, b) => a - b);
		const k = key(sorted);
		out.set(k, (out.get(k) ?? 0) + sign * permSign(face));
	}
	return out;
}

// ── the tetrahedron cascade (Figure 3.2.3) ─────────────────────────────────

export interface TetraFace {
	face: Simplex; // sorted
	sign: 1 | -1; // its sign in ∂[0,1,2,3]
	/** its three edges, each with the direction induced by the signed face: [from, to] */
	edges: { edge: Simplex; from: number; to: number }[];
}

/** ∂[0,1,2,3] face by face, with the induced direction of every edge of every face. */
export function tetraCascade(): TetraFace[] {
	return boundaryFaces([0, 1, 2, 3]).map(({ face, sign }) => ({
		face,
		sign,
		edges: boundaryFaces(face).map(({ face: e, sign: s2 }) => {
			const c = sign * s2; // coefficient of the sorted edge e in ∂(sign·face)
			return { edge: e, from: c > 0 ? e[0] : e[1], to: c > 0 ? e[1] : e[0] };
		})
	}));
}
