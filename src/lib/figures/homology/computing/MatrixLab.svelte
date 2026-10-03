<script lang="ts">
	// One matrix, three number systems: row-reduce a boundary matrix over ℤ/2
	// or ℚ to find its rank, or bring it to Smith normal form over ℤ to find its
	// invariant factors. One step per pivot.
	import { untrack } from 'svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import MatrixCells from './MatrixCells.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { rowReduceSteps, smithSteps, type MatStep } from './matrixSteps';
	import { hollowTetrahedron, projectivePlane, kleinGrid, torusGrid } from '../homology-groups/complexes';

	type Mode = 'Z2' | 'Q' | 'Z';
	let {
		matrix: matrix0 = 'rp2',
		mode: mode0 = 'Z2',
		modes = ['Z2', 'Q', 'Z'],
		matrices = ['sphere', 'rp2', 'klein', 'torus']
	}: { matrix?: string; mode?: Mode; modes?: Mode[]; matrices?: string[] } = $props();

	const sources: Record<string, { label: string; tex: string; K: ReturnType<typeof projectivePlane>['K'] }> = {
		sphere: { label: 'Sphere ∂₂', tex: '\\partial_2(S^2)', K: hollowTetrahedron().K },
		rp2: { label: 'ℝP² ∂₂', tex: '\\partial_2(\\RP^2)', K: projectivePlane().K },
		klein: { label: 'Klein ∂₂', tex: '\\partial_2(K)', K: kleinGrid().K },
		torus: { label: 'Torus ∂₂', tex: '\\partial_2(T^2)', K: torusGrid().K }
	};

	let which = $state(untrack(() => matrix0));
	let mode = $state<Mode>(untrack(() => mode0));
	let step = $state(0);

	const src = $derived(sources[which]);
	const M = $derived(src.K.boundaryMatrix(2));
	const lab = (s: number[]) => `[${s.join(',')}]`;
	const result = $derived.by(() => {
		if (mode === 'Z') {
			const r = smithSteps(M);
			return { steps: r.steps, diagonal: r.diagonal };
		}
		return { steps: rowReduceSteps(M, mode), diagonal: null as number[] | null };
	});
	const steps = $derived(result.steps);
	const S = $derived<MatStep>(steps[Math.min(step, steps.length - 1)]);
	const pivotSet = $derived(new Set(S.done.map(([r, c]) => `${r},${c}`)));
	const lastStep = $derived(step >= steps.length - 1);

	function cellClass(i: number, j: number) {
		if (S.pivot && S.pivot[0] === i && S.pivot[1] === j) {
			return mode === 'Z' && Math.abs(S.values[i][j]) > 1 ? 'torsion' : mode !== 'Z' && Math.abs(S.values[i][j]) > 1 && lastStep ? 'torsion' : 'pivot';
		}
		if (pivotSet.has(`${i},${j}`)) return Math.abs(S.values[i][j]) > 1 ? 'torsion' : 'done';
		return undefined;
	}
	const rowLabels = $derived(S.rowOrder.map((r) => lab(src.K.simplices[1][r])));
	const colLabels = $derived(S.colOrder.map((c) => lab(src.K.simplices[2][c])));

	const summary = $derived.by(() => {
		const n = S.done.length;
		const field = mode === 'Z2' ? '\\Z/2' : '\\Q';
		if (mode === 'Z' && result.diagonal) {
			if (!lastStep) {
				const sofar = S.done.map(([r, c]) => Math.abs(S.values[r][c]));
				return sofar.length ? `Diagonal so far: \\(${sofar.join(', ')}\\).` : 'No pivots yet.';
			}
			const d = result.diagonal;
			const ones = d.filter((x) => x === 1).length;
			const big = d.filter((x) => x > 1);
			return `Invariant factors of \\(\\partial_2\\): \\(${ones}\\) ones${big.length ? ` and \\(${big.join(', ')}\\)` : ''}. ${big.length ? `Each factor \\(d > 1\\) contributes a summand \\(\\Z/d\\) to \\(H_1\\): torsion.` : 'No factor exceeds 1, so \\(H_1\\) has no torsion.'}`;
		}
		if (!lastStep) return `Rank so far: \\(${n}\\).`;
		const two = S.done.some(([r, c]) => Math.abs(S.values[r][c]) > 1);
		return `Over \\(${field}\\) the rank of \\(\\partial_2\\) is \\(${n}\\).` + (mode === 'Q' && two ? ' The last pivot is \\(2\\): fine over \\(\\Q\\), where we may divide by it, but zero modulo 2.' : '');
	});
	function pick(v: string) {
		which = v;
		step = 0;
	}
	function setMode(v: Mode) {
		mode = v;
		step = 0;
	}
	const modeLabels: Record<Mode, string> = { Z2: 'rank over ℤ/2', Q: 'rank over ℚ', Z: 'Smith form over ℤ' };
</script>

<div class="lab">
	<div class="top ui">
		{#if matrices.length > 1}
			<Segmented value={which} options={matrices.map((k) => ({ value: k, label: sources[k].label }))} onchange={pick} label="Choose a matrix" />
		{/if}
		{#if modes.length > 1}
			<Segmented value={mode} options={modes.map((m) => ({ value: m, label: modeLabels[m] }))} onchange={setMode} label="Choose the number system" />
		{/if}
	</div>
	<div class="steps ui">
		<StepControls bind:step count={steps.length} interval={1700} />
	</div>
	<div class="grid">
		<div class="mat">
			<MatrixCells
				cells={S.cells}
				{rowLabels}
				{colLabels}
				{cellClass}
				highlightRows={S.rows}
				highlightCols={mode === 'Z' ? S.cols : []}
				compact={M.length > 16}
			/>
		</div>
		<div class="side ui">
			<div class="kicker">Step {Math.min(step, steps.length - 1) + 1} of {steps.length}</div>
			<p class="note">{@html renderMathInText(S.note)}</p>
			{#if S.ops.length}
				<div class="ops">
					<div class="ops-h">operations in this step</div>
					<ul>
						{#each S.ops.slice(0, 7) as op, i (i)}<li>{op}</li>{/each}
						{#if S.ops.length > 7}<li class="more">… and {S.ops.length - 7} more</li>{/if}
					</ul>
				</div>
			{/if}
			<p class="summary">{@html renderMathInText(summary)}</p>
		</div>
	</div>
</div>

<style>
	.lab {
		padding: 0.8rem 1.1rem 1rem;
	}
	@media (max-width: 640px) {
		.lab {
			padding: 0.6rem 0.5rem 0.8rem;
		}
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		margin-bottom: 0.6rem;
	}
	.steps {
		margin-bottom: 0.6rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		align-items: start;
	}
	@media (max-width: 860px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.mat {
		max-height: 520px;
		overflow: auto;
		border-radius: 8px;
		background: rgba(4, 7, 14, 0.35);
		padding: 0.4rem 0.2rem;
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		font-size: 0.86rem;
		color: var(--ink);
	}
	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.note {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.98rem;
		line-height: 1.55;
	}
	.ops {
		border-left: 2px solid rgba(116, 169, 255, 0.5);
		padding: 0.2rem 0 0.2rem 0.7rem;
	}
	.ops-h {
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-bottom: 0.2rem;
	}
	.ops ul {
		margin: 0;
		padding: 0 !important;
		list-style: none;
		font-family: var(--font-mono);
		font-size: 0.74rem;
		color: var(--ink-dim);
	}
	.ops li {
		margin: 0.1rem 0 !important;
	}
	.ops li::before {
		display: none !important;
	}
	.more {
		color: var(--ink-faint);
	}
	.summary {
		margin: 0;
		padding: 0.55rem 0.75rem;
		border-radius: 8px;
		background: rgba(216, 178, 110, 0.07);
		border: 1px solid var(--line-faint);
		font-family: var(--font-body);
		font-size: 0.95rem;
		line-height: 1.5;
	}
</style>
