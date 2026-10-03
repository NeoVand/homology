import { describe, expect, it } from 'vitest';
import { linkOfCurve, linkOfPatch, polylineGap, type Patch, type V3 } from './link';

const plane = (angle: number): Patch => ({
	fn: (u, v) => {
		const s = (v - 0.5) * 3;
		return [(u - 0.5) * 3, s * Math.sin(angle), s * Math.cos(angle)];
	}
});
const cone = (dir: 1 | -1): Patch => ({
	periodicU: true,
	fn: (u, v) => {
		const r = 1.5 * v;
		return [r * Math.cos(2 * Math.PI * u), dir * r, r * Math.sin(2 * Math.PI * u)];
	}
});
const disk: Patch = {
	periodicU: true,
	fn: (u, v) => [1.5 * v * Math.cos(2 * Math.PI * u), 0, 1.5 * v * Math.sin(2 * Math.PI * u)]
};
const eight = (s: number): V3 => {
	const t = 2 * Math.PI * s;
	const d = 1 + Math.sin(t) ** 2;
	return [(2 * Math.cos(t)) / d, (2 * Math.sin(t) * Math.cos(t)) / d, 0];
};

describe('links of points (the small-sphere test)', () => {
	it('a point of a plane: one circle', () => {
		const L = linkOfPatch(plane(0.4), [0.2, 0, 0], 0.4);
		expect(L.length).toBe(1);
		expect(L[0].closed).toBe(true);
	});
	it('the tip of a cone: one circle (topologically fine)', () => {
		const L = linkOfPatch(cone(1), [0, 0, 0], 0.4);
		expect(L.length).toBe(1);
		expect(L[0].closed).toBe(true);
	});
	it('the tip of a double cone: two separate circles', () => {
		const L = [...linkOfPatch(cone(1), [0, 0, 0], 0.4), ...linkOfPatch(cone(-1), [0, 0, 0], 0.4)];
		expect(L.length).toBe(2);
		expect(L.every((l) => l.closed)).toBe(true);
		expect(polylineGap(L[0].points, L[1].points)).toBeGreaterThan(0.3);
	});
	it('a point on the line where two planes cross: two circles that meet', () => {
		const A = linkOfPatch(plane(0.55), [0.3, 0, 0], 0.4);
		const B = linkOfPatch(plane(-0.55), [0.3, 0, 0], 0.4);
		expect(A.length).toBe(1);
		expect(B.length).toBe(1);
		expect(polylineGap(A[0].points, B[0].points)).toBeLessThan(0.03);
	});
	it('a point on the edge of a disk: an arc with two ends', () => {
		const L = linkOfPatch(disk, [1.5, 0, 0], 0.4);
		expect(L.length).toBe(1);
		expect(L[0].closed).toBe(false);
	});
	it('the figure eight: two points at an ordinary point, four at the crossing', () => {
		expect(linkOfCurve(eight, eight(0.06), 0.25).length).toBe(2);
		expect(linkOfCurve(eight, [0, 0, 0], 0.3).length).toBe(4);
	});
});
