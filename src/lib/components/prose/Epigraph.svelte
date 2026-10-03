<script lang="ts">
	import type { Snippet } from 'svelte';
	let { author, source = '', children }: { author: string; source?: string; children: Snippet } = $props();
</script>

<blockquote class="epigraph">
	<p class="q">{@render children()}</p>
	<footer class="ui">
		<span class="dash">—</span>
		<span class="who">{author}</span>{#if source}<span class="src">, {source}</span>{/if}
	</footer>
</blockquote>

<style>
	.epigraph {
		margin: 0 auto 2.8rem;
		max-width: 34rem;
		text-align: center;
		border: 0;
		padding: 0;
	}
	.q {
		font-family: var(--font-elegant);
		font-style: italic;
		font-weight: 500;
		font-size: 1.32rem;
		line-height: 1.5;
		color: #e8dfc9;
		margin: 0 0 0.6rem;
		quotes: '“' '”';
	}
	.q::before {
		content: open-quote;
		color: var(--gold);
	}
	.q::after {
		content: close-quote;
		color: var(--gold);
	}
	footer {
		font-size: 0.8rem;
		letter-spacing: 0.08em;
		color: var(--ink-faint);
	}
	.who {
		color: var(--gold);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.16em;
		font-size: 0.74rem;
	}
	.dash {
		color: var(--gold-deep);
		margin-right: 0.4em;
	}
</style>
