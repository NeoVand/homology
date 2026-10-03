// The six hemisphere charts of the unit sphere S² ⊂ ℝ³, in math coordinates
// (x, y, z) with z up. Chart U_{a±} = { ±a > 0 } and φ forgets the a-coordinate.

export type Axis = 'x' | 'y' | 'z';
export interface Chart {
	id: string;
	axis: Axis;
	sign: 1 | -1;
	/** the two coordinates the chart keeps, in order */
	keep: [Axis, Axis];
	color: string;
	tex: string;
}

const idx: Record<Axis, number> = { x: 0, y: 1, z: 2 };

export const charts: Chart[] = [
	{ id: 'z+', axis: 'z', sign: 1, keep: ['x', 'y'], color: '#f2d08f', tex: 'z>0' },
	{ id: 'x+', axis: 'x', sign: 1, keep: ['y', 'z'], color: '#5fd6cf', tex: 'x>0' },
	{ id: 'y+', axis: 'y', sign: 1, keep: ['x', 'z'], color: '#74a9ff', tex: 'y>0' },
	{ id: 'z-', axis: 'z', sign: -1, keep: ['x', 'y'], color: '#f28db6', tex: 'z<0' },
	{ id: 'x-', axis: 'x', sign: -1, keep: ['y', 'z'], color: '#a493ff', tex: 'x<0' },
	{ id: 'y-', axis: 'y', sign: -1, keep: ['x', 'z'], color: '#84d9a2', tex: 'y<0' }
];

export type V3 = [number, number, number];

export function inChart(c: Chart, p: V3, eps = 1e-9): boolean {
	return c.sign * p[idx[c.axis]] > eps;
}

/** φ(p): the two kept coordinates. */
export function chartMap(c: Chart, p: V3): [number, number] {
	return [p[idx[c.keep[0]]], p[idx[c.keep[1]]]];
}

/** φ⁻¹(u, v): the point of the hemisphere above (u, v) (u² + v² < 1). */
export function chartInverse(c: Chart, u: number, v: number): V3 {
	const p: V3 = [0, 0, 0];
	p[idx[c.keep[0]]] = u;
	p[idx[c.keep[1]]] = v;
	p[idx[c.axis]] = c.sign * Math.sqrt(Math.max(0, 1 - u * u - v * v));
	return p;
}

/** TeX for the transition map φ_β ∘ φ_α⁻¹ in the variables (u, v). */
export function transitionTeX(a: Chart, b: Chart): string {
	const root = String.raw`\sqrt{1-u^2-v^2}`;
	const expr = (axis: Axis) => {
		if (axis === a.keep[0]) return 'u';
		if (axis === a.keep[1]) return 'v';
		return (a.sign < 0 ? '-' : '') + root;
	};
	return String.raw`(u,v) \mapsto \bigl(${expr(b.keep[0])},\ ${expr(b.keep[1])}\bigr)`;
}

/** Apply φ_β ∘ φ_α⁻¹ numerically. */
export function transition(a: Chart, b: Chart, u: number, v: number): [number, number] {
	return chartMap(b, chartInverse(a, u, v));
}
