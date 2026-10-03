<script lang="ts">
	// The homology calculator. Pick a space from the gallery, or type your own
	// simplices; see the f-vector, χ, boundary matrices, ranks, invariant
	// factors, homology over ℤ, ℚ, ℤ/2 and ℤ/3, orientability, and mod-2
	// generators drawn on the picture (flat or in 3D).
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import FlatComplex from '../homology-groups/FlatComplex.svelte';
	import Complex3DView from './Complex3DView.svelte';
	import { SimplicialComplex } from '$lib/math/complex';
	import { groupTeX } from '$lib/math/homology';
	import { gallery, parseFacets, facetsText, autoLayout, summarize } from './calculator';
	import type { Example } from '../homology-groups/complexes';

	const genColors = ['var(--gold-bright)', 'var(--rose)', 'var(--teal)', 'var(--blue)', 'var(--green)', 'var(--amber)'];
	const genColors3D = ['gold', 'rose', 'teal', 'blue', 'green', 'amber'];

	let mode = $state<'gallery' | 'build'>('gallery');
	let pick = $state('klein');
	let text = $state('012, 023, 013');
	let applied = $state('012, 023, 013');
	let view = $state<'2d' | '3d'>('2d');
	let active = $state<{ k: number; i: number } | null>(null);
	let showAll = $state(true);

	const entry = $derived(gallery.find((g) => g.id === pick)!);
	const parsed = $derived(parseFacets(applied));
	const built = $derived.by((): Example | null => {
		if (parsed.error) return null;
		const K = new SimplicialComplex(parsed.facets);
		return { id: 'custom', name: 'Your complex', space: 'K', K, L: autoLayout(K) };
	});
	const ex = $derived<Example | null>(mode === 'gallery' ? entry.make() : built);
	const preferred = $derived(ex?.cycles?.filter((c) => c.k === 1).map((c) => c.chain.flatMap((x, i) => (x ? [i] : []))) ?? []);
	const S = $derived(ex ? summarize(ex.K, preferred) : null);
	const can3d = $derived(mode === 'gallery' && !!entry.view3d);
	const dims = $derived(S ? S.Z.map((_, k) => k) : []);

	// highlighted generators: one chosen, or all
	const highlight = $derived.by(() => {
		const edges = new Map<number, number>();
		const tris = new Map<number, number>();
		if (!S) return { edges, tris };
		const sel = active;
		S.gens.forEach((list, k) => {
			list.forEach((g, i) => {
				const on = sel ? sel.k === k && sel.i === i : showAll && k === 1;
				if (!on) return;
				const target = k === 1 ? edges : k === 2 ? tris : null;
				if (!target) return;
				for (const s of g) if (!target.has(s)) target.set(s, i);
			});
		});
		return { edges, tris };
	});
	const edges3D = $derived(new Map([...highlight.edges].map(([s, i]) => [s, genColors3D[i % genColors3D.length]])));
	const tris3D = $derived(new Map([...highlight.tris].map(([s, i]) => [s, i === 0 ? 'violet' : genColors3D[i % genColors3D.length]])));

	function choose(id: string) {
		mode = 'gallery';
		pick = id;
		active = null;
		if (!gallery.find((g) => g.id === id)?.view3d) view = '2d';
	}
	function editCopy() {
		if (!ex) return;
		text = facetsText(ex.K);
		applied = text;
		mode = 'build';
		view = '2d';
		active = null;
	}
	function apply() {
		applied = text;
		mode = 'build';
		active = null;
	}
	const lab = (s: number[]) => `[${s.join(',')}]`;
	const inv = (x: { ones: number; others: number[] }) => {
		const parts: string[] = [];
		if (x.ones) parts.push(`1^{${x.ones}}`);
		const counts = new Map<number, number>();
		for (const d of x.others) counts.set(d, (counts.get(d) ?? 0) + 1);
		for (const [d, c] of counts) parts.push(c === 1 ? `\\hole{${d}}` : `\\hole{${d}}^{${c}}`);
		return parts.length ? parts.join(',\\ ') : '\\text{none}';
	};
	/** name a generator after the gallery's named loop it equals, if any */
	const genName = (k: number, i: number) => {
		if (k === 1 && ex?.cycles && S) {
			const g = [...S.gens[1][i]].sort((x, y) => x - y).join();
			const hit = ex.cycles.find((c) => c.k === 1 && c.chain.flatMap((x, j) => (x ? [j] : [])).join() === g);
			if (hit) return hit.tex;
		}
		if (k >= 2) return (S?.gens[k].length ?? 0) > 1 ? `\\Sigma_{${i + 1}}` : '\\Sigma';
		return `g_{${i + 1}}`;
	};
</script>

<div class="calc">
	<div class="gal ui" role="toolbar" aria-label="Choose a space">
		{#each gallery as g (g.id)}
			<button class="chip" class:on={mode === 'gallery' && pick === g.id} onclick={() => choose(g.id)}>{g.label}</button>
		{/each}
		<button class="chip build" class:on={mode === 'build'} onclick={() => (mode = 'build')}>✎ Build your own</button>
	</div>

	{#if mode === 'build'}
		<div class="editor ui">
			<label for="facets">Simplices (maximal ones are enough; faces are added automatically)</label>
			<div class="ed-row">
				<textarea id="facets" bind:value={text} rows="2" spellcheck="false"></textarea>
				<Button variant="gold" onclick={apply}>Compute</Button>
			</div>
			<div class="ed-help">
				Write <code>012</code> for the triangle on vertices 0, 1, 2, <code>34</code> for an edge, <code>[10,11,12]</code> for labels above 9. Try
				<button class="ex" onclick={() => ((text = '012, 023, 013'), apply())}>three faces of a tetrahedron</button>, then add <code>123</code>; or
				<button class="ex" onclick={() => ((text = '012, 123, 234, 340, 401'), apply())}>a Möbius band</button>, then add the cone
				<button class="ex" onclick={() => ((text = '012, 123, 234, 340, 401, 025, 135, 245, 035, 145'), apply())}>025, 135, 245, 035, 145</button>.
			</div>
			{#if parsed.error}<div class="err">{parsed.error}</div>{/if}
		</div>
	{/if}

	{#if ex && S}
		<div class="main">
			<div class="pic">
				<div class="pic-top ui">
					<span class="nm">{ex.name} <TeX tex={ex.space} /></span>
					{#if can3d}
						<Segmented
							bind:value={view}
							options={[
								{ value: '2d', label: 'flat' },
								{ value: '3d', label: '3D' }
							]}
							label="View"
						/>
					{/if}
				</div>
				{#if view === '3d' && can3d && entry.view3d}
					{#key pick}
						<Complex3DView {ex} view={entry.view3d} edges={edges3D} tris={tris3D} />
					{/key}
				{:else}
					<Svg viewBox={ex.L.viewBox} maxHeight={360} label="A flat picture of {ex.name}">
						<FlatComplex
							L={ex.L}
							edgeColor={(e) => (highlight.edges.has(e) ? genColors[highlight.edges.get(e)! % genColors.length] : null)}
							triFill={(t) => (highlight.tris.has(t) ? 'var(--violet)' : null)}
							triOpacity={() => 0.28}
							showLabels={ex.K.count(0) <= 16}
						/>
					</Svg>
				{/if}
				<div class="gens ui">
					<span class="gl">mod-2 generators</span>
					{#each S.gens as list, k (k)}
						{#if k >= 1}
							{#each list as _, i (i)}
								<button
									class="g"
									class:on={active?.k === k && active?.i === i}
									style="--gc:{k === 1 ? genColors[i % genColors.length] : 'var(--violet)'}"
									onclick={() => (active = active?.k === k && active?.i === i ? null : { k, i })}
									><TeX tex={`${genName(k, i)}\\in H_${k}`} /></button
								>
							{/each}
						{/if}
					{/each}
					{#if S.gens.every((l, k) => k === 0 || l.length === 0)}<span class="none">none: mod 2, every cycle bounds</span>{/if}
					<label class="all"><input type="checkbox" bind:checked={showAll} /> show all loops</label>
				</div>
			</div>

			<div class="facts ui">
				<div class="row">
					<span class="lb">f-vector</span>
					<span><TeX tex={`(${S.f.join(', ')})`} /></span>
				</div>
				<div class="row">
					<span class="lb">Euler characteristic</span>
					<span><TeX tex={`\\chi = ${S.f.map((n, k) => (k ? (k % 2 ? ` - ${n}` : ` + ${n}`) : `${n}`)).join('')} = ${S.chi}`} /></span>
				</div>
				{#if S.closed}
					<div class="row">
						<span class="lb">closed surface</span>
						<span class={S.orientable ? 'yes' : 'no'}>{S.orientable ? 'orientable' : 'non-orientable'}</span>
					</div>
				{/if}
				<table class="ht">
					<thead>
						<tr>
							<th></th>
							<th>over <TeX tex={'\\Z'} /></th>
							<th><TeX tex={'\\Q'} /></th>
							<th><TeX tex={'\\Z/2'} /></th>
							<th><TeX tex={'\\Z/3'} /></th>
						</tr>
					</thead>
					<tbody>
						{#each dims as k (k)}
							<tr>
								<td class="k"><TeX tex={`H_${k}`} /></td>
								<td class="z" class:tor={S.Z[k].torsion.length > 0}><TeX tex={groupTeX(S.Z[k])} /></td>
								<td>{S.Q[k]}</td>
								<td class:diff={S.Z2[k] !== S.Q[k]}>{S.Z2[k]}</td>
								<td class:diff={S.Z3[k] !== S.Q[k]}>{S.Z3[k]}</td>
							</tr>
						{/each}
					</tbody>
				</table>
				<div class="sub">The last three columns are Betti numbers (dimensions). Numbers that differ from the <TeX tex={'\\Q'} /> column are caused by torsion.</div>
				<div class="ranks">
					{#each S.ranksQ as r, i (i)}
						<div class="rk">
							<TeX tex={`\\partial_${i + 1}`} />
							<span>rank {r} over <TeX tex={'\\Q'} />, {S.ranksZ2[i]} over <TeX tex={'\\Z/2'} /></span>
							<span class="if">invariant factors <TeX tex={inv(S.invariant[i])} /></span>
						</div>
					{/each}
				</div>
				{#if mode === 'gallery'}
					<div class="edit"><Button variant="subtle" onclick={editCopy}>✎ Edit a copy of this complex</Button></div>
				{/if}
			</div>
		</div>
		<details class="mats ui">
			<summary>Boundary matrices</summary>
			{#each S.ranksQ as _, i (i)}
				{@const k = i + 1}
				{#if ex.K.count(k) * ex.K.count(k - 1) <= 3000}
					<div class="m">
						<MatrixView M={ex.K.boundaryMatrix(k)} rowLabels={ex.K.simplices[k - 1].map(lab)} colLabels={ex.K.simplices[k].map(lab)} caption={`\\partial_${k} =`} />
					</div>
				{:else}
					<p class="big">The matrix of <TeX tex={`\\partial_${k}`} /> is {ex.K.count(k - 1)} × {ex.K.count(k)}: too large to display here.</p>
				{/if}
			{/each}
		</details>
	{/if}
</div>

<style>
	.calc {
		padding: 0.8rem 1.1rem 1rem;
	}
	@media (max-width: 640px) {
		.calc {
			padding: 0.6rem 0.5rem 0.8rem;
		}
	}
	.gal {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin-bottom: 0.8rem;
	}
	.chip {
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.04);
		color: var(--ink-dim);
		border-radius: 999px;
		padding: 0.32rem 0.75rem;
		font-size: 0.78rem;
		cursor: pointer;
		transition: all 0.18s var(--ease);
		min-height: 32px;
	}
	.chip:hover {
		color: var(--ink-bright);
		border-color: var(--gold);
	}
	.chip.on {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		border-color: transparent;
		font-weight: 650;
	}
	.chip.build {
		border-style: dashed;
	}
	.editor {
		margin-bottom: 0.9rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.editor label {
		display: block;
		margin-bottom: 0.3rem;
	}
	.ed-row {
		display: flex;
		gap: 0.6rem;
		align-items: stretch;
	}
	textarea {
		flex: 1;
		font-family: var(--font-mono);
		font-size: 0.86rem;
		background: rgba(4, 7, 14, 0.7);
		color: var(--ink-bright);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 0.5rem 0.6rem;
		resize: vertical;
	}
	.ed-help {
		margin-top: 0.4rem;
		line-height: 1.6;
	}
	.ex {
		background: none;
		border: 0;
		padding: 0;
		color: var(--gold-bright);
		text-decoration: underline dotted;
		cursor: pointer;
		font-size: inherit;
	}
	.err {
		margin-top: 0.4rem;
		color: var(--amber);
	}
	.main {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
		gap: 0.8rem 1.4rem;
		align-items: start;
	}
	@media (max-width: 860px) {
		.main {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.pic-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.3rem;
	}
	.nm {
		font-size: 0.82rem;
		color: var(--ink-bright);
	}
	.gens {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
		margin-top: 0.5rem;
		font-size: 0.78rem;
	}
	.gl {
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-right: 0.2rem;
	}
	.g {
		border: 1px solid color-mix(in srgb, var(--gc) 55%, transparent);
		background: color-mix(in srgb, var(--gc) 8%, transparent);
		color: var(--ink-bright);
		border-radius: 8px;
		padding: 0.15rem 0.5rem;
		cursor: pointer;
		min-height: 30px;
	}
	.g.on {
		background: color-mix(in srgb, var(--gc) 30%, transparent);
		box-shadow: 0 0 12px -3px var(--gc);
	}
	.none {
		color: var(--ink-faint);
	}
	.all {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		margin-left: auto;
		color: var(--ink-faint);
		cursor: pointer;
	}
	.facts {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		font-size: 0.84rem;
		color: var(--ink);
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: baseline;
		border-bottom: 1px solid var(--line-faint);
		padding-bottom: 0.3rem;
	}
	.lb {
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.yes {
		color: var(--green);
	}
	.no {
		color: var(--rose);
	}
	.ht {
		margin: 0.3rem 0 0 !important;
		font-size: 0.95rem !important;
	}
	.ht th,
	.ht td {
		padding: 0.35em 0.6em !important;
		text-align: center !important;
		text-transform: none !important;
	}
	.ht td.k {
		color: var(--ink-dim);
	}
	.ht td.tor {
		background: rgba(242, 141, 182, 0.1);
	}
	.ht td.diff {
		color: var(--rose);
		font-weight: 700;
	}
	.sub {
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.ranks {
		display: grid;
		gap: 0.25rem;
		margin-top: 0.2rem;
	}
	.rk {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.6rem;
		align-items: baseline;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.rk .if {
		color: var(--ink-faint);
	}
	.edit {
		margin-top: 0.2rem;
	}
	.mats {
		margin-top: 0.9rem;
		border-top: 1px solid var(--line-faint);
		padding-top: 0.5rem;
	}
	.mats summary {
		cursor: pointer;
		font-size: 0.78rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		padding: 0.3rem 0;
	}
	.m {
		margin: 0.6rem 0;
		overflow-x: auto;
	}
	.big {
		font-size: 0.85rem;
		color: var(--ink-faint);
	}
</style>
