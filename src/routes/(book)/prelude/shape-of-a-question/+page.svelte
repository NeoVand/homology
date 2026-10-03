<script lang="ts">
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowTube } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, loopPath } from '$lib/three/surfaces';

	function setupTorus({ scene }: SceneContext) {
		const f = torus(1.6, 0.62);
		scene.add(glassMesh(surfaceGeometry(f, 160, 64), { opacity: 0.85, grid: [48, 20] }));
		scene.add(glowTube(new SurfaceCurve(f, loopPath(1, 0, 0, 0.25)), { color: 'gold', closed: true, radius: 0.028 }));
		scene.add(glowTube(new SurfaceCurve(f, loopPath(0, 1, 0.1, 0)), { color: 'teal', closed: true, radius: 0.028 }));
	}
</script>

<Epigraph author="Henri Poincaré" source="Science et méthode (1908)">Mathematics is the art of giving the same name to different things.</Epigraph>

<p class="lead">A test of the pipeline: inline math \(H_n(X) = \ker \partial_n / \im \partial_{n+1}\) and a <Term t="homology">homology</Term> term.</p>

<h2 id="first">A first section with \(\Z/2\)</h2>

<p>Display math:</p>
\[ \partial_n(\sigma) = \sum_{i=0}^{n} (-1)^i \,\sigma \circ \delta^i, \qquad \partial_{n-1}\circ\partial_n = 0. \]

<Definition title="Homology group">
	<p>For a chain complex, the \(n\)-th homology group is \(H_n = Z_n / B_n\) where \(Z_n = \ker \partial_n\).</p>
</Definition>

<Theorem title="Euler–Poincaré">
	<p>\(\chi(X) = \sum_k (-1)^k \operatorname{rank} H_k(X)\).</p>
</Theorem>

<KeyIdea><p>A hole is a cycle that is not a boundary.</p></KeyIdea>

<Figure size="wide" title="A torus and two loops" hint="Drag to rotate">
	<Scene3D setup={setupTorus} height={460} controls={{ autoRotate: true }} animate camera={{ position: [0, 3.2, 6.4] }} label="A torus with a gold loop around the hole and a teal loop around the tube" />
	{#snippet caption()}
		The gold loop \(a\) goes around the hole; the teal loop \(b\) goes around the tube.
	{/snippet}
</Figure>

<Exercise title="Warm-up" level={1}>
	<p>Compute \(V - E + F\) for a cube.</p>
	{#snippet solution()}
		<p>\(8 - 12 + 6 = 2\).</p>
	{/snippet}
</Exercise>

<h2 id="second">Second section</h2>
<p>More text.</p>
