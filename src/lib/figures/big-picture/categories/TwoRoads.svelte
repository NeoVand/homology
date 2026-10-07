<script lang="ts">
	// Figure: reading a commutative square by following arrows.
	// Convert Celsius to Fahrenheit and warm up, in either order.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { animate, lerp, type Pt } from './diagram';

	let c = $state(20);
	let warm = $state<'18' | '10'>('18');
	const F = (x: number) => (x * 9) / 5 + 32;
	const routeA = $derived(F(c) + Number(warm)); // across, then down
	const routeB = $derived(F(c + 10)); // down, then across
	const commutes = $derived(Math.abs(routeA - routeB) < 1e-9);
	const fmt = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1)).replace('-', '−');

	const TL: Pt = [130, 80];
	const TR: Pt = [470, 80];
	const BL: Pt = [130, 280];
	const BR: Pt = [470, 280];
	let t = $state(0); // 0..2 : position of both tokens along their routes
	let running = $state(false);
	let cancel: (() => void) | null = null;
	function go() {
		cancel?.();
		running = true;
		cancel = animate(2400, (u) => (t = u * 2), () => (running = false));
	}
	const along = (a: Pt, b: Pt, c2: Pt, s: number) => (s <= 1 ? lerp(a, b, s) : lerp(b, c2, s - 1));
	const tokA = $derived(along(TL, TR, BR, t));
	const tokB = $derived(along(TL, BL, BR, t));
</script>

<div class="roads">
	<Svg viewBox="0 0 600 360" maxHeight={380} label="A square of temperature conversions; both routes from the top left to the bottom right give the same answer">
		<!-- arrows -->
		<path d="M 196 80 L 400 80" class="ar a" marker-end="url(#arrow-gold)" />
		<path d="M 470 104 L 470 254" class="ar a" marker-end="url(#arrow-gold)" />
		<path d="M 130 104 L 130 254" class="ar b" marker-end="url(#arrow-teal)" />
		<path d="M 196 280 L 400 280" class="ar b" marker-end="url(#arrow-teal)" />
		<SvgTeX x={300} y={60} tex={'x \\mapsto \\tfrac95 x + 32'} size={14} color="var(--gold-bright)" w={170} h={26} />
		<SvgTeX x={300} y={302} tex={'x \\mapsto \\tfrac95 x + 32'} size={14} color="var(--teal)" w={170} h={26} />
		<SvgTeX x={70} y={180} tex={'+10\\,^\\circ\\mathrm{C}'} size={15} color="var(--teal)" w={90} h={24} />
		<SvgTeX x={534} y={180} tex={`+${warm}\\,^\\circ\\mathrm{F}`} size={15} color={commutes ? 'var(--gold-bright)' : 'var(--rose)'} w={90} h={24} />

		<!-- corners -->
		{#each [[TL, `${fmt(c)}\\,^\\circ\\mathrm{C}`, 'Celsius'], [TR, `${fmt(F(c))}\\,^\\circ\\mathrm{F}`, 'Fahrenheit'], [BL, `${fmt(c + 10)}\\,^\\circ\\mathrm{C}`, 'Celsius'], [BR, '?', 'Fahrenheit']] as [P, tx, cap], k (k)}
			<g transform="translate({(P as Pt)[0]} {(P as Pt)[1]})">
				<rect x="-62" y="-24" width="124" height="48" rx="14" class="node" class:goal={k === 3} />
				<SvgTeX x={0} y={-1} tex={String(tx)} size={16} color={k === 3 ? 'var(--ink-faint)' : 'var(--ink-bright)'} w={120} h={26} />
				<text y="40" text-anchor="middle" class="t-ui">{cap}</text>
			</g>
		{/each}

		<!-- results at the corner -->
		{#if t >= 2}
			<g transform="translate({BR[0]} {BR[1] - 56})">
				<rect x="-74" y="-15" width="148" height="30" rx="15" class="res" class:bad={!commutes} />
				<SvgTeX x={0} y={0} tex={commutes ? `${fmt(routeA)} = ${fmt(routeB)}` : `${fmt(routeA)} \\neq ${fmt(routeB)}`} size={14} color="#0b1122" w={146} h={24} />
			</g>
		{/if}

		<!-- tokens -->
		{#if t > 0}
			<circle cx={tokA[0]} cy={tokA[1]} r="10" class="tok gold" />
			<circle cx={tokB[0]} cy={tokB[1]} r="10" class="tok teal" />
		{/if}
	</Svg>
	<div class="out ui" aria-live="polite">
		<span class="ga">gold road: convert, then warm by {warm}°F → <b>{fmt(routeA)}°F</b></span>
		<span class="te">teal road: warm by 10°C, then convert → <b>{fmt(routeB)}°F</b></span>
		<span class:ok={commutes} class:no={!commutes}>{commutes ? 'The square commutes: every starting temperature gives the same answer both ways.' : 'This square does not commute: warming by 10°C is not warming by 10°F.'}</span>
	</div>
	<Controls>
		<Slider bind:value={c} min={-20} max={40} step={1} label="Starting temperature (°C)" format={(v) => `${v}°C`} />
		<Segmented
			bind:value={warm}
			label="Right-hand arrow"
			options={[
				{ value: '18', label: 'right arrow +18°F' },
				{ value: '10', label: 'right arrow +10°F' }
			]}
		/>
		<Button variant="gold" onclick={go} disabled={running}>Follow both roads</Button>
	</Controls>
</div>

<style>
	.roads {
		padding-top: 0.8rem;
	}
	.ar {
		fill: none;
		stroke-width: 2.2;
	}
	.ar.a {
		stroke: #f2d08f;
	}
	.ar.b {
		stroke: #5fd6cf;
	}
	.node {
		fill: rgba(18, 26, 47, 0.95);
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.2;
	}
	.node.goal {
		stroke: rgba(242, 208, 143, 0.6);
		stroke-dasharray: 4 4;
	}
	.res {
		fill: #84d9a2;
		filter: url(#glow);
	}
	.res.bad {
		fill: #f28db6;
	}
	.tok {
		filter: url(#glow-strong);
	}
	.tok.gold {
		fill: #f2d08f;
	}
	.tok.teal {
		fill: #5fd6cf;
	}
	.out {
		display: grid;
		gap: 0.15rem;
		justify-items: center;
		text-align: center;
		font-size: 0.82rem;
		color: var(--ink-dim);
		padding: 0 1rem 0.6rem;
	}
	.ga b {
		color: var(--gold-bright);
	}
	.te b {
		color: var(--teal);
	}
	.ok {
		color: var(--green);
	}
	.no {
		color: var(--rose);
	}
</style>
