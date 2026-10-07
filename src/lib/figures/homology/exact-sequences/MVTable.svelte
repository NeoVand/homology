<script lang="ts" module>
	export interface MVCell {
		/** TeX of the group, e.g. "\\mathbb Z" */
		tex: string;
		/** reveal the value? (otherwise a question mark is shown) */
		shown: boolean;
		/** emphasise this cell */
		hl?: 'gold' | 'teal' | 'rose' | 'violet' | 'green';
	}
	export interface MVRow {
		n: number;
		cells: [MVCell, MVCell, MVCell];
	}
</script>

<script lang="ts">
	// The Mayer–Vietoris long exact sequence laid out as a table: one row per degree,
	// read left to right, then down to the next row (the connecting map ∂).
	// Column headers are shown once; each cell holds just the group.
	import { tex as render } from '$lib/katex/render';

	let {
		rows,
		heads = ['H_n(U\\cap V)', 'H_n(U)\\oplus H_n(V)', 'H_n(X)'],
		maps = ['\\Phi', '\\Psi'],
		connecting = true,
		hlConnect = null
	}: {
		rows: MVRow[];
		heads?: string[];
		maps?: string[];
		connecting?: boolean;
		/** highlight the connecting arrow leaving row n */
		hlConnect?: number | null;
	} = $props();
</script>

<div class="mvt ui" role="table" aria-label="Mayer–Vietoris sequence">
	<div class="row head" role="row">
		<span class="deg" role="columnheader"></span>
		{#each heads as h, j (j)}
			<span class="h" role="columnheader">{@html render(h)}</span>
			{#if j < 2}
				<span class="arrow" aria-hidden="true"><span class="m">{@html render(maps[j])}</span></span>
			{/if}
		{/each}
	</div>
	{#each rows as row, r (row.n)}
		<div class="row" role="row">
			<span class="deg" role="rowheader">{@html render(`n=${row.n}`)}</span>
			{#each row.cells as c, j (j)}
				<span class="cell {c.hl ?? ''}" class:shown={c.shown} role="cell">{@html render(c.shown ? c.tex : '?')}</span>
				{#if j < 2}
					<span class="arrow" aria-hidden="true">→</span>
				{/if}
			{/each}
		</div>
		{#if connecting && r < rows.length - 1}
			<div class="conn" class:hot={hlConnect === row.n} aria-hidden="true">
				<span class="spacer"></span>
				<svg viewBox="0 0 400 22" preserveAspectRatio="none"><path d="M 392 1 C 392 11, 380 11, 200 11 C 20 11, 8 11, 8 21" /></svg>
				<span class="lab">{@html render('\\partial')}</span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.mvt {
		display: flex;
		flex-direction: column;
		padding: 0.6rem 0.9rem 0.8rem;
		font-size: 0.9rem;
		max-width: 40rem;
		margin: 0 auto;
		width: 100%;
	}
	.row {
		display: grid;
		grid-template-columns: 2.6rem minmax(0, 1fr) 1.2rem minmax(0, 1.25fr) 1.2rem minmax(0, 1fr);
		align-items: center;
		gap: 0.25rem;
	}
	.row.head {
		margin-bottom: 0.25rem;
		align-items: end;
	}
	.h {
		text-align: center;
		color: var(--ink-dim);
		font-size: 0.85rem;
		line-height: 1.3;
	}
	.deg {
		color: var(--ink-faint);
		font-size: 0.78rem;
		text-align: right;
		padding-right: 0.2rem;
	}
	.cell {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 2.1rem;
		padding: 0.3rem 0.35rem;
		border-radius: 8px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-faint);
		white-space: nowrap;
		transition:
			background 0.35s var(--ease),
			border-color 0.35s var(--ease),
			color 0.35s;
	}
	.cell.shown {
		color: var(--ink-bright);
	}
	.cell.gold {
		border-color: rgba(244, 215, 156, 0.7);
		background: rgba(216, 178, 110, 0.12);
		color: var(--gold-bright);
	}
	.cell.teal {
		border-color: rgba(95, 214, 207, 0.7);
		background: rgba(95, 214, 207, 0.1);
	}
	.cell.rose {
		border-color: rgba(242, 141, 182, 0.7);
		background: rgba(242, 141, 182, 0.1);
	}
	.cell.violet {
		border-color: rgba(164, 147, 255, 0.7);
		background: rgba(164, 147, 255, 0.1);
	}
	.cell.green {
		border-color: rgba(132, 217, 162, 0.75);
		background: rgba(132, 217, 162, 0.1);
		color: var(--green);
	}
	.arrow {
		text-align: center;
		color: var(--ink-faint);
		font-size: 0.95rem;
	}
	.arrow .m {
		font-size: 0.8rem;
	}
	.conn {
		position: relative;
		height: 1.3rem;
		display: grid;
		grid-template-columns: 2.6rem 1fr;
	}
	.conn svg {
		width: 100%;
		height: 100%;
		padding: 0 6%;
		overflow: visible;
	}
	.conn path {
		fill: none;
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.4;
		vector-effect: non-scaling-stroke;
	}
	.conn.hot path {
		stroke: var(--gold-bright);
		stroke-width: 2.2;
	}
	.conn .lab {
		position: absolute;
		left: calc(50% + 1.3rem);
		top: 0;
		transform: translateX(-50%);
		color: var(--ink-dim);
		font-size: 0.78rem;
		background: #0b1120;
		padding: 0 0.3rem;
		line-height: 1.2;
	}
	.conn.hot .lab {
		color: var(--gold-bright);
	}
	@container figure (max-width: 32.5rem) {
		.mvt {
			font-size: 0.8rem;
			padding: 0.5rem 0.4rem 0.7rem;
		}
		.row {
			grid-template-columns: 2.4rem minmax(0, 1fr) 0.9rem minmax(0, 1.25fr) 0.9rem minmax(0, 1fr);
			gap: 0.15rem;
		}
		.conn {
			grid-template-columns: 2.4rem 1fr;
		}
		.deg {
			white-space: nowrap;
			padding-right: 0.1rem;
		}
		.h {
			font-size: 0.74rem;
		}
		.cell {
			min-height: 1.9rem;
		}
	}
</style>
