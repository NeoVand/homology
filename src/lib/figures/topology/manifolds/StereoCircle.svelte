<script lang="ts">
	// Stereographic projection of the circle, from both poles at once. A point P
	// on the unit circle is projected from the north pole N onto the horizontal
	// line (gold) and from the south pole S (teal). The two coordinates always
	// multiply to 1, so the transition map between the two charts is t ↦ 1/t.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	const CX = 320;
	const CY = 168;
	const R = 100;
	// on narrow screens, show less of the line so that the labels stay legible
	let cw = $state(0);
	const narrow = $derived(cw > 0 && cw < 560);
	const XMIN = $derived(narrow ? 108 : 18);
	const XMAX = $derived(narrow ? 532 : 622);

	let deg = $state(32);
	let svg = $state<SVGSVGElement>();
	let dragging = false;

	const th = $derived((deg * Math.PI) / 180);
	const px = $derived(Math.cos(th));
	const py = $derived(Math.sin(th));
	// exactly at a pole one chart is undefined
	const atN = $derived(Math.abs(deg - 90) < 0.5);
	const atS = $derived(Math.abs(deg - 270) < 0.5);
	const tN = $derived(atN ? Infinity : px / (1 - py));
	const tS = $derived(atS ? Infinity : px / (1 + py));

	const sx = (x: number) => CX + R * x;
	const sy = (y: number) => CY - R * y;

	/** The ray from a pole through P, cut off at the canvas edge. */
	function ray(pole: 1 | -1, t: number) {
		const x0 = sx(0);
		const y0 = sy(pole);
		if (!Number.isFinite(t)) return { x1: x0, y1: y0, x2: x0, y2: y0, off: 0 };
		// the projection lies on the line y = 0; continue past P or stop there
		const qx = sx(t);
		const qy = sy(0);
		// does P lie beyond the line, seen from the pole?
		const beyond = pole * py < 0;
		let ex = beyond ? sx(px) : qx;
		let ey = beyond ? sy(py) : qy;
		let off = 0;
		if (ex < XMIN || ex > XMAX) {
			const lim = ex < XMIN ? XMIN : XMAX;
			const s = (lim - x0) / (ex - x0);
			ey = y0 + s * (ey - y0);
			ex = lim;
			off = lim === XMIN ? -1 : 1;
		}
		return { x1: x0, y1: y0, x2: ex, y2: ey, off };
	}
	const rN = $derived(ray(1, tN));
	const rS = $derived(ray(-1, tS));
	const visible = (t: number) => Number.isFinite(t) && sx(t) >= XMIN && sx(t) <= XMAX;

	function setFromPointer(e: PointerEvent) {
		if (!svg) return;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const m = svg.getScreenCTM();
		if (!m) return;
		const q = pt.matrixTransform(m.inverse());
		let a = (Math.atan2(CY - q.y, q.x - CX) * 180) / Math.PI;
		if (a < 0) a += 360;
		// snap onto the poles so that the two special cases can be reached
		for (const p of [90, 270]) if (Math.abs(a - p) < 2.5) a = p;
		deg = Math.round(a * 2) / 2;
	}

	const fmt = (v: number) => {
		if (!Number.isFinite(v)) return '\\text{undefined}';
		const s = Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2);
		return s.replace('-', '−');
	};
	const product = $derived(Number.isFinite(tN) && Number.isFinite(tS) ? tN * tS : NaN);
</script>

<div class="wrap" bind:clientWidth={cw}>
	<Svg
		bind:svg
		viewBox={narrow ? '96 26 448 268' : '0 0 640 300'}
		maxHeight={360}
		label="The unit circle with its north and south poles. A point P on the circle is projected from the north pole to the horizontal line (gold) and from the south pole (teal)."
		onpointermove={(e) => dragging && setFromPointer(e)}
		onpointerup={() => (dragging = false)}
		onpointerleave={() => (dragging = false)}
	>
		<!-- the line y = 0, our copy of ℝ -->
		<line x1={XMIN} y1={sy(0)} x2={XMAX} y2={sy(0)} class="axis" />
		{#each [-2, -1, 1, 2] as k (k)}
			<line x1={sx(k)} y1={sy(0) - 4} x2={sx(k)} y2={sy(0) + 4} class="tick" />
			<text x={sx(k) + (Math.abs(k) === 1 ? 11 * k : 0)} y={sy(0) + 19} class="ticklbl">{k < 0 ? '−' + -k : k}</text>
		{/each}
		<!-- the circle -->
		<circle cx={CX} cy={CY} r={R} class="circle" />
		<circle
			cx={CX}
			cy={CY}
			r={R}
			class="hit"
			role="slider"
			tabindex="0"
			aria-label="position of P on the circle; arrow keys move it"
			aria-valuenow={deg}
			aria-valuemin={0}
			aria-valuemax={360}
			onpointerdown={(e) => {
				dragging = true;
				(e.target as Element).setPointerCapture?.(e.pointerId);
				setFromPointer(e);
			}}
			onkeydown={(e) => {
				const d = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -2 : e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 2 : 0;
				if (d) {
					e.preventDefault();
					deg = (deg + d + 360) % 360;
				}
			}}
		/>
		<!-- the two rays -->
		{#if !atN}
			<line x1={rN.x1} y1={rN.y1} x2={rN.x2} y2={rN.y2} class="ray gold" />
		{/if}
		{#if !atS}
			<line x1={rS.x1} y1={rS.y1} x2={rS.x2} y2={rS.y2} class="ray teal" />
		{/if}
		<!-- the projected points -->
		{#if visible(tN)}
			<circle cx={sx(tN)} cy={sy(0)} r="6" class="dot gold" />
			<SvgTeX x={sx(tN)} y={sy(0) - 22} tex={'\\varphi_N(P)'} size={13} color="var(--gold-bright)" w={70} h={20} />
		{:else if !atN}
			<SvgTeX
				x={rN.off < 0 ? XMIN + 46 : XMAX - 46}
				y={rN.y2 - 16}
				tex={rN.off < 0 ? '\\gets\\ \\varphi_N(P)' : '\\varphi_N(P)\\ \\to'}
				size={12}
				color="var(--gold-bright)"
				w={92}
				h={20}
			/>
		{/if}
		{#if visible(tS)}
			<circle cx={sx(tS)} cy={sy(0)} r="6" class="dot teal" />
			<SvgTeX x={sx(tS)} y={sy(0) + 38} tex={'\\varphi_S(P)'} size={13} color="var(--teal)" w={70} h={20} />
		{:else if !atS}
			<SvgTeX
				x={rS.off < 0 ? XMIN + 46 : XMAX - 46}
				y={rS.y2 + 18}
				tex={rS.off < 0 ? '\\gets\\ \\varphi_S(P)' : '\\varphi_S(P)\\ \\to'}
				size={12}
				color="var(--teal)"
				w={92}
				h={20}
			/>
		{/if}
		<!-- the poles -->
		<circle cx={sx(0)} cy={sy(1)} r="5" class="pole" />
		<SvgTeX x={sx(0) + 22} y={sy(1) - 14} tex="N" size={14} color="var(--gold-bright)" w={24} h={20} />
		<circle cx={sx(0)} cy={sy(-1)} r="5" class="pole" />
		<SvgTeX x={sx(0) + 22} y={sy(-1) + 16} tex="S" size={14} color="var(--teal)" w={24} h={20} />
		<!-- the point P -->
		<circle cx={sx(px)} cy={sy(py)} r="14" class="halo" />
		<circle cx={sx(px)} cy={sy(py)} r="6.5" class="p" />
		<SvgTeX
			x={sx(px * 1.28)}
			y={sy(py * 1.28)}
			tex="P"
			size={15}
			color="var(--violet)"
			w={24}
			h={22}
		/>
		<text x={XMIN + 4} y={sy(0) - 10} class="t-ui">THE LINE ℝ</text>
	</Svg>
	<div class="readout ui" aria-live="polite">
		<span><TeX tex={`P = (${fmt(px)},\\ ${fmt(py)})`} /></span>
		<span class="g"><TeX tex={`\\varphi_N(P) = \\dfrac{x}{1-y} = ${fmt(tN)}`} /></span>
		<span class="t"><TeX tex={`\\varphi_S(P) = \\dfrac{x}{1+y} = ${fmt(tS)}`} /></span>
		{#if atN}
			<span class="note">P is the north pole, the one point the gold chart cannot see; only the teal chart covers it.</span>
		{:else if atS}
			<span class="note">P is the south pole, the one point the teal chart cannot see; only the gold chart covers it.</span>
		{:else if Math.abs(px) < 1e-9}
			<span class="note">Both coordinates are 0 here: the transition map is only used where both are non-zero.</span>
		{:else}
			<span class="note">product: <TeX tex={`\\varphi_N(P)\\cdot\\varphi_S(P) = ${fmt(product)}`} />, so on the overlap <TeX tex={'\\varphi_S = 1/\\varphi_N'} /></span>
		{/if}
	</div>
	<Controls>
		<Slider bind:value={deg} min={0} max={359.5} step={0.5} label="angle of P" format={(v) => `${v.toFixed(1)}°`} />
		<Button onclick={() => (deg = 80)}>Near the north pole</Button>
		<Button onclick={() => (deg = 90)}>At the north pole</Button>
		<Button onclick={() => (deg = 270)}>At the south pole</Button>
	</Controls>
</div>

<style>
	.axis {
		stroke: var(--ink-dim);
		stroke-width: 1.4;
	}
	.tick {
		stroke: var(--ink-dim);
		stroke-width: 1.2;
	}
	.ticklbl {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 12px;
		text-anchor: middle;
	}
	.t-ui {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 10px;
		letter-spacing: 0.14em;
	}
	.circle {
		fill: rgba(116, 169, 255, 0.05);
		stroke: var(--blue);
		stroke-width: 2.2;
		filter: url(#glow);
	}
	.hit {
		fill: transparent;
		stroke: transparent;
		stroke-width: 34;
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.hit:focus-visible {
		stroke: rgba(242, 208, 143, 0.18);
	}
	.ray {
		stroke-width: 1.6;
		stroke-dasharray: 5 4;
		pointer-events: none;
	}
	.ray.gold {
		stroke: var(--gold-bright);
	}
	.ray.teal {
		stroke: var(--teal);
	}
	.dot {
		pointer-events: none;
		filter: url(#glow);
	}
	.dot.gold {
		fill: var(--gold-bright);
	}
	.dot.teal {
		fill: var(--teal);
	}
	.pole {
		fill: #0b1020;
		stroke: var(--ink);
		stroke-width: 1.6;
		pointer-events: none;
	}
	.halo {
		fill: rgba(164, 147, 255, 0.18);
		pointer-events: none;
	}
	.p {
		fill: var(--violet);
		stroke: #fff;
		stroke-width: 1.2;
		pointer-events: none;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 1.3rem;
		padding: 0.5rem 1.2rem 0.7rem;
		font-size: 0.88rem;
		color: var(--ink-dim);
		border-top: 1px solid var(--line-faint);
	}
	.readout .g {
		color: var(--gold-bright);
	}
	.readout .t {
		color: var(--teal);
	}
	.note {
		flex-basis: 100%;
		font-size: 0.84rem;
	}
</style>
