import { describe, expect, it } from 'vitest';
import { homology, groupName, Z2HomologyBasis, boundaryZ2 } from '$lib/math/homology';
import { isClosedSurface, isOrientable } from '$lib/math/complex';
import * as C from './complexes';
import { counterclockwise } from './flat';
import { addChains, chainOf, conflictCycle, isZero, loopChain, inRationalSpan, bettiModP, chainTeX, coherentOrientation } from './chains';

const names = (K: Parameters<typeof homology>[0], c: 'Z' | 'Z2' | 'Q' = 'Z') => homology(K, c).map((g) => groupName(g, c));
const ones = (c: number[]) => c.flatMap((x, i) => (x % 2 ? [i] : []));

describe('small examples', () => {
	it('point and two points', () => {
		expect(names(C.point().K)).toEqual(['ℤ']);
		expect(names(C.twoPoints().K)).toEqual(['ℤ²']);
		expect(names(C.interval().K)).toEqual(['ℤ', '0']);
	});
	it('hollow and filled triangle', () => {
		const H = C.hollowTriangle();
		expect(names(H.K)).toEqual(['ℤ', 'ℤ']);
		const z = H.cycles![0].chain;
		expect(z).toEqual([1, -1, 1]); // [01] − [02] + [12]
		expect(isZero(H.K.boundary(1, z))).toBe(true);
		expect(H.K.boundaryMatrix(1)).toEqual([
			[-1, -1, 0],
			[1, 0, -1],
			[0, 1, 1]
		]);
		const D = C.filledTriangle();
		expect(names(D.K)).toEqual(['ℤ', '0', '0']);
		expect(D.K.boundary(2, [1])).toEqual(z);
	});
	it('hollow tetrahedron: the counterclockwise net orientation is the 2-cycle ±∂[0,1,2,3]', () => {
		const S = C.hollowTetrahedron();
		expect(S.K.fVector).toEqual([4, 6, 4]);
		expect(names(S.K)).toEqual(['ℤ', '0', 'ℤ']);
		const eps = counterclockwise(S.L);
		expect(isZero(S.K.boundary(2, eps))).toBe(true);
		// triangles in order 012, 013, 023, 123; ∂[0123] = [123] − [023] + [013] − [012]
		const d0123 = [-1, 1, -1, 1];
		expect(eps.join() === d0123.join() || eps.join() === d0123.map((x) => -x).join()).toBe(true);
		expect(S.K.boundaryMatrix(2)).toEqual([
			[1, 1, 0, 0],
			[-1, 0, 1, 0],
			[0, -1, -1, 0],
			[1, 0, 0, 1],
			[0, 1, 0, -1],
			[0, 0, 1, 1]
		]);
	});
	it('figure eight', () => {
		const F = C.figureEight();
		expect(names(F.K)).toEqual(['ℤ', 'ℤ²']);
		for (const c of F.cycles!) expect(isZero(F.K.boundary(1, c.chain))).toBe(true);
		expect(F.K.fVector).toEqual([5, 6]);
	});
	it('solid tetrahedron', () => {
		expect(names(C.solidTetrahedron().K)).toEqual(['ℤ', '0', '0', '0']);
	});
});

describe('the 3×3 torus', () => {
	const T = C.torusGrid();
	it('matches the research triangulation', () => {
		const research = '014 034 347 367 167 016 125 145 458 478 278 127 023 235 356 568 068 028'.split(' ').sort();
		expect(T.K.simplices[2].map((t) => t.join('')).sort()).toEqual(research);
		expect(T.K.fVector).toEqual([9, 27, 18]);
		expect(isClosedSurface(T.K)).toBe(true);
		expect(isOrientable(T.K)).toBe(true);
	});
	it('homology ℤ, ℤ², ℤ and the generators a, b', () => {
		expect(names(T.K)).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		const [a, b] = T.cycles!.map((c) => c.chain);
		expect(isZero(T.K.boundary(1, a))).toBe(true);
		expect(isZero(T.K.boundary(1, b))).toBe(true);
		const H = new Z2HomologyBasis(T.K, 1, [ones(a), ones(b)]);
		expect(H.rank).toBe(2);
		expect(H.classOf(ones(a))).toEqual([1, 0]);
		expect(H.classOf(ones(b))).toEqual([0, 1]);
		// over ℚ too: a and b are independent modulo boundaries
		const D2 = T.K.boundaryMatrix(2);
		expect(inRationalSpan(D2, a)).toBe(false);
		expect(inRationalSpan(D2, b)).toBe(false);
		expect(inRationalSpan(D2.map((r, i) => [...r, a[i]]), b)).toBe(false);
	});
	it('all triangles counterclockwise in the picture form a 2-cycle', () => {
		const eps = counterclockwise(T.L);
		expect(eps.every((x) => x !== 0)).toBe(true);
		expect(isZero(T.K.boundary(2, eps))).toBe(true);
		const coh = coherentOrientation(T.K)!;
		expect(coh.join() === eps.join() || coh.join() === eps.map((x) => -x).join()).toBe(true);
	});
	it('the middle row is homologous to the bottom row: their difference bounds the strip between them', () => {
		const a = loopChain(T.K, [0, 1, 2]);
		const a2 = loopChain(T.K, [3, 4, 5]);
		const eps = counterclockwise(T.L);
		// strip between row 0 and row 1: the six triangles with vertices in rows 0 and 1
		const strip = T.K.simplices[2].map((t, i) => (t.every((v) => v < 6) ? eps[i] : 0));
		expect(strip.filter((x) => x).length).toBe(6);
		expect(T.K.boundary(2, strip)).toEqual(addChains(a, a2, -1));
	});
});

describe('the 3×3 Klein bottle', () => {
	const Kb = C.kleinGrid();
	it('matches the research triangulation', () => {
		const research = '014 034 347 367 267 026 125 145 458 478 178 127 023 235 356 568 068 018'.split(' ').sort();
		expect(Kb.K.simplices[2].map((t) => t.join('')).sort()).toEqual(research);
		expect(isClosedSurface(Kb.K)).toBe(true);
		expect(isOrientable(Kb.K)).toBe(false);
	});
	it('homology: ℤ, ℤ ⊕ ℤ/2, 0 — mod 2: 1, 2, 1', () => {
		expect(names(Kb.K)).toEqual(['ℤ', 'ℤ ⊕ ℤ/2', '0']);
		expect(names(Kb.K, 'Z2')).toEqual(['ℤ/2', '(ℤ/2)²', 'ℤ/2']);
		expect(bettiModP(Kb.K, 3)).toEqual([1, 1, 0]);
	});
	it('all triangles counterclockwise: the boundary is 2a, a = 0→1→2→0', () => {
		const eps = counterclockwise(Kb.L);
		const a = Kb.cycles![0].chain;
		expect(Kb.K.boundary(2, eps)).toEqual(a.map((x) => 2 * x));
		expect(conflictCycle(Kb.K, eps)).toEqual(a);
	});
	it('a is not a boundary (even mod 2); b has infinite order', () => {
		const [a, b] = Kb.cycles!.map((c) => c.chain);
		const H = new Z2HomologyBasis(Kb.K, 1, [ones(a), ones(b)]);
		expect(H.rank).toBe(2);
		expect(H.classOf(ones(a))).toEqual([1, 0]);
		const D2 = Kb.K.boundaryMatrix(2);
		expect(inRationalSpan(D2, a)).toBe(true); // a = ½ ∂(Σ) over ℚ
		expect(inRationalSpan(D2, b)).toBe(false); // no multiple of b bounds
	});
});

describe('the 6-vertex projective plane', () => {
	const P = C.projectivePlane();
	it('is the research triangulation with homology ℤ, ℤ/2, 0', () => {
		expect(P.K.fVector).toEqual([6, 15, 10]);
		expect(isClosedSurface(P.K)).toBe(true);
		expect(isOrientable(P.K)).toBe(false);
		expect(names(P.K)).toEqual(['ℤ', 'ℤ/2', '0']);
		expect(names(P.K, 'Z2')).toEqual(['ℤ/2', 'ℤ/2', 'ℤ/2']);
		expect(names(P.K, 'Q')).toEqual(['ℚ', '0', '0']);
	});
	it('the hexagon picture: all ten triangles counterclockwise have boundary 2c, c = 4→5→6→4', () => {
		const eps = counterclockwise(P.L);
		expect(eps.every((x) => x !== 0)).toBe(true);
		const c = loopChain(P.K, [4, 5, 6]);
		expect(P.K.boundary(2, eps)).toEqual(c.map((x) => 2 * x));
		expect(chainTeX(P.K, 1, c)).toBe('[4,5] - [4,6] + [5,6]');
		// the research report's orientations agree
		const research = chainOf(
			P.K,
			2,
			[
				[1, 2, 3],
				[1, 3, 4],
				[1, 4, 5],
				[1, 5, 6],
				[1, 6, 2],
				[2, 5, 3],
				[3, 6, 4],
				[2, 4, 5],
				[3, 5, 6],
				[2, 6, 4]
			]
		);
		expect(P.K.boundary(2, research)).toEqual(c.map((x) => 2 * x));
	});
	it('c is not a boundary mod 2: no set of triangles has boundary c (all 1024 tried)', () => {
		const c = ones(loopChain(P.K, [4, 5, 6]));
		let found = 0;
		for (let mask = 0; mask < 1 << 10; mask++) {
			const S = [];
			for (let t = 0; t < 10; t++) if (mask & (1 << t)) S.push(t);
			if (boundaryZ2(P.K, 2, S).join() === c.join()) found++;
		}
		expect(found).toBe(0);
		// and the sum of all ten triangles is a mod-2 cycle (the "phantom" H₂ mod 2)
		expect(boundaryZ2(P.K, 2, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([]);
	});
	it('every triangle of the rim fan is drawn once, rim vertices twice', () => {
		expect(P.L.tris.length).toBe(10);
		expect(P.L.verts.length).toBe(9);
	});
});

describe('Möbius band, genus 2, annulus', () => {
	it('Möbius band ℤ, ℤ, 0', () => {
		const M = C.mobiusBand();
		expect(M.K.fVector).toEqual([5, 10, 5]);
		expect(names(M.K)).toEqual(['ℤ', 'ℤ', '0']);
		expect(isZero(M.K.boundary(1, M.cycles![0].chain))).toBe(true);
	});
	it('genus 2 surface: closed, orientable, ℤ, ℤ⁴, ℤ, χ = −2, four independent loops', () => {
		const G = C.genus2();
		expect(G.K.fVector).toEqual([15, 51, 34]);
		expect(isClosedSurface(G.K)).toBe(true);
		expect(isOrientable(G.K)).toBe(true);
		expect(G.K.eulerCharacteristic()).toBe(-2);
		expect(names(G.K)).toEqual(['ℤ', 'ℤ⁴', 'ℤ']);
		const loops = G.cycles!.map((c) => ones(c.chain));
		const H = new Z2HomologyBasis(G.K, 1, loops);
		expect(H.rank).toBe(4);
		loops.forEach((l, i) => expect(H.classOf(l)).toEqual([0, 1, 2, 3].map((j) => (j === i ? 1 : 0))));
	});
	it('annulus: ℤ, ℤ, 0 and a winding-number cocycle', () => {
		const A = C.annulus();
		expect(A.K.fVector).toEqual([24, 56, 32]);
		expect(names(A.K)).toEqual(['ℤ', 'ℤ', '0']);
		for (const c of A.cycles!) {
			expect(isZero(A.K.boundary(1, c.chain))).toBe(true);
			expect(C.annulusWinding(A.K, c.chain)).toBe(1);
		}
		A.K.simplices[2].forEach((_, t) => {
			const e = new Array(A.K.count(2)).fill(0);
			e[t] = 1;
			expect(C.annulusWinding(A.K, A.K.boundary(2, e))).toBe(0);
		});
	});
});
