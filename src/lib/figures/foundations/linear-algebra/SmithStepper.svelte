<script lang="ts">
	// The Smith normal form, step by step, using only integer row and column
	// operations. The final diagonal reveals ℤ^m / im A ≅ ℤ^(m−r) ⊕ ℤ/d₁ ⊕ ….
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { smithSteps, cokernelTeX, kernelTeX } from './smithsteps';
	import { smith } from '$lib/math/linalg';

	const presets = {
		parity: {
			label: 'parity',
			A: [
				[1, 1],
				[1, -1]
			]
		},
		six: {
			label: 'ℤ/2 ⊕ ℤ/3',
			A: [
				[2, 0],
				[0, 3]
			]
		},
		wide: {
			label: '2 × 3',
			A: [
				[1, 2, 3],
				[4, 5, 6]
			]
		},
		big: {
			label: '3 × 3',
			A: [
				[2, 4, 4],
				[-6, 6, 12],
				[10, -4, -16]
			]
		}
	} as const;
	type Key = keyof typeof presets;

	let key = $state<Key>('parity');
	let step = $state(0);

	const A = $derived(presets[key].A.map((r) => [...r]));
	const res = $derived(smithSteps(A));
	const cur = $derived(res.steps[Math.min(step, res.steps.length - 1)]);
	const last = $derived(step >= res.steps.length - 1);
	// cross-check with the shared engine (the tests also do this)
	const check = $derived(smith(A).diagonal.join(',') === res.diagonal.join(','));

	$effect(() => {
		void key;
		step = 0;
	});

	const rowLabels = $derived(A.map((_, i) => `R_{${i + 1}}`));
	const colLabels = $derived(A[0].map((_, j) => `C_{${j + 1}}`));

	function cellClass(i: number, j: number): string | undefined {
		if (i === j && i < cur.done) return 'gold';
		if (cur.pivot && cur.pivot[0] === i && cur.pivot[1] === j) return 'pivot';
		return undefined;
	}
	const labels = $derived(res.steps.map((_, i) => (i === 0 ? 'Start' : i === res.steps.length - 1 ? 'Done' : `Step ${i}`)));
	const diagTeX = $derived(`\\operatorname{diag}(${res.diagonal.join(',\\,') || '\\,'})`);
	const torsion = $derived(res.diagonal.filter((d) => d > 1));
</script>

<div class="snf">
	<div class="top ui">
		<Segmented
			bind:value={key}
			label="integer matrix"
			options={(Object.keys(presets) as Key[]).map((k) => ({ value: k, label: presets[k].label }))}
		/>
	</div>

	<div class="op">
		{#if cur.tex}
			<TeX tex={cur.tex} />
		{:else if step === 0}
			<span class="muted ui">start</span>
		{:else}
			<span class="muted ui">Smith normal form</span>
		{/if}
	</div>

	<div class="matrix">
		<MatrixView M={cur.M} {rowLabels} {colLabels} highlightRows={cur.rowsChanged} highlightCols={cur.colsChanged} {cellClass} />
	</div>

	<p class="note ui">{cur.note}</p>

	{#if last}
		<div class="summary ui">
			<div class="s-row">
				<span class="k">diagonal</span>
				<span class="v"><TeX tex={diagTeX} /> {#if check}<span class="ok">✓ agrees with the book’s engine</span>{/if}</span>
			</div>
			<div class="s-row">
				<span class="k gold">cokernel</span>
				<span class="v">
					<TeX tex={`\\mathbb Z^{${res.rows}} / \\operatorname{im} A \\;\\cong\\; ${cokernelTeX(res.diagonal, res.rows)}`} />
					{#if torsion.length}<span class="tor">— torsion: <TeX tex={torsion.map((d) => `\\mathbb Z/${d}`).join(' \\oplus ')} /></span>{/if}
				</span>
			</div>
			<div class="s-row">
				<span class="k teal">kernel</span>
				<span class="v"><TeX tex={`\\ker A \\;\\cong\\; ${kernelTeX(res.diagonal.length, res.cols)}`} /></span>
			</div>
			<div class="s-row">
				<span class="k">over ℚ</span>
				<span class="v">rank {res.diagonal.length}: every non-zero <TeX tex={'d_i'} /> could be divided away, and the torsion would be invisible.</span>
			</div>
		</div>
	{/if}

	<div class="ctl">
		<StepControls bind:step count={res.steps.length} {labels} interval={2000} />
	</div>
</div>

<style>
	.snf {
		padding: 1rem 1.2rem 1rem;
	}
	.top {
		display: flex;
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
		overflow-y: hidden;
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
		grid-template-columns: 4.6rem minmax(0, 1fr);
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
	.ok {
		color: var(--green);
		font-size: 0.74rem;
		margin-left: 0.5rem;
	}
	.tor {
		color: var(--rose);
		margin-left: 0.3rem;
	}
	.ctl {
		display: flex;
		justify-content: center;
	}
</style>
