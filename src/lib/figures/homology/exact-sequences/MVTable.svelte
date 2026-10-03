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

	const sub = (s: string, n: number) => s.replaceAll('_n', `_{${n}}`);
</script>

<div class="mvt ui" role="table" aria-label="Mayer–Vietoris sequence">
	{#each rows as row, r (row.n)}
		<div class="row" role="row">
			{#each row.cells as c, j (j)}
				<div class="cell {c.hl ?? ''}" class:shown={c.shown} role="cell">
					<span class="name">{@html render(sub(heads[j], row.n))}</span>
					<span class="eq">{@html render('=')}</span>
					<span class="val">{@html render(c.shown ? c.tex : '?')}</span>
				</div>
				{#if j < 2}
					<div class="arrow" aria-hidden="true">
						<span class="m">{@html render(maps[j])}</span>
						<span class="a">→</span>
					</div>
				{/if}
			{/each}
		</div>
		{#if connecting && r < rows.length - 1}
			<div class="conn" class:hot={hlConnect === row.n} aria-hidden="true">
				<svg viewBox="0 0 400 26" preserveAspectRatio="none"><path d="M 392 2 C 392 14, 380 13, 200 13 C 20 13, 8 13, 8 24" /></svg>
				<span class="lab">{@html render('\\partial')}</span>
			</div>
		{/if}
	{/each}
</div>

<style>
	.mvt {
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0.6rem 0.9rem 0.8rem;
		font-size: 0.86rem;
		overflow-x: auto;
	}
	.row {
		display: grid;
		grid-template-columns: 1fr auto 1.25fr auto 1fr;
		align-items: center;
		gap: 0.3rem;
		min-width: 33rem;
	}
	.cell {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 0.3rem;
		padding: 0.42rem 0.5rem;
		border-radius: 8px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		white-space: nowrap;
		transition:
			background 0.35s var(--ease),
			border-color 0.35s var(--ease),
			color 0.35s;
	}
	.cell .val {
		color: var(--ink-faint);
		min-width: 1.4em;
		text-align: left;
	}
	.cell.shown .val {
		color: var(--ink-bright);
	}
	.cell.gold {
		border-color: rgba(244, 215, 156, 0.7);
		background: rgba(216, 178, 110, 0.12);
	}
	.cell.gold .val {
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
	}
	.cell.green .val {
		color: var(--green);
	}
	.arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		line-height: 1;
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.arrow .a {
		font-size: 1rem;
	}
	.conn {
		position: relative;
		height: 1.6rem;
		min-width: 33rem;
	}
	.conn svg {
		position: absolute;
		left: 9%;
		right: 9%;
		top: 0;
		width: 82%;
		height: 100%;
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
		left: 50%;
		top: 0.15rem;
		transform: translateX(-50%);
		color: var(--ink-dim);
		font-size: 0.8rem;
		background: var(--bg-1);
		padding: 0 0.3rem;
	}
	.conn.hot .lab {
		color: var(--gold-bright);
	}
</style>
