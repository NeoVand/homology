<script lang="ts">
	// A cross-reference to another chapter (optionally a section within it).
	// <Ref to="homology/chains" /> renders "§3.2 Chains and the Boundary Operator".
	// <Ref to="homology/chains" hash="boundary-of-a-boundary">this argument</Ref> uses your text.
	import type { Snippet } from 'svelte';
	import { chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';

	let { to, hash, children }: { to: string; hash?: string; children?: Snippet } = $props();
	const ch = $derived(chapterById.get(to));
</script>

{#if ch}
	<a class="ref" href={chapterHref(ch.id, hash)}
		>{#if children}{@render children()}{:else}<span class="n">§{ch.num}</span> {ch.title}{/if}</a
	>
{:else}
	<span class="ref missing" title="Unknown chapter: {to}">{#if children}{@render children()}{:else}{to}{/if}</span>
{/if}

<style>
	.ref {
		color: var(--gold-bright);
		text-decoration: underline;
		text-decoration-color: rgba(244, 215, 156, 0.35);
		text-underline-offset: 0.18em;
	}
	.ref:hover {
		text-decoration-color: var(--gold-bright);
	}
	.n {
		font-variant-numeric: lining-nums;
	}
	.missing {
		color: var(--red);
	}
</style>
