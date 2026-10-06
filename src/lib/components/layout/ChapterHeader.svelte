<script lang="ts">
	import type { Chapter, Part } from '$lib/content/toc';
	import { chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import Ornament from './Ornament.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ClockIcon } from '$lib/icons';

	let { chapter }: { chapter: Chapter & { part: Part } } = $props();
	const prereqs = $derived(chapter.prereqs.map((id) => chapterById.get(id)).filter((c) => !!c));
</script>

<header class="ch-head" style="--pc:{chapter.part.color}">
	<div class="eyebrow">
		<span>Part {chapter.part.numeral}</span>
		<span class="dot">·</span>
		<span>{chapter.part.title}</span>
	</div>
	<div class="chnum ui nums">Chapter {chapter.num}</div>
	<h1 class="title gold-text">{chapter.title}</h1>
	<p class="subtitle">{chapter.subtitle}</p>
	<Ornament width={240} class="orn" />
	<div class="meta ui">
		<span class="time">
			<Icon icon={ClockIcon} size={15} />
			about {chapter.minutes} min
		</span>
		{#if prereqs.length}
			<span class="pre">
				<span class="lbl">Builds on</span>
				{#each prereqs as p (p.id)}
					<a class="chip" href={chapterHref(p.id)}><span class="nums">{p.num}</span> {p.title}</a>
				{/each}
			</span>
		{/if}
	</div>
</header>

<style>
	.ch-head {
		text-align: center;
		padding: clamp(2.5rem, 6vw, 4.5rem) 0 2.2rem;
		max-width: 50rem;
		margin: 0 auto;
	}
	.eyebrow {
		display: inline-flex;
		gap: 0.6em;
		color: var(--pc);
		margin-bottom: 0.9rem;
	}
	.dot {
		opacity: 0.6;
	}
	.chnum {
		font-size: 0.8rem;
		letter-spacing: 0.3em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-bottom: 0.7rem;
	}
	.title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(2.1rem, 1.2rem + 3.6vw, 3.6rem);
		letter-spacing: 0.035em;
		line-height: 1.08;
		filter: drop-shadow(0 2px 18px rgba(242, 205, 135, 0.18));
	}
	.subtitle {
		font-family: var(--font-elegant);
		font-style: italic;
		font-weight: 500;
		font-size: clamp(1.2rem, 1rem + 0.8vw, 1.55rem);
		color: var(--ink-dim);
		margin: 0.9rem 0 1.4rem;
		letter-spacing: 0.01em;
	}
	.ch-head :global(.orn) {
		margin: 0 auto 1.4rem;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.6rem 1.2rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	.time {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.pre {
		display: inline-flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0.4rem;
	}
	.lbl {
		letter-spacing: 0.08em;
	}
	.chip {
		display: inline-flex;
		gap: 0.35rem;
		align-items: baseline;
		padding: 0.22rem 0.6rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--ink-dim);
		text-decoration: none;
		font-size: 0.76rem;
		transition: all 0.2s var(--ease);
	}
	.chip span {
		color: var(--gold);
	}
	.chip:hover {
		border-color: var(--gold);
		color: var(--gold-pale);
		background: rgba(216, 178, 110, 0.08);
	}
</style>
