// Integer chains on a simplicial complex, as dense coefficient vectors
// indexed like K.simplices[k]. Small helpers used by several figures.
import type { SimplicialComplex } from '$lib/math/complex';

export type Chain = number[];

export const zeroChain = (K: SimplicialComplex, k: number): Chain => new Array<number>(K.count(k)).fill(0);

export function addChains(a: Chain, b: Chain, s = 1): Chain {
	return a.map((x, i) => x + s * (b[i] ?? 0));
}

export const isZero = (c: Chain) => c.every((x) => x === 0);

/** Chain from a list of oriented simplices written as vertex lists, e.g. [[0,1],[1,2],[2,0]]. */
export function chainOf(K: SimplicialComplex, k: number, oriented: number[][], coef: number[] = []): Chain {
	const c = zeroChain(K, k);
	oriented.forEach((s, n) => {
		const idx = K.indexOf(s);
		if (idx < 0) throw new Error(`simplex ${s.join(',')} not in complex`);
		c[idx] += (coef[n] ?? 1) * permSign(s);
	});
	return c;
}

/** Sign of the permutation that sorts s (the orientation of s relative to increasing order). */
export function permSign(s: number[]): 1 | -1 {
	let sign = 1;
	for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (s[i] > s[j]) sign = -sign;
	return sign as 1 | -1;
}

/** A closed edge path v0 → v1 → … → v0 as a 1-chain. */
export function loopChain(K: SimplicialComplex, path: number[]): Chain {
	const pairs: number[][] = [];
	for (let i = 0; i < path.length; i++) pairs.push([path[i], path[(i + 1) % path.length]]);
	return chainOf(K, 1, pairs);
}

/** A (not necessarily closed) edge path as a 1-chain. */
export function pathChain(K: SimplicialComplex, path: number[]): Chain {
	const pairs: number[][] = [];
	for (let i = 0; i + 1 < path.length; i++) pairs.push([path[i], path[i + 1]]);
	return chainOf(K, 1, pairs);
}

/** TeX for a chain: e.g. "[0,1] + [1,2] - [0,2]". */
export function chainTeX(K: SimplicialComplex, k: number, c: Chain, opts: { max?: number; zero?: string } = {}): string {
	const terms: { neg: boolean; body: string }[] = [];
	c.forEach((x, i) => {
		if (!x) return;
		const mag = Math.abs(x) === 1 ? '' : String(Math.abs(x));
		terms.push({ neg: x < 0, body: mag + `[${K.simplices[k][i].join(',')}]` });
	});
	if (!terms.length) return opts.zero ?? '0';
	const max = opts.max ?? 99;
	let out = '';
	terms.slice(0, max).forEach((t, n) => {
		if (n === 0) out += (t.neg ? '-' : '') + t.body;
		else out += (t.neg ? ' - ' : ' + ') + t.body;
	});
	if (terms.length > max) out += ' + \\cdots';
	return out;
}

/** Rank of an integer matrix modulo a prime p (Gaussian elimination). */
export function rankModP(M: number[][], p: number): number {
	const A = M.map((r) => r.map((x) => ((x % p) + p) % p));
	const rows = A.length;
	const cols = rows ? A[0].length : 0;
	let r = 0;
	const inv = (a: number) => {
		for (let x = 1; x < p; x++) if ((a * x) % p === 1) return x;
		throw new Error('no inverse');
	};
	for (let c = 0; c < cols && r < rows; c++) {
		let piv = -1;
		for (let i = r; i < rows; i++) if (A[i][c]) {
			piv = i;
			break;
		}
		if (piv < 0) continue;
		[A[r], A[piv]] = [A[piv], A[r]];
		const iv = inv(A[r][c]);
		for (let j = c; j < cols; j++) A[r][j] = (A[r][j] * iv) % p;
		for (let i = 0; i < rows; i++) {
			if (i === r || !A[i][c]) continue;
			const f = A[i][c];
			for (let j = c; j < cols; j++) A[i][j] = (((A[i][j] - f * A[r][j]) % p) + p) % p;
		}
		r++;
	}
	return r;
}

/** Betti numbers over ℤ/p (p prime) from ranks mod p. */
export function bettiModP(K: SimplicialComplex, p: number): number[] {
	const r = (k: number) => (k <= 0 || k > K.dim ? 0 : rankModP(K.boundaryMatrix(k), p));
	return Array.from({ length: K.dim + 1 }, (_, k) => K.count(k) - r(k) - r(k + 1));
}

/**
 * Is the integer chain c in the image of the integer matrix A (columns = generators)?
 * Exact test by Smith-free method: solve over ℚ, then check integrality is not
 * needed for our uses — we only ask the rational question here.
 */
export function inRationalSpan(A: number[][], c: number[]): boolean {
	const rank = (M: number[][]) => rankModLargePrime(M);
	const aug = A.map((row, i) => [...row, c[i]]);
	return rank(aug) === rank(A);
}

/** Rank over ℚ via elimination modulo a large prime (exact for the small matrices in this book). */
export function rankModLargePrime(M: number[][]): number {
	return rankModP(M, 1000003);
}

/** For each triangle orientation choice eps (±1 per triangle), the boundary of Σ eps_t t. */
export function boundaryOfOriented(K: SimplicialComplex, eps: number[]): Chain {
	return K.boundary(2, eps);
}

/**
 * The orientation-conflict cycle: if ∂(Σ eps_t t) = 2c, return c
 * (on a closed surface every coefficient of ∂(Σ eps_t t) is 0 or ±2).
 */
export function conflictCycle(K: SimplicialComplex, eps: number[]): Chain {
	const d = K.boundary(2, eps);
	return d.map((x) => {
		if (x % 2 !== 0) throw new Error('not a closed surface');
		return x / 2;
	});
}

/**
 * Coherent orientation of a connected closed surface by breadth-first search,
 * starting from triangle `start` with sign +1; returns null if impossible.
 */
export function coherentOrientation(K: SimplicialComplex, start = 0): number[] | null {
	const cols = K.boundaryColumns(2);
	const sign = new Array<number>(cols.length).fill(0);
	const byEdge = new Map<number, number[]>();
	cols.forEach((c, j) => {
		for (const [i] of c) byEdge.set(i, [...(byEdge.get(i) ?? []), j]);
	});
	sign[start] = 1;
	const q = [start];
	while (q.length) {
		const j = q.shift()!;
		for (const [e, v] of cols[j])
			for (const j2 of byEdge.get(e)!) {
				if (j2 === j) continue;
				const want = -sign[j] * v * cols[j2].get(e)!;
				if (!sign[j2]) {
					sign[j2] = want;
					q.push(j2);
				} else if (sign[j2] !== want) return null;
			}
	}
	return sign;
}
