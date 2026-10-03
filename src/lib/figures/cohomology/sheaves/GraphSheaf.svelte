<script lang="ts">
	// Figure: a cellular sheaf on a graph. Vertices are currencies and hold the
	// price of the same coffee in that currency; an edge compares two prices by
	// converting one into the other's currency. A global section is a price
	// list that agrees across every edge. "Let prices settle" runs the sheaf
	// heat equation, which flows to the nearest global section.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { delta, diffuse, safeStep, sheafDims, type GraphSheaf } from './cellular';
	import { prefersReducedMotion } from './svgutil';

	const names = ['€', '$', '£', 'CHF'];
	const pos: [number, number][] = [
		[260, 58],
		[92, 292],
		[428, 292],
		[566, 120]
	];
	// where each edge's comparison card sits, relative to the edge's midpoint
	const tagOff: [number, number][] = [
		[-62, -6],
		[0, 0],
		[62, -6],
		[0, -42]
	];
	// rates[e] = units of v's currency for one unit of u's currency
	type RateSet = 'honest' | 'arbitrage';
	let rateSet = $state<RateSet>('honest');
	const rateTable: Record<RateSet, number[]> = {
		//          €→$   $→£ (per $)  €→£    €→CHF
		honest: [1.1, 0.8, 0.88, 0.95],
		arbitrage: [1.1, 0.8, 0.7, 0.95]
	};
	const edgeList: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2],
		[0, 3]
	];
	const rates = $derived(rateTable[rateSet]);
	// compare along edge (u, v) in u's currency: F_u = 1, F_v = 1 / rate
	const S = $derived<GraphSheaf>({
		vertices: 4,
		edges: edgeList.map(([u, v], i) => ({ u, v, fu: 1, fv: 1 / rates[i] }))
	});
	const dims = $derived(sheafDims(S));
	const loop = $derived(rates[0] * rates[1] / rates[2]); // € → $ → £ compared with € → £

	let prices = $state([3.0, 3.2, 2.7, 2.6]);
	const mism = $derived(delta(S, prices));
	const isSection = $derived(mism.every((m) => Math.abs(m) < 0.005));

	let running = $state(false);
	let raf = 0;
	function settle() {
		if (running) {
			running = false;
			cancelAnimationFrame(raf);
			return;
		}
		running = true;
		const h = safeStep(S);
		const reduce = prefersReducedMotion();
		const tick = () => {
			let x = prices.slice();
			for (let k = 0; k < (reduce ? 4000 : 6); k++) x = diffuse(S, x, h);
			prices = x;
			const done = delta(S, x).every((m) => Math.abs(m) < 0.0004);
			if (!running || done || reduce) {
				running = false;
				return;
			}
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	function nudge(i: number, d: number) {
		running = false;
		cancelAnimationFrame(raf);
		prices[i] = Math.max(0, +(prices[i] + d).toFixed(2));
	}
	function scramble() {
		running = false;
		cancelAnimationFrame(raf);
		prices = [3.0, 3.6, 2.1, 3.1];
	}

	const money = (v: number) => v.toFixed(2);
	const sym = (i: number) => (names[i] === 'CHF' ? 'CHF\\,' : names[i] === '€' ? '\\text{€}' : names[i] === '£' ? '\\pounds' : '\\$');
</script>

<div class="wrap">
	<Svg viewBox="0 0 640 360" maxHeight={400} label="Four currencies joined by exchange rates. Each node holds the price of a coffee in its currency; each edge checks whether the two prices agree after conversion.">
		<!-- edges -->
		{#each edgeList as [u, v], i (i)}
			{@const a = pos[u]}
			{@const b = pos[v]}
			{@const ok = Math.abs(mism[i]) < 0.005}
			{@const mx = (a[0] + b[0]) / 2 + tagOff[i][0]}
			{@const my = (a[1] + b[1]) / 2 + tagOff[i][1]}
			<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="edge" class:ok />
			<g class="tag" class:ok>
				<rect x={mx - 62} y={my - 30} width="124" height="60" rx="12" />
				<text x={mx} y={my - 12} text-anchor="middle" class="rate">1 {names[u]} = {rates[i].toFixed(2)} {names[v]}</text>
				<text x={mx} y={my + 8} text-anchor="middle" class="cmp">{money(prices[u])} vs {money(prices[v] / rates[i])}</text>
				<text x={mx} y={my + 23} text-anchor="middle" class="cur">(in {names[u]})</text>
			</g>
		{/each}
		<!-- vertices -->
		{#each pos as p, i (i)}
			<circle cx={p[0]} cy={p[1]} r="34" class="node" />
			<text x={p[0]} y={p[1] - 6} text-anchor="middle" class="cur-big">{names[i]}</text>
			<text x={p[0]} y={p[1] + 15} text-anchor="middle" class="price">{money(prices[i])}</text>
		{/each}
		<SvgTeX x={560} y={226} tex={isSection ? '\\text{a global section}' : '\\text{not a global section}'} size={16} color={isSection ? 'var(--green)' : 'var(--rose)'} w={200} />
	</Svg>

	<div class="readout ui">
		<div class="steps">
			{#each names as n, i (n)}
				<div class="st">
					<span class="nm">{n}</span>
					<button aria-label="lower the {n} price" onclick={() => nudge(i, -0.1)}>−</button>
					<span class="pv nums">{money(prices[i])}</span>
					<button aria-label="raise the {n} price" onclick={() => nudge(i, 0.1)}>+</button>
				</div>
			{/each}
		</div>
		<div class="facts">
			<span>Around the triangle: <TeX tex={`1.10 \\times 0.80 \\div ${rates[2].toFixed(2)} = ${loop.toFixed(3)}`} /></span>
			<span><TeX tex={`\\dim H^0 = ${dims.h0}`} /> <span class="dim">(consistent price lists)</span></span>
			<span><TeX tex={`\\dim H^1 = ${dims.h1}`} /></span>
		</div>
		<div class="verdict" class:ok={dims.h0 > 0}>
			{#if dims.h0 > 0}
				The rates are consistent around the loop, so consistent price lists exist: pick the euro price and every other
				price is forced.
			{:else}
				Arbitrage: converting around the triangle multiplies money by {loop.toFixed(3)}. Then the only price list that
				agrees everywhere is the zero list — let the prices settle and watch them drain away.
			{/if}
		</div>
	</div>

	<Controls>
		<Segmented
			bind:value={rateSet}
			options={[
				{ value: 'honest', label: 'Honest rates' },
				{ value: 'arbitrage', label: 'Arbitrage' }
			]}
			label="Exchange rates"
		/>
		<Button onclick={settle} active={running}>{running ? 'Stop' : 'Let prices settle'}</Button>
		<Button onclick={scramble}>Scramble prices</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.5rem;
	}
	.edge {
		stroke: var(--rose);
		stroke-width: 3;
		opacity: 0.75;
		transition: stroke 0.3s;
	}
	.edge.ok {
		stroke: var(--green);
	}
	.tag rect {
		fill: rgba(9, 13, 26, 0.92);
		stroke: rgba(242, 141, 182, 0.6);
	}
	.tag.ok rect {
		stroke: rgba(132, 217, 162, 0.6);
	}
	.rate {
		font-family: var(--font-ui);
		font-size: 12.5px;
		fill: var(--ink-dim);
	}
	.cmp {
		font-family: var(--font-ui);
		font-size: 14px;
		font-weight: 600;
		fill: var(--rose);
	}
	.tag.ok .cmp {
		fill: var(--green);
	}
	.cur {
		font-family: var(--font-ui);
		font-size: 10.5px;
		fill: var(--ink-faint);
	}
	.node {
		fill: rgba(22, 30, 58, 0.95);
		stroke: var(--gold);
		stroke-width: 2;
		filter: drop-shadow(0 0 8px rgba(242, 205, 135, 0.35));
	}
	.cur-big {
		font-family: var(--font-ui);
		font-size: 15px;
		font-weight: 600;
		fill: var(--gold-bright);
	}
	.price {
		font-family: var(--font-ui);
		font-size: 17px;
		font-weight: 700;
		fill: var(--ink-bright);
	}
	.readout {
		display: grid;
		gap: 0.5rem;
		padding: 0.3rem 1.2rem 0.7rem;
		font-size: 0.84rem;
	}
	.steps {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.2rem;
	}
	.st {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.nm {
		color: var(--gold-bright);
		font-weight: 600;
		min-width: 2rem;
	}
	.st button {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.06);
		color: var(--gold-bright);
		cursor: pointer;
	}
	.st button:hover {
		background: rgba(216, 178, 110, 0.16);
	}
	.pv {
		min-width: 2.6rem;
		text-align: center;
		color: var(--ink-bright);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.4rem;
		color: var(--ink);
	}
	.dim {
		color: var(--ink-faint);
		font-size: 0.78rem;
	}
	.verdict {
		color: var(--rose);
		line-height: 1.5;
	}
	.verdict.ok {
		color: var(--green);
	}
</style>
