<script lang="ts">
	// “If it rains, I bring an umbrella.” Judge the promise in four situations;
	// the four verdicts are the truth table of P ⇒ Q.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { tex } from '$lib/katex/render';
	import Mark from '$lib/components/ui/Mark.svelte';

	type Verdict = 'kept' | 'broken';
	const cases = [
		{ P: true, Q: true, answer: 'kept' as Verdict, why: 'It rained and I had my umbrella. Promise kept.' },
		{ P: true, Q: false, answer: 'broken' as Verdict, why: 'It rained and I had no umbrella. Promise broken — the only way to break it.' },
		{ P: false, Q: true, answer: 'kept' as Verdict, why: 'No rain, umbrella anyway. I promised nothing about dry days, so nothing was broken.' },
		{ P: false, Q: false, answer: 'kept' as Verdict, why: 'No rain, no umbrella. The promise was never put to the test, so it was not broken: it counts as kept (“vacuously true”).' }
	];
	let picks = $state<(Verdict | null)[]>([null, null, null, null]);
	let showTable = $state(false);
	let conv = $state(false);
	let contra = $state(false);
	const done = $derived(picks.every((p) => p !== null));
	const score = $derived(picks.filter((p, i) => p === cases[i].answer).length);

	const T = (b: boolean) => (b ? 'T' : 'F');
	const implies = (a: boolean, b: boolean) => !a || b;
</script>

<div class="pc">
	<p class="promise">
		<span class="k ui">The promise</span>
		<span class="ptxt">“If <span class="p">it rains</span>, then <span class="q">I bring an umbrella</span>.”</span>
		<span class="sym">{@html tex(String.raw`\textcolor{#74a9ff}{P}\Rightarrow \textcolor{#a493ff}{Q}`)}</span>
	</p>

	<div class="cards">
		{#each cases as c, i (i)}
			{@const pick = picks[i]}
			<div class="card" class:right={pick !== null && pick === c.answer} class:wrong={pick !== null && pick !== c.answer}>
				<svg viewBox="0 0 160 84" class="scene" role="img" aria-label="{c.P ? 'rain' : 'sunshine'}, {c.Q ? 'with an umbrella' : 'without an umbrella'}">
					{#if c.P}
						<g transform="translate(40 34)">
							<path d="M -24 8 a 12 12 0 0 1 2 -20 a 15 15 0 0 1 27 -6 a 11 11 0 0 1 19 10 a 9 9 0 0 1 -2 16 z" class="cloud" />
							{#each [-14, -2, 10] as dx (dx)}
								<line x1={dx} y1="14" x2={dx - 5} y2="28" class="rain" />
							{/each}
						</g>
					{:else}
						<g transform="translate(40 38)">
							<circle r="11" class="sun" />
							{#each Array(8) as _, k (k)}
								<line x1={Math.cos((k * Math.PI) / 4) * 16} y1={Math.sin((k * Math.PI) / 4) * 16} x2={Math.cos((k * Math.PI) / 4) * 22} y2={Math.sin((k * Math.PI) / 4) * 22} class="ray" />
							{/each}
						</g>
					{/if}
					<g transform="translate(116 38)" class:none={!c.Q}>
						<path d="M -24 0 Q -24 -24 0 -24 Q 24 -24 24 0 Q 18 -5 12 0 Q 6 -5 0 0 Q -6 -5 -12 0 Q -18 -5 -24 0 Z" class="canopy" />
						<path d="M 0 0 V 18 a 5 5 0 0 1 -10 0" class="handle" />
						{#if !c.Q}
							<line x1="-26" y1="22" x2="26" y2="-28" class="slash" />
						{/if}
					</g>
				</svg>
				<div class="facts ui">
					<span class:t={c.P} class:f={!c.P}>P: {c.P ? 'rains' : 'dry'}</span>
					<span class:t={c.Q} class:f={!c.Q}>Q: {c.Q ? 'umbrella' : 'no umbrella'}</span>
				</div>
				{#if pick === null}
					<div class="ask">
						<button class="v kept" onclick={() => (picks[i] = 'kept')}>Kept</button>
						<button class="v broken" onclick={() => (picks[i] = 'broken')}>Broken</button>
					</div>
				{:else}
					<div class="res" aria-live="polite">
						<span class="mark"><Mark ok={pick === c.answer} size={13} /></span>
						<span class="verdict">{c.answer === 'kept' ? 'Kept' : 'Broken'}</span>
						<p class="why">{c.why}</p>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	{#if done || showTable}
		<div class="tablewrap">
			{#if done}<p class="score ui">You judged {score} of 4 correctly.</p>{/if}
			<table class="tt">
				<thead>
					<tr>
						<th>{@html tex('P')}</th>
						<th>{@html tex('Q')}</th>
						<th class="main">{@html tex(String.raw`P\Rightarrow Q`)}</th>
						{#if conv}<th class="cv">{@html tex(String.raw`Q\Rightarrow P`)}<span class="cap">converse</span></th>{/if}
						{#if contra}<th class="ct">{@html tex(String.raw`\neg Q\Rightarrow\neg P`)}<span class="cap">contrapositive</span></th>{/if}
					</tr>
				</thead>
				<tbody>
					{#each cases as c, i (i)}
						<tr>
							<td>{T(c.P)}</td>
							<td>{T(c.Q)}</td>
							<td class="main" class:f={!implies(c.P, c.Q)}>{T(implies(c.P, c.Q))}</td>
							{#if conv}<td class="cv" class:f={!implies(c.Q, c.P)} class:diff={implies(c.Q, c.P) !== implies(c.P, c.Q)}>{T(implies(c.Q, c.P))}</td>{/if}
							{#if contra}<td class="ct" class:f={!implies(!c.Q, !c.P)}>{T(implies(!c.Q, !c.P))}</td>{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<Controls>
		<Toggle bind:checked={conv} label="add the converse" />
		<Toggle bind:checked={contra} label="add the contrapositive" />
		{#if !done}<Button variant="subtle" onclick={() => (showTable = !showTable)}>{showTable ? 'Hide the table' : 'Show the truth table'}</Button>{/if}
		<Button variant="subtle" onclick={() => ((picks = [null, null, null, null]), (showTable = false))}>Start again</Button>
	</Controls>
</div>

<style>
	.promise {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.3rem 0.8rem;
		margin: 1.2rem 1rem 0.6rem !important;
		text-align: center;
	}
	.k {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.ptxt {
		font-family: var(--font-elegant);
		font-size: 1.35rem;
		color: var(--ink-bright);
	}
	.p {
		color: var(--blue);
	}
	.q {
		color: var(--violet);
	}
	.sym {
		font-size: 1.1rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.6rem;
		padding: 0.4rem 1rem 0.8rem;
	}
	@media (max-width: 760px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.card {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		gap: 0.35rem;
		padding: 0.6rem 0.6rem 0.7rem;
		border-radius: 12px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.025);
		transition: all 0.3s var(--ease);
	}
	.card.right {
		border-color: rgba(132, 217, 162, 0.55);
		background: rgba(132, 217, 162, 0.06);
	}
	.card.wrong {
		border-color: rgba(242, 141, 182, 0.55);
		background: rgba(242, 141, 182, 0.06);
	}
	.scene {
		width: 100%;
		height: auto;
		max-height: 92px;
	}
	.cloud {
		fill: #3a4a6e;
		stroke: #9fb6e6;
		stroke-width: 1.4;
	}
	.rain {
		stroke: var(--blue);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.sun {
		fill: #f2d08f;
		filter: drop-shadow(0 0 8px rgba(242, 208, 143, 0.8));
	}
	.ray {
		stroke: #f2d08f;
		stroke-width: 2;
		stroke-linecap: round;
	}
	.canopy {
		fill: rgba(164, 147, 255, 0.85);
		stroke: #e4dfff;
		stroke-width: 1.2;
	}
	.handle {
		fill: none;
		stroke: #d9d3ff;
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.none .canopy {
		fill: rgba(164, 147, 255, 0.15);
		stroke: rgba(228, 223, 255, 0.35);
	}
	.none .handle {
		stroke: rgba(217, 211, 255, 0.3);
	}
	.slash {
		stroke: var(--rose);
		stroke-width: 3;
		stroke-linecap: round;
	}
	.facts {
		display: flex;
		justify-content: space-between;
		gap: 0.3rem;
		font-size: 0.68rem;
		letter-spacing: 0.02em;
	}
	.facts .t {
		color: var(--ink-bright);
	}
	.facts .f {
		color: var(--ink-faint);
	}
	.ask {
		display: flex;
		gap: 0.35rem;
	}
	.v {
		flex: 1;
		min-height: 2.2rem;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.03);
		color: var(--ink);
		font-family: var(--font-ui);
		font-size: 0.78rem;
		cursor: pointer;
		transition: all 0.18s var(--ease);
	}
	.v.kept:hover {
		border-color: var(--green);
		color: var(--green);
	}
	.v.broken:hover {
		border-color: var(--rose);
		color: var(--rose);
	}
	.res {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.1rem 0.45rem;
		align-items: center;
	}
	.mark {
		display: grid;
		place-items: center;
		width: 1.4rem;
		height: 1.4rem;
		border-radius: 50%;
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.75rem;
		background: var(--green);
		color: #07140c;
	}
	.card.wrong .mark {
		background: var(--rose);
		color: #1a0d14;
	}
	.verdict {
		font-family: var(--font-ui);
		font-size: 0.74rem;
		font-weight: 650;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-bright);
	}
	.why {
		grid-column: 1 / -1;
		margin: 0.2rem 0 0 !important;
		font-size: 0.84rem;
		line-height: 1.45;
		color: var(--ink-dim);
	}
	.tablewrap {
		padding: 0 1rem 0.9rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.score {
		margin: 0 0 0.4rem !important;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.tt {
		width: auto !important;
		margin: 0 !important;
		border-collapse: collapse;
		font-family: var(--font-ui);
		font-size: 0.9rem;
	}
	.tt th,
	.tt td {
		padding: 0.35rem 0.9rem !important;
		text-align: center !important;
		border-bottom: 1px solid var(--line-faint);
	}
	.tt th {
		text-transform: none !important;
		letter-spacing: 0 !important;
		font-size: 0.95rem !important;
		color: var(--ink-bright) !important;
		vertical-align: bottom;
	}
	.cap {
		display: block;
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.tt td {
		color: var(--green);
		font-weight: 650;
	}
	.tt td:nth-child(1),
	.tt td:nth-child(2) {
		color: var(--ink-dim);
		font-weight: 400;
	}
	.tt td.f {
		color: var(--rose);
	}
	.tt .main {
		background: rgba(216, 178, 110, 0.08);
	}
	.tt td.diff {
		box-shadow: inset 0 0 0 1.5px var(--amber);
		border-radius: 6px;
	}
</style>
