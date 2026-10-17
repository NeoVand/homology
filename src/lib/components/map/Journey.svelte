<script lang="ts">
	// How far the reader has come, and where to carry on: the map's panel when no
	// station is in focus, and the strip above the map on smaller screens.
	import { onMount } from 'svelte';
	import { chapters, chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { progress } from '$lib/stores/progress.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ArrowRightIcon } from '$lib/icons';
	import { nextChapter } from './layout';

	let { strip = false }: { strip?: boolean } = $props();

	// progress lives in this browser only: count it once the page is live, so
	// that the prerendered page and the hydrated one agree
	let ready = $state(false);
	onMount(() => (ready = true));

	const visited = $derived(ready ? progress.visited : {});
	const seen = $derived(chapters.filter((c) => visited[c.id] !== undefined).length);
	const next = $derived(chapterById.get(nextChapter(visited) ?? ''));
	const left = $derived(chapters.reduce((m, c) => m + (visited[c.id] === undefined ? c.minutes : 0), 0));
	function hours(m: number) {
		const h = Math.round(m / 30) / 2;
		return `${Math.floor(h) || ''}${h % 1 ? '½' : ''} hour${h > 1 ? 's' : ''}`;
	}
</script>

<div class="journey ui" class:strip>
	<div class="head">
		<span class="eyebrow">Your journey</span>
		<span class="count"><b class="nums">{seen}</b> of {chapters.length} chapters visited</span>
	</div>
	<div class="bar" role="progressbar" aria-label="Chapters visited" aria-valuemin={0} aria-valuemax={chapters.length} aria-valuenow={seen}>
		<i style="width:{(100 * seen) / chapters.length}%"></i>
	</div>
	<p class="time">
		{#if !next}You have visited every chapter. Welcome back.{:else if seen}About {hours(left)} of reading still ahead.{:else}About {hours(
				left
			)} of reading in all, at an unhurried pace.{/if}
	</p>
	{#if next}
		<a class="go" href={chapterHref(next.id)}>
			<span class="go-label">{seen ? 'Continue with' : 'Begin with'}</span>
			<span class="go-ch"><span class="nums go-num">{next.num}</span>{next.title}</span>
			<Icon icon={ArrowRightIcon} size={17} />
		</a>
	{/if}
</div>

<style>
	.journey {
		display: grid;
		gap: 0.55rem;
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.eyebrow {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.count {
		font-size: 0.88rem;
		color: var(--ink-dim);
	}
	.count b {
		font-family: var(--font-display);
		font-size: 1.55rem;
		font-weight: 500;
		color: var(--gold-bright);
		margin-right: 0.2rem;
	}
	.bar {
		height: 4px;
		border-radius: 4px;
		background: rgba(216, 178, 110, 0.13);
		overflow: hidden;
	}
	.bar i {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: linear-gradient(90deg, var(--gold-deep), var(--gold-bright));
		box-shadow: 0 0 10px var(--gold-glow);
		transition: width 0.6s var(--ease);
	}
	.time {
		margin: 0;
		font-size: 0.8rem;
		color: var(--ink-faint);
		line-height: 1.5;
	}
	.go {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 0.1rem 0.6rem;
		margin-top: 0.2rem;
		padding: 0.65rem 0.8rem;
		border: 1px solid var(--line);
		border-radius: var(--radius-sm);
		background: rgba(216, 178, 110, 0.05);
		color: var(--ink);
		text-decoration: none;
		transition:
			border-color 0.2s,
			background 0.2s;
	}
	.go:hover {
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.1);
	}
	.go :global(svg) {
		grid-row: 1 / 3;
		grid-column: 2;
		color: var(--gold);
		transition: transform 0.2s var(--ease);
	}
	.go:hover :global(svg) {
		transform: translateX(3px);
	}
	.go-label {
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.go-ch {
		font-family: var(--font-elegant);
		font-size: 1.12rem;
		font-weight: 600;
		line-height: 1.25;
		color: var(--gold-pale);
	}
	.go-num {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--gold);
		margin-right: 0.45rem;
	}

	/* above the map, on screens without room for the panel beside it */
	.strip {
		grid-template-columns: auto minmax(8rem, 1fr) auto;
		align-items: center;
		gap: 0.4rem 1.4rem;
	}
	.strip .head {
		flex-direction: row;
		align-items: baseline;
		gap: 0.8rem;
	}
	.strip .time {
		display: none;
	}
	.strip .go {
		margin: 0;
	}
	@media (max-width: 759px) {
		.strip {
			grid-template-columns: 1fr;
		}
		.strip .head {
			justify-content: space-between;
		}
	}
</style>
