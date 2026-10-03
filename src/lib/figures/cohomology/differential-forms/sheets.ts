// "Stacks of sheets" pictures of 1-forms in the plane.
//
// • Exact forms df are drawn as level curves f = kε; the line integral of df
//   along a path is ε × (net number of level curves crossed), up to < ε.
// • General 1-forms are drawn as families of curves that may *end*; each
//   end is a dot of the 2-form dω. For every rectangle R, the net number of
//   sheets crossing ∂R (counterclockwise, with signs) equals the signed number
//   of sheet-ends inside R — a combinatorial Stokes theorem.
import { cross, dot, vdc, type Vec2 } from './calc';

export type Box = [number, number, number, number]; // x0, x1, y0, y1

// ── exact forms: level sets ────────────────────────────────────────────────

export interface ExactPreset {
	key: string;
	label: string;
	/** TeX for ω and for the function f with ω = df */
	omegaTeX: string;
	fTeX: string;
	f: (x: number, y: number) => number;
	grad: (x: number, y: number) => Vec2;
	/** spacing between drawn levels */
	eps: number;
	/** polylines (world coordinates) of the levels f = kε inside the box */
	levels: (box: Box) => Vec2[][];
}

function lineLevels(a: number, b: number, eps: number) {
	// levels of f = a x + b y: straight lines, clipped to the box
	return (box: Box): Vec2[][] => {
		const [x0, x1, y0, y1] = box;
		const corners = [a * x0 + b * y0, a * x1 + b * y0, a * x0 + b * y1, a * x1 + b * y1];
		const kmin = Math.ceil(Math.min(...corners) / eps);
		const kmax = Math.floor(Math.max(...corners) / eps);
		const out: Vec2[][] = [];
		for (let k = kmin; k <= kmax; k++) {
			const c = k * eps;
			const pts: Vec2[] = [];
			if (b !== 0) {
				for (const x of [x0, x1]) {
					const y = (c - a * x) / b;
					if (y >= y0 - 1e-9 && y <= y1 + 1e-9) pts.push([x, y]);
				}
			}
			if (a !== 0) {
				for (const y of [y0, y1]) {
					const x = (c - b * y) / a;
					if (x >= x0 - 1e-9 && x <= x1 + 1e-9) pts.push([x, y]);
				}
			}
			if (pts.length >= 2) out.push([pts[0], pts[pts.length - 1]]);
		}
		return out;
	};
}

export const exactPresets: Record<string, ExactPreset> = {
	dx: {
		key: 'dx',
		label: 'dx',
		omegaTeX: 'dx',
		fTeX: 'x',
		f: (x) => x,
		grad: () => [1, 0],
		eps: 0.25,
		levels: lineLevels(1, 0, 0.25)
	},
	dy: {
		key: 'dy',
		label: 'dy',
		omegaTeX: 'dy',
		fTeX: 'y',
		f: (_x, y) => y,
		grad: () => [0, 1],
		eps: 0.25,
		levels: lineLevels(0, 1, 0.25)
	},
	lin: {
		key: 'lin',
		label: '2dx + dy',
		omegaTeX: '2\\,dx + dy',
		fTeX: '2x + y',
		f: (x, y) => 2 * x + y,
		grad: () => [2, 1],
		eps: 0.4,
		levels: lineLevels(2, 1, 0.4)
	},
	bowl: {
		key: 'bowl',
		label: 'x dx + y dy',
		omegaTeX: 'x\\,dx + y\\,dy',
		fTeX: '\\tfrac12(x^2+y^2)',
		f: (x, y) => (x * x + y * y) / 2,
		grad: (x, y) => [x, y],
		eps: 0.15,
		levels: (box) => {
			const R = Math.hypot(Math.max(-box[0], box[1]), Math.max(-box[2], box[3]));
			const out: Vec2[][] = [];
			for (let k = 1; ; k++) {
				const r = Math.sqrt(2 * k * 0.15);
				if (r > R) break;
				const ring: Vec2[] = [];
				for (let i = 0; i <= 160; i++) {
					const a = (2 * Math.PI * i) / 160;
					ring.push([r * Math.cos(a), r * Math.sin(a)]);
				}
				out.push(ring);
			}
			return out;
		}
	},
	xy: {
		key: 'xy',
		label: 'y dx + x dy',
		omegaTeX: 'y\\,dx + x\\,dy',
		fTeX: 'xy',
		f: (x, y) => x * y,
		grad: (x, y) => [y, x],
		eps: 0.2,
		levels: (box) => {
			const [x0, x1, y0, y1] = box;
			const out: Vec2[][] = [];
			const cmax = Math.max(Math.abs(x0), x1) * Math.max(Math.abs(y0), y1);
			const K = Math.floor(cmax / 0.2);
			out.push([[x0, 0], [x1, 0]], [[0, y0], [0, y1]]);
			for (let k = -K; k <= K; k++) {
				if (k === 0) continue;
				const c = k * 0.2;
				for (const sgn of [-1, 1]) {
					// branch with x of sign sgn: y = c / x
					const pts: Vec2[] = [];
					const xa = sgn > 0 ? 0.001 : x0;
					const xb = sgn > 0 ? x1 : -0.001;
					const N = 140;
					for (let i = 0; i <= N; i++) {
						// sample evenly in log|x| for nice spacing near the axes
						const t = i / N;
						const ax = Math.abs(sgn > 0 ? xb : xa);
						const amin = Math.abs(c) / Math.max(Math.abs(y0), y1);
						const lx = Math.exp(Math.log(amin) + t * (Math.log(ax) - Math.log(amin)));
						const x = sgn * lx;
						const y = c / x;
						if (y >= y0 - 1e-6 && y <= y1 + 1e-6 && x >= x0 && x <= x1) pts.push([x, y]);
					}
					if (pts.length > 1) out.push(pts);
				}
			}
			return out;
		}
	}
};

/** Signed crossing count of the levels f = kε along a sampled path. */
export function crossings(path: Vec2[], f: (x: number, y: number) => number, eps: number) {
	let pos = 0;
	let neg = 0;
	const marks: { p: Vec2; sign: 1 | -1 }[] = [];
	let prevL = Math.floor(f(path[0][0], path[0][1]) / eps);
	let prevV = f(path[0][0], path[0][1]);
	for (let i = 1; i < path.length; i++) {
		const v = f(path[i][0], path[i][1]);
		const L = Math.floor(v / eps);
		if (L !== prevL) {
			const s = L > prevL ? 1 : -1;
			for (let k = prevL; k !== L; k += s) {
				const level = (s > 0 ? k + 1 : k) * eps;
				const t = (level - prevV) / (v - prevV || 1e-12);
				const a = path[i - 1];
				const b = path[i];
				marks.push({ p: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], sign: s as 1 | -1 });
				if (s > 0) pos++;
				else neg++;
			}
		}
		prevL = L;
		prevV = v;
	}
	return { pos, neg, net: pos - neg, marks };
}

// ── general forms: sheets that may end ─────────────────────────────────────

export type Sheet =
	| {
			kind: 'seg';
			a: Vec2;
			b: Vec2;
			/** co-orientation: the direction in which crossing counts +1 */
			n: Vec2;
			/** is `a` a genuine end of the sheet (a dot of dω)? */
			end: boolean;
	  }
	| { kind: 'circle'; c: Vec2; r: number };

export interface EndPreset {
	key: string;
	label: string;
	omegaTeX: string;
	dTeX: string;
	/** value of the 2-form dω = g dx∧dy */
	g: (x: number, y: number) => number;
	/** the 1-form as (P, Q): ω = P dx + Q dy */
	PQ: (x: number, y: number) => Vec2;
	closed: boolean;
	eps: number;
	sheets: (box: Box) => Sheet[];
	/** points missing from the domain */
	holes?: Vec2[];
	note: string;
}

const MAXN = 4096;

export const endPresets: Record<string, EndPreset> = {
	dy: {
		key: 'dy',
		label: 'dy',
		omegaTeX: 'dy',
		dTeX: 'd(dy) = 0',
		g: () => 0,
		PQ: () => [0, 1],
		closed: true,
		eps: 0.2,
		sheets: ([x0, x1, y0, y1]) => {
			const out: Sheet[] = [];
			for (let k = Math.ceil(y0 / 0.2); k * 0.2 <= y1; k++) out.push({ kind: 'seg', a: [x0, k * 0.2], b: [x1, k * 0.2], n: [0, 1], end: false });
			return out;
		},
		note: 'Evenly spaced lines that run forever: no sheet ever ends.'
	},
	xdy: {
		key: 'xdy',
		label: 'x dy',
		omegaTeX: 'x\\,dy',
		dTeX: 'd(x\\,dy) = dx\\wedge dy',
		g: () => 1,
		PQ: (x) => [0, x],
		closed: false,
		eps: 0.15,
		sheets: ([x0, x1, y0, y1]) => {
			// at horizontal position x the density must be |x|/ε per unit height
			const out: Sheet[] = [];
			const H = y1 - y0;
			for (const side of [1, -1]) {
				const X = side > 0 ? x1 : -x0;
				for (let k = 0; k < MAXN; k++) {
					const xs = ((k + 0.5) * 0.15) / H;
					if (xs > X) break;
					const y = y0 + H * vdc(k + 1);
					out.push({ kind: 'seg', a: [side * xs, y], b: [side * X, y], n: [0, side], end: true });
				}
			}
			return out;
		},
		note: 'The lines crowd together as you move away from the y-axis, so new lines must begin. Every beginning is a dot of dω — and the dots are spread evenly: dω = dx∧dy.'
	},
	ydx: {
		key: 'ydx',
		label: 'y dx',
		omegaTeX: 'y\\,dx',
		dTeX: 'd(y\\,dx) = -\\,dx\\wedge dy',
		g: () => -1,
		PQ: (_x, y) => [y, 0],
		closed: false,
		eps: 0.15,
		sheets: ([x0, x1, y0, y1]) => {
			const out: Sheet[] = [];
			const W = x1 - x0;
			for (const side of [1, -1]) {
				const Y = side > 0 ? y1 : -y0;
				for (let k = 0; k < MAXN; k++) {
					const ys = ((k + 0.5) * 0.15) / W;
					if (ys > Y) break;
					const x = x0 + W * vdc(k + 1);
					out.push({ kind: 'seg', a: [x, side * ys], b: [x, side * Y], n: [side, 0], end: true });
				}
			}
			return out;
		},
		note: 'The same picture turned on its side — but now the beginnings carry the opposite orientation, so the dots are negative: dω = −dx∧dy.'
	},
	rot: {
		key: 'rot',
		label: 'x dy − y dx',
		omegaTeX: 'x\\,dy - y\\,dx',
		dTeX: 'd\\omega = 2\\,dx\\wedge dy',
		g: () => 2,
		PQ: (x, y) => [-y, x],
		closed: false,
		eps: 0.3,
		sheets: ([x0, x1, y0, y1]) => {
			// rays θ = const; the number of rays crossing the circle of radius r is 2πr²/ε
			const out: Sheet[] = [];
			const R = Math.hypot(Math.max(-x0, x1), Math.max(-y0, y1));
			for (let k = 0; k < MAXN; k++) {
				const rs = Math.sqrt(((k + 0.5) * 0.3) / (2 * Math.PI));
				if (rs > R) break;
				const phi = 2 * Math.PI * vdc(k + 1) + 0.1;
				const u: Vec2 = [Math.cos(phi), Math.sin(phi)];
				out.push({ kind: 'seg', a: [rs * u[0], rs * u[1]], b: [R * 1.05 * u[0], R * 1.05 * u[1]], n: [-u[1], u[0]], end: true });
			}
			return out;
		},
		note: 'Its sheets are rays from the origin, and more rays begin the farther out you go. The beginnings are evenly spread, twice as densely as for x dy.'
	},
	dtheta: {
		key: 'dtheta',
		label: 'dθ',
		omegaTeX: 'd\\theta = \\frac{x\\,dy - y\\,dx}{x^2+y^2}',
		dTeX: 'd(d\\theta) = 0 \\text{ (away from the origin)}',
		g: () => 0,
		PQ: (x, y) => {
			const r2 = x * x + y * y;
			return [-y / r2, x / r2];
		},
		closed: true,
		eps: (2 * Math.PI) / 24,
		holes: [[0, 0]],
		sheets: ([x0, x1, y0, y1]) => {
			const out: Sheet[] = [];
			const R = Math.hypot(Math.max(-x0, x1), Math.max(-y0, y1)) * 1.05;
			for (let k = 0; k < 24; k++) {
				const phi = (2 * Math.PI * k) / 24 + 0.13;
				const u: Vec2 = [Math.cos(phi), Math.sin(phi)];
				// the rays emanate from the (missing) origin; that is not an end inside the domain
				out.push({ kind: 'seg', a: [0, 0], b: [R * u[0], R * u[1]], n: [-u[1], u[0]], end: false });
			}
			return out;
		},
		note: 'Twenty-four rays that never end — except at the origin, which is not part of the punctured plane. Keep this one in mind: it is the hero of the next chapter.'
	},
	bowl: {
		key: 'bowl',
		label: 'd(x² + y²)',
		omegaTeX: 'd\\big(\\tfrac12(x^2+y^2)\\big) = x\\,dx + y\\,dy',
		dTeX: 'd(df) = 0',
		g: () => 0,
		PQ: (x, y) => [x, y],
		closed: true,
		eps: 0.15,
		sheets: ([x0, x1, y0, y1]) => {
			const out: Sheet[] = [];
			const R = Math.hypot(Math.max(-x0, x1), Math.max(-y0, y1));
			for (let k = 1; ; k++) {
				const r = Math.sqrt(2 * k * 0.15);
				if (r > R) break;
				out.push({ kind: 'circle', c: [0, 0], r });
			}
			return out;
		},
		note: 'The level circles of a function are closed curves: they never end, so d(df) = 0.'
	}
};

// ── counting ───────────────────────────────────────────────────────────────

export type Rect = [number, number, number, number]; // x0, x1, y0, y1

/** counterclockwise edges of a rectangle, as (start, end, tangent) */
function rectEdges([x0, x1, y0, y1]: Rect): [Vec2, Vec2, Vec2][] {
	return [
		[[x0, y0], [x1, y0], [1, 0]],
		[[x1, y0], [x1, y1], [0, 1]],
		[[x1, y1], [x0, y1], [-1, 0]],
		[[x0, y1], [x0, y0], [0, -1]]
	];
}

function segIntersect(p: Vec2, q: Vec2, a: Vec2, b: Vec2): Vec2 | null {
	// half-open on both segments to avoid double counting at shared endpoints
	const r: Vec2 = [q[0] - p[0], q[1] - p[1]];
	const s: Vec2 = [b[0] - a[0], b[1] - a[1]];
	const den = cross(r, s);
	if (Math.abs(den) < 1e-14) return null;
	const ap: Vec2 = [a[0] - p[0], a[1] - p[1]];
	const t = cross(ap, s) / den;
	const u = cross(ap, r) / den;
	if (t < 0 || t >= 1 || u < 0 || u >= 1) return null;
	return [p[0] + t * r[0], p[1] + t * r[1]];
}

export interface Piercing {
	p: Vec2;
	sign: 1 | -1;
}

/** Signed crossings of the sheets by the counterclockwise boundary of R. */
export function boundaryPiercings(sheets: Sheet[], R: Rect): Piercing[] {
	const out: Piercing[] = [];
	for (const [e0, e1, T] of rectEdges(R)) {
		for (const s of sheets) {
			if (s.kind === 'seg') {
				const hit = segIntersect(e0, e1, s.a, s.b);
				if (hit) out.push({ p: hit, sign: dot(T, s.n) > 0 ? 1 : -1 });
			} else {
				// circle ∩ edge: solve |e0 + t(e1 − e0) − c| = r
				const d: Vec2 = [e1[0] - e0[0], e1[1] - e0[1]];
				const f: Vec2 = [e0[0] - s.c[0], e0[1] - s.c[1]];
				const A = dot(d, d);
				const B = 2 * dot(f, d);
				const C = dot(f, f) - s.r * s.r;
				const disc = B * B - 4 * A * C;
				if (disc <= 0) continue;
				for (const t of [(-B - Math.sqrt(disc)) / (2 * A), (-B + Math.sqrt(disc)) / (2 * A)]) {
					if (t < 0 || t >= 1) continue;
					const p: Vec2 = [e0[0] + t * d[0], e0[1] + t * d[1]];
					const nrm: Vec2 = [p[0] - s.c[0], p[1] - s.c[1]];
					out.push({ p, sign: dot(T, nrm) > 0 ? 1 : -1 });
				}
			}
		}
	}
	return out;
}

/** Signed sheet-ends (dots of dω) inside R. */
export function endsInside(sheets: Sheet[], R: Rect): Piercing[] {
	const [x0, x1, y0, y1] = R;
	const out: Piercing[] = [];
	for (const s of sheets) {
		if (s.kind !== 'seg' || !s.end) continue;
		const [x, y] = s.a;
		if (x > x0 && x < x1 && y > y0 && y < y1) {
			const t: Vec2 = [s.b[0] - s.a[0], s.b[1] - s.a[1]];
			out.push({ p: s.a, sign: cross(t, s.n) > 0 ? 1 : -1 });
		}
	}
	return out;
}

export const total = (ps: Piercing[]) => ps.reduce((s, p) => s + p.sign, 0);
