<script lang="ts" module>
	import type { Vec2 } from './calc';

	/** World ↔ CSS-pixel mapping for overlays drawn on top of a FieldView. */
	export interface FieldViewport {
		/** CSS size of the view */
		w: number;
		h: number;
		/** CSS pixels per world unit */
		s: number;
		toPx: (p: Vec2) => Vec2;
		toWorld: (x: number, y: number) => Vec2;
		/** visible world box [x0, x1, y0, y1] */
		box: [number, number, number, number];
	}
</script>

<script lang="ts">
	// A planar vector field drawn on the GPU: an animated line-integral-
	// convolution texture (optionally tinted by curl or divergence, or with
	// level lines of a potential) plus glowing particles riding the flow.
	// The `fg` snippet receives the viewport so overlays can draw in world units.
	import type { Snippet } from 'svelte';
	import * as THREE from 'three';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import type { FieldPreset } from './fields';
	import { FlowParticles, licMaterial, licQuad, type ParticleOptions } from './flow';

	let {
		preset,
		overlay = 0,
		extent = 2.2,
		height = 440,
		particles = true,
		particleOptions = {},
		brightness = 1,
		label = 'An animated picture of a vector field',
		fg
	}: {
		preset: FieldPreset;
		/** 0 flow · 1 curl · 2 divergence · 3 potential level lines */
		overlay?: number;
		/** half the smaller side of the view, in world units */
		extent?: number;
		height?: number;
		particles?: boolean;
		particleOptions?: ParticleOptions;
		brightness?: number;
		label?: string;
		fg?: Snippet<[FieldViewport]>;
	} = $props();

	let w = $state(640);
	let h = $state(440);

	const view: FieldViewport = $derived.by(() => {
		const s = Math.min(w, h) / (2 * extent);
		const hw = w / (2 * s);
		const hh = h / (2 * s);
		return {
			w,
			h,
			s,
			toPx: (p: Vec2): Vec2 => [w / 2 + p[0] * s, h / 2 - p[1] * s],
			toWorld: (x: number, y: number): Vec2 => [(x - w / 2) / s, (h / 2 - y) / s],
			box: [-hw, hw, -hh, hh]
		};
	});

	let api: { sync(): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, renderer, reducedMotion, invalidate, canvas } = ctx;
		// The LIC texture is noise anyway: cap the resolution to keep the shader cheap.
		// (Scene3D resets the pixel ratio when it resizes, so re-apply the cap when needed.)
		const DPR_CAP = 1.5;
		const capDpr = () => {
			const want = Math.min(window.devicePixelRatio || 1, DPR_CAP);
			if (Math.abs(renderer.getPixelRatio() - want) > 1e-3) {
				renderer.setPixelRatio(want);
				renderer.setSize(Math.max(1, canvas.clientWidth), Math.max(1, canvas.clientHeight), false);
			}
		};
		capDpr();
		const mat = licMaterial(preset, overlay, extent);
		const quad = licQuad(mat);
		scene.add(quad);

		let parts: FlowParticles | null = null;
		if (particles && !reducedMotion) {
			parts = new FlowParticles({ avoid: preset.singular, ...particleOptions });
			scene.add(parts.group);
		}

		const size = new THREE.Vector2();
		let box: [number, number, number, number] = [-extent, extent, -extent, extent];
		let shown = preset;
		const syncView = () => {
			renderer.getDrawingBufferSize(size);
			mat.uniforms.uRes.value.copy(size);
			const m = Math.min(size.x, size.y);
			const hw = (extent * size.x) / m;
			const hh = (extent * size.y) / m;
			box = [-hw, hw, -hh, hh];
			parts?.setView([1 / hw, 1 / hh], [0, 0], renderer.getPixelRatio());
		};
		quad.onBeforeRender = syncView;
		syncView();
		parts?.reset(box, preset.F);

		api = {
			sync() {
				capDpr();
				mat.uniforms.uField.value = preset.id;
				mat.uniforms.uOverlay.value = overlay;
				mat.uniforms.uBright.value = brightness;
				if (shown !== preset) {
					shown = preset;
					parts?.reset(box, preset.F);
				}
				invalidate();
			}
		};
		api.sync();

		const dispose = () => {
			api = null;
		};
		if (reducedMotion) return { dispose };
		return {
			update(t: number, dt: number) {
				capDpr();
				mat.uniforms.uT.value = t;
				parts?.step(Math.min(dt, 1 / 30), box, shown.F);
			},
			dispose
		};
	}

	$effect(() => {
		void preset;
		void overlay;
		void brightness;
		api?.sync();
	});
</script>

<div class="fieldview" bind:clientWidth={w} bind:clientHeight={h}>
	<Scene3D {setup} {height} controls={false} {label}>
		{#if fg}{@render fg(view)}{/if}
	</Scene3D>
</div>

<style>
	.fieldview {
		position: relative;
		width: 100%;
		background: #0a0f22;
	}
	.fieldview :global(.fv-svg) {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}
</style>
