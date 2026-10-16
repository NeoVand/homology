<script lang="ts">
	import type { Snippet } from 'svelte';
	import Callout from './Callout.svelte';
	import Portraits from './Portraits.svelte';

	let {
		title = '',
		label,
		head,
		id,
		people,
		children
	}: {
		title?: string;
		label?: string;
		head?: Snippet;
		id?: string;
		/** portrait keys from $lib/content/people, comma-separated: people="mayer,vietoris" */
		people?: string;
		children: Snippet;
	} = $props();

	const keys = $derived(
		(people ?? '')
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean)
	);
</script>

<Callout kind="history" {title} {label} {head} {id}>
	{#if keys.length}<Portraits {keys} />{/if}
	{@render children()}
	{#if keys.length}<div class="clear"></div>{/if}
</Callout>

<style>
	.clear {
		clear: both;
	}
</style>
