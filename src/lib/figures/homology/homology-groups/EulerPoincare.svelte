<script lang="ts">
	// Euler–Poincaré as a ledger: build a complex one simplex at a time. Each
	// simplex creates a class (gold) or kills one (teal); the pairs cancel in
	// the alternating sum, leaving exactly the Betti numbers.
	import { onDestroy } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import FlatComplex from './FlatComplex.svelte';
	import { hollowTriangle, filledTriangle, hollowTetrahedron, figureEight, torusGrid, twoPoints, type Example } from './complexes';
	import { ledger, alternating } from './ledger';
	import { paddedViewBox } from './flat';

	const examples: Example[] = [twoPoints(), hollowTriangle(), filledTriangle(), figureEight(), hollowTetrahedron(), torusGrid()];
	const short: Record<string, string> = {
		'two-points': 'Two points',
		circle: 'Circle',
		disk: 'Disk',
		'figure-eight': 'Figure eight',
		sphere: 'Sphere',
		torus: 'Torus'
	};
	let id = $state('sphere');
	const ex = $derived(examples.find((e) => e.id === id)!);
	const events = $derived(ledger(ex.K));
	const N = $derived(events.length);
	let s = $state(0); // number of simplices added
	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;
	let hoverEv = $state<number | null>(null);

	function choose(v: string) {
		stop();
		id = v;
		s = 0;
	}
	function play() {
		if (playing) return stop();
		playing = true;
		if (s >= N) s = 0;
		timer = setInterval(() => {
			if (s < N) s++;
			else stop();
		}, 650);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	onDestroy(stop);

	const added = $derived(events.slice(0, s));
	const last = $derived(s > 0 ? events[s - 1] : null);
	const betti = $derived(last ? last.betti : new Array(ex.K.dim + 1).fill(0));
	const counts = $derived(last ? last.counts : new Array(ex.K.dim + 1).fill(0));
	const killedBy = $derived.by(() => {
		const m = new Map<number, number>();
		added.forEach((e, n) => {
			if (!e.positive && e.partner !== null) m.set(e.partner, n);
		});
		return m;
	});
	const hidden = $derived.by(() => {
		const h = [new Set<number>(), new Set<number>(), new Set<number>()];
		events.slice(s).forEach((e) => h[e.dim]?.add(e.index));
		return h;
	});
	const focus = $derived.by(() => {
		const n = hoverEv ?? (s > 0 ? s - 1 : null);
		if (n === null) return null;
		const e = events[n];
		const partner = e.positive ? (killedBy.get(n) ?? null) : e.partner;
		return { e, partner: partner !== null ? events[partner] : null };
	});
	const mark = (dim: number, index: number) => {
		if (!focus) return null;
		if (focus.e.dim === dim && focus.e.index === index) return focus.e.positive ? 'var(--gold-bright)' : 'var(--teal)';
		if (focus.partner && focus.partner.dim === dim && focus.partner.index === index) return focus.partner.positive ? 'var(--gold)' : 'var(--teal)';
		return null;
	};
	const name = (dim: number, index: number) => `[${ex.K.simplices[dim][index].join(',')}]`;
	const what = $derived.by(() => {
		if (!last) return 'Start: nothing has been built yet. Press play, or drag the slider.';
		const nm = name(last.dim, last.index);
		if (last.dim === 0) return `Vertex ${nm} appears: a new piece. b₀ goes up by one.`;
		if (last.positive)
			return last.dim === 1
				? `Edge ${nm} joins two vertices that were already connected, closing a loop. b₁ goes up by one.`
				: `Triangle ${nm} completes a closed shell around a cavity. b₂ goes up by one.`;
		return last.dim === 1 ? `Edge ${nm} joins two separate pieces into one. b₀ goes down by one.` : `Triangle ${nm} fills in a loop. b₁ goes down by one.`;
	});
	const chiN = $derived(alternating(counts));
	const chiB = $derived(alternating(betti));
	const dims = $derived(Array.from({ length: ex.K.dim + 1 }, (_, k) => k));
</script>

<div class="ep">
	<div class="top ui">
		<Segmented value={id} options={examples.map((e) => ({ value: e.id, label: short[e.id] }))} onchange={choose} label="Choose a complex" />
	</div>
	<div class="grid">
		<div class="pic">
			<Svg viewBox={paddedViewBox(ex.L, 330, 300)} maxHeight={320} label="The complex being built one simplex at a time">
				<g class="ghost"><FlatComplex L={ex.L} showLabels={false} /></g>
				<FlatComplex
					L={ex.L}
					hiddenVerts={hidden[0]}
					hiddenEdges={hidden[1]}
					hiddenTris={hidden[2]}
					edgeColor={(e) => mark(1, e)}
					vertexColor={(i) => mark(0, i)}
					triFill={(t) => mark(2, t)}
					triOpacity={() => 0.4}
					showLabels={ex.K.count(0) < 12}
				/>
			</Svg>
		</div>
		<div class="side ui">
			<div class="event">{what}</div>
			<table class="tbl">
				<thead>
					<tr>
						<th></th>
						{#each dims as k (k)}<th class="kh"><TeX tex={`k=${k}`} /></th>{/each}
						<th class="kh">alt. sum</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="rh">simplices <TeX tex="n_k" /></td>
						{#each dims as k (k)}<td>{counts[k]}</td>{/each}
						<td class="sum"><TeX tex={`\\chi = ${chiN}`} /></td>
					</tr>
					<tr>
						<td class="rh">Betti <TeX tex="b_k" /></td>
						{#each dims as k (k)}<td class="bet">{betti[k]}</td>{/each}
						<td class="sum"><TeX tex={`${chiB}`} /></td>
					</tr>
				</tbody>
			</table>
			<div class="agree" class:ok={chiN === chiB}>
				<TeX tex={`\\textstyle\\sum (-1)^k n_k = ${chiN} = \\sum (-1)^k b_k`} />
			</div>
		</div>
	</div>
	<div class="cells ui" aria-label="Every simplex added so far: gold creates a class, teal kills one">
		{#each dims as k (k)}
			<div class="crow">
				<span class="ck"><TeX tex={`C_${k}`} /></span>
				<div class="cbox">
					{#each events as e, n (n)}
						{#if e.dim === k}
							<button
								class="cell"
								class:added={n < s}
								class:pos={e.positive}
								class:killed={e.positive && killedBy.has(n)}
								class:neg={!e.positive}
								class:hot={hoverEv === n || (focus && (focus.e === e || focus.partner === e))}
								aria-label={`${name(e.dim, e.index)}: ${e.positive ? 'creates a class' : 'kills a class'}`}
								onpointerenter={() => n < s && (hoverEv = n)}
								onpointerleave={() => (hoverEv = null)}
								onfocus={() => n < s && (hoverEv = n)}
								onblur={() => (hoverEv = null)}
							></button>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
		<div class="legend">
			<span><i class="cell added pos"></i> creates a class that is still alive (counted in <TeX tex="b_k" />)</span>
			<span><i class="cell added pos killed"></i> created a class, later killed</span>
			<span><i class="cell added neg"></i> kills a class one dimension down</span>
		</div>
	</div>
	<div class="ctl ui">
		<button class="b" aria-label="Previous" disabled={s === 0} onclick={() => (stop(), s--)}>‹</button>
		<button class="b play" aria-label={playing ? 'Pause' : 'Play'} onclick={play}>
			{#if playing}
				<svg viewBox="0 0 20 20" width="12" height="12"><path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor" /></svg>
			{:else}
				<svg viewBox="0 0 20 20" width="12" height="12"><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg>
			{/if}
		</button>
		<button class="b" aria-label="Next" disabled={s >= N} onclick={() => (stop(), s++)}>›</button>
		<input type="range" min="0" max={N} step="1" bind:value={s} oninput={stop} aria-label="Number of simplices added" style="--p:{(s / N) * 100}%" />
		<span class="count">{s} / {N}</span>
	</div>
</div>

<style>
	.ep {
		padding: 0.7rem 1.1rem 0.4rem;
	}
	@media (max-width: 640px) {
		.ep {
			padding: 0.5rem 0.6rem 0.3rem;
		}
	}
	.top {
		margin-bottom: 0.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		gap: 0.5rem 1.3rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.event {
		min-height: 3.4rem;
		font-size: 0.86rem;
		line-height: 1.5;
		color: var(--ink);
		padding: 0.55rem 0.8rem;
		border-left: 2px solid var(--gold);
		background: rgba(216, 178, 110, 0.06);
		border-radius: 0 8px 8px 0;
	}
	.tbl {
		margin: 0 !important;
		font-size: 0.86rem !important;
	}
	.tbl th,
	.tbl td {
		padding: 0.35em 0.55em !important;
		text-align: center !important;
	}
	.tbl .rh {
		text-align: left !important;
		color: var(--ink-dim);
		white-space: nowrap;
	}
	.tbl td.bet {
		color: var(--gold-bright);
		font-weight: 650;
	}
	.tbl th.kh {
		text-transform: none;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	.ghost {
		opacity: 0.17;
	}
	.tbl td.sum {
		color: var(--ink-bright);
	}
	.agree {
		font-size: 0.95rem;
		padding: 0.45rem 0.7rem;
		border-radius: 8px;
		border: 1px solid var(--line-faint);
		text-align: center;
	}
	.agree.ok {
		border-color: rgba(132, 217, 162, 0.45);
		color: var(--green);
	}
	.cells {
		margin-top: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.crow {
		display: grid;
		grid-template-columns: 2.2rem 1fr;
		align-items: center;
		gap: 0.4rem;
	}
	.ck {
		color: var(--violet);
		font-size: 0.95rem;
	}
	.cbox {
		display: flex;
		flex-wrap: wrap;
		gap: 3px;
	}
	.cell {
		display: inline-block;
		width: 15px;
		height: 15px;
		padding: 0;
		border-radius: 3px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.03);
		cursor: default;
		transition:
			background 0.3s var(--ease),
			box-shadow 0.2s;
	}
	.cell.added.pos {
		background: var(--gold-bright);
		border-color: var(--gold-bright);
		box-shadow: 0 0 6px var(--gold-glow);
		cursor: help;
	}
	.cell.added.pos.killed {
		background: transparent;
		border: 1.5px solid var(--gold);
		box-shadow: none;
	}
	.cell.added.neg {
		background: var(--teal);
		border-color: var(--teal);
		cursor: help;
	}
	.cell.hot {
		outline: 2px solid var(--ink-bright);
		outline-offset: 1px;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.1rem;
		font-size: 0.74rem;
		color: var(--ink-faint);
		margin-top: 0.35rem;
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.legend i {
		width: 11px;
		height: 11px;
	}
	.ctl {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.8rem 0 0.7rem;
	}
	.b {
		display: grid;
		place-items: center;
		flex: none;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1.1rem;
		line-height: 1;
	}
	.b:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.play {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		border: 0;
	}
	input[type='range'] {
		flex: 1;
		min-width: 6rem;
		accent-color: var(--gold);
	}
	.count {
		font-size: 0.78rem;
		color: var(--ink-dim);
		font-variant-numeric: tabular-nums;
		min-width: 3.4rem;
		text-align: right;
	}
</style>
