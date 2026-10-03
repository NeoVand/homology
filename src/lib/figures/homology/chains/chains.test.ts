import { describe, expect, it } from 'vitest';
import { fan, square, house, chainTeX, setTeX, permSign, orderedBoundary, orderedBoundaryTerms, tetraCascade } from './chains';
import { SimplicialComplex, key } from '$lib/math/complex';
import { boundaryZ2, homology } from '$lib/math/homology';
import { matmul, rankZ2, rankQ } from '$lib/math/linalg';
import * as ex from '$lib/math/examples';

const subsets = (n: number) => Array.from({ length: 1 << n }, (_, m) => Array.from({ length: n }, (_, i) => i).filter((i) => m & (1 << i)));

function permutations(a: number[]): number[][] {
	if (a.length <= 1) return [a];
	return a.flatMap((x, i) => permutations([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p]));
}

describe('the fan of Figure 3.2.1', () => {
	const K = fan.K;
	it('has 7 vertices, 12 edges, 5 triangles and one hole', () => {
		expect(K.fVector).toEqual([7, 12, 5]);
		expect(homology(K, 'Z2').map((g) => g.rank)).toEqual([1, 1, 0]);
		expect(fan.pos.length).toBe(7);
	});
	it('mod 2: the boundary of the boundary of every 2-chain is empty', () => {
		for (const c of subsets(K.count(2))) {
			const d = boundaryZ2(K, 2, c);
			expect(boundaryZ2(K, 1, d)).toEqual([]);
		}
	});
	it('mod 2: every vertex touches an even number of edges of a boundary (each counted twice)', () => {
		for (const c of subsets(K.count(2))) {
			const d = boundaryZ2(K, 2, c);
			const deg = new Array(K.count(0)).fill(0);
			for (const e of d) for (const v of K.simplices[1][e]) deg[v]++;
			expect(deg.every((x) => x % 2 === 0)).toBe(true);
		}
	});
	it('mod 2: the boundary of a 1-chain always has an even number of vertices (the fan is connected)', () => {
		for (const c of subsets(K.count(1)).filter((_, m) => m % 7 === 0)) {
			expect(boundaryZ2(K, 1, c).length % 2).toBe(0);
		}
	});
	it('the boundary of all five triangles is the loop 0-1-2-3-4-5-6-0', () => {
		const d = boundaryZ2(K, 2, [0, 1, 2, 3, 4]).map((i) => key(K.simplices[1][i]));
		expect(d.sort()).toEqual(['0,1', '0,6', '1,2', '2,3', '3,4', '4,5', '5,6'].sort());
	});
});

describe('signs and orientation', () => {
	it('∂[v0,v1] = v1 − v0 and ∂[v0,v1,v2] = [v1,v2] − [v0,v2] + [v0,v1] in the engine', () => {
		const I = ex.interval();
		expect(I.boundary(1, [1])).toEqual([-1, 1]);
		const D = ex.disk(); // edges [0,1], [0,2], [1,2]
		expect(D.boundary(2, [1])).toEqual([1, -1, 1]);
	});
	it('∂[0,1,2,3] = [1,2,3] − [0,2,3] + [0,1,3] − [0,1,2]', () => {
		const B = ex.ball(); // triangles [0,1,2], [0,1,3], [0,2,3], [1,2,3]
		expect(B.boundary(3, [1])).toEqual([-1, 1, -1, 1]);
	});
	it('reordering the vertices multiplies the boundary by the sign of the permutation', () => {
		for (const base of [
			[0, 1],
			[0, 1, 2],
			[0, 1, 2, 3]
		]) {
			const ref = orderedBoundary(base);
			for (const p of permutations(base)) {
				const b = orderedBoundary(p);
				const s = permSign(p);
				for (const [k, v] of ref) expect(b.get(k)).toBe(s * v);
			}
		}
		expect(permSign([1, 0, 2])).toBe(-1);
		expect(permSign([1, 2, 0])).toBe(1);
		expect(orderedBoundaryTerms([1, 0, 2]).map((t) => t.sign)).toEqual([1, -1, 1]);
	});
	it('∂∂ = 0 over ℤ on every example in the library', () => {
		for (const { make } of Object.values(ex.examples)) {
			const K = make();
			for (let k = 2; k <= K.dim; k++) {
				const P = matmul(K.boundaryMatrix(k - 1), K.boundaryMatrix(k));
				expect(P.every((row) => row.every((x) => x === 0))).toBe(true);
			}
		}
	});
	it('the coefficients of the boundary of any integer 1-chain add up to zero', () => {
		const K = fan.K;
		let seed = 3;
		const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648), seed / 2147483648);
		for (let t = 0; t < 50; t++) {
			const c = Array.from({ length: K.count(1) }, () => Math.floor(rnd() * 7) - 3);
			expect(K.boundary(1, c).reduce((a, b) => a + b, 0)).toBe(0);
		}
	});
});

describe('two triangles sharing an edge (Figure 3.2.5)', () => {
	const K = square.K; // edges [0,1],[0,2],[1,2],[1,3],[2,3]; triangles [0,1,2],[1,2,3]
	const e12 = K.indexOf([1, 2]);
	it('consistent orientations: the shared edge cancels', () => {
		const d = K.boundary(2, [1, -1]);
		expect(d[e12]).toBe(0);
		expect(chainTeX(K, 1, d)).toBe('[0,1] - [0,2] + [1,3] - [2,3]');
	});
	it('inconsistent orientations: the shared edge is counted twice', () => {
		const d = K.boundary(2, [1, 1]);
		expect(d[e12]).toBe(2);
		expect(chainTeX(K, 1, d)).toBe('[0,1] - [0,2] + 2[1,2] - [1,3] + [2,3]');
	});
	it('mod 2 both give the outer rim', () => {
		expect(setTeX(K, 1, boundaryZ2(K, 2, [0, 1]))).toBe('[0,1] + [0,2] + [1,3] + [2,3]');
	});
});

describe('the house of Figures 3.2.6–3.2.7', () => {
	const K = house.K;
	it('has boundary matrices of sizes 5×7 and 7×2 whose product is zero', () => {
		const d1 = K.boundaryMatrix(1);
		const d2 = K.boundaryMatrix(2);
		expect([d1.length, d1[0].length]).toEqual([5, 7]);
		expect([d2.length, d2[0].length]).toEqual([7, 2]);
		expect(matmul(d1, d2).flat().every((x) => x === 0)).toBe(true);
		expect(K.simplices[1].map((e) => e.join(''))).toEqual(['01', '02', '12', '13', '23', '24', '34']);
	});
	it('ranks: rank ∂₁ = 4, rank ∂₂ = 2, so dim Z₁ = 3, dim B₁ = 2 (one hole), over ℤ/2 and ℚ', () => {
		for (const r of [rankZ2, rankQ]) {
			expect(r(K.boundaryMatrix(1))).toBe(4);
			expect(r(K.boundaryMatrix(2))).toBe(2);
		}
		expect(homology(K, 'Z').map((g) => g.rank)).toEqual([1, 1, 0]);
		// dim Z₀ = 5 (everything), dim B₀ = 4, dim Z₂ = 0
	});
});

describe('the tetrahedron cascade (Figure 3.2.3)', () => {
	it('four signed faces; every edge appears in exactly two of them, with opposite directions', () => {
		const T = tetraCascade();
		expect(T.map((f) => `${f.sign > 0 ? '+' : '-'}${f.face.join('')}`)).toEqual(['+123', '-023', '+013', '-012']);
		const seen = new Map<string, string[]>();
		for (const f of T) for (const e of f.edges) seen.set(key(e.edge), [...(seen.get(key(e.edge)) ?? []), `${e.from}${e.to}`]);
		expect(seen.size).toBe(6);
		for (const [k, dirs] of seen) {
			expect(dirs.length).toBe(2);
			const [a, b] = k.split(',');
			expect(dirs.sort()).toEqual([`${a}${b}`, `${b}${a}`].sort());
		}
	});
	it('the hollow tetrahedron: its 2-cycles are the multiples of [0,1,2] − [0,1,3] + [0,2,3] − [1,2,3]', () => {
		const S = ex.sphereTetra();
		expect(S.boundary(2, [1, -1, 1, -1]).every((x) => x === 0)).toBe(true);
		expect(homology(S, 'Z')[2].rank).toBe(1);
		const tri = new SimplicialComplex([[0, 1, 2]]);
		expect(tri.boundaryMatrix(1)).toEqual([
			[-1, -1, 0],
			[1, 0, -1],
			[0, 1, 1]
		]);
		expect(tri.boundaryMatrix(2)).toEqual([[1], [-1], [1]]);
	});
});
