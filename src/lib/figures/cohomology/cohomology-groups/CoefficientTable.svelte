<script lang="ts">
	// Figure: pick a space; see its homology with ℤ coefficients next to its
	// cohomology with ℤ, ℤ/2 and ℝ coefficients — all computed live by the
	// book's homology engine from a triangulation. Torsion glows rose, and the
	// table shows where it lands.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { spaces, tableFor } from './coefficients';

	let id = $state('rp2');
	const T = $derived(tableFor(id));
	const S = $derived(spaces.find((s) => s.id === id)!);
	const K = $derived(S.make());
	const degrees = $derived(T.hom.map((_, k) => k));
	const chi = $derived(T.betti.reduce((acc, b, k) => acc + (k % 2 ? -b : b), 0));
	const chiTeX = $derived(
		`\\chi = ${T.betti.map((b, k) => (k === 0 ? String(b) : `${k % 2 ? '-' : '+'} ${b}`)).join(' ')} = ${chi}`
	);
	const shift = $derived(T.hom.findIndex((g) => g.torsion));
	const torTeX = $derived(shift >= 0 ? T.torsion[shift].map((n) => `\\Z/${n}`).join(' \\oplus ') : '');
	const rows = $derived([
		{ name: 'H_k(X;\\,\\Z)', cells: T.hom, cls: 'hom' },
		{ name: 'H^k(X;\\,\\Z)', cells: T.Z, cls: 'z' },
		{ name: 'H^k(X;\\,\\Z/2)', cells: T.Z2, cls: 'z2' },
		{ name: 'H^k(X;\\,\\R)', cells: T.R, cls: 'r' }
	]);
</script>

<Controls>
	<Segmented bind:value={id} options={spaces.map((s) => ({ value: s.id, label: s.label }))} label="Choose a space" />
</Controls>
<div class="ct">
	<div class="meta ui">
		<span class="nm">{S.label}</span>
		<span class="note">{S.note} · triangulated with {K.fVector.join(', ')} vertices, edges, triangles · χ = {K.eulerCharacteristic()}</span>
	</div>
	<div class="table-wrap">
		<table>
			<thead>
				<tr>
					<th></th>
					{#each degrees as k (k)}<th class="deg">k = {k}</th>{/each}
				</tr>
			</thead>
			<tbody>
				{#each rows as r (r.cls)}
					<tr class={r.cls}>
						<th class="rh"><TeX tex={r.name} /></th>
						{#each r.cells as c, k (k)}
							<td class:tor={c.torsion}>
								<TeX tex={c.tex} />
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="foot ui">
		{#if shift >= 0}
			<span class="rose">Torsion:</span> the <TeX tex={torTeX} /> in homology degree {shift} reappears in integer cohomology degree
			{shift + 1}; the free parts match degree by degree.
		{:else}
			No torsion: integer cohomology has the same free part as homology in each degree.
		{/if}
		Euler characteristic from the real dimensions: <TeX tex={chiTeX} />, the same as \(V - E + F\).
	</p>
</div>

<style>
	.ct {
		padding: 0.9rem 1.1rem 0.8rem;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.9rem;
		margin-bottom: 0.6rem;
	}
	.nm {
		font-size: 0.95rem;
		font-weight: 650;
		color: var(--gold-bright);
	}
	.note {
		font-size: 0.76rem;
		color: var(--ink-faint);
	}
	table {
		width: 100%;
		border-collapse: collapse;
		margin: 0;
	}
	/* doubled classes beat the page-wide .prose table styles (uppercase UI headers) */
	.ct.ct th,
	.ct.ct td {
		padding: 0.55em 0.7em;
		border-bottom: 1px solid var(--line-faint);
		text-align: center;
		text-transform: none;
		letter-spacing: normal;
	}
	.ct.ct .deg {
		font-family: var(--font-ui);
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		color: var(--gold);
		font-weight: 600;
	}
	.ct.ct .rh {
		font-family: var(--font-body);
		font-size: 1rem;
		text-align: left;
		white-space: nowrap;
		color: var(--ink-dim);
		font-weight: 400;
	}
	.ct.ct tr.hom .rh {
		color: var(--violet);
	}
	td {
		color: var(--ink-bright);
		font-size: 1.02rem;
		transition: background 0.3s var(--ease);
	}
	td.tor {
		color: var(--rose);
		background: rgba(242, 141, 182, 0.1);
		box-shadow: inset 0 0 0 1px rgba(242, 141, 182, 0.4);
	}
	.foot {
		font-size: 0.8rem;
		color: var(--ink-dim);
		line-height: 1.55;
		margin: 0.7rem 0 0;
	}
	.rose {
		color: var(--rose);
		font-weight: 600;
	}
</style>
