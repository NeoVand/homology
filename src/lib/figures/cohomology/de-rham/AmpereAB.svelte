<script lang="ts">
	// Figure (3D): two physical faces of dθ in space.
	//  • Ampère: around a straight wire the magnetic field circles the wire; it
	//    has no curl outside the wire, yet ∮B·dl = μ₀I × (times the loop links it).
	//  • Aharonov–Bohm: outside a long solenoid B = 0, but the vector potential
	//    A = (Φ/2π) dθ is closed and not exact; an electron going round picks up
	//    the phase (q/ħ)Φ × (times it goes round), although it never meets B.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import type { Object3D } from 'three';
	import { disposeTree, glassMesh, glowPoint, glowTube } from '$lib/three/materials';
	import { cylinder, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { mulberry } from '$lib/figures/cohomology/differential-forms/flow';
	import { TAU } from './derham';

	type Mode = 'wire' | 'solenoid';
	type Loop = 'once' | 'twice' | 'beside';
	let mode = $state<Mode>('wire');
	let loop = $state<Loop>('once');
	let innerWidth = $state(1000);

	const links: Record<Loop, number> = { once: 1, twice: 2, beside: 0 };
	const lk = $derived(links[loop]);

	/** the loop, t ∈ [0,1] → (x, y, z) with y up */
	function loopPoint(kind: Loop, t: number): [number, number, number] {
		const a = TAU * t;
		if (kind === 'once') {
			const x = 1.35 * Math.cos(a);
			const z = 1.05 * Math.sin(a);
			return [x, 0.15 + 0.45 * Math.sin(a + 0.6), z];
		}
		if (kind === 'twice') {
			const r = 1.25 + 0.28 * Math.cos(a);
			const ph = 2 * a;
			return [r * Math.cos(ph), 0.1 + 0.55 * Math.sin(a), r * Math.sin(ph)];
		}
		return [2.0 + 0.55 * Math.cos(a), 0.2 + 0.3 * Math.sin(a), 0.55 * Math.sin(a)];
	}

	let api: { set(m: Mode, l: Loop): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, label, invalidate, reducedMotion } = ctx;
		const rand = mulberry(17);
		const Y0 = -2.3;
		const Y1 = 2.3;

		// ── the wire ──
		const wire = new THREE.Group();
		wire.add(glowTube(new THREE.LineCurve3(new THREE.Vector3(0, Y0, 0), new THREE.Vector3(0, Y1, 0)), { color: 'ivory', radius: 0.035, segments: 8 }));
		const cone = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.22, 18), new THREE.MeshBasicMaterial({ color: 0xfff1d0 }));
		cone.position.set(0, 1.6, 0);
		wire.add(cone);
		scene.add(wire);
		const lblI = label([0.22, 1.85, 0], tex('I'), { className: 'gold' });

		// static field rings around the wire
		const rings = new THREE.Group();
		for (const [y, r] of [
			[-1.3, 0.55],
			[-1.3, 1.1],
			[0.95, 0.75],
			[0.95, 1.6],
			[-0.2, 2.1]
		]) {
			rings.add(glowTube(ringCurve(THREE, r, y), { color: 'teal', radius: 0.008, closed: true, segments: 120, intensity: 0.55 }));
		}
		scene.add(rings);
		const lblB = label([1.62, 1.18, 0.0], tex('\\mathbf B'), { className: 'teal' });

		// ── the solenoid ──
		const sol = new THREE.Group();
		sol.add(glassMesh(surfaceGeometry(cylinder(0.45, Y1 - Y0), 64, 8), { opacity: 0.35, grid: [16, 0], tint: 'blue', tintMix: 0.3 }));
		for (let k = 0; k < 22; k++) {
			const y = Y0 + 0.15 + ((Y1 - Y0 - 0.3) * k) / 21;
			sol.add(glowTube(ringCurve(THREE, 0.47, y), { color: 'gold', radius: 0.012, closed: true, segments: 60, halo: false, intensity: 0.8 }));
		}
		scene.add(sol);
		const lblIn = label([0.95, 1.95, 0], tex('\\mathbf B \\ne 0 \\text{ inside}'), { className: 'teal small' });
		const lblOut = label([1.75, -1.75, 0], tex('\\mathbf B = 0,\\ \\mathbf A = \\tfrac{\\Phi}{2\\pi}\\,d\\theta'), { className: 'violet small' });

		// ── particles: B around the wire, or B inside / A outside the solenoid ──
		const N = reducedMotion ? 0 : 420;
		const K = 6;
		const seeds = Array.from({ length: N }, () => ({
			y: Y0 + 0.2 + (Y1 - Y0 - 0.4) * rand(),
			r: 0.3 + 2.1 * Math.sqrt(rand()),
			a: TAU * rand(),
			rin: 0.38 * Math.sqrt(rand())
		}));
		const pos = new Float32Array(N * (K - 1) * 2 * 3);
		const col = new Float32Array(N * (K - 1) * 2 * 3);
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
		const streaks = new THREE.LineSegments(
			geo,
			new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
		);
		scene.add(streaks);

		let current: Mode = 'wire';
		function writeParticles(t: number) {
			let li = 0;
			const teal = [0.37, 0.84, 0.81];
			const violet = [0.64, 0.58, 1.0];
			for (let i = 0; i < N; i++) {
				const s = seeds[i];
				const inside = current === 'solenoid' && i % 3 === 0;
				for (let k = 0; k < K - 1; k++) {
					for (const kk of [k, k + 1]) {
						const tt = t - kk * 0.06;
						let x: number, y: number, z: number;
						if (inside) {
							// B inside the solenoid: straight up, wrapping around
							const span = Y1 - Y0;
							y = Y0 + ((((s.y - Y0 + tt * 0.9) % span) + span) % span);
							x = s.rin * Math.cos(s.a);
							z = s.rin * Math.sin(s.a);
						} else {
							// circulation with angular speed ∝ 1/r² (field strength ∝ 1/r)
							const w = current === 'wire' ? 1.1 / (s.r * s.r) : 0.55 / (s.r * s.r);
							const a = s.a + tt * w;
							const rr = current === 'solenoid' ? Math.max(0.62, s.r) : s.r;
							x = rr * Math.cos(a);
							y = s.y;
							z = -rr * Math.sin(a);
						}
						pos[3 * li] = x;
						pos[3 * li + 1] = y;
						pos[3 * li + 2] = z;
						const f = (1 - kk / (K - 1)) * 0.8;
						const c = current === 'wire' || inside ? teal : violet;
						col[3 * li] = c[0] * f;
						col[3 * li + 1] = c[1] * f;
						col[3 * li + 2] = c[2] * f;
						li++;
					}
				}
			}
			geo.attributes.position.needsUpdate = true;
			geo.attributes.color.needsUpdate = true;
		}

		let loopObj: Object3D | null = null;
		const bead = glowPoint([0, 0, 0], { color: 'gold', size: 0.06, halo: 10 });
		scene.add(bead);
		let loopKind: Loop = 'once';
		function setLoop(l: Loop) {
			loopKind = l;
			if (loopObj) {
				scene.remove(loopObj);
				disposeTree(loopObj);
			}
			const curve = new THREE.CatmullRomCurve3(
				Array.from({ length: 160 }, (_, i) => new THREE.Vector3(...loopPoint(l, i / 160))),
				true
			);
			loopObj = glowTube(curve, { color: 'gold', radius: 0.03, closed: true, segments: 400 });
			scene.add(loopObj);
		}

		api = {
			set(m, l) {
				current = m;
				wire.visible = m === 'wire';
				rings.visible = m === 'wire';
				sol.visible = m === 'solenoid';
				lblI.show(m === 'wire');
				lblB.show(m === 'wire');
				lblIn.show(m === 'solenoid');
				lblOut.show(m === 'solenoid');
				if (l !== loopKind || !loopObj) setLoop(l);
				writeParticles(0);
				bead.position.set(...loopPoint(l, 0.15));
				invalidate();
			}
		};
		api.set(mode, loop);

		if (reducedMotion) return { dispose: () => (api = null) };
		return {
			update(t: number) {
				writeParticles(t);
				bead.position.set(...loopPoint(loopKind, (t / 7) % 1));
			},
			dispose: () => (api = null)
		};
	}

	function ringCurve(THREE: typeof import('three'), r: number, y: number) {
		return new THREE.CatmullRomCurve3(
			Array.from({ length: 64 }, (_, i) => new THREE.Vector3(r * Math.cos((TAU * i) / 64), y, -r * Math.sin((TAU * i) / 64))),
			true
		);
	}

	$effect(() => {
		// read the state first: `api?.` would short-circuit and skip subscribing
		const m = mode;
		const l = loop;
		api?.set(m, l);
	});
</script>

<svelte:window bind:innerWidth />

<div class="ampere">
	<Scene3D
		{setup}
		height={innerWidth < 640 ? 400 : 480}
		camera={{ position: [3.7, 4.0, 5.1], target: [0.35, -0.15, 0], fov: 40 }}
		controls={{ autoRotate: false, minPolarAngle: 0.3, maxPolarAngle: 2.5 }}
		label="A straight wire with circular magnetic field lines (or a solenoid with its field trapped inside), and a gold loop that may or may not go around it."
	/>
	<Controls>
		<Segmented
			bind:value={mode}
			label="Physics"
			options={[
				{ value: 'wire', label: 'Wire (Ampère)' },
				{ value: 'solenoid', label: 'Solenoid (Aharonov–Bohm)' }
			]}
		/>
		<Segmented
			bind:value={loop}
			label="Loop"
			options={[
				{ value: 'once', label: 'Around once' },
				{ value: 'twice', label: 'Around twice' },
				{ value: 'beside', label: 'Beside' }
			]}
		/>
	</Controls>
	<div class="readout">
		{#if mode === 'wire'}
			<TeX tex={String.raw`\oint_\gamma \mathbf B\cdot d\mathbf l \;=\; \mu_0 I \times ${lk} ${lk === 0 ? '= 0' : lk === 1 ? '= \\mu_0 I' : '= 2\\mu_0 I'}`} />
			<p class="note">Outside the wire the field has no curl at all, yet a loop around the wire collects μ₀I each time round: the field is closed but not exact.</p>
		{:else}
			<TeX tex={String.raw`\text{phase} = \frac{q}{\hbar}\oint_\gamma \mathbf A\cdot d\mathbf l \;=\; \frac{q}{\hbar}\,\Phi \times ${lk}`} />
			<p class="note">The electron’s path never enters the solenoid, where the magnetic field lives; outside, B = 0. Still, the potential A is not exact there, and the interference pattern shifts by an amount set by how many times the path winds round.</p>
		{/if}
	</div>
</div>

<style>
	.readout {
		padding: 0.8rem 1.2rem 0.4rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1.05rem;
		text-align: center;
		overflow-x: auto;
	}
	.note {
		margin: 0.4rem auto 0.4rem;
		max-width: 40rem;
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
</style>
