<script lang="ts">
	// Six small arrow diagrams: two that are not functions, then the four kinds of function.
	import Svg from '$lib/components/svg/Svg.svelte';
	import { classify, type Arrow } from './maps';

	interface Panel {
		title: string;
		motto: string;
		m: number;
		n: number;
		arrows: Arrow[];
		tone: 'bad' | 'good';
	}
	const panels: Panel[] = [
		{ title: 'Not a function', motto: '3 has no arrow', m: 3, n: 3, arrows: [[0, 0], [1, 2]], tone: 'bad' },
		{ title: 'Not a function', motto: '2 has two arrows', m: 3, n: 3, arrows: [[0, 1], [1, 0], [1, 2], [2, 2]], tone: 'bad' },
		{ title: 'Injective', motto: 'no collisions', m: 3, n: 4, arrows: [[0, 0], [1, 2], [2, 3]], tone: 'good' },
		{ title: 'Surjective', motto: 'no misses', m: 4, n: 3, arrows: [[0, 0], [1, 0], [2, 1], [3, 2]], tone: 'good' },
		{ title: 'Bijective', motto: 'a perfect matching', m: 3, n: 3, arrows: [[0, 1], [1, 2], [2, 0]], tone: 'good' },
		{ title: 'Neither', motto: 'a collision and a miss', m: 3, n: 3, arrows: [[0, 0], [1, 0], [2, 2]], tone: 'good' }
	];
	const xs = ['1', '2', '3', '4'];
	const ys = ['a', 'b', 'c', 'd'];
	const LX = 34;
	const RX = 126;
	const top = (k: number) => 70 - ((k - 1) * 26) / 2;
	const yAt = (i: number, k: number) => top(k) + i * 26;

	function arrowPath(x: number, y: number, m: number, n: number) {
		const x1 = LX + 10;
		const y1 = yAt(x, m);
		const x2 = RX - 12;
		const y2 = yAt(y, n);
		const mx = (x1 + x2) / 2;
		return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
	}
</script>

<div class="gallery">
	{#each panels as p, k (k)}
		{@const c = classify(p.arrows, p.m, p.n)}
		<div class="panel" class:bad={p.tone === 'bad'}>
			<Svg viewBox="0 0 160 140" maxHeight={150} label="{p.title}: {p.motto}">
				<rect x="16" y="20" width="36" height="104" rx="18" class="set" />
				<rect x="108" y="20" width="36" height="104" rx="18" class="set" />
				{#each p.arrows as a, i (i)}
					{@const collide = c.collision !== null && p.tone === 'good' && a[1] === c.collision[2]}
					<path d={arrowPath(a[0], a[1], p.m, p.n)} class="arr" class:warn={collide || c.manyArrows.includes(a[0])} marker-end={collide || c.manyArrows.includes(a[0]) ? 'url(#arrow-amber)' : 'url(#arrow-ivory)'} />
				{/each}
				{#each Array(p.m) as _, i (i)}
					<circle cx={LX} cy={yAt(i, p.m)} r="8.5" class="pt" class:rose={c.noArrow.includes(i) || c.manyArrows.includes(i)} />
					<text x={LX} y={yAt(i, p.m) + 3.8} class="lb">{xs[i]}</text>
				{/each}
				{#each Array(p.n) as _, j (j)}
					{@const missed = p.tone === 'good' && c.missed.includes(j)}
					<circle cx={RX} cy={yAt(j, p.n)} r="8.5" class="pt" class:missed />
					<text x={RX} y={yAt(j, p.n) + 3.8} class="lb">{ys[j]}</text>
				{/each}
				<text x={LX} y="14" class="setname">X</text>
				<text x={RX} y="14" class="setname">Y</text>
			</Svg>
			<div class="cap ui">
				<span class="t">{p.title}</span>
				<span class="m">{p.motto}</span>
			</div>
		</div>
	{/each}
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
		padding: 1rem 1rem 0.9rem;
	}
	@media (max-width: 600px) {
		.gallery {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 0.45rem;
			padding: 0.8rem 0.6rem 0.7rem;
		}
	}
	.panel {
		border-radius: 12px;
		border: 1px solid rgba(132, 217, 162, 0.22);
		background: rgba(132, 217, 162, 0.03);
		padding: 0.4rem 0.3rem 0.6rem;
	}
	.panel.bad {
		border-color: rgba(242, 141, 182, 0.3);
		background: rgba(242, 141, 182, 0.04);
	}
	.set {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(116, 169, 255, 0.3);
		stroke-width: 1;
	}
	.arr {
		fill: none;
		stroke: rgba(235, 229, 213, 0.8);
		stroke-width: 1.5;
	}
	.arr.warn {
		stroke: var(--amber);
	}
	.pt {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.2;
	}
	.pt.rose {
		fill: var(--rose);
	}
	.pt.missed {
		fill: rgba(20, 28, 52, 0.95);
		stroke: var(--violet);
		stroke-width: 1.6;
		stroke-dasharray: 2.5 2;
	}
	.lb {
		font-family: var(--font-ui);
		font-size: 9.5px !important;
		font-weight: 700;
		fill: #120d05 !important;
		text-anchor: middle;
	}
	.pt.missed + .lb {
		fill: var(--violet) !important;
	}
	.setname {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 13px !important;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
	}
	.cap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.05rem;
		text-align: center;
	}
	.t {
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--green);
	}
	.panel.bad .t {
		color: var(--rose);
	}
	.m {
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
</style>
