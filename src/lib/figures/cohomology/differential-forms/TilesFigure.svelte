<script lang="ts">
	// Figure (step-through): why Green's theorem is true. Circulations of
	// adjacent tiles share an edge walked in opposite directions, so all
	// interior edges cancel and only the outer boundary survives.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';

	let step = $state(0);
	const labels = ['One small square', 'Two squares', 'A grid of squares', 'Any region'];

	type Cell = [number, number];
	interface Layout {
		cells: Cell[];
		size: number;
		ox: number;
		oy: number;
		swirl: boolean;
	}

	const blob = (x: number, y: number) => {
		const th = Math.atan2(y, x);
		const r = 1 + 0.17 * Math.sin(3 * th + 0.6) + 0.1 * Math.cos(2 * th);
		return Math.hypot(x / 1.55, y) < r;
	};
	const layouts: Layout[] = [
		{ cells: [[0, 0]], size: 130, ox: 320 - 65, oy: 160 - 65, swirl: true },
		{ cells: [[0, 0], [1, 0]], size: 120, ox: 320 - 120, oy: 160 - 60, swirl: true },
		{
			cells: Array.from({ length: 12 }, (_, k) => [k % 4, Math.floor(k / 4)] as Cell),
			size: 64,
			ox: 320 - 128,
			oy: 160 - 96,
			swirl: true
		},
		(() => {
			const cells: Cell[] = [];
			const s = 17;
			for (let j = 0; j < 17; j++)
				for (let i = 0; i < 30; i++) {
					const x = (i + 0.5 - 15) * s;
					const y = (j + 0.5 - 8.5) * s;
					if (blob(x / 120, -y / 120)) cells.push([i, j]);
				}
			return { cells, size: s, ox: 320 - 15 * s, oy: 160 - 8.5 * s, swirl: false };
		})()
	];

	const L = $derived(layouts[step]);

	// oriented edges of every cell, counterclockwise on screen (y down → walk: bottom → right → top → left)
	const edges = $derived.by(() => {
		const count = new Map<string, number>();
		const list: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];
		const P = (i: number, j: number): [number, number] => [L.ox + i * L.size, L.oy + j * L.size];
		for (const [i, j] of L.cells) {
			// screen coords: cell spans (i..i+1, j..j+1); "bottom" is j+1
			const c: [number, number][] = [P(i, j + 1), P(i + 1, j + 1), P(i + 1, j), P(i, j)];
			for (let k = 0; k < 4; k++) {
				const a = c[k];
				const b = c[(k + 1) % 4];
				const key = [a.join(','), b.join(',')].sort().join('|');
				count.set(key, (count.get(key) ?? 0) + 1);
				list.push({ x1: a[0], y1: a[1], x2: b[0], y2: b[1], key });
			}
		}
		return list.map((e) => ({ ...e, interior: (count.get(e.key) ?? 0) > 1 }));
	});

	function chevron(e: { x1: number; y1: number; x2: number; y2: number }, off = 0, s = 6) {
		const dx = e.x2 - e.x1;
		const dy = e.y2 - e.y1;
		const l = Math.hypot(dx, dy) || 1;
		const ux = dx / l;
		const uy = dy / l;
		// offset to the left of the direction of travel (the inside of a ccw tile)
		const nx = uy;
		const ny = -ux;
		const mx = (e.x1 + e.x2) / 2 + nx * off;
		const my = (e.y1 + e.y2) / 2 + ny * off;
		return `M ${mx - ux * s - uy * s} ${my - uy * s + ux * s} L ${mx + ux * s * 0.6} ${my + uy * s * 0.6} L ${mx - ux * s + uy * s} ${my - uy * s - ux * s}`;
	}
	function swirl(i: number, j: number) {
		const cx = L.ox + (i + 0.5) * L.size;
		const cy = L.oy + (j + 0.5) * L.size;
		const r = L.size * 0.2;
		// a 300° counterclockwise arc on screen (y down: decreasing angle)
		const a0 = 0.3;
		const a1 = a0 + 5.2;
		const p = (a: number) => [cx + r * Math.cos(-a), cy + r * Math.sin(-a)];
		const [x0, y0] = p(a0);
		const [x1, y1] = p(a1);
		const [hx, hy] = [-Math.sin(-a1), Math.cos(-a1)].map((v) => -v);
		return {
			arc: `M ${x0} ${y0} A ${r} ${r} 0 1 0 ${x1} ${y1}`,
			head: `M ${x1 - hx * 5 - hy * 4} ${y1 - hy * 5 + hx * 4} L ${x1} ${y1} L ${x1 - hx * 5 + hy * 4} ${y1 - hy * 5 - hx * 4}`
		};
	}
	const caption = $derived(
		[
			String.raw`\oint_{\square} \mathbf F\cdot d\mathbf r \;\approx\; \operatorname{curl}\mathbf F \times \text{area}`,
			String.raw`\text{the shared edge is walked both ways and cancels}`,
			String.raw`\textstyle\sum_{\text{tiles}} \oint_{\square} \;=\; \oint_{\text{outer edge}}`,
			String.raw`\oint_{\partial R} \mathbf F\cdot d\mathbf r = \iint_R \operatorname{curl}\mathbf F\,dA`
		][step]
	);
	const smoothBoundary = (() => {
		let d = '';
		for (let k = 0; k <= 240; k++) {
			const th = (2 * Math.PI * k) / 240;
			const r = 1 + 0.17 * Math.sin(3 * th + 0.6) + 0.1 * Math.cos(2 * th);
			const x = 320 + 120 * 1.55 * r * Math.cos(th);
			const y = 160 - 120 * r * Math.sin(th);
			d += `${k ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)} `;
		}
		return d + 'Z';
	})();
</script>

<div class="tiles">
	<Svg viewBox="0 0 640 360" maxHeight={430} label="Squares tiling a region: the circulations of neighbouring squares cancel along shared edges.">
		{#key step}
			<g class="stage">
				{#each L.cells as [i, j] (i + ',' + j)}
					<rect x={L.ox + i * L.size} y={L.oy + j * L.size} width={L.size} height={L.size} class="cell" />
				{/each}
				{#if L.swirl}
					{#each L.cells as [i, j] (i + ',' + j)}
						{@const s = swirl(i, j)}
						<path d={s.arc} class="swirl" />
						<path d={s.head} class="swirl" />
					{/each}
				{/if}
				{#each edges as e, k (k)}
					{#if e.interior}
						<line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} class="int" />
						{#if step < 3}
							<path d={chevron(e, 10, 6)} class="int-chev" />
						{/if}
					{:else}
						<line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} class="bd-halo" />
						<line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} class="bd" />
						{#if step < 3 || k % 3 === 0}
							<path d={chevron(e, 0, step === 3 ? 4 : 6)} class="bd-chev" />
						{/if}
					{/if}
				{/each}
				{#if step === 3}
					<path d={smoothBoundary} class="smooth" />
				{/if}
				{#if step === 1}
					<text x="320" y={L.oy - 14} text-anchor="middle" class="t-ui cancel">CANCELS</text>
				{/if}
			</g>
		{/key}
		<SvgTeX x={320} y={334} tex={caption} color="var(--ink-bright)" size={17} w={600} h={36} />
	</Svg>
	<Controls>
		<StepControls bind:step count={4} {labels} interval={2200} />
	</Controls>
</div>

<style>
	.stage {
		animation: fade 0.5s var(--ease);
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	.cell {
		fill: rgba(164, 147, 255, 0.1);
		stroke: none;
	}
	.swirl {
		fill: none;
		stroke: rgba(242, 141, 182, 0.75);
		stroke-width: 1.6;
		stroke-linecap: round;
	}
	.int {
		stroke: rgba(164, 147, 255, 0.35);
		stroke-width: 1.2;
		stroke-dasharray: 3 3;
	}
	.int-chev {
		fill: none;
		stroke: rgba(200, 190, 255, 0.55);
		stroke-width: 1.5;
		stroke-linecap: round;
	}
	.bd {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
		stroke-linecap: round;
	}
	.bd-halo {
		stroke: var(--gold-bright);
		stroke-width: 9;
		stroke-linecap: round;
		opacity: 0.16;
	}
	.bd-chev {
		fill: none;
		stroke: #fff4da;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.smooth {
		fill: none;
		stroke: rgba(95, 214, 207, 0.85);
		stroke-width: 1.6;
		stroke-dasharray: 6 5;
	}
	.cancel {
		fill: var(--violet);
		font-size: 10px;
		letter-spacing: 0.2em;
	}
</style>
