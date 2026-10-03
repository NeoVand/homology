<script lang="ts">
	// Draw an oriented graph (optionally with filled triangles) whose edges carry
	// numbers: the canvas for every "measurement" figure of §4.1. Use inside <Svg>.
	// Labels are HTML pills in <foreignObject> (plain text, or TeX via labelTeX).
	import type { Pt } from './graph';
	import { tex as renderTeX } from '$lib/katex/render';

	type Paint = string | null | undefined;

	let {
		pos,
		edges,
		tris = [],
		vertexRadius = 11,
		vertexTextSize = 11,
		edgeColor,
		edgeWidth,
		edgeDash,
		edgeLabel,
		edgeLabelTeX,
		edgeLabelColor,
		edgeLabelSide,
		edgeLabelOffset,
		edgeLabel2,
		edgeLabel2Color,
		edgeClass,
		arrows = true,
		arrowAt,
		vertexFill,
		vertexStroke,
		vertexText,
		vertexLabel,
		vertexLabelColor,
		vertexName,
		vertexClass,
		triFill,
		triLabel,
		triLabelColor,
		selectedVertex = null,
		selectedEdge = null,
		clickVertex = false,
		clickEdge = false,
		clickTri = false,
		dragVertex = false,
		onvertex,
		onedge,
		ontri,
		ondrag,
		ondragend
	}: {
		pos: Pt[];
		edges: [number, number][];
		tris?: [number, number, number][];
		vertexRadius?: number;
		/** font size of the text inside vertex discs */
		vertexTextSize?: number;
		edgeColor?: (e: number) => Paint;
		edgeWidth?: (e: number) => number | null | undefined;
		edgeDash?: (e: number) => string | null | undefined;
		/** plain-text label (fast; use for numbers) */
		edgeLabel?: (e: number) => string | null | undefined;
		/** TeX label (for fractions etc.) */
		edgeLabelTeX?: (e: number) => string | null | undefined;
		edgeLabelColor?: (e: number) => Paint;
		/** which side of the edge the label sits on: +1 left of the arrow, −1 right (default +1) */
		edgeLabelSide?: (e: number) => number;
		/** distance of the label from the edge (default 17; 0 puts the pill on the line) */
		edgeLabelOffset?: (e: number) => number;
		/** a second plain-text label on the opposite side of the edge */
		edgeLabel2?: (e: number) => string | null | undefined;
		edgeLabel2Color?: (e: number) => Paint;
		edgeClass?: (e: number) => string | null | undefined;
		arrows?: boolean;
		/** where along the edge the arrowhead sits (0…1, default 0.5) */
		arrowAt?: (e: number) => number;
		vertexFill?: (v: number) => Paint;
		vertexStroke?: (v: number) => Paint;
		/** short text inside the vertex disc */
		vertexText?: (v: number) => string | null | undefined;
		/** pill label above the vertex (e.g. a height) */
		vertexLabel?: (v: number) => string | null | undefined;
		vertexLabelColor?: (v: number) => Paint;
		/** small caption under the vertex */
		vertexName?: (v: number) => string | null | undefined;
		vertexClass?: (v: number) => string | null | undefined;
		triFill?: (t: number) => Paint;
		triLabel?: (t: number) => string | null | undefined;
		triLabelColor?: (t: number) => Paint;
		selectedVertex?: number | null;
		selectedEdge?: number | null;
		clickVertex?: boolean;
		clickEdge?: boolean;
		clickTri?: boolean;
		/** vertical dragging of vertices: ondrag(v, total dy in SVG units since pointerdown) */
		dragVertex?: boolean;
		onvertex?: (v: number) => void;
		onedge?: (e: number) => void;
		ontri?: (t: number) => void;
		ondrag?: (v: number, dy: number) => void;
		ondragend?: (v: number) => void;
	} = $props();

	let hoverV = $state<number | null>(null);
	let hoverE = $state<number | null>(null);

	function centroid(t: [number, number, number]): Pt {
		return [(pos[t[0]][0] + pos[t[1]][0] + pos[t[2]][0]) / 3, (pos[t[0]][1] + pos[t[1]][1] + pos[t[2]][1]) / 3];
	}

	// ── vertex dragging (vertical) ──
	let drag: { v: number; y0: number; scale: number; moved: boolean; id: number } | null = null;
	function down(e: PointerEvent, v: number) {
		if (!dragVertex) return;
		const el = e.currentTarget as SVGGraphicsElement;
		const ctm = el.ownerSVGElement?.getScreenCTM();
		drag = { v, y0: e.clientY, scale: ctm ? ctm.d : 1, moved: false, id: e.pointerId };
		el.setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag || e.pointerId !== drag.id) return;
		const dy = (e.clientY - drag.y0) / (drag.scale || 1);
		if (Math.abs(dy) > 2) drag.moved = true;
		if (drag.moved) ondrag?.(drag.v, dy);
	}
	function up(e: PointerEvent) {
		if (!drag || e.pointerId !== drag.id) return;
		const d = drag;
		drag = null;
		if (d.moved) ondragend?.(d.v);
		else onvertex?.(d.v);
	}
	function vkey(e: KeyboardEvent, v: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onvertex?.(v);
		}
	}
	function ekey(e: KeyboardEvent, i: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onedge?.(i);
		}
	}
	const vertexInteractive = $derived(clickVertex || dragVertex);
</script>

<g class="og">
	<!-- triangles -->
	{#each tris as t, i (i)}
		{@const fill = triFill?.(i)}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<polygon
			points={t.map((v) => pos[v].join(',')).join(' ')}
			class="tri"
			class:clickable={clickTri}
			style={fill ? `fill:${fill}` : ''}
			role={clickTri ? 'button' : undefined}
			tabindex={clickTri ? 0 : undefined}
			aria-label={clickTri ? `triangle ${i + 1}` : undefined}
			onclick={() => clickTri && ontri?.(i)}
			onkeydown={(e) => clickTri && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), ontri?.(i))}
		/>
	{/each}

	<!-- edges -->
	{#each edges as [a, b], i (i)}
		{@const A = pos[a]}
		{@const B = pos[b]}
		{@const c = edgeColor?.(i) ?? 'rgba(206,198,176,0.55)'}
		{@const w = edgeWidth?.(i) ?? 2.4}
		{@const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1}
		{@const ux = (B[0] - A[0]) / len}
		{@const uy = (B[1] - A[1]) / len}
		{@const at = arrowAt?.(i) ?? 0.5}
		{@const mx = A[0] + (B[0] - A[0]) * at}
		{@const my = A[1] + (B[1] - A[1]) * at}
		{@const sel = selectedEdge === i || hoverE === i}
		<g class="edge {edgeClass?.(i) ?? ''}" class:sel>
			<line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} class="halo" style="stroke:{c}; stroke-width:{w + 7}" />
			<line
				x1={A[0]}
				y1={A[1]}
				x2={B[0]}
				y2={B[1]}
				class="stroke"
				style="stroke:{c}; stroke-width:{sel ? w + 1.4 : w}"
				stroke-dasharray={edgeDash?.(i) ?? undefined}
			/>
			{#if arrows}
				<path
					d="M {mx - ux * 7 - uy * 6} {my - uy * 7 + ux * 6} L {mx + ux * 5} {my + uy * 5} L {mx - ux * 7 + uy * 6} {my - uy * 7 - ux * 6}"
					class="chev"
					style="stroke:{c}"
				/>
			{/if}
			{#if clickEdge}
				<line
					x1={A[0] + ux * vertexRadius}
					y1={A[1] + uy * vertexRadius}
					x2={B[0] - ux * vertexRadius}
					y2={B[1] - uy * vertexRadius}
					class="hit"
					role="button"
					tabindex="0"
					aria-label="edge {a + 1} to {b + 1}"
					onclick={() => onedge?.(i)}
					onkeydown={(e) => ekey(e, i)}
					onpointerenter={() => (hoverE = i)}
					onpointerleave={() => (hoverE = null)}
				/>
			{/if}
		</g>
	{/each}

	<!-- triangle labels -->
	{#if triLabel}
		{#each tris as t, i (i)}
			{@const lbl = triLabel(i)}
			{#if lbl}
				{@const [cx, cy] = centroid(t)}
				<foreignObject x={cx - 60} y={cy - 14} width="120" height="28" class="fo">
					<div class="lblwrap"><span class="pill tri-pill" style="--c:{triLabelColor?.(i) ?? 'var(--violet)'}">{lbl}</span></div>
				</foreignObject>
			{/if}
		{/each}
	{/if}

	<!-- edge labels -->
	{#each edges as [a, b], i (i)}
		{@const txt = edgeLabel?.(i)}
		{@const tx = edgeLabelTeX?.(i)}
		{#if txt || tx}
			{@const A = pos[a]}
			{@const B = pos[b]}
			{@const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1}
			{@const side = edgeLabelSide?.(i) ?? 1}
			{@const off = edgeLabelOffset?.(i) ?? 17}
			{@const nx = (side * (B[1] - A[1])) / len}
			{@const ny = (-side * (B[0] - A[0])) / len}
			{@const lx = (A[0] + B[0]) / 2 + nx * off}
			{@const ly = (A[1] + B[1]) / 2 + ny * off}
			<foreignObject x={lx - 50} y={ly - 13} width="100" height="26" class="fo">
				<div class="lblwrap">
					<span class="pill" class:sel={selectedEdge === i} style="--c:{edgeLabelColor?.(i) ?? 'var(--gold-bright)'}"
						>{#if tx}{@html renderTeX(tx)}{:else}{txt}{/if}</span
					>
				</div>
			</foreignObject>
		{/if}
		{@const t2 = edgeLabel2?.(i)}
		{#if t2}
			{@const A = pos[a]}
			{@const B = pos[b]}
			{@const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1}
			{@const side = -(edgeLabelSide?.(i) ?? 1)}
			{@const nx = (side * (B[1] - A[1])) / len}
			{@const ny = (-side * (B[0] - A[0])) / len}
			<foreignObject x={(A[0] + B[0]) / 2 + nx * 16 - 50} y={(A[1] + B[1]) / 2 + ny * 16 - 12} width="100" height="24" class="fo">
				<div class="lblwrap">
					<span class="pill small2" style="--c:{edgeLabel2Color?.(i) ?? 'var(--violet)'}">{t2}</span>
				</div>
			</foreignObject>
		{/if}
	{/each}

	<!-- vertices -->
	{#each pos as [x, y], v (v)}
		{@const fill = vertexFill?.(v)}
		{@const sel = selectedVertex === v}
		<g class="vert {vertexClass?.(v) ?? ''}" class:sel class:hot={hoverV === v}>
			{#if sel}
				<circle cx={x} cy={y} r={vertexRadius + 9} class="vhalo" />
			{/if}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<circle
				cx={x}
				cy={y}
				r={hoverV === v && vertexInteractive ? vertexRadius + 1.5 : vertexRadius}
				class="vdot"
				class:drag={dragVertex}
				style="fill:{fill ?? 'url(#vertex-fill)'}; stroke:{vertexStroke?.(v) ?? 'rgba(6,9,18,0.9)'}"
				role={vertexInteractive ? 'button' : undefined}
				tabindex={vertexInteractive ? 0 : undefined}
				aria-label={vertexInteractive ? `vertex ${v + 1}` : undefined}
				onpointerdown={(e) => (dragVertex ? down(e, v) : undefined)}
				onpointermove={move}
				onpointerup={up}
				onpointercancel={up}
				onclick={() => !dragVertex && clickVertex && onvertex?.(v)}
				onkeydown={(e) => vertexInteractive && vkey(e, v)}
				onpointerenter={() => (hoverV = v)}
				onpointerleave={() => (hoverV = null)}
			/>
			{#if vertexText?.(v)}
				<text {x} y={y + 0.5} class="vtext" style="font-size:{vertexTextSize}px">{vertexText(v)}</text>
			{/if}
			{#if vertexLabel?.(v)}
				<foreignObject x={x - 60} y={y - vertexRadius - 32} width="120" height="26" class="fo">
					<div class="lblwrap">
						<span class="pill vpill" style="--c:{vertexLabelColor?.(v) ?? 'var(--gold-bright)'}">{vertexLabel(v)}</span>
					</div>
				</foreignObject>
			{/if}
			{#if vertexName?.(v)}
				<text {x} y={y + vertexRadius + 15} class="vname">{vertexName(v)}</text>
			{/if}
		</g>
	{/each}
</g>

<style>
	.tri {
		fill: rgba(116, 169, 255, 0.08);
		stroke: none;
		transition: fill 0.35s var(--ease);
	}
	.tri.clickable {
		cursor: pointer;
	}
	.stroke {
		stroke-linecap: round;
		transition:
			stroke 0.35s var(--ease),
			stroke-width 0.2s var(--ease);
	}
	.halo {
		stroke-linecap: round;
		opacity: 0.12;
		filter: blur(2.5px);
		transition: stroke 0.35s var(--ease);
	}
	.edge.sel .halo {
		opacity: 0.3;
	}
	.edge.flash .halo {
		animation: flash 1.1s var(--ease) 2;
	}
	.edge.glow .halo {
		opacity: 0.32;
	}
	@keyframes flash {
		0%,
		100% {
			opacity: 0.12;
		}
		50% {
			opacity: 0.6;
		}
	}
	.chev {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: stroke 0.35s var(--ease);
	}
	.hit {
		stroke: transparent;
		stroke-width: 22;
		cursor: pointer;
		stroke-linecap: round;
	}
	.hit:focus-visible {
		outline: none;
		stroke: rgba(244, 215, 156, 0.18);
	}
	.vdot {
		stroke-width: 1.6;
		transition:
			r 0.15s,
			fill 0.35s var(--ease);
	}
	.vdot[role='button'] {
		cursor: pointer;
	}
	.vdot.drag {
		cursor: ns-resize;
		touch-action: none;
	}
	.vdot:focus-visible {
		outline: none;
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.vhalo {
		fill: var(--gold-bright);
		opacity: 0.18;
		filter: blur(4px);
	}
	.vtext {
		font-family: var(--font-ui);
		font-weight: 650;
		fill: #1a1206 !important;
		text-anchor: middle;
		dominant-baseline: middle;
		pointer-events: none;
	}
	.vname {
		font-family: var(--font-ui);
		font-size: 11.5px !important;
		letter-spacing: 0.06em;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
		pointer-events: none;
	}
	.fo {
		overflow: visible;
		pointer-events: none;
	}
	.lblwrap {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.pill {
		display: inline-block;
		padding: 0.05em 0.42em 0.08em;
		border-radius: 999px;
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 650;
		line-height: 1.35;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: var(--c);
		background: rgba(7, 11, 22, 0.88);
		border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
		box-shadow: 0 0 10px -2px color-mix(in srgb, var(--c) 35%, transparent);
		transition:
			color 0.3s var(--ease),
			border-color 0.3s var(--ease);
	}
	.pill.sel {
		border-color: var(--c);
		box-shadow: 0 0 14px -1px color-mix(in srgb, var(--c) 70%, transparent);
	}
	.pill :global(.katex) {
		font-size: 1.05em;
	}
	.vpill {
		font-size: 12.5px;
	}
	.small2 {
		font-size: 11.5px;
		padding: 0 0.38em 0.04em;
	}
	.tri-pill {
		font-size: 12px;
	}
</style>
