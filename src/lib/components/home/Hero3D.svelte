<script lang="ts">
	// The landing page's centrepiece: an iridescent torus carrying its two
	// fundamental cycles, with light pulses running along them, inside a ring
	// of "data" stars — homology, cohomology and the shape of data in one image.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowTube, dotTexture, color } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, loopPath } from '$lib/three/surfaces';

	let { height = 560 }: { height?: number } = $props();

	function setup({ THREE, scene, camera, container, reducedMotion }: SceneContext) {
		const root = new THREE.Group();
		root.rotation.set(0.62, 0, -0.18);
		scene.add(root);

		const f = torus(1.55, 0.6);
		const body = glassMesh(surfaceGeometry(f, 220, 90), {
			opacity: 0.86,
			grid: [64, 24],
			gridStrength: 0.22,
			film: 1.25,
			rim: 0.75
		});
		root.add(body);

		const longitude = new SurfaceCurve(f, loopPath(1, 0, 0, 0.22), 0.02);
		const meridian = new SurfaceCurve(f, loopPath(0, 1, 0.08, 0), 0.02);
		root.add(glowTube(longitude, { color: 'gold', radius: 0.026, closed: true, segments: 320 }));
		root.add(glowTube(meridian, { color: 'gold', radius: 0.026, closed: true, segments: 160 }));

		// light pulses travelling along each cycle
		const pulseMat = (c: number) =>
			new THREE.SpriteMaterial({
				map: dotTexture(),
				color: c,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			});
		const pulses = [
			{ curve: longitude, sprite: new THREE.Sprite(pulseMat(0xfff1cf)), speed: 0.07, phase: 0 },
			{ curve: longitude, sprite: new THREE.Sprite(pulseMat(0xfff1cf)), speed: 0.07, phase: 0.5 },
			{ curve: meridian, sprite: new THREE.Sprite(pulseMat(0xfff1cf)), speed: 0.16, phase: 0.25 }
		];
		for (const p of pulses) {
			p.sprite.scale.setScalar(0.32);
			p.sprite.renderOrder = 9;
			root.add(p.sprite);
		}

		// a ring of drifting points: a noisy circle, the shape of data
		const N = 900;
		const pos = new Float32Array(N * 3);
		const col = new Float32Array(N * 3);
		const seeds = new Float32Array(N);
		const gold = color('gold');
		const violet = color('violet');
		const teal = color('teal');
		for (let i = 0; i < N; i++) {
			const t = Math.random() * Math.PI * 2;
			const r = 3.0 + (Math.random() - 0.5) * 0.9 + Math.sin(t * 5) * 0.08;
			pos[i * 3] = r * Math.cos(t);
			pos[i * 3 + 1] = (Math.random() - 0.5) * 0.35;
			pos[i * 3 + 2] = r * Math.sin(t);
			const c = Math.random() < 0.55 ? gold : Math.random() < 0.5 ? violet : teal;
			const k = 0.35 + Math.random() * 0.65;
			col[i * 3] = c.r * k;
			col[i * 3 + 1] = c.g * k;
			col[i * 3 + 2] = c.b * k;
			seeds[i] = Math.random();
		}
		const ringGeo = new THREE.BufferGeometry();
		ringGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		ringGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
		const ring = new THREE.Points(
			ringGeo,
			new THREE.PointsMaterial({
				size: 0.06,
				map: dotTexture(),
				vertexColors: true,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		ring.rotation.x = 0.1;
		root.add(ring);

		// soft glow behind the torus
		const halo = new THREE.Sprite(
			new THREE.SpriteMaterial({
				map: dotTexture(),
				color: 0x6d5bd0,
				transparent: true,
				opacity: 0.22,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		halo.scale.set(9, 9, 1);
		halo.position.set(0, 0, -2.5);
		halo.renderOrder = -1;
		scene.add(halo);

		camera.position.set(0, 0.4, 8.2);
		camera.lookAt(0, 0, 0);

		// gentle parallax towards the pointer
		const target = { x: 0, y: 0 };
		const onMove = (e: PointerEvent) => {
			const r = container.getBoundingClientRect();
			target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
			target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
		};
		window.addEventListener('pointermove', onMove, { passive: true });

		const tmp = new THREE.Vector3();
		const baseDist = camera.position.length();
		return {
			update(t: number) {
				// keep the whole torus in frame on narrow (portrait) screens
				const halfV = (camera.fov * Math.PI) / 360;
				const halfH = Math.atan(Math.tan(halfV) * camera.aspect);
				const want = Math.max(baseDist, 2.55 / Math.tan(halfH));
				if (Math.abs(camera.position.length() - want) > 1e-3) {
					camera.position.setLength(want);
					camera.lookAt(0, 0, 0);
				}
				const s = reducedMotion ? 0 : 1;
				root.rotation.y = t * 0.12 * s;
				root.rotation.x = 0.62 + target.y * 0.12;
				root.rotation.z = -0.18 + target.x * 0.1;
				ring.rotation.y = -t * 0.05 * s;
				for (const p of pulses) {
					const u = (p.phase + t * p.speed * (s || 0.0001)) % 1;
					p.curve.getPoint(u, tmp);
					p.sprite.position.copy(tmp);
					const flicker = 0.85 + 0.15 * Math.sin(t * 6 + p.phase * 10);
					p.sprite.scale.setScalar(0.3 * flicker);
				}
				for (const m of body.userData.materials ?? []) m.uniforms.uTime.value = t;
			},
			dispose() {
				window.removeEventListener('pointermove', onMove);
			}
		};
	}
</script>

<div class="hero3d">
	<Scene3D
		{setup}
		{height}
		controls={false}
		animate
		camera={{ position: [0, 0.4, 8.2], fov: 38 }}
		label="An iridescent torus with its two fundamental loops glowing in gold, surrounded by a ring of points"
	/>
</div>

<style>
	.hero3d {
		position: relative;
		width: 100%;
	}
	.hero3d :global(.scene3d) {
		max-height: none;
	}
	@media (max-width: 979px) {
		.hero3d :global(.scene3d) {
			height: min(600px, 50vh) !important;
		}
	}
	.hero3d :global(canvas) {
		cursor: default !important;
	}
</style>
