<script lang="ts">
	// Figure: build a complex from vertices, edges and triangles; the two rules
	// are checked live, and the f-vector (n₀, n₁, n₂) is counted.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { checkDrawing, closeUnderFaces, describe, segDist, type Pt } from './builder';

	type Tool = 'move' | 'vertex' | 'edge' | 'triangle' | 'erase';
	interface Vtx {
		id: number;
		x: number;
		y: number;
	}

	const W = 640;
	const H = 400;

	const presets: Record<string, { name: string; verts: Vtx[]; gens: number[][] }> = {
		glued: {
			name: 'Good complex',
			verts: [
				{ id: 0, x: 120, y: 300 },
				{ id: 1, x: 270, y: 310 },
				{ id: 2, x: 190, y: 160 },
				{ id: 3, x: 345, y: 175 },
				{ id: 4, x: 470, y: 110 },
				{ id: 5, x: 520, y: 280 }
			],
			gens: closeUnderFaces([
				[0, 1, 2],
				[1, 2, 3],
				[3, 4],
				[3, 5],
				[4, 5]
			])
		},
		hollow: {
			name: 'Hollow triangle',
			verts: [
				{ id: 0, x: 200, y: 320 },
				{ id: 1, x: 440, y: 320 },
				{ id: 2, x: 320, y: 110 }
			],
			gens: [
				[0, 1],
				[1, 2],
				[0, 2]
			]
		},
		tjunction: {
			name: 'Corner on an edge',
			verts: [
				{ id: 0, x: 140, y: 320 },
				{ id: 1, x: 340, y: 320 },
				{ id: 2, x: 240, y: 110 },
				{ id: 3, x: 290, y: 215 },
				{ id: 4, x: 500, y: 300 },
				{ id: 5, x: 470, y: 120 }
			],
			gens: closeUnderFaces([
				[0, 1, 2],
				[3, 4, 5]
			])
		},
		crossing: {
			name: 'Crossing edges',
			verts: [
				{ id: 0, x: 170, y: 300 },
				{ id: 1, x: 470, y: 110 },
				{ id: 2, x: 180, y: 110 },
				{ id: 3, x: 460, y: 310 }
			],
			gens: [
				[0, 1],
				[2, 3]
			]
		}
	};

	let verts = $state<Vtx[]>(structuredClone(presets.glued.verts));
	let gens = $state<number[][]>(structuredClone(presets.glued.gens));
	let tool = $state<Tool>('move');
	let autofill = $state(true);
	let pending = $state<number[]>([]);
	let flash = $state<Set<string>>(new Set());
	let nextId = $state(6);
	let svgEl = $state<SVGSVGElement>();
	let dragId = $state<number | null>(null);
	let hoverKey = $state<string | null>(null);
	let cw = $state(640);
	/** SVG units per CSS pixel: larger on phones, where the board is drawn smaller */
	const u = $derived(W / Math.max(cw, 1));
	const vs = $derived(Math.max(1, 0.78 * u));

	const key = (s: number[]) => [...s].sort((a, b) => a - b).join(',');
	const P = (id: number): Pt => {
		const v = verts.find((x) => x.id === id)!;
		return [v.x, v.y];
	};
	const edges = $derived(gens.filter((s) => s.length === 2));
	const tris = $derived(gens.filter((s) => s.length === 3));
	const problems = $derived(
		checkDrawing({ verts: new Map(verts.map((v) => [v.id, [v.x, v.y] as Pt])), simplices: gens })
	);
	const badKeys = $derived(new Set(problems.flatMap((p) => p.parts.map(key))));
	const missing = $derived(problems.filter((p) => p.kind === 'missing-face').map((p) => p.parts[0]));
	const name = (s: number[]) => (s.length === 1 ? `${s[0]}` : `[${s.join(',')}]`);

	function load(k: string) {
		verts = structuredClone(presets[k].verts);
		gens = structuredClone(presets[k].gens);
		nextId = Math.max(...verts.map((v) => v.id), -1) + 1;
		pending = [];
	}

	function flashKeys(keys: string[]) {
		if (!keys.length) return;
		flash = new Set(keys);
		setTimeout(() => (flash = new Set()), 1400);
	}

	function addSimplex(s: number[]) {
		const ss = [...s].sort((a, b) => a - b);
		const have = new Set(gens.map(key));
		if (have.has(key(ss))) return;
		const add = [ss];
		const added: string[] = [];
		if (autofill && ss.length === 3) {
			for (const f of closeUnderFaces([ss])) {
				if (f.length === 2 && !have.has(key(f))) {
					add.push(f);
					added.push(key(f));
				}
			}
		}
		gens = [...gens, ...add];
		flashKeys(added);
	}

	function erase(kind: 'vertex' | 'edge' | 'triangle', s: number[]) {
		if (kind === 'vertex') {
			verts = verts.filter((v) => v.id !== s[0]);
			gens = gens.filter((g) => !g.includes(s[0]));
		} else if (kind === 'edge') {
			gens = gens.filter((g) => key(g) !== key(s) && !(autofill && g.length === 3 && s.every((v) => g.includes(v))));
		} else {
			gens = gens.filter((g) => key(g) !== key(s));
		}
	}

	$effect(() => {
		// turning the rule-1 helper on fills in every missing face at once
		if (!autofill) return;
		const have = new Set(gens.map(key));
		const closed = closeUnderFaces(gens);
		const extra = closed.filter((s) => !have.has(key(s)));
		if (extra.length) {
			gens = [...gens, ...extra];
			flashKeys(extra.map(key));
		}
	});

	function svgPoint(e: PointerEvent): Pt | null {
		if (!svgEl) return null;
		const m = svgEl.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [Math.min(W - 12, Math.max(12, p.x)), Math.min(H - 12, Math.max(12, p.y))];
	}

	function hit(p: Pt): { kind: 'vertex' | 'edge' | 'triangle'; s: number[] } | null {
		let best: Vtx | null = null;
		let bd = Math.max(18, 16 * u);
		for (const v of verts) {
			const d = Math.hypot(v.x - p[0], v.y - p[1]);
			if (d < bd) {
				bd = d;
				best = v;
			}
		}
		if (best) return { kind: 'vertex', s: [best.id] };
		let be: number[] | null = null;
		let ed = Math.max(10, 10 * u);
		for (const e of edges) {
			const { d } = segDist(p, P(e[0]), P(e[1]));
			if (d < ed) {
				ed = d;
				be = e;
			}
		}
		if (be) return { kind: 'edge', s: be };
		for (const t of tris) {
			const [a, b, c] = t.map(P);
			const s1 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
			const s2 = (c[0] - b[0]) * (p[1] - b[1]) - (c[1] - b[1]) * (p[0] - b[0]);
			const s3 = (a[0] - c[0]) * (p[1] - c[1]) - (a[1] - c[1]) * (p[0] - c[0]);
			if ((s1 > 0 && s2 > 0 && s3 > 0) || (s1 < 0 && s2 < 0 && s3 < 0)) return { kind: 'triangle', s: t };
		}
		return null;
	}

	function newVertex(p: Pt): number {
		const id = nextId;
		nextId += 1;
		verts = [...verts, { id, x: p[0], y: p[1] }];
		return id;
	}

	function down(e: PointerEvent) {
		if (e.button !== 0) return;
		const p = svgPoint(e);
		if (!p) return;
		const h = hit(p);
		if (tool === 'move') {
			if (h?.kind === 'vertex') {
				dragId = h.s[0];
				svgEl?.setPointerCapture(e.pointerId);
				e.preventDefault();
			}
			return;
		}
		if (tool === 'erase') {
			if (h) erase(h.kind, h.s);
			return;
		}
		if (tool === 'vertex') {
			if (h?.kind !== 'vertex') newVertex(p);
			return;
		}
		// edge / triangle: collect corners (clicking empty space makes a new vertex)
		const v = h?.kind === 'vertex' ? h.s[0] : newVertex(p);
		if (pending.includes(v)) {
			pending = pending.filter((x) => x !== v);
			return;
		}
		const next = [...pending, v];
		const need = tool === 'edge' ? 2 : 3;
		if (next.length === need) {
			addSimplex(next);
			pending = [];
		} else pending = next;
	}
	function move(e: PointerEvent) {
		const p = svgPoint(e);
		if (!p) return;
		if (dragId !== null) {
			verts = verts.map((v) => (v.id === dragId ? { ...v, x: p[0], y: p[1] } : v));
			return;
		}
		const h = hit(p);
		hoverKey = h ? key(h.s) : null;
	}
	function up() {
		dragId = null;
	}

	$effect(() => {
		// leaving the edge/triangle tools forgets half-chosen corners
		void tool;
		pending = [];
	});

	const tools = [
		{ value: 'move' as Tool, label: 'Move' },
		{ value: 'vertex' as Tool, label: '+ Vertex' },
		{ value: 'edge' as Tool, label: '+ Edge' },
		{ value: 'triangle' as Tool, label: '+ Triangle' },
		{ value: 'erase' as Tool, label: 'Erase' }
	];
	const hints: Record<Tool, string> = {
		move: 'Drag a vertex to move it.',
		vertex: 'Tap empty space to add a vertex.',
		edge: 'Tap two vertices (or empty space) to join them by an edge.',
		triangle: 'Tap three vertices (or empty space) to fill a triangle.',
		erase: 'Tap a vertex, edge or triangle to delete it.'
	};
	const nE = $derived(edges.length);
	const nT = $derived(tris.length);
</script>

<div class="builder">
	<div class="canvas" class:moving={tool === 'move'} bind:clientWidth={cw}>
		<Svg
			viewBox="0 0 {W} {H}"
			maxHeight={420}
			bind:svg={svgEl}
			label="A drawing board for building a simplicial complex from vertices, edges and triangles"
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointerleave={() => (hoverKey = null)}
		>
			<rect x="0" y="0" width={W} height={H} fill="transparent" />
			{#each tris as t (key(t))}
				{@const pts = t.map(P)}
				<polygon
					points={pts.map((q) => q.join(',')).join(' ')}
					class="tri"
					class:bad={badKeys.has(key(t))}
					class:hov={tool === 'erase' && hoverKey === key(t)}
				/>
			{/each}
			{#each missing as m (key(m))}
				{@const [a, b] = m.map(P)}
				<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="missing" />
			{/each}
			{#each edges as e (key(e))}
				{@const [a, b] = e.map(P)}
				<line
					x1={a[0]}
					y1={a[1]}
					x2={b[0]}
					y2={b[1]}
					class="edge"
					class:bad={badKeys.has(key(e))}
					class:fresh={flash.has(key(e))}
					class:hov={tool === 'erase' && hoverKey === key(e)}
				/>
			{/each}
			{#each problems.filter((p) => p.kind !== 'missing-face') as pr, i (i)}
				<circle cx={pr.at[0]} cy={pr.at[1]} r="13" class="marker" />
			{/each}
			{#each problems.filter((p) => p.kind === 'missing-face') as pr, i (i)}
				<circle cx={pr.at[0]} cy={pr.at[1]} r="10" class="marker amber" />
			{/each}
			{#each verts as v (v.id)}
				<g class="vtx" class:pending={pending.includes(v.id)} class:bad={badKeys.has(String(v.id))} class:hov={hoverKey === String(v.id)}>
					<circle cx={v.x} cy={v.y} r={Math.max(20, 16 * u)} class="vhit" />
					<circle cx={v.x} cy={v.y} r={(pending.includes(v.id) ? 9 : 7) * vs} class="vdot" />
					<text x={v.x + 12 * vs} y={v.y - 10 * vs} class="vlbl" style="font-size:{12 * vs}px">{v.id}</text>
				</g>
			{/each}
		</Svg>
	</div>
	<div class="side ui" aria-live="polite">
		<div class="fv">
			<div><span class="k">vertices</span><span class="n">{verts.length}</span></div>
			<div><span class="k">edges</span><span class="n">{nE}</span></div>
			<div><span class="k">triangles</span><span class="n">{nT}</span></div>
		</div>
		<div class="fvec"><TeX tex={`(n_0, n_1, n_2) = (${verts.length}, ${nE}, ${nT})`} /></div>
		{#if problems.length === 0}
			<div class="status ok">✓ This is a simplicial complex.</div>
		{:else}
			<div class="status bad">✗ Not a simplicial complex ({problems.length} {problems.length === 1 ? 'problem' : 'problems'})</div>
			<ul class="probs">
				{#each problems.slice(0, 3) as pr, i (i)}
					<li class:amber={pr.kind === 'missing-face'}>{describe(pr, name)}</li>
				{/each}
				{#if problems.length > 3}<li class="more">…and {problems.length - 3} more.</li>{/if}
			</ul>
		{/if}
		<div class="hint">{hints[tool]}</div>
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={tool} options={tools} label="Tool" />
	<Toggle bind:checked={autofill} label="Fill in missing faces (rule 1)" />
</div>
<div class="bar presets ui">
	<span class="plabel">Start from:</span>
	{#each Object.entries(presets) as [k, p] (k)}
		<Button variant="subtle" onclick={() => load(k)}>{p.name}</Button>
	{/each}
	<Button
		variant="subtle"
		onclick={() => {
			verts = [];
			gens = [];
			pending = [];
		}}>Clear</Button
	>
</div>

<style>
	.builder {
		display: grid;
		grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
		align-items: stretch;
	}
	.canvas {
		padding: 0.6rem 0.4rem 0.4rem 0.8rem;
		touch-action: pan-y;
		user-select: none;
	}
	.canvas :global(svg) {
		cursor: crosshair;
	}
	.canvas.moving :global(svg) {
		cursor: default;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.13);
		stroke: none;
		transition: fill 0.2s;
	}
	.tri.bad {
		fill: rgba(242, 141, 182, 0.22);
	}
	.tri.hov,
	.edge.hov {
		opacity: 0.5;
	}
	.edge {
		stroke: rgba(235, 229, 213, 0.8);
		stroke-width: 2.4;
		stroke-linecap: round;
		transition: stroke 0.3s;
	}
	.edge.bad {
		stroke: var(--rose);
	}
	.edge.fresh {
		stroke: var(--teal);
		stroke-width: 4;
		filter: url(#glow);
	}
	.missing {
		stroke: var(--amber);
		stroke-width: 2.4;
		stroke-dasharray: 4 6;
		stroke-linecap: round;
	}
	.marker {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2;
		filter: url(#glow);
		pointer-events: none;
	}
	.marker.amber {
		stroke: var(--amber);
	}
	.vhit {
		fill: transparent;
		touch-action: none;
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.5;
		transition: r 0.15s;
	}
	.vtx.pending .vdot {
		fill: var(--gold-bright);
		filter: url(#glow-strong);
	}
	.vtx.bad .vdot {
		stroke: var(--rose);
		stroke-width: 2.5;
	}
	.vtx.hov .vdot {
		stroke: var(--gold-bright);
	}
	.vlbl {
		font-family: var(--font-ui);
		fill: var(--ink-faint) !important;
		pointer-events: none;
	}
	.moving .vtx {
		cursor: grab;
	}
	.side {
		padding: 1rem 1.1rem 0.8rem 0.6rem;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.82rem;
	}
	.fv {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.4rem;
	}
	.fv > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.45rem 0.2rem;
		border-radius: 9px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
	}
	.k {
		font-size: 0.66rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.n {
		font-size: 1.5rem;
		font-weight: 650;
		color: var(--gold-bright);
		font-variant-numeric: tabular-nums;
	}
	.fvec {
		text-align: center;
		color: var(--ink-dim);
	}
	.status {
		font-weight: 600;
		font-size: 0.86rem;
	}
	.status.ok {
		color: var(--green);
	}
	.status.bad {
		color: var(--rose);
	}
	.probs {
		margin: 0;
		padding-left: 1.1em !important;
		color: var(--ink-dim);
		font-size: 0.78rem;
		line-height: 1.45;
	}
	.probs li {
		margin: 0.2em 0;
	}
	.probs li::before {
		background: var(--rose) !important;
		box-shadow: none !important;
	}
	.probs li.amber::before {
		background: var(--amber) !important;
	}
	.more {
		color: var(--ink-faint);
	}
	.hint {
		margin-top: auto;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		padding: 0.75rem 1.2rem 0.8rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.presets {
		padding-top: 0.4rem;
		gap: 0.2rem 0.4rem;
		border-top: 0;
	}
	.plabel {
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin-right: 0.3rem;
	}
	@media (max-width: 760px) {
		.builder {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			padding: 0.2rem 1rem 0.8rem;
		}
	}
</style>
