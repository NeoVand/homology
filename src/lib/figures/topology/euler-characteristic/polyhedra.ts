// Polyhedra for §2.6: vertices, polygonal faces (computed as convex hulls, so
// the counts are honest), edges, and Descartes' angle defects.
export type V3 = [number, number, number];

export interface Polyhedron {
	/** vertex positions */
	verts: V3[];
	/** faces as vertex loops, counter-clockwise seen from outside */
	faces: number[][];
}

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];

/** Convex hull of a point set, with coplanar triangles merged into polygonal faces. */
export function convexPolyhedron(points: V3[], eps = 1e-6): Polyhedron {
	const n = points.length;
	const planes: { n: V3; d: number }[] = [];
	const seen = new Set<string>();
	for (let i = 0; i < n; i++)
		for (let j = i + 1; j < n; j++)
			for (let k = j + 1; k < n; k++) {
				let nn = cross(sub(points[j], points[i]), sub(points[k], points[i]));
				const L = norm(nn);
				if (L < eps) continue;
				nn = scale(nn, 1 / L);
				let d = dot(nn, points[i]);
				let pos = false;
				let neg = false;
				for (const p of points) {
					const s = dot(nn, p) - d;
					if (s > eps) pos = true;
					else if (s < -eps) neg = true;
					if (pos && neg) break;
				}
				if (pos && neg) continue;
				if (pos) {
					nn = scale(nn, -1);
					d = -d;
				}
				const key = [...nn, d].map((x) => Math.round(x * 1e4) / 1e4 + 0).join(',');
				if (seen.has(key)) continue;
				seen.add(key);
				planes.push({ n: nn, d });
			}
	const faces: number[][] = [];
	for (const { n: nn, d } of planes) {
		const ids = points.map((p, i) => (Math.abs(dot(nn, p) - d) < 1e-5 ? i : -1)).filter((i) => i >= 0);
		const c: V3 = scale(
			ids.reduce((acc, i) => [acc[0] + points[i][0], acc[1] + points[i][1], acc[2] + points[i][2]] as V3, [0, 0, 0] as V3),
			1 / ids.length
		);
		const u0 = sub(points[ids[0]], c);
		const u = scale(u0, 1 / norm(u0));
		const w = cross(nn, u);
		ids.sort((a, b) => {
			const pa = sub(points[a], c);
			const pb = sub(points[b], c);
			return Math.atan2(dot(pa, w), dot(pa, u)) - Math.atan2(dot(pb, w), dot(pb, u));
		});
		faces.push(ids);
	}
	return { verts: points, faces };
}

/** Unique edges [a, b] (a < b) of a polyhedron. */
export function edgesOf(P: { faces: number[][] }): [number, number][] {
	const m = new Map<string, [number, number]>();
	for (const f of P.faces)
		for (let i = 0; i < f.length; i++) {
			const a = f[i];
			const b = f[(i + 1) % f.length];
			const e: [number, number] = a < b ? [a, b] : [b, a];
			m.set(e.join(','), e);
		}
	return [...m.values()];
}

export function counts(P: { verts: unknown[]; faces: number[][] }) {
	const V = P.verts.length;
	const E = edgesOf(P).length;
	const F = P.faces.length;
	return { V, E, F, chi: V - E + F };
}

/** Angle defect at each vertex: 2π minus the face angles meeting there. */
export function angleDefects(P: Polyhedron): number[] {
	const sum = new Array<number>(P.verts.length).fill(0);
	for (const f of P.faces)
		for (let i = 0; i < f.length; i++) {
			const v = f[i];
			const a = sub(P.verts[f[(i + f.length - 1) % f.length]], P.verts[v]);
			const b = sub(P.verts[f[(i + 1) % f.length]], P.verts[v]);
			sum[v] += Math.acos(Math.max(-1, Math.min(1, dot(a, b) / (norm(a) * norm(b)))));
		}
	return sum.map((s) => 2 * Math.PI - s);
}

// ── the solids ──────────────────────────────────────────────────────────────

const PHI = (1 + Math.sqrt(5)) / 2;

function signs(...xs: number[]): number[][] {
	// all sign combinations of the non-zero entries
	let out: number[][] = [[]];
	for (const x of xs) out = out.flatMap((p) => (x === 0 ? [[...p, 0]] : [[...p, x], [...p, -x]]));
	return out;
}
const cyc = (p: number[]): V3[] => [
	[p[0], p[1], p[2]],
	[p[1], p[2], p[0]],
	[p[2], p[0], p[1]]
];

export function icosahedronPoints(): V3[] {
	return signs(0, 1, PHI).flatMap(cyc);
}

export const solids: Record<string, { name: string; make: () => Polyhedron }> = {
	tetrahedron: {
		name: 'Tetrahedron',
		make: () =>
			convexPolyhedron([
				[1, 1, 1],
				[1, -1, -1],
				[-1, 1, -1],
				[-1, -1, 1]
			])
	},
	cube: { name: 'Cube', make: () => convexPolyhedron(signs(1, 1, 1) as V3[]) },
	octahedron: { name: 'Octahedron', make: () => convexPolyhedron(signs(1, 0, 0).flatMap(cyc)) },
	dodecahedron: {
		name: 'Dodecahedron',
		make: () => convexPolyhedron([...(signs(1, 1, 1) as V3[]), ...signs(0, 1 / PHI, PHI).flatMap(cyc)])
	},
	icosahedron: { name: 'Icosahedron', make: () => convexPolyhedron(icosahedronPoints()) },
	prism: {
		name: 'Hexagonal prism',
		make: () => {
			const pts: V3[] = [];
			for (let i = 0; i < 6; i++) {
				const t = (i / 6) * Math.PI * 2;
				pts.push([Math.cos(t), 0.62, Math.sin(t)], [Math.cos(t), -0.62, Math.sin(t)]);
			}
			return convexPolyhedron(pts);
		}
	},
	pyramid: {
		name: 'Square pyramid',
		make: () =>
			convexPolyhedron([
				[1, -0.55, 1],
				[1, -0.55, -1],
				[-1, -0.55, 1],
				[-1, -0.55, -1],
				[0, 1.05, 0]
			])
	},
	soccer: {
		name: 'Soccer ball',
		make: () => {
			const ico = icosahedronPoints();
			const pts: V3[] = [];
			for (let i = 0; i < ico.length; i++)
				for (let j = i + 1; j < ico.length; j++) {
					const d = norm(sub(ico[i], ico[j]));
					if (Math.abs(d - 2) > 1e-6) continue; // icosahedron edges have length 2
					for (const t of [1 / 3, 2 / 3])
						pts.push([
							ico[i][0] + (ico[j][0] - ico[i][0]) * t,
							ico[i][1] + (ico[j][1] - ico[i][1]) * t,
							ico[i][2] + (ico[j][2] - ico[i][2]) * t
						]);
				}
			return convexPolyhedron(pts);
		}
	}
};

/** Rescale a polyhedron so its farthest vertex is at distance r from its centre. */
export function normalized(P: Polyhedron, r = 1.5): Polyhedron {
	const c = scale(
		P.verts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]] as V3, [0, 0, 0] as V3),
		1 / P.verts.length
	);
	const R = Math.max(...P.verts.map((p) => norm(sub(p, c))));
	return { verts: P.verts.map((p) => scale(sub(p, c), r / R)), faces: P.faces };
}
