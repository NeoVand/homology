<script lang="ts">
	// The graph of a circle map f(θ) = nθ + a·sin θ, drawn as a curve climbing a
	// glass cylinder: height = where you are on the domain circle, angle = where f
	// sends you. Its shadow on the base ring winds n times. A vertical line through a
	// target point meets the curve at the preimages; counted with signs they give n.
	// Drag the target point around the base circle to move the line.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowTube, glowPoint, disposeTree } from '$lib/three/materials';
	import { cylinder, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { circlePreimages, wobbleLift } from './maps';
	import { RingCurve, GraphOnCylinder } from './curves';
	import type * as THREE_NS from 'three';
	import { onMount } from 'svelte';
	import { fitCamera, isNarrow } from './three-fit';

	let n = $state(2);
	let a = $state(0.9);
	let phiDeg = $state(70); // where the target point sits on the base circle
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { rebuild(): void; setPhi(): void } | null = null;

	const R = 1.3;
	const H = 2.9;
	const Y0 = -1.45;
	const TAU = Math.PI * 2;

	const pre = $derived(circlePreimages(n, a, (phiDeg * Math.PI) / 180));
	const plus = $derived(pre.filter((p) => p.sign > 0).length);
	const minus = $derived(pre.filter((p) => p.sign < 0).length);

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion, canvas, controls, camera, project } = ctx;
		const unfit = fitCamera(ctx, 1.25);
		const glass = glassMesh(surfaceGeometry(cylinder(R, H), 96, 8), { opacity: 0.22, grid: [24, 6], gridStrength: 0.18, rim: 0.3 });
		glass.position.y = Y0 + H / 2;
		scene.add(glass);

		// the target circle (codomain), below the cylinder
		const ringY = Y0 - 0.32;
		scene.add(glowTube(new RingCurve(R, ringY), { color: 'blue', closed: true, radius: 0.022, intensity: 0.9 }));
		label([-R - 0.75, ringY - 0.05, 0.1], tex('S^1\\ \\text{(target)}'), { className: 'blue small' });

		let graph: THREE_NS.Object3D | null = null;
		let seam: THREE_NS.Object3D | null = null;

		// target line and preimage beads
		const lineGroup = new THREE.Group();
		const vline = glowTube(new THREE.LineCurve3(new THREE.Vector3(R, ringY, 0), new THREE.Vector3(R, Y0 + H + 0.15, 0)), {
			color: 'ivory',
			radius: 0.008,
			segments: 1,
			intensity: 0.7,
			halo: true,
			haloScale: 4
		});
		lineGroup.add(vline);
		const target = glowPoint([R, ringY, 0], { color: 'ivory', size: 0.065 });
		lineGroup.add(target);
		scene.add(lineGroup);
		const yLbl = label([0, 0, 0], tex('y'), { className: 'small' });
		const beadsPlus = Array.from({ length: 10 }, () => glowPoint([0, 0, 0], { color: 'green', size: 0.06 }));
		const beadsMinus = Array.from({ length: 10 }, () => glowPoint([0, 0, 0], { color: 'rose', size: 0.06 }));
		for (const b of [...beadsPlus, ...beadsMinus]) {
			b.visible = false;
			scene.add(b);
		}
		// a runner on the graph and its shadow on the target circle
		const runner = glowPoint([0, 0, 0], { color: 'gold', size: 0.05 });
		const shadow = glowPoint([0, 0, 0], { color: 'gold', size: 0.045 });
		scene.add(runner, shadow);
		const drop = new THREE.Line(
			new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
			new THREE.LineBasicMaterial({ color: 0xf2d08f, transparent: true, opacity: 0.35 })
		);
		scene.add(drop);
		label([-R - 0.2, Y0 + H + 0.25, 0], tex('\\text{graph of } f'), { className: 'gold small' });
		const topLbl = label([0, 0, 0], tex('\\theta = 2\\pi'), { className: 'small' });
		const botLbl = label([0, 0, 0], tex('\\theta = 0'), { className: 'small' });

		function rebuild() {
			if (graph) {
				scene.remove(graph);
				disposeTree(graph);
			}
			if (seam) {
				scene.remove(seam);
				disposeTree(seam);
			}
			graph = glowTube(new GraphOnCylinder(n, a, R, Y0, H), { color: 'gold', radius: 0.024, segments: 420, radialSegments: 8 });
			scene.add(graph);
			// the domain is a circle: the top end is the same point as the bottom end
			const ang0 = wobbleLift(n, a, 0);
			const p0 = new THREE.Vector3(R * Math.cos(ang0), Y0, R * Math.sin(ang0));
			const p1 = new THREE.Vector3(R * Math.cos(ang0), Y0 + H, R * Math.sin(ang0));
			seam = glowTube(new THREE.LineCurve3(p0, p1), { color: 'gold', radius: 0.006, segments: 1, intensity: 0.35, halo: false });
			scene.add(seam);
			botLbl.position.copy(p0).add(new THREE.Vector3(0.05, -0.2, 0.25));
			topLbl.position.copy(p1).add(new THREE.Vector3(0.05, 0.2, 0.25));
			setPhi();
		}
		function setPhi() {
			const phi = (phiDeg * Math.PI) / 180;
			lineGroup.rotation.y = -phi;
			yLbl.position.set((R + 0.26) * Math.cos(phi), ringY, (R + 0.26) * Math.sin(phi));
			const list = circlePreimages(n, a, phi);
			let ip = 0;
			let im = 0;
			for (const b of [...beadsPlus, ...beadsMinus]) b.visible = false;
			for (const p of list) {
				const b = p.sign > 0 ? beadsPlus[ip++] : beadsMinus[im++];
				if (!b) continue;
				b.visible = true;
				b.position.set(R * Math.cos(phi), Y0 + (H * p.th) / TAU, R * Math.sin(phi));
			}
			invalidate();
		}
		rebuild();
		api = { rebuild, setPhi };

		// ── drag the target point: it follows the pointer's angle in the plane of the base circle ──
		const ringPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -ringY);
		const raycaster = new THREE.Raycaster();
		const ndc = new THREE.Vector2();
		const hit = new THREE.Vector3();
		const tpos = new THREE.Vector3();
		const angleAt = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
			raycaster.setFromCamera(ndc, camera);
			return raycaster.ray.intersectPlane(ringPlane, hit) ? Math.atan2(hit.z, hit.x) : null;
		};
		const onTarget = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			const s = project(target.getWorldPosition(tpos));
			return !s.behind && Math.hypot(s.x - (e.clientX - r.left), s.y - (e.clientY - r.top)) < 20;
		};
		// the canvas already shows a grab cursor for orbiting, so the point swells instead
		let hot = false;
		const heat = (on: boolean) => {
			if (on === hot) return;
			hot = on;
			target.scale.setScalar(on ? 1.5 : 1);
			invalidate();
		};
		let dragging = false;
		let controlsWere = true;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0 || !onTarget(e)) return;
			dragging = true;
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
			heat(true);
		};
		const onMove = (e: PointerEvent) => {
			if (!dragging) {
				if (e.pointerType === 'mouse') heat(!e.buttons && onTarget(e));
				return;
			}
			const ang = angleAt(e);
			if (ang !== null) phiDeg = (((ang * 180) / Math.PI) % 360 + 360) % 360;
		};
		const onUp = () => {
			if (!dragging) return;
			dragging = false;
			if (controls) controls.enabled = controlsWere;
			canvas.style.cursor = '';
			heat(false);
		};
		const onLeave = () => !dragging && heat(false);
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		canvas.addEventListener('pointerleave', onLeave);

		let clock = 0;
		const pos = drop.geometry.attributes.position as THREE_NS.BufferAttribute;
		const stop = onFrame((_t, dt) => {
			if (!reducedMotion) clock += dt;
			const s = (clock / 9) % 1;
			const ang = wobbleLift(n, a, TAU * s);
			runner.position.set(R * Math.cos(ang), Y0 + H * s, R * Math.sin(ang));
			shadow.position.set(R * Math.cos(ang), ringY, R * Math.sin(ang));
			pos.setXYZ(0, runner.position.x, runner.position.y, runner.position.z);
			pos.setXYZ(1, shadow.position.x, shadow.position.y, shadow.position.z);
			pos.needsUpdate = true;
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
		void n;
		void a;
		api?.rebuild();
	});
	$effect(() => {
		void phiDeg;
		api?.setPhi();
	});

	// the keyboard way to move the target point: focus the picture and use the arrow keys.
	// φ grows clockwise as seen from above, so the right arrow lowers it: on the near
	// side of the circle the point then moves right. The reading counts the other way.
	function key(e: KeyboardEvent) {
		const k = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[e.key];
		if (!k) return;
		e.preventDefault();
		phiDeg = (((Math.round(phiDeg) - k * (e.shiftKey ? 30 : 5)) % 360) + 360) % 360;
	}
	const reading = $derived((360 - Math.round(phiDeg)) % 360);
</script>

<div class="stage">
	<Scene3D
		{setup}
		height={narrow ? 400 : 440}
		animate
		controls={{ autoRotate: false, minPolarAngle: 0.5, maxPolarAngle: 1.75 }}
		camera={{ position: [0.4, 1.35, 6.4], target: [0, -0.3, 0] }}
		label="A gold curve climbs a glass cylinder, winding n times around it; a vertical line rises from a target point y on the base circle and meets the curve at the preimages of y, marked green or rose by orientation. The target point can be dragged around the circle."
	/>
	<div
		class="keys"
		role="slider"
		tabindex="0"
		aria-label="Target point y: arrow keys move it around the circle"
		aria-valuemin={0}
		aria-valuemax={359}
		aria-valuenow={reading}
		aria-valuetext="{reading}°, {pre.length} preimage{pre.length === 1 ? '' : 's'}"
		onkeydown={key}
	></div>
</div>
<Controls>
	<Stepper bind:value={n} min={-3} max={3} label="degree n" />
	<Slider bind:value={a} min={0} max={2.6} step={0.01} label="wobble" format={(v) => v.toFixed(2)} />
	<div class="hud ui">
		<div class="row"><span class="dot g"></span>{plus} preimage{plus === 1 ? '' : 's'} where <TeX tex={'f'} /> runs forwards</div>
		<div class="row"><span class="dot r"></span>{minus} preimage{minus === 1 ? '' : 's'} where <TeX tex={'f'} /> runs backwards</div>
		<div class="deg"><TeX tex={`\\deg f = ${plus} - ${minus} = ${plus - minus}`} /></div>
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
	.hud {
		padding: 0.45rem 0.75rem;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
		font-size: 0.74rem;
		color: var(--ink-dim);
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		flex: none;
	}
	.dot.g {
		background: var(--green);
		box-shadow: 0 0 8px var(--green);
	}
	.dot.r {
		background: var(--rose);
		box-shadow: 0 0 8px var(--rose);
	}
	.deg {
		font-size: 1rem;
		color: var(--gold-bright);
		margin-top: 0.15rem;
	}
</style>
