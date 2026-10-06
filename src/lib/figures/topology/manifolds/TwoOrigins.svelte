<script lang="ts">
	// The line with two origins: two copies of ℝ glued at every point except 0.
	// Each origin has neighbourhoods that are open intervals, but every
	// neighbourhood of one origin meets every neighbourhood of the other.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const Y = 92;
	const O = 320;
	const lift = 30;
	const reach = 150;
	let cw = $state(0);
	const narrow = $derived(cw > 0 && cw < 560);
</script>

<div bind:clientWidth={cw}>
<Svg viewBox={narrow ? '120 8 400 140' : '0 0 640 178'} maxHeight={240} label="A line with a gap at zero and two separate origin points, one above and one below the gap. A small interval around the upper origin and one around the lower origin share all their points except the origins.">
	<!-- the line, missing its point 0 -->
	<line x1="34" y1={Y} x2={O - 7} y2={Y} class="line" />
	<line x1={O + 7} y1={Y} x2="606" y2={Y} class="line" />
	<circle cx={O} cy={Y} r="5" class="gap" />
	<!-- neighbourhoods of the two origins -->
	<path d="M {O - reach} {Y - 3} L {O - 9} {Y - 3} Q {O} {Y - lift + 2} {O} {Y - lift} Q {O} {Y - lift + 2} {O + 9} {Y - 3} L {O + reach} {Y - 3}" class="nb gold" />
	<path d="M {O - reach} {Y + 3} L {O - 9} {Y + 3} Q {O} {Y + lift - 2} {O} {Y + lift} Q {O} {Y + lift - 2} {O + 9} {Y + 3} L {O + reach} {Y + 3}" class="nb teal" />
	<circle cx={O} cy={Y - lift} r="6" class="o gold" />
	<circle cx={O} cy={Y + lift} r="6" class="o teal" />
	<SvgTeX x={O + 28} y={Y - lift - 4} tex={'0_1'} size={15} color="var(--gold-bright)" w={30} h={22} />
	<SvgTeX x={O + 28} y={Y + lift + 6} tex={'0_2'} size={15} color="var(--teal)" w={30} h={22} />
	<SvgTeX x={O - reach - 22} y={Y - 14} tex={'U_1'} size={14} color="var(--gold-bright)" w={30} h={22} />
	<SvgTeX x={O - reach - 22} y={Y + 18} tex={'U_2'} size={14} color="var(--teal)" w={30} h={22} />
	<text x={O} y={narrow ? 30 : 22} class="t-ui">TWO COPIES OF ℝ, GLUED EXCEPT AT 0</text>
	{#if !narrow}
		<text x={O} y="166" class="cap">U₁ and U₂ share every point except the two origins: they cannot be made disjoint</text>
	{/if}
</Svg>
</div>

<style>
	.line {
		stroke: var(--blue);
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.gap {
		fill: #0b1020;
		stroke: var(--ink-dim);
		stroke-width: 1.4;
	}
	.nb {
		fill: none;
		stroke-width: 3;
		stroke-linecap: round;
		opacity: 0.85;
	}
	.nb.gold {
		stroke: var(--gold-bright);
	}
	.nb.teal {
		stroke: var(--teal);
	}
	.o.gold {
		fill: var(--gold-bright);
		filter: url(#glow);
	}
	.o.teal {
		fill: var(--teal);
		filter: url(#glow);
	}
	.t-ui {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-anchor: middle;
	}
	.cap {
		fill: var(--ink-dim);
		font-family: var(--font-ui);
		font-size: 10.5px;
		text-anchor: middle;
	}
</style>
