<script lang="ts">
	// Goldbach's comet. For every even number up to a limit, count the ways to
	// write it as p + q with p ≤ q both prime, and plot the counts. The cloud
	// climbs steadily and never comes near zero; it splits into bands because
	// an even number divisible by 3 (or 5) has noticeably more ways than its
	// neighbours. Type any even number to see its own decompositions.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { renderMathInText } from '$lib/katex/render';

	const W = 600;
	const H = 330;
	const MR = 16;
	const MAXINPUT = 2_000_000;
	const colour = { three: '#f2d08f', five: '#a493ff', other: '#5fd6cf' };

	let limit = $state(10000);
	let input = $state('100');
	let hover = $state<number | null>(null);
	let canvas: HTMLCanvasElement | undefined = $state();
	let svgEl: SVGSVGElement | undefined = $state();
	let width = $state(0);

	/** composite[i] = 1 unless i is prime */
	function sieve(n: number) {
		const c = new Uint8Array(n + 1);
		c[0] = c[1] = 1;
		for (let i = 2; i * i <= n; i++) if (!c[i]) for (let j = i * i; j <= n; j += i) c[j] = 1;
		return c;
	}

	const data = $derived.by(() => {
		const c = sieve(limit);
		const primes: number[] = [];
		for (let i = 2; i <= limit; i++) if (!c[i]) primes.push(i);
		const r = new Uint32Array(limit / 2 + 1); // r[m / 2] = ways for the even number m
		for (let a = 0; a < primes.length; a++) {
			const p = primes[a];
			if (2 * p > limit) break;
			for (let b = a; b < primes.length; b++) {
				const s = p + primes[b];
				if (s > limit) break;
				if ((s & 1) === 0) r[s >> 1]++;
			}
		}
		let max = 0;
		for (let k = 2; k < r.length; k++) max = Math.max(max, r[k]);
		return { r, max };
	});

	const yTop = $derived(niceTop(data.max));
	function niceTop(v: number) {
		const step = 10 ** Math.floor(Math.log10(Math.max(v, 1)));
		for (const f of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (f * step >= v) return f * step;
		return 10 * step;
	}
	const sx = (m: number) => ML + (m / limit) * PW;
	const sy = (r: number) => MT + PH - (r / yTop) * PH;
	const kind = (m: number) => (m % 3 === 0 ? 'three' : m % 5 === 0 ? 'five' : 'other');

	const xTicks = $derived([0, 0.25, 0.5, 0.75, 1].map((f) => f * limit));
	const yTicks = $derived([0, 0.25, 0.5, 0.75, 1].map((f) => f * yTop));
	const fmt = (v: number) => Math.round(v).toLocaleString('en-US');
	// text keeps a readable size when the plot is drawn small, and the margins grow with it
	const fs = $derived(width ? Math.max(11, (10.5 * W) / width) : 11);
	const ML = $derived(fs * 3.1 + 8);
	const MT = $derived(fs * 1.9);
	const MB = $derived(fs * 2.9);
	const PW = $derived(W - ML - MR);
	const PH = $derived(H - MT - MB);

	// the point cloud, on a canvas under the SVG
	$effect(() => {
		if (!canvas || !width) return;
		const { r } = data;
		const dpr = window.devicePixelRatio || 1;
		const scale = width / W;
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(H * scale * dpr);
		const g = canvas.getContext('2d');
		if (!g) return;
		g.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
		g.clearRect(0, 0, W, H);
		const rad = limit > 20000 ? 0.75 : limit > 5000 ? 1 : 1.5;
		for (const k of ['other', 'five', 'three'] as const) {
			g.fillStyle = colour[k];
			g.globalAlpha = 0.85;
			g.beginPath();
			for (let m = 4; m <= limit; m += 2) {
				if (kind(m) !== k) continue;
				const x = sx(m);
				const y = sy(r[m >> 1]);
				g.moveTo(x + rad, y);
				g.arc(x, y, rad, 0, Math.PI * 2);
			}
			g.fill();
		}
	});
	$effect(() => {
		if (!svgEl) return;
		const ro = new ResizeObserver(() => (width = svgEl!.getBoundingClientRect().width));
		ro.observe(svgEl);
		return () => ro.disconnect();
	});

	// the reader's own number
	const mine = $derived.by((): { m: number | null; error: string } => {
		const t = input.replace(/[\s,]/g, '');
		if (!/^\d+$/.test(t)) return { m: null, error: 'Type a whole number.' };
		const m = Number(t);
		if (m < 4 || m % 2) return { m: null, error: 'Choose an even number from 4 on.' };
		if (m > MAXINPUT) return { m: null, error: `This figure goes up to ${fmt(MAXINPUT)}.` };
		return { m, error: '' };
	});
	function waysOf(m: number) {
		const c = sieve(m);
		const pairs: [number, number][] = [];
		let count = 0;
		for (let p = 2; 2 * p <= m; p++)
			if (!c[p] && !c[m - p]) {
				count++;
				if (pairs.length < 4) pairs.push([p, m - p]);
			}
		return { count, pairs };
	}
	const focus: number | null = $derived(hover ?? mine.m);
	const focusWays = $derived(focus === null ? null : focus <= limit ? { count: data.r[focus >> 1], pairs: waysOf(focus).pairs } : waysOf(focus));
	const readout = $derived.by(() => {
		if (focus === null || !focusWays) return mine.error;
		const { count, pairs } = focusWays;
		const n = (v: number) => fmt(v).replace(/,/g, '{,}');
		const shown = pairs.map(([p, q]) => `${n(p)} + ${n(q)}`).join(' = ');
		const more = count > pairs.length ? ' = \\cdots' : '';
		return String.raw`\(${fmt(focus).replace(/,/g, '{,}')} = ${shown}${more}\): ${fmt(count)} way${count === 1 ? '' : 's'}.`;
	});

	function onmove(e: PointerEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const rect = svg.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * W;
		if (x < ML || x > ML + PW) return (hover = null);
		const m = Math.round((((x - ML) / PW) * limit) / 2) * 2;
		hover = Math.min(limit, Math.max(4, m));
	}
</script>

<div class="gc">
	<div class="plot">
		<canvas bind:this={canvas} style="width:{width}px;height:{(width * H) / W}px" aria-hidden="true"></canvas>
		<svg
			bind:this={svgEl}
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label="Goldbach's comet: for each even number up to {fmt(limit)}, a dot whose height is the number of ways to write it as a sum of two primes. The dots form a rising cloud in several bands, far above zero."
			onpointermove={onmove}
			onpointerleave={() => (hover = null)}
		>
			{#each yTicks as t (t)}
				<line class="grid" x1={ML} x2={ML + PW} y1={sy(t)} y2={sy(t)} />
				<text class="tick" x={ML - 7} y={sy(t) + fs * 0.35} text-anchor="end" font-size={fs}>{fmt(t)}</text>
			{/each}
			{#each xTicks as t, i (t)}
				<text class="tick" x={sx(t)} y={MT + PH + fs * 1.45} text-anchor={i === xTicks.length - 1 ? 'end' : 'middle'} font-size={fs}>{fmt(t)}</text>
			{/each}
			<line class="axis" x1={ML} x2={ML + PW} y1={MT + PH} y2={MT + PH} />
			<line class="axis" x1={ML} x2={ML} y1={MT} y2={MT + PH} />
			<text class="lab" x={ML + PW / 2} y={H - 3} text-anchor="middle" font-size={fs * 1.05}>even number</text>
			<text class="lab" x={ML - 7} y={fs * 1.05} text-anchor="start" font-size={fs * 1.05}>number of ways</text>
			{#if focus !== null && focus <= limit && focusWays}
				<line class="cursor" x1={sx(focus)} x2={sx(focus)} y1={MT} y2={MT + PH} />
				<circle class="ring" cx={sx(focus)} cy={sy(focusWays.count)} r="5" />
			{/if}
		</svg>
	</div>
	<p class="key ui">
		<span><i style="background:{colour.three}"></i>multiples of 3</span>
		<span><i style="background:{colour.five}"></i>multiples of 5, not of 3</span>
		<span><i style="background:{colour.other}"></i>the rest</span>
	</p>
	<p class="readout" id="gc-readout" aria-live="polite">{@html renderMathInText(readout)}</p>
	<Controls>
		<Segmented
			bind:value={limit}
			label="Up to"
			options={[
				{ value: 1000, label: '1,000' },
				{ value: 10000, label: '10,000' },
				{ value: 50000, label: '50,000' }
			]}
		/>
		<label class="mine">
			<span>Your even number</span>
			<input type="text" inputmode="numeric" bind:value={input} aria-describedby="gc-readout" />
		</label>
	</Controls>
</div>

<style>
	.gc {
		display: grid;
	}
	.plot {
		position: relative;
		padding: 0.9rem 0.6rem 0;
	}
	canvas {
		position: absolute;
		left: 0.6rem;
		top: 0.9rem;
		pointer-events: none;
	}
	svg {
		position: relative;
		display: block;
		width: 100%;
		height: auto;
		touch-action: pan-y;
	}
	.grid {
		stroke: var(--line-faint);
		stroke-width: 1;
	}
	.axis {
		stroke: var(--line-strong);
		stroke-width: 1.2;
	}
	.tick {
		font-family: var(--font-ui);
		fill: var(--ink-faint);
	}
	.lab {
		font-family: var(--font-ui);
		fill: var(--ink-dim);
	}
	.cursor {
		stroke: rgba(255, 255, 255, 0.25);
		stroke-dasharray: 3 4;
	}
	.ring {
		fill: none;
		stroke: #fff;
		stroke-width: 2;
		filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
	}
	.key {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1.2rem;
		margin: 0.3rem 1rem 0 !important;
		font-size: 0.76rem;
		color: var(--ink-dim);
	}
	.key i {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		margin-right: 0.35rem;
		vertical-align: -0.02rem;
	}
	.readout {
		margin: 0.5rem 1.2rem 0.8rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 1.6em;
		overflow-wrap: anywhere;
	}
	.mine {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.mine input {
		width: 8.5rem;
		font: inherit;
		font-size: 0.9rem;
		color: var(--ink);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 0.3rem 0.55rem;
	}
	.mine input:focus-visible {
		outline: 2px solid var(--gold);
		outline-offset: 1px;
	}
</style>
