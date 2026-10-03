<script lang="ts">
	import Figure from '$lib/components/prose/Figure.svelte';
	import GenusSurfaces from '$lib/figures/topology/manifolds/GenusSurfaces.svelte';
	import SphereCharts from '$lib/figures/topology/manifolds/SphereCharts.svelte';
	import LinkProbe from '$lib/figures/topology/manifolds/LinkProbe.svelte';
	import OrientationWalk from '$lib/figures/topology/manifolds/OrientationWalk.svelte';
	import TangentPlane from '$lib/figures/topology/manifolds/TangentPlane.svelte';
	import ConnectedSum from '$lib/figures/topology/manifolds/ConnectedSum.svelte';
</script>

<h2 id="draft">Draft</h2>

<Figure size="wide" title="Closed surfaces" hint="Choose a surface · drag to rotate">
	<GenusSurfaces />
	{#snippet caption()}Genus.{/snippet}
</Figure>

<Figure size="wide" title="An atlas of the sphere" hint="Hover or tap the globe · click a map">
	<SphereCharts />
	{#snippet caption()}Charts.{/snippet}
</Figure>

<Figure size="wide" title="The small-sphere test" hint="Pick a space · click it to move the probe · resize the sphere">
	<LinkProbe />
	{#snippet caption()}Probe.{/snippet}
</Figure>

<Figure size="wide" title="A walk round a band" hint="Choose a band · walk a lap · drag to rotate">
	<OrientationWalk />
	{#snippet caption()}Walk.{/snippet}
</Figure>

<Figure size="wide" title="Tangent planes" hint="Click the surface to move the point · turn the direction · try the microscope">
	<TangentPlane />
	{#snippet caption()}Tangent.{/snippet}
</Figure>

<Figure size="wide" title="Connected sum" hint="Step through · drag to rotate">
	<ConnectedSum />
	{#snippet caption()}Sum.{/snippet}
</Figure>
