<script lang="ts">
	// The toolbar under (or over) a figure: one tidy, wrapping row of controls.
	import type { Snippet } from 'svelte';
	let { children, align = 'start' }: { children: Snippet; align?: 'start' | 'center' | 'between' } = $props();
</script>

<div class="controls ui {align}">{@render children()}</div>

<style>
	.controls {
		position: relative;
		z-index: 2;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.1rem;
		padding: 0.75rem 1.25rem 0.85rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.4);
	}
	.center {
		justify-content: center;
	}
	.between {
		justify-content: space-between;
	}
	@container figure (max-width: 30rem) {
		.controls {
			padding: 0.7rem 1rem 0.8rem;
		}
	}
</style>
