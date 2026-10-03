<script lang="ts">
	// Figure: a geodesic triangle on a sphere. Its sides are arcs of great
	// circles (the straightest possible paths on the sphere); drag its corners.
	// The angles add up to more than 180°, and the excess equals the area
	// divided by R² — the total curvature enclosed.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, glowTube } from '$lib/three/materials';
	import { sphere as sphereFn, surfaceGeometry } from '$lib/three/surfaces';
	import type * as THREE_NS from 'three';
	import { fromAngles, slerp, sphericalAngle, sphericalArea, type V3 } from './geometry';

	const R = 1.5;
	type Preset = 'octant' | 'small' | 'large';
	const presets: Record<Preset, V3[]> = {
		octant: [
			[1, 0, 0],
			[0, 0, 1],
			[0, 1, 0]
		],
		small: [fromAngles(0.35, 0.45), fromAngles(0.75, 0.38), fromAngles(0.52, 0.75)],
		large: [fromAngles(-0.4, -0.15), fromAngles(1.9, -0.1), fromAngles(0.75, 1.25)]
	};
	let preset = $state<Preset>('octant');
	let pts = $state<V3[]>(presets.octant.map((p) => [...p] as V3));

	const ang = $derived([sphericalAngle(pts[0], pts[1], pts[2]), sphericalAngle(pts[1], pts[2], pts[0]), sphericalAngle(pts[2], pts[0], pts[1])]);
	const sum = $derived(ang[0] + ang[1] + ang[2]);
	const area = $derived(sphericalArea(pts[0], pts[1], pts[2]));
	const deg = (r: number) => (r * 180) / Math.PI;

	let api: { update(): void } | null = null;

	function setup({ scene, THREE, invalidate, canvas, controls, pick, label }: SceneContext) {
		const ball = glassMesh(surfaceGeometry(sphereFn(R), 128, 64), { opacity: 0.5, grid: [24, 12], gridStrength: 0.22, tint: 'blue', tintMix: 0.35 });
		scene.add(ball);
		const pickBall = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 32), new THREE.MeshBasicMaterial({ visible: false }));
		scene.add(pickBall);

		const dyn = new THREE.Group();
		scene.add(dyn);
		const beads = [0, 1, 2].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'gold', size: 0.07, halo: 9 });
			scene.add(g);
			return g;
		});
		const names = ['α', 'β', 'γ'];
		const labels = [0, 1, 2].map((k) => label([0, 0, 0], '', { className: 'teal' }));
		const fillMat = new THREE.MeshBasicMaterial({ color: 0xf2d08f, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });

		const v = (p: V3, s = 1) => new THREE.Vector3(p[0] * R * s, p[1] * R * s, p[2] * R * s);
		function rebuild() {
			for (const c of [...dyn.children]) {
				dyn.remove(c);
				c.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					if (m.geometry) m.geometry.dispose();
					if (m.material && m.material !== fillMat) (m.material as THREE_NS.Material).dispose();
				});
			}
			const [A, B, C] = pts;
			// sides: great-circle arcs
			for (const [P, Q] of [
				[A, B],
				[B, C],
				[C, A]
			]) {
				const arc = Array.from({ length: 49 }, (_, i) => v(slerp(P, Q, i / 48), 1.004));
				dyn.add(glowTube(new THREE.CatmullRomCurve3(arc), { color: 'gold', radius: 0.018, segments: 64 }));
			}
			// the filled triangle
			const N = 28;
			const positions: number[] = [];
			const index: number[] = [];
			const id = (i: number, j: number) => (i * (2 * N + 3 - i)) / 2 + j;
			for (let i = 0; i <= N; i++)
				for (let j = 0; j <= N - i; j++) {
					const a = i / N;
					const b = j / N;
					const c = 1 - a - b;
					const p: V3 = [a * A[0] + b * B[0] + c * C[0], a * A[1] + b * B[1] + c * C[1], a * A[2] + b * B[2] + c * C[2]];
					const l = Math.hypot(...p) || 1;
					positions.push((p[0] / l) * R * 1.002, (p[1] / l) * R * 1.002, (p[2] / l) * R * 1.002);
				}
			for (let i = 0; i < N; i++)
				for (let j = 0; j < N - i; j++) {
					index.push(id(i, j), id(i + 1, j), id(i, j + 1));
					if (j < N - i - 1) index.push(id(i + 1, j), id(i + 1, j + 1), id(i, j + 1));
				}
			const g = new THREE.BufferGeometry();
			g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
			g.setIndex(index);
			const fill = new THREE.Mesh(g, fillMat);
			fill.renderOrder = 3;
			dyn.add(fill);
			// angle arcs at the corners
			const corners: [V3, V3, V3][] = [
				[A, B, C],
				[B, C, A],
				[C, A, B]
			];
			corners.forEach(([P, Q, S], k) => {
				const p = new THREE.Vector3(...P);
				const tq = new THREE.Vector3(...Q).sub(p.clone().multiplyScalar(p.dot(new THREE.Vector3(...Q)))).normalize();
				const ts = new THREE.Vector3(...S).sub(p.clone().multiplyScalar(p.dot(new THREE.Vector3(...S)))).normalize();
				const theta = Math.acos(Math.max(-1, Math.min(1, tq.dot(ts))));
				const axis = new THREE.Vector3().crossVectors(tq, ts).normalize();
				const r = 0.2;
				const arc: THREE_NS.Vector3[] = [];
				for (let i = 0; i <= 24; i++) {
					const d = tq.clone().applyAxisAngle(axis, (theta * i) / 24);
					arc.push(p.clone().multiplyScalar(R * 1.006).add(d.multiplyScalar(r)));
				}
				dyn.add(glowTube(new THREE.CatmullRomCurve3(arc), { color: 'teal', radius: 0.012, segments: 32, halo: false, intensity: 1.2 }));
				const mid = tq.clone().add(ts).normalize();
				const lp = p.clone().multiplyScalar(R * 1.01).add(mid.multiplyScalar(0.6));
				labels[k].position.copy(lp);
				labels[k].normal = p.clone();
				labels[k].set(`${names[k]} = ${deg(theta).toFixed(0)}°`);
			});
			beads.forEach((b, k) => b.position.copy(v(pts[k], 1.006)));
			invalidate();
		}
		api = { update: rebuild };
		rebuild();

		// drag the corners
		let dragging = -1;
		const beadMeshes = beads.map((b) => b.children);
		const onDown = (e: PointerEvent) => {
			const hits = pick(e, beadMeshes.flat());
			if (!hits.length) return;
			const obj = hits[0].object;
			dragging = beads.findIndex((b) => b.children.includes(obj as never));
			if (dragging < 0) return;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			e.preventDefault();
		};
		const onMove = (e: PointerEvent) => {
			if (dragging < 0) return;
			const hit = pick(e, [pickBall])[0];
			if (!hit) return;
			const p = hit.point.clone().normalize();
			const next = pts.map((q) => [...q] as V3);
			next[dragging] = [p.x, p.y, p.z];
			// keep the triangle from collapsing
			const others = next.filter((_, i) => i !== dragging);
			if (others.every((o) => Math.hypot(o[0] - p.x, o[1] - p.y, o[2] - p.z) > 0.12)) pts = next;
		};
		const onUp = (e: PointerEvent) => {
			if (dragging < 0) return;
			dragging = -1;
			if (controls) controls.enabled = true;
			canvas.releasePointerCapture?.(e.pointerId);
		};
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		return {
			dispose() {
				api = null;
				fillMat.dispose();
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
			}
		};
	}

	$effect(() => {
		void pts;
		api?.update();
	});
	function load(p: Preset) {
		preset = p;
		pts = presets[p].map((q) => [...q] as V3);
	}
</script>

<Scene3D
	{setup}
	height={440}
	camera={{ position: [3.3, 2.6, 3.3], target: [0, 0.1, 0], fov: 40 }}
	controls={{ autoRotate: false }}
	label="A triangle on a sphere whose sides are arcs of great circles. Its three angles are shown; they add up to more than 180 degrees, by exactly the area of the triangle divided by the square of the radius."
/>

<div class="readout ui" aria-live="polite">
	<div class="row">
		<TeX tex={`\\alpha + \\beta + \\gamma = ${deg(ang[0]).toFixed(1)}^\\circ + ${deg(ang[1]).toFixed(1)}^\\circ + ${deg(ang[2]).toFixed(1)}^\\circ = ${deg(sum).toFixed(1)}^\\circ`} />
	</div>
	<div class="row">
		<span class="k">excess</span>
		<TeX tex={`\\alpha+\\beta+\\gamma-\\pi = ${(sum - Math.PI).toFixed(3)}`} />
		<span class="k">area ÷ R²</span>
		<TeX tex={`\\text{area}/R^2 = \\iint_T K\\,dA = ${area.toFixed(3)}`} />
	</div>
	<div class="note">
		The triangle covers {((100 * area) / (4 * Math.PI)).toFixed(1)}% of the sphere. Drag a corner: the two numbers move together,
		always equal.
	</div>
</div>

<Controls>
	<Segmented
		bind:value={preset}
		options={[
			{ value: 'octant', label: 'Three right angles' },
			{ value: 'small', label: 'Small' },
			{ value: 'large', label: 'Large' }
		]}
		label="Triangle"
		onchange={(v) => load(v)}
	/>
	<span class="hint ui">Drag a gold corner to move it · drag elsewhere to turn the sphere</span>
</Controls>

<style>
	.readout {
		display: grid;
		gap: 0.35rem;
		padding: 0.5rem 1.2rem 0.7rem;
		font-size: 0.84rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.9rem;
		color: var(--ink-bright);
	}
	.k {
		color: var(--ink-dim);
	}
	.note {
		color: var(--ink-dim);
	}
	.hint {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}
</style>
