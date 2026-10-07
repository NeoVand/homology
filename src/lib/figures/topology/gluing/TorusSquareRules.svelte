<script lang="ts">
	// The torus as a square, with its two gluing rules beside it (below it on
	// narrow plates, where side by side would leave the rules too small to read).
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	let cw = $state(800);
	const narrow = $derived(cw < 520);
</script>

<div bind:clientWidth={cw}>
	<Svg
		viewBox={narrow ? '0 0 300 410' : '0 0 520 250'}
		maxHeight={narrow ? 470 : 250}
		label="A square with both horizontal edges labelled a pointing right, and both vertical edges labelled b pointing up; all four corners marked as the same point"
	>
		{#if narrow}
			<GluingSquare preset="torus" x={65} y={42} size={170} corners />
			<text x={40} y={286} class="t-ui rl">BOTTOM TO TOP</text>
			<SvgTeX x={40} y={312} anchor="start" tex={'(x, 0) \\sim (x, 1)'} size={19} w={220} h={30} color="var(--gold-bright)" />
			<text x={40} y={356} class="t-ui rl">LEFT TO RIGHT</text>
			<SvgTeX x={40} y={382} anchor="start" tex={'(0, y) \\sim (1, y)'} size={19} w={220} h={30} color="var(--teal)" />
		{:else}
			<GluingSquare preset="torus" x={70} y={30} size={170} corners />
			<text x={320} y={72} class="t-ui">BOTTOM TO TOP</text>
			<SvgTeX x={320} y={98} anchor="start" tex={'(x, 0) \\sim (x, 1)'} size={17} w={180} h={28} color="var(--gold-bright)" />
			<text x={320} y={150} class="t-ui">LEFT TO RIGHT</text>
			<SvgTeX x={320} y={176} anchor="start" tex={'(0, y) \\sim (1, y)'} size={17} w={180} h={28} color="var(--teal)" />
		{/if}
	</Svg>
</div>

<style>
	text.rl {
		font-size: 13px;
	}
</style>
