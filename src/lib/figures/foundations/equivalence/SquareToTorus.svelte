<script lang="ts">
	// Teaser for §2.2: identify opposite sides of a square and you get a torus.
	// The square is a flexible sheet. Every pair of points the relation identifies
	// is joined by a thread; as the sheet rolls and bends, the threads shorten to
	// nothing and the pairs become single points. Rolling stitches the b-sides
	// together (the two p's meet, and the corners pair up: 4 → 2), bending
	// stitches the a-sides (the two q's meet, and the corner pairs meet: 2 → 1).
	// The geometry is the gluing workshop's torus morph (topology/gluing/morphs.ts),
	// whose tests check that glued points really do coincide.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { color, glowPoint } from '$lib/three/materials';
	import { tex } from '$lib/katex/render';
	import { presets, edgeSpecs } from '$lib/figures/topology/gluing/morphs';
	import { ParamSheet, sheetMesh, type P3 } from '$lib/figures/topology/gluing/sheet';
	import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
	import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
	import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
	import type * as THREE_NS from 'three';

	const torus = presets.torus;
	const f = torus.f;
	const PV = 0.65; // the p's sit on the b-sides at this height
	const QU = 0.68; // the q's sit on the a-sides at this position

	let t = $state(0);
	let cw = $state(800);
	const narrow = $derived(cw < 560);

	// how many distinct points each class has right now (measured in 3D)
	let counts = $state({ corners: 4, p: 2, q: 2 });

	const stage = $derived(
		t < 0.015
			? 'The square. Each thread joins two points that will become one.'
			: t < 0.42
				? 'Roll: the threads pull each point of the left side to its partner on the right.'
				: t < 0.5
					? 'The b-sides are stitched: a tube. The two p’s are one point, and the corners have paired up.'
					: t < 0.985
						? 'Bend: the threads pull the two end circles (the a-sides) together.'
						: 'Glued: a torus. The two q’s are one point, and all four corners are the single point v.'
	);

	let api: { render(t: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, invalidate } = ctx;
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const sheet = new ParamSheet(96, 96);
		const mesh = sheetMesh(sheet.geometry, { opacity: 0.8, grid: [8, 8], gridStrength: 0.3 });
		const e = edgeSpecs(torus);
		mesh.setEdges([e[0], e[1], e[2], e[3]]);
		const holder = new THREE.Group();
		holder.add(mesh.group);
		scene.add(holder);

		// ── threads: thin glowing segments whose ends move with the sheet ─────
		type Threads = { geo: LineSegmentsGeometry; core: LineMaterial; glow: LineMaterial; group: THREE_NS.Group; buf: Float32Array; n: number };
		function threads(n: number, col: string, width: number): Threads {
			const buf = new Float32Array(n * 6);
			const geo = new LineSegmentsGeometry();
			geo.setPositions(buf);
			const c = color(col);
			const core = new LineMaterial({ color: c, linewidth: width * dpr, transparent: true, depthWrite: false });
			const glow = new LineMaterial({
				color: c,
				linewidth: width * 3.2 * dpr,
				transparent: true,
				opacity: 0.3,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			});
			const group = new THREE.Group();
			for (const [m, order] of [
				[glow, 9],
				[core, 10]
			] as const) {
				const l = new LineSegments2(geo, m);
				l.renderOrder = order;
				l.frustumCulled = false;
				group.add(l);
			}
			holder.add(group);
			return { geo, core, glow, group, buf, n };
		}
		function setThreads(th: Threads, ends: (k: number, a: P3, b: P3) => void, alpha: (gap: number) => number) {
			let peak = 0;
			for (let k = 0; k < th.n; k++) {
				ends(k, pa, pb);
				const gap = Math.hypot(pa.x - pb.x, pa.y - pb.y, pa.z - pb.z);
				peak = Math.max(peak, alpha(gap));
				th.buf.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], k * 6);
			}
			const start = th.geo.attributes.instanceStart as THREE_NS.InterleavedBufferAttribute;
			start.data.array.set(th.buf);
			start.data.needsUpdate = true;
			th.group.visible = peak > 0.01;
			th.core.opacity = peak;
			th.glow.opacity = 0.3 * peak;
		}
		const pa: P3 = { x: 0, y: 0, z: 0 };
		const pb: P3 = { x: 0, y: 0, z: 0 };
		const NB = 9;
		const NA = 9;
		const bThreads = threads(NB, 'teal', 1.4); // (0, v) ~ (1, v)
		const aThreads = threads(NA, 'gold', 1.4); // (u, 0) ~ (u, 1)
		const pThread = threads(1, 'rose', 2.4);
		const qThread = threads(1, 'violet', 2.4);

		// ── the marked points ─────────────────────────────────────────────────
		const corners = [0, 1, 2, 3].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'ivory', size: 0.055, halo: 8 });
			holder.add(g);
			return g;
		});
		const ps = [0, 1].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'rose', size: 0.06, halo: 8 });
			holder.add(g);
			return g;
		});
		const qs = [0, 1].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'violet', size: 0.06, halo: 8 });
			holder.add(g);
			return g;
		});
		const labA: LabelHandle = ctx.label([0, 0, 0], tex('a'), { className: 'gold' });
		const labB: LabelHandle = ctx.label([0, 0, 0], tex('b'), { className: 'teal' });
		const labP: LabelHandle = ctx.label([0, 0, 0], tex('p'), { className: 'small' });
		const labQ: LabelHandle = ctx.label([0, 0, 0], tex('q'), { className: 'small' });
		const labV: LabelHandle = ctx.label([0, 0, 0], tex('v'), { className: 'small' });
		labP.el.style.color = 'var(--rose)';
		labQ.el.style.color = 'var(--violet)';

		const p: P3 = { x: 0, y: 0, z: 0 };
		const tmp = new THREE.Vector3();
		let scale = 1;
		function place(label: LabelHandle, u: number, v: number, tt: number, push: number) {
			f(u, v, tt, p);
			tmp.set(p.x - sheet.center.x, p.y - sheet.center.y, p.z - sheet.center.z);
			const len = tmp.length() || 1;
			tmp.multiplyScalar(push / len / scale);
			label.position.set(p.x + tmp.x, p.y + tmp.y, p.z + tmp.z);
			label.position.applyMatrix4(holder.matrixWorld);
		}
		const at = (g: THREE_NS.Object3D, u: number, v: number, tt: number) => {
			f(u, v, tt, p);
			g.position.set(p.x, p.y, p.z);
			g.scale.setScalar(1 / scale);
			return g.position;
		};
		/** number of distinct points among these positions */
		const distinct = (pts: THREE_NS.Vector3[]) => {
			const reps: THREE_NS.Vector3[] = [];
			for (const q of pts) if (!reps.some((r) => r.distanceTo(q) < 0.02)) reps.push(q);
			return reps.length;
		};

		api = {
			render(tt) {
				sheet.update((u, v, o) => f(u, v, tt, o));
				// keep the shape framed: scale its on-screen extent to a fixed size
				const g = sheet.geometry.attributes.position.array as Float32Array;
				let mx = 0;
				let my = 0;
				let mz = 0;
				const c = sheet.center;
				for (let i = 0; i < g.length; i += 3) {
					mx = Math.max(mx, Math.abs(g[i] - c.x));
					my = Math.max(my, Math.abs(g[i + 1] - c.y));
					mz = Math.max(mz, Math.abs(g[i + 2] - c.z));
				}
				const aspect = camera.aspect || 1.5;
				const half = Math.max(my, mx / Math.min(1.25, aspect * 0.95), mz * 0.55);
				scale = 1.55 / Math.max(half, 1e-3);
				holder.scale.setScalar(scale);
				holder.position.set(-c.x * scale, -c.y * scale, -c.z * scale);
				holder.updateMatrixWorld();
				mesh.setUniform('uEdgeW', 0.095 / scale);
				mesh.setOutward(sheet.outward);

				// threads: visible while there is a gap to close. The b-threads show from
				// the start (they are the relation's pairs); the a-threads join in once the
				// tube has formed, so the square is not covered in a mesh of lines.
				const closing = (gap: number) => Math.min(1, Math.max(0, (gap - 0.015) / 0.12));
				const bOn = tt < 0.012 ? 0.55 : 1;
				const aOn = Math.min(1, Math.max(0, (tt - 0.36) / 0.12));
				setThreads(
					bThreads,
					(k, a, b) => {
						const v = k / (NB - 1);
						f(0, v, tt, a);
						f(1, v, tt, b);
					},
					(gap) => bOn * closing(gap)
				);
				setThreads(
					aThreads,
					(k, a, b) => {
						const u = k / (NA - 1);
						f(u, 0, tt, a);
						f(u, 1, tt, b);
					},
					(gap) => aOn * closing(gap)
				);
				setThreads(
					pThread,
					(_, a, b) => {
						f(0, PV, tt, a);
						f(1, PV, tt, b);
					},
					(gap) => bOn * closing(gap)
				);
				setThreads(
					qThread,
					(_, a, b) => {
						f(QU, 0, tt, a);
						f(QU, 1, tt, b);
					},
					(gap) => Math.max(aOn, tt < 0.012 ? 0.55 : 0) * closing(gap)
				);
				for (const th of [bThreads, aThreads, pThread, qThread]) {
					th.core.resolution.set(ctx.canvas.width, ctx.canvas.height);
					th.glow.resolution.set(ctx.canvas.width, ctx.canvas.height);
				}

				// the points, and how many distinct points each class is
				const cp = (
					[
						[0, 0],
						[1, 0],
						[1, 1],
						[0, 1]
					] as const
				).map(([u, v], i) => at(corners[i], u, v, tt).clone());
				const pp = [at(ps[0], 0, PV, tt).clone(), at(ps[1], 1, PV, tt).clone()];
				const qp = [at(qs[0], QU, 0, tt).clone(), at(qs[1], QU, 1, tt).clone()];
				const next = { corners: distinct(cp), p: distinct(pp), q: distinct(qp) };
				if (next.corners !== counts.corners || next.p !== counts.p || next.q !== counts.q) counts = next;

				place(labA, 0.5, 0, tt, 0.34);
				place(labB, 0, 0.5, tt, 0.34);
				place(labP, 0, PV, tt, 0.3);
				place(labQ, QU, 0, tt, 0.3);
				place(labV, 0, 0, tt, 0.3);
				labV.show(tt > 0.985);
				invalidate();
			}
		};
		api.render(t);
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		// read t first, so the effect subscribes to it even before the scene exists
		const tt = t;
		api?.render(tt);
	});

	const plural = (n: number) => (n === 1 ? 'point' : 'points');
</script>

<div class="wrap" bind:clientWidth={cw}>
	<Scene3D
		{setup}
		height={narrow ? 400 : 460}
		camera={{ position: [0, 1.1, 7.6], fov: 38 }}
		controls={{ autoRotate: false }}
		label="A flexible square sheet with its sides marked a and b. Threads join the points to be glued; the sheet rolls into a tube, stitching the b-sides, then bends into a torus, stitching the a-sides"
	/>
	{#if !narrow}<div class="stage ui" aria-live="polite">{stage}</div>{/if}
</div>
<div class="bar ui">
	{#if narrow}<div class="stage-line" aria-live="polite">{stage}</div>{/if}
	<div class="classes" aria-live="polite">
		<span class="cl"><span class="dot ivory"></span>corners: <b>{counts.corners}</b> {plural(counts.corners)}</span>
		<span class="cl"><span class="dot rose"></span><TeX tex="p" />: <b>{counts.p}</b> {plural(counts.p)}</span>
		<span class="cl"><span class="dot violet"></span><TeX tex="q" />: <b>{counts.q}</b> {plural(counts.q)}</span>
	</div>
	<Timeline bind:value={t} duration={7} from="square" to="torus" label="Gluing the square into a torus" />
</div>

<style>
	.wrap {
		position: relative;
	}
	.stage {
		position: absolute;
		left: 50%;
		bottom: 0.6rem;
		transform: translateX(-50%);
		width: max-content;
		max-width: calc(100% - 1.5rem);
		text-align: center;
		font-size: 0.78rem;
		line-height: 1.35;
		letter-spacing: 0.02em;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.66);
		padding: 0.3rem 0.7rem;
		border-radius: 8px;
		pointer-events: none;
	}
	.stage-line {
		text-align: center;
		font-size: 0.8rem;
		line-height: 1.4;
		color: var(--ink-dim);
	}
	.bar {
		display: grid;
		gap: 0.7rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.classes {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem 1.3rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.cl {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.cl b {
		color: var(--ink-bright);
		font-variant-numeric: tabular-nums;
	}
	.dot {
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
	}
	.dot.ivory {
		background: #fbf6e8;
	}
	.dot.rose {
		background: var(--rose);
	}
	.dot.violet {
		background: var(--violet);
	}
</style>
