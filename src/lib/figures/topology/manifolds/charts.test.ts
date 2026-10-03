import { describe, expect, it } from 'vitest';
import { chartInverse, chartMap, charts, inChart, transition, transitionTeX, type V3 } from './charts';

const unit = (p: V3): V3 => {
	const L = Math.hypot(...p);
	return [p[0] / L, p[1] / L, p[2] / L];
};

describe('hemisphere charts of the sphere', () => {
	it('every point of the sphere lies in at least one chart (an atlas)', () => {
		for (let i = 0; i < 200; i++) {
			const p = unit([Math.sin(i * 1.3), Math.cos(i * 0.7), Math.sin(i * 2.1 + 1)]);
			expect(charts.some((c) => inChart(c, p))).toBe(true);
		}
	});
	it('φ⁻¹ ∘ φ is the identity on each chart', () => {
		const p = unit([0.3, -0.5, 0.8]);
		for (const c of charts.filter((c) => inChart(c, p))) {
			const [u, v] = chartMap(c, p);
			const q = chartInverse(c, u, v);
			q.forEach((x, k) => expect(x).toBeCloseTo(p[k], 12));
		}
	});
	it('the transition from z>0 to x>0 is (u, v) ↦ (v, √(1 − u² − v²))', () => {
		const zp = charts.find((c) => c.id === 'z+')!;
		const xp = charts.find((c) => c.id === 'x+')!;
		expect(transitionTeX(zp, xp)).toBe(String.raw`(u,v) \mapsto \bigl(v,\ \sqrt{1-u^2-v^2}\bigr)`);
		const [a, b] = transition(zp, xp, 0.6, 0.2);
		expect(a).toBeCloseTo(0.2);
		expect(b).toBeCloseTo(Math.sqrt(1 - 0.36 - 0.04));
	});
	it('a point with all coordinates non-zero lies in exactly three charts', () => {
		expect(charts.filter((c) => inChart(c, unit([0.2, -0.4, 0.7]))).length).toBe(3);
	});
});

describe('stereographic charts of the circle', () => {
	// φ_N(x, y) = x / (1 − y), φ_S(x, y) = x / (1 + y): on the overlap φ_S = 1/φ_N
	it('φ_N · φ_S = 1 away from the poles', () => {
		for (const t of [0.3, 1.1, 2.0, 2.9, 4.0, 5.5]) {
			const x = Math.cos(t);
			const y = Math.sin(t);
			expect((x / (1 - y)) * (x / (1 + y))).toBeCloseTo(1, 10);
		}
	});
});
