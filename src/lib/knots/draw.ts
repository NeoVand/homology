// Drawing a knot diagram: the shadow of the knot seen from above, broken where
// a strand passes under another, cut into arcs (each arc runs from one
// undercrossing to the next), with every crossing's over-arc and the two
// under-arcs that meet there. All in the plane, ready for SVG.
import { diagramOf, type Diagram, type V2, type V3 } from './diagram';

export interface DrawnArc {
	comp: number;
	/** the arc's shadow, with a small gap left at each end for the strand it passes under */
	pts: V2[];
	/** a point in the middle of the arc, and the direction the strand runs there */
	mid: V2;
	dir: V2;
}

export interface DrawnCrossing {
	at: V2;
	sign: number;
	over: number;
	/** the under-arc running into the crossing, and the one running out */
	in: number;
	out: number;
	/** direction of the over strand and of the under strand */
	overDir: V2;
	underDir: V2;
}

export interface Drawing {
	diagram: Diagram;
	arcs: DrawnArc[];
	crossings: DrawnCrossing[];
	/** components with no undercrossing at all: drawn whole */
	loops: { comp: number; pts: V2[] }[];
	/** bounding box of the shadow */
	box: { minx: number; miny: number; maxx: number; maxy: number };
}

export function draw(comps: V3[][], gap = 0.16): Drawing {
	const D = diagramOf(comps);
	const flat = comps.map((pts) => pts.map((p) => [p[0], p[1]] as V2));
	// arc length along each component
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
	const slice = (c: number, s0: number, s1: number): V2[] => {
		const out: V2[] = [];
		const step = 0.03;
		for (let s = s0; s < s1; s += step) out.push(pointAt(c, s));
		out.push(pointAt(c, s1));
		return out;
	};

	const arcs: DrawnArc[] = [];
	const loops: Drawing['loops'] = [];
	// arc index of the piece of component c starting at its k-th undercrossing
	const arcStarting = new Map<string, number>();
	const arcEnding = new Map<string, number>();
	const arcThrough = new Map<string, number>(); // "crossing" → over arc
	D.passes.forEach((ps, c) => {
		const total = cum[c][cum[c].length - 1];
		const unders = ps.filter((p) => !p.over);
		if (unders.length === 0) {
			loops.push({ comp: c, pts: flat[c] });
			for (const p of ps) arcThrough.set(`${p.crossing}`, -1 - c);
			return;
		}
		unders.forEach((u, k) => {
			const v = unders[(k + 1) % unders.length];
			const s0 = lenAt(c, u.at);
			let s1 = lenAt(c, v.at);
			if (s1 <= s0) s1 += total;
			const idx = arcs.length;
			const pts = slice(c, s0 + gap, s1 - gap);
			const sm = (s0 + s1) / 2;
			const p0 = pointAt(c, sm - 0.02);
			const p1 = pointAt(c, sm + 0.02);
			const dl = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) || 1;
			arcs.push({ comp: c, pts, mid: pointAt(c, sm), dir: [(p1[0] - p0[0]) / dl, (p1[1] - p0[1]) / dl] });
			arcStarting.set(`${u.crossing}`, idx);
			arcEnding.set(`${v.crossing}`, idx);
			// the over passes along this arc
			for (const p of ps) {
				if (!p.over) continue;
				let s = lenAt(c, p.at);
				if (s < s0) s += total;
				if (s > s0 && s < s1) arcThrough.set(`${p.crossing}`, idx);
			}
		});
	});

	const crossings: DrawnCrossing[] = D.at.map((at, n) => {
		const dirAt = (over: boolean): V2 => {
			for (let c = 0; c < D.passes.length; c++) {
				const p = D.passes[c].find((q) => q.crossing === n && q.over === over);
				if (!p) continue;
				const s = lenAt(c, p.at);
				const a = pointAt(c, s - 0.02);
				const b = pointAt(c, s + 0.02);
				const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
				return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
			}
			return [1, 0];
		};
		return {
			at,
			sign: D.signs[n],
			over: arcThrough.get(`${n}`) ?? -1,
			in: arcEnding.get(`${n}`) ?? -1,
			out: arcStarting.get(`${n}`) ?? -1,
			overDir: dirAt(true),
			underDir: dirAt(false)
		};
	});

	const all = flat.flat();
	const box = {
		minx: Math.min(...all.map((p) => p[0])),
		miny: Math.min(...all.map((p) => p[1])),
		maxx: Math.max(...all.map((p) => p[0])),
		maxy: Math.max(...all.map((p) => p[1]))
	};
	return { diagram: D, arcs, crossings, loops, box };
}

/** SVG path data through points (y flipped, so +y in the knot is up on the page) */
export function pathOf(pts: V2[], closed = false, k = 1, ox = 0, oy = 0): string {
	if (!pts.length) return '';
	const f = (p: V2) => `${(ox + p[0] * k).toFixed(2)} ${(oy - p[1] * k).toFixed(2)}`;
	return `M ${f(pts[0])} ` + pts.slice(1).map((p) => `L ${f(p)}`).join(' ') + (closed ? ' Z' : '');
}
