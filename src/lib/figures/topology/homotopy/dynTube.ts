// A glowing tube whose centre line can be changed every frame without
// allocating: the vertex buffers are created once and rewritten in place.
// Visually it matches `glowTube` from $lib/three/materials (bright core plus an
// additive halo), so animated curves look like the book's static ones.
import * as THREE from 'three';
import { glowCore, glowHalo, type PaletteName } from '$lib/three/materials';

const _t = new THREE.Vector3();
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();
const _p = new THREE.Vector3();
const _q = new THREE.Vector3();
const _ref = new THREE.Vector3();

class TubeBuffer {
	geometry = new THREE.BufferGeometry();
	private pos: Float32Array;
	private nor: Float32Array;
	// per-sample frames, reused between updates
	private N: Float32Array;
	private T: Float32Array;

	constructor(
		readonly samples: number,
		readonly radial: number,
		public radius: number,
		readonly closed: boolean
	) {
		const nv = samples * radial;
		this.pos = new Float32Array(nv * 3);
		this.nor = new Float32Array(nv * 3);
		this.N = new Float32Array(samples * 3);
		this.T = new Float32Array(samples * 3);
		const segs = closed ? samples : samples - 1;
		const idx: number[] = [];
		for (let i = 0; i < segs; i++) {
			const i2 = (i + 1) % samples;
			for (let j = 0; j < radial; j++) {
				const j2 = (j + 1) % radial;
				const a = i * radial + j;
				const b = i2 * radial + j;
				const c = i2 * radial + j2;
				const d = i * radial + j2;
				idx.push(a, b, d, b, c, d);
			}
		}
		this.geometry.setIndex(idx);
		this.geometry.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
		this.geometry.setAttribute('normal', new THREE.BufferAttribute(this.nor, 3));
	}

	/**
	 * pts: samples×3 centre-line coordinates. ref (optional): samples×3 vectors
	 * roughly perpendicular to the curve (e.g. surface normals) used to orient
	 * the cross-sections; otherwise frames are parallel-transported.
	 */
	update(pts: Float32Array, ref?: Float32Array) {
		const { samples: S, radial: M, closed } = this;
		const T = this.T;
		const N = this.N;
		// tangents (central differences)
		for (let i = 0; i < S; i++) {
			const i0 = closed ? (i - 1 + S) % S : Math.max(0, i - 1);
			const i1 = closed ? (i + 1) % S : Math.min(S - 1, i + 1);
			_t.set(pts[i1 * 3] - pts[i0 * 3], pts[i1 * 3 + 1] - pts[i0 * 3 + 1], pts[i1 * 3 + 2] - pts[i0 * 3 + 2]);
			if (_t.lengthSq() < 1e-14) {
				// degenerate: reuse the previous tangent (or x-axis)
				if (i > 0) _t.set(T[(i - 1) * 3], T[(i - 1) * 3 + 1], T[(i - 1) * 3 + 2]);
				else _t.set(1, 0, 0);
			}
			_t.normalize();
			T[i * 3] = _t.x;
			T[i * 3 + 1] = _t.y;
			T[i * 3 + 2] = _t.z;
		}
		// normals
		if (ref) {
			for (let i = 0; i < S; i++) {
				_t.set(T[i * 3], T[i * 3 + 1], T[i * 3 + 2]);
				_n.set(ref[i * 3], ref[i * 3 + 1], ref[i * 3 + 2]);
				_n.addScaledVector(_t, -_n.dot(_t));
				if (_n.lengthSq() < 1e-12) {
					_n.set(0, 1, 0).addScaledVector(_t, -_t.y);
					if (_n.lengthSq() < 1e-12) _n.set(1, 0, 0).addScaledVector(_t, -_t.x);
				}
				_n.normalize();
				N[i * 3] = _n.x;
				N[i * 3 + 1] = _n.y;
				N[i * 3 + 2] = _n.z;
			}
		} else {
			// parallel transport, then spread any closing twist evenly
			_t.set(T[0], T[1], T[2]);
			_ref.set(0, 1, 0);
			if (Math.abs(_t.dot(_ref)) > 0.9) _ref.set(1, 0, 0);
			_n.copy(_ref).addScaledVector(_t, -_ref.dot(_t)).normalize();
			N[0] = _n.x;
			N[1] = _n.y;
			N[2] = _n.z;
			for (let i = 1; i < S; i++) {
				_t.set(T[i * 3], T[i * 3 + 1], T[i * 3 + 2]);
				_n.set(N[(i - 1) * 3], N[(i - 1) * 3 + 1], N[(i - 1) * 3 + 2]);
				_n.addScaledVector(_t, -_n.dot(_t));
				if (_n.lengthSq() < 1e-12) _n.set(0, 1, 0).addScaledVector(_t, -_t.y);
				_n.normalize();
				N[i * 3] = _n.x;
				N[i * 3 + 1] = _n.y;
				N[i * 3 + 2] = _n.z;
			}
			if (closed) {
				// angle between the transported last frame (carried once more) and the first
				_t.set(T[0], T[1], T[2]);
				_n.set(N[(S - 1) * 3], N[(S - 1) * 3 + 1], N[(S - 1) * 3 + 2]);
				_n.addScaledVector(_t, -_n.dot(_t)).normalize();
				_p.set(N[0], N[1], N[2]);
				let ang = Math.acos(Math.max(-1, Math.min(1, _n.dot(_p))));
				_q.crossVectors(_n, _p);
				if (_q.dot(_t) < 0) ang = -ang;
				for (let i = 1; i < S; i++) {
					const a = (ang * i) / S;
					_t.set(T[i * 3], T[i * 3 + 1], T[i * 3 + 2]);
					_n.set(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
					_b.crossVectors(_t, _n);
					_n.multiplyScalar(Math.cos(a)).addScaledVector(_b, Math.sin(a));
					N[i * 3] = _n.x;
					N[i * 3 + 1] = _n.y;
					N[i * 3 + 2] = _n.z;
				}
			}
		}
		// rings
		const r = this.radius;
		for (let i = 0; i < S; i++) {
			_t.set(T[i * 3], T[i * 3 + 1], T[i * 3 + 2]);
			_n.set(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]);
			_b.crossVectors(_t, _n);
			const cx = pts[i * 3];
			const cy = pts[i * 3 + 1];
			const cz = pts[i * 3 + 2];
			for (let j = 0; j < M; j++) {
				const a = (j / M) * Math.PI * 2;
				const ca = Math.cos(a);
				const sa = Math.sin(a);
				const nx = ca * _n.x + sa * _b.x;
				const ny = ca * _n.y + sa * _b.y;
				const nz = ca * _n.z + sa * _b.z;
				const k = (i * M + j) * 3;
				this.nor[k] = nx;
				this.nor[k + 1] = ny;
				this.nor[k + 2] = nz;
				this.pos[k] = cx + r * nx;
				this.pos[k + 1] = cy + r * ny;
				this.pos[k + 2] = cz + r * nz;
			}
		}
		this.geometry.attributes.position.needsUpdate = true;
		this.geometry.attributes.normal.needsUpdate = true;
	}
}

export interface DynTubeOptions {
	color?: PaletteName | number | string;
	radius?: number;
	radialSegments?: number;
	closed?: boolean;
	halo?: boolean;
	haloScale?: number;
	intensity?: number;
}

/** A glowing tube (core + halo) with `samples` centre-line points, updatable in place. */
export class DynTube {
	group = new THREE.Group();
	private core: TubeBuffer;
	private halo: TubeBuffer | null = null;
	readonly samples: number;
	/** scratch buffer callers may fill and pass to update() */
	readonly points: Float32Array;
	readonly refs: Float32Array;

	constructor(samples: number, o: DynTubeOptions = {}) {
		this.samples = samples;
		const radius = o.radius ?? 0.025;
		const rs = o.radialSegments ?? 10;
		const closed = o.closed ?? false;
		this.points = new Float32Array(samples * 3);
		this.refs = new Float32Array(samples * 3);
		this.core = new TubeBuffer(samples, rs, radius, closed);
		const coreMesh = new THREE.Mesh(this.core.geometry, glowCore(o.color ?? 'gold', o.intensity ?? 1));
		coreMesh.renderOrder = 5;
		coreMesh.frustumCulled = false;
		this.group.add(coreMesh);
		if (o.halo !== false) {
			this.halo = new TubeBuffer(samples, rs, radius * (o.haloScale ?? 3.2), closed);
			const haloMesh = new THREE.Mesh(this.halo.geometry, glowHalo(o.color ?? 'gold', o.intensity ?? 1));
			haloMesh.renderOrder = 6;
			haloMesh.frustumCulled = false;
			this.group.add(haloMesh);
		}
	}

	/** Rebuild from `this.points` (and `this.refs` if useRefs). */
	update(useRefs = false) {
		this.core.update(this.points, useRefs ? this.refs : undefined);
		this.halo?.update(this.points, useRefs ? this.refs : undefined);
	}

	set visible(v: boolean) {
		this.group.visible = v;
	}
	get visible() {
		return this.group.visible;
	}
}
