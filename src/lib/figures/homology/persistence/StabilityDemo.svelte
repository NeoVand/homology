<script lang="ts">
	// Jiggle every point by at most δ and watch the persistence diagram: each
	// point moves by at most δ (it stays in its dashed box) or, if it was within δ
	// of the diagonal, it may vanish into it. The bottleneck distance is computed
	// exactly and compared with δ.
	import CloudSvg from './CloudSvg.svelte';
	import Diagram from './Diagram.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Mark from '$lib/components/ui/Mark.svelte';
	import { ShuffleIcon } from '$lib/icons';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type { BarDatum } from './Barcode.svelte';
	import { RipsPH, presetCloud, jiggle, bottleneck, toDiagonal, type DgmPt } from './ph';
	import type { Box } from './draw';

	const base = presetCloud('circle', 3);
	const A = new RipsPH(base);
	const box: Box = { x0: -1.75, x1: 1.75, y0: -1.6, y1: 1.6 };
	const MAX = 1.2;

	let delta = $state(0.1);
	let seed = $state(1);
	let showBoxes = $state(true);
	const moved = $derived(jiggle(base, delta, seed));
	const B = $derived(new RipsPH(moved));

	const finite = (ph: RipsPH, dim: number): DgmPt[] =>
		ph.bars.filter((b) => b.dim === dim && b.death < Infinity).map((b) => [b.birth, b.death]);
	const a1 = finite(A, 1);
	const a0 = finite(A, 0);
	const b1 = $derived(finite(B, 1));
	const b0 = $derived(finite(B, 0));
	const m1 = $derived(bottleneck(a1, b1));
	const m0 = $derived(bottleneck(a0, b0));

	function segments(a: DgmPt[], b: DgmPt[], match: [number, number][]): [number, number, number, number][] {
		const out: [number, number, number, number][] = [];
		for (const [i, j] of match) {
			if (i >= 0 && j >= 0) out.push([a[i][0], a[i][1], b[j][0], b[j][1]]);
			else if (i >= 0) {
				const m = (a[i][0] + a[i][1]) / 2;
				out.push([a[i][0], a[i][1], m, m]);
			} else if (j >= 0) {
				const m = (b[j][0] + b[j][1]) / 2;
				out.push([b[j][0], b[j][1], m, m]);
			}
		}
		return out;
	}
	const matching = $derived([...segments(a1, b1, m1.matching), ...segments(a0, b0, m0.matching)]);
	const points: BarDatum[] = $derived(B.bars.map((b) => ({ id: b.id, dim: b.dim, birth: b.birth, death: b.death })));
	const ghost = A.bars.map((b) => ({ dim: b.dim, birth: b.birth, death: b.death }));
	const longest = $derived(B.bars.filter((b) => b.dim === 1).reduce((m, b) => Math.max(m, b.death - b.birth), 0));
	const shortOnes = $derived(B.bars.filter((b) => b.dim === 1 && toDiagonal([b.birth, b.death]) <= delta).length);
</script>

<div class="st">
	<div class="grid">
		<div class="cloud">
			<div class="ptitle ui">The points, before (rings) and after (dots)</div>
			<CloudSvg pts={moved} {box} ghost={base} maxHeight={300} pointRadius={4} label="The original points as rings and the jiggled points as dots">
				{#snippet overlay(X, Y)}
					{#each base as p, i (i)}
						<line x1={X(p[0])} y1={Y(p[1])} x2={X(moved[i][0])} y2={Y(moved[i][1])} class="move" />
					{/each}
				{/snippet}
			</CloudSvg>
		</div>
		<div class="dgm">
			<div class="ptitle ui">Diagrams, before (hollow) and after (solid)</div>
			<Diagram {points} max={MAX} {ghost} {matching} boxes={showBoxes ? delta : 0} band={showBoxes ? delta : 0} maxSize={300} />
		</div>
	</div>
	<div class="readout ui">
		<span class="chip"><TeX tex={`\\delta = ${delta.toFixed(2)}`} /></span>
		<span class="chip gold"
			><TeX tex={`d_B(H_1) = ${m1.distance.toFixed(3)} ${m1.distance <= delta + 1e-9 ? '\\le' : '>'} \\delta`} />
			<span class="ok"><Mark ok={m1.distance <= delta + 1e-9} /></span></span
		>
		<span class="chip teal"
			><TeX tex={`d_B(H_0) = ${m0.distance.toFixed(3)} ${m0.distance <= delta + 1e-9 ? '\\le' : '>'} \\delta`} />
			<span class="ok"><Mark ok={m0.distance <= delta + 1e-9} /></span></span
		>
	</div>
	<p class="note ui">
		Longest loop now lives for {longest.toFixed(2)}{shortOnes > 0
			? ` · ${shortOnes} short loop${shortOnes === 1 ? '' : 's'} inside the pink band (allowed to appear or vanish)`
			: ''}.
	</p>
	<div class="controls ui">
		<div class="sl">
			<Slider bind:value={delta} min={0} max={0.3} step={0.005} label="Noise: every point moves by at most δ" format={(v) => v.toFixed(2)} />
		</div>
		<Button variant="ghost" icon={ShuffleIcon} onclick={() => seed++}>New noise</Button>
		<Toggle bind:checked={showBoxes} label="Boxes and band" />
	</div>
</div>

<style>
	.st {
		container-type: inline-size;
		padding: 0.9rem 1rem 0.2rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 0.8rem 1.4rem;
		align-items: start;
	}
	.cloud,
	.dgm {
		min-width: 0;
	}
	.ptitle {
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 600;
		text-align: center;
		margin-bottom: 0.3rem;
	}
	.move {
		stroke: rgba(242, 141, 182, 0.75);
		stroke-width: 1.4;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.45rem 0.6rem;
		margin: 0.6rem 0 0.2rem;
		font-size: 0.82rem;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		color: var(--ink-bright);
	}
	.chip.gold {
		color: var(--gold-bright);
		border-color: rgba(244, 215, 156, 0.4);
	}
	.chip.teal {
		color: var(--teal);
		border-color: rgba(95, 214, 207, 0.35);
	}
	.ok {
		color: var(--green);
		font-weight: 700;
	}
	.note {
		text-align: center;
		font-size: 0.8rem;
		color: var(--ink-faint);
		margin: 0.3rem 0 0.2rem;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.2rem;
		padding: 0.6rem 0 0.7rem;
		border-top: 1px solid var(--line-faint);
		margin-top: 0.4rem;
	}
	.sl {
		flex: 1 1 15rem;
		display: flex;
	}
	@container (max-width: 560px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
