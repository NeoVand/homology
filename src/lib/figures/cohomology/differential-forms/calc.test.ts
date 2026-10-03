import { describe, expect, it } from 'vitest';
import {
	angleSum,
	circlePoly,
	closedCatmullRom,
	fluxIntegral,
	integrate1D,
	lineIntegral,
	regionIntegral,
	signedArea,
	vdc,
	windingNumber,
	type Vec2
} from './calc';
import { fields } from './fields';

const TAU = 2 * Math.PI;

// a few closed loops: a circle, a smooth blob, a figure eight, a curve that winds twice
const blob: Vec2[] = closedCatmullRom(
	[
		[-1.2, -0.6],
		[0.3, -1.1],
		[1.4, -0.2],
		[0.9, 0.9],
		[-0.4, 1.0],
		[-1.5, 0.4]
	],
	40
);
const twice: Vec2[] = closedCatmullRom(
	[0, 2, 4, 1, 3].map((k) => {
		const a = (TAU * k) / 5 + 0.3;
		return [1.4 * Math.cos(a), 1.4 * Math.sin(a)] as Vec2;
	}),
	40
);
const eight: Vec2[] = Array.from({ length: 400 }, (_, i) => {
	const t = (TAU * i) / 400;
	return [1.5 * Math.sin(t), 0.8 * Math.sin(2 * t)] as Vec2;
});
const loops: Record<string, Vec2[]> = {
	circle: circlePoly([0.2, -0.1], 1.3, 300),
	blob,
	twice,
	eight,
	offCentre: circlePoly([1.2, 0.8], 0.5, 200)
};

describe('Green and divergence theorems on the figure presets', () => {
	for (const [name, F] of Object.entries(fields)) {
		if (F.singular) continue; // the vortex is tested separately
		for (const [lname, poly] of Object.entries(loops)) {
			it(`${name}: circulation = total curl inside (${lname})`, () => {
				const circ = lineIntegral(poly, F.F);
				const curl = regionIntegral(poly, F.curl);
				expect(circ).toBeCloseTo(curl, 6);
			});
			it(`${name}: flux = total divergence inside (${lname})`, () => {
				const flux = fluxIntegral(poly, F.F);
				const div = regionIntegral(poly, F.div);
				expect(flux).toBeCloseTo(div, 6);
			});
		}
	}

	it('rotation: circulation is twice the (winding-weighted) area', () => {
		for (const poly of Object.values(loops)) {
			expect(lineIntegral(poly, fields.rotation.F)).toBeCloseTo(2 * signedArea(poly), 9);
		}
	});

	it('a gradient field has zero circulation around every loop', () => {
		for (const key of ['hills', 'source', 'saddle', 'sourcesink']) {
			for (const poly of Object.values(loops)) expect(lineIntegral(poly, fields[key].F)).toBeCloseTo(0, 8);
		}
	});

	it('potentials really are potentials (finite differences)', () => {
		const h = 1e-5;
		for (const key of ['hills', 'source', 'saddle', 'sourcesink']) {
			const P = fields[key];
			for (const [x, y] of [
				[0.3, -0.7],
				[-1.1, 0.4],
				[1.7, 1.2]
			]) {
				const fx = (P.potential!(x + h, y) - P.potential!(x - h, y)) / (2 * h);
				const fy = (P.potential!(x, y + h) - P.potential!(x, y - h)) / (2 * h);
				const [Fx, Fy] = P.F(x, y);
				expect(fx).toBeCloseTo(Fx, 6);
				expect(fy).toBeCloseTo(Fy, 6);
			}
		}
	});

	it('curl and divergence formulas match finite differences', () => {
		const h = 1e-5;
		for (const P of Object.values(fields)) {
			for (const [x, y] of [
				[0.35, -0.65],
				[-1.05, 0.45],
				[1.6, 1.15]
			]) {
				const Fxp = P.F(x + h, y);
				const Fxm = P.F(x - h, y);
				const Fyp = P.F(x, y + h);
				const Fym = P.F(x, y - h);
				const Qx = (Fxp[1] - Fxm[1]) / (2 * h);
				const Py = (Fyp[0] - Fym[0]) / (2 * h);
				const Px = (Fxp[0] - Fxm[0]) / (2 * h);
				const Qy = (Fyp[1] - Fym[1]) / (2 * h);
				expect(P.curl(x, y)).toBeCloseTo(Qx - Py, 5);
				expect(P.div(x, y)).toBeCloseTo(Px + Qy, 5);
			}
		}
	});
});

describe('the vortex: ∮ dθ = 2π · winding number', () => {
	it('winding numbers of the test loops', () => {
		expect(windingNumber(loops.circle, [0, 0])).toBe(1);
		expect(windingNumber(loops.twice, [0, 0])).toBe(2);
		expect(windingNumber(loops.offCentre, [0, 0])).toBe(0);
		expect(windingNumber(loops.eight, [0.75, 0.0])).toBe(-1);
	});
	for (const [name, poly] of Object.entries(loops)) {
		it(`angle sum and line integral of the vortex field agree (${name})`, () => {
			const p: Vec2 = name === 'eight' ? [0.75, 0.05] : [0, 0];
			const w = windingNumber(poly, p);
			const vort = (x: number, y: number): Vec2 => {
				const dx = x - p[0];
				const dy = y - p[1];
				const r2 = dx * dx + dy * dy;
				return [-dy / r2, dx / r2];
			};
			expect(angleSum(poly, p)).toBeCloseTo(TAU * w, 9);
			expect(lineIntegral(poly, vort)).toBeCloseTo(TAU * w, 4);
		});
	}
	it('backwards loops wind −1', () => {
		const back = loops.circle.slice().reverse();
		expect(windingNumber(back, [0, 0])).toBe(-1);
		expect(angleSum(back)).toBeCloseTo(-TAU, 9);
	});
});

describe('helpers', () => {
	it('integrate1D', () => {
		expect(integrate1D(Math.sin, 0, Math.PI)).toBeCloseTo(2, 12);
	});
	it('van der Corput is a permutation of evenly spaced points', () => {
		const xs = Array.from({ length: 16 }, (_, k) => vdc(k)).sort((a, b) => a - b);
		xs.forEach((x, i) => expect(x).toBeCloseTo(i / 16, 12));
	});
	it('area of a (400-gon) circle', () => {
		const poly = circlePoly([0.3, 0.2], 2, 400);
		expect(regionIntegral(poly, () => 1)).toBeCloseTo(signedArea(poly), 10);
		expect(signedArea(poly)).toBeCloseTo(Math.PI * 4, 2);
	});
});
