<script lang="ts">
	// Figure 3.1.5 — two loops around a straw. Neither bounds on its own, but
	// together they are the rim of the teal band between them: they are
	// homologous. Slide (and wiggle) the second loop; the band follows.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowTube } from '$lib/three/materials';
	import { cylinder, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { bandMaterial, ease, fitOnNarrow } from './three-extras';
	import type * as THREE_NS from 'three';

	const VA = 0.1;
	const H = 3.4;
	const RAD = 0.78;

	let vB = $state(0.62);
	let wiggle = $state(0.05);
	let auto = $state(true);
	let showBand = $state(true);

	const atTop = $derived(vB > 0.955 && wiggle < 0.001);

	interface Api {
		set(vB: number, wiggle: number, band: boolean, auto: boolean): void;
	}
	let api = $state.raw<Api | null>(null);

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, onFrame, reducedMotion, label } = ctx;
		fitOnNarrow(ctx, 0.75);
		const f = cylinder(RAD, H);
		const geo = surfaceGeometry(f, 120, 40);
		scene.add(glassMesh(geo, { opacity: 0.6, grid: [32, 12], hue: 0.86, film: 0.45, tint: 'violet', tintMix: 0.18 }));

		const band = new THREE.Mesh(geo, bandMaterial('teal', 0.56));
		band.renderOrder = 3;
		scene.add(band);
		const U = (band.material as THREE_NS.ShaderMaterial).uniforms;
		U.uA.value = VA;

		const loopA = glowTube(new SurfaceCurve(f, (t) => [t, VA], 0.02), { color: 'gold', closed: true, radius: 0.03, segments: 160 });
		scene.add(loopA);
		label([RAD + 0.32, (VA - 0.5) * H, 0.25], tex('A'), { className: 'gold' });
		const lblB = label([RAD + 0.32, 0, 0.25], tex('B'), { className: 'gold' });

		// loop B is built at v = 0.5 and moved rigidly along the axis
		const bGroup = new THREE.Group();
		scene.add(bGroup);
		let bTube: THREE_NS.Group | null = null;
		let builtWiggle = -1;
		const buildB = (w: number) => {
			if (Math.abs(w - builtWiggle) < 1e-4 && bTube) return;
			if (bTube) {
				bGroup.remove(bTube);
				bTube.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					m.geometry?.dispose();
					(m.material as THREE_NS.Material | undefined)?.dispose?.();
				});
			}
			bTube = glowTube(new SurfaceCurve(f, (t) => [t, 0.5 + w * Math.sin(2 * Math.PI * 3 * t)], 0.02), {
				color: 'gold',
				closed: true,
				radius: 0.03,
				segments: 200
			});
			bGroup.add(bTube);
			builtWiggle = w;
		};

		let target = { vB: 0.62, wiggle: 0.05, band: true, auto: true };
		let shown = 0.62;
		let t0 = performance.now();

		const place = (v0: number) => {
			const v = Math.min(v0, 0.997 - target.wiggle);
			bGroup.position.y = (v - 0.5) * H;
			U.uB.value = v;
			lblB.position.set(RAD + 0.32, (v - 0.5) * H, 0.25);
		};

		onFrame(() => {
			if (target.auto && !reducedMotion) {
				const T = 9;
				const x = (((performance.now() - t0) / 1000) % T) / T; // 0..1
				const s = x < 0.5 ? ease(x * 2) : 1 - ease((x - 0.5) * 2);
				shown = VA + 0.03 + s * (0.97 - VA - 0.03);
			} else {
				shown += (target.vB - shown) * (reducedMotion ? 1 : 0.15);
			}
			place(shown);
		});

		api = {
			set(vB, wiggle, bandOn, auto) {
				const wasAuto = target.auto;
				target = { vB, wiggle, band: bandOn, auto };
				if (auto && !wasAuto) t0 = performance.now();
				if (!auto && wasAuto) shown = vB;
				buildB(wiggle);
				U.uAmp.value = wiggle;
				U.uFreq.value = 3;
				U.uOn.value = bandOn ? 1 : 0;
				invalidate();
			}
		};
		api.set(vB, wiggle, showBand, auto);
		return { dispose: () => (api = null) };
	}

	$effect(() => api?.set(vB, wiggle, showBand, auto));
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={440}
		animate
		controls={{ autoRotate: false }}
		camera={{ position: [0, 2.1, 6.4], fov: 38 }}
		label="A transparent straw (an open cylinder) with two gold loops around it, A near the bottom and B higher up, and the band of straw between them shaded teal."
	/>

	<div class="readout ui" aria-live="polite">
		<p>
			{#if atTop}
				<span class="badge teal">ends</span> B is now the top end of the straw. The two <b>ends</b> of a straw are homologous: together they are the rim of
				the whole wall. One hole, seen from two ends.
			{:else}
				<span class="badge gold">A ∼ B</span>
				Neither loop bounds anything on the straw. But together they are the whole rim of the teal band:
				<TeX tex={String.raw`\cyc{A} + \cyc{B} = \bdy{\text{rim of the band}}`} />. So <b>A</b> and <b>B</b> are homologous.
			{/if}
		</p>
	</div>

	<Controls>
		<Slider
			bind:value={vB}
			min={0.14}
			max={0.97}
			step={0.01}
			label="Height of loop B"
			oninput={() => (auto = false)}
			format={(v) => `${Math.round(((v - VA) / (1 - VA)) * 100)}%`}
		/>
		<Slider bind:value={wiggle} min={0} max={0.06} step={0.002} label="Wiggle B" format={(v) => (v === 0 ? 'none' : v.toFixed(3))} />
		<Toggle bind:checked={auto} label="Sweep" />
		<Toggle bind:checked={showBand} label="Shade the band" />
	</Controls>
</div>

<style>
	.readout {
		padding: 0.3rem 1.2rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		min-height: 3.6rem;
	}
	.readout p {
		margin: 0;
		line-height: 1.6;
	}
	.readout b {
		color: var(--gold-bright);
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		margin-right: 0.35rem;
	}
	.badge.teal {
		color: #062320;
		background: var(--teal);
	}
	.badge.gold {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
	}
</style>
