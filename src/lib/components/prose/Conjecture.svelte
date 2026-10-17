<script lang="ts">
	// A conjecture or open problem, from $lib/content/conjectures:
	//   <Conjecture k="goldbach">…a sentence or two tying it to this section…</Conjecture>
	// The record supplies the statement, its status, what is known, a way in,
	// and the sources (which join the chapter's reference list).
	import type { Snippet } from 'svelte';
	import Callout from './Callout.svelte';
	import Cite from './Cite.svelte';
	import { ASOF, problemByKey, problemLabel, statusColor, statusText, type Problem } from '$lib/content/conjectures';
	import { renderMathInText } from '$lib/katex/render';
	import { href } from '$lib/util/paths';

	let { k, children }: { k: string; children?: Snippet } = $props();

	const p: Problem = $derived.by(() => {
		const found = problemByKey.get(k);
		if (!found) throw new Error(`[Conjecture] unknown problem "${k}"`);
		return found;
	});
	const settledVerb: Record<string, string> = {
		proved: 'proved by',
		disproved: 'disproved by',
		independent: 'shown undecidable by',
		claimed: 'claimed by'
	};
</script>

<Callout kind="conjecture" label={problemLabel(p)} title={p.name} id="cj-{p.key}">
	<div class="cj-status ui" style="--s:{statusColor[p.status]}">
		<span class="badge">{statusText(p)}</span>
		<span class="who">
			{#if p.posed.by}Posed by {p.posed.by}, {p.posed.year}{:else}Asked since {p.posed.year}{/if}{#if p.settled}; {settledVerb[p.status]} {p.settled.by}, {p.settled.year}{/if}
		</span>
	</div>
	<p class="cj-statement">{@html renderMathInText(p.statement)}</p>
	{#if children}{@render children()}{/if}
	{#if p.settled}
		<p><span class="cj-h">How it was settled.</span> {@html renderMathInText(p.settled.how)}</p>
	{/if}
	<p><span class="cj-h">{p.status === 'open' || p.status === 'claimed' ? 'What is known.' : 'Before and after.'}</span> {@html renderMathInText(p.known)}</p>
	{#if p.wayIn}
		<p><span class="cj-h">A way in.</span> {@html renderMathInText(p.wayIn)}</p>
	{/if}
	<p class="cj-foot ui">
		<span><Cite k={p.cite.join(',')} /></span>
		<span>Status as of {ASOF}</span>
		<a href={href('/problems/')}>All open problems</a>
	</p>
</Callout>

<style>
	.cj-status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem 0.75rem;
		margin: -0.15rem 0 0.7rem;
		font-size: 0.78rem;
	}
	.badge {
		padding: 0.12rem 0.6rem 0.15rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--s) 55%, transparent);
		background: color-mix(in srgb, var(--s) 14%, transparent);
		color: var(--s);
		font-weight: 600;
		letter-spacing: 0.02em;
	}
	.who {
		color: var(--ink-faint);
	}
	.cj-statement {
		font-style: italic;
		color: var(--ink-bright);
	}
	.cj-statement :global(.katex) {
		font-style: normal;
	}
	.cj-h {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: color-mix(in srgb, var(--rose) 75%, var(--ink));
		margin-right: 0.3rem;
	}
	.cj-foot {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.1rem;
		font-size: 0.74rem;
		color: var(--ink-faint);
		border-top: 1px solid rgba(242, 141, 182, 0.14);
		padding-top: 0.6rem;
	}
	.cj-foot a {
		color: var(--ink-dim);
	}
</style>
