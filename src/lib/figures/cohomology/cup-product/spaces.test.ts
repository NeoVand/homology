import { describe, expect, it } from 'vitest';
import { cupSpaces, crossingsFor, entryTeX } from './spaces';

describe('the cup-product explorer', () => {
	const spaces = Object.fromEntries(cupSpaces().map((s) => [s.id, s]));
	it('multiplication tables of degree-1 classes', () => {
		expect(spaces.torus.table).toEqual([
			[0, 1],
			[-1, 0]
		]);
		expect(spaces.wedge.table).toEqual([
			[0, 0],
			[0, 0]
		]);
		expect(spaces.genus2.table).toEqual([
			[0, 1, 0, 0],
			[-1, 0, 0, 0],
			[0, 0, 0, 1],
			[0, 0, -1, 0]
		]);
		expect(spaces.rp2.table).toEqual([[1]]);
		expect(spaces.klein.table).toEqual([
			[0, 1],
			[1, 1]
		]);
		expect(spaces.torus2.table).toEqual([
			[0, 1],
			[1, 0]
		]);
	});
	it('Betti numbers match the groups shown', () => {
		expect(spaces.torus.betti).toEqual([1, 2, 1]);
		expect(spaces.wedge.betti).toEqual([1, 2, 1]);
		expect(spaces.genus2.betti).toEqual([1, 4, 1]);
		expect(spaces.rp2.betti).toEqual([1, 1, 1]);
		expect(spaces.klein.betti).toEqual([1, 2, 1]);
		expect(spaces.torus2.betti).toEqual([1, 2, 1]);
		for (const s of Object.values(spaces)) expect(s.classes.length).toBe(s.betti[1]);
	});
	it('the crossings drawn agree with the table (signed over ℤ, parity mod 2)', () => {
		for (const s of Object.values(spaces)) {
			if (!s.fences) continue;
			for (let i = 0; i < s.classes.length; i++)
				for (let j = 0; j < s.classes.length; j++) {
					const cr = crossingsFor(s, i, j);
					if (s.coeff === 'Z' && i !== j) expect(cr.reduce((a, c) => a + c.sign, 0)).toBe(s.table[i][j]);
					if (s.coeff === 'Z' && i === j) expect(cr.length).toBe(0);
					if (s.coeff === 'Z2') expect(cr.length % 2).toBe(s.table[i][j]);
				}
		}
	});
	it('entry labels', () => {
		expect([entryTeX(0, 'g'), entryTeX(1, 'g'), entryTeX(-1, 'g'), entryTeX(2, 'g')]).toEqual(['0', 'g', '-g', '2g']);
	});
});
