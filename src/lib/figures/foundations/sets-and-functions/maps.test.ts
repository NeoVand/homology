import { describe, expect, it } from 'vitest';
import {
	classify,
	compose,
	countFunctions,
	countInjections,
	image,
	preimage,
	squareImage,
	squarePreimage,
	zigzag,
	type Arrow
} from './maps';

describe('arrow diagrams', () => {
	it('detects a missing arrow and a doubled arrow (not a function)', () => {
		const c = classify(
			[
				[0, 0],
				[1, 1],
				[1, 2]
			],
			3,
			3
		);
		expect(c.isFunction).toBe(false);
		expect(c.noArrow).toEqual([2]);
		expect(c.manyArrows).toEqual([1]);
	});
	it('classifies the four classic pictures', () => {
		const inj: Arrow[] = [
			[0, 0],
			[1, 2],
			[2, 3]
		];
		const sur: Arrow[] = [
			[0, 0],
			[1, 0],
			[2, 1]
		];
		const bij: Arrow[] = [
			[0, 1],
			[1, 2],
			[2, 0]
		];
		const neither: Arrow[] = [
			[0, 0],
			[1, 0],
			[2, 0]
		];
		expect(classify(inj, 3, 4)).toMatchObject({ isFunction: true, injective: true, surjective: false, missed: [1] });
		expect(classify(sur, 3, 2)).toMatchObject({ isFunction: true, injective: false, surjective: true, collision: [0, 1, 0] });
		expect(classify(bij, 3, 3)).toMatchObject({ bijective: true });
		expect(classify(neither, 3, 3)).toMatchObject({ injective: false, surjective: false });
	});
	it('image and preimage; the preimage exists without an inverse', () => {
		const f: Arrow[] = [
			[0, 0],
			[1, 0],
			[2, 2],
			[3, 2]
		];
		expect(image(f, [0, 1])).toEqual([0]);
		expect(preimage(f, [0])).toEqual([0, 1]);
		expect(preimage(f, [1])).toEqual([]); // nobody lands on 1
		expect(preimage(f, [0, 2])).toEqual([0, 1, 2, 3]);
	});
	it('image does not respect intersections, preimage does', () => {
		// f(x) = x² on {−1, 0, 1} → {0, 1}; encode −1, 0, 1 as 0, 1, 2
		const f: Arrow[] = [
			[0, 1],
			[1, 0],
			[2, 1]
		];
		const A = [0]; // {−1}
		const B = [2]; // {1}
		const AcapB: number[] = [];
		expect(image(f, AcapB)).toEqual([]);
		expect(image(f, A).filter((y) => image(f, B).includes(y))).toEqual([1]); // f(A) ∩ f(B) = {1}
		// preimage of an intersection = intersection of preimages
		const P = [0, 1];
		const Q = [1];
		const both = preimage(f, [1]);
		expect(preimage(f, P).filter((x) => preimage(f, Q).includes(x))).toEqual(both);
	});
	it('composition reads right to left', () => {
		const f = [1, 0, 2, 1]; // people → cities
		const g = [0, 0, 1, 2]; // cities → countries
		expect(compose(g, f)).toEqual([0, 0, 1, 0]);
	});
});

describe('counting', () => {
	it('|Y|^|X| functions, n(n−1)… injections, 2^n subsets', () => {
		expect(countFunctions(3, 2)).toBe(8);
		expect(countFunctions(2, 3)).toBe(9);
		expect(countInjections(3, 2)).toBe(0); // pigeonhole
		expect(countInjections(2, 3)).toBe(6);
		const subsets = (n: number) => 2 ** n;
		expect(subsets(3)).toBe(8);
	});
	it('the zig-zag lists every integer exactly once', () => {
		const seen = new Set<number>();
		for (let k = 0; k < 201; k++) seen.add(zigzag(k));
		expect(seen.size).toBe(201);
		for (let z = -100; z <= 100; z++) expect(seen.has(z)).toBe(true);
		expect([0, 1, 2, 3, 4, 5, 6].map(zigzag)).toEqual([0, 1, -1, 2, -2, 3, -3]);
	});
});

describe('image and preimage under x²', () => {
	it('matches the worked example: f([−1,2]) = [0,4], f⁻¹([1,4]) = [−2,−1] ∪ [1,2], f⁻¹([−3,−1]) = ∅', () => {
		expect(squareImage(-1, 2)).toEqual([0, 4]);
		expect(squarePreimage(1, 4)).toEqual([
			[-2, -1],
			[1, 2]
		]);
		expect(squarePreimage(-3, -1)).toEqual([]);
		expect(squarePreimage(-1, 4)).toEqual([[-2, 2]]);
	});
});
