<script lang="ts">
	// The small-sphere test. Put a small sphere around a point of a space and look
	// at where it meets the space. Points of a surface give one circle; a boundary
	// point gives an arc; a figure eight's crossing gives four points; the tip of
	// a double cone gives two circles; two crossing planes give two circles that
	// cross. Click a shape to move the probe; pull the sphere's rim in to shrink
	// it and zoom in.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { fitCamera } from '$lib/figures/homology/invariance/three-fit';
	import { glowPoint, glowTube } from '$lib/three/materials';
	import { surfaceGeometry } from '$lib/three/surfaces';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glass } from '../homotopy/glass';
	import { linkOfCurve, linkOfPatch, polylineGap, type Patch, type Polyline, type V3 } from './link';

	type Key = 'eight' | 'cone' | 'double' | 'planes' | 'disk';
	let key = $state<Key>('double');
	const RMIN = 0.12;
	const RMAX = 0.6;
	let rho = $state(0.42);
	let centre = $state<V3>([0, 0, 0]);
	let verdict = $state<{ kind: 'ok' | 'bad' | 'edge' | 'warn'; title: string; text: string }>({ kind: 'ok', title: '', text: '' });
	let api: { set(k: Key, c: V3, r: number): void } | null = null;

	const TAU = Math.PI * 2;
	const A = 0.68; // angle of the crossing planes
	const BETA = 0.5; // the crossing line runs diagonally, so the "open book" is seen from an angle
	const LD: V3 = [Math.cos(BETA), 0, -Math.sin(BETA)];
	const MD: V3 = [Math.sin(BETA), 0, Math.cos(BETA)];
	const onLine = (t: number): V3 => [t * LD[0], 0, t * LD[2]];
	const eight = (s: number): V3 => {
		const t = TAU * s;
		const d = 1 + Math.sin(t) ** 2;
		return [(1.9 * Math.cos(t)) / d, (1.9 * Math.sin(t) * Math.cos(t)) / d, 0];
	};
	const patches: Record<Exclude<Key, 'eight'>, Patch[]> = {
		cone: [
			{
				periodicU: true,
				fn: (u, v) => {
					const r = 1.4 * v;
					return [r * Math.cos(TAU * u), -0.85 + 1.15 * r, r * Math.sin(TAU * u)];
				}
			}
		],
		double: [1, -1].map((s) => ({
			periodicU: true,
			fn: (u: number, v: number): V3 => {
				const r = 1.3 * v;
				return [r * Math.cos(TAU * u), s * r, r * Math.sin(TAU * u)];
			}
		})),
		planes: [A, -A].map((a) => ({
			fn: (u: number, v: number): V3 => {
				const t = (u - 0.5) * 3.2;
				const s = (v - 0.5) * 2.7;
				const c = s * Math.cos(a);
				return [t * LD[0] + c * MD[0], s * Math.sin(a), t * LD[2] + c * MD[2]];
			}
		})),
		disk: [
			{
				periodicU: true,
				fn: (u, v) => [1.55 * v * Math.cos(TAU * u), 0, 1.55 * v * Math.sin(TAU * u)]
			}
		]
	};
	const special: Record<Key, V3> = {
		eight: [0, 0, 0],
		cone: [0, -0.85, 0],
		double: [0, 0, 0],
		planes: onLine(0.35),
		disk: [0, 0, 1.55]
	};
	const ordinary: Record<Key, V3> = {
		eight: eight(0.08),
		cone: [0, -0.85 + 1.15 * 0.85, 0.85],
		double: [0, 0.8, 0.8],
		planes: [0.2 * LD[0] + 0.75 * Math.cos(A) * MD[0], 0.75 * Math.sin(A), 0.2 * LD[2] + 0.75 * Math.cos(A) * MD[2]],
		disk: [0.35, 0, 0.45]
	};
	function distSpecial(k: Key, p: V3): number {
		if (k === 'planes') {
			const t = p[0] * LD[0] + p[2] * LD[2];
			return Math.hypot(p[0] - t * LD[0], p[1], p[2] - t * LD[2]);
		}
		if (k === 'disk') return Math.abs(Math.hypot(p[0], p[2]) - 1.55) + Math.abs(p[1]);
		const s = special[k];
		return Math.hypot(p[0] - s[0], p[1] - s[1], p[2] - s[2]);
	}
	const specialName: Record<Key, string> = {
		eight: 'the crossing',
		cone: 'the tip',
		double: 'the tip',
		planes: 'the crossing line',
		disk: 'the edge'
	};

	function judge(k: Key, p: V3, r: number, links: Polyline[], beads: number) {
		const on = distSpecial(k, p) < 0.04;
		const shrink = `Your sphere is big enough to reach ${specialName[k]}. Shrink it: being a manifold is about <em>small</em> neighbourhoods, and close up this point is ordinary.`;
		if (k === 'eight') {
			if (beads === 2) return { kind: 'ok' as const, title: 'Two points', text: 'Near this point the figure eight looks like a line: a small neighbourhood is an open interval, with two ends.' };
			if (beads === 4 && on)
				return {
					kind: 'bad' as const,
					title: 'Four points',
					text: 'Four branches meet here. Remove the point from any small neighbourhood and four pieces remain — an interval would leave two. No neighbourhood of the crossing is a line.'
				};
			return { kind: 'warn' as const, title: `${beads} points`, text: shrink };
		}
		const closed = links.filter((l) => l.closed).length;
		const open = links.length - closed;
		if (open > 0 && k !== 'disk')
			return { kind: 'warn' as const, title: 'Off the edge of the picture', text: 'Your sphere pokes out past the edge of the drawing. Move the point inwards or shrink the sphere.' };
		if (k === 'disk' && open === 1 && closed === 0)
			return on
				? {
						kind: 'edge' as const,
						title: 'An arc with two ends',
						text: 'This is how a point on the edge of a half-plane looks: a <strong>boundary point</strong>. The disk is a manifold <em>with boundary</em>.'
					}
				: { kind: 'warn' as const, title: 'An arc', text: shrink };
		if (closed === 1 && open === 0) {
			if (k === 'cone' && on)
				return {
					kind: 'ok' as const,
					title: 'One circle — even at the tip',
					text: 'Surprise: topologically the tip of a cone is an ordinary point (squash the cone flat and it becomes a disk). It fails only the <em>smooth</em> test: there is no tangent plane there.'
				};
			return { kind: 'ok' as const, title: 'One circle', text: 'Just like a point of the plane: a small neighbourhood is a disk.' };
		}
		if (closed === 2 && links.length === 2) {
			const crossing = polylineGap(links[0].points, links[1].points) < 0.04;
			if (!on) return { kind: 'warn' as const, title: 'Two circles', text: shrink };
			if (crossing)
				return {
					kind: 'bad' as const,
					title: 'Two circles that cross',
					text: 'Four half-planes meet along the line, like the pages of a book with four leaves. A point of a plane would give a single circle.'
				};
			return {
				kind: 'bad' as const,
				title: 'Two separate circles',
				text: 'Remove the tip from a small neighbourhood and it falls into two pieces, upper and lower. A disk with its centre removed stays in one piece, so the tip has no disk neighbourhood.'
			};
		}
		return { kind: 'warn' as const, title: 'Something complicated', text: 'Shrink the sphere until the picture is simple.' };
	}

	function setup(ctx: SceneContext) {
		const { scene, THREE, canvas, camera, controls } = ctx;
		ctx.camera.near = 0.4;
		ctx.camera.far = 60;
		ctx.camera.updateProjectionMatrix();
		// on narrow canvases pull the camera back so the wide shapes (the double cone's rims) stay in frame
		const unfit = fitCamera(ctx, 1.3, 0.55);
		const groups: Record<Key, InstanceType<typeof THREE.Group>> = {
			eight: new THREE.Group(),
			cone: new THREE.Group(),
			double: new THREE.Group(),
			planes: new THREE.Group(),
			disk: new THREE.Group()
		};
		const pickables: Record<Key, InstanceType<typeof THREE.Object3D>[]> = { eight: [], cone: [], double: [], planes: [], disk: [] };
		const hlMats: InstanceType<typeof THREE.ShaderMaterial>[] = [];
		const hlMat = () => {
			const m = new THREE.ShaderMaterial({
				uniforms: { uC: { value: new THREE.Vector3() }, uR: { value: 0.4 } },
				vertexShader: /* glsl */ `varying vec3 vP; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix*viewMatrix*wp; }`,
				fragmentShader: /* glsl */ `uniform vec3 uC; uniform float uR; varying vec3 vP; void main(){ float d = distance(vP, uC); if (d > uR) discard; float a = 0.34 * (1.0 - smoothstep(uR * 0.75, uR, d)) + 0.1; gl_FragColor = vec4(vec3(0.62, 0.55, 1.0) * a, a); }`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				side: THREE.DoubleSide,
				polygonOffset: true,
				polygonOffsetFactor: -2,
				polygonOffsetUnits: -2
			});
			hlMats.push(m);
			return m;
		};
		for (const k of ['cone', 'double', 'planes', 'disk'] as const) {
			for (const pt of patches[k]) {
				const geo = surfaceGeometry((u, v, t) => t.set(...pt.fn(u, v)), 120, 60);
				const g = glass(geo, { opacity: 0.78, grid: k === 'planes' ? [16, 14] : [36, 10], gridStrength: 0.3 });
				groups[k].add(g);
				pickables[k].push(g.children[1]);
				const hl = new THREE.Mesh(geo, hlMat());
				hl.renderOrder = 3;
				groups[k].add(hl);
			}
		}
		// figure eight and special loci
		const eightCurve = new THREE.CatmullRomCurve3(
			Array.from({ length: 240 }, (_, i) => new THREE.Vector3(...eight(i / 240))),
			true
		);
		const eightTube = glowTube(eightCurve, { color: 'gold', closed: true, radius: 0.035, segments: 480 });
		groups.eight.add(eightTube);
		pickables.eight.push(eightTube);
		groups.disk.add(
			glowTube(new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => new THREE.Vector3(1.55 * Math.cos((TAU * i) / 120), 0, 1.55 * Math.sin((TAU * i) / 120))), true), {
				color: 'gold',
				closed: true,
				radius: 0.022,
				segments: 240
			})
		);
		groups.planes.add(
			glowTube(new THREE.LineCurve3(new THREE.Vector3(...onLine(-1.6)), new THREE.Vector3(...onLine(1.6))), { color: 'rose', radius: 0.012, segments: 8 })
		);
		groups.double.add(glowPoint([0, 0, 0], { color: 'rose', size: 0.035, halo: 6 }));
		groups.cone.add(glowPoint([0, -0.85, 0], { color: 'rose', size: 0.035, halo: 6 }));
		for (const g of Object.values(groups)) scene.add(g);

		// the probe
		const probe = new THREE.Mesh(
			new THREE.SphereGeometry(1, 48, 24),
			new THREE.ShaderMaterial({
				vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vP; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vP = wp.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*wp; }`,
				fragmentShader: /* glsl */ `varying vec3 vN; varying vec3 vP; void main(){ vec3 V = normalize(cameraPosition - vP); float f = pow(1.0 - abs(dot(normalize(vN), V)), 2.5); float a = 0.05 + 0.75 * f; gl_FragColor = vec4(vec3(0.8, 0.88, 1.0) * a, a); }`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		probe.renderOrder = 9;
		scene.add(probe);
		const centreDot = glowPoint([0, 0, 0], { color: 'ivory', size: 0.04, halo: 7 });
		scene.add(centreDot);
		const linkGroup = new THREE.Group();
		scene.add(linkGroup);

		const clearLinks = () => {
			for (const c of [...linkGroup.children]) {
				linkGroup.remove(c);
				c.traverse((o) => {
					const m = o as InstanceType<typeof THREE.Mesh>;
					m.geometry?.dispose?.();
					const mat = m.material as InstanceType<typeof THREE.Material> | undefined;
					mat?.dispose?.();
				});
			}
		};

		api = {
			set(k, c, r) {
				for (const kk of Object.keys(groups) as Key[]) groups[kk].visible = kk === k;
				probe.position.set(...c);
				probe.scale.setScalar(r);
				centreDot.position.set(...c);
				for (const m of hlMats) {
					m.uniforms.uC.value.set(...c);
					m.uniforms.uR.value = r;
				}
				clearLinks();
				let links: Polyline[] = [];
				let beads = 0;
				if (k === 'eight') {
					const pts = linkOfCurve(eight, c, r);
					beads = pts.length;
					for (const q of pts) linkGroup.add(glowPoint(q, { color: 'teal', size: 0.06 }));
				} else {
					for (const pt of patches[k]) links.push(...linkOfPatch(pt, c, r, 140, 140));
					for (const l of links) {
						const curve = new THREE.CatmullRomCurve3(
							l.points.map((q) => new THREE.Vector3(...q)),
							l.closed
						);
						linkGroup.add(glowTube(curve, { color: 'teal', closed: l.closed, radius: 0.02, segments: Math.max(32, l.points.length * 2) }));
					}
				}
				verdict = judge(k, c, r, links, beads);
				ctx.invalidate();
			}
		};
		api.set(key, centre, rho);

		// press on the sphere's rim and drag to resize it; click (not drag) a shape
		// to move the probe there
		const c3 = new THREE.Vector3();
		const side = new THREE.Vector3();
		const rim = (e: PointerEvent) => {
			c3.set(...centre);
			const c = ctx.project(c3);
			side.setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(rho).add(c3);
			const s = ctx.project(side);
			const box = canvas.getBoundingClientRect();
			const d = Math.hypot(e.clientX - box.left - c.x, e.clientY - box.top - c.y);
			const R = Math.hypot(s.x - c.x, s.y - c.y);
			return { d, near: !c.behind && Math.abs(d - R) < Math.max(9, 0.14 * R) };
		};
		let resizing: { d0: number; r0: number } | null = null;
		let controlsWere = true;
		let downAt: [number, number] | null = null;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			const h = rim(e);
			if (!h.near || h.d < 1) {
				downAt = [e.clientX, e.clientY];
				return;
			}
			downAt = null;
			resizing = { d0: h.d, r0: rho };
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
		};
		const onMove = (e: PointerEvent) => {
			if (resizing) {
				const r = (resizing.r0 * rim(e).d) / resizing.d0;
				rho = Math.round(Math.min(RMAX, Math.max(RMIN, r)) * 100) / 100;
			} else if (e.pointerType === 'mouse') canvas.style.cursor = rim(e).near ? 'grab' : '';
		};
		const onUp = (e: PointerEvent) => {
			if (resizing) {
				resizing = null;
				if (controls) controls.enabled = controlsWere;
				canvas.style.cursor = '';
				return;
			}
			if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
			downAt = null;
			const hit = ctx.pick(e, pickables[key])[0];
			if (!hit) return;
			let q: V3 = [hit.point.x, hit.point.y, hit.point.z];
			if (key === 'eight') {
				// snap to the curve itself
				let best = Infinity;
				for (let i = 0; i < 2000; i++) {
					const c = eight(i / 2000);
					const d = Math.hypot(c[0] - q[0], c[1] - q[1], c[2] - q[2]);
					if (d < best) {
						best = d;
						q = c;
					}
				}
			}
			if (distSpecial(key, q) < 0.12) q = key === 'planes' ? onLine(q[0] * LD[0] + q[2] * LD[2]) : key === 'disk' ? [1.55 * Math.cos(Math.atan2(q[2], q[0])), 0, 1.55 * Math.sin(Math.atan2(q[2], q[0]))] : special[key];
			centre = q;
		};
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		return {
			dispose: () => {
				unfit();
				api = null;
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
			}
		};
	}

	$effect(() => {
		const k = key;
		const c = centre;
		const r = rho;
		api?.set(k, c, r);
	});

	// the stepper shrinks or grows the sphere to the next multiple of 0.06
	const sizeIx = $derived(rho <= RMIN ? 2 : rho >= RMAX ? 10 : Math.min(9, Math.max(3, Math.round(rho / 0.06))));
	function resize(d: 1 | -1) {
		const k = d > 0 ? Math.floor(rho / 0.06 + 1e-9) + 1 : Math.ceil(rho / 0.06 - 1e-9) - 1;
		rho = Math.round(Math.min(RMAX, Math.max(RMIN, k * 0.06)) * 100) / 100;
	}

	const options: { value: Key; label: string }[] = [
		{ value: 'eight', label: 'Figure eight' },
		{ value: 'double', label: 'Double cone' },
		{ value: 'planes', label: 'Two planes' },
		{ value: 'cone', label: 'Cone' },
		{ value: 'disk', label: 'Disk' }
	];
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={420}
		camera={{ position: [0.5, 1.6, 4.7], fov: 40 }}
		controls={{ autoRotate: false }}
		label="A shape with a small glass sphere around one of its points; where the sphere meets the shape is drawn in teal"
	/>
	<div class="verdict ui {verdict.kind}" aria-live="polite">
		<span class="badge">{verdict.kind === 'ok' ? 'looks flat' : verdict.kind === 'bad' ? 'not locally flat' : verdict.kind === 'edge' ? 'boundary point' : 'zoom in'}</span>
		<strong>{verdict.title}.</strong>
		<span>{@html verdict.text}</span>
	</div>
	<Controls>
		<Segmented bind:value={key} {options} label="Which space" onchange={(k) => (centre = special[k])} />
		<Stepper value={sizeIx} min={2} max={10} label="Sphere radius" format={() => rho.toFixed(2)} onchange={(k) => resize(k > sizeIx ? 1 : -1)} />
		<Button onclick={() => (centre = special[key])}>Probe {specialName[key]}</Button>
		<Button onclick={() => (centre = ordinary[key])}>Probe an ordinary point</Button>
	</Controls>
</div>

<style>
	.verdict {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem 0.6rem;
		align-items: baseline;
		padding: 0.7rem 1.2rem 0.75rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		border-top: 1px solid var(--line-faint);
		min-height: 3.6rem;
	}
	.verdict strong {
		color: var(--ink-bright);
	}
	.badge {
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		border: 1px solid currentColor;
	}
	.ok .badge {
		color: var(--green);
	}
	.bad .badge {
		color: var(--rose);
	}
	.edge .badge {
		color: var(--amber);
	}
	.warn .badge {
		color: var(--blue);
	}
</style>
