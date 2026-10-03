<script lang="ts">
	// Figure: simplicial maps. Vertices are sent to vertices, and every simplex is
	// carried along (straight lines go to straight lines). Two examples: a hexagon
	// wrapping twice around a triangle, and a triangle collapsing onto an edge.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { ease } from './kit3d';

	type P = [number, number];
	let ex = $state<'wrap' | 'collapse'>('wrap');
	let t = $state(0);
	let reduced = false;
	let raf = 0;
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		return () => cancelAnimationFrame(raf);
	});
	$effect(() => {
		void ex;
		t = 0;
	});
	function play() {
		cancelAnimationFrame(raf);
		if (reduced) {
			t = t > 0.5 ? 0 : 1;
			return;
		}
		const from = t > 0.99 ? 0 : t;
		const to = 1;
		const t0 = performance.now();
		const dur = 1600 * (to - from) + 200;
		const step = (now: number) => {
			const s = Math.min(1, (now - t0) / dur);
			t = from + (to - from) * ease(s);
			if (s < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}

	const colours = ['#f2d08f', '#5fd6cf', '#a493ff'];
	const C: P = [320, 198];
	const polar = (r: number, deg: number): P => [C[0] + r * Math.cos((deg * Math.PI) / 180), C[1] - r * Math.sin((deg * Math.PI) / 180)];
	// target triangle a0, a1, a2
	const tri: P[] = [polar(96, 90), polar(96, -30), polar(96, 210)];
	// the second lap sits slightly outside the first, so you can see it is there twice
	const tri2: P[] = [polar(108, 90), polar(108, -30), polar(108, 210)];
	const hex: P[] = Array.from({ length: 6 }, (_, i) => polar(150, 90 - i * 60));
	const lerp = (a: P, b: P, s: number): P => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];

	// collapse example
	const sq: P[] = [
		[190, 300],
		[450, 300],
		[320, 85]
	];
	const sqImg: P[] = [sq[0], sq[1], sq[1]];

	const s = $derived(t);
	const hexNow = $derived(hex.map((p, i) => lerp(p, (i < 3 ? tri : tri2)[i % 3], s)));
	const colNow = $derived(sq.map((p, i) => lerp(p, sqImg[i], s)));
</script>

<div class="wrap">
	<Svg viewBox="0 0 640 400" maxHeight={400} label="A simplicial map shown as a morph: the source is carried vertex by vertex onto its image">
		{#if ex === 'wrap'}
			<!-- the target: a hollow triangle -->
			<polygon points={tri.map((p) => p.join(',')).join(' ')} class="target" />
			{#each tri as p, i (i)}
				<SvgTeX x={p[0] + (C[0] - p[0]) * 0.36} y={p[1] + (C[1] - p[1]) * 0.36} tex={`w_${i}`} color={colours[i]} size={18} w={40} h={28} />
			{/each}
			<!-- the hexagon, travelling -->
			{#each hexNow as p, i (i)}
				{@const q = hexNow[(i + 1) % 6]}
				<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="src" class:lap2={i >= 3} />
			{/each}
			{#each hexNow as p, i (i)}
				<circle cx={p[0]} cy={p[1]} r="8" fill={colours[i % 3]} class="dot" />
				<SvgTeX x={p[0] + (hex[i][0] - C[0]) * 0.16} y={p[1] + (hex[i][1] - C[1]) * 0.16} tex={`${i}`} color="var(--ink-bright)" size={14} w={24} h={22} />
			{/each}
		{:else}
			<line x1={sq[0][0]} y1={sq[0][1]} x2={sq[1][0]} y2={sq[1][1]} class="target thick" />
			<SvgTeX x={sq[0][0] - 8} y={sq[0][1] + 30} tex="w_0" color={colours[0]} size={18} w={40} h={28} />
			<SvgTeX x={sq[1][0] + 8} y={sq[1][1] + 30} tex="w_1" color={colours[1]} size={18} w={40} h={28} />
			<polygon points={colNow.map((p) => p.join(',')).join(' ')} class="srcfill" />
			{#each colNow as p, i (i)}
				{@const q = colNow[(i + 1) % 3]}
				<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="src" />
			{/each}
			{#each colNow as p, i (i)}
				<circle cx={p[0]} cy={p[1]} r="8" fill={colours[i === 0 ? 0 : 1]} class="dot" />
				<SvgTeX x={p[0] + (i === 2 ? 18 : i === 0 ? -16 : 16)} y={p[1] - 18} tex={`${i}`} color="var(--ink-bright)" size={14} w={24} h={22} />
			{/each}
		{/if}
	</Svg>
	<div class="readout ui">
		{#if ex === 'wrap'}
			<TeX tex={'f(0)=f(3)=\\textcolor{#f2d08f}{w_0},\\quad f(1)=f(4)=\\textcolor{#5fd6cf}{w_1},\\quad f(2)=f(5)=\\textcolor{#a493ff}{w_2}'} />
			<span>Every edge <TeX tex={'[i,\\,i+1]'} /> lands on an edge of the triangle, so the hexagon goes round the triangle twice.</span>
		{:else}
			<TeX tex={'f(0)=\\textcolor{#f2d08f}{w_0},\\quad f(1)=f(2)=\\textcolor{#5fd6cf}{w_1}'} />
			<span>The triangle <TeX tex="[0,1,2]" /> lands on the edge <TeX tex="[w_0,w_1]" />: a simplicial map may squash a simplex flat.</span>
		{/if}
	</div>
</div>
<div class="bar ui">
	<Segmented
		bind:value={ex}
		options={[
			{ value: 'wrap', label: 'Wrap twice' },
			{ value: 'collapse', label: 'Collapse' }
		]}
		label="Example"
	/>
	<div class="sl"><Slider bind:value={t} min={0} max={1} step={0.01} label="Carry the source along the map" format={(v) => `${Math.round(v * 100)}%`} /></div>
	<Button variant="gold" onclick={play}>Play</Button>
</div>

<style>
	.wrap {
		padding: 0.6rem 0.8rem 0;
	}
	.target {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(116, 169, 255, 0.5);
		stroke-width: 7;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.target.thick {
		stroke-width: 9;
	}
	.src {
		stroke: rgba(251, 246, 232, 0.85);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.src.lap2 {
		stroke: rgba(242, 208, 143, 0.9);
		stroke-dasharray: 7 5;
	}
	.srcfill {
		fill: rgba(164, 147, 255, 0.16);
	}
	.dot {
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
	}
	.readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0 1.2rem 0.8rem;
		text-align: center;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.7rem 1rem;
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.sl {
		flex: 1;
		min-width: 12rem;
	}
</style>
