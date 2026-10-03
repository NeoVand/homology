<script lang="ts">
	// Figure: the boundary matrix ∂ and the coboundary matrix δ = ∂ᵀ side by side,
	// linked to a picture of the complex. A column of ∂ (the faces of a simplex)
	// is a row of δ (what the coboundary looks at). Tap a simplex to put a 1 on it
	// and see its coboundary: ±1 on the simplices it is a face of.
	import Svg from '$lib/components/svg/Svg.svelte';
	import ComplexView2D from '$lib/components/svg/ComplexView2D.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { SimplicialComplex } from '$lib/math/complex';
	import { transpose } from '$lib/math/linalg';

	const K = new SimplicialComplex([
		[0, 1, 2],
		[1, 2, 3]
	]);
	const pos: [number, number][] = [
		[70, 160],
		[200, 52],
		[200, 268],
		[330, 160]
	];
	const name = (s: number[]) => s.join('');

	let k = $state(0);
	// hovered cell: a k-simplex (face) and a (k+1)-simplex (coface)
	let face = $state<number | null>(null);
	let coface = $state<number | null>(null);
	// the k-simplex carrying the unit cochain
	let unit = $state<number | null>(1);

	const D = $derived(K.boundaryMatrix(k + 1)); // rows: k-simplices, cols: (k+1)-simplices
	const Dt = $derived(transpose(D)); // δ_k
	const rowsK = $derived(K.simplices[k].map((s) => `[${s.join(',')}]`));
	const rowsK1 = $derived(K.simplices[k + 1].map((s) => `[${s.join(',')}]`));
	const cob = $derived(unit === null ? null : K.coboundary(k, K.simplices[k].map((_, i) => (i === unit ? 1 : 0))));

	$effect(() => {
		void k;
		unit = k === 0 ? 1 : 2;
		face = null;
		coface = null;
	});

	const goldOf = (kind: number, i: number) => (kind === k && (i === face || i === unit) ? 'var(--gold-bright)' : null);
	const cofaceColor = (kind: number, i: number) => (kind === k + 1 && i === coface ? 'var(--teal)' : null);
	const unitName = $derived(unit === null ? '' : name(K.simplices[k][unit]));
	const formula = $derived(
		k === 0
			? `(\\delta f)([a,b]) = f(\\partial[a,b]) = f(b) - f(a)`
			: `(\\delta \\psi)([a,b,c]) = \\psi(\\partial[a,b,c]) = \\psi([b,c]) - \\psi([a,c]) + \\psi([a,b])`
	);
	const unitTeX = $derived(
		unit === null || !cob
			? ''
			: `\\delta\\big(\\mathbf 1_{${unitName}}\\big) = ` +
					(cob
						.map((x, j) => (x ? `${x < 0 ? '-' : '+'}\\,\\mathbf 1_{${name(K.simplices[k + 1][j])}}` : ''))
						.filter(Boolean)
						.join(' ')
						.replace(/^\+\\,/, '') || '0')
	);
</script>

<Controls>
	<Segmented
		bind:value={k}
		options={[
			{ value: 0, label: 'Degree 0: vertices → edges' },
			{ value: 1, label: 'Degree 1: edges → triangles' }
		]}
		label="Which degree"
	/>
</Controls>
<div class="md">
	<div class="pic">
		<Svg viewBox="30 20 340 280" maxHeight={300} label="Two triangles sharing an edge">
			<ComplexView2D
				{K}
				{pos}
				orient={true}
				vertexColor={(i) => goldOf(0, i) ?? cofaceColor(0, i)}
				edgeColor={(i) => goldOf(1, i) ?? cofaceColor(1, i) ?? (k === 0 && cob && cob[i] ? 'var(--teal)' : null)}
				triColor={(i) => cofaceColor(2, i) ?? (k === 1 && cob && cob[i] ? 'var(--teal)' : null)}
				vertexLabel={(i) => String(K.simplices[0][i][0])}
				edgeLabel={(i) => (k === 0 && cob && cob[i] ? (cob[i] > 0 ? '+1' : '-1') : null)}
				triLabel={(i) => (k === 1 && cob && cob[i] ? (cob[i] > 0 ? '+1' : '-1') : null)}
				interactive={k === 0 ? ['vertex'] : ['edge']}
				onpick={(_, i) => (unit = i)}
			/>
		</Svg>
		<p class="note ui">Tap a {k === 0 ? 'vertex' : 'edge'} to put a 1 on it: its coboundary is ±1 on the {k === 0 ? 'edges' : 'triangles'} it is a face of.</p>
		<div class="unit"><TeX tex={unitTeX} /></div>
	</div>
	<div class="mats">
		<div class="mat">
			<div class="mtitle ui">Boundary <TeX tex={`\\partial_${k + 1}`} />: columns list faces</div>
			<MatrixView
				M={D}
				rowLabels={rowsK}
				colLabels={rowsK1}
				highlightRows={unit === null ? [] : [unit]}
				cellClass={(i, j) => (i === face && j === coface ? 'pivot' : D[i][j] && i === unit ? 'teal' : undefined)}
				onhover={(i, j) => ((face = i), (coface = j))}
			/>
		</div>
		<div class="mat">
			<div class="mtitle ui">Coboundary <TeX tex={`\\delta_${k} = \\partial_${k + 1}^{\\mathsf T}`} />: rows list faces</div>
			<MatrixView
				M={Dt}
				rowLabels={rowsK1}
				colLabels={rowsK}
				highlightCols={unit === null ? [] : [unit]}
				cellClass={(i, j) => (i === coface && j === face ? 'pivot' : Dt[i][j] && j === unit ? 'teal' : undefined)}
				onhover={(i, j) => ((coface = i), (face = j))}
			/>
		</div>
		<div class="formula"><TeX tex={formula} /></div>
	</div>
</div>

<style>
	.md {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 0.6rem 1rem;
		padding: 0.8rem 1rem 0.9rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.md {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.note {
		font-size: 0.74rem;
		color: var(--ink-dim);
		text-align: center;
		margin: 0.3rem 0 0.2rem;
		line-height: 1.4;
	}
	.unit {
		text-align: center;
		color: var(--teal);
		font-size: 0.95rem;
		min-height: 1.6em;
	}
	.mats {
		display: grid;
		gap: 0.9rem;
	}
	.mtitle {
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		color: var(--ink-faint);
		margin-bottom: 0.3rem;
	}
	.mtitle :global(.katex) {
		color: var(--ink-bright);
		font-size: 1.1em;
	}
	.formula {
		font-size: 0.9rem;
		color: var(--ink-dim);
		overflow-x: auto;
	}
</style>
