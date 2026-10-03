<script lang="ts">
	// A two-dimensional creature (the letter F, with a little clock-arrow showing
	// its sense of "counter-clockwise") walks once round the core of a band.
	// On a cylinder it comes home unchanged; on a Möbius band it comes home as
	// its own mirror image. Two laps undo the flip.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowTube } from '$lib/three/materials';
	import { surfaceGeometry } from '$lib/three/surfaces';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glass } from '../homotopy/glass';

	type Band = 'cylinder' | 'mobius';
	let band = $state<Band>('mobius');
	let s = $state(0);
	let playing = $state(false);
	let raf = 0;
	let api: { set(b: Band, s: number): void } | null = null;

	const R = 1.7;
	const W = 1.15;
	const TAU = Math.PI * 2;
	const TH0 = Math.PI / 2; // start at the front, facing the viewer
	const PSI = 1.3; // phase of the twist, so that the band faces the viewer at the start
	const GHOST = -0.5; // the ghost waits a little behind the starting line

	// band parametrizations: θ around, w across (|w| ≤ W/2)
	function X(b: Band, th: number, w: number): [number, number, number] {
		if (b === 'cylinder') return [R * Math.cos(th), w, R * Math.sin(th)];
		const r = R + w * Math.cos(th / 2 + PSI);
		return [r * Math.cos(th), w * Math.sin(th / 2 + PSI), r * Math.sin(th)];
	}

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		ctx.camera.near = 0.5;
		ctx.camera.far = 60;
		ctx.camera.updateProjectionMatrix();
		const bands: Record<Band, InstanceType<typeof THREE.Group>> = { cylinder: new THREE.Group(), mobius: new THREE.Group() };
		for (const b of ['cylinder', 'mobius'] as Band[]) {
			const geo = surfaceGeometry((u, v, t) => t.set(...X(b, TAU * u, (v - 0.5) * W)), 200, 16);
			bands[b].add(glass(geo, { opacity: 0.72, grid: [48, 6], gridStrength: 0.3 }));
			const core = Array.from({ length: 160 }, (_, i) => new THREE.Vector3(...X(b, (TAU * i) / 160, 0)));
			bands[b].add(glowTube(new THREE.CatmullRomCurve3(core, true), { color: 'gold', radius: 0.014, closed: true, segments: 320, intensity: 0.7 }));
			scene.add(bands[b]);
		}

		// the creature: an F plus a counter-clockwise arrow, in its own (forward, across) plane
		function creature(colF: number, colArrow: number, opacity: number) {
			const g = new THREE.Group();
			const sh = new THREE.Shape();
			const F: [number, number][] = [
				[-0.12, -0.24],
				[-0.03, -0.24],
				[-0.03, -0.03],
				[0.09, -0.03],
				[0.09, 0.05],
				[-0.03, 0.05],
				[-0.03, 0.15],
				[0.15, 0.15],
				[0.15, 0.24],
				[-0.12, 0.24]
			];
			sh.moveTo(F[0][0], F[0][1]);
			for (const [x, y] of F.slice(1)) sh.lineTo(x, y);
			sh.closePath();
			const mat = (c: number) =>
				new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity, side: THREE.DoubleSide, depthTest: false, depthWrite: false });
			const f = new THREE.Mesh(new THREE.ShapeGeometry(sh), mat(colF));
			f.renderOrder = 20;
			g.add(f);
			// arc arrow (counter-clockwise in the creature's plane)
			const arcPts: InstanceType<typeof THREE.Vector3>[] = [];
			for (let i = 0; i <= 40; i++) {
				const a = 0.35 + (i / 40) * 4.6;
				arcPts.push(new THREE.Vector3(0.36 * Math.cos(a), 0.36 * Math.sin(a), 0));
			}
			const arc = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts), 60, 0.016, 8, false), mat(colArrow));
			arc.renderOrder = 20;
			g.add(arc);
			const end = arcPts[arcPts.length - 1];
			const prev = arcPts[arcPts.length - 3];
			const head = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.13, 12), mat(colArrow));
			head.position.copy(end);
			head.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), end.clone().sub(prev).normalize());
			head.renderOrder = 20;
			g.add(head);
			g.scale.set(-1.35, 1.35, 1.35); // mirrored so that it reads as an F from the viewer's side
			return g;
		}
		const walker = creature(0xf4d79c, 0x5fd6cf, 0.95);
		const ghost = creature(0xfbf6e8, 0xfbf6e8, 0.28);
		scene.add(walker, ghost);

		const T = new THREE.Vector3();
		const A = new THREE.Vector3();
		const N = new THREE.Vector3();
		const P = new THREE.Vector3();
		const M = new THREE.Matrix4();
		const tmp1 = new THREE.Vector3();
		const tmp2 = new THREE.Vector3();
		function place(obj: InstanceType<typeof THREE.Group>, b: Band, th: number) {
			const e = 1e-4;
			P.set(...X(b, th, 0));
			tmp1.set(...X(b, th + e, 0));
			T.copy(tmp1).sub(P).normalize();
			tmp2.set(...X(b, th, e));
			A.copy(tmp2).sub(P).normalize();
			N.crossVectors(T, A).normalize();
			A.crossVectors(N, T).normalize();
			M.makeBasis(T, A, N);
			obj.quaternion.setFromRotationMatrix(M);
			obj.position.copy(P).addScaledVector(N, 0.004);
		}
		api = {
			set(b, sv) {
				bands.cylinder.visible = b === 'cylinder';
				bands.mobius.visible = b === 'mobius';
				place(ghost, b, TH0 + GHOST);
				place(walker, b, TH0 + TAU * sv);
				ctx.invalidate();
			}
		};
		api.set(band, s);
		return { dispose: () => (api = null) };
	}

	$effect(() => {
		const b = band;
		const v = s;
		api?.set(b, v);
	});

	const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
	function play() {
		if (playing) {
			cancelAnimationFrame(raf);
			playing = false;
			return;
		}
		const from = s >= 1.999 ? 0 : s;
		const to = Math.min(2, Math.floor(from + 1e-6) + 1);
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			s = to;
			return;
		}
		playing = true;
		const t0 = performance.now();
		const dur = 3600 * (to - from);
		const tick = (now: number) => {
			const x = Math.min(1, (now - t0) / dur);
			s = from + (to - from) * ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	const message = $derived.by(() => {
		const laps = Math.round(s * 100) / 100;
		const home = Math.abs(s - Math.round(s)) < 0.015 && Math.round(s) > 0;
		if (!home) return `The creature has walked ${laps.toFixed(2)} of the way round${laps > 1 ? ' (second lap)' : ''}.`;
		if (band === 'cylinder') return 'Back home, exactly as it left: the F still matches its ghost.';
		return Math.round(s) === 1
			? 'Back home — as its mirror image. The F is reversed and its arrow now turns clockwise relative to the ghost.'
			: 'After a second lap the mirror image is undone: home again, unchanged.';
	});
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={430}
		camera={{ position: [0, 3.1, 5.4], fov: 40 }}
		controls={{ autoRotate: false }}
		label="A flat creature shaped like the letter F, with a circular arrow, walks around a band. On a Möbius band it returns mirror-reversed compared with its faint ghost at the start; on a cylinder it returns unchanged."
	/>
	<p class="msg ui" aria-live="polite">{message}</p>
	<Controls>
		<Segmented
			bind:value={band}
			options={[
				{ value: 'cylinder', label: 'Cylinder' },
				{ value: 'mobius', label: 'Möbius band' }
			]}
			label="Which band"
		/>
		<Slider bind:value={s} min={0} max={2} step={0.005} label="laps walked" format={(v) => v.toFixed(2)} />
		<Button variant="gold" onclick={play}>{playing ? 'Pause' : s >= 1.999 ? 'Start again' : 'Walk one lap'}</Button>
	</Controls>
</div>

<style>
	.msg {
		margin: 0;
		padding: 0.6rem 1.2rem;
		font-size: 0.88rem;
		color: var(--ink);
		border-top: 1px solid var(--line-faint);
		min-height: 2.6rem;
	}
</style>
