<script lang="ts">
	// The arms race of invariants. Pick two knots and line up what each
	// invariant says about them: where the values agree the invariant cannot
	// tell the knots apart; the first row that disagrees proves they are
	// different. Each famous pair defeats one invariant after another.
	import TeX from '$lib/components/prose/TeX.svelte';
	import table from '$lib/knots/invariants.json';

	type Row = { id: string; name: string; crossings: number; col3: number; det: number; alexander: string; jones: string; kh: Record<string, number> };
	const knots = table as unknown as Row[];
	const byId = new Map(knots.map((k) => [k.id, k]));

	const pairs: { a: string; b: string; label: string }[] = [
		{ a: '3_1', b: '3_1*', label: 'the trefoil and its mirror' },
		{ a: 'granny', b: 'square', label: 'granny and square' },
		{ a: '6_1', b: '9_46', label: '6₁ and 9₄₆' },
		{ a: '5_1*', b: '10_132', label: '5₁ and 10₁₃₂' },
		{ a: 'unknot', b: '4_1', label: 'the unknot and 4₁' }
	];
	let a = $state('3_1');
	let b = $state('3_1*');

	const khTeX = (kh: Record<string, number>) =>
		Object.entries(kh)
			.map(([g, d]) => {
				const [i, j] = g.split(',').map(Number);
				return { i, j, d };
			})
			.sort((x, y) => x.i - y.i || x.j - y.j)
			.map(({ i, j, d }) => `${d > 1 ? d : ''}${i ? `t^{${i}}` : ''}q^{${j}}`)
			.join(' + ');
	const rows = $derived.by(() => {
		const A = byId.get(a)!;
		const B = byId.get(b)!;
		return [
			{ k: 'Three-colourings', x: `${A.col3}`, y: `${B.col3}`, tex: false },
			{ k: 'Determinant', x: `${A.det}`, y: `${B.det}`, tex: false },
			{ k: 'Alexander polynomial', x: A.alexander, y: B.alexander, tex: true },
			{ k: 'Jones polynomial', x: A.jones, y: B.jones, tex: true },
			{ k: 'Khovanov homology', x: khTeX(A.kh), y: khTeX(B.kh), tex: true }
		].map((r) => ({ ...r, same: r.x === r.y }));
	});
	const first = $derived(rows.findIndex((r) => !r.same));
</script>

<div class="ar">
	<div class="pick ui">
		<label>
			<span>First knot</span>
			<select bind:value={a}>
				{#each knots as k (k.id)}<option value={k.id}>{k.id.replace('*', ' (mirror)')}</option>{/each}
			</select>
		</label>
		<label>
			<span>Second knot</span>
			<select bind:value={b}>
				{#each knots as k (k.id)}<option value={k.id}>{k.id.replace('*', ' (mirror)')}</option>{/each}
			</select>
		</label>
	</div>
	<div class="chips ui" role="group" aria-label="Famous pairs">
		{#each pairs as p (p.label)}
			<button class:on={a === p.a && b === p.b} onclick={() => ((a = p.a), (b = p.b))}>{p.label}</button>
		{/each}
	</div>

	<div class="wrap">
		<table>
			<thead class="ui">
				<tr>
					<th></th>
					<th><TeX tex={byId.get(a)!.name} /> <span class="cn">{byId.get(a)!.crossings} crossings</span></th>
					<th><TeX tex={byId.get(b)!.name} /> <span class="cn">{byId.get(b)!.crossings} crossings</span></th>
					<th></th>
				</tr>
			</thead>
			<tbody>
				{#each rows as r, i (r.k)}
					<tr class:same={r.same} class:first={i === first}>
						<th class="ui">{r.k}</th>
						<td>{#if r.tex}<TeX tex={r.x} />{:else}{r.x}{/if}</td>
						<td>{#if r.tex}<TeX tex={r.y} />{:else}{r.y}{/if}</td>
						<td class="ui verdict">{a === b ? '' : r.same ? 'same' : i === first ? 'tells them apart' : 'different'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="read ui" aria-live="polite">
		{#if a === b}
			Choose two different knots.
		{:else if first < 0}
			None of these invariants can tell them apart.
		{:else if first === 0}
			The {rows[0].k.toLowerCase()} already tells them apart.
		{:else}
			{rows.slice(0, first).map((r) => r.k.toLowerCase()).join(', ')} cannot tell them apart; the {rows[first].k.toLowerCase()} can.
		{/if}
	</p>
</div>

<style>
	.ar {
		display: grid;
		gap: 0.6rem;
		padding: 0.8rem 1rem 1rem;
	}
	.pick {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.4rem;
		justify-content: center;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	label {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	select {
		font: inherit;
		color: var(--ink);
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--line);
		border-radius: 8px;
		padding: 0.25rem 0.5rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
	}
	.chips button {
		font: inherit;
		font-size: 0.78rem;
		padding: 0.26rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		cursor: pointer;
	}
	.chips button.on {
		color: var(--gold-bright);
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.12);
	}
	.wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.86rem;
	}
	th,
	td {
		padding: 0.45rem 0.6rem;
		border-bottom: 1px solid var(--line-faint);
		text-align: left;
		vertical-align: middle;
	}
	thead th {
		color: var(--gold-bright);
		font-weight: 500;
	}
	.cn {
		margin-left: 0.4rem;
		font-family: var(--font-ui);
		font-size: 0.68rem;
		color: var(--ink-faint);
	}
	tbody th {
		font-size: 0.76rem;
		font-weight: 600;
		color: var(--ink-dim);
		white-space: nowrap;
	}
	td {
		color: var(--ink);
	}
	tr.same td {
		color: var(--ink-faint);
	}
	.verdict {
		font-size: 0.72rem;
		white-space: nowrap;
		color: var(--rose);
	}
	tr:not(.same) .verdict {
		color: var(--green);
	}
	tr.first {
		background: rgba(132, 217, 162, 0.07);
	}
	tr.first .verdict {
		font-weight: 700;
	}
	.read {
		margin: 0;
		text-align: center;
		font-size: 0.84rem;
		color: var(--ink-dim);
		text-wrap: balance;
	}
</style>
