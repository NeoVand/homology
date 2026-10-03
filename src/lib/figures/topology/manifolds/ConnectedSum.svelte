<script lang="ts">
	// The connected sum T² # T², step by step: two tori; cut a small disk out of
	// each; join the two boundary circles with a tube; smooth the result into
	// the surface of genus two.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowTube } from '$lib/three/materials';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { connectedSumShapes, genusShape, surfaceNets, type Field } from './implicit';
	import { implicitGlass } from './implicitMaterial';
	import { linkOfPatch } from './link';

	let step = $state(0);
	let api: { set(step: number): void } | null = null;
	const labels = ['Two tori', 'Cut a small disk out of each', 'Join the two circles with a tube', 'Smooth it out: genus two'];

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		ctx.camera.near = 0.5;
		ctx.camera.far = 80;
		ctx.camera.updateProjectionMatrix();
		const cs = connectedSumShapes();
		const g2 = genusShape(2);
		const cutR = 0.34;

		const meshOf = (f: Field, min: [number, number, number], max: [number, number, number], h: number) => {
			const m = surfaceNets(f, min, max, h);
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
			geo.setAttribute('normal', new THREE.BufferAttribute(m.normals, 3));
			geo.setIndex(new THREE.BufferAttribute(m.indices, 1));
			return geo;
		};
		const apartGeo = meshOf(cs.apart.f, cs.apart.min, cs.apart.max, 0.05);
		const apart = implicitGlass(apartGeo, { centres: [-cs.c, cs.c], R: cs.R, grid: [28, 14], opacity: 0.82 });
		const joined = implicitGlass(meshOf(cs.joined.f, cs.joined.min, cs.joined.max, 0.045), {
			centres: [-cs.c, cs.c],
			R: cs.R,
			grid: [28, 14],
			opacity: 0.82
		});
		const pretzel = implicitGlass(meshOf(g2.f, g2.min, g2.max, 0.045), { centres: g2.centres, R: g2.R, grid: [28, 14], opacity: 0.82 });
		const root = new THREE.Group();
		root.add(apart.group, joined.group, pretzel.group);
		scene.add(root);

		// the circles along which the disks are cut (where small spheres meet the tori)
		const rims = new THREE.Group();
		for (const sgn of [-1, 1]) {
			const cx = sgn * cs.c;
			const patch = {
				periodicU: true,
				fn: (u: number, v: number): [number, number, number] => {
					const th = 2 * Math.PI * u;
					const ph = 2 * Math.PI * v;
					const w = cs.R + cs.r * Math.cos(ph);
					return [cx + w * Math.cos(th), cs.r * Math.sin(ph), w * Math.sin(th)];
				}
			};
			const centre: [number, number, number] = [-sgn * cs.facing, 0, 0];
			for (const l of linkOfPatch(patch, centre, cutR, 160, 160))
				rims.add(
					glowTube(new THREE.CatmullRomCurve3(l.points.map((p) => new THREE.Vector3(...p)), l.closed), {
						color: 'gold',
						closed: l.closed,
						radius: 0.022,
						segments: 160
					})
				);
		}
		root.add(rims);
		const fit = Math.min(1, (2 * ctx.camera.position.length() * Math.tan((ctx.camera.fov * Math.PI) / 360) * Math.max(0.7, ctx.container.clientWidth / ctx.container.clientHeight) * 0.86) / 6.4);
		root.scale.setScalar(fit);

		const stages = [apart, joined, pretzel];
		const visibleStage = (k: number) => (k <= 1 ? 0 : k === 2 ? 1 : 2);
		let shown = 0;
		let anim: (() => void) | null = null;
		const showOnly = (i: number) => stages.forEach((s, j) => (s.group.visible = j === i));
		showOnly(0);

		api = {
			set(k) {
				const target = visibleStage(k);
				rims.visible = k === 1 || k === 2;
				apart.setCuts(k >= 1 ? [-cs.facing, 0, 0, cutR] : [0, 0, 0, 0], k >= 1 ? [cs.facing, 0, 0, cutR] : [0, 0, 0, 0]);
				anim?.();
				anim = null;
				if (target === shown || ctx.reducedMotion) {
					shown = target;
					showOnly(target);
					stages.forEach((s) => s.setFade(1));
					ctx.invalidate();
					return;
				}
				const from = stages[shown];
				const to = stages[target];
				to.group.visible = true;
				to.setFade(0);
				let t = 0;
				anim = ctx.onFrame((_t, dt) => {
					t = Math.min(1, t + dt / 0.8);
					const e = 1 - Math.pow(1 - t, 3);
					from.setFade(1 - e);
					to.setFade(e);
					if (t >= 1) {
						shown = target;
						showOnly(target);
						from.setFade(1);
						anim?.();
						anim = null;
					}
				});
			}
		};
		api.set(step);
		return { dispose: () => (api = null) };
	}

	$effect(() => {
		const k = step;
		api?.set(k);
	});
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={400}
		camera={{ position: [0, 3.3, 6.4], fov: 40 }}
		controls={{ autoRotate: false }}
		label="Two tori; a small disk is cut out of each, the two boundary circles are joined by a tube, and the result is smoothed into a surface with two holes"
	/>
	<Controls>
		<StepControls bind:step count={labels.length} {labels} interval={2200} />
	</Controls>
</div>
