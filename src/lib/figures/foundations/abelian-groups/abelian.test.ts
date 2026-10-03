import { describe, expect, it } from 'vitest';
import { smith } from '$lib/math/linalg';
import { snfFull, matmul, presented, groupTeX, latticeQuotient, inSpan, det2, type Matrix } from './snf';
import { gcd, lcm, mod } from '../groups/zn';
import { mulberry32 } from '$lib/math/persistence';

function det(M: Matrix): number {
	if (M.length === 1) return M[0][0];
	if (M.length === 2) return det2(M);
	let s = 0;
	for (let j = 0; j < M.length; j++) {
		const minor = M.slice(1).map((r) => r.filter((_, c) => c !== j));
		s += (j % 2 ? -1 : 1) * M[0][j] * det(minor);
	}
	return s;
}

describe('Smith normal form with transforms', () => {
	it('agrees with the shared smith() and satisfies U·A·V = D with unimodular U, V', () => {
		const rnd = mulberry32(7);
		for (let trial = 0; trial < 400; trial++) {
			const m = 1 + Math.floor(rnd() * 3);
			const k = 1 + Math.floor(rnd() * 3);
			const A = Array.from({ length: m }, () => Array.from({ length: k }, () => Math.floor(rnd() * 15) - 7));
			const r = snfFull(A);
			expect(r.diag).toEqual(smith(A).diagonal);
			const P = matmul(matmul(r.U, A), r.V);
			expect(P).toEqual(r.D);
			for (let i = 0; i < m; i++)
				for (let j = 0; j < k; j++) if (i !== j || i >= r.rank) expect(r.D[i][j]).toBe(0);
			for (let i = 0; i + 1 < r.diag.length; i++) expect(r.diag[i + 1] % r.diag[i]).toBe(0);
			expect(Math.abs(det(r.U))).toBe(1);
			expect(Math.abs(det(r.V))).toBe(1);
			// the recorded steps end at D
			expect(r.steps[r.steps.length - 1].M).toEqual(r.D);
		}
	});

	it('reproduces the computations quoted in the chapter', () => {
		const name = (A: Matrix) => {
			const g = presented(A);
			return groupTeX(g.free, g.torsion);
		};
		// ℤ²/⟨(2,1),(1,2)⟩ ≅ ℤ/3
		expect(name([[2, 1], [1, 2]])).toBe('\\mathbb{Z}/3');
		// ℤ²/⟨(2,0),(0,2)⟩ ≅ ℤ/2 ⊕ ℤ/2
		expect(name([[2, 0], [0, 2]])).toBe('\\mathbb{Z}/2 \\oplus \\mathbb{Z}/2');
		// ℤ²/⟨(2,0),(0,3)⟩ ≅ ℤ/6
		expect(name([[2, 0], [0, 3]])).toBe('\\mathbb{Z}/6');
		// ℤ²/⟨(2,2)⟩ ≅ ℤ ⊕ ℤ/2
		expect(name([[2], [2]])).toBe('\\mathbb{Z} \\oplus \\mathbb{Z}/2');
		// ℤ²/⟨(1,1)⟩ ≅ ℤ
		expect(name([[1], [1]])).toBe('\\mathbb{Z}');
		// ℤ²/⟨(2,4),(6,8)⟩ ≅ ℤ/2 ⊕ ℤ/4
		expect(name([[2, 6], [4, 8]])).toBe('\\mathbb{Z}/2 \\oplus \\mathbb{Z}/4');
		// ℤ/12 ⊕ ℤ/18 ≅ ℤ/6 ⊕ ℤ/36
		expect(name([[12, 0], [0, 18]])).toBe('\\mathbb{Z}/6 \\oplus \\mathbb{Z}/36');
		// the 3×3 example: invariant factors 2, 6, 12
		expect(snfFull([[2, 4, 4], [-6, 6, 12], [10, -4, -16]]).diag).toEqual([2, 6, 12]);
		// Klein bottle H₁: generators a, b, relation 2a = 0
		expect(name([[2], [0]])).toBe('\\mathbb{Z} \\oplus \\mathbb{Z}/2');
		// torus H₁: relation a + b − a − b = 0, the zero column
		expect(name([[0], [0]])).toBe('\\mathbb{Z}^{2}');
		// ℝP² H₁: one generator, relation 2a = 0
		expect(name([[2]])).toBe('\\mathbb{Z}/2');
		// ℤ/4 ⊕ ℤ/6 ≅ ℤ/2 ⊕ ℤ/12
		expect(name([[4, 0], [0, 6]])).toBe('\\mathbb{Z}/2 \\oplus \\mathbb{Z}/12');
		// a presentation with a redundant generator: ⟨a, b | a − 2b = 0⟩ ≅ ℤ
		expect(name([[1], [-2]])).toBe('\\mathbb{Z}');
	});

	it('the worked example (2,1),(1,2) is diagonalised as in the text', () => {
		const r = snfFull([
			[2, 1],
			[1, 2]
		]);
		expect(r.D).toEqual([
			[1, 0],
			[0, 3]
		]);
	});
});

describe('lattice quotients ℤ²/⟨v, w⟩', () => {
	const cases: [[number, number], [number, number], string, number][] = [
		[[2, 1], [1, 2], '\\mathbb{Z}/3', 3],
		[[2, 0], [0, 2], '\\mathbb{Z}/2 \\oplus \\mathbb{Z}/2', 4],
		[[2, 0], [0, 3], '\\mathbb{Z}/6', 6],
		[[3, 1], [1, 2], '\\mathbb{Z}/5', 5],
		[[2, 2], [4, 4], '\\mathbb{Z} \\oplus \\mathbb{Z}/2', Infinity],
		[[2, 1], [4, 2], '\\mathbb{Z}', Infinity],
		[[1, 0], [0, 1], '0', 1]
	];
	it('names the quotient and its index', () => {
		for (const [v, w, tex, index] of cases) {
			const q = latticeQuotient(v, w);
			expect(q.tex).toBe(tex);
			expect(q.index).toBe(index);
		}
	});
	it('coset coordinates agree exactly when the difference lies in the sublattice', () => {
		for (const [v, w] of cases) {
			const q = latticeQuotient(v, w);
			const pts: [number, number][] = [];
			for (let x = -4; x <= 4; x++) for (let y = -4; y <= 4; y++) pts.push([x, y]);
			for (const p of pts)
				for (const r of pts) {
					const same = q.coords(...p).join() === q.coords(...r).join();
					expect(same).toBe(inSpan([p[0] - r[0], p[1] - r[1]], v, w));
				}
		}
	});
	it('a fundamental parallelogram contains exactly |det| lattice points', () => {
		for (const [v, w, , index] of cases) {
			if (!isFinite(index)) continue;
			const D = det2([
				[v[0], w[0]],
				[v[1], w[1]]
			]);
			let count = 0;
			const B = 12;
			for (let x = -B; x <= B; x++)
				for (let y = -B; y <= B; y++) {
					const s = (x * w[1] - y * w[0]) / D;
					const t = (v[0] * y - v[1] * x) / D;
					if (s >= 0 && s < 1 && t >= 0 && t < 1) count++;
				}
			expect(count).toBe(index);
		}
	});
});

describe('direct sums and exactness facts used in the text', () => {
	it('ℤ/m ⊕ ℤ/n is cyclic exactly when gcd(m, n) = 1 (the element (1,1) has order lcm)', () => {
		for (let m = 1; m <= 9; m++)
			for (let n = 1; n <= 9; n++) {
				// order of (1,1)
				let k = 1;
				while (k % m !== 0 || k % n !== 0) k++;
				expect(k).toBe(lcm(m, n));
				// the largest order of any element is lcm(m, n), so cyclic iff lcm = mn
				let maxOrd = 0;
				for (let a = 0; a < m; a++)
					for (let b = 0; b < n; b++) {
						let o = 1;
						while (mod(o * a, m) !== 0 || mod(o * b, n) !== 0) o++;
						maxOrd = Math.max(maxOrd, o);
					}
				expect(maxOrd === m * n).toBe(gcd(m, n) === 1);
			}
	});
	it('ℤ/n --×a--> ℤ/n --×b--> ℤ/n: im = ker exactly when the ratio is 1', () => {
		for (const n of [4, 6, 8, 12])
			for (let a = 0; a < n; a++)
				for (let b = 0; b < n; b++) {
					if ((a * b) % n !== 0) continue;
					const im = new Set(Array.from({ length: n }, (_, x) => (a * x) % n));
					const ker = Array.from({ length: n }, (_, x) => x).filter((x) => (b * x) % n === 0);
					for (const y of im) expect(ker).toContain(y); // im ⊆ ker because ab ≡ 0
					expect(ker.length % im.size).toBe(0);
					expect(ker.length / im.size).toBe((gcd(a, n) * gcd(b, n)) / n);
				}
	});
	it('the example ℤ/8 --×4--> ℤ/8 --×4--> ℤ/8 leaves ker/im ≅ ℤ/2, and ×2 then ×2 on ℤ/4 is exact', () => {
		expect((gcd(4, 8) * gcd(4, 8)) / 8).toBe(2);
		expect((gcd(2, 4) * gcd(2, 4)) / 4).toBe(1);
	});
});
