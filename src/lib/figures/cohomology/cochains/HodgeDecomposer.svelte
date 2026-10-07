<script lang="ts">
	// Figure: every edge flow splits, uniquely and at right angles, into a
	// gradient (comes from heights), a curl (swirls around filled triangles) and a
	// harmonic part (circulates around the hole) — the part no local test can see.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import OGraphView from './OGraphView.svelte';
	import { hodge, norm2, fracText, pathSum, curl as circulation, clean } from './graph';
	import { hodgeGraph as Hg } from './presets';

	const presets: Record<string, { label: string; flow: number[] }> = {
		example: { label: 'Example', flow: [3, 3, 3, 2, -2] },
		heights: { label: 'Pure heights', flow: [2, 1, 3, -2, 1] },
		swirl: { label: 'Pure swirl', flow: [1, 1, -1, 0, 0] },
		hole: { label: 'Around the hole', flow: [1, 1, 2, 3, -3] }
	};
	let pid = $state('example');
	let flow = $state<number[]>([...presets.example.flow]);
	let sel = $state<number | null>(3);

	function choose(id: string) {
		pid = id;
		flow = [...presets[id].flow];
	}
	function nudge(d: number) {
		if (sel === null) return;
		flow[sel] += d;
		pid = '';
	}

	const H = $derived(hodge(Hg, flow));
	const tri = Hg.tris![0];
	// circulation of the curl part around the filled triangle, per edge (it is 3φ in total)
	const swirl = $derived(clean(circulation(Hg, H.curl, tri) / 3));
	// loop sum of the harmonic part around the hole 1 → 3 → 4 → 1
	const holeSum = $derived(clean(pathSum(Hg, H.harmonic, [0, 2, 3, 0])));
	const e = $derived({ x: norm2(flow), g: norm2(H.gradient), c: norm2(H.curl), h: norm2(H.harmonic) });

	type Panel = { key: string; title: string; sign: string; color: string; values: number[] };
	const panels = $derived<Panel[]>([
		{ key: 'x', title: 'Your flow', sign: '', color: 'var(--gold-bright)', values: flow },
		{ key: 'g', title: 'Gradient', sign: '=', color: 'var(--teal)', values: H.gradient },
		{ key: 'c', title: 'Curl', sign: '+', color: 'var(--violet)', values: H.curl },
		{ key: 'h', title: 'Harmonic', sign: '+', color: 'var(--rose)', values: H.harmonic }
	]);
	const isZero = (x: number) => Math.abs(x) < 1e-9;
	// ranking read off from the potential (the gradient part)
	const ranking = $derived.by(() => {
		const order = [0, 1, 2, 3].sort((a, b) => H.potential[b] - H.potential[a]);
		let s = '';
		order.forEach((v, i) => {
			if (i > 0) s += Math.abs(H.potential[order[i - 1]] - H.potential[v]) < 1e-9 ? ' = ' : ' > ';
			s += String(v + 1);
		});
		return s;
	});
	const bar = (x: number) => (e.x > 0 ? (100 * x) / e.x : 0);
</script>

<Controls>
	<Segmented bind:value={pid} options={Object.entries(presets).map(([value, p]) => ({ value, label: p.label }))} label="Choose a flow" onchange={choose} />
</Controls>
<div class="panels">
	{#each panels as P (P.key)}
		<div class="panel">
			<div class="ptitle ui" style="--c:{P.color}">
				{#if P.sign}<span class="sign">{P.sign}</span>{/if}
				{P.title}
			</div>
			<Svg viewBox="8 -12 284 264" maxHeight={268} label="{P.title} part of the edge flow">
				<!-- the hole -->
				<polygon points={[0, 2, 3].map((v) => Hg.pos[v].join(',')).join(' ')} class="hole" />
				<!-- in the gradient panel the height of vertex 4 sits where the label would be -->
				<text x="150" y={P.key === 'g' ? 176 : 196} class="hole-lbl">hole</text>
				<OGraphView
					pos={Hg.pos}
					edges={Hg.edges}
					tris={Hg.tris}
					vertexRadius={10}
					vertexText={(v) => String(v + 1)}
					triFill={() => (P.key === 'c' && !isZero(swirl) ? 'rgba(164,147,255,0.2)' : 'rgba(116,169,255,0.1)')}
					edgeColor={(i) => (isZero(P.values[i]) ? 'rgba(206,198,176,0.25)' : P.color)}
					edgeWidth={(i) => (P.key === 'x' && sel === i ? 3.6 : 2.4)}
					edgeLabel={(i) => (isZero(P.values[i]) ? '0' : fracText(P.values[i]))}
					edgeLabelColor={(i) => (isZero(P.values[i]) ? 'var(--ink-ghost)' : P.color)}
					edgeLabelSide={(i) => (i === 2 ? -1 : 1)}
					vertexLabel={(v) => (P.key === 'g' ? fracText(H.potential[v]) : null)}
					vertexLabelColor={() => 'var(--teal)'}
					selectedEdge={P.key === 'x' ? sel : null}
					clickEdge={P.key === 'x'}
					onedge={(i) => (sel = i)}
				/>
				{#if P.key === 'c' && !isZero(swirl)}
					<path d="M 168 104 A 18 18 0 1 {swirl > 0 ? 0 : 1} 132 104" class="swirl" marker-end="url(#arrow-violet)" />
				{/if}
				{#if P.key === 'h' && !isZero(holeSum)}
					<!-- 1 → 3 → 4 → 1 runs clockwise on screen -->
					<path d="M 167 156 A 17 17 0 1 {holeSum > 0 ? 1 : 0} 133 156" class="swirl rose" marker-end="url(#arrow-rose)" />
				{/if}
			</Svg>
			<div class="pnote ui">
				{#if P.key === 'x'}
					Tap an edge, then use ±1.
				{:else if P.key === 'g'}
					heights (a ranking): {ranking}
				{:else if P.key === 'c'}
					swirl around the filled triangle: {fracText(Math.abs(swirl))} per edge
				{:else}
					loop sum around the hole: {fracText(holeSum)}
				{/if}
			</div>
		</div>
	{/each}
</div>
<Controls>
	<div class="row">
		<span class="ui lbl">Selected edge:</span>
		<Button onclick={() => nudge(-1)} disabled={sel === null}>−1</Button>
		<Button onclick={() => nudge(1)} disabled={sel === null}>+1</Button>
		<span class="ui energy-lbl">
			Energy (sum of squares):
			<b class="gold">{fracText(e.x)}</b> = <b class="teal">{fracText(e.g)}</b> + <b class="violet">{fracText(e.c)}</b> +
			<b class="rose">{fracText(e.h)}</b>
		</span>
	</div>
	<div class="bar" aria-hidden="true">
		<span class="seg teal" style="width:{bar(e.g)}%"></span>
		<span class="seg violet" style="width:{bar(e.c)}%"></span>
		<span class="seg rose" style="width:{bar(e.h)}%"></span>
	</div>
</Controls>

<style>
	.panels {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.2rem;
		padding: 0.7rem 0.6rem 0.4rem;
	}
	/* container queries: with the sidebar open the plate is narrower than the window */
	@container figure (max-width: 56rem) {
		.panels {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			row-gap: 0.8rem;
		}
	}
	/* a phone: one panel per row, so that the edge numbers stay readable */
	@container figure (max-width: 30rem) {
		.panels {
			grid-template-columns: minmax(0, 1fr);
			row-gap: 0.6rem;
			padding: 0.6rem 1rem 0.4rem;
		}
	}
	.panel {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		min-width: 0;
	}
	.ptitle {
		font-size: 0.7rem;
		font-weight: 650;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c);
		text-align: center;
	}
	.sign {
		font-size: 1rem;
		margin-right: 0.35rem;
		color: var(--ink-dim);
	}
	.pnote {
		text-align: center;
		font-size: 0.72rem;
		color: var(--ink-dim);
		line-height: 1.35;
		min-height: 2.7em;
		padding: 0 0.3rem;
	}
	.hole {
		fill: rgba(242, 141, 182, 0.05);
		stroke: none;
	}
	.hole-lbl {
		font-family: var(--font-ui);
		font-size: 10px !important;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		fill: rgba(242, 141, 182, 0.55) !important;
		text-anchor: middle;
	}
	.swirl {
		fill: none;
		stroke: var(--violet);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.swirl.rose {
		stroke: var(--rose);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.7rem;
		width: 100%;
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.energy-lbl {
		margin-left: auto;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.gold {
		color: var(--gold-bright);
	}
	.teal {
		color: var(--teal);
	}
	.violet {
		color: var(--violet);
	}
	.rose {
		color: var(--rose);
	}
	.bar {
		display: flex;
		width: 100%;
		height: 8px;
		border-radius: 999px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.06);
	}
	.seg {
		height: 100%;
		transition: width 0.4s var(--ease);
	}
	.seg.teal {
		background: var(--teal);
	}
	.seg.violet {
		background: var(--violet);
	}
	.seg.rose {
		background: var(--rose);
	}
</style>
