<script lang="ts">
	// The boundary of a Möbius band is one circle that runs twice around the core.
	// A bead walks along the boundary; its shadow on the core goes around twice.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowTube, glowPoint } from '$lib/three/materials';
	import { mobius, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { fitCamera, isNarrow } from '../invariance/three-fit';
	import { FnCurve } from '../invariance/curves';
	import type * as THREE_NS from 'three';

	let p = $state(0.3); // position along the boundary, 0 → 1 is the whole boundary
	let run = $state(true);
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { setP(v: number): void } | null = null;

	const R = 1.5;
	const WIDTH = 1.0;
	const TAU = Math.PI * 2;
	const turns = $derived(2 * p);

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion } = ctx;
		const unfit = fitCamera(ctx, 1.5);
		const f = mobius(R, WIDTH);
		scene.add(glassMesh(surfaceGeometry(f, 200, 16), { opacity: 0.5, grid: [40, 6], gridStrength: 0.22 }));
		// the core: v = 1/2, once around
		scene.add(glowTube(new SurfaceCurve(f, (t) => [t, 0.5], 0), { color: 'gold', closed: true, radius: 0.024 }));
		// the boundary: v = 0 for one lap, then v = 1 for the next — a single closed curve
		const edge = (t: number): [number, number] => (t < 0.5 ? [2 * t, 0] : [2 * t - 1, 1]);
		const boundaryPoint = (t: number, out: THREE_NS.Vector3) => {
			const [u, v] = edge(((t % 1) + 1) % 1);
			f(u, v, out);
			return out;
		};
		scene.add(glowTube(new FnCurve((t, out) => boundaryPoint(t, out)), { color: 'teal', closed: true, radius: 0.02, segments: 400 }));
		const bead = glowPoint([0, 0, 0], { color: 'ivory', size: 0.065 });
		const shadow = glowPoint([0, 0, 0], { color: 'gold', size: 0.06, halo: 10 });
		scene.add(bead, shadow);
		const rung = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
			new THREE.LineBasicMaterial({ color: 0xfbf6e8, transparent: true, opacity: 0.6 })
		);
		scene.add(rung);
		const q = new THREE.Vector3();
		f(0.75, 0.5, q);
		label(q.clone().add(new THREE.Vector3(0, 0.32, -0.1)), tex('\\text{core}'), { className: 'gold small' });
		f(0.4, 1, q);
		label(q.clone().multiplyScalar(1.14).add(new THREE.Vector3(0, 0.15, 0)), tex('\\text{boundary}'), { className: 'teal small' });

		const a = new THREE.Vector3();
		const b = new THREE.Vector3();
		const pos = rung.geometry.attributes.position as THREE_NS.BufferAttribute;
		function setP(t: number) {
			boundaryPoint(t, a);
			const [u] = edge(((t % 1) + 1) % 1);
			f(u, 0.5, b);
			bead.position.copy(a);
			shadow.position.copy(b);
			pos.setXYZ(0, a.x, a.y, a.z);
			pos.setXYZ(1, b.x, b.y, b.z);
			pos.needsUpdate = true;
			invalidate();
		}
		setP(p);
		api = { setP };
		const stop = onFrame((_t, dt) => {
			if (!run || reducedMotion) return;
			p = (p + dt / 12) % 1;
		});
		return {
			dispose: () => {
				unfit();
				stop();
				api = null;
			}
		};
	}
	$effect(() => {
		// read the state first: `api?.f(x)` would skip reading x while api is null,
		// and the effect would then never re-run
		const v = p;
		api?.setP(v);
	});
</script>

<Scene3D
	{setup}
	height={narrow ? 320 : 400}
	animate
	controls={{ autoRotate: false }}
	camera={{ position: [0, 3.3, 4.4], target: [0, -0.1, 0] }}
	label="A Möbius band with its gold core circle and teal boundary; a bead on the boundary drags its shadow around the core twice"
/>
<Controls>
	<Slider bind:value={p} min={0} max={0.999} step={0.001} label="walk along the boundary" format={(v) => `${Math.round(v * 100)}%`} />
	<Toggle bind:checked={run} label="Walk" />
	<span class="eq"><TeX tex={`\\text{shadow on the core: } ${turns.toFixed(2)} \\text{ turns}`} /></span>
</Controls>

<style>
	.eq {
		color: var(--gold-bright);
		font-size: 0.95rem;
		min-width: 15rem;
	}
</style>
