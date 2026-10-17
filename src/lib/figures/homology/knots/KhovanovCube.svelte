<script lang="ts">
	// Khovanov homology, built in front of you. The states of the bracket stand
	// in columns by how many crossings were smoothed the B way; neighbouring
	// states differ at one crossing, where two circles merge (gold) or one splits
	// (teal). Each circle carries a 2-dimensional space, each state their tensor
	// product, and the merges and splits assemble into a chain complex graded
	// two ways. Its homology is the knot invariant; its graded Euler
	// characteristic is the Jones polynomial, times q + 1/q.
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { smoothDrawing, loopsOfState, stateCurves } from '$lib/knots/smooth';
	import { sampleClosed, plat } from '$lib/knots/curves';
	import { roundTrefoil } from '$lib/knots/table';
	import { khovanov, eulerCharacteristic } from '$lib/knots/khovanov';
	import { jones } from '$lib/knots/invariants';
	import { L } from '$lib/knots/laurent';
	import type { V2, V3 } from '$lib/knots/diagram';

	type Which = 'kink' | 'trefoil' | 'eight';
	let which = $state<Which>('trefoil');
	let view = $state<'chains' | 'homology'>('homology');
	let hover = $state<number | null>(null);

	const TAU = Math.PI * 2;
	const shapes: Record<Which, () => V3[][]> = {
		kink: () => [
			sampleClosed((u) => {
				const t = TAU * u;
				const r = 0.55 + Math.cos(t);
				return [1.3 * r * Math.cos(t), 1.3 * r * Math.sin(t), 0.35 * Math.sin(t)];
			}, 360)
		],
		trefoil: () => roundTrefoil(),
		eight: () => plat([2, 2, -1, 2])
	};
	const sd = $derived(smoothDrawing(shapes[which](), 0.2));
	const n = $derived(sd.diagram.pd.length);
	const nPlus = $derived(sd.diagram.signs.filter((s) => s > 0).length);
	const nMinus = $derived(n - nPlus);
	const pop = (x: number) => [...Array(8).keys()].reduce((a, b) => a + ((x >> b) & 1), 0);
	const states = $derived(Array.from({ length: 1 << n }, (_, st) => ({ st, r: pop(st), k: loopsOfState(sd, st).count })));

	// layout of the cube: one column per value of r
	const CW = 92;
	const CH = 62;
	const GX = 46;
	const GY = 14;
	const cols = $derived(Array.from({ length: n + 1 }, (_, r) => states.filter((s) => s.r === r)));
	const W = $derived((n + 1) * CW + n * GX + 20);
	const tallest = $derived(Math.max(...cols.map((c) => c.length)));
	const H = $derived(tallest * CH + (tallest - 1) * GY + 20);
	const place = $derived.by(() => {
		const m = new Map<number, { x: number; y: number }>();
		cols.forEach((col, r) => {
			const top = (H - (col.length * CH + (col.length - 1) * GY)) / 2;
			col.forEach((s, i) => m.set(s.st, { x: 10 + r * (CW + GX), y: top + i * (CH + GY) }));
		});
		return m;
	});
	const edges = $derived(
		states.flatMap((s) =>
			Array.from({ length: n }, (_, c) => c)
				.filter((c) => !((s.st >> c) & 1))
				.map((c) => {
					const t = s.st | (1 << c);
					return { a: s.st, b: t, merge: states[t].k < s.k };
				})
		)
	);

	const palette = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff'];
	function pathsIn(st: number, x: number, y: number) {
		const b = sd.box;
		const pad = 8;
		const k = Math.min((CW - 2 * pad) / (b.maxx - b.minx), (CH - 2 * pad - 10) / (b.maxy - b.miny));
		const ox = x + CW / 2 - ((b.minx + b.maxx) / 2) * k;
		const oy = y + (CH - 10) / 2 + ((b.miny + b.maxy) / 2) * k;
		const P = (p: V2) => `${(ox + p[0] * k).toFixed(1)} ${(oy - p[1] * k).toFixed(1)}`;
		return stateCurves(sd, st).map((c) => ({ d: 'M ' + c.pts.map(P).join(' L '), c: palette[c.loop % palette.length] }));
	}

	// the bigraded tables: chain groups and homology
	const kh = $derived(khovanov(sd.diagram));
	const chains = $derived.by(() => {
		const m = new Map<string, number>();
		const binom = (a: number, b: number) => {
			let r = 1;
			for (let i = 0; i < b; i++) r = (r * (a - i)) / (i + 1);
			return r;
		};
		for (const s of states)
			for (let x = 0; x <= s.k; x++) {
				const i = s.r - nMinus;
				const j = s.k - 2 * x + s.r + nPlus - 2 * nMinus;
				m.set(`${i},${j}`, (m.get(`${i},${j}`) ?? 0) + binom(s.k, x));
			}
		return m;
	});
	const table = $derived(view === 'chains' ? chains : kh);
	const iRange = $derived([-nMinus, n - nMinus]);
	const js = $derived.by(() => {
		const all = [...chains.keys()].map((g) => +g.split(',')[1]);
		const lo = Math.min(...all);
		const hi = Math.max(...all);
		const out: number[] = [];
		for (let j = hi; j >= lo; j -= 2) out.push(j);
		return out;
	});
	const is = $derived(Array.from({ length: iRange[1] - iRange[0] + 1 }, (_, k) => iRange[0] + k));
	const chi = $derived(eulerCharacteristic(kh));
	const jq = $derived(L.mul(L.from({ 1: 1, [-1]: 1 }), L.substitute(jones(sd.diagram), 2)));
	const total = $derived([...kh.values()].reduce((a, b) => a + b, 0));
	const names: Record<Which, string> = { kink: 'a twisted unknot', trefoil: 'the right-handed trefoil', eight: 'the figure-eight knot' };
</script>

<div class="kc">
	<div class="cube">
		<svg viewBox="0 0 {W} {H}" role="img" aria-label="The cube of resolutions of {names[which]}: {1 << n} states in {n + 1} columns, joined by merge and split maps.">
			{#each edges as e (e.a + '-' + e.b)}
				{@const A = place.get(e.a)!}
				{@const B = place.get(e.b)!}
				<line
					x1={A.x + CW}
					y1={A.y + CH / 2 - 5}
					x2={B.x}
					y2={B.y + CH / 2 - 5}
					class="edge"
					class:merge={e.merge}
					class:lit={hover === e.a || hover === e.b}
					marker-end={e.merge ? 'url(#arrow-gold)' : 'url(#arrow-teal)'}
				/>
			{/each}
			{#each states as s (s.st)}
				{@const at = place.get(s.st)!}
				<g
					role="presentation"
					onpointerenter={() => (hover = s.st)}
					onpointerleave={() => (hover = null)}
					class="card"
					class:lit={hover === s.st}
				>
					<rect x={at.x} y={at.y} width={CW} height={CH} rx="9" class="cardbg" />
					{#each pathsIn(s.st, at.x, at.y) as p, i (i)}
						<path d={p.d} class="ln" style="stroke:{p.c}" />
					{/each}
					<text x={at.x + CW / 2} y={at.y + CH - 5} class="dim">{s.k} circle{s.k === 1 ? '' : 's'} · dim {2 ** s.k}</text>
				</g>
			{/each}
		</svg>
		<div class="legend ui">
			<span><i class="sw gold"></i>two circles merge</span>
			<span><i class="sw teal"></i>one circle splits</span>
			<span class="faint">columns: how many crossings are smoothed the B way</span>
		</div>
	</div>

	<div class="tables">
		<table class="ui">
			<caption>{view === 'chains' ? 'Dimensions of the chain groups' : 'Dimensions of Khovanov homology'}</caption>
			<thead>
				<tr><th class="corner">j \ i</th>{#each is as i (i)}<th>{i}</th>{/each}</tr>
			</thead>
			<tbody>
				{#each js as j (j)}
					<tr>
						<th>{j}</th>
						{#each is as i (i)}
							{@const v = table.get(`${i},${j}`) ?? 0}
							<td class:hit={v > 0} class:kh={view === 'homology' && v > 0}>{v || ''}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="sum" aria-live="polite">
			<p>
				{#if view === 'chains'}
					{[...chains.values()].reduce((a, b) => a + b, 0)} basis vectors in all. Switch to homology to see what survives.
				{:else}
					Only {total} survive{total === 1 ? 's' : ''}{which === 'kink' ? ': exactly the homology of a round unknot, though this diagram has a crossing' : ''}.
				{/if}
			</p>
			<p><TeX tex={`\\sum_{i,j} (-1)^i q^j \\dim \\mathit{Kh}^{i,j} = ${L.tex(chi, 'q')}`} /></p>
			<p class="dim2"><TeX tex={`(q + q^{-1})\\,V(q^2) = ${L.tex(jq, 'q')}`} /></p>
		</div>
	</div>

	<div class="ctl ui">
		<Segmented
			bind:value={which}
			label="Which diagram"
			options={[
				{ value: 'kink', label: 'Twisted unknot' },
				{ value: 'trefoil', label: 'Trefoil' },
				{ value: 'eight', label: 'Figure-eight' }
			]}
		/>
		<Segmented
			bind:value={view}
			label="Which table"
			options={[
				{ value: 'chains', label: 'Chain groups' },
				{ value: 'homology', label: 'Homology' }
			]}
		/>
	</div>
</div>

<style>
	.kc {
		display: grid;
		gap: 0.5rem;
	}
	.cube {
		padding: 0.4rem 0.8rem 0;
	}
	svg {
		width: 100%;
		max-height: 520px;
		display: block;
	}
	.edge {
		stroke: rgba(95, 214, 207, 0.45);
		stroke-width: 1.4;
	}
	.edge.merge {
		stroke: rgba(244, 215, 156, 0.5);
	}
	.edge.lit {
		stroke-width: 2.4;
		stroke-opacity: 1;
	}
	.cardbg {
		fill: rgba(12, 17, 32, 0.9);
		stroke: rgba(244, 215, 156, 0.18);
	}
	.card.lit .cardbg {
		stroke: var(--gold-bright);
	}
	.ln {
		fill: none;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.dim {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-size: 8.5px;
		fill: var(--ink-faint);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1.2rem;
		font-size: 0.74rem;
		color: var(--ink-dim);
		margin-top: 0.3rem;
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.legend .faint {
		color: var(--ink-faint);
	}
	.sw {
		display: inline-block;
		width: 1.2rem;
		height: 2px;
	}
	.sw.gold {
		background: var(--gold-bright);
	}
	.sw.teal {
		background: var(--teal);
	}
	.tables {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 1rem;
		align-items: center;
		padding: 0 1rem;
	}
	@media (max-width: 640px) {
		.tables {
			grid-template-columns: 1fr;
			justify-items: center;
		}
	}
	table {
		border-collapse: collapse;
		font-size: 0.78rem;
	}
	caption {
		white-space: nowrap;
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
		padding-bottom: 0.3rem;
	}
	th,
	td {
		min-width: 1.8rem;
		height: 1.5rem;
		text-align: center;
		border: 1px solid rgba(244, 215, 156, 0.1);
		color: var(--ink-faint);
		font-variant-numeric: tabular-nums;
	}
	th {
		font-weight: 600;
		color: var(--ink-dim);
		background: rgba(255, 255, 255, 0.02);
	}
	.corner {
		font-weight: 400;
		font-size: 0.66rem;
	}
	td.hit {
		color: var(--ink);
	}
	td.kh {
		color: #0b1122;
		background: var(--gold-bright);
		font-weight: 700;
	}
	.sum {
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.sum p {
		margin: 0.3rem 0;
		overflow-x: auto;
	}
	.dim2 {
		color: var(--ink-faint);
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		justify-content: center;
		padding: 0.2rem 0.8rem 0.9rem;
	}
</style>
