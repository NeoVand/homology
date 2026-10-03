<script lang="ts">
	// Figure: a magnetic monopole and the two patches of Wu and Yang. The field
	// lines leave the monopole and cross every sphere around it. The vector
	// potential can be defined on the northern patch and on the southern patch,
	// but not on both at once; on the overlap the two descriptions differ by a
	// phase e^{inφ}, drawn as a ribbon around the equator that twists n times.
	// If n is not a whole number the ribbon cannot close up.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, glowTube, pointCloud } from '$lib/three/materials';
	import { surfaceGeometry, type SurfaceFn } from '$lib/three/surfaces';
	import type * as THREE_NS from 'three';
	import { phaseMismatch } from './geometry';

	let n = $state(1);
	let free = $state(false);
	const integer = $derived(phaseMismatch(n) < 1e-9);

	const RS = 1.35;
	const TAU = Math.PI * 2;
	const deg = Math.PI / 180;

	let api: { update(): void } | null = null;
	function setup({ scene, THREE, invalidate, onFrame, reducedMotion, label }: SceneContext) {
		// the two patches
		const cap = (t0: number, t1: number): SurfaceFn => (u, v, t) => {
			const th = t0 + (t1 - t0) * v;
			const ph = TAU * u;
			t.set(RS * Math.sin(th) * Math.cos(ph), RS * Math.cos(th), RS * Math.sin(th) * Math.sin(ph));
		};
		scene.add(glassMesh(surfaceGeometry(cap(0, 118 * deg), 120, 40), { opacity: 0.3, grid: [24, 10], gridStrength: 0.18, tint: 'violet', tintMix: 0.55 }));
		scene.add(glassMesh(surfaceGeometry(cap(62 * deg, 180 * deg), 120, 40), { opacity: 0.3, grid: [24, 10], gridStrength: 0.18, tint: 'teal', tintMix: 0.55 }));
		const rim = (th: number, c: 'violet' | 'teal') => {
			const pts = Array.from({ length: 129 }, (_, i) => {
				const ph = (TAU * i) / 128;
				return new THREE.Vector3(RS * 1.004 * Math.sin(th) * Math.cos(ph), RS * 1.004 * Math.cos(th), RS * 1.004 * Math.sin(th) * Math.sin(ph));
			});
			return glowTube(new THREE.CatmullRomCurve3(pts, true), { color: c, radius: 0.01, closed: true, segments: 160, intensity: 1.1, halo: false });
		};
		scene.add(rim(118 * deg, 'violet'), rim(62 * deg, 'teal'));
		label([0, RS + 0.38, 0], 'U<sub>N</sub>', { className: 'violet' });
		label([0, -RS - 0.38, 0], 'U<sub>S</sub>', { className: 'teal' });
		scene.add(glowPoint([0, 0, 0], { color: 'gold', size: 0.11, halo: 12 }));

		const dyn = new THREE.Group();
		scene.add(dyn);
		let parts: THREE_NS.Points | null = null;
		let lines: THREE_NS.Vector3[] = [];
		let pPos = new Float32Array();
		let pPhase = new Float32Array();
		const lblG = label([RS * 1.25, -0.42, RS * 0.6], '', { className: 'gold small' });

		function clear() {
			for (const c of [...dyn.children]) {
				dyn.remove(c);
				c.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					m.geometry?.dispose();
					(m.material as THREE_NS.Material | undefined)?.dispose?.();
				});
			}
			parts = null;
		}
		function update() {
			clear();
			// field lines: their number grows with |n|
			const count = Math.round(Math.abs(n) * 14);
			lines = [];
			const ga = Math.PI * (3 - Math.sqrt(5));
			for (let i = 0; i < count; i++) {
				const y = 1 - (2 * (i + 0.5)) / count;
				const r = Math.sqrt(1 - y * y);
				const d = new THREE.Vector3(r * Math.cos(ga * i), y, r * Math.sin(ga * i));
				lines.push(d);
				dyn.add(
					glowTube(new THREE.LineCurve3(d.clone().multiplyScalar(0.16), d.clone().multiplyScalar(2.55)), {
						color: n > 0 ? 'gold' : 'blue',
						radius: 0.008,
						segments: 1,
						intensity: 0.65,
						halo: true,
						haloScale: 2.5
					})
				);
			}
			// particles streaming along the lines
			const per = 4;
			pPos = new Float32Array(lines.length * per * 3);
			pPhase = new Float32Array(lines.length * per);
			for (let i = 0; i < lines.length * per; i++) pPhase[i] = (i % per) / per + Math.random() * 0.2;
			if (lines.length) {
				parts = pointCloud(pPos, { color: n > 0 ? 'gold' : 'blue', size: 0.075, opacity: 0.9 });
				parts.frustumCulled = false;
				dyn.add(parts);
				place(0);
			}
			// the transition function on the overlap: a ribbon whose direction turns by nφ
			const Re = RS * 1.1;
			const ribbon: SurfaceFn = (u, v, t) => {
				const ph = TAU * u;
				const a = n * ph;
				const s = (v - 0.5) * 0.24;
				const rx = Math.cos(ph);
				const rz = Math.sin(ph);
				const dx = Math.cos(a) * rx;
				const dy = Math.sin(a);
				const dz = Math.cos(a) * rz;
				t.set(Re * rx + s * dx, s * dy, Re * rz + s * dz);
			};
			const rib = glassMesh(surfaceGeometry(ribbon, 360, 2), { opacity: 0.75, grid: [0, 0], tint: integer ? 'gold' : 'rose', tintMix: 0.75, brightness: 1.1 });
			dyn.add(rib);
			// needles every 15°
			for (let k = 0; k < 24; k++) {
				const ph = (TAU * k) / 24;
				const a = n * ph;
				const c = new THREE.Vector3(Re * Math.cos(ph), 0, Re * Math.sin(ph));
				const d = new THREE.Vector3(Math.cos(a) * Math.cos(ph), Math.sin(a), Math.cos(a) * Math.sin(ph)).multiplyScalar(0.17);
				dyn.add(glowTube(new THREE.LineCurve3(c.clone().sub(d), c.clone().add(d)), { color: k === 0 ? 'ivory' : integer ? 'gold' : 'rose', radius: 0.012, segments: 1, halo: false, intensity: 1.2 }));
			}
			if (!integer) {
				// the tear: where the ribbon arrives after a full turn, against where it started
				const a = n * TAU;
				const c = new THREE.Vector3(Re, 0, 0);
				const d = new THREE.Vector3(Math.cos(a), Math.sin(a), 0).multiplyScalar(0.26);
				dyn.add(glowTube(new THREE.LineCurve3(c.clone().sub(d), c.clone().add(d)), { color: 'rose', radius: 0.02, segments: 1, intensity: 1.5 }));
			}
			lblG.set(integer ? phaseHTML(n) : `${phaseHTML(n)} does not close up`);
			invalidate();
		}
		function place(t: number) {
			if (!parts) return;
			const per = 4;
			for (let i = 0; i < lines.length; i++)
				for (let j = 0; j < per; j++) {
					const k = i * per + j;
					let f = (pPhase[k] + t * 0.22) % 1;
					if (n < 0) f = 1 - f;
					const r = 0.2 + 2.3 * f;
					pPos[3 * k] = lines[i].x * r;
					pPos[3 * k + 1] = lines[i].y * r;
					pPos[3 * k + 2] = lines[i].z * r;
				}
			(parts.geometry.attributes.position as THREE_NS.BufferAttribute).needsUpdate = true;
		}
		api = { update };
		update();
		if (!reducedMotion) onFrame((t) => place(t));
		return {
			dispose() {
				api = null;
			}
		};
	}
	const fmtN = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2)).replace('-', '−');
	// v·sym written the way a person would: iφ, −iφ, 2iφ, 0.45iφ
	const times = (v: number, sym: string) =>
		v === 0 ? '0' : v === 1 ? sym : v === -1 ? `-${sym}` : `${Number.isInteger(v) ? v : v.toFixed(2)}${sym}`;
	const phaseHTML = (v: number) => (v === 0 ? '1' : `e<sup>${times(v, 'iφ').replace('-', '−')}</sup>`);
	const phaseTeX = $derived(n === 0 ? '1' : `e^{${times(n, 'i\\varphi')}}`);
	const fluxTeX = $derived(n === 0 ? '0' : times(2 * n, '\\pi\\hbar/q'));
	$effect(() => {
		void n;
		api?.update();
	});
	$effect(() => {
		if (!free) n = Math.round(n);
	});
</script>

<Scene3D
	{setup}
	height={460}
	camera={{ position: [3.2, 2.0, 4.2], target: [0, 0, 0], fov: 40 }}
	controls={{ autoRotate: true, autoRotateSpeed: 0.35 }}
	label="A magnetic monopole at the centre of a sphere, with field lines streaming out. The sphere is covered by a northern and a southern patch which overlap in a band; on the band a ribbon twists around n times, showing the phase that relates the two patches."
/>

<div class="readout ui" aria-live="polite">
	<div class="row">
		<TeX tex={`g_{NS}(\\varphi) = ${phaseTeX}`} />
		{#if integer}
			<TeX tex={`\\text{winding number} = c_1 = ${fmtN(n).replace('−', '-')}`} />
			<TeX tex={`\\text{flux } 4\\pi g = ${fluxTeX}`} />
		{/if}
	</div>
	<div class={integer ? 'ok' : 'bad'}>
		{#if integer}
			{#if n === 0}
				No monopole: the two patches agree on the overlap, and the potential is defined everywhere.
			{:else}
				The phase comes back to itself after one turn, so the two patches fit together: a legitimate monopole with Chern
				number {fmtN(n)}.
			{/if}
		{:else}
			After one turn the phase has moved on by {((((n % 1) + 1) % 1) * 360).toFixed(0)}°: the description on the overlap is not
			single-valued. Quantum mechanics forbids this charge.
		{/if}
	</div>
</div>

<Controls>
	<Slider bind:value={n} min={-3} max={3} step={free ? 0.05 : 1} label="Monopole charge n" format={(v) => fmtN(v)} />
	<Toggle bind:checked={free} label="Let n be any number" />
</Controls>

<style>
	.readout {
		padding: 0.5rem 1.2rem 0.7rem;
		display: grid;
		gap: 0.35rem;
		font-size: 0.86rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.6rem;
		color: var(--ink-bright);
	}
	.ok {
		color: var(--green);
	}
	.bad {
		color: var(--rose);
	}
</style>
