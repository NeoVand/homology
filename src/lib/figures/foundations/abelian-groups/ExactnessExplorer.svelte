<script lang="ts">
	// ℤ/n --(×a)--> ℤ/n --(×b)--> ℤ/n with ab ≡ 0, so the composite is zero and
	// im(×a) ⊆ ker(×b). Exact in the middle when the two are equal; otherwise the
	// leftover ker/im (rose) is a first taste of homology.
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { setTeX } from '../groups/zn';

	let n = $state(8);
	let a = $state(4);
	let b = $state(2);
	let cw = $state(700);

	const validB = (aa: number, bb: number) => (aa * bb) % n === 0;
	$effect(() => {
		if (a > n - 1) a = n / 2;
		if (!validB(a, b)) {
			const opts = Array.from({ length: n }, (_, x) => x).filter((x) => validB(a, x));
			b = opts.find((x) => x !== 0) ?? 0;
		}
	});

	const els = $derived(Array.from({ length: n }, (_, x) => x));
	const im = $derived([...new Set(els.map((x) => (a * x) % n))].sort((p, q) => p - q));
	const ker = $derived(els.filter((x) => (b * x) % n === 0));
	const imSet = $derived(new Set(im));
	const kerSet = $derived(new Set(ker));
	const exact = $derived(im.length === ker.length);
	const q = $derived(ker.length / im.length);

	const W = $derived(cw < 560 ? 360 : 620);
	const x0 = $derived(cw < 560 ? 84 : 112);
	const xs = $derived(els.map((x) => x0 + ((W - x0 - 24) * x) / Math.max(1, n - 1)));
	const yA = 40;
	const yB = 150;
	const yC = 262;
</script>

<div class="ex" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {W} 300" maxHeight={380} label="Three copies of Z/n connected by multiplication maps; the image of the first map and the kernel of the second are highlighted in the middle copy">
		<text x="6" y={yA + 4} class="rowlbl">A</text>
		<text x="6" y={yB + 4} class="rowlbl">B</text>
		<text x="6" y={yC + 4} class="rowlbl">C</text>
		<text x="28" y={(yA + yB) / 2 + 4} class="maplbl teal">f = ×{a}</text>
		<text x="28" y={(yB + yC) / 2 + 4} class="maplbl gold">g = ×{b}</text>

		{#each els as x (x)}
			{@const y = (a * x) % n}
			<path
				d="M {xs[x]} {yA + 9} C {xs[x]} {yA + 60}, {xs[y]} {yB - 60}, {xs[y]} {yB - 12}"
				fill="none"
				stroke="#5fd6cf"
				stroke-opacity="0.55"
				stroke-width="1.3"
				marker-end="url(#arrow-teal)"
			/>
		{/each}
		{#each els as x (x)}
			{@const y = (b * x) % n}
			{@const k = kerSet.has(x)}
			<path
				d="M {xs[x]} {yB + 12} C {xs[x]} {yB + 62}, {xs[y]} {yC - 60}, {xs[y]} {yC - 12}"
				fill="none"
				stroke={k ? '#f2d08f' : '#a493ff'}
				stroke-opacity={k ? 0.75 : 0.35}
				stroke-width={k ? 1.6 : 1.2}
				marker-end={k ? 'url(#arrow-gold)' : 'url(#arrow-violet)'}
			/>
		{/each}

		{#each els as x (x)}
			<circle cx={xs[x]} cy={yA} r="6" fill="#cfc9e8" />
			<text x={xs[x]} y={yA - 12} text-anchor="middle" class="num">{x}</text>
			<circle cx={xs[x]} cy={yC} r="6" fill={x === 0 ? 'url(#vertex-fill)' : 'rgba(150,145,130,0.4)'} />
			<text x={xs[x]} y={yC + 22} text-anchor="middle" class="num">{x}</text>
		{/each}

		{#each els as x (x)}
			{@const inIm = imSet.has(x)}
			{@const inKer = kerSet.has(x)}
			{#if inKer}
				<circle cx={xs[x]} cy={yB} r="13" fill="none" stroke={inIm ? '#f2d08f' : '#f28db6'} stroke-width="2" filter="url(#glow)" />
			{/if}
			<circle
				cx={xs[x]}
				cy={yB}
				r="7.5"
				fill={inIm ? '#5fd6cf' : inKer ? '#f28db6' : 'rgba(150,145,130,0.35)'}
				stroke="#0b1020"
				stroke-width="1"
			/>
			<text x={xs[x] + 15} y={yB - 13} text-anchor="middle" class="num mid">{x}</text>
		{/each}
	</Svg>
	<div class="read ui">
		<div class="kv">
			<span class="teal"><TeX tex={`\\im f = ${setTeX(im)}`} /></span>
			<span class="gold"><TeX tex={`\\ker g = ${setTeX(ker)}`} /></span>
		</div>
		<div class="dim">
			Always <TeX tex={'\\im f \\subseteq \\ker g'} /> here, since <TeX tex={`g(f(x)) = ${b}\\cdot ${a}\\,x = ${a * b}\\,x = 0`} /> in
			<TeX tex={`\\mathbb{Z}/${n}`} />.
		</div>
		<div class="verdict" class:yes={exact}>
			{#if exact}
				<TeX tex={'\\im f = \\ker g'} />: the sequence is <b>exact</b> at <TeX tex="B" />.
			{:else}
				Not exact: the rose elements are killed by <TeX tex="g" /> but not produced by <TeX tex="f" />. What is left over is
				<TeX tex={`\\ker g / \\im f \\cong \\mathbb{Z}/${q}`} /> — a first glimpse of homology.
			{/if}
		</div>
	</div>
</div>
<Controls>
	<span class="pick ui"
		>n <Segmented
			bind:value={n}
			options={[4, 6, 8, 12].map((v) => ({ value: v, label: String(v) }))}
			label="n"
		/></span
	>
	<span class="pick ui">
		f = ×
		{#each els as x (x)}
			<button class="kb" class:on={x === a} onclick={() => (a = x)}>{x}</button>
		{/each}
	</span>
	<span class="pick ui">
		g = ×
		{#each els as x (x)}
			<button
				class="kb"
				class:on={x === b}
				disabled={!validB(a, x)}
				title={validB(a, x) ? '' : `g∘f would not be zero: ${a}·${x} is not 0 in ℤ/${n}`}
				onclick={() => (b = x)}>{x}</button
			>
		{/each}
	</span>
</Controls>

<style>
	.ex {
		padding: 0.6rem 0.8rem 0.2rem;
	}
	.rowlbl {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 16px !important;
		fill: var(--ink-dim) !important;
	}
	.maplbl {
		font-family: var(--font-ui);
		font-size: 11px !important;
		letter-spacing: 0.03em;
	}
	.maplbl.teal {
		fill: var(--teal) !important;
	}
	.maplbl.gold {
		fill: var(--gold-bright) !important;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 11.5px !important;
		fill: var(--ink-faint) !important;
	}
	.num.mid {
		fill: var(--ink-dim) !important;
	}
	.read {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		text-align: center;
		font-size: 0.86rem;
		padding: 0.2rem 0.6rem 0.7rem;
		color: var(--ink);
	}
	.kv {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.6rem;
		justify-content: center;
	}
	.teal {
		color: var(--teal);
	}
	.gold {
		color: var(--gold-bright);
	}
	.dim {
		color: var(--ink-dim);
		font-size: 0.8rem;
	}
	.verdict {
		color: var(--rose);
		line-height: 1.6;
	}
	.verdict.yes {
		color: var(--green);
	}
	.pick {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem;
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.kb {
		min-width: 1.9rem;
		height: 1.9rem;
		border-radius: 7px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 0.76rem;
	}
	.kb.on {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		font-weight: 700;
		border-color: transparent;
	}
	.kb:disabled {
		opacity: 0.2;
		cursor: not-allowed;
	}
</style>
