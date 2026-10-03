// Planar vector fields used by the flow figures, implemented twice:
// in TypeScript (for numerics, probes and particle advection) and in GLSL
// (for the line-integral-convolution shader). Keep the two in sync — the
// constants live in one place (C) and are spliced into the GLSL source.
import type { Vec2 } from './calc';

export interface FieldPreset {
	key: string;
	label: string;
	/** index understood by the GLSL `field()` switch */
	id: number;
	F: (x: number, y: number) => Vec2;
	/** scalar curl ∂Q/∂x − ∂P/∂y */
	curl: (x: number, y: number) => number;
	/** divergence ∂P/∂x + ∂Q/∂y */
	div: (x: number, y: number) => number;
	/** a potential f with ∇f = F on the whole plane (if one exists) */
	potential?: (x: number, y: number) => number;
	/** points where the field is undefined */
	singular?: Vec2[];
	/** TeX for the field, its curl and divergence */
	tex: string;
	curlTex: string;
	divTex: string;
	/** one plain-language line */
	blurb: string;
}

// shared constants
const C = {
	hills: { a1: 1.15, c1: [0.85, 0.35] as Vec2, s1: 0.75, a2: 0.8, c2: [-0.95, -0.5] as Vec2, s2: 0.5, k: 0.12 },
	eddies: { k: 1.6, c: 1.1, s: 0.6 },
	ss: { k: 1.4, c: 1.0, s: 0.6 }
};

/** h = a·exp(−|p−c|²/s), with gradient and Laplacian. */
function gauss(x: number, y: number, c: Vec2, s: number, a = 1) {
	const dx = x - c[0];
	const dy = y - c[1];
	const r2 = dx * dx + dy * dy;
	const h = a * Math.exp(-r2 / s);
	return { h, hx: (-2 * dx * h) / s, hy: (-2 * dy * h) / s, lap: h * ((4 * r2) / (s * s) - 4 / s) };
}

const H = C.hills;
const hillsF = (x: number, y: number): Vec2 => {
	const g1 = gauss(x, y, H.c1, H.s1, H.a1);
	const g2 = gauss(x, y, H.c2, H.s2, H.a2);
	return [g1.hx + g2.hx - 2 * H.k * x, g1.hy + g2.hy - 2 * H.k * y];
};

const E = C.eddies;
function eddyPsi(x: number, y: number) {
	const g1 = gauss(x, y, [E.c, 0], E.s);
	const g2 = gauss(x, y, [-E.c, 0], E.s);
	return { psi: g1.h - g2.h, px: g1.hx - g2.hx, py: g1.hy - g2.hy, lap: g1.lap - g2.lap };
}

const S = C.ss;
function ssG(x: number, y: number) {
	const g1 = gauss(x, y, [-S.c, 0], S.s);
	const g2 = gauss(x, y, [S.c, 0], S.s);
	return { g: g1.h - g2.h, gx: g1.hx - g2.hx, gy: g1.hy - g2.hy, lap: g1.lap - g2.lap };
}

export const fields: Record<string, FieldPreset> = {
	hills: {
		key: 'hills',
		label: 'Gradient',
		id: 0,
		F: hillsF,
		curl: () => 0,
		div: (x, y) => gauss(x, y, H.c1, H.s1, H.a1).lap + gauss(x, y, H.c2, H.s2, H.a2).lap - 4 * H.k,
		potential: (x, y) => gauss(x, y, H.c1, H.s1, H.a1).h + gauss(x, y, H.c2, H.s2, H.a2).h - H.k * (x * x + y * y),
		tex: String.raw`\mathbf F = \nabla f`,
		curlTex: '0',
		divTex: String.raw`\nabla^2 f`,
		blurb: 'The gradient of a landscape with two hills: every arrow points straight uphill.'
	},
	rotation: {
		key: 'rotation',
		label: 'Rotation',
		id: 1,
		F: (x, y) => [-y, x],
		curl: () => 2,
		div: () => 0,
		tex: String.raw`\mathbf F = (-y,\ x)`,
		curlTex: '2',
		divTex: '0',
		blurb: 'A rigid rotation: the whole plane spins counterclockwise, faster farther out.'
	},
	source: {
		key: 'source',
		label: 'Source',
		id: 2,
		F: (x, y) => [x, y],
		curl: () => 0,
		div: () => 2,
		potential: (x, y) => (x * x + y * y) / 2,
		tex: String.raw`\mathbf F = (x,\ y)`,
		curlTex: '0',
		divTex: '2',
		blurb: 'Everything streams outward, as if fluid were being created at every point.'
	},
	saddle: {
		key: 'saddle',
		label: 'Saddle',
		id: 3,
		F: (x, y) => [x, -y],
		curl: () => 0,
		div: () => 0,
		potential: (x, y) => (x * x - y * y) / 2,
		tex: String.raw`\mathbf F = (x,\ -y)`,
		curlTex: '0',
		divTex: '0',
		blurb: 'Fluid arrives from above and below and leaves to the left and right.'
	},
	shear: {
		key: 'shear',
		label: 'Shear',
		id: 4,
		F: (x, y) => [y, 0],
		curl: () => -1,
		div: () => 0,
		tex: String.raw`\mathbf F = (y,\ 0)`,
		curlTex: '-1',
		divTex: '0',
		blurb: 'Straight streamlines, but faster above than below — a paddle wheel still turns.'
	},
	vortex: {
		key: 'vortex',
		label: 'Vortex',
		id: 5,
		F: (x, y) => {
			const r2 = x * x + y * y;
			return [-y / r2, x / r2];
		},
		curl: () => 0,
		div: () => 0,
		singular: [[0, 0]],
		tex: String.raw`\mathbf F = \Big(\tfrac{-y}{x^2+y^2},\ \tfrac{x}{x^2+y^2}\Big)`,
		curlTex: '0',
		divTex: '0',
		blurb: 'A whirlpool around a missing point: it circles the origin, yet has no swirl anywhere.'
	},
	eddies: {
		key: 'eddies',
		label: 'Two eddies',
		id: 6,
		F: (x, y) => {
			const e = eddyPsi(x, y);
			return [E.k * e.py, -E.k * e.px];
		},
		curl: (x, y) => -E.k * eddyPsi(x, y).lap,
		div: () => 0,
		tex: String.raw`\mathbf F = (\partial_y \psi,\ -\partial_x \psi)`,
		curlTex: String.raw`-\nabla^2\psi`,
		divTex: '0',
		blurb: 'A counterclockwise eddy on the right and a clockwise one on the left.'
	},
	sourcesink: {
		key: 'sourcesink',
		label: 'Source & sink',
		id: 7,
		F: (x, y) => {
			const g = ssG(x, y);
			return [-S.k * g.gx, -S.k * g.gy];
		},
		curl: () => 0,
		div: (x, y) => -S.k * ssG(x, y).lap,
		potential: (x, y) => -S.k * ssG(x, y).g,
		tex: String.raw`\mathbf F = -\nabla g`,
		curlTex: '0',
		divTex: String.raw`-\nabla^2 g`,
		blurb: 'Fluid is created on the left and swallowed on the right.'
	}
};

const f = (x: number) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const v2 = (p: Vec2) => `vec2(${f(p[0])}, ${f(p[1])})`;

/** GLSL implementing field(p), curlF(p), divF(p), potF(p) and hasPot() for `uniform int uField`. */
export const FIELD_GLSL = /* glsl */ `
	vec4 gaussH(vec2 p, vec2 c, float s, float a) {
		vec2 d = p - c;
		float r2 = dot(d, d);
		float h = a * exp(-r2 / s);
		return vec4(h, -2.0 * d.x * h / s, -2.0 * d.y * h / s, h * (4.0 * r2 / (s * s) - 4.0 / s));
	}
	vec2 field(vec2 p) {
		if (uField == 0) {
			vec4 g1 = gaussH(p, ${v2(H.c1)}, ${f(H.s1)}, ${f(H.a1)});
			vec4 g2 = gaussH(p, ${v2(H.c2)}, ${f(H.s2)}, ${f(H.a2)});
			return g1.yz + g2.yz - 2.0 * ${f(H.k)} * p;
		} else if (uField == 1) {
			return vec2(-p.y, p.x);
		} else if (uField == 2) {
			return p;
		} else if (uField == 3) {
			return vec2(p.x, -p.y);
		} else if (uField == 4) {
			return vec2(p.y, 0.0);
		} else if (uField == 5) {
			float r2 = max(dot(p, p), 1e-6);
			return vec2(-p.y, p.x) / r2;
		} else if (uField == 6) {
			vec4 g1 = gaussH(p, vec2(${f(E.c)}, 0.0), ${f(E.s)}, 1.0);
			vec4 g2 = gaussH(p, vec2(-${f(E.c)}, 0.0), ${f(E.s)}, 1.0);
			vec4 e = g1 - g2;
			return ${f(E.k)} * vec2(e.z, -e.y);
		} else {
			vec4 g1 = gaussH(p, vec2(-${f(S.c)}, 0.0), ${f(S.s)}, 1.0);
			vec4 g2 = gaussH(p, vec2(${f(S.c)}, 0.0), ${f(S.s)}, 1.0);
			vec4 g = g1 - g2;
			return -${f(S.k)} * g.yz;
		}
	}
	float curlF(vec2 p) {
		if (uField == 1) return 2.0;
		if (uField == 4) return -1.0;
		if (uField == 6) {
			vec4 g1 = gaussH(p, vec2(${f(E.c)}, 0.0), ${f(E.s)}, 1.0);
			vec4 g2 = gaussH(p, vec2(-${f(E.c)}, 0.0), ${f(E.s)}, 1.0);
			return -${f(E.k)} * (g1.w - g2.w);
		}
		return 0.0;
	}
	float divF(vec2 p) {
		if (uField == 0) {
			vec4 g1 = gaussH(p, ${v2(H.c1)}, ${f(H.s1)}, ${f(H.a1)});
			vec4 g2 = gaussH(p, ${v2(H.c2)}, ${f(H.s2)}, ${f(H.a2)});
			return g1.w + g2.w - 4.0 * ${f(H.k)};
		}
		if (uField == 2) return 2.0;
		if (uField == 7) {
			vec4 g1 = gaussH(p, vec2(-${f(S.c)}, 0.0), ${f(S.s)}, 1.0);
			vec4 g2 = gaussH(p, vec2(${f(S.c)}, 0.0), ${f(S.s)}, 1.0);
			return -${f(S.k)} * (g1.w - g2.w);
		}
		return 0.0;
	}
	bool hasPot() { return uField == 0 || uField == 2 || uField == 3 || uField == 5 || uField == 7; }
	float potF(vec2 p) {
		if (uField == 0) {
			vec4 g1 = gaussH(p, ${v2(H.c1)}, ${f(H.s1)}, ${f(H.a1)});
			vec4 g2 = gaussH(p, ${v2(H.c2)}, ${f(H.s2)}, ${f(H.a2)});
			return g1.x + g2.x - ${f(H.k)} * dot(p, p);
		}
		if (uField == 2) return 0.5 * dot(p, p);
		if (uField == 3) return 0.5 * (p.x * p.x - p.y * p.y);
		if (uField == 5) return atan(p.y, p.x);
		if (uField == 7) {
			vec4 g1 = gaussH(p, vec2(-${f(S.c)}, 0.0), ${f(S.s)}, 1.0);
			vec4 g2 = gaussH(p, vec2(${f(S.c)}, 0.0), ${f(S.s)}, 1.0);
			return -${f(S.k)} * (g1.x - g2.x);
		}
		return 0.0;
	}
	// spacing of potential level lines (vortex: 16 rays per turn)
	float potSpacing() {
		if (uField == 5) return 6.2831853 / 16.0;
		if (uField == 0) return 0.1;
		if (uField == 7) return 0.12;
		return 0.25;
	}
`;
