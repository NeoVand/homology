// "Developed" (cut-open) pictures of simplicial complexes.
//
// A torus drawn as a square with opposite sides glued shows some vertices
// several times (vertex 0 sits at all four corners). The shared ComplexView2D
// allows one position per vertex, so these figures use a FlatLayout instead:
// a list of *drawn* vertices, edges and triangles, each remembering which
// abstract simplex of the complex it is a picture of.
import { SimplicialComplex } from '$lib/math/complex';

export type Pt = [number, number];

/** a labelled point in layout ("math") coordinates, y pointing up */
export type DV = [label: number, p: Pt];

export interface DrawnVertex {
	/** vertex label */
	v: number;
	/** index of [v] in K.simplices[0] */
	i: number;
	/** SVG position (y down) */
	p: Pt;
	/** layout coordinates (y up), used for 3D maps */
	q: Pt;
}
export interface DrawnEdge {
	/** drawn-vertex indices of the endpoints, in increasing label order */
	a: number;
	b: number;
	/** abstract edge index in K.simplices[1] */
	e: number;
}
export interface DrawnTri {
	/** drawn-vertex indices, in increasing label order */
	a: number;
	b: number;
	c: number;
	/** abstract triangle index in K.simplices[2] */
	t: number;
	/** +1 if the increasing-label order runs counterclockwise on screen, −1 if clockwise */
	screen: 1 | -1;
}
export interface FlatLayout {
	K: SimplicialComplex;
	verts: DrawnVertex[];
	edges: DrawnEdge[];
	tris: DrawnTri[];
	viewBox: string;
	/** SVG units per layout unit */
	scale: number;
}

export interface FlatSpec {
	tris?: [DV, DV, DV][];
	edges?: [DV, DV][];
	points?: DV[];
}

/**
 * Build a flat layout. Every drawn simplex must exist in K (an error is thrown
 * otherwise). Edges of drawn triangles are drawn automatically.
 */
export function buildFlat(K: SimplicialComplex, spec: FlatSpec, opts: { scale?: number; pad?: number } = {}): FlatLayout {
	const scale = opts.scale ?? 60;
	const pad = opts.pad ?? 34;
	const verts: DrawnVertex[] = [];
	const vkey = new Map<string, number>();
	const dv = ([v, q]: DV): number => {
		const k = `${v}@${q[0].toFixed(4)},${q[1].toFixed(4)}`;
		let idx = vkey.get(k);
		if (idx === undefined) {
			const i = K.indexOf([v]);
			if (i < 0) throw new Error(`vertex ${v} not in complex`);
			idx = verts.length;
			verts.push({ v, i, q, p: [q[0] * scale, -q[1] * scale] });
			vkey.set(k, idx);
		}
		return idx;
	};
	const edges: DrawnEdge[] = [];
	const ekey = new Set<string>();
	const addEdge = (x: number, y: number) => {
		const [a, b] = verts[x].v < verts[y].v ? [x, y] : [y, x];
		const k = `${Math.min(a, b)}-${Math.max(a, b)}`;
		if (ekey.has(k)) return;
		const e = K.indexOf([verts[a].v, verts[b].v]);
		if (e < 0) throw new Error(`edge ${verts[a].v}${verts[b].v} not in complex`);
		ekey.add(k);
		edges.push({ a, b, e });
	};
	const tris: DrawnTri[] = [];
	for (const t of spec.tris ?? []) {
		const ids = t.map(dv).sort((x, y) => verts[x].v - verts[y].v) as [number, number, number];
		const ti = K.indexOf(ids.map((x) => verts[x].v));
		if (ti < 0) throw new Error(`triangle ${ids.map((x) => verts[x].v).join('')} not in complex`);
		const [A, B, C] = ids.map((x) => verts[x].q);
		const area = (B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]);
		tris.push({ a: ids[0], b: ids[1], c: ids[2], t: ti, screen: area > 0 ? 1 : -1 });
		addEdge(ids[0], ids[1]);
		addEdge(ids[0], ids[2]);
		addEdge(ids[1], ids[2]);
	}
	for (const [x, y] of spec.edges ?? []) addEdge(dv(x), dv(y));
	for (const p of spec.points ?? []) dv(p);

	const xs = verts.map((v) => v.p[0]);
	const ys = verts.map((v) => v.p[1]);
	const x0 = Math.min(...xs) - pad;
	const y0 = Math.min(...ys) - pad;
	const w = Math.max(...xs) - Math.min(...xs) + 2 * pad;
	const h = Math.max(...ys) - Math.min(...ys) + 2 * pad;
	return { K, verts, edges, tris, scale, viewBox: `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}` };
}

/** All drawn copies of each abstract simplex (copies[k][index] = drawn indices). */
export function copies(L: FlatLayout) {
	const v = new Map<number, number[]>();
	const e = new Map<number, number[]>();
	const t = new Map<number, number[]>();
	L.verts.forEach((d, j) => v.set(d.i, [...(v.get(d.i) ?? []), j]));
	L.edges.forEach((d, j) => e.set(d.e, [...(e.get(d.e) ?? []), j]));
	L.tris.forEach((d, j) => t.set(d.t, [...(t.get(d.t) ?? []), j]));
	return { v, e, t };
}

/** A viewBox of at least w × h units, centred on the layout (so small pictures are not magnified). */
export function paddedViewBox(L: FlatLayout, w: number, h: number): string {
	const [x0, y0, W, H] = L.viewBox.split(' ').map(Number);
	const cx = x0 + W / 2;
	const cy = y0 + H / 2;
	const ww = Math.max(W, w);
	const hh = Math.max(H, h);
	return `${(cx - ww / 2).toFixed(1)} ${(cy - hh / 2).toFixed(1)} ${ww.toFixed(1)} ${hh.toFixed(1)}`;
}

/**
 * The orientation of each abstract triangle that runs counterclockwise in the
 * picture (as a ±1 coefficient relative to the increasing-label orientation).
 * Triangles that are not drawn get 0.
 */
export function counterclockwise(L: FlatLayout): number[] {
	const eps = new Array<number>(L.K.count(2)).fill(0);
	for (const d of L.tris) eps[d.t] = d.screen;
	return eps;
}
