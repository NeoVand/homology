import { describe, expect, it } from 'vitest';
import { circle, sphereOcta, sphereTetra } from '$lib/math/examples';
import { matmul } from '$lib/math/linalg';
import { homology, groupName } from '$lib/math/homology';
import {
	applyMatrix,
	chainMapMatrix,
	circlePreimages,
	clampShift,
	isSimplePolygon,
	isSimplicialMap,
	mazeCurve,
	polygonLoop,
	rayCrossings,
	retractionPoint,
	simplicialDegree,
	sortWithSign,
	stir,
	stirFixedPoints,
	torusLefschetz,
	torusLinearFixedPoints,
	windingNumber,
	windingOfLabels,
	type StirParams
} from './maps';

function rng(seed: number) {
	let s = seed >>> 0;
	return () => {
		s = (s + 0x6d2b79f5) >>> 0;
		let t = s;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

describe('chain maps induced by simplicial maps', () => {
	it('sorting sign', () => {
		expect(sortWithSign([0, 1, 2]).sign).toBe(1);
		expect(sortWithSign([1, 0, 2]).sign).toBe(-1);
		expect(sortWithSign([2, 0, 1])).toEqual({ sorted: [0, 1, 2], sign: 1 });
		expect(sortWithSign([2, 1, 0]).sign).toBe(-1);
	});

	it('every labelling of the hexagon by {0,1,2} is a simplicial map to the hollow triangle', () => {
		const H = circle(6);
		const T = circle(3);
		const z6 = polygonLoop(H, 6);
		const z3 = polygonLoop(T, 3);
		expect(H.boundary(1, z6).every((x) => x === 0)).toBe(true);
		expect(T.boundary(1, z3).every((x) => x === 0)).toBe(true);
		for (let code = 0; code < 3 ** 6; code++) {
			const labels = Array.from({ length: 6 }, (_, i) => Math.floor(code / 3 ** i) % 3);
			const f = (v: number) => labels[v];
			expect(isSimplicialMap(H, T, f)).toBe(true);
			const F1 = chainMapMatrix(H, T, f, 1);
			const F0 = chainMapMatrix(H, T, f, 0);
			// chain map: ∂ f_# = f_# ∂
			expect(matmul(T.boundaryMatrix(1), F1)).toEqual(matmul(F0, H.boundaryMatrix(1)));
			// f_#(z6) = w · z3 with w the winding number of the labels
			const w = windingOfLabels(labels);
			expect(Number.isInteger(w)).toBe(true);
			expect(applyMatrix(F1, z6)).toEqual(z3.map((x) => x * w + 0));
		}
	});

	it('the presets used in the figure have the advertised degrees', () => {
		expect(windingOfLabels([0, 1, 2, 0, 1, 2])).toBe(2);
		expect(windingOfLabels([0, 0, 1, 1, 2, 2])).toBe(1);
		expect(windingOfLabels([0, 1, 2, 2, 1, 0])).toBe(0);
		expect(windingOfLabels([0, 2, 1, 0, 2, 1])).toBe(-2);
		expect(windingOfLabels([0, 0, 0, 1, 1, 1])).toBe(0);
		expect(windingOfLabels([0, 2, 2, 1, 1, 0])).toBe(-1);
	});

	it('triangle chain maps commute with ∂ (collapse of a filled triangle)', () => {
		// vertex map of the octahedral sphere onto the tetrahedral sphere: any vertex map works
		const S = sphereOcta();
		const T = sphereTetra();
		const f = (v: number) => [0, 1, 2, 3, 0, 1][v];
		expect(isSimplicialMap(S, T, f)).toBe(true);
		for (const k of [1, 2]) {
			const Fk = chainMapMatrix(S, T, f, k);
			const Fk1 = chainMapMatrix(S, T, f, k - 1);
			expect(matmul(T.boundaryMatrix(k), Fk)).toEqual(matmul(Fk1, S.boundaryMatrix(k)));
		}
	});
});

describe('degree of maps of spheres (computed with chain maps)', () => {
	const S = sphereOcta(); // ±x = 0,1; ±y = 2,3; ±z = 4,5
	it('identity has degree 1, a reflection −1', () => {
		expect(simplicialDegree(S, (v) => v)).toBe(1);
		const reflect = (v: number) => [1, 0, 2, 3, 4, 5][v]; // x ↦ −x
		expect(simplicialDegree(S, reflect)).toBe(-1);
	});
	it('the antipodal map of S² has degree (−1)^3 = −1', () => {
		const antipode = (v: number) => [1, 0, 3, 2, 5, 4][v];
		expect(simplicialDegree(S, antipode)).toBe(-1);
	});
	it('a rotation (cyclically permuting the axes) has degree +1', () => {
		const rot = (v: number) => [2, 3, 4, 5, 0, 1][v];
		expect(simplicialDegree(S, rot)).toBe(1);
	});
	it('the antipodal map of the hexagon circle has degree (−1)^2 = +1', () => {
		const H = circle(6);
		const z = polygonLoop(H, 6);
		const F = chainMapMatrix(H, H, (v) => (v + 3) % 6, 1);
		expect(applyMatrix(F, z)).toEqual(z);
		const flip = chainMapMatrix(H, H, (v) => (6 - v) % 6, 1); // reflection
		expect(applyMatrix(flip, z)).toEqual(z.map((x) => -x));
	});
	it('spheres have the homology the chapter quotes', () => {
		expect(homology(sphereOcta()).map((g) => groupName(g))).toEqual(['ℤ', '0', 'ℤ']);
	});
});

describe('Brouwer: the stirring map', () => {
	const r = rng(7);
	it('maps the disk into itself', () => {
		for (let trial = 0; trial < 50; trial++) {
			const P = clampShift({ twist: (r() - 0.5) * 16, scale: 0.3 + 0.65 * r(), cx: r() - 0.5, cy: r() - 0.5 });
			for (let i = 0; i < 200; i++) {
				const t = r() * Math.PI * 2;
				const rad = Math.sqrt(r());
				const [x, y] = stir(P, rad * Math.cos(t), rad * Math.sin(t));
				expect(Math.hypot(x, y)).toBeLessThanOrEqual(1 + 1e-12);
			}
		}
	});
	it('always has a fixed point, and the fixed-point indices add up to 1', () => {
		let multi = 0;
		for (let trial = 0; trial < 120; trial++) {
			const P: StirParams = clampShift({
				twist: (r() - 0.5) * 14,
				scale: 0.35 + 0.6 * r(),
				cx: (r() - 0.5) * 1.2,
				cy: (r() - 0.5) * 1.2
			});
			const fps = stirFixedPoints(P);
			expect(fps.length).toBeGreaterThan(0);
			for (const p of fps) {
				const [fx, fy] = stir(P, p.x, p.y);
				expect(Math.hypot(fx - p.x, fy - p.y)).toBeLessThan(1e-9);
			}
			if (fps.some((p) => p.index === 0)) continue; // degenerate: skip the index count
			expect(fps.reduce((s, p) => s + p.index, 0)).toBe(1);
			if (fps.length > 1) multi++;
		}
		// the figure's claim that several fixed points can appear is real
		expect(multi).toBeGreaterThan(0);
	});
	it('the default figure setting has three fixed points (indices +1, −1, +1)', () => {
		const P = { twist: 9, scale: 0.9, cx: -0.05, cy: 0.05 };
		const fps = stirFixedPoints(P);
		expect(fps.length).toBe(3);
		expect(fps.map((p) => p.index).sort()).toEqual([-1, 1, 1]);
		// and they are well separated (so the figure's labels do not collide)
		for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) expect(Math.hypot(fps[i].x - fps[j].x, fps[i].y - fps[j].y)).toBeGreaterThan(0.4);
	});
	it('the would-be retraction fixes the boundary circle', () => {
		const P = { twist: 2, scale: 0.6, cx: 0.2, cy: -0.1 };
		for (let i = 0; i < 24; i++) {
			const t = (i / 24) * Math.PI * 2;
			const q = retractionPoint(P, Math.cos(t), Math.sin(t))!;
			expect(Math.hypot(q[0] - Math.cos(t), q[1] - Math.sin(t))).toBeLessThan(1e-9);
		}
	});
});

describe('degree of circle maps by counting preimages', () => {
	it('signed preimage count equals n', () => {
		const r = rng(11);
		for (let trial = 0; trial < 300; trial++) {
			const n = Math.floor(r() * 7) - 3;
			const a = r() * 2.8;
			const phi = r() * Math.PI * 2;
			const pre = circlePreimages(n, a, phi);
			expect(pre.reduce((s, p) => s + p.sign, 0)).toBe(n);
			// with no wobble there are exactly |n| preimages
			if (n !== 0) expect(circlePreimages(n, 0, phi).length).toBe(Math.abs(n));
		}
	});
});

describe('Jordan curve: the serpent maze', () => {
	const poly = mazeCurve();
	it('is a simple closed polygon', () => {
		expect(isSimplePolygon(poly)).toBe(true);
		expect(isSimplePolygon(mazeCurve({ legs: 5 }))).toBe(true);
	});
	it('winding number is ±1 inside the corridor, 0 in the gaps, and matches ray parity', () => {
		const inside = windingNumber(poly, [80, 200]); // middle of leg 0
		expect(Math.abs(inside)).toBe(1);
		expect(windingNumber(poly, [124, 200])).toBe(0); // gap between legs 0 and 1
		expect(windingNumber(poly, [300, 20])).toBe(0); // above everything
		for (let x = 10; x < 600; x += 7)
			for (let y = 10; y < 400; y += 9) {
				const w = windingNumber(poly, [x + 0.37, y + 0.21]);
				const c = rayCrossings(poly, [x + 0.37, y + 0.21]).length;
				expect(Math.abs(w)).toBe(c % 2);
			}
	});
	it('odd numbers of legs also give a simple curve with the same inside/outside rule', () => {
		const p5 = mazeCurve({ legs: 5 });
		for (let x = 10; x < 600; x += 11)
			for (let y = 10; y < 400; y += 13) {
				const w = windingNumber(p5, [x + 0.37, y + 0.21]);
				expect(Math.abs(w)).toBe(rayCrossings(p5, [x + 0.37, y + 0.21]).length % 2);
			}
	});
});

describe('Lefschetz numbers of linear torus maps', () => {
	it('number of fixed points is |det(I − A)|', () => {
		const mats: [[number, number], [number, number]][] = [
			[
				[2, 1],
				[1, 1]
			],
			[
				[3, 1],
				[2, 1]
			],
			[
				[-1, 0],
				[0, -1]
			],
			[
				[2, 0],
				[0, 3]
			],
			[
				[0, 1],
				[-1, 0]
			]
		];
		for (const A of mats) {
			const L = torusLefschetz(A);
			expect(torusLinearFixedPoints(A).length).toBe(Math.abs(L));
		}
		expect(
			torusLefschetz([
				[2, 1],
				[1, 1]
			])
		).toBe(-1);
		expect(
			torusLefschetz([
				[-1, 0],
				[0, -1]
			])
		).toBe(4);
	});
});
