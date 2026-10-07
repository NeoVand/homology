<script lang="ts">
	// The seven test complexes of §3.3, each with its homology.
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import FlatComplex from './FlatComplex.svelte';
	import { point, twoPoints, hollowTriangle, filledTriangle, hollowTetrahedron, figureEight, torusGrid } from './complexes';
	import { homology, groupTeX } from '$lib/math/homology';
	import { paddedViewBox } from './flat';

	let { showHomology = true }: { showHomology?: boolean } = $props();

	const items = [point(), twoPoints(), hollowTriangle(), filledTriangle(), hollowTetrahedron(), figureEight(), torusGrid()].map((ex) => ({
		ex,
		H: homology(ex.K, 'Z')
	}));
	// on phones the cards are narrow: draw the pictures taller and their labels larger
	let cw = $state(800);
	const narrow = $derived(cw < 520);
</script>

<div class="gal" bind:clientWidth={cw}>
	{#each items as { ex, H } (ex.id)}
		<div class="card">
			<div class="pic">
				<Svg viewBox={paddedViewBox(ex.L, 250, 236)} maxHeight={narrow ? 150 : 118} label={ex.name}>
					<FlatComplex L={ex.L} triFill={() => 'var(--blue)'} triOpacity={() => 0.16} labelSize={narrow ? 1.9 : 1.55} />
				</Svg>
			</div>
			<div class="nm ui">{ex.name}</div>
			<div class="sp"><TeX tex={ex.space} /></div>
			{#if showHomology}
				<div class="hh">
					{#each [0, 1, 2] as k (k)}
						<span class="h"><TeX tex={`H_${k} = ${k < H.length ? groupTeX(H[k]) : '0'}`} /></span>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.gal {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 0.6rem;
		padding: 1rem 1.1rem 1.1rem;
	}
	@media (max-width: 1100px) {
		.gal {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}
	@media (max-width: 520px) {
		.gal {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			padding: 0.7rem;
			gap: 0.6rem;
		}
	}
	.card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		padding: 0.6rem 0.4rem 0.7rem;
		border-radius: 10px;
		border: 1px solid var(--line-faint);
		background: rgba(10, 15, 29, 0.55);
	}
	.pic {
		width: 100%;
		height: 122px;
		display: grid;
		place-items: center;
		overflow: hidden;
	}
	.nm {
		font-size: 0.74rem;
		color: var(--ink-bright);
		text-align: center;
		margin-top: 0.2rem;
	}
	.sp {
		font-size: 0.85rem;
		color: var(--violet);
	}
	.hh {
		display: grid;
		gap: 0.05rem;
		margin-top: 0.35rem;
		font-size: 0.82rem;
		color: var(--ink);
		text-align: center;
	}
	@container figure (max-width: 520px) {
		.pic {
			height: 154px;
		}
	}
</style>
