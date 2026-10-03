// The orientation painter. Choose an orientation ε_t = ±1 for every triangle of
// a closed surface. Each edge lies in two triangles; if they induce opposite
// directions on it, it cancels in ∂(Σ ε_t t); if they induce the same
// direction, it appears twice. So ∂(Σ ε_t t) = 2c for an integer 1-chain c,
// the "conflict cycle". Flipping one triangle t changes c by ∓∂t, a boundary,
// so the homology class [c] never changes: it is 0 exactly when the surface
// can be oriented, and otherwise an element of order two.
import type { SimplicialComplex } from '$lib/math/complex';
import { Z2HomologyBasis } from '$lib/math/homology';

export interface Conflicts {
	/** the conflict cycle c with ∂(Σ ε_t t) = 2c */
	c: number[];
	/** edges where the two triangles clash */
	edges: number[];
}

export function conflicts(K: SimplicialComplex, eps: number[]): Conflicts {
	const d = K.boundary(2, eps);
	const c = d.map((x) => x / 2);
	return { c, edges: c.flatMap((x, i) => (x ? [i] : [])) };
}

/**
 * Re-orient greedily: keep triangle `start`, then walk outwards across edges,
 * making each new triangle agree with the one we came from.
 */
export function greedyOrient(K: SimplicialComplex, eps: number[], start = 0): number[] {
	const cols = K.boundaryColumns(2);
	const out = eps.slice();
	const set = new Array<boolean>(cols.length).fill(false);
	const byEdge = new Map<number, number[]>();
	cols.forEach((col, j) => {
		for (const [i] of col) byEdge.set(i, [...(byEdge.get(i) ?? []), j]);
	});
	set[start] = true;
	const q = [start];
	while (q.length) {
		const j = q.shift()!;
		for (const [e, v] of cols[j])
			for (const j2 of byEdge.get(e)!) {
				if (j2 === j || set[j2]) continue;
				out[j2] = -out[j] * v * cols[j2].get(e)!;
				set[j2] = true;
				q.push(j2);
			}
	}
	return out;
}

/** mod-2 class of the conflict cycle in terms of preferred generators (e.g. a, b) */
export function conflictClass(H: Z2HomologyBasis, c: number[]): number[] | null {
	return H.classOf(c.flatMap((x, i) => (x % 2 ? [i] : [])));
}
