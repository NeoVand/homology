<script lang="ts">
	// Isomorphism = renaming. Rename the four rotations of a square (or the four
	// symmetries of a rectangle) as 0, 1, 2, 3 and compare, cell by cell, with
	// the addition table of ℤ/4.
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import { residueColor } from './zn';

	type Kind = 'square' | 'rect';
	let kind = $state<Kind>('square');
	let ri = $state(0);

	const groups: Record<Kind, { names: string[]; words: string[]; table: number[][] }> = {
		square: {
			names: ['e', '\\rho', '\\rho^2', '\\rho^3'],
			words: ['do nothing', 'quarter turn', 'half turn', 'three-quarter turn'],
			table: [0, 1, 2, 3].map((i) => [0, 1, 2, 3].map((j) => (i + j) % 4))
		},
		rect: {
			names: ['e', 'h', 'v', 't'],
			words: ['do nothing', 'flip top↔bottom', 'flip left↔right', 'half turn'],
			// e, h, v, t: each squares to e; any two different non-identity ones give the third
			table: [
				[0, 1, 2, 3],
				[1, 0, 3, 2],
				[2, 3, 0, 1],
				[3, 2, 1, 0]
			]
		}
	};

	// the six bijections with e ↦ 0: the numbers given to elements 1, 2, 3
	const renamings = [
		[1, 2, 3],
		[3, 2, 1],
		[2, 1, 3],
		[1, 3, 2],
		[2, 3, 1],
		[3, 1, 2]
	];

	const G = $derived(groups[kind]);
	const name = $derived([0, ...renamings[ri]]);
	// position of number q among the elements (inverse renaming)
	const elOf = $derived(Object.fromEntries(name.map((q, el) => [q, el])) as Record<number, number>);
	const cells = $derived(
		[0, 1, 2, 3].map((p) =>
			[0, 1, 2, 3].map((q) => {
				const renamed = name[G.table[elOf[p]][elOf[q]]];
				const want = (p + q) % 4;
				return { renamed, want, ok: renamed === want };
			})
		)
	);
	const matches = $derived(cells.flat().filter((c) => c.ok).length);
	const iso = $derived(matches === 16);
</script>

<div class="ren">
	<div class="top">
		<Segmented
			bind:value={kind}
			options={[
				{ value: 'square', label: 'Rotations of a square' },
				{ value: 'rect', label: 'Symmetries of a rectangle' }
			]}
			label="Which group"
			onchange={() => (ri = 0)}
		/>
	</div>

	<div class="panes">
		<div class="pane">
			<div class="shape">
				<Svg viewBox="-80 -62 160 124" maxHeight={120} label={kind === 'square' ? 'A square with a quarter-turn arrow' : 'A rectangle with its two mirror axes and a half-turn arrow'}>
					{#if kind === 'square'}
						<rect x="-40" y="-40" width="80" height="80" rx="3" fill="rgba(164,147,255,0.18)" stroke="#b9b0ff" stroke-width="1.8" />
						<circle cx="-40" cy="-40" r="5" fill="#f2d08f" />
						<path d="M 52 -8 A 54 54 0 0 0 10 -52" fill="none" stroke="#f2d08f" stroke-width="1.5" marker-end="url(#arrow-gold)" />
						<text x="58" y="-34" class="t">ρ</text>
					{:else}
						<rect x="-58" y="-30" width="116" height="60" rx="3" fill="rgba(95,214,207,0.14)" stroke="#5fd6cf" stroke-width="1.8" />
						<circle cx="-58" cy="-30" r="5" fill="#f2d08f" />
						<line x1="-74" y1="0" x2="74" y2="0" stroke="#f28db6" stroke-dasharray="4 4" stroke-width="1.3" />
						<line x1="0" y1="-46" x2="0" y2="46" stroke="#a493ff" stroke-dasharray="4 4" stroke-width="1.3" />
						<text x="68" y="-6" class="t">h</text>
						<text x="6" y="-48" class="t">v</text>
					{/if}
				</Svg>
			</div>
			<div class="cap ui">Its own table (names)</div>
			<div class="grid">
				<div class="h"><TeX tex={'\\circ'} /></div>
				{#each G.names as nm, j (j)}<div class="h"><TeX tex={nm} /></div>{/each}
				{#each G.names as rowName, i (i)}
					<div class="h"><TeX tex={rowName} /></div>
					{#each G.names as _, j (j)}
						{@const v = G.table[i][j]}
						<div class="c" style="--c:{residueColor(name[v], 4)}"><TeX tex={G.names[v]} /></div>
					{/each}
				{/each}
			</div>
		</div>

		<div class="arrow ui" aria-hidden="true">
			<span>rename</span>
			<svg viewBox="0 0 60 20" width="60" height="20"><path d="M2 10 H 52" stroke="#d8b26e" stroke-width="1.5" /><path d="M48 5 L 56 10 L 48 15" fill="none" stroke="#d8b26e" stroke-width="1.5" /></svg>
		</div>

		<div class="pane">
			<div class="mapping ui">
				{#each G.names as nm, el (el)}
					<span class="mp"><TeX tex={`${nm} \\mapsto ${name[el]}`} /></span>
				{/each}
			</div>
			<button class="next ui" onclick={() => (ri = (ri + 1) % 6)}>Try another renaming ({ri + 1}/6)</button>
			<div class="cap ui">After renaming, compared with <TeX tex={'\\mathbb{Z}/4'} /></div>
			<div class="grid">
				<div class="h"><TeX tex={'+'} /></div>
				{#each [0, 1, 2, 3] as q (q)}<div class="h">{q}</div>{/each}
				{#each [0, 1, 2, 3] as p (p)}
					<div class="h">{p}</div>
					{#each [0, 1, 2, 3] as q (q)}
						{@const cell = cells[p][q]}
						<div class="c cmp" class:ok={cell.ok} class:bad={!cell.ok} style="--c:{residueColor(cell.renamed, 4)}">
							{cell.renamed}{#if !cell.ok}<span class="want">≠{cell.want}</span>{/if}
						</div>
					{/each}
				{/each}
			</div>
		</div>
	</div>

	<div class="verdict ui" class:iso>
		{#if iso}
			All 16 entries agree with <TeX tex={'\\mathbb{Z}/4'} />: this renaming is an <b>isomorphism</b>.
		{:else}
			{matches} of 16 entries agree.
			{#if kind === 'rect'}
				No renaming can work: every rectangle symmetry done twice is <TeX tex={'e'} />, but in <TeX tex={'\\mathbb{Z}/4'} /> we have <TeX tex={'1 + 1 = 2 \\neq 0'} />.
			{:else}
				Not this one — try another renaming.
			{/if}
		{/if}
	</div>
</div>

<style>
	.ren {
		padding: 1rem 1.2rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	@media (max-width: 600px) {
		.ren {
			padding: 0.8rem 0.6rem 1rem;
		}
	}
	.top {
		display: flex;
		justify-content: center;
	}
	.panes {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		gap: 0.8rem;
		align-items: end;
	}
	@media (max-width: 680px) {
		.panes {
			grid-template-columns: minmax(0, 1fr);
		}
		.arrow {
			transform: rotate(90deg);
			justify-self: center;
		}
	}
	.pane {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		align-items: center;
		min-width: 0;
	}
	.shape {
		width: 9rem;
	}
	.t {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 15px;
		fill: var(--ink-bright) !important;
	}
	.cap {
		font-size: 0.72rem;
		color: var(--ink-faint);
		letter-spacing: 0.03em;
	}
	.arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		padding-bottom: 4.5rem;
	}
	@media (max-width: 680px) {
		.arrow {
			padding: 0;
		}
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(5, 2.55rem);
		gap: 3px;
	}
	.h,
	.c {
		height: 2.55rem;
		display: grid;
		place-items: center;
		border-radius: 6px;
		font-size: 0.95rem;
	}
	.h {
		color: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 0.82rem;
	}
	.c {
		color: #0b1020;
		background: color-mix(in oklch, var(--c) 80%, #0b1020);
		font-weight: 600;
	}
	.cmp {
		font-family: var(--font-ui);
		position: relative;
	}
	.cmp.ok {
		box-shadow: inset 0 0 0 2px rgba(132, 217, 162, 0.9);
	}
	.cmp.bad {
		background: rgba(242, 141, 182, 0.16);
		color: var(--rose);
		box-shadow: inset 0 0 0 2px rgba(242, 141, 182, 0.8);
	}
	.want {
		position: absolute;
		right: 3px;
		bottom: 1px;
		font-size: 0.6rem;
		color: var(--ink-dim);
		font-weight: 500;
	}
	.mapping {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.2rem 0.8rem;
		font-size: 0.9rem;
		color: var(--gold-bright);
	}
	.next {
		background: none;
		border: 1px solid var(--line);
		color: var(--gold-bright);
		border-radius: 9px;
		padding: 0.4rem 0.8rem;
		font-size: 0.76rem;
		cursor: pointer;
		min-height: 2rem;
	}
	.next:hover {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.1);
	}
	.verdict {
		text-align: center;
		font-size: 0.86rem;
		color: var(--rose);
		line-height: 1.6;
	}
	.verdict.iso {
		color: var(--green);
	}
</style>
