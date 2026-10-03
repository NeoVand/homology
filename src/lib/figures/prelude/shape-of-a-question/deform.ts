// Smooth, time-varying displacement for "stretch, don't tear" figures.
import * as THREE from 'three';

export function wobble(x: number, y: number, z: number, t: number): number {
	return (
		0.42 * Math.sin(1.7 * x + 0.9 * t) * Math.cos(1.3 * y - 0.6 * t) +
		0.3 * Math.sin(2.3 * z + 1.1 * y + 0.7 * t) +
		0.18 * Math.sin(3.1 * x - 2.2 * z + 1.3 * t) +
		0.12 * Math.cos(4.2 * y + 2.9 * z - 0.8 * t)
	);
}

export interface Deformable {
	geo: THREE.BufferGeometry;
	base: Float32Array;
	normals: Float32Array;
}

export function deformable(geo: THREE.BufferGeometry): Deformable {
	return {
		geo,
		base: (geo.attributes.position.array as Float32Array).slice(),
		normals: (geo.attributes.normal.array as Float32Array).slice()
	};
}

/** Push every vertex along its (original) normal by amount × wobble. */
export function applyWobble(d: Deformable, amount: number, t: number, scale = 1) {
	const pos = d.geo.attributes.position.array as Float32Array;
	const { base, normals } = d;
	for (let i = 0; i < pos.length; i += 3) {
		const x = base[i];
		const y = base[i + 1];
		const z = base[i + 2];
		const s = amount * scale * wobble(x, y, z, t);
		pos[i] = x + normals[i] * s;
		pos[i + 1] = y + normals[i + 1] * s;
		pos[i + 2] = z + normals[i + 2] * s;
	}
	d.geo.attributes.position.needsUpdate = true;
	d.geo.computeVertexNormals();
}
