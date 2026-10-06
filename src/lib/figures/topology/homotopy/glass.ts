// The book's glass surface (`glassMesh` from $lib/three/materials) with a darker,
// cooler inner side, so that holes cut in a surface read as holes and the inside
// of a tube reads as the inside.
import * as THREE from 'three';
import { glassMesh, type IridescentOptions } from '$lib/three/materials';

export function glass(
	geometry: THREE.BufferGeometry,
	o: IridescentOptions = {},
	back: { brightness?: number; tint?: IridescentOptions['tint']; tintMix?: number } = {}
): THREE.Group {
	const g = glassMesh(geometry, {
		...o,
		inner: { brightness: back.brightness ?? 0.5, tint: back.tint ?? 0x1b2a6b, tintMix: back.tintMix ?? 0.45 }
	});
	g.traverse((m) => (m.frustumCulled = false));
	return g;
}
