// The threads of Figure 1.2.7: dotted circular arcs joining the pairs of points
// that the gluing identifies, on the square as it folds into a torus.
//
// Everything here is a continuous function of the animation time t: the arcs
// move with the sheet, each lies in the plane in which its gap closes, and each
// fades only as its own gap closes. stitches.test.ts checks that numerically.
import { presets, pose, torusStages } from '$lib/figures/topology/gluing/morphs';
import type { P3 } from '$lib/figures/topology/gluing/sheet';

const f = presets.torus.f;

/** the marked points: p on the b-sides, q on the a-sides */
export const PV = 0.6;
export const QU = 0.6;

export type ThreadKind = 'b' | 'a' | 'p' | 'q';
export interface Thread {
	kind: ThreadKind;
	/** parameters of the two ends */
	a: [number, number];
	b: [number, number];
}

// (0, v) ~ (1, v) are stitched by the roll, (u, 0) ~ (u, 1) by the bend; the
// threads at 0 and 1 join corners, so the corners' threads form a closed chain
const STEPS = [0, 0.2, 0.4, 0.8, 1];
export const threads: Thread[] = [
	...STEPS.map((v) => ({ kind: 'b' as const, a: [0, v] as [number, number], b: [1, v] as [number, number] })),
	{ kind: 'p', a: [0, PV], b: [1, PV] },
	...STEPS.map((u) => ({ kind: 'a' as const, a: [u, 0] as [number, number], b: [u, 1] as [number, number] })),
	{ kind: 'q', a: [QU, 0], b: [QU, 1] }
];

/** dots per arc (fixed, so the dots crowd together rather than pop as an arc shrinks) */
export const DOTS = 22;
/** the angle each arc subtends */
const ARC = 1.4;

const V = () => ({ x: 0, y: 0, z: 0 });
const dot = (a: P3, b: P3) => a.x * b.x + a.y * b.y + a.z * b.z;

export interface ThreadState {
	/** DOTS points along the arc, xyz */
	dots: Float32Array;
	/** 0 (closed, invisible) … 1 */
	alpha: number;
	/** distance between the two ends */
	gap: number;
	/** |the bowing direction before normalising|: how far from undefined it is */
	margin: number;
}

/**
 * Every thread at time t. Each arc is circular, subtends a fixed angle, and lies
 * in the plane in which its gap closes, bowing outward: it traces the way the
 * sheet will close.
 *
 * In the morph's own frame (before its viewing rotation) the roll curls the
 * sheet towards +z and the bend turns the tube towards −x, and by the morph's
 * symmetry every b-chord runs along x and every a-chord along y. So the a-arcs
 * bow towards −x, and the b-arcs towards +z, starting as arches over their rows
 * (+y) on the flat square and swinging forward as the roll begins. Both
 * directions are perpendicular to their chords at every moment: an arc can
 * never flip or lose its way.
 */
export function threadStates(t: number, out?: ThreadState[]): ThreadState[] {
	const res = out ?? threads.map(() => ({ dots: new Float32Array(DOTS * 3), alpha: 0, gap: 0, margin: 0 }));
	const { eA, rx, ry } = torusStages(t);
	const swing = (Math.PI / 2) * (() => {
		const x = Math.min(1, eA / 0.45);
		return x * x * (3 - 2 * x);
	})();
	const up = { x: 0, y: Math.cos(swing), z: Math.sin(swing) };
	const left = { x: -1, y: 0, z: 0 };
	pose(up, rx, ry);
	pose(left, rx, ry);
	const A = V();
	const B = V();
	threads.forEach((th, k) => {
		f(th.a[0], th.a[1], t, A);
		f(th.b[0], th.b[1], t, B);
		const C = { x: B.x - A.x, y: B.y - A.y, z: B.z - A.z };
		const gap = Math.sqrt(dot(C, C));
		const M = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2, z: (A.z + B.z) / 2 };
		const n = { ...(th.kind === 'b' || th.kind === 'p' ? up : left) };
		// (already perpendicular to the chord; remove any rounding)
		const c = gap > 1e-9 ? { x: C.x / gap, y: C.y / gap, z: C.z / gap } : { x: 1, y: 0, z: 0 };
		const along = dot(n, c);
		n.x -= along * c.x;
		n.y -= along * c.y;
		n.z -= along * c.z;
		const margin = Math.sqrt(dot(n, n));
		n.x /= margin || 1;
		n.y /= margin || 1;
		n.z /= margin || 1;
		// the arc: centre on the far side of the chord, radius R
		const R = gap / (2 * Math.sin(ARC / 2));
		const back = R * Math.cos(ARC / 2);
		const d = res[k].dots;
		for (let i = 0; i < DOTS; i++) {
			const al = -ARC / 2 + (ARC * (i + 0.5)) / DOTS;
			const sa = Math.sin(al);
			const ca = Math.cos(al);
			d[i * 3] = M.x - n.x * back + R * (sa * c.x + ca * n.x);
			d[i * 3 + 1] = M.y - n.y * back + R * (sa * c.y + ca * n.y);
			d[i * 3 + 2] = M.z - n.z * back + R * (sa * c.z + ca * n.z);
		}
		// fade as the gap closes, smoothly, over the last stretch of it
		const x = Math.min(1, Math.max(0, (gap - 0.02) / 1.1));
		res[k].alpha = x * x * (3 - 2 * x);
		res[k].gap = gap;
		res[k].margin = margin;
	});
	return res;
}
