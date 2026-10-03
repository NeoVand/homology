import { describe, expect, it } from 'vitest';
import {
	abelianTeX,
	abelianize,
	arcThrough,
	cancellingIndices,
	catmullRomClosed,
	liftAngle,
	reduceWord,
	straightLineHit,
	windingNumber,
	wordTeX,
	type Letter,
	type Pt
} from './geom';

const circle = (k: number, r = 1, c: Pt = [0, 0], n = 400): Pt[] =>
	Array.from({ length: n }, (_, i) => {
		const a = (2 * Math.PI * k * i) / n;
		return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)] as Pt;
	});

describe('winding numbers (π₁ of the circle)', () => {
	it('the loop going k times round has winding number k', () => {
		for (const k of [-3, -1, 1, 2, 5]) expect(windingNumber(circle(k), [0, 0])).toBe(k);
	});
	it('a loop that does not surround the puncture has winding number 0', () => {
		expect(windingNumber(circle(1, 1, [3, 0]), [0, 0])).toBe(0);
	});
	it('concatenating loops adds winding numbers', () => {
		const a = circle(2);
		const b = circle(-1);
		expect(windingNumber([...a, ...b], [0, 0])).toBe(1);
	});
	it('the lift starts at the true angle and ends an integer number of turns later', () => {
		const { turns, total } = liftAngle(circle(3), [0, 0]);
		expect(turns[0]).toBeCloseTo(0);
		expect(total).toBeCloseTo(3);
	});
	it('a smooth closed spline through points spiralling twice winds twice', () => {
		const ctrl: Pt[] = Array.from({ length: 8 }, (_, i) => {
			const a = (i * Math.PI) / 2;
			const r = i % 2 ? 1.6 : 1.0;
			return [r * Math.cos(a), r * Math.sin(a)];
		});
		// 8 points, 90° apart → two full turns
		expect(windingNumber(catmullRomClosed(ctrl, 40), [0, 0])).toBe(2);
	});
});

describe('straight-line homotopy in a punctured plane', () => {
	const A: Pt = [0, 0];
	const B: Pt = [10, 0];
	const over = arcThrough(A, [5, 4], B);
	const over2 = arcThrough(A, [5, 2], B);
	const under = arcThrough(A, [5, -4], B);
	const hole: Pt = [5, 1];
	it('paths on the same side sweep a region that misses the hole', () => {
		expect(straightLineHit(over, over2, [5, -1])).toBeNull();
	});
	it('paths on opposite sides force the movie through the hole', () => {
		const hit = straightLineHit(over, under, hole);
		expect(hit).not.toBeNull();
		expect(hit!.s).toBeCloseTo(0.5, 1);
		// at the middle the paths are at heights 4 and −4; the hole at height 1 is 3/8 of the way
		expect(hit!.t).toBeCloseTo(3 / 8, 2);
	});
	it('opposite sides ⇔ the loop γ0 · γ1⁻¹ winds once round the hole', () => {
		const loop = [...over, ...under.slice().reverse()];
		expect(Math.abs(windingNumber(loop, hole))).toBe(1);
		const loop2 = [...over, ...over2.slice().reverse()];
		expect(windingNumber(loop2, hole)).toBe(0);
	});
});

describe('the free group on a, b', () => {
	const w = (s: string) => s.split('') as Letter[];
	it('reduces words by cancelling x x⁻¹', () => {
		expect(reduceWord(w('aAb'))).toEqual(w('b'));
		expect(reduceWord(w('abBA'))).toEqual([]);
		expect(reduceWord(w('abAB'))).toEqual(w('abAB'));
	});
	it('finds the cancelling letters', () => {
		expect([...cancellingIndices(w('abBAb'))].sort()).toEqual([0, 1, 2, 3]);
	});
	it('ab and ba differ in π₁ but agree after abelianizing', () => {
		expect(reduceWord(w('ab'))).not.toEqual(reduceWord(w('ba')));
		expect(abelianize(w('ab'))).toEqual(abelianize(w('ba')));
	});
	it('the commutator is non-trivial but abelianizes to 0', () => {
		expect(reduceWord(w('abAB')).length).toBe(4);
		expect(abelianize(w('abAB'))).toEqual([0, 0]);
		expect(abelianTeX([0, 0])).toBe('0');
	});
	it('prints words in TeX with exponents', () => {
		expect(wordTeX(w('aabAB'))).toBe('a^{2}ba^{-1}b^{-1}');
		expect(wordTeX([])).toBe('e');
		expect(abelianTeX([2, -1])).toBe('2a - b');
		expect(abelianTeX([1, 1])).toBe('a + b');
	});
});
