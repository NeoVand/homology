// Open strands in the plane, each with a height along it, drawn with a gap
// wherever a strand passes under another: the little local pictures of knot
// diagrams (Reidemeister's moves, crossings, smoothings).
import type { V2 } from './diagram';

export interface Strand {
	pts: V2[];
	/** height at the k-th point (higher passes over lower) */
	z: (k: number) => number;
}

export interface DrawnStrand {
	/** pieces to draw, gaps left out */
	pieces: V2[][];
}

export interface StrandCrossing {
	at: V2;
	over: number;
	under: number;
}

function hits(a: V2[], b: V2[], self: boolean) {
	const out: { ta: number; tb: number; p: V2 }[] = [];
	for (let i = 0; i + 1 < a.length; i++)
		for (let j = self ? i + 2 : 0; j + 1 < b.length; j++) {
			const p = a[i];
			const r: V2 = [a[i + 1][0] - p[0], a[i + 1][1] - p[1]];
			const q = b[j];
			const s: V2 = [b[j + 1][0] - q[0], b[j + 1][1] - q[1]];
			const den = r[0] * s[1] - r[1] * s[0];
			if (Math.abs(den) < 1e-12) continue;
			const w: V2 = [q[0] - p[0], q[1] - p[1]];
			const t = (w[0] * s[1] - w[1] * s[0]) / den;
			const u = (w[0] * r[1] - w[1] * r[0]) / den;
			if (t < 0 || t >= 1 || u < 0 || u >= 1) continue;
			out.push({ ta: i + t, tb: j + u, p: [p[0] + t * r[0], p[1] + t * r[1]] });
		}
	return out;
}

/** draw strands with gaps of half-length `gap` (in the strands' units) at every undercrossing */
export function drawStrands(strands: Strand[], gap = 0.12): { strands: DrawnStrand[]; crossings: StrandCrossing[] } {
	const cuts: number[][] = strands.map(() => []); // positions (point index + fraction) where a strand passes under
	const crossings: StrandCrossing[] = [];
	const zAt = (s: Strand, t: number) => {
		const k = Math.floor(t);
		return s.z(k) + (s.z(Math.min(k + 1, s.pts.length - 1)) - s.z(k)) * (t - k);
	};
	strands.forEach((A, a) =>
		strands.forEach((B, b) => {
			if (b < a) return;
			for (const h of hits(A.pts, B.pts, a === b)) {
				const aOver = zAt(A, h.ta) > zAt(B, h.tb);
				if (aOver) cuts[b].push(h.tb);
				else cuts[a].push(h.ta);
				crossings.push({ at: h.p, over: aOver ? a : b, under: aOver ? b : a });
			}
		})
	);
	const drawn = strands.map((s, i) => {
		// arc length at each point
		const cum = [0];
		for (let k = 1; k < s.pts.length; k++) cum.push(cum[k - 1] + Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1]));
		const lenAt = (t: number) => {
			const k = Math.min(Math.floor(t), s.pts.length - 2);
			return cum[k] + (cum[k + 1] - cum[k]) * (t - k);
		};
		const gaps = cuts[i].map((t) => [lenAt(t) - gap, lenAt(t) + gap]).sort((x, y) => x[0] - y[0]);
		const inGap = (l: number) => gaps.some(([g0, g1]) => l > g0 && l < g1);
		const pieces: V2[][] = [];
		let cur: V2[] = [];
		for (let k = 0; k < s.pts.length; k++) {
			if (k > 0) {
				// split the segment where it enters or leaves a gap
				for (const [g0, g1] of gaps)
					for (const edge of [g0, g1]) {
						if (edge > cum[k - 1] && edge < cum[k]) {
							const f = (edge - cum[k - 1]) / (cum[k] - cum[k - 1]);
							const p: V2 = [s.pts[k - 1][0] + (s.pts[k][0] - s.pts[k - 1][0]) * f, s.pts[k - 1][1] + (s.pts[k][1] - s.pts[k - 1][1]) * f];
							if (edge === g0) {
								cur.push(p);
								if (cur.length > 1) pieces.push(cur);
								cur = [];
							} else cur = [p];
						}
					}
			}
			if (!inGap(cum[k])) cur.push(s.pts[k]);
		}
		if (cur.length > 1) pieces.push(cur);
		return { pieces };
	});
	return { strands: drawn, crossings };
}
