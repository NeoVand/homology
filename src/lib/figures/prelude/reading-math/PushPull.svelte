<script lang="ts">
	// Points push forward along a map; measurements pull back.
	// The reflex behind subscripts (homology, f_*) and superscripts (cohomology, f^*).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	type Mode = 'push' | 'pull';
	type Pt = [number, number];
	let mode = $state<Mode>('push');
	let width = $state(720);
	const narrow = $derived(width < 560);
	const p = new Tween(1, { duration: 1400, easing: cubicInOut });

	// positions in the wide layout
	const cX: Pt = [150, 132];
	const cY: Pt = [450, 132];
	const xs: Pt[] = [
		[112, 86],
		[176, 74],
		[132, 128],
		[192, 140],
		[116, 182],
		[178, 192]
	];
	const ys: Pt[] = [
		[424, 82],
		[484, 102],
		[446, 138],
		[422, 186],
		[486, 180]
	];
	const f = [0, 1, 2, 2, 3, 4]; // x3 and x2 collide

	const nX: Pt = [180, 104];
	const nY: Pt = [180, 340];
	const place = (q: Pt, from: Pt, to: Pt): Pt => [q[0] - from[0] + to[0], q[1] - from[1] + to[1]];
	const X = $derived(narrow ? xs.map((q) => place(q, cX, nX)) : xs);
	const Y = $derived(narrow ? ys.map((q) => place(q, cY, nY)) : ys);
	const CX = $derived(narrow ? nX : cX);
	const CY = $derived(narrow ? nY : cY);

	// a "temperature" on Y: gold at the top, violet at the bottom
	function temp(q: Pt): string {
		const t = Math.min(1, Math.max(0, (q[1] - (CY[1] - 80)) / 160));
		const a = [242, 208, 143];
		const b = [164, 147, 255];
		const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
		return `rgb(${c[0]},${c[1]},${c[2]})`;
	}

	function run(m: Mode) {
		mode = m;
		p.set(0, { duration: 0 });
		p.set(1, { duration: prefersReducedMotion.current ? 0 : 1400 });
	}
	const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
	function curve(a: Pt, b: Pt) {
		if (narrow) {
			const my = (a[1] + b[1]) / 2;
			return `M ${a[0]} ${a[1]} C ${a[0]} ${my}, ${b[0]} ${my}, ${b[0]} ${b[1]}`;
		}
		const mx = (a[0] + b[0]) / 2;
		return `M ${a[0]} ${a[1]} C ${mx} ${a[1]}, ${mx} ${b[1]}, ${b[0]} ${b[1]}`;
	}
	function shorten(a: Pt, b: Pt, d: number): Pt {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const l = Math.hypot(dx, dy) || 1;
		return [b[0] - (dx / l) * d, b[1] - (dy / l) * d];
	}

	const text = $derived(
		mode === 'push'
			? String.raw`**Points push forward.** A point \(x\) of \(X\) goes to the point \(f(x)\) of \(Y\), along the arrow. Two points may land together; information can be lost. Homology works this way: a map \(f\colon X\to Y\) gives \(f_*\colon H_n(X)\to H_n(Y)\), in the same direction — with a subscript.`
			: String.raw`**Measurements pull back.** A temperature \(g\) on \(Y\) gives a temperature on \(X\): just read \(g\) where each point lands, \(g\circ f\). Points travel forward, but the measurement travels backward, from \(Y\) to \(X\). Cohomology works this way: \(f^*\colon H^n(Y)\to H^n(X)\), against the arrow — with a superscript.`
	);
</script>

<div class="pp" bind:clientWidth={width}>
	<Svg viewBox={narrow ? '0 0 360 450' : '0 0 600 270'} maxHeight={narrow ? 560 : 330} label="Two sets X and Y with a map f between them; points move forward, a colouring moves backward">
		<defs>
			<linearGradient id="pp-temp" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#f2d08f" stop-opacity="0.55" />
				<stop offset="1" stop-color="#a493ff" stop-opacity="0.55" />
			</linearGradient>
		</defs>
		<!-- blobs -->
		<ellipse cx={CX[0]} cy={CX[1]} rx="92" ry="84" class="blob" />
		<ellipse cx={CY[0]} cy={CY[1]} rx="92" ry="84" class="blob" class:temp={mode === 'pull'} />
		<SvgTeX x={CX[0] + (narrow ? -112 : -70)} y={CX[1] + (narrow ? 0 : -96)} tex="X" size={22} color="var(--ink-bright)" w={30} h={30} />
		<SvgTeX x={CY[0] + (narrow ? -112 : 70)} y={CY[1] + (narrow ? 0 : -96)} tex="Y" size={22} color="var(--ink-bright)" w={30} h={30} />
		{#if mode === 'pull'}
			<SvgTeX x={CY[0] + (narrow ? 110 : 0)} y={CY[1] + (narrow ? 0 : 104)} tex={String.raw`g\colon Y\to\R`} size={14} color="var(--ink-dim)" w={100} h={24} />
		{/if}

		<!-- the big arrow f -->
		{#if narrow}
			<path d={mode === 'push' ? `M 300 ${CX[1] + 40} V ${CY[1] - 40}` : `M 300 ${CY[1] - 40} V ${CX[1] + 40}`} class="big" class:back={mode === 'pull'} marker-end="url(#arrow-{mode === 'push' ? 'blue' : 'rose'})" />
			<SvgTeX x={318} y={(CX[1] + CY[1]) / 2} tex={mode === 'push' ? 'f' : 'g\\circ f'} size={18} color={mode === 'push' ? 'var(--blue)' : 'var(--rose)'} w={60} h={30} anchor="start" />
		{:else}
			<path d={mode === 'push' ? `M ${CX[0] + 110} 250 H ${CY[0] - 110}` : `M ${CY[0] - 110} 250 H ${CX[0] + 110}`} class="big" class:back={mode === 'pull'} marker-end="url(#arrow-{mode === 'push' ? 'blue' : 'rose'})" />
			<SvgTeX x={300} y={232} tex={mode === 'push' ? 'f\\colon X\\to Y' : 'g\\ \\mapsto\\ g\\circ f'} size={15} color={mode === 'push' ? 'var(--blue)' : 'var(--rose)'} w={160} h={26} />
		{/if}

		<!-- arrows of f -->
		{#each X as x, i (i)}
			{@const y = Y[f[i]]}
			<path d={curve(x, shorten(x, y, 9))} class="arr" class:dashed={mode === 'pull'} marker-end={mode === 'push' ? 'url(#arrow-blue)' : undefined} />
		{/each}

		<!-- points of Y -->
		{#each Y as y, j (j)}
			<circle cx={y[0]} cy={y[1]} r="7" class="ypt" style={mode === 'pull' ? `fill:${temp(y)}` : ''} />
		{/each}

		<!-- points of X, travelling (push) or taking colour (pull) -->
		{#each X as x, i (i)}
			{@const y = Y[f[i]]}
			{#if mode === 'push'}
				{@const q = lerp(x, y, p.current)}
				<circle cx={x[0]} cy={x[1]} r="7" class="xpt ghost" />
				<circle cx={q[0]} cy={q[1]} r="7.5" class="xpt" />
			{:else}
				<circle cx={x[0]} cy={x[1]} r="8" class="xpt pulled" style="fill:{temp(y)}; fill-opacity:{0.15 + 0.85 * p.current}" />
				{#if p.current < 0.98}
					{@const q = lerp(y, x, p.current)}
					<circle cx={q[0]} cy={q[1]} r="4" class="drop" style="fill:{temp(y)}" />
				{/if}
			{/if}
		{/each}
	</Svg>
	<p class="readout" aria-live="polite">{@html renderMathInText(text)}</p>
	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'push', label: 'Push points forward' },
				{ value: 'pull', label: 'Pull a measurement back' }
			]}
			label="Direction"
			onchange={(m) => run(m)}
		/>
		<Button variant="ghost" onclick={() => run(mode)}>Replay</Button>
	</Controls>
</div>

<style>
	.pp > :global(svg) {
		padding: 0.8rem 0.4rem 0;
	}
	.blob {
		fill: rgba(116, 169, 255, 0.06);
		stroke: rgba(116, 169, 255, 0.35);
		stroke-width: 1.3;
		transition: fill 0.4s;
	}
	.blob.temp {
		fill: url(#pp-temp);
	}
	.big {
		fill: none;
		stroke-width: 2.4;
		stroke: var(--blue);
	}
	.big.back {
		stroke: var(--rose);
	}
	.arr {
		fill: none;
		stroke: rgba(116, 169, 255, 0.55);
		stroke-width: 1.4;
	}
	.arr.dashed {
		stroke: rgba(242, 141, 182, 0.55);
		stroke-dasharray: 4 4;
	}
	.ypt {
		fill: rgba(20, 28, 52, 0.95);
		stroke: rgba(200, 192, 170, 0.55);
		stroke-width: 1.2;
		transition: fill 0.4s;
	}
	.xpt {
		fill: #f2d08f;
		stroke: #fff6dc;
		stroke-width: 1.2;
		filter: drop-shadow(0 0 5px rgba(242, 208, 143, 0.8));
	}
	.xpt.ghost {
		fill: none;
		stroke: rgba(242, 208, 143, 0.35);
		stroke-dasharray: 2 2;
		filter: none;
	}
	.xpt.pulled {
		stroke: rgba(255, 255, 255, 0.7);
		filter: none;
	}
	.drop {
		opacity: 0.9;
	}
	.readout {
		margin: 0.4rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 4.5em;
	}
</style>
