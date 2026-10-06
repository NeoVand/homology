<script lang="ts">
	// ℤ → ℤ/n and ℝ → ℝ/ℤ as a helix wound on a glass cylinder: every class is a
	// vertical "fibre", and the projection to the quotient squashes the spring flat
	// onto its shadow, a circle.
	import * as THREE from 'three';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glassMesh, glowTube, glowPoint, disposeTree } from '$lib/three/materials';
	import { cylinder, disk, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { renderMathInText } from '$lib/katex/render';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { classColor } from './palette';
	import { CircleCurve, HelixCurve } from './curves';

	type Mode = 'int' | 'real';
	let mode = $state<Mode>('int');
	let n = $state(5);
	let tval = $state(0.08);
	let dropped = $state(false);
	const drop = new Tween(0, { duration: 1100, easing: cubicInOut });

	const RC = 1.25; // cylinder radius
	const Y_BOT = -1.45;
	const Y_TOP = 1.95;
	const Y_BASE = -2.15; // the "floor" where the quotient circle lives
	const TURNS = 3;
	const ANG0 = Math.PI / 2; // angle facing the camera

	let api: { rebuild(mode: Mode, n: number): void; setDrop(p: number): void; setT(t: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, invalidate, label } = ctx;

		// glass cylinder and a faint floor
		const cylH = Y_TOP - Y_BOT + 0.35;
		const cyl = glassMesh(surfaceGeometry(cylinder(RC, cylH), 96, 8), {
			opacity: 0.08,
			grid: [0, 6],
			gridStrength: 0.1,
			film: 0.5,
			hue: 0.5,
			tint: 'blue',
			tintMix: 0.62,
			rim: 0.45,
			brightness: 0.85
		});
		cyl.position.y = (Y_TOP + Y_BOT) / 2;
		scene.add(cyl);
		const floor = glassMesh(surfaceGeometry(disk(RC + 0.55), 64, 6), { opacity: 0.07, grid: [24, 3], gridStrength: 0.1, rim: 0 });
		floor.position.y = Y_BASE - 0.002;
		scene.add(floor);

		// the quotient circle on the floor
		const baseCircle = glowTube(new CircleCurve(RC, Y_BASE), { color: 'teal', radius: 0.022, closed: true, segments: 160 });
		scene.add(baseCircle);

		let dynamic = new THREE.Group();
		scene.add(dynamic);
		let labels: LabelHandle[] = [];
		let pointObjs: { obj: THREE.Object3D; y0: number }[] = [];
		let helix: THREE.Group | null = null;
		let current: { mode: Mode; n: number } = { mode: 'int', n: 5 };
		let realBits: { pts: THREE.Object3D[]; fibre: THREE.Group | null; base: THREE.Object3D | null; lbls: LabelHandle[] } = {
			pts: [],
			fibre: null,
			base: null,
			lbls: []
		};
		let dropP = 0;
		let tNow = tval;

		const helixCurve = (yb: number, yt: number, turns: number) => new HelixCurve(RC + 0.015, yb, yt, turns, ANG0);

		function clearDynamic() {
			scene.remove(dynamic);
			disposeTree(dynamic);
			dynamic = new THREE.Group();
			scene.add(dynamic);
			labels.forEach((l) => l.remove());
			labels = [];
			realBits.lbls.forEach((l) => l.remove());
			realBits = { pts: [], fibre: null, base: null, lbls: [] };
			pointObjs = [];
			helix = null;
		}

		function vertical(x: number, z: number, y0: number, y1: number, color: string, radius = 0.007, intensity = 0.55) {
			const curve = new THREE.LineCurve3(new THREE.Vector3(x, y0, z), new THREE.Vector3(x, y1, z));
			return glowTube(curve, { color, radius, segments: 2, halo: false, intensity, radialSegments: 6 });
		}

		function buildInt(n: number) {
			// integers k = −n … 2n−1 (three turns), class colour = k mod n
			const k0 = -n;
			const count = TURNS * n;
			const dy = (Y_TOP - Y_BOT) / (count - 1);
			helix = new THREE.Group();
			helix.add(glowTube(helixCurve(Y_BOT - dy * 0.5, Y_TOP + dy * 0.5, TURNS * (1 + 1 / (count - 1))), { color: 'gold', radius: 0.012, intensity: 0.55, segments: 360 }));
			dynamic.add(helix);
			for (let c = 0; c < n; c++) {
				const a = ANG0 + (2 * Math.PI * c) / n;
				const x = RC * Math.cos(a);
				const z = RC * Math.sin(a);
				dynamic.add(vertical(x, z, Y_BASE, Y_TOP + 0.15, classColor(c)));
				const bp = glowPoint([x, Y_BASE, z], { color: classColor(c), size: 0.075 });
				dynamic.add(bp);
				const lx = (RC + 0.42) * Math.cos(a);
				const lz = (RC + 0.42) * Math.sin(a);
				labels.push(label([lx, Y_BASE - 0.05, lz], tex(`[${c}]`), { className: 'small' }));
			}
			for (let i = 0; i < count; i++) {
				const k = k0 + i;
				const cls = ((k % n) + n) % n;
				const a = ANG0 + (2 * Math.PI * k) / n;
				const y = Y_BOT + i * dy;
				const p = glowPoint([RC * Math.cos(a), y, RC * Math.sin(a)], { color: classColor(cls), size: 0.058 });
				dynamic.add(p);
				pointObjs.push({ obj: p, y0: y });
				if (k === 0 || k === n || k === -n || k === 1) {
					const lbl = label([(RC + 0.3) * Math.cos(a), y, (RC + 0.3) * Math.sin(a)], tex(String(k)), {
						className: 'small',
						normal: [Math.cos(a), 0, Math.sin(a)]
					});
					labels.push(lbl);
				}
			}
			labels.push(label([0, Y_TOP + 0.45, 0], tex(String.raw`\Z`), { className: 'gold' }));
			labels.push(label([0, Y_BASE - 0.55, RC + 0.2], tex(String.raw`\Z/${n}`), { className: 'teal' }));
		}

		function buildReal() {
			helix = new THREE.Group();
			helix.add(glowTube(helixCurve(Y_BOT, Y_TOP, TURNS), { color: 'gold', radius: 0.022, intensity: 0.95, segments: 420 }));
			// integer ticks on the helix (all of them land on the same point [0])
			for (let k = -1; k <= 1; k++) {
				const y = Y_BOT + ((k + 1.5) / TURNS) * (Y_TOP - Y_BOT);
				const a = ANG0 + 2 * Math.PI * k;
				const tick = glowPoint([(RC + 0.015) * Math.cos(a), y, (RC + 0.015) * Math.sin(a)], { color: 'ivory', size: 0.032, halo: 5 });
				helix.add(tick);
			}
			dynamic.add(helix);
			labels.push(label([0, Y_TOP + 0.45, 0], tex(String.raw`\R`), { className: 'gold' }));
			labels.push(label([0, Y_BASE - 0.55, RC + 0.2], tex(String.raw`\R/\Z`), { className: 'teal' }));
			placeReal(tNow);
		}

		function placeReal(t: number) {
			// remove previous class markers
			for (const o of realBits.pts) {
				dynamic.remove(o);
				disposeTree(o);
			}
			if (realBits.fibre) {
				dynamic.remove(realBits.fibre);
				disposeTree(realBits.fibre);
			}
			if (realBits.base) {
				dynamic.remove(realBits.base);
				disposeTree(realBits.base);
			}
			realBits.lbls.forEach((l) => l.remove());
			realBits = { pts: [], fibre: null, base: null, lbls: [] };
			pointObjs = [];
			const a = ANG0 + 2 * Math.PI * t;
			const x = RC * Math.cos(a);
			const z = RC * Math.sin(a);
			realBits.fibre = vertical(x, z, Y_BASE, Y_TOP + 0.15, '#f28db6', 0.009, 0.8);
			dynamic.add(realBits.fibre);
			for (let k = -2; k <= 2; k++) {
				const s = t + k;
				if (s < -1.5 || s > 1.5) continue;
				const y = Y_BOT + ((s + 1.5) / TURNS) * (Y_TOP - Y_BOT);
				const p = glowPoint([(RC + 0.02) * Math.cos(a), y, (RC + 0.02) * Math.sin(a)], { color: 'rose', size: 0.07 });
				dynamic.add(p);
				realBits.pts.push(p);
				pointObjs.push({ obj: p, y0: y });
				const val = Math.round(s * 100) / 100;
				realBits.lbls.push(
					label([(RC + 0.42) * Math.cos(a), y, (RC + 0.42) * Math.sin(a)], tex(val.toFixed(2).replace('-', '−')), {
						className: 'rose small',
						normal: [Math.cos(a), 0, Math.sin(a)]
					})
				);
			}
			realBits.base = glowPoint([x, Y_BASE, z], { color: 'rose', size: 0.09 });
			dynamic.add(realBits.base);
			const frac = (((t % 1) + 1) % 1).toFixed(2);
			realBits.lbls.push(label([(RC + 0.48) * Math.cos(a), Y_BASE - 0.05, (RC + 0.48) * Math.sin(a)], tex(`[${frac}]`), { className: 'rose small' }));
			applyDrop(dropP);
		}

		function applyDrop(p: number) {
			dropP = p;
			for (const { obj, y0 } of pointObjs) obj.position.y = y0 + (Y_BASE - y0) * p;
			if (helix) {
				helix.scale.y = Math.max(0.0001, 1 - p);
				helix.position.y = Y_BASE * p;
			}
			for (const l of labels) {
				// labels of individual integers follow their points only loosely: fade them while dropping
				if (l.el.classList.contains('small') && !l.el.textContent?.includes('[')) l.el.style.visibility = p > 0.05 ? 'hidden' : '';
			}
			for (const l of realBits.lbls) if (!l.el.textContent?.includes('[')) l.el.style.visibility = p > 0.05 ? 'hidden' : '';
			invalidate();
		}

		api = {
			rebuild(m, nn) {
				current = { mode: m, n: nn };
				clearDynamic();
				if (m === 'int') buildInt(nn);
				else buildReal();
				applyDrop(dropP);
			},
			setDrop: applyDrop,
			setT(t) {
				tNow = t;
				if (current.mode === 'real') placeReal(t);
			}
		};
		api.rebuild(mode, n);
		return {
			dispose() {
				api = null;
			}
		};
	}

	// Read the reactive values *before* the optional call: `api?.f(x)` would skip
	// evaluating x while api is still null, and the effect would never re-run.
	$effect(() => {
		const m = mode;
		const nn = n;
		api?.rebuild(m, nn);
	});
	$effect(() => {
		const t = tval;
		api?.setT(t);
	});
	$effect(() => {
		const p = drop.current;
		api?.setDrop(p);
	});

	function toggleDrop() {
		dropped = !dropped;
		drop.set(dropped ? 1 : 0, { duration: prefersReducedMotion.current ? 0 : 1100 });
	}

	const caption = $derived(
		mode === 'int'
			? String.raw`Integers \(k\) and \(k+${n}\) sit on the same vertical line: they are one class of \(\Z/${n}\). Dropping every point straight down is the projection \(q\colon \Z\to\Z/${n}\).`
			: String.raw`The numbers \(t\), \(t\pm1\), \(t\pm2,\dots\) sit on one vertical line: one point of the circle \(\R/\Z\). Squashing the spring flat is the projection \(q\colon\R\to\R/\Z\).`
	);
</script>

<div class="hx">
	<Scene3D
		{setup}
		height={460}
		controls={{ autoRotate: true, autoRotateSpeed: 0.45, minPolarAngle: 0.35, maxPolarAngle: 1.75 }}
		camera={{ position: [0, 1.6, 8.1], target: [0, -0.3, 0] }}
		animate
		label="A helix wound around a glass cylinder; points of the same class lie on one vertical line above a circle on the floor"
	/>
	<p class="readout" aria-live="polite">{@html renderMathInText(caption)}</p>
	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'int', label: 'ℤ → ℤ/n' },
				{ value: 'real', label: 'ℝ → ℝ/ℤ' }
			]}
			label="Which quotient"
		/>
		{#if mode === 'int'}
			<Stepper bind:value={n} min={2} max={12} label="n (points per turn)" />
		{:else}
			<div class="sl"><Slider bind:value={tval} min={-0.5} max={0.5} step={0.01} label="t" /></div>
		{/if}
		<Button variant="gold" onclick={toggleDrop}>{dropped ? 'Lift the helix back up' : 'Project: drop everything to the floor'}</Button>
	</Controls>
</div>

<style>
	.readout {
		margin: 0.2rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
	.sl {
		flex: 1 1 11rem;
	}
</style>
