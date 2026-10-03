import { describe, expect, it } from 'vitest';

// Claims made in §2.1, checked by brute force.

/** Is a collection of subsets of an n-point set (as bit masks) a topology? */
function isTopology(sets: number[], n: number) {
	const S = new Set(sets);
	const full = (1 << n) - 1;
	if (!S.has(0) || !S.has(full)) return false;
	for (const A of S)
		for (const B of S) {
			if (!S.has(A | B) || !S.has(A & B)) return false;
		}
	return true;
}

function countTopologies(n: number) {
	const subsets = 1 << n;
	let count = 0;
	for (let mask = 0; mask < 1 << subsets; mask++) {
		const sets: number[] = [];
		for (let s = 0; s < subsets; s++) if (mask & (1 << s)) sets.push(s);
		if (isTopology(sets, n)) count++;
	}
	return count;
}

describe('topologies on small sets', () => {
	it('there are 1, 4 and 29 topologies on sets of 1, 2 and 3 points', () => {
		expect(countTopologies(1)).toBe(1);
		expect(countTopologies(2)).toBe(4);
		expect(countTopologies(3)).toBe(29);
	});
	it('{∅, {a}, {b}, X} is not a topology on {a, b, c}', () => {
		expect(isTopology([0, 1, 2, 7], 3)).toBe(false);
		expect(isTopology([0, 1, 2, 3, 7], 3)).toBe(true);
	});
});

describe('taxicab and straight-line distance', () => {
	it('d₂ ≤ d₁ ≤ √2·d₂, so every ball of one kind contains a ball of the other', () => {
		let worst = 0;
		for (let i = 0; i < 2000; i++) {
			const x = Math.cos(i) * (i % 7);
			const y = Math.sin(1.7 * i) * (i % 5);
			const d1 = Math.abs(x) + Math.abs(y);
			const d2 = Math.hypot(x, y);
			expect(d2).toBeLessThanOrEqual(d1 + 1e-12);
			expect(d1).toBeLessThanOrEqual(Math.SQRT2 * d2 + 1e-12);
			if (d2 > 0) worst = Math.max(worst, d1 / d2);
		}
		expect(worst).toBeGreaterThan(1.4);
	});
});
