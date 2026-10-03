import { describe, expect, it } from 'vitest';
import { collapses, collapseOrder } from './collapses';

const at = (id: keyof typeof collapses, u: number, v: number, t: number) => {
	const o = { x: 0, y: 0, z: 0 };
	collapses[id].f(u, v, t, o);
	return o;
};

describe('collapsing a subspace to a point', () => {
	for (const id of collapseOrder) {
		it(`${id}: every point of A ends up at one point`, () => {
			for (const A of collapses[id].A) {
				const [u0, v0] = A(0);
				const p0 = at(id, u0, v0, 1);
				for (let s = 0; s <= 1; s += 0.05) {
					const [u, v] = A(s);
					const p = at(id, u, v, 1);
					expect(Math.hypot(p.x - p0.x, p.y - p0.y, p.z - p0.z)).toBeLessThan(1e-6);
				}
			}
		});
		it(`${id}: before the collapse, A is a genuine circle`, () => {
			const A = collapses[id].A[0];
			const [u1, v1] = A(0);
			const [u2, v2] = A(0.5);
			const p1 = at(id, u1, v1, 0);
			const p2 = at(id, u2, v2, 0);
			expect(Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z)).toBeGreaterThan(0.3);
		});
		it(`${id}: points outside A stay apart`, () => {
			const p = at(id, 0.25, 0.3, 1);
			const q = at(id, 0.75, 0.3, 1);
			expect(Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z)).toBeGreaterThan(0.1);
		});
	}
	it('the two collapsed points of the suspension are different', () => {
		const n = at('susp', 0.3, 0, 1);
		const s = at('susp', 0.3, 1, 1);
		expect(Math.hypot(n.x - s.x, n.y - s.y, n.z - s.z)).toBeGreaterThan(1);
	});
});
