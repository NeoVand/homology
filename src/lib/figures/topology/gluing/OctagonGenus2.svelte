<script lang="ts">
	// The octagon a₁b₁a₁⁻¹b₁⁻¹a₂b₂a₂⁻¹b₂⁻¹ becomes a two-holed doughnut:
	// cut along a diagonal c, glue each half into a torus with a hole, then glue the holes.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';

	let step = $state(0);
	const labels = [
		'The octagon and its word',
		'Cut along the diagonal c',
		'Two pentagons',
		'Glue each: a torus with a hole',
		'Glue the holes: genus two'
	];

	const CX = 300;
	const CY = 168;
	const R = 118;
	const V = Array.from({ length: 8 }, (_, k) => {
		const a = ((112.5 - 45 * k) * Math.PI) / 180;
		return [CX + R * Math.cos(a), CY + R * Math.sin(a)] as [number, number];
	});
	const cols = { a1: '#f4d79c', b1: '#5fd6cf', a2: '#a493ff', b2: '#f28db6' };
	// edge k runs V[k] → V[k+1]; dir = +1 if its arrow points that way (a letter), −1 for an inverse
	const edges: { name: string; tex: string; col: string; dir: 1 | -1; marks: 1 | 2 }[] = [
		{ name: 'a1', tex: 'a_1', col: cols.a1, dir: 1, marks: 1 },
		{ name: 'b1', tex: 'b_1', col: cols.b1, dir: 1, marks: 2 },
		{ name: 'a1', tex: 'a_1', col: cols.a1, dir: -1, marks: 1 },
		{ name: 'b1', tex: 'b_1', col: cols.b1, dir: -1, marks: 2 },
		{ name: 'a2', tex: 'a_2', col: cols.a2, dir: 1, marks: 1 },
		{ name: 'b2', tex: 'b_2', col: cols.b2, dir: 1, marks: 2 },
		{ name: 'a2', tex: 'a_2', col: cols.a2, dir: -1, marks: 1 },
		{ name: 'b2', tex: 'b_2', col: cols.b2, dir: -1, marks: 2 }
	];
	function chev(k: number) {
		const [x1, y1] = V[k];
		const [x2, y2] = V[(k + 1) % 8];
		const e = edges[k];
		const len = Math.hypot(x2 - x1, y2 - y1);
		const ux = ((x2 - x1) / len) * e.dir;
		const uy = ((y2 - y1) / len) * e.dir;
		const mx = (x1 + x2) / 2;
		const my = (y1 + y2) / 2;
		const out: string[] = [];
		for (let i = 0; i < e.marks; i++) {
			const off = (i - (e.marks - 1) / 2) * 10;
			const cx = mx + ux * off;
			const cy = my + uy * off;
			out.push(`M ${cx - ux * 7 - uy * 7} ${cy - uy * 7 + ux * 7} L ${cx + ux * 3} ${cy + uy * 3} L ${cx - ux * 7 + uy * 7} ${cy - uy * 7 - ux * 7}`);
		}
		return out;
	}
	function labelPos(k: number): [number, number] {
		const [x1, y1] = V[k];
		const [x2, y2] = V[(k + 1) % 8];
		const mx = (x1 + x2) / 2;
		const my = (y1 + y2) / 2;
		const d = Math.hypot(mx - CX, my - CY);
		return [mx + ((mx - CX) / d) * 22, my + ((my - CY) / d) * 22];
	}
	const half1 = [0, 1, 2, 3]; // pentagon V0..V4
	const half2 = [4, 5, 6, 7]; // pentagon V4..V7, V0
	const shift = $derived(step >= 2 ? 1 : 0);
	const showPoly = $derived(step <= 2);

	// a stylised torus with one hole, opening on the side `side` (+1 right, −1 left)
	function punctured(x0: number, y0: number, side: 1 | -1) {
		const rx = 92;
		const ry = 54;
		const a = (60 * Math.PI) / 180;
		const ex = x0 + side * rx * Math.cos(a);
		const ey = ry * Math.sin(a);
		const outline =
			side === 1
				? `M ${ex} ${y0 - ey} A ${rx} ${ry} 0 1 0 ${ex} ${y0 + ey}`
				: `M ${ex} ${y0 - ey} A ${rx} ${ry} 0 1 1 ${ex} ${y0 + ey}`;
		const hx = x0 - side * 6;
		return {
			outline,
			c: { cx: ex, cy: y0, rx: 11, ry: ey },
			smile: `M ${hx - 34} ${y0 - 3} Q ${hx} ${y0 + 19} ${hx + 34} ${y0 - 3}`,
			frown: `M ${hx - 25} ${y0 + 3} Q ${hx} ${y0 - 10} ${hx + 25} ${y0 + 3}`,
			aLoop: { cx: hx, cy: y0 + 1, rx: 52, ry: 27 },
			bLoop: { cx: x0 - side * 68, cy: y0 + 1, rx: 20, ry: 7 }
		};
	}
	const T1 = punctured(178, 118, 1);
	const T2 = punctured(422, 222, -1);
</script>

<div class="oct">
	<Svg viewBox="0 0 600 340" maxHeight={380} label="An octagon with edges a1, b1, a1 inverse, b1 inverse, a2, b2, a2 inverse, b2 inverse, cut into two halves, each glued into a torus with a hole, and finally glued into a surface with two holes">
		<!-- polygon stage -->
		<g class="fade" style="opacity:{showPoly ? 1 : 0}">
			<g class="move" style="transform: translate({-34 * shift}px, {-18 * shift}px)">
				<path d={'M' + [...half2.map((k) => V[k]), V[0]].map((p) => p.join(' ')).join(' L') + ' Z'} fill="rgba(143,124,247,0.09)" />
				{#each half2 as k (k)}
					<line x1={V[k][0]} y1={V[k][1]} x2={V[(k + 1) % 8][0]} y2={V[(k + 1) % 8][1]} stroke={edges[k].col} stroke-width="2.8" stroke-linecap="round" />
					{#each chev(k) as d, i (i)}<path {d} fill="none" stroke={edges[k].col} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />{/each}
					{@const lp = labelPos(k)}
					<SvgTeX x={lp[0]} y={lp[1]} tex={edges[k].tex} color={edges[k].col} size={16} w={36} h={24} />
				{/each}
				{#each [4, 5, 6, 7, 0] as k (k)}<circle cx={V[k][0]} cy={V[k][1]} r="5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.2" />{/each}
			</g>
			<g class="move" style="transform: translate({34 * shift}px, {18 * shift}px)">
				<path d={'M' + [...half1.map((k) => V[k]), V[4]].map((p) => p.join(' ')).join(' L') + ' Z'} fill="rgba(111,214,232,0.08)" />
				{#each half1 as k (k)}
					<line x1={V[k][0]} y1={V[k][1]} x2={V[(k + 1) % 8][0]} y2={V[(k + 1) % 8][1]} stroke={edges[k].col} stroke-width="2.8" stroke-linecap="round" />
					{#each chev(k) as d, i (i)}<path {d} fill="none" stroke={edges[k].col} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />{/each}
					{@const lp = labelPos(k)}
					<SvgTeX x={lp[0]} y={lp[1]} tex={edges[k].tex} color={edges[k].col} size={16} w={36} h={24} />
				{/each}
				{#each [0, 1, 2, 3, 4] as k (k)}<circle cx={V[k][0]} cy={V[k][1]} r="5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.2" />{/each}
			</g>
			<!-- the diagonal c (one copy on each half once they part) -->
			{#if step >= 1}
				{#each [-1, 1] as sgn (sgn)}
					<g class="move" style="transform: translate({34 * sgn * shift}px, {18 * sgn * shift}px)">
						<line x1={V[0][0]} y1={V[0][1]} x2={V[4][0]} y2={V[4][1]} stroke="var(--blue)" stroke-width="2.4" stroke-dasharray="7 6" />
					</g>
				{/each}
				<SvgTeX x={(V[0][0] + V[4][0]) / 2 + 14} y={(V[0][1] + V[4][1]) / 2 + 10} tex="c" color="var(--blue)" size={17} w={24} h={24} />
			{/if}

		</g>

		<!-- glued stage: two tori with holes -->
		<g class="fade" style="opacity:{step === 3 ? 1 : 0}">
			{#each [{ T: T1, ca: cols.a1, cb: cols.b1, n: 1 }, { T: T2, ca: cols.a2, cb: cols.b2, n: 2 }] as s (s.n)}
				<path d={s.T.outline} fill="rgba(116,169,255,0.10)" stroke="rgba(188,214,255,0.8)" stroke-width="2.2" />
				<ellipse cx={s.T.c.cx} cy={s.T.c.cy} rx={s.T.c.rx} ry={s.T.c.ry} fill="rgba(5,8,16,0.7)" stroke="var(--blue)" stroke-width="2.2" />
				<path d={s.T.smile} fill="none" stroke="rgba(188,214,255,0.8)" stroke-width="2" />
				<path d={s.T.frown} fill="none" stroke="rgba(188,214,255,0.8)" stroke-width="2" />
				<ellipse cx={s.T.aLoop.cx} cy={s.T.aLoop.cy} rx={s.T.aLoop.rx} ry={s.T.aLoop.ry} fill="none" stroke={s.ca} stroke-width="2.6" filter="url(#glow)" />
				<path d="M {s.T.bLoop.cx - s.T.bLoop.rx} {s.T.bLoop.cy} A {s.T.bLoop.rx} {s.T.bLoop.ry} 0 0 0 {s.T.bLoop.cx + s.T.bLoop.rx} {s.T.bLoop.cy}" fill="none" stroke={s.cb} stroke-width="2.6" />
				<path d="M {s.T.bLoop.cx - s.T.bLoop.rx} {s.T.bLoop.cy} A {s.T.bLoop.rx} {s.T.bLoop.ry} 0 0 1 {s.T.bLoop.cx + s.T.bLoop.rx} {s.T.bLoop.cy}" fill="none" stroke={s.cb} stroke-width="2" stroke-dasharray="4 4" />
			{/each}
			<SvgTeX x={T1.aLoop.cx} y={T1.aLoop.cy - 38} tex="a_1" color={cols.a1} size={16} w={30} h={22} />
			<SvgTeX x={T1.bLoop.cx - 12} y={T1.bLoop.cy + 26} tex="b_1" color={cols.b1} size={16} w={30} h={22} />
			<SvgTeX x={T2.aLoop.cx} y={T2.aLoop.cy + 40} tex="a_2" color={cols.a2} size={16} w={30} h={22} />
			<SvgTeX x={T2.bLoop.cx + 12} y={T2.bLoop.cy - 24} tex="b_2" color={cols.b2} size={16} w={30} h={22} />
			<SvgTeX x={T1.c.cx + 26} y={T1.c.cy - 36} tex="c" color="var(--blue)" size={16} w={20} h={22} />
			<SvgTeX x={T2.c.cx - 26} y={T2.c.cy + 36} tex="c" color="var(--blue)" size={16} w={20} h={22} />
		</g>

		<!-- final stage: genus two -->
		<g class="fade" style="opacity:{step === 4 ? 1 : 0}">
			<path
				d="M 106 170 C 106 108, 196 98, 258 124 C 284 135, 316 135, 342 124 C 404 98, 494 108, 494 170 C 494 232, 404 242, 342 216 C 316 205, 284 205, 258 216 C 196 242, 106 232, 106 170 Z"
				fill="rgba(116,169,255,0.10)"
				stroke="rgba(188,214,255,0.85)"
				stroke-width="2.4"
			/>
			{#each [196, 404] as hx (hx)}
				<path d="M {hx - 38} {167} Q {hx} {189} {hx + 38} {167}" fill="none" stroke="rgba(188,214,255,0.8)" stroke-width="2" />
				<path d="M {hx - 28} {173} Q {hx} {159} {hx + 28} {173}" fill="none" stroke="rgba(188,214,255,0.8)" stroke-width="2" />
			{/each}
			<ellipse cx="196" cy="171" rx="60" ry="31" fill="none" stroke={cols.a1} stroke-width="2.6" filter="url(#glow)" />
			<ellipse cx="404" cy="171" rx="60" ry="31" fill="none" stroke={cols.a2} stroke-width="2.6" filter="url(#glow)" />
			{#each [{ x: 128, c: cols.b1 }, { x: 472, c: cols.b2 }] as b (b.x)}
				<path d="M {b.x - 22} 170 A 22 8 0 0 0 {b.x + 22} 170" fill="none" stroke={b.c} stroke-width="2.6" />
				<path d="M {b.x - 22} 170 A 22 8 0 0 1 {b.x + 22} 170" fill="none" stroke={b.c} stroke-width="2" stroke-dasharray="4 4" />
			{/each}
			<path d="M 300 135 A 9 35 0 0 0 300 205" fill="none" stroke="var(--blue)" stroke-width="2.2" />
			<path d="M 300 135 A 9 35 0 0 1 300 205" fill="none" stroke="var(--blue)" stroke-width="1.8" stroke-dasharray="4 4" />
			<SvgTeX x={196} y={124} tex="a_1" color={cols.a1} size={16} w={30} h={22} />
			<SvgTeX x={404} y={124} tex="a_2" color={cols.a2} size={16} w={30} h={22} />
			<SvgTeX x={128} y={196} tex="b_1" color={cols.b1} size={16} w={30} h={22} />
			<SvgTeX x={472} y={196} tex="b_2" color={cols.b2} size={16} w={30} h={22} />
			<SvgTeX x={300} y={226} tex="c" color="var(--blue)" size={16} w={20} h={22} />
			<SvgTeX x={300} y={290} tex={'\\Sigma_2'} color="var(--ink-bright)" size={20} w={60} h={30} />
		</g>

		{#if step <= 2}
			<SvgTeX x={CX} y={318} tex={'a_1b_1a_1^{-1}b_1^{-1}\\,a_2b_2a_2^{-1}b_2^{-1}'} size={18} w={360} h={30} color="var(--ink-bright)" />
		{:else if step === 3}
			<SvgTeX x={CX} y={318} tex={'a_1b_1a_1^{-1}b_1^{-1}c^{-1}\\quad\\text{and}\\quad c\\,a_2b_2a_2^{-1}b_2^{-1}'} size={16} w={440} h={30} color="var(--ink-bright)" />
		{/if}
	</Svg>
	<div class="ctl ui">
		<StepControls bind:step count={labels.length} {labels} interval={2200} />
	</div>
</div>

<style>
	.oct {
		padding: 0.6rem 0.6rem 0;
	}
	.fade {
		transition: opacity 0.6s var(--ease);
	}
	.move {
		transition: transform 0.8s var(--ease);
	}
	.ctl {
		padding: 0.75rem 1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
