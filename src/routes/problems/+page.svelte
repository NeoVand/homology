<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import { ASOF, problems, problemLabel, statusColor, statusText, type Problem } from '$lib/content/conjectures';
	import { chapterById, parts } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { renderMathInText } from '$lib/katex/render';

	// in book order: by the chapter each problem lives in
	const order = (p: Problem) => chapterById.get(p.chapter)?.index ?? 0;
	const byBook = [...problems].sort((a, b) => order(a) - order(b));
	const open = byBook.filter((p) => p.status === 'open' || p.status === 'claimed');
	const settled = byBook.filter((p) => p.status !== 'open' && p.status !== 'claimed');
	const partOf = (p: Problem) => chapterById.get(p.chapter)?.part;
	const openParts = parts.filter((pt) => open.some((p) => partOf(p)?.id === pt.id));
	const partName = (pt: (typeof parts)[number]) => (pt.numeral === '0' ? 'Prelude' : `Part ${pt.numeral} · ${pt.title}`);
</script>

<svelte:head>
	<title>Open problems · Homology &amp; Cohomology</title>
	<meta
		name="description"
		content="Questions nobody can answer yet, from every corner of the book — and a few famous ones that were answered, and how."
	/>
</svelte:head>

{#snippet card(p: Problem)}
	{@const ch = chapterById.get(p.chapter)}
	<li class="card" style="--s:{statusColor[p.status]}">
		<div class="top ui">
			<span class="kind">{problemLabel(p)}</span>
			<span class="badge">{statusText(p)}</span>
		</div>
		<h3><a href={chapterHref(p.chapter, `cj-${p.key}`)}>{p.name}</a></h3>
		<p class="statement">{@html renderMathInText(p.statement)}</p>
		<p class="meta ui">
			Posed by {p.posed.by}, {p.posed.year}{#if p.settled}; settled by {p.settled.by}, {p.settled.year}{/if}
			{#if ch}<a class="where" href={chapterHref(p.chapter, `cj-${p.key}`)}>§{ch.num} {ch.title}</a>{/if}
		</p>
	</li>
{/snippet}

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Reference</p>
		<h1 class="gold-text">Open Problems</h1>
		<p class="sub">Questions nobody can answer yet, from every corner of the book, and a few famous ones that were answered.</p>
		<Ornament width={200} />
	</header>

	<p class="lead">
		Every exercise in this book has an answer that someone already knows. These questions do not. Each sits in the chapter that
		gives you the ideas to understand it, usually with something small you can try. Some are centuries old, some only a few years;
		several fall to a single clever idea, and nobody knows which.
	</p>

	<nav class="jump ui" aria-label="Sections">
		{#each openParts as pt (pt.id)}<a href="#p-{pt.id}">{partName(pt)}</a>{/each}
		{#if settled.length}<a href="#settled">Settled</a>{/if}
	</nav>

	{#each openParts as pt (pt.id)}
		<section id="p-{pt.id}" class="group">
			<h2 style="--pc:{pt.color}">{partName(pt)}</h2>
			<ul class="cards">
				{#each open.filter((p) => partOf(p)?.id === pt.id) as p (p.key)}{@render card(p)}{/each}
			</ul>
		</section>
	{/each}

	{#if settled.length}
		<section id="settled" class="group">
			<h2>Settled</h2>
			<p class="intro">
				Conjectures that were proved, disproved, or shown to be beyond the reach of proof altogether: how each ended is part of the
				story.
			</p>
			<ul class="cards">
				{#each settled as p (p.key)}{@render card(p)}{/each}
			</ul>
		</section>
	{/if}

	<p class="asof ui">Statuses as of {ASOF}.</p>
</main>

<style>
	.wrap {
		max-width: 50rem;
		margin: 0 auto;
		padding: 0 1.25rem 5rem;
	}
	.head {
		text-align: center;
		padding: 3.5rem 0 1.5rem;
	}
	.head h1 {
		font-family: var(--font-display);
		font-size: clamp(2.1rem, 1.4rem + 2.8vw, 3.3rem);
		letter-spacing: 0.04em;
		margin: 0.6rem 0;
	}
	.sub {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 1.3rem;
		color: var(--ink-dim);
		margin: 0 0 1.4rem;
	}
	.head :global(.ornament) {
		margin: 0 auto;
	}
	.lead {
		font-size: 1.05rem;
		color: var(--ink);
		text-wrap: pretty;
	}
	.jump {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		margin: 1.4rem 0 0.5rem;
	}
	.jump a {
		font-size: 0.76rem;
		padding: 0.3rem 0.75rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		color: var(--ink-dim);
		text-decoration: none;
	}
	.jump a:hover {
		color: var(--gold-bright);
		border-color: var(--line);
	}
	.group {
		margin-top: 2.6rem;
		scroll-margin-top: calc(var(--topbar-h) + 1rem);
	}
	h2 {
		font-family: var(--font-display);
		font-size: 1.3rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--pc, var(--gold-bright));
		margin: 0 0 0.6rem;
	}
	.intro {
		color: var(--ink-dim);
		font-style: italic;
		margin: 0 0 0.6rem;
	}
	.cards {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.8rem;
	}
	.card {
		position: relative;
		padding: 0.9rem 1.1rem 0.7rem 1.2rem;
		border-radius: var(--radius-sm);
		border: 1px solid color-mix(in srgb, var(--rose) 20%, transparent);
		background:
			radial-gradient(110% 120% at 100% 0%, rgba(242, 141, 182, 0.07), transparent 60%),
			rgba(12, 14, 30, 0.7);
	}
	.card::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 0.8rem;
		bottom: 0.8rem;
		width: 2px;
		border-radius: 2px;
		background: var(--s);
		box-shadow: 0 0 10px color-mix(in srgb, var(--s) 60%, transparent);
	}
	.top {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: 0.72rem;
	}
	.kind {
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--rose);
	}
	.badge {
		padding: 0.08rem 0.55rem 0.1rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--s) 55%, transparent);
		background: color-mix(in srgb, var(--s) 14%, transparent);
		color: var(--s);
		font-weight: 600;
	}
	h3 {
		margin: 0.35rem 0 0.2rem;
		font-family: var(--font-elegant);
		font-size: 1.3rem;
		font-weight: 600;
	}
	h3 a {
		color: var(--ink-bright);
		text-decoration: none;
	}
	h3 a:hover {
		color: var(--gold-bright);
	}
	.statement {
		margin: 0 0 0.4rem;
		font-style: italic;
		color: var(--ink);
		text-wrap: pretty;
	}
	.statement :global(.katex) {
		font-style: normal;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.2rem 1rem;
		margin: 0;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.where {
		color: var(--gold);
		text-decoration: none;
	}
	.where:hover {
		color: var(--gold-bright);
	}
	.asof {
		margin-top: 3rem;
		text-align: center;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
</style>
