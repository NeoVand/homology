// Fox colourings of a drawn diagram: give every arc a number mod p so that at
// each crossing twice the over-arc equals the sum of the two under-arcs. The
// colourings are the solutions of a linear system over the integers mod p,
// so they form a vector space; here are its equations and a basis.
import type { Drawing } from './draw';

/** one equation per crossing: 2·over − in − out ≡ 0 (mod p), one column per arc */
export function colouringEquations(d: Drawing, p: number): number[][] {
	return d.crossings.map((c) => {
		const r = new Array(d.arcs.length).fill(0);
		r[c.over] += 2;
		r[c.in] -= 1;
		r[c.out] -= 1;
		return r.map((v) => ((v % p) + p) % p);
	});
}

export function isColouring(d: Drawing, p: number, col: number[]): boolean {
	return d.crossings.every((c) => (((2 * col[c.over] - col[c.in] - col[c.out]) % p) + p) % p === 0);
}

const inv = (a: number, p: number) => {
	for (let x = 1; x < p; x++) if ((a * x) % p === 1) return x;
	throw new Error('not invertible');
};

/** a basis of the solutions of rows · x ≡ 0 (mod p), p prime */
export function nullspaceMod(rows: number[][], p: number): number[][] {
	const n = rows.length ? rows[0].length : 0;
	const A = rows.map((r) => r.slice());
	const pivots: number[] = [];
	let r = 0;
	for (let c = 0; c < n && r < A.length; c++) {
		const i = A.findIndex((row, k) => k >= r && row[c] % p !== 0);
		if (i < 0) continue;
		[A[r], A[i]] = [A[i], A[r]];
		const iv = inv(A[r][c], p);
		A[r] = A[r].map((v) => (v * iv) % p);
		for (let k = 0; k < A.length; k++)
			if (k !== r && A[k][c]) {
				const f = A[k][c];
				A[k] = A[k].map((v, j) => (((v - f * A[r][j]) % p) + p) % p);
			}
		pivots.push(c);
		r++;
	}
	const free = [...Array(n).keys()].filter((c) => !pivots.includes(c));
	return free.map((f) => {
		const x = new Array(n).fill(0);
		x[f] = 1;
		pivots.forEach((c, k) => (x[c] = (p - A[k][f]) % p));
		return x;
	});
}
