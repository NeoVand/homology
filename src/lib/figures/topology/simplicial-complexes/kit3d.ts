// Small 3D helpers shared by the figures of §2.5 and §2.6.
import * as THREE from 'three';
import { color, shaderColor, glowPoint, glowTube, type PaletteName } from '$lib/three/materials';
import { surfaceNormal, type SurfaceFn } from '$lib/three/surfaces';

export type C = PaletteName | number | string;
export type Vec = [number, number, number];

export const vec = (p: Vec | THREE.Vector3) => (Array.isArray(p) ? new THREE.Vector3(p[0], p[1], p[2]) : p.clone());

/** Smooth ease-in-out on [0, 1]. */
export const ease = (t: number) => {
	const x = Math.min(1, Math.max(0, t));
	return x * x * (3 - 2 * x);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

/** Seven distinguishable colours (vertex identities in multi-vertex figures). */
export const seven: PaletteName[] = ['gold', 'teal', 'violet', 'rose', 'blue', 'green', 'amber'];
export const sevenCss = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)', 'var(--rose)', 'var(--blue)', 'var(--green)', 'var(--amber)'];

/** A flat polygon (fan-triangulated), with normals and a uv attribute. */
export function polygonGeometry(pts: THREE.Vector3[]): THREE.BufferGeometry {
	const n = pts.length;
	const pos = new Float32Array((n - 2) * 9);
	const uv = new Float32Array((n - 2) * 6);
	for (let i = 1; i < n - 1; i++) {
		const k = (i - 1) * 9;
		pts[0].toArray(pos, k);
		pts[i].toArray(pos, k + 3);
		pts[i + 1].toArray(pos, k + 6);
		uv.set([0, 0, 1, 0, 0, 1], (i - 1) * 6);
	}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	g.computeVertexNormals();
	return g;
}

/** Many flat polygons merged into one geometry (for a single glassy mesh). */
export function polygonsGeometry(polys: THREE.Vector3[][]): THREE.BufferGeometry {
	const tri = polys.reduce((s, p) => s + p.length - 2, 0);
	const pos = new Float32Array(tri * 9);
	const uv = new Float32Array(tri * 6);
	let t = 0;
	for (const pts of polys)
		for (let i = 1; i < pts.length - 1; i++, t++) {
			pts[0].toArray(pos, t * 9);
			pts[i].toArray(pos, t * 9 + 3);
			pts[i + 1].toArray(pos, t * 9 + 6);
			uv.set([0, 0, 1, 0, 0, 1], t * 6);
		}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	g.computeVertexNormals();
	return g;
}

/**
 * A triangle drawn on a parametric surface: the uv-triangle (a, b, c) is
 * subdivided n times and lifted off the surface by `offset` along the normal.
 */
export function surfaceTriangle(fn: SurfaceFn, a: [number, number], b: [number, number], c: [number, number], n = 10, offset = 0.006): THREE.BufferGeometry {
	const verts: number[] = [];
	const idx: number[] = [];
	const id = (i: number, j: number) => (i * (2 * n + 3 - i)) / 2 + j; // row i has n−i+1 points
	const p = new THREE.Vector3();
	const nn = new THREE.Vector3();
	const wrap = (x: number) => ((x % 1) + 1) % 1;
	for (let i = 0; i <= n; i++)
		for (let j = 0; j <= n - i; j++) {
			const s = i / n;
			const t = j / n;
			const u = a[0] + (b[0] - a[0]) * s + (c[0] - a[0]) * t;
			const v = a[1] + (b[1] - a[1]) * s + (c[1] - a[1]) * t;
			fn(wrap(u), wrap(v), p);
			surfaceNormal(fn, wrap(u), wrap(v), nn);
			p.addScaledVector(nn, offset);
			verts.push(p.x, p.y, p.z);
		}
	for (let i = 0; i < n; i++)
		for (let j = 0; j < n - i; j++) {
			idx.push(id(i, j), id(i + 1, j), id(i, j + 1));
			if (j < n - i - 1) idx.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
		}
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
	g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array((verts.length / 3) * 2).fill(0), 2));
	g.setIndex(idx);
	g.computeVertexNormals();
	return g;
}

/** A straight glowing edge. */
export function edgeTube(a: THREE.Vector3, b: THREE.Vector3, o: { color?: C; radius?: number; halo?: boolean; intensity?: number } = {}) {
	return glowTube(new THREE.LineCurve3(a.clone(), b.clone()), {
		color: o.color ?? 0xcfc6ae,
		radius: o.radius ?? 0.02,
		segments: 1,
		radialSegments: 10,
		halo: o.halo ?? true,
		haloScale: 2.6,
		intensity: o.intensity ?? 0.9
	});
}

/** Recolour a glowPoint group (bead + halo sprite). */
export function setPointColor(g: THREE.Object3D, c: C, intensity?: number) {
	// built-in materials (the halo sprite) take color(); custom shaders take shaderColor()
	const col = color(c);
	const scol = shaderColor(c);
	g.traverse((o) => {
		const m = (o as THREE.Mesh).material as THREE.ShaderMaterial | THREE.SpriteMaterial | undefined;
		if (!m) return;
		if ((m as THREE.SpriteMaterial).isSpriteMaterial) (m as THREE.SpriteMaterial).color.copy(col);
		else if ((m as THREE.ShaderMaterial).uniforms?.uColor) {
			(m as THREE.ShaderMaterial).uniforms.uColor.value.copy(scol);
			if (intensity !== undefined && (m as THREE.ShaderMaterial).uniforms.uIntensity)
				(m as THREE.ShaderMaterial).uniforms.uIntensity.value = intensity;
		}
	});
}

/** Set the opacity of every material in a subtree (for fades). */
export function setOpacity(g: THREE.Object3D, a: number) {
	g.traverse((o) => {
		const m = (o as THREE.Mesh).material as THREE.Material | undefined;
		if (!m) return;
		const sm = m as THREE.ShaderMaterial;
		if (sm.uniforms?.uOpacity) {
			if (sm.userData.baseOpacity === undefined) sm.userData.baseOpacity = sm.uniforms.uOpacity.value;
			sm.uniforms.uOpacity.value = sm.userData.baseOpacity * a;
			if (!sm.transparent && a < 1) {
				sm.transparent = true;
				sm.needsUpdate = true;
			}
		} else if (sm.uniforms?.uIntensity) {
			// halo materials: scale their intensity
			if (sm.userData.baseIntensity === undefined) sm.userData.baseIntensity = sm.uniforms.uIntensity.value;
			sm.uniforms.uIntensity.value = sm.userData.baseIntensity * a;
		} else {
			if (m.userData.baseOpacity === undefined) m.userData.baseOpacity = m.opacity;
			m.transparent = true;
			m.opacity = m.userData.baseOpacity * a;
		}
	});
}

/** A glowing vertex. */
export function vertexBead(p: THREE.Vector3, c: C = 'gold', size = 0.05) {
	return glowPoint(p.clone(), { color: c, size, halo: 7 });
}

/** Place `label` handles: returns HTML for a small KaTeX-free label. */
export function plainLabel(text: string) {
	return `<span style="font-family:var(--font-ui);font-size:0.78rem;letter-spacing:0.03em">${text}</span>`;
}

/** Raycast-friendly invisible fat cylinder along a segment (for picking thin edges). */
export function pickCylinder(a: THREE.Vector3, b: THREE.Vector3, radius = 0.09) {
	const d = new THREE.Vector3().subVectors(b, a);
	const g = new THREE.CylinderGeometry(radius, radius, d.length(), 6, 1, true);
	const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ visible: false }));
	m.position.copy(a).addScaledVector(d, 0.5);
	m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
	return m;
}

/**
 * Keep a sphere of the given radius (around the orbit target) in view on narrow
 * canvases: the camera only ever moves further away than its starting distance,
 * so wide (desktop) framing is unchanged. Returns an unsubscribe.
 */
export function fitCamera(
	ctx: {
		camera: THREE.PerspectiveCamera;
		container: HTMLElement;
		controls: { target: THREE.Vector3; update(): unknown } | null;
		invalidate(): void;
	},
	radius: number
) {
	const { camera, container, controls, invalidate } = ctx;
	const target = controls?.target ?? new THREE.Vector3();
	const d0 = camera.position.distanceTo(target);
	const dir = new THREE.Vector3();
	const apply = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		if (!w || !h) return;
		const vf = (camera.fov * Math.PI) / 180;
		const hf = 2 * Math.atan(Math.tan(vf / 2) * (w / h));
		const need = radius / Math.sin(Math.min(vf, hf) / 2);
		const d = Math.max(d0, need);
		dir.copy(camera.position).sub(target);
		if (Math.abs(dir.length() - d) < 1e-3) return;
		dir.setLength(d);
		camera.position.copy(target).add(dir);
		controls?.update();
		invalidate();
	};
	const ro = new ResizeObserver(apply);
	ro.observe(container);
	apply();
	return () => ro.disconnect();
}

/** Detect clicks (not drags) on a canvas; returns an unsubscribe. */
export function onCanvasClick(canvas: HTMLCanvasElement, cb: (e: PointerEvent) => void) {
	let x = 0;
	let y = 0;
	let t = 0;
	let down = false;
	const pd = (e: PointerEvent) => {
		down = true;
		x = e.clientX;
		y = e.clientY;
		t = performance.now();
	};
	const pu = (e: PointerEvent) => {
		if (!down) return;
		down = false;
		if (Math.hypot(e.clientX - x, e.clientY - y) < 6 && performance.now() - t < 600) cb(e);
	};
	canvas.addEventListener('pointerdown', pd);
	canvas.addEventListener('pointerup', pu);
	return () => {
		canvas.removeEventListener('pointerdown', pd);
		canvas.removeEventListener('pointerup', pu);
	};
}
