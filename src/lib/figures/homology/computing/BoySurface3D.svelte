<script lang="ts">
	// Boy's surface, an immersion of ℝP² in space, carrying the six-vertex
	// triangulation of the hexagon picture. The gold loop is c = 4→5→6→4:
	// half of the hexagon's rim, which closes up because opposite rim points
	// are the same point.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { fitCamera } from '../invariance/three-fit';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { projectivePlane } from '../homology-groups/complexes';
	import { buildFlat3D, mappedLoop, boyMap, glassUnderlay } from '../homology-groups/surface3d';
	import type { Pt } from '../homology-groups/flat';

	const ex = projectivePlane();
	let showMesh = $state(true);
	let api: { mesh(on: boolean): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, label } = ctx;
		// on narrow canvases pull the camera back so the whole surface stays in frame
		const unfit = fitCamera(ctx, 1.5, 0.9);
		const map = boyMap(2.2, 1.15);
		scene.add(glassUnderlay(surfaceGeometry(map.fn, 220, 90), { opacity: 0.5, grid: [0, 0], brightness: 0.95 }));
		const cx = buildFlat3D(ex.L, map, { edgeRadius: 0.008, lift: 0.01, vertexSize: 0.026 });
		scene.add(cx.group);
		// half the rim: P0 (4) → P1 (5) → P2 (6) → P3 (4, the antipode of P0)
		const rim = ex.L.verts.filter((v) => Math.hypot(v.q[0], v.q[1]) > 2).sort((a, b) => ang(a.q) - ang(b.q));
		function ang(q: Pt) {
			const a = Math.atan2(q[1], q[0]) - (2 * Math.PI) / 3;
			return ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
		}
		const half = rim.slice(0, 4).map((v) => v.q);
		const loop = mappedLoop(map, half, { color: 'gold', closed: false, radius: 0.03, lift: 0.012 });
		scene.add(loop);
		for (const v of [1, 2, 3, 4, 5, 6]) {
			const i = ex.K.indexOf([v]);
			const p = cx.vertexPosition(i);
			label(p.multiplyScalar(1.08), tex(String(v)), { className: v >= 4 ? 'gold small' : 'small' });
		}
		const mid = cx.edgeMidpoint(ex.K.indexOf([5, 6]));
		label(mid.multiplyScalar(1.15), tex('c'), { className: 'gold' });
		api = {
			mesh(on) {
				cx.group.visible = on;
			}
		};
		api.mesh(showMesh);
		return {
			dispose: () => {
				unfit();
				api = null;
			}
		};
	}
	$effect(() => {
		const on = showMesh;
		api?.mesh(on);
	});
</script>

<div class="boy">
	<Scene3D {setup} height={420} animate controls={{ autoRotate: true, autoRotateSpeed: 0.5 }} camera={{ position: [0, 0.6, 4.4], target: [0, -0.45, 0] }} label="Boy's surface, a model of the real projective plane in space, with the loop c glowing in gold." />
	<div class="ctl ui">
		<Toggle bind:checked={showMesh} label="show the triangulation" />
	</div>
</div>

<style>
	.ctl {
		display: flex;
		justify-content: flex-end;
		padding: 0.7rem 1.1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
