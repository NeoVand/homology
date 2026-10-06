<script lang="ts">
	// 1 + 3 + 5 + … + (2n − 1) = n²: each odd number is an L-shaped layer
	// that turns an n × n square into an (n+1) × (n+1) square.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { renderMathInText } from '$lib/katex/render';

	let n = $state(4);
	const colors = ['#f2d08f', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff', '#84d9a2', '#f4b55f', '#ff9e8a'];
	// cells shrink once the square would outgrow the canvas
	const cell = $derived(232 / Math.max(n, 4));
	const off = $derived((280 - n * cell) / 2);

	const cells = $derived.by(() => {
		const out: { i: number; j: number; k: number }[] = [];
		for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push({ i, j, k: Math.max(i, j) });
		return out;
	});
	const sum = $derived(
		n <= 6
			? Array.from({ length: n }, (_, k) => 2 * k + 1).join(' + ')
			: `1 + 3 + 5 + \\dots + ${2 * n - 1}`
	);
	const readout = $derived(
		String.raw`\(${sum} = ${n * n} = ${n}^2\)` +
			(n > 1
				? String.raw` — the newest layer has \(2\cdot${n}-1 = ${2 * n - 1}\) squares, and adds exactly enough to turn a \(${n - 1}\times${n - 1}\) square into an \(${n}\times${n}\) one.`
				: String.raw` — the base case: one square.`)
	);
</script>

<div class="ind">
	<Svg viewBox="0 0 280 280" maxHeight={320} label="An n by n square built from L-shaped layers of 1, 3, 5, ... small squares">
		{#each cells as c (c.i + ',' + c.j)}
			<rect
				x={off + c.j * cell + 1.2}
				y={280 - off - (c.i + 1) * cell + 1.2}
				width={cell - 2.4}
				height={cell - 2.4}
				rx="3"
				class="sq"
				class:newest={c.k === n - 1}
				style="fill:{colors[c.k % colors.length]}"
			/>
		{/each}
	</Svg>
	<p class="readout" aria-live="polite">{@html renderMathInText(readout)}</p>
	<Controls>
		<Stepper bind:value={n} min={1} max={8} label="n" />
	</Controls>
</div>

<style>
	.ind > :global(svg) {
		padding: 1rem 0.4rem 0;
	}
	.sq {
		fill-opacity: 0.72;
		stroke: rgba(255, 255, 255, 0.28);
		stroke-width: 1;
		transition: fill-opacity 0.3s;
	}
	.sq.newest {
		fill-opacity: 0.95;
		stroke: #fff;
		filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.35));
	}
	.readout {
		margin: 0.5rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.98rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
</style>
