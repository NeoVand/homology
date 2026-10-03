<script lang="ts">
	// A homotopy moves a loop across a torus; the loop sweeps out a band (the
	// "prism"), whose boundary is exactly the final loop minus the initial loop.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowTube, glowPoint, iridescent, disposeTree } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type * as THREE_NS from 'three';
	import { onMount } from 'svelte';
	import { fitCamera, isNarrow } from './three-fit';

	let t = $state(0.62);
	let playing = $state(false);
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { setT(v: number): void } | null = null;

	const U0 = 0.07;
	const DU = 0.36;
	/** the homotopy H(θ, s): a meridian loop that slides and ripples on its way */
	const uOf = (th: number, s: number) => U0 + DU * s + 0.05 * Math.sin(2 * Math.PI * 2 * th) * Math.sin(Math.PI * s);

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion } = ctx;
		const unfit = fitCamera(ctx, 1.7);
		const f = torus(1.6, 0.62);
		scene.add(glassMesh(surfaceGeometry(f, 160, 64), { opacity: 0.55, grid: [48, 20], gridStrength: 0.22 }));

		// the swept band, as a parametric patch over (s, θ) ∈ [0, t] × [0, 1]
		const NS = 40;
		const NT = 160;
		const pos = new Float32Array((NS + 1) * (NT + 1) * 3);
		const uv = new Float32Array((NS + 1) * (NT + 1) * 2);
		const idx: number[] = [];
		for (let i = 0; i < NS; i++)
			for (let j = 0; j < NT; j++) {
				const a = i * (NT + 1) + j;
				const b = a + NT + 1;
				idx.push(a, b, a + 1, b, b + 1, a + 1);
			}
		const bandGeo = new THREE.BufferGeometry();
		bandGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		bandGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		bandGeo.setIndex(idx);
		const bandMat = iridescent({ opacity: 0.62, tint: 'violet', tintMix: 0.72, grid: [8, 24], gridStrength: 0.35, gridColor: 'violet', depthWrite: false });
		const band = new THREE.Mesh(bandGeo, bandMat);
		band.renderOrder = 3;
		scene.add(band);
		const tmp = new THREE.Vector3();
		const nrm = new THREE.Vector3();
		function fillBand(T: number) {
			let k = 0;
			let q = 0;
			for (let i = 0; i <= NS; i++) {
				const s = (T * i) / NS;
				for (let j = 0; j <= NT; j++) {
					const th = j / NT;
					const u = ((uOf(th, s) % 1) + 1) % 1;
					f(u, th, tmp);
					surfaceNormal(f, u, th, nrm);
					tmp.addScaledVector(nrm, 0.006);
					pos[k++] = tmp.x;
					pos[k++] = tmp.y;
					pos[k++] = tmp.z;
					uv[q++] = i / NS;
					uv[q++] = th;
				}
			}
			bandGeo.attributes.position.needsUpdate = true;
			bandGeo.attributes.uv.needsUpdate = true;
			bandGeo.computeVertexNormals();
			bandGeo.computeBoundingSphere();
			band.visible = T > 0.002;
		}

		const loopAt = (s: number) => new SurfaceCurve(f, (th) => [uOf(th, s), th], 0.014);
		const start = glowTube(loopAt(0), { color: 'gold', closed: true, radius: 0.026 });
		const finish = glowTube(loopAt(1), { color: 'teal', closed: true, radius: 0.02, intensity: 0.55 });
		scene.add(start, finish);
		let moving: THREE_NS.Object3D | null = null;
		const bead = glowPoint([0, 0, 0], { color: 'violet', size: 0.05 });
		scene.add(bead);

		const p = new THREE.Vector3();
		f(U0, 0.25, p);
		label(p.clone().multiplyScalar(1.12).add(new THREE.Vector3(-0.25, 0.25, 0)), tex('f_\\#(z)'), { className: 'gold' });
		f(U0 + DU, 0.25, p);
		const endLabel = label(p.clone().multiplyScalar(1.12).add(new THREE.Vector3(0.2, 0.25, 0)), tex('g_\\#(z)'), { className: 'teal' });
		const bandLabel = label([0, 0, 0], tex('P(z)'), { className: 'violet' });

		function setT(v: number) {
			fillBand(v);
			if (moving) {
				scene.remove(moving);
				disposeTree(moving);
			}
			moving = glowTube(loopAt(v), { color: v > 0.995 ? 'teal' : 'violet', closed: true, radius: 0.022 });
			scene.add(moving);
			// bead: where the point at θ = 0.25 of the loop is now
			f(((uOf(0.25, v) % 1) + 1) % 1, 0.25, p);
			bead.position.copy(p).multiplyScalar(1.02);
			// label the band at its middle
			const sm = v / 2;
			f(((uOf(0.12, sm) % 1) + 1) % 1, 0.12, p);
			bandLabel.position.copy(p).multiplyScalar(1.1);
			bandLabel.show(v > 0.18);
			endLabel.show(true);
			invalidate();
		}
		setT(t);
		api = { setT };

		// the "Sweep again" button plays the homotopy once (instantly if motion is reduced)
		let clock = 0;
		const stop = onFrame((_time, dt) => {
			if (!playing) return;
			clock += reducedMotion ? 10 : dt;
			const s = Math.min(1, clock / 3.2);
			t = s < 0.5 ? 2 * s * s : 1 - Math.pow(-2 * s + 2, 2) / 2;
			if (s >= 1) {
				playing = false;
				clock = 0;
			}
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
		const v = t;
		api?.setT(v);
	});

	function play() {
		t = 0;
		playing = true;
	}
</script>

<Scene3D
	{setup}
	height={narrow ? 330 : 420}
	animate
	controls={{ autoRotate: false }}
	camera={{ position: [0.6, 3.1, 5.6], target: [0, -0.1, 0.4] }}
	label="A loop on a torus slides along a homotopy and sweeps out a violet band whose boundary is the final loop minus the initial loop"
/>
<Controls>
	<Slider bind:value={t} min={0} max={1} step={0.005} label="time s of the homotopy" format={(v) => v.toFixed(2)} />
	<Button variant="gold" onclick={play}>Sweep again</Button>
	<span class="eq"><TeX tex={String.raw`\partial\,P(z) = g_\#(z) - f_\#(z)`} /></span>
</Controls>

<style>
	.eq {
		color: var(--ink-bright);
		font-size: 0.98rem;
	}
</style>
