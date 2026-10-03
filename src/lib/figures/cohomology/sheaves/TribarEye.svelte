<script lang="ts">
	// Figure: the impossible triangle is possible — from exactly one eye.
	// Three real beams form an open chain; from the eye E on the line through
	// the start of beam A and the end of beam C, the gap disappears. Piece U₃
	// of the drawing, read as a genuine corner, puts beam A at the end of beam C:
	// that is beam A scaled towards the eye by the factor μ (the gold ghost).
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glowTube, glowPoint } from '$lib/three/materials';
	import type * as THREE_NS from 'three';
	import { N, eyeModel, type Vec3 } from './tribar';
	import { ease } from './svgutil';

	const { E, P0, P3, mu } = eyeModel(30);
	let showGhost = $state(true);

	// chain coordinates → scene coordinates: view axis (1,1,1) becomes +z,
	// and the picture's "up" (−1, 0, 1)/√2 becomes +y
	const rt: Vec3 = [-1 / Math.sqrt(6), 2 / Math.sqrt(6), -1 / Math.sqrt(6)];
	const upv: Vec3 = [-1 / Math.SQRT2, 0, 1 / Math.SQRT2];
	const bk: Vec3 = [1 / Math.sqrt(3), 1 / Math.sqrt(3), 1 / Math.sqrt(3)];
	const centre: Vec3 = [(2 * N + 1.5) / 3, (N + 1.5) / 3, 0.5];
	const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	const toScene = (p: Vec3): [number, number, number] => {
		const q: Vec3 = [p[0] - centre[0], p[1] - centre[1], p[2] - centre[2]];
		return [dot(q, rt), dot(q, upv), dot(q, bk)];
	};
	const eyeScene = toScene(E);
	// the camera's target: the centre of the picture, on the line of sight
	const tgt: [number, number, number] = [0, 0, toScene(P0)[2] * 0.5 + toScene(P3)[2] * 0.5];

	let api: { home(): void; aside(): void; ghost(on: boolean): void } | null = null;

	function setup({ scene, THREE, camera, controls, invalidate, onFrame, label }: SceneContext) {
		const world = new THREE.Group();
		scene.add(world);
		const toV = (p: Vec3) => new THREE.Vector3(...toScene(p));

		const shade = {
			x: new THREE.MeshBasicMaterial({ color: 0xc9a25d }),
			y: new THREE.MeshBasicMaterial({ color: 0x6d5129 }),
			z: new THREE.MeshBasicMaterial({ color: 0xf4e2b8 })
		};
		const edgeMat = new THREE.LineBasicMaterial({ color: 0x24190b });

		// a box [x0,x1]×[y0,y1]×[z0,z1] in chain coordinates, faces coloured by normal
		function box(a: Vec3, b: Vec3, scaleAbout?: { c: Vec3; s: number }) {
			const g = new THREE.BoxGeometry(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
			g.translate((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2);
			const pos = g.attributes.position as THREE_NS.BufferAttribute;
			for (let i = 0; i < pos.count; i++) {
				let p: Vec3 = [pos.getX(i), pos.getY(i), pos.getZ(i)];
				if (scaleAbout) p = [0, 1, 2].map((k) => scaleAbout.c[k] + scaleAbout.s * (p[k] - scaleAbout.c[k])) as Vec3;
				const q = toScene(p);
				pos.setXYZ(i, q[0], q[1], q[2]);
			}
			g.computeVertexNormals();
			return g;
		}
		// BoxGeometry groups: +x, −x, +y, −y, +z, −z
		const faceMats = [shade.x, shade.x, shade.y, shade.y, shade.z, shade.z];
		const beams: [Vec3, Vec3][] = [
			[
				[0, 0, 0],
				[N + 1, 1, 1]
			],
			[
				[N, 1, 0],
				[N + 1, N + 1, 1]
			],
			[
				[N, N, 1],
				[N + 1, N + 1, N + 1]
			]
		];
		for (const [a, b] of beams) {
			const g = box(a, b);
			world.add(new THREE.Mesh(g, faceMats));
			world.add(new THREE.LineSegments(new THREE.EdgesGeometry(g), edgeMat));
		}

		// piece U₃'s idea of beam A: scaled towards the eye by μ
		const ghostGroup = new THREE.Group();
		const gg = box([0, 0, 0], [N + 1, 1, 1], { c: E as Vec3, s: mu });
		ghostGroup.add(
			new THREE.Mesh(gg, new THREE.MeshBasicMaterial({ color: 0xf4d79c, transparent: true, opacity: 0.32, depthWrite: false })),
			new THREE.LineSegments(new THREE.EdgesGeometry(gg), new THREE.LineBasicMaterial({ color: 0xf4d79c, transparent: true, opacity: 0.9 }))
		);
		world.add(ghostGroup);

		// the line of sight through both ends, and the eye
		const far = toV([P0[0] - 2, P0[1] - 2, P0[2] - 2]);
		world.add(glowTube(new THREE.LineCurve3(toV(E as Vec3), far), { color: 'rose', radius: 0.03, segments: 1, intensity: 0.7 }));
		world.add(glowPoint(toV(E as Vec3), { color: 'rose', size: 0.25, halo: 6 }));
		label(toV([E[0], E[1], E[2]]).add(new THREE.Vector3(0, 0.9, 0)), 'eye', { className: 'rose tag' });
		const names = [
			label(toV([N / 2, -1.2, -0.4]), 'beam A', { className: 'small' }),
			label(toV([N + 2.2, N / 2, 0.5]), 'beam B', { className: 'small' }),
			label(toV([N + 2.0, N + 2.0, N / 2]), 'beam C', { className: 'small' })
		];
		const gl = label(new THREE.Vector3(), 'U₃’s beam A', { className: 'gold small' });
		const mid = [0, 1, 2].map((k) => E[k] + mu * ([N / 2, 2.2, 1.6][k] - E[k])) as Vec3;
		gl.position.copy(toV(mid));
		// labels only make sense once you have moved away from the eye
		const eyeV = new THREE.Vector3(...eyeScene);
		const syncLabels = () => {
			const away = camera.position.distanceTo(eyeV) > 1.5;
			names.forEach((l) => l.show(away));
			gl.show(away && showGhost);
		};
		controls?.addEventListener('change', syncLabels);
		syncLabels();

		const fly = (p1: THREE_NS.Vector3) => {
			const p0 = camera.position.clone();
			const t0 = controls ? controls.target.clone() : new THREE.Vector3(...tgt);
			const t1 = new THREE.Vector3(...tgt);
			let s = 0;
			const off = onFrame((_t, dt) => {
				s = Math.min(1, s + dt / 0.9);
				const e = ease(s);
				camera.position.lerpVectors(p0, p1, e);
				controls?.target.lerpVectors(t0, t1, e);
				camera.lookAt(controls?.target ?? t1);
				if (s >= 1) {
					off();
					syncLabels();
				}
			});
		};
		const home = () => fly(new THREE.Vector3(...eyeScene));
		const aside = () => fly(new THREE.Vector3(...tgt).add(new THREE.Vector3(0.82, 0.32, 0.48).normalize().multiplyScalar(64)));
		api = {
			home,
			aside,
			ghost(on) {
				ghostGroup.visible = on;
				syncLabels();
				invalidate();
			}
		};
		api.ghost(showGhost);
		return {
			dispose() {
				api = null;
				Object.values(shade).forEach((m) => m.dispose());
				edgeMat.dispose();
			}
		};
	}

	$effect(() => {
		void showGhost;
		api?.ghost(showGhost);
	});
</script>

<Scene3D
	{setup}
	height={460}
	camera={{ position: eyeScene, target: tgt, fov: 15 }}
	controls={{ autoRotate: false, zoom: true, minDistance: 8, maxDistance: 95 }}
	label="Three straight beams forming an open chain. Seen from one particular point, the eye, the end of the last beam lies exactly in front of the start of the first, and the chain looks like a closed impossible triangle."
/>

<Controls>
	<Button onclick={() => api?.aside()}>Step aside</Button>
	<Button onclick={() => api?.home()}>Back to the eye</Button>
	<Toggle bind:checked={showGhost} label="Show U₃’s version of beam A" />
	<span class="mu ui">μ = |EP₃| / |EP₀| ≈ {mu.toFixed(3)}</span>
</Controls>

<style>
	.mu {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
</style>
