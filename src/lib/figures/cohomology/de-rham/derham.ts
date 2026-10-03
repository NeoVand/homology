// Numerics for the de Rham chapter: a gallery of 1-forms on (punctured)
// planes, the cone construction of the Poincaré lemma, and the de Rham map
// (integration over edges) on a triangulated annulus.
import { GL8, cross, dot, type Vec2 } from '$lib/figures/cohomology/differential-forms/calc';

export const TAU = 2 * Math.PI;

export interface GalleryForm {
	key: string;
	label: string;
	tex: string;
	/** ω = P dx + Q dy */
	PQ: (x: number, y: number) => Vec2;
	/** dω = g dx∧dy (where ω is defined) */
	g: (x: number, y: number) => number;
	dTeX: string;
	closed: boolean;
	exact: boolean;
	/** a potential f with df = ω on the whole domain, if one exists */
	potential?: (x: number, y: number) => number;
	potentialTeX?: string;
	holes: Vec2[];
	blurb: string;
}

const vortexAt = (c: Vec2, s = 1) => (x: number, y: number): Vec2 => {
	const dx = x - c[0];
	const dy = y - c[1];
	const r2 = dx * dx + dy * dy;
	return [(-s * dy) / r2, (s * dx) / r2];
};

export const gallery: Record<string, GalleryForm> = {
	bowl: {
		key: 'bowl',
		label: 'x dx + y dy',
		tex: String.raw`\omega = x\,dx + y\,dy`,
		PQ: (x, y) => [x, y],
		g: () => 0,
		dTeX: String.raw`d\omega = 0`,
		closed: true,
		exact: true,
		potential: (x, y) => (x * x + y * y) / 2,
		potentialTeX: String.raw`\omega = d\big(\tfrac12(x^2+y^2)\big)`,
		holes: [],
		blurb: 'Exact: it is the differential of ½(x² + y²), so every loop integral is zero.'
	},
	swirl: {
		key: 'swirl',
		label: '−y dx + x dy',
		tex: String.raw`\omega = -y\,dx + x\,dy`,
		PQ: (x, y) => [-y, x],
		g: () => 2,
		dTeX: String.raw`d\omega = 2\,dx\wedge dy \neq 0`,
		closed: false,
		exact: false,
		holes: [],
		blurb: 'Not even closed: dω = 2 dx∧dy, so a loop picks up twice the area it encloses.'
	},
	angle: {
		key: 'angle',
		label: 'dθ',
		tex: String.raw`\omega = d\theta = \frac{-y\,dx + x\,dy}{x^2+y^2}`,
		PQ: vortexAt([0, 0]),
		g: () => 0,
		dTeX: String.raw`d\omega = 0 \text{ on } \R^2\setminus 0`,
		closed: true,
		exact: false,
		holes: [[0, 0]],
		blurb: 'Closed but not exact on the punctured plane: small loops give 0, loops around the hole give 2π.'
	},
	pair: {
		key: 'pair',
		label: 'two vortices',
		tex: String.raw`\omega = d\theta_{a} - d\theta_{b}`,
		PQ: (x, y) => {
			const u = vortexAt([-1, 0])(x, y);
			const v = vortexAt([1, 0])(x, y);
			return [u[0] - v[0], u[1] - v[1]];
		},
		g: () => 0,
		dTeX: String.raw`d\omega = 0 \text{ away from } a, b`,
		closed: true,
		exact: false,
		holes: [
			[-1, 0],
			[1, 0]
		],
		blurb: 'A vortex at a and an opposite one at b. Around a: 2π; around b: −2π; around both: 0.'
	},
	dipole: {
		key: 'dipole',
		label: 'd(x / r²)',
		tex: String.raw`\omega = d\Big(\frac{x}{x^2+y^2}\Big)`,
		PQ: (x, y) => {
			const r2 = x * x + y * y;
			return [(y * y - x * x) / (r2 * r2), (-2 * x * y) / (r2 * r2)];
		},
		g: () => 0,
		dTeX: String.raw`d\omega = 0 \text{ on } \R^2\setminus 0`,
		closed: true,
		exact: true,
		potential: (x, y) => x / (x * x + y * y),
		potentialTeX: String.raw`\omega = d\big(x/(x^2+y^2)\big)`,
		holes: [[0, 0]],
		blurb: 'Also defined only on the punctured plane, and it swirls around the hole — yet it is exact, so every loop gives 0.'
	}
};

// ── Poincaré lemma: the cone construction ──────────────────────────────────

/**
 * f(p) = ∫₀¹ ω(c + t(p − c)) · (p − c) dt, the integral of ω along the ray from c to p.
 * On a region that is star-shaped about c and a closed ω, df = ω.
 */
export function conePotential(PQ: (x: number, y: number) => Vec2, c: Vec2, p: Vec2): number {
	const dx = p[0] - c[0];
	const dy = p[1] - c[1];
	let s = 0;
	for (let i = 0; i < 8; i++) {
		const t = GL8.x[i];
		const [P, Q] = PQ(c[0] + t * dx, c[1] + t * dy);
		s += GL8.w[i] * (P * dx + Q * dy);
	}
	return s;
}

/** The closed form used for the star-shaped demo, ω = df with f hidden from the reader. */
export const hiddenF = (x: number, y: number) => Math.sin(1.3 * x) * Math.cos(0.9 * y) + 0.3 * x * y;
export const hiddenPQ = (x: number, y: number): Vec2 => [
	1.3 * Math.cos(1.3 * x) * Math.cos(0.9 * y) + 0.3 * y,
	-0.9 * Math.sin(1.3 * x) * Math.sin(0.9 * y) + 0.3 * x
];

/** a five-petalled star-shaped region about the origin: r < starR(θ) */
export const starR = (th: number) => 1.55 + 0.38 * Math.sin(5 * th + 0.4);

/** Does the straight segment from c to p avoid the closed disk of radius r0 about the origin? */
export function segmentAvoidsDisk(c: Vec2, p: Vec2, r0: number): boolean {
	const d: Vec2 = [p[0] - c[0], p[1] - c[1]];
	const L2 = dot(d, d);
	let t = L2 > 0 ? -dot(c, d) / L2 : 0;
	t = Math.max(0, Math.min(1, t));
	const q: Vec2 = [c[0] + t * d[0], c[1] + t * d[1]];
	return Math.hypot(q[0], q[1]) > r0;
}

// ── the de Rham map on a triangulated annulus ──────────────────────────────

/** vertices: a0,a1,a2 inner (ids 0,1,2), b0,b1,b2 outer (ids 3,4,5) */
export const annulusPos: Vec2[] = (() => {
	const out: Vec2[] = [];
	const deg = Math.PI / 180;
	for (let i = 0; i < 3; i++) out.push([0.9 * Math.cos((90 + 120 * i) * deg), 0.9 * Math.sin((90 + 120 * i) * deg)]);
	for (let i = 0; i < 3; i++) out.push([2.1 * Math.cos((30 + 120 * i) * deg), 2.1 * Math.sin((30 + 120 * i) * deg)]);
	return out;
})();

/** edges, oriented from the lower to the higher label (the book's convention) */
export const annulusEdges: [number, number][] = [
	[0, 1],
	[0, 2],
	[0, 3],
	[0, 4],
	[1, 2],
	[1, 4],
	[1, 5],
	[2, 3],
	[2, 5],
	[3, 4],
	[3, 5],
	[4, 5]
];

/** triangles [v0, v1, v2] with v0 < v1 < v2 */
export const annulusTris: [number, number, number][] = [
	[0, 1, 4],
	[1, 2, 5],
	[0, 2, 3],
	[0, 3, 4],
	[1, 4, 5],
	[2, 3, 5]
];

export type EdgeForm = 'angle' | 'xdy' | 'exact';

/** ∫ over the straight edge p→q of the chosen 1-form */
export function edgeIntegral(form: EdgeForm, p: Vec2, q: Vec2): number {
	if (form === 'angle') return Math.atan2(cross(p, q), dot(p, q));
	if (form === 'xdy') return ((p[0] + q[0]) / 2) * (q[1] - p[1]);
	const f = (v: Vec2) => (v[0] * v[0] + v[1] * v[1]) / 2;
	return f(q) - f(p);
}

/** the 1-cochain obtained by integrating over each edge */
export function deRhamCochain(form: EdgeForm): number[] {
	return annulusEdges.map(([i, j]) => edgeIntegral(form, annulusPos[i], annulusPos[j]));
}

/** value of a cochain on an oriented edge i→j (either orientation) */
export function onEdge(cochain: number[], i: number, j: number): number {
	const k = annulusEdges.findIndex(([a, b]) => (a === i && b === j) || (a === j && b === i));
	if (k < 0) throw new Error(`no edge ${i}${j}`);
	return annulusEdges[k][0] === i ? cochain[k] : -cochain[k];
}

/** sum of a cochain around a closed vertex path v0 → v1 → … → v0 */
export function loopSum(cochain: number[], path: number[]): number {
	let s = 0;
	for (let k = 0; k < path.length; k++) s += onEdge(cochain, path[k], path[(k + 1) % path.length]);
	return s;
}

export const innerLoop = [0, 1, 2];
export const outerLoop = [3, 4, 5];
