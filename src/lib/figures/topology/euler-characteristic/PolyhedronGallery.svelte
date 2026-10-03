<script lang="ts">
	// Figure: a gallery of polyhedra with live counts of vertices, edges and faces.
	// Whatever the solid, V − E + F = 2; and the angle defects add up to 720°.
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { disposeTree } from '$lib/three/materials';
	import { solids, counts, angleDefects, normalized, type Polyhedron } from './polyhedra';
	import { buildPolyView, type PolyView } from './poly3d';
	import { fitCamera } from '../simplicial-complexes/kit3d';

	type Key = keyof typeof solids;
	let which = $state<Key>('cube');
	let count = $state<'none' | 'V' | 'E' | 'F'>('none');
	let lit = $state(0);
	let reduced = $state(false);
	onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));

	const cache = new Map<Key, Polyhedron>();
	function get(k: Key): Polyhedron {
		if (!cache.has(k)) cache.set(k, normalized(solids[k].make(), 1.55));
		return cache.get(k)!;
	}
	const P = $derived(get(which));
	const c = $derived(counts(P));
	const defects = $derived(angleDefects(P).map((d) => (d * 180) / Math.PI));
	const defectText = $derived.by(() => {
		const min = Math.min(...defects);
		const max = Math.max(...defects);
		const fmt = (x: number) => (Math.abs(x - Math.round(x)) < 0.05 ? String(Math.round(x)) : x.toFixed(1));
		return Math.abs(max - min) < 0.05
			? `every corner falls ${fmt(min)}° short of a flat 360°, and ${c.V} × ${fmt(min)}° = 720°`
			: `the corners fall between ${fmt(min)}° and ${fmt(max)}° short of a flat 360°, and together they fall short by exactly 720°`;
	});
	const total = $derived(count === 'V' ? c.V : count === 'E' ? c.E : count === 'F' ? c.F : 0);

	$effect(() => {
		void which;
		count = 'none';
	});
	$effect(() => {
		const T = total;
		if (T === 0) {
			lit = 0;
			return;
		}
		if (reduced) {
			lit = T;
			return;
		}
		lit = 0;
		let i = 0;
		const dt = Math.max(28, Math.min(260, 1500 / T));
		const id = setInterval(() => {
			i++;
			lit = i;
			if (i >= T) clearInterval(id);
		}, dt);
		return () => clearInterval(id);
	});

	type Api = { show(k: Key, mode: string, lit: number): void };
	let api = $state.raw<Api | null>(null);
	$effect(() => {
		const args = [which, count, lit] as const;
		api?.show(...args);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate } = ctx;
		const offFit = fitCamera(ctx, 1.65);
		let view: PolyView | null = null;
		let built: Key | null = null;
		const holder = new THREE.Group();
		holder.rotation.set(0.35, 0.4, 0.05);
		scene.add(holder);
		api = {
			show(k, mode, n) {
				if (k !== built) {
					if (view) {
						holder.remove(view.group);
						disposeTree(view.group);
					}
					const poly = get(k);
					view = buildPolyView(poly.verts, poly.faces, {
						edgeRadius: k === 'soccer' ? 0.014 : 0.019,
						vertexSize: k === 'soccer' ? 0.035 : 0.05
					});
					holder.add(view.group);
					built = k;
				}
				const v = view!;
				v.reset();
				if (mode === 'V') for (let i = 0; i < Math.min(n, v.verts.length); i++) v.setVertex(i, i === n - 1 ? 'goldPale' : 'gold', i === n - 1 ? 1.9 : 1.35);
				if (mode === 'E') for (let i = 0; i < Math.min(n, v.edges.length); i++) v.setEdge(i, i === n - 1 ? 'ivory' : 'teal', i === n - 1 ? 2.4 : 1.6);
				if (mode === 'F') for (let i = 0; i < Math.min(n, v.faces.length); i++) v.setFace(i, 'violet', i === n - 1 ? 0.55 : 0.28);
				invalidate();
			}
		};
		api.show(which, count, lit);
		return {
			dispose() {
				offFit();
				api = null;
			}
		};
	}

	const options = (Object.keys(solids) as Key[]).map((k) => ({ value: k, label: solids[k].name }));
</script>

<div class="wrap">
	<div class="stage">
		<Scene3D
			{setup}
			height={400}
			camera={{ position: [0, 0.4, 5.6], fov: 38 }}
			controls={{ autoRotate: true, autoRotateSpeed: 0.7 }}
			label="A polyhedron with glowing edges and vertices; its numbers of vertices, edges and faces are shown beside it"
		/>
	</div>
	<div class="side ui" aria-live="polite">
		<div class="name">{solids[which].name}</div>
		<div class="counts">
			<button class="cnt v" class:on={count === 'V'} onclick={() => (count = count === 'V' ? 'none' : 'V')}>
				<span class="n">{count === 'V' ? lit : c.V}</span><span class="k">vertices</span>
			</button>
			<button class="cnt e" class:on={count === 'E'} onclick={() => (count = count === 'E' ? 'none' : 'E')}>
				<span class="n">{count === 'E' ? lit : c.E}</span><span class="k">edges</span>
			</button>
			<button class="cnt f" class:on={count === 'F'} onclick={() => (count = count === 'F' ? 'none' : 'F')}>
				<span class="n">{count === 'F' ? lit : c.F}</span><span class="k">faces</span>
			</button>
		</div>
		<div class="formula">
			<TeX
				tex={`\\textcolor{#f2d08f}{V} - \\textcolor{#5fd6cf}{E} + \\textcolor{#a493ff}{F} = ${c.V} - ${c.E} + ${c.F} = ${c.chi}`}
				display
			/>
		</div>
		<p class="defect">Angle defects: {defectText}.</p>
		<p class="tip">Tap a count to watch it being counted.</p>
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={which} {options} label="Choose a polyhedron" />
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
		gap: 0.6rem;
	}
	.name {
		font-family: var(--font-elegant);
		font-size: 1.4rem;
		color: var(--ink-bright);
	}
	.counts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.45rem;
	}
	.cnt {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 0.2rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
		cursor: pointer;
		transition: all 0.2s var(--ease);
		min-height: 3.6rem;
	}
	.cnt:hover {
		border-color: var(--line);
	}
	.cnt .n {
		font-size: 1.6rem;
		font-weight: 650;
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}
	.cnt .k {
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.cnt.v .n {
		color: #f2d08f;
	}
	.cnt.e .n {
		color: #5fd6cf;
	}
	.cnt.f .n {
		color: #a493ff;
	}
	.cnt.on {
		background: rgba(242, 208, 143, 0.08);
		border-color: var(--gold);
		box-shadow: 0 0 14px -4px rgba(242, 205, 135, 0.5);
	}
	.formula {
		font-size: 1.05rem;
		color: var(--ink-bright);
	}
	.formula :global(.math-block) {
		margin: 0.2rem 0;
	}
	.defect {
		font-size: 0.78rem;
		color: var(--ink-dim);
		margin: 0 !important;
		line-height: 1.5;
	}
	.tip {
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin: 0 !important;
	}
	.bar {
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
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
