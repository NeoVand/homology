import { describe, expect, it } from 'vitest';
import { SimplicialComplex, isClosedSurface, isOrientable } from '$lib/math/complex';
import * as ex from '$lib/math/examples';
import { solids, counts, angleDefects, edgesOf, normalized } from './polyhedra';
import { splitEdge, starFace, addDiagonal, meshCounts, isClosedOrientedSurface, bestDiagonal, type PolyMesh } from './mesh';
import { pictureFrame, tunnelSlab, slab } from './tunnels';
import { analyseGraph, fundamentalLoop, rng, shuffled, DSU, type Edge } from './graph';
import {
	triangles,
	removalOrder,
	outerEdges,
	cubeEdges,
	cubeFaces,
	diagonals,
	edgeFaces,
	planarFaces
} from './cauchy';

const expected: Record<string, [number, number, number]> = {
	tetrahedron: [4, 6, 4],
	cube: [8, 12, 6],
	octahedron: [6, 12, 8],
	dodecahedron: [20, 30, 12],
	icosahedron: [12, 30, 20],
	prism: [12, 18, 8],
	pyramid: [5, 8, 5],
	soccer: [60, 90, 32]
};

describe('the polyhedron gallery', () => {
	it('has the right counts and V − E + F = 2 for every solid', () => {
		for (const [k, s] of Object.entries(solids)) {
			const P = s.make();
			const c = counts(P);
			expect([c.V, c.E, c.F], k).toEqual(expected[k]);
			expect(c.chi).toBe(2);
		}
	});
	it('the soccer ball has 12 pentagons and 20 hexagons', () => {
		const P = solids.soccer.make();
		const sizes = P.faces.map((f) => f.length);
		expect(sizes.filter((n) => n === 5).length).toBe(12);
		expect(sizes.filter((n) => n === 6).length).toBe(20);
	});
	it('Descartes: the angle defects add up to 720° (4π)', () => {
		for (const s of Object.values(solids)) {
			const d = angleDefects(normalized(s.make()));
			expect(d.reduce((a, b) => a + b, 0)).toBeCloseTo(4 * Math.PI, 9);
			expect(d.every((x) => x > 0)).toBe(true);
		}
		const cube = angleDefects(solids.cube.make());
		expect(cube.every((x) => Math.abs(x - Math.PI / 2) < 1e-9)).toBe(true);
		const ball = angleDefects(solids.soccer.make());
		expect(ball.every((x) => Math.abs((x * 180) / Math.PI - 12) < 1e-9)).toBe(true);
	});
	it('every edge borders exactly two faces', () => {
		for (const s of Object.values(solids)) {
			const P = s.make();
			for (const [a, b] of edgesOf(P)) {
				const n = P.faces.filter((f) => f.some((v, i) => (v === a && f[(i + 1) % f.length] === b) || (v === b && f[(i + 1) % f.length] === a))).length;
				expect(n).toBe(2);
			}
			expect(isClosedOrientedSurface({ pos: P.verts, faces: P.faces })).toBe(true);
		}
	});
});

describe('subdividing never changes V − E + F', () => {
	it('random sequences of moves on the cube and the tetrahedron', () => {
		for (const name of ['cube', 'tetrahedron', 'octahedron']) {
			const P = solids[name].make();
			let m: PolyMesh = { pos: P.verts, faces: P.faces };
			const rand = rng(name.length * 977);
			for (let step = 0; step < 120; step++) {
				const before = meshCounts(m);
				const r = rand();
				let next: PolyMesh | null = null;
				if (r < 0.4) {
					const es = [...new Set(m.faces.flatMap((f) => f.map((v, i) => [v, f[(i + 1) % f.length]].sort((a, b) => a - b).join(','))))];
					const [a, b] = es[Math.floor(rand() * es.length)].split(',').map(Number);
					next = splitEdge(m, a, b);
					const after = meshCounts(next);
					expect([after.V - before.V, after.E - before.E, after.F - before.F]).toEqual([1, 1, 0]);
				} else if (r < 0.75) {
					const fi = Math.floor(rand() * m.faces.length);
					next = addDiagonal(m, fi);
					if (next) {
						const after = meshCounts(next);
						expect([after.V - before.V, after.E - before.E, after.F - before.F]).toEqual([0, 1, 1]);
					}
				} else {
					const fi = Math.floor(rand() * m.faces.length);
					const k = m.faces[fi].length;
					next = starFace(m, fi);
					const after = meshCounts(next);
					expect([after.V - before.V, after.E - before.E, after.F - before.F]).toEqual([1, k, k - 1]);
				}
				if (next) m = next;
				expect(meshCounts(m).chi).toBe(2);
				expect(isClosedOrientedSurface(m)).toBe(true);
			}
		}
	});
	it('a triangle has no diagonal; a square has one', () => {
		const P = solids.tetrahedron.make();
		expect(bestDiagonal({ pos: P.verts, faces: P.faces }, 0)).toBeNull();
		const C = solids.cube.make();
		expect(bestDiagonal({ pos: C.verts, faces: C.faces }, 0)).not.toBeNull();
		// after splitting an edge, the face has 5 corners, three of them on one side;
		// a diagonal must not run along that side
		const m1 = splitEdge({ pos: C.verts, faces: C.faces }, C.faces[0][0], C.faces[0][1]);
		const d = bestDiagonal(m1, 0)!;
		expect(d).not.toBeNull();
	});
});

describe('polyhedra with tunnels', () => {
	it('Lhuilier’s picture frame: 16 − 32 + 16 = 0', () => {
		const F = pictureFrame();
		const c = meshCounts(F);
		expect([c.V, c.E, c.F, c.chi]).toEqual([16, 32, 16, 0]);
		expect(isClosedOrientedSurface(F)).toBe(true);
		const d = angleDefects({ verts: F.pos, faces: F.faces });
		expect(d.reduce((a, b) => a + b, 0)).toBeCloseTo(0, 9);
	});
	it('a slab with g tunnels has χ = 2 − 2g', () => {
		for (let g = 0; g <= 6; g++) {
			const S = tunnelSlab(g);
			const c = meshCounts(S);
			expect(c.chi, `g=${g}`).toBe(2 - 2 * g);
			expect(isClosedOrientedSurface(S)).toBe(true);
			const d = angleDefects({ verts: S.pos, faces: S.faces });
			expect(d.reduce((a, b) => a + b, 0)).toBeCloseTo(2 * Math.PI * (2 - 2 * g), 8);
		}
		expect(meshCounts(tunnelSlab(1))).toMatchObject({ V: 32, E: 64, F: 32 });
		expect(meshCounts(tunnelSlab(2))).toMatchObject({ V: 48, E: 100, F: 50 });
	});
});

describe('χ of every surface we have met', () => {
	it('matches 2 − 2g and 2 − k', () => {
		expect(ex.sphereTetra().eulerCharacteristic()).toBe(2);
		expect(ex.sphereOcta().eulerCharacteristic()).toBe(2);
		expect(ex.torus7().eulerCharacteristic()).toBe(0);
		expect(ex.torusGrid(3, 3).eulerCharacteristic()).toBe(0);
		expect(ex.kleinGrid(3, 3).eulerCharacteristic()).toBe(0);
		expect(ex.projectivePlane6().eulerCharacteristic()).toBe(1);
		const G2 = ex.genus2();
		expect(G2.fVector).toEqual([11, 39, 26]);
		expect(G2.eulerCharacteristic()).toBe(-2);
		expect(isClosedSurface(G2) && isOrientable(G2)).toBe(true);
		expect(ex.disk().eulerCharacteristic()).toBe(1);
		expect(ex.mobius5().eulerCharacteristic()).toBe(0);
		expect(ex.ball().eulerCharacteristic()).toBe(1);
		// the boundary of the 4-simplex (a 3-sphere): 5 − 10 + 10 − 5 = 0
		const S3 = new SimplicialComplex([
			[0, 1, 2, 3],
			[0, 1, 2, 4],
			[0, 1, 3, 4],
			[0, 2, 3, 4],
			[1, 2, 3, 4]
		]);
		expect(S3.fVector).toEqual([5, 10, 10, 5]);
		expect(S3.eulerCharacteristic()).toBe(0);
	});
	it('Heawood-style bounds: a triangulated surface needs n with C(n,2) ≥ 3(n − χ)', () => {
		// edges of a triangulated closed surface: E = 3(V − χ)
		for (const K of [ex.sphereTetra(), ex.torus7(), ex.projectivePlane6(), ex.torusGrid(3, 3), ex.genus2()]) {
			const [V, E] = K.fVector;
			expect(E).toBe(3 * (V - K.eulerCharacteristic()));
		}
		const minimal = (chi: number) => {
			for (let n = 3; ; n++) if ((n * (n - 1)) / 2 >= 3 * (n - chi) && n >= 4) return n;
		};
		expect(minimal(2)).toBe(4);
		expect(minimal(1)).toBe(6);
		expect(minimal(0)).toBe(7);
	});
});

describe('claims made in the prose of §2.6', () => {
	it('the twisted 3 × 3 grid (Klein bottle) has f-vector (9, 27, 18)', () => {
		expect(ex.kleinGrid(3, 3).fVector).toEqual([9, 27, 18]);
		const cyl = gridSurfaceCylinder();
		expect(cyl.eulerCharacteristic()).toBe(0);
	});
	it('picture frame: outer corners fall 90° short, tunnel corners overshoot by 90°', () => {
		const F = pictureFrame();
		const d = angleDefects({ verts: F.pos, faces: F.faces }).map((x) => Math.round((x * 180) / Math.PI));
		expect(d.slice(0, 4)).toEqual([90, 90, 90, 90]); // outer top
		expect(d.slice(4, 8)).toEqual([-90, -90, -90, -90]); // inner top
		expect(d.slice(8, 12)).toEqual([90, 90, 90, 90]);
		expect(d.slice(12, 16)).toEqual([-90, -90, -90, -90]);
	});
	it('drilling a tunnel changes (V, E, F) by (0, +4, +2), so χ drops by 2', () => {
		const c0 = meshCounts(slab(5, 3, []));
		const c1 = meshCounts(slab(5, 3, [[1, 1]]));
		const c2 = meshCounts(slab(5, 3, [
			[1, 1],
			[3, 1]
		]));
		expect([c1.V - c0.V, c1.E - c0.E, c1.F - c0.F]).toEqual([0, 4, 2]);
		expect([c2.V - c1.V, c2.E - c1.E, c2.F - c1.F]).toEqual([0, 4, 2]);
		expect([c0.chi, c1.chi, c2.chi]).toEqual([2, 0, -2]);
	});
	it('the crested cube: 16 − 24 + 11 = 3, and one more edge gives 2', () => {
		expect(16 - 24 + 11).toBe(3);
		expect(16 - 25 + 11).toBe(2);
	});
	it('K4 has 7 different loops but 3 independent ones', () => {
		// enumerate edge subsets of K4 that form a single cycle
		const E: Edge[] = [
			[0, 1],
			[0, 2],
			[0, 3],
			[1, 2],
			[1, 3],
			[2, 3]
		];
		let cycles = 0;
		for (let m = 1; m < 1 << 6; m++) {
			const es = E.filter((_, i) => m & (1 << i));
			const deg = new Map<number, number>();
			for (const [a, b] of es) {
				deg.set(a, (deg.get(a) ?? 0) + 1);
				deg.set(b, (deg.get(b) ?? 0) + 1);
			}
			if (![...deg.values()].every((d) => d === 2)) continue;
			const g = analyseGraph([...deg.keys()], es);
			if (g.pieces === 1) cycles++;
		}
		expect(cycles).toBe(7);
		expect(analyseGraph([0, 1, 2, 3], E).loops).toBe(3);
	});
	it('mystery surfaces: consistency of the counts', () => {
		expect(10 - 30 + 20).toBe(0);
		expect(3 * 20).toBe(2 * 30);
		expect(12 - 42 + 28).toBe(-2);
		expect(3 * 28).toBe(2 * 42);
		expect(3 * 20).not.toBe(2 * 31);
	});
});

function gridSurfaceCylinder() {
	return ex.gridSurface('cylinder', 3, 3).complex;
}

describe('graphs', () => {
	it('V − E = pieces − loops', () => {
		const tri = analyseGraph([0, 1, 2], [
			[0, 1],
			[1, 2],
			[0, 2]
		]);
		expect(tri).toMatchObject({ V: 3, E: 3, chi: 0, pieces: 1, loops: 1 });
		const K4: Edge[] = [
			[0, 1],
			[0, 2],
			[0, 3],
			[1, 2],
			[1, 3],
			[2, 3]
		];
		expect(analyseGraph([0, 1, 2, 3], K4)).toMatchObject({ chi: -2, pieces: 1, loops: 3 });
		const two = analyseGraph([0, 1, 2, 3, 4], [
			[0, 1],
			[2, 3]
		]);
		expect(two).toMatchObject({ chi: 3, pieces: 3, loops: 0 });
		for (let s = 1; s < 30; s++) {
			const r = rng(s);
			const n = 3 + Math.floor(r() * 6);
			const es: Edge[] = [];
			for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (r() < 0.4) es.push([i, j]);
			const g = analyseGraph(
				Array.from({ length: n }, (_, i) => i),
				es
			);
			expect(g.chi).toBe(g.pieces - g.loops);
			expect(g.inTree.filter(Boolean).length).toBe(n - g.pieces);
		}
	});
	it('each extra edge closes a loop', () => {
		const es: Edge[] = [
			[0, 1],
			[1, 2],
			[2, 3],
			[3, 0],
			[0, 2]
		];
		const g = analyseGraph([0, 1, 2, 3], es);
		expect(g.loops).toBe(2);
		const extra = g.inTree.map((t, i) => (t ? -1 : i)).filter((i) => i >= 0);
		expect(extra.length).toBe(2);
		for (const e of extra) {
			const loop = fundamentalLoop(es, g.inTree, e);
			// every vertex on the loop is touched by exactly two loop edges
			const deg = new Map<number, number>();
			for (const i of loop) for (const v of es[i]) deg.set(v, (deg.get(v) ?? 0) + 1);
			expect([...deg.values()].every((d) => d === 2)).toBe(true);
		}
	});
});

describe('Cauchy’s proof on the flattened cube', () => {
	it('flattening and triangulating', () => {
		// flat network: V − E + F = 8 − 12 + 5 = 1
		expect(8 - cubeEdges.length + cubeFaces.length).toBe(1);
		// triangulated: 8 − 17 + 10 = 1
		expect(8 - (cubeEdges.length + diagonals.length) + triangles.length).toBe(1);
		const K = new SimplicialComplex(triangles);
		expect(K.fVector).toEqual([8, 17, 10]);
		expect(K.eulerCharacteristic()).toBe(1);
	});
	it('removing triangles one at a time keeps a disk and keeps V − E + F = 1', () => {
		const order = removalOrder();
		expect(order.length).toBe(9);
		let left = triangles.map((_, i) => i);
		let V = 8;
		let E = 17;
		let F = 10;
		for (const r of order) {
			const outer = outerEdges(left.map((i) => triangles[i]));
			for (const [a, b] of r.edges) expect(outer.has(a < b ? `${a},${b}` : `${b},${a}`)).toBe(true);
			left = left.filter((i) => i !== r.tri);
			if (r.kind === 'one') {
				E -= 1;
				F -= 1;
			} else {
				V -= 1;
				E -= 2;
				F -= 1;
			}
			const K = new SimplicialComplex(left.map((i) => triangles[i]));
			expect(K.fVector).toEqual([V, E, F]);
			expect(V - E + F).toBe(1);
			// still a disk: every edge in ≤ 2 triangles, outer edges form one cycle
			const outerNow = [...outerEdges(left.map((i) => triangles[i]))].map((e) => e.split(',').map(Number));
			const deg = new Map<number, number>();
			for (const [a, b] of outerNow) {
				deg.set(a, (deg.get(a) ?? 0) + 1);
				deg.set(b, (deg.get(b) ?? 0) + 1);
			}
			expect([...deg.values()].every((d) => d === 2)).toBe(true);
			expect(outerNow.length).toBe(deg.size); // a single cycle visits each outer vertex once
			const dsu = new DSU();
			for (const [a, b] of outerNow) dsu.union(a, b);
			expect(new Set([...deg.keys()].map((v) => dsu.find(v))).size).toBe(1);
		}
		expect([V, E, F]).toEqual([3, 3, 1]);
		expect(order.some((r) => r.kind === 'one') && order.some((r) => r.kind === 'two')).toBe(true);
	});
	it('two trees: a spanning tree and the dual tree use up all 12 edges', () => {
		const ef = edgeFaces();
		expect(ef.every(([a, b]) => a >= 0 && b >= 0 && a !== b)).toBe(true);
		for (let s = 1; s <= 40; s++) {
			const order = shuffled(cubeEdges.length, rng(s));
			const g = analyseGraph([0, 1, 2, 3, 4, 5, 6, 7], cubeEdges, order);
			expect(g.inTree.filter(Boolean).length).toBe(7);
			// dual edges of the non-tree edges
			const dual = ef.filter((_, i) => !g.inTree[i]);
			expect(dual.length).toBe(5);
			const d = analyseGraph(
				planarFaces.map((_, i) => i),
				dual
			);
			expect(d.pieces).toBe(1); // connected …
			expect(d.loops).toBe(0); // … and without loops: a tree
		}
	});
});
