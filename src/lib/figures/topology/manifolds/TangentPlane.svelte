<script lang="ts">
	// Tangent planes as spaces of velocities. A curve runs through a point p of
	// a sphere or torus; its velocity at p lies in the tangent plane T_pM. Turn
	// the direction (drag the arrow round in the plane) and the velocity sweeps
	// out the whole plane. The microscope
	// zooms in until the surface and its tangent plane are indistinguishable.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowPoint, glowTube } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry, type SurfaceFn } from '$lib/three/surfaces';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glass } from '../homotopy/glass';

	type Surf = 'sphere' | 'torus';
	let surf = $state<Surf>('sphere');
	let uv = $state<[number, number]>([0.18, 0.3]);
	let angle = $state(35);
	let micro = $state(false);
	let readout = $state({ p: [0, 0, 0] as number[], v: [0, 0, 0] as number[], dot: 0, a: 0, b: 0 });
	let api: { set(s: Surf, uv: [number, number], ang: number): void; zoom(on: boolean): void } | null = null;

	const fns: Record<Surf, SurfaceFn> = { sphere: sphere(1.5), torus: torus(1.6, 0.62) };
	const presets: Record<Surf, [number, number][]> = {
		sphere: [
			[0.18, 0.3],
			[0.25, 0.5],
			[0.1, 0.02]
		],
		torus: [
			[0.22, 0.12],
			[0.25, 0.5],
			[0.3, 0.27]
		]
	};
	let presetIx = 0;

	function setup(ctx: SceneContext) {
		const { scene, THREE, canvas, camera, controls } = ctx;
		camera.near = 0.2;
		camera.far = 60;
		camera.updateProjectionMatrix();
		const groups: Record<Surf, InstanceType<typeof THREE.Group>> = { sphere: new THREE.Group(), torus: new THREE.Group() };
		const pick: Record<Surf, InstanceType<typeof THREE.Object3D>> = {} as Record<Surf, InstanceType<typeof THREE.Object3D>>;
		for (const s of ['sphere', 'torus'] as Surf[]) {
			const g = glass(surfaceGeometry(fns[s], 160, 80), { opacity: 0.8, grid: s === 'sphere' ? [36, 18] : [48, 18], gridStrength: 0.3 });
			groups[s].add(g);
			pick[s] = g.children[1];
			scene.add(groups[s]);
		}
		// tangent plane: a glassy square with a gold rim
		const planeGeo = new THREE.PlaneGeometry(1.7, 1.7, 1, 1);
		const plane = glass(planeGeo, { opacity: 0.42, grid: [6, 6], gridStrength: 0.45, tint: 'gold', tintMix: 0.22 }, { brightness: 0.7, tintMix: 0.2 });
		const planeGroup = new THREE.Group();
		planeGroup.add(plane);
		const rimPts = [
			[-0.85, -0.85],
			[0.85, -0.85],
			[0.85, 0.85],
			[-0.85, 0.85]
		].map(([x, y]) => new THREE.Vector3(x, y, 0));
		planeGroup.add(glowTube(new THREE.CatmullRomCurve3(rimPts, true, 'catmullrom', 0), { color: 'gold', radius: 0.01, closed: true, segments: 64, intensity: 0.8 }));
		scene.add(planeGroup);
		// velocity arrow
		const arrow = new THREE.Group();
		const arrowMat = new THREE.MeshBasicMaterial({ color: 0x5fd6cf });
		const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.78, 12), arrowMat);
		shaft.position.y = 0.39;
		const head = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.2, 16), arrowMat);
		head.position.y = 0.88;
		arrow.add(shaft, head);
		scene.add(arrow);
		const dot = glowPoint([0, 0, 0], { color: 'gold', size: 0.06 });
		scene.add(dot);
		// an unbounded copy of the tangent plane, never drawn: the pointer is aimed on it
		const aimPlane = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
		let curve: InstanceType<typeof THREE.Group> | null = null;

		const P = new THREE.Vector3();
		const Xu = new THREE.Vector3();
		const Xv = new THREE.Vector3();
		const N = new THREE.Vector3();
		const e1 = new THREE.Vector3();
		const e2 = new THREE.Vector3();
		const D = new THREE.Vector3();
		const tmp = new THREE.Vector3();
		const M = new THREE.Matrix4();
		const up = new THREE.Vector3(0, 1, 0);
		let curSurf: Surf = 'sphere';

		function frame(s: Surf, u: number, v: number) {
			const f = fns[s];
			const e = 1e-4;
			f(u, v, P);
			f(u + e, v, tmp);
			Xu.copy(tmp).sub(P).divideScalar(e);
			f(u, v + e, tmp);
			Xv.copy(tmp).sub(P).divideScalar(e);
			N.crossVectors(Xu, Xv);
			if (N.lengthSq() < 1e-10) N.copy(P);
			N.normalize();
			if (N.dot(P) < 0 && s === 'sphere') N.negate();
			if (s === 'torus') {
				// outward from the tube's core circle
				tmp.set(P.x, 0, P.z).setLength(1.6);
				if (N.dot(tmp.sub(P).negate()) < 0) N.negate();
			}
			e1.copy(Xu.lengthSq() > 1e-8 ? Xu : Xv).normalize();
			e1.addScaledVector(N, -e1.dot(N)).normalize();
			e2.crossVectors(N, e1).normalize();
		}

		api = {
			set(s, [u, v], ang) {
				curSurf = s;
				groups.sphere.visible = s === 'sphere';
				groups.torus.visible = s === 'torus';
				frame(s, u, v);
				dot.position.copy(P).addScaledVector(N, 0.01);
				M.makeBasis(e1, e2, N);
				planeGroup.quaternion.setFromRotationMatrix(M);
				planeGroup.position.copy(P).addScaledVector(N, 0.004);
				aimPlane.quaternion.copy(planeGroup.quaternion);
				aimPlane.position.copy(P);
				aimPlane.updateMatrixWorld();
				const a = (ang * Math.PI) / 180;
				D.copy(e1).multiplyScalar(Math.cos(a)).addScaledVector(e2, Math.sin(a));
				arrow.position.copy(P).addScaledVector(N, 0.012);
				arrow.quaternion.setFromUnitVectors(up, D);
				// the curve through p with this velocity
				if (curve) {
					scene.remove(curve);
					curve.traverse((o) => {
						const m = o as InstanceType<typeof THREE.Mesh>;
						m.geometry?.dispose?.();
						(m.material as InstanceType<typeof THREE.Material> | undefined)?.dispose?.();
					});
				}
				const pts: InstanceType<typeof THREE.Vector3>[] = [];
				if (s === 'sphere') {
					const R = P.length();
					const ph = P.clone().normalize();
					for (let i = 0; i <= 120; i++) {
						const t = -1.1 + (2.2 * i) / 120;
						pts.push(ph.clone().multiplyScalar(Math.cos(t)).addScaledVector(D, Math.sin(t)).multiplyScalar(R + 0.012));
					}
				} else {
					const da = D.dot(Xu) / Xu.lengthSq();
					const db = D.dot(Xv) / Xv.lengthSq();
					const L = 1 / Math.hypot(da * Xu.length(), db * Xv.length());
					for (let i = 0; i <= 120; i++) {
						const t = (-1.2 + (2.4 * i) / 120) * L;
						const q = new THREE.Vector3();
						fns.torus(u + da * t, v + db * t, q);
						// lift off the surface a little
						frame('torus', u + da * t, v + db * t);
						pts.push(q.addScaledVector(N, 0.012));
					}
					frame(s, u, v);
				}
				curve = glowTube(new THREE.CatmullRomCurve3(pts), { color: 'teal', radius: 0.016, segments: 180, intensity: 0.85 });
				scene.add(curve);
				// readout (in the book's coordinates: z up)
				const m3 = (w: InstanceType<typeof THREE.Vector3>) => [w.x, -w.z, w.y];
				readout = {
					p: m3(P.clone().normalize()),
					v: m3(D),
					dot: P.clone().normalize().dot(D),
					a: D.dot(Xu) / Xu.lengthSq(),
					b: D.dot(Xv) / Xv.lengthSq()
				};
				ctx.invalidate();
			},
			zoom(on) {
				const from = camera.position.clone();
				const fromT = controls ? controls.target.clone() : new THREE.Vector3();
				const toT = on ? P.clone() : new THREE.Vector3(0, 0, 0);
				const to = on ? P.clone().addScaledVector(N, 0.2).addScaledVector(e2, -0.3).addScaledVector(e1, 0.08) : new THREE.Vector3(0, 2.4, 5.8);
				const s0 = planeGroup.scale.x;
				const s1 = on ? 0.32 : 1;
				const apply = (k: number) => {
					camera.position.lerpVectors(from, to, k);
					controls?.target.lerpVectors(fromT, toT, k);
					controls?.update();
					const sc = s0 + (s1 - s0) * k;
					planeGroup.scale.setScalar(sc);
					arrow.scale.setScalar(sc);
					dot.scale.setScalar(sc);
				};
				if (ctx.reducedMotion) {
					apply(1);
					ctx.invalidate();
					return;
				}
				let t = 0;
				const off = ctx.onFrame((_t, dt) => {
					t = Math.min(1, t + dt / 0.9);
					apply(t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
					if (t >= 1) off();
				});
			}
		};
		api.set(surf, uv, angle);

		// press on the tangent plane (or the arrow) and drag: the velocity turns to
		// point at the pointer. A click anywhere else on the surface moves p there.
		const aimAt = (e: PointerEvent) => {
			const hit = ctx.pick(e, [aimPlane])[0];
			if (!hit) return;
			tmp.copy(hit.point).sub(P);
			if (tmp.lengthSq() < 1e-6) return;
			const a = (Math.atan2(tmp.dot(e2), tmp.dot(e1)) * 180) / Math.PI;
			angle = (Math.round(a) + 360) % 360;
		};
		const onPlane = (e: PointerEvent) => ctx.pick(e, [arrow, planeGroup]).length > 0;
		let aiming = false;
		let controlsWere = true;
		let downAt: [number, number] | null = null;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			if (!onPlane(e)) {
				downAt = [e.clientX, e.clientY];
				return;
			}
			downAt = null;
			aiming = true;
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
			aimAt(e);
		};
		const onMove = (e: PointerEvent) => {
			if (aiming) aimAt(e);
			else if (e.pointerType === 'mouse') canvas.style.cursor = onPlane(e) ? 'grab' : '';
		};
		const onUp = (e: PointerEvent) => {
			if (aiming) {
				aiming = false;
				if (controls) controls.enabled = controlsWere;
				canvas.style.cursor = '';
				return;
			}
			if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
			downAt = null;
			const hit = ctx.pick(e, [pick[curSurf]])[0];
			if (hit?.uv) uv = [hit.uv.x, Math.min(0.995, Math.max(0.005, hit.uv.y))];
		};
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		return {
			dispose: () => {
				api = null;
				aimPlane.geometry.dispose();
				aimPlane.material.dispose();
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
			}
		};
	}

	$effect(() => {
		const s = surf;
		const q = uv;
		const a = angle;
		api?.set(s, q, a);
	});
	$effect(() => {
		const m = micro;
		api?.zoom(m);
	});

	// the stepper turns the velocity to the next multiple of 15°, either way round
	const dirIx = $derived(Math.round(angle / 15) % 24);
	function turn(d: 1 | -1) {
		const k = d > 0 ? Math.floor(angle / 15) + 1 : Math.ceil(angle / 15) - 1;
		angle = (((k * 15) % 360) + 360) % 360;
	}

	function nextPoint() {
		presetIx = (presetIx + 1) % presets[surf].length;
		uv = presets[surf][presetIx];
	}
	const f2 = (x: number) => (x < -0.005 ? '−' : '') + Math.abs(x).toFixed(2);
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={440}
		camera={{ position: [0, 2.4, 5.8], fov: 40 }}
		controls={{ autoRotate: false }}
		label="A sphere or torus with a gold point, its glassy tangent plane, a teal curve through the point and the curve's velocity arrow lying in the plane"
	/>
	<div class="readout ui" aria-live="polite">
		{#if surf === 'sphere'}
			<span>unit radius <TeX tex={`\\hat p = (${readout.p.map(f2).join(',\\ ')})`} /></span>
			<span>velocity <TeX tex={`v = (${readout.v.map(f2).join(',\\ ')})`} /></span>
			<span>check: <TeX tex={`\\hat p\\cdot v = ${f2(readout.dot)}`} /> — every velocity at <TeX tex="p" /> is perpendicular to the radius.</span>
		{:else}
			<span>velocity <TeX tex={`v = ${f2(readout.a)}\\,\\partial_u X ${readout.b < -0.005 ? '-' : '+'} ${f2(Math.abs(readout.b))}\\,\\partial_v X`} /></span>
			<span>— a combination of the two coordinate directions, so it lies in the plane they span.</span>
		{/if}
	</div>
	<Controls>
		<Segmented
			bind:value={surf}
			options={[
				{ value: 'sphere', label: 'Sphere' },
				{ value: 'torus', label: 'Torus' }
			]}
			label="Which surface"
			onchange={(s) => {
				presetIx = 0;
				uv = presets[s][0];
			}}
		/>
		<!-- turns the velocity in steps of 15°, for keys and taps; in the picture it is dragged -->
		<Stepper value={dirIx} min={-1} max={24} label="Direction" format={() => `${angle}°`} onchange={(k) => turn(k > dirIx ? 1 : -1)} />
		<Toggle bind:checked={micro} label="Microscope" />
		<Button onclick={nextPoint}>Another point</Button>
	</Controls>
</div>

<style>
	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1rem;
		padding: 0.6rem 1.2rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		border-top: 1px solid var(--line-faint);
	}
</style>
