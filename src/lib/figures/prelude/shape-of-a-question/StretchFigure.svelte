<script lang="ts">
	// Stretch and squeeze a sphere and a torus as much as you like: their
	// geometry changes completely, but the number of tunnels and cavities never
	// does. The shapes knead themselves; press and hold on one to pull its
	// surface out under the pointer. All of it runs in the vertex shader, so
	// nothing is re-uploaded to the GPU while it moves.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glassMesh } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { PauseIcon, PlayIcon } from '$lib/icons';
	import type * as THREE_NS from 'three';
	import { fitCamera } from '$lib/figures/homology/invariance/three-fit';

	const AMOUNT = 0.55;
	let kneading = $state(true);
	let api: { wake(): void } | null = null;
	$effect(() => {
		void kneading;
		api?.wake();
	});

	function setup(ctx: SceneContext) {
		const { THREE, scene, label, onFrame, canvas, controls, pick, reducedMotion } = ctx;
		// on narrow canvases pull the camera back so both shapes and their labels stay in frame
		const unfit = fitCamera(ctx, 1.9, 0.7);
		const s = glassMesh(surfaceGeometry(sphere(1.35), 96, 64), { opacity: 0.9, grid: [36, 18], gridStrength: 0.2, hue: 0.05, wobble: true });
		const t = glassMesh(surfaceGeometry(torus(1.35, 0.55), 128, 56), { opacity: 0.9, grid: [48, 18], gridStrength: 0.2, hue: 0.55, wobble: true });
		s.position.set(-2.35, 0, 0);
		t.position.set(2.35, 0, 0);
		t.rotation.x = 0.95;
		scene.add(s, t);
		label([-2.35, -2.05, 0], `<span class="tag">sphere</span>`, { className: 'tag small' });
		label([2.35, -2.05, 0], `<span class="tag">torus</span>`, { className: 'tag small' });
		label([-2.35, 2.05, 0], tex('\\text{tunnels } 0 \\quad \\text{cavities } 1'), { className: 'small gold' });
		label([2.35, 2.05, 0], tex('\\text{tunnels } 1 \\quad \\text{cavities } 1'), { className: 'small gold' });

		type Shape = { g: THREE_NS.Group; m: THREE_NS.ShaderMaterial; amp: number; max: number };
		const shapes: Shape[] = [
			{ g: s, m: (s.userData.materials as THREE_NS.ShaderMaterial[])[0], amp: 0, max: 0.7 },
			{ g: t, m: (t.userData.materials as THREE_NS.ShaderMaterial[])[0], amp: 0, max: 0.42 }
		];
		shapes[0].m.uniforms.uPokeR.value = 0.55;
		shapes[1].m.uniforms.uPokeR.value = 0.42;
		shapes[0].m.uniforms.uWobble.value = AMOUNT * 0.85;
		shapes[1].m.uniforms.uWobble.value = AMOUNT * 0.55;
		// the visible mesh of each glass group, for picking
		const target = (sh: Shape) => sh.g.children[1];

		// ── press and hold on a shape to pull it out under the pointer ──
		let held: Shape | null = null;
		let controlsWere = true;
		const local = new THREE.Vector3();
		const aim = (e: PointerEvent, among: Shape[]) => {
			const hit = pick(e, among.map(target))[0];
			if (!hit) return null;
			const sh = among.find((x) => target(x) === hit.object) ?? null;
			if (sh) sh.m.uniforms.uPoke.value.copy(sh.g.worldToLocal(local.copy(hit.point)));
			return sh;
		};
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			const sh = aim(e, shapes);
			if (!sh) return;
			held = sh;
			wake();
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
		};
		const onMove = (e: PointerEvent) => {
			if (held) aim(e, [held]);
			else if (e.pointerType === 'mouse') canvas.style.cursor = pick(e, shapes.map(target)).length ? 'grab' : '';
		};
		const onUp = () => {
			if (!held) return;
			held = null;
			if (controls) controls.enabled = controlsWere;
			canvas.style.cursor = '';
		};
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);

		// render every frame only while something moves
		let time = 0;
		let off: (() => void) | null = null;
		const frame = (_: number, dt: number) => {
			const moving = kneading && !reducedMotion;
			if (moving) {
				time += dt * 0.6;
				s.rotation.y += dt * 0.12;
				t.rotation.z += dt * 0.1;
			}
			let settled = true;
			for (const sh of shapes) {
				sh.amp += ((held === sh ? sh.max : 0) - sh.amp) * (1 - Math.exp(-dt * 7));
				if (held === sh || sh.amp > 1e-3) settled = false;
				else sh.amp = 0;
				sh.m.uniforms.uPokeAmp.value = sh.amp;
				sh.m.uniforms.uWobbleT.value = time;
			}
			if (!moving && settled) {
				off?.();
				off = null;
			}
		};
		function wake() {
			if (!off) off = onFrame(frame);
		}
		wake();
		api = { wake };

		return {
			dispose() {
				unfit();
				off?.();
				api = null;
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
			}
		};
	}
</script>

<Scene3D
	{setup}
	height={380}
	camera={{ position: [0, 0.6, 9.2], fov: 38 }}
	controls={{ autoRotate: false }}
	label="A sphere and a torus being stretched and squeezed into lumpy shapes; the sphere never gains a tunnel and the torus never loses its tunnel"
/>
<Controls>
	<Button icon={kneading ? PauseIcon : PlayIcon} onclick={() => (kneading = !kneading)}>{kneading ? 'Pause the kneading' : 'Knead again'}</Button>
	<span class="tip ui">Press and hold on a shape to pull it out</span>
</Controls>

<style>
	.tip {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
</style>
