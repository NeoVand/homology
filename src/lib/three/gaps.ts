// Gaps at the crossings of a knot, as in a drawing: where one strand passes over
// another, the lower strand stops short on either side of it, and the background
// shows through.
//
// Before each frame the knot's tubes alone are drawn into a small buffer that keeps,
// at every pixel, how near the nearest tube is, which tube it is and how far along
// it. When a tube is then drawn for real, each of its pixels looks round itself on a
// few rings: if within the gap's width some tube is nearer by more than a tube's
// thickness, and is not just this same tube a little further along (a tube bending
// towards the eye hides a bit of itself, and that is no crossing), the pixel lies
// beside a strand passing over it, and it fades out. The gap is a band of even width
// beside the upper strand, whatever the angle, and it shows the real background, so
// it never shows up as a dark rim against the background.
import * as THREE from 'three';
import type { SceneContext } from '$lib/components/three/Scene3D.svelte';

/** the layer the tubes that cut gaps are drawn on, besides their own */
export const GAP_LAYER = 7;

export interface Gaps {
	/** shared by every tube material that leaves gaps */
	uniforms: {
		uGapDepth: { value: THREE.Texture | null };
		uGapRes: { value: THREE.Vector2 };
		uGapFocal: { value: number };
	};
	/** a new number for the next tube (each tube carries its own in the attribute gapId) */
	id(): number;
	dispose(): void;
}

const depthVertex = /* glsl */ `
	attribute float gapId;
	varying float vZ;
	varying float vU;
	varying float vId;
	void main() {
		vec4 mv = modelViewMatrix * vec4(position, 1.0);
		vZ = -mv.z;
		vU = uv.x;
		vId = gapId;
		gl_Position = projectionMatrix * mv;
	}
`;
// 1/depth (so that the cleared value 0 means "no tube here", as far away as can be), how far along
// its tube, and which tube
const depthFragment = /* glsl */ `
	varying float vZ;
	varying float vU;
	varying float vId;
	void main() {
		gl_FragColor = vec4(1.0 / vZ, vU, vId, 1.0);
	}
`;

/** set up the gaps for a scene: tubes made with `gaps` in their options then leave them */
export function knotGaps(ctx: SceneContext): Gaps {
	const { renderer, scene, camera } = ctx;
	const target = new THREE.WebGLRenderTarget(1, 1, {
		type: THREE.HalfFloatType,
		format: THREE.RGBAFormat,
		minFilter: THREE.NearestFilter,
		magFilter: THREE.NearestFilter,
		depthBuffer: true
	});
	const depth = new THREE.ShaderMaterial({ vertexShader: depthVertex, fragmentShader: depthFragment });
	const uniforms: Gaps['uniforms'] = {
		uGapDepth: { value: target.texture },
		uGapRes: { value: new THREE.Vector2(1, 1) },
		uGapFocal: { value: 1 }
	};
	let next = 1;
	const size = new THREE.Vector2();
	const clear = new THREE.Color();
	const off = ctx.beforeRender(() => {
		renderer.getDrawingBufferSize(size);
		if (target.width !== size.x || target.height !== size.y) target.setSize(size.x, size.y);
		uniforms.uGapRes.value.copy(size);
		uniforms.uGapFocal.value = size.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
		const mask = camera.layers.mask;
		const before = renderer.getRenderTarget();
		const background = scene.background;
		const alpha = renderer.getClearAlpha();
		renderer.getClearColor(clear);
		camera.layers.set(GAP_LAYER);
		scene.overrideMaterial = depth;
		scene.background = null;
		renderer.setRenderTarget(target);
		renderer.setClearColor(0x000000, 0);
		renderer.clear();
		renderer.render(scene, camera);
		renderer.setRenderTarget(before);
		renderer.setClearColor(clear, alpha);
		scene.overrideMaterial = null;
		scene.background = background;
		camera.layers.mask = mask;
	});
	return {
		uniforms,
		id: () => next++,
		dispose() {
			off();
			target.dispose();
			depth.dispose();
		}
	};
}

/** the GLSL a tube's vertex shader needs for gaps: call gapVertex() in main */
export const gapVertexGLSL = /* glsl */ `
	attribute float gapId;
	varying float vGapU;
	varying float vGapId;
	void gapVertex() {
		vGapU = uv.x;
		vGapId = gapId;
	}
`;

/**
 * The GLSL for a tube's fragment shader: `gapAlpha()` is 0 inside a gap and 1 away from one. It needs
 * the varying vViewZ (the fragment's depth) and uniforms of its own: uGapWidth, the gap's width;
 * uGapThick, how much nearer another tube must be to cut one; uGapLength, the tube's length, and
 * uGapArc, how far along the same tube a part must be to cut it (all in world units); uGapClosed, 1 for
 * a closed tube.
 */
export const gapGLSL = /* glsl */ `
	uniform sampler2D uGapDepth;
	uniform vec2 uGapRes;
	uniform float uGapFocal;
	uniform float uGapWidth;
	uniform float uGapThick;
	uniform float uGapLength;
	uniform float uGapArc;
	uniform float uGapClosed;
	varying float vViewZ;
	varying float vGapU;
	varying float vGapId;
	float gapAlpha() {
		float z = vViewZ;
		// the gap's width on screen, in pixels, and how near a tube must be to cut it
		float w = max(1.5, uGapWidth * uGapFocal / z);
		float nearer = 1.0 / max(z - uGapThick, 1e-3);
		vec2 here = gl_FragCoord.xy / uGapRes;
		// the nearest ring that meets a nearer strand; the rings are closer together near the gap's edge,
		// which is drawn soft over about a pixel
		float hit = 1e4;
		for (int ring = 0; ring < 6; ring++) {
			float r = w * (ring < 3 ? 0.3 * float(ring + 1) : 0.9 + 0.15 * float(ring - 2));
			for (int k = 0; k < 10; k++) {
				float a = 0.6283185 * (float(k) + 0.5 * float(ring));
				vec4 s = texture2D(uGapDepth, here + vec2(cos(a), sin(a)) * r / uGapRes);
				if (s.r <= nearer) continue;
				float du = abs(s.g - vGapU);
				if (uGapClosed > 0.5) du = min(du, 1.0 - du);
				if (abs(s.b - vGapId) < 0.5 && du * uGapLength < uGapArc) continue;
				hit = min(hit, r);
			}
		}
		return smoothstep(w, w + 1.2, hit);
	}
`;
