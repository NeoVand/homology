<script lang="ts">
	import Figure from '$lib/components/prose/Figure.svelte';
	import TorusFences from '$lib/figures/cohomology/cohomology-groups/TorusFences.svelte';
	import PairingPlayground from '$lib/figures/cohomology/cohomology-groups/PairingPlayground.svelte';
	import MatrixDuality from '$lib/figures/cohomology/cohomology-groups/MatrixDuality.svelte';
	import CohomologySteps from '$lib/figures/cohomology/cohomology-groups/CohomologySteps.svelte';
	import TorsionShift from '$lib/figures/cohomology/cohomology-groups/TorsionShift.svelte';
	import Contravariance from '$lib/figures/cohomology/cohomology-groups/Contravariance.svelte';
	import CoefficientTable from '$lib/figures/cohomology/cohomology-groups/CoefficientTable.svelte';
</script>

<p class="lead">Scratch.</p>

<Figure size="wide" title="Pairing" hint="Tap edges">
	<PairingPlayground />
	{#snippet caption()}Pairing.{/snippet}
</Figure>
<Figure size="wide" title="Matrix" hint="Hover">
	<MatrixDuality />
	{#snippet caption()}Matrix.{/snippet}
</Figure>
<Figure size="wide" title="Steps" hint="Step">
	<CohomologySteps />
	{#snippet caption()}Steps.{/snippet}
</Figure>
<Figure size="wide" title="Fences" hint="Drag to rotate">
	<TorusFences />
	{#snippet caption()}Fences.{/snippet}
</Figure>
<Figure size="wide" title="Torsion" hint="Step">
	<TorsionShift />
	{#snippet caption()}Torsion.{/snippet}
</Figure>
<Figure size="wide" title="Contra" hint="Drag the fence">
	<Contravariance />
	{#snippet caption()}Contra.{/snippet}
</Figure>
<Figure size="wide" title="Table" hint="Pick a space">
	<CoefficientTable />
	{#snippet caption()}Table.{/snippet}
</Figure>
