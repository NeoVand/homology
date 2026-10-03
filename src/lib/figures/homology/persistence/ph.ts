// The persistence engine behind the figures of §3.7.
//
// Conventions (as in the text): coefficients ℤ/2; the RADIUS convention, so a
// Vietoris–Rips edge {p, q} appears at r = |p − q| / 2 (the moment the two
// balls of radius r touch), and a simplex appears at the largest r of its
// edges; Čech simplices appear at the radius of the smallest ball enclosing
// their points. Bars are half-open [birth, death).
//
// What is here:
//   • a generic column reduction for small filtrations (with a step-by-step
//     trace for the reduction stepper),
//   • exact Čech and Rips filtrations of small planar point sets,
//   • a fast Rips engine for the playground (H₀ by union–find with the elder
//     rule, H₁ by reducing the coboundary matrix with "clearing", as Ripser
//     does, plus representative cycles for the bars),
//   • sublevel-set persistence of a sampled function of one variable,
//   • the bottleneck distance between persistence diagrams,
//   • sample point clouds.
import { mulberry32 } from '$lib/math/persistence';

export type Pt = [number, number];

export const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

// ─── sparse ℤ/2 columns ───────────────────────────────────────────────────

/** Symmetric difference of two ascending integer arrays (= their sum mod 2). */
export function symdiff(a: ArrayLike<number>, b: ArrayLike<number>): number[] {
	const out: number[] = [];
	let i = 0;
	let j = 0;
	while (i < a.length && j < b.length) {
		const x = a[i];
		const y = b[j];
		if (x === y) {
			i++;
			j++;
		} else if (x < y) {
			out.push(x);
			i++;
		} else {
			out.push(y);
			j++;
		}
	}
	while (i < a.length) out.push(a[i++]);
	while (j < b.length) out.push(b[j++]);
	return out;
}

// ─── generic filtrations ─────────────────────────────────────────────────

export interface FSimplex {
	/** vertex ids, ascending */
	verts: number[];
	/** filtration value (the radius at which it appears) */
	value: number;
}

/** Sort compatibly: by value, then dimension (faces first), then lexicographically. */
export function sortFiltration<T extends FSimplex>(s: T[]): T[] {
	return s.slice().sort((a, b) => {
		if (a.value !== b.value) return a.value - b.value;
		if (a.verts.length !== b.verts.length) return a.verts.length - b.verts.length;
		for (let i = 0; i < a.verts.length; i++) if (a.verts[i] !== b.verts[i]) return a.verts[i] - b.verts[i];
		return 0;
	});
}

/** For each simplex, the ascending indices of its codimension-1 faces. */
export function boundaryColumns(simplices: FSimplex[]): number[][] {
	const index = new Map<string, number>();
	simplices.forEach((s, i) => index.set(s.verts.join(','), i));
	return simplices.map((s) => {
		if (s.verts.length === 1) return [];
		const col: number[] = [];
		for (let r = 0; r < s.verts.length; r++) {
			const key = s.verts.filter((_, q) => q !== r).join(',');
			const k = index.get(key);
			if (k === undefined) throw new Error(`face ${key} of ${s.verts.join(',')} is missing`);
			col.push(k);
		}
		return col.sort((x, y) => x - y);
	});
}

export interface Pair {
	dim: number;
	birth: number;
	death: number;
	/** index of the simplex that creates the class */
	birthIdx: number;
	/** index of the simplex that kills it, −1 if it never dies */
	deathIdx: number;
}

export interface Reduction {
	simplices: FSimplex[];
	/** reduced columns R = D·V (ascending row indices) */
	R: number[][];
	/** V: which original columns were summed to make each column of R */
	V: number[][];
	/** low[j]: row of the lowest 1 in column j of R, or −1 */
	low: number[];
	/** all pairs, including zero-length ones, and essential classes (death = ∞) */
	pairs: Pair[];
}

/** The standard algorithm (Edelsbrunner–Letscher–Zomorodian) over ℤ/2. */
export function reduce(simplices: FSimplex[]): Reduction {
	const D = boundaryColumns(simplices);
	const m = simplices.length;
	const R: number[][] = [];
	const V: number[][] = [];
	const low: number[] = new Array(m).fill(-1);
	const owner = new Map<number, number>(); // low row → column
	for (let j = 0; j < m; j++) {
		let col = D[j].slice();
		let v = [j];
		while (col.length && owner.has(col[col.length - 1])) {
			const k = owner.get(col[col.length - 1])!;
			col = symdiff(col, R[k]);
			v = symdiff(v, V[k]);
		}
		R.push(col);
		V.push(v);
		if (col.length) {
			low[j] = col[col.length - 1];
			owner.set(low[j], j);
		}
	}
	const pairs: Pair[] = [];
	const paired = new Set<number>();
	for (let j = 0; j < m; j++) {
		if (low[j] < 0) continue;
		const i = low[j];
		paired.add(i);
		paired.add(j);
		pairs.push({
			dim: simplices[i].verts.length - 1,
			birth: simplices[i].value,
			death: simplices[j].value,
			birthIdx: i,
			deathIdx: j
		});
	}
	for (let j = 0; j < m; j++) {
		if (paired.has(j)) continue;
		pairs.push({ dim: simplices[j].verts.length - 1, birth: simplices[j].value, death: Infinity, birthIdx: j, deathIdx: -1 });
	}
	pairs.sort((a, b) => a.dim - b.dim || a.birth - b.birth || b.death - a.death);
	return { simplices, R, V, low, pairs };
}

/** Pairs of positive length (the ones drawn as bars), optionally up to a dimension. */
export function barsOf(red: Reduction, maxDim = Infinity, eps = 1e-12): Pair[] {
	return red.pairs.filter((p) => p.dim <= maxDim && p.death - p.birth > eps);
}

/** Betti numbers b₀ … b_maxDim at radius r: the number of bars [b, d) with b ≤ r < d. */
export function bettiAt(bars: { dim: number; birth: number; death: number }[], r: number, maxDim = 2): number[] {
	const out = new Array(maxDim + 1).fill(0);
	for (const b of bars) if (b.dim <= maxDim && b.birth <= r + 1e-12 && r + 1e-12 < b.death) out[b.dim]++;
	return out;
}

// ─── step-by-step trace of the reduction (for the stepper figure) ─────────

export type TraceKind = 'vertex' | 'pivot' | 'clash' | 'zero';

export interface TraceStep {
	/** the column being worked on */
	j: number;
	kind: TraceKind;
	/** for 'clash': the earlier column with the same low that gets added */
	other?: number;
	/** the low row involved (for 'pivot' and 'clash') */
	row?: number;
	/** snapshot of all columns of R after this step */
	R: number[][];
	/** the V-column of j after this step (which original columns have been summed) */
	v: number[];
	/** pairs (birth index, death index) found so far */
	pairs: [number, number][];
}

/** Record every decision the standard algorithm makes, one step at a time. */
export function reductionTrace(simplices: FSimplex[]): TraceStep[] {
	const D = boundaryColumns(simplices);
	const m = simplices.length;
	const R = D.map((c) => c.slice());
	const V = D.map((_, j) => [j]);
	const owner = new Map<number, number>();
	const pairs: [number, number][] = [];
	const steps: TraceStep[] = [];
	const snap = (j: number, kind: TraceKind, extra: Partial<TraceStep> = {}) =>
		steps.push({ j, kind, R: R.map((c) => c.slice()), v: V[j].slice(), pairs: pairs.map((p) => [p[0], p[1]]), ...extra });
	for (let j = 0; j < m; j++) {
		if (!R[j].length && D[j].length === 0) {
			snap(j, 'vertex');
			continue;
		}
		for (;;) {
			const col = R[j];
			if (!col.length) {
				snap(j, 'zero');
				break;
			}
			const lw = col[col.length - 1];
			const k = owner.get(lw);
			if (k === undefined) {
				owner.set(lw, j);
				pairs.push([lw, j]);
				snap(j, 'pivot', { row: lw });
				break;
			}
			R[j] = symdiff(R[j], R[k]);
			V[j] = symdiff(V[j], V[k]);
			snap(j, 'clash', { other: k, row: lw });
		}
	}
	return steps;
}

// ─── geometry: smallest enclosing circle ─────────────────────────────────

function circumcircle(a: Pt, b: Pt, c: Pt): { x: number; y: number; r: number } | null {
	const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
	if (Math.abs(d) < 1e-14) return null;
	const a2 = a[0] * a[0] + a[1] * a[1];
	const b2 = b[0] * b[0] + b[1] * b[1];
	const c2 = c[0] * c[0] + c[1] * c[1];
	const x = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
	const y = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;
	return { x, y, r: Math.hypot(a[0] - x, a[1] - y) };
}

/**
 * Radius of the smallest disc containing all the points. A Čech simplex appears
 * exactly at this radius: discs of radius r around the points share a common
 * point iff some disc of radius r contains all the points (its centre is the
 * common point).
 */
export function minEnclosingRadius(pts: Pt[]): number {
	if (pts.length <= 1) return 0;
	const tol = 1e-9;
	const fits = (x: number, y: number, r: number) => pts.every((p) => Math.hypot(p[0] - x, p[1] - y) <= r + tol);
	let best = Infinity;
	for (let i = 0; i < pts.length; i++)
		for (let j = i + 1; j < pts.length; j++) {
			const x = (pts[i][0] + pts[j][0]) / 2;
			const y = (pts[i][1] + pts[j][1]) / 2;
			const r = dist(pts[i], pts[j]) / 2;
			if (r < best && fits(x, y, r)) best = r;
			for (let k = j + 1; k < pts.length; k++) {
				const c = circumcircle(pts[i], pts[j], pts[k]);
				if (c && c.r < best && fits(c.x, c.y, c.r)) best = c.r;
			}
		}
	return best;
}

function* subsets(n: number, k: number): Generator<number[]> {
	const s = Array.from({ length: k }, (_, i) => i);
	if (k > n) return;
	for (;;) {
		yield s.slice();
		let i = k - 1;
		while (i >= 0 && s[i] === n - k + i) i--;
		if (i < 0) return;
		s[i]++;
		for (let j = i + 1; j < k; j++) s[j] = s[j - 1] + 1;
	}
}

/** All simplices of the Čech filtration up to dimension maxDim (radius convention). */
export function cechFiltration(points: Pt[], maxDim = 2): FSimplex[] {
	const out: FSimplex[] = [];
	for (let k = 1; k <= maxDim + 1; k++)
		for (const s of subsets(points.length, k)) out.push({ verts: s, value: minEnclosingRadius(s.map((i) => points[i])) });
	return sortFiltration(out);
}

/** All simplices of the Vietoris–Rips filtration up to dimension maxDim (radius convention). */
export function ripsFiltration(points: Pt[], maxDim = 2): FSimplex[] {
	const out: FSimplex[] = [];
	for (let k = 1; k <= maxDim + 1; k++)
		for (const s of subsets(points.length, k)) {
			let v = 0;
			for (let a = 0; a < s.length; a++) for (let b = a + 1; b < s.length; b++) v = Math.max(v, dist(points[s[a]], points[s[b]]) / 2);
			out.push({ verts: s, value: v });
		}
	return sortFiltration(out);
}

/** The simplices of a filtration that are present at radius r. */
export function complexAt(f: FSimplex[], r: number): FSimplex[] {
	return f.filter((s) => s.value <= r + 1e-12);
}

// ─── the fast Rips engine (playground, stability demo) ────────────────────

export interface RipsBar {
	id: number;
	dim: 0 | 1;
	birth: number;
	/** Infinity for the class that never dies */
	death: number;
	/** H₀: [elder vertex of the component that dies]; H₁: the edge [u, v] that closes the loop */
	creator: number[];
	/** H₀: the merging edge [u, v]; H₁: the triangle [a, b, c] that fills the hole; null if it never dies */
	destroyer: number[] | null;
}

function lowerBound(a: Float64Array, x: number): number {
	// number of entries ≤ x
	let lo = 0;
	let hi = a.length;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		if (a[mid] <= x) lo = mid + 1;
		else hi = mid;
	}
	return lo;
}

/**
 * Persistent H₀ and H₁ of the Vietoris–Rips filtration of a planar point set,
 * built on the full 2-skeleton (every triangle eventually appears, so every
 * loop eventually dies). Radius convention throughout.
 */
export class RipsPH {
	readonly n: number;
	readonly points: Pt[];
	/** edges, in filtration order */
	readonly eU: Int32Array;
	readonly eV: Int32Array;
	readonly eR: Float64Array;
	/** triangles, in filtration order */
	readonly tA: Int32Array;
	readonly tB: Int32Array;
	readonly tC: Int32Array;
	readonly tR: Float64Array;
	/** positive-length bars: H₀ first (longest first), then H₁ (by birth) */
	readonly bars: RipsBar[];
	/** largest radius at which anything happens (half the diameter of the cloud) */
	readonly rmax: number;
	/** H₀ bar id → the vertices of the component that dies */
	readonly components = new Map<number, number[]>();
	/** the H₁ pairs (edge rank, triangle rank), including zero-length ones */
	readonly h1Pairs: [number, number][] = [];
	private D: Float64Array;
	private eRank: Int32Array;
	private triRank: Int32Array;
	private repCache: Map<number, [number, number][]> | null = null;

	constructor(points: Pt[]) {
		const n = (this.n = points.length);
		this.points = points.map((p) => [p[0], p[1]] as Pt);
		const D = (this.D = new Float64Array(n * n));
		for (let i = 0; i < n; i++)
			for (let j = i + 1; j < n; j++) D[i * n + j] = D[j * n + i] = dist(points[i], points[j]) / 2;

		// edges sorted by (r, u, v)
		const ne = (n * (n - 1)) / 2;
		const eOrder: number[] = [];
		const eu = new Int32Array(ne);
		const ev = new Int32Array(ne);
		{
			let k = 0;
			for (let i = 0; i < n; i++)
				for (let j = i + 1; j < n; j++) {
					eu[k] = i;
					ev[k] = j;
					eOrder.push(k++);
				}
		}
		eOrder.sort((a, b) => D[eu[a] * n + ev[a]] - D[eu[b] * n + ev[b]] || eu[a] - eu[b] || ev[a] - ev[b]);
		this.eU = new Int32Array(ne);
		this.eV = new Int32Array(ne);
		this.eR = new Float64Array(ne);
		this.eRank = new Int32Array(n * n).fill(-1);
		eOrder.forEach((k, rank) => {
			this.eU[rank] = eu[k];
			this.eV[rank] = ev[k];
			this.eR[rank] = D[eu[k] * n + ev[k]];
			this.eRank[eu[k] * n + ev[k]] = this.eRank[ev[k] * n + eu[k]] = rank;
		});
		this.rmax = ne ? this.eR[ne - 1] : 0;

		// triangles sorted by (r, a, b, c)
		const nt = n >= 3 ? (n * (n - 1) * (n - 2)) / 6 : 0;
		const ta = new Int32Array(nt);
		const tb = new Int32Array(nt);
		const tc = new Int32Array(nt);
		const tr = new Float64Array(nt);
		{
			let k = 0;
			for (let a = 0; a < n; a++)
				for (let b = a + 1; b < n; b++)
					for (let c = b + 1; c < n; c++) {
						ta[k] = a;
						tb[k] = b;
						tc[k] = c;
						tr[k] = Math.max(D[a * n + b], D[a * n + c], D[b * n + c]);
						k++;
					}
		}
		const tOrder = Array.from({ length: nt }, (_, i) => i);
		tOrder.sort((x, y) => tr[x] - tr[y] || ta[x] - ta[y] || tb[x] - tb[y] || tc[x] - tc[y]);
		this.tA = new Int32Array(nt);
		this.tB = new Int32Array(nt);
		this.tC = new Int32Array(nt);
		this.tR = new Float64Array(nt);
		this.triRank = new Int32Array(n * n * n).fill(-1);
		tOrder.forEach((k, rank) => {
			this.tA[rank] = ta[k];
			this.tB[rank] = tb[k];
			this.tC[rank] = tc[k];
			this.tR[rank] = tr[k];
			this.triRank[(ta[k] * n + tb[k]) * n + tc[k]] = rank;
		});

		const bars: RipsBar[] = [];
		let id = 0;

		// ── H₀: union–find with the elder rule (older = smaller vertex label) ──
		const parent = Int32Array.from({ length: n }, (_, i) => i);
		const find = (x: number): number => {
			while (parent[x] !== x) {
				parent[x] = parent[parent[x]];
				x = parent[x];
			}
			return x;
		};
		const elder = Int32Array.from({ length: n }, (_, i) => i);
		const members: number[][] = Array.from({ length: n }, (_, i) => [i]);
		const negativeEdge = new Uint8Array(ne);
		for (let k = 0; k < ne; k++) {
			const ru = find(this.eU[k]);
			const rv = find(this.eV[k]);
			if (ru === rv) continue;
			negativeEdge[k] = 1;
			// the component whose elder is younger (larger label) dies
			const [die, live] = elder[ru] > elder[rv] ? [ru, rv] : [rv, ru];
			if (this.eR[k] > 0) {
				bars.push({ id, dim: 0, birth: 0, death: this.eR[k], creator: [elder[die]], destroyer: [this.eU[k], this.eV[k]] });
				this.components.set(id, members[die].slice());
				id++;
			}
			parent[die] = live;
			members[live] = members[live].concat(members[die]);
			members[die] = [];
		}
		if (n > 0) {
			bars.push({ id, dim: 0, birth: 0, death: Infinity, creator: [0], destroyer: null });
			this.components.set(id, Array.from({ length: n }, (_, i) => i));
			id++;
		}

		// ── H₁: reduce the coboundary matrix (columns = edges in reverse order,
		// rows = triangles; pivot = earliest coface), skipping the edges that
		// already died in H₀ ("clearing"). Same pairs as the boundary matrix. ──
		const pivotOwner = new Map<number, number>();
		const reduced = new Map<number, number[]>();
		const h1: RipsBar[] = [];
		for (let k = ne - 1; k >= 0; k--) {
			if (negativeEdge[k]) continue;
			const u = this.eU[k];
			const v = this.eV[k];
			let col: number[] = [];
			for (let w = 0; w < n; w++) {
				if (w === u || w === v) continue;
				const [a, b, c] = sort3(u, v, w);
				col.push(this.triRank[(a * n + b) * n + c]);
			}
			col.sort((x, y) => x - y);
			while (col.length && pivotOwner.has(col[0])) col = symdiff(col, reduced.get(pivotOwner.get(col[0])!)!);
			if (!col.length) {
				// never dies (cannot happen with the full 2-skeleton, but be safe)
				h1.push({ id: -1, dim: 1, birth: this.eR[k], death: Infinity, creator: [u, v], destroyer: null });
				continue;
			}
			const t = col[0];
			pivotOwner.set(t, k);
			reduced.set(k, col);
			this.h1Pairs.push([k, t]);
			if (this.tR[t] > this.eR[k])
				h1.push({ id: -1, dim: 1, birth: this.eR[k], death: this.tR[t], creator: [u, v], destroyer: [this.tA[t], this.tB[t], this.tC[t]] });
		}
		h1.sort((a, b) => a.birth - b.birth || b.death - a.death);
		const h0 = bars.sort((a, b) => b.death - a.death);
		this.bars = [...h0, ...h1].map((b, i) => ({ ...b, id: i }));
		// re-key the component map to the new ids
		const comp = new Map<number, number[]>();
		h0.forEach((b, i) => {
			const m = this.components.get(b.id);
			if (m) comp.set(i, m);
		});
		this.components.clear();
		comp.forEach((m, k) => this.components.set(k, m));
	}

	/** radius of the edge {u, v} (half the distance) */
	edgeRadius(u: number, v: number) {
		return this.D[u * this.n + v];
	}

	/** how many edges / triangles are present at radius r (they are a prefix of the order) */
	edgesAt(r: number) {
		return lowerBound(this.eR, r + 1e-12);
	}
	trianglesAt(r: number) {
		return lowerBound(this.tR, r + 1e-12);
	}

	/** b₀ and b₁ at radius r, read off the barcode */
	betti(r: number): [number, number] {
		let b0 = 0;
		let b1 = 0;
		for (const b of this.bars)
			if (b.birth <= r + 1e-12 && r + 1e-12 < b.death) {
				if (b.dim === 0) b0++;
				else b1++;
			}
		return [b0, b1];
	}

	/**
	 * A representative cycle for an H₁ bar: the reduced boundary column of the
	 * triangle that kills it (a cycle present at the birth radius whose class dies
	 * exactly at the death radius), then tightened by adding boundaries of
	 * triangles that already exist at the birth radius (which does not change its
	 * class). Always contains the creating edge.
	 */
	cycle(bar: RipsBar): [number, number][] {
		if (bar.dim !== 1) return [];
		if (!this.repCache) this.repCache = this.computeReps();
		const k = this.eRank[bar.creator[0] * this.n + bar.creator[1]];
		return this.repCache.get(k) ?? [[bar.creator[0], bar.creator[1]]];
	}

	private computeReps(): Map<number, [number, number][]> {
		const n = this.n;
		const out = new Map<number, [number, number][]>();
		const pairOf = new Map<number, number>(); // triangle rank → edge rank
		for (const [e, t] of this.h1Pairs) pairOf.set(t, e);
		const negTris = [...pairOf.keys()].sort((a, b) => a - b);
		const owner = new Map<number, number>();
		const R = new Map<number, number[]>();
		// only the bars of positive length need a representative
		const wanted = new Set<number>();
		for (const [e, t] of this.h1Pairs) if (this.tR[t] > this.eR[e]) wanted.add(t);
		let lastWanted = -1;
		for (const t of wanted) lastWanted = Math.max(lastWanted, t);
		for (const t of negTris) {
			if (t > lastWanted) break;
			const a = this.tA[t];
			const b = this.tB[t];
			const c = this.tC[t];
			let col = [this.eRank[a * n + b], this.eRank[a * n + c], this.eRank[b * n + c]].sort((x, y) => x - y);
			while (col.length && owner.has(col[col.length - 1])) col = symdiff(col, R.get(owner.get(col[col.length - 1])!)!);
			if (!col.length) continue; // (cannot happen for a negative triangle)
			owner.set(col[col.length - 1], t);
			R.set(t, col);
			if (wanted.has(t)) {
				const e = pairOf.get(t)!;
				out.set(e, this.tighten(col, e));
			}
		}
		return out;
	}

	/** Shorten a cycle without changing its class at the birth radius of edge e. */
	private tighten(edgeRanks: number[], e: number): [number, number][] {
		const n = this.n;
		const r0 = this.eR[e];
		const key = (u: number, v: number) => (u < v ? u * n + v : v * n + u);
		const keep = key(this.eU[e], this.eV[e]);
		const z = new Set<number>(edgeRanks.map((k) => key(this.eU[k], this.eV[k])));
		const present = (u: number, v: number) => this.D[u * n + v] <= r0 + 1e-12;
		let changed = true;
		let guard = 0;
		while (changed && guard++ < 10000) {
			changed = false;
			for (const k of [...z]) {
				if (!z.has(k)) continue;
				const u = Math.floor(k / n);
				const v = k % n;
				for (let w = 0; w < n && z.has(k); w++) {
					if (w === u || w === v || !present(u, w) || !present(v, w)) continue;
					const kuw = key(u, w);
					const kvw = key(v, w);
					const inUW = z.has(kuw);
					const inVW = z.has(kvw);
					if (inUW && inVW) {
						if (k === keep || kuw === keep || kvw === keep) continue;
						z.delete(k);
						z.delete(kuw);
						z.delete(kvw);
						changed = true;
					} else if (inUW || inVW) {
						const kin = inUW ? kuw : kvw;
						const kout = inUW ? kvw : kuw;
						if (k === keep || kin === keep) continue;
						z.delete(k);
						z.delete(kin);
						z.add(kout);
						changed = true;
					}
				}
			}
		}
		return [...z].map((k) => [Math.floor(k / n), k % n] as [number, number]);
	}
}

function sort3(a: number, b: number, c: number): [number, number, number] {
	if (a > b) [a, b] = [b, a];
	if (b > c) [b, c] = [c, b];
	if (a > b) [a, b] = [b, a];
	return [a, b, c];
}

// ─── sublevel sets of a function of one variable ─────────────────────────

export interface LevelBar {
	birth: number;
	death: number;
	/** sample index of the minimum where the component is born */
	minIdx: number;
	/** sample index of the peak where it merges into an older component (−1: never) */
	maxIdx: number;
}

/**
 * Persistence of the sublevel sets {x : f(x) ≤ t} of a sampled function: a
 * component is born at each local minimum; when two meet at a peak, the one
 * with the higher minimum (the younger) dies — the elder rule.
 */
export function sublevelBars(f: number[]): LevelBar[] {
	const N = f.length;
	const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => f[a] - f[b] || a - b);
	const parent = new Int32Array(N).fill(-1);
	const born = new Int32Array(N); // root → index of its minimum
	const find = (x: number): number => {
		while (parent[x] !== x) {
			parent[x] = parent[parent[x]];
			x = parent[x];
		}
		return x;
	};
	const bars: LevelBar[] = [];
	for (const i of order) {
		parent[i] = i;
		born[i] = i;
		for (const j of [i - 1, i + 1]) {
			if (j < 0 || j >= N || parent[j] === -1) continue;
			const ri = find(i);
			const rj = find(j);
			if (ri === rj) continue;
			const mi = born[ri];
			const mj = born[rj];
			const iOlder = f[mi] < f[mj] || (f[mi] === f[mj] && mi < mj);
			const [die, live] = iOlder ? [rj, ri] : [ri, rj];
			if (f[i] > f[born[die]]) bars.push({ birth: f[born[die]], death: f[i], minIdx: born[die], maxIdx: i });
			parent[die] = live;
		}
	}
	const root = find(order[0]);
	bars.push({ birth: f[born[root]], death: Infinity, minIdx: born[root], maxIdx: -1 });
	return bars.sort((a, b) => a.birth - b.birth);
}

// ─── bottleneck distance ─────────────────────────────────────────────────

export type DgmPt = [number, number];

/** L∞ distance between diagram points, and from a point to the diagonal. */
export const linf = (p: DgmPt, q: DgmPt) => Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]));
export const toDiagonal = (p: DgmPt) => (p[1] - p[0]) / 2;

export interface Bottleneck {
	distance: number;
	/** matched pairs [i, j]: i indexes A, j indexes B; −1 means "the diagonal" */
	matching: [number, number][];
}

/**
 * Bottleneck distance between two finite persistence diagrams: the smallest δ
 * such that the points can be matched one-to-one, each moving at most δ in the
 * max-norm, where any point may instead be matched to the diagonal (it is
 * "a bar of length ≤ 2δ that may vanish").
 */
export function bottleneck(A: DgmPt[], B: DgmPt[]): Bottleneck {
	const m = A.length;
	const n = B.length;
	if (m + n === 0) return { distance: 0, matching: [] };
	const cand = new Set<number>([0]);
	for (const a of A) cand.add(toDiagonal(a));
	for (const b of B) cand.add(toDiagonal(b));
	for (const a of A) for (const b of B) cand.add(linf(a, b));
	const vals = [...cand].sort((x, y) => x - y);
	// left vertices: A[0..m), diagonal slots for B [m..m+n); right: B[0..n), slots for A [n..n+m)
	const tryEps = (eps: number): number[] | null => {
		const L = m + n;
		const adj: number[][] = Array.from({ length: L }, () => []);
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) if (linf(A[i], B[j]) <= eps + 1e-12) adj[i].push(j);
			if (toDiagonal(A[i]) <= eps + 1e-12) adj[i].push(n + i);
		}
		for (let j = 0; j < n; j++) {
			if (toDiagonal(B[j]) <= eps + 1e-12) adj[m + j].push(j);
			for (let i = 0; i < m; i++) adj[m + j].push(n + i);
		}
		const matchR = new Int32Array(n + m).fill(-1);
		const seen = new Uint8Array(n + m);
		const augment = (u: number): boolean => {
			for (const v of adj[u]) {
				if (seen[v]) continue;
				seen[v] = 1;
				if (matchR[v] === -1 || augment(matchR[v])) {
					matchR[v] = u;
					return true;
				}
			}
			return false;
		};
		for (let u = 0; u < L; u++) {
			seen.fill(0);
			if (!augment(u)) return null;
		}
		return Array.from(matchR);
	};
	let lo = 0;
	let hi = vals.length - 1;
	let best = tryEps(vals[hi])!;
	while (lo < hi) {
		const mid = (lo + hi) >> 1;
		const r = tryEps(vals[mid]);
		if (r) {
			hi = mid;
			best = r;
		} else lo = mid + 1;
	}
	const final = tryEps(vals[lo]) ?? best;
	const matching: [number, number][] = [];
	for (let v = 0; v < n + m; v++) {
		const u = final[v];
		if (v < n) {
			// B[v] matched with A[u] or with a diagonal slot
			matching.push([u < m ? u : -1, v]);
		} else if (u < m) {
			// A[u] matched to its diagonal slot
			matching.push([u, -1]);
		}
	}
	return { distance: vals[lo], matching };
}

// ─── point clouds ────────────────────────────────────────────────────────

function gauss(rand: () => number) {
	const u = Math.max(1e-12, rand());
	const v = rand();
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export type Preset = 'circle' | 'two' | 'eight' | 'blob' | 'random';

/** Sample clouds sized for a world box of about [−2.4, 2.4] × [−1.5, 1.5]. */
export function presetCloud(kind: Preset, seed = 1): Pt[] {
	const rand = mulberry32(seed * 7919 + 17);
	const ring = (n: number, R: number, noise: number, cx: number, cy: number, phase = 0): Pt[] =>
		Array.from({ length: n }, (_, i) => {
			const t = phase + (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.3;
			const rr = R + gauss(rand) * noise;
			return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)];
		});
	switch (kind) {
		case 'circle':
			return ring(26, 1.15, 0.07, 0, 0);
		case 'two':
			return [...ring(22, 0.95, 0.06, -1.2, 0.05), ...ring(14, 0.55, 0.04, 1.35, -0.1)];
		case 'eight': {
			const n = 36;
			return Array.from({ length: n }, (_, i) => {
				const t = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.12;
				return [Math.sin(t) * 1.9 + gauss(rand) * 0.05, Math.sin(t) * Math.cos(t) * 2.2 + gauss(rand) * 0.05];
			});
		}
		case 'blob':
			return Array.from({ length: 30 }, () => [gauss(rand) * 0.62, gauss(rand) * 0.5] as Pt);
		case 'random':
		default:
			return Array.from({ length: 34 }, () => [(rand() * 2 - 1) * 2.1, (rand() * 2 - 1) * 1.25] as Pt);
	}
}

/** Move every point by at most delta, in a fixed random direction (seeded). */
export function jiggle(points: Pt[], delta: number, seed = 1): Pt[] {
	const rand = mulberry32(seed * 104729 + 3);
	return points.map((p) => {
		const th = rand() * Math.PI * 2;
		const m = Math.sqrt(rand()) * delta;
		return [p[0] + m * Math.cos(th), p[1] + m * Math.sin(th)];
	});
}

/** The cloud of Figure 2: a noisy, slightly uneven circle of 17 points plus one straggler. */
export function ringWithStraggler(): Pt[] {
	const rand = mulberry32(2024);
	const n = 17;
	const out: Pt[] = [];
	for (let i = 0; i < n; i++) {
		const t = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.32;
		const rr = 1 + (rand() - 0.5) * 0.22;
		out.push([rr * Math.cos(t), rr * Math.sin(t)]);
	}
	out.push([1.72, 0.92]);
	return out;
}
