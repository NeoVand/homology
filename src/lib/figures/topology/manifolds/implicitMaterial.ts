// The book's iridescent glass, adapted to implicit surfaces that have no (u, v)
// coordinates: grid lines are computed in the fragment shader from the
// position, as the angle around the nearest hole and the angle around the tube.
import * as THREE from 'three';
import { color } from '$lib/three/materials';

const vert = /* glsl */ `
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec3 vObj;
	void main() {
		vObj = position;
		vec4 wp = modelMatrix * vec4(position, 1.0);
		vWorldPos = wp.xyz;
		vNormal = normalize(mat3(modelMatrix) * normal);
		gl_Position = projectionMatrix * viewMatrix * wp;
	}
`;

const frag = /* glsl */ `
	uniform float uOpacity;
	uniform float uFade;
	uniform vec2 uGrid;
	uniform float uGridStrength;
	uniform vec3 uGridColor;
	uniform float uFilm;
	uniform float uRim;
	uniform float uBrightness;
	uniform float uCentres[5];
	uniform int uCount;
	uniform float uR;
	uniform vec3 uTint;
	uniform float uTintMix;
	uniform vec4 uCut0;
	uniform vec4 uCut1;
	varying vec3 vNormal;
	varying vec3 vWorldPos;
	varying vec3 vObj;

	vec3 film(float t) { return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.02, 0.36, 0.62))); }

	// anti-aliased grid line for a periodic coordinate x (in cells), with a
	// derivative estimate w that is immune to the atan branch cut
	float gridLine(float x, float w) {
		float d = abs(fract(x - 0.5) - 0.5) / max(w, 1e-4);
		return (1.0 - smoothstep(0.0, 1.2, d)) * (1.0 - smoothstep(0.2, 0.45, w));
	}

	void main() {
		// optional round holes cut out of the surface (for connected sums)
		if (distance(vObj, uCut0.xyz) < uCut0.w || distance(vObj, uCut1.xyz) < uCut1.w) discard;
		vec3 N = normalize(vNormal);
		if (!gl_FrontFacing) N = -N;
		vec3 V = normalize(cameraPosition - vWorldPos);
		float ndv = clamp(dot(N, V), 0.0, 1.0);
		float fres = pow(1.0 - ndv, 2.2);

		// coordinates relative to the nearest hole
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
		float wT = min(fwidth(th), fwidth(th2)) * uGrid.x;
		float wP = min(fwidth(ph), fwidth(ph2)) * uGrid.y;
		float g = max(gridLine(th * uGrid.x, wT), gridLine(ph * uGrid.y, wP));

		float phase = uFilm * (1.0 - ndv) * 0.9 + 0.06 * sin(vWorldPos.y * 1.7 + vWorldPos.x * 0.9);
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
		col += uGridColor * g * uGridStrength * (0.55 + 0.45 * fres);
		col += vec3(0.55, 0.78, 1.0) * pow(fres, 3.0) * uRim;
		col *= uBrightness;
		float alpha = clamp(mix(uOpacity, 1.0, fres * 0.55) + g * uGridStrength * 0.25, 0.0, 1.0) * uFade;
		gl_FragColor = vec4(col * mix(0.4, 1.0, uFade), alpha);
	}
`;

export interface ImplicitGlassOptions {
	opacity?: number;
	grid?: [number, number];
	gridStrength?: number;
	centres?: number[];
	R?: number;
}

function material(o: ImplicitGlassOptions, side: THREE.Side, brightness: number, tintMix: number) {
	const centres = new Array(5).fill(0);
	(o.centres ?? []).slice(0, 5).forEach((c, i) => (centres[i] = c));
	return new THREE.ShaderMaterial({
		vertexShader: vert,
		fragmentShader: frag,
		uniforms: {
			uOpacity: { value: o.opacity ?? 0.85 },
			uFade: { value: 1 },
			uGrid: { value: new THREE.Vector2(...(o.grid ?? [36, 16])) },
			uGridStrength: { value: o.gridStrength ?? 0.32 },
			uGridColor: { value: color(0xbfe4ff) },
			uFilm: { value: 1.1 },
			uRim: { value: 0.6 },
			uBrightness: { value: brightness },
			uCentres: { value: centres },
			uCount: { value: (o.centres ?? []).length },
			uR: { value: o.R ?? 0 },
			uTint: { value: color(0x1b2a6b) },
			uTintMix: { value: tintMix },
			uCut0: { value: new THREE.Vector4(0, 0, 0, 0) },
			uCut1: { value: new THREE.Vector4(0, 0, 0, 0) }
		},
		transparent: true,
		depthWrite: false,
		side
	});
}

/** Two-pass glass for an implicit-surface mesh; `setFade(x)` fades it in and out. */
export function implicitGlass(geometry: THREE.BufferGeometry, o: ImplicitGlassOptions = {}) {
	const g = new THREE.Group();
	const back = material(o, THREE.BackSide, 0.5, 0.45);
	const front = material(o, THREE.FrontSide, 1, 0);
	const mb = new THREE.Mesh(geometry, back);
	const mf = new THREE.Mesh(geometry, front);
	mb.renderOrder = 1;
	mf.renderOrder = 2;
	g.add(mb, mf);
	return {
		group: g,
		setFade(x: number) {
			back.uniforms.uFade.value = x;
			front.uniforms.uFade.value = x;
		},
		/** cut round holes (centre, radius) out of the surface; radius 0 = no hole */
		setCuts(a: [number, number, number, number], b: [number, number, number, number]) {
			for (const m of [back, front]) {
				m.uniforms.uCut0.value.set(...a);
				m.uniforms.uCut1.value.set(...b);
			}
		}
	};
}
