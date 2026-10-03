<script lang="ts">
	// S¹ × S¹: a point of the torus is an ordered pair of points, one on each circle.
	// Turn the two dials; the gold circle (θ varies) and the teal circle (φ varies)
	// are the "row" and "column" through the chosen pair, exactly as in the grid A × B.
	import * as THREE from 'three';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { glassMesh, glowTube, glowPoint, disposeTree } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';

	let theta = $state(62); // degrees, on the first circle (90° faces the camera)
	let phi = $state(48); // degrees, on the second circle (upper, outer side)

	let api: { set(th: number, ph: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, invalidate, label, camera, container } = ctx;
		if (container.clientWidth < 520) {
			// phones: widen the view so the whole torus fits
			camera.fov = 54;
			camera.updateProjectionMatrix();
		}
		const f = torus(1.6, 0.62);
		scene.add(glassMesh(surfaceGeometry(f, 160, 64), { opacity: 0.55, grid: [36, 16], gridStrength: 0.22 }));

		let rowTube: THREE.Object3D | null = null;
		let colTube: THREE.Object3D | null = null;
		const dot = glowPoint([0, 0, 0], { color: 'rose', size: 0.075 });
		scene.add(dot);
		const lbl: LabelHandle = label([0, 0, 0], '', { className: 'rose small' });
		const p = new THREE.Vector3();
		const nrm = new THREE.Vector3();

		function set(th: number, ph: number) {
			const u = th / 360;
			const v = ph / 360;
			for (const t of [rowTube, colTube]) {
				if (t) {
					scene.remove(t);
					disposeTree(t);
				}
			}
			rowTube = glowTube(new SurfaceCurve(f, (s) => [s, v], 0.014), { color: 'gold', closed: true, radius: 0.026, segments: 180 });
			colTube = glowTube(new SurfaceCurve(f, (s) => [u, s], 0.014), { color: 'teal', closed: true, radius: 0.026, segments: 90 });
			scene.add(rowTube, colTube);
			f(u, v, p);
			dot.position.copy(p);
			// put the label just outside the surface
			const R = 1.6;
			nrm.set(Math.cos(2 * Math.PI * u), 0, Math.sin(2 * Math.PI * u));
			const out = new THREE.Vector3().copy(p).sub(nrm.clone().multiplyScalar(R)).normalize();
			lbl.position.copy(p).addScaledVector(out, 0.42);
			lbl.normal = out;
			lbl.set(tex(String.raw`(\theta,\varphi)`));
			invalidate();
		}
		api = { set };
		set(theta, phi);
		return { dispose: () => (api = null) };
	}

	$effect(() => {
		const th = theta;
		const ph = phi;
		api?.set(th, ph);
	});

	// ── dials ──
	function dialPointer(e: PointerEvent, which: 'theta' | 'phi') {
		const el = e.currentTarget as SVGSVGElement;
		if (e.type === 'pointerdown') el.setPointerCapture(e.pointerId);
		if (e.type === 'pointermove' && !el.hasPointerCapture(e.pointerId)) return;
		const r = el.getBoundingClientRect();
		const x = e.clientX - (r.left + r.width / 2);
		const y = e.clientY - (r.top + r.height / 2);
		let deg = (Math.atan2(-y, x) * 180) / Math.PI;
		if (deg < 0) deg += 360;
		if (which === 'theta') theta = Math.round(deg);
		else phi = Math.round(deg);
	}
	function dialKey(e: KeyboardEvent, which: 'theta' | 'phi') {
		const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 5 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -5 : 0;
		if (!d) return;
		e.preventDefault();
		if (which === 'theta') theta = (theta + d + 360) % 360;
		else phi = (phi + d + 360) % 360;
	}
	const rad = (d: number) => (d * Math.PI) / 180;
</script>

<div class="tp">
	<Scene3D
		{setup}
		height={400}
		controls={{ autoRotate: false }}
		camera={{ position: [0, 3.4, 5.6], target: [0, -0.1, 0] }}
		animate
		label="A torus. A gold circle and a teal circle cross at one rose point, which corresponds to a pair of angles (theta, phi)."
	/>
	<Controls align="center">
		{#each [{ k: 'theta' as const, v: theta, c: 'var(--gold-bright)', t: '\\theta', name: 'first circle' }, { k: 'phi' as const, v: phi, c: 'var(--teal)', t: '\\varphi', name: 'second circle' }] as d (d.k)}
			<div class="dial">
				<svg
					viewBox="-40 -40 80 80"
					width="84"
					height="84"
					role="slider"
					tabindex="0"
					aria-label="angle on the {d.name}"
					aria-valuemin={0}
					aria-valuemax={359}
					aria-valuenow={d.v}
					onpointerdown={(e) => dialPointer(e, d.k)}
					onpointermove={(e) => dialPointer(e, d.k)}
					onkeydown={(e) => dialKey(e, d.k)}
				>
					<circle r="28" class="track" style="stroke:{d.c}" />
					<line x1="0" y1="0" x2={28 * Math.cos(rad(d.v))} y2={-28 * Math.sin(rad(d.v))} class="spoke" />
					<circle cx={28 * Math.cos(rad(d.v))} cy={-28 * Math.sin(rad(d.v))} r="7" class="knob" style="fill:{d.c}" />
				</svg>
				<div class="dl ui">
					<span class="tx">{@html tex(`${d.t} = ${d.v}^\\circ`)}</span>
					<span class="nm">{d.name}</span>
				</div>
			</div>
		{/each}
		<div class="eq">{@html tex(String.raw`(\theta,\varphi)\in S^1\times S^1`)}</div>
	</Controls>
</div>

<style>
	.dial {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}
	.dial svg {
		cursor: grab;
		touch-action: none;
		overflow: visible;
	}
	.dial svg:focus {
		outline: none;
	}
	.dial svg:focus-visible .track {
		stroke-width: 3.5;
	}
	.track {
		fill: rgba(255, 255, 255, 0.03);
		stroke-width: 2.2;
	}
	.spoke {
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.2;
	}
	.knob {
		stroke: #060912;
		stroke-width: 1.5;
		filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.35));
	}
	.dl {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.tx {
		color: var(--ink-bright);
		font-size: 1rem;
	}
	.nm {
		font-size: 0.72rem;
		color: var(--ink-faint);
		letter-spacing: 0.06em;
	}
	.eq {
		color: var(--ink-dim);
		font-size: 1.02rem;
	}
</style>
