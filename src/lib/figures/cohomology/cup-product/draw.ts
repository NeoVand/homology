// Small SVG helpers shared by the figures of chapters 4.5 and 4.6.
// Geometry is computed in "math" coordinates (y up) and mapped to SVG (y down).
export type Pt = [number, number];
export type Map2 = (p: Pt) => Pt;

/** An affine map from a math box [x0,x1]×[y0,y1] onto an SVG box (y flipped). */
export function boxMap(x0: number, x1: number, y0: number, y1: number, X: number, Y: number, W: number, H: number): Map2 {
	return ([x, y]) => [X + ((x - x0) / (x1 - x0)) * W, Y + H - ((y - y0) / (y1 - y0)) * H];
}

export function pathD(pts: Pt[], map: Map2, closed = false): string {
	if (!pts.length) return '';
	const s = pts.map((p, i) => {
		const [x, y] = map(p);
		return `${i ? 'L' : 'M'}${x.toFixed(2)} ${y.toFixed(2)}`;
	});
	return s.join(' ') + (closed ? ' Z' : '');
}

export function polyPoints(pts: Pt[], map: Map2): string {
	return pts
		.map((p) => {
			const [x, y] = map(p);
			return `${x.toFixed(2)},${y.toFixed(2)}`;
		})
		.join(' ');
}

/** Total length of a polyline (in SVG units after mapping). */
function lengthOf(pts: Pt[]): number {
	let L = 0;
	for (let i = 0; i + 1 < pts.length; i++) L += Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
	return L;
}

/**
 * Small chevrons ("›") placed along a curve, pointing to the RIGHT of its
 * direction of travel — the fence's co-orientation (the direction in which a
 * crossing counts +1). Returns one SVG path string.
 */
export function coChevrons(arc: Pt[], map: Map2, opts: { spacing?: number; size?: number; offset?: number; flip?: boolean } = {}): string {
	const P = arc.map(map);
	const L = lengthOf(P);
	if (L < 1e-6) return '';
	const spacing = opts.spacing ?? 46;
	const size = opts.size ?? 6;
	const count = Math.max(1, Math.floor(L / spacing));
	const out: string[] = [];
	for (let k = 0; k < count; k++) {
		const target = ((k + 0.5) / count) * L;
		let acc = 0;
		for (let i = 0; i + 1 < P.length; i++) {
			const a = P[i];
			const b = P[i + 1];
			const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
			if (acc + l >= target || i + 2 === P.length) {
				const t = l ? Math.min(1, (target - acc) / l) : 0;
				const x = a[0] + (b[0] - a[0]) * t;
				const y = a[1] + (b[1] - a[1]) * t;
				const ux = (b[0] - a[0]) / (l || 1);
				const uy = (b[1] - a[1]) / (l || 1);
				// SVG has y down, so the right of travel in math coordinates is (−uy, ux) here
				let nx = -uy;
				let ny = ux;
				if (opts.flip) {
					nx = -nx;
					ny = -ny;
				}
				const off = opts.offset ?? 0;
				const cx = x + nx * off;
				const cy = y + ny * off;
				const tipx = cx + nx * size;
				const tipy = cy + ny * size;
				out.push(
					`M${(cx - ux * size * 0.9).toFixed(2)} ${(cy - uy * size * 0.9).toFixed(2)} L${tipx.toFixed(2)} ${tipy.toFixed(2)} L${(cx + ux * size * 0.9).toFixed(2)} ${(cy + uy * size * 0.9).toFixed(2)}`
				);
				break;
			}
			acc += l;
		}
	}
	return out.join(' ');
}

/** An arrowhead path at the middle of segment a→b (SVG coordinates). */
export function midArrow(a: Pt, b: Pt, size = 6): string {
	const mx = (a[0] + b[0]) / 2;
	const my = (a[1] + b[1]) / 2;
	const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
	const ux = (b[0] - a[0]) / l;
	const uy = (b[1] - a[1]) / l;
	return `M${(mx - ux * size - uy * size * 0.8).toFixed(2)} ${(my - uy * size + ux * size * 0.8).toFixed(2)} L${(mx + ux * size * 0.6).toFixed(2)} ${(my + uy * size * 0.6).toFixed(2)} L${(mx - ux * size + uy * size * 0.8).toFixed(2)} ${(my - uy * size - ux * size * 0.8).toFixed(2)}`;
}

/** Signed number as a readable string with a true minus sign. */
export function signed(n: number): string {
	if (n > 0) return `+${n}`;
	if (n < 0) return `−${Math.abs(n)}`;
	return '0';
}

/** A number with a true minus sign (no plus). */
export function num(n: number): string {
	return n < 0 ? `−${Math.abs(n)}` : String(n || 0);
}
