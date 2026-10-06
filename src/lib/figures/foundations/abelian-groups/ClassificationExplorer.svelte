<script lang="ts">
	// Type a relation matrix (one row per generator, one column per relation),
	// step through its diagonalisation by integer row and column operations,
	// and read off the group ℤ^r ⊕ ℤ/d₁ ⊕ ⋯.
	import TeX from '$lib/components/prose/TeX.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { snfFull, groupTeX, type Matrix } from './snf';

	const gens = ['a', 'b', 'c'];
	let A = $state<Matrix>([
		[2, 1],
		[1, 2]
	]);
	let step = $state(0);

	const m = $derived(A.length);
	const k = $derived(A[0]?.length ?? 0);
	const res = $derived(snfFull(A));
	const free = $derived(m - res.rank);
	const torsion = $derived(res.diag.filter((d) => d > 1));
	const order = $derived(torsion.reduce((p, d) => p * d, 1));
	const cur = $derived(res.steps[Math.min(step, res.steps.length - 1)]);

	$effect(() => {
		void res;
		step = 0;
	});

	function resize(rows: number, cols: number) {
		A = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => A[i]?.[j] ?? 0));
	}
	function setEntry(i: number, j: number, v: string) {
		const x = Math.max(-99, Math.min(99, Math.round(Number(v) || 0)));
		A = A.map((row, r) => row.map((y, c) => (r === i && c === j ? x : y)));
	}

	function relTeX(j: number): string {
		let out = '';
		for (let i = 0; i < m; i++) {
			const c = A[i][j];
			if (!c) continue;
			const mag = Math.abs(c) === 1 ? '' : String(Math.abs(c));
			out += out ? (c < 0 ? ' - ' : ' + ') + mag + gens[i] : (c < 0 ? '-' : '') + mag + gens[i];
		}
		return (out || '0') + ' = 0';
	}
	const presTeX = $derived.by(() => {
		const rels = Array.from({ length: k }, (_, j) => relTeX(j));
		const stacked = k >= 3 || (m >= 3 && k >= 2);
		const body = stacked ? `\\begin{gathered} ${rels.join(' \\\\ ')} \\end{gathered}` : rels.join(',\\ ');
		return `\\left\\langle ${gens.slice(0, m).join(', ')} \\;\\middle|\\; ${body} \\right\\rangle`;
	});

	const presets: { label: string; A: Matrix }[] = [
		{ label: 'the lattice example', A: [[2, 1], [1, 2]] },
		{ label: 'Klein bottle, H₁', A: [[2], [0]] },
		{ label: 'torus, H₁', A: [[0], [0]] },
		{ label: 'projective plane, H₁', A: [[2]] },
		{ label: 'ℤ/4 ⊕ ℤ/6', A: [[4, 0], [0, 6]] },
		{ label: 'ℤ/12 ⊕ ℤ/18', A: [[12, 0], [0, 18]] },
		{ label: 'a 3 × 3 example', A: [[2, 4, 4], [-6, 6, 12], [10, -4, -16]] }
	];
</script>

<div class="cls">
	<div class="left">
		<div class="sizes ui">
			<span>generators</span>
			{#each [1, 2, 3] as r (r)}
				<button class="sz" class:on={m === r} onclick={() => resize(r, k)}>{r}</button>
			{/each}
			<span class="sep">relations</span>
			{#each [1, 2, 3] as c (c)}
				<button class="sz" class:on={k === c} onclick={() => resize(m, c)}>{c}</button>
			{/each}
		</div>
		<div class="editor" style="--k:{k}">
			<span class="corner"></span>
			{#each Array.from({ length: k }, (_, j) => j) as j (j)}
				<span class="colh ui">rel. {j + 1}</span>
			{/each}
			{#each A as row, i (i)}
				<span class="rowh"><TeX tex={gens[i]} /></span>
				{#each row as val, j (j)}
					<input
						type="number"
						inputmode="numeric"
						value={val}
						aria-label="coefficient of {gens[i]} in relation {j + 1}"
						oninput={(e) => setEntry(i, j, (e.currentTarget as HTMLInputElement).value)}
					/>
				{/each}
			{/each}
		</div>
		<div class="pres"><TeX tex={presTeX} /></div>
		<div class="presets ui">
			{#each presets as p (p.label)}
				<button onclick={() => (A = p.A.map((r) => r.slice()))}>{p.label}</button>
			{/each}
		</div>
	</div>

	<div class="right">
		<div class="stepview">
			<MatrixView
				M={cur.M}
				highlightRows={cur.rows ?? []}
				highlightCols={cur.cols ?? []}
				cellClass={(i, j) => (cur.pivot && cur.pivot[0] === i && cur.pivot[1] === j ? 'pivot' : undefined)}
			/>
			<div class="steptext ui">{cur.text}</div>
		</div>
		<StepControls bind:step count={res.steps.length} interval={1300} />
		<div class="result">
			<div class="diag ui">
				invariant factors: <TeX tex={res.diag.length ? res.diag.join(',\\ ') : '\\text{none}'} />
				{#if res.diag.some((d) => d === 1)}<span class="dim">(each 1 contributes nothing)</span>{/if}
			</div>
			<div class="grp"><TeX tex={`\\cong\\; ${groupTeX(free, torsion)}`} /></div>
			<div class="facts ui">
				<span>rank (free part): <b>{free}</b></span>
				<span>torsion: <TeX tex={torsion.length ? torsion.map((d) => `\\mathbb{Z}/${d}`).join(' \\oplus ') : '0'} /></span>
				{#if torsion.length}<span>torsion has {order} elements</span>{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.cls {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
		gap: 1.2rem 1.6rem;
		padding: 1rem 1.3rem 1.2rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.cls {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.8rem 0.7rem 1rem;
		}
	}
	.left,
	.right {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		min-width: 0;
	}
	.sizes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.sep {
		margin-left: 0.8rem;
	}
	.sz {
		width: 2rem;
		height: 2rem;
		border-radius: 8px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
	}
	.sz.on {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		font-weight: 700;
		border-color: transparent;
	}
	.editor {
		display: grid;
		grid-template-columns: 2rem repeat(var(--k), 4.2rem);
		gap: 0.35rem;
		align-items: center;
		justify-content: start;
	}
	.colh {
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		color: var(--ink-faint);
		text-align: center;
	}
	.rowh {
		color: var(--violet);
		text-align: center;
	}
	input {
		width: 100%;
		height: 2.4rem;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(6, 10, 20, 0.7);
		color: var(--ink-bright);
		font-family: var(--font-ui);
		font-size: 0.95rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
		-moz-appearance: textfield;
		appearance: textfield;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}
	input:focus {
		outline: none;
		border-color: var(--gold);
		box-shadow: 0 0 0 3px rgba(216, 178, 110, 0.2);
	}
	.pres {
		font-size: 0.98rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.presets button {
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
		color: var(--ink-dim);
		border-radius: 999px;
		padding: 0.25rem 0.65rem;
		font-size: 0.72rem;
		cursor: pointer;
		min-height: 2rem;
	}
	.presets button:hover {
		color: var(--gold-bright);
		border-color: var(--line);
	}
	.stepview {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		padding: 0.8rem 0.6rem;
		border-radius: 12px;
		background: rgba(6, 10, 20, 0.5);
		border: 1px solid var(--line-faint);
		min-height: 9rem;
		justify-content: center;
	}
	.steptext {
		font-size: 0.8rem;
		color: var(--ink-dim);
		text-align: center;
		min-height: 2.4em;
		max-width: 26rem;
	}
	.result {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.diag {
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.dim {
		color: var(--ink-faint);
		font-size: 0.74rem;
	}
	.grp {
		font-size: 1.4rem;
		color: var(--gold-bright);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 1.2rem;
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.facts b {
		color: var(--ink-bright);
	}
</style>
