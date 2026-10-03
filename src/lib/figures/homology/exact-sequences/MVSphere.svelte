<script lang="ts">
	// Mayer–Vietoris for the sphere: two contractible caps U, V overlapping in a
	// band ≃ S¹. The table fills in step by step; the connecting map sends the
	// sphere (north cap + south cap) to the boundary of the north cap.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { iridescent, glowTube } from '$lib/three/materials';
	import { sphere, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import MVTable, { type MVRow } from './MVTable.svelte';
	import { fitCamera, isNarrow } from '../invariance/three-fit';
	import type * as THREE_NS from 'three';

	let step = $state(0);
	let narrow = $state(false);
	onMount(() => {
		narrow = isNarrow();
	});
	let api: { setStep(s: number): void } | null = null;

	const labels = ['The sphere', 'U: the northern cap', 'V: the southern cap', 'U ∩ V: a band', 'What we know', 'Exactness gives H₂', 'And H₁'];
	const notes = [
		String.raw`X = S^2,\ \text{cut into two overlapping caps.}`,
		String.raw`U \text{ is a disk, so contractible: } H_0(U) = \mathbb Z,\ \text{all else } 0.`,
		String.raw`V \text{ is a disk too: } H_0(V)=\mathbb Z,\ \text{all else } 0.`,
		String.raw`U\cap V \text{ is an annulus} \simeq S^1:\ H_0 = H_1 = \mathbb Z.`,
		String.raw`\text{Fill in everything except } H_*(S^2).`,
		String.raw`0 \to H_2(S^2) \xrightarrow{\ \partial\ } H_1(U\cap V)\cong\mathbb Z \to 0:\ \ H_2(S^2)\cong\mathbb Z.`,
		String.raw`0 \to H_1(S^2) \xrightarrow{\ \partial\ } H_0(U\cap V) \xrightarrow{\ \Phi\ } \mathbb Z^2 \text{ with } \Phi \text{ injective: } H_1(S^2) = 0.`
	];

	const rows = $derived<MVRow[]>([
		{
			n: 2,
			cells: [
				{ tex: '0', shown: step >= 4 },
				{ tex: '0', shown: step >= 4 },
				{ tex: '\\mathbb Z', shown: step >= 5, hl: step === 5 ? 'gold' : undefined }
			]
		},
		{
			n: 1,
			cells: [
				{ tex: '\\mathbb Z', shown: step >= 3, hl: step === 3 || step === 5 ? 'gold' : undefined },
				{ tex: '0', shown: step >= 4 },
				{ tex: '0', shown: step >= 6, hl: step === 6 ? 'green' : undefined }
			]
		},
		{
			n: 0,
			cells: [
				{ tex: '\\mathbb Z', shown: step >= 3, hl: step === 6 ? 'teal' : undefined },
				{ tex: '\\mathbb Z^2', shown: step >= 1, hl: step === 1 || step === 2 ? 'violet' : undefined },
				{ tex: '\\mathbb Z', shown: step >= 4 }
			]
		}
	]);

	const RS = 1.35;
	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, label, onFrame, reducedMotion } = ctx;
		const unfit = fitCamera(ctx, 1.4);
		const cap = (v0: number, v1: number, r: number) => (u: number, v: number, t: THREE_NS.Vector3) => sphere(r)(u, v0 + (v1 - v0) * v, t);
		const mk = (fn: ReturnType<typeof cap>, tint: string, nv: number) => {
			const g = new THREE.Group();
			const geo = surfaceGeometry(fn, 96, nv);
			const back = new THREE.Mesh(geo, iridescent({ opacity: 0.5, tint, tintMix: 0.55, grid: [24, Math.round(nv / 3)], gridStrength: 0.2, side: THREE.BackSide, depthWrite: false, brightness: 0.75 }));
			const front = new THREE.Mesh(geo, iridescent({ opacity: 0.5, tint, tintMix: 0.55, grid: [24, Math.round(nv / 3)], gridStrength: 0.2, side: THREE.FrontSide, depthWrite: false }));
			back.renderOrder = 1;
			front.renderOrder = 2;
			g.add(back, front);
			return { g, mats: [back.material as THREE_NS.ShaderMaterial, front.material as THREE_NS.ShaderMaterial] };
		};
		const U = mk(cap(0, 0.62, RS), 'blue', 40);
		const V = mk(cap(0.38, 1, RS * 1.004), 'violet', 40);
		const B = mk(cap(0.38, 0.62, RS * 1.01), 'gold', 16);
		scene.add(U.g, V.g, B.g);
		const eq = glowTube(new SurfaceCurve(sphere(RS * 1.012), (q) => [q, 0.5], 0), { color: 'gold', closed: true, radius: 0.022 });
		scene.add(eq);
		const lU = label([1.25, 1.35, 0.4], tex('U'), { className: 'blue' });
		const lV = label([1.25, -1.35, 0.4], tex('V'), { className: 'violet' });
		const lB = label([1.95, 0, 0.3], tex('U\\cap V'), { className: 'gold' });
		const lD = label([-1.2, 0.2, 1.3], tex('\\partial u = \\text{equator}'), { className: 'gold small' });

		// animated state
		let explode = 0;
		let target = { explode: 0, u: 0.5, v: 0.5, b: 0.35, eq: 0 };
		const cur = { ...target };
		const setOpacity = (o: { mats: THREE_NS.ShaderMaterial[] }, a: number, tint: number) => {
			for (const m of o.mats) {
				m.uniforms.uOpacity.value = a;
				m.uniforms.uTintMix.value = tint;
			}
		};
		function setStep(s: number) {
			const T = [
				{ explode: 0, u: 0.42, v: 0.42, b: 0.0, eq: 0 },
				{ explode: 0.55, u: 0.62, v: 0.12, b: 0.0, eq: 0 },
				{ explode: 0.55, u: 0.14, v: 0.62, b: 0.0, eq: 0 },
				{ explode: 0.55, u: 0.14, v: 0.14, b: 0.75, eq: 1 },
				{ explode: 0.55, u: 0.42, v: 0.42, b: 0.6, eq: 1 },
				{ explode: 0, u: 0.7, v: 0.12, b: 0.0, eq: 1 },
				{ explode: 0, u: 0.4, v: 0.4, b: 0.3, eq: 0.5 }
			];
			target = T[s] ?? T[0];
			if (reducedMotion) Object.assign(cur, target);
			lU.show(s >= 1 && s !== 3);
			lV.show(s >= 2 && s !== 5 && s !== 3);
			lB.show(s >= 3 && s <= 4);
			lD.show(s === 5);
			invalidate();
		}
		setStep(step);
		api = { setStep };

		const stop = onFrame((_t, dt) => {
			const k = 1 - Math.exp(-dt * 5);
			cur.explode += (target.explode - cur.explode) * k;
			cur.u += (target.u - cur.u) * k;
			cur.v += (target.v - cur.v) * k;
			cur.b += (target.b - cur.b) * k;
			cur.eq += (target.eq - cur.eq) * k;
			explode = cur.explode;
			U.g.position.y = explode;
			V.g.position.y = -explode;
			setOpacity(U, 0.12 + 0.6 * cur.u, 0.25 + 0.55 * cur.u);
			setOpacity(V, 0.12 + 0.6 * cur.v, 0.25 + 0.55 * cur.v);
			setOpacity(B, 0.05 + 0.75 * cur.b, 0.3 + 0.6 * cur.b);
			B.g.visible = cur.b > 0.02;
			eq.visible = cur.eq > 0.05;
			eq.traverse((o) => {
				const m = (o as THREE_NS.Mesh).material as THREE_NS.ShaderMaterial | undefined;
				if (m?.uniforms?.uIntensity) m.uniforms.uIntensity.value = 0.2 + 1.0 * cur.eq;
			});
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
		const v = step;
		api?.setStep(v);
	});
</script>

<div class="mvs">
	<div class="grid">
		<div class="scene">
			<Scene3D
				{setup}
				height={narrow ? 320 : 400}
				animate
				controls={{ autoRotate: false }}
				camera={{ position: [0, 1.3, 5.5], target: [0, 0, 0] }}
				label="A sphere split into a northern cap U, a southern cap V and their overlap, a band around the equator"
			/>
		</div>
	</div>
	<MVTable {rows} heads={['H_n(U\\cap V)', 'H_n(U)\\oplus H_n(V)', 'H_n(S^2)']} hlConnect={step === 5 ? 2 : step === 6 ? 1 : null} />
	<div class="note"><TeX tex={notes[step]} /></div>
	<Controls>
		<StepControls bind:step count={labels.length} {labels} interval={2800} />
	</Controls>
</div>

<style>
	.note {
		text-align: center;
		padding: 0 1rem 0.7rem;
		min-height: 2.2rem;
		font-size: 0.98rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
</style>
