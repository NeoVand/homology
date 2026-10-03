// Circular coordinates from cohomology (de Silva–Morozov–Vejdemo-Johansson):
//   point cloud → Rips complex at a scale where H¹ = ℤ → an integer cocycle α
//   → harmonic smoothing ᾱ = α + δf (least squares) → θ = f mod 1.
import { SimplicialComplex } from '$lib/math/complex';
import { conjugateGradient, matmul, mulVec, transpose } from '$lib/math/linalg';
import { rankModP } from '../homological-algebra/abelian';
import { noisyCircle, mulberry32, ripsPersistence, bettiAt } from '$lib/math/persistence';

const P = 32003; // a prime; ranks mod P agree with ranks over ℚ for these small complexes

/** Vietoris–Rips complex in the radius convention: an edge when two balls of radius r touch (d ≤ 2r). */
export function ripsComplex(points: [number, number][], r: number): SimplicialComplex {
	const n = points.length;
	const near: boolean[][] = Array.from({ length: n }, () => new Array<boolean>(n).fill(false));
	const gens: number[][] = [];
	for (let i = 0; i < n; i++) gens.push([i]);
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			const d = Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]);
			if (d <= 2 * r) {
				near[i][j] = near[j][i] = true;
				gens.push([i, j]);
			}
		}
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			if (!near[i][j]) continue;
			for (let k = j + 1; k < n; k++) if (near[i][k] && near[j][k]) gens.push([i, j, k]);
		}
	return new SimplicialComplex(gens);
}

export function betti(K: SimplicialComplex): [number, number] {
	const r1 = K.count(1) ? rankModP(K.boundaryMatrix(1), P) : 0;
	const r2 = K.count(2) ? rankModP(K.boundaryMatrix(2), P) : 0;
	return [K.count(0) - r1, K.count(1) - r1 - r2];
}

/** Edges of a BFS spanning forest (as edge indices), starting from `root`. */
export function spanningTree(K: SimplicialComplex, root = 0): Set<number> {
	const nV = K.count(0);
	const adj: { v: number; e: number }[][] = Array.from({ length: nV }, () => []);
	K.simplices[1]?.forEach(([a, b], e) => {
		adj[a].push({ v: b, e });
		adj[b].push({ v: a, e });
	});
	const seen = new Array<boolean>(nV).fill(false);
	const tree = new Set<number>();
	const order = [root, ...[...Array(nV).keys()].filter((v) => v !== root)];
	for (const s of order) {
		if (seen[s]) continue;
		seen[s] = true;
		const queue = [s];
		while (queue.length) {
			const x = queue.shift()!;
			for (const { v, e } of adj[x])
				if (!seen[v]) {
					seen[v] = true;
					tree.add(e);
					queue.push(v);
				}
		}
	}
	return tree;
}

/**
 * An integer 1-cocycle generating H¹(K; ℤ) ≅ ℤ, normalised to vanish on a spanning
 * tree (every class has exactly one such representative). Returns null unless b₁ = 1.
 */
export function generatingCocycle(K: SimplicialComplex, root = 0): number[] | null {
	const nE = K.count(1);
	const tree = spanningTree(K, root);
	const free = [...Array(nE).keys()].filter((e) => !tree.has(e));
	const col = new Map(free.map((e, k) => [e, k]));
	// constraints: (δα)(t) = α(∂t) = 0 for every triangle
	const rows: number[][] = [];
	K.boundaryColumns(2).forEach((bd) => {
		const row = new Array<number>(free.length).fill(0);
		let any = false;
		for (const [e, s] of bd)
			if (col.has(e)) {
				row[col.get(e)!] += s;
				any = true;
			}
		if (any) rows.push(row);
	});
	const ns = nullspaceFloat(rows, free.length);
	if (ns.length !== 1) return null;
	let v = ns[0];
	const nz = v.filter((x) => Math.abs(x) > 1e-9).map(Math.abs);
	if (!nz.length) return null;
	const m = Math.min(...nz);
	v = v.map((x) => x / m);
	let k = 1;
	while (k <= 12 && v.some((x) => Math.abs(x * k - Math.round(x * k)) > 1e-6)) k++;
	let w = v.map((x) => Math.round(x * k));
	const g = w.reduce((a, x) => gcdInt(a, Math.abs(x)), 0) || 1;
	w = w.map((x) => x / g);
	const alpha = new Array<number>(nE).fill(0);
	free.forEach((e, i) => (alpha[e] = w[i]));
	// exact integer check of the cocycle condition
	const ok = K.coboundary(1, alpha).every((x) => x === 0);
	return ok ? alpha : null;
}

function gcdInt(a: number, b: number): number {
	while (b) [a, b] = [b, a % b];
	return a;
}

/** Null space of a dense real matrix (Gaussian elimination with partial pivoting). */
export function nullspaceFloat(M: number[][], cols: number, tol = 1e-9): number[][] {
	const A = M.map((r) => r.slice());
	const piv: number[] = [];
	let rank = 0;
	for (let c = 0; c < cols && rank < A.length; c++) {
		let best = rank;
		for (let r = rank + 1; r < A.length; r++) if (Math.abs(A[r][c]) > Math.abs(A[best][c])) best = r;
		if (Math.abs(A[best]?.[c] ?? 0) < tol) continue;
		[A[rank], A[best]] = [A[best], A[rank]];
		const p = A[rank][c];
		for (let j = c; j < cols; j++) A[rank][j] /= p;
		for (let r = 0; r < A.length; r++) {
			if (r === rank) continue;
			const f = A[r][c];
			if (Math.abs(f) < 1e-15) continue;
			for (let j = c; j < cols; j++) A[r][j] -= f * A[rank][j];
		}
		piv.push(c);
		rank++;
	}
	const freeCols = [...Array(cols).keys()].filter((c) => !piv.includes(c));
	return freeCols.map((fc) => {
		const v = new Array<number>(cols).fill(0);
		v[fc] = 1;
		piv.forEach((pc, r) => (v[pc] = -A[r][fc]));
		return v;
	});
}

export interface Circular {
	/** circle-valued coordinate of each vertex, in [0, 1) */
	theta: number[];
	/** the real 0-cochain f with ᾱ = α + δf */
	f: number[];
	/** the harmonic (smoothest) representative ᾱ */
	bar: number[];
}

/** Harmonic smoothing: minimise ‖α + δf‖ over real f, and read off θ = f mod 1. */
export function circularCoordinate(K: SimplicialComplex, alpha: number[]): Circular {
	const d0 = transpose(K.boundaryMatrix(1)); // edges × vertices
	const d0T = transpose(d0);
	const L0 = matmul(d0T, d0);
	const rhs = mulVec(d0T, alpha).map((x) => -x);
	const f = conjugateGradient(L0, rhs, 2000, 1e-12);
	const df = mulVec(d0, f);
	const bar = alpha.map((a, i) => a + df[i]);
	const theta = f.map((x) => ((x % 1) + 1) % 1);
	return { theta, f, bar };
}

/** The figure's data: forty noisy points near a slightly squashed circle. */
export function loopData(seed: number): [number, number][] {
	const base = noisyCircle(40, 1, 0.07, seed);
	const rnd = mulberry32(seed + 3);
	const sx = 1 + (rnd() - 0.5) * 0.3;
	return base.map(([x, y]) => [x * sx, y] as [number, number]);
}

/**
 * A scale at which the Rips complex has exactly one loop (b₀ = b₁ = 1): the
 * middle of the longest run of such radii on a grid — where the most persistent
 * loop is most clearly alive. One persistence computation (edge lengths up to
 * 2·hi, read in the radius convention) answers every radius at once.
 * Null if there is no such scale.
 */
export function goodScale(points: [number, number][], lo = 0.04, hi = 0.42, step = 0.01): number | null {
	const f = ripsPersistence(points, 2 * hi);
	const n = Math.round((hi - lo) / step);
	let best: [number, number] | null = null;
	let start = -1;
	for (let k = 0; k <= n + 1; k++) {
		const [b0, b1] = k <= n ? bettiAt(f, 2 * (lo + k * step)) : [0, 0];
		const ok = b0 === 1 && b1 === 1;
		if (ok && start < 0) start = k;
		if (!ok && start >= 0) {
			if (!best || k - start > best[1] - best[0]) best = [start, k];
			start = -1;
		}
	}
	if (!best) return null;
	const mid = Math.floor((best[0] + best[1] - 1) / 2);
	return Math.round((lo + mid * step) * 100) / 100;
}
