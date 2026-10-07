<script lang="ts">
	// Draw an oriented graph (optionally with filled triangles) whose edges carry
	// numbers: the canvas for every "measurement" figure of §4.1. Use inside <Svg>.
	// Labels are HTML pills in <foreignObject> (plain text, or TeX via labelTeX).
	// With autoPlace, every label finds a spot clear of edges, discs and other labels.
	import { onMount } from 'svelte';
	import type { Pt } from './graph';
	import { tex as renderTeX } from '$lib/katex/render';
	import { ABOVE, BELOW, clash, placeBeside, reach, type Box, type Obstacles } from './labels';

	type Paint = string | null | undefined;

	let {
		pos,
		edges,
		tris = [],
		vertexRadius: vertexRadius0 = 11,
		vertexTextSize: vertexTextSize0 = 11,
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
		vertexTextColor,
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
		autoPlace = false,
		avoid = [],
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
		/** colour of that text (default: dark ink for a light disc) */
		vertexTextColor?: (v: number) => Paint;
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
		/** place vertex pills, names and edge labels where they touch no edge, disc or other label */
		autoPlace?: boolean;
		/** other strokes the placed labels must keep clear of */
		avoid?: [Pt, Pt][];
		onvertex?: (v: number) => void;
		onedge?: (e: number) => void;
		ontri?: (t: number) => void;
		ondrag?: (v: number, dy: number) => void;
		ondragend?: (v: number) => void;
	} = $props();

	// On a narrow plate the drawing is scaled down: the labels (ls) and the vertex discs (lv)
	// grow so that they stay readable; the placement below works with the grown sizes.
	let ls = $state(1);
	const lv = $derived(Math.min(ls, 1.35));
	const vertexRadius = $derived(vertexRadius0 * lv);
	const vertexTextSize = $derived(vertexTextSize0 * lv);

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

	// ── label positions (centres, in user units) ──
	// pill sizes are measured: a foreignObject lays its content out in user units
	let ew = $state<number[]>([]);
	let eh = $state<number[]>([]);
	let vw = $state<number[]>([]);
	let vh = $state<number[]>([]);
	// the part of the plane the <svg> element shows (wider than the viewBox when
	// its height is capped), less a small margin: labels must stay inside it
	let root: SVGGElement | undefined = $state();
	let bounds = $state<[number, number, number, number] | null>(null);
	onMount(() => {
		const svg = root?.ownerSVGElement;
		const vb = svg?.viewBox.baseVal;
		if (!svg || !vb || !vb.width) return;
		const measure = () => {
			const W = svg.clientWidth || vb.width;
			const H = svg.clientHeight || vb.height;
			const k = Math.min(W / vb.width, H / vb.height);
			const hw = W / k / 2;
			const hh = H / k / 2;
			const cx = vb.x + vb.width / 2;
			const cy = vb.y + vb.height / 2;
			bounds = [cx - hw + 3, cy - hh + 3, cx + hw - 3, cy + hh - 3];
			ls = W < 520 ? Math.min(1.7, Math.max(1, 0.9 / k)) : 1;
		};
		measure();
		const ro = new ResizeObserver(measure);
		ro.observe(svg);
		return () => ro.disconnect();
	});
	const guessW = (s: string, px: number) => s.length * px * 0.62 + px * 0.9;
	const keepV: number[] = [];
	const keepN: number[] = [];

	const layout = $derived.by(() => {
		const edgeAt: (Pt | null)[] = [];
		const edge2At: (Pt | null)[] = [];
		const pillAt: (Pt | null)[] = [];
		const nameAt: (Pt | null)[] = [];
		const segs = edges.map(([a, b], i) => ({ a: pos[a], b: pos[b], r: (edgeWidth?.(i) ?? 2.4) / 2 + 4 }));
		const extra = avoid.map(([a, b]) => ({ a, b, r: 4 }));
		const o: Obstacles = { segs: [...segs, ...extra], discs: pos.map((c) => ({ c, r: vertexRadius + 3 })), boxes: [], bounds };
		// triangle labels sit at the centroids; placed labels keep clear of them
		if (autoPlace && triLabel)
			tris.forEach((t, i) => {
				const lbl = triLabel(i);
				if (!lbl) return;
				const [cx, cy] = centroid(t);
				o.boxes.push({ x: cx, y: cy, w: guessW(lbl, 12 * ls), h: 20 * ls });
			});
		edges.forEach(([a, b], i) => {
			const label = edgeLabel?.(i) ?? edgeLabelTeX?.(i);
			const label2 = edgeLabel2?.(i);
			const A = pos[a];
			const B = pos[b];
			const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
			const mid: Pt = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
			const normal = (side: number): Pt => [(side * (B[1] - A[1])) / len, (-side * (B[0] - A[0])) / len];
			const side0 = edgeLabelSide?.(i) ?? 1;
			const given = edgeLabelOffset?.(i);
			let side = side0;
			if (!label) edgeAt.push(null);
			else if (!autoPlace) {
				const n = normal(side);
				const off = given ?? 17 * ls;
				edgeAt.push([mid[0] + n[0] * off, mid[1] + n[1] * off]);
			} else {
				const w = ew[i] || guessW(label, 13 * ls);
				const h = eh[i] || 20 * ls;
				// clear of the chevron when the arrowhead sits by the label, else of the stroke
				const clear = Math.abs((arrowAt?.(i) ?? 0.5) - 0.5) * len < 9 + w / 2 ? 10 : 6;
				const others = { ...o, segs: o.segs.filter((_, j) => j !== i) };
				let best: Box | null = null;
				let bestCost = Infinity;
				// either side of the edge, at its middle or slid a little along it
				for (const s of given === 0 ? [side0] : [side0, -side0]) {
					for (const slide of [0, -0.13, 0.13]) {
						const n = normal(s);
						const off = given === 0 ? 0 : Math.max(given ?? 0, clear + reach(n, w, h));
						const cx = mid[0] + (B[0] - A[0]) * slide + n[0] * off;
						const cy = mid[1] + (B[1] - A[1]) * slide + n[1] * off;
						const box = { x: cx, y: cy, w, h };
						const cost = clash(box, others) + (s === side0 ? 0 : 1) + (slide ? 2 : 0);
						if (cost < bestCost) {
							bestCost = cost;
							best = box;
							side = s;
						}
					}
				}
				o.boxes.push(best!);
				edgeAt.push([best!.x, best!.y]);
			}
			if (!label2) edge2At.push(null);
			else {
				const n = normal(-side);
				const off = autoPlace ? Math.max(16 * ls, 10 + reach(n, guessW(label2, 11.5 * ls), 18 * ls)) : 16 * ls;
				const at: Pt = [mid[0] + n[0] * off, mid[1] + n[1] * off];
				if (autoPlace) o.boxes.push({ x: at[0], y: at[1], w: guessW(label2, 11.5 * ls), h: 18 * ls });
				edge2At.push(at);
			}
		});
		if (!autoPlace) {
			pos.forEach(([x, y], v) => {
				pillAt.push(vertexLabel?.(v) ? [x, y - vertexRadius - 19 * ls] : null);
				nameAt.push(vertexName?.(v) ? [x, y + vertexRadius + 11 * ls] : null);
			});
			return { edgeAt, edge2At, pillAt, nameAt };
		}
		// pills above, names below; placed in both orders, keeping whichever crowds less
		const pass = (namesFirst: boolean) => {
			const q: Obstacles = { ...o, boxes: [...o.boxes] };
			const pills: (Pt | null)[] = [];
			const names: (Pt | null)[] = [];
			const kp: number[] = [];
			const kn: number[] = [];
			let total = 0;
			const doPills = () =>
				pos.forEach(([x, y], v) => {
					const label = vertexLabel?.(v);
					if (!label) return void (pills[v] = null);
					const r = placeBeside([x, y], vertexRadius + 4, vw[v] || guessW(label, 12.5 * ls), vh[v] || 20 * ls, ABOVE, q, keepV[v]);
					kp[v] = r.k;
					total += r.cost;
					q.boxes.push(r.box);
					pills[v] = [r.box.x, r.box.y];
				});
			const doNames = () =>
				pos.forEach(([x, y], v) => {
					const name = vertexName?.(v);
					if (!name) return void (names[v] = null);
					const r = placeBeside([x, y], vertexRadius + 3, (name.length * 6.6 + 2) * ls, 11 * ls, BELOW, q, keepN[v]);
					kn[v] = r.k;
					total += r.cost;
					q.boxes.push(r.box);
					names[v] = [r.box.x, r.box.y];
				});
			if (namesFirst) {
				doNames();
				doPills();
			} else {
				doPills();
				doNames();
			}
			return { pills, names, kp, kn, total };
		};
		const a = pass(false);
		const b = vertexName ? pass(true) : a;
		const best = b.total < a.total ? b : a;
		best.kp.forEach((k, v) => (keepV[v] = k));
		best.kn.forEach((k, v) => (keepN[v] = k));
		pillAt.push(...best.pills);
		nameAt.push(...best.names);
		return { edgeAt, edge2At, pillAt, nameAt };
	});
</script>

<g class="og" bind:this={root} style="--ls:{ls}">
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
				<foreignObject x={cx - 60 * ls} y={cy - 14 * ls} width={120 * ls} height={28 * ls} class="fo">
					<div class="lblwrap"><span class="pill tri-pill" style="--c:{triLabelColor?.(i) ?? 'var(--violet)'}">{lbl}</span></div>
				</foreignObject>
			{/if}
		{/each}
	{/if}

	<!-- edge labels -->
	{#each edges as _, i (i)}
		{@const txt = edgeLabel?.(i)}
		{@const tx = edgeLabelTeX?.(i)}
		{@const at = layout.edgeAt[i]}
		{#if (txt || tx) && at}
			<foreignObject x={at[0] - 50 * ls} y={at[1] - 13 * ls} width={100 * ls} height={26 * ls} class="fo">
				<div class="lblwrap">
					<span
						class="pill"
						class:sel={selectedEdge === i}
						style="--c:{edgeLabelColor?.(i) ?? 'var(--gold-bright)'}"
						bind:offsetWidth={ew[i]}
						bind:offsetHeight={eh[i]}>{#if tx}{@html renderTeX(tx)}{:else}{txt}{/if}</span
					>
				</div>
			</foreignObject>
		{/if}
		{@const t2 = edgeLabel2?.(i)}
		{@const at2 = layout.edge2At[i]}
		{#if t2 && at2}
			<foreignObject x={at2[0] - 50 * ls} y={at2[1] - 12 * ls} width={100 * ls} height={24 * ls} class="fo">
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
		{@const pill = layout.pillAt[v]}
		{@const nm = layout.nameAt[v]}
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
				<text
					{x}
					y={y + 0.5}
					class="vtext"
					style="font-size:{vertexTextSize}px{vertexTextColor?.(v) ? `; fill:${vertexTextColor(v)} !important` : ''}">{vertexText(v)}</text
				>
			{/if}
			{#if vertexLabel?.(v) && pill}
				<foreignObject x={pill[0] - 60 * ls} y={pill[1] - 13 * ls} width={120 * ls} height={26 * ls} class="fo">
					<div class="lblwrap">
						<span
							class="pill vpill"
							style="--c:{vertexLabelColor?.(v) ?? 'var(--gold-bright)'}"
							bind:offsetWidth={vw[v]}
							bind:offsetHeight={vh[v]}>{vertexLabel(v)}</span
						>
					</div>
				</foreignObject>
			{/if}
			{#if vertexName?.(v) && nm}
				<text x={nm[0]} y={nm[1]} class="vname">{vertexName(v)}</text>
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
	/* a mouse press focuses these too: no browser ring, keyboard focus is drawn below */
	.tri:focus,
	.hit:focus,
	.vdot:focus {
		outline: none;
	}
	.tri.clickable:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 2;
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
		font-size: calc(11.5px * var(--ls, 1)) !important;
		letter-spacing: 0.06em;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
		dominant-baseline: central;
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
		font-size: calc(13px * var(--ls, 1));
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
		font-size: calc(12.5px * var(--ls, 1));
	}
	.small2 {
		font-size: calc(11.5px * var(--ls, 1));
		padding: 0 0.38em 0.04em;
	}
	.tri-pill {
		font-size: calc(12px * var(--ls, 1));
	}
</style>
