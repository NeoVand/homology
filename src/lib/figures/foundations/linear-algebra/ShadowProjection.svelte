<script lang="ts">
	// A rank-2 linear map from space to itself: every point slides along one
	// fixed direction k until it hits the floor, like a shadow cast by slanted
	// sunlight. The floor is the image (2 dimensions survive); the line through
	// the origin in direction k is the kernel (1 dimension is crushed to 0).
	// Every line parallel to k collapses to a single point: those lines are the
	// "fibres" (cosets of the kernel), and each becomes one point of the image.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import type * as T3 from 'three';
	import { glassMesh, glowTube, glowPoint, pointCloud, iridescent } from '$lib/three/materials';
	import { surfaceGeometry, plane } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { easeInOut } from './geom';

	let t = $state(0);
	let showFibres = $state(true);
	let api: { setT(v: number): void; setFibres(on: boolean): void } | null = null;
	let raf = 0;

	// kernel direction in three.js coordinates (y is up; the floor y = 0 is the image)
	const KDIR: [number, number, number] = [0.55, 1, 0.35];

	function setup(ctx: SceneContext) {
		const { THREE, scene, invalidate, label } = ctx;
		const k = new THREE.Vector3(...KDIR);
		const kHat = k.clone().normalize();
		const xAxis = new THREE.Vector3(1, 0, 0);
		/** M_t p = p − t·(p_y / k_y)·k : slide toward the floor along k */
		const mapT = (p: T3.Vector3, tt: number, out: T3.Vector3) => out.copy(p).addScaledVector(k, (-tt * p.y) / k.y);

		// ── the floor: the image of the map ───────────────────────────────
		const floor = glassMesh(surfaceGeometry(plane(4.8, 4.8), 4, 4), {
			// (the shared shader skips the sRGB output conversion, so colours are
			// given paler than their intended look: this pale cream shows as gold)
			opacity: 0.45,
			grid: [12, 12],
			gridStrength: 1.0,
			gridColor: 0xfff1cf,
			tint: 0x4a4434,
			tintMix: 0.72,
			film: 0.12,
			rim: 0.1,
			brightness: 1.1
		});
		floor.rotation.x = -Math.PI / 2;
		scene.add(floor);

		// faint axes
		const axisMat = new THREE.LineBasicMaterial({ color: 0xebe5d5, transparent: true, opacity: 0.22 });
		for (const d of [
			[1, 0, 0],
			[0, 1, 0],
			[0, 0, 1]
		] as [number, number, number][]) {
			const g = new THREE.BufferGeometry().setFromPoints([
				new THREE.Vector3(...d).multiplyScalar(-2.6),
				new THREE.Vector3(...d).multiplyScalar(2.6)
			]);
			scene.add(new THREE.Line(g, axisMat));
		}

		// ── a glass cube and a lattice of points inside it ────────────────
		const cubeGeo = new THREE.BoxGeometry(1.8, 1.8, 1.8, 1, 1, 1);
		cubeGeo.translate(0.25, 0.55, -0.1);
		const cubeBase = (cubeGeo.attributes.position.array as Float32Array).slice();
		const cubeMat = iridescent({ opacity: 0.2, grid: [0, 0], tint: 'violet', tintMix: 0.35, film: 0.8, depthWrite: false });
		const cube = new THREE.Mesh(cubeGeo, cubeMat);
		cube.renderOrder = 3;
		scene.add(cube);

		const edgesGeo = new THREE.EdgesGeometry(cubeGeo);
		const edgeBase = (edgesGeo.attributes.position.array as Float32Array).slice();
		const edges = new THREE.LineSegments(
			edgesGeo,
			new THREE.LineBasicMaterial({ color: 0xb9adff, transparent: true, opacity: 0.85 })
		);
		edges.renderOrder = 4;
		scene.add(edges);

		const pts: number[] = [];
		const cols: number[] = [];
		const cA = new THREE.Color(0x74a9ff);
		const cB = new THREE.Color(0xa493ff);
		for (let i = 0; i < 4; i++)
			for (let j = 0; j < 4; j++)
				for (let l = 0; l < 4; l++) {
					const x = 0.25 - 0.9 + (1.8 * i) / 3;
					const y = 0.55 - 0.9 + (1.8 * j) / 3;
					const z = -0.1 - 0.9 + (1.8 * l) / 3;
					pts.push(x, y, z);
					const c = cA.clone().lerp(cB, j / 3);
					cols.push(c.r, c.g, c.b);
				}
		const ptsBase = new Float32Array(pts);
		const cloud = pointCloud(ptsBase.slice(), { size: 0.22, colors: new Float32Array(cols) });
		cloud.renderOrder = 9;
		scene.add(cloud);

		// ── the kernel: the line through 0 in direction k ─────────────────
		const L = 2.4;
		const kernel = new THREE.Group();
		kernel.add(
			glowTube(new THREE.LineCurve3(new THREE.Vector3(-L, 0, 0), new THREE.Vector3(L, 0, 0)), {
				color: 'teal',
				radius: 0.035,
				segments: 8,
				haloScale: 3.4
			})
		);
		kernel.quaternion.setFromUnitVectors(xAxis, kHat);
		scene.add(kernel);

		// where the kernel used to be: a dashed ghost
		const ghostGeo = new THREE.BufferGeometry().setFromPoints([kHat.clone().multiplyScalar(-L), kHat.clone().multiplyScalar(L)]);
		const ghost = new THREE.Line(
			ghostGeo,
			new THREE.LineDashedMaterial({ color: 0x5fd6cf, dashSize: 0.12, gapSize: 0.1, transparent: true, opacity: 0.5 })
		);
		ghost.computeLineDistances();
		scene.add(ghost);

		const origin = glowPoint([0, 0, 0], { color: 'teal', size: 0.055 });
		scene.add(origin);

		// ── fibres: other lines parallel to k, each landing on one point ───
		const fibres = new THREE.Group();
		const fibreParts: T3.Group[] = [];
		const feet: [number, number, number][] = [
			[1.6, 0, 1.3],
			[-1.5, 0, 1.0],
			[1.4, 0, -1.6],
			[-1.3, 0, -1.4]
		];
		const fibreMat = new THREE.LineBasicMaterial({ color: 0x5fd6cf, transparent: true, opacity: 0.55 });
		for (const f of feet) {
			const g = new THREE.Group();
			g.position.set(...f);
			g.quaternion.setFromUnitVectors(xAxis, kHat);
			const lg = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(1.6, 0, 0)]);
			g.add(new THREE.Line(lg, fibreMat));
			fibres.add(g);
			fibreParts.push(g);
			fibres.add(glowPoint(f, { color: 'gold', size: 0.045, halo: 7 }));
		}
		scene.add(fibres);

		const kLabel = label([0, 0, 0], 'kernel', { className: 'teal tag' });
		label([-1.95, 0.04, 2.05], 'image', { className: 'gold tag' });

		const tmp = new THREE.Vector3();
		function setT(tt: number) {
			const write = (base: Float32Array, attr: T3.BufferAttribute) => {
				const arr = attr.array as Float32Array;
				for (let i = 0; i < base.length; i += 3) {
					tmp.set(base[i], base[i + 1], base[i + 2]);
					mapT(tmp, tt, tmp);
					arr[i] = tmp.x;
					arr[i + 1] = tmp.y;
					arr[i + 2] = tmp.z;
				}
				attr.needsUpdate = true;
			};
			write(cubeBase, cubeGeo.attributes.position as T3.BufferAttribute);
			cubeGeo.computeVertexNormals();
			write(edgeBase, edgesGeo.attributes.position as T3.BufferAttribute);
			write(ptsBase, cloud.geometry.attributes.position as T3.BufferAttribute);
			cubeGeo.computeBoundingSphere();
			edgesGeo.computeBoundingSphere();
			cloud.geometry.computeBoundingSphere();

			const s = Math.max(1 - tt, 0.0005);
			kernel.scale.set(s, 1, 1);
			for (const g of fibreParts) g.scale.set(s, 1, 1);
			kLabel.position.copy(kHat).multiplyScalar(L * s + 0.32);
			kLabel.set(tt > 0.97 ? 'kernel → 0' : 'kernel');
			invalidate();
		}
		api = {
			setT,
			setFibres(on: boolean) {
				fibres.visible = on;
				invalidate();
			}
		};
		setT(t);
		fibres.visible = showFibres;
		return {
			dispose: () => {
				api = null;
			}
		};
	}

	$effect(() => api?.setT(t));
	$effect(() => api?.setFibres(showFibres));

	function play() {
		cancelAnimationFrame(raf);
		const from = t > 0.5 ? 1 : 0;
		const to = 1 - from;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const dur = reduced ? 0 : 2200;
		const t0 = performance.now();
		const step = (now: number) => {
			const u = dur ? Math.min(1, (now - t0) / dur) : 1;
			t = from + (to - from) * easeInOut(u);
			if (u < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}
	const badge = tex('3 = \\underbrace{\\textcolor{#f2d08f}{2}}_{\\text{rank}} + \\underbrace{\\textcolor{#5fd6cf}{1}}_{\\text{nullity}}');
</script>

<Scene3D
	{setup}
	height={460}
	controls={{ autoRotate: true, autoRotateSpeed: 0.45 }}
	camera={{ position: [4.9, 3.5, 5.6], target: [0, 0.15, 0], fov: 40 }}
	label="A glass cube floats above a golden floor. A slider applies a linear map that slides every point along one slanted teal direction until it reaches the floor: the cube flattens into its shadow, the teal line through the origin shrinks to a single point, and four thin teal lines parallel to it each collapse to one gold point on the floor."
>
	<div class="badge ui">{@html badge}</div>
</Scene3D>
<Controls>
	<Slider bind:value={t} min={0} max={1} step={0.01} label="apply the map" format={(v) => (v < 0.005 ? 'before' : v > 0.995 ? 'after' : v.toFixed(2))} />
	<Button variant="gold" onclick={play}>{t > 0.5 ? 'Undo' : 'Apply'}</Button>
	<Toggle bind:checked={showFibres} label="show parallel lines (fibres)" />
</Controls>

<style>
	.badge {
		position: absolute;
		top: 0.8rem;
		left: 0.9rem;
		padding: 0.35rem 0.7rem 0.15rem;
		border-radius: 9px;
		background: rgba(6, 10, 20, 0.66);
		border: 1px solid var(--line-faint);
		color: var(--ink);
		font-size: 0.9rem;
		backdrop-filter: blur(4px);
	}
</style>
