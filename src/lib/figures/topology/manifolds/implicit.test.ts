import { describe, expect, it } from 'vitest';
import { connectedSumShapes, eulerCharacteristic, genusShape, isClosedOriented, surfaceNets } from './implicit';

describe('genus-g implicit surfaces meshed by surface nets', () => {
	for (const g of [0, 1, 2, 3]) {
		it(`genus ${g}: a closed oriented mesh with χ = 2 − 2g = ${2 - 2 * g}`, () => {
			const s = genusShape(g);
			const m = surfaceNets(s.f, s.min, s.max, 0.07);
			expect(m.indices.length).toBeGreaterThan(300);
			expect(isClosedOriented(m)).toBe(true);
			expect(eulerCharacteristic(m)).toBe(2 - 2 * g);
		}, 30000);
	}

	it('vertices lie on the surface and face normals point outwards', () => {
		const s = genusShape(0);
		const m = surfaceNets(s.f, s.min, s.max, 0.08);
		let maxErr = 0;
		for (let v = 0; v < m.positions.length / 3; v++) {
			const x = m.positions[v * 3];
			const y = m.positions[v * 3 + 1];
			const z = m.positions[v * 3 + 2];
			maxErr = Math.max(maxErr, Math.abs(s.f(x, y, z)));
		}
		expect(maxErr).toBeLessThan(1e-3);
		// a triangle's normal (by winding) should agree with its centroid direction on a sphere
		let agree = 0;
		const F = m.indices.length / 3;
		for (let t = 0; t < F; t++) {
			const [a, b, c] = [m.indices[t * 3], m.indices[t * 3 + 1], m.indices[t * 3 + 2]].map((i) => [
				m.positions[i * 3],
				m.positions[i * 3 + 1],
				m.positions[i * 3 + 2]
			]);
			const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
			const w = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
			const n = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
			const cen = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3];
			if (n[0] * cen[0] + n[1] * cen[1] + n[2] * cen[2] > 0) agree++;
		}
		expect(agree).toBe(F);
	});
});

describe('the connected sum of two tori', () => {
	it('two separate tori have χ = 0 + 0, and joining them by a tube gives χ = −2 (genus 2)', () => {
		const cs = connectedSumShapes();
		const apart = surfaceNets(cs.apart.f, cs.apart.min, cs.apart.max, 0.07);
		const joined = surfaceNets(cs.joined.f, cs.joined.min, cs.joined.max, 0.07);
		expect(isClosedOriented(apart)).toBe(true);
		expect(isClosedOriented(joined)).toBe(true);
		expect(eulerCharacteristic(apart)).toBe(0);
		expect(eulerCharacteristic(joined)).toBe(-2);
	}, 30000);
});
