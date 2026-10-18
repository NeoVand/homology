// The double curve of a surface that passes through itself, traced exactly.
//
// A double point is a point of space where two different points p₁ ≠ p₂ of the
// surface land: f(p₁) = f(p₂). That is three equations in four unknowns, so the
// double points form curves, and we follow them by continuation: from a point on
// the curve, step a little along its tangent (which lies in both sheets, so it is
// the cross product of their normals), then pull back onto the curve with Newton's
// method, solving f(p₁) = f(p₂) together with "as far along as we stepped". The
// curve comes out as one unbroken line however its sheets cross: through a triple
// point it simply goes straight on. Where to start is found by intersecting the
// triangles of a coarse grid (selfIntersect.ts), which also catches every piece of
// the curve; triangles are only good for starting, as their crossings are short
// segments that leave gaps wherever a seam or a triple point gets in the way.
import type { P3 } from './sheet';
import { selfIntersections } from './selfIntersect';

/** a map of the parameter plane into space, smooth a little beyond the domain's edges */
export type SurfaceMap = (u: number, v: number, out: P3) => void;

export interface DoubleCurve {
	/** points along the curve, xyz, no further apart than the step */
	pts: Float64Array;
	/** for each point the two parameter points that land on it: u₁, v₁, u₂, v₂ */
	params: Float64Array;
	closed: boolean;
}

export interface TraceOptions {
	/** take a parameter point that has left the domain back in through the gluing (in place) */
	wrap?: (p: Float64Array, k: number) => void;
	/** for a surface with an edge: is this parameter point (after wrapping) on it? The curve stops at the edge. */
	inside?: (p: Float64Array, k: number) => boolean;
	/** the grid the starting points are found on, and how its rows are shifted (to keep them off special rows) */
	grid?: number;
	shift?: number;
	/** the step along the curve, as a fraction of the surface's size */
	step?: number;
}

const p = { x: 0, y: 0, z: 0 };
const q = { x: 0, y: 0, z: 0 };

/** f at (u, v) and its two partial derivatives, written into x[0..2], du[0..2], dv[0..2] */
function jet(f: SurfaceMap, u: number, v: number, x: number[], du: number[], dv: number[]) {
	const e = 1e-6;
	f(u, v, p);
	x[0] = p.x;
	x[1] = p.y;
	x[2] = p.z;
	f(u + e, v, p);
	f(u - e, v, q);
	du[0] = (p.x - q.x) / (2 * e);
	du[1] = (p.y - q.y) / (2 * e);
	du[2] = (p.z - q.z) / (2 * e);
	f(u, v + e, p);
	f(u, v - e, q);
	dv[0] = (p.x - q.x) / (2 * e);
	dv[1] = (p.y - q.y) / (2 * e);
	dv[2] = (p.z - q.z) / (2 * e);
}

const cross = (a: number[], b: number[], o: number[]) => {
	o[0] = a[1] * b[2] - a[2] * b[1];
	o[1] = a[2] * b[0] - a[0] * b[2];
	o[2] = a[0] * b[1] - a[1] * b[0];
	return o;
};
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: number[]) => Math.hypot(a[0], a[1], a[2]);

/** solve the n × n system A x = b (row-major, overwritten) by elimination with partial pivoting */
export function solve(A: number[], b: number[], n: number): number[] | null {
	for (let c = 0; c < n; c++) {
		let piv = c;
		for (let r = c + 1; r < n; r++) if (Math.abs(A[r * n + c]) > Math.abs(A[piv * n + c])) piv = r;
		if (Math.abs(A[piv * n + c]) < 1e-14) return null;
		if (piv !== c) {
			for (let k = 0; k < n; k++) [A[c * n + k], A[piv * n + k]] = [A[piv * n + k], A[c * n + k]];
			[b[c], b[piv]] = [b[piv], b[c]];
		}
		for (let r = c + 1; r < n; r++) {
			const m = A[r * n + c] / A[c * n + c];
			if (m === 0) continue;
			for (let k = c; k < n; k++) A[r * n + k] -= m * A[c * n + k];
			b[r] -= m * b[c];
		}
	}
	const x = new Array<number>(n).fill(0);
	for (let r = n - 1; r >= 0; r--) {
		let s = b[r];
		for (let k = r + 1; k < n; k++) s -= A[r * n + k] * x[k];
		x[r] = s / A[r * n + r];
	}
	return x;
}

/** One sheet's data at a parameter point. */
interface Sheet {
	x: number[];
	du: number[];
	dv: number[];
	n: number[];
}
const sheet = (): Sheet => ({ x: [0, 0, 0], du: [0, 0, 0], dv: [0, 0, 0], n: [0, 0, 0] });

function at(f: SurfaceMap, u: number, v: number, s: Sheet) {
	jet(f, u, v, s.x, s.du, s.dv);
	cross(s.du, s.dv, s.n);
}

/** the parameter step that moves this sheet's point by d in space (least squares) */
function lift(s: Sheet, d: number[]): [number, number] {
	const a = dot(s.du, s.du);
	const b = dot(s.du, s.dv);
	const c = dot(s.dv, s.dv);
	const r1 = dot(s.du, d);
	const r2 = dot(s.dv, d);
	const det = a * c - b * b;
	if (Math.abs(det) < 1e-18) return [0, 0];
	return [(c * r1 - b * r2) / det, (a * r2 - b * r1) / det];
}

/**
 * Pull (u₁, v₁, u₂, v₂) onto the double curve. With a plane (point X, normal T) the point must also lie
 * in that plane, and the system is square; without, the step is the shortest one (Gauss–Newton).
 */
function correct(f: SurfaceMap, P: Float64Array, s1: Sheet, s2: Sheet, size: number, X?: number[], T?: number[]) {
	for (let it = 0; it < 14; it++) {
		at(f, P[0], P[1], s1);
		at(f, P[2], P[3], s2);
		const F = [s1.x[0] - s2.x[0], s1.x[1] - s2.x[1], s1.x[2] - s2.x[2]];
		const err = norm(F);
		let g = 0;
		if (X && T) g = T[0] * (0.5 * (s1.x[0] + s2.x[0]) - X[0]) + T[1] * (0.5 * (s1.x[1] + s2.x[1]) - X[1]) + T[2] * (0.5 * (s1.x[2] + s2.x[2]) - X[2]);
		if (err < 1e-10 * size && Math.abs(g) < 1e-9 * size) return true;
		// J = [du₁ dv₁ −du₂ −dv₂] (3 × 4)
		const J = [
			[s1.du[0], s1.dv[0], -s2.du[0], -s2.dv[0]],
			[s1.du[1], s1.dv[1], -s2.du[1], -s2.dv[1]],
			[s1.du[2], s1.dv[2], -s2.du[2], -s2.dv[2]]
		];
		let d: number[] | null;
		if (X && T) {
			const row = [0, 1, 2, 3].map((k) => 0.5 * (k < 2 ? 1 : -1) * (T[0] * J[0][k] + T[1] * J[1][k] + T[2] * J[2][k]));
			d = solve([...J[0], ...J[1], ...J[2], ...row], [-F[0], -F[1], -F[2], -g], 4);
		} else {
			const M = [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => J[r][0] * J[c][0] + J[r][1] * J[c][1] + J[r][2] * J[c][2] + J[r][3] * J[c][3]));
			const y = solve(M, [-F[0], -F[1], -F[2]], 3);
			d = y && [0, 1, 2, 3].map((k) => J[0][k] * y[0] + J[1][k] * y[1] + J[2][k] * y[2]);
		}
		if (!d || !d.every(Number.isFinite)) return false;
		// never jump far in one go: Newton is only to be trusted near the curve
		const len = Math.hypot(d[0], d[1], d[2], d[3]);
		const sc = len > 0.05 ? 0.05 / len : 1;
		for (let k = 0; k < 4; k++) P[k] += sc * d[k];
	}
	return false;
}

/** how far apart the two sheets' normals are (sine of the angle): 0 where they touch rather than cross */
const transversality = (s1: Sheet, s2: Sheet) => {
	const c = cross(s1.n, s2.n, [0, 0, 0]);
	return norm(c) / (norm(s1.n) * norm(s2.n) || 1);
};

/** Follow the double curve from a point on it until it closes up (or stops). */
function follow(f: SurfaceMap, start: Float64Array, h0: number, size: number, wrap?: TraceOptions['wrap'], inside?: TraceOptions['inside']) {
	const s1 = sheet();
	const s2 = sheet();
	const P = Float64Array.from(start);
	at(f, P[0], P[1], s1);
	at(f, P[2], P[3], s2);
	const X0 = [...s1.x];
	const T0 = cross(s1.n, s2.n, [0, 0, 0]);
	const l0 = norm(T0);
	T0.forEach((c, i) => (T0[i] = c / l0));
	const pts: number[] = [...X0];
	const params: number[] = [...P];
	let X = [...X0];
	let T = [...T0];
	let h = h0;
	let closed = false;
	let travelled = 0;
	const maxSteps = Math.ceil((60 * size) / h0);
	const trial = new Float64Array(4);
	for (let step = 0; step < maxSteps; step++) {
		// predict along the tangent, then correct onto the curve, in the plane h further on
		const Xp = [X[0] + h * T[0], X[1] + h * T[1], X[2] + h * T[2]];
		at(f, P[0], P[1], s1);
		at(f, P[2], P[3], s2);
		const d = [h * T[0], h * T[1], h * T[2]];
		const [a1, b1] = lift(s1, d);
		const [a2, b2] = lift(s2, d);
		trial[0] = P[0] + a1;
		trial[1] = P[1] + b1;
		trial[2] = P[2] + a2;
		trial[3] = P[3] + b2;
		const ok = correct(f, trial, s1, s2, size, Xp, T);
		let good = false;
		let Tn = T;
		if (ok) {
			const sin = transversality(s1, s2);
			Tn = cross(s1.n, s2.n, [0, 0, 0]);
			const ln = norm(Tn);
			if (ln > 0 && sin > 1e-3) {
				for (let k = 0; k < 3; k++) Tn[k] /= ln;
				if (dot(Tn, T) < 0) for (let k = 0; k < 3; k++) Tn[k] = -Tn[k];
				const moved = Math.hypot(s1.x[0] - X[0], s1.x[1] - X[1], s1.x[2] - X[2]);
				good = dot(Tn, T) > Math.cos(0.35) && moved < 1.5 * h;
			}
		}
		if (!good) {
			h /= 2;
			if (h < h0 / 256) break;
			continue;
		}
		wrap?.(trial, 0);
		wrap?.(trial, 2);
		if (inside && !(inside(trial, 0) && inside(trial, 2))) break;
		P.set(trial);
		const dx = s1.x[0] - X[0],
			dy = s1.x[1] - X[1],
			dz = s1.x[2] - X[2];
		travelled += Math.hypot(dx, dy, dz);
		X = [...s1.x];
		T = Tn;
		// back where it started, going the same way: the curve has closed up
		const back = Math.hypot(X[0] - X0[0], X[1] - X0[1], X[2] - X0[2]);
		if (travelled > 4 * h0 && back < 1.2 * h0 && Math.abs(dot(T, T0)) > 0.8) {
			closed = true;
			break;
		}
		pts.push(...X);
		params.push(...P);
		h = Math.min(h0, h * 1.5);
	}
	return { pts: Float64Array.from(pts), params: Float64Array.from(params), closed };
}

/**
 * Every double curve of a surface. Starting points come from the triangles of an n × n grid over the unit
 * square of parameters; from each one not already on a traced curve, the curve through it is followed both
 * ways (one way when it closes up).
 */
export function traceDoubleCurves(f: SurfaceMap, o: TraceOptions = {}): DoubleCurve[] {
	const n = o.grid ?? 64;
	const shift = o.shift ?? 0.0131;
	const pos = new Float64Array((n + 1) * (n + 1) * 3);
	const v = (j: number) => Math.min(1, j / n + (j > 0 && j < n ? shift / n : 0));
	let lo = Infinity;
	let hi = -Infinity;
	for (let j = 0; j <= n; j++)
		for (let i = 0; i <= n; i++) {
			f(i / n, v(j), p);
			const k = 3 * (j * (n + 1) + i);
			pos[k] = p.x;
			pos[k + 1] = p.y;
			pos[k + 2] = p.z;
			lo = Math.min(lo, p.x, p.y, p.z);
			hi = Math.max(hi, p.x, p.y, p.z);
		}
	const size = hi - lo || 1;
	const h0 = (o.step ?? 0.004) * size;
	const pairs: number[] = [];
	selfIntersections(pos, n, n, pairs);
	// (u, v) of the middle of triangle t: cell t >> 1, the lower or upper half of it
	const mid = (t: number): [number, number] => {
		const cell = t >> 1;
		const i = cell % n;
		const j = Math.floor(cell / n);
		const up = t & 1;
		const vj = v(j);
		const vj1 = v(j + 1);
		return [(i + (up ? 1 / 3 : 2 / 3)) / n, vj + (up ? 2 / 3 : 1 / 3) * (vj1 - vj)];
	};
	const curves: DoubleCurve[] = [];
	// the traced points, hashed, to tell whether a starting point is already covered
	const cell = 2 * h0;
	const hash = new Set<string>();
	const key = (x: number, y: number, z: number) => `${Math.floor(x / cell)},${Math.floor(y / cell)},${Math.floor(z / cell)}`;
	const near = (x: number[]) => {
		const i = Math.floor(x[0] / cell);
		const j = Math.floor(x[1] / cell);
		const k = Math.floor(x[2] / cell);
		for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) if (hash.has(`${i + a},${j + b},${k + c}`)) return true;
		return false;
	};
	for (let k = 0; k < pairs.length; k += 2) {
		const [u1, v1] = mid(pairs[k]);
		const [u2, v2] = mid(pairs[k + 1]);
		const c = traceFrom(f, Float64Array.from([u1, v1, u2, v2]), size, { ...o, step: h0 / size }, near);
		if (!c) continue;
		for (let i = 0; i < c.pts.length; i += 3) hash.add(key(c.pts[i], c.pts[i + 1], c.pts[i + 2]));
		curves.push(c);
	}
	return curves;
}

/**
 * The double curve through a pair of parameter points near it (u₁, v₁, u₂, v₂), or null if there is none
 * nearby. `size` is the surface's size (it sets the step and the tolerances); `skip` can turn down the point
 * the guess was pulled onto (when it lies on a curve already traced).
 */
export function traceFrom(f: SurfaceMap, guess: Float64Array, size: number, o: TraceOptions = {}, skip?: (x: number[]) => boolean): DoubleCurve | null {
	const h0 = (o.step ?? 0.004) * size;
	const s1 = sheet();
	const s2 = sheet();
	const P = Float64Array.from(guess);
	if (!correct(f, P, s1, s2, size)) return null;
	o.wrap?.(P, 0);
	o.wrap?.(P, 2);
	if (o.inside && !(o.inside(P, 0) && o.inside(P, 2))) return null;
	if (transversality(s1, s2) < 0.02 || skip?.(s1.x)) return null;
	const fw = follow(f, P, h0, size, o.wrap, o.inside);
	let pts = fw.pts;
	let params = fw.params;
	if (!fw.closed) {
		// it stopped somewhere: go the other way from the start too, and join the two halves
		const bw = follow(f, Float64Array.from([P[2], P[3], P[0], P[1]]), h0, size, o.wrap, o.inside);
		const m = bw.pts.length / 3;
		const P2 = new Float64Array(pts.length + bw.pts.length - 3);
		const Q2 = new Float64Array(params.length + bw.params.length - 4);
		for (let i = m - 1, w = 0; i >= 1; i--, w++) {
			P2.set(bw.pts.subarray(3 * i, 3 * i + 3), 3 * w);
			// the backward walk has the sheets the other way round
			Q2.set([bw.params[4 * i + 2], bw.params[4 * i + 3], bw.params[4 * i], bw.params[4 * i + 1]], 4 * w);
		}
		P2.set(pts, 3 * (m - 1));
		Q2.set(params, 4 * (m - 1));
		pts = P2;
		params = Q2;
	}
	if (pts.length / 3 < 12) return null;
	return { pts, params, closed: fw.closed };
}
