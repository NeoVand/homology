<script lang="ts">
	// The persistence playground: a point cloud you can edit, the balls and the
	// Vietoris–Rips complex at radius r, and the barcode + diagram of the whole
	// filtration, all linked. Persistence is recomputed only when the points change.
	import Barcode, { type BarDatum } from './Barcode.svelte';
	import Diagram from './Diagram.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ClearIcon, ShuffleIcon } from '$lib/icons';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { RipsPH, presetCloud, type Preset, type Pt, type RipsBar } from './ph';
	import { makeView, prepare, drawBalls, drawComplex, drawPoints, drawGlowEdges, drawTriangle, ripsAt, pick, ink, type Box } from './draw';

	const MAXPTS = 64;
	const box: Box = { x0: -2.45, x1: 2.45, y0: -1.53, y1: 1.53 };
	const presets: { value: Preset; label: string }[] = [
		{ value: 'circle', label: 'Noisy circle' },
		{ value: 'two', label: 'Two circles' },
		{ value: 'eight', label: 'Figure eight' },
		{ value: 'blob', label: 'Blob' },
		{ value: 'random', label: 'Random' }
	];

	let preset = $state<Preset>('circle');
	let seed = $state(1);
	let custom = $state(false);
	let pts = $state.raw<Pt[]>(presetCloud('circle', 1));
	let ph = $state.raw<RipsPH>(new RipsPH(presetCloud('circle', 1)));
	let r = $state(0.3);
	let tool = $state<'move' | 'add' | 'erase'>('move');
	let showBalls = $state(true);
	let showComplex = $state(true);
	let hover = $state<number | null>(null);
	let selected = $state<number | null>(null);

	const xmax = $derived.by(() => {
		let m = 0;
		for (const b of ph.bars) if (b.death < Infinity) m = Math.max(m, b.death);
		return Math.max(1.2, Math.ceil(m * 1.12 * 10) / 10);
	});
	const bars: BarDatum[] = $derived(ph.bars.map((b) => ({ id: b.id, dim: b.dim, birth: b.birth, death: b.death })));
	const active: RipsBar | null = $derived.by(() => {
		const id = hover ?? selected;
		return id === null ? null : (ph.bars[id] ?? null);
	});
	const betti = $derived(ph.betti(r));
	const h1count = $derived(ph.bars.filter((b) => b.dim === 1).length);

	function recompute() {
		ph = new RipsPH(pts);
		hover = null;
		selected = null;
		if (r > xmax) r = xmax;
	}
	let raf = 0;
	function schedule() {
		if (raf) return;
		raf = requestAnimationFrame(() => {
			raf = 0;
			ph = new RipsPH(pts);
		});
	}
	function loadPreset(p: Preset, s = seed) {
		preset = p;
		custom = false;
		pts = presetCloud(p, s);
		recompute();
	}
	function resample() {
		seed++;
		loadPreset(preset, seed);
	}
	function clearAll() {
		pts = [];
		custom = true;
		tool = 'add';
		recompute();
	}

	// ── canvas ──
	let canvas: HTMLCanvasElement | undefined = $state();
	let cw = $state(760);
	const ch = $derived(Math.round(Math.min(430, Math.max(210, cw / 1.6))));
	let dragIdx = $state(-1);
	let overPt = $state(-1);

	$effect(() => {
		if (!canvas) return;
		const ctx = prepare(canvas, cw, ch);
		if (!ctx) return;
		const v = makeView(cw, ch, box, 10);
		if (showBalls) drawBalls(ctx, v, pts, r);
		if (showComplex) {
			const { edges, tris } = ripsAt(pts, r);
			drawComplex(ctx, v, pts, edges, tris);
		}
		const bar = active;
		let ring: ((i: number) => string | null) | undefined;
		if (bar && bar.dim === 1 && bar.creator.every((i) => i < pts.length)) {
			if (bar.destroyer) drawTriangle(ctx, v, pts, bar.destroyer, 'rgba(95, 214, 207, 0.30)', ink.teal);
			drawGlowEdges(ctx, v, pts, ph.cycle(bar), ink.gold, 2.4);
			drawGlowEdges(ctx, v, pts, [[bar.creator[0], bar.creator[1]]], '#ffffff', 2.6);
		} else if (bar && bar.dim === 0) {
			const comp = new Set(ph.components.get(bar.id) ?? []);
			if (bar.destroyer) drawGlowEdges(ctx, v, pts, [[bar.destroyer[0], bar.destroyer[1]]], ink.teal, 2.2, [5, 5]);
			ring = (i) => (comp.has(i) ? ink.teal : null);
		}
		drawPoints(ctx, v, pts, {
			ring: ring ?? ((i) => (i === dragIdx || (i === overPt && tool !== 'add') ? (tool === 'erase' ? ink.rose : ink.goldBright) : null))
		});
	});

	function local(e: PointerEvent): [number, number] {
		const rect = canvas!.getBoundingClientRect();
		return [e.clientX - rect.left, e.clientY - rect.top];
	}
	function clampW(p: Pt): Pt {
		return [Math.min(box.x1 - 0.05, Math.max(box.x0 + 0.05, p[0])), Math.min(box.y1 - 0.05, Math.max(box.y0 + 0.05, p[1]))];
	}
	function onDown(e: PointerEvent) {
		if (!canvas) return;
		const [px, py] = local(e);
		const v = makeView(cw, ch, box, 10);
		const i = pick(v, pts, px, py, e.pointerType === 'touch' ? 24 : 15);
		if (tool === 'move' && i >= 0) {
			dragIdx = i;
			canvas.setPointerCapture(e.pointerId);
			e.preventDefault();
		} else if (tool === 'add' && pts.length < MAXPTS) {
			pts = [...pts, clampW(v.inv(px, py))];
			custom = true;
			recompute();
		} else if (tool === 'erase' && i >= 0) {
			pts = pts.filter((_, k) => k !== i);
			custom = true;
			overPt = -1;
			recompute();
		}
	}
	function onMove(e: PointerEvent) {
		if (!canvas) return;
		const [px, py] = local(e);
		const v = makeView(cw, ch, box, 10);
		if (dragIdx >= 0) {
			const next = pts.slice();
			next[dragIdx] = clampW(v.inv(px, py));
			pts = next;
			custom = true;
			schedule();
		} else if (e.pointerType === 'mouse') {
			overPt = pick(v, pts, px, py, 15);
		}
	}
	function onUp() {
		if (dragIdx >= 0) {
			dragIdx = -1;
			recompute();
		}
	}
	const cursor = $derived(
		tool === 'add' ? 'crosshair' : dragIdx >= 0 ? 'grabbing' : overPt >= 0 ? (tool === 'erase' ? 'pointer' : 'grab') : 'default'
	);
	const fmt = (x: number) => (x === Infinity ? '\\infty' : x.toFixed(2));
</script>

<div class="pg">
	<div class="bar-top ui">
		<Segmented value={preset} options={presets} label="Data set" onchange={(p) => loadPreset(p, seed)} />
		<span class="spacer"></span>
		<Button variant="subtle" icon={ShuffleIcon} onclick={resample} title="Draw a new random sample of the same shape">New sample</Button>
		<Button variant="subtle" icon={ClearIcon} onclick={clearAll} title="Remove all points and draw your own">Clear</Button>
	</div>

	<div class="stage" bind:clientWidth={cw}>
		<canvas
			bind:this={canvas}
			style="width:{cw}px; height:{ch}px; cursor:{cursor}"
			aria-label="Editable point cloud with discs of radius r around each point and the Vietoris–Rips complex at that radius. Use the data set buttons and the radius timeline to explore without a pointer."
			onpointerdown={onDown}
			onpointermove={onMove}
			onpointerup={onUp}
			onpointercancel={onUp}
			onpointerleave={() => (overPt = -1)}
		></canvas>
		<div class="tools ui">
			<Segmented
				bind:value={tool}
				label="Editing tool"
				options={[
					{ value: 'move', label: 'Move' },
					{ value: 'add', label: 'Add' },
					{ value: 'erase', label: 'Erase' }
				]}
			/>
			<span class="count nums">{pts.length}/{MAXPTS} points</span>
		</div>
		{#if pts.length === 0}
			<div class="empty ui">Tap anywhere to add points.</div>
		{/if}
	</div>

	<div class="readout ui">
		<span class="chip"><span class="k">radius</span> <TeX tex={`r = ${r.toFixed(2)}`} /></span>
		<span class="chip dimtext"><span class="k">edge when distance</span> <TeX tex={`\\le 2r = ${(2 * r).toFixed(2)}`} /></span>
		<span class="chip teal"><span class="k">pieces</span> <TeX tex={`b_0 = ${betti[0]}`} /></span>
		<span class="chip gold"><span class="k">holes</span> <TeX tex={`b_1 = ${betti[1]}`} /></span>
	</div>

	<div class="panels">
		<div class="pane">
			<div class="ptitle ui">Barcode <span class="sub">— drag across it to move r</span></div>
			<Barcode {bars} {xmax} now={r} bind:hover bind:selected height={250} onscrub={(x) => (r = x)} />
		</div>
		<div class="pane">
			<div class="ptitle ui">Persistence diagram</div>
			<Diagram points={bars} max={xmax} now={r} bind:hover bind:selected maxSize={300} />
		</div>
	</div>

	<div class="info">
		{#if active && active.dim === 1}
			<span class="dot gold"></span>
			<span
				>This <b class="gold">loop</b> is born at <TeX tex={`r = ${fmt(active.birth)}`} />, when the white edge closes it, and dies at
				<TeX tex={`r = ${fmt(active.death)}`} />, when the teal triangle fills it in: it persists for
				<TeX tex={`${(active.death - active.birth).toFixed(2)}`} />.</span
			>
		{:else if active && active.dim === 0 && active.death < Infinity}
			<span class="dot teal"></span>
			<span
				>This <b class="teal">component</b> (ringed) exists from <TeX tex="r = 0" /> until <TeX tex={`r = ${fmt(active.death)}`} />,
				when the dashed edge joins it to an older one — and, by the elder rule, the younger piece is the one whose bar ends.</span
			>
		{:else if active && active.dim === 0}
			<span class="dot teal"></span>
			<span>The bar that never ends: there is always at least one piece. Eventually every point belongs to it.</span>
		{:else}
			<span class="dot"></span>
			<span
				>Hover or tap a bar (or a point of the diagram) to see the feature it tracks. {h1count === 0
					? 'This cloud has no loops at all.'
					: `This cloud has ${h1count} loop${h1count === 1 ? '' : 's'} in total — how many are long?`}</span
			>
		{/if}
	</div>

	<div class="controls ui">
		<div class="slider">
			<Timeline bind:value={r} min={0} max={xmax} duration={7} label="Growing the balls" />
		</div>
		<div class="toggles">
			<Toggle bind:checked={showBalls} label="Balls" />
			<Toggle bind:checked={showComplex} label="Complex" />
		</div>
	</div>
</div>

<style>
	.pg {
		container-type: inline-size;
		padding: 0.8rem 1rem 0.4rem;
	}
	.bar-top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.6rem;
		margin-bottom: 0.7rem;
	}
	.spacer {
		flex: 1;
	}
	.stage {
		position: relative;
		border-radius: 10px;
		overflow: hidden;
		background:
			radial-gradient(90% 80% at 50% 45%, rgba(40, 52, 110, 0.35), transparent 75%),
			rgba(3, 6, 14, 0.55);
		border: 1px solid var(--line-faint);
	}
	canvas {
		display: block;
		touch-action: none;
	}
	/* under the picture, not over it, so it never hides points */
	.tools {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		padding: 0.5rem;
		border-top: 1px solid var(--line-faint);
	}
	.count {
		font-size: 0.7rem;
		color: var(--ink-faint);
		text-shadow: 0 0 4px #000;
	}
	.empty {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		color: var(--ink-faint);
		font-size: 0.85rem;
		pointer-events: none;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem 0.6rem;
		margin: 0.75rem 0 0.4rem;
		font-size: 0.8rem;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
		padding: 0.25rem 0.7rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.035);
		border: 1px solid var(--line-faint);
		color: var(--ink-bright);
	}
	.chip .k {
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.chip.teal {
		border-color: rgba(95, 214, 207, 0.35);
		color: var(--teal);
	}
	.chip.gold {
		border-color: rgba(244, 215, 156, 0.4);
		color: var(--gold-bright);
	}
	.chip.dimtext {
		color: var(--ink-dim);
	}
	.panels {
		display: grid;
		grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr);
		gap: 0.6rem 1.4rem;
		align-items: start;
		margin-top: 0.4rem;
	}
	.pane {
		min-width: 0;
		padding: 0.45rem 0.6rem 0.3rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.018);
		border: 1px solid var(--line-faint);
	}
	.ptitle {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 600;
		margin: 0.3rem 0 0.2rem;
	}
	.ptitle .sub {
		text-transform: none;
		letter-spacing: 0.02em;
		color: var(--ink-faint);
		font-weight: 400;
	}
	.info {
		display: flex;
		gap: 0.6rem;
		align-items: baseline;
		min-height: 3.2em;
		margin: 0.5rem 0 0.2rem;
		font-size: 0.92rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
	.info b.gold {
		color: var(--gold-bright);
	}
	.info b.teal {
		color: var(--teal);
	}
	.dot {
		flex: none;
		width: 0.55rem;
		height: 0.55rem;
		border-radius: 50%;
		background: var(--ink-ghost);
		transform: translateY(-0.05rem);
	}
	.dot.gold {
		background: var(--gold-bright);
		box-shadow: 0 0 8px var(--gold-glow);
	}
	.dot.teal {
		background: var(--teal);
		box-shadow: 0 0 8px rgba(95, 214, 207, 0.5);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.4rem;
		padding: 0.7rem 0 0.4rem;
		border-top: 1px solid var(--line-faint);
		margin-top: 0.5rem;
	}
	.slider {
		flex: 1 1 16rem;
		display: flex;
	}
	.toggles {
		display: flex;
		gap: 1rem;
	}
	@container (max-width: 640px) {
		.panels {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (max-width: 640px) {
		.pg {
			padding: 0.6rem 0.6rem 0.3rem;
		}
	}
</style>
