<script lang="ts">
	// ℝP² as a hexagon with opposite rim points glued. Orient all ten triangles
	// counterclockwise: interior edges cancel and the rim survives, and the rim
	// reads c and then c again. So ∂(Σ t) = 2c. Then: try to bound c alone.
	import Svg from '$lib/components/svg/Svg.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import FlatComplex from '../homology-groups/FlatComplex.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { boundaryZ2 } from '$lib/math/homology';
	import { rp2Witness } from './rp2';

	const W = rp2Witness();
	const { ex, K, eps, c, rimEdges } = W;
	let step = $state(0);
	let S = $state<Set<number>>(new Set());

	const steps = [
		{
			label: 'The hexagon',
			title: 'The projective plane as a hexagon',
			body: 'The ten triangles of the six-vertex \\(\\RP^2\\), spread out flat. Opposite points of the rim are glued, so the rim labels read \\(4, 5, 6\\) and then \\(4, 5, 6\\) again. The gold arrows follow the loop \\(c = [4,5] + [5,6] - [4,6]\\), that is, \\(4 \\to 5 \\to 6 \\to 4\\).'
		},
		{
			label: 'Orient',
			title: 'Orient every triangle counterclockwise',
			body: 'Inside a flat hexagon there is no obstruction: give every triangle the counterclockwise orientation (violet arrows) and add them all up, \\(T = \\sum \\pm t\\).'
		},
		{
			label: 'Cancel',
			title: 'Interior edges cancel',
			body: 'Each interior edge is shared by two triangles that run along it in opposite directions, so it cancels from \\(\\partial T\\). Only the rim of the hexagon is left.'
		},
		{
			label: '2c',
			title: 'The rim is c, twice',
			body: 'Going once around the rim we read \\(4 \\to 5 \\to 6 \\to 4\\) and then, after the gluing, \\(4 \\to 5 \\to 6 \\to 4\\) again. Both halves are the same loop \\(c\\), run in the same direction. So \\(\\partial T = 2c\\): twice \\(c\\) is a boundary.'
		},
		{
			label: 'c alone?',
			title: 'But c on its own bounds nothing',
			body: 'Click triangles to choose a set \\(S\\) and watch its mod-2 boundary (teal). Can you make it equal \\(c\\) (dashed gold)? You cannot: a computer checks all \\(2^{10} = 1024\\) sets of triangles and none works. An integer chain with boundary \\(c\\) would give such a set by reducing mod 2, so \\(c\\) is not a boundary over \\(\\Z\\) either. Hence \\([c] \\ne 0\\) but \\(2[c] = 0\\).'
		}
	];

	const dS = $derived(new Set(boundaryZ2(K, 2, [...S])));
	const matches = $derived(dS.size === rimEdges.size && [...rimEdges].every((e) => dS.has(e)));

	function edgeCoef(e: number) {
		if (step === 4) return 0;
		if (step === 2 && !rimEdges.has(e)) return 0;
		if (step === 0 || step === 3) return c[e];
		return 0;
	}
	function edgeColor(e: number) {
		if (step === 2 && !rimEdges.has(e)) return 'rgba(164,147,255,0.35)';
		if (step === 4) {
			if (dS.has(e)) return 'var(--teal)';
			if (rimEdges.has(e)) return 'var(--gold)';
		}
		return null;
	}
	function pick(_k: string, t: number) {
		if (step !== 4) return;
		const next = new Set(S);
		if (next.has(t)) next.delete(t);
		else next.add(t);
		S = next;
	}
</script>

<div class="rp">
	<div class="top ui">
		<StepControls bind:step count={steps.length} labels={steps.map((s) => s.label)} interval={3600} />
	</div>
	<div class="grid">
		<div class="pic">
			<Svg viewBox={ex.L.viewBox} maxHeight={380} label="The projective plane drawn as a hexagon with opposite rim points glued">
				<FlatComplex
					L={ex.L}
					{edgeCoef}
					{edgeColor}
					edgeDash={(e) => (step === 2 && !rimEdges.has(e)) || (step === 4 && rimEdges.has(e) && !dS.has(e))}
					triOrient={step >= 1 && step <= 3 ? (t) => eps[t] : undefined}
					triFill={(t) => (step >= 1 && step <= 3 ? 'var(--violet)' : step === 4 && S.has(t) ? 'var(--violet)' : null)}
					triOpacity={() => (step === 4 ? 0.42 : 0.2)}
					interactive={step === 4 ? ['tri'] : []}
					onpick={pick}
					labelSize={1.05}
					ariaName="projective plane"
				/>
			</Svg>
		</div>
		<div class="text">
			<div class="kicker ui">Step {step + 1} of {steps.length}</div>
			<h4 class="title">{steps[step].title}</h4>
			<p class="body">{@html renderMathInText(steps[step].body)}</p>
			{#if step === 3}
				<div class="eq"><TeX tex={'\\partial\\Big(\\sum_{10\\ \\text{triangles}} \\pm t\\Big) = 2c = 2\\big([4,5] + [5,6] - [4,6]\\big)'} /></div>
			{:else if step === 4}
				<div class="try ui">
					<span>{S.size} triangle{S.size === 1 ? '' : 's'} chosen · boundary has {dS.size} edge{dS.size === 1 ? '' : 's'}</span>
					{#if matches}<span class="win">That would be a filling of c. (This cannot happen.)</span>{/if}
					<Button onclick={() => (S = new Set())}>Clear</Button>
					<Button onclick={() => (S = new Set(K.simplices[2].map((_, i) => i)))}>All ten</Button>
				</div>
				{#if S.size === 10}
					<p class="note">All ten triangles: mod 2 the boundary is empty, so the whole surface is a mod-2 2-cycle. That is the "extra" \(H_2(\RP^2;\Z/2) \cong \Z/2\).</p>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style>
	.rp {
		padding: 0.8rem 1.1rem 1rem;
	}
	@media (max-width: 640px) {
		.rp {
			padding: 0.6rem 0.6rem 0.8rem;
		}
	}
	.top {
		margin-bottom: 0.4rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 0.6rem 1.4rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.title {
		font-family: var(--font-elegant) !important;
		font-size: 1.3rem !important;
		text-transform: none !important;
		letter-spacing: 0.01em !important;
		color: var(--ink-bright) !important;
		margin: 0.3rem 0 0.4rem !important;
		font-weight: 600 !important;
	}
	.body {
		margin: 0;
		font-size: 0.98rem;
		line-height: 1.6;
	}
	.eq {
		margin-top: 0.8rem;
		font-size: 1rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.try {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.8rem;
		align-items: center;
		margin-top: 0.8rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.win {
		color: var(--green);
	}
	.note {
		margin: 0.6rem 0 0;
		font-size: 0.9rem;
		color: var(--ink-dim);
	}
</style>
