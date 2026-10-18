// Choosing where to look from. A knot in space casts many shadows; the most
// legible has as few crossings as possible, each a clean right angle, with no
// strand passing close to a crossing it is not part of and no strand running
// towards the eye. We try many directions and keep the best one, turned so
// that we look down the z-axis.
import { diagramOf, type V3 } from './diagram';

type M3 = [number, number, number, number, number, number, number, number, number];

function rotTo(dir: V3, roll: number): M3 {
	// a rotation taking dir to +z, then turning by `roll` about z
	const [x, y, z] = dir;
	const v: V3 = [y, -x, 0]; // dir × z
	const s = Math.hypot(v[0], v[1]);
	const c = z;
	let R: M3;
	if (s < 1e-9) R = c > 0 ? [1, 0, 0, 0, 1, 0, 0, 0, 1] : [1, 0, 0, 0, -1, 0, 0, 0, -1];
	else {
		const k: V3 = [v[0] / s, v[1] / s, 0];
		const t = 1 - c;
		R = [
			c + k[0] * k[0] * t, k[0] * k[1] * t, k[1] * s,
			k[1] * k[0] * t, c + k[1] * k[1] * t, -k[0] * s,
			-k[1] * s, k[0] * s, c
		];
	}
	const cr = Math.cos(roll);
	const sr = Math.sin(roll);
	return [
		cr * R[0] - sr * R[3], cr * R[1] - sr * R[4], cr * R[2] - sr * R[5],
		sr * R[0] + cr * R[3], sr * R[1] + cr * R[4], sr * R[2] + cr * R[5],
		R[6], R[7], R[8]
	];
}

const apply = (R: M3, p: V3): V3 => [R[0] * p[0] + R[1] * p[1] + R[2] * p[2], R[3] * p[0] + R[4] * p[1] + R[5] * p[2], R[6] * p[0] + R[7] * p[1] + R[8] * p[2]];

/**
 * How legible the shadow down the z-axis is, each measure relative to the shadow's size: the smallest
 * angle at a crossing (as its sine), the closest approach of two pieces of the shadow that are not the
 * two strands of one crossing, the sharpest bend (a strand running towards the eye shows up as a sharp
 * bend or a spike) and how round the shadow is (the shorter side of its box over the longer).
 */
export function legibility(view: V3[][]) {
	const D = diagramOf(view);
	const pts = view.flat();
	const xs = pts.map((q) => q[0]);
	const ys = pts.map((q) => q[1]);
	const w = Math.max(...xs) - Math.min(...xs);
	const h = Math.max(...ys) - Math.min(...ys);
	const size = Math.max(w, h);
	// the shadow's direction at a pass, from the points on either side
	const dir = (c: V3[], at: number) => {
		const i = Math.floor(at);
		const a = c[(i - 1 + c.length) % c.length];
		const b = c[(i + 2) % c.length];
		const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
	};
	const ends = new Map<number, number[][]>();
	D.passes.forEach((ps, ci) => ps.forEach((p) => ends.set(p.crossing, [...(ends.get(p.crossing) ?? []), dir(view[ci], p.at)])));
	let angle = 1;
	for (const [[a0, a1], [b0, b1]] of ends.values()) angle = Math.min(angle, Math.abs(a0 * b1 - a1 * b0));
	// points within this arc length of a crossing count as part of it
	const lam = 0.14 * size;
	const arc = view.map((c) => c.map((p, i) => Math.hypot(...([0, 1, 2].map((k) => c[(i + 1) % c.length][k] - p[k]) as V3))));
	const step = arc.map((a) => a.reduce((x, y) => x + y, 0) / a.length);
	const near = view.map((c, ci) =>
		c.map((_, i) => D.passes[ci].filter((p) => Math.min(Math.abs(i - p.at), c.length - Math.abs(i - p.at)) * step[ci] < lam).map((p) => p.crossing))
	);
	let clear = Infinity;
	for (let ca = 0; ca < view.length; ca++)
		for (let cb = ca; cb < view.length; cb++) {
			const A = view[ca];
			const B = view[cb];
			for (let i = 0; i < A.length; i++)
				for (let j = ca === cb ? i + 1 : 0; j < B.length; j++) {
					const d = Math.hypot(A[i][0] - B[j][0], A[i][1] - B[j][1]);
					if (d >= clear) continue;
					if (ca === cb && Math.min(j - i, A.length - j + i) * step[ca] < 2.2 * lam) continue;
					if (near[ca][i].some((x) => near[cb][j].includes(x))) continue;
					clear = d;
				}
		}
	let bend = Infinity;
	for (const c of view) {
		const n = c.length;
		for (let i = 0; i < n; i++) {
			const a = c[(i - 2 + n) % n];
			const b = c[i];
			const d = c[(i + 2) % n];
			const u = [b[0] - a[0], b[1] - a[1]];
			const v = [d[0] - b[0], d[1] - b[1]];
			// the radius of the circle through the three
			const r = (Math.hypot(u[0], u[1]) * Math.hypot(v[0], v[1]) * Math.hypot(d[0] - a[0], d[1] - a[1])) / (2 * Math.abs(u[0] * v[1] - u[1] * v[0]) + 1e-15);
			bend = Math.min(bend, r);
		}
	}
	return { crossings: D.pd.length, angle, clear: clear / size, bend: bend / size, round: Math.min(w, h) / size };
}

/**
 * The turn (a rotation matrix, row by row) that brings the knot's most legible shadow round to the view
 * down the z-axis: the fewest crossings first; among those, the shadow whose worst feature is least bad;
 * then stood upright, its widest extent horizontal.
 */
export function bestTurn(comps: V3[][], opts: { tries?: number; atLeast?: number } = {}): number[] {
	const tries = opts.tries ?? 400;
	const views: { view: V3[][]; n: number; R: M3 }[] = [];
	let fewest = Infinity;
	for (let i = 0; i < tries; i++) {
		// directions spread evenly over a hemisphere (Fibonacci), each with an upright roll
		const z = 1 - i / tries;
		const r = Math.sqrt(1 - z * z);
		const phi = i * 2.399963229728653;
		const R = rotTo([r * Math.cos(phi), r * Math.sin(phi), z], 0);
		const view = comps.map((c) => c.map((p) => apply(R, p)));
		const n = diagramOf(view).pd.length;
		if (opts.atLeast !== undefined && n < opts.atLeast) continue;
		fewest = Math.min(fewest, n);
		views.push({ view, n, R });
	}
	let best: { view: V3[][]; R: M3 } = { view: comps, R: [1, 0, 0, 0, 1, 0, 0, 0, 1] };
	let bestScore = -Infinity;
	for (const v of views) {
		if (v.n !== fewest) continue;
		const m = legibility(v.view);
		// a product, so that no one fault can be made up for by the others; past a point each is good enough
		const score = Math.log(m.angle) + Math.log(Math.min(m.clear, 0.25)) + 0.7 * Math.log(Math.min(m.bend, 0.2)) + 0.5 * Math.log(m.round);
		if (score > bestScore) {
			bestScore = score;
			best = v;
		}
	}
	// stand it upright: turn about z so the shadow's widest extent is horizontal
	let bestRoll = 0;
	let bestW = -Infinity;
	for (let k = 0; k < 36; k++) {
		const a = (k * Math.PI) / 36;
		const xs = best.view.flat().map((p) => p[0] * Math.cos(a) - p[1] * Math.sin(a));
		const w = Math.max(...xs) - Math.min(...xs);
		if (w > bestW) {
			bestW = w;
			bestRoll = a;
		}
	}
	const U = rotTo([0, 0, 1], bestRoll);
	const R = best.R;
	// U · R
	return [0, 1, 2].flatMap((r) => [0, 1, 2].map((c) => U[3 * r] * R[c] + U[3 * r + 1] * R[3 + c] + U[3 * r + 2] * R[6 + c]));
}

/** the knot turned so that its most legible shadow is the view down the z-axis */
export function bestView(comps: V3[][], opts: { tries?: number; atLeast?: number } = {}): V3[][] {
	const R = bestTurn(comps, opts) as M3;
	return comps.map((c) => c.map((p) => apply(R, p)));
}
