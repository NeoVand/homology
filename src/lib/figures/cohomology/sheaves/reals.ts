// Tiny dense real linear algebra for the chapter's widgets (matrices are at
// most a few dozen entries across).

export type Mat = number[][];

/** Rank of a real matrix by Gaussian elimination with partial pivoting. */
export function rankReal(M: Mat, tol = 1e-9): number {
	const A = M.map((r) => r.slice());
	const m = A.length;
	const n = m ? A[0].length : 0;
	let rank = 0;
	for (let c = 0; c < n && rank < m; c++) {
		let p = rank;
		for (let i = rank + 1; i < m; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
		if (Math.abs(A[p][c]) <= tol) continue;
		[A[rank], A[p]] = [A[p], A[rank]];
		for (let i = 0; i < m; i++) {
			if (i === rank) continue;
			const f = A[i][c] / A[rank][c];
			if (f) for (let j = c; j < n; j++) A[i][j] -= f * A[rank][j];
		}
		rank++;
	}
	return rank;
}

export function matVec(M: Mat, x: number[]): number[] {
	return M.map((row) => row.reduce((s, a, j) => s + a * x[j], 0));
}

export function transpose(M: Mat): Mat {
	const m = M.length;
	const n = m ? M[0].length : 0;
	return Array.from({ length: n }, (_, j) => Array.from({ length: m }, (_, i) => M[i][j]));
}

export function matMul(A: Mat, B: Mat): Mat {
	const n = B[0]?.length ?? 0;
	return A.map((row) => Array.from({ length: n }, (_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
}

/**
 * Minimum-norm least-squares solution of A x ≈ b (A small).
 *
 * Conjugate gradients on the normal equations AᵀA x = Aᵀb, started at x = 0.
 * The system is always consistent, and CG from 0 stays in im Aᵀ, so it
 * converges to the minimum-norm solution even when AᵀA is singular.
 * Returns x and the residual r = b − A x, which is orthogonal to im A.
 */
export function leastSquares(A: Mat, b: number[]): { x: number[]; residual: number[] } {
	const At = transpose(A);
	const N = matMul(At, A);
	const n = N.length;
	const x = new Array<number>(n).fill(0);
	const r = matVec(At, b);
	const p = r.slice();
	let rs = r.reduce((s, v) => s + v * v, 0);
	for (let it = 0; it < 4 * n + 20 && rs > 1e-28; it++) {
		const Np = matVec(N, p);
		const pNp = p.reduce((s, v, i) => s + v * Np[i], 0);
		if (pNp <= 1e-300) break;
		const alpha = rs / pNp;
		for (let i = 0; i < n; i++) {
			x[i] += alpha * p[i];
			r[i] -= alpha * Np[i];
		}
		const rs1 = r.reduce((s, v) => s + v * v, 0);
		for (let i = 0; i < n; i++) p[i] = r[i] + (rs1 / rs) * p[i];
		rs = rs1;
	}
	const Ax = matVec(A, x);
	return { x, residual: b.map((v, i) => v - Ax[i]) };
}

export function norm(v: number[]): number {
	return Math.sqrt(v.reduce((s, a) => s + a * a, 0));
}
