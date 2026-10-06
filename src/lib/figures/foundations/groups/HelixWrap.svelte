<script lang="ts">
	// The homomorphism ℤ → ℤ/n, m ↦ m mod n, drawn as the number line coiled
	// into a helix with n integers per turn. Looking straight down, every
	// integer lands on a dial with n positions. The kernel nℤ — everything that
	// lands on 0 — lines up in one glowing gold column.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import { glowTube, glowPoint, disposeTree } from '$lib/three/materials';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type * as THREE_NS from 'three';
	import { mod, fmtInt } from './zn';
	import { FnCurve } from './fncurve';
	import { fitToWidth } from './fit';

	let n = $state(4);
	let a = $state(1);
	let api: { set(n: number, a: number): void } | null = null;

	$effect(() => {
		if (a > n - 1) a = n - 1;
	});

	function setup(ctx: SceneContext) {
		const { THREE, scene, invalidate, label } = ctx;
		let group: THREE_NS.Group = new THREE.Group();
		scene.add(group);
		let labels: LabelHandle[] = [];

		const R = 1.45;
		const H = 4.1; // height of the coiled part
		const yTop = 2.5;

		function build(n: number, a: number) {
			scene.remove(group);
			disposeTree(group);
			for (const l of labels) l.remove();
			labels = [];
			group = new THREE.Group();
			scene.add(group);

			const turnsEachSide = n <= 3 ? 3 : 2;
			const N = turnsEachSide * n; // integers −N … N
			const h = H / (2 * N);
			const yMid = yTop - H / 2;
			const pos = (t: number) =>
				new THREE.Vector3(R * Math.sin((2 * Math.PI * t) / n), yMid + t * h, R * Math.cos((2 * Math.PI * t) / n));

			const helix = new FnCurve((u, target) => target.copy(pos(-N - 0.7 + u * (2 * N + 1.4))));
			group.add(glowTube(helix, { color: 'blue', radius: 0.011, segments: 90 * turnsEachSide * 2, intensity: 0.6, haloScale: 2.6 }));

			// the dial ℤ/n below
			const yDial = yMid - H / 2 - 1.5;
			const dial = (r: number, rad = R) =>
				new THREE.Vector3(rad * Math.sin((2 * Math.PI * r) / n), yDial, rad * Math.cos((2 * Math.PI * r) / n));
			const ring = new FnCurve((u, target) => target.copy(dial(u * n)));
			group.add(glowTube(ring, { color: 'violet', radius: 0.014, closed: true, segments: 160, intensity: 0.8 }));

			for (let m = -N; m <= N; m++) {
				const r = mod(m, n);
				const kernel = r === 0;
				const fibre = r === a && a !== 0;
				const color = kernel ? 'gold' : fibre ? 'teal' : 'ivory';
				const size = kernel ? 0.075 : fibre ? 0.062 : 0.036;
				group.add(glowPoint(pos(m), { color, size, halo: kernel ? 10 : fibre ? 8 : 5 }));
				if (kernel) {
					const p = pos(m);
					labels.push(label([p.x - 0.44, p.y + 0.03, p.z], fmtInt(m), { className: 'gold small' }));
				}
			}
			for (let r = 0; r < n; r++) {
				const kernel = r === 0;
				const fibre = r === a && a !== 0;
				group.add(glowPoint(dial(r), { color: kernel ? 'gold' : fibre ? 'teal' : 'violet', size: kernel || fibre ? 0.085 : 0.06, halo: 9 }));
				labels.push(label(dial(r, R + 0.38), String(r), { className: kernel ? 'gold' : fibre ? 'teal' : 'violet' }));
			}

			// vertical guides: the kernel column over 0 and the column over a
			const guide = (r: number, col: number) => {
				const top = pos(N - mod(N - r, n));
				const bottom = dial(r);
				const geo = new THREE.BufferGeometry().setFromPoints([top, bottom]);
				const line = new THREE.Line(
					geo,
					new THREE.LineDashedMaterial({ color: col, dashSize: 0.09, gapSize: 0.07, transparent: true, opacity: 0.55 })
				);
				line.computeLineDistances();
				group.add(line);
			};
			guide(0, 0xf2d08f);
			if (a !== 0) guide(a, 0x5fd6cf);
			invalidate();
		}

		build(n, a);
		api = { set: build };
		const unfit = fitToWidth(ctx, 1.0);
		return {
			dispose() {
				unfit();
				api = null;
			}
		};
	}

	$effect(() => {
		const nn = n;
		const aa = a;
		api?.set(nn, aa);
	});

	const kernelTeX = $derived(`\\ker\\varphi = ${n}\\mathbb{Z} = \\{\\dots, ${-2 * n}, ${-n}, 0, ${n}, ${2 * n}, \\dots\\}`);
	const fibreTeX = $derived(
		a === 0
			? ''
			: `\\varphi^{-1}(${a}) = \\{\\dots, ${a - 2 * n}, ${a - n}, ${a}, ${a + n}, ${a + 2 * n}, \\dots\\}`
	);
</script>

<Scene3D
	{setup}
	height={480}
	controls={{ autoRotate: true, autoRotateSpeed: 0.45 }}
	camera={{ position: [3.4, 1.6, 9.4], target: [0, -0.3, 0] }}
	label="The integers placed on a helix with n integers per turn; below it a dial with n positions. The multiples of n line up above position 0."
/>
<div class="read ui">
	<div><TeX tex={`\\varphi\\colon \\mathbb{Z} \\to \\mathbb{Z}/${n}, \\quad m \\mapsto m \\bmod ${n}`} /></div>
	<div class="k"><TeX tex={kernelTeX} /></div>
	{#if a !== 0}
		<div class="f"><TeX tex={fibreTeX} /></div>
	{/if}
</div>
<Controls>
	<Stepper bind:value={n} min={2} max={8} label="n (integers per turn)" />
	<Stepper bind:value={a} min={0} max={n - 1} label="highlight what lands on a" />
</Controls>

<style>
	.read {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 1rem 0.8rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-align: center;
	}
	.k {
		color: var(--gold-bright);
	}
	.f {
		color: var(--teal);
	}
</style>
