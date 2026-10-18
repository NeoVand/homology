// Four pictures of surfaces that cannot sit in ordinary space without crossing
// themselves, as maps of the unit square, plus (for the two Klein bottles) a
// "fourth coordinate" w that pulls the crossing sheets apart in 4D.
import type { P3 } from './sheet';
import { presets, boyRaw } from './morphs';
import { traceDoubleCurves, type DoubleCurve } from './doubleCurve';

const TAU = Math.PI * 2;

export type ImmersionId = 'bottle' | 'fig8' | 'boy' | 'crosscap';

export interface Immersion {
	id: ImmersionId;
	label: string;
	f: (u: number, v: number, o: P3) => void;
	/** fourth coordinate in [−1, 1], continuous on the glued surface (null: not offered) */
	w: ((u: number, v: number) => number) | null;
	/** extra points to mark (triple point, pinch points), in the same coordinates as f */
	marks: P3[];
	/** a double curve known exactly (flat list of segment end points), instead of tracing it */
	doubleCurve?: number[];
	/** takes a parameter point that has left the unit square back in, through the gluing (in place) */
	wrap?: (p: Float64Array, k: number) => void;
	/** grid lines along u and v for the material */
	grid: [number, number];
}

const R8 = 2.0;

export const immersions: Record<ImmersionId, Immersion> = {
	bottle: {
		id: 'bottle',
		label: 'Klein bottle',
		// the bottle from the gluing workshop: (x, 0) ~ (1 − x, 1), (0, y) ~ (1, y)
		f: (u, v, o) => presets.klein.f(u, v, 1, o),
		w: (_u, v) => Math.cos(TAU * v + 2.1),
		marks: [],
		wrap: (p, k) => {
			p[k] -= Math.floor(p[k]);
			if (p[k + 1] > 1 || p[k + 1] < 0) {
				p[k + 1] -= Math.floor(p[k + 1]);
				p[k] = 1 - p[k];
			}
		},
		grid: [8, 12]
	},
	fig8: {
		id: 'fig8',
		label: 'Klein bottle, figure-8',
		// a figure-eight cross-section that turns half a revolution on the way round
		f: (u, v, o) => {
			const th = u * TAU;
			const V = v * TAU;
			const a = R8 + Math.cos(th / 2) * Math.sin(V) - Math.sin(th / 2) * Math.sin(2 * V);
			o.x = a * Math.cos(th);
			o.y = Math.sin(th / 2) * Math.sin(V) + Math.cos(th / 2) * Math.sin(2 * V);
			o.z = a * Math.sin(th);
		},
		// w = cos V: the two sheets crossing along the core circle have V = 0 and V = π
		w: (_u, v) => Math.cos(v * TAU),
		marks: [],
		// (1, y) ~ (0, 1 − y), and v goes round
		wrap: (p, k) => {
			p[k + 1] -= Math.floor(p[k + 1]);
			if (p[k] > 1 || p[k] < 0) {
				p[k] -= Math.floor(p[k]);
				p[k + 1] = 1 - p[k + 1];
			}
		},
		grid: [24, 12]
	},
	boy: {
		id: 'boy',
		label: 'Boy’s surface',
		// the unit disk w = v·e^{2πiu}; opposite rim points meet
		f: (u, v, o) => {
			const r = Math.min(v, 0.99995);
			boyRaw(r * Math.cos(TAU * u), r * Math.sin(TAU * u), o);
		},
		w: null,
		// the triple point: where three sheets pass through one point
		marks: [{ x: 0, y: 0, z: 0 }],
		grid: [24, 10]
	},
	crosscap: {
		id: 'crosscap',
		label: 'Cross-cap',
		// a hemisphere whose rim is zipped shut along a segment (antipodal rim points meet)
		f: (u, v, o) => {
			const ph = (v * Math.PI) / 2;
			const px = Math.sin(ph) * Math.cos(TAU * u);
			const py = Math.sin(ph) * Math.sin(TAU * u);
			const pz = Math.cos(ph);
			o.x = 2 * px * pz;
			o.y = pz * pz - px * px;
			o.z = 2 * py * pz;
		},
		w: null,
		// the two pinch points at the ends of the double segment
		marks: [
			{ x: 0, y: 0, z: 0 },
			{ x: 0, y: -1, z: 0 }
		],
		doubleCurve: [0, 0, 0, 0, -1, 0],
		grid: [24, 10]
	}
};

/**
 * Boy's surface over the square [0, 1]², as the disk's square around it: w = (2u − 1) + (2v − 1)i. The formula
 * makes sense on the whole plane and gives the same point at w and at −1/w̄, so a point that leaves the
 * disk can be taken back in there; unlike the polar picture, this one has no seam and no centre.
 */
const boySquare = (u: number, v: number, o: P3) => boyRaw(2 * u - 1, 2 * v - 1, o);
const boyWrap = (p: Float64Array, k: number) => {
	const a = 2 * p[k] - 1;
	const b = 2 * p[k + 1] - 1;
	const r2 = a * a + b * b;
	if (r2 > 1) {
		p[k] = (1 - a / r2) / 2;
		p[k + 1] = (1 - b / r2) / 2;
	}
};

const traced = new Map<ImmersionId, DoubleCurve[]>();
/**
 * The double curves of a surface that crosses itself, traced exactly (doubleCurve.ts). For Boy's surface
 * the parameters are those of boySquare: the disk point w = (2u − 1) + (2v − 1)i.
 */
export function doubleCurveOf(id: Exclude<ImmersionId, 'crosscap'>): DoubleCurve[] {
	let c = traced.get(id);
	if (!c) {
		const im = immersions[id];
		c = id === 'boy' ? traceDoubleCurves(boySquare, { wrap: boyWrap, grid: 48 }) : traceDoubleCurves(im.f, { wrap: im.wrap, grid: 48 });
		traced.set(id, c);
	}
	return c;
}

export const immersionOrder: ImmersionId[] = ['bottle', 'fig8', 'boy', 'crosscap'];

/** Sample a surface on an (n+1)² grid, shifted slightly in v to keep special rows off the grid. */
export function sampleGrid(f: (u: number, v: number, o: P3) => void, n: number, shift = 0.0131) {
	const pts = new Float32Array((n + 1) * (n + 1) * 3);
	const p = { x: 0, y: 0, z: 0 };
	for (let j = 0; j <= n; j++)
		for (let i = 0; i <= n; i++) {
			f(i / n, Math.min(1, j / n + (j > 0 && j < n ? shift / n : 0)), p);
			const k = 3 * (j * (n + 1) + i);
			pts[k] = p.x;
			pts[k + 1] = p.y;
			pts[k + 2] = p.z;
		}
	return pts;
}
