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

const iridescentVertex = /* glsl */ `
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec2 vUv;
	#include <common>
	#include <clipping_planes_pars_vertex>
	void main() {
		vUv = uv;
		vec4 wp = modelMatrix * vec4(position, 1.0);
		vWorldPos = wp.xyz;
		vNormal = normalize(mat3(modelMatrix) * normal);
		vec4 mvPosition = viewMatrix * wp;
		gl_Position = projectionMatrix * mvPosition;
		#include <clipping_planes_vertex>
	}
`;

const iridescentFragment = /* glsl */ `
	uniform float uTime;
	uniform float uOpacity;
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
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec2 vUv;
	#include <common>
	#include <clipping_planes_pars_fragment>

	// cosine palette tuned to a cyan → violet → rose → gold thin-film sheen
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
	void main() {
		#include <clipping_planes_fragment>
		vec3 N = normalize(vNormal);
		if (!gl_FrontFacing) N = -N;
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

		float g = max(gridLine(vUv.x, uGrid.x), gridLine(vUv.y, uGrid.y));
		col += uGridColor * g * uGridStrength * (0.55 + 0.45 * fres);

		col += vec3(0.55, 0.78, 1.0) * pow(fres, 3.0) * uRim;
		col *= uBrightness;

		float alpha = clamp(mix(uOpacity, 1.0, fres * 0.55) + g * uGridStrength * 0.25, 0.0, 1.0);
		gl_FragColor = vec4(col, alpha);
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
}

export function iridescent(o: IridescentOptions = {}): THREE.ShaderMaterial {
	const transparent = (o.opacity ?? 0.92) < 1;
	return new THREE.ShaderMaterial({
		vertexShader: iridescentVertex,
		fragmentShader: iridescentFragment,
		uniforms: {
			uTime: { value: 0 },
			uOpacity: { value: o.opacity ?? 0.92 },
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
			uHighlight: { value: 0 }
		},
		transparent,
		side: o.side ?? THREE.DoubleSide,
		depthWrite: o.depthWrite ?? !transparent,
		clipping: !!o.clippingPlanes,
		clippingPlanes: o.clippingPlanes ?? null
	});
}

/**
 * A see-through surface rendered in two passes (back faces, then front faces)
 * so that self-overlapping transparent shapes (a torus seen edge-on) sort well.
 */
export function glassMesh(geometry: THREE.BufferGeometry, o: IridescentOptions = {}): THREE.Group {
	const g = new THREE.Group();
	const back = iridescent({ ...o, side: THREE.BackSide, depthWrite: false, brightness: (o.brightness ?? 1) * 0.8 });
	const front = iridescent({ ...o, side: THREE.FrontSide, depthWrite: false });
	const mb = new THREE.Mesh(geometry, back);
	const mf = new THREE.Mesh(geometry, front);
	mb.renderOrder = 1;
	mf.renderOrder = 2;
	g.add(mb, mf);
	g.userData.materials = [back, front];
	return g;
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
	} = {}
): THREE.Group {
	const radius = o.radius ?? 0.025;
	const segs = o.segments ?? 200;
	const rs = o.radialSegments ?? 10;
	const g = new THREE.Group();
	const core = new THREE.Mesh(
		new THREE.TubeGeometry(curve, segs, radius, rs, o.closed ?? false),
		glowCore(o.color ?? 'gold', o.intensity ?? 1)
	);
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
	o: { color?: PaletteName | number | string; size?: number; halo?: number } = {}
): THREE.Group {
	const g = new THREE.Group();
	const p = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
	g.position.copy(p);
	const size = o.size ?? 0.06;
	const bead = new THREE.Mesh(new THREE.SphereGeometry(size, 18, 12), glowCore(o.color ?? 'ivory', 1.1));
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
	g.add(bead, sprite);
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
