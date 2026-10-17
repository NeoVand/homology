<script lang="ts">
	import Figure from '$lib/components/prose/Figure.svelte';
	import KnotGallery from '$lib/figures/homology/knots/KnotGallery.svelte';
	import Reidemeister from '$lib/figures/homology/knots/Reidemeister.svelte';
	import ColourKnot from '$lib/figures/homology/knots/ColourKnot.svelte';
</script>

<!-- DRAFT: the chapter is being written; figures first -->
<h2 id="circles-in-space">Circles in space</h2>

<Figure num="3.7.1" title="A gallery of knots and links" hint="Choose a knot · drag to turn it">
	<KnotGallery />
	{#snippet caption()}
		Draft caption.
	{/snippet}
</Figure>

<Figure num="3.7.2" title="Reidemeister’s three moves" hint="Choose a move · play or scrub it">
	<Reidemeister />
	{#snippet caption()}
		Draft caption.
	{/snippet}
</Figure>

<Figure num="3.7.3" title="Colour the knot" hint="Tap an arc to change its colour · choose the knot and the number of colours">
	<ColourKnot />
	{#snippet caption()}
		Draft caption.
	{/snippet}
</Figure>
