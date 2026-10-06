<script lang="ts">
	// Hover, tap or step through a formula symbol by symbol: how to say it,
	// what it means, and where in the book it is explained.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ArrowRightIcon } from '$lib/icons';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';
	import { chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { buildTeX, formulas } from './formulas';
	import { untrack } from 'svelte';

	let { preset = 'destination', choices = true }: { preset?: string; choices?: boolean } = $props();

	// start from the preset (read once, also during server rendering)
	let fid = $state(untrack(() => preset));
	let step = $state(0);
	const f = $derived(formulas.find((x) => x.id === fid) ?? formulas[0]);
	const active = $derived(Math.min(step, f.tokens.length - 1));
	const tok = $derived(f.tokens[active]);
	const html = $derived(tex(buildTeX(f, active), true));
	const where = $derived(tok.where ? chapterById.get(tok.where) : undefined);

	function pickFrom(e: Event) {
		const el = (e.target as HTMLElement | null)?.closest('.tk');
		if (!el) return;
		const m = /tk-(\d+)/.exec(el.getAttribute('class') ?? '');
		if (m) step = Number(m[1]);
	}
	function choose(id: string) {
		fid = id;
		step = 0;
	}
</script>

<div class="dec">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="formula" onpointerover={pickFrom} onclick={pickFrom} aria-label="The formula; hover or tap a symbol">
		{@html html}
	</div>

	<div class="card" aria-live="polite">
		<div class="sym">{@html tex(tok.tex)}</div>
		<div class="body">
			<div class="say ui"><span class="k">Say</span> “{tok.say.replace(/[.,]$/, '')}”</div>
			<div class="mean">{@html renderMathInText(tok.mean)}</div>
			{#if where}
				<a class="where ui" href={chapterHref(where.id)}>Explained in §{where.num} {where.title}<Icon icon={ArrowRightIcon} size={13} stroke={1.8} /></a>
			{/if}
		</div>
	</div>

	<p class="sentence" aria-label="The whole formula read aloud">
		<span class="k ui">Read aloud</span>
		{#each f.tokens as t, i (i)}
			<button class="ph" class:on={i === active} onclick={() => (step = i)}>{t.say}</button>{' '}
		{/each}
	</p>
	<p class="gloss">{@html renderMathInText(f.gloss)}</p>

	<Controls>
		<StepControls bind:step count={f.tokens.length} interval={2200} />
		{#if choices}
			<Segmented bind:value={fid} options={formulas.map((x) => ({ value: x.id, label: x.label }))} label="Choose a formula" onchange={(v) => choose(v)} />
		{/if}
	</Controls>
</div>

<style>
	.formula {
		padding: 1.6rem 1rem 0.6rem;
		text-align: center;
		font-size: clamp(1.25rem, 4.6vw, 2.15rem);
		color: var(--ink-bright);
		overflow-x: auto;
		overflow-y: hidden;
		cursor: default;
	}
	.formula :global(.katex-display) {
		margin: 0;
	}
	.formula :global(.tk) {
		cursor: pointer;
		border-radius: 6px;
		transition:
			color 0.2s var(--ease),
			background 0.2s var(--ease),
			box-shadow 0.2s var(--ease);
	}
	.formula :global(.tk:hover) {
		color: var(--gold-pale);
	}
	.formula :global(.tk.on) {
		color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.16);
		box-shadow:
			0 0 0 4px rgba(216, 178, 110, 0.16),
			0 0 24px rgba(242, 208, 143, 0.35);
	}
	.card {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		margin: 0.6rem 1.2rem 0.4rem;
		padding: 0.9rem 1rem;
		border-radius: 12px;
		border: 1px solid var(--line);
		background: linear-gradient(180deg, rgba(216, 178, 110, 0.07), rgba(216, 178, 110, 0.02));
		min-height: 7.2rem;
	}
	.sym {
		flex: none;
		display: grid;
		place-items: center;
		min-width: 3.4rem;
		height: 3.4rem;
		padding: 0 0.5rem;
		border-radius: 12px;
		background: rgba(6, 9, 18, 0.6);
		border: 1px solid var(--line-faint);
		font-size: 1.5rem;
		color: var(--gold-bright);
	}
	.body {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}
	.say {
		font-size: 0.86rem;
		color: var(--ink-bright);
	}
	.k {
		font-size: 0.66rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		margin-right: 0.4rem;
	}
	.mean {
		font-size: 0.98rem;
		color: var(--ink);
		line-height: 1.5;
	}
	.where {
		font-size: 0.76rem;
		color: var(--gold);
		text-decoration: none;
	}
	.where:hover {
		color: var(--gold-pale);
		text-decoration: underline;
	}
	.sentence {
		margin: 0.6rem 1.2rem 0.2rem !important;
		font-family: var(--font-elegant);
		font-size: 1.22rem;
		line-height: 1.6;
		color: var(--ink-dim);
		text-align: center;
	}
	.ph {
		border: 0;
		background: none;
		padding: 0 0.05em;
		font: inherit;
		color: inherit;
		cursor: pointer;
		border-radius: 4px;
		transition: color 0.2s;
	}
	.ph:hover {
		color: var(--ink-bright);
	}
	.ph.on {
		color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.12);
	}
	.gloss {
		margin: 0.2rem 1.4rem 0.9rem !important;
		text-align: center;
		font-size: 0.92rem;
		color: var(--ink-faint);
	}
</style>
