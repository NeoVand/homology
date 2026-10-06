<script lang="ts">
	// Poincaré duality on the torus made visible: the same curve C, seen as a
	// loop (a homology class) or as a fence (the cohomology class "count my
	// crossings"). A test loop γ is measured by the fence: ⟨PD[C], γ⟩ = γ · C.
	// Grab γ on the surface and drag it around: the crossings move, the count
	// does not.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, glowTube, disposeTree } from '$lib/three/materials';
	import { surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { bandMesh, crossingPatch, fovFitter, liftPoint, nearestParam, orientedTorus, type UV } from '../cup-product/bands3d';
	import { arcCrossings, samplePath, wrapToSquare } from '../cup-product/flat';

	type Cls = '1,0' | '0,1' | '1,1' | '1,-1' | '2,1';
	let view = $state<'loop' | 'fence'>('loop');
	let cls = $state<Cls>('0,1');
	let tst = $state<Cls>('1,0');
	// a point of the square that γ passes through
	let base = $state<UV>([0.3, 0.93]);

	const pq = (c: Cls): [number, number] => c.split(',').map(Number) as [number, number];
	const curveC = (c: Cls) => {
		const [p, q] = pq(c);
		return (t: number): UV => [0.27 + 0.0013 + p * t, 0.7 + 0.0007 + q * t];
	};
	const curveG = (c: Cls, b: UV) => {
		const [p, q] = pq(c);
		return (t: number): UV => [b[0] + 0.0021 + p * t, b[1] + 0.0011 + q * t];
	};
	const frac = (x: number) => x - Math.floor(x);
	function moveBase(dx: number, dy: number) {
		base = [frac(base[0] + dx), frac(base[1] + dy)];
	}

	const sim = $derived.by(() => {
		const C = curveC(cls);
		const G = curveG(tst, base);
		const F = wrapToSquare(samplePath(C, 400));
		const Gw = wrapToSquare(samplePath(G, 400));
		// signs det[τ_γ, τ_C]: the fence of C counts γ crossing C from C's left to its right
		const crossings = arcCrossings(Gw, F);
		const [p, q] = pq(cls);
		const [r, s] = pq(tst);
		return { C, G, crossings, det: r * q - s * p, p, q, r, s };
	});
	const signedSum = $derived(sim.crossings.reduce((a, c) => a + c.sign, 0));
	const readTeX = $derived.by(() => {
		const terms = sim.crossings.map((c) => (c.sign > 0 ? '(+1)' : '(-1)'));
		const sum = signedSum;
		const lhs = view === 'fence' ? `\\langle \\mathrm{PD}[C],\\gamma\\rangle` : `\\gamma\\cdot C`;
		const mid = terms.length > 1 ? `${terms.join('+')} = ` : '';
		return `${lhs} = ${mid}${sum > 0 ? '+' : ''}${sum}`;
	});
	const detTeX = $derived(
		`\\det\\begin{pmatrix} ${sim.r} & ${sim.s} \\\\ ${sim.p} & ${sim.q}\\end{pmatrix} = ${sim.r}\\cdot ${sim.q} - ${sim.s}\\cdot ${sim.p} = ${sim.det}`
	);

	let api: { rebuild(): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		const f = orientedTorus(1.6, 0.62);
		const glass = glassMesh(surfaceGeometry(f, 180, 72), { opacity: 0.74, grid: [48, 18], gridStrength: 0.18, brightness: 0.85 });
		scene.add(glass);
		const dyn = new THREE.Group();
		scene.add(dyn);
		let labels: LabelHandle[] = [];
		const anim = ctx.reducedMotion ? 0 : 1;
		let movers: { obj: InstanceType<typeof THREE.Group>; c: (t: number) => UV; phase: number }[] = [];

		function rebuild() {
			disposeTree(dyn);
			dyn.clear();
			for (const l of labels) l.remove();
			labels = [];
			movers = [];
			const s = sim;
			if (view === 'loop') {
				dyn.add(glowTube(new SurfaceCurve(f, s.C, 0.014), { color: 'gold', closed: true, radius: 0.03, segments: 400 }));
				// beads gliding along C show its direction
				for (let k = 0; k < 4; k++) {
					const bead = glowPoint([0, 0, 0], { color: 'gold', size: 0.03, halo: 7 });
					dyn.add(bead);
					movers.push({ obj: bead, c: s.C, phase: k / 4 });
				}
			} else {
				dyn.add(bandMesh(f, s.C, 0.1, 'teal', { anim, segments: 420 }));
			}
			dyn.add(glowTube(new SurfaceCurve(f, s.G, 0.02), { color: 'violet', closed: true, radius: 0.022, segments: 400 }));
			for (let k = 0; k < 3; k++) {
				const bead = glowPoint([0, 0, 0], { color: 'violet', size: 0.025, halo: 6 });
				dyn.add(bead);
				movers.push({ obj: bead, c: s.G, phase: k / 3 + 0.1 });
			}
			for (const c of s.crossings) {
				const tC = nearestParam(s.C, c.p);
				const tG = nearestParam(s.G, c.p);
				const patch = crossingPatch(f, s.C, tC, s.G, tG, view === 'fence' ? 0.1 : 0.05);
				if (view === 'fence') dyn.add(patch.mesh);
				dyn.add(glowPoint(patch.center.clone().addScaledVector(patch.normal, 0.012), { color: 'rose', size: 0.04, halo: 8 }));
				labels.push(ctx.label(patch.center.clone().addScaledVector(patch.normal, 0.27), c.sign > 0 ? '+1' : '−1', { className: 'rose sign3d', normal: patch.normal }));
			}
			const [cx, cy] = s.C(0.1);
			const lc = liftPoint(f, cx, cy, 0.3);
			labels.push(ctx.label(lc.P, tex('C'), { className: view === 'loop' ? 'gold' : 'teal', normal: lc.N }));
			const [gx, gy] = s.G(0.62);
			const lg = liftPoint(f, gx, gy, 0.3);
			labels.push(ctx.label(lg.P, tex('\\gamma'), { className: 'violet', normal: lg.N }));
			placeMovers(0);
			ctx.invalidate();
		}
		function placeMovers(time: number) {
			for (const m of movers) {
				const u = (((m.phase + time * 0.06 * anim) % 1) + 1) % 1;
				const [x, y] = m.c(u);
				const { P } = liftPoint(f, x, y, 0.03);
				m.obj.position.copy(P);
			}
		}
		const fit = fovFitter(ctx.camera, 38);
		const off = ctx.onFrame((time) => {
			fit();
			placeMovers(time);
		});
		api = { rebuild };
		rebuild();

		// ── grab γ and drag it across the surface ──
		const { canvas, controls } = ctx;
		const surface = glass.children[1];
		const onSurface = (e: PointerEvent) => {
			const hit = ctx.pick(e, [surface])[0];
			return hit?.uv ? { uv: [hit.uv.x, hit.uv.y] as UV, point: hit.point } : null;
		};
		const nearGamma = (e: PointerEvent) => {
			const h = onSurface(e);
			if (!h) return null;
			const [x, y] = sim.G(nearestParam(sim.G, h.uv, 200));
			return liftPoint(f, x, y, 0).P.distanceTo(h.point) < 0.24 ? h.uv : null;
		};
		let grab: UV | null = null;
		let controlsWere = true;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			const uv = nearGamma(e);
			if (!uv) return;
			grab = uv;
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
		};
		const onMove = (e: PointerEvent) => {
			if (!grab) {
				if (e.pointerType === 'mouse') canvas.style.cursor = nearGamma(e) ? 'grab' : '';
				return;
			}
			const h = onSurface(e);
			if (!h) return;
			// the shortest way round from the last point, so crossing the seam is seamless
			const d = (a: number, b: number) => a - b - Math.round(a - b);
			moveBase(d(h.uv[0], grab[0]), d(h.uv[1], grab[1]));
			grab = h.uv;
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

	$effect(() => {
		void sim;
		void view;
		api?.rebuild();
	});

	// arrow keys push γ sideways, across its own direction
	function key(e: KeyboardEvent) {
		const k = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[e.key];
		if (!k) return;
		e.preventDefault();
		const L = Math.hypot(sim.r, sim.s);
		const step = (e.shiftKey ? 0.05 : 0.01) * k;
		moveBase((-sim.s / L) * step, (sim.r / L) * step);
	}
	const offset = $derived(Math.round(frac(sim.r * base[1] - sim.s * base[0]) * 100));

	const opts = [
		{ value: '1,0' as Cls, label: '(1,0)' },
		{ value: '0,1' as Cls, label: '(0,1)' },
		{ value: '1,1' as Cls, label: '(1,1)' },
		{ value: '1,-1' as Cls, label: '(1,−1)' },
		{ value: '2,1' as Cls, label: '(2,1)' }
	];
</script>

<div class="lf">
	<div class="stage">
		<Scene3D
			{setup}
			height={440}
			animate
			camera={{ position: [0.2, 3.4, 5.4], fov: 38 }}
			label="A glassy torus carrying a curve C, drawn either as a gold loop with beads gliding along it, or as a teal fence band with chevrons, together with a violet test loop gamma that can be dragged across the surface. Their crossings glow rose with signs."
		/>
		<!-- the keyboard way to move γ: focus the picture and use the arrow keys -->
		<div
			class="keys"
			role="slider"
			tabindex="0"
			aria-label="Test loop γ: arrow keys slide it sideways across the torus"
			aria-valuemin={0}
			aria-valuemax={99}
			aria-valuenow={offset}
			aria-valuetext="γ crosses C {sim.crossings.length} {sim.crossings.length === 1 ? 'time' : 'times'}, signed count {signedSum}"
			onkeydown={key}
		></div>
	</div>
	<div class="read ui" aria-live="polite">
		<div class="row"><span class="k">signed crossings</span><TeX tex={readTeX} /></div>
		<div class="row"><span class="k">intersection number</span><TeX tex={detTeX} /></div>
	</div>
	<div class="ctl ui">
		<Segmented
			bind:value={view}
			label="See C as"
			options={[
				{ value: 'loop', label: 'C as a loop (homology)' },
				{ value: 'fence', label: 'C as a fence (cohomology)' }
			]}
		/>
		<div class="pick">
			<span class="lbl">class of C</span>
			<Segmented bind:value={cls} label="Class of C" options={opts} />
		</div>
		<div class="pick">
			<span class="lbl">class of γ</span>
			<Segmented bind:value={tst} label="Class of the test loop" options={opts} />
		</div>
	</div>
</div>

<style>
	.lf :global(.lbl3d.sign3d) {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.8rem;
		padding: 0.05rem 0.4rem;
		border-radius: 999px;
		background: rgba(20, 8, 16, 0.72);
		border: 1px solid rgba(242, 141, 182, 0.55);
		text-shadow: none;
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
	.read {
		display: grid;
		gap: 0.3rem;
		padding: 0.7rem 1.2rem 0.6rem;
		border-top: 1px solid var(--line-faint);
		color: var(--ink-bright);
		font-size: 0.95rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.9rem;
	}
	.k {
		min-width: 11rem;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.ctl {
		display: grid;
		gap: 0.7rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.pick {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem 0.8rem;
	}
	.lbl {
		font-size: 0.76rem;
		color: var(--ink-dim);
		min-width: 5.5rem;
	}
</style>
