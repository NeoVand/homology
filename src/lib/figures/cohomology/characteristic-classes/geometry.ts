// Small geometric computations used by the chapter's figures:
// spherical triangles (angle excess), turning of closed plane curves,
// the Wu–Yang monopole, and sections of line bundles over the circle.

export type V3 = [number, number, number];

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const unit = (a: V3): V3 => scale(a, 1 / Math.hypot(a[0], a[1], a[2]));

// ── spherical triangles ───────────────────────────────────────────────────

/** Angle at A of the geodesic triangle ABC on the unit sphere (A, B, C unit vectors). */
export function sphericalAngle(A: V3, B: V3, C: V3): number {
	const tb = unit(sub(B, scale(A, dot(A, B)))); // direction of the great circle towards B
	const tc = unit(sub(C, scale(A, dot(A, C))));
	return Math.acos(Math.max(-1, Math.min(1, dot(tb, tc))));
}

export function angleSum(A: V3, B: V3, C: V3): number {
	return sphericalAngle(A, B, C) + sphericalAngle(B, C, A) + sphericalAngle(C, A, B);
}

/** Area of the spherical triangle on the unit sphere, independently (Van Oosterom–Strackee). */
export function sphericalArea(A: V3, B: V3, C: V3): number {
	const num = Math.abs(dot(A, cross(B, C)));
	const den = 1 + dot(A, B) + dot(B, C) + dot(C, A);
	return 2 * Math.atan2(num, den);
}

/** Point on the great-circle arc from A to B (t ∈ [0, 1]). */
export function slerp(A: V3, B: V3, t: number): V3 {
	const om = Math.acos(Math.max(-1, Math.min(1, dot(A, B))));
	if (om < 1e-9) return A;
	const s = Math.sin(om);
	return [
		(Math.sin((1 - t) * om) / s) * A[0] + (Math.sin(t * om) / s) * B[0],
		(Math.sin((1 - t) * om) / s) * A[1] + (Math.sin(t * om) / s) * B[1],
		(Math.sin((1 - t) * om) / s) * A[2] + (Math.sin(t * om) / s) * B[2]
	];
}

export function fromAngles(lon: number, lat: number): V3 {
	return [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
}

// ── closed plane curves ─────────────────────────────────────────────────────

export type P2 = [number, number];

/** A closed centripetal Catmull–Rom spline through the control points, sampled. */
export function closedSpline(ctrl: P2[], perSeg = 40): P2[] {
	const n = ctrl.length;
	const out: P2[] = [];
	const alpha = 0.5;
	for (let i = 0; i < n; i++) {
		const p0 = ctrl[(i - 1 + n) % n];
		const p1 = ctrl[i];
		const p2 = ctrl[(i + 1) % n];
		const p3 = ctrl[(i + 2) % n];
		const tj = (ti: number, a: P2, b: P2) => ti + Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]) || 1e-6, alpha);
		const t0 = 0;
		const t1 = tj(t0, p0, p1);
		const t2 = tj(t1, p1, p2);
		const t3 = tj(t2, p2, p3);
		for (let k = 0; k < perSeg; k++) {
			const t = t1 + ((t2 - t1) * k) / perSeg;
			const lerp = (a: P2, b: P2, ta: number, tb: number): P2 => {
				const w = (t - ta) / (tb - ta);
				return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w];
			};
			const A1 = lerp(p0, p1, t0, t1);
			const A2 = lerp(p1, p2, t1, t2);
			const A3 = lerp(p2, p3, t2, t3);
			const B1 = lerp(A1, A2, t0, t2);
			const B2 = lerp(A2, A3, t1, t3);
			out.push(lerp(B1, B2, t1, t2));
		}
	}
	return out;
}

/** Signed turning angles (exterior angles) at each vertex of a closed polygon. */
export function turningAngles(poly: P2[]): number[] {
	const n = poly.length;
	const out: number[] = [];
	for (let i = 0; i < n; i++) {
		const a = poly[(i - 1 + n) % n];
		const b = poly[i];
		const c = poly[(i + 1) % n];
		const t1 = Math.atan2(b[1] - a[1], b[0] - a[0]);
		const t2 = Math.atan2(c[1] - b[1], c[0] - b[0]);
		let d = t2 - t1;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d < -Math.PI) d += 2 * Math.PI;
		out.push(d);
	}
	return out;
}

/** Total turning of a closed polygon divided by 2π: the turning number (an integer). */
export function turningNumber(poly: P2[]): number {
	return turningAngles(poly).reduce((s, x) => s + x, 0) / (2 * Math.PI);
}

// ── the magnetic monopole (Wu–Yang) ────────────────────────────────────────

/**
 * Units with ħ = c = 1 and particle charge q. A monopole of strength g has
 * flux 4πg through any sphere around it. On the northern patch use
 *   A_N = g (1 − cos θ) / (r sin θ) φ̂,
 * on the southern patch
 *   A_S = −g (1 + cos θ) / (r sin θ) φ̂.
 * Their difference 2g/(r sin θ) φ̂ is the gradient of χ = 2gφ, and the
 * wavefunctions are related by the phase e^{i q χ} = e^{i (2qg) φ}.
 */
export function wuYang(g: number, r: number, theta: number) {
	const s = Math.sin(theta);
	const AN = (g * (1 - Math.cos(theta))) / (r * s);
	const AS = (-g * (1 + Math.cos(theta))) / (r * s);
	return { AN, AS, diff: AN - AS };
}

/** ∮ A·dl around the circle of latitude θ (radius r sin θ) for a potential with only a φ̂ component. */
export function circulation(Aphi: number, r: number, theta: number): number {
	return Aphi * 2 * Math.PI * r * Math.sin(theta);
}

/** How badly the transition phase e^{i n φ} fails to close up after one turn (0 when n is an integer). */
export function phaseMismatch(n: number): number {
	const t = (((n * 2 * Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
	return Math.min(t, 2 * Math.PI - t);
}

// ── sections of line bundles over the circle ───────────────────────────────

/**
 * A section of the cylinder (twisted = false) or of the Möbius band (twisted =
 * true) through K equally spaced control values, as a function of θ ∈ [0, 2π].
 * Cubic (Catmull–Rom) interpolation; across the seam the Möbius band glues the
 * fibre to itself by t ↦ −t, so neighbours across the seam are negated:
 * s(θ + 2π) = −s(θ).
 */
export function sectionValue(vals: number[], twisted: boolean, theta: number): number {
	// θ is NOT reduced mod 2π: on [0, 2π] this is the continued section, so for
	// the Möbius band sectionValue(…, 2π) = −sectionValue(…, 0).
	const K = vals.length;
	const x = (theta / (2 * Math.PI)) * K;
	const i = Math.floor(x);
	const t = x - i;
	const get = (k: number) => {
		const m = Math.floor(k / K);
		const r = ((k % K) + K) % K;
		const sgn = twisted && m % 2 !== 0 ? -1 : 1;
		return sgn * vals[r];
	};
	const p0 = get(i - 1);
	const p1 = get(i);
	const p2 = get(i + 1);
	const p3 = get(i + 2);
	const t2 = t * t;
	const t3 = t2 * t;
	return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

/** Zeros of a section on [0, 2π): positions where it changes sign (plus exact zeros). */
export function sectionZeros(vals: number[], twisted: boolean, samples = 720): number[] {
	const zs: number[] = [];
	let prev = sectionValue(vals, twisted, 0);
	for (let k = 1; k <= samples; k++) {
		const th = (2 * Math.PI * k) / samples;
		// at θ = 2π the fibre is the one over θ = 0, read with the gluing
		const v = sectionValue(vals, twisted, th);
		if (prev === 0) zs.push((2 * Math.PI * (k - 1)) / samples);
		else if (prev * v < 0) {
			const a = (2 * Math.PI * (k - 1)) / samples;
			zs.push(a + ((th - a) * Math.abs(prev)) / (Math.abs(prev) + Math.abs(v)));
		}
		prev = v;
	}
	return zs.filter((z) => z < 2 * Math.PI - 1e-9);
}
