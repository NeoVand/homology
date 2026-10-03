<script lang="ts">
	// The standard persistence algorithm, one decision at a time, on a filtration
	// of seven simplices: vertices 0, 1, 2 at time 0; edges 01, 12, 02 at times
	// 1, 2, 3; the triangle 012 at time 4.
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Barcode, { type BarDatum } from './Barcode.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { reduce, reductionTrace, boundaryColumns, type FSimplex } from './ph';

	const simplices: FSimplex[] = [
		{ verts: [0], value: 0 },
		{ verts: [1], value: 0 },
		{ verts: [2], value: 0 },
		{ verts: [0, 1], value: 1 },
		{ verts: [1, 2], value: 2 },
		{ verts: [0, 2], value: 3 },
		{ verts: [0, 1, 2], value: 4 }
	];
	const names = simplices.map((s) => s.verts.join(''));
	const tex = names.map((n) => `\\mathtt{${n}}`);
	const D = boundaryColumns(simplices);
	const trace = reductionTrace(simplices);
	const final = reduce(simplices);
	const m = simplices.length;
	const bars: BarDatum[] = final.pairs
		.filter((p) => p.death - p.birth > 0)
		.map((p, i) => ({ id: i, dim: p.dim, birth: p.birth, death: p.death }))
		.sort((a, b) => a.dim - b.dim || b.death - a.death);

	interface View {
		R: number[][];
		j: number | null;
		other?: number;
		row?: number;
		pairs: [number, number][];
		title: string;
		body: string;
		time: number;
		changed: Set<string>;
	}
	const t = (i: number) => `\\(\\mathtt{${names[i]}}\\)`;
	const set = (c: number[]) => (c.length ? `\\(\\{${c.map((i) => `\\mathtt{${names[i]}}`).join(',\\,')}\\}\\)` : '\\(0\\)');

	const views: View[] = [];
	views.push({
		R: D,
		j: null,
		pairs: [],
		title: 'The boundary matrix',
		body:
			'Rows and columns list the seven simplices in the order they appear. Column ' +
			t(5) +
			' has 1s in rows ' +
			t(0) +
			' and ' +
			t(2) +
			', its two endpoints; the vertex columns are empty, since a point has no boundary. The lowest 1 of a column is its ' +
			'**low**; we will make all the lows different, working from left to right.',
		time: -1,
		changed: new Set()
	});
	let prev = D;
	for (const st of trace) {
		const j = st.j;
		const changed = new Set<string>();
		for (let i = 0; i < m; i++) if (prev[j].includes(i) !== st.R[j].includes(i)) changed.add(`${i},${j}`);
		let title = '';
		let body = '';
		if (st.kind === 'vertex') {
			title = `Column ${names[j]}: a vertex`;
			body = `Column ${t(j)} is empty: vertex ${names[j]} has no boundary. Each new point creates a new piece, so a class is **born** at time 0.`;
		} else if (st.kind === 'pivot') {
			const i = st.row!;
			const zeroLen = simplices[i].value === simplices[j].value;
			title = `Column ${names[j]}: low = ${names[i]}`;
			body =
				`The lowest 1 of column ${t(j)} is in row ${t(i)}, and no column to its left has that low. So ${t(j)} **kills** the class born with ${t(i)}: ` +
				`the pair \\((\\mathtt{${names[i]}}, \\mathtt{${names[j]}})\\) gives the bar \\([${simplices[i].value}, ${simplices[j].value})\\) in \\(H_${simplices[i].verts.length - 1}\\).` +
				(zeroLen ? ' (Its length is zero.)' : '');
		} else if (st.kind === 'clash') {
			title = `Column ${names[j]}: add column ${names[st.other!]}`;
			body =
				`Column ${t(j)} has its low in row ${t(st.row!)} — but column ${t(st.other!)}, further left, already has that low. ` +
				`So add column ${t(st.other!)} to column ${t(j)}, mod 2: the result is ${set(st.R[j])}.`;
		} else {
			title = `Column ${names[j]} becomes zero`;
			body =
				`Column ${t(j)} has become zero. That means ${t(j)} did not kill anything: it **created** a new 1-dimensional class at time ${simplices[j].value}. ` +
				`The columns we added record the cycle that was born: ${st.v.map((i) => t(i)).join(' + ')}, the loop around the triangle.`;
		}
		// while a column is still being reduced, the barcode shows what is known so far (up to the previous column)
		const time = st.kind === 'clash' ? simplices[Math.max(0, j - 1)].value : simplices[j].value;
		views.push({ R: st.R, j, other: st.other, row: st.row, pairs: st.pairs, title, body, time, changed });
		prev = st.R;
	}
	views.push({
		R: final.R,
		j: null,
		pairs: trace[trace.length - 1].pairs,
		title: 'Read off the barcode',
		body:
			'Every nonzero column \\(j\\) pairs \\(\\mathrm{low}(j)\\) with \\(j\\): bars \\([0,1)\\) and \\([0,2)\\) in \\(H_0\\), and \\([3,4)\\) in \\(H_1\\). ' +
			'A zero column that is nobody’s low never dies: vertex \\(\\mathtt{0}\\) gives the bar \\([0,\\infty)\\). That is the whole barcode.',
		time: 5,
		changed: new Set()
	});

	let step = $state(0);
	const v = $derived(views[step]);
	const M = $derived(Array.from({ length: m }, (_, i) => Array.from({ length: m }, (_, j) => (v.R[j].includes(i) ? 1 : 0))));
	const lows = $derived(new Set(v.R.map((c, j) => (c.length && (v.j === null || j <= v.j) ? `${c[c.length - 1]},${j}` : '')).filter(Boolean)));
	function cellClass(i: number, j: number) {
		if (v.changed.has(`${i},${j}`)) return 'rose';
		if (lows.has(`${i},${j}`)) return 'pivot';
		return undefined;
	}
	const hiCols = $derived(v.j === null ? [] : v.other !== undefined ? [v.j, v.other] : [v.j]);
	const hiRows = $derived(v.row !== undefined ? [v.row] : []);

	// the little complex: vertices 0 (left), 1 (right), 2 (top)
	const P: [number, number][] = [
		[30, 120],
		[150, 120],
		[90, 22]
	];
	const presentUpTo = $derived(v.j === null ? m - 1 : v.j);
	const pairedText = $derived(
		v.pairs.length ? v.pairs.map(([i, j]) => `\\((\\mathtt{${names[i]}},\\mathtt{${names[j]}})\\)`).join(', ') : 'none yet'
	);
</script>

<div class="rs">
	<div class="grid">
		<div class="mat">
			<MatrixView {M} rowLabels={tex} colLabels={tex} highlightCols={hiCols} highlightRows={hiRows} {cellClass} />
			<div class="legend ui">
				<span><i class="sw pivot"></i>a low (pivot)</span>
				<span><i class="sw rose"></i>just changed</span>
			</div>
		</div>
		<div class="side">
			<svg viewBox="0 0 180 150" class="cx" role="img" aria-label="The triangle 012, with the simplices present so far">
				{#if presentUpTo >= 6}
					<polygon points={P.map((p) => p.join(',')).join(' ')} class="tri" class:cur={v.j === 6} />
				{/if}
				{#each [[0, 1, 3], [1, 2, 4], [0, 2, 5]] as [a, b, k] (k)}
					{#if presentUpTo >= k}
						<line x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} class="edge" class:cur={v.j === k} />
					{/if}
				{/each}
				{#each [0, 1, 2] as k (k)}
					{#if presentUpTo >= k}
						<circle cx={P[k][0]} cy={P[k][1]} r="6" class="v" class:cur={v.j === k} />
						<text x={P[k][0] + (k === 0 ? -14 : k === 1 ? 14 : 0)} y={P[k][1] + (k === 2 ? -10 : 5)} class="vl">{k}</text>
					{/if}
				{/each}
			</svg>
			<div class="pairs ui">Pairs found: {@html renderMathInText(pairedText)}</div>
			<Barcode {bars} xmax={5} now={v.time < 0 ? 0 : v.time} growing height={120} ticks={[0, 1, 2, 3, 4, 5]} axis="t" />
		</div>
	</div>
	<div class="explain">
		<div class="st ui">{v.title}</div>
		<p>{@html renderMathInText(v.body)}</p>
	</div>
	<div class="controls ui">
		<StepControls bind:step count={views.length} labels={views.map((x) => x.title)} interval={3200} />
	</div>
</div>

<style>
	.rs {
		container-type: inline-size;
		padding: 0.9rem 1rem 0.3rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 1rem 1.4rem;
		align-items: center;
	}
	.mat,
	.side {
		min-width: 0;
	}
	.legend {
		display: flex;
		justify-content: center;
		gap: 1.2rem;
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin-top: 0.4rem;
	}
	.sw {
		display: inline-block;
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 3px;
		margin-right: 0.35rem;
		vertical-align: -0.1rem;
	}
	.sw.pivot {
		background: rgba(216, 178, 110, 0.45);
	}
	.sw.rose {
		background: var(--rose);
	}
	.cx {
		display: block;
		width: 100%;
		max-width: 200px;
		margin: 0 auto;
	}
	.tri {
		fill: rgba(140, 150, 255, 0.22);
		transition: fill 0.3s;
	}
	.tri.cur {
		fill: rgba(95, 214, 207, 0.4);
	}
	.edge {
		stroke: rgba(235, 229, 213, 0.75);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.edge.cur {
		stroke: var(--gold-bright);
		stroke-width: 3.6;
	}
	.v {
		fill: #fff8e8;
		stroke: rgba(165, 128, 63, 0.95);
		stroke-width: 1.4;
	}
	.v.cur {
		fill: var(--gold-bright);
		stroke: #fff;
	}
	.vl {
		fill: var(--ink-dim);
		font-family: var(--font-mono);
		font-size: 13px;
		text-anchor: middle;
	}
	.pairs {
		font-size: 0.8rem;
		color: var(--ink-dim);
		text-align: center;
		margin: 0.3rem 0 0.2rem;
	}
	.explain {
		margin-top: 0.6rem;
		min-height: 7.4em;
	}
	.st {
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 600;
	}
	.explain p {
		margin: 0.3rem 0 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}
	.controls {
		padding: 0.6rem 0 0.7rem;
		border-top: 1px solid var(--line-faint);
		margin-top: 0.4rem;
	}
	.mat :global(.rose) {
		background: rgba(242, 141, 182, 0.28);
		border-radius: 4px;
	}
	@container (max-width: 600px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.explain {
			min-height: 9.5em;
		}
	}
</style>
