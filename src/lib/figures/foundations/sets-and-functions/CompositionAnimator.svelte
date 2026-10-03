<script lang="ts">
	// g ∘ f, "g after f": people → cities → countries.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { compose } from './maps';

	const X = ['Ana', 'Ben', 'Chloé', 'Dev'];
	const Y = ['Lyon', 'Paris', 'Kyoto', 'Rio'];
	const Z = ['France', 'Japan', 'Brazil'];
	const f = [1, 0, 2, 1];
	const g = [0, 0, 1, 2];
	const gf = compose(g, f);

	let step = $state(1);
	let traced = $state<number | null>(null);
	const travel = new Tween(0, { duration: 2200, easing: cubicInOut });

	const CX = [62, 200, 338];
	const PW = 66;
	const PH = 26;
	const yX = (i: number) => 58 + i * 52;
	const yY = (j: number) => 58 + j * 52;
	const yZ = (k: number) => 84 + k * 52;

	type Pt = [number, number];
	function bez(a: Pt, b: Pt, s: number): Pt {
		const mx = (a[0] + b[0]) / 2;
		const p0 = a;
		const p1: Pt = [mx, a[1]];
		const p2: Pt = [mx, b[1]];
		const p3 = b;
		const u = 1 - s;
		return [
			u * u * u * p0[0] + 3 * u * u * s * p1[0] + 3 * u * s * s * p2[0] + s * s * s * p3[0],
			u * u * u * p0[1] + 3 * u * u * s * p1[1] + 3 * u * s * s * p2[1] + s * s * s * p3[1]
		];
	}
	const curve = (a: Pt, b: Pt) => `M ${a[0]} ${a[1]} C ${(a[0] + b[0]) / 2} ${a[1]}, ${(a[0] + b[0]) / 2} ${b[1]}, ${b[0]} ${b[1]}`;
	const fFrom = (i: number): Pt => [CX[0] + PW / 2 + 2, yX(i)];
	const fTo = (i: number): Pt => [CX[1] - PW / 2 - 4, yY(f[i])];
	const gFrom = (j: number): Pt => [CX[1] + PW / 2 + 2, yY(j)];
	const gTo = (j: number): Pt => [CX[2] - PW / 2 - 4, yZ(g[j])];
	const hTo = (i: number): Pt => [CX[2] - PW / 2 - 4, yZ(gf[i])];

	function tokenPos(i: number, t: number): Pt {
		if (t <= 1) return bez([CX[0], yX(i)], [CX[1], yY(f[i])], t);
		return bez([CX[1], yY(f[i])], [CX[2], yZ(gf[i])], Math.min(1, t - 1));
	}

	$effect(() => {
		const s = step;
		if (s === 3) {
			travel.set(0, { duration: 0 });
			travel.set(2, { duration: prefersReducedMotion.current ? 0 : 2200 });
		}
	});

	const labels = ['Three sets', 'f: who lives where', 'g: which country', 'Follow the arrows', 'g ∘ f: “g after f”'];
	const showF = $derived(step >= 1 && step <= 3);
	const showG = $derived(step >= 2 && step <= 3);
	const showH = $derived(step >= 4);
	const midFade = $derived(step >= 4 ? 0.28 : 1);

	const readout = $derived.by(() => {
		if (traced !== null) {
			const i = traced;
			return String.raw`\((g\circ f)(\text{${X[i]}}) = g\big(f(\text{${X[i]}})\big) = g(\text{${Y[f[i]]}}) = \text{${Z[gf[i]]}}\). First \(f\), then \(g\): read right to left.`;
		}
		return [
			String.raw`People \(X\), cities \(Y\), countries \(Z\). Tap a person at any time to trace them.`,
			String.raw`\(f\colon X\to Y\) sends each person to the city they live in. Every person has exactly one arrow.`,
			String.raw`\(g\colon Y\to Z\) sends each city to its country. Notice that \(f\) lands in \(Y\), which is exactly where \(g\) starts.`,
			String.raw`Follow the arrows: each person travels along \(f\), then along \(g\).`,
			String.raw`The composite \(g\circ f\colon X\to Z\), read “\(g\) after \(f\)”: \((g\circ f)(x) = g(f(x))\). It sends each person straight to their country.`
		][step];
	});
</script>

<div class="comp">
	<Svg viewBox="0 0 400 270" maxHeight={380} label="People, cities and countries with arrows f and g and their composite g after f">
		<text x={CX[0]} y="24" class="cap">X · people</text>
		<text x={CX[1]} y="24" class="cap" style="opacity:{midFade}">Y · cities</text>
		<text x={CX[2]} y="24" class="cap">Z · countries</text>

		{#if showF}
			{#each X as _, i (i)}
				<path d={curve(fFrom(i), fTo(i))} class="arr f" class:hot={traced === i} marker-end={traced === i ? 'url(#arrow-gold)' : 'url(#arrow-blue)'} />
			{/each}
			<text x={(CX[0] + CX[1]) / 2} y="252" class="mapname f">f</text>
		{/if}
		{#if showG}
			{#each Y as _, j (j)}
				<path d={curve(gFrom(j), gTo(j))} class="arr g" class:hot={traced !== null && f[traced] === j} marker-end={traced !== null && f[traced] === j ? 'url(#arrow-gold)' : 'url(#arrow-violet)'} />
			{/each}
			<text x={(CX[1] + CX[2]) / 2} y="252" class="mapname g">g</text>
		{/if}
		{#if showH}
			{#each X as _, i (i)}
				<path d={curve(fFrom(i), hTo(i))} class="arr h" class:hot={traced === i} marker-end="url(#arrow-gold)" />
			{/each}
			<text x={CX[1]} y="252" class="mapname h">g ∘ f</text>
		{/if}

		{#each X as name, i (name)}
			<g class="pill person" class:hot={traced === i} role="button" tabindex="0" aria-label="trace {name}" onclick={() => (traced = traced === i ? null : i)} onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (traced = traced === i ? null : i))}>
				<rect x={CX[0] - PW / 2} y={yX(i) - PH / 2} width={PW} height={PH} rx="13" />
				<text x={CX[0]} y={yX(i) + 4.5}>{name}</text>
			</g>
		{/each}
		{#each Y as name, j (name)}
			<g class="pill city" class:hot={traced !== null && f[traced] === j} style="opacity:{midFade}">
				<rect x={CX[1] - PW / 2} y={yY(j) - PH / 2} width={PW} height={PH} rx="13" />
				<text x={CX[1]} y={yY(j) + 4.5}>{name}</text>
			</g>
		{/each}
		{#each Z as name, k (name)}
			<g class="pill country" class:hot={traced !== null && gf[traced] === k}>
				<rect x={CX[2] - PW / 2} y={yZ(k) - PH / 2} width={PW} height={PH} rx="13" />
				<text x={CX[2]} y={yZ(k) + 4.5}>{name}</text>
			</g>
		{/each}

		{#if step === 3 && travel.current < 2}
			{#each X as _, i (i)}
				{@const p = tokenPos(i, travel.current)}
				<circle cx={p[0]} cy={p[1]} r="6" class="token" />
			{/each}
		{/if}
	</Svg>
	<p class="readout" aria-live="polite">{@html renderMathInText(readout)}</p>
	<Controls>
		<StepControls bind:step count={5} {labels} interval={2600} />
	</Controls>
</div>

<style>
	.comp > :global(svg) {
		padding: 0.8rem 0.4rem 0;
	}
	.cap {
		font-family: var(--font-ui);
		font-size: 10.5px !important;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		fill: var(--gold) !important;
		text-anchor: middle;
	}
	.arr {
		fill: none;
		stroke-width: 1.7;
		transition: stroke 0.2s;
	}
	.arr.f {
		stroke: var(--blue);
	}
	.arr.g {
		stroke: var(--violet);
	}
	.arr.h {
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.arr.hot {
		stroke: var(--gold-bright);
		stroke-width: 2.8;
	}
	.mapname {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 18px !important;
		text-anchor: middle;
	}
	.mapname.f {
		fill: var(--blue) !important;
	}
	.mapname.g {
		fill: var(--violet) !important;
	}
	.mapname.h {
		fill: var(--gold-bright) !important;
	}
	.pill rect {
		fill: rgba(20, 28, 52, 0.95);
		stroke: rgba(200, 192, 170, 0.4);
		stroke-width: 1.1;
		transition: all 0.2s;
	}
	.pill text {
		font-family: var(--font-ui);
		font-size: 11.5px !important;
		font-weight: 600;
		fill: var(--ink) !important;
		text-anchor: middle;
		pointer-events: none;
	}
	.pill.person {
		cursor: pointer;
	}
	.pill.person:focus {
		outline: none;
	}
	.pill.person:hover rect,
	.pill.person:focus-visible rect {
		stroke: var(--gold);
	}
	.pill.hot rect {
		fill: #f2d08f;
		stroke: #fff6dc;
	}
	.pill.hot text {
		fill: #120d05 !important;
	}
	.token {
		fill: var(--gold-bright);
		stroke: #fff;
		stroke-width: 1.2;
		filter: drop-shadow(0 0 6px rgba(242, 208, 143, 0.9));
	}
	.readout {
		margin: 0.4rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
</style>
