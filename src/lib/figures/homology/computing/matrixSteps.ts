// Step-by-step matrix reductions for the figures of §3.4:
//  • row reduction to echelon form over ℤ/2 or ℚ (rank = number of pivots);
//  • the Smith normal form over ℤ, following exactly the algorithm of
//    $lib/math/linalg.smith (so the final diagonal can be checked against it).
// Each step records the matrix *after* the step, what was done, and which
// rows/columns changed.

export type Field = 'Z2' | 'Q';

/** An exact rational number n/d with d > 0 and gcd(n, d) = 1. */
export interface Frac {
	n: number;
	d: number;
}
const gcd = (a: number, b: number): number => {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a || 1;
};
export const frac = (n: number, d = 1): Frac => {
	if (d < 0) [n, d] = [-n, -d];
	const g = gcd(n, d);
	return { n: n / g, d: d / g };
};
const fsub = (a: Frac, b: Frac): Frac => frac(a.n * b.d - b.n * a.d, a.d * b.d);
const fmul = (a: Frac, b: Frac): Frac => frac(a.n * b.n, a.d * b.d);
const fdiv = (a: Frac, b: Frac): Frac => frac(a.n * b.d, a.d * b.n);
export const fstr = (a: Frac) => (a.d === 1 ? (a.n < 0 ? '−' + -a.n : String(a.n)) : `${a.n < 0 ? '−' : ''}${Math.abs(a.n)}/${a.d}`);

export interface MatStep {
	/** cell strings, after this step */
	cells: string[][];
	/** numeric values after this step (fractions as numbers) */
	values: number[][];
	/** pivot cell of this step, if any */
	pivot: [number, number] | null;
	rows: number[];
	cols: number[];
	/** finished pivots so far (row, col) */
	done: [number, number][];
	/** one-line description (may contain \( … \) math) */
	note: string;
	/** list of elementary operations performed in this step */
	ops: string[];
	/** original row / column index now sitting at each position */
	rowOrder: number[];
	colOrder: number[];
}

// ── row reduction ───────────────────────────────────────────────────────────

export function rowReduceSteps(M0: number[][], field: Field, rowNames?: string[]): MatStep[] {
	const R = M0.length;
	const Cn = R ? M0[0].length : 0;
	void rowNames;
	const perm = Array.from({ length: R }, (_, i) => i);
	const cperm = Array.from({ length: Cn }, (_, i) => i);
	const A: Frac[][] = M0.map((row) => row.map((x) => (field === 'Z2' ? frac(((x % 2) + 2) % 2) : frac(x))));
	const snap = () => ({
		cells: A.map((row) => row.map(fstr)),
		values: A.map((row) => row.map((x) => x.n / x.d)),
		rowOrder: perm.slice(),
		colOrder: cperm.slice()
	});
	const steps: MatStep[] = [];
	const done: [number, number][] = [];
	steps.push({
		...snap(),
		pivot: null,
		rows: [],
		cols: [],
		done: [],
		note:
			field === 'Z2'
				? 'The matrix with every entry read modulo 2: each \\(-1\\) becomes \\(1\\), because \\(-1 = 1\\) in \\(\\Z/2\\).'
				: 'The matrix over \\(\\Q\\): we may add rational multiples of one row to another.',
		ops: []
	});
	let r = 0;
	for (let c = 0; c < Cn && r < R; c++) {
		// pivot: prefer an entry ±1 (keeps numbers whole), else any non-zero
		let p = -1;
		for (let i = r; i < R; i++) if (A[i][c].n !== 0 && Math.abs(A[i][c].n) === 1 && A[i][c].d === 1) {
			p = i;
			break;
		}
		if (p < 0) for (let i = r; i < R; i++) if (A[i][c].n !== 0) {
			p = i;
			break;
		}
		if (p < 0) continue;
		const ops: string[] = [];
		const touched: number[] = [];
		if (p !== r) {
			[A[p], A[r]] = [A[r], A[p]];
			[perm[p], perm[r]] = [perm[r], perm[p]];
			ops.push(`swap rows ${p + 1} and ${r + 1}`);
			touched.push(p, r);
		}
		for (let i = r + 1; i < R; i++) {
			if (A[i][c].n === 0) continue;
			const f = fdiv(A[i][c], A[r][c]);
			for (let j = c; j < Cn; j++) {
				A[i][j] = fsub(A[i][j], fmul(f, A[r][j]));
				if (field === 'Z2') A[i][j] = frac(((A[i][j].n % 2) + 2) % 2);
			}
			touched.push(i);
			if (field === 'Z2') ops.push(`row ${i + 1} += row ${r + 1}`);
			else if (f.n === f.d) ops.push(`row ${i + 1} −= row ${r + 1}`);
			else if (f.n === -f.d) ops.push(`row ${i + 1} += row ${r + 1}`);
			else ops.push(`row ${i + 1} −= ${fstr(f)}·row ${r + 1}`);
		}
		done.push([r, c]);
		steps.push({
			...snap(),
			pivot: [r, c],
			rows: [...new Set(touched)],
			cols: [c],
			done: done.slice(),
			note: `Pivot ${done.length} in column ${c + 1}: clear every entry below it.`,
			ops
		});
		r++;
	}
	steps.push({
		...snap(),
		pivot: null,
		rows: [],
		cols: [],
		done: done.slice(),
		note: `Echelon form: ${done.length} pivots, so the rank over \\(${field === 'Z2' ? '\\Z/2' : '\\Q'}\\) is \\(${done.length}\\).`,
		ops: []
	});
	return steps;
}

export const rankOfSteps = (s: MatStep[]) => s[s.length - 1].done.length;

// ── Smith normal form over ℤ ─────────────────────────────────────────────────

export interface SmithStepResult {
	steps: MatStep[];
	diagonal: number[];
}

/**
 * The Smith normal form with every operation recorded. One step per pivot:
 * bring the smallest entry to the corner, then clear its row and column by
 * integer row and column operations (repeating until clean), then fix
 * divisibility if needed. Mirrors $lib/math/linalg.smith exactly.
 */
export function smithSteps(M0: number[][]): SmithStepResult {
	const A = M0.map((row) => row.slice());
	const m = A.length;
	const n = m ? A[0].length : 0;
	const diag: number[] = [];
	const steps: MatStep[] = [];
	const done: [number, number][] = [];
	const rperm = Array.from({ length: m }, (_, i) => i);
	const cperm = Array.from({ length: n }, (_, i) => i);
	const snap = () => ({
		cells: A.map((row) => row.map((x) => (x < 0 ? '−' + -x : String(x)))),
		values: A.map((row) => row.slice()),
		rowOrder: rperm.slice(),
		colOrder: cperm.slice()
	});
	steps.push({ ...snap(), pivot: null, rows: [], cols: [], done: [], note: 'The integer matrix. Allowed moves: swap two rows or columns, negate one, add an integer multiple of one row (or column) to another.', ops: [] });

	const swapRows = (i: number, j: number) => {
		const tmp = A[i];
		A[i] = A[j];
		A[j] = tmp;
		[rperm[i], rperm[j]] = [rperm[j], rperm[i]];
	};
	const swapCols = (i: number, j: number) => {
		for (let r = 0; r < m; r++) {
			const tmp = A[r][i];
			A[r][i] = A[r][j];
			A[r][j] = tmp;
		}
		[cperm[i], cperm[j]] = [cperm[j], cperm[i]];
	};
	let t = 0;
	while (t < Math.min(m, n)) {
		const ops: string[] = [];
		const rowsT = new Set<number>();
		const colsT = new Set<number>();
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
		if (bi !== t) {
			swapRows(t, bi);
			ops.push(`swap rows ${t + 1} and ${bi + 1}`);
			rowsT.add(t).add(bi);
		}
		if (bj !== t) {
			swapCols(t, bj);
			ops.push(`swap columns ${t + 1} and ${bj + 1}`);
			colsT.add(t).add(bj);
		}
		for (;;) {
			let clean = true;
			const p = A[t][t];
			for (let i = t + 1; i < m; i++) {
				if (!A[i][t]) continue;
				const q = Math.trunc(A[i][t] / p);
				if (q) {
					for (let j = t; j < n; j++) A[i][j] -= q * A[t][j];
					ops.push(q === 1 ? `row ${i + 1} −= row ${t + 1}` : q === -1 ? `row ${i + 1} += row ${t + 1}` : `row ${i + 1} −= ${q}·row ${t + 1}`);
					rowsT.add(i);
				}
				if (A[i][t]) clean = false;
			}
			for (let j = t + 1; j < n; j++) {
				if (!A[t][j]) continue;
				const q = Math.trunc(A[t][j] / p);
				if (q) {
					for (let i = t; i < m; i++) A[i][j] -= q * A[i][t];
					ops.push(q === 1 ? `col ${j + 1} −= col ${t + 1}` : q === -1 ? `col ${j + 1} += col ${t + 1}` : `col ${j + 1} −= ${q}·col ${t + 1}`);
					colsT.add(j);
				}
				if (A[t][j]) clean = false;
			}
			if (!clean) {
				let sm = Math.abs(A[t][t]);
				let si = t;
				let sj = t;
				for (let i = t + 1; i < m; i++) if (A[i][t] && Math.abs(A[i][t]) < sm) [sm, si, sj] = [Math.abs(A[i][t]), i, t];
				for (let j = t + 1; j < n; j++) if (A[t][j] && Math.abs(A[t][j]) < sm) [sm, si, sj] = [Math.abs(A[t][j]), t, j];
				if (si !== t) {
					swapRows(t, si);
					ops.push(`swap rows ${t + 1} and ${si + 1} (smaller remainder)`);
					rowsT.add(t).add(si);
				}
				if (sj !== t) {
					swapCols(t, sj);
					ops.push(`swap columns ${t + 1} and ${sj + 1} (smaller remainder)`);
					colsT.add(t).add(sj);
				}
				continue;
			}
			let fixed = false;
			for (let i = t + 1; i < m && !fixed; i++)
				for (let j = t + 1; j < n; j++)
					if (A[i][j] % p !== 0) {
						for (let k = t; k < n; k++) A[t][k] += A[i][k];
						ops.push(`row ${t + 1} += row ${i + 1} (divisibility)`);
						rowsT.add(t);
						fixed = true;
						break;
					}
			if (!fixed) break;
		}
		const d = Math.abs(A[t][t]);
		if (A[t][t] < 0) {
			for (let j = t; j < n; j++) A[t][j] = -A[t][j] || 0;
			ops.push(`negate row ${t + 1}`);
			rowsT.add(t);
		}
		diag.push(d);
		done.push([t, t]);
		steps.push({
			...snap(),
			pivot: [t, t],
			rows: [...rowsT],
			cols: [...colsT],
			done: done.slice(),
			note:
				d === 1
					? `Pivot ${t + 1}: a \\(1\\) in the corner, and its row and column cleared.`
					: `Pivot ${t + 1}: the smallest entry left is \\(${d}\\). Integer moves cannot shrink it further: an invariant factor \\(${d}\\).`,
			ops
		});
		t++;
	}
	const ones = diag.filter((d) => d === 1).length;
	const big = diag.filter((d) => d > 1);
	steps.push({
		...snap(),
		pivot: null,
		rows: [],
		cols: [],
		done: done.slice(),
		note:
			`Smith normal form: ${ones} entr${ones === 1 ? 'y' : 'ies'} equal to \\(1\\)` +
			(big.length ? ` and ${big.map((d) => `one \\(${d}\\)`).join(', ')}` : '') +
			`, rank \\(${diag.length}\\).`,
		ops: []
	});
	return { steps, diagonal: diag };
}
