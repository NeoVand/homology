// Small parametric curves for the 3D figures of this chapter.
import * as THREE from 'three';

/** A horizontal circle of radius r at height y (t ∈ [0, 1]). */
export class CircleCurve extends THREE.Curve<THREE.Vector3> {
	constructor(
		public r: number,
		public y: number
	) {
		super();
	}
	override getPoint(t: number, target = new THREE.Vector3()) {
		const a = 2 * Math.PI * t;
		return target.set(this.r * Math.cos(a), this.y, this.r * Math.sin(a));
	}
}

/**
 * A helix of radius r climbing from height y0 to y1 while turning `turns` times,
 * centred (in angle) on the angle a0.
 */
export class HelixCurve extends THREE.Curve<THREE.Vector3> {
	constructor(
		public r: number,
		public y0: number,
		public y1: number,
		public turns: number,
		public a0: number
	) {
		super();
	}
	override getPoint(s: number, target = new THREE.Vector3()) {
		const a = this.a0 + 2 * Math.PI * this.turns * (s - 0.5);
		return target.set(this.r * Math.cos(a), this.y0 + (this.y1 - this.y0) * s, this.r * Math.sin(a));
	}
}
