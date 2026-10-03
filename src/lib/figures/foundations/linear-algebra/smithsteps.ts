// The Smith normal form, one human-sized step at a time.
//
// Only operations that are invertible over ℤ are used:
//   swap two rows (or columns), multiply a row (or column) by −1,
//   add an integer multiple of one row (column) to another.
// The final diagonal is checked against the shared `smith` in the tests.

export type IntOp =
	| { kind: 'swapRows'; i: number; j: number }
	| { kind: 'swapCols'; i: number; j: number }
	| { kind: 'negRow'; i: number }
	| { kind: 'negCol'; i: number }
	| { kind: 'addRow'; target: number; source: number; k: number } // R_target ← R_target + k·R_source
	| { kind: 'addCol'; target: number; source: number; k: number }; // C_target ← C_target + k·C_source

export interface SnfStep {
	/** the matrix after this step */
	M: number[][];
	ops: IntOp[];
	/** TeX for the operations */
	tex: string;
	/** plain-language explanation */
	note: string;
	/** current pivot position, if any */
	pivot: [number, number] | null;
	/** how many diagonal entries are final after this step */
	done: number;
	rowsChanged: number[];
	colsChanged: number[];
}

export interface SnfResult {
	steps: SnfStep[];
	/** the non-zero diagonal entries d₁ | d₂ | … (positive) */
	diagonal: number[];
	rows: number;
	cols: number;
}

export function applyIntOp(M: number[][], op: IntOp): void {
	const m = M.length;
	switch (op.kind) {
		case 'swapRows': {
			const t = M[op.i];
			M[op.i] = M[op.j];
			M[op.j] = t;
			break;
		}
		case 'swapCols':
			for (let r = 0; r < m; r++) {
				const t = M[r][op.i];
				M[r][op.i] = M[r][op.j];
				M[r][op.j] = t;
			}
			break;
		case 'negRow':
			M[op.i] = M[op.i].map((x) => -x + 0);
			break;
		case 'negCol':
			for (let r = 0; r < m; r++) M[r][op.i] = -M[r][op.i] + 0;
			break;
		case 'addRow':
			M[op.target] = M[op.target].map((x, j) => x + op.k * M[op.source][j]);
			break;
		case 'addCol':
			for (let r = 0; r < m; r++) M[r][op.target] += op.k * M[r][op.source];
			break;
	}
}

function lin(target: string, source: string, k: number): string {
	if (k === 0) return `${target} \\leftarrow ${target}`;
	const a = Math.abs(k);
	return `${target} \\leftarrow ${target} ${k < 0 ? '-' : '+'} ${a === 1 ? '' : a}${source}`;
}

export function intOpTeX(op: IntOp): string {
	const R = (i: number) => `R_{${i + 1}}`;
	const C = (i: number) => `C_{${i + 1}}`;
	switch (op.kind) {
		case 'swapRows':
			return `${R(op.i)} \\leftrightarrow ${R(op.j)}`;
		case 'swapCols':
			return `${C(op.i)} \\leftrightarrow ${C(op.j)}`;
		case 'negRow':
			return `${R(op.i)} \\leftarrow -${R(op.i)}`;
		case 'negCol':
			return `${C(op.i)} \\leftarrow -${C(op.i)}`;
		case 'addRow':
			return lin(R(op.target), R(op.source), op.k);
		case 'addCol':
			return lin(C(op.target), C(op.source), op.k);
	}
}

/** Smith normal form with a record of every step. */
export function smithSteps(A0: number[][]): SnfResult {
	const M = A0.map((r) => r.slice());
	const m = M.length;
	const n = m ? M[0].length : 0;
	const steps: SnfStep[] = [];
	let done = 0;

	const push = (ops: IntOp[], note: string, pivot: [number, number] | null) => {
		for (const op of ops) applyIntOp(M, op);
		const rows = new Set<number>();
		const cols = new Set<number>();
		for (const op of ops) {
			if (op.kind === 'swapRows') rows.add(op.i).add(op.j);
			else if (op.kind === 'negRow') rows.add(op.i);
			else if (op.kind === 'addRow') rows.add(op.target);
			else if (op.kind === 'swapCols') cols.add(op.i).add(op.j);
			else if (op.kind === 'negCol') cols.add(op.i);
			else cols.add(op.target);
		}
		steps.push({
			M: M.map((r) => r.slice()),
			ops,
			tex: ops.map(intOpTeX).join(',\\quad '),
			note,
			pivot,
			done,
			rowsChanged: [...rows].sort((a, b) => a - b),
			colsChanged: [...cols].sort((a, b) => a - b)
		});
	};

	push([], 'The starting integer matrix. Only integer row and column operations are allowed: no dividing.', null);

	const smallestInBlock = (t: number) => {
		let best = 0;
		let bi = -1;
		let bj = -1;
		for (let i = t; i < m; i++)
			for (let j = t; j < n; j++) {
				const v = Math.abs(M[i][j]);
				if (v && (!best || v < best)) [best, bi, bj] = [v, i, j];
			}
		return { bi, bj };
	};

	const moveTo = (t: number, i: number, j: number, why: string) => {
		const ops: IntOp[] = [];
		if (i !== t) ops.push({ kind: 'swapRows', i: t, j: i });
		if (j !== t) ops.push({ kind: 'swapCols', i: t, j: j });
		if (ops.length) push(ops, why, [t, t]);
	};

	for (let t = 0; t < Math.min(m, n); t++) {
		const { bi, bj } = smallestInBlock(t);
		if (bi === -1) break; // the rest is all zero
		moveTo(t, bi, bj, `Bring the smallest non-zero entry (in size), ${M[bi][bj]}, to the pivot position.`);

		let guard = 0;
		for (;;) {
			if (++guard > 200) throw new Error('Smith steps did not terminate');
			const p = M[t][t];
			// clear the column below the pivot using division with remainder
			const rowOps: IntOp[] = [];
			for (let i = t + 1; i < m; i++) {
				const q = Math.trunc(M[i][t] / p);
				if (q) rowOps.push({ kind: 'addRow', target: i, source: t, k: -q });
			}
			if (rowOps.length) {
				push(
					rowOps,
					`Clear column ${t + 1} below the pivot ${p}: subtract whole-number multiples of row ${t + 1}. (Only exact multiples are allowed, so a remainder may be left.)`,
					[t, t]
				);
			}
			const colOps: IntOp[] = [];
			for (let j = t + 1; j < n; j++) {
				const q = Math.trunc(M[t][j] / p);
				if (q) colOps.push({ kind: 'addCol', target: j, source: t, k: -q });
			}
			if (colOps.length) {
				push(
					colOps,
					`Clear row ${t + 1} to the right of the pivot: subtract whole-number multiples of column ${t + 1}.`,
					[t, t]
				);
			}
			// any remainders left in the pivot's row or column?
			let sm = 0;
			let si = -1;
			let sj = -1;
			for (let i = t + 1; i < m; i++)
				if (M[i][t] && (!sm || Math.abs(M[i][t]) < sm)) [sm, si, sj] = [Math.abs(M[i][t]), i, t];
			for (let j = t + 1; j < n; j++)
				if (M[t][j] && (!sm || Math.abs(M[t][j]) < sm)) [sm, si, sj] = [Math.abs(M[t][j]), t, j];
			if (si !== -1) {
				moveTo(
					t,
					si,
					sj,
					`A remainder ${M[si][sj]} is left over, smaller than the pivot. It becomes the new pivot, and we clear again.`
				);
				continue;
			}
			// divisibility: the pivot must divide everything still to come
			let bad: [number, number] | null = null;
			for (let i = t + 1; i < m && !bad; i++)
				for (let j = t + 1; j < n; j++)
					if (M[i][j] % p !== 0) {
						bad = [i, j];
						break;
					}
			if (bad) {
				push(
					[{ kind: 'addRow', target: t, source: bad[0], k: 1 }],
					`The pivot ${p} does not divide ${M[bad[0]][bad[1]]}. Add row ${bad[0] + 1} to row ${t + 1} to bring that entry into the pivot's row, then clear again.`,
					[t, t]
				);
				continue;
			}
			break;
		}
		if (M[t][t] < 0) {
			done = t + 1;
			push([{ kind: 'negRow', i: t }], `Multiply row ${t + 1} by −1 so that the diagonal entry is positive. It is now final.`, [t, t]);
		} else {
			done = t + 1;
			if (steps.length) {
				const last = steps[steps.length - 1];
				last.done = done;
			}
		}
	}

	const diagonal: number[] = [];
	for (let t = 0; t < Math.min(m, n); t++) if (M[t][t]) diagonal.push(M[t][t]);
	push(
		[],
		`Smith normal form reached: the diagonal is ${diagonal.join(', ') || 'empty'}${diagonal.length > 1 ? ', and each entry divides the next' : ''}.`,
		null
	);
	steps[steps.length - 1].done = diagonal.length;

	return { steps, diagonal, rows: m, cols: n };
}

/** TeX for the cokernel ℤ^m / im A read off from the Smith form, e.g. "\Z \oplus \Z/2". */
export function cokernelTeX(diagonal: number[], rows: number): string {
	const free = rows - diagonal.length;
	const parts: string[] = [];
	if (free === 1) parts.push('\\mathbb{Z}');
	else if (free > 1) parts.push(`\\mathbb{Z}^{${free}}`);
	for (const d of diagonal) if (d > 1) parts.push(`\\mathbb{Z}/${d}`);
	return parts.length ? parts.join(' \\oplus ') : '0';
}

/** TeX for the kernel ℤ^(n − r). */
export function kernelTeX(rank: number, cols: number): string {
	const k = cols - rank;
	return k === 0 ? '0' : k === 1 ? '\\mathbb{Z}' : `\\mathbb{Z}^{${k}}`;
}
