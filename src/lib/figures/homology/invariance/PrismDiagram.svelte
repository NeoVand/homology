<script lang="ts">
	// The prism operator, step by step: the prism over an edge is cut into two
	// triangles whose boundary is "top − bottom − sides"; over a cycle the sides
	// cancel, so the top and bottom cycles are homologous.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';

	type Pt = [number, number];
	let step = $state(0);
	const labels = [
		'The prism over an edge',
		'Cut it into two triangles',
		'Its boundary',
		'The prism over a cycle',
		'Shared sides cancel',
		'Top and bottom are homologous'
	];
	const captions = [
		String.raw`\sigma\times I:\ \text{bottom } f_\#\sigma,\ \text{top } g_\#\sigma`,
		String.raw`P(\sigma) = [v_0,w_0,w_1] - [v_0,v_1,w_1]`,
		String.raw`\partial P(\sigma) = g_\#\sigma - f_\#\sigma - P(\partial\sigma)`,
		String.raw`z = [a,b]+[b,c]+[c,a],\quad P(z) = \text{three prisms}`,
		String.raw`P(\partial z) = P(0) = 0`,
		String.raw`\partial P(z) = g_\#z - f_\#z`
	];

	// ── panel A: the square prism over one edge ──
	const v0: Pt = [110, 260];
	const v1: Pt = [310, 260];
	const w0: Pt = [110, 90];
	const w1: Pt = [310, 90];

	// ── panel B: an annulus = prism over a triangle loop ──
	const C: Pt = [210, 182];
	const ang = [210, 330, 90].map((d) => (d * Math.PI) / 180);
	const inner: Pt[] = ang.map((t) => [C[0] + 52 * Math.cos(t), C[1] - 52 * Math.sin(t)]);
	const outer: Pt[] = ang.map((t) => [C[0] + 142 * Math.cos(t), C[1] - 142 * Math.sin(t)]);

	const lerp = (a: Pt, b: Pt, s: number): Pt => [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
	function chevron(a: Pt, b: Pt, at = 0.5, size = 7): string {
		const m = lerp(a, b, at);
		const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const ux = (b[0] - a[0]) / len;
		const uy = (b[1] - a[1]) / len;
		return `M ${m[0] - ux * size - uy * size * 0.8} ${m[1] - uy * size + ux * size * 0.8} L ${m[0] + ux * size * 0.6} ${m[1] + uy * size * 0.6} L ${m[0] - ux * size + uy * size * 0.8} ${m[1] - uy * size - ux * size * 0.8}`;
	}
	/** a small circular arrow showing a triangle's orientation */
	function swirl(c: Pt, r: number, ccw: boolean): string {
		const a0 = ccw ? 200 : -20;
		const a1 = ccw ? 470 : -290;
		const pts: string[] = [];
		const n = 24;
		for (let i = 0; i <= n; i++) {
			const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
			pts.push(`${(c[0] + r * Math.cos(t)).toFixed(1)},${(c[1] - r * Math.sin(t)).toFixed(1)}`);
		}
		return 'M ' + pts.join(' L ');
	}
	const centroid = (...p: Pt[]): Pt => [p.reduce((s, q) => s + q[0], 0) / p.length, p.reduce((s, q) => s + q[1], 0) / p.length];
	const tA = centroid(v0, w0, w1);
	const tB = centroid(v0, v1, w1);
	const showA = $derived(step <= 2);
</script>

<div class="prism">
	<Svg viewBox="0 0 420 340" maxHeight={380} label="The prism operator: a square cut into two triangles, then an annulus between two triangles">
		<!-- ───────── panel A ───────── -->
		<g class="layer" class:show={showA}>
			<polygon points="{v0} {v1} {w1} {w0}" class="prismfill" />
			{#if step >= 1}
				<polygon points="{v0} {w0} {w1}" class="tri a" />
				<polygon points="{v0} {v1} {w1}" class="tri b" />
				<path d={swirl(tA, 20, false)} class="swirl plus" marker-end="url(#arrow-green)" />
				<path d={swirl(tB, 20, false)} class="swirl minus" marker-end="url(#arrow-rose)" />
				<SvgTeX x={tA[0]} y={tA[1]} tex={'+'} size={18} color="var(--green)" w={24} h={24} />
				<SvgTeX x={tB[0]} y={tB[1]} tex={'-'} size={18} color="var(--rose)" w={24} h={24} />
				<!-- the diagonal: used twice, in opposite directions -->
				<line x1={v0[0]} y1={v0[1]} x2={w1[0]} y2={w1[1]} class="diag" class:gone={step >= 2} />
			{/if}
			<!-- bottom f∘σ and top g∘σ -->
			<line x1={v0[0]} y1={v0[1]} x2={v1[0]} y2={v1[1]} class="edge gold" />
			<path d={chevron(v0, v1)} class="chev gold" />
			<line x1={w0[0]} y1={w0[1]} x2={w1[0]} y2={w1[1]} class="edge teal" />
			<path d={chevron(w0, w1)} class="chev teal" />
			<!-- sides: the paths traced by the endpoints -->
			<line x1={v0[0]} y1={v0[1]} x2={w0[0]} y2={w0[1]} class="edge side" />
			<line x1={v1[0]} y1={v1[1]} x2={w1[0]} y2={w1[1]} class="edge side" />
			<path d={chevron(v0, w0)} class="chev side" />
			<path d={chevron(v1, w1)} class="chev side" />
			{#each [v0, v1, w0, w1] as p, i (i)}
				<circle cx={p[0]} cy={p[1]} r="6" class="vdot" />
			{/each}
			<SvgTeX x={v0[0] - 22} y={v0[1] + 14} tex={'v_0'} size={16} color="var(--ink)" w={36} h={26} />
			<SvgTeX x={v1[0] + 22} y={v1[1] + 14} tex={'v_1'} size={16} color="var(--ink)" w={36} h={26} />
			<SvgTeX x={w0[0] - 22} y={w0[1] - 12} tex={'w_0'} size={16} color="var(--ink)" w={36} h={26} />
			<SvgTeX x={w1[0] + 22} y={w1[1] - 12} tex={'w_1'} size={16} color="var(--ink)" w={36} h={26} />
			<SvgTeX x={210} y={v0[1] + 26} tex={step >= 2 ? '-\\,f_\\#\\sigma' : 'f_\\#\\sigma\\ \\text{(time 0)}'} size={16} color="var(--gold-bright)" w={160} h={28} />
			<SvgTeX x={210} y={w0[1] - 26} tex={step >= 2 ? '+\\,g_\\#\\sigma' : 'g_\\#\\sigma\\ \\text{(time 1)}'} size={16} color="var(--teal)" w={160} h={28} />
			<SvgTeX x={v0[0] - 40} y={(v0[1] + w0[1]) / 2} tex={step >= 2 ? '+P(v_0)' : 'P(v_0)'} size={15} color="var(--violet)" w={70} h={26} />
			<SvgTeX x={v1[0] + 40} y={(v1[1] + w1[1]) / 2} tex={step >= 2 ? '-P(v_1)' : 'P(v_1)'} size={15} color="var(--violet)" w={70} h={26} />
		</g>

		<!-- ───────── panel B ───────── -->
		<g class="layer" class:show={!showA}>
			{#each [0, 1, 2] as i (i)}
				{@const j = (i + 1) % 3}
				<polygon points="{inner[i]} {inner[j]} {outer[j]} {outer[i]}" class="trap" />
			{/each}
			<!-- radial sides P(a), P(b), P(c) -->
			{#each [0, 1, 2] as i (i)}
				{@const mid = lerp(inner[i], outer[i], 0.5)}
				{@const nx = -(outer[i][1] - inner[i][1])}
				{@const ny = outer[i][0] - inner[i][0]}
				{@const L = Math.hypot(nx, ny)}
				<g class="radial" class:cancel={step >= 4} class:gone={step >= 5}>
					<line x1={inner[i][0]} y1={inner[i][1]} x2={outer[i][0]} y2={outer[i][1]} class="edge side" />
					{#if step >= 4}
						<SvgTeX x={mid[0] + (nx / L) * 16} y={mid[1] + (ny / L) * 16} tex={'+'} size={17} color="var(--green)" w={22} h={22} />
						<SvgTeX x={mid[0] - (nx / L) * 16} y={mid[1] - (ny / L) * 16} tex={'-'} size={17} color="var(--rose)" w={22} h={22} />
					{/if}
				</g>
			{/each}
			{#each [0, 1, 2] as i (i)}
				{@const j = (i + 1) % 3}
				<line x1={inner[i][0]} y1={inner[i][1]} x2={inner[j][0]} y2={inner[j][1]} class="edge gold" class:glow={step >= 5} />
				<path d={chevron(inner[i], inner[j])} class="chev gold" />
				<line x1={outer[i][0]} y1={outer[i][1]} x2={outer[j][0]} y2={outer[j][1]} class="edge teal" class:glow={step >= 5} />
				<path d={chevron(outer[i], outer[j])} class="chev teal" />
			{/each}
			{#each inner as p, i (i)}
				<circle cx={p[0]} cy={p[1]} r="5" class="vdot" />
				<circle cx={outer[i][0]} cy={outer[i][1]} r="5" class="vdot" />
			{/each}
			<SvgTeX x={C[0]} y={C[1] + 6} tex={'f_\\# z'} size={16} color="var(--gold-bright)" w={60} h={26} />
			<SvgTeX x={C[0]} y={outer[2][1] - 18} tex={'g_\\# z'} size={16} color="var(--teal)" w={60} h={26} />
			<SvgTeX x={C[0] + 112} y={C[1] - 70} tex={'P(z)'} size={16} color="var(--violet)" w={60} h={26} />
		</g>
	</Svg>
	<div class="formula"><TeX tex={captions[step]} /></div>
	<Controls>
		<StepControls bind:step count={labels.length} {labels} interval={2600} />
	</Controls>
</div>

<style>
	.layer {
		opacity: 0;
		transition: opacity 0.6s var(--ease);
		pointer-events: none;
	}
	.layer.show {
		opacity: 1;
	}
	.prismfill {
		fill: rgba(164, 147, 255, 0.08);
		stroke: none;
	}
	.tri {
		stroke: none;
		transition: fill 0.4s;
	}
	.tri.a {
		fill: rgba(132, 217, 162, 0.1);
	}
	.tri.b {
		fill: rgba(242, 141, 182, 0.1);
	}
	.trap {
		fill: rgba(164, 147, 255, 0.12);
		stroke: rgba(164, 147, 255, 0.25);
		stroke-width: 1;
	}
	.edge {
		stroke-width: 3;
		stroke-linecap: round;
		transition:
			opacity 0.5s,
			stroke-width 0.4s;
	}
	.edge.gold {
		stroke: var(--gold-bright);
	}
	.edge.teal {
		stroke: var(--teal);
	}
	.edge.glow {
		stroke-width: 4.5;
	}
	.edge.gold.glow {
		filter: drop-shadow(0 0 4px rgba(244, 215, 156, 0.85));
	}
	.edge.teal.glow {
		filter: drop-shadow(0 0 4px rgba(95, 214, 207, 0.85));
	}
	.edge.side {
		stroke: var(--violet);
		stroke-width: 2.4;
		stroke-dasharray: 6 5;
	}
	.chev {
		fill: none;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.chev.gold {
		stroke: var(--gold-bright);
	}
	.chev.teal {
		stroke: var(--teal);
	}
	.chev.side {
		stroke: var(--violet);
	}
	.diag {
		stroke: var(--ink-dim);
		stroke-width: 2;
		stroke-dasharray: 3 4;
		transition: opacity 0.8s;
	}
	.diag.gone {
		opacity: 0.12;
	}
	.swirl {
		fill: none;
		stroke-width: 1.6;
	}
	.swirl.plus {
		stroke: var(--green);
	}
	.swirl.minus {
		stroke: var(--rose);
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.2;
	}
	.radial {
		transition: opacity 0.8s;
	}
	.radial.cancel .edge.side {
		stroke: var(--ink-faint);
	}
	.radial.gone {
		opacity: 0.15;
	}
	.formula {
		text-align: center;
		padding: 0 1rem 0.6rem;
		min-height: 2.2rem;
		font-size: 1.02rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
</style>
