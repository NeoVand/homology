// Small graph algorithms for §2.6: connected pieces, a spanning forest, and
// the loop that each extra edge closes.
export type Edge = [number, number];

/** Union–find over arbitrary vertex ids. */
export class DSU {
	private parent = new Map<number, number>();
	find(x: number): number {
		if (!this.parent.has(x)) this.parent.set(x, x);
		let r = x;
		while (this.parent.get(r) !== r) r = this.parent.get(r)!;
		let y = x;
		while (this.parent.get(y) !== r) {
			const n = this.parent.get(y)!;
			this.parent.set(y, r);
			y = n;
		}
		return r;
	}
	union(a: number, b: number): boolean {
		const ra = this.find(a);
		const rb = this.find(b);
		if (ra === rb) return false;
		this.parent.set(ra, rb);
		return true;
	}
}

export interface GraphReport {
	V: number;
	E: number;
	chi: number;
	/** number of connected pieces (b₀) */
	pieces: number;
	/** number of independent loops (b₁ = E − V + pieces) */
	loops: number;
	/** for each edge: is it in the chosen spanning forest? */
	inTree: boolean[];
	/** piece index for each vertex id */
	pieceOf: Map<number, number>;
}

/** Analyse a graph; edges are added in order, so the forest is the greedy one. */
export function analyseGraph(vertices: number[], edges: Edge[], order?: number[]): GraphReport {
	const dsu = new DSU();
	for (const v of vertices) dsu.find(v);
	const inTree = new Array<boolean>(edges.length).fill(false);
	for (const i of order ?? edges.map((_, i) => i)) {
		const [a, b] = edges[i];
		inTree[i] = dsu.union(a, b);
	}
	const roots = new Map<number, number>();
	const pieceOf = new Map<number, number>();
	for (const v of vertices) {
		const r = dsu.find(v);
		if (!roots.has(r)) roots.set(r, roots.size);
		pieceOf.set(v, roots.get(r)!);
	}
	const V = vertices.length;
	const E = edges.length;
	const pieces = roots.size;
	return { V, E, chi: V - E, pieces, loops: E - V + pieces, inTree, pieceOf };
}

/** The loop closed by edge `e` together with tree edges: returns edge indices. */
export function fundamentalLoop(edges: Edge[], inTree: boolean[], e: number): number[] {
	const [s, t] = edges[e];
	// BFS from s to t in the forest
	const adj = new Map<number, { to: number; i: number }[]>();
	edges.forEach(([a, b], i) => {
		if (!inTree[i]) return;
		adj.set(a, [...(adj.get(a) ?? []), { to: b, i }]);
		adj.set(b, [...(adj.get(b) ?? []), { to: a, i }]);
	});
	const prev = new Map<number, { from: number; i: number }>();
	const queue = [s];
	const seen = new Set([s]);
	while (queue.length) {
		const x = queue.shift()!;
		if (x === t) break;
		for (const { to, i } of adj.get(x) ?? []) {
			if (seen.has(to)) continue;
			seen.add(to);
			prev.set(to, { from: x, i });
			queue.push(to);
		}
	}
	if (!seen.has(t)) return [e];
	const out = [e];
	let x = t;
	while (x !== s) {
		const p = prev.get(x)!;
		out.push(p.i);
		x = p.from;
	}
	return out;
}

/** A deterministic pseudo-random generator (for "another spanning tree" buttons). */
export function rng(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function shuffled(n: number, rand: () => number): number[] {
	const a = Array.from({ length: n }, (_, i) => i);
	for (let i = n - 1; i > 0; i--) {
		const j = Math.floor(rand() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}
