// Knots in space, loops around them, and the Gauss linking integral — the
// numbers behind the Alexander-duality figure.
export type V3 = [number, number, number];
export type Curve3 = (t: number) => V3;

const TAU = Math.PI * 2;
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: V3): V3 => mul(a, 1 / (norm(a) || 1));

/** A round circle in the horizontal plane (the unknot). */
export const unknot: Curve3 = (t) => [1.35 * Math.cos(TAU * t), 0, 1.35 * Math.sin(TAU * t)];

/** The trefoil knot, (sin t + 2 sin 2t, cos t − 2 cos 2t, −sin 3t), scaled and laid flat. */
export const trefoil: Curve3 = (t) => {
	const s = TAU * t;
	const x = Math.sin(s) + 2 * Math.sin(2 * s);
	const y = Math.cos(s) - 2 * Math.cos(2 * s);
	const z = -Math.sin(3 * s);
	return [0.47 * x, 0.58 * z, 0.47 * y];
};

/** An orthonormal frame (T, N, B) along a curve, using a fixed reference direction. */
export function frame(K: Curve3, t: number) {
	const h = 1e-4;
	const T = unit(sub(K(t + h), K(t - h)));
	let ref: V3 = [0, 1, 0];
	if (Math.abs(dot(ref, T)) > 0.9) ref = [1, 0, 0];
	const N = unit(cross(T, ref));
	const B = unit(cross(T, N));
	return { P: K(t), T, N, B };
}

/**
 * A loop around the knot near K(t0):
 *  'meridian' — once around the knot's tube,
 *  'double'   — twice around it (a (2,1) curve on the tube, which does not cross itself),
 *  'far'      — a small circle off to the side, linking nothing.
 */
export function loopAround(K: Curve3, t0: number, kind: 'meridian' | 'double' | 'far', rho = 0.3): Curve3 {
	const { P, T, N, B } = frame(K, t0);
	if (kind === 'meridian') {
		return (s) => {
			const a = TAU * s;
			return add(P, add(mul(N, rho * Math.cos(a)), mul(B, rho * Math.sin(a))));
		};
	}
	if (kind === 'double') {
		return (s) => {
			const a = TAU * s;
			const { P: Q, N: N2, B: B2 } = frame(K, t0 + 0.035 * Math.cos(a));
			const r = rho * (1 + 0.28 * Math.sin(a));
			return add(Q, add(mul(N2, r * Math.cos(2 * a)), mul(B2, r * Math.sin(2 * a))));
		};
	}
	// a little circle beside the knot, in the plane spanned by T and N, pushed away along B
	const C = add(P, mul(B, 0.72));
	return (s) => {
		const a = TAU * s;
		return add(C, add(mul(T, 0.24 * Math.cos(a)), mul(N, 0.24 * Math.sin(a))));
	};
}

export function sample(K: Curve3, n: number): V3[] {
	return Array.from({ length: n }, (_, i) => K(i / n));
}

/**
 * The Gauss linking integral of two closed polygons,
 *   lk = (1/4π) ∮∮ (r₁ − r₂) · (dr₁ × dr₂) / |r₁ − r₂|³,
 * evaluated with the midpoint rule on their segments.
 */
export function linkingNumber(A: V3[], B: V3[]): number {
	let s = 0;
	for (let i = 0; i < A.length; i++) {
		const a0 = A[i];
		const a1 = A[(i + 1) % A.length];
		const da = sub(a1, a0);
		const ma = mul(add(a0, a1), 0.5);
		for (let j = 0; j < B.length; j++) {
			const b0 = B[j];
			const b1 = B[(j + 1) % B.length];
			const db = sub(b1, b0);
			const mb = mul(add(b0, b1), 0.5);
			const r = sub(ma, mb);
			const d = norm(r);
			s += dot(r, cross(da, db)) / (d * d * d);
		}
	}
	return s / (4 * Math.PI);
}

/**
 * Points where a loop pierces the flat disk bounded by the unknot, with signs.
 * The disk is oriented by the right-hand rule from the direction of the knot
 * (for our circle its normal points down, along −y), so that the signed count
 * equals the linking number.
 */
export function diskPiercings(loop: V3[]): { p: V3; sign: number }[] {
	const n = unit(cross(unknot(0), unknot(0.25)));
	const out: { p: V3; sign: number }[] = [];
	for (let i = 0; i < loop.length; i++) {
		const a = loop[i];
		const b = loop[(i + 1) % loop.length];
		// treat height 0 as "above", so a sample lying exactly on the disk is counted once
		if (a[1] >= 0 === b[1] >= 0) continue;
		const t = a[1] / (a[1] - b[1]);
		const p: V3 = [a[0] + (b[0] - a[0]) * t, 0, a[2] + (b[2] - a[2]) * t];
		if (Math.hypot(p[0], p[2]) < 1.35) out.push({ p, sign: dot(sub(b, a), n) > 0 ? 1 : -1 });
	}
	return out;
}
