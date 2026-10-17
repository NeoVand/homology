// Knots and links as closed curves in space: torus knots, a few classical
// parametrizations, closed braids, and smooth loops through control points.
// Each returns closed polylines (the last point joins the first), one per
// component, ready for diagramOf() and for drawing as tubes.
import type { V3 } from './diagram';

const TAU = Math.PI * 2;

/** sample a closed parametric curve t ∈ [0, 1) */
export function sampleClosed(f: (t: number) => V3, n = 360): V3[] {
	return Array.from({ length: n }, (_, i) => f(i / n));
}

/**
 * The (p, q) torus knot: p times around the axis, q times around the tube, on
 * a torus lying flat (seen from above it has q(p − 1) crossings). When p and q
 * share a factor d it is a link of d components.
 */
export function torusKnot(p: number, q: number, R = 1.5, r = 0.55, n = 480): V3[][] {
	const g = gcd(p, q);
	const [p1, q1] = [p / g, q / g];
	// g parallel copies of the (p/g, q/g) torus knot, slid round the tube far enough not to meet
	return Array.from({ length: g }, (_, c) =>
		sampleClosed((t) => {
			const u = p1 * TAU * t;
			const v = q1 * TAU * t + (TAU * c) / (g * p1);
			// (the sign of z makes positive p, q right-handed)
			return [(R + r * Math.cos(v)) * Math.cos(u), (R + r * Math.cos(v)) * Math.sin(u), -r * Math.sin(v)];
		}, Math.round(n / g))
	);
}

function gcd(a: number, b: number): number {
	return b ? gcd(b, a % b) : Math.abs(a);
}

/**
 * The k-th of `per` sample times through one crossing of a braid, τ ∈ [0, 1).
 * The two strands cross at τ = ½; the samples lie symmetrically about it and
 * never on it (a point there would be a corner of both polylines, which
 * rounding can make diagramOf() count twice): half a step off when per is even.
 */
const sampleAt = (k: number, per: number) => (k + (per % 2 ? 0 : 0.5)) / per;

/** the figure-eight knot: ((2 + cos 2t) cos 3t, (2 + cos 2t) sin 3t, sin 4t) */
export function figureEight(scale = 0.62, n = 480): V3[][] {
	return [
		sampleClosed((s) => {
			const t = TAU * s;
			const w = 2 + Math.cos(2 * t);
			return [scale * w * Math.cos(3 * t), scale * w * Math.sin(3 * t), scale * Math.sin(4 * t)];
		}, n)
	];
}

/** a round unknot */
export function unknot(r = 1.6, n = 240): V3[][] {
	return [sampleClosed((t) => [r * Math.cos(TAU * t), r * Math.sin(TAU * t), 0], n)];
}

/**
 * The Borromean rings as usually drawn: three overlapping circles, each passing
 * over the next and under the one before (A over B, B over C, C over A), so
 * that no two of them are linked and yet the three hold together.
 */
export function borromean(r = 1, d = 0.62, h = 0.3, n = 240): V3[][] {
	const centre = (k: number): [number, number] => [d * Math.cos(Math.PI / 2 + (TAU * k) / 3), d * Math.sin(Math.PI / 2 + (TAU * k) / 3)];
	const dir = (a: number, b: number) => {
		const [ax, ay] = centre(a);
		const [bx, by] = centre(b);
		return Math.atan2(by - ay, bx - ax);
	};
	// two equal circles whose centres are D apart cross at ±γ from the line of centres
	const gamma = Math.acos((d * Math.sqrt(3)) / (2 * r));
	const wrap = (x: number) => Math.atan2(Math.sin(x), Math.cos(x));
	return [0, 1, 2].map((k) => {
		const [cx, cy] = centre(k);
		const bumps: [number, number][] = [];
		for (const g of [gamma, -gamma]) {
			bumps.push([dir(k, (k + 1) % 3) + g, 1]); // over the next ring
			bumps.push([dir(k, (k + 2) % 3) + g, -1]); // under the one before
		}
		return sampleClosed((t) => {
			const a = TAU * t;
			const z = bumps.reduce((acc, [at, s]) => acc + s * Math.exp(-(wrap(a - at) ** 2) / (2 * 0.32 ** 2)), 0);
			return [cx + r * Math.cos(a), cy + r * Math.sin(a), h * z];
		}, n);
	});
}

/** the Borromean rings in space: three ellipses in three perpendicular planes */
export function borromeanEllipses(a = 1.7, b = 0.85, n = 240): V3[][] {
	return [
		sampleClosed((t) => [a * Math.cos(TAU * t), b * Math.sin(TAU * t), 0], n),
		sampleClosed((t) => [0, a * Math.cos(TAU * t), b * Math.sin(TAU * t)], n),
		sampleClosed((t) => [b * Math.sin(TAU * t), 0, a * Math.cos(TAU * t)], n)
	];
}

/**
 * The closure of a braid on n strands, seen from above as rings round an
 * axis. The word lists generators: +i is σᵢ (strands i and i+1 cross, the one
 * moving outwards on top, a right-handed crossing), −i is σᵢ⁻¹.
 */
export function braidClosure(n: number, word: number[], opts: { R0?: number; gap?: number; lift?: number; per?: number } = {}): V3[][] {
	const R0 = opts.R0 ?? 1.2;
	const gap = opts.gap ?? 0.42;
	const lift = opts.lift ?? 0.28;
	const per = opts.per ?? 28;
	const slots = Math.max(1, word.length);
	const radius = (k: number) => R0 + gap * k;
	// paths[s] = the path, over one full turn, of the strand that starts in slot s
	const paths: V3[][] = Array.from({ length: n }, () => []);
	const pos = Array.from({ length: n }, (_, s) => s); // where strand s is now
	for (let m = 0; m < slots; m++) {
		const g = word[m];
		const i = g ? Math.abs(g) - 1 : -1; // slots i and i+1 swap
		const a = pos.indexOf(i);
		const b = pos.indexOf(i + 1);
		for (let k = 0; k < per; k++) {
			const tau = sampleAt(k, per);
			const th = (TAU * (m + tau)) / slots;
			const e = tau * tau * (3 - 2 * tau);
			for (let s = 0; s < n; s++) {
				let rad = radius(pos[s]);
				let z = 0;
				if (g && (s === a || s === b)) {
					const outward = s === a; // a moves from slot i to slot i+1
					rad = outward ? radius(i) + gap * e : radius(i + 1) - gap * e;
					const bump = lift * Math.sin(Math.PI * tau);
					const onTop = g > 0 ? outward : !outward;
					z = onTop ? bump : -bump;
				}
				paths[s].push([rad * Math.cos(th), rad * Math.sin(th), z]);
			}
		}
		if (g) {
			pos[a] = i + 1;
			pos[b] = i;
		}
	}
	// strand s ends in slot pos[s]; follow the permutation to join paths into components
	const startAt = new Map<number, number>(); // slot → strand starting there
	for (let s = 0; s < n; s++) startAt.set(s, s);
	const seen = new Set<number>();
	const comps: V3[][] = [];
	for (let s0 = 0; s0 < n; s0++) {
		if (seen.has(s0)) continue;
		const comp: V3[] = [];
		let s = s0;
		while (!seen.has(s)) {
			seen.add(s);
			comp.push(...paths[s]);
			s = startAt.get(pos[s])!;
		}
		comps.push(comp);
	}
	return comps;
}

/** a smooth closed curve through control points (centripetal Catmull–Rom) */
export function smoothThrough(points: V3[], per = 16): V3[] {
	const n = points.length;
	const out: V3[] = [];
	for (let i = 0; i < n; i++) {
		const p0 = points[(i - 1 + n) % n];
		const p1 = points[i];
		const p2 = points[(i + 1) % n];
		const p3 = points[(i + 2) % n];
		for (let k = 0; k < per; k++) out.push(catmull(p0, p1, p2, p3, k / per));
	}
	return out;
}

function catmull(p0: V3, p1: V3, p2: V3, p3: V3, u: number): V3 {
	const d = (a: V3, b: V3) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])) || 1e-6;
	const t0 = 0;
	const t1 = t0 + d(p0, p1);
	const t2 = t1 + d(p1, p2);
	const t3 = t2 + d(p2, p3);
	const t = t1 + (t2 - t1) * u;
	const lerp = (a: V3, b: V3, ta: number, tb: number): V3 => {
		const w = (t - ta) / (tb - ta);
		return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w];
	};
	const A1 = lerp(p0, p1, t0, t1);
	const A2 = lerp(p1, p2, t1, t2);
	const A3 = lerp(p2, p3, t2, t3);
	const B1 = lerp(A1, A2, t0, t2);
	const B2 = lerp(A2, A3, t1, t3);
	return lerp(B1, B2, t1, t2);
}

/**
 * A plat: four strands laid side by side along x, crossing as the word says
 * (+i: σᵢ, strands i and i+1, −i: σᵢ⁻¹), and capped in pairs at both ends.
 * Two-bridge knots — the trefoil, the figure-eight and the twist knots among
 * them — are drawn this way in Conway's notation, and the drawings are clean.
 */
export function plat(word: number[], opts: { gap?: number; w?: number; lift?: number; per?: number } = {}): V3[][] {
	const n = 4;
	const gap = opts.gap ?? 0.62;
	const w = opts.w ?? 0.62;
	const lift = opts.lift ?? 0.22;
	const per = opts.per ?? 20;
	const yOf = (k: number) => (1.5 - k) * gap;
	const L = w * word.length;
	const paths: V3[][] = Array.from({ length: n }, () => []);
	const pos = Array.from({ length: n }, (_, s) => s);
	word.forEach((g, m) => {
		const i = Math.abs(g) - 1;
		const a = pos.indexOf(i);
		const b = pos.indexOf(i + 1);
		for (let k = 0; k < per; k++) {
			const tau = sampleAt(k, per);
			const x = w * (m + tau) - L / 2;
			const e = tau * tau * (3 - 2 * tau);
			for (let s = 0; s < n; s++) {
				let y = yOf(pos[s]);
				let z = 0;
				if (s === a || s === b) {
					const down = s === a; // a moves from slot i to slot i+1
					y = down ? yOf(i) - gap * e : yOf(i + 1) + gap * e;
					const onTop = g > 0 ? down : !down;
					z = (onTop ? 1 : -1) * lift * Math.sin(Math.PI * tau);
				}
				paths[s].push([x, y, z]);
			}
		}
		pos[a] = i + 1;
		pos[b] = i;
	});
	for (let s = 0; s < n; s++) paths[s].push([L / 2, yOf(pos[s]), 0]);
	const cap = (side: -1 | 1, k1: number, k2: number): V3[] => {
		// a half circle from slot k1 to slot k2, bulging outwards
		const y1 = yOf(k1);
		const y2 = yOf(k2);
		const cy = (y1 + y2) / 2;
		const r = Math.abs(y1 - y2) / 2;
		const out: V3[] = [];
		for (let k = 1; k < 16; k++) {
			const t = (Math.PI * k) / 16;
			out.push([side * (L / 2 + r * Math.sin(t)), y1 + (y2 - y1) * (0.5 - 0.5 * Math.cos(t)) + 0 * cy, 0]);
		}
		return out;
	};
	// walk: strand from the left to the right, cap on the right, strand back, cap on the left …
	const endSlot = (s: number) => pos[s];
	const strandEndingAt = (slot: number) => pos.indexOf(slot);
	const partner = (k: number) => (k % 2 === 0 ? k + 1 : k - 1);
	const seen = new Set<number>();
	const comps: V3[][] = [];
	for (let s0 = 0; s0 < n; s0++) {
		if (seen.has(s0)) continue;
		const comp: V3[] = [];
		let s = s0;
		let forward = true;
		while (true) {
			if (forward) {
				if (seen.has(s)) break;
				seen.add(s);
				comp.push(...paths[s]);
				const k = endSlot(s);
				comp.push(...cap(1, k, partner(k)));
				s = strandEndingAt(partner(k));
				forward = false;
			} else {
				if (seen.has(s)) break;
				seen.add(s);
				comp.push(...[...paths[s]].reverse());
				const k = s; // it started in slot s
				comp.push(...cap(-1, k, partner(k)));
				s = partner(k);
				forward = true;
			}
		}
		comps.push(comp);
	}
	return comps;
}
