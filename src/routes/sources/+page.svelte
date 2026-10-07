<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import { sources } from '$lib/content/sources';
	import { authorList, bibliography, workLink, type Work } from '$lib/content/bib';
	import { chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';

	let { data } = $props();

	// every work the chapters cite, alphabetically by the first author's family name
	const sortName = (w: Work) => (w.label ?? w.authors[0]?.split(/\s+/).pop() ?? w.title).toLocaleLowerCase('en');
	const cited = $derived(
		[...bibliography.values()]
			.filter((w) => data.citedIn[w.key])
			.sort((a, b) => sortName(a).localeCompare(sortName(b), 'en') || String(a.year).localeCompare(String(b.year)))
	);
	const linkLabel = (w: Work) => (w.free ? 'free online' : w.url ? 'publisher' : w.doi ? 'doi' : 'arXiv');
</script>

<svelte:head>
	<title>Sources &amp; further reading · Homology &amp; Cohomology</title>
	<meta name="description" content="The books, papers, lectures and explainers this book draws on — and where to go next." />
</svelte:head>

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Reference</p>
		<h1 class="gold-text">Sources &amp; Further Reading</h1>
		<p class="sub">The books, papers, lectures and explainers this book stands on — and where to go next.</p>
		<Ornament width={200} />
	</header>

	<nav class="jump ui" aria-label="Sections">
		{#each sources as g, i (g.title)}
			<a href="#s-{i}">{g.title}</a>
		{/each}
		{#if cited.length}<a href="#works-cited">Works cited</a>{/if}
	</nav>

	{#each sources as g, i (g.title)}
		<section id="s-{i}" class="group">
			<h2>{g.title}</h2>
			<p class="intro">{g.intro}</p>
			<FurtherReading items={g.items} />
		</section>
	{/each}

	{#if cited.length}
		<section id="works-cited" class="group">
			<h2>Works cited</h2>
			<p class="intro">Every work the chapters cite, with the chapters that cite it.</p>
			<ol class="bib">
				{#each cited as w (w.key)}
					{@const link = workLink(w)}
					<li id="ref-{w.key}">
						<span class="who">{authorList(w)}</span>
						<span>({w.year}).</span>
						<cite>{w.title}.</cite>
						{#if w.venue}<span>{w.venue}.</span>{/if}
						{#if link}<a class="out ui" href={link} target="_blank" rel="noopener noreferrer">{linkLabel(w)}</a>{/if}
						<span class="where ui">
							{#each data.citedIn[w.key] as id (id)}
								{@const ch = chapterById.get(id)}
								{#if ch}<a href={chapterHref(id, 'references')}>{ch.num}</a>{/if}
							{/each}
						</span>
					</li>
				{/each}
			</ol>
		</section>
	{/if}

	<section class="group colophon">
		<h2>Colophon</h2>
		<p>
			Built with <a href="https://svelte.dev/docs/kit" target="_blank" rel="noopener noreferrer">SvelteKit</a>,
			<a href="https://threejs.org" target="_blank" rel="noopener noreferrer">three.js</a> and custom GLSL shaders, and
			<a href="https://katex.org" target="_blank" rel="noopener noreferrer">KaTeX</a> (all mathematics is typeset when
			the site is built). Type is set in Cinzel, Cormorant Garamond, Source Serif 4 and Inter. Every homology group,
			barcode and decomposition shown in an interactive figure is computed live by a small, tested engine written for
			this book.
		</p>
	</section>
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
	.jump {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		margin: 1rem 0;
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
		margin-top: 3rem;
		scroll-margin-top: calc(var(--topbar-h) + 1rem);
	}
	h2 {
		font-family: var(--font-display);
		font-size: 1.45rem;
		letter-spacing: 0.05em;
		color: var(--gold-bright);
		margin: 0 0 0.3rem;
	}
	.intro {
		color: var(--ink-dim);
		font-style: italic;
		margin: 0 0 0.6rem;
	}
	.group :global(a) {
		color: var(--gold-bright);
	}
	.bib {
		list-style: none;
		margin: 1rem 0 0;
		padding: 0;
		font-size: 0.92rem;
		line-height: 1.55;
		color: var(--ink-dim);
	}
	.bib li {
		padding: 0.55rem 0 0.55rem 1.4rem;
		text-indent: -1.4rem;
		border-bottom: 1px solid var(--line-faint);
		scroll-margin-top: calc(var(--topbar-h) + 1rem);
		text-wrap: pretty;
	}
	.bib li:target {
		color: var(--ink);
	}
	.bib .who {
		color: var(--ink);
	}
	.bib cite {
		font-style: italic;
		color: var(--ink-bright);
	}
	.bib .out {
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		text-decoration: none;
		white-space: nowrap;
	}
	.where {
		display: inline-flex;
		gap: 0.35rem;
		margin-left: 0.4rem;
		text-indent: 0;
	}
	.where a {
		font-size: 0.7rem;
		padding: 0.05rem 0.45rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		color: var(--ink-dim) !important;
		text-decoration: none;
	}
	.where a:hover {
		color: var(--gold-bright) !important;
		border-color: var(--line);
	}
	.colophon p {
		color: var(--ink-dim);
		line-height: 1.7;
	}
</style>
