<script lang="ts">
	// Figure: polyhedra with tunnels. Lhuilier's picture frame has V − E + F = 0;
	// a slab with g square tunnels has V − E + F = 2 − 2g.
	import * as THREE from 'three';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { disposeTree } from '$lib/three/materials';
	import { pictureFrame, tunnelSlab } from './tunnels';
	import { meshCounts } from './mesh';
	import { buildPolyView, fitPositions } from './poly3d';
	import { fitCamera } from '../simplicial-complexes/kit3d';

	let mode = $state<'frame' | 'slab'>('frame');
	let g = $state(2);
	const shape = $derived(mode === 'frame' ? pictureFrame(3, 1.2, 1) : tunnelSlab(g));
	const c = $derived(meshCounts(shape));
	const genus = $derived(mode === 'frame' ? 1 : g);

	type Api = { show(key: string, pos: [number, number, number][], faces: number[][]): void };
	let api = $state.raw<Api | null>(null);
	$effect(() => {
		const key = `${mode}-${g}`;
		const s = shape;
		api?.show(key, s.pos, s.faces);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate } = ctx;
		const offFit = fitCamera(ctx, 2.2);
		const holder = new THREE.Group();
		holder.rotation.set(0.62, 0.35, 0);
		scene.add(holder);
		let built = '';
		let group: THREE.Group | null = null;
		api = {
			show(key, pos, faces) {
				if (key === built) return;
				if (group) {
					holder.remove(group);
					disposeTree(group);
				}
				const fitted = fitPositions(pos, key.startsWith('frame') ? 1.75 : 2.15);
				const v = buildPolyView(fitted, faces, { edgeRadius: 0.016, vertexSize: 0.038, faceOpacity: 0.5, hues: 5 });
				group = v.group;
				holder.add(group);
				built = key;
				invalidate();
			}
		};
		api.show(`${mode}-${g}`, shape.pos, shape.faces);
		return {
			dispose() {
				offFit();
				api = null;
			}
		};
	}
</script>

<div class="wrap">
	<div class="stage">
		<Scene3D
			{setup}
			height={400}
			camera={{ position: [0, 1.2, 6.2], fov: 38 }}
			controls={{ autoRotate: true, autoRotateSpeed: 0.5 }}
			label="A polyhedron with square tunnels through it, with its numbers of vertices, edges and faces"
		/>
	</div>
	<div class="side ui" aria-live="polite">
		<div class="name">
			{#if mode === 'frame'}Lhuilier’s picture frame{:else}A slab with {g} tunnel{g === 1 ? '' : 's'}{/if}
		</div>
		<div class="counts">
			<div><span class="n v">{c.V}</span><span class="k">vertices</span></div>
			<div><span class="n e">{c.E}</span><span class="k">edges</span></div>
			<div><span class="n f">{c.F}</span><span class="k">faces</span></div>
		</div>
		<div class="formula">
			<TeX
				tex={`\\textcolor{#f2d08f}{V} - \\textcolor{#5fd6cf}{E} + \\textcolor{#a493ff}{F} = ${c.V} - ${c.E} + ${c.F} = ${c.chi}`}
				display
			/>
			<TeX tex={`2 - 2g = 2 - 2\\cdot ${genus} = ${2 - 2 * genus}`} display />
		</div>
		<p class="tip">
			{#if mode === 'frame'}
				Not 2! Each face is a flat polygon and every edge joins two faces — but there is a tunnel through the solid.
			{:else}
				Each tunnel lowers V − E + F by 2. Drag the slider.
			{/if}
		</p>
	</div>
</div>
<div class="bar ui">
	<Segmented
		bind:value={mode}
		options={[
			{ value: 'frame', label: 'Picture frame' },
			{ value: 'slab', label: 'Slab of cubes' }
		]}
		label="Which polyhedron"
	/>
	{#if mode === 'slab'}
		<div class="sl"><Slider bind:value={g} min={0} max={4} step={1} label="Number of tunnels g" /></div>
	{/if}
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
		gap: 0.55rem;
	}
	.name {
		font-family: var(--font-elegant);
		font-size: 1.35rem;
		color: var(--ink-bright);
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
	.formula {
		color: var(--ink-bright);
	}
	.formula :global(.math-block) {
		margin: 0.15rem 0;
	}
	.tip {
		font-size: 0.78rem;
		color: var(--ink-dim);
		margin: 0 !important;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.2rem;
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.sl {
		flex: 1;
		min-width: 12rem;
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
