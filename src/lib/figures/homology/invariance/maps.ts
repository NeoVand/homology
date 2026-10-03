// Computations behind the figures of §3.5 "Maps, Invariance, and First Triumphs".
// Everything here is checked in maps.test.ts.
import { SimplicialComplex, type Simplex } from '$lib/math/complex';

// ── simplicial maps and the chain maps they induce ─────────────────────────

/** Sort distinct numbers and report the sign of the sorting permutation. */
export function sortWithSign(a: number[]): { sorted: number[]; sign: 1 | -1 } {
	const s = a.slice();
	let sign: 1 | -1 = 1;
	// insertion sort, counting transpositions
	for (let i = 1; i < s.length; i++) {
		for (let j = i; j > 0 && s[j - 1] > s[j]; j--) {
			const t = s[j];
			s[j] = s[j - 1];
			s[j - 1] = t;
			sign = (sign === 1 ? -1 : 1) as 1 | -1;
		}
	}
	return { sorted: s, sign };
}

/** Is the vertex map f simplicial K → L (every simplex lands on a simplex)? */
export function isSimplicialMap(K: SimplicialComplex, L: SimplicialComplex, f: (v: number) => number): boolean {
	for (const dimList of K.simplices)
		for (const s of dimList) {
			const img = [...new Set(s.map(f))];
			if (!L.has(img)) return false;
		}
	return true;
}

/**
 * The image of an oriented k-simplex under f: ±(a k-simplex of L), or null when two
 * vertices land on the same vertex (a degenerate simplex, which we send to 0).
 */
export function imageOfSimplex(s: Simplex, f: (v: number) => number): { simplex: Simplex; sign: 1 | -1 } | null {
	const img = s.map(f);
	if (new Set(img).size < img.length) return null;
	const { sorted, sign } = sortWithSign(img);
	return { simplex: sorted, sign };
}

/**
 * Matrix of the chain map f_# : C_k(K) → C_k(L)
 * (rows = k-simplices of L, columns = k-simplices of K, in the engine's order).
 */
export function chainMapMatrix(K: SimplicialComplex, L: SimplicialComplex, f: (v: number) => number, k: number): number[][] {
	const M = Array.from({ length: L.count(k) }, () => new Array<number>(K.count(k)).fill(0));
	(K.simplices[k] ?? []).forEach((s, j) => {
		const im = imageOfSimplex(s, f);
		if (!im) return;
		const i = L.indexOf(im.simplex);
		if (i < 0) throw new Error(`not simplicial: ${s} ↦ ${im.simplex}`);
		M[i][j] += im.sign;
	});
	return M;
}

export function applyMatrix(M: number[][], v: number[]): number[] {
	return M.map((row) => row.reduce((acc, x, j) => acc + x * (v[j] ?? 0), 0));
}

/**
 * The 1-cycle "walk once around the n-gon 0 → 1 → … → n−1 → 0" in circle(n),
 * as coefficients on K.simplices[1].
 */
export function polygonLoop(K: SimplicialComplex, n: number): number[] {
	const z = new Array<number>(K.count(1)).fill(0);
	for (let i = 0; i < n; i++) {
		const a = i;
		const b = (i + 1) % n;
		const idx = K.indexOf([a, b]);
		z[idx] += a < b ? 1 : -1;
	}
	return z;
}

/**
 * Winding number of a closed walk on the hollow triangle given by vertex labels
 * (each label 0, 1 or 2): count +1 for each step 0→1, 1→2, 2→0 and −1 for each
 * step backwards, then divide by 3.
 */
export function windingOfLabels(labels: number[]): number {
	let steps = 0;
	const n = labels.length;
	for (let i = 0; i < n; i++) {
		const a = labels[i];
		const b = labels[(i + 1) % n];
		const d = (((b - a) % 3) + 3) % 3;
		if (d === 1) steps += 1;
		else if (d === 2) steps -= 1;
	}
	return steps / 3;
}

/**
 * The fundamental 2-cycle of a small triangulated sphere: a ±1 combination of all
 * triangles with zero boundary (found by brute force; fine for ≤ 16 triangles).
 */
export function fundamentalCycle(S: SimplicialComplex): number[] {
	const n = S.count(2);
	for (let mask = 0; mask < 1 << (n - 1); mask++) {
		const c = Array.from({ length: n }, (_, i) => (i === 0 ? 1 : mask & (1 << (i - 1)) ? -1 : 1));
		if (S.boundary(2, c).every((x) => x === 0)) return c;
	}
	throw new Error('no fundamental cycle (not an oriented closed surface)');
}

/** Degree of a simplicial self-map of a triangulated sphere: f_#[S] = deg · [S]. */
export function simplicialDegree(S: SimplicialComplex, f: (v: number) => number): number {
	const z = fundamentalCycle(S);
	const fz = applyMatrix(chainMapMatrix(S, S, f, 2), z);
	const i = z.findIndex((x) => x !== 0);
	const d = fz[i] / z[i];
	if (!fz.every((x, j) => x === d * z[j])) throw new Error('image is not a multiple of the fundamental cycle');
	return d;
}

// ── Brouwer: a "stirring" map of the closed unit disk ─────────────────────

export interface StirParams {
	/** swirl angle at the centre, in radians (the rim does not turn) */
	twist: number;
	/** overall shrink factor, 0 < scale < 1 */
	scale: number;
	/** where the centre is carried (|shift| ≤ 1 − scale keeps the image in the disk) */
	cx: number;
	cy: number;
}

/** f(p) = shift + scale · R(twist·(1 − |p|²)) · p : a continuous map D² → D². */
export function stir(P: StirParams, x: number, y: number): [number, number] {
	const r2 = x * x + y * y;
	const th = P.twist * (1 - Math.min(1, r2));
	const c = Math.cos(th);
	const s = Math.sin(th);
	return [P.cx + P.scale * (c * x - s * y), P.cy + P.scale * (s * x + c * y)];
}

/** Keep the shift inside the disk of radius 1 − scale, so f(D²) ⊆ D². */
export function clampShift(P: StirParams): StirParams {
	const lim = Math.max(0, 1 - P.scale);
	const d = Math.hypot(P.cx, P.cy);
	if (d <= lim) return P;
	return { ...P, cx: (P.cx / d) * lim, cy: (P.cy / d) * lim };
}

function jac(P: StirParams, x: number, y: number): [number, number, number, number] {
	const h = 1e-6;
	const [a1, b1] = stir(P, x + h, y);
	const [a0, b0] = stir(P, x - h, y);
	const [c1, d1] = stir(P, x, y + h);
	const [c0, d0] = stir(P, x, y - h);
	return [(a1 - a0) / (2 * h), (c1 - c0) / (2 * h), (b1 - b0) / (2 * h), (d1 - d0) / (2 * h)];
}

export interface FixedPoint {
	x: number;
	y: number;
	/** fixed-point index: sign det(I − Df) */
	index: 1 | -1 | 0;
}

/** All fixed points of the stirring map (Newton's method from a grid of seeds). */
export function stirFixedPoints(P: StirParams, seeds = 23): FixedPoint[] {
	const found: FixedPoint[] = [];
	for (let i = 0; i < seeds; i++)
		for (let j = 0; j < seeds; j++) {
			let x = -1 + (2 * (i + 0.5)) / seeds;
			let y = -1 + (2 * (j + 0.5)) / seeds;
			if (x * x + y * y > 1) continue;
			let ok = false;
			for (let it = 0; it < 60; it++) {
				const [fx, fy] = stir(P, x, y);
				const gx = fx - x;
				const gy = fy - y;
				if (Math.hypot(gx, gy) < 1e-13) {
					ok = true;
					break;
				}
				const [a, b, c, d] = jac(P, x, y);
				// Jacobian of g = f − id
				const A = a - 1;
				const D = d - 1;
				const det = A * D - b * c;
				if (Math.abs(det) < 1e-14) break;
				let dx = (D * gx - b * gy) / det;
				let dy = (-c * gx + A * gy) / det;
				const step = Math.hypot(dx, dy);
				if (step > 0.25) {
					dx *= 0.25 / step;
					dy *= 0.25 / step;
				}
				x -= dx;
				y -= dy;
				if (x * x + y * y > 1.2) break;
			}
			if (!ok) {
				const [fx, fy] = stir(P, x, y);
				ok = Math.hypot(fx - x, fy - y) < 1e-10;
			}
			if (!ok || x * x + y * y > 1 + 1e-9) continue;
			if (found.some((p) => Math.hypot(p.x - x, p.y - y) < 1e-6)) continue;
			const [a, b, c, d] = jac(P, x, y);
			const det = (1 - a) * (1 - d) - b * c;
			found.push({ x, y, index: det > 1e-9 ? 1 : det < -1e-9 ? -1 : 0 });
		}
	return found;
}

/**
 * Where the ray from f(x) through x leaves the disk: the would-be retraction
 * r(x) of the no-fixed-point argument. Undefined (null) at a fixed point.
 */
export function retractionPoint(P: StirParams, x: number, y: number): [number, number] | null {
	const [fx, fy] = stir(P, x, y);
	let dx = x - fx;
	let dy = y - fy;
	const len = Math.hypot(dx, dy);
	if (len < 1e-12) return null;
	dx /= len;
	dy /= len;
	// solve |x + t d| = 1 for t ≥ 0
	const b = x * dx + y * dy;
	const c = x * x + y * y - 1;
	const t = -b + Math.sqrt(Math.max(0, b * b - c));
	return [x + t * dx, y + t * dy];
}

// ── degree of a circle map: θ ↦ nθ + a·sin θ ──────────────────────────────

/** The lift F(θ) = nθ + a sin θ of a degree-n map of the circle. */
export function wobbleLift(n: number, a: number, th: number): number {
	return n * th + a * Math.sin(th);
}

/**
 * Preimages θ ∈ [0, 2π) of the angle φ under θ ↦ nθ + a sin θ (mod 2π),
 * each with the sign of the derivative (local orientation).
 */
export function circlePreimages(n: number, a: number, phi: number, samples = 4000): { th: number; sign: 1 | -1 }[] {
	const TAU = Math.PI * 2;
	const out: { th: number; sign: 1 | -1 }[] = [];
	// g(θ) = F(θ) − φ; preimages are where g crosses a multiple of 2π
	const g = (t: number) => wobbleLift(n, a, t) - phi;
	let prev = g(0);
	for (let i = 1; i <= samples; i++) {
		const t1 = (TAU * i) / samples;
		const t0 = (TAU * (i - 1)) / samples;
		const cur = g(t1);
		const k0 = Math.floor(prev / TAU);
		const k1 = Math.floor(cur / TAU);
		if (k0 !== k1) {
			// one or more levels crossed (samples are fine enough that it is one)
			const level = TAU * Math.max(k0, k1);
			let lo = t0;
			let hi = t1;
			const sLo = g(lo) - level;
			for (let it = 0; it < 60; it++) {
				const mid = (lo + hi) / 2;
				if ((g(mid) - level) * sLo > 0) lo = mid;
				else hi = mid;
			}
			const th = (lo + hi) / 2;
			if (th < TAU - 1e-9) {
				const d = n + a * Math.cos(th);
				out.push({ th, sign: d >= 0 ? 1 : -1 });
			}
		}
		prev = cur;
	}
	return out;
}

// ── winding number of a closed polygon around a point (Jordan) ────────────

export type Pt = [number, number];

export function windingNumber(poly: Pt[], p: Pt): number {
	let total = 0;
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		const a1 = Math.atan2(a[1] - p[1], a[0] - p[0]);
		const b1 = Math.atan2(b[1] - p[1], b[0] - p[0]);
		let d = b1 - a1;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d < -Math.PI) d += 2 * Math.PI;
		total += d;
	}
	return Math.round(total / (2 * Math.PI));
}

/** Points where the horizontal ray from p to the right crosses the polygon. */
export function rayCrossings(poly: Pt[], p: Pt): Pt[] {
	const out: Pt[] = [];
	for (let i = 0; i < poly.length; i++) {
		const a = poly[i];
		const b = poly[(i + 1) % poly.length];
		// half-open rule avoids double counting at vertices
		if (a[1] > p[1] !== b[1] > p[1]) {
			const x = a[0] + ((p[1] - a[1]) * (b[0] - a[0])) / (b[1] - a[1]);
			if (x > p[0]) out.push([x, p[1]]);
		}
	}
	return out.sort((u, v) => u[0] - v[0]);
}

/** Does the polygon cross itself? (Used to check that the Jordan curve is simple.) */
export function isSimplePolygon(poly: Pt[]): boolean {
	const n = poly.length;
	const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
	const segs = (p1: Pt, p2: Pt, q1: Pt, q2: Pt) => {
		const d1 = cross(q1, q2, p1);
		const d2 = cross(q1, q2, p2);
		const d3 = cross(p1, p2, q1);
		const d4 = cross(p1, p2, q2);
		return d1 * d2 < 0 && d3 * d4 < 0;
	};
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			if (Math.abs(i - j) <= 1 || (i === 0 && j === n - 1)) continue;
			if (segs(poly[i], poly[(i + 1) % n], poly[j], poly[(j + 1) % n])) return false;
		}
	return true;
}

/**
 * A maze-like Jordan curve: the outline of a serpentine corridor (a thick square
 * wave with `legs` vertical legs). Inside = the corridor; the gaps between the legs
 * open to the outside alternately at the top and at the bottom.
 */
export function mazeCurve(
	o: { legs?: number; x0?: number; pitch?: number; half?: number; yTop?: number; yBot?: number } = {}
): Pt[] {
	const L = o.legs ?? 6;
	const x0 = o.x0 ?? 80;
	const P = o.pitch ?? 88;
	const h = o.half ?? 22;
	const yT = o.yTop ?? 50;
	const yB = o.yBot ?? 350;
	const x = (k: number) => x0 + k * P;
	const pts: Pt[] = [[x(0) - h, yT]];
	// outer trace: along the tops of the legs and the top sides of the bottom connectors
	pts.push([x(0) + h, yT]);
	for (let k = 0; k < L - 1; k++) {
		if (k % 2 === 0) {
			// bottom connector between legs k and k+1
			pts.push([x(k) + h, yB - 2 * h], [x(k + 1) - h, yB - 2 * h], [x(k + 1) - h, yT]);
		} else {
			// top connector between legs k and k+1: walk along its top edge
			pts.push([x(k + 1) + h, yT]);
		}
	}
	const last = L - 1;
	if (last % 2 === 1) pts.push([x(last) + h, yT]);
	pts.push([x(last) + h, yB]);
	if (last % 2 === 0 && last > 0) {
		// the last leg hangs from a top connector: go round its free bottom end
		pts.push([x(last) - h, yB], [x(last) - h, yT + 2 * h]);
	}
	// inner trace back: along the bottoms of the bottom connectors, the undersides of the top ones
	for (let k = L - 2; k >= 0; k--) {
		if (k % 2 === 0) {
			pts.push([x(k) - h, yB]);
			if (k > 0) pts.push([x(k) - h, yT + 2 * h]);
		} else {
			pts.push([x(k) + h, yT + 2 * h], [x(k) + h, yB]);
		}
	}
	// dedupe consecutive duplicates
	return pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
}

// ── Lefschetz on the torus: x ↦ A x (mod 1) ───────────────────────────────

/** Fixed points of the linear torus map x ↦ A x mod ℤ² (A integer, det(A − I) ≠ 0). */
export function torusLinearFixedPoints(A: [[number, number], [number, number]]): Pt[] {
	const a = A[0][0] - 1;
	const b = A[0][1];
	const c = A[1][0];
	const d = A[1][1] - 1;
	const det = a * d - b * c;
	if (det === 0) return [];
	// x = (A − I)^{-1} k for integer k; enumerate k in a box large enough, keep x mod 1
	const out: Pt[] = [];
	const seen = new Set<string>();
	const R = Math.abs(a) + Math.abs(b) + Math.abs(c) + Math.abs(d) + 2;
	for (let k1 = -R; k1 <= R; k1++)
		for (let k2 = -R; k2 <= R; k2++) {
			let x = (d * k1 - b * k2) / det;
			let y = (-c * k1 + a * k2) / det;
			x = ((x % 1) + 1) % 1;
			y = ((y % 1) + 1) % 1;
			if (Math.abs(x - 1) < 1e-9) x = 0;
			if (Math.abs(y - 1) < 1e-9) y = 0;
			const key = `${Math.round(x * 1e6)},${Math.round(y * 1e6)}`;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push([x, y]);
		}
	return out;
}

/** Lefschetz number of x ↦ A x on the torus: 1 − tr A + det A = det(I − A). */
export function torusLefschetz(A: [[number, number], [number, number]]): number {
	return 1 - (A[0][0] + A[1][1]) + (A[0][0] * A[1][1] - A[0][1] * A[1][0]);
}
