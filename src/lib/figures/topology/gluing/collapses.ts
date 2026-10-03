// Collapsing a subspace A of X to a single point: five examples as morphs of
// the unit square (u, v). At t = 1 every point of A lands on one point (tested).
import type { P3 } from './sheet';

export type CollapseId = 'disk' | 'cone' | 'susp' | 'equator' | 'pinch';
const TAU = Math.PI * 2;

const ease = (x: number) => {
	const t = Math.min(1, Math.max(0, x));
	return t * t * (3 - 2 * t);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export interface Collapse {
	id: CollapseId;
	label: string;
	/** TeX: X/A ≅ result */
	result: string;
	/** what A is, in words */
	what: string;
	f: (u: number, v: number, t: number, o: P3) => void;
	/** the curves that make up A, as functions s ↦ (u, v) */
	A: ((s: number) => [number, number])[];
}

export const collapses: Record<CollapseId, Collapse> = {
	disk: {
		id: 'disk',
		label: 'Disk ⁄ its rim',
		result: 'D^2/\\partial D^2 \\cong S^2',
		what: 'the boundary circle of the disk',
		// u around, v from the centre (0) to the rim (1): the disk curls into a ball-shaped bag
		f: (u, v, t, o) => {
			const e = ease(t);
			const L = 1.6;
			const th = Math.max(1e-5, e * Math.PI);
			const S = L / th;
			const a = v * th;
			const r = S * Math.sin(a);
			o.x = r * Math.cos(TAU * u);
			o.z = r * Math.sin(TAU * u);
			o.y = S * (Math.cos(a) - 1) + (S * (1 - Math.cos(th))) / 2;
		},
		A: [(s) => [s, 1]]
	},
	cone: {
		id: 'cone',
		label: 'Cone',
		result: 'C(S^1) = (S^1\\times I)/(S^1\\times\\{1\\}) \\cong D^2',
		what: 'the top circle of the cylinder',
		f: (u, v, t, o) => {
			const e = ease(t);
			const r = 1.0 * (1 - e * v);
			o.x = r * Math.cos(TAU * u);
			o.z = r * Math.sin(TAU * u);
			o.y = (v - 0.5) * 2.2;
		},
		A: [(s) => [s, 1]]
	},
	susp: {
		id: 'susp',
		label: 'Suspension',
		result: '\\Sigma S^1 \\cong S^2',
		what: 'the top circle, and (separately) the bottom circle',
		f: (u, v, t, o) => {
			const e = ease(t);
			const R = 1.1;
			const r = R * mix(1, Math.sin(Math.PI * v), e);
			o.x = r * Math.cos(TAU * u);
			o.z = r * Math.sin(TAU * u);
			o.y = mix((v - 0.5) * 2.2, -R * Math.cos(Math.PI * v), e);
		},
		A: [(s) => [s, 0], (s) => [s, 1]]
	},
	equator: {
		id: 'equator',
		label: 'Sphere ⁄ equator',
		result: 'S^2/S^1 \\cong S^2\\vee S^2',
		what: 'the equator of the sphere',
		// u around, v from the north pole (0) to the south pole (1)
		f: (u, v, t, o) => {
			const e = ease(t);
			const R = 1.05;
			const yc = R * Math.sin((Math.PI * e) / 2);
			let ph: number;
			let cy: number;
			let sg: number;
			if (v <= 0.5) {
				ph = Math.PI * v * (1 + e);
				cy = yc;
				sg = 1;
			} else {
				ph = Math.PI * (1 - v) * (1 + e);
				cy = -yc;
				sg = -1;
			}
			const r = R * Math.sin(ph);
			o.x = r * Math.cos(TAU * u);
			o.z = r * Math.sin(TAU * u);
			o.y = cy + sg * R * Math.cos(ph);
		},
		A: [(s) => [s, 0.5]]
	},
	pinch: {
		id: 'pinch',
		label: 'Torus ⁄ a meridian',
		result: 'T^2/S^1 \\cong S^2/(N\\sim S)',
		what: 'one circle around the tube of the torus',
		// u around the hole, v around the tube; the meridian u = 0 shrinks to a point
		f: (u, v, t, o) => {
			const e = ease(t);
			const d = Math.min(u, 1 - u);
			const bump = Math.exp(-(d * d) / (2 * 0.075 * 0.075));
			const r = 0.55 * (1 - e * bump);
			const R0 = 1.35;
			const w = R0 + r * Math.cos(TAU * v);
			o.x = w * Math.cos(TAU * u);
			o.z = w * Math.sin(TAU * u);
			o.y = r * Math.sin(TAU * v);
		},
		A: [(s) => [0, s]]
	}
};

export const collapseOrder: CollapseId[] = ['disk', 'cone', 'susp', 'equator', 'pinch'];
