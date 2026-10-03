// Small, dependency-free geometry and algebra helpers for the Homotopy chapter's
// 2D figures: smooth closed curves, winding numbers (the "lift" of the angle),
// straight-line homotopies, and words in the free group on a, b.

export type Pt = [number, number];

const TAU = Math.PI * 2;

// ── curves ────────────────────────────────────────────────────────────────

/** Centripetal Catmull–Rom spline through closed control points (Barry–Goldman form). */
export function catmullRomClosed(ctrl: Pt[], samplesPerSegment = 32): Pt[] {
	const n = ctrl.length;
	const out: Pt[] = [];
	if (n < 3) return ctrl.slice();
	const knot = (a: Pt, b: Pt, t: number) => t + Math.max(1e-6, Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1])));
	for (let i = 0; i < n; i++) {
		const p0 = ctrl[(i - 1 + n) % n];
		const p1 = ctrl[i];
		const p2 = ctrl[(i + 1) % n];
		const p3 = ctrl[(i + 2) % n];
		const t0 = 0;
		const t1 = knot(p0, p1, t0);
		const t2 = knot(p1, p2, t1);
		const t3 = knot(p2, p3, t2);
		for (let s = 0; s < samplesPerSegment; s++) {
			const t = t1 + ((t2 - t1) * s) / samplesPerSegment;
			const lerp = (a: Pt, b: Pt, ta: number, tb: number): Pt => {
				const u = (t - ta) / (tb - ta);
				return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
			};
			const a1 = lerp(p0, p1, t0, t1);
			const a2 = lerp(p1, p2, t1, t2);
			const a3 = lerp(p2, p3, t2, t3);
			const b1 = lerp(a1, a2, t0, t2);
			const b2 = lerp(a2, a3, t1, t3);
			out.push(lerp(b1, b2, t1, t2));
		}
	}
	return out;
}

/** Quadratic Bézier from a to b that passes through h at its midpoint. */
export function arcThrough(a: Pt, h: Pt, b: Pt, samples = 120): Pt[] {
	const c: Pt = [2 * h[0] - (a[0] + b[0]) / 2, 2 * h[1] - (a[1] + b[1]) / 2];
	const out: Pt[] = [];
	for (let i = 0; i <= samples; i++) {
		const s = i / samples;
		const u = 1 - s;
		out.push([u * u * a[0] + 2 * u * s * c[0] + s * s * b[0], u * u * a[1] + 2 * u * s * c[1] + s * s * b[1]]);
	}
	return out;
}

/** Cubic Bézier sampled at n+1 points. */
export function cubic(a: Pt, c1: Pt, c2: Pt, b: Pt, samples = 120): Pt[] {
	const out: Pt[] = [];
	for (let i = 0; i <= samples; i++) {
		const s = i / samples;
		const u = 1 - s;
		const w0 = u * u * u;
		const w1 = 3 * u * u * s;
		const w2 = 3 * u * s * s;
		const w3 = s * s * s;
		out.push([w0 * a[0] + w1 * c1[0] + w2 * c2[0] + w3 * b[0], w0 * a[1] + w1 * c1[1] + w2 * c2[1] + w3 * b[1]]);
	}
	return out;
}

export function pathD(pts: Pt[], closed = false, digits = 1): string {
	if (!pts.length) return '';
	const f = (v: number) => v.toFixed(digits);
	let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
	for (let i = 1; i < pts.length; i++) d += `L${f(pts[i][0])} ${f(pts[i][1])}`;
	return closed ? d + 'Z' : d;
}

/** Distance from point p to the segment ab. */
export function distToSegment(p: Pt, a: Pt, b: Pt): number {
	const dx = b[0] - a[0];
	const dy = b[1] - a[1];
	const L2 = dx * dx + dy * dy;
	let t = L2 > 0 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2 : 0;
	t = Math.max(0, Math.min(1, t));
	return Math.hypot(p[0] - (a[0] + t * dx), p[1] - (a[1] + t * dy));
}

/** Smallest distance from p to a polyline. */
export function distToPolyline(p: Pt, pts: Pt[], closed = false): number {
	let best = Infinity;
	const n = pts.length;
	const m = closed ? n : n - 1;
	for (let i = 0; i < m; i++) best = Math.min(best, distToSegment(p, pts[i], pts[(i + 1) % n]));
	return best;
}

// ── winding numbers and the lift ──────────────────────────────────────────

/**
 * Follow the angle of (curve(s) − centre) continuously, as the lift to the real
 * line does. Returns the unwrapped angle, measured in turns, at every sample
 * (starting from the true angle of the first sample). For a closed curve the
 * total change, `cumulative[last] − cumulative[0]` after closing, is the winding
 * number.
 */
export function liftAngle(curve: Pt[], centre: Pt, closed = true): { turns: number[]; total: number } {
	const n = curve.length;
	const turns: number[] = new Array(closed ? n + 1 : n);
	let prev = Math.atan2(curve[0][1] - centre[1], curve[0][0] - centre[0]);
	let acc = prev / TAU;
	turns[0] = acc;
	const count = closed ? n + 1 : n;
	for (let i = 1; i < count; i++) {
		const p = curve[i % n];
		const ang = Math.atan2(p[1] - centre[1], p[0] - centre[0]);
		let d = ang - prev;
		if (d > Math.PI) d -= TAU;
		else if (d < -Math.PI) d += TAU;
		acc += d / TAU;
		turns[i] = acc;
		prev = ang;
	}
	return { turns, total: turns[count - 1] - turns[0] };
}

/** Winding number of a closed polyline around a point (rounded). */
export function windingNumber(curve: Pt[], centre: Pt): number {
	return Math.round(liftAngle(curve, centre, true).total) || 0; // (|| 0 turns −0 into 0)
}

/**
 * Straight-line homotopy H(s, t) = (1 − t)·γ0(s) + t·γ1(s) between two paths
 * sampled at the same parameters. Returns the first (s, t) at which the moving
 * path passes through `hole`, or null if it never does.
 */
export function straightLineHit(g0: Pt[], g1: Pt[], hole: Pt): { s: number; t: number } | null {
	const n = Math.min(g0.length, g1.length);
	const cross = (i: number) => {
		const ax = g1[i][0] - g0[i][0];
		const ay = g1[i][1] - g0[i][1];
		const bx = hole[0] - g0[i][0];
		const by = hole[1] - g0[i][1];
		return ax * by - ay * bx;
	};
	let best: { s: number; t: number } | null = null;
	let prev = cross(0);
	for (let i = 1; i < n; i++) {
		const c = cross(i);
		if ((prev <= 0 && c >= 0) || (prev >= 0 && c <= 0)) {
			const w = prev === c ? 0 : prev / (prev - c);
			const x0 = g0[i - 1][0] + (g0[i][0] - g0[i - 1][0]) * w;
			const y0 = g0[i - 1][1] + (g0[i][1] - g0[i - 1][1]) * w;
			const x1 = g1[i - 1][0] + (g1[i][0] - g1[i - 1][0]) * w;
			const y1 = g1[i - 1][1] + (g1[i][1] - g1[i - 1][1]) * w;
			const dx = x1 - x0;
			const dy = y1 - y0;
			const L2 = dx * dx + dy * dy;
			if (L2 > 1e-9) {
				const t = ((hole[0] - x0) * dx + (hole[1] - y0) * dy) / L2;
				if (t >= -1e-6 && t <= 1 + 1e-6) {
					const s = (i - 1 + w) / (n - 1);
					if (!best || t < best.t) best = { s, t: Math.max(0, Math.min(1, t)) };
				}
			}
		}
		prev = c;
	}
	return best;
}

/** One frame of the straight-line homotopy. */
export function lerpPath(g0: Pt[], g1: Pt[], t: number, out: Pt[] = []): Pt[] {
	const n = Math.min(g0.length, g1.length);
	out.length = n;
	for (let i = 0; i < n; i++) out[i] = [g0[i][0] + (g1[i][0] - g0[i][0]) * t, g0[i][1] + (g1[i][1] - g0[i][1]) * t];
	return out;
}

// ── words in the free group on a, b ───────────────────────────────────────

/** a, b and their inverses A = a⁻¹, B = b⁻¹. */
export type Letter = 'a' | 'b' | 'A' | 'B';

export const inverseLetter = (x: Letter): Letter =>
	(x === 'a' ? 'A' : x === 'A' ? 'a' : x === 'b' ? 'B' : 'b') as Letter;

/** Freely reduce a word: repeatedly cancel adjacent x x⁻¹. */
export function reduceWord(w: readonly Letter[]): Letter[] {
	const out: Letter[] = [];
	for (const x of w) {
		if (out.length && out[out.length - 1] === inverseLetter(x)) out.pop();
		else out.push(x);
	}
	return out;
}

/** Indices of letters that cancel during free reduction (paired up). */
export function cancellingIndices(w: readonly Letter[]): Set<number> {
	const stack: number[] = [];
	const gone = new Set<number>();
	w.forEach((x, i) => {
		if (stack.length && w[stack[stack.length - 1]] === inverseLetter(x)) {
			gone.add(stack.pop()!);
			gone.add(i);
		} else stack.push(i);
	});
	return gone;
}

/** Exponent sums: the image of the word in the abelianization ℤ². */
export function abelianize(w: readonly Letter[]): [number, number] {
	let m = 0;
	let n = 0;
	for (const x of w) {
		if (x === 'a') m++;
		else if (x === 'A') m--;
		else if (x === 'b') n++;
		else n--;
	}
	return [m, n];
}

/** TeX for a word, e.g. a b a^{-1} b^{-1}; the empty word is e. */
export function wordTeX(w: readonly Letter[], empty = 'e'): string {
	if (!w.length) return empty;
	// group runs: a a a → a^{3}
	let out = '';
	let i = 0;
	while (i < w.length) {
		let j = i;
		while (j < w.length && w[j] === w[i]) j++;
		const run = j - i;
		const x = w[i];
		const base = x.toLowerCase();
		const inv = x === 'A' || x === 'B';
		const exp = inv ? -run : run;
		out += exp === 1 ? base : `${base}^{${exp}}`;
		i = j;
	}
	return out;
}

/** TeX for an element of ℤ² written additively as m·a + n·b. */
export function abelianTeX([m, n]: [number, number]): string {
	const term = (k: number, s: string) => (k === 0 ? '' : k === 1 ? s : k === -1 ? `-${s}` : `${k}${s}`);
	const A = term(m, 'a');
	const B = term(n, 'b');
	if (!A && !B) return '0';
	if (!A) return B;
	if (!B) return A;
	return n > 0 ? `${A} + ${B}` : `${A} ${B.replace('-', '- ')}`;
}
