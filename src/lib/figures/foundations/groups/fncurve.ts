// A three.js curve given by any function u ∈ [0, 1] ↦ point.
import * as THREE from 'three';

export class FnCurve extends THREE.Curve<THREE.Vector3> {
	constructor(public fn: (u: number, target: THREE.Vector3) => THREE.Vector3) {
		super();
	}
	override getPoint(u: number, target = new THREE.Vector3()): THREE.Vector3 {
		return this.fn(u, target);
	}
}
