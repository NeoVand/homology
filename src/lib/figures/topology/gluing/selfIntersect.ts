// Where does a parametrised surface pass through itself? We triangulate the
// (nu × nv) grid, bucket triangles in a spatial hash, and intersect every pair of
// nearby triangles that do not touch. Each crossing contributes a little segment;
// together they trace the double curve (drawn in rose on the Klein bottle and
// Boy's surface).

type Vec = [number, number, number];

const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/**
 * The segment where triangle (p0,p1,p2) crosses the plane n·x = d, as its two
 * end points, or null. Signed distances of the vertices are given in s.
 */
function clipToPlane(P: Vec[], s: number[]): [Vec, Vec] | null {
	const pts: Vec[] = [];
	for (let i = 0; i < 3; i++) {
		const j = (i + 1) % 3;
		const a = s[i];
		const b = s[j];
		if (a === 0) pts.push(P[i]);
		if ((a < 0 && b > 0) || (a > 0 && b < 0)) {
			const t = a / (a - b);
			pts.push([P[i][0] + t * (P[j][0] - P[i][0]), P[i][1] + t * (P[j][1] - P[i][1]), P[i][2] + t * (P[j][2] - P[i][2])]);
		}
	}
	if (pts.length < 2) return null;
	return [pts[0], pts[1]];
}

/** Intersection segment of two triangles (if they cross), else null. */
export function triTri(A: Vec[], B: Vec[]): [Vec, Vec] | null {
	const nB = cross(sub(B[1], B[0]), sub(B[2], B[0]));
	const dB = dot(nB, B[0]);
	const sA = A.map((p) => dot(nB, p) - dB);
	const eps = 1e-12 * (Math.abs(dB) + 1);
	if ((sA[0] > eps && sA[1] > eps && sA[2] > eps) || (sA[0] < -eps && sA[1] < -eps && sA[2] < -eps)) return null;
	const nA = cross(sub(A[1], A[0]), sub(A[2], A[0]));
	const dA = dot(nA, A[0]);
	const sB = B.map((p) => dot(nA, p) - dA);
	if ((sB[0] > eps && sB[1] > eps && sB[2] > eps) || (sB[0] < -eps && sB[1] < -eps && sB[2] < -eps)) return null;
	const segA = clipToPlane(A, sA);
	const segB = clipToPlane(B, sB);
	if (!segA || !segB) return null;
	// both segments lie on the common line; overlap them along its direction
	const D = cross(nA, nB);
	const dd = dot(D, D);
	if (dd < 1e-20) return null; // coplanar: ignore
	const ta = [dot(D, segA[0]), dot(D, segA[1])];
	const tb = [dot(D, segB[0]), dot(D, segB[1])];
	const a0 = Math.min(ta[0], ta[1]);
	const a1 = Math.max(ta[0], ta[1]);
	const b0 = Math.min(tb[0], tb[1]);
	const b1 = Math.max(tb[0], tb[1]);
	const lo = Math.max(a0, b0);
	const hi = Math.min(a1, b1);
	if (hi <= lo) return null;
	const at = (t: number): Vec => {
		// point on segA with D-coordinate t
		const [p, q] = ta[0] <= ta[1] ? [segA[0], segA[1]] : [segA[1], segA[0]];
		const tp = Math.min(ta[0], ta[1]);
		const tq = Math.max(ta[0], ta[1]);
		const f = tq - tp > 1e-30 ? (t - tp) / (tq - tp) : 0;
		return [p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1]), p[2] + f * (q[2] - p[2])];
	};
	return [at(lo), at(hi)];
}

/**
 * Self-intersection segments of a grid surface. `pos` holds (nu+1)(nv+1) xyz
 * points in row-major order (row = v). Triangles that share a vertex position
 * (neighbours, or neighbours across a glued seam) are never compared.
 * Returns a flat array of segment end points (6 numbers per segment). If `pairs`
 * is given, the indices of each crossing pair of triangles are pushed onto it
 * (triangle 2k and 2k+1 lie in grid cell k = j·nu + i).
 */
export function selfIntersections(pos: ArrayLike<number>, nu: number, nv: number, pairs?: number[]): number[] {
	const P = (i: number, j: number): Vec => {
		const k = 3 * (j * (nu + 1) + i);
		return [pos[k], pos[k + 1], pos[k + 2]];
	};
	// triangles
	const tris: Vec[][] = [];
	for (let j = 0; j < nv; j++)
		for (let i = 0; i < nu; i++) {
			const a = P(i, j),
				b = P(i + 1, j),
				c = P(i, j + 1),
				d = P(i + 1, j + 1);
			tris.push([a, b, d], [a, d, c]);
		}
	// spatial hash on a grid of cells about twice the typical triangle size
	let minx = Infinity,
		miny = Infinity,
		minz = Infinity,
		maxx = -Infinity,
		maxy = -Infinity,
		maxz = -Infinity;
	let edgeSum = 0;
	for (const t of tris) {
		for (const p of t) {
			if (p[0] < minx) minx = p[0];
			if (p[1] < miny) miny = p[1];
			if (p[2] < minz) minz = p[2];
			if (p[0] > maxx) maxx = p[0];
			if (p[1] > maxy) maxy = p[1];
			if (p[2] > maxz) maxz = p[2];
		}
		edgeSum += Math.hypot(t[1][0] - t[0][0], t[1][1] - t[0][1], t[1][2] - t[0][2]);
	}
	const cell = Math.max(1e-6, (2 * edgeSum) / tris.length);
	const key = (x: number, y: number, z: number) => `${x},${y},${z}`;
	const buckets = new Map<string, number[]>();
	const boxes: number[][] = [];
	tris.forEach((t, idx) => {
		const lo = [0, 1, 2].map((k) => Math.min(t[0][k], t[1][k], t[2][k]));
		const hi = [0, 1, 2].map((k) => Math.max(t[0][k], t[1][k], t[2][k]));
		boxes.push([...lo, ...hi]);
		const i0 = Math.floor((lo[0] - minx) / cell),
			i1 = Math.floor((hi[0] - minx) / cell);
		const j0 = Math.floor((lo[1] - miny) / cell),
			j1 = Math.floor((hi[1] - miny) / cell);
		const k0 = Math.floor((lo[2] - minz) / cell),
			k1 = Math.floor((hi[2] - minz) / cell);
		for (let i = i0; i <= i1; i++)
			for (let j = j0; j <= j1; j++)
				for (let k = k0; k <= k1; k++) {
					const kk = key(i, j, k);
					let b = buckets.get(kk);
					if (!b) buckets.set(kk, (b = []));
					b.push(idx);
				}
	});
	void maxx;
	void maxy;
	void maxz;
	const tol = cell * 1e-3;
	const near = (p: Vec, q: Vec) => Math.abs(p[0] - q[0]) < tol && Math.abs(p[1] - q[1]) < tol && Math.abs(p[2] - q[2]) < tol;
	const touches = (A: Vec[], B: Vec[]) => {
		for (const a of A) for (const b of B) if (near(a, b)) return true;
		return false;
	};
	const seen = new Set<number>();
	const out: number[] = [];
	const n = tris.length;
	for (const list of buckets.values()) {
		for (let x = 0; x < list.length; x++)
			for (let y = x + 1; y < list.length; y++) {
				const ia = list[x];
				const ib = list[y];
				const pairKey = ia < ib ? ia * n + ib : ib * n + ia;
				if (seen.has(pairKey)) continue;
				seen.add(pairKey);
				const A = boxes[ia];
				const B = boxes[ib];
				if (A[3] < B[0] || B[3] < A[0] || A[4] < B[1] || B[4] < A[1] || A[5] < B[2] || B[5] < A[2]) continue;
				const TA = tris[ia];
				const TB = tris[ib];
				if (touches(TA, TB)) continue;
				const s = triTri(TA, TB);
				if (s) {
					out.push(...s[0], ...s[1]);
					pairs?.push(ia, ib);
				}
			}
	}
	return out;
}
