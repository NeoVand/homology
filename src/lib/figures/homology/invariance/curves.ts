// Small parametric curves used by the 3D figures of §3.5.
import * as THREE from 'three';
import { wobbleLift } from './maps';

const TAU = Math.PI * 2;

/** A horizontal circle of radius r at height y (in the xz-plane). */
export class RingCurve extends THREE.Curve<THREE.Vector3> {
	r: number;
	y: number;
	constructor(r: number, y: number) {
		super();
		this.r = r;
		this.y = y;
	}
	override getPoint(t: number, target = new THREE.Vector3()) {
		return target.set(this.r * Math.cos(TAU * t), this.y, this.r * Math.sin(TAU * t));
	}
}

/**
 * The graph of θ ↦ nθ + a·sin θ drawn on a cylinder of radius r: height = θ
 * (from y0 to y0 + h), angle = the image point.
 */
export class GraphOnCylinder extends THREE.Curve<THREE.Vector3> {
	n: number;
	a: number;
	r: number;
	y0: number;
	h: number;
	constructor(n: number, a: number, r: number, y0: number, h: number) {
		super();
		this.n = n;
		this.a = a;
		this.r = r;
		this.y0 = y0;
		this.h = h;
	}
	override getPoint(t: number, target = new THREE.Vector3()) {
		const ang = wobbleLift(this.n, this.a, TAU * t);
		return target.set(this.r * Math.cos(ang), this.y0 + this.h * t, this.r * Math.sin(ang));
	}
}

/** A curve given by any function t ∈ [0, 1] ↦ point (writes into `target`). */
export class FnCurve extends THREE.Curve<THREE.Vector3> {
	fn: (t: number, target: THREE.Vector3) => void;
	constructor(fn: (t: number, target: THREE.Vector3) => void) {
		super();
		this.fn = fn;
	}
	override getPoint(t: number, target = new THREE.Vector3()) {
		this.fn(t, target);
		return target;
	}
}
