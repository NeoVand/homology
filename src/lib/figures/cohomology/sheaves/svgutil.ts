// Pointer helpers for interactive SVG figures.

/** Convert a pointer event to the SVG's user (viewBox) coordinates. */
export function svgPoint(svg: SVGSVGElement, e: { clientX: number; clientY: number }): { x: number; y: number } {
	const ctm = svg.getScreenCTM();
	if (!ctm) return { x: 0, y: 0 };
	const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
	return { x: p.x, y: p.y };
}

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Smooth ease for animations (cubic in-out). */
export const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Format a number with a real minus sign. */
export function fmt(v: number, digits = 2): string {
	const s = Math.abs(v) < 0.5 * Math.pow(10, -digits) ? (0).toFixed(digits) : v.toFixed(digits);
	return s.startsWith('-') ? '−' + s.slice(1) : s;
}

export function prefersReducedMotion(): boolean {
	return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
