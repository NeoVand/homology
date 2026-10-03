// Geometry for the deformation-retraction figure. Each "model" is a grid mesh
// over a parameter domain whose vertex positions are a function of time t ∈ [0,1]:
// at t = 0 it is the whole space X, at t = 1 everything has slid onto the subspace A.
// Positions are rewritten in place (no allocation per frame).
import * as THREE from 'three';
import { torus as torusFn, type SurfaceFn } from '$lib/three/surfaces';

const TAU = Math.PI * 2;

export interface RetractModel {
	geometry: THREE.BufferGeometry;
	/** move every vertex to its position at time t */
	setT(t: number): void;
	/** world position of a parameter point at time t (for curves) */
	point(a: number, b: number, t: number, target: THREE.Vector3): THREE.Vector3;
}

/**
 * A (na+1)×(nb+1) grid over (a, b) ∈ [0,1]², with uv attribute given by uvOf
 * (the "material" coordinates whose grid lines get carried along).
 */
function gridModel(
	na: number,
	nb: number,
	place: (a: number, b: number, t: number, target: THREE.Vector3) => void,
	uvOf: (a: number, b: number) => [number, number]
): RetractModel {
	const g = new THREE.BufferGeometry();
	const nv = (na + 1) * (nb + 1);
	const pos = new Float32Array(nv * 3);
	const uv = new Float32Array(nv * 2);
	const idx: number[] = [];
	for (let i = 0; i <= na; i++)
		for (let j = 0; j <= nb; j++) {
			const k = i * (nb + 1) + j;
			const [u, v] = uvOf(i / na, j / nb);
			uv[k * 2] = u;
			uv[k * 2 + 1] = v;
		}
	for (let i = 0; i < na; i++)
		for (let j = 0; j < nb; j++) {
			const a = i * (nb + 1) + j;
			const b = (i + 1) * (nb + 1) + j;
			const c = (i + 1) * (nb + 1) + j + 1;
			const d = i * (nb + 1) + j + 1;
			idx.push(a, b, d, b, c, d);
		}
	g.setIndex(idx);
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
	g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	const tmp = new THREE.Vector3();
	const model: RetractModel = {
		geometry: g,
		setT(t) {
			for (let i = 0; i <= na; i++)
				for (let j = 0; j <= nb; j++) {
					place(i / na, j / nb, t, tmp);
					const k = (i * (nb + 1) + j) * 3;
					pos[k] = tmp.x;
					pos[k + 1] = tmp.y;
					pos[k + 2] = tmp.z;
				}
			g.attributes.position.needsUpdate = true;
			g.computeVertexNormals();
		},
		point(a, b, t, target) {
			place(a, b, t, target);
			return target;
		}
	};
	model.setT(0);
	return model;
}

/** Disk of radius R shrinking to its centre: f_t(x) = (1 − t)x. */
export function diskModel(R = 1.75) {
	return gridModel(
		96,
		16,
		(a, b, t, p) => {
			const s = Math.max(0.002, 1 - t) * R * b;
			p.set(s * Math.cos(TAU * a), 0, s * Math.sin(TAU * a));
		},
		(a, b) => [a, b]
	);
}

/** Annulus r0 ≤ r ≤ r1 squeezed onto its middle circle. */
export function annulusModel(r0 = 0.85, r1 = 1.95) {
	const rc = (r0 + r1) / 2;
	return {
		rc,
		...gridModel(
			128,
			12,
			(a, b, t, p) => {
				const r = r0 + (r1 - r0) * b;
				const rt = r + t * (rc - r);
				p.set(rt * Math.cos(TAU * a), 0, rt * Math.sin(TAU * a));
			},
			(a, b) => [a, b]
		)
	};
}

/** Möbius band whose width shrinks to zero onto the core circle. */
export function mobiusModel(R = 1.6, width = 1.15) {
	const place = (a: number, b: number, t: number, p: THREE.Vector3) => {
		const th = TAU * a;
		const s = (b - 0.5) * width * Math.max(0.002, 1 - t);
		const w = R + s * Math.cos(th / 2);
		p.set(w * Math.cos(th), s * Math.sin(th / 2), w * Math.sin(th));
	};
	return { R, ...gridModel(200, 14, place, (a, b) => [a, b]) };
}

/**
 * Punctured torus retracting onto the figure eight a ∪ b (the image of the
 * boundary of the gluing square). Work in the square [0,1]² with the puncture
 * at its centre; points slide outward along rays from the puncture until they
 * hit the square's boundary. `offset` rotates the square on the torus so the
 * puncture faces the viewer.
 */
export function puncturedTorusModel(R = 1.5, r = 0.62, offset: [number, number] = [-0.25, -0.25]) {
	const f: SurfaceFn = torusFn(R, r);
	// a round hole of (3D) radius ρ near the top of the tube: elliptical in (u, v)
	const rho = 0.32;
	const ku = rho / (TAU * (R + r * Math.cos(TAU * (0.5 + offset[1]))));
	const kv = rho / (TAU * r);
	const square = (a: number, b: number, t: number): [number, number] => {
		const al = TAU * a;
		const du = ku * Math.cos(al);
		const dv = kv * Math.sin(al);
		// λ such that centre + λ·(du, dv) hits the square boundary
		const lu = Math.abs(du) > 1e-12 ? 0.5 / Math.abs(du) : Infinity;
		const lv = Math.abs(dv) > 1e-12 ? 0.5 / Math.abs(dv) : Infinity;
		const lout = Math.min(lu, lv);
		// spacing: denser near the hole, so the rim looks round
		const bb = b * b * (3 - 2 * b) * 0.35 + b * 0.65;
		const lam = 1 + (lout - 1) * bb;
		const lt = lam + t * (lout - lam);
		return [0.5 + lt * du, 0.5 + lt * dv];
	};
	const place = (a: number, b: number, t: number, p: THREE.Vector3) => {
		const [u, v] = square(a, b, t);
		f((((u + offset[0]) % 1) + 1) % 1, (((v + offset[1]) % 1) + 1) % 1, p);
	};
	const model = gridModel(288, 44, place, (a, b) => {
		const [u, v] = square(a, b, 0);
		return [u + offset[0], v + offset[1]];
	});
	return { f, square, offset, ...model };
}
