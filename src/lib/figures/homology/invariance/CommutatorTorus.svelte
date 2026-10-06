<script lang="ts">
	// A torus with a hole punched in it. The loop a·b·a⁻¹·b⁻¹ (running around the
	// edge of the gluing square) slides down onto the rim of the hole. At every stage
	// it is the boundary of the shaded surface — so it is 0 in H₁ — yet it can never
	// be shrunk to a point: the hole is in the way, and in π₁ it is aba⁻¹b⁻¹ ≠ 1.
	// Drag the loop itself to slide it.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowTube, glowPoint, iridescent, disposeTree } from '$lib/three/materials';
	import { torus, SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type * as THREE_NS from 'three';
	import { onMount } from 'svelte';
	import { fitCamera, isNarrow } from './three-fit';

	let slide = $state(0.35); // 0: the edge of the square, 1: the rim of the hole
	let showAB = $state(true);
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { setSlide(v: number): void; setAB(on: boolean): void } | null = null;

	const R = 1.6;
	const r = 0.62;
	const UC = 0.75; // centre of the hole (back of the torus, near the top of the tube)
	const VC = 0.28;
	const RHO = 0.42; // radius of the hole on the surface
	const TAU = Math.PI * 2;
	const wC = R + r * Math.cos(TAU * VC);
	const DU = RHO / (TAU * wC);
	const DV = RHO / (TAU * r);

	/** point of the punctured square: s = 0 on the rim of the hole, s = 1 on the edge of the square */
	function uvAt(s: number, phi: number): [number, number] {
		const c = Math.cos(phi);
		const sn = Math.sin(phi);
		const m = Math.max(Math.abs(c), Math.abs(sn));
		const su = (0.5 * c) / m;
		const sv = (0.5 * sn) / m;
		return [UC + (1 - s) * DU * c + s * su, VC + (1 - s) * DV * sn + s * sv];
	}
	const S_MAX = 0.985;
	const level = (t: number) => S_MAX - S_MAX * t;
	const PHI0 = (5 * Math.PI) / 4; // start at the bottom-left corner, run counterclockwise

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion, canvas, controls, camera, project } = ctx;
		const unfit = fitCamera(ctx, 1.7);
		const f = torus(R, r);
		const tmp = new THREE.Vector3();
		const nrm = new THREE.Vector3();

		/** a mesh over s ∈ [s0, s1], φ ∈ [0, 2π) with positions refreshable in place */
		function patch(ns: number, nphi: number, opts: Parameters<typeof iridescent>[0], lift: number) {
			const pos = new Float32Array((ns + 1) * (nphi + 1) * 3);
			const uv = new Float32Array((ns + 1) * (nphi + 1) * 2);
			const idx: number[] = [];
			for (let i = 0; i < ns; i++)
				for (let j = 0; j < nphi; j++) {
					const a = i * (nphi + 1) + j;
					const b = a + nphi + 1;
					idx.push(a, b, a + 1, b, b + 1, a + 1);
				}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
			geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
			geo.setIndex(idx);
			const mesh = new THREE.Mesh(geo, iridescent(opts));
			const fill = (s0: number, s1: number) => {
				let k = 0;
				let q = 0;
				for (let i = 0; i <= ns; i++) {
					const s = s0 + ((s1 - s0) * i) / ns;
					for (let j = 0; j <= nphi; j++) {
						const phi = PHI0 + (TAU * j) / nphi;
						let [u, v] = uvAt(s, phi);
						u = ((u % 1) + 1) % 1;
						v = ((v % 1) + 1) % 1;
						f(u, v, tmp);
						if (lift) {
							surfaceNormal(f, u, v, nrm);
							tmp.addScaledVector(nrm, lift);
						}
						pos[k++] = tmp.x;
						pos[k++] = tmp.y;
						pos[k++] = tmp.z;
						uv[q++] = s;
						uv[q++] = j / nphi;
					}
				}
				geo.attributes.position.needsUpdate = true;
				geo.computeVertexNormals();
				geo.computeBoundingSphere();
			};
			return { mesh, fill };
		}

		// the punctured torus (glass) — two passes for nicer transparency
		const back = patch(36, 220, { opacity: 0.3, grid: [10, 32], gridStrength: 0.16, side: THREE.BackSide, depthWrite: false, brightness: 0.6 }, 0);
		const front = patch(36, 220, { opacity: 0.3, grid: [10, 32], gridStrength: 0.16, side: THREE.FrontSide, depthWrite: false, brightness: 0.75 }, 0);
		back.fill(0, 1);
		front.fill(0, 1);
		back.mesh.renderOrder = 1;
		front.mesh.renderOrder = 2;
		scene.add(back.mesh, front.mesh);

		// the shaded surface bounded by the loop
		const shade = patch(30, 220, { opacity: 0.62, tint: 'teal', tintMix: 0.88, grid: [6, 32], gridStrength: 0.35, gridColor: 'teal', depthWrite: false, rim: 0.3, side: THREE.FrontSide }, 0.004);
		shade.mesh.renderOrder = 3;
		scene.add(shade.mesh);

		// the rim of the hole
		scene.add(glowTube(new SurfaceCurve(f, (t) => uvAt(0, PHI0 + TAU * t), 0.008), { color: 'rose', closed: true, radius: 0.016, intensity: 0.85 }));
		const holeP = new THREE.Vector3();
		f(UC, VC + DV * 1.4, holeP);
		label(holeP.clone().multiplyScalar(1.18).add(new THREE.Vector3(0, 0.34, 0)), tex('\\text{hole}'), { className: 'rose small' });

		// a and b
		const aLoop = glowTube(new SurfaceCurve(f, (t) => [t, VC + 0.5], 0.012), { color: 'gold', closed: true, radius: 0.011, intensity: 0.6, haloScale: 2.4 });
		const bLoop = glowTube(new SurfaceCurve(f, (t) => [UC + 0.5, t], 0.012), { color: 'violet', closed: true, radius: 0.011, intensity: 0.6, haloScale: 2.4 });
		scene.add(aLoop, bLoop);
		const pa = new THREE.Vector3();
		f(UC + 0.5 + 0.12, VC + 0.5, pa);
		const la = label(pa.clone().add(new THREE.Vector3(0, -0.3, 0.1)), tex('a'), { className: 'gold' });
		f(UC + 0.5, VC + 0.5 + 0.2, pa);
		const lb = label(pa.clone().multiplyScalar(1.12).add(new THREE.Vector3(0.25, 0, 0)), tex('b'), { className: 'violet' });

		let loop: THREE_NS.Object3D | null = null;
		const bead = glowPoint([0, 0, 0], { color: 'ivory', size: 0.05 });
		scene.add(bead);
		let sLevel = level(slide);
		let hot = false; // pointer over the loop, or dragging it

		function buildLoop() {
			if (loop) {
				scene.remove(loop);
				disposeTree(loop);
			}
			loop = glowTube(new SurfaceCurve(f, (q) => uvAt(sLevel, PHI0 + TAU * q), 0.016), { color: 'teal', closed: true, radius: hot ? 0.032 : 0.026, segments: 260, intensity: hot ? 1.7 : 1.25 });
			scene.add(loop);
			invalidate();
		}
		function setSlide(t: number) {
			sLevel = level(t);
			shade.fill(sLevel, 1);
			buildLoop();
		}
		function setAB(on: boolean) {
			aLoop.visible = on;
			bLoop.visible = on;
			la.show(on);
			lb.show(on);
			invalidate();
		}
		setSlide(slide);
		setAB(showAB);
		api = { setSlide, setAB };

		// ── drag the loop: track the grabbed point (s, φ) of the punctured square,
		// searching only near it so the loop never jumps to another stretch that
		// crosses it on screen ──
		const sp = new THREE.Vector3();
		const out = new THREE.Vector3();
		const view = new THREE.Vector3();
		const at = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			return [e.clientX - r.left, e.clientY - r.top];
		};
		const screenDist2 = (s: number, phi: number, x: number, y: number) => {
			let [u, v] = uvAt(s, phi);
			u = ((u % 1) + 1) % 1;
			v = ((v % 1) + 1) % 1;
			f(u, v, sp);
			const p = project(sp);
			if (p.behind) return Infinity;
			// favour the side of the tube that faces the camera: where the loop folds
			// over a silhouette it then comes back on the visible side, instead of
			// slipping round underneath
			out.set(R * Math.cos(TAU * u), 0, R * Math.sin(TAU * u)).subVectors(sp, out);
			const facing = out.dot(view.subVectors(camera.position, sp)) > 0;
			return (p.x - x) ** 2 + (p.y - y) ** 2 + (facing ? 0 : 100);
		};
		/** the angle φ of the point of the loop nearest the pointer, if it is within reach */
		const grabAt = (e: PointerEvent): number | null => {
			const [x, y] = at(e);
			let best = Infinity;
			let phi = 0;
			for (let i = 0; i < 240; i++) {
				const ph = PHI0 + (TAU * i) / 240;
				const d = screenDist2(sLevel, ph, x, y);
				if (d < best) {
					best = d;
					phi = ph;
				}
			}
			return best < 16 * 16 ? phi : null;
		};
		const heat = (on: boolean) => {
			if (on === hot) return;
			hot = on;
			buildLoop();
		};
		let grabbed: number | null = null;
		let controlsWere = true;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			grabbed = grabAt(e);
			if (grabbed === null) return;
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
			heat(true);
		};
		const onMove = (e: PointerEvent) => {
			if (grabbed === null) {
				// the canvas already shows a grab cursor for orbiting, so the loop lights up
				if (e.pointerType === 'mouse') heat(!e.buttons && grabAt(e) !== null);
				return;
			}
			const [x, y] = at(e);
			let best = Infinity;
			let bs = sLevel;
			let bphi = grabbed;
			for (let i = -24; i <= 24; i++) {
				const s = Math.min(S_MAX, Math.max(0, sLevel + i * 0.004));
				for (let j = -12; j <= 12; j++) {
					const ph = grabbed + j * 0.03;
					const d = screenDist2(s, ph, x, y);
					if (d < best) {
						best = d;
						bs = s;
						bphi = ph;
					}
				}
			}
			grabbed = bphi;
			slide = 1 - bs / S_MAX;
		};
		const onUp = () => {
			if (grabbed === null) return;
			grabbed = null;
			if (controls) controls.enabled = controlsWere;
			canvas.style.cursor = '';
			heat(false);
		};
		const onLeave = () => grabbed === null && heat(false);
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		canvas.addEventListener('pointerleave', onLeave);

		let clock = 0;
		const stop = onFrame((_t, dt) => {
			if (!reducedMotion) clock += dt;
			const q = (clock / 7) % 1;
			let [u, v] = uvAt(sLevel, PHI0 + TAU * q);
			u = ((u % 1) + 1) % 1;
			v = ((v % 1) + 1) % 1;
			f(u, v, tmp);
			surfaceNormal(f, u, v, nrm);
			bead.position.copy(tmp).addScaledVector(nrm, 0.03);
		});
		return {
			dispose: () => {
				unfit();
				stop();
				api = null;
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
				canvas.removeEventListener('pointerleave', onLeave);
			}
		};
	}

	$effect(() => {
		// read the state first: `api?.f(x)` would skip reading x while api is null,
		// and the effect would then never re-run
		const v = slide;
		api?.setSlide(v);
	});
	$effect(() => {
		// read the state first: `api?.f(x)` would skip reading x while api is null,
		// and the effect would then never re-run
		const v = showAB;
		api?.setAB(v);
	});

	// the keyboard way to slide the loop: focus the picture and use the arrow keys
	function key(e: KeyboardEvent) {
		const step = e.shiftKey ? 0.1 : 0.02;
		const d: Record<string, number> = { ArrowRight: step, ArrowUp: step, ArrowLeft: -step, ArrowDown: -step, Home: -1, End: 1 };
		if (!(e.key in d)) return;
		e.preventDefault();
		slide = Math.min(1, Math.max(0, slide + d[e.key]));
	}
	const where = $derived(
		slide < 0.02 ? 'on the edge of the square, running a, b, a⁻¹, b⁻¹' : slide > 0.98 ? 'on the rim of the hole' : `${Math.round(slide * 100)}% of the way to the rim of the hole`
	);
</script>

<div class="stage">
	<Scene3D
		{setup}
		height={narrow ? 340 : 440}
		animate
		controls={{ autoRotate: false }}
		camera={{ position: [-1.2, 3.6, -5.2], target: [0, -0.2, 0] }}
		label="A torus with a hole. The teal loop, which runs a, then b, then a backwards, then b backwards, can be dragged down onto the rim of the hole; it always bounds the teal surface but never shrinks to a point"
	/>
	<div
		class="keys"
		role="slider"
		tabindex="0"
		aria-label="The teal loop: arrow keys slide it towards the hole"
		aria-valuemin={0}
		aria-valuemax={100}
		aria-valuenow={Math.round(slide * 100)}
		aria-valuetext={where}
		onkeydown={key}
	></div>
</div>
<Controls>
	<Toggle bind:checked={showAB} label="Show a and b" />
	<div class="read">
		<div><span class="tag">homology</span> <TeX tex={String.raw`[\text{loop}] = [\partial(\text{shaded})] = 0 \in H_1`} /></div>
		<div><span class="tag">homotopy</span> <TeX tex={String.raw`\text{loop} \simeq aba^{-1}b^{-1} \neq 1 \in \pi_1`} /></div>
	</div>
</Controls>

<style>
	.stage {
		position: relative;
	}
	.keys {
		position: absolute;
		inset: 0;
		pointer-events: none;
		outline: none;
	}
	.keys:focus-visible {
		outline: 2px solid var(--gold-bright);
		outline-offset: -4px;
	}
	.read {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 0.92rem;
		color: var(--ink-bright);
	}
	.tag {
		display: inline-block;
		min-width: 5.6rem;
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
</style>
