<script lang="ts">
	import Figure from '$lib/components/prose/Figure.svelte';
	import KnotGallery from '$lib/figures/homology/knots/KnotGallery.svelte';
</script>

<!-- DRAFT: the chapter is being written; figures first -->
<h2 id="circles-in-space">Circles in space</h2>

<Figure num="3.7.1" title="A gallery of knots and links" hint="Choose a knot · drag to turn it">
	<KnotGallery />
	{#snippet caption()}
		Draft caption.
	{/snippet}
</Figure>
