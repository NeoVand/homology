<script lang="ts">
	// A simplicial map from a hexagon (a circle with 6 edges) to the hollow triangle
	// (a circle with 3 edges). The reader relabels vertices; the induced chain map
	// and its effect on H₁ (multiplication by the winding number) update live.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { windingOfLabels } from './maps';

	type Pt = [number, number];
	const presets: { name: string; labels: number[] }[] = [
		{ name: 'Wrap twice', labels: [0, 1, 2, 0, 1, 2] },
		{ name: 'Wrap once', labels: [0, 0, 1, 1, 2, 2] },
		{ name: 'There and back', labels: [0, 1, 2, 2, 1, 0] },
		{ name: 'Backwards twice', labels: [0, 2, 1, 0, 2, 1] },
		{ name: 'Collapse', labels: [0, 0, 0, 1, 1, 1] }
	];
	let labels = $state<number[]>([0, 1, 2, 0, 1, 2]);
	let animate = $state(true);
	let hoverEdge = $state<number | null>(null);

	const vcol = ['#74a9ff', '#a493ff', '#5fd6cf'];
	const vname = ['0', '1', '2'];

	// hexagon: vertex i at angle 240° + 60° i (counterclockwise on screen)
	const HX: Pt = [170, 160];
	const HR = 112;
	const hexPos: Pt[] = Array.from({ length: 6 }, (_, i) => {
		const t = ((240 + 60 * i) * Math.PI) / 180;
		return [HX[0] + HR * Math.cos(t), HX[1] - HR * Math.sin(t)];
	});
	// triangle: vertex j at 210°, 330°, 90°
	const TX: Pt = [170, 168];
	const TR = 118;
	const triPos: Pt[] = [210, 330, 90].map((d) => {
		const t = (d * Math.PI) / 180;
		return [TX[0] + TR * Math.cos(t), TX[1] - TR * Math.sin(t)] as Pt;
	});

	// triangle edges in the engine's order: [0,1], [0,2], [1,2]
	const triEdges: [number, number][] = [
		[0, 1],
		[0, 2],
		[1, 2]
	];
	// the loop z' = [01] + [12] − [02] walks 0 → 1 → 2 → 0
	const zPrime = [1, -1, 1];

	/** image of hexagon edge i (from vertex i to i+1, along the walk) */
	function edgeImage(i: number): { tri: number; sign: 1 | -1 } | null {
		const a = labels[i];
		const b = labels[(i + 1) % 6];
		if (a === b) return null;
		const lo = Math.min(a, b);
		const hi = Math.max(a, b);
		const tri = triEdges.findIndex(([p, q]) => p === lo && q === hi);
		return { tri, sign: a < b ? 1 : -1 };
	}
	const images = $derived(Array.from({ length: 6 }, (_, i) => edgeImage(i)));
	const w = $derived(windingOfLabels(labels));
	/** step direction of edge i: +1 forward (0→1→2→0), −1 backward, 0 collapsed */
	const steps = $derived(
		Array.from({ length: 6 }, (_, i) => {
			const d = (((labels[(i + 1) % 6] - labels[i]) % 3) + 3) % 3;
			return d === 1 ? 1 : d === 2 ? -1 : 0;
		})
	);

	/** how many hexagon edges run along each triangle edge with / against the loop z′ */
	const traffic = $derived(
		triEdges.map((_, r) => {
			let fwd = 0;
			let bwd = 0;
			images.forEach((im, i) => {
				if (!im || im.tri !== r) return;
				if (steps[i] > 0) fwd++;
				else bwd++;
			});
			return { fwd, bwd };
		})
	);
	function trafficTeX(x: { fwd: number; bwd: number }): string {
		if (x.fwd && x.bwd) return `+${x.fwd}\,-${x.bwd}`;
		if (x.fwd) return `+${x.fwd}`;
		if (x.bwd) return `-${x.bwd}`;
		return '0';
	}

	// the chain-map matrix: rows = triangle edges, columns = hexagon edges along the walk
	// (hexagon edge i is the oriented edge [v_i, v_{i+1}], except the last, which is −[v_0, v_5])
	const matrix = $derived(
		triEdges.map((_, r) =>
			Array.from({ length: 6 }, (_, i) => {
				const im = images[i];
				if (!im || im.tri !== r) return 0;
				// column basis: [v_i v_{i+1}] for i < 5, and [v_0 v_5] for i = 5 (opposite to the walk)
				return i === 5 ? -im.sign : im.sign;
			})
		)
	);
	const colLabels = ['[v_0v_1]', '[v_1v_2]', '[v_2v_3]', '[v_3v_4]', '[v_4v_5]', '[v_0v_5]'];
	const rowLabels = ['[01]', '[02]', '[12]'];

	function cycle(i: number) {
		labels = labels.map((l, j) => (j === i ? (l + 1) % 3 : l));
	}

	// a bead running once around the hexagon, and its image on the triangle
	let t = $state(0.07);
	let reduced = $state(false);
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) animate = false;
		let raf = 0;
		let last = performance.now();
		const loop = (now: number) => {
			const dt = Math.min(0.1, (now - last) / 1000);
			last = now;
			if (animate) t = (t + dt / 9) % 1;
			raf = requestAnimationFrame(loop);
		};
		raf = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(raf);
	});
	const lerp = (a: Pt, b: Pt, s: number): Pt => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
	const ease = (s: number) => s * s * (3 - 2 * s);
	const bead = $derived.by(() => {
		const x = t * 6;
		const i = Math.min(5, Math.floor(x));
		const s = ease(x - i);
		const dom = lerp(hexPos[i], hexPos[(i + 1) % 6], s);
		const img = lerp(triPos[labels[i]], triPos[labels[(i + 1) % 6]], s);
		return { dom, img, i };
	});
	/** how far round the triangle the image bead has travelled so far (in turns) */
	const turns = $derived.by(() => {
		const x = t * 6;
		const i = Math.min(5, Math.floor(x));
		let acc = 0;
		for (let k = 0; k < i; k++) acc += steps[k];
		acc += steps[i] * ease(x - i);
		return acc / 3;
	});

	function arrowPath(a: Pt, b: Pt, at = 0.55, size = 7): string {
		const m = lerp(a, b, at);
		const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const ux = (b[0] - a[0]) / len;
		const uy = (b[1] - a[1]) / len;
		return `M ${m[0] - ux * size - uy * size * 0.8} ${m[1] - uy * size + ux * size * 0.8} L ${m[0] + ux * size * 0.6} ${m[1] + uy * size * 0.6} L ${m[0] - ux * size + uy * size * 0.8} ${m[1] - uy * size - ux * size * 0.8}`;
	}
	function edgeLabelPos(a: Pt, b: Pt, c: Pt, off: number): Pt {
		// push the midpoint of ab away from the centre c
		const m = lerp(a, b, 0.5);
		const dx = m[0] - c[0];
		const dy = m[1] - c[1];
		const L = Math.hypot(dx, dy) || 1;
		return [m[0] + (dx / L) * off, m[1] + (dy / L) * off];
	}
</script>

<div class="hexmap">
	<div class="panes">
		<div class="pane">
			<div class="ptitle ui">The hexagon <TeX tex={'K'} /> · click a vertex to move its image</div>
			<Svg viewBox="0 0 340 320" maxHeight={330} label="A hexagon whose vertices are labelled by the vertex of the triangle they map to">
				<!-- edges -->
				{#each hexPos as p, i (i)}
					{@const q = hexPos[(i + 1) % 6]}
					{@const st = steps[i]}
					{@const hot = hoverEdge === i}
					<g
						class="hedge"
						role="presentation"
						onpointerenter={() => (hoverEdge = i)}
						onpointerleave={() => (hoverEdge = null)}
					>
						{#if st !== 0}
							<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="halo" style="stroke:{st > 0 ? 'var(--gold-bright)' : 'var(--rose)'}" />
						{/if}
						<line
							x1={p[0]}
							y1={p[1]}
							x2={q[0]}
							y2={q[1]}
							stroke={st === 0 ? 'rgba(200,192,170,0.4)' : st > 0 ? 'var(--gold-bright)' : 'var(--rose)'}
							stroke-width={hot ? 5 : st === 0 ? 2 : 3.4}
							stroke-dasharray={st === 0 ? '5 6' : undefined}
							stroke-linecap="round"
						/>
						{#if st !== 0}
							<path d={arrowPath(p, q)} fill="none" stroke={st > 0 ? 'var(--gold-bright)' : 'var(--rose)'} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
						{:else}
							{@const lp = edgeLabelPos(p, q, HX, 16)}
							<text x={lp[0]} y={lp[1] + 5} text-anchor="middle" class="zero">↦ 0</text>
						{/if}
						<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="transparent" stroke-width="18" />
					</g>
				{/each}
				<!-- the bead -->
				<circle cx={bead.dom[0]} cy={bead.dom[1]} r="9" fill="var(--gold-bright)" opacity="0.25" filter="url(#glow)" />
				<circle cx={bead.dom[0]} cy={bead.dom[1]} r="4.5" fill="#fff6dc" />
				<!-- vertices -->
				{#each hexPos as p, i (i)}
					{@const lp = p}
					{@const out = [HX[0] + (p[0] - HX[0]) * 1.27, HX[1] + (p[1] - HX[1]) * 1.27]}
					<g
						class="hv"
						role="button"
						tabindex="0"
						aria-label="vertex v{i}, mapped to {labels[i]}; press to change"
						onclick={() => cycle(i)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), cycle(i))}
					>
						<circle cx={lp[0]} cy={lp[1]} r="21" fill="transparent" />
						<circle cx={lp[0]} cy={lp[1]} r="15" class="vring" style="fill:{vcol[labels[i]]}" />
						<text x={lp[0]} y={lp[1] + 5.5} text-anchor="middle" class="vlab">{vname[labels[i]]}</text>
					</g>
					<SvgTeX x={out[0]} y={out[1]} tex={`v_{${i}}`} size={14} color="var(--ink-dim)" w={40} h={24} />
				{/each}
				<SvgTeX x={HX[0]} y={HX[1]} tex={'z'} size={22} color="var(--gold-bright)" w={40} h={30} />
			</Svg>
		</div>
		<div class="arrow ui" aria-hidden="true">
			<span>f</span>
			<svg class="h" viewBox="0 0 60 20" width="60" height="20"><path d="M2 10 H54 M46 4 L55 10 L46 16" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
			<svg class="v" viewBox="0 0 20 44" width="20" height="44"><path d="M10 2 V38 M4 30 L10 39 L16 30" fill="none" stroke="var(--gold)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
		</div>
		<div class="pane">
			<div class="ptitle ui">The hollow triangle <TeX tex={'L'} /> · net count on each edge</div>
			<Svg viewBox="0 0 340 320" maxHeight={330} label="The hollow triangle with the net number of times its edges are covered">
				{#each triEdges as [a, b], r (r)}
					{@const p = triPos[a]}
					{@const q = triPos[b]}
					{@const c = traffic[r].fwd - traffic[r].bwd}
					{@const used = traffic[r].fwd + traffic[r].bwd}
					{@const hot = hoverEdge !== null && images[hoverEdge]?.tri === r}
					{@const from = zPrime[r] > 0 ? p : q}
					{@const to = zPrime[r] > 0 ? q : p}
					{@const lp = edgeLabelPos(p, q, TX, 24)}
					{#if used > 0}
						<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="halo" style="stroke:{c === 0 ? 'var(--ink-faint)' : 'var(--gold-bright)'}; stroke-width:{8 + 4 * used}" />
					{/if}
					<line
						x1={p[0]}
						y1={p[1]}
						x2={q[0]}
						y2={q[1]}
						stroke={used === 0 ? 'rgba(200,192,170,0.45)' : c === 0 ? 'rgba(235,229,213,0.8)' : c > 0 ? 'var(--gold-bright)' : 'var(--rose)'}
						stroke-width={(used === 0 ? 2 : 2.4 + 1.3 * used) + (hot ? 2 : 0)}
						stroke-linecap="round"
					/>
					<!-- orientation of the loop z′ : 0 → 1 → 2 → 0 -->
					<path d={arrowPath(from, to, 0.5, 7)} fill="none" stroke="rgba(235,229,213,0.75)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
					<SvgTeX x={lp[0]} y={lp[1]} tex={trafficTeX(traffic[r])} size={16} color={c === 0 ? 'var(--ink-dim)' : c > 0 ? 'var(--gold-bright)' : 'var(--rose)'} w={70} h={28} />
				{/each}
				<circle cx={bead.img[0]} cy={bead.img[1]} r="10" fill="var(--gold-bright)" opacity="0.28" filter="url(#glow)" />
				<circle cx={bead.img[0]} cy={bead.img[1]} r="5" fill="#fff6dc" />
				{#each triPos as p, j (j)}
					<circle cx={p[0]} cy={p[1]} r="15" class="vring" style="fill:{vcol[j]}" />
					<text x={p[0]} y={p[1] + 5.5} text-anchor="middle" class="vlab">{vname[j]}</text>
				{/each}
				<SvgTeX x={TX[0]} y={TX[1] + 16} tex={`f_\\#(z) = ${w === 0 ? '0' : w === 1 ? '' : w === -1 ? '-' : w}${w === 0 ? '' : "z'"}`} size={16} color="var(--gold-bright)" w={120} h={28} />
				<text x={TX[0]} y={302} text-anchor="middle" class="turns ui">image bead so far: {turns.toFixed(2)} turns</text>
			</Svg>
		</div>
	</div>

	<div class="readout">
		<div class="big">
			<TeX tex={`f_*\\colon H_1(K)\\cong\\mathbb Z \\;\\longrightarrow\\; H_1(L)\\cong\\mathbb Z,\\qquad 1 \\longmapsto ${w}`} />
		</div>
		<p class="small">
			{#if w === 0}
				The image cycle is <b>zero</b>: going forwards and backwards cancels, so the hexagon's loop is sent to the trivial class.
			{:else}
				Going once around the hexagon goes <b>{Math.abs(w)}</b> time{Math.abs(w) === 1 ? '' : 's'} around the triangle{w < 0 ? ', backwards' : ''}: on homology,
				<TeX tex={'f_*'} /> is multiplication by <b>{w}</b>.
			{/if}
		</p>
		<div class="mx">
			<MatrixView
				M={matrix}
				{rowLabels}
				{colLabels}
				caption={'f_\\# ='}
				highlightCols={hoverEdge !== null ? [hoverEdge] : []}
				highlightRows={hoverEdge !== null && images[hoverEdge] ? [images[hoverEdge]!.tri] : []}
				onhover={(_, j) => (hoverEdge = j)}
			/>
		</div>
	</div>

	<Controls>
		{#each presets as p (p.name)}
			<Button variant="ghost" active={p.labels.join() === labels.join()} onclick={() => (labels = p.labels.slice())}>{p.name}</Button>
		{/each}
		<Toggle bind:checked={animate} label="Run the bead" />
	</Controls>
</div>

<style>
	.panes {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0 0.5rem;
		padding: 0.6rem 0.6rem 0;
	}
	.pane {
		flex: 1 1 280px;
		max-width: 360px;
		min-width: 0;
	}
	.ptitle {
		font-size: 0.72rem;
		letter-spacing: 0.05em;
		color: var(--ink-faint);
		text-align: center;
		margin-bottom: -0.2rem;
	}
	.arrow {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--gold-bright);
		font-style: italic;
		font-family: var(--font-body);
		font-size: 1.1rem;
	}
	.arrow .v {
		display: none;
	}
	@media (max-width: 700px) {
		.arrow {
			flex-direction: row;
			gap: 0.6rem;
			flex-basis: 100%;
			justify-content: center;
			margin: 0.2rem 0 0.6rem;
		}
		.arrow .h {
			display: none;
		}
		.arrow .v {
			display: block;
		}
	}
	.halo {
		stroke-width: 10;
		opacity: 0.18;
		stroke-linecap: round;
		filter: blur(2px);
	}
	.hv {
		cursor: pointer;
	}
	.hv:hover .vring,
	.hv:focus-visible .vring {
		stroke: #fff;
		stroke-width: 2.5;
	}
	.vring {
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 2;
		transition: fill 0.3s var(--ease);
	}
	.vlab {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 14px;
		fill: #0b1020 !important;
		pointer-events: none;
	}
	.zero {
		font-family: var(--font-ui);
		font-size: 12px;
		fill: var(--ink-faint) !important;
	}
	.turns {
		font-size: 11px;
		fill: var(--ink-faint) !important;
		letter-spacing: 0.04em;
	}
	.readout {
		padding: 0.2rem 1.2rem 0.8rem;
		text-align: center;
	}
	.big {
		font-size: 1.05rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.small {
		font-size: 0.92rem;
		color: var(--ink-dim);
		margin: 0.4rem auto 0.6rem;
		max-width: 36rem;
	}
	.mx {
		display: flex;
		justify-content: center;
	}
	/* the book's table styles (uppercase headers) would mangle TeX labels */
	.mx :global(th) {
		text-transform: none;
		letter-spacing: 0;
		border-bottom: 0;
		font-family: inherit;
	}
	.mx :global(th .katex) {
		font-size: 1.12em;
	}
</style>
