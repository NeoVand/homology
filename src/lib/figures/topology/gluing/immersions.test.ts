import { describe, expect, it } from 'vitest';
import { immersions, sampleGrid } from './immersions';
import { selfIntersections } from './selfIntersect';

/** (u, v) of the centre of triangle k on an n × n grid (two triangles per cell) */
function triUV(k: number, n: number): [number, number] {
	const cell = Math.floor(k / 2);
	const i = cell % n;
	const j = Math.floor(cell / n);
	return [(i + 0.5) / n, (j + 0.5) / n];
}

describe('immersions', () => {
	// (the cross-cap's double line is its zipped-up rim, drawn directly instead)
	for (const id of ['bottle', 'fig8', 'boy'] as const) {
		it(`${id} really crosses itself`, () => {
			const n = 72;
			const segs = selfIntersections(sampleGrid(immersions[id].f, n), n, n);
			expect(segs.length).toBeGreaterThan(60);
		});
	}

	for (const id of ['bottle', 'fig8'] as const) {
		it(`${id}: the fourth coordinate pulls the crossing sheets apart`, () => {
			const n = 72;
			const pairs: number[] = [];
			selfIntersections(sampleGrid(immersions[id].f, n), n, n, pairs);
			const w = immersions[id].w!;
			let worst = Infinity;
			for (let k = 0; k < pairs.length; k += 2) {
				const [u1, v1] = triUV(pairs[k], n);
				const [u2, v2] = triUV(pairs[k + 1], n);
				worst = Math.min(worst, Math.abs(w(u1, v1) - w(u2, v2)));
			}
			expect(pairs.length).toBeGreaterThan(10);
			// the two sheets through every crossing point get clearly different colours
			expect(worst).toBeGreaterThan(0.3);
		});
	}

	it('the cross-cap zips opposite rim points onto one segment', () => {
		const o1 = { x: 0, y: 0, z: 0 };
		const o2 = { x: 0, y: 0, z: 0 };
		for (let u = 0; u < 0.5; u += 0.03) {
			immersions.crosscap.f(u, 1, o1);
			immersions.crosscap.f(u + 0.5, 1, o2);
			expect(Math.hypot(o1.x - o2.x, o1.y - o2.y, o1.z - o2.z)).toBeLessThan(1e-9);
			expect(Math.abs(o1.x) + Math.abs(o1.z)).toBeLessThan(1e-9);
			expect(o1.y).toBeLessThanOrEqual(1e-12);
			expect(o1.y).toBeGreaterThanOrEqual(-1 - 1e-12);
		}
	});

	it('the fourth coordinate is continuous on the glued square (bottle and figure-8)', () => {
		const b = immersions.bottle.w!;
		const f8 = immersions.fig8.w!;
		for (let s = 0; s <= 1; s += 0.05) {
			// bottle: (x, 0) ~ (1 − x, 1) and (0, y) ~ (1, y)
			expect(Math.abs(b(s, 0) - b(1 - s, 1))).toBeLessThan(1e-9);
			expect(Math.abs(b(0, s) - b(1, s))).toBeLessThan(1e-9);
			// figure-8: (1, y) ~ (0, 1 − y) and (x, 0) ~ (x, 1)
			expect(Math.abs(f8(1, s) - f8(0, 1 - s))).toBeLessThan(1e-9);
			expect(Math.abs(f8(s, 0) - f8(s, 1))).toBeLessThan(1e-9);
		}
	});
});
