// The book's glass surface for implicit-surface meshes, which have no (u, v)
// coordinates: grid lines are computed in the shader from the position, as the
// angle around the nearest hole and the angle around the tube.
import * as THREE from 'three';
import { glassMesh, setGlassFade } from '$lib/three/materials';

export interface ImplicitGlassOptions {
	opacity?: number;
	grid?: [number, number];
	gridStrength?: number;
	centres?: number[];
	R?: number;
}

/** Glass for an implicit-surface mesh; `setFade(x)` fades it in and out. */
export function implicitGlass(geometry: THREE.BufferGeometry, o: ImplicitGlassOptions = {}) {
	const g = glassMesh(geometry, {
		opacity: o.opacity ?? 0.85,
		grid: o.grid ?? [36, 16],
		gridStrength: o.gridStrength ?? 0.32,
		implicitGrid: { centres: o.centres ?? [], R: o.R ?? 0 },
		cuts: true,
		inner: { brightness: 0.5, tint: 0x1b2a6b, tintMix: 0.45 }
	});
	const mats = g.userData.materials as THREE.ShaderMaterial[];
	return {
		group: g,
		setFade(x: number) {
			setGlassFade(g, x);
		},
		/** cut round holes (centre, radius) out of the surface; radius 0 = no hole */
		setCuts(a: [number, number, number, number], b: [number, number, number, number]) {
			for (const m of mats) {
				m.uniforms.uCut0.value.set(...a);
				m.uniforms.uCut1.value.set(...b);
			}
		}
	};
}
