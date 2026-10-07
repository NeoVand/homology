// Every computed claim of §4.2, checked: the Δ-complex computations, the
// circle and sphere by matrices, the universal coefficient table, the doubling
// map, and the fence crossing counts.
import { describe, expect, it } from 'vitest';
import { SimplicialComplex } from '$lib/math/complex';
import { homology, cohomology, groupName, type HomologyGroup } from '$lib/math/homology';
import { transpose, matmul, smith } from '$lib/math/linalg';
import * as ex from '$lib/math/examples';
import {
	torusDelta,
	rp2Delta,
	kleinDelta,
	circleDelta,
	cellHomology,
	cellCohomology,
	cobd,
	bd,
	apply,
	isComplex,
	pushForward,
	pullBack,
	fenceCrossings
} from './cells';
import { spaces, tableFor } from './coefficients';
import { crossings, windings, MAX_WIGGLE } from './torusFences';

const names = (gs: HomologyGroup[], c: 'Z' | 'Z2' | 'Q' = 'Z') => gs.map((g) => groupName(g, c));

describe('the circle, by matrices (hollow triangle)', () => {
	const K = ex.circle(3);
	const d1 = K.boundaryMatrix(1);
	const delta0 = transpose(d1);
	it('∂₁ and δ₀ = ∂₁ᵀ are as printed', () => {
		expect(d1).toEqual([
			[-1, -1, 0],
			[1, 0, -1],
			[0, 1, 1]
		]);
		expect(delta0).toEqual([
			[-1, 1, 0],
			[-1, 0, 1],
			[0, -1, 1]
		]);
		// (δf)([a,b]) = f(b) − f(a)
		expect(apply(delta0, [5, 7, 2])).toEqual([2, -3, -5]);
	});
	it('H⁰ = ℤ (constants) and H¹ = ℤ, detected by the loop sum c₀₁ + c₁₂ − c₀₂', () => {
		expect(names(cohomology(K))).toEqual(['ℤ', 'ℤ']);
		const loop = (c: number[]) => c[0] + c[2] - c[1]; // edges [0,1],[0,2],[1,2]
		for (let v = 0; v < 3; v++) {
			const ind = [0, 0, 0];
			ind[v] = 1;
			expect(loop(apply(delta0, ind))).toBe(0);
		}
		expect(loop([1, 0, 0])).toBe(1);
		expect(smith(delta0).diagonal).toEqual([1, 1]);
	});
	it('the one-vertex circle has δ = 0, so H⁰ = H¹ = ℤ', () => {
		expect(names(cellCohomology(circleDelta))).toEqual(['ℤ', 'ℤ']);
	});
});

describe('the sphere (hollow tetrahedron)', () => {
	const S = ex.sphereTetra();
	it('H⁰ = ℤ, H¹ = 0, H² = ℤ, and any two triangle indicators are cohomologous up to sign', () => {
		expect(names(cohomology(S))).toEqual(['ℤ', '0', 'ℤ']);
		// δ₁ = ∂₂ᵀ: 4 triangles × 6 edges, rank 3, cokernel ℤ
		const delta1 = transpose(S.boundaryMatrix(2));
		expect(smith(delta1).rank).toBe(3);
		expect(smith(delta1).diagonal).toEqual([1, 1, 1]);
		// evaluation on the fundamental class [S²] = Σ ±triangles detects H²
		// ∂[0,1,2,3] = [1,2,3] − [0,2,3] + [0,1,3] − [0,1,2], in the engine's order [012, 013, 023, 123]
		const fund = [-1, 1, -1, 1];
		const K = new SimplicialComplex([[0, 1, 2, 3]]);
		expect(K.boundary(3, [1])).toEqual(fund);
		for (let e = 0; e < 6; e++) {
			const ind = new Array(6).fill(0);
			ind[e] = 1;
			const cob = apply(delta1, ind);
			expect(cob.reduce((s, x, i) => s + x * fund[i], 0)).toBe(0);
		}
	});
});

describe('the torus Δ-complex', () => {
	it('is a chain complex with H_* = H^* = ℤ, ℤ², ℤ', () => {
		expect(isComplex(torusDelta)).toBe(true);
		expect(names(cellHomology(torusDelta))).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		expect(names(cellCohomology(torusDelta))).toEqual(['ℤ', 'ℤ²', 'ℤ']);
		expect(names(cellCohomology(torusDelta, 'Z2'), 'Z2')).toEqual(['ℤ/2', '(ℤ/2)²', 'ℤ/2']);
	});
	it('δ₁ = [[1,1,−1],[1,1,−1]]; α = (1,0,1) and β = (0,1,1) are cocycles', () => {
		expect(cobd(torusDelta, 1)).toEqual([
			[1, 1, -1],
			[1, 1, -1]
		]);
		expect(apply(cobd(torusDelta, 1), [1, 0, 1])).toEqual([0, 0]);
		expect(apply(cobd(torusDelta, 1), [0, 1, 1])).toEqual([0, 0]);
		// cocycle condition: φ(c) = φ(a) + φ(b)
		expect(apply(cobd(torusDelta, 1), [2, 5, 7])).toEqual([0, 0]);
		expect(cobd(torusDelta, 0)).toEqual([[0], [0], [0]]);
	});
	it('H² = ℤ²/⟨(1,1)⟩ ≅ ℤ via (p, q) ↦ p − q, the value on [T] = L − U', () => {
		const delta1 = cobd(torusDelta, 1);
		for (let j = 0; j < 3; j++) {
			const ind = [0, 0, 0];
			ind[j] = 1;
			const [p, q] = apply(delta1, ind);
			expect(p - q).toBe(0);
		}
		expect(apply(bd(torusDelta, 2), [1, -1])).toEqual([0, 0, 0]); // L − U is a cycle
	});
	it('α and β evaluate as dual to the loops a and b: α(a) = 1, α(b) = 0, β(a) = 0, β(b) = 1', () => {
		const alpha = [1, 0, 1];
		const beta = [0, 1, 1];
		expect([alpha[0], alpha[1], beta[0], beta[1]]).toEqual([1, 0, 0, 1]);
	});
});

describe('the projective plane Δ-complex', () => {
	it('homology ℤ, ℤ/2, 0 and cohomology ℤ, 0, ℤ/2: the torsion moves up', () => {
		expect(isComplex(rp2Delta)).toBe(true);
		expect(names(cellHomology(rp2Delta))).toEqual(['ℤ', 'ℤ/2', '0']);
		expect(names(cellCohomology(rp2Delta))).toEqual(['ℤ', '0', 'ℤ/2']);
	});
	it('mod 2 everything is ℤ/2', () => {
		expect(names(cellHomology(rp2Delta, 'Z2'), 'Z2')).toEqual(['ℤ/2', 'ℤ/2', 'ℤ/2']);
		expect(names(cellCohomology(rp2Delta, 'Z2'), 'Z2')).toEqual(['ℤ/2', 'ℤ/2', 'ℤ/2']);
	});
	it('∂(T₁ + T₂) = 2c, and the integer cocycles are exactly the coboundaries (s, s, 0)', () => {
		expect(apply(bd(rp2Delta, 2), [1, 1])).toEqual([0, 0, 2]);
		const d1 = cobd(rp2Delta, 1);
		expect(apply(d1, [3, 3, 0])).toEqual([0, 0]);
		expect(apply(d1, [0, 0, 1])).toEqual([1, 1]);
		// coboundaries of vertex indicators
		expect(apply(cobd(rp2Delta, 0), [1, 0])).toEqual([-1, -1, 0]);
		expect(apply(cobd(rp2Delta, 0), [0, 1])).toEqual([1, 1, 0]);
	});
	it('H² = ℤ²/⟨(1,−1),(1,1)⟩: every coboundary changes p + q by an even number', () => {
		const d1 = cobd(rp2Delta, 1);
		for (let j = 0; j < 3; j++) {
			const ind = [0, 0, 0];
			ind[j] = 1;
			const [p, q] = apply(d1, ind);
			expect((p + q) % 2).toBe(0);
		}
		expect(smith(d1).diagonal).toEqual([1, 2]);
	});
	it('mod 2, φ = (1, 0, 1) is a cocycle that is not a coboundary', () => {
		const d1 = cobd(rp2Delta, 1);
		expect(apply(d1, [1, 0, 1]).map((x) => ((x % 2) + 2) % 2)).toEqual([0, 0]);
		// coboundaries mod 2 are 0 and (1,1,0)
		expect([0, 1].some((s) => [s, s, 0].join() === [1, 0, 1].join())).toBe(false);
	});
});

describe('the Klein bottle Δ-complex', () => {
	it('homology ℤ, ℤ ⊕ ℤ/2, 0; cohomology ℤ, ℤ, ℤ/2; mod 2: 1, 2, 1 like the torus', () => {
		expect(isComplex(kleinDelta)).toBe(true);
		expect(names(cellHomology(kleinDelta))).toEqual(['ℤ', 'ℤ ⊕ ℤ/2', '0']);
		expect(names(cellCohomology(kleinDelta))).toEqual(['ℤ', 'ℤ', 'ℤ/2']);
		expect(names(cellCohomology(kleinDelta, 'Z2'), 'Z2')).toEqual(['ℤ/2', '(ℤ/2)²', 'ℤ/2']);
		expect(names(cellCohomology(kleinDelta, 'Q'), 'Q')).toEqual(['ℚ', 'ℚ', '0']);
	});
	it('the integer cocycles are the multiples of (0, 1, 1)', () => {
		const d1 = cobd(kleinDelta, 1);
		expect(apply(d1, [0, 1, 1])).toEqual([0, 0]);
		expect(apply(d1, [1, 0, 0])).toEqual([1, 1]);
	});
});

describe('the universal coefficient table', () => {
	it('matches the research table and the engine for every space offered', () => {
		const want: Record<string, { hom: string[]; Z: string[]; Z2: string[]; R: string[] }> = {
			circle: { hom: ['ℤ', 'ℤ'], Z: ['ℤ', 'ℤ'], Z2: ['ℤ/2', 'ℤ/2'], R: ['ℝ', 'ℝ'] },
			sphere: { hom: ['ℤ', '0', 'ℤ'], Z: ['ℤ', '0', 'ℤ'], Z2: ['ℤ/2', '0', 'ℤ/2'], R: ['ℝ', '0', 'ℝ'] },
			torus: { hom: ['ℤ', 'ℤ²', 'ℤ'], Z: ['ℤ', 'ℤ²', 'ℤ'], Z2: ['ℤ/2', '(ℤ/2)²', 'ℤ/2'], R: ['ℝ', 'ℝ²', 'ℝ'] },
			klein: { hom: ['ℤ', 'ℤ ⊕ ℤ/2', '0'], Z: ['ℤ', 'ℤ', 'ℤ/2'], Z2: ['ℤ/2', '(ℤ/2)²', 'ℤ/2'], R: ['ℝ', 'ℝ', '0'] },
			rp2: { hom: ['ℤ', 'ℤ/2', '0'], Z: ['ℤ', '0', 'ℤ/2'], Z2: ['ℤ/2', 'ℤ/2', 'ℤ/2'], R: ['ℝ', '0', '0'] },
			mobius: { hom: ['ℤ', 'ℤ', '0'], Z: ['ℤ', 'ℤ', '0'], Z2: ['ℤ/2', 'ℤ/2', '0'], R: ['ℝ', 'ℝ', '0'] },
			figureEight: { hom: ['ℤ', 'ℤ²'], Z: ['ℤ', 'ℤ²'], Z2: ['ℤ/2', '(ℤ/2)²'], R: ['ℝ', 'ℝ²'] },
			genus2: { hom: ['ℤ', 'ℤ⁴', 'ℤ'], Z: ['ℤ', 'ℤ⁴', 'ℤ'], Z2: ['ℤ/2', '(ℤ/2)⁴', 'ℤ/2'], R: ['ℝ', 'ℝ⁴', 'ℝ'] }
		};
		for (const s of spaces) {
			const t = tableFor(s.id);
			expect(t.hom.map((g) => g.text)).toEqual(want[s.id].hom);
			expect(t.Z.map((g) => g.text)).toEqual(want[s.id].Z);
			expect(t.Z2.map((g) => g.text)).toEqual(want[s.id].Z2);
			expect(t.R.map((g) => g.text)).toEqual(want[s.id].R);
		}
	});
	it('the free part of Hᵏ matches Hₖ and the torsion moves up one degree (UCT)', () => {
		for (const { make } of Object.values(ex.examples)) {
			const K = make();
			const H = homology(K);
			const C = cohomology(K);
			C.forEach((g, k) => {
				expect(g.rank).toBe(H[k].rank);
				expect(g.torsion).toEqual(k > 0 ? H[k - 1].torsion : []);
			});
		}
	});
});

describe('contravariance: the doubling map z ↦ z²', () => {
	it('pushes the hexagon loop forward to twice the triangle loop', () => {
		// hexagon fundamental cycle: all six cyclic edges with coefficient 1
		expect(pushForward([1, 1, 1, 1, 1, 1])).toEqual([2, 2, -2]);
		// the triangle loop is [0,1] + [1,2] − [0,2]
	});
	it('pulls the triangle cochain back so that ⟨f*φ, z⟩ = ⟨φ, f_* z⟩ = 2', () => {
		const phi = [1, 0, 0]; // 1 on [0,1]: a fence across that edge
		const pulled = pullBack(phi);
		expect(pulled).toEqual([1, 0, 0, 1, 0, 0]);
		const z = [1, 1, 1, 1, 1, 1];
		const lhs = pulled.reduce((s, x, i) => s + x * z[i], 0);
		const fz = pushForward(z);
		const rhs = phi.reduce((s, x, i) => s + x * fz[i], 0);
		expect(lhs).toBe(2);
		expect(rhs).toBe(2);
	});
	it('naturality holds for every cochain and chain', () => {
		for (let s = 0; s < 30; s++) {
			const phi = [s % 5, (s * 3) % 7, (s * 11) % 4];
			const c = [s % 3, 1, -(s % 2), 2, s % 4, -1];
			const lhs = pullBack(phi).reduce((a, x, i) => a + x * c[i], 0);
			const fc = pushForward(c);
			const rhs = phi.reduce((a, x, i) => a + x * fc[i], 0);
			expect(lhs).toBe(rhs);
		}
	});
});

describe('fences on the torus', () => {
	it('a (p, q) loop crosses the meridian fence p times, counted with sign, however wiggly the fence', () => {
		for (const [p, q] of [
			[1, 0],
			[0, 1],
			[1, 1],
			[2, 1],
			[1, -1],
			[2, 0]
		]) {
			for (const A of [0, 0.08, 0.2]) {
				const X = fenceCrossings(p, q, { A, m: 2 });
				expect(X.reduce((s, x) => s + x.sign, 0)).toBe(p);
			}
		}
	});
	it('a wiggly fence can add crossings, but only in cancelling pairs', () => {
		const straight = fenceCrossings(0, 1, { A: 0 });
		const wiggly = fenceCrossings(0, 1, { A: 0.2, m: 2, u1: 0.2 });
		expect(straight.length).toBe(0);
		expect(wiggly.length).toBeGreaterThan(0);
		expect(wiggly.reduce((s, x) => s + x.sign, 0)).toBe(0);
	});
});

describe('the 3D fences figure', () => {
	const loops = ['p1q0', 'p0q1', 'p1q1', 'p2q1', 'small'] as const;
	it('fence α counts trips around the hole (p), fence β trips around the tube (q), at any wiggle', () => {
		for (const L of loops) {
			const [p, q] = windings(L);
			for (const A of [0, 0.05, 0.08, MAX_WIGGLE]) {
				const a = crossings({ kind: 'alpha', A }, L).reduce((s, x) => s + x.sign, 0);
				const b = crossings({ kind: 'beta', A }, L).reduce((s, x) => s + x.sign, 0);
				expect(a).toBe(p);
				expect(b).toBe(q);
			}
		}
	});
	it('the small fence bounds a disk: every loop crosses it a net 0 times', () => {
		for (const L of loops) expect(crossings({ kind: 'small', A: 0 }, L).reduce((s, x) => s + x.sign, 0)).toBe(0);
		// …though some loops do cross it, in pairs
		expect(crossings({ kind: 'small', A: 0 }, 'p1q0').length).toBe(2);
	});
	it('wiggling a fence adds crossings in cancelling pairs', () => {
		expect(crossings({ kind: 'alpha', A: 0 }, 'p0q1').length).toBe(0);
		const w = crossings({ kind: 'alpha', A: MAX_WIGGLE }, 'p0q1');
		expect(w.length).toBeGreaterThan(0);
		expect(w.reduce((s, x) => s + x.sign, 0)).toBe(0);
		const b = crossings({ kind: 'beta', A: MAX_WIGGLE }, 'p1q0');
		expect(b.length).toBeGreaterThan(0);
		expect(b.reduce((s, x) => s + x.sign, 0)).toBe(0);
	});
});

describe('δ is the transpose of ∂ on the kite', () => {
	it('δ₀ = ∂₁ᵀ, δ₁ = ∂₂ᵀ and δ₁δ₀ = 0', () => {
		const K = new SimplicialComplex([
			[0, 1, 2],
			[1, 2, 3]
		]);
		const d1 = K.boundaryMatrix(1);
		const d2 = K.boundaryMatrix(2);
		const D0 = transpose(d1);
		const D1 = transpose(d2);
		expect(matmul(D1, D0).every((r) => r.every((x) => x === 0))).toBe(true);
		// coboundary via the engine agrees with the matrix
		const f = [3, -1, 4, 2];
		expect(K.coboundary(0, f)).toEqual(apply(D0, f));
		const psi = [1, 2, -1, 0, 5];
		expect(K.coboundary(1, psi)).toEqual(apply(D1, psi));
		expect(K.simplices[1]).toEqual([
			[0, 1],
			[0, 2],
			[1, 2],
			[1, 3],
			[2, 3]
		]);
		expect(D1).toEqual([
			[1, -1, 1, 0, 0],
			[0, 0, 1, -1, 1]
		]);
	});
});
