<script lang="ts">
	// Figure: subdivide a cube by hand — split edges, cut faces with diagonals,
	// put a vertex in a face — and watch V, E and F change while V − E + F stays 2.
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { disposeTree } from '$lib/three/materials';
	import { solids, normalized } from './polyhedra';
	import { splitEdge, starFace, addDiagonal, meshCounts, meshEdges, type PolyMesh, type Move } from './mesh';
	import { buildPolyView, type PolyView } from './poly3d';
	import { onCanvasClick } from '../simplicial-complexes/kit3d';
	import { rng } from './graph';

	const start = (): PolyMesh => {
		const P = normalized(solids.cube.make(), 1.6);
		return { pos: P.verts, faces: P.faces };
	};
	let mesh = $state.raw<PolyMesh>(start());
	let history = $state.raw<PolyMesh[]>([]);
	let tool = $state<Move>('split-edge');
	let last = $state<{ dV: number; dE: number; dF: number; what: string } | null>(null);
	let note = $state('');
	let busy = $state(false);
	let reduced = false;
	let seed = 11;
	onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));

	const c = $derived(meshCounts(mesh));

	function apply(next: PolyMesh | null, what: string) {
		if (!next) {
			note = 'That face is already a triangle — it has no diagonal. Try another face, or another tool.';
			return;
		}
		const a = meshCounts(mesh);
		const b = meshCounts(next);
		history = [...history.slice(-40), mesh];
		mesh = next;
		last = { dV: b.V - a.V, dE: b.E - a.E, dF: b.F - a.F, what };
		note = '';
	}
	function doMove(kind: Move, index: number) {
		if (kind === 'split-edge') {
			const e = meshEdges(mesh)[index];
			if (e) apply(splitEdge(mesh, e[0], e[1]), 'split an edge');
		} else if (kind === 'diagonal') apply(addDiagonal(mesh, index), 'cut a face along a diagonal');
		else apply(starFace(mesh, index), 'added a vertex inside a face');
	}
	function undo() {
		if (!history.length) return;
		mesh = history[history.length - 1];
		history = history.slice(0, -1);
		last = null;
	}
	async function randomMoves() {
		if (busy) return;
		busy = true;
		const r = rng(seed++);
		for (let k = 0; k < 10; k++) {
			const t = r();
			if (t < 0.4) doMove('split-edge', Math.floor(r() * meshEdges(mesh).length));
			else if (t < 0.75) {
				// pick a face that has a diagonal
				const cands = mesh.faces.map((f, i) => (f.length >= 4 ? i : -1)).filter((i) => i >= 0);
				if (cands.length) doMove('diagonal', cands[Math.floor(r() * cands.length)]);
				else doMove('star', Math.floor(r() * mesh.faces.length));
			} else doMove('star', Math.floor(r() * mesh.faces.length));
			if (!reduced) await new Promise((res) => setTimeout(res, 260));
		}
		busy = false;
	}

	type Api = { show(m: PolyMesh, tool: Move): void };
	let api = $state.raw<Api | null>(null);
	$effect(() => {
		api?.show(mesh, tool);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate, pick, canvas } = ctx;
		const holder = new THREE.Group();
		holder.rotation.set(0.42, 0.62, 0);
		scene.add(holder);
		let view: PolyView | null = null;
		let builtFor: PolyMesh | null = null;
		let curTool: Move = tool;
		let hot: { kind: 'edge' | 'face'; i: number } | null = null;

		function paintHot() {
			if (!view) return;
			view.reset();
			if (hot?.kind === 'edge') view.setEdge(hot.i, 'gold', 2.2);
			if (hot?.kind === 'face') view.setFace(hot.i, curTool === 'star' ? 'teal' : 'violet', 0.35);
			invalidate();
		}
		function target(e: PointerEvent | MouseEvent): { kind: 'edge' | 'face'; i: number } | null {
			if (!view) return null;
			if (curTool === 'split-edge') {
				const hit = pick(e, view.edgePicks)[0];
				return hit ? { kind: 'edge', i: hit.object.userData.index } : null;
			}
			const hit = pick(e, view.faces)[0];
			return hit ? { kind: 'face', i: hit.object.userData.index } : null;
		}
		const offClick = onCanvasClick(canvas, (e) => {
			const t = target(e);
			if (!t || !view) return;
			if (t.kind === 'edge') {
				const [p, q] = view.edgeList[t.i];
				apply(splitEdge(mesh, p, q), 'split an edge');
			} else doMove(curTool, t.i);
		});
		const onMove = (e: PointerEvent) => {
			if (e.pointerType !== 'mouse') return;
			const t = target(e);
			if (t?.kind === hot?.kind && t?.i === hot?.i) return;
			hot = t;
			paintHot();
			canvas.style.cursor = t ? 'pointer' : '';
		};
		canvas.addEventListener('pointermove', onMove);

		api = {
			show(m, tl) {
				curTool = tl;
				if (m !== builtFor) {
					if (view) {
						holder.remove(view.group);
						disposeTree(view.group);
					}
					view = buildPolyView(m.pos, m.faces, { pickEdges: true, edgeRadius: 0.017, vertexSize: 0.045, faceOpacity: 0.4 });
					holder.add(view.group);
					builtFor = m;
					hot = null;
				}
				paintHot();
			}
		};
		api.show(mesh, tool);
		return {
			dispose() {
				offClick();
				canvas.removeEventListener('pointermove', onMove);
				api = null;
			}
		};
	}

	const tools = [
		{ value: 'split-edge' as Move, label: 'Split an edge' },
		{ value: 'diagonal' as Move, label: 'Cut a face' },
		{ value: 'star' as Move, label: 'Vertex in a face' }
	];
	const sign = (x: number) => (x > 0 ? `+${x}` : `${x}`);
</script>

<div class="wrap">
	<div class="stage">
		<Scene3D
			{setup}
			height={400}
			camera={{ position: [0, 0.3, 5.8], fov: 38 }}
			controls={{ autoRotate: false }}
			label="A cube that you can subdivide by clicking its edges and faces; the counts of vertices, edges and faces are shown"
		/>
	</div>
	<div class="side ui" aria-live="polite">
		<div class="counts">
			<div><span class="n v">{c.V}</span><span class="k">vertices</span></div>
			<div><span class="n e">{c.E}</span><span class="k">edges</span></div>
			<div><span class="n f">{c.F}</span><span class="k">faces</span></div>
		</div>
		<div class="chi">
			<span class="lbl">V − E + F</span>
			<span class="big">{c.chi}</span>
		</div>
		{#if last}
			<div class="delta">
				You {last.what}:
				<TeX tex={`\\Delta V = ${sign(last.dV)},\\ \\Delta E = ${sign(last.dE)},\\ \\Delta F = ${sign(last.dF)}`} />
				<span class="ok">so V − E + F changes by {last.dV - last.dE + last.dF === 0 ? '0' : last.dV - last.dE + last.dF}.</span>
			</div>
		{:else}
			<div class="delta dim">Choose a tool, then click an edge or a face of the cube. Drag to turn it.</div>
		{/if}
		{#if note}<div class="note">{note}</div>{/if}
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={tool} options={tools} label="Subdivision move" />
	<div class="btns">
		<Button variant="ghost" onclick={randomMoves} disabled={busy}>Ten random moves</Button>
		<Button variant="subtle" onclick={undo} disabled={!history.length}>Undo</Button>
		<Button
			variant="subtle"
			onclick={() => {
				mesh = start();
				history = [];
				last = null;
			}}>Reset</Button
		>
	</div>
</div>

<style>
	.wrap {
		display: grid;
		grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
		align-items: center;
	}
	.side {
		padding: 1rem 1.3rem 0.8rem 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.counts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.45rem;
	}
	.counts > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.45rem 0.2rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
	}
	.n {
		font-size: 1.5rem;
		font-weight: 650;
		font-variant-numeric: tabular-nums;
	}
	.n.v {
		color: #f2d08f;
	}
	.n.e {
		color: #5fd6cf;
	}
	.n.f {
		color: #a493ff;
	}
	.k {
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.chi {
		display: flex;
		align-items: baseline;
		justify-content: center;
		gap: 1rem;
		padding: 0.5rem;
		border-radius: 12px;
		background: radial-gradient(120% 120% at 50% 0%, rgba(242, 208, 143, 0.14), transparent 70%);
		border: 1px solid rgba(242, 208, 143, 0.35);
	}
	.chi .lbl {
		font-size: 0.85rem;
		color: var(--ink-dim);
		letter-spacing: 0.05em;
	}
	.chi .big {
		font-family: var(--font-display);
		font-size: 2.6rem;
		line-height: 1;
		color: var(--gold-bright);
		text-shadow: 0 0 18px rgba(242, 205, 135, 0.65);
	}
	.delta {
		font-size: 0.8rem;
		color: var(--ink-dim);
		line-height: 1.6;
	}
	.delta.dim {
		color: var(--ink-faint);
	}
	.ok {
		color: var(--green);
	}
	.note {
		font-size: 0.78rem;
		color: var(--amber);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.6rem 1rem;
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	@media (max-width: 760px) {
		.wrap {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			padding: 0.2rem 1rem 0.8rem;
		}
	}
</style>
