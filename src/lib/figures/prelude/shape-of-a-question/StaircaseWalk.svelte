<script lang="ts">
	// An impossible staircase as a loop of measurements. Every step says
	// "up by one", which is perfectly sensible locally; walking all the way
	// round brings you back to where you started, yet higher. No assignment of
	// heights to the landings can agree with every step: that global failure is
	// what cohomology measures.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	const N = 12; // steps around the loop
	let consistent = $state(false);
	let pos = $state(0); // which landing the walker is on (0..N-1)
	let climbed = $state(0); // total height gained by walking
	let timer: ReturnType<typeof setInterval> | undefined;
	let walking = $state(false);

	// step i goes from landing i to landing i+1
	const stepValue = (i: number) => (consistent ? (i < 9 ? 1 : -3) : 1);
	const loopSum = $derived(Array.from({ length: N }, (_, i) => stepValue(i)).reduce((a, b) => a + b, 0));

	function step() {
		climbed += stepValue(pos);
		pos = (pos + 1) % N;
	}
	function walkLoop() {
		if (walking) return;
		walking = true;
		let k = 0;
		timer = setInterval(() => {
			step();
			if (++k >= N) {
				clearInterval(timer);
				walking = false;
			}
		}, 260);
	}
	function reset() {
		clearInterval(timer);
		walking = false;
		pos = 0;
		climbed = 0;
	}
	$effect(() => {
		void consistent;
		reset();
	});
	$effect(() => () => clearInterval(timer));

	// geometry: landings placed around a square, with room for the step labels
	const S = 300;
	const C = 196;
	function landing(i: number): [number, number] {
		const side = Math.floor(i / 3);
		const k = (i % 3) / 3;
		const h = S / 2;
		if (side === 0) return [C - h + k * S, C - h];
		if (side === 1) return [C + h, C - h + k * S];
		if (side === 2) return [C + h - k * S, C + h];
		return [C - h, C + h - k * S];
	}
	const pts = Array.from({ length: N }, (_, i) => landing(i));
	const walker = $derived(pts[pos]);
	// brightness of each landing hints at the height you would expect it to have
	const expected = (i: number) => (consistent ? (i <= 9 ? i : 9 - 3 * (i - 9)) / 9 : i / (N - 1));
	const glow = (i: number) => 0.3 + 0.65 * expected(i);
</script>

<div class="stairs">
	<svg viewBox="0 0 580 392" role="img" aria-label="A square loop of twelve steps, each labelled with its height change, with a walker going round">
		<defs>
			<marker id="st-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto">
				<path d="M0,1 L9,5 L0,9 L2.5,5 Z" fill="currentColor" />
			</marker>
		</defs>
		{#each pts as p, i (i)}
			{@const q = pts[(i + 1) % N]}
			{@const v = stepValue(i)}
			<g class="step" class:down={v < 0} style="color:{v < 0 ? 'var(--teal)' : 'var(--rose)'}">
				<line x1={p[0]} y1={p[1]} x2={p[0] + (q[0] - p[0]) * 0.86} y2={p[1] + (q[1] - p[1]) * 0.86} marker-end="url(#st-arrow)" />
				<text x={(p[0] + q[0]) / 2 + (q[1] - p[1]) * 0.18} y={(p[1] + q[1]) / 2 - (q[0] - p[0]) * 0.18 + 5} text-anchor="middle"
					>{v > 0 ? '+' : '−'}{Math.abs(v)}</text
				>
			</g>
		{/each}
		{#each pts as p, i (i)}
			<circle cx={p[0]} cy={p[1]} r="9" class="landing" style="opacity:{glow(i)}" />
		{/each}
		<circle cx={pts[0][0]} cy={pts[0][1]} r="15" class="start" />
		<!-- inside the square, clear of the first step's label -->
		<text x={pts[0][0] + 20} y={pts[0][1] + 36} class="lbl">start</text>
		<circle cx={walker[0]} cy={walker[1]} r="10" class="walker" />

		<!-- altimeter -->
		<g transform="translate(430 46)">
			<rect x="0" y="0" width="36" height="300" rx="10" class="meter" />
			<rect
				x="4"
				y={296 - Math.max(0, Math.min(292, ((climbed + 12) / 36) * 292))}
				width="28"
				height={Math.max(0, Math.min(292, ((climbed + 12) / 36) * 292))}
				rx="7"
				class="fill"
				class:bad={!consistent && climbed > 0 && pos === 0}
			/>
			<line x1="-6" x2="42" y1={296 - (12 / 36) * 292} y2={296 - (12 / 36) * 292} class="zero" />
			<text x="50" y={300 - (12 / 36) * 292} class="lbl wide">start height</text>
			<text x="50" y={300 - (12 / 36) * 292} class="lbl narrow"
				><tspan x="50" dy="-10">start</tspan><tspan x="50" dy="22">height</tspan></text
			>
			<text x="50" y="22" class="big nums">{climbed > 0 ? '+' : ''}{climbed}</text>
			<text x="50" y="42" class="lbl wide">height gained</text>
			<text x="50" y="48" class="lbl narrow"><tspan x="50">height</tspan><tspan x="50" dy="22">gained</tspan></text>
		</g>
	</svg>
	<div class="status ui">
		{#if pos === 0 && climbed !== 0}
			<span class="bad">Back at the start — but {climbed} steps higher. No consistent heights exist.</span>
		{:else if pos === 0 && climbed === 0 && consistent}
			<span class="good">Every step is fine, and going round brings you back to the same height.</span>
		{:else}
			<span>Each step on its own makes perfect sense…</span>
		{/if}
		<span class="sum">sum around the loop: <TeX tex={`\\textstyle\\sum = ${loopSum}`} /></span>
	</div>
</div>
<Controls>
	<Button variant="gold" onclick={walkLoop} disabled={walking}>Walk once around</Button>
	<Button onclick={step} disabled={walking}>One step</Button>
	<Button variant="subtle" onclick={reset}>Reset</Button>
	<Toggle bind:checked={consistent} label="Make the staircase possible" />
</Controls>

<style>
	.stairs {
		padding: 0.4rem 1.25rem 0.2rem;
	}
	svg {
		display: block;
		width: 100%;
		max-width: 600px;
		height: auto;
		margin: 0 auto;
	}
	.step line {
		stroke: currentColor;
		stroke-width: 2.4;
	}
	.step text {
		fill: currentColor;
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 650;
	}
	.landing {
		fill: #f2d08f;
	}
	.start {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 1.5;
		stroke-dasharray: 3 3;
	}
	.walker {
		fill: #fff6df;
		filter: url(#glow-strong);
		transition:
			cx 0.24s var(--ease),
			cy 0.24s var(--ease);
	}
	.lbl {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 11px;
		letter-spacing: 0.06em;
	}
	.big {
		fill: var(--gold-bright);
		font-family: var(--font-ui);
		font-size: 22px;
		font-weight: 700;
	}
	.meter {
		fill: rgba(255, 255, 255, 0.04);
		stroke: var(--line);
	}
	.fill {
		fill: var(--gold);
		opacity: 0.85;
		transition:
			y 0.24s var(--ease),
			height 0.24s var(--ease);
	}
	.fill.bad {
		fill: var(--rose);
	}
	.zero {
		stroke: var(--ink-faint);
		stroke-dasharray: 4 3;
	}
	.lbl.narrow {
		display: none;
	}
	/* phones: the drawing shrinks to about half size, so its lettering grows */
	@container figure (max-width: 520px) {
		.stairs {
			padding: 0.4rem 0.4rem 0.2rem;
		}
		.step text {
			font-size: 26px;
		}
		.lbl {
			font-size: 21px;
			letter-spacing: 0.02em;
		}
		.lbl.wide {
			display: none;
		}
		.lbl.narrow {
			display: inline;
		}
		.big {
			font-size: 28px;
		}
	}
	.status {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.4rem 1rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		padding: 0.6rem 0.4rem 0.2rem;
	}
	.status .bad {
		color: var(--rose);
	}
	.status .good {
		color: var(--green);
	}
	.sum {
		color: var(--ink);
	}
</style>
