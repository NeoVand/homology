<script lang="ts">
	// Venn diagrams with live set notation. Regions are drawn exactly with
	// clip-paths (inside a circle) and masks (outside a circle).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { renderMathInText, tex } from '$lib/katex/render';

	type P3 = [boolean, boolean, boolean];
	interface Expr {
		id: string;
		tex: string;
		pred: (a: boolean, b: boolean, c: boolean) => boolean;
		/** set-builder reading */
		def?: string;
		three?: boolean;
	}

	let three = $state(false);
	let exprId = $state('union');

	const W = 440;
	const H = 330;
	const U = 12;
	const A = new Set([2, 4, 6, 8, 10, 12]);
	const B = new Set([3, 6, 9, 12]);
	const C = new Set([1, 2, 3, 4, 5]);

	const circles = $derived(
		three
			? { A: [178, 140, 96], B: [262, 140, 96], C: [220, 214, 96] }
			: { A: [175, 165, 104], B: [265, 165, 104], C: [220, 214, 0] }
	);

	// element positions, chosen by hand to sit inside their regions
	const pos2: Record<number, [number, number]> = {
		2: [110, 122],
		4: [98, 166],
		8: [112, 210],
		10: [146, 166],
		3: [330, 140],
		9: [330, 190],
		6: [220, 140],
		12: [220, 190],
		1: [44, 40],
		5: [396, 40],
		7: [44, 292],
		11: [396, 292]
	};
	const pos3: Record<number, [number, number]> = {
		8: [124, 96],
		10: [112, 142],
		9: [318, 116],
		1: [196, 276],
		5: [244, 276],
		6: [220, 64],
		12: [220, 100],
		2: [150, 202],
		4: [172, 228],
		3: [290, 202],
		7: [40, 296],
		11: [400, 296]
	};

	const exprs: Expr[] = [
		{ id: 'union', tex: String.raw`A\cup B`, pred: (a, b) => a || b, def: String.raw`\setb{x}{x\in A \text{ or } x\in B}` },
		{ id: 'inter', tex: String.raw`A\cap B`, pred: (a, b) => a && b, def: String.raw`\setb{x}{x\in A \text{ and } x\in B}` },
		{ id: 'AminusB', tex: String.raw`A\setminus B`, pred: (a, b) => a && !b, def: String.raw`\setb{x}{x\in A \text{ and } x\notin B}` },
		{ id: 'BminusA', tex: String.raw`B\setminus A`, pred: (a, b) => b && !a, def: String.raw`\setb{x}{x\in B \text{ and } x\notin A}` },
		{ id: 'Ac', tex: String.raw`A^{c}`, pred: (a) => !a, def: String.raw`\setb{x\in U}{x\notin A}` },
		{ id: 'unionc', tex: String.raw`(A\cup B)^{c}`, pred: (a, b) => !(a || b) },
		{ id: 'demorgan', tex: String.raw`A^{c}\cap B^{c}`, pred: (a, b) => !a && !b },
		{ id: 'dist1', tex: String.raw`A\cap(B\cup C)`, pred: (a, b, c) => a && (b || c), three: true },
		{ id: 'dist2', tex: String.raw`(A\cap B)\cup(A\cap C)`, pred: (a, b, c) => (a && b) || (a && c), three: true },
		{ id: 'triple', tex: String.raw`A\cap B\cap C`, pred: (a, b, c) => a && b && c, three: true },
		{ id: 'abc', tex: String.raw`(A\cap B)\setminus C`, pred: (a, b, c) => a && b && !c, three: true }
	];
	const visible = $derived(exprs.filter((e) => three || !e.three));
	const expr = $derived(visible.find((e) => e.id === exprId) ?? visible[0]);

	const regions = $derived.by(() => {
		const out: { key: string; p: P3 }[] = [];
		for (const a of [true, false])
			for (const b of [true, false])
				for (const c of three ? [true, false] : [false]) out.push({ key: `${+a}${+b}${+c}`, p: [a, b, c] });
		return out;
	});

	function member(x: number): P3 {
		return [A.has(x), B.has(x), three && C.has(x)];
	}
	const inside = $derived(
		Array.from({ length: U }, (_, i) => i + 1).filter((x) => {
			const [a, b, c] = member(x);
			return expr.pred(a, b, c);
		})
	);

	const readout = $derived.by(() => {
		const list = inside.length ? String.raw`\{${inside.join(',')}\}` : String.raw`\varnothing`;
		const main = String.raw`\(${expr.tex} = ${list}\)`;
		let note = expr.def ? String.raw`Definition: \(${expr.tex} = ${expr.def}\).` : '';
		if (expr.id === 'unionc' || expr.id === 'demorgan')
			note = String.raw`Compare \((A\cup B)^c\) with \(A^c\cap B^c\): the same region, every time. (De Morgan’s law.)`;
		if (expr.id === 'dist1' || expr.id === 'dist2')
			note = String.raw`Compare \(A\cap(B\cup C)\) with \((A\cap B)\cup(A\cap C)\): the same region (the distributive law).`;
		if (expr.id === 'triple')
			note = String.raw`The middle region is drawn, but nothing lives there: \(A\cap B\cap C=\varnothing\). A picture can show an empty region.`;
		if (expr.id === 'union') note += ' “Or” in mathematics is inclusive: elements in both count.';
		return { main, note };
	});

	const id = 'venn';
	function clipFor(i: number, inside: boolean) {
		const k = ['A', 'B', 'C'][i];
		return inside ? { clip: `url(#${id}-in${k})`, mask: undefined } : { clip: undefined, mask: `url(#${id}-out${k})` };
	}
</script>

<div class="venn">
	<div class="legend ui">
		<span class="lg a">{@html tex(String.raw`A=\{2,4,6,8,10,12\}`)}<em>even</em></span>
		<span class="lg b">{@html tex(String.raw`B=\{3,6,9,12\}`)}<em>multiples of 3</em></span>
		{#if three}<span class="lg c">{@html tex(String.raw`C=\{1,2,3,4,5\}`)}<em>at most 5</em></span>{/if}
	</div>
	<Svg viewBox="0 0 {W} {H}" maxHeight={380} label="A Venn diagram of sets A, B{three ? ', C' : ''} inside the universe U = 1 to 12, with the chosen set shaded">
		<defs>
			{#each ['A', 'B', 'C'] as k (k)}
				{@const c = circles[k as 'A' | 'B' | 'C']}
				<clipPath id="{id}-in{k}"><circle cx={c[0]} cy={c[1]} r={c[2]} /></clipPath>
				<mask id="{id}-out{k}" maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={H}>
					<rect x="0" y="0" width={W} height={H} fill="white" />
					<circle cx={c[0]} cy={c[1]} r={c[2]} fill="black" />
				</mask>
			{/each}
			<clipPath id="{id}-U"><rect x="12" y="12" width={W - 24} height={H - 24} rx="16" /></clipPath>
			<pattern id="{id}-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
				<rect width="7" height="7" fill="rgba(244, 215, 156, 0.16)" />
				<line x1="0" y1="0" x2="0" y2="7" stroke="rgba(250, 226, 170, 0.55)" stroke-width="1.6" />
			</pattern>
		</defs>

		<!-- the universe -->
		<rect x="12" y="12" width={W - 24} height={H - 24} rx="16" class="universe" />

		<!-- shaded regions -->
		<g clip-path="url(#{id}-U)">
			{#each regions as r (r.key)}
				{#if expr.pred(r.p[0], r.p[1], r.p[2])}
					{@const ga = clipFor(0, r.p[0])}
					{@const gb = clipFor(1, r.p[1])}
					{@const gc = clipFor(2, r.p[2])}
					<g clip-path={ga.clip} mask={ga.mask}>
						<g clip-path={gb.clip} mask={gb.mask}>
							{#if three}
								<g clip-path={gc.clip} mask={gc.mask}>
									<rect x="0" y="0" width={W} height={H} class="shade" />
								</g>
							{:else}
								<rect x="0" y="0" width={W} height={H} class="shade" />
							{/if}
						</g>
					</g>
				{/if}
			{/each}
		</g>

		<!-- circles -->
		<circle cx={circles.A[0]} cy={circles.A[1]} r={circles.A[2]} class="ring a" />
		<circle cx={circles.B[0]} cy={circles.B[1]} r={circles.B[2]} class="ring b" />
		{#if three}
			<circle cx={circles.C[0]} cy={circles.C[1]} r={circles.C[2]} class="ring c" />
			<text x="220" y="166" class="empty">∅</text>
		{/if}
		<SvgTeX x={three ? 98 : 84} y={three ? 50 : 62} tex="A" size={20} color="var(--blue)" w={30} h={30} />
		<SvgTeX x={three ? 342 : 356} y={three ? 50 : 62} tex="B" size={20} color="var(--violet)" w={30} h={30} />
		{#if three}<SvgTeX x={318} y={292} tex="C" size={20} color="var(--teal)" w={30} h={30} />{/if}
		<SvgTeX x={34} y={H / 2} tex="U" size={18} color="var(--ink-faint)" w={30} h={30} />

		<!-- elements -->
		{#each Array.from({ length: U }, (_, i) => i + 1) as x (x)}
			{@const p = (three ? pos3 : pos2)[x]}
			{@const on = inside.includes(x)}
			<g class="el" class:on>
				<circle cx={p[0]} cy={p[1]} r="12.5" class="dot" />
				<text x={p[0]} y={p[1] + 4.5} class="num">{x}</text>
			</g>
		{/each}
	</Svg>

	<div class="readout" aria-live="polite">
		<div class="main">{@html renderMathInText(readout.main)}</div>
		{#if readout.note}<div class="note">{@html renderMathInText(readout.note)}</div>{/if}
	</div>

	<Controls>
		<div class="chips" role="radiogroup" aria-label="Choose a set to shade">
			{#each visible as e (e.id)}
				<button class="chip" class:on={e.id === expr.id} role="radio" aria-checked={e.id === expr.id} onclick={() => (exprId = e.id)}>
					{@html tex(e.tex)}
				</button>
			{/each}
		</div>
		<Toggle bind:checked={three} label="three sets" />
	</Controls>
</div>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1.2rem;
		padding: 1rem 1rem 0.2rem;
		font-size: 0.82rem;
	}
	.lg {
		display: inline-flex;
		align-items: baseline;
		gap: 0.45rem;
	}
	.lg em {
		font-style: normal;
		color: var(--ink-faint);
		font-size: 0.74rem;
	}
	.lg.a {
		color: var(--blue);
	}
	.lg.b {
		color: var(--violet);
	}
	.lg.c {
		color: var(--teal);
	}
	.venn > :global(svg) {
		padding: 0.3rem 0.5rem 0;
	}
	.universe {
		fill: rgba(116, 169, 255, 0.025);
		stroke: rgba(200, 192, 170, 0.35);
		stroke-width: 1.2;
	}
	.shade {
		fill: url(#venn-hatch);
	}
	.ring {
		fill: none;
		stroke-width: 2;
	}
	.ring.a {
		stroke: var(--blue);
	}
	.ring.b {
		stroke: var(--violet);
	}
	.ring.c {
		stroke: var(--teal);
	}
	.empty {
		font-size: 15px !important;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
	}
	.dot {
		fill: rgba(20, 28, 52, 0.95);
		stroke: rgba(200, 192, 170, 0.5);
		stroke-width: 1.2;
		transition:
			fill 0.25s,
			stroke 0.25s;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 11.5px !important;
		font-weight: 650;
		fill: var(--ink-dim) !important;
		text-anchor: middle;
		pointer-events: none;
		transition: fill 0.25s;
	}
	.el.on .dot {
		fill: #f2d08f;
		stroke: #fff6dc;
	}
	.el.on .num {
		fill: #120d05 !important;
	}
	.readout {
		padding: 0.5rem 1.2rem 0.8rem;
		text-align: center;
		min-height: 4.4rem;
	}
	.main {
		font-size: 1.08rem;
		color: var(--ink-bright);
	}
	.note {
		font-size: 0.9rem;
		color: var(--ink-dim);
		margin-top: 0.2rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		flex: 1 1 20rem;
	}
	.chip {
		padding: 0.3rem 0.65rem;
		min-height: 2.1rem;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--ink);
		cursor: pointer;
		font-size: 0.92rem;
		transition: all 0.18s var(--ease);
	}
	.chip:hover {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.12);
	}
	.chip.on {
		border-color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.22);
		color: var(--ink-bright);
		box-shadow: 0 0 14px -4px rgba(242, 205, 135, 0.6);
	}
	/* phones: the diagram shrinks, so its numbers grow */
	@container figure (max-width: 34rem) {
		.num {
			font-size: 14px !important;
			transform: translateY(0.8px);
		}
	}
</style>
