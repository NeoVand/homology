// Every computational claim made in §1.5 "Linear Algebra" is checked here.
import { describe, expect, it } from 'vitest';
import { rankZ2, smith, rankQ, matmul, transpose } from '$lib/math/linalg';
import {
	analyse,
	applyPresses,
	lightsOutMatrix,
	popcount,
	pressMask,
	QUIET_5,
	patternFromRows
} from './lightsout';
import { rowReduce, applyMatrix } from './rowreduce';
import { Frac, fracString } from './fraction';
import { smithSteps, applyIntOp, cokernelTeX, kernelTeX } from './smithsteps';

/** a tiny deterministic PRNG */
function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

describe('Lights Out over 𝔽₂', () => {
	it('the matrix is symmetric (button i affects light j iff button j affects light i)', () => {
		for (let n = 1; n <= 6; n++) {
			const A = lightsOutMatrix(n);
			expect(A).toEqual(transpose(A));
		}
	});

	it('columns of the matrix are the press masks', () => {
		const n = 5;
		const A = lightsOutMatrix(n);
		for (let j = 0; j < 25; j++) {
			let m = 0;
			for (let i = 0; i < 25; i++) if (A[i][j]) m |= 1 << i;
			expect(m).toBe(pressMask(n, j));
		}
	});

	it('nullities for n = 1..9 are 0,0,0,4,2,0,0,0,8', () => {
		const nullities = [];
		for (let n = 1; n <= 9; n++) nullities.push(n * n - rankZ2(lightsOutMatrix(n)));
		expect(nullities).toEqual([0, 0, 0, 4, 2, 0, 0, 0, 8]);
	});

	it('the elimination in lightsout.ts agrees with rankZ2', () => {
		for (let n = 1; n <= 5; n++) {
			const a = analyse(n);
			expect(a.rank).toBe(rankZ2(lightsOutMatrix(n)));
			expect(a.rank + a.nullity).toBe(n * n);
		}
	});

	it('5×5: rank 23, nullity 2, and the quiet patterns are q1, q2, q1+q2', () => {
		const a = analyse(5);
		expect(a.rank).toBe(23);
		expect(a.nullity).toBe(2);
		const { q1, q2 } = QUIET_5;
		expect(applyPresses(5, q1)).toBe(0);
		expect(applyPresses(5, q2)).toBe(0);
		expect(applyPresses(5, q1 ^ q2)).toBe(0);
		expect(q1).not.toBe(0);
		expect(q2).not.toBe(0);
		expect(q1).not.toBe(q2);
		expect(new Set(a.quietPatterns())).toEqual(new Set([0, q1, q2, q1 ^ q2]));
		// q1 + q2 is the pattern of rows 1, 3, 5 with the middle column left out
		expect(q1 ^ q2).toBe(patternFromRows(['11011', '00000', '11011', '00000', '11011']));
		// sizes of the three non-trivial quiet patterns
		expect([popcount(q1), popcount(q2), popcount(q1 ^ q2)]).toEqual([16, 12, 12]);
	});

	it('5×5: exhaustive light-chasing finds exactly 4 quiet patterns', () => {
		// Any press-set is determined by its first row once we demand that the
		// board ends up dark: press (r+1, c) exactly when light (r, c) is still on.
		const n = 5;
		let quiet = 0;
		for (let first = 0; first < 32; first++) {
			let presses = first;
			let board = applyPresses(n, presses);
			for (let r = 0; r < n - 1; r++)
				for (let c = 0; c < n; c++)
					if (board & (1 << (r * n + c))) {
						presses |= 1 << ((r + 1) * n + c);
						board ^= pressMask(n, (r + 1) * n + c);
					}
			if (board === 0) quiet++;
		}
		expect(quiet).toBe(4);
	});

	it('5×5: a board is solvable exactly when it passes the two parity checks', () => {
		const a = analyse(5);
		const { q1, q2 } = QUIET_5;
		// (i) every button press passes both checks, so every reachable board does
		for (let j = 0; j < 25; j++) {
			expect(popcount(pressMask(5, j) & q1) % 2).toBe(0);
			expect(popcount(pressMask(5, j) & q2) % 2).toBe(0);
		}
		// (ii) the two checks are independent, so together they cut out a subspace of
		// dimension 25 − 2 = 23 = rank: the reachable boards are all of it.
		expect(25 - 2).toBe(a.rank);
		// (iii) and a random sample agrees with the solver
		const rand = rng(7);
		let solvable = 0;
		const total = 20000;
		for (let t = 0; t < total; t++) {
			const board = Math.floor(rand() * (1 << 25));
			const passes = popcount(board & q1) % 2 === 0 && popcount(board & q2) % 2 === 0;
			const x = a.solve(board);
			expect(x !== null).toBe(passes);
			if (x !== null) {
				solvable++;
				expect(applyPresses(5, x)).toBe(board);
				const xm = a.solveMinimal(board)!;
				expect(applyPresses(5, xm)).toBe(board);
				expect(popcount(xm)).toBeLessThanOrEqual(popcount(x));
				// all solutions: x + (quiet pattern), exactly 4 of them
				const sols = a.quietPatterns().map((q) => x ^ q);
				expect(new Set(sols).size).toBe(4);
				for (const s of sols) expect(applyPresses(5, s)).toBe(board);
			}
			// the parity readout of the analysis agrees with the explicit checks
			expect(a.parities(board).every((p) => p === 0)).toBe(passes);
		}
		// about a quarter of all boards are solvable
		expect(Math.abs(solvable / total - 0.25)).toBeLessThan(0.02);
	});

	it('5×5: the all-on board is solvable, and its shortest solution uses 15 presses', () => {
		const a = analyse(5);
		const all = (1 << 25) - 1;
		const x = a.solveMinimal(all)!;
		expect(applyPresses(5, x)).toBe(all);
		expect(popcount(x)).toBe(15);
	});

	it('5×5: a single lit corner is not solvable (it fails a parity check)', () => {
		const a = analyse(5);
		expect(a.solve(1)).toBeNull();
		expect(a.parities(1).some((p) => p === 1)).toBe(true);
	});

	it('5×5: a single light can be switched off only at the centre and its four diagonal neighbours', () => {
		const a = analyse(5);
		const ok: number[] = [];
		for (let i = 0; i < 25; i++) if (a.solve(1 << i) !== null) ok.push(i);
		// (1,1), (1,3), (2,2), (3,1), (3,3)
		expect(ok).toEqual([6, 8, 12, 16, 18]);
	});

	it('3×3: every board is solvable, in exactly one way', () => {
		const a = analyse(3);
		expect(a.nullity).toBe(0);
		const seen = new Set<number>();
		for (let presses = 0; presses < 512; presses++) seen.add(applyPresses(3, presses));
		expect(seen.size).toBe(512);
	});

	it('4×4: sixteen quiet patterns (nullity 4)', () => {
		let quiet = 0;
		for (let presses = 0; presses < 1 << 16; presses++) if (applyPresses(4, presses) === 0) quiet++;
		expect(quiet).toBe(16);
		expect(analyse(4).nullity).toBe(4);
	});

	it('2×2: pressing every button except the opposite corner lights a single corner', () => {
		// cells 0 1 / 2 3 ; press 0, 1, 2 → only light 0 is on
		expect(applyPresses(2, 0b0111)).toBe(0b0001);
		expect(analyse(2).nullity).toBe(0);
	});
});

describe('row reduction stepper', () => {
	const toNum = (v: Frac[]) => v.map((x) => x.valueOf());

	it('the worked 3×4 example over ℚ', () => {
		const A = [
			[1, 2, 1, 3],
			[2, 4, 0, 2],
			[3, 6, 1, 5]
		];
		const r = rowReduce(A, 'Q');
		expect(r.rank).toBe(2);
		expect(r.pivotCols).toEqual([0, 2]);
		expect(r.freeCols).toEqual([1, 3]);
		expect(r.rref.map(toNum)).toEqual([
			[1, 2, 0, 1],
			[0, 0, 1, 2],
			[0, 0, 0, 0]
		]);
		expect(r.kernelBasis.map(toNum)).toEqual([
			[-2, 1, 0, 0],
			[-1, 0, -2, 1]
		]);
		for (const k of r.kernelBasis) expect(toNum(applyMatrix(A, k, 'Q'))).toEqual([0, 0, 0]);
		// every intermediate entry is a whole number (the walk-through never needs fractions)
		for (const s of r.steps) for (const row of s.M) for (const x of row) expect(x.d).toBe(1);
		// the steps, in order
		expect(r.steps.map((s) => s.tex)).toEqual([
			'',
			'R_{2} \\leftarrow R_{2} - 2R_{1},\\quad R_{3} \\leftarrow R_{3} - 3R_{1}',
			'',
			'R_{2} \\leftarrow -\\tfrac{1}{2}\\,R_{2}',
			'R_{1} \\leftarrow R_{1} - R_{2},\\quad R_{3} \\leftarrow R_{3} + 2R_{2}',
			'', // column 4: no pivot available
			''
		]);
	});

	it('the 0/1 triangle matrix has rank 3 over ℚ but rank 2 over 𝔽₂', () => {
		const T = [
			[1, 1, 0],
			[1, 0, 1],
			[0, 1, 1]
		];
		expect(rowReduce(T, 'Q').rank).toBe(3);
		const f = rowReduce(T, 'F2');
		expect(f.rank).toBe(2);
		expect(f.kernelBasis.map(toNum)).toEqual([[1, 1, 1]]);
	});

	it('the signed boundary matrix of the triangle has rank 2 and kernel spanned by (1, −1, 1)', () => {
		const D = [
			[-1, -1, 0],
			[1, 0, -1],
			[0, 1, 1]
		];
		const r = rowReduce(D, 'Q');
		expect(r.rank).toBe(2);
		expect(r.kernelBasis.map(toNum)).toEqual([[1, -1, 1]]);
		// over 𝔽₂ the signs vanish and we get the 0/1 matrix again
		expect(rowReduce(D, 'F2').kernelBasis.map(toNum)).toEqual([[1, 1, 1]]);
	});

	it('ranks agree with the shared engine on random matrices, and kernels are kernels', () => {
		const rand = rng(11);
		for (let t = 0; t < 300; t++) {
			const m = 1 + Math.floor(rand() * 5);
			const n = 1 + Math.floor(rand() * 6);
			const A = Array.from({ length: m }, () =>
				Array.from({ length: n }, () => Math.floor(rand() * 7) - 3 + 0)
			);
			const q = rowReduce(A, 'Q');
			expect(q.rank).toBe(rankQ(A));
			expect(q.rank + q.kernelBasis.length).toBe(n);
			for (const k of q.kernelBasis) expect(applyMatrix(A, k, 'Q').every((x) => x.isZero())).toBe(true);
			const f = rowReduce(A, 'F2');
			expect(f.rank).toBe(rankZ2(A));
			for (const k of f.kernelBasis) expect(applyMatrix(A, k, 'F2').every((x) => x.isZero())).toBe(true);
		}
	});

	it('fractions print nicely', () => {
		expect(fracString(-0.5)).toBe('−1/2');
		expect(fracString(2)).toBe('2');
		expect(new Frac(6, -4).toString()).toBe('−3/2');
		expect(new Frac(-1, 2).tex()).toBe('-\\tfrac{1}{2}');
	});
});

describe('Smith normal form stepper', () => {
	const cases: [number[][], number[]][] = [
		[
			[
				[2, 4, 4],
				[-6, 6, 12],
				[10, -4, -16]
			],
			[2, 6, 12]
		],
		[
			[
				[1, 1],
				[1, -1]
			],
			[1, 2]
		],
		[
			[
				[2, 0],
				[0, 3]
			],
			[1, 6]
		],
		[
			[
				[1, 2, 3],
				[4, 5, 6]
			],
			[1, 3]
		],
		[
			[
				[2, 6],
				[4, 8]
			],
			[2, 4]
		],
		[[[2], [0]], [2]],
		[[[2]], [2]],
		[
			[
				[0, 0],
				[0, 0]
			],
			[]
		]
	];

	it('book examples give the expected invariant factors', () => {
		for (const [A, d] of cases) {
			expect(smithSteps(A).diagonal).toEqual(d);
			expect(smith(A).diagonal).toEqual(d);
		}
	});

	it('replaying the recorded integer operations reproduces every step', () => {
		const rand = rng(5);
		const mats = cases.map((c) => c[0]);
		for (let t = 0; t < 300; t++) {
			const m = 1 + Math.floor(rand() * 4);
			const n = 1 + Math.floor(rand() * 5);
			mats.push(Array.from({ length: m }, () => Array.from({ length: n }, () => Math.floor(rand() * 13) - 6 + 0)));
		}
		for (const A of mats) {
			const res = smithSteps(A);
			const M = A.map((r) => r.slice());
			for (const s of res.steps) {
				for (const op of s.ops) applyIntOp(M, op);
				expect(M).toEqual(s.M);
			}
			// final matrix is diagonal, positive, with the divisibility chain
			const F = res.steps[res.steps.length - 1].M;
			F.forEach((row, i) => row.forEach((x, j) => i !== j && expect(x).toBe(0)));
			res.diagonal.forEach((d, i) => {
				expect(d).toBeGreaterThan(0);
				if (i > 0) expect(d % res.diagonal[i - 1]).toBe(0);
			});
			// agrees with the shared engine
			expect(res.diagonal).toEqual(smith(A).diagonal);
			// over 𝔽₂ the rank is the number of odd invariant factors
			expect(rankZ2(A)).toBe(res.diagonal.filter((d) => d % 2 === 1).length);
		}
	});

	it('reading off cokernels and kernels', () => {
		expect(cokernelTeX([2, 6, 12], 3)).toBe('\\mathbb{Z}/2 \\oplus \\mathbb{Z}/6 \\oplus \\mathbb{Z}/12');
		expect(cokernelTeX([1, 2], 2)).toBe('\\mathbb{Z}/2');
		expect(cokernelTeX([2], 2)).toBe('\\mathbb{Z} \\oplus \\mathbb{Z}/2'); // Klein bottle ∂₂ = (2, 0)
		expect(cokernelTeX([1, 3], 2)).toBe('\\mathbb{Z}/3');
		expect(kernelTeX(2, 3)).toBe('\\mathbb{Z}');
	});

	it('the order of the cokernel of a square matrix is |det|', () => {
		expect(2 * 6 * 12).toBe(144);
		const det3 = (M: number[][]) =>
			M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
			M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
			M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
		expect(Math.abs(det3(cases[0][0]))).toBe(144);
		expect(Math.abs(2 * 8 - 6 * 4)).toBe(2 * 4);
	});

	it('(x, y) ↦ (x + y, x − y) reaches exactly the integer pairs with even sum', () => {
		const reach = new Set<string>();
		for (let x = -20; x <= 20; x++) for (let y = -20; y <= 20; y++) reach.add(`${x + y},${x - y}`);
		for (let a = -6; a <= 6; a++)
			for (let b = -6; b <= 6; b++) expect(reach.has(`${a},${b}`)).toBe((a + b) % 2 === 0);
	});

	it('[[1,2,3],[4,5,6]] has kernel spanned by (1, −2, 1)', () => {
		expect(matmul([[1, 2, 3], [4, 5, 6]], [[1], [-2], [1]])).toEqual([[0], [0]]);
	});
});

describe('small facts quoted in the text', () => {
	it('A = [[1,2],[2,4]]: kernel (2,−1), image (1,2), and y = (2,−1) kills the image', () => {
		const A = [
			[1, 2],
			[2, 4]
		];
		expect(matmul(A, [[2], [-1]])).toEqual([[0], [0]]);
		expect(matmul([[2, -1]], A)).toEqual([[0, 0]]);
		expect(rankQ(A)).toBe(1);
	});

	it('the dual basis of (1,0), (1,1) is x − y and y', () => {
		const b = [
			[1, 0],
			[1, 1]
		];
		const dual = [
			[1, -1], // x − y
			[0, 1] // y
		];
		for (let i = 0; i < 2; i++)
			for (let j = 0; j < 2; j++) expect(dual[i][0] * b[j][0] + dual[i][1] * b[j][1]).toBe(i === j ? 1 : 0);
	});

	it('transpose reverses products: (AB)ᵀ = BᵀAᵀ', () => {
		const A = [
			[1, 2, 0],
			[0, 1, 3]
		];
		const B = [
			[2, 1],
			[0, 1],
			[1, 1]
		];
		expect(transpose(matmul(A, B))).toEqual(matmul(transpose(B), transpose(A)));
	});

	it('over 𝔽₂, x+y=1, y+z=0, x+z=1 has exactly the solutions 100 and 011', () => {
		const sols: string[] = [];
		for (let x = 0; x < 2; x++)
			for (let y = 0; y < 2; y++)
				for (let z = 0; z < 2; z++)
					if ((x + y) % 2 === 1 && (y + z) % 2 === 0 && (x + z) % 2 === 1) sols.push(`${x}${y}${z}`);
		expect(sols).toEqual(['011', '100']);
	});

	it('𝔽₂³ modulo {000, 111} has four cosets of two elements each', () => {
		const cosets = new Set<string>();
		for (let v = 0; v < 8; v++) cosets.add([v, v ^ 7].sort().join('|'));
		expect(cosets.size).toBe(4);
	});

	it('every press covers 0 or 2 cells of each 5×5 parity check', () => {
		const checks = [QUIET_5.q2, QUIET_5.q1 ^ QUIET_5.q2];
		// check 1 = columns 1, 3, 5 without the middle row; check 2 = rows 1, 3, 5 without the middle column
		expect(checks[0]).toBe(patternFromRows(['10101', '10101', '00000', '10101', '10101']));
		expect(checks[1]).toBe(patternFromRows(['11011', '00000', '11011', '00000', '11011']));
		for (const q of checks)
			for (let j = 0; j < 25; j++) expect([0, 2]).toContain(popcount(pressMask(5, j) & q));
	});

	it('the 0/1 triangle matrix has invariant factors 1, 1, 2; the signed one 1, 1', () => {
		expect(smith([[1, 1, 0], [1, 0, 1], [0, 1, 1]]).diagonal).toEqual([1, 1, 2]);
		expect(smith([[-1, -1, 0], [1, 0, -1], [0, 1, 1]]).diagonal).toEqual([1, 1]);
	});

	it('exercise answers: dual basis of (2,1), (1,1); the impossible ℤ/2 system; rotation and shear', () => {
		const b = [
			[2, 1],
			[1, 1]
		];
		const dual = [
			[1, -1], // x − y
			[-1, 2] // −x + 2y
		];
		for (let i = 0; i < 2; i++)
			for (let j = 0; j < 2; j++) expect(dual[i][0] * b[j][0] + dual[i][1] * b[j][1]).toBe(i === j ? 1 : 0);
		// (3, 1) = 2·(2, 1) − (1, 1)
		expect([2 * 2 - 1, 2 * 1 - 1]).toEqual([3, 1]);
		// x+y=1, y+z=1, x+z=1 has no solution; with x+z=0 the solutions are 010 and 101
		const sols = (c: number) => {
			const out: string[] = [];
			for (let v = 0; v < 8; v++) {
				const x = (v >> 2) & 1;
				const y = (v >> 1) & 1;
				const z = v & 1;
				if ((x + y) % 2 === 1 && (y + z) % 2 === 1 && (x + z) % 2 === c) out.push(`${x}${y}${z}`);
			}
			return out;
		};
		expect(sols(1)).toEqual([]);
		expect(sols(0)).toEqual(['010', '101']);
		// RS and SR from the text
		const R = [
			[0, -1],
			[1, 0]
		];
		const S = [
			[1, 1],
			[0, 1]
		];
		expect(matmul(R, S)).toEqual([
			[0, -1],
			[1, 1]
		]);
		expect(matmul(S, R)).toEqual([
			[1, -1],
			[1, 0]
		]);
		// the worked product [[1,2],[2,4]]·(3,−1) = (1,2)
		expect(matmul([[1, 2], [2, 4]], [[3], [-1]])).toEqual([[1], [2]]);
	});
});

describe('glossary entries for this chapter', () => {
	it('have unique keys, point at this chapter, and their math compiles', async () => {
		const { entries } = await import('$lib/content/glossary/foundations--linear-algebra');
		const katex = (await import('katex')).default;
		const { katexOptions } = await import('$lib/katex/macros.js');
		expect(entries.length).toBeGreaterThanOrEqual(20);
		expect(entries.length).toBeLessThanOrEqual(35);
		expect(new Set(entries.map((e) => e.key)).size).toBe(entries.length);
		for (const e of entries) {
			expect(e.chapter).toBe('foundations/linear-algebra');
			expect(e.key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
			for (const m of e.def.matchAll(/\\\((.+?)\\\)/g)) {
				expect(() => katex.renderToString(m[1], { ...katexOptions, throwOnError: true })).not.toThrow();
			}
		}
	});
});
