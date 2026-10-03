// Draw a flat layout on a curved surface: each drawn triangle of the cut-open
// picture is mapped through a parametrization, so the 3×3 torus grid wraps
// onto a doughnut, the hexagon of ℝP² onto Boy's surface, and so on.
import * as THREE from 'three';
import type { FlatLayout, Pt } from './flat';
import { glowCore, glowHalo, glowPoint, faceMaterial, setGlowColor, color, shaderColor, glassMesh, type PaletteName } from '$lib/three/materials';
import { torus, kleinBottle, boy, mobius, surfaceNormal, type SurfaceFn } from '$lib/three/surfaces';

type Col = PaletteName | number | string;

/** maps layout coordinates (x, y) to a point on a surface, plus that surface's (u, v) */
export interface SurfaceMap {
	fn: SurfaceFn;
	uv(q: Pt): [number, number];
}

/** 3×3 grid (coordinates 0…3) on a torus: x → around the hole, y → around the tube. */
export function torusMap(R = 1.6, r = 0.62, n = 3): SurfaceMap {
	return { fn: torus(R, r), uv: ([x, y]) => [x / n, y / n] };
}

/**
 * 3×3 Klein grid on the classic "bottle" immersion. The grid's vertical
 * direction runs along the bottle and its horizontal direction around the
 * tube; the shift by 1/4 makes the grid's twisted top/bottom gluing agree with
 * the immersion's own identification (u = 1, v) ~ (u = 0, 1/2 − v).
 */
export function kleinMap(scale = 0.21, n = 3): SurfaceMap {
	return { fn: kleinBottle(scale), uv: ([x, y]) => [y / n, 0.25 + x / n] };
}

/** a regular hexagon of circumradius Rh centred at 0 → the unit disk → Boy's surface */
export function boyMap(Rh: number, scale = 1.15, rot = 0): SurfaceMap {
	const apothem = Rh * Math.cos(Math.PI / 6);
	return {
		fn: boy(scale),
		uv: ([x, y]) => {
			const r = Math.hypot(x, y);
			if (r < 1e-9) return [0, 0];
			let th = Math.atan2(y, x);
			// distance from the centre to the hexagon's rim in direction th
			// (hexagon with a vertex at angle 2π/3, i.e. vertices at π/3·k)
			const sector = ((((th - Math.PI / 3) % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3)) - Math.PI / 6;
			const rho = apothem / Math.cos(sector);
			th += rot;
			const u = (((th / (2 * Math.PI)) % 1) + 1) % 1;
			return [u, Math.min(1, r / rho)];
		}
	};
}

/** a strip of width ±0.75 (layout units) along x ∈ [−3W, 2W] onto a Möbius band */
export function mobiusMap(W = 1.15, R = 1.5, width = 1.0): SurfaceMap {
	return { fn: mobius(R, width), uv: ([x, y]) => [(x + 3 * W) / (5 * W), 0.5 + y / 1.5] };
}

const tmp = new THREE.Vector3();
const nrm = new THREE.Vector3();

/**
 * The iridescent glass surface, pushed slightly back in the depth buffer so
 * that curves and points lying on the surface are never tinted by the very
 * sheet they lie on (whichever side of it they happen to be lifted to; on a
 * non-orientable surface there is no consistent "outside").
 */
export function glassUnderlay(geometry: THREE.BufferGeometry, o: Parameters<typeof glassMesh>[1] = {}) {
	const g = glassMesh(geometry, o);
	g.traverse((x) => {
		const m = (x as THREE.Mesh).material as THREE.Material | undefined;
		if (!m) return;
		m.polygonOffset = true;
		m.polygonOffsetFactor = 2;
		m.polygonOffsetUnits = 900;
	});
	return g;
}

export function mapPoint(m: SurfaceMap, q: Pt, lift = 0, target = new THREE.Vector3()) {
	const [u, v] = m.uv(q);
	m.fn(u, v, target);
	if (lift) target.addScaledVector(surfaceNormal(m.fn, Math.min(0.9999, Math.max(1e-4, u)), Math.min(0.9999, Math.max(1e-4, v)), nrm), lift);
	return target;
}

/** a smooth curve through mapped samples of the straight segment a→b in layout coordinates */
export function mappedSegment(m: SurfaceMap, a: Pt, b: Pt, samples = 14, lift = 0.012): THREE.Vector3[] {
	const pts: THREE.Vector3[] = [];
	for (let k = 0; k <= samples; k++) {
		const t = k / samples;
		pts.push(mapPoint(m, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], lift));
	}
	return pts;
}

class Polyline3 extends THREE.Curve<THREE.Vector3> {
	constructor(private pts: THREE.Vector3[]) {
		super();
	}
	override getPoint(t: number, target = new THREE.Vector3()) {
		const n = this.pts.length - 1;
		const x = Math.min(n - 1e-9, Math.max(0, t * n));
		const i = Math.floor(x);
		return target.copy(this.pts[i]).lerp(this.pts[i + 1], x - i);
	}
}

export function tubeAlong(
	pts: THREE.Vector3[],
	o: { color?: Col; radius?: number; halo?: boolean; intensity?: number; haloIntensity?: number; haloScale?: number } = {}
) {
	const curve = new Polyline3(pts);
	const segs = Math.max(8, (pts.length - 1) * 2);
	const g = new THREE.Group();
	const r = o.radius ?? 0.02;
	const core = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, r, 10, false), glowCore(o.color ?? 'gold', o.intensity ?? 1));
	core.renderOrder = 5;
	g.add(core);
	if (o.halo !== false) {
		const halo = new THREE.Mesh(
			new THREE.TubeGeometry(curve, segs, r * (o.haloScale ?? 2.6), 8, false),
			glowHalo(o.color ?? 'gold', o.haloIntensity ?? 0.7)
		);
		halo.renderOrder = 6;
		g.add(halo);
	}
	return g;
}

/** a subdivided curved triangle following the surface */
export function mappedTriangle(m: SurfaceMap, A: Pt, B: Pt, C: Pt, level = 7, lift = 0.004): THREE.BufferGeometry {
	const pos: number[] = [];
	const idx: number[] = [];
	const id = (i: number, j: number) => {
		// row i has (level − i + 1) points
		let base = 0;
		for (let r = 0; r < i; r++) base += level - r + 1;
		return base + j;
	};
	for (let i = 0; i <= level; i++)
		for (let j = 0; j <= level - i; j++) {
			const a = 1 - (i + j) / level;
			const b = i / level;
			const c = j / level;
			const q: Pt = [a * A[0] + b * B[0] + c * C[0], a * A[1] + b * B[1] + c * C[1]];
			mapPoint(m, q, lift, tmp);
			pos.push(tmp.x, tmp.y, tmp.z);
		}
	for (let i = 0; i < level; i++)
		for (let j = 0; j < level - i; j++) {
			idx.push(id(i, j), id(i + 1, j), id(i, j + 1));
			if (j + 1 <= level - i - 1) idx.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
		}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	g.setIndex(idx);
	g.computeVertexNormals();
	return g;
}

export interface Flat3D {
	group: THREE.Group;
	setEdge(e: number, c: Col | null, intensity?: number): void;
	setTri(t: number, c: Col | null, opacity?: number): void;
	setVertex(i: number, c: Col | null): void;
	/** show circular orientation arrows: eps[t] = ±1 relative to increasing labels (0 hides) */
	setOrientation(eps: number[] | null, c?: Col): void;
	reset(): void;
	vertexPosition(i: number): THREE.Vector3;
	edgeMidpoint(e: number): THREE.Vector3;
	triCentroid(t: number): THREE.Vector3;
	triNormal(t: number): THREE.Vector3;
	/** the sampled curve of edge e on the surface (first drawn copy) */
	edgePoints(e: number): THREE.Vector3[];
}

/**
 * Build glowing edges, translucent faces, vertices and (optional) orientation
 * arrows for a flat layout mapped onto a surface. One mesh per abstract simplex
 * (the first drawn copy is used for edges and vertices).
 */
export function buildFlat3D(
	L: FlatLayout,
	m: SurfaceMap,
	o: { edgeRadius?: number; edgeColor?: Col; faceOpacity?: number; vertexSize?: number; lift?: number; showVertices?: boolean } = {}
): Flat3D {
	const group = new THREE.Group();
	const lift = o.lift ?? 0.014;
	const baseEdge = o.edgeColor ?? 0xcfc6ae;
	const er = o.edgeRadius ?? 0.011;

	// faces
	const faces: THREE.Mesh[] = new Array(L.K.count(2));
	const triGeo: { A: Pt; B: Pt; C: Pt; screen: number }[] = new Array(L.K.count(2));
	for (const d of L.tris) {
		if (faces[d.t]) continue;
		const A = L.verts[d.a].q;
		const B = L.verts[d.b].q;
		const C = L.verts[d.c].q;
		triGeo[d.t] = { A, B, C, screen: d.screen };
		const mesh = new THREE.Mesh(mappedTriangle(m, A, B, C, 7, lift * 0.35), faceMaterial('violet', 0));
		mesh.renderOrder = 3;
		mesh.visible = false;
		faces[d.t] = mesh;
		group.add(mesh);
	}

	// edges (first drawn copy)
	const edges: THREE.Group[] = new Array(L.K.count(1));
	const edgeMid: THREE.Vector3[] = new Array(L.K.count(1));
	const edgePts: THREE.Vector3[][] = new Array(L.K.count(1));
	for (const d of L.edges) {
		if (edges[d.e]) continue;
		const pts = mappedSegment(m, L.verts[d.a].q, L.verts[d.b].q, 16, lift);
		edgePts[d.e] = pts;
		const g = tubeAlong(pts, { color: baseEdge, radius: er, halo: false, intensity: 0.75 });
		edges[d.e] = g;
		edgeMid[d.e] = pts[Math.floor(pts.length / 2)].clone();
		group.add(g);
	}

	// vertices (first drawn copy)
	const verts: THREE.Group[] = new Array(L.K.count(0));
	const vpos: THREE.Vector3[] = new Array(L.K.count(0));
	for (const d of L.verts) {
		if (verts[d.i]) continue;
		const p = mapPoint(m, d.q, lift * 1.2);
		vpos[d.i] = p.clone();
		const g = glowPoint(p, { color: 'gold', size: o.vertexSize ?? 0.032, halo: 6 });
		g.visible = o.showVertices !== false;
		verts[d.i] = g;
		group.add(g);
	}

	// orientation arrows (built lazily)
	let arrows: THREE.Group | null = null;
	const arrowFor = (t: number, dir: number, c: Col) => {
		const { A, B, C, screen } = triGeo[t];
		const cx = (A[0] + B[0] + C[0]) / 3;
		const cy = (A[1] + B[1] + C[1]) / 3;
		const side = (p: Pt, q: Pt) => {
			const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
			return Math.abs((q[0] - p[0]) * (p[1] - cy) - (p[0] - cx) * (q[1] - p[1])) / len;
		};
		const r = Math.min(side(A, B), side(B, C), side(A, C)) * 0.5;
		const s = dir * screen; // +1: counterclockwise in layout coordinates
		const pts: THREE.Vector3[] = [];
		const N = 16;
		const start = Math.PI / 2;
		for (let k = 0; k <= N; k++) {
			const th = start + s * 1.45 * Math.PI * (k / N);
			pts.push(mapPoint(m, [cx + r * Math.cos(th), cy + r * Math.sin(th)], lift * 1.6));
		}
		const g = tubeAlong(pts, { color: c, radius: er * 0.9, halo: false, intensity: 1.1 });
		const tip = pts[pts.length - 1];
		const dirv = tip.clone().sub(pts[pts.length - 3]).normalize();
		const cone = new THREE.Mesh(new THREE.ConeGeometry(er * 3.2, er * 9, 10), glowCore(c, 1.2));
		cone.position.copy(tip).addScaledVector(dirv, er * 2.5);
		cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirv);
		cone.renderOrder = 6;
		g.add(cone);
		return g;
	};

	const api: Flat3D = {
		group,
		setEdge(e, c, intensity) {
			const g = edges[e];
			if (!g) return;
			setGlowColor(g, c ?? baseEdge, intensity ?? (c ? 1.4 : 0.75));
			g.scale.setScalar(1);
			g.userData.on = !!c;
		},
		setTri(t, c, opacity) {
			const f = faces[t];
			if (!f) return;
			const mat = f.material as THREE.MeshBasicMaterial;
			if (!c) {
				f.visible = false;
				return;
			}
			mat.color = color(c);
			mat.opacity = opacity ?? 0.35;
			f.visible = true;
		},
		setVertex(i, c) {
			const v = verts[i];
			if (!v) return;
			v.traverse((x) => {
				const mat = (x as THREE.Mesh).material as THREE.ShaderMaterial | THREE.SpriteMaterial | undefined;
				if (!mat) return;
				if ((mat as THREE.SpriteMaterial).isSpriteMaterial) (mat as THREE.SpriteMaterial).color = color(c ?? 'gold');
				else if ((mat as THREE.ShaderMaterial).uniforms?.uColor) (mat as THREE.ShaderMaterial).uniforms.uColor.value = shaderColor(c ?? 'ivory');
			});
		},
		setOrientation(eps, c = 'violet') {
			if (arrows) {
				group.remove(arrows);
				arrows.traverse((x) => {
					const mesh = x as THREE.Mesh;
					mesh.geometry?.dispose?.();
					const mm = mesh.material as THREE.Material | undefined;
					mm?.dispose?.();
				});
				arrows = null;
			}
			if (!eps) return;
			arrows = new THREE.Group();
			eps.forEach((s, t) => {
				if (s && triGeo[t]) arrows!.add(arrowFor(t, s, c));
			});
			group.add(arrows);
		},
		reset() {
			edges.forEach((_, e) => api.setEdge(e, null));
			faces.forEach((_, t) => api.setTri(t, null));
			verts.forEach((_, i) => api.setVertex(i, null));
			api.setOrientation(null);
		},
		vertexPosition: (i) => vpos[i].clone(),
		edgeMidpoint: (e) => edgeMid[e].clone(),
		triCentroid(t) {
			const { A, B, C } = triGeo[t];
			return mapPoint(m, [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3], lift);
		},
		triNormal(t) {
			const { A, B, C } = triGeo[t];
			const [u, v] = m.uv([(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3]);
			return surfaceNormal(m.fn, u, v, new THREE.Vector3());
		},
		edgePoints: (e) => edgePts[e]
	};
	return api;
}

/** A thick glowing loop through a list of drawn-vertex layout points (for generators). */
export function mappedLoop(m: SurfaceMap, pts: Pt[], o: { color?: Col; radius?: number; lift?: number; closed?: boolean } = {}) {
	const all: THREE.Vector3[] = [];
	const n = pts.length;
	const segs = o.closed === false ? n - 1 : n;
	for (let k = 0; k < segs; k++) {
		const a = pts[k];
		const b = pts[(k + 1) % n];
		const seg = mappedSegment(m, a, b, 16, o.lift ?? 0.014);
		if (k > 0) seg.shift();
		all.push(...seg);
	}
	const c = o.color ?? 'gold';
	return tubeAlong(all, { color: c, radius: o.radius ?? 0.026, halo: true, intensity: 1, haloIntensity: 0.6 });
}
