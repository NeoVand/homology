// Render a simplicial complex embedded in 3D: luminous vertices, glowing edges,
// translucent faces — each individually recolourable (for chains, cycles, cochains).
import * as THREE from 'three';
import type { SimplicialComplex } from '$lib/math/complex';
import { color, faceMaterial, glowPoint, glowTube, setGlowColor, type PaletteName } from './materials';

export interface Complex3D {
	group: THREE.Group;
	vertices: THREE.Group[];
	edges: THREE.Group[];
	faces: THREE.Mesh[];
	/** set an edge's colour (null = default) */
	setEdge(i: number, c: PaletteName | number | string | null, intensity?: number): void;
	setVertex(i: number, c: PaletteName | number | string | null): void;
	setFace(i: number, c: PaletteName | number | string | null, opacity?: number): void;
	reset(): void;
	/** meshes to raycast for picking edges/faces */
	pickables: { edges: THREE.Object3D[]; faces: THREE.Object3D[]; vertices: THREE.Object3D[] };
}

export interface Complex3DOptions {
	edgeRadius?: number;
	vertexSize?: number;
	edgeColor?: PaletteName | number | string;
	vertexColor?: PaletteName | number | string;
	faceColor?: PaletteName | number | string;
	faceOpacity?: number;
	/** curve each edge (e.g. to follow a surface): returns points from a to b */
	edgePath?: (a: number, b: number) => THREE.Vector3[];
	/** draw faces subdivided along a surface: returns a geometry for the face */
	faceGeometry?: (tri: number[]) => THREE.BufferGeometry;
}

export function buildComplex3D(K: SimplicialComplex, pos: THREE.Vector3[] | Record<number, THREE.Vector3>, o: Complex3DOptions = {}): Complex3D {
	const P = (v: number) => (pos as Record<number, THREE.Vector3>)[v];
	const group = new THREE.Group();
	const baseEdge = o.edgeColor ?? 0x9a937f;
	const baseVert = o.vertexColor ?? 'gold';
	const baseFace = o.faceColor ?? 'blue';
	const baseFaceOpacity = o.faceOpacity ?? 0.12;

	const faces: THREE.Mesh[] = [];
	for (const t of K.simplices[2] ?? []) {
		let geo: THREE.BufferGeometry;
		if (o.faceGeometry) geo = o.faceGeometry(t);
		else {
			geo = new THREE.BufferGeometry();
			const arr = new Float32Array(9);
			t.forEach((v, k) => P(v).toArray(arr, k * 3));
			geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
			geo.computeVertexNormals();
		}
		const m = new THREE.Mesh(geo, faceMaterial(baseFace, baseFaceOpacity));
		m.renderOrder = 2;
		m.userData.index = faces.length;
		faces.push(m);
		group.add(m);
	}

	const edges: THREE.Group[] = [];
	for (const [a, b] of K.simplices[1] ?? []) {
		const pts = o.edgePath ? o.edgePath(a, b) : [P(a), P(b)];
		const curve = pts.length === 2 ? new THREE.LineCurve3(pts[0], pts[1]) : new THREE.CatmullRomCurve3(pts);
		const g = glowTube(curve, {
			color: baseEdge,
			radius: o.edgeRadius ?? 0.018,
			segments: pts.length === 2 ? 1 : 32,
			halo: false,
			intensity: 0.8,
			radialSegments: 8
		});
		g.userData.index = edges.length;
		g.traverse((c) => (c.userData.index = edges.length));
		edges.push(g);
		group.add(g);
	}

	const vertices: THREE.Group[] = [];
	for (const [v] of K.simplices[0] ?? []) {
		const g = glowPoint(P(v).clone(), { color: baseVert, size: o.vertexSize ?? 0.045, halo: 7 });
		g.userData.index = vertices.length;
		g.traverse((c) => (c.userData.index = vertices.length));
		vertices.push(g);
		group.add(g);
	}

	const api: Complex3D = {
		group,
		vertices,
		edges,
		faces,
		setEdge(i, c, intensity) {
			const e = edges[i];
			if (!e) return;
			setGlowColor(e, c ?? baseEdge, intensity ?? (c ? 1.35 : 0.8));
		},
		setVertex(i, c) {
			const v = vertices[i];
			if (!v) return;
			v.traverse((m) => {
				const mat = (m as THREE.Mesh).material as THREE.ShaderMaterial | THREE.SpriteMaterial | undefined;
				if (!mat) return;
				if ((mat as THREE.SpriteMaterial).isSpriteMaterial) (mat as THREE.SpriteMaterial).color = color(c ?? baseVert);
				else if ((mat as THREE.ShaderMaterial).uniforms?.uColor) (mat as THREE.ShaderMaterial).uniforms.uColor.value = color(c ?? 'ivory');
			});
		},
		setFace(i, c, opacity) {
			const f = faces[i];
			if (!f) return;
			const mat = f.material as THREE.MeshBasicMaterial;
			mat.color = color(c ?? baseFace);
			mat.opacity = opacity ?? (c ? 0.42 : baseFaceOpacity);
		},
		reset() {
			edges.forEach((_, i) => api.setEdge(i, null));
			vertices.forEach((_, i) => api.setVertex(i, null));
			faces.forEach((_, i) => api.setFace(i, null));
		},
		pickables: {
			edges: edges.flatMap((g) => g.children),
			faces,
			vertices: vertices.flatMap((g) => g.children)
		}
	};
	return api;
}

/** Positions for the vertices of standard solids. */
export const solids = {
	tetrahedron(r = 1.4): THREE.Vector3[] {
		const s = r / Math.sqrt(3);
		return [
			new THREE.Vector3(s, s, s),
			new THREE.Vector3(s, -s, -s),
			new THREE.Vector3(-s, s, -s),
			new THREE.Vector3(-s, -s, s)
		];
	},
	/** order matches sphereOcta(): ±x = 0,1; ±y = 2,3; ±z = 4,5 */
	octahedron(r = 1.4): THREE.Vector3[] {
		return [
			new THREE.Vector3(r, 0, 0),
			new THREE.Vector3(-r, 0, 0),
			new THREE.Vector3(0, r, 0),
			new THREE.Vector3(0, -r, 0),
			new THREE.Vector3(0, 0, r),
			new THREE.Vector3(0, 0, -r)
		];
	}
};
