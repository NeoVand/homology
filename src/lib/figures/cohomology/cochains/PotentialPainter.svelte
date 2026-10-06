<script lang="ts">
	// Figure: heights on the junctions of a trail map produce differences on the
	// trails. Drag a junction up or down; switch to a tilted "terrain" view; flip
	// a trail's arrow to see orientation at work; check that every loop sums to 0.
	// In "islands" mode the question is instead: when is δf = 0 everywhere?
	import { onMount, untrack } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import OGraphView from './OGraphView.svelte';
	import { gradient, components, pathSum, signed, type Pt } from './graph';
	import { trailMap, trailLoops, islands } from './presets';
	import { ArrowRightIcon, ShuffleIcon } from '$lib/icons';

	let { mode: modeProp = 'trail' }: { mode?: 'trail' | 'islands' } = $props();

	// the figure's mode is fixed for its lifetime
	const mode = untrack(() => modeProp);
	const L = mode === 'trail' ? trailMap : islands;
	const E = L.edges.length;
	const lo = mode === 'trail' ? 1100 : 0;
	const hi = mode === 'trail' ? 2000 : 600;
	const stepM = 10;
	const nudgeBy = mode === 'trail' ? 50 : 30; // one press of the stepper

	let heights = $state<number[]>([...L.heights]);
	let flip = $state<boolean[]>(new Array(E).fill(false));
	let selected = $state<number | null>(mode === 'trail' ? 3 : null);
	let loopIx = $state(0);
	let terrain = $state(false);
	let t = $state(0); // 0 = map, 1 = terrain (tweened)
	let reduced = false;

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	// smooth tween of the view
	let raf = 0;
	$effect(() => {
		const target = terrain ? 1 : 0;
		cancelAnimationFrame(raf);
		if (reduced) {
			t = target;
			return;
		}
		const t0 = t;
		const start = performance.now();
		const dur = 750;
		const tick = (now: number) => {
			const u = Math.min(1, (now - start) / dur);
			const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
			t = t0 + (target - t0) * e;
			if (u < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	});

	const LIFT = mode === 'trail' ? 0.2 : 0.22; // svg units per metre in terrain view
	const ground = (y: number) => (mode === 'trail' ? 132 + 0.62 * y : 150 + 0.55 * y);
	const base = mode === 'trail' ? 1200 : 0;

	const groundPos = $derived(L.pos.map(([x, y]) => [x, y * (1 - t) + ground(y) * t] as Pt));
	const pos = $derived(groundPos.map(([x, y], v) => [x, y - (heights[v] - base) * LIFT * t] as Pt));

	const df = $derived(gradient(L, heights));
	const shownEdges = $derived(L.edges.map(([a, b], e) => (flip[e] ? ([b, a] as [number, number]) : ([a, b] as [number, number]))));
	const shownValue = (e: number) => (flip[e] ? -df[e] : df[e]);

	// colour ramp for heights: teal → violet → gold
	const stops = [
		[63, 167, 196],
		[164, 147, 255],
		[244, 215, 156]
	];
	function ramp(h: number) {
		const u = Math.max(0, Math.min(1, (h - lo) / (hi - lo)));
		const s = u < 0.5 ? 0 : 1;
		const k = u < 0.5 ? u * 2 : (u - 0.5) * 2;
		const c = stops[s].map((a, i) => Math.round(a + (stops[s + 1][i] - a) * k));
		return `rgb(${c.join(',')})`;
	}

	// dragging
	let dragStart: number | null = null;
	function onDrag(v: number, dy: number) {
		if (dragStart === null) dragStart = heights[v];
		selected = v;
		const perUnit = 1 / (LIFT * Math.max(t, 0.5)) / (mode === 'trail' ? 1 : 1);
		const h = dragStart - dy * perUnit;
		heights[v] = Math.max(lo, Math.min(hi, Math.round(h / stepM) * stepM));
	}
	// the stepper offers h ± 1; each press moves the junction a whole notch
	function nudge(v: number) {
		if (selected === null) return;
		const h = heights[selected];
		heights[selected] = Math.max(lo, Math.min(hi, h + Math.sign(v - h) * nudgeBy));
	}

	// loops (trail mode)
	const loop = $derived(mode === 'trail' ? trailLoops[loopIx] : []);
	const loopEdges = $derived.by(() => {
		const s = new Set<number>();
		for (let i = 0; i + 1 < loop.length; i++) {
			const e = L.edges.findIndex(([a, b]) => (a === loop[i] && b === loop[i + 1]) || (b === loop[i] && a === loop[i + 1]));
			if (e >= 0) s.add(e);
		}
		return s;
	});
	const loopTerms = $derived.by(() => {
		const out: number[] = [];
		for (let i = 0; i + 1 < loop.length; i++) out.push(pathSum(L, df, [loop[i], loop[i + 1]]));
		return out;
	});
	const loopTeX = $derived(
		loopTerms.map((x, i) => (i === 0 ? String(x).replace('-', '-') : x < 0 ? `- ${-x}` : `+ ${x}`)).join(' ') +
			' = ' +
			loopTerms.reduce((a, b) => a + b, 0)
	);

	// islands
	const comps = components(L);
	const flatEverywhere = $derived(df.every((x) => x === 0));
	function flatten() {
		const sums = new Array(comps.count).fill(0);
		const cnt = new Array(comps.count).fill(0);
		heights.forEach((h, v) => {
			sums[comps.comp[v]] += h;
			cnt[comps.comp[v]]++;
		});
		heights = heights.map((_, v) => Math.round(sums[comps.comp[v]] / cnt[comps.comp[v]] / stepM) * stepM);
	}
	function scramble() {
		heights = heights.map((h) => Math.max(lo, Math.min(hi, h + (Math.round(Math.random() * 12) - 6) * stepM * 2)));
	}

	const edgeColor = (e: number) => {
		if (mode === 'islands') return df[e] === 0 ? 'var(--green)' : 'var(--rose)';
		if (loopEdges.has(e)) return 'var(--gold-bright)';
		return 'var(--teal)';
	};
	const selName = $derived(selected === null ? '' : (L.names?.[selected] || `Vertex ${selected + 1}`));
</script>

<div class="painter">
	<Svg viewBox={mode === 'trail' ? '-8 26 476 316' : '30 22 420 284'} maxHeight={430} label={mode === 'trail' ? 'A trail map: junction heights and the climbs along each trail' : 'Three islands of a graph with heights on their vertices'}>
		<!-- terrain: ground shadow and pillars -->
		{#if t > 0.01}
			<g style="opacity:{t}">
				{#each L.edges as [a, b], i (i)}
					<line x1={groundPos[a][0]} y1={groundPos[a][1]} x2={groundPos[b][0]} y2={groundPos[b][1]} class="shadow" />
				{/each}
				{#each groundPos as [x, y], v (v)}
					<ellipse cx={x} cy={y} rx="9" ry="3.6" class="foot" />
					<line x1={x} y1={y} x2={pos[v][0]} y2={pos[v][1]} class="pillar" style="stroke:{ramp(heights[v])}" />
				{/each}
			</g>
		{/if}
		<OGraphView
			{pos}
			edges={shownEdges}
			vertexRadius={10}
			edgeColor={edgeColor}
			edgeWidth={(e) => (loopEdges.has(e) ? 3.4 : 2.6)}
			edgeLabel={(e) => signed(shownValue(e))}
			edgeLabelColor={(e) => (mode === 'islands' ? (df[e] === 0 ? 'var(--green)' : 'var(--rose)') : loopEdges.has(e) ? 'var(--gold-bright)' : 'var(--teal)')}
			vertexFill={(v) => ramp(heights[v])}
			vertexLabel={(v) => (mode === 'trail' ? `${heights[v]} m` : String(heights[v]))}
			vertexLabelColor={() => 'var(--gold-bright)'}
			vertexName={(v) => (mode === 'trail' && t < 0.5 ? L.names?.[v] : null)}
			selectedVertex={selected}
			dragVertex={true}
			autoPlace
			avoid={t > 0.01 ? groundPos.map((g, v) => [g, pos[v]] as [Pt, Pt]) : []}
			clickEdge={mode === 'trail'}
			onedge={(e) => (flip[e] = !flip[e])}
			onvertex={(v) => (selected = v)}
			ondrag={onDrag}
			ondragend={() => (dragStart = null)}
		/>
	</Svg>
</div>

<Controls>
	<div class="row top">
		<span class="sel">
			{#if selected !== null}
				<Stepper
					label={selName}
					value={heights[selected]}
					min={lo}
					max={hi}
					format={(v) => (mode === 'trail' ? `${v} m` : String(v))}
					onchange={nudge}
				/>
			{:else}
				<span class="ui dim">Tap a vertex to raise or lower it</span>
			{/if}
		</span>
		<Toggle bind:checked={terrain} label="Terrain view" />
	</div>
	{#if mode === 'trail'}
		<div class="row readout">
			<Button icon={ArrowRightIcon} onclick={() => (loopIx = (loopIx + 1) % trailLoops.length)}>Next loop</Button>
			<span class="loop ui">
				Climbs around the <span class="gold">gold loop</span>:
				<span class="sum"><TeX tex={loopTeX} /></span>
			</span>
		</div>
	{:else}
		<div class="row readout">
			<Button onclick={flatten}>Flatten each island</Button>
			<Button icon={ShuffleIcon} onclick={scramble}>Scramble</Button>
			<span class="loop ui">
				{#if flatEverywhere}
					<span class="ok">δf = 0 on every edge</span> — each island is flat, but the {comps.count} islands sit at their own heights.
				{:else}
					<span class="bad">δf ≠ 0</span> on the {df.filter((x) => x !== 0).length} rose edge{df.filter((x) => x !== 0).length === 1 ? '' : 's'}.
				{/if}
			</span>
		</div>
	{/if}
</Controls>

<style>
	.painter {
		padding: 0.6rem 0.6rem 0.2rem;
	}
	.shadow {
		stroke: rgba(160, 170, 210, 0.25);
		stroke-width: 1.5;
		stroke-dasharray: 3 4;
	}
	.foot {
		fill: rgba(150, 170, 230, 0.18);
	}
	.pillar {
		stroke-width: 2;
		opacity: 0.55;
		stroke-dasharray: 2 3;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 0.9rem;
		width: 100%;
	}
	.top {
		justify-content: space-between;
	}
	.readout {
		border-top: 1px solid var(--line-faint);
		padding-top: 0.7rem;
	}
	.sel {
		display: inline-flex;
		align-items: center;
		min-height: 2.25rem;
	}
	.dim {
		color: var(--ink-faint);
		font-size: 0.76rem;
	}
	.loop {
		font-size: 0.84rem;
		color: var(--ink-dim);
		line-height: 1.5;
	}
	.loop :global(.katex) {
		font-size: 1.02em;
		color: var(--ink-bright);
	}
	.gold {
		color: var(--gold-bright);
	}
	.sum {
		display: inline-block;
		white-space: nowrap;
	}
	.ok {
		color: var(--green);
		font-weight: 600;
	}
	.bad {
		color: var(--rose);
		font-weight: 600;
	}
</style>
