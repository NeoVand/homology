<script lang="ts">
	// Figure: the cylinder and the Möbius band as line bundles over a circle.
	// Each fibre (a short segment) is a copy of the real line, its midpoint the
	// zero. A section picks one point in every fibre, continuously. Shape the
	// section in the unrolled strip below: on the cylinder it can avoid zero;
	// on the Möbius band the gluing flips the fibre, so it must cross zero.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ShuffleIcon } from '$lib/icons';
	import { glassMesh, glowPoint, glowTube } from '$lib/three/materials';
	import { surfaceGeometry, type SurfaceFn } from '$lib/three/surfaces';
	import type * as THREE_NS from 'three';
	import { sectionValue, sectionZeros } from './geometry';
	import { svgPoint } from '../sheaves/svgutil';

	type Kind = 'cylinder' | 'mobius';
	let kind = $state<Kind>('mobius');
	let vals = $state([0.55, 0.7, 0.45, 0.6, 0.75, 0.5]);
	const twisted = $derived(kind === 'mobius');
	const zeros = $derived(sectionZeros(vals, twisted));

	const TAU = Math.PI * 2;
	const R = 1.55;
	const W = 0.55;

	// a point of the band over angle θ (any real θ) at fibre coordinate t ∈ [−1, 1]
	function point(k: Kind, th: number, t: number): [number, number, number] {
		const rx = Math.cos(th);
		const rz = Math.sin(th);
		if (k === 'cylinder') return [R * rx, t * W, R * rz];
		const c = Math.cos(th / 2);
		const s = Math.sin(th / 2);
		// fibre direction turns half a turn: up at θ = 0, down at θ = 2π
		return [(R + t * W * s) * rx, t * W * c, (R + t * W * s) * rz];
	}

	let api: { update(): void } | null = null;
	function setup({ scene, THREE, invalidate }: SceneContext) {
		const group = new THREE.Group();
		scene.add(group);
		const dyn = new THREE.Group();
		scene.add(dyn);
		let builtKind: Kind | null = null;

		function clear(g: THREE_NS.Group) {
			for (const c of [...g.children]) {
				g.remove(c);
				c.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					m.geometry?.dispose();
					(m.material as THREE_NS.Material | undefined)?.dispose?.();
				});
			}
		}
		function buildBand() {
			clear(group);
			const fn: SurfaceFn = (u, v, t) => t.set(...point(kind, TAU * u, 2 * v - 1));
			group.add(glassMesh(surfaceGeometry(fn, 200, 10), { opacity: 0.42, grid: [36, 4], gridStrength: 0.18, tint: 'blue', tintMix: 0.3 }));
			// the zero section (the core circle)
			const core = Array.from({ length: 160 }, (_, i) => new THREE.Vector3(...point(kind, (TAU * i) / 160, 0)));
			group.add(glowTube(new THREE.CatmullRomCurve3(core, true), { color: 'ivory', radius: 0.008, closed: true, intensity: 0.45, halo: false }));
			// fibres
			for (let i = 0; i < 36; i++) {
				const th = (TAU * i) / 36;
				const a = new THREE.Vector3(...point(kind, th, -1));
				const b = new THREE.Vector3(...point(kind, th, 1));
				group.add(glowTube(new THREE.LineCurve3(a, b), { color: 'blue', radius: 0.007, segments: 1, intensity: 0.75, halo: false }));
			}
			builtKind = kind;
		}
		function update() {
			if (builtKind !== kind) buildBand();
			clear(dyn);
			const n = 240;
			const pts = Array.from({ length: n }, (_, i) => {
				const th = (TAU * i) / n;
				return new THREE.Vector3(...point(kind, th, sectionValue(vals, kind === 'mobius', th)));
			});
			dyn.add(glowTube(new THREE.CatmullRomCurve3(pts, true), { color: 'gold', radius: 0.026, closed: true, segments: 300 }));
			for (const z of sectionZeros(vals, kind === 'mobius')) dyn.add(glowPoint(point(kind, z, 0), { color: 'rose', size: 0.065, halo: 10 }));
			invalidate();
		}
		api = { update };
		update();
		return {
			dispose() {
				api = null;
			}
		};
	}
	$effect(() => {
		void kind;
		void vals.map((v) => v);
		api?.update();
	});

	// the unrolled strip
	const SX0 = 70;
	const SX1 = 590;
	const SY0 = 60; // t = +1
	const SY1 = 220; // t = −1
	const sx = (th: number) => SX0 + ((SX1 - SX0) * th) / TAU;
	const sy = (t: number) => SY0 + ((SY1 - SY0) * (1 - t)) / 2;
	const curve = $derived.by(() => {
		let d = '';
		for (let i = 0; i <= 240; i++) {
			const th = (TAU * i) / 240;
			d += `${i ? 'L' : 'M'}${sx(th).toFixed(1)} ${sy(sectionValue(vals, twisted, th)).toFixed(1)}`;
		}
		return d;
	});
	let svgEl = $state<SVGSVGElement>();
	let dragI = -1;
	function down(i: number, e: PointerEvent) {
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		dragI = i;
	}
	function move(e: PointerEvent) {
		if (dragI < 0 || !svgEl) return;
		const p = svgPoint(svgEl, e);
		const t = Math.max(-1, Math.min(1, 1 - (2 * (p.y - SY0)) / (SY1 - SY0)));
		vals[dragI] = +t.toFixed(3);
	}
	function up() {
		dragI = -1;
	}
</script>

<Scene3D
	{setup}
	height={380}
	camera={{ position: [0.4, 2.7, 4.3], target: [0, -0.1, 0], fov: 40 }}
	controls={{ autoRotate: false }}
	label="A band around a circle made of short line segments (fibres): a cylinder, or a Möbius band whose fibres turn half a turn. A golden curve picks one point in each fibre; red dots mark where it crosses the middle (zero)."
/>

<div class="strip">
	<Svg bind:svg={svgEl} viewBox="0 0 660 270" maxHeight={300} label="The band cut open along one fibre and laid flat, with the section drawn as a curve through draggable points." onpointermove={move} onpointerup={up} onpointerleave={up}>
		<rect x={SX0} y={SY0} width={SX1 - SX0} height={SY1 - SY0} fill="rgba(116,169,255,0.07)" stroke="rgba(116,169,255,0.35)" />
		<line x1={SX0} y1={sy(0)} x2={SX1} y2={sy(0)} stroke="rgba(251,246,232,0.45)" stroke-dasharray="5 5" />
		<!-- gluing arrows on the two cut edges -->
		<line x1={SX0 - 14} y1={SY1 - 6} x2={SX0 - 14} y2={SY0 + 8} stroke="var(--violet)" stroke-width="2.4" marker-end="url(#arrow-violet)" />
		{#if twisted}
			<line x1={SX1 + 14} y1={SY0 + 6} x2={SX1 + 14} y2={SY1 - 8} stroke="var(--violet)" stroke-width="2.4" marker-end="url(#arrow-violet)" />
		{:else}
			<line x1={SX1 + 14} y1={SY1 - 6} x2={SX1 + 14} y2={SY0 + 8} stroke="var(--violet)" stroke-width="2.4" marker-end="url(#arrow-violet)" />
		{/if}
		<SvgTeX x={SX0 - 40} y={sy(0)} tex={'0'} size={14} color="var(--ink-dim)" w={20} />
		<SvgTeX x={sx(0)} y={SY1 + 22} tex={'\\theta = 0'} size={14} color="var(--ink-dim)" w={60} />
		<SvgTeX x={sx(TAU)} y={SY1 + 22} tex={'\\theta = 2\\pi'} size={14} color="var(--ink-dim)" w={70} />
		<text x={(SX0 + SX1) / 2} y={SY1 + 44} text-anchor="middle" class="t-ui">
			{twisted ? 'THE RIGHT EDGE IS GLUED TO THE LEFT EDGE UPSIDE DOWN' : 'THE RIGHT EDGE IS GLUED TO THE LEFT EDGE AS IT IS'}
		</text>
		{#if twisted}
			<!-- where the curve must arrive: the left starting value, flipped -->
			<circle cx={SX1} cy={sy(-vals[0])} r="7" fill="none" stroke="var(--violet)" stroke-width="2" stroke-dasharray="3 2" />
		{/if}
		<path d={curve} stroke="var(--gold-bright)" stroke-width="3" fill="none" filter="url(#glow)" />
		{#each zeros as z, k (k)}
			<circle cx={sx(z)} cy={sy(0)} r="7" fill="var(--rose)" stroke="#fff" stroke-width="1" />
		{/each}
		{#each vals as v, i (i)}
			<circle cx={sx((TAU * i) / vals.length)} cy={sy(v)} r="18" fill="transparent" class="hit" role="button" tabindex="-1" aria-label="Drag this point of the section" onpointerdown={(e) => down(i, e)} />
			<circle cx={sx((TAU * i) / vals.length)} cy={sy(v)} r="8" fill="url(#vertex-fill)" stroke="#fff6dc" stroke-width="1.2" pointer-events="none" />
		{/each}
	</Svg>
</div>

<div class="readout ui" aria-live="polite">
	{#if zeros.length === 0}
		<span class="ok">No zeros: a section that never vanishes. The cylinder is a trivial bundle.</span>
	{:else}
		<span class={twisted ? 'bad' : 'meh'}
			>{zeros.length} zero{zeros.length === 1 ? '' : 's'}{twisted ? ' — always an odd number on the Möbius band, so never none.' : '. Lift the curve and they disappear.'}</span
		>
	{/if}
</div>

<Controls>
	<Segmented
		bind:value={kind}
		options={[
			{ value: 'cylinder', label: 'Cylinder' },
			{ value: 'mobius', label: 'Möbius band' }
		]}
		label="Line bundle"
	/>
	<Button onclick={() => (vals = [0.6, 0.6, 0.6, 0.6, 0.6, 0.6])}>Keep it positive</Button>
	<Button icon={ShuffleIcon} onclick={() => (vals = vals.map(() => +(Math.random() * 2 - 1).toFixed(2)))}>Random</Button>
	<span class="hint ui">Drag the gold points in the strip</span>
</Controls>

<style>
	.strip {
		padding: 0.3rem 0.6rem 0;
		border-top: 1px solid var(--line-faint);
	}
	.hit {
		cursor: ns-resize;
		touch-action: none;
	}
	.readout {
		padding: 0.2rem 1.2rem 0.6rem;
		font-size: 0.86rem;
	}
	.ok {
		color: var(--green);
	}
	.bad {
		color: var(--rose);
	}
	.meh {
		color: var(--amber);
	}
	.hint {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}
</style>
