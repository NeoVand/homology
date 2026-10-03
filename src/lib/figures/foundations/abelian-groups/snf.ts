// Smith normal form with the change-of-basis matrices and a readable log of
// every integer row/column operation, for the chapter's step-through figure
// and for colouring the cosets of a sublattice of ℤ².
//
// Convention: a relation matrix A has one ROW per generator and one COLUMN per
// relation, so the group it presents is ℤ^m / (column span of A). We find
// unimodular U (m×m) and V (k×k) with U·A·V = D diagonal, d₁ | d₂ | … .

export type Matrix = number[][];

export interface SnfStep {
	/** a sentence describing the operation just performed */
	text: string;
	/** the matrix after the operation */
	M: Matrix;
	/** cells to highlight: the pivot, and the rows/columns that changed */
	pivot?: [number, number];
	rows?: number[];
	cols?: number[];
}

export interface SnfFull {
	D: Matrix;
	U: Matrix;
	V: Matrix;
	/** the nonzero diagonal entries d₁ | d₂ | … (all positive) */
	diag: number[];
	rank: number;
	steps: SnfStep[];
}

const clone = (M: Matrix) => M.map((r) => r.slice());
const eye = (n: number): Matrix => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));

export function mod(a: number, n: number): number {
	return ((a % n) + n) % n;
}

/** Smith normal form, recording each elementary operation. */
export function snfFull(A0: Matrix, record = true): SnfFull {
	const m = A0.length;
	const k = m ? A0[0].length : 0;
	const A = clone(A0).map((r) => r.map((x) => x + 0)); // normalise −0
	const U = eye(m);
	const V = eye(k);
	const steps: SnfStep[] = [];
	const diag: number[] = [];
	const R = (i: number) => `row ${i + 1}`;
	const C = (j: number) => `column ${j + 1}`;
	const log = (text: string, extra: Omit<SnfStep, 'text' | 'M'> = {}) => {
		if (record) steps.push({ text, M: clone(A), ...extra });
	};
	log('Start: one row for each generator, one column for each relation.');

	const swapRows = (i: number, j: number, t: number) => {
		if (i === j) return;
		[A[i], A[j]] = [A[j], A[i]];
		[U[i], U[j]] = [U[j], U[i]];
		log(`Swap ${R(i)} and ${R(j)} (re-order the generators).`, { pivot: [t, t], rows: [i, j] });
	};
	const swapCols = (i: number, j: number, t: number) => {
		if (i === j) return;
		for (const row of A) [row[i], row[j]] = [row[j], row[i]];
		for (const row of V) [row[i], row[j]] = [row[j], row[i]];
		log(`Swap ${C(i)} and ${C(j)} (re-order the relations).`, { pivot: [t, t], cols: [i, j] });
	};
	// row_i ← row_i − q·row_t
	const subRow = (i: number, t: number, q: number, piv: number) => {
		for (let c = 0; c < k; c++) A[i][c] -= q * A[t][c];
		for (let c = 0; c < m; c++) U[i][c] -= q * U[t][c];
		log(
			q > 0
				? `Subtract ${q === 1 ? R(t) : `${q} × ${R(t)}`} from ${R(i)} (a change of generators).`
				: `Add ${q === -1 ? R(t) : `${-q} × ${R(t)}`} to ${R(i)} (a change of generators).`,
			{ pivot: [piv, piv], rows: [i] }
		);
	};
	// col_j ← col_j − q·col_t
	const subCol = (j: number, t: number, q: number, piv: number) => {
		for (let r = 0; r < m; r++) A[r][j] -= q * A[r][t];
		for (let r = 0; r < k; r++) V[r][j] -= q * V[r][t];
		log(
			q > 0
				? `Subtract ${q === 1 ? C(t) : `${q} × ${C(t)}`} from ${C(j)} (combine the relations).`
				: `Add ${q === -1 ? C(t) : `${-q} × ${C(t)}`} to ${C(j)} (combine the relations).`,
			{ pivot: [piv, piv], cols: [j] }
		);
	};
	const addRow = (t: number, i: number) => {
		for (let c = 0; c < k; c++) A[t][c] += A[i][c];
		for (let c = 0; c < m; c++) U[t][c] += U[i][c];
		log(`Add ${R(i)} to ${R(t)}, so that the corner entry must divide everything (a change of generators).`, {
			pivot: [t, t],
			rows: [t]
		});
	};
	const negRow = (t: number) => {
		for (let c = 0; c < k; c++) A[t][c] = -A[t][c] + 0;
		for (let c = 0; c < m; c++) U[t][c] = -U[t][c] + 0;
		log(`Multiply ${R(t)} by −1 to make the corner entry positive.`, { pivot: [t, t], rows: [t] });
	};

	let t = 0;
	while (t < Math.min(m, k)) {
		let best = 0;
		let bi = -1;
		let bj = -1;
		for (let i = t; i < m; i++)
			for (let j = t; j < k; j++) {
				const v = Math.abs(A[i][j]);
				if (v && (!best || v < best)) {
					best = v;
					bi = i;
					bj = j;
				}
			}
		if (bi === -1) break;
		swapRows(t, bi, t);
		swapCols(t, bj, t);
		for (let guard = 0; guard < 200; guard++) {
			let clean = true;
			const p = A[t][t];
			for (let i = t + 1; i < m; i++) {
				if (!A[i][t]) continue;
				const q = Math.trunc(A[i][t] / p);
				if (q) subRow(i, t, q, t);
				if (A[i][t]) clean = false;
			}
			for (let j = t + 1; j < k; j++) {
				if (!A[t][j]) continue;
				const q = Math.trunc(A[t][j] / p);
				if (q) subCol(j, t, q, t);
				if (A[t][j]) clean = false;
			}
			if (!clean) {
				let sm = Math.abs(A[t][t]);
				let si = t;
				let sj = t;
				for (let i = t + 1; i < m; i++)
					if (A[i][t] && Math.abs(A[i][t]) < sm) [sm, si, sj] = [Math.abs(A[i][t]), i, t];
				for (let j = t + 1; j < k; j++)
					if (A[t][j] && Math.abs(A[t][j]) < sm) [sm, si, sj] = [Math.abs(A[t][j]), t, j];
				swapRows(t, si, t);
				swapCols(t, sj, t);
				continue;
			}
			let fixed = false;
			for (let i = t + 1; i < m && !fixed; i++)
				for (let j = t + 1; j < k; j++)
					if (A[i][j] % p !== 0) {
						addRow(t, i);
						fixed = true;
						break;
					}
			if (!fixed) break;
		}
		if (A[t][t] < 0) negRow(t);
		diag.push(A[t][t]);
		t++;
	}
	if (record) {
		steps.push({
			text: 'Done: the matrix is diagonal, and each diagonal entry divides the next.',
			M: clone(A),
			rows: [],
			cols: []
		});
	}
	return { D: A, U, V, diag, rank: diag.length, steps };
}

export function matmul(A: Matrix, B: Matrix): Matrix {
	return A.map((row) => B[0].map((_, j) => row.reduce((s, a, i) => s + a * B[i][j], 0)));
}

export function det2(A: Matrix): number {
	return A[0][0] * A[1][1] - A[0][1] * A[1][0];
}

/** The abelian group ℤ^m / (column span of A), as rank and torsion. */
export function presented(A: Matrix, m = A.length): { free: number; torsion: number[] } {
	const { diag } = snfFull(A, false);
	return { free: m - diag.length, torsion: diag.filter((d) => d > 1) };
}

/** TeX for ℤ^r ⊕ ℤ/d₁ ⊕ … (or 0). */
export function groupTeX(free: number, torsion: number[]): string {
	const parts: string[] = [];
	if (free === 1) parts.push('\\mathbb{Z}');
	else if (free > 1) parts.push(`\\mathbb{Z}^{${free}}`);
	for (const d of torsion) parts.push(`\\mathbb{Z}/${d}`);
	return parts.length ? parts.join(' \\oplus ') : '0';
}

/**
 * Coset coordinates for ℤ² / H, where H is spanned by the integer vectors v
 * and w. Two lattice points are in the same coset exactly when their
 * coordinates agree.
 */
export function latticeQuotient(v: [number, number], w: [number, number]) {
	const A: Matrix = [
		[v[0], w[0]],
		[v[1], w[1]]
	];
	const { U, diag } = snfFull(A, false);
	const d = [diag[0] ?? 0, diag[1] ?? 0];
	const coords = (x: number, y: number): [number, number] => {
		const c0 = U[0][0] * x + U[0][1] * y;
		const c1 = U[1][0] * x + U[1][1] * y;
		return [d[0] ? mod(c0, d[0]) : c0, d[1] ? mod(c1, d[1]) : c1];
	};
	const rank = diag.length;
	const torsion = diag.filter((x) => x > 1);
	return {
		coords,
		d,
		rank,
		free: 2 - rank,
		torsion,
		index: rank === 2 ? Math.abs(det2(A)) : Infinity,
		det: det2(A),
		tex: groupTeX(2 - rank, torsion)
	};
}

/** Is the lattice point p in the subgroup spanned by v and w? (brute force, for tests) */
export function inSpan(p: [number, number], v: [number, number], w: [number, number], B = 40): boolean {
	for (let a = -B; a <= B; a++)
		for (let b = -B; b <= B; b++) if (a * v[0] + b * w[0] === p[0] && a * v[1] + b * w[1] === p[1]) return true;
	return false;
}
