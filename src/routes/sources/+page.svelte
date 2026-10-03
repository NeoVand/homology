<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import { sources } from '$lib/content/sources';
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
	</nav>

	{#each sources as g, i (g.title)}
		<section id="s-{i}" class="group">
			<h2>{g.title}</h2>
			<p class="intro">{g.intro}</p>
			<FurtherReading items={g.items} />
		</section>
	{/each}

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
	.colophon p {
		color: var(--ink-dim);
		line-height: 1.7;
	}
</style>
