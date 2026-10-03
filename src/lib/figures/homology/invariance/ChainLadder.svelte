<script lang="ts">
	// The ladder diagram of a chain map: two chain complexes, vertical maps f_#,
	// every square commutes. Hovering a square shows its two routes.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const xs = [40, 165, 300, 435];
	const yTop = 62;
	const yBot = 202;
	let sq = $state(1);
	const topLab = ['\\cdots', 'C_2(K)', 'C_1(K)', 'C_0(K)'];
	const botLab = ['\\cdots', 'C_2(L)', 'C_1(L)', 'C_0(L)'];
	const dLab = ['\\partial_3', '\\partial_2', '\\partial_1'];
	// start and end corners of the routes inside square i
	const S = (i: number) => [xs[i] + 30, yTop + 24];
	const E = (i: number) => [xs[i + 1] - 26, yBot - 24];
</script>

<Svg viewBox="0 0 480 262" maxHeight={300} label="A ladder of two chain complexes joined by the chain map; each square commutes">
	{#each [0, 1, 2] as i (i)}
		{@const on = sq === i}
		{@const s = S(i)}
		{@const e = E(i)}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<rect
			x={xs[i] + 14}
			y={yTop + 14}
			width={xs[i + 1] - xs[i] - 28}
			height={yBot - yTop - 28}
			rx="12"
			class="sq"
			class:on
			role="button"
			tabindex="0"
			aria-label="square {i + 1}"
			onpointerenter={() => (sq = i)}
			onfocus={() => (sq = i)}
		/>
		{#if on}
			<!-- across, then down (gold) and down, then across (teal) -->
			<path d="M {s[0]} {s[1]} Q {e[0] + 4} {s[1] - 4} {e[0]} {e[1]}" class="route gold" marker-end="url(#arrow-gold)" />
			<path d="M {s[0]} {s[1]} Q {s[0] - 4} {e[1] + 4} {e[0]} {e[1]}" class="route teal" marker-end="url(#arrow-teal)" />
			<circle cx={s[0]} cy={s[1]} r="3.5" class="end" />
		{/if}
	{/each}
	{#each xs as x, i (i)}
		<SvgTeX {x} y={yTop} tex={topLab[i]} size={19} color="var(--ink-bright)" w={90} h={34} />
		<SvgTeX {x} y={yBot} tex={botLab[i]} size={19} color="var(--ink-bright)" w={90} h={34} />
		{#if i > 0}
			<line x1={x} y1={yTop + 20} x2={x} y2={yBot - 22} class="arr" marker-end="url(#arrow-violet)" />
			<SvgTeX x={x + 22} y={(yTop + yBot) / 2} tex={'f_\\#'} size={16} color="var(--violet)" w={40} h={28} />
		{/if}
		{#if i < xs.length - 1}
			<line x1={x + (i === 0 ? 16 : 40)} y1={yTop} x2={xs[i + 1] - 40} y2={yTop} class="arr" marker-end="url(#arrow-ivory)" />
			<line x1={x + (i === 0 ? 16 : 40)} y1={yBot} x2={xs[i + 1] - 40} y2={yBot} class="arr" marker-end="url(#arrow-ivory)" />
			<SvgTeX x={(x + xs[i + 1]) / 2 + 4} y={yTop - 15} tex={dLab[i]} size={15} color="var(--ink-dim)" w={44} h={24} />
			<SvgTeX x={(x + xs[i + 1]) / 2 + 4} y={yBot + 15} tex={dLab[i]} size={15} color="var(--ink-dim)" w={44} h={24} />
		{/if}
	{/each}
	<SvgTeX x={240} y={246} tex={`\\textcolor{#f4d79c}{\\partial_{${3 - sq}}\\circ f_\\#} \\;=\\; \\textcolor{#5fd6cf}{f_\\#\\circ\\partial_{${3 - sq}}}`} size={16} color="var(--ink-bright)" w={300} h={28} />
</Svg>

<style>
	.arr {
		stroke: rgba(235, 229, 213, 0.7);
		stroke-width: 1.6;
	}
	.sq {
		fill: rgba(216, 178, 110, 0.03);
		stroke: rgba(216, 178, 110, 0.12);
		stroke-width: 1;
		cursor: pointer;
		transition: all 0.25s var(--ease);
	}
	.sq.on {
		fill: rgba(216, 178, 110, 0.08);
		stroke: rgba(242, 208, 143, 0.45);
	}
	.route {
		fill: none;
		stroke-width: 2.2;
		stroke-dasharray: 6 5;
	}
	.route.gold {
		stroke: var(--gold-bright);
	}
	.route.teal {
		stroke: var(--teal);
	}
	.end {
		fill: var(--ink-bright);
	}
</style>
