<script lang="ts">
	// Figure: four currencies trading around a square. Take logarithms and the
	// exchange rates become an edge labelling; "no free money around any loop"
	// is exactly "the labelling is a gradient" (log-rates are differences of
	// log-values). With no triangles the arbitrage hides from every local check;
	// open a EUR–JPY market and it is caught by a triangle.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import OGraphView from './OGraphView.svelte';
	import { currencies, currencySymbols, market } from './presets';

	let gbpJpy = $state(202);
	let logs = $state(false);
	let diagonal = $state(false);

	const rates = $derived([market.rates[0], market.rates[1], gbpJpy, market.rates[3], 170]);
	const edges = $derived<[number, number][]>(diagonal ? [...market.edges, [1, 3]] : market.edges);
	const tris = $derived<[number, number, number][]>(diagonal ? [[0, 1, 3], [1, 2, 3]] : []);

	const fmtRate = (x: number) => (x < 0.05 ? '×1/153' : `×${x >= 10 ? x.toFixed(0) : x.toFixed(2)}`);
	const fmtLog = (x: number) => {
		const l = Math.log(x);
		return (l < 0 ? '−' : '+') + Math.abs(l).toFixed(3);
	};
	// around the square: $ → € → £ → ¥ → $
	const product = $derived(rates[0] * rates[1] * rates[2] * rates[3]);
	const final = $derived(1000 * product);
	const profit = $derived(final - 1000);
	const fair = $derived(Math.abs(profit) < 0.005);
	// triangles (when the EUR–JPY market is open): $ → € → ¥ → $ and € → £ → ¥ → €
	const triA = $derived((rates[0] * rates[4]) / 153);
	const triB = $derived((rates[1] * rates[2]) / rates[4]);
	const money = (x: number) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	const chain = $derived(
		`\\text{\\$1000} \\xrightarrow{\\times 0.9} \\text{€900} \\xrightarrow{\\times 0.85} \\text{£765} \\xrightarrow{\\times ${gbpJpy}} \\text{¥${(765 * gbpJpy).toLocaleString('en-US')}} \\xrightarrow{\\times 1/153} \\text{\\$${money(final)}}`
	);
	const logSum = $derived(
		`\\ln 0.9 + \\ln 0.85 + \\ln ${gbpJpy} + \\ln\\tfrac{1}{153} = \\ln\\tfrac{${gbpJpy}}{200} = ${Math.log(gbpJpy / 200) >= 0 ? '' : '-'}${Math.abs(Math.log(gbpJpy / 200)).toFixed(4)}`
	);
</script>

<div class="arb">
	<Svg viewBox="40 24 400 300" maxHeight={380} label="Four currencies trading around a square, with exchange rates on the edges">
		<OGraphView
			pos={market.pos}
			{edges}
			{tris}
			vertexRadius={21}
			vertexTextSize={19}
			triFill={(t) => {
				const p = t === 0 ? triA : triB;
				return Math.abs(p - 1) < 1e-6 ? 'rgba(132,217,162,0.12)' : 'rgba(242,141,182,0.2)';
			}}
			triLabel={(t) => {
				const p = t === 0 ? triA : triB;
				return Math.abs(p - 1) < 1e-6 ? 'no arbitrage' : `×${p.toFixed(3)}`;
			}}
			triLabelColor={(t) => (Math.abs((t === 0 ? triA : triB) - 1) < 1e-6 ? 'var(--green)' : 'var(--rose)')}
			edgeColor={(e) => (e === 2 ? 'var(--gold-bright)' : e === 4 ? 'var(--violet)' : fair ? 'var(--green)' : 'rgba(242,208,143,0.75)')}
			edgeWidth={(e) => (e === 2 ? 3.4 : 2.6)}
			edgeLabel={(e) => (logs ? fmtLog(rates[e]) : fmtRate(rates[e]))}
			edgeLabelColor={(e) => (e === 2 ? 'var(--gold-bright)' : e === 4 ? 'var(--violet)' : 'var(--ink-bright)')}
			edgeLabelSide={(e) => (e === 4 ? -1 : 1)}
			vertexText={(v) => currencySymbols[v]}
			vertexName={(v) => currencies[v]}
		/>
	</Svg>
</div>
<Controls>
	<div class="row">
		<Slider bind:value={gbpJpy} min={190} max={210} step={1} label="Yen per pound (£ → ¥)" />
		<Toggle bind:checked={logs} label="Show logarithms" />
		<Toggle bind:checked={diagonal} label="Open a € ↔ ¥ market" />
	</div>
	<div class="readout ui">
		<div class="line">
			<span class="lbl">Once around:</span>
			<span class="m"><TeX tex={chain} /></span>
		</div>
		<div class="line">
			<span class="lbl">Profit:</span>
			<span class="val" class:ok={fair} class:bad={!fair}>{profit >= 0 ? '+' : '−'}${money(Math.abs(profit))}</span>
			<span class="note">{fair ? 'no free money: the rates come from values' : 'free money from nothing — an arbitrage loop'}</span>
		</div>
		<div class="line">
			<span class="lbl">Log loop sum:</span>
			<span class="m" class:ok={fair} class:bad={!fair}><TeX tex={logSum} /></span>
		</div>
	</div>
</Controls>

<style>
	.arb {
		padding: 0.5rem 0.6rem 0.2rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.1rem;
		width: 100%;
	}
	.readout {
		width: 100%;
		border-top: 1px solid var(--line-faint);
		padding-top: 0.6rem;
		display: grid;
		gap: 0.35rem;
		font-size: 0.82rem;
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.7rem;
	}
	.lbl {
		color: var(--ink-faint);
		min-width: 6.5rem;
	}
	.m {
		overflow-x: auto;
		max-width: 100%;
		color: var(--ink-bright);
	}
	.val {
		font-weight: 700;
		font-size: 0.95rem;
	}
	.ok {
		color: var(--green) !important;
	}
	.bad {
		color: var(--rose) !important;
	}
	.note {
		color: var(--ink-dim);
	}
</style>
