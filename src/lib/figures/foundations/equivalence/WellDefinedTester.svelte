<script lang="ts">
	// Is a rule on ℤ/n well defined? Ask several representatives of every class
	// the same question and see whether they agree.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';
	import { classColor } from './palette';
	import { checkRule, representatives, rules } from './relations';

	let n = $state(6);
	let ruleId = $state('mod4');
	const rule = $derived(rules.find((r) => r.id === ruleId) ?? rules[0]);

	const rows = $derived(
		Array.from({ length: n }, (_, k) => {
			const reps = representatives(k, n);
			const outs = reps.map((x) => rule.out(x, n));
			const ok = new Set(outs).size === 1;
			return { k, reps, outs, ok, first: outs[1] };
		})
	);
	const result = $derived(checkRule(rule, n));

	function num(x: number) {
		return x < 0 ? `−${-x}` : String(x);
	}
	const verdict = $derived.by(() => {
		if (result.ok)
			return String.raw`Well defined on \(\Z/${n}\): every class gives a single answer, so \(${rule.tex}\) is a genuine function on classes.`;
		const row = rows[result.badClass ?? 0];
		// find two representatives that disagree
		const i = 1;
		const j = row.outs.findIndex((o) => o !== row.outs[i]);
		const a = row.reps[i];
		const b = row.reps[j];
		const ta = (x: number) => (x < 0 ? `-${-x}` : String(x));
		return String.raw`Not well defined: \([${ta(a)}]=[${ta(b)}]\) in \(\Z/${n}\), yet the representative \(${ta(a)}\) gives \(${rule.outTeX(a, n)}\) while \(${ta(b)}\) gives \(${rule.outTeX(b, n)}\).`;
	});
</script>

<div class="wd">
	<div class="head">
		<span class="lbl ui">The rule</span>
		<span class="rule"><TeX tex={rule.tex} /></span>
		<span class="onl ui">on</span>
		<span class="rule"><TeX tex={String.raw`\Z/${n}`} /></span>
	</div>

	<div class="rows">
		{#each rows as r (r.k)}
			<div class="row" class:bad={!r.ok} style="--cc:{classColor(r.k)}">
				<span class="cls">{@html tex(`[${r.k}]`)}</span>
				<span class="reps">
					{#each r.reps as x, i (i)}
						<span class="chip" class:clash={r.outs[i] !== r.first}>
							<span class="x">{num(x)}</span>
							<span class="to">↦</span>
							<span class="y">{@html tex(rule.outTeX(x, n))}</span>
						</span>
					{/each}
				</span>
				<span class="mark" aria-label={r.ok ? 'consistent' : 'inconsistent'}>{r.ok ? '✓' : '✗'}</span>
			</div>
		{/each}
	</div>

	<p class="verdict" class:ok={result.ok} aria-live="polite">{@html renderMathInText(verdict)}</p>

	<Controls>
		<div class="rulepick" role="radiogroup" aria-label="Choose a rule">
			{#each rules as r (r.id)}
				<button class="rbtn" class:on={r.id === ruleId} role="radio" aria-checked={r.id === ruleId} onclick={() => (ruleId = r.id)}>
					{@html tex(r.tex)}
				</button>
			{/each}
		</div>
		<div class="nsl"><Slider bind:value={n} min={2} max={12} step={1} label="n (we work in ℤ/n)" /></div>
	</Controls>
</div>

<style>
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.3rem 0.7rem;
		padding: 1.2rem 1rem 0.6rem;
		font-size: 1.25rem;
		color: var(--ink-bright);
	}
	.lbl,
	.onl {
		font-size: 0.72rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.onl {
		color: var(--ink-faint);
	}
	.rows {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(21rem, 1fr));
		gap: 0.4rem 1.2rem;
		padding: 0.4rem 1.2rem 0.2rem;
	}
	.row {
		display: grid;
		grid-template-columns: 2.6rem 1fr 1.6rem;
		align-items: center;
		gap: 0.4rem;
		padding: 0.32rem 0.5rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--cc) 22%, transparent);
		background: color-mix(in srgb, var(--cc) 5%, transparent);
		transition:
			background 0.25s var(--ease),
			border-color 0.25s var(--ease);
	}
	.row.bad {
		border-color: rgba(242, 141, 182, 0.55);
		background: rgba(242, 141, 182, 0.07);
	}
	.cls {
		color: var(--cc);
		font-size: 1.02rem;
		text-align: center;
	}
	.reps {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 0.22rem;
		padding: 0.12rem 0.45rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.07);
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		color: var(--ink-dim);
		white-space: nowrap;
	}
	.chip .to {
		color: var(--ink-faint);
		font-size: 0.75rem;
	}
	.chip .y {
		color: var(--ink-bright);
		font-size: 0.95em;
	}
	.chip.clash {
		border-color: var(--rose);
		background: rgba(242, 141, 182, 0.14);
	}
	.chip.clash .y {
		color: var(--rose);
	}
	.mark {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.8rem;
		color: #07140c;
		background: var(--green);
	}
	.row.bad .mark {
		color: #1a0d14;
		background: var(--rose);
	}
	.verdict {
		margin: 0.8rem 1.4rem 1rem !important;
		text-align: center;
		font-size: 0.98rem;
		color: var(--rose);
		line-height: 1.55;
	}
	.verdict.ok {
		color: var(--green);
	}
	.rulepick {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		flex: 1 1 20rem;
	}
	.rbtn {
		padding: 0.35rem 0.7rem;
		min-height: 2.1rem;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--ink);
		cursor: pointer;
		font-size: 0.92rem;
		transition: all 0.18s var(--ease);
	}
	.rbtn:hover {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.12);
	}
	.rbtn.on {
		border-color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.22);
		color: var(--ink-bright);
		box-shadow: 0 0 14px -4px rgba(242, 205, 135, 0.6);
	}
	.nsl {
		flex: 1 1 12rem;
	}
</style>
