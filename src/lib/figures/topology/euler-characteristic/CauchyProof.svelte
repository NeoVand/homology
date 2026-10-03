<script lang="ts">
	// Figure: Cauchy's proof of Euler's formula, step by step, on a cube.
	// Remove a face and flatten; cut into triangles; remove triangles from the
	// outside one at a time. V − E + F never changes; at the end it is 1.
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { Tween } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import Svg from '$lib/components/svg/Svg.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { cubeLayouts, cubeFaces, cubeEdges, removedFace, triangles, removalOrder, type P2 } from './cauchy';

	const order = removalOrder();
	const nSteps = 3 + order.length + 1;
	let step = $state(0);
	let reduced = $state(false);
	onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));

	const morph = new Tween(0, { duration: 1100, easing: cubicInOut });
	$effect(() => {
		morph.set(step >= 1 ? 1 : 0, { duration: reduced ? 0 : 1100 });
	});

	const S = 150;
	const C: P2 = [300, 205];
	const X = (p: P2): [number, number] => [C[0] + p[0] * S, C[1] - p[1] * S];
	const pos = $derived(
		cubeLayouts.box.map((b, i) => {
			const f = cubeLayouts.flat[i];
			const t = morph.current;
			return X([b[0] + (f[0] - b[0]) * t, b[1] + (f[1] - b[1]) * t]);
		})
	);
	const ek = (a: number, b: number) => (a < b ? `${a},${b}` : `${b},${a}`);

	// what is present at each step
	const view = $derived.by(() => {
		if (step <= 1) {
			const faces = step === 0 ? [...cubeFaces, removedFace] : cubeFaces;
			return {
				faces,
				tris: [] as number[],
				edges: cubeEdges.map(([a, b]) => [a, b] as [number, number]),
				verts: [0, 1, 2, 3, 4, 5, 6, 7],
				ghost: null as null | { tri: number; edges: [number, number][]; vertex?: number },
				V: 8,
				E: 12,
				F: step === 0 ? 6 : 5
			};
		}
		const removed = order.slice(0, Math.max(0, Math.min(order.length, step - 2)));
		const gone = new Set(removed.map((r) => r.tri));
		const tris = triangles.map((_, i) => i).filter((i) => !gone.has(i));
		const es = new Map<string, [number, number]>();
		const vs = new Set<number>();
		for (const i of tris) {
			const t = triangles[i];
			for (let k = 0; k < 3; k++) {
				const a = t[k];
				const b = t[(k + 1) % 3];
				es.set(ek(a, b), a < b ? [a, b] : [b, a]);
				vs.add(a);
			}
		}
		const last = step >= 3 && step - 3 < order.length ? order[step - 3] : null;
		return {
			faces: [] as number[][],
			tris,
			edges: [...es.values()],
			verts: [...vs],
			ghost: last ? { tri: last.tri, edges: last.edges, vertex: last.vertex } : null,
			V: vs.size,
			E: es.size,
			F: tris.length
		};
	});

	const labels = [
		'A cube',
		'Remove one face; stretch the rest flat',
		'Cut every face into triangles',
		...order.map((r, i) => `Remove triangle ${i + 1} of 9 (${r.kind === 'one' ? 'one outer edge' : 'two outer edges'})`),
		'One triangle is left'
	];
	const message = $derived.by(() => {
		if (step === 0)
			return 'A cube has 8 vertices, 12 edges and 6 faces. We will show that V − E + F = 2 by changing the picture in steps that never change V − E + F.';
		if (step === 1)
			return 'Remove the front face and stretch what is left out flat, as if looking through the hole from very close. Nothing else changes, so now V − E + F = 2 − 1 = 1. The missing face has become the outside.';
		if (step === 2)
			return 'Draw one diagonal across each face. Every diagonal adds one edge and splits one face into two: E goes up by 1 and F goes up by 1, so V − E + F does not change.';
		if (step < nSteps - 1) {
			const r = order[step - 3];
			return r.kind === 'one'
				? 'Remove a triangle with one edge on the outside: we lose that edge and the triangle. E and F both go down by 1 — no change to V − E + F.'
				: 'Remove a triangle with two edges on the outside: we lose those two edges, the corner where they meet, and the triangle. V goes down by 1, E by 2 and F by 1, so V − E + F changes by −1 + 2 − 1 = 0.';
		}
		return 'One triangle is left: 3 − 3 + 1 = 1. Every step kept V − E + F the same, so the flat network had V − E + F = 1 all along, and the cube, with its face put back, has V − E + F = 1 + 1 = 2.';
	});
	const poly = (ids: number[]) => ids.map((v) => pos[v].join(',')).join(' ');
</script>

<div class="wrap">
	<Svg viewBox="40 10 520 400" maxHeight={420} label="Cauchy's proof of Euler's formula carried out on a cube">
		{#if step >= 1}
			<text x="62" y="40" class="outside" transition:fade>outside = the missing face</text>
		{/if}
		{#each view.faces as f, i (f.join(','))}
			<polygon
				points={poly(f)}
				class="face"
				class:front={step === 0 && f === removedFace}
				transition:fade={{ duration: reduced ? 0 : 500 }}
			/>
			{#if step === 0 && i === view.faces.length - 1}
				{@const cx = f.reduce((s, v) => s + pos[v][0], 0) / 4}
				{@const cy = f.reduce((s, v) => s + pos[v][1], 0) / 4}
				<text x={cx} y={cy + 5} text-anchor="middle" class="tag">remove me</text>
			{/if}
		{/each}
		{#each view.tris as i (i)}
			<polygon points={poly(triangles[i])} class="tri" out:fade={{ duration: reduced ? 0 : 600 }} in:fade={{ duration: reduced ? 0 : 400 }} />
		{/each}
		{#if view.ghost}
			<polygon points={poly(triangles[view.ghost.tri])} class="ghost" />
			{#each view.ghost.edges as [a, b] (ek(a, b))}
				<line x1={pos[a][0]} y1={pos[a][1]} x2={pos[b][0]} y2={pos[b][1]} class="ghost-edge" />
			{/each}
			{#if view.ghost.vertex !== undefined}
				<circle cx={pos[view.ghost.vertex][0]} cy={pos[view.ghost.vertex][1]} r="10" class="ghost-v" />
			{/if}
		{/if}
		{#each view.edges as [a, b] (ek(a, b))}
			<line
				x1={pos[a][0]}
				y1={pos[a][1]}
				x2={pos[b][0]}
				y2={pos[b][1]}
				class="edge"
				class:diag={![...cubeEdges].some(([p, q]) => ek(p, q) === ek(a, b))}
				out:fade={{ duration: reduced ? 0 : 500 }}
			/>
		{/each}
		{#each view.verts as v (v)}
			<circle cx={pos[v][0]} cy={pos[v][1]} r="6" class="v" out:fade={{ duration: reduced ? 0 : 500 }} />
		{/each}
	</Svg>
	<div class="readout ui" aria-live="polite">
		<div class="eq">
			<TeX
				tex={`\\textcolor{#f2d08f}{V} - \\textcolor{#5fd6cf}{E} + \\textcolor{#a493ff}{F} = ${view.V} - ${view.E} + ${view.F} = ${view.V - view.E + view.F}`}
			/>
			{#if step >= 1}<span class="plus">(+1 for the missing face = {view.V - view.E + view.F + 1})</span>{/if}
		</div>
		<p class="msg">{message}</p>
	</div>
</div>
<div class="bar ui">
	<StepControls bind:step count={nSteps} {labels} interval={2300} />
</div>

<style>
	.wrap {
		padding: 0.6rem 0.8rem 0;
	}
	.face {
		fill: rgba(164, 147, 255, 0.1);
		stroke: none;
	}
	.face.front {
		fill: rgba(242, 141, 182, 0.24);
	}
	.tag {
		font-family: var(--font-ui);
		font-size: 13px !important;
		fill: var(--rose) !important;
		letter-spacing: 0.05em;
	}
	.outside {
		font-family: var(--font-ui);
		font-size: 12px !important;
		fill: var(--rose) !important;
		letter-spacing: 0.06em;
	}
	.tri {
		fill: rgba(164, 147, 255, 0.13);
		stroke: rgba(164, 147, 255, 0.25);
		stroke-width: 1;
	}
	.ghost {
		fill: rgba(242, 141, 182, 0.1);
		stroke: var(--rose);
		stroke-width: 1.5;
		stroke-dasharray: 5 5;
	}
	.ghost-edge {
		stroke: var(--rose);
		stroke-width: 2.5;
		stroke-dasharray: 6 5;
	}
	.ghost-v {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2;
		stroke-dasharray: 4 3;
	}
	.edge {
		stroke: #5fd6cf;
		stroke-opacity: 0.85;
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.edge.diag {
		stroke-opacity: 0.6;
		stroke-dasharray: 2 0;
	}
	.v {
		fill: #f2d08f;
		stroke: #060912;
		stroke-width: 1.3;
	}
	.readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0 1.2rem 0.8rem;
		text-align: center;
	}
	.eq {
		font-size: 1.12rem;
		color: var(--ink-bright);
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.2rem 0.8rem;
	}
	.plus {
		font-size: 0.8rem;
		color: var(--rose);
	}
	.msg {
		font-size: 0.84rem;
		color: var(--ink-dim);
		max-width: 40rem;
		margin: 0 !important;
		min-height: 4.2em;
		line-height: 1.5;
	}
	.bar {
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
