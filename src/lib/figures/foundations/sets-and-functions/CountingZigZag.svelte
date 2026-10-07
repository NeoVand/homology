<script lang="ts">
	// Counting the integers: the zig-zag 0, 1, −1, 2, −2, … pairs ℤ with ℕ.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import { zigzag } from './maps';

	const N = 9; // list positions 0..8
	const X0 = 210;
	const DX = 44;
	const Y = 150;
	const xOf = (z: number) => X0 + z * DX;
	const steps = Array.from({ length: N - 1 }, (_, k) => [zigzag(k), zigzag(k + 1)] as const);
	function hop(a: number, b: number) {
		const rx = Math.abs(xOf(b) - xOf(a)) / 2;
		const ry = rx * 0.46;
		// above the line whichever way we travel
		const sweep = b > a ? 1 : 0;
		return `M ${xOf(a)} ${Y - 12} A ${rx} ${ry} 0 0 ${sweep} ${xOf(b)} ${Y - 12}`;
	}
	// on phones the strip is drawn at about 80%: the key goes on two lines, in larger type
	let cw = $state(800);
	const narrow = $derived(cw < 520);
</script>

<div bind:clientWidth={cw}>

	<Svg viewBox="0 0 420 228" maxHeight={300} label="The integers listed in the order 0, 1, minus 1, 2, minus 2, and so on, by hops along the number line">
		<line x1="12" y1={Y} x2="408" y2={Y} class="line" />
		<text x="14" y={Y + 5} class="dots">…</text>
		<text x="406" y={Y + 5} class="dots end">…</text>
		{#each steps as [a, b], k (k)}
			<path d={hop(a, b)} class="hop" style="opacity:{1 - k * 0.075}" marker-end="url(#arrow-gold)" />
		{/each}
		{#each Array.from({ length: N }, (_, k) => zigzag(k)) as z, k (z)}
			<circle cx={xOf(z)} cy={Y} r="11.5" class="badge" />
			<text x={xOf(z)} y={Y + 4} class="bl">{k}</text>
			<text x={xOf(z)} y={Y + 32} class="zl">{z < 0 ? '−' + -z : z}</text>
		{/each}
		{#if narrow}
			<SvgTeX x={210} y={14} tex={String.raw`\text{gold: position in the list}`} size={16} color="var(--ink-dim)" w={400} h={24} />
			<SvgTeX x={210} y={36} tex={String.raw`\text{below: the integer}`} size={16} color="var(--ink-dim)" w={400} h={24} />
		{:else}
			<SvgTeX x={210} y={18} tex={String.raw`\text{gold: position in the list}\qquad\text{below: the integer}`} size={13} color="var(--ink-dim)" w={400} h={24} />
		{/if}
		<SvgTeX x={210} y={212} tex={String.raw`0\mapsto 0,\ \ 1\mapsto 1,\ \ 2\mapsto -1,\ \ 3\mapsto 2,\ \ 4\mapsto -2,\ \ \dots`} size={narrow ? 17 : 14} color="var(--gold-bright)" w={410} h={24} />
	</Svg>
</div>

<style>
	.line {
		stroke: rgba(200, 192, 170, 0.5);
		stroke-width: 1.4;
	}
	.dots {
		font-size: 16px !important;
		fill: var(--ink-faint) !important;
	}
	.dots.end {
		text-anchor: end;
	}
	.hop {
		fill: none;
		stroke: var(--gold);
		stroke-width: 1.6;
	}
	.badge {
		fill: #f2d08f;
		stroke: #fff6dc;
		stroke-width: 1;
		filter: drop-shadow(0 0 5px rgba(242, 208, 143, 0.6));
	}
	.bl {
		font-family: var(--font-ui);
		font-size: 11px !important;
		font-weight: 700;
		fill: #120d05 !important;
		text-anchor: middle;
	}
	.zl {
		font-family: var(--font-ui);
		font-size: 12.5px !important;
		font-weight: 600;
		fill: var(--ink) !important;
		text-anchor: middle;
	}
	/* phones: the strip shrinks, so its numbers grow */
	@container figure (max-width: 34rem) {
		.bl {
			font-size: 13.5px !important;
			transform: translateY(0.6px);
		}
		.zl {
			font-size: 14.5px !important;
		}
	}
</style>
