// Canvas drawing for point clouds, balls and Rips complexes (night-sky style).
import type { Pt } from './ph';

export interface Box {
	x0: number;
	x1: number;
	y0: number;
	y1: number;
}

export interface View {
	w: number;
	h: number;
	/** pixels per world unit */
	s: number;
	sx(x: number): number;
	sy(y: number): number;
	inv(px: number, py: number): Pt;
}

/** Fit a world box into a w×h pixel area (uniform scale, centred, y up). */
export function makeView(w: number, h: number, box: Box, pad = 14): View {
	const s = Math.min((w - 2 * pad) / (box.x1 - box.x0), (h - 2 * pad) / (box.y1 - box.y0));
	const cx = (box.x0 + box.x1) / 2;
	const cy = (box.y0 + box.y1) / 2;
	return {
		w,
		h,
		s,
		sx: (x) => w / 2 + (x - cx) * s,
		sy: (y) => h / 2 - (y - cy) * s,
		inv: (px, py) => [cx + (px - w / 2) / s, cy - (py - h / 2) / s]
	};
}

/** Size a canvas for the device pixel ratio and return a context in CSS pixels. */
export function prepare(canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null {
	const dpr = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, 2.5);
	const W = Math.round(w * dpr);
	const H = Math.round(h * dpr);
	if (canvas.width !== W || canvas.height !== H) {
		canvas.width = W;
		canvas.height = H;
	}
	const ctx = canvas.getContext('2d');
	if (!ctx) return null;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	ctx.clearRect(0, 0, w, h);
	return ctx;
}

export const ink = {
	ballFill: 'rgba(116, 150, 255, 0.10)',
	ballEdge: 'rgba(170, 190, 255, 0.30)',
	triFill: 'rgba(140, 150, 255, 0.20)',
	edge: 'rgba(235, 229, 213, 0.55)',
	gold: '#f2d08f',
	goldBright: '#fff1d0',
	teal: '#5fd6cf',
	rose: '#f28db6',
	violet: '#a493ff',
	blue: '#74a9ff'
};

/** Edges and triangles of the Vietoris–Rips complex at radius r (computed directly). */
export function ripsAt(pts: Pt[], r: number) {
	const n = pts.length;
	const lim = (2 * r) * (2 * r) + 1e-12;
	const adj: Uint8Array = new Uint8Array(n * n);
	const edges: [number, number][] = [];
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++) {
			const dx = pts[i][0] - pts[j][0];
			const dy = pts[i][1] - pts[j][1];
			if (dx * dx + dy * dy <= lim) {
				adj[i * n + j] = adj[j * n + i] = 1;
				edges.push([i, j]);
			}
		}
	const tris: [number, number, number][] = [];
	for (const [i, j] of edges)
		for (let k = j + 1; k < n; k++) if (adj[i * n + k] && adj[j * n + k]) tris.push([i, j, k]);
	return { edges, tris };
}

/** The union of discs of radius r: one translucent fill (no darker overlaps) plus fine outlines. */
export function drawBalls(
	ctx: CanvasRenderingContext2D,
	v: View,
	pts: Pt[],
	r: number,
	o: { fill?: string; edge?: string; soft?: boolean } = {}
) {
	const R = r * v.s;
	if (R <= 0.3) return;
	ctx.save();
	ctx.beginPath();
	for (const p of pts) {
		const x = v.sx(p[0]);
		const y = v.sy(p[1]);
		ctx.moveTo(x + R, y);
		ctx.arc(x, y, R, 0, Math.PI * 2);
	}
	if (o.soft !== false) {
		ctx.shadowColor = 'rgba(120, 150, 255, 0.35)';
		ctx.shadowBlur = 18;
	}
	ctx.fillStyle = o.fill ?? ink.ballFill;
	ctx.fill('nonzero');
	ctx.shadowBlur = 0;
	ctx.lineWidth = 1;
	ctx.strokeStyle = o.edge ?? ink.ballEdge;
	ctx.stroke();
	ctx.restore();
}

/** Filled triangles (as a single union) and edges. */
export function drawComplex(
	ctx: CanvasRenderingContext2D,
	v: View,
	pts: Pt[],
	edges: [number, number][],
	tris: [number, number, number][],
	o: { edge?: string; tri?: string; width?: number } = {}
) {
	ctx.save();
	if (tris.length) {
		ctx.beginPath();
		for (const [a, b, c] of tris) {
			const ax = v.sx(pts[a][0]);
			const ay = v.sy(pts[a][1]);
			let bx = v.sx(pts[b][0]);
			let by = v.sy(pts[b][1]);
			let cx = v.sx(pts[c][0]);
			let cy = v.sy(pts[c][1]);
			// orient every triangle the same way so the nonzero rule fills their union once
			if ((bx - ax) * (cy - ay) - (by - ay) * (cx - ax) < 0) {
				[bx, cx] = [cx, bx];
				[by, cy] = [cy, by];
			}
			ctx.moveTo(ax, ay);
			ctx.lineTo(bx, by);
			ctx.lineTo(cx, cy);
			ctx.closePath();
		}
		ctx.fillStyle = o.tri ?? ink.triFill;
		ctx.fill('nonzero');
	}
	if (edges.length) {
		ctx.beginPath();
		for (const [a, b] of edges) {
			ctx.moveTo(v.sx(pts[a][0]), v.sy(pts[a][1]));
			ctx.lineTo(v.sx(pts[b][0]), v.sy(pts[b][1]));
		}
		ctx.lineWidth = o.width ?? 1.1;
		ctx.strokeStyle = o.edge ?? ink.edge;
		ctx.lineCap = 'round';
		ctx.stroke();
	}
	ctx.restore();
}

/** A glowing polyline set (cycle highlight). */
export function drawGlowEdges(
	ctx: CanvasRenderingContext2D,
	v: View,
	pts: Pt[],
	edges: [number, number][],
	color: string,
	width = 2.6,
	dash: number[] = []
) {
	ctx.save();
	ctx.lineCap = 'round';
	ctx.lineJoin = 'round';
	ctx.beginPath();
	for (const [a, b] of edges) {
		ctx.moveTo(v.sx(pts[a][0]), v.sy(pts[a][1]));
		ctx.lineTo(v.sx(pts[b][0]), v.sy(pts[b][1]));
	}
	ctx.setLineDash(dash);
	ctx.shadowColor = color;
	ctx.shadowBlur = 14;
	ctx.strokeStyle = color;
	ctx.globalAlpha = 0.45;
	ctx.lineWidth = width * 2.6;
	ctx.stroke();
	ctx.globalAlpha = 1;
	ctx.shadowBlur = 6;
	ctx.lineWidth = width;
	ctx.stroke();
	ctx.restore();
}

export function drawTriangle(ctx: CanvasRenderingContext2D, v: View, pts: Pt[], t: number[], fill: string, stroke: string) {
	ctx.save();
	ctx.beginPath();
	ctx.moveTo(v.sx(pts[t[0]][0]), v.sy(pts[t[0]][1]));
	ctx.lineTo(v.sx(pts[t[1]][0]), v.sy(pts[t[1]][1]));
	ctx.lineTo(v.sx(pts[t[2]][0]), v.sy(pts[t[2]][1]));
	ctx.closePath();
	ctx.fillStyle = fill;
	ctx.shadowColor = stroke;
	ctx.shadowBlur = 16;
	ctx.fill();
	ctx.shadowBlur = 0;
	ctx.lineWidth = 1.6;
	ctx.strokeStyle = stroke;
	ctx.stroke();
	ctx.restore();
}

const spriteCache = new Map<string, HTMLCanvasElement>();
function sprite(color: string, size: number): HTMLCanvasElement {
	const key = color + '|' + size;
	const hit = spriteCache.get(key);
	if (hit) return hit;
	const c = document.createElement('canvas');
	const S = Math.ceil(size * 2 * 2);
	c.width = c.height = S;
	const g = c.getContext('2d')!;
	const grad = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
	grad.addColorStop(0, color);
	grad.addColorStop(0.25, color.replace(/[\d.]+\)$/, '0.45)'));
	grad.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
	g.fillStyle = grad;
	g.fillRect(0, 0, S, S);
	spriteCache.set(key, c);
	return c;
}

/** Luminous points: a soft halo sprite and a bright core. */
export function drawPoints(
	ctx: CanvasRenderingContext2D,
	v: View,
	pts: Pt[],
	o: { core?: string; halo?: string; radius?: number; haloSize?: number; ring?: (i: number) => string | null } = {}
) {
	const rad = o.radius ?? 3.3;
	const hs = o.haloSize ?? 11;
	const spr = sprite(o.halo ?? 'rgba(242, 208, 143, 0.55)', hs);
	ctx.save();
	for (const p of pts) ctx.drawImage(spr, v.sx(p[0]) - hs, v.sy(p[1]) - hs, hs * 2, hs * 2);
	pts.forEach((p, i) => {
		const x = v.sx(p[0]);
		const y = v.sy(p[1]);
		const ring = o.ring?.(i);
		if (ring) {
			ctx.beginPath();
			ctx.arc(x, y, rad + 4.5, 0, Math.PI * 2);
			ctx.strokeStyle = ring;
			ctx.lineWidth = 2;
			ctx.shadowColor = ring;
			ctx.shadowBlur = 10;
			ctx.stroke();
			ctx.shadowBlur = 0;
		}
		ctx.beginPath();
		ctx.arc(x, y, rad, 0, Math.PI * 2);
		ctx.fillStyle = o.core ?? '#fff8e8';
		ctx.fill();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(165, 128, 63, 0.9)';
		ctx.stroke();
	});
	ctx.restore();
}

/** Index of the point nearest to (px, py) within `tol` pixels, or −1. */
export function pick(v: View, pts: Pt[], px: number, py: number, tol = 16): number {
	let best = -1;
	let bd = tol * tol;
	pts.forEach((p, i) => {
		const dx = v.sx(p[0]) - px;
		const dy = v.sy(p[1]) - py;
		const d = dx * dx + dy * dy;
		if (d <= bd) {
			bd = d;
			best = i;
		}
	});
	return best;
}
