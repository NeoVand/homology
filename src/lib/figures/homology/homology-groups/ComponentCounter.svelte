<script lang="ts">
	// H₀ counts pieces: toggle edges of a graph, watch the components and the
	// rank of ∂₁ change, and see why two vertices in one piece are homologous.
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FlatComplex from './FlatComplex.svelte';
	import { SimplicialComplex } from '$lib/math/complex';
	import { smith } from '$lib/math/linalg';
	import { buildFlat, type DV, type Pt } from './flat';
	import { pathChain, zeroChain, chainTeX } from './chains';
	import { componentsOf, pathBetween } from './graph';

	const pos: Pt[] = [
		[-3.3, 0.9],
		[-2.3, 1.75],
		[-1.9, 0.35],
		[-3.0, -0.85],
		[-0.45, 1.15],
		[0.65, 1.6],
		[0.45, -0.15],
		[2.35, 1.3],
		[3.35, 0.25],
		[2.2, -0.95]
	];
	const candidates: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2],
		[2, 3],
		[0, 3],
		[4, 5],
		[5, 6],
		[4, 6],
		[7, 8],
		[8, 9],
		[7, 9],
		[2, 4],
		[1, 4],
		[6, 9],
		[5, 7],
		[3, 6]
	];
	const initial = ['0,1', '1,2', '2,3', '4,5', '5,6', '7,8', '8,9'];
	const V = pos.length;
	const Kfull = new SimplicialComplex([...pos.map((_, i) => [i]), ...candidates]);
	const L = buildFlat(Kfull, {
		edges: candidates.map(([a, b]) => [[a, pos[a]] as DV, [b, pos[b]] as DV]),
		points: pos.map((p, i) => [i, p] as DV)
	});
	const edgeKey = (e: number) => Kfull.simplices[1][e].join(',');

	let present = $state(new Set(initial));
	let selected = $state<number[]>([]);

	const presentEdges = $derived(Kfull.simplices[1].filter((s) => present.has(s.join(','))));
	const comps = $derived(componentsOf(V, presentEdges));
	const c = $derived(new Set(comps).size);
	const Kcur = $derived(new SimplicialComplex([...pos.map((_, i) => [i]), ...presentEdges]));
	const r1 = $derived(Kcur.count(1) ? smith(Kcur.boundaryMatrix(1)).rank : 0);
	const E = $derived(presentEdges.length);
	const b1 = $derived(E - r1);

	const palette = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)', 'var(--rose)', 'var(--blue)', 'var(--green)', 'var(--amber)', '#c9a77a', '#9fd3ff', '#e7b0ff'];
	// colour each component by its smallest vertex, in order of appearance
	const compColor = $derived.by(() => {
		const order: number[] = [];
		comps.forEach((root) => {
			if (!order.includes(root)) order.push(root);
		});
		return (v: number) => palette[order.indexOf(comps[v]) % palette.length];
	});

	const path = $derived.by(() => {
		if (selected.length !== 2) return null;
		const [u, w] = selected;
		return pathBetween(V, presentEdges, u, w);
	});
	const pathC = $derived(path ? pathChain(Kfull, path) : zeroChain(Kfull, 1));

	function pick(kind: string, i: number) {
		if (kind === 'edge') {
			const k = edgeKey(i);
			const next = new Set(present);
			if (next.has(k)) next.delete(k);
			else next.add(k);
			present = next;
		} else if (kind === 'vertex') {
			const v = Kfull.simplices[0][i][0];
			if (selected.length >= 2 || selected.includes(v)) selected = [v];
			else selected = [...selected, v];
		}
	}
</script>

<div class="cc">
	<div class="pic">
		<Svg viewBox={L.viewBox} maxHeight={330} label="A graph with ten vertices. Present edges are solid; dashed edges can be added by clicking. Each connected piece has its own colour.">
			<FlatComplex
				{L}
				edgeColor={(e) => (present.has(edgeKey(e)) ? compColor(Kfull.simplices[1][e][0]) : null)}
				edgeDash={(e) => !present.has(edgeKey(e))}
				edgeWidth={(e) => (present.has(edgeKey(e)) ? 3 : 1.3)}
				edgeCoef={(e) => (path ? pathC[e] : 0)}
				coefColor="var(--ink-bright)"
				vertexColor={(i) => compColor(Kfull.simplices[0][i][0])}
				interactive={['edge', 'vertex']}
				onpick={pick}
				ariaName="graph"
			/>
			{#each selected as v (v)}
				{@const d = L.verts.find((x) => x.v === v)!}
				<circle cx={d.p[0]} cy={d.p[1]} r="15" class="sel" />
			{/each}
		</Svg>
	</div>
	<div class="side ui">
		<div class="big">
			<span class="n">{c}</span>
			<span class="w">piece{c === 1 ? '' : 's'}</span>
			<span class="h"><TeX tex={`H_0 \\cong \\Z${c === 1 ? '' : `^{${c}}`}`} /></span>
		</div>
		<div class="calc">
			<TeX tex={`b_0 = n_0 - \\rank\\partial_1 = ${V} - ${r1} = ${V - r1}`} />
		</div>
		<div class="calc dim">
			<TeX tex={`b_1 = n_1 - \\rank \\partial_1 = ${E} - ${r1} = ${b1}`} />
			<span>{b1 === 0 ? '(no loops yet)' : `(independent loop${b1 === 1 ? '' : 's'})`}</span>
		</div>
		<div class="sel-text">
			{#if selected.length === 0}
				Click two vertices to compare their classes in <TeX tex="H_0" />.
			{:else if selected.length === 1}
				Vertex {selected[0]} selected; click another.
			{:else if path}
				<span class="ok">Same piece:</span>
				<TeX tex={`[${selected[1]}] - [${selected[0]}] = \\partial\\big(${chainTeX(Kfull, 1, pathC, { max: 4 })}\\big)`} />, so
				<TeX tex={`[${selected[0]}] = [${selected[1]}]`} /> in <TeX tex="H_0" />.
			{:else}
				<span class="no">Different pieces:</span> no 1-chain has boundary
				<TeX tex={`[${selected[1]}] - [${selected[0]}]`} />, since every boundary has coefficient sum 0 on each piece.
			{/if}
		</div>
		<div class="row">
			<Button onclick={() => ((present = new Set(initial)), (selected = []))}>Reset</Button>
			<Button onclick={() => (present = new Set(candidates.map((e) => e.join(','))))}>Add every edge</Button>
			<Button onclick={() => ((present = new Set()), (selected = []))}>Remove all</Button>
		</div>
	</div>
</div>

<style>
	.cc {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		padding: 0.7rem 1.1rem 1.1rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.cc {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.5rem 0.7rem 0.9rem;
		}
	}
	.sel {
		fill: none;
		stroke: var(--ink-bright);
		stroke-width: 1.8;
		stroke-dasharray: 3 3;
		pointer-events: none;
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.big {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.n {
		font-family: var(--font-display);
		font-size: 2.4rem;
		color: var(--gold-bright);
		line-height: 1;
	}
	.w {
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.h {
		margin-left: auto;
		font-size: 1.25rem;
		color: var(--ink-bright);
	}
	.calc {
		color: var(--ink);
		font-size: 0.95rem;
	}
	.calc.dim {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: baseline;
		color: var(--ink-dim);
		font-size: 0.86rem;
	}
	.sel-text {
		min-height: 3.2rem;
		line-height: 1.55;
		color: var(--ink);
	}
	.ok {
		color: var(--green);
		font-weight: 600;
	}
	.no {
		color: var(--rose);
		font-weight: 600;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}
</style>
