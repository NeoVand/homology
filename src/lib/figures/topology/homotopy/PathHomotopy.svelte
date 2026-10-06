<script lang="ts">
	// Two paths from x0 to x1 in the punctured plane, and the straight-line movie
	// H(s, t) = (1 − t)·γ0(s) + t·γ1(s) between them: every point slides along a
	// straight track (drawn faintly). Drag the teal bead to reshape γ1, and the
	// white bead along its track to run the movie. The movie is a homotopy exactly
	// when no frame passes through the puncture; paths on opposite sides of the
	// puncture are not homotopic at all.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Handle from '$lib/components/svg/Handle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { PauseIcon, PlayIcon, VisitedIcon, CloseIcon } from '$lib/icons';
	import { arcThrough, cubic, distToPolyline, lerpPath, pathD, straightLineHit, windingNumber, type Pt } from './geom';

	const W = 680;
	const H = 330;
	const X0: Pt = [96, 172];
	const X1: Pt = [584, 172];
	// off the midline, so the time bead never sits on top of the puncture
	const HOLE: Pt = [292, 160];
	const HOLE_R = 11;
	const N = 160;
	const ABOVE: Pt = [340, 100];
	const BELOW: Pt = [340, 272];

	const g0 = cubic(X0, [200, 4], [480, 4], X1, N);
	const MID = N / 2;

	let handle = $state<Pt>(BELOW);
	let t = $state(0.25);
	let playing = $state(false);
	let raf = 0;

	const g1 = $derived(arcThrough(X0, handle, X1, N));
	const frame = $derived(lerpPath(g0, g1, t));
	const hit = $derived(straightLineHit(g0, g1, HOLE));
	const wind = $derived(windingNumber([...g0, ...g1.slice().reverse()], HOLE));
	const through = $derived(distToPolyline(HOLE, g1) < HOLE_R + 2);
	const frameHits = $derived(distToPolyline(HOLE, frame) < HOLE_R + 1);
	const region = $derived(pathD([...g0, ...g1.slice().reverse()], true));
	const side = $derived(wind === 0 ? 'same' : 'opposite');

	// each point of γ0 slides along a straight track to the matching point of γ1
	const tracks = $derived([1, 2, 3, 4, 5, 6, 7].map((k) => [g0[(k * N) / 8], g1[(k * N) / 8]] as [Pt, Pt]));
	const frames = $derived([0.25, 0.5, 0.75].map((s) => pathD(lerpPath(g0, g1, s))));
	const bead = $derived(frame[MID]);

	const clampPt = ([x, y]: Pt): Pt => [Math.max(40, Math.min(W - 40, x)), Math.max(74, Math.min(H - 30, y))];

	function dragT([x, y]: Pt) {
		stop();
		const a = g0[MID];
		const b = g1[MID];
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const L2 = dx * dx + dy * dy;
		if (L2 < 1) return;
		t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L2));
	}

	const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
	function stop() {
		cancelAnimationFrame(raf);
		playing = false;
	}
	function play() {
		if (playing) return stop();
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			t = t < 1 ? 1 : 0;
			return;
		}
		const from = t >= 0.999 ? 0 : t;
		const start = performance.now();
		const dur = 2600 * (1 - from);
		playing = true;
		const tick = (now: number) => {
			const x = Math.min(1, (now - start) / dur);
			t = from + (1 - from) * ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => stop);

	function choose(v: string) {
		stop();
		handle = v === 'same' ? ABOVE : BELOW;
	}

	// a small arrowhead showing the direction of travel at sample i
	function arrowAt(pts: Pt[], i: number, size = 6.5): string {
		const a = pts[Math.max(0, i - 2)];
		const b = pts[Math.min(pts.length - 1, i + 2)];
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const ux = (b[0] - a[0]) / L;
		const uy = (b[1] - a[1]) / L;
		const [x, y] = pts[i];
		return `M${x - ux * size - uy * size * 0.6} ${y - uy * size + ux * size * 0.6} L${x + ux * size * 0.6} ${y + uy * size * 0.6} L${x - ux * size + uy * size * 0.6} ${y - uy * size - ux * size * 0.6}`;
	}

	const g1Color = $derived(through ? 'var(--rose)' : 'var(--teal)');
	const g1Label = $derived<Pt>([handle[0] + 26, handle[1] + (handle[1] > HOLE[1] ? 6 : -6)]);
</script>

<div class="wrap">
	<Svg viewBox="0 0 {W} {H}" maxHeight={420} label="Two paths from x0 to x1 in a plane with a puncture, and the straight-line homotopy between them">
		<defs>
			<pattern id="ph-dots" width="20" height="20" patternUnits="userSpaceOnUse">
				<circle cx="10" cy="10" r="0.9" fill="rgba(200,210,255,0.14)" />
			</pattern>
			<radialGradient id="ph-hole" cx="50%" cy="42%" r="60%">
				<stop offset="0" stop-color="#020308" />
				<stop offset="0.75" stop-color="#05070e" />
				<stop offset="1" stop-color="#140d18" />
			</radialGradient>
		</defs>

		<!-- the space X: the plane, with a puncture -->
		<rect x="0" y="0" width={W} height={H} fill="url(#ph-dots)" />

		<!-- the region swept by the movie -->
		<path d={region} fill={wind !== 0 ? 'rgba(242,141,182,0.08)' : 'rgba(164,147,255,0.08)'} />

		<!-- straight tracks and three frames of the movie -->
		{#each tracks as [a, b], i (i)}
			<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="rgba(235,229,213,0.13)" stroke-width="1" />
		{/each}
		{#each frames as d, i (i)}
			<path {d} fill="none" stroke="rgba(164,147,255,0.34)" stroke-width="1.1" stroke-dasharray="3 5" />
		{/each}
		<!-- the midpoint's track: the white bead runs along it -->
		<line x1={g0[MID][0]} y1={g0[MID][1]} x2={g1[MID][0]} y2={g1[MID][1]} stroke="rgba(251,246,232,0.35)" stroke-width="1.2" stroke-dasharray="1 4" stroke-linecap="round" />

		<!-- the first frame that would pass through the puncture -->
		{#if hit && !through}
			<path d={pathD(lerpPath(g0, g1, hit.t))} fill="none" stroke="var(--rose)" stroke-width="1.5" stroke-opacity="0.8" stroke-dasharray="6 5" />
		{/if}

		<!-- the two paths -->
		<path d={pathD(g0)} fill="none" stroke="var(--gold-bright)" stroke-width="2.8" stroke-linecap="round" filter="url(#glow)" />
		<path d={arrowAt(g0, Math.round(N * 0.3))} fill="none" stroke="var(--gold-bright)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
		<path d={pathD(g1)} fill="none" stroke={g1Color} stroke-width="2.8" stroke-linecap="round" filter="url(#glow)" />
		<path d={arrowAt(g1, Math.round(N * 0.3))} fill="none" stroke={g1Color} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />

		<!-- the current frame H_t -->
		<path d={pathD(frame)} fill="none" stroke={frameHits ? 'var(--rose)' : '#fbf6e8'} stroke-width="2.4" stroke-linecap="round" filter={frameHits ? 'url(#glow)' : undefined} />

		<!-- the puncture -->
		<circle cx={HOLE[0]} cy={HOLE[1]} r={HOLE_R + 7} fill="none" stroke="var(--rose)" stroke-opacity={frameHits || through ? 0.5 : 0.16} stroke-width="5" />
		<circle cx={HOLE[0]} cy={HOLE[1]} r={HOLE_R} fill="url(#ph-hole)" stroke="var(--rose)" stroke-width="1.5" />
		<SvgTeX x={HOLE[0] - HOLE_R - 10} y={HOLE[1] - 14} tex={String.raw`\text{puncture}`} size={12.5} color="var(--rose)" w={80} h={20} anchor="end" />

		<!-- endpoints and names -->
		<circle cx={X0[0]} cy={X0[1]} r="6.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" />
		<circle cx={X1[0]} cy={X1[1]} r="6.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" />
		<SvgTeX x={X0[0] - 2} y={X0[1] + 24} tex="x_0" size={17} w={40} h={26} />
		<SvgTeX x={X1[0] + 2} y={X1[1] + 24} tex="x_1" size={17} w={40} h={26} />
		<SvgTeX x={g0[MID][0]} y={g0[MID][1] - 20} tex={String.raw`\gamma_0`} size={18} color="var(--gold-bright)" w={44} h={26} />
		<SvgTeX x={g1Label[0]} y={g1Label[1]} tex={String.raw`\gamma_1`} size={18} color={g1Color} w={44} h={26} anchor="start" />
		<SvgTeX x={bead[0] + 16} y={bead[1] - 12} tex={`t = ${t.toFixed(2)}`} size={13} color="#fbf6e8" w={80} h={20} anchor="start" />

		<Handle
			x={bead[0]}
			y={bead[1]}
			r={7.5}
			color="#fbf6e8"
			label="Movie time t: drag along the track, or use the arrow keys"
			valuetext={`t = ${t.toFixed(2)}`}
			ondrag={dragT}
			onkey={(dx, dy) => {
				stop();
				t = Math.max(0, Math.min(1, t + (dx + dy) * 0.02));
			}}
		/>
		<Handle
			x={handle[0]}
			y={handle[1]}
			color={g1Color}
			label="The middle of the path gamma 1: drag it, or use the arrow keys"
			valuetext={side === 'same' ? 'on the same side of the puncture as gamma 0' : 'on the other side of the puncture'}
			ondrag={(p) => (handle = clampPt(p))}
			onkey={(dx, dy) => (handle = clampPt([handle[0] + dx * 6, handle[1] + dy * 6]))}
		/>
	</Svg>

	<div class="readout ui" aria-live="polite">
		{#if through}
			<p>
				<span class="chip bad"><Icon icon={CloseIcon} size={13} stroke={2} />Not a path in <TeX tex="X" /></span>
				<TeX tex={String.raw`\gamma_1`} /> runs through the puncture, which is not part of the space. Drag it off.
			</p>
		{:else if wind !== 0}
			<p>
				<span class="chip bad"><Icon icon={CloseIcon} size={13} stroke={2} />Not homotopic</span>
				The paths pass on opposite sides of the puncture, so every movie from one to the other has to sweep across it.{#if hit}{' '}The
					straight-line movie hits it at <TeX tex={'t \\approx ' + hit.t.toFixed(2)} />.{/if}
			</p>
		{:else}
			<p>
				<span class="chip good"><Icon icon={VisitedIcon} size={13} stroke={2} />Homotopic</span>
				{#if hit}
					Both paths pass on the same side of the puncture. This straight-line movie happens to hit it at <TeX
						tex={'t \\approx ' + hit.t.toFixed(2)}
					/>, but a movie that bends around it does not.
				{:else}
					Both paths pass on the same side of the puncture, and the straight-line movie slides <TeX tex={String.raw`\gamma_0`} /> onto <TeX
						tex={String.raw`\gamma_1`}
					/> without ever touching it.
				{/if}
			</p>
		{/if}
	</div>

	<Controls>
		<Button variant="gold" icon={playing ? PauseIcon : PlayIcon} onclick={play}>{playing ? 'Pause' : 'Play the movie'}</Button>
		<Segmented
			value={side}
			label="Where γ1 passes"
			options={[
				{ value: 'same', label: 'Same side' },
				{ value: 'opposite', label: 'Opposite sides' }
			]}
			onchange={choose}
		/>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.25rem;
	}
	.readout {
		min-height: 3.6rem;
		padding: 0.15rem 1.25rem 0.75rem;
		font-size: 0.86rem;
		line-height: 1.55;
		color: var(--ink-dim);
	}
	.readout p {
		margin: 0;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		margin-right: 0.5rem;
		padding: 0.05rem 0.55rem 0.05rem 0.4rem;
		border-radius: 999px;
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		vertical-align: 0.08em;
	}
	.chip.good {
		color: var(--green);
		background: rgba(132, 217, 162, 0.1);
		box-shadow: inset 0 0 0 1px rgba(132, 217, 162, 0.35);
	}
	.chip.bad {
		color: var(--rose);
		background: rgba(242, 141, 182, 0.1);
		box-shadow: inset 0 0 0 1px rgba(242, 141, 182, 0.35);
	}
</style>
