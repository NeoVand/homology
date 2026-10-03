import { describe, expect, it } from 'vitest';
import { selfIntersections, triTri } from './selfIntersect';

const TAU = Math.PI * 2;

function grid(nu: number, nv: number, f: (u: number, v: number) => [number, number, number]) {
	const out: number[] = [];
	for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) out.push(...f(i / nu, j / nv));
	return out;
}

describe('self-intersections', () => {
	it('two crossing triangles meet in a segment', () => {
		const s = triTri(
			[
				[-1, 0, -1],
				[1, 0, -1],
				[0, 0, 1]
			],
			[
				[0, -1, 0],
				[0, 1, 0],
				[0.2, 0, 2]
			]
		);
		expect(s).not.toBeNull();
	});

	it('a torus does not cross itself', () => {
		const pos = grid(48, 24, (u, v) => {
			const w = 1.6 + 0.6 * Math.cos(TAU * v);
			return [w * Math.cos(TAU * u), 0.6 * Math.sin(TAU * v), w * Math.sin(TAU * u)];
		});
		expect(selfIntersections(pos, 48, 24).length).toBe(0);
	});

	it('the figure-8 Klein bottle crosses itself along its core circle', () => {
		const r = 2.2;
		// (the grid is shifted a little in V so that the double circle runs between grid rows)
		const pos = grid(96, 48, (u, v) => {
			const th = u * TAU;
			const V = (v + 0.0131) * TAU;
			const a = r + Math.cos(th / 2) * Math.sin(V) - Math.sin(th / 2) * Math.sin(2 * V);
			return [a * Math.cos(th), Math.sin(th / 2) * Math.sin(V) + Math.cos(th / 2) * Math.sin(2 * V), a * Math.sin(th)];
		});
		const segs = selfIntersections(pos, 96, 48);
		expect(segs.length).toBeGreaterThan(6 * 40);
		for (let k = 0; k < segs.length; k += 3) {
			expect(Math.abs(Math.hypot(segs[k], segs[k + 2]) - r)).toBeLessThan(0.08);
			expect(Math.abs(segs[k + 1])).toBeLessThan(0.08);
		}
	});
});
