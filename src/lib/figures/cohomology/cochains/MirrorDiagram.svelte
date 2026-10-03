<script lang="ts">
	// Static figure: chains (places) above, cochains (measurements) below.
	// The same three columns; the arrows point the other way; each column is
	// joined by the pairing ⟨φ, c⟩ ("integrate φ over c").
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const xs = [110, 300, 490];
	const yTop = 92;
	const yBot = 262;
</script>

<Svg viewBox="0 0 600 340" maxHeight={360} label="Chains with boundary maps pointing down in degree, cochains with coboundary maps pointing up, joined column by column by the pairing">
	<!-- row captions -->
	<text x="20" y="28" class="t-ui cap">PLACES · CHAINS</text>
	<text x="20" y="322" class="t-ui cap">MEASUREMENTS · COCHAINS</text>

	<!-- little pictures of the simplices in each column -->
	<g class="pic">
		<circle cx={xs[0] - 9} cy={yTop - 44} r="4.5" class="dot" />
		<circle cx={xs[0] + 9} cy={yTop - 36} r="4.5" class="dot" />
		<line x1={xs[1] - 16} y1={yTop - 32} x2={xs[1] + 16} y2={yTop - 50} class="ln" />
		<polygon points="{xs[2] - 16},{yTop - 31} {xs[2] + 16},{yTop - 31} {xs[2]},{yTop - 56}" class="tri" />
	</g>

	<!-- chains row: C₀ ← C₁ ← C₂ -->
	{#each xs as x, k (k)}
		<SvgTeX {x} y={yTop} tex={`C_${k}`} size={26} color="var(--violet)" w={80} h={44} />
		<SvgTeX {x} y={yBot} tex={`C^${k}`} size={26} color="var(--gold-bright)" w={80} h={44} />
		<!-- pairing -->
		<line x1={x} y1={yTop + 26} x2={x} y2={yBot - 28} class="pair" />
		<SvgTeX x={x + 9} y={(yTop + yBot) / 2} tex={'\\langle\\,\\cdot\\,,\\cdot\\,\\rangle'} size={15} color="var(--ink-faint)" w={60} h={26} anchor="start" />
	{/each}
	{#each [0, 1] as k (k)}
		<!-- ∂ points left (down in degree) -->
		<line x1={xs[k + 1] - 34} y1={yTop} x2={xs[k] + 36} y2={yTop} class="arr violet" marker-end="url(#arrow-violet)" />
		<SvgTeX x={(xs[k] + xs[k + 1]) / 2} y={yTop - 22} tex={`\\partial_${k + 1}`} size={18} color="var(--violet)" w={60} h={30} />
		<!-- δ points right (up in degree) -->
		<line x1={xs[k] + 36} y1={yBot} x2={xs[k + 1] - 34} y2={yBot} class="arr gold" marker-end="url(#arrow-gold)" />
		<SvgTeX x={(xs[k] + xs[k + 1]) / 2} y={yBot + 22} tex={`\\delta_${k} = \\partial_${k + 1}^{\\mathsf T}`} size={17} color="var(--gold-bright)" w={120} h={30} />
	{/each}
	<SvgTeX x={588} y={318} tex={'\\langle \\delta\\varphi, c\\rangle = \\langle \\varphi, \\partial c\\rangle'} size={17} color="var(--ink-bright)" w={240} h={32} anchor="end" />
</Svg>

<style>
	.cap {
		font-size: 10.5px !important;
		letter-spacing: 0.2em !important;
	}
	.pair {
		stroke: rgba(235, 229, 213, 0.22);
		stroke-width: 1.4;
		stroke-dasharray: 3 5;
	}
	.arr {
		stroke-width: 2.2;
	}
	.arr.violet {
		stroke: var(--violet);
	}
	.arr.gold {
		stroke: var(--gold-bright);
	}
	.dot {
		fill: var(--violet);
	}
	.ln {
		stroke: var(--violet);
		stroke-width: 2.5;
		stroke-linecap: round;
	}
	.tri {
		fill: rgba(164, 147, 255, 0.28);
		stroke: var(--violet);
		stroke-width: 2;
		stroke-linejoin: round;
	}
</style>
