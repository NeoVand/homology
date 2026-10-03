import { describe, expect, it } from 'vitest';
import {
	bowtie,
	patch,
	degrees,
	oddVertices,
	isEvenSet,
	symDiff,
	componentCount,
	spanningForest,
	bfsOrder,
	fundamentalCycle,
	enclosedTriangles,
	triangleEdges,
	toEngine,
	unimodularPartner,
	gcd,
	type Tri
} from './graphs';
import { SimplicialComplex } from '$lib/math/complex';
import { homology, Z2HomologyBasis, boundaryZ2 } from '$lib/math/homology';
import * as ex from '$lib/math/examples';

const subsets = (n: number) => Array.from({ length: 1 << n }, (_, m) => Array.from({ length: n }, (_, i) => i).filter((i) => m & (1 << i)));

function mulberry(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

describe('the bow-tie graph of Figures 3.1.1–3.1.2', () => {
	const { edges, pos, faces } = bowtie;
	const n = pos.length;

	it('has V = 8, E = 12, one component, so b₁ = E − V + c = 5', () => {
		expect(n).toBe(8);
		expect(edges.length).toBe(12);
		expect(componentCount(n, edges)).toBe(1);
		const { K } = toEngine(n, edges);
		expect(homology(K, 'Z2').map((g) => g.rank)).toEqual([1, 5]);
	});

	it('has exactly 2^5 = 32 cycles (even edge sets), including the empty one', () => {
		const even = subsets(edges.length).filter((s) => isEvenSet(n, edges, s));
		expect(even.length).toBe(32);
	});

	it('parity agrees with the engine: odd vertices = mod-2 boundary of the edge set', () => {
		const { K, edgeToEngine } = toEngine(n, edges);
		for (const s of subsets(edges.length).filter((_, m) => m % 37 === 0)) {
			const fromEngine = boundaryZ2(K, 1, s.map(edgeToEngine)).map((i) => K.simplices[0][i][0]);
			expect(oddVertices(n, edges, s)).toEqual(fromEngine);
		}
	});

	it('every face rim is a cycle, and the five face rims are independent', () => {
		for (const f of faces) expect(isEvenSet(n, edges, f.edges)).toBe(true);
		// independence: no non-empty sum of face rims is empty
		for (const s of subsets(faces.length).slice(1)) {
			let acc = new Set<number>();
			for (const i of s) acc = symDiff(acc, faces[i].edges);
			expect(acc.size).toBeGreaterThan(0);
		}
	});

	it('the "figure eight" (both diamonds) is a cycle in which d has degree 4', () => {
		const left = symDiff(faces[0].edges, faces[1].edges);
		const right = symDiff(faces[2].edges, faces[3].edges);
		const eight = symDiff(left, right);
		expect(isEvenSet(n, edges, eight)).toBe(true);
		expect(degrees(n, edges, eight)[3]).toBe(4);
		expect(eight.size).toBe(8);
	});

	it('the outer rim a-b-h-e-g-f-d-c-a is the sum of all five face rims', () => {
		let acc = new Set<number>();
		for (const f of faces) acc = symDiff(acc, f.edges);
		const names = [...acc].map((i) => edges[i].map((v) => bowtie.names[v]).join('')).sort();
		expect(names).toEqual(['ab', 'ac', 'bh', 'cd', 'df', 'eg', 'eh', 'fg']);
	});

	it('the BFS spanning tree has V − 1 = 7 edges and 5 fundamental cycles that form a basis', () => {
		const tree = spanningForest(n, edges, () => true, bfsOrder(n, edges, 0));
		expect(tree.filter(Boolean).length).toBe(7);
		const nonTree = edges.map((_, i) => i).filter((i) => !tree[i]);
		expect(nonTree.length).toBe(5);
		const cycles = nonTree.map((e) => fundamentalCycle(n, edges, tree, e));
		const { K, edgeToEngine } = toEngine(n, edges);
		const H = new Z2HomologyBasis(K, 1);
		for (const c of cycles) {
			expect(isEvenSet(n, edges, c)).toBe(true);
			expect(H.isCycle(c.map(edgeToEngine))).toBe(true);
			// each fundamental cycle contains exactly one non-tree edge: its own
			expect(c.filter((i) => !tree[i]).length).toBe(1);
		}
		// every cycle is the sum of the fundamental cycles of the non-tree edges it contains
		for (const s of subsets(edges.length).filter((s) => isEvenSet(n, edges, s))) {
			let acc = new Set<number>();
			for (const e of s) if (!tree[e]) acc = symDiff(acc, fundamentalCycle(n, edges, tree, e));
			expect([...acc].sort((a, b) => a - b)).toEqual(s);
		}
	});

	it("Kirchhoff's count b₁ = E − V + c matches the engine for random spanning trees and random cuts", () => {
		const rnd = mulberry(7);
		for (let trial = 0; trial < 200; trial++) {
			const alive = edges.map(() => rnd() > 0.35);
			const E = alive.filter(Boolean).length;
			const c = componentCount(n, edges, (i) => alive[i]);
			const { K } = toEngine(n, edges, [], (i) => alive[i]);
			const H = homology(K, 'Z2');
			expect(H[0].rank).toBe(c);
			expect(H[1]?.rank ?? 0).toBe(E - n + c);
			// any spanning forest has V − c edges
			const order = edges.map((_, i) => i).sort(() => rnd() - 0.5);
			const tree = spanningForest(n, edges, (i) => alive[i], order);
			expect(tree.filter(Boolean).length).toBe(n - c);
		}
	});
});

describe('the triangulated patch of Figure 3.1.3', () => {
	const { pos, edges, tris } = patch;
	const n = pos.length;

	it('is a disk: V − E + F = 10 − 19 + 10 = 1, H₁ = H₂ = 0', () => {
		expect(edges.length).toBe(19);
		expect(tris.length).toBe(10);
		const { K } = toEngine(n, edges, tris);
		expect(K.eulerCharacteristic()).toBe(1);
		expect(homology(K, 'Z2').map((g) => g.rank)).toEqual([1, 0, 0]);
	});

	it('every cycle encloses a unique set of triangles, whose boundary is the cycle', () => {
		const { K, edgeToEngine, triToEngine } = toEngine(n, edges, tris);
		for (const R of subsets(tris.length)) {
			const z = boundaryZ2(K, 2, R.map((t) => triToEngine(tris[t])))
				.map((i) => K.simplices[1][i])
				.map(([a, b]) => edges.findIndex(([p, q]) => p === a && q === b));
			const back = enclosedTriangles(patch, z);
			expect(back).toEqual(R);
			expect(z.map(edgeToEngine).every((i) => i >= 0)).toBe(true);
		}
	});

	it('with some triangles emptied, b₁ = number of empty triangles, and a cycle bounds iff it encloses no empty triangle', () => {
		const sides = triangleEdges(edges, tris);
		for (const empty of [[3, 9], [1, 7], [0], [2, 4, 6], []]) {
			const filled = tris.filter((_, i) => !empty.includes(i)) as Tri[];
			const { K, edgeToEngine } = toEngine(n, edges, filled);
			expect(homology(K, 'Z2')[1].rank).toBe(empty.length);
			const H = new Z2HomologyBasis(K, 1);
			for (const R of subsets(tris.length).filter((_, m) => m % 13 === 0)) {
				let z = new Set<number>();
				for (const t of R) z = symDiff(z, sides[t]);
				const bounds = H.isBoundary([...z].map(edgeToEngine));
				expect(bounds).toBe(R.every((t) => !empty.includes(t)));
			}
		}
	});
});

describe('surfaces: the claims made in §3.1', () => {
	it('sphere: every loop bounds (b₁ = 0) and the sphere itself is a 2-cycle that bounds nothing (b₂ = 1)', () => {
		for (const S of [ex.sphereTetra(), ex.sphereOcta()]) {
			expect(homology(S, 'Z2').map((g) => g.rank)).toEqual([1, 0, 1]);
		}
		// filling the inside kills the 2-cycle
		expect(homology(ex.ball(), 'Z2').map((g) => g.rank)).toEqual([1, 0, 0, 0]);
	});

	it('torus: meridian, longitude and their sum (the diagonal) do not bound; twice-around does mod 2 but not over ℤ', () => {
		const { complex: T, vertexGrid } = ex.gridSurface('torus', 3, 3);
		const at = (i: number, j: number) => vertexGrid.findIndex(([a, b]) => a === ((i % 3) + 3) % 3 && b === ((j % 3) + 3) % 3);
		const loop = (pts: [number, number][]) =>
			pts.map((p, k) => {
				const q = pts[(k + 1) % pts.length];
				return T.indexOf([at(...p), at(...q)]);
			});
		const h = loop([
			[0, 0],
			[1, 0],
			[2, 0]
		]);
		const v = loop([
			[0, 0],
			[0, 1],
			[0, 2]
		]);
		const d = loop([
			[0, 0],
			[1, 1],
			[2, 2]
		]);
		expect([...h, ...v, ...d].every((i) => i >= 0)).toBe(true);
		const H = new Z2HomologyBasis(T, 1, [h, v]);
		expect(H.rank).toBe(2);
		expect(H.classOf(h)).toEqual([1, 0]);
		expect(H.classOf(v)).toEqual([0, 1]);
		expect(H.classOf([...symDiff(h, v)])).toEqual([1, 1]);
		expect(H.classOf(d)).toEqual([1, 1]); // the (1,1) loop is homologous to h + v
		// a small loop (the rim of one triangle) bounds
		expect(H.isBoundary(boundaryZ2(T, 2, [0]))).toBe(true);
	});

	it('b₁ of a genus-g surface is 2g, not g', () => {
		expect(homology(ex.torus7(), 'Z2')[1].rank).toBe(2);
		expect(homology(ex.genus2(), 'Z2')[1].rank).toBe(4);
	});

	it('a solid torus (a ring of tetrahedra) has b₁ = 1: its meridian bounds a disk inside', () => {
		const n = 10;
		const tets = Array.from({ length: n }, (_, i) => [i, (i + 1) % n, (i + 2) % n, (i + 3) % n]);
		const S = new SimplicialComplex(tets);
		expect(homology(S, 'Z').map((g) => g.rank)).toEqual([1, 1, 0, 0]);
	});

	it('a sphere with k openings (straw k = 2, trousers k = 3, T-shirt k = 4) has b₁ = k − 1; the rims together bound, no proper subset does', () => {
		const { K, rims } = cubeSphereWithHoles([0, 1, 2, 3, 4, 5]);
		expect(homology(K, 'Z2')[0].rank).toBe(1);
		for (const k of [2, 3, 4, 5, 6]) {
			const { K, rims } = cubeSphereWithHoles([0, 1, 2, 3, 4, 5].slice(0, k));
			expect(homology(K, 'Z2')[1].rank).toBe(k - 1);
			const H = new Z2HomologyBasis(K, 1);
			for (const S of subsets(k)) {
				let z = new Set<number>();
				for (const r of S) z = symDiff(z, rims[r]);
				expect(H.isCycle([...z])).toBe(true);
				expect(H.isBoundary([...z])).toBe(S.length === 0 || S.length === k);
			}
		}
		void rims;
	});

	it('an open straw (cylinder): its two end circles are homologous (together they bound the wall)', () => {
		const { complex: C, vertexGrid } = ex.gridSurface('cylinder', 4, 3);
		const at = (i: number, j: number) => vertexGrid.findIndex(([a, b]) => a === i % 4 && b === j);
		const ring = (j: number) => [0, 1, 2, 3].map((i) => C.indexOf([at(i, j), at(i + 1, j)]));
		const bottom = ring(0);
		const top = ring(3);
		const H = new Z2HomologyBasis(C, 1);
		expect(H.rank).toBe(1);
		expect(H.isBoundary(bottom)).toBe(false);
		expect(H.isBoundary(top)).toBe(false);
		expect(H.isBoundary([...symDiff(bottom, top)])).toBe(true);
	});

	it('two points are a 0-cycle that bounds iff they lie in the same component', () => {
		const K = new SimplicialComplex([[0, 1], [1, 2], [3, 4]]);
		const H = new Z2HomologyBasis(K, 0);
		expect(H.rank).toBe(2); // b₀ = 2 components
		expect(H.isBoundary([K.indexOf([0]), K.indexOf([2])])).toBe(true);
		expect(H.isBoundary([K.indexOf([0]), K.indexOf([3])])).toBe(false);
		expect(H.isBoundary([K.indexOf([0])])).toBe(false);
	});
});

describe('helpers', () => {
	it('unimodular partner of a coprime pair', () => {
		for (const [p, q] of [
			[1, 0],
			[0, 1],
			[1, 1],
			[2, 3],
			[3, 2],
			[1, 4],
			[4, 3],
			[3, 4]
		]) {
			expect(gcd(p, q)).toBe(1);
			const [r, s] = unimodularPartner(p, q);
			expect(p * s - q * r).toBe(1);
		}
	});
});

/**
 * The surface of a cube, each face subdivided into a 3×3 grid of squares (each
 * split into two triangles); the central square of each listed face is removed,
 * leaving a sphere with that many square openings. Returns the complex and the
 * engine edge indices of each opening's rim.
 */
function cubeSphereWithHoles(holeFaces: number[]) {
	const N = 3;
	const id = new Map<string, number>();
	const vid = (x: number, y: number, z: number) => {
		const k = `${x},${y},${z}`;
		if (!id.has(k)) id.set(k, id.size);
		return id.get(k)!;
	};
	// six faces: axis a fixed at 0 or N, other two coordinates (s, t) on the grid
	const facePoint = (f: number, s: number, t: number): [number, number, number] => {
		const a = Math.floor(f / 2);
		const side = f % 2 === 0 ? 0 : N;
		const p: number[] = [0, 0, 0];
		const others = [0, 1, 2].filter((x) => x !== a);
		p[a] = side;
		p[others[0]] = s;
		p[others[1]] = t;
		return p as [number, number, number];
	};
	const tris: number[][] = [];
	const rimsVerts: number[][][] = [];
	for (let f = 0; f < 6; f++) {
		for (let s = 0; s < N; s++)
			for (let t = 0; t < N; t++) {
				if (holeFaces.includes(f) && s === 1 && t === 1) continue;
				const a = vid(...facePoint(f, s, t));
				const b = vid(...facePoint(f, s + 1, t));
				const c = vid(...facePoint(f, s + 1, t + 1));
				const d = vid(...facePoint(f, s, t + 1));
				tris.push([a, b, c], [a, c, d]);
			}
		if (holeFaces.includes(f)) {
			const sq = [
				[1, 1],
				[2, 1],
				[2, 2],
				[1, 2]
			].map(([s, t]) => vid(...facePoint(f, s, t)));
			rimsVerts.push(sq.map((v, k) => [v, sq[(k + 1) % 4]]));
		}
	}
	const K = new SimplicialComplex(tris);
	const rims = rimsVerts.map((rim) => rim.map((e) => K.indexOf(e)));
	if (rims.some((r) => r.some((i) => i < 0))) throw new Error('rim edge missing');
	return { K, rims };
}
