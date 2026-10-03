import { describe, expect, it } from 'vitest';
import {
	TAU,
	annulusEdges,
	annulusTris,
	conePotential,
	deRhamCochain,
	gallery,
	hiddenF,
	hiddenPQ,
	innerLoop,
	loopSum,
	outerLoop,
	segmentAvoidsDisk,
	starR
} from './derham';
import {
	angleSum,
	circlePoly,
	closedCatmullRom,
	lineIntegral,
	regionIntegral,
	signedArea,
	windingNumber,
	type Vec2
} from '$lib/figures/cohomology/differential-forms/calc';

const ring = (c: Vec2, r: number, n: number, k = 1): Vec2[] =>
	Array.from({ length: n }, (_, i) => [c[0] + r * Math.cos((TAU * k * i) / n + 0.2), c[1] + r * Math.sin((TAU * k * i) / n + 0.2)] as Vec2);

describe('the angle form: ∮ dθ = 2π · winding number', () => {
	const loops: [string, Vec2[]][] = [
		['once', closedCatmullRom(ring([0.1, 0], 1.2, 6), 60)],
		['twice', closedCatmullRom([0, 2, 4, 1, 3].map((k) => ring([0, 0], 1.3, 5)[k]), 60)],
		['not around', closedCatmullRom(ring([1.4, 0.3], 0.5, 6), 60)],
		['backwards', closedCatmullRom(ring([0, 0.1], 1.1, 6).reverse(), 60)]
	];
	for (const [name, poly] of loops) {
		it(name, () => {
			const w = windingNumber(poly, [0, 0]);
			expect(lineIntegral(poly, gallery.angle.PQ)).toBeCloseTo(TAU * w, 6);
			expect(angleSum(poly, [0, 0])).toBeCloseTo(TAU * w, 9);
		});
	}
	it('expected windings', () => {
		expect(loops.map(([, p]) => windingNumber(p, [0, 0]))).toEqual([1, 2, 0, -1]);
	});
	it('the angle form is closed (finite differences)', () => {
		const h = 1e-5;
		for (const [x, y] of [
			[0.7, 0.2],
			[-1.1, 0.9],
			[0.3, -1.6]
		]) {
			const Qx = (gallery.angle.PQ(x + h, y)[1] - gallery.angle.PQ(x - h, y)[1]) / (2 * h);
			const Py = (gallery.angle.PQ(x, y + h)[0] - gallery.angle.PQ(x, y - h)[0]) / (2 * h);
			expect(Qx - Py).toBeCloseTo(0, 6);
		}
	});
});

describe('the gallery', () => {
	const big = circlePoly([0.2, 0.1], 1.6, 800);
	const small = circlePoly([1.2, 0.9], 0.35, 400);
	const aroundA = circlePoly([-1, 0], 0.5, 600);
	const aroundB = circlePoly([1, 0], 0.5, 600);
	it('exact forms give zero around every loop', () => {
		for (const key of ['bowl', 'dipole']) {
			for (const poly of [big, small, aroundA, aroundB]) expect(lineIntegral(poly, gallery[key].PQ)).toBeCloseTo(0, 5);
		}
	});
	it('potentials are potentials', () => {
		const h = 1e-5;
		for (const key of ['bowl', 'dipole']) {
			const F = gallery[key];
			for (const [x, y] of [
				[0.6, 0.4],
				[-1.3, 0.7]
			]) {
				const fx = (F.potential!(x + h, y) - F.potential!(x - h, y)) / (2 * h);
				const fy = (F.potential!(x, y + h) - F.potential!(x, y - h)) / (2 * h);
				expect(fx).toBeCloseTo(F.PQ(x, y)[0], 5);
				expect(fy).toBeCloseTo(F.PQ(x, y)[1], 5);
			}
		}
	});
	it('−y dx + x dy picks up twice the enclosed area', () => {
		for (const poly of [big, small]) expect(lineIntegral(poly, gallery.swirl.PQ)).toBeCloseTo(2 * signedArea(poly), 9);
		expect(lineIntegral(big, gallery.swirl.PQ)).toBeCloseTo(regionIntegral(big, gallery.swirl.g), 9);
	});
	it('two vortices: +2π around a, −2π around b, 0 around both', () => {
		expect(lineIntegral(aroundA, gallery.pair.PQ)).toBeCloseTo(TAU, 5);
		expect(lineIntegral(aroundB, gallery.pair.PQ)).toBeCloseTo(-TAU, 5);
		expect(lineIntegral(circlePoly([0, 0], 2, 800), gallery.pair.PQ)).toBeCloseTo(0, 5);
	});
});

describe('Poincaré lemma: the cone construction', () => {
	it('recovers the hidden potential up to a constant on the star', () => {
		const c: Vec2 = [0, 0];
		for (const th of [0.3, 1.4, 2.8, 4.1, 5.5]) {
			for (const s of [0.2, 0.6, 0.95]) {
				const r = starR(th) * s;
				const p: Vec2 = [r * Math.cos(th), r * Math.sin(th)];
				expect(conePotential(hiddenPQ, c, p)).toBeCloseTo(hiddenF(p[0], p[1]) - hiddenF(0, 0), 8);
			}
		}
	});
	it('works from any centre in the kernel of the star (here: near the origin)', () => {
		const c: Vec2 = [0.3, -0.2];
		const p: Vec2 = [-0.9, 0.8];
		expect(conePotential(hiddenPQ, c, p)).toBeCloseTo(hiddenF(p[0], p[1]) - hiddenF(c[0], c[1]), 8);
	});
	it('the star is star-shaped (radius stays positive)', () => {
		for (let k = 0; k < 360; k++) expect(starR((TAU * k) / 360)).toBeGreaterThan(1);
	});
	it('on the annulus, straight rays from the centre can be blocked by the hole', () => {
		expect(segmentAvoidsDisk([1.2, 0], [-1.2, 0.1], 0.55)).toBe(false);
		expect(segmentAvoidsDisk([1.2, 0], [0.9, 1.0], 0.55)).toBe(true);
	});
	it('along an unblocked segment, the cone integral of dθ is the subtended angle', () => {
		const c: Vec2 = [1.2, 0];
		const p: Vec2 = [0.3, 1.4];
		expect(conePotential(gallery.angle.PQ, c, p)).toBeCloseTo(Math.atan2(1.4, 0.3), 5);
	});
});

describe('the de Rham map on the triangulated annulus', () => {
	const angle = deRhamCochain('angle').map((v) => v / TAU);
	it('edge values are 1/3, −1/6, +1/6 of a turn', () => {
		// edges in order: 01 02 03 04 12 14 15 23 25 34 35 45
		const expected = [1 / 3, -1 / 3, -1 / 6, 1 / 6, 1 / 3, -1 / 6, 1 / 6, 1 / 6, -1 / 6, 1 / 3, -1 / 3, 1 / 3];
		angle.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 12));
	});
	it('closed ⇒ cocycle: the sum around every triangle is 0', () => {
		const c = deRhamCochain('angle');
		for (const t of annulusTris) expect(loopSum(c, t)).toBeCloseTo(0, 12);
	});
	it('the loops around the hole give one full turn', () => {
		const c = deRhamCochain('angle');
		expect(loopSum(c, innerLoop)).toBeCloseTo(TAU, 12);
		expect(loopSum(c, outerLoop)).toBeCloseTo(TAU, 12);
	});
	it('the integrated dθ is also co-closed (net flow 0 at every vertex): the harmonic, most evenly spread representative', () => {
		const c = deRhamCochain('angle');
		for (let v = 0; v < 6; v++) {
			let s = 0;
			annulusEdges.forEach(([i, j], k) => {
				if (j === v) s += c[k];
				if (i === v) s -= c[k];
			});
			expect(s).toBeCloseTo(0, 12);
		}
	});
	it('x dy is not closed: triangle sums are the triangle areas', () => {
		const c = deRhamCochain('xdy');
		const pos = [
			[0, 1, 4],
			[0, 3, 4]
		];
		for (const t of pos) expect(Math.abs(loopSum(c, t))).toBeGreaterThan(0.1);
	});
	it('an exact form gives a coboundary: all loop sums vanish', () => {
		const c = deRhamCochain('exact');
		expect(loopSum(c, innerLoop)).toBeCloseTo(0, 12);
		expect(loopSum(c, outerLoop)).toBeCloseTo(0, 12);
		for (const t of annulusTris) expect(loopSum(c, t)).toBeCloseTo(0, 12);
	});
});
