// Graphs and small planar complexes for §3.1, plus the (mod 2) algorithms the
// figures use: vertex parity, symmetric difference, components, spanning
// forests, fundamental cycles, and "which triangles does this cycle enclose?".
//
// Everything here works with *edge indices into the `edges` array of the
// figure's own data*; `toEngine` translates to the math engine's indexing
// (SimplicialComplex sorts its simplices) so that tests can cross-check every
// answer against `$lib/math`.
import { SimplicialComplex } from '$lib/math/complex';

export type Pt = [number, number];
export type Edge = [number, number];
export type Tri = [number, number, number];

export interface PlaneGraph {
	/** vertex positions in SVG units, indexed by vertex id 0…n−1 */
	pos: Pt[];
	/** display names of the vertices (TeX) */
	names: string[];
	edges: Edge[];
	/** bounded faces, each as a list of edge indices (for the "add a face cycle" chips) */
	faces: { edges: number[]; label: Pt; name: string }[];
}

// ── The graph of Figures 3.1.1–3.1.2: a bow-tie with an arch ─────────────────
//
//              h
//           /     \
//         b ─────── e
//       / |  \   /  | \
//      a  |    d    |  g
//       \ |  /   \  | /
//         c         f
//
export const bowtie: PlaneGraph = {
	pos: [
		[70, 205], // a 0
		[178, 112], // b 1
		[178, 298], // c 2
		[286, 205], // d 3
		[394, 112], // e 4
		[394, 298], // f 5
		[502, 205], // g 6
		[286, 42] // h 7
	],
	names: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'],
	edges: [
		[0, 1], // 0  ab
		[0, 2], // 1  ac
		[1, 2], // 2  bc
		[1, 3], // 3  bd
		[2, 3], // 4  cd
		[3, 4], // 5  de
		[3, 5], // 6  df
		[4, 5], // 7  ef
		[4, 6], // 8  eg
		[5, 6], // 9  fg
		[1, 7], // 10 bh
		[4, 7] // 11 eh
	],
	faces: [
		{ edges: [0, 1, 2], label: [142, 205], name: 'f_1' },
		{ edges: [2, 3, 4], label: [214, 205], name: 'f_2' },
		{ edges: [5, 6, 7], label: [358, 205], name: 'f_3' },
		{ edges: [7, 8, 9], label: [430, 205], name: 'f_4' },
		{ edges: [3, 5, 10, 11], label: [286, 112], name: 'f_5' }
	]
};

// ── The complex of Figure 3.1.3: a triangulated disk whose triangles can be
//    filled or emptied ───────────────────────────────────────────────────────
export interface PlaneComplex {
	pos: Pt[];
	edges: Edge[];
	tris: Tri[];
}

export const patch: PlaneComplex = {
	pos: [
		[300, 34], // 0
		[163, 80], // 1
		[442, 74], // 2
		[64, 198], // 3
		[226, 178], // 4
		[380, 170], // 5
		[536, 190], // 6
		[150, 316], // 7
		[306, 298], // 8
		[464, 318] // 9
	],
	tris: [
		[0, 1, 4], // t0
		[0, 4, 5], // t1
		[0, 2, 5], // t2
		[1, 3, 4], // t3
		[2, 5, 6], // t4
		[3, 4, 7], // t5
		[4, 7, 8], // t6
		[4, 5, 8], // t7
		[5, 8, 9], // t8
		[5, 6, 9] // t9
	],
	edges: []
};
patch.edges = edgesOfTriangles(patch.tris);

/** The distinct edges of a list of triangles, sorted lexicographically. */
export function edgesOfTriangles(tris: Tri[]): Edge[] {
	const seen = new Map<string, Edge>();
	for (const t of tris) {
		const [a, b, c] = [...t].sort((x, y) => x - y);
		for (const e of [
			[a, b],
			[a, c],
			[b, c]
		] as Edge[])
			seen.set(e.join(','), e);
	}
	return [...seen.values()].sort((p, q) => p[0] - q[0] || p[1] - q[1]);
}

export function edgeIndex(edges: Edge[], a: number, b: number): number {
	const [x, y] = a < b ? [a, b] : [b, a];
	return edges.findIndex(([p, q]) => p === x && q === y);
}

/** Edge indices of the three sides of each triangle. */
export function triangleEdges(edges: Edge[], tris: Tri[]): number[][] {
	return tris.map(([a, b, c]) => [edgeIndex(edges, a, b), edgeIndex(edges, a, c), edgeIndex(edges, b, c)]);
}

// ── parity and sums ─────────────────────────────────────────────────────────

/** Degree of every vertex inside a set of edges. */
export function degrees(n: number, edges: Edge[], sel: Iterable<number>): number[] {
	const d = new Array<number>(n).fill(0);
	for (const i of sel) {
		d[edges[i][0]]++;
		d[edges[i][1]]++;
	}
	return d;
}

/** Vertices touched an odd number of times: the "loose ends" of an edge set. */
export function oddVertices(n: number, edges: Edge[], sel: Iterable<number>): number[] {
	return degrees(n, edges, sel)
		.map((d, v) => (d % 2 === 1 ? v : -1))
		.filter((v) => v >= 0);
}

/** A (mod 2) 1-cycle: every vertex has even degree. The empty set counts. */
export function isEvenSet(n: number, edges: Edge[], sel: Iterable<number>): boolean {
	return oddVertices(n, edges, sel).length === 0;
}

/** Symmetric difference of two sets of indices (addition mod 2). */
export function symDiff(a: Iterable<number>, b: Iterable<number>): Set<number> {
	const out = new Set(a);
	for (const x of b) {
		if (out.has(x)) out.delete(x);
		else out.add(x);
	}
	return out;
}

// ── components, spanning forests, fundamental cycles ────────────────────────

class UnionFind {
	p: number[];
	constructor(n: number) {
		this.p = Array.from({ length: n }, (_, i) => i);
	}
	find(x: number): number {
		while (this.p[x] !== x) {
			this.p[x] = this.p[this.p[x]];
			x = this.p[x];
		}
		return x;
	}
	union(a: number, b: number): boolean {
		const ra = this.find(a);
		const rb = this.find(b);
		if (ra === rb) return false;
		this.p[ra] = rb;
		return true;
	}
}

/** Number of connected components of the graph on vertices 0…n−1 using only `alive` edges. */
export function componentCount(n: number, edges: Edge[], alive: (i: number) => boolean = () => true): number {
	const uf = new UnionFind(n);
	let c = n;
	edges.forEach(([a, b], i) => {
		if (alive(i) && uf.union(a, b)) c--;
	});
	return c;
}

/**
 * A spanning forest (a spanning tree of every component), found by trying the
 * alive edges in the given order and keeping an edge whenever it joins two
 * different pieces (Kruskal). Returns a boolean per edge.
 */
export function spanningForest(n: number, edges: Edge[], alive: (i: number) => boolean = () => true, order?: number[]): boolean[] {
	const uf = new UnionFind(n);
	const tree = new Array<boolean>(edges.length).fill(false);
	for (const i of order ?? edges.map((_, k) => k)) {
		if (!alive(i)) continue;
		if (uf.union(edges[i][0], edges[i][1])) tree[i] = true;
	}
	return tree;
}

/** Breadth-first edge order from vertex `root` (gives tidy, "bushy" trees). */
export function bfsOrder(n: number, edges: Edge[], root = 0): number[] {
	const adj: number[][] = Array.from({ length: n }, () => []);
	edges.forEach(([a, b], i) => {
		adj[a].push(i);
		adj[b].push(i);
	});
	const order: number[] = [];
	const seenV = new Set<number>();
	const seenE = new Set<number>();
	const roots = [root, ...Array.from({ length: n }, (_, v) => v).filter((v) => v !== root)];
	for (const r of roots) {
		if (seenV.has(r)) continue;
		seenV.add(r);
		const queue = [r];
		while (queue.length) {
			const v = queue.shift()!;
			for (const i of adj[v]) {
				if (seenE.has(i)) continue;
				seenE.add(i);
				order.push(i);
				const w = edges[i][0] === v ? edges[i][1] : edges[i][0];
				if (!seenV.has(w)) {
					seenV.add(w);
					queue.push(w);
				}
			}
		}
	}
	return order;
}

/** The unique path between two vertices inside a forest, as edge indices (null if none). */
export function treePath(n: number, edges: Edge[], tree: boolean[], from: number, to: number): number[] | null {
	const adj: number[][] = Array.from({ length: n }, () => []);
	edges.forEach(([a, b], i) => {
		if (!tree[i]) return;
		adj[a].push(i);
		adj[b].push(i);
	});
	const via = new Map<number, number>(); // vertex → edge used to reach it
	const seen = new Set([from]);
	const queue = [from];
	while (queue.length) {
		const v = queue.shift()!;
		if (v === to) break;
		for (const i of adj[v]) {
			const w = edges[i][0] === v ? edges[i][1] : edges[i][0];
			if (seen.has(w)) continue;
			seen.add(w);
			via.set(w, i);
			queue.push(w);
		}
	}
	if (!seen.has(to)) return null;
	const path: number[] = [];
	let v = to;
	while (v !== from) {
		const i = via.get(v)!;
		path.push(i);
		v = edges[i][0] === v ? edges[i][1] : edges[i][0];
	}
	return path.reverse();
}

/** The fundamental cycle of a non-tree edge: the edge plus the tree path joining its ends. */
export function fundamentalCycle(n: number, edges: Edge[], tree: boolean[], e: number): number[] {
	const path = treePath(n, edges, tree, edges[e][0], edges[e][1]) ?? [];
	return [e, ...path];
}

// ── "which triangles does this cycle enclose?" (linear algebra over ℤ/2) ─────

/**
 * Solve A x = b over ℤ/2, where A is given by columns (each a list of row
 * indices holding a 1). Returns the set of columns in one solution, or null.
 * For the boundary map ∂₂ of a disk the solution is unique.
 */
export function solveZ2(cols: number[][], rows: number, b: Iterable<number>): number[] | null {
	const words = Math.ceil((rows + cols.length + 1) / 32);
	// augmented column-reduction: each column carries the set of original columns it is made of
	type V = { bits: Uint32Array; comb: Set<number> };
	const mk = (ones: Iterable<number>): Uint32Array => {
		const w = new Uint32Array(words);
		for (const i of ones) w[i >>> 5] ^= 1 << (i & 31);
		return w;
	};
	const high = (w: Uint32Array) => {
		for (let k = w.length - 1; k >= 0; k--) if (w[k]) return (k << 5) + (31 - Math.clz32(w[k]));
		return -1;
	};
	const pivots = new Map<number, V>();
	cols.forEach((c, j) => {
		const v: V = { bits: mk(c), comb: new Set([j]) };
		let h = high(v.bits);
		while (h !== -1 && pivots.has(h)) {
			const p = pivots.get(h)!;
			for (let k = 0; k < words; k++) v.bits[k] ^= p.bits[k];
			v.comb = symDiff(v.comb, p.comb);
			h = high(v.bits);
		}
		if (h !== -1) pivots.set(h, v);
	});
	const target: V = { bits: mk(b), comb: new Set() };
	let h = high(target.bits);
	while (h !== -1 && pivots.has(h)) {
		const p = pivots.get(h)!;
		for (let k = 0; k < words; k++) target.bits[k] ^= p.bits[k];
		target.comb = symDiff(target.comb, p.comb);
		h = high(target.bits);
	}
	if (h !== -1) return null;
	return [...target.comb].sort((x, y) => x - y);
}

/** The triangles of `cx` enclosed (mod 2) by an edge cycle; null if `sel` is not a cycle. */
export function enclosedTriangles(cx: PlaneComplex, sel: Iterable<number>): number[] | null {
	const cols = triangleEdges(cx.edges, cx.tris);
	return solveZ2(cols, cx.edges.length, sel);
}

// ── bridges to the math engine (used by tests and readouts) ─────────────────

/**
 * Build an engine complex from vertices, the alive edges and the filled
 * triangles, and translate our edge indices to the engine's.
 */
export function toEngine(n: number, edges: Edge[], tris: Tri[] = [], alive: (i: number) => boolean = () => true) {
	const gens: number[][] = [];
	for (let v = 0; v < n; v++) gens.push([v]);
	edges.forEach((e, i) => alive(i) && gens.push([...e]));
	for (const t of tris) gens.push([...t]);
	const K = new SimplicialComplex(gens);
	const edgeToEngine = (i: number) => K.indexOf(edges[i]);
	const triToEngine = (t: Tri) => K.indexOf(t);
	return { K, edgeToEngine, triToEngine };
}

/** gcd of two non-negative integers. */
export function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a;
}

/**
 * For coprime (p, q), integers (r, s) with p·s − q·r = 1, so that (p, q) and
 * (r, s) form a basis of ℤ² (used to cut a torus open along a (p, q) loop).
 */
export function unimodularPartner(p: number, q: number): [number, number] {
	// extended Euclid on (p, q): find s, r with p s − q r = 1
	const ext = (a: number, b: number): [number, number, number] => {
		if (b === 0) return [a, 1, 0];
		const [g, x, y] = ext(b, a % b);
		return [g, y, x - Math.floor(a / b) * y];
	};
	const [g, x, y] = ext(p, q); // p x + q y = g = 1
	if (g !== 1) throw new Error('p and q must be coprime');
	// p·x + q·y = 1  ⇒  take s = x, r = −y
	return [-y, x];
}

/** Swap x and y (reflect in the diagonal): turns a wide drawing into a tall one for phones. */
export function transposePts(pts: Pt[]): Pt[] {
	return pts.map(([x, y]) => [y, x] as Pt);
}

/** Where each bow-tie vertex label sits relative to its vertex (landscape drawing). */
export const bowtieLabelOffsets: Pt[] = [
	[-22, 0],
	[0, -24],
	[0, 26],
	[0, 25],
	[0, -24],
	[0, 26],
	[22, 0],
	[0, -24]
];
