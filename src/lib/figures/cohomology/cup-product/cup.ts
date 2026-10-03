// Cup products on small 2-dimensional Δ-complexes (ordered simplicial complexes).
//
// Conventions (docs/AUTHORING.md §4): an edge is an ordered pair [tail, head];
// a triangle is an ordered simplex [v0, v1, v2] whose three faces are
//   front  e01 = [v0, v1]
//   back   e12 = [v1, v2]
//   long   e02 = [v0, v2]
// with  ∂[v0,v1,v2] = [v1,v2] − [v0,v2] + [v0,v1].
// The coboundary is (δφ)(σ) = φ(∂σ) and the cup product is "front face times
// back face", with no sign:
//   (φ ⌣ ψ)([v0,v1,v2]) = φ([v0,v1]) · ψ([v1,v2]).
//
// A Δ-complex only needs each simplex to carry an ordering of its vertices that
// is compatible with its faces; an ordinary simplicial complex with integer
// labels is the special case "order = increasing labels" (`fromSimplicial`).

import type { SimplicialComplex } from '$lib/math/complex';

export interface Delta2 {
	/** number of vertices (ids 0 … nV−1) */
	nV: number;
	/** edges[e] = [tail, head] */
	edges: [number, number][];
	/** tris[t] = [front e01, back e12, long e02] (edge indices) */
	tris: [number, number, number][];
}

export type Cochain = number[];
export type Chain = number[];

/** The ordered vertices [v0, v1, v2] of triangle t. */
export function triVerts(D: Delta2, t: number): [number, number, number] {
	const [f, b] = D.tris[t];
	return [D.edges[f][0], D.edges[f][1], D.edges[b][1]];
}

/** Throws if the faces of some triangle do not fit together. */
export function validate(D: Delta2): void {
	D.tris.forEach(([f, b, l], t) => {
		const [f0, f1] = D.edges[f];
		const [b0, b1] = D.edges[b];
		const [l0, l1] = D.edges[l];
		if (f1 !== b0 || f0 !== l0 || b1 !== l1) throw new Error(`triangle ${t}: faces do not match`);
	});
}

/** An integer-labelled simplicial complex, ordered by increasing labels. */
export function fromSimplicial(K: SimplicialComplex): Delta2 {
	const nV = Math.max(-1, ...K.vertices) + 1;
	const edges = (K.simplices[1] ?? []).map(([a, b]) => [a, b] as [number, number]);
	const tris = (K.simplices[2] ?? []).map(
		([a, b, c]) => [K.indexOf([a, b]), K.indexOf([b, c]), K.indexOf([a, c])] as [number, number, number]
	);
	return { nV, edges, tris };
}

/**
 * Build from ordered triangles [v0, v1, v2] (edges are identified by their
 * endpoints, so this produces an ordered simplicial complex). Every shared edge
 * must be oriented the same way by all triangles containing it.
 * `extraEdges` adds edges that lie in no triangle (e.g. the circles of a wedge).
 */
export function fromOrderedTriangles(
	nV: number,
	tris: [number, number, number][],
	extraEdges: [number, number][] = []
): Delta2 {
	const edges: [number, number][] = [];
	const index = new Map<string, number>();
	const edge = (a: number, b: number) => {
		if (index.has(`${b}>${a}`)) throw new Error(`edge ${a}–${b} is oriented both ways`);
		const k = `${a}>${b}`;
		if (!index.has(k)) {
			index.set(k, edges.length);
			edges.push([a, b]);
		}
		return index.get(k)!;
	};
	for (const [a, b] of extraEdges) edge(a, b);
	const T = tris.map(([a, b, c]) => [edge(a, b), edge(b, c), edge(a, c)] as [number, number, number]);
	const D = { nV, edges, tris: T };
	validate(D);
	return D;
}

// ── the cochain complex ───────────────────────────────────────────────────

/** δ: C⁰ → C¹, (δf)([u,v]) = f(v) − f(u). */
export function delta0(D: Delta2, f: Cochain): Cochain {
	return D.edges.map(([a, b]) => f[b] - f[a] || 0);
}

/** δ: C¹ → C², (δφ)([v0,v1,v2]) = φ([v1,v2]) − φ([v0,v2]) + φ([v0,v1]). */
export function delta1(D: Delta2, phi: Cochain): Cochain {
	return D.tris.map(([f, b, l]) => phi[b] - phi[l] + phi[f] || 0);
}

/** ∂: C₂ → C₁ (coefficients on edges). */
export function boundary2(D: Delta2, c: Chain): Chain {
	const out = new Array<number>(D.edges.length).fill(0);
	D.tris.forEach(([f, b, l], t) => {
		const x = c[t] ?? 0;
		if (!x) return;
		out[b] += x;
		out[l] -= x;
		out[f] += x;
	});
	return out;
}

/** ∂: C₁ → C₀ (coefficients on vertices). */
export function boundary1(D: Delta2, c: Chain): Chain {
	const out = new Array<number>(D.nV).fill(0);
	D.edges.forEach(([a, b], e) => {
		const x = c[e] ?? 0;
		out[b] += x;
		out[a] -= x;
	});
	return out;
}

/** ⟨w, c⟩ = Σ w(σ)·c(σ): integrate a cochain over a chain. */
export function evaluate(w: Cochain, c: Chain): number {
	let s = 0;
	for (let i = 0; i < w.length; i++) s += (w[i] ?? 0) * (c[i] ?? 0);
	return s || 0;
}

// ── cup products (front face × back face) ─────────────────────────────────

/** 0 ⌣ 0: pointwise product of functions on vertices. */
export function cup00(f: Cochain, g: Cochain): Cochain {
	return f.map((x, i) => x * g[i] || 0);
}

/** (f ⌣ φ)([u,v]) = f(u) · φ([u,v]) */
export function cup01(D: Delta2, f: Cochain, phi: Cochain): Cochain {
	return D.edges.map(([a], e) => f[a] * phi[e] || 0);
}

/** (φ ⌣ f)([u,v]) = φ([u,v]) · f(v) */
export function cup10(D: Delta2, phi: Cochain, f: Cochain): Cochain {
	return D.edges.map(([, b], e) => phi[e] * f[b] || 0);
}

/** (φ ⌣ ψ)([v0,v1,v2]) = φ([v0,v1]) · ψ([v1,v2]) */
export function cup11(D: Delta2, phi: Cochain, psi: Cochain): Cochain {
	return D.tris.map(([f, b]) => phi[f] * psi[b] || 0);
}

/** (f ⌣ w)([v0,v1,v2]) = f(v0) · w([v0,v1,v2]) */
export function cup02(D: Delta2, f: Cochain, w: Cochain): Cochain {
	return D.tris.map((_, t) => f[triVerts(D, t)[0]] * w[t] || 0);
}

/** (w ⌣ f)([v0,v1,v2]) = w([v0,v1,v2]) · f(v2) */
export function cup20(D: Delta2, w: Cochain, f: Cochain): Cochain {
	return D.tris.map((_, t) => w[t] * f[triVerts(D, t)[2]] || 0);
}

/** Cup product of a p-cochain and a q-cochain (p + q ≤ 2). */
export function cup(D: Delta2, p: number, a: Cochain, q: number, b: Cochain): Cochain {
	const k = `${p}${q}`;
	if (k === '00') return cup00(a, b);
	if (k === '01') return cup01(D, a, b);
	if (k === '10') return cup10(D, a, b);
	if (k === '11') return cup11(D, a, b);
	if (k === '02') return cup02(D, a, b);
	if (k === '20') return cup20(D, a, b);
	throw new Error(`cup product of degrees ${p} and ${q} lands above dimension 2`);
}

// ── fundamental classes ───────────────────────────────────────────────────

/**
 * Signs ε_t = ±1 with Σ ε_t ∂t = 0 — a coherent orientation — when every edge
 * lies in exactly zero or two triangles. Returns null for a non-orientable
 * surface. (The overall sign is fixed so that ε_0 = +1, or by `firstSign`.)
 */
export function orientTriangles(D: Delta2, firstSign: 1 | -1 = 1): number[] | null {
	const occ: { t: number; s: number }[][] = D.edges.map(() => []);
	D.tris.forEach(([f, b, l], t) => {
		occ[b].push({ t, s: 1 });
		occ[l].push({ t, s: -1 });
		occ[f].push({ t, s: 1 });
	});
	if (occ.some((o) => o.length !== 0 && o.length !== 2)) return null;
	const eps = new Array<number>(D.tris.length).fill(0);
	const triEdges = D.tris.map((x) => x);
	for (let start = 0; start < D.tris.length; start++) {
		if (eps[start]) continue;
		eps[start] = start === 0 ? firstSign : 1;
		const queue = [start];
		while (queue.length) {
			const t = queue.shift()!;
			for (const e of triEdges[t]) {
				const [x, y] = occ[e];
				if (!x || !y) continue;
				const [me, other] = x.t === t ? [x, y] : [y, x];
				if (other.t === t) continue;
				// need ε_me·s_me + ε_other·s_other = 0
				const want = -eps[t] * me.s * other.s;
				if (!eps[other.t]) {
					eps[other.t] = want;
					queue.push(other.t);
				} else if (eps[other.t] !== want) return null;
			}
		}
	}
	return boundary2(D, eps).every((x) => x === 0) ? eps : null;
}

/** The fundamental 2-cycle: coherent signs over ℤ, or all ones over ℤ/2. */
export function fundamentalCycle(D: Delta2, coeff: 'Z' | 'Z2'): Chain | null {
	if (coeff === 'Z') return orientTriangles(D);
	const ones = D.tris.map(() => 1);
	return boundary2(D, ones).every((x) => x % 2 === 0) ? ones : null;
}

// ── exact linear algebra over 𝔽_p (p = 2, or a large prime standing in for ℚ) ──

export const BIG_PRIME = 1_000_003;

export const mod = (x: number, p: number) => ((x % p) + p) % p;

function inv(a: number, p: number): number {
	// extended Euclid
	let [r0, r1] = [mod(a, p), p];
	let [s0, s1] = [1, 0];
	while (r1) {
		const q = Math.floor(r0 / r1);
		[r0, r1] = [r1, r0 - q * r1];
		[s0, s1] = [s1, s0 - q * s1];
	}
	return mod(s0, p);
}

/** Row-reduce a copy of M (rows × cols) over 𝔽_p; returns the echelon form and pivot columns. */
export function rowReduce(M: number[][], p: number): { R: number[][]; pivots: number[] } {
	const R = M.map((row) => row.map((x) => mod(x, p)));
	const rows = R.length;
	const cols = rows ? R[0].length : 0;
	const pivots: number[] = [];
	let r = 0;
	for (let c = 0; c < cols && r < rows; c++) {
		let pr = -1;
		for (let i = r; i < rows; i++) if (R[i][c]) {
			pr = i;
			break;
		}
		if (pr === -1) continue;
		[R[r], R[pr]] = [R[pr], R[r]];
		const iv = inv(R[r][c], p);
		for (let j = c; j < cols; j++) R[r][j] = (R[r][j] * iv) % p;
		for (let i = 0; i < rows; i++) {
			if (i === r || !R[i][c]) continue;
			const f = R[i][c];
			for (let j = c; j < cols; j++) R[i][j] = mod(R[i][j] - f * R[r][j], p);
		}
		pivots.push(c);
		r++;
	}
	return { R, pivots };
}

export function rankMod(M: number[][], p: number): number {
	return rowReduce(M, p).pivots.length;
}

/** A basis of { x : M x = 0 } over 𝔽_p. */
export function nullspaceMod(M: number[][], cols: number, p: number): number[][] {
	if (!M.length) return Array.from({ length: cols }, (_, i) => Array.from({ length: cols }, (_, j) => (i === j ? 1 : 0)));
	const { R, pivots } = rowReduce(M, p);
	const pivotSet = new Set(pivots);
	const out: number[][] = [];
	for (let free = 0; free < cols; free++) {
		if (pivotSet.has(free)) continue;
		const x = new Array<number>(cols).fill(0);
		x[free] = 1;
		pivots.forEach((pc, i) => (x[pc] = mod(-R[i][free], p)));
		out.push(x);
	}
	return out;
}

/** Matrix of δ⁰ (rows = edges, cols = vertices). */
export function delta0Matrix(D: Delta2): number[][] {
	return D.edges.map(([a, b]) => {
		const row = new Array<number>(D.nV).fill(0);
		row[b] += 1;
		row[a] -= 1;
		return row;
	});
}

/** Matrix of δ¹ (rows = triangles, cols = edges). */
export function delta1Matrix(D: Delta2): number[][] {
	return D.tris.map(([f, b, l]) => {
		const row = new Array<number>(D.edges.length).fill(0);
		row[b] += 1;
		row[l] -= 1;
		row[f] += 1;
		return row;
	});
}

/** Betti numbers b₀, b₁, b₂ over 𝔽_p. */
export function bettiMod(D: Delta2, p: number): [number, number, number] {
	const r1 = rankMod(delta0Matrix(D), p);
	const r2 = D.tris.length ? rankMod(delta1Matrix(D), p) : 0;
	return [D.nV - r1, D.edges.length - r1 - r2, D.tris.length - r2];
}

/**
 * Cocycles representing a basis of H¹(D; 𝔽_p): extend a basis of the
 * coboundaries B¹ = im δ⁰ by cocycles (ker δ¹) until all of Z¹ is spanned.
 */
export function cocycleBasis1(D: Delta2, p: number): number[][] {
	const nE = D.edges.length;
	const Z = D.tris.length ? nullspaceMod(delta1Matrix(D), nE, p) : nullspaceMod([], nE, p);
	const span: number[][] = [];
	const independent = (v: number[]) => {
		const before = span.length ? rankMod(span, p) : 0;
		return rankMod([...span, v], p) > before;
	};
	// coboundaries: columns of δ⁰
	const d0 = delta0Matrix(D);
	for (let v = 0; v < D.nV; v++) {
		const col = d0.map((row) => row[v]);
		if (independent(col)) span.push(col);
	}
	const reps: number[][] = [];
	for (const z of Z) {
		if (independent(z)) {
			span.push(z);
			reps.push(z);
		}
	}
	return reps;
}

/** Q[i][j] = ⟨ α_i ⌣ α_j , cycle ⟩ reduced mod p (entries in 0 … p−1). */
export function cupForm(D: Delta2, reps: Cochain[], cycle: Chain, p: number): number[][] {
	return reps.map((a) => reps.map((b) => mod(evaluate(cup11(D, a, b), cycle), p)));
}

/** Signed representative of x mod p, in (−p/2, p/2]. */
export function signedMod(x: number, p: number): number {
	const r = mod(x, p);
	return r > p / 2 ? r - p : r;
}

// ── cup products on simplicial complexes of any dimension ─────────────────

/**
 * (φ ⌣ ψ)([v0 … v_{p+q}]) = φ([v0 … v_p]) · ψ([v_p … v_{p+q}]) on a simplicial
 * complex from the engine (simplices are sorted, so the order is increasing labels).
 */
export function cupK(K: SimplicialComplex, p: number, phi: Cochain, q: number, psi: Cochain): Cochain {
	return (K.simplices[p + q] ?? []).map((s) => {
		const front = K.indexOf(s.slice(0, p + 1));
		const back = K.indexOf(s.slice(p));
		return (phi[front] ?? 0) * (psi[back] ?? 0) || 0;
	});
}
