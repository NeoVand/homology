<script lang="ts">
	// Step through a Vietoris–Rips filtration one simplex at a time while the
	// barcode grows underneath.
	import CloudSvg from './CloudSvg.svelte';
	import Barcode, { type BarDatum } from './Barcode.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { flipbook, pentagon } from './flipbook';
	import type { Box } from './draw';

	const { simplices, reduction, steps, stop } = flipbook(pentagon);
	const box: Box = { x0: -1.75, x1: 1.85, y0: -1.55, y1: 1.45 };
	const XMAX = 1;
	const bars: BarDatum[] = reduction.pairs
		.filter((p) => p.death - p.birth > 1e-12)
		.map((p, i) => ({ id: i, dim: p.dim, birth: p.birth, death: p.death }))
		.sort((a, b) => a.dim - b.dim || b.death - a.death);

	let step = $state(0);
	const cur = $derived(steps[step]);
	const present = $derived(simplices.slice(0, cur.upto + 1));
	const edges = $derived(
		present.filter((s, k) => s.verts.length === 2 && k !== cur.added).map((s) => [s.verts[0], s.verts[1]] as [number, number])
	);
	const tris = $derived(present.filter((s, k) => s.verts.length === 3 && k !== cur.added).map((s) => s.verts));
	const addedS = $derived(cur.added >= 0 ? simplices[cur.added] : null);
	const hiEdges = $derived(addedS && addedS.verts.length === 2 ? [[addedS.verts[0], addedS.verts[1]] as [number, number]] : []);
	const hiTris = $derived(addedS && addedS.verts.length === 3 ? [addedS.verts] : []);
	const hiColor = $derived(cur.kind === 'merge' ? 'var(--teal)' : 'var(--gold-bright)');
	const labels = pentagon.map((_, i) => String(i));
	const kindLabel: Record<string, string> = {
		start: 'birth of five pieces',
		merge: 'an H₀ bar ends',
		loop: 'an H₁ bar begins',
		'instant-loop': 'a loop closes…',
		'instant-fill': '…and is filled at once',
		fill: 'an H₁ bar ends'
	};
</script>

<div class="fb">
	<div class="grid">
		<div class="pic">
			<CloudSvg
				pts={pentagon}
				{box}
				r={cur.r}
				{edges}
				{tris}
				{labels}
				{hiEdges}
				hiEdgeColor={hiColor}
				{hiTris}
				ring={cur.ring !== undefined ? [cur.ring] : []}
				ringColor="var(--rose)"
				ballFill="rgba(116, 150, 255, 0.07)"
				ballEdge="rgba(170, 190, 255, 0.2)"
				maxHeight={300}
				labelSize={21}
				pointRadius={5.5}
				label="Five points and the Vietoris–Rips complex built so far"
			/>
		</div>
		<div class="code">
			<div class="ptitle ui">The barcode so far</div>
			<Barcode {bars} xmax={XMAX} now={cur.r} growing height={170} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} />
			<div class="kind ui k-{cur.kind}">{kindLabel[cur.kind]}</div>
		</div>
	</div>
	<p class="body">{@html renderMathInText(cur.body)}</p>
	<div class="controls ui">
		<StepControls bind:step count={steps.length} labels={steps.map((s) => s.title)} interval={2600} />
	</div>
	<span class="sr-only">The film stops at r = {stop.toFixed(2)}.</span>
</div>

<style>
	.fb {
		container-type: inline-size;
		padding: 0.9rem 1rem 0.3rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 0.8rem 1.4rem;
		align-items: center;
	}
	.pic,
	.code {
		min-width: 0;
	}
	.ptitle {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 600;
		margin-bottom: 0.2rem;
	}
	.kind {
		margin-top: 0.4rem;
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		text-align: center;
	}
	.kind.k-merge,
	.kind.k-fill {
		color: var(--teal);
	}
	.kind.k-loop,
	.kind.k-instant-loop {
		color: var(--gold-bright);
	}
	.body {
		min-height: 5.6em;
		margin: 0.7rem 0 0.4rem;
		font-size: 0.95rem;
		line-height: 1.6;
		color: var(--ink);
	}
	.controls {
		padding: 0.6rem 0 0.7rem;
		border-top: 1px solid var(--line-faint);
	}
	@container (max-width: 560px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.body {
			min-height: 7.5em;
		}
	}
</style>
