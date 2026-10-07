<script lang="ts">
	// Figure: the Gauss–Bonnet sculptor. A triangulated sphere (or torus) that
	// the reader deforms. Each vertex is coloured by its curvature (angle defect
	// divided by its share of area): warm gold where the surface is curved like a
	// ball, cool teal where it is curved like a saddle, a bright line where it is
	// flat. However wildly the colours change, the total angle defect stays
	// exactly 2π·χ: 4π for the sphere, 0 for the torus.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import { PauseIcon, PlayIcon, ResetIcon } from '$lib/icons';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type * as THREE_NS from 'three';
	import { angleDefects, eulerCharacteristic, icosphere, shapeSphere, shapeTorus, torusGrid, vertexAreas, type Bump } from './mesh';

	type Mode = 'sphere' | 'torus';
	let mode = $state<Mode>('sphere');
	// one deformation, played like a film: bumps grow, ripples spread, the
	// surface squashes one way and the other and twists — the total stays put
	let deform = $state(0);
	const strength = $derived(1 + 0.5 * deform);
	const waves = $derived(0.06 + 0.14 * deform);
	const squash = $derived(1 - 0.45 * Math.sin(2 * Math.PI * deform));
	const twist = $derived(1.3 * deform);
	let clickMode = $state<'pull' | 'push'>('pull');
	let wobble = $state(false);
	let clicks = $state<Bump[]>([]);
	// counts for the default sphere (icosphere level 5), so the readout is right before WebGL starts
	let stats = $state({ total: 2, pos: 0, neg: 0, V: 10242, E: 30720, F: 20480 });
	let live = $state(false);

	const TAU = Math.PI * 2;
	const dir = (lon: number, lat: number): [number, number, number] => [Math.cos(lat) * Math.cos(lon), Math.sin(lat), Math.cos(lat) * Math.sin(lon)];
	const presetBumps: Record<Mode, Bump[]> = {
		sphere: [
			{ at: dir(0.5, 0.75), amp: 0.62, width: 0.34 },
			{ at: dir(3.4, -0.35), amp: -0.42, width: 0.42 },
			{ at: dir(2.0, 0.2), amp: 0.4, width: 0.24 },
			{ at: dir(5.1, -0.9), amp: 0.3, width: 0.3 }
		],
		torus: [
			{ at: [0.9, 0.3, 0], amp: 0.75, width: 0.32 },
			{ at: [3.6, 2.8, 0], amp: -0.4, width: 0.4 },
			{ at: [5.2, 0.9, 0], amp: 0.45, width: 0.26 }
		]
	};

	const vert = /* glsl */ `
		attribute float aK;
		varying vec3 vN;
		varying vec3 vW;
		varying float vK;
		void main() {
			vK = aK;
			vec4 w = modelMatrix * vec4(position, 1.0);
			vW = w.xyz;
			vN = normalize(mat3(modelMatrix) * normal);
			gl_Position = projectionMatrix * viewMatrix * w;
		}
	`;
	const frag = /* glsl */ `
		uniform float uTime;
		varying vec3 vN;
		varying vec3 vW;
		varying float vK;
		vec3 warm(float t) {
			return mix(vec3(0.97, 0.82, 0.50), vec3(0.98, 0.50, 0.58), smoothstep(0.6, 1.0, t));
		}
		vec3 cool(float t) {
			return mix(vec3(0.33, 0.85, 0.81), vec3(0.42, 0.58, 1.0), smoothstep(0.6, 1.0, t));
		}
		void main() {
			vec3 N = normalize(vN);
			if (!gl_FrontFacing) N = -N;
			vec3 V = normalize(cameraPosition - vW);
			float ndv = clamp(dot(N, V), 0.0, 1.0);
			float t = clamp(vK, -1.0, 1.0);
			vec3 neutral = vec3(0.17, 0.18, 0.40);
			vec3 base = t >= 0.0 ? mix(neutral, warm(t), smoothstep(0.0, 0.85, t)) : mix(neutral, cool(-t), smoothstep(0.0, 0.85, -t));
			vec3 L1 = normalize(vec3(0.5, 0.9, 0.6));
			vec3 L2 = normalize(vec3(-0.7, 0.25, -0.5));
			float diff = 0.32 + 0.62 * max(dot(N, L1), 0.0) + 0.22 * max(dot(N, L2), 0.0);
			float spec = pow(max(dot(N, normalize(L1 + V)), 0.0), 64.0);
			float fres = pow(1.0 - ndv, 3.0);
			// a thin-film sheen at grazing angles, as on the book's other surfaces
			vec3 sheen = 0.52 + 0.48 * cos(6.28318 * (0.9 * (1.0 - ndv) + 0.05 * uTime + vec3(0.02, 0.36, 0.62)));
			vec3 col = base * diff + vec3(1.0, 0.97, 0.9) * spec * 0.45 + sheen * fres * 0.35;
			// the parabolic line, where the curvature changes sign
			float w = max(fwidth(t), 1e-4);
			float line = 1.0 - smoothstep(0.0, 1.6 * w, abs(t));
			col = mix(col, vec3(1.0, 0.97, 0.88), line * 0.85);
			// faint contour lines of curvature
			float c = abs(fract(t * 5.0 + 0.5) - 0.5) / max(fwidth(t * 5.0), 1e-4);
			col += vec3(0.07) * (1.0 - smoothstep(0.0, 1.0, c));
			gl_FragColor = vec4(col, 1.0);
		}
	`;

	let api: { rebuild(): void; reshape(): void } | null = null;
	let wobbleApi: ((on: boolean) => void) | null = null;
	let wobblePhase = 0;

	function setup({ scene, THREE, invalidate, canvas, pick, onFrame }: SceneContext) {
		const material = new THREE.ShaderMaterial({
			vertexShader: vert,
			fragmentShader: frag,
			uniforms: { uTime: { value: 0 } },
			side: THREE.DoubleSide
		});
		let mesh: THREE_NS.Mesh | null = null;
		let geo: THREE_NS.BufferGeometry | null = null;
		let tri: Uint32Array = new Uint32Array();
		let basePos: Float64Array = new Float64Array(); // unit icosphere (sphere mode)
		let uv: Float64Array = new Float64Array(); // grid angles (torus mode)
		let pos: Float64Array = new Float64Array();
		let defects: Float64Array = new Float64Array();
		let areas: Float64Array = new Float64Array();
		let builtMode: Mode | null = null;

		// a faint "floor" glow under the shape, for depth
		const floor = new THREE.Mesh(
			new THREE.CircleGeometry(2.6, 64),
			new THREE.MeshBasicMaterial({ color: 0x5a4bb0, transparent: true, opacity: 0.07, depthWrite: false })
		);
		floor.rotation.x = -Math.PI / 2;
		floor.position.y = -1.95;
		scene.add(floor);

		function build() {
			if (mesh) {
				scene.remove(mesh);
				geo?.dispose();
			}
			if (mode === 'sphere') {
				const m = icosphere(5);
				basePos = m.pos;
				tri = m.tri;
			} else {
				const g = torusGrid(200, 72);
				uv = g.uv;
				tri = g.tri;
			}
			const n = mode === 'sphere' ? basePos.length / 3 : uv.length / 2;
			pos = new Float64Array(n * 3);
			defects = new Float64Array(n);
			areas = new Float64Array(n);
			geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
			geo.setAttribute('aK', new THREE.BufferAttribute(new Float32Array(n), 1));
			geo.setIndex(new THREE.BufferAttribute(tri, 1));
			mesh = new THREE.Mesh(geo, material);
			scene.add(mesh);
			builtMode = mode;
			const E = (tri.length / 3) * 1.5;
			stats.V = n;
			stats.E = E;
			stats.F = tri.length / 3;
			void eulerCharacteristic; // (V − E + F is computed from these counts; tested in charclasses.test.ts)
		}

		function reshape() {
			if (!geo) return;
			const s = strength;
			// while wobbling, each bump breathes in and out with its own phase
			const wob = (i: number) => (wobble ? 0.45 * Math.sin(wobblePhase + 1.9 * i) : 0);
			const bumps = [...presetBumps[mode].map((b, i) => ({ ...b, amp: b.amp * s * (1 + wob(i)) })), ...clicks];
			if (mode === 'sphere') shapeSphere(basePos, pos, { R: 1.3, bumps, waves, squash, twist });
			else shapeTorus(uv, pos, { R: 1.45, r: 0.55, bumps, waves, squash, twist });
			angleDefects({ pos, tri }, defects);
			vertexAreas({ pos, tri }, areas);
			const P = geo.attributes.position as THREE_NS.BufferAttribute;
			const K = geo.attributes.aK as THREE_NS.BufferAttribute;
			const pa = P.array as Float32Array;
			const ka = K.array as Float32Array;
			const kScale = mode === 'sphere' ? 1.15 : 1.6;
			let total = 0;
			let tp = 0;
			let tn = 0;
			for (let i = 0; i < defects.length; i++) {
				const d = defects[i];
				total += d;
				if (d > 0) tp += d;
				else tn += d;
				ka[i] = Math.tanh(d / Math.max(areas[i], 1e-9) / kScale);
			}
			for (let i = 0; i < pos.length; i++) pa[i] = pos[i];
			P.needsUpdate = true;
			K.needsUpdate = true;
			geo.computeVertexNormals();
			geo.computeBoundingSphere();
			stats.total = total / TAU;
			stats.pos = tp / TAU;
			stats.neg = tn / TAU;
			live = true;
			invalidate();
		}

		api = {
			rebuild() {
				if (builtMode !== mode) build();
				reshape();
			},
			reshape
		};
		api.rebuild();

		// click (without dragging) to push or pull the surface there
		let down: { x: number; y: number; t: number } | null = null;
		const onDown = (e: PointerEvent) => (down = { x: e.clientX, y: e.clientY, t: performance.now() });
		const onUp = (e: PointerEvent) => {
			if (!down || !mesh) return;
			const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
			const quick = performance.now() - down.t < 400;
			down = null;
			if (moved > 6 || !quick) return;
			const hit = pick(e, [mesh])[0];
			if (!hit || hit.face == null) return;
			const vi = hit.face.a;
			let at: [number, number, number];
			if (builtMode === 'sphere') at = [basePos[3 * vi], basePos[3 * vi + 1], basePos[3 * vi + 2]];
			else at = [uv[2 * vi], uv[2 * vi + 1], 0];
			const b: Bump = { at, amp: clickMode === 'pull' ? 0.42 : -0.3, width: builtMode === 'sphere' ? 0.22 : 0.24 };
			clicks = [...clicks.slice(-9), b];
		};
		canvas.addEventListener('pointerdown', onDown);
		canvas.addEventListener('pointerup', onUp);

		// wobbling animates the bumps (only while switched on)
		let offFrame: (() => void) | null = null;
		const setWobble = (on: boolean) => {
			if (on && !offFrame)
				offFrame = onFrame((t) => {
					wobblePhase = t * 1.3;
					material.uniforms.uTime.value = t;
					reshape();
				});
			if (!on && offFrame) {
				offFrame();
				offFrame = null;
				reshape();
			}
		};
		wobbleApi = setWobble;
		// the toggle may have been switched before the scene existed
		setWobble(wobble);

		return {
			dispose() {
				api = null;
				offFrame?.();
				wobbleApi = null;
				canvas.removeEventListener('pointerdown', onDown);
				canvas.removeEventListener('pointerup', onUp);
				material.dispose();
			}
		};
	}

	$effect(() => {
		// read the state before the optional call, so the effect tracks it even while the scene does not exist yet
		const on = wobble;
		wobbleApi?.(on);
	});
	$effect(() => {
		void mode;
		void strength;
		void waves;
		void squash;
		void twist;
		void clicks;
		api?.rebuild();
	});

	function setMode(m: Mode) {
		clicks = [];
		mode = m;
	}
	function reset() {
		clicks = [];
		deform = 0;
	}
	onMount(() => () => (api = null));

	const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(3);
	const chi = $derived(mode === 'sphere' ? 2 : 0);
	const barMax = $derived(Math.max(1, stats.pos, -stats.neg));
</script>

<Scene3D
	{setup}
	height={480}
	camera={{ position: [0, 1.2, 5.4], target: [0, -0.1, 0], fov: 40 }}
	controls={{ autoRotate: true, autoRotateSpeed: 0.5 }}
	label="A sculpted sphere or torus coloured by Gaussian curvature: gold where it curves like a ball, teal where it curves like a saddle, a bright line where the curvature changes sign. A readout shows that the total curvature does not change."
/>

<div class="readout ui" aria-live="polite">
	<div class="big">
		<span class="lbl">total curvature ÷ 2π</span>
		<span class="num nums">{fmt(stats.total)}</span>
		<span class="eq">= χ = {chi}</span>
	</div>
	<div class="bars">
		<div class="bar">
			<span class="k">positive part</span>
			<span class="track"><span class="fill warm" style="width:{(100 * stats.pos) / barMax}%"></span></span>
			<span class="v nums">{live ? '+' + stats.pos.toFixed(2) : '—'}</span>
		</div>
		<div class="bar">
			<span class="k">negative part</span>
			<span class="track"><span class="fill cool" style="width:{(100 * -stats.neg) / barMax}%"></span></span>
			<span class="v nums">{live ? (stats.neg < 0 ? '−' : '') + Math.abs(stats.neg).toFixed(2) : '—'}</span>
		</div>
	</div>
	<div class="count">
		<TeX tex={`V - E + F = ${stats.V} - ${stats.E} + ${stats.F} = ${stats.V - stats.E + stats.F}`} />
	</div>
</div>

<Controls>
	<Segmented
		value={mode}
		options={[
			{ value: 'sphere', label: 'Sphere' },
			{ value: 'torus', label: 'Torus' }
		]}
		label="Surface"
		onchange={(v) => setMode(v)}
	/>
	<Timeline bind:value={deform} loop duration={6} from="round" to="sculpted" label="Deforming the surface" />
	<Segmented
		bind:value={clickMode}
		options={[
			{ value: 'pull', label: 'Click pulls out' },
			{ value: 'push', label: 'Click pushes in' }
		]}
		label="Click to sculpt"
	/>
	<Button icon={wobble ? PauseIcon : PlayIcon} onclick={() => (wobble = !wobble)} active={wobble}>{wobble ? 'Stop' : 'Wobble'}</Button>
	<Button onclick={reset} icon={ResetIcon}>Reset</Button>
</Controls>

<style>
	.readout {
		display: grid;
		gap: 0.45rem;
		padding: 0.6rem 1.2rem 0.8rem;
		font-size: 0.84rem;
	}
	.big {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.8rem;
	}
	.lbl {
		color: var(--ink-dim);
		letter-spacing: 0.04em;
	}
	.num {
		font-size: 1.6rem;
		font-weight: 700;
		color: var(--gold-bright);
		text-shadow: 0 0 16px rgba(242, 205, 135, 0.45);
	}
	.eq {
		color: var(--ink-bright);
		font-size: 1rem;
	}
	.bars {
		display: grid;
		gap: 0.25rem;
	}
	.bar {
		display: grid;
		grid-template-columns: 7.5rem 1fr 3.5rem;
		align-items: center;
		gap: 0.6rem;
	}
	.k {
		color: var(--ink-dim);
	}
	.track {
		height: 8px;
		border-radius: 8px;
		background: rgba(255, 255, 255, 0.06);
		overflow: hidden;
	}
	.fill {
		display: block;
		height: 100%;
		border-radius: 8px;
		transition: width 0.25s var(--ease);
	}
	.fill.warm {
		background: linear-gradient(90deg, #d8b26e, #f9d78f);
		box-shadow: 0 0 10px rgba(242, 205, 135, 0.5);
	}
	.fill.cool {
		background: linear-gradient(90deg, #3fb5ae, #8fe9e2);
		box-shadow: 0 0 10px rgba(95, 214, 207, 0.5);
	}
	.v {
		text-align: right;
		color: var(--ink-bright);
	}
	.count {
		color: var(--ink);
	}
</style>
