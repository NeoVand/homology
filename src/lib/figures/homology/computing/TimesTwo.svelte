<script lang="ts">
	// The map x ↦ 2x through three lenses. Over ℚ it is invertible, over ℤ/2 it
	// is zero, and over ℤ it is one-to-one but misses every odd number: its
	// cokernel ℤ/2ℤ is exactly the kind of torsion homology can have.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	type Lens = 'Z' | 'Q' | 'Z2';
	let lens = $state<Lens>('Z');

	// on narrow plates the number lines are drawn tighter, so the drawing (and its numbers) shrink less
	let cw = $state(800);
	const narrow = $derived(cw < 560);
	const W = $derived(narrow ? 440 : 760);
	const y0 = 70;
	const y1 = 215;
	const xs = (v: number) => W / 2 + v * (narrow ? 30 : 52);
	// ℤ/2 mode: the two dots on each side
	const z2 = $derived(narrow ? { l: W / 2 - 150, d: 90, r: W / 2 + 60, lab: W / 2 - 95 } : { l: W / 2 - 170, d: 120, r: W / 2 + 110, lab: W / 2 - 110 });
	const dom: Record<Lens, number[]> = {
		Z: [-3, -2, -1, 0, 1, 2, 3],
		Q: [-3, -2.5, -2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2, 2.5, 3],
		Z2: [0, 1]
	};
	const cod = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
	const hit = (lensv: Lens, v: number) => (lensv === 'Z' ? v % 2 === 0 : true);
	const num = (v: number) => (v < 0 ? '−' + -v : String(v));

	const read: Record<Lens, { tex: string; text: string }> = {
		Z: {
			tex: '\\im(\\times 2) = 2\\Z, \\qquad \\Z / 2\\Z \\cong \\Z/2',
			text: 'One-to-one, but only the even numbers are reached. What is left over, even versus odd, is a group with two elements. Torsion.'
		},
		Q: {
			tex: '\\times 2 \\text{ is invertible: } x = \\tfrac{y}{2}, \\qquad \\rank = 1',
			text: 'Every number is twice something (3 = 2 · 3/2), so nothing is left over. Division destroys the torsion.'
		},
		Z2: {
			tex: '2 = 0 \\text{ in } \\Z/2: \\quad \\times 2 = 0, \\qquad \\rank = 0',
			text: 'Modulo 2, doubling sends everything to 0: the map is zero. The 2 has become invisible.'
		}
	};
</script>

<div class="t2" bind:clientWidth={cw}>
	<div class="ctl ui">
		<Segmented
			bind:value={lens}
			options={[
				{ value: 'Z', label: 'over ℤ' },
				{ value: 'Q', label: 'over ℚ' },
				{ value: 'Z2', label: 'over ℤ/2' }
			]}
			label="Number system"
		/>
	</div>
	<Svg viewBox="0 0 {W} 270" maxHeight={300} label="The doubling map drawn as arrows from one number line to another">
		{#if lens !== 'Z2'}
			<line x1="40" y1={y0} x2={W - 40} y2={y0} class="axis" />
			<line x1="40" y1={y1} x2={W - 40} y2={y1} class="axis" />
			<SvgTeX x={30} y={y0} tex="x" size={20} color="var(--ink-dim)" w={30} anchor="end" />
			<SvgTeX x={30} y={y1} tex="2x" size={20} color="var(--ink-dim)" w={40} anchor="end" />
			{#each dom[lens] as v (v)}
				{@const t = 2 * v}
				{#if Math.abs(t) <= 6}
					<line x1={xs(v)} y1={y0 + 8} x2={xs(t)} y2={y1 - 10} class="arr" class:half={!Number.isInteger(v)} marker-end="url(#arrow-violet)" />
				{/if}
			{/each}
			{#each dom[lens] as v (v)}
				<circle cx={xs(v)} cy={y0} r={Number.isInteger(v) ? 6 : 4.5} class="dot" class:half={!Number.isInteger(v)} />
				{#if Number.isInteger(v)}<text x={xs(v)} y={y0 - 16} class="num">{num(v)}</text>{/if}
			{/each}
			{#each cod as v (v)}
				<circle cx={xs(v)} cy={y1} r="7" class="tgt" class:hit={hit(lens, v)} class:miss={!hit(lens, v)} />
				<text x={xs(v)} y={y1 + 30} class="num" class:missn={!hit(lens, v)}>{num(v)}</text>
			{/each}
		{:else}
			<!-- ℤ/2: a two-hour clock -->
			{#each [0, 1] as v (v)}
				{@const cx = z2.l + v * z2.d}
				<circle cx={cx} cy={y0 + 30} r="9" class="dot" />
				<text x={cx} y={y0 + 2} class="num">{v}</text>
				<circle cx={z2.r + v * z2.d} cy={y1 - 20} r="9" class="tgt" class:hit={v === 0} class:miss={v !== 0} />
				<text x={z2.r + v * z2.d} y={y1 + 14} class="num" class:missn={v !== 0}>{v}</text>
				<path d="M {cx + 10} {y0 + 36} Q {W / 2} {y0 + 70} {z2.r - 10} {y1 - 24}" class="arr" marker-end="url(#arrow-violet)" />
			{/each}
			<SvgTeX x={z2.lab} y={y1 + 6} tex={'0 \\mapsto 0,\\quad 1 \\mapsto 2 = 0'} size={20} color="var(--ink)" w={260} />
		{/if}
	</Svg>
	<div class="read">
		<div class="f"><TeX tex={read[lens].tex} /></div>
		<p>{read[lens].text}</p>
	</div>
</div>

<style>
	.ctl {
		display: flex;
		justify-content: center;
		padding: 0.8rem 1rem 0;
	}
	.axis {
		stroke: var(--ink-ghost);
		stroke-width: 1.5;
	}
	.arr {
		stroke: var(--violet);
		stroke-width: 1.8;
		fill: none;
		opacity: 0.85;
	}
	.arr.half {
		stroke-dasharray: 4 4;
		opacity: 0.7;
	}
	.dot {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.2;
	}
	.dot.half {
		fill: var(--violet);
	}
	.tgt.hit {
		fill: var(--teal);
		filter: url(#glow);
	}
	.tgt.miss {
		fill: rgba(242, 141, 182, 0.15);
		stroke: var(--rose);
		stroke-width: 2;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 15px;
		text-anchor: middle;
		fill: var(--ink-dim) !important;
	}
	.num.missn {
		fill: var(--rose) !important;
	}
	.read {
		text-align: center;
		padding: 0.2rem 1.2rem 1.1rem;
	}
	.f {
		font-size: 1.08rem;
		color: var(--ink-bright);
	}
	.read p {
		margin: 0.4rem auto 0;
		max-width: 36rem;
		font-size: 0.95rem;
		color: var(--ink-dim);
	}
	@container figure (max-width: 560px) {
		.num {
			font-size: 17px;
		}
	}
</style>
