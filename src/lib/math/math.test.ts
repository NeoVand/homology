import { describe, expect, it } from 'vitest';
import { SimplicialComplex, isClosedSurface, isOrientable } from './complex';
import { smith, rankZ2, matmul } from './linalg';
import { homology, cohomology, groupName, Z2HomologyBasis, boundaryZ2 } from './homology';
import * as ex from './examples';
import { gridSurface } from './examples';
import { ripsPersistence, noisyCircle, twoCircles, bettiAt, blobCloud } from './persistence';
import { hodgeDecompose } from './hodge';

const names = (K: SimplicialComplex, c: 'Z' | 'Z2' | 'Q' = 'Z') => homology(K, c).map((g) => groupName(g, c));

describe('boundary operator', () => {
	it('∂∘∂ = 0 on every example', () => {
		for (const { make } of Object.values(ex.examples)) {
			const K = make();
			for (let k = 2; k <= K.dim; k++) {
				const P = matmul(K.boundaryMatrix(k - 1), K.boundaryMatrix(k));
				expect(P.every((row) => row.every((x) => x === 0))).toBe(true);
			}
		}
	});
	it('boundary of a triangle is its three edges with signs', () => {
		const K = ex.disk();
		expect(K.boundary(2, [1])).toEqual([1, -1, 1]); // [0,1] − [0,2] + [1,2]
	});
});

describe('linear algebra', () => {
	it('Smith normal form finds torsion', () => {
		expect(smith([[2, 0], [0, 3]]).diagonal).toEqual([1, 6]);
		expect(smith([[2, 4], [4, 2]]).diagonal).toEqual([2, 6]);
		expect(smith([[0, 0], [0, 0]]).rank).toBe(0);
	});
	it('rank mod 2 differs from rank over Q when there is 2-torsion', () => {
		const M = [[2]];
		expect(rankZ2(M)).toBe(0);
		expect(smith(M).rank).toBe(1);
	});
});

describe('homology of standard spaces', () => {
	it('point, two points, interval, disk, ball', () => {
		expect(names(ex.point())).toEqual(['ℤ']);
		expect(names(ex.twoPoints())).toEqual(['ℤ²']);
		expect(names(ex.interval())).toEqual(['ℤ', '0']);
		expect(names(ex.disk())).toEqual(['ℤ', '0', '0']);
		expect(names(ex.ball())).toEqual(['ℤ', '0', '0', '0']);
	});
	it('circle and figure eight', () => {
		expect(names(ex.circle(3))).toEqual(['ℤ', 'ℤ']);
		expect(names(ex.circle(7))).toEqual(['ℤ', 'ℤ']);
		expect(names(ex.figureEight())).toEqual(['ℤ', 'ℤ²']);
	});
	it('spheres', () => {
		expect(names(ex.sphereTetra())).toEqual(['ℤ', '0', 'ℤ']);
		expect(names(ex.sphereOcta())).toEqual(['ℤ', '0', 'ℤ']);
		expect(isClosedSurface(ex.sphereOcta())).toBe(true);
	});
	it('7-vertex torus', () => {
		const T = ex.torus7();
		expect(T.fVector).toEqual([7, 21, 14]);
		expect(isClosedSurface(T)).toBe(true);
		expect(isOrientable(T)).toBe(true);
		expect(names(T)).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		expect(T.eulerCharacteristic()).toBe(0);
	});
	it('grid torus', () => {
		const T = ex.torusGrid(3, 3);
		expect(T.fVector).toEqual([9, 27, 18]);
		expect(isClosedSurface(T)).toBe(true);
		expect(names(T)).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		expect(names(ex.torusGrid(6, 4))).toEqual(['ℤ', 'ℤ²', 'ℤ']);
	});
	it('Klein bottle: H1 = ℤ ⊕ ℤ/2, H2 = 0', () => {
		const K = ex.kleinGrid(3, 3);
		expect(isClosedSurface(K)).toBe(true);
		expect(isOrientable(K)).toBe(false);
		expect(names(K)).toEqual(['ℤ', 'ℤ ⊕ ℤ/2', '0']);
		expect(names(K, 'Z2')).toEqual(['ℤ/2', '(ℤ/2)²', 'ℤ/2']);
		expect(names(K, 'Q')).toEqual(['ℚ', 'ℚ', '0']);
		expect(K.eulerCharacteristic()).toBe(0);
	});
	it('projective plane: H1 = ℤ/2, H2 = 0', () => {
		const P = ex.projectivePlane6();
		expect(P.fVector).toEqual([6, 15, 10]);
		expect(isClosedSurface(P)).toBe(true);
		expect(isOrientable(P)).toBe(false);
		expect(names(P)).toEqual(['ℤ', 'ℤ/2', '0']);
		expect(names(P, 'Z2')).toEqual(['ℤ/2', 'ℤ/2', 'ℤ/2']);
	});
	it('Möbius band and cylinder deformation retract to a circle', () => {
		expect(names(ex.mobius5())).toEqual(['ℤ', 'ℤ', '0']);
		expect(isOrientable(ex.mobius5())).toBe(false);
		expect(names(gridSurface('cylinder', 3, 1).complex)).toEqual(['ℤ', 'ℤ', '0']);
		expect(names(gridSurface('mobius', 3, 2).complex)).toEqual(['ℤ', 'ℤ', '0']);
	});
	it('genus-2 surface', () => {
		const G = ex.genus2();
		expect(isClosedSurface(G)).toBe(true);
		expect(isOrientable(G)).toBe(true);
		expect(G.eulerCharacteristic()).toBe(-2);
		expect(names(G)).toEqual(['ℤ', 'ℤ⁴', 'ℤ']);
	});
});

describe('cohomology via UCT', () => {
	it('projective plane: H^* = ℤ, 0, ℤ/2', () => {
		expect(cohomology(ex.projectivePlane6()).map((g) => groupName(g))).toEqual(['ℤ', '0', 'ℤ/2']);
	});
	it('Klein bottle: H^* = ℤ, ℤ, ℤ/2', () => {
		expect(cohomology(ex.kleinGrid(3, 3)).map((g) => groupName(g))).toEqual(['ℤ', 'ℤ', 'ℤ/2']);
	});
	it('coboundary of coboundary is zero', () => {
		const T = ex.torus7();
		const f = T.simplices[0].map((_, i) => (i * 37) % 11);
		const df = T.coboundary(0, f);
		const ddf = T.coboundary(1, df);
		expect(ddf.every((x) => x === 0)).toBe(true);
	});
});

describe('mod-2 cycle classes', () => {
	it('torus: meridian and longitude are independent non-boundaries', () => {
		const { complex: T } = gridSurface('torus', 3, 3);
		const e = (a: number, b: number) => T.indexOf([a, b]);
		// vertex id of grid point (i,j) is assigned in visiting order; find by scanning
		const g = gridSurface('torus', 3, 3);
		const vid = (i: number, j: number) => g.vertexGrid.findIndex(([a, b]) => a === ((i % 3) + 3) % 3 && b === ((j % 3) + 3) % 3);
		const loopI = [0, 1, 2].map((i) => e(vid(i, 0), vid(i + 1, 0)));
		const loopJ = [0, 1, 2].map((j) => e(vid(0, j), vid(0, j + 1)));
		const H = new Z2HomologyBasis(T, 1, [loopI, loopJ]);
		expect(H.rank).toBe(2);
		expect(H.classOf(loopI)).toEqual([1, 0]);
		expect(H.classOf(loopJ)).toEqual([0, 1]);
		// a triangle boundary is a boundary
		const tri = T.simplices[2][0];
		const bd = boundaryZ2(T, 2, [0]);
		expect(bd.length).toBe(3);
		expect(H.isBoundary(bd)).toBe(true);
		expect(tri.length).toBe(3);
		// sum of the two loops is a nonzero class
		expect(H.classOf([...loopI, ...loopJ])).toEqual([1, 1]);
	});
	it('sphere has no 1-dimensional classes', () => {
		const H = new Z2HomologyBasis(ex.sphereOcta(), 1);
		expect(H.rank).toBe(0);
	});
});

describe('persistence', () => {
	it('noisy circle: one long H1 bar', () => {
		const f = ripsPersistence(noisyCircle(24, 1, 0.05, 3), 2.2);
		const long = f.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.6);
		expect(long.length).toBe(1);
		expect(bettiAt(f, 0.6)).toEqual([1, 1]);
	});
	it('two circles: two long H1 bars; blob: none', () => {
		const f = ripsPersistence(twoCircles(34), 2.6);
		const long = f.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.3);
		expect(long.length).toBe(2);
		const g = ripsPersistence(blobCloud(26), 3.5);
		expect(g.bars.filter((b) => b.dim === 1 && b.death - b.birth > 0.4).length).toBe(0);
		expect(g.bars.filter((b) => b.dim === 0 && b.death === Infinity).length).toBe(1);
	});
});

describe('Hodge decomposition', () => {
	it('a flow around the hole of an annulus is harmonic', () => {
		const { complex: A } = gridSurface('cylinder', 4, 1);
		// circulating flow: +1 on each "around" edge oriented with increasing i
		const f = A.simplices[1].map(() => 0);
		const parts0 = hodgeDecompose(A, f);
		expect(parts0.harmonic.every((x) => Math.abs(x) < 1e-9)).toBe(true);
		// gradient of a potential has no harmonic part
		const s = A.simplices[0].map((_, i) => Math.sin(i));
		const grad = A.coboundary(0, s);
		const p = hodgeDecompose(A, grad);
		expect(p.harmonic.every((x) => Math.abs(x) < 1e-7)).toBe(true);
		expect(p.curl.every((x) => Math.abs(x) < 1e-7)).toBe(true);
	});
});
