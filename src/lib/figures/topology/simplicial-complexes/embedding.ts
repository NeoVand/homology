// Exact checks that a list of triangles in ℝ³ (integer coordinates) is
// *embedded*: any two triangles meet exactly in their common face (a shared
// edge, a shared vertex, or nothing). Used by the tests to certify Császár's
// polyhedron; all predicates are exact for small integer coordinates.
export type P3 = [number, number, number];

const sub = (a: P3, b: P3): P3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: P3, b: P3): P3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: P3, b: P3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);

/** sign of the volume of the tetrahedron (a, b, c, d) */
export function orient3d(a: P3, b: P3, c: P3, d: P3): number {
	return sign(dot(cross(sub(b, a), sub(c, a)), sub(d, a)));
}

/** Drop the coordinate along which the triangle's normal is largest. */
function projector(a: P3, b: P3, c: P3) {
	const n = cross(sub(b, a), sub(c, a)).map(Math.abs);
	const drop = n[0] >= n[1] && n[0] >= n[2] ? 0 : n[1] >= n[2] ? 1 : 2;
	return (p: P3): [number, number] => (drop === 0 ? [p[1], p[2]] : drop === 1 ? [p[0], p[2]] : [p[0], p[1]]);
}

const orient2d = (a: number[], b: number[], c: number[]) =>
	sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]));

function onSegment2d(p: number[], a: number[], b: number[]) {
	return (
		orient2d(a, b, p) === 0 &&
		Math.min(a[0], b[0]) <= p[0] &&
		p[0] <= Math.max(a[0], b[0]) &&
		Math.min(a[1], b[1]) <= p[1] &&
		p[1] <= Math.max(a[1], b[1])
	);
}

function segmentsIntersect2d(p: number[], q: number[], a: number[], b: number[]) {
	const o1 = orient2d(p, q, a);
	const o2 = orient2d(p, q, b);
	const o3 = orient2d(a, b, p);
	const o4 = orient2d(a, b, q);
	if (o1 !== o2 && o3 !== o4 && o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0) return true;
	return onSegment2d(a, p, q) || onSegment2d(b, p, q) || onSegment2d(p, a, b) || onSegment2d(q, a, b);
}

function pointInTriangle2d(p: number[], a: number[], b: number[], c: number[]) {
	const s1 = orient2d(a, b, p);
	const s2 = orient2d(b, c, p);
	const s3 = orient2d(c, a, p);
	const hasNeg = s1 < 0 || s2 < 0 || s3 < 0;
	const hasPos = s1 > 0 || s2 > 0 || s3 > 0;
	return !(hasNeg && hasPos);
}

/** Does the closed segment pq meet the closed triangle abc? */
export function segmentMeetsTriangle(p: P3, q: P3, a: P3, b: P3, c: P3): boolean {
	const op = orient3d(a, b, c, p);
	const oq = orient3d(a, b, c, q);
	if (op !== 0 && op === oq) return false;
	if (op === 0 && oq === 0) {
		const pr = projector(a, b, c);
		const [P, Q, A, B, C] = [p, q, a, b, c].map(pr);
		return (
			pointInTriangle2d(P, A, B, C) ||
			pointInTriangle2d(Q, A, B, C) ||
			segmentsIntersect2d(P, Q, A, B) ||
			segmentsIntersect2d(P, Q, B, C) ||
			segmentsIntersect2d(P, Q, C, A)
		);
	}
	// the segment crosses (or touches) the plane at one point; is it inside abc?
	const s1 = orient3d(p, q, a, b);
	const s2 = orient3d(p, q, b, c);
	const s3 = orient3d(p, q, c, a);
	const hasNeg = s1 < 0 || s2 < 0 || s3 < 0;
	const hasPos = s1 > 0 || s2 > 0 || s3 > 0;
	return !(hasNeg && hasPos);
}

/**
 * Does the half-open segment (v, w] (v excluded) meet the closed triangle
 * (v, b, c), which has v as a corner?
 */
function rayFromCornerMeets(v: P3, w: P3, b: P3, c: P3): boolean {
	if (orient3d(v, b, c, w) !== 0) return false; // leaves the plane at once
	const pr = projector(v, b, c);
	const [V, W, B, C] = [v, w, b, c].map(pr);
	const d = [W[0] - V[0], W[1] - V[1]];
	const e1 = [B[0] - V[0], B[1] - V[1]];
	const e2 = [C[0] - V[0], C[1] - V[1]];
	const cr = (x: number[], y: number[]) => x[0] * y[1] - x[1] * y[0];
	const turn = sign(cr(e1, e2));
	// d lies in the closed cone spanned by e1, e2 (an angle < 180°) seen from v:
	// then the segment enters the triangle immediately; otherwise it never does
	return sign(cr(e1, d)) * turn >= 0 && sign(cr(d, e2)) * turn >= 0;
}

export interface EmbeddingReport {
	ok: boolean;
	problems: string[];
}

/** Check that the triangles (vertex ids into pos) form an embedded surface. */
export function checkEmbedding(pos: P3[], tris: number[][]): EmbeddingReport {
	const problems: string[] = [];
	for (const t of tris) {
		const n = cross(sub(pos[t[1]], pos[t[0]]), sub(pos[t[2]], pos[t[0]]));
		if (n[0] === 0 && n[1] === 0 && n[2] === 0) problems.push(`degenerate triangle ${t}`);
	}
	for (let i = 0; i < tris.length; i++)
		for (let j = i + 1; j < tris.length; j++) {
			const A = tris[i];
			const B = tris[j];
			const shared = A.filter((v) => B.includes(v));
			const meet = (T: number[], U: number[]): boolean => {
				// does some edge of T meet U outside the common face?
				const [a, b, c] = U.map((v) => pos[v]);
				for (let k = 0; k < 3; k++) {
					const x = T[k];
					const y = T[(k + 1) % 3];
					const xs = shared.includes(x);
					const ys = shared.includes(y);
					if (xs && ys) continue; // the shared edge itself
					if (!xs && !ys) {
						if (segmentMeetsTriangle(pos[x], pos[y], a, b, c)) return true;
					} else {
						const v = xs ? x : y;
						const w = xs ? y : x;
						// rotate U so that v is its first corner
						const r = U.indexOf(v);
						const u1 = U[(r + 1) % 3];
						const u2 = U[(r + 2) % 3];
						if (rayFromCornerMeets(pos[v], pos[w], pos[u1], pos[u2])) return true;
					}
				}
				return false;
			};
			if (meet(A, B) || meet(B, A)) problems.push(`triangles ${A} and ${B} meet outside their common face (${shared})`);
		}
	return { ok: problems.length === 0, problems };
}
