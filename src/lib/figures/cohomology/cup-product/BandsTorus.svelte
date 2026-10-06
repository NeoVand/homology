<script lang="ts">
	// "Bands on a torus": two fences α (gold) and β (teal); their product lives
	// where they cross. The readout is computed twice: by counting signed
	// crossings, and by the front-face × back-face formula on a triangulation.
	// Grab a band on the surface to slide it; the timeline bends α into an S.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
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
	const frac = (x: number) => x - Math.floor(x);

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
			}
			ctx.camera.updateMatrixWorld();
			const taken: { x: number; y: number }[] = [];
			for (const c of s.crossings) {
				const tA = nearestParam(s.first.c, c.p);
				const tB = nearestParam(s.second.c, c.p);
				const patch = crossingPatch(f, s.first.c, tA, s.second.c, tB, W);
				dynamic.add(patch.mesh);
				const dot = glowPoint(patch.center.clone().addScaledVector(patch.normal, 0.01), { color: 'rose', size: 0.035, halo: 8 });
				dynamic.add(dot);
				const lp = patch.center.clone().addScaledVector(patch.normal, 0.26);
				labels.push(ctx.label(lp, c.sign > 0 ? '+1' : '−1', { className: 'rose sign3d', normal: patch.normal }));
				taken.push(ctx.project(lp));
			}
			// name each band beside it, where the name is clear of every band and sign
			const ink = s.curves.flatMap((cv) =>
				Array.from({ length: 160 }, (_, i) => {
					const [x, y] = cv.c(i / 160);
					return ctx.project(liftPoint(f, x, y, 0.02).P);
				})
			);
			for (const cv of s.curves) {
				const { P, N } = spot(cv.name, cv.c, ink, taken);
				labels.push(ctx.label(P, tex(cv.name), { className: cv.col, normal: N }));
			}
			ctx.invalidate();
		}
		// a place for a band's name: lifted off the surface where it faces the
		// camera, a little way off its own band on screen, clear of everything
		// else drawn and inside the picture
		const eye = new THREE.Vector3();
		const lastT = new Map<string, number>();
		function spot(key: string, c: (t: number) => UV, ink: { x: number; y: number }[], taken: { x: number; y: number }[]) {
			const w = ctx.canvas.clientWidth;
			const h = ctx.canvas.clientHeight;
			let best = liftPoint(f, ...c(0), 0.3);
			let top = -Infinity;
			let bestT = 0;
			const was = lastT.get(key);
			for (let i = 0; i < 96; i++) {
				const t = i / 96;
				const [x, y] = c(t);
				const l = liftPoint(f, x, y, 0.3);
				const facing = l.N.dot(eye.copy(ctx.camera.position).sub(l.P).normalize());
				if (facing < 0.25) continue;
				const q = ctx.project(l.P);
				if (q.x < 20 || q.y < 20 || q.x > w - 20 || q.y > h - 20) continue;
				const foot = ctx.project(liftPoint(f, x, y, 0.02).P);
				const gap = Math.hypot(q.x - foot.x, q.y - foot.y);
				let clear = 32;
				for (const k of ink) clear = Math.min(clear, Math.hypot(k.x - q.x, k.y - q.y));
				for (const k of taken) clear = Math.min(clear, Math.hypot(k.x - q.x, k.y - q.y) - 16);
				let score = clear - 0.6 * Math.abs(gap - 28) + 6 * facing;
				// stay where the name was unless somewhere else is clearly better
				if (was !== undefined) score -= 40 * Math.min(Math.abs(t - was - Math.round(t - was)), 0.25);
				if (score > top) ((top = score), (best = l), (bestT = t));
			}
			lastT.set(key, bestT);
			taken.push(ctx.project(best.P));
			return best;
		}
		api = { rebuild };
		rebuild();
		const fit = fovFitter(ctx.camera, 38);
		const off = ctx.onFrame(() => {
			if (fit()) ctx.invalidate();
		});

		// ── grab a band and slide it: α around the hole, β around the tube ──
		const { canvas, controls } = ctx;
		const surface = surf.children[1];
		const onSurface = (e: PointerEvent) => {
			const hit = ctx.pick(e, [surface])[0];
			return hit?.uv ? { uv: [hit.uv.x, hit.uv.y] as UV, point: hit.point } : null;
		};
		const bandAt = (e: PointerEvent) => {
			const h = onSurface(e);
			if (!h) return null;
			let best: { band: 'a' | 'b'; uv: UV } | null = null;
			let bd = 0.16;
			for (const cv of sim.curves) {
				const [x, y] = cv.c(nearestParam(cv.c, h.uv, 160));
				const d = liftPoint(f, x, y, 0).P.distanceTo(h.point);
				if (d < bd) ((bd = d), (best = { band: cv.col === 'gold' ? 'a' : 'b', uv: h.uv }));
			}
			return best;
		};
		let grab: { band: 'a' | 'b'; uv: UV } | null = null;
		let controlsWere = true;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			grab = bandAt(e);
			if (!grab) return;
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
		};
		const onMove = (e: PointerEvent) => {
			if (!grab) {
				if (e.pointerType === 'mouse') canvas.style.cursor = bandAt(e) ? 'grab' : '';
				return;
			}
			const h = onSurface(e);
			if (!h) return;
			// the shortest way round from the last point, so crossing the seam is seamless
			const d = (a: number, b: number) => a - b - Math.round(a - b);
			if (grab.band === 'a') uA = frac(uA + d(h.uv[0], grab.uv[0]));
			else vB = frac(vB + d(h.uv[1], grab.uv[1]));
			grab.uv = h.uv;
		};
		const onUp = () => {
			if (!grab) return;
			grab = null;
			if (controls) controls.enabled = controlsWere;
			canvas.style.cursor = '';
		};
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		return {
			dispose() {
				off();
				api = null;
				for (const l of labels) l.remove();
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
			}
		};
	}

	// the keyboard way to slide the bands: focus one and use the arrow keys
	function keyFor(set: (d: number) => void) {
		return (e: KeyboardEvent) => {
			const k = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[e.key];
			if (!k) return;
			e.preventDefault();
			set((e.shiftKey ? 0.05 : 0.01) * k);
		};
	}
	const keyA = keyFor((d) => (uA = frac(uA + d)));
	const keyB = keyFor((d) => (vB = frac(vB + d)));

	$effect(() => {
		void sim;
		api?.rebuild();
	});
</script>

<div class="bands">
	<div class="stage">
		<!-- signs next to the crossings are 3D labels; style them as small pills -->
		<Scene3D
			{setup}
			height={460}
			animate
			camera={{ position: [0.2, 3.3, 5.5], fov: 38 }}
			controls={{ autoRotate: false }}
			label="A glassy torus with a gold band running around its tube and a teal band running around its hole; either band can be dragged along the surface. Where the bands cross, a small rose patch glows; signs +1 or −1 mark each crossing."
		/>
		<div
			class="keys"
			role="slider"
			tabindex="0"
			aria-label="Band α: arrow keys slide it around the hole"
			aria-valuemin={0}
			aria-valuemax={99}
			aria-valuenow={Math.round(uA * 100)}
			onkeydown={keyA}
		></div>
		<div
			class="keys"
			role="slider"
			tabindex="0"
			aria-label="Band β: arrow keys slide it around the tube"
			aria-valuemin={0}
			aria-valuemax={99}
			aria-valuenow={Math.round(vB * 100)}
			onkeydown={keyB}
		></div>
	</div>
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
		<Timeline bind:value={wiggle} from="α straight" to="α bent" duration={3} label="Bending α into an S" />
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
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.6rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.stage {
		position: relative;
	}
	.keys {
		position: absolute;
		inset: 0;
		pointer-events: none;
		outline: none;
	}
	.keys:focus-visible {
		outline: 2px solid var(--gold-bright);
		outline-offset: -4px;
	}
	@container figure (max-width: 640px) {
		.k {
			min-width: 0;
		}
	}
</style>
