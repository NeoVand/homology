// Extra test spaces for §3.4, and the bookkeeping of coefficients.
import { SimplicialComplex } from '$lib/math/complex';
import { homology, type HomologyGroup } from '$lib/math/homology';
import { buildFlat, type DV, type Pt } from '../homology-groups/flat';
import { bettiModP, loopChain } from '../homology-groups/chains';
import type { Example } from '../homology-groups/complexes';

/**
 * A disk whose rim wraps p times around a triangle 0 → 1 → 2 → 0
 * (the "Moore space" M(ℤ/p, 1)). The rim is a 3p-gon labelled 0,1,2,0,1,2,…;
 * inside sit a ring of 3p new vertices and a centre vertex. For p = 2 this is
 * another triangulation of the projective plane; for p = 3 its H₁ is ℤ/3.
 */
export function wrappedDisk(p: number): Example {
	const n = 3 * p;
	const R = 2.4;
	const r = 1.35;
	const angle = (k: number) => Math.PI / 2 + (2 * Math.PI * k) / n;
	const rim = (k: number): DV => [k % 3, [R * Math.cos(angle(k)), R * Math.sin(angle(k))] as Pt];
	const ring = (k: number): DV => [3 + (k % n), [r * Math.cos(angle(k + 0.5)), r * Math.sin(angle(k + 0.5))] as Pt];
	const centre: DV = [3 + n, [0, 0]];
	const tris: [DV, DV, DV][] = [];
	for (let k = 0; k < n; k++) {
		tris.push([rim(k), rim(k + 1), ring(k)]);
		tris.push([rim(k + 1), ring(k + 1), ring(k)]);
		tris.push([ring(k), ring(k + 1), centre]);
	}
	const K = new SimplicialComplex(tris.map((t) => t.map(([v]) => v)));
	return {
		id: `wrap${p}`,
		name: p === 3 ? 'Triple-wrapped disk' : `Disk wrapped ${p} times`,
		space: `M(\\Z/${p},1)`,
		K,
		L: buildFlat(K, { tris }, { scale: 50 }),
		cycles: [{ name: 'c', tex: 'c', k: 1, chain: loopChain(K, [0, 1, 2]), color: 'gold' }]
	};
}

/** number of torsion summands of g whose order is divisible by the prime p */
export const torsionDivisible = (g: HomologyGroup, p: number) => g.torsion.filter((d) => d % p === 0).length;

/**
 * The universal-coefficient count: dim H_k(K; ℤ/p) = b_k + t_k(p) + t_{k−1}(p),
 * where t_k(p) counts the torsion summands of H_k(K) of order divisible by p.
 */
export function predictedModP(H: HomologyGroup[], p: number): number[] {
	return H.map((g, k) => g.rank + torsionDivisible(g, p) + (k > 0 ? torsionDivisible(H[k - 1], p) : 0));
}

export interface Lenses {
	Z: HomologyGroup[];
	Q: number[];
	Z2: number[];
	Z3: number[];
}

export function lensesOf(K: SimplicialComplex): Lenses {
	return {
		Z: homology(K, 'Z'),
		Q: homology(K, 'Q').map((g) => g.rank),
		Z2: homology(K, 'Z2').map((g) => g.rank),
		Z3: bettiModP(K, 3)
	};
}
