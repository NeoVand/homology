<script lang="ts">
	// Teaser for §2.2: identify opposite sides of a square and you get a torus.
	// The square is a flexible sheet with a few marked points: its four corners,
	// a point p on each b-side and a point q on each a-side. Rolling glues the
	// b-sides together (the two p's meet, and the corners pair up: 4 → 2),
	// bending glues the a-sides (the two q's meet, and the corner pairs meet:
	// 2 → 1); the counts underneath are measured in 3D as it happens. Everything
	// on screen is a continuous function of the slider's value. The geometry is
	// the gluing workshop's torus morph (topology/gluing/morphs.ts), whose tests
	// check that glued points really do coincide.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowPoint } from '$lib/three/materials';
	import { tex } from '$lib/katex/render';
	import { presets, edgeSpecs } from '$lib/figures/topology/gluing/morphs';
	import { ParamSheet, sheetMesh, type P3 } from '$lib/figures/topology/gluing/sheet';
	import { fade } from 'svelte/transition';
	import type * as THREE_NS from 'three';

	const torus = presets.torus;
	const f = torus.f;
	// where p sits on the b-sides and q on the a-sides
	const PV = 0.78;
	const QU = 0.78;

	let t = $state(0);
	let cw = $state(800);
	const narrow = $derived(cw < 560);

	// how many distinct points each class has right now (measured in 3D)
	let counts = $state({ corners: 4, p: 2, q: 2 });

	const stage = $derived(
		t < 0.015
			? 'The square. Points of the same colour will become one point.'
			: t < 0.42
				? 'Roll: each point of the left side closes in on its partner on the right.'
				: t < 0.5
					? 'The b-sides are glued: a tube. The two p’s are one point, and the corners have paired up.'
					: t < 0.985
						? 'Bend: the two end circles (the a-sides) close in on each other.'
						: 'Glued: a torus. The two q’s are one point, and all four corners are the single point v.'
	);

	let api: { render(t: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, invalidate } = ctx;
		const sheet = new ParamSheet(96, 96);
		const mesh = sheetMesh(sheet.geometry, { opacity: 0.8, grid: [8, 8], gridStrength: 0.3 });
		const e = edgeSpecs(torus);
		mesh.setEdges([e[0], e[1], e[2], e[3]]);
		const holder = new THREE.Group();
		holder.add(mesh.group);
		scene.add(holder);

		// ── the marked points ─────────────────────────────────────────────────
		const corners = [0, 1, 2, 3].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'ivory', size: 0.055, halo: 8 });
			holder.add(g);
			return g;
		});
		const ps = [0, 1].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'rose', size: 0.06, halo: 8 });
			holder.add(g);
			return g;
		});
		const qs = [0, 1].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'violet', size: 0.06, halo: 8 });
			holder.add(g);
			return g;
		});
		const labA: LabelHandle = ctx.label([0, 0, 0], tex('a'), { className: 'gold' });
		const labB: LabelHandle = ctx.label([0, 0, 0], tex('b'), { className: 'teal' });
		const labP: LabelHandle = ctx.label([0, 0, 0], tex('p'), { className: 'small' });
		const labQ: LabelHandle = ctx.label([0, 0, 0], tex('q'), { className: 'small' });
		const labV: LabelHandle = ctx.label([0, 0, 0], tex('v'), { className: 'small' });
		labP.el.style.color = 'var(--rose)';
		labQ.el.style.color = 'var(--violet)';

		const p: P3 = { x: 0, y: 0, z: 0 };
		const tmp = new THREE.Vector3();
		let scale = 1;
		function place(label: LabelHandle, u: number, v: number, tt: number, push: number) {
			f(u, v, tt, p);
			tmp.set(p.x - sheet.center.x, p.y - sheet.center.y, p.z - sheet.center.z);
			const len = tmp.length() || 1;
			tmp.multiplyScalar(push / len / scale);
			label.position.set(p.x + tmp.x, p.y + tmp.y, p.z + tmp.z);
			label.position.applyMatrix4(holder.matrixWorld);
		}
		const at = (g: THREE_NS.Object3D, u: number, v: number, tt: number) => {
			f(u, v, tt, p);
			g.position.set(p.x, p.y, p.z);
			g.scale.setScalar(1 / scale);
			return g.position;
		};
		/** number of distinct points among these positions */
		const distinct = (pts: THREE_NS.Vector3[]) => {
			const reps: THREE_NS.Vector3[] = [];
			for (const q of pts) if (!reps.some((r) => r.distanceTo(q) < 0.02)) reps.push(q);
			return reps.length;
		};

		api = {
			render(tt) {
				sheet.update((u, v, o) => f(u, v, tt, o));
				// keep the shape framed: scale its on-screen extent to a fixed size
				const g = sheet.geometry.attributes.position.array as Float32Array;
				let mx = 0;
				let my = 0;
				let mz = 0;
				const c = sheet.center;
				for (let i = 0; i < g.length; i += 3) {
					mx = Math.max(mx, Math.abs(g[i] - c.x));
					my = Math.max(my, Math.abs(g[i + 1] - c.y));
					mz = Math.max(mz, Math.abs(g[i + 2] - c.z));
				}
				const aspect = camera.aspect || 1.5;
				const half = Math.max(my, mx / Math.min(1.25, aspect * 0.95), mz * 0.55);
				scale = 1.55 / Math.max(half, 1e-3);
				holder.scale.setScalar(scale);
				holder.position.set(-c.x * scale, -c.y * scale, -c.z * scale);
				holder.updateMatrixWorld();
				mesh.setUniform('uEdgeW', 0.03 / scale);
				mesh.setOutward(sheet.outward);

				// the points, and how many distinct points each class is
				const cp = (
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1]
					] as const
				).map(([u, v], i) => at(corners[i], u, v, tt).clone());
				const pp = [at(ps[0], 0, PV, tt).clone(), at(ps[1], 1, PV, tt).clone()];
				const qp = [at(qs[0], QU, 0, tt).clone(), at(qs[1], QU, 1, tt).clone()];
				const next = { corners: distinct(cp), p: distinct(pp), q: distinct(qp) };
				if (next.corners !== counts.corners || next.p !== counts.p || next.q !== counts.q) counts = next;

				place(labA, 0.3, 0, tt, 0.34);
				place(labB, 0, 0.3, tt, 0.34);
				place(labP, 0, PV, tt, 0.3);
				place(labQ, QU, 0, tt, 0.3);
				place(labV, 0, 0, tt, 0.3);
				// v fades in as the four corners close in on one point
				let spread = 0;
				for (const a of cp) for (const b of cp) spread = Math.max(spread, a.distanceTo(b));
				const vx = Math.min(1, Math.max(0, 1 - spread / 0.6));
				const vEl = labV.el.firstElementChild as HTMLElement | null;
				if (vEl) vEl.style.opacity = String(vx * vx * (3 - 2 * vx));
				invalidate();
			}
		};
		api.render(t);
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		// read t first, so the effect subscribes to it even before the scene exists
		const tt = t;
		api?.render(tt);
	});

	const plural = (n: number) => (n === 1 ? 'point' : 'points');
</script>

<div class="wrap" bind:clientWidth={cw}>
	<Scene3D
		{setup}
		height={narrow ? 400 : 460}
		camera={{ position: [0, 1.1, 7.6], fov: 38 }}
		controls={{ autoRotate: false }}
		label="A flexible square sheet with its sides marked a and b and a few marked points; the sheet rolls into a tube, gluing the b-sides, then bends into a torus, gluing the a-sides, and the marked points meet"
	/>
	{#if !narrow}
		<div class="stage ui" aria-live="polite">
			{#key stage}<span in:fade={{ duration: 450 }}>{stage}</span>{/key}
		</div>
	{/if}
</div>
<div class="bar ui">
	{#if narrow}
		<div class="stage-line" aria-live="polite">{#key stage}<span in:fade={{ duration: 450 }}>{stage}</span>{/key}</div>
	{/if}
	<div class="classes" aria-live="polite">
		<span class="cl"><span class="dot ivory"></span>corners: <b>{counts.corners}</b> {plural(counts.corners)}</span>
		<span class="cl"><span class="dot rose"></span><TeX tex="p" />: <b>{counts.p}</b> {plural(counts.p)}</span>
		<span class="cl"><span class="dot violet"></span><TeX tex="q" />: <b>{counts.q}</b> {plural(counts.q)}</span>
	</div>
	<Timeline bind:value={t} duration={7} from="square" to="torus" label="Gluing the square into a torus" />
</div>

<style>
	.wrap {
		position: relative;
	}
	.stage {
		position: absolute;
		left: 50%;
		bottom: 0.6rem;
		transform: translateX(-50%);
		width: max-content;
		max-width: calc(100% - 1.5rem);
		text-align: center;
		font-size: 0.78rem;
		line-height: 1.35;
		letter-spacing: 0.02em;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.66);
		padding: 0.3rem 0.7rem;
		border-radius: 8px;
		pointer-events: none;
	}
	.stage-line {
		text-align: center;
		font-size: 0.8rem;
		line-height: 1.4;
		color: var(--ink-dim);
	}
	.bar {
		display: grid;
		gap: 0.7rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.classes {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem 1.3rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.cl {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.cl b {
		color: var(--ink-bright);
		font-variant-numeric: tabular-nums;
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
	}
	.dot.ivory {
		background: #fbf6e8;
	}
	.dot.rose {
		background: var(--rose);
	}
	.dot.violet {
		background: var(--violet);
	}
</style>
