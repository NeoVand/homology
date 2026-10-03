import { describe, expect, it } from 'vitest';
import { holesOf, nerveOf, tripleMeet, pairMeet, unionBoundary, type Disk } from './nerve';
import { absorb2, absorb3, arcIntersection, cechCircle, delta2, delta3, deltaNaive, dims, threeArcs, twoArcs } from './cech';
import { coboundaryMatrix, delta, diffuse, explain, loopFactor, safeStep, sheafDims, type GraphSheaf } from './cellular';
import { rankReal, norm } from './reals';
import { eyeModel, project, ratios, tribarFaces, N } from './tribar';
import { circlePath, principalSqrt, trackLog, trackSqrt } from './branches';

describe('nerves of disk covers', () => {
	it('three mutually overlapping disks with a common point give a filled triangle', () => {
		const D: Disk[] = [
			{ x: 0, y: 0, r: 1 },
			{ x: 1, y: 0, r: 1 },
			{ x: 0.5, y: 0.8, r: 1 }
		];
		const nv = nerveOf(D);
		expect(nv.edges.length).toBe(3);
		expect(nv.triangles.length).toBe(1);
		expect([nv.b0, nv.b1]).toEqual([1, 0]);
	});
	it('a ring of disks around an uncovered centre has one hole, and the nerve sees it', () => {
		const D: Disk[] = Array.from({ length: 6 }, (_, k) => ({
			x: 3 * Math.cos((k * Math.PI) / 3),
			y: 3 * Math.sin((k * Math.PI) / 3),
			r: 1.7
		}));
		const nv = nerveOf(D);
		expect(nv.edges.length).toBe(6);
		expect(nv.triangles.length).toBe(0);
		expect([nv.b0, nv.b1]).toEqual([1, 1]);
		const holes = holesOf(D);
		expect(holes.length).toBe(1);
		// the hole is the curvy hexagon in the middle: its area is a little under that of a hexagon of side 3
		expect(-holes[0].area).toBeGreaterThan(0.5);
		expect(-holes[0].area).toBeLessThan((3 * Math.sqrt(3) / 2) * 9);
	});
	it('growing the disks fills the hole: triangles appear and b1 drops to 0', () => {
		const D: Disk[] = Array.from({ length: 6 }, (_, k) => ({
			x: 3 * Math.cos((k * Math.PI) / 3),
			y: 3 * Math.sin((k * Math.PI) / 3),
			r: 3.2
		}));
		const nv = nerveOf(D);
		expect(nv.b1).toBe(0);
		expect(holesOf(D).length).toBe(0);
	});
	it('triple test: three disks that pairwise overlap but have no common point', () => {
		// centres on an equilateral triangle of side 2, radius just over 1
		const r = 1.05;
		const D: Disk[] = [
			{ x: 0, y: 0, r },
			{ x: 2, y: 0, r },
			{ x: 1, y: Math.sqrt(3), r }
		];
		expect(pairMeet(D[0], D[1])).toBe(true);
		expect(tripleMeet(D[0], D[1], D[2])).toBe(false); // circumradius 2/√3 ≈ 1.155 > r
		const big = D.map((d) => ({ ...d, r: 1.2 }));
		expect(tripleMeet(big[0], big[1], big[2])).toBe(true);
	});
	it('triple test: one disk inside the intersection of the other two', () => {
		expect(
			tripleMeet({ x: 0, y: 0, r: 0.1 }, { x: 0.5, y: 0, r: 1 }, { x: -0.5, y: 0, r: 1 })
		).toBe(true);
	});
	it('nerve theorem, tested: b1 of the nerve = number of holes of the union (exact boundary)', () => {
		let seed = 12345;
		const rnd = () => {
			seed = (seed * 16807) % 2147483647;
			return seed / 2147483647;
		};
		for (let trial = 0; trial < 300; trial++) {
			const n = 4 + Math.floor(rnd() * 9);
			const D: Disk[] = Array.from({ length: n }, () => ({ x: rnd() * 10, y: rnd() * 10, r: 1.2 + rnd() * 1.6 }));
			const nv = nerveOf(D);
			const loops = unionBoundary(D);
			const holes = loops.filter((l) => l.area < 0).length;
			const outer = loops.filter((l) => l.area > 0).length;
			expect(holes).toBe(nv.b1);
			expect(outer).toBe(nv.b0);
		}
	});
	it('a single disk: one outer boundary loop of area πr²', () => {
		const loops = unionBoundary([{ x: 1, y: 2, r: 3 }]);
		expect(loops.length).toBe(1);
		expect(loops[0].area).toBeCloseTo(Math.PI * 9, 9);
	});
});

describe('Čech cohomology of the circle', () => {
	it('three arcs: Ȟ⁰ = Ȟ¹ = one-dimensional, same matrix as the hollow triangle', () => {
		const c = cechCircle(threeArcs());
		expect(c.overlaps.length).toBe(3);
		expect(c.noTriples).toBe(true);
		expect([c.h0, c.h1]).toEqual([1, 1]);
		expect(dims(delta3, 3)).toEqual({ h0: 1, h1: 1 });
	});
	it('two arcs meet in two pieces; done right, Ȟ¹ is still one-dimensional', () => {
		const arcs = twoArcs();
		expect(arcIntersection(arcs[0], arcs[1]).length).toBe(2);
		const c = cechCircle(arcs);
		expect(c.overlaps.length).toBe(2);
		expect([c.h0, c.h1]).toEqual([1, 1]);
		expect(dims(delta2, 2)).toEqual({ h0: 1, h1: 1 });
	});
	it('the naive one-edge nerve of the two-arc cover would wrongly give Ȟ¹ = 0', () => {
		expect(dims(deltaNaive, 2)).toEqual({ h0: 1, h1: 0 });
	});
	it('holonomy: zero exactly for coboundaries', () => {
		// δf for f = (2, 5, −1): c01 = 3, c02 = −3, c12 = −6
		expect(absorb3(3, -6, -3).holonomy).toBe(0);
		expect(absorb3(1, 1, 1).holonomy).toBe(1);
		expect(absorb2(4, 4).holonomy).toBe(0);
		expect(absorb2(0, 1).holonomy).toBe(1);
	});
	it('many arcs: Ȟ¹ of the circle is always one-dimensional', () => {
		for (const n of [3, 4, 5, 7]) {
			const w = (2 * Math.PI) / n + 0.3;
			const arcs = Array.from({ length: n }, (_, k) => ({ start: (2 * Math.PI * k) / n, length: w }));
			const c = cechCircle(arcs);
			expect([c.h0, c.h1]).toEqual([1, 1]);
		}
	});
});

describe('cellular sheaves on graphs', () => {
	const tri = (f02v = 1): GraphSheaf => ({
		vertices: 3,
		edges: [
			{ u: 0, v: 1, fu: 1, fv: 1 },
			{ u: 1, v: 2, fu: 1, fv: 1 },
			{ u: 0, v: 2, fu: 1, fv: f02v }
		]
	});
	it('constant sheaf on a triangle: H⁰ = H¹ = ℝ', () => {
		expect(sheafDims(tri())).toMatchObject({ h0: 1, h1: 1 });
	});
	it('a sign flip on one edge kills both (over ℝ)', () => {
		expect(sheafDims(tri(-1))).toMatchObject({ h0: 0, h1: 0 });
	});
	it('Euler characteristic dim H⁰ − dim H¹ = #vertices − #edges does not depend on the maps', () => {
		for (const f of [1, -1, 2, 0.5, 3]) {
			const d = sheafDims(tri(f));
			expect(d.h0 - d.h1).toBe(3 - 3);
		}
	});
	it('unit conversions: consistent around the loop ⇒ a global section exists', () => {
		// cm → inch → mm around a triangle: vertex stalks measure the same length in cm, in, mm
		const S: GraphSheaf = {
			vertices: 3,
			edges: [
				{ u: 0, v: 1, fu: 1, fv: 2.54 }, // compare in cm: x_cm = 2.54 x_in
				{ u: 1, v: 2, fu: 25.4, fv: 1 }, // compare in mm: 25.4 x_in = x_mm
				{ u: 0, v: 2, fu: 10, fv: 1 } //   compare in mm: 10 x_cm = x_mm
			]
		};
		expect(sheafDims(S)).toMatchObject({ h0: 1, h1: 1 });
		const x = [10, 10 / 2.54, 100];
		expect(norm(delta(S, x))).toBeLessThan(1e-9);
		expect(loopFactor(S, [
			{ edge: 0, forward: true },
			{ edge: 1, forward: true },
			{ edge: 2, forward: false }
		])).toBeCloseTo(1, 12);
	});
	it('diffusion converges to a global section (consensus)', () => {
		const S = tri();
		let x = [3, -1, 7];
		const h = safeStep(S);
		for (let k = 0; k < 4000; k++) x = diffuse(S, x, h);
		expect(x[0]).toBeCloseTo(3, 6); // the average is preserved for the constant sheaf
		expect(x[1]).toBeCloseTo(3, 6);
		expect(x[2]).toBeCloseTo(3, 6);
	});
	it('edge data with nonzero loop sum cannot be explained; the residual is spread evenly', () => {
		const S = tri();
		// edges 01, 12, 02; loop 0→1→2→0 sum = y01 + y12 − y02
		const { residual } = explain(S, [1, 1, -1]); // loop sum 3
		expect(residual[0]).toBeCloseTo(1, 9);
		expect(residual[1]).toBeCloseTo(1, 9);
		expect(residual[2]).toBeCloseTo(-1, 9);
		const ok = explain(S, [1, 2, 3]); // loop sum 0
		expect(norm(ok.residual)).toBeLessThan(1e-9);
	});
	it('coboundary matrix has the expected rank on a tree (H¹ = 0)', () => {
		const S: GraphSheaf = {
			vertices: 4,
			edges: [
				{ u: 0, v: 1, fu: 2, fv: 1 },
				{ u: 1, v: 2, fu: 1, fv: 3 },
				{ u: 1, v: 3, fu: 1, fv: -1 }
			]
		};
		expect(rankReal(coboundaryMatrix(S))).toBe(3);
		expect(sheafDims(S)).toMatchObject({ h0: 1, h1: 0 });
	});
});

describe('Penrose tribar', () => {
	it('the three pieces fit together in the picture', () => {
		const faces = tribarFaces();
		expect(faces.length).toBe(9);
		// the corner of the joint (cube (N,N,N)) projects onto the start of beam A (cube (0,0,0))
		const a = project([N + 0.5, N + 0.5, N + 0.5]);
		const b = project([0.5, 0.5, 0.5]);
		expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeLessThan(1e-9);
		// beam B is horizontal in the picture
		const p = project([N, 0, 0]);
		const q = project([N, 3, 0]);
		expect(Math.abs(p[1] - q[1])).toBeLessThan(1e-9);
	});
	it('the product of the depth ratios cannot be changed by rescaling pieces', () => {
		const { mu } = eyeModel(30);
		expect(mu).toBeGreaterThan(0.6);
		expect(mu).toBeLessThan(0.8);
		const base = ratios([1, 1, 1], mu);
		expect(base.d12).toBe(1);
		expect(base.d23).toBe(1);
		for (const lam of [
			[2, 1, 0.5],
			[0.7, 1.3, 1.1],
			[1, 1, 1 / mu]
		] as [number, number, number][]) {
			expect(ratios(lam, mu).product).toBeCloseTo(mu, 12);
		}
		// choosing λ so that two overlaps agree pushes the whole discrepancy onto the third
		const r = ratios([1, 1, 1], mu);
		expect(r.d31).toBeCloseTo(mu, 12);
	});
});

describe('branches of √z and log z', () => {
	it('going once around the origin turns a square root into its negative', () => {
		const loop = circlePath(0, 0, 2);
		const w0 = principalSqrt(loop[0]);
		const w = trackSqrt(loop, w0);
		const end = w[w.length - 1];
		expect(end[0]).toBeCloseTo(-w0[0], 9);
		expect(end[1]).toBeCloseTo(-w0[1], 9);
		// twice around: back to the start
		const w2 = trackSqrt([...loop, ...loop.slice(1)], w0);
		expect(w2[w2.length - 1][0]).toBeCloseTo(w0[0], 9);
	});
	it('a loop that does not go around the origin brings the branch back unchanged', () => {
		const loop = circlePath(3, 0, 1);
		const w0 = principalSqrt(loop[0]);
		const w = trackSqrt(loop, w0);
		expect(w[w.length - 1][0]).toBeCloseTo(w0[0], 9);
		expect(w[w.length - 1][1]).toBeCloseTo(w0[1], 9);
	});
	it('log z gains 2πi per loop', () => {
		const loop = circlePath(0, 0, 1.5);
		const L = trackLog(loop, 0);
		expect(L[L.length - 1][1] - L[0][1]).toBeCloseTo(2 * Math.PI, 9);
		expect(L[L.length - 1][0]).toBeCloseTo(Math.log(1.5), 9);
	});
});
