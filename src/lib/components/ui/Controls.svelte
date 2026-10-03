<script lang="ts">
	// A tidy row of controls under (or over) a figure.
	import type { Snippet } from 'svelte';
	let { children, align = 'start' }: { children: Snippet; align?: 'start' | 'center' | 'between' } = $props();
</script>

<div class="controls ui {align}">{@render children()}</div>

<style>
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.2rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
		position: relative;
		z-index: 2;
	}
	.center {
		justify-content: center;
	}
	.between {
		justify-content: space-between;
	}
</style>
