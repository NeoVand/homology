<script lang="ts">
	// Figure 3.2.6 — boundary matrices next to the complex they describe.
	// Column j of ∂_k lists the boundary of the j-th k-simplex. Hover (or tap) a
	// cell: the column's simplex lights up in violet, its faces in teal, the row's
	// simplex in gold. The product ∂₁∂₂ is the zero matrix, and hovering one of its
	// entries shows the two terms that cancel.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from '../cycles-and-boundaries/GraphCanvas.svelte';
	import { matmul } from '$lib/math/linalg';
	import { house, chainTeX } from './chains';

	const K = house.K;
	const V = K.simplices[0].map((s) => s[0]);
	const edges = K.simplices[1] as [number, number][];
	const tris = K.simplices[2] as [number, number, number][];
	const D1 = K.boundaryMatrix(1);
	const D2 = K.boundaryMatrix(2);

	let mod2 = $state(false);
	type Hover = { m: 'd1' | 'd2' | 'p'; i: number; j: number } | null;
	let hover = $state<Hover>(null);

	const red = (M: number[][]) => (mod2 ? M.map((r) => r.map((x) => ((x % 2) + 2) % 2)) : M);
	const M1 = $derived(red(D1));
	const M2 = $derived(red(D2));
	const P = $derived(red(matmul(D1, D2)));

	const vLab = V.map((v) => String(v));
	const eLab = edges.map((e) => `[${e.join(',')}]`);
	const tLab = tris.map((t) => `[${t.join(',')}]`);

	// what to light up in the picture
	const lit = $derived.by(() => {
		const r = { tri: -1, edgeV: -1, edgeT: [] as number[], edgeG: -1, vertT: [] as number[], vertG: -1 };
		if (!hover) return r;
		const { m, i, j } = hover;
		if (m === 'd2') {
			r.tri = j;
			r.edgeT = D2.map((row, e) => (row[j] ? e : -1)).filter((e) => e >= 0);
			r.edgeG = i;
		} else if (m === 'd1') {
			r.edgeV = j;
			r.vertT = D1.map((row, v) => (row[j] ? v : -1)).filter((v) => v >= 0);
			r.vertG = i;
		} else {
			r.tri = j;
			r.vertG = i;
			r.edgeT = D2.map((row, e) => (row[j] && D1[i][e] ? e : -1)).filter((e) => e >= 0);
		}
		return r;
	});

	const sgn = (x: number) => (mod2 ? String(((x % 2) + 2) % 2) : x > 0 ? `+${x}` : `${x}`);
	const explain = $derived.by(() => {
		if (!hover) return '';
		const { m, i, j } = hover;
		if (m === 'd2') return String.raw`\text{column } ${tLab[j]}\text{ of }\partial_2 \text{ lists } \partial${tLab[j]} = ${chainTeX(K, 1, red(D2).map((row) => row[j]))}`;
		if (m === 'd1') return String.raw`\text{column } ${eLab[j]}\text{ of }\partial_1 \text{ lists } \partial${eLab[j]} = ${chainTeX(K, 0, red(D1).map((row) => row[j]))}`;
		const terms = edges
			.map((_, e) => [D1[i][e], D2[e][j], e] as const)
			.filter(([a, b]) => a && b)
			.map(([a, b, e]) => String.raw`\underbrace{(${sgn(a)})(${sgn(b)})}_{${eLab[e]}}`);
		const sum = terms.length ? terms.join(' + ') : String.raw`\text{(no edge of } ${tLab[j]} \text{ meets } ${vLab[i]})`;
		const tail = terms.length && mod2 ? String.raw`= 1 + 1 \equiv 0 \pmod 2` : '= 0';
		return String.raw`(\partial_1\partial_2)_{${vLab[i]},\,${tLab[j]}} = ${sum} ${tail}`;
	});
</script>

<div class="grid">
	<div class="pic">
		<Svg viewBox="70 10 260 330" maxHeight={330} label="A complex with vertices 0 to 4: two filled triangles [0,1,2] and [1,2,3] forming a square, and an empty triangle 2-3-4 on top.">
			<GraphCanvas
				pos={house.pos}
				{edges}
				{tris}
				triLook={(t) => (lit.tri === t ? { fill: 'rgba(164,147,255,0.45)', glow: true, label: tLab[t], labelColor: '#ece8ff' } : { fill: 'rgba(116,169,255,0.1)' })}
				edgeLook={(e) =>
					lit.edgeG === e
						? { color: 'var(--gold-bright)', width: 5, glow: true }
						: lit.edgeV === e
							? { color: 'var(--violet)', width: 4.6, glow: true }
							: lit.edgeT.includes(e)
								? { color: 'var(--teal)', width: 4, glow: true }
								: { color: 'rgba(206,198,176,0.45)', width: 2.2 }}
				vertexLook={(v) => ({
					label: String(v),
					labelOffset: v === 4 ? [0, -22] : [v % 2 === 0 ? -20 : 20, v < 2 ? 14 : -10],
					...(lit.vertG === v ? { ring: 'var(--gold-bright)', glow: true } : lit.vertT.includes(v) ? { ring: 'var(--teal)', glow: true } : {})
				})}
			/>
		</Svg>
	</div>
	<div class="mats">
		<MatrixView
			M={M1}
			rowLabels={vLab}
			colLabels={eLab}
			caption={String.raw`\partial_1 =`}
			highlightCols={lit.edgeV >= 0 ? [lit.edgeV] : []}
			cellClass={(i, j) => (M1[i][j] ? (D1[i][j] > 0 || mod2 ? 'gold' : 'rose') : undefined)}
			onhover={(i, j) => (hover = i === null || j === null ? null : { m: 'd1', i, j })}
		/>
		<div class="row2">
			<MatrixView
				M={M2}
				rowLabels={eLab}
				colLabels={tLab}
				caption={String.raw`\partial_2 =`}
				cellClass={(i, j) => (M2[i][j] ? (D2[i][j] > 0 || mod2 ? 'gold' : 'rose') : undefined)}
				onhover={(i, j) => (hover = i === null || j === null ? null : { m: 'd2', i, j })}
			/>
			<MatrixView
				M={P}
				rowLabels={vLab}
				colLabels={tLab}
				caption={String.raw`\partial_1\partial_2 =`}
				cellClass={() => 'teal'}
				dimZeros={false}
				onhover={(i, j) => (hover = i === null || j === null ? null : { m: 'p', i, j })}
			/>
		</div>
	</div>
</div>

<div class="readout ui" aria-live="polite">
	{#if explain}
		<TeX tex={explain} />
	{:else}
		<span class="hint">Hover over (or tap) any entry. Rows are faces, columns are simplices: column \(j\) of \(\partial_k\) is the boundary of the \(j\)-th \(k\)-simplex, written as a list of numbers.</span>
	{/if}
</div>

<Controls>
	<Toggle bind:checked={mod2} label="Reduce the entries mod 2" />
	<span class="note">{mod2 ? 'Mod 2 every ±1 becomes 1, and the product is still zero: each entry is 1 + 1 = 0.' : 'Over ℤ: +1 gold, −1 rose.'}</span>
</Controls>

<style>
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 2fr);
		gap: 0.5rem 1rem;
		align-items: center;
		padding: 1rem 1rem 0.2rem;
	}
	.mats {
		display: grid;
		gap: 0.9rem;
		justify-items: center;
		min-width: 0;
	}
	.row2 {
		display: flex;
		flex-wrap: wrap;
		gap: 0.9rem 1.6rem;
		justify-content: center;
		align-items: center;
		max-width: 100%;
	}
	@media (max-width: 760px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.pic {
			max-width: 260px;
			margin: 0 auto;
		}
	}
	/* phones: ∂₁ (5 × 7) would need a sideways scroll; put each caption above its matrix and tighten the cells */
	@container figure (max-width: 30rem) {
		.grid {
			padding: 0.8rem 0.3rem 0.2rem;
		}
		.mats :global(.mv) {
			flex-direction: column;
			gap: 0.2rem;
		}
		.grid .mats :global(.mv.mv td) {
			min-width: 1.7rem;
			padding: 0.3rem 0.18rem;
		}
		.grid .mats :global(.mv.mv th) {
			padding: 0.2rem 0.12rem;
		}
	}
	.readout {
		padding: 0.5rem 1.2rem 0.8rem;
		min-height: 3.6rem;
		font-size: 0.98rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.hint {
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.note {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
</style>
