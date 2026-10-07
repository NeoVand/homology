<script lang="ts">
	// Figure (static): two chain maps f, g between chain complexes C and D, and a
	// chain homotopy s — diagonal arrows that raise degree by one.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	// On a narrow plate the columns move closer together (a narrower drawing is scaled
	// down less) and the labels grow a little (k ≥ 1), so that they stay readable.
	let width = $state(640);
	const narrow = $derived(width > 0 && width < 520);
	const W = $derived(narrow ? 460 : 640);
	const xs = $derived(narrow ? [70, 230, 390] : [120, 320, 520]);
	const k = $derived(Math.min(1.5, Math.max(1, (0.9 * W) / (width || 640))));
	const yT = 70;
	const yB = 250;
	const top = ['C_{n+1}', 'C_n', 'C_{n-1}'];
	const bot = ['D_{n+1}', 'D_n', 'D_{n-1}'];
</script>

<div bind:clientWidth={width}>
<Svg viewBox="0 0 {W} {320 + 10 * (k - 1)}" maxHeight={330} label="A chain homotopy: two rows of chain groups, two chain maps f and g between them, and diagonal maps s going up one degree">
	<!-- boundary maps (right to left in degree, drawn left to right) -->
	{#each [0, 1] as i (i)}
		<path d="M {xs[i] + 42} {yT} L {xs[i + 1] - 42} {yT}" class="bd" marker-end="url(#arrow-teal)" />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yT - 16} tex={'\\partial'} size={15 * k} color="var(--teal)" w={20 * k} h={20 * k} />
		<path d="M {xs[i] + 42} {yB} L {xs[i + 1] - 42} {yB}" class="bd" marker-end="url(#arrow-teal)" />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yB + 18} tex={'\\partial'} size={15 * k} color="var(--teal)" w={20 * k} h={20 * k} />
	{/each}
	<!-- chain maps f and g -->
	{#each xs as x (x)}
		<path d="M {x - 9} {yT + 24} L {x - 9} {yB - 26}" class="fg" marker-end="url(#arrow-ivory)" />
		<path d="M {x + 9} {yT + 24} L {x + 9} {yB - 26}" class="fg g" marker-end="url(#arrow-blue)" />
	{/each}
	<SvgTeX x={xs[0] - 24} y={(yT + yB) / 2} tex="f" size={15 * k} w={20 * k} h={20 * k} />
	<SvgTeX x={xs[0] + 26} y={(yT + yB) / 2} tex="g" size={15 * k} color="var(--blue)" w={20 * k} h={20 * k} />
	<!-- homotopy s: C_n → D_{n+1} -->
	{#each [1, 2] as i (i)}
		<path d="M {xs[i] - 30} {yT + 22} Q {(xs[i] + xs[i - 1]) / 2 + 10} {(yT + yB) / 2 + 6} {xs[i - 1] + 36} {yB - 20}" class="s" marker-end="url(#arrow-gold)" />
		<SvgTeX x={(xs[i] + xs[i - 1]) / 2 + 26} y={(yT + yB) / 2 + 26} tex="s" size={16 * k} color="var(--gold-bright)" w={20 * k} h={20 * k} />
	{/each}
	{#each xs as x, i (i)}
		<g transform="translate({x} {yT})">
			<rect x="-38" y="-18" width="76" height="36" rx="11" class="node" />
			<SvgTeX x={0} y={0} tex={top[i]} size={16 * k} w={70} h={28 * k} />
		</g>
		<g transform="translate({x} {yB})">
			<rect x="-38" y="-18" width="76" height="36" rx="11" class="node" />
			<SvgTeX x={0} y={0} tex={bot[i]} size={16 * k} w={70} h={28 * k} />
		</g>
	{/each}
	<SvgTeX x={W / 2} y={300 + 6 * (k - 1)} tex={'f - g \\;=\\; \\partial s + s\\partial'} size={17 * k} color="var(--gold-bright)" w={260 * k} h={28 * k} />
</Svg>
</div>

<style>
	.bd {
		stroke: #5fd6cf;
		stroke-width: 1.8;
		fill: none;
	}
	.fg {
		stroke: #ebe5d5;
		stroke-width: 1.8;
		fill: none;
	}
	.fg.g {
		stroke: #74a9ff;
	}
	.s {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 2;
		stroke-dasharray: 6 4;
		filter: url(#glow);
	}
	.node {
		fill: rgba(18, 26, 47, 0.95);
		stroke: rgba(235, 229, 213, 0.35);
	}
</style>
