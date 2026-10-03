<script lang="ts">
	// Figure 3.1.4 — loops on a torus. A small loop bounds a disk (teal) and can
	// shrink away; the meridian, the longitude and every (p, q) loop bound
	// nothing: cutting along them leaves the torus in one piece.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowTube, faceMaterial } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { patchGeometry, cutTorusGeometry, ease, fitOnNarrow } from './three-extras';
	import { gcd, unimodularPartner } from './graphs';
	import type * as THREE_NS from 'three';

	type Kind = 'small' | 'meridian' | 'longitude' | 'diag' | 'pq';
	let kind = $state<Kind>('meridian');
	let p = $state(2);
	let q = $state(3);
	let cut = $state(false);

	// the (p, q) actually drawn for each kind: p turns around the hole, q around the tube
	const pq = $derived<[number, number]>(
		kind === 'meridian' ? [0, 1] : kind === 'longitude' ? [1, 0] : kind === 'diag' ? [1, 1] : kind === 'pq' ? [p, q] : [0, 0]
	);
	const g = $derived(gcd(pq[0], pq[1]));
	const degenerate = $derived(kind === 'pq' && p === 0 && q === 0);

	interface Api {
		show(kind: Kind, p: number, q: number, cut: boolean): void;
	}
	let api = $state.raw<Api | null>(null);

	const U0 = 0.14;
	const V0 = 0.25;
	const R = 1.6;
	const r = 0.62;

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, onFrame, reducedMotion } = ctx;
		fitOnNarrow(ctx, 1.55);
		const f = torus(R, r);
		const geo = surfaceGeometry(f, 180, 72);
		const glass = glassMesh(geo, { opacity: 0.8, grid: [48, 16] });
		scene.add(glass);

		// small loop: a family of shrinking loops (built once), plus the disk it bounds
		const du = 0.034;
		const dv = 0.088;
		const FRAMES = 28;
		const small: THREE_NS.Group[] = [];
		for (let k = 0; k < FRAMES; k++) {
			const s = 1 - (k / (FRAMES - 1)) * 0.94;
			const curve = new SurfaceCurve(f, (t) => [U0 + s * du * Math.cos(2 * Math.PI * t), V0 + s * dv * Math.sin(2 * Math.PI * t)], 0.016);
			const tube = glowTube(curve, { color: 'teal', closed: true, radius: 0.026 - 0.008 * (k / FRAMES), segments: 96 });
			tube.visible = false;
			small.push(tube);
			scene.add(tube);
		}
		const disk = new THREE.Mesh(patchGeometry(f, U0, V0, du, dv, 0.009), faceMaterial('teal', 0.5));
		disk.renderOrder = 4;
		scene.add(disk);
		// the "hole" left behind when the disk is lifted off (cut mode)
		const holeMat = new THREE.MeshBasicMaterial({ color: 0x03050b, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide });
		const hole = new THREE.Mesh(patchGeometry(f, U0, V0, du, dv, 0.006), holeMat);
		hole.renderOrder = 3;
		scene.add(hole);
		const lifted = new THREE.Group();
		const liftedDisk = new THREE.Mesh(patchGeometry(f, U0, V0, du, dv, 0.009), faceMaterial('teal', 0.6));
		const liftedRim = glowTube(
			new SurfaceCurve(f, (t) => [U0 + du * Math.cos(2 * Math.PI * t), V0 + dv * Math.sin(2 * Math.PI * t)], 0.016),
			{ color: 'teal', closed: true, radius: 0.022, segments: 96 }
		);
		lifted.add(liftedDisk, liftedRim);
		const nrm = surfaceNormal(f, U0, V0, new THREE.Vector3());
		scene.add(lifted);

		// essential loops, built on demand and cached
		const loops = new Map<string, THREE_NS.Group>();
		const loopFor = (pp: number, qq: number) => {
			const k = `${pp},${qq}`;
			if (!loops.has(k)) {
				const segs = 160 * Math.max(1, Math.abs(pp) + Math.abs(qq));
				const tube = glowTube(new SurfaceCurve(f, (t) => [U0 + pp * t, V0 + qq * t], 0.016), {
					color: 'rose',
					closed: true,
					radius: 0.026,
					segments: segs
				});
				loops.set(k, tube);
				scene.add(tube);
			}
			return loops.get(k)!;
		};
		// cut-open tori, built on demand and cached
		const cuts = new Map<string, THREE_NS.Group>();
		const cutFor = (pp: number, qq: number) => {
			const k = `${pp},${qq}`;
			if (!cuts.has(k)) {
				const [rr, ss] = unimodularPartner(pp, qq);
				const group = new THREE.Group();
				group.add(glassMesh(cutTorusGeometry(f, pp, qq, rr, ss, U0, V0, 0.03), { opacity: 0.82, grid: [24, 12] }));
				for (const b of [0.03, 0.97]) {
					group.add(
						glowTube(new SurfaceCurve(f, (t) => [U0 + pp * t + b * rr, V0 + qq * t + b * ss], 0.012), {
							color: 'rose',
							closed: true,
							radius: 0.02,
							segments: 160 * Math.max(1, Math.abs(pp) + Math.abs(qq))
						})
					);
				}
				cuts.set(k, group);
				scene.add(group);
			}
			return cuts.get(k)!;
		};

		let current: { kind: Kind; p: number; q: number; cut: boolean } = { kind: 'meridian', p: 0, q: 1, cut: false };
		let shrinkStart = 0;
		let lift = 0; // eased lift of the disk in cut mode
		let liftTarget = 0;

		function apply() {
			const { kind, p, q, cut } = current;
			const isSmall = kind === 'small';
			const ok = !isSmall && !(p === 0 && q === 0);
			const coprime = ok && gcd(p, q) === 1;
			for (const t of loops.values()) t.visible = false;
			for (const c of cuts.values()) c.visible = false;
			small.forEach((t) => (t.visible = false));
			disk.visible = isSmall && !cut;
			hole.visible = isSmall && cut;
			lifted.visible = isSmall && cut;
			liftTarget = isSmall && cut ? 1 : 0;
			const showCut = cut && coprime;
			glass.visible = !showCut;
			if (isSmall) {
				small[0].visible = !cut;
				shrinkStart = performance.now();
			} else if (ok) {
				if (showCut) cutFor(p, q).visible = true;
				else loopFor(p, q).visible = true;
			}
			invalidate();
		}

		onFrame(() => {
			// shrinking small loop (loops forever unless motion is reduced)
			if (current.kind === 'small' && !current.cut) {
				small.forEach((t) => (t.visible = false));
				if (reducedMotion) small[0].visible = true;
				else {
					const T = 3.6;
					const x = ((performance.now() - shrinkStart) / 1000) % T;
					const phase = x < 0.5 ? 0 : x < 2.4 ? ease((x - 0.5) / 1.9) : x < 3.0 ? 1 : 1 - ease((x - 3.0) / 0.6);
					small[Math.min(FRAMES - 1, Math.round(phase * (FRAMES - 1)))].visible = true;
				}
			}
			// lift the cut-out disk off the surface
			if (Math.abs(lift - liftTarget) > 1e-3) {
				lift += (liftTarget - lift) * (reducedMotion ? 1 : 0.08);
				lifted.position.copy(nrm).multiplyScalar(0.55 * ease(Math.min(1, Math.max(0, lift))));
			}
		});

		api = {
			show(kind, p, q, cut) {
				current = { kind, p, q, cut };
				apply();
			}
		};
		apply();
		return { dispose: () => (api = null) };
	}

	$effect(() => api?.show(kind, pq[0], pq[1], cut));
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={430}
		animate
		controls={{ autoRotate: true, autoRotateSpeed: 0.35 }}
		camera={{ position: [0, 3.3, 6.0], fov: 38 }}
		label="A see-through torus with one highlighted loop: a small loop on top that shrinks to a point, a meridian around the tube, a longitude around the hole, or a (p, q) loop winding around both. In cut mode the torus is shown cut open along the loop."
	/>

	<div class="readout ui" aria-live="polite">
		{#if kind === 'small'}
			<p>
				<span class="badge teal">bounds</span> This loop is the rim of the teal disk. It can shrink to a point, sweeping across the disk.
				{#if cut}Cutting along it splits the torus into <b>two</b> pieces: the disk lifts right off.{/if}
			</p>
		{:else if degenerate}
			<p>Choose p and q not both zero.</p>
		{:else}
			<p>
				<span class="badge rose">bounds nothing</span>
				{#if kind === 'meridian'}The meridian goes once around the tube.
				{:else if kind === 'longitude'}The longitude goes once around the hole.
				{:else}This loop goes <b>{pq[0]}</b> time{pq[0] === 1 ? '' : 's'} around the hole and <b>{pq[1]}</b> time{pq[1] === 1 ? '' : 's'} around the
					tube{#if kind === 'diag'}: a meridian and a longitude rolled into one{/if}.
				{/if}
				No region of the torus has it as its whole rim.
				{#if cut && g === 1}Cut along it: the torus stays in <b>one</b> piece (a twisted tube) — the cut has two edges, both rose.{/if}
				{#if g > 1}
					Since <TeX tex={String.raw`\gcd(${pq[0]},${pq[1]}) = ${g}`} />, the path runs {g} times around the simpler <TeX
						tex={String.raw`(${pq[0] / g},${pq[1] / g})`}
					/> loop.
				{/if}
			</p>
		{/if}
	</div>

	<Controls>
		<Segmented
			bind:value={kind}
			label="Which loop"
			options={[
				{ value: 'small', label: 'Small loop' },
				{ value: 'meridian', label: 'Around the tube' },
				{ value: 'longitude', label: 'Around the hole' },
				{ value: 'diag', label: 'Both: (1, 1)' },
				{ value: 'pq', label: 'Your own (p, q)' }
			]}
		/>
		<Toggle bind:checked={cut} label="Cut along the loop" />
		{#if kind === 'pq'}
			<div class="sliders">
				<Slider bind:value={p} min={0} max={4} step={1} label="p: around the hole" />
				<Slider bind:value={q} min={0} max={4} step={1} label="q: around the tube" />
			</div>
		{/if}
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
		color: var(--ink-bright);
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
	.badge.rose {
		color: #2a0816;
		background: var(--rose);
	}
	.sliders {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1.4rem;
		width: 100%;
	}
</style>
