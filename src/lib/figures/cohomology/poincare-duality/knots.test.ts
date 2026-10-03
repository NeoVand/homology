import { describe, expect, it } from 'vitest';
import { diskPiercings, linkingNumber, loopAround, sample, trefoil, unknot } from './knots';

describe('knots and linking numbers (Alexander duality figure)', () => {
	it('the meridian links once, the double loop twice, the far loop not at all', () => {
		for (const K of [unknot, trefoil])
			for (const t0 of [0.05, 0.21, 0.37, 0.62, 0.88]) {
				const knot = sample(K, 600);
				const lk = (kind: 'meridian' | 'double' | 'far') => linkingNumber(knot, sample(loopAround(K, t0, kind), 300));
				expect(Math.abs(Math.abs(lk('meridian')) - 1)).toBeLessThan(0.02);
				expect(Math.abs(Math.abs(lk('double')) - 2)).toBeLessThan(0.03);
				expect(Math.abs(lk('far'))).toBeLessThan(0.02);
				// the meridian and the double loop wind the same way round
				expect(Math.sign(lk('meridian'))).toBe(Math.sign(lk('double')));
			}
	}, 60000);
	it('for the unknot, the signed piercings of the spanning disk give the linking number', () => {
		const knot = sample(unknot, 600);
		for (const kind of ['meridian', 'double', 'far'] as const)
			for (const t0 of [0.1, 0.45, 0.8]) {
				const loop = sample(loopAround(unknot, t0, kind), 400);
				const pierce = diskPiercings(loop).reduce((s, p) => s + p.sign, 0);
				expect(pierce).toBe(Math.round(linkingNumber(knot, loop)) || 0);
			}
	}, 60000);
});
