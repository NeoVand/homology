<script lang="ts">
	// Arrows add tip-to-tail; lists add entry by entry. Same thing.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Handle from './Handle.svelte';
	import Arrow from './Arrow.svelte';
	import { makeView, add, sub, mul, dot, snap2, snapTo, clamp, clipLine, tfmt, C, len, type V2 } from './geom';

	const view = makeView(440, 380, 46, 170, 250);
	let svg = $state<SVGSVGElement>();
	let u = $state<V2>([3, 1]);
	let v = $state<V2>([-1, 2]);
	let c = $state(1.5);
	// on narrow plates the drawing shrinks, so its labels grow
	let cw = $state(800);
	const lk = $derived(cw < 460 ? 1.35 : 1);

	const s = $derived(add(u, v));
	const cu = $derived(mul(c, u));

	const grid = (() => {
		const out: { x1: number; y1: number; x2: number; y2: number; axis: boolean }[] = [];
		for (let k = Math.ceil(view.xmin); k <= Math.floor(view.xmax); k++)
			out.push({ x1: view.X(k), y1: 0, x2: view.X(k), y2: view.h, axis: k === 0 });
		for (let k = Math.ceil(view.ymin); k <= Math.floor(view.ymax); k++)
			out.push({ x1: 0, y1: view.Y(k), x2: view.w, y2: view.Y(k), axis: k === 0 });
		return out;
	})();

	const set = (which: 'u' | 'v', w: V2) => {
		const p = snap2([clamp(w[0], view.xmin + 0.5, view.xmax - 0.5), clamp(w[1], view.ymin + 0.5, view.ymax - 0.5)], 0.5);
		if (which === 'u') {
			u = p;
			setC(c);
		} else v = p;
	};

	// c moves in steps of 0.25 within [−2, 2], and only as far as keeps the tip of c·u on the canvas
	const inView = (p: V2) => p[0] >= view.xmin + 0.3 && p[0] <= view.xmax - 0.3 && p[1] >= view.ymin + 0.3 && p[1] <= view.ymax - 0.3;
	function setC(k: number) {
		k = clamp(snapTo(k, 0.25), -2, 2);
		while (k !== 0 && !inView(mul(k, u))) k -= Math.sign(k) * 0.25;
		c = k;
	}
	// the tip of c·u slides along the line through u: drag it there, or step it with the arrow keys
	function moveC(w: V2, e?: PointerEvent) {
		const uu = dot(u, u);
		if (uu < 1e-9) return;
		if (e) setC(dot(w, u) / uu);
		else {
			const d = dot(sub(w, cu), u);
			if (Math.abs(d) > 1e-9) setC(c + Math.sign(d) * 0.25);
		}
	}
	const uLine = $derived(clipLine(view, [0, 0], u, 0));
	const paren = (x: number) => (x < 0 ? `(${tfmt(x)})` : tfmt(x));
	const off = (p: V2, d: V2): V2 => {
		const L = len(d) || 1;
		return add(p, mul((0.55 * lk) / L, d));
	};
</script>

<div class="va">
	<div class="canvas" bind:clientWidth={cw}>
		<Svg
			viewBox="0 0 {view.w} {view.h}"
			maxHeight={420}
			bind:svg
			label="Two draggable arrows u and v from the origin. A dashed copy of v starts at the tip of u and a dashed copy of u starts at the tip of v; both end at the gold arrow u plus v, the diagonal of a parallelogram."
		>
			{#each grid as g, i (i)}
				<line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} class="grid" class:axis={g.axis} />
			{/each}

			<!-- the parallelogram -->
			<polygon class="para" points="{view.P([0, 0])} {view.P(u)} {view.P(s)} {view.P(v)}" />

			<!-- c·u along the line of u -->
			{#if uLine}
				<line x1={view.X(uLine[0][0])} y1={view.Y(uLine[0][1])} x2={view.X(uLine[1][0])} y2={view.Y(uLine[1][1])} class="uline" />
			{/if}
			<Arrow {view} to={cu} color={C.green} width={2} head={10} glow={false} dashed opacity={0.85} />

			<!-- translated copies: tip-to-tail -->
			<Arrow {view} from={u} to={s} color={C.blue} width={2} head={10} dashed glow={false} opacity={0.7} />
			<Arrow {view} from={v} to={s} color={C.violet} width={2} head={10} dashed glow={false} opacity={0.7} />

			<Arrow {view} to={s} color={C.gold} width={3.4} />
			<Arrow {view} to={u} color={C.violet} width={3.2} />
			<Arrow {view} to={v} color={C.blue} width={3.2} />

			{#if len(s) > 0.4}
				{@const p = off(s, s)}
				<SvgTeX x={view.X(p[0])} y={view.Y(p[1])} tex={'\\mathbf u+\\mathbf v'} color={C.gold} size={16 * lk} w={80 * lk} />
			{/if}
			{#if len(cu) > 0.4 && Math.abs(c - 1) > 0.01}
				{@const p = off(cu, [-u[1], u[0]])}
				<SvgTeX x={view.X(p[0])} y={view.Y(p[1])} tex={`${tfmt(c)}\\,\\mathbf u`} color={C.green} size={14 * lk} w={70 * lk} />
			{/if}
			<circle cx={view.X(0)} cy={view.Y(0)} r="4" class="origin" />

			<Handle {view} {svg} pos={u} color={C.violet} label="tip of vector u" onmove={(w) => set('u', w)} />
			<Handle {view} {svg} pos={v} color={C.blue} label="tip of vector v" onmove={(w) => set('v', w)} />
			<!-- drawn last, so that at c = 1 (where it sits on the tip of u) it can still be dragged away -->
			{#if len(u) > 0}
				<Handle {view} {svg} pos={cu} color={C.green} r={5.5} label="tip of c·u, on the line through u (c = {tfmt(c)})" onmove={moveC} />
			{/if}
			{@const pu = off(u, [u[0] - v[0], u[1] - v[1]])}
			{@const pv = off(v, [v[0] - u[0], v[1] - u[1]])}
			<SvgTeX x={view.X(pu[0])} y={view.Y(pu[1])} tex={'\\mathbf u'} color={C.violet} size={17 * lk} w={30 * lk} />
			<SvgTeX x={view.X(pv[0])} y={view.Y(pv[1])} tex={'\\mathbf v'} color={C.blue} size={17 * lk} w={30 * lk} />
		</Svg>
	</div>
	<div class="side ui">
		<div class="line"><TeX tex={`\\textcolor{${C.violet}}{\\mathbf u} = (${tfmt(u[0])},\\ ${tfmt(u[1])})`} /></div>
		<div class="line"><TeX tex={`\\textcolor{${C.blue}}{\\mathbf v} = (${tfmt(v[0])},\\ ${tfmt(v[1])})`} /></div>
		<div class="line sum">
			<TeX
				tex={`\\textcolor{${C.gold}}{\\mathbf u + \\mathbf v} = (${tfmt(u[0])} + ${paren(v[0])},\\ ${tfmt(u[1])} + ${paren(v[1])}) = (${tfmt(s[0])},\\ ${tfmt(s[1])})`}
			/>
		</div>
		<div class="line">
			<TeX
				tex={`\\textcolor{${C.green}}{${tfmt(c)}\\,\\mathbf u} = (${tfmt(c)}\\cdot ${paren(u[0])},\\ ${tfmt(c)}\\cdot ${paren(u[1])}) = (${tfmt(cu[0])},\\ ${tfmt(cu[1])})`}
			/>
		</div>
		<p class="note">
			Walking along <span class="vv">u</span> and then along <span class="bb">v</span> (or the other way round) ends at the
			same point: the <span class="gg">gold diagonal</span>. In coordinates that is nothing but adding the lists entry by entry.
		</p>
	</div>
</div>

<style>
	.va {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: center;
		padding: 1rem 1.2rem 0.6rem;
	}
	@container figure (max-width: 720px) {
		.va {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.6rem 0.6rem 0.4rem;
		}
	}
	.canvas {
		border-radius: 10px;
		overflow: hidden;
		background: radial-gradient(circle at 40% 60%, rgba(40, 56, 110, 0.32), rgba(5, 8, 18, 0.15) 70%);
	}
	.grid {
		stroke: rgba(235, 229, 213, 0.07);
		stroke-width: 1;
	}
	.grid.axis {
		stroke: rgba(235, 229, 213, 0.28);
	}
	.uline {
		stroke: rgba(132, 217, 162, 0.22);
		stroke-width: 1.2;
		stroke-dasharray: 2 5;
	}
	.para {
		fill: rgba(242, 208, 143, 0.07);
		stroke: none;
	}
	.origin {
		fill: var(--ink-bright);
	}
	.side {
		font-size: 0.88rem;
		color: var(--ink);
	}
	.line {
		margin: 0.35rem 0;
		overflow-x: auto;
		overflow-y: hidden;
	}
	.sum {
		padding: 0.4rem 0;
	}
	.note {
		color: var(--ink-dim);
		margin: 0.8rem 0 0;
		line-height: 1.55;
	}
	.vv {
		color: var(--violet);
		font-weight: 650;
	}
	.bb {
		color: var(--blue);
		font-weight: 650;
	}
	.gg {
		color: var(--gold-bright);
		font-weight: 650;
	}
</style>
