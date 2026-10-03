<script lang="ts">
	// X/A: squash a subspace A (in gold) down to a single point, and watch what
	// space you get. Five examples, from the disk-to-sphere to the pinched torus.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowPoint } from '$lib/three/materials';
	import { ParamSheet, sheetMesh, DynamicTube, type P3 } from './sheet';
	import { collapses, collapseOrder, type CollapseId } from './collapses';

	let which = $state<CollapseId>('disk');
	let t = $state(0);
	let playing = $state(false);
	let raf = 0;
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
				sheet.update((u, v, o) => c.f(u, v, tt, o));
				mesh.setOutward(sheet.outward);
				// framing: fix the scale per example (from its starting shape) so the collapse reads as a collapse
				if (fixedFor !== id) {
					fixedFor = id;
					const g = sheet.geometry.attributes.position.array as Float32Array;
					let m = 0;
					for (let i = 0; i < g.length; i += 3) m = Math.max(m, Math.hypot(g[i], g[i + 1], g[i + 2]));
					scale = 1.75 / Math.max(m, 1e-3);
				}
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

	function stop() {
		playing = false;
		cancelAnimationFrame(raf);
	}
	function play() {
		if (playing) return stop();
		if (t >= 0.999) t = 0;
		playing = true;
		const t0 = t;
		const start = performance.now();
		const dur = 3600 * (1 - t0) + 300;
		const step = (now: number) => {
			if (!playing) return;
			const k = Math.min(1, (now - start) / dur);
			t = t0 + (1 - t0) * k;
			if (k < 1) raf = requestAnimationFrame(step);
			else playing = false;
		};
		raf = requestAnimationFrame(step);
	}
	let reduced = false;
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		return stop;
	});
	function choose(id: CollapseId) {
		stop();
		which = id;
		t = 0;
		if (!reduced) setTimeout(play, 300);
	}
</script>

<div class="cl">
	<Scene3D
		{setup}
		height={400}
		camera={{ position: [0, 2.6, 6.6], fov: 38 }}
		controls={{ autoRotate: false }}
		label="A surface with a gold circle on it; as the slider moves, the gold circle shrinks to a single point and the surface becomes a new space"
	/>
	<div class="res ui" aria-live="polite">
		<span>Collapsing {C.what}:</span>
		<TeX tex={C.result} />
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={which} options={collapseOrder.map((k) => ({ value: k, label: collapses[k].label }))} label="Example" onchange={(v) => choose(v)} />
	<div class="row">
		<Button variant="gold" onclick={play}>{playing ? 'Pause' : t >= 0.999 ? 'Again' : 'Collapse'}</Button>
		<Slider bind:value={t} min={0} max={1} step={0.002} label="Shrink the gold set to a point" format={(v) => `${Math.round(v * 100)}%`} oninput={() => stop()} />
	</div>
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
		max-width: 90%;
		font-size: 0.78rem;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.7);
		border: 1px solid var(--line-faint);
		border-radius: 12px;
		padding: 0.3rem 0.85rem;
		pointer-events: none;
	}
	.res :global(.katex) {
		color: var(--gold-bright);
	}
	.bar {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
</style>
