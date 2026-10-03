import { describe, expect, it } from 'vitest';
import { hodgeRank } from './hodgerank';

// The default season of the HodgeRank figure, as quoted in §5.3.
// pairs: A–B, B–C, A–C, C–D, D–E, A–E; margin = points(first) − points(second)
const pairs: [number, number][] = [
	[0, 1],
	[1, 2],
	[0, 2],
	[2, 3],
	[3, 4],
	[0, 4]
];
const season = [2, 1, -1, 3, 0, 1];

describe('HodgeRank figure: the default season', () => {
	it('splits as quoted in the text', () => {
		const games = pairs.map(([a, b], k) => ({ a, b, sa: Math.max(0, season[k]), sb: Math.max(0, -season[k]) }));
		const R = hodgeRank(5, games);
		const pct = (x: number) => Math.round((100 * x) / R.energy.total);
		const order = R.ratings.map((r, i) => ({ r, i })).sort((a, b) => b.r - a.r).map((x) => 'ABCDE'[x.i]);
		// Cygnus first (despite losing to Boreal), then Aurora, Boreal, Electra, Draco
		expect(order.join('')).toBe('CABED');
		expect(R.energy.total).toBe(16);
		// "a little over half … about a third … about a tenth"
		expect(pct(R.energy.gradient)).toBe(57);
		expect(pct(R.energy.curl)).toBe(33);
		expect(pct(R.energy.harmonic)).toBe(9);
	});
});
