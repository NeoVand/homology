<script lang="ts">
	// The dual cell decomposition: a dual vertex in each triangle, a dual edge
	// across each edge, a dual face around each vertex. Point at anything to see
	// its partner; the timeline fades from one decomposition to the other, and
	// the pointer picks cells in whichever is in front.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import { squareModel, type FlatModel, type Pt } from '../cup-product/flat';
	import { boxMap, type Map2 } from '../cup-product/draw';
	import { dualCells, hexPatch } from './duality';

	type Sel = { kind: 'v' | 'e' | 't'; i: number } | null;
	let mode = $state<'patch' | 'torus'>('patch');
	let t = $state(0.3);
	// one selection per triangulation, so switching never points into the wrong model
	let svgEl = $state<SVGSVGElement>();

	const VB = { w: 520, h: 440 };
	const models: Record<'patch' | 'torus', { M: FlatModel; map: Map2 }> = {
		patch: { M: hexPatch(2, 1), map: boxMap(-2.45, 2.45, -2.07, 2.07, 30, 12, 460, 389) },
		torus: { M: squareModel('torus', 3), map: boxMap(0, 1, 0, 1, 90, 40, 340, 340) }
	};
	const centreV = (M: FlatModel, c: Pt) => M.vertexPts.findIndex((ps) => ps.some((p) => Math.abs(p[0] - c[0]) < 1e-9 && Math.abs(p[1] - c[1]) < 1e-9));
	let selPatch = $state<Sel>({ kind: 'v', i: centreV(models.patch.M, [0, 0]) });
	let selTorus = $state<Sel>({ kind: 'v', i: centreV(models.torus.M, [1 / 3, 1 / 3]) });
	const sel = $derived(mode === 'patch' ? selPatch : selTorus);
	function setSel(s: Sel) {
		if (mode === 'patch') selPatch = s;
		else selTorus = s;
	}
	const cur = $derived(models[mode]);
	const C = $derived(dualCells(cur.M));
	const D = $derived(cur.M.D);


	const P = (p: Pt) => cur.map(p);
	const pts = (ps: Pt[]) => ps.map((p) => P(p).map((x) => x.toFixed(1)).join(',')).join(' ');

	// interior vertices of the patch (complete dual faces)
	const isFull = (v: number) => mode === 'torus' || C.dualFace[v].length === 6;
	const edgeFull = (e: number) => C.dualEdge[e].length === 2;

	// pointer → nearest cell, in the world that is in front
	function locate(ev: PointerEvent) {
		if (!svgEl) return;
		const r = svgEl.getBoundingClientRect();
		const sx = ((ev.clientX - r.left) / r.width) * VB.w;
		const sy = ((ev.clientY - r.top) / r.height) * VB.h;
		const q: [number, number] = [sx, sy];
		const d2 = (a: number[], b: number[]) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
		const segDist = (a: number[], b: number[]) => {
			const vx = b[0] - a[0];
			const vy = b[1] - a[1];
			const L = vx * vx + vy * vy || 1;
			const u = Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / L));
			return Math.hypot(q[0] - a[0] - u * vx, q[1] - a[1] - u * vy);
		};
		const primal = t < 0.5;
		let best: Sel = null;
		let bd = 13;
		if (primal) {
			cur.M.vertexPts.forEach((ps, v) => ps.forEach((p) => {
				const d = Math.sqrt(d2(P(p), q));
				if (d < bd) ((bd = d), (best = { kind: 'v', i: v }));
			}));
			if (!best) {
				let be = 8;
				cur.M.edgeSegs.forEach((segs, e) => segs.forEach((s) => {
					const d = segDist(P(s.a), P(s.b));
					if (d < be) ((be = d), (best = { kind: 'e', i: e }));
				}));
			}
			if (!best) {
				cur.M.triPts.forEach((tri, k) => {
					if (inside(q, tri.map(P))) best = { kind: 't', i: k };
				});
			}
		} else {
			C.dualVertex.forEach((b, k) => {
				const d = Math.sqrt(d2(P(b), q));
				if (d < bd) ((bd = d), (best = { kind: 't', i: k }));
			});
			if (!best) {
				let be = 8;
				C.dualEdge.forEach((halves, e) => halves.forEach(([a, b]) => {
					const d = segDist(P(a), P(b));
					if (d < be) ((be = d), (best = { kind: 'e', i: e }));
				}));
			}
			if (!best) {
				C.dualFace.forEach((kites, v) => kites.forEach((k) => {
					if (inside(q, k.map(P))) best = { kind: 'v', i: v };
				}));
			}
		}
		if (best) setSel(best);
	}
	function inside(q: number[], poly: number[][]) {
		let c = false;
		for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
			const [xi, yi] = poly[i];
			const [xj, yj] = poly[j];
			if (yi > q[1] !== yj > q[1] && q[0] < ((xj - xi) * (q[1] - yi)) / (yj - yi) + xi) c = !c;
		}
		return c;
	}

	const describe = $derived.by(() => {
		if (!sel) return { tex: '', text: '' };
		if (sel.kind === 'v')
			return {
				tex: '\\text{vertex (0-cell)}\\ \\longleftrightarrow\\ \\text{dual face (2-cell)}',
				text: isFull(sel.i)
					? `The dual face around this vertex is a ${C.dualFace[sel.i].length}-sided region: one side for each edge at the vertex, one corner for each triangle.`
					: 'This vertex lies on the edge of the patch, so its dual face is cut off by the border.'
			};
		if (sel.kind === 'e')
			return {
				tex: '\\text{edge (1-cell)}\\ \\longleftrightarrow\\ \\text{dual edge (1-cell)}',
				text: edgeFull(sel.i)
					? 'The dual edge joins the centres of the two triangles on either side and crosses the edge once, at its midpoint.'
					: 'A border edge has only one triangle beside it, so its dual edge stops at the border.'
			};
		return {
			tex: '\\text{triangle (2-cell)}\\ \\longleftrightarrow\\ \\text{dual vertex (0-cell)}',
			text: 'The dual vertex is the centre of the triangle. Its three dual edges cross the three sides of the triangle.'
		};
	});
	const counts = $derived(
		mode === 'torus'
			? `V=${D.nV},\\ E=${D.edges.length},\\ F=${D.tris.length} \\quad\\longleftrightarrow\\quad F^*=${D.nV},\\ E^*=${D.edges.length},\\ V^*=${D.tris.length}`
			: `\\text{7 interior vertices} \\longleftrightarrow \\text{7 complete hexagons}`
	);
	const primalOp = $derived(1 - 0.78 * t);
	const dualOp = $derived(0.18 + 0.82 * t);
	const hue = (v: number) => ['rgba(164,147,255,0.16)', 'rgba(116,169,255,0.14)', 'rgba(242,141,182,0.12)'][v % 3];
</script>

<div class="dc">
	<div class="top ui">
		<Segmented
			bind:value={mode}
			label="Which triangulation"
			options={[
				{ value: 'patch', label: 'A patch of the plane' },
				{ value: 'torus', label: 'The torus (3 × 3)' }
			]}
		/>
	</div>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="pic" onpointermove={(e) => e.pointerType === 'mouse' && locate(e)} onpointerdown={locate}>
		<Svg bind:svg={svgEl} viewBox="0 0 {VB.w} {VB.h}" maxHeight={460} label="A triangulated surface drawn together with its dual cell decomposition. Pointing at a vertex, edge or triangle highlights the dual face, dual edge or dual vertex that corresponds to it.">
			{#if mode === 'torus'}
				<GluingSquare preset="torus" x={90} y={40} size={340} fill={false} />
			{/if}
			<!-- dual faces (kites of the barycentric subdivision), tinted by vertex -->
			{#each C.dualFace as kites, v (v)}
				{#each kites as k, j (j)}
					<polygon points={pts(k)} fill={hue(v)} opacity={isFull(v) ? dualOp : dualOp * 0.45} />
				{/each}
			{/each}
			<!-- primal triangles and edges -->
			{#each cur.M.triPts as tri, k (k)}
				<polygon points={pts(tri)} class="ptri" class:hot={sel?.kind === 't' && sel.i === k} style="opacity:{primalOp}" />
			{/each}
			{#each cur.M.edgeSegs as segs, e (e)}
				{#each segs as s, j (j)}
					{@const a = P(s.a)}
					{@const b = P(s.b)}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="pedge" class:hot={sel?.kind === 'e' && sel.i === e} style="opacity:{sel?.kind === 'e' && sel.i === e ? 1 : primalOp}" />
				{/each}
			{/each}
			<!-- dual edges -->
			{#each C.dualEdge as halves, e (e)}
				{#each halves as [a, b], j (j)}
					{@const A = P(a)}
					{@const B = P(b)}
					<line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} class="dedge" class:cut={!edgeFull(e)} class:hot={sel?.kind === 'e' && sel.i === e} style="opacity:{sel?.kind === 'e' && sel.i === e ? 1 : dualOp}" />
				{/each}
			{/each}
			<!-- highlighted dual face -->
			{#if sel?.kind === 'v'}
				{#each C.dualFace[sel.i] as k, j (j)}
					<polygon points={pts(k)} class="dface-hot" />
				{/each}
				{#each C.dualFace[sel.i] as k, j (j)}
					<polyline points={pts([k[1], k[2], k[3]])} class="dface-rim" />
				{/each}
			{/if}
			<!-- dual vertices -->
			{#each C.dualVertex as b, k (k)}
				{@const B = P(b)}
				<circle cx={B[0]} cy={B[1]} r={sel?.kind === 't' && sel.i === k ? 7 : 3.6} class="dvert" class:hot={sel?.kind === 't' && sel.i === k} style="opacity:{sel?.kind === 't' && sel.i === k ? 1 : dualOp}" />
			{/each}
			<!-- primal vertices -->
			{#each cur.M.vertexPts as ps, v (v)}
				{#each ps as p, j (j)}
					{@const A = P(p)}
					<circle cx={A[0]} cy={A[1]} r={sel?.kind === 'v' && sel.i === v ? 7.5 : 4.6} class="pvert" class:hot={sel?.kind === 'v' && sel.i === v} style="opacity:{sel?.kind === 'v' && sel.i === v ? 1 : Math.max(0.25, primalOp)}" />
				{/each}
			{/each}
		</Svg>
	</div>
	<div class="ctl ui">
		<Timeline bind:value={t} from="original" to="dual" duration={2.4} label="Fading from the triangulation to its dual" />
	</div>
	<div class="read ui" aria-live="polite">
		<div class="pair"><TeX tex={describe.tex} /></div>
		<p>{describe.text}</p>
		<div class="counts"><TeX tex={counts} /></div>
	</div>
</div>

<style>
	.dc {
		padding: 0.6rem 1rem 0.2rem;
	}
	.top {
		display: flex;
		justify-content: center;
		margin-bottom: 0.3rem;
	}
	.pic {
		touch-action: manipulation;
		cursor: crosshair;
	}
	.ptri {
		fill: rgba(116, 169, 255, 0.05);
		stroke: none;
		transition: fill 0.2s;
	}
	.ptri.hot {
		fill: rgba(242, 208, 143, 0.38);
		opacity: 1 !important;
	}
	.pedge {
		stroke: rgba(235, 229, 213, 0.75);
		stroke-width: 1.6;
	}
	.pedge.hot {
		stroke: var(--gold-bright);
		stroke-width: 4.5;
	}
	.pvert {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.2;
	}
	.pvert.hot {
		stroke: #fff;
	}
	.dedge {
		stroke: var(--violet);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.dedge.cut {
		stroke-dasharray: 3 4;
	}
	.dedge.hot {
		stroke: var(--teal);
		stroke-width: 4.5;
		stroke-dasharray: none;
	}
	.dvert {
		fill: var(--violet);
		stroke: rgba(6, 9, 18, 0.8);
		stroke-width: 1;
	}
	.dvert.hot {
		fill: var(--teal);
		stroke: #fff;
	}
	.dface-hot {
		fill: rgba(95, 214, 207, 0.32);
		stroke: none;
	}
	.dface-rim {
		fill: none;
		stroke: var(--teal);
		stroke-width: 3;
		stroke-linejoin: round;
	}
	.ctl {
		display: flex;
		padding: 0.5rem 0.4rem 0.2rem;
	}
	.read {
		padding: 0.4rem 0.4rem 0.8rem;
		display: grid;
		gap: 0.3rem;
		color: var(--ink-bright);
	}
	.read p {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.92rem;
		color: var(--ink-dim);
		line-height: 1.5;
	}
	.counts {
		font-size: 0.9rem;
		overflow-x: auto;
	}
</style>
