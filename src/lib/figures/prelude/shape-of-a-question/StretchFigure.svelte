<script lang="ts">
	// Stretch and squeeze a sphere and a torus as much as you like: their
	// geometry changes completely, but the number of pieces, tunnels and
	// cavities never does.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { glassMesh } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { applyWobble, deformable } from './deform';

	let amount = $state(0.55);
	let moving = $state(true);

	function setup({ scene, label, onFrame, invalidate, reducedMotion }: SceneContext) {
		const sGeo = surfaceGeometry(sphere(1.35), 120, 80);
		const tGeo = surfaceGeometry(torus(1.35, 0.55), 150, 70);
		const sd = deformable(sGeo);
		const td = deformable(tGeo);
		const s = glassMesh(sGeo, { opacity: 0.88, grid: [36, 18], gridStrength: 0.2, hue: 0.05 });
		const t = glassMesh(tGeo, { opacity: 0.88, grid: [48, 18], gridStrength: 0.2, hue: 0.55 });
		s.position.set(-2.35, 0, 0);
		t.position.set(2.35, 0, 0);
		t.rotation.x = 0.95;
		scene.add(s, t);
		label([-2.35, -2.05, 0], `<span class="tag">sphere</span>`, { className: 'tag small' });
		label([2.35, -2.05, 0], `<span class="tag">torus</span>`, { className: 'tag small' });
		label([-2.35, 2.05, 0], tex('\\text{tunnels } 0 \\quad \\text{cavities } 1'), { className: 'small gold' });
		label([2.35, 2.05, 0], tex('\\text{tunnels } 1 \\quad \\text{cavities } 1'), { className: 'small gold' });

		let time = 0;
		const draw = () => {
			applyWobble(sd, amount, time, 0.85);
			applyWobble(td, amount, time, 0.55);
			invalidate();
		};
		draw();
		onFrame((_, dt) => {
			if (moving && !reducedMotion) {
				time += dt * 0.6;
				draw();
			}
			s.rotation.y += dt * 0.12;
			t.rotation.z += dt * 0.1;
		});
		api = { redraw: draw };
		return { dispose: () => (api = null) };
	}

	let api: { redraw(): void } | null = null;
	$effect(() => {
		void amount;
		api?.redraw();
	});
</script>

<Scene3D
	{setup}
	height={380}
	camera={{ position: [0, 0.6, 9.2], fov: 38 }}
	controls={{ autoRotate: false }}
	label="A sphere and a torus being stretched and squeezed into lumpy shapes; the sphere never gains a tunnel and the torus never loses its tunnel"
/>
<Controls>
	<Slider bind:value={amount} min={0} max={1.2} step={0.01} label="How much to stretch and squeeze" format={(v) => v.toFixed(2)} />
	<Toggle bind:checked={moving} label="Keep kneading" />
</Controls>
