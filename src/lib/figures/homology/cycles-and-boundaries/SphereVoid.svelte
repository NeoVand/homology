<script lang="ts">
	// Figure 3.1.6 — on a sphere every loop bounds (in fact it bounds two caps).
	// The whole sphere is a closed surface with no rim — a 2-cycle — enclosing a
	// void; filling in the solid ball makes it a boundary.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { glassMesh, glowTube, faceMaterial, shaderColor } from '$lib/three/materials';
	import { sphere, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { ease, fitOnNarrow } from './three-extras';
	import type * as THREE_NS from 'three';

	type Mode = 'loop' | 'sphere' | 'ball';
	let mode = $state<Mode>('loop');
	let deg = $state(60);
	let other = $state(false);
	// the loop is moved by the timeline below; the figure's own sweep stays off
	const auto = false;

	interface Api {
		set(mode: Mode, deg: number, other: boolean, auto: boolean): void;
	}
	let api = $state.raw<Api | null>(null);
	const RS = 1.45;

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, onFrame, reducedMotion, label } = ctx;
		fitOnNarrow(ctx, 1.15);
		const f = sphere(RS);
		const glass = glassMesh(surfaceGeometry(f, 144, 72), { opacity: 0.72, grid: [36, 18] });
		scene.add(glass);
		const mats = glass.userData.materials as THREE_NS.ShaderMaterial[];

		// latitude loops, cached by whole degrees
		const loops = new Map<number, THREE_NS.Group>();
		const loopAt = (d: number) => {
			if (!loops.has(d)) {
				const v = d / 180;
				const tube = glowTube(new SurfaceCurve(f, (t) => [t, v], 0.014), { color: 'teal', closed: true, radius: 0.028, segments: 128 });
				tube.visible = false;
				loops.set(d, tube);
				scene.add(tube);
			}
			return loops.get(d)!;
		};

		// the void: a soft rose glow inside
		const voidMat = new THREE.ShaderMaterial({
			uniforms: { uColor: { value: shaderColor('rose') }, uI: { value: 0 } },
			vertexShader: /* glsl */ `
				varying vec3 vN; varying vec3 vW;
				void main() {
					vec4 w = modelMatrix * vec4(position, 1.0);
					vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);
					gl_Position = projectionMatrix * viewMatrix * w;
				}`,
			fragmentShader: /* glsl */ `
				uniform vec3 uColor; uniform float uI;
				varying vec3 vN; varying vec3 vW;
				void main() {
					float ndv = abs(dot(normalize(vN), normalize(cameraPosition - vW)));
					float a = (pow(1.0 - ndv, 2.0) * 0.55 + pow(ndv, 3.0) * 0.18) * uI;
					gl_FragColor = vec4(uColor * a, a);
				}`,
			transparent: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		});
		const voidMesh = new THREE.Mesh(new THREE.SphereGeometry(RS * 0.9, 48, 32), voidMat);
		voidMesh.renderOrder = 0;
		scene.add(voidMesh);
		const voidLabel = label([0, 0, 0], `<span class="ui">void</span>`, { className: 'rose tag' });

		// the solid ball: nested translucent shells
		const ball = new THREE.Group();
		[0.98, 0.76, 0.54, 0.32].forEach((k, i) => {
			const m = new THREE.Mesh(new THREE.SphereGeometry(RS * k, 40, 28), faceMaterial('teal', 0.1 + 0.03 * i));
			m.renderOrder = 1;
			ball.add(m);
		});
		scene.add(ball);
		const ballLabel = label([0, 0, 0], `<span class="ui">solid ball</span>`, { className: 'teal tag' });
		const loopLabel = label([0, 0, 0], tex('\\gamma'), { className: 'teal' });

		let cur = { mode: 'loop' as Mode, deg: 60, other: false, auto: true };
		let shownDeg = 60;
		let t0 = performance.now();
		let voidI = 0;
		let ballI = 0;

		const setCap = (d: number, otherCap: boolean, on: boolean) => {
			const v = d / 180;
			for (const m of mats) {
				m.uniforms.uHighlight.value = on ? 0.72 : 0;
				m.uniforms.uHighlightColor.value = shaderColor('teal');
				m.uniforms.uHighlightRect.value.set(0, 1, otherCap ? v : 0, otherCap ? 1 : v);
			}
		};
		const setTint = (c: string | null, mix: number) => {
			for (const m of mats) {
				if (c) m.uniforms.uTint.value = shaderColor(c);
				m.uniforms.uTintMix.value = mix;
			}
		};

		let lastDeg = -1;
		function showLoop(d: number) {
			const dd = Math.max(8, Math.min(172, Math.round(d)));
			if (dd !== lastDeg) {
				if (lastDeg >= 0) loopAt(lastDeg).visible = false;
				loopAt(dd).visible = cur.mode === 'loop';
				lastDeg = dd;
				const th = (dd / 180) * Math.PI;
				loopLabel.position.set(0, RS * Math.cos(th), RS * Math.sin(th) + 0.18);
			} else loopAt(dd).visible = cur.mode === 'loop';
			setCap(dd, cur.other, cur.mode === 'loop');
		}

		onFrame((_, dt) => {
			if (cur.mode === 'loop') {
				if (cur.auto && !reducedMotion) {
					const T = 11;
					const x = (((performance.now() - t0) / 1000 + T * 0.14) % T) / T;
					const s = x < 0.5 ? ease(x * 2) : 1 - ease((x - 0.5) * 2);
					shownDeg = 28 + s * 104;
				} else shownDeg += (cur.deg - shownDeg) * (reducedMotion ? 1 : 0.2);
				showLoop(shownDeg);
			}
			const vT = cur.mode === 'sphere' ? 1 : 0;
			const bT = cur.mode === 'ball' ? 1 : 0;
			const k = reducedMotion ? 1 : Math.min(1, dt * 4);
			voidI += (vT - voidI) * k;
			ballI += (bT - ballI) * k;
			voidMat.uniforms.uI.value = voidI * (0.85 + 0.15 * Math.sin(performance.now() / 600));
			voidMesh.visible = voidI > 0.01;
			ball.visible = ballI > 0.01;
			ball.scale.setScalar(0.85 + 0.15 * ballI);
			ball.children.forEach((c, i) => (((c as THREE_NS.Mesh).material as THREE_NS.MeshBasicMaterial).opacity = (0.1 + 0.03 * i) * ballI));
		});

		api = {
			set(mode, deg, other, auto) {
				const wasAuto = cur.auto;
				cur = { mode, deg, other, auto };
				if (auto && !wasAuto) t0 = performance.now();
				if (!auto && wasAuto) shownDeg = deg;
				for (const t of loops.values()) t.visible = false;
				lastDeg = -1;
				loopLabel.show(mode === 'loop');
				voidLabel.show(mode === 'sphere');
				ballLabel.show(mode === 'ball');
				if (mode === 'loop') {
					setTint(null, 0);
					showLoop(auto ? shownDeg : deg);
				} else {
					setCap(0, false, false);
					setTint(mode === 'sphere' ? 'gold' : 'teal', mode === 'sphere' ? 0.3 : 0.22);
				}
				invalidate();
			}
		};
		api.set(mode, deg, other, auto);
		return { dispose: () => (api = null) };
	}

	$effect(() => {
		const m = mode,
			d = deg,
			o = other,
			a = auto;
		api?.set(m, d, o, a);
	});
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={430}
		animate
		controls={{ autoRotate: true, autoRotateSpeed: 0.3 }}
		camera={{ position: [0, 1.6, 6.1], fov: 38 }}
		label="A transparent sphere. In loop mode a circle of latitude moves up and down and the cap it encloses is shaded teal. In sphere mode the whole surface glows gold around a rose void; in ball mode the inside is filled with a teal solid."
	/>

	<div class="readout ui" aria-live="polite">
		{#if mode === 'loop'}
			<p>
				<span class="badge teal">bounds</span> Wherever the loop is, it is the rim of a cap — {other ? 'the lower' : 'the upper'} cap is shaded. Flip the toggle:
				it bounds the <b>other</b> cap too. On a sphere there is no loop that bounds nothing.
			</p>
		{:else if mode === 'sphere'}
			<p>
				<span class="badge gold">2-cycle</span> Take the whole surface at once. It has no rim at all, so it is a <b>2-cycle</b>. Is it the boundary of
				something? Not in the sphere: the only thing it could bound is the solid inside, and that is not part of the space. The empty inside is a
				<b class="rose">void</b> — a 2-dimensional hole.
			</p>
		{:else}
			<p>
				<span class="badge teal">bounds</span> Now fill the inside in. In the solid ball the sphere is the boundary of the solid, so the void is gone —
				just as filling a triangle killed a 1-dimensional hole.
			</p>
		{/if}
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			label="What to look at"
			options={[
				{ value: 'loop', label: 'A loop' },
				{ value: 'sphere', label: 'The whole sphere' },
				{ value: 'ball', label: 'Fill the inside' }
			]}
		/>
		{#if mode === 'loop'}
			<Timeline bind:value={deg} min={10} max={170} loop duration={4} from="north" to="south" label="Sweeping the loop down the sphere" />
			<Toggle bind:checked={other} label="Other cap" />
		{/if}
	</Controls>
</div>

<style>
	.readout {
		padding: 0.3rem 1.2rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		min-height: 4.2rem;
	}
	.readout p {
		margin: 0;
		line-height: 1.6;
	}
	.readout b {
		color: var(--ink-bright);
	}
	.readout b.rose {
		color: var(--rose);
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		margin-right: 0.35rem;
	}
	.badge.teal {
		color: #062320;
		background: var(--teal);
	}
	.badge.gold {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
	}
</style>
