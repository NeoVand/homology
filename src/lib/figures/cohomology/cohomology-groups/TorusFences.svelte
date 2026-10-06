<script lang="ts">
	// Figure: a 1-cocycle on the torus drawn as a fence standing on the surface.
	// Its value on a closed loop is the number of times the loop crosses the fence,
	// counted with sign. Wiggling the fence (adding a coboundary) can add crossings,
	// but only in cancelling pairs; a fence that encloses a disk measures 0 on every loop.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import type * as THREE_NS from 'three';
	import { glassMesh, glowTube, glowPoint, disposeTree, color } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { crossings, fencePathOf, loopPathOf, windings, MAX_WIGGLE, type FenceKind, type LoopKind } from './torusFences';

	let fence = $state<FenceKind>('alpha');
	let loop = $state<LoopKind>('p1q0');
	let wiggle = $state(0);

	const A = $derived(fence === 'small' ? 0 : MAX_WIGGLE * wiggle);
	const X = $derived(crossings({ kind: fence, A }, loop));
	const total = $derived(X.reduce((s, x) => s + x.sign, 0));
	const name = $derived(fence === 'alpha' ? '\\alpha' : fence === 'beta' ? '\\beta' : '\\delta g');
	const sumTeX = $derived(
		`\\langle ${name}, \\gamma \\rangle = ` +
			(X.length ? X.map((x) => (x.sign > 0 ? '(+1)' : '(-1)')).join(' + ') + ' = ' : '') +
			total
	);
	const pq = $derived(windings(loop));

	type Api = { update(kind: FenceKind, l: LoopKind, amp: number, xs: { t: number; sign: 1 | -1 }[]): void };
	let api = $state.raw<Api | null>(null);

	function setup(ctx: SceneContext) {
		const { THREE, scene, invalidate, label } = ctx;
		const F = torus(1.6, 0.62);
		scene.add(glassMesh(surfaceGeometry(F, 180, 72), { opacity: 0.6, grid: [32, 12], gridStrength: 0.2, film: 1.2 }));

		const wrap = (x: number) => ((x % 1) + 1) % 1;
		const P = new THREE.Vector3();
		const N = new THREE.Vector3();
		// for this torus parametrisation surfaceNormal() points into the tube; flip it
		const outward = (u: number, v: number, out = new THREE.Vector3()) => surfaceNormal(F, wrap(u), wrap(v), out).negate();
		function surfacePoint(u: number, v: number, lift: number, out = new THREE.Vector3()) {
			F(wrap(u), wrap(v), out);
			outward(u, v, N);
			return out.addScaledVector(N, lift);
		}

		/** A translucent fence standing on the surface along a closed path, with a glowing top rail. */
		function fenceRibbon(path: (s: number) => [number, number], col: 'rose' | 'teal') {
			const g = new THREE.Group();
			const n = 260;
			const h = 0.16;
			const pos = new Float32Array((n + 1) * 2 * 3);
			const top: THREE_NS.Vector3[] = [];
			for (let i = 0; i <= n; i++) {
				const [u, v] = path(i / n);
				surfacePoint(u, v, 0.006, P);
				const Nn = outward(u, v);
				pos.set([P.x, P.y, P.z], i * 6);
				const T = P.clone().addScaledVector(Nn, h);
				pos.set([T.x, T.y, T.z], i * 6 + 3);
				if (i < n) top.push(T);
			}
			const idx: number[] = [];
			for (let i = 0; i < n; i++) {
				const a = 2 * i;
				idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
			}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
			geo.setIndex(idx);
			const mesh = new THREE.Mesh(
				geo,
				new THREE.MeshBasicMaterial({ color: color(col), transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false })
			);
			mesh.renderOrder = 3;
			g.add(mesh);
			g.add(glowTube(new THREE.CatmullRomCurve3(top, true), { color: col, radius: 0.014, haloScale: 3, segments: 260 }));
			// the foot of the fence, on the surface (negative offset = outwards for this torus)
			g.add(glowTube(new SurfaceCurve(F, path, -0.008), { color: col, radius: 0.01, halo: false, segments: 260, closed: true }));
			return { group: g, top };
		}

		let fenceObj: THREE_NS.Object3D | null = null;
		let loopObj: THREE_NS.Object3D | null = null;
		let marks: THREE_NS.Group | null = null;
		let labels: LabelHandle[] = [];
		let fenceLabel: LabelHandle | null = null;

		const remove = (o: THREE_NS.Object3D | null) => {
			if (!o) return;
			scene.remove(o);
			disposeTree(o);
		};

		let last = { kind: '' as string, A: -1, loop: '' as string };
		api = {
			update(kind, l, amp, xs) {
				if (kind !== last.kind || amp !== last.A) {
					remove(fenceObj);
					fenceLabel?.remove();
					const col = kind === 'small' ? 'teal' : 'rose';
					const path = fencePathOf({ kind, A: amp });
					const { group, top } = fenceRibbon(path, col);
					fenceObj = group;
					scene.add(group);
					// a spot on the fence that faces the default camera, away from the loops
					const s0 = kind === 'beta' ? 0.04 : kind === 'alpha' ? 0.36 : 0.12;
					const at = top[Math.floor(top.length * s0)];
					const [u, v] = path(s0);
					fenceLabel = label(at.clone().addScaledVector(outward(u, v), 0.16), tex(kind === 'alpha' ? '\\alpha' : kind === 'beta' ? '\\beta' : '\\delta g'), {
						className: col,
						normal: outward(u, v)
					});
				}
				if (l !== last.loop) {
					remove(loopObj);
					loopObj = glowTube(new SurfaceCurve(F, loopPathOf(l), -0.02), { color: 'gold', radius: 0.03, closed: true, segments: 320 });
					scene.add(loopObj);
				}
				last = { kind, A: amp, loop: l };
				// crossing markers
				remove(marks);
				for (const lb of labels) lb.remove();
				labels = [];
				marks = new THREE.Group();
				const lp = loopPathOf(l);
				for (const x of xs) {
					const [u, v] = lp(x.t);
					const p = surfacePoint(u, v, 0.03);
					marks.add(glowPoint(p.clone(), { color: x.sign > 0 ? 'teal' : 'amber', size: 0.05, halo: 7 }));
					const nrm = outward(u, v);
					labels.push(
						label(surfacePoint(u, v, 0.3), x.sign > 0 ? '+1' : '−1', { className: x.sign > 0 ? 'teal' : 'rose', normal: nrm })
					);
				}
				scene.add(marks);
				invalidate();
			}
		};
		return {
			dispose: () => {
				api = null;
			}
		};
	}

	$effect(() => {
		const args = [fence, loop, A, X] as const;
		api?.update(...args);
	});
</script>

<Scene3D
	{setup}
	height={460}
	camera={{ position: [0.4, 3.5, 4.9], target: [0, -0.15, 0], fov: 38 }}
	controls={{ zoom: false }}
	label="A torus with a glowing fence standing on it and a golden loop; the number of times the loop crosses the fence, counted with sign, is the value of the cocycle on the loop."
>
	<div class="hud ui">
		<div class="row1"><TeX tex={sumTeX} /></div>
		<div class="row2">
			{#if loop === 'small'}the loop γ bounds a little disk{:else}the loop γ goes {pq[0]}× around the hole and {pq[1]}× around the tube{/if}
		</div>
	</div>
</Scene3D>
<Controls>
	<div class="row">
		<span class="lbl ui">Fence</span>
		<Segmented
			bind:value={fence}
			options={[
				{ value: 'alpha', label: 'α: across the tube' },
				{ value: 'beta', label: 'β: along the tube' },
				{ value: 'small', label: 'a fence around a disk' }
			]}
			label="Which fence"
		/>
	</div>
	<div class="row">
		<span class="lbl ui">Loop</span>
		<Segmented
			bind:value={loop}
			options={[
				{ value: 'p1q0', label: 'around the hole' },
				{ value: 'p0q1', label: 'around the tube' },
				{ value: 'p1q1', label: 'diagonal (1,1)' },
				{ value: 'p2q1', label: '(2,1)' },
				{ value: 'small', label: 'a small loop' }
			]}
			label="Which loop"
		/>
	</div>
	{#if fence !== 'small'}
		<div class="row">
			<Slider bind:value={wiggle} min={0} max={1} step={0.01} label="Wiggle the fence (add a coboundary)" format={(v) => `${Math.round(v * 100)}%`} />
		</div>
	{/if}
</Controls>

<style>
	.hud {
		position: absolute;
		left: 1rem;
		top: 0.9rem;
		padding: 0.55rem 0.8rem 0.6rem;
		border-radius: 10px;
		background: rgba(6, 10, 20, 0.66);
		border: 1px solid var(--line-faint);
		backdrop-filter: blur(4px);
		pointer-events: none;
		max-width: calc(100% - 2rem);
	}
	.row1 {
		color: var(--ink-bright);
		font-size: 1rem;
	}
	.row2 {
		font-size: 0.72rem;
		color: var(--ink-dim);
		margin-top: 0.15rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.8rem;
		width: 100%;
	}
	.lbl {
		font-size: 0.74rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-faint);
		min-width: 3.2rem;
	}
</style>
