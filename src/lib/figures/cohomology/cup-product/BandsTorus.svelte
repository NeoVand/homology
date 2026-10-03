<script lang="ts">
	// "Bands on a torus": two fences α (gold) and β (teal); their product lives
	// where they cross. The readout is computed twice: by counting signed
	// crossings, and by the front-face × back-face formula on a triangulation.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, disposeTree } from '$lib/three/materials';
	import { surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { bandMesh, crossingPatch, fovFitter, nearestParam, orientedTorus, liftPoint, type UV } from './bands3d';
	import { arcCrossings, fenceCochain, samplePath, squareModel, wrapToSquare } from './flat';
	import { cup11, evaluate, orientTriangles } from './cup';

	type Mode = 'ab' | 'ba' | 'aa' | 'bb';
	let mode = $state<Mode>('ab');
	let uA = $state(0.25);
	let vB = $state(0.86);
	let wiggle = $state(0);

	const grid = squareModel('torus', 12);
	const T = orientTriangles(grid.D)!;

	// the fences as curves in the flat square (x around the hole, y around the tube)
	function alphaCurve(u: number, w: number, shift = 0): (t: number) => UV {
		const A = 2.6 * w;
		const B = 0.055 * w;
		const wl = Math.hypot(B, A / (4 * Math.PI)) || 1;
		const dir: UV = w > 0 ? [-B / wl, A / (4 * Math.PI) / wl] : [1, 0];
		return (t) => [
			u + 0.0013 - B * Math.sin(4 * Math.PI * t) + shift * dir[0],
			0.0371 + t + (A / (4 * Math.PI)) * Math.sin(4 * Math.PI * t) + shift * dir[1]
		];
	}
	function betaCurve(v: number, shift = 0): (t: number) => UV {
		return (t) => [0.0007 + 1 - t, v + 0.0011 + shift];
	}

	const sim = $derived.by(() => {
		const a = alphaCurve(uA, wiggle);
		const b = betaCurve(vB);
		const a2 = alphaCurve(uA, wiggle, 0.034);
		const b2 = betaCurve(vB, 0.13);
		const curves =
			mode === 'aa'
				? [
						{ c: a, col: 'gold' as const, name: '\\alpha' },
						{ c: a2, col: 'gold' as const, name: "\\alpha'" }
					]
				: mode === 'bb'
					? [
							{ c: b, col: 'teal' as const, name: '\\beta' },
							{ c: b2, col: 'teal' as const, name: "\\beta'" }
						]
					: [
							{ c: a, col: 'gold' as const, name: '\\alpha' },
							{ c: b, col: 'teal' as const, name: '\\beta' }
						];
		const first = mode === 'ba' ? curves[1] : curves[0];
		const second = mode === 'ba' ? curves[0] : curves[1];
		const arcsF = wrapToSquare(samplePath(first.c, 360));
		const arcsG = wrapToSquare(samplePath(second.c, 360));
		const crossings = arcCrossings(arcsF, arcsG);
		// the honest cup product: front face × back face on a 12 × 12 triangulation
		const fa = fenceCochain(grid, wrapToSquare(samplePath(a, 360)));
		const fb = fenceCochain(grid, wrapToSquare(samplePath(b, 360)));
		const [L, R] = mode === 'ab' ? [fa, fb] : mode === 'ba' ? [fb, fa] : mode === 'aa' ? [fa, fa] : [fb, fb];
		const cupValue = evaluate(cup11(grid.D, L, R), T);
		return { curves, first, second, crossings, cupValue };
	});

	const pairTeX = $derived(
		mode === 'ab' ? '\\alpha\\smile\\beta' : mode === 'ba' ? '\\beta\\smile\\alpha' : mode === 'aa' ? '\\alpha\\smile\\alpha' : '\\beta\\smile\\beta'
	);
	const sumTeX = $derived.by(() => {
		const s = sim.crossings.map((c) => (c.sign > 0 ? '(+1)' : '(-1)'));
		const total = sim.crossings.reduce((x, c) => x + c.sign, 0);
		const t = total > 0 ? `+${total}` : `${total}`;
		if (!s.length) return '\\text{no crossings} \\;\\Rightarrow\\; 0';
		return s.length === 1 ? t : `${s.join('+')} = ${t}`;
	});

	let api: { rebuild(): void } | null = null;
	const R0 = 1.6;
	const r0 = 0.62;
	const W = 0.1;

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		const f = orientedTorus(R0, r0);
		const surf = glassMesh(surfaceGeometry(f, 180, 72), { opacity: 0.74, grid: [48, 18], gridStrength: 0.18, brightness: 0.85 });
		scene.add(surf);
		const dynamic = new THREE.Group();
		scene.add(dynamic);
		let labels: LabelHandle[] = [];
		const anim = ctx.reducedMotion ? 0 : 1;

		function rebuild() {
			disposeTree(dynamic);
			dynamic.clear();
			for (const l of labels) l.remove();
			labels = [];
			const s = sim;
			for (const [k, cv] of s.curves.entries()) {
				const mesh = bandMesh(f, cv.c, W, cv.col, { opacity: k === 1 && (mode === 'aa' || mode === 'bb') ? 0.8 : 1, anim, segments: 320 });
				dynamic.add(mesh);
				// label each band where it faces the camera: α low on the outside, β towards the right
				const tl = cv.col === 'gold' ? (k === 0 ? 0.935 : 0.9) : k === 0 ? 0.86 : 0.8;
				const [x, y] = cv.c(tl);
				const { P, N } = liftPoint(f, x, y, 0.24);
				labels.push(ctx.label(P, tex(cv.name), { className: cv.col, normal: N }));
			}
			for (const c of s.crossings) {
				const tA = nearestParam(s.first.c, c.p);
				const tB = nearestParam(s.second.c, c.p);
				const patch = crossingPatch(f, s.first.c, tA, s.second.c, tB, W);
				dynamic.add(patch.mesh);
				const dot = glowPoint(patch.center.clone().addScaledVector(patch.normal, 0.01), { color: 'rose', size: 0.035, halo: 8 });
				dynamic.add(dot);
				const lp = patch.center.clone().addScaledVector(patch.normal, 0.26);
				labels.push(ctx.label(lp, c.sign > 0 ? '+1' : '−1', { className: 'rose sign3d', normal: patch.normal }));
			}
			ctx.invalidate();
		}
		api = { rebuild };
		rebuild();
		const fit = fovFitter(ctx.camera, 38);
		const off = ctx.onFrame(() => {
			if (fit()) ctx.invalidate();
		});
		return {
			dispose() {
				off();
				api = null;
				for (const l of labels) l.remove();
			}
		};
	}

	$effect(() => {
		void sim;
		api?.rebuild();
	});
</script>

<div class="bands">
	<!-- signs next to the crossings are 3D labels; style them as small pills -->
	<Scene3D
		{setup}
		height={460}
		animate
		camera={{ position: [0.2, 3.3, 5.5], fov: 38 }}
		controls={{ autoRotate: false }}
		label="A glassy torus with a gold band running around its tube and a teal band running around its hole. Where the bands cross, a small rose patch glows; signs +1 or −1 mark each crossing."
	/>
	<div class="readout ui" aria-live="polite">
		<div class="row">
			<span class="k">Signed crossings</span>
			<span class="v"><TeX tex={`\\langle ${pairTeX}, [T^2]\\rangle = ${sumTeX}`} /></span>
		</div>
		<div class="row">
			<span class="k">Front face × back face</span>
			<span class="v"
				><TeX tex={`\\textstyle\\sum_\\sigma \\pm(${pairTeX})(\\sigma) = ${sim.cupValue > 0 ? '+' : ''}${sim.cupValue}`} />
				<span class="small">on a 12 × 12 triangulation</span></span
			>
		</div>
	</div>
	<div class="ctl ui">
		<Segmented
			bind:value={mode}
			label="Which product"
			options={[
				{ value: 'ab', label: 'α ⌣ β' },
				{ value: 'ba', label: 'β ⌣ α' },
				{ value: 'aa', label: 'α ⌣ α' },
				{ value: 'bb', label: 'β ⌣ β' }
			]}
		/>
		<div class="sliders">
			<Slider bind:value={uA} min={0} max={0.999} step={0.001} label="slide α around the hole" format={(v) => v.toFixed(2)} />
			<Slider bind:value={vB} min={0} max={0.999} step={0.001} label="slide β around the tube" format={(v) => v.toFixed(2)} />
			<Slider bind:value={wiggle} min={0} max={1} step={0.01} label="bend α into an S" format={(v) => `${Math.round(v * 100)}%`} />
		</div>
	</div>
</div>

<style>
	.bands :global(.lbl3d.sign3d) {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.82rem;
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
		background: rgba(20, 8, 16, 0.72);
		border: 1px solid rgba(242, 141, 182, 0.55);
		text-shadow: none;
	}
	.readout {
		display: grid;
		gap: 0.35rem;
		padding: 0.75rem 1.2rem 0.6rem;
		border-top: 1px solid var(--line-faint);
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.8rem;
	}
	.k {
		min-width: 11rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		font-size: 0.68rem;
		color: var(--ink-faint);
	}
	.v {
		color: var(--ink-bright);
		font-size: 0.95rem;
	}
	.small {
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin-left: 0.4rem;
	}
	.ctl {
		display: grid;
		gap: 0.8rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.sliders {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem 1.2rem;
	}
	@media (max-width: 640px) {
		.sliders {
			grid-template-columns: 1fr;
		}
		.k {
			min-width: 0;
		}
	}
</style>
