// Small cell complexes (Δ-complexes) for §4.2, given directly by their boundary
// matrices, and (co)homology computed from them exactly. The simplicial
// examples (circle, sphere, …) use the tested engine in $lib/math instead.
import { smith, rankZ2, transpose, matmul, type Matrix } from '$lib/math/linalg';
import type { HomologyGroup } from '$lib/math/homology';

export interface CellComplex {
	name: string;
	/** cell names per dimension, e.g. [['v'], ['a','b','c'], ['L','U']] */
	cells: string[][];
	/** boundary matrices: d[k] is ∂_k (rows: (k−1)-cells, cols: k-cells), for k = 1 … dim */
	d: Record<number, Matrix>;
}

export type Coeff = 'Z' | 'Z2' | 'Q';

const zero = (r: number, c: number): Matrix => Array.from({ length: r }, () => new Array<number>(c).fill(0));

/** ∂_k, or the zero matrix when k is out of range. */
export function bd(X: CellComplex, k: number): Matrix {
	const rows = X.cells[k - 1]?.length ?? 0;
	const cols = X.cells[k]?.length ?? 0;
	return X.d[k] ?? zero(rows, cols);
}

/** δ_k = ∂_{k+1}ᵀ : C^k → C^{k+1} (rows: (k+1)-cells, cols: k-cells). */
export function cobd(X: CellComplex, k: number): Matrix {
	const rows = X.cells[k + 1]?.length ?? 0;
	const cols = X.cells[k]?.length ?? 0;
	const D = X.d[k + 1];
	return D ? transpose(D) : zero(rows, cols);
}

function rank(M: Matrix, c: Coeff): number {
	if (!M.length || !M[0].length) return 0;
	return c === 'Z2' ? rankZ2(M) : smith(M).rank;
}
function torsion(M: Matrix): number[] {
	if (!M.length || !M[0].length) return [];
	return smith(M).diagonal.filter((x) => x > 1);
}

/** Homology H_0 … H_dim. */
export function cellHomology(X: CellComplex, c: Coeff = 'Z'): HomologyGroup[] {
	const out: HomologyGroup[] = [];
	for (let k = 0; k < X.cells.length; k++) {
		const n = X.cells[k].length;
		const r = n - rank(bd(X, k), c) - rank(bd(X, k + 1), c);
		out.push({ rank: r, torsion: c === 'Z' ? torsion(bd(X, k + 1)) : [] });
	}
	return out;
}

/** Cohomology H^0 … H^dim, computed directly from the cochain complex (no UCT). */
export function cellCohomology(X: CellComplex, c: Coeff = 'Z'): HomologyGroup[] {
	const out: HomologyGroup[] = [];
	for (let k = 0; k < X.cells.length; k++) {
		const n = X.cells[k].length;
		const r = n - rank(cobd(X, k), c) - rank(cobd(X, k - 1), c);
		out.push({ rank: r, torsion: c === 'Z' ? torsion(cobd(X, k - 1)) : [] });
	}
	return out;
}

/** Apply a matrix to a vector. */
export function apply(M: Matrix, v: number[]): number[] {
	return M.map((row) => row.reduce((s, x, j) => s + x * v[j], 0));
}

/** Check δ∘δ = 0 (equivalently ∂∘∂ = 0) for a cell complex. */
export function isComplex(X: CellComplex): boolean {
	for (let k = 0; k + 1 < X.cells.length; k++) {
		const P = matmul(cobd(X, k + 1), cobd(X, k));
		if (P.some((row) => row.some((x) => x !== 0))) return false;
	}
	return true;
}

// ── the three square complexes ─────────────────────────────────────────────
// Squares with corners (0,0), (1,0), (1,1), (0,1); a = bottom/top, b = left/right,
// c = the diagonal; triangles named by their position in the square.

/** Torus (Hatcher’s Δ-complex): one vertex; L = [(0,0),(1,0),(1,1)], U = [(0,0),(0,1),(1,1)]; ∂L = ∂U = a + b − c. */
export const torusDelta: CellComplex = {
	name: 'Torus',
	cells: [['v'], ['a', 'b', 'c'], ['L', 'U']],
	d: {
		1: [[0, 0, 0]],
		2: [
			[1, 1],
			[1, 1],
			[-1, -1]
		]
	}
};

/**
 * Real projective plane: vertices v = {(0,0),(1,1)} and w = {(1,0),(0,1)}; a: v→w (bottom; top run right to left),
 * b: v→w (left upward; right downward), c: w→w (diagonal (1,0)→(0,1)).
 * T₁ = [(0,0),(1,0),(0,1)], ∂T₁ = a − b + c;  T₂ = [(1,1),(1,0),(0,1)], ∂T₂ = −a + b + c.
 */
export const rp2Delta: CellComplex = {
	name: 'Projective plane',
	cells: [
		['v', 'w'],
		['a', 'b', 'c'],
		['T₁', 'T₂']
	],
	d: {
		1: [
			[-1, -1, 0],
			[1, 1, 0]
		],
		2: [
			[1, -1],
			[-1, 1],
			[1, 1]
		]
	}
};

/**
 * Klein bottle, with the conventions of §2.2, §3.3 and §3.4: one vertex; a along the bottom (left to right) is
 * glued to the top reversed; b up both sides; c the diagonal. ∂L = a + b − c, ∂U = c + a − b, so ∂(L + U) = 2a.
 */
export const kleinDelta: CellComplex = {
	name: 'Klein bottle',
	cells: [['v'], ['a', 'b', 'c'], ['L', 'U']],
	d: {
		1: [[0, 0, 0]],
		2: [
			[1, 1],
			[1, -1],
			[-1, 1]
		]
	}
};

/** The circle as one vertex and one edge (δ = 0). */
export const circleDelta: CellComplex = {
	name: 'Circle',
	cells: [['v'], ['e']],
	d: { 1: [[0]] }
};

// ── the doubling map of the circle, simplicially ───────────────────────────

/**
 * The map z ↦ z² as a simplicial map from a hexagon (vertices 0…5) onto a triangle
 * (vertices 0, 1, 2): vertex i ↦ i mod 3. Returns, for each hexagon edge i → i+1 (taken
 * in cyclic order), the triangle edge it lands on and the orientation sign relative to
 * the triangle's edges [0,1], [1,2], [0,2] (ordered as listed).
 */
export function doublingMap(): { edge: number; sign: 1 | -1 }[] {
	const triEdges: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2]
	];
	const out: { edge: number; sign: 1 | -1 }[] = [];
	for (let i = 0; i < 6; i++) {
		const a = i % 3;
		const b = (i + 1) % 3;
		const e = triEdges.findIndex(([x, y]) => (x === a && y === b) || (x === b && y === a));
		out.push({ edge: e, sign: triEdges[e][0] === a ? 1 : -1 });
	}
	return out;
}

/** Push a 1-chain on the hexagon (coefficients on its 6 cyclic edges) forward to the triangle. */
export function pushForward(chain: number[]): number[] {
	const out = [0, 0, 0];
	doublingMap().forEach(({ edge, sign }, i) => (out[edge] += sign * chain[i]));
	return out.map((x) => x + 0);
}

/** Pull a 1-cochain on the triangle (values on [0,1], [1,2], [0,2]) back to the hexagon's 6 cyclic edges. */
export function pullBack(cochain: number[]): number[] {
	// (+ 0 turns a −0 into 0)
	return doublingMap().map(({ edge, sign }) => sign * cochain[edge] + 0);
}

// ── fences on the torus ────────────────────────────────────────────────────

/**
 * Signed crossings of the closed loop t ↦ (u₁ + p t, v₁ + q t), t ∈ [0, 1), with the
 * "meridian fence" u = u₀ + A sin(2π m v) on the torus (coordinates mod 1).
 * A crossing counts +1 when u − F(v) increases through an integer, −1 when it decreases.
 */
export function fenceCrossings(
	p: number,
	q: number,
	o: { u0?: number; A?: number; m?: number; u1?: number; v1?: number; samples?: number } = {}
): { t: number; sign: 1 | -1 }[] {
	const { u0 = 0.25, A = 0, m = 1, u1 = 0.03, v1 = 0.11, samples = 4000 } = o;
	const F = (v: number) => u0 + A * Math.sin(2 * Math.PI * m * v);
	const h = (t: number) => u1 + p * t - F(v1 + q * t);
	const out: { t: number; sign: 1 | -1 }[] = [];
	let prev = Math.floor(h(0));
	for (let i = 1; i <= samples; i++) {
		const t = i / samples;
		const cur = Math.floor(h(t));
		if (cur !== prev) {
			// one or more integers crossed between the samples
			const step = cur > prev ? 1 : -1;
			for (let k = prev; k !== cur; k += step) out.push({ t: t - 0.5 / samples, sign: step as 1 | -1 });
			prev = cur;
		}
	}
	return out;
}
