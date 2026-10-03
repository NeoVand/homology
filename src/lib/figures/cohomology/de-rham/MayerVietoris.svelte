<script lang="ts">
	// Figure (static): Mayer–Vietoris for the circle. Two overlapping arcs U, V
	// cover S¹; their intersection is two separate arcs W₁, W₂. The exact sequence
	// of locally constant functions leaves exactly one dimension over: H¹(S¹) ≅ ℝ.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const cx = 150;
	const cy = 160;
	const R = 92;
	const deg = Math.PI / 180;
	const pt = (r: number, a: number): [number, number] => [cx + r * Math.cos(a * deg), cy - r * Math.sin(a * deg)];
	function arc(r: number, a0: number, a1: number) {
		const n = 60;
		let d = '';
		for (let i = 0; i <= n; i++) {
			const [x, y] = pt(r, a0 + ((a1 - a0) * i) / n);
			d += `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
		}
		return d;
	}
	// U covers the top (−35° → 215°), V the bottom (145° → 395°)
	const U = arc(R + 15, -35, 215);
	const V = arc(R - 15, 145, 395);
	const W1 = arc(R, 145, 215);
	const W2 = arc(R, -35, 35);

	const row1 = [
		{ x: 300, tex: '0', dim: '' },
		{ x: 366, tex: String.raw`H^0(S^1)`, dim: String.raw`\cong\R` },
		{ x: 482, tex: String.raw`H^0(U)\oplus H^0(V)`, dim: String.raw`\cong\R^2` },
		{ x: 610, tex: String.raw`H^0(U\cap V)`, dim: String.raw`\cong\R^2` }
	];
	const gaps = [
		[312, 334],
		[402, 428],
		[538, 566]
	];
</script>

<Svg viewBox="0 0 700 330" maxHeight={380} label="A circle covered by two overlapping arcs U and V whose intersection has two pieces, next to the Mayer–Vietoris sequence.">
	<circle {cx} {cy} r={R} class="circle" />
	<path d={U} class="u" />
	<path d={V} class="v" />
	<path d={W1} class="w" />
	<path d={W2} class="w" />
	<SvgTeX x={cx} y={cy - R - 32} tex="U" color="var(--gold-bright)" size={19} w={30} h={26} />
	<SvgTeX x={cx} y={cy + R - 36} tex="V" color="var(--teal)" size={19} w={30} h={26} />
	<SvgTeX x={pt(R + 30, 180)[0] - 6} y={pt(R + 30, 180)[1]} tex={String.raw`W_1`} color="var(--violet)" size={17} w={40} h={26} />
	<SvgTeX x={pt(R + 30, 0)[0] + 6} y={pt(R + 30, 0)[1]} tex={String.raw`W_2`} color="var(--violet)" size={17} w={40} h={26} />
	<SvgTeX x={cx} y={312} tex={String.raw`U\cap V = W_1 \sqcup W_2`} color="var(--ink-dim)" size={15} w={220} h={24} />

	<!-- the sequence, first row with dimensions underneath -->
	{#each row1 as s, i (i)}
		<SvgTeX x={s.x} y={58} tex={s.tex} color="var(--ink-bright)" size={15} w={140} h={26} />
		{#if s.dim}
			<SvgTeX x={s.x} y={88} tex={s.dim} color="var(--gold-bright)" size={14} w={60} h={22} />
		{/if}
	{/each}
	{#each gaps as [a, b], i (i)}
		<line x1={a} y1={58} x2={b} y2={58} class="arr" marker-end="url(#arrow-ivory)" />
	{/each}
	<!-- second row -->
	<path d="M 662 58 L 680 58 L 680 112 L 334 112 L 334 128" class="arr" marker-end="url(#arrow-ivory)" fill="none" />
	<SvgTeX x={440} y={140} tex={String.raw`H^1(S^1) \longrightarrow H^1(U)\oplus H^1(V) = 0`} color="var(--ink-bright)" size={15} w={320} h={26} />
	<SvgTeX x={492} y={194} tex={String.raw`(a,\,b)\;\longmapsto\;(b - a,\; b - a)`} color="var(--violet)" size={16} w={300} h={26} />
	<SvgTeX x={492} y={226} tex={String.raw`\text{image} = \text{the diagonal, a line in } \R^2`} color="var(--ink-dim)" size={14} w={360} h={24} />
	<SvgTeX x={492} y={272} tex={String.raw`\dim H^1(S^1) = 2 - 1 = 1 \quad\Longrightarrow\quad H^1_{\dR}(S^1)\cong\R`} color="var(--rose)" size={16} w={400} h={28} />
</Svg>

<style>
	.circle {
		fill: none;
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.5;
	}
	.u {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 7;
		stroke-linecap: round;
		opacity: 0.85;
	}
	.v {
		fill: none;
		stroke: var(--teal);
		stroke-width: 7;
		stroke-linecap: round;
		opacity: 0.85;
	}
	.w {
		fill: none;
		stroke: var(--violet);
		stroke-width: 5;
		stroke-linecap: round;
	}
	.arr {
		stroke: rgba(235, 229, 213, 0.7);
		stroke-width: 1.4;
	}
</style>
