<script lang="ts" module>
	export interface EdgeLook {
		/** stroke colour (CSS); default: soft ivory */
		color?: string;
		width?: number;
		/** blurred halo under the stroke */
		glow?: boolean;
		dash?: string;
		opacity?: number;
		/** +1: chevron pointing from edges[i][0] to edges[i][1]; −1 the other way */
		arrow?: 1 | -1 | 0;
		/** TeX label near the midpoint */
		label?: string;
		labelColor?: string;
		/** which side of the edge the label sits on (relative to a → b) */
		labelSide?: 1 | -1;
		pulse?: boolean;
	}
	export interface VertexLook {
		color?: string;
		glow?: boolean;
		/** a coloured ring around the dot */
		ring?: string;
		pulse?: boolean;
		r?: number;
		/** TeX label */
		label?: string;
		labelColor?: string;
		/** label offset in SVG units (default: above) */
		labelOffset?: [number, number];
		dim?: boolean;
	}
	export interface TriLook {
		fill?: string;
		opacity?: number;
		/** TeX label at the centroid */
		label?: string;
		labelColor?: string;
		/** draw an "empty" look: dark fill with a dashed rim */
		empty?: boolean;
		glow?: boolean;
	}
	export type Kind = 'edge' | 'tri' | 'vertex';
</script>

<script lang="ts">
	// Draws a graph or a 2-dimensional complex in the plane with per-element
	// looks. Indices are positions in the `edges` / `tris` arrays passed in.
	import { tex as renderTeX } from '$lib/katex/render';

	type Pt = [number, number];
	let {
		pos,
		edges,
		tris = [],
		edgeLook,
		vertexLook,
		triLook,
		interactive = [],
		onpick,
		onhover,
		hit = 30,
		vertexRadius = 7.5,
		edgeName = (i: number) => `edge ${i}`,
		triName = (i: number) => `triangle ${i}`,
		vertexName = (v: number) => `vertex ${v}`
	}: {
		pos: Pt[];
		edges: [number, number][];
		tris?: [number, number, number][];
		edgeLook?: (i: number) => EdgeLook | null | undefined;
		vertexLook?: (v: number) => VertexLook | null | undefined;
		triLook?: (i: number) => TriLook | null | undefined;
		interactive?: Kind[];
		onpick?: (kind: Kind, i: number) => void;
		onhover?: (kind: Kind | null, i: number) => void;
		/** width of the invisible click target along each edge (SVG units) */
		hit?: number;
		vertexRadius?: number;
		edgeName?: (i: number) => string;
		triName?: (i: number) => string;
		vertexName?: (v: number) => string;
	} = $props();

	let hover = $state<{ kind: Kind; i: number } | null>(null);
	const on = (k: Kind) => interactive.includes(k);

	function enter(kind: Kind, i: number) {
		hover = { kind, i };
		onhover?.(kind, i);
	}
	function leave() {
		hover = null;
		onhover?.(null, -1);
	}
	function key(e: KeyboardEvent, kind: Kind, i: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onpick?.(kind, i);
		}
	}
	const isHot = (kind: Kind, i: number) => hover?.kind === kind && hover.i === i;
	const centroid = (t: number[]): Pt => [t.reduce((s, v) => s + pos[v][0], 0) / t.length, t.reduce((s, v) => s + pos[v][1], 0) / t.length];
</script>

<g class="gc">
	<!-- triangles -->
	{#each tris as t, i (t.join(','))}
		{@const L = triLook?.(i) ?? {}}
		{@const hot = isHot('tri', i)}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<polygon
			points={t.map((v) => pos[v].join(',')).join(' ')}
			class="tri"
			class:empty={L.empty}
			class:hot
			class:click={on('tri')}
			style="fill:{L.fill ?? 'rgba(116,169,255,0.07)'}; fill-opacity:{L.opacity ?? 1}"
			role={on('tri') ? 'button' : undefined}
			tabindex={on('tri') ? 0 : undefined}
			aria-label={on('tri') ? triName(i) : undefined}
			onclick={() => on('tri') && onpick?.('tri', i)}
			onkeydown={(e) => on('tri') && key(e, 'tri', i)}
			onpointerenter={() => on('tri') && enter('tri', i)}
			onpointerleave={() => on('tri') && leave()}
		/>
		{#if L.glow}
			<polygon points={t.map((v) => pos[v].join(',')).join(' ')} class="tri-glow" style="stroke:{L.fill}" />
		{/if}
	{/each}

	<!-- edges -->
	{#each edges as e, i (e.join(','))}
		{@const a = pos[e[0]]}
		{@const b = pos[e[1]]}
		{@const L = edgeLook?.(i) ?? {}}
		{@const hot = isHot('edge', i)}
		{@const w = L.width ?? 2.2}
		<g class="edge" class:pulse={L.pulse} style="opacity:{L.opacity ?? 1}">
			{#if L.glow}
				<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="halo" style="stroke:{L.color}; stroke-width:{w * 3.4}" />
			{/if}
			<line
				x1={a[0]}
				y1={a[1]}
				x2={b[0]}
				y2={b[1]}
				class="stroke"
				style="stroke:{L.color ?? 'rgba(206,198,176,0.5)'}; stroke-width:{hot ? w + 1.6 : w}; stroke-dasharray:{L.dash ?? 'none'}"
			/>
			{#if L.arrow}
				{@const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1}
				{@const ux = ((b[0] - a[0]) / len) * L.arrow}
				{@const uy = ((b[1] - a[1]) / len) * L.arrow}
				{@const mx = (a[0] + b[0]) / 2 + ux * 4}
				{@const my = (a[1] + b[1]) / 2 + uy * 4}
				{@const s = 5 + w * 0.9}
				<path
					d="M {mx - ux * s - uy * s * 0.8} {my - uy * s + ux * s * 0.8} L {mx + ux * s * 0.6} {my + uy * s * 0.6} L {mx - ux * s + uy * s * 0.8} {my - uy * s - ux * s * 0.8}"
					class="arrow"
					style="stroke:{L.color ?? 'rgba(220,210,185,0.85)'}; stroke-width:{Math.max(1.8, w * 0.75)}"
				/>
			{/if}
		</g>
	{/each}

	<!-- edge labels -->
	{#each edges as e, i (e.join(','))}
		{@const L = edgeLook?.(i)}
		{#if L?.label}
			{@const a = pos[e[0]]}
			{@const b = pos[e[1]]}
			{@const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1}
			{@const side = L.labelSide ?? 1}
			{@const nx = (-(b[1] - a[1]) / len) * side}
			{@const ny = ((b[0] - a[0]) / len) * side}
			<foreignObject x={(a[0] + b[0]) / 2 + nx * 17 - 50} y={(a[1] + b[1]) / 2 + ny * 17 - 14} width="100" height="28" class="fo">
				<div class="lbl" style="color:{L.labelColor ?? 'var(--gold-pale)'}">{@html renderTeX(L.label)}</div>
			</foreignObject>
		{/if}
	{/each}

	<!-- triangle labels -->
	{#each tris as t, i (t.join(','))}
		{@const L = triLook?.(i)}
		{#if L?.label}
			{@const [cx, cy] = centroid(t)}
			<foreignObject x={cx - 50} y={cy - 15} width="100" height="30" class="fo">
				<div class="lbl tri-lbl" style="color:{L.labelColor ?? 'var(--ink-dim)'}">{@html renderTeX(L.label)}</div>
			</foreignObject>
		{/if}
	{/each}

	<!-- click targets for edges (above triangles, below vertices) -->
	{#if on('edge')}
		{#each edges as e, i (e.join(','))}
			{@const a = pos[e[0]]}
			{@const b = pos[e[1]]}
			<line
				x1={a[0]}
				y1={a[1]}
				x2={b[0]}
				y2={b[1]}
				class="hit"
				style="--hit:{hit}"
				role="button"
				tabindex="0"
				aria-label={edgeName(i)}
				onclick={() => onpick?.('edge', i)}
				onkeydown={(ev) => key(ev, 'edge', i)}
				onpointerenter={() => enter('edge', i)}
				onpointerleave={leave}
			/>
		{/each}
	{/if}

	<!-- vertices -->
	{#each pos as [x, y], v (v)}
		{@const L = vertexLook?.(v) ?? {}}
		{@const r = L.r ?? vertexRadius}
		<g class="vertex" class:pulse={L.pulse} class:vdim={L.dim}>
			{#if L.glow}
				<circle cx={x} cy={y} r={r + 9} class="vhalo" style="fill:{L.ring ?? L.color ?? 'var(--gold-bright)'}" />
			{/if}
			{#if L.ring}
				<circle cx={x} cy={y} r={r + 4.5} class="vring" style="stroke:{L.ring}" />
			{/if}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<circle
				cx={x}
				cy={y}
				r={isHot('vertex', v) ? r + 1.5 : r}
				class="vdot"
				style={L.color ? `fill:${L.color}` : ''}
				role={on('vertex') ? 'button' : undefined}
				tabindex={on('vertex') ? 0 : undefined}
				aria-label={on('vertex') ? vertexName(v) : undefined}
				onclick={() => on('vertex') && onpick?.('vertex', v)}
				onkeydown={(ev) => on('vertex') && key(ev, 'vertex', v)}
				onpointerenter={() => on('vertex') && enter('vertex', v)}
				onpointerleave={() => on('vertex') && leave()}
			/>
			{#if L.label}
				{@const off = L.labelOffset ?? [0, -(r + 15)]}
				<foreignObject x={x + off[0] - 50} y={y + off[1] - 14} width="100" height="28" class="fo">
					<div class="lbl v-lbl" style="color:{L.labelColor ?? 'var(--ink-bright)'}">{@html renderTeX(L.label)}</div>
				</foreignObject>
			{/if}
		</g>
	{/each}
</g>

<style>
	.tri {
		stroke: none;
		outline: none;
	}
	.tri:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 2;
		stroke-dasharray: 4 3;
	}
	.tri.empty {
		stroke: rgba(242, 141, 182, 0.35);
		stroke-width: 1.2;
		stroke-dasharray: 3 4;
	}
	.tri.click {
		cursor: pointer;
	}
	.tri.click.hot {
		filter: brightness(1.35);
	}
	.tri-glow {
		fill: none;
		stroke-width: 6;
		opacity: 0.35;
		filter: blur(4px);
		pointer-events: none;
	}
	.stroke {
		stroke-linecap: round;
	}
	.halo {
		opacity: 0.28;
		stroke-linecap: round;
		filter: blur(3px);
	}
	.arrow {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.hit {
		stroke: transparent;
		stroke-width: var(--hit);
		stroke-linecap: round;
		cursor: pointer;
		outline: none;
	}
	@media (max-width: 640px) {
		/* fingers are wider than mouse pointers */
		.hit {
			stroke-width: calc(var(--hit) * 1.5);
		}
		.lbl {
			font-size: 24px;
		}
		.v-lbl {
			font-size: 25px;
		}
	}
	.hit:focus-visible {
		stroke: rgba(244, 215, 156, 0.18);
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
		outline: none;
	}
	.vdot:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 2.5;
	}
	.vdot[role='button'] {
		cursor: pointer;
	}
	.vhalo {
		opacity: 0.32;
		filter: blur(4px);
		pointer-events: none;
	}
	.vring {
		fill: none;
		stroke-width: 2.2;
		pointer-events: none;
	}
	.vdim {
		opacity: 0.45;
	}
	.pulse .vhalo,
	.pulse .vring {
		animation: pulse 1.6s var(--ease) infinite;
		transform-box: fill-box;
		transform-origin: center;
	}
	.edge.pulse .halo {
		animation: glowpulse 1.6s var(--ease) infinite;
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 0.85;
			transform: scale(1);
		}
		50% {
			opacity: 0.35;
			transform: scale(1.25);
		}
	}
	@keyframes glowpulse {
		0%,
		100% {
			opacity: 0.35;
		}
		50% {
			opacity: 0.12;
		}
	}
	.fo {
		overflow: visible;
		pointer-events: none;
	}
	.lbl {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 17px;
		text-shadow:
			0 0 6px rgba(0, 0, 0, 1),
			0 0 2px rgba(0, 0, 0, 1);
		white-space: nowrap;
		line-height: 1;
	}
	.lbl :global(.katex) {
		font-size: 1em;
	}
	.v-lbl {
		font-size: 18px;
	}
</style>
