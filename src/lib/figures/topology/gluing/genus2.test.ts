import { describe, expect, it } from 'vitest';
import { G2, Genus2, octagonCorner } from './genus2';
import { crossings, gridTriangles, type Vec } from './selfIntersect';

const P = () => ({ x: 0, y: 0, z: 0 });
const d = (a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const at = (g: Genus2, h: number, s: number, r: number) => g.point(h, s, r, P());

describe('octagon to genus two', () => {
	it('starts as the regular octagon, cut along its diagonal c', () => {
		const g = new Genus2();
		g.setTime(0);
		// the outer edges of half 1 run V0 → V1 → V2 → V3 → V4, those of half 2 V4 → … → V0
		for (const h of [0, 1])
			for (let k = 0; k <= 4; k++) {
				const [x, y] = octagonCorner(k + 4 * h);
				expect(d(at(g, h, k / 4, 1), { x, y, z: 0 })).toBeLessThan(1e-9);
			}
		// the two copies of c lie on each other, the right way round
		for (let s = 0; s <= 1; s += 0.05) {
			const p = at(g, 0, s, 0);
			expect(d(p, at(g, 1, 1 - s, 0))).toBeLessThan(1e-9);
			expect(Math.abs(p.x)).toBeLessThan(1e-9);
		}
		// the corners at the ends of c are single points (the sheet's sides s = 0 and s = 1)
		for (let r = 0; r <= 1; r += 0.1) {
			expect(d(at(g, 0, 0, r), at(g, 0, 0, 1))).toBeLessThan(1e-9);
			expect(d(at(g, 0, 1, r), at(g, 0, 1, 1))).toBeLessThan(1e-9);
		}
	});

	it('ends glued: a to a⁻¹ and b to b⁻¹ on each half, and the two copies of c to each other', () => {
		const g = new Genus2();
		g.setTime(1);
		for (const h of [0, 1])
			for (let l = 0; l <= 1; l += 0.02) {
				expect(d(at(g, h, l / 4, 1), at(g, h, (3 - l) / 4, 1))).toBeLessThan(1e-9);
				expect(d(at(g, h, (1 + l) / 4, 1), at(g, h, (4 - l) / 4, 1))).toBeLessThan(1e-9);
			}
		for (let s = 0; s <= 1; s += 0.02) {
			const p = at(g, 0, s, 0);
			expect(d(p, at(g, 1, 1 - s, 0))).toBeLessThan(1e-9);
			// … on the waist of the neck
			expect(Math.abs(p.x)).toBeLessThan(1e-9);
			expect(Math.abs(Math.hypot(p.y, p.z) - G2.waist)).toBeLessThan(1e-9);
		}
	});

	it('the two halves keep to their own sides while they lie in the plane', () => {
		const g = new Genus2();
		for (let t = 0.07; t <= 0.38; t += 0.01) {
			g.setTime(t);
			for (let s = 0; s <= 1; s += 0.02)
				for (let r = 0; r <= 1; r += 0.1) {
					expect(at(g, 0, s, r).x).toBeLessThan(0);
					expect(at(g, 1, s, r).x).toBeGreaterThan(0);
				}
		}
	});

	it('once curled up, the slit from the hole to the corner is closed', () => {
		const g = new Genus2();
		for (const t of [0.38, 0.5, 0.7, 0.9, 1]) {
			g.setTime(t);
			for (const h of [0, 1]) for (let r = 0; r <= 1; r += 0.05) expect(d(at(g, h, 0, r), at(g, h, 1, r))).toBeLessThan(1e-9);
		}
	});

	it('moves continuously', () => {
		const g = new Genus2();
		const pts: [number, number, number][] = [];
		for (const h of [0, 1]) for (const s of [0, 0.1, 0.3, 0.5, 0.62, 0.9, 1]) for (const r of [0, 0.05, 0.2, 0.6, 1]) pts.push([h, s, r]);
		let prev = pts.map(() => P());
		g.setTime(0);
		pts.forEach(([h, s, r], i) => g.point(h, s, r, prev[i]));
		const dt = 1 / 2000;
		let worst = 0;
		for (let t = dt; t <= 1 + 1e-9; t += dt) {
			g.setTime(t);
			const now = pts.map(([h, s, r]) => at(g, h, s, r));
			now.forEach((p, i) => (worst = Math.max(worst, d(p, prev[i]))));
			prev = now;
		}
		// no point jumps: at most a few hundredths of a unit per two-thousandth of the way
		expect(worst).toBeLessThan(0.05);
	});

	it('never passes through itself on the way, and the finished surface is embedded', () => {
		const g = new Genus2();
		const nu = 96;
		const nv = 32;
		const grid = (h: number) => {
			const pos = new Float64Array((nu + 1) * (nv + 1) * 3);
			const p = P();
			for (let j = 0; j <= nv; j++)
				for (let i = 0; i <= nu; i++) {
					g.gridPoint(h, i / nu, j / nv, p);
					const k = 3 * (j * (nu + 1) + i);
					pos[k] = p.x;
					pos[k + 1] = p.y;
					pos[k + 2] = p.z;
				}
			return pos;
		};
		for (const t of [0.1, 0.25, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 1]) {
			g.setTime(t);
			const tris: Vec[][] = [...gridTriangles(grid(0), nu, nv), ...gridTriangles(grid(1), nu, nv)];
			expect(crossings(tris).length, `t = ${t}`).toBe(0);
		}
	});
});
