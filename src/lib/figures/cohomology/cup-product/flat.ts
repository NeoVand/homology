// Flat pictures of glued polygons (torus, Klein bottle, projective plane, the
// genus-2 octagon) as Δ-complexes, plus "fences": curves drawn on the picture,
// turned into 1-cochains by counting how often each edge crosses them.
//
// Sign conventions (stated in the chapter):
//   • a fence is an oriented curve; its co-orientation n points to its RIGHT
//     (n = τ rotated by −90°). An edge crossing the fence in the direction of n
//     (from the fence's left side to its right side) contributes +1.
//   • at a crossing of two oriented curves F, G the local intersection sign is
//     sign det[τ_F, τ_G]  (+1 when G passes from F's right to F's left).
import { validate, type Delta2 } from './cup';

export type Pt = [number, number];

export interface SideSpec {
	label: string;
	/** +1: the gluing arrow runs along the counterclockwise traversal of this side; −1: against it */
	dir: 1 | -1;
	/** index of the partner side */
	pair: number;
}

export interface FlatModel {
	D: Delta2;
	/** polygon corners, counterclockwise; side i runs from polygon[i] to polygon[i+1] */
	polygon: Pt[];
	sides: SideSpec[];
	/** flat corners of each triangle, listed in the triangle's vertex order [v0, v1, v2] */
	triPts: [Pt, Pt, Pt][];
	/** +1 if the triangle's vertex order runs counterclockwise in the picture */
	triFlatSign: number[];
	/** the distinct flat segments of each edge, oriented tail → head; side = −1 for interior */
	edgeSegs: { a: Pt; b: Pt; side: number }[][];
	/** every flat position of each vertex */
	vertexPts: Pt[][];
	/** the gluing map on the boundary (null for interior points) */
	glue(p: Pt): Pt | null;
}

const EPS = 1e-9;
const keyOf = (p: Pt) => `${p[0].toFixed(7)},${p[1].toFixed(7)}`;
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const cross = (a: Pt, b: Pt) => a[0] * b[1] - a[1] * b[0];
const dot = (a: Pt, b: Pt) => a[0] * b[0] + a[1] * b[1];

/** Where on side s (0 … 1 along the gluing arrow) the point p lies, or null. */
function sideParam(polygon: Pt[], sides: SideSpec[], s: number, p: Pt): number | null {
	const a = polygon[s];
	const b = polygon[(s + 1) % polygon.length];
	const d = sub(b, a);
	const len2 = dot(d, d);
	const t = dot(sub(p, a), d) / len2;
	if (t < -EPS || t > 1 + EPS) return null;
	const off = cross(d, sub(p, a)) / Math.sqrt(len2);
	if (Math.abs(off) > 1e-7) return null;
	return sides[s].dir === 1 ? t : 1 - t;
}

function sidePoint(polygon: Pt[], sides: SideSpec[], s: number, lambda: number): Pt {
	const a = polygon[s];
	const b = polygon[(s + 1) % polygon.length];
	const t = sides[s].dir === 1 ? lambda : 1 - lambda;
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

class UF {
	parent = new Map<string, string>();
	find(x: string): string {
		if (!this.parent.has(x)) this.parent.set(x, x);
		let r = x;
		while (this.parent.get(r) !== r) r = this.parent.get(r)!;
		let y = x;
		while (this.parent.get(y) !== r) {
			const n = this.parent.get(y)!;
			this.parent.set(y, r);
			y = n;
		}
		return r;
	}
	union(a: string, b: string) {
		const ra = this.find(a);
		const rb = this.find(b);
		if (ra !== rb) this.parent.set(ra, rb);
	}
}

/**
 * Glue a triangulated polygon into a Δ-complex.
 * order 'given': each flat triangle is already listed as [v0, v1, v2];
 * order 'sorted': triangles are re-ordered by vertex id (an ordered simplicial complex).
 */
export function glueFlat(polygon: Pt[], sides: SideSpec[], flatTris: [Pt, Pt, Pt][], order: 'given' | 'sorted'): FlatModel {
	const glue = (p: Pt): Pt | null => {
		for (let s = 0; s < sides.length; s++) {
			const lam = sideParam(polygon, sides, s, p);
			if (lam !== null) return sidePoint(polygon, sides, sides[s].pair, lam);
		}
		return null;
	};
	const glueAll = (p: Pt): Pt[] => {
		const out: Pt[] = [];
		for (let s = 0; s < sides.length; s++) {
			const lam = sideParam(polygon, sides, s, p);
			if (lam !== null) out.push(sidePoint(polygon, sides, sides[s].pair, lam));
		}
		return out;
	};

	// 1. vertices: flat points modulo the gluing
	const pts = new Map<string, Pt>();
	for (const t of flatTris) for (const p of t) pts.set(keyOf(p), p);
	const vuf = new UF();
	for (const [k, p] of pts) {
		vuf.find(k);
		for (const q of glueAll(p)) vuf.union(k, keyOf(q));
	}
	const vid = new Map<string, number>();
	const vertexPts: Pt[][] = [];
	for (const [k, p] of pts) {
		const r = vuf.find(k);
		if (!vid.has(r)) {
			vid.set(r, vertexPts.length);
			vertexPts.push([]);
		}
		vertexPts[vid.get(r)!].push(p);
	}
	const V = (p: Pt) => vid.get(vuf.find(keyOf(p)))!;

	// 2. order each triangle
	const tris: [Pt, Pt, Pt][] = flatTris.map((t) => {
		if (order === 'given') return t;
		const s = [...t].sort((a, b) => V(a) - V(b)) as [Pt, Pt, Pt];
		if (V(s[0]) === V(s[1]) || V(s[1]) === V(s[2])) throw new Error('triangle with a repeated vertex cannot be sorted');
		return s;
	});

	// 3. edges: flat segments modulo the gluing, with a consistent direction
	const segKey = (a: Pt, b: Pt) => [keyOf(a), keyOf(b)].sort().join('|');
	const dirOf = new Map<string, [Pt, Pt]>(); // directed flat segment, from the triangles
	const sideOfSeg = new Map<string, number>();
	for (const [p0, p1, p2] of tris) {
		for (const [a, b] of [
			[p0, p1],
			[p1, p2],
			[p0, p2]
		] as [Pt, Pt][]) {
			const k = segKey(a, b);
			const prev = dirOf.get(k);
			if (prev && keyOf(prev[0]) !== keyOf(a)) throw new Error(`interior edge ${k} oriented both ways`);
			dirOf.set(k, [a, b]);
			const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
			for (let s = 0; s < sides.length; s++) if (sideParam(polygon, sides, s, mid) !== null) sideOfSeg.set(k, s);
		}
	}
	const euf = new UF();
	for (const [k, [a, b]] of dirOf) {
		euf.find(k);
		if (!sideOfSeg.has(k)) continue;
		const s = sideOfSeg.get(k)!;
		const la = sideParam(polygon, sides, s, a)!;
		const lb = sideParam(polygon, sides, s, b)!;
		const ga = sidePoint(polygon, sides, sides[s].pair, la);
		const gb = sidePoint(polygon, sides, sides[s].pair, lb);
		const pk = segKey(ga, gb);
		const partner = dirOf.get(pk);
		if (!partner) throw new Error(`no partner for boundary edge ${k}`);
		if (keyOf(partner[0]) !== keyOf(ga)) throw new Error(`boundary edges ${k} and ${pk} glued against their orientations`);
		euf.union(k, pk);
	}
	const eid = new Map<string, number>();
	const edges: [number, number][] = [];
	const edgeSegs: { a: Pt; b: Pt; side: number }[][] = [];
	for (const [k, [a, b]] of dirOf) {
		const r = euf.find(k);
		if (!eid.has(r)) {
			eid.set(r, edges.length);
			edges.push([V(a), V(b)]);
			edgeSegs.push([]);
		}
		edgeSegs[eid.get(r)!].push({ a, b, side: sideOfSeg.get(k) ?? -1 });
	}
	const E = (a: Pt, b: Pt) => eid.get(euf.find(segKey(a, b)))!;
	const D: Delta2 = {
		nV: vertexPts.length,
		edges,
		tris: tris.map(([p0, p1, p2]) => [E(p0, p1), E(p1, p2), E(p0, p2)] as [number, number, number])
	};
	validate(D);
	return {
		D,
		polygon,
		sides,
		triPts: tris,
		triFlatSign: tris.map(([p0, p1, p2]) => Math.sign(cross(sub(p1, p0), sub(p2, p0)))),
		edgeSegs,
		vertexPts,
		glue
	};
}

// ── the standard models ────────────────────────────────────────────────────

export const SQUARE: Pt[] = [
	[0, 0],
	[1, 0],
	[1, 1],
	[0, 1]
];

/**
 * Side gluings of the unit square, matching the GluingSquare presets
 * (side 0 = bottom, 1 = right, 2 = top, 3 = left, traversed counterclockwise).
 */
export const squareSides: Record<'torus' | 'klein' | 'rp2', SideSpec[]> = {
	// bottom a →, top a →, left b ↑, right b ↑      word a b a⁻¹ b⁻¹
	torus: [
		{ label: 'a', dir: 1, pair: 2 },
		{ label: 'b', dir: 1, pair: 3 },
		{ label: 'a', dir: -1, pair: 0 },
		{ label: 'b', dir: -1, pair: 1 }
	],
	// bottom a →, top a →, left b ↑, right b ↓      (x,0)~(x,1), (0,y)~(1,1−y)
	klein: [
		{ label: 'a', dir: 1, pair: 2 },
		{ label: 'b', dir: -1, pair: 3 },
		{ label: 'a', dir: -1, pair: 0 },
		{ label: 'b', dir: -1, pair: 1 }
	],
	// bottom a →, top a ←, left b ↓, right b ↑      word a b a b (antipodal)
	rp2: [
		{ label: 'a', dir: 1, pair: 2 },
		{ label: 'b', dir: 1, pair: 3 },
		{ label: 'a', dir: 1, pair: 0 },
		{ label: 'b', dir: 1, pair: 1 }
	]
};

/** The n×n grid of the unit square, each cell split by its diagonal (i,j)→(i+1,j+1). */
export function gridTriangles(n: number): [Pt, Pt, Pt][] {
	const P = (i: number, j: number): Pt => [i / n, j / n];
	const out: [Pt, Pt, Pt][] = [];
	for (let j = 0; j < n; j++)
		for (let i = 0; i < n; i++) {
			out.push([P(i, j), P(i + 1, j), P(i + 1, j + 1)]); // L: right, then up
			out.push([P(i, j), P(i, j + 1), P(i + 1, j + 1)]); // U: up, then right
		}
	return out;
}

/**
 * Square models. The torus grid keeps the translation-invariant ordering
 * (every edge points right, up, or up-right); the Klein bottle and projective
 * plane cannot (the twisted seams forbid it), so they are ordered by vertex id.
 */
export function squareModel(kind: 'torus' | 'klein' | 'rp2', n = 3): FlatModel {
	return glueFlat(SQUARE, squareSides[kind], gridTriangles(n), kind === 'torus' ? 'given' : 'sorted');
}

/** A regular m-gon, counterclockwise; by default side 0 sits at the bottom. */
export function regularPolygon(m: number, r = 1, start = -Math.PI / 2 - Math.PI / m): Pt[] {
	return Array.from({ length: m }, (_, i) => [r * Math.cos(start + (2 * Math.PI * i) / m), r * Math.sin(start + (2 * Math.PI * i) / m)] as Pt);
}

/** Fan triangulation from the centre: triangles [c, tail, head] for each side. */
export function fanModel(polygon: Pt[], sides: SideSpec[], center: Pt = [0, 0]): FlatModel {
	const tris = polygon.map((p, i) => {
		const q = polygon[(i + 1) % polygon.length];
		return (sides[i].dir === 1 ? [center, p, q] : [center, q, p]) as [Pt, Pt, Pt];
	});
	return glueFlat(polygon, sides, tris, 'given');
}

/** The genus-2 octagon a₁ b₁ a₁⁻¹ b₁⁻¹ a₂ b₂ a₂⁻¹ b₂⁻¹. */
export const octagonSides: SideSpec[] = [
	{ label: 'a_1', dir: 1, pair: 2 },
	{ label: 'b_1', dir: 1, pair: 3 },
	{ label: 'a_1', dir: -1, pair: 0 },
	{ label: 'b_1', dir: -1, pair: 1 },
	{ label: 'a_2', dir: 1, pair: 6 },
	{ label: 'b_2', dir: 1, pair: 7 },
	{ label: 'a_2', dir: -1, pair: 4 },
	{ label: 'b_2', dir: -1, pair: 5 }
];

export function genus2Model(): FlatModel {
	return fanModel(regularPolygon(8), octagonSides);
}

// ── fences ─────────────────────────────────────────────────────────────────

/**
 * Intersection of segments p→p2 and q→q2: parameters (s on p, t on q), or null.
 * Segments of polylines are half-open, [start, end), so that a crossing exactly
 * at a shared sample point is counted once (`halfOpenP/Q`); otherwise both ends
 * are excluded.
 */
export function segIntersect(p: Pt, p2: Pt, q: Pt, q2: Pt, halfOpenP = false, halfOpenQ = false): { s: number; t: number } | null {
	const r = sub(p2, p);
	const d = sub(q2, q);
	const den = cross(r, d);
	if (Math.abs(den) < 1e-14) return null;
	const qp = sub(q, p);
	const s = cross(qp, d) / den;
	const t = cross(qp, r) / den;
	const e = 1e-12;
	if ((halfOpenP ? s < -e : s <= e) || s >= 1 - e) return null;
	if ((halfOpenQ ? t < -e : t <= e) || t >= 1 - e) return null;
	return { s, t };
}

/** Lengthen a polyline by `e` at both ends (so its ends poke just outside the polygon). */
function extend(arc: Pt[], e = 1e-6): Pt[] {
	if (arc.length < 2) return arc;
	const out = arc.map((p) => [p[0], p[1]] as Pt);
	const d0 = sub(out[0], out[1]);
	const l0 = Math.hypot(d0[0], d0[1]) || 1;
	out[0] = [out[0][0] + (d0[0] / l0) * e, out[0][1] + (d0[1] / l0) * e];
	const n = out.length - 1;
	const d1 = sub(out[n], out[n - 1]);
	const l1 = Math.hypot(d1[0], d1[1]) || 1;
	out[n] = [out[n][0] + (d1[0] / l1) * e, out[n][1] + (d1[1] / l1) * e];
	return out;
}

function outwardNormal(polygon: Pt[], s: number): Pt {
	const a = polygon[s];
	const b = polygon[(s + 1) % polygon.length];
	const d = sub(b, a);
	const l = Math.hypot(d[0], d[1]);
	return [d[1] / l, -d[0] / l]; // right of a counterclockwise boundary = outside
}

/**
 * The 1-cochain of a fence: for each edge, the signed number of times it
 * crosses the fence (from the fence's left to its right counts +1).
 * A fence is a list of arcs (polylines); an arc that leaves the polygon through
 * a side continues as another arc entering through the partner side. Each
 * boundary crossing is counted once, where the fence leaves.
 */
export function fenceCochain(M: FlatModel, arcs: Pt[][], signed = true): number[] {
	const out = new Array<number>(M.D.edges.length).fill(0);
	const ext = arcs.map((a) => extend(a));
	M.edgeSegs.forEach((segs, e) => {
		for (const seg of segs) {
			const ed = sub(seg.b, seg.a);
			const outward = seg.side >= 0 ? outwardNormal(M.polygon, seg.side) : null;
			for (const arc of ext)
				for (let i = 0; i + 1 < arc.length; i++) {
					const hit = segIntersect(arc[i], arc[i + 1], seg.a, seg.b, i > 0, false);
					if (!hit) continue;
					const tau = sub(arc[i + 1], arc[i]);
					if (outward && dot(tau, outward) <= 0) continue; // entering: counted at the exit
					const right: Pt = [tau[1], -tau[0]];
					out[e] += signed ? Math.sign(dot(ed, right)) : 1;
				}
		}
	});
	return signed ? out.map((x) => x || 0) : out.map((x) => x % 2);
}

/** Crossing points of two fences, with the sign det[τ_F, τ_G]. */
export function arcCrossings(F: Pt[][], G: Pt[][]): { p: Pt; sign: number }[] {
	const out: { p: Pt; sign: number }[] = [];
	for (const a of F)
		for (let i = 0; i + 1 < a.length; i++)
			for (const b of G)
				for (let j = 0; j + 1 < b.length; j++) {
					const hit = segIntersect(a[i], a[i + 1], b[j], b[j + 1], true, true);
					if (!hit) continue;
					const p: Pt = [a[i][0] + (a[i + 1][0] - a[i][0]) * hit.s, a[i][1] + (a[i + 1][1] - a[i][1]) * hit.s];
					out.push({ p, sign: Math.sign(cross(sub(a[i + 1], a[i]), sub(b[j + 1], b[j]))) });
				}
	return out;
}

/** A chord from the point at parameter λ on side `from` (entering) to its partner point on the paired side (leaving). */
export function chord(M: FlatModel, from: number, lambda: number, via: Pt[] = []): Pt[] {
	const start = sidePoint(M.polygon, M.sides, from, lambda);
	const end = sidePoint(M.polygon, M.sides, M.sides[from].pair, lambda);
	return [start, ...via, end];
}

// ── curves on the square torus ℝ²/ℤ² ───────────────────────────────────────

const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));

/**
 * Cut a curve in the plane (a polyline whose end is its start shifted by an
 * integer vector) into arcs inside the unit square.
 */
export function wrapToSquare(path: Pt[]): Pt[][] {
	const arcs: Pt[][] = [];
	let cur: Pt[] = [];
	const cell = (p: Pt, q: Pt): Pt => [Math.floor((p[0] + q[0]) / 2), Math.floor((p[1] + q[1]) / 2)];
	for (let i = 0; i + 1 < path.length; i++) {
		const p = path[i];
		const q = path[i + 1];
		// split the segment where it crosses integer grid lines
		const ts: number[] = [0, 1];
		for (const k of [0, 1] as const) {
			const lo = Math.min(p[k], q[k]);
			const hi = Math.max(p[k], q[k]);
			for (let m = Math.ceil(lo); m <= Math.floor(hi); m++) {
				if (Math.abs(q[k] - p[k]) < 1e-15) continue;
				const t = (m - p[k]) / (q[k] - p[k]);
				if (t > 1e-12 && t < 1 - 1e-12) ts.push(t);
			}
		}
		ts.sort((a, b) => a - b);
		for (let j = 0; j + 1 < ts.length; j++) {
			const a: Pt = [p[0] + (q[0] - p[0]) * ts[j], p[1] + (q[1] - p[1]) * ts[j]];
			const b: Pt = [p[0] + (q[0] - p[0]) * ts[j + 1], p[1] + (q[1] - p[1]) * ts[j + 1]];
			const [cx, cy] = cell(a, b);
			const A: Pt = [a[0] - cx, a[1] - cy];
			const B: Pt = [b[0] - cx, b[1] - cy];
			if (cur.length && (Math.abs(cur[cur.length - 1][0] - A[0]) > 1e-9 || Math.abs(cur[cur.length - 1][1] - A[1]) > 1e-9)) {
				arcs.push(cur);
				cur = [];
			}
			if (!cur.length) cur.push(A);
			cur.push(B);
		}
	}
	if (cur.length) arcs.push(cur);
	// glue the last arc to the first if the curve closes up inside the square
	if (arcs.length > 1) {
		const f = arcs[0][0];
		const l = arcs[arcs.length - 1][arcs[arcs.length - 1].length - 1];
		if (Math.abs(f[0] - l[0]) < 1e-9 && Math.abs(f[1] - l[1]) < 1e-9) {
			const last = arcs.pop()!;
			arcs[0] = [...last, ...arcs[0].slice(1)];
		}
	}
	return arcs;
}

/**
 * The straight closed curve of class (p, q) on the torus through (x0, y0):
 * p times around in x, q times around in y. If gcd(p, q) = g > 1 it is drawn
 * as g parallel circles of class (p/g, q/g).
 */
export function torusLine(p: number, q: number, x0 = 0.137, y0 = 0.291): Pt[][] {
	if (!p && !q) return [];
	const g = gcd(p, q);
	const pp = p / g;
	const qq = q / g;
	// a vector w with det[(pp,qq), w] = 1, to space the parallel copies
	let w: Pt = [0, 0];
	for (let r = -6; r <= 6 && !w[0] && !w[1]; r++)
		for (let s = -6; s <= 6; s++)
			if (pp * s - qq * r === 1) {
				w = [r, s];
				break;
			}
	const arcs: Pt[][] = [];
	for (let k = 0; k < g; k++) {
		const bx = x0 + (w[0] * k) / g;
		const by = y0 + (w[1] * k) / g;
		arcs.push(...wrapToSquare([
			[bx, by],
			[bx + pp, by + qq]
		]));
	}
	return arcs;
}

/** Sample a closed curve t ↦ c(t), t ∈ [0, 1], whose end is its start + (p, q). */
export function samplePath(c: (t: number) => Pt, n = 240): Pt[] {
	return Array.from({ length: n + 1 }, (_, i) => c(i / n));
}
