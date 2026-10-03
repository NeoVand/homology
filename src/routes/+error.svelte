<script lang="ts">
	import { page } from '$app/state';
	import { href } from '$lib/util/paths';
	import Ornament from '$lib/components/layout/Ornament.svelte';
</script>

<svelte:head><title>Lost in space · Homology &amp; Cohomology</title></svelte:head>

<main class="err">
	<p class="eyebrow">{page.status}</p>
	<h1 class="gold-text">This page is a hole</h1>
	<p class="sub">
		A cycle with nothing inside it. The page you were looking for does not exist — but every chapter is one click away.
	</p>
	<Ornament width={200} />
	<p class="links ui">
		<a href={href('/')}>Home</a>
		<span>·</span>
		<a href={href('/map/')}>Map of the journey</a>
		<span>·</span>
		<a href={href('/glossary/')}>Glossary</a>
	</p>
</main>

<style>
	.err {
		max-width: 40rem;
		margin: 0 auto;
		padding: 8rem 1.25rem;
		text-align: center;
	}
	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.2rem, 1.6rem + 2.6vw, 3.4rem);
		margin: 0.6rem 0 1rem;
	}
	.sub {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 1.3rem;
		color: var(--ink-dim);
		margin-bottom: 1.6rem;
	}
	.err :global(.ornament) {
		margin: 0 auto 1.6rem;
	}
	.links {
		display: flex;
		justify-content: center;
		gap: 0.7rem;
		font-size: 0.9rem;
		color: var(--ink-faint);
	}
	.links a {
		color: var(--gold-bright);
		text-decoration: none;
	}
</style>
