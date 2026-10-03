// Simplicial complexes and their boundary operators.
//
// A simplex is a sorted array of vertex ids. Orientation is the one induced
// by the sorted order, so the boundary of [v0, …, vk] is
//   ∂[v0,…,vk] = Σ_i (−1)^i [v0,…,v̂i,…,vk].

export type Simplex = number[];

export function key(s: Simplex): string {
	return s.join(',');
}

/** All faces of a simplex of every dimension (including itself). */
export function faces(s: Simplex): Simplex[] {
	const out: Simplex[] = [];
	const n = s.length;
	for (let mask = 1; mask < 1 << n; mask++) {
		const f: number[] = [];
		for (let i = 0; i < n; i++) if (mask & (1 << i)) f.push(s[i]);
		out.push(f);
	}
	return out;
}

/** Codimension-one faces with their signs in the boundary. */
export function boundaryFaces(s: Simplex): { face: Simplex; sign: 1 | -1 }[] {
	if (s.length <= 1) return [];
	return s.map((_, i) => ({ face: s.filter((_, j) => j !== i), sign: (i % 2 === 0 ? 1 : -1) as 1 | -1 }));
}

/** Sparse column: row index → coefficient. */
export type SparseCol = Map<number, number>;

export class SimplicialComplex {
	/** simplices[k] lists the k-simplices (each sorted) in a fixed order */
	readonly simplices: Simplex[][] = [];
	private readonly lookup: Map<string, number>[] = [];

	/** Build from any list of simplices; all faces are added automatically. */
	constructor(generators: number[][]) {
		const seen: Set<string>[] = [];
		const add = (s: Simplex) => {
			const k = s.length - 1;
			if (k < 0) return;
			while (this.simplices.length <= k) {
				this.simplices.push([]);
				this.lookup.push(new Map());
				seen.push(new Set());
			}
			const kk = key(s);
			if (seen[k].has(kk)) return;
			seen[k].add(kk);
			this.lookup[k].set(kk, this.simplices[k].length);
			this.simplices[k].push(s);
		};
		for (const g of generators) {
			const s = [...new Set(g)].sort((a, b) => a - b);
			for (const f of faces(s)) add(f);
		}
		// deterministic order within each dimension (lexicographic)
		for (let k = 0; k < this.simplices.length; k++) {
			this.simplices[k].sort((a, b) => {
				for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
				return 0;
			});
			this.lookup[k].clear();
			this.simplices[k].forEach((s, i) => this.lookup[k].set(key(s), i));
		}
	}

	get dim(): number {
		return this.simplices.length - 1;
	}

	count(k: number): number {
		return this.simplices[k]?.length ?? 0;
	}

	/** f-vector: number of simplices in each dimension */
	get fVector(): number[] {
		return this.simplices.map((s) => s.length);
	}

	indexOf(s: Simplex): number {
		const k = s.length - 1;
		const sorted = [...s].sort((a, b) => a - b);
		return this.lookup[k]?.get(key(sorted)) ?? -1;
	}

	has(s: Simplex): boolean {
		return this.indexOf(s) !== -1;
	}

	get vertices(): number[] {
		return (this.simplices[0] ?? []).map((s) => s[0]);
	}

	eulerCharacteristic(): number {
		return this.simplices.reduce((acc, s, k) => acc + (k % 2 === 0 ? 1 : -1) * s.length, 0);
	}

	/**
	 * Boundary matrix ∂_k : C_k → C_{k−1} as sparse columns (one per k-simplex,
	 * rows indexed by (k−1)-simplices). ∂_0 is the zero map.
	 */
	boundaryColumns(k: number): SparseCol[] {
		const cols: SparseCol[] = [];
		for (const s of this.simplices[k] ?? []) {
			const col: SparseCol = new Map();
			if (k > 0) {
				for (const { face, sign } of boundaryFaces(s)) {
					col.set(this.lookup[k - 1].get(key(face))!, sign);
				}
			}
			cols.push(col);
		}
		return cols;
	}

	/** Dense boundary matrix (rows = (k−1)-simplices, cols = k-simplices). */
	boundaryMatrix(k: number): number[][] {
		const rows = this.count(k - 1);
		const cols = this.count(k);
		const M = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
		this.boundaryColumns(k).forEach((col, j) => {
			for (const [i, v] of col) M[i][j] = v;
		});
		return M;
	}

	/** Integer boundary of a k-chain given as coefficients on k-simplices. */
	boundary(k: number, chain: number[]): number[] {
		const out = new Array<number>(this.count(k - 1)).fill(0);
		if (k === 0) return out;
		this.boundaryColumns(k).forEach((col, j) => {
			const c = chain[j];
			if (!c) return;
			for (const [i, v] of col) out[i] += c * v;
		});
		return out;
	}

	/** Coboundary δ^k : C^k → C^{k+1}, i.e. (δf)(σ) = f(∂σ). */
	coboundary(k: number, cochain: number[]): number[] {
		const out = new Array<number>(this.count(k + 1)).fill(0);
		this.boundaryColumns(k + 1).forEach((col, j) => {
			let s = 0;
			for (const [i, v] of col) s += v * (cochain[i] ?? 0);
			out[j] = s;
		});
		return out;
	}

	/** The subcomplex of simplices whose vertices all satisfy a predicate. */
	induced(pred: (v: number) => boolean): SimplicialComplex {
		const top: number[][] = [];
		for (const dimList of this.simplices) for (const s of dimList) if (s.every(pred)) top.push(s);
		return new SimplicialComplex(top);
	}

	/** Maximal simplices (not a face of a larger one). */
	maximal(): Simplex[] {
		const isFace = new Set<string>();
		for (let k = 1; k < this.simplices.length; k++) {
			for (const s of this.simplices[k]) for (const { face } of boundaryFaces(s)) isFace.add(key(face));
		}
		const out: Simplex[] = [];
		for (const dimList of this.simplices) for (const s of dimList) if (!isFace.has(key(s))) out.push(s);
		return out;
	}
}

/**
 * Check that a 2-dimensional complex is a closed surface:
 * every edge lies in exactly two triangles and every vertex link is a single cycle.
 */
export function isClosedSurface(K: SimplicialComplex): boolean {
	if (K.dim !== 2) return false;
	const edgeTri = new Map<string, number>();
	for (const t of K.simplices[2]) {
		for (const { face } of boundaryFaces(t)) edgeTri.set(key(face), (edgeTri.get(key(face)) ?? 0) + 1);
	}
	for (const e of K.simplices[1]) if (edgeTri.get(key(e)) !== 2) return false;
	for (const [v] of K.simplices[0]) {
		// link of v: edges opposite v in triangles containing v
		const linkEdges = K.simplices[2].filter((t) => t.includes(v)).map((t) => t.filter((x) => x !== v));
		if (linkEdges.length === 0) return false;
		const adj = new Map<number, number[]>();
		for (const [a, b] of linkEdges) {
			adj.set(a, [...(adj.get(a) ?? []), b]);
			adj.set(b, [...(adj.get(b) ?? []), a]);
		}
		for (const ns of adj.values()) if (ns.length !== 2) return false;
		// connected?
		const start = linkEdges[0][0];
		const seen = new Set([start]);
		const stack = [start];
		while (stack.length) {
			const x = stack.pop()!;
			for (const y of adj.get(x)!) if (!seen.has(y)) (seen.add(y), stack.push(y));
		}
		if (seen.size !== adj.size) return false;
	}
	return true;
}

/** Is a closed surface orientable? (Try to orient triangles consistently.) */
export function isOrientable(K: SimplicialComplex): boolean {
	const tris = K.simplices[2];
	const orient = new Map<number, 1 | -1>();
	// edges → triangles containing them
	const byEdge = new Map<string, number[]>();
	tris.forEach((t, i) => {
		for (const { face } of boundaryFaces(t)) byEdge.set(key(face), [...(byEdge.get(key(face)) ?? []), i]);
	});
	// induced sign of edge e in oriented triangle t with orientation o
	const edgeSign = (t: Simplex, e: Simplex, o: 1 | -1) => {
		const bf = boundaryFaces(t).find((f) => key(f.face) === key(e))!;
		return (bf.sign * o) as 1 | -1;
	};
	for (let s = 0; s < tris.length; s++) {
		if (orient.has(s)) continue;
		orient.set(s, 1);
		const queue = [s];
		while (queue.length) {
			const i = queue.shift()!;
			for (const { face } of boundaryFaces(tris[i])) {
				for (const j of byEdge.get(key(face)) ?? []) {
					if (j === i) continue;
					// consistent orientation: the shared edge appears with opposite signs
					const want = (-edgeSign(tris[i], face, orient.get(i)!) * edgeSign(tris[j], face, 1)) as 1 | -1;
					if (!orient.has(j)) {
						orient.set(j, want);
						queue.push(j);
					} else if (orient.get(j) !== want) return false;
				}
			}
		}
	}
	return true;
}
