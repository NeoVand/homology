import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import { smith } from '$lib/math/linalg';
import { homology } from '$lib/math/homology';
import { mulberry32 } from '$lib/math/persistence';
import { players } from './player';
import { ledger, alternating } from './ledger';
import * as C from './complexes';
import { push } from './homologous';
import { zeroChain, loopChain } from './chains';
import { componentsOf, pathBetween } from './graph';
import type { FlatLayout } from './flat';

describe('computation player', () => {
	const P = Object.fromEntries(players().map((p) => [p.id, p]));
	it('quotes the right numbers', () => {
		expect(P.circle.facts).toEqual({ f: [3, 3], ranks: [0, 2, 0], betti: [1, 1] });
		expect(P.disk.facts).toEqual({ f: [3, 3, 1], ranks: [0, 2, 1, 0], betti: [1, 0, 0] });
		expect(P.sphere.facts).toEqual({ f: [4, 6, 4], ranks: [0, 3, 3, 0], betti: [1, 0, 1] });
		expect(P.torus.facts).toEqual({ f: [9, 27, 18], ranks: [0, 8, 17, 0], betti: [1, 2, 1] });
	});
	it('every step text mentions only consistent ranks', () => {
		const torusText = P.torus.steps.map((s) => s.body).join(' ');
		expect(torusText).toContain('rank \\(8\\)');
		expect(torusText).toContain('rank \\(17\\)');
		expect(torusText).toContain('= 2\\)');
		const sphereText = P.sphere.steps.map((s) => s.body).join(' ');
		expect(sphereText).toContain('S = [0,1,2] - [0,1,3] + [0,2,3] - [1,2,3]');
	});
	it('highlighted chains in the steps are cycles', () => {
		for (const p of players())
			for (const s of p.steps)
				for (const c of s.chains ?? []) expect(p.ex.K.boundary(1, c.chain).every((x) => x === 0)).toBe(true);
	});
	it('the sphere step: the square bounds [0,1,3] − [0,2,3]', () => {
		const S = P.sphere.ex.K;
		const sq = loopChain(S, [0, 1, 3, 2]);
		const c = zeroChain(S, 2);
		c[S.indexOf([0, 1, 3])] = 1;
		c[S.indexOf([0, 2, 3])] = -1;
		expect(S.boundary(2, c)).toEqual(sq);
	});
});

describe('Euler–Poincaré ledger', () => {
	for (const ex of [C.twoPoints(), C.hollowTriangle(), C.filledTriangle(), C.figureEight(), C.hollowTetrahedron(), C.torusGrid()]) {
		it(`${ex.id}: final Betti numbers and χ`, () => {
			const ev = ledger(ex.K);
			expect(ev.length).toBe(ex.K.fVector.reduce((a, b) => a + b, 0));
			const last = ev[ev.length - 1];
			expect(last.betti).toEqual(homology(ex.K, 'Z2').map((g) => g.rank));
			for (const e of ev) expect(alternating(e.counts)).toBe(alternating(e.betti));
			// every negative simplex pairs with a positive one of one dimension lower
			for (const e of ev) if (!e.positive) expect(ev[e.partner!].positive && ev[e.partner!].dim === e.dim - 1).toBe(true);
		});
	}
	it('torus halfway: 9 vertices and 18 edges give b0 = 1, b1 = 10', () => {
		const ev = ledger(C.torusGrid().K);
		expect(ev[26].counts).toEqual([9, 18, 0]);
		expect(ev[26].betti).toEqual([1, 10, 0]);
	});
});

describe('the prose claims', () => {
	it('∂Δ⁴ has ranks 4, 6, 4 and Betti numbers 1, 0, 0, 1', () => {
		const tets = [0, 1, 2, 3, 4].map((skip) => [0, 1, 2, 3, 4].filter((v) => v !== skip));
		const S3 = new SimplicialComplex(tets);
		expect(S3.fVector).toEqual([5, 10, 10, 5]);
		expect([1, 2, 3].map((k) => smith(S3.boundaryMatrix(k)).rank)).toEqual([4, 6, 4]);
		expect(homology(S3, 'Z').map((g) => g.rank)).toEqual([1, 0, 0, 1]);
	});
	it('the square with a diagonal (exercise 2)', () => {
		const b1 = (tris: number[][]) => homology(new SimplicialComplex([[0, 1], [1, 2], [2, 3], [0, 3], [0, 2], ...tris]), 'Z')[1].rank;
		expect(b1([])).toBe(2);
		expect(b1([[0, 1, 2]])).toBe(1);
		expect(b1([[0, 1, 2], [0, 2, 3]])).toBe(0);
	});
	it('solid tetrahedron χ = 1', () => {
		expect(C.solidTetrahedron().K.eulerCharacteristic()).toBe(1);
	});
});

/** signed crossings of the vertical line x = n (rightward) or horizontal line y = n (upward) in a grid layout */
function seamCocycle(L: FlatLayout, axis: 0 | 1, n = 3): number[] {
	const f = new Array<number>(L.K.count(1)).fill(0);
	const seen = new Set<number>();
	for (const d of L.edges) {
		const a = L.verts[d.a].q;
		const b = L.verts[d.b].q;
		const lo = Math.min(a[axis], b[axis]);
		const hi = Math.max(a[axis], b[axis]);
		if (lo === n - 1 && hi === n) {
			if (seen.has(d.e)) continue;
			seen.add(d.e);
			// orientation of [a,b] (a has the smaller label) goes from a to b
			f[d.e] = b[axis] > a[axis] ? 1 : -1;
		}
	}
	return f;
}
const pair = (f: number[], z: number[]) => f.reduce((s, x, i) => s + x * (z[i] ?? 0), 0);

describe('seam-crossing counts (the independence proof for a, b)', () => {
	it('torus: φ and ψ vanish on every triangle boundary; φ(a)=1, ψ(b)=1', () => {
		const T = C.torusGrid();
		const phi = seamCocycle(T.L, 0);
		const psi = seamCocycle(T.L, 1);
		for (let t = 0; t < T.K.count(2); t++) {
			const e = zeroChain(T.K, 2);
			e[t] = 1;
			const dt = T.K.boundary(2, e);
			expect(pair(phi, dt)).toBe(0);
			expect(pair(psi, dt)).toBe(0);
		}
		const [a, b] = T.cycles!.map((c) => c.chain);
		expect([pair(phi, a), pair(psi, a), pair(phi, b), pair(psi, b)]).toEqual([1, 0, 0, 1]);
	});
	it('Klein bottle: the upward count ψ is a cocycle with ψ(b) = 1, ψ(a) = 0', () => {
		const Kb = C.kleinGrid();
		const psi = seamCocycle(Kb.L, 1);
		for (let t = 0; t < Kb.K.count(2); t++) {
			const e = zeroChain(Kb.K, 2);
			e[t] = 1;
			expect(pair(psi, Kb.K.boundary(2, e))).toBe(0);
		}
		const [a, b] = Kb.cycles!.map((c) => c.chain);
		expect(pair(psi, b)).toBe(1);
		expect(pair(psi, a)).toBe(0);
	});
});

describe('pushing cycles never changes their class', () => {
	it('random pushes on the annulus keep the winding number', () => {
		const A = C.annulus();
		const rnd = mulberry32(3);
		for (const start of A.cycles!.map((c) => c.chain)) {
			let st = { z: start.slice(), c: zeroChain(A.K, 2) };
			for (let n = 0; n < 200; n++) {
				const t = Math.floor(rnd() * A.K.count(2));
				st = push(A.K, st, t, 1);
				expect(A.K.boundary(1, st.z).every((x) => x === 0)).toBe(true);
				expect(C.annulusWinding(A.K, st.z)).toBe(1);
			}
			// z′ = z + ∂c
			const dz = A.K.boundary(2, st.c);
			expect(st.z).toEqual(start.map((x, i) => x + dz[i]));
		}
	});
});

describe('graph helpers', () => {
	it('components and paths', () => {
		const comps = componentsOf(5, [
			[0, 1],
			[1, 2],
			[3, 4]
		]);
		expect(new Set(comps).size).toBe(2);
		expect(pathBetween(5, [[0, 1], [1, 2], [3, 4]], 0, 2)).toEqual([0, 1, 2]);
		expect(pathBetween(5, [[0, 1], [1, 2], [3, 4]], 0, 4)).toBeNull();
	});
});
