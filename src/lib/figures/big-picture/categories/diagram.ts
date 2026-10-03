// Geometry for hand-drawn commutative diagrams: curved arrows, loops, labels.
export type Pt = [number, number];

export interface ArrowGeom {
	/** SVG path data */
	d: string;
	/** where to put the label */
	label: Pt;
	/** a point halfway along the curve */
	mid: Pt;
	/** start and end after shortening */
	start: Pt;
	end: Pt;
	/** control point of the quadratic Bézier */
	ctrl: Pt;
	length: number;
}

const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const mul = (a: Pt, s: number): Pt => [a[0] * s, a[1] * s];
const len = (a: Pt) => Math.hypot(a[0], a[1]) || 1;
const unit = (a: Pt): Pt => mul(a, 1 / len(a));

export function lerp(a: Pt, b: Pt, t: number): Pt {
	return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** Point at parameter t on the quadratic Bézier a → c → b. */
export function quad(a: Pt, c: Pt, b: Pt, t: number): Pt {
	const u = 1 - t;
	return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
}

/**
 * A (possibly curved) arrow from a to b. `bend` is the sideways offset of the
 * curve's midpoint as a fraction of the distance (positive bends to the left of
 * the direction of travel, in SVG coordinates where y grows downwards).
 * `gapA`/`gapB` shorten the arrow at either end (to clear node labels).
 */
export function arrow(a: Pt, b: Pt, bend = 0, gapA = 22, gapB = 22, labelOffset = 14): ArrowGeom {
	const ab = sub(b, a);
	const L = len(ab);
	const n: Pt = [ab[1] / L, -ab[0] / L]; // left normal (screen coordinates)
	const ctrl0 = add(lerp(a, b, 0.5), mul(n, bend * L));
	// shorten along the curve: move the endpoints towards the control point
	const start = add(a, mul(unit(sub(ctrl0, a)), gapA));
	const end = add(b, mul(unit(sub(ctrl0, b)), gapB));
	const ctrl = add(lerp(start, end, 0.5), mul(n, bend * len(sub(end, start))));
	const mid = quad(start, ctrl, end, 0.5);
	const side = bend >= 0 ? 1 : -1;
	const label = add(mid, mul(n, labelOffset * side));
	return {
		d: `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} Q ${ctrl[0].toFixed(2)} ${ctrl[1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`,
		label,
		mid,
		start,
		end,
		ctrl,
		length: len(sub(end, start))
	};
}

/** An arrow whose label sits on the right-hand side instead. */
export function arrowR(a: Pt, b: Pt, bend = 0, gapA = 22, gapB = 22, labelOffset = 14): ArrowGeom {
	const g = arrow(a, b, bend, gapA, gapB, -labelOffset);
	return g;
}

/**
 * A loop at c (an endomorphism, e.g. an identity), bulging in direction `angle`
 * (radians; 0 = right, −π/2 = up) with size r.
 */
export function loop(c: Pt, angle: number, r = 26, spread = 0.55, gap = 14): ArrowGeom {
	const dir: Pt = [Math.cos(angle), Math.sin(angle)];
	const left: Pt = [Math.cos(angle - spread), Math.sin(angle - spread)];
	const right: Pt = [Math.cos(angle + spread), Math.sin(angle + spread)];
	const start = add(c, mul(left, gap));
	const end = add(c, mul(right, gap));
	const c1 = add(c, mul(left, gap + r * 1.9));
	const c2 = add(c, mul(right, gap + r * 1.9));
	const top = add(c, mul(dir, gap + r * 1.45));
	return {
		d: `M ${start[0].toFixed(2)} ${start[1].toFixed(2)} C ${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${end[0].toFixed(2)} ${end[1].toFixed(2)}`,
		label: add(c, mul(dir, gap + r * 1.45 + 13)),
		mid: top,
		start,
		end,
		ctrl: top,
		length: r * 4
	};
}

/** Ease in-out (cubic). */
export function ease(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Run an eased animation for `ms` milliseconds, calling `frame(t)` with t ∈ [0, 1].
 * Returns a cancel function. With reduced motion the animation jumps to the end.
 */
export function animate(ms: number, frame: (t: number) => void, done?: () => void): () => void {
	const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
	if (reduced || ms <= 0 || typeof requestAnimationFrame === 'undefined') {
		frame(1);
		done?.();
		return () => {};
	}
	let raf = 0;
	const t0 = performance.now();
	const step = (now: number) => {
		const t = Math.min(1, (now - t0) / ms);
		frame(ease(t));
		if (t < 1) raf = requestAnimationFrame(step);
		else done?.();
	};
	raf = requestAnimationFrame(step);
	return () => cancelAnimationFrame(raf);
}
