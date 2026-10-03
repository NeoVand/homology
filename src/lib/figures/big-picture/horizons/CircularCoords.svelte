<script lang="ts">
	// Figure: circular coordinates from cohomology. A noisy circle of points;
	// at a scale where the Rips complex has b₁ = 1, cohomology hands us an
	// integer cocycle α (a "fence"), least squares smooths it to the harmonic
	// cocycle ᾱ = α + δf, and θ = f mod 1 is an angle for every data point.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { ripsComplex, betti, generatingCocycle, circularCoordinate, loopData, goodScale } from './circular';

	let seed = $state(17);
	const points = $derived(loopData(seed));
	let r = $state(goodScale(loopData(17)) ?? 0.25);
	let root = $state(0);
	let showFence = $state(true);

	function newData() {
		seed += 1;
		r = goodScale(points) ?? r;
	}
	const K = $derived(ripsComplex(points, r));
	const B = $derived(betti(K));
	const ok = $derived(B[0] === 1 && B[1] === 1);
	const result = $derived.by(() => {
		if (!ok) return null;
		const alpha = generatingCocycle(K, root % points.length);
		if (!alpha) return null;
		const c = circularCoordinate(K, alpha);
		return { alpha, ...c };
	});

	const S = 120;
	const C = 170;
	const X = (x: number) => C + x * S;
	const Y = (y: number) => C - y * S;
	const hue = (t: number) => `hsl(${Math.round(360 * t)}, 78%, 66%)`;
	const trueAngle = (p: [number, number]) => (Math.atan2(p[1], p[0]) / (2 * Math.PI) + 1) % 1;
	const fenceEdges = $derived(result ? K.simplices[1].filter((_, i) => result.alpha[i] !== 0) : []);
</script>

<div class="cc">
	<div class="cols">
		<div>
			<Svg viewBox="10 10 320 320" maxHeight={360} label="A noisy circle of data points with its Rips complex; points are coloured by the circular coordinate found from cohomology">
				<!-- the Rips complex -->
				{#each K.simplices[2] ?? [] as t, i (i)}
					<polygon points={t.map((v) => `${X(points[v][0])},${Y(points[v][1])}`).join(' ')} class="tri" />
				{/each}
				{#each K.simplices[1] ?? [] as e, i (i)}
					<line x1={X(points[e[0]][0])} y1={Y(points[e[0]][1])} x2={X(points[e[1]][0])} y2={Y(points[e[1]][1])} class="edge" />
				{/each}
				{#if showFence && result}
					{#each fenceEdges as e, i (i)}
						<line x1={X(points[e[0]][0])} y1={Y(points[e[0]][1])} x2={X(points[e[1]][0])} y2={Y(points[e[1]][1])} class="fence" />
					{/each}
				{/if}
				{#each points as p, i (i)}
					<circle cx={X(p[0])} cy={Y(p[1])} r="5.5" class="pt" style={result ? `fill:${hue(result.theta[i])}` : ''} />
				{/each}
			</Svg>
		</div>
		<div class="plot">
			<Svg viewBox="0 0 300 300" maxHeight={330} label="The angle found from cohomology plotted against each point's true angle">
				<rect x="40" y="20" width="240" height="240" class="frame" />
				{#each [0.25, 0.5, 0.75] as g (g)}
					<line x1={40 + 240 * g} y1="20" x2={40 + 240 * g} y2="260" class="grid" />
					<line x1="40" y1={260 - 240 * g} x2="280" y2={260 - 240 * g} class="grid" />
				{/each}
				{#if result}
					{#each points as p, i (i)}
						<circle cx={40 + 240 * trueAngle(p)} cy={260 - 240 * result.theta[i]} r="4" style="fill:{hue(result.theta[i])}" class="dot" />
					{/each}
				{:else}
					<text x="160" y="140" text-anchor="middle" class="t-ui">no circular coordinate</text>
					<text x="160" y="158" text-anchor="middle" class="t-ui">at this scale</text>
				{/if}
				<SvgTeX x={160} y={284} tex={'\\text{true angle of the point}'} size={12} color="var(--ink-faint)" w={200} h={20} />
				<SvgTeX x={14} y={140} tex={'\\theta'} size={15} color="var(--ink-dim)" w={20} h={20} />
				<SvgTeX x={40} y={272} tex="0" size={11} color="var(--ink-faint)" w={16} h={14} />
				<SvgTeX x={280} y={272} tex="1" size={11} color="var(--ink-faint)" w={16} h={14} />
				<SvgTeX x={30} y={20} tex="1" size={11} color="var(--ink-faint)" w={16} h={14} />
			</Svg>
		</div>
	</div>
	<div class="readout ui" aria-live="polite">
		<span>scale <TeX tex={`r = ${r.toFixed(2)}`} />: <TeX tex={`b_0 = ${B[0]},\\; b_1 = ${B[1]}`} /></span>
		{#if result}
			<span class="ok">
				One loop, so <TeX tex={'H^1 \\cong \\Z'} />. The rose “fence” is the integer cocycle <TeX tex={'\\alpha'} /> ({fenceEdges.length} edges); smoothing it gives every point an angle <span class="nw"><TeX tex={'\\theta\\in[0,1)'} /></span>, shown as colour. The plot on the right is a straight band that wraps once: <TeX tex={'\\theta'} /> recovers the position around the circle.
			</span>
		{:else if B[0] > 1}
			<span class="warn">The complex is not yet connected — increase the scale.</span>
		{:else}
			<span class="warn">At this scale <TeX tex={`b_1 = ${B[1]}`} />, so there is no single loop to measure — try another scale.</span>
		{/if}
	</div>
	<Controls>
		<Slider bind:value={r} min={0.04} max={0.42} step={0.01} label="Scale r (ball radius)" format={(v) => v.toFixed(2)} />
		<Toggle bind:checked={showFence} label="Show the cocycle α" />
		<Button variant="ghost" onclick={() => (root += 7)}>Pick another cocycle</Button>
		<Button variant="subtle" onclick={newData}>New data</Button>
	</Controls>
</div>

<style>
	.cc {
		padding-top: 0.8rem;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 0.6rem 1rem;
		padding: 0 1rem;
		align-items: center;
	}
	@media (max-width: 640px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.tri {
		fill: rgba(116, 169, 255, 0.05);
	}
	.edge {
		stroke: rgba(191, 228, 255, 0.16);
		stroke-width: 1;
	}
	.fence {
		stroke: #f28db6;
		stroke-width: 3;
		stroke-linecap: round;
	}
	.pt {
		fill: rgba(235, 229, 213, 0.75);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.2;
	}
	.frame {
		fill: rgba(5, 9, 18, 0.45);
		stroke: rgba(216, 178, 110, 0.25);
	}
	.grid {
		stroke: rgba(191, 228, 255, 0.07);
	}
	.dot {
		stroke: rgba(6, 9, 18, 0.8);
		stroke-width: 1;
	}
	.readout {
		display: grid;
		gap: 0.25rem;
		justify-items: center;
		text-align: center;
		font-size: 0.8rem;
		color: var(--ink-dim);
		padding: 0.4rem 1.2rem 0.7rem;
	}
	.ok {
		color: var(--ink);
		max-width: 46rem;
	}
	.warn {
		color: var(--amber);
	}
	.nw {
		white-space: nowrap;
	}
</style>
