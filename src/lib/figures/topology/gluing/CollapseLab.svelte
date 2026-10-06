<script lang="ts">
	// X/A: squash a subspace A (in gold) down to a single point, and watch what
	// space you get. Five examples, from the disk-to-sphere to the pinched torus.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowPoint } from '$lib/three/materials';
	import { ParamSheet, sheetMesh, DynamicTube, type P3 } from './sheet';
	import { collapses, collapseOrder, type CollapseId } from './collapses';

	let which = $state<CollapseId>('disk');
	let t = $state(0);
	const C = $derived(collapses[which]);

	let api: { render(id: CollapseId, t: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, invalidate } = ctx;
		const sheet = new ParamSheet(96, 96);
		const mesh = sheetMesh(sheet.geometry, { opacity: 0.8, grid: [16, 12], gridStrength: 0.28 });
		const holder = new THREE.Group();
		holder.add(mesh.group);
		scene.add(holder);
		const tubes = [0, 1].map(() => {
			const tb = new DynamicTube({ segments: 96, radius: 0.028, color: 'gold' });
			holder.add(tb.group);
			return tb;
		});
		const dots = [0, 1].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'gold', size: 0.07, halo: 10 });
			holder.add(g);
			return g;
		});
		const pts = new Float32Array(97 * 3);
		const p: P3 = { x: 0, y: 0, z: 0 };
		let scale = 1;
		let fixedFor: CollapseId | null = null;
		api = {
			render(id, tt) {
				const c = collapses[id];
				// framing: fix the scale per example, large enough for every stage of
				// the morph, so the collapse reads as a collapse and nothing leaves the frame
				if (fixedFor !== id) {
					fixedFor = id;
					let m = 0;
					for (const s of [0, 0.25, 0.5, 0.75, 1]) {
						sheet.update((u, v, o) => c.f(u, v, s, o));
						const g = sheet.geometry.attributes.position.array as Float32Array;
						const { x, y, z } = sheet.center;
						for (let i = 0; i < g.length; i += 3) m = Math.max(m, Math.hypot(g[i] - x, g[i + 1] - y, g[i + 2] - z));
					}
					scale = 1.75 / Math.max(m, 1e-3);
				}
				sheet.update((u, v, o) => c.f(u, v, tt, o));
				mesh.setOutward(sheet.outward);
				holder.scale.setScalar(scale);
				holder.position.set(-sheet.center.x * scale, -sheet.center.y * scale, -sheet.center.z * scale);
				const fade = Math.min(1, Math.max(0, (tt - 0.93) / 0.07));
				tubes.forEach((tb, k) => {
					const A = c.A[k];
					if (!A) {
						tb.group.visible = false;
						dots[k].visible = false;
						return;
					}
					for (let i = 0; i <= 96; i++) {
						const [u, v] = A(i / 96);
						c.f(u, v, tt, p);
						pts[3 * i] = p.x;
						pts[3 * i + 1] = p.y;
						pts[3 * i + 2] = p.z;
					}
					tb.update(pts, 1 / scale);
					tb.group.visible = fade < 0.99;
					tb.setOpacity(1 - fade * 0.9);
					dots[k].visible = fade > 0.01;
					dots[k].position.set(pts[0], pts[1], pts[2]);
					dots[k].scale.setScalar((0.6 + 0.4 * fade) / scale);
				});
				invalidate();
			}
		};
		api.render(which, t);
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		const id = which;
		const tt = t;
		api?.render(id, tt);
	});
</script>

<div class="cl">
	<Scene3D
		{setup}
		height={400}
		camera={{ position: [0, 2.6, 6.6], fov: 38 }}
		controls={{ autoRotate: false }}
		label="A surface with a gold circle on it; as the collapse plays, the gold circle shrinks to a single point and the surface becomes a new space"
	/>
	<div class="res ui" aria-live="polite">
		<span>Collapsing {C.what}:</span>
		<TeX tex={C.result} />
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={which} options={collapseOrder.map((k) => ({ value: k, label: collapses[k].label }))} label="Example" />
	<Timeline bind:value={t} duration={3.6} from="as is" to="collapsed" label="Shrinking the gold set to a point" />
</div>

<style>
	.cl {
		position: relative;
	}
	.res {
		position: absolute;
		left: 50%;
		bottom: 0.7rem;
		transform: translateX(-50%);
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.2rem 0.5rem;
		width: max-content;
		/* clear of the reset-view button in the corner */
		max-width: calc(100% - 7rem);
		font-size: 0.78rem;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.7);
		border: 1px solid var(--line-faint);
		border-radius: 12px;
		padding: 0.3rem 0.85rem;
		pointer-events: none;
	}
	@container figure (max-width: 520px) {
		/* too narrow to float over the scene: sit under it instead */
		.res {
			position: static;
			transform: none;
			max-width: calc(100% - 1.6rem);
			margin: 0.2rem auto 0.7rem;
			text-align: center;
		}
	}
	.res :global(.katex) {
		color: var(--gold-bright);
	}
	.bar {
		display: grid;
		gap: 0.7rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
