// Glowing "fence" bands on parametric surfaces, with chevrons showing the
// fence's co-orientation (the direction in which crossing it counts +1), and
// rose patches where two bands cross.
import * as THREE from 'three';
import { color, type PaletteName } from '$lib/three/materials';
import { surfaceNormal, torus, type SurfaceFn } from '$lib/three/surfaces';

export type UV = [number, number];

/**
 * The torus seen from outside with the standard orientation: the flat square
 * (x to the right, y up) is wrapped so that x runs around the hole and y around
 * the tube, and "counterclockwise in the square" is counterclockwise when the
 * surface is viewed from outside.
 */
export function orientedTorus(R = 1.6, r = 0.62): SurfaceFn {
	const f = torus(R, r);
	return (x, y, t) => f(((x % 1) + 1) % 1, ((((1 - y) % 1) + 1) % 1), t);
}

const bandVertex = /* glsl */ `
	varying vec2 vUv;
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	void main() {
		vUv = uv;
		vec4 wp = modelMatrix * vec4(position, 1.0);
		vWorldPos = wp.xyz;
		vNormal = normalize(mat3(modelMatrix) * normal);
		gl_Position = projectionMatrix * viewMatrix * wp;
	}
`;

const bandFragment = /* glsl */ `
	uniform vec3 uColor;
	uniform float uTime;
	uniform float uOpacity;
	uniform float uAlong;
	uniform float uAnim;
	uniform float uChevrons;
	varying vec2 vUv;
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	void main() {
		float s = vUv.x;               // across: 0 = left edge, 1 = right edge (co-oriented side)
		float t = vUv.y * uAlong;       // along, in units of the band's width
		float rim = smoothstep(0.36, 0.5, abs(s - 0.5));
		// chevrons pointing across the band, drifting towards the positive side
		float y = fract(t / 1.7 + 0.25) - 0.5;
		float x = fract(s - uTime * 0.18 * uAnim);
		float tip = 0.62 - abs(y) * 0.95;
		float d = abs(x - tip);
		float chev = (1.0 - smoothstep(0.035, 0.085, d)) * step(abs(y), 0.3) * sin(3.14159 * s) * uChevrons;
		vec3 N = normalize(vNormal);
		vec3 V = normalize(cameraPosition - vWorldPos);
		// parts of the band on the far side of the surface are seen through the glass: dim them
		float front = mix(0.28, 1.0, smoothstep(-0.15, 0.2, dot(N, V)));
		float a = uOpacity * clamp(0.46 + 0.5 * rim + 0.55 * chev, 0.0, 1.0) * front;
		vec3 col = uColor * (0.78 + 0.45 * rim) + vec3(1.0, 0.97, 0.9) * 0.55 * chev;
		gl_FragColor = vec4(col, a);
	}
`;

export function bandMaterial(c: PaletteName | number | string, o: { opacity?: number; along?: number; anim?: number; chevrons?: boolean } = {}) {
	return new THREE.ShaderMaterial({
		vertexShader: bandVertex,
		fragmentShader: bandFragment,
		uniforms: {
			uColor: { value: color(c) },
			uTime: { value: 0 },
			uOpacity: { value: o.opacity ?? 1 },
			uAlong: { value: o.along ?? 10 },
			uAnim: { value: o.anim ?? 1 },
			uChevrons: { value: o.chevrons === false ? 0 : 1 }
		},
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide
	});
}

const _p = new THREE.Vector3();
const _q = new THREE.Vector3();
const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/** Jacobian columns (∂/∂x, ∂/∂y) of a surface at (x, y). */
function jacobian(f: SurfaceFn, x: number, y: number, h = 1e-4): [THREE.Vector3, THREE.Vector3] {
	f(x + h, y, _p);
	f(x - h, y, _q);
	const Jx = new THREE.Vector3().subVectors(_p, _q).divideScalar(2 * h);
	f(x, y + h, _p);
	f(x, y - h, _q);
	const Jy = new THREE.Vector3().subVectors(_p, _q).divideScalar(2 * h);
	return [Jx, Jy];
}

/** Outward unit normal of the surface (consistent with the flat orientation). */
export function normalAt(f: SurfaceFn, x: number, y: number, target = new THREE.Vector3()) {
	const [Jx, Jy] = jacobian(f, x, y);
	return target.crossVectors(Jx, Jy).normalize();
}

export interface BandFrame {
	/** point on the surface */
	P: THREE.Vector3;
	/** unit tangent of the curve */
	T: THREE.Vector3;
	/** unit vector across the band, towards the co-oriented (right) side */
	B: THREE.Vector3;
	/** outward unit normal */
	N: THREE.Vector3;
	/** the parameter-space vector that maps to B */
	Bp: UV;
}

/** The moving frame of a curve c(t) (in flat coordinates) drawn on surface f. */
export function frameAt(f: SurfaceFn, c: (t: number) => UV, t: number, dt = 1e-4): BandFrame {
	const [x, y] = c(t);
	const [x1, y1] = c(t + dt);
	const [x0, y0] = c(t - dt);
	const tp: UV = [(x1 - x0) / (2 * dt), (y1 - y0) / (2 * dt)];
	const [Jx, Jy] = jacobian(f, x, y);
	const N = new THREE.Vector3().crossVectors(Jx, Jy).normalize();
	const T = new THREE.Vector3().copy(Jx).multiplyScalar(tp[0]).addScaledVector(Jy, tp[1]).normalize();
	// right of travel when viewed from outside: T × N
	const B = new THREE.Vector3().crossVectors(T, N).normalize();
	// parameter-space vector mapping to B: solve (JᵀJ) w = Jᵀ B
	const g11 = Jx.dot(Jx);
	const g12 = Jx.dot(Jy);
	const g22 = Jy.dot(Jy);
	const r1 = Jx.dot(B);
	const r2 = Jy.dot(B);
	const det = g11 * g22 - g12 * g12;
	const Bp: UV = [(g22 * r1 - g12 * r2) / det, (g11 * r2 - g12 * r1) / det];
	const P = new THREE.Vector3();
	f(x, y, P);
	return { P, T, B, N, Bp };
}

/**
 * A band of half-width w (in 3D units) along the curve c(t), t ∈ [0, 1], lying on
 * the surface and lifted slightly along its normal. uv.x runs across the band
 * (0 = left, 1 = right), uv.y along it.
 */
export function bandGeometry(f: SurfaceFn, c: (t: number) => UV, w: number, o: { segments?: number; lift?: number; t0?: number; t1?: number } = {}) {
	const n = o.segments ?? 200;
	const lift = o.lift ?? 0.014;
	const t0 = o.t0 ?? 0;
	const t1 = o.t1 ?? 1;
	const pos: number[] = [];
	const nor: number[] = [];
	const uv: number[] = [];
	const idx: number[] = [];
	let length = 0;
	let prev: THREE.Vector3 | null = null;
	const across = [-1, 0, 1];
	for (let i = 0; i <= n; i++) {
		const t = t0 + ((t1 - t0) * i) / n;
		const F = frameAt(f, c, t);
		if (prev) length += prev.distanceTo(F.P);
		prev = F.P.clone();
		const [x, y] = c(t);
		for (const s of across) {
			const px = x + s * w * F.Bp[0];
			const py = y + s * w * F.Bp[1];
			f(px, py, _a);
			normalAt(f, px, py, _b);
			_a.addScaledVector(_b, lift);
			pos.push(_a.x, _a.y, _a.z);
			nor.push(_b.x, _b.y, _b.z);
			uv.push((s + 1) / 2, i / n);
		}
	}
	for (let i = 0; i < n; i++)
		for (let j = 0; j < 2; j++) {
			const a = i * 3 + j;
			const b = (i + 1) * 3 + j;
			idx.push(a, b, a + 1, b, b + 1, a + 1);
		}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
	geometry.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
	geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
	geometry.setIndex(idx);
	return { geometry, length, along: length / (2 * w) };
}

/** A band mesh (geometry + material) along a curve. */
export function bandMesh(f: SurfaceFn, c: (t: number) => UV, w: number, col: PaletteName, o: { opacity?: number; anim?: number; chevrons?: boolean; segments?: number; lift?: number } = {}) {
	const { geometry, along } = bandGeometry(f, c, w, { segments: o.segments, lift: o.lift });
	const mesh = new THREE.Mesh(geometry, bandMaterial(col, { opacity: o.opacity, along, anim: o.anim, chevrons: o.chevrons }));
	mesh.renderOrder = 4;
	return mesh;
}

/** A glowing parallelogram where band A (along cA at tA) crosses band B (along cB at tB). */
export function crossingPatch(f: SurfaceFn, cA: (t: number) => UV, tA: number, cB: (t: number) => UV, tB: number, w: number, col: PaletteName = 'rose') {
	const A = frameAt(f, cA, tA);
	const B = frameAt(f, cB, tB);
	const sAB = B.T.dot(A.B);
	const sBA = A.T.dot(B.B);
	const mu = w / (Math.abs(sAB) < 0.25 ? 0.25 * Math.sign(sAB || 1) : sAB);
	const la = w / (Math.abs(sBA) < 0.25 ? 0.25 * Math.sign(sBA || 1) : sBA);
	const X = A.P.clone().addScaledVector(A.N, 0.02);
	const corner = (i: number, j: number) => X.clone().addScaledVector(A.T, i * la).addScaledVector(B.T, j * mu);
	const pts = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap((p) => [p.x, p.y, p.z]), 3));
	geo.setIndex([0, 1, 2, 0, 2, 3]);
	const mat = new THREE.MeshBasicMaterial({
		color: color(col),
		transparent: true,
		opacity: 0.92,
		depthWrite: false,
		side: THREE.DoubleSide
	});
	const mesh = new THREE.Mesh(geo, mat);
	mesh.renderOrder = 7;
	return { mesh, center: X, normal: A.N };
}

/** Solve c(t) ≈ p for t on a sampled curve (nearest sample, then refine). */
export function nearestParam(c: (t: number) => UV, p: UV, samples = 600): number {
	let best = 0;
	let bd = Infinity;
	const d = (t: number) => {
		const [x, y] = c(t);
		const dx = ((((x - p[0]) % 1) + 1.5) % 1) - 0.5;
		const dy = ((((y - p[1]) % 1) + 1.5) % 1) - 0.5;
		return dx * dx + dy * dy;
	};
	for (let i = 0; i < samples; i++) {
		const t = i / samples;
		const v = d(t);
		if (v < bd) {
			bd = v;
			best = t;
		}
	}
	let h = 1 / samples;
	for (let k = 0; k < 30; k++) {
		h /= 2;
		if (d(best - h) < d(best)) best -= h;
		else if (d(best + h) < d(best)) best += h;
	}
	return best;
}

/** A point of a curve on the surface, lifted along the normal. */
export function liftPoint(f: SurfaceFn, x: number, y: number, lift = 0.02) {
	const P = new THREE.Vector3();
	f(x, y, P);
	const N = normalAt(f, x, y);
	return { P: P.addScaledVector(N, lift), N };
}

/**
 * Keep the horizontal field of view on narrow (portrait) canvases: widen the
 * vertical field of view when the aspect ratio drops below `refAspect`.
 * Call it every frame; it only touches the camera when the aspect changes.
 */
export function fovFitter(camera: THREE.PerspectiveCamera, baseFov: number, refAspect = 1.35) {
	let last = -1;
	return () => {
		if (Math.abs(camera.aspect - last) < 1e-3) return false;
		last = camera.aspect;
		const half = (baseFov * Math.PI) / 360;
		camera.fov = camera.aspect >= refAspect ? baseFov : (360 / Math.PI) * Math.atan((Math.tan(half) * refAspect) / camera.aspect);
		camera.updateProjectionMatrix();
		return true;
	};
}

export { surfaceNormal };
