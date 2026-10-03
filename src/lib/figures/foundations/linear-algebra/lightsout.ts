// Lights Out as linear algebra over 𝔽₂ = ℤ/2.
//
// A board of n×n lights is a vector in 𝔽₂^(n²); so is a set of button presses.
// Cell (r, c) has index r·n + c, and a vector is stored as a bitmask (bit i =
// cell i), which is plenty for the boards in the book (n ≤ 5, 25 bits).
// Pressing button j toggles light j and its orthogonal neighbours, so the
// effect of a set of presses x is A·x, where column j of A is that "plus" shape.

export const MAX_N = 5;

/** Number of set bits. */
export function popcount(x: number): number {
	let c = 0;
	while (x) {
		x &= x - 1;
		c++;
	}
	return c;
}

/** Indices of the set bits, ascending. */
export function bits(x: number): number[] {
	const out: number[] = [];
	for (let i = 0; x; i++, x >>>= 1) if (x & 1) out.push(i);
	return out;
}

/** The lights toggled by pressing button i: column i of the matrix A. */
export function pressMask(n: number, i: number): number {
	const r = Math.floor(i / n);
	const c = i % n;
	let m = 1 << i;
	if (r > 0) m |= 1 << (i - n);
	if (r < n - 1) m |= 1 << (i + n);
	if (c > 0) m |= 1 << (i - 1);
	if (c < n - 1) m |= 1 << (i + 1);
	return m;
}

/** Board produced from all-off by pressing every button in the set `presses`. */
export function applyPresses(n: number, presses: number): number {
	let board = 0;
	for (const j of bits(presses)) board ^= pressMask(n, j);
	return board;
}

/** The n²×n² Lights Out matrix over 𝔽₂: A[i][j] = 1 when button j toggles light i. */
export function lightsOutMatrix(n: number): number[][] {
	const N = n * n;
	const A = Array.from({ length: N }, () => new Array<number>(N).fill(0));
	for (let i = 0; i < N; i++)
		for (let j = 0; j < N; j++) {
			const ri = Math.floor(i / n);
			const ci = i % n;
			const rj = Math.floor(j / n);
			const cj = j % n;
			if (Math.abs(ri - rj) + Math.abs(ci - cj) <= 1) A[i][j] = 1;
		}
	return A;
}

export interface LightsOutAnalysis {
	n: number;
	cells: number;
	/** dimension of the image: how many independent boards the buttons can make */
	rank: number;
	/** dimension of the kernel: independent quiet patterns */
	nullity: number;
	/** a basis of the kernel (quiet patterns), as press-bitmasks */
	kernel: number[];
	/** a set of presses that turns the board off, or null if impossible */
	solve(board: number): number | null;
	/** the solution with the fewest presses (null if unsolvable) */
	solveMinimal(board: number): number | null;
	/** parity of the number of lit lights inside each quiet pattern (0 = passes) */
	parities(board: number): number[];
	/** every element of the kernel (2^nullity of them, including 0) */
	quietPatterns(): number[];
}

/**
 * Gaussian elimination over 𝔽₂ on the columns of A, keeping track of which
 * presses produce each reduced column. Columns that reduce to zero give
 * kernel vectors; the surviving reduced columns span the image.
 */
export function analyse(n: number): LightsOutAnalysis {
	if (n < 1 || n > MAX_N) throw new Error(`board size ${n} not supported`);
	const N = n * n;
	// pivot (highest set bit of a reduced column) → [reduced column, presses that make it]
	const basis = new Map<number, [number, number]>();
	const kernel: number[] = [];
	const high = (v: number) => 31 - Math.clz32(v);

	for (let j = 0; j < N; j++) {
		let v = pressMask(n, j);
		let comb = 1 << j;
		while (v && basis.has(high(v))) {
			const [bv, bc] = basis.get(high(v))!;
			v ^= bv;
			comb ^= bc;
		}
		if (v) basis.set(high(v), [v, comb]);
		else kernel.push(comb);
	}

	const solve = (board: number): number | null => {
		let v = board;
		let comb = 0;
		while (v) {
			const h = high(v);
			const b = basis.get(h);
			if (!b) return null; // a light that no combination of reduced columns can reach
			v ^= b[0];
			comb ^= b[1];
		}
		return comb;
	};

	const quietPatterns = (): number[] => {
		const out: number[] = [];
		for (let s = 0; s < 1 << kernel.length; s++) {
			let q = 0;
			for (let k = 0; k < kernel.length; k++) if (s & (1 << k)) q ^= kernel[k];
			out.push(q);
		}
		return out;
	};

	const solveMinimal = (board: number): number | null => {
		const x0 = solve(board);
		if (x0 === null) return null;
		let best = x0;
		for (const q of quietPatterns()) {
			const x = x0 ^ q;
			if (popcount(x) < popcount(best)) best = x;
		}
		return best;
	};

	return {
		n,
		cells: N,
		rank: basis.size,
		nullity: kernel.length,
		kernel,
		solve,
		solveMinimal,
		parities: (board: number) => kernel.map((q) => popcount(board & q) & 1),
		quietPatterns
	};
}

/**
 * For the 5×5 board, the two quiet patterns usually drawn in books: together with
 * their sum they are the three non-trivial press-sets that change nothing.
 */
export function patternFromRows(rows: string[]): number {
	let m = 0;
	rows.forEach((row, r) =>
		row
			.replace(/\s+/g, '')
			.split('')
			.forEach((ch, c) => {
				if (ch === '1') m |= 1 << (r * rows.length + c);
			})
	);
	return m;
}

export const QUIET_5 = {
	q1: patternFromRows(['01110', '10101', '11011', '10101', '01110']),
	q2: patternFromRows(['10101', '10101', '00000', '10101', '10101'])
};
