<script lang="ts">
	// Reidemeister's three moves side by side, played together by one control:
	// a kink comes undone (I), two strands slide apart (II), a strand slides
	// across a crossing (III). Each move happens inside a small disk; outside it
	// the strands fade out, standing for the rest of the diagram, and their ends
	// never move. The crossings are found and drawn afresh in every frame.
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import { drawStrands, type Strand } from '$lib/knots/strands';
	import type { V2 } from '$lib/knots/diagram';

	const uid = $props.id();
	let s = $state(0);

	const N = 240;
	const smooth = (x: number) => {
		const t = Math.min(1, Math.max(0, x));
		return t * t * (3 - 2 * t);
	};
	// the move itself runs in the middle of the timeline, so both ends hold still for a moment
	const phase = $derived(smooth((s - 0.08) / 0.84));

	/**
	 * Move I, on the curve y² = x²(x + a) turned upright: for a > 0 it has a little loop and
	 * crosses itself once; at a = 0 the loop has pinched to a cusp; for a < 0 it is smooth, and
	 * then it straightens out. Its bulge dies away from the middle and the vertical extent is
	 * normalised, so the ends of the strand never move.
	 */
	function kink(e: number): Strand[] {
		const T = 2.4;
		const sig = 1.2;
		const a = 1.3 * (1 - 1.7 * e);
		const c = 0.55 * (1 - smooth((e - 0.55) / 0.45));
		const beta = 1.2;
		const norm = (T ** 3 - a * T) / (1 + beta * T * T);
		const tail = (T * T - a) * Math.exp(-(T * T) / (sig * sig));
		const pts: V2[] = [];
		for (let i = 0; i < N; i++) {
			const t = -T + (2 * T * i) / (N - 1);
			const y = (1.8 * ((t ** 3 - a * t) / (1 + beta * t * t))) / norm;
			const x = c * ((t * t - a) * Math.exp(-(t * t) / (sig * sig)) - tail);
			pts.push([x + 0.32, y]);
		}
		return [{ pts, z: (i) => i }];
	}

	/** Move II. Two vertical strands; the right one reaches over the left, two crossings, and slides back. */
	function slide(b: number): Strand[] {
		const A: V2[] = [];
		const B: V2[] = [];
		for (let i = 0; i < N; i++) {
			const y = -1.8 + (3.6 * i) / (N - 1);
			A.push([-0.42, y]);
			B.push([0.42 - b * Math.exp(-(y * y) / 0.42), y]);
		}
		return [
			{ pts: A, z: () => 0 },
			{ pts: B, z: () => 1 }
		];
	}

	/** Move III. Two strands cross; a third, above both, slides from one side of their crossing to the other. */
	function across(h: number): Strand[] {
		const A: V2[] = [];
		const B: V2[] = [];
		const C: V2[] = [];
		for (let i = 0; i < N; i++) {
			const u = -1.8 + (3.6 * i) / (N - 1);
			A.push([u, 0.78 * u]);
			B.push([u, -0.78 * u]);
			C.push([u, h * Math.exp(-(u * u) / 0.7)]);
		}
		return [
			{ pts: A, z: () => 1 },
			{ pts: B, z: () => 0 },
			{ pts: C, z: () => 2 }
		];
	}

	const moves = [
		{ n: 'I', what: 'a kink comes undone', before: 1, after: 0, make: (e: number) => kink(e) },
		{ n: 'II', what: 'two strands slide apart', before: 2, after: 0, make: (e: number) => slide(1.55 * (1 - e)) },
		{ n: 'III', what: 'a strand slides across a crossing', before: 3, after: 3, make: (e: number) => across(-0.78 + 1.56 * e) }
	];
	const colours = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)'];
	const drawn = $derived(moves.map((m) => drawStrands(m.make(phase), 0.15)));

	const P = (p: V2) => `${p[0].toFixed(3)} ${(-p[1]).toFixed(3)}`;
	const path = (piece: V2[]) => 'M ' + piece.map(P).join(' L ');
	const words = ['no crossings', 'one crossing', 'two crossings', 'three crossings'];
</script>

<div class="rm">
	<div class="panels">
		{#each moves as m, i (m.n)}
			{@const d = drawn[i]}
			<div class="panel">
				<p class="head ui"><span class="num">{m.n}</span><span class="what">{m.what}</span></p>
				<svg viewBox="-1.65 -1.65 3.3 3.3" role="img" aria-label="Reidemeister move {m.n}: {m.what}. {words[d.crossings.length]} now; {m.before} before the move, {m.after} after.">
					<defs>
						<radialGradient id="{uid}-fade">
							<stop offset="0.7" stop-color="#fff" />
							<stop offset="1" stop-color="#000" />
						</radialGradient>
						<mask id="{uid}-mask" maskUnits="userSpaceOnUse" x="-1.65" y="-1.65" width="3.3" height="3.3">
							<circle r="1.62" fill="url(#{uid}-fade)" />
						</mask>
					</defs>
					<circle r="1.2" class="disk" />
					<g mask="url(#{uid}-mask)">
						{#each d.strands as st, j (j)}
							{#each st.pieces as piece, k (k)}
								<path d={path(piece)} class="halo" />
								<path d={path(piece)} class="strand" style="stroke:{colours[j]}" />
							{/each}
						{/each}
					</g>
					{#each d.crossings as c, k (k)}
						<circle cx={c.at[0]} cy={-c.at[1]} r="0.2" class="ring" />
					{/each}
				</svg>
				<p class="count ui" aria-hidden="true">
					<span class="dots">
						{#each Array.from({ length: Math.max(m.before, m.after) }) as _, k (k)}<i class:on={k < d.crossings.length}></i>{/each}
					</span>
					<span class="w">{words[d.crossings.length]}</span>
				</p>
			</div>
		{/each}
	</div>
	<p class="say ui">
		Before and after each move the diagram is the same knot. Move I takes away one crossing, move II two at once, and move III keeps all three
		but carries the top strand across the crossing of the other two.
	</p>
	<div class="tl"><Timeline bind:value={s} duration={3.6} from="before" to="after" loop label="Play all three moves" /></div>
</div>

<style>
	.rm {
		display: grid;
	}
	.panels {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.4rem;
		padding: 0.6rem 0.8rem 0.2rem;
	}
	/* on a phone the three stay side by side, so they can still be watched together: numerals and dots only */
	@media (max-width: 560px) {
		.panels {
			gap: 0.25rem;
			padding: 0.5rem 0.5rem 0.1rem;
		}
		.what,
		.count .w {
			display: none;
		}
	}
	.panel {
		display: grid;
		justify-items: center;
		border-radius: 12px;
		background: radial-gradient(circle at 50% 50%, rgba(40, 56, 110, 0.22), rgba(5, 8, 18, 0) 70%);
	}
	.head {
		display: flex;
		align-items: baseline;
		gap: 0.45rem;
		margin: 0.2rem 0 0;
		font-size: 0.82rem;
		color: var(--ink-dim);
		text-align: center;
	}
	.num {
		font-family: var(--font-display, var(--font-body));
		font-weight: 600;
		color: var(--gold-bright);
		letter-spacing: 0.04em;
		font-size: 0.95rem;
	}
	svg {
		width: 100%;
		max-width: 15rem;
		aspect-ratio: 1;
		display: block;
	}
	.disk {
		fill: rgba(116, 169, 255, 0.04);
		stroke: rgba(116, 169, 255, 0.28);
		stroke-width: 0.012;
		stroke-dasharray: 0.045 0.06;
	}
	.halo {
		fill: none;
		stroke: #070b15;
		stroke-width: 0.17;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.strand {
		fill: none;
		stroke-width: 0.075;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.ring {
		fill: none;
		stroke: rgba(242, 141, 182, 0.75);
		stroke-width: 0.014;
	}
	.count {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 0.4rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	.dots {
		display: inline-flex;
		gap: 0.22rem;
	}
	.dots i {
		width: 0.45rem;
		height: 0.45rem;
		border-radius: 50%;
		border: 1px solid rgba(242, 141, 182, 0.6);
		transition: background 0.15s;
	}
	.dots i.on {
		background: var(--rose);
	}
	.say {
		margin: 0.1rem 1.1rem 0.3rem;
		text-align: center;
		font-size: 0.84rem;
		color: var(--ink-dim);
		text-wrap: balance;
	}
	.tl {
		padding: 0.3rem 1rem 0.5rem;
	}
</style>
