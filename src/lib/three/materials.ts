// The book's 3D look: iridescent "thin-film" glass surfaces with fine
// parametric grid lines, glowing gold curves, and soft luminous points.
import * as THREE from 'three';

/** The semantic palette, mirrored from app.css. */
export const palette = {
	gold: 0xf3c46c, // a touch richer than the CSS gold so 3D cycles stand out on iridescent glass
	goldDeep: 0xd8b26e,
	goldPale: 0xfff1d0,
	teal: 0x5fd6cf,
	violet: 0xa493ff,
	rose: 0xf28db6,
	blue: 0x74a9ff,
	green: 0x84d9a2,
	amber: 0xf4b55f,
	red: 0xff7f7f,
	ivory: 0xfbf6e8,
	ink: 0x0c1222
} as const;

export type PaletteName = keyof typeof palette;

/**
 * A colour for three.js's built-in materials (MeshBasicMaterial, SpriteMaterial,
 * PointsMaterial…). three.js stores colours in linear space and converts them back
 * to sRGB when it draws, so these come out exactly as the CSS palette.
 */
export function color(c: PaletteName | number | string): THREE.Color {
	if (typeof c === 'string' && c in palette) return new THREE.Color(palette[c as PaletteName]);
	return new THREE.Color(c as THREE.ColorRepresentation);
}

/**
 * A colour for the book's custom ShaderMaterials (iridescent surfaces, glow tubes).
 * Those shaders write display (sRGB) values directly, so uniforms must hold sRGB
 * numbers — otherwise every palette colour renders darker and more saturated.
 */
export function shaderColor(c: PaletteName | number | string): THREE.Color {
	return color(c).convertLinearToSRGB();
}

// ── iridescent surface ─────────────────────────────────────────────────────

// A smooth, time-varying bump field used to "knead" surfaces on the GPU
// (shape-of-a-question). Its gradient tilts the normals to match.
const wobbleGLSL = /* glsl */ `
	uniform float uWobble;
	uniform float uWobbleT;
	float wobble(vec3 p, float t) {
		return 0.42 * sin(1.7 * p.x + 0.9 * t) * cos(1.3 * p.y - 0.6 * t)
			+ 0.3 * sin(2.3 * p.z + 1.1 * p.y + 0.7 * t)
			+ 0.18 * sin(3.1 * p.x - 2.2 * p.z + 1.3 * t)
			+ 0.12 * cos(4.2 * p.y + 2.9 * p.z - 0.8 * t);
	}
	vec3 wobbleGrad(vec3 p, float t) {
		float a = 1.7 * p.x + 0.9 * t;
		float b = 1.3 * p.y - 0.6 * t;
		float c = 2.3 * p.z + 1.1 * p.y + 0.7 * t;
		float d = 3.1 * p.x - 2.2 * p.z + 1.3 * t;
		float e = 4.2 * p.y + 2.9 * p.z - 0.8 * t;
		return vec3(
			0.714 * cos(a) * cos(b) + 0.558 * cos(d),
			-0.546 * sin(a) * sin(b) + 0.33 * cos(c) - 0.504 * sin(e),
			0.69 * cos(c) - 0.396 * cos(d) - 0.348 * sin(e)
		);
	}
`;

const iridescentVertex = /* glsl */ `
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec3 vObj;
	varying vec2 vUv;
	#include <common>
	#include <clipping_planes_pars_vertex>
	#ifdef WOBBLE
	${wobbleGLSL}
	#endif
	void main() {
		vUv = uv;
		vec3 pos = position;
		vec3 nrm = normal;
		#ifdef WOBBLE
		float s = uWobble * wobble(position, uWobbleT);
		vec3 gr = uWobble * wobbleGrad(position, uWobbleT);
		pos += normal * s;
		nrm = normalize(normal - (gr - dot(gr, normal) * normal));
		#endif
		vObj = pos;
		vec4 wp = modelMatrix * vec4(pos, 1.0);
		vWorldPos = wp.xyz;
		vNormal = normalize(mat3(modelMatrix) * nrm);
		vec4 mvPosition = viewMatrix * wp;
		gl_Position = projectionMatrix * mvPosition;
		#include <clipping_planes_vertex>
	}
`;

const iridescentFragment = /* glsl */ `
	uniform float uTime;
	uniform float uOpacity;
	uniform float uFade;
	uniform vec2 uGrid;
	uniform float uGridStrength;
	uniform vec3 uGridColor;
	uniform float uFilm;
	uniform float uHue;
	uniform vec3 uTint;
	uniform float uTintMix;
	uniform float uRim;
	uniform float uBrightness;
	uniform vec3 uHighlightColor;
	uniform vec4 uHighlightRect; // (u0, u1, v0, v1) in uv space; highlight band(s)
	uniform float uHighlight;
	uniform float uInnerBrightness;
	uniform vec3 uInnerTint;
	uniform float uInnerTintMix;
	#ifdef IMPLICIT_GRID
	uniform float uCentres[5];
	uniform int uCount;
	uniform float uR;
	#endif
	#ifdef CUTS
	uniform vec4 uCut0;
	uniform vec4 uCut1;
	#endif
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec3 vObj;
	varying vec2 vUv;
	#include <common>
	#include <clipping_planes_pars_fragment>

	// cosine palette tuned to a cyan → violet → rose → gold thin-film sheen
	vec3 film(float t) {
		return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.02, 0.36, 0.62)));
	}
	// anti-aliased grid line for a coordinate x measured in cells, of screen width w
	float line(float x, float w) {
		float d = abs(fract(x - 0.5) - 0.5) / max(w, 1e-4);
		return (1.0 - smoothstep(0.0, 1.2, d)) * (1.0 - smoothstep(0.25, 0.5, w));
	}
	float gridLine(float coord, float n) {
		if (n <= 0.0) return 0.0;
		float x = coord * n;
		return line(x, fwidth(x));
	}
	void main() {
		#include <clipping_planes_fragment>
		#ifdef CUTS
		if (distance(vObj, uCut0.xyz) < uCut0.w || distance(vObj, uCut1.xyz) < uCut1.w) discard;
		#endif
		// the geometry is oriented outward (see orientOutward), so back faces are the inner side
		bool outer = gl_FrontFacing;
		vec3 N = normalize(vNormal);
		if (!outer) N = -N;
		vec3 V = normalize(cameraPosition - vWorldPos);
		float ndv = clamp(dot(N, V), 0.0, 1.0);
		float fres = pow(1.0 - ndv, 2.2);

		// thin-film interference: hue drifts with viewing angle and a slow shimmer
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
		col = mix(col, uTint * (0.35 + 0.75 * diff) + sheen * 0.15 * fres, uTintMix);

		// highlight band in uv space (used to paint regions on surfaces)
		if (uHighlight > 0.0) {
			float inU = step(uHighlightRect.x, vUv.x) * step(vUv.x, uHighlightRect.y);
			float inV = step(uHighlightRect.z, vUv.y) * step(vUv.y, uHighlightRect.w);
			col = mix(col, uHighlightColor * (0.5 + 0.6 * diff) + vec3(0.15) * fres, uHighlight * inU * inV * 0.8);
		}

		#ifdef IMPLICIT_GRID
		// implicit surfaces have no (u, v): use the angle around the nearest hole and
		// the angle around the tube, with derivatives immune to the atan branch cut
		float cx = 0.0;
		float best = 1e9;
		for (int i = 0; i < 5; i++) {
			if (i >= uCount) break;
			float dd = abs(vObj.x - uCentres[i]);
			if (dd < best) { best = dd; cx = uCentres[i]; }
		}
		vec2 q = vec2(vObj.x - cx, vObj.z);
		float rho = length(q);
		float th = atan(q.y, q.x) / 6.28318;
		float th2 = atan(-q.y, -q.x) / 6.28318;
		float ph = atan(vObj.y, rho - uR) / 6.28318;
		float ph2 = atan(-vObj.y, -(rho - uR)) / 6.28318;
		float g = max(
			line(th * uGrid.x, min(fwidth(th), fwidth(th2)) * uGrid.x),
			line(ph * uGrid.y, min(fwidth(ph), fwidth(ph2)) * uGrid.y)
		);
		#else
		float g = max(gridLine(vUv.x, uGrid.x), gridLine(vUv.y, uGrid.y));
		#endif
		col += uGridColor * g * uGridStrength * (0.55 + 0.45 * fres);

		col += vec3(0.55, 0.78, 1.0) * pow(fres, 3.0) * uRim;
		col *= uBrightness;

		// the inner side (seen through a cut or an open end) is darker and cooler
		if (!outer) col = mix(col, uInnerTint * (0.35 + 0.75 * diff) + sheen * 0.15 * fres, uInnerTintMix) * uInnerBrightness;

		float alpha = clamp(mix(uOpacity, 1.0, fres * 0.55) + g * uGridStrength * 0.25, 0.0, 1.0) * uFade;
		gl_FragColor = vec4(col * mix(0.4, 1.0, uFade), alpha);
	}
`;

// Depth only: lays down the nearest layer of a glass surface so that its colour
// pass draws that layer alone (no sorting artefacts where a surface overlaps itself).
const prepassFragment = /* glsl */ `
	#ifdef CUTS
	uniform vec4 uCut0;
	uniform vec4 uCut1;
	#endif
	varying vec3 vObj;
	#include <common>
	#include <clipping_planes_pars_fragment>
	void main() {
		#include <clipping_planes_fragment>
		#ifdef CUTS
		if (distance(vObj, uCut0.xyz) < uCut0.w || distance(vObj, uCut1.xyz) < uCut1.w) discard;
		#endif
		gl_FragColor = vec4(1.0);
	}
`;

export interface IridescentOptions {
	opacity?: number;
	/** grid line counts along u and v (0 disables) */
	grid?: [number, number];
	gridStrength?: number;
	gridColor?: PaletteName | number | string;
	/** how strongly hue varies with angle */
	film?: number;
	/** base hue offset 0–1 */
	hue?: number;
	/** optionally tint the surface towards a colour (0–1) */
	tint?: PaletteName | number | string;
	tintMix?: number;
	rim?: number;
	brightness?: number;
	side?: THREE.Side;
	depthWrite?: boolean;
	clippingPlanes?: THREE.Plane[];
	/** knead the surface on the GPU: set uniforms.uWobble (amplitude) and uWobbleT (time) */
	wobble?: boolean;
	/** grid lines for implicit surfaces without (u, v): around these hole centres (x) */
	implicitGrid?: { centres: number[]; R: number };
	/** allow two round holes to be cut (uniforms uCut0, uCut1 = centre xyz, radius) */
	cuts?: boolean;
	/** how the inner side looks where it shows (only meaningful for oriented geometry) */
	inner?: { brightness?: number; tint?: PaletteName | number | string; tintMix?: number };
}

export function iridescent(o: IridescentOptions = {}): THREE.ShaderMaterial {
	const transparent = (o.opacity ?? 0.92) < 1;
	const defines: Record<string, string> = {};
	const uniforms: Record<string, THREE.IUniform> = {
		uTime: { value: 0 },
		uOpacity: { value: o.opacity ?? 0.92 },
		uFade: { value: 1 },
		uGrid: { value: new THREE.Vector2(...(o.grid ?? [32, 16])) },
		uGridStrength: { value: o.gridStrength ?? 0.28 },
		uGridColor: { value: shaderColor(o.gridColor ?? 0xbfe4ff) },
		uFilm: { value: o.film ?? 1.1 },
		uHue: { value: o.hue ?? 0.0 },
		uTint: { value: shaderColor(o.tint ?? 'violet') },
		uTintMix: { value: o.tintMix ?? 0 },
		uRim: { value: o.rim ?? 0.6 },
		uBrightness: { value: o.brightness ?? 1 },
		uHighlightColor: { value: shaderColor('gold') },
		uHighlightRect: { value: new THREE.Vector4(0, 0, 0, 0) },
		uHighlight: { value: 0 },
		uInnerBrightness: { value: o.inner?.brightness ?? 1 },
		uInnerTint: { value: shaderColor(o.inner?.tint ?? 0x1b2a6b) },
		uInnerTintMix: { value: o.inner?.tintMix ?? 0 }
	};
	if (o.wobble) {
		defines.WOBBLE = '';
		uniforms.uWobble = { value: 0 };
		uniforms.uWobbleT = { value: 0 };
	}
	if (o.implicitGrid) {
		defines.IMPLICIT_GRID = '';
		const centres = new Array(5).fill(0);
		o.implicitGrid.centres.slice(0, 5).forEach((c, i) => (centres[i] = c));
		uniforms.uCentres = { value: centres };
		uniforms.uCount = { value: Math.min(5, o.implicitGrid.centres.length) };
		uniforms.uR = { value: o.implicitGrid.R };
	}
	if (o.cuts) {
		defines.CUTS = '';
		uniforms.uCut0 = { value: new THREE.Vector4(0, 0, 0, 0) };
		uniforms.uCut1 = { value: new THREE.Vector4(0, 0, 0, 0) };
	}
	return new THREE.ShaderMaterial({
		vertexShader: iridescentVertex,
		fragmentShader: iridescentFragment,
		defines,
		uniforms,
		transparent,
		side: o.side ?? THREE.DoubleSide,
		depthWrite: o.depthWrite ?? !transparent,
		clipping: !!o.clippingPlanes,
		clippingPlanes: o.clippingPlanes ?? null
	});
}

/**
 * Make a geometry's winding (and its normals) face outward, so that front faces
 * are the outside of a closed surface whichever way its parametrization runs.
 * Uses the sign of the enclosed volume; idempotent. Returns true if it flipped.
 */
export function orientOutward(geometry: THREE.BufferGeometry): boolean {
	if (geometry.userData.oriented) return !!geometry.userData.flipped;
	const pos = geometry.attributes.position;
	const index = geometry.index;
	const count = index ? index.count : pos.count;
	const vi = (k: number) => (index ? index.getX(k) : k);
	const a = new THREE.Vector3();
	const b = new THREE.Vector3();
	const c = new THREE.Vector3();
	const ab = new THREE.Vector3();
	const ac = new THREE.Vector3();
	let volume = 0;
	for (let k = 0; k + 2 < count; k += 3) {
		a.fromBufferAttribute(pos, vi(k));
		b.fromBufferAttribute(pos, vi(k + 1));
		c.fromBufferAttribute(pos, vi(k + 2));
		volume += a.dot(ab.crossVectors(b, c));
	}
	const flip = volume < 0;
	if (flip) {
		if (index) {
			const arr = index.array;
			for (let k = 0; k + 2 < count; k += 3) {
				const t = arr[k + 1];
				arr[k + 1] = arr[k + 2];
				arr[k + 2] = t;
			}
			index.needsUpdate = true;
		} else {
			for (const attr of Object.values(geometry.attributes) as THREE.BufferAttribute[]) {
				const n = attr.itemSize;
				const arr = attr.array;
				for (let k = 0; k + 2 < count; k += 3)
					for (let j = 0; j < n; j++) {
						const t = arr[(k + 1) * n + j];
						arr[(k + 1) * n + j] = arr[(k + 2) * n + j];
						arr[(k + 2) * n + j] = t;
					}
				attr.needsUpdate = true;
			}
		}
	}
	// the normal attribute must agree with the (possibly new) winding
	const nrm = geometry.attributes.normal as THREE.BufferAttribute | undefined;
	if (nrm) {
		let agree = 0;
		const n = new THREE.Vector3();
		const step = Math.max(3, Math.floor(count / 3 / 400) * 3);
		for (let k = 0; k + 2 < count; k += step) {
			a.fromBufferAttribute(pos, vi(k));
			b.fromBufferAttribute(pos, vi(k + 1));
			c.fromBufferAttribute(pos, vi(k + 2));
			ab.subVectors(b, a);
			ac.subVectors(c, a);
			ab.cross(ac);
			n.fromBufferAttribute(nrm, vi(k));
			agree += ab.dot(n);
		}
		if (agree < 0) {
			const arr = nrm.array;
			for (let k = 0; k < arr.length; k++) arr[k] = -arr[k];
			nrm.needsUpdate = true;
		}
	}
	geometry.userData.oriented = true;
	geometry.userData.flipped = flip;
	return flip;
}

/** The depth-only twin of a surface material (same vertex shader, so the depths match). */
function depthPrepass(face: THREE.ShaderMaterial): THREE.ShaderMaterial {
	const shared: Record<string, THREE.IUniform> = {};
	for (const k of ['uWobble', 'uWobbleT', 'uCut0', 'uCut1']) if (face.uniforms[k]) shared[k] = face.uniforms[k];
	return new THREE.ShaderMaterial({
		vertexShader: iridescentVertex,
		fragmentShader: prepassFragment,
		defines: { ...face.defines },
		uniforms: shared,
		colorWrite: false,
		depthWrite: true,
		side: THREE.DoubleSide,
		// push the stored depth back a hair, so the colour pass of the same layer (and
		// curves lying on the surface) always pass the depth test
		polygonOffset: true,
		polygonOffsetFactor: 1,
		polygonOffsetUnits: 1,
		clipping: face.clipping,
		clippingPlanes: face.clippingPlanes
	});
}

export interface GlassOptions extends IridescentOptions {
	/**
	 * 'nearest' (default): only the nearest layer of the surface is drawn, so it
	 * reads as a solid, translucent shell; 'all': every layer shows through
	 * (only for surfaces that never overlap themselves on screen).
	 */
	layers?: 'nearest' | 'all';
}

/**
 * The book's glass surface: an iridescent shell whose nearest layer is drawn
 * once, correctly, from any angle. Things behind it are hidden (use the `xray`
 * option of glowTube to show hidden curves faintly). The inner side, where a
 * cut or an open end shows it, is darker and cooler.
 */
export function glassMesh(geometry: THREE.BufferGeometry, o: GlassOptions = {}): THREE.Group {
	orientOutward(geometry);
	const g = new THREE.Group();
	const face = iridescent({
		...o,
		side: THREE.DoubleSide,
		depthWrite: false,
		inner: { brightness: o.inner?.brightness ?? 0.62, tint: o.inner?.tint ?? 0x1b2a6b, tintMix: o.inner?.tintMix ?? 0.4 }
	});
	const mf = new THREE.Mesh(geometry, face);
	mf.renderOrder = 2;
	if ((o.layers ?? 'nearest') === 'nearest') {
		const mp = new THREE.Mesh(geometry, depthPrepass(face));
		mp.renderOrder = -1;
		g.add(mp, mf);
		g.userData.prepass = mp;
	} else {
		// keep the colour pass second, so children[1] is always the visible mesh
		g.add(new THREE.Group(), mf);
	}
	g.userData.materials = [face];
	return g;
}

/**
 * Fade a glass surface in or out (x from 0 to 1). While it is partly faded its
 * depth pre-pass is switched off, so a fading surface never hides another one.
 */
export function setGlassFade(g: THREE.Object3D, x: number) {
	for (const m of (g.userData.materials ?? []) as THREE.ShaderMaterial[]) m.uniforms.uFade.value = x;
	const pre = g.userData.prepass as THREE.Object3D | undefined;
	if (pre) pre.visible = x > 0.995;
	g.visible = x > 0.001;
}

/** Advance time uniforms on every iridescent material in a subtree. */
export function tickMaterials(root: THREE.Object3D, t: number) {
	root.traverse((o) => {
		const m = (o as THREE.Mesh).material as THREE.ShaderMaterial | THREE.ShaderMaterial[] | undefined;
		if (!m) return;
		const list = Array.isArray(m) ? m : [m];
		for (const mm of list) if (mm.uniforms?.uTime) mm.uniforms.uTime.value = t;
	});
}

// ── glowing tubes (curves) ─────────────────────────────────────────────────

const glowVertex = /* glsl */ `
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	void main() {
		vec4 wp = modelMatrix * vec4(position, 1.0);
		vWorldPos = wp.xyz;
		vNormal = normalize(mat3(modelMatrix) * normal);
		gl_Position = projectionMatrix * viewMatrix * wp;
	}
`;

const glowCoreFragment = /* glsl */ `
	uniform vec3 uColor;
	uniform float uIntensity;
	uniform float uOpacity;
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	void main() {
		vec3 N = normalize(vNormal);
		vec3 V = normalize(cameraPosition - vWorldPos);
		float ndv = abs(dot(N, V));
		float core = pow(ndv, 1.6);
		// peak ≈ 1.05 × the palette colour, so bright tubes keep their hue instead of
		// bleaching to white; a faint sheen along the centre line suggests a glossy tube
		vec3 col = uColor * (0.6 + 0.45 * core) * uIntensity;
		col += mix(uColor, vec3(1.0), 0.35) * pow(ndv, 12.0) * 0.12 * uIntensity;
		gl_FragColor = vec4(col, uOpacity);
	}
`;

const haloFragment = /* glsl */ `
	uniform vec3 uColor;
	uniform float uIntensity;
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	void main() {
		vec3 N = normalize(vNormal);
		vec3 V = normalize(cameraPosition - vWorldPos);
		float ndv = abs(dot(N, V));
		float a = pow(ndv, 2.4) * 0.38 * uIntensity;
		gl_FragColor = vec4(uColor * a, a);
	}
`;

export function glowCore(c: PaletteName | number | string = 'gold', intensity = 1, opacity = 1) {
	return new THREE.ShaderMaterial({
		vertexShader: glowVertex,
		fragmentShader: glowCoreFragment,
		uniforms: {
			uColor: { value: shaderColor(c) },
			uIntensity: { value: intensity },
			uOpacity: { value: opacity }
		},
		transparent: opacity < 1
	});
}

export function glowHalo(c: PaletteName | number | string = 'gold', intensity = 1) {
	return new THREE.ShaderMaterial({
		vertexShader: glowVertex,
		fragmentShader: haloFragment,
		uniforms: { uColor: { value: shaderColor(c) }, uIntensity: { value: intensity } },
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending
	});
}

/**
 * The hidden part of a curve or point, drawn faintly: the material passes the
 * depth test only where something nearer (a surface) covers it.
 */
function ghostCore(c: PaletteName | number | string, opacity: number) {
	const m = glowCore(c, 0.9, opacity);
	m.transparent = true;
	m.depthWrite = false;
	m.depthFunc = THREE.GreaterDepth;
	return m;
}

/** A glowing tube along a curve: bright core + soft additive halo. */
export function glowTube(
	curve: THREE.Curve<THREE.Vector3>,
	o: {
		color?: PaletteName | number | string;
		radius?: number;
		segments?: number;
		halo?: boolean;
		haloScale?: number;
		intensity?: number;
		closed?: boolean;
		radialSegments?: number;
		/** opacity of the parts hidden behind surfaces (0 = invisible, the default) */
		xray?: number;
	} = {}
): THREE.Group {
	const radius = o.radius ?? 0.025;
	const segs = o.segments ?? 200;
	const rs = o.radialSegments ?? 10;
	const g = new THREE.Group();
	const coreGeo = new THREE.TubeGeometry(curve, segs, radius, rs, o.closed ?? false);
	const core = new THREE.Mesh(coreGeo, glowCore(o.color ?? 'gold', o.intensity ?? 1));
	core.renderOrder = 5;
	g.add(core);
	if (o.halo !== false) {
		const halo = new THREE.Mesh(
			new THREE.TubeGeometry(curve, segs, radius * (o.haloScale ?? 3.2), rs, o.closed ?? false),
			glowHalo(o.color ?? 'gold', o.intensity ?? 1)
		);
		halo.renderOrder = 6;
		g.add(halo);
	}
	if (o.xray) {
		const ghost = new THREE.Mesh(coreGeo, ghostCore(o.color ?? 'gold', o.xray));
		ghost.renderOrder = 9;
		g.add(ghost);
	}
	return g;
}

/** Recolour a glow tube/point group in place. */
export function setGlowColor(root: THREE.Object3D, c: PaletteName | number | string, intensity?: number) {
	const col = shaderColor(c);
	root.traverse((o) => {
		const m = (o as THREE.Mesh).material as THREE.ShaderMaterial | undefined;
		if (m?.uniforms?.uColor) {
			m.uniforms.uColor.value.copy(col);
			if (intensity !== undefined && m.uniforms.uIntensity) m.uniforms.uIntensity.value = intensity;
		}
	});
}

// ── luminous points ────────────────────────────────────────────────────────

let _dotTex: THREE.Texture | null = null;
export function dotTexture(): THREE.Texture {
	if (_dotTex) return _dotTex;
	const s = 128;
	const c = document.createElement('canvas');
	c.width = c.height = s;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.12, 'rgba(255,255,255,0.95)');
	g.addColorStop(0.28, 'rgba(255,255,255,0.35)');
	g.addColorStop(0.6, 'rgba(255,255,255,0.07)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, s, s);
	_dotTex = new THREE.CanvasTexture(c);
	_dotTex.colorSpace = THREE.SRGBColorSpace;
	return _dotTex;
}

/** A glowing point: a solid bead plus an additive sprite halo. */
export function glowPoint(
	pos: THREE.Vector3 | [number, number, number],
	o: { color?: PaletteName | number | string; size?: number; halo?: number; xray?: number } = {}
): THREE.Group {
	const g = new THREE.Group();
	const p = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
	g.position.copy(p);
	const size = o.size ?? 0.06;
	const beadGeo = new THREE.SphereGeometry(size, 18, 12);
	const bead = new THREE.Mesh(beadGeo, glowCore(o.color ?? 'ivory', 1.1));
	bead.renderOrder = 7;
	const spriteMat = new THREE.SpriteMaterial({
		map: dotTexture(),
		color: color(o.color ?? 'gold'),
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		opacity: 0.9
	});
	const sprite = new THREE.Sprite(spriteMat);
	const hs = size * (o.halo ?? 9);
	sprite.scale.set(hs, hs, 1);
	sprite.renderOrder = 8;
	// children[0] is the bead and children[1] the halo sprite (figures rely on this)
	g.add(bead, sprite);
	if (o.xray) {
		const ghost = new THREE.Mesh(beadGeo, ghostCore(o.color ?? 'ivory', o.xray));
		ghost.renderOrder = 9;
		g.add(ghost);
	}
	return g;
}

/** Many soft points at once (point clouds, starfields). */
export function pointCloud(
	positions: Float32Array | number[],
	o: { color?: PaletteName | number | string; size?: number; opacity?: number; colors?: Float32Array } = {}
): THREE.Points {
	const geo = new THREE.BufferGeometry();
	geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
	if (o.colors) geo.setAttribute('color', new THREE.BufferAttribute(o.colors, 3));
	const mat = new THREE.PointsMaterial({
		size: o.size ?? 0.08,
		map: dotTexture(),
		color: o.colors ? 0xffffff : color(o.color ?? 'gold'),
		vertexColors: !!o.colors,
		transparent: true,
		opacity: o.opacity ?? 1,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		sizeAttenuation: true
	});
	return new THREE.Points(geo, mat);
}

/** A flat, softly lit translucent material for faces of complexes. */
export function faceMaterial(c: PaletteName | number | string = 'violet', opacity = 0.35) {
	return new THREE.MeshBasicMaterial({
		color: color(c),
		transparent: true,
		opacity,
		side: THREE.DoubleSide,
		depthWrite: false
	});
}

/** Dispose every geometry/material/texture in a subtree. */
export function disposeTree(root: THREE.Object3D) {
	root.traverse((o) => {
		const mesh = o as THREE.Mesh;
		mesh.geometry?.dispose?.();
		const m = mesh.material as THREE.Material | THREE.Material[] | undefined;
		if (!m) return;
		for (const mm of Array.isArray(m) ? m : [m]) {
			for (const v of Object.values(mm)) if (v instanceof THREE.Texture && v !== _dotTex) v.dispose();
			mm.dispose();
		}
	});
}
