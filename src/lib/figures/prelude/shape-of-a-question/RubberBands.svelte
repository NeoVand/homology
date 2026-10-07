<script lang="ts">
	// Pull rubber bands tight. On the sphere every band slides off and shrinks
	// to a point (it bounds a cap). On the torus, a small band shrinks too —
	// but the band around the tube cannot: it encircles a hole.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import { glassMesh, glowTube, disposeTree, faceMaterial } from '$lib/three/materials';
	import { sphere, torus, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import * as THREE from 'three';

	let pull = $state(0);
	let cw = $state(0);
	const narrow = $derived(cw > 0 && cw < 520);
	let api: { set(p: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, label, invalidate } = ctx;
		// on narrow plates the torus sits below the sphere instead of beside it
		const at = (k: number): [number, number] => (narrow ? [0, k === 0 ? 2.15 : -2.15] : [k === 0 ? -2.4 : 2.4, 0]);
		const R = 1.3;
		const sf = sphere(R);
		const sGroup = new THREE.Group();
		sGroup.position.set(...at(0), 0);
		sGroup.rotation.set(0.35, 0, 0.15);
		sGroup.add(glassMesh(surfaceGeometry(sf, 96, 64), { opacity: 0.75, grid: [28, 14], gridStrength: 0.16 }));
		scene.add(sGroup);

		const tf = torus(1.2, 0.5);
		const tGroup = new THREE.Group();
		tGroup.position.set(...at(1), 0);
		tGroup.rotation.set(1.0, 0, -0.2);
		tGroup.add(glassMesh(surfaceGeometry(tf, 140, 60), { opacity: 0.78, grid: [42, 16], gridStrength: 0.16, hue: 0.5 }));
		scene.add(tGroup);

		const stuckLabel = label([at(1)[0], at(1)[1] - 1.75, 0], 'this band is stuck', { className: 'tag small rose' });
		const shrinkLabel = label([at(0)[0], at(0)[1] - 1.75, 0], 'shrinks to a point', { className: 'tag small teal' });

		let dyn: THREE.Object3D[] = [];
		const clear = () => {
			for (const o of dyn) {
				o.parent?.remove(o);
				disposeTree(o);
			}
			dyn = [];
		};

		const set = (p: number) => {
			clear();
			// sphere: a latitude circle sliding from the equator to the north pole
			const colat = (Math.PI / 2) * (1 - p) + 0.0001;
			const v = colat / Math.PI;
			if (p < 0.995) {
				const band = glowTube(new SurfaceCurve(sf, (t) => [t, v], 0.015), { color: 'teal', radius: 0.03, closed: true, segments: 120 });
				sGroup.add(band);
				dyn.push(band);
			}
			// the cap it bounds
			const cap = new THREE.Mesh(
				new THREE.SphereGeometry(R + 0.01, 64, 24, 0, Math.PI * 2, 0, Math.max(0.0001, colat)),
				faceMaterial('teal', 0.34)
			);
			cap.renderOrder = 3;
			sGroup.add(cap);
			dyn.push(cap);

			// torus: a small loop that shrinks …
			const r0 = 0.065 * (1 - p);
			if (r0 > 0.002) {
				const small = glowTube(
					new SurfaceCurve(tf, (t) => [0.62 + r0 * Math.cos(2 * Math.PI * t), 0.24 + 2.2 * r0 * Math.sin(2 * Math.PI * t)], 0.015),
					{ color: 'teal', radius: 0.026, closed: true, segments: 90 }
				);
				tGroup.add(small);
				dyn.push(small);
			}
			// … and the band around the tube, which can slide but never shrink
			const u = 0.1 + 0.18 * p;
			const wobble = 0.03 * Math.sin(p * Math.PI * 6);
			const stuck = glowTube(new SurfaceCurve(tf, (t) => [u + wobble * Math.sin(2 * Math.PI * t), t], 0.015), {
				color: p > 0.6 ? 'rose' : 'gold',
				radius: 0.032,
				closed: true,
				segments: 120
			});
			tGroup.add(stuck);
			dyn.push(stuck);

			stuckLabel.show(p > 0.6);
			shrinkLabel.show(p > 0.85);
			invalidate();
		};
		set(pull);
		api = { set };
		return {
			dispose: () => {
				api = null;
			}
		};
	}

	$effect(() => {
		const v = pull; // read first, so the effect tracks it even before the scene exists
		api?.set(v);
	});
</script>

<div bind:clientWidth={cw}>
	<Scene3D
		{setup}
		height={narrow ? 540 : 360}
		camera={narrow ? { position: [0, -0.75, 12.6], target: [0, -0.75, 0], fov: 38 } : { position: [0, 0.3, 8.4], fov: 38 }}
		label="Rubber bands on a sphere and on a torus. As they are pulled tight, the band on the sphere and a small band on the torus shrink to points, while the band around the torus's tube cannot shrink."
	/>
</div>
<Controls>
	<Timeline bind:value={pull} duration={2.8} from="loose" to="pulled tight" label="Pulling the rubber bands tight" />
</Controls>
