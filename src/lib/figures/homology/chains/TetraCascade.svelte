<script lang="ts">
	// Figure 3.2.3 — the boundary of a boundary, in 3D. A solid tetrahedron
	// σ = [0,1,2,3] explodes into its four faces (∂σ); each face shows its three
	// edges (∂∂σ, twelve edge-copies); the copies pair up — every edge occurs in
	// exactly two faces — and cancel. With signs, the two copies of an edge point
	// in opposite directions.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowCore, glowHalo, glowPoint, color, type PaletteName } from '$lib/three/materials';
	import { solids } from '$lib/three/complex3d';
	import { tex } from '$lib/katex/render';
	import { tetraCascade } from './chains';
	import { fitOnNarrow } from '../cycles-and-boundaries/three-extras';
	import type * as THREE_NS from 'three';

	let step = $state(0);
	let mode = $state<'z2' | 'z'>('z');

	const labels = ['σ: a solid tetrahedron', '∂σ: its four faces', '∂∂σ: the edges of each face', 'each edge appears twice', 'and the pairs cancel'];

	interface Api {
		set(step: number, mode: 'z2' | 'z'): void;
	}
	let api = $state.raw<Api | null>(null);

	const pairColors: PaletteName[] = ['gold', 'blue', 'rose', 'green', 'amber', 'violet'];

	function setup(ctx: SceneContext) {
		const { scene, THREE, invalidate, onFrame, reducedMotion, label } = ctx;
		fitOnNarrow(ctx, 1.2);
		const P = solids.tetrahedron(1.45);
		const cascade = tetraCascade();
		const edgeKey = (e: number[]) => e.join(',');
		const edgeList = ['0,1', '0,2', '0,3', '1,2', '1,3', '2,3'];

		// ── the solid tetrahedron ──
		const solid = new THREE.Group();
		const solidGeo = new THREE.BufferGeometry();
		const sArr: number[] = [];
		for (const f of cascade) for (const v of f.face) sArr.push(P[v].x, P[v].y, P[v].z);
		solidGeo.setAttribute('position', new THREE.Float32BufferAttribute(sArr, 3));
		const solidMat = new THREE.MeshBasicMaterial({ color: color('violet'), transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
		const solidMesh = new THREE.Mesh(solidGeo, solidMat);
		solidMesh.renderOrder = 1;
		solid.add(solidMesh);
		const solidEdgeMats: THREE_NS.ShaderMaterial[] = [];
		for (const ek of edgeList) {
			const [a, b] = ek.split(',').map(Number);
			const m = glowCore('violet', 1.1, 0.999);
			solidEdgeMats.push(m);
			const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(P[a], P[b]), 1, 0.022, 8), m);
			tube.renderOrder = 5;
			solid.add(tube);
		}
		scene.add(solid);
		const vPoints = new THREE.Group();
		for (let v = 0; v < 4; v++) vPoints.add(glowPoint(P[v].clone(), { color: 'gold', size: 0.05, halo: 7 }));
		scene.add(vPoints);
		const vLabels = P.map((p, v) => label(p.clone().multiplyScalar(1.17), tex(String(v)), { className: 'small' }));

		// ── the four faces, each with its three edge-copies ──
		const coneGeo = new THREE.ConeGeometry(0.06, 0.18, 14);
		const up = new THREE.Vector3(0, 1, 0);
		interface Copy {
			edge: string;
			core: THREE_NS.ShaderMaterial;
			halo: THREE_NS.ShaderMaterial;
			cone: THREE_NS.Mesh;
			coneMat: THREE_NS.ShaderMaterial;
		}
		const copies: Copy[] = [];
		const faces = cascade.map((f) => {
			const g = new THREE.Group();
			const c = new THREE.Vector3();
			for (const v of f.face) c.add(P[v]);
			c.multiplyScalar(1 / 3);
			const n = c.clone().normalize();
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.Float32BufferAttribute(f.face.flatMap((v) => [P[v].x, P[v].y, P[v].z]), 3));
			const mat = new THREE.MeshBasicMaterial({ color: color('teal'), transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
			const mesh = new THREE.Mesh(geo, mat);
			mesh.renderOrder = 2;
			g.add(mesh);
			for (const e of f.edges) {
				const a = P[e.from].clone().lerp(c, 0.2);
				const b = P[e.to].clone().lerp(c, 0.2);
				const curve = new THREE.LineCurve3(a, b);
				const core = glowCore('gold', 1.2, 0.999);
				const halo = glowHalo('gold', 0);
				const t1 = new THREE.Mesh(new THREE.TubeGeometry(curve, 1, 0.018, 8), core);
				const t2 = new THREE.Mesh(new THREE.TubeGeometry(curve, 1, 0.055, 8), halo);
				t1.renderOrder = 6;
				t2.renderOrder = 7;
				const coneMat = glowCore('gold', 1.3, 0.999);
				const cone = new THREE.Mesh(coneGeo, coneMat);
				cone.position.copy(a).lerp(b, 0.56);
				cone.quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
				cone.renderOrder = 6;
				g.add(t1, t2, cone);
				copies.push({ edge: edgeKey(e.edge), core, halo, cone, coneMat });
			}
			scene.add(g);
			const signTeX = (s: number) => (s > 0 ? '+' : '-');
			const lz = label(c.clone().multiplyScalar(1.9), tex(`${signTeX(f.sign)}[${f.face.join(',')}]`), { className: 'teal small' });
			const l2 = label(c.clone().multiplyScalar(1.9), tex(`[${f.face.join(',')}]`), { className: 'teal small' });
			return { g, n, c, mat, lz, l2 };
		});
		const zero = label([0, 0, 0], tex('\\partial\\partial\\sigma = 0'), { className: 'gold' });

		// ── animation state ──
		const cur = { explode: 0, solid: 1, face: 0, copy: 0, pair: 0 };
		let target = { ...cur };
		let curStep = 0;
		let curMode: 'z2' | 'z' = 'z';
		let cancelStart = 0;

		function targets(s: number) {
			return {
				explode: s === 0 ? 0 : 1.2,
				solid: s === 0 ? 1 : s === 1 ? 0.25 : 0,
				face: s === 0 ? 0 : s === 1 ? 1 : 0.38,
				copy: s >= 2 ? 1 : 0,
				pair: s >= 3 ? 1 : 0
			};
		}
		const showLabels = () => {
			for (const f of faces) {
				f.lz.show(curStep >= 1 && curMode === 'z');
				f.l2.show(curStep >= 1 && curMode === 'z2');
			}
			zero.show(curStep === 4);
			for (const l of vLabels) l.show(curStep === 0);
		};
		const tmpC = new THREE.Color();
		const baseGold = color('gold');

		onFrame((_, dt) => {
			const k = reducedMotion ? 1 : Math.min(1, dt * 3.2);
			for (const key of Object.keys(cur) as (keyof typeof cur)[]) cur[key] += (target[key] - cur[key]) * k;
			for (const f of faces) {
				f.g.position.copy(f.n).multiplyScalar(cur.explode);
				f.mat.opacity = 0.4 * cur.face;
				f.g.visible = cur.face > 0.01 || cur.copy > 0.01;
				f.lz.position.copy(f.c).multiplyScalar(1.15).addScaledVector(f.n, cur.explode + 0.35);
				f.l2.position.copy(f.lz.position);
			}
			solidMat.opacity = 0.32 * cur.solid;
			for (const m of solidEdgeMats) m.uniforms.uOpacity.value = cur.solid;
			solid.visible = cur.solid > 0.01;
			vPoints.visible = cur.solid > 0.2;
			// pair colours and cancellation
			const now = performance.now();
			copies.forEach((cp) => {
				const pairIdx = edgeList.indexOf(cp.edge);
				tmpC.copy(baseGold).lerp(color(pairColors[pairIdx]), cur.pair);
				let a = cur.copy;
				if (curStep === 4) {
					// pairs vanish one after another
					const t = reducedMotion ? 1 : (now - cancelStart) / 1000 - pairIdx * 0.32;
					a *= 1 - Math.min(1, Math.max(0, t / 0.5));
				}
				cp.core.uniforms.uColor.value.copy(tmpC);
				cp.core.uniforms.uOpacity.value = a;
				cp.halo.uniforms.uColor.value.copy(tmpC);
				cp.halo.uniforms.uIntensity.value = 0.9 * a * cur.pair;
				cp.coneMat.uniforms.uColor.value.copy(tmpC);
				cp.coneMat.uniforms.uOpacity.value = a;
				cp.cone.visible = curMode === 'z' && a > 0.01;
			});
		});

		api = {
			set(s, m) {
				if (s === 4 && curStep !== 4) cancelStart = performance.now();
				curStep = s;
				curMode = m;
				target = targets(s);
				showLabels();
				invalidate();
			}
		};
		api.set(step, mode);
		return { dispose: () => (api = null) };
	}

	$effect(() => api?.set(step, mode));
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={430}
		animate
		controls={{ autoRotate: true, autoRotateSpeed: 0.45 }}
		camera={{ position: [1.5, 1.9, 7.0], fov: 38 }}
		label="A tetrahedron with vertices 0 to 3 explodes into its four triangular faces; each face shows its three edges as arrows; the twelve edge copies pair up and vanish."
	/>
	<div class="readout ui" aria-live="polite">
		{#if step === 0}
			<p>A solid tetrahedron <TeX tex={String.raw`\chn{\sigma = [0,1,2,3]}`} /> — a 3-simplex, with four vertices.</p>
		{:else if step === 1}
			<p>
				Its boundary is its four faces:
				{#if mode === 'z'}<TeX tex={String.raw`\bdy{\partial\sigma = [1,2,3] - [0,2,3] + [0,1,3] - [0,1,2]}`} />.{:else}<TeX
						tex={String.raw`\bdy{\partial\sigma = [1,2,3] + [0,2,3] + [0,1,3] + [0,1,2]}`}
					/>.{/if}
			</p>
		{:else if step === 2}
			<p>Now take the boundary of each face: three edges per face, twelve edge-copies in all{mode === 'z' ? ', each with the direction its face gives it' : ''}.</p>
		{:else if step === 3}
			<p>
				But a tetrahedron has only six edges, so every edge appears <b>twice</b> — once in each of the two faces that share it (matching colours).
				{#if mode === 'z'}And the two copies point in <b>opposite</b> directions.{/if}
			</p>
		{:else}
			<p>
				{#if mode === 'z'}Opposite directions cancel: <TeX tex={String.raw`+e - e = 0`} /> for every edge.{:else}Each edge is counted twice, and <TeX
						tex={String.raw`1 + 1 = 0`}
					/> mod 2.{/if}
				Nothing survives: <TeX tex={String.raw`\cyc{\partial\partial\sigma = 0}`} />.
			</p>
		{/if}
	</div>
	<Controls>
		<StepControls bind:step count={5} {labels} interval={2600} />
		<Segmented
			bind:value={mode}
			label="Coefficients"
			options={[
				{ value: 'z2', label: 'mod 2' },
				{ value: 'z', label: 'with signs' }
			]}
		/>
	</Controls>
</div>

<style>
	.readout {
		padding: 0.3rem 1.2rem 0.6rem;
		font-size: 0.88rem;
		color: var(--ink-dim);
		min-height: 3.8rem;
	}
	.readout p {
		margin: 0;
		line-height: 1.6;
	}
	.readout b {
		color: var(--ink-bright);
	}
</style>
