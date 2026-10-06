<script lang="ts">
	// Figure: the 7-vertex torus. Left: the triangulated plane, each point labelled
	// (a + 3b) mod 7 — it repeats, and the repeats wrap up into a torus. Right: the
	// same 7 vertices, 21 edges and 14 triangles on a torus, or as Császár's
	// polyhedron. Pick a vertex: its six neighbours are always the six others.
	import * as THREE from 'three';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glassMesh, glowTube, setGlowColor, disposeTree, iridescent } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { latticeLabel, latticePoint, latticeUV, torus7Triangles, csaszarByLabel } from './data';
	import { seven, sevenCss, vertexBead, setPointColor, polygonGeometry, edgeTube, fitCamera } from './kit3d';
	import Mark from '$lib/components/ui/Mark.svelte';

	let picked = $state<number | null>(0);
	let seen = $state<Set<string>>(new Set([1, 2, 3, 4, 5, 6].map((m) => `0,${m}`)));
	let mode = $state<'torus' | 'csaszar'>('torus');
	let cw = $state(440);
	const k = $derived(cw < 400 ? 1.22 : 1);

	// ── the lattice patch ────────────────────────────────────────────────────
	const R = 3;
	type LP = { a: number; b: number; x: number; y: number; L: number };
	const pts: LP[] = [];
	for (let a = -R; a <= R; a++)
		for (let b = -R; b <= R; b++) {
			if (Math.abs(a + b) > R) continue;
			const [x, y] = latticePoint(a, b);
			pts.push({ a, b, x, y, L: latticeLabel(a, b) });
		}
	const has = (a: number, b: number) => Math.abs(a) <= R && Math.abs(b) <= R && Math.abs(a + b) <= R;
	const segs: [LP, LP][] = [];
	const find = (a: number, b: number) => pts.find((p) => p.a === a && p.b === b)!;
	for (const p of pts)
		for (const [da, db] of [
			[1, 0],
			[0, 1],
			[-1, 1]
		]) {
			if (has(p.a + da, p.b + db)) segs.push([p, find(p.a + da, p.b + db)]);
		}
	// One copy of each of the 14 triangles: the "up" triangle (p, p+e₁, p+e₂) and the
	// "down" triangle (p+e₁, p+e₁+e₂, p+e₂) anchored at each of the 7 points p of the
	// flower around the origin (whose labels are 0…6, each once).
	const flower: [number, number][] = [
		[0, 0],
		[1, 0],
		[-1, 0],
		[0, 1],
		[0, -1],
		[1, -1],
		[-1, 1]
	];
	const homeTris: [LP, LP, LP][] = flower.flatMap(([a, b]) => [
		[find(a, b), find(a + 1, b), find(a, b + 1)] as [LP, LP, LP],
		[find(a + 1, b), find(a + 1, b + 1), find(a, b + 1)] as [LP, LP, LP]
	]);

	const SC = 44;
	const cx = 260;
	const cy = 200;
	const X = (p: { x: number }) => cx + p.x * SC;
	const Y = (p: { y: number }) => cy - p.y * SC;

	function pick(L: number) {
		picked = picked === L ? null : L;
		if (picked !== null) {
			const s = new Set(seen);
			for (let m = 0; m < 7; m++) if (m !== picked) s.add([Math.min(m, picked), Math.max(m, picked)].join(','));
			seen = s;
		}
	}
	const neighbours = $derived(
		picked === null ? new Set<number>() : new Set([1, 2, 3, 4, 5, 6].map((d) => (picked! + d) % 7))
	);

	// ── 3D ───────────────────────────────────────────────────────────────────
	type Api = { show(mode: 'torus' | 'csaszar', picked: number | null): void };
	let api = $state.raw<Api | null>(null);
	$effect(() => {
		const m = mode;
		const p = picked;
		api?.show(m, p);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate, label } = ctx;
		const offFit = fitCamera(ctx, 2.3);
		const tris = torus7Triangles();
		const edges: [number, number][] = [];
		for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) edges.push([i, j]);
		let root: THREE.Group | null = null;
		let built: string | null = null;
		let vObjs: THREE.Group[] = [];
		let eObjs: THREE.Group[] = [];
		let labels: LabelHandle[] = [];

		// lattice representatives of each vertex label and edge
		const rep = (L: number): [number, number] => {
			for (const [a, b] of [
				[0, 0],
				[1, 0],
				[-1, 0],
				[0, 1],
				[0, -1],
				[1, -1],
				[-1, 1]
			])
				if (latticeLabel(a, b) === L) return [a, b];
			return [0, 0];
		};
		const fn = torus(1.5, 0.75);

		function buildTorus() {
			const g = new THREE.Group();
			g.add(glassMesh(surfaceGeometry(fn, 140, 60), { opacity: 0.36, grid: [0, 0], film: 1.0, rim: 0.5, hue: 0.55 }));
			const p = new THREE.Vector3();
			vObjs = [];
			for (let L = 0; L < 7; L++) {
				const [a, b] = rep(L);
				const [u, v] = latticeUV(a, b);
				fn(((u % 1) + 1) % 1, ((v % 1) + 1) % 1, p);
				const bead = vertexBead(p, seven[L], 0.085);
				g.add(bead);
				vObjs.push(bead);
				const nrm = surfaceNormal(fn, ((u % 1) + 1) % 1, ((v % 1) + 1) % 1, new THREE.Vector3());
				labels.push(label(p.clone().addScaledVector(nrm, 0.24), tex(String(L)), { className: 'gold', normal: nrm }));
			}
			eObjs = edges.map(([s, t]) => {
				// the lattice edge from rep(s) to the neighbour of rep(s) that carries label t
				const [a, b] = rep(s);
				const d = [
					[1, 0],
					[-1, 0],
					[0, 1],
					[0, -1],
					[1, -1],
					[-1, 1]
				].find(([da, db]) => latticeLabel(a + da, b + db) === t)!;
				const A = latticeUV(a, b);
				const B = latticeUV(a + d[0], b + d[1]);
				const curve = new SurfaceCurve(fn, (x) => [A[0] + (B[0] - A[0]) * x, A[1] + (B[1] - A[1]) * x], 0.014);
				const e = glowTube(curve, { color: 0xe9e1cc, radius: 0.019, segments: 40, radialSegments: 8, halo: true, haloScale: 2.6, intensity: 0.85 });
				g.add(e);
				return e;
			});
			return g;
		}

		function buildCsaszar() {
			const g = new THREE.Group();
			const raw = csaszarByLabel();
			// centre, squash the tall spike a little (any stretching keeps it embedded), scale
			const c = raw.reduce((s, q) => [s[0] + q[0] / 7, s[1] + q[1] / 7, s[2] + q[2] / 7], [0, 0, 0]);
			const P = raw.map((q) => new THREE.Vector3((q[0] - c[0]) * 0.36, (q[2] - c[2]) * 0.2, -(q[1] - c[1]) * 0.36));
			const glass = new THREE.Group();
			for (const t of tris) {
				const m = new THREE.Mesh(
					polygonGeometry(t.map((v) => P[v])),
					iridescent({ opacity: 0.32, grid: [0, 0], film: 1.4, rim: 0.4, depthWrite: false, hue: ((t[0] * 3 + t[1]) % 7) / 7 })
				);
				m.renderOrder = 1;
				glass.add(m);
			}
			g.add(glass);
			vObjs = P.map((p, L) => {
				const bead = vertexBead(p, seven[L], 0.07);
				g.add(bead);
				const out = p.clone().setLength(p.length() + 0.3);
				labels.push(label(out, tex(String(L)), { className: 'gold' }));
				return bead;
			});
			eObjs = edges.map(([s, t]) => {
				const e = edgeTube(P[s], P[t], { color: 0xe9e1cc, radius: 0.02, intensity: 0.85 });
				g.add(e);
				return e;
			});
			return g;
		}

		api = {
			show(m, pk) {
				if (m !== built) {
					if (root) {
						scene.remove(root);
						disposeTree(root);
					}
					labels.forEach((l) => l.remove());
					labels = [];
					root = m === 'torus' ? buildTorus() : buildCsaszar();
					scene.add(root);
					built = m;
				}
				vObjs.forEach((v, L) => {
					setPointColor(v, seven[L], pk === null || pk === L ? 1.25 : 0.75);
					v.scale.setScalar(pk === L ? 1.6 : 1);
				});
				edges.forEach(([s, t], i) => {
					if (pk !== null && (s === pk || t === pk)) setGlowColor(eObjs[i], seven[s === pk ? t : s], 1.8);
					else setGlowColor(eObjs[i], 0xe9e1cc, pk === null ? 0.85 : 0.45);
				});
				invalidate();
			}
		};
		api.show(mode, picked);
		return {
			dispose() {
				offFit();
				api = null;
			}
		};
	}
</script>

<div class="two">
	<div class="flat" bind:clientWidth={cw}>
		<Svg viewBox="40 30 440 340" maxHeight={380} label="The triangulated plane with each vertex labelled by a number from 0 to 6; the labels repeat periodically">
			{#each homeTris as t, i (i)}
				<polygon points={t.map((p) => `${X(p)},${Y(p)}`).join(' ')} class="home" />
			{/each}
			{#each segs as [p, q], i (i)}
				{@const lit = picked !== null && ((p.L === picked && neighbours.has(q.L)) || (q.L === picked && neighbours.has(p.L)))}
				<line
					x1={X(p)}
					y1={Y(p)}
					x2={X(q)}
					y2={Y(q)}
					class="seg"
					class:lit
					style={lit ? `stroke:${sevenCss[p.L === picked ? q.L : p.L]}` : ''}
				/>
			{/each}
			{#each pts as p (p.a + ',' + p.b)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<g
					class="pt"
					class:on={picked === p.L}
					class:dim={picked !== null && picked !== p.L && !neighbours.has(p.L)}
					role="button"
					tabindex="-1"
					aria-label="vertex {p.L}"
					onclick={() => pick(p.L)}
				>
					<circle cx={X(p)} cy={Y(p)} r={17 * k} class="hit" />
					<circle cx={X(p)} cy={Y(p)} r={(picked === p.L ? 13 : 11) * k} fill={sevenCss[p.L]} class="disc" />
					<text x={X(p)} y={Y(p) + 4.5 * k} text-anchor="middle" class="num" style="font-size:{12 * k}px !important">{p.L}</text>
				</g>
			{/each}
		</Svg>
		<div class="keys ui" role="group" aria-label="Choose a vertex">
			{#each [0, 1, 2, 3, 4, 5, 6] as L (L)}
				<button class:on={picked === L} style="--c:{sevenCss[L]}" onclick={() => pick(L)} aria-pressed={picked === L}>{L}</button>
			{/each}
		</div>
	</div>
	<div class="space">
		<Scene3D
			{setup}
			height={400}
			camera={{ position: [0, 3.2, 5.0], fov: 40 }}
			controls={{ autoRotate: true, autoRotateSpeed: 0.45 }}
			label="The seven-vertex torus in space: every pair of its seven coloured vertices is joined by an edge"
		/>
	</div>
</div>
<div class="readout ui" aria-live="polite">
	{#if picked !== null}
		<span>Vertex <b style="color:{sevenCss[picked]}">{picked}</b> is joined to
			{#each [...neighbours].sort((a, b) => a - b) as m, i (m)}<b style="color:{sevenCss[m]}">{m}</b>{i < 5 ? ', ' : ''}{/each}
			— all six others.</span>
	{:else}
		<span>Tap a vertex.</span>
	{/if}
	<span class="tally" class:done={seen.size === 21}>Pairs checked: {seen.size} of 21{#if seen.size === 21}: every pair is an edge <Mark ok />{/if}</span>
</div>
<div class="bar ui">
	<Segmented
		bind:value={mode}
		options={[
			{ value: 'torus', label: 'Drawn on a torus' },
			{ value: 'csaszar', label: 'Császár’s polyhedron' }
		]}
		label="How to show it in space"
	/>
	<Button variant="subtle" onclick={() => ((seen = new Set()), (picked = null))}>Reset count</Button>
</div>

<style>
	.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		align-items: center;
	}
	.flat {
		padding: 0.6rem 0.4rem 0 0.8rem;
	}
	.home {
		fill: rgba(242, 208, 143, 0.09);
		stroke: rgba(242, 208, 143, 0.28);
		stroke-width: 1;
	}
	.seg {
		stroke: rgba(235, 229, 213, 0.32);
		stroke-width: 1.4;
		transition: stroke 0.25s;
	}
	.seg.lit {
		stroke-width: 3.2;
		filter: url(#glow);
	}
	.pt {
		cursor: pointer;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.disc {
		fill-opacity: 0.9;
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
		transition: all 0.2s;
	}
	.pt.on .disc {
		filter: url(#glow-strong);
	}
	.pt.dim {
		opacity: 0.35;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 12px !important;
		font-weight: 700;
		fill: #10131d !important;
		pointer-events: none;
	}
	.keys {
		display: flex;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.2rem 0 0.4rem;
	}
	.keys button {
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 50%;
		border: 1.5px solid var(--c);
		background: color-mix(in srgb, var(--c) 12%, transparent);
		color: var(--c);
		font-weight: 700;
		font-size: 0.85rem;
		cursor: pointer;
		transition: all 0.2s var(--ease);
	}
	.keys button.on {
		background: var(--c);
		color: #10131d;
		box-shadow: 0 0 12px color-mix(in srgb, var(--c) 60%, transparent);
	}
	.readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
		padding: 0.3rem 1.2rem 0.7rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		text-align: center;
	}
	.tally {
		font-size: 0.76rem;
		color: var(--ink-faint);
	}
	.tally.done {
		color: var(--green);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
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
