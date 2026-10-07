<script lang="ts">
	// Figure (centrepiece): the vortex dθ on the punctured plane. Drag a closed
	// loop; a bead walks around it while an "odometer" spiral at the puncture
	// records the total angle swept. Live readouts: the winding number w and the
	// integral ∮dθ computed along the curve, always equal to 2π·w.
	import { onMount } from 'svelte';
	import FieldView from '$lib/figures/cohomology/differential-forms/FieldView.svelte';
	import LoopEditor from '$lib/figures/cohomology/differential-forms/LoopEditor.svelte';
	import { fields } from '$lib/figures/cohomology/differential-forms/fields';
	import {
		closedCatmullRom,
		fmt,
		lineIntegral,
		liftAngle,
		windingNumber,
		type Vec2
	} from '$lib/figures/cohomology/differential-forms/calc';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { gallery, TAU } from './derham';

	const ring = (c: Vec2, r: number, n = 6, ph = 0.35, wob = 0.12): Vec2[] =>
		Array.from({ length: n }, (_, k) => {
			const a = ph + (TAU * k) / n;
			const rr = r * (1 + wob * Math.sin(3 * k + 1));
			return [c[0] + rr * Math.cos(a), c[1] + rr * Math.sin(a)] as Vec2;
		});
	const shapes: Record<string, () => Vec2[]> = {
		once: () => ring([0.15, -0.05], 1.3),
		twice: () => [0, 2, 4, 1, 3].map((k) => ring([0, 0], 1.45, 5, 0.6, 0)[k]),
		off: () => ring([1.35, 0.45], 0.6, 6, 0.2, 0.08),
		back: () => ring([0.1, 0.05], 1.2).reverse()
	};

	let points = $state<Vec2[]>(shapes.once());
	let overlay = $state(0);
	let s = $state(0.0);
	let innerWidth = $state(1000);

	const height = $derived(innerWidth < 640 ? 380 : 470);
	const poly = $derived(closedCatmullRom(points, 30));
	const w = $derived(windingNumber(poly, [0, 0]));
	const integral = $derived(lineIntegral(poly, gallery.angle.PQ));
	const minR = $derived(Math.min(...poly.map((p) => Math.hypot(p[0], p[1]))));
	const lifted = $derived(liftAngle(poly));
	const idx = $derived(Math.min(poly.length - 1, Math.floor(s * poly.length)));
	const bead = $derived(poly[idx]);
	const swept = $derived(lifted[idx] - lifted[0]);

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			s = 0.62;
			return;
		}
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
			s = (s + dt / 7) % 1;
			if (visible) raf = requestAnimationFrame(tick);
			else last = 0;
		}
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	});
	let root: HTMLDivElement;

	/** the odometer: a spiral around the puncture whose angle is the angle swept so far */
	function odometer(toPx: (p: Vec2) => Vec2) {
		const th0 = lifted[0];
		const n = Math.max(2, Math.ceil((Math.abs(swept) / TAU) * 90));
		const pts: string[] = [];
		for (let i = 0; i <= n; i++) {
			const ph = (swept * i) / n;
			const r = 0.24 + (0.075 * Math.abs(ph)) / TAU;
			const q = toPx([r * Math.cos(th0 + ph), r * Math.sin(th0 + ph)]);
			pts.push(`${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
		}
		return 'M ' + pts.join(' L ');
	}
	const wTeX = (n: number) => (n === 0 ? '0' : n === 1 ? '2\\pi' : n === -1 ? '-2\\pi' : `${n}\\cdot 2\\pi`);
</script>

<svelte:window bind:innerWidth />

<div class="vortex" bind:this={root}>
	<FieldView
		preset={fields.vortex}
		{overlay}
		{height}
		extent={2.05}
		particleOptions={{ count: 520, maxSpeed: 1.6, speed: 0.5 }}
		label="The swirling field of the angle form around a missing point, with a draggable closed loop."
	>
		{#snippet fg(v)}
			{@const o = v.toPx([0, 0])}
			{@const b = v.toPx(bead)}
			<svg class="fv-svg" viewBox="0 0 {v.w} {v.h}" role="presentation">
				<line x1={o[0]} y1={o[1]} x2={b[0]} y2={b[1]} class="ray" />
				<path d={odometer(v.toPx)} class="odo" />
				<circle cx={o[0]} cy={o[1]} r="7" class="hole" />
				<LoopEditor bind:points view={v} {bead} fill={false} moverOffset={[0.55, -0.55]} />
				<text x={o[0] - 14} y={o[1] + 24} text-anchor="end" class="hole-lbl">0 (missing)</text>
			</svg>
		{/snippet}
	</FieldView>
	<Controls>
		<span class="lbl ui">Loop:</span>
		<Button variant="subtle" onclick={() => (points = shapes.once())}>Once around</Button>
		<Button variant="subtle" onclick={() => (points = shapes.twice())}>Twice around</Button>
		<Button variant="subtle" onclick={() => (points = shapes.off())}>Not around</Button>
		<Button variant="subtle" onclick={() => (points = shapes.back())}>Backwards</Button>
		<Segmented
			bind:value={overlay}
			label="Show"
			options={[
				{ value: 0, label: 'Flow' },
				{ value: 3, label: 'Angle rays' }
			]}
		/>
	</Controls>
	<div class="readout">
		<div class="cell">
			<span class="cap ui">winding number</span>
			<span class="big">{w}</span>
		</div>
		<div class="cell">
			<span class="cap ui">computed along the curve</span>
			<TeX tex={String.raw`\oint_\gamma d\theta = ${fmt(integral, 4).replace('−', '-')}`} />
		</div>
		<div class="cell">
			<span class="cap ui">prediction</span>
			<TeX tex={String.raw`2\pi\cdot w = ${wTeX(w)} = ${fmt(TAU * w, 4).replace('−', '-')}`} />
		</div>
		<p class="note">
			{#if minR < 0.06}
				Careful — the loop is almost touching the missing point, where dθ is not defined.
			{:else}
				The bead has swept <b>{fmt(swept, 2)}</b> radians so far (the spiral at the centre). Every loop gives a whole number of turns.
			{/if}
		</p>
	</div>
</div>

<style>
	.ray {
		stroke: rgba(255, 244, 218, 0.35);
		stroke-width: 1.2;
		stroke-dasharray: 3 4;
	}
	.odo {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2.4;
		stroke-linecap: round;
		filter: drop-shadow(0 0 4px rgba(242, 141, 182, 0.8));
	}
	.hole {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 2.2;
		filter: drop-shadow(0 0 6px rgba(242, 141, 182, 0.9));
	}
	.hole-lbl {
		fill: var(--rose);
		font-family: var(--font-ui);
		font-size: 11px;
		letter-spacing: 0.06em;
		paint-order: stroke;
		stroke: rgba(4, 6, 14, 0.85);
		stroke-width: 3px;
	}
	.lbl {
		font-size: 0.76rem;
		color: var(--ink-faint);
		letter-spacing: 0.06em;
	}
	.readout {
		display: grid;
		grid-template-columns: auto 1fr 1fr;
		gap: 0.6rem 1.6rem;
		align-items: end;
		padding: 0.9rem 1.2rem 0.5rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1.05rem;
	}
	.cell {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.cap {
		font-size: 0.66rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.big {
		font-family: var(--font-display);
		font-variant-numeric: lining-nums tabular-nums;
		font-size: 2rem;
		line-height: 1;
		color: var(--gold-bright);
		text-shadow: 0 0 14px var(--gold-glow);
	}
	.note {
		grid-column: 1 / -1;
		margin: 0.2rem 0 0.4rem;
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
	.note b {
		color: var(--rose);
		font-variant-numeric: tabular-nums;
	}
	@container figure (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
	}
</style>
