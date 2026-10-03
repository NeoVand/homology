<script lang="ts">
	// Two paths from x0 to x1 in the punctured plane, and the straight-line
	// "movie" between them. Drag the handle on γ1: the movie is legal exactly
	// when it never sweeps across the puncture; paths on opposite sides of the
	// puncture are not homotopic at all.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import {
		arcThrough,
		cubic,
		distToPolyline,
		lerpPath,
		pathD,
		straightLineHit,
		windingNumber,
		type Pt
	} from './geom';

	const W = 680;
	const H = 380;
	const X0: Pt = [92, 258];
	const X1: Pt = [588, 258];
	const HOLE: Pt = [340, 208];
	const N = 160;

	const g0 = cubic(X0, [196, 66], [484, 66], X1, N);

	let handle = $state<Pt>([340, 338]);
	let t = $state(0.5);
	let svg = $state<SVGSVGElement>();
	let dragging = false;
	let playing = $state(false);
	let raf = 0;

	const g1 = $derived(arcThrough(X0, handle, X1, N));
	const frame = $derived(lerpPath(g0, g1, t));
	const strip = $derived([0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((s) => pathD(lerpPath(g0, g1, s))));
	const hit = $derived(straightLineHit(g0, g1, HOLE));
	const wind = $derived(windingNumber([...g0, ...g1.slice().reverse()], HOLE));
	const through = $derived(distToPolyline(HOLE, g1) < 7);
	const frameHits = $derived(distToPolyline(HOLE, frame) < 7);
	const region = $derived(pathD([...g0, ...g1.slice().reverse()], true));

	function toSvg(e: PointerEvent): Pt {
		if (!svg) return [0, 0];
		const p = svg.createSVGPoint();
		p.x = e.clientX;
		p.y = e.clientY;
		const q = p.matrixTransform(svg.getScreenCTM()!.inverse());
		return [Math.max(30, Math.min(W - 30, q.x)), Math.max(24, Math.min(H - 20, q.y))];
	}
	function down(e: PointerEvent) {
		dragging = true;
		svg?.setPointerCapture(e.pointerId);
		handle = toSvg(e);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (dragging) handle = toSvg(e);
	}
	function up() {
		dragging = false;
	}
	function onKey(e: KeyboardEvent) {
		const step = e.shiftKey ? 20 : 6;
		const [x, y] = handle;
		if (e.key === 'ArrowUp') handle = [x, Math.max(24, y - step)];
		else if (e.key === 'ArrowDown') handle = [x, Math.min(H - 20, y + step)];
		else if (e.key === 'ArrowLeft') handle = [Math.max(30, x - step), y];
		else if (e.key === 'ArrowRight') handle = [Math.min(W - 30, x + step), y];
		else return;
		e.preventDefault();
	}

	const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
	function play() {
		if (playing) {
			cancelAnimationFrame(raf);
			playing = false;
			return;
		}
		const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduce) {
			t = 1;
			return;
		}
		playing = true;
		const start = performance.now();
		const dur = 2600;
		const tick = (now: number) => {
			const x = Math.min(1, (now - start) / dur);
			t = ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	// little arrowheads that show the direction of travel
	function arrowAt(pts: Pt[], i: number, size = 7): string {
		const a = pts[Math.max(0, i - 2)];
		const b = pts[Math.min(pts.length - 1, i + 2)];
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const L = Math.hypot(dx, dy) || 1;
		const ux = dx / L;
		const uy = dy / L;
		const [x, y] = pts[i];
		return `M${x - ux * size - uy * size * 0.6} ${y - uy * size + ux * size * 0.6} L${x + ux * size * 0.6} ${y + uy * size * 0.6} L${x - ux * size + uy * size * 0.6} ${y - uy * size - ux * size * 0.6}`;
	}
</script>

<div class="wrap">
	<Svg
		viewBox="0 0 {W} {H}"
		maxHeight={430}
		label="Two paths from x0 to x1 in a plane with a puncture, and the straight-line homotopy between them"
		bind:svg
		onpointermove={move}
		onpointerup={up}
		onpointerleave={up}
	>
		<defs>
			<radialGradient id="ph-hole" cx="50%" cy="50%" r="50%">
				<stop offset="0" stop-color="#05070d" />
				<stop offset="0.62" stop-color="#05070d" />
				<stop offset="0.8" stop-color="#f28db6" stop-opacity="0.85" />
				<stop offset="1" stop-color="#f28db6" stop-opacity="0" />
			</radialGradient>
			<pattern id="ph-dots" width="24" height="24" patternUnits="userSpaceOnUse">
				<circle cx="12" cy="12" r="0.9" fill="rgba(200,210,255,0.13)" />
			</pattern>
		</defs>
		<rect x="0" y="0" width={W} height={H} fill="url(#ph-dots)" />

		<!-- the region swept out between the two paths -->
		<path
			d={region}
			fill={wind !== 0 ? 'rgba(242,141,182,0.10)' : 'rgba(164,147,255,0.10)'}
			stroke="none"
		/>

		<!-- film strip: intermediate frames of the movie -->
		{#each strip as d, i (i)}
			<path {d} fill="none" stroke="rgba(164,147,255,0.30)" stroke-width="1.2" stroke-dasharray="3 5" />
		{/each}

		<!-- the frame at which the straight-line movie would cross the hole -->
		{#if hit && !through}
			<path d={pathD(lerpPath(g0, g1, hit.t))} fill="none" stroke="#f28db6" stroke-width="1.6" stroke-opacity="0.75" stroke-dasharray="7 5" />
		{/if}

		<!-- the two paths -->
		<path d={pathD(g0)} fill="none" stroke="#f2d08f" stroke-width="3" filter="url(#glow)" stroke-linecap="round" />
		<path d={arrowAt(g0, N / 2)} fill="none" stroke="#f2d08f" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
		<path
			d={pathD(g1)}
			fill="none"
			stroke={through ? '#f28db6' : '#5fd6cf'}
			stroke-width="3"
			filter="url(#glow)"
			stroke-linecap="round"
		/>
		<path
			d={arrowAt(g1, Math.round(N * 0.3))}
			fill="none"
			stroke={through ? '#f28db6' : '#5fd6cf'}
			stroke-width="2.4"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>

		<!-- the current frame of the movie -->
		<path
			d={pathD(frame)}
			fill="none"
			stroke={frameHits ? '#f28db6' : '#fbf6e8'}
			stroke-width={frameHits ? 3.4 : 2.2}
			stroke-opacity="0.95"
			filter={frameHits ? 'url(#glow-strong)' : undefined}
		/>

		<!-- the puncture -->
		<circle cx={HOLE[0]} cy={HOLE[1]} r={frameHits || through ? 22 : 16} fill="url(#ph-hole)" class="hole" />
		<circle cx={HOLE[0]} cy={HOLE[1]} r="6.5" fill="#04060c" stroke="#f28db6" stroke-width="1.6" />
		<SvgTeX x={HOLE[0] + 44} y={HOLE[1] + 2} tex={String.raw`\hole{\text{hole}}`} size={13} color="var(--rose)" w={70} h={22} />

		<!-- endpoints -->
		<circle cx={X0[0]} cy={X0[1]} r="7" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" />
		<circle cx={X1[0]} cy={X1[1]} r="7" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" />
		<SvgTeX x={X0[0] - 4} y={X0[1] + 26} tex="x_0" size={17} w={40} h={26} />
		<SvgTeX x={X1[0] + 4} y={X1[1] + 26} tex="x_1" size={17} w={40} h={26} />
		<SvgTeX x={340} y={58} tex={String.raw`\cyc{\gamma_0}`} size={18} w={50} h={28} />
		<SvgTeX x={handle[0]} y={handle[1] + (handle[1] > HOLE[1] ? 30 : -30)} tex={String.raw`\bdy{\gamma_1}`} size={18} w={50} h={28} />

		<!-- the draggable handle on γ1 -->
		<g
			class="handle"
			role="slider"
			tabindex="0"
			aria-label="Middle of the path gamma 1; use arrow keys to move"
			aria-valuenow={Math.round(handle[1])}
			onpointerdown={down}
			onkeydown={onKey}
		>
			<circle cx={handle[0]} cy={handle[1]} r="24" fill="transparent" />
			<circle cx={handle[0]} cy={handle[1]} r="10" fill="rgba(95,214,207,0.18)" stroke="#5fd6cf" stroke-width="2" />
			<circle cx={handle[0]} cy={handle[1]} r="3.5" fill="#e9fffd" />
		</g>
	</Svg>
	<div class="readout ui" aria-live="polite">
		{#if through}
			<p class="bad">
				<TeX tex={String.raw`\gamma_1`} /> runs straight through the hole, so it is not a path in the punctured plane at all. Drag it off.
			</p>
		{:else if wind !== 0}
			<p class="bad">
				<strong>Not homotopic.</strong> The two paths pass on opposite sides of the hole: together they encircle it, and no movie can carry one to the other without crossing it.
			</p>
		{:else}
			<p class="good">
				<strong>Homotopic.</strong> Both paths pass on the same side of the hole, so one can be slid onto the other.
			</p>
		{/if}
		{#if !through}
			<p class="movie">
				{#if hit}
					The straight-line movie hits the hole at time <TeX tex={'t \\approx ' + hit.t.toFixed(2)} /> — that frame is not a path in <TeX
						tex={String.raw`X`}
					/>.
				{:else}
					The straight-line movie <TeX tex={String.raw`H(s,t) = (1-t)\,\gamma_0(s) + t\,\gamma_1(s)`} /> never touches the hole: it is a homotopy.
				{/if}
			</p>
		{/if}
	</div>
	<Controls>
		<Slider bind:value={t} min={0} max={1} step={0.005} label="time t" format={(v) => v.toFixed(2)} />
		<Button variant="gold" onclick={play}>{playing ? 'Pause' : 'Play the movie'}</Button>
		<Button onclick={() => (handle = [340, 136])}>Over the hole</Button>
		<Button onclick={() => (handle = [340, 338])}>Under the hole</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.4rem;
	}
	.handle {
		cursor: grab;
		outline: none;
		touch-action: none;
	}
	.handle:active {
		cursor: grabbing;
	}
	.handle:focus-visible circle:nth-child(2) {
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.hole {
		transition: r 0.25s var(--ease);
	}
	.readout {
		padding: 0.2rem 1.2rem 0.4rem;
		font-size: 0.86rem;
		line-height: 1.5;
		min-height: 4.6rem;
	}
	.readout p {
		margin: 0.3rem 0;
	}
	.good strong {
		color: var(--green);
	}
	.bad strong {
		color: var(--rose);
	}
	.movie {
		color: var(--ink-dim);
	}
</style>
