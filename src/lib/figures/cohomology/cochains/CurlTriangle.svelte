<script lang="ts">
	// Figure: the local test on one filled triangle. In "heights" mode the edge
	// numbers are differences of vertex heights, and the circulation around the
	// triangle is always 0 (curl of a gradient = 0, i.e. δδ = 0). In "free" mode
	// you set the edge numbers yourself and the circulation can be anything.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import OGraphView from './OGraphView.svelte';
	import { gradient, signed, type Pt } from './graph';

	const pos: Pt[] = [
		[70, 236],
		[290, 236],
		[180, 52]
	];
	const edges: [number, number][] = [
		[0, 1], // A→B
		[1, 2], // B→C
		[0, 2] // A→C
	];
	const tris: [number, number, number][] = [[0, 1, 2]];
	const names = ['A', 'B', 'C'];

	let mode = $state<'heights' | 'free'>('heights');
	let f = $state([1, 3, 6]);
	let psi = $state([2, 3, 4]);
	let selV = $state<number | null>(2);
	let selE = $state<number | null>(2);

	const values = $derived(mode === 'heights' ? gradient({ n: 3, edges }, f) : psi);
	const circ = $derived(values[0] + values[1] - values[2]);
	const formula = $derived(
		`\\psi(AB) + \\psi(BC) - \\psi(AC) = ${values[0]} ${values[1] < 0 ? '-' : '+'} ${Math.abs(values[1])} ${values[2] < 0 ? '+' : '-'} ${Math.abs(values[2])} = ${circ}`
	);
	const edgeName = (e: number) => names[edges[e][0]] + names[edges[e][1]];
	const stepLabel = $derived(mode === 'heights' ? (selV === null ? '' : `Height of ${names[selV]}`) : selE === null ? '' : `Number on ${edgeName(selE)}`);
	const stepValue = $derived(mode === 'heights' ? (selV === null ? 0 : f[selV]) : selE === null ? 0 : psi[selE]);
	function setValue(v: number) {
		if (mode === 'heights' && selV !== null) f[selV] = v;
		if (mode === 'free' && selE !== null) psi[selE] = v;
	}
</script>

<Controls>
	<Segmented
		bind:value={mode}
		options={[
			{ value: 'heights', label: 'Numbers from heights' },
			{ value: 'free', label: 'Numbers of your choice' }
		]}
		label="Where the edge numbers come from"
	/>
</Controls>
<div class="tri-fig">
	<Svg viewBox="20 10 320 270" maxHeight={330} label="One filled triangle with numbers on its edges and their circulation">
		<OGraphView
			{pos}
			{edges}
			{tris}
			vertexRadius={14}
			triFill={() => (circ === 0 ? 'rgba(132,217,162,0.14)' : 'rgba(242,141,182,0.16)')}
			edgeColor={(e) => (mode === 'heights' ? 'var(--teal)' : selE === e ? 'var(--gold-bright)' : 'rgba(242,208,143,0.75)')}
			edgeLabel={(e) => signed(values[e])}
			edgeLabelColor={() => (mode === 'heights' ? 'var(--teal)' : 'var(--gold-bright)')}
			edgeLabelSide={(e) => (e === 2 ? 1 : -1)}
			vertexText={(v) => names[v]}
			vertexLabel={(v) => (mode === 'heights' ? `f = ${f[v]}` : null)}
			selectedVertex={mode === 'heights' ? selV : null}
			selectedEdge={mode === 'free' ? selE : null}
			clickVertex={mode === 'heights'}
			clickEdge={mode === 'free'}
			autoPlace
			onvertex={(v) => (selV = v)}
			onedge={(e) => (selE = e)}
		/>
		<!-- circulation arrow and value -->
		<g class="circ" class:ok={circ === 0}>
			<path d="M 204 190 A 30 30 0 1 0 156 190" class="arc" marker-end="url(#arrow-{circ === 0 ? 'green' : 'rose'})" />
			<text x="180" y="177" class="cval">{signed(circ, false)}</text>
		</g>
	</Svg>
</div>
<Controls>
	<div class="row">
		<Stepper label={stepLabel} value={stepValue} min={-20} max={20} onchange={setValue} />
		<span class="formula" class:ok={circ === 0}><TeX tex={formula} /></span>
	</div>
</Controls>

<style>
	.tri-fig {
		padding: 0.4rem 0.6rem 0.2rem;
	}
	.arc {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.85;
		transition: stroke 0.3s var(--ease);
	}
	.circ.ok .arc {
		stroke: var(--green);
	}
	.cval {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 22px !important;
		text-anchor: middle;
		dominant-baseline: middle;
		fill: var(--rose) !important;
		transition: fill 0.3s var(--ease);
	}
	.circ.ok .cval {
		fill: var(--green) !important;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.7rem;
		width: 100%;
	}
	.formula {
		margin-left: auto;
		font-size: 0.95rem;
		color: var(--rose);
		overflow-x: auto;
		max-width: 100%;
	}
	.formula.ok {
		color: var(--green);
	}
</style>
