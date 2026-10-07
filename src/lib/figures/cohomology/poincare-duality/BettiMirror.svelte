<script lang="ts">
	// Betti numbers of closed manifolds read the same backwards. Pick a space,
	// reflect its bar chart in the mirror, and compare.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { bettiCatalogue, euler, isPalindrome } from './duality';

	let id = $state('t2');
	let coeff = $state<'Q' | 'Z2'>('Q');
	let flipped = $state(false);
	const E = $derived(bettiCatalogue.find((e) => e.id === id)!);
	const b = $derived(coeff === 'Z2' && E.b2 ? E.b2 : E.b);
	const pal = $derived(isPalindrome(b));
	const n = $derived(E.n);

	$effect(() => {
		void id;
		flipped = false;
		if (!bettiCatalogue.find((e) => e.id === id)!.b2) coeff = 'Q';
	});

	// a narrower drawing in a narrow figure, so that labels stay legible on a phone
	let cw = $state(640);
	const W = $derived(cw < 520 ? 380 : 600);
	const H = 300;
	const base = 236;
	const unit = $derived(Math.min(48, 168 / Math.max(1, ...b)));
	const slot = $derived(Math.min(96, (W - 120) / (n + 1)));
	const x0 = $derived(W / 2 - (slot * (n + 1)) / 2);
	const cx = (k: number) => x0 + slot * (k + 0.5);
	const mirrorX = $derived(W / 2);
	const chiTeX = $derived(
		`\\chi = ${b.map((x, k) => (k === 0 ? `${x}` : `${k % 2 ? '-' : '+'} ${x}`)).join(' ')} = ${euler(b)}`
	);
	const seqTeX = $derived(`(${b.map((x, k) => `b_${k}`).join(',\\,')}) = (${b.join(',\\,')})`);
</script>

<div class="bm" bind:clientWidth={cw}>
	<div class="chips ui" role="radiogroup" aria-label="Choose a space">
		{#each bettiCatalogue as e (e.id)}
			<button class="chip" class:on={e.id === id} class:off={!e.closed} role="radio" aria-checked={e.id === id} onclick={() => (id = e.id)}>
				<TeX tex={e.tex} />
			</button>
		{/each}
	</div>
	<Svg viewBox="0 0 {W} {H}" maxHeight={320} label="A bar chart of the Betti numbers of the chosen space, with a mirror line in the middle. Reflecting the chart shows whether the sequence reads the same backwards.">
		<defs>
			<linearGradient id="bm-bar" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="#fff1d0" />
				<stop offset="0.45" stop-color="#f2d08f" />
				<stop offset="1" stop-color="#a5803f" stop-opacity="0.75" />
			</linearGradient>
			<filter id="bm-glow" filterUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
				<feGaussianBlur stdDeviation="4" result="g" />
				<feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
		</defs>
		<line x1="40" y1={base} x2={W - 40} y2={base} class="axis" />
		<!-- the mirror -->
		<line x1={mirrorX} y1="22" x2={mirrorX} y2={base + 6} class="mirror" />
		<text x={mirrorX} y="16" class="t-ui mlabel" style:font-size={cw < 520 ? '14px' : null}>mirror  k ↔ {n} − k</text>
		<g class="bars" class:flipped style="transform-origin: {mirrorX}px 0px">
			{#each b as x, k (k)}
				{@const h = x * unit}
				<rect x={cx(k) - slot * 0.3} y={base - h} width={slot * 0.6} height={Math.max(h, 0.001)} rx="5" fill="url(#bm-bar)" filter="url(#bm-glow)" opacity={x ? 1 : 0} />
				<text x={cx(k)} y={base - h - 8} class="val">{x}</text>
			{/each}
		</g>
		<!-- the reflection, as outlines -->
		{#each b as _, k (k)}
			{@const xr = b[n - k]}
			<rect
				x={cx(k) - slot * 0.36}
				y={base - xr * unit - 4}
				width={slot * 0.72}
				height={xr * unit + 4}
				rx="7"
				class="ghost"
				class:bad={xr !== b[k]}
				opacity={xr || xr !== b[k] ? 1 : 0}
			/>
		{/each}
		{#each b as _, k (k)}
			<SvgTeX x={cx(k)} y={base + 22} tex={`b_{${k}}`} size={cw < 520 ? 18 : 16} w={50} h={26} color="var(--ink-dim)" />
		{/each}
	</Svg>
	<div class="ctl ui">
		<Button onclick={() => (flipped = !flipped)} variant="ghost">{flipped ? 'Reflect back' : 'Reflect in the mirror'}</Button>
		{#if E.b2}
			<Segmented
				bind:value={coeff}
				label="Coefficients"
				options={[
					{ value: 'Q', label: 'over ℚ' },
					{ value: 'Z2', label: 'over ℤ/2' }
				]}
			/>
		{/if}
		<span class="verdict" class:yes={pal} class:no={!pal}>{pal ? 'reads the same backwards' : 'not a palindrome'}</span>
	</div>
	<div class="read ui" aria-live="polite">
		<div class="row"><TeX tex={`${E.tex}:\\quad ${seqTeX}`} /></div>
		<div class="row"><TeX tex={chiTeX} /></div>
		<p>{@html renderMathInText(E.note)}</p>
	</div>
</div>

<style>
	.bm {
		padding: 0.7rem 1rem 0.2rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
		margin-bottom: 0.4rem;
	}
	.chip {
		min-height: 2.1rem;
		padding: 0.2rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--ink);
		cursor: pointer;
		font-size: 0.86rem;
		transition: all 0.18s var(--ease);
	}
	.chip.off {
		border-style: dashed;
		color: var(--ink-dim);
	}
	.chip:hover {
		border-color: var(--gold);
	}
	.chip.on {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		border-color: transparent;
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.5;
	}
	.mirror {
		stroke: var(--violet);
		stroke-width: 1.5;
		stroke-dasharray: 5 5;
	}
	.mlabel {
		text-anchor: middle;
		font-size: 12px;
		fill: var(--violet);
	}
	.bars {
		transition: transform 0.85s var(--ease);
	}
	.bars.flipped {
		transform: scaleX(-1);
	}
	.bars.flipped .val {
		display: none;
	}
	.val {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-weight: 650;
		font-size: 15px;
		fill: var(--gold-bright);
	}
	.ghost {
		fill: none;
		stroke: var(--teal);
		stroke-width: 1.6;
		stroke-dasharray: 4 4;
	}
	.ghost.bad {
		stroke: var(--rose);
		stroke-width: 2.4;
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		padding: 0.6rem 0.2rem 0.3rem;
	}
	.verdict {
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.verdict.yes {
		color: var(--green);
	}
	.verdict.no {
		color: var(--rose);
	}
	.read {
		display: grid;
		gap: 0.3rem;
		padding: 0.3rem 0.2rem 0.9rem;
		color: var(--ink-bright);
	}
	.read p {
		margin: 0.2rem 0 0;
		font-family: var(--font-body);
		color: var(--ink-dim);
		font-size: 0.92rem;
		line-height: 1.5;
	}
	.row {
		overflow-x: auto;
	}
</style>
