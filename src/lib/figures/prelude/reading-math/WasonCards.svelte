<script lang="ts">
	// A version of Wason’s selection task. Rule: “If a card has an even number on
	// one side, then its other side is gold.” Which cards must be turned over?
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText } from '$lib/katex/render';

	interface Card {
		id: string;
		front: { kind: 'num'; n: number } | { kind: 'col'; c: 'gold' | 'violet' };
		back: { kind: 'num'; n: number } | { kind: 'col'; c: 'gold' | 'violet' };
		must: boolean;
		why: string;
	}
	const cards: Card[] = [
		{
			id: '8',
			front: { kind: 'num', n: 8 },
			back: { kind: 'col', c: 'gold' },
			must: true,
			why: 'Must turn: 8 is even, so the rule demands gold on the back. If it were violet, the promise would be broken. (This checks \\(P\\Rightarrow Q\\) directly.)'
		},
		{
			id: '3',
			front: { kind: 'num', n: 3 },
			back: { kind: 'col', c: 'violet' },
			must: false,
			why: 'No need: the rule says nothing about odd numbers. Whatever is on the back, nothing can be broken here (vacuous truth).'
		},
		{
			id: 'gold',
			front: { kind: 'col', c: 'gold' },
			back: { kind: 'num', n: 5 },
			must: false,
			why: 'No need: the rule allows gold backs for any number. Turning it over would test the converse, “gold ⇒ even”, which nobody promised.'
		},
		{
			id: 'violet',
			front: { kind: 'col', c: 'violet' },
			back: { kind: 'num', n: 6 },
			must: true,
			why: 'Must turn: if its number is even, the rule is broken. This is the contrapositive, \\(\\neg Q\\Rightarrow\\neg P\\): not gold ⇒ not even. (And here it fails: there is a 6!)'
		}
	];

	let chosen = $state<string[]>([]);
	let flipped = $state<string[]>([]);
	let checked = $state(false);

	const correct = $derived(checked && cards.every((c) => chosen.includes(c.id) === c.must));
	function toggle(id: string) {
		if (checked) return;
		chosen = chosen.includes(id) ? chosen.filter((x) => x !== id) : [...chosen, id];
	}
	function check() {
		checked = true;
		flipped = [...chosen];
	}
	function reveal() {
		checked = true;
		flipped = cards.map((c) => c.id);
	}
	function reset() {
		chosen = [];
		flipped = [];
		checked = false;
	}
</script>

{#snippet face(f: Card['front'])}
	{#if f.kind === 'num'}
		<span class="num">{f.n}</span>
	{:else}
		<span class="swatch {f.c}"></span>
	{/if}
{/snippet}

<div class="ws">
	<p class="rule">
		<span class="k ui">The rule</span>
		“If a card shows an <span class="p">even number</span> on one side, then its other side is <span class="q">gold</span>.”
	</p>
	<p class="task ui">
		Each card has a number on one side and a colour on the other. Tap the cards you <em>must</em> turn over to find out whether the
		rule is being broken — no more, no fewer.
	</p>
	<div class="row">
		{#each cards as c (c.id)}
			{@const isFlipped = flipped.includes(c.id)}
			{@const isChosen = chosen.includes(c.id)}
			<div class="slot">
				<button
					class="card"
					class:chosen={isChosen}
					class:flipped={isFlipped}
					class:good={checked && c.must === isChosen}
					class:bad={checked && c.must !== isChosen}
					aria-pressed={isChosen}
					aria-label="card {c.id}{isChosen ? ', chosen' : ''}"
					onclick={() => toggle(c.id)}
				>
					<span class="inner">
						<span class="side front">{@render face(c.front)}</span>
						<span class="side back">{@render face(c.back)}</span>
					</span>
				</button>
				{#if checked}
					<p class="why">{@html renderMathInText(c.why)}</p>
				{/if}
			</div>
		{/each}
	</div>
	{#if checked}
		<p class="verdict" class:ok={correct} aria-live="polite">
			{correct
				? 'Exactly right: the 8 and the violet card. Most people pick the 8 and the gold card — testing the converse instead of the contrapositive.'
				: 'Not quite. The cards that can break the rule are the 8 (if its back is violet) and the violet card (if its number is even). Read the notes under each card.'}
		</p>
	{/if}
	<Controls>
		{#if !checked}
			<Button variant="gold" onclick={check} disabled={chosen.length === 0}>Turn over my cards</Button>
			<Button variant="subtle" onclick={reveal}>Just show me</Button>
		{:else}
			<Button variant="ghost" onclick={reveal}>Turn over all four</Button>
			<Button variant="subtle" onclick={reset}>Try again</Button>
		{/if}
	</Controls>
</div>

<style>
	.rule {
		margin: 1.2rem 1rem 0.3rem !important;
		text-align: center;
		font-family: var(--font-elegant);
		font-size: 1.3rem;
		color: var(--ink-bright);
	}
	.k {
		display: block;
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		font-family: var(--font-ui);
	}
	.p {
		color: var(--blue);
	}
	.q {
		color: var(--gold-bright);
	}
	.task {
		margin: 0 1.2rem 0.8rem !important;
		text-align: center;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	.row {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.8rem;
		padding: 0.4rem 1.2rem 0.8rem;
	}
	@media (max-width: 640px) {
		.row {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.card {
		width: 100%;
		max-width: 8.4rem;
		aspect-ratio: 3 / 4;
		padding: 0;
		border: 0;
		background: none;
		cursor: pointer;
		perspective: 700px;
	}
	.inner {
		position: relative;
		display: block;
		width: 100%;
		height: 100%;
		transition: transform 0.7s var(--ease);
		transform-style: preserve-3d;
	}
	.card.flipped .inner {
		transform: rotateY(180deg);
	}
	.side {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		border-radius: 12px;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
		background: linear-gradient(160deg, #18213d, #0b1122);
		border: 1.5px solid rgba(216, 178, 110, 0.35);
		box-shadow: 0 10px 30px -14px rgba(0, 0, 0, 0.9);
	}
	.back {
		transform: rotateY(180deg);
	}
	.card.chosen .side {
		border-color: var(--gold-bright);
		box-shadow:
			0 0 0 3px rgba(242, 208, 143, 0.25),
			0 0 26px -6px rgba(242, 208, 143, 0.8);
	}
	.card.good .side {
		border-color: var(--green);
	}
	.card.bad .side {
		border-color: var(--rose);
	}
	.num {
		font-family: var(--font-display);
		font-size: 2.6rem;
		color: var(--ink-bright);
	}
	.swatch {
		width: 62%;
		height: 62%;
		border-radius: 10px;
	}
	.swatch.gold {
		background: radial-gradient(circle at 35% 30%, #fff3d6, #f2d08f 45%, #b98c45);
		box-shadow: 0 0 22px rgba(242, 208, 143, 0.5);
	}
	.swatch.violet {
		background: radial-gradient(circle at 35% 30%, #eeeaff, #a493ff 45%, #5b4bc4);
		box-shadow: 0 0 22px rgba(164, 147, 255, 0.5);
	}
	.why {
		margin: 0 !important;
		font-size: 0.8rem;
		line-height: 1.45;
		color: var(--ink-dim);
		text-align: center;
	}
	.verdict {
		margin: 0.2rem 1.3rem 0.9rem !important;
		text-align: center;
		color: var(--rose);
		font-size: 0.95rem;
	}
	.verdict.ok {
		color: var(--green);
	}
</style>
