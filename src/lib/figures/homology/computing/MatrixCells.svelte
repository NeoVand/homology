<script lang="ts">
	// A matrix display adapted from the shared MatrixView: cells are strings
	// (so fractions like 1/2 display exactly), with per-cell classes for pivots,
	// finished pivots and changed rows/columns.
	import { tex as renderTeX } from '$lib/katex/render';

	let {
		cells,
		rowLabels,
		colLabels,
		cellClass,
		highlightRows = [],
		highlightCols = [],
		caption,
		compact = false
	}: {
		cells: string[][];
		rowLabels?: string[];
		colLabels?: string[];
		cellClass?: (i: number, j: number) => string | undefined;
		highlightRows?: number[];
		highlightCols?: number[];
		caption?: string;
		compact?: boolean;
	} = $props();

	const hr = $derived(new Set(highlightRows));
	const hc = $derived(new Set(highlightCols));
</script>

<div class="mc ui" class:compact>
	{#if caption}
		<div class="cap">{@html renderTeX(caption)}</div>
	{/if}
	<div class="scroll">
		<table>
			{#if colLabels}
				<thead>
					<tr>
						{#if rowLabels}<th></th>{/if}
						{#each colLabels as c, j (j)}
							<th class="ch" class:hl={hc.has(j)}>{@html renderTeX(c)}</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody>
				{#each cells as row, i (i)}
					<tr>
						{#if rowLabels}
							<th class="rh" class:hl={hr.has(i)}>{@html renderTeX(rowLabels[i] ?? '')}</th>
						{/if}
						{#each row as v, j (j)}
							<td
								class={cellClass?.(i, j) ?? ''}
								class:zero={v === '0'}
								class:rowhl={hr.has(i)}
								class:colhl={hc.has(j)}
								class:first={j === 0}
								class:last={j === row.length - 1}>{v}</td
							>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.mc {
		display: flex;
		align-items: center;
		gap: 0.8rem;
		justify-content: center;
		max-width: 100%;
	}
	.cap {
		font-size: 1.1rem;
		color: var(--ink-bright);
		flex: none;
	}
	.scroll {
		overflow-x: auto;
		max-width: 100%;
		padding: 0.2rem;
	}
	table {
		border-collapse: separate;
		border-spacing: 0;
		font-variant-numeric: tabular-nums;
		font-size: 0.84rem;
		margin: 0 !important;
		width: auto !important;
	}
	.compact table {
		font-size: 0.74rem;
	}
	th {
		font-weight: 400;
		padding: 0.2rem 0.4rem !important;
		color: var(--ink-faint) !important;
		border: 0 !important;
		white-space: nowrap;
		text-transform: none !important;
		letter-spacing: 0 !important;
		font-size: 0.78rem !important;
	}
	th :global(.katex) {
		font-size: 0.92em;
	}
	th.hl {
		color: var(--gold-bright) !important;
	}
	.rh {
		text-align: right !important;
	}
	td {
		min-width: 1.9rem;
		text-align: center !important;
		padding: 0.26rem 0.35rem !important;
		color: var(--ink-bright);
		border: 0 !important;
		transition: background 0.25s var(--ease);
	}
	.compact td {
		min-width: 1.45rem;
		padding: 0.16rem 0.22rem !important;
	}
	td.zero {
		color: var(--ink-ghost);
	}
	td.first {
		border-left: 1.5px solid var(--ink-dim) !important;
	}
	td.last {
		border-right: 1.5px solid var(--ink-dim) !important;
	}
	td.rowhl,
	td.colhl {
		background: rgba(116, 169, 255, 0.1);
	}
	td.rowhl.colhl {
		background: rgba(116, 169, 255, 0.18);
	}
	td.pivot {
		background: rgba(216, 178, 110, 0.32) !important;
		color: var(--gold-pale);
		font-weight: 700;
		border-radius: 4px;
		box-shadow: 0 0 10px -2px var(--gold-glow);
	}
	td.done {
		color: var(--gold-bright);
		font-weight: 650;
		background: rgba(216, 178, 110, 0.1);
	}
	td.torsion {
		background: rgba(242, 141, 182, 0.3) !important;
		color: #ffd2e4;
		font-weight: 700;
		border-radius: 4px;
		box-shadow: 0 0 14px -2px rgba(242, 141, 182, 0.7);
	}
	td.faded {
		opacity: 0.45;
	}
</style>
