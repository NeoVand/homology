// Choosing where to look from. A knot in space casts many shadows; the most
// legible has as few crossings as possible, spread well apart, and leaves no
// strand passing close to a crossing it is not part of. We try many
// directions and keep the best one, turned so that we look down the z-axis.
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

/** the knot turned so that its most legible shadow is the view down the z-axis */
export function bestView(comps: V3[][], opts: { tries?: number; atLeast?: number } = {}): V3[][] {
	const tries = opts.tries ?? 400;
	let best = comps;
	let bestScore = -Infinity;
	for (let i = 0; i < tries; i++) {
		// directions spread evenly over a hemisphere (Fibonacci), each with an upright roll
		const z = 1 - i / tries;
		const r = Math.sqrt(1 - z * z);
		const phi = i * 2.399963229728653;
		const R = rotTo([r * Math.cos(phi), r * Math.sin(phi), z], 0);
		const view = comps.map((c) => c.map((p) => apply(R, p)));
		const D = diagramOf(view);
		const n = D.pd.length;
		if (opts.atLeast !== undefined && n < opts.atLeast) continue;
		// fewer crossings first; then crossings far from each other, relative to the size of the shadow
		let spread = Infinity;
		for (let a = 0; a < n; a++)
			for (let b = a + 1; b < n; b++) spread = Math.min(spread, Math.hypot(D.at[a][0] - D.at[b][0], D.at[a][1] - D.at[b][1]));
		const xs = view.flat().map((q) => q[0]);
		const ys = view.flat().map((q) => q[1]);
		const size = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
		const score = -n * 100 + Math.min(spread / size, 1) * 10;
		if (score > bestScore) {
			bestScore = score;
			best = view;
		}
	}
	// stand it upright: turn about z so the shadow's widest extent is horizontal
	let bestRoll = 0;
	let bestW = -Infinity;
	for (let k = 0; k < 36; k++) {
		const a = (k * Math.PI) / 36;
		const xs = best.flat().map((p) => p[0] * Math.cos(a) - p[1] * Math.sin(a));
		const w = Math.max(...xs) - Math.min(...xs);
		if (w > bestW) {
			bestW = w;
			bestRoll = a;
		}
	}
	const R = rotTo([0, 0, 1], bestRoll);
	return best.map((c) => c.map((p) => apply(R, p)));
}
