<script lang="ts">
	// Figure 3.1.1 — click edges of a graph; vertices of odd degree glow red
	// ("loose ends"); when there are none, the edge set is a cycle. The chips add
	// the rim of a face to the selection by symmetric difference.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from './GraphCanvas.svelte';
	import { bowtie, bowtieLabelOffsets, degrees, oddVertices, symDiff, transposePts } from './graphs';
	import Mark from '$lib/components/ui/Mark.svelte';

	const G = bowtie;
	const n = G.pos.length;

	// on narrow screens draw the bow-tie standing up (x and y swapped)
	let width = $state(800);
	const portrait = $derived(width < 540);
	const pos = $derived(portrait ? transposePts(G.pos) : G.pos);
	const offs = $derived(portrait ? transposePts(bowtieLabelOffsets) : bowtieLabelOffsets);
	const faceLabels = $derived(G.faces.map((f) => (portrait ? ([f.label[1], f.label[0]] as [number, number]) : f.label)));

	let sel = $state<number[]>([]);
	let flash = $state<number[]>([]);
	let flashTimer: ReturnType<typeof setTimeout> | undefined;

	const selSet = $derived(new Set(sel));
	const deg = $derived(degrees(n, G.edges, sel));
	const odd = $derived(oddVertices(n, G.edges, sel));
	const isCycle = $derived(odd.length === 0);

	function toggle(i: number) {
		sel = selSet.has(i) ? sel.filter((x) => x !== i) : [...sel, i];
		flash = [];
	}
	function addFace(k: number) {
		const f = G.faces[k].edges;
		const cancelled = f.filter((e) => selSet.has(e));
		sel = [...symDiff(sel, f)];
		flash = cancelled;
		clearTimeout(flashTimer);
		flashTimer = setTimeout(() => (flash = []), 1400);
	}
	function clear() {
		sel = [];
		flash = [];
	}

	const name = (v: number) => G.names[v];
	const edgeTeX = (i: number) => G.edges[i].map(name).join('');
	const oddTeX = $derived(odd.map((v) => `${name(v)}\\,{\\scriptstyle(${deg[v]})}`).join(',\\ '));
</script>

<div class="wrap" bind:clientWidth={width}>
	<Svg viewBox={portrait ? '0 30 340 510' : '20 0 532 340'} maxHeight={portrait ? 560 : 420} label="A graph with eight vertices a to h and twelve edges, drawn as a bow-tie with an arch on top. Clicking edges selects them.">
		<GraphCanvas
			{pos}
			edges={G.edges}
			interactive={['edge']}
			onpick={(_, i) => toggle(i)}
			edgeName={(i) => `edge ${edgeTeX(i)}${selSet.has(i) ? ', selected' : ''}`}
			edgeLook={(i) =>
				selSet.has(i)
					? { color: 'var(--gold-bright)', width: 4.2, glow: true }
					: flash.includes(i)
						? { color: 'var(--rose)', width: 3, dash: '5 6', glow: true, opacity: 0.85 }
						: { color: 'rgba(206,198,176,0.42)', width: 2.2 }}
			vertexLook={(v) => ({
				label: name(v),
				labelOffset: offs[v],
				...(deg[v] % 2 === 1
					? { color: '#ff9a9a', ring: 'var(--red)', glow: true, pulse: true, labelColor: 'var(--red)' }
					: deg[v] > 0
						? { labelColor: 'var(--gold-pale)' }
						: { labelColor: 'var(--ink-dim)' })
			})}
		/>
		{#each G.faces as f, k (f.name)}
			<foreignObject x={faceLabels[k][0] - 30} y={faceLabels[k][1] - 13} width="60" height="26" style="overflow:visible;pointer-events:none">
				<div class="flabel"><TeX tex={f.name} /></div>
			</foreignObject>
		{/each}
	</Svg>

	<div class="readout ui" aria-live="polite">
		<div class="status" class:ok={isCycle && sel.length > 0} class:bad={!isCycle} class:none={sel.length === 0}>
			{#if sel.length === 0}
				<span class="badge">empty</span> No edges chosen. (The empty set passes the test too — it is the “zero cycle”.)
			{:else if isCycle}
				<span class="badge"><Mark ok size={12} /> cycle</span> Every vertex has even degree: no loose ends.
			{:else}
				<span class="badge"><Mark ok={false} size={12} /> not a cycle</span>
				{odd.length} loose ends (odd degree): <TeX tex={oddTeX} />
			{/if}
		</div>
		<div class="count nums">{sel.length} edge{sel.length === 1 ? '' : 's'} chosen</div>
	</div>

	<Controls>
		<span class="lbl">Add a face rim:</span>
		<div class="chips">
			{#each G.faces as f, k (f.name)}
				<button class="chip" onclick={() => addFace(k)} aria-label="add the rim of face {k + 1}">+ <TeX tex={f.name} /></button>
			{/each}
		</div>
		<Button variant="subtle" onclick={clear}>Clear</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.flabel {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: rgba(116, 169, 255, 0.55);
		font-size: 15px;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.4rem 1rem;
		padding: 0.5rem 1.2rem 0.8rem;
		font-size: 0.85rem;
		color: var(--ink-dim);
		min-height: 3.2rem;
	}
	.status {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.25rem 0.55rem;
	}
	.badge {
		font-size: 0.7rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		color: var(--ink-faint);
	}
	.ok .badge {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		border-color: transparent;
		box-shadow: 0 0 14px -2px var(--gold-glow);
	}
	.bad .badge {
		color: var(--red);
		border-color: rgba(255, 127, 127, 0.5);
		background: rgba(255, 127, 127, 0.08);
	}
	.count {
		color: var(--ink-faint);
		font-size: 0.78rem;
	}
	.lbl {
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.chip {
		min-height: 2.1rem;
		padding: 0.2rem 0.75rem;
		border-radius: 999px;
		border: 1px solid rgba(116, 169, 255, 0.35);
		background: rgba(116, 169, 255, 0.07);
		color: var(--blue);
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.18s var(--ease);
	}
	.chip:hover {
		background: rgba(116, 169, 255, 0.16);
		border-color: var(--blue);
	}
</style>
