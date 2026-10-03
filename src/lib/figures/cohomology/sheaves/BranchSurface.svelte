<script lang="ts">
	// Figure: following a branch of √z or log z around the puncture.
	// A walker circles the origin in the base plane; above it, its value is
	// tracked continuously on the "Riemann surface" of the function — the
	// surface on which the many-valued function becomes single-valued.
	import { onMount } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowPoint, glowTube } from '$lib/three/materials';
	import { surfaceGeometry, type SurfaceFn } from '$lib/three/surfaces';
	import type * as THREE_NS from 'three';
	import { fmt } from './svgutil';

	type Mode = 'sqrt' | 'log';
	let mode = $state<Mode>('sqrt');
	let t = $state(0); // angle travelled, radians, 0 … 4π
	let rho = $state(1.5);
	let playing = $state(false);

	const TAU = Math.PI * 2;
	const RMAX = 2.3;
	const BASE = -1.95; // height of the base plane
	const S = 1.12; // vertical scale of Re √z
	const K = 3.1 / (2 * TAU); // helicoid rise per radian (two turns ≈ 3.1 units)
	const LOG0 = -1.45; // helicoid height at θ = 0

	const hSqrt = (r: number, th: number) => S * Math.sqrt(r) * Math.cos(th / 2);
	const hLog = (th: number) => LOG0 + K * th;

	let api: { update(): void } | null = null;
	let raf = 0;
	let last = 0;

	function step(now: number) {
		const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
		last = now;
		t += dt * 1.1;
		if (t >= 2 * TAU) t = 0;
		raf = requestAnimationFrame(step);
	}
	function toggle() {
		playing = !playing;
		if (playing) {
			last = 0;
			raf = requestAnimationFrame(step);
		} else cancelAnimationFrame(raf);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	function setup({ scene, THREE, invalidate, label }: SceneContext) {
		const groupSqrt = new THREE.Group();
		const groupLog = new THREE.Group();
		scene.add(groupSqrt, groupLog);

		// base plane: a soft disk with polar grid lines
		const baseFn: SurfaceFn = (u, v, tt) => tt.set(RMAX * 1.08 * v * Math.cos(TAU * u), BASE, -RMAX * 1.08 * v * Math.sin(TAU * u));
		const base = glassMesh(surfaceGeometry(baseFn, 96, 16), { opacity: 0.22, grid: [24, 8], gridStrength: 0.4, tint: 'blue', tintMix: 0.5, brightness: 0.6, rim: 0.2 });
		scene.add(base);

		// the puncture: a rose axis through the origin
		const axis = glowTube(new THREE.LineCurve3(new THREE.Vector3(0, BASE, 0), new THREE.Vector3(0, 1.75, 0)), {
			color: 'rose',
			radius: 0.012,
			segments: 1,
			intensity: 0.8
		});
		scene.add(axis, glowPoint([0, BASE, 0], { color: 'rose', size: 0.05 }));
		label([0, BASE - 0.22, 0], '0', { className: 'rose small' });

		// √z: two sheets, θ ∈ [0, 2π] and [2π, 4π], height Re √z
		const sheet = (k: number): SurfaceFn => (u, v, tt) => {
			const th = TAU * (k + u);
			const r = 0.04 + (RMAX - 0.04) * v;
			tt.set(r * Math.cos(th), hSqrt(r, th), -r * Math.sin(th));
		};
		const s1 = glassMesh(surfaceGeometry(sheet(0), 160, 36), { opacity: 0.62, grid: [24, 9], tint: 'violet', tintMix: 0.78, brightness: 0.95 });
		const s2 = glassMesh(surfaceGeometry(sheet(1), 160, 36), { opacity: 0.62, grid: [24, 9], tint: 'teal', tintMix: 0.78, hue: 0.3, brightness: 0.95 });
		groupSqrt.add(s1, s2);
		// where the two sheets pass through each other in this 3D picture (the negative real axis)
		const cross = glowTube(new THREE.LineCurve3(new THREE.Vector3(-0.04, 0, 0), new THREE.Vector3(-RMAX, 0, 0)), {
			color: 'ivory',
			radius: 0.006,
			segments: 1,
			intensity: 0.5,
			halo: false
		});
		groupSqrt.add(cross);

		// log z: a helicoid, height = Im log z = θ
		const heli: SurfaceFn = (u, v, tt) => {
			const th = 2 * TAU * u;
			const r = 0.04 + (RMAX - 0.04) * v;
			tt.set(r * Math.cos(th), hLog(th), -r * Math.sin(th));
		};
		const h1 = glassMesh(surfaceGeometry(heli, 240, 32), { opacity: 0.62, grid: [48, 9], tint: 'violet', tintMix: 0.35, brightness: 0.95 });
		groupLog.add(h1);

		// the walker and its lift
		const foot = glowPoint([rho, BASE, 0], { color: 'gold', size: 0.05 });
		const lift = glowPoint([rho, 0, 0], { color: 'gold', size: 0.075, halo: 10 });
		const start = glowPoint([rho, 0, 0], { color: 'ivory', size: 0.045 });
		scene.add(foot, lift, start);
		const stemGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
		const stem = new THREE.Line(
			stemGeo,
			new THREE.LineDashedMaterial({ color: 0xf2d08f, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.7 })
		);
		scene.add(stem);

		const SEG = 320;
		let trail: THREE_NS.Group | null = null;
		let baseTrail: THREE_NS.Group | null = null;
		let builtFor = '';
		function buildTrails() {
			const key = `${mode}:${rho.toFixed(3)}`;
			if (key === builtFor) return;
			builtFor = key;
			for (const g of [trail, baseTrail]) {
				if (!g) continue;
				scene.remove(g);
				g.traverse((o) => {
					const m = o as THREE_NS.Mesh;
					m.geometry?.dispose();
					(m.material as THREE_NS.Material | undefined)?.dispose?.();
				});
			}
			const pts: THREE_NS.Vector3[] = [];
			const bpts: THREE_NS.Vector3[] = [];
			for (let i = 0; i <= SEG; i++) {
				const th = (2 * TAU * i) / SEG;
				const y = mode === 'sqrt' ? hSqrt(rho, th) : hLog(th);
				pts.push(new THREE.Vector3(rho * Math.cos(th), y + 0.012, -rho * Math.sin(th)));
				bpts.push(new THREE.Vector3(rho * Math.cos(th), BASE + 0.01, -rho * Math.sin(th)));
			}
			trail = glowTube(new THREE.CatmullRomCurve3(pts), { color: 'gold', radius: 0.022, segments: SEG, radialSegments: 8 });
			baseTrail = glowTube(new THREE.CatmullRomCurve3(bpts), { color: 'gold', radius: 0.012, segments: SEG, radialSegments: 6, intensity: 0.7 });
			scene.add(trail, baseTrail);
		}
		function setRange(g: THREE_NS.Group | null, frac: number, radial: number) {
			if (!g) return;
			const n = Math.max(0, Math.min(SEG, Math.round(frac * SEG))) * radial * 6;
			g.traverse((o) => {
				const m = o as THREE_NS.Mesh;
				if (m.isMesh) m.geometry.setDrawRange(0, n);
			});
		}

		const lblStart = label([rho, 0, 0], 'start', { className: 'tag' });
		const lblSheet = label([0, 0, 0], '', { className: 'tag' });

		api = {
			update() {
				groupSqrt.visible = mode === 'sqrt';
				groupLog.visible = mode === 'log';
				buildTrails();
				const th = t;
				const y = mode === 'sqrt' ? hSqrt(rho, th) : hLog(th);
				const y0 = mode === 'sqrt' ? hSqrt(rho, 0) : hLog(0);
				foot.position.set(rho * Math.cos(th), BASE, -rho * Math.sin(th));
				lift.position.set(rho * Math.cos(th), y, -rho * Math.sin(th));
				start.position.set(rho, y0, 0);
				lblStart.position.set(rho + 0.05, y0 + 0.36, 0);
				const p = stemGeo.attributes.position as THREE_NS.BufferAttribute;
				p.setXYZ(0, foot.position.x, BASE, foot.position.z);
				p.setXYZ(1, lift.position.x, y, lift.position.z);
				p.needsUpdate = true;
				stem.computeLineDistances();
				setRange(trail, th / (2 * TAU), 8);
				setRange(baseTrail, th / (2 * TAU), 6);
				const lap = th < TAU - 1e-6 ? 1 : 2;
				lblSheet.position.set(lift.position.x * 1.16, y - 0.34, lift.position.z * 1.16);
				lblSheet.set(mode === 'sqrt' ? `sheet ${lap}` : `turn ${lap}`);
				invalidate();
			}
		};
		api.update();
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		void mode;
		void t;
		void rho;
		api?.update();
	});

	// readouts
	const sq = $derived([Math.sqrt(rho) * Math.cos(t / 2), Math.sqrt(rho) * Math.sin(t / 2)]);
	const deg = $derived(Math.round((t * 180) / Math.PI));
</script>

<Scene3D
	{setup}
	height={460}
	camera={{ position: [5.4, 1.7, 5.3], target: [0, -0.45, 0], fov: 38 }}
	controls={{ autoRotate: false }}
	label="A point walks around the origin of the plane. Above it, the value of the square root (two crossing sheets) or of the logarithm (a spiral ramp) is followed continuously; after one full turn the point is back where it started but its value is not."
/>

<div class="readout ui">
	<div class="dial">
		<svg viewBox="-60 -60 120 120" width="110" height="110" aria-hidden="true">
			<circle r="44" fill="none" stroke="rgba(216,178,110,0.25)" />
			<line x1="-52" y1="0" x2="52" y2="0" stroke="rgba(235,229,213,0.15)" />
			<line x1="0" y1="-52" x2="0" y2="52" stroke="rgba(235,229,213,0.15)" />
			{#if mode === 'sqrt'}
				<line x1="0" y1="0" x2={44 * Math.cos(0)} y2="0" stroke="rgba(251,246,232,0.35)" stroke-width="2" stroke-dasharray="3 3" />
				<line
					x1="0"
					y1="0"
					x2={44 * Math.cos(t / 2)}
					y2={-44 * Math.sin(t / 2)}
					stroke="var(--gold-bright)"
					stroke-width="3"
					marker-end="url(#bs-arrow)"
				/>
			{:else}
				<line x1="0" y1="0" x2={44 * Math.cos(t)} y2={-44 * Math.sin(t)} stroke="var(--gold-bright)" stroke-width="3" marker-end="url(#bs-arrow)" />
			{/if}
			<defs>
				<marker id="bs-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
					<path d="M0,1 L10,5 L0,9 z" fill="#f4d79c" />
				</marker>
			</defs>
		</svg>
		<span class="cap">{mode === 'sqrt' ? 'the value √z' : 'the angle θ'}</span>
	</div>
	<div class="nums-col">
		<div><span class="k">walked</span> <span class="nums v">{deg}°</span> {#if deg >= 360}<span class="tag">past one full turn</span>{/if}</div>
		{#if mode === 'sqrt'}
			<div>
				<span class="k">value</span>
				<TeX tex={`\\sqrt{z} = ${fmt(sq[0])} ${sq[1] < 0 ? '-' : '+'} ${fmt(Math.abs(sq[1]))}\\,i`} />
			</div>
			<div class="note">
				{#if deg < 355}
					Back at the start after 360°, the arrow will have turned only half a turn.
				{:else if deg < 365}
					Back where we started — but the value is now the <em>negative</em> of the starting value.
				{:else if deg < 715}
					On the second sheet. One more turn will bring the original value back.
				{:else}
					Two full turns: the original square root again.
				{/if}
			</div>
		{:else}
			<div>
				<span class="k">value</span>
				<TeX tex={`\\log z = \\ln ${fmt(rho)} + ${fmt(t)}\\,i`} />
			</div>
			<div class="note">
				Every full turn adds <TeX tex={'2\\pi i'} /> to the logarithm: the ramp never closes up.
			</div>
		{/if}
	</div>
</div>

<Controls>
	<Segmented
		bind:value={mode}
		options={[
			{ value: 'sqrt', label: '√z' },
			{ value: 'log', label: 'log z' }
		]}
		label="Function"
	/>
	<Slider bind:value={t} min={0} max={4 * Math.PI} step={0.01} label="Walked around 0" format={(v) => `${Math.round((v * 180) / Math.PI)}°`} />
	<Slider bind:value={rho} min={0.6} max={2.1} step={0.01} label="Distance from 0" format={(v) => v.toFixed(2)} />
	<Button onclick={toggle} active={playing}>{playing ? 'Pause' : 'Walk'}</Button>
</Controls>

<style>
	.readout {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.4rem;
		align-items: center;
		padding: 0.5rem 1.2rem 0.6rem;
		font-size: 0.84rem;
	}
	.dial {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
	}
	.cap {
		font-size: 0.7rem;
		color: var(--ink-faint);
		letter-spacing: 0.05em;
	}
	.nums-col {
		display: grid;
		gap: 0.3rem;
		flex: 1;
		min-width: 14rem;
	}
	.k {
		color: var(--ink-dim);
		margin-right: 0.4rem;
	}
	.v {
		color: var(--gold-bright);
		font-weight: 600;
	}
	.tag {
		margin-left: 0.5rem;
		font-size: 0.7rem;
		color: var(--rose);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.note {
		color: var(--ink-dim);
		line-height: 1.5;
	}
</style>
