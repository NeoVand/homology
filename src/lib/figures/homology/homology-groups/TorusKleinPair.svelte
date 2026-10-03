<script lang="ts">
	// Torus and Klein bottle side by side, each triangulated by a 3×3 grid.
	// Through the ℤ/2 lens they look identical (Betti numbers 1, 2, 1);
	// through the ℤ lens the Klein bottle's orientation clash shows up as
	// ∂(Σ t) = 2a: an element of order two.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	
	import { surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { torusGrid, kleinGrid } from './complexes';
	import { counterclockwise, type Pt } from './flat';
	import { buildFlat3D, mappedLoop, torusMap, kleinMap, glassUnderlay, type SurfaceMap } from './surface3d';
	import type * as THREE from 'three';
	import { untrack } from 'svelte';

	type Lens = 'Z2' | 'Z';
	let { lens: lens0 = 'Z2', toggle = false }: { lens?: Lens; toggle?: boolean } = $props();
	let lens = $state<Lens>(untrack(() => lens0));

	const T = torusGrid();
	const Kb = kleinGrid();
	const apis: ({ set(l: Lens): void } | null)[] = [null, null];

	function makeSetup(which: 0 | 1) {
		return function setup({ scene, label }: SceneContext) {
			const ex = which === 0 ? T : Kb;
			const map: SurfaceMap = which === 0 ? torusMap(1.45, 0.58) : kleinMap(0.2);
			scene.add(glassUnderlay(surfaceGeometry(map.fn, 170, 70), { opacity: 0.5, grid: [0, 0], brightness: 0.95 }));
			const cx = buildFlat3D(ex.L, map, { edgeRadius: 0.0085, lift: 0.012, vertexSize: 0.028 });
			scene.add(cx.group);
			const row: Pt[] = [0, 1, 2, 3].map((i) => [i, 0]);
			const col: Pt[] = [0, 1, 2, 3].map((j) => [0, j]);
			const loopA = mappedLoop(map, row, { color: 'gold', closed: false, radius: 0.028 });
			const loopB = mappedLoop(map, col, { color: 'rose', closed: false, radius: 0.028 });
			// the doubled seam for the Klein bottle (shown in the ℤ lens)
			const seam = mappedLoop(map, row, { color: 'rose', closed: false, radius: 0.05, lift: 0.045 });
			scene.add(loopA, loopB, seam);
			const at = (v: number, up = 0.25): THREE.Vector3 => {
				const p = cx.vertexPosition(ex.K.indexOf([v]));
				p.y += up;
				return p;
			};
			const lA = label(which === 0 ? at(1, 0.2).multiplyScalar(1.08) : at(1, -0.28), tex('a'), { className: 'gold' });
			const lB = label(which === 0 ? at(3, 0.3) : at(6, 0.0).add({ x: 0.28, y: 0, z: 0 } as THREE.Vector3), tex('b'), { className: 'rose' });
			const l2a = label(which === 0 ? at(1) : at(2, -0.5), tex('\\partial(\\textstyle\\sum t) = 2a'), { className: 'rose small' });
			const eps = counterclockwise(ex.L);
			apis[which] = {
				set(l) {
					const all = ex.K.simplices[2].map((_, t) => t);
					for (const t of all) cx.setTri(t, l === 'Z2' ? 'violet' : null, 0.16);
					cx.setOrientation(l === 'Z' ? eps : null, 'violet');
					seam.visible = which === 1 && l === 'Z';
					loopA.visible = !(which === 1 && l === 'Z');
					l2a.show(which === 1 && l === 'Z');
					lA.show(true);
					lB.show(true);
				}
			};
			apis[which]!.set(lens);
			return { dispose: () => (apis[which] = null) };
		};
	}
	const setupTorus = makeSetup(0);
	const setupKlein = makeSetup(1);
	$effect(() => {
		const l = lens;
		apis.forEach((a) => a?.set(l));
	});

	const rows = {
		Z2: [
			['H_0', '\\Z/2', '\\Z/2'],
			['H_1', '(\\Z/2)^2', '(\\Z/2)^2'],
			['H_2', '\\Z/2', '\\Z/2']
		],
		Z: [
			['H_0', '\\Z', '\\Z'],
			['H_1', '\\Z^2', '\\Z \\oplus \\hole{\\Z/2}'],
			['H_2', '\\Z', '\\hole{0}']
		]
	} as const;
</script>

<div class="pair">
	<div class="scenes">
		<div class="one">
			<Scene3D setup={setupTorus} height={330} animate controls={{ autoRotate: true, autoRotateSpeed: 0.5 }} camera={{ position: [0, 3.1, 5.2] }} label="A triangulated torus with loops a and b" />
			<div class="name ui">Torus <TeX tex="T^2" /> · orientable</div>
		</div>
		<div class="one">
			<Scene3D
				setup={setupKlein}
				height={330}
				animate
				controls={{ autoRotate: true, autoRotateSpeed: 0.5 }}
				camera={{ position: [-0.17, 0.6, 6.4], target: [-0.17, -0.2, 0] }}
				label="A triangulated Klein bottle, immersed in space with a self-intersection, with loops a and b"
			/>
			<div class="name ui">Klein bottle <TeX tex="K" /> · non-orientable</div>
		</div>
	</div>
	<div class="bottom ui">
		{#if toggle}
			<Segmented
				bind:value={lens}
				options={[
					{ value: 'Z2', label: 'coefficients ℤ/2' },
					{ value: 'Z', label: 'coefficients ℤ' }
				]}
				label="Coefficients"
			/>
		{/if}
		<table class="ht">
			<thead>
				<tr><th></th><th><TeX tex="T^2" /></th><th><TeX tex="K" /></th></tr>
			</thead>
			<tbody>
				{#each rows[lens] as r (r[0])}
					<tr>
						<td class="k"><TeX tex={r[0] + (lens === 'Z2' ? '(\\,\\cdot\\,;\\Z/2)' : '')} /></td>
						<td><TeX tex={r[1]} /></td>
						<td class:diff={r[1] !== r[2]}><TeX tex={r[2]} /></td>
					</tr>
				{/each}
			</tbody>
		</table>
		<div class="verdict" class:same={lens === 'Z2'}>
			{#if lens === 'Z2'}
				Same numbers: <TeX tex="1,\ 2,\ 1" /> for both.
			{:else}
				Different groups: the Klein bottle has torsion.
			{/if}
		</div>
	</div>
</div>

<style>
	.scenes {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	@media (max-width: 700px) {
		.scenes {
			grid-template-columns: 1fr;
		}
	}
	.one {
		position: relative;
	}
	.one + .one {
		border-left: 1px solid var(--line-faint);
	}
	@media (max-width: 700px) {
		.one + .one {
			border-left: 0;
			border-top: 1px solid var(--line-faint);
		}
	}
	.name {
		position: absolute;
		left: 0.9rem;
		top: 0.7rem;
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		pointer-events: none;
	}
	.bottom {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1.6rem;
		align-items: center;
		justify-content: center;
		padding: 0.8rem 1.1rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.ht {
		width: auto !important;
		margin: 0 !important;
		font-size: 0.92rem !important;
	}
	.ht th,
	.ht td {
		padding: 0.3em 0.9em !important;
		text-align: center !important;
	}
	.ht td.k {
		color: var(--ink-dim);
	}
	.ht td.diff {
		background: rgba(242, 141, 182, 0.08);
	}
	.verdict {
		font-size: 0.86rem;
		color: var(--rose);
		max-width: 16rem;
	}
	.verdict.same {
		color: var(--gold-bright);
	}
</style>
