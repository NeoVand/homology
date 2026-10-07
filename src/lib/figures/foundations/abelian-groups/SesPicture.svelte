<script lang="ts">
	// The short exact sequence 0 → ℤ --(×n)--> ℤ --(mod n)--> ℤ/n → 0, drawn as
	// three columns: what ×n produces (teal) is exactly what "mod n" kills.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { residueColor, mod, fmtInt } from '../groups/zn';

	let n = $state(3);
	let cw = $state(640);
	const K = 9; // middle column shows −K … K
	const gap = 17;
	const yMid = 190;
	const yOf = (j: number) => yMid - j * gap;
	const left = $derived(Array.from({ length: 2 * Math.floor(K / n) + 1 }, (_, i) => i - Math.floor(K / n)));
	const mid = Array.from({ length: 2 * K + 1 }, (_, i) => i - K);

	const narrow = $derived(cw < 520);
	const W = $derived(narrow ? 372 : 600);
	const xL = $derived(narrow ? 74 : 120);
	const xM = $derived(narrow ? 196 : 300);
	const xR = $derived(narrow ? 304 : 480);
	const z0 = $derived(narrow ? 12 : 30);
	const z1 = $derived(W - z0);
	const bend = $derived(narrow ? 46 : 90);
	const rY = (r: number) => yMid - (r - (n - 1) / 2) * 34;
</script>

<div class="ses" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {W} 392" maxHeight={430} label="The short exact sequence zero to Z to Z to Z mod n to zero, drawn as three columns of dots with arrows">
		<!-- end zeros -->
		<circle cx={z0} cy={yMid} r="5" fill="#fbf6e8" />
		<line x1={z0 + 10} y1={yMid} x2={xL - 30} y2={yMid} stroke="rgba(235,229,213,0.4)" stroke-width="1.3" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={z0} y={yMid + 22} tex="0" size={15} color="var(--ink-dim)" w={30} h={22} />
		<line x1={xR + 32} y1={yMid} x2={z1 - 10} y2={yMid} stroke="rgba(235,229,213,0.4)" stroke-width="1.3" marker-end="url(#arrow-ivory)" />
		<circle cx={z1} cy={yMid} r="5" fill="#fbf6e8" />
		<SvgTeX x={z1} y={yMid + 22} tex="0" size={15} color="var(--ink-dim)" w={30} h={22} />

		<!-- ×n arrows (they stop short of the middle column's labels) -->
		{#each left as k (k)}
			<path
				d="M {xL + 8} {yOf(k)} C {xL + bend} {yOf(k)}, {xM - bend - 20} {yOf(n * k)}, {xM - 34} {yOf(n * k)}"
				fill="none"
				stroke="#5fd6cf"
				stroke-opacity="0.7"
				stroke-width="1.4"
				marker-end="url(#arrow-teal)"
			/>
		{/each}
		<!-- reduction arrows -->
		{#each mid as j (j)}
			{@const r = mod(j, n)}
			<path
				d="M {xM + 9} {yOf(j)} C {xM + bend} {yOf(j)}, {xR - bend} {rY(r)}, {xR - 12} {rY(r)}"
				fill="none"
				stroke={residueColor(r, n)}
				stroke-opacity={r === 0 ? 0.8 : 0.32}
				stroke-width={r === 0 ? 1.5 : 1.1}
			/>
		{/each}

		<!-- columns -->
		{#each left as k (k)}
			<circle cx={xL} cy={yOf(k)} r="5.5" fill="#cfc9e8" />
			<text x={xL - 12} y={yOf(k) + 4} text-anchor="end" class="num">{fmtInt(k)}</text>
		{/each}
		{#each mid as j (j)}
			{@const isIm = mod(j, n) === 0}
			<circle cx={xM} cy={yOf(j)} r={isIm ? 6.5 : 4.5} fill={isIm ? '#5fd6cf' : residueColor(mod(j, n), n, 70, 0.08)} stroke={isIm ? '#f2d08f' : 'none'} stroke-width="1.6" />
			<text x={xM - 12} y={yOf(j) + 4} text-anchor="end" class="num" class:hi={isIm}>{fmtInt(j)}</text>
		{/each}
		{#each Array.from({ length: n }, (_, r) => r) as r (r)}
			<circle cx={xR} cy={rY(r)} r="11" fill={residueColor(r, n)} stroke="#0b1020" stroke-width="1" filter={r === 0 ? 'url(#glow)' : undefined} />
			<text x={xR + 18} y={rY(r) + 5} class="num big">{r}</text>
		{/each}

		<!-- labels -->
		<SvgTeX x={xL} y={370} tex={'\\mathbb{Z}'} size={18} color="var(--ink-bright)" w={40} h={26} />
		<SvgTeX x={xM} y={370} tex={'\\mathbb{Z}'} size={18} color="var(--ink-bright)" w={40} h={26} />
		<SvgTeX x={xR} y={370} tex={`\\mathbb{Z}/${n}`} size={18} color="var(--ink-bright)" w={70} h={26} />
		<SvgTeX x={(xL + xM) / 2} y={22} tex={`\\times ${n}`} size={16} color="var(--teal)" w={60} h={24} />
		<SvgTeX x={(xM + xR) / 2} y={22} tex={`\\text{mod } ${n}`} size={16} color="var(--gold-bright)" w={80} h={24} />
	</Svg>
</div>
<Controls align="center">
	<span class="ui lbl">n</span>
	<Segmented bind:value={n} options={[2, 3, 4].map((v) => ({ value: v, label: String(v) }))} label="n" />
</Controls>

<style>
	.ses {
		padding: 0.6rem 0.8rem 0.4rem;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 10.5px !important;
		fill: var(--ink-faint) !important;
	}
	.num.hi {
		fill: var(--teal) !important;
		font-weight: 650;
	}
	.num.big {
		font-size: 13px !important;
		fill: var(--ink-dim) !important;
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	/* phones: the columns shrink, so their numbers grow */
	@container figure (max-width: 34rem) {
		.num {
			font-size: 12.5px !important;
		}
		.num.big {
			font-size: 15px !important;
		}
	}
</style>
