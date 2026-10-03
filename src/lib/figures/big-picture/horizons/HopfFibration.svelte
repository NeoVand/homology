<script lang="ts">
	// Figure: the Hopf fibration S³ → S². Each point of the 2-sphere has a whole
	// circle of S³ above it; stereographic projection draws those circles in
	// space. Circles over one circle of latitude fill a torus; any two are linked.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { glowTube, glassMesh, disposeTree } from '$lib/three/materials';
	import { surfaceGeometry } from '$lib/three/surfaces';
	import { fibrePoint, basePoint, fibreCurve } from './hopf';
	import type * as THREE_NS from 'three';

	let perCircle = $state(12);
	let circles = $state(3);
	let showTori = $state(false);
	let api: { rebuild(n: number, c: number, tori: boolean): void } | null = null;

	const SCALE = 0.95;
	const latitudes = (L: number) =>
		L === 1 ? [0.46 * Math.PI] : Array.from({ length: L }, (_, k) => (0.24 + (0.33 * k) / (L - 1)) * Math.PI);
	const phiOffset = (k: number) => k * 0.37;

	function hsl(h: number, s: number, l: number): [number, number, number] {
		const a = s * Math.min(l, 1 - l);
		const f = (n: number) => {
			const k = (n + h * 12) % 12;
			return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
		};
		return [f(0), f(8), f(4)];
	}
	function fibreColor(k: number, j: number, n: number) {
		const h = (j / n + k * 0.11) % 1;
		const [r, g, b] = hsl(h, 0.72, 0.68);
		return {
			hex: (Math.round(r * 255) << 16) | (Math.round(g * 255) << 8) | Math.round(b * 255),
			css: `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`
		};
	}

	function setup({ THREE, scene, camera, invalidate }: SceneContext) {
		// on narrow (portrait) screens, step back so the outer circles stay in view
		if (camera.aspect < 1.2) camera.position.multiplyScalar(Math.min(1.9, 1.2 / camera.aspect));
		const curveOf = (theta: number, phi: number) => fibreCurve(THREE, theta, phi, SCALE);
		const torusFn = (theta: number) => (u: number, v: number, t: THREE_NS.Vector3) => {
			const [x, y, z] = fibrePoint(theta, 2 * Math.PI * u, 2 * Math.PI * v);
			t.set(x * SCALE, z * SCALE, y * SCALE);
		};

		// the fibres over the two poles: the flat unit circle, and the vertical axis (a circle through infinity)
		const poles = new THREE.Group();
		poles.add(glowTube(curveOf(0, 0), { color: 0xe6ecff, radius: 0.012, closed: true, halo: false, segments: 160, radialSegments: 6, intensity: 0.6 }));
		poles.add(
			glowTube(new THREE.LineCurve3(new THREE.Vector3(0, -9, 0), new THREE.Vector3(0, 9, 0)), {
				color: 0xe6ecff,
				radius: 0.012,
				halo: false,
				segments: 8,
				radialSegments: 6,
				intensity: 0.6
			})
		);
		scene.add(poles);

		// two highlighted fibres, linked once
		const pair = new THREE.Group();
		pair.add(glowTube(curveOf(0.3 * Math.PI, 0.9), { color: 'gold', radius: 0.034, closed: true, segments: 240, haloScale: 3 }));
		pair.add(glowTube(curveOf(0.55 * Math.PI, 0.9 + Math.PI), { color: 'teal', radius: 0.034, closed: true, segments: 240, haloScale: 3 }));
		scene.add(pair);

		let group = new THREE.Group();
		scene.add(group);

		function rebuild(n: number, c: number, tori: boolean) {
			scene.remove(group);
			disposeTree(group);
			group = new THREE.Group();
			latitudes(c).forEach((theta, k) => {
				for (let j = 0; j < n; j++) {
					const phi = (2 * Math.PI * j) / n + phiOffset(k);
					const col = fibreColor(k, j, n);
					group.add(
						glowTube(curveOf(theta, phi), {
							color: col.hex,
							radius: 0.014,
							closed: true,
							halo: false,
							segments: 150,
							radialSegments: 6,
							intensity: 0.95
						})
					);
				}
				if (tori)
					group.add(
						glassMesh(surfaceGeometry(torusFn(theta), 96, 48), {
							opacity: 0.1,
							grid: [24, 12],
							gridStrength: 0.12,
							rim: 0.35,
							film: 1.2,
							hue: k * 0.15
						})
					);
			});
			scene.add(group);
			invalidate();
		}
		api = { rebuild };
		rebuild(perCircle, circles, showTori);
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		const n = perCircle;
		const c = circles;
		const t = showTori;
		api?.rebuild(n, c, t);
	});

	// the base sphere, drawn as an inset
	const R = 46;
	function project(theta: number, phi: number) {
		const [x, y, z] = basePoint(theta, phi);
		// tilt the view a little so the latitude circles read as ellipses
		const tilt = 0.45;
		// seen from slightly above, like the 3D view: the north pole leans towards us
		const Y = z * Math.cos(tilt) + y * Math.sin(tilt);
		const towards = z * Math.sin(tilt) - y * Math.cos(tilt);
		return { x: 60 + R * x, y: 58 - R * Y, front: towards > -0.08 };
	}
	const baseDots = $derived(
		latitudes(circles).flatMap((theta, k) =>
			Array.from({ length: perCircle }, (_, j) => {
				const phi = (2 * Math.PI * j) / perCircle + phiOffset(k);
				return { ...project(theta, phi), color: fibreColor(k, j, perCircle).css };
			})
		)
	);
	const poleDots = [project(0, 0), project(Math.PI, 0)];
	const pairDots = [
		{ ...project(0.3 * Math.PI, 0.9), color: '#f2d08f' },
		{ ...project(0.55 * Math.PI, 0.9 + Math.PI), color: '#5fd6cf' }
	];
</script>

<div class="hopf">
	<Scene3D
		{setup}
		height={480}
		animate
		camera={{ position: [0, 4.6, 7.2], fov: 38 }}
		controls={{ autoRotate: true, autoRotateSpeed: 0.5, zoom: true, minDistance: 4, maxDistance: 18 }}
		label="The Hopf fibration: circles in space, each one sitting over a single point of the 2-sphere; circles over a circle of latitude fill a torus, and any two circles are linked"
	>
		<div class="inset" aria-hidden="true">
			<svg viewBox="0 0 120 124" width="120" height="124">
				<circle cx="60" cy="58" r={R} class="sph" />
				<ellipse cx="60" cy="58" rx={R} ry={R * 0.43} class="eq" />
				{#each baseDots as d, i (i)}
					<circle cx={d.x} cy={d.y} r="2.6" fill={d.color} opacity={d.front ? 1 : 0.3} />
				{/each}
				{#each poleDots as d, i (i)}
					<circle cx={d.x} cy={d.y} r="3.2" fill="#e6ecff" opacity={d.front ? 1 : 0.45} />
				{/each}
				{#each pairDots as d, i (i)}
					<circle cx={d.x} cy={d.y} r="4" fill={d.color} stroke="#0b1122" stroke-width="1" />
				{/each}
				<text x="60" y="120" text-anchor="middle" class="cap">the base S²</text>
			</svg>
		</div>
	</Scene3D>
	<Controls>
		<Slider bind:value={perCircle} min={4} max={32} step={1} label="Circles over each latitude" format={(v) => String(v)} />
		<Slider bind:value={circles} min={1} max={4} step={1} label="Latitudes on S²" format={(v) => String(v)} />
		<Toggle bind:checked={showTori} label="Show the tori they fill" />
	</Controls>
</div>

<style>
	.inset {
		position: absolute;
		left: 0.8rem;
		top: 0.6rem;
		padding: 0.3rem;
		border-radius: 12px;
		background: rgba(6, 10, 20, 0.55);
		border: 1px solid var(--line-faint);
		backdrop-filter: blur(4px);
		pointer-events: none !important;
	}
	.sph {
		fill: rgba(116, 169, 255, 0.08);
		stroke: rgba(191, 228, 255, 0.4);
		stroke-width: 1;
	}
	.eq {
		fill: none;
		stroke: rgba(191, 228, 255, 0.2);
		stroke-dasharray: 2 3;
	}
	.cap {
		font-family: var(--font-ui);
		font-size: 9px;
		fill: var(--ink-faint);
		letter-spacing: 0.05em;
	}
</style>
