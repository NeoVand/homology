<script lang="ts">
	// Figure (static): the de Rham ladder in ℝ³. Forms go up in degree under d
	// (= grad, curl, div); chains go down under ∂; integration pairs a k-form
	// with a k-chain, and Stokes says the two arrows are mirror images.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	// On a narrow plate the columns move closer together (a narrower drawing is scaled down
	// less), the labels grow a little (z) and the two formulas break onto two lines.
	let width = $state(694);
	const narrow = $derived(width > 0 && width < 560);
	const z = $derived(narrow ? 1.2 : 1);
	const W = $derived(narrow ? 450 : 694);
	const xs = $derived(narrow ? [63, 171, 279, 387] : [92, 262, 432, 602]);
	const yF = $derived(narrow ? 140 : 118);
	const yC = $derived(narrow ? 298 : 276);
	const forms = [String.raw`\Omega^0`, String.raw`\Omega^1`, String.raw`\Omega^2`, String.raw`\Omega^3`];
	const chains = ['C_0', 'C_1', 'C_2', 'C_3'];
	const formNames = ['functions', '1-forms', '2-forms', '3-forms'];
	const chainNames = ['points', 'curves', 'surfaces', 'solids'];
	const ops = [String.raw`\operatorname{grad}`, String.raw`\operatorname{curl}`, String.raw`\operatorname{div}`];
	const bend = $derived(narrow ? 30 : 50);
	const arc = (a: number, b: number) =>
		`M ${a} ${yF - 34} C ${a + bend} ${yF - 84}, ${b - bend} ${yF - 84}, ${b - 4} ${yF - 37}`;
	const ddTeX = String.raw`d\circ d = 0, \quad\text{that is,}\quad \operatorname{curl}(\operatorname{grad} f) = 0 \;\text{ and }\; \operatorname{div}(\operatorname{curl}\mathbf F) = 0`;
	const stokesTeX = String.raw`\textstyle \int_{c} d\omega \;=\; \int_{\partial c} \omega \qquad\text{(Stokes: } d \text{ and } \partial \text{ mirror each other)}`;
</script>

<div bind:clientWidth={width}>
<Svg viewBox="0 0 {W} {narrow ? 418 : 368}" maxHeight={narrow ? 520 : 440} label="Forms of degree 0 to 3 connected by d, chains of dimension 0 to 3 connected by the boundary operator, and integration pairing them.">
	<!-- d∘d = 0 arcs -->
	<path d={arc(xs[0], xs[2])} class="dd" marker-end="url(#arrow-rose)" />
	<path d={arc(xs[1], xs[3])} class="dd" marker-end="url(#arrow-rose)" />
	{#if narrow}
		<SvgTeX x={W / 2} y={14} tex={String.raw`d\circ d = 0, \ \text{that is,}`} color="var(--rose)" size={18} w={420} h={26} />
		<SvgTeX x={W / 2} y={38} tex={String.raw`\operatorname{curl}(\operatorname{grad} f) = 0, \ \ \operatorname{div}(\operatorname{curl}\mathbf F) = 0`} color="var(--rose)" size={18} w={440} h={26} />
	{:else}
		<SvgTeX x={347} y={18} tex={ddTeX} color="var(--rose)" size={15} w={660} h={24} />
	{/if}

	{#each xs as x, i (i)}
		<!-- form nodes -->
		<circle cx={x} cy={yF} r="27" class="node f" />
		<SvgTeX {x} y={yF} tex={forms[i]} color="var(--gold-bright)" size={20 * z} w={50 * z} h={30 * z} />
		<text {x} y={yF + 46} text-anchor="middle" class="t-ui name" class:big={narrow}>{formNames[i].toUpperCase()}</text>
		<!-- chain nodes -->
		<circle cx={x} cy={yC} r="27" class="node c" />
		<SvgTeX {x} y={yC} tex={chains[i]} color="var(--violet)" size={20 * z} w={50 * z} h={30 * z} />
		<text {x} y={yC + 46} text-anchor="middle" class="t-ui name" class:big={narrow}>{chainNames[i].toUpperCase()}</text>
		<!-- pairing -->
		<line x1={x} y1={yF + 56} x2={x} y2={yC - 34} class="pair" />
		<SvgTeX x={x + 12} y={(yF + yC) / 2 + 6} tex={String.raw`\textstyle\int`} color="var(--ink-dim)" size={16 * z} w={20 * z} h={30 * z} />
	{/each}

	{#each [0, 1, 2] as i (i)}
		<!-- d arrows (forms, left → right) -->
		<line x1={xs[i] + 33} y1={yF} x2={xs[i + 1] - 35} y2={yF} class="arr d" marker-end="url(#arrow-gold)" />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yF - 15} tex="d" color="var(--gold-bright)" size={17 * z} w={30 * z} h={22 * z} />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yF + 16} tex={ops[i]} color="var(--teal)" size={14 * z} w={70 * z} h={22 * z} />
		<!-- ∂ arrows (chains, right → left) -->
		<line x1={xs[i + 1] - 33} y1={yC} x2={xs[i] + 35} y2={yC} class="arr b" marker-end="url(#arrow-violet)" />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yC - 15} tex={String.raw`\partial`} color="var(--violet)" size={17 * z} w={30 * z} h={22 * z} />
	{/each}

	{#if narrow}
		<SvgTeX x={W / 2} y={372} tex={String.raw`\textstyle \int_{c} d\omega \;=\; \int_{\partial c} \omega`} color="var(--ink-bright)" size={20} w={300} h={32} />
		<SvgTeX x={W / 2} y={402} tex={String.raw`\text{(Stokes: } d \text{ and } \partial \text{ mirror each other)}`} color="var(--ink-bright)" size={18} w={440} h={28} />
	{:else}
		<SvgTeX x={347} y={350} tex={stokesTeX} color="var(--ink-bright)" size={16} w={640} h={28} />
	{/if}
</Svg>
</div>

<style>
	.node {
		stroke-width: 1.5;
	}
	.node.f {
		fill: rgba(242, 208, 143, 0.08);
		stroke: rgba(242, 208, 143, 0.6);
	}
	.node.c {
		fill: rgba(164, 147, 255, 0.08);
		stroke: rgba(164, 147, 255, 0.6);
	}
	.name {
		font-size: 9.5px;
		letter-spacing: 0.16em;
		fill: var(--ink-faint);
	}
	.name.big {
		font-size: 14.5px !important;
		letter-spacing: 0.06em;
	}
	.arr {
		stroke-width: 1.8;
	}
	.arr.d {
		stroke: var(--gold-bright);
	}
	.arr.b {
		stroke: var(--violet);
	}
	.pair {
		stroke: rgba(235, 229, 213, 0.3);
		stroke-dasharray: 2 5;
		stroke-width: 1.4;
	}
	.dd {
		fill: none;
		stroke: rgba(242, 141, 182, 0.7);
		stroke-width: 1.4;
		stroke-dasharray: 5 4;
	}
</style>
