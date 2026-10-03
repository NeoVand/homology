<script lang="ts">
	// Figure: a vector-field explorer. Flowing particles over an animated LIC
	// texture; presets; overlays for curl, divergence and potential level lines;
	// a draggable paddle wheel that spins at the local rate ½·curl.
	import { onMount } from 'svelte';
	import FieldView, { type FieldViewport } from './FieldView.svelte';
	import { fields } from './fields';
	import { fmt, clamp, type Vec2 } from './calc';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';



	const order = ['hills', 'rotation', 'source', 'saddle', 'shear', 'vortex'];
	let key = $state('hills');
	let overlay = $state(0);
	let arrows = $state(false);
	let probe = $state<Vec2>([0.8, -0.9]);
	let angle = $state(0);
	let innerWidth = $state(1000);

	const preset = $derived(fields[key]);
	const height = $derived(innerWidth < 640 ? 360 : 450);

	const F = $derived(preset.F(probe[0], probe[1]));
	const curl = $derived(preset.curl(probe[0], probe[1]));
	const div = $derived(preset.div(probe[0], probe[1]));
	const potentialNote = $derived(
		overlay === 3
			? preset.potential
				? 'Teal curves: level lines of a potential f with ∇f = F.'
				: key === 'vortex'
					? 'Teal rays: level lines of the angle θ — a potential that exists only locally.'
					: 'No potential exists for this field: it swirls.'
			: ''
	);

	// paddle wheel: the fluid's local angular velocity is ½·curl
	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) return;
		let raf = 0;
		let last = 0;
		let visible = false;
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible && !raf) raf = requestAnimationFrame(tick);
		});
		io.observe(root);
		function tick(now: number) {
			raf = 0;
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
			last = now;
			angle = (angle + 0.5 * curl * dt * (180 / Math.PI)) % 360;
			if (visible) raf = requestAnimationFrame(tick);
			else last = 0;
		}
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	});

	let root: HTMLDivElement;
	let dragging = false;
	function down(e: PointerEvent) {
		dragging = true;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent, v: FieldViewport) {
		if (!dragging) return;
		const svg = (e.currentTarget as SVGElement).ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
		const r = svg.getBoundingClientRect();
		const p = v.toWorld(e.clientX - r.left, e.clientY - r.top);
		probe = [clamp(p[0], v.box[0] + 0.15, v.box[1] - 0.15), clamp(p[1], v.box[2] + 0.15, v.box[3] - 0.15)];
	}
	function key_(e: KeyboardEvent) {
		const d = 0.1;
		const m: Record<string, Vec2> = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, d], ArrowDown: [0, -d] };
		if (m[e.key]) {
			probe = [probe[0] + m[e.key][0], probe[1] + m[e.key][1]];
			e.preventDefault();
		}
	}

	function arrowGrid(v: FieldViewport) {
		const out: { x1: number; y1: number; x2: number; y2: number; hx: string }[] = [];
		const step = 0.42;
		for (let y = Math.ceil(v.box[2] / step) * step; y <= v.box[3]; y += step) {
			for (let x = Math.ceil(v.box[0] / step) * step; x <= v.box[1]; x += step) {
				const f = preset.F(x, y);
				const m = Math.hypot(f[0], f[1]);
				if (!isFinite(m) || m < 1e-6 || Math.hypot(x, y) < 0.15) continue;
				const L = (0.34 * Math.tanh(m * 0.9)) / m;
				const a = v.toPx([x - (f[0] * L) / 2, y - (f[1] * L) / 2]);
				const b = v.toPx([x + (f[0] * L) / 2, y + (f[1] * L) / 2]);
				const ux = (b[0] - a[0]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
				const uy = (b[1] - a[1]) / (Math.hypot(b[0] - a[0], b[1] - a[1]) || 1);
				const hs = 5;
				const hx = `M ${b[0]} ${b[1]} L ${b[0] - ux * hs - uy * hs * 0.55} ${b[1] - uy * hs + ux * hs * 0.55} L ${b[0] - ux * hs + uy * hs * 0.55} ${b[1] - uy * hs - ux * hs * 0.55} Z`;
				out.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], hx });
			}
		}
		return out;
	}
	const v2tex = (p: Vec2) => `(${fmt(p[0], 2)},\\ ${fmt(p[1], 2)})`;
</script>

<svelte:window bind:innerWidth />

<div class="explorer" bind:this={root}>
	<FieldView {preset} {overlay} {height} label="An animated vector field: glowing particles flow along the arrows of the chosen field.">
		{#snippet fg(v)}
			{@const c = v.toPx(probe)}
			{@const R = 22}
			<svg class="fv-svg" viewBox="0 0 {v.w} {v.h}" role="presentation">
				{#if arrows}
					<g class="arrows">
						{#each arrowGrid(v) as a, i (i)}
							<line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} />
							<path d={a.hx} />
						{/each}
					</g>
				{/if}
				{#if preset.singular}
					{#each preset.singular as s, i (i)}
						{@const q = v.toPx(s)}
						<circle cx={q[0]} cy={q[1]} r="6" class="hole" />
					{/each}
				{/if}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<g
					class="probe"
					transform="translate({c[0]} {c[1]})"
					role="slider"
					tabindex="0"
					aria-label="Paddle-wheel probe; use arrow keys to move it"
					aria-valuenow={curl}
					onpointerdown={down}
					onpointermove={(e) => move(e, v)}
					onpointerup={() => (dragging = false)}
					onpointercancel={() => (dragging = false)}
					onkeydown={key_}
				>
					<circle r={R + 12} class="hit" />
					<circle r={R} class="ring" />
					<g transform="rotate({-angle})">
						{#each [0, 90, 180, 270] as a (a)}
							<line x1="0" y1="0" x2={R * Math.cos((a * Math.PI) / 180)} y2={R * Math.sin((a * Math.PI) / 180)} class="blade" />
							<circle cx={R * Math.cos((a * Math.PI) / 180)} cy={R * Math.sin((a * Math.PI) / 180)} r="3" class="tip" />
						{/each}
					</g>
					<circle r="3.5" class="hub" />
				</g>
				{#if potentialNote}
					<text x="14" y={v.h - 14} class="note">{potentialNote}</text>
				{/if}
				{#if overlay === 1}
					<text x="14" y={v.h - 14} class="note"><tspan class="rose">rose</tspan> = counterclockwise swirl (curl &gt; 0) · <tspan class="teal">teal</tspan> = clockwise (curl &lt; 0)</text>
				{:else if overlay === 2}
					<text x="14" y={v.h - 14} class="note"><tspan class="gold">gold</tspan> = spreading out (div &gt; 0) · <tspan class="blue">blue</tspan> = converging (div &lt; 0)</text>
				{/if}
			</svg>
		{/snippet}
	</FieldView>
	<Controls>
		<Segmented bind:value={key} label="Field" options={order.map((k) => ({ value: k, label: fields[k].label }))} />
		<Segmented
			bind:value={overlay}
			label="Colour by"
			options={[
				{ value: 0, label: 'Speed' },
				{ value: 1, label: 'Curl' },
				{ value: 2, label: 'Divergence' },
				{ value: 3, label: 'Potential' }
			]}
		/>
		<Toggle bind:checked={arrows} label="Arrows" />
	</Controls>
	<div class="readout ui">
		<div class="col">
			<div class="blurb">{preset.blurb}</div>
			<div class="formulas">
				<TeX tex={preset.tex} />
				<span><TeX tex={String.raw`\operatorname{curl}\mathbf F = ${preset.curlTex}`} /></span>
				<span><TeX tex={String.raw`\operatorname{div}\mathbf F = ${preset.divTex}`} /></span>
			</div>
		</div>
		<div class="col probe-read">
			<div class="lbl">Paddle wheel at <TeX tex={v2tex(probe)} /></div>
			<div><TeX tex={String.raw`\mathbf F = ${v2tex(F)}`} /></div>
			<div>
				<TeX tex={String.raw`\operatorname{curl} = ${fmt(curl, 2)}`} />, <TeX tex={String.raw`\operatorname{div} = ${fmt(div, 2)}`} />
			</div>
		</div>
	</div>
</div>

<style>
	.explorer {
		position: relative;
	}
	.arrows line {
		stroke: rgba(245, 238, 220, 0.55);
		stroke-width: 1.3;
	}
	.arrows path {
		fill: rgba(245, 238, 220, 0.6);
	}
	.hole {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 2;
		filter: drop-shadow(0 0 6px rgba(242, 141, 182, 0.8));
	}
	.probe {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.probe:active {
		cursor: grabbing;
	}
	.probe .hit {
		fill: transparent;
	}
	.probe .ring {
		fill: rgba(8, 12, 26, 0.35);
		stroke: rgba(255, 241, 208, 0.75);
		stroke-width: 1.4;
		stroke-dasharray: 3 4;
	}
	.probe:focus-visible .ring {
		stroke: var(--gold-bright);
		stroke-dasharray: none;
	}
	.blade {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
		stroke-linecap: round;
		filter: drop-shadow(0 0 4px rgba(242, 208, 143, 0.7));
	}
	.tip {
		fill: var(--gold-pale);
	}
	.hub {
		fill: #fff6df;
	}
	.note {
		fill: rgba(235, 229, 213, 0.85);
		font-family: var(--font-ui);
		font-size: 12px;
		paint-order: stroke;
		stroke: rgba(4, 6, 14, 0.85);
		stroke-width: 3px;
	}
	.note .rose {
		fill: var(--rose);
	}
	.note .teal {
		fill: var(--teal);
	}
	.note .gold {
		fill: var(--gold-bright);
	}
	.note .blue {
		fill: var(--blue);
	}
	.readout {
		display: grid;
		grid-template-columns: 1.4fr 1fr;
		gap: 0.8rem 1.6rem;
		padding: 0.9rem 1.2rem 1.1rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
		border-top: 1px solid var(--line-faint);
	}
	.blurb {
		color: var(--ink);
		margin-bottom: 0.45rem;
		font-family: var(--font-body);
		font-size: 0.95rem;
	}
	.formulas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.3rem;
		color: var(--gold-pale);
		font-size: 1rem;
	}
	.probe-read {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 0.95rem;
		color: var(--ink);
	}
	.probe-read .lbl {
		color: var(--gold);
		font-size: 0.8rem;
		letter-spacing: 0.04em;
	}
	@media (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
	}
</style>
