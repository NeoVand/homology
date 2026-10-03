<script lang="ts">
	// Figure: orientations. Reorder the vertices of an edge or a triangle; an
	// even number of swaps keeps the direction, an odd number reverses it.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { permutationParity } from './data';

	let edge = $state([0, 1]);
	let tri = $state([0, 1, 2]);
	let swaps = $state(0);

	type P = [number, number];
	const EV: P[] = [
		[60, 190],
		[230, 120]
	];
	const TV: P[] = [
		[330, 235],
		[560, 235],
		[445, 50]
	];
	const cen: P = [(TV[0][0] + TV[1][0] + TV[2][0]) / 3, (TV[0][1] + TV[1][1] + TV[2][1]) / 3];

	function chevron(a: P, b: P, size = 8) {
		const mx = (a[0] + b[0]) / 2;
		const my = (a[1] + b[1]) / 2;
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
		const ux = (b[0] - a[0]) / L;
		const uy = (b[1] - a[1]) / L;
		return `M ${mx - ux * size - uy * size * 0.8} ${my - uy * size + ux * size * 0.8} L ${mx + ux * size * 0.4} ${my + uy * size * 0.4} L ${mx - ux * size + uy * size * 0.8} ${my - uy * size - ux * size * 0.8}`;
	}
	const evenTri = $derived(permutationParity(tri) === 0);
	// on screen (y down) the order 0 → 1 → 2 runs counter-clockwise
	const r = 40;
	const arcPath = $derived.by(() => {
		// a 220° arc: anticlockwise (SVG sweep 0) for even orders, clockwise otherwise
		const a0 = evenTri ? -20 : 200;
		const a1 = evenTri ? 200 : -20;
		const p = (deg: number): P => [cen[0] + r * Math.cos((deg * Math.PI) / 180), cen[1] - r * Math.sin((deg * Math.PI) / 180)];
		const [x0, y0] = p(a0);
		const [x1, y1] = p(a1);
		return `M ${x0} ${y0} A ${r} ${r} 0 1 ${evenTri ? 0 : 1} ${x1} ${y1}`;
	});
	function swapTri(i: number, j: number) {
		const t = [...tri];
		[t[i], t[j]] = [t[j], t[i]];
		tri = t;
		swaps += 1;
	}
	const list = (o: number[]) => `[${o.map((v) => `v_${v}`).join(',')}]`;
</script>

<div class="wrap">
	<Svg viewBox="0 0 640 300" maxHeight={330} label="An oriented edge and an oriented triangle; the arrows follow the order of the vertices">
		<!-- the edge -->
		<line x1={EV[0][0]} y1={EV[0][1]} x2={EV[1][0]} y2={EV[1][1]} class="e" />
		<path d={chevron(EV[edge[0]], EV[edge[1]], 11)} class="chev gold" />
		{#each EV as v, i (i)}
			<circle cx={v[0]} cy={v[1]} r="7" class="v" />
			<SvgTeX x={v[0] + (i === 0 ? -6 : 8)} y={v[1] + (i === 0 ? 26 : -24)} tex={`v_${i}`} size={18} w={40} h={28} />
		{/each}
		<SvgTeX x={145} y={262} tex={list(edge)} size={17} color="var(--gold-bright)" w={160} h={30} />

		<!-- the triangle -->
		<polygon points={TV.map((p) => p.join(',')).join(' ')} class="t" class:cw={!evenTri} />
		{#each [0, 1, 2] as k (k)}
			{@const a = TV[tri[k]]}
			{@const b = TV[tri[(k + 1) % 3]]}
			<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="e" />
			<path d={chevron(a, b, 10)} class="chev" class:gold={evenTri} class:violet={!evenTri} />
		{/each}
		<path d={arcPath} class="arc" class:gold={evenTri} class:violet={!evenTri} marker-end="url(#arrow-{evenTri ? 'gold' : 'violet'})" />
		{#each TV as v, i (i)}
			<circle cx={v[0]} cy={v[1]} r="7" class="v" />
			<SvgTeX x={v[0] + (i === 0 ? -18 : i === 1 ? 18 : 0)} y={v[1] + (i === 2 ? -22 : 20)} tex={`v_${i}`} size={18} w={40} h={28} />
		{/each}
		<SvgTeX x={445} y={278} tex={list(tri)} size={17} color={evenTri ? 'var(--gold-bright)' : 'var(--violet)'} w={200} h={30} />
	</Svg>
	<div class="readout ui" aria-live="polite">
		<div>
			{#if edge[0] === 0}
				Edge: <TeX tex="[v_0,v_1]" /> points from <TeX tex="v_0" /> to <TeX tex="v_1" />.
			{:else}
				Edge: <TeX tex="[v_1,v_0]" /> points the other way, so we write <TeX tex="[v_1,v_0] = -[v_0,v_1]" />.
			{/if}
		</div>
		<div>
			Triangle: <TeX tex={list(tri)} /> is {evenTri ? 'an even' : 'an odd'} rearrangement of <TeX tex="[v_0,v_1,v_2]" /> —
			<span class={evenTri ? 'gold' : 'violet'}>{evenTri ? 'the same orientation (anticlockwise here)' : 'the opposite orientation (clockwise here)'}</span>.
			<span class="dim">Swaps so far: {swaps}.</span>
		</div>
	</div>
</div>
<div class="bar ui">
	<Button variant="ghost" onclick={() => (edge = [edge[1], edge[0]])}>Edge: swap ends</Button>
	<span class="sep"></span>
	<Button variant="ghost" onclick={() => swapTri(0, 1)}>Triangle: swap 1st and 2nd</Button>
	<Button variant="ghost" onclick={() => swapTri(1, 2)}>swap 2nd and 3rd</Button>
	<Button
		variant="ghost"
		onclick={() => {
			tri = [tri[1], tri[2], tri[0]];
			swaps += 2;
		}}>rotate (two swaps)</Button
	>
</div>

<style>
	.wrap {
		padding: 0.8rem 0.8rem 0;
	}
	.e {
		stroke: rgba(235, 229, 213, 0.7);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.t {
		fill: rgba(242, 208, 143, 0.08);
		transition: fill 0.4s;
	}
	.t.cw {
		fill: rgba(164, 147, 255, 0.1);
	}
	.v {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.5;
	}
	.chev {
		fill: none;
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke: var(--gold-bright);
		transition: d 0.4s var(--ease);
	}
	.chev.violet,
	.arc.violet {
		stroke: var(--violet);
	}
	.arc {
		fill: none;
		stroke-width: 2.4;
		stroke: var(--gold-bright);
		stroke-linecap: round;
	}
	.readout {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.2rem 1.4rem 0.8rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.gold {
		color: var(--gold-bright);
	}
	.violet {
		color: var(--violet);
	}
	.dim {
		color: var(--ink-faint);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.6rem;
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.sep {
		width: 1px;
		height: 1.4rem;
		background: var(--line);
		margin: 0 0.3rem;
	}
</style>
