<script lang="ts" module>
	export interface BarDatum {
		id: number;
		dim: number;
		birth: number;
		/** Infinity for a class that never dies */
		death: number;
		/** override the colour of the bar (CSS colour) */
		color?: string;
		/** short TeX tag drawn at the left end of the bar */
		tag?: string;
	}
	export const dimColor = ['var(--teal)', 'var(--gold-bright)', 'var(--rose)'];
</script>

<script lang="ts">
	// A persistence barcode: one horizontal bar [birth, death) per homology class,
	// grouped by dimension (H₀ teal, H₁ gold), with an optional vertical "now" line
	// that the reader can drag.
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	let {
		bars,
		xmax,
		now = null,
		hover = $bindable(null),
		selected = $bindable(null),
		height = 220,
		dims = [0, 1],
		growing = false,
		ticks,
		axis = 'r',
		onscrub,
		label = 'Persistence barcode',
		minPitch = 2.4,
		maxPitch = 15
	}: {
		bars: BarDatum[];
		/** right end of the axis */
		xmax: number;
		/** position of the "now" line (null: none) */
		now?: number | null;
		hover?: number | null;
		selected?: number | null;
		height?: number;
		dims?: number[];
		/** flip-book mode: draw only what has happened by `now` */
		growing?: boolean;
		ticks?: number[];
		/** TeX name of the parameter on the axis */
		axis?: string;
		/** if given, clicking/dragging on the plot moves the now line */
		onscrub?: (x: number) => void;
		label?: string;
		minPitch?: number;
		maxPitch?: number;
	} = $props();

	const uid = $props.id();
	let cw = $state(560);
	const W = $derived(Math.max(260, Math.round(cw)));
	const padL = 40;
	const padR = 30;
	const padT = 8;
	const padB = 30;
	const plotW = $derived(W - padL - padR);
	const x = (v: number) => padL + (Math.min(Math.max(v, 0), xmax) / xmax) * plotW;

	const autoTicks = $derived.by(() => {
		if (ticks) return ticks;
		const target = Math.max(3, Math.floor(plotW / 90));
		const raw = xmax / target;
		const pow = Math.pow(10, Math.floor(Math.log10(raw)));
		const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
		const out: number[] = [];
		for (let v = 0; v <= xmax + 1e-9; v += step) out.push(+v.toFixed(6));
		return out;
	});

	interface Row {
		bar: BarDatum;
		y: number;
	}
	const layout = $derived.by(() => {
		const groups = dims.map((d) => bars.filter((b) => b.dim === d));
		const gap = 14;
		const avail = height - padT - padB - gap * (groups.length - 1);
		const total = groups.reduce((s, g) => s + Math.max(g.length, 1.5), 0);
		const pitch = Math.max(minPitch, Math.min(maxPitch, avail / total));
		const thick = Math.max(1.6, Math.min(9, pitch * 0.62));
		const rows: Row[] = [];
		const labels: { dim: number; y: number; h: number }[] = [];
		let y = padT;
		groups.forEach((g, gi) => {
			const h = Math.max(g.length, 1.5) * pitch;
			labels.push({ dim: dims[gi], y, h });
			g.forEach((bar, i) => rows.push({ bar, y: y + (i + 0.5) * pitch }));
			y += h + gap;
		});
		return { rows, labels, thick, pitch, bottom: y - gap };
	});

	const active = $derived(hover ?? selected);

	function alive(b: BarDatum) {
		return now !== null && b.birth <= now + 1e-12 && now + 1e-12 < b.death;
	}

	let scrubbing = false;
	let svgEl: SVGSVGElement | undefined = $state();
	function toValue(e: PointerEvent) {
		if (!svgEl) return 0;
		const rect = svgEl.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		return Math.min(xmax, Math.max(0, ((px - padL) / plotW) * xmax));
	}
	function down(e: PointerEvent) {
		if (!onscrub) return;
		scrubbing = true;
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		onscrub(toValue(e));
	}
	function move(e: PointerEvent) {
		if (scrubbing && onscrub) onscrub(toValue(e));
	}
	function up() {
		scrubbing = false;
	}
</script>

<div class="barcode" bind:clientWidth={cw}>
	<svg
		bind:this={svgEl}
		viewBox="0 0 {W} {height}"
		width="100%"
		{height}
		role="img"
		aria-label={label}
		class:scrub={!!onscrub}
	>
		<defs>
			<filter id="{uid}-glow" x="-20%" y="-200%" width="140%" height="500%">
				<feGaussianBlur stdDeviation="2.4" />
			</filter>
		</defs>

		<!-- scrub surface -->
		<rect
			x={padL}
			y={0}
			width={plotW}
			height={height - padB + 6}
			fill="transparent"
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointercancel={up}
		/>

		<!-- grid + axis -->
		{#each autoTicks as t (t)}
			<line x1={x(t)} x2={x(t)} y1={padT - 2} y2={height - padB + 4} class="grid" />
			<text x={x(t)} y={height - padB + 17} class="tick">{t}</text>
		{/each}
		<line x1={padL} x2={padL + plotW} y1={height - padB + 4} y2={height - padB + 4} class="axis" />
		<SvgTeX x={padL + plotW + 12} y={height - padB + 4} tex={axis} size={14} color="var(--ink-dim)" anchor="start" w={24} h={20} />

		<!-- group labels -->
		{#each layout.labels as g (g.dim)}
			<line x1={padL - 6} x2={padL - 6} y1={g.y + 2} y2={g.y + g.h - 2} class="bracket" style="stroke:{dimColor[g.dim]}" />
			<SvgTeX x={padL - 22} y={g.y + g.h / 2} tex={`H_${g.dim}`} size={14} color={dimColor[g.dim]} w={34} h={22} />
		{/each}

		<!-- bars -->
		{#each layout.rows as { bar, y } (bar.id)}
			{@const c = bar.color ?? dimColor[bar.dim] ?? 'var(--ink)'}
			{@const shown = !growing || (now !== null && bar.birth <= now + 1e-12)}
			{@const end = growing && now !== null ? Math.min(bar.death, now) : bar.death}
			{@const x0 = x(bar.birth)}
			{@const x1 = end === Infinity ? padL + plotW : x(end)}
			{@const isOn = active === bar.id}
			{@const lit = now === null || alive(bar) || isOn}
			{#if shown}
				<g
					class="bar"
					class:on={isOn}
					class:dimmed={!lit}
					style="--c:{c}"
					role="button"
					tabindex="-1"
					aria-label="H{bar.dim} bar from {bar.birth.toFixed(2)} to {bar.death === Infinity ? 'infinity' : bar.death.toFixed(2)}"
					onpointerenter={(e) => e.pointerType === 'mouse' && (hover = bar.id)}
					onpointerleave={(e) => e.pointerType === 'mouse' && (hover = null)}
					onclick={() => (selected = selected === bar.id ? null : bar.id)}
				>
					{#if isOn || (lit && now !== null)}
						<rect
							x={x0}
							y={y - layout.thick / 2 - 1}
							width={Math.max(1.5, x1 - x0)}
							height={layout.thick + 2}
							rx={layout.thick / 2}
							class="halo"
							filter="url(#{uid}-glow)"
						/>
					{/if}
					<rect
						x={x0}
						y={y - layout.thick / 2}
						width={Math.max(1.5, x1 - x0)}
						height={layout.thick}
						rx={Math.min(layout.thick / 2, 3)}
						class="core"
					/>
					{#if bar.death === Infinity && (!growing || now === null || now >= xmax - 1e-9)}
						<path
							d="M {padL + plotW} {y - layout.thick / 2 - 3} L {padL + plotW + 8} {y} L {padL + plotW} {y + layout.thick / 2 + 3} Z"
							class="arrow"
						/>
					{/if}
					{#if growing && now !== null && end === now && now < bar.death}
						<circle cx={x1} cy={y} r={Math.max(2.4, layout.thick * 0.6)} class="tip" />
					{/if}
					<!-- generous hit area -->
					<rect x={x0 - 3} y={y - Math.max(layout.pitch, 9) / 2} width={Math.max(8, x1 - x0 + 6)} height={Math.max(layout.pitch, 9)} fill="transparent" />
					{#if bar.tag}
						<SvgTeX x={x0 - 4} y={y} tex={bar.tag} size={12} color={c} anchor="end" w={40} h={18} />
					{/if}
				</g>
			{/if}
		{/each}

		<!-- now line -->
		{#if now !== null}
			<g class="now" pointer-events="none">
				<line x1={x(now)} x2={x(now)} y1={padT - 4} y2={height - padB + 4} />
				<circle cx={x(now)} cy={height - padB + 4} r="4" />
			</g>
		{/if}
	</svg>
</div>

<style>
	.barcode {
		width: 100%;
		min-width: 0;
	}
	svg {
		display: block;
		overflow: visible;
		touch-action: pan-y;
		user-select: none;
	}
	svg.scrub {
		cursor: ew-resize;
	}
	.grid {
		stroke: rgba(235, 229, 213, 0.06);
		stroke-width: 1;
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.28);
		stroke-width: 1;
	}
	.tick {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 10.5px;
		text-anchor: middle;
		font-variant-numeric: tabular-nums;
	}
	.bracket {
		stroke-width: 1.5;
		opacity: 0.5;
		stroke-linecap: round;
	}
	.bar {
		cursor: pointer;
		transition: opacity 0.25s var(--ease);
	}
	.bar .core {
		fill: var(--c);
		transition:
			fill 0.2s,
			opacity 0.2s;
	}
	.bar .halo {
		fill: var(--c);
		opacity: 0.55;
	}
	.bar .arrow {
		fill: var(--c);
	}
	.bar .tip {
		fill: #fff8e6;
		stroke: var(--c);
		stroke-width: 1.5;
	}
	.bar.dimmed {
		opacity: 0.32;
	}
	.bar.on .core {
		fill: #fff6dc;
	}
	.bar.on .halo {
		opacity: 0.95;
	}
	.bar:focus {
		outline: none;
	}
	.now line {
		stroke: rgba(251, 246, 232, 0.85);
		stroke-width: 1.4;
		stroke-dasharray: 3 3;
	}
	.now circle {
		fill: var(--gold-bright);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
	}
</style>
