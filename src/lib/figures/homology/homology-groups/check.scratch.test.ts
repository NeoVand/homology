import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import { smith } from '$lib/math/linalg';
import { homology } from '$lib/math/homology';
import * as C from './complexes';
import { rankModP, zeroChain } from './chains';

describe('scratch checks', () => {
	it('Klein grid mod 2: a, b, a+b are not boundaries mod 2', () => {
		const Kb = C.kleinGrid();
		const K = Kb.K;
		const D2 = K.boundaryMatrix(2);
		const [a, b] = Kb.cycles!.map((c) => c.chain);
		const r = rankModP(D2, 2);
		const aug = (z: number[]) => rankModP(D2.map((row, i) => [...row, z[i]]), 2);
		expect(r).toBe(17);
		expect(rankModP(K.boundaryMatrix(1), 2)).toBe(8);
		expect(aug(a)).toBe(18);
		expect(aug(b)).toBe(18);
		expect(aug(a.map((x, i) => x + b[i]))).toBe(18);
		// every edge in exactly two triangles
		const cnt = new Array(K.count(1)).fill(0);
		for (const col of K.boundaryColumns(2)) for (const [e] of col) cnt[e]++;
		expect(cnt.every((x) => x === 2)).toBe(true);
	});
	it('six-cell torus by hand', () => {
		// rows a, b, c ; cols L, U
		const d2 = [
			[1, 1],
			[1, 1],
			[-1, -1]
		];
		const s = smith(d2);
		expect(s.rank).toBe(1);
		expect(s.diagonal ?? s).toBeTruthy();
		// klein: dL = -a + b + c, dU = a + b - c
		const k2 = [
			[-1, 1],
			[1, 1],
			[1, -1]
		];
		console.log('klein smith', JSON.stringify(smith(k2)));
		console.log('torus smith', JSON.stringify(smith(d2)));
	});
	it('holed triangle: 15 vertices, 30 edges, 15 triangles, H = Z, Z, 0', () => {
		// lattice points (i, j) with i + j <= 4; label
		const lab = (i: number, j: number) => {
			let n = 0;
			for (let jj = 0; jj < j; jj++) n += 5 - jj;
			return n + i;
		};
		const tris: number[][] = [];
		for (let j = 0; j < 4; j++)
			for (let i = 0; i + j < 4; i++) {
				tris.push([lab(i, j), lab(i + 1, j), lab(i, j + 1)]); // up
				if (i + j < 3) tris.push([lab(i + 1, j), lab(i + 1, j + 1), lab(i, j + 1)]); // down
			}
		expect(tris.length).toBe(16);
		// third row from the top = j = 1 (rows from top: j=3 has 1 up, j=2 has 2, j=1 has 3 up); middle up-triangle i = 1
		const hole = [lab(1, 1), lab(2, 1), lab(1, 2)];
		const kept = tris.filter((t) => t.join() !== hole.join());
		expect(kept.length).toBe(15);
		const K = new SimplicialComplex(kept);
		expect(K.fVector).toEqual([15, 30, 15]);
		expect(homology(K, 'Z').map((g) => g.rank)).toEqual([1, 1, 0]);
		// the hole's three edges each lie in exactly one remaining triangle (a down-triangle)
		const holeEdges = [
			[hole[0], hole[1]],
			[hole[0], hole[2]],
			[hole[1], hole[2]]
		].map((e) => K.indexOf(e.sort((x, y) => x - y)));
		const cnt = new Array(K.count(1)).fill(0);
		for (const col of K.boundaryColumns(2)) for (const [e] of col) cnt[e]++;
		expect(holeEdges.map((e) => cnt[e])).toEqual([1, 1, 1]);
		expect(zeroChain(K, 1).length).toBe(30);
	});
});
