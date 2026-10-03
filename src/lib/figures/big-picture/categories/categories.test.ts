import { describe, expect, it } from 'vitest';
import { presets, checkAxioms } from './smallcats';
import { evSquare, betaSquare, isOrthogonal, presetsT, type M2, type V2 } from './naturality';

describe('the small categories of Figure 5.1', () => {
	it('satisfy associativity and the unit laws, and every composite is drawn', () => {
		for (const make of Object.values(presets)) expect(checkAxioms(make())).toEqual([]);
	});
	it('compose as advertised', () => {
		const P = presets.path();
		expect(P.compose('g', 'f')).toBe('gf');
		expect(P.compose('h', P.compose('g', 'f')!)).toBe('hgf');
		expect(P.compose(P.compose('h', 'g')!, 'f')).toBe('hgf');
		expect(P.compose('h', 'f')).toBeNull();
		const D = presets.divisors();
		expect(D.compose('4|12', '2|4')).toBe('2|12');
		expect(D.compose('6|12', '2|6')).toBe('2|12');
		const R = presets.rotations();
		expect(R.compose('r1', 'r1')).toBe('r2');
		expect(R.compose('r2', 'r1')).toBe('r0');
	});
});

describe('naturality squares', () => {
	const vs: V2[] = [
		[1, 0],
		[0.5, -2],
		[3, 1.25]
	];
	const close = (a: V2, b: V2) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;
	it('the evaluation square V → V** always commutes', () => {
		const Ts: M2[] = [...presetsT.map((p) => p.T), [[2, -1], [5, 3]], [[0, 0], [1, 0]]];
		for (const T of Ts)
			for (const v of vs) {
				const s = evSquare(T, v);
				expect(close(s.across, s.down)).toBe(true);
			}
	});
	it('the basis square V → V* commutes exactly for rotations and reflections', () => {
		for (const { T } of presetsT) {
			const commutes = vs.every((v) => {
				const s = betaSquare(T, v)!;
				return close(s.across, s.down);
			});
			expect(commutes).toBe(isOrthogonal(T));
		}
		// doubling: one route gives 2v, the other v/2
		const s = betaSquare([[2, 0], [0, 2]], [1, 1])!;
		expect(s.down).toEqual([2, 2]);
		expect(s.across).toEqual([0.5, 0.5]);
	});
});
