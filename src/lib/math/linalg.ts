// Exact linear algebra for homology: ranks over ℤ/2 and ℚ, and the Smith
// normal form over ℤ (which reveals torsion).

export type Matrix = number[][];

export function zeros(r: number, c: number): Matrix {
	return Array.from({ length: r }, () => new Array<number>(c).fill(0));
}

export function clone(M: Matrix): Matrix {
	return M.map((row) => row.slice());
}

export function transpose(M: Matrix): Matrix {
	const r = M.length;
	const c = r ? M[0].length : 0;
	const T = zeros(c, r);
	for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) T[j][i] = M[i][j];
	return T;
}

export function matmul(A: Matrix, B: Matrix): Matrix {
	const r = A.length;
	const m = B.length;
	const c = m ? B[0].length : 0;
	const C = zeros(r, c);
	for (let i = 0; i < r; i++)
		for (let k = 0; k < m; k++) {
			const a = A[i][k];
			if (!a) continue;
			for (let j = 0; j < c; j++) C[i][j] += a * B[k][j];
		}
	return C;
}

// ── ℤ/2 ────────────────────────────────────────────────────────────────────

/** Bit vector over ℤ/2. */
export class BitVec {
	readonly words: Uint32Array;
	constructor(
		readonly n: number,
		words?: Uint32Array
	) {
		this.words = words ?? new Uint32Array((n + 31) >>> 5);
	}
	static from(n: number, ones: Iterable<number>): BitVec {
		const b = new BitVec(n);
		for (const i of ones) b.flip(i);
		return b;
	}
	get(i: number): boolean {
		return ((this.words[i >>> 5] >>> (i & 31)) & 1) === 1;
	}
	set(i: number, on: boolean) {
		if (this.get(i) !== on) this.flip(i);
	}
	flip(i: number) {
		this.words[i >>> 5] ^= 1 << (i & 31);
	}
	xor(o: BitVec) {
		for (let w = 0; w < this.words.length; w++) this.words[w] ^= o.words[w];
	}
	isZero(): boolean {
		for (let w = 0; w < this.words.length; w++) if (this.words[w]) return false;
		return true;
	}
	/** highest set bit, or −1 */
	high(): number {
		for (let w = this.words.length - 1; w >= 0; w--) {
			const x = this.words[w];
			if (x) return (w << 5) + (31 - Math.clz32(x));
		}
		return -1;
	}
	ones(): number[] {
		const out: number[] = [];
		for (let i = 0; i < this.n; i++) if (this.get(i)) out.push(i);
		return out;
	}
	copy(): BitVec {
		return new BitVec(this.n, this.words.slice());
	}
}

/** Rank over ℤ/2 of a matrix given by columns (each a BitVec of the row space). */
export function rankZ2Columns(cols: BitVec[]): number {
	const pivots = new Map<number, BitVec>();
	let rank = 0;
	for (const c0 of cols) {
		const c = c0.copy();
		let h = c.high();
		while (h !== -1 && pivots.has(h)) {
			c.xor(pivots.get(h)!);
			h = c.high();
		}
		if (h !== -1) {
			pivots.set(h, c);
			rank++;
		}
	}
	return rank;
}

export function rankZ2(M: Matrix): number {
	const r = M.length;
	const c = r ? M[0].length : 0;
	const cols: BitVec[] = [];
	for (let j = 0; j < c; j++) {
		const b = new BitVec(r);
		for (let i = 0; i < r; i++) if (((M[i][j] % 2) + 2) % 2 === 1) b.flip(i);
		cols.push(b);
	}
	return rankZ2Columns(cols);
}

// ── ℤ: Smith normal form ───────────────────────────────────────────────────

export interface SmithResult {
	/** the nonzero diagonal entries d1 | d2 | … | dr (all positive) */
	diagonal: number[];
	rank: number;
}

/**
 * Smith normal form of an integer matrix. Returns the invariant factors.
 * (Dense; fine for the small complexes in this book.)
 */
export function smith(M0: Matrix): SmithResult {
	const A = clone(M0);
	const m = A.length;
	const n = m ? A[0].length : 0;
	const diag: number[] = [];
	let t = 0;

	const swapRows = (i: number, j: number) => {
		const tmp = A[i];
		A[i] = A[j];
		A[j] = tmp;
	};
	const swapCols = (i: number, j: number) => {
		for (let r = 0; r < m; r++) {
			const tmp = A[r][i];
			A[r][i] = A[r][j];
			A[r][j] = tmp;
		}
	};

	while (t < Math.min(m, n)) {
		// smallest nonzero entry in the remaining block
		let best = 0;
		let bi = -1;
		let bj = -1;
		for (let i = t; i < m; i++)
			for (let j = t; j < n; j++) {
				const v = Math.abs(A[i][j]);
				if (v && (!best || v < best)) {
					best = v;
					bi = i;
					bj = j;
					if (best === 1) break;
				}
			}
		if (bi === -1) break;
		swapRows(t, bi);
		swapCols(t, bj);

		for (;;) {
			let clean = true;
			const p = A[t][t];
			// clear column t
			for (let i = t + 1; i < m; i++) {
				if (!A[i][t]) continue;
				const q = Math.trunc(A[i][t] / p);
				if (q) for (let j = t; j < n; j++) A[i][j] -= q * A[t][j];
				if (A[i][t]) clean = false;
			}
			// clear row t
			for (let j = t + 1; j < n; j++) {
				if (!A[t][j]) continue;
				const q = Math.trunc(A[t][j] / p);
				if (q) for (let i = t; i < m; i++) A[i][j] -= q * A[i][t];
				if (A[t][j]) clean = false;
			}
			if (!clean) {
				// bring the smallest leftover in row/col t to the pivot and repeat
				let sm = Math.abs(A[t][t]);
				let si = t;
				let sj = t;
				for (let i = t + 1; i < m; i++) if (A[i][t] && Math.abs(A[i][t]) < sm) [sm, si, sj] = [Math.abs(A[i][t]), i, t];
				for (let j = t + 1; j < n; j++) if (A[t][j] && Math.abs(A[t][j]) < sm) [sm, si, sj] = [Math.abs(A[t][j]), t, j];
				if (si !== t) swapRows(t, si);
				if (sj !== t) swapCols(t, sj);
				continue;
			}
			// divisibility: pivot must divide every remaining entry
			let fixed = false;
			for (let i = t + 1; i < m && !fixed; i++)
				for (let j = t + 1; j < n; j++)
					if (A[i][j] % p !== 0) {
						for (let k = t; k < n; k++) A[t][k] += A[i][k];
						fixed = true;
						break;
					}
			if (!fixed) break;
		}
		diag.push(Math.abs(A[t][t]));
		t++;
	}
	return { diagonal: diag, rank: diag.length };
}

/** Rank over ℚ (equal to the number of nonzero invariant factors). */
export function rankQ(M: Matrix): number {
	return smith(M).rank;
}

// ── real least squares (for Hodge decompositions on small complexes) ───────

/** Solve the symmetric positive semi-definite system A x = b by conjugate gradients. */
export function conjugateGradient(A: Matrix, b: number[], iters = 500, tol = 1e-10): number[] {
	const n = b.length;
	const x = new Array<number>(n).fill(0);
	const r = b.slice();
	const p = r.slice();
	let rs = dot(r, r);
	if (Math.sqrt(rs) < tol) return x;
	for (let it = 0; it < iters; it++) {
		const Ap = mulVec(A, p);
		const pAp = dot(p, Ap);
		if (Math.abs(pAp) < 1e-300) break;
		const alpha = rs / pAp;
		for (let i = 0; i < n; i++) {
			x[i] += alpha * p[i];
			r[i] -= alpha * Ap[i];
		}
		const rsNew = dot(r, r);
		if (Math.sqrt(rsNew) < tol) break;
		for (let i = 0; i < n; i++) p[i] = r[i] + (rsNew / rs) * p[i];
		rs = rsNew;
	}
	return x;
}

export function dot(a: number[], b: number[]): number {
	let s = 0;
	for (let i = 0; i < a.length; i++) s += a[i] * b[i];
	return s;
}

export function mulVec(A: Matrix, v: number[]): number[] {
	return A.map((row) => dot(row, v));
}
