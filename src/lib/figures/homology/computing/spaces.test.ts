import { describe, expect, it } from 'vitest';
import { groupName } from '$lib/math/homology';
import { isClosedSurface, isOrientable } from '$lib/math/complex';
import { wrappedDisk, lensesOf, predictedModP } from './spaces';
import * as C from '../homology-groups/complexes';
import { conflicts, greedyOrient, conflictClass } from './orientation';
import { counterclockwise } from '../homology-groups/flat';
import { Z2HomologyBasis } from '$lib/math/homology';
import { rp2Witness, countMod2Fillings } from './rp2';

describe('wrapped disks', () => {
	it('p = 3 has H = ℤ, ℤ/3, 0 and χ = 1', () => {
		const W = wrappedDisk(3);
		const L = lensesOf(W.K);
		expect(L.Z.map((g) => groupName(g))).toEqual(['ℤ', 'ℤ/3', '0']);
		expect(W.K.eulerCharacteristic()).toBe(1);
		expect(L.Q).toEqual([1, 0, 0]);
		expect(L.Z2).toEqual([1, 0, 0]);
		expect(L.Z3).toEqual([1, 1, 1]);
	});
	it('p = 2 is another projective plane', () => {
		const W = wrappedDisk(2);
		expect(isClosedSurface(W.K)).toBe(true);
		expect(isOrientable(W.K)).toBe(false);
		expect(lensesOf(W.K).Z.map((g) => groupName(g))).toEqual(['ℤ', 'ℤ/2', '0']);
	});
});

describe('coefficients: the universal-coefficient count matches direct computation', () => {
	const all = [C.hollowTetrahedron(), C.torusGrid(), C.kleinGrid(), C.projectivePlane(), C.mobiusBand(), C.genus2(), wrappedDisk(3), C.figureEight()];
	for (const ex of all)
		it(ex.id, () => {
			const L = lensesOf(ex.K);
			expect(L.Z2).toEqual(predictedModP(L.Z, 2));
			expect(L.Z3).toEqual(predictedModP(L.Z, 3));
			expect(L.Q).toEqual(L.Z.map((g) => g.rank));
		});
	it('the table quoted in the text', () => {
		const row = (ex: C.Example) => {
			const L = lensesOf(ex.K);
			return { Z: L.Z.map((g) => groupName(g)), Q: L.Q, Z2: L.Z2, Z3: L.Z3 };
		};
		expect(row(C.kleinGrid())).toEqual({ Z: ['ℤ', 'ℤ ⊕ ℤ/2', '0'], Q: [1, 1, 0], Z2: [1, 2, 1], Z3: [1, 1, 0] });
		expect(row(C.projectivePlane())).toEqual({ Z: ['ℤ', 'ℤ/2', '0'], Q: [1, 0, 0], Z2: [1, 1, 1], Z3: [1, 0, 0] });
		expect(row(C.torusGrid())).toEqual({ Z: ['ℤ', 'ℤ²', 'ℤ'], Q: [1, 2, 1], Z2: [1, 2, 1], Z3: [1, 2, 1] });
	});
});

describe('orientation painter', () => {
	it('torus: greedy orientation removes every clash; Klein: never', () => {
		const T = C.torusGrid();
		const Kb = C.kleinGrid();
		for (let s = 0; s < 18; s++) {
			expect(conflicts(T.K, greedyOrient(T.K, counterclockwise(T.L), s)).edges.length).toBe(0);
			expect(conflicts(Kb.K, greedyOrient(Kb.K, counterclockwise(Kb.L), s)).edges.length).toBeGreaterThan(0);
		}
	});
	it('the conflict class is invariant: 0 on the torus, [a] on the Klein bottle, for every orientation', () => {
		for (const [ex, want] of [
			[C.torusGrid(), [0, 0]],
			[C.kleinGrid(), [1, 0]]
		] as const) {
			const H = new Z2HomologyBasis(ex.K, 1, ex.cycles!.map((c) => c.chain.flatMap((x, i) => (x ? [i] : []))));
			for (let mask = 0; mask < 1 << 18; mask += 911) {
				const eps = ex.K.simplices[2].map((_, t) => (mask & (1 << t) ? -1 : 1));
				const info = conflicts(ex.K, eps);
				expect(info.c.every((x) => Number.isInteger(x))).toBe(true);
				expect(ex.K.boundary(1, info.c).every((x) => x === 0)).toBe(true);
				expect(conflictClass(H, info.c)).toEqual(want);
			}
		}
	});
	it('on the Klein bottle the fewest possible clashes is 3 (all 2^18 orientations)', () => {
		const ex = C.kleinGrid();
		const cols = ex.K.boundaryColumns(2);
		let minClash = Infinity;
		const d = new Array<number>(ex.K.count(1)).fill(0);
		for (let mask = 0; mask < 1 << 18; mask++) {
			d.fill(0);
			for (let t = 0; t < 18; t++) {
				const s = mask & (1 << t) ? -1 : 1;
				for (const [e, v] of cols[t]) d[e] += s * v;
			}
			let n = 0;
			for (const x of d) if (x) n++;
			if (n < minClash) minClash = n;
		}
		expect(minClash).toBe(3);
	}, 60000);
});

describe('ℝP² witness', () => {
	it('∂(Σ ccw) = 2c and no mod-2 filling of c exists', () => {
		const W = rp2Witness();
		expect(W.dSum).toEqual(W.c.map((x) => 2 * x));
		expect(W.interiorEdges.length).toBe(12);
		expect(countMod2Fillings([...W.rimEdges])).toBe(0);
	});
});
