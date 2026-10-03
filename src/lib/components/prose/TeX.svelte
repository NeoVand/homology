<script lang="ts">
	// Runtime math — for formulas that change with the reader's input.
	// (Static math in prose should use \( … \) which is rendered at build time.)
	import { tex as render } from '$lib/katex/render';

	let { tex, display = false, class: cls = '' }: { tex: string; display?: boolean; class?: string } = $props();
	const html = $derived(render(tex, display));
</script>

{#if display}
	<span class="math-block {cls}">{@html html}</span>
{:else}
	<span class={cls}>{@html html}</span>
{/if}
