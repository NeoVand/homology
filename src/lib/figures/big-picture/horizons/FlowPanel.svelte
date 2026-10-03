<script lang="ts">
	// One panel of the Hodge figure: a planar complex with an edge flow drawn as
	// arrows (thickness ∝ size), optional vertex shading (a potential) and
	// triangle shading (a circulation).
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type { SimplicialComplex } from '$lib/math/complex';

	let {
		K,
		pos,
		flow,
		scale = 1,
		color = '#f2d08f',
		marker = 'gold',
		potential,
		circulation,
		title = '',
		sym = '',
		label = 'An edge flow on a triangulated surface',
		interactive = false,
		onedge,
		viewBox,
		maxHeight = 320
	}: {
		K: SimplicialComplex;
		/** vertex positions in SVG units */
		pos: [number, number][];
		flow: number[];
		/** the flow value drawn at full thickness */
		scale?: number;
		color?: string;
		marker?: string;
		potential?: number[];
		circulation?: number[];
		title?: string;
		/** a symbol shown after the title, in math (not upper-cased) */
		sym?: string;
		label?: string;
		interactive?: boolean;
		onedge?: (i: number) => void;
		viewBox: string;
		maxHeight?: number;
	} = $props();

	const edges = $derived(K.simplices[1] ?? []);
	const tris = $derived(K.simplices[2] ?? []);
	const potMax = $derived(potential ? Math.max(1e-9, ...potential.map(Math.abs)) : 1);
	const circMax = $derived(circulation ? Math.max(1e-9, ...circulation.map(Math.abs)) : 1);

	function arrowFor(i: number) {
		const v = flow[i] ?? 0;
		const [a, b] = edges[i];
		const P = pos[a];
		const Q = pos[b];
		const [s, t] = v >= 0 ? [P, Q] : [Q, P];
		const dx = t[0] - s[0];
		const dy = t[1] - s[1];
		const f = 0.2;
		return {
			x1: s[0] + dx * f,
			y1: s[1] + dy * f,
			x2: t[0] - dx * f,
			y2: t[1] - dy * f,
			w: Math.min(7, 0.6 + (5.4 * Math.abs(v)) / Math.max(scale, 1e-9)),
			show: Math.abs(v) > 0.02 * Math.max(scale, 1e-9)
		};
	}
	function potColor(x: number) {
		const t = x / potMax; // −1 … 1
		const a = Math.abs(t);
		return t >= 0 ? `rgba(95, 214, 207, ${0.25 + 0.75 * a})` : `rgba(116, 169, 255, ${0.15 + 0.4 * a})`;
	}
</script>

<div class="panel-wrap">
	{#if title}<div class="ptitle ui" style="color:{color}">
			{title}{#if sym}<span class="sym"><TeX tex={sym} /></span>{/if}
		</div>{/if}
	<Svg {viewBox} {maxHeight} {label}>
		{#each tris as t, i (t.join(','))}
			{@const pts = t.map((v) => pos[v].join(',')).join(' ')}
			{@const c = circulation ? circulation[i] / circMax : 0}
			<polygon points={pts} class="tri" style={circulation && Math.abs(c) > 0.02 ? `fill: rgba(164,147,255,${0.06 + 0.38 * Math.abs(c)})` : ''} />
			{#if circulation && Math.abs(c) > 0.15}
				{@const cx = t.reduce((s, v) => s + pos[v][0], 0) / 3}
				{@const cy = t.reduce((s, v) => s + pos[v][1], 0) / 3}
				<path d="M {cx + 6} {cy} A 6 6 0 1 {c > 0 ? 0 : 1} {cx} {cy - 6}" class="spin" marker-end="url(#arrow-violet)" />
			{/if}
		{/each}
		{#each edges as e, i (e.join(','))}
			<line x1={pos[e[0]][0]} y1={pos[e[0]][1]} x2={pos[e[1]][0]} y2={pos[e[1]][1]} class="edge" />
		{/each}
		{#each edges as e, i (e.join(','))}
			{@const A = arrowFor(i)}
			{#if A.show}
				<line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} stroke={color} stroke-width={A.w + 5} stroke-linecap="round" opacity="0.16" />
				<line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} stroke={color} stroke-width={A.w} stroke-linecap="round" marker-end="url(#arrowmid-{marker})" />
			{/if}
			{#if interactive}
				<line
					x1={pos[e[0]][0]}
					y1={pos[e[0]][1]}
					x2={pos[e[1]][0]}
					y2={pos[e[1]][1]}
					class="hit"
					role="button"
					tabindex="0"
					aria-label="edge {e.join('–')}: flow {(flow[i] ?? 0).toFixed(2)}"
					onclick={() => onedge?.(i)}
					onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), onedge?.(i))}
				/>
			{/if}
		{/each}
		{#each pos as p, v (v)}
			<circle cx={p[0]} cy={p[1]} r={potential ? 5.5 : 3.2} class="vtx" style={potential ? `fill:${potColor(potential[v] ?? 0)}` : ''} />
		{/each}
	</Svg>
</div>

<style>
	.panel-wrap {
		min-width: 0;
	}
	.ptitle {
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		font-weight: 650;
		text-align: center;
		margin-bottom: 0.1rem;
	}
	.sym {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
		font-size: 1.15em;
		margin-left: 0.45em;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.05);
		stroke: none;
	}
	.edge {
		stroke: rgba(200, 192, 170, 0.22);
		stroke-width: 1;
	}
	.vtx {
		fill: rgba(235, 229, 213, 0.55);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1;
	}
	.spin {
		fill: none;
		stroke: #a493ff;
		stroke-width: 1.4;
	}
	.hit {
		stroke: transparent;
		stroke-width: 16;
		cursor: pointer;
		stroke-linecap: round;
	}
	.hit:hover {
		stroke: rgba(242, 208, 143, 0.16);
	}
</style>
