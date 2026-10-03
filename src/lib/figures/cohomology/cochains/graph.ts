// Small, exact helpers for the figures of §4.1: oriented graphs (optionally
// with filled triangles), the discrete gradient δf, loop sums, the "curl" test
// on a filled triangle, integration along a spanning tree, and the Hodge
// decomposition (delegated to the tested engine in $lib/math).
//
// Unlike $lib/math/complex (whose edges always point from the smaller to the
// larger vertex id), every edge here carries its own display orientation
// [tail, head], so figures can draw a loop with all its arrows going the same
// way. Values are converted with a sign when we hand things to the engine.
import { SimplicialComplex } from '$lib/math/complex';
import { hodgeDecompose } from '$lib/math/hodge';
import { homology } from '$lib/math/homology';

export type Pt = [number, number];

export interface OGraph {
	/** number of vertices (ids 0 … n−1) */
	n: number;
	/** oriented edges [tail, head] */
	edges: [number, number][];
	/** filled triangles, each listed in the cyclic order used for its circulation */
	tris?: [number, number, number][];
}

/** The discrete gradient: (δf)(tail → head) = f(head) − f(tail). */
export function gradient(g: OGraph, f: number[]): number[] {
	return g.edges.map(([t, h]) => f[h] - f[t]);
}

/** The edge joining a and b, with sign +1 if it is stored as a → b and −1 if stored as b → a. */
export function findEdge(g: OGraph, a: number, b: number): { e: number; s: 1 | -1 } | null {
	for (let e = 0; e < g.edges.length; e++) {
		const [t, h] = g.edges[e];
		if (t === a && h === b) return { e, s: 1 };
		if (t === b && h === a) return { e, s: -1 };
	}
	return null;
}

/**
 * Sum of an edge labelling ψ along a walk v0 → v1 → … → vk: edges walked
 * forwards count +ψ, edges walked backwards count −ψ. (Closed walk: vk = v0.)
 */
export function pathSum(g: OGraph, psi: number[], walk: number[]): number {
	let s = 0;
	for (let i = 0; i + 1 < walk.length; i++) {
		const hit = findEdge(g, walk[i], walk[i + 1]);
		if (!hit) throw new Error(`no edge ${walk[i]}–${walk[i + 1]}`);
		s += hit.s * psi[hit.e];
	}
	return s;
}

/** The circulation ("curl") of ψ around a triangle, in the triangle's listed cyclic order. */
export function curl(g: OGraph, psi: number[], tri: [number, number, number]): number {
	const [a, b, c] = tri;
	return pathSum(g, psi, [a, b, c, a]);
}

/** Connected components: comp[v] is a component id 0 … count−1. */
export function components(g: OGraph): { comp: number[]; count: number } {
	const comp = new Array<number>(g.n).fill(-1);
	const adj = adjacency(g);
	let count = 0;
	for (let s = 0; s < g.n; s++) {
		if (comp[s] !== -1) continue;
		const stack = [s];
		comp[s] = count;
		while (stack.length) {
			const v = stack.pop()!;
			for (const { w } of adj[v]) if (comp[w] === -1) (comp[w] = count), stack.push(w);
		}
		count++;
	}
	return { comp, count };
}

export function adjacency(g: OGraph): { w: number; e: number }[][] {
	const adj: { w: number; e: number }[][] = Array.from({ length: g.n }, () => []);
	g.edges.forEach(([t, h], e) => {
		adj[t].push({ w: h, e });
		adj[h].push({ w: t, e });
	});
	return adj;
}

export interface Integration {
	/** the integrated heights (root of each component gets `rootValue`) */
	f: number[];
	/** BFS order: each vertex with the tree edge it was reached by (null for roots) */
	order: { v: number; via: number | null; from: number | null }[];
	/** indices of spanning-forest edges */
	tree: Set<number>;
	parent: number[];
	/**
	 * For every edge NOT in the tree: its "defect" ψ(e) − (f(head) − f(tail)),
	 * which equals the sum of ψ around the fundamental loop of e
	 * (walk e forwards, then come back through the tree). Zero means consistent.
	 */
	defects: { e: number; value: number; loop: number[] }[];
}

/**
 * Integrate an edge labelling from a root, Hatcher-style: walk a breadth-first
 * spanning tree, setting f(head) = f(tail) + ψ(edge), then test every leftover edge.
 * ψ is a gradient exactly when every defect is zero.
 */
export function integrate(g: OGraph, psi: number[], roots: number[] = [0], rootValue = 0): Integration {
	const adj = adjacency(g);
	const f = new Array<number>(g.n).fill(NaN);
	const parent = new Array<number>(g.n).fill(-1);
	const order: Integration['order'] = [];
	const tree = new Set<number>();
	const seen = new Array<boolean>(g.n).fill(false);
	const starts = [...roots, ...Array.from({ length: g.n }, (_, i) => i)];
	for (const r of starts) {
		if (seen[r]) continue;
		seen[r] = true;
		f[r] = rootValue;
		order.push({ v: r, via: null, from: null });
		const queue = [r];
		while (queue.length) {
			const v = queue.shift()!;
			for (const { w, e } of adj[v]) {
				if (seen[w]) continue;
				seen[w] = true;
				parent[w] = v;
				tree.add(e);
				const [t] = g.edges[e];
				f[w] = t === v ? f[v] + psi[e] : f[v] - psi[e];
				order.push({ v: w, via: e, from: v });
				queue.push(w);
			}
		}
	}
	const defects: Integration['defects'] = [];
	g.edges.forEach(([t, h], e) => {
		if (tree.has(e)) return;
		const value = psi[e] - (f[h] - f[t]);
		defects.push({ e, value, loop: [t, ...treePath(parent, h, t)] });
	});
	return { f, order, tree, parent, defects };
}

/** The path from a to b inside a spanning forest given by parent pointers. */
export function treePath(parent: number[], a: number, b: number): number[] {
	const up = (v: number) => {
		const out = [v];
		while (parent[v] !== -1) {
			v = parent[v];
			out.push(v);
		}
		return out;
	};
	const pa = up(a);
	const pb = up(b);
	const inB = new Map(pb.map((v, i) => [v, i]));
	let i = 0;
	while (i < pa.length && !inB.has(pa[i])) i++;
	if (i === pa.length) throw new Error('vertices in different components');
	const meet = pa[i];
	const j = inB.get(meet)!;
	return [...pa.slice(0, i + 1), ...pb.slice(0, j).reverse()];
}

/** b₁ of a graph (ignoring triangles): E − V + (number of components). */
export function cycleRank(g: OGraph): number {
	return g.edges.length - g.n + components(g).count;
}

/** The same complex in the engine's convention, plus how each of our edges maps to it. */
export function toComplex(g: OGraph): { K: SimplicialComplex; map: { index: number; sign: 1 | -1 }[] } {
	const gens: number[][] = [];
	for (let v = 0; v < g.n; v++) gens.push([v]);
	for (const e of g.edges) gens.push([...e]);
	for (const t of g.tris ?? []) gens.push([...t]);
	const K = new SimplicialComplex(gens);
	const map = g.edges.map(([t, h]) => ({ index: K.indexOf([t, h]), sign: (t < h ? 1 : -1) as 1 | -1 }));
	return { K, map };
}

/** Betti numbers over ℚ (= dimensions of real cohomology) of the graph with its filled triangles. */
export function bettis(g: OGraph): number[] {
	const { K } = toComplex(g);
	return homology(K, 'Q').map((x) => x.rank);
}

export interface HodgeSplit {
	gradient: number[];
	curl: number[];
	harmonic: number[];
	/** potential with minimum 0 (so it reads like a height or a ranking score) */
	potential: number[];
}

/** Hodge decomposition ψ = δf + (curl part) + (harmonic part), in our edge orientations. */
export function hodge(g: OGraph, psi: number[]): HodgeSplit {
	const { K, map } = toComplex(g);
	const fE = new Array<number>(K.count(1)).fill(0);
	map.forEach(({ index, sign }, e) => (fE[index] = sign * psi[e]));
	const P = hodgeDecompose(K, fE);
	// the engine solves by conjugate gradients; for integer input the exact answers are
	// rationals with small denominators, so snap to them
	const back = (v: number[]) => map.map(({ index, sign }) => snap(sign * v[index]));
	const lo = Math.min(...P.potential);
	const gradient = back(P.gradient);
	const curl = back(P.curl);
	// recompute the harmonic part from the snapped pieces so that the three add up exactly
	const harmonic = psi.map((x, e) => snap(x - gradient[e] - curl[e]));
	return { gradient, curl, harmonic, potential: P.potential.map((x) => snap(x - lo)) };
}

/** Round away floating-point dust (values here are rationals with small denominators). */
export function clean(x: number): number {
	const r = Math.round(x * 1e9) / 1e9;
	return Object.is(r, -0) ? 0 : r;
}

/** Snap a numerically computed value to the nearest fraction p/q with q ≤ 96, if one is within 1e-5. */
export function snap(x: number): number {
	for (let q = 1; q <= 96; q++) {
		const p = Math.round(x * q);
		if (Math.abs(x * q - p) < 1e-5 * q) return p === 0 ? 0 : p / q;
	}
	return x;
}

export const norm2 = (v: number[]) => v.reduce((a, x) => a + x * x, 0);

// ── fractions ──────────────────────────────────────────────────────────────

/** Best fraction p/q (q ≤ maxDen) for x, or null if none is within 1e-7. */
export function frac(x: number, maxDen = 64): { p: number; q: number } | null {
	for (let q = 1; q <= maxDen; q++) {
		const p = Math.round(x * q);
		if (Math.abs(p / q - x) < 1e-7) return { p, q };
	}
	return null;
}

/** A value as TeX: integers stay integers, small fractions become \tfrac{p}{q}, otherwise 2 decimals. */
export function fracTeX(x: number, plus = false): string {
	const fr = frac(x);
	const sign = x < -1e-12 ? '-' : plus && x > 1e-12 ? '+' : '';
	if (!fr) return sign + Math.abs(x).toFixed(2);
	const p = Math.abs(fr.p);
	if (fr.q === 1) return (p === 0 ? '' : sign) + String(p);
	return `${sign}\\tfrac{${p}}{${fr.q}}`;
}

/** A value as plain text with a true minus sign: 3, −2, 1/3, −1/6. */
export function fracText(x: number, plus = false): string {
	const fr = frac(x);
	const sign = x < -1e-12 ? '−' : plus && x > 1e-12 ? '+' : '';
	if (!fr) return sign + Math.abs(x).toFixed(2);
	const p = Math.abs(fr.p);
	if (fr.q === 1) return (p === 0 ? '' : sign) + String(p);
	return `${sign}${p}/${fr.q}`;
}

/** Integer with a true minus sign (and an optional explicit plus). */
export function signed(x: number, plus = true): string {
	if (x === 0) return '0';
	return x < 0 ? `−${Math.abs(x)}` : plus ? `+${x}` : String(x);
}
