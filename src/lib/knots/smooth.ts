// Smoothings, drawn. A diagram's strand pieces run from crossing to crossing
// (the PD code's edge labels); smoothing a crossing cuts out a small window
// around it and joins the four loose ends in pairs: the 0-smoothing (Kauffman's
// A) joins (i, j) and (k, l), the 1-smoothing joins (i, l) and (j, k). The
// pictures and the loop counts here agree with invariants.ts and khovanov.ts.
import { diagramOf, strands, type Diagram, type V2, type V3 } from './diagram';

export interface SmoothDrawing {
	diagram: Diagram;
	/** each edge label's piece of the shadow, with a window cut out at both ends */
	edges: Map<number, V2[]>;
	/** at each crossing, where each of its four edges ends: port[n].get(label) */
	ports: Map<number, V2>[];
	box: { minx: number; miny: number; maxx: number; maxy: number };
}

export function smoothDrawing(comps: V3[][], window = 0.2): SmoothDrawing {
	const D = diagramOf(comps);
	const flat = comps.map((pts) => pts.map((p) => [p[0], p[1]] as V2));
	const cum = flat.map((pts) => {
		const c = [0];
		for (let i = 0; i < pts.length; i++) {
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			c.push(c[i] + Math.hypot(b[0] - a[0], b[1] - a[1]));
		}
		return c;
	});
	const lenAt = (c: number, at: number) => {
		const i = Math.floor(at);
		return cum[c][i] + (cum[c][i + 1] - cum[c][i]) * (at - i);
	};
	const pointAt = (c: number, s: number): V2 => {
		const C = cum[c];
		const total = C[C.length - 1];
		s = ((s % total) + total) % total;
		let lo = 0;
		let hi = C.length - 1;
		while (hi - lo > 1) {
			const m = (lo + hi) >> 1;
			if (C[m] <= s) lo = m;
			else hi = m;
		}
		const a = flat[c][lo % flat[c].length];
		const b = flat[c][(lo + 1) % flat[c].length];
		const f = (s - C[lo]) / (C[lo + 1] - C[lo] || 1);
		return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
	};
	const edges = new Map<number, V2[]>();
	const ports: Map<number, V2>[] = D.pd.map(() => new Map());
	let label = 1;
	D.passes.forEach((ps, c) => {
		const m = ps.length;
		const total = cum[c][cum[c].length - 1];
		ps.forEach((p, k) => {
			const q = ps[(k + 1) % m];
			const s0 = lenAt(c, p.at) + window;
			let s1 = lenAt(c, q.at) - window;
			if (lenAt(c, q.at) <= lenAt(c, p.at)) s1 += total; // the last piece runs round past the start
			const pts: V2[] = [];
			const step = 0.03;
			for (let s = s0; s < s1; s += step) pts.push(pointAt(c, s));
			pts.push(pointAt(c, s1));
			const e = label + k;
			edges.set(e, pts);
			ports[p.crossing].set(e, pts[0]); // the edge leaves crossing p here …
			// … and arrives at crossing q here (for a kink both may be the same crossing: keep both ends apart by keying the arrival)
			ports[q.crossing].set(-e, pts[pts.length - 1]);
		});
		label += m;
	});
	const all = flat.flat();
	return {
		diagram: D,
		edges,
		ports,
		box: {
			minx: Math.min(...all.map((p) => p[0])),
			miny: Math.min(...all.map((p) => p[1])),
			maxx: Math.max(...all.map((p) => p[0])),
			maxy: Math.max(...all.map((p) => p[1]))
		}
	};
}

/**
 * The joins at crossing n for smoothing s (0 or 1), as pairs of port
 * positions. Incoming pieces end at the crossing (keyed −label), outgoing
 * ones start there (keyed +label).
 */
export function joins(sd: SmoothDrawing, n: number, s: number): [V2, V2][] {
	const x = sd.diagram.pd[n];
	const { under, over } = strands(x, sd.diagram.signs[n]);
	const port = (label: number) => {
		// the incoming under piece and incoming over piece arrive here; the outgoing ones leave
		const incoming = label === under[0] || label === over[0];
		return sd.ports[n].get(incoming ? -label : label)!;
	};
	const [i, j, k, l] = x;
	return s === 0
		? [
				[port(i), port(j)],
				[port(k), port(l)]
			]
		: [
				[port(i), port(l)],
				[port(j), port(k)]
			];
}

/** which loop each edge lies on, for the smoothing given by the bits of `state` */
export function loopsOfState(sd: SmoothDrawing, state: number): { loopOf: Map<number, number>; count: number } {
	const parent = new Map<number, number>();
	const find = (a: number): number => {
		let p = parent.get(a) ?? a;
		if (p !== a) {
			p = find(p);
			parent.set(a, p);
		}
		return p;
	};
	const union = (a: number, b: number) => parent.set(find(a), find(b));
	sd.diagram.pd.forEach(([i, j, k, l], n) => {
		if (((state >> n) & 1) === 0) {
			union(i, j);
			union(k, l);
		} else {
			union(i, l);
			union(j, k);
		}
	});
	const roots: number[] = [];
	const loopOf = new Map<number, number>();
	for (const e of sd.edges.keys()) {
		const r = find(e);
		let ix = roots.indexOf(r);
		if (ix < 0) ix = roots.push(r) - 1;
		loopOf.set(e, ix);
	}
	return { loopOf, count: roots.length + sd.diagram.freeLoops };
}

/** a state's picture as polylines, each with the loop it belongs to (joins drawn as short curves) */
export function stateCurves(sd: SmoothDrawing, state: number): { pts: V2[]; loop: number }[] {
	const { loopOf } = loopsOfState(sd, state);
	const out: { pts: V2[]; loop: number }[] = [];
	for (const [e, pts] of sd.edges) out.push({ pts, loop: loopOf.get(e)! });
	sd.diagram.pd.forEach((_, c) => {
		const at = sd.diagram.at[c];
		for (const [a, b] of joins(sd, c, (state >> c) & 1)) {
			// bow away from the crossing point, towards the side the two ends are on
			const mid: V2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
			const ctrl: V2 = [at[0] + 0.55 * (mid[0] - at[0]), at[1] + 0.55 * (mid[1] - at[1])];
			const pts: V2[] = [];
			for (let k = 0; k <= 12; k++) {
				const t = k / 12;
				const u = 1 - t;
				pts.push([u * u * a[0] + 2 * u * t * ctrl[0] + t * t * b[0], u * u * a[1] + 2 * u * t * ctrl[1] + t * t * b[1]]);
			}
			const e = [...sd.ports[c]].find(([, p]) => p === a)?.[0] ?? 0;
			out.push({ pts, loop: loopOf.get(Math.abs(e)) ?? 0 });
		}
	});
	return out;
}

/** "A^{2}\,d" — the term a state contributes to the bracket, tidily */
export function termTeX(nA: number, nB: number, loops: number): string {
	const p = nA - nB;
	const a = p === 0 ? '' : p === 1 ? 'A' : `A^{${p}}`;
	const d = loops - 1 === 0 ? '' : loops - 1 === 1 ? 'd' : `d^{${loops - 1}}`;
	return a || d ? `${a}${a && d ? '\\,' : ''}${d}` : '1';
}
