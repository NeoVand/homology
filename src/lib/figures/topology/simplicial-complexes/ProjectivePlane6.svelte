<script lang="ts">
	// Figure: the 6-vertex projective plane, drawn as a disk whose opposite
	// boundary points are glued together. Pick a vertex to see all its copies.
	import Svg from '$lib/components/svg/Svg.svelte';
	import { rp2Picture } from './data';
	import { sevenCss } from './kit3d';

	const pic = rp2Picture(1);
	const R = 150;
	const C = 200;
	const P = (i: number) => [C + pic.nodes[i].pos[0] * R, C - pic.nodes[i].pos[1] * R] as const;
	let picked = $state<number | null>(null);
	const colour = (L: number) => sevenCss[L];

	// drawn edges (node pairs) without repeats
	const segs: [number, number][] = [];
	const seenSeg = new Set<string>();
	for (const t of pic.triangles)
		for (let k = 0; k < 3; k++) {
			const a = t[k];
			const b = t[(k + 1) % 3];
			const key = a < b ? `${a},${b}` : `${b},${a}`;
			if (!seenSeg.has(key)) {
				seenSeg.add(key);
				segs.push([a, b]);
			}
		}
	const isBoundary = (a: number, b: number) => a > 0 && b > 0 && (Math.abs(a - b) === 1 || Math.abs(a - b) === 9);
	// boundary arcs k → k+1 and their antipodes k+5 → k+6 carry the same chevron colour
	const arcPair = (a: number, b: number) => {
		const k = Math.min(a, b) === 1 && Math.max(a, b) === 10 ? 10 : Math.min(a, b);
		return (k - 1) % 5;
	};
	const arcCols = ['#f2d08f', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff'];
</script>

<div class="wrap">
	<Svg viewBox="0 0 400 400" maxHeight={380} label="The six-vertex projective plane drawn as a disk: a centre vertex, and ten points on the boundary circle where opposite points carry the same label">
		<circle cx={C} cy={C} r={R + 0.5} class="rim" />
		{#each pic.triangles as t, i (i)}
			{@const lit = picked !== null && t.some((n) => pic.nodes[n].label === picked)}
			<polygon points={t.map((n) => P(n).join(',')).join(' ')} class="tri" class:lit />
		{/each}
		{#each segs as [a, b], i (i)}
			{@const la = pic.nodes[a].label}
			{@const lb = pic.nodes[b].label}
			{@const lit = picked !== null && (la === picked || lb === picked)}
			{@const bd = isBoundary(a, b)}
			<line
				x1={P(a)[0]}
				y1={P(a)[1]}
				x2={P(b)[0]}
				y2={P(b)[1]}
				class="seg"
				class:bd
				class:lit
				style={lit ? `stroke:${colour(la === picked ? lb : la)}` : bd ? `stroke:${arcCols[arcPair(a, b)]}` : ''}
			/>
			{#if bd}
				{@const [x1, y1] = P(a)}
				{@const [x2, y2] = P(b)}
				{@const fwd = b === a + 1 || (a === 10 && b === 1)}
				{@const sx = fwd ? x1 : x2}
				{@const sy = fwd ? y1 : y2}
				{@const ex = fwd ? x2 : x1}
				{@const ey = fwd ? y2 : y1}
				{@const mx = (sx + ex) / 2}
				{@const my = (sy + ey) / 2}
				{@const L = Math.hypot(ex - sx, ey - sy)}
				{@const ux = (ex - sx) / L}
				{@const uy = (ey - sy) / L}
				<path
					d="M {mx - ux * 7 - uy * 6} {my - uy * 7 + ux * 6} L {mx + ux * 2} {my + uy * 2} L {mx - ux * 7 + uy * 6} {my - uy * 7 - ux * 6}"
					class="chev"
					style="stroke:{arcCols[arcPair(a, b)]}"
				/>
			{/if}
		{/each}
		{#each pic.nodes as nd, i (i)}
			{@const [x, y] = P(i)}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<g
				class="nd"
				class:on={picked === nd.label}
				role="button"
				tabindex="-1"
				aria-label="vertex {nd.label}"
				onclick={() => (picked = picked === nd.label ? null : nd.label)}
				onpointerenter={(e) => e.pointerType === 'mouse' && (picked = nd.label)}
			>
				<circle cx={x} cy={y} r="18" class="hit" />
				<circle cx={x} cy={y} r={picked === nd.label ? 12 : 10} fill={colour(nd.label)} class="disc" />
				<text {x} y={y + 4.5} text-anchor="middle" class="num">{nd.label}</text>
			</g>
		{/each}
	</Svg>
	<div class="keys ui" role="group" aria-label="Choose a vertex">
		{#each [0, 1, 2, 3, 4, 5] as L (L)}
			<button class:on={picked === L} style="--c:{colour(L)}" onclick={() => (picked = picked === L ? null : L)} aria-pressed={picked === L}
				>{L}</button
			>
		{/each}
	</div>
	<p class="note ui" aria-live="polite">
		{#if picked === null}
			Opposite points of the circle are glued (matching colours and arrows). Tap a vertex.
		{:else if picked === 0}
			Vertex 0 appears once, in the middle, joined to 1, 2, 3, 4, 5.
		{:else}
			Vertex {picked} appears twice, at opposite points of the circle — and is joined to all five others.
		{/if}
	</p>
</div>

<style>
	.wrap {
		padding: 0.8rem 0.8rem 0.4rem;
	}
	.rim {
		fill: none;
		stroke: rgba(235, 229, 213, 0.12);
		stroke-width: 1;
		stroke-dasharray: 2 4;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.08);
		transition: fill 0.25s;
	}
	.tri.lit {
		fill: rgba(242, 208, 143, 0.11);
	}
	.seg {
		stroke: rgba(235, 229, 213, 0.45);
		stroke-width: 1.6;
		transition: stroke 0.25s;
	}
	.seg.bd {
		stroke-width: 2.4;
	}
	.seg.lit {
		stroke-width: 3.4;
		filter: url(#glow);
	}
	.chev {
		fill: none;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.nd {
		cursor: pointer;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.disc {
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
		transition: r 0.2s;
	}
	.nd.on .disc {
		filter: url(#glow-strong);
	}
	.num {
		font-family: var(--font-ui);
		font-size: 12px !important;
		font-weight: 700;
		fill: #10131d !important;
		pointer-events: none;
	}
	.keys {
		display: flex;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.3rem 0;
	}
	.keys button {
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 50%;
		border: 1.5px solid var(--c);
		background: color-mix(in srgb, var(--c) 12%, transparent);
		color: var(--c);
		font-weight: 700;
		font-size: 0.85rem;
		cursor: pointer;
	}
	.keys button.on {
		background: var(--c);
		color: #10131d;
	}
	.note {
		text-align: center;
		font-size: 0.8rem;
		color: var(--ink-dim);
		margin: 0.2rem 0 0.4rem !important;
		min-height: 2.6em;
	}
</style>
