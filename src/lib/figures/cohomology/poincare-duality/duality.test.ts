import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import * as ex from '$lib/math/examples';
import { homology } from '$lib/math/homology';
import {
	BIG_PRIME,
	boundary1,
	boundary2,
	cup11,
	delta0,
	delta1,
	evaluate,
	orientTriangles,
	rankMod,
	triVerts
} from '../cup-product/cup';
import { fenceCochain, squareModel, type Pt } from '../cup-product/flat';
import { bettiCatalogue, cap20, cap21, dualCells, euler, hexPatch, isPalindrome } from './duality';

const z = (a: number[]) => a.map((x) => x || 0);
const rnd = (seed: number) => () => {
	seed = (seed * 1103515245 + 12345) % 2147483648;
	return (seed % 5) - 2;
};

describe('cap product with the fundamental class (torus grid)', () => {
	const n = 3;
	const M = squareModel('torus', n);
	const D = M.D;
	const T = orientTriangles(D)!;
	/** the loop of vertical edges at x = c (mod 1), oriented upwards */
	const vertical = (c: number) =>
		D.edges.map((_, e) =>
			M.edgeSegs[e].some((s) => Math.abs(s.a[0] - s.b[0]) < 1e-9 && Math.abs((((s.a[0] - c) % 1) + 1) % 1) < 1e-9 && s.b[1] > s.a[1]) ? 1 : 0
		);
	const horizontal = (c: number) =>
		D.edges.map((_, e) =>
			M.edgeSegs[e].some((s) => Math.abs(s.a[1] - s.b[1]) < 1e-9 && Math.abs((((s.a[1] - c) % 1) + 1) % 1) < 1e-9 && s.b[0] > s.a[0]) ? 1 : 0
		);
	it('D(α) = [T]⌢α is the vertical loop just right of the fence; D(β) = −(horizontal loop above it)', () => {
		for (let i0 = 0; i0 < n; i0++) {
			const a = fenceCochain(M, [
				[
					[(i0 + 0.5) / n, 0],
					[(i0 + 0.5) / n, 1]
				]
			]);
			const loop = vertical((i0 + 1) / n);
			expect(loop.reduce((s, x) => s + x, 0)).toBe(n);
			expect(cap21(D, T, a)).toEqual(loop);
		}
		for (let j0 = 0; j0 < n; j0++) {
			const b = fenceCochain(M, [
				[
					[1, (j0 + 0.5) / n],
					[0, (j0 + 0.5) / n]
				]
			]);
			expect(cap21(D, T, b)).toEqual(z(horizontal((j0 + 1) / n).map((x) => -x)));
		}
	});
	it('cocycles go to cycles, coboundaries to boundaries: [T]⌢δf = −∂([T]⌢f)', () => {
		const r = rnd(5);
		for (let k = 0; k < 6; k++) {
			const f = Array.from({ length: D.nV }, r);
			const lhs = cap21(D, T, delta0(D, f));
			const rhs = boundary2(D, cap20(D, T, f)).map((x) => -x);
			expect(z(lhs)).toEqual(z(rhs));
			const a = fenceCochain(M, [
				[
					[0.5, 0],
					[0.5, 1]
				]
			]);
			const phi = a.map((x, e) => x + delta0(D, f)[e]);
			expect(delta1(D, phi).every((x) => x === 0)).toBe(true);
			expect(boundary1(D, cap21(D, T, phi)).every((x) => x === 0)).toBe(true);
		}
	});
	it('⟨φ, c⌢ψ⟩ = ⟨ψ⌣φ, c⟩', () => {
		const r = rnd(9);
		for (let k = 0; k < 6; k++) {
			const c = D.tris.map(r);
			const phi = D.edges.map(r);
			const psi = D.edges.map(r);
			expect(evaluate(phi, cap21(D, c, psi))).toBe(evaluate(cup11(D, psi, phi), c));
		}
	});
});

describe('dual cells', () => {
	it('torus grid: counts flip, kites tile the square', () => {
		const M = squareModel('torus', 3);
		const { D } = M;
		const C = dualCells(M);
		expect(C.dualVertex.length).toBe(D.tris.length);
		expect(C.dualEdge.every((h) => h.length === 2)).toBe(true);
		expect(C.dualFace.every((k) => k.length === 6)).toBe(true);
		const area = (q: Pt[]) => Math.abs(q.reduce((s, p, i) => s + p[0] * q[(i + 1) % q.length][1] - q[(i + 1) % q.length][0] * p[1], 0)) / 2;
		const total = C.dualFace.flat().reduce((s, q) => s + area(q), 0);
		expect(total).toBeCloseTo(1, 10);
	});
	it('the boundary maps of the dual complex are the transposed (co)boundary maps', () => {
		for (const M of [squareModel('torus', 3), squareModel('torus', 4)]) {
			const { D } = M;
			const C = dualCells(M);
			const eps = M.triFlatSign; // counterclockwise orientation of each triangle
			const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
			const cross = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];
			// ∂*₁[t*, e*] where e* is e turned a quarter turn counterclockwise (it runs right → left)
			D.edges.forEach((_, e) => {
				const coeffInBoundary = new Map<number, number>();
				D.tris.forEach(([f, b, l], t) => {
					const c = (f === e ? 1 : 0) + (b === e ? 1 : 0) - (l === e ? 1 : 0);
					if (c) coeffInBoundary.set(t, c * eps[t]);
				});
				for (const seg of M.edgeSegs[e]) {
					// the flat triangle on each side of this flat copy
					D.tris.forEach((_, t) => {
						const P = M.triPts[t];
						const has = (q: Pt) => P.some((p) => Math.abs(p[0] - q[0]) < 1e-9 && Math.abs(p[1] - q[1]) < 1e-9);
						if (!has(seg.a) || !has(seg.b)) return;
						const B = C.dualVertex[t];
						const left = cross(sub(seg.b, seg.a), sub(B, seg.a)) > 0;
						expect(coeffInBoundary.get(t)).toBe(left ? 1 : -1);
					});
				}
			});
			// ∂*₂[e*, v*]: traverse the dual face v* counterclockwise around v
			D.tris.forEach((_, t) => {
				const [v0, v1, v2] = triVerts(D, t);
				const [P0, P1, P2] = M.triPts[t];
				const B = C.dualVertex[t];
				const corners: [number, Pt, [number, Pt][]][] = [
					[v0, P0, [[D.tris[t][0], P1], [D.tris[t][2], P2]]],
					[v1, P1, [[D.tris[t][0], P0], [D.tris[t][1], P2]]],
					[v2, P2, [[D.tris[t][1], P1], [D.tris[t][2], P0]]]
				];
				for (const [v, P, adj] of corners)
					for (const [e, Q] of adj) {
						const m: Pt = [(P[0] + Q[0]) / 2, (P[1] + Q[1]) / 2];
						// e's flat direction (tail → head) at this copy
						const dir = D.edges[e][0] === v ? sub(Q, P) : sub(P, Q);
						const estar: Pt = [-dir[1], dir[0]]; // quarter turn counterclockwise
						// on this half of e*, the counterclockwise traversal around P goes along ±(B − m)
						const along = sub(B, m);
						const ccw = cross(sub(m, P), along) > 0 ? along : ([-along[0], -along[1]] as Pt);
						const sign = Math.sign(estar[0] * ccw[0] + estar[1] * ccw[1]);
						expect(sign).toBe(D.edges[e][0] === v ? 1 : -1); // = −∂₁[v, e]
					}
			});
		}
	});
	it('planar hexagonal patch', () => {
		const M = hexPatch(2);
		expect([M.D.nV, M.D.edges.length, M.D.tris.length]).toEqual([19, 42, 24]);
		const C = dualCells(M);
		expect(C.dualFace.filter((k) => k.length === 6).length).toBe(7);
		expect(C.dualEdge.filter((h) => h.length === 1).length).toBe(12);
	});
});

/** the 3-torus as a 3×3×3 grid of cubes, each cut into 6 tetrahedra (Freudenthal–Kuhn) */
function torus3(n = 3) {
	const id = (x: number, y: number, z: number) => ((x + n) % n) + n * (((y + n) % n) + n * ((z + n) % n));
	const perms = [
		[0, 1, 2],
		[0, 2, 1],
		[1, 0, 2],
		[1, 2, 0],
		[2, 0, 1],
		[2, 1, 0]
	];
	const tets: number[][] = [];
	for (let x = 0; x < n; x++)
		for (let y = 0; y < n; y++)
			for (let w = 0; w < n; w++)
				for (const p of perms) {
					const v = [x, y, w];
					const s = [id(v[0], v[1], v[2])];
					for (const k of p) {
						v[k]++;
						s.push(id(v[0], v[1], v[2]));
					}
					tets.push(s);
				}
	return new SimplicialComplex(tets);
}

function bettiQ(K: SimplicialComplex): number[] {
	const ranks = [0];
	for (let k = 1; k <= K.dim; k++) ranks.push(rankMod(K.boundaryMatrix(k), BIG_PRIME));
	ranks.push(0);
	return Array.from({ length: K.dim + 1 }, (_, k) => K.count(k) - ranks[k] - ranks[k + 1]);
}

describe('the Betti catalogue', () => {
	const cat = Object.fromEntries(bettiCatalogue.map((e) => [e.id, e]));
	it('closed orientable manifolds are palindromes; the others are flagged correctly', () => {
		for (const e of bettiCatalogue) {
			expect(e.b.length).toBe(e.n + 1);
			if (e.closed) expect(isPalindrome(e.b2 ?? e.b)).toBe(true);
			if (e.closed && e.orientable) expect(isPalindrome(e.b)).toBe(true);
			if (e.closed && e.n % 2 === 1) expect(euler(e.b)).toBe(0);
		}
		expect(isPalindrome(cat.klein.b)).toBe(false);
		expect(isPalindrome(cat.rp2.b)).toBe(false);
		expect(isPalindrome(cat.wedge.b)).toBe(false);
		expect(isPalindrome(cat.disk.b)).toBe(false);
	});
	it('surfaces and S³, T³ by direct computation', () => {
		const q = (K: SimplicialComplex) => homology(K, 'Q').map((g) => g.rank);
		const two = (K: SimplicialComplex) => homology(K, 'Z2').map((g) => g.rank);
		expect(q(ex.sphereOcta())).toEqual(cat.s2.b);
		expect(q(ex.torus7())).toEqual(cat.t2.b);
		expect(q(ex.genus2())).toEqual(cat.g2.b);
		expect(q(ex.projectivePlane6())).toEqual(cat.rp2.b);
		expect(two(ex.projectivePlane6())).toEqual(cat.rp2.b2);
		expect(q(ex.kleinGrid(3, 3))).toEqual(cat.klein.b);
		expect(two(ex.kleinGrid(3, 3))).toEqual(cat.klein.b2);
		expect(q(ex.disk())).toEqual(cat.disk.b);
		const S3 = new SimplicialComplex([
			[0, 1, 2, 3],
			[0, 1, 2, 4],
			[0, 1, 3, 4],
			[0, 2, 3, 4],
			[1, 2, 3, 4]
		]);
		expect(bettiQ(S3)).toEqual(cat.s3.b);
		const T3 = torus3(3);
		expect(T3.fVector).toEqual([27, 189, 324, 162]);
		expect(bettiQ(T3)).toEqual(cat.t3.b);
		// two octahedra sharing the vertex 0
		const oct = ex.sphereOcta().simplices[2];
		const wedge = new SimplicialComplex([...oct, ...oct.map((t) => t.map((v) => (v === 0 ? 0 : v + 10)))]);
		expect(q(wedge)).toEqual(cat.wedge.b);
	});
	it('products and cell complexes', () => {
		const conv = (a: number[], b: number[]) => {
			const out = new Array<number>(a.length + b.length - 1).fill(0);
			a.forEach((x, i) => b.forEach((y, j) => (out[i + j] += x * y)));
			return out;
		};
		const S1 = [1, 1];
		const S2 = [1, 0, 1];
		expect(conv(S1, S2)).toEqual(cat.s1s2.b);
		expect(conv(S2, S2)).toEqual(cat.s2s2.b);
		expect(conv(conv(S1, S1), S1)).toEqual(cat.t3.b);
		expect(conv(conv(S1, S1), conv(S1, S1))).toEqual(cat.t4.b);
		// ℂP²: cells in degrees 0, 2, 4, all boundaries zero
		expect([1, 0, 1, 0, 1]).toEqual(cat.cp2.b);
		// ℝP³: cellular chain complex ℤ ←0− ℤ ←2− ℤ ←0− ℤ
		const d = [0, 0, 2, 0, 0]; // d_k : C_k → C_{k−1}, k = 0…4
		const rk = (p: number) => d.map((x) => (x % p === 0 ? 0 : 1));
		const betti = (p: number) => [0, 1, 2, 3].map((k) => 1 - rk(p)[k] - rk(p)[k + 1]);
		expect(betti(BIG_PRIME)).toEqual(cat.rp3.b);
		expect(betti(2)).toEqual(cat.rp3.b2);
	});
});
