<script lang="ts">
	// Image and preimage under f(x) = x². Drag the interval on an axis.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { squareImage, squarePreimage } from './maps';

	type Mode = 'pre' | 'img';
	let mode = $state<Mode>('pre');
	let c = $state(1);
	let d = $state(4);
	let a = $state(-1);
	let b = $state(2);

	const XMIN = -2.6;
	const XMAX = 2.6;
	const YMIN = -1.6;
	const YMAX = 5.5;
	const L = 58;
	const R = 392;
	const T = 18;
	const Bm = 304;
	const sx = (x: number) => L + ((x - XMIN) / (XMAX - XMIN)) * (R - L);
	const sy = (y: number) => Bm - ((y - YMIN) / (YMAX - YMIN)) * (Bm - T);
	const ix = (px: number) => XMIN + ((px - L) / (R - L)) * (XMAX - XMIN);
	const iy = (py: number) => YMIN + ((Bm - py) / (Bm - T)) * (YMAX - YMIN);

	const curve = (() => {
		const pts: string[] = [];
		for (let i = 0; i <= 160; i++) {
			const x = XMIN + (i / 160) * (XMAX - XMIN);
			const y = x * x;
			if (y > YMAX + 0.3) continue;
			pts.push(`${pts.length ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(y).toFixed(2)}`);
		}
		return pts.join(' ');
	})();
	function arc(x0: number, x1: number) {
		const pts: string[] = [];
		for (let i = 0; i <= 60; i++) {
			const x = x0 + (i / 60) * (x1 - x0);
			pts.push(`${i ? 'L' : 'M'} ${sx(x).toFixed(2)} ${sy(x * x).toFixed(2)}`);
		}
		return pts.join(' ');
	}

	const lo = $derived(Math.min(c, d));
	const hi = $derived(Math.max(c, d));
	const pre = $derived(squarePreimage(lo, hi));
	const A0 = $derived(Math.min(a, b));
	const A1 = $derived(Math.max(a, b));
	const img = $derived(squareImage(A0, A1));

	function fmt(v: number) {
		const r = Math.round(v * 100) / 100;
		const s = Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, '');
		return s.replace('-', '−');
	}
	function texNum(v: number) {
		const r = Math.round(v * 100) / 100;
		const s = Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, '');
		return Object.is(r, -0) ? '0' : s;
	}
	const interval = (p: number, q: number) => String.raw`[${texNum(p)},\,${texNum(q)}]`;

	const readout = $derived.by(() => {
		if (mode === 'pre') {
			const B = interval(lo, hi);
			const P = pre.length ? pre.map(([p, q]) => interval(p, q)).join(String.raw`\,\cup\,`) : String.raw`\varnothing`;
			const why =
				hi < 0
					? 'No square is negative, so nobody lands in \\(B\\): the preimage is empty.'
					: lo <= 0
						? 'The band reaches down to \\(0\\), so the two pieces join into one interval.'
						: 'Two pieces: \\(x\\) and \\(-x\\) have the same square, so every value is reached twice.';
			return { main: String.raw`\(f^{-1}(B) = f^{-1}\big(${B}\big) = ${P}\)`, sub: why + ' The function \\(x\\mapsto x^2\\) has no inverse, but every set still has a preimage.' };
		}
		const A = interval(A0, A1);
		return {
			main: String.raw`\(f(A) = f\big(${A}\big) = ${interval(img[0], img[1])}\)`,
			sub:
				A0 <= 0 && A1 >= 0
					? 'Because \\(A\\) contains \\(0\\), the smallest value reached is \\(f(0)=0\\), not the square of an endpoint.'
					: 'Every value between the squares of the endpoints is reached exactly once.'
		};
	});

	// ── dragging handles ──
	let svgEl = $state<SVGSVGElement>();
	let drag: null | 'c' | 'd' | 'a' | 'b' = null;
	function toSvg(e: PointerEvent): [number, number] {
		const pt = svgEl!.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const q = pt.matrixTransform(svgEl!.getScreenCTM()!.inverse());
		return [q.x, q.y];
	}
	const snap = (v: number, s: number) => Math.round(v / s) * s;
	function down(e: PointerEvent, h: 'c' | 'd' | 'a' | 'b') {
		drag = h;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag || !svgEl) return;
		const [x, y] = toSvg(e);
		if (drag === 'c' || drag === 'd') {
			const v = Math.max(-1.5, Math.min(5.25, snap(iy(y), 0.25)));
			if (drag === 'c') c = v;
			else d = v;
		} else {
			const v = Math.max(-2.5, Math.min(2.5, snap(ix(x), 0.1)));
			if (drag === 'a') a = Math.round(v * 10) / 10;
			else b = Math.round(v * 10) / 10;
		}
	}
	function up() {
		drag = null;
	}
	function keyH(e: KeyboardEvent, h: 'c' | 'd' | 'a' | 'b') {
		const s = h === 'c' || h === 'd' ? 0.25 : 0.1;
		const dir = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -1 : 0;
		if (!dir) return;
		e.preventDefault();
		if (h === 'c') c = Math.max(-1.5, Math.min(5.25, c + dir * s));
		if (h === 'd') d = Math.max(-1.5, Math.min(5.25, d + dir * s));
		if (h === 'a') a = Math.round(Math.max(-2.5, Math.min(2.5, a + dir * s)) * 10) / 10;
		if (h === 'b') b = Math.round(Math.max(-2.5, Math.min(2.5, b + dir * s)) * 10) / 10;
	}
</script>

<div class="pg">
	<Svg bind:svg={svgEl} viewBox="0 0 420 330" maxHeight={420} label="The graph of f(x) = x squared, with an interval and its image or preimage highlighted" onpointermove={move} onpointerup={up} onpointerleave={up}>
		<!-- grid -->
		{#each [-2, -1, 1, 2] as gx (gx)}
			<line x1={sx(gx)} y1={T} x2={sx(gx)} y2={Bm} class="grid" />
			<text x={sx(gx)} y={sy(0) + 17} class="tk">{fmt(gx)}</text>
		{/each}
		{#each [1, 2, 3, 4, 5] as gy (gy)}
			<line x1={L} y1={sy(gy)} x2={R} y2={sy(gy)} class="grid" />
			<text x={sx(0) - 9} y={sy(gy) + 4} class="tk tky">{gy}</text>
		{/each}
		<line x1={L} y1={sy(0)} x2={R} y2={sy(0)} class="axis" />
		<line x1={sx(0)} y1={Bm} x2={sx(0)} y2={T} class="axis" />

		{#if mode === 'pre'}
			<!-- the band B on the y-axis -->
			<rect x={L} y={sy(hi)} width={R - L} height={Math.max(0, sy(lo) - sy(hi))} class="band teal" />
			{#each pre as [p, q] (p)}
				<path d={arc(p, q)} class="hl teal" />
				{#each [p, q] as e (e)}
					<line x1={sx(e)} y1={sy(e * e)} x2={sx(e)} y2={sy(0)} class="drop teal" />
				{/each}
				<line x1={sx(p)} y1={sy(0)} x2={sx(q)} y2={sy(0)} class="seg teal" />
			{/each}
		{:else}
			<rect x={sx(A0)} y={T} width={sx(A1) - sx(A0)} height={Bm - T} class="band violet" />
			<path d={arc(A0, A1)} class="hl gold" />
			<line x1={sx(A0)} y1={sy(0)} x2={sx(A1)} y2={sy(0)} class="seg violet" />
			{#each [img[0], img[1]] as v, k (k)}
				{@const xs = v === 0 ? 0 : A0 * A0 === v ? A0 : A1}
				<line x1={sx(xs)} y1={sy(v)} x2={sx(0)} y2={sy(v)} class="drop gold" />
			{/each}
			<line x1={sx(0)} y1={sy(img[0])} x2={sx(0)} y2={sy(img[1])} class="seg gold" />
		{/if}

		<path d={curve} class="curve" />
		<SvgTeX x={sx(2.3) + 20} y={sy(3.1)} tex="f(x)=x^2" size={15} color="var(--blue)" w={90} h={24} />

		{#if mode === 'pre'}
			<line x1={sx(0)} y1={sy(lo)} x2={sx(0)} y2={sy(hi)} class="seg teal" />
			{#each [{ h: 'c' as const, v: c }, { h: 'd' as const, v: d }] as H (H.h)}
				<g class="handle teal" role="slider" tabindex="0" aria-label="end of B at {H.v}" aria-valuenow={H.v} onpointerdown={(e) => down(e, H.h)} onkeydown={(e) => keyH(e, H.h)}>
					<circle cx={sx(0)} cy={sy(H.v)} r="16" class="hit" />
					<circle cx={sx(0)} cy={sy(H.v)} r="8" class="knob" />
				</g>
			{/each}
			<SvgTeX x={sx(0) - 24} y={sy((lo + hi) / 2)} tex="B" size={16} color="var(--teal)" w={24} h={24} />
		{:else}
			{#each [{ h: 'a' as const, v: a }, { h: 'b' as const, v: b }] as H (H.h)}
				<g class="handle violet" role="slider" tabindex="0" aria-label="end of A at {H.v}" aria-valuenow={H.v} onpointerdown={(e) => down(e, H.h)} onkeydown={(e) => keyH(e, H.h)}>
					<circle cx={sx(H.v)} cy={sy(0)} r="16" class="hit" />
					<circle cx={sx(H.v)} cy={sy(0)} r="8" class="knob" />
				</g>
			{/each}
			<SvgTeX x={sx((A0 + A1) / 2)} y={sy(0) + 30} tex="A" size={16} color="var(--violet)" w={24} h={24} />
		{/if}
	</Svg>

	<div class="readout" aria-live="polite">
		<div class="main">{@html renderMathInText(readout.main)}</div>
		<div class="sub">{@html renderMathInText(readout.sub)}</div>
	</div>
	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'pre', label: 'Preimage of B' },
				{ value: 'img', label: 'Image of A' }
			]}
			label="Mode"
		/>
		<span class="tip ui">Drag the round handles on the {mode === 'pre' ? 'vertical' : 'horizontal'} axis (or focus one and use the arrow keys).</span>
	</Controls>
</div>

<style>
	.pg > :global(svg) {
		padding: 0.9rem 0.6rem 0;
		touch-action: none;
	}
	.grid {
		stroke: rgba(255, 255, 255, 0.05);
		stroke-width: 1;
	}
	.axis {
		stroke: rgba(200, 192, 170, 0.55);
		stroke-width: 1.3;
	}
	.tk {
		font-family: var(--font-ui);
		font-size: 10.5px !important;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
	}
	.tky {
		text-anchor: end;
	}
	.curve {
		fill: none;
		stroke: var(--blue);
		stroke-width: 2.2;
	}
	.band.teal {
		fill: rgba(95, 214, 207, 0.1);
	}
	.band.violet {
		fill: rgba(164, 147, 255, 0.1);
	}
	.hl {
		fill: none;
		stroke-width: 5;
		stroke-linecap: round;
	}
	.hl.teal {
		stroke: var(--teal);
	}
	.hl.gold {
		stroke: var(--gold-bright);
	}
	.drop {
		stroke-width: 1.3;
		stroke-dasharray: 3 4;
	}
	.drop.teal {
		stroke: var(--teal);
	}
	.drop.gold {
		stroke: var(--gold-bright);
	}
	.seg {
		stroke-width: 6;
		stroke-linecap: round;
	}
	.seg.teal {
		stroke: var(--teal);
	}
	.seg.gold {
		stroke: var(--gold-bright);
	}
	.seg.violet {
		stroke: var(--violet);
	}
	.handle {
		cursor: grab;
	}
	.handle:focus {
		outline: none;
	}
	.handle .hit {
		fill: transparent;
	}
	.handle .knob {
		stroke: #060912;
		stroke-width: 1.6;
	}
	.handle.teal .knob {
		fill: #bff3ef;
	}
	.handle.violet .knob {
		fill: #dcd5ff;
	}
	.handle:hover .knob,
	.handle:focus-visible .knob {
		stroke: #fff;
		stroke-width: 2.4;
	}
	.readout {
		padding: 0.5rem 1.2rem 0.8rem;
		text-align: center;
		min-height: 4.6rem;
	}
	.main {
		font-size: 1.08rem;
		color: var(--ink-bright);
	}
	.sub {
		font-size: 0.9rem;
		color: var(--ink-dim);
		margin-top: 0.2rem;
	}
	.tip {
		font-size: 0.76rem;
		color: var(--ink-faint);
	}
	/* phones: the graph shrinks, so its tick labels grow */
	@container figure (max-width: 34rem) {
		.tk {
			font-size: 15px !important;
		}
	}
</style>
