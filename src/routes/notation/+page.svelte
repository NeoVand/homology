<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import { chapterHref } from '$lib/util/paths';
	let { data } = $props();
</script>

<svelte:head>
	<title>Notation · Homology &amp; Cohomology</title>
	<meta name="description" content="Every symbol in the book: how to read it aloud, what it means, and where it is introduced." />
</svelte:head>

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Reference</p>
		<h1 class="gold-text">Notation</h1>
		<p class="sub">How to read every symbol aloud, what it means, and where it first appears.</p>
		<Ornament width={200} />
	</header>

	<nav class="jump ui" aria-label="Sections">
		{#each data.groups as g, i (g.title)}
			<a href="#n-{i}">{g.title}</a>
		{/each}
	</nav>

	{#each data.groups as g, i (g.title)}
		<section id="n-{i}" class="group">
			<h2>{g.title}</h2>
			<div class="table-wrap">
				<table>
					<thead>
						<tr><th>Symbol</th><th>Read aloud</th><th>Meaning</th><th>Introduced</th></tr>
					</thead>
					<tbody>
						{#each g.rows as r (r.read + r.chapter)}
							<tr>
								<td class="sym">{@html r.html}</td>
								<td class="read">{r.read}</td>
								<td class="mean">{r.meaning}</td>
								<td class="ch ui"><a href={chapterHref(r.chapter)}>§{r.num}</a></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>
	{/each}
</main>

<style>
	.wrap {
		max-width: 64rem;
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
		margin: 1rem 0 1rem;
	}
	.jump a {
		font-size: 0.78rem;
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
		font-size: 1.4rem;
		letter-spacing: 0.06em;
		color: var(--gold-bright);
		margin: 0 0 0.8rem;
	}
	.table-wrap {
		overflow-x: auto;
		border-radius: var(--radius-sm);
		border: 1px solid var(--line-faint);
		background: rgba(8, 12, 24, 0.6);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}
	th {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		text-align: left;
		padding: 0.6rem 0.9rem;
		border-bottom: 1px solid var(--line);
		font-weight: 600;
	}
	td {
		padding: 0.6rem 0.9rem;
		border-bottom: 1px solid var(--line-faint);
		vertical-align: middle;
	}
	tbody tr:last-child td {
		border-bottom: 0;
	}
	tbody tr:hover {
		background: rgba(216, 178, 110, 0.04);
	}
	.sym {
		white-space: nowrap;
		color: var(--ink-bright);
		font-size: 1.05rem;
	}
	.read {
		color: var(--ink);
		font-style: italic;
	}
	.mean {
		color: var(--ink-dim);
	}
	.ch a {
		color: var(--gold);
		text-decoration: none;
		font-size: 0.82rem;
		white-space: nowrap;
	}
	.ch a:hover {
		color: var(--gold-pale);
	}
	@media (max-width: 640px) {
		table,
		thead,
		tbody,
		tr,
		td {
			display: block;
		}
		thead {
			display: none;
		}
		tr {
			padding: 0.7rem 0.9rem;
			border-bottom: 1px solid var(--line-faint);
		}
		td {
			border: 0;
			padding: 0.1rem 0;
		}
		.sym {
			font-size: 1.15rem;
			margin-bottom: 0.2rem;
		}
	}
</style>
