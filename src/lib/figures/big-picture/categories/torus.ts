// A torus drawn in 2D (oblique view) with curves on it, for SVG figures.
export interface TorusView {
	cx: number;
	cy: number;
	/** pixels per unit */
	s: number;
	R: number;
	r: number;
	/** elevation of the viewer above the torus's plane (radians) */
	tilt: number;
}

export function torusPoint(T: TorusView, u: number, v: number) {
	const { R, r, tilt } = T;
	const x = (R + r * Math.cos(v)) * Math.cos(u);
	const y = (R + r * Math.cos(v)) * Math.sin(u);
	const z = r * Math.sin(v);
	const up = y * Math.sin(tilt) + z * Math.cos(tilt);
	// normal and viewing direction (0, −cos tilt, sin tilt)
	const nx = Math.cos(v) * Math.cos(u);
	const ny = Math.cos(v) * Math.sin(u);
	const nz = Math.sin(v);
	void nx;
	const facing = -ny * Math.cos(tilt) + nz * Math.sin(tilt);
	return { X: T.cx + x * T.s, Y: T.cy - up * T.s, facing };
}

export interface Seg {
	d: string;
	front: boolean;
}

/**
 * The closed curve t ↦ (u₀ + 2πp t, v₀ + 2πq t) on the torus, split into
 * front-facing and hidden runs (for depth cueing).
 */
export function torusCurve(T: TorusView, p: number, q: number, u0 = -Math.PI / 2, v0 = Math.PI / 2, n = 400): Seg[] {
	const pts = Array.from({ length: n + 1 }, (_, k) => {
		const t = k / n;
		return torusPoint(T, u0 + 2 * Math.PI * p * t, v0 + 2 * Math.PI * q * t);
	});
	const segs: Seg[] = [];
	let cur: string[] = [];
	let front = pts[0].facing > 0;
	for (let k = 0; k < pts.length; k++) {
		const f = pts[k].facing > 0;
		if (f !== front && cur.length) {
			cur.push(`${pts[k].X.toFixed(1)},${pts[k].Y.toFixed(1)}`);
			segs.push({ d: 'M' + cur.join(' L'), front });
			cur = [];
			front = f;
		}
		cur.push(`${pts[k].X.toFixed(1)},${pts[k].Y.toFixed(1)}`);
	}
	if (cur.length > 1) segs.push({ d: 'M' + cur.join(' L'), front });
	return segs;
}

/** Outline of the torus: outer silhouette and the visible hole (approximate ellipses). */
export function torusOutline(T: TorusView) {
	const { R, r, tilt, s, cx, cy } = T;
	return {
		outer: { cx, cy, rx: (R + r) * s, ry: (R * Math.sin(tilt) + r) * s },
		hole: { cx, cy: cy - 0.0 * s, rx: (R - r) * s * 0.98, ry: Math.max(0, R * Math.sin(tilt) - r) * s }
	};
}

/** Parallels (v = const) and meridians (u = const) as depth-cued segments, for a grid. */
export function torusGrid(T: TorusView, nu = 18, nv = 8): Seg[] {
	const out: Seg[] = [];
	for (let i = 0; i < nu; i++) {
		const u = (2 * Math.PI * i) / nu;
		out.push(...torusCurve(T, 0, 1, u, 0, 60));
	}
	for (let j = 0; j < nv; j++) {
		const v = (2 * Math.PI * j) / nv;
		out.push(...torusCurve(T, 1, 0, 0, v, 120));
	}
	return out;
}

/** A closed curve winding w times around a circle (a "coil"), or a small contractible loop if w = 0. */
export function coil(cx: number, cy: number, rho: number, w: number, amp = 9, n = 360): string {
	const pts: string[] = [];
	for (let k = 0; k <= n; k++) {
		const t = (2 * Math.PI * k) / n;
		let x: number;
		let y: number;
		if (w === 0) {
			x = cx + rho * Math.cos(-Math.PI / 2) + amp * 1.4 * Math.cos(t);
			y = cy + rho * Math.sin(-Math.PI / 2) + amp * 1.4 * Math.sin(t) + amp * 0.6;
		} else {
			const a = w * t - Math.PI / 2;
			const rr = rho + amp * Math.cos(t) * (Math.abs(w) > 1 ? 1 : 0.35);
			x = cx + rr * Math.cos(a);
			y = cy + rr * Math.sin(a);
		}
		pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
	}
	return 'M' + pts.join(' L') + ' Z';
}
