<script lang="ts">
	// Orient every triangle of the torus or the Klein bottle by hand. Edges
	// where neighbours clash glow rose: there ∂(Σ ±t) counts the edge twice.
	// On the torus every clash can be removed; on the Klein bottle one loop of
	// clashes always survives, and ∂(Σ ±t) = 2c with c a non-bounding loop.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import FlatComplex from '../homology-groups/FlatComplex.svelte';
	import { torusGrid, kleinGrid } from '../homology-groups/complexes';
	import { counterclockwise } from '../homology-groups/flat';
	import { chainTeX } from '../homology-groups/chains';
	import { Z2HomologyBasis } from '$lib/math/homology';
	import { mulberry32 } from '$lib/math/persistence';
	import { conflicts, greedyOrient, conflictClass } from './orientation';

	const surfaces = {
		torus: torusGrid(),
		klein: kleinGrid()
	};
	const bases = Object.fromEntries(
		Object.entries(surfaces).map(([k, ex]) => [
			k,
			new Z2HomologyBasis(
				ex.K,
				1,
				ex.cycles!.map((c) => c.chain.flatMap((x, i) => (x ? [i] : [])))
			)
		])
	) as Record<'torus' | 'klein', Z2HomologyBasis>;

	let which = $state<'torus' | 'klein'>('klein');
	const ex = $derived(surfaces[which]);
	// start from a random-looking orientation so there is something to fix
	let seed = 11;
	function scrambled(e = ex) {
		const r = mulberry32(seed++);
		return counterclockwise(e.L).map((x) => (r() < 0.35 ? -x : x));
	}
	let eps = $state<number[]>(scrambled(surfaces.klein));

	const info = $derived(conflicts(ex.K, eps));
	const cls = $derived(conflictClass(bases[which], info.c));
	const isZero = $derived(!!cls && cls.every((x) => x === 0));

	function choose(v: 'torus' | 'klein') {
		which = v;
		eps = scrambled(surfaces[v]);
	}
	function flip(_k: string, t: number) {
		const next = eps.slice();
		next[t] = -next[t];
		eps = next;
	}
	const ccwAll = () => (eps = counterclockwise(ex.L));
	// grow a consistent orientation from every possible starting triangle and keep the best
	const fix = () => {
		let best = eps;
		let bestN = Infinity;
		for (let s = 0; s < ex.K.count(2); s++) {
			const cand = greedyOrient(ex.K, eps, s);
			const n = conflicts(ex.K, cand).edges.length;
			if (n < bestN) [best, bestN] = [cand, n];
		}
		eps = best;
	};
	const scramble = () => (eps = scrambled());
</script>

<div class="op">
	<div class="top ui">
		<Segmented
			value={which}
			options={[
				{ value: 'torus', label: 'Torus' },
				{ value: 'klein', label: 'Klein bottle' }
			]}
			onchange={choose}
			label="Surface"
		/>
		<div class="btns">
			<Button onclick={fix}>Fix greedily</Button>
			<Button onclick={ccwAll}>All counterclockwise</Button>
			<Button onclick={scramble}>Scramble</Button>
		</div>
	</div>
	<div class="grid">
		<div class="pic">
			<Svg viewBox={ex.L.viewBox} maxHeight={380} label="The {which === 'torus' ? 'torus' : 'Klein bottle'} grid with an orientation arrow in each triangle; clashing edges glow rose">
				<FlatComplex
					L={ex.L}
					triOrient={(t) => eps[t]}
					orientColor="var(--violet)"
					edgeCoef={(e) => info.c[e]}
					coefColor="var(--rose)"
					interactive={['tri']}
					onpick={flip}
					labelSize={1.05}
					ariaName="orientation"
				/>
			</Svg>
		</div>
		<div class="side ui">
			<div class="count" class:good={info.edges.length === 0}>
				<span class="n">{info.edges.length}</span>
				<span class="w">clashing edge{info.edges.length === 1 ? '' : 's'}</span>
			</div>
			{#if info.edges.length === 0}
				<p class="ok">Coherent! Every edge cancels, so \(\sum \pm t\) is a 2-cycle: \(H_2 \ne 0\).</p>
			{:else}
				<p class="eq"><TeX tex={`\\partial\\big(\\textstyle\\sum \\pm t\\big) = 2c, \\quad c = ${chainTeX(ex.K, 1, info.c, { max: 4 })}`} /></p>
			{/if}
			<div class="cls" class:zero={isZero}>
				{#if isZero}
					<TeX tex="[c] = 0" /> <span>the clashes can all be removed by flipping triangles</span>
				{:else}
					<TeX tex="[c] = [a] \ne 0,\quad 2[c] = 0" /> <span>no sequence of flips removes every clash</span>
				{/if}
			</div>
			<p class="hint">Click a triangle to reverse its arrow. Flipping a triangle <TeX tex="t" /> changes <TeX tex="c" /> by <TeX tex="\pm\partial t" />, a boundary, so the class <TeX tex="[c]" /> never changes.</p>
		</div>
	</div>
</div>

<style>
	.op {
		padding: 0.8rem 1.1rem 1rem;
	}
	@media (max-width: 640px) {
		.op {
			padding: 0.6rem 0.6rem 0.8rem;
		}
	}
	.top {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
		justify-content: space-between;
		margin-bottom: 0.4rem;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 0.6rem 1.3rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.86rem;
		color: var(--ink);
	}
	.count {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}
	.count .n {
		font-family: var(--font-display);
		font-size: 2.3rem;
		line-height: 1;
		color: var(--rose);
	}
	.count.good .n {
		color: var(--green);
	}
	.count .w {
		font-size: 0.78rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.ok {
		margin: 0;
		color: var(--green);
		font-size: 0.95rem;
	}
	.eq {
		margin: 0;
		font-size: 0.95rem;
		overflow-x: auto;
	}
	.cls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.6rem;
		align-items: baseline;
		padding: 0.55rem 0.75rem;
		border-radius: 9px;
		border: 1px solid rgba(242, 141, 182, 0.45);
		background: rgba(242, 141, 182, 0.07);
		font-size: 0.86rem;
	}
	.cls.zero {
		border-color: rgba(132, 217, 162, 0.45);
		background: rgba(132, 217, 162, 0.06);
	}
	.cls span {
		color: var(--ink-dim);
	}
	.hint {
		margin: 0;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
</style>
