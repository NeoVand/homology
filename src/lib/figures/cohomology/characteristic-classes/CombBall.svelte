<script lang="ts">
	// Figure: combing a hairy sphere and a hairy torus. Each mode is a tangent
	// vector field, drawn as combed hairs and as drifting particles. On the
	// sphere every field has zeros (cowlicks), and their indices always add up
	// to 2; on the torus the hair can lie flat everywhere, and any zeros that do
	// appear have indices adding up to 0.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, pointCloud } from '$lib/three/materials';
	import { sphere as sphereFn, torus as torusFn, surfaceGeometry } from '$lib/three/surfaces';
	import type * as THREE_NS from 'three';

	type Field = 'spin' | 'flow' | 'dipole' | 'around' | 'wind';
	let field = $state<Field>('spin');
	const isSphere = (f: Field) => f === 'spin' || f === 'flow' || f === 'dipole';

	const RS = 1.25; // sphere radius
	const RT = 1.35; // torus: centre-line radius
	const rt = 0.56; // torus: tube radius

	// zeros (positions on the unit sphere / angles on the torus) and indices
	const zeros: Record<Field, { p: [number, number, number]; index: number; name: string }[]> = {
		spin: [
			{ p: [0, 1, 0], index: 1, name: 'centre' },
			{ p: [0, -1, 0], index: 1, name: 'centre' }
		],
		flow: [
			{ p: [0, 1, 0], index: 1, name: 'source' },
			{ p: [0, -1, 0], index: 1, name: 'sink' }
		],
		dipole: [{ p: [0, 1, 0], index: 2, name: 'dipole' }],
		around: [],
		wind: [
			{ p: [RT + rt, 0, 0], index: 1, name: 'sink' },
			{ p: [RT - rt, 0, 0], index: -1, name: 'saddle' },
			{ p: [-(RT - rt), 0, 0], index: -1, name: 'saddle' },
			{ p: [-(RT + rt), 0, 0], index: 1, name: 'source' }
		]
	};

	// the fields, at a point p of the surface (sphere: |p| = RS; torus: on the torus)
	function vec(f: Field, x: number, y: number, z: number, out: number[]) {
		if (f === 'spin') {
			out[0] = z;
			out[1] = 0;
			out[2] = -x;
		} else if (f === 'flow') {
			const ux = x / RS;
			const uy = y / RS;
			const uz = z / RS;
			out[0] = uy * ux;
			out[1] = uy * uy - 1;
			out[2] = uy * uz;
		} else if (f === 'dipole') {
			const ux = x / RS;
			const uy = y / RS;
			const uz = z / RS;
			out[0] = 1 - uy - ux * ux;
			out[1] = ux * (1 - uy);
			out[2] = -ux * uz;
		} else if (f === 'around') {
			const rho = Math.hypot(x, z) || 1;
			out[0] = -z / rho;
			out[1] = 0;
			out[2] = x / rho;
		} else {
			// wind along +x, projected to the tangent plane of the torus
			const rho = Math.hypot(x, z) || 1;
			const cx = (RT * x) / rho;
			const cz = (RT * z) / rho;
			const nx = (x - cx) / rt;
			const ny = y / rt;
			const nz = (z - cz) / rt;
			out[0] = 1 - nx * nx;
			out[1] = -nx * ny;
			out[2] = -nx * nz;
		}
	}
	function project(f: Field, p: number[]) {
		if (isSphere(f)) {
			const l = Math.hypot(p[0], p[1], p[2]) || 1;
			p[0] *= RS / l;
			p[1] *= RS / l;
			p[2] *= RS / l;
		} else {
			const rho = Math.hypot(p[0], p[2]) || 1;
			const cx = (RT * p[0]) / rho;
			const cz = (RT * p[2]) / rho;
			const dx = p[0] - cx;
			const dy = p[1];
			const dz = p[2] - cz;
			const l = Math.hypot(dx, dy, dz) || 1;
			p[0] = cx + (rt * dx) / l;
			p[1] = (rt * dy) / l;
			p[2] = cz + (rt * dz) / l;
		}
	}
	function normalAt(f: Field, p: number[], out: number[]) {
		if (isSphere(f)) {
			out[0] = p[0] / RS;
			out[1] = p[1] / RS;
			out[2] = p[2] / RS;
		} else {
			const rho = Math.hypot(p[0], p[2]) || 1;
			out[0] = (p[0] - (RT * p[0]) / rho) / rt;
			out[1] = p[1] / rt;
			out[2] = (p[2] - (RT * p[2]) / rho) / rt;
		}
	}

	// seed points spread over each surface
	function seeds(f: Field): number[][] {
		const pts: number[][] = [];
		if (isSphere(f)) {
			const n = 1500;
			const ga = Math.PI * (3 - Math.sqrt(5));
			for (let i = 0; i < n; i++) {
				const y = 1 - (2 * (i + 0.5)) / n;
				const r = Math.sqrt(1 - y * y);
				pts.push([RS * r * Math.cos(ga * i), RS * y, RS * r * Math.sin(ga * i)]);
			}
		} else {
			const nu = 96;
			const nv = 30;
			for (let i = 0; i < nu; i++)
				for (let j = 0; j < nv; j++) {
					const u = (2 * Math.PI * (i + (j % 2) * 0.5)) / nu;
					const v = (2 * Math.PI * j) / nv;
					const w = RT + rt * Math.cos(v);
					pts.push([w * Math.cos(u), rt * Math.sin(v), w * Math.sin(u)]);
				}
		}
		return pts;
	}

	let api: { set(f: Field): void } | null = null;

	function setup({ scene, THREE, invalidate, onFrame, reducedMotion, label }: SceneContext) {
		const sGroup = new THREE.Group();
		const tGroup = new THREE.Group();
		scene.add(sGroup, tGroup);
		sGroup.add(glassMesh(surfaceGeometry(sphereFn(RS * 0.995), 96, 48), { opacity: 0.9, grid: [24, 12], gridStrength: 0.12, tint: 'blue', tintMix: 0.45, brightness: 0.8 }));
		tGroup.add(glassMesh(surfaceGeometry(torusFn(RT, rt * 0.99), 140, 48), { opacity: 0.9, grid: [36, 12], gridStrength: 0.12, tint: 'blue', tintMix: 0.45, brightness: 0.8 }));

		let hairs: THREE_NS.LineSegments | null = null;
		let zeroGroup = new THREE.Group();
		scene.add(zeroGroup);
		const zeroLabels: ReturnType<typeof label>[] = [];

		// drifting particles
		const NP = 900;
		const pPos = new Float32Array(NP * 3);
		const life = new Float32Array(NP);
		const particles = pointCloud(pPos, { color: 'gold', size: 0.05, opacity: 0.95 });
		particles.frustumCulled = false;
		scene.add(particles);
		const pAttr = particles.geometry.attributes.position as THREE_NS.BufferAttribute;
		const tmp = [0, 0, 0];
		const nrm = [0, 0, 0];
		let current: Field = field;

		function respawn(i: number) {
			// a random point on the current surface
			if (isSphere(current)) {
				const y = 2 * Math.random() - 1;
				const t = 2 * Math.PI * Math.random();
				const r = Math.sqrt(1 - y * y);
				tmp[0] = RS * r * Math.cos(t);
				tmp[1] = RS * y;
				tmp[2] = RS * r * Math.sin(t);
			} else {
				const u = 2 * Math.PI * Math.random();
				const v = 2 * Math.PI * Math.random();
				const w = RT + rt * Math.cos(v);
				tmp[0] = w * Math.cos(u);
				tmp[1] = rt * Math.sin(v);
				tmp[2] = w * Math.sin(u);
			}
			normalAt(current, tmp, nrm);
			pPos[3 * i] = tmp[0] + nrm[0] * 0.02;
			pPos[3 * i + 1] = tmp[1] + nrm[1] * 0.02;
			pPos[3 * i + 2] = tmp[2] + nrm[2] * 0.02;
			life[i] = 1.5 + 3.5 * Math.random();
		}

		function build(f: Field) {
			current = f;
			sGroup.visible = isSphere(f);
			tGroup.visible = !isSphere(f);
			if (hairs) {
				scene.remove(hairs);
				hairs.geometry.dispose();
				(hairs.material as THREE_NS.Material).dispose();
			}
			const pts = seeds(f);
			const posArr = new Float32Array(pts.length * 6);
			const colArr = new Float32Array(pts.length * 6);
			const v = [0, 0, 0];
			const n = [0, 0, 0];
			const L = isSphere(f) ? 0.13 : 0.1;
			const base = new THREE.Color(0x8a6a35);
			const tip = new THREE.Color(0xfff1d0);
			pts.forEach((p, i) => {
				vec(f, p[0], p[1], p[2], v);
				normalAt(f, p, n);
				const m = Math.hypot(v[0], v[1], v[2]);
				const len = L * Math.min(1, m / 0.35);
				const s = m > 1e-9 ? len / m : 0;
				const lift = 0.012;
				posArr.set([p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift], 6 * i);
				posArr.set([p[0] + n[0] * lift + v[0] * s, p[1] + n[1] * lift + v[1] * s, p[2] + n[2] * lift + v[2] * s], 6 * i + 3);
				colArr.set([base.r, base.g, base.b], 6 * i);
				colArr.set([tip.r, tip.g, tip.b], 6 * i + 3);
			});
			const g = new THREE.BufferGeometry();
			g.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
			g.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
			hairs = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9 }));
			scene.add(hairs);

			// zeros
			scene.remove(zeroGroup);
			zeroGroup.traverse((o) => (o as THREE_NS.Mesh).geometry?.dispose());
			zeroGroup = new THREE.Group();
			scene.add(zeroGroup);
			zeroLabels.forEach((l) => l.remove());
			zeroLabels.length = 0;
			for (const z of zeros[f]) {
				const p = isSphere(f) ? [z.p[0] * RS, z.p[1] * RS, z.p[2] * RS] : z.p;
				const nn = [0, 0, 0];
				normalAt(f, p, nn);
				const at: [number, number, number] = [p[0] + nn[0] * 0.03, p[1] + nn[1] * 0.03, p[2] + nn[2] * 0.03];
				zeroGroup.add(glowPoint(at, { color: 'rose', size: 0.055, halo: 9 }));
				const lp = new THREE.Vector3(p[0] + nn[0] * 0.32, p[1] + nn[1] * 0.32, p[2] + nn[2] * 0.32);
				zeroLabels.push(
					label(lp, `<span class="cb-z">${z.index > 0 ? '+' : '−'}${Math.abs(z.index)}</span>`, {
						className: 'tag',
						normal: new THREE.Vector3(nn[0], nn[1], nn[2])
					})
				);
			}
			for (let i = 0; i < NP; i++) respawn(i);
			pAttr.needsUpdate = true;
			invalidate();
		}

		build(field);
		api = { set: build };

		if (!reducedMotion) {
			onFrame((_t, dt) => {
				const h = Math.min(dt, 0.05);
				const speed = isSphere(current) ? 0.55 : 0.6;
				for (let i = 0; i < NP; i++) {
					life[i] -= h;
					tmp[0] = pPos[3 * i];
					tmp[1] = pPos[3 * i + 1];
					tmp[2] = pPos[3 * i + 2];
					project(current, tmp);
					vec(current, tmp[0], tmp[1], tmp[2], nrm);
					const m = Math.hypot(nrm[0], nrm[1], nrm[2]);
					if (life[i] <= 0 || m < 1e-3) {
						respawn(i);
						continue;
					}
					tmp[0] += (nrm[0] / Math.max(m, 0.25)) * speed * h;
					tmp[1] += (nrm[1] / Math.max(m, 0.25)) * speed * h;
					tmp[2] += (nrm[2] / Math.max(m, 0.25)) * speed * h;
					project(current, tmp);
					normalAt(current, tmp, nrm);
					pPos[3 * i] = tmp[0] + nrm[0] * 0.02;
					pPos[3 * i + 1] = tmp[1] + nrm[1] * 0.02;
					pPos[3 * i + 2] = tmp[2] + nrm[2] * 0.02;
				}
				pAttr.needsUpdate = true;
			});
		} else {
			particles.visible = false;
		}
		return {
			dispose() {
				api = null;
				zeroLabels.forEach((l) => l.remove());
			}
		};
	}

	$effect(() => {
		void field;
		api?.set(field);
	});

	const total = $derived(zeros[field].reduce((s, z) => s + z.index, 0));
	const sumTeX = $derived(
		zeros[field].length > 1
			? zeros[field].map((z, i) => (i === 0 ? '' : z.index < 0 ? ' - ' : ' + ') + (i === 0 && z.index < 0 ? '-' : '') + Math.abs(z.index)).join('') + ` = ${total}`
			: `${total}`
	);
</script>

<Scene3D
	{setup}
	height={440}
	camera={{ position: [0, 2.5, 4.3], target: [0, 0, 0], fov: 40 }}
	controls={{ autoRotate: true, autoRotateSpeed: 0.4 }}
	label="A sphere or torus covered in hairs combed along a tangent vector field, with particles drifting along the field. Zeros of the field are marked with their indices."
/>

<div class="readout ui" aria-live="polite">
	<div>
		{#if zeros[field].length}
			Zeros: {zeros[field].map((z) => `${z.name} (${z.index > 0 ? '+' : '−'}${Math.abs(z.index)})`).join(', ')}.
		{:else}
			No zeros at all: the hair lies flat everywhere.
		{/if}
	</div>
	<div class="sum">
		<TeX tex={`\\text{sum of indices} = ${sumTeX} = \\chi(${isSphere(field) ? 'S^2' : 'T^2'})`} />
	</div>
</div>

<Controls>
	<Segmented
		bind:value={field}
		options={[
			{ value: 'spin', label: 'Sphere: spin' },
			{ value: 'flow', label: 'Sphere: pole to pole' },
			{ value: 'dipole', label: 'Sphere: one cowlick' },
			{ value: 'around', label: 'Torus: around' },
			{ value: 'wind', label: 'Torus: wind' }
		]}
		label="Vector field"
	/>
</Controls>

<style>
	.readout {
		padding: 0.5rem 1.2rem 0.7rem;
		font-size: 0.84rem;
		display: grid;
		gap: 0.3rem;
		color: var(--ink);
	}
	.sum {
		color: var(--ink-bright);
	}
	:global(.cb-z) {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--rose);
		background: rgba(6, 10, 20, 0.82);
		border: 1px solid currentColor;
	}
</style>
