import { describe, expect, it } from 'vitest';
import { angleDefects, eulerCharacteristic, icosphere, shapeSphere, shapeTorus, sum, torusGrid, vertexAreas, type TriMesh } from './mesh';
import { circleLoop, fieldAngle, indexAtInfinity, indexOf, windingAlong, type Zero, type ZeroKind } from './fields';
import {
	angleSum,
	circulation,
	closedSpline,
	fromAngles,
	phaseMismatch,
	sectionValue,
	sectionZeros,
	sphericalArea,
	turningNumber,
	wuYang,
	type V3
} from './geometry';

const TAU = 2 * Math.PI;

describe('discrete Gauss–Bonnet: total angle defect = 2πχ', () => {
	it('regular solids (Descartes): every convex polyhedron has total defect 4π', () => {
		// cube: 8 vertices, 3 right angles each
		expect(8 * (TAU - 3 * (Math.PI / 2))).toBeCloseTo(4 * Math.PI, 12);
		// tetrahedron, octahedron, icosahedron, dodecahedron
		expect(4 * (TAU - 3 * (Math.PI / 3))).toBeCloseTo(4 * Math.PI, 12);
		expect(6 * (TAU - 4 * (Math.PI / 3))).toBeCloseTo(4 * Math.PI, 12);
		expect(12 * (TAU - 5 * (Math.PI / 3))).toBeCloseTo(4 * Math.PI, 12);
		expect(20 * (TAU - 3 * ((3 * Math.PI) / 5))).toBeCloseTo(4 * Math.PI, 12);
	});
	it('icospheres at every level: χ = 2 and defects sum to 4π', () => {
		for (const level of [0, 1, 2, 3, 4]) {
			const m = icosphere(level);
			expect(eulerCharacteristic(m)).toBe(2);
			expect(sum(angleDefects(m))).toBeCloseTo(4 * Math.PI, 9);
		}
	});
	it('a wildly sculpted sphere still has total defect exactly 4π', () => {
		const base = icosphere(4);
		const pos = new Float64Array(base.pos.length);
		shapeSphere(base.pos, pos, {
			R: 1.4,
			bumps: [
				{ at: [0, 1, 0], amp: 0.7, width: 0.35 },
				{ at: [1, 0, 0], amp: -0.4, width: 0.5 },
				{ at: [0, 0, 1], amp: 0.5, width: 0.25 }
			],
			waves: 0.25,
			squash: 0.7,
			twist: 0.6
		});
		const m: TriMesh = { pos, tri: base.tri };
		const d = angleDefects(m);
		expect(sum(d)).toBeCloseTo(4 * Math.PI, 8);
		// … even though the curvature now takes both signs
		expect(Math.min(...d)).toBeLessThan(0);
		expect(Math.max(...d)).toBeGreaterThan(0);
	});
	it('tori (plain and bumpy): χ = 0 and defects sum to 0', () => {
		const g = torusGrid(96, 40);
		const pos = new Float64Array(g.uv.length * 1.5);
		for (const bumps of [[], [{ at: [1, 2, 0] as [number, number, number], amp: 0.8, width: 0.4 }]]) {
			shapeTorus(g.uv, pos, { R: 1.6, r: 0.6, bumps, waves: 0.1, squash: 1.2, twist: 0.3 });
			const m: TriMesh = { pos, tri: g.tri };
			expect(eulerCharacteristic(m)).toBe(0);
			expect(Math.abs(sum(angleDefects(m)))).toBeLessThan(1e-8);
		}
	});
	it('the round torus: positive curvature outside, negative inside, cancelling', () => {
		const g = torusGrid(120, 60);
		const pos = new Float64Array(g.uv.length * 1.5);
		shapeTorus(g.uv, pos, { R: 1.6, r: 0.6, bumps: [], waves: 0, squash: 1, twist: 0 });
		const d = angleDefects({ pos, tri: g.tri });
		let pos_ = 0;
		let neg = 0;
		d.forEach((x) => (x > 0 ? (pos_ += x) : (neg += x)));
		// ∫ K dA over the outer half = ∫cos v du dv over |v| < π/2 = 2π · 2 = 4π
		expect(pos_).toBeCloseTo(4 * Math.PI, 1);
		expect(neg).toBeCloseTo(-4 * Math.PI, 1);
	});
	it('defect / area approximates K = 1/R² on a round sphere', () => {
		const m = icosphere(4);
		const R = 2;
		const pos = m.pos.map((x) => x * R);
		const d = angleDefects({ pos, tri: m.tri });
		const A = vertexAreas({ pos, tri: m.tri });
		// an inscribed polyhedron has slightly less area than the sphere
		expect(sum(A) / (4 * Math.PI * R * R)).toBeGreaterThan(0.995);
		expect(sum(A) / (4 * Math.PI * R * R)).toBeLessThan(1);
		const k = d[100] / A[100];
		expect(k).toBeGreaterThan(0.2);
		expect(k).toBeLessThan(0.3);
	});
});

describe('indices of zeros of vector fields', () => {
	const kinds: ZeroKind[] = ['source', 'sink', 'centre', 'saddle', 'dipole', 'monkey'];
	it('the winding number around a single zero is its index', () => {
		for (const kind of kinds) {
			const Z: Zero[] = [{ x: 0.3, y: -0.2, kind }];
			const w = windingAlong((x, y) => fieldAngle(Z, x, y), circleLoop(0.3, -0.2, 0.5));
			expect(Math.round(w)).toBe(indexOf[kind]);
			expect(Math.abs(w - Math.round(w))).toBeLessThan(1e-9);
		}
	});
	it('a loop around several zeros counts the sum of their indices; a loop around none counts 0', () => {
		const Z: Zero[] = [
			{ x: -1, y: 0, kind: 'source' },
			{ x: 1, y: 0, kind: 'saddle' },
			{ x: 0, y: 1.5, kind: 'dipole' }
		];
		const ang = (x: number, y: number) => fieldAngle(Z, x, y);
		expect(Math.round(windingAlong(ang, circleLoop(0, 0, 5)))).toBe(1 - 1 + 2);
		expect(Math.round(windingAlong(ang, circleLoop(-1, 0, 0.4)))).toBe(1);
		expect(Math.round(windingAlong(ang, circleLoop(0, -3, 0.8)))).toBe(0);
	});
	it('on the sphere the zero at infinity always tops the total up to χ(S²) = 2', () => {
		for (const w of [-3, -1, 0, 1, 2, 5]) expect(w + indexAtInfinity(w)).toBe(2);
	});
});

describe('angle excess of geodesic triangles', () => {
	it('the octant triangle has three right angles and area π/2 = 4π/8', () => {
		const A: V3 = [1, 0, 0];
		const B: V3 = [0, 1, 0];
		const C: V3 = [0, 0, 1];
		expect(angleSum(A, B, C)).toBeCloseTo((3 * Math.PI) / 2, 12);
		expect(sphericalArea(A, B, C)).toBeCloseTo(Math.PI / 2, 12);
	});
	it('excess = area for many random triangles (Girard / Gauss)', () => {
		let s = 7;
		const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
		for (let k = 0; k < 200; k++) {
			const P = () => fromAngles(rnd() * TAU, Math.asin(2 * rnd() - 1));
			const A = P();
			const B = P();
			const C = P();
			const area = sphericalArea(A, B, C);
			if (area < 1e-3 || area > 2 * Math.PI - 1e-3) continue;
			expect(angleSum(A, B, C) - Math.PI).toBeCloseTo(area, 8);
		}
	});
	it('tiny triangles are almost flat (angle sum → π)', () => {
		const A = fromAngles(0, 0);
		const B = fromAngles(0.001, 0);
		const C = fromAngles(0, 0.001);
		expect(angleSum(A, B, C) - Math.PI).toBeLessThan(1e-5);
	});
});

describe('turning number of closed curves', () => {
	it('an oval turns once, a figure eight zero times, a doubly-looped curve twice', () => {
		const oval = closedSpline([
			[0, 0],
			[3, -1],
			[5, 1],
			[3, 3],
			[0, 2]
		]);
		expect(Math.round(turningNumber(oval))).toBe(1);
		const eight = Array.from({ length: 400 }, (_, k) => {
			const t = (TAU * k) / 400;
			return [Math.sin(t), Math.sin(t) * Math.cos(t)] as [number, number];
		});
		expect(Math.round(turningNumber(eight))).toBe(0);
		const limacon = Array.from({ length: 400 }, (_, k) => {
			const t = (TAU * k) / 400;
			const r = 0.5 + Math.cos(t);
			return [r * Math.cos(t), r * Math.sin(t)] as [number, number];
		});
		expect(Math.round(turningNumber(limacon))).toBe(2);
		// clockwise traversal turns −1 times
		expect(Math.round(turningNumber([...oval].reverse()))).toBe(-1);
	});
});

describe('the monopole', () => {
	it('A_N − A_S is the gradient of 2gφ, and the patch mismatch carries the whole flux 4πg', () => {
		const g = 0.5;
		const r = 1.3;
		const th = Math.PI / 2;
		const { AN, AS, diff } = wuYang(g, r, th);
		expect(diff).toBeCloseTo((2 * g) / (r * Math.sin(th)), 12);
		// Stokes on each cap: ∮A_N over the equator = flux through the north cap, −∮A_S = flux through the south cap
		const north = circulation(AN, r, th);
		const south = -circulation(AS, r, th);
		expect(north + south).toBeCloseTo(4 * Math.PI * g, 12);
		expect(north).toBeCloseTo(2 * Math.PI * g, 12);
	});
	it('the transition phase closes up exactly when n is an integer', () => {
		for (const n of [-2, -1, 0, 1, 3]) expect(phaseMismatch(n)).toBeLessThan(1e-12);
		expect(phaseMismatch(0.5)).toBeCloseTo(Math.PI, 12);
		expect(phaseMismatch(1.25)).toBeCloseTo(Math.PI / 2, 12);
	});
});

describe('sections of line bundles over the circle', () => {
	it('a Möbius section satisfies s(2π) = −s(0) and always has an odd number of zeros', () => {
		const trials = [
			[1, 1, 1, 1, 1, 1],
			[0.5, 0.8, 0.9, 0.7, 0.6, 0.4],
			[1, -1, 1, -1, 1, -1],
			[0.2, 0.9, -0.3, 0.4, 0.8, 0.6]
		];
		for (const v of trials) {
			expect(sectionValue(v, true, TAU)).toBeCloseTo(-sectionValue(v, true, 0), 12);
			expect(sectionZeros(v, true).length % 2).toBe(1);
		}
	});
	it('a cylinder section can avoid zero, and generic ones have an even number of zeros', () => {
		expect(sectionZeros([1, 1, 1, 1, 1, 1], false).length).toBe(0);
		expect(sectionZeros([1, 0.5, -0.4, -0.6, 0.3, 0.9], false).length % 2).toBe(0);
		expect(sectionValue([0.3, 1, 2, 1, 0.5, 0.2], false, TAU)).toBeCloseTo(0.3, 12);
	});
});

describe('the turning-number figure presets', () => {
	it('have the turning numbers the text claims (screen y down, so anticlockwise is negative)', async () => {
		const { turningPresets } = await import('./presets');
		const vis = (pts: [number, number][]) => -Math.round(turningNumber(closedSpline(pts, 36)));
		expect(vis(turningPresets.bean)).toBe(1);
		expect(vis(turningPresets.eight)).toBe(0);
		expect(vis(turningPresets.loop)).toBe(2);
	});
});
