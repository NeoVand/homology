<script lang="ts">
	// Figure: building the torus (or the sphere) as a CW complex, one cell at a
	// time. A point; two loops a and b attached at it; then a disk whose edge is
	// glued along a, b, a⁻¹, b⁻¹ — watch it grow until it closes up.
	import * as THREE from 'three';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowTube, pointCloud, disposeTree, glowPoint } from '$lib/three/materials';
	import { torus, sphere, surfaceGeometry, SurfaceCurve, surfaceNormal, type SurfaceFn } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import { ease } from './kit3d';

	let shape = $state<'torus' | 'sphere'>('torus');
	let step = $state(0);
	const labelsFor = {
		torus: ['One point: a 0-cell', 'Attach a 1-cell: the loop a', 'Attach a 1-cell: the loop b', 'Attach a 2-cell along a b a⁻¹ b⁻¹'],
		sphere: ['One point: a 0-cell', 'Attach a 2-cell along its whole rim']
	};
	const count = $derived(labelsFor[shape].length);
	$effect(() => {
		void shape;
		step = 0;
	});
	const cells = $derived(
		shape === 'torus' ? [[1, 0, 0], [1, 1, 0], [1, 2, 0], [1, 2, 1]][step] : [[1, 0, 0], [1, 0, 1]][step]
	);

	type Api = { show(shape: 'torus' | 'sphere', step: number): void };
	let api = $state.raw<Api | null>(null);
	$effect(() => {
		api?.show(shape, step);
	});

	function setup(ctx: SceneContext) {
		const { scene, invalidate, label, reducedMotion } = ctx;
		let root: THREE.Group | null = null;
		let built: string | null = null;
		let labels: LabelHandle[] = [];

		// animated quantities (current → target)
		const cur = { a: 0, b: 0, s: 0, run: 0 };
		const tgt = { a: 0, b: 0, s: 0, run: 0 };
		let fn: SurfaceFn = torus();
		let tubes: { a?: THREE.Group; b?: THREE.Group } = {};
		let patch: THREE.Group | null = null;
		let patchGeo: THREE.BufferGeometry | null = null;
		let rim: THREE.Points | null = null;
		let runner: THREE.Group | null = null;
		let runnerLabel: LabelHandle | null = null;
		let ghost: THREE.Group | null = null;
		const N = 56;
		const RIM = 260;
		const U0 = 0.25;
		const V0 = 0.25;

		function setDraw(g: THREE.Group | undefined, f: number) {
			if (!g) return;
			g.visible = f > 0.001;
			g.traverse((o) => {
				const m = o as THREE.Mesh;
				if (!m.geometry?.index) return;
				const total = m.geometry.index.count;
				const per = total / 220; // indices per tubular segment (tubes are built with 220 segments)
				m.geometry.setDrawRange(0, Math.round(Math.ceil(f * 220) * per));
			});
		}

		function build(sh: 'torus' | 'sphere') {
			if (root) {
				scene.remove(root);
				disposeTree(root);
			}
			labels.forEach((l) => l.remove());
			labels = [];
			runnerLabel?.remove();
			runnerLabel = null;
			lastSeg = -1;
			root = new THREE.Group();
			tubes = {};
			const p = new THREE.Vector3();
			if (sh === 'torus') {
				fn = torus(1.5, 0.62);
				ghost = glassMesh(surfaceGeometry(fn, 120, 48), { opacity: 0.05, grid: [24, 12], gridStrength: 0.12, rim: 0.25, brightness: 0.6 });
				root.add(ghost);
				tubes.a = glowTube(new SurfaceCurve(fn, (t) => [U0 + t, V0], 0.016), { color: 'gold', radius: 0.03, segments: 220, closed: false, haloScale: 3 });
				tubes.b = glowTube(new SurfaceCurve(fn, (t) => [U0, V0 + t], 0.016), { color: 'teal', radius: 0.03, segments: 220, closed: false, haloScale: 3 });
				root.add(tubes.a, tubes.b);
				fn(U0 + 0.5, V0, p);
				labels.push(label(p.clone().add(new THREE.Vector3(0, 0.32, 0)), tex('a'), { className: 'gold' }));
				fn(U0, V0 + 0.5, p);
				labels.push(label(p.clone().add(new THREE.Vector3(0, -0.12, 0.38)), tex('b'), { className: 'teal' }));
			} else {
				fn = sphere(1.35);
				ghost = glassMesh(surfaceGeometry(fn, 96, 48), { opacity: 0.04, grid: [24, 12], gridStrength: 0.1, rim: 0.2, brightness: 0.6 });
				root.add(ghost);
			}
			// the base point
			const base = new THREE.Vector3();
			if (sh === 'torus') fn(U0, V0, base);
			else fn(0, 0, base);
			const bead = glowPoint(base.clone(), { color: 'goldPale', size: 0.075, halo: 9 });
			root.add(bead);
			labels.push(label(base.clone().add(new THREE.Vector3(0.18, 0.22, 0.12)), tex('v'), { className: 'small' }));

			// the 2-cell (geometry rewritten in place as it grows)
			patchGeo = new THREE.BufferGeometry();
			const pos = new Float32Array((N + 1) * (N + 1) * 3);
			const uv = new Float32Array((N + 1) * (N + 1) * 2);
			for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) uv.set([i / N, j / N], (i * (N + 1) + j) * 2);
			const idx: number[] = [];
			for (let i = 0; i < N; i++)
				for (let j = 0; j < N; j++) {
					const a = i * (N + 1) + j;
					const b = a + N + 1;
					idx.push(a, b, a + 1, b, b + 1, a + 1);
				}
			patchGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
			patchGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
			patchGeo.setIndex(idx);
			patch = glassMesh(patchGeo, { opacity: 0.78, grid: [12, 12], gridStrength: 0.22, film: 1.2, rim: 0.55 });
			patch.visible = false;
			root.add(patch);
			rim = pointCloud(new Float32Array(RIM * 3), { color: 'violet', size: 0.13 });
			rim.visible = false;
			root.add(rim);
			runner = glowPoint([0, 0, 0], { color: 'ivory', size: 0.07, halo: 10 });
			runner.visible = false;
			root.add(runner);
			scene.add(root);
			built = sh;
		}

		const tmp = new THREE.Vector3();
		const nrm = new THREE.Vector3();
		/** parameter rectangle of the growing 2-cell (s from 0 to 1) */
		function rect(s: number): [number, number, number, number] {
			if (built === 'torus') {
				const cu = U0 + 0.5;
				const cv = V0 + 0.5;
				const h = s / 2;
				return [cu - h, cu + h, cv - h, cv + h];
			}
			// sphere: a cap around the south pole whose rim rises to the north pole
			return [0, 1, 1 - s, 1];
		}
		function place(u: number, v: number, out: THREE.Vector3, lift = 0) {
			const uu = ((u % 1) + 1) % 1;
			const vv = built === 'sphere' ? Math.min(1, Math.max(0, v)) : ((v % 1) + 1) % 1;
			fn(uu, vv, out);
			if (lift) {
				surfaceNormal(fn, uu, Math.min(0.9999, Math.max(0.0001, vv)), nrm);
				out.addScaledVector(nrm, lift);
			}
			return out;
		}
		function updatePatch(s: number) {
			if (!patch || !patchGeo || !rim) return;
			const on = s > 0.002;
			patch.visible = on;
			rim.visible = on && s < 0.999;
			if (!on) return;
			const [u0, u1, v0, v1] = rect(s);
			const arr = patchGeo.attributes.position.array as Float32Array;
			const vmax = built === 'sphere' ? 0.997 : Infinity; // keep clear of the pole
			for (let i = 0; i <= N; i++)
				for (let j = 0; j <= N; j++) {
					place(u0 + ((u1 - u0) * i) / N, Math.min(vmax, v0 + ((v1 - v0) * j) / N), tmp, 0.004);
					tmp.toArray(arr, (i * (N + 1) + j) * 3);
				}
			patchGeo.attributes.position.needsUpdate = true;
			patchGeo.computeVertexNormals();
			patchGeo.computeBoundingSphere();
			// the rim of the disk
			const ra = rim.geometry.attributes.position.array as Float32Array;
			for (let k = 0; k < RIM; k++) {
				const t = k / RIM;
				let u: number;
				let v: number;
				if (built === 'torus') {
					const q = t * 4;
					const f = q % 1;
					if (q < 1) [u, v] = [u0 + (u1 - u0) * f, v0];
					else if (q < 2) [u, v] = [u1, v0 + (v1 - v0) * f];
					else if (q < 3) [u, v] = [u1 - (u1 - u0) * f, v1];
					else [u, v] = [u0, v1 - (v1 - v0) * f];
				} else [u, v] = [t, v0];
				place(u, v, tmp, 0.03);
				tmp.toArray(ra, k * 3);
			}
			rim.geometry.attributes.position.needsUpdate = true;
			rim.geometry.computeBoundingSphere();
		}
		const letters = ['a', 'b', 'a^{-1}', 'b^{-1}'];
		function updateRunner(t: number) {
			if (!runner) return;
			runner.visible = built === 'torus' && cur.s > 0.999 && tgt.run > 0;
			if (!runner.visible) {
				runnerLabel?.show(false);
				return;
			}
			const q = (t * 0.25) % 4;
			const f = q % 1;
			const seg = Math.floor(q);
			let u: number;
			let v: number;
			if (seg === 0) [u, v] = [U0 + f, V0];
			else if (seg === 1) [u, v] = [U0 + 1, V0 + f];
			else if (seg === 2) [u, v] = [U0 + 1 - f, V0 + 1];
			else [u, v] = [U0, V0 + 1 - f];
			place(u, v, runner.position, 0.03);
			if (!runnerLabel) runnerLabel = label(runner.position.clone(), '', { className: 'violet' });
			runnerLabel.position.copy(runner.position);
			runnerLabel.position.y += 0.3;
			if (seg !== lastSeg) {
				runnerLabel.set(tex(`\\text{along } ${letters[seg]}`));
				lastSeg = seg;
			}
			runnerLabel.show(true);
		}
		let lastSeg = -1;

		function targets(sh: 'torus' | 'sphere', st: number) {
			if (sh === 'torus') {
				tgt.a = st >= 1 ? 1 : 0;
				tgt.b = st >= 2 ? 1 : 0;
				tgt.s = st >= 3 ? 1 : 0;
				tgt.run = st >= 3 ? 1 : 0;
			} else {
				tgt.a = tgt.b = 0;
				tgt.s = st >= 1 ? 1 : 0;
				tgt.run = 0;
			}
		}

		let prevStep = 0;
		api = {
			show(sh, st) {
				if (sh !== built) {
					build(sh);
					cur.a = cur.b = cur.s = 0;
					prevStep = 0;
				}
				// stepping backwards jumps; stepping forwards animates
				const back = st < prevStep;
				prevStep = st;
				targets(sh, st);
				if (reducedMotion || back) {
					cur.a = tgt.a;
					cur.b = tgt.b;
					cur.s = tgt.s;
				}
				setDraw(tubes.a, cur.a);
				setDraw(tubes.b, cur.b);
				updatePatch(cur.s);
				invalidate();
			}
		};
		api.show(shape, step);

		let clock = 0;
		return {
			update(t: number, dt: number) {
				let moved = false;
				const go = (k: 'a' | 'b' | 's', speed: number) => {
					if (Math.abs(cur[k] - tgt[k]) < 1e-4) return;
					const dir = Math.sign(tgt[k] - cur[k]);
					cur[k] = Math.min(1, Math.max(0, cur[k] + dir * dt * speed));
					if ((dir > 0 && cur[k] > tgt[k]) || (dir < 0 && cur[k] < tgt[k])) cur[k] = tgt[k];
					moved = true;
				};
				go('a', 0.8);
				if (cur.a >= tgt.a) go('b', 0.8);
				if (cur.b >= tgt.b && cur.a >= tgt.a) go('s', 0.42);
				if (moved) {
					setDraw(tubes.a, ease(cur.a));
					setDraw(tubes.b, ease(cur.b));
					updatePatch(ease(cur.s));
				}
				if (cur.s > 0.999 && tgt.run > 0) clock += dt;
				else clock = 0;
				updateRunner(clock);
				void t;
			},
			dispose() {
				api = null;
			}
		};
	}
</script>

<Scene3D
	{setup}
	height={420}
	camera={{ position: [0, 3.0, 5.2], fov: 40 }}
	controls={{ autoRotate: true, autoRotateSpeed: 0.35 }}
	label="A torus built from cells: a point, two loops through it, and a disk whose edge is glued along the loops"
/>
<div class="readout ui" aria-live="polite">
	<div class="cells">
		<span><b>{cells[0]}</b> point{cells[0] === 1 ? '' : 's'}</span>
		<span><b>{cells[1]}</b> {cells[1] === 1 ? 'loop' : 'loops'}</span>
		<span><b>{cells[2]}</b> {cells[2] === 1 ? 'disk' : 'disks'}</span>
	</div>
	<div class="alt">
		<TeX tex={`c_0 - c_1 + c_2 = ${cells[0]} - ${cells[1]} + ${cells[2]} = ${cells[0] - cells[1] + cells[2]}`} />
	</div>
</div>
<div class="bar ui">
	<Segmented
		bind:value={shape}
		options={[
			{ value: 'torus', label: 'Torus' },
			{ value: 'sphere', label: 'Sphere' }
		]}
		label="Shape"
	/>
	<StepControls bind:step {count} labels={labelsFor[shape]} interval={3200} />
</div>

<style>
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.4rem 1.4rem;
		padding: 0.4rem 1.2rem 0.7rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.cells {
		display: flex;
		gap: 0.9rem;
	}
	.cells b {
		color: var(--gold-bright);
		font-size: 1.05rem;
	}
	.alt {
		color: var(--ink-bright);
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
</style>
