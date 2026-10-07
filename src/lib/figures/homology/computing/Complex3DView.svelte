<script lang="ts">
	// A 3D picture of one of the calculator's surfaces, with highlighted
	// simplices (generators). Torus, Klein bottle, ℝP² and Möbius band are
	// drawn on their parametrized surfaces; the sphere and the ball as a
	// tetrahedron.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { surfaceGeometry, mobius as mobiusFn } from '$lib/three/surfaces';
	import { buildComplex3D, solids } from '$lib/three/complex3d';
	import { buildFlat3D, torusMap, kleinMap, boyMap, mobiusMap, glassUnderlay, tubeAlong, type SurfaceMap } from '../homology-groups/surface3d';
	import { disposeTree } from '$lib/three/materials';
	import * as THREE from 'three';
	import type { Example } from '../homology-groups/complexes';
	import type { View3D } from './calculator';

	let {
		ex,
		view,
		edges = new Map(),
		tris = new Map()
	}: {
		ex: Example;
		view: View3D;
		/** abstract edge index → colour name */
		edges?: Map<number, string>;
		tris?: Map<number, string>;
	} = $props();

	let api: { paint(e: Map<number, string>, t: Map<number, string>): void } | null = null;

	function setup({ scene }: SceneContext) {
		if (view === 'sphere' || view === 'ball') {
			const pos = solids.tetrahedron(1.5);
			const cx = buildComplex3D(ex.K, pos, { edgeRadius: 0.02, vertexSize: 0.05, faceOpacity: view === 'ball' ? 0.22 : 0.12 });
			cx.group.rotation.y = 0.4;
			scene.add(cx.group);
			api = {
				paint(e, t) {
					cx.reset();
					e.forEach((c, i) => cx.setEdge(i, c, 1.5));
					t.forEach((c, i) => cx.setFace(i, c, 0.4));
				}
			};
		} else {
			const map: SurfaceMap =
				view === 'torus' ? torusMap(1.5, 0.58) : view === 'klein' ? kleinMap(0.19) : view === 'rp2' ? boyMap(2.2, 1.15) : mobiusMap(1.15, 1.5, 1.0);
			const fn = view === 'mobius' ? mobiusFn(1.5, 1.0) : map.fn;
			scene.add(glassUnderlay(surfaceGeometry(fn, 180, 70), { opacity: 0.45, grid: [0, 0], brightness: 0.95 }));
			const cx = buildFlat3D(ex.L, map, { edgeRadius: 0.009, lift: 0.012, vertexSize: 0.028 });
			scene.add(cx.group);
			let overlay: THREE.Group | null = null;
			api = {
				paint(e, t) {
					for (let i = 0; i < ex.K.count(2); i++) cx.setTri(i, null);
					t.forEach((c, i) => cx.setTri(i, c, 0.3));
					if (overlay) {
						scene.remove(overlay);
						disposeTree(overlay);
					}
					overlay = new THREE.Group();
					e.forEach((c, i) => {
						const pts = cx.edgePoints(i);
						if (pts) overlay!.add(tubeAlong(pts, { color: c, radius: 0.024, halo: true, intensity: 1, haloIntensity: 0.6 }));
					});
					scene.add(overlay);
				}
			};
		}
		api.paint(edges, tris);
		return { dispose: () => (api = null) };
	}
	$effect(() => {
		const e = edges;
		const t = tris;
		api?.paint(e, t);
	});
	const camera = $derived(
		view === 'klein'
			? { position: [-0.17, 0.7, 6.3] as [number, number, number], target: [-0.17, 0, 0] as [number, number, number] }
			: view === 'rp2'
				? { position: [0, 0.6, 4.4] as [number, number, number], target: [0, -0.45, 0] as [number, number, number] }
				: view === 'mobius'
					? { position: [0, 2.6, 4.4] as [number, number, number] }
					: view === 'torus'
						? { position: [0, 3.2, 5.0] as [number, number, number] }
						: { position: [0, 1.4, 4.8] as [number, number, number] }
	);
</script>

<Scene3D {setup} height={360} animate {camera} controls={{ autoRotate: true, autoRotateSpeed: 0.5 }} label="A 3D model of {ex.name} with its generators highlighted" />
