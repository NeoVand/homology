<script lang="ts">
	// A filterable dictionary of the book's symbols (or of its Greek letters),
	// each with how to say it aloud and what it means.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';
	import { chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { categories, greek, symbols, type Cat } from './symbols';

	let { mode = 'symbols' }: { mode?: 'symbols' | 'greek' } = $props();
	let cat = $state<Cat | 'all'>('all');
	const shown = $derived(cat === 'all' ? symbols : symbols.filter((s) => s.cat === cat));
</script>

{#if mode === 'symbols'}
	<div class="grid">
		{#each shown as s (s.tex + s.say)}
			{@const ch = s.where ? chapterById.get(s.where) : undefined}
			<div class="cell">
				<div class="glyph">{@html tex(s.tex)}</div>
				<div class="say">“{s.say}”</div>
				<div class="mean">{@html renderMathInText(s.mean)}</div>
				{#if ch}<a class="where ui" href={chapterHref(ch.id)}>§{ch.num}</a>{/if}
			</div>
		{/each}
	</div>
	<Controls>
		<Segmented bind:value={cat} options={categories} label="Filter symbols" />
		<span class="count ui">{shown.length} symbols</span>
	</Controls>
{:else}
	<div class="grid greek">
		{#each greek as g (g.name)}
			<div class="cell">
				<div class="glyph big">{@html tex(g.lower)}{#if g.upper}<span class="up">{@html tex(g.upper)}</span>{/if}</div>
				<div class="say"><span class="nm">{g.name}</span> · {g.say}</div>
				<div class="mean">{@html renderMathInText(g.role)}</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(11.5rem, 1fr));
		gap: 0.55rem;
		padding: 1.1rem 1.1rem 1rem;
	}
	.grid.greek {
		grid-template-columns: repeat(auto-fill, minmax(12.5rem, 1fr));
	}
	.cell {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.7rem 0.8rem 0.65rem;
		border-radius: 12px;
		border: 1px solid var(--line-faint);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01));
		transition:
			border-color 0.2s var(--ease),
			transform 0.2s var(--ease);
	}
	.cell:hover {
		border-color: var(--line-strong);
		transform: translateY(-1px);
	}
	.glyph {
		font-size: 1.45rem;
		color: var(--gold-bright);
		min-height: 2.1rem;
		display: flex;
		align-items: center;
		gap: 0.7rem;
	}
	.glyph.big {
		font-size: 2rem;
	}
	.up {
		font-size: 0.8em;
		color: var(--gold);
	}
	.say {
		font-family: var(--font-elegant);
		font-size: 1.05rem;
		font-style: italic;
		color: var(--ink-bright);
		line-height: 1.3;
	}
	.nm {
		font-style: normal;
		font-weight: 600;
	}
	.mean {
		font-size: 0.86rem;
		line-height: 1.45;
		color: var(--ink-dim);
	}
	.where {
		position: absolute;
		top: 0.55rem;
		right: 0.65rem;
		font-size: 0.66rem;
		color: var(--ink-faint);
		text-decoration: none;
		letter-spacing: 0.04em;
	}
	.where:hover {
		color: var(--gold);
	}
	.count {
		font-size: 0.74rem;
		color: var(--ink-faint);
		margin-left: auto;
	}
</style>
