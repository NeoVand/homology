import { describe, expect, it } from 'vitest';
import { DynTube } from './dynTube';

describe('a tube that can bend', () => {
	it('faces outwards, so that the tube is seen from outside and never into', () => {
		for (const closed of [true, false]) {
			const S = 64;
			const t = new DynTube(S, { closed, radius: 0.1, halo: false, xray: 0 });
			for (let i = 0; i < S; i++) {
				const a = (2 * Math.PI * i) / S;
				t.points.set([Math.cos(a), Math.sin(a), 0.3 * Math.sin(3 * a)], 3 * i);
			}
			t.update();
			const g = (t.group.children[0] as unknown as { geometry: import('three').BufferGeometry }).geometry;
			const P = g.attributes.position.array;
			const N = g.attributes.normal.array;
			const idx = g.index!.array;
			for (let f = 0; f < idx.length; f += 3) {
				const [a, b, c] = [idx[f], idx[f + 1], idx[f + 2]];
				const u = [0, 1, 2].map((k) => P[3 * b + k] - P[3 * a + k]);
				const v = [0, 1, 2].map((k) => P[3 * c + k] - P[3 * a + k]);
				const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
				expect(n[0] * N[3 * a] + n[1] * N[3 * a + 1] + n[2] * N[3 * a + 2]).toBeGreaterThan(0);
			}
		}
	});
});
