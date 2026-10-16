<script lang="ts">
	// A first look at Betti numbers: a point, a circle, a sphere and a torus,
	// with their holes of each dimension lit up on demand. Dragging turns all
	// four shapes in place (sideways only on touch screens, so the page still scrolls).
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { glassMesh, glowPoint, glowTube, setGlowColor, dotTexture, shaderColor } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry, SurfaceCurve, loopPath } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { isNarrow } from '$lib/figures/homology/invariance/three-fit';
	import { onMount } from 'svelte';

	// on phones the four shapes sit in a 2 × 2 grid instead of one row
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});

	type Mode = 'b0' | 'b1' | 'b2';
	let mode = $state<Mode>('b1');

	const shapes = [
		{ name: 'point', b: [1, 0, 0] },
		{ name: 'circle', b: [1, 1, 0] },
		{ name: 'sphere', b: [1, 0, 1] },
		{ name: 'torus', b: [1, 2, 1] }
	];

	let api: { set(m: Mode): void } | null = null;

	function setup({ THREE, scene, label, invalidate, canvas }: SceneContext) {
		const X = narrow ? [-1.5, 1.5, -1.5, 1.5] : [-5.1, -1.75, 1.7, 5.15];
		const Y = narrow ? [3.25, 3.25, -1.55, -1.55] : [0, 0, 0, 0];

		// each shape turns about its own centre when the reader drags
		const pivots = X.map((x, i) => {
			const g = new THREE.Group();
			g.position.set(x, Y[i], 0);
			scene.add(g);
			return g;
		});

		// point
		const pt = glowPoint([X[0], Y[0], 0], { color: 'ivory', size: 0.09, halo: 8 });
		scene.add(pt);

		// circle
		const circleCurve = new THREE.EllipseCurve(0, 0, 1.15, 1.15, 0, Math.PI * 2, false, 0);
		const c3 = new THREE.CatmullRomCurve3(
			circleCurve.getPoints(96).map((p) => new THREE.Vector3(p.x, p.y * 0.42, p.y * 0.9)),
			true
		);
		const circle = glowTube(c3, { color: 'blue', radius: 0.035, closed: true, segments: 160, intensity: 0.8 });
		pivots[1].add(circle);

		// sphere
		const sph = glassMesh(surfaceGeometry(sphere(1.2), 96, 64), { opacity: 0.78, grid: [28, 14], gridStrength: 0.18 });
		pivots[2].add(sph);
		const sphGlow = new THREE.Sprite(
			new THREE.SpriteMaterial({ map: dotTexture(), color: 0xf28db6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })
		);
		sphGlow.scale.set(2.6, 2.6, 1);
		pivots[2].add(sphGlow);

		// torus with its two loops and an inner glow for its cavity
		const tf = torus(1.05, 0.42);
		const tor = glassMesh(surfaceGeometry(tf, 140, 60), { opacity: 0.8, grid: [40, 16], gridStrength: 0.18, hue: 0.5 });
		const torGroup = new THREE.Group();
		torGroup.rotation.x = 1.05;
		torGroup.add(tor);
		const longi = glowTube(new SurfaceCurve(tf, loopPath(1, 0, 0, 0.25), 0.02), { color: 'gold', radius: 0.03, closed: true, segments: 220 });
		const meri = glowTube(new SurfaceCurve(tf, loopPath(0, 1, 0.12, 0), 0.02), { color: 'gold', radius: 0.03, closed: true, segments: 120 });
		torGroup.add(longi, meri);
		const cavity = new THREE.Mesh(
			surfaceGeometry(torus(1.05, 0.26), 100, 40),
			new THREE.MeshBasicMaterial({ color: 0xf28db6, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })
		);
		torGroup.add(cavity);
		pivots[3].add(torGroup);

		// drag to turn: sideways spins every shape, up and down tilts it
		let yaw = 0;
		let pitch = 0;
		let drag: { id: number; x: number; y: number } | null = null;
		const turn = () => {
			for (const g of pivots) g.rotation.set(pitch, yaw, 0);
			invalidate();
		};
		canvas.style.cursor = 'grab';
		canvas.style.touchAction = 'pan-y';
		const down = (e: PointerEvent) => {
			drag = { id: e.pointerId, x: e.clientX, y: e.clientY };
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
		};
		const move = (e: PointerEvent) => {
			if (!drag || e.pointerId !== drag.id) return;
			yaw += (e.clientX - drag.x) * 0.012;
			if (e.pointerType !== 'touch') pitch = Math.max(-1.2, Math.min(1.2, pitch + (e.clientY - drag.y) * 0.012));
			drag.x = e.clientX;
			drag.y = e.clientY;
			turn();
		};
		const up = (e: PointerEvent) => {
			if (!drag || e.pointerId !== drag.id) return;
			drag = null;
			canvas.style.cursor = 'grab';
		};
		const reset = () => {
			yaw = pitch = 0;
			turn();
		};
		canvas.addEventListener('pointerdown', down);
		canvas.addEventListener('pointermove', move);
		canvas.addEventListener('pointerup', up);
		canvas.addEventListener('pointercancel', up);
		canvas.addEventListener('dblclick', reset);

		// labels: name + Betti numbers
		const nameLabels = shapes.map((s, i) => label([X[i], Y[i] - 1.95, 0], s.name, { className: 'tag small' }));
		const bettiLabels: LabelHandle[] = shapes.map((s, i) => label([X[i], Y[i] - 2.55, 0], '', { className: 'small' }));

		const set = (m: Mode) => {
			const k = m === 'b0' ? 0 : m === 'b1' ? 1 : 2;
			shapes.forEach((s, i) => {
				const parts = [0, 1, 2].map((j) => {
					const t = `b_${j}=${s.b[j]}`;
					return j === k ? `\\htmlClass{tx-gold}{${t}}` : `\\htmlClass{tx-dim}{${t}}`;
				});
				bettiLabels[i].set(tex(parts.join('\\;\\;')));
			});
			// 0-dimensional: every shape is one piece
			pt.scale.setScalar(k === 0 ? 1.6 : 1);
			setGlowColor(circle, k === 1 ? 'gold' : k === 0 ? 'ivory' : 'blue', k === 1 ? 1.3 : 0.8);
			longi.visible = meri.visible = k === 1;
			sphGlow.material.opacity = k === 2 ? 0.55 : 0;
			cavity.material.opacity = k === 2 ? 0.28 : 0;
			for (const m2 of [...(sph.userData.materials ?? []), ...(tor.userData.materials ?? [])]) {
				m2.uniforms.uTintMix.value = k === 0 ? 0.35 : 0;
				m2.uniforms.uTint.value.copy(shaderColor('gold'));
			}
			nameLabels.forEach((l) => l.el.classList.toggle('gold', k === 0));
			invalidate();
		};
		set(mode);
		api = { set };
		return {
			update(t: number) {
				sph.rotation.y = t * 0.15;
				torGroup.rotation.z = t * 0.12;
			},
			dispose: () => {
				api = null;
				canvas.removeEventListener('pointerdown', down);
				canvas.removeEventListener('pointermove', move);
				canvas.removeEventListener('pointerup', up);
				canvas.removeEventListener('pointercancel', up);
				canvas.removeEventListener('dblclick', reset);
			}
		};
	}

	$effect(() => {
		const v = mode; // read first, so the effect tracks it even before the scene exists
		api?.set(v);
	});

	const captions: Record<Mode, string> = {
		b0: 'Each shape is a single connected piece, so each has exactly one “0-dimensional hole”: b₀ = 1.',
		b1: 'The circle has one loop that encloses nothing; the torus has two independent ones — around the hole and around the tube.',
		b2: 'The sphere and the torus each enclose a hollow cavity — a 2-dimensional hole. The point and the circle enclose nothing.'
	};
</script>

<Scene3D
	{setup}
	height={narrow ? 520 : 360}
	camera={narrow ? { position: [0, 0.5, 15], fov: 36 } : { position: [0, 0.5, 10.6], fov: 36 }}
	controls={false}
	label="A point, a circle, a sphere and a torus, with their holes of each dimension highlighted"
/>
<Controls align="between">
	<Segmented
		bind:value={mode}
		options={[
			{ value: 'b0', label: 'pieces (b₀)' },
			{ value: 'b1', label: 'loops (b₁)' },
			{ value: 'b2', label: 'cavities (b₂)' }
		]}
		label="Which kind of hole to show"
	/>
	<span class="cap">{captions[mode]}</span>
</Controls>

<style>
	.cap {
		font-family: var(--font-body);
		font-size: 0.9rem;
		color: var(--ink-dim);
		flex: 1 1 18rem;
		line-height: 1.45;
	}
</style>
