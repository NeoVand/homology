// Logic for the "cycles modulo boundaries" figure: pushing a 1-cycle across a
// triangle adds ±(the triangle's boundary) and never changes its class.
import type { SimplicialComplex } from '$lib/math/complex';
import { addChains, type Chain } from './chains';

/** boundary of the triangle t (increasing-label orientation) as a dense 1-chain */
export function triBoundary(K: SimplicialComplex, t: number): Chain {
	const e = new Array<number>(K.count(2)).fill(0);
	e[t] = 1;
	return K.boundary(2, e);
}

/**
 * The sign s ∈ {+1, −1} for which z + s·∂t cancels the most of z
 * (ties broken towards `prefer`, e.g. counterclockwise on screen).
 */
export function pushSign(z: Chain, dt: Chain, prefer: 1 | -1 = 1): 1 | -1 {
	const gain = (s: number) => {
		let g = 0;
		dt.forEach((x, i) => {
			if (x) g += Math.abs(z[i]) - Math.abs(z[i] + s * x);
		});
		return g;
	};
	const gp = gain(1);
	const gm = gain(-1);
	if (gp > gm) return 1;
	if (gm > gp) return -1;
	return prefer;
}

export interface PushState {
	z: Chain;
	/** the 2-chain c with z = z_start + ∂c */
	c: Chain;
}

export function push(K: SimplicialComplex, st: PushState, t: number, prefer: 1 | -1 = 1): PushState & { sign: 1 | -1 } {
	const dt = triBoundary(K, t);
	const s = pushSign(st.z, dt, prefer);
	const c = st.c.slice();
	c[t] += s;
	return { z: addChains(st.z, dt, s), c, sign: s };
}

export const support = (c: Chain) => c.reduce((n, x) => n + (x ? 1 : 0), 0);
