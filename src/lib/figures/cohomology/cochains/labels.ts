// Label placement for the graph figures of §4.1: put each pill or name next to
// its anchor in the first direction (in order of preference) where it touches
// no edge, no vertex disc, no other label and stays inside the picture.
import type { Pt } from './graph';

/** An axis-aligned box by its centre and full size. */
export interface Box {
	x: number;
	y: number;
	w: number;
	h: number;
}
/** A stroke: segment a–b of half-thickness r. */
export interface Seg {
	a: Pt;
	b: Pt;
	r: number;
}
export interface Disc {
	c: Pt;
	r: number;
}
export interface Obstacles {
	segs: Seg[];
	discs: Disc[];
	boxes: Box[];
	/** [x0, y0, x1, y1]: the visible picture */
	bounds?: [number, number, number, number] | null;
}

/** Directions to try, starting from `first` (radians, y down) and fanning out both ways. */
function fan(first: number, n = 16): { d: Pt; turn: number }[] {
	const out: { d: Pt; turn: number }[] = [];
	for (let j = 0; j <= n / 2; j++) {
		for (const s of j === 0 || j === n / 2 ? [1] : [1, -1]) {
			const a = first + (s * j * 2 * Math.PI) / n;
			out.push({ d: [Math.cos(a), Math.sin(a)], turn: j });
		}
	}
	return out;
}
/** above first: for a pill that gives a vertex's value */
export const ABOVE = fan(-Math.PI / 2);
/** below first: for a small caption under a vertex */
export const BELOW = fan(Math.PI / 2);

/** How far a w×h box reaches from its centre in direction d. */
export const reach = (d: Pt, w: number, h: number) => (Math.abs(d[0]) * w) / 2 + (Math.abs(d[1]) * h) / 2;

/** Does the segment (thickened by s.r) meet the box? Liang–Barsky against the box grown by r. */
export function boxHitsSeg(b: Box, s: Seg): boolean {
	const x0 = b.x - b.w / 2 - s.r;
	const x1 = b.x + b.w / 2 + s.r;
	const y0 = b.y - b.h / 2 - s.r;
	const y1 = b.y + b.h / 2 + s.r;
	const dx = s.b[0] - s.a[0];
	const dy = s.b[1] - s.a[1];
	let t0 = 0;
	let t1 = 1;
	const clip = (p: number, q: number) => {
		if (p === 0) return q >= 0;
		const r = q / p;
		if (p < 0) {
			if (r > t1) return false;
			if (r > t0) t0 = r;
		} else {
			if (r < t0) return false;
			if (r < t1) t1 = r;
		}
		return true;
	};
	return clip(-dx, s.a[0] - x0) && clip(dx, x1 - s.a[0]) && clip(-dy, s.a[1] - y0) && clip(dy, y1 - s.a[1]);
}

export const boxHitsBox = (a: Box, b: Box, pad = 2) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 + pad && Math.abs(a.y - b.y) < (a.h + b.h) / 2 + pad;

export function boxHitsDisc(b: Box, d: Disc): boolean {
	const qx = Math.max(b.x - b.w / 2, Math.min(d.c[0], b.x + b.w / 2));
	const qy = Math.max(b.y - b.h / 2, Math.min(d.c[1], b.y + b.h / 2));
	return Math.hypot(d.c[0] - qx, d.c[1] - qy) < d.r;
}

/** How badly a box would sit here: 100 per thing it touches, 150 for leaving the picture. */
export function clash(b: Box, o: Obstacles): number {
	let n = 0;
	for (const s of o.segs) if (boxHitsSeg(b, s)) n += 100;
	for (const d of o.discs) if (boxHitsDisc(b, d)) n += 100;
	for (const x of o.boxes) if (boxHitsBox(b, x)) n += 100;
	const B = o.bounds;
	if (B && (b.x - b.w / 2 < B[0] || b.x + b.w / 2 > B[2] || b.y - b.h / 2 < B[1] || b.y + b.h / 2 > B[3])) n += 150;
	return n;
}

/**
 * Place a w×h box beside point c, its nearest side `gap` away (or a little
 * further), in the best of the directions `dirs`: the less it turns away from
 * the first direction the better. `keep` is the choice made last time, which is
 * favoured so that labels do not hop about while things move.
 */
export function placeBeside(
	c: Pt,
	gap: number,
	w: number,
	h: number,
	dirs: { d: Pt; turn: number }[],
	o: Obstacles,
	keep = -1
): { box: Box; k: number; cost: number } {
	let best = { box: { x: c[0], y: c[1] - gap - h / 2, w, h }, k: 0, cost: Infinity };
	let bestCost = Infinity;
	dirs.forEach(({ d, turn }, j) => {
		for (let ring = 0; ring < 2; ring++) {
			const k = j * 2 + ring;
			const r = gap + ring * 7 + reach(d, w, h);
			const box = { x: c[0] + d[0] * r, y: c[1] + d[1] * r, w, h };
			const cost = clash(box, o) + turn + ring * 3 - (k === keep ? 1.2 : 0);
			if (cost < bestCost) {
				bestCost = cost;
				best = { box, k, cost };
			}
		}
	});
	return best;
}
