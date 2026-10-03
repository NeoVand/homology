import { describe, expect, it } from 'vitest';
import { ballDivergence, enclosed, erf, field, rho, sphereFlux, type V3 } from './flux3d';

describe('3D divergence theorem figure', () => {
	it('erf', () => {
		expect(erf(0.5)).toBeCloseTo(0.5204998778130465, 12);
		expect(erf(-1.3)).toBeCloseTo(-0.9340079449406524, 12);
		expect(erf(2)).toBeCloseTo(0.9953222650189527, 12);
	});
	it('div F = ρ (finite differences)', () => {
		const h = 1e-4;
		for (const p of [
			[0.1, 0.2, -0.1],
			[0.5, -0.3, 0.2],
			[1.1, 0.4, 0.6]
		] as V3[]) {
			let d = 0;
			for (let i = 0; i < 3; i++) {
				const a = [...p] as V3;
				const b = [...p] as V3;
				a[i] += h;
				b[i] -= h;
				d += (field(a, 0.3)[i] - field(b, 0.3)[i]) / (2 * h);
			}
			expect(d).toBeCloseTo(rho(p), 5);
		}
	});
	it('a centred sphere encloses exactly enclosed(R)', () => {
		expect(sphereFlux([0, 0, 0], 0.9)).toBeCloseTo(enclosed(0.9), 8);
		expect(ballDivergence([0, 0, 0], 0.9)).toBeCloseTo(enclosed(0.9), 5);
	});
	const cases: [V3, number, number][] = [
		[[0.4, 0, 0], 1.3, 0],
		[[0.4, 0, 0], 1.3, 0.35],
		[[0.9, 0, 0], 1.0, 0.35],
		[[1.4, 0, 0], 1.2, 0.35],
		[[2.6, 0, 0], 1.0, 0.35],
		[[0.3, 0, 0], 0.4, 0]
	];
	for (const [c, R, wind] of cases) {
		it(`flux out of the sphere = divergence inside (c=${c[0]}, R=${R}, wind=${wind})`, () => {
			const flux = sphereFlux(c, R, wind);
			const div = ballDivergence(c, R);
			expect(Math.abs(flux - div)).toBeLessThan(5e-4);
		});
	}
});
