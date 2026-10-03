<script lang="ts">
	// A small point set drawn in SVG: the union of balls (one translucent fill, so
	// overlaps do not darken), a simplicial complex, highlights, labels, and
	// optionally draggable points.
	import type { Snippet } from 'svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import type { Pt } from './ph';
	import type { Box } from './draw';

	let {
		pts,
		box,
		width = 400,
		r = 0,
		edges = [],
		tris = [],
		labels,
		draggable = false,
		onmove,
		ondragend,
		hiEdges = [],
		hiEdgeColor = 'var(--gold-bright)',
		hiTris = [],
		hiTriColor = 'var(--teal)',
		ring = [],
		ringColor = 'var(--teal)',
		ghost = [],
		ballFill = 'rgba(116, 150, 255, 0.13)',
		ballEdge = 'rgba(170, 190, 255, 0.38)',
		triFill = 'rgba(140, 150, 255, 0.26)',
		pointRadius = 5,
		labelSize = 16,
		clip = false,
		maxHeight = 380,
		label = 'Points with discs around them',
		overlay
	}: {
		pts: Pt[];
		box: Box;
		/** viewBox width; the height follows the box's aspect ratio */
		width?: number;
		r?: number;
		edges?: [number, number][];
		tris?: number[][];
		/** TeX label for each point */
		labels?: string[];
		draggable?: boolean;
		onmove?: (i: number, p: Pt) => void;
		ondragend?: () => void;
		hiEdges?: [number, number][];
		hiEdgeColor?: string;
		hiTris?: number[][];
		hiTriColor?: string;
		ring?: number[];
		ringColor?: string;
		/** faint hollow markers (e.g. where the points used to be) */
		ghost?: Pt[];
		ballFill?: string;
		ballEdge?: string;
		triFill?: string;
		pointRadius?: number;
		/** font size of the point labels, in viewBox units */
		labelSize?: number;
		/** hide whatever spills outside the box (big discs) */
		clip?: boolean;
		maxHeight?: number;
		label?: string;
		/** extra SVG drawn on top, given the world→SVG maps and the scale */
		overlay?: Snippet<[(x: number) => number, (y: number) => number, number]>;
	} = $props();

	const uid = $props.id();
	const s = $derived(width / (box.x1 - box.x0));
	const H = $derived((box.y1 - box.y0) * s);
	const X = (x: number) => (x - box.x0) * s;
	const Y = (y: number) => (box.y1 - y) * s;

	const ballPath = $derived.by(() => {
		if (r <= 0) return '';
		const R = r * s;
		return pts
			.map((p) => {
				const cx = X(p[0]);
				const cy = Y(p[1]);
				return `M ${cx - R} ${cy} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0 Z`;
			})
			.join(' ');
	});
	function triPath(list: number[][]) {
		return list
			.map((t) => {
				const a = pts[t[0]];
				let b = pts[t[1]];
				let c = pts[t[2]];
				if (!a || !b || !c) return '';
				// consistent orientation so that overlapping triangles fill once
				if ((X(b[0]) - X(a[0])) * (Y(c[1]) - Y(a[1])) - (Y(b[1]) - Y(a[1])) * (X(c[0]) - X(a[0])) < 0) [b, c] = [c, b];
				return `M ${X(a[0])} ${Y(a[1])} L ${X(b[0])} ${Y(b[1])} L ${X(c[0])} ${Y(c[1])} Z`;
			})
			.join(' ');
	}
	const triD = $derived(triPath(tris));
	const hiTriD = $derived(triPath(hiTris));
	const centroid = $derived.by(() => {
		const n = pts.length || 1;
		return [pts.reduce((a, p) => a + p[0], 0) / n, pts.reduce((a, p) => a + p[1], 0) / n] as Pt;
	});
	function labelPos(p: Pt): [number, number] {
		let dx = p[0] - centroid[0];
		let dy = p[1] - centroid[1];
		const L = Math.hypot(dx, dy) || 1;
		dx /= L;
		dy /= L;
		const off = pointRadius + 6 + labelSize * 0.55;
		return [X(p[0]) + dx * off, Y(p[1]) - dy * off];
	}

	let svgEl: SVGSVGElement | undefined = $state();
	let dragging = $state(-1);
	function world(e: PointerEvent): Pt {
		const m = svgEl!.getScreenCTM();
		if (!m) return [0, 0];
		const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		const x = Math.min(box.x1, Math.max(box.x0, box.x0 + pt.x / s));
		const y = Math.min(box.y1, Math.max(box.y0, box.y1 - pt.y / s));
		return [x, y];
	}
	function down(e: PointerEvent, i: number) {
		if (!draggable) return;
		dragging = i;
		svgEl?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (dragging >= 0) onmove?.(dragging, world(e));
	}
	function up() {
		if (dragging >= 0) {
			dragging = -1;
			ondragend?.();
		}
	}
	function key(e: KeyboardEvent, i: number) {
		if (!draggable) return;
		const step = (box.x1 - box.x0) / 80;
		const d: Record<string, Pt> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
		const v = d[e.key];
		if (!v) return;
		e.preventDefault();
		onmove?.(i, [pts[i][0] + v[0], pts[i][1] + v[1]]);
	}
</script>

<svg
	bind:this={svgEl}
	viewBox="0 0 {width} {H}"
	style="max-height:{maxHeight}px"
	class:drag={draggable}
	class:clip
	role="img"
	aria-label={label}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
>
	<defs>
		<radialGradient id="{uid}-halo">
			<stop offset="0" stop-color="#f2d08f" stop-opacity="0.75" />
			<stop offset="0.35" stop-color="#f2d08f" stop-opacity="0.22" />
			<stop offset="1" stop-color="#f2d08f" stop-opacity="0" />
		</radialGradient>
		<filter id="{uid}-soft" x="-30%" y="-30%" width="160%" height="160%">
			<feGaussianBlur stdDeviation="5" />
		</filter>
		<filter id="{uid}-glow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="3" result="b" />
			<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
		</filter>
	</defs>

	{#if ballPath}
		<path d={ballPath} fill="rgba(110, 140, 255, 0.16)" filter="url(#{uid}-soft)" />
		<path d={ballPath} fill={ballFill} fill-rule="nonzero" />
		<path d={ballPath} fill="none" stroke={ballEdge} stroke-width="1" />
	{/if}

	{#if triD}
		<path d={triD} fill={triFill} fill-rule="nonzero" />
	{/if}
	{#if hiTriD}
		<path d={hiTriD} fill={hiTriColor} fill-opacity="0.35" stroke={hiTriColor} stroke-width="1.6" filter="url(#{uid}-glow)" />
	{/if}

	{#each edges as [a, b], k (k)}
		{#if pts[a] && pts[b]}
			<line x1={X(pts[a][0])} y1={Y(pts[a][1])} x2={X(pts[b][0])} y2={Y(pts[b][1])} class="edge" />
		{/if}
	{/each}
	{#each hiEdges as [a, b], k (k)}
		{#if pts[a] && pts[b]}
			<line
				x1={X(pts[a][0])}
				y1={Y(pts[a][1])}
				x2={X(pts[b][0])}
				y2={Y(pts[b][1])}
				class="hi"
				style="stroke:{hiEdgeColor}"
				filter="url(#{uid}-glow)"
			/>
		{/if}
	{/each}

	{#each ghost as g, k (k)}
		<circle cx={X(g[0])} cy={Y(g[1])} r={pointRadius + 1.5} class="ghost" />
	{/each}

	{#if overlay}{@render overlay(X, Y, s)}{/if}

	{#each pts as p, i (i)}
		{@const cx = X(p[0])}
		{@const cy = Y(p[1])}
		<circle {cx} {cy} r={pointRadius * 3.2} fill="url(#{uid}-halo)" pointer-events="none" />
		{#if ring.includes(i)}
			<circle {cx} {cy} r={pointRadius + 5} class="ring" style="stroke:{ringColor}" />
		{/if}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<circle
			{cx}
			{cy}
			r={dragging === i ? pointRadius + 1.5 : pointRadius}
			class="pt"
			class:grab={draggable}
			role={draggable ? 'button' : undefined}
			tabindex={draggable ? 0 : undefined}
			aria-label={draggable ? `point ${i}: drag it, or focus it and use the arrow keys` : undefined}
			onpointerdown={(e) => down(e, i)}
			onkeydown={(e) => key(e, i)}
		/>
		{#if draggable}
			<circle {cx} {cy} r={pointRadius + 12} fill="transparent" class="grab" onpointerdown={(e) => down(e, i)} />
		{/if}
		{#if labels?.[i]}
			{@const [lx, ly] = labelPos(p)}
			<SvgTeX x={lx} y={ly} tex={labels[i]} size={labelSize} color="var(--ink-bright)" w={40} h={28} />
		{/if}
	{/each}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		height: auto;
		margin: 0 auto;
		overflow: visible;
		user-select: none;
	}
	svg.drag {
		touch-action: none;
	}
	svg.clip {
		overflow: hidden;
	}
	.edge {
		stroke: rgba(235, 229, 213, 0.7);
		stroke-width: 1.6;
		stroke-linecap: round;
	}
	.hi {
		stroke-width: 3.6;
		stroke-linecap: round;
	}
	.pt {
		fill: #fff8e8;
		stroke: rgba(165, 128, 63, 0.95);
		stroke-width: 1.4;
		transition: r 0.15s;
	}
	.grab {
		cursor: grab;
	}
	.pt.grab:hover {
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.pt:focus-visible {
		outline: none;
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.ring {
		fill: none;
		stroke-width: 2.2;
	}
	.ghost {
		fill: none;
		stroke: rgba(242, 141, 182, 0.75);
		stroke-width: 1.3;
	}
</style>
