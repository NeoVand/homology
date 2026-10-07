<script lang="ts">
	// Figure: the square torus cut into an n × n grid of triangles, drawn flat
	// (with its sides glued) and on a torus in space. For n = 3 this is a
	// simplicial complex; for n = 2 different edges share the same endpoints.
	import * as THREE from 'three';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowTube, setGlowColor, disposeTree } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { gridPieces, gridDefects, gridLabel, binom } from './data';
	import { vertexBead, setPointColor, surfaceTriangle, fitCamera } from './kit3d';
	import Mark from '$lib/components/ui/Mark.svelte';

	let n = $state(3);
	let hoverLabel = $state<number | null>(null);
	let problem = $state(0);
	let cw = $state(420);
	const k = $derived(cw < 400 ? 1.28 : 1);

	const pieces = $derived(gridPieces(n));
	const defects = $derived(gridDefects(n));
	const problemList = $derived([
		...defects.duplicateEdges.map((g) => ({ kind: 'edge' as const, ids: g })),
		...defects.duplicateTriangles.map((g) => ({ kind: 'triangle' as const, ids: g }))
	]);
	const current = $derived(problemList.length ? problemList[problem % problemList.length] : null);

	$effect(() => {
		void n;
		problem = 0;
		hoverLabel = null;
	});

	// flat picture geometry
	const X0 = 60;
	const Y0 = 40;
	const S = 300;
	const at = (i: number, j: number): [number, number] => [X0 + (i / n) * S, Y0 + S - (j / n) * S];

	type Api = { show(n: number, hover: number | null, prob: { kind: 'edge' | 'triangle'; ids: number[] } | null): void };
	let api = $state.raw<Api | null>(null);
	$effect(() => {
		const nn = n;
		const h = hoverLabel;
		const c = current;
		api?.show(nn, h, c);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate, label } = ctx;
		const offFit = fitCamera(ctx, 2.55);
		const fn = torus(1.55, 0.68);
		const base = glassMesh(surfaceGeometry(fn, 140, 56), { opacity: 0.42, grid: [0, 0], film: 1.0, rim: 0.5, hue: 0.55 });
		scene.add(base);
		let root: THREE.Group | null = null;
		let builtN = -1;
		let edgeObjs: THREE.Group[] = [];
		let triObjs: THREE.Mesh[] = [];
		let vertObjs = new Map<number, THREE.Group>();
		let labels: LabelHandle[] = [];
		const off = 0.0;

		function uv(i: number, j: number): [number, number] {
			return [i / builtN + off, j / builtN + off];
		}
		function build(nn: number) {
			if (root) {
				scene.remove(root);
				disposeTree(root);
			}
			labels.forEach((l) => l.remove());
			labels = [];
			builtN = nn;
			root = new THREE.Group();
			const P = gridPieces(nn);
			edgeObjs = P.edges.map((e) => {
				const [a, b] = e.corners.map(([i, j]) => uv(i, j));
				const curve = new SurfaceCurve(fn, (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], 0.012);
				const g = glowTube(curve, { color: 0xf3ead2, radius: 0.02, segments: 48, radialSegments: 8, halo: true, haloScale: 2.6, intensity: 1.0 });
				root!.add(g);
				return g;
			});
			triObjs = P.triangles.map((t) => {
				const [a, b, c] = t.corners.map(([i, j]) => uv(i, j));
				const m = new THREE.Mesh(
					surfaceTriangle(fn, a, b, c, 12, 0.008),
					new THREE.MeshBasicMaterial({ color: 0xf28db6, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })
				);
				m.renderOrder = 3;
				root!.add(m);
				return m;
			});
			vertObjs = new Map();
			const p = new THREE.Vector3();
			for (let j = 0; j < nn; j++)
				for (let i = 0; i < nn; i++) {
					const [u, v] = uv(i, j);
					fn(u, v, p);
					const g = vertexBead(p, 'gold', 0.055);
					root.add(g);
					vertObjs.set(gridLabel(i, j, nn), g);
					const nrm = surfaceNormal(fn, u, v, new THREE.Vector3());
					const q = p.clone().addScaledVector(nrm, 0.2);
					labels.push(label(q, tex(String(gridLabel(i, j, nn))), { className: 'gold', normal: nrm }));
				}
			scene.add(root);
		}

		api = {
			show(nn, hover, prob) {
				if (nn !== builtN) build(nn);
				edgeObjs.forEach((e) => setGlowColor(e, 0xf3ead2, 1.0));
				triObjs.forEach((t) => ((t.material as THREE.MeshBasicMaterial).opacity = 0));
				vertObjs.forEach((g) => {
					setPointColor(g, 'gold', 1);
					g.scale.setScalar(1);
				});
				const P = gridPieces(nn);
				if (hover !== null) {
					const g = vertObjs.get(hover);
					if (g) {
						setPointColor(g, 'goldPale', 1.6);
						g.scale.setScalar(1.7);
					}
					P.edges.forEach((e, i) => {
						if (e.labels.includes(hover)) setGlowColor(edgeObjs[i], 'gold', 1.5);
					});
				}
				if (prob) {
					const cols = ['rose', 'violet'] as const;
					prob.ids.forEach((id, k) => {
						if (prob.kind === 'edge') setGlowColor(edgeObjs[id], cols[k % 2], 2.0);
						else {
							const m = triObjs[id].material as THREE.MeshBasicMaterial;
							m.color.set(k % 2 ? 0xa493ff : 0xf28db6);
							m.opacity = 0.55;
						}
					});
					const labs = prob.kind === 'edge' ? P.edges[prob.ids[0]].labels : P.triangles[prob.ids[0]].labels;
					labs.forEach((L) => {
						const g = vertObjs.get(L);
						if (g) {
							setPointColor(g, 'rose', 1.5);
							g.scale.setScalar(1.5);
						}
					});
				}
				invalidate();
			}
		};
		api.show(n, hoverLabel, current);
		return {
			dispose() {
				offFit();
				api = null;
			}
		};
	}

	const probEdges = $derived(current?.kind === 'edge' ? new Set(current.ids) : new Set<number>());
	const probTris = $derived(current?.kind === 'triangle' ? new Set(current.ids) : new Set<number>());
	const probLabels = $derived(
		current
			? new Set(current.kind === 'edge' ? pieces.edges[current.ids[0]].labels : pieces.triangles[current.ids[0]].labels)
			: new Set<number>()
	);
	const probIndex = (set: Set<number>, i: number) => [...set].indexOf(i);
</script>

<div class="two">
	<div class="flat" bind:clientWidth={cw}>
		<Svg viewBox="0 0 420 390" maxHeight={400} label="The square with opposite sides glued, cut into a grid of triangles, with vertex labels">
			<GluingSquare preset="torus" x={X0} y={Y0} size={S} />
			{#each pieces.triangles as t, i (i)}
				{#if probTris.has(i)}
					<polygon
						points={t.corners.map(([a, b]) => at(a, b).join(',')).join(' ')}
						fill={probIndex(probTris, i) === 0 ? 'rgba(242,141,182,0.42)' : 'rgba(164,147,255,0.42)'}
					/>
				{/if}
			{/each}
			<!-- all grid segments, including the top and right sides -->
			{#each Array(n + 1) as _, j (j)}
				{#each Array(n + 1) as __, i (i)}
					{#if i < n}<line x1={at(i, j)[0]} y1={at(i, j)[1]} x2={at(i + 1, j)[0]} y2={at(i + 1, j)[1]} class="g" class:side={j === 0 || j === n} />{/if}
					{#if j < n}<line x1={at(i, j)[0]} y1={at(i, j)[1]} x2={at(i, j + 1)[0]} y2={at(i, j + 1)[1]} class="g" class:side={i === 0 || i === n} />{/if}
					{#if i < n && j < n}<line x1={at(i, j)[0]} y1={at(i, j)[1]} x2={at(i + 1, j + 1)[0]} y2={at(i + 1, j + 1)[1]} class="g" />{/if}
				{/each}
			{/each}
			{#each pieces.edges as e, i (i)}
				{#if probEdges.has(i)}
					{@const [a, b] = e.corners.map(([x, y]) => at(x, y))}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="probedge" class:second={probIndex(probEdges, i) === 1} />
				{/if}
			{/each}
			{#each Array(n + 1) as _, j (j)}
				{#each Array(n + 1) as __, i (i)}
					{@const L = gridLabel(i, j, n)}
					{@const [x, y] = at(i, j)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<g
						class="vt"
						class:hot={hoverLabel === L}
						class:prob={probLabels.has(L)}
						onpointerenter={() => (hoverLabel = L)}
						onpointerleave={() => (hoverLabel = null)}
						onclick={() => (hoverLabel = hoverLabel === L ? null : L)}
					>
						<circle cx={x} cy={y} r={16 * k} class="vhit" />
						<circle cx={x} cy={y} r={11 * k} class="vdisc" />
						<text {x} y={y + 4.5 * k} text-anchor="middle" class="vnum" style="font-size:{12 * k}px !important">{L}</text>
					</g>
				{/each}
			{/each}
		</Svg>
	</div>
	<div class="space">
		<Scene3D
			{setup}
			height={380}
			camera={{ position: [0, 3.6, 4.6], fov: 40 }}
			controls={{ autoRotate: true, autoRotateSpeed: 0.4 }}
			label="A torus with the grid triangulation drawn on it; each vertex label appears once"
		/>
	</div>
</div>
<div class="readout ui" aria-live="polite">
	{#if n === 3}
		<p>
			<TeX tex={`${defects.vertices}`} /> vertices, <TeX tex={`${defects.edgeCount}`} /> edges, <TeX tex={`${defects.triangleCount}`} /> triangles.
			<span class="ok">Every edge has its own pair of endpoints and every triangle its own three corners <Mark ok /></span>
		</p>
	{:else}
		<p>
			<TeX tex={`${defects.vertices}`} /> vertices, <TeX tex={`${defects.edgeCount}`} /> edges, <TeX tex={`${defects.triangleCount}`} /> triangles — but 4 vertices only form
			<TeX tex={`\\binom{4}{2} = ${binom(4, 2)}`} /> pairs and <TeX tex={`\\binom{4}{3} = ${binom(4, 3)}`} /> triples.
			<span class="bad">
				{#if current?.kind === 'edge'}
					Two different edges (rose and violet) both join {pieces.edges[current.ids[0]].labels[0]} and {pieces.edges[current.ids[0]].labels[1]} <Mark ok={false} />
				{:else if current}
					Two different triangles (rose and violet) both have corners {pieces.triangles[current.ids[0]].key.replace(/,/g, ', ')} <Mark ok={false} />
				{/if}
			</span>
		</p>
	{/if}
</div>
<div class="bar ui">
	<Segmented
		bind:value={n}
		options={[
			{ value: 3, label: '3 × 3 grid' },
			{ value: 2, label: '2 × 2 grid' }
		]}
		label="Grid size"
	/>
	{#if n === 2}
		<Button variant="ghost" onclick={() => (problem = (problem + 1) % problemList.length)}>Show another problem</Button>
	{/if}
</div>

<style>
	.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
		align-items: center;
	}
	.flat {
		padding: 0.8rem 0.4rem 0.2rem 0.8rem;
	}
	.g {
		stroke: rgba(235, 229, 213, 0.42);
		stroke-width: 1.4;
	}
	.g.side {
		stroke: transparent;
	}
	.probedge {
		stroke: var(--rose);
		stroke-width: 5;
		stroke-linecap: round;
		filter: url(#glow);
	}
	.probedge.second {
		stroke: var(--violet);
	}
	.vhit {
		fill: transparent;
	}
	.vt {
		cursor: pointer;
	}
	.vdisc {
		fill: #141c33;
		stroke: rgba(242, 208, 143, 0.65);
		stroke-width: 1.4;
		transition: all 0.2s;
	}
	.vnum {
		font-family: var(--font-ui);
		font-size: 12px !important;
		font-weight: 650;
		fill: var(--gold-bright) !important;
		pointer-events: none;
	}
	.vt.hot .vdisc {
		fill: var(--gold-bright);
		stroke: var(--gold-pale);
		filter: url(#glow);
	}
	.vt.hot .vnum {
		fill: #1a1206 !important;
	}
	.vt.prob .vdisc {
		stroke: var(--rose);
		stroke-width: 2.4;
	}
	.readout {
		padding: 0.2rem 1.4rem 0.4rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-align: center;
	}
	.readout p {
		margin: 0.3rem 0 0.5rem !important;
	}
	.ok {
		display: block;
		color: var(--green);
		margin-top: 0.2rem;
	}
	.bad {
		display: block;
		color: var(--rose);
		margin-top: 0.2rem;
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		padding: 0.75rem 1.2rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	@media (max-width: 760px) {
		.two {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
