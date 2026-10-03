// A variant of `glassMesh` (from $lib/three/materials) whose inner/back faces
// are rendered darker and cooler, so that holes cut in a surface read as holes
// and the inside of a tube reads as the inside.
import * as THREE from 'three';
import { iridescent, type IridescentOptions } from '$lib/three/materials';

export function glass(
	geometry: THREE.BufferGeometry,
	o: IridescentOptions = {},
	back: { brightness?: number; tint?: IridescentOptions['tint']; tintMix?: number } = {}
): THREE.Group {
	const g = new THREE.Group();
	const backMat = iridescent({
		...o,
		side: THREE.BackSide,
		depthWrite: false,
		brightness: (o.brightness ?? 1) * (back.brightness ?? 0.5),
		tint: back.tint ?? 0x1b2a6b,
		tintMix: back.tintMix ?? 0.45
	});
	const frontMat = iridescent({ ...o, side: THREE.FrontSide, depthWrite: false });
	const mb = new THREE.Mesh(geometry, backMat);
	const mf = new THREE.Mesh(geometry, frontMat);
	mb.renderOrder = 1;
	mf.renderOrder = 2;
	mb.frustumCulled = false;
	mf.frustumCulled = false;
	g.add(mb, mf);
	g.userData.materials = [backMat, frontMat];
	return g;
}
