<script lang="ts">
	// Drag a closed curve around a puncture. A probe runs round the loop while
	// the ray from the puncture sweeps out angle; the right panel plots the
	// total angle (the lift to the real line). Its final value is the winding
	// number, which can only change when the loop is dragged across the puncture.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { catmullRomClosed, distToPolyline, liftAngle, pathD, type Pt } from './geom';

	const S = 62; // px per unit
	const CX = 210;
	const CY = 190;
	const toPx = (p: Pt): Pt => [CX + S * p[0], CY - S * p[1]];

	const presets: Record<string, Pt[]> = {
		once: Array.from({ length: 8 }, (_, k) => {
			const a = (k * Math.PI) / 4 + 0.2;
			const r = k % 2 ? 1.55 : 1.95;
			return [r * Math.cos(a), r * Math.sin(a) * 0.92] as Pt;
		}),
		twice: Array.from({ length: 8 }, (_, k) => {
			const a = (k * Math.PI) / 2 + 0.3;
			const r = k < 4 ? 2.05 : 0.95;
			return [r * Math.cos(a), r * Math.sin(a)] as Pt;
		}),
		zero: Array.from({ length: 8 }, (_, k) => {
			const a = (k * Math.PI) / 4;
			const r = k % 2 ? 0.7 : 0.85;
			return [1.75 + r * Math.cos(a), 0.55 + r * Math.sin(a)] as Pt;
		}),
		backwards: Array.from({ length: 8 }, (_, k) => {
			const a = -(k * Math.PI) / 4 - 0.4;
			const r = k % 2 ? 1.5 : 2.0;
			return [r * Math.cos(a), r * Math.sin(a) * 0.9] as Pt;
		})
	};

	let ctrl = $state<Pt[]>(presets.once.map((p) => [...p] as Pt));
	let hole = $state<Pt>([0, 0]);
	let tau = $state(1);
	let svg = $state<SVGSVGElement>();
	let drag: number | 'hole' | null = null;
	let playing = $state(false);
	let raf = 0;

	const curve = $derived(catmullRomClosed(ctrl, 40));
	const lift = $derived(liftAngle(curve, hole, true));
	const touching = $derived(distToPolyline(hole, curve, true) < 0.07);
	const winding = $derived(Math.round(lift.total) || 0);
	// samples up to the probe
	const M = $derived(curve.length);
	const idx = $derived(Math.min(M, Math.round(tau * M)));
	const probe = $derived(curve[idx % M]);
	const swept = $derived(lift.turns[idx] - lift.turns[0]);

	// the spiral that records the angle swept so far
	const spiral = $derived.by(() => {
		const pts: Pt[] = [];
		const t0 = lift.turns[0];
		const step = Math.max(1, Math.floor(idx / 240));
		for (let i = 0; i <= idx; i += step) {
			const turns = lift.turns[i];
			const ang = turns * Math.PI * 2;
			const r = 0.34 + 0.13 * Math.abs(turns - t0);
			pts.push(toPx([hole[0] + r * Math.cos(ang), hole[1] + r * Math.sin(ang)]));
		}
		return pts;
	});
	const curvePx = $derived(curve.map(toPx));
	const holePx = $derived(toPx(hole));
	const probePx = $derived(toPx(probe));

	// ── lift graph ──
	const GX0 = 46;
	const GX1 = 296;
	const GY0 = 344;
	const GY1 = 36;
	const range = $derived.by(() => {
		let lo = 0;
		let hi = 0;
		const t0 = lift.turns[0];
		for (const v of lift.turns) {
			lo = Math.min(lo, v - t0);
			hi = Math.max(hi, v - t0);
		}
		lo = Math.min(-1, Math.floor(lo - 0.25));
		hi = Math.max(1, Math.ceil(hi + 0.25));
		return [lo, hi] as const;
	});
	const gy = (v: number) => GY0 - ((v - range[0]) / (range[1] - range[0])) * (GY0 - GY1);
	const gx = (t: number) => GX0 + t * (GX1 - GX0);
	const graph = $derived.by(() => {
		const t0 = lift.turns[0];
		const n = lift.turns.length - 1;
		const pts: Pt[] = [];
		const step = Math.max(1, Math.floor(n / 300));
		for (let i = 0; i <= n; i += step) pts.push([gx(i / n), gy(lift.turns[i] - t0)]);
		pts.push([gx(1), gy(lift.turns[n] - t0)]);
		return pts;
	});
	const graphDone = $derived(graph.filter((p) => p[0] <= gx(tau) + 0.01));
	const ints = $derived(Array.from({ length: range[1] - range[0] + 1 }, (_, k) => range[0] + k));

	function toUnits(e: PointerEvent): Pt {
		if (!svg) return [0, 0];
		const p = svg.createSVGPoint();
		p.x = e.clientX;
		p.y = e.clientY;
		const q = p.matrixTransform(svg.getScreenCTM()!.inverse());
		return [Math.max(-3.1, Math.min(3.1, (q.x - CX) / S)), Math.max(-2.75, Math.min(2.75, (CY - q.y) / S))];
	}
	function start(e: PointerEvent, which: number | 'hole') {
		drag = which;
		svg?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (drag === null) return;
		const p = toUnits(e);
		if (drag === 'hole') hole = p;
		else ctrl[drag] = p;
	}
	function end() {
		drag = null;
	}
	function nudge(e: KeyboardEvent, which: number | 'hole') {
		const d = e.shiftKey ? 0.25 : 0.08;
		const map: Record<string, Pt> = { ArrowUp: [0, d], ArrowDown: [0, -d], ArrowLeft: [-d, 0], ArrowRight: [d, 0] };
		const v = map[e.key];
		if (!v) return;
		e.preventDefault();
		if (which === 'hole') hole = [hole[0] + v[0], hole[1] + v[1]];
		else ctrl[which] = [ctrl[which][0] + v[0], ctrl[which][1] + v[1]];
	}
	function load(name: string) {
		ctrl = presets[name].map((p) => [...p] as Pt);
		hole = [0, 0];
		tau = 1;
	}

	const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
	function play() {
		if (playing) {
			cancelAnimationFrame(raf);
			playing = false;
			return;
		}
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			tau = 1;
			return;
		}
		playing = true;
		const t0 = performance.now();
		const dur = 2400 + 1400 * Math.abs(winding);
		const tick = (now: number) => {
			const x = Math.min(1, (now - t0) / dur);
			tau = ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	function chevron(i: number): string {
		const a = curvePx[(i - 3 + M) % M];
		const b = curvePx[(i + 3) % M];
		const [x, y] = curvePx[i];
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const L = Math.hypot(dx, dy) || 1;
		const ux = dx / L;
		const uy = dy / L;
		const s = 7;
		return `M${x - ux * s - uy * s * 0.65} ${y - uy * s + ux * s * 0.65} L${x + ux * s * 0.5} ${y + uy * s * 0.5} L${x - ux * s + uy * s * 0.65} ${y - uy * s - ux * s * 0.65}`;
	}
	const fmt = (v: number) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
</script>

<div class="grid">
	<div class="plane">
		<Svg
			viewBox="0 0 420 380"
			maxHeight={440}
			label="A closed curve in the plane around a puncture; a probe moves along it and the angle it sweeps is recorded"
			bind:svg
			onpointermove={move}
			onpointerup={end}
			onpointerleave={end}
		>
			<defs>
				<pattern id="wn-grid" width={S / 2} height={S / 2} patternUnits="userSpaceOnUse" x={CX} y={CY}>
					<path d="M {S / 2} 0 L 0 0 0 {S / 2}" fill="none" stroke="rgba(160,180,255,0.07)" stroke-width="1" />
				</pattern>
			</defs>
			<rect x="0" y="0" width="420" height="380" fill="url(#wn-grid)" />
			<!-- the loop -->
			<path d={pathD(curvePx, true)} fill="rgba(242,208,143,0.05)" stroke={touching ? '#f28db6' : '#f2d08f'} stroke-width="3" filter="url(#glow)" />
			{#each [0.0625, 0.3125, 0.5625, 0.8125] as f (f)}
				<path d={chevron(Math.floor(f * M))} fill="none" stroke={touching ? '#f28db6' : '#f2d08f'} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
			{/each}
			<!-- swept angle -->
			<path d={pathD(spiral)} fill="none" stroke="#5fd6cf" stroke-width="2" stroke-opacity="0.9" />
			{#if !touching}
				<line x1={holePx[0]} y1={holePx[1]} x2={probePx[0]} y2={probePx[1]} stroke="#5fd6cf" stroke-width="1.4" stroke-dasharray="4 4" />
			{/if}
			<!-- probe -->
			<circle cx={probePx[0]} cy={probePx[1]} r="6.5" fill="#e9fffd" stroke="#5fd6cf" stroke-width="2" filter="url(#glow)" />
			<!-- control points -->
			{#each ctrl as p, i (i)}
				{@const q = toPx(p)}
				<g class="h" role="button" tabindex="0" aria-label="Control point {i + 1} of the loop; arrow keys move it" onpointerdown={(e) => start(e, i)} onkeydown={(e) => nudge(e, i)}>
					<circle cx={q[0]} cy={q[1]} r="18" fill="transparent" />
					<circle cx={q[0]} cy={q[1]} r="5.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.2" />
				</g>
			{/each}
			<!-- the puncture -->
			<g class="h" role="button" tabindex="0" aria-label="The puncture; arrow keys move it" onpointerdown={(e) => start(e, 'hole')} onkeydown={(e) => nudge(e, 'hole')}>
				<circle cx={holePx[0]} cy={holePx[1]} r="20" fill="transparent" />
				<circle cx={holePx[0]} cy={holePx[1]} r="11" fill="rgba(242,141,182,0.16)" />
				<circle cx={holePx[0]} cy={holePx[1]} r="6" fill="#04060c" stroke="#f28db6" stroke-width="2" />
			</g>
			<SvgTeX x={holePx[0] + 20} y={holePx[1] + 18} tex="0" size={14} color="var(--rose)" w={20} h={20} />
		</Svg>
	</div>
	<div class="lift">
		<Svg viewBox="0 0 320 380" maxHeight={440} label="Graph of the total angle swept, in turns, against time along the loop">
			<text x="171" y="20" text-anchor="middle" class="t-ui">ANGLE SWEPT (IN TURNS)</text>
			{#each ints as k (k)}
				<line x1={GX0} x2={GX1} y1={gy(k)} y2={gy(k)} stroke={k === 0 ? 'rgba(235,229,213,0.35)' : 'rgba(216,178,110,0.18)'} stroke-dasharray={k === 0 ? undefined : '3 5'} />
				<SvgTeX x={GX0 - 16} y={gy(k)} tex={String(k)} size={13} color="var(--ink-dim)" w={28} h={20} />
			{/each}
			<line x1={GX0} x2={GX0} y1={GY1 - 6} y2={GY0 + 6} stroke="rgba(235,229,213,0.3)" />
			<SvgTeX x={GX0} y={GY0 + 20} tex="0" size={13} color="var(--ink-faint)" w={20} h={18} />
			<SvgTeX x={GX1} y={GY0 + 20} tex="1" size={13} color="var(--ink-faint)" w={20} h={18} />
			<SvgTeX x={(GX0 + GX1) / 2} y={GY0 + 22} tex={String.raw`\text{time } s`} size={13} color="var(--ink-faint)" w={80} h={20} />
			<path d={pathD(graph)} fill="none" stroke="rgba(242,208,143,0.28)" stroke-width="2" />
			<path d={pathD(graphDone)} fill="none" stroke="#f2d08f" stroke-width="2.6" filter="url(#glow)" />
			<circle cx={gx(tau)} cy={gy(swept)} r="5.5" fill="#e9fffd" stroke="#5fd6cf" stroke-width="2" />
			{#if !touching}
				<circle cx={gx(1)} cy={gy(winding)} r="7.5" fill="none" stroke="#f4d79c" stroke-width="1.6" stroke-dasharray="2 2" />
			{/if}
		</Svg>
	</div>
</div>
<div class="readout ui" aria-live="polite">
	<span>angle swept so far: <strong class="nums">{fmt(swept)}</strong> turns</span>
	{#if touching}
		<span class="warn">The loop runs through the puncture: here the winding number is undefined — it jumps as you drag across.</span>
	{:else}
		<span>winding number: <strong class="big nums"><TeX tex={String(winding)} /></strong></span>
	{/if}
</div>
<Controls>
	<Slider bind:value={tau} min={0} max={1} step={0.002} label="run the probe round the loop" format={(v) => v.toFixed(2)} />
	<Button variant="gold" onclick={play}>{playing ? 'Pause' : 'Run round'}</Button>
	<Button onclick={() => load('once')}>Once</Button>
	<Button onclick={() => load('twice')}>Twice</Button>
	<Button onclick={() => load('backwards')}>Backwards</Button>
	<Button onclick={() => load('zero')}>Not around</Button>
</Controls>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.8rem 0;
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.h {
		cursor: grab;
		outline: none;
		touch-action: none;
	}
	.h:focus-visible circle:nth-child(2) {
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.6rem;
		align-items: baseline;
		padding: 0.4rem 1.2rem 0.7rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		min-height: 2.6rem;
	}
	.readout strong {
		color: var(--gold-bright);
	}
	.big {
		font-size: 1.25rem;
	}
	.warn {
		color: var(--rose);
	}
</style>
