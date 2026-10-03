<script lang="ts">
	// Figure 3.1.2 — a spanning tree (blue) of the bow-tie graph; every edge the
	// tree leaves out (gold, numbered) closes up exactly one "fundamental cycle".
	// In "cut" mode the reader deletes edges and watches b₁ = E − V + c.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from './GraphCanvas.svelte';
	import { bowtie, bowtieLabelOffsets, bfsOrder, componentCount, spanningForest, treePath, transposePts } from './graphs';

	const G = bowtie;
	const n = G.pos.length;

	let width = $state(800);
	const portrait = $derived(width < 540);
	const pos = $derived(portrait ? transposePts(G.pos) : G.pos);
	const offs = $derived(portrait ? transposePts(bowtieLabelOffsets) : bowtieLabelOffsets);
	const compColors = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)', 'var(--rose)', 'var(--green)', 'var(--amber)', 'var(--blue)', '#e8e2d0'];

	let mode = $state<'tree' | 'cut'>('tree');
	let cut = $state<number[]>([]);
	let seed = $state(0);
	let picked = $state<number | null>(null);

	function shuffled(s: number): number[] {
		let a = s * 2654435761;
		const rnd = () => {
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
		const idx = G.edges.map((_, i) => i);
		for (let i = idx.length - 1; i > 0; i--) {
			const j = Math.floor(rnd() * (i + 1));
			[idx[i], idx[j]] = [idx[j], idx[i]];
		}
		return idx;
	}

	const alive = (i: number) => !cut.includes(i);
	const order = $derived(seed === 0 ? bfsOrder(n, G.edges, 0) : shuffled(seed));
	const tree = $derived(spanningForest(n, G.edges, alive, order));
	const nonTree = $derived(G.edges.map((_, i) => i).filter((i) => alive(i) && !tree[i]));
	const E = $derived(G.edges.length - cut.length);
	const c = $derived(componentCount(n, G.edges, alive));
	const b1 = $derived(E - n + c);

	// component id of each vertex (for colouring when the graph falls apart)
	const comp = $derived.by(() => {
		const id = new Array<number>(n).fill(-1);
		let k = 0;
		for (let s = 0; s < n; s++) {
			if (id[s] >= 0) continue;
			const stack = [s];
			id[s] = k;
			while (stack.length) {
				const v = stack.pop()!;
				G.edges.forEach(([a, b], i) => {
					if (!alive(i)) return;
					const w = a === v ? b : b === v ? a : -1;
					if (w >= 0 && id[w] < 0) {
						id[w] = k;
						stack.push(w);
					}
				});
			}
			k++;
		}
		return id;
	});

	const pickedValid = $derived(picked !== null && nonTree.includes(picked) ? picked : null);
	const cyclePath = $derived(pickedValid === null ? [] : (treePath(n, G.edges, tree, G.edges[pickedValid][0], G.edges[pickedValid][1]) ?? []));
	const inCycle = $derived(new Set(pickedValid === null ? [] : [pickedValid, ...cyclePath]));

	function pick(i: number) {
		if (mode === 'cut') {
			cut = cut.includes(i) ? cut.filter((x) => x !== i) : [...cut, i];
			return;
		}
		if (!alive(i)) return;
		if (tree[i]) {
			picked = null;
			return;
		}
		picked = picked === i ? null : i;
	}

	const name = (v: number) => G.names[v];
	const edgeTeX = (i: number) => G.edges[i].map(name).join('');
	const tagOf = (i: number) => nonTree.indexOf(i) + 1;

	const cycleTeX = $derived.by(() => {
		if (pickedValid === null) return '';
		const [a] = G.edges[pickedValid];
		const verts = [a];
		let v = a;
		for (const e of cyclePath) {
			v = G.edges[e][0] === v ? G.edges[e][1] : G.edges[e][0];
			verts.push(v);
		}
		verts.push(a);
		return verts.map(name).join(' \\to ');
	});
</script>

<div class="wrap" bind:clientWidth={width}>
	<Svg viewBox={portrait ? '0 30 340 510' : '20 0 532 340'} maxHeight={portrait ? 560 : 420} label="The bow-tie graph with a spanning tree drawn in blue and the edges it leaves out drawn dashed and numbered.">
		<GraphCanvas
			{pos}
			edges={G.edges}
			interactive={['edge']}
			onpick={(_, i) => pick(i)}
			edgeName={(i) =>
				`edge ${edgeTeX(i)}: ${!alive(i) ? 'cut' : tree[i] ? 'tree edge' : `left out, number ${tagOf(i)}`}`}
			edgeLook={(i) => {
				if (!alive(i)) return { color: 'rgba(255,127,127,0.5)', width: 1.6, dash: '2 7', opacity: 0.8 };
				if (inCycle.has(i)) return { color: 'var(--gold-bright)', width: 4.4, glow: true };
				if (tree[i]) return { color: 'var(--blue)', width: 3.4, glow: true };
				return { color: 'rgba(242,208,143,0.75)', width: 2.4, dash: '7 7' };
			}}
			vertexLook={(v) => ({
				label: name(v),
				labelOffset: offs[v],
				...(c > 1 ? { ring: compColors[comp[v] % compColors.length] } : {})
			})}
		/>
		{#if mode === 'tree'}
			{#each nonTree as i (i)}
				{@const [a, b] = G.edges[i]}
				{@const mx = (pos[a][0] + pos[b][0]) / 2}
				{@const my = (pos[a][1] + pos[b][1]) / 2}
				<g class="tag" class:on={pickedValid === i}>
					<circle cx={mx} cy={my} r="12" />
					<text x={mx} y={my + 4.5} text-anchor="middle">{tagOf(i)}</text>
				</g>
			{/each}
		{/if}
	</Svg>

	<div class="readout ui" aria-live="polite">
		<div class="formula">
			<TeX tex={String.raw`b_1 = E - V + c = ${E} - ${n} + ${c} = \cyc{${b1}}`} />
		</div>
		<div class="facts">
			{#if mode === 'tree'}
				<span class="fact"><span class="key blue"></span>tree: {E - nonTree.length} edges <span class="dim">(= V − c)</span></span>
				<span class="fact"><span class="key gold"></span>left out: {nonTree.length} edges</span>
				{#if c > 1}<span class="fact">{c} pieces, so the “tree” is a forest: one tree per piece</span>{/if}
			{:else}
				<span class="fact">cut {cut.length} edge{cut.length === 1 ? '' : 's'} · pieces: <b>{c}</b> · independent cycles: <b>{b1}</b></span>
			{/if}
		</div>
		{#if mode === 'tree'}
			<div class="cyc">
				{#if pickedValid !== null}
					Fundamental cycle of edge <TeX tex={edgeTeX(pickedValid)} /> (number {tagOf(pickedValid)}):
					<TeX tex={cycleTeX} />
				{:else}
					Tap a numbered (dashed) edge to see the one cycle it closes up with the tree.
				{/if}
			</div>
		{/if}
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			label="What a tap does"
			options={[
				{ value: 'tree', label: 'Show fundamental cycles' },
				{ value: 'cut', label: 'Cut edges' }
			]}
		/>
		<Button variant="ghost" onclick={() => ((seed += 1), (picked = null))}>Another spanning tree</Button>
		{#if seed !== 0}
			<Button variant="subtle" onclick={() => ((seed = 0), (picked = null))}>First tree again</Button>
		{/if}
		{#if cut.length}
			<Button variant="subtle" onclick={() => (cut = [])}>Restore all edges</Button>
		{/if}
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.tag {
		cursor: pointer;
		pointer-events: none;
	}
	.tag circle {
		fill: rgba(10, 14, 26, 0.92);
		stroke: rgba(242, 208, 143, 0.75);
		stroke-width: 1.4;
	}
	.tag text {
		fill: var(--gold-bright) !important;
		font-family: var(--font-ui);
		font-size: 13px !important;
		font-weight: 650;
	}
	.tag.on circle {
		fill: var(--gold-bright);
		stroke: #fff6e0;
	}
	.tag.on text {
		fill: #1a1206 !important;
	}
	.readout {
		display: grid;
		gap: 0.35rem;
		padding: 0.4rem 1.2rem 0.85rem;
		font-size: 0.85rem;
		color: var(--ink-dim);
	}
	.formula {
		font-size: 1.15rem;
		color: var(--ink-bright);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.2rem;
	}
	.fact {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.fact b {
		color: var(--gold-bright);
		font-weight: 650;
	}
	.dim {
		color: var(--ink-faint);
	}
	.key {
		width: 1.3rem;
		height: 0;
		border-top: 3px solid var(--blue);
		display: inline-block;
	}
	.key.gold {
		border-top: 2px dashed var(--gold);
	}
	.cyc {
		min-height: 1.6rem;
		color: var(--ink);
	}
</style>
