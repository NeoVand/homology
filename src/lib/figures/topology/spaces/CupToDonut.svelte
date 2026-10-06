<script lang="ts">
	// The iconic homeomorphism: a (solid) coffee mug deforms into a (solid)
	// doughnut. Ray-marched signed distance field; see cupShader.ts.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { cupVertex, cupFragment } from './cupShader';

	let t = $state(0);
	let showLoop = $state(true);

	const stage = $derived(
		t < 0.04
			? 'A coffee mug. Its dent is not a hole; its handle has one.'
			: t < 0.3
				? 'The dent fills in — no tearing, no gluing'
				: t < 0.86
					? 'The cup shrinks into the handle as the handle thickens'
					: t < 0.995
						? 'Almost there…'
						: 'A doughnut — with the very same hole'
	);

	let api: { set(t: number, loop: boolean): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, renderer, invalidate } = ctx;
		// Ray marching costs per pixel, so cap the resolution on dense screens. Scene3D
		// resets the pixel ratio whenever the canvas resizes; this observer is created
		// after Scene3D's, so it runs after it and re-applies the cap.
		const capRatio = () => {
			if (renderer.getPixelRatio() > 1.5) {
				renderer.setPixelRatio(1.5);
				invalidate();
			}
		};
		capRatio();
		const ro = new ResizeObserver(capRatio);
		ro.observe(renderer.domElement);
		const uniforms = {
			uT: { value: 0 },
			uTime: { value: 0 },
			uRes: { value: new THREE.Vector2(1, 1) },
			uCamPos: { value: new THREE.Vector3() },
			uInvProj: { value: new THREE.Matrix4() },
			uCamWorld: { value: new THREE.Matrix4() },
			uLoop: { value: 1 }
		};
		const mat = new THREE.ShaderMaterial({
			vertexShader: cupVertex,
			fragmentShader: cupFragment,
			uniforms,
			depthTest: false,
			depthWrite: false
		});
		const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
		quad.frustumCulled = false;
		const size = new THREE.Vector2();
		quad.onBeforeRender = () => {
			camera.updateMatrixWorld();
			renderer.getDrawingBufferSize(size);
			uniforms.uRes.value.copy(size);
			uniforms.uCamPos.value.copy(camera.position);
			uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
			uniforms.uCamWorld.value.copy(camera.matrixWorld);
		};
		scene.add(quad);
		api = {
			set(tt, loop) {
				uniforms.uT.value = tt;
				uniforms.uLoop.value = loop ? 1 : 0;
				invalidate();
			}
		};
		api.set(t, showLoop);
		return {
			dispose() {
				ro.disconnect();
				api = null;
			}
		};
	}

	$effect(() => {
		const tt = t;
		const loop = showLoop;
		api?.set(tt, loop);
	});
</script>

<div class="cup">
	<Scene3D
		{setup}
		height={430}
		camera={{ position: [0.25, 2.2, 6.1], fov: 36 }}
		controls={{ autoRotate: false, minPolarAngle: 0.35, maxPolarAngle: 2.6 }}
		label="A glassy coffee mug that smoothly deforms into a doughnut; a gold ring threads the handle's hole throughout"
	/>
	<div class="stage ui" aria-live="polite">{stage}</div>
</div>
<div class="bar ui">
	<Timeline bind:value={t} duration={4.2} from="mug" to="doughnut" label="Deforming the mug into a doughnut" />
	<Toggle bind:checked={showLoop} label="Show the loop through the hole" />
</div>

<style>
	.cup {
		position: relative;
	}
	.stage {
		position: absolute;
		left: 50%;
		bottom: 0.7rem;
		transform: translateX(-50%);
		font-size: 0.78rem;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.66);
		border: 1px solid var(--line-faint);
		border-radius: 0.9rem;
		padding: 0.25rem 0.8rem;
		pointer-events: none;
		/* clear of the reset-view button in the corner; a long stage wraps */
		width: max-content;
		max-width: calc(100% - 7rem);
		text-align: center;
		text-wrap: pretty;
	}
	@container figure (max-width: 520px) {
		/* too narrow to float over the scene: sit under it instead */
		.stage {
			position: static;
			transform: none;
			max-width: calc(100% - 1.6rem);
			margin: 0.2rem auto 0.7rem;
		}
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.2rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
