<script lang="ts">
	// The same space through four lenses: integer homology, and Betti numbers
	// over ℚ, ℤ/2 and ℤ/3. Torsion vanishes over ℚ; a ℤ/p summand in H_k shows
	// up mod p twice, once in degree k and once in degree k + 1.
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { groupTeX } from '$lib/math/homology';
	import { hollowTetrahedron, torusGrid, kleinGrid, projectivePlane, mobiusBand, genus2, type Example } from '../homology-groups/complexes';
	import { wrappedDisk, lensesOf, torsionDivisible } from './spaces';
	import { renderMathInText } from '$lib/katex/render';

	const spaces: { ex: Example; label: string }[] = [
		{ ex: hollowTetrahedron(), label: 'Sphere' },
		{ ex: torusGrid(), label: 'Torus' },
		{ ex: kleinGrid(), label: 'Klein bottle' },
		{ ex: projectivePlane(), label: 'ℝP²' },
		{ ex: mobiusBand(), label: 'Möbius band' },
		{ ex: genus2(), label: 'Genus 2' },
		{ ex: wrappedDisk(3), label: 'Triple-wrapped disk' }
	];
	let id = $state('klein');
	const S = $derived(spaces.find((s) => s.ex.id === id)!);
	const L = $derived(lensesOf(S.ex.K));
	const dims = $derived(L.Z.map((_, k) => k));

	/** the parts of a mod-p Betti number: free part, torsion in degree k, torsion in degree k−1 */
	function parts(k: number, p: number) {
		const free = L.Z[k].rank;
		const here = torsionDivisible(L.Z[k], p);
		const below = k > 0 ? torsionDivisible(L.Z[k - 1], p) : 0;
		return { free, here, below };
	}
	const primesOf = (d: number) => [2, 3, 5, 7, 11, 13].filter((p) => d % p === 0);
	const note = $derived.by(() => {
		const tors = L.Z.flatMap((g, k) => g.torsion.map((d) => ({ k, d })));
		if (!tors.length) return 'No torsion: all four lenses report the same Betti numbers.';
		return tors
			.map(({ k, d }) => {
				const ps = primesOf(d).map((p) => `\\(${p}\\)`).join(' and ');
				return `The \\(\\Z/${d}\\) in \\(H_${k}\\) disappears over \\(\\Q\\). Modulo ${ps} it appears twice: in \\(H_${k}\\) and again in \\(H_${k + 1}\\).`;
			})
			.join(' ');
	});
</script>

<div class="cl">
	<div class="top ui">
		<Segmented value={id} options={spaces.map((s) => ({ value: s.ex.id, label: s.label }))} onchange={(v) => (id = v)} label="Choose a space" />
	</div>
	<div class="wrap">
		<table class="lt">
			<thead>
				<tr>
					<th></th>
					<th class="h">over <TeX tex={'\\Z'} /><span class="sub">groups</span></th>
					<th class="h">over <TeX tex={'\\Q'} /><span class="sub">dimension</span></th>
					<th class="h">over <TeX tex={'\\Z/2'} /><span class="sub">dimension</span></th>
					<th class="h">over <TeX tex={'\\Z/3'} /><span class="sub">dimension</span></th>
				</tr>
			</thead>
			<tbody>
				{#each dims as k (k)}
					<tr>
						<td class="k"><TeX tex={`H_${k}`} /></td>
						<td class="z" class:tor={L.Z[k].torsion.length > 0}><TeX tex={groupTeX(L.Z[k])} /></td>
						<td>{L.Q[k]}</td>
						{#each [2, 3] as p (p)}
							{@const pr = parts(k, p)}
							<td class:extra={pr.here + pr.below > 0}>
								<span class="v">{p === 2 ? L.Z2[k] : L.Z3[k]}</span>
								{#if pr.here + pr.below > 0}
									<span class="split">{'= ' + [pr.free, pr.here, pr.below].filter((x, i) => i === 0 || x > 0).join(' + ')}</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="note">{@html renderMathInText(note)}</p>
</div>

<style>
	.cl {
		padding: 0.8rem 1.1rem 0.9rem;
	}
	.top {
		margin-bottom: 0.6rem;
	}
	.wrap {
		overflow-x: auto;
	}
	.lt {
		margin: 0 auto !important;
		width: auto !important;
		min-width: 22rem;
		font-size: 1rem !important;
	}
	.lt th,
	.lt td {
		text-align: center !important;
		padding: 0.5em 1em !important;
		white-space: nowrap;
	}
	.lt th.h {
		text-transform: none !important;
		letter-spacing: 0.02em !important;
		font-size: 0.8rem !important;
	}
	.sub {
		display: block;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		font-weight: 500;
	}
	td.k {
		color: var(--ink-dim);
	}
	td.z {
		color: var(--ink-bright);
	}
	td.z.tor {
		background: rgba(242, 141, 182, 0.1);
	}
	td.extra .v {
		color: var(--rose);
		font-weight: 700;
	}
	.split {
		display: block;
		font-family: var(--font-ui);
		font-size: 0.7rem;
		color: var(--ink-faint);
	}
	.note {
		margin: 0.7rem auto 0;
		max-width: 40rem;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
	}
	/* phones: all five columns on screen at once */
	@container figure (max-width: 30rem) {
		.cl {
			padding: 0.8rem 0.4rem 0.9rem;
		}
		.lt {
			min-width: 0;
			font-size: 0.92rem !important;
		}
		.lt th,
		.lt td {
			padding: 0.5em 0.4em !important;
		}
		.sub {
			letter-spacing: 0.04em;
			font-size: 0.6rem;
		}
	}
</style>
