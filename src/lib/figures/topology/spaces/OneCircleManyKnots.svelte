<script lang="ts">
	// Every knot is a circle: colour the round circle like a wheel, and give each
	// point of the knot the colour of the point it came from — the colours run
	// round the knot in the same order, with no jumps, so the knot is the circle,
	// bent. Then try to straighten it by force: slide each point straight
	// towards its place on a round circle. A real string cannot do that: at one
	// moment the strand must pass through itself (rose), and only after that is
	// the knot gone. The moment is found by computing the knot's Jones
	// polynomial along the way ($lib/knots).
	import { untrack } from 'svelte';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import { glowPoint, gradientTube, disposeTree } from '$lib/three/materials';
	import { tex } from '$lib/katex/render';
	import { fovFitter } from '$lib/figures/cohomology/cup-product/bands3d';
	import { figureEight, sampleClosed } from '$lib/knots/curves';
	import { tangledUnknot } from '$lib/knots/table';
	import { resample } from '$lib/knots/relax';
	import { between, untie } from '$lib/knots/untie';
	import type { V3 } from '$lib/knots/diagram';
	import { closedCurve, wheelColor, wheelCss } from '$lib/figures/homology/knots/kit';

	type Which = 'trefoil' | 'eight' | 'tangle';
	let which = $state<Which>('trefoil');
	let s = $state(0);

	const N = 200;
	const TAU = Math.PI * 2;
	const R = 1.55;
	const ring = sampleClosed((t) => [R * Math.cos(TAU * t), R * Math.sin(TAU * t), 0], N);
	const shapes: Record<Which, () => V3[]> = {
		// the classic three-lobed picture: (sin t + 2 sin 2t, cos t − 2 cos 2t, −sin 3t)
		trefoil: () =>
			resample(
				sampleClosed((u) => {
					const t = TAU * u;
					return [0.55 * (Math.sin(t) + 2 * Math.sin(2 * t)), 0.55 * (Math.cos(t) - 2 * Math.cos(2 * t)), -0.55 * Math.sin(3 * t)];
				}, 400),
				N
			),
		eight: () => resample(figureEight(0.55)[0], N),
		tangle: () => resample(tangledUnknot()[0].map(([x, y, z]) => [x * 0.9, y * 0.9, z * 0.9] as V3), N)
	};
	const names: Record<Which, string> = { trefoil: 'the trefoil', eight: 'the figure-eight knot', tangle: 'a tangled loop' };

	// the knot, and when (if ever) forcing it round makes it pass through itself
	const model = $derived.by(() => {
		const K = shapes[which]();
		return { K, ...untie(K, ring, 80) };
	});
	const near = $derived(model.events.find((e) => Math.abs(e.s - s) < 0.025));
	const passed = $derived(model.events.filter((e) => e.s < s).length);
	const now = $derived(model.stretches.find((x) => s >= x.from && s <= x.to)?.name ?? '');

	let api: { knot(): void; move(): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		const left = new THREE.Group();
		const right = new THREE.Group();
		left.position.set(-2.55, 0, 0);
		right.position.set(1.35, 0, 0);
		scene.add(left, right);
		const tubeL = new THREE.Group();
		const tubeR = new THREE.Group();
		const marks = new THREE.Group();
		left.add(tubeL);
		right.add(tubeR, marks);
		const scaleL = 0.62;
		tubeL.scale.setScalar(scaleL);
		const labels: LabelHandle[] = [];
		const circleLabel = ctx.label(new THREE.Vector3(-2.55, -1.35, 0), tex('S^1'), { className: 'gold' });
		labels.push(circleLabel);
		let knotLabel: LabelHandle | null = null;
		// side by side on a wide figure; the circle above the knot on a narrow one
		let stacked: boolean | null = null;
		function arrange() {
			const narrow = ctx.camera.aspect < 1.1;
			if (narrow === stacked) return;
			stacked = narrow;
			if (narrow) {
				left.position.set(0, 2.05, 0);
				right.position.set(0, -0.85, 0);
				circleLabel.position.set(1.35, 2.05, 0);
			} else {
				left.position.set(-2.55, 0, 0);
				right.position.set(1.35, 0, 0);
				circleLabel.position.set(-2.55, -1.35, 0);
			}
			relabel();
		}

		// the round circle never changes
		tubeL.add(gradientTube(closedCurve(ring), wheelColor, { radius: 0.075, segments: 300 }));

		// three beads: the same three points on the circle and on the knot
		const beadsL = [0, 1, 2].map((k) => glowPoint([0, 0, 0], { color: wheelCss(k / 3), size: 0.07, halo: 7 }));
		const beadsR = [0, 1, 2].map((k) => glowPoint([0, 0, 0], { color: wheelCss(k / 3), size: 0.065, halo: 7 }));
		beadsL.forEach((b) => left.add(b));
		beadsR.forEach((b) => right.add(b));

		let shape: V3[] = model.K;
		function build() {
			disposeTree(tubeR);
			tubeR.clear();
			shape = between(model.K, ring, s);
			tubeR.add(gradientTube(closedCurve(shape), wheelColor, { radius: 0.06, segments: 360, outline: 1.9 }));
			disposeTree(marks);
			marks.clear();
			const e = near;
			if (e) {
				marks.add(glowPoint(e.at, { color: 'rose', size: 0.09, halo: 12 }));
			}
			ctx.invalidate();
		}
		function relabel() {
			knotLabel?.remove();
			const at = stacked ? new THREE.Vector3(0, -2.75, 0) : new THREE.Vector3(1.35, -2.0, 0);
			knotLabel = ctx.label(at, names[which], { className: 'small' });
		}
		const at = (pts: V3[], u: number) => {
			const x = (((u % 1) + 1) % 1) * pts.length;
			const i = Math.floor(x);
			const f = x - i;
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			return new THREE.Vector3(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f);
		};
		const anim = ctx.reducedMotion ? 0 : 1;
		const fit = fovFitter(ctx.camera, 38);
		const off = ctx.onFrame((t) => {
			arrange();
			if (stacked) {
				if (ctx.camera.fov !== 47) {
					ctx.camera.fov = 47;
					ctx.camera.updateProjectionMatrix();
				}
			} else fit();
			for (let k = 0; k < 3; k++) {
				const u = k / 3 + t * 0.035 * anim;
				beadsL[k].position.copy(at(ring, u).multiplyScalar(scaleL));
				beadsR[k].position.copy(at(shape, u));
			}
			return anim > 0;
		});
		api = {
			knot() {
				relabel();
				build();
			},
			move: build
		};
		relabel();
		build();
		return {
			dispose() {
				off();
				api = null;
				for (const l of labels) l.remove();
				knotLabel?.remove();
			}
		};
	}

	$effect(() => {
		void model;
		untrack(() => {
			s = 0;
			api?.knot();
		});
	});
	$effect(() => {
		void s;
		void near;
		untrack(() => api?.move());
	});

	const status = $derived(
		near
			? 'Here the strand passes through itself: allowed for a map, impossible for a string.'
			: s === 0
				? `Every point of ${names[which]} has the colour of the point of the circle it came from.`
				: model.events.length === 0
					? `Still ${now}, and it never had to pass through itself.`
					: passed
						? `Now ${now}. On the way, the strand passed through itself.`
						: `Still ${now}: nothing has passed through anything yet.`
	);
</script>

<div class="oc">
	<Scene3D
		{setup}
		height={400}
		animate
		camera={{ position: [-0.5, 0.9, 7.6], fov: 38 }}
		controls={{ autoRotate: false }}
		label="On the left, a round circle coloured like a colour wheel. On the right, a knot whose points carry the colours of the circle's points, in the same order. A slider slides every point of the knot straight towards a round circle; at one moment the strand passes through itself, marked by a rose glow."
	/>
	<p class="status ui" class:pass={!!near} aria-live="polite">{status}</p>
	<div class="ctl ui">
		<Segmented
			bind:value={which}
			label="Which knot"
			options={[
				{ value: 'trefoil', label: 'Trefoil' },
				{ value: 'eight', label: 'Figure-eight' },
				{ value: 'tangle', label: 'A tangled loop' }
			]}
		/>
	</div>
	<div class="tl"><Timeline bind:value={s} duration={6} from="knot" to="circle" label="Pushing every point straight towards a round circle" /></div>
</div>

<style>
	.oc {
		display: grid;
	}
	.status {
		margin: 0.4rem 1.1rem 0;
		min-height: 2.6em;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-align: center;
		text-wrap: balance;
	}
	.status.pass {
		color: var(--rose);
	}
	.tl {
		padding: 0 1rem 0.4rem;
	}
	.ctl {
		display: flex;
		justify-content: center;
		margin: 0.3rem 0 0.2rem;
	}
</style>
