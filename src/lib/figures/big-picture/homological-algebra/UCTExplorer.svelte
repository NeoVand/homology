<script lang="ts">
	// Figure: the Universal Coefficient Theorems at work. Pick a space and a
	// coefficient group; the table computes H_n(X;G) and H^n(X;G) from integral
	// homology by the UCT, highlights the Tor/Ext terms (the torsion shift), and
	// checks every entry against a direct computation from the chain complex.
	import TeX from '$lib/components/prose/TeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import {
		spaces,
		homologyOf,
		homologyWith,
		cohomologyWith,
		uctHomology,
		uctCohomology,
		groupTeX,
		coeffTeX,
		equal,
		isZero,
		Zc,
		Qc,
		Zn,
		type Coeff
	} from './abelian';
	import Mark from '$lib/components/ui/Mark.svelte';

	let spaceId = $state('RP2');
	let coeffId = $state<'Z' | 'Z2' | 'Z3' | 'Q'>('Z2');
	const S = $derived(spaces[spaceId]);
	const G: Coeff = $derived(coeffId === 'Z' ? Zc : coeffId === 'Q' ? Qc : coeffId === 'Z2' ? Zn(2) : Zn(3));
	const Gt = $derived(coeffTeX(G));
	const H = $derived(homologyOf(S.chains));
	const uh = $derived(uctHomology(H, G));
	const uc = $derived(uctCohomology(H, G));
	const dh = $derived(homologyWith(S.chains, G));
	const dc = $derived(cohomologyWith(S.chains, G));
	const allOk = $derived(uh.every((t, n) => equal(t.total, dh[n])) && uc.every((t, n) => equal(t.total, dc[n])));
	const degrees = $derived(H.map((_, n) => n));

	// the cellular chain complex, written out
	function mat(M: number[][]): string {
		if (!M.length || !M[0].length) return '0';
		if (M.length === 1 && M[0].length === 1) return M[0][0] === 0 ? '0' : `\\times ${M[0][0]}`;
		return `\\begin{pmatrix}${M.map((r) => r.join(' & ')).join('\\\\')}\\end{pmatrix}`;
	}
	function tr(M: number[][]): number[][] {
		if (!M.length) return [];
		return M[0].map((_, j) => M.map((r) => r[j]));
	}
	const chainTeX = $derived.by(() => {
		const c = S.chains;
		const top = c.dims.length - 1;
		const pow = (k: number, base: string) => (c.dims[k] === 0 ? '0' : c.dims[k] === 1 ? base : `${base}^{${c.dims[k]}}`);
		let s = '0';
		for (let k = top; k >= 0; k--) {
			s += k === top ? `\\to ${pow(k, '\\Z')}` : `\\xrightarrow{${mat(c.d[k + 1])}} ${pow(k, '\\Z')}`;
		}
		return s + '\\to 0';
	});
	const cochainTeX = $derived.by(() => {
		const c = S.chains;
		const top = c.dims.length - 1;
		const pow = (k: number) => (c.dims[k] === 0 ? '0' : c.dims[k] === 1 ? Gt : `${Gt}^{${c.dims[k]}}`);
		let s = `0\\to ${pow(0)}`;
		for (let k = 1; k <= top; k++) s += `\\xrightarrow{${mat(tr(c.d[k]))}} ${pow(k)}`;
		return s + '\\to 0';
	});
</script>

<div class="uct">
	<div class="chains">
		<div class="clabel ui">cells of <TeX tex={S.tex} />: {S.cells}</div>
		<div class="cline"><span class="tag ui">chains</span><TeX tex={chainTeX} /></div>
		<div class="cline"><span class="tag ui">cochains in <TeX tex={Gt} /></span><TeX tex={cochainTeX} /></div>
	</div>

	<div class="tw">
		<table>
			<thead>
				<tr>
					<th></th>
					{#each degrees as n (n)}<th><TeX tex={`n = ${n}`} /></th>{/each}
				</tr>
			</thead>
			<tbody>
				<tr class="input">
					<th><TeX tex={'H_n(X;\\Z)'} /><span class="sub ui">integral homology</span></th>
					{#each H as h, n (n)}<td><TeX tex={groupTeX(h)} /></td>{/each}
				</tr>
				<tr>
					<th><TeX tex={`H_n(X;${Gt})`} /><span class="sub ui">homology with coefficients</span></th>
					{#each uh as t, n (n)}
						<td class:shift={!isZero(t.shifted)}>
							<div class="tot"><TeX tex={groupTeX(t.total)} /></div>
							<div class="parts">
								<TeX tex={`${groupTeX(t.main)}`} /><span class="op">⊕</span><span class="tor"><TeX tex={`${groupTeX(t.shifted)}`} /></span>
							</div>
							{#if !isZero(t.shifted)}<div class="from ui">from Tor of <TeX tex={`H_{${n - 1}}`} /></div>{/if}
						</td>
					{/each}
				</tr>
				<tr>
					<th><TeX tex={`H^n(X;${Gt})`} /><span class="sub ui">cohomology</span></th>
					{#each uc as t, n (n)}
						<td class:shift={!isZero(t.shifted)}>
							<div class="tot"><TeX tex={groupTeX(t.total)} /></div>
							<div class="parts">
								<TeX tex={`${groupTeX(t.main)}`} /><span class="op">⊕</span><span class="tor"><TeX tex={`${groupTeX(t.shifted)}`} /></span>
							</div>
							{#if !isZero(t.shifted)}<div class="from ui">from Ext of <TeX tex={`H_{${n - 1}}`} /></div>{/if}
						</td>
					{/each}
				</tr>
			</tbody>
		</table>
	</div>
	<div class="legend ui">
		<span>Each entry is <TeX tex={'H_n\\otimes G \\,\\oplus\\, \\Tor(H_{n-1},G)'} /> (homology) or <TeX tex={'\\Hom(H_n,G)\\,\\oplus\\,\\Ext(H_{n-1},G)'} /> (cohomology); the <span class="rose">rose</span> part comes from torsion one degree down.</span>
		<span class:ok={allOk} class:bad={!allOk}>
			<Mark ok={allOk} />
			{allOk ? 'Every entry agrees with a direct computation from the chain complex above.' : 'This does not match a direct computation.'}
		</span>
	</div>

	<Controls>
		<Segmented
			bind:value={spaceId}
			label="Space"
			options={[
				{ value: 'S2', label: 'Sphere' },
				{ value: 'T2', label: 'Torus' },
				{ value: 'RP2', label: 'ℝP²' },
				{ value: 'K', label: 'Klein bottle' },
				{ value: 'RP3', label: 'ℝP³' },
				{ value: 'L3', label: 'Lens L(3,1)' }
			]}
		/>
		<Segmented
			bind:value={coeffId}
			label="Coefficients"
			options={[
				{ value: 'Z', label: 'ℤ' },
				{ value: 'Z2', label: 'ℤ/2' },
				{ value: 'Z3', label: 'ℤ/3' },
				{ value: 'Q', label: 'ℚ' }
			]}
		/>
	</Controls>
</div>

<style>
	.uct {
		padding-top: 0.9rem;
	}
	.chains {
		padding: 0 1.2rem 0.4rem;
		display: grid;
		gap: 0.2rem;
		justify-items: center;
		font-size: 0.95rem;
	}
	.clabel {
		font-size: 0.74rem;
		color: var(--gold);
		letter-spacing: 0.04em;
	}
	.cline {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		justify-content: center;
		max-width: 100%;
		overflow-x: auto;
	}
	.tag {
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.tw {
		overflow-x: auto;
		margin: 0.4rem 1rem;
		border: 1px solid var(--line-faint);
		border-radius: 12px;
		background: rgba(5, 9, 18, 0.45);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 0 !important;
		font-size: 0.95rem;
	}
	thead th {
		text-transform: none !important;
		letter-spacing: 0 !important;
		color: var(--ink-dim) !important;
		font-family: var(--font-body) !important;
		font-size: 0.9rem !important;
		font-weight: 400 !important;
	}
	th,
	td {
		padding: 0.5rem 0.6rem !important;
		text-align: center !important;
		border-bottom: 1px solid var(--line-faint);
		vertical-align: middle;
	}
	tbody th {
		text-align: left !important;
		font-family: var(--font-body) !important;
		text-transform: none !important;
		letter-spacing: 0 !important;
		color: var(--ink-bright) !important;
		font-size: 0.95rem !important;
		font-weight: 400 !important;
		white-space: nowrap;
	}
	.sub {
		display: block;
		font-size: 0.64rem;
		color: var(--ink-faint);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	tr.input td {
		color: var(--ink-dim);
	}
	.tot {
		font-size: 1.05rem;
		color: var(--gold-bright);
	}
	td.shift .tot {
		color: var(--rose);
	}
	.parts {
		font-size: 0.72rem;
		color: var(--ink-faint);
		white-space: nowrap;
	}
	.op {
		margin: 0 0.25rem;
	}
	td.shift .tor {
		color: var(--rose);
	}
	.from {
		font-size: 0.64rem;
		color: var(--rose);
		letter-spacing: 0.03em;
	}
	td.shift {
		background: rgba(242, 141, 182, 0.07);
	}
	.legend {
		display: grid;
		gap: 0.2rem;
		padding: 0 1.2rem 0.7rem;
		font-size: 0.78rem;
		color: var(--ink-dim);
		text-align: center;
	}
	.rose {
		color: var(--rose);
	}
	.ok {
		color: var(--green);
	}
	.bad {
		color: var(--rose);
	}
</style>
