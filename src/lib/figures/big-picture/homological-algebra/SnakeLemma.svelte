<script lang="ts">
	// Figure: the snake lemma as a diagram chase, with real numbers.
	// Rows: 0 → ℤ —×m→ ℤ —mod m→ ℤ/m → 0 (twice); vertical maps: multiply by n.
	// The connecting map δ: ker c → coker a is found by lifting, pushing down,
	// and pulling back — the gold trail.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { animate, lerp, type Pt } from '../categories/diagram';
	import { gcd } from './abelian';
	import { untrack } from 'svelte';

	let m = $state(4);
	let n = $state(6);
	let step = $state(0);
	let xi = $state(1); // index into ker c
	const d = $derived(gcd(m, n));
	const kerC = $derived(Array.from({ length: d }, (_, k) => (k * m) / d));
	const x = $derived(kerC[Math.min(xi, kerC.length - 1)] ?? 0);
	const y = $derived(x);
	const y2 = $derived(x + m);
	const by = $derived(n * y);
	const by2 = $derived(n * y2);
	const z = $derived(by / m);
	const z2 = $derived(by2 / m);
	const delta = $derived(((z % n) + n) % n);

	$effect(() => {
		// keep the chosen element valid when m or n change
		if (xi >= d) xi = d - 1;
	});

	// layout. On a narrow plate the columns move closer together and the snake hugs them
	// (a narrower drawing is scaled down less), and the labels grow (k ≥ 1).
	let width = $state(700);
	const narrow = $derived(width > 0 && width < 520);
	const k = $derived(narrow ? Math.min(1.45, Math.max(1, (0.9 * 540) / width)) : 1);
	const kb = $derived(Math.min(k, 1.25)); // node boxes
	const X = $derived(narrow ? { A: 150, B: 290, C: 430 } : { A: 230, B: 400, C: 570 });
	const Y = { ker: 66, top: 186, bot: 346, cok: 466 };
	const bulge = $derived(narrow ? 150 : 160); // how far the snake swings out beside the columns
	const P = $derived({
		kerA: [X.A, Y.ker],
		kerB: [X.B, Y.ker],
		kerC: [X.C, Y.ker],
		A: [X.A, Y.top],
		B: [X.B, Y.top],
		C: [X.C, Y.top],
		A2: [X.A, Y.bot],
		B2: [X.B, Y.bot],
		C2: [X.C, Y.bot],
		cokA: [X.A, Y.cok],
		cokB: [X.B, Y.cok],
		cokC: [X.C, Y.cok]
	} as Record<string, Pt>);

	// the chase: which node the token sits on after each step
	const route: string[] = ['kerC', 'kerC', 'C', 'B', 'B2', 'A2', 'cokA', 'cokA'];
	let tokPos = $state<Pt>([570, Y.ker]);
	let trail = $state(0); // how many trail segments are lit (0..5)
	let cancel: (() => void) | null = null;
	let prevStep = 0;
	$effect(() => {
		const s = step;
		cancel?.();
		// (reading P here also re-places the token when the layout changes)
		const from = P[route[Math.min(prevStep, route.length - 1)]];
		const to = P[route[Math.min(s, route.length - 1)]];
		const goal = Math.max(0, Math.min(5, s - 1));
		const t0 = untrack(() => trail);
		if (s === prevStep + 1 && s <= 6) {
			cancel = animate(750, (t) => {
				tokPos = lerp(from, to, t);
				trail = t0 + (goal - t0) * t;
			});
		} else {
			tokPos = to;
			trail = goal;
		}
		prevStep = s;
	});
	const trailPts = $derived.by(() => {
		const nodes = ['kerC', 'C', 'B', 'B2', 'A2', 'cokA'].map((k) => P[k]);
		const segs = [];
		for (let k = 0; k < 5; k++) {
			const frac = Math.max(0, Math.min(1, trail - k));
			if (frac <= 0) break;
			segs.push({ a: nodes[k], b: lerp(nodes[k], nodes[k + 1], frac) });
		}
		return segs;
	});

	function seg(a: Pt, b: Pt, gapA = 30, gapB = 30) {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const L = Math.hypot(dx, dy) || 1;
		return `M ${a[0] + (dx / L) * gapA} ${a[1] + (dy / L) * gapA} L ${b[0] - (dx / L) * gapB} ${b[1] - (dy / L) * gapB}`;
	}

	const tokenValue = $derived(
		[`${x}`, `${x}`, `${x}`, `${y}`, `${by}`, `${z}`, `[${delta}]`, `[${delta}]`][Math.min(step, 7)]
	);

	const explain = $derived.by((): { tex: string; text: string } => {
		switch (step) {
			case 0:
				return {
					tex: `0\\to\\Z\\xrightarrow{\\times ${m}}\\Z\\xrightarrow{\\bmod ${m}}\\Z/${m}\\to 0`,
					text: `Both rows are exact, and every square commutes (multiplying by ${n} commutes with everything). Kernels on top, cokernels below.`
				};
			case 1:
				return {
					tex: `x = ${x}\\in\\ker c:\\quad c(x) = ${n}\\cdot ${x} = ${n * x} \\equiv 0 \\pmod{${m}}`,
					text: 'Start with an element of the kernel of c — something the right-hand vertical map crushes to zero.'
				};
			case 2:
				return {
					tex: `\\text{lift: } y = ${y}\\in B,\\qquad p(y) = ${y} \\bmod ${m} = ${x}`,
					text: 'The top row is exact at C, so p is onto: pick some y in B that maps to x. (This is a choice!)'
				};
			case 3:
				return {
					tex: `\\text{push down: } b(y) = ${n}\\cdot ${y} = ${by}\\in B'`,
					text: 'Apply the middle vertical map b.'
				};
			case 4:
				return {
					tex: `p'(${by}) = ${by}\\bmod ${m} = 0 \\;\\Rightarrow\\; ${by} = i'(z) = ${m}z,\\; z = ${z}`,
					text: 'Because the square commutes, p′(b(y)) = c(p(y)) = c(x) = 0. Exactness of the bottom row says b(y) comes from a unique z in A′.'
				};
			case 5:
				return {
					tex: `\\delta(${x}) = [${z}] = ${delta}\\in\\coker a = \\Z/${n}`,
					text: 'Finally pass to the cokernel of a. That class is δ(x): the snake has crossed from the top right to the bottom left.'
				};
			case 6:
				return {
					tex: `y' = ${y2}:\\; b(y') = ${by2} = ${m}\\cdot ${z2},\\; [${z2}] = [${z}] = ${delta}`,
					text: `A different lift differs by something from A, which changes z by a multiple of ${n} — invisible in coker a. So δ is well defined.`
				};
			default:
				return {
					tex: `0\\to 0\\to\\Z/${d}\\xrightarrow{\\;\\delta\\;}\\Z/${n}\\xrightarrow{\\times ${m}}\\Z/${n}\\to\\Z/${d}\\to 0`,
					text: `The six-term snake sequence is exact. Here δ sends ${kerC.map((v) => `${v} ↦ ${((((n * v) / m) % n) + n) % n}`).join(', ')}.`
				};
		}
	});

	const labels = ['The diagram', 'Pick x in ker c', 'Lift to B', 'Push down by b', 'Pull back to A′', 'Read off δ(x)', 'Another lift', 'The exact sequence'];
	const hl = (k: string) => route[Math.min(step, route.length - 1)] === k && step > 0;
</script>

<div class="snake" bind:clientWidth={width}>
	<Svg viewBox={narrow ? `20 ${20 - 12 * (k - 1)} 540 ${500 + 24 * (k - 1)}` : '40 20 700 500'} maxHeight={560} label="The snake lemma diagram: two exact rows, vertical maps, kernels above and cokernels below, and the connecting map winding from the top right to the bottom left">
		<!-- the classic snake: from ker c, round the right, across the middle, to coker a -->
		<path
			d="M {X.C + 36 + 12 * (kb - 1)} {Y.ker} C {X.C + bulge} {Y.ker}, {X.C + bulge} 266, {X.C + 40} 266 L {X.A - 40} 266 C {X.A - bulge} 266, {X.A - bulge} {Y.cok}, {X.A - 36 - 12 * (kb - 1)} {Y.cok}"
			class="snake-path"
			class:lit={step >= 5}
			marker-end={step >= 5 ? 'url(#arrow-gold)' : undefined}
		/>
		{#if step >= 5}
			<SvgTeX x={narrow ? X.C + 96 : 700} y={narrow ? 232 : 170} tex={'\\delta'} size={18 * k} color="var(--gold-bright)" w={30 * k} h={26 * k} />
		{/if}

		<!-- horizontal arrows -->
		<path d={seg(P.kerA, P.kerB, 38 + 12 * (kb - 1), 38 + 12 * (kb - 1))} class="ar faint" marker-end="url(#arrow-dim)" />
		<path d={seg(P.kerB, P.kerC, 38 + 12 * (kb - 1), 38 + 12 * (kb - 1))} class="ar faint" marker-end="url(#arrow-dim)" />
		<path d={seg(P.A, P.B, 30, 30)} class="ar" marker-end="url(#arrow-ivory)" />
		<path d={seg(P.B, P.C, 30, 34)} class="ar" marker-end="url(#arrow-ivory)" />
		<path d="M {X.C + 34} {Y.top} L {X.C + (narrow ? 62 : 92)} {Y.top}" class="ar" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={X.C + (narrow ? 78 : 114)} y={Y.top} tex="0" size={16 * k} w={20 * k} h={22 * k} />
		<SvgTeX x={X.A - (narrow ? 78 : 120)} y={Y.bot} tex="0" size={16 * k} w={20 * k} h={22 * k} />
		<path d="M {X.A - (narrow ? 66 : 106)} {Y.bot} L {X.A - 34} {Y.bot}" class="ar" marker-end="url(#arrow-ivory)" />
		<path d={seg(P.A2, P.B2, 30, 30)} class="ar" marker-end="url(#arrow-ivory)" />
		<path d={seg(P.B2, P.C2, 30, 34)} class="ar" marker-end="url(#arrow-ivory)" />
		<path d={seg(P.cokA, P.cokB, 40 + 12 * (kb - 1), 40 + 12 * (kb - 1))} class="ar faint" marker-end="url(#arrow-dim)" />
		<path d={seg(P.cokB, P.cokC, 40 + 12 * (kb - 1), 40 + 12 * (kb - 1))} class="ar faint" marker-end="url(#arrow-dim)" />

		{#each [[X.A, X.B, Y.top - (narrow ? 38 : 16), `i = \\times ${m}`], [X.B, X.C, Y.top - (narrow ? 38 : 16), `p = \\text{mod }${m}`], [X.A, X.B, Y.bot + (narrow ? 38 : 18), `i' = \\times ${m}`], [X.B, X.C, Y.bot + (narrow ? 38 : 18), `p' = \\text{mod }${m}`]] as [x0, x1, yy, t], i (i)}
			<SvgTeX x={(Number(x0) + Number(x1)) / 2} y={Number(yy)} tex={String(t)} size={13 * k} color="var(--ink-dim)" w={100 * k} h={20 * k} />
		{/each}

		<!-- vertical arrows -->
		{#each ['A', 'B', 'C'] as c (c)}
			{@const xx = X[c as 'A' | 'B' | 'C']}
			<path d="M {xx} {Y.ker + 20} L {xx} {Y.top - 24}" class="ar faint" marker-end="url(#arrow-dim)" />
			<path d="M {xx} {Y.top + 24} L {xx} {Y.bot - 24}" class="ar vert" marker-end="url(#arrow-blue)" />
			<path d="M {xx} {Y.bot + 24} L {xx} {Y.cok - 22}" class="ar faint" marker-end="url(#arrow-dim)" />
			<SvgTeX x={xx + 34 + 8 * (k - 1)} y={(Y.top + Y.bot) / 2 - 22} tex={`${c.toLowerCase()} = \\times ${n}`} size={13 * k} color="var(--blue)" w={80 * k} h={20 * k} />
		{/each}

		<!-- the chase trail -->
		{#each trailPts as s, i (i)}
			<line x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} class="trail-halo" />
			<line x1={s.a[0]} y1={s.a[1]} x2={s.b[0]} y2={s.b[1]} class="trail" />
		{/each}

		<!-- nodes -->
		{#each [['kerA', '0'], ['kerB', '0'], ['kerC', `\\ker c\\cong\\Z/${d}`], ['A', '\\Z'], ['B', '\\Z'], ['C', `\\Z/${m}`], ['A2', '\\Z'], ['B2', '\\Z'], ['C2', `\\Z/${m}`], ['cokA', `\\Z/${n}`], ['cokB', `\\Z/${n}`], ['cokC', `\\Z/${d}`]] as [key, t] (key)}
			{@const p = P[key]}
			{@const small = key.startsWith('ker') || key.startsWith('cok')}
			{@const hw = (small ? 44 : 30) * kb}
			<g transform="translate({p[0]} {p[1]})">
				<rect x={-hw} y={-18 * kb} width={2 * hw} height={36 * kb} rx="11" class="node" class:small class:hl={hl(key)} />
				<SvgTeX x={0} y={0} tex={t} size={(small ? 13 : 16) * k} color={small ? 'var(--ink-dim)' : 'var(--ink-bright)'} w={2 * hw - 2} h={30 * k} />
			</g>
		{/each}
		<!-- coker a sits below its node: the snake arrives from the left -->
		{#if narrow}
			<SvgTeX x={X.A} y={Y.ker - 34} tex={'\\ker a'} size={12 * k} color="var(--ink-faint)" w={60 * k} h={18 * k} />
		{:else}
			<SvgTeX x={X.A - 66} y={Y.ker} tex={'\\ker a'} size={12} color="var(--ink-faint)" w={50} h={18} />
		{/if}
		<SvgTeX x={X.A} y={Y.cok + 32 + 2 * (k - 1)} tex={'\\coker a'} size={12 * k} color="var(--ink-faint)" w={70 * k} h={18 * k} />
		<SvgTeX x={X.A - 52 - 6 * (k - 1)} y={Y.top} tex="A" size={13 * k} color="var(--ink-faint)" w={20 * k} h={18 * k} />
		<SvgTeX x={X.A - 52 - 6 * (k - 1)} y={Y.bot - 22} tex="A'" size={13 * k} color="var(--ink-faint)" w={20 * k} h={18 * k} />
		<!-- B, B' sit between the rows, clear of the labels on the horizontal arrows -->
		<SvgTeX x={X.B + 40} y={Y.top + 28} tex="B" size={13 * k} color="var(--ink-faint)" w={20 * k} h={18 * k} />
		<SvgTeX x={X.B + 40} y={Y.bot - 28} tex="B'" size={13 * k} color="var(--ink-faint)" w={20 * k} h={18 * k} />
		<SvgTeX x={X.C + 46} y={Y.top - 26} tex="C" size={13 * k} color="var(--ink-faint)" w={20 * k} h={18 * k} />
		<SvgTeX x={X.C + 46} y={Y.bot + 26} tex="C'" size={13 * k} color="var(--ink-faint)" w={20 * k} h={18 * k} />

		<!-- the token (above its node on a phone, where the arrow labels are wider) -->
		{#if step >= 1}
			<g transform={narrow ? `translate(${tokPos[0]} ${tokPos[1] - 36})` : `translate(${tokPos[0] + 30} ${tokPos[1] - 24})`}>
				<rect x={(-6 - tokenValue.length * 4) * k} y={-12 * k} width={(12 + tokenValue.length * 8) * k} height={24 * k} rx={12 * k} class="token" />
				<text text-anchor="middle" dy={5 * k} class="tok-t" style="font-size:{13 * k}px">{tokenValue}</text>
			</g>
		{/if}
		{#if step >= 6}
			<g transform="translate({P.A2[0] - 34 - 6 * (k - 1)} {P.A2[1] + 26 + 4 * (k - 1)})">
				<rect x={(-6 - String(z2).length * 4) * k} y={-12 * k} width={(12 + String(z2).length * 8) * k} height={24 * k} rx={12 * k} class="token alt" />
				<text text-anchor="middle" dy={5 * k} class="tok-t" style="font-size:{13 * k}px">{z2}</text>
			</g>
		{/if}
	</Svg>

	<div class="explain">
		<TeX tex={explain.tex} display />
		<p class="ui">{explain.text}</p>
	</div>

	<Controls>
		<StepControls bind:step count={labels.length} {labels} interval={2400} />
	</Controls>
	<Controls>
		<Stepper bind:value={m} min={2} max={9} label="m" />
		<Stepper bind:value={n} min={2} max={9} label="n" />
		<span class="lbl ui">start at <TeX tex={'x\\in\\ker c'} />:</span>
		<Segmented bind:value={xi} label="Element of ker c" options={kerC.map((v, k) => ({ value: k, label: String(v) }))} />
	</Controls>
</div>

<style>
	.snake {
		padding-top: 0.6rem;
	}
	.ar {
		fill: none;
		stroke: #ebe5d5;
		stroke-width: 1.8;
	}
	.ar.faint {
		stroke: rgba(139, 134, 118, 0.7);
		stroke-width: 1.4;
	}
	.ar.vert {
		stroke: #74a9ff;
	}
	.node {
		fill: rgba(18, 26, 47, 0.95);
		stroke: rgba(235, 229, 213, 0.32);
		stroke-width: 1.2;
		transition: all 0.3s var(--ease);
	}
	.node.small {
		fill: rgba(10, 15, 29, 0.9);
		stroke: rgba(139, 134, 118, 0.4);
		stroke-dasharray: 3 3;
	}
	.node.hl {
		stroke: #f2d08f;
		stroke-width: 2;
		stroke-dasharray: none;
		filter: url(#glow);
	}
	.snake-path {
		fill: none;
		stroke: rgba(242, 208, 143, 0.18);
		stroke-width: 2;
		stroke-dasharray: 5 6;
		transition: all 0.6s var(--ease);
	}
	.snake-path.lit {
		stroke: #f2d08f;
		stroke-width: 3;
		stroke-dasharray: none;
		filter: url(#glow);
	}
	/* no SVG filters here: a filter on an axis-aligned line has an empty filter region */
	.trail {
		stroke: #fff1d0;
		stroke-width: 3.2;
		stroke-linecap: round;
	}
	.trail-halo {
		stroke: #f2d08f;
		stroke-width: 12;
		stroke-linecap: round;
		opacity: 0.28;
	}
	.token {
		fill: #f2d08f;
		filter: url(#glow);
	}
	.token.alt {
		fill: #a493ff;
	}
	.tok-t {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 13px;
		fill: #1a1206 !important;
	}
	.explain {
		padding: 0 1.2rem 0.3rem;
		text-align: center;
		min-height: 6.6rem;
	}
	.explain p {
		margin: -0.3rem auto 0.4rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		max-width: 40rem;
	}
	.lbl {
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
</style>
