<script lang="ts">
	// Pascal's triangle, rows 0–5. Row n+1 counts the faces of the n-simplex:
	// entry k+1 of that row is the number of k-dimensional faces.
	import Svg from '$lib/components/svg/Svg.svelte';
	import { binom } from './data';

	let {
		n = $bindable(3),
		k = $bindable(1)
	}: {
		n?: number;
		k?: number;
	} = $props();

	const rows = 6;
	const dx = 50;
	const dy = 40;
	const W = 330;
	const x0 = W / 2;
	const y0 = 26;
	const pos = (m: number, j: number) => [x0 + (j - m / 2) * dx, y0 + m * dy] as const;
</script>

<Svg viewBox="0 0 {W} {y0 + (rows - 1) * dy + 28}" maxHeight={300} label="Pascal's triangle; row n+1 counts the faces of the n-simplex">
	<!-- the active row -->
	{#if n + 1 < rows}
		{@const [ax] = pos(n + 1, 0)}
		{@const [bx, by] = pos(n + 1, n + 1)}
		<rect x={ax - 22} y={by - 16} width={bx - ax + 44} height="32" rx="16" class="rowpill" />
	{/if}
	{#each Array(rows) as _, m (m)}
		{#each Array(m + 1) as __, j (j)}
			{@const [x, y] = pos(m, j)}
			{@const active = m === n + 1 && j === k + 1}
			{@const inRow = m === n + 1}
			{@const pickable = m >= 1 && j >= 1}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<g
				class="entry"
				class:active
				class:inrow={inRow}
				class:empty={j === 0}
				class:pickable
				role={pickable ? 'button' : undefined}
				tabindex={pickable ? 0 : undefined}
				aria-label={pickable ? `${binom(m, j)} faces of dimension ${j - 1} in the ${m - 1}-simplex` : undefined}
				onclick={() => {
					if (!pickable) return;
					n = m - 1;
					k = j - 1;
				}}
				onkeydown={(e) => {
					if (pickable && (e.key === 'Enter' || e.key === ' ')) {
						e.preventDefault();
						n = m - 1;
						k = j - 1;
					}
				}}
			>
				<circle cx={x} cy={y} r={active ? 17 : 15} class="disc" />
				<text {x} y={y + 5} text-anchor="middle" class="num">{binom(m, j)}</text>
			</g>
		{/each}
	{/each}
</Svg>

<style>
	.rowpill {
		fill: rgba(216, 178, 110, 0.07);
		stroke: rgba(216, 178, 110, 0.35);
		stroke-width: 1;
	}
	.disc {
		fill: rgba(20, 28, 50, 0.85);
		stroke: rgba(216, 178, 110, 0.18);
		stroke-width: 1;
		transition: all 0.25s var(--ease);
	}
	.num {
		font-family: var(--font-ui);
		font-size: 14px !important;
		fill: var(--ink-dim) !important;
		pointer-events: none;
		font-variant-numeric: tabular-nums;
	}
	.entry.empty .num {
		fill: var(--ink-ghost) !important;
	}
	.entry.empty .disc {
		stroke-dasharray: 2 3;
	}
	.entry.inrow .num {
		fill: var(--ink-bright) !important;
	}
	.entry.pickable {
		cursor: pointer;
	}
	.entry.pickable:hover .disc,
	.entry.pickable:focus-visible .disc {
		stroke: var(--gold);
		fill: rgba(216, 178, 110, 0.12);
	}
	.entry:focus-visible {
		outline: none;
	}
	.entry.active .disc {
		fill: rgba(242, 208, 143, 0.22);
		stroke: var(--gold-bright);
		stroke-width: 2;
		filter: drop-shadow(0 0 6px rgba(242, 205, 135, 0.6));
	}
	.entry.active .num {
		fill: var(--gold-pale) !important;
		font-weight: 700;
	}
</style>
