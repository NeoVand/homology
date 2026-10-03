<script lang="ts">
	// Figure: the Künneth formula as a grid. Cell (i, j) holds H_i(X) ⊗ H_j(Y);
	// anti-diagonals i + j = n add up to H_n(X × Y), together with Tor terms that
	// arrive from the diagonal below. Checked against the product chain complex.
	import TeX from '$lib/components/prose/TeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { spaces, homologyOf, tensorFG, torFG, kunneth, tensorComplex, groupTeX, equal, isZero } from './abelian';

	let xId = $state('RP2');
	let yId = $state('RP2');
	const X = $derived(spaces[xId]);
	const Y = $derived(spaces[yId]);
	const HX = $derived(homologyOf(X.chains));
	const HY = $derived(homologyOf(Y.chains));
	const K = $derived(kunneth(HX, HY));
	const direct = $derived(homologyOf(tensorComplex(X.chains, Y.chains)));
	const ok = $derived(K.every((t, n) => equal(t.total, direct[n])));
	const hues = ['#f2d08f', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff', '#84d9a2', '#f4b55f'];
	const opts = [
		{ value: 'S1', label: 'S¹' },
		{ value: 'S2', label: 'S²' },
		{ value: 'T2', label: 'T²' },
		{ value: 'RP2', label: 'ℝP²' },
		{ value: 'K', label: 'K' }
	];
	const torCells = $derived(
		HX.flatMap((a, i) => HY.map((b, j) => ({ i, j, g: torFG(a, b) }))).filter((c) => !isZero(c.g))
	);
</script>

<div class="kun">
	<div class="wrap">
		<div class="grid" style="--cols:{HX.length}; --rows:{HY.length}">
			<!-- column headers: H_i(X) -->
			<div class="corner ui"><span><TeX tex={`H_i(${X.tex})\\rightarrow`} /></span><span><TeX tex={`H_j(${Y.tex})\\uparrow`} /></span></div>
			{#each HX as a, i (i)}
				<div class="hx"><TeX tex={`H_{${i}} = ${groupTeX(a)}`} /></div>
			{/each}
			{#each [...HY.keys()].reverse() as j (j)}
				<div class="hy"><TeX tex={`H_{${j}} = ${groupTeX(HY[j])}`} /></div>
				{#each HX as a, i (i)}
					{@const g = tensorFG(a, HY[j])}
					{@const t = torFG(a, HY[j])}
					<div class="cell" style="--h:{hues[(i + j) % hues.length]}" class:zero={isZero(g)}>
						<span class="deg ui">n = {i + j}</span>
						<TeX tex={groupTeX(g)} />
						{#if !isZero(t)}
							<span class="tor"><TeX tex={`\\Tor = ${groupTeX(t)}`} /> → n = {i + j + 1}</span>
						{/if}
					</div>
				{/each}
			{/each}
		</div>
	</div>

	<div class="totals">
		{#each K as t, n (n)}
			<div class="tot" style="--h:{hues[n % hues.length]}">
				<div class="tn"><TeX tex={`H_{${n}}(${X.tex}\\times ${Y.tex})`} /></div>
				<div class="tv"><TeX tex={`= ${groupTeX(t.total)}`} /></div>
				<div class="tp"><TeX tex={groupTeX(t.tensorPart)} /> <span class="op">⊕</span> <span class:rose={!isZero(t.torPart)}><TeX tex={groupTeX(t.torPart)} /></span></div>
			</div>
		{/each}
	</div>
	<p class="note ui">
		Each anti-diagonal <TeX tex="i + j = n" /> (same colour) adds up to <TeX tex={`H_n`} />; {torCells.length
			? 'the rose Tor terms jump one diagonal up.'
			: 'here there is no torsion to tensor together, so no Tor terms appear.'}
		<span class:ok class:bad={!ok}>{ok ? '✓ Agrees with the homology of the product cell complex.' : '✗ mismatch'}</span>
	</p>
	<Controls>
		<span class="lbl ui"><TeX tex="X =" /></span>
		<Segmented bind:value={xId} label="Space X" options={opts} />
		<span class="lbl ui"><TeX tex="Y =" /></span>
		<Segmented bind:value={yId} label="Space Y" options={opts} />
	</Controls>
</div>

<style>
	.kun {
		padding-top: 0.9rem;
	}
	.wrap {
		overflow-x: auto;
		padding: 0 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: auto repeat(var(--cols), minmax(5.6rem, 1fr));
		gap: 0.35rem;
		min-width: max-content;
		margin: 0 auto;
		max-width: 44rem;
	}
	.corner {
		font-size: 0.72rem;
		color: var(--ink-faint);
		display: grid;
		place-items: center;
		line-height: 1.3;
	}
	.hx,
	.hy {
		font-size: 0.82rem;
		color: var(--ink-dim);
		display: grid;
		place-items: center;
		padding: 0.2rem 0.4rem;
	}
	.cell {
		position: relative;
		border-radius: 10px;
		border: 1.5px solid color-mix(in srgb, var(--h) 55%, transparent);
		background: color-mix(in srgb, var(--h) 9%, transparent);
		min-height: 3.6rem;
		display: grid;
		place-items: center;
		padding: 0.5rem 0.3rem 0.35rem;
		font-size: 1rem;
		color: var(--ink-bright);
	}
	.cell.zero {
		opacity: 0.45;
	}
	.deg {
		position: absolute;
		top: 0.2rem;
		left: 0.4rem;
		font-size: 0.6rem;
		color: color-mix(in srgb, var(--h) 80%, white);
	}
	.tor {
		font-family: var(--font-ui);
		font-size: 0.66rem;
		color: var(--rose);
	}
	.totals {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.45rem;
		padding: 0.8rem 1rem 0.2rem;
	}
	.tot {
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--h) 50%, transparent);
		padding: 0.35rem 0.6rem;
		text-align: center;
		background: rgba(5, 9, 18, 0.5);
	}
	.tn {
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.tv {
		font-size: 1rem;
		color: var(--gold-bright);
	}
	.tp {
		font-size: 0.7rem;
		color: var(--ink-faint);
	}
	.rose {
		color: var(--rose);
	}
	.op {
		margin: 0 0.15rem;
	}
	.note {
		text-align: center;
		font-size: 0.8rem;
		color: var(--ink-dim);
		padding: 0.2rem 1.2rem 0.6rem;
		margin: 0;
	}
	.ok {
		color: var(--green);
		margin-left: 0.4rem;
	}
	.bad {
		color: var(--rose);
	}
	.lbl {
		font-size: 0.85rem;
	}
</style>
