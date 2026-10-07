<script lang="ts">
	// The 3×3 torus on a doughnut: the generators a, b of H₁, a homologous
	// copy of a with the strip between them, and the coherently oriented 2-cycle.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	
	import { surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { torusGrid } from './complexes';
	import { counterclockwise, type Pt } from './flat';
	import { buildFlat3D, mappedLoop, torusMap, glassUnderlay } from './surface3d';
	import type * as THREE from 'three';
	import { fitCamera } from '../invariance/three-fit';

	type Mode = 'a' | 'b' | 'both' | 'slide' | 'shell';
	let mode = $state<Mode>('both');

	const T = torusGrid();
	const eps = counterclockwise(T.L);
	const strip = T.K.simplices[2].map((t, i) => (t.every((v) => v < 6) ? i : -1)).filter((i) => i >= 0);

	const readouts: Record<Mode, string> = {
		a: 'a = [0,1] + [1,2] - [0,2]\\;\\;(\\text{around the hole})',
		b: 'b = [0,3] + [3,6] - [0,6]\\;\\;(\\text{around the tube})',
		both: 'H_1 \\cong \\Z[a] \\oplus \\Z[b] \\cong \\Z^2',
		slide: "a' - a = -\\partial(\\text{strip}) \\;\\Rightarrow\\; [a'] = [a]",
		shell: 'T = \\textstyle\\sum \\pm t,\\;\\; \\partial T = 0,\\;\\; H_2 = \\Z[T]'
	};

	let api: { set(m: Mode): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, label } = ctx;
		// on narrow canvases pull the camera back so the whole torus stays in frame
		const unfit = fitCamera(ctx, 1.5, 0.75);
		const map = torusMap(1.6, 0.62);
		scene.add(glassUnderlay(surfaceGeometry(map.fn, 160, 64), { opacity: 0.55, grid: [0, 0], brightness: 0.95 }));
		const cx = buildFlat3D(T.L, map, { edgeRadius: 0.0095, lift: 0.012 });
		scene.add(cx.group);
		const row = (j: number): Pt[] => [0, 1, 2, 3].map((i) => [i, j]);
		const col = (i: number): Pt[] => [0, 1, 2, 3].map((j) => [i, j]);
		const loopA = mappedLoop(map, row(0), { color: 'gold', closed: false, radius: 0.03 });
		const loopA2 = mappedLoop(map, row(1), { color: 'gold', closed: false, radius: 0.026 });
		const loopB = mappedLoop(map, col(0), { color: 'rose', closed: false, radius: 0.03 });
		scene.add(loopA, loopA2, loopB);
		const tag = (html: string, cls: string, p: THREE.Vector3) => label(p, html, { className: cls });
		const pA = cx.vertexPosition(T.K.indexOf([1])).multiplyScalar(1.12);
		const pB = cx.vertexPosition(T.K.indexOf([3])).multiplyScalar(1.05);
		pB.y += 0.32;
		const lA = tag(tex('a'), 'gold', pA);
		const lB = tag(tex('b'), 'rose', pB);
		const pA2 = cx.vertexPosition(T.K.indexOf([4])).multiplyScalar(1.0);
		pA2.y += 0.25;
		const lA2 = tag(tex("a'"), 'gold', pA2);

		api = {
			set(m) {
				loopA.visible = m === 'a' || m === 'both' || m === 'slide';
				loopB.visible = m === 'b' || m === 'both';
				loopA2.visible = m === 'slide';
				lA.show(loopA.visible);
				lB.show(loopB.visible);
				lA2.show(m === 'slide');
				for (let t = 0; t < T.K.count(2); t++) cx.setTri(t, null);
				if (m === 'slide') for (const t of strip) cx.setTri(t, 0xd2c6ff, 0.62);
				if (m === 'shell') for (let t = 0; t < T.K.count(2); t++) cx.setTri(t, 0xd2c6ff, 0.3);
				cx.setOrientation(m === 'shell' ? eps : null, 'violet');
			}
		};
		api.set(mode);
		return {
			dispose: () => {
				unfit();
				api = null;
			}
		};
	}
	// read `mode` before touching `api`: with `api?.set(mode)` the argument is never
	// evaluated while api is null, so the effect would never subscribe to mode
	$effect(() => {
		const m = mode;
		api?.set(m);
	});
</script>

<div class="tg">
	<Scene3D {setup} height={430} animate controls={{ autoRotate: true, autoRotateSpeed: 0.45 }} camera={{ position: [0, 3.4, 5.6] }} label="A glass torus triangulated by the 3 by 3 grid, with the loop a around the hole and the loop b around the tube." />
	<div class="ctl ui">
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'a', label: 'a' },
				{ value: 'b', label: 'b' },
				{ value: 'both', label: 'a and b' },
				{ value: 'slide', label: "slide a to a′" },
				{ value: 'shell', label: 'the 2-cycle' }
			]}
			label="What to show"
		/>
		<div class="read"><TeX tex={readouts[mode]} /></div>
	</div>
</div>

<style>
	.ctl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.2rem;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1.1rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.read {
		font-size: 1rem;
		color: var(--ink-bright);
	}
</style>
