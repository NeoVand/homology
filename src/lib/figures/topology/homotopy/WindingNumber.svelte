<script lang="ts">
	// Drag a closed curve around a puncture. A probe runs round the loop while
	// the ray from the puncture sweeps out angle; the right panel plots the
	// total angle (the lift to the real line). Its final value is the winding
	// number, which can only change when the loop is dragged across the puncture.
	// Drag the probe along the loop, or scrub across the graph, to move in time.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Handle from '$lib/components/svg/Handle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { PauseIcon, PlayIcon } from '$lib/icons';
	import { catmullRomClosed, distToPolyline, liftAngle, pathD, type Pt } from './geom';

	const S = 62; // px per unit
	const CX = 210;
	const CY = 190;
	const toPx = (p: Pt): Pt => [CX + S * p[0], CY - S * p[1]];

	type Preset = 'once' | 'twice' | 'backwards' | 'zero';
	const presets: Record<Preset, Pt[]> = {
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
	let preset = $state<Preset | ''>('once');
	let tau = $state(0.62);
	let playing = $state(false);
	let raf = 0;

	const curve = $derived(catmullRomClosed(ctrl, 40));
	const lift = $derived(liftAngle(curve, hole, true));
	const touching = $derived(distToPolyline(hole, curve, true) < 0.07);
	const winding = $derived(Math.round(lift.total) || 0);
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
	// the puncture's name sits opposite the probe, clear of the ray and the spiral
	const zeroLabel = $derived.by((): Pt => {
		const dx = probePx[0] - holePx[0];
		const dy = probePx[1] - holePx[1];
		const L = Math.hypot(dx, dy) || 1;
		return [holePx[0] - (dx / L) * 50, holePx[1] - (dy / L) * 50];
	});

	// ── lift graph ──
	const GX0 = 46;
	const GX1 = 296;
	const GY0 = 334;
	const GY1 = 44;
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

	const clampU = ([x, y]: Pt): Pt => [Math.max(-3.1, Math.min(3.1, x)), Math.max(-2.75, Math.min(2.75, y))];
	const fromPx = ([x, y]: Pt): Pt => clampU([(x - CX) / S, (CY - y) / S]);

	function edit() {
		preset = '';
		stop();
	}
	function load(name: Preset) {
		stop();
		ctrl = presets[name].map((p) => [...p] as Pt);
		hole = [0, 0];
		tau = 0.62;
	}

	// drag the probe along the loop: the nearest point, searched near the
	// current one first so that the probe never jumps across a crossing
	function dragProbe(p: Pt) {
		stop();
		const near = (lo: number, hi: number) => {
			let best = idx;
			let bd = Infinity;
			for (let i = Math.max(0, lo); i <= Math.min(M, hi); i++) {
				const q = curvePx[i % M];
				const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2;
				if (d < bd) {
					bd = d;
					best = i;
				}
			}
			return { best, bd };
		};
		const w = Math.ceil(M / 10);
		let r = near(idx - w, idx + w);
		if (r.bd > 30 * 30) r = near(0, M);
		tau = r.best / M;
	}

	// scrub across the graph
	let scrubbing = false;
	let pad: SVGRectElement | undefined = $state();
	function scrub(e: PointerEvent) {
		const m = pad?.ownerSVGElement?.getScreenCTM();
		if (!m) return;
		const x = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse()).x;
		stop();
		tau = Math.max(0, Math.min(1, (x - GX0) / (GX1 - GX0)));
	}

	function stop() {
		cancelAnimationFrame(raf);
		playing = false;
	}
	const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
	function play() {
		if (playing) return stop();
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			tau = 1;
			return;
		}
		const from = tau >= 0.999 ? 0 : tau;
		playing = true;
		const t0 = performance.now();
		const dur = (2400 + 1400 * Math.abs(winding)) * (1 - from);
		const tick = (now: number) => {
			const x = Math.min(1, (now - t0) / dur);
			tau = from + (1 - from) * ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => stop);

	function chevron(i: number): string {
		const a = curvePx[(i - 3 + M) % M];
		const b = curvePx[(i + 3) % M];
		const [x, y] = curvePx[i];
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const ux = (b[0] - a[0]) / L;
		const uy = (b[1] - a[1]) / L;
		const s = 6.5;
		return `M${x - ux * s - uy * s * 0.65} ${y - uy * s + ux * s * 0.65} L${x + ux * s * 0.5} ${y + uy * s * 0.5} L${x - ux * s + uy * s * 0.65} ${y - uy * s - ux * s * 0.65}`;
	}
	const fmt = (v: number) => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2);
	const loopColor = $derived(touching ? 'var(--rose)' : 'var(--gold-bright)');
</script>

<div class="grid">
	<div class="plane">
		<Svg viewBox="0 0 420 380" maxHeight={440} label="A closed curve in the plane around a puncture; a probe moves along it and the angle it sweeps is recorded">
			<defs>
				<pattern id="wn-grid" width={S / 2} height={S / 2} patternUnits="userSpaceOnUse" x={CX} y={CY}>
					<path d="M {S / 2} 0 L 0 0 0 {S / 2}" fill="none" stroke="rgba(160,180,255,0.07)" stroke-width="1" />
				</pattern>
			</defs>
			<rect x="0" y="0" width="420" height="380" fill="url(#wn-grid)" />
			<!-- the loop -->
			<path d={pathD(curvePx, true)} fill="rgba(242,208,143,0.045)" stroke={loopColor} stroke-width="2.6" filter="url(#glow)" />
			{#each [0.0625, 0.3125, 0.5625, 0.8125] as f (f)}
				<path d={chevron(Math.floor(f * M))} fill="none" stroke={loopColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			{/each}
			<!-- swept angle -->
			<path d={pathD(spiral)} fill="none" stroke="var(--teal)" stroke-width="2" stroke-opacity="0.9" />
			{#if !touching}
				<line x1={holePx[0]} y1={holePx[1]} x2={probePx[0]} y2={probePx[1]} stroke="var(--teal)" stroke-width="1.3" stroke-dasharray="4 4" />
			{/if}
			<!-- the loop's control points -->
			{#each ctrl as p, i (i)}
				{@const q = toPx(p)}
				<Handle
					x={q[0]}
					y={q[1]}
					r={5.5}
					label="Control point {i + 1} of the loop: drag it, or use the arrow keys"
					ondrag={(pt) => {
						edit();
						ctrl[i] = fromPx(pt);
					}}
					onkey={(dx, dy) => {
						edit();
						ctrl[i] = clampU([ctrl[i][0] + dx * 0.08, ctrl[i][1] - dy * 0.08]);
					}}
				/>
			{/each}
			<!-- the puncture -->
			<circle cx={holePx[0]} cy={holePx[1]} r="12" fill="rgba(242,141,182,0.14)" />
			<circle cx={holePx[0]} cy={holePx[1]} r="6" fill="#04060c" stroke="var(--rose)" stroke-width="2" />
			<Handle
				x={holePx[0]}
				y={holePx[1]}
				r={9}
				color="var(--rose)"
				label="The puncture: drag it, or use the arrow keys"
				ondrag={(pt) => {
					edit();
					hole = fromPx(pt);
				}}
				onkey={(dx, dy) => {
					edit();
					hole = clampU([hole[0] + dx * 0.08, hole[1] - dy * 0.08]);
				}}
			/>
			<SvgTeX x={zeroLabel[0]} y={zeroLabel[1]} tex="0" size={14} color="var(--rose)" w={20} h={20} />
			<!-- the probe -->
			<Handle
				x={probePx[0]}
				y={probePx[1]}
				r={7}
				color="var(--teal)"
				label="The probe: drag it along the loop, or use the arrow keys"
				valuetext={`time ${tau.toFixed(2)}, ${fmt(swept)} turns`}
				ondrag={dragProbe}
				onkey={(dx, dy) => {
					stop();
					tau = Math.max(0, Math.min(1, tau + (dx - dy) * 0.01));
				}}
			/>
		</Svg>
	</div>
	<div class="lift">
		<Svg viewBox="0 0 320 370" maxHeight={430} label="Graph of the total angle swept, in turns, against time along the loop">
			<text x="171" y="22" text-anchor="middle" class="t-ui">ANGLE SWEPT, IN TURNS</text>
			{#each ints as k (k)}
				<line x1={GX0} x2={GX1} y1={gy(k)} y2={gy(k)} stroke={k === 0 ? 'rgba(235,229,213,0.35)' : 'rgba(216,178,110,0.18)'} stroke-dasharray={k === 0 ? undefined : '3 5'} />
				<SvgTeX x={GX0 - 16} y={gy(k)} tex={String(k)} size={13} color="var(--ink-dim)" w={28} h={20} />
			{/each}
			<line x1={GX0} x2={GX0} y1={GY1 - 6} y2={GY0 + 6} stroke="rgba(235,229,213,0.3)" />
			<SvgTeX x={GX0} y={GY0 + 20} tex="0" size={13} color="var(--ink-faint)" w={20} h={18} />
			<SvgTeX x={GX1} y={GY0 + 20} tex="1" size={13} color="var(--ink-faint)" w={20} h={18} />
			<SvgTeX x={(GX0 + GX1) / 2} y={GY0 + 22} tex={String.raw`\text{time } s`} size={13} color="var(--ink-faint)" w={80} h={20} />
			<path d={pathD(graph)} fill="none" stroke="rgba(242,208,143,0.28)" stroke-width="2" />
			<path d={pathD(graphDone)} fill="none" stroke="var(--gold-bright)" stroke-width="2.6" filter="url(#glow)" />
			<line x1={gx(tau)} x2={gx(tau)} y1={GY1} y2={GY0} stroke="var(--teal)" stroke-opacity="0.35" stroke-dasharray="2 4" />
			{#if !touching}
				<circle cx={gx(1)} cy={gy(winding)} r="7.5" fill="none" stroke="var(--gold-bright)" stroke-width="1.5" stroke-dasharray="2 2" />
			{/if}
			<circle cx={gx(tau)} cy={gy(swept)} r="5.5" fill="#e9fffd" stroke="var(--teal)" stroke-width="2" />
			<rect
				bind:this={pad}
				class="pad"
				x={GX0 - 8}
				y={GY1 - 8}
				width={GX1 - GX0 + 16}
				height={GY0 - GY1 + 16}
				role="presentation"
				onpointerdown={(e) => {
					scrubbing = true;
					pad?.setPointerCapture(e.pointerId);
					scrub(e);
				}}
				onpointermove={(e) => scrubbing && scrub(e)}
				onpointerup={() => (scrubbing = false)}
				onpointercancel={() => (scrubbing = false)}
			/>
		</Svg>
	</div>
</div>
<div class="readout ui" aria-live="polite">
	<span>angle swept so far <strong class="nums">{fmt(swept)}</strong> turns</span>
	{#if touching}
		<span class="warn">The loop runs through the puncture: here the winding number is undefined. It jumps as you drag across.</span>
	{:else}
		<span>winding number <strong class="big nums"><TeX tex={String(winding)} /></strong></span>
	{/if}
</div>
<Controls>
	<Button variant="gold" icon={playing ? PauseIcon : PlayIcon} onclick={play}>{playing ? 'Pause' : 'Run round'}</Button>
	<Segmented
		bind:value={preset}
		label="A loop to start from"
		options={[
			{ value: 'once', label: 'Once around' },
			{ value: 'twice', label: 'Twice' },
			{ value: 'backwards', label: 'Backwards' },
			{ value: 'zero', label: 'Not around' }
		]}
		onchange={(v) => v && load(v)}
	/>
</Controls>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1.3fr 1fr;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.8rem 0;
	}
	@container figure (max-width: 38rem) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.pad {
		fill: transparent;
		cursor: ew-resize;
		touch-action: none;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.6rem;
		align-items: baseline;
		min-height: 2.6rem;
		padding: 0.3rem 1.25rem 0.7rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.readout strong {
		margin-left: 0.3rem;
		color: var(--gold-bright);
	}
	.big {
		font-size: 1.25rem;
	}
	.warn {
		color: var(--rose);
	}
</style>
