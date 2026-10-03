<script lang="ts">
	// Figure: a Penrose staircase and a Penrose tribar that are REAL 3D objects,
	// seen through an orthographic camera from the one "magic" direction in which
	// their far end hides exactly in front of their near end. Turn them to find
	// the cliff — the one place where the heights must jump.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import type * as THREE_NS from 'three';
	import { glowPoint } from '$lib/three/materials';
	import { penroseStairs, penroseTribar, type Box, type V3 } from './impossible';

	let which = $state<'stairs' | 'tribar'>('stairs');
	let colour = $state(true);
	let walking = $state(true);
	let climbed = $state(0);
	let turned = $state(false);

	type Api = {
		show(w: 'stairs' | 'tribar'): void;
		turn(on: boolean): void;
		setColour(on: boolean): void;
		setWalking(on: boolean): void;
	};
	// reactive, so the effects below re-run once the (lazily created) scene is ready
	let api = $state.raw<Api | null>(null);

	const STAIRS = penroseStairs([4, 4, 4, 4], { ws: [1.25, 1.25, 0.55, 0.55], W: 1.3, k: 1.8, thickness: 1.3 });
	const TRIBAR = penroseTribar(4.2, 1);

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, controls, invalidate, onFrame } = ctx;
		// half-extents (in world units) the view must show, measured in the magic view
		let need = { h: 6, w: 6 };
		const cam = camera;
		// orthographic projection on the book's perspective camera: p and p + t·d share a pixel
		cam.updateProjectionMatrix = () => {
			const a = cam.aspect || 1;
			const hh = Math.max(need.h, need.w / a);
			cam.projectionMatrix.makeOrthographic(-hh * a, hh * a, hh, -hh, cam.near, cam.far);
			cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
		};

		const ramp = (u: number) => {
			const stops = [
				[0.25, 0.65, 0.77],
				[0.64, 0.58, 1.0],
				[0.96, 0.84, 0.61]
			];
			const s = u < 0.5 ? 0 : 1;
			const k = u < 0.5 ? u * 2 : (u - 0.5) * 2;
			return new THREE.Color(...stops[s].map((a, i) => a + (stops[s + 1][i] - a) * k));
		};
		// face order of BoxGeometry: +x, −x, +y, −y, +z, −z
		const shade = [0.74, 0.5, 1.0, 0.38, 0.56, 0.46];
		const neutralStairs = new THREE.Color(0.86, 0.83, 0.78);
		const tribarBase = new THREE.Color(0.72, 0.66, 1.0);

		const edgeMat = new THREE.LineBasicMaterial({ color: 0x070b16, transparent: true, opacity: 0.9 });

		function boxMesh(b: Box, base: THREE_NS.Color, tones?: THREE_NS.Color[]) {
			const geo = new THREE.BoxGeometry(...b.size);
			const mats = shade.map(
				(f, i) =>
					new THREE.MeshBasicMaterial({
						color: tones ? tones[i].clone() : base.clone().multiplyScalar(f),
						visible: !(b.openPlusX && i === 0)
					})
			);
			const m = new THREE.Mesh(geo, mats);
			m.position.set(...b.center);
			const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), edgeMat);
			edges.position.copy(m.position);
			return { mesh: m, edges, mats };
		}
		// three classic tones for the tribar (+x, −x, +y, −y, +z, −z)
		const triTones = [
			new THREE.Color(0.55, 0.48, 0.93),
			new THREE.Color(0.3, 0.26, 0.55),
			new THREE.Color(0.93, 0.9, 1.0),
			new THREE.Color(0.25, 0.22, 0.45),
			new THREE.Color(0.33, 0.29, 0.66),
			new THREE.Color(0.28, 0.25, 0.5)
		];

		// ── the staircase ──
		const stairs = new THREE.Group();
		const stairMats: THREE_NS.MeshBasicMaterial[][] = [];
		const c0 = STAIRS.steps.reduce((acc, s) => [acc[0] + s.center[0], acc[1] + s.center[1], acc[2] + s.center[2]] as V3, [0, 0, 0] as V3).map((x) => x / STAIRS.N) as V3;
		for (const s of STAIRS.steps) {
			const { mesh, edges, mats } = boxMesh(s, ramp(s.index / (STAIRS.N - 1)));
			stairs.add(mesh, edges);
			stairMats.push(mats);
		}
		stairs.position.set(-c0[0], -c0[1], -c0[2]);
		scene.add(stairs);

		// the walker
		const walker = glowPoint([0, 0, 0], { color: 'gold', size: 0.11, halo: 8 });
		stairs.add(walker);
		const topOf = (i: number): V3 => {
			const s = STAIRS.steps[i];
			return [s.center[0], s.top + 0.16, s.center[2]];
		};
		let at = 0; // current step
		let hopT = 0; // 0…1 progress of the current hop
		const place = () => {
			const a = topOf(at);
			let b: V3;
			if (at === STAIRS.N - 1) {
				const t0 = topOf(0);
				b = [t0[0] + STAIRS.shift[0], t0[1] + STAIRS.shift[1], t0[2] + STAIRS.shift[2]];
			} else b = topOf(at + 1);
			const u = hopT;
			const e = u * u * (3 - 2 * u);
			walker.position.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e + 0.32 * Math.sin(Math.PI * u), a[2] + (b[2] - a[2]) * e);
		};
		place();

		// ── the tribar ──
		const tribar = new THREE.Group();
		const tc: V3 = [2.6, 2.6, 2.6];
		for (const b of TRIBAR.boxes) {
			// no outlines here: overlapping boxes would show their internal seams
			const { mesh } = boxMesh(b, tribarBase, triTones);
			tribar.add(mesh);
		}
		const inner = new THREE.Group();
		inner.add(tribar);
		tribar.position.set(-tc[0], -tc[1], -tc[2]);
		scene.add(inner);
		inner.visible = false;

		// ── cameras: the magic direction, and which way is "up" on screen, for each object ──
		const magicDir = (w: 'stairs' | 'tribar') => new THREE.Vector3(...(w === 'stairs' ? STAIRS.view : TRIBAR.view)).normalize();
		// the tribar stands on a horizontal beam when "up" is (−1, 0, 1) — perpendicular to (1, 1, 1)
		const upOf = (w: 'stairs' | 'tribar') => (w === 'stairs' ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(-1, 0, 1).normalize());
		const Y = new THREE.Vector3(0, 1, 0);
		const qUp = new THREE.Quaternion();
		const qUpInv = new THREE.Quaternion();
		function setUp(up: THREE_NS.Vector3) {
			cam.up.copy(up);
			qUp.setFromUnitVectors(up, Y);
			qUpInv.copy(qUp).invert();
			// OrbitControls caches this rotation when it is created; keep it in sync
			const c = controls as unknown as { _quat?: THREE_NS.Quaternion; _quatInverse?: THREE_NS.Quaternion } | null;
			c?._quat?.copy(qUp);
			c?._quatInverse?.copy(qUpInv);
		}
		const D = 40;
		const target = new THREE.Vector3(0, 0, 0);
		// measure each object's silhouette in its magic view (screen-right r, screen-up u)
		function measure(group: THREE_NS.Object3D, dir: THREE_NS.Vector3, up: THREE_NS.Vector3) {
			group.updateMatrixWorld(true);
			const n = dir.clone().normalize();
			const r = up.clone().cross(n).normalize();
			const u = n.clone().cross(r);
			const box = new THREE.Box3();
			let r0 = Infinity;
			let r1 = -Infinity;
			let u0 = Infinity;
			let u1 = -Infinity;
			const v = new THREE.Vector3();
			group.traverse((o) => {
				const m = o as THREE_NS.Mesh;
				if (!m.isMesh) return;
				box.setFromObject(m);
				for (let i = 0; i < 8; i++) {
					v.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
					r0 = Math.min(r0, v.dot(r));
					r1 = Math.max(r1, v.dot(r));
					u0 = Math.min(u0, v.dot(u));
					u1 = Math.max(u1, v.dot(u));
				}
			});
			// centre the silhouette (a sideways shift: it does not disturb the illusion)
			const cr = (r0 + r1) / 2;
			const cu = (u0 + u1) / 2;
			group.position.sub(r.multiplyScalar(cr)).sub(u.multiplyScalar(cu));
			return { w: ((r1 - r0) / 2) * 1.2, h: ((u1 - u0) / 2) * 1.26 };
		}
		let current: 'stairs' | 'tribar' = 'stairs';

		let tween: { from: THREE_NS.Spherical; to: THREE_NS.Spherical; t: number; dur: number } | null = null;
		let off: (() => void) | null = null;
		// spherical coordinates in the frame where the current "up" is +y
		const toSph = (v: THREE_NS.Vector3) => new THREE.Spherical().setFromVector3(v.clone().applyQuaternion(qUp));
		const fromSph = (s: THREE_NS.Spherical) => new THREE.Vector3().setFromSpherical(s).applyQuaternion(qUpInv);
		function placeCam(s: THREE_NS.Spherical) {
			cam.position.copy(fromSph(s)).add(target);
			cam.lookAt(target);
			controls?.update();
		}
		function goTo(dir: THREE_NS.Vector3, dur = 1.1) {
			const to = toSph(dir.clone().normalize().multiplyScalar(D));
			const from = toSph(cam.position.clone().sub(target));
			// take the short way round
			while (to.theta - from.theta > Math.PI) to.theta -= 2 * Math.PI;
			while (to.theta - from.theta < -Math.PI) to.theta += 2 * Math.PI;
			if (ctx.reducedMotion || dur < 0.05) {
				tween = null;
				placeCam(to);
				invalidate();
				return;
			}
			tween = { from, to, t: 0, dur };
			ensureLoop();
		}

		let walkingNow = !ctx.reducedMotion;
		function frame(_t: number, dt: number) {
			let busy = false;
			if (tween) {
				busy = true;
				tween.t = Math.min(1, tween.t + dt / tween.dur);
				const u = tween.t;
				const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
				const s = new THREE.Spherical(
					tween.from.radius + (tween.to.radius - tween.from.radius) * e,
					tween.from.phi + (tween.to.phi - tween.from.phi) * e,
					tween.from.theta + (tween.to.theta - tween.from.theta) * e
				);
				placeCam(s);
				if (tween.t >= 1) tween = null;
			}
			if (walkingNow && current === 'stairs') {
				busy = true;
				hopT += dt / 0.55;
				if (hopT >= 1) {
					hopT = 0;
					at = (at + 1) % STAIRS.N;
					climbed++;
				}
				place();
			}
			if (!busy) {
				off?.();
				off = null;
			}
		}
		function ensureLoop() {
			if (!off) off = onFrame(frame);
		}

		const extents = {
			stairs: measure(stairs, magicDir('stairs'), upOf('stairs')),
			tribar: measure(inner, magicDir('tribar'), upOf('tribar'))
		};
		function frameObject(w: 'stairs' | 'tribar') {
			need = extents[w];
			cam.updateProjectionMatrix();
		}

		controls?.target.copy(target);
		setUp(upOf('stairs'));
		frameObject('stairs');
		goTo(magicDir('stairs'), 0);
		if (walkingNow) ensureLoop();

		api = {
			show(w) {
				current = w;
				stairs.visible = w === 'stairs';
				inner.visible = w === 'tribar';
				setUp(upOf(w));
				frameObject(w);
				goTo(magicDir(w), 0);
				turned = false;
				if (w === 'stairs' && walkingNow) ensureLoop();
				invalidate();
			},
			turn(on) {
				const m = magicDir(current).multiplyScalar(D);
				if (on) {
					const s = toSph(m);
					if (current === 'stairs') {
						s.theta += 0.95;
						s.phi = Math.min(Math.PI / 2 - 0.12, s.phi + 0.32);
					} else {
						s.theta += 0.34;
						s.phi -= 0.1;
					}
					goTo(fromSph(s), 1.4);
				} else goTo(m, 1.2);
			},
			setColour(on) {
				STAIRS.steps.forEach((s, i) => {
					const base = on ? ramp(s.index / (STAIRS.N - 1)) : neutralStairs;
					stairMats[i].forEach((m, f) => m.color.copy(base).multiplyScalar(shade[f]));
				});
				invalidate();
			},
			setWalking(on) {
				walkingNow = on;
				if (on) ensureLoop();
				invalidate();
			}
		};
		return {
			dispose: () => {
				off?.();
				api = null;
			}
		};
	}

	// read the dependency first: `api?.show(which)` would skip reading `which` while api is null
	$effect(() => {
		const w = which;
		api?.show(w);
	});
	$effect(() => {
		const c = colour;
		api?.setColour(c);
	});
	$effect(() => {
		const on = walking;
		api?.setWalking(on);
	});
</script>

<Scene3D
	{setup}
	height={460}
	camera={{ position: [32, 40, 32], target: [0, 0, 0], fov: 30 }}
	controls={{ zoom: false, pan: false }}
	label="A Penrose staircase built as a real three-dimensional object, seen from the single direction in which it appears to climb forever; turning it reveals a hidden cliff. A second mode shows the Penrose tribar built the same way."
>
	<div class="hud ui">
		{#if which === 'stairs'}
			<div class="big nums">↑ {climbed}</div>
			<div class="small">steps climbed — every step is +1</div>
			<div class="small">one lap = {STAIRS.N} steps, loop sum = +{STAIRS.N}</div>
		{:else}
			<div class="small strong">Three right-angled corners.</div>
			<div class="small">Each is a perfectly good joint;</div>
			<div class="small">together they are impossible.</div>
		{/if}
	</div>
</Scene3D>
<Controls>
	<Segmented
		bind:value={which}
		options={[
			{ value: 'stairs', label: 'Staircase' },
			{ value: 'tribar', label: 'Tribar' }
		]}
		label="Which impossible object"
	/>
	<Button variant={turned ? 'ghost' : 'gold'} onclick={() => ((turned = !turned), api?.turn(turned))}>
		{turned ? 'Back to the magic view' : 'Turn it to find the trick'}
	</Button>
	{#if which === 'stairs'}
		<Toggle bind:checked={colour} label="Colour by height" />
		<Toggle bind:checked={walking} label="Walk" />
	{/if}
</Controls>

<style>
	.hud {
		position: absolute;
		left: 1rem;
		top: 0.9rem;
		padding: 0.55rem 0.8rem 0.6rem;
		border-radius: 10px;
		background: rgba(6, 10, 20, 0.62);
		border: 1px solid var(--line-faint);
		backdrop-filter: blur(4px);
		pointer-events: none;
		max-width: 15rem;
	}
	.big {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--gold-bright);
		line-height: 1.1;
	}
	.small {
		font-size: 0.72rem;
		color: var(--ink-dim);
		line-height: 1.45;
	}
	.strong {
		color: var(--ink-bright);
	}
</style>
