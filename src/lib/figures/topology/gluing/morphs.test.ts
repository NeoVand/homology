import { describe, expect, it } from 'vitest';
import { presets, presetOrder, type PresetId } from './morphs';
import type { P3 } from './sheet';

const at = (id: PresetId, u: number, v: number, t: number): P3 => {
	const o = { x: 0, y: 0, z: 0 };
	presets[id].f(u, v, t, o);
	return o;
};
const dist = (a: P3, b: P3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/** pairs of boundary points that the gluing rule identifies, as functions of s ∈ [0,1] */
const rules: Record<PresetId, ((s: number) => [[number, number], [number, number]])[]> = {
	cylinder: [(s) => [[0, s], [1, s]]],
	mobius: [(s) => [[0, s], [1, 1 - s]]],
	torus: [(s) => [[0, s], [1, s]], (s) => [[s, 0], [s, 1]]],
	klein: [(s) => [[0, s], [1, s]], (s) => [[s, 0], [1 - s, 1]]],
	sphere: [(s) => [[s, 0], [0, s]], (s) => [[s, 1], [1, s]]],
	rp2: [(s) => [[s, 0], [1 - s, 1]], (s) => [[0, s], [1, 1 - s]]]
};

describe('gluing morphs', () => {
	for (const id of presetOrder) {
		it(`${id}: starts as the flat 3×3 square`, () => {
			for (const [u, v] of [[0, 0], [1, 0], [0.3, 0.8], [1, 1]]) {
				const p = at(id, u, v, 0);
				expect(Math.abs(p.x - (u - 0.5) * 3)).toBeLessThan(1e-9);
				expect(Math.abs(p.y - (v - 0.5) * 3)).toBeLessThan(1e-9);
				expect(Math.abs(p.z)).toBeLessThan(1e-9);
			}
		});

		it(`${id}: glued points coincide at the end`, () => {
			for (const rule of rules[id]) {
				for (let i = 0; i <= 40; i++) {
					const [[u1, v1], [u2, v2]] = rule(i / 40);
					expect(dist(at(id, u1, v1, 1), at(id, u2, v2, 1))).toBeLessThan(1e-6);
				}
			}
		});

		it(`${id}: glued points are apart early on`, () => {
			for (const rule of rules[id]) {
				const [[u1, v1], [u2, v2]] = rule(0.3);
				expect(dist(at(id, u1, v1, 0.15), at(id, u2, v2, 0.15))).toBeGreaterThan(0.05);
			}
		});

		it(`${id}: moves continuously (no jumps between nearby times)`, () => {
			const samples = [[0.1, 0.2], [0.5, 0.5], [0.9, 0.7], [0, 1], [0.25, 0.95]];
			for (let k = 0; k < 400; k++) {
				const t0 = k / 400;
				const t1 = (k + 1) / 400;
				for (const [u, v] of samples) {
					expect(dist(at(id, u, v, t0), at(id, u, v, t1))).toBeLessThan(0.12);
				}
			}
		});
	}

	it('the Möbius band glues with a flip (not straight)', () => {
		expect(dist(at('mobius', 0, 0.2, 1), at('mobius', 1, 0.2, 1))).toBeGreaterThan(0.3);
	});
	it('the Klein bottle glues its a-edges with a flip', () => {
		expect(dist(at('klein', 0.2, 0, 1), at('klein', 0.2, 1, 1))).toBeGreaterThan(0.1);
	});
	it('corners of the torus all meet at one point', () => {
		const c = [at('torus', 0, 0, 1), at('torus', 1, 0, 1), at('torus', 1, 1, 1), at('torus', 0, 1, 1)];
		for (const p of c) expect(dist(p, c[0])).toBeLessThan(1e-6);
	});
	it('corners of the projective plane form two classes', () => {
		const bl = at('rp2', 0, 0, 1);
		const br = at('rp2', 1, 0, 1);
		const tr = at('rp2', 1, 1, 1);
		const tl = at('rp2', 0, 1, 1);
		expect(dist(bl, tr)).toBeLessThan(1e-6);
		expect(dist(br, tl)).toBeLessThan(1e-6);
	});
	it('corner classes listed in the presets are exactly the coinciding corners', () => {
		for (const id of presetOrder) {
			const P = presets[id];
			const pts = [at(id, 0, 0, 1), at(id, 1, 0, 1), at(id, 1, 1, 1), at(id, 0, 1, 1)];
			for (let i = 0; i < 4; i++)
				for (let j = i + 1; j < 4; j++) {
					const same = dist(pts[i], pts[j]) < 1e-6;
					expect(same).toBe(P.corners[i] === P.corners[j]);
				}
		}
	});
});
