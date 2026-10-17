<script lang="ts">
	// Reidemeister's three moves, each as a little film: a twist comes undone
	// (I), two strands slide apart (II), a strand slides across a crossing
	// (III). Every move happens inside a small disk; the rest of the diagram
	// does not change. The crossings are found and drawn afresh in every frame.
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import { drawStrands, type Strand } from '$lib/knots/strands';
	import type { V2 } from '$lib/knots/diagram';

	type Move = 'I' | 'II' | 'III';
	let move = $state<Move>('I');
	let s = $state(0);

	const N = 220;
	const ease = (x: number) => x * x * (3 - 2 * x);
	function strandsFor(m: Move, s: number): Strand[] {
		const e = ease(s);
		if (m === 'I') {
			// a curtate/prolate cycloid: a loop while a > 1, smooth once a < 1
			const a = 2.2 - 1.6 * e;
			const pts: V2[] = [];
			for (let k = 0; k < N; k++) {
				const t = -Math.PI * 1.55 + (3.1 * Math.PI * k) / (N - 1);
				pts.push([0.42 * (t - a * Math.sin(t)), 0.42 * a * (1 - Math.cos(t)) - 0.55]);
			}
			return [{ pts, z: (k) => k }];
		}
		if (m === 'II') {
			const b = 2.0 * (1 - e) - 0.25;
			const A: V2[] = [];
			const B: V2[] = [];
			for (let k = 0; k < N; k++) {
				const y = -1.45 + (2.9 * k) / (N - 1);
				A.push([-0.55 + 0.12 * Math.sin(y * 1.3), y]);
				B.push([0.55 - b * Math.exp(-(y * y) / 0.55), y]);
			}
			return [
				{ pts: A, z: () => 0 },
				{ pts: B, z: () => 1 }
			];
		}
		// III: a strand on top slides across the crossing of two others
		const c = -0.95 + 1.9 * e;
		const A: V2[] = [];
		const B: V2[] = [];
		const C: V2[] = [];
		for (let k = 0; k < N; k++) {
			const u = -1.6 + (3.2 * k) / (N - 1);
			A.push([u, 0.72 * u]);
			B.push([u, -0.72 * u]);
			C.push([u, c + 0.08 * Math.sin(u * 1.7)]);
		}
		return [
			{ pts: A, z: () => 1 },
			{ pts: B, z: () => 0 },
			{ pts: C, z: () => 2 }
		];
	}

	const W = 560;
	const H = 300;
	const k = 92;
	const P = (p: V2) => `${(W / 2 + p[0] * k).toFixed(1)} ${(H / 2 - p[1] * k).toFixed(1)}`;
	const drawn = $derived(drawStrands(strandsFor(move, s), 0.14));
	const colours = ['#f4d79c', '#5fd6cf', '#a493ff'];
	const count = $derived(drawn.crossings.length);
	const before = { I: 1, II: 2, III: 3 };
	const after = { I: 0, II: 0, III: 3 };
	const says: Record<Move, string> = {
		I: 'Move I: a twist in a single strand comes undone. One crossing disappears.',
		II: 'Move II: one strand lying across another slides off it. Two crossings disappear together.',
		III: 'Move III: a strand passing over a crossing slides to its other side. The three crossings stay; their order changes.'
	};
	$effect(() => {
		void move;
		s = 0;
	});
</script>

<div class="rm">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="Reidemeister move {move}: {says[move]}">
		<circle cx={W / 2} cy={H / 2} r="134" class="disk" />
		{#each drawn.strands as st, i (i)}
			{#each st.pieces as piece, j (j)}
				<path d={'M ' + piece.map(P).join(' L ')} class="halo" />
				<path d={'M ' + piece.map(P).join(' L ')} class="strand" style="stroke:{colours[i]}" />
			{/each}
		{/each}
	</svg>
	<p class="say ui" aria-live="polite">{says[move]} <span class="n">{count} crossing{count === 1 ? '' : 's'} now ({before[move]} before, {after[move]} after).</span></p>
	<div class="ctl ui">
		<Segmented
			bind:value={move}
			label="Which move"
			options={[
				{ value: 'I', label: 'Move I' },
				{ value: 'II', label: 'Move II' },
				{ value: 'III', label: 'Move III' }
			]}
		/>
	</div>
	<div class="tl"><Timeline bind:value={s} duration={3.5} from="before" to="after" loop label="Play the move" /></div>
</div>

<style>
	.rm {
		display: grid;
	}
	svg {
		width: 100%;
		max-height: 320px;
		display: block;
	}
	.disk {
		fill: rgba(116, 169, 255, 0.04);
		stroke: rgba(116, 169, 255, 0.22);
		stroke-dasharray: 4 6;
	}
	.halo {
		fill: none;
		stroke: #070b15;
		stroke-width: 13;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.strand {
		fill: none;
		stroke-width: 5.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.say {
		margin: 0.2rem 1.1rem 0.4rem;
		min-height: 2.8em;
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-wrap: balance;
	}
	.n {
		color: var(--ink-faint);
		white-space: nowrap;
	}
	.ctl {
		display: flex;
		justify-content: center;
	}
	.tl {
		padding: 0.3rem 1rem 0.5rem;
	}
</style>
