<script lang="ts">
	// Figure (static): Mayer–Vietoris for the circle. Two overlapping arcs U, V
	// cover S¹; their intersection is two separate arcs W₁, W₂. The exact sequence
	// of locally constant functions leaves exactly one dimension over: H¹(S¹) ≅ ℝ.
	// The picture and the sequence sit side by side, and stack in a narrow figure.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	const cx = 155;
	const cy = 150;
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

	// the sequence, read downwards: a group and its size, then the map to the next group
	type Row = { group: string; size?: string; tone?: string } | { map: string; what?: string };
	const rows: Row[] = [
		{ group: '0' },
		{ map: '' },
		{ group: String.raw`H^0(S^1)`, size: String.raw`\cong\R` },
		{ map: '', what: 'restrict to U and to V' },
		{ group: String.raw`H^0(U)\oplus H^0(V)`, size: String.raw`\cong\R^2` },
		{ map: String.raw`(a,\,b)\mapsto(b-a,\ b-a)`, what: 'image: the diagonal, a line' },
		{ group: String.raw`H^0(U\cap V)`, size: String.raw`\cong\R^2` },
		{ map: String.raw`\delta`, what: 'kills the diagonal, and is onto' },
		{ group: String.raw`H^1(S^1)`, size: String.raw`\cong\R^2/\text{diagonal}\cong\R`, tone: 'rose' },
		{ map: '' },
		{ group: String.raw`H^1(U)\oplus H^1(V)`, size: '= 0' }
	];
</script>

<div class="mv">
	<div class="pic">
		<Svg viewBox="0 0 310 300" maxHeight={320} label="A circle covered by two overlapping arcs U and V whose intersection has two pieces, W1 and W2.">
			<circle {cx} {cy} r={R} class="circle" />
			<path d={U} class="u" />
			<path d={V} class="v" />
			<path d={W1} class="w" />
			<path d={W2} class="w" />
			<SvgTeX x={cx} y={cy - R - 32} tex="U" color="var(--gold-bright)" size={19} w={30} h={26} />
			<SvgTeX x={cx} y={cy + R - 36} tex="V" color="var(--teal)" size={19} w={30} h={26} />
			<SvgTeX x={pt(R + 30, 180)[0] - 4} y={pt(R + 30, 180)[1]} tex={String.raw`W_1`} color="var(--violet)" size={17} w={40} h={26} />
			<SvgTeX x={pt(R + 30, 0)[0] + 4} y={pt(R + 30, 0)[1]} tex={String.raw`W_2`} color="var(--violet)" size={17} w={40} h={26} />
			<SvgTeX x={cx} y={284} tex={String.raw`U\cap V = W_1 \sqcup W_2`} color="var(--ink-dim)" size={15} w={220} h={24} />
		</Svg>
	</div>
	<div class="seq" role="list" aria-label="The Mayer–Vietoris sequence of the circle">
		{#each rows as r, i (i)}
			{#if 'group' in r}
				<div class="g {r.tone ?? ''}" role="listitem"><TeX tex={r.group} /></div>
				<div class="s {r.tone ?? ''}">{#if r.size}<TeX tex={r.size} />{/if}</div>
			{:else}
				<div class="a"><TeX tex={String.raw`\Big\downarrow`} /></div>
				<div class="what">{#if r.map}<span class="m"><TeX tex={r.map} /></span>{/if}{#if r.what}<span class="ui">{r.what}</span>{/if}</div>
			{/if}
		{/each}
	</div>
	<p class="sum"><TeX tex={String.raw`\dim H^1_{\dR}(S^1) = 2 - 1 = 1`} /></p>
</div>

<style>
	.mv {
		display: grid;
		grid-template-columns: minmax(0, 20rem) minmax(0, 1fr);
		align-items: center;
		gap: 0.6rem 1.6rem;
		padding: 0.4rem 1.2rem 0.2rem;
	}
	.seq {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 1rem;
		align-items: center;
		font-size: 1.02rem;
	}
	.g {
		justify-self: center;
		color: var(--ink-bright);
	}
	.s {
		color: var(--gold-bright);
	}
	.g.rose,
	.s.rose {
		color: var(--rose);
	}
	.a {
		justify-self: center;
		color: var(--ink-faint);
		line-height: 1.1;
	}
	.what {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.1rem 0.6rem;
	}
	.m {
		color: var(--violet);
		font-size: 0.92rem;
	}
	.what .ui {
		font-size: 0.74rem;
		color: var(--ink-faint);
		letter-spacing: 0.02em;
	}
	.sum {
		grid-column: 1 / -1;
		margin: 0.4rem 0 0.6rem;
		text-align: center;
		color: var(--rose);
		font-size: 1.02rem;
		overflow-x: auto;
	}
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
	@container figure (max-width: 640px) {
		.mv {
			grid-template-columns: minmax(0, 1fr);
		}
		.pic {
			max-width: 18rem;
			margin: 0 auto;
			width: 100%;
		}
	}
</style>
