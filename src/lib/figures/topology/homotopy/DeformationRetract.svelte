<script lang="ts">
	// Four deformation retractions, scrubbed by a time slider:
	// disk → point, annulus → circle, Möbius band → core circle,
	// punctured torus → figure eight (the rim of the puncture becomes aba⁻¹b⁻¹).
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import { glowTube, glowPoint } from '$lib/three/materials';
	import { glass as glassGroup } from './glass';
	import { SurfaceCurve, surfaceNormal } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import { DynTube } from './dynTube';
	import { annulusModel, diskModel, mobiusModel, puncturedTorusModel } from './retract';

	type Mode = 'disk' | 'annulus' | 'mobius' | 'torus';
	let mode = $state<Mode>('torus');
	let t = $state(0);
	let api: { set(m: Mode, t: number): void } | null = null;

	const options: { value: Mode; label: string }[] = [
		{ value: 'disk', label: 'Disk → point' },
		{ value: 'annulus', label: 'Annulus → circle' },
		{ value: 'mobius', label: 'Möbius band → circle' },
		{ value: 'torus', label: 'Punctured torus → figure eight' }
	];

	// the flat model used for the inset (shares the torus model's square map)
	const torusFlat = puncturedTorusModel();

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		ctx.camera.near = 0.5;
		ctx.camera.far = 60;
		ctx.camera.updateProjectionMatrix();
		const groups: Record<Mode, InstanceType<typeof THREE.Group>> = {
			disk: new THREE.Group(),
			annulus: new THREE.Group(),
			mobius: new THREE.Group(),
			torus: new THREE.Group()
		};
		for (const g of Object.values(groups)) scene.add(g);
		const labels: Record<Mode, LabelHandle[]> = { disk: [], annulus: [], mobius: [], torus: [] };
		const glass = (geo: Parameters<typeof glassGroup>[0], grid: [number, number], opacity = 0.82) =>
			glassGroup(geo, { opacity, grid, gridStrength: 0.34 });
		const tmp = new THREE.Vector3();
		const nrm = new THREE.Vector3();

		// ── disk → point
		const disk = diskModel();
		const diskMesh = glass(disk.geometry, [24, 6]);
		groups.disk.add(diskMesh);
		const diskRim = new DynTube(160, { color: 'teal', closed: true, radius: 0.022 });
		groups.disk.add(diskRim.group, glowPoint([0, 0, 0], { color: 'gold', size: 0.07 }));
		labels.disk.push(ctx.label([0, 0.42, 0], tex(String.raw`\text{a point}`), { className: 'gold' }));

		// ── annulus → circle
		const ann = annulusModel();
		const annMesh = glass(ann.geometry, [36, 6]);
		groups.annulus.add(annMesh);
		groups.annulus.add(
			glowTube(new SurfaceCurve((u, _v, p) => p.set(ann.rc * Math.cos(2 * Math.PI * u), 0.004, ann.rc * Math.sin(2 * Math.PI * u)), (s) => [s, 0], 0), {
				color: 'gold',
				closed: true,
				radius: 0.03
			})
		);
		const annIn = new DynTube(200, { color: 'teal', closed: true, radius: 0.02 });
		const annOut = new DynTube(200, { color: 'teal', closed: true, radius: 0.02 });
		groups.annulus.add(annIn.group, annOut.group);
		labels.annulus.push(ctx.label([0, 0.25, -ann.rc - 0.32], tex('S^1'), { className: 'gold' }));

		// ── Möbius band → core circle
		const mob = mobiusModel();
		const mobMesh = glass(mob.geometry, [48, 6]);
		groups.mobius.add(mobMesh);
		groups.mobius.add(
			glowTube(new SurfaceCurve((u, _v, p) => p.set(mob.R * Math.cos(2 * Math.PI * u), 0, mob.R * Math.sin(2 * Math.PI * u)), (s) => [s, 0], 0), {
				color: 'gold',
				closed: true,
				radius: 0.03
			})
		);
		const mobEdge = new DynTube(400, { color: 'teal', closed: true, radius: 0.02 });
		groups.mobius.add(mobEdge.group);
		labels.mobius.push(ctx.label([0, 0.3, -mob.R - 0.15], tex(String.raw`\text{core circle}`), { className: 'gold' }));

		// ── punctured torus → figure eight
		const tor = puncturedTorusModel();
		const torMesh = glass(tor.geometry, [32, 16], 0.8);
		groups.torus.add(torMesh);
		const [ou, ov] = tor.offset;
		groups.torus.add(
			glowTube(new SurfaceCurve(tor.f, (s) => [s + ou, ov], -0.016), { color: 'gold', closed: true, radius: 0.03, segments: 260 }),
			glowTube(new SurfaceCurve(tor.f, (s) => [ou, s + ov], -0.016), { color: 'teal', closed: true, radius: 0.03, segments: 160 })
		);
		const rim = new DynTube(320, { color: 'rose', closed: true, radius: 0.02 });
		groups.torus.add(rim.group);
		const ptA = new THREE.Vector3();
		tor.f(0.5 + ou, ((ov % 1) + 1) % 1, ptA);
		labels.torus.push(ctx.label([ptA.x, ptA.y - 0.3, ptA.z], tex('a'), { className: 'gold' }));
		const ptB = new THREE.Vector3();
		tor.f(((ou % 1) + 1) % 1, 0.62, ptB);
		labels.torus.push(ctx.label([ptB.x - 0.35, ptB.y + 0.1, ptB.z], tex('b'), { className: 'teal' }));

		function fillRing(tube: DynTube, fn: (s: number, target: InstanceType<typeof THREE.Vector3>) => void, lift = 0) {
			const n = tube.samples;
			for (let i = 0; i < n; i++) {
				fn(i / n, tmp);
				tube.points[i * 3] = tmp.x;
				tube.points[i * 3 + 1] = tmp.y + lift;
				tube.points[i * 3 + 2] = tmp.z;
			}
			tube.update();
		}

		api = {
			set(m, tt) {
				for (const k of Object.keys(groups) as Mode[]) {
					groups[k].visible = k === m;
					for (const l of labels[k]) l.show(k === m);
				}
				if (m === 'disk') {
					disk.setT(tt);
					diskMesh.visible = tt < 0.995;
					diskRim.visible = tt < 0.985;
					if (diskRim.visible) fillRing(diskRim, (s, p) => disk.point(s, 1, tt, p), 0.004);
				} else if (m === 'annulus') {
					ann.setT(tt);
					annMesh.visible = tt < 0.995;
					fillRing(annIn, (s, p) => ann.point(s, 0, tt, p), 0.006);
					fillRing(annOut, (s, p) => ann.point(s, 1, tt, p), 0.006);
				} else if (m === 'mobius') {
					mob.setT(tt);
					mobMesh.visible = tt < 0.995;
					fillRing(mobEdge, (s, p) => {
						const x = s * 2;
						mob.point(x < 1 ? x : x - 1, x < 1 ? 0 : 1, tt, p);
					});
				} else {
					tor.setT(tt);
					torMesh.visible = tt < 0.997;
					const n = rim.samples;
					for (let i = 0; i < n; i++) {
						const [u, v] = tor.square(i / n, 0, tt);
						const uu = (((u + ou) % 1) + 1) % 1;
						const vv = (((v + ov) % 1) + 1) % 1;
						tor.f(uu, vv, tmp);
						surfaceNormal(tor.f, uu, vv, nrm);
						tmp.addScaledVector(nrm, -0.02);
						rim.points[i * 3] = tmp.x;
						rim.points[i * 3 + 1] = tmp.y;
						rim.points[i * 3 + 2] = tmp.z;
					}
					rim.update();
				}
				ctx.invalidate();
			}
		};
		api.set(mode, t);
		return {
			dispose: () => {
				api = null;
			}
		};
	}

	$effect(() => {
		const m = mode;
		const tt = t;
		api?.set(m, tt);
	});


	// ── the flat picture (inset) ──
	const holePath = $derived.by(() => {
		if (mode !== 'torus') return '';
		const n = 120;
		let d = '';
		for (let i = 0; i <= n; i++) {
			const [u, v] = torusFlat.square(i / n, 0, t);
			const x = 26 + 68 * u;
			const y = 24 + 68 * (1 - v);
			d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1);
		}
		return d + 'Z';
	});
	const describe: Record<Mode, string> = {
		disk: 'f_t(x) = (1-t)\\,x',
		annulus: 'f_t(r,\\theta) = \\bigl((1-t)\\,r + t\\,r_c,\\ \\theta\\bigr)',
		mobius: '\\text{squeeze each fibre to its midpoint}',
		torus: '\\text{slide outward from the puncture}'
	};
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={460}
		camera={{ position: [1.9, 3.5, 5.5], fov: 40 }}
		controls={{ autoRotate: false }}
		label="A space sliding continuously onto a subspace: a disk onto its centre, an annulus onto its middle circle, a Möbius band onto its core circle, or a torus with a hole onto a figure eight"
	>
		<div class="inset ui" aria-hidden="true">
			<svg viewBox="0 0 120 124" width="100%" height="100%">
				<defs>
					<linearGradient id="dr-fill" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.32" />
						<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.3" />
						<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.32" />
					</linearGradient>
				</defs>
				{#if mode === 'disk'}
					<circle cx="60" cy="60" r={Math.max(0.01, 44 * (1 - t))} fill="url(#dr-fill)" stroke="#5fd6cf" stroke-width="1.6" />
					<circle cx="60" cy="60" r="3" fill="#f2d08f" />
				{:else if mode === 'annulus'}
					{@const ri = 22 + t * 11}
					{@const ro = 44 - t * 11}
					<path
						d="M{60 - ro} 60a{ro} {ro} 0 1 0 {2 * ro} 0a{ro} {ro} 0 1 0 {-2 * ro} 0ZM{60 - ri} 60a{ri} {ri} 0 1 1 {2 * ri} 0a{ri} {ri} 0 1 1 {-2 * ri} 0Z"
						fill="url(#dr-fill)"
						fill-rule="evenodd"
						stroke="#5fd6cf"
						stroke-width="1.4"
					/>
					<circle cx="60" cy="60" r="33" fill="none" stroke="#f2d08f" stroke-width="2" />
				{:else if mode === 'mobius'}
					{@const h = Math.max(0.5, 56 * (1 - t))}
					<rect x="14" y={60 - h / 2} width="92" height={h} fill="url(#dr-fill)" />
					<line x1="14" x2="106" y1={60 - h / 2} y2={60 - h / 2} stroke="#5fd6cf" stroke-width="1.4" />
					<line x1="14" x2="106" y1={60 + h / 2} y2={60 + h / 2} stroke="#5fd6cf" stroke-width="1.4" />
					<line x1="14" x2="106" y1="60" y2="60" stroke="#f2d08f" stroke-width="2" />
					<line x1="14" x2="14" y1={60 - h / 2} y2={60 + h / 2} stroke="#a493ff" stroke-width="2" />
					<line x1="106" x2="106" y1={60 - h / 2} y2={60 + h / 2} stroke="#a493ff" stroke-width="2" />
					<path d="M10 66 L14 58 L18 66" fill="none" stroke="#a493ff" stroke-width="1.6" />
					<path d="M102 54 L106 62 L110 54" fill="none" stroke="#a493ff" stroke-width="1.6" />
				{:else}
					<GluingSquare preset="torus" x={26} y={24} size={68} />
					<path d={holePath} fill="#070b15" stroke="#f28db6" stroke-width="1.6" />
				{/if}
			</svg>
			<span class="cap">flat picture</span>
		</div>
	</Scene3D>
	<Controls>
		<Segmented bind:value={mode} {options} label="Which deformation retraction" />
		<Timeline bind:value={t} from="t = 0" to="t = 1" label="The deformation retraction" duration={2.8} />
	</Controls>
	<p class="formula ui">
		<span class="lbl">at time <em>t</em>:</span>
		{@html tex(describe[mode])}
	</p>
</div>

<style>
	.inset {
		position: absolute;
		left: 0.8rem;
		top: 2.2rem;
		width: 132px;
		height: 152px;
		padding: 6px 6px 4px;
		border-radius: 10px;
		background: rgba(5, 8, 16, 0.62);
		border: 1px solid var(--line-faint);
		backdrop-filter: blur(4px);
		display: flex;
		flex-direction: column;
		align-items: center;
		pointer-events: none;
	}
	.inset svg {
		overflow: visible;
	}
	.cap {
		font-size: 0.62rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.formula {
		margin: 0;
		padding: 0 1.2rem 0.9rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		background: rgba(5, 8, 16, 0.45);
	}
	.formula .lbl {
		margin-right: 0.5rem;
		color: var(--ink-faint);
	}
	@container figure (max-width: 560px) {
		.inset {
			width: 100px;
			height: 116px;
			top: 0.6rem;
			left: 0.6rem;
		}
	}
</style>
