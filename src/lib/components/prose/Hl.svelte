<script lang="ts">
	// Linked highlighting: hovering/focusing this text sets hl.key so that
	// figures listening for the same key can emphasise the matching object.
	import type { Snippet } from 'svelte';
	import { hl } from '$lib/stores/ui.svelte';

	let {
		k,
		c = 'gold',
		children
	}: { k: string; c?: 'gold' | 'teal' | 'violet' | 'rose' | 'blue' | 'green'; children: Snippet } = $props();

	const on = $derived(hl.key === k);
</script>

<span
	class="hl hl-{c}"
	class:on
	role="button"
	tabindex="0"
	onpointerenter={() => (hl.key = k)}
	onpointerleave={() => (hl.key = null)}
	onfocus={() => (hl.key = k)}
	onblur={() => (hl.key = null)}
	onclick={() => (hl.key = hl.key === k ? null : k)}>{@render children()}</span
>

<style>
	.hl {
		cursor: help;
		border-bottom: 1.5px dotted currentColor;
		transition:
			background 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
		border-radius: 3px;
		padding: 0 0.08em;
	}
	.hl-gold {
		color: var(--gold-bright);
	}
	.hl-teal {
		color: var(--teal);
	}
	.hl-violet {
		color: var(--violet);
	}
	.hl-rose {
		color: var(--rose);
	}
	.hl-blue {
		color: var(--blue);
	}
	.hl-green {
		color: var(--green);
	}
	.hl.on {
		background: color-mix(in srgb, currentColor 16%, transparent);
		box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 12%, transparent);
	}
</style>
