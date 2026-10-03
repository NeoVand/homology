// Small, exact-enough numerics for the differential-forms figures:
// line integrals, flux integrals and area integrals over (possibly
// self-intersecting) closed polygons, winding numbers, smooth closed curves,
// and low-discrepancy sequences for drawing stacks of sheets.
//
// Everything here is plain TypeScript (no DOM, no three.js) so it can be unit
// tested and reused by both the Differential Forms and de Rham chapters.

export type Vec2 = [number, number];
export type VField = (x: number, y: number) => Vec2;
export type SField = (x: number, y: number) => number;

// ── Gauss–Legendre rules on [0, 1] ─────────────────────────────────────────

function rule(xs: number[], ws: number[]): { x: number[]; w: number[] } {
	return { x: xs.map((t) => (t + 1) / 2), w: ws.map((w) => w / 2) };
}

const s35 = Math.sqrt(3 / 5);
export const GL3 = rule([-s35, 0, s35], [5 / 9, 8 / 9, 5 / 9]);
export const GL4 = rule(
	[-0.8611363115940526, -0.3399810435848563, 0.3399810435848563, 0.8611363115940526],
	[0.3478548451374538, 0.6521451548625461, 0.6521451548625461, 0.3478548451374538]
);
export const GL8 = rule(
	[
		-0.9602898564975363, -0.7966664774136267, -0.525532409916329, -0.1834346424956498, 0.1834346424956498,
		0.525532409916329, 0.7966664774136267, 0.9602898564975363
	],
	[
		0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.362683783378362, 0.362683783378362,
		0.3137066458778873, 0.2223810344533745, 0.1012285362903763
	]
);

/** ∫_a^b g(t) dt with composite 8-point Gauss–Legendre on n panels. */
export function integrate1D(g: (t: number) => number, a: number, b: number, panels = 8): number {
	let s = 0;
	const h = (b - a) / panels;
	for (let k = 0; k < panels; k++) {
		const a0 = a + k * h;
		for (let i = 0; i < 8; i++) s += GL8.w[i] * g(a0 + GL8.x[i] * h);
	}
	return s * h;
}

// ── vectors ───────────────────────────────────────────────────────────────

export const cross = (a: Vec2, b: Vec2) => a[0] * b[1] - a[1] * b[0];
export const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export const sub = (a: Vec2, b: Vec2): Vec2 => [a[0] - b[0], a[1] - b[1]];
export const add = (a: Vec2, b: Vec2): Vec2 => [a[0] + b[0], a[1] + b[1]];
export const scale = (a: Vec2, k: number): Vec2 => [a[0] * k, a[1] * k];
export const len = (a: Vec2) => Math.hypot(a[0], a[1]);
export const lerp2 = (a: Vec2, b: Vec2, t: number): Vec2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Signed area of a closed polygon (shoelace); positive when counterclockwise. */
export function signedArea(poly: Vec2[]): number {
	let s = 0;
	for (let i = 0; i < poly.length; i++) s += cross(poly[i], poly[(i + 1) % poly.length]);
	return s / 2;
}

export function centroid(poly: Vec2[]): Vec2 {
	let x = 0;
	let y = 0;
	for (const p of poly) {
		x += p[0];
		y += p[1];
	}
	return [x / poly.length, y / poly.length];
}

// ── integrals along polygons ───────────────────────────────────────────────

/**
 * ∫ P dx + Q dy along a polygon (closed by default), i.e. the work
 * ∫ F·dr of F = (P, Q). Each straight edge uses 4-point Gauss–Legendre,
 * which is exact for polynomial fields of degree ≤ 7.
 */
export function lineIntegral(poly: Vec2[], F: VField, closed = true): number {
	let s = 0;
	const n = closed ? poly.length : poly.length - 1;
	for (let i = 0; i < n; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		for (let k = 0; k < 4; k++) {
			const t = GL4.x[k];
			const [P, Q] = F(a[0] + t * dx, a[1] + t * dy);
			s += GL4.w[k] * (P * dx + Q * dy);
		}
	}
	return s;
}

/**
 * Flux of F = (P, Q) across a closed polygon: ∮ P dy − Q dx.
 * For a counterclockwise curve this is the outward flux ∮ F·n ds.
 */
export function fluxIntegral(poly: Vec2[], F: VField, closed = true): number {
	return lineIntegral(poly, (x, y) => {
		const [P, Q] = F(x, y);
		return [-Q, P];
	}, closed);
}

/**
 * ∬ g(p) · wind(γ, p) dA over the plane, for the closed polygon γ.
 * For a simple counterclockwise loop this is just ∬_inside g dA.
 *
 * The region is split into the fan of signed triangles (c, pᵢ, pᵢ₊₁) from a
 * centre c — an exact identity for winding-weighted integrals — and each
 * triangle is integrated with an 8×3 Gauss–Legendre rule in "polar-like"
 * coordinates (s along the ray from c, t across the edge).
 */
export function regionIntegral(poly: Vec2[], g: SField, center?: Vec2): number {
	const c = center ?? centroid(poly);
	let total = 0;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const J = cross(sub(a, c), sub(b, c));
		if (J === 0) continue;
		let tri = 0;
		for (let si = 0; si < 8; si++) {
			const s = GL8.x[si];
			let row = 0;
			for (let ti = 0; ti < 3; ti++) {
				const t = GL3.x[ti];
				const ex = a[0] + t * (b[0] - a[0]) - c[0];
				const ey = a[1] + t * (b[1] - a[1]) - c[1];
				row += GL3.w[ti] * g(c[0] + s * ex, c[1] + s * ey);
			}
			tri += GL8.w[si] * s * row;
		}
		total += J * tri;
	}
	return total;
}

// ── winding ────────────────────────────────────────────────────────────────

/** Winding number of a closed polygon around p (Sunday's crossing rule). */
export function windingNumber(poly: Vec2[], p: Vec2): number {
	let wn = 0;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const isLeft = (b[0] - a[0]) * (p[1] - a[1]) - (p[0] - a[0]) * (b[1] - a[1]);
		if (a[1] <= p[1]) {
			if (b[1] > p[1] && isLeft > 0) wn++;
		} else if (b[1] <= p[1] && isLeft < 0) wn--;
	}
	return wn;
}

/**
 * Total signed angle swept around p while walking the polygon:
 * exactly ∮ dθ for the angle form centred at p (each straight edge
 * contributes the angle it subtends, in (−π, π)).
 */
export function angleSum(poly: Vec2[], p: Vec2 = [0, 0], closed = true): number {
	let s = 0;
	const n = closed ? poly.length : poly.length - 1;
	for (let i = 0; i < n; i++) {
		const a = sub(poly[i], p);
		const b = sub(poly[(i + 1) % poly.length], p);
		s += Math.atan2(cross(a, b), dot(a, b));
	}
	return s;
}

/** Cumulative (continuous) angle along an open or closed path around p, starting at atan2. */
export function liftAngle(path: Vec2[], p: Vec2 = [0, 0]): number[] {
	const out: number[] = [];
	let th = Math.atan2(path[0][1] - p[1], path[0][0] - p[0]);
	out.push(th);
	for (let i = 1; i < path.length; i++) {
		const a = sub(path[i - 1], p);
		const b = sub(path[i], p);
		th += Math.atan2(cross(a, b), dot(a, b));
		out.push(th);
	}
	return out;
}

// ── smooth closed curves ───────────────────────────────────────────────────

/**
 * A smooth closed curve through the control points (centripetal
 * Catmull–Rom, which never forms cusps or self-loops between points).
 * Returns `perSeg` samples per control point.
 */
export function closedCatmullRom(pts: Vec2[], perSeg = 24): Vec2[] {
	const n = pts.length;
	const out: Vec2[] = [];
	if (n < 3) return pts.slice();
	const tj = (ti: number, a: Vec2, b: Vec2) => ti + Math.max(1e-6, Math.pow(len(sub(b, a)), 0.5));
	for (let i = 0; i < n; i++) {
		const p0 = pts[(i - 1 + n) % n];
		const p1 = pts[i];
		const p2 = pts[(i + 1) % n];
		const p3 = pts[(i + 2) % n];
		const t0 = 0;
		const t1 = tj(t0, p0, p1);
		const t2 = tj(t1, p1, p2);
		const t3 = tj(t2, p2, p3);
		for (let k = 0; k < perSeg; k++) {
			const t = t1 + ((t2 - t1) * k) / perSeg;
			const A1 = lerp2(p0, p1, (t - t0) / (t1 - t0));
			const A2 = lerp2(p1, p2, (t - t1) / (t2 - t1));
			const A3 = lerp2(p2, p3, (t - t2) / (t3 - t2));
			const B1 = lerp2(A1, A2, (t - t0) / (t2 - t0));
			const B2 = lerp2(A2, A3, (t - t1) / (t3 - t1));
			out.push(lerp2(B1, B2, (t - t1) / (t2 - t1)));
		}
	}
	return out;
}

/** Points on a circle, counterclockwise. */
export function circlePoly(c: Vec2, r: number, n = 256, phase = 0): Vec2[] {
	const out: Vec2[] = [];
	for (let i = 0; i < n; i++) {
		const a = phase + (2 * Math.PI * i) / n;
		out.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
	}
	return out;
}

// ── misc ──────────────────────────────────────────────────────────────────

/** van der Corput radical inverse: a low-discrepancy sequence in [0, 1). */
export function vdc(k: number, base = 2): number {
	let q = 0;
	let bk = 1 / base;
	let n = k;
	while (n > 0) {
		q += (n % base) * bk;
		n = Math.floor(n / base);
		bk /= base;
	}
	return q;
}

export const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

/** Format a number with a fixed number of decimals, using a true minus sign. */
export function fmt(x: number, d = 3): string {
	if (!isFinite(x)) return '—';
	const s = Math.abs(x) < 0.5 * Math.pow(10, -d) ? (0).toFixed(d) : x.toFixed(d);
	return s.replace('-', '−');
}

/** Same, but for use inside TeX strings. */
export function fmtTeX(x: number, d = 3): string {
	if (!isFinite(x)) return '\\text{—}';
	const s = Math.abs(x) < 0.5 * Math.pow(10, -d) ? (0).toFixed(d) : x.toFixed(d);
	return s;
}

/** Ease in-out (cubic), for animations. */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
