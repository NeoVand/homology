<script lang="ts">
	// A homotopy H : I × I → X drawn as a square (trip time s across, stage t up)
	// next to the space X itself, a flower of three loops at x0. The point
	// (s, t) in the square is where the traveller is at moment s of the stage-t
	// trip: the bead on the flower. Associativity: (α·β)·γ and α·(β·γ) differ
	// only in their timetables, and sliding the breakpoints is a homotopy.
	// Inverses: α·ᾱ shrinks by turning back earlier and earlier.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Handle from '$lib/components/svg/Handle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { PauseIcon, PlayIcon } from '$lib/icons';
	import { pathD, type Pt } from './geom';

	let mode = $state<'assoc' | 'inverse'>('assoc');
	let s = $state(0.3);
	let t = $state(0.4);
	let playing = $state(false);
	let raf = 0;

	// the square: s across, t up
	const X0 = 62;
	const Y0 = 40;
	const SZ = 232;
	const sx = (v: number) => X0 + v * SZ;
	const ty = (v: number) => Y0 + (1 - v) * SZ;

	// the flower: three teardrop loops at x0
	const C: Pt = [506, 196];
	const petal = (dir: number, f: number, L = 92, w = 0.5): Pt => {
		const th = Math.PI * f;
		const r = L * Math.sin(th);
		const a = dir + w * Math.cos(th);
		return [C[0] + r * Math.cos(a), C[1] + r * Math.sin(a)];
	};
	const loops = [
		{ name: String.raw`\alpha`, color: 'var(--gold-bright)', dir: (-150 * Math.PI) / 180 },
		{ name: String.raw`\beta`, color: 'var(--teal)', dir: (-30 * Math.PI) / 180 },
		{ name: String.raw`\gamma`, color: 'var(--violet)', dir: Math.PI / 2 }
	];
	const loopPts = loops.map((l) => Array.from({ length: 97 }, (_, i) => petal(l.dir, i / 96)));
	const tip = (k: number, d = 1.18) => petal(loops[k].dir, 0.5, 92 * d);

	// associativity: the stage-t timetable
	const b1 = $derived(0.25 + 0.25 * t);
	const b2 = $derived(0.5 + 0.25 * t);
	const segs = $derived([
		[0, b1],
		[b1, b2],
		[b2, 1]
	]);

	/** which loop, and how far along it, at moment v of the current stage */
	const where = $derived.by((): { k: number; f: number } => {
		if (mode === 'inverse') {
			const reach = 1 - t;
			return { k: 0, f: s <= 0.5 ? 2 * s * reach : 2 * (1 - s) * reach };
		}
		const k = s < b1 ? 0 : s < b2 ? 1 : 2;
		const [a, b] = segs[k];
		return { k, f: Math.min(1, Math.max(0, (s - a) / (b - a))) };
	});
	const bead = $derived(petal(loops[where.k].dir, where.f));
	// the trail already travelled on the current loop
	const trail = $derived.by(() => {
		const { k, f } = where;
		if (mode === 'inverse') {
			const reach = 1 - t;
			const far = s <= 0.5 ? f : reach;
			return Array.from({ length: 49 }, (_, i) => petal(loops[0].dir, (i / 48) * far));
		}
		return Array.from({ length: 49 }, (_, i) => petal(loops[k].dir, (i / 48) * f));
	});
	const reachPts = $derived(Array.from({ length: 49 }, (_, i) => petal(loops[0].dir, (i / 48) * (1 - t))));


	function setFrom([x, y]: Pt) {
		stop();
		s = Math.max(0, Math.min(1, (x - X0) / SZ));
		t = Math.max(0, Math.min(1, 1 - (y - Y0) / SZ));
	}

	let dragging = false;
	let squareEl: SVGRectElement | undefined = $state();
	function toUser(e: PointerEvent): Pt | null {
		const m = squareEl?.ownerSVGElement?.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [p.x, p.y];
	}

	function stop() {
		cancelAnimationFrame(raf);
		playing = false;
	}
	function play() {
		if (playing) return stop();
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			s = s < 1 ? 1 : 0;
			return;
		}
		const from = s >= 0.999 ? 0 : s;
		const start = performance.now();
		const dur = 3600 * (1 - from);
		playing = true;
		const tick = (now: number) => {
			const x = Math.min(1, (now - start) / dur);
			s = from + (1 - from) * x;
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => stop);

	const speed = (a: number, b: number) => (1 / (b - a)).toFixed(1);
	// on narrow plates the flower of loops moves below the square, so both can be drawn larger
	let cw = $state(800);
	const narrow = $derived(cw < 520);
</script>

<div class="wrap" bind:clientWidth={cw}>
	<Svg viewBox={narrow ? '0 0 310 650' : '0 0 680 330'} maxHeight={narrow ? 720 : 430} label="A homotopy drawn as a square next to a flower of three loops; a point of the square is the traveller's position on the flower">
		<!-- ── the square ─────────────────────────────────────────── -->
		{#if mode === 'assoc'}
			<path d="M{sx(0)} {ty(0)} L{sx(0.25)} {ty(0)} L{sx(0.5)} {ty(1)} L{sx(0)} {ty(1)} Z" fill="rgba(242,208,143,0.16)" />
			<path d="M{sx(0.25)} {ty(0)} L{sx(0.5)} {ty(0)} L{sx(0.75)} {ty(1)} L{sx(0.5)} {ty(1)} Z" fill="rgba(95,214,207,0.16)" />
			<path d="M{sx(0.5)} {ty(0)} L{sx(1)} {ty(0)} L{sx(1)} {ty(1)} L{sx(0.75)} {ty(1)} Z" fill="rgba(164,147,255,0.17)" />
			<line x1={sx(0.25)} y1={ty(0)} x2={sx(0.5)} y2={ty(1)} stroke="rgba(235,229,213,0.35)" stroke-width="1" />
			<line x1={sx(0.5)} y1={ty(0)} x2={sx(0.75)} y2={ty(1)} stroke="rgba(235,229,213,0.35)" stroke-width="1" />
			<SvgTeX x={sx(0.12)} y={ty(0.5)} tex={String.raw`\alpha`} size={19} color="var(--gold-bright)" w={30} h={28} />
			<SvgTeX x={sx(0.5)} y={ty(0.5)} tex={String.raw`\beta`} size={19} color="var(--teal)" w={30} h={28} />
			<SvgTeX x={sx(0.86)} y={ty(0.5)} tex={String.raw`\gamma`} size={19} color="var(--violet)" w={30} h={28} />
			<SvgTeX x={sx(0.5)} y={ty(0) + 20} tex={String.raw`(\alpha\cdot\beta)\cdot\gamma`} size={14} w={130} h={24} />
			<SvgTeX x={sx(0.5)} y={ty(1) - 18} tex={String.raw`\alpha\cdot(\beta\cdot\gamma)`} size={14} w={130} h={24} />
		{:else}
			<!-- shading = how far along α the traveller is at (s, t): (1 − t)·(1 − |2s − 1|),
			     a horizontal tent masked by a vertical ramp -->
			<defs>
				<linearGradient id="tt-tent" x1="0" x2="1" y1="0" y2="0">
					<stop offset="0" stop-color="#f2d08f" stop-opacity="0" />
					<stop offset="0.5" stop-color="#f2d08f" stop-opacity="0.42" />
					<stop offset="1" stop-color="#f2d08f" stop-opacity="0" />
				</linearGradient>
				<linearGradient id="tt-ramp" x1="0" x2="0" y1="1" y2="0">
					<stop offset="0" stop-color="#fff" />
					<stop offset="1" stop-color="#000" />
				</linearGradient>
				<mask id="tt-mask" maskUnits="userSpaceOnUse" x={X0} y={Y0} width={SZ} height={SZ}>
					<rect x={X0} y={Y0} width={SZ} height={SZ} fill="url(#tt-ramp)" />
				</mask>
			</defs>
			<rect x={X0} y={Y0} width={SZ} height={SZ} fill="url(#tt-tent)" mask="url(#tt-mask)" />
			<path d="M{sx(0)} {ty(0)} L{sx(0.5)} {ty(1)} L{sx(1)} {ty(0)}" fill="none" stroke="rgba(235,229,213,0.3)" stroke-dasharray="4 4" />
			<SvgTeX x={sx(0.5)} y={ty(0) + 20} tex={String.raw`\alpha\cdot\bar\alpha`} size={15} w={80} h={24} />
			<SvgTeX x={sx(0.5)} y={ty(1) - 18} tex={String.raw`\text{the constant loop}`} size={13} w={150} h={22} />
		{/if}
		<rect x={X0} y={Y0} width={SZ} height={SZ} fill="none" stroke="rgba(216,178,110,0.4)" />
		<SvgTeX x={X0 - 30} y={ty(0)} tex="t=0" size={narrow ? 14 : 12} w={56} h={20} color="var(--ink-faint)" />
		<SvgTeX x={X0 - 30} y={ty(1)} tex="t=1" size={narrow ? 14 : 12} w={56} h={20} color="var(--ink-faint)" />
		<SvgTeX x={sx(0)} y={ty(0) + 40} tex="s=0" size={narrow ? 14 : 12} w={46} h={20} color="var(--ink-faint)" />
		<SvgTeX x={sx(1)} y={ty(0) + 40} tex="s=1" size={narrow ? 14 : 12} w={46} h={20} color="var(--ink-faint)" />

		<!-- the stage-t path, and the moment s -->
		<line x1={sx(0)} x2={sx(1)} y1={ty(t)} y2={ty(t)} stroke="#fbf6e8" stroke-width="1.6" stroke-opacity="0.8" />
		<line x1={sx(s)} x2={sx(s)} y1={ty(0)} y2={ty(1)} stroke="#fbf6e8" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="2 4" />
		{#if mode === 'assoc'}
			<circle cx={sx(b1)} cy={ty(t)} r="3" fill="#fbf6e8" />
			<circle cx={sx(b2)} cy={ty(t)} r="3" fill="#fbf6e8" />
		{/if}
		<!-- drag anywhere in the square -->
		<rect
			bind:this={squareEl}
			class="pad"
			x={X0}
			y={Y0}
			width={SZ}
			height={SZ}
			role="presentation"
			onpointerdown={(e) => {
				dragging = true;
				squareEl?.setPointerCapture(e.pointerId);
				const p = toUser(e);
				if (p) setFrom(p);
			}}
			onpointermove={(e) => {
				if (!dragging) return;
				const p = toUser(e);
				if (p) setFrom(p);
			}}
			onpointerup={() => (dragging = false)}
			onpointercancel={() => (dragging = false)}
		/>
		<Handle
			x={sx(s)}
			y={ty(t)}
			r={7.5}
			color="#fbf6e8"
			label="The point (s, t) of the square: left and right change the moment s, up and down change the stage t"
			valuetext={`s = ${s.toFixed(2)}, t = ${t.toFixed(2)}`}
			ondrag={setFrom}
			onkey={(dx, dy) => {
				stop();
				s = Math.max(0, Math.min(1, s + dx * 0.02));
				t = Math.max(0, Math.min(1, t - dy * 0.02));
			}}
		/>

		<g transform={narrow ? 'translate(-350 320)' : undefined}>
			<!-- ── the space X: a flower of loops at x0 ───────────────── -->
			{#if mode === 'assoc'}
				<!-- the timetable of the stage-t trip -->
				<g transform="translate(372 22)">
					{#each segs as [a, b], k (k)}
						<rect
							x={a * 268 + 1}
							y="0"
							width={(b - a) * 268 - 2}
							height="24"
							rx="5"
							fill={loops[k].color}
							fill-opacity={where.k === k ? 0.32 : 0.14}
							stroke={loops[k].color}
							stroke-opacity={where.k === k ? 0.9 : 0.45}
						/>
						<SvgTeX x={((a + b) / 2) * 268} y={12} tex={loops[k].name} size={15} w={30} h={22} />
						<SvgTeX x={((a + b) / 2) * 268} y={38} tex={String.raw`\times ${speed(a, b)}`} size={narrow ? 13.5 : 11.5} w={60} h={18} color="var(--ink-faint)" />
					{/each}
					<line x1={s * 268} x2={s * 268} y1="-4" y2="28" stroke="#fbf6e8" stroke-width="1.6" />
				</g>
			{/if}

			{#each loops as l, k (k)}
				{@const dim = mode === 'inverse' && k > 0}
				<path
					d={pathD(loopPts[k], true)}
					fill="none"
					stroke={l.color}
					stroke-width="2"
					stroke-opacity={dim ? 0.14 : mode === 'inverse' ? 0.35 : where.k === k ? 0.55 : 0.4}
					stroke-dasharray={mode === 'inverse' && !dim ? '5 5' : undefined}
				/>
				{#if !dim}
					<SvgTeX x={tip(k)[0]} y={tip(k)[1]} tex={l.name} size={17} color={l.color} w={30} h={26} />
				{/if}
			{/each}
			{#if mode === 'inverse' && t < 0.995}
				<path d={pathD(reachPts)} fill="none" stroke="var(--gold-bright)" stroke-width="2.4" stroke-opacity="0.55" stroke-linecap="round" />
				{@const turn = petal(loops[0].dir, 1 - t)}
				<circle cx={turn[0]} cy={turn[1]} r="3.5" fill="var(--rose)" />
			{/if}
			<path d={pathD(trail)} fill="none" stroke={loops[where.k].color} stroke-width="3.2" stroke-linecap="round" filter="url(#glow)" />
			<circle cx={C[0]} cy={C[1]} r="6" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" />
			<SvgTeX x={C[0] + 18} y={C[1] + 16} tex="x_0" size={15} w={30} h={22} anchor="start" />
			<circle cx={bead[0]} cy={bead[1]} r="6.5" fill="#fbf6e8" stroke="#060912" stroke-width="1.5" filter="url(#glow)" />
		</g>
	</Svg>

	<p class="readout ui" aria-live="polite">
		{#if mode === 'assoc'}
			At stage <b class="nums">t = {t.toFixed(2)}</b> the trip runs <span class="a">α</span> until
			<span class="nums">s = {b1.toFixed(2)}</span>, <span class="b">β</span> until <span class="nums">{b2.toFixed(2)}</span>, then
			<span class="c">γ</span>. Only the timing changes from <span class="nums">t = 0</span> to <span class="nums">t = 1</span>.
		{:else}
			At stage <b class="nums">t = {t.toFixed(2)}</b> the trip runs out along <span class="a">α</span>, turns back {t < 0.995
				? `after ${Math.round((1 - t) * 100)}% of it`
				: 'at once'}, and retraces its steps. At <span class="nums">t = 1</span> it never leaves x₀.
		{/if}
	</p>

	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'assoc', label: 'Associativity' },
				{ value: 'inverse', label: 'Inverses' }
			]}
			label="Which homotopy"
		/>
		<Button icon={playing ? PauseIcon : PlayIcon} onclick={play}>{playing ? 'Pause' : 'Run the trip'}</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.3rem;
	}
	.pad {
		fill: transparent;
		cursor: crosshair;
		touch-action: none;
	}
	.readout {
		margin: 0;
		padding: 0.1rem 1.25rem 0.8rem;
		min-height: 2.6rem;
		font-size: 0.84rem;
		line-height: 1.55;
		color: var(--ink-dim);
	}
	.readout b {
		color: var(--ink-bright);
		font-weight: 600;
	}
	.a {
		color: var(--gold-bright);
	}
	.b {
		color: var(--teal);
	}
	.c {
		color: var(--violet);
	}
</style>
