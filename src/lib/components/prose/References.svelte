<script lang="ts">
	// The works a chapter cites, in order of first citation. The list is built
	// from the chapter's <Cite> tags when the site is built (see the book layout).
	import { authorList, getWork, workLink, type Work } from '$lib/content/bib';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ArrowRightIcon } from '$lib/icons';

	let { keys }: { keys: string[] } = $props();
	const works = $derived(keys.map(getWork).filter((w): w is Work => !!w));
	const linkLabel = (w: Work) => (w.free ? 'free online' : w.url ? 'publisher' : w.doi ? 'doi' : 'arXiv');
</script>

{#if works.length}
	<section class="references" id="references" aria-labelledby="references-h">
		<h2 id="references-h" class="ui">References</h2>
		<ol>
			{#each works as w (w.key)}
				{@const link = workLink(w)}
				<li id="ref-{w.key}">
					<span class="who">{authorList(w)}</span>
					<span class="yr">({w.year}).</span>
					<cite>{w.title}.</cite>
					{#if w.venue}<span class="venue">{w.venue}.</span>{/if}
					{#if link}
						<a class="out ui" href={link} target="_blank" rel="noopener noreferrer"
							>{linkLabel(w)}<Icon icon={ArrowRightIcon} size={12} stroke={1.8} /></a
						>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
{/if}

<style>
	.references {
		max-width: var(--measure);
		margin: 3rem auto 0;
		padding-top: 1.6rem;
		border-top: 1px solid var(--line-faint);
	}
	h2 {
		font-size: 0.74rem;
		font-weight: 650;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--gold);
		margin: 0 0 1rem;
	}
	ol {
		margin: 0;
		padding: 0 0 0 1.4rem;
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-dim);
	}
	li {
		margin: 0 0 0.6rem;
		padding-left: 0.2rem;
		scroll-margin-top: calc(var(--topbar-h) + 1.5rem);
		text-wrap: pretty;
	}
	li::marker {
		color: var(--ink-faint);
		font-size: 0.8em;
	}
	li:target {
		color: var(--ink);
	}
	li:target .who {
		color: var(--gold-pale);
	}
	.who {
		color: var(--ink);
	}
	cite {
		font-style: italic;
		color: var(--ink-bright);
	}
	.out {
		display: inline-flex;
		align-items: center;
		gap: 0.2rem;
		margin-left: 0.15rem;
		font-size: 0.72rem;
		letter-spacing: 0.04em;
		color: var(--gold);
		text-decoration: none;
		white-space: nowrap;
	}
	.out:hover {
		color: var(--gold-pale);
	}
</style>
