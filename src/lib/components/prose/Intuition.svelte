<script lang="ts">
	import type { Snippet } from 'svelte';
	import Callout from './Callout.svelte';

	let {
		title = '',
		label,
		head,
		id,
		children
	}: { title?: string; label?: string; head?: Snippet; id?: string; children: Snippet } = $props();
</script>

<Callout kind="intuition" {title} {label} {head} {id}>{@render children()}</Callout>
