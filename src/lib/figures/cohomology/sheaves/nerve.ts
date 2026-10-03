// Covers of a planar region by round disks, their nerves, and coverage holes.
//
// The nerve N(U) of a cover U = {U_0, …, U_n} has a vertex for every set, an
// edge {i, j} when U_i ∩ U_j ≠ ∅, a triangle {i, j, k} when U_i ∩ U_j ∩ U_k ≠ ∅.
// Disks are convex, so every nonempty intersection is convex and therefore
// contractible: a cover by disks is always a *good* cover, and the nerve
// theorem says the nerve has the homotopy type of the union of the disks.
import { SimplicialComplex } from '$lib/math/complex';
import { homology } from '$lib/math/homology';

export interface Disk {
	x: number;
	y: number;
	r: number;
}

export interface Pt {
	x: number;
	y: number;
}

const TOL = 1e-7;

function d2(a: Pt, b: Pt) {
	return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
}

/** Is p in the (closed) disk, up to a small tolerance? */
export function inDisk(p: Pt, d: Disk, tol = TOL): boolean {
	return d2(p, d) <= (d.r + tol) ** 2;
}

/** Do two open disks overlap? */
export function pairMeet(a: Disk, b: Disk): boolean {
	return Math.sqrt(d2(a, b)) < a.r + b.r - 1e-9;
}

/** Intersection points of two circles (0, 1 or 2 points). */
export function circleIntersections(a: Disk, b: Disk): Pt[] {
	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const d = Math.hypot(dx, dy);
	if (d < 1e-12) return [];
	if (d > a.r + b.r || d < Math.abs(a.r - b.r)) return [];
	const l = (a.r * a.r - b.r * b.r + d * d) / (2 * d);
	const h2 = a.r * a.r - l * l;
	const h = h2 > 0 ? Math.sqrt(h2) : 0;
	const mx = a.x + (l * dx) / d;
	const my = a.y + (l * dy) / d;
	if (h === 0) return [{ x: mx, y: my }];
	return [
		{ x: mx - (h * dy) / d, y: my + (h * dx) / d },
		{ x: mx + (h * dy) / d, y: my - (h * dx) / d }
	];
}

/**
 * Do three disks have a common point?
 *
 * Exact test: if the intersection R is nonempty then either its boundary has a
 * corner — an intersection point of two of the circles lying in the third
 * disk — or it has no corner, in which case R is a whole disk and that disk's
 * centre lies in all three. So it suffices to test the three centres and the
 * (at most six) pairwise circle intersection points.
 */
export function tripleMeet(a: Disk, b: Disk, c: Disk): boolean {
	const ds = [a, b, c];
	if (!pairMeet(a, b) || !pairMeet(a, c) || !pairMeet(b, c)) return false;
	for (const d of ds) if (ds.every((e) => inDisk(d, e))) return true;
	for (let i = 0; i < 3; i++)
		for (let j = i + 1; j < 3; j++) {
			const k = 3 - i - j;
			for (const p of circleIntersections(ds[i], ds[j])) if (inDisk(p, ds[k], -1e-9)) return true;
		}
	return false;
}

export interface NerveData {
	complex: SimplicialComplex;
	edges: [number, number][];
	triangles: [number, number, number][];
	/** Betti numbers b0 (pieces) and b1 (independent loops = holes) of the nerve */
	b0: number;
	b1: number;
}

/** The nerve of a family of disks (simplices up to dimension 2). */
export function nerveOf(disks: Disk[]): NerveData {
	const n = disks.length;
	const edges: [number, number][] = [];
	const triangles: [number, number, number][] = [];
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) if (pairMeet(disks[i], disks[j])) edges.push([i, j]);
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			if (!pairMeet(disks[i], disks[j])) continue;
			for (let k = j + 1; k < n; k++)
				if (tripleMeet(disks[i], disks[j], disks[k])) triangles.push([i, j, k]);
		}
	const gens: number[][] = [];
	for (let i = 0; i < n; i++) gens.push([i]);
	for (const e of edges) gens.push(e);
	for (const t of triangles) gens.push(t);
	const complex = new SimplicialComplex(gens);
	// H_1 only depends on the 2-skeleton, which is what we built.
	const H = n ? homology(complex, 'Q') : [];
	return { complex, edges, triangles, b0: H[0]?.rank ?? 0, b1: H[1]?.rank ?? 0 };
}

// ── exact boundary of a union of disks ──────────────────────────────────────

export interface BoundaryArc {
	disk: number;
	/** start and end angle, counterclockwise on the disk's circle (end > start) */
	a: number;
	b: number;
}

export interface BoundaryLoop {
	arcs: BoundaryArc[];
	/** signed area enclosed: > 0 for an outer boundary, < 0 for the rim of a hole */
	area: number;
	/** SVG path data (y axis as given, i.e. pass screen coordinates in) */
	path: string;
}

const TAU = Math.PI * 2;

/**
 * The boundary of the union of the disks, as closed loops of circular arcs.
 * Each arc is traversed counterclockwise on its own circle, which keeps the
 * union on the left; so outer boundaries have positive signed area and the
 * rims of holes have negative signed area. The number of negative loops is
 * the number of holes (= b1 of the union = b1 of the nerve).
 */
export function unionBoundary(disks: Disk[]): BoundaryLoop[] {
	const arcs: BoundaryArc[] = [];
	disks.forEach((d, i) => {
		const angles: number[] = [];
		disks.forEach((e, j) => {
			if (i === j) return;
			for (const p of circleIntersections(d, e)) angles.push(Math.atan2(p.y - d.y, p.x - d.x));
		});
		const norm = angles.map((t) => ((t % TAU) + TAU) % TAU).sort((u, v) => u - v);
		const cuts = norm.filter((t, k) => k === 0 || t - norm[k - 1] > 1e-12);
		const pieces: [number, number][] = [];
		if (cuts.length === 0) pieces.push([0, TAU]);
		else for (let k = 0; k < cuts.length; k++) pieces.push([cuts[k], k + 1 < cuts.length ? cuts[k + 1] : cuts[0] + TAU]);
		for (const [a, b] of pieces) {
			const m = (a + b) / 2;
			const p = { x: d.x + d.r * Math.cos(m), y: d.y + d.r * Math.sin(m) };
			const covered = disks.some((e, j) => j !== i && d2(p, e) < e.r * e.r - 1e-12);
			if (!covered) arcs.push({ disk: i, a, b });
		}
	});
	// link arcs end-to-start into loops
	const used = new Array<boolean>(arcs.length).fill(false);
	const at = (arc: BoundaryArc, t: number) => ({
		x: disks[arc.disk].x + disks[arc.disk].r * Math.cos(t),
		y: disks[arc.disk].y + disks[arc.disk].r * Math.sin(t)
	});
	const loops: BoundaryLoop[] = [];
	for (let s = 0; s < arcs.length; s++) {
		if (used[s]) continue;
		const loop: BoundaryArc[] = [];
		let cur = s;
		for (let guard = 0; guard <= arcs.length; guard++) {
			used[cur] = true;
			loop.push(arcs[cur]);
			const arc = arcs[cur];
			if (arc.b - arc.a >= TAU - 1e-12) break; // a whole circle
			const end = at(arc, arc.b);
			let best = -1;
			let bestD = Infinity;
			for (let k = 0; k < arcs.length; k++) {
				if (k !== s && used[k]) continue;
				if (k === cur) continue;
				const st = at(arcs[k], arcs[k].a);
				const dd = d2(st, end);
				if (dd < bestD) {
					bestD = dd;
					best = k;
				}
			}
			if (best === -1 || best === s || bestD > 1e-6) break;
			cur = best;
		}
		let area = 0;
		for (const arc of loop) {
			const { x: cx, y: cy, r } = disks[arc.disk];
			area +=
				0.5 * (r * r * (arc.b - arc.a) + cx * r * (Math.sin(arc.b) - Math.sin(arc.a)) - cy * r * (Math.cos(arc.b) - Math.cos(arc.a)));
		}
		loops.push({ arcs: loop, area, path: loopPath(loop, disks) });
	}
	return loops;
}

function loopPath(loop: BoundaryArc[], disks: Disk[]): string {
	let s = '';
	loop.forEach((arc, k) => {
		const { x: cx, y: cy, r } = disks[arc.disk];
		const sweep = arc.b - arc.a;
		const P = (t: number) => `${(cx + r * Math.cos(t)).toFixed(3)} ${(cy + r * Math.sin(t)).toFixed(3)}`;
		if (k === 0) s += `M ${P(arc.a)} `;
		if (sweep >= TAU - 1e-9) {
			// a full circle: two half arcs
			s += `A ${r} ${r} 0 0 1 ${P(arc.a + Math.PI)} A ${r} ${r} 0 0 1 ${P(arc.a + TAU)} `;
		} else {
			// angles increase counterclockwise in math orientation; in screen
			// coordinates (y down) increasing angle is clockwise, i.e. sweep-flag 1
			s += `A ${r} ${r} 0 ${sweep > Math.PI ? 1 : 0} 1 ${P(arc.b)} `;
		}
	});
	return s + 'Z';
}

/** The holes of the union: boundary loops with negative signed area. */
export function holesOf(disks: Disk[]): BoundaryLoop[] {
	return unionBoundary(disks).filter((l) => l.area < -1e-9);
}
