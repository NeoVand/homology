import { describe, expect, it } from 'vitest';
import { traceDoubleCurves, traceFrom } from './doubleCurve';
import { doubleCurveOf, immersions } from './immersions';
import { boyRaw, presets } from './morphs';

const P = () => ({ x: 0, y: 0, z: 0 });
const dist = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** every point is where two different points of the surface land, and consecutive points are close */
function checkCurve(f: (u: number, v: number, o: { x: number; y: number; z: number }) => void, c: { pts: Float64Array; params: Float64Array }, step: number) {
	const a = P();
	const b = P();
	const n = c.pts.length / 3;
	for (let i = 0; i < n; i++) {
		f(c.params[4 * i], c.params[4 * i + 1], a);
		f(c.params[4 * i + 2], c.params[4 * i + 3], b);
		expect(dist(a, b)).toBeLessThan(1e-7);
		expect(Math.hypot(a.x - c.pts[3 * i], a.y - c.pts[3 * i + 1], a.z - c.pts[3 * i + 2])).toBeLessThan(1e-7);
		// two different points of the surface (not one point found twice)
		expect(Math.hypot(c.params[4 * i] - c.params[4 * i + 2], c.params[4 * i + 1] - c.params[4 * i + 3])).toBeGreaterThan(1e-3);
		if (i) expect(Math.hypot(c.pts[3 * i] - c.pts[3 * i - 3], c.pts[3 * i + 1] - c.pts[3 * i - 2], c.pts[3 * i + 2] - c.pts[3 * i - 1])).toBeLessThan(1.01 * step);
	}
}

describe('double curves, traced', () => {
	it('the figure-8 Klein bottle crosses itself along its core circle, all the way round, in one piece', () => {
		const cs = doubleCurveOf('fig8');
		expect(cs.length).toBe(1);
		const [c] = cs;
		expect(c.closed).toBe(true);
		let L = 0;
		const n = c.pts.length / 3;
		for (let i = 0; i < n; i++) {
			const x = c.pts[3 * i];
			const y = c.pts[3 * i + 1];
			const z = c.pts[3 * i + 2];
			expect(Math.abs(Math.hypot(x, z) - 2)).toBeLessThan(1e-6);
			expect(Math.abs(y)).toBeLessThan(1e-6);
			const j = (i + 1) % n;
			L += Math.hypot(c.pts[3 * j] - x, c.pts[3 * j + 1] - y, c.pts[3 * j + 2] - z);
		}
		expect(L).toBeGreaterThan(4 * Math.PI * 0.99);
		expect(L).toBeLessThan(4 * Math.PI * 1.01);
		checkCurve(immersions.fig8.f, c, 0.03);
	});

	it('the Klein bottle crosses itself along one closed curve, where the neck goes through the wall', () => {
		const cs = doubleCurveOf('bottle');
		expect(cs.length).toBe(1);
		expect(cs[0].closed).toBe(true);
		checkCurve(immersions.bottle.f, cs[0], 0.05);
	});

	it('Boy’s surface: one closed double curve through the triple point three times', () => {
		// the formula gives the same point at w and at −1/w̄ (so the rim of the disk is glued to itself)
		const a = P();
		const b = P();
		for (const [x, y] of [
			[0.3, 0.2],
			[-0.7, 0.4],
			[0.1, -0.95],
			[0.6, 0.8]
		]) {
			const r2 = x * x + y * y;
			boyRaw(x, y, a);
			boyRaw(-x / r2, -y / r2, b);
			expect(dist(a, b)).toBeLessThan(1e-9);
		}
		const cs = doubleCurveOf('boy');
		expect(cs.length).toBe(1);
		const [c] = cs;
		expect(c.closed).toBe(true);
		checkCurve((u, v, o) => boyRaw(2 * u - 1, 2 * v - 1, o), c, 0.05);
		// it passes through the triple point (the origin) three times
		const n = c.pts.length / 3;
		const d = Array.from({ length: n }, (_, i) => Math.hypot(c.pts[3 * i], c.pts[3 * i + 1], c.pts[3 * i + 2]));
		const passes = d.filter((x, i) => x < 0.02 && x <= d[(i + 1) % n] && x <= d[(i + n - 1) % n]);
		expect(passes.length).toBe(3);
	});

	it('a torus has no double curve', () => {
		const TAU = Math.PI * 2;
		const torus = (u: number, v: number, o: { x: number; y: number; z: number }) => {
			const w = 1.6 + 0.6 * Math.cos(TAU * v);
			o.x = w * Math.cos(TAU * u);
			o.y = 0.6 * Math.sin(TAU * v);
			o.z = w * Math.sin(TAU * u);
		};
		expect(traceDoubleCurves(torus).length).toBe(0);
	});

	it('the Klein bottle’s end, pushed part way through the wall, crosses it along an arc that stops at the end', () => {
		const t = 0.84;
		const f = (u: number, v: number, o: { x: number; y: number; z: number }) => presets.klein.f(u, v, t, o);
		// start from the finished bottle's curve and walk back in time
		let seed = doubleCurveOf('bottle')[0].params.slice(0, 4);
		let c = null;
		for (let s = 1; s <= 16; s++) {
			const ts = 1 + ((t - 1) * s) / 16;
			c = traceFrom((u, v, o) => presets.klein.f(u, v, ts, o), seed, 3, {
				wrap: (p, k) => (p[k] -= Math.floor(p[k])),
				inside: (p, k) => p[k + 1] >= 0 && p[k + 1] <= 1
			});
			expect(c).not.toBeNull();
			const m = Math.floor(c!.pts.length / 6);
			seed = c!.params.slice(4 * m, 4 * m + 4);
		}
		expect(c!.closed).toBe(false);
		checkCurve(f, c!, 0.05);
		// and before the end reaches the wall there is no crossing to find
		expect(traceFrom((u, v, o) => presets.klein.f(u, v, 0.7, o), seed, 3, { inside: (p, k) => p[k + 1] >= 0 && p[k + 1] <= 1 })).toBeNull();
	});
});
