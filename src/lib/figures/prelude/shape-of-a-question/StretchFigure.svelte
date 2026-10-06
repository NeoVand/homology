<script lang="ts">
	// Stretch and squeeze a sphere and a torus as much as you like: their
	// geometry changes completely, but the number of pieces, tunnels and
	// cavities never does. The kneading runs in the vertex shader, so nothing is
	// re-uploaded to the GPU while it animates.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { glassMesh } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import type * as THREE_NS from 'three';

	let amount = $state(0.55);
	let moving = $state(true);

	function setup({ scene, label, onFrame, invalidate, reducedMotion }: SceneContext) {
		const s = glassMesh(surfaceGeometry(sphere(1.35), 96, 64), { opacity: 0.9, grid: [36, 18], gridStrength: 0.2, hue: 0.05, wobble: true });
		const t = glassMesh(surfaceGeometry(torus(1.35, 0.55), 128, 56), { opacity: 0.9, grid: [48, 18], gridStrength: 0.2, hue: 0.55, wobble: true });
		s.position.set(-2.35, 0, 0);
		t.position.set(2.35, 0, 0);
		t.rotation.x = 0.95;
		scene.add(s, t);
		label([-2.35, -2.05, 0], `<span class="tag">sphere</span>`, { className: 'tag small' });
		label([2.35, -2.05, 0], `<span class="tag">torus</span>`, { className: 'tag small' });
		label([-2.35, 2.05, 0], tex('\\text{tunnels } 0 \\quad \\text{cavities } 1'), { className: 'small gold' });
		label([2.35, 2.05, 0], tex('\\text{tunnels } 1 \\quad \\text{cavities } 1'), { className: 'small gold' });

		const sm = (s.userData.materials as THREE_NS.ShaderMaterial[])[0];
		const tm = (t.userData.materials as THREE_NS.ShaderMaterial[])[0];
		let time = 0;
		const apply = () => {
			sm.uniforms.uWobble.value = amount * 0.85;
			tm.uniforms.uWobble.value = amount * 0.55;
			sm.uniforms.uWobbleT.value = tm.uniforms.uWobbleT.value = time;
			invalidate();
		};
		apply();
		onFrame((_, dt) => {
			if (moving && !reducedMotion) time += dt * 0.6;
			s.rotation.y += dt * 0.12;
			t.rotation.z += dt * 0.1;
			apply();
		});
		api = { apply };
		return { dispose: () => (api = null) };
	}

	let api: { apply(): void } | null = null;
	$effect(() => {
		void amount;
		api?.apply();
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
