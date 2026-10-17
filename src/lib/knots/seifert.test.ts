import { describe, expect, it } from 'vitest';
import { L } from './laurent';
import { diagramOf, type V3 } from './diagram';
import { braidClosure } from './curves';
import { jones, seifertCircles, seifertGenus } from './invariants';
import { bandPoint, circleAt, closedBraid, crossingAngle, diskPoint, knotAt, permutation, seifertCounts, slotAt } from './seifert';

// the four closed braids of the figure
const braids: [string, number, number[]][] = [
	['3_1', 2, [1, 1, 1]],
	['4_1', 3, [1, -2, 1, -2]],
	['5_1', 2, [1, 1, 1, 1, 1]],
	['5_2', 3, [1, 1, 1, 2, -1, 2]]
];

/** turn a curve so that looking down the z-axis is a generic view (the stacked braid seen from the side) */
const tilt = (comps: V3[][]): V3[][] => {
	const [a, b] = [1.05, 0.37];
	return comps.map((c) =>
		c.map(([x, y, z]) => {
			const y1 = y * Math.cos(a) - z * Math.sin(a);
			const z1 = y * Math.sin(a) + z * Math.cos(a);
			return [x * Math.cos(b) - z1 * Math.sin(b), y1, x * Math.sin(b) + z1 * Math.cos(b)] as V3;
		})
	);
};

const sub = (p: V3, q: V3): V3 => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
const cross = (p: V3, q: V3): V3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];

describe('Seifert’s algorithm on a closed braid', () => {
	it('the flat stage is the closed braid of braidClosure, crossing for crossing', () => {
		for (const [id, n, w] of braids) {
			const D = diagramOf(knotAt(closedBraid(n, w), 0));
			const ref = diagramOf(braidClosure(n, w));
			expect(D.pd.length, id).toBe(w.length);
			expect(D.writhe, id).toBe(w.reduce((a, g) => a + Math.sign(g), 0));
			expect(L.tex(jones(D)), id).toBe(L.tex(jones(ref)));
		}
	});

	it('every stage of the lift, up to the stacked disks, is the same knot', () => {
		for (const [id, n, w] of braids) {
			const ref = L.tex(jones(diagramOf(braidClosure(n, w))));
			for (const lambda of [0.35, 0.7, 1]) expect(L.tex(jones(diagramOf(tilt(knotAt(closedBraid(n, w), lambda))))), `${id} at ${lambda}`).toBe(ref);
		}
	});

	it('counts s = n circles and c bands, and its genus is seifertGenus of the diagram', () => {
		for (const [id, n, w] of braids) {
			const D = diagramOf(knotAt(closedBraid(n, w), 0));
			const k = seifertCounts(n, w);
			expect(k.components, id).toBe(1);
			expect(seifertCircles(D), id).toBe(k.s);
			expect(D.pd.length, id).toBe(k.c);
			expect(seifertGenus(D), id).toBe(k.genus);
		}
		expect(seifertCounts(2, [1, 1, 1]).genus).toBe(1);
		expect(seifertCounts(3, [1, -2, 1, -2]).genus).toBe(1);
		expect(seifertCounts(2, [1, 1, 1, 1, 1]).genus).toBe(2);
		// this diagram of 5₂ has 6 crossings and gives genus 2, though 5₂ bounds a surface of genus 1
		expect(seifertCounts(3, [1, 1, 1, 2, -1, 2]).genus).toBe(2);
		// links: the Hopf link bounds an annulus, the Borromean rings' braid a surface of genus 1
		expect(seifertCounts(2, [1, 1])).toMatchObject({ components: 2, chi: 0, genus: 0 });
		expect(seifertCounts(3, [1, -2, 1, -2, 1, -2])).toMatchObject({ components: 3, genus: 1 });
		expect(permutation(3, [1, 2])).toEqual([2, 0, 1]);
	});

	it('the edges of each band are the strands of its crossing, and its ends lie on the two circles', () => {
		for (const [id, n, w] of braids) {
			const B = closedBraid(n, w);
			const K = knotAt(B, 1, 20);
			// distance from p to the knot's polyline
			const near = (p: V3) => {
				let best = Infinity;
				for (const c of K)
					c.forEach((a, j) => {
						const ab = sub(c[(j + 1) % c.length], a);
						const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / (dot(ab, ab) || 1)));
						best = Math.min(best, Math.hypot(...sub(p, [a[0] + t * ab[0], a[1] + t * ab[1], a[2] + t * ab[2]])));
					});
				return best;
			};
			w.forEach((g, m) => {
				const i = Math.abs(g) - 1;
				for (const s of [0.1, 0.37, 0.5, 0.81]) for (const u of [-1, 1]) expect(near(bandPoint(B, m, s, u)), id).toBeLessThan(0.003);
				// the ends: arcs of circle i (s = 0) and circle i + 1 (s = 1)
				for (const u of [-0.6, 0, 0.6]) {
					const [r0, z0] = slotAt(B, i, 1);
					const [r1, z1] = slotAt(B, i + 1, 1);
					const p = bandPoint(B, m, 0, u);
					const q = bandPoint(B, m, 1, u);
					expect(Math.hypot(p[0], p[1]) - r0).toBeCloseTo(0, 9);
					expect(p[2] - z0).toBeCloseTo(0, 9);
					expect(Math.hypot(q[0], q[1]) - r1).toBeCloseTo(0, 9);
					expect(q[2] - z1).toBeCloseTo(0, 9);
				}
			});
		}
	});

	it('the bands and the disks are oriented alike: one side of the surface is up on every disk', () => {
		// a disk's (v, u) normal points up (+z); a band's (s, u) normal must point out of
		// the stack where it leaves its upper disk and into it where it meets the lower
		// one, so that the up sides join through the half twist, whichever way it turns
		const h = 1e-5;
		for (const [id, n, w] of braids) {
			const B = closedBraid(n, w);
			const du = sub(diskPoint(B, 0, 0.2 + h, 0.5), diskPoint(B, 0, 0.2, 0.5));
			const dv = sub(diskPoint(B, 0, 0.2, 0.5 + h), diskPoint(B, 0, 0.2, 0.5));
			expect(cross(dv, du)[2], id).toBeGreaterThan(0);
			w.forEach((_, m) => {
				const tc = crossingAngle(B, m);
				const out: V3 = [Math.cos(tc), Math.sin(tc), 0];
				const normal = (s: number): V3 => {
					const P = bandPoint(B, m, s, 0);
					return cross(sub(bandPoint(B, m, s + h, 0), P), sub(bandPoint(B, m, s, h), P));
				};
				expect(dot(normal(0.03), out), `${id} band ${m} top`).toBeGreaterThan(0);
				expect(dot(normal(0.97), out), `${id} band ${m} bottom`).toBeLessThan(0);
			});
		}
	});

	it('the circles are the rims of the disks', () => {
		const B = closedBraid(3, [1, -2, 1, -2]);
		for (let k = 0; k < 3; k++) {
			const c = circleAt(B, k, 1, 12);
			const p = diskPoint(B, k, 0, 1);
			expect(Math.hypot(...sub(c[0], p))).toBeCloseTo(0, 9);
		}
	});
});
