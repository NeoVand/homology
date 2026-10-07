<script lang="ts">
	// A cloud of points sampled from a doughnut in space. With enough points your
	// eye fills in the surface; the toggle reveals it.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { glassMesh, pointCloud } from '$lib/three/materials';
	import { torus, surfaceGeometry } from '$lib/three/surfaces';
	import { mulberry32 } from '$lib/math/persistence';
	import type * as THREE_NS from 'three';

	const MAXN = 2400;
	const R = 1.6;
	const r = 0.62;

	// uniform samples on the torus (rejection sampling by the area element), in random order
	function sample(): Float32Array {
		const rand = mulberry32(31);
		const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, rand()))) * Math.cos(2 * Math.PI * rand());
		const out = new Float32Array(MAXN * 3);
		let k = 0;
		while (k < MAXN) {
			const th = rand() * Math.PI * 2;
			const ph = rand() * Math.PI * 2;
			if (rand() * (R + r) > R + r * Math.cos(ph)) continue;
			const w = R + r * Math.cos(ph);
			const noise = 0.025;
			out[3 * k] = w * Math.cos(th) + gauss() * noise;
			out[3 * k + 1] = r * Math.sin(ph) + gauss() * noise;
			out[3 * k + 2] = w * Math.sin(th) + gauss() * noise;
			k++;
		}
		return out;
	}

	let count = $state(800);
	// on narrow screens the figure is tall and thin: step the camera back so the torus fits
	let narrow = $state(false);
	$effect(() => {
		narrow = window.matchMedia('(max-width: 640px)').matches;
	});
	let showSurface = $state(false);
	let api: { setCount(n: number): void; setSurface(on: boolean): void } | null = null;

	function setup({ scene, invalidate }: SceneContext) {
		const pos = sample();
		const colors = new Float32Array(MAXN * 3);
		for (let i = 0; i < MAXN; i++) {
			// warm gold with a hint of rose depending on height
			const h = (pos[3 * i + 1] / r + 1) / 2;
			colors[3 * i] = 0.95;
			colors[3 * i + 1] = 0.78 - 0.18 * (1 - h);
			colors[3 * i + 2] = 0.52 + 0.12 * (1 - h);
		}
		const cloud = pointCloud(pos, { size: 0.3, colors, opacity: 0.95 });
		cloud.geometry.setDrawRange(0, count);
		cloud.renderOrder = 10; // draw the dots over the glass, so the surface never hides the data
		scene.add(cloud);
		const surface = glassMesh(surfaceGeometry(torus(R, r), 160, 64), { opacity: 0.0, grid: [48, 20] });
		const mats = surface.userData.materials as THREE_NS.ShaderMaterial[];
		surface.visible = false;
		scene.add(surface);
		let target = showSurface ? 0.32 : 0;
		let current = 0;
		api = {
			setCount(n) {
				cloud.geometry.setDrawRange(0, n);
				invalidate();
			},
			setSurface(on) {
				target = on ? 0.32 : 0;
				surface.visible = true;
				invalidate();
			}
		};
		return {
			update(_t: number, dt: number) {
				if (Math.abs(current - target) <= 1e-3) return false;
				current += (target - current) * Math.min(1, dt * 4);
				for (const m of mats) m.uniforms.uOpacity.value = current;
				surface.visible = current > 0.01;
				return true;
			},
			dispose: () => (api = null)
		};
	}
	// read the state first, so that the effects subscribe to it even before the scene exists
	$effect(() => {
		const n = count;
		api?.setCount(n);
	});
	$effect(() => {
		const on = showSurface;
		api?.setSurface(on);
	});
</script>

<Scene3D
	{setup}
	height={400}
	controls={{ autoRotate: true, autoRotateSpeed: 0.5 }}
	camera={{ position: narrow ? [0, 4.9, 8.9] : [0, 3.3, 6.0] }}
	label="A cloud of points sampled from the surface of a doughnut (torus), slowly rotating"
/>
<div class="controls ui">
	<Segmented
		bind:value={count}
		label="Number of points"
		options={[
			{ value: 50, label: '50 points' },
			{ value: 200, label: '200' },
			{ value: 800, label: '800' },
			{ value: MAXN, label: String(MAXN) }
		]}
	/>
	<Toggle bind:checked={showSurface} label="Reveal the surface" />
</div>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.4rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
