// 3D helpers for the gluing figures: a parametric sheet whose vertices are
// rewritten in place every frame (no allocation), an iridescent glass material
// that also paints the four edges of the square (glued edges as glowing bands
// with chevrons, free edges as faint ivory rims), and a glowing tube whose
// centre line can be moved every frame.
import * as THREE from 'three';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { color, glowCore, glowHalo, type PaletteName } from '$lib/three/materials';

export interface P3 {
	x: number;
	y: number;
	z: number;
}
/** A parametrisation of the unit square: writes the point for (u, v) into out. */
export type SheetFn = (u: number, v: number, out: P3) => void;

/**
 * A (nu+1) × (nv+1) grid over [0,1]², with uv = (u, v). `update(fn)` rewrites
 * positions and normals in place (normals by central differences on the grid).
 */
export class ParamSheet {
	readonly geometry = new THREE.BufferGeometry();
	readonly nu: number;
	readonly nv: number;
	private pos: Float32Array;
	private nor: Float32Array;
	private str: Float32Array;
	private w4: Float32Array;
	private p: P3 = { x: 0, y: 0, z: 0 };
	/** true when the normals point (on average) away from the centre */
	outward = true;
	/** bounding sphere of the last update (centre and radius) */
	readonly center = new THREE.Vector3();
	radius = 1;

	constructor(nu = 96, nv = 96) {
		this.nu = nu;
		this.nv = nv;
		const n = (nu + 1) * (nv + 1);
		this.pos = new Float32Array(n * 3);
		this.nor = new Float32Array(n * 3);
		this.str = new Float32Array(n * 2);
		this.w4 = new Float32Array(n);
		const uv = new Float32Array(n * 2);
		for (let j = 0; j <= nv; j++)
			for (let i = 0; i <= nu; i++) {
				const k = j * (nu + 1) + i;
				uv[2 * k] = i / nu;
				uv[2 * k + 1] = j / nv;
			}
		const idx: number[] = [];
		for (let j = 0; j < nv; j++)
			for (let i = 0; i < nu; i++) {
				const a = j * (nu + 1) + i;
				const b = a + 1;
				const c = a + (nu + 1);
				const d = c + 1;
				idx.push(a, b, d, a, d, c);
			}
		const pa = new THREE.BufferAttribute(this.pos, 3);
		pa.setUsage(THREE.DynamicDrawUsage);
		const na = new THREE.BufferAttribute(this.nor, 3);
		na.setUsage(THREE.DynamicDrawUsage);
		const sa = new THREE.BufferAttribute(this.str, 2);
		sa.setUsage(THREE.DynamicDrawUsage);
		this.geometry.setAttribute('position', pa);
		this.geometry.setAttribute('normal', na);
		this.geometry.setAttribute('stretch', sa);
		this.geometry.setAttribute('w4', new THREE.BufferAttribute(this.w4, 1));
		this.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		this.geometry.setIndex(idx);
	}

	/** set the per-vertex "fourth coordinate" used for colouring */
	setW(fn: (u: number, v: number) => number) {
		const { nu, nv } = this;
		for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) this.w4[j * (nu + 1) + i] = fn(i / nu, j / nv);
		this.geometry.attributes.w4.needsUpdate = true;
	}

	/** index of grid vertex (i, j) */
	k(i: number, j: number) {
		return j * (this.nu + 1) + i;
	}

	/** read back the position of grid vertex (i, j) */
	get(i: number, j: number, out: P3) {
		const k = 3 * this.k(i, j);
		out.x = this.pos[k];
		out.y = this.pos[k + 1];
		out.z = this.pos[k + 2];
		return out;
	}

	update(fn: SheetFn) {
		const { nu, nv, pos, nor, str, p } = this;
		let minx = Infinity,
			miny = Infinity,
			minz = Infinity,
			maxx = -Infinity,
			maxy = -Infinity,
			maxz = -Infinity;
		for (let j = 0; j <= nv; j++)
			for (let i = 0; i <= nu; i++) {
				fn(i / nu, j / nv, p);
				const k = 3 * (j * (nu + 1) + i);
				pos[k] = p.x;
				pos[k + 1] = p.y;
				pos[k + 2] = p.z;
				if (p.x < minx) minx = p.x;
				if (p.y < miny) miny = p.y;
				if (p.z < minz) minz = p.z;
				if (p.x > maxx) maxx = p.x;
				if (p.y > maxy) maxy = p.y;
				if (p.z > maxz) maxz = p.z;
			}
		this.center.set((minx + maxx) / 2, (miny + maxy) / 2, (minz + maxz) / 2);
		this.radius = Math.max(1e-6, 0.5 * Math.hypot(maxx - minx, maxy - miny, maxz - minz));
		// normals: (∂P/∂u) × (∂P/∂v) by central differences
		for (let j = 0; j <= nv; j++) {
			const j0 = Math.max(0, j - 1);
			const j1 = Math.min(nv, j + 1);
			for (let i = 0; i <= nu; i++) {
				const i0 = Math.max(0, i - 1);
				const i1 = Math.min(nu, i + 1);
				const a = 3 * (j * (nu + 1) + i1);
				const b = 3 * (j * (nu + 1) + i0);
				const c = 3 * (j1 * (nu + 1) + i);
				const d = 3 * (j0 * (nu + 1) + i);
				const ux = pos[a] - pos[b],
					uy = pos[a + 1] - pos[b + 1],
					uz = pos[a + 2] - pos[b + 2];
				const vx = pos[c] - pos[d],
					vy = pos[c + 1] - pos[d + 1],
					vz = pos[c + 2] - pos[d + 2];
				let nx = uy * vz - uz * vy;
				let ny = uz * vx - ux * vz;
				let nz = ux * vy - uy * vx;
				const len = Math.hypot(nx, ny, nz);
				const k = 3 * (j * (nu + 1) + i);
				// how many model units one unit of u (resp. v) covers here
				const k2 = 2 * (j * (nu + 1) + i);
				str[k2] = Math.hypot(ux, uy, uz) / ((i1 - i0) / nu);
				str[k2 + 1] = Math.hypot(vx, vy, vz) / ((j1 - j0) / nv);
				if (len > 1e-12) {
					nx /= len;
					ny /= len;
					nz /= len;
				} else {
					nx = ny = nz = 0;
				}
				nor[k] = nx;
				nor[k + 1] = ny;
				nor[k + 2] = nz;
			}
		}
		// degenerate rows/columns (poles, collapsed edges): borrow a neighbour's normal
		for (let j = 0; j <= nv; j++)
			for (let i = 0; i <= nu; i++) {
				const k = 3 * (j * (nu + 1) + i);
				if (nor[k] !== 0 || nor[k + 1] !== 0 || nor[k + 2] !== 0) continue;
				const jj = j < nv / 2 ? Math.min(nv, j + 1) : Math.max(0, j - 1);
				const ii = i < nu / 2 ? Math.min(nu, i + 1) : Math.max(0, i - 1);
				const k2 = 3 * (jj * (nu + 1) + ii);
				nor[k] = nor[k2];
				nor[k + 1] = nor[k2 + 1];
				nor[k + 2] = nor[k2 + 2] || 1;
			}
		// do the normals point outwards? (decides which glass pass is the far one)
		let out = 0;
		const cx = this.center.x,
			cy = this.center.y,
			cz = this.center.z;
		for (let k = 0; k < pos.length; k += 9) out += nor[k] * (pos[k] - cx) + nor[k + 1] * (pos[k + 1] - cy) + nor[k + 2] * (pos[k + 2] - cz);
		this.outward = out >= 0;
		const g = this.geometry;
		g.attributes.position.needsUpdate = true;
		g.attributes.normal.needsUpdate = true;
		g.attributes.stretch.needsUpdate = true;
		g.boundingSphere = null;
		g.boundingBox = null;
	}
}

// ── iridescent glass that knows about the square's four edges ────────────────

const vert = /* glsl */ `
	attribute vec2 stretch;
	attribute float w4;
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec2 vUv;
	varying vec2 vStretch;
	varying float vW4;
	void main() {
		vUv = uv;
		vStretch = stretch;
		vW4 = w4;
		vec4 wp = modelMatrix * vec4(position, 1.0);
		vWorldPos = wp.xyz;
		vNormal = normalize(mat3(modelMatrix) * normal);
		gl_Position = projectionMatrix * viewMatrix * wp;
	}
`;

// The body is the book's shared iridescent shader (materials.ts); the edge
// bands are added on top. Edge order everywhere: left (u=0), right (u=1),
// bottom (v=0), top (v=1).
const frag = /* glsl */ `
	uniform float uTime;
	uniform float uOpacity;
	uniform vec2 uGrid;
	uniform float uGridStrength;
	uniform vec3 uGridColor;
	uniform float uFilm;
	uniform float uHue;
	uniform float uRim;
	uniform float uBrightness;
	uniform vec4 uEdgeOn;     // 1 glued, -1 free boundary, 0 nothing
	uniform vec4 uEdgeDir;    // chevron direction (+1 / -1)
	uniform vec3 uEdgeColL;
	uniform vec3 uEdgeColR;
	uniform vec3 uEdgeColB;
	uniform vec3 uEdgeColT;
	uniform vec4 uEdgeMarks;  // chevrons per edge (1 or 2 groups)
	uniform float uEdgeW;     // band width in model units
	uniform float uEdgeGlow;
	uniform float uW4;        // colour by a 4th coordinate (0 = off)
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec2 vUv;
	varying vec2 vStretch;
	varying float vW4;

	vec3 film(float t) {
		return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.02, 0.36, 0.62)));
	}
	float gridLine(float coord, float n) {
		if (n <= 0.0) return 0.0;
		float x = coord * n;
		float w = fwidth(x);
		float d = abs(fract(x - 0.5) - 0.5) / max(w, 1e-4);
		return 1.0 - smoothstep(0.0, 1.2, d);
	}
	// A band along one edge, measured in model units however much the sheet has been
	// stretched: a = distance from the edge (uv), s = position along it (uv),
	// ka / ks = model units per unit of a / s at this point.
	vec4 edgeBand(float a, float s, float ka, float ks, float on, float dir, float marks, vec3 col) {
		if (on == 0.0) return vec4(0.0);
		float am = a * ka;                                 // distance from the edge
		float w = uEdgeW * (on < 0.0 ? 0.45 : 1.0);
		float aw = max(fwidth(am), 1e-6);
		float band = 1.0 - smoothstep(w - aw, w + aw, am);
		if (band <= 0.0) return vec4(0.0);
		if (on < 0.0) {
			return vec4(vec3(0.95, 0.92, 0.84) * 0.8, band * 0.8);
		}
		// chevrons pointing along +dir in the middle of the edge
		float sm = (s - 0.5) * ks * dir;
		float across = abs(am - 0.5 * w);
		float chev = 0.0;
		for (int k = 0; k < 2; k++) {
			if (float(k) >= marks) break;
			float off = (float(k) - (marks - 1.0) * 0.5) * 1.7 * w;
			float d = sm - off + across * 1.15;
			float dw = max(fwidth(d), 1e-6);
			chev = max(chev, 1.0 - smoothstep(0.16 * w - dw, 0.16 * w + dw, abs(d)));
		}
		chev *= 1.0 - smoothstep(0.4 * w, 0.5 * w, across);
		vec3 c = col * (0.9 + 0.45 * chev) + vec3(1.0, 0.97, 0.9) * chev * 0.6;
		return vec4(c * uEdgeGlow, band);
	}
	void main() {
		vec3 N = normalize(vNormal);
		vec3 V = normalize(cameraPosition - vWorldPos);
		// two-sided: always shade the side we are looking at (three flips the
		// winding for BackSide passes, so gl_FrontFacing cannot be trusted here)
		if (dot(N, V) < 0.0) N = -N;
		float ndv = clamp(dot(N, V), 0.0, 1.0);
		float fres = pow(1.0 - ndv, 2.2);
		float phase = uHue + uFilm * (1.0 - ndv) * 0.9 + 0.06 * sin(vWorldPos.y * 1.7 + vWorldPos.x * 0.9 + uTime * 0.25);
		vec3 sheen = film(phase);
		vec3 L1 = normalize(vec3(0.45, 0.85, 0.55));
		vec3 L2 = normalize(vec3(-0.75, 0.15, -0.45));
		float diff = 0.5 + 0.5 * dot(N, L1);
		float spec = pow(max(dot(N, normalize(L1 + V)), 0.0), 70.0);
		float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 24.0);
		vec3 deep = vec3(0.05, 0.08, 0.2);
		vec3 body = mix(deep, vec3(0.16, 0.22, 0.52), diff);
		vec3 col = body * (0.55 + 0.45 * diff);
		col += sheen * (0.28 + 0.72 * fres) * 0.85;
		col += vec3(1.0, 0.96, 0.88) * spec * 0.85;
		col += sheen * spec2 * 0.35;
		if (uW4 > 0.0) {
			// the 4th coordinate as colour: teal (−1) → violet (0) → gold (+1)
			float w = clamp(vW4, -1.0, 1.0);
			vec3 c4 = w < 0.0 ? mix(vec3(0.37, 0.84, 0.81), vec3(0.64, 0.58, 1.0), w + 1.0) : mix(vec3(0.64, 0.58, 1.0), vec3(0.96, 0.84, 0.56), w);
			col = mix(col, c4 * (0.3 + 0.7 * diff) + vec3(1.0) * spec * 0.6 + sheen * 0.18 * fres, 0.8 * uW4);
		}
		float g = max(gridLine(vUv.x, uGrid.x), gridLine(vUv.y, uGrid.y));
		col += uGridColor * g * uGridStrength * (0.55 + 0.45 * fres);
		col += vec3(0.55, 0.78, 1.0) * pow(fres, 3.0) * uRim;
		col *= uBrightness;
		float alpha = clamp(mix(uOpacity, 1.0, fres * 0.55) + g * uGridStrength * 0.25, 0.0, 1.0);

		vec4 e = edgeBand(vUv.x, vUv.y, vStretch.x, vStretch.y, uEdgeOn.x, uEdgeDir.x, uEdgeMarks.x, uEdgeColL);
		vec4 e2 = edgeBand(1.0 - vUv.x, vUv.y, vStretch.x, vStretch.y, uEdgeOn.y, uEdgeDir.y, uEdgeMarks.y, uEdgeColR);
		vec4 e3 = edgeBand(vUv.y, vUv.x, vStretch.y, vStretch.x, uEdgeOn.z, uEdgeDir.z, uEdgeMarks.z, uEdgeColB);
		vec4 e4 = edgeBand(1.0 - vUv.y, vUv.x, vStretch.y, vStretch.x, uEdgeOn.w, uEdgeDir.w, uEdgeMarks.w, uEdgeColT);
		if (e2.a > e.a) e = e2;
		if (e3.a > e.a) e = e3;
		if (e4.a > e.a) e = e4;
		col = mix(col, e.rgb * (0.75 + 0.35 * diff) + vec3(0.25) * fres * e.a, e.a);
		alpha = mix(alpha, 0.97, e.a);
		gl_FragColor = vec4(col, alpha);
	}
`;

export interface EdgeSpec {
	/** 1 glued, -1 free boundary, 0 plain */
	on: number;
	dir?: 1 | -1;
	color?: PaletteName | number | string;
	marks?: 1 | 2;
}

/** Colours in shaders are written straight to the screen (as in materials.ts), so pass hex values through unchanged. */
function rawColor(c: PaletteName | number | string): THREE.Color {
	const col = color(c);
	return new THREE.Color().setRGB(...(col.convertLinearToSRGB().toArray() as [number, number, number]), THREE.LinearSRGBColorSpace);
}

export interface SheetMaterialOptions {
	opacity?: number;
	grid?: [number, number];
	gridStrength?: number;
	edgeWidth?: number;
	brightness?: number;
}

export function sheetMaterial(o: SheetMaterialOptions = {}, side: THREE.Side = THREE.DoubleSide): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		vertexShader: vert,
		fragmentShader: frag,
		uniforms: {
			uTime: { value: 0 },
			uOpacity: { value: o.opacity ?? 0.86 },
			uGrid: { value: new THREE.Vector2(...(o.grid ?? [8, 8])) },
			uGridStrength: { value: o.gridStrength ?? 0.3 },
			uGridColor: { value: rawColor(0xbfe4ff) },
			uFilm: { value: 1.1 },
			uHue: { value: 0 },
			uRim: { value: 0.6 },
			uBrightness: { value: o.brightness ?? 1 },
			uEdgeOn: { value: new THREE.Vector4(0, 0, 0, 0) },
			uEdgeDir: { value: new THREE.Vector4(1, 1, 1, 1) },
			uEdgeColL: { value: rawColor('teal') },
			uEdgeColR: { value: rawColor('teal') },
			uEdgeColB: { value: rawColor('gold') },
			uEdgeColT: { value: rawColor('gold') },
			uEdgeMarks: { value: new THREE.Vector4(1, 1, 1, 1) },
			uEdgeW: { value: o.edgeWidth ?? 0.09 },
			uEdgeGlow: { value: 1.15 },
			uW4: { value: 0 }
		},
		transparent: true,
		depthWrite: false,
		side
	});
}

/** Two-pass glass (back faces, then front faces) for a sheet, with an edge API. */
export function sheetMesh(geometry: THREE.BufferGeometry, o: SheetMaterialOptions = {}) {
	const group = new THREE.Group();
	const back = sheetMaterial({ ...o, brightness: (o.brightness ?? 1) * 0.8 }, THREE.BackSide);
	const front = sheetMaterial(o, THREE.FrontSide);
	const mb = new THREE.Mesh(geometry, back);
	const mf = new THREE.Mesh(geometry, front);
	mb.renderOrder = 1;
	mf.renderOrder = 2;
	mb.frustumCulled = false;
	mf.frustumCulled = false;
	group.add(mb, mf);
	const mats = [back, front];
	return {
		group,
		materials: mats,
		/** edges in the order left, right, bottom, top */
		setEdges(edges: [EdgeSpec, EdgeSpec, EdgeSpec, EdgeSpec]) {
			for (const m of mats) {
				const u = m.uniforms;
				u.uEdgeOn.value.set(edges[0].on, edges[1].on, edges[2].on, edges[3].on);
				u.uEdgeDir.value.set(edges[0].dir ?? 1, edges[1].dir ?? 1, edges[2].dir ?? 1, edges[3].dir ?? 1);
				u.uEdgeMarks.value.set(edges[0].marks ?? 1, edges[1].marks ?? 1, edges[2].marks ?? 1, edges[3].marks ?? 1);
				u.uEdgeColL.value.copy(rawColor(edges[0].color ?? 'teal'));
				u.uEdgeColR.value.copy(rawColor(edges[1].color ?? 'teal'));
				u.uEdgeColB.value.copy(rawColor(edges[2].color ?? 'gold'));
				u.uEdgeColT.value.copy(rawColor(edges[3].color ?? 'gold'));
			}
		},
		setTime(t: number) {
			for (const m of mats) m.uniforms.uTime.value = t;
		},
		/** draw the far walls first: if the normals point inwards, the far walls are the front faces */
		setOutward(outward: boolean) {
			const s0 = outward ? THREE.BackSide : THREE.FrontSide;
			const s1 = outward ? THREE.FrontSide : THREE.BackSide;
			if (back.side !== s0) {
				back.side = s0;
				front.side = s1;
				back.needsUpdate = true;
				front.needsUpdate = true;
			}
		},
		setUniform(name: string, value: number) {
			for (const m of mats) m.uniforms[name].value = value;
		}
	};
}

// ── a glowing tube whose centre line can change every frame ──────────────────

/**
 * Glow tube (bright core + additive halo, as glowTube in materials.ts) whose
 * vertices are rewritten in place by `update(points)`. `points` is a flat
 * array of (segments+1) xyz triples; for closed curves the last equals the first.
 */
export class DynamicTube {
	readonly group = new THREE.Group();
	readonly segments: number;
	readonly radial: number;
	private core: THREE.BufferGeometry;
	private halo: THREE.BufferGeometry;
	private radius: number;
	private haloScale: number;
	private tmpN = new THREE.Vector3();
	private tmpB = new THREE.Vector3();
	private tmpT = new THREE.Vector3();
	private prevN = new THREE.Vector3();
	private materials: THREE.ShaderMaterial[];

	constructor(o: { segments?: number; radial?: number; radius?: number; color?: PaletteName | number | string; haloScale?: number; intensity?: number } = {}) {
		this.segments = o.segments ?? 128;
		this.radial = o.radial ?? 10;
		this.radius = o.radius ?? 0.03;
		this.haloScale = o.haloScale ?? 3.2;
		this.core = this.makeGeometry();
		this.halo = this.makeGeometry();
		const coreMat = glowCore(o.color ?? 'gold', o.intensity ?? 1);
		const haloMat = glowHalo(o.color ?? 'gold', o.intensity ?? 1);
		const mc = new THREE.Mesh(this.core, coreMat);
		const mh = new THREE.Mesh(this.halo, haloMat);
		mc.renderOrder = 5;
		mh.renderOrder = 6;
		mc.frustumCulled = false;
		mh.frustumCulled = false;
		this.group.add(mc, mh);
		this.materials = [coreMat, haloMat];
	}

	private makeGeometry() {
		const n = (this.segments + 1) * (this.radial + 1);
		const g = new THREE.BufferGeometry();
		const p = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
		const nn = new THREE.BufferAttribute(new Float32Array(n * 3), 3);
		p.setUsage(THREE.DynamicDrawUsage);
		nn.setUsage(THREE.DynamicDrawUsage);
		g.setAttribute('position', p);
		g.setAttribute('normal', nn);
		const idx: number[] = [];
		for (let i = 0; i < this.segments; i++)
			for (let j = 0; j < this.radial; j++) {
				const a = i * (this.radial + 1) + j;
				const b = (i + 1) * (this.radial + 1) + j;
				idx.push(a, b, a + 1, b, b + 1, a + 1);
			}
		g.setIndex(idx);
		return g;
	}

	setOpacity(a: number) {
		this.group.visible = a > 0.01;
		for (const m of this.materials) if (m.uniforms.uIntensity) m.uniforms.uIntensity.value = a;
	}

	update(pts: ArrayLike<number>, radiusScale = 1) {
		const S = this.segments;
		const R = this.radial;
		const T = this.tmpT,
			N = this.tmpN,
			B = this.tmpB,
			prev = this.prevN;
		const pc = this.core.attributes.position.array as Float32Array;
		const nc = this.core.attributes.normal.array as Float32Array;
		const ph = this.halo.attributes.position.array as Float32Array;
		const nh = this.halo.attributes.normal.array as Float32Array;
		const r = this.radius * radiusScale;
		const rh = r * this.haloScale;
		for (let i = 0; i <= S; i++) {
			const i0 = Math.max(0, i - 1);
			const i1 = Math.min(S, i + 1);
			T.set(pts[3 * i1] - pts[3 * i0], pts[3 * i1 + 1] - pts[3 * i0 + 1], pts[3 * i1 + 2] - pts[3 * i0 + 2]);
			if (T.lengthSq() < 1e-14) T.set(1, 0, 0);
			T.normalize();
			if (i === 0) {
				// any vector perpendicular to T
				if (Math.abs(T.y) < 0.9) N.set(0, 1, 0);
				else N.set(1, 0, 0);
				N.addScaledVector(T, -N.dot(T)).normalize();
			} else {
				// parallel transport the previous normal
				N.copy(prev).addScaledVector(T, -prev.dot(T));
				if (N.lengthSq() < 1e-12) {
					if (Math.abs(T.y) < 0.9) N.set(0, 1, 0);
					else N.set(1, 0, 0);
					N.addScaledVector(T, -N.dot(T));
				}
				N.normalize();
			}
			prev.copy(N);
			B.crossVectors(T, N);
			const cx = pts[3 * i],
				cy = pts[3 * i + 1],
				cz = pts[3 * i + 2];
			for (let j = 0; j <= R; j++) {
				const a = (j / R) * Math.PI * 2;
				const ca = Math.cos(a),
					sa = Math.sin(a);
				const nx = N.x * ca + B.x * sa,
					ny = N.y * ca + B.y * sa,
					nz = N.z * ca + B.z * sa;
				const k = 3 * (i * (R + 1) + j);
				pc[k] = cx + nx * r;
				pc[k + 1] = cy + ny * r;
				pc[k + 2] = cz + nz * r;
				nc[k] = nx;
				nc[k + 1] = ny;
				nc[k + 2] = nz;
				ph[k] = cx + nx * rh;
				ph[k + 1] = cy + ny * rh;
				ph[k + 2] = cz + nz * rh;
				nh[k] = nx;
				nh[k + 1] = ny;
				nh[k + 2] = nz;
			}
		}
		for (const g of [this.core, this.halo]) {
			g.attributes.position.needsUpdate = true;
			g.attributes.normal.needsUpdate = true;
		}
	}
}

// ── fat glowing line segments (for double curves) ────────────────────────────

/**
 * A set of segments drawn as a crisp core line plus a soft additive glow, with
 * widths in CSS pixels. `segments` is a flat list of end points (6 numbers each).
 */
export function glowSegments(segments: ArrayLike<number>, o: { color?: PaletteName | number | string; width?: number; dpr?: number } = {}) {
	const group = new THREE.Group();
	const dpr = o.dpr ?? 1;
	const geo = new LineSegmentsGeometry();
	geo.setPositions(Array.from(segments));
	const c = rawColor(o.color ?? 'rose');
	const core = new LineMaterial({ color: c, linewidth: (o.width ?? 2.6) * dpr, transparent: true, depthWrite: false });
	const glow = new LineMaterial({
		color: c,
		linewidth: (o.width ?? 2.6) * 3.4 * dpr,
		transparent: true,
		opacity: 0.32,
		depthWrite: false,
		blending: THREE.AdditiveBlending
	});
	const a = new LineSegments2(geo, glow);
	const b = new LineSegments2(geo, core);
	a.renderOrder = 9;
	b.renderOrder = 10;
	a.frustumCulled = false;
	b.frustumCulled = false;
	group.add(a, b);
	return {
		group,
		setOpacity(x: number) {
			group.visible = x > 0.01;
			core.opacity = x;
			glow.opacity = 0.32 * x;
		}
	};
}

/** Smoothstep easing on [0,1]. */
export function ease(x: number) {
	const t = Math.min(1, Math.max(0, x));
	return t * t * (3 - 2 * t);
}
/** Ease t across the window [a, b]. */
export function seg(t: number, a: number, b: number) {
	return ease((t - a) / (b - a));
}
