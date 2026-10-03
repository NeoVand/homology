// Render a polygonal surface (polyhedron) in 3D: stained-glass iridescent faces,
// glowing edges and luminous vertices, each recolourable, with picking helpers.
import * as THREE from 'three';
import { iridescent, setGlowColor } from '$lib/three/materials';
import { edgeTube, vertexBead, setPointColor, polygonGeometry, pickCylinder, type C } from '../simplicial-complexes/kit3d';
import type { V3 } from './polyhedra';

export interface PolyView {
	group: THREE.Group;
	faces: THREE.Mesh[];
	overlays: THREE.Mesh[];
	edges: THREE.Group[];
	edgePicks: THREE.Mesh[];
	verts: THREE.Group[];
	edgeList: [number, number][];
	setEdge(i: number, c: C | null, intensity?: number): void;
	setVertex(i: number, c: C | null, scale?: number): void;
	setFace(i: number, c: C | null, opacity?: number): void;
	reset(): void;
}

export interface PolyViewOptions {
	edgeRadius?: number;
	vertexSize?: number;
	faceOpacity?: number;
	edgeColor?: C;
	vertexColor?: C;
	/** number of distinct face hues (stained glass) */
	hues?: number;
	pickEdges?: boolean;
	halo?: boolean;
}

export function buildPolyView(pos: V3[], faces: number[][], o: PolyViewOptions = {}): PolyView {
	const group = new THREE.Group();
	const P = pos.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
	const nh = o.hues ?? 6;
	const mats = Array.from({ length: nh }, (_, i) =>
		iridescent({
			opacity: o.faceOpacity ?? 0.42,
			grid: [0, 0],
			film: 1.25,
			hue: i / nh,
			rim: 0.35,
			depthWrite: false
		})
	);
	const faceMeshes: THREE.Mesh[] = [];
	const overlays: THREE.Mesh[] = [];
	faces.forEach((f, i) => {
		const g = polygonGeometry(f.map((v) => P[v]));
		const m = new THREE.Mesh(g, mats[(i * 5) % nh]);
		m.renderOrder = 1;
		m.userData.index = i;
		const ov = new THREE.Mesh(
			g,
			new THREE.MeshBasicMaterial({
				color: 0xf2d08f,
				transparent: true,
				opacity: 0,
				side: THREE.DoubleSide,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		ov.renderOrder = 3;
		ov.userData.index = i;
		group.add(m, ov);
		faceMeshes.push(m);
		overlays.push(ov);
	});
	// edges
	const seen = new Map<string, [number, number]>();
	for (const f of faces)
		for (let i = 0; i < f.length; i++) {
			const a = f[i];
			const b = f[(i + 1) % f.length];
			const e: [number, number] = a < b ? [a, b] : [b, a];
			seen.set(e.join(','), e);
		}
	const edgeList = [...seen.values()];
	const baseEdge = o.edgeColor ?? 0xe6dcc4;
	const baseVert = o.vertexColor ?? 'gold';
	const edges = edgeList.map(([a, b]) => {
		const g = edgeTube(P[a], P[b], { color: baseEdge, radius: o.edgeRadius ?? 0.018, intensity: 0.8, halo: o.halo ?? true });
		group.add(g);
		return g;
	});
	const edgePicks: THREE.Mesh[] = [];
	if (o.pickEdges) {
		edgeList.forEach(([a, b], i) => {
			const c = pickCylinder(P[a], P[b], 0.075);
			c.userData.index = i;
			group.add(c);
			edgePicks.push(c);
		});
	}
	const verts = P.map((p) => {
		const g = vertexBead(p, baseVert, o.vertexSize ?? 0.045);
		group.add(g);
		return g;
	});
	const api: PolyView = {
		group,
		faces: faceMeshes,
		overlays,
		edges,
		edgePicks,
		verts,
		edgeList,
		setEdge(i, c, intensity) {
			const e = edges[i];
			if (e) setGlowColor(e, c ?? baseEdge, intensity ?? (c ? 1.7 : 0.8));
		},
		setVertex(i, c, scale) {
			const v = verts[i];
			if (!v) return;
			setPointColor(v, c ?? baseVert, c ? 1.5 : 1);
			v.scale.setScalar(scale ?? 1);
		},
		setFace(i, c, opacity) {
			const ov = overlays[i];
			if (!ov) return;
			const m = ov.material as THREE.MeshBasicMaterial;
			if (c) m.color.set(typeof c === 'string' && c in colorMap ? colorMap[c as keyof typeof colorMap] : (c as THREE.ColorRepresentation));
			m.opacity = c ? (opacity ?? 0.3) : 0;
		},
		reset() {
			edges.forEach((_, i) => api.setEdge(i, null));
			verts.forEach((_, i) => api.setVertex(i, null));
			overlays.forEach((_, i) => api.setFace(i, null));
		}
	};
	return api;
}

const colorMap = {
	gold: 0xf2d08f,
	teal: 0x5fd6cf,
	violet: 0xa493ff,
	rose: 0xf28db6,
	blue: 0x74a9ff,
	green: 0x84d9a2,
	amber: 0xf4b55f
} as const;

/** Fit a point set into a ball of radius r around the origin. */
export function fitPositions(pos: V3[], r = 1.6): V3[] {
	const c = pos.reduce((a, p) => [a[0] + p[0] / pos.length, a[1] + p[1] / pos.length, a[2] + p[2] / pos.length] as V3, [0, 0, 0] as V3);
	const R = Math.max(...pos.map((p) => Math.hypot(p[0] - c[0], p[1] - c[1], p[2] - c[2])));
	return pos.map((p) => [((p[0] - c[0]) * r) / R, ((p[1] - c[1]) * r) / R, ((p[2] - c[2]) * r) / R]);
}
