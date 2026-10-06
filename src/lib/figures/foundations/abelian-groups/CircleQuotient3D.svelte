<script lang="ts">
	// ℝ/ℤ is a circle. The real line coils into a spring of circumference 1 and
	// then flattens: every coset t₀ + ℤ (gold beads) ends up as ONE point, and the
	// subgroup ℤ itself (teal beads) becomes the point 0.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import { glowTube, glowPoint, disposeTree } from '$lib/three/materials';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type * as THREE_NS from 'three';
	import { FnCurve } from '../groups/fncurve';
	import { fitToWidth } from '../groups/fit';

	let wrap = $state(0);
	let t0 = $state(0.3);
	let api: { set(w: number, t0: number): void } | null = null;

	const T = 2.5; // show t ∈ [−T, T]
	const R = 1.45; // radius of the final circle
	const P = 0.6; // rise per unit of t when coiled

	const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

	/** position of the real number t when the wrapping is w ∈ [0, 1] */
	function place(t: number, w: number, out: THREE_NS.Vector3) {
		const a = ease(Math.min(1, w / 0.55));
		const b = ease(Math.max(0, (w - 0.55) / 0.45));
		const kappa = a / R;
		const lambda = 1.5 + (2 * Math.PI * R - 1.5) * a; // world length of one unit of t
		const s = t * lambda;
		const rise = t * P * a * (1 - b);
		if (kappa < 1e-5) return out.set(s, rise, 0);
		return out.set(Math.sin(kappa * s) / kappa, rise, (1 - Math.cos(kappa * s)) / kappa);
	}

	function setup(ctx: SceneContext) {
		const { THREE, scene, invalidate, label } = ctx;
		let tube: THREE_NS.Group | null = null;
		const gold: THREE_NS.Group[] = [];
		const teal: THREE_NS.Group[] = [];
		const ks = [-2, -1, 0, 1, 2];
		for (const k of ks) {
			const g = glowPoint([0, 0, 0], { color: 'gold', size: 0.07, halo: 10 });
			const c = glowPoint([0, 0, 0], { color: 'teal', size: 0.055, halo: 8 });
			scene.add(g, c);
			gold.push(g);
			teal.push(c);
		}
		const lblInts: LabelHandle[] = ks.map((k) => label([0, 0, 0], k < 0 ? '−' + Math.abs(k) : String(k), { className: 'teal small' }));
		const lblZero = label([0, 0, 0], '0 + ℤ', { className: 'teal small' });
		const lblCoset = label([0, 0, 0], '', { className: 'gold small' });
		const tmp = new THREE.Vector3();

		function set(w: number, t0: number) {
			if (tube) {
				scene.remove(tube);
				disposeTree(tube);
			}
			const curve = new FnCurve((u, target) => place(-T + 2 * T * u, w, target));
			tube = glowTube(curve, { color: 'violet', radius: 0.016, segments: 700, intensity: 0.8, haloScale: 2.8 });
			scene.add(tube);
			ks.forEach((k, i) => {
				place(t0 + k, w, gold[i].position);
				place(k, w, teal[i].position);
				place(k, w, tmp);
				lblInts[i].position.set(tmp.x, tmp.y - 0.28, tmp.z);
				lblInts[i].show(w < 0.6);
			});
			place(0, w, tmp);
			lblZero.position.set(tmp.x, tmp.y - 0.3, tmp.z + 0.25);
			lblZero.show(w > 0.85);
			place(t0, w, tmp);
			lblCoset.position.set(tmp.x + 0.15, tmp.y + 0.3, tmp.z);
			lblCoset.set(`${t0.toFixed(2)} + ℤ`);
			lblCoset.show(w > 0.85);
			invalidate();
		}
		set(wrap, t0);
		api = { set };
		const unfit = fitToWidth(ctx, 1.3);
		return {
			dispose() {
				unfit();
				api = null;
			}
		};
	}

	$effect(() => {
		const w = wrap;
		const s = t0;
		api?.set(w, s);
	});

	const listTeX = $derived(
		`${t0.toFixed(2)} + \\mathbb{Z} = \\{\\dots, ${(t0 - 2).toFixed(2)}, ${(t0 - 1).toFixed(2)}, ${t0.toFixed(2)}, ${(t0 + 1).toFixed(2)}, ${(t0 + 2).toFixed(2)}, \\dots\\}`
	);
</script>

<Scene3D
	{setup}
	height={430}
	controls={{ autoRotate: false }}
	camera={{ position: [0.5, 3.6, 8.4], target: [0, -0.1, 1.1] }}
	label="The real line coils into a helix and flattens into a circle; the points t0 + k for every integer k end up at a single point of the circle."
/>
<div class="read ui">
	<div class="g"><TeX tex={listTeX} /></div>
	<div class="dim">
		{#if wrap > 0.97}
			Every gold bead now sits at the same point: the whole coset has become <em>one</em> point of the circle
			<TeX tex={'\\mathbb{R}/\\mathbb{Z}'} />.
		{:else if wrap < 0.03}
			The real line, with the integers in teal and one coset in gold. Press play, or scrub.
		{:else}
			Coiling: one unit of length becomes one full turn…
		{/if}
	</div>
</div>
<Controls>
	<Timeline bind:value={wrap} from="line" to="circle" duration={3.2} label="Wrapping the line around the circle" />
	<Slider bind:value={t0} min={0} max={0.99} step={0.01} label="the coset t₀ + ℤ" format={(v) => v.toFixed(2)} />
</Controls>

<style>
	.read {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.1rem 1rem 0.8rem;
		text-align: center;
		font-size: 0.86rem;
	}
	.g {
		color: var(--gold-bright);
	}
	.dim {
		color: var(--ink-dim);
		min-height: 2.6em;
	}
</style>
