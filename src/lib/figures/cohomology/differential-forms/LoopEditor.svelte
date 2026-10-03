<script lang="ts">
	// An editable smooth closed curve, drawn inside an overlay <svg> of a
	// FieldView (pixel coordinates). Drag the round handles to reshape it, or
	// the diamond in the middle to move it. Keyboard: focus a handle and use
	// the arrow keys.
	import type { FieldViewport } from './FieldView.svelte';
	import { closedCatmullRom, centroid, type Vec2 } from './calc';

	let {
		points = $bindable(),
		view,
		fill = true,
		color = 'var(--gold-bright)',
		chevrons = 7,
		bead = null,
		moverOffset = [0, 0]
	}: {
		points: Vec2[];
		view: FieldViewport;
		/** shade the enclosed region (nonzero rule, so double loops shade darker) */
		fill?: boolean;
		color?: string;
		chevrons?: number;
		/** optional moving bead position (world) */
		bead?: Vec2 | null;
		/** where the move-all handle sits relative to the centroid (world units) */
		moverOffset?: Vec2;
	} = $props();

	const poly = $derived(closedCatmullRom(points, 20));
	const px = $derived(poly.map((p) => view.toPx(p)));
	const d = $derived('M ' + px.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ') + ' Z');
	const ctr = $derived.by(() => {
		const c = centroid(points);
		return view.toPx([c[0] + moverOffset[0], c[1] + moverOffset[1]]);
	});

	const marks = $derived.by(() => {
		// chevrons evenly spaced by arc length, pointing along the curve
		const n = px.length;
		const cum = [0];
		for (let i = 1; i <= n; i++) {
			const a = px[i - 1];
			const b = px[i % n];
			cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
		}
		const total = cum[n];
		const out: string[] = [];
		let j = 0;
		for (let k = 0; k < chevrons; k++) {
			const target = ((k + 0.5) / chevrons) * total;
			while (j < n - 1 && cum[j + 1] < target) j++;
			const a = px[j];
			const b = px[(j + 1) % n];
			const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
			const t = (target - cum[j]) / L;
			const x = a[0] + (b[0] - a[0]) * t;
			const y = a[1] + (b[1] - a[1]) * t;
			const ux = (b[0] - a[0]) / L;
			const uy = (b[1] - a[1]) / L;
			const s = 6.5;
			out.push(
				`M ${x - ux * s - uy * s} ${y - uy * s + ux * s} L ${x + ux * s * 0.6} ${y + uy * s * 0.6} L ${x - ux * s + uy * s} ${y - uy * s - ux * s}`
			);
		}
		return out;
	});

	let active = -2; // −2 none, −1 whole loop, ≥0 a handle
	let last: Vec2 = [0, 0];

	function world(e: PointerEvent): Vec2 {
		const svg = (e.currentTarget as SVGElement).ownerSVGElement!;
		const r = svg.getBoundingClientRect();
		return view.toWorld(e.clientX - r.left, e.clientY - r.top);
	}
	function clampW(p: Vec2): Vec2 {
		const [x0, x1, y0, y1] = view.box;
		const m = 0.08;
		return [Math.min(x1 - m, Math.max(x0 + m, p[0])), Math.min(y1 - m, Math.max(y0 + m, p[1]))];
	}
	function down(e: PointerEvent, i: number) {
		active = i;
		last = world(e);
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
		e.stopPropagation();
	}
	function move(e: PointerEvent, i: number) {
		if (active !== i) return;
		const p = world(e);
		if (i >= 0) {
			points[i] = clampW(p);
		} else {
			const dx = p[0] - last[0];
			const dy = p[1] - last[1];
			points = points.map((q) => clampW([q[0] + dx, q[1] + dy]));
		}
		last = p;
	}
	function up() {
		active = -2;
	}
	function key(e: KeyboardEvent, i: number) {
		const s = 0.08;
		const m: Record<string, Vec2> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] };
		const v = m[e.key];
		if (!v) return;
		e.preventDefault();
		if (i >= 0) points[i] = clampW([points[i][0] + v[0], points[i][1] + v[1]]);
		else points = points.map((q) => clampW([q[0] + v[0], q[1] + v[1]]));
	}
</script>

<g class="loop" style="--c:{color}">
	{#if fill}
		<path {d} class="fill" />
	{/if}
	<path {d} class="halo" />
	<path {d} class="core" />
	{#each marks as m, i (i)}
		<path d={m} class="chev" />
	{/each}
	{#if bead}
		{@const b = view.toPx(bead)}
		<circle cx={b[0]} cy={b[1]} r="9" class="bead-halo" />
		<circle cx={b[0]} cy={b[1]} r="4.5" class="bead" />
	{/if}
	<!-- move-all handle -->
	<g
		class="mover"
		transform="translate({ctr[0]} {ctr[1]})"
		role="slider"
		tabindex="0"
		aria-label="Move the whole loop (arrow keys)"
		aria-valuenow={0}
		onpointerdown={(e) => down(e, -1)}
		onpointermove={(e) => move(e, -1)}
		onpointerup={up}
		onpointercancel={up}
		onkeydown={(e) => key(e, -1)}
	>
		<circle r="16" class="hit" />
		<path d="M 0 -7 L 7 0 L 0 7 L -7 0 Z" class="diamond" />
	</g>
	{#each points as p, i (i)}
		{@const q = view.toPx(p)}
		<g
			class="handle"
			transform="translate({q[0]} {q[1]})"
			role="slider"
			tabindex="0"
			aria-label="Loop control point {i + 1} (arrow keys move it)"
			aria-valuenow={i}
			onpointerdown={(e) => down(e, i)}
			onpointermove={(e) => move(e, i)}
			onpointerup={up}
			onpointercancel={up}
			onkeydown={(e) => key(e, i)}
		>
			<circle r="17" class="hit" />
			<circle r="7.5" class="knob" />
		</g>
	{/each}
</g>

<style>
	.fill {
		fill: color-mix(in srgb, var(--c) 13%, transparent);
		fill-rule: nonzero;
		stroke: none;
	}
	.halo {
		fill: none;
		stroke: var(--c);
		stroke-width: 9;
		opacity: 0.18;
		stroke-linejoin: round;
	}
	.core {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.6;
		stroke-linejoin: round;
		filter: drop-shadow(0 0 5px color-mix(in srgb, var(--c) 70%, transparent));
	}
	.chev {
		fill: none;
		stroke: #fff6e0;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.handle,
	.mover {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.handle:active,
	.mover:active {
		cursor: grabbing;
	}
	.hit {
		fill: transparent;
	}
	.knob {
		fill: #0b1022;
		stroke: var(--c);
		stroke-width: 2.4;
		transition: r 0.15s;
	}
	.handle:hover .knob,
	.handle:focus-visible .knob {
		fill: var(--c);
	}
	.diamond {
		fill: rgba(11, 16, 34, 0.8);
		stroke: rgba(255, 246, 224, 0.75);
		stroke-width: 1.6;
	}
	.mover:hover .diamond,
	.mover:focus-visible .diamond {
		fill: rgba(255, 246, 224, 0.4);
	}
	.bead {
		fill: #fffaf0;
	}
	.bead-halo {
		fill: var(--c);
		opacity: 0.35;
		filter: blur(3px);
	}
</style>
