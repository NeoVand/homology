<script lang="ts">
	// Figure: barycentric subdivision, step by step. Each small triangle of the
	// subdivision is a "flag": a vertex inside an edge inside a triangle.
	import { onMount } from 'svelte';
	import { draw, scale } from 'svelte/transition';
	import Svg from '$lib/components/svg/Svg.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { SimplicialComplex } from '$lib/math/complex';
	import { barycentricSubdivision, type V2 } from './data';

	const basePos: V2[] = [
		[110, 335],
		[380, 335],
		[245, 95],
		[555, 150]
	];
	const K0 = new SimplicialComplex([
		[0, 1, 2],
		[1, 3]
	]);
	const sd1 = barycentricSubdivision(K0, (v) => basePos[v]);
	const sd2 = barycentricSubdivision(sd1.complex, (v) => sd1.pos[v]);

	interface Stage {
		K: SimplicialComplex;
		pos: V2[];
		/** dimension of the simplex (of the previous stage) that each vertex is the barycentre of */
		dimOf: number[];
		origin: number[][] | null;
		prevPos: V2[] | null;
	}
	const stages: Stage[] = [
		{ K: K0, pos: basePos, dimOf: basePos.map(() => 0), origin: null, prevPos: null },
		{ K: sd1.complex, pos: sd1.pos, dimOf: sd1.origin.map((s) => s.length - 1), origin: sd1.origin, prevPos: basePos },
		{ K: sd2.complex, pos: sd2.pos, dimOf: sd2.origin.map((s) => s.length - 1), origin: sd2.origin, prevPos: sd1.pos }
	];
	const dimColour = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)'];

	let step = $state(0);
	let hover = $state<number | null>(null);
	let reduced = $state(false);
	onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));
	$effect(() => {
		void step;
		hover = null;
	});

	const st = $derived(stages[step]);
	const P = (v: number) => st.pos[v];
	const fv = $derived(st.K.fVector);
	const chi = $derived(st.K.eulerCharacteristic());
	// the flag behind the hovered small triangle: the simplices of the previous stage
	const flag = $derived.by(() => {
		if (hover === null || !st.origin) return null;
		const t = st.K.simplices[2][hover];
		return t.map((v) => st.origin![v]).sort((a, b) => a.length - b.length);
	});
	const dur = $derived(reduced ? 0 : 650);
	const flagName = (s: number[]) => (s.length === 1 ? 'a vertex' : s.length === 2 ? 'an edge' : 'a triangle');
</script>

<div class="wrap">
	<Svg viewBox="60 60 540 310" maxHeight={380} label="A triangle with an edge attached, and its barycentric subdivisions">
		{#key step}
			<g>
				{#each st.K.simplices[2] ?? [] as t, i (i)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<polygon
						points={t.map((v) => P(v).join(',')).join(' ')}
						class="tri"
						class:hot={hover === i}
						onpointerenter={() => (hover = i)}
						onpointerleave={() => (hover = null)}
						onclick={() => (hover = hover === i ? null : i)}
					/>
				{/each}
				{#each st.K.simplices[1] as e, i (i)}
					{@const [a, b] = e.map(P)}
					<path d="M {a[0]} {a[1]} L {b[0]} {b[1]}" class="edge" in:draw={{ duration: dur, delay: dur ? (i % 12) * 25 : 0 }} />
				{/each}
				{#if flag && st.prevPos}
					{@const pp = st.prevPos}
					{#each flag as s, k (k)}
						{#if s.length === 3}
							<polygon points={s.map((v) => pp[v].join(',')).join(' ')} class="flag-tri" />
						{:else if s.length === 2}
							<line x1={pp[s[0]][0]} y1={pp[s[0]][1]} x2={pp[s[1]][0]} y2={pp[s[1]][1]} class="flag-edge" />
						{:else}
							<circle cx={pp[s[0]][0]} cy={pp[s[0]][1]} r="11" class="flag-v" />
						{/if}
					{/each}
				{/if}
				{#each st.K.simplices[0] as [v], i (v)}
					{@const [x, y] = P(v)}
					<circle cx={x} cy={y} r={step === 2 ? 3.6 : 6} fill={dimColour[st.dimOf[v]]} class="v" in:scale={{ duration: dur, delay: dur ? 120 + (i % 10) * 20 : 0 }} />
				{/each}
			</g>
		{/key}
	</Svg>
	<div class="readout ui" aria-live="polite">
		<div class="fv">
			<TeX tex={`V - E + F = ${fv[0]} - ${fv[1]} + ${fv[2] ?? 0} = ${chi}`} />
		</div>
		{#if flag}
			<div class="flagtxt">
				This small triangle has corners at the centres of {flagName(flag[0])}, {flagName(flag[1])} and {flagName(flag[2])}, each inside
				the next: <span class="g">vertex</span> ⊂ <span class="t">edge</span> ⊂ <span class="vio">triangle</span>.
			</div>
		{:else if step > 0}
			<div class="flagtxt dim">Hover or tap a small triangle to see the chain of faces it comes from.</div>
		{:else}
			<div class="flagtxt dim">A triangle with an edge attached. Step forward to subdivide.</div>
		{/if}
		<div class="legend">
			<span><i style="background:var(--gold-bright)"></i>old vertex</span>
			<span><i style="background:var(--teal)"></i>centre of an edge</span>
			<span><i style="background:var(--violet)"></i>centre of a triangle</span>
		</div>
	</div>
</div>
<div class="bar ui">
	<StepControls bind:step count={3} labels={['The complex K', 'One barycentric subdivision', 'Two subdivisions']} interval={2200} />
</div>

<style>
	.wrap {
		padding: 0.6rem 0.8rem 0;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.1);
		stroke: none;
		cursor: pointer;
		transition: fill 0.2s;
	}
	.tri.hot {
		fill: rgba(242, 208, 143, 0.4);
	}
	.edge {
		stroke: rgba(235, 229, 213, 0.7);
		stroke-width: 1.6;
		stroke-linecap: round;
		fill: none;
		pointer-events: none;
	}
	.v {
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.2;
		pointer-events: none;
	}
	.flag-tri {
		fill: none;
		stroke: var(--violet);
		stroke-width: 3;
		stroke-dasharray: 6 5;
		pointer-events: none;
	}
	.flag-edge {
		stroke: var(--teal);
		stroke-width: 5;
		stroke-linecap: round;
		filter: url(#glow);
		pointer-events: none;
	}
	.flag-v {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.5;
		filter: url(#glow);
		pointer-events: none;
	}
	.readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0 1.2rem 0.8rem;
		text-align: center;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.fv {
		font-size: 1.05rem;
		color: var(--ink-bright);
	}
	.flagtxt {
		max-width: 38rem;
		min-height: 2.8em;
	}
	.flagtxt.dim {
		color: var(--ink-faint);
	}
	.g {
		color: var(--gold-bright);
	}
	.t {
		color: var(--teal);
	}
	.vio {
		color: var(--violet);
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1rem;
		font-size: 0.72rem;
		color: var(--ink-faint);
	}
	.legend i {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		margin-right: 0.35rem;
		vertical-align: -0.05rem;
	}
	.bar {
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
