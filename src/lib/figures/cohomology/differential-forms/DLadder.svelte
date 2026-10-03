<script lang="ts">
	// Figure (static): the de Rham ladder in ℝ³. Forms go up in degree under d
	// (= grad, curl, div); chains go down under ∂; integration pairs a k-form
	// with a k-chain, and Stokes says the two arrows are mirror images.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const xs = [92, 262, 432, 602];
	const yF = 118;
	const yC = 276;
	const forms = [String.raw`\Omega^0`, String.raw`\Omega^1`, String.raw`\Omega^2`, String.raw`\Omega^3`];
	const chains = ['C_0', 'C_1', 'C_2', 'C_3'];
	const formNames = ['functions', '1-forms', '2-forms', '3-forms'];
	const chainNames = ['points', 'curves', 'surfaces', 'solids'];
	const ops = [String.raw`\operatorname{grad}`, String.raw`\operatorname{curl}`, String.raw`\operatorname{div}`];
	const arc = (a: number, b: number) =>
		`M ${a} ${yF - 34} C ${a + 50} ${yF - 84}, ${b - 50} ${yF - 84}, ${b - 4} ${yF - 37}`;
</script>

<Svg viewBox="0 0 694 368" maxHeight={440} label="Forms of degree 0 to 3 connected by d, chains of dimension 0 to 3 connected by the boundary operator, and integration pairing them.">
	<!-- d∘d = 0 arcs -->
	<path d={arc(xs[0], xs[2])} class="dd" marker-end="url(#arrow-rose)" />
	<path d={arc(xs[1], xs[3])} class="dd" marker-end="url(#arrow-rose)" />
	<SvgTeX
		x={347}
		y={18}
		tex={String.raw`d\circ d = 0, \quad\text{that is,}\quad \operatorname{curl}(\operatorname{grad} f) = 0 \;\text{ and }\; \operatorname{div}(\operatorname{curl}\mathbf F) = 0`}
		color="var(--rose)"
		size={15}
		w={660}
		h={24}
	/>

	{#each xs as x, i (i)}
		<!-- form nodes -->
		<circle cx={x} cy={yF} r="27" class="node f" />
		<SvgTeX {x} y={yF} tex={forms[i]} color="var(--gold-bright)" size={20} w={50} h={30} />
		<text {x} y={yF + 46} text-anchor="middle" class="t-ui name">{formNames[i].toUpperCase()}</text>
		<!-- chain nodes -->
		<circle cx={x} cy={yC} r="27" class="node c" />
		<SvgTeX {x} y={yC} tex={chains[i]} color="var(--violet)" size={20} w={50} h={30} />
		<text {x} y={yC + 46} text-anchor="middle" class="t-ui name">{chainNames[i].toUpperCase()}</text>
		<!-- pairing -->
		<line x1={x} y1={yF + 56} x2={x} y2={yC - 34} class="pair" />
		<SvgTeX x={x + 12} y={(yF + yC) / 2 + 6} tex={String.raw`\textstyle\int`} color="var(--ink-dim)" size={16} w={20} h={30} />
	{/each}

	{#each [0, 1, 2] as i (i)}
		<!-- d arrows (forms, left → right) -->
		<line x1={xs[i] + 33} y1={yF} x2={xs[i + 1] - 35} y2={yF} class="arr d" marker-end="url(#arrow-gold)" />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yF - 15} tex="d" color="var(--gold-bright)" size={17} w={30} h={22} />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yF + 16} tex={ops[i]} color="var(--teal)" size={14} w={70} h={22} />
		<!-- ∂ arrows (chains, right → left) -->
		<line x1={xs[i + 1] - 33} y1={yC} x2={xs[i] + 35} y2={yC} class="arr b" marker-end="url(#arrow-violet)" />
		<SvgTeX x={(xs[i] + xs[i + 1]) / 2} y={yC - 15} tex={String.raw`\partial`} color="var(--violet)" size={17} w={30} h={22} />
	{/each}

	<SvgTeX
		x={347}
		y={350}
		tex={String.raw`\textstyle \int_{c} d\omega \;=\; \int_{\partial c} \omega \qquad\text{(Stokes: } d \text{ and } \partial \text{ mirror each other)}`}
		color="var(--ink-bright)"
		size={16}
		w={640}
		h={28}
	/>
</Svg>

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
