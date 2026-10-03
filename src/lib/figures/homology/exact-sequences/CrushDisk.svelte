<script lang="ts">
	// Crush the boundary circle of a disk to a single point: the disk curls up into
	// a sphere. The whole disk, a relative 2-cycle of (D², S¹), becomes the
	// fundamental 2-cycle of S² = D²/S¹.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { iridescent, glowTube, glowPoint, disposeTree } from '$lib/three/materials';
	import { tex } from '$lib/katex/render';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { fitCamera, isNarrow } from '../invariance/three-fit';
	import { FnCurve } from '../invariance/curves';
	import type * as THREE_NS from 'three';

	let t = $state(0.55);
	let playing = $state(false);
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { setT(v: number): void } | null = null;

	const L = 1.9; // radius of the flat disk = arc length from centre to rim
	const NR = 40;
	const NT = 160;

	/**
	 * Where the point at radius r ∈ [0,1], angle θ of the disk goes when the crush
	 * parameter is s: the disk is wrapped onto a spherical cap of angular radius πs
	 * (keeping distances from the centre), centred vertically and gently enlarged.
	 * At s = 1 the cap is the whole sphere and the rim has become the south pole.
	 */
	function morph(r: number, th: number, s: number, out: THREE_NS.Vector3) {
		const a = Math.max(1e-4, Math.PI * s);
		const rho = L / a;
		const phi = r * a;
		const scale = 1 + 1.35 * s * s;
		const y = rho * Math.cos(phi) - (rho * (1 + Math.cos(a))) / 2;
		return out.set(rho * Math.sin(phi) * Math.cos(th) * scale, y * scale, rho * Math.sin(phi) * Math.sin(th) * scale);
	}

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion } = ctx;
		const unfit = fitCamera(ctx, 1.5);

		const pos = new Float32Array((NR + 1) * (NT + 1) * 3);
		const uv = new Float32Array((NR + 1) * (NT + 1) * 2);
		const idx: number[] = [];
		for (let i = 0; i < NR; i++)
			for (let j = 0; j < NT; j++) {
				const a = i * (NT + 1) + j;
				const b = a + NT + 1;
				idx.push(a, b, a + 1, b, b + 1, a + 1);
			}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
		geo.setIndex(idx);
		const back = new THREE.Mesh(geo, iridescent({ opacity: 0.7, grid: [24, 10], gridStrength: 0.25, side: THREE.BackSide, depthWrite: false, brightness: 0.75, tint: 'violet', tintMix: 0.3 }));
		const front = new THREE.Mesh(geo, iridescent({ opacity: 0.7, grid: [24, 10], gridStrength: 0.25, side: THREE.FrontSide, depthWrite: false, tint: 'violet', tintMix: 0.3 }));
		back.renderOrder = 1;
		front.renderOrder = 2;
		scene.add(back, front);

		const tmp = new THREE.Vector3();
		let rim: THREE_NS.Object3D | null = null;
		const pole = glowPoint([0, 0, 0], { color: 'gold', size: 0.08, halo: 10 });
		scene.add(pole);
		const lblDisk = label([0, 0, 0], tex('D^2'), { className: 'violet' });
		const lblRim = label([0, 0, 0], tex('A = S^1'), { className: 'gold' });
		const lblPt = label([0, 0, 0], tex('A/A = \\text{point}'), { className: 'gold small' });
		const lblS2 = label([0, 0, 0], tex('D^2/S^1 \\cong S^2'), { className: 'violet' });

		function setT(s: number) {
			let k = 0;
			let q = 0;
			for (let i = 0; i <= NR; i++) {
				const r = i / NR;
				for (let j = 0; j <= NT; j++) {
					const th = (2 * Math.PI * j) / NT;
					morph(r, th, s, tmp);
					pos[k++] = tmp.x;
					pos[k++] = tmp.y;
					pos[k++] = tmp.z;
					uv[q++] = j / NT;
					uv[q++] = r;
				}
			}
			geo.attributes.position.needsUpdate = true;
			geo.attributes.uv.needsUpdate = true;
			geo.computeVertexNormals();
			geo.computeBoundingSphere();
			if (rim) {
				scene.remove(rim);
				disposeTree(rim);
				rim = null;
			}
			if (s < 0.985) {
				rim = glowTube(new FnCurve((q, out) => morph(1, 2 * Math.PI * q, s, out)), { color: 'gold', closed: true, radius: 0.03 * (1 - 0.6 * s), segments: 160 });
				scene.add(rim);
			}
			morph(1, 0, s, tmp);
			const rimPt = tmp.clone();
			morph(0, 0, s, tmp);
			const top = tmp.clone();
			pole.position.set(0, rimPt.y, 0);
			pole.visible = s > 0.6;
			pole.scale.setScalar(Math.max(0.01, (s - 0.6) / 0.4));
			lblDisk.position.copy(top).add(new THREE.Vector3(0, 0.35, 0));
			lblDisk.show(s < 0.45);
			lblRim.position.copy(rimPt).add(new THREE.Vector3(0.45, -0.1, 0));
			lblRim.show(s < 0.85);
			lblPt.position.set(0.55, rimPt.y - 0.35, 0);
			lblPt.show(s > 0.9);
			lblS2.position.copy(top).add(new THREE.Vector3(0, 0.4, 0));
			lblS2.show(s > 0.9);
			invalidate();
		}
		setT(t);
		api = { setT };

		let clock = 0;
		const stop = onFrame((_time, dt) => {
			if (!playing) return;
			clock += reducedMotion ? 10 : dt;
			const u = Math.min(1, clock / 3);
			t = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
			if (u >= 1) {
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
</script>

<Scene3D
	{setup}
	height={narrow ? 340 : 420}
	animate
	controls={{ autoRotate: false }}
	camera={{ position: [0, 2.4, 6.2], target: [0, 0, 0] }}
	label="A flat disk whose gold boundary circle shrinks to a single point; the disk curls up into a sphere"
/>
<Controls>
	<Slider bind:value={t} min={0} max={1} step={0.005} label="crush the rim" format={(v) => (v > 0.995 ? 'sphere' : v.toFixed(2))} />
	<Button
		variant="gold"
		onclick={() => {
			t = 0;
			playing = true;
		}}>Crush</Button
	>
	<span class="eq"><TeX tex={String.raw`H_2(D^2,S^1)\cong \tilde H_2(D^2/S^1) = \tilde H_2(S^2)\cong\mathbb Z`} /></span>
</Controls>

<style>
	.eq {
		color: var(--ink-bright);
		font-size: 0.95rem;
	}
</style>
