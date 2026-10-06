<script lang="ts">
	// Figure: a ring of n gears. Each mesh forces "opposite spins" — the number 1
	// in ℤ/2 on that edge. The ring can turn iff these numbers come from spins on
	// the gears, iff the loop sum n·1 is 0 in ℤ/2, iff n is even.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { gearRing, gearPath } from './gears';

	let n = $state(6);
	let showZ2 = $state(true);
	let follow = $state(-1); // −1: not following; k: spins assigned to gears 0…k−1
	let t = $state(0);
	let shake = $state(0);
	let reduced = $state(false);
	let raf = 0;
	let last = 0;
	let followTimer: ReturnType<typeof setInterval> | undefined;

	const G = $derived(gearRing(n));
	const path = $derived(gearPath(G.r, G.teeth));
	const even = $derived(n % 2 === 0);

	let host: HTMLDivElement;
	let visible = false;
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const loop = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
			last = now;
			if (!reduced && even) t += dt;
			if (shake > 0) shake = Math.max(0, shake - dt);
			raf = visible ? requestAnimationFrame(loop) : 0;
		};
		// animate only while the figure is on screen
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible && !raf) {
				last = 0;
				raf = requestAnimationFrame(loop);
			}
		});
		io.observe(host);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
			clearInterval(followTimer);
		};
	});

	// when n changes: stop following; an odd ring "tries" to turn and jams
	$effect(() => {
		void n;
		follow = -1;
		clearInterval(followTimer);
		if (n % 2 === 1 && !reduced) shake = 0.9;
	});

	const omega = 0.55;
	function angle(i: number) {
		const base = G.phase[i] + (even ? G.spin[i] * omega * t : 0);
		// a jammed ring shudders a little and stops
		const jitter = !even && shake > 0 ? G.spin[i] * 0.05 * Math.sin(shake * 38) * shake : 0;
		return ((base + jitter) * 180) / Math.PI;
	}

	function startFollow() {
		clearInterval(followTimer);
		follow = 0;
		if (reduced) {
			follow = n + 1;
			return;
		}
		followTimer = setInterval(() => {
			follow++;
			if (follow > n) clearInterval(followTimer);
		}, 420);
	}

	// contact points between neighbours
	const contacts = $derived(
		G.centers.map(([x0, y0], i) => {
			const [x1, y1] = G.centers[(i + 1) % n];
			return [(x0 + x1) / 2, (y0 + y1) / 2] as [number, number];
		})
	);
	const jamIx = $derived(n - 1); // the mesh between the last gear and the first
	const sumTeX = $derived(
		`\\underbrace{1 + 1 + \\cdots + 1}_{${n}\\ \\text{meshes}} = ${n} \\equiv ${n % 2} \\pmod 2`
	);
	const spinOf = (i: number) => G.spin[i];
</script>

<div class="gears" bind:this={host}>
	<Svg viewBox="20 6 420 392" maxHeight={430} label="A ring of gears; an even ring turns, an odd ring locks">
		<defs>
			<linearGradient id="gear-gold" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#fff1d0" />
				<stop offset="0.45" stop-color="#e3bd76" />
				<stop offset="1" stop-color="#8f6a30" />
			</linearGradient>
			<radialGradient id="gear-hub" cx="40%" cy="35%" r="70%">
				<stop offset="0" stop-color="#1c2540" />
				<stop offset="1" stop-color="#070b16" />
			</radialGradient>
		</defs>

		<!-- the ring (the cycle graph underneath) -->
		<circle cx="230" cy="200" r={G.rho} class="ring" />

		{#each G.centers as [x, y], i (i + '-' + n)}
			{@const assigned = follow > i}
			{@const clash = !even && follow > n - 1 && i === 0}
			<g transform="translate({x} {y})">
				<g transform="rotate({angle(i)})">
					<path d={path} class="gear" class:clash fill="url(#gear-gold)" />
					<circle r={G.r * 0.42} fill="url(#gear-hub)" class="hub" />
					{#each [0, 1, 2] as k (k)}
						<line x1="0" y1="0" x2={G.r * 0.42 * Math.cos((k * 2 * Math.PI) / 3)} y2={G.r * 0.42 * Math.sin((k * 2 * Math.PI) / 3)} class="spoke" />
					{/each}
					<circle r={G.r * 0.09} class="axle" />
				</g>
				{#if assigned || (even && follow < 0)}
					{@const rr = G.r * 0.27}
					{@const cw = spinOf(i) === 1}
					{@const col = clash ? 'rose' : cw ? 'gold' : 'teal'}
					<!-- a three-quarter circle with an arrowhead: clockwise or counter-clockwise -->
					<path
						d={cw ? `M ${-rr} 0 A ${rr} ${rr} 0 1 1 0 ${rr}` : `M ${rr} 0 A ${rr} ${rr} 0 1 0 0 ${rr}`}
						class="spinarc {col}"
						marker-end="url(#arrow-{col})"
					/>
				{/if}
			</g>
		{/each}

		<!-- the meshes, labelled in ℤ/2 -->
		{#each contacts as [x, y], i (i + '/' + n)}
			{@const jam = !even && i === jamIx}
			{#if jam}
				<circle cx={x} cy={y} r="13" class="jam" />
			{/if}
			{#if showZ2}
				<foreignObject x={x - 14} y={y - 12} width="28" height="24" style="overflow:visible;pointer-events:none">
					<div class="z2" class:jam>1</div>
				</foreignObject>
			{/if}
		{/each}
	</Svg>
	<div class="status ui" class:ok={even} class:bad={!even}>
		{#if even}
			{n} gears: the spins alternate all the way round — the ring turns.
		{:else}
			{n} gears: the last mesh asks gear {n} and gear 1 to spin opposite ways, but they already agree — the ring locks.
		{/if}
	</div>
</div>
<Controls>
	<div class="row">
		<Stepper bind:value={n} min={3} max={12} label="Number of gears" />
		<Button variant="gold" onclick={startFollow}>Follow the spins</Button>
		<Toggle bind:checked={showZ2} label="Show the ℤ/2 labels" />
	</div>
	<div class="row sum" class:ok={even} class:bad={!even}>
		<span class="ui lbl">Loop sum in ℤ/2:</span>
		<TeX tex={sumTeX} />
	</div>
</Controls>

<style>
	.gears {
		padding: 0.5rem 0.6rem 0;
	}
	.ring {
		fill: none;
		stroke: rgba(164, 147, 255, 0.25);
		stroke-width: 1.4;
		stroke-dasharray: 4 6;
	}
	.gear {
		stroke: #3a2a10;
		stroke-width: 1.2;
		stroke-linejoin: round;
		filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.55));
	}
	.gear.clash {
		stroke: var(--rose);
		stroke-width: 2.4;
	}
	.hub {
		stroke: rgba(242, 208, 143, 0.5);
		stroke-width: 1;
	}
	.spoke {
		stroke: rgba(242, 208, 143, 0.45);
		stroke-width: 1.4;
	}
	.axle {
		fill: #f4d79c;
	}
	.spinarc {
		fill: none;
		stroke-width: 2.6;
		stroke-linecap: round;
		pointer-events: none;
	}
	.spinarc.gold {
		stroke: #f2d08f;
	}
	.spinarc.teal {
		stroke: var(--teal);
	}
	.spinarc.rose {
		stroke: var(--rose);
	}
	.jam {
		fill: rgba(242, 141, 182, 0.28);
		stroke: var(--rose);
		stroke-width: 1.5;
		animation: pulse 1.4s var(--ease) infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.55;
		}
		50% {
			opacity: 1;
		}
	}
	.z2 {
		width: 100%;
		height: 100%;
		display: grid;
		place-items: center;
		font-family: var(--font-ui);
		font-size: 12px;
		font-weight: 700;
		color: var(--violet);
		background: rgba(7, 11, 22, 0.85);
		border: 1px solid rgba(164, 147, 255, 0.5);
		border-radius: 999px;
	}
	.z2.jam {
		color: var(--rose);
		border-color: var(--rose);
	}
	.status {
		text-align: center;
		font-size: 0.85rem;
		margin: 0.2rem auto 0.8rem;
		max-width: 34rem;
		min-height: 2.5em;
	}
	.status.ok {
		color: var(--green);
	}
	.status.bad {
		color: var(--rose);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		width: 100%;
	}
	.sum {
		border-top: 1px solid var(--line-faint);
		padding-top: 0.6rem;
	}
	.sum.ok :global(.katex) {
		color: var(--green);
	}
	.sum.bad :global(.katex) {
		color: var(--rose);
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
</style>
