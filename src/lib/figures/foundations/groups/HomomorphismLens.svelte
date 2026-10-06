<script lang="ts">
	// A homomorphism φ: ℤ/m → ℤ/n is decided by k = φ(1); it must satisfy
	// m·k = 0 in ℤ/n. Arrows show φ; the kernel glows gold, the image teal.
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { homImages, homKernel, homImage, mod, setTeX } from './zn';

	let m = $state(6);
	let n = $state(6);
	let k = $state(2);
	let hover = $state<number | null>(null);

	const valid = $derived(homImages(m, n));
	$effect(() => {
		if (!valid.includes(k)) k = valid.find((v) => v !== 0) ?? 0;
	});

	const ker = $derived(homKernel(m, n, k));
	const img = $derived(homImage(m, n, k));
	const kerSet = $derived(new Set(ker));
	const imgSet = $derived(new Set(img));
	const phi = (x: number) => mod(k * x, n);

	let cw = $state(600);
	const W = $derived(cw < 520 ? 380 : 560);
	const yTop = 54;
	const yBot = 214;
	const xs = (count: number, W: number) => {
		const s = Math.min(46, (W - 96) / Math.max(1, Math.max(m, n) - 1));
		const w = s * (count - 1);
		return Array.from({ length: count }, (_, i) => W / 2 + 22 - w / 2 + i * s);
	};
	const xd = $derived(xs(m, W));
	const xc = $derived(xs(n, W));

	const sib = $derived(hover === null ? new Set<number>() : new Set(Array.from({ length: m }, (_, x) => x).filter((x) => phi(x) === phi(hover!))));
	const sibTeX = $derived(
		hover === null ? '' : `${hover} + \\ker\\varphi = ${setTeX([...sib].sort((p, q) => p - q))}`
	);
</script>

<div class="lens" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {W} 268" maxHeight={330} label="Arrows from the elements of Z/m to their images in Z/n">
		<text x="8" y={yTop + 5} class="rowlbl">ℤ/{m}</text>
		<text x="8" y={yBot + 5} class="rowlbl">ℤ/{n}</text>
		{#each Array.from({ length: m }, (_, x) => x) as x (x)}
			{@const y = phi(x)}
			{@const x0 = xd[x]}
			{@const x1 = xc[y]}
			{@const isK = kerSet.has(x)}
			{@const hot = hover !== null && sib.has(x)}
			<path
				d="M {x0} {yTop + 12} C {x0} {yTop + 80}, {x1} {yBot - 80}, {x1} {yBot - 14}"
				fill="none"
				stroke={isK ? '#f2d08f' : hot ? '#a493ff' : 'rgba(164,147,255,0.55)'}
				stroke-width={hot ? 2.6 : isK ? 2 : 1.4}
				stroke-opacity={hover !== null && !hot ? 0.25 : 1}
				marker-end={isK ? 'url(#arrow-gold)' : 'url(#arrow-violet)'}
			/>
		{/each}
		{#each Array.from({ length: m }, (_, x) => x) as x (x)}
			{@const isK = kerSet.has(x)}
			<g
				class="pt"
				role="button"
				tabindex="0"
				aria-label="element {x}, sent to {phi(x)}"
				onpointerenter={() => (hover = x)}
				onpointerleave={() => (hover = null)}
				onfocus={() => (hover = x)}
				onblur={() => (hover = null)}
				onclick={() => (hover = hover === x ? null : x)}
				onkeydown={() => {}}
			>
				<circle cx={xd[x]} cy={yTop} r="16" fill="transparent" />
				{#if isK}<circle cx={xd[x]} cy={yTop} r="11" fill="rgba(242,208,143,0.18)" />{/if}
				<circle
					cx={xd[x]}
					cy={yTop}
					r="7"
					fill={isK ? 'url(#vertex-fill)' : '#cfc9e8'}
					stroke={hover === x ? '#fff' : 'none'}
					stroke-width="1.5"
					filter={isK ? 'url(#glow)' : undefined}
				/>
				<text x={xd[x]} y={yTop - 15} text-anchor="middle" class="num" class:gold={isK}>{x}</text>
			</g>
		{/each}
		{#each Array.from({ length: n }, (_, y) => y) as y (y)}
			{@const isI = imgSet.has(y)}
			<circle
				cx={xc[y]}
				cy={yBot}
				r="7"
				fill={isI ? (y === 0 ? 'url(#vertex-fill)' : '#5fd6cf') : 'none'}
				stroke={isI ? 'none' : 'rgba(139,134,118,0.7)'}
				stroke-width="1.4"
				filter={isI ? 'url(#glow)' : undefined}
			/>
			<text x={xc[y]} y={yBot + 26} text-anchor="middle" class="num" class:teal={isI && y !== 0} class:gold={y === 0}>{y}</text>
		{/each}
	</Svg>
	<div class="read ui">
		<div class="rule">
			<TeX tex={`\\varphi\\colon \\mathbb{Z}/${m} \\to \\mathbb{Z}/${n}, \\quad \\varphi(x) = ${k}x`} />
		</div>
		<div class="kv">
			<span class="gold"><TeX tex={`\\ker\\varphi = ${setTeX(ker)}`} /></span>
			<span class="teal"><TeX tex={`\\im\\varphi = ${setTeX(img)}`} /></span>
		</div>
		<div class="facts">
			<span class:yes={ker.length === 1}>{ker.length === 1 ? 'injective (kernel is just 0)' : 'not injective (kernel is bigger than 0)'}</span>
			<span class:yes={img.length === n}>{img.length === n ? 'surjective' : 'not surjective'}</span>
			<span class="count"><TeX tex={`|\\ker\\varphi| \\cdot |\\im\\varphi| = ${ker.length} \\cdot ${img.length} = ${m}`} /></span>
		</div>
		<div class="hov">
			{#if hover !== null}
				Everything that lands where <TeX tex={String(hover)} /> lands: <TeX tex={sibTeX} />
			{:else}
				Hover or tap a top dot to see which elements share its image.
			{/if}
		</div>
	</div>
</div>
<Controls>
	<Stepper bind:value={m} min={2} max={12} label="m (domain ℤ/m)" />
	<Stepper bind:value={n} min={2} max={12} label="n (target ℤ/n)" />
	<div class="ks ui">
		<span class="kl">choose <TeX tex={'\\varphi(1)'} />:</span>
		{#each Array.from({ length: n }, (_, y) => y) as y (y)}
			<button
				class="kb"
				class:on={y === k}
				disabled={!valid.includes(y)}
				onclick={() => (k = y)}
				title={valid.includes(y) ? `φ(1) = ${y}` : `not allowed: ${m}·${y} is not 0 in ℤ/${n}`}>{y}</button
			>
		{/each}
	</div>
</Controls>

<style>
	.lens {
		padding: 0.6rem 1rem 0.4rem;
	}
	.rowlbl {
		font-family: var(--font-ui);
		font-size: 12px !important;
		letter-spacing: 0.04em;
		fill: var(--ink-faint) !important;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 13px !important;
		fill: var(--ink-dim) !important;
		pointer-events: none;
	}
	.num.gold {
		fill: var(--gold-bright) !important;
		font-weight: 700;
	}
	.num.teal {
		fill: var(--teal) !important;
		font-weight: 650;
	}
	.pt {
		cursor: pointer;
		outline: none;
	}
	.read {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-align: center;
		padding: 0.2rem 0 0.6rem;
	}
	.rule {
		font-size: 1rem;
		color: var(--ink-bright);
	}
	.kv {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1.6rem;
	}
	.gold {
		color: var(--gold-bright);
	}
	.teal {
		color: var(--teal);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1.2rem;
		font-size: 0.8rem;
	}
	.facts span {
		color: var(--rose);
	}
	.facts span.yes {
		color: var(--green);
	}
	.facts .count {
		color: var(--ink-dim);
	}
	.hov {
		min-height: 1.6rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	.ks {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
	}
	.kl {
		font-size: 0.76rem;
		color: var(--ink-dim);
		margin-right: 0.3rem;
	}
	.kb {
		min-width: 2rem;
		height: 2rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
	}
	.kb.on {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		font-weight: 700;
		border-color: transparent;
	}
	.kb:disabled {
		opacity: 0.22;
		cursor: not-allowed;
	}
</style>
