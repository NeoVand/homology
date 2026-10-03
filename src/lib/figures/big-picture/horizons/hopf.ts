// The Hopf fibration S³ → S², and stereographic projection of its fibres to ℝ³.
//
// A point of S² with polar angle θ (from the north pole) and longitude φ has
// fibre { (z₁, z₂) = (cos(θ/2) e^{i(φ+ψ)}, sin(θ/2) e^{iψ}) : ψ ∈ [0, 2π) } ⊂ S³ ⊂ ℂ².
// Stereographic projection from (0, 0, 0, 1) sends (x₁, y₁, x₂, y₂) ↦ (x₁, y₁, x₂)/(1 − y₂).

import type * as THREE_NS from 'three';

export type V3 = [number, number, number];
export type V4 = [number, number, number, number];

export function fibrePoint4(theta: number, phi: number, psi: number): V4 {
	const a = Math.cos(theta / 2);
	const b = Math.sin(theta / 2);
	return [a * Math.cos(phi + psi), a * Math.sin(phi + psi), b * Math.cos(psi), b * Math.sin(psi)];
}

export function stereo([x1, y1, x2, y2]: V4): V3 {
	const s = 1 / (1 - y2);
	return [x1 * s, y1 * s, x2 * s];
}

export function fibrePoint(theta: number, phi: number, psi: number): V3 {
	return stereo(fibrePoint4(theta, phi, psi));
}

/** The Hopf map h(z₁, z₂) = (2 z₁ z̄₂, |z₁|² − |z₂|²) ∈ S² ⊂ ℂ × ℝ. */
export function hopfMap([x1, y1, x2, y2]: V4): V3 {
	// z₁ z̄₂ = (x1 + i y1)(x2 − i y2)
	const re = x1 * x2 + y1 * y2;
	const im = y1 * x2 - x1 * y2;
	return [2 * re, 2 * im, x1 * x1 + y1 * y1 - x2 * x2 - y2 * y2];
}

/** Sample a fibre as a closed polyline of n points in ℝ³. */
export function fibrePolyline(theta: number, phi: number, n = 160): V3[] {
	return Array.from({ length: n }, (_, k) => fibrePoint(theta, phi, (2 * Math.PI * k) / n));
}

/**
 * Gauss linking number of two closed polylines (numerical):
 *   lk = (1/4π) ∮∮ (r₁ − r₂) · (dr₁ × dr₂) / |r₁ − r₂|³.
 */
export function linkingNumber(A: V3[], B: V3[]): number {
	let s = 0;
	for (let i = 0; i < A.length; i++) {
		const a0 = A[i];
		const a1 = A[(i + 1) % A.length];
		const am: V3 = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2, (a0[2] + a1[2]) / 2];
		const da: V3 = [a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]];
		for (let j = 0; j < B.length; j++) {
			const b0 = B[j];
			const b1 = B[(j + 1) % B.length];
			const bm: V3 = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2, (b0[2] + b1[2]) / 2];
			const db: V3 = [b1[0] - b0[0], b1[1] - b0[1], b1[2] - b0[2]];
			const r: V3 = [am[0] - bm[0], am[1] - bm[1], am[2] - bm[2]];
			const cross: V3 = [da[1] * db[2] - da[2] * db[1], da[2] * db[0] - da[0] * db[2], da[0] * db[1] - da[1] * db[0]];
			const d = Math.hypot(r[0], r[1], r[2]);
			s += (r[0] * cross[0] + r[1] * cross[1] + r[2] * cross[2]) / (d * d * d);
		}
	}
	return s / (4 * Math.PI);
}

/** A point of the base sphere S² (unit vector) from polar angle θ and longitude φ. */
export function basePoint(theta: number, phi: number): V3 {
	return [Math.sin(theta) * Math.cos(phi), Math.sin(theta) * Math.sin(phi), Math.cos(theta)];
}

/**
 * A three.js curve tracing the stereographic image of one Hopf fibre, with the
 * axes arranged for display (the fibre over the north pole lies flat; the one
 * over the south pole is the vertical axis). The class is made once per copy of
 * `THREE` (which the scene hands us at run time) and then reused.
 */
type FibreCtor = new (theta: number, phi: number, scale: number) => THREE_NS.Curve<THREE_NS.Vector3>;
const fibreClasses = new WeakMap<object, FibreCtor>();

export function fibreCurve(
	THREE: typeof THREE_NS,
	theta: number,
	phi: number,
	scale: number
): THREE_NS.Curve<THREE_NS.Vector3> {
	let Ctor = fibreClasses.get(THREE);
	if (!Ctor) {
		Ctor = class extends THREE.Curve<THREE_NS.Vector3> {
			theta: number;
			phi: number;
			scale: number;
			constructor(theta: number, phi: number, scale: number) {
				super();
				this.theta = theta;
				this.phi = phi;
				this.scale = scale;
			}
			override getPoint(t: number, target = new THREE.Vector3()) {
				const [x, y, z] = fibrePoint(this.theta, this.phi, 2 * Math.PI * t);
				return target.set(x * this.scale, z * this.scale, y * this.scale);
			}
		};
		fibreClasses.set(THREE, Ctor);
	}
	return new Ctor(theta, phi, scale);
}
