import { describe, expect, it } from 'vitest';
import { lu, luSolve } from './repulse';
import { Relaxer, tangle } from './live';
import { knotById } from './table';
import { unknot } from './curves';
import { resample } from './relax';
import { diagramOf } from './diagram';
import { bestView } from './view';
import { alexander, normaliseAlexander } from './invariants';
import { L } from './laurent';

const alex = (comps: ReturnType<typeof unknot>) => L.tex(normaliseAlexander(alexander(diagramOf(bestView(comps.map((c) => resample(c, 160)), { tries: 200 })))));

describe('the solver underneath', () => {
	it('solves a system that needs row swaps', () => {
		// small diagonal entries force the factorisation to pivot
		const n = 6;
		const M = new Float64Array(n * n);
		let s = 3;
		const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) - 0.5;
		for (let i = 0; i < n * n; i++) M[i] = rnd();
		for (let i = 0; i < n; i++) M[i * n + i] *= 1e-3;
		const x = Array.from({ length: n }, (_, i) => i - 2.5);
		const b = new Float64Array(n);
		for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) b[i] += M[i * n + j] * x[j];
		const F = M.slice();
		luSolve(F, lu(F, n), n, b);
		for (let i = 0; i < n; i++) expect(b[i]).toBeCloseTo(x[i], 9);
	});
});

describe('a knot relaxing live', () => {
	it('tangling a knot never changes it', () => {
		for (const id of ['3_1', '4_1']) {
			const K = knotById.get(id)!.build();
			expect(alex(tangle(K, 11)), id).toBe(alex(K));
		}
	});
	it('a tangled trefoil relaxes, its energy falling, and is still the trefoil', () => {
		const T = tangle(knotById.get('3_1')!.build(), 7);
		const R = new Relaxer(T, { points: 100 });
		const E0 = R.E;
		while (!R.settled && R.steps < 600) R.step();
		expect(R.settled).toBe(true);
		expect(R.E).toBeLessThan(E0 / 5);
		expect(alex(R.shape())).toBe(alex(T));
	}, 60000);
	it('a tangled unknot comes undone into a round circle', () => {
		const R = new Relaxer(tangle(unknot(), 8), { points: 100 });
		while (!R.settled && R.steps < 600) R.step();
		const [c] = R.shape();
		const m = [0, 1, 2].map((k) => c.reduce((a, p) => a + p[k], 0) / c.length);
		const r = c.map((p) => Math.hypot(p[0] - m[0], p[1] - m[1], p[2] - m[2]));
		// every point at nearly the same distance from the centre
		expect(Math.max(...r) / Math.min(...r)).toBeLessThan(1.02);
	}, 60000);
});
