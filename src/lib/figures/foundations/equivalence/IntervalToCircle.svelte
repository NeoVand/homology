<script lang="ts">
	// Gluing preview: bend the interval [0,1] until its endpoints meet.
	// Declaring 0 ∼ 1 (and nothing else) turns the interval into a circle.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { prefersReducedMotion } from 'svelte/motion';
	import { onDestroy } from 'svelte';

	let g = $state(0);
	let playing = $state(false);
	let raf = 0;

	const W = 600;
	const H = 300;
	const cx = 300;
	const cy = 246;

	/** point of the bent interval at parameter s ∈ [0, 1] */
	function pt(s: number, gg: number): [number, number] {
		const L = 430 * (1 + 0.45 * gg);
		const a = 2 * Math.PI * gg;
		if (a < 1e-4) return [cx + (s - 0.5) * L, cy];
		const R = L / a;
		const th = (s - 0.5) * a;
		return [cx + R * Math.sin(th), cy - R * (1 - Math.cos(th))];
	}
	function normal(s: number, gg: number): [number, number] {
		// outward normal (pointing away from the centre of the bend; "down" when straight)
		const a = 2 * Math.PI * gg;
		const th = (s - 0.5) * a;
		return [Math.sin(th), Math.cos(th)];
	}

	const path = $derived.by(() => {
		const pts: string[] = [];
		for (let i = 0; i <= 160; i++) {
			const [x, y] = pt(i / 160, g);
			pts.push(`${i ? 'L' : 'M'} ${x.toFixed(2)} ${y.toFixed(2)}`);
		}
		return pts.join(' ');
	});
	const glued = $derived(g > 0.995);
	const ticks = [0.25, 0.5, 0.75];
	const tickTeX = ['\\tfrac14', '\\tfrac12', '\\tfrac34'];

	function stop() {
		playing = false;
		if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf);
		raf = 0;
	}
	function play() {
		if (playing) return stop();
		if (prefersReducedMotion.current) {
			g = g > 0.995 ? 0 : 1;
			return;
		}
		const from = g;
		const to = g > 0.995 ? 0 : 1;
		const t0 = performance.now();
		const dur = 1800 * Math.abs(to - from) + 200;
		playing = true;
		const step = (now: number) => {
			const f = Math.min(1, (now - t0) / dur);
			const e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
			g = from + (to - from) * e;
			if (f < 1) raf = requestAnimationFrame(step);
			else playing = false;
		};
		raf = requestAnimationFrame(step);
	}
	onDestroy(stop);

	const end0 = $derived(pt(0, g));
	const end1 = $derived(pt(1, g));
	const n0 = $derived(normal(0, g));
	const n1 = $derived(normal(1, g));

	const readout = $derived(
		glued
			? String.raw`Glued. The classes are \(\{0,1\}\) and \(\{x\}\) for each \(0<x<1\). The quotient \([0,1]/(0\sim1)\) is a circle.`
			: g < 0.01
				? String.raw`The interval \([0,1]\). Every point is alone in its class: \(0\) and \(1\) are different points.`
				: String.raw`Bending is not gluing: until the ends meet, \(0\) and \(1\) are still different points.`
	);
</script>

<div class="ic">
	<Svg viewBox="0 0 {W} {H}" maxHeight={340} label="The interval from 0 to 1 bends until its two ends meet and it becomes a circle">
		<defs>
			<linearGradient id="ic-grad" x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stop-color="#5fd6cf" />
				<stop offset="0.5" stop-color="#a493ff" />
				<stop offset="1" stop-color="#f28db6" />
			</linearGradient>
		</defs>
		<path d={path} class="halo" />
		<path d={path} class="seg" />
		{#each ticks as s, i (s)}
			{@const p = pt(s, g)}
			{@const nn = normal(s, g)}
			<line x1={p[0] - nn[0] * 6} y1={p[1] - nn[1] * 6} x2={p[0] + nn[0] * 6} y2={p[1] + nn[1] * 6} class="tick" />
			<SvgTeX x={p[0] + nn[0] * 24} y={p[1] + nn[1] * 24} tex={tickTeX[i]} size={13} color="var(--ink-dim)" w={40} h={26} />
		{/each}
		{#if glued}
			<circle cx={end0[0]} cy={end0[1]} r="22" class="spark" />
		{/if}
		<circle cx={end0[0]} cy={end0[1]} r="7.5" class="end" />
		<circle cx={end1[0]} cy={end1[1]} r="7.5" class="end" />
		{#if glued}
			<SvgTeX x={end0[0]} y={end0[1] - 30} tex={String.raw`0\sim1`} size={17} color="var(--gold-bright)" w={90} h={30} />
		{:else}
			<SvgTeX x={end0[0] + n0[0] * 26 - (g < 0.05 ? 0 : 10)} y={end0[1] + n0[1] * 26} tex="0" size={17} color="var(--gold-bright)" w={30} h={30} />
			<SvgTeX x={end1[0] + n1[0] * 26 + (g < 0.05 ? 0 : 10)} y={end1[1] + n1[1] * 26} tex="1" size={17} color="var(--gold-bright)" w={30} h={30} />
		{/if}
	</Svg>
	<p class="readout" aria-live="polite">{@html renderMathInText(readout)}</p>
	<Controls>
		<Button variant="gold" onclick={play}>{playing ? 'Pause' : glued ? 'Unglue' : 'Glue 0 to 1'}</Button>
		<div class="sl"><Slider bind:value={g} min={0} max={1} step={0.005} label="bend" oninput={stop} format={(v) => (v > 0.995 ? 'glued' : Math.round(v * 100) + '%')} /></div>
	</Controls>
</div>

<style>
	.ic > :global(svg) {
		padding: 0.5rem 0.5rem 0;
	}
	.seg {
		fill: none;
		stroke: url(#ic-grad);
		stroke-width: 4;
		stroke-linecap: round;
	}
	.halo {
		fill: none;
		stroke: rgba(164, 147, 255, 0.22);
		stroke-width: 14;
		stroke-linecap: round;
	}
	.tick {
		stroke: rgba(235, 229, 213, 0.6);
		stroke-width: 1.4;
	}
	.end {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.5;
	}
	.spark {
		fill: rgba(242, 208, 143, 0.25);
		filter: url(#glow-strong);
		animation: pulse 1.6s ease-in-out infinite;
		transform-box: fill-box;
		transform-origin: center;
	}
	@keyframes pulse {
		50% {
			transform: scale(1.25);
			opacity: 0.6;
		}
	}
	.readout {
		margin: 0.4rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
	.sl {
		flex: 1 1 12rem;
	}
</style>
