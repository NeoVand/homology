// Small 2D helpers shared by the figures of §1.5: a world ↔ SVG view,
// vector arithmetic, clipping infinite lines to the canvas, and formatting.

export type V2 = [number, number];

export const add = (a: V2, b: V2): V2 => [a[0] + b[0], a[1] + b[1]];
export const sub = (a: V2, b: V2): V2 => [a[0] - b[0], a[1] - b[1]];
export const mul = (c: number, a: V2): V2 => [c * a[0], c * a[1]];
export const dot = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];
export const det = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];
export const len = (a: V2) => Math.hypot(a[0], a[1]);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerp2 = (a: V2, b: V2, t: number): V2 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

/** 2×2 matrix with columns c1, c2 applied to v. */
export const apply2 = (c1: V2, c2: V2, v: V2): V2 => [c1[0] * v[0] + c2[0] * v[1], c1[1] * v[0] + c2[1] * v[1]];

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface View {
	/** viewBox width and height */
	w: number;
	h: number;
	/** pixels per unit */
	s: number;
	/** SVG position of the world origin */
	ox: number;
	oy: number;
	X(x: number): number;
	Y(y: number): number;
	P(v: V2): string;
	toWorld(px: number, py: number): V2;
	/** world-space bounds of the canvas */
	xmin: number;
	xmax: number;
	ymin: number;
	ymax: number;
}

export function makeView(w: number, h: number, s: number, ox = w / 2, oy = h / 2): View {
	return {
		w,
		h,
		s,
		ox,
		oy,
		X: (x) => ox + x * s,
		Y: (y) => oy - y * s,
		P: (v) => `${ox + v[0] * s},${oy - v[1] * s}`,
		toWorld: (px, py) => [(px - ox) / s, (oy - py) / s],
		xmin: -ox / s,
		xmax: (w - ox) / s,
		ymin: -(h - oy) / s,
		ymax: oy / s
	};
}

/**
 * The visible part of the infinite line through p with direction d, as two
 * world points (or null if it misses the canvas). `pad` extends the box.
 */
export function clipLine(v: View, p: V2, d: V2, pad = 0.2): [V2, V2] | null {
	if (len(d) < 1e-12) return null;
	const xmin = v.xmin - pad;
	const xmax = v.xmax + pad;
	const ymin = v.ymin - pad;
	const ymax = v.ymax + pad;
	let t0 = -Infinity;
	let t1 = Infinity;
	const clip = (p0: number, d0: number, lo: number, hi: number) => {
		if (Math.abs(d0) < 1e-12) return p0 >= lo && p0 <= hi;
		let a = (lo - p0) / d0;
		let b = (hi - p0) / d0;
		if (a > b) [a, b] = [b, a];
		t0 = Math.max(t0, a);
		t1 = Math.min(t1, b);
		return t0 <= t1;
	};
	if (!clip(p[0], d[0], xmin, xmax)) return null;
	if (!clip(p[1], d[1], ymin, ymax)) return null;
	return [add(p, mul(t0, d)), add(p, mul(t1, d))];
}

/** Convert a pointer event to viewBox coordinates of the given SVG. */
export function svgCoords(svg: SVGSVGElement, e: { clientX: number; clientY: number }): [number, number] {
	const ctm = svg.getScreenCTM();
	if (!ctm) return [0, 0];
	const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
	return [pt.x, pt.y];
}

export const snapTo = (x: number, step: number) => Math.round(x / step) * step + 0;
export const snap2 = (v: V2, step: number): V2 => [snapTo(v[0], step), snapTo(v[1], step)];
export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** A short, friendly number: 2, −1.5, 0.33 (real minus sign). */
export function fmt(x: number, digits = 2): string {
	if (Math.abs(x) < 1e-9) return '0';
	const r = Number(x.toFixed(digits));
	return String(r).replace('-', '−');
}

/** The same for TeX (ASCII minus, which KaTeX typesets as a proper minus). */
export function tfmt(x: number, digits = 2): string {
	if (Math.abs(x) < 1e-9) return '0';
	return String(Number(x.toFixed(digits)));
}

/** TeX for a 2×2 matrix given by its columns, optionally colouring the columns. */
export function matTeX(c1: V2, c2: V2, colors?: [string, string], digits = 2): string {
	const a = (x: number, i: number) => (colors ? `\\textcolor{${colors[i]}}{${tfmt(x, digits)}}` : tfmt(x, digits));
	return `\\begin{pmatrix} ${a(c1[0], 0)} & ${a(c2[0], 1)} \\\\ ${a(c1[1], 0)} & ${a(c2[1], 1)} \\end{pmatrix}`;
}

/** TeX for a column vector. */
export function colTeX(v: number[], digits = 2): string {
	return `\\begin{pmatrix} ${v.map((x) => tfmt(x, digits)).join(' \\\\ ')} \\end{pmatrix}`;
}

/** The book's palette as literal colours (for SVG attributes and KaTeX \textcolor). */
export const C = {
	gold: '#f2d08f',
	goldDeep: '#d8b26e',
	teal: '#5fd6cf',
	violet: '#a493ff',
	rose: '#f28db6',
	blue: '#74a9ff',
	green: '#84d9a2',
	amber: '#f4b55f',
	ivory: '#ebe5d5',
	dim: '#8b8676',
	ghost: '#5d5a50'
} as const;
