<script lang="ts">
	// A step-by-step homology computation: picture + boundary matrix + text.
	import Svg from '$lib/components/svg/Svg.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import FlatComplex from './FlatComplex.svelte';
	import { players } from './player';
	import { paddedViewBox } from './flat';
	import { renderMathInText, tex } from '$lib/katex/render';
	import { untrack } from 'svelte';

	let { initial = 'circle' }: { initial?: string } = $props();

	const all = players();
	let id = $state(untrack(() => initial));
	let step = $state(0);
	const P = $derived(all.find((p) => p.id === id)!);
	const S = $derived(P.steps[Math.min(step, P.steps.length - 1)]);
	const K = $derived(P.ex.K);

	let hcell = $state<{ i: number; j: number } | null>(null);

	const label = (s: number[]) => `[${s.join(',')}]`;
	const matrix = $derived(S.matrix ? K.boundaryMatrix(S.matrix.k) : null);
	const rowLabels = $derived(S.matrix ? K.simplices[S.matrix.k - 1].map(label) : []);
	const colLabels = $derived(S.matrix ? K.simplices[S.matrix.k].map(label) : []);

	function coef(e: number) {
		if (hcell && S.matrix?.k === 1 && hcell.j === e) return 0;
		for (const c of S.chains ?? []) if (c.chain[e]) return c.chain[e];
		return 0;
	}
	function coefColor(e: number) {
		for (const c of S.chains ?? []) if (c.chain[e]) return c.color;
		return 'var(--gold-bright)';
	}
	// hovering a matrix cell highlights the column's simplex and the row's face
	function edgeColor(e: number) {
		if (!hcell || !S.matrix) return null;
		if (S.matrix.k === 1 && hcell.j === e) return 'var(--blue)';
		if (S.matrix.k === 2 && hcell.i === e) return 'var(--teal)';
		if (S.matrix.k === 2 && matrix![e]?.[hcell.j]) return 'rgba(95,214,207,0.75)';
		return null;
	}
	function vertexColor(i: number) {
		if (hcell && S.matrix?.k === 1) {
			if (hcell.i === i) return 'var(--teal)';
			if (matrix![i]?.[hcell.j]) return 'rgba(95,214,207,0.8)';
		}
		return S.vertexColor ?? null;
	}
	function triFill(t: number) {
		if (hcell && S.matrix?.k === 2 && hcell.j === t) return 'var(--blue)';
		return S.triFill?.tris.includes(t) ? S.triFill.color : null;
	}
	function select(v: string) {
		id = v;
		step = 0;
		hcell = null;
	}
	const cellClass = (i: number, j: number) => {
		if (!matrix) return undefined;
		const v = matrix[i][j];
		if (!v) return undefined;
		if (S.matrix?.highlightCols?.includes(j)) return v > 0 ? 'gold' : 'rose';
		return undefined;
	};
</script>

<div class="cp">
	<div class="top">
		<Segmented value={id} options={all.map((p) => ({ value: p.id, label: p.label }))} onchange={select} label="Choose a space" />
		<StepControls bind:step count={P.steps.length} labels={P.steps.map((s) => s.label)} interval={3800} />
	</div>
	<div class="grid">
		<div class="pic">
			<Svg viewBox={paddedViewBox(P.ex.L, 330, 300)} maxHeight={340} label="The complex {P.ex.name}, with the current step highlighted">
				<FlatComplex
					L={P.ex.L}
					edgeCoef={coef}
					{coefColor}
					{edgeColor}
					{vertexColor}
					{triFill}
					triOpacity={() => 0.3}
					triOrient={S.triOrient ? (t) => S.triOrient![t] ?? 0 : undefined}
					orientColor="var(--violet)"
					showOrientation={S.showOrientation}
				/>
			</Svg>
			<div class="space ui">{@html tex(`${P.ex.space}\\quad f = (${K.fVector.join(', ')})`)}</div>
		</div>
		<div class="text">
			<div class="kicker ui">Step {step + 1} of {P.steps.length} · {S.label}</div>
			<h4 class="title">{@html renderMathInText(S.title)}</h4>
			<p class="body">{@html renderMathInText(S.body)}</p>
		</div>
	</div>
	{#if matrix}
		<div class="mat">
			<MatrixView
				M={matrix}
				{rowLabels}
				{colLabels}
				caption={`\\partial_${S.matrix!.k} =`}
				highlightCols={S.matrix?.highlightCols ?? []}
				{cellClass}
				onhover={(i, j) => (hcell = i === null || j === null ? null : { i, j })}
			/>
		</div>
	{/if}
</div>

<style>
	.cp {
		padding: 0.8rem 1.1rem 1.1rem;
	}
	@media (max-width: 640px) {
		.cp {
			padding: 0.6rem 0.6rem 0.9rem;
		}
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		gap: 0.7rem 1.2rem;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.6rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		gap: 0.6rem 1.4rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.space {
		text-align: center;
		font-size: 0.85rem;
		color: var(--ink-faint);
		margin-top: 0.2rem;
	}
	.text {
		min-height: 12rem;
	}
	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 0.35rem;
	}
	.title {
		font-family: var(--font-elegant) !important;
		font-size: 1.32rem !important;
		letter-spacing: 0.01em !important;
		text-transform: none !important;
		color: var(--ink-bright) !important;
		margin: 0 0 0.45rem !important;
		font-weight: 600 !important;
	}
	.body {
		font-size: 0.98rem;
		line-height: 1.62;
		margin: 0;
		color: var(--ink);
	}
	.mat {
		margin-top: 0.9rem;
		max-height: 380px;
		overflow: auto;
		border-top: 1px solid var(--line-faint);
		padding-top: 0.7rem;
	}
</style>
