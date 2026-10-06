<script lang="ts">
	// "Group or impostor?": pick a candidate (set, operation), predict which
	// axioms hold, then check — and test the operation on elements you choose.
	import TeX from '$lib/components/prose/TeX.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { candidates, sameValue, type Verdict } from './axioms';
	import Mark from '$lib/components/ui/Mark.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ChevronLeftIcon, ChevronRightIcon } from '$lib/icons';

	let ci = $state(1);
	let shown = $state<boolean[]>([false, false, false, false]);
	// the same starting picks that choose() makes
	let ia = $state(2);
	let ib = $state(4);
	let ic = $state(1);

	const c = $derived(candidates[ci]);

	function choose(i: number) {
		ci = i;
		shown = [false, false, false, false];
		const k = candidates[i].sample.length;
		ia = Math.min(2, k - 1);
		ib = Math.min(4, k - 1);
		ic = Math.min(1, k - 1);
	}

	const rows = $derived<{ name: string; v: Verdict; what: string }[]>([
		{ name: 'Closure', v: c.closure, what: 'combining two elements stays inside the set' },
		{ name: 'Associativity', v: c.assoc, what: 'brackets do not matter' },
		{ name: 'Identity', v: c.identity, what: 'some element does nothing' },
		{ name: 'Inverses', v: c.inverses, what: 'every element can be undone' }
	]);

	const allShown = $derived(shown.every(Boolean));
	const isGroup = $derived(c.closure.ok && c.assoc.ok && c.identity.ok && c.inverses.ok);

	const A = $derived(c.sample[ia]);
	const B = $derived(c.sample[ib]);
	const C = $derived(c.sample[ic]);
	const ab = $derived(c.apply(A, B));
	const left = $derived(c.apply(ab, C));
	const right = $derived(c.apply(A, c.apply(B, C)));
	const ba = $derived(c.apply(B, A));
	const arg = (x: number) => (typeof x === 'number' && x < 0 && /^-/.test(c.fmt(x)) ? `(${c.fmt(x)})` : c.fmt(x));

	const cycle = (i: number, d: number) => (i + d + c.sample.length) % c.sample.length;
</script>

<div class="ax">
	<div class="chips ui" role="radiogroup" aria-label="Candidate set and operation">
		{#each candidates as cand, i (cand.id)}
			<button class="chip" class:on={i === ci} role="radio" aria-checked={i === ci} onclick={() => choose(i)}>
				<TeX tex={`(${cand.set},\\, ${cand.op})`} />
			</button>
		{/each}
	</div>

	<div class="card">
		<div class="title">
			<span class="big"><TeX tex={`(${c.set},\\ ${c.op})`} /></span>
			<span class="name">{c.name}</span>
		</div>

		<div class="rows">
			{#each rows as r, i (r.name)}
				<div class="row" class:open={shown[i]}>
					<button
						class="rowhead ui"
						onclick={() => (shown[i] = true)}
						aria-expanded={shown[i]}
						aria-label="Check {r.name}"
					>
						<span class="ax-name">{r.name}</span>
						<span class="what">{r.what}</span>
						{#if shown[i]}
							<span class="mark" class:ok={r.v.ok === true} class:bad={r.v.ok === false} class:na={r.v.ok === null}>
								{#if r.v.ok === true}<Mark ok /> holds{:else if r.v.ok === false}<Mark ok={false} /> fails{:else}not applicable{/if}
							</span>
						{:else}
							<span class="mark ask">check?</span>
						{/if}
					</button>
					{#if shown[i]}
						<div class="why">{@html renderMathInText(r.v.why)}</div>
					{/if}
				</div>
			{/each}
		</div>

		<div class="verdict ui">
			{#if allShown}
				{#if isGroup}
					<span class="ok">A group{c.abelian ? ' — and an abelian one' : ' — but not an abelian one'}.</span>
				{:else}
					<span class="bad">Not a group.</span>
				{/if}
				<span class="note">{@html renderMathInText(c.note)}</span>
			{:else}
				<span class="dim">Predict each axiom, then tap it to check.</span>
				<Button variant="subtle" onclick={() => (shown = [true, true, true, true])}>Reveal all</Button>
			{/if}
		</div>
	</div>

	<div class="bench">
		<div class="bench-title ui">Test bench — choose elements:</div>
		<div class="pickers ui">
			{#each [['a', ia], ['b', ib], ['c', ic]] as [lbl, idx], k (lbl)}
				<span class="picker">
					<span class="pl"><TeX tex={String(lbl)} /><span class="eq">&nbsp;=</span></span>
					<button
						class="st"
						aria-label="previous value for {lbl}"
						onclick={() => (k === 0 ? (ia = cycle(ia, -1)) : k === 1 ? (ib = cycle(ib, -1)) : (ic = cycle(ic, -1)))}
						><Icon icon={ChevronLeftIcon} size={15} stroke={1.8} /></button
					>
					<span class="pv"><TeX tex={c.fmt(c.sample[idx as number])} /></span>
					<button
						class="st"
						aria-label="next value for {lbl}"
						onclick={() => (k === 0 ? (ia = cycle(ia, 1)) : k === 1 ? (ib = cycle(ib, 1)) : (ic = cycle(ic, 1)))}
						><Icon icon={ChevronRightIcon} size={15} stroke={1.8} /></button
					>
				</span>
			{/each}
		</div>
		<div class="tests">
			<div class="t">
				<TeX tex={`${c.fmt(A)} ${c.op} ${arg(B)} = ${c.fmt(ab)}`} />
				<span class="tag" class:ok={c.inSet(ab)} class:bad={!c.inSet(ab)}>{c.inSet(ab) ? 'in the set' : 'outside the set!'}</span>
			</div>
			<div class="t">
				<TeX tex={`(${c.fmt(A)} ${c.op} ${arg(B)}) ${c.op} ${arg(C)} = ${c.fmt(left)}`} />
				<span class="sep">vs</span>
				<TeX tex={`${c.fmt(A)} ${c.op} (${c.fmt(B)} ${c.op} ${arg(C)}) = ${c.fmt(right)}`} />
				<span class="tag" class:ok={sameValue(left, right)} class:bad={!sameValue(left, right)}
					>{sameValue(left, right) ? 'same' : 'different!'}</span
				>
			</div>
			<div class="t">
				<TeX tex={`${c.fmt(B)} ${c.op} ${arg(A)} = ${c.fmt(ba)}`} />
				<span class="tag" class:ok={sameValue(ab, ba)} class:warn={!sameValue(ab, ba)}
					>{sameValue(ab, ba) ? 'same as' : 'differs from'} <TeX tex={`a ${c.op} b`} /></span
				>
			</div>
		</div>
	</div>
</div>

<style>
	.ax {
		padding: 1rem 1.25rem 1.4rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	@container figure (max-width: 38rem) {
		.ax {
			padding: 0.8rem 1rem 1.4rem;
		}
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		justify-content: center;
	}
	.chip {
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.025);
		color: var(--ink-dim);
		border-radius: 999px;
		padding: 0.28rem 0.7rem;
		font-size: 0.86rem;
		cursor: pointer;
		min-height: 2rem;
		transition: all 0.18s var(--ease);
	}
	.chip:hover {
		color: var(--ink-bright);
		border-color: var(--line);
	}
	.chip.on {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		border-color: transparent;
		box-shadow: 0 2px 12px -2px rgba(216, 178, 110, 0.6);
	}
	.card {
		border: 1px solid var(--line-faint);
		border-radius: 12px;
		background: rgba(6, 10, 20, 0.5);
		padding: 0.9rem 1rem 0.8rem;
	}
	.title {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.9rem;
		margin-bottom: 0.6rem;
	}
	.big {
		font-size: 1.35rem;
		color: var(--gold-bright);
	}
	.name {
		color: var(--ink-dim);
		font-style: italic;
		font-size: 0.95rem;
		text-wrap: pretty;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.row {
		border-radius: 9px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.rowhead {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.3rem 0.8rem;
		flex-wrap: wrap;
		background: none;
		border: 0;
		padding: 0.5rem 0.75rem;
		cursor: pointer;
		text-align: left;
		color: var(--ink);
		min-height: 2.4rem;
	}
	@container figure (max-width: 38rem) {
		.rowhead {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			row-gap: 0.1rem;
		}
		.what {
			grid-column: 1 / -1;
			grid-row: 2;
		}
	}
	.ax-name {
		font-weight: 650;
		font-size: 0.82rem;
		letter-spacing: 0.04em;
		min-width: 6.6rem;
	}
	.what {
		color: var(--ink-faint);
		font-size: 0.78rem;
		flex: 1;
	}
	.mark {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.74rem;
		font-weight: 650;
		letter-spacing: 0.05em;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		white-space: nowrap;
	}
	.mark.ask {
		color: var(--gold);
		border: 1px dashed var(--line-strong);
	}
	.mark.ok {
		color: var(--green);
		background: rgba(132, 217, 162, 0.12);
	}
	.mark.bad {
		color: var(--rose);
		background: rgba(242, 141, 182, 0.13);
	}
	.mark.na {
		color: var(--ink-faint);
		background: rgba(255, 255, 255, 0.05);
	}
	.why {
		padding: 0 0.85rem 0.6rem;
		font-size: 0.92rem;
		color: var(--ink);
	}
	.verdict {
		margin-top: 0.75rem;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.9rem;
		font-size: 0.86rem;
	}
	.verdict .ok {
		color: var(--green);
		font-weight: 650;
	}
	.verdict .bad {
		color: var(--rose);
		font-weight: 650;
	}
	.note {
		color: var(--ink-dim);
		font-family: var(--font-body);
		font-size: 0.92rem;
	}
	.dim {
		color: var(--ink-faint);
	}
	.bench {
		border-top: 1px solid var(--line-faint);
		padding-top: 0.8rem;
	}
	.bench-title {
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-bottom: 0.5rem;
	}
	.pickers {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.2rem;
		margin-bottom: 0.6rem;
	}
	.picker {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
	}
	.pl {
		color: var(--ink-dim);
		font-size: 0.95rem;
	}
	.pv {
		min-width: 2.6rem;
		text-align: center;
		color: var(--violet);
	}
	.st {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1.05rem;
		line-height: 1;
	}
	.st:hover {
		background: rgba(216, 178, 110, 0.15);
	}
	/* phones: three narrow columns, each letter above its own picker */
	@container figure (max-width: 30rem) {
		.pickers {
			display: grid;
			grid-template-columns: repeat(3, auto);
			justify-content: space-between;
			gap: 0.5rem;
		}
		.picker {
			display: grid;
			grid-template-columns: auto auto auto;
			align-items: center;
			justify-items: center;
			gap: 0.15rem 0.2rem;
		}
		.pl {
			grid-column: 1 / -1;
		}
		.eq {
			display: none;
		}
		.st {
			width: 1.85rem;
			height: 1.85rem;
		}
		.pv {
			min-width: 2.3rem;
		}
	}
	.tests {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.95rem;
	}
	.t {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.2rem 0.6rem;
	}
	.sep {
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.tag {
		font-family: var(--font-ui);
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
	}
	.tag :global(.katex) {
		letter-spacing: 0;
	}
	.tag.ok {
		color: var(--green);
		background: rgba(132, 217, 162, 0.1);
	}
	.tag.bad {
		color: var(--rose);
		background: rgba(242, 141, 182, 0.12);
	}
	.tag.warn {
		color: var(--amber);
		background: rgba(244, 181, 95, 0.12);
	}
</style>
