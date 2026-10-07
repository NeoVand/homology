<script lang="ts">
	// "Fill it if you can." A loop drawn as the edge of a triangle (three coloured
	// sides, three corners) is put into a space, and we try to fill it: with a
	// disk (that is what shrinking the loop means) or with any surface at all
	// (that is what being a boundary means). Plane: both work. Cylinder: neither.
	// Waist of a two-holed surface: no disk, but the right half is a surface whose
	// only edge is the loop, so the loop is a boundary that cannot shrink.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowTube, glowPoint, iridescent } from '$lib/three/materials';
	import { cylinder, surfaceGeometry } from '$lib/three/surfaces';
	import { genusShape, surfaceNets } from '$lib/figures/topology/manifolds/implicit';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { CheckIcon, CrossIcon } from '$lib/icons';
	import type * as THREE_NS from 'three';
	import { onMount } from 'svelte';
	import { fitCamera, isNarrow } from './three-fit';
	import { FnCurve } from './curves';

	type Space = 'plane' | 'cylinder' | 'genus2';
	type Test = 'disk' | 'surface';
	let space = $state<Space>('genus2');
	let test = $state<Test>('surface');
	let t = $state(1);
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { show(space: Space, test: Test, t: number): void } | null = null;

	const TAU = Math.PI * 2;
	const verdicts: Record<Space, Record<Test, { ok: boolean; text: string }>> = {
		plane: {
			disk: { ok: true, text: 'A disk fits. Pull the triangle’s edge in to a point: the loop shrinks.' },
			surface: { ok: true, text: 'A surface fits — the same disk. The loop is a boundary, zero in H₁.' }
		},
		cylinder: {
			disk: { ok: false, text: 'No disk fits. Any disk with this edge must cross the empty inside of the tube, off the surface. The loop cannot shrink.' },
			surface: {
				ok: false,
				text: 'No surface fits either. A piece of the cylinder cut off by the loop always has a second edge, here the bottom rim. The loop is not a boundary: it generates H₁ ≅ ℤ.'
			}
		},
		genus2: {
			disk: { ok: false, text: 'No disk fits. A disk with this edge must cut through the solid inside of the waist. The loop cannot shrink.' },
			surface: {
				ok: true,
				text: 'A surface fits: the right half, a one-handled surface whose only edge is the loop. The loop is a boundary, zero in H₁, although it can never shrink.'
			}
		}
	};
	const verdict = $derived(verdicts[space][test]);

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label } = ctx;
		const unfit = fitCamera(ctx, 1.6);
		const v3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

		/** the three sides and three corners of a triangle, drawn along a closed curve γ(θ) */
		function triangleEdge(gamma: (th: number, out: THREE_NS.Vector3) => void, radius = 0.03) {
			const g = new THREE.Group();
			const cols = ['amber', 'violet', 'blue'] as const;
			for (let k = 0; k < 3; k++) {
				const a = (k * TAU) / 3;
				const curve = new FnCurve((s, out) => gamma(a + (s * TAU) / 3, out));
				g.add(glowTube(curve, { color: cols[k], radius, segments: 90, intensity: 1.15 }));
				const p = v3();
				gamma(a, p);
				g.add(glowPoint(p, { color: 'ivory', size: 0.075 }));
			}
			return g;
		}

		/** a patch over (s, θ) ∈ [0, 1] × [0, 2π], refillable in place */
		function patch(ns: number, nth: number, opts: Parameters<typeof iridescent>[0]) {
			const pos = new Float32Array((ns + 1) * (nth + 1) * 3);
			const uv = new Float32Array((ns + 1) * (nth + 1) * 2);
			const idx: number[] = [];
			for (let i = 0; i < ns; i++)
				for (let j = 0; j < nth; j++) {
					const a = i * (nth + 1) + j;
					const b = a + nth + 1;
					idx.push(a, b, a + 1, b, b + 1, a + 1);
				}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
			geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
			geo.setIndex(idx);
			const mesh = new THREE.Mesh(geo, iridescent({ side: THREE.DoubleSide, depthWrite: false, ...opts }));
			mesh.renderOrder = 4;
			const p = v3();
			const fill = (at: (s: number, th: number, out: THREE_NS.Vector3) => void, s1: number) => {
				let k = 0;
				let q = 0;
				for (let i = 0; i <= ns; i++) {
					const s = (s1 * i) / ns;
					for (let j = 0; j <= nth; j++) {
						at(s, (TAU * j) / nth, p);
						pos[k++] = p.x;
						pos[k++] = p.y;
						pos[k++] = p.z;
						uv[q++] = s;
						uv[q++] = j / nth;
					}
				}
				geo.attributes.position.needsUpdate = true;
				geo.attributes.uv.needsUpdate = true;
				geo.computeVertexNormals();
				geo.computeBoundingSphere();
				mesh.visible = s1 > 0.003;
			};
			return { mesh, fill };
		}
		const good = { opacity: 0.72, tint: 'teal', tintMix: 0.85, grid: [8, 36] as [number, number], gridStrength: 0.3, gridColor: 'teal', rim: 0.3 };
		const bad = { opacity: 0.6, tint: 'rose', tintMix: 0.85, grid: [8, 36] as [number, number], gridStrength: 0.3, gridColor: 'rose', rim: 0.3 };

		// ── the plane: a square sheet, and a wobbly loop on it ──
		const plane = new THREE.Group();
		plane.add(
			glassMesh(surfaceGeometry((u, v, out) => out.set(4.4 * (u - 0.5), 0, 4.4 * (v - 0.5)), 40, 40), {
				opacity: 0.4,
				grid: [16, 16],
				gridStrength: 0.22,
				tint: 'blue',
				tintMix: 0.5,
				brightness: 0.7
			})
		);
		const planeR = (th: number) => 1.15 + 0.2 * Math.sin(3 * th + 0.4) + 0.08 * Math.cos(2 * th);
		const planeLoop = (th: number, out: THREE_NS.Vector3) => out.set(planeR(th) * Math.cos(th), 0.02, planeR(th) * Math.sin(th));
		plane.add(triangleEdge(planeLoop));
		const planeFill = patch(24, 160, good);
		plane.add(planeFill.mesh);
		const planeAt = (s: number, th: number, out: THREE_NS.Vector3) => {
			planeLoop(th, out);
			out.x *= 1 - s;
			out.z *= 1 - s;
			out.y = 0.012;
		};

		// ── the cylinder S¹ × [0, 1], and a loop going once around it ──
		const CYL_H = 2.6;
		const cyl = new THREE.Group();
		cyl.add(glassMesh(surfaceGeometry(cylinder(1, CYL_H), 96, 24), { opacity: 0.4, grid: [24, 8], gridStrength: 0.22, tint: 'blue', tintMix: 0.5, brightness: 0.7 }));
		const cylH = (th: number) => 0.18 + 0.22 * Math.sin(2 * th + 0.7) + 0.08 * Math.sin(3 * th);
		const cylLoop = (th: number, out: THREE_NS.Vector3) => out.set(1.02 * Math.cos(th), cylH(th), 1.02 * Math.sin(th));
		cyl.add(triangleEdge(cylLoop));
		const cylDisk = patch(24, 160, bad);
		const cylBand = patch(24, 160, { ...bad, opacity: 0.55 });
		cyl.add(cylDisk.mesh, cylBand.mesh);
		const cylCentre = v3(0, 0.18, 0);
		const cylDiskAt = (s: number, th: number, out: THREE_NS.Vector3) => {
			cylLoop(th, out);
			out.lerp(cylCentre, s);
		};
		const BOTTOM = -CYL_H / 2;
		const cylBandAt = (s: number, th: number, out: THREE_NS.Vector3) => {
			const y = cylH(th) + (BOTTOM - cylH(th)) * s;
			out.set(1.008 * Math.cos(th), y, 1.008 * Math.sin(th));
		};
		const rim = glowTube(
			new FnCurve((s, out) => out.set(1.02 * Math.cos(TAU * s), BOTTOM, 1.02 * Math.sin(TAU * s))),
			{ color: 'rose', closed: true, radius: 0.026, segments: 120, intensity: 1.2 }
		);
		cyl.add(rim);
		const rimLabel = label(v3(0, BOTTOM - 0.32, 1.1), 'a second edge', { className: 'rose small' });
		const cylDiskLabel = label(v3(0, 0.62, 0), 'off the surface', { className: 'rose small' });

		// ── the closed two-holed surface, cut by its waist (the plane x = 0) ──
		const g2 = genusShape(2);
		const net = surfaceNets(g2.f, g2.min, g2.max, 0.05);
		const g2geo = new THREE.BufferGeometry();
		g2geo.setAttribute('position', new THREE.BufferAttribute(net.positions, 3));
		g2geo.setAttribute('normal', new THREE.BufferAttribute(net.normals, 3));
		g2geo.setIndex(new THREE.BufferAttribute(net.indices, 1));
		const gen = new THREE.Group();
		gen.add(
			glassMesh(g2geo, {
				opacity: 0.42,
				grid: [28, 14],
				gridStrength: 0.22,
				implicitGrid: { centres: g2.centres, R: g2.R },
				tint: 'blue',
				tintMix: 0.5,
				brightness: 0.7
			})
		);
		// the half to the right of the waist, lifted a hair off the surface and clipped to 0 ≤ x ≤ X
		const lifted = new Float32Array(net.positions.length);
		for (let i = 0; i < lifted.length; i++) lifted[i] = net.positions[i] + 0.012 * net.normals[i];
		const halfGeo = new THREE.BufferGeometry();
		halfGeo.setAttribute('position', new THREE.BufferAttribute(lifted, 3));
		halfGeo.setAttribute('normal', new THREE.BufferAttribute(net.normals, 3));
		halfGeo.setIndex(new THREE.BufferAttribute(net.indices, 1));
		const right = new THREE.Plane(v3(-1, 0, 0), 0);
		const half = glassMesh(halfGeo, {
			opacity: 0.7,
			grid: [28, 14],
			gridStrength: 0.3,
			implicitGrid: { centres: g2.centres, R: g2.R },
			tint: 'teal',
			tintMix: 0.85,
			gridColor: 'teal',
			clippingPlanes: [new THREE.Plane(v3(1, 0, 0), 0), right]
		});
		half.renderOrder = 3;
		gen.add(half);
		const XMAX = g2.max[0];
		// the waist curve: where the plane x = 0 meets the surface (star-shaped about the origin)
		const waistR: number[] = [];
		const NW = 240;
		for (let i = 0; i < NW; i++) {
			const ph = (TAU * i) / NW;
			const dy = Math.sin(ph);
			const dz = Math.cos(ph);
			let lo = 0;
			let hi = 2;
			for (let it = 0; it < 40; it++) {
				const m = (lo + hi) / 2;
				if (g2.f(0, m * dy, m * dz) < 0) lo = m;
				else hi = m;
			}
			waistR.push((lo + hi) / 2);
		}
		const waistAt = (ph: number) => {
			const x = (((ph / TAU) * NW) % NW + NW) % NW;
			const i = Math.floor(x);
			const f = x - i;
			return waistR[i] * (1 - f) + waistR[(i + 1) % NW] * f;
		};
		const genLoop = (th: number, out: THREE_NS.Vector3) => {
			const r = waistAt(th) + 0.02;
			out.set(0, r * Math.sin(th), r * Math.cos(th));
		};
		gen.add(triangleEdge(genLoop, 0.028));
		const genDisk = patch(24, 160, bad);
		gen.add(genDisk.mesh);
		const genDiskAt = (s: number, th: number, out: THREE_NS.Vector3) => {
			genLoop(th, out);
			out.multiplyScalar(1 - s);
		};
		gen.rotation.y = -0.62;
		gen.scale.setScalar(0.78);
		const genDiskLabel = label(v3(0, 0.95, 0), 'through the inside', { className: 'rose small' });
		const genHalfLabel = label(v3(1.55, 0.7, -0.6), 'the right half', { className: 'teal small' });

		scene.add(plane, cyl, gen);

		function show(sp: Space, ts: Test, v: number) {
			plane.visible = sp === 'plane';
			cyl.visible = sp === 'cylinder';
			gen.visible = sp === 'genus2';
			planeFill.fill(planeAt, sp === 'plane' ? v : 0);
			cylDisk.fill(cylDiskAt, sp === 'cylinder' && ts === 'disk' ? v : 0);
			cylBand.fill(cylBandAt, sp === 'cylinder' && ts === 'surface' ? v : 0);
			rim.visible = sp === 'cylinder' && ts === 'surface' && v > 0.97;
			rimLabel.show(rim.visible);
			cylDiskLabel.show(sp === 'cylinder' && ts === 'disk' && v > 0.5);
			genDisk.fill(genDiskAt, sp === 'genus2' && ts === 'disk' ? v : 0);
			genDiskLabel.show(sp === 'genus2' && ts === 'disk' && v > 0.5);
			half.visible = sp === 'genus2' && ts === 'surface' && v > 0.003;
			right.constant = v * (XMAX + 0.05);
			genHalfLabel.show(half.visible && v > 0.6);
			invalidate();
		}
		show(space, test, t);
		api = { show };
		return {
			dispose: () => {
				unfit();
				api = null;
			}
		};
	}

	$effect(() => {
		// read the state first, so the effect re-runs once the scene is ready
		const sp = space;
		const ts = test;
		const v = t;
		api?.show(sp, ts, v);
	});
</script>

<Scene3D
	{setup}
	height={narrow ? 330 : 420}
	controls={{ autoRotate: false }}
	camera={{ position: [0.4, 3.0, 5.4], target: [0, -0.1, 0] }}
	label="A loop drawn as the edge of a triangle, on a plane, around a cylinder, or around the waist of a two-holed surface, and an attempt to fill it with a disk or with any surface"
/>
<Controls>
	<Segmented
		bind:value={space}
		label="The space"
		options={[
			{ value: 'plane', label: 'Plane' },
			{ value: 'cylinder', label: 'Cylinder' },
			{ value: 'genus2', label: 'Two-holed surface' }
		]}
	/>
	<Segmented
		bind:value={test}
		label="The test"
		options={[
			{ value: 'disk', label: 'Fill with a disk' },
			{ value: 'surface', label: 'Fill with any surface' }
		]}
	/>
	<Timeline bind:value={t} from="loop" to="filled" label="Growing the filling" duration={2.4} />
</Controls>
<p class="verdict ui" class:ok={verdict.ok} aria-live="polite">
	<span class="mark"><Icon icon={verdict.ok ? CheckIcon : CrossIcon} size={16} stroke={2} /></span>
	<span>{verdict.text}</span>
</p>

<style>
	.verdict {
		display: flex;
		gap: 0.55rem;
		align-items: flex-start;
		margin: 0;
		padding: 0.2rem 1.2rem 1rem;
		font-size: 0.86rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
	.mark {
		flex: none;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		margin-top: 0.05rem;
		color: var(--rose);
		background: rgba(242, 141, 182, 0.12);
	}
	.verdict.ok .mark {
		color: var(--teal);
		background: rgba(95, 214, 207, 0.12);
	}
</style>
