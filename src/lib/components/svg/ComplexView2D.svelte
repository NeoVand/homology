<script lang="ts">
	// Draw (and optionally interact with) a simplicial complex in the plane.
	// Indices refer to K.simplices[k] — the same indexing the math engine uses.
	import type { SimplicialComplex } from '$lib/math/complex';
	import { tex as renderTeX } from '$lib/katex/render';

	type Pt = [number, number];
	type Hit = 'vertex' | 'edge' | 'triangle';

	let {
		K,
		pos,
		selected = { 0: [], 1: [], 2: [] },
		vertexColor,
		edgeColor,
		triColor,
		edgeWidth,
		vertexLabel,
		edgeLabel,
		triLabel,
		orient = false,
		interactive = [],
		onpick,
		onhover,
		vertexRadius = 7,
		dim = false
	}: {
		K: SimplicialComplex;
		/** position of each vertex, indexed by vertex id */
		pos: Record<number, Pt> | Pt[];
		/** highlighted simplices by dimension (indices into K.simplices[k]) */
		selected?: { 0?: number[]; 1?: number[]; 2?: number[] };
		vertexColor?: (i: number) => string | null | undefined;
		edgeColor?: (i: number) => string | null | undefined;
		triColor?: (i: number) => string | null | undefined;
		edgeWidth?: (i: number) => number | null | undefined;
		/** TeX (or plain) label shown next to vertex i */
		vertexLabel?: (i: number) => string | null | undefined;
		/** TeX label at the midpoint of edge i (e.g. a cochain value) */
		edgeLabel?: (i: number) => string | null | undefined;
		triLabel?: (i: number) => string | null | undefined;
		/** draw orientation arrows on edges (from smaller to larger vertex id) */
		orient?: boolean;
		/** which kinds of simplices react to clicks */
		interactive?: Hit[];
		onpick?: (kind: Hit, index: number) => void;
		onhover?: (kind: Hit | null, index: number) => void;
		vertexRadius?: number;
		/** draw everything faintly (when another layer is the focus) */
		dim?: boolean;
	} = $props();

	const P = (v: number): Pt => (pos as Record<number, Pt>)[v] ?? [0, 0];
	const sel = $derived({
		0: new Set(selected[0] ?? []),
		1: new Set(selected[1] ?? []),
		2: new Set(selected[2] ?? [])
	});
	let hover = $state<{ kind: Hit; i: number } | null>(null);

	const tris = $derived(K.simplices[2] ?? []);
	const edges = $derived(K.simplices[1] ?? []);
	const verts = $derived(K.simplices[0] ?? []);

	function setHover(kind: Hit | null, i = -1) {
		hover = kind ? { kind, i } : null;
		onhover?.(kind, i);
	}
	function isOn(kind: Hit) {
		return interactive.includes(kind);
	}
	function centroid(s: number[]): Pt {
		const x = s.reduce((a, v) => a + P(v)[0], 0) / s.length;
		const y = s.reduce((a, v) => a + P(v)[1], 0) / s.length;
		return [x, y];
	}
	function key(e: KeyboardEvent, kind: Hit, i: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onpick?.(kind, i);
		}
	}
</script>

<g class="cx" class:dim>
	<!-- triangles -->
	{#each tris as t, i (t.join(','))}
		{@const c = triColor?.(i) ?? (sel[2].has(i) ? 'var(--violet)' : null)}
		{@const h = hover?.kind === 'triangle' && hover.i === i}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<polygon
			points={t.map((v) => P(v).join(',')).join(' ')}
			class="tri"
			class:on={!!c}
			class:hot={h}
			class:clickable={isOn('triangle')}
			style={c ? `--tc:${c}` : ''}
			role={isOn('triangle') ? 'button' : undefined}
			tabindex={isOn('triangle') ? 0 : undefined}
			aria-label={isOn('triangle') ? `triangle ${t.join('')}` : undefined}
			onclick={() => isOn('triangle') && onpick?.('triangle', i)}
			onkeydown={(e) => isOn('triangle') && key(e, 'triangle', i)}
			onpointerenter={() => isOn('triangle') && setHover('triangle', i)}
			onpointerleave={() => isOn('triangle') && setHover(null)}
		/>
	{/each}

	<!-- edges -->
	{#each edges as e, i (e.join(','))}
		{@const a = P(e[0])}
		{@const b = P(e[1])}
		{@const c = edgeColor?.(i) ?? (sel[1].has(i) ? 'var(--gold-bright)' : null)}
		{@const w = edgeWidth?.(i) ?? (c ? 3.6 : 2)}
		{@const h = hover?.kind === 'edge' && hover.i === i}
		{@const mx = (a[0] + b[0]) / 2}
		{@const my = (a[1] + b[1]) / 2}
		<g class="edge" class:on={!!c} class:hot={h}>
			{#if c}
				<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="halo" style="stroke:{c}" />
			{/if}
			<line
				x1={a[0]}
				y1={a[1]}
				x2={b[0]}
				y2={b[1]}
				class="stroke"
				style="stroke:{c ?? 'rgba(200,192,170,0.55)'}; stroke-width:{h ? w + 1.5 : w}"
			/>
			{#if orient}
				{@const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1}
				{@const ux = (b[0] - a[0]) / len}
				{@const uy = (b[1] - a[1]) / len}
				<path
					d="M {mx - ux * 6 - uy * 5} {my - uy * 6 + ux * 5} L {mx + ux * 6} {my + uy * 6} L {mx - ux * 6 + uy * 5} {my - uy * 6 - ux * 5}"
					class="orient"
					style="stroke:{c ?? 'rgba(220,210,185,0.85)'}"
				/>
			{/if}
			{#if isOn('edge')}
				<line
					x1={a[0]}
					y1={a[1]}
					x2={b[0]}
					y2={b[1]}
					class="hit"
					role="button"
					tabindex="0"
					aria-label="edge {e.join('')}"
					onclick={() => onpick?.('edge', i)}
					onkeydown={(ev) => key(ev, 'edge', i)}
					onpointerenter={() => setHover('edge', i)}
					onpointerleave={() => setHover(null)}
				/>
			{/if}
		</g>
	{/each}

	<!-- triangle labels -->
	{#if triLabel}
		{#each tris as t, i (t.join(','))}
			{@const lbl = triLabel(i)}
			{#if lbl}
				{@const [cx, cy] = centroid(t)}
				<foreignObject x={cx - 60} y={cy - 14} width="120" height="28" style="overflow:visible;pointer-events:none">
					<div class="lbl tri-lbl">{@html renderTeX(lbl)}</div>
				</foreignObject>
			{/if}
		{/each}
	{/if}

	<!-- edge labels -->
	{#if edgeLabel}
		{#each edges as e, i (e.join(','))}
			{@const lbl = edgeLabel(i)}
			{#if lbl}
				{@const a = P(e[0])}
				{@const b = P(e[1])}
				{@const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1}
				{@const nx = -(b[1] - a[1]) / len}
				{@const ny = (b[0] - a[0]) / len}
				<foreignObject
					x={(a[0] + b[0]) / 2 + nx * 13 - 50}
					y={(a[1] + b[1]) / 2 + ny * 13 - 13}
					width="100"
					height="26"
					style="overflow:visible;pointer-events:none"
				>
					<div class="lbl edge-lbl">{@html renderTeX(lbl)}</div>
				</foreignObject>
			{/if}
		{/each}
	{/if}

	<!-- vertices -->
	{#each verts as [v], i (v)}
		{@const [x, y] = P(v)}
		{@const c = vertexColor?.(i) ?? (sel[0].has(i) ? 'var(--gold-bright)' : null)}
		{@const h = hover?.kind === 'vertex' && hover.i === i}
		<g class="vertex" class:on={!!c} class:hot={h}>
			{#if c}
				<circle cx={x} cy={y} r={vertexRadius + 6} class="vhalo" style="fill:{c}" />
			{/if}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<circle
				cx={x}
				cy={y}
				r={h ? vertexRadius + 1.5 : vertexRadius}
				class="vdot"
				style={c ? `fill:${c}` : ''}
				role={isOn('vertex') ? 'button' : undefined}
				tabindex={isOn('vertex') ? 0 : undefined}
				aria-label={isOn('vertex') ? `vertex ${v}` : undefined}
				onclick={() => isOn('vertex') && onpick?.('vertex', i)}
				onkeydown={(ev) => isOn('vertex') && key(ev, 'vertex', i)}
				onpointerenter={() => isOn('vertex') && setHover('vertex', i)}
				onpointerleave={() => isOn('vertex') && setHover(null)}
			/>
			{#if vertexLabel}
				{@const lbl = vertexLabel(i)}
				{#if lbl}
					<foreignObject x={x - 60} y={y - vertexRadius - 30} width="120" height="26" style="overflow:visible;pointer-events:none">
						<div class="lbl v-lbl">{@html renderTeX(lbl)}</div>
					</foreignObject>
				{/if}
			{/if}
		</g>
	{/each}
</g>

<style>
	.cx.dim {
		opacity: 0.35;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.07);
		stroke: none;
		transition: fill 0.2s;
	}
	.tri.on {
		fill: color-mix(in srgb, var(--tc) 32%, transparent);
	}
	.tri.clickable {
		cursor: pointer;
	}
	.tri.clickable:hover,
	.tri.hot {
		fill: rgba(164, 147, 255, 0.18);
	}
	.tri.on.hot {
		fill: color-mix(in srgb, var(--tc) 45%, transparent);
	}
	.stroke {
		stroke-linecap: round;
		transition: stroke 0.2s;
	}
	.halo {
		stroke-width: 9;
		opacity: 0.22;
		stroke-linecap: round;
		filter: blur(2px);
	}
	.orient {
		fill: none;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.hit {
		stroke: transparent;
		stroke-width: 18;
		cursor: pointer;
		stroke-linecap: round;
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
		transition: r 0.15s;
	}
	.vertex.on .vdot {
		stroke: rgba(255, 255, 255, 0.6);
	}
	.vhalo {
		opacity: 0.25;
		filter: blur(3px);
	}
	.vdot[role='button'] {
		cursor: pointer;
	}
	.lbl {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		color: var(--ink-bright);
		text-shadow:
			0 0 6px rgba(0, 0, 0, 1),
			0 0 2px rgba(0, 0, 0, 1);
		white-space: nowrap;
	}
	.edge-lbl {
		color: var(--gold-pale);
		font-size: 14px;
	}
	.tri-lbl {
		color: var(--violet);
		font-size: 14px;
	}
	.lbl :global(.katex) {
		font-size: 1em;
	}
</style>
