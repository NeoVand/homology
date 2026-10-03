// Homology and cohomology of simplicial complexes.
import { SimplicialComplex } from './complex';
import { BitVec, rankZ2Columns, smith } from './linalg';

export type Coefficients = 'Z' | 'Z2' | 'Q';

export interface HomologyGroup {
	/** Betti number (rank of the free part) */
	rank: number;
	/** torsion orders, e.g. [2] for ℤ/2 (only for ℤ coefficients) */
	torsion: number[];
}

/** Human-readable name of a group, e.g. "ℤ² ⊕ ℤ/2", "0". */
export function groupName(g: HomologyGroup, coeff: Coefficients = 'Z'): string {
	const base = coeff === 'Z' ? 'ℤ' : coeff === 'Q' ? 'ℚ' : 'ℤ/2';
	const sup = (n: number) =>
		String(n)
			.split('')
			.map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
			.join('');
	const parts: string[] = [];
	if (g.rank === 1) parts.push(base);
	else if (g.rank > 1) parts.push(coeff === 'Z2' ? `(ℤ/2)${sup(g.rank)}` : `${base}${sup(g.rank)}`);
	for (const t of g.torsion) parts.push(`ℤ/${t}`);
	return parts.length ? parts.join(' ⊕ ') : '0';
}

/** TeX name of a group, e.g. "\\Z^2 \\oplus \\Z/2". */
export function groupTeX(g: HomologyGroup, coeff: Coefficients = 'Z'): string {
	const base = coeff === 'Z' ? '\\mathbb{Z}' : coeff === 'Q' ? '\\mathbb{Q}' : '\\mathbb{Z}/2';
	const parts: string[] = [];
	if (g.rank === 1) parts.push(base);
	else if (g.rank > 1) parts.push(coeff === 'Z2' ? `(\\mathbb{Z}/2)^{${g.rank}}` : `${base}^{${g.rank}}`);
	for (const t of g.torsion) parts.push(`\\mathbb{Z}/${t}`);
	return parts.length ? parts.join(' \\oplus ') : '0';
}

function z2Columns(K: SimplicialComplex, k: number): BitVec[] {
	const rows = K.count(k - 1);
	return K.boundaryColumns(k).map((col) => {
		const b = new BitVec(Math.max(rows, 1));
		for (const [i, v] of col) if (v % 2 !== 0) b.flip(i);
		return b;
	});
}

/** Ranks of the boundary maps ∂_0 … ∂_{dim+1} over the given coefficients. */
export function boundaryRanks(K: SimplicialComplex, coeff: Coefficients): number[] {
	const ranks: number[] = [];
	for (let k = 0; k <= K.dim + 1; k++) {
		if (k === 0 || k > K.dim) ranks.push(0);
		else if (coeff === 'Z2') ranks.push(rankZ2Columns(z2Columns(K, k)));
		else ranks.push(smith(K.boundaryMatrix(k)).rank);
	}
	return ranks;
}

/**
 * Homology groups H_0 … H_dim.
 *   rank H_k = n_k − rank ∂_k − rank ∂_{k+1}
 *   torsion of H_k (over ℤ) = invariant factors > 1 of ∂_{k+1}
 */
export function homology(K: SimplicialComplex, coeff: Coefficients = 'Z'): HomologyGroup[] {
	const out: HomologyGroup[] = [];
	const smithCache = new Map<number, ReturnType<typeof smith>>();
	const sm = (k: number) => {
		if (!smithCache.has(k)) smithCache.set(k, smith(K.boundaryMatrix(k)));
		return smithCache.get(k)!;
	};
	const ranks = coeff === 'Z2' ? boundaryRanks(K, 'Z2') : null;
	for (let k = 0; k <= K.dim; k++) {
		const n = K.count(k);
		const rk = k === 0 ? 0 : ranks ? ranks[k] : sm(k).rank;
		const rk1 = k + 1 > K.dim ? 0 : ranks ? ranks[k + 1] : sm(k + 1).rank;
		const torsion = coeff === 'Z' && k + 1 <= K.dim ? sm(k + 1).diagonal.filter((d) => d > 1) : [];
		out.push({ rank: n - rk - rk1, torsion });
	}
	return out;
}

export function bettiNumbers(K: SimplicialComplex, coeff: Coefficients = 'Q'): number[] {
	return homology(K, coeff === 'Z' ? 'Q' : coeff).map((g) => g.rank);
}

/**
 * Cohomology groups H^0 … H^dim with ℤ coefficients, via the Universal
 * Coefficient Theorem: H^k ≅ ℤ^{b_k} ⊕ T_{k−1}, where T_{k−1} is the torsion
 * of H_{k−1}. (With field coefficients cohomology has the same ranks as homology.)
 */
export function cohomology(K: SimplicialComplex, coeff: Coefficients = 'Z'): HomologyGroup[] {
	const H = homology(K, coeff);
	if (coeff !== 'Z') return H.map((g) => ({ rank: g.rank, torsion: [] }));
	return H.map((g, k) => ({ rank: g.rank, torsion: k > 0 ? H[k - 1].torsion.slice() : [] }));
}

// ── ℤ/2 cycle representatives and class membership ────────────────────────

interface Pivoted {
	vec: BitVec;
	/** which homology generators this basis vector involves */
	label: BitVec;
}

/**
 * Mod-2 homology in one dimension k, with explicit representatives.
 * Lets figures ask: is this chain a cycle? a boundary? which class is it in?
 */
export class Z2HomologyBasis {
	readonly k: number;
	readonly n: number;
	/** representative cycles of a basis of H_k(K; ℤ/2), as lists of k-simplex indices */
	readonly generators: number[][] = [];
	private readonly basis = new Map<number, Pivoted>();
	private readonly bdryCols: BitVec[];

	constructor(
		readonly K: SimplicialComplex,
		k: number,
		/** optional preferred cycles, tried first as generators (e.g. nice loops) */
		preferred: number[][] = []
	) {
		this.k = k;
		this.n = K.count(k);
		this.bdryCols = z2Columns(K, k);
		const genCount = 64; // label width; plenty for the complexes in this book
		const zeroLabel = () => new BitVec(genCount);

		// 1. boundaries B_k = im ∂_{k+1}
		for (const col of z2Columns(K, k + 1)) this.insert(col, zeroLabel());

		// 2. cycles: preferred ones first, then a kernel basis of ∂_k
		const candidates: BitVec[] = preferred.map((c) => BitVec.from(this.n, c));
		for (const z of this.cycleBasis()) candidates.push(z);
		for (const z of candidates) {
			if (!this.isCycleVec(z)) continue;
			const r = this.reduce(z.copy(), zeroLabel());
			if (r.vec.isZero()) continue;
			const g = this.generators.length;
			const label = r.label;
			label.flip(g);
			this.basis.set(r.vec.high(), { vec: r.vec, label });
			this.generators.push(z.ones());
		}
	}

	private insert(v: BitVec, label: BitVec) {
		const r = this.reduce(v.copy(), label.copy());
		if (!r.vec.isZero()) this.basis.set(r.vec.high(), r);
	}

	private reduce(vec: BitVec, label: BitVec): Pivoted {
		let h = vec.high();
		while (h !== -1 && this.basis.has(h)) {
			const b = this.basis.get(h)!;
			vec.xor(b.vec);
			label.xor(b.label);
			h = vec.high();
		}
		return { vec, label };
	}

	private isCycleVec(z: BitVec): boolean {
		const rows = this.k === 0 ? 0 : this.K.count(this.k - 1);
		if (this.k === 0) return true;
		const acc = new BitVec(Math.max(rows, 1));
		for (const j of z.ones()) acc.xor(this.bdryCols[j]);
		return acc.isZero();
	}

	/** A basis of ker ∂_k over ℤ/2 by column reduction with bookkeeping. */
	private cycleBasis(): BitVec[] {
		if (this.k === 0) return Array.from({ length: this.n }, (_, i) => BitVec.from(this.n, [i]));
		const piv = new Map<number, { col: BitVec; comb: BitVec }>();
		const out: BitVec[] = [];
		this.bdryCols.forEach((c0, j) => {
			const col = c0.copy();
			const comb = BitVec.from(this.n, [j]);
			let h = col.high();
			while (h !== -1 && piv.has(h)) {
				const p = piv.get(h)!;
				col.xor(p.col);
				comb.xor(p.comb);
				h = col.high();
			}
			if (h === -1) out.push(comb);
			else piv.set(h, { col, comb });
		});
		return out;
	}

	isCycle(chain: number[]): boolean {
		return this.isCycleVec(BitVec.from(this.n, chain));
	}

	/**
	 * For a cycle, its class in H_k as a 0/1 vector over the generators
	 * (all zeros means it is a boundary). Returns null if not a cycle.
	 */
	classOf(chain: number[]): number[] | null {
		const z = BitVec.from(this.n, chain);
		if (!this.isCycleVec(z)) return null;
		const r = this.reduce(z, new BitVec(64));
		// r.vec is zero for a cycle, since boundaries + generators span all cycles
		return this.generators.map((_, g) => (r.label.get(g) ? 1 : 0));
	}

	isBoundary(chain: number[]): boolean {
		const c = this.classOf(chain);
		return !!c && c.every((x) => x === 0);
	}

	get rank(): number {
		return this.generators.length;
	}
}

/** Mod-2 boundary of a set of k-simplices (returned as (k−1)-simplex indices). */
export function boundaryZ2(K: SimplicialComplex, k: number, chain: number[]): number[] {
	if (k === 0) return [];
	const cols = K.boundaryColumns(k);
	const count = new Map<number, number>();
	for (const j of chain) for (const [i] of cols[j]) count.set(i, (count.get(i) ?? 0) + 1);
	return [...count.entries()]
		.filter(([, c]) => c % 2 === 1)
		.map(([i]) => i)
		.sort((a, b) => a - b);
}
