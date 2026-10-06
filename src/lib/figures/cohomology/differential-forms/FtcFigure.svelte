<script lang="ts">
	// Figure: the fundamental theorem of calculus as "adding up little rises".
	// Top: a height function F and a staircase that climbs by the predicted rise
	// F′(xᵢ)·Δx on each piece. Bottom: the slope F′ with rectangles whose areas
	// are those same rises. Drag a and b; change the number of pieces.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { clamp, fmtTeX } from './calc';

	const Fn = (x: number) => 1.25 + 0.85 * Math.sin(0.75 * x - 0.4) + 0.14 * x;
	const dF = (x: number) => 0.85 * 0.75 * Math.cos(0.75 * x - 0.4) + 0.14;

	// layout
	const X0 = 62;
	const X1 = 604;
	const xmax = 10;
	const sx = (x: number) => X0 + ((X1 - X0) * x) / xmax;
	const ix = (px: number) => ((px - X0) / (X1 - X0)) * xmax;
	const top = { y0: 214, k: 50 }; // F → y
	const bot = { y0: 352, k: 64 }; // F′ → y (axis at y0)
	const fy = (v: number) => top.y0 - top.k * v;
	const gy = (v: number) => bot.y0 - bot.k * v;

	let a = $state(0.6);
	let b = $state(8.4);
	let n = $state(8);

	const lo = $derived(Math.min(a, b));
	const hi = $derived(Math.max(a, b));
	const dx = $derived((hi - lo) / n);
	const xs = $derived(Array.from({ length: n }, (_, i) => lo + i * dx));
	const rises = $derived(xs.map((x) => dF(x) * dx));
	const sum = $derived(rises.reduce((s, r) => s + r, 0));
	const exact = $derived(Fn(hi) - Fn(lo));

	const curve = (f: (x: number) => number, y: (v: number) => number) => {
		let d = '';
		for (let i = 0; i <= 200; i++) {
			const x = (xmax * i) / 200;
			d += `${i ? 'L' : 'M'} ${sx(x).toFixed(1)} ${y(f(x)).toFixed(1)} `;
		}
		return d;
	};
	const Fpath = curve(Fn, fy);
	const dFpath = curve(dF, gy);

	// staircase: start at (lo, F(lo)) and climb by the predicted rises
	const stairs = $derived.by(() => {
		let y = Fn(lo);
		let d = `M ${sx(lo)} ${fy(y)}`;
		const pts: [number, number][] = [[lo, y]];
		for (let i = 0; i < n; i++) {
			y += rises[i];
			d += ` L ${sx(xs[i] + dx)} ${fy(y)}`;
			pts.push([xs[i] + dx, y]);
		}
		return { d, pts, end: y };
	});

	let svg: SVGSVGElement | undefined = $state();
	let drag: 'a' | 'b' | null = null;
	function toX(e: PointerEvent) {
		const m = svg!.getScreenCTM()!.inverse();
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m);
		return clamp(ix(p.x), 0.1, xmax - 0.1);
	}
	function down(e: PointerEvent, which: 'a' | 'b') {
		drag = which;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		const x = toX(e);
		if (drag === 'a') a = x;
		else b = x;
	}
	function key(e: KeyboardEvent, which: 'a' | 'b') {
		const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -0.1 : 0;
		if (!d) return;
		e.preventDefault();
		if (which === 'a') a = clamp(a + d, 0.1, xmax - 0.1);
		else b = clamp(b + d, 0.1, xmax - 0.1);
	}
</script>

<div class="ftc">
	<Svg bind:svg viewBox="0 0 640 410" maxHeight={520} label="The graph of a function F and of its slope F prime, with draggable endpoints a and b.">
		<defs>
			<linearGradient id="ftc-rect" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#a493ff" stop-opacity="0.55" />
				<stop offset="1" stop-color="#a493ff" stop-opacity="0.18" />
			</linearGradient>
		</defs>
		<!-- panel labels -->
		<text x="18" y="34" class="t-ui">HEIGHT</text>
		<text x="18" y="262" class="t-ui">SLOPE</text>
		<!-- top axis -->
		<line x1={X0} y1={top.y0} x2={X1} y2={top.y0} class="axis" />
		<!-- bottom axis -->
		<line x1={X0} y1={bot.y0} x2={X1} y2={bot.y0} class="axis" />

		<!-- interval band -->
		<rect x={sx(lo)} y="30" width={sx(hi) - sx(lo)} height={bot.y0 + 40 - 30} class="band" />

		<!-- rectangles under the slope graph -->
		{#each xs as x, i (i)}
			{@const h = dF(x)}
			<rect
				x={sx(x)}
				y={h >= 0 ? gy(h) : bot.y0}
				width={Math.max(0.5, sx(x + dx) - sx(x) - 0.6)}
				height={Math.abs(gy(h) - bot.y0)}
				class="rect"
				class:neg={h < 0}
			/>
		{/each}
		<path d={dFpath} class="slope" />
		<SvgTeX x={X1 + 18} y={gy(dF(xmax)) - 6} tex="F'" color="var(--blue)" size={16} w={40} />

		<!-- the height graph and the staircase of predicted rises -->
		<path d={Fpath} class="height" />
		<SvgTeX x={X1 + 18} y={fy(Fn(xmax)) - 4} tex="F" color="var(--ink-bright)" size={17} w={40} />
		<path d={stairs.d} class="stairs-halo" />
		<path d={stairs.d} class="stairs" />
		{#each stairs.pts as p, i (i)}
			<circle cx={sx(p[0])} cy={fy(p[1])} r={i === 0 || i === n ? 4 : 2.6} class="sp" />
		{/each}

		<!-- total rise brackets at b -->
		<line x1={sx(hi) + 10} y1={fy(Fn(lo))} x2={sx(hi) + 10} y2={fy(Fn(hi))} class="brk-halo" />
		<line x1={sx(hi) + 10} y1={fy(Fn(lo))} x2={sx(hi) + 10} y2={fy(Fn(hi))} class="brk exact" />
		<line x1={sx(lo)} y1={fy(Fn(lo))} x2={sx(hi) + 14} y2={fy(Fn(lo))} class="guide" />
		<circle cx={sx(hi)} cy={fy(Fn(hi))} r="4.5" class="endpt" />
		<circle cx={sx(lo)} cy={fy(Fn(lo))} r="4.5" class="endpt" />

		<!-- handles a, b on the bottom axis -->
		{#each [['a', a], ['b', b]] as [name, val] (name)}
			<g
				class="handle"
				transform="translate({sx(val as number)} {bot.y0 + 26})"
				role="slider"
				tabindex="0"
				aria-label="Endpoint {name}"
				aria-valuenow={val as number}
				onpointerdown={(e) => down(e, name as 'a' | 'b')}
				onpointermove={move}
				onpointerup={() => (drag = null)}
				onpointercancel={() => (drag = null)}
				onkeydown={(e) => key(e, name as 'a' | 'b')}
			>
				<line x1="0" y1="-26" x2="0" y2={-(bot.y0 + 26 - 34)} class="tick" />
				<circle r="16" class="hit" />
				<path d="M 0 -9 L 8 4 L -8 4 Z" class="knob" />
				<SvgTeX x={0} y={18} tex={name as string} color="var(--gold-bright)" size={17} w={30} h={24} />
			</g>
		{/each}
	</Svg>
	<Controls>
		<Segmented
			bind:value={n}
			label="Number of pieces"
			options={[
				{ value: 2, label: '2 pieces' },
				{ value: 4, label: '4' },
				{ value: 8, label: '8' },
				{ value: 16, label: '16' },
				{ value: 32, label: '32' }
			]}
		/>
	</Controls>
	<div class="readout">
		<div><span class="cap ui violet">Sum of predicted rises (signed area)</span><TeX tex={String.raw`\textstyle\sum_{i} F'(x_i)\,\Delta x = ${fmtTeX(sum, 3)}`} /></div>
		<div><span class="cap ui teal">Actual change in height</span><TeX tex={String.raw`F(b) - F(a) = ${fmtTeX(exact, 3)}`} /></div>
	</div>
</div>

<style>
	.axis {
		stroke: rgba(235, 229, 213, 0.3);
		stroke-width: 1;
	}
	.band {
		fill: rgba(242, 208, 143, 0.05);
	}
	.rect {
		fill: url(#ftc-rect);
		stroke: rgba(164, 147, 255, 0.75);
		stroke-width: 0.8;
	}
	.rect.neg {
		fill: rgba(242, 141, 182, 0.25);
		stroke: rgba(242, 141, 182, 0.7);
	}
	.slope {
		fill: none;
		stroke: var(--blue);
		stroke-width: 2;
	}
	.height {
		fill: none;
		stroke: rgba(251, 246, 232, 0.85);
		stroke-width: 2.2;
	}
	.stairs {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
		stroke-linejoin: round;
	}
	.stairs-halo {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 9;
		stroke-linejoin: round;
		opacity: 0.15;
	}
	.brk-halo {
		stroke: var(--teal);
		stroke-width: 10;
		stroke-linecap: round;
		opacity: 0.18;
	}
	.sp {
		fill: var(--gold-pale);
	}
	.endpt {
		fill: var(--teal);
		stroke: #0a0f22;
		stroke-width: 1.5;
	}
	.brk {
		stroke-width: 3;
		stroke-linecap: round;
	}
	.brk.exact {
		stroke: var(--teal);
	}
	.guide {
		stroke: rgba(95, 214, 207, 0.45);
		stroke-dasharray: 3 4;
	}
	.handle {
		cursor: ew-resize;
		touch-action: none;
		outline: none;
	}
	.tick {
		stroke: rgba(242, 208, 143, 0.4);
		stroke-dasharray: 2 4;
	}
	.hit {
		fill: transparent;
	}
	.knob {
		fill: var(--gold-bright);
		stroke: #0a0f22;
		stroke-width: 1.2;
	}
	.handle:focus-visible .knob,
	.handle:hover .knob {
		fill: #fff3d6;
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem 1.4rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1.05rem;
	}
	.readout > div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.cap {
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.violet {
		color: var(--violet);
	}
	.teal {
		color: var(--teal);
	}
	@media (max-width: 560px) {
		.readout {
			grid-template-columns: 1fr;
		}
	}
</style>
