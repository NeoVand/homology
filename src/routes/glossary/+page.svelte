<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { SearchIcon } from '$lib/icons';
	import { chapterHref } from '$lib/util/paths';

	let { data } = $props();

	let q = $state('');
	const norm = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase();
	const filtered = $derived(
		q.trim()
			? data.entries.filter((e) => norm(e.term).includes(norm(q.trim())) || norm(e.html).includes(norm(q.trim())))
			: data.entries
	);
	const letterOf = (t: string) => {
		const c = norm(t).replace(/[^a-z]/g, '')[0] ?? '#';
		return c.toUpperCase();
	};
	const groups = $derived.by(() => {
		const m = new Map<string, typeof data.entries>();
		for (const e of filtered) {
			const L = letterOf(e.term);
			if (!m.has(L)) m.set(L, []);
			m.get(L)!.push(e);
		}
		return [...m.entries()];
	});
	const termOf = (k: string) => data.entries.find((e) => e.key === k)?.term ?? k;
</script>

<svelte:head>
	<title>Glossary · Homology &amp; Cohomology</title>
	<meta name="description" content="Every term in the book, defined in plain words, with a link to where it is introduced." />
</svelte:head>

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Reference</p>
		<h1 class="gold-text">Glossary</h1>
		<p class="sub">Every term in the book, in plain words — with a link to the chapter where it first appears.</p>
		<Ornament width={200} />
	</header>

	<div class="tools ui">
		<label class="search">
			<Icon icon={SearchIcon} size={17} />
			<input type="search" placeholder="Search {data.entries.length} terms…" bind:value={q} aria-label="Search the glossary" />
		</label>
		<nav class="letters" aria-label="Jump to letter">
			{#each groups as [L] (L)}
				<a href="#letter-{L}">{L}</a>
			{/each}
		</nav>
	</div>

	{#if !filtered.length}
		<p class="empty">No terms match “{q}”.</p>
	{/if}

	{#each groups as [L, items] (L)}
		<section class="group" id="letter-{L}">
			<h2 class="letter">{L}</h2>
			<dl>
				{#each items as e (e.key)}
					<div class="entry" id={e.key}>
						<dt>{e.term}</dt>
						<dd>
							<div class="def">{@html e.html}</div>
							<div class="meta ui">
								{#if e.num}
									<a href={chapterHref(e.chapter, e.anchor ?? undefined)}>§{e.num} {e.title}</a>
								{/if}
								{#if e.see.length}
									<span class="see"
										>See also:
										{#each e.see as k, i (k)}<a href={'#' + k}>{termOf(k)}</a>{i < e.see.length - 1 ? ', ' : ''}{/each}
									</span>
								{/if}
							</div>
						</dd>
					</div>
				{/each}
			</dl>
		</section>
	{/each}
</main>

<style>
	.wrap {
		max-width: 52rem;
		margin: 0 auto;
		padding: 0 1.25rem 5rem;
	}
	.head {
		text-align: center;
		padding: 3.5rem 0 1.5rem;
	}
	.head h1 {
		font-family: var(--font-display);
		font-size: clamp(2.4rem, 1.6rem + 3vw, 3.6rem);
		letter-spacing: 0.04em;
		margin: 0.6rem 0 0.6rem;
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
	.tools {
		position: sticky;
		top: var(--topbar-h);
		z-index: 5;
		padding: 0.9rem 0;
		background: linear-gradient(180deg, rgba(5, 8, 15, 0.95) 70%, rgba(5, 8, 15, 0));
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.search {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.9rem;
		border-radius: 12px;
		border: 1px solid var(--line);
		background: rgba(12, 18, 34, 0.9);
		color: var(--ink-faint);
	}
	.search:focus-within {
		border-color: var(--gold);
	}
	.search input {
		flex: 1;
		background: transparent;
		border: 0;
		outline: none;
		color: var(--ink-bright);
		font-size: 0.95rem;
		font-family: var(--font-ui);
	}
	.letters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
	}
	.letters a {
		min-width: 1.8rem;
		text-align: center;
		padding: 0.2rem 0.3rem;
		border-radius: 6px;
		font-family: var(--font-display);
		font-size: 0.85rem;
		color: var(--gold);
		text-decoration: none;
	}
	.letters a:hover {
		background: rgba(216, 178, 110, 0.12);
		color: var(--gold-pale);
	}
	.empty {
		text-align: center;
		color: var(--ink-faint);
		margin: 3rem 0;
	}
	.group {
		margin-top: 2.2rem;
		scroll-margin-top: calc(var(--topbar-h) + 7rem);
	}
	.letter {
		font-family: var(--font-display);
		font-size: 2rem;
		color: var(--gold-deep);
		border-bottom: 1px solid var(--line-faint);
		padding-bottom: 0.3rem;
		margin-bottom: 0.4rem;
	}
	dl {
		margin: 0;
	}
	.entry {
		padding: 1rem 0;
		border-bottom: 1px solid var(--line-faint);
		scroll-margin-top: calc(var(--topbar-h) + 7rem);
	}
	.entry:target {
		background: linear-gradient(90deg, rgba(216, 178, 110, 0.1), transparent);
		border-radius: 8px;
	}
	dt {
		font-family: var(--font-elegant);
		font-weight: 600;
		font-size: 1.35rem;
		color: var(--gold-bright);
		margin-bottom: 0.25rem;
	}
	dd {
		margin: 0;
	}
	.def {
		color: var(--ink);
		line-height: 1.65;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.2rem;
		margin-top: 0.45rem;
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.meta a {
		color: var(--gold);
		text-decoration: none;
	}
	.meta a:hover {
		color: var(--gold-pale);
		text-decoration: underline;
	}
</style>
