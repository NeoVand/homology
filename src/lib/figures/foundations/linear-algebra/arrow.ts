// Arrowheads drawn as polygons (in SVG pixel coordinates), so their size and
// colour are fully under our control.

/** Polygon points for an arrowhead whose tip is at (x, y), pointing along (dx, dy). */
export function headPoints(x: number, y: number, dx: number, dy: number, size = 11, width = 0.55): string {
	const L = Math.hypot(dx, dy);
	if (L < 1e-9) return '';
	const ux = dx / L;
	const uy = dy / L;
	const bx = x - ux * size;
	const by = y - uy * size;
	const px = -uy * size * width;
	const py = ux * size * width;
	const notchX = x - ux * size * 0.72;
	const notchY = y - uy * size * 0.72;
	return `${x},${y} ${bx + px},${by + py} ${notchX},${notchY} ${bx - px},${by - py}`;
}

/** Shorten a segment so a stroke ends under the arrowhead instead of poking through. */
export function shaftEnd(x0: number, y0: number, x1: number, y1: number, size = 11): [number, number] {
	const L = Math.hypot(x1 - x0, y1 - y0);
	if (L < 1e-9) return [x1, y1];
	const k = Math.max(0, (L - size * 0.7) / L);
	return [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k];
}
