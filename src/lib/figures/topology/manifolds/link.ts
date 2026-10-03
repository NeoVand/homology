// The "link" of a point: where a small sphere around the point meets the space.
// For a point of a surface the link is a circle; for a boundary point it is an
// arc; for a crossing of two sheets it is two circles that cross, and so on.
// Patches are parametric maps (u, v) ∈ [0,1]² → ℝ³; we run marching squares
// on d(u, v) = |S(u, v) − centre| − ρ and chain the segments into polylines.

export type V3 = [number, number, number];
export type Patch = { fn: (u: number, v: number) => V3; periodicU?: boolean };

export interface Polyline {
	points: V3[];
	closed: boolean;
}

export function linkOfPatch(patch: Patch, centre: V3, rho: number, nu = 160, nv = 160): Polyline[] {
	const { fn, periodicU = false } = patch;
	const cols = nu + 1;
	const val = new Float64Array(cols * (nv + 1));
	const pos: V3[] = new Array(cols * (nv + 1));
	for (let j = 0; j <= nv; j++)
		for (let i = 0; i <= nu; i++) {
			const p = fn(periodicU && i === nu ? 0 : i / nu, j / nv);
			pos[i + cols * j] = p;
			val[i + cols * j] = Math.hypot(p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]) - rho;
		}
	const at = (i: number, j: number) => val[i + cols * j];
	const P = (i: number, j: number) => pos[i + cols * j];
	// edge ids: horizontal edge (i,j)-(i+1,j) and vertical edge (i,j)-(i,j+1)
	const hId = (i: number, j: number) => 2 * ((periodicU ? i % nu : i) + cols * j);
	const vId = (i: number, j: number) => 2 * ((periodicU ? i % nu : i) + cols * j) + 1;
	const crossPoint = (a: V3, b: V3, va: number, vb: number): V3 => {
		const t = va / (va - vb);
		return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
	};
	const pointOf = new Map<number, V3>();
	const segs: [number, number][] = [];
	const edgePoint = (id: number, i: number, j: number, horiz: boolean) => {
		if (!pointOf.has(id)) {
			if (horiz) pointOf.set(id, crossPoint(P(i, j), P(i + 1, j), at(i, j), at(i + 1, j)));
			else pointOf.set(id, crossPoint(P(i, j), P(i, j + 1), at(i, j), at(i, j + 1)));
		}
		return id;
	};
	for (let j = 0; j < nv; j++)
		for (let i = 0; i < nu; i++) {
			const a = at(i, j); // bottom-left
			const b = at(i + 1, j); // bottom-right
			const c = at(i + 1, j + 1); // top-right
			const d = at(i, j + 1); // top-left
			const ids: number[] = [];
			const sb = a < 0 !== b < 0;
			const sr = b < 0 !== c < 0;
			const st = d < 0 !== c < 0;
			const sl = a < 0 !== d < 0;
			if (sb) ids.push(edgePoint(hId(i, j), i, j, true));
			if (sr) ids.push(edgePoint(vId(i + 1, j), i + 1, j, false));
			if (st) ids.push(edgePoint(hId(i, j + 1), i, j + 1, true));
			if (sl) ids.push(edgePoint(vId(i, j), i, j, false));
			if (ids.length === 2) segs.push([ids[0], ids[1]]);
			else if (ids.length === 4) {
				// saddle: decide by the centre value
				const m = (a + b + c + d) / 4;
				if (m < 0 === a < 0) {
					segs.push([ids[0], ids[1]], [ids[2], ids[3]]);
				} else {
					segs.push([ids[0], ids[3]], [ids[1], ids[2]]);
				}
			}
		}
	// chain segments into polylines
	const adj = new Map<number, number[]>();
	segs.forEach(([x, y], k) => {
		adj.set(x, [...(adj.get(x) ?? []), k]);
		adj.set(y, [...(adj.get(y) ?? []), k]);
	});
	const used = new Uint8Array(segs.length);
	const out: Polyline[] = [];
	const walk = (startId: number, startSeg: number): Polyline => {
		const ids = [startId];
		let cur = startId;
		let seg = startSeg;
		for (;;) {
			used[seg] = 1;
			const [x, y] = segs[seg];
			const nxt = x === cur ? y : x;
			if (nxt === startId) return { points: ids.map((i) => pointOf.get(i)!), closed: true };
			ids.push(nxt);
			cur = nxt;
			const cand = (adj.get(cur) ?? []).find((k) => !used[k]);
			if (cand === undefined) return { points: ids.map((i) => pointOf.get(i)!), closed: false };
			seg = cand;
		}
	};
	// open chains first (start at endpoints of degree 1)
	for (const [id, ks] of adj)
		if (ks.length === 1 && !used[ks[0]]) out.push(walk(id, ks[0]));
	for (let k = 0; k < segs.length; k++) if (!used[k]) out.push(walk(segs[k][0], k));
	return out.filter((pl) => pl.points.length > 2);
}

/** Points where a curve c(s), s ∈ [0,1] (closed), crosses the sphere |x − centre| = ρ. */
export function linkOfCurve(fn: (s: number) => V3, centre: V3, rho: number, n = 2000): V3[] {
	const out: V3[] = [];
	let prevP = fn(0);
	let prev = Math.hypot(prevP[0] - centre[0], prevP[1] - centre[1], prevP[2] - centre[2]) - rho;
	for (let k = 1; k <= n; k++) {
		const p = fn(k / n);
		const v = Math.hypot(p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]) - rho;
		if (prev < 0 !== v < 0) {
			const t = prev / (prev - v);
			out.push([prevP[0] + (p[0] - prevP[0]) * t, prevP[1] + (p[1] - prevP[1]) * t, prevP[2] + (p[2] - prevP[2]) * t]);
		}
		prev = v;
		prevP = p;
	}
	return out;
}

/** Smallest distance between two polylines (by sampled points). */
export function polylineGap(a: V3[], b: V3[]): number {
	let best = Infinity;
	for (const p of a)
		for (const q of b) best = Math.min(best, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]));
	return best;
}
