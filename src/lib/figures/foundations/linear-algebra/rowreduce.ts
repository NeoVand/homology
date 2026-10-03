// Step-by-step Gauss–Jordan elimination, exactly, over ℚ or over 𝔽₂ = ℤ/2.
// Each step records the matrix after the step, the row operations performed
// (as TeX), and which cells/rows to highlight — ready for a stepper figure.
import { Frac } from './fraction';

export type Field = 'Q' | 'F2';

export type RowOp =
	| { kind: 'swap'; i: number; j: number }
	| { kind: 'scale'; i: number; c: Frac }
	| { kind: 'add'; target: number; source: number; c: Frac };

export interface RRStep {
	/** the matrix after this step (exact) */
	M: Frac[][];
	/** row operations performed in this step */
	ops: RowOp[];
	/** TeX for the operations, e.g. "R_2 \leftarrow R_2 - 2R_1" */
	tex: string;
	/** a plain-language explanation of the step */
	note: string;
	/** the column being worked on */
	col: number | null;
	/** the pivot cell being used, if any */
	pivot: [number, number] | null;
	/** pivot cells found so far, including this step's */
	pivots: [number, number][];
	/** rows changed by this step */
	changed: number[];
}

export interface RRResult {
	field: Field;
	steps: RRStep[];
	rref: Frac[][];
	rank: number;
	pivotCols: number[];
	freeCols: number[];
	/** one kernel vector per free column (the standard basis of the null space) */
	kernelBasis: Frac[][];
}

const sub = (k: number) => `R_{${k + 1}}`;

function reduceEntry(x: Frac, field: Field): Frac {
	if (field === 'Q') return x;
	if (x.d !== 1) throw new Error('𝔽₂ entries must be integers');
	return new Frac(((x.n % 2) + 2) % 2);
}

function opTeX(op: RowOp, field: Field): string {
	if (op.kind === 'swap') return `${sub(op.i)} \\leftrightarrow ${sub(op.j)}`;
	if (op.kind === 'scale') {
		const c = op.c;
		if (c.eq(new Frac(-1))) return `${sub(op.i)} \\leftarrow -${sub(op.i)}`;
		return `${sub(op.i)} \\leftarrow ${c.tex()}\\,${sub(op.i)}`;
	}
	// add: target ← target + c·source; print as "+ c R" or "− |c| R"
	const c = op.c;
	if (field === 'F2') return `${sub(op.target)} \\leftarrow ${sub(op.target)} + ${sub(op.source)}`;
	const neg = c.n < 0;
	const a = neg ? c.neg() : c;
	const coef = a.isOne() ? '' : a.tex();
	return `${sub(op.target)} \\leftarrow ${sub(op.target)} ${neg ? '-' : '+'} ${coef}${sub(op.source)}`;
}

/**
 * Row-reduce A (integers) to reduced row echelon form over the given field,
 * recording every step.
 */
export function rowReduce(A: number[][], field: Field): RRResult {
	const m = A.length;
	const n = m ? A[0].length : 0;
	let M: Frac[][] = A.map((row) => row.map((x) => reduceEntry(new Frac(x), field)));
	const zero = new Frac(0);
	const one = new Frac(1);
	const steps: RRStep[] = [];
	const pivots: [number, number][] = [];

	const snapshot = () => M.map((r) => r.slice());
	const mod2 = (x: Frac) => reduceEntry(x, field);

	const apply = (op: RowOp) => {
		if (op.kind === 'swap') {
			const t = M[op.i];
			M[op.i] = M[op.j];
			M[op.j] = t;
		} else if (op.kind === 'scale') {
			M[op.i] = M[op.i].map((x) => mod2(x.mul(op.c)));
		} else {
			M[op.target] = M[op.target].map((x, k) => mod2(x.add(op.c.mul(M[op.source][k]))));
		}
	};

	const push = (ops: RowOp[], note: string, col: number | null, pivot: [number, number] | null) => {
		for (const op of ops) apply(op);
		const changed = new Set<number>();
		for (const op of ops) {
			if (op.kind === 'swap') changed.add(op.i).add(op.j);
			else if (op.kind === 'scale') changed.add(op.i);
			else changed.add(op.target);
		}
		steps.push({
			M: snapshot(),
			ops,
			tex: ops.map((o) => opTeX(o, field)).join(',\\quad '),
			note,
			col,
			pivot,
			pivots: pivots.map((p) => [p[0], p[1]] as [number, number]),
			changed: [...changed].sort((a, b) => a - b)
		});
	};

	push(
		[],
		field === 'F2'
			? 'The starting matrix, read over ℤ/2: every entry is 0 or 1, and −1 = 1, so signs disappear.'
			: 'The starting matrix. We sweep the columns from left to right, looking for pivots.',
		null,
		null
	);

	let row = 0;
	for (let col = 0; col < n && row < m; col++) {
		// find a pivot: the first non-zero entry at or below `row` in this column
		let p = -1;
		for (let i = row; i < m; i++)
			if (!M[i][col].isZero()) {
				p = i;
				break;
			}
		if (p === -1) {
			push(
				[],
				`Column ${col + 1} has no non-zero entry in the rows still available, so it gets no pivot: x${subDigit(col + 1)} will be a free variable.`,
				col,
				null
			);
			continue;
		}
		if (p !== row) {
			push(
				[{ kind: 'swap', i: row, j: p }],
				`Column ${col + 1}: the entry in row ${row + 1} is 0, so swap in row ${p + 1}, which has a non-zero entry.`,
				col,
				[row, col]
			);
		}
		const pv = M[row][col];
		if (!pv.isOne()) {
			// over ℤ/2 the only non-zero number is 1, so this branch is for ℚ only
			push(
				[{ kind: 'scale', i: row, c: one.div(pv) }],
				`Divide row ${row + 1} by ${pv.toString()} so that the pivot becomes 1.`,
				col,
				[row, col]
			);
		}
		pivots.push([row, col]);
		const ops: RowOp[] = [];
		for (let i = 0; i < m; i++) {
			if (i === row || M[i][col].isZero()) continue;
			ops.push({ kind: 'add', target: i, source: row, c: field === 'F2' ? one : M[i][col].neg() });
		}
		if (ops.length) {
			push(
				ops,
				field === 'F2'
					? `Pivot in row ${row + 1}, column ${col + 1}. Add row ${row + 1} to every other row with a 1 in this column (over ℤ/2, adding and subtracting are the same).`
					: `Pivot in row ${row + 1}, column ${col + 1}. Subtract multiples of row ${row + 1} to make every other entry in the column 0.`,
				col,
				[row, col]
			);
		} else {
			push([], `Pivot in row ${row + 1}, column ${col + 1}; the rest of the column is already 0.`, col, [row, col]);
		}
		row++;
	}

	const pivotCols = pivots.map((p) => p[1]);
	const freeCols: number[] = [];
	for (let j = 0; j < n; j++) if (!pivotCols.includes(j)) freeCols.push(j);

	// kernel basis: set one free variable to 1, the others to 0, solve for pivots
	const kernelBasis = freeCols.map((f) => {
		const x = new Array<Frac>(n).fill(zero);
		x[f] = one;
		pivots.forEach(([r, c]) => {
			x[c] = mod2(M[r][f].neg());
		});
		return x;
	});

	push(
		[],
		`Done: this is the reduced row echelon form. ${pivots.length} pivot${pivots.length === 1 ? '' : 's'}, so the rank is ${pivots.length}.`,
		null,
		null
	);

	return { field, steps, rref: M, rank: pivots.length, pivotCols, freeCols, kernelBasis };
}

function subDigit(k: number): string {
	return String(k)
		.split('')
		.map((d) => '₀₁₂₃₄₅₆₇₈₉'[+d])
		.join('');
}

/** Multiply an integer matrix by an exact vector, reducing mod 2 over 𝔽₂. */
export function applyMatrix(A: number[][], x: Frac[], field: Field): Frac[] {
	return A.map((row) => {
		let s = new Frac(0);
		row.forEach((a, j) => (s = s.add(new Frac(a).mul(x[j]))));
		return reduceEntry(s, field);
	});
}
