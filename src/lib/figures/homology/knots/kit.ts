// Shared pieces for the knot figures (here and in Chapters 2.1 and 2.3): smooth
// tubes through the engine's polylines, and the colour wheel that labels the
// points of a circle so that a map onto a knot can be followed by eye.
import * as THREE from 'three';
import type { V3 } from '$lib/knots/diagram';

/** a smooth closed curve through a polyline */
export function closedCurve(pts: V3[]): THREE.CatmullRomCurve3 {
	return new THREE.CatmullRomCurve3(
		pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])),
		true,
		'centripetal'
	);
}

// gold → teal → violet → rose → gold, the book's palette run round a circle
const wheel = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6'].map((c) => new THREE.Color(c));

/** the colour of the point a fraction u of the way round the circle */
export function wheelColor(u: number): THREE.Color {
	const x = (((u % 1) + 1) % 1) * wheel.length;
	const i = Math.floor(x);
	const f = x - i;
	const e = f * f * (3 - 2 * f);
	return wheel[i].clone().lerp(wheel[(i + 1) % wheel.length], e);
}

export function wheelCss(u: number): string {
	return '#' + wheelColor(u).getHexString();
}

/** the scene's y-axis points up; the engine's knots lie in the xy-plane seen from +z: turn them to lie flat, seen from above */
export const flat = (p: V3): V3 => [p[0], p[2], -p[1]];
