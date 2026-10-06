<script lang="ts">
	// Figure: a calculator for ⊗, Tor, Hom and Ext of finitely generated abelian
	// groups, showing the free resolution 0 → ℤ^k → ℤ^{r+k} → A → 0 and where
	// exactness fails after tensoring with G or applying Hom(−, G).
	import TeX from '$lib/components/prose/TeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { group, tensorFG, torFG, homFG, extFG, groupTeX, cyclicTeX, gcd, isZero, type Group } from './abelian';

	let rA = $state(0);
	let tA = $state<number[]>([4]);
	let rG = $state(0);
	let tG = $state<number[]>([6]);
	const A = $derived(group(rA, tA));
	const G = $derived(group(rG, tG));
	// keep the summands exactly as typed (not re-normalised) for the breakdown
	const builders = $derived([
		{ which: 'A' as const, r: rA, t: tA, g: A },
		{ which: 'G' as const, r: rG, t: tG, g: G }
	]);
	const sumA = $derived([...Array(rA).fill(0), ...tA]);
	const sumG = $derived([...Array(rG).fill(0), ...tG]);

	const choices = [2, 3, 4, 5, 6, 8, 9, 12];
	function addT(which: 'A' | 'G', d: number) {
		if (which === 'A' && tA.length < 3) tA = [...tA, d];
		if (which === 'G' && tG.length < 3) tG = [...tG, d];
	}
	function removeT(which: 'A' | 'G', k: number) {
		if (which === 'A') tA = tA.filter((_, i) => i !== k);
		else tG = tG.filter((_, i) => i !== k);
	}
	const presets: { label: string; rA: number; tA: number[]; rG: number; tG: number[] }[] = [
		{ label: 'Tor(ℤ/4, ℤ/6)', rA: 0, tA: [4], rG: 0, tG: [6] },
		{ label: 'ℤ/2 ⊗ ℤ/3', rA: 0, tA: [2], rG: 0, tG: [3] },
		{ label: 'Ext(ℤ/5, ℤ)', rA: 0, tA: [5], rG: 1, tG: [] },
		{ label: 'Ext(ℤ/2, ℤ/2)', rA: 0, tA: [2], rG: 0, tG: [2] },
		{ label: 'H₁(Klein) with ℤ/2', rA: 1, tA: [2], rG: 0, tG: [2] }
	];
	function load(p: (typeof presets)[number]) {
		rA = p.rA;
		tA = [...p.tA];
		rG = p.rG;
		tG = [...p.tG];
	}

	const results = $derived([
		{ name: '\\otimes', title: `A\\otimes G`, g: tensorFG(A, G), rule: (a: number, b: number) => (a === 0 ? b : b === 0 ? a : gcd(a, b)), op: '\\otimes', key: 'tensor' },
		{ name: '\\Tor', title: `\\Tor(A, G)`, g: torFG(A, G), rule: (a: number, b: number) => (a === 0 || b === 0 ? 1 : gcd(a, b)), op: 'Tor', key: 'tor' },
		{ name: '\\Hom', title: `\\Hom(A, G)`, g: homFG(A, G), rule: (a: number, b: number) => (a === 0 ? b : b === 0 ? 1 : gcd(a, b)), op: 'Hom', key: 'hom' },
		{ name: '\\Ext', title: `\\Ext(A, G)`, g: extFG(A, G), rule: (a: number, b: number) => (a === 0 ? 1 : b === 0 ? a : gcd(a, b)), op: 'Ext', key: 'ext' }
	]);
	function pairTeX(op: string, a: number, b: number, r: number) {
		const L = cyclicTeX(a);
		const R = cyclicTeX(b);
		const lhs = op === '\\otimes' ? `${L}\\otimes ${R}` : `\\${op}(${L}, ${R})`;
		return `${lhs} = ${cyclicTeX(r)}`;
	}

	const k = $derived(tA.length);
	/** base^n in TeX, written plainly when n is 0 or 1 */
	const pw = (base: string, n: number) => (n === 0 ? '0' : n === 1 ? base : `${base}^{${n}}`);
	const resolution = $derived.by(() => {
		if (k === 0) return `0\\to 0\\to ${pw('\\Z', rA)}\\xrightarrow{\\;=\\;} A\\to 0 \\qquad\\text{(}A\\text{ is free already)}`;
		const col = [...Array(rA).fill('0'), ...tA.map((d) => `${d}`)];
		const rows = col.map((c, i) => (i < rA ? Array(k).fill('0') : tA.map((_, j) => (j === i - rA ? c : '0'))).join(' & ')).join(' \\\\ ');
		return `0\\to ${pw('\\Z', k)}\\xrightarrow{\\;M\\;}${pw('\\Z', rA + k)}\\to A\\to 0,\\qquad M = \\begin{pmatrix} ${rows} \\end{pmatrix}`;
	});
	const Gt = $derived(groupTeX(G));
	const tensorLine = $derived(k === 0 ? '' : `${pw('G', k)} \\xrightarrow{\\;M\\otimes G\\;} ${pw('G', rA + k)} \\to A\\otimes G\\to 0`);
	const homLine = $derived(k === 0 ? '' : `0\\to\\Hom(A,G)\\to ${pw('G', rA + k)}\\xrightarrow{\\;M^{\\mathsf T}\\;} ${pw('G', k)}`);
	// per torsion summand ℤ/d of A, the map "multiply by d" on G: kernel and cokernel
	const perD = $derived(
		tA.map((dd) => {
			const ker = group(0, sumG.map((e) => (e === 0 ? 1 : gcd(dd, e))));
			const cok = group(0, sumG.map((e) => (e === 0 ? dd : gcd(dd, e))));
			return { d: dd, ker, cok };
		})
	);
	const fmt = (g: Group) => groupTeX(g);
</script>

<div class="calc">
	<div class="builders">
		{#each builders as bld (bld.which)}
			{@const which = bld.which}
			{@const r = bld.r}
			{@const t = bld.t}
			<div class="builder">
				<div class="bhead ui"><TeX tex={`${which} \\;=\\; ${groupTeX(bld.g)}`} /></div>
				<div class="brow">
					{#if which === 'A'}
						<Stepper bind:value={rA} min={0} max={3} label="copies of ℤ in A" />
					{:else}
						<Stepper bind:value={rG} min={0} max={3} label="copies of ℤ in G" />
					{/if}
				</div>
				<div class="brow chips">
					{#each t as d, i (i)}
						<button class="chip" onclick={() => removeT(which, i)} aria-label="remove Z/{d}"><TeX tex={`\\Z/${d}`} /><span class="x">×</span></button>
					{/each}
					{#if t.length < 3}
						<span class="adds">
							{#each choices as c (c)}
								<button class="add ui" onclick={() => addT(which, c)} aria-label="add Z/{c}">+{c}</button>
							{/each}
						</span>
					{/if}
				</div>
				<div class="hint ui">{r + t.length === 0 ? 'the zero group' : 'tap a summand to remove it; +n adds ℤ/n'}</div>
			</div>
		{/each}
	</div>

	<div class="cards">
		{#each results as res (res.key)}
			<div class="card" class:derived={res.key === 'tor' || res.key === 'ext'} class:nonzero={!isZero(res.g)}>
				<div class="ctitle"><TeX tex={res.title} /></div>
				<div class="cval"><TeX tex={`= ${groupTeX(res.g)}`} /></div>
				<div class="cbreak">
					{#each sumA as a, i (i)}
						{#each sumG as b, j (j)}
							<div class="pair"><TeX tex={pairTeX(res.op === '\\otimes' ? '\\otimes' : res.op, a, b, res.rule(a, b))} /></div>
						{/each}
					{/each}
					{#if sumA.length === 0 || sumG.length === 0}
						<div class="pair dim">(a zero group contributes nothing)</div>
					{/if}
				</div>
			</div>
		{/each}
	</div>

	<div class="resolution">
		<div class="rtitle ui">Where the numbers come from: a free resolution of <TeX tex="A" /></div>
		<TeX tex={resolution} display />
		{#if k > 0}
			<div class="two">
				<div class="half">
					<div class="htitle ui">Tensor with <TeX tex={`G = ${Gt}`} /> (right exact)</div>
					<TeX tex={tensorLine} display />
					<p class="ui small">
						The left map should be injective for exactness, and it is not: it multiplies by
						{#each perD as p, i (i)}<TeX tex={`${p.d}`} />{i < perD.length - 1 ? ', ' : ''}{/each} on copies of <TeX tex="G" />. Its kernel is
						<span class="rose"><TeX tex={`\\Tor(A,G) = ${fmt(torFG(A, G))}`} /></span>.
					</p>
				</div>
				<div class="half">
					<div class="htitle ui">Apply <TeX tex={'\\Hom(-, G)'} /> (left exact)</div>
					<TeX tex={homLine} display />
					<p class="ui small">
						The right map should be surjective, and it is not: its cokernel, made of the pieces <TeX tex={'G/dG'} /> for each
						<TeX tex={'\\Z/d'} /> in <TeX tex="A" />, is <span class="rose"><TeX tex={`\\Ext(A,G) = ${fmt(extFG(A, G))}`} /></span>.
					</p>
				</div>
			</div>
		{:else}
			<p class="ui small center">A free group needs no relations, so nothing can fail: <TeX tex={'\\Tor(A,G) = \\Ext(A,G) = 0'} />.</p>
		{/if}
	</div>

	<Controls>
		<span class="ui lbl">try:</span>
		{#each presets as p (p.label)}
			<Button variant="ghost" onclick={() => load(p)}>{p.label}</Button>
		{/each}
	</Controls>
</div>

<style>
	.calc {
		padding: 0.9rem 0 0;
	}
	.builders {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
		padding: 0 1rem;
	}
	@media (max-width: 640px) {
		.builders {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.builder {
		border: 1px solid var(--line-faint);
		border-radius: 12px;
		padding: 0.6rem 0.8rem 0.5rem;
		background: rgba(5, 9, 18, 0.4);
	}
	.bhead {
		font-size: 1.1rem;
		color: var(--ink-bright);
		margin-bottom: 0.3rem;
	}
	.brow {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin: 0.25rem 0;
	}
	.lbl {
		font-size: 0.76rem;
		color: var(--ink-dim);
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.25rem 0.55rem;
		border-radius: 999px;
		border: 1px solid rgba(164, 147, 255, 0.5);
		background: rgba(164, 147, 255, 0.14);
		color: var(--ink-bright);
		cursor: pointer;
		min-height: 2rem;
	}
	.chip:hover {
		border-color: var(--rose);
	}
	.x {
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.adds {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
	.add {
		min-width: 2rem;
		height: 2rem;
		border-radius: 8px;
		border: 1px dashed var(--line);
		background: transparent;
		color: var(--gold-bright);
		font-size: 0.72rem;
		cursor: pointer;
	}
	.add:hover {
		background: rgba(216, 178, 110, 0.12);
	}
	.hint {
		font-size: 0.7rem;
		color: var(--ink-faint);
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.6rem;
		padding: 0.9rem 1rem 0.4rem;
	}
	@media (max-width: 860px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.card {
		border-radius: 12px;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--line-faint);
		background: rgba(18, 26, 47, 0.6);
		text-align: center;
	}
	.card.derived {
		border-color: rgba(242, 141, 182, 0.25);
	}
	.card.derived.nonzero {
		border-color: rgba(242, 141, 182, 0.7);
		box-shadow: 0 0 22px -8px rgba(242, 141, 182, 0.6);
	}
	.ctitle {
		font-size: 0.95rem;
		color: var(--ink-dim);
	}
	.cval {
		font-size: 1.2rem;
		color: var(--gold-bright);
		margin: 0.15rem 0 0.35rem;
	}
	.card.derived .cval {
		color: var(--rose);
	}
	.cbreak {
		display: grid;
		gap: 0.1rem;
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.pair.dim {
		font-family: var(--font-ui);
		font-size: 0.7rem;
	}
	.resolution {
		margin: 0.6rem 1rem 0.8rem;
		padding: 0.6rem 0.9rem;
		border-radius: 12px;
		border: 1px solid var(--line-faint);
		background: rgba(5, 9, 18, 0.45);
	}
	.rtitle,
	.htitle {
		font-size: 0.8rem;
		letter-spacing: 0.02em;
		color: var(--gold);
	}
	.two {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.8rem;
	}
	@media (max-width: 700px) {
		.two {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.small {
		font-size: 0.8rem;
		color: var(--ink-dim);
		margin: 0;
	}
	.center {
		text-align: center;
	}
	.rose {
		color: var(--rose);
	}
</style>
