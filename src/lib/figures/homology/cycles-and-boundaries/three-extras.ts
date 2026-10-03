// Small three.js helpers for the 3D figures of §3.1: a shader that paints a
// band between two curves on a parametric surface, a disk patch on a surface,
// and a torus cut open along a (p, q) loop.
import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { shaderColor, type PaletteName } from '$lib/three/materials';
import type { SurfaceFn } from '$lib/three/surfaces';

/**
 * A translucent glowing material that is visible only where
 *   min(uA, vB(u)) ≤ v ≤ max(uA, vB(u)),   vB(u) = uB + uAmp·sin(2π(uFreq·u + uPhase))
 * in the surface's (u, v) parameters: the band between a straight loop at v = uA
 * and a (possibly wavy) loop around v = uB.
 */
export function bandMaterial(c: PaletteName | number | string = 'teal', opacity = 0.5) {
	return new THREE.ShaderMaterial({
		uniforms: {
			uColor: { value: shaderColor(c) },
			uOpacity: { value: opacity },
			uA: { value: 0.1 },
			uB: { value: 0.5 },
			uAmp: { value: 0 },
			uFreq: { value: 3 },
			uPhase: { value: 0 },
			uOn: { value: 1 }
		},
		vertexShader: /* glsl */ `
			varying vec2 vUv;
			varying vec3 vN;
			varying vec3 vW;
			void main() {
				vUv = uv;
				vec4 w = modelMatrix * vec4(position, 1.0);
				vW = w.xyz;
				vN = normalize(mat3(modelMatrix) * normal);
				gl_Position = projectionMatrix * viewMatrix * w;
			}
		`,
		fragmentShader: /* glsl */ `
			uniform vec3 uColor;
			uniform float uOpacity, uA, uB, uAmp, uFreq, uPhase, uOn;
			varying vec2 vUv;
			varying vec3 vN;
			varying vec3 vW;
			void main() {
				float vb = uB + uAmp * sin(6.2831853 * (uFreq * vUv.x + uPhase));
				float lo = min(uA, vb);
				float hi = max(uA, vb);
				if (uOn < 0.5 || vUv.y < lo || vUv.y > hi) discard;
				vec3 V = normalize(cameraPosition - vW);
				vec3 N = normalize(vN);
				float ndv = abs(dot(N, V));
				float fres = pow(1.0 - ndv, 2.0);
				// soft fade near the two rims so the band reads as a ribbon
				float edge = min(vUv.y - lo, hi - vUv.y);
				float rimGlow = exp(-edge * 90.0);
				vec3 col = uColor * (0.55 + 0.45 * ndv) + uColor * rimGlow * 0.6 + vec3(0.9, 1.0, 1.0) * fres * 0.18;
				gl_FragColor = vec4(col, uOpacity * (0.75 + 0.25 * fres) + rimGlow * 0.25);
			}
		`,
		transparent: true,
		depthWrite: false,
		side: THREE.DoubleSide
	});
}

/** A filled elliptical patch on a surface around (uc, vc) with half-widths (du, dv) in parameter space. */
export function patchGeometry(f: SurfaceFn, uc: number, vc: number, du: number, dv: number, offset = 0.01, scale = 1): THREE.BufferGeometry {
	const n = new THREE.Vector3();
	const a = new THREE.Vector3();
	const b = new THREE.Vector3();
	const eps = 1e-4;
	const g = new ParametricGeometry(
		(s: number, t: number, target: THREE.Vector3) => {
			const th = 2 * Math.PI * s;
			const u = uc + t * scale * du * Math.cos(th);
			const v = vc + t * scale * dv * Math.sin(th);
			f(u, v, target);
			f(u + eps, v, a);
			f(u, v + eps, b);
			a.sub(target);
			b.sub(target);
			n.crossVectors(a, b).normalize();
			target.addScaledVector(n, offset);
		},
		48,
		12
	);
	g.computeVertexNormals();
	return g;
}

/**
 * A torus cut open along the (p, q) loop through (u0, v0): parametrise by
 * (a, b) ↦ f(u0 + a p + b r, v0 + a q + b s) where p s − q r = 1, and leave
 * out a thin strip |b| < gap around the cut. The result is one annulus.
 */
export function cutTorusGeometry(f: SurfaceFn, p: number, q: number, r: number, s: number, u0: number, v0: number, gap = 0.035): THREE.BufferGeometry {
	const su = Math.max(96, 64 * (Math.abs(p) + Math.abs(q)));
	const sv = Math.max(48, 48 * (Math.abs(r) + Math.abs(s)));
	const g = new ParametricGeometry(
		(a: number, t: number, target: THREE.Vector3) => {
			const b = gap + t * (1 - 2 * gap);
			f(u0 + a * p + b * r, v0 + a * q + b * s, target);
		},
		su,
		sv
	);
	g.computeVertexNormals();
	return g;
}

/** Ease in-out (cubic). */
export const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * Keep the whole object in view on narrow (portrait) canvases: when the canvas
 * aspect ratio drops below `wideAspect`, move the camera back along its line of
 * sight. Call once from a Scene3D setup.
 */
export function fitOnNarrow(
	ctx: { camera: THREE.PerspectiveCamera; controls: { target: THREE.Vector3 } | null; onFrame(cb: (t: number, dt: number) => void): () => void },
	wideAspect = 1.5
) {
	const origin = new THREE.Vector3();
	const tmp = new THREE.Vector3();
	const target = () => ctx.controls?.target ?? origin;
	const base = tmp.copy(ctx.camera.position).sub(target()).length();
	return ctx.onFrame(() => {
		const k = Math.max(1, Math.pow(wideAspect / Math.max(0.2, ctx.camera.aspect), 0.85));
		const want = base * k;
		const t = target();
		tmp.copy(ctx.camera.position).sub(t);
		const d = tmp.length();
		if (Math.abs(d - want) > 1e-3) {
			tmp.setLength(want);
			ctx.camera.position.copy(t).add(tmp);
		}
	});
}
