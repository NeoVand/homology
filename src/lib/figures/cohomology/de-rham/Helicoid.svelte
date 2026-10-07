<script lang="ts">
	// Figure (3D): the angle θ as a spiral staircase. Above each point of the
	// punctured plane, the helicoid has one sheet for every possible value of θ
	// (they differ by 2π). Walking a loop and following θ continuously lifts the
	// loop onto the staircase: around the hole you climb one storey per lap;
	// beside it, you come back to where you started.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { fitCamera } from '$lib/figures/homology/invariance/three-fit';
	import type { Object3D, Vector3 } from 'three';
	import { disposeTree, glassMesh, glowPoint, glowTube, setGlowColor } from '$lib/three/materials';
	import { surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { fmt } from '$lib/figures/cohomology/differential-forms/calc';
	import { TAU } from './derham';

	const C = 0.25; // height per radian
	const Y0 = -1.45; // height of θ = 0
	const YB = -2.05; // the base plane

	type Mode = 'around' | 'beside';
	let mode = $state<Mode>('around');
	let laps = $state(1.35);
	let innerWidth = $state(1000);

	/** the loop in the plane, t ∈ [0, 1] one lap; returns (X, Y) */
	function loopXY(m: Mode, t: number): [number, number] {
		const a = TAU * t;
		if (m === 'around') {
			const r = 1.35 + 0.22 * Math.sin(3 * a + 0.5);
			const ph = a + 0.12 * Math.sin(2 * a);
			return [r * Math.cos(ph), r * Math.sin(ph)];
		}
		return [1.3 + 0.5 * Math.cos(a), 0.2 + 0.5 * Math.sin(a)];
	}
	/** the angle followed continuously along τ laps (τ may exceed 1) */
	function liftedTheta(m: Mode, tau: number): number {
		const n = Math.max(2, Math.ceil(tau * 200));
		let [x, y] = loopXY(m, 0);
		let th = Math.atan2(y, x);
		for (let i = 1; i <= n; i++) {
			const [x2, y2] = loopXY(m, ((tau * i) / n) % 1);
			th += Math.atan2(x * y2 - y * x2, x * x2 + y * y2);
			x = x2;
			y = y2;
		}
		return th;
	}
	const swept = $derived(liftedTheta(mode, laps) - liftedTheta(mode, 0));

	let api: { set(m: Mode, laps: number): void } | null = null;

	function setup(ctx: SceneContext) {
		// on a narrow (portrait) canvas, step back so the whole staircase stays in frame
		const unfit = fitCamera(ctx, 1.4);
		const { THREE, scene, label, invalidate } = ctx;
		const toV = (X: number, Y: number, y: number) => new THREE.Vector3(X, y, -Y);

		// the helicoid: radius r ∈ [0.2, 2], θ ∈ [−0.6, 4π + 0.6]
		const th0 = -0.6;
		const th1 = 2 * TAU + 0.6;
		const helicoid = surfaceGeometry(
			(u, v, t) => {
				const r = 0.2 + 1.8 * u;
				const th = th0 + (th1 - th0) * v;
				t.set(r * Math.cos(th), Y0 + C * th, -r * Math.sin(th));
			},
			28,
			220
		);
		scene.add(glassMesh(helicoid, { opacity: 0.5, grid: [9, 28], gridStrength: 0.3, film: 1.3 }));

		// the missing axis
		const axis = glowTube(new THREE.LineCurve3(new THREE.Vector3(0, YB - 0.05, 0), new THREE.Vector3(0, Y0 + C * th1 + 0.4, 0)), {
			color: 'rose',
			radius: 0.012,
			segments: 8
		});
		scene.add(axis);

		// the base plane: a faint disk with a ring grid
		const base = glassMesh(
			surfaceGeometry((u, v, t) => {
				const r = 0.08 + 2.0 * v;
				const a = TAU * u;
				t.set(r * Math.cos(a), YB, -r * Math.sin(a));
			}, 72, 12),
			{ opacity: 0.22, grid: [16, 6], gridStrength: 0.25, tint: 'blue', tintMix: 0.35 }
		);
		scene.add(base);
		scene.add(glowPoint([0, YB, 0], { color: 'rose', size: 0.045, halo: 8 }));

		// level labels on the axis
		for (let k = 0; k <= 2; k++) {
			const y = Y0 + C * TAU * k;
			label([0.32, y, 0], tex(k === 0 ? '\\theta = 0' : k === 1 ? '\\theta = 2\\pi' : '\\theta = 4\\pi'), {
				className: 'rose small'
			});
		}

		let groundLoop: Object3D | null = null;
		let lifted: Object3D | null = null;
		const bead = glowPoint([0, 0, 0], { color: 'gold', size: 0.06, halo: 10 });
		const shadow = glowPoint([0, 0, 0], { color: 'gold', size: 0.035, halo: 7 });
		scene.add(bead, shadow);
		const dropGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
		const drop = new THREE.Line(
			dropGeo,
			new THREE.LineDashedMaterial({ color: 0xf6dca0, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.7 })
		);
		scene.add(drop);

		function build(m: Mode, L: number) {
			if (groundLoop) {
				scene.remove(groundLoop);
				disposeTree(groundLoop);
			}
			if (lifted) {
				scene.remove(lifted);
				disposeTree(lifted);
			}
			const gc = new THREE.CatmullRomCurve3(
				Array.from({ length: 120 }, (_, i) => {
					const [X, Y] = loopXY(m, i / 120);
					return toV(X, Y, YB + 0.01);
				}),
				true
			);
			groundLoop = glowTube(gc, { color: 'gold', radius: 0.018, closed: true, segments: 240, intensity: 0.8 });
			scene.add(groundLoop);

			// the lift onto the helicoid, for τ ∈ [0, L]
			const n = Math.max(8, Math.ceil(L * 260));
			const pts: Vector3[] = [];
			let [x, y] = loopXY(m, 0);
			let th = Math.atan2(y, x);
			pts.push(toV(x, y, Y0 + C * th));
			for (let i = 1; i <= n; i++) {
				const [x2, y2] = loopXY(m, ((L * i) / n) % 1);
				th += Math.atan2(x * y2 - y * x2, x * x2 + y * y2);
				x = x2;
				y = y2;
				pts.push(toV(x, y, Y0 + C * th));
			}
			if (pts.length > 1) {
				lifted = glowTube(new THREE.CatmullRomCurve3(pts), { color: 'gold', radius: 0.028, segments: Math.min(900, n * 2) });
				setGlowColor(lifted, 'gold', 1.2);
				scene.add(lifted);
			}
			const end = pts[pts.length - 1];
			bead.position.copy(end);
			shadow.position.set(end.x, YB + 0.01, end.z);
			dropGeo.setFromPoints([end, shadow.position.clone()]);
			drop.computeLineDistances();
			invalidate();
		}
		api = { set: build };
		build(mode, laps);
		return {
			dispose: () => {
				unfit();
				api = null;
			}
		};
	}

	$effect(() => {
		// read the state first: `api?.` would short-circuit and skip subscribing
		const m = mode;
		const l = laps;
		api?.set(m, l);
	});
</script>

<svelte:window bind:innerWidth />

<div class="helicoid">
	<Scene3D
		{setup}
		height={innerWidth < 640 ? 400 : 500}
		camera={{ position: [4.6, 1.5, 5.4], target: [0, -0.05, 0], fov: 40 }}
		controls={{ autoRotate: false, minPolarAngle: 0.25, maxPolarAngle: 2.3 }}
		animate
		label="A spiral staircase surface (a helicoid) over the punctured plane, with a loop in the plane and its lift onto the staircase."
	/>
	<Controls>
		<Segmented
			bind:value={mode}
			label="Loop"
			options={[
				{ value: 'around', label: 'Around the hole' },
				{ value: 'beside', label: 'Beside the hole' }
			]}
		/>
		<Timeline bind:value={laps} min={0} max={2} duration={6.4} from="start" to="two laps" label="Walking the loop twice" />
	</Controls>
	<div class="readout">
		<span class="lbl">angle followed continuously:</span>
		<span class="eq"><TeX tex={String.raw`\theta_{\text{now}} - \theta_{\text{start}} = ${fmt(swept, 2).replace('−', '-')} \;=\; ${fmt(swept / TAU, 2).replace('−', '-')}\times 2\pi`} /></span>
	</div>
</div>

<style>
	.readout {
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		text-align: center;
		font-size: 1.02rem;
		overflow-x: auto;
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: baseline;
		gap: 0.2rem 0.8rem;
	}
	.eq {
		white-space: nowrap;
	}
</style>
