import { describe, expect, it } from 'vitest';
import { boundaryPiercings, crossings, endPresets, endsInside, exactPresets, total, type Box, type Rect } from './sheets';
import { lineIntegral, regionIntegral, type Vec2 } from './calc';
import { mulberry } from './flow';

const box: Box = [-2.6, 2.6, -1.7, 1.7];

describe('sheets of exact forms: crossings count f(end) − f(start)', () => {
	const rand = mulberry(3);
	for (const P of Object.values(exactPresets)) {
		it(`${P.key}: net crossings = ⌊f(B)/ε⌋ − ⌊f(A)/ε⌋ and ε·net ≈ ∫ df`, () => {
			for (let trial = 0; trial < 30; trial++) {
				const A: Vec2 = [-2 + 4 * rand(), -1.4 + 2.8 * rand()];
				const B: Vec2 = [-2 + 4 * rand(), -1.4 + 2.8 * rand()];
				const M: Vec2 = [-2 + 4 * rand(), -1.4 + 2.8 * rand()];
				const path: Vec2[] = [];
				for (let i = 0; i <= 600; i++) {
					const t = i / 600;
					// quadratic Bézier through M at t = ½
					const Q: Vec2 = [2 * M[0] - (A[0] + B[0]) / 2, 2 * M[1] - (A[1] + B[1]) / 2];
					path.push([
						(1 - t) ** 2 * A[0] + 2 * t * (1 - t) * Q[0] + t * t * B[0],
						(1 - t) ** 2 * A[1] + 2 * t * (1 - t) * Q[1] + t * t * B[1]
					]);
				}
				const c = crossings(path, P.f, P.eps);
				const fa = P.f(A[0], A[1]);
				const fb = P.f(B[0], B[1]);
				expect(c.net).toBe(Math.floor(fb / P.eps) - Math.floor(fa / P.eps));
				expect(Math.abs(c.net * P.eps - (fb - fa))).toBeLessThan(P.eps + 1e-9);
				// and the line integral of df along the path is exactly f(B) − f(A)
				const df = (x: number, y: number) => P.grad(x, y);
				expect(lineIntegral(path, df, false)).toBeCloseTo(fb - fa, 4);
			}
		});
	}
});

describe('sheets that end: piercings of ∂R = sheet-ends inside R', () => {
	const rand = mulberry(11);
	for (const P of Object.values(endPresets)) {
		it(`${P.key}`, () => {
			const sheets = P.sheets(box);
			for (let trial = 0; trial < 60; trial++) {
				// a random rectangle strictly inside the drawn box
				const w = 0.2 + 1.6 * rand();
				const h = 0.2 + 1.2 * rand();
				const x0 = -2.5 + (5.0 - w) * rand();
				const y0 = -1.6 + (3.2 - h) * rand();
				const R: Rect = [x0, x0 + w, y0, y0 + h];
				const containsHole = (P.holes ?? []).some(([hx, hy]) => hx > R[0] && hx < R[1] && hy > R[2] && hy < R[3]);
				const pierce = total(boundaryPiercings(sheets, R));
				const ends = total(endsInside(sheets, R));
				if (containsHole) {
					// dθ: 24 rays leave a rectangle around the puncture, but no sheet ends inside
					expect(pierce).toBe(24);
					expect(ends).toBe(0);
				} else {
					expect(pierce).toBe(ends);
				}
				// and the counts approximate the exact integrals ∮ω and ∬dω (Stokes)
				if (!containsHole) {
					const corners: Vec2[] = [
						[R[0], R[2]],
						[R[1], R[2]],
						[R[1], R[3]],
						[R[0], R[3]]
					];
					// subdivide the edges finely (dθ is sharply peaked near the origin)
					const rect: Vec2[] = [];
					for (let e = 0; e < 4; e++) {
						const a = corners[e];
						const b = corners[(e + 1) % 4];
						for (let i = 0; i < 400; i++) rect.push([a[0] + ((b[0] - a[0]) * i) / 400, a[1] + ((b[1] - a[1]) * i) / 400]);
					}
					const exactBoundary = lineIntegral(rect, P.PQ);
					const exactInside = regionIntegral(rect, P.g);
					// (dθ is nearly singular close to the origin, so allow quadrature error there)
					expect(exactBoundary).toBeCloseTo(exactInside, P.holes ? 4 : 8);
					expect(Math.abs(pierce * P.eps - exactBoundary)).toBeLessThan(0.25 * Math.max(1, Math.abs(exactBoundary)) + 3 * P.eps);
				}
			}
		});
	}
});
