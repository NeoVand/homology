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
		const { THREE, scene, camera, invalidate, label, project, onFrame } = ctx;
		let group: THREE_NS.Group = new THREE.Group();
		scene.add(group);
		let labels: LabelHandle[] = [];
		/** the kernel labels, re-placed every frame so they never sit on the coil or the column */
		let tags: { h: LabelHandle; bead: THREE_NS.Vector3; near: THREE_NS.Vector3[]; dir: number }[] = [];

		const R = 1.45;
		const H = 4.1; // height of the coiled part
		const yTop = 2.5;

		function build(n: number, a: number) {
			scene.remove(group);
			disposeTree(group);
			for (const l of labels) l.remove();
			labels = [];
			tags = [];
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
					const bead = pos(m);
					const handle = label(bead.clone(), fmtInt(m), { className: 'gold small' });
					labels.push(handle);
					// what the label must keep clear of: the coil near the bead and the gold column
					const near: THREE_NS.Vector3[] = [];
					const span = Math.max(1.6, 0.8 / h); // every bit of coil within 0.8 above or below
					for (let t = Math.max(-N - 0.7, m - span); t <= Math.min(N + 0.7, m + span); t += 0.05) near.push(pos(t));
					for (let dy = -0.7; dy <= 0.7; dy += 0.05) near.push(new THREE.Vector3(bead.x, bead.y + dy, bead.z));
					tags.push({ h: handle, bead, near, dir: 0 });
				}
			}
			for (let r = 0; r < n; r++) {
				const kernel = r === 0;
				const fibre = r === a && a !== 0;
				group.add(glowPoint(dial(r), { color: kernel ? 'gold' : fibre ? 'teal' : 'violet', size: kernel || fibre ? 0.085 : 0.06, halo: 9 }));
				labels.push(label(dial(r, R + 0.55), String(r), { className: kernel ? 'gold' : fibre ? 'teal' : 'violet' }));
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

		// Each kernel label tries eight spots around its bead (in screen space) and
		// takes the one farthest from the coil and the column. The labels lean
		// towards one shared side (the one with the most room overall), upper left
		// wins ties, and a label only moves when another spot is clearly better.
		const D = 0.36;
		const dirs = [135, 45, 180, 0, 225, 315, 90, 270].map((deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)]);
		const right = new THREE.Vector3();
		const up = new THREE.Vector3();
		const cand = new THREE.Vector3();
		const clearance = (c: { x: number; y: number }, near: THREE_NS.Vector3[]) => {
			let best = Infinity;
			for (const q of near) {
				const p = project(q);
				best = Math.min(best, Math.hypot(p.x - c.x, p.y - c.y));
			}
			return best;
		};
		const stopTags = onFrame(() => {
			camera.updateMatrixWorld();
			right.setFromMatrixColumn(camera.matrixWorld, 0);
			up.setFromMatrixColumn(camera.matrixWorld, 1);
			const room = tags.map((tag) =>
				dirs.map(([cx, cy]) => {
					cand.copy(tag.bead).addScaledVector(right, cx * D).addScaledVector(up, cy * D);
					return clearance(project(cand), tag.near);
				})
			);
			const total = dirs.map((_, i) => room.reduce((sum, r) => sum + Math.min(r[i], 14), 0) - i * 0.4);
			const shared = total.indexOf(Math.max(...total));
			tags.forEach((tag, k) => {
				const score = room[k].map((c, i) => Math.min(c, 14) - i * 0.4 + (i === shared ? 5 : 0) + (i === tag.dir ? 3 : 0));
				tag.dir = score.indexOf(Math.max(...score));
				const [cx, cy] = dirs[tag.dir];
				tag.h.position.copy(tag.bead).addScaledVector(right, cx * D).addScaledVector(up, cy * D);
			});
			(window as unknown as { __hw: unknown }).__hw = { room, total, shared, dirs: tags.map((t) => t.dir), labels: tags.map((t) => t.h.el.textContent) };
			return false;
		});

		build(n, a);
		api = { set: build };
		const unfit = fitToWidth(ctx, 1.0);
		return {
			dispose() {
				stopTags();
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
	<Stepper bind:value={n} min={2} max={8} label="n, integers per turn">
		{#snippet labelSnippet()}<TeX tex="n" /> <span class="long">(integers per turn)</span>{/snippet}
	</Stepper>
	<Stepper bind:value={a} min={0} max={n - 1} label="highlight what lands on a">
		{#snippet labelSnippet()}<span class="long">highlight what lands on</span> <TeX tex="a" />{/snippet}
	</Stepper>
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
	@container figure (max-width: 30rem) {
		.long {
			display: none;
		}
	}
</style>
