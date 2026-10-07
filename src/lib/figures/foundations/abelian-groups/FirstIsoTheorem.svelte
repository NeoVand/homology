<script lang="ts">
	// The First Isomorphism Theorem in five steps, for φ(x) = kx on ℤ/12:
	// arrows → colour by image → pile up the cosets of the kernel above their
	// image → collapse each pile → a one-to-one correspondence with the image.
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { residueColor, gcd, setTeX } from '../groups/zn';

	const n = 12;
	let k = $state(3);
	let step = $state(0);
	let cw = $state(700);

	const sTw = new Tween(0, { duration: 850, easing: cubicInOut });
	$effect(() => {
		sTw.set(step, { duration: prefersReducedMotion.current ? 0 : 850 });
	});
	$effect(() => {
		void k;
		step = 0;
	});

	const W = $derived(cw < 560 ? 360 : 600);
	const yDom = 46;
	const yCod = 300;
	const yTok = 196;
	const xs = $derived(Array.from({ length: n }, (_, i) => 30 + ((W - 60) * i) / (n - 1)));

	const phi = (x: number) => (k * x) % n;
	const g = $derived(gcd(k, n)); // |ker φ|
	const ker = $derived(Array.from({ length: n }, (_, x) => x).filter((x) => phi(x) === 0));
	const img = $derived([...new Set(Array.from({ length: n }, (_, x) => phi(x)))].sort((a, b) => a - b));
	const imgSet = $derived(new Set(img));
	/** index of x inside its coset (0 for the smallest representative) */
	const slot = (x: number) => Array.from({ length: n }, (_, y) => y).filter((y) => phi(y) === phi(x)).indexOf(x);

	const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
	const pileGap = $derived(Math.min(22, 120 / Math.max(1, g - 1)));

	function posOf(x: number, s: number): [number, number] {
		const y = phi(x);
		const p0: [number, number] = [xs[x], yDom];
		const p1: [number, number] = [xs[y], yTok - 18 - slot(x) * pileGap];
		const p2: [number, number] = [xs[y], yTok];
		if (s <= 1) return p0;
		if (s <= 2) {
			const t = ease(s - 1);
			return [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t)];
		}
		const t = ease(Math.min(1, s - 2));
		return [lerp(p1[0], p2[0], t), lerp(p1[1], p2[1], t)];
	}

	const sv = $derived(sTw.current);
	const colored = $derived(Math.min(1, Math.max(0, sv)));
	const perElementArrows = $derived(Math.max(0, 1 - Math.max(0, sv - 0.8) * 2.5));
	const perCosetArrows = $derived(Math.max(0, Math.min(1, (sv - 2.3) / 0.7)));
	const dimNonImage = $derived(Math.min(1, Math.max(0, sv - 3)));

	const cosetList = $derived(
		img.map((y) => {
			const els = Array.from({ length: n }, (_, x) => x).filter((x) => phi(x) === y);
			return { y, els };
		})
	);

	const labels = [
		'The homomorphism',
		'Colour by image',
		'Pile up the cosets',
		'Collapse each pile',
		'A one-to-one match'
	];
</script>

<div class="fit" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {W} 352" maxHeight={430} label="The First Isomorphism Theorem: cosets of the kernel collapse to points that match the image one-to-one">
		<text x="6" y="12" class="rowlbl" opacity={Math.max(0, 1 - Math.max(0, sv - 1))}>domain ℤ/12</text>
		<text x="6" y={yCod + 46} class="rowlbl">target ℤ/12</text>

		<!-- per-element arrows (steps 0–1) -->
		{#if perElementArrows > 0.01}
			{#each Array.from({ length: n }, (_, x) => x) as x (x)}
				{@const [px, py] = posOf(x, sv)}
				{@const tx = xs[phi(x)]}
				<path
					d="M {px} {py + 9} C {px} {py + 120}, {tx} {yCod - 120}, {tx} {yCod - 12}"
					fill="none"
					stroke={colored > 0.5 ? residueColor(phi(x), n) : 'rgba(164,147,255,0.6)'}
					stroke-width="1.4"
					opacity={perElementArrows * 0.85}
					marker-end="url(#arrowmid-dim)"
				/>
			{/each}
		{/if}

		<!-- one arrow per coset (steps 3–4) -->
		{#if perCosetArrows > 0.01}
			{#each img as y (y)}
				<line x1={xs[y]} y1={yTok + 16} x2={xs[y]} y2={yCod - 13} stroke={residueColor(y, n)} stroke-width="2" opacity={perCosetArrows} marker-end="url(#arrow-ivory)" />
			{/each}
		{/if}

		<!-- pile / token halos and labels -->
		{#if sv > 1.6}
			{#each cosetList as c (c.y)}
				{@const isK = c.y === 0}
				{@const top = sv < 2.5 ? yTok - 18 - (g - 1) * pileGap - 16 : yTok - 22}
				<rect
					x={xs[c.y] - 13}
					y={top}
					width="26"
					height={yTok + 16 - top}
					rx="13"
					fill={residueColor(c.y, n)}
					fill-opacity="0.1"
					stroke={residueColor(c.y, n)}
					stroke-opacity={isK ? 0.9 : 0.35}
					stroke-width={isK ? 1.6 : 1}
					opacity={Math.min(1, (sv - 1.6) * 2)}
				/>
			{/each}
		{/if}

		<!-- target row -->
		{#each Array.from({ length: n }, (_, y) => y) as y (y)}
			{@const inIm = imgSet.has(y)}
			<circle
				cx={xs[y]}
				cy={yCod}
				r="7"
				fill={inIm && colored > 0.5 ? residueColor(y, n) : 'rgba(150,145,130,0.35)'}
				opacity={inIm ? 1 : 1 - 0.65 * dimNonImage}
				filter={inIm && colored > 0.5 ? 'url(#glow)' : undefined}
			/>
			<text x={xs[y]} y={yCod + 22} text-anchor="middle" class="num" opacity={inIm ? 1 : 1 - 0.65 * dimNonImage}>{y}</text>
		{/each}

		<!-- domain elements -->
		{#each Array.from({ length: n }, (_, x) => x) as x (x)}
			{@const [px, py] = posOf(x, sv)}
			{@const isK = phi(x) === 0}
			{@const lt = Math.min(1, Math.max(0, sv - 1))}
			<circle cx={px} cy={py} r={sv > 2.5 ? 9 : 7} fill={colored > 0.5 ? residueColor(phi(x), n) : '#cfc9e8'} stroke="#0b1020" stroke-width="1" filter={isK && colored > 0.5 ? 'url(#glow)' : undefined} />
			<text
				x={px - 17 * lt}
				y={py - 12 * (1 - lt) + 4 * lt}
				text-anchor={lt > 0.5 ? 'end' : 'middle'}
				class="num"
				opacity={Math.max(0, 1 - Math.max(0, sv - 2.2) * 2)}>{x}</text
			>
		{/each}

		<!-- token labels after collapsing -->
		{#if sv > 2.6}
			{#each cosetList as c (c.y)}
				<SvgTeX
					x={xs[c.y]}
					y={yTok - 36}
					tex={c.y === 0 ? '\\ker\\varphi' : `${c.els[0]} + \\ker\\varphi`}
					size={W < 500 ? 10 : 12.5}
					color={residueColor(c.y, n, 88)}
					w={90}
					h={20}
				/>
			{/each}
		{/if}
	</Svg>

	<div class="read ui" aria-live="polite">
		{#if step === 0}
			<TeX tex={`\\varphi\\colon \\mathbb{Z}/12 \\to \\mathbb{Z}/12, \\qquad \\varphi(x) = ${k}x`} />
		{:else if step === 1}
			Same colour = same image. Gold is the kernel: <TeX tex={`\\ker\\varphi = ${setTeX(ker)}`} />.
		{:else if step === 2}
			Elements with the same image differ by an element of the kernel, so they form a coset
			<TeX tex={'x + \\ker\\varphi'} />. There are {img.length} cosets of {g} elements each.
		{:else if step === 3}
			Collapse each coset to a single dot: these {img.length} dots are the quotient group
			<TeX tex={'(\\mathbb{Z}/12)/\\ker\\varphi'} />.
		{:else}
			Each dot now goes to a <em>different</em> point, and every point of <TeX tex={`\\im\\varphi = ${setTeX(img)}`} /> is
			hit:
			<span class="res"><TeX tex={`(\\mathbb{Z}/12)/\\ker\\varphi \\;\\cong\\; \\im\\varphi \\;\\cong\\; \\mathbb{Z}/${img.length}`} /></span>
		{/if}
	</div>
</div>
<Controls>
	<StepControls bind:step count={5} {labels} interval={2200} />
	<span class="kpick ui">
		<span class="kl"><TeX tex={'\\varphi(x) = kx'} />, k =</span>
		<Segmented
			bind:value={k}
			options={[2, 3, 4, 6, 8, 9].map((v) => ({ value: v, label: String(v) }))}
			label="Choose k"
		/>
	</span>
</Controls>

<style>
	.fit {
		padding: 0.6rem 0.8rem 0.2rem;
	}
	.rowlbl {
		font-family: var(--font-ui);
		font-size: 11px !important;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		fill: var(--ink-ghost) !important;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 12px !important;
		fill: var(--ink-dim) !important;
		pointer-events: none;
	}
	.read {
		min-height: 4.2rem;
		text-align: center;
		font-size: 0.88rem;
		color: var(--ink);
		line-height: 1.7;
		padding: 0.2rem 0.6rem 0.7rem;
	}
	.res {
		display: block;
		font-size: 1.05rem;
		color: var(--gold-bright);
	}
	.kpick {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.kl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	/* phones: twelve columns squeeze the drawing, so its numbers grow */
	@container figure (max-width: 34rem) {
		.num {
			font-size: 15px !important;
		}
		.rowlbl {
			font-size: 13px !important;
		}
	}
</style>
