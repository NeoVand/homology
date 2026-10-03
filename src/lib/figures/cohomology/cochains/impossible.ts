// Geometry for "impossible" objects that are possible after all — from one
// viewpoint. Under orthographic projection along a direction d, a point p and
// p + t·d land on the same pixel. So a staircase that climbs a total height s
// while drifting sideways by (s/k)·(1, ·, 1) looks closed when viewed along
// d = (1, k, 1): its top step sits exactly "in front of" its bottom step.
// The same trick, with three beams along x, y and z, builds the Penrose tribar.

export type V3 = [number, number, number];

export interface Box {
	center: V3;
	size: V3;
	/** index along the loop (0 = first step after the seam) */
	index: number;
	/** height of the step's top surface (stairs) */
	top: number;
	/** hide the +x face (an open end at the seam) */
	openPlusX?: boolean;
}

export interface Stairs {
	steps: Box[];
	/** number of steps in one turn */
	N: number;
	/** rise per step */
	h: number;
	/** the translation that carries step 0 to the (virtual) step N: parallel to the view direction */
	shift: V3;
	/** view direction (unnormalised), pointing from the object towards the camera */
	view: V3;
	/** centre of the box a step N would have if the walk continued (equals step 0 + shift) */
	next: V3;
}

/**
 * A square "spiral" of steps: corners are W×W landings, the four sides carry
 * n[0..3] treads of depth w in directions +x, +z, −x, −z. One turn rises N·h and
 * drifts by ((n0 − n2)·w, (n1 − n3)·w) in the plane; choosing h so that this
 * drift is (N·h/k)·(1, 1) makes the end coincide with the start when seen along (1, k, 1).
 * `seam` picks which cell of the loop is step 0 (put it on a side that climbs away
 * from the viewer, so the joint is hidden correctly).
 */
export function penroseStairs(
	n: [number, number, number, number] = [5, 5, 2, 2],
	o: { w?: number; ws?: [number, number, number, number]; W?: number; k?: number; thickness?: number; seam?: number } = {}
): Stairs {
	const ws = o.ws ?? [o.w ?? 1, o.w ?? 1, o.w ?? 1, o.w ?? 1];
	const W = o.W ?? 1.5;
	const k = o.k ?? 1.25;
	const T = o.thickness ?? 0.9;
	const driftX = n[0] * ws[0] - n[2] * ws[2];
	const driftZ = n[1] * ws[1] - n[3] * ws[3];
	if (Math.abs(driftX - driftZ) > 1e-9 || driftX <= 0) throw new Error('the drifts along x and z must agree and be positive');
	const dirs: V3[] = [
		[1, 0, 0],
		[0, 0, 1],
		[-1, 0, 0],
		[0, 0, -1]
	];
	// the base loop of cells: C0, side 1, C1, side 2, C2, side 3, C3, side 4
	type Cell = { corner: boolean; side: number };
	const cells: Cell[] = [];
	for (let j = 0; j < 4; j++) {
		cells.push({ corner: true, side: j });
		for (let i = 0; i < n[j]; i++) cells.push({ corner: false, side: j });
	}
	const N = cells.length;
	const drift = driftX;
	const h = (k * drift) / N;
	const extent = (c: Cell, d: number) => (c.corner ? W : c.side % 2 === d % 2 ? ws[c.side] : W);
	// direction of travel from cell i to cell i + 1: corner Cⱼ and the treads of side j all lead along side j
	const travel = (i: number) => cells[i].side;
	const seam = ((o.seam ?? N - 1 - Math.floor(n[3] / 2)) % N + N) % N;
	const steps: Box[] = [];
	let p: V3 = [0, 0, 0];
	for (let s = 0; s < N; s++) {
		const ci = (seam + s) % N;
		const c = cells[ci];
		if (s > 0) {
			const prev = cells[(ci - 1 + N) % N];
			const d = travel((ci - 1 + N) % N);
			const dv = dirs[d];
			const step = extent(prev, d) / 2 + extent(c, d) / 2;
			p = [p[0] + dv[0] * step, 0, p[2] + dv[2] * step];
		}
		const sx = c.corner ? W : c.side % 2 === 0 ? ws[c.side] : W;
		const sz = c.corner ? W : c.side % 2 === 0 ? W : ws[c.side];
		const top = s * h;
		steps.push({ center: [p[0], top - T / 2, p[2]], size: [sx, T, sz], index: s, top });
	}
	// one more transition: where a step N would sit if the loop continued
	const last = cells[(seam + N - 1) % N];
	const dl = travel((seam + N - 1) % N);
	const stepL = extent(last, dl) / 2 + extent(cells[seam], dl) / 2;
	const next: V3 = [p[0] + dirs[dl][0] * stepL, N * h - T / 2, p[2] + dirs[dl][2] * stepL];
	const t = drift; // horizontal drift in x and in z
	return { steps, N, h, shift: [t, N * h, t], view: [1, k, 1], next };
}

/** The position the next cell after the last step would have (the "virtual" step N). */
export function virtualNext(st: Stairs): V3 {
	const s0 = st.steps[0].center;
	return [s0[0] + st.shift[0], s0[1] + st.shift[1], s0[2] + st.shift[2]];
}

/**
 * The Penrose tribar: three square beams along +x, +y, +z of length L and
 * thickness a, so the far end sits at start + L·(1, 1, 1) — on top of the start
 * when seen along (1, 1, 1). The seam is cut in the middle of the x-beam; the
 * piece that ends at the seam is left open (its +x end would face the camera).
 */
export function penroseTribar(L = 4, a = 1): { boxes: Box[]; shift: V3; view: V3 } {
	const P0: V3 = [0, 0, 0];
	const P1: V3 = [L, 0, 0];
	const P2: V3 = [L, L, 0];
	const P3: V3 = [L, L, L];
	const boxes: Box[] = [];
	// second half of the x-beam: from the seam (x = L/2) to the corner P1 (extended to fill the corner)
	boxes.push({ center: [(L / 2 + L + a / 2) / 2, 0, 0], size: [L / 2 + a / 2, a, a], index: 0, top: 0 });
	// y-beam: P1 → P2, filling both corners
	boxes.push({ center: [L, L / 2, 0], size: [a, L + a, a], index: 1, top: 0 });
	// z-beam: P2 → P3, filling both corners
	boxes.push({ center: [L, L, L / 2], size: [a, a, L + a], index: 2, top: 0 });
	// first half of the x-beam, carried along (1,1,1) by L: from the corner at P3 to the seam
	const x0 = P3[0] - a / 2;
	const x1 = P3[0] + L / 2;
	boxes.push({ center: [(x0 + x1) / 2, P3[1], P3[2]], size: [x1 - x0, a, a], index: 3, top: 0, openPlusX: true });
	void P0;
	void P2;
	return { boxes, shift: [L, L, L], view: [1, 1, 1] };
}

/** Orthographic projection onto the plane perpendicular to `view` (2D coordinates). */
export function project(p: V3, view: V3, up: V3 = [0, 1, 0]): [number, number] {
	const n = norm(view);
	// right = up × n, true up = n × right
	const r = norm(cross(up, n));
	const u = cross(n, r);
	return [dot(p, r), dot(p, u)];
}

const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
	const l = Math.hypot(...a) || 1;
	return [a[0] / l, a[1] / l, a[2] / l];
};
