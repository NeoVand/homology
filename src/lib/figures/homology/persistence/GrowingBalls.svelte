<script lang="ts">
	// Grow a disc around every point and count the pieces and holes of the union.
	// (Holes are counted exactly, through the Čech complex and the nerve theorem.)
	import CloudSvg from './CloudSvg.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import { cechFiltration, reduce, barsOf, bettiAt, ringWithStraggler, type Pt } from './ph';
	import type { Box } from './draw';

	const pts: Pt[] = ringWithStraggler();
	const box: Box = { x0: -1.95, x1: 2.45, y0: -1.6, y1: 1.6 };
	const RMAX = 1.3;

	const bars = barsOf(reduce(cechFiltration(pts, 2)), 1);
	let r = $state(0.12);
	const b = $derived(bettiAt(bars, r, 1));

	// Betti curves: step functions of r
	const W = 560;
	const rowH = 46;
	const padL = 46;
	const padR = 14;
	const plotW = W - padL - padR;
	const X = (v: number) => padL + (v / RMAX) * plotW;
	const samples = Array.from({ length: 521 }, (_, i) => (i / 520) * RMAX);
	const curve0 = samples.map((v) => bettiAt(bars, v, 1)[0]);
	const curve1 = samples.map((v) => bettiAt(bars, v, 1)[1]);
	const max0 = Math.max(...curve0);
	const max1 = Math.max(1, ...curve1);
	function stepPath(vals: number[], max: number, y0: number) {
		let d = '';
		vals.forEach((v, i) => {
			const x = X(samples[i]);
			const y = y0 + rowH - 6 - (v / max) * (rowH - 14);
			d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
		});
		return d;
	}
	const path0 = stepPath(curve0, max0, 0);
	const path1 = stepPath(curve1, max1, rowH + 8);
	const ticks = [0, 0.25, 0.5, 0.75, 1, 1.25];

	let stripEl: SVGSVGElement | undefined = $state();
	let scrubbing = false;
	function scrub(e: PointerEvent) {
		if (!stripEl) return;
		const rect = stripEl.getBoundingClientRect();
		const px = ((e.clientX - rect.left) / rect.width) * W;
		r = Math.min(RMAX, Math.max(0, ((px - padL) / plotW) * RMAX));
	}
	const mood = $derived(
		b[0] > 3 ? 'Dust: many separate pieces, no holes.' : b[1] > 0 ? (b[0] === 1 ? 'A ring: one piece with a hole in it.' : 'Almost a ring — one straggler is still on its own.') : b[0] === 1 ? 'A blob: one piece, no holes.' : 'Pieces are joining up.'
	);
</script>

<div class="gb">
	<CloudSvg {pts} {box} {r} clip maxHeight={320} pointRadius={4.6} label="Eighteen points with a disc of radius r around each" />
	<div class="readout ui">
		<span class="chip"><TeX tex={`r = ${r.toFixed(2)}`} /></span>
		<span class="chip teal"><span class="k">pieces</span> <TeX tex={`b_0 = ${b[0]}`} /></span>
		<span class="chip gold"><span class="k">holes</span> <TeX tex={`b_1 = ${b[1]}`} /></span>
		<span class="mood">{mood}</span>
	</div>
	<svg
		bind:this={stripEl}
		class="strip"
		viewBox="0 0 {W} {2 * rowH + 30}"
		role="img"
		aria-label="The number of pieces and of holes of the union of discs, as functions of the radius r"
		onpointerdown={(e) => {
			scrubbing = true;
			stripEl?.setPointerCapture(e.pointerId);
			scrub(e);
		}}
		onpointermove={(e) => scrubbing && scrub(e)}
		onpointerup={() => (scrubbing = false)}
		onpointercancel={() => (scrubbing = false)}
	>
		{#each ticks as t (t)}
			<line x1={X(t)} x2={X(t)} y1="2" y2={2 * rowH + 10} class="grid" />
			<text x={X(t)} y={2 * rowH + 24} class="tick">{t}</text>
		{/each}
		<SvgTeX x={padL - 18} y={rowH / 2} tex="b_0" size={15} color="var(--teal)" w={30} h={22} />
		<SvgTeX x={padL - 18} y={rowH + 8 + rowH / 2} tex="b_1" size={15} color="var(--gold-bright)" w={30} h={22} />
		<text x={padL + plotW} y="12" class="maxv">max {max0}</text>
		<text x={padL + plotW} y={rowH + 20} class="maxv">max {max1}</text>
		<line x1={padL} x2={padL + plotW} y1={rowH - 6} y2={rowH - 6} class="base" />
		<line x1={padL} x2={padL + plotW} y1={2 * rowH + 2} y2={2 * rowH + 2} class="base" />
		<path d={path0} class="curve teal" />
		<path d={path1} class="curve gold" />
		<line x1={X(r)} x2={X(r)} y1="0" y2={2 * rowH + 10} class="now" />
		<circle cx={X(r)} cy={2 * rowH + 10} r="4" class="knob" />
	</svg>
	<div class="controls ui">
		<Timeline bind:value={r} min={0} max={RMAX} duration={7} label="Growing every disc" readout={(v) => `r = ${v.toFixed(2)}`} />
	</div>
</div>

<style>
	.gb {
		padding: 0.9rem 1rem 0.2rem;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.45rem 0.6rem;
		margin: 0.6rem 0 0.3rem;
		font-size: 0.82rem;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		color: var(--ink-bright);
	}
	.chip .k {
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.chip.teal {
		color: var(--teal);
		border-color: rgba(95, 214, 207, 0.35);
	}
	.chip.gold {
		color: var(--gold-bright);
		border-color: rgba(244, 215, 156, 0.4);
	}
	.mood {
		color: var(--ink-dim);
		font-size: 0.82rem;
		min-width: 15rem;
		text-align: center;
	}
	.strip {
		display: block;
		width: 100%;
		max-width: 560px;
		margin: 0.3rem auto 0;
		cursor: ew-resize;
		touch-action: pan-y;
		user-select: none;
	}
	.grid {
		stroke: rgba(235, 229, 213, 0.06);
	}
	.base {
		stroke: rgba(235, 229, 213, 0.22);
	}
	.tick {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 10.5px;
		text-anchor: middle;
	}
	.maxv {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 9.5px;
		text-anchor: end;
	}
	.curve {
		fill: none;
		stroke-width: 2;
		stroke-linejoin: round;
	}
	.curve.teal {
		stroke: var(--teal);
	}
	.curve.gold {
		stroke: var(--gold-bright);
	}
	.now {
		stroke: rgba(251, 246, 232, 0.8);
		stroke-dasharray: 3 3;
	}
	.knob {
		fill: var(--gold-bright);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
	}
	.controls {
		display: flex;
		padding: 0.5rem 0 0.6rem;
	}
</style>
