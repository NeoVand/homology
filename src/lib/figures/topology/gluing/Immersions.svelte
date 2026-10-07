<script lang="ts">
	// A gallery of surfaces that must pass through themselves in 3D, with their
	// double curves in rose — and, for the Klein bottles, a fourth coordinate shown
	// as colour, which pulls the crossing sheets apart.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { glowPoint } from '$lib/three/materials';
	import { ParamSheet, sheetMesh, glowSegments, type P3 } from './sheet';
	import { selfIntersections } from './selfIntersect';
	import { immersions, immersionOrder, sampleGrid, type ImmersionId } from './immersions';

	let which = $state<ImmersionId>('bottle');
	let fourD = $state(false);
	const I = $derived(immersions[which]);

	const notes: Record<ImmersionId, string> = {
		bottle: 'The neck passes through the wall along the rose circle.',
		fig8: 'A figure-eight tube with a half twist; it crosses itself along the rose circle.',
		boy: 'Three sheets meet at the bright triple point; the double curve is three rose loops.',
		crosscap: 'Opposite rim points are zipped together along the rose segment, which ends in two pinch points.'
	};

	let api: { show(id: ImmersionId, fourD: boolean): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, invalidate } = ctx;
		const sheet = new ParamSheet(110, 110);
		const mesh = sheetMesh(sheet.geometry, { opacity: 0.78, grid: [24, 12], gridStrength: 0.26 });
		const holder = new THREE.Group();
		holder.add(mesh.group);
		scene.add(holder);
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const curves = new Map<ImmersionId, ReturnType<typeof glowSegments>>();
		const marks = [0, 1].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'rose', size: 0.05, halo: 9 });
			holder.add(g);
			return g;
		});
		let current: ImmersionId | null = null;
		api = {
			show(id, fd) {
				const im = immersions[id];
				if (id !== current) {
					current = id;
					sheet.update(im.f);
					if (im.w) sheet.setW(im.w);
					for (const m of mesh.materials) m.uniforms.uGrid.value.set(im.grid[0], im.grid[1]);
					mesh.setOutward(sheet.outward);
					// frame it
					const c = sheet.center;
					const g = sheet.geometry.attributes.position.array as Float32Array;
					let mx = 0,
						my = 0;
					for (let i = 0; i < g.length; i += 3) {
						mx = Math.max(mx, Math.abs(g[i] - c.x), Math.abs(g[i + 2] - c.z));
						my = Math.max(my, Math.abs(g[i + 1] - c.y));
					}
					const aspect = camera.aspect || 1.5;
					const scale = 1.85 / Math.max(my, mx / Math.min(1.3, aspect));
					holder.scale.setScalar(scale);
					holder.position.set(-c.x * scale, -c.y * scale, -c.z * scale);
					// the double curve, computed once
					let dc = curves.get(id);
					if (!dc) {
						const segs = im.doubleCurve ?? selfIntersections(sampleGrid(im.f, 96), 96, 96);
						dc = glowSegments(segs, { color: 'rose', width: 2.6, dpr });
						holder.add(dc.group);
						curves.set(id, dc);
					}
					for (const [k, v] of curves) v.setOpacity(k === id ? 1 : 0);
					marks.forEach((m, i) => {
						const p: P3 | undefined = im.marks[i];
						m.visible = !!p;
						if (p) {
							m.position.set(p.x, p.y, p.z);
							m.scale.setScalar(1 / scale);
						}
					});
				}
				mesh.setUniform('uW4', fd && im.w ? 1 : 0);
				invalidate();
			}
		};
		api.show(which, fourD);
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		const id = which;
		const fd = fourD;
		api?.show(id, fd);
	});
</script>

<div class="imm">
	<Scene3D
		{setup}
		height={430}
		camera={{ position: [0, 1.4, 7.4], fov: 38 }}
		controls={{ autoRotate: true, autoRotateSpeed: 0.7 }}
		label="Surfaces that cross themselves in ordinary space: a Klein bottle, a figure-eight Klein bottle, Boy's surface and a cross-cap, with their lines of self-intersection drawn in rose"
	>
		{#if fourD && I.w}
			<div class="legend ui" aria-hidden="true">
				<span>fourth coordinate</span>
				<span class="bar"></span>
				<span class="ends"><i>−1</i><i>+1</i></span>
			</div>
		{/if}
	</Scene3D>
	<div class="note ui" aria-live="polite">{notes[which]}</div>
</div>
<div class="bar2 ui">
	<Segmented bind:value={which} options={immersionOrder.map((k) => ({ value: k, label: immersions[k].label }))} label="Surface" />
	<Toggle bind:checked={fourD} label={I.w ? 'Colour = a fourth coordinate' : 'Fourth coordinate (Klein bottles only)'} />
</div>

<style>
	.imm {
		position: relative;
	}
	.note {
		position: absolute;
		left: 50%;
		bottom: 0.7rem;
		transform: translateX(-50%);
		width: max-content;
		/* clear of the reset-view button in the corner */
		max-width: calc(100% - 7rem);
		font-size: 0.76rem;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.7);
		border: 1px solid var(--line-faint);
		border-radius: 12px;
		padding: 0.3rem 0.8rem;
		text-align: center;
		pointer-events: none;
	}
	@container figure (max-width: 520px) {
		/* too narrow to float over the scene: sit under it instead */
		.note {
			position: static;
			transform: none;
			display: block;
			max-width: calc(100% - 1.6rem);
			margin: 0.2rem auto 0.7rem;
		}
	}
	.legend {
		position: absolute;
		top: 0.8rem;
		left: 0.9rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.68rem;
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		pointer-events: none;
	}
	.legend .bar {
		width: 9rem;
		height: 0.45rem;
		border-radius: 4px;
		background: linear-gradient(90deg, #5fd6cf, #a493ff, #f4d79c);
	}
	.legend .ends {
		display: flex;
		justify-content: space-between;
		width: 9rem;
		font-style: normal;
	}
	.legend i {
		font-style: normal;
	}
	.bar2 {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.7rem 1.4rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
