<script lang="ts">
	// Figure 3.2.1 — a ℤ/2 chain playground. Tap triangles (or edges) to build a
	// chain c; its boundary ∂c — faces counted an odd number of times — glows
	// teal. "Boundary again" computes ∂∂c, which is always 0.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from '../cycles-and-boundaries/GraphCanvas.svelte';
	import { boundaryZ2, Z2HomologyBasis } from '$lib/math/homology';
	import { fan, setTeX } from './chains';

	const K = fan.K;
	const edges = K.simplices[1] as [number, number][];
	const tris = K.simplices[2] as [number, number, number][];
	const H1 = new Z2HomologyBasis(K, 1);

	let mode = $state<'tri' | 'edge'>('tri');
	let c2 = $state<number[]>([0, 1]);
	let c1 = $state<number[]>([]);
	let again = $state(false);

	const set2 = $derived(new Set(c2));
	const set1 = $derived(new Set(c1));
	const d2 = $derived(boundaryZ2(K, 2, c2)); // edges
	const d2set = $derived(new Set(d2));
	const d1 = $derived(boundaryZ2(K, 1, c1)); // vertices
	const d1set = $derived(new Set(d1));
	// how many edges of ∂c touch each vertex (the "each vertex counted twice" picture)
	const touch = $derived.by(() => {
		const t = new Array<number>(K.count(0)).fill(0);
		for (const e of d2) for (const v of edges[e]) t[v]++;
		return t;
	});
	const dd = $derived(boundaryZ2(K, 1, d2));
	const isCycle1 = $derived(c1.length > 0 && d1.length === 0);
	const isBdry1 = $derived(isCycle1 && H1.isBoundary(c1));

	function pick(kind: string, i: number) {
		again = false;
		if (kind === 'tri') c2 = set2.has(i) ? c2.filter((x) => x !== i) : [...c2, i];
		else if (kind === 'edge') c1 = set1.has(i) ? c1.filter((x) => x !== i) : [...c1, i];
	}
	const vio = (t: string) => `\\chn{${t}}`;
	const tea = (t: string) => `\\bdy{${t}}`;
</script>

<div class="wrap">
	<Svg viewBox="110 22 380 318" maxHeight={430} label="A hexagonal fan of five filled triangles around a centre vertex 0, with an empty sixth triangle. Tap triangles or edges to build a chain; its boundary is highlighted.">
		<GraphCanvas
			pos={fan.pos}
			{edges}
			{tris}
			hit={34}
			interactive={mode === 'tri' ? ['tri'] : ['edge']}
			onpick={pick}
			triName={(i) => `triangle ${tris[i].join('')}${set2.has(i) ? ', in the chain' : ''}`}
			edgeName={(i) => `edge ${edges[i].join('')}${set1.has(i) ? ', in the chain' : ''}`}
			triLook={(i) =>
				mode === 'tri' && set2.has(i)
					? { fill: 'rgba(164,147,255,0.42)', glow: true, label: `[${tris[i].join(',')}]`, labelColor: '#e6e0ff' }
					: { fill: 'rgba(116,169,255,0.07)' }}
			edgeLook={(i) => {
				if (mode === 'tri' && d2set.has(i)) return { color: 'var(--teal)', width: 4.6, glow: true };
				if (mode === 'edge' && set1.has(i)) return { color: 'var(--violet)', width: 4.4, glow: true };
				return { color: 'rgba(206,198,176,0.4)', width: 2 };
			}}
			vertexLook={(v) => {
				const base = { label: String(v), labelOffset: (v === 0 ? [0, -20] : [(fan.pos[v][0] - 300) * 0.16, (fan.pos[v][1] - 180) * 0.16]) as [number, number] };
				if (mode === 'edge' && d1set.has(v)) return { ...base, color: 'var(--teal)', ring: 'var(--teal)', glow: true, labelColor: 'var(--teal)' };
				if (mode === 'tri' && again && touch[v] > 0) return { ...base, ring: 'var(--gold-bright)', labelColor: 'var(--gold-bright)' };
				return base;
			}}
		/>
		{#if mode === 'tri' && again}
			{#each touch as t, v (v)}
				{#if t > 0}
					{@const [x, y] = fan.pos[v]}
					{@const dx = v === 0 ? 0 : (x - 300) * 0.24}
					{@const dy = v === 0 ? 30 : (y - 180) * 0.24}
					<g class="count">
						<circle cx={x + dx} cy={y + dy} r="11" />
						<text x={x + dx} y={y + dy + 4.5} text-anchor="middle">{t}</text>
					</g>
				{/if}
			{/each}
		{/if}
	</Svg>

	<div class="readout ui" aria-live="polite">
		{#if mode === 'tri'}
			<div class="line"><span class="lab">chain</span><TeX tex={String.raw`c = ${setTeX(K, 2, c2, vio)}`} /></div>
			<div class="line"><span class="lab">boundary</span><TeX tex={String.raw`\partial c = ${setTeX(K, 1, d2, tea)}`} /></div>
			{#if again}
				<div class="line ok">
					<span class="lab">again</span><TeX tex={String.raw`\partial\partial c = ${setTeX(K, 0, dd)}`} />
					<span class="note">— every vertex of \(\partial c\) touches an even number of its edges (the gold counts), so nothing survives.</span>
				</div>
			{/if}
		{:else}
			<div class="line"><span class="lab">chain</span><TeX tex={String.raw`c = ${setTeX(K, 1, c1, vio)}`} /></div>
			<div class="line"><span class="lab">boundary</span><TeX tex={String.raw`\partial c = ${setTeX(K, 0, d1, tea)}`} /></div>
			<div class="line">
				{#if c1.length === 0}
					<span class="note">Tap edges to build a 1-chain. Its boundary is its set of loose ends.</span>
				{:else if isCycle1}
					<span class="badge gold">cycle</span>
					{#if isBdry1}<span class="badge teal">boundary</span><span class="note">It is also the boundary of some triangles.</span>
					{:else}<span class="note">No loose ends — but it bounds no set of triangles: it goes around the empty triangle.</span>{/if}
				{:else}
					<span class="note">Loose ends at {d1.length} vertices.</span>
				{/if}
			</div>
			{#if again}
				<div class="line ok">
					<span class="lab">again</span><TeX tex={String.raw`\partial\partial c = 0`} />
					<span class="note">— a vertex has no faces, so the boundary of any 0-chain is 0.</span>
				</div>
			{/if}
		{/if}
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			onchange={() => (again = false)}
			label="Which chains"
			options={[
				{ value: 'tri', label: '2-chains: tap triangles' },
				{ value: 'edge', label: '1-chains: tap edges' }
			]}
		/>
		<Button variant="gold" onclick={() => (again = !again)}>{again ? 'Hide' : 'Take the boundary again'}</Button>
		<Button variant="subtle" onclick={() => ((c2 = []), (c1 = []), (again = false))}>Clear</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.count circle {
		fill: rgba(10, 14, 26, 0.92);
		stroke: var(--gold-bright);
		stroke-width: 1.4;
	}
	.count text {
		fill: var(--gold-bright) !important;
		font-family: var(--font-ui);
		font-size: 13px !important;
		font-weight: 700;
	}
	.readout {
		display: grid;
		gap: 0.35rem;
		padding: 0.5rem 1.2rem 0.85rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		min-height: 6.4rem;
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.6rem;
		font-size: 1rem;
		color: var(--ink-bright);
	}
	.lab {
		width: 5.2rem;
		flex: none;
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.note {
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.ok .lab {
		color: var(--gold);
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
	}
	.badge.gold {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
	}
	.badge.teal {
		color: #062320;
		background: var(--teal);
	}
</style>
