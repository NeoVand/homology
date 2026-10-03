<script lang="ts">
	// Figure 3.2.7 — a chain complex as a conveyor belt
	//     0 → C₂ → C₁ → C₀ → 0,
	// with the boundaries B (teal: what ∂ produces) sitting inside the cycles Z
	// (gold: what the next ∂ crushes to 0). Numbers are dimensions over ℤ/2 for
	// the "house" complex of Figure 3.2.6. On narrow screens the belt runs from
	// top to bottom instead of left to right.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let step = $state(0);
	const labels = ['the chain groups', 'boundaries: what ∂₂ produces', 'cycles: what ∂₁ crushes', '∂∂ = 0: boundaries are cycles', 'the gap between them'];

	let width = $state(800);
	const vert = $derived(width < 560);

	// design coordinates (horizontal layout)
	const Y = 170;
	const C = [
		{ x: 130, k: 2, dim: 2 },
		{ x: 360, k: 1, dim: 7 },
		{ x: 590, k: 0, dim: 5 }
	];
	const RX = 84;
	const RY = 112;
	const S = 0.82; // squeeze along the belt in the vertical layout

	/** map a design point to the current layout */
	const M = (x: number, y: number): [number, number] => (vert ? [y - Y + 165, (x - 130) * S + 112] : [x, y]);
	/** an ellipse centred at a design point with design radii */
	const ell = (cx: number, cy: number, rx: number, ry: number) => {
		const [x, y] = M(cx, cy);
		return vert ? { cx: x, cy: y, rx: ry, ry: rx * S } : { cx: x, cy: y, rx, ry };
	};
	const poly = (pts: [number, number][]) => 'M ' + pts.map(([x, y]) => M(x, y).join(' ')).join(' L ') + ' Z';
	const line = (a: [number, number], b: [number, number]) => `M ${M(...a).join(' ')} L ${M(...b).join(' ')}`;
	const curve = (a: [number, number], c: [number, number], b: [number, number]) => `M ${M(...a).join(' ')} Q ${M(...c).join(' ')} ${M(...b).join(' ')}`;
	const show = (s: number) => step >= s;
</script>

<div class="wrap" bind:clientWidth={width}>
	<Svg
		viewBox={vert ? '0 0 330 590' : '0 30 720 290'}
		maxHeight={vert ? 640 : 380}
		label="Three ovals for the chain groups C2, C1 and C0, joined by arrows labelled boundary. Inside C1, a gold region of cycles contains a teal region of boundaries."
	>
		<defs>
			<radialGradient id="cb-blob" cx="0.4" cy="0.35" r="0.8">
				<stop offset="0" stop-color="#a493ff" stop-opacity="0.2" />
				<stop offset="1" stop-color="#5c4fc0" stop-opacity="0.07" />
			</radialGradient>
			<linearGradient id="cb-teal" x1="0" y1="0" x2={vert ? 0 : 1} y2={vert ? 1 : 0}>
				<stop offset="0" stop-color="#5fd6cf" stop-opacity="0" />
				<stop offset="0.35" stop-color="#5fd6cf" stop-opacity="0.08" />
				<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.3" />
			</linearGradient>
			<linearGradient id="cb-gold" x1="0" y1="0" x2={vert ? 0 : 1} y2={vert ? 1 : 0}>
				<stop offset="0" stop-color="#f2d08f" stop-opacity="0" />
				<stop offset="0.3" stop-color="#f2d08f" stop-opacity="0.2" />
				<stop offset="1" stop-color="#f2d08f" stop-opacity="0.05" />
			</linearGradient>
		</defs>

		<!-- funnels (drawn under the blobs) -->
		{#if show(1)}
			<!-- ∂₂ maps all of C₂ onto B₁ -->
			<path
				d={poly([
					[C[0].x - 10, Y - 92],
					[C[1].x - 22, Y - 30],
					[C[1].x - 22, Y + 30],
					[C[0].x - 10, Y + 92]
				])}
				fill="url(#cb-teal)"
			/>
		{/if}
		{#if show(2)}
			<!-- ∂₁ maps Z₁ to the single point 0 of C₀ -->
			<path
				d={poly([
					[C[1].x - 20, Y - 74],
					[C[2].x - 6, Y - 2],
					[C[2].x - 6, Y + 2],
					[C[1].x - 20, Y + 74]
				])}
				fill="url(#cb-gold)"
			/>
		{/if}

		<!-- the chain groups -->
		{#each C as c (c.k)}
			{@const e = ell(c.x, Y, RX, RY)}
			{@const lab = M(c.x, Y - RY - 18)}
			{@const dl = M(c.x, Y + RY + 18)}
			<ellipse cx={e.cx} cy={e.cy} rx={e.rx} ry={e.ry} fill="url(#cb-blob)" class="blob" />
			<SvgTeX x={lab[0]} y={lab[1]} tex={String.raw`\chn{C_${c.k}}`} size={20} />
			<SvgTeX
				x={vert ? lab[0] : dl[0]}
				y={vert ? lab[1] + 26 : dl[1]}
				tex={String.raw`\dim = ${c.dim}`}
				size={vert ? 12 : 14}
				color="var(--ink-faint)"
				w={vert ? 70 : 120}
			/>
		{/each}

		<!-- arrows between the groups -->
		<path d={line([26, Y], [C[0].x - RX - 6, Y])} class="arrow" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={M(12, Y)[0]} y={M(12, Y)[1]} tex="0" size={16} color="var(--ink-dim)" w={20} />
		{#each [0, 1] as i (i)}
			{@const lp = M((C[i].x + C[i + 1].x) / 2, Y - RY - 26)}
			<path
				d={curve([C[i].x + RX + 4, Y - RY + 8], [(C[i].x + C[i + 1].x) / 2, Y - RY - 22], [C[i + 1].x - RX - 4, Y - RY + 8])}
				class="arrow"
				marker-end="url(#arrow-ivory)"
			/>
			<SvgTeX x={lp[0] - (vert ? 6 : 0)} y={lp[1]} tex={String.raw`\partial_${2 - i}`} size={17} color="var(--ink)" w={40} />
		{/each}
		<path d={line([C[2].x + RX + 4, Y], [700, Y])} class="arrow" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={M(712, Y)[0]} y={M(712, Y)[1]} tex="0" size={16} color="var(--ink-dim)" w={20} />

		<!-- C₂: Z₂ = 0 here -->
		{#if show(2)}
			{@const p = M(C[0].x, Y + 74)}
			<circle cx={p[0]} cy={p[1]} r="5" class="zero" />
			<SvgTeX x={p[0] + (vert ? -64 : 10)} y={p[1] + (vert ? 18 : 0)} tex={String.raw`\cyc{Z_2} = 0`} size={13} w={90} anchor="start" />
		{/if}

		<!-- C₁: Z₁ ⊇ B₁ -->
		{#if show(2)}
			{@const z = ell(C[1].x, Y, 62, 80)}
			{@const zl = M(C[1].x + 40, Y - 66)}
			<ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} class="zset" class:gap={show(4)} />
			<SvgTeX x={zl[0]} y={zl[1]} tex={String.raw`\cyc{Z_1}`} size={16} w={40} />
		{/if}
		{#if show(1)}
			{@const b = ell(C[1].x, Y, 34, 44)}
			<ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} class="bset" />
			<SvgTeX x={b.cx} y={b.cy} tex={String.raw`\bdy{B_1}`} size={16} w={40} />
		{/if}
		{#if show(4)}
			{@const h = M(C[1].x, Y + 60)}
			<SvgTeX x={h[0]} y={h[1]} tex={String.raw`\hole{\text{holes}}`} size={13} w={60} />
		{/if}

		<!-- C₀: Z₀ = C₀ ⊇ B₀; the point 0 -->
		{#if show(2)}
			{@const o = M(C[2].x, Y)}
			<circle cx={o[0]} cy={o[1]} r="5.5" class="zero" />
			<SvgTeX x={o[0] + 14} y={o[1] - 14} tex="0" size={13} color="var(--gold-bright)" w={20} />
		{/if}
		{#if show(3)}
			{@const z = ell(C[2].x, Y, RX - 6, RY - 6)}
			{@const zl = vert ? ([z.cx + 72, z.cy + 34] as [number, number]) : M(C[2].x + 2, Y + 76)}
			{@const b = ell(C[2].x, Y - 4, 54, 62)}
			{@const bl = M(C[2].x - 22, Y - 36)}
			<ellipse cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry} class="zset thin" />
			<SvgTeX x={zl[0]} y={zl[1]} tex={String.raw`\cyc{Z_0} = C_0`} size={13} w={80} />
			<ellipse cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} class="bset faint" />
			<SvgTeX x={bl[0]} y={bl[1]} tex={String.raw`\bdy{B_0}`} size={14} w={40} />
		{/if}
	</Svg>

	<div class="readout ui" aria-live="polite">
		{#if step === 0}
			<p>
				The chain groups of the house of Figure 3.2.6 (mod 2), joined by boundary maps. Chains flow {vert ? 'downwards' : 'from left to right'}; each \(\partial\)
				lowers the dimension by one, and the belt ends in \(0\).
			</p>
		{:else if step === 1}
			<p>
				Everything that \(\partial_2\) produces lands in a part of \(C_1\): the <b class="t">boundaries</b> <TeX tex={String.raw`B_1 = \im \partial_2`} />, here of
				dimension \(2\) (the rims of the two triangles generate them).
			</p>
		{:else if step === 2}
			<p>
				The <b class="g">cycles</b> <TeX tex={String.raw`Z_1 = \ker\partial_1`} /> are the 1-chains that \(\partial_1\) crushes to \(0\) — here of dimension
				\(7 - 4 = 3\). In \(C_2\), only \(0\) is crushed: \(Z_2 = 0\).
			</p>
		{:else if step === 3}
			<p>
				Because \(\partial_1 \circ \partial_2 = 0\), every boundary is crushed too: <TeX tex={String.raw`\bdy{B_1} \subseteq \cyc{Z_1}`} />. The same happens in
				every dimension; in \(C_0\) everything is a cycle, since \(\partial_0 = 0\).
			</p>
		{:else}
			<p>
				The rose ring is the gap: cycles that are not boundaries. Its “size” is <TeX tex={String.raw`\dim Z_1 - \dim B_1 = 3 - 2 = \hole{1}`} /> — the one hole
				of the house, the empty triangle on top. Measuring this gap exactly is the job of <b>homology</b>, in the next chapter.
			</p>
		{/if}
	</div>

	<Controls>
		<StepControls bind:step count={5} {labels} interval={3200} />
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.blob {
		stroke: rgba(164, 147, 255, 0.55);
		stroke-width: 1.4;
	}
	.arrow {
		fill: none;
		stroke: var(--ink-dim);
		stroke-width: 1.5;
	}
	.zset {
		fill: rgba(242, 208, 143, 0.08);
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.zset.gap {
		fill: rgba(242, 141, 182, 0.2);
		stroke: var(--gold-bright);
	}
	.zset.thin {
		fill: none;
		stroke-dasharray: 5 5;
		stroke-width: 1.4;
	}
	.bset {
		fill: rgba(95, 214, 207, 0.3);
		stroke: var(--teal);
		stroke-width: 2;
		filter: drop-shadow(0 0 6px rgba(95, 214, 207, 0.45));
	}
	.bset.faint {
		fill: rgba(95, 214, 207, 0.12);
		stroke-width: 1.4;
	}
	.zero {
		fill: var(--gold-bright);
		filter: drop-shadow(0 0 5px rgba(242, 208, 143, 0.8));
	}
	.readout {
		padding: 0.4rem 1.2rem 0.8rem;
		font-size: 0.88rem;
		color: var(--ink-dim);
		min-height: 4.4rem;
	}
	.readout p {
		margin: 0;
		line-height: 1.6;
	}
	b.t {
		color: var(--teal);
	}
	b.g {
		color: var(--gold-bright);
	}
	.readout b {
		color: var(--ink-bright);
	}
</style>
