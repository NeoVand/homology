<script lang="ts">
	// The Kauffman bracket, state by state. Every crossing can be smoothed in
	// two ways, A and B; a choice at every crossing is a state, a picture made
	// of disjoint loops. The bracket adds up, over all 2ⁿ states,
	// A^(#A − #B) · d^(loops − 1), with d = −A² − A⁻². Corrected by the writhe
	// it becomes the Jones polynomial, which tells the trefoil from its mirror.
	import { untrack } from 'svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { smoothDrawing, loopsOfState, stateCurves, termTeX } from '$lib/knots/smooth';
	import { mirror, type V2, type V3 } from '$lib/knots/diagram';
	import { sampleClosed, plat, torusKnot } from '$lib/knots/curves';
	import { roundTrefoil } from '$lib/knots/table';
	import { bracket, jones } from '$lib/knots/invariants';
	import { L } from '$lib/knots/laurent';

	type Which = 'kink' | 'hopf' | 'trefoil' | 'eight';
	let which = $state<Which>('trefoil');
	let mirrored = $state(false);
	let picked = $state<number | null>(null);

	const TAU = Math.PI * 2;
	const shapes: Record<Which, () => V3[][]> = {
		// a loop with one twist (a limaçon), which is just an unknot
		kink: () => [
			sampleClosed((u) => {
				const t = TAU * u;
				const r = 0.55 + Math.cos(t);
				return [1.3 * r * Math.cos(t), 1.3 * r * Math.sin(t), 0.35 * Math.sin(t)];
			}, 360)
		],
		hopf: () => torusKnot(2, 2, 1.1, 0.55),
		trefoil: () => roundTrefoil(),
		eight: () => plat([2, 2, -1, 2])
	};
	const names: Record<Which, string> = { kink: 'a twisted unknot', hopf: 'the Hopf link', trefoil: 'the trefoil', eight: 'the figure-eight knot' };

	const sd = $derived(smoothDrawing(mirrored ? mirror(shapes[which]()) : shapes[which](), 0.2));
	const n = $derived(sd.diagram.pd.length);
	$effect(() => {
		void which;
		void mirrored;
		untrack(() => (picked = null));
	});

	const palette = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff'];
	const fit = (W: number, H: number, pad: number) => {
		const b = sd.box;
		const k = Math.min((W - 2 * pad) / (b.maxx - b.minx), (H - 2 * pad) / (b.maxy - b.miny));
		const ox = W / 2 - ((b.minx + b.maxx) / 2) * k;
		const oy = H / 2 + ((b.miny + b.maxy) / 2) * k;
		return (p: V2) => `${(ox + p[0] * k).toFixed(1)} ${(oy - p[1] * k).toFixed(1)}`;
	};
	function statePaths(state: number, W: number, H: number, pad: number) {
		const P = fit(W, H, pad);
		return stateCurves(sd, state).map((c) => ({ d: 'M ' + c.pts.map(P).join(' L '), c: palette[c.loop % palette.length] }));
	}
	const states = $derived(
		Array.from({ length: 1 << n }, (_, st) => {
			const a = Array.from({ length: n }, (_, c) => ((st >> c) & 1 ? 'B' : 'A'));
			const nA = a.filter((x) => x === 'A').length;
			const loops = loopsOfState(sd, st).count;
			return { st, word: a.join(''), loops, term: termTeX(nA, n - nA, loops) };
		})
	);
	const br = $derived(bracket(sd.diagram));
	const w = $derived(sd.diagram.writhe);
	const f = $derived(L.mul(L.mono(-3 * w, w % 2 === 0 ? 1 : -1), br));
	const V = $derived(jones(sd.diagram));
	const mainPaths = $derived(picked === null ? null : statePaths(picked, 520, 300, 30));
	const cardW = 150;
	const cardH = 100;
</script>

<div class="bs">
	<div class="main">
		<svg viewBox="0 0 520 300" role="img" aria-label="The diagram of {names[which]}{picked === null ? ', with its crossings numbered' : `, smoothed as in state ${states[picked].word}`}.">
			{#if mainPaths}
				{#each mainPaths as p, i (i)}
					<path d={p.d} class="halo" />
					<path d={p.d} class="ln" style="stroke:{p.c}" />
				{/each}
			{:else}
				{@const P = fit(520, 300, 30)}
				{#each [...sd.edges] as [e, pts] (e)}
					<path d={'M ' + pts.map(P).join(' L ')} class="halo" />
					<path d={'M ' + pts.map(P).join(' L ')} class="ln" />
				{/each}
				{#each sd.diagram.pd as x, c (c)}
					{@const sgn = sd.diagram.signs[c]}
					{@const [i, j, k, l] = x}
					{@const pin = (lab: number, incoming: boolean) => sd.ports[c].get(incoming ? -lab : lab)}
					{@const oIn = pin(sgn > 0 ? l : j, true)}
					{@const oOut = pin(sgn > 0 ? j : l, false)}
					{@const uIn = pin(i, true)}
					{@const uOut = pin(k, false)}
					{@const at = sd.diagram.at[c]}
					{#if oIn && oOut && uIn && uOut}
						<!-- the crossing: the strand on top runs straight through, the one beneath stops short -->
						<path d="M {P(oIn)} L {P(oOut)}" class="halo" />
						<path d="M {P(oIn)} L {P(oOut)}" class="ln" />
						<path d="M {P(uIn)} L {P([uIn[0] + (at[0] - uIn[0]) * 0.4, uIn[1] + (at[1] - uIn[1]) * 0.4])}" class="ln" />
						<path d="M {P(uOut)} L {P([uOut[0] + (at[0] - uOut[0]) * 0.4, uOut[1] + (at[1] - uOut[1]) * 0.4])}" class="ln" />
					{/if}
					{@const [cx, cy] = P(at).split(' ').map(Number)}
					<circle {cx} cy={cy - 24} r="10" class="tag" />
					<text x={cx} y={cy - 20} class="tagn">{c + 1}</text>
				{/each}
			{/if}
		</svg>
		<div class="sum ui" aria-live="polite">
			{#if picked !== null}
				<p>
					State <strong>{states[picked].word}</strong>: {states[picked].loops} loop{states[picked].loops === 1 ? '' : 's'}, contributing
					<TeX tex={states[picked].term} />. Tap it again to see the knot.
				</p>
			{/if}
			<p><TeX tex={`\\langle D\\rangle = ${L.tex(br, 'A')}`} /></p>
			<p class="dim">
				<TeX tex={`w = ${w},\\quad (-A^3)^{-w}\\langle D\\rangle = ${L.tex(f, 'A')}`} />
			</p>
			<p class="v"><TeX tex={`V(t) = ${L.tex(V, 't')}`} /></p>
		</div>
	</div>

	<div class="grid" class:wide={n >= 4}>
		{#each states as s (s.st)}
			<button class="card" class:on={picked === s.st} onclick={() => (picked = picked === s.st ? null : s.st)} aria-label="State {s.word}: {s.loops} loops">
				<svg viewBox="0 0 {cardW} {cardH}" aria-hidden="true">
					{#each statePaths(s.st, cardW, cardH, 10) as p, i (i)}
						<path d={p.d} class="ln thin" style="stroke:{p.c}" />
					{/each}
				</svg>
				<span class="word ui">{s.word}</span>
				<span class="term"><TeX tex={s.term} /></span>
			</button>
		{/each}
	</div>

	<div class="ctl ui">
		<Segmented
			bind:value={which}
			label="Which diagram"
			options={[
				{ value: 'kink', label: 'Twisted unknot' },
				{ value: 'hopf', label: 'Hopf link' },
				{ value: 'trefoil', label: 'Trefoil' },
				{ value: 'eight', label: 'Figure-eight' }
			]}
		/>
		<Toggle bind:checked={mirrored} label="Mirror image" />
	</div>
</div>

<style>
	.bs {
		display: grid;
		gap: 0.4rem;
	}
	.main {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		align-items: center;
		gap: 0.5rem;
		padding: 0.3rem 0.9rem 0;
	}
	@media (max-width: 640px) {
		.main {
			grid-template-columns: 1fr;
		}
	}
	svg {
		width: 100%;
		display: block;
	}
	.halo {
		fill: none;
		stroke: #070b15;
		stroke-width: 11;
		stroke-linecap: round;
	}
	.ln {
		fill: none;
		stroke: #e9dfc6;
		stroke-width: 5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.ln.thin {
		stroke-width: 3;
	}
	.tag {
		fill: rgba(12, 17, 32, 0.92);
		stroke: rgba(244, 215, 156, 0.4);
	}
	.tagn {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-size: 11px;
		font-weight: 700;
		fill: var(--gold-bright);
	}
	.sum {
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.sum p {
		margin: 0.3rem 0;
		overflow-x: auto;
	}
	.sum .dim {
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.sum .v {
		color: var(--gold-pale);
		font-size: 0.95rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(7.2rem, 1fr));
		gap: 0.4rem;
		padding: 0 0.9rem;
	}
	.card {
		display: grid;
		justify-items: center;
		gap: 0.1rem;
		padding: 0.35rem 0.3rem 0.4rem;
		border-radius: 10px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		cursor: pointer;
		font: inherit;
	}
	.card:hover,
	.card:focus-visible {
		border-color: var(--line);
	}
	.card.on {
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.1);
	}
	.word {
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		color: var(--ink-faint);
	}
	.term {
		font-size: 0.8rem;
		color: var(--ink);
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1rem;
		justify-content: center;
		align-items: center;
		padding: 0.3rem 0.8rem 0.9rem;
	}
</style>
