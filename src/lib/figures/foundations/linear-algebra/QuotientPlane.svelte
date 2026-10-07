<script lang="ts">
	// ℝ² modulo the line W = span{(2, 1)}: each element of the quotient is a
	// whole line parallel to W. Every such line crosses the horizontal axis
	// exactly once, so the quotient is "a copy of a line": ℝ²/W ≅ ℝ.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Handle from './Handle.svelte';
	import { makeView, clipLine, snap2, clamp, tfmt, add, mul, C, easeInOut, type V2 } from './geom';

	const view = makeView(520, 340, 40, 260, 170);
	let svg = $state<SVGSVGElement>();

	const W: V2 = [2, 1];
	// f(x, y) = x − 2y vanishes exactly on W, so it labels each parallel line
	const f = (v: V2) => v[0] - 2 * v[1];

	let p = $state<V2>([-1, 1]);
	let q = $state<V2>([3, -1]);
	let raf = 0;
	// on narrow plates the drawing shrinks, so its labels grow
	let cw = $state(800);
	const k = $derived(cw < 520 ? 1.45 : 1);
	onMount(() => () => cancelAnimationFrame(raf));

	const pq = $derived(add(p, q));
	const same = $derived(Math.abs(f(p) - f(q)) < 1e-9);

	const lineAt = (c: number) => clipLine(view, [c, 0], W, 0);
	const family = Array.from({ length: 61 }, (_, i) => (i - 30) * 0.5).map((c) => ({ c, l: lineAt(c) }));
	const seg = (l: [V2, V2] | null) =>
		l ? { x1: view.X(l[0][0]), y1: view.Y(l[0][1]), x2: view.X(l[1][0]), y2: view.Y(l[1][1]) } : null;

	const lp = $derived(seg(lineAt(f(p))));
	const lq = $derived(seg(lineAt(f(q))));
	const lpq = $derived(seg(lineAt(f(pq))));
	const lw = seg(lineAt(0))!;

	const lim = (v: V2): V2 => [clamp(v[0], view.xmin + 0.4, view.xmax - 0.4), clamp(v[1], view.ymin + 0.4, view.ymax - 0.4)];
	const setP = (w: V2) => (p = snap2(lim(w), 0.5));
	const setQ = (w: V2) => (q = snap2(lim(w), 0.5));

	function slide() {
		// move p along its own coset: the coset (the violet line) does not change
		cancelAnimationFrame(raf);
		const from: V2 = [...p];
		// slide by a multiple of (2, 1) that keeps p inside the canvas, so it stays on its line
		const inside = (v: V2) => lim(v)[0] === v[0] && lim(v)[1] === v[1];
		const steps = [1.5, -1.5, 1, -1, 0.5, -0.5].map((k) => add(from, mul(k, W)));
		const to = steps.find(inside) ?? from;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const dur = reduced ? 0 : 1100;
		const t0 = performance.now();
		const step = (now: number) => {
			const u = dur ? Math.min(1, (now - t0) / dur) : 1;
			const e = easeInOut(u);
			p = [from[0] + (to[0] - from[0]) * e, from[1] + (to[1] - from[1]) * e];
			if (u < 1) raf = requestAnimationFrame(step);
			else p = snap2(to, 0.5);
		};
		raf = requestAnimationFrame(step);
	}
	const xs = (c: number) => view.X(c);
</script>

<div class="qp" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {view.w} {view.h}" maxHeight={380} bind:svg label="The plane filled with parallel lines, all parallel to a teal line W through the origin. Two draggable points p and q pick out a violet and a blue line; their sum p plus q picks out a gold line. Each line meets the horizontal axis exactly once.">
		<!-- the family of cosets -->
		{#each family as o (o.c)}
			{@const s = seg(o.l)}
			{#if s}<line {...s} class="fam" />{/if}
		{/each}
		<!-- the transversal: the horizontal axis, a faithful copy of ℝ²/W -->
		<line x1="0" y1={view.Y(0)} x2={view.w} y2={view.Y(0)} class="axis" />
		<line x1={view.X(0)} y1="0" x2={view.X(0)} y2={view.h} class="axis faint" />

		<line {...lw} class="w-halo" />
		<line {...lw} class="w" />

		{#if lpq}<line {...lpq} class="c-halo gold" /><line {...lpq} class="c gold" />{/if}
		{#if lq}<line {...lq} class="c-halo blue" /><line {...lq} class="c blue" />{/if}
		{#if lp}<line {...lp} class="c-halo violet" /><line {...lp} class="c violet" />{/if}

		<!-- where each coset crosses the axis: its "address" in ℝ²/W -->
		<circle cx={xs(f(pq))} cy={view.Y(0)} r="5" class="foot gold" />
		<circle cx={xs(f(q))} cy={view.Y(0)} r="5" class="foot blue" />
		<circle cx={xs(f(p))} cy={view.Y(0)} r="5" class="foot violet" />

		<SvgTeX x={view.X(4.6)} y={view.Y(2.75)} tex={'W'} color={C.teal} size={17 * k} w={30 * k} />

		<circle cx={view.X(pq[0])} cy={view.Y(pq[1])} r="5" class="pt gold" />
		<!-- just below the gold line (which rises to the right), so the label does not sit on it -->
		<SvgTeX x={view.X(pq[0]) - 18 * k} y={view.Y(pq[1]) + 28 * k} tex={'\\mathbf p+\\mathbf q'} color={C.gold} size={14 * k} w={60 * k} />

		<Handle {view} {svg} pos={q} color={C.blue} label="the point q" onmove={setQ} />
		<Handle {view} {svg} pos={p} color={C.violet} label="the point p" onmove={setP} />
		<SvgTeX x={view.X(p[0]) - 16 * k} y={view.Y(p[1]) - 16 * k} tex={'\\mathbf p'} color={C.violet} size={16 * k} w={24 * k} />
		<SvgTeX x={view.X(q[0]) + 16 * k} y={view.Y(q[1]) + 16 * k} tex={'\\mathbf q'} color={C.blue} size={16 * k} w={24 * k} />
	</Svg>
</div>

<div class="read ui">
	<div class="eqs">
		<span><TeX tex={`\\textcolor{${C.violet}}{\\mathbf p + W}\\ \\text{meets the axis at}\\ {${tfmt(f(p))}}`} /></span>
		<span><TeX tex={`\\textcolor{${C.blue}}{\\mathbf q + W}\\ \\text{at}\\ {${tfmt(f(q))}}`} /></span>
		<span><TeX tex={`\\textcolor{${C.gold}}{(\\mathbf p + \\mathbf q) + W}\\ \\text{at}\\ {${tfmt(f(p))}} + ${f(q) < 0 ? `(${tfmt(f(q))})` : tfmt(f(q))} = ${tfmt(f(pq))}`} /></span>
	</div>
	<p>
		{#if same}
			<strong class="g">Same line!</strong> <TeX tex={'\\mathbf p'} /> and <TeX tex={'\\mathbf q'} /> differ by
			<TeX tex={`(${tfmt(p[0] - q[0])},\\ ${tfmt(p[1] - q[1])})`} />, which lies in <TeX tex={'W'} />, so
			<TeX tex={'\\mathbf p + W = \\mathbf q + W'} />: in the quotient they are one and the same element.
		{:else}
			Each line parallel to <TeX tex={'W'} /> is <em>one</em> element of <TeX tex={'\\mathbb R^2/W'} />, and each crosses the
			horizontal axis exactly once, at <TeX tex={'x - 2y'} />. Adding lines adds those crossing points, so the quotient
			behaves exactly like the number line: <TeX tex={'\\mathbb R^2/W \\cong \\mathbb R'} />.
		{/if}
	</p>
</div>
<Controls>
	<Button variant="subtle" onclick={slide}>Slide p along its line</Button>
	<Button variant="subtle" onclick={() => (q = snap2(lim(add(p, [2, 1])), 0.5))}>Put q on p’s line</Button>
</Controls>

<style>
	.qp {
		padding: 0.9rem 1rem 0.2rem;
	}
	.fam {
		stroke: rgba(242, 208, 143, 0.09);
		stroke-width: 1;
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.5);
		stroke-width: 1.4;
	}
	.axis.faint {
		stroke: rgba(235, 229, 213, 0.12);
		stroke-width: 1;
	}
	.w {
		stroke: var(--teal);
		stroke-width: 2.6;
	}
	.w-halo {
		stroke: var(--teal);
		stroke-width: 11;
		opacity: 0.16;
	}
	.c {
		stroke-width: 2.4;
	}
	.c-halo {
		stroke-width: 10;
		opacity: 0.15;
	}
	.c.violet,
	.c-halo.violet {
		stroke: var(--violet);
	}
	.c.blue,
	.c-halo.blue {
		stroke: var(--blue);
	}
	.c.gold,
	.c-halo.gold {
		stroke: var(--gold-bright);
	}
	.foot {
		stroke: #0b1122;
		stroke-width: 1.5;
	}
	.foot.violet,
	.pt.violet {
		fill: var(--violet);
	}
	.foot.blue {
		fill: var(--blue);
	}
	.foot.gold,
	.pt.gold {
		fill: var(--gold-bright);
	}
	.read {
		padding: 0.3rem 1.3rem 0.5rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.eqs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.4rem;
		justify-content: center;
		color: var(--ink);
	}
	.read p {
		margin: 0.6rem 0 0;
		min-height: 3.2em;
	}
	.g {
		color: var(--gold-bright);
	}
</style>
