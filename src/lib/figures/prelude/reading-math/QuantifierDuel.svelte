<script lang="ts">
	// Quantifiers as a game: you play ∃ against a Skeptic who plays ∀.
	// The order of the quantifiers decides who has to move first.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';
	import Mark from '$lib/components/ui/Mark.svelte';

	type Stmt = 'sum' | 'bigger';
	type Order = 'AE' | 'EA';
	type Phase = 'yourMove' | 'judged';

	let stmt = $state<Stmt>('sum');
	let order = $state<Order>('AE');
	let phase = $state<Phase>('yourMove');
	let x = $state<number | null>(5); // the Skeptic's number (null = not chosen yet)
	let y = $state(0); // your number
	let you = $state(0);
	let skeptic = $state(0);
	let history = $state<{ x: number; y: number; win: boolean }[]>([]);
	let showStrategy = $state(false);

	const LO = -9;
	const HI = 9;
	const holds = (xx: number, yy: number) => (stmt === 'sum' ? xx + yy === 0 : yy > xx);
	const statementTeX = $derived(
		order === 'AE'
			? stmt === 'sum'
				? String.raw`\forall x\in\Z\ \ \exists y\in\Z:\ \ x+y=0`
				: String.raw`\forall x\in\Z\ \ \exists y\in\Z:\ \ y>x`
			: stmt === 'sum'
				? String.raw`\exists y\in\Z\ \ \forall x\in\Z:\ \ x+y=0`
				: String.raw`\exists y\in\Z\ \ \forall x\in\Z:\ \ y>x`
	);
	const isTrue = $derived(order === 'AE');

	function randomX() {
		let v = 0;
		while (v === 0) v = Math.floor(Math.random() * (HI - LO - 3)) + LO + 2;
		return v;
	}
	function newRound() {
		phase = 'yourMove';
		y = 0;
		x = order === 'AE' ? randomX() : null;
	}
	function resetAll() {
		you = 0;
		skeptic = 0;
		history = [];
		showStrategy = false;
		newRound();
	}
	function setY(v: number) {
		if (phase !== 'yourMove') return;
		y = Math.max(LO, Math.min(HI, v));
	}
	function submit() {
		if (phase !== 'yourMove') return;
		if (order === 'EA') {
			// the Skeptic sees your y and answers with an x that breaks the claim
			// sum: any x ≠ −y (one step away); bigger: x = y, since y > y fails
			x = stmt === 'sum' ? (-y + 1 <= HI ? -y + 1 : -y - 1) : y;
		}
		const win = holds(x!, y);
		if (win) you++;
		else skeptic++;
		history = [{ x: x!, y, win }, ...history].slice(0, 6);
		phase = 'judged';
	}

	const sx = (v: number) => 30 + ((v - LO) / (HI - LO)) * 540;

	const narration = $derived.by(() => {
		const xt = x === null ? '' : x < 0 ? `-${-x}` : String(x);
		const yt = y < 0 ? `-${-y}` : String(y);
		const rel = stmt === 'sum' ? String.raw`x+y = ${xt}+(${yt}) = ${(x ?? 0) + y}` : String.raw`y = ${yt} \text{ versus } x = ${xt}`;
		if (order === 'AE') {
			if (phase === 'yourMove') return String.raw`The Skeptic moves first and picks \(x = ${xt}\). Your move: choose \(y\) (tap the line or use − / +), then answer.`;
			return holds(x!, y)
				? String.raw`\(${rel}\). You win this round. Whatever \(x\) the Skeptic picks, you get to answer — that is what “\(\forall x\ \exists y\)” means.`
				: String.raw`\(${rel}\). The Skeptic wins this round — but you could have won. Try again: there is always a winning reply.`;
		}
		if (phase === 'yourMove') return String.raw`This time you must move first: commit to one \(y\) that will work for *every* \(x\). Then the Skeptic replies.`;
		return String.raw`You committed to \(y=${yt}\); the Skeptic, seeing it, picks \(x = ${xt}\): \(${rel}\). The Skeptic wins — and always will. No single \(y\) works for every \(x\).`;
	});
	const strategy = $derived(
		order === 'AE'
			? stmt === 'sum'
				? String.raw`Your winning strategy: answer \(y = -x\). Since you always win, the statement is **true**.`
				: String.raw`Your winning strategy: answer \(y = x+1\). Since you always win, the statement is **true**.`
			: stmt === 'sum'
				? String.raw`The Skeptic’s winning strategy: reply with any \(x\neq -y\). Since the Skeptic always wins, the statement is **false**.`
				: String.raw`The Skeptic’s winning strategy: reply with \(x = y\) (or anything bigger). There is no largest integer, so the statement is **false**.`
	);
</script>

<div class="duel">
	<div class="stmt">
		<span class="lbl ui">The claim</span>
		<span class="tx">{@html tex(statementTeX)}</span>
	</div>
	<div class="who ui">
		{#if order === 'AE'}
			<span class="tag rose">1 · Skeptic picks x</span><span class="arrow">→</span><span class="tag gold">2 · you pick y</span>
		{:else}
			<span class="tag gold">1 · you pick y</span><span class="arrow">→</span><span class="tag rose">2 · Skeptic picks x</span>
		{/if}
	</div>

	<Svg viewBox="0 0 600 120" maxHeight={150} label="A number line from minus nine to nine, with the Skeptic's x and your y marked">
		<line x1="18" y1="64" x2="582" y2="64" class="axis" />
		{#each Array.from({ length: HI - LO + 1 }, (_, i) => LO + i) as v (v)}
			<g class="tick" role="button" tabindex="-1" aria-label="choose y = {v}" onclick={() => setY(v)}>
				<rect x={sx(v) - 14} y="44" width="28" height="44" class="hit" />
				<line x1={sx(v)} y1="58" x2={sx(v)} y2="70" class="tk" class:zero={v === 0} />
				<text x={sx(v)} y="86" class="tl" class:odd={v % 2 !== 0}>{v < 0 ? '−' + -v : v}</text>
			</g>
		{/each}
		{#if x !== null}
			<g class="mx" style="transform: translateX({sx(x)}px)">
				<path d="M 0 22 L 9 34 L 0 46 L -9 34 Z" class="xd" />
				<text x="0" y="16" class="ml rose">x</text>
			</g>
		{/if}
		<g class="my" style="transform: translateX({sx(y)}px)">
			<circle cx="0" cy="104" r="9" class="yd" />
			<text x="0" y="108" class="ml dark">y</text>
		</g>
	</Svg>

	<p class="narr" aria-live="polite">{@html renderMathInText(narration)}</p>

	<div class="row">
		<div class="score ui">
			<span>You <b class="gold">{you}</b></span>
			<span>Skeptic <b class="rose">{skeptic}</b></span>
		</div>
		<div class="hist ui" aria-label="recent rounds">
			{#each history as h, i (i)}
				<span class="h" class:win={h.win} title="x = {h.x}, y = {h.y}"><Mark ok={h.win} size={12} /></span>
			{/each}
		</div>
	</div>
	{#if showStrategy}
		<p class="strategy">{@html renderMathInText(strategy)}</p>
	{/if}

	<Controls>
		<div class="move">
			<Button variant="ghost" onclick={() => setY(y - 1)} disabled={phase !== 'yourMove'}>− 1</Button>
			<span class="yv ui">y = {y < 0 ? '−' + -y : y}</span>
			<Button variant="ghost" onclick={() => setY(y + 1)} disabled={phase !== 'yourMove'}>+ 1</Button>
			{#if phase === 'yourMove'}
				<Button variant="gold" onclick={submit}>{order === 'AE' ? 'Answer' : 'Commit to this y'}</Button>
			{:else}
				<Button variant="gold" onclick={newRound}>Next round</Button>
			{/if}
		</div>
		<Segmented
			bind:value={order}
			options={[
				{ value: 'AE', label: '∀x ∃y' },
				{ value: 'EA', label: '∃y ∀x' }
			]}
			label="Order of the quantifiers"
			onchange={resetAll}
		/>
		<Segmented
			bind:value={stmt}
			options={[
				{ value: 'sum', label: 'x + y = 0' },
				{ value: 'bigger', label: 'y > x' }
			]}
			label="The property"
			onchange={resetAll}
		/>
		<Button variant="subtle" onclick={() => (showStrategy = !showStrategy)}>{showStrategy ? 'Hide' : 'Who has a winning strategy?'}</Button>
	</Controls>
	<span class="sr-only">{isTrue ? 'This statement is true.' : 'This statement is false.'}</span>
</div>

<style>
	.stmt {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.4rem 0.8rem;
		padding: 1.3rem 1rem 0.3rem;
		font-size: 1.3rem;
		color: var(--ink-bright);
	}
	.lbl {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.who {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.74rem;
		padding-bottom: 0.2rem;
	}
	.tag {
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		border: 1px solid;
	}
	.tag.rose {
		color: var(--rose);
		border-color: rgba(242, 141, 182, 0.45);
	}
	.tag.gold {
		color: var(--gold-bright);
		border-color: rgba(242, 208, 143, 0.45);
	}
	.arrow {
		color: var(--ink-faint);
	}
	.axis {
		stroke: rgba(200, 192, 170, 0.5);
		stroke-width: 1.4;
	}
	.tick {
		cursor: pointer;
	}
	.hit {
		fill: transparent;
	}
	.tick:hover .tk {
		stroke: var(--gold-bright);
	}
	.tk {
		stroke: rgba(200, 192, 170, 0.6);
		stroke-width: 1.3;
	}
	.tk.zero {
		stroke: var(--ink-bright);
		stroke-width: 2;
	}
	.tl {
		font-family: var(--font-ui);
		font-size: 11px !important;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
	}
	.mx,
	.my {
		transition: transform 0.45s var(--ease);
	}
	.xd {
		fill: var(--rose);
		stroke: #fff0f6;
		stroke-width: 1.2;
		filter: drop-shadow(0 0 6px rgba(242, 141, 182, 0.8));
	}
	.yd {
		fill: #f2d08f;
		stroke: #fff6dc;
		stroke-width: 1.2;
		filter: drop-shadow(0 0 6px rgba(242, 208, 143, 0.8));
	}
	.ml {
		font-family: var(--font-elegant);
		font-style: italic;
		font-weight: 700;
		font-size: 15px !important;
		text-anchor: middle;
	}
	.ml.rose {
		fill: var(--rose) !important;
	}
	.ml.dark {
		fill: #120d05 !important;
		font-size: 13px !important;
	}
	/* phones: the number line shrinks to about half size, so its lettering grows */
	@container figure (max-width: 34rem) {
		/* every other number, so that the rest can be drawn at a readable size */
		.tl {
			font-size: 25px !important;
			transform: translateY(6px);
		}
		.tl.odd {
			display: none;
		}
		.ml {
			font-size: 26px !important;
		}
		.ml.dark {
			font-size: 20px !important;
			transform: translateY(5px);
		}
		.yd {
			r: 13px;
			cy: 108px;
		}
	}
	.narr {
		margin: 0.5rem 1.3rem 0.3rem !important;
		text-align: center;
		font-size: 0.96rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
	.row {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem 1.4rem;
		padding: 0 1rem 0.8rem;
	}
	.score {
		display: flex;
		gap: 1rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.score b {
		font-size: 1rem;
	}
	.gold {
		color: var(--gold-bright);
	}
	.rose {
		color: var(--rose);
	}
	.hist {
		display: flex;
		gap: 0.25rem;
	}
	.h {
		display: grid;
		place-items: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		font-size: 0.7rem;
		font-weight: 700;
		background: var(--rose);
		color: #1a0d14;
	}
	.h.win {
		background: var(--green);
		color: #07140c;
	}
	.strategy {
		margin: 0 1.3rem 0.9rem !important;
		padding: 0.6rem 0.9rem;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.06);
		text-align: center;
		font-size: 0.94rem;
		color: var(--ink);
	}
	.move {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}
	.yv {
		min-width: 3.4rem;
		text-align: center;
		font-size: 0.85rem;
		color: var(--gold-bright);
		font-weight: 650;
	}
</style>
