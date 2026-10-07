<script lang="ts">
	// Pull loops tight: on the sphere a wiggly loop slides over the top and
	// shrinks to a point; on the torus the loop round the tube and the loop
	// round the hole tighten to clean circles and then get stuck.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowPoint } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { PauseIcon, PlayIcon, ResetIcon } from '$lib/icons';
	import { DynTube } from './dynTube';
	import { glass } from './glass';

	let s = $state(0);
	let playing = $state(false);
	let raf = 0;
	let api: { set(s: number): void } | null = null;

	const smooth = (x: number) => x * x * (3 - 2 * x);

	function setup(ctx: SceneContext) {
		const { scene, THREE, container } = ctx;
		const narrow = container.clientWidth < 620;
		// a tighter depth range than Scene3D's default keeps curves that sit just
		// above a surface in front of it, even with a 16-bit depth buffer
		ctx.camera.near = 0.5;
		ctx.camera.far = 60;
		ctx.camera.updateProjectionMatrix();
		const SR = 1.3;
		const fS = sphere(SR);
		const fT = torus(1.2, 0.5);
		// narrow plates stack the sphere above the torus (in a taller canvas), with room
		// for the sphere's label between them and the torus's label clear of the corner buttons
		const sphereAt = narrow ? new THREE.Vector3(0, 1.95, 0) : new THREE.Vector3(-2.35, 0, 0);
		const torusAt = narrow ? new THREE.Vector3(0, -1.75, 0) : new THREE.Vector3(2.35, 0, 0);
		if (narrow) {
			ctx.camera.position.set(0, 1.0, 10.8);
			ctx.camera.lookAt(0, 0, 0);
		}

		const gS = new THREE.Group();
		gS.position.copy(sphereAt);
		const gT = new THREE.Group();
		gT.position.copy(torusAt);
		gT.rotation.x = 0.72;
		gS.rotation.x = 0.42;
		scene.add(gS, gT);
		gS.add(glass(surfaceGeometry(fS, 96, 48), { opacity: 0.8, grid: [24, 12], gridStrength: 0.3 }));
		gT.add(glass(surfaceGeometry(fT, 128, 48), { opacity: 0.8, grid: [36, 14], gridStrength: 0.3 }));

		const N = 240;
		const loopS = new DynTube(N, { color: 'gold', closed: true, radius: 0.032 });
		const pole = glowPoint([0, SR + 0.02, 0], { color: 'gold', size: 0.075 });
		gS.add(loopS.group, pole);
		const loopA = new DynTube(N, { color: 'gold', closed: true, radius: 0.03 });
		const loopB = new DynTube(N, { color: 'teal', closed: true, radius: 0.03 });
		gT.add(loopA.group, loopB.group);

		const lblS = ctx.label(sphereAt.clone().add(new THREE.Vector3(0, -SR - (narrow ? 0.45 : 0.55), 0)), '', { className: 'small' });
		const lblT = ctx.label(torusAt.clone().add(new THREE.Vector3(narrow ? -0.9 : 0, -SR - (narrow ? 0.65 : 0.55), 0)), '', { className: 'small' });
		const p = new THREE.Vector3();
		const n = new THREE.Vector3();
		const TAU = Math.PI * 2;

		function fill(tube: DynTube, f: typeof fS, path: (x: number) => [number, number], lift: number) {
			for (let i = 0; i < N; i++) {
				const [u, v] = path(i / N);
				const uu = ((u % 1) + 1) % 1;
				const vv = Math.min(0.9999, Math.max(0.0001, ((v % 1) + 1) % 1));
				f(uu, vv, p);
				surfaceNormal(f, uu, vv, n);
				p.addScaledVector(n, lift);
				tube.points[i * 3] = p.x;
				tube.points[i * 3 + 1] = p.y;
				tube.points[i * 3 + 2] = p.z;
				tube.refs[i * 3] = n.x;
				tube.refs[i * 3 + 1] = n.y;
				tube.refs[i * 3 + 2] = n.z;
			}
			tube.update(true);
		}

		api = {
			set(sv) {
				const k = smooth(Math.min(1, sv));
				// sphere: colatitude from just below the equator to the pole
				const vc = 0.6 * (1 - k);
				const amp = Math.min(0.075 * (1 - k), 0.45 * vc);
				const shrunk = vc < 0.012;
				loopS.visible = !shrunk;
				pole.visible = shrunk || vc < 0.05;
				if (!shrunk)
					fill(
						loopS,
						fS,
						(x) => [x + 0.04 * (1 - k) * Math.sin(2 * TAU * x), vc + amp * Math.sin(3 * TAU * x)],
						0.03
					);
				// torus: a around the tube, b around the hole (sliding to the inner equator)
				const w = 1 - k;
				fill(loopA, fT, (x) => [0.25 + 0.07 * w * Math.sin(2 * TAU * x) + 0.03 * w * Math.sin(5 * TAU * x), x], -0.03);
				fill(loopB, fT, (x) => [x, 0.5 - 0.3 * w + 0.09 * w * Math.sin(3 * TAU * x)], -0.03);
				lblS.set(
					shrunk
						? `<span class="ok">${tex(String.raw`\text{shrunk to a point}`)}</span>`
						: tex(String.raw`\text{a loop on } S^2`)
				);
				lblT.set(k > 0.97 ? `<span class="stuck">${tex(String.raw`\text{taut, but stuck}`)}</span>` : tex(String.raw`\text{two loops on } T^2`));
				ctx.invalidate();
			}
		};
		api.set(s);
		return { dispose: () => (api = null) };
	}

	$effect(() => {
		const v = s;
		api?.set(v);
	});

	const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
	function play() {
		if (playing) {
			cancelAnimationFrame(raf);
			playing = false;
			return;
		}
		const from = s > 0.98 ? 1 : s;
		const to = s > 0.98 ? 0 : 1;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			s = to;
			return;
		}
		playing = true;
		const start = performance.now();
		const dur = 3000 * Math.max(0.25, Math.abs(to - from));
		const tick = (now: number) => {
			const x = Math.min(1, (now - start) / dur);
			s = from + (to - from) * ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));
	let ww = $state(800);
</script>

<div class="wrap" bind:clientWidth={ww}>
	<Scene3D
		{setup}
		height={ww < 620 ? 540 : 430}
		camera={{ position: [0, 2.0, 8.6], fov: 40 }}
		controls={{ autoRotate: false }}
		label="Left: a sphere with a wiggly gold loop that slides up and shrinks to a point. Right: a torus with a gold loop around the tube and a teal loop around the hole, which tighten but cannot shrink."
	/>
	<Controls>
		<Button variant="gold" icon={playing ? PauseIcon : s > 0.98 ? ResetIcon : PlayIcon} onclick={play}
			>{playing ? 'Pause' : s > 0.98 ? 'Loosen again' : s > 0.02 ? 'Keep pulling' : 'Pull the loops tight'}</Button
		>
	</Controls>
</div>

<style>
	.wrap :global(.lbl3d .ok) {
		color: var(--green);
	}
	.wrap :global(.lbl3d .stuck) {
		color: var(--rose);
	}
	.wrap :global(.lbl3d.small) {
		color: var(--ink-dim);
	}
</style>
