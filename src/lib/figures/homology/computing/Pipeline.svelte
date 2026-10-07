<script lang="ts">
	// The homology machine in four stages: a complex, its boundary matrices,
	// their normal forms, and the homology groups read off from them.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	// card centres: one row on wide plates; on narrow ones a 2 × 2 snake (right, down, left)
	let cw = $state(800);
	const narrow = $derived(cw < 560);
	const C = $derived<[number, number][]>(
		narrow
			? [
					[120, 120],
					[370, 120],
					[370, 382],
					[120, 382]
				]
			: [110, 360, 610, 860].map((x) => [x, 120])
	);
	const xs = $derived(C.map((c) => c[0]));
	const ys = $derived(C.map((c) => c[1]));
	// the arrow out of card k
	const arrowOut = (k: number): [number, number, number, number] => {
		const [x0, y0] = C[k];
		const [x1, y1] = C[k + 1];
		if (y0 === y1) return x1 > x0 ? [x0 + 98, y0, x1 - 100, y1] : [x0 - 98, y0, x1 + 100, y1];
		// downwards, below the caption of card k
		return [x0, y0 + 124, x1, y1 - 90];
	};
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
	const grid = $derived.by(() => {
		const out: [number, number][] = [];
		for (let i = 0; i <= 3; i++) for (let j = 0; j <= 3; j++) out.push([xs[0] - 1.5 * g + i * g, ys[0] - 1.5 * g + j * g]);
		return out;
	});
</script>

<div bind:clientWidth={cw}>
	<Svg viewBox={narrow ? '0 0 490 512' : '0 0 970 250'} maxHeight={narrow ? 620 : 250} label="The homology machine: a simplicial complex, its boundary matrices, their reduced forms, and the homology groups">
		<defs>
			<linearGradient id="pl-card" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stop-color="#18223d" stop-opacity="0.9" />
				<stop offset="1" stop-color="#0b1122" stop-opacity="0.9" />
			</linearGradient>
		</defs>
		{#each C as [x, y], k (k)}
			<rect x={x - 92} y={y - 82} width="184" height="164" rx="14" fill="url(#pl-card)" stroke="rgba(216,178,110,0.35)" />
		{/each}

		<!-- 1: complex -->
		{#each [0, 1, 2] as i (i)}
			{#each [0, 1, 2] as j (j)}
				{@const x0 = xs[0] - 1.5 * g + i * g}
				{@const y0 = ys[0] - 1.5 * g + j * g}
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
				<text x={xs[1] - 40 + j * 40} y={ys[1] - 42 + i * 30} class="m" class:z={v === '0'}>{v}</text>
			{/each}
		{/each}
		<path d="M {xs[1] - 64} {ys[1] - 66} q -8 0 -8 8 v 104 q 0 8 8 8" class="br" />
		<path d="M {xs[1] + 64} {ys[1] - 66} q 8 0 8 8 v 104 q 0 8 -8 8" class="br" />

		<!-- 3: normal form -->
		{#each diag as row, i (i)}
			{#each row as v, j (j)}
				<text x={xs[2] - 40 + j * 40} y={ys[2] - 26 + i * 32} class="m" class:z={v === '0'} class:two={v === '2'}>{v}</text>
			{/each}
		{/each}
		<path d="M {xs[2] - 64} {ys[2] - 52} q -8 0 -8 8 v 84 q 0 8 8 8" class="br" />
		<path d="M {xs[2] + 64} {ys[2] - 52} q 8 0 8 8 v 84 q 0 8 -8 8" class="br" />

		<!-- 4: homology -->
		<SvgTeX x={xs[3]} y={ys[3] - 34} tex={'H_0 = \\Z'} size={21} color="var(--ink-bright)" w={170} />
		<SvgTeX x={xs[3]} y={ys[3]} tex={'H_1 = \\Z \\oplus \\hole{\\Z/2}'} size={21} color="var(--ink-bright)" w={170} />
		<SvgTeX x={xs[3]} y={ys[3] + 34} tex={'H_2 = 0'} size={21} color="var(--ink-bright)" w={170} />

		{#each [0, 1, 2] as k (k)}
			{@const [x1, y1, x2, y2] = arrowOut(k)}
			<line {x1} {y1} {x2} {y2} stroke="var(--gold)" stroke-width="2" marker-end="url(#arrow-gold)" />
		{/each}

		<text x={xs[0]} y={ys[0] + 112} class="cap">the complex</text>
		<text x={xs[1]} y={ys[1] + 112} class="cap">boundary matrices ∂ₖ</text>
		<text x={xs[2]} y={ys[2] + 112} class="cap">ranks · invariant factors</text>
		<text x={xs[3]} y={ys[3] + 112} class="cap">homology</text>
	</Svg>
</div>

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
	/* phones: the cards are drawn at about 70%, so the captions grow */
	@container figure (max-width: 560px) {
		.cap {
			font-size: 16px;
			letter-spacing: 0.02em;
		}
		.m {
			font-size: 20px;
		}
	}
</style>
