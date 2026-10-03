<script lang="ts">
	// Figure: HodgeRank. Five teams, six games. Edit the score margins; the
	// least-squares ranking (gradient part) and the two kinds of inconsistency
	// (curl around the filled triangle, harmonic around the unfilled cycle) update.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '../categories/Stepper.svelte';
	import { hodgeRank } from './hodgerank';

	const teams = [
		{ name: 'Aurora', short: 'A', x: 250, y: 50 },
		{ name: 'Boreal', short: 'B', x: 80, y: 120 },
		{ name: 'Cygnus', short: 'C', x: 200, y: 215 },
		{ name: 'Draco', short: 'D', x: 360, y: 300 },
		{ name: 'Electra', short: 'E', x: 440, y: 140 }
	];
	const pairs: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2],
		[2, 3],
		[3, 4],
		[0, 4]
	];
	type Preset = 'season' | 'consistent' | 'rps' | 'cycle';
	const presets: Record<Preset, number[]> = {
		// margin = (points of first team) − (points of second team), for each pair above
		season: [2, 1, -1, 3, 0, 1],
		consistent: [1, 2, 3, 1, -2, 2],
		rps: [1, 1, -1, 0, 0, 0],
		cycle: [0, 0, -1, -1, -1, 1]
	};
	let preset = $state<Preset>('season');
	let margins = $state<number[]>([...presets.season]);
	let view = $state<'flow' | 'gradient' | 'curl' | 'harmonic'>('flow');
	function load(p: Preset) {
		margins = [...presets[p]];
	}

	const games = $derived(pairs.map(([a, b], k) => ({ a, b, sa: Math.max(0, margins[k]), sb: Math.max(0, -margins[k]) })));
	const R = $derived(hodgeRank(5, games));
	const edges = $derived(R.K.simplices[1]);
	const shown = $derived(view === 'flow' ? R.flow : view === 'gradient' ? R.parts.gradient : view === 'curl' ? R.parts.curl : R.parts.harmonic);
	const colors = { flow: '#f2d08f', gradient: '#5fd6cf', curl: '#a493ff', harmonic: '#f28db6' } as const;
	const markers = { flow: 'gold', gradient: 'teal', curl: 'violet', harmonic: 'rose' } as const;
	const scale = $derived(Math.max(1, ...R.flow.map(Math.abs)));
	const order = $derived(teams.map((t, i) => ({ ...t, r: R.ratings[i] })).sort((a, b) => b.r - a.r));
	const rMax = $derived(Math.max(0.5, ...R.ratings.map(Math.abs)));
	const pct = (x: number) => (R.energy.total > 1e-12 ? Math.round((100 * x) / R.energy.total) : 0);
	const fmt = (x: number) => (Math.abs(x) < 0.005 ? '0.00' : (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2));

	function arrow(i: number) {
		const [a, b] = edges[i];
		const v = shown[i];
		const [s, t] = v >= 0 ? [teams[a], teams[b]] : [teams[b], teams[a]];
		const dx = t.x - s.x;
		const dy = t.y - s.y;
		const L = Math.hypot(dx, dy);
		const g = 30 / L;
		return {
			x1: s.x + dx * g,
			y1: s.y + dy * g,
			x2: t.x - dx * g,
			y2: t.y - dy * g,
			w: 1 + (6 * Math.abs(v)) / scale,
			show: Math.abs(v) > 0.03,
			mx: (s.x + t.x) / 2,
			my: (s.y + t.y) / 2
		};
	}
	const hole = { x: 300, y: 175 };
</script>

<div class="hr">
	<div class="cols">
		<div>
			<Svg viewBox="40 10 450 330" maxHeight={360} label="Five teams and the six games between them; arrows point towards the team that did better">
				<!-- the filled triangle A, B, C -->
				<polygon points="{teams[0].x},{teams[0].y} {teams[1].x},{teams[1].y} {teams[2].x},{teams[2].y}" class="tri" />
				<text x={(teams[0].x + teams[1].x + teams[2].x) / 3} y={(teams[0].y + teams[1].y + teams[2].y) / 3 + 4} text-anchor="middle" class="t-ui tri-t">all three played</text>
				<text x={hole.x} y={hole.y} text-anchor="middle" class="t-ui hole-t">no triangle here</text>
				{#each edges as e, i (e.join(','))}
					<line x1={teams[e[0]].x} y1={teams[e[0]].y} x2={teams[e[1]].x} y2={teams[e[1]].y} class="edge" />
				{/each}
				{#each edges as e, i (e.join(','))}
					{@const A = arrow(i)}
					{#if A.show}
						<line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} stroke={colors[view]} stroke-width={A.w + 6} stroke-linecap="round" opacity="0.15" />
						<line x1={A.x1} y1={A.y1} x2={A.x2} y2={A.y2} stroke={colors[view]} stroke-width={A.w} stroke-linecap="round" marker-end="url(#arrowmid-{markers[view]})" />
					{/if}
					<SvgTeX x={A.mx + (e[0] === 0 && e[1] === 1 ? -12 : 14)} y={A.my - 12} tex={Math.abs(shown[i]) < 0.005 ? '0' : Math.abs(shown[i]).toFixed(view === 'flow' ? 0 : 2)} size={12} color={colors[view]} w={50} h={18} />
				{/each}
				{#each teams as t, i (t.short)}
					{@const rr = R.ratings[i] / rMax}
					<g transform="translate({t.x} {t.y})">
						<circle r="24" class="team" style="--g:{0.15 + 0.5 * Math.max(0, rr)}" />
						<SvgTeX x={0} y={0} tex={t.short} size={17} color="#0b1122" w={24} h={24} />
					</g>
				{/each}
			</Svg>
		</div>
		<div class="side ui">
			<div class="stitle">Ranking (the gradient part)</div>
			{#each order as t, k (t.short)}
				<div class="rrow">
					<span class="rk">{k + 1}</span>
					<span class="nm">{t.name}</span>
					<span class="barwrap"
						><span class="bar" class:neg={t.r < 0} style="width:{(50 * Math.abs(t.r)) / rMax}%; {t.r < 0 ? 'right:50%' : 'left:50%'}"></span
						></span
					>
					<span class="rv">{fmt(t.r)}</span>
				</div>
			{/each}
			<div class="stitle second">How consistent were the results?</div>
			<div class="split">
				<div><i class="sw g"></i>explained by the ranking <b>{pct(R.energy.gradient)}%</b></div>
				<div><i class="sw c"></i>local cycles (A, B, C) <b>{pct(R.energy.curl)}%</b></div>
				<div><i class="sw h"></i>a long cycle (A, C, D, E) <b>{pct(R.energy.harmonic)}%</b></div>
			</div>
		</div>
	</div>
	<div class="games ui">
		{#each pairs as [a, b], k (k)}
			<div class="game">
				<Stepper bind:value={margins[k]} min={-5} max={5} label="{teams[a].short} − {teams[b].short}" />
			</div>
		{/each}
	</div>
	<p class="note ui">Each number is a score margin: how many points the first team scored more than the second. <TeX tex={'\\text{flow}(i\\to j) = \\text{points}_j - \\text{points}_i'} />, so arrows point to the better team.</p>
	<Controls>
		<Segmented
			bind:value={view}
			label="What to draw"
			options={[
				{ value: 'flow', label: 'results' },
				{ value: 'gradient', label: 'ranking part' },
				{ value: 'curl', label: 'local cycles' },
				{ value: 'harmonic', label: 'long cycle' }
			]}
		/>
		<Segmented
			bind:value={preset}
			onchange={(p) => load(p)}
			label="Season"
			options={[
				{ value: 'season', label: 'a real-ish season' },
				{ value: 'consistent', label: 'consistent' },
				{ value: 'rps', label: 'rock–paper–scissors' },
				{ value: 'cycle', label: 'round the houses' }
			]}
		/>
	</Controls>
</div>

<style>
	.hr {
		padding-top: 0.8rem;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		padding: 0 1rem;
		align-items: center;
	}
	@media (max-width: 720px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.tri {
		fill: rgba(164, 147, 255, 0.12);
		stroke: rgba(164, 147, 255, 0.3);
		stroke-dasharray: 4 4;
	}
	.tri-t,
	.hole-t {
		font-size: 9.5px !important;
		fill: rgba(164, 147, 255, 0.8) !important;
	}
	.hole-t {
		fill: rgba(242, 141, 182, 0.75) !important;
	}
	.edge {
		stroke: rgba(200, 192, 170, 0.2);
		stroke-width: 1.2;
	}
	.team {
		fill: rgb(244 215 156 / calc(0.55 + var(--g)));
		stroke: #fff6dc;
		stroke-width: 1.5;
		filter: url(#glow);
	}
	.side {
		font-size: 0.82rem;
	}
	.stitle {
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 0.35rem;
	}
	.stitle.second {
		margin-top: 0.9rem;
	}
	.rrow {
		display: grid;
		grid-template-columns: 1.1rem 4.4rem 1fr 3.2rem;
		align-items: center;
		gap: 0.4rem;
		margin: 0.18rem 0;
	}
	.rk {
		color: var(--ink-faint);
	}
	.nm {
		color: var(--ink-bright);
	}
	.barwrap {
		position: relative;
		height: 10px;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 5px;
	}
	.bar {
		position: absolute;
		top: 0;
		height: 100%;
		background: #5fd6cf;
		border-radius: 5px;
		transition: all 0.35s var(--ease);
	}
	.bar.neg {
		background: rgba(95, 214, 207, 0.45);
	}
	.rv {
		text-align: right;
		color: var(--teal);
		font-variant-numeric: tabular-nums;
	}
	.split {
		display: grid;
		gap: 0.2rem;
		color: var(--ink-dim);
	}
	.split b {
		color: var(--ink-bright);
	}
	.sw {
		display: inline-block;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 3px;
		margin-right: 0.4rem;
		vertical-align: -1px;
	}
	.sw.g {
		background: #5fd6cf;
	}
	.sw.c {
		background: #a493ff;
	}
	.sw.h {
		background: #f28db6;
	}
	.games {
		display: grid;
		grid-template-columns: repeat(3, max-content);
		gap: 0.4rem 1rem;
		justify-content: center;
		padding: 0.6rem 1rem 0.2rem;
	}
	@media (max-width: 560px) {
		.games {
			grid-template-columns: repeat(2, max-content);
			gap: 0.4rem 0.5rem;
		}
	}
	.game {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.15rem 0.5rem;
		border: 1px solid var(--line-faint);
		border-radius: 10px;
		background: rgba(5, 9, 18, 0.4);
	}
	.note {
		text-align: center;
		font-size: 0.76rem;
		color: var(--ink-faint);
		margin: 0.3rem 1rem 0.5rem;
	}
</style>
