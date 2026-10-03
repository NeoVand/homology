<script lang="ts">
	// Figure: the Euler characteristic of a graph, V − E, and what it counts:
	// (number of pieces) − (number of independent loops). Every new edge either
	// joins two pieces or closes a new loop.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { analyseGraph, fundamentalLoop, type Edge } from './graph';
	import { segDist, type Pt } from '../simplicial-complexes/builder';

	interface Vtx {
		id: number;
		x: number;
		y: number;
	}
	const W = 600;
	const H = 360;
	const presets: Record<string, { name: string; verts: Vtx[]; edges: Edge[] }> = {
		theta: {
			name: 'Theta',
			verts: [
				{ id: 0, x: 170, y: 180 },
				{ id: 1, x: 430, y: 180 },
				{ id: 2, x: 300, y: 80 },
				{ id: 3, x: 300, y: 180 },
				{ id: 4, x: 300, y: 280 }
			],
			edges: [
				[0, 2],
				[2, 1],
				[0, 3],
				[3, 1],
				[0, 4],
				[4, 1]
			]
		},
		tree: {
			name: 'A tree',
			verts: [
				{ id: 0, x: 120, y: 260 },
				{ id: 1, x: 220, y: 170 },
				{ id: 2, x: 330, y: 230 },
				{ id: 3, x: 300, y: 90 },
				{ id: 4, x: 450, y: 150 },
				{ id: 5, x: 470, y: 280 }
			],
			edges: [
				[0, 1],
				[1, 2],
				[1, 3],
				[2, 4],
				[2, 5]
			]
		},
		k4: {
			name: 'K₄',
			verts: [
				{ id: 0, x: 300, y: 60 },
				{ id: 1, x: 160, y: 290 },
				{ id: 2, x: 440, y: 290 },
				{ id: 3, x: 300, y: 205 }
			],
			edges: [
				[0, 1],
				[0, 2],
				[0, 3],
				[1, 2],
				[1, 3],
				[2, 3]
			]
		},
		two: {
			name: 'Two pieces',
			verts: [
				{ id: 0, x: 110, y: 120 },
				{ id: 1, x: 230, y: 90 },
				{ id: 2, x: 190, y: 240 },
				{ id: 3, x: 380, y: 130 },
				{ id: 4, x: 500, y: 200 },
				{ id: 5, x: 390, y: 280 }
			],
			edges: [
				[0, 1],
				[1, 2],
				[0, 2],
				[3, 4],
				[4, 5]
			]
		}
	};

	let verts = $state<Vtx[]>(structuredClone(presets.theta.verts));
	let edges = $state<Edge[]>(structuredClone(presets.theta.edges));
	let mode = $state<'add' | 'move' | 'delete'>('add');
	let sel = $state<number | null>(null);
	let hoverEdge = $state<number | null>(null);
	let dragId = $state<number | null>(null);
	let nextId = $state(5);
	let lastMsg = $state('');
	let svgEl = $state<SVGSVGElement>();
	let cw = $state(600);
	const u = $derived(W / Math.max(cw, 1));
	const vs = $derived(Math.max(1, 0.78 * u));

	const A = $derived(analyseGraph(verts.map((v) => v.id), edges));
	const loopSet = $derived(
		hoverEdge !== null && !A.inTree[hoverEdge] ? new Set(fundamentalLoop(edges, A.inTree, hoverEdge)) : new Set<number>()
	);
	const pieceCols = ['#74a9ff', '#5fd6cf', '#a493ff', '#f28db6', '#84d9a2', '#f4b55f'];
	const P = (id: number): Pt => {
		const v = verts.find((x) => x.id === id)!;
		return [v.x, v.y];
	};
	const ek = (e: Edge) => (e[0] < e[1] ? `${e[0]},${e[1]}` : `${e[1]},${e[0]}`);

	function load(k: string) {
		verts = structuredClone(presets[k].verts);
		edges = structuredClone(presets[k].edges);
		nextId = Math.max(-1, ...verts.map((v) => v.id)) + 1;
		sel = null;
		lastMsg = '';
	}
	function svgPoint(e: PointerEvent): Pt | null {
		if (!svgEl) return null;
		const m = svgEl.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [Math.min(W - 14, Math.max(14, p.x)), Math.min(H - 14, Math.max(14, p.y))];
	}
	function hitVertex(p: Pt): number | null {
		let best: number | null = null;
		let bd = Math.max(18, 16 * u);
		for (const v of verts) {
			const d = Math.hypot(v.x - p[0], v.y - p[1]);
			if (d < bd) {
				bd = d;
				best = v.id;
			}
		}
		return best;
	}
	function hitEdge(p: Pt): number | null {
		let best: number | null = null;
		let bd = Math.max(10, 10 * u);
		edges.forEach((e, i) => {
			const { d } = segDist(p, P(e[0]), P(e[1]));
			if (d < bd) {
				bd = d;
				best = i;
			}
		});
		return best;
	}
	function addEdge(a: number, b: number) {
		if (a === b) return;
		const key = ek([a, b]);
		const i = edges.findIndex((e) => ek(e) === key);
		if (i >= 0) {
			edges = edges.filter((_, j) => j !== i);
			lastMsg = 'Removed that edge.';
			return;
		}
		const joins = A.pieceOf.get(a) !== A.pieceOf.get(b);
		edges = [...edges, [a, b]];
		lastMsg = joins
			? 'That edge joined two pieces into one: E went up by 1 and the number of pieces went down by 1.'
			: 'That edge closed a new loop: E went up by 1 and the number of independent loops went up by 1.';
	}
	function down(e: PointerEvent) {
		if (e.button !== 0) return;
		const p = svgPoint(e);
		if (!p) return;
		const v = hitVertex(p);
		if (mode === 'move') {
			if (v !== null) {
				dragId = v;
				svgEl?.setPointerCapture(e.pointerId);
				e.preventDefault();
			}
			return;
		}
		if (mode === 'delete') {
			if (v !== null) {
				verts = verts.filter((x) => x.id !== v);
				edges = edges.filter((ed) => !ed.includes(v));
				lastMsg = 'Removed a vertex and its edges.';
			} else {
				const i = hitEdge(p);
				if (i !== null) {
					edges = edges.filter((_, j) => j !== i);
					lastMsg = 'Removed an edge.';
				}
			}
			return;
		}
		// add mode
		if (v === null) {
			if (hitEdge(p) !== null) return;
			const id = nextId;
			nextId += 1;
			verts = [...verts, { id, x: p[0], y: p[1] }];
			lastMsg = 'A new vertex on its own is a new piece: V and the number of pieces both went up by 1.';
			if (sel !== null) {
				addEdge(sel, id);
				sel = id;
			}
			return;
		}
		if (sel === null) sel = v;
		else if (sel === v) sel = null;
		else {
			addEdge(sel, v);
			sel = v;
		}
	}
	function move(e: PointerEvent) {
		const p = svgPoint(e);
		if (!p) return;
		if (dragId !== null) {
			verts = verts.map((v) => (v.id === dragId ? { ...v, x: p[0], y: p[1] } : v));
			return;
		}
		hoverEdge = hitVertex(p) === null ? hitEdge(p) : null;
	}
	$effect(() => {
		void mode;
		sel = null;
	});
</script>

<div class="wrap">
	<div class="canvas" bind:clientWidth={cw}>
		<Svg
			viewBox="0 0 {W} {H}"
			maxHeight={380}
			bind:svg={svgEl}
			label="A graph you can edit; its pieces and loops are counted"
			onpointerdown={down}
			onpointermove={move}
			onpointerup={() => (dragId = null)}
			onpointerleave={() => (hoverEdge = null)}
		>
			<rect x="0" y="0" width={W} height={H} fill="transparent" />
			{#each edges as e, i (ek(e) + i)}
				{@const [a, b] = [P(e[0]), P(e[1])]}
				{@const tree = A.inTree[i]}
				<line
					x1={a[0]}
					y1={a[1]}
					x2={b[0]}
					y2={b[1]}
					class="edge"
					class:extra={!tree}
					class:inloop={loopSet.has(i)}
					class:hov={hoverEdge === i}
					style={tree ? `stroke:${pieceCols[(A.pieceOf.get(e[0]) ?? 0) % pieceCols.length]}` : ''}
				/>
			{/each}
			{#each verts as v (v.id)}
				<circle cx={v.x} cy={v.y} r={Math.max(20, 16 * u)} class="vhit" />
				<circle
					cx={v.x}
					cy={v.y}
					r={(sel === v.id ? 10 : 8) * vs}
					class="v"
					class:sel={sel === v.id}
					style="fill:{pieceCols[(A.pieceOf.get(v.id) ?? 0) % pieceCols.length]}"
				/>
			{/each}
		</Svg>
	</div>
	<div class="side ui" aria-live="polite">
		<div class="row"><TeX tex={`\\chi = V - E = ${A.V} - ${A.E} = ${A.chi}`} /></div>
		<div class="stats">
			<div><span class="n">{A.pieces}</span><span class="k">pieces <TeX tex="b_0" /></span></div>
			<div><span class="n gold">{A.loops}</span><span class="k">independent loops <TeX tex="b_1" /></span></div>
		</div>
		<div class="row small">
			<TeX tex={`b_0 - b_1 = ${A.pieces} - ${A.loops} = ${A.pieces - A.loops}`} />
			<span class="ok">= χ ✓</span>
		</div>
		<p class="msg">{lastMsg || 'Each gold edge closes a loop. Hover one to see its loop.'}</p>
	</div>
</div>
<div class="bar ui">
	<Segmented
		bind:value={mode}
		options={[
			{ value: 'add', label: 'Add' },
			{ value: 'move', label: 'Move' },
			{ value: 'delete', label: 'Delete' }
		]}
		label="Editing mode"
	/>
	<div class="presets">
		{#each Object.entries(presets) as [k, p] (k)}
			<Button variant="subtle" onclick={() => load(k)}>{p.name}</Button>
		{/each}
		<Button
			variant="subtle"
			onclick={() => {
				verts = [];
				edges = [];
				sel = null;
				lastMsg = '';
			}}>Clear</Button
		>
	</div>
</div>

<style>
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr);
		align-items: center;
	}
	.canvas {
		padding: 0.6rem 0.4rem 0.4rem 0.8rem;
		touch-action: pan-y;
		user-select: none;
	}
	.edge {
		stroke-width: 3;
		stroke-linecap: round;
		stroke-opacity: 0.75;
		transition: stroke 0.2s;
	}
	.edge.extra {
		stroke: var(--gold-bright);
		stroke-opacity: 0.9;
		stroke-dasharray: 8 5;
	}
	.edge.inloop {
		stroke: var(--gold-bright) !important;
		stroke-opacity: 1;
		stroke-width: 5;
		stroke-dasharray: none;
		filter: url(#glow);
	}
	.edge.hov {
		stroke-width: 5;
	}
	.vhit {
		fill: transparent;
		touch-action: none;
	}
	.v {
		stroke: #060912;
		stroke-width: 1.5;
		transition: r 0.15s;
	}
	.v.sel {
		stroke: var(--gold-pale);
		stroke-width: 3;
		filter: url(#glow);
	}
	.side {
		padding: 1rem 1.3rem 0.8rem 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.row {
		font-size: 1.1rem;
		color: var(--ink-bright);
	}
	.row.small {
		font-size: 0.9rem;
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}
	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.45rem;
	}
	.stats > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.45rem 0.2rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
		text-align: center;
	}
	.n {
		font-size: 1.6rem;
		font-weight: 650;
		color: #74a9ff;
		font-variant-numeric: tabular-nums;
	}
	.n.gold {
		color: var(--gold-bright);
	}
	.k {
		font-size: 0.7rem;
		color: var(--ink-faint);
	}
	.ok {
		color: var(--green);
		font-size: 0.85rem;
	}
	.msg {
		font-size: 0.78rem;
		color: var(--ink-dim);
		margin: 0 !important;
		min-height: 3.2em;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem 1rem;
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem;
	}
	@media (max-width: 760px) {
		.wrap {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			padding: 0.2rem 1rem 0.8rem;
		}
	}
</style>
