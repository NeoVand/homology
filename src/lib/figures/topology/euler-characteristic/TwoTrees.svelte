<script lang="ts">
	// Figure: the "two trees" proof of Euler's formula on the flattened cube.
	// A spanning tree (teal) uses V − 1 edges; the edges it leaves out, crossed
	// by dual edges (violet), join up all F faces into a tree with F − 1 edges.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { cubeLayouts, cubeEdges, planarFaces, edgeFaces, type P2 } from './cauchy';
	import { analyseGraph, fundamentalLoop, rng, shuffled } from './graph';

	const S = 135;
	const C: P2 = [300, 215];
	const X = (p: P2): [number, number] => [C[0] + p[0] * S, C[1] - p[1] * S];
	const pos = cubeLayouts.flat.map(X);
	const ef = edgeFaces();
	const OUT = planarFaces.length - 1; // index of the outside face
	const ring = 52; // distance of the "outside" ring from the outer square

	let seed = $state(3);
	let hover = $state<number | null>(null);
	const g = $derived(analyseGraph([0, 1, 2, 3, 4, 5, 6, 7], cubeEdges, shuffled(cubeEdges.length, rng(seed))));
	const loop = $derived(hover !== null && !g.inTree[hover] ? new Set(fundamentalLoop(cubeEdges, g.inTree, hover)) : new Set<number>());

	const centroid = (f: number[]): [number, number] => [
		f.reduce((s, v) => s + pos[v][0], 0) / f.length,
		f.reduce((s, v) => s + pos[v][1], 0) / f.length
	];
	const faceNode = planarFaces.map((f, i) => (i === OUT ? null : centroid(f)));
	const mid = (i: number): [number, number] => {
		const [a, b] = cubeEdges[i];
		return [(pos[a][0] + pos[b][0]) / 2, (pos[a][1] + pos[b][1]) / 2];
	};
	// the outside ring (a rounded square around the picture)
	const [ox0, oy0] = pos[3];
	const [ox1, oy1] = pos[1];
	const ringRect = { x: ox0 - ring, y: oy0 - ring, w: ox1 - ox0 + 2 * ring, h: oy1 - oy0 + 2 * ring };

	/** the dual edge crossing cube edge i, as an SVG path */
	function dualPath(i: number): { d: string; end: [number, number] | null } {
		const [fa, fb] = ef[i];
		const m = mid(i);
		if (fa !== OUT && fb !== OUT) {
			const A = faceNode[fa]!;
			const B = faceNode[fb]!;
			const cx = 2 * m[0] - (A[0] + B[0]) / 2;
			const cy = 2 * m[1] - (A[1] + B[1]) / 2;
			return { d: `M ${A[0]} ${A[1]} Q ${cx} ${cy} ${B[0]} ${B[1]}`, end: null };
		}
		const inner = faceNode[fa === OUT ? fb : fa]!;
		// continue straight out through the midpoint to the ring
		const dx = m[0] - inner[0];
		const dy = m[1] - inner[1];
		const L = Math.hypot(dx, dy);
		const ux = dx / L;
		const uy = dy / L;
		// distance from the midpoint to the ring along (ux, uy)
		const t = Math.abs(ux) > Math.abs(uy) ? ring / Math.abs(ux) : ring / Math.abs(uy);
		const end: [number, number] = [m[0] + ux * t, m[1] + uy * t];
		return { d: `M ${inner[0]} ${inner[1]} L ${end[0]} ${end[1]}`, end };
	}
	const treeCount = $derived(g.inTree.filter(Boolean).length);
</script>

<div class="wrap">
	<Svg viewBox="40 10 520 420" maxHeight={430} label="The flattened cube with a spanning tree of its vertices and the dual tree of its faces">
		<rect x={ringRect.x} y={ringRect.y} width={ringRect.w} height={ringRect.h} rx="26" class="ring" />
		<text x={ringRect.x + 14} y={ringRect.y - 8} class="ringlbl">the outside face</text>
		<!-- dual edges first, underneath -->
		{#each cubeEdges as _, i (i)}
			{#if !g.inTree[i]}
				{@const dp = dualPath(i)}
				<path d={dp.d} class="dual" class:hot={hover === i} />
				{#if dp.end}<circle cx={dp.end[0]} cy={dp.end[1]} r="4.5" class="dualend" />{/if}
			{/if}
		{/each}
		{#each cubeEdges as [a, b], i (i)}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g
				class="edge"
				onpointerenter={() => (hover = i)}
				onpointerleave={() => (hover = null)}
				onclick={() => (hover = hover === i ? null : i)}
			>
				<line x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} class="hit" />
				<line
					x1={pos[a][0]}
					y1={pos[a][1]}
					x2={pos[b][0]}
					y2={pos[b][1]}
					class="seg"
					class:tree={g.inTree[i]}
					class:loop={loop.has(i)}
					class:closer={hover === i && !g.inTree[i]}
				/>
			</g>
		{/each}
		{#each faceNode as n, i (i)}
			{#if n}<rect x={n[0] - 6} y={n[1] - 6} width="12" height="12" rx="2" transform="rotate(45 {n[0]} {n[1]})" class="fnode" />{/if}
		{/each}
		{#each pos as p, i (i)}
			<circle cx={p[0]} cy={p[1]} r="7" class="v" />
		{/each}
	</Svg>
	<div class="readout ui" aria-live="polite">
		<div class="eq">
			<span class="teal">{treeCount} tree edges</span> + <span class="violet">{cubeEdges.length - treeCount} dual-tree edges</span> =
			{cubeEdges.length} edges
		</div>
		<div class="eq2">
			<TeX tex={`E = (V - 1) + (F - 1) \\;\\Longrightarrow\\; V - E + F = 2`} />
		</div>
		<p class="msg">
			{#if hover !== null && !g.inTree[hover]}
				This grey edge is not in the tree. Adding it would close the <span class="gold">gold loop</span> — and the violet dual edge crosses it.
			{:else}
				Teal: a spanning tree — it reaches all 8 corners, with no loops, using 7 edges. Violet: the edges it leaves out, crossed by paths joining
				the 6 faces (the outside counts) into a tree with 5 edges. Hover a grey edge.
			{/if}
		</p>
	</div>
</div>
<div class="bar ui">
	<Button variant="ghost" onclick={() => (seed += 1)}>Another spanning tree</Button>
</div>

<style>
	.wrap {
		padding: 0.6rem 0.8rem 0;
	}
	.ring {
		fill: none;
		stroke: rgba(164, 147, 255, 0.45);
		stroke-width: 1.5;
		stroke-dasharray: 5 6;
	}
	.ringlbl {
		font-family: var(--font-ui);
		font-size: 12px !important;
		fill: var(--violet) !important;
		letter-spacing: 0.05em;
	}
	.dual {
		fill: none;
		stroke: var(--violet);
		stroke-width: 2.4;
		stroke-dasharray: 7 5;
		opacity: 0.9;
	}
	.dual.hot {
		stroke-width: 3.4;
		filter: url(#glow);
	}
	.dualend {
		fill: var(--violet);
	}
	.edge {
		cursor: pointer;
	}
	.hit {
		stroke: transparent;
		stroke-width: 18;
	}
	.seg {
		stroke: rgba(235, 229, 213, 0.32);
		stroke-width: 2.2;
		stroke-linecap: round;
		transition: stroke 0.25s;
	}
	.seg.tree {
		stroke: var(--teal);
		stroke-width: 3.6;
	}
	.seg.loop {
		stroke: var(--gold-bright);
		stroke-width: 4.4;
		filter: url(#glow);
	}
	.seg.closer {
		stroke-dasharray: 6 4;
	}
	.fnode {
		fill: var(--violet);
		stroke: #0a0e1c;
		stroke-width: 1.2;
	}
	.v {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.4;
	}
	.readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0 1.2rem 0.8rem;
		text-align: center;
	}
	.eq {
		font-size: 0.9rem;
		color: var(--ink-bright);
	}
	.eq2 {
		color: var(--ink-bright);
	}
	.teal {
		color: var(--teal);
	}
	.violet {
		color: var(--violet);
	}
	.gold {
		color: var(--gold-bright);
	}
	.msg {
		font-size: 0.82rem;
		color: var(--ink-dim);
		max-width: 38rem;
		margin: 0 !important;
		min-height: 3em;
	}
	.bar {
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
