<script lang="ts">
	// The homology machine in four stages: a complex, its boundary matrices,
	// their normal forms, and the homology groups read off from them.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const xs = [110, 360, 610, 860];
	const y = 120;
	const mat = [
		['1', '1', '0'],
		['−1', '0', '1'],
		['0', '−1', '−1'],
		['1', '0', '0']
	];
	const diag = [
		['1', '0', '0'],
		['0', '1', '0'],
		['0', '0', '2']
	];
	// a small triangulated square for the first stage
	const g = 26;
	const grid: [number, number][] = [];
	for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) grid.push([xs[0] - 1.5 * g + i * g, y - 1.5 * g + j * g]);
</script>

<Svg viewBox="0 0 970 250" maxHeight={250} label="The homology machine: a simplicial complex, its boundary matrices, their reduced forms, and the homology groups">
	<defs>
		<linearGradient id="pl-card" x1="0" x2="0" y1="0" y2="1">
			<stop offset="0" stop-color="#18223d" stop-opacity="0.9" />
			<stop offset="1" stop-color="#0b1122" stop-opacity="0.9" />
		</linearGradient>
	</defs>
	{#each xs as x, k (k)}
		<rect x={x - 92} y={y - 82} width="184" height="164" rx="14" fill="url(#pl-card)" stroke="rgba(216,178,110,0.35)" />
	{/each}

	<!-- 1: complex -->
	{#each [0, 1, 2] as i (i)}
		{#each [0, 1, 2] as j (j)}
			{@const x0 = xs[0] - 1.5 * g + i * g}
			{@const y0 = y - 1.5 * g + j * g}
			<polygon points="{x0},{y0 + g} {x0 + g},{y0 + g} {x0 + g},{y0}" fill="rgba(116,169,255,0.16)" stroke="rgba(200,192,170,0.6)" stroke-width="1.2" />
			<polygon points="{x0},{y0 + g} {x0 + g},{y0} {x0},{y0}" fill="rgba(116,169,255,0.08)" stroke="rgba(200,192,170,0.6)" stroke-width="1.2" />
		{/each}
	{/each}
	{#each grid as [px, py], n (n)}
		<circle cx={px} cy={py} r="3.2" fill="url(#vertex-fill)" />
	{/each}

	<!-- 2: boundary matrix -->
	{#each mat as row, i (i)}
		{#each row as v, j (j)}
			<text x={xs[1] - 40 + j * 40} y={y - 42 + i * 30} class="m" class:z={v === '0'}>{v}</text>
		{/each}
	{/each}
	<path d="M {xs[1] - 64} {y - 66} q -8 0 -8 8 v 104 q 0 8 8 8" class="br" />
	<path d="M {xs[1] + 64} {y - 66} q 8 0 8 8 v 104 q 0 8 -8 8" class="br" />

	<!-- 3: normal form -->
	{#each diag as row, i (i)}
		{#each row as v, j (j)}
			<text x={xs[2] - 40 + j * 40} y={y - 26 + i * 32} class="m" class:z={v === '0'} class:two={v === '2'}>{v}</text>
		{/each}
	{/each}
	<path d="M {xs[2] - 64} {y - 52} q -8 0 -8 8 v 84 q 0 8 8 8" class="br" />
	<path d="M {xs[2] + 64} {y - 52} q 8 0 8 8 v 84 q 0 8 -8 8" class="br" />

	<!-- 4: homology -->
	<SvgTeX x={xs[3]} y={y - 34} tex={'H_0 = \\Z'} size={21} color="var(--ink-bright)" w={170} />
	<SvgTeX x={xs[3]} y={y} tex={'H_1 = \\Z \\oplus \\hole{\\Z/2}'} size={21} color="var(--ink-bright)" w={170} />
	<SvgTeX x={xs[3]} y={y + 34} tex={'H_2 = 0'} size={21} color="var(--ink-bright)" w={170} />

	{#each [0, 1, 2] as k (k)}
		<line x1={xs[k] + 98} y1={y} x2={xs[k + 1] - 100} y2={y} stroke="var(--gold)" stroke-width="2" marker-end="url(#arrow-gold)" />
	{/each}

	<text x={xs[0]} y={y + 112} class="cap">the complex</text>
	<text x={xs[1]} y={y + 112} class="cap">boundary matrices ∂ₖ</text>
	<text x={xs[2]} y={y + 112} class="cap">ranks · invariant factors</text>
	<text x={xs[3]} y={y + 112} class="cap">homology</text>
</Svg>

<style>
	.m {
		font-family: var(--font-ui);
		font-size: 17px;
		text-anchor: middle;
		fill: var(--ink-bright) !important;
	}
	.m.z {
		fill: var(--ink-ghost) !important;
	}
	.m.two {
		fill: var(--rose) !important;
		font-weight: 700;
	}
	.br {
		fill: none;
		stroke: var(--ink-dim);
		stroke-width: 1.5;
	}
	.cap {
		font-family: var(--font-ui);
		font-size: 14px;
		letter-spacing: 0.06em;
		text-anchor: middle;
		fill: var(--gold) !important;
	}
</style>
