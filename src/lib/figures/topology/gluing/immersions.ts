// Four pictures of surfaces that cannot sit in ordinary space without crossing
// themselves, as maps of the unit square, plus (for the two Klein bottles) a
// "fourth coordinate" w that pulls the crossing sheets apart in 4D.
import type { P3 } from './sheet';
import { presets, boyRaw } from './morphs';

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
	/** a double curve known exactly (flat list of segment end points), instead of searching for it */
	doubleCurve?: number[];
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
