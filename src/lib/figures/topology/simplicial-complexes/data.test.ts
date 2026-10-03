import { describe, expect, it } from 'vitest';
import { SimplicialComplex, isClosedSurface, isOrientable } from '$lib/math/complex';
import { homology, groupName } from '$lib/math/homology';
import * as ex from '$lib/math/examples';
import {
	binom,
	simplexComplex,
	gridTorus,
	gridDefects,
	gridPieces,
	gridLabel,
	torus7Triangles,
	latticeLabel,
	latticeUV,
	CSASZAR,
	csaszarByLabel,
	rp2Picture,
	barycentricSubdivision,
	permutationParity
} from './data';
import { checkEmbedding, type P3 } from './embedding';

const keyset = (ts: number[][]) => new Set(ts.map((t) => [...t].sort((a, b) => a - b).join(',')));
const names = (K: SimplicialComplex) => homology(K, 'Z').map((g) => groupName(g, 'Z'));

describe('simplices and Pascal’s triangle', () => {
	it('Δⁿ has C(n+1, k+1) faces of dimension k', () => {
		for (let n = 0; n <= 5; n++) {
			const K = simplexComplex(n);
			expect(K.fVector).toEqual(Array.from({ length: n + 1 }, (_, k) => binom(n + 1, k + 1)));
			expect(K.fVector.reduce((a, b) => a + b, 0)).toBe(2 ** (n + 1) - 1);
		}
		expect(simplexComplex(3).fVector).toEqual([4, 6, 4, 1]);
		expect(simplexComplex(4).fVector).toEqual([5, 10, 10, 5, 1]);
	});
});

describe('grid tori', () => {
	it('the 3 × 3 grid is a simplicial torus with 9 vertices, 27 edges, 18 triangles', () => {
		const T = gridTorus(3);
		expect(T.fVector).toEqual([9, 27, 18]);
		expect(isClosedSurface(T)).toBe(true);
		expect(isOrientable(T)).toBe(true);
		expect(T.eulerCharacteristic()).toBe(0);
		expect(names(T)).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		const d = gridDefects(3);
		expect(d.duplicateEdges).toEqual([]);
		expect(d.duplicateTriangles).toEqual([]);
		expect(d.loops).toEqual([]);
		// labels i + 3j: the bottom row reads 0 1 2 (0), the left column 0 3 6 (0)
		expect([0, 1, 2, 3].map((i) => gridLabel(i, 0, 3))).toEqual([0, 1, 2, 0]);
		expect([0, 1, 2, 3].map((j) => gridLabel(0, j, 3))).toEqual([0, 3, 6, 0]);
	});
	it('larger grids work too', () => {
		for (const n of [4, 5]) {
			const T = gridTorus(n);
			expect(T.fVector).toEqual([n * n, 3 * n * n, 2 * n * n]);
			expect(isClosedSurface(T)).toBe(true);
			expect(gridDefects(n).duplicateEdges).toEqual([]);
		}
	});
	it('the 2 × 2 grid fails: repeated edges and triangles, too few vertex pairs', () => {
		const d = gridDefects(2);
		expect(d.vertices).toBe(4);
		expect(d.edgeCount).toBe(12);
		expect(d.triangleCount).toBe(8);
		expect(d.availablePairs).toBe(6);
		expect(d.availableTriples).toBe(4);
		expect(d.duplicateEdges.length).toBeGreaterThan(0);
		expect(d.duplicateTriangles.length).toBe(4); // every triple is used twice
		expect(d.duplicateTriangles.every((g) => g.length === 2)).toBe(true);
		expect(d.loops).toEqual([]);
		// 12 edges on only 6 pairs: every pair is used exactly twice
		expect(d.duplicateEdges.length).toBe(6);
		expect(d.duplicateEdges.every((g) => g.length === 2)).toBe(true);
	});
	it('the 1 × 1 grid even has edges from a vertex to itself', () => {
		expect(gridDefects(1).loops.length).toBe(3);
		expect(gridPieces(1).triangles.length).toBe(2);
	});
});

describe('the 7-vertex torus', () => {
	it('lattice labels reproduce the triangles {i,i+1,i+3}, {i,i+2,i+3}', () => {
		const tris: number[][] = [];
		for (let a = -4; a <= 4; a++)
			for (let b = -4; b <= 4; b++) {
				tris.push([latticeLabel(a, b), latticeLabel(a + 1, b), latticeLabel(a, b + 1)]);
				tris.push([latticeLabel(a + 1, b), latticeLabel(a, b + 1), latticeLabel(a + 1, b + 1)]);
			}
		expect(keyset(tris)).toEqual(keyset(torus7Triangles()));
	});
	it('every vertex is joined to all six others', () => {
		const nb = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1],
			[1, -1],
			[-1, 1]
		];
		for (let a = -3; a <= 3; a++)
			for (let b = -3; b <= 3; b++) {
				const L = latticeLabel(a, b);
				const ns = new Set(nb.map(([da, db]) => latticeLabel(a + da, b + db)));
				expect(ns.size).toBe(6);
				expect(ns.has(L)).toBe(false);
			}
		const T = new SimplicialComplex(torus7Triangles());
		expect(T.fVector).toEqual([7, 21, 14]);
		expect(T.count(1)).toBe(binom(7, 2));
		expect(isClosedSurface(T)).toBe(true);
		expect(isOrientable(T)).toBe(true);
		expect(keyset(torus7Triangles())).toEqual(keyset(ex.torus7().simplices[2]));
	});
	it('the lattice wraps onto the torus: repeats differ by (1,2) and (−3,1)', () => {
		const frac = (x: number) => ((x % 1) + 1) % 1;
		for (const [a, b] of [
			[0, 0],
			[2, 1],
			[-1, 3]
		]) {
			const [u, v] = latticeUV(a, b);
			for (const [da, db] of [
				[1, 2],
				[-3, 1]
			]) {
				const [u2, v2] = latticeUV(a + da, b + db);
				expect(Math.abs(frac(u2 - u) - 0) < 1e-9 || Math.abs(frac(u2 - u) - 1) < 1e-9).toBe(true);
				expect(Math.abs(frac(v2 - v) - 0) < 1e-9 || Math.abs(frac(v2 - v) - 1) < 1e-9).toBe(true);
			}
			expect(Math.round(frac(u) * 7) % 7).toBe(latticeLabel(a, b));
		}
	});
	it('Császár’s coordinates realise the 7-vertex torus without self-intersections', () => {
		const mapped = CSASZAR.triangles.map((t) => t.map((L) => CSASZAR.toTorus7[L - 1]));
		expect(keyset(mapped)).toEqual(keyset(torus7Triangles()));
		const zeroBased = CSASZAR.triangles.map((t) => t.map((L) => L - 1));
		const rep = checkEmbedding(CSASZAR.coords as P3[], zeroBased);
		expect(rep.problems).toEqual([]);
		expect(rep.ok).toBe(true);
		// the same check in our labels, and after squashing heights (an affine map)
		const pos = csaszarByLabel();
		expect(checkEmbedding(pos as P3[], torus7Triangles()).ok).toBe(true);
		const squashed = pos.map(([x, y, z]) => [5 * x, 5 * y, 2 * z]) as P3[];
		expect(checkEmbedding(squashed, torus7Triangles()).ok).toBe(true);
	});
	it('the embedding checker does catch bad configurations', () => {
		// two triangles piercing each other
		const pos: P3[] = [
			[0, 0, 0],
			[4, 0, 0],
			[0, 4, 0],
			[1, 1, -2],
			[1, 1, 2],
			[3, 3, 2]
		];
		expect(checkEmbedding(pos, [[0, 1, 2], [3, 4, 5]]).ok).toBe(false);
		// two triangles sharing an edge but folded flat on top of each other
		const fold: P3[] = [
			[0, 0, 0],
			[4, 0, 0],
			[1, 3, 0],
			[2, 2, 0]
		];
		expect(checkEmbedding(fold, [[0, 1, 2], [0, 1, 3]]).ok).toBe(false);
		// sharing a vertex, coplanar, overlapping
		const fan: P3[] = [
			[0, 0, 0],
			[4, 1, 0],
			[4, -1, 0],
			[5, 2, 0],
			[5, -2, 0]
		];
		expect(checkEmbedding(fan, [[0, 1, 2], [0, 3, 4]]).ok).toBe(false);
		// a hollow tetrahedron is fine
		const tet: P3[] = [
			[0, 0, 0],
			[3, 0, 0],
			[0, 3, 0],
			[0, 0, 3]
		];
		expect(
			checkEmbedding(tet, [
				[0, 1, 2],
				[0, 1, 3],
				[0, 2, 3],
				[1, 2, 3]
			]).ok
		).toBe(true);
		// Császár's polyhedron with its top vertex dropped into the middle is not embedded
		const bad = CSASZAR.coords.map((c, i) => (i === 6 ? ([0, 0, 1] as P3) : c)) as P3[];
		expect(checkEmbedding(bad, CSASZAR.triangles.map((t) => t.map((L) => L - 1))).ok).toBe(false);
	});
});

describe('the 6-vertex projective plane picture', () => {
	it('draws exactly the triangles of projectivePlane6, with opposite boundary points equal', () => {
		const P = rp2Picture();
		expect(keyset(P.labelTriangles)).toEqual(keyset(ex.projectivePlane6().simplices[2]));
		for (let k = 1; k <= 5; k++) expect(P.nodes[k].label).toBe(P.nodes[k + 5].label);
		const pairs = new Set<string>();
		for (const t of P.labelTriangles)
			for (let i = 0; i < 3; i++) pairs.add([t[i], t[(i + 1) % 3]].sort().join(','));
		expect(pairs.size).toBe(15); // every pair of the 6 vertices is an edge
		const K = ex.projectivePlane6();
		expect(K.fVector).toEqual([6, 15, 10]);
		expect(isOrientable(K)).toBe(false);
		expect(K.eulerCharacteristic()).toBe(1);
	});
});

describe('barycentric subdivision', () => {
	it('subdivides a triangle into 6, then 36 small triangles', () => {
		const sd = barycentricSubdivision(ex.disk(), () => [0, 0]);
		expect(sd.complex.fVector).toEqual([7, 12, 6]);
		const sd2 = barycentricSubdivision(sd.complex, (v) => sd.pos[v]);
		expect(sd2.complex.fVector).toEqual([25, 60, 36]);
	});
	it('the figure’s complex (a triangle with an edge attached)', () => {
		const K0 = new SimplicialComplex([
			[0, 1, 2],
			[1, 3]
		]);
		expect(K0.fVector).toEqual([4, 4, 1]);
		const sd = barycentricSubdivision(K0, () => [0, 0]);
		expect(sd.complex.fVector).toEqual([9, 14, 6]);
		const sd2 = barycentricSubdivision(sd.complex, () => [0, 0]);
		expect(sd2.complex.fVector).toEqual([29, 64, 36]);
		for (const K of [K0, sd.complex, sd2.complex]) expect(K.eulerCharacteristic()).toBe(1);
	});
	it('a solid tetrahedron becomes 24 small ones', () => {
		expect(barycentricSubdivision(ex.ball()).complex.fVector).toEqual([15, 50, 60, 24]);
	});
	it('keeps χ and the topology', () => {
		for (const K of [ex.circle(3), ex.disk(), ex.sphereTetra(), ex.torus7(), ex.projectivePlane6(), ex.ball()]) {
			expect(barycentricSubdivision(K).complex.eulerCharacteristic()).toBe(K.eulerCharacteristic());
		}
		const sdT = barycentricSubdivision(ex.torus7()).complex;
		expect(isClosedSurface(sdT)).toBe(true);
		expect(isOrientable(sdT)).toBe(true);
		expect(names(sdT)).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		const sdP = barycentricSubdivision(ex.projectivePlane6()).complex;
		expect(isClosedSurface(sdP)).toBe(true);
		expect(isOrientable(sdP)).toBe(false);
	});
	it('places new vertices at barycentres', () => {
		const pos = [
			[0, 0],
			[6, 0],
			[0, 3]
		] as [number, number][];
		const sd = barycentricSubdivision(ex.disk(), (v) => pos[v]);
		const centre = sd.origin.findIndex((s) => s.length === 3);
		expect(sd.pos[centre]).toEqual([2, 1]);
	});
});

describe('orientation', () => {
	it('counts swaps mod 2', () => {
		expect(permutationParity([0, 1, 2])).toBe(0);
		expect(permutationParity([1, 0, 2])).toBe(1);
		expect(permutationParity([1, 2, 0])).toBe(0);
		expect(permutationParity([2, 1, 0])).toBe(1);
		expect(permutationParity([1, 0, 3, 2])).toBe(0);
		expect(permutationParity([3, 2, 1, 0])).toBe(0);
	});
});
