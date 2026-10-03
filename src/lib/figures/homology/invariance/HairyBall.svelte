<script lang="ts">
	// Tangent vector fields made visible as flowing streaks ("combed hair").
	// On the sphere every field has a zero (a cowlick, glowing rose); on the torus
	// a field can be nowhere zero.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { iridescent, glowPoint, disposeTree } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry } from '$lib/three/surfaces';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import type * as THREE_NS from 'three';
	import { onMount } from 'svelte';
	import { fitCamera, isNarrow } from './three-fit';

	type Mode = 'whirl' | 'flow' | 'cowlick' | 'torus';
	let mode = $state<Mode>('whirl');
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { setMode(m: Mode): void } | null = null;

	const RS = 1.45; // display radius of the sphere
	const info: Record<Mode, { zeros: [number, number, number][]; idx: string[]; note: string }> = {
		whirl: { zeros: [[0, 1, 0], [0, -1, 0]], idx: ['+1', '+1'], note: 'Spin the hair around an axis: two calm spots, at the poles.' },
		flow: { zeros: [[0, 1, 0], [0, -1, 0]], idx: ['+1', '+1'], note: 'Comb everything “northwards”: hair parts at the south pole and piles up at the north.' },
		cowlick: { zeros: [[0, 1, 0]], idx: ['+2'], note: 'The cleverest combing: a single cowlick — but you cannot get rid of it.' },
		torus: { zeros: [], idx: [], note: 'On a doughnut, comb around the hole (with a slight spiral): no calm spot anywhere.' }
	};

	/** tangent fields on the unit sphere */
	function field(m: Mode, x: number, y: number, z: number, out: Float32Array) {
		if (m === 'whirl') {
			out[0] = z;
			out[1] = 0;
			out[2] = -x;
		} else if (m === 'flow') {
			out[0] = -y * x;
			out[1] = 1 - y * y;
			out[2] = -y * z;
		} else {
			// push-forward of a constant field under inverse stereographic projection from (0,1,0)
			out[0] = 1 - y - x * x;
			out[1] = x * (1 - y);
			out[2] = -x * z;
		}
	}

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion } = ctx;
		const unfit = fitCamera(ctx, 1.3);
		// the sphere spins about its (tilted) field axis, so the poles stay put on screen
		const sTilt = new THREE.Group();
		sTilt.rotation.x = 0.62;
		const sGroup = new THREE.Group();
		sTilt.add(sGroup);
		const tGroup = new THREE.Group();
		tGroup.rotation.x = 0.25;
		scene.add(sTilt, tGroup);
		sGroup.add(new THREE.Mesh(surfaceGeometry(sphere(RS * 0.985), 96, 48), iridescent({ opacity: 1, grid: [24, 12], gridStrength: 0.12, brightness: 0.55, film: 0.8 })));
		const tf = torus(1.55, 0.62);
		tGroup.add(new THREE.Mesh(surfaceGeometry(tf, 160, 64), iridescent({ opacity: 1, grid: [48, 20], gridStrength: 0.12, brightness: 0.55, film: 0.8 })));

		// streaks: N particles, each drawn as a short segment trailing behind it
		const N = 1400;
		const mkStreaks = () => {
			const pos = new Float32Array(N * 6);
			const col = new Float32Array(N * 6);
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
			geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
			const mat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false });
			const lines = new THREE.LineSegments(geo, mat);
			lines.renderOrder = 4;
			lines.frustumCulled = false;
			return { pos, col, geo, lines };
		};
		const S = mkStreaks();
		const T = mkStreaks();
		sGroup.add(S.lines);
		tGroup.add(T.lines);

		// particle state
		const P = new Float32Array(N * 3); // sphere: unit vectors; torus: (u, v, –)
		const age = new Float32Array(N);
		const life = new Float32Array(N);
		let seed = 12345;
		const rnd = () => {
			seed = (seed * 1664525 + 1013904223) >>> 0;
			return seed / 4294967296;
		};
		const respawnS = (i: number) => {
			// uniform on the sphere
			const z = 2 * rnd() - 1;
			const t = 2 * Math.PI * rnd();
			const r = Math.sqrt(1 - z * z);
			P[3 * i] = r * Math.cos(t);
			P[3 * i + 1] = z;
			P[3 * i + 2] = r * Math.sin(t);
			age[i] = 0;
			life[i] = 1.5 + 3 * rnd();
		};
		const respawnT = (i: number) => {
			P[3 * i] = rnd();
			P[3 * i + 1] = rnd();
			age[i] = 0;
			life[i] = 1.5 + 3 * rnd();
		};

		const v = new Float32Array(3);
		const a = new THREE.Vector3();
		const b = new THREE.Vector3();
		const gold = new THREE.Color(0xf2c66f);
		const teal = new THREE.Color(0x5fd6cf);

		let current: Mode = mode;
		const zeroMarks: THREE_NS.Object3D[] = [];
		const zeroLabels: ReturnType<typeof label>[] = [];

		function setMode(m: Mode) {
			current = m;
			const onT = m === 'torus';
			sTilt.visible = !onT;
			tGroup.visible = onT;
			for (let i = 0; i < N; i++) (onT ? respawnT : respawnS)(i), (age[i] = rnd() * life[i]);
			for (const z of zeroMarks) {
				sGroup.remove(z);
				disposeTree(z);
			}
			zeroMarks.length = 0;
			for (const l of zeroLabels) l.remove();
			zeroLabels.length = 0;
			info[m].zeros.forEach((z, k) => {
				const p = new THREE.Vector3(...z).multiplyScalar(RS * 1.02);
				const g = glowPoint(p, { color: 'rose', size: 0.075, halo: 11 });
				sGroup.add(g);
				zeroMarks.push(g);
				// labels live in world space: tilt the pole direction like the sphere
				const dir = new THREE.Vector3(...z).applyEuler(sTilt.rotation);
				const lp = dir.clone().multiplyScalar(RS * 1.12).add(new THREE.Vector3(0.95, 0.12, 0));
				zeroLabels.push(label(lp, `v = 0 <span class="ix">(index ${info[m].idx[k]})</span>`, { className: 'rose small', normal: dir }));
			});
			invalidate();
		}
		setMode(mode);
		api = { setMode };

		/** a point on the torus, lifted a hair's breadth along the outward normal */
		const TR = 1.55;
		const Tr = 0.62;
		const torusPoint = (u: number, w: number, out: THREE_NS.Vector3) => {
			const th = 2 * Math.PI * u;
			const ph = 2 * Math.PI * w;
			const c = Math.cos(ph);
			const rr = Tr + 0.008;
			out.set((TR + rr * c) * Math.cos(th), rr * Math.sin(ph), (TR + rr * c) * Math.sin(th));
			return out;
		};
		const write = (
			L: { pos: Float32Array; col: Float32Array },
			i: number,
			x0: number,
			y0: number,
			z0: number,
			x1: number,
			y1: number,
			z1: number,
			c: THREE_NS.Color,
			bright: number
		) => {
			const o = 6 * i;
			L.pos[o] = x0;
			L.pos[o + 1] = y0;
			L.pos[o + 2] = z0;
			L.pos[o + 3] = x1;
			L.pos[o + 4] = y1;
			L.pos[o + 5] = z1;
			const tail = 0.08 * bright;
			L.col[o] = c.r * tail;
			L.col[o + 1] = c.g * tail;
			L.col[o + 2] = c.b * tail;
			L.col[o + 3] = c.r * bright;
			L.col[o + 4] = c.g * bright;
			L.col[o + 5] = c.b * bright;
		};

		const step = (dt: number) => {
			const onT = current === 'torus';
			const L = onT ? T : S;
			for (let i = 0; i < N; i++) {
				age[i] += dt;
				if (age[i] > life[i]) (onT ? respawnT : respawnS)(i);
				const fade = Math.min(1, age[i] / 0.4, (life[i] - age[i]) / 0.4);
				if (!onT) {
					const x = P[3 * i];
					const y = P[3 * i + 1];
					const z = P[3 * i + 2];
					field(current, x, y, z, v);
					const sp = Math.hypot(v[0], v[1], v[2]);
					// move along the field
					const k = 0.55 * dt;
					let nx = x + v[0] * k;
					let ny = y + v[1] * k;
					let nz = z + v[2] * k;
					const nn = Math.hypot(nx, ny, nz);
					nx /= nn;
					ny /= nn;
					nz /= nn;
					P[3 * i] = nx;
					P[3 * i + 1] = ny;
					P[3 * i + 2] = nz;
					// streak: from a point behind to the particle; length ∝ speed (vanishing at zeros)
					const len = 0.2 * Math.tanh(sp / 0.35);
					const inv = sp > 1e-9 ? 1 / sp : 0;
					const r = RS * 1.012;
					a.set(nx, ny, nz).multiplyScalar(r);
					b.set(nx - v[0] * inv * len, ny - v[1] * inv * len, nz - v[2] * inv * len).normalize().multiplyScalar(r);
					const bright = 0.85 * fade * (0.2 + 0.8 * Math.tanh(sp / 0.4));
					write(L, i, b.x, b.y, b.z, a.x, a.y, a.z, gold, bright);
				} else {
					let u = P[3 * i];
					let w = P[3 * i + 1];
					u = (u + 0.07 * dt) % 1;
					w = (w + 0.022 * dt) % 1;
					P[3 * i] = u;
					P[3 * i + 1] = w;
					torusPoint(u, w, a);
					torusPoint((u - 0.035 + 1) % 1, (w - 0.011 + 1) % 1, b);
					write(L, i, b.x, b.y, b.z, a.x, a.y, a.z, teal, 0.85 * fade);
				}
			}
			L.geo.attributes.position.needsUpdate = true;
			L.geo.attributes.color.needsUpdate = true;
		};
		// pre-roll so the first frame already shows streaks
		for (let k = 0; k < 4; k++) step(0.05);
		const stop = onFrame((_t, dt) => {
			step(reducedMotion ? 0 : dt);
			if (!reducedMotion) {
				sGroup.rotation.y += dt * 0.08;
				tGroup.rotation.y += dt * 0.04;
			}
		});
		return {
			dispose: () => {
				unfit();
				stop();
				api = null;
			}
		};
	}

	$effect(() => {
		// read the state first: `api?.f(x)` would skip reading x while api is null,
		// and the effect would then never re-run
		const v = mode;
		api?.setMode(v);
	});
</script>

<Scene3D
	{setup}
	height={narrow ? 360 : 430}
	animate
	controls={{ autoRotate: false }}
	camera={{ position: [0, 2.3, 5.6] }}
	label="Streaks flowing along a tangent vector field: on the sphere there is always a point where the field vanishes; on the torus there need not be"
>
	<div class="note ui">{info[mode].note}</div>
</Scene3D>
<Controls>
	<Segmented
		bind:value={mode}
		label="Choose a combing"
		options={[
			{ value: 'whirl', label: 'Sphere: whirl' },
			{ value: 'flow', label: 'Sphere: south → north' },
			{ value: 'cowlick', label: 'Sphere: one cowlick' },
			{ value: 'torus', label: 'Torus: combed' }
		]}
	/>
</Controls>

<style>
	.note {
		position: absolute;
		left: 0.8rem;
		right: 3.2rem;
		bottom: 0.9rem;
		font-size: 0.78rem;
		color: var(--ink-dim);
		text-align: center;
		pointer-events: none;
		text-shadow: 0 0 8px rgba(0, 0, 0, 0.9);
	}
	:global(.lbl3d .ix) {
		font-size: 0.85em;
		opacity: 0.8;
	}
</style>
