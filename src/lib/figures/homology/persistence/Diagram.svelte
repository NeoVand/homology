<script lang="ts">
	// A persistence diagram: each bar [b, d) becomes the point (b, d) above the
	// diagonal. H₀ = teal circles, H₁ = gold diamonds; classes that never die sit
	// on the dashed "∞" line at the top. Optional overlays: the "alive at r"
	// quadrant, a ghost diagram, a matching, δ-boxes and a diagonal band.
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import { dimColor, type BarDatum } from './Barcode.svelte';

	let {
		points,
		max,
		now = null,
		hover = $bindable(null),
		selected = $bindable(null),
		ghost = [],
		matching = [],
		boxes = 0,
		boxDims = [1, 2],
		band = 0,
		maxSize = 330,
		ticks,
		label = 'Persistence diagram'
	}: {
		points: BarDatum[];
		max: number;
		now?: number | null;
		hover?: number | null;
		selected?: number | null;
		/** a second diagram drawn as hollow markers */
		ghost?: { dim: number; birth: number; death: number }[];
		/** segments [b1, d1, b2, d2] in diagram coordinates (d may be Infinity) */
		matching?: [number, number, number, number][];
		/** half-side of squares drawn around the ghost points */
		boxes?: number;
		/** which dimensions get boxes */
		boxDims?: number[];
		/** draw the band of points within this L∞-distance of the diagonal */
		band?: number;
		maxSize?: number;
		ticks?: number[];
		label?: string;
	} = $props();

	const uid = $props.id();
	let cw = $state(300);
	const S = $derived(Math.max(200, Math.min(maxSize, Math.round(cw))));
	const padL = 38;
	const padB = 34;
	const padT = 30;
	const padR = 12;
	const side = $derived(S - padL - padR);
	const H = $derived(side + padT + padB);
	const X = (v: number) => padL + (Math.min(Math.max(v, 0), max) / max) * side;
	const Y = (v: number) => (v === Infinity ? padT - 16 : padT + side - (Math.min(Math.max(v, 0), max) / max) * side);

	const autoTicks = $derived.by(() => {
		if (ticks) return ticks;
		const raw = max / 4;
		const pow = Math.pow(10, Math.floor(Math.log10(raw)));
		const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
		const out: number[] = [];
		for (let v = 0; v <= max + 1e-9; v += step) out.push(+v.toFixed(6));
		return out;
	});

	const active = $derived(hover ?? selected);
	const alive = (p: { birth: number; death: number }) => now !== null && p.birth <= now + 1e-12 && now + 1e-12 < p.death;

	function diamond(cx: number, cy: number, r: number) {
		return `M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`;
	}
	// draw the most important (longest) points last so they sit on top
	const ordered = $derived(points.slice().sort((a, b) => a.death - a.birth - (b.death - b.birth)));
</script>

<div class="dgm" bind:clientWidth={cw}>
	<svg viewBox="0 0 {S} {H}" width={S} height={H} role="img" aria-label={label}>
		<defs>
			<clipPath id="{uid}-clip">
				<rect x={padL} y={padT - 22} width={side + 2} height={side + 24} />
			</clipPath>
			<filter id="{uid}-glow" x="-100%" y="-100%" width="300%" height="300%">
				<feGaussianBlur stdDeviation="2.6" />
			</filter>
		</defs>

		<!-- the region above the diagonal -->
		<path d="M {X(0)} {Y(0)} L {X(max)} {Y(max)} L {X(0)} {Y(max)} Z" class="upper" />

		{#each autoTicks as t (t)}
			<line x1={X(t)} x2={X(t)} y1={padT} y2={padT + side} class="grid" />
			<line x1={padL} x2={padL + side} y1={Y(t)} y2={Y(t)} class="grid" />
			<text x={X(t)} y={padT + side + 14} class="tick">{t}</text>
			<text x={padL - 6} y={Y(t) + 3.5} class="tick end">{t}</text>
		{/each}

		<g clip-path="url(#{uid}-clip)">
			{#if band > 0}
				<path
					d="M {X(0)} {Y(0)} L {X(max)} {Y(max)} L {X(max - 2 * band)} {Y(max)} L {X(0)} {Y(2 * band)} Z"
					class="band"
				/>
			{/if}

			{#if now !== null}
				<rect x={X(0)} y={Y(Infinity) - 6} width={X(now) - X(0)} height={Y(now) - Y(Infinity) + 6} class="quad" />
				<line x1={X(now)} x2={X(now)} y1={Y(Infinity) - 6} y2={Y(now)} class="quad-edge" />
				<line x1={X(0)} x2={X(now)} y1={Y(now)} y2={Y(now)} class="quad-edge" />
			{/if}

			{#if boxes > 0}
				{#each ghost as g, i (i)}
					{#if g.death !== Infinity && boxDims.includes(g.dim)}
						<rect
							x={X(g.birth - boxes)}
							y={Y(g.death + boxes)}
							width={X(g.birth + boxes) - X(g.birth - boxes)}
							height={Y(g.death - boxes) - Y(g.death + boxes)}
							class="box"
							style="--c:{dimColor[g.dim]}"
						/>
					{/if}
				{/each}
			{/if}
		</g>

		<!-- diagonal and infinity line -->
		<line x1={X(0)} y1={Y(0)} x2={X(max)} y2={Y(max)} class="diag" />
		<line x1={padL} x2={padL + side} y1={Y(Infinity)} y2={Y(Infinity)} class="inf" />
		<SvgTeX x={padL - 12} y={Y(Infinity)} tex={'\\infty'} size={13} color="var(--ink-faint)" w={20} h={18} />

		<!-- axes -->
		<line x1={padL} x2={padL + side} y1={padT + side} y2={padT + side} class="axis" />
		<line x1={padL} x2={padL} y1={padT - 22} y2={padT + side} class="axis" />
		<text x={padL + side / 2} y={padT + side + 29} class="lbl">birth</text>
		<text x={10} y={padT + side / 2} class="lbl" transform="rotate(-90 10 {padT + side / 2})">death</text>

		<!-- matching -->
		{#each matching as [b1, d1, b2, d2], i (i)}
			<line x1={X(b1)} y1={Y(d1)} x2={X(b2)} y2={Y(d2)} class="match" />
		{/each}

		<!-- ghost points (hollow) -->
		{#each ghost as g, i (i)}
			{#if g.dim === 0}
				<circle cx={X(g.birth)} cy={Y(g.death)} r="4.2" class="ghost" style="--c:{dimColor[0]}" />
			{:else}
				<path d={diamond(X(g.birth), Y(g.death), 5.4)} class="ghost" style="--c:{dimColor[g.dim]}" />
			{/if}
		{/each}

		<!-- points -->
		{#each ordered as p (p.id)}
			{@const c = p.color ?? dimColor[p.dim]}
			{@const isOn = active === p.id}
			{@const lit = now === null || alive(p) || isOn}
			{@const cx = X(p.birth)}
			{@const cy = Y(p.death)}
			<g
				class="pt"
				class:on={isOn}
				class:dimmed={!lit}
				style="--c:{c}"
				role="button"
				tabindex="-1"
				aria-label="H{p.dim} point born {p.birth.toFixed(2)}, dies {p.death === Infinity ? 'never' : p.death.toFixed(2)}"
				onpointerenter={(e) => e.pointerType === 'mouse' && (hover = p.id)}
				onpointerleave={(e) => e.pointerType === 'mouse' && (hover = null)}
				onclick={() => (selected = selected === p.id ? null : p.id)}
			>
				{#if isOn}
					<circle {cx} {cy} r="10" class="halo" filter="url(#{uid}-glow)" />
				{/if}
				{#if p.dim === 0}
					<circle {cx} {cy} r={isOn ? 5.4 : 4} class="mark" />
				{:else}
					<path d={diamond(cx, cy, isOn ? 7 : 5.4)} class="mark" />
				{/if}
				<circle {cx} {cy} r="11" fill="transparent" />
			</g>
		{/each}
	</svg>
</div>

<style>
	.dgm {
		width: 100%;
		min-width: 0;
		display: flex;
		justify-content: center;
	}
	svg {
		display: block;
		overflow: visible;
		user-select: none;
	}
	.upper {
		fill: rgba(116, 169, 255, 0.035);
	}
	.grid {
		stroke: rgba(235, 229, 213, 0.06);
	}
	.tick {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 10px;
		text-anchor: middle;
		font-variant-numeric: tabular-nums;
	}
	.tick.end {
		text-anchor: end;
	}
	.lbl {
		fill: var(--ink-dim);
		font-family: var(--font-ui);
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		text-anchor: middle;
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.3);
	}
	.diag {
		stroke: rgba(235, 229, 213, 0.45);
		stroke-width: 1.2;
		stroke-dasharray: 4 4;
	}
	.inf {
		stroke: rgba(235, 229, 213, 0.25);
		stroke-dasharray: 2 4;
	}
	.quad {
		fill: rgba(244, 215, 156, 0.07);
	}
	.quad-edge {
		stroke: rgba(244, 215, 156, 0.55);
		stroke-width: 1.2;
		stroke-dasharray: 3 3;
	}
	.band {
		fill: rgba(242, 141, 182, 0.12);
		stroke: rgba(242, 141, 182, 0.35);
		stroke-width: 1;
	}
	.box {
		fill: color-mix(in srgb, var(--c) 10%, transparent);
		stroke: color-mix(in srgb, var(--c) 45%, transparent);
		stroke-width: 1;
		stroke-dasharray: 2 2;
	}
	.match {
		stroke: rgba(251, 246, 232, 0.65);
		stroke-width: 1.3;
	}
	.ghost {
		fill: none;
		stroke: var(--c);
		stroke-width: 1.4;
		opacity: 0.75;
	}
	.pt {
		cursor: pointer;
		transition: opacity 0.25s var(--ease);
	}
	.pt .mark {
		fill: var(--c);
		stroke: rgba(6, 9, 18, 0.85);
		stroke-width: 1.2;
	}
	.pt .halo {
		fill: var(--c);
		opacity: 0.8;
	}
	.pt.on .mark {
		fill: #fff6dc;
		stroke: var(--c);
		stroke-width: 2;
	}
	.pt.dimmed {
		opacity: 0.35;
	}
	.pt:focus {
		outline: none;
	}
</style>
