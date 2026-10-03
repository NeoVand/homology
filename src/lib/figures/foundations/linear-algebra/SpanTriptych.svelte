<script lang="ts">
	// Three pictures of span: one vector → a line; two independent vectors →
	// the whole plane; two dependent vectors → still only a line.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Arrow from './Arrow.svelte';
	import { makeView, clipLine, add, mul, C, type V2 } from './geom';

	const view = makeView(260, 240, 36, 120, 130);

	const panels: {
		title: string;
		vecs: { v: V2; color: string; name: string; lab: V2 }[];
		mode: 'line' | 'plane';
		dir: V2;
		caption: string;
	}[] = [
		{
			title: 'One vector',
			vecs: [{ v: [1.6, 0.8], color: C.violet, name: '\\mathbf v', lab: [1.75, 0.3] }],
			mode: 'line',
			dir: [1.6, 0.8],
			caption: '\\operatorname{span}\\{\\mathbf v\\}\\text{: a line}'
		},
		{
			title: 'Two independent vectors',
			vecs: [
				{ v: [1.6, 0.8], color: C.violet, name: '\\mathbf v', lab: [1.95, 0.5] },
				{ v: [-0.6, 1.4], color: C.blue, name: '\\mathbf w', lab: [-1.05, 1.5] }
			],
			mode: 'plane',
			dir: [0, 0],
			caption: '\\operatorname{span}\\{\\mathbf v,\\mathbf w\\}\\text{: the plane}'
		},
		{
			title: 'Two dependent vectors',
			vecs: [
				{ v: [1.6, 0.8], color: C.violet, name: '\\mathbf v', lab: [1.6, 0.25] },
				{ v: [-1.2, -0.6], color: C.blue, name: '\\mathbf w', lab: [-1.2, -1.05] }
			],
			mode: 'line',
			dir: [1.6, 0.8],
			caption: '\\mathbf w = -\\tfrac34\\mathbf v\\text{: still a line}'
		}
	];

	const V: V2 = [1.6, 0.8];
	const W: V2 = [-0.6, 1.4];
	const S1: V2 = mul(1.5, V);
	const SP: V2 = add(S1, W);
	// the lines a·v + t·w and t·v + b·w for whole numbers a, b
	const latticeLines = (() => {
		const out: [V2, V2][] = [];
		for (let a = -6; a <= 6; a++) {
			const l1 = clipLine(view, mul(a, V), W, -0.15);
			const l2 = clipLine(view, mul(a, W), V, -0.15);
			if (l1) out.push(l1);
			if (l2) out.push(l2);
		}
		return out;
	})();
	// integer combinations a·v + b·w for the plane panel
	const lattice = (() => {
		const v = V;
		const w = W;
		const out: V2[] = [];
		for (let a = -5; a <= 5; a++)
			for (let b = -5; b <= 5; b++) {
				const p = add(mul(a, v), mul(b, w));
				if (p[0] > view.xmin + 0.2 && p[0] < view.xmax - 0.2 && p[1] > view.ymin + 0.2 && p[1] < view.ymax - 0.2) out.push(p);
			}
		return out;
	})();
	const multiples = [-3, -2, -1, 1, 2, 3].map((k) => mul(k * 0.5, V));
</script>

<div class="trip">
	{#each panels as p, k (k)}
		<div class="pane">
			<div class="ttl ui">{p.title}</div>
			<Svg viewBox="0 0 {view.w} {view.h}" maxHeight={260} label="{p.title}: {p.mode === 'plane' ? 'their span is the whole plane' : 'their span is a line'}">
				{#if p.mode === 'plane'}
					<rect x="6" y="6" width={view.w - 12} height={view.h - 12} rx="10" class="wash" />
					{#each latticeLines as l, i (i)}
						<line class="lat" x1={view.X(l[0][0])} y1={view.Y(l[0][1])} x2={view.X(l[1][0])} y2={view.Y(l[1][1])} />
					{/each}
					{#each lattice as q, i (i)}
						<circle class="ldot" cx={view.X(q[0])} cy={view.Y(q[1])} r="2.2" />
					{/each}
					<!-- one sample combination: 1.5 v + w -->
					<line class="guide v" x1={view.X(0)} y1={view.Y(0)} x2={view.X(S1[0])} y2={view.Y(S1[1])} />
					<line class="guide w" x1={view.X(S1[0])} y1={view.Y(S1[1])} x2={view.X(SP[0])} y2={view.Y(SP[1])} />
					<circle class="target" cx={view.X(SP[0])} cy={view.Y(SP[1])} r="4.5" />
					<SvgTeX x={view.X(SP[0]) - 6} y={view.Y(SP[1]) - 16} tex={'1.5\\mathbf v + \\mathbf w'} color={C.gold} size={13} w={90} />
				{:else}
					{@const l = clipLine(view, [0, 0], p.dir, -0.1)}
					{#if l}
						<line class="span-halo" x1={view.X(l[0][0])} y1={view.Y(l[0][1])} x2={view.X(l[1][0])} y2={view.Y(l[1][1])} />
						<line class="span" x1={view.X(l[0][0])} y1={view.Y(l[0][1])} x2={view.X(l[1][0])} y2={view.Y(l[1][1])} />
					{/if}
					{#each multiples as q, i (i)}
						<circle class="ldot" cx={view.X(q[0])} cy={view.Y(q[1])} r="2.4" />
					{/each}
				{/if}
				<circle cx={view.X(0)} cy={view.Y(0)} r="3.5" class="origin" />
				{#each p.vecs as a (a.name)}
					<Arrow {view} to={a.v} color={a.color} width={3} head={11} />
					<SvgTeX x={view.X(a.lab[0])} y={view.Y(a.lab[1])} tex={a.name} color={a.color} size={16} w={30} />
				{/each}
			</Svg>
			<div class="cap"><TeX tex={p.caption} /></div>
		</div>
	{/each}
</div>

<style>
	.trip {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.8rem;
		padding: 1rem 1.1rem 1.1rem;
	}
	@media (max-width: 720px) {
		.trip {
			grid-template-columns: minmax(0, 1fr);
			max-width: 22rem;
			margin: 0 auto;
		}
	}
	.pane {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		border-radius: 10px;
		background: radial-gradient(circle at 50% 45%, rgba(40, 56, 110, 0.3), rgba(5, 8, 18, 0.1) 75%);
		padding: 0.6rem 0.4rem 0.7rem;
	}
	.ttl {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-faint);
		font-weight: 600;
	}
	.wash {
		fill: rgba(116, 169, 255, 0.07);
		stroke: rgba(116, 169, 255, 0.25);
		stroke-width: 1;
	}
	.lat {
		stroke: rgba(116, 169, 255, 0.22);
		stroke-width: 1;
	}
	.ldot {
		fill: rgba(235, 229, 213, 0.55);
	}
	.span {
		stroke: var(--violet);
		stroke-width: 2.2;
		opacity: 0.9;
		stroke-linecap: round;
	}
	.span-halo {
		stroke: var(--violet);
		stroke-width: 10;
		opacity: 0.16;
		stroke-linecap: round;
	}
	.origin {
		fill: var(--ink-bright);
	}
	.guide {
		stroke-width: 1.6;
		stroke-dasharray: 4 4;
		opacity: 0.9;
	}
	.guide.v {
		stroke: var(--violet);
	}
	.guide.w {
		stroke: var(--blue);
	}
	.target {
		fill: var(--gold-bright);
		filter: drop-shadow(0 0 5px rgba(242, 208, 143, 0.9));
	}
	.cap {
		font-size: 0.92rem;
		color: var(--ink);
	}
</style>
