// Parametric surfaces (u, v ∈ [0, 1]) and curves drawn on them.
// Convention: y is "up"; the torus lies flat in the xz-plane.
import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

export type SurfaceFn = (u: number, v: number, target: THREE.Vector3) => void;

const TAU = Math.PI * 2;

/**
 * Torus. u runs the long way round (longitude, around the hole),
 * v runs around the tube (meridian).
 */
export function torus(R = 1.6, r = 0.62): SurfaceFn {
	return (u, v, t) => {
		const th = TAU * u;
		const ph = TAU * v;
		const w = R + r * Math.cos(ph);
		t.set(w * Math.cos(th), r * Math.sin(ph), w * Math.sin(th));
	};
}

/** Sphere. u = longitude, v = colatitude (0 = north pole). */
export function sphere(r = 1.5): SurfaceFn {
	return (u, v, t) => {
		const th = TAU * u;
		const ph = Math.PI * v;
		t.set(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
	};
}

/** Cylinder (open). u around, v along the axis. */
export function cylinder(r = 1, h = 2): SurfaceFn {
	return (u, v, t) => {
		const th = TAU * u;
		t.set(r * Math.cos(th), (v - 0.5) * h, r * Math.sin(th));
	};
}

/** Flat annulus in the xz-plane. u around, v radial. */
export function annulus(r0 = 0.6, r1 = 1.6): SurfaceFn {
	return (u, v, t) => {
		const th = TAU * u;
		const r = r0 + (r1 - r0) * v;
		t.set(r * Math.cos(th), 0, r * Math.sin(th));
	};
}

/** Flat disk in the xz-plane. u around, v radial. */
export function disk(r = 1.5): SurfaceFn {
	return (u, v, t) => {
		const th = TAU * u;
		t.set(r * v * Math.cos(th), 0, r * v * Math.sin(th));
	};
}

/** Flat rectangle in the xy-plane (facing the camera by default). */
export function plane(w = 3, h = 3): SurfaceFn {
	return (u, v, t) => t.set((u - 0.5) * w, (v - 0.5) * h, 0);
}

/** Möbius band. u around the core circle, v across the band. */
export function mobius(R = 1.5, width = 0.9): SurfaceFn {
	return (u, v, t) => {
		const th = TAU * u;
		const s = (v - 0.5) * width;
		const w = R + s * Math.cos(th / 2);
		t.set(w * Math.cos(th), s * Math.sin(th / 2), w * Math.sin(th));
	};
}

/**
 * The classic "bottle" immersion of the Klein bottle (as in the three.js
 * examples), rescaled and recentred. u along the bottle, v around it.
 */
export function kleinBottle(scale = 0.2): SurfaceFn {
	return (u, v, t) => {
		const U = u * TAU;
		const V = v * TAU;
		let x: number, z: number;
		if (U < Math.PI) {
			x = 3 * Math.cos(U) * (1 + Math.sin(U)) + 2 * (1 - Math.cos(U) / 2) * Math.cos(U) * Math.cos(V);
			z = -8 * Math.sin(U) - 2 * (1 - Math.cos(U) / 2) * Math.sin(U) * Math.cos(V);
		} else {
			x = 3 * Math.cos(U) * (1 + Math.sin(U)) + 2 * (1 - Math.cos(U) / 2) * Math.cos(V + Math.PI);
			z = -8 * Math.sin(U);
		}
		const y = -2 * (1 - Math.cos(U) / 2) * Math.sin(V);
		// stand it upright like a bottle: the wide body below, the neck rising and
		// curving back down into it (the pose of the bottle in NeoVand/swarm3d)
		t.set(x * scale, (z + 1) * scale, y * scale);
	};
}

/** Figure-eight immersion of the Klein bottle. */
export function kleinFigure8(r = 2.2, scale = 0.55): SurfaceFn {
	return (u, v, t) => {
		const th = u * TAU;
		const V = v * TAU;
		const a = r + Math.cos(th / 2) * Math.sin(V) - Math.sin(th / 2) * Math.sin(2 * V);
		t.set(
			a * Math.cos(th) * scale,
			(Math.sin(th / 2) * Math.sin(V) + Math.cos(th / 2) * Math.sin(2 * V)) * scale,
			a * Math.sin(th) * scale
		);
	};
}

/**
 * Boy's surface (Bryant–Kusner parametrization), an immersion of the real
 * projective plane. u = angle, v = radius in the unit disk.
 */
export function boy(scale = 1.15): SurfaceFn {
	const s5 = Math.sqrt(5);
	return (u, v, t) => {
		const r = Math.min(v, 0.9999);
		const th = u * TAU;
		// w = r e^{iθ}
		const wr = r * Math.cos(th);
		const wi = r * Math.sin(th);
		// complex helpers
		const mul = (ar: number, ai: number, br: number, bi: number): [number, number] => [ar * br - ai * bi, ar * bi + ai * br];
		const div = (ar: number, ai: number, br: number, bi: number): [number, number] => {
			const d = br * br + bi * bi;
			return [(ar * br + ai * bi) / d, (ai * br - ar * bi) / d];
		};
		const w2 = mul(wr, wi, wr, wi);
		const w3 = mul(w2[0], w2[1], wr, wi);
		const w4 = mul(w2[0], w2[1], w2[0], w2[1]);
		const w6 = mul(w3[0], w3[1], w3[0], w3[1]);
		// denominator D = w^6 + √5 w^3 − 1
		const Dr = w6[0] + s5 * w3[0] - 1;
		const Di = w6[1] + s5 * w3[1];
		const n1 = mul(wr, wi, 1 - w4[0], -w4[1]);
		const n2 = mul(wr, wi, 1 + w4[0], w4[1]);
		const q1 = div(n1[0], n1[1], Dr, Di);
		const q2 = div(n2[0], n2[1], Dr, Di);
		const q3 = div(1 + w6[0], w6[1], Dr, Di);
		const g1 = -1.5 * q1[1];
		const g2 = -1.5 * q2[0];
		const g3 = q3[1] - 0.5;
		const g = g1 * g1 + g2 * g2 + g3 * g3;
		t.set((g1 / g) * scale, (g3 / g) * scale + 0.35 * scale, (g2 / g) * scale);
	};
}

/** Build a BufferGeometry for a surface. */
export function surfaceGeometry(fn: SurfaceFn, slicesU = 128, slicesV = 64): THREE.BufferGeometry {
	const g = new ParametricGeometry(fn, slicesU, slicesV);
	g.computeVertexNormals();
	return g;
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _c = new THREE.Vector3();

/** Unit normal of a surface at (u, v) by finite differences. */
export function surfaceNormal(fn: SurfaceFn, u: number, v: number, target = new THREE.Vector3(), eps = 1e-4) {
	fn(u, v, _c);
	fn(Math.min(1, u + eps), v, _a);
	fn(u, Math.min(1, v + eps), _b);
	_a.sub(_c);
	_b.sub(_c);
	target.crossVectors(_a, _b);
	if (target.lengthSq() < 1e-20) {
		fn(Math.max(0, u - eps), v, _a);
		fn(u, Math.max(0, v - eps), _b);
		_a.sub(_c).negate();
		_b.sub(_c).negate();
		target.crossVectors(_a, _b);
	}
	return target.normalize();
}

/**
 * A curve on a surface, given by a path in (u, v) parameter space.
 * The curve is lifted slightly off the surface (along the normal) so it never
 * z-fights with the surface it lies on.
 */
export class SurfaceCurve extends THREE.Curve<THREE.Vector3> {
	constructor(
		public fn: SurfaceFn,
		public path: (t: number) => [number, number],
		public offset = 0.012
	) {
		super();
	}
	override getPoint(t: number, target = new THREE.Vector3()): THREE.Vector3 {
		const [u, v] = this.path(t);
		const uu = ((u % 1) + 1) % 1;
		const vv = ((v % 1) + 1) % 1;
		this.fn(uu, vv, target);
		if (this.offset) {
			const n = surfaceNormal(this.fn, uu, vv, new THREE.Vector3());
			target.addScaledVector(n, this.offset);
		}
		return target;
	}
}

/** Straight-line path on the torus/annulus in parameter space: a (p, q) loop. */
export function loopPath(p: number, q: number, u0 = 0, v0 = 0): (t: number) => [number, number] {
	return (t) => [u0 + p * t, v0 + q * t];
}

/** A smooth closed curve in 3D through given points (Catmull–Rom). */
export function smoothLoop(points: THREE.Vector3[], closed = true) {
	return new THREE.CatmullRomCurve3(points, closed, 'centripetal', 0.5);
}
