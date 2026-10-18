import { describe, expect, it } from 'vitest';
import { energy, repulse, _internal } from './repulse';
import { braidClosure } from './curves';
import { resample } from './relax';
import { diagramOf } from './diagram';
import { alexander } from './invariants';
import { L } from './laurent';

describe('the tangent-point energy', () => {
	for (const [alpha, beta] of [
		[3, 6],
		[2, 4.5]
	])
		it(`has the gradient its formula says, for α = ${alpha}, β = ${beta} (checked against finite differences)`, () => {
			const C = _internal.curveOf(braidClosure(2, [1, 1, 1]).map((c) => resample(c, 24)));
			const G = new Float64Array(C.X.length);
			energy(C, G, alpha, beta);
			const h = 1e-6;
			for (const q of [0, 7, 20, 41, 65]) {
				const x = C.X[q];
				C.X[q] = x + h;
				const Ep = energy(C, undefined, alpha, beta);
				C.X[q] = x - h;
				const Em = energy(C, undefined, alpha, beta);
				C.X[q] = x;
				const fd = (Ep - Em) / (2 * h);
				expect(Math.abs(fd - G[q]) / Math.max(1, Math.abs(fd)), `coordinate ${q}`).toBeLessThan(1e-5);
			}
		});

	it('builds a symmetric Gram matrix that is positive on everything but the constants', () => {
		const C = _internal.curveOf(braidClosure(2, [1, 1, 1]).map((c) => resample(c, 30)));
		const N = C.next.length;
		const A = _internal.gram(C, 3, 6);
		for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) expect(A[i * N + j]).toBeCloseTo(A[j * N + i], 10);
		// a wiggly function has positive energy
		let q = 0;
		for (let i = 0; i < N; i++)
			for (let j = 0; j < N; j++) q += Math.sin(i) * A[i * N + j] * Math.sin(j);
		expect(q).toBeGreaterThan(0);
	});

	it('settles a knot without ever changing it', { timeout: 60000 }, () => {
		const B = braidClosure(2, [1, 1, 1]);
		const before = L.tex(alexander(diagramOf(B)));
		const after = repulse(B, { points: 80, steps: 40 });
		expect(L.tex(alexander(diagramOf(after)))).toBe(before);
	});
});
