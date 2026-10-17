// From knots in space to knot diagrams. A knot (or link) is given as closed
// polylines in 3D; we look at it from above (down the z-axis), find where the
// shadows of two strands cross and which strand is on top, and record the
// result as a PD code — the list of crossings, each naming the four strand
// pieces that meet there. Every invariant in invariants.ts is computed from it.

export type V3 = [number, number, number];
export type V2 = [number, number];
/** X[i, j, k, l]: i is the incoming under-strand piece, then j, k, l counterclockwise; k is the outgoing under-strand piece */
export type PD = [number, number, number, number];

export interface Pass {
	crossing: number;
	over: boolean;
	/** position along the component's polyline: segment index + fraction */
	at: number;
}

export interface Diagram {
	pd: PD[];
	/** +1 for a right-handed crossing, −1 for a left-handed one */
	signs: number[];
	writhe: number;
	/** number of components */
	components: number;
	/** components that cross nothing at all (each a separate round loop in the diagram) */
	freeLoops: number;
	/** the component each strand piece (edge label 1…E) belongs to */
	edgeComp: Map<number, number>;
	/** for each crossing, the two components meeting there [over, under] */
	crossComps: [number, number][];
	/** where each crossing sits in the plane */
	at: V2[];
	/** each component's passes through crossings, in order along it */
	passes: Pass[][];
}

const cross2 = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];

/**
 * The diagram of a link seen from above. `comps` are closed polylines (the
 * last point joins the first). The projection must be generic: no three
 * strands through one point and no tangencies, which smooth curves in general
 * position satisfy.
 */
export function diagramOf(comps: V3[][]): Diagram {
	type Hit = { ca: number; sa: number; cb: number; sb: number; za: number; zb: number; p: V2; da: V2; db: V2 };
	const hits: Hit[] = [];
	const segs = comps.map((pts) =>
		pts.map((p, i) => {
			const q = pts[(i + 1) % pts.length];
			return { p, q, minx: Math.min(p[0], q[0]), maxx: Math.max(p[0], q[0]), miny: Math.min(p[1], q[1]), maxy: Math.max(p[1], q[1]) };
		})
	);
	for (let ca = 0; ca < comps.length; ca++)
		for (let cb = ca; cb < comps.length; cb++) {
			const A = segs[ca];
			const B = segs[cb];
			for (let i = 0; i < A.length; i++) {
				const a = A[i];
				for (let j = ca === cb ? i + 2 : 0; j < B.length; j++) {
					if (ca === cb && i === 0 && j === A.length - 1) continue; // neighbours across the seam
					const b = B[j];
					if (a.maxx < b.minx || b.maxx < a.minx || a.maxy < b.miny || b.maxy < a.miny) continue;
					const r: V2 = [a.q[0] - a.p[0], a.q[1] - a.p[1]];
					const s: V2 = [b.q[0] - b.p[0], b.q[1] - b.p[1]];
					const den = cross2(r, s);
					if (Math.abs(den) < 1e-14) continue;
					const w: V2 = [b.p[0] - a.p[0], b.p[1] - a.p[1]];
					const t = cross2(w, s) / den;
					const u = cross2(w, r) / den;
					// half-open, so a crossing exactly at a vertex is counted once
					if (t < 0 || t >= 1 || u < 0 || u >= 1) continue;
					hits.push({
						ca,
						sa: i + t,
						cb,
						sb: j + u,
						za: a.p[2] + t * (a.q[2] - a.p[2]),
						zb: b.p[2] + u * (b.q[2] - b.p[2]),
						p: [a.p[0] + t * r[0], a.p[1] + t * r[1]],
						da: r,
						db: s
					});
				}
			}
		}

	const passes: Pass[][] = comps.map(() => []);
	const crossComps: [number, number][] = [];
	const dirs: { o: V2; u: V2 }[] = [];
	const at: V2[] = [];
	hits.forEach((h, n) => {
		const aOver = h.za > h.zb;
		passes[h.ca].push({ crossing: n, over: aOver, at: h.sa });
		passes[h.cb].push({ crossing: n, over: !aOver, at: h.sb });
		crossComps.push(aOver ? [h.ca, h.cb] : [h.cb, h.ca]);
		dirs.push(aOver ? { o: h.da, u: h.db } : { o: h.db, u: h.da });
		at.push(h.p);
	});
	for (const ps of passes) ps.sort((x, y) => x.at - y.at);

	// label the strand pieces: the piece leaving pass k of a component is base + k
	const edgeIn = new Map<string, number>();
	const edgeOut = new Map<string, number>();
	const edgeComp = new Map<number, number>();
	let label = 1;
	passes.forEach((ps, c) => {
		const m = ps.length;
		ps.forEach((p, k) => {
			const key = `${p.crossing}:${p.over ? 'o' : 'u'}`;
			edgeOut.set(key, label + k);
			edgeIn.set(key, label + ((k - 1 + m) % m));
			edgeComp.set(label + k, c);
		});
		label += m;
	});

	const pd: PD[] = [];
	const signs: number[] = [];
	hits.forEach((_, n) => {
		const { o, u } = dirs[n];
		const i = edgeIn.get(`${n}:u`)!;
		const k = edgeOut.get(`${n}:u`)!;
		const oin = edgeIn.get(`${n}:o`)!;
		const oout = edgeOut.get(`${n}:o`)!;
		// counterclockwise from the incoming under piece (which lies in direction −u)
		const ccwOut = cross2([-u[0], -u[1]], o) > 0;
		pd.push(ccwOut ? [i, oout, k, oin] : [i, oin, k, oout]);
		signs.push(cross2(o, u) > 0 ? 1 : -1);
	});

	return {
		pd,
		signs,
		writhe: signs.reduce((a, b) => a + b, 0),
		components: comps.length,
		freeLoops: passes.filter((ps) => ps.length === 0).length,
		edgeComp,
		crossComps,
		at,
		passes
	};
}

/** the over- and under-strand pieces at a crossing: [in, out] for each */
export function strands(x: PD, sign: number) {
	const [i, j, k, l] = x;
	// for a right-handed crossing the over strand runs from l to j (counterclockwise order i, j, k, l)
	return sign > 0 ? { under: [i, k], over: [l, j] } : { under: [i, k], over: [j, l] };
}

/** the same picture in a mirror: every crossing switched */
export function mirror(comps: V3[][]): V3[][] {
	return comps.map((pts) => pts.map(([x, y, z]) => [x, y, -z] as V3));
}
