<script lang="ts">
	// Gauss–Jordan elimination one step at a time, over ℚ or over 𝔽₂.
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { rowReduce, type Field } from './rowreduce';
	import { fracString, type Frac } from './fraction';

	let {
		preset: initialPreset = 'example',
		field: initialField = 'Q'
	}: { preset?: 'example' | 'triangle01' | 'boundary'; field?: Field } = $props();

	const presets = {
		example: {
			label: '3×4 example',
			A: [
				[1, 2, 1, 3],
				[2, 4, 0, 2],
				[3, 6, 1, 5]
			]
		},
		triangle01: {
			label: 'triangle, 0/1',
			A: [
				[1, 1, 0],
				[1, 0, 1],
				[0, 1, 1]
			]
		},
		boundary: {
			label: 'triangle, signed',
			A: [
				[-1, -1, 0],
				[1, 0, -1],
				[0, 1, 1]
			]
		}
	} as const;
	type PresetKey = keyof typeof presets;

	// svelte-ignore state_referenced_locally
	let preset = $state<PresetKey>(initialPreset);
	// svelte-ignore state_referenced_locally
	let field = $state<Field>(initialField);
	let step = $state(0);

	const A = $derived(presets[preset].A.map((r) => [...r]));
	const result = $derived(rowReduce(A, field));
	const steps = $derived(result.steps);
	const cur = $derived(steps[Math.min(step, steps.length - 1)]);
	const last = $derived(step >= steps.length - 1);
	const M = $derived(cur.M.map((row) => row.map((x) => x.valueOf())));
	const n = $derived(A[0].length);

	$effect(() => {
		// reset to the start whenever the matrix or the field changes
		void preset;
		void field;
		step = 0;
	});

	const colLabels = $derived(Array.from({ length: n }, (_, j) => `x_{${j + 1}}`));
	const rowLabels = $derived(A.map((_, i) => `R_{${i + 1}}`));

	function cellClass(i: number, j: number): string | undefined {
		if (cur.pivot && cur.pivot[0] === i && cur.pivot[1] === j) return 'pivot';
		if (cur.pivots.some((p) => p[0] === i && p[1] === j)) return 'gold';
		if (last && result.freeCols.includes(j)) return 'teal';
		return undefined;
	}

	const vecTeX = (v: Frac[]) => `\\begin{pmatrix} ${v.map((x) => x.tex()).join(' \\\\ ')} \\end{pmatrix}`;
	const colTeX = (j: number) =>
		`\\begin{pmatrix} ${A.map((r) => (field === 'F2' ? ((r[j] % 2) + 2) % 2 : r[j])).join(' \\\\ ')} \\end{pmatrix}`;
	const fieldName = $derived(field === 'Q' ? '\\mathbb Q' : '\\mathbb Z/2');
	const labels = $derived(steps.map((s, i) => (i === 0 ? 'Start' : i === steps.length - 1 ? 'Done' : `Step ${i}`)));
</script>

<div class="rr">
	<div class="top ui">
		<Segmented
			bind:value={preset}
			label="matrix"
			options={(Object.keys(presets) as PresetKey[]).map((k) => ({ value: k, label: presets[k].label }))}
		/>
		<Segmented
			bind:value={field}
			label="numbers"
			options={[
				{ value: 'Q', label: 'over ℚ (fractions)' },
				{ value: 'F2', label: 'over ℤ/2 (bits)' }
			]}
		/>
	</div>

	<div class="op">
		{#if cur.tex}
			<TeX tex={cur.tex} />
		{:else if step === 0}
			<span class="muted ui">start</span>
		{:else if last}
			<span class="muted ui">reduced row echelon form</span>
		{:else}
			<span class="muted ui">no row operation needed</span>
		{/if}
	</div>

	<div class="matrix">
		<MatrixView
			{M}
			{rowLabels}
			{colLabels}
			highlightRows={cur.changed}
			highlightCols={cur.col !== null ? [cur.col] : []}
			{cellClass}
			format={fracString}
		/>
	</div>

	<p class="note ui">{cur.note}</p>

	{#if last}
		<div class="summary ui">
			<div class="s-row">
				<span class="k">rank</span>
				<span class="v"><TeX tex={`${result.rank}`} /> <span class="dim">(number of pivots)</span></span>
			</div>
			<div class="s-row">
				<span class="k gold">image</span>
				<span class="v">
					{#if result.pivotCols.length}
						spanned by the pivot columns of the original matrix:
						<TeX tex={result.pivotCols.map((j) => colTeX(j)).join(',\\ ')} />
					{:else}
						just <TeX tex={'\\{\\mathbf 0\\}'} />
					{/if}
				</span>
			</div>
			<div class="s-row">
				<span class="k teal">kernel</span>
				<span class="v">
					{#if result.kernelBasis.length}
						one basis vector per free variable
						(<TeX tex={result.freeCols.map((j) => `x_{${j + 1}}`).join(', ')} />):
						<TeX tex={result.kernelBasis.map(vecTeX).join(',\\ ')} />
					{:else}
						only <TeX tex={'\\mathbf 0'} /> — there are no free variables
					{/if}
				</span>
			</div>
			<div class="s-row">
				<span class="k">check</span>
				<span class="v"
					><TeX
						tex={`\\underbrace{${n}}_{\\text{columns}} = \\underbrace{${result.rank}}_{\\text{rank}} + \\underbrace{${result.kernelBasis.length}}_{\\text{nullity}}\\quad\\text{over } ${fieldName}`}
					/></span
				>
			</div>
		</div>
	{/if}

	<div class="ctl">
		<StepControls bind:step count={steps.length} {labels} interval={2200} />
	</div>
</div>

<style>
	.rr {
		padding: 1rem 1.2rem 1rem;
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.8rem;
		justify-content: center;
		margin-bottom: 0.9rem;
	}
	.op {
		text-align: center;
		min-height: 2rem;
		font-size: 1.05rem;
		color: var(--gold-bright);
		margin-bottom: 0.3rem;
		overflow-x: auto;
	}
	.muted {
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.matrix {
		display: flex;
		justify-content: center;
		font-size: 1.05rem;
	}
	/* the reading column styles every <th> as an uppercase table header;
	   MatrixView's TeX labels must not be uppercased */
	.matrix :global(th) {
		text-transform: none;
		letter-spacing: normal;
		font-size: 0.9rem;
		border: 0;
	}
	.matrix :global(tbody tr:hover) {
		background: none;
	}
	.note {
		text-align: center;
		color: var(--ink-dim);
		font-size: 0.84rem;
		max-width: 34rem;
		margin: 0.7rem auto 0.6rem;
		min-height: 2.6em;
		line-height: 1.5;
	}
	.summary {
		max-width: 38rem;
		margin: 0.2rem auto 0.8rem;
		padding: 0.7rem 0.9rem;
		border-radius: 10px;
		border: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.5);
		font-size: 0.84rem;
		color: var(--ink);
		animation: fade 0.4s var(--ease);
	}
	@keyframes fade {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
	}
	.s-row {
		display: grid;
		grid-template-columns: 4.2rem minmax(0, 1fr);
		gap: 0.6rem;
		align-items: baseline;
		padding: 0.25rem 0;
	}
	.s-row .v {
		overflow-x: auto;
		overflow-y: hidden;
	}
	.k {
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
		font-weight: 650;
	}
	.k.gold {
		color: var(--gold-bright);
	}
	.k.teal {
		color: var(--teal);
	}
	.dim {
		color: var(--ink-faint);
	}
	.ctl {
		display: flex;
		justify-content: center;
	}
</style>
