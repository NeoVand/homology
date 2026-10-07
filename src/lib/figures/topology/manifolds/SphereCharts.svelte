<script lang="ts">
	// An atlas of the sphere: six hemisphere charts. Move the point; every chart
	// that contains it lights up on the globe and shows the point's coordinates
	// on its flat map. Where two charts overlap, the transition map converts one
	// set of coordinates into the other.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowPoint, glowTube } from '$lib/three/materials';
	import { sphere, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glass } from '../homotopy/glass';
	import { chartMap, charts, inChart, transition, transitionTeX, type Chart, type V3 } from './charts';

	const SR = 1.5;
	const unit = (p: V3): V3 => {
		const L = Math.hypot(p[0], p[1], p[2]) || 1;
		return [p[0] / L, p[1] / L, p[2] / L];
	};

	let p = $state<V3>(unit([0.5, -0.45, 0.74]));
	let active = $state('z+');
	let api: { set(p: V3, active: string): void } | null = null;

	const containing = $derived(charts.filter((c) => inChart(c, p, 1e-6)));
	const activeChart = $derived(containing.find((c) => c.id === active) ?? containing[0]);
	const other = $derived(containing.find((c) => c !== activeChart));

	// latitude / longitude circles of the unit sphere (for drawing chart grids)
	const sphereLines: V3[][] = [];
	for (let k = 1; k < 6; k++) {
		const lat = -Math.PI / 2 + (k * Math.PI) / 6;
		sphereLines.push(Array.from({ length: 73 }, (_, i) => [Math.cos(lat) * Math.cos((i * Math.PI) / 36), Math.cos(lat) * Math.sin((i * Math.PI) / 36), Math.sin(lat)] as V3));
	}
	for (let k = 0; k < 6; k++) {
		const lon = (k * Math.PI) / 6;
		sphereLines.push(
			Array.from({ length: 73 }, (_, i) => {
				const th = (i * Math.PI) / 36;
				return [Math.sin(th) * Math.cos(lon), Math.sin(th) * Math.sin(lon), Math.cos(th)] as V3;
			})
		);
	}

	// math (x, y, z), z up  →  three (x, z, −y)
	const toThree = (q: V3): [number, number, number] => [q[0], q[2], -q[1]];
	const fromThree = (x: number, y: number, z: number): V3 => [x, -z, y];

	function setup(ctx: SceneContext) {
		const { scene, THREE, canvas } = ctx;
		ctx.camera.near = 0.5;
		ctx.camera.far = 60;
		ctx.camera.updateProjectionMatrix();
		const geo = surfaceGeometry(sphere(SR), 96, 48);
		const globe = glass(geo, { opacity: 0.72, grid: [24, 12], gridStrength: 0.26 });
		scene.add(globe);

		// one translucent cap + rim per chart
		const capGeo = new THREE.SphereGeometry(SR * 1.008, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2);
		const capMat = (hex: string) =>
			new THREE.ShaderMaterial({
				uniforms: { uColor: { value: new THREE.Color(hex) } },
				vertexShader: /* glsl */ `varying vec3 vN; varying vec3 vP; void main(){ vec4 wp = modelMatrix*vec4(position,1.0); vP = wp.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*wp; }`,
				fragmentShader: /* glsl */ `uniform vec3 uColor; varying vec3 vN; varying vec3 vP; void main(){ vec3 V = normalize(cameraPosition - vP); float f = pow(1.0 - abs(dot(normalize(vN), V)), 2.0); float a = 0.07 + 0.2 * f; gl_FragColor = vec4(uColor * a, a); }`,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				side: THREE.DoubleSide
			});
		const axisVec = (c: Chart) => {
			const m: V3 = [0, 0, 0];
			m[{ x: 0, y: 1, z: 2 }[c.axis]] = c.sign;
			return new THREE.Vector3(...toThree(m));
		};
		const up = new THREE.Vector3(0, 1, 0);
		const caps = charts.map((c) => {
			const g = new THREE.Group();
			const mesh = new THREE.Mesh(capGeo, capMat(c.color));
			mesh.renderOrder = 3;
			g.add(mesh);
			// the chart's edge: a great circle (not part of the chart)
			const ringPts = Array.from({ length: 96 }, (_, i) => {
				const t = (i / 96) * Math.PI * 2;
				return new THREE.Vector3(SR * 1.01 * Math.cos(t), 0, SR * 1.01 * Math.sin(t));
			});
			const ring = glowTube(new THREE.CatmullRomCurve3(ringPts, true), { color: c.color, radius: 0.016, closed: true, segments: 192 });
			g.add(ring);
			g.quaternion.setFromUnitVectors(up, axisVec(c));
			scene.add(g);
			return { c, g };
		});

		// the flat map of the active chart, seen inside the globe
		const flat = new THREE.Group();
		const disk = new THREE.Mesh(
			new THREE.CircleGeometry(SR, 72),
			new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide })
		);
		disk.rotation.x = -Math.PI / 2;
		flat.add(disk);
		scene.add(flat);
		// the chart's own grid (latitudes and longitudes seen from above the plane)
		const gridMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, depthWrite: false });
		let gridLines: InstanceType<typeof THREE.LineSegments> | null = null;
		let gridFor = '';
		const axisDir: Record<string, V3> = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
		function buildGrid(c: Chart) {
			if (gridFor === c.id) return;
			gridFor = c.id;
			if (gridLines) {
				scene.remove(gridLines);
				gridLines.geometry.dispose();
			}
			const e1 = new THREE.Vector3(...toThree(axisDir[c.keep[0]]));
			const e2 = new THREE.Vector3(...toThree(axisDir[c.keep[1]]));
			const pts: number[] = [];
			for (const ln of sphereLines) {
				let prev: [number, number] | null = null;
				for (const q of ln) {
					if (!inChart(c, q, 0.02)) {
						prev = null;
						continue;
					}
					const uv = chartMap(c, q);
					if (prev) {
						for (const w of [prev, uv]) {
							const v3 = e1.clone().multiplyScalar(w[0] * SR).addScaledVector(e2, w[1] * SR);
							pts.push(v3.x, v3.y, v3.z);
						}
					}
					prev = uv;
				}
			}
			const g = new THREE.BufferGeometry();
			g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
			gridLines = new THREE.LineSegments(g, gridMat);
			gridLines.renderOrder = 4;
			gridMat.color.set(c.color);
			scene.add(gridLines);
		}
		const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
		const line = new THREE.Line(lineGeo, new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.06, gapSize: 0.05, transparent: true, opacity: 0.8 }));
		scene.add(line);
		const dot = glowPoint([0, 0, 0], { color: 'gold', size: 0.07 });
		const shadow = glowPoint([0, 0, 0], { color: 'ivory', size: 0.045 });
		scene.add(dot, shadow);

		const P = new THREE.Vector3();
		const N = new THREE.Vector3();
		api = {
			set(pp, act) {
				const inside = charts.filter((c) => inChart(c, pp, 1e-6));
				const a = inside.find((c) => c.id === act) ?? inside[0];
				for (const { c, g } of caps) g.visible = inside.includes(c);
				P.set(...toThree(pp)).multiplyScalar(SR);
				dot.position.copy(P).multiplyScalar(1.012);
				N.copy(axisVec(a));
				flat.quaternion.setFromUnitVectors(up, N);
				(disk.material as InstanceType<typeof THREE.MeshBasicMaterial>).color.set(a.color);
				buildGrid(a);
				const foot = P.clone().addScaledVector(N, -P.dot(N));
				shadow.position.copy(foot);
				(shadow.children[1] as InstanceType<typeof THREE.Sprite>).material.color.set(a.color);
				lineGeo.setFromPoints([P, foot]);
				line.computeLineDistances();
				ctx.invalidate();
			}
		};
		api.set(p, active);

		// hover (mouse) or tap (touch) to move the point
		let downAt: [number, number] | null = null;
		const pickTo = (e: PointerEvent) => {
			const hit = ctx.pick(e, [globe])[0];
			if (!hit) return;
			const q = hit.point;
			p = unit(fromThree(q.x, q.y, q.z));
		};
		const onMove = (e: PointerEvent) => {
			if (e.pointerType === 'mouse' && e.buttons === 0) pickTo(e);
		};
		const onDown = (e: PointerEvent) => (downAt = [e.clientX, e.clientY]);
		const onUp = (e: PointerEvent) => {
			if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 6) pickTo(e);
			downAt = null;
		};
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerdown', onDown);
		canvas.addEventListener('pointerup', onUp);
		return {
			dispose: () => {
				api = null;
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerdown', onDown);
				canvas.removeEventListener('pointerup', onUp);
			}
		};
	}

	$effect(() => {
		const pp = p;
		const a = active;
		api?.set(pp, a);
	});

	// ── the six flat maps ──
	const D = 46; // disk radius in px (viewBox units)
	const cells = charts.map((c, i) => ({ c, cx: 70 + (i % 3) * 140, cy: 66 + Math.floor(i / 3) * 150 }));
	// latitude/longitude lines of the sphere, projected into each chart
	function gridPaths(c: Chart): string[] {
		const out: string[] = [];
		const lines = sphereLines;
		for (const ln of lines) {
			let d = '';
			let pen = false;
			for (const q of ln) {
				if (!inChart(c, q, 0.02)) {
					pen = false;
					continue;
				}
				const [u, v] = chartMap(c, q);
				d += `${pen ? 'L' : 'M'}${(u * D).toFixed(1)} ${(-v * D).toFixed(1)}`;
				pen = true;
			}
			if (d) out.push(d);
		}
		return out;
	}
	const grids = Object.fromEntries(charts.map((c) => [c.id, gridPaths(c)]));
	const fmt = (v: number) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);

	function preset(q: V3) {
		p = unit(q);
	}
</script>

<div class="grid">
	<div class="globe">
		<Scene3D
			{setup}
			height={400}
			camera={{ position: [2.2, 2.6, 5.4], fov: 38 }}
			controls={{ autoRotate: false }}
			label="A glass sphere with coloured caps: each cap is a hemisphere chart containing the gold point; a translucent disk shows the flat map of the selected chart and a dashed line projects the point onto it"
		/>
	</div>
	<div class="maps">
		<svg viewBox="0 -6 420 306" role="img" aria-label="The six flat chart maps, each showing the point's coordinates if the point lies in that chart">
			{#each cells as { c, cx, cy } (c.id)}
				{@const on = containing.includes(c)}
				{@const sel = activeChart === c}
				<g
					transform="translate({cx} {cy})"
					class="map"
					class:on
					role="button"
					tabindex="0"
					aria-label="chart {c.tex}"
					onclick={() => on && (active = c.id)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && on && (active = c.id)}
				>
					<circle r={D + 6} fill={sel ? 'rgba(255,255,255,0.06)' : 'transparent'} stroke={sel ? c.color : 'transparent'} stroke-width="1.2" stroke-dasharray="3 3" />
					<circle r={D} fill="rgba(10,15,30,0.85)" stroke={c.color} stroke-opacity={on ? 0.9 : 0.3} stroke-width="1.6" />
					{#each grids[c.id] as d, k (k)}
						<path {d} fill="none" stroke={c.color} stroke-opacity={on ? 0.32 : 0.12} stroke-width="0.8" />
					{/each}
					{#if on}
						{@const uv = chartMap(c, p)}
						<circle cx={uv[0] * D} cy={-uv[1] * D} r="9" fill={c.color} fill-opacity="0.25" />
						<circle cx={uv[0] * D} cy={-uv[1] * D} r="4" fill="#fff8e6" />
						<foreignObject x={-D - 10} y={D + 4} width={2 * D + 20} height="22">
							<div class="coord">({fmt(uv[0])}, {fmt(uv[1])})</div>
						</foreignObject>
					{:else}
						<foreignObject x={-D - 10} y={D + 4} width={2 * D + 20} height="22">
							<div class="coord off">not in this chart</div>
						</foreignObject>
					{/if}
					<foreignObject x={-D} y={-D - 28} width={2 * D} height="20">
						<div class="ctitle" style="color:{c.color}">{@html tex(c.tex)}</div>
					</foreignObject>
				</g>
			{/each}
		</svg>
	</div>
</div>
<div class="readout ui" aria-live="polite">
	<div>
		point <TeX tex={`p = (${fmt(p[0])},\\ ${fmt(p[1])},\\ ${fmt(p[2])})`} /> lies in <strong>{containing.length}</strong>
		{containing.length === 1 ? 'chart' : 'charts'}.
	</div>
	{#if activeChart && other}
		{@const uv = chartMap(activeChart, p)}
		{@const w = transition(activeChart, other, uv[0], uv[1])}
		<div class="tr">
			transition from <span style="color:{activeChart.color}"><TeX tex={activeChart.tex} /></span> to
			<span style="color:{other.color}"><TeX tex={other.tex} /></span>:
			<TeX tex={transitionTeX(activeChart, other)} />, so <TeX tex={`(${fmt(uv[0])}, ${fmt(uv[1])}) \\mapsto (${fmt(w[0])}, ${fmt(w[1])})`} />
		</div>
	{/if}
</div>
<Controls>
	<Button onclick={() => preset([0.08, -0.06, 1])}>Near the north pole</Button>
	<Button onclick={() => preset([0.7, -0.7, 0.04])}>On the equator</Button>
	<Button onclick={() => preset([0.5, -0.45, 0.74])}>A typical point</Button>
	<span class="tip">Hover or tap the globe to move the point; click a map to make it the active chart.</span>
</Controls>

<style>
	.grid {
		display: grid;
		grid-template-columns: 1.15fr 1fr;
		align-items: center;
	}
	@container figure (max-width: 760px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
	.globe {
		min-width: 0;
	}
	.maps {
		padding: 0.6rem 0.8rem;
	}
	.maps svg {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
	}
	.map {
		cursor: default;
		outline: none;
	}
	.map.on {
		cursor: pointer;
	}
	.map:focus-visible circle:first-child {
		stroke: var(--gold-bright);
	}
	.coord {
		text-align: center;
		font-family: var(--font-ui);
		font-size: 11px;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.coord.off {
		color: var(--ink-faint);
		font-size: 10px;
	}
	.ctitle {
		text-align: center;
		font-size: 13px;
	}
	/* phones: the six maps are drawn at about 80%, so their lettering grows */
	@container figure (max-width: 30rem) {
		.coord {
			font-size: 13.5px;
		}
		.coord.off {
			font-size: 12px;
		}
		.ctitle {
			font-size: 15px;
		}
	}
	.readout {
		padding: 0.3rem 1.2rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.readout strong {
		color: var(--gold-bright);
	}
	.tip {
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
</style>
