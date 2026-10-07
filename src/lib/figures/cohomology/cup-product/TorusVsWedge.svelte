<script lang="ts">
	// T² next to S¹ ∨ S¹ ∨ S²: identical groups, different products.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, glowTube } from '$lib/three/materials';
	import { sphere, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { bandMesh, crossingPatch, orientedTorus, type UV } from './bands3d';
	import type { Vector3 } from 'three';

	let view = $state<'groups' | 'products'>('groups');
	let api: { set(v: 'groups' | 'products'): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera } = ctx;
		const anim = ctx.reducedMotion ? 0 : 1;

		// ── the torus ──
		const T = new THREE.Group();
		const f = orientedTorus(1.0, 0.4);
		T.add(glassMesh(surfaceGeometry(f, 150, 60), { opacity: 0.8, grid: [40, 16], gridStrength: 0.18 }));
		const loopsT = new THREE.Group();
		loopsT.add(glowTube(new SurfaceCurve(f, (t) => [t, 0.86], 0.012), { color: 'gold', closed: true, radius: 0.026 }));
		loopsT.add(glowTube(new SurfaceCurve(f, (t) => [0.34, t], 0.012), { color: 'teal', closed: true, radius: 0.026 }));
		T.add(loopsT);
		const prodT = new THREE.Group();
		const ca = (t: number): UV => [0.3413, t];
		const cb = (t: number): UV => [1.0007 - t, 0.8611];
		prodT.add(bandMesh(f, ca, 0.06, 'gold', { anim, segments: 160 }));
		prodT.add(bandMesh(f, cb, 0.06, 'teal', { anim, segments: 220 }));
		const patch = crossingPatch(f, ca, 0.8611 - 0.0, cb, 1.0007 - 0.3413, 0.06);
		prodT.add(patch.mesh);
		prodT.add(glowPoint(patch.center.clone().addScaledVector(patch.normal, 0.01), { color: 'rose', size: 0.032, halo: 8 }));
		T.add(prodT);
		scene.add(T);

		// ── the wedge S¹ ∨ S¹ ∨ S² ──
		const Wg = new THREE.Group();
		const rs = 0.72;
		const sph = glassMesh(surfaceGeometry(sphere(rs), 96, 48), { opacity: 0.8, grid: [24, 12], gridStrength: 0.18, hue: 0.12 });
		sph.position.set(0, -0.32, 0);
		Wg.add(sph);
		const P = new THREE.Vector3(0, -0.32 + rs, 0);
		const circlePts = (d: Vector3, rho: number) => {
			const w = new THREE.Vector3().crossVectors(d, new THREE.Vector3(0, 0, 1)).normalize();
			const C = P.clone().addScaledVector(d, rho);
			return {
				at: (t: number) => C.clone().addScaledVector(d, -rho * Math.cos(t)).addScaledVector(w, rho * Math.sin(t)),
				tangent: (t: number) => d.clone().multiplyScalar(rho * Math.sin(t)).addScaledVector(w, rho * Math.cos(t)).normalize()
			};
		};
		const dirs = [new THREE.Vector3(-0.78, 0.6, 0.18).normalize(), new THREE.Vector3(0.78, 0.6, 0.18).normalize()];
		const circles = dirs.map((d) => circlePts(d, 0.46));
		const loopsW = new THREE.Group();
		const cols = ['gold', 'teal'] as const;
		circles.forEach((c, i) => {
			const pts = Array.from({ length: 64 }, (_, k) => c.at((2 * Math.PI * k) / 64));
			loopsW.add(glowTube(new THREE.CatmullRomCurve3(pts, true), { color: cols[i], closed: true, radius: 0.026 }));
		});
		Wg.add(loopsW);
		// the circles stay visible (dimmer) in the product view
		const loopsWdim = new THREE.Group();
		circles.forEach((c) => {
			const pts = Array.from({ length: 64 }, (_, k) => c.at((2 * Math.PI * k) / 64));
			loopsWdim.add(glowTube(new THREE.CatmullRomCurve3(pts, true), { color: 0x9a937f, closed: true, radius: 0.018, halo: false, intensity: 0.8 }));
		});
		Wg.add(loopsWdim);
		const prodW = new THREE.Group();
		circles.forEach((c, i) => {
			const t0 = Math.PI;
			const X = c.at(t0);
			const ax = c.tangent(t0);
			const u = new THREE.Vector3().crossVectors(ax, new THREE.Vector3(0, 1, 0.3)).normalize();
			const v = new THREE.Vector3().crossVectors(ax, u).normalize();
			const ring = Array.from({ length: 28 }, (_, k) => {
				const s = (2 * Math.PI * k) / 28;
				return X.clone().addScaledVector(u, 0.1 * Math.cos(s)).addScaledVector(v, 0.1 * Math.sin(s));
			});
			prodW.add(glowTube(new THREE.CatmullRomCurve3(ring, true), { color: cols[i], closed: true, radius: 0.02 }));
		});
		Wg.add(prodW);
		Wg.add(glowPoint(P.clone(), { color: 'ivory', size: 0.04, halo: 7 }));
		scene.add(Wg);

		const labels: LabelHandle[] = [];
		const lT = ctx.label([0, 0, 0], tex('T^2'));
		const lW = ctx.label([0, 0, 0], tex('S^1\\vee S^1\\vee S^2'));
		labels.push(lT, lW);
		const lProdT = ctx.label([0, 0, 0], tex('\\alpha\\smile\\beta\\neq 0'), { className: 'rose small' });
		const lProdW = ctx.label([0, 0, 0], tex('\\alpha\\smile\\beta = 0'), { className: 'small' });

		let stacked: boolean | null = null;
		function layout() {
			const s = camera.aspect < 1.05;
			if (s === stacked) return;
			stacked = s;
			if (s) {
				T.position.set(0, 1.22, 0);
				Wg.position.set(0, -1.12, 0);
				// aimed a little low, so the wedge's label clears the touch buttons in the bottom corner
				camera.position.set(0, 0.6, 8.9);
			} else {
				T.position.set(-1.75, 0.05, 0);
				Wg.position.set(1.85, 0.05, 0);
				camera.position.set(0, 1.45, 6.6);
			}
			camera.lookAt(0, s ? -0.4 : -0.15, 0);
			ctx.controls?.target.set(0, s ? -0.4 : -0.15, 0);
			ctx.controls?.update();
			lT.position.copy(T.position).add(new THREE.Vector3(0, -0.78, 0.4));
			lW.position.copy(Wg.position).add(new THREE.Vector3(0, s ? -1.2 : -1.32, 0.3));
			lProdT.position.copy(T.position).add(new THREE.Vector3(0, 0.82, 0));
			lProdW.position.copy(Wg.position).add(new THREE.Vector3(0, 1.32, 0));
			ctx.invalidate();
		}
		function set(v: 'groups' | 'products') {
			const prod = v === 'products';
			loopsT.visible = !prod;
			loopsW.visible = !prod;
			loopsWdim.visible = prod;
			prodT.visible = prod;
			prodW.visible = prod;
			lProdT.show(prod);
			lProdW.show(prod);
			ctx.invalidate();
		}
		layout();
		set(view);
		api = { set };
		const off = ctx.onFrame(() => layout());
		return {
			dispose() {
				off();
				api = null;
				lProdT.remove();
				lProdW.remove();
				for (const l of labels) l.remove();
			}
		};
	}

	$effect(() => {
		const v = view; // read first, so the effect re-runs when the toggle changes
		api?.set(v);
	});

	const rows: [string, string, string][] = [
		['H^0', '\\Z', '\\Z'],
		['H^1', '\\Z^2', '\\Z^2'],
		['H^2', '\\Z', '\\Z']
	];
</script>

<Scene3D
	{setup}
	height={400}
	animate
	camera={{ position: [0, 1.45, 6.6], fov: 36 }}
	controls={{ autoRotate: true, autoRotateSpeed: 0.35 }}
	label="Left: a glassy torus with a gold loop around its hole and a teal loop around its tube. Right: a glassy sphere with a gold circle and a teal circle attached at its north pole. In the product view, the torus shows two crossing fence bands, while the circles each carry a small ring that never meets the other."
/>
<div class="cmp ui">
	<Segmented
		bind:value={view}
		label="What to show"
		options={[
			{ value: 'groups', label: 'Count: the groups' },
			{ value: 'products', label: 'Multiply: the products' }
		]}
	/>
	<table class="tab">
		<thead>
			<tr>
				<th></th>
				<th><TeX tex="T^2" /></th>
				<th><TeX tex={'S^1\\vee S^1\\vee S^2'} /></th>
			</tr>
		</thead>
		<tbody>
			{#each rows as [h, a, b] (h)}
				<tr>
					<td class="h"><TeX tex={h} /></td>
					<td><TeX tex={a} /></td>
					<td><TeX tex={b} /></td>
				</tr>
			{/each}
			<tr class="prod" class:on={view === 'products'}>
				<td class="h"><TeX tex={'\\alpha\\smile\\beta'} /></td>
				<td class="rose"><TeX tex={'\\gamma \\;(\\text{generates } H^2)'} /></td>
				<td><TeX tex="0" /></td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.cmp {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.8rem 1.4rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.tab {
		margin: 0;
		width: auto;
		border-collapse: collapse;
		font-size: 0.86rem;
	}
	.tab th,
	.tab td {
		border: 0;
		padding: 0.18rem 0.75rem;
		text-align: center;
		color: var(--ink-bright);
	}
	.tab thead th {
		color: var(--gold);
		text-transform: none;
		letter-spacing: 0;
		font-size: 0.86rem;
		border-bottom: 1px solid var(--line-faint);
	}
	.h {
		color: var(--ink-dim) !important;
		text-align: right !important;
	}
	.prod td {
		opacity: 0.35;
		transition: opacity 0.4s var(--ease);
		border-top: 1px solid var(--line-faint);
	}
	.prod.on td {
		opacity: 1;
	}
	.rose {
		color: var(--rose) !important;
	}
</style>
