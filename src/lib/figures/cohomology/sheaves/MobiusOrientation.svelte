<script lang="ts">
	// Figure: the orientation sheaf of the Möbius band. A local orientation is
	// drawn as a normal arrow (right-hand rule). Each of three overlapping patches
	// carries its own consistent choice; on each overlap the two choices either
	// agree (+1) or disagree (−1). Flipping a patch changes two signs at once, so
	// the product of the three signs never changes: −1 for the Möbius band, +1
	// for the cylinder. A golden arrow carried once around comes back reversed.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowCore, glowTube, glowPoint, palette } from '$lib/three/materials';
	import { surfaceGeometry, type SurfaceFn } from '$lib/three/surfaces';
	import type * as THREE_NS from 'three';

	type Kind = 'mobius' | 'cylinder';
	let kind = $state<Kind>('mobius');
	let eps = $state<[number, number, number]>([1, 1, 1]);
	let carry = $state(0); // 0 … 2 laps
	let playing = $state(false);

	const TAU = Math.PI * 2;
	const R = 1.55;
	const WID = 0.95;
	const deg = Math.PI / 180;
	// patches as angle ranges (continued past 2π for the last one)
	const patches = [
		{ a: -20 * deg, b: 140 * deg, colour: 'violet' as const },
		{ a: 100 * deg, b: 260 * deg, colour: 'blue' as const },
		{ a: 220 * deg, b: 380 * deg, colour: 'teal' as const }
	];
	const lanes = [-0.27, 0, 0.27];

	// point of the band at angle θ (continued: any real θ) and offset s across it
	function point(k: Kind, th: number, s: number, out: number[]) {
		if (k === 'mobius') {
			const w = R + s * Math.cos(th / 2);
			out[0] = w * Math.cos(th);
			out[1] = s * Math.sin(th / 2);
			out[2] = w * Math.sin(th);
		} else {
			out[0] = R * Math.cos(th);
			out[1] = s;
			out[2] = R * Math.sin(th);
		}
	}
	// unit normal, continuous in θ ∈ ℝ: ∂θ × ∂s
	function normal(k: Kind, th: number, s: number): [number, number, number] {
		const e = 1e-4;
		const p = [0, 0, 0];
		const a = [0, 0, 0];
		const b = [0, 0, 0];
		point(k, th, s, p);
		point(k, th + e, s, a);
		point(k, th, s + e, b);
		const u = [a[0] - p[0], a[1] - p[1], a[2] - p[2]];
		const v = [b[0] - p[0], b[1] - p[1], b[2] - p[2]];
		const n: [number, number, number] = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]];
		const l = Math.hypot(...n);
		return [n[0] / l, n[1] / l, n[2] / l];
	}

	// signs on the overlaps: does patch i's arrow agree with patch j's there?
	function overlapSign(k: Kind, i: number, j: number, e: [number, number, number]): number {
		// a point in the overlap, expressed in each patch's own angle range
		const mids = [120 * deg, 240 * deg, 0];
		const m = i === 2 && j === 0 ? 0 : mids[Math.min(i, j)];
		const thI = i === 2 && m < 180 * deg ? m + TAU : m;
		const thJ = j === 2 && m < 180 * deg ? m + TAU : m;
		const ni = normal(k, thI, 0);
		const nj = normal(k, thJ, 0);
		const d = ni[0] * nj[0] + ni[1] * nj[1] + ni[2] * nj[2];
		return Math.sign(d) * e[i] * e[j];
	}
	const g12 = $derived(overlapSign(kind, 0, 1, eps));
	const g23 = $derived(overlapSign(kind, 1, 2, eps));
	const g31 = $derived(overlapSign(kind, 2, 0, eps));
	const prod = $derived(g12 * g23 * g31);

	let api: { rebuild(): void; update(): void; carry(): void } | null = null;

	function setup({ scene, THREE, invalidate, label }: SceneContext) {
		const band = new THREE.Group();
		const arrows = new THREE.Group();
		const marks = new THREE.Group();
		scene.add(band, arrows, marks);

		const up = new THREE.Vector3(0, 1, 0);
		const shaftGeo = new THREE.CylinderGeometry(0.024, 0.024, 1, 10, 1);
		shaftGeo.translate(0, 0.5, 0);
		const headGeo = new THREE.ConeGeometry(0.075, 0.18, 18);
		headGeo.translate(0, 0.08, 0);
		const mats: Record<string, THREE_NS.ShaderMaterial> = {};
		const matFor = (c: keyof typeof palette) => (mats[c] ??= glowCore(c, 1.15));

		function makeArrow(colour: keyof typeof palette, len = 0.42) {
			const g = new THREE.Group();
			const shaft = new THREE.Mesh(shaftGeo, matFor(colour));
			shaft.scale.set(1, len, 1);
			const head = new THREE.Mesh(headGeo, matFor(colour));
			head.position.y = len;
			g.add(shaft, head);
			return g;
		}
		function place(g: THREE_NS.Object3D, p: number[], n: [number, number, number], lift = 0.02) {
			g.position.set(p[0] + n[0] * lift, p[1] + n[1] * lift, p[2] + n[2] * lift);
			g.quaternion.setFromUnitVectors(up, new THREE.Vector3(n[0], n[1], n[2]));
		}

		// the travelling arrow
		const traveller = makeArrow('gold', 0.62);
		traveller.scale.setScalar(1.25);
		const ghost = makeArrow('ivory', 0.62);
		ghost.scale.setScalar(1.25);
		const ghostMat = glowCore('ivory', 0.7, 0.45);
		ghost.traverse((o) => {
			if ((o as THREE_NS.Mesh).isMesh) (o as THREE_NS.Mesh).material = ghostMat;
		});
		scene.add(traveller, ghost);
		const startLbl = label([0, 0, 0], 'start', { className: 'tag' });
		const signLbls = [0, 1, 2].map(() => label([0, 0, 0], '', { className: 'tag' }));
		const patchLbls = [0, 1, 2].map((k) => label([0, 0, 0], `U<sub>${k + 1}</sub>`, { className: ['violet', 'blue', 'teal'][k] }));

		function disposeGroup(g: THREE_NS.Group) {
			for (const c of [...g.children]) {
				g.remove(c);
				c.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					if (m.geometry && m.geometry !== shaftGeo && m.geometry !== headGeo) m.geometry.dispose();
				});
			}
		}

		api = {
			rebuild() {
				disposeGroup(band);
				const fn: SurfaceFn = (u, v, t) => {
					const p = [0, 0, 0];
					point(kind, TAU * u, (v - 0.5) * WID, p);
					t.set(p[0], p[1], p[2]);
				};
				band.add(glassMesh(surfaceGeometry(fn, 180, 12), { opacity: 0.55, grid: [36, 4], tint: 'blue', tintMix: 0.18 }));
				// the core circle
				const core: THREE_NS.Vector3[] = [];
				for (let i = 0; i <= 200; i++) {
					const p = [0, 0, 0];
					point(kind, (TAU * i) / 200, 0, p);
					core.push(new THREE.Vector3(p[0], p[1], p[2]));
				}
				band.add(glowTube(new THREE.CatmullRomCurve3(core, true), { color: 'gold', radius: 0.008, closed: true, intensity: 0.5, halo: false }));
				this.update();
			},
			update() {
				disposeGroup(arrows);
				disposeGroup(marks);
				patches.forEach((P, k) => {
					const n = 7;
					for (let i = 0; i <= n; i++) {
						const th = P.a + ((P.b - P.a) * i) / n;
						const p = [0, 0, 0];
						point(kind, th, lanes[k], p);
						const nn = normal(kind, th, lanes[k]);
						const d: [number, number, number] = [nn[0] * eps[k], nn[1] * eps[k], nn[2] * eps[k]];
						const a = makeArrow(P.colour);
						place(a, p, d);
						arrows.add(a);
					}
					// a coloured arc along the patch's lane, outside the band, to show its extent
					const arc: THREE_NS.Vector3[] = [];
					for (let i = 0; i <= 40; i++) {
						const th = P.a + ((P.b - P.a) * i) / 40;
						const p = [0, 0, 0];
						point(kind, th, lanes[k], p);
						arc.push(new THREE.Vector3(p[0], p[1], p[2]));
					}
					marks.add(glowTube(new THREE.CatmullRomCurve3(arc), { color: P.colour, radius: 0.02, segments: 60, intensity: 1.1 }));
					const mid = (P.a + P.b) / 2;
					const pm = [0, 0, 0];
					point(kind, mid, 0, pm);
					const out = new THREE.Vector3(pm[0], 0, pm[2]).normalize().multiplyScalar(0.72);
					patchLbls[k].position.set(pm[0] + out.x, pm[1] + 0.12, pm[2] + out.z);
				});
				// overlap signs
				const ov = [120 * deg, 240 * deg, 0];
				const sg = [g12, g23, g31];
				ov.forEach((th, k) => {
					const p = [0, 0, 0];
					point(kind, th, 0, p);
					const ok = sg[k] > 0;
					const ring = glowPoint([p[0], p[1], p[2]], { color: ok ? 'green' : 'rose', size: 0.06, halo: 8 });
					marks.add(ring);
					const out = new THREE.Vector3(p[0], 0, p[2]).normalize();
					signLbls[k].position.set(p[0] - out.x * 0.55, p[1] + 0.02, p[2] - out.z * 0.55);
					signLbls[k].set(`<span class="mo-sign ${ok ? 'ok' : 'bad'}">${ok ? '+1' : '−1'}</span>`);
				});
				this.carry();
			},
			carry() {
				const th = TAU * carry;
				const p = [0, 0, 0];
				point(kind, th, 0, p);
				place(traveller, p, normal(kind, th, 0), 0.03);
				const p0 = [0, 0, 0];
				point(kind, 0, 0, p0);
				place(ghost, p0, normal(kind, 0, 0), 0.03);
				startLbl.position.set(p0[0] + 0.5, p0[1] - 0.05, p0[2]);
				invalidate();
			}
		};
		api.rebuild();
		return {
			dispose() {
				api = null;
				shaftGeo.dispose();
				headGeo.dispose();
				Object.values(mats).forEach((m) => m.dispose());
				ghostMat.dispose();
			}
		};
	}

	let builtKind: Kind | null = null;
	$effect(() => {
		void kind;
		if (!api) return;
		if (builtKind !== kind) {
			builtKind = kind;
			api.rebuild();
		}
	});
	$effect(() => {
		void eps[0];
		void eps[1];
		void eps[2];
		void g12;
		api?.update();
	});
	$effect(() => {
		void carry;
		api?.carry();
	});

	let raf = 0;
	function toggle() {
		playing = !playing;
		if (!playing) return cancelAnimationFrame(raf);
		let last = 0;
		const step = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
			last = now;
			carry = (carry + dt * 0.18) % 2;
			if (playing) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	const flip = (k: number) => {
		const e = [...eps] as [number, number, number];
		e[k] = -e[k];
		eps = e;
	};
	const s = (v: number) => (v > 0 ? '+1' : '-1');
</script>

<Scene3D
	{setup}
	height={460}
	camera={{ position: [0.6, 2.0, 4.6], target: [0, -0.15, 0], fov: 40 }}
	controls={{ autoRotate: false }}
	label="A Möbius band (or a cylinder) covered by three overlapping patches. Arrows show a chosen orientation on each patch; signs on the overlaps say whether neighbouring choices agree. A golden arrow is carried around the band."
/>

<div class="readout ui">
	<div class="signs">
		<TeX tex={`g_{12} = ${s(g12)},\\quad g_{23} = ${s(g23)},\\quad g_{31} = ${s(g31)}`} />
		<span class="prod" class:ok={prod > 0}><TeX tex={`g_{12}\\,g_{23}\\,g_{31} = ${s(prod)}`} /></span>
	</div>
	<div class="note">
		{#if kind === 'mobius'}
			Flip any patch you like: two signs change together, and the product stays −1. There is no way to choose
			orientations that agree everywhere.
		{:else}
			On the cylinder you can make all three signs +1 — the local orientations glue to a global one.
		{/if}
		{#if carry > 0.98 && carry < 1.02 && kind === 'mobius'}
			<strong class="flip">The carried arrow is back at the start — pointing the other way.</strong>
		{/if}
	</div>
</div>

<Controls>
	<Segmented
		bind:value={kind}
		options={[
			{ value: 'mobius', label: 'Möbius band' },
			{ value: 'cylinder', label: 'Cylinder' }
		]}
		label="Surface"
	/>
	<Button onclick={() => flip(0)}>Flip U₁</Button>
	<Button onclick={() => flip(1)}>Flip U₂</Button>
	<Button onclick={() => flip(2)}>Flip U₃</Button>
	<Slider bind:value={carry} min={0} max={2} step={0.005} label="Carry the gold arrow" format={(v) => `${(v * 360).toFixed(0)}°`} />
	<Button onclick={toggle} active={playing}>{playing ? 'Pause' : 'Carry'}</Button>
</Controls>

<style>
	.readout {
		padding: 0.5rem 1.2rem 0.7rem;
		font-size: 0.84rem;
		display: grid;
		gap: 0.35rem;
	}
	.signs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.2rem;
		align-items: baseline;
		color: var(--ink-bright);
	}
	.prod {
		color: var(--rose);
	}
	.prod.ok {
		color: var(--green);
	}
	.note {
		color: var(--ink-dim);
		line-height: 1.5;
	}
	.flip {
		display: block;
		color: var(--gold-bright);
		font-weight: 600;
	}
	:global(.mo-sign) {
		display: inline-block;
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		background: rgba(6, 10, 20, 0.82);
		border: 1px solid currentColor;
	}
	:global(.mo-sign.ok) {
		color: var(--green);
	}
	:global(.mo-sign.bad) {
		color: var(--rose);
	}
</style>
