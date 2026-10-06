<script lang="ts">
	// A square of functions ℤ → ℤ. It commutes when both roads from the
	// top-left corner to the bottom-right corner give the same answer, for every x.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	let x = $state(3);
	let kId = $state<'p2' | 'p1' | 'dbl'>('p2');
	const t = new Tween(2, { duration: 1800, easing: cubicInOut });

	const ks = {
		p2: { tex: String.raw`y\mapsto y+2`, fn: (y: number) => y + 2, formula: String.raw`2x+2` },
		p1: { tex: String.raw`y\mapsto y+1`, fn: (y: number) => y + 1, formula: String.raw`2x+1` },
		dbl: { tex: String.raw`y\mapsto 2y`, fn: (y: number) => 2 * y, formula: String.raw`4x` }
	} as const;
	const k = $derived(ks[kId]);

	const f = (v: number) => v + 1;
	const g = (v: number) => 2 * v;
	const h = (v: number) => 2 * v;

	const A: [number, number] = [90, 64];
	const B: [number, number] = [286, 64];
	const C: [number, number] = [90, 236];
	const D: [number, number] = [286, 236];

	const top = $derived(g(f(x)));
	const bottom = $derived(k.fn(h(x)));
	const agreeHere = $derived(top === bottom);
	const commutes = $derived(kId === 'p2');

	function lerp(p: [number, number], q: [number, number], s: number): [number, number] {
		return [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
	}
	const t1 = $derived(t.current <= 1 ? lerp(A, B, t.current) : lerp(B, D, t.current - 1));
	const t2 = $derived(t.current <= 1 ? lerp(A, C, t.current) : lerp(C, D, t.current - 1));
	const v1 = $derived(t.current < 1 ? x : t.current < 2 ? f(x) : top);
	const v2 = $derived(t.current < 1 ? x : t.current < 2 ? h(x) : bottom);
	const arrived = $derived(t.current >= 1.999);

	function run() {
		t.set(0, { duration: 0 });
		t.set(2, { duration: prefersReducedMotion.current ? 0 : 1800 });
	}
	const num = (v: number) => (v < 0 ? `−${-v}` : String(v));

	const readout = $derived.by(() => {
		const general = String.raw`Top road: \(g(f(x)) = 2(x+1) = 2x+2\). Bottom road: \(k(h(x)) = ${k.formula}\).`;
		if (commutes) return { main: general, verdict: String.raw`The formulas agree for every \(x\): the square commutes, \(g\circ f = k\circ h\).`, ok: true };
		if (agreeHere)
			return {
				main: general,
				verdict: String.raw`At \(x=${x}\) the two roads happen to agree — but try \(x=0\): \(2\) versus \(${k.fn(0)}\). Agreeing at one input is not enough; the square does not commute.`,
				ok: false
			};
		return { main: general, verdict: String.raw`At \(x=${x}\) the roads end at \(${top}\) and \(${bottom}\): the square does not commute.`, ok: false };
	});
</script>

<div class="cs">
	<Svg viewBox="0 0 400 300" maxHeight={380} label="A commutative square: four copies of the integers joined by four functions">
		<!-- arrows -->
		<line x1={A[0] + 28} y1={A[1]} x2={B[0] - 30} y2={B[1]} class="arr top" marker-end="url(#arrow-blue)" />
		<line x1={B[0]} y1={B[1] + 26} x2={D[0]} y2={D[1] - 28} class="arr top" marker-end="url(#arrow-blue)" />
		<line x1={A[0]} y1={A[1] + 26} x2={C[0]} y2={C[1] - 28} class="arr bot" marker-end="url(#arrow-violet)" />
		<line x1={C[0] + 28} y1={C[1]} x2={D[0] - 30} y2={D[1]} class="arr bot" marker-end="url(#arrow-violet)" />
		<SvgTeX x={(A[0] + B[0]) / 2} y={A[1] - 22} tex={String.raw`f:\ x\mapsto x+1`} size={15} color="var(--blue)" w={160} h={24} />
		<SvgTeX x={B[0] + 12} y={150} tex={String.raw`g:\ x\mapsto 2x`} size={15} color="var(--blue)" w={110} h={24} anchor="start" />
		<SvgTeX x={A[0] - 12} y={150} tex={String.raw`h:\ x\mapsto 2x`} size={15} color="var(--violet)" w={110} h={24} anchor="end" />
		<SvgTeX x={(C[0] + D[0]) / 2} y={C[1] + 26} tex={`k:\\ ${k.tex}`} size={15} color="var(--violet)" w={170} h={24} />

		<!-- corners -->
		{#each [A, B, C, D] as P, i (i)}
			<circle cx={P[0]} cy={P[1]} r="24" class="corner" class:goal={i === 3 && arrived} class:ok={i === 3 && arrived && agreeHere} class:bad={i === 3 && arrived && !agreeHere} />
			<SvgTeX x={P[0]} y={P[1]} tex={String.raw`\Z`} size={18} color="var(--ink-bright)" w={30} h={30} />
		{/each}

		<!-- travelling values -->
		{#if t.current > 0.001 && !arrived}
			<g class="tok one">
				<rect x={t1[0] - 22} y={t1[1] - 13} width="44" height="26" rx="13" />
				<text x={t1[0]} y={t1[1] + 4.5}>{num(v1)}</text>
			</g>
			<g class="tok two">
				<rect x={t2[0] - 22} y={t2[1] - 13} width="44" height="26" rx="13" />
				<text x={t2[0]} y={t2[1] + 4.5}>{num(v2)}</text>
			</g>
		{/if}
		{#if arrived}
			<g class="tok one fixed">
				<rect x={D[0] + 30} y={D[1] - 36} width="50" height="26" rx="13" />
				<text x={D[0] + 55} y={D[1] - 18.5}>{num(top)}</text>
			</g>
			<g class="tok two fixed">
				<rect x={D[0] + 30} y={D[1] + 10} width="50" height="26" rx="13" />
				<text x={D[0] + 55} y={D[1] + 27.5}>{num(bottom)}</text>
			</g>
			<text x={D[0] + 92} y={D[1] + 5} class="eqsign" class:ok={agreeHere}>{agreeHere ? '=' : '≠'}</text>
		{/if}
		<g class="tok start">
			<rect x={A[0] - 78} y={A[1] - 13} width="44" height="26" rx="13" />
			<text x={A[0] - 56} y={A[1] + 4.5}>{num(x)}</text>
		</g>
	</Svg>

	<div class="readout" aria-live="polite">
		<div class="main">{@html renderMathInText(readout.main)}</div>
		<div class="verdict" class:ok={readout.ok}>{@html renderMathInText(readout.verdict)}</div>
	</div>

	<Controls>
		<Stepper bind:value={x} min={-5} max={5} label="starting number x" onchange={run} />
		<div class="kpick" role="radiogroup" aria-label="Choose the bottom map k">
			<span class="pl ui">bottom map k:</span>
			{#each Object.entries(ks) as [id, kk] (id)}
				<button class="kb" class:on={id === kId} role="radio" aria-checked={id === kId} onclick={() => ((kId = id as typeof kId), run())}>{@html tex(kk.tex)}</button>
			{/each}
		</div>
		<Button variant="gold" onclick={run}>Send x down both roads</Button>
	</Controls>
</div>

<style>
	.cs > :global(svg) {
		padding: 0.8rem 0.4rem 0;
	}
	.arr {
		stroke-width: 2;
	}
	.arr.top {
		stroke: var(--blue);
	}
	.arr.bot {
		stroke: var(--violet);
	}
	.corner {
		fill: rgba(20, 28, 52, 0.95);
		stroke: rgba(200, 192, 170, 0.45);
		stroke-width: 1.4;
		transition: all 0.3s;
	}
	.corner.ok {
		stroke: var(--green);
		stroke-width: 2.6;
		filter: drop-shadow(0 0 10px rgba(132, 217, 162, 0.8));
	}
	.corner.bad {
		stroke: var(--rose);
		stroke-width: 2.6;
		filter: drop-shadow(0 0 10px rgba(242, 141, 182, 0.8));
	}
	.tok rect {
		stroke-width: 1.4;
	}
	.tok text {
		font-family: var(--font-ui);
		font-size: 12.5px !important;
		font-weight: 700;
		text-anchor: middle;
	}
	.tok.one rect {
		fill: #102347;
		stroke: var(--blue);
	}
	.tok.one text {
		fill: #d6e6ff !important;
	}
	.tok.two rect {
		fill: #1f1a45;
		stroke: var(--violet);
	}
	.tok.two text {
		fill: #e4dfff !important;
	}
	.tok.start rect {
		fill: #f2d08f;
		stroke: #fff6dc;
	}
	.tok.start text {
		fill: #120d05 !important;
	}
	.eqsign {
		font-family: var(--font-ui);
		font-size: 20px !important;
		font-weight: 700;
		fill: var(--rose) !important;
	}
	.eqsign.ok {
		fill: var(--green) !important;
	}
	.readout {
		padding: 0.5rem 1.2rem 0.8rem;
		text-align: center;
		min-height: 4.6rem;
	}
	.main {
		font-size: 0.95rem;
		color: var(--ink-dim);
	}
	.verdict {
		font-size: 0.98rem;
		color: var(--rose);
		margin-top: 0.25rem;
	}
	.verdict.ok {
		color: var(--green);
	}
	.kpick {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
	}
	.pl {
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.kb {
		padding: 0.3rem 0.65rem;
		min-height: 2.1rem;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--ink);
		cursor: pointer;
		font-size: 0.9rem;
	}
	.kb.on {
		border-color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.22);
		color: var(--ink-bright);
	}
</style>
