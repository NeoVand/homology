import { describe, expect, it } from 'vitest';
import {
	checkReflexive,
	checkSymmetric,
	checkTransitive,
	classesOf,
	emptyRelation,
	equivalenceClosure,
	fromPredicate,
	isEquivalence,
	mod,
	necklaceClasses,
	rotate4,
	rules,
	checkRule
} from './relations';

// elements 0..3 stand for 1..4 in the chapter
describe('relation axioms (the non-examples of §1.2 fail exactly one axiom)', () => {
	it('≤ is reflexive and transitive but not symmetric', () => {
		const M = fromPredicate(4, (i, j) => i <= j);
		expect(checkReflexive(M).ok).toBe(true);
		expect(checkTransitive(M).ok).toBe(true);
		expect(checkSymmetric(M).ok).toBe(false);
	});
	it('|x − y| ≤ 1 is reflexive and symmetric but not transitive', () => {
		const M = fromPredicate(4, (i, j) => Math.abs(i - j) <= 1);
		expect(checkReflexive(M).ok).toBe(true);
		expect(checkSymmetric(M).ok).toBe(true);
		const t = checkTransitive(M);
		expect(t.ok).toBe(false);
		const [a, b, c] = t.bad!;
		expect(M[a][b] && M[b][c] && !M[a][c]).toBe(true);
	});
	it('{(1,1)} on {1,2} is symmetric and transitive but not reflexive', () => {
		const M = emptyRelation(2);
		M[0][0] = true;
		expect(checkSymmetric(M).ok).toBe(true);
		expect(checkTransitive(M).ok).toBe(true);
		expect(checkReflexive(M)).toEqual({ ok: false, missing: [1] });
	});
	it('xy > 0 on a sample of reals is symmetric and transitive, not reflexive (fails only at 0)', () => {
		const xs = [-2, -1, 0, 1, 3];
		const M = fromPredicate(xs.length, (i, j) => xs[i] * xs[j] > 0);
		expect(checkSymmetric(M).ok).toBe(true);
		expect(checkTransitive(M).ok).toBe(true);
		expect(checkReflexive(M).missing).toEqual([2]);
	});
	it('the empty relation on a non-empty set is symmetric and transitive but not reflexive', () => {
		const M = emptyRelation(3);
		expect(checkSymmetric(M).ok && checkTransitive(M).ok).toBe(true);
		expect(checkReflexive(M).ok).toBe(false);
	});
	it('same parity is an equivalence relation with classes {1,3}, {2,4}', () => {
		const M = fromPredicate(4, (i, j) => (i - j) % 2 === 0);
		expect(isEquivalence(M)).toBe(true);
		expect(classesOf(M)).toEqual([
			[0, 2],
			[1, 3]
		]);
	});
});

describe('generated equivalence relation', () => {
	it('a ∼ b and b ∼ c on {a,b,c,d} generates the partition {a,b,c}, {d}', () => {
		const M = emptyRelation(4);
		M[0][1] = true;
		M[1][2] = true;
		const E = equivalenceClosure(M);
		expect(isEquivalence(E)).toBe(true);
		expect(classesOf(E)).toEqual([[0, 1, 2], [3]]);
	});
	it('gluing the corners of a square torus: all four corners become one class', () => {
		// corners 0 = bottom-left, 1 = bottom-right, 2 = top-right, 3 = top-left
		// left side ∼ right side glues 0∼1 and 3∼2; bottom ∼ top glues 0∼3 and 1∼2
		const M = emptyRelation(4);
		M[0][1] = M[3][2] = M[0][3] = M[1][2] = true;
		expect(classesOf(equivalenceClosure(M))).toEqual([[0, 1, 2, 3]]);
	});
});

describe('ℤ/n and well-definedness', () => {
	it('mod always lands in 0..m−1', () => {
		expect(mod(-6, 4)).toBe(2);
		expect(mod(-1, 3)).toBe(2);
		expect(mod(7, 7)).toBe(0);
	});
	it('x mod m is well defined on ℤ/n exactly when m divides n', () => {
		for (const m of [2, 3, 4]) {
			const rule = rules.find((r) => r.id === `mod${m}`)!;
			for (let n = 2; n <= 12; n++) expect(checkRule(rule, n).ok).toBe(n % m === 0);
		}
	});
	it('[x] ↦ [2x] and [x] ↦ [x²] are always well defined; [x] ↦ x never is', () => {
		const dbl = rules.find((r) => r.id === 'double')!;
		const sq = rules.find((r) => r.id === 'square')!;
		const it = rules.find((r) => r.id === 'itself')!;
		for (let n = 2; n <= 12; n++) {
			expect(checkRule(dbl, n).ok).toBe(true);
			expect(checkRule(sq, n).ok).toBe(true);
			expect(checkRule(it, n).ok).toBe(false);
		}
	});
	it('the chapter example: on ℤ/3, [0] = [3] but 0 and 3 have different parity', () => {
		const r = checkRule(rules[0], 3);
		expect(r).toEqual({ ok: false, badClass: 0 });
	});
});

describe('necklaces', () => {
	it('16 colourings of a square’s corners fall into 6 rotation classes of sizes 1,1,2,4,4,4', () => {
		const cls = necklaceClasses();
		expect(cls.flat().length).toBe(16);
		expect(cls.length).toBe(6);
		expect(cls.map((c) => c.length).sort()).toEqual([1, 1, 2, 4, 4, 4]);
	});
	it('four quarter turns are the identity', () => {
		for (let c = 0; c < 16; c++) expect(rotate4(rotate4(rotate4(rotate4(c))))).toBe(c);
	});
});

describe('fractions as classes of pairs', () => {
	// (a, b) ∼ (c, d)  ⇔  ad = bc, with b, d ≠ 0
	const same = (p: [number, number], q: [number, number]) => p[0] * q[1] === p[1] * q[0];
	it('1/2, 2/4 and −3/−6 are the same class; 1/2 and 2/3 are not', () => {
		expect(same([1, 2], [2, 4])).toBe(true);
		expect(same([1, 2], [-3, -6])).toBe(true);
		expect(same([1, 2], [2, 3])).toBe(false);
	});
	it('a/b ↦ a + b is not well defined, a/b ↦ a/b (a real number) is', () => {
		expect(1 + 2).not.toBe(2 + 4);
		expect(1 / 2).toBe(2 / 4);
	});
	it('the sum (ad + bc)/bd does not depend on representatives (sampled)', () => {
		const reps: [number, number][][] = [
			[
				[1, 2],
				[2, 4],
				[-5, -10]
			],
			[
				[1, 3],
				[3, 9],
				[2, 6]
			]
		];
		const sums = new Set<string>();
		for (const [a, b] of reps[0])
			for (const [c, d] of reps[1]) {
				const num = a * d + b * c;
				const den = b * d;
				const g = gcd(Math.abs(num), Math.abs(den)) * Math.sign(den);
				sums.add(`${num / g}/${den / g}`);
			}
		expect([...sums]).toEqual(['5/6']);
	});
});

function gcd(a: number, b: number): number {
	return b === 0 ? a : gcd(b, a % b);
}
