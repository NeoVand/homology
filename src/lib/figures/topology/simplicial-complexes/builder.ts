// The rule-checker behind the "complex builder" figure of §2.5.
//
// A drawing is a list of vertices (points in the plane) and a list of
// simplices (sets of vertex ids). It is a simplicial complex when
//   rule 1: every face of a simplex in the list is also in the list, and
//   rule 2: any two simplices meet in a common face, or not at all.
// Points are positions on screen, so "meet" is judged with a small tolerance
// (if it *looks* like two things touch, we say they touch).
export type Pt = [number, number];

export interface Drawing {
	verts: Map<number, Pt>;
	/** simplices as sorted arrays of vertex ids (edges and triangles; vertices are implicit) */
	simplices: number[][];
}

export type ProblemKind =
	| 'missing-face'
	| 'vertex-on-edge'
	| 'vertex-in-triangle'
	| 'edges-cross'
	| 'edges-overlap'
	| 'edge-through-triangle'
	| 'triangles-overlap'
	| 'flat-triangle'
	| 'same-point';

export interface Problem {
	kind: ProblemKind;
	/** the simplices involved (vertex-id arrays; a vertex is [v]) */
	parts: number[][];
	/** where to draw the warning marker */
	at: Pt;
}

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];
const len = (a: Pt) => Math.hypot(a[0], a[1]);
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Signed distance from p to the line through a, b (positive on the left). */
function sideDist(a: Pt, b: Pt, p: Pt) {
	const d = sub(b, a);
	return cross(d, sub(p, a)) / (len(d) || 1);
}

/** Distance from p to the segment ab and the parameter of the closest point. */
export function segDist(p: Pt, a: Pt, b: Pt): { d: number; t: number } {
	const ab = sub(b, a);
	const L2 = dot(ab, ab) || 1;
	const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / L2));
	const q = lerp(a, b, t);
	return { d: Math.hypot(p[0] - q[0], p[1] - q[1]), t };
}

/** p lies on the open segment ab (away from its ends), within tol. */
export function onOpenSegment(p: Pt, a: Pt, b: Pt, tol: number): boolean {
	const L = len(sub(b, a));
	if (L < 1e-9) return false;
	const { d, t } = segDist(p, a, b);
	return d <= tol && t * L > tol && (1 - t) * L > tol;
}

/** Orient a triangle counter-clockwise (in a y-up sense; sign only matters). */
function ccw(t: Pt[]): Pt[] {
	return cross(sub(t[1], t[0]), sub(t[2], t[0])) >= 0 ? t : [t[0], t[2], t[1]];
}

/** p lies inside the triangle by more than tol. */
export function deepInTriangle(p: Pt, tri: Pt[], tol: number): boolean {
	const [a, b, c] = ccw(tri);
	return sideDist(a, b, p) > tol && sideDist(b, c, p) > tol && sideDist(c, a, p) > tol;
}

/** Two segments cross properly (each passes strictly through the other's interior). */
export function properCross(a: Pt, b: Pt, c: Pt, d: Pt, tol: number): Pt | null {
	const d1 = sideDist(a, b, c);
	const d2 = sideDist(a, b, d);
	const d3 = sideDist(c, d, a);
	const d4 = sideDist(c, d, b);
	if (((d1 > tol && d2 < -tol) || (d1 < -tol && d2 > tol)) && ((d3 > tol && d4 < -tol) || (d3 < -tol && d4 > tol))) {
		const t = d3 / (d3 - d4);
		return lerp(a, b, t);
	}
	return null;
}

/** Clip a polygon by the half-plane on the left of the directed line a→b, shifted inwards by tol. */
function clipHalf(poly: Pt[], a: Pt, b: Pt, tol: number): Pt[] {
	const out: Pt[] = [];
	const f = (p: Pt) => sideDist(a, b, p) - tol;
	for (let i = 0; i < poly.length; i++) {
		const p = poly[i];
		const q = poly[(i + 1) % poly.length];
		const fp = f(p);
		const fq = f(q);
		if (fp >= 0) out.push(p);
		if ((fp >= 0) !== (fq >= 0)) out.push(lerp(p, q, fp / (fp - fq)));
	}
	return out;
}

function area(poly: Pt[]) {
	let s = 0;
	for (let i = 0; i < poly.length; i++) s += cross(poly[i], poly[(i + 1) % poly.length]);
	return Math.abs(s) / 2;
}

function centroid(poly: Pt[]): Pt {
	const x = poly.reduce((s, p) => s + p[0], 0) / poly.length;
	const y = poly.reduce((s, p) => s + p[1], 0) / poly.length;
	return [x, y];
}

/** The part of triangle A lying deep inside triangle B (shrunk by tol). */
export function triangleOverlap(A: Pt[], B: Pt[], tol: number): Pt[] {
	const [a, b, c] = ccw(B);
	let poly: Pt[] = ccw(A);
	poly = clipHalf(poly, a, b, tol);
	if (poly.length) poly = clipHalf(poly, b, c, tol);
	if (poly.length) poly = clipHalf(poly, c, a, tol);
	return poly;
}

/** The part of segment pq lying deep inside triangle T, as a parameter interval. */
export function segmentInTriangle(p: Pt, q: Pt, T: Pt[], tol: number): [number, number] | null {
	const [a, b, c] = ccw(T);
	let t0 = 0;
	let t1 = 1;
	for (const [u, v] of [
		[a, b],
		[b, c],
		[c, a]
	] as [Pt, Pt][]) {
		const fp = sideDist(u, v, p) - tol;
		const fq = sideDist(u, v, q) - tol;
		if (fp < 0 && fq < 0) return null;
		if (fp < 0) t0 = Math.max(t0, fp / (fp - fq));
		else if (fq < 0) t1 = Math.min(t1, fp / (fp - fq));
	}
	return t1 - t0 > 1e-6 ? [t0, t1] : null;
}

const isFace = (f: number[], s: number[]) => f.every((v) => s.includes(v));
const key = (s: number[]) => [...s].sort((a, b) => a - b).join(',');

/** All faces (of dimension ≥ 1) of a simplex, excluding itself. */
function properFaces(s: number[]): number[][] {
	if (s.length === 3)
		return [
			[s[0], s[1]],
			[s[0], s[2]],
			[s[1], s[2]]
		];
	return [];
}

/** The smallest list containing the given simplices and all their faces. */
export function closeUnderFaces(simplices: number[][]): number[][] {
	const seen = new Map<string, number[]>();
	for (const s of simplices) {
		const ss = [...s].sort((a, b) => a - b);
		seen.set(key(ss), ss);
		for (const f of properFaces(ss)) seen.set(key(f), f);
	}
	return [...seen.values()];
}

/** Check the two rules; returns every problem found. */
export function checkDrawing(D: Drawing, tol = 4): Problem[] {
	const P = (v: number) => D.verts.get(v)!;
	const problems: Problem[] = [];
	const keys = new Set(D.simplices.map(key));
	const edges = D.simplices.filter((s) => s.length === 2);
	const tris = D.simplices.filter((s) => s.length === 3);
	const ids = [...D.verts.keys()];

	// rule 1: every edge of a triangle must be present
	for (const t of tris)
		for (const f of properFaces(t))
			if (!keys.has(key(f))) problems.push({ kind: 'missing-face', parts: [f, t], at: lerp(P(f[0]), P(f[1]), 0.5) });

	// degenerate triangles (corners in a line)
	for (const t of tris) {
		const [a, b, c] = t.map(P);
		const L = Math.max(len(sub(b, a)), len(sub(c, a)), len(sub(c, b)), 1);
		if (Math.abs(cross(sub(b, a), sub(c, a))) / L < tol)
			problems.push({ kind: 'flat-triangle', parts: [t], at: centroid([a, b, c]) });
	}

	// two vertices on top of each other
	for (let i = 0; i < ids.length; i++)
		for (let j = i + 1; j < ids.length; j++) {
			const a = P(ids[i]);
			const b = P(ids[j]);
			if (Math.hypot(a[0] - b[0], a[1] - b[1]) < tol * 1.5)
				problems.push({ kind: 'same-point', parts: [[ids[i]], [ids[j]]], at: a });
		}

	// rule 2: vertex against edge / triangle
	for (const v of ids) {
		const p = P(v);
		for (const e of edges) {
			if (e.includes(v)) continue;
			if (onOpenSegment(p, P(e[0]), P(e[1]), tol)) problems.push({ kind: 'vertex-on-edge', parts: [[v], e], at: p });
		}
		for (const t of tris) {
			if (t.includes(v)) continue;
			if (deepInTriangle(p, t.map(P), tol)) problems.push({ kind: 'vertex-in-triangle', parts: [[v], t], at: p });
		}
	}

	// rule 2: edge against edge
	for (let i = 0; i < edges.length; i++)
		for (let j = i + 1; j < edges.length; j++) {
			const [a, b] = edges[i].map(P);
			const [c, d] = edges[j].map(P);
			const x = properCross(a, b, c, d, tol);
			if (x) {
				problems.push({ kind: 'edges-cross', parts: [edges[i], edges[j]], at: x });
				continue;
			}
			// collinear overlap: an endpoint of one strictly inside the other is already a
			// vertex-on-edge problem unless the endpoint is shared; check the shared case
			const shared = edges[i].filter((v) => edges[j].includes(v));
			if (shared.length === 1) {
				const s = P(shared[0]);
				const u = sub(edges[i][0] === shared[0] ? b : a, s);
				const w = sub(edges[j][0] === shared[0] ? d : c, s);
				const sin = cross(u, w) / ((len(u) || 1) * (len(w) || 1));
				if (Math.abs(sin) < 0.02 && dot(u, w) > 0) {
					problems.push({ kind: 'edges-overlap', parts: [edges[i], edges[j]], at: s });
				}
			}
		}

	// rule 2: edge against triangle
	for (const e of edges)
		for (const t of tris) {
			if (isFace(e, t)) continue;
			const [p, q] = e.map(P);
			const iv = segmentInTriangle(p, q, t.map(P), tol);
			if (iv) problems.push({ kind: 'edge-through-triangle', parts: [e, t], at: lerp(p, q, (iv[0] + iv[1]) / 2) });
		}

	// rule 2: triangle against triangle
	for (let i = 0; i < tris.length; i++)
		for (let j = i + 1; j < tris.length; j++) {
			const ov = triangleOverlap(tris[i].map(P), tris[j].map(P), tol);
			if (ov.length >= 3 && area(ov) > tol * tol)
				problems.push({ kind: 'triangles-overlap', parts: [tris[i], tris[j]], at: centroid(ov) });
		}
	return problems;
}

/** A plain-words description of a problem, for the readout. */
export function describe(p: Problem, name: (s: number[]) => string): string {
	const [a, b] = p.parts;
	switch (p.kind) {
		case 'missing-face':
			return `Rule 1: the edge ${name(a)} of triangle ${name(b)} is missing.`;
		case 'vertex-on-edge':
			return `Rule 2: vertex ${name(a)} sits on edge ${name(b)}, which is not one of its faces.`;
		case 'vertex-in-triangle':
			return `Rule 2: vertex ${name(a)} sits inside triangle ${name(b)}.`;
		case 'edges-cross':
			return `Rule 2: edges ${name(a)} and ${name(b)} cross at a point that is not a vertex.`;
		case 'edges-overlap':
			return `Rule 2: edges ${name(a)} and ${name(b)} lie on top of each other.`;
		case 'edge-through-triangle':
			return `Rule 2: edge ${name(a)} runs through the inside of triangle ${name(b)}.`;
		case 'triangles-overlap':
			return `Rule 2: triangles ${name(a)} and ${name(b)} overlap.`;
		case 'flat-triangle':
			return `Triangle ${name(a)} is squashed flat: its corners lie on one line.`;
		case 'same-point':
			return `Vertices ${name(a)} and ${name(b)} sit on the same spot.`;
	}
}
