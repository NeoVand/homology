// Loops on the boundary of a thickened knot. The meridian goes once round the
// tube; the longitude runs once along it, twisted just enough that it does not
// link the knot (linking number 0, the "Seifert framing"). These two loops are
// the generators of H₁ of the torus that bounds the thickened knot.
import type { V3 } from './diagram';

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: V3): V3 => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));

/**
 * A frame along a closed polyline that turns as little as possible
 * (parallel transport by double reflection), with the small mismatch on the
 * way round spread evenly, so that it closes up.
 */
export function rotationMinimizingFrame(K: V3[]): { T: V3[]; N: V3[]; B: V3[] } {
	const n = K.length;
	const T = K.map((_, i) => unit(sub(K[(i + 1) % n], K[(i - 1 + n) % n])));
	const N: V3[] = [];
	let ref: V3 = Math.abs(T[0][1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
	N.push(unit(sub(ref, mul(T[0], dot(ref, T[0])))));
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const v1 = sub(K[j], K[i]);
		const c1 = dot(v1, v1) || 1e-12;
		const rL = sub(N[i], mul(v1, (2 / c1) * dot(v1, N[i])));
		const tL = sub(T[i], mul(v1, (2 / c1) * dot(v1, T[i])));
		const v2 = sub(T[j], tL);
		const c2 = dot(v2, v2) || 1e-12;
		const next = unit(sub(rL, mul(v2, (2 / c2) * dot(v2, rL))));
		if (i < n - 1) N.push(next);
		else ref = next;
	}
	// the transported frame comes back turned by some angle: unwind it gradually
	const B0 = cross(T[0], N[0]);
	const back = ref;
	const mismatch = Math.atan2(dot(back, B0), dot(back, N[0]));
	const B: V3[] = [];
	for (let i = 0; i < n; i++) {
		const a = (-mismatch * i) / n;
		const b = cross(T[i], N[i]);
		const nn = add(mul(N[i], Math.cos(a)), mul(b, Math.sin(a)));
		N[i] = unit(nn);
		B.push(unit(cross(T[i], N[i])));
	}
	return { T, N, B };
}

/** a push-off of K at distance r, turning `twists` extra times round K on the way */
export function pushOff(K: V3[], r: number, twists: number, phase = 0): V3[] {
	const { N, B } = rotationMinimizingFrame(K);
	return K.map((p, i) => {
		const a = phase + (2 * Math.PI * twists * i) / K.length;
		return add(p, add(mul(N[i], r * Math.cos(a)), mul(B[i], r * Math.sin(a))));
	});
}

/** the small circle of radius r round K at the i-th point */
export function meridianAt(K: V3[], i: number, r: number, m = 64): V3[] {
	const { N, B } = rotationMinimizingFrame(K);
	return Array.from({ length: m }, (_, k) => {
		const a = (2 * Math.PI * k) / m;
		return add(K[i], add(mul(N[i], r * Math.cos(a)), mul(B[i], r * Math.sin(a))));
	});
}
