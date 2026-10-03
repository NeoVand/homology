<script lang="ts">
	import type { Snippet } from 'svelte';
	let { children }: { children: Snippet } = $props();
</script>

<div class="aside">{@render children()}</div>

<style>
	.aside {
		margin: 1.4rem 0;
		padding: 0.2rem 0 0.2rem 1rem;
		border-left: 1px solid var(--line-strong);
		font-size: 0.92em;
		color: var(--ink-dim);
	}
	.aside :global(p:last-child) {
		margin-bottom: 0;
	}
</style>
