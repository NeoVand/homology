<script lang="ts">
	// An interactive matrix: hover/click cells, highlight rows and columns,
	// optional TeX headers for rows (e.g. edges) and columns (e.g. triangles).
	import { tex as renderTeX } from '$lib/katex/render';

	let {
		M,
		rowLabels,
		colLabels,
		highlightRows = [],
		highlightCols = [],
		cellClass,
		onhover,
		onclick,
		format = (v: number) => (v === 0 ? '0' : v > 0 ? String(v) : '−' + Math.abs(v)),
		dimZeros = true,
		caption
	}: {
		M: number[][];
		/** TeX labels for rows */
		rowLabels?: string[];
		/** TeX labels for columns */
		colLabels?: string[];
		highlightRows?: number[];
		highlightCols?: number[];
		/** extra class per cell, e.g. "pivot", "gold", "teal" */
		cellClass?: (i: number, j: number) => string | undefined;
		onhover?: (i: number | null, j: number | null) => void;
		onclick?: (i: number, j: number) => void;
		format?: (v: number) => string;
		dimZeros?: boolean;
		/** TeX shown to the left of the matrix, e.g. "\\partial_2 =" */
		caption?: string;
	} = $props();

	let hi = $state<number | null>(null);
	let hj = $state<number | null>(null);
	const hr = $derived(new Set(highlightRows));
	const hc = $derived(new Set(highlightCols));
</script>

<div class="mv ui">
	{#if caption}
		<div class="cap">{@html renderTeX(caption)}</div>
	{/if}
	<div class="scroll">
		<table onpointerleave={() => ((hi = hj = null), onhover?.(null, null))}>
			{#if colLabels}
				<thead>
					<tr>
						{#if rowLabels}<th></th>{/if}
						{#each colLabels as c, j (j)}
							<th class="ch" class:hl={hc.has(j) || hj === j}>{@html renderTeX(c)}</th>
						{/each}
					</tr>
				</thead>
			{/if}
			<tbody>
				{#each M as row, i (i)}
					<tr>
						{#if rowLabels}
							<th class="rh" class:hl={hr.has(i) || hi === i}>{@html renderTeX(rowLabels[i] ?? '')}</th>
						{/if}
						{#each row as v, j (j)}
							<td
								class="{cellClass?.(i, j) ?? ''}"
								class:zero={dimZeros && v === 0}
								class:rowhl={hr.has(i) || hi === i}
								class:colhl={hc.has(j) || hj === j}
								class:first={j === 0}
								class:last={j === row.length - 1}
								onpointerenter={() => ((hi = i), (hj = j), onhover?.(i, j))}
								onclick={() => onclick?.(i, j)}>{format(v)}</td
							>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.mv {
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
		font-size: 0.86rem;
		margin: 0;
		width: auto;
	}
	/* (doubled class = higher specificity than the page-wide .prose table styles) */
	.mv.mv th {
		font-family: var(--font-body);
		font-size: 0.86rem;
		font-weight: 400;
		letter-spacing: normal;
		text-transform: none;
		text-align: center;
		padding: 0.25rem 0.45rem;
		color: var(--ink-faint);
		border: 0;
		background: none;
		transition: color 0.15s;
		white-space: nowrap;
	}
	th :global(.katex) {
		font-size: 0.95em;
	}
	.mv.mv th.hl {
		color: var(--gold-bright);
	}
	.mv.mv .rh {
		text-align: right;
	}
	.mv.mv tr:hover {
		background: none;
	}
	.mv.mv td {
		min-width: 2.1rem;
		text-align: center;
		padding: 0.32rem 0.4rem;
		color: var(--ink-bright);
		border: 0;
		transition: background 0.12s;
		cursor: default;
	}
	td.zero {
		color: var(--ink-ghost);
	}
	td.first {
		border-left: 1.5px solid var(--ink-dim);
	}
	td.last {
		border-right: 1.5px solid var(--ink-dim);
	}
	tbody tr:first-child td.first {
		border-top-left-radius: 6px;
		box-shadow: inset 6px 1.5px 0 -4.5px var(--ink-dim);
	}
	tbody tr:first-child td.last {
		border-top-right-radius: 6px;
		box-shadow: inset -6px 1.5px 0 -4.5px var(--ink-dim);
	}
	tbody tr:last-child td.first {
		border-bottom-left-radius: 6px;
		box-shadow: inset 6px -1.5px 0 -4.5px var(--ink-dim);
	}
	tbody tr:last-child td.last {
		border-bottom-right-radius: 6px;
		box-shadow: inset -6px -1.5px 0 -4.5px var(--ink-dim);
	}
	td.rowhl,
	td.colhl {
		background: rgba(216, 178, 110, 0.08);
	}
	td.rowhl.colhl {
		background: rgba(216, 178, 110, 0.22);
	}
	td.gold {
		color: var(--gold-bright);
		font-weight: 650;
	}
	td.teal {
		color: var(--teal);
		font-weight: 650;
	}
	td.violet {
		color: var(--violet);
		font-weight: 650;
	}
	td.rose {
		color: var(--rose);
		font-weight: 650;
	}
	td.pivot {
		background: rgba(216, 178, 110, 0.28);
		color: var(--gold-pale);
		font-weight: 700;
		border-radius: 4px;
	}
</style>
