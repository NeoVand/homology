<script lang="ts">
	// The negation machine: push ¬ inward one rule at a time.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';
	import { fade } from 'svelte/transition';
	import { machines, rules } from './negations';

	let mid = $state('partners');
	let step = $state(0);
	const m = $derived(machines.find((x) => x.id === mid) ?? machines[0]);
	const s = $derived(m.steps[Math.min(step, m.steps.length - 1)]);
	const last = $derived(step >= m.steps.length - 1);
</script>

<div class="neg">
	<div class="stage">
		{#key mid + ':' + step}
			<div class="line" in:fade={{ duration: 380 }}>{@html tex(s.tex, true)}</div>
		{/key}
	</div>
	<p class="note" aria-live="polite">{@html renderMathInText(s.note)}</p>
	{#if last}
		<p class="english" in:fade={{ duration: 400 }}><span class="k ui">In words</span>{@html renderMathInText(m.english)}</p>
	{/if}

	<div class="rules" aria-label="The rules">
		{#each rules as r, i (i)}
			<div class="rule" class:on={s.rule === i}>
				<span class="rt">{@html tex(r.tex)}</span>
				<span class="rn ui">{r.name}</span>
			</div>
		{/each}
	</div>

	<Controls>
		<StepControls bind:step count={m.steps.length} interval={2000} />
		<Segmented bind:value={mid} options={machines.map((x) => ({ value: x.id, label: x.label }))} label="Choose a statement" onchange={() => (step = 0)} />
	</Controls>
</div>

<style>
	.stage {
		display: grid;
		place-items: center;
		min-height: 6.2rem;
		padding: 1.4rem 1rem 0.2rem;
		overflow-x: auto;
	}
	.line {
		grid-area: 1 / 1;
		font-size: clamp(0.95rem, 2.6vw, 1.25rem);
		color: var(--ink-bright);
	}
	.line :global(.katex-display) {
		margin: 0;
	}
	.note {
		margin: 0.2rem 1.3rem 0.4rem !important;
		text-align: center;
		color: var(--ink-dim);
		font-size: 0.96rem;
		min-height: 1.6em;
	}
	.english {
		margin: 0.2rem 1.3rem 0.6rem !important;
		padding: 0.6rem 0.9rem;
		border-radius: 10px;
		border: 1px solid rgba(132, 217, 162, 0.35);
		background: rgba(132, 217, 162, 0.06);
		text-align: center;
		color: var(--ink);
		font-size: 0.96rem;
	}
	.k {
		display: block;
		font-size: 0.64rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--green);
		margin-bottom: 0.15rem;
	}
	.rules {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 0.4rem;
		padding: 0.4rem 1.2rem 1rem;
	}
	.rule {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.45rem 0.7rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		transition: all 0.3s var(--ease);
	}
	.rule.on {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.12);
		color: var(--ink-bright);
		box-shadow: 0 0 18px -6px rgba(242, 208, 143, 0.7);
	}
	.rt {
		font-size: 0.98rem;
	}
	.rn {
		font-size: 0.7rem;
		letter-spacing: 0.04em;
		color: var(--ink-faint);
	}
	.rule.on .rn {
		color: var(--gold);
	}
</style>
