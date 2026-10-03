<script lang="ts">
	// Figure: the simplices Δ⁰ … Δ⁴ in 3D. Choosing a face dimension counts the
	// faces one by one; the count is the matching entry of Pascal's triangle.
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { iridescent, disposeTree, setGlowColor } from '$lib/three/materials';
	import { tex } from '$lib/katex/render';
	import PascalTriangle from './PascalTriangle.svelte';
	import { binom, simplexComplex, simplexPositions } from './data';
	import { edgeTube, vertexBead, setPointColor, polygonGeometry, fitCamera } from './kit3d';

	let n = $state(3);
	let k = $state(1);
	let lit = $state(0);
	let reduced = $state(false);
	let replay = $state(0);

	const names = ['a point', 'an edge', 'a triangle', 'a tetrahedron', 'a 4-simplex'];
	const faceWords = [
		['vertex', 'vertices'],
		['edge', 'edges'],
		['triangle', 'triangles'],
		['tetrahedron', 'tetrahedra'],
		['4-simplex', '4-simplices']
	];
	const total = $derived(binom(n + 1, k + 1));

	$effect(() => {
		if (k > n) k = n;
	});

	type Api = { show(n: number, k: number, lit: number): void };
	let api = $state.raw<Api | null>(null);

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	// count the faces one at a time once the figure is alive
	$effect(() => {
		const T = total;
		void replay;
		if (!api) return;
		if (reduced) {
			lit = T;
			return;
		}
		lit = 0;
		let i = 0;
		const id = setInterval(
			() => {
				i++;
				lit = i;
				if (i >= T) clearInterval(id);
			},
			T > 6 ? 190 : 320
		);
		return () => clearInterval(id);
	});

	$effect(() => {
		api?.show(n, k, lit);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate, label } = ctx;
		const offFit = fitCamera(ctx, 1.8);
		let root: THREE.Group | null = null;
		let builtN = -1;
		let verts: THREE.Group[] = [];
		let edges: THREE.Group[] = [];
		let overlays: THREE.Mesh[] = [];
		let K = simplexComplex(0);
		let P: THREE.Vector3[] = [];
		let vLabels: LabelHandle[] = [];
		let faceLabel: LabelHandle | null = null;

		function build(nn: number) {
			if (root) {
				scene.remove(root);
				disposeTree(root);
			}
			vLabels.forEach((l) => l.remove());
			faceLabel?.remove();
			faceLabel = null;
			root = new THREE.Group();
			K = simplexComplex(nn);
			// tilt the shape so no face is seen exactly edge-on
			const tilt = new THREE.Euler(0.38, 0.62, 0.08);
			P = simplexPositions(nn).map((p) => new THREE.Vector3(...p).applyEuler(tilt));
			const c = P.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / P.length);
			// faces: faint glass plus a highlight overlay each
			overlays = [];
			for (const t of K.simplices[2] ?? []) {
				const g = polygonGeometry(t.map((v) => P[v]));
				const glass = new THREE.Mesh(
					g,
					iridescent({ opacity: nn === 4 ? 0.12 : 0.24, grid: [0, 0], film: 1.3, rim: 0.35, depthWrite: false })
				);
				glass.renderOrder = 1;
				const ov = new THREE.Mesh(
					g,
					new THREE.MeshBasicMaterial({
						color: 0xf2d08f,
						transparent: true,
						opacity: 0,
						side: THREE.DoubleSide,
						depthWrite: false,
						blending: THREE.AdditiveBlending
					})
				);
				ov.renderOrder = 3;
				root.add(glass, ov);
				overlays.push(ov);
			}
			edges = (K.simplices[1] ?? []).map(([a, b]) => {
				const e = edgeTube(P[a], P[b], { radius: 0.022, intensity: 0.75 });
				root!.add(e);
				return e;
			});
			verts = P.map((p) => {
				const g = vertexBead(p, 'ivory', 0.06);
				root!.add(g);
				return g;
			});
			vLabels = P.map((p, i) => {
				const out = p.clone().sub(c);
				if (out.lengthSq() < 1e-6) out.set(0.25, 0.3, 0);
				out.setLength(0.3);
				return label(p.clone().add(out), tex(String(i)), { className: 'small' });
			});
			scene.add(root);
			builtN = nn;
		}

		function paint(kk: number, litN: number) {
			// base look
			verts.forEach((g) => {
				setPointColor(g, 0xd9d2bf, 1);
				g.scale.setScalar(1);
			});
			edges.forEach((e) => setGlowColor(e, 0xbdb6a4, 0.7));
			overlays.forEach((o) => ((o.material as THREE.MeshBasicMaterial).opacity = 0));
			const faces = K.simplices[kk] ?? [];
			const triIndex = (t: number[]) => K.indexOf(t);
			const edgeIndex = (e: number[]) => K.indexOf(e);
			for (let i = 0; i < Math.min(litN, faces.length); i++) {
				const s = faces[i];
				const current = i === litN - 1;
				if (kk === 0) {
					setPointColor(verts[s[0]], current ? 'goldPale' : 'gold', current ? 1.6 : 1.15);
					verts[s[0]].scale.setScalar(current ? 1.55 : 1.2);
				} else {
					// edges of the face
					for (let a = 0; a < s.length; a++)
						for (let b = a + 1; b < s.length; b++) {
							const e = edges[edgeIndex([s[a], s[b]])];
							if (e) setGlowColor(e, current ? 'goldPale' : 'gold', current ? 2.0 : 1.15);
						}
					for (const v of s) setPointColor(verts[v], 'gold', current ? 1.5 : 1.1);
					// triangles of the face
					if (kk >= 2) {
						for (let a = 0; a < s.length; a++)
							for (let b = a + 1; b < s.length; b++)
								for (let d = b + 1; d < s.length; d++) {
									const o = overlays[triIndex([s[a], s[b], s[d]])];
									if (!o) continue;
									const m = o.material as THREE.MeshBasicMaterial;
									m.opacity = Math.max(m.opacity, current ? (kk === 2 ? 0.34 : 0.16) : kk === 2 ? 0.12 : 0.05);
								}
					}
				}
			}
			// label the face being counted
			faceLabel?.remove();
			faceLabel = null;
			if (litN > 0 && litN <= faces.length) {
				const s = faces[litN - 1];
				const cen = s.reduce((a, v) => a.add(P[v]), new THREE.Vector3()).multiplyScalar(1 / s.length);
				const all = P.reduce((a, p) => a.add(p), new THREE.Vector3()).multiplyScalar(1 / P.length);
				const out = cen.clone().sub(all);
				const pos = out.lengthSq() < 1e-4 ? cen.clone().add(new THREE.Vector3(0, -0.45, 0)) : cen.clone().add(out.setLength(kk === 0 ? 0.55 : 0.45));
				faceLabel = label(pos, tex(`\\{${s.join(',')}\\}`), { className: 'gold' });
			}
			invalidate();
		}

		api = {
			show(nn, kk, litN) {
				if (nn !== builtN) build(nn);
				paint(Math.min(kk, nn), litN);
			}
		};
		api.show(n, k, lit);
		return {
			dispose() {
				offFit();
				api = null;
			}
		};
	}

	const nOptions = [0, 1, 2, 3, 4].map((v) => ({ value: v, label: `Δ${'⁰¹²³⁴'[v]}` }));
</script>

<div class="gallery">
	<div class="stage">
		<Scene3D
			{setup}
			height={400}
			camera={{ position: [0.4, 0.7, 5.6], fov: 38 }}
			controls={{ autoRotate: true, autoRotateSpeed: 0.55 }}
			label="A simplex drawn in 3D with its faces of one dimension lit up one at a time while they are counted"
		/>
	</div>
	<div class="side ui">
		<div class="title">
			<TeX tex={`\\Delta^{${n}}`} /> is {names[n]}
		</div>
		<ul class="fv" aria-label="Faces of each dimension">
			{#each Array(n + 1) as _, d (d)}
				<li>
					<button class:on={d === k} onclick={() => (k = d)}>
						<span class="num">{binom(n + 1, d + 1)}</span>
						{faceWords[d][binom(n + 1, d + 1) === 1 ? 0 : 1]}
					</button>
				</li>
			{/each}
		</ul>
		<div class="count" aria-live="polite">
			<TeX tex={`\\binom{${n + 1}}{${k + 1}} = ${total}`} />
			<span class="prog">counted {Math.min(lit, total)} of {total}</span>
		</div>
		<PascalTriangle bind:n bind:k />
		<p class="cap">Row {n + 1} of Pascal’s triangle lists the faces of <TeX tex={`\\Delta^{${n}}`} />. Tap an entry.</p>
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={n} options={nOptions} label="Dimension of the simplex" />
	<Button variant="ghost" onclick={() => replay++}>Count again</Button>
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
		align-items: center;
	}
	.side {
		padding: 1rem 1.2rem 0.6rem 0.4rem;
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.title {
		font-family: var(--font-elegant);
		font-size: 1.25rem;
		color: var(--ink-bright);
	}
	.fv {
		list-style: none;
		margin: 0;
		padding: 0 !important;
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.fv li::before {
		display: none;
	}
	.fv li {
		margin: 0;
	}
	.fv button {
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
		border-radius: 999px;
		color: var(--ink-dim);
		font-size: 0.76rem;
		padding: 0.28rem 0.7rem;
		cursor: pointer;
		transition: all 0.2s var(--ease);
		min-height: 32px;
	}
	.fv button:hover {
		color: var(--ink-bright);
		border-color: var(--line);
	}
	.fv button.on {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		border-color: transparent;
		font-weight: 600;
	}
	.num {
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}
	.count {
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
		color: var(--gold-bright);
		font-size: 1.05rem;
	}
	.prog {
		font-size: 0.72rem;
		color: var(--ink-faint);
		letter-spacing: 0.04em;
	}
	.cap {
		font-size: 0.74rem;
		color: var(--ink-faint);
		margin: 0 !important;
		text-align: center;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.7rem 1rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	@media (max-width: 760px) {
		.gallery {
			grid-template-columns: minmax(0, 1fr);
		}
		.side {
			padding: 0.2rem 1rem 0.8rem;
		}
	}
</style>
