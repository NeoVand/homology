// Planar vector fields with prescribed isolated zeros, and their indices.
//
// We write a vector (vx, vy) as the complex number vx + i vy. A zero at a of
//   source  is  w        sink   −w        centre  i·w
//   saddle  is  w̄        dipole  w²       monkey saddle  w̄²       (w = z − a)
// and a field with several zeros is the product of the factors. The direction
// of a product turns by the sum of the turns of its factors, so the winding
// number of the field around a loop is the sum of the indices of the zeros
// inside it — the whole content of the index theorem in the plane.

export type ZeroKind = 'source' | 'sink' | 'centre' | 'saddle' | 'dipole' | 'monkey';

export interface Zero {
	x: number;
	y: number;
	kind: ZeroKind;
}

export const indexOf: Record<ZeroKind, number> = {
	source: 1,
	sink: 1,
	centre: 1,
	saddle: -1,
	dipole: 2,
	monkey: -2
};

function factor(kind: ZeroKind, wx: number, wy: number): [number, number] {
	switch (kind) {
		case 'source':
			return [wx, wy];
		case 'sink':
			return [-wx, -wy];
		case 'centre':
			return [-wy, wx];
		case 'saddle':
			return [wx, -wy];
		case 'dipole':
			return [wx * wx - wy * wy, 2 * wx * wy];
		case 'monkey':
			return [wx * wx - wy * wy, -2 * wx * wy];
	}
}

/** The field at (x, y) (in the same coordinates as the zeros, y up). */
export function fieldAt(zeros: Zero[], x: number, y: number): [number, number] {
	let re = 1;
	let im = 0;
	for (const z of zeros) {
		const [fr, fi] = factor(z.kind, x - z.x, y - z.y);
		[re, im] = [re * fr - im * fi, re * fi + im * fr];
	}
	return [re, im];
}

/** Direction angle of the field at (x, y). */
export function fieldAngle(zeros: Zero[], x: number, y: number): number {
	const [a, b] = fieldAt(zeros, x, y);
	return Math.atan2(b, a);
}

/**
 * Winding number of a field along a closed polygon (counterclockwise loop
 * gives the sum of the indices inside). The polygon should be fine enough that
 * the direction turns by less than π between consecutive samples.
 */
export function windingAlong(angleAt: (x: number, y: number) => number, loop: [number, number][]): number {
	let total = 0;
	let prev = angleAt(loop[0][0], loop[0][1]);
	for (let k = 1; k <= loop.length; k++) {
		const p = loop[k % loop.length];
		const a = angleAt(p[0], p[1]);
		let d = a - prev;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d < -Math.PI) d += 2 * Math.PI;
		total += d;
		prev = a;
	}
	return total / (2 * Math.PI);
}

export function circleLoop(cx: number, cy: number, r: number, n = 720): [number, number][] {
	return Array.from({ length: n }, (_, k) => {
		const t = (2 * Math.PI * k) / n;
		return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as [number, number];
	});
}

/**
 * On the sphere (the plane plus a point at infinity, via stereographic
 * projection) the field acquires one more zero, at ∞, of index 2 − w where w
 * is the winding number around a huge circle. So the total is always 2 = χ(S²).
 */
export function indexAtInfinity(totalFinite: number): number {
	return 2 - totalFinite;
}
