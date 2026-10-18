<script lang="ts">
	// The gluing workshop: a square with arrows on the left, and on the right an
	// iridescent sheet that bends — without tearing — into the glued surface.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowPoint, setGlowColor } from '$lib/three/materials';
	import { tex } from '$lib/katex/render';
	import { presets, presetOrder, edgeSpecs, rp2Stages, rp2Place, type PresetId } from './morphs';
	import { ParamSheet, sheetMesh, CurveLines, type P3 } from './sheet';
	import { doubleCurveOf, immersions } from './immersions';
	import { traceFrom, type DoubleCurve } from './doubleCurve';

	let preset = $state<PresetId>('torus');
	let t = $state(0);

	const P = $derived(presets[preset]);
	// the surface's name mid-sentence: proper names keep their capital
	const noun = $derived(/^(Klein|Möbius)/.test(P.label) ? P.label : P.label[0].toLowerCase() + P.label.slice(1));
	const classColors = ['#fbf6e8', '#f28db6', '#a493ff'];
	const classColor3 = ['ivory', 'rose', 'violet'] as const;
	const nClasses = $derived(new Set(P.corners).size);
	const rules = $derived(P.rule.split(',\\ '));
	const stage = $derived.by(() => {
		let s = P.stages[0].label;
		for (const st of P.stages) if (t >= st.at) s = st.label;
		return s;
	});

	let api: { render(id: PresetId, t: number): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, invalidate } = ctx;
		const sheet = new ParamSheet(120, 120);
		const mesh = sheetMesh(sheet.geometry, { opacity: 0.8, grid: [8, 8], gridStrength: 0.32 });
		const holder = new THREE.Group();
		holder.add(mesh.group);
		scene.add(holder);
		const corners = [0, 1, 2, 3].map(() => {
			const g = glowPoint([0, 0, 0], { color: 'ivory', size: 0.055, halo: 8 });
			holder.add(g);
			return g;
		});
		const labA: LabelHandle = ctx.label([0, 0, 0], tex('a'), { className: 'gold' });
		const labB: LabelHandle = ctx.label([0, 0, 0], tex('b'), { className: 'teal' });
		const p: P3 = { x: 0, y: 0, z: 0 };
		const tmp = new THREE.Vector3();
		let current: PresetId | null = null;
		let scale = 1;
		// where the sheet passes through itself, as it happens
		const lines = new CurveLines({ color: 'rose', radius: 0.017 });
		holder.add(lines.group);

		// Boy's surface: while the part |w| ≤ ρ of it is on show, it crosses itself along the part of the
		// whole double curve whose two preimages both lie within ρ
		let boy: { raw: Float64Array; r: Float64Array } | null = null;
		const q: P3 = { x: 0, y: 0, z: 0 };
		function boyArcs(tt: number) {
			const { eB, rho } = rp2Stages(tt);
			if (eB <= 0) return [];
			if (!boy) {
				const [c] = doubleCurveOf('boy');
				const n = c.pts.length / 3;
				const r = new Float64Array(n);
				const R = (u: number, v: number) => Math.hypot(2 * u - 1, 2 * v - 1);
				for (let i = 0; i < n; i++) r[i] = Math.max(R(c.params[4 * i], c.params[4 * i + 1]), R(c.params[4 * i + 2], c.params[4 * i + 3]));
				boy = { raw: c.pts, r };
			}
			const { raw, r } = boy;
			const n = r.length;
			const inside = (i: number) => r[i % n] <= rho + 1e-9;
			const put = (out: number[], i: number, j: number, f: number) => {
				q.x = raw[3 * i] + f * (raw[3 * j] - raw[3 * i]);
				q.y = raw[3 * i + 1] + f * (raw[3 * j + 1] - raw[3 * i + 1]);
				q.z = raw[3 * i + 2] + f * (raw[3 * j + 2] - raw[3 * i + 2]);
				rp2Place(q, rho, eB, q);
				out.push(q.x, q.y, q.z);
			};
			let s0 = -1;
			for (let i = 0; i < n && s0 < 0; i++) if (!inside(i)) s0 = i;
			if (s0 < 0) {
				const all: number[] = [];
				for (let i = 0; i < n; i++) put(all, i, i, 0);
				return [{ pts: all, closed: true }];
			}
			// the runs of points within ρ, each cut off where r crosses ρ
			const arcs: { pts: number[]; closed: boolean }[] = [];
			let cur: number[] | null = null;
			for (let k = 1; k <= n; k++) {
				const i = (s0 + k) % n;
				const h = (s0 + k - 1) % n;
				if (inside(i) && !cur) {
					cur = [];
					put(cur, h, i, (rho - r[h]) / (r[i] - r[h]));
				}
				if (cur && inside(i)) put(cur, i, i, 0);
				if (cur && !inside((i + 1) % n)) {
					const j = (i + 1) % n;
					put(cur, i, j, (rho - r[i]) / (r[j] - r[i]));
					arcs.push({ pts: cur, closed: false });
					cur = null;
				}
			}
			return arcs;
		}

		// The Klein bottle: its end pushes through the wall from about t = 0.81 on. The curve where it crosses
		// is followed in time: each frame starts from a point of the last one (stepping 0.01 at a time after a
		// jump), and traces the whole curve from there.
		let kSeed: Float64Array | null = null;
		let kT = -1;
		const bottleWrap = immersions.bottle.wrap!;
		const uWrap = (P: Float64Array, k: number) => (P[k] -= Math.floor(P[k]));
		const vIn = (P: Float64Array, k: number) => P[k + 1] >= 0 && P[k + 1] <= 1;
		function kleinCurve(tt: number): DoubleCurve | null {
			if (tt < 0.78) return null;
			if (!kSeed || Math.abs(tt - kT) > 0.03) {
				kSeed = doubleCurveOf('bottle')[0].params.slice(0, 4);
				kT = 1;
			}
			const steps = Math.max(1, Math.ceil(Math.abs(tt - kT) / 0.01));
			const size = 2 * sheet.radius;
			let c: DoubleCurve | null = null;
			for (let s = 1; s <= steps; s++) {
				const ts = kT + ((tt - kT) * s) / steps;
				c = traceFrom((u, v, o) => presets.klein.f(u, v, ts, o), kSeed, size, ts >= 1 ? { wrap: bottleWrap } : { wrap: uWrap, inside: vIn });
				if (!c) return null;
				const m = Math.floor(c.pts.length / 6);
				kSeed = c.params.slice(4 * m, 4 * m + 4);
				kT = ts;
			}
			return c;
		}

		function place(label: LabelHandle, u: number, v: number, f: (u: number, v: number, t: number, o: P3) => void, tt: number, push: number) {
			f(u, v, tt, p);
			// nudge the label off the surface, away from the centre
			tmp.set(p.x - sheet.center.x, p.y - sheet.center.y, p.z - sheet.center.z);
			const len = tmp.length() || 1;
			tmp.multiplyScalar(push / len / scale);
			label.position.set(p.x + tmp.x, p.y + tmp.y, p.z + tmp.z);
			holder.updateMatrixWorld();
			label.position.applyMatrix4(holder.matrixWorld);
		}

		api = {
			render(id, tt) {
				const pr = presets[id];
				if (id !== current) {
					current = id;
					const e = edgeSpecs(pr);
					mesh.setEdges([e[0], e[1], e[2], e[3]]);
					pr.corners.forEach((c, i) => setGlowColor(corners[i], classColor3[c]));
				}
				sheet.update((u, v, o) => pr.f(u, v, tt, o));
				// keep the shape framed: scale its on-screen extent to a fixed size
				const g = sheet.geometry.attributes.position.array as Float32Array;
				let mx = 0,
					my = 0,
					mz = 0;
				const c = sheet.center;
				for (let i = 0; i < g.length; i += 3) {
					mx = Math.max(mx, Math.abs(g[i] - c.x));
					my = Math.max(my, Math.abs(g[i + 1] - c.y));
					mz = Math.max(mz, Math.abs(g[i + 2] - c.z));
				}
				const aspect = camera.aspect || 1.5;
				const half = Math.max(my, mx / Math.min(1.25, aspect * 0.95), mz * 0.55);
				scale = 1.62 / Math.max(half, 1e-3);
				holder.scale.setScalar(scale);
				holder.position.set(-c.x * scale, -c.y * scale, -c.z * scale);
				mesh.setUniform('uEdgeW', 0.03 / scale);
				mesh.setOutward(sheet.outward);
				if (id === 'rp2') lines.show(boyArcs(tt), 1 / scale);
				else if (id === 'klein') {
					const k = kleinCurve(tt);
					if (k) lines.show([k], 1 / scale);
					else lines.hide();
				} else lines.hide();
				const cornerUV: [number, number][] = [
					[0, 0],
					[1, 0],
					[1, 1],
					[0, 1]
				];
				cornerUV.forEach(([u, v], i) => {
					pr.f(u, v, tt, p);
					corners[i].position.set(p.x, p.y, p.z);
					corners[i].scale.setScalar(1 / scale);
				});
				// one label per glued pair, at the middle of one of its edges
				const s = pr.sides;
				const anchor = (name: string): [number, number] | null =>
					s.bottom.label === name ? [0.5, 0] : s.left.label === name ? [0, 0.5] : s.top.label === name ? [0.5, 1] : null;
				const pa = anchor('a');
				let pb = anchor('b');
				// On the finished Klein bottle the middle of b lands right beside the small
				// a-circle, so the two labels would crowd each other: slide b's label along its
				// edge to the top of the bottle's loop as the bottle forms.
				// The a-edge closes up into a small circle beside a corner's glow; push its label further out.
				const kGrow = id === 'klein' ? Math.min(1, Math.max(0, (tt - 0.4) / 0.6)) : 0;
				if (id === 'klein' && pb) pb = [pb[0], 0.5 + 0.25 * kGrow];
				labA.show(!!pa);
				labB.show(!!pb);
				if (pa) place(labA, pa[0], pa[1], pr.f, tt, 0.34 + 0.36 * kGrow);
				if (pb) place(labB, pb[0], pb[1], pr.f, tt, 0.34);
				invalidate();
			}
		};
		api.render(preset, t);
		return {
			dispose() {
				api = null;
			}
		};
	}

	$effect(() => {
		// read the state first so the effect subscribes to it even before the scene exists
		const id = preset;
		const tt = t;
		api?.render(id, tt);
	});

	const options = presetOrder.map((id) => ({ value: id, label: presets[id].label }));
	// corner positions in the diagram (BL, BR, TR, TL)
	const S0 = 46;
	const SZ = 168;
	// on narrow plates the little square is drawn with less margin, so its labels stay legible
	let ww = $state(800);
	const cornerXY: [number, number][] = [
		[S0, S0 + SZ],
		[S0 + SZ, S0 + SZ],
		[S0 + SZ, S0],
		[S0, S0]
	];
</script>

<div class="workshop" bind:clientWidth={ww}>
	<div class="panel2d">
		<Svg viewBox={ww < 520 ? '12 12 236 236' : '0 0 260 260'} maxHeight={300} label="The square with arrows showing how its edges are glued for the {P.label}">
			{#each [1, 2, 3, 4, 5, 6, 7] as k (k)}
				<line x1={S0 + (k * SZ) / 8} y1={S0} x2={S0 + (k * SZ) / 8} y2={S0 + SZ} class="grid" />
				<line x1={S0} y1={S0 + (k * SZ) / 8} x2={S0 + SZ} y2={S0 + (k * SZ) / 8} class="grid" />
			{/each}
			<GluingSquare preset="plain" sides={P.sides} x={S0} y={S0} size={SZ} />
			{#each cornerXY as [cx, cy], i (i)}
				<circle {cx} {cy} r="6.5" fill={classColors[P.corners[i]]} stroke="#060912" stroke-width="1.6" />
			{/each}
		</Svg>
		<dl class="facts ui">
			<div>
					<dt>Rule</dt>
					<dd>
						<!-- one relation per unbreakable piece, so a long rule wraps at its comma -->
						{#each rules as r, i (i)}<span class="rel"><TeX tex={i < rules.length - 1 ? r + ',' : r} /></span>{' '}{/each}
					</dd>
				</div>
			<div>
				<dt>Word</dt>
				<dd>{#if P.word}<TeX tex={P.word} />{:else}<span class="dim">has free edges</span>{/if}</dd>
			</div>
			<div>
				<dt>Corners</dt>
				<dd>
					{#each Array.from(new Set(P.corners)) as c (c)}<span class="dot" style="background:{classColors[c]}"></span>{/each}
					{nClasses} {nClasses === 1 ? 'point' : 'points'}
				</dd>
			</div>
			<div>
				<dt>In 3D?</dt>
				<dd class:no={!P.embeds}>{P.embeds ? 'fits without crossing itself' : 'must pass through itself'}</dd>
			</div>
		</dl>
	</div>
	<div class="panel3d">
		<Scene3D
			{setup}
			height={430}
			camera={{ position: [0, 1.1, 7.6], fov: 38 }}
			controls={{ autoRotate: false }}
			label="A flexible iridescent sheet with coloured edges that bends into the glued surface: a cylinder, Möbius band, torus, Klein bottle, sphere or projective plane"
		/>
		<div class="stage ui" aria-live="polite">{stage}</div>
	</div>
</div>
<div class="bar ui">
	<Segmented bind:value={preset} {options} label="Surface" />
	<Timeline bind:value={t} duration={5.2} from="square" to={noun} label="Gluing the square into a {noun}" />
</div>

<style>
	.workshop {
		display: grid;
		grid-template-columns: minmax(200px, 270px) 1fr;
		align-items: center;
		gap: 0.5rem;
		padding: 0.6rem 0.8rem 0;
	}
	.panel2d {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		padding-left: 0.4rem;
	}
	.grid {
		stroke: rgba(191, 228, 255, 0.13);
		stroke-width: 1;
	}
	.panel3d {
		position: relative;
		min-width: 0;
	}
	.stage {
		position: absolute;
		left: 50%;
		bottom: 0.6rem;
		transform: translateX(-50%);
		font-size: 0.78rem;
		letter-spacing: 0.03em;
		color: var(--ink-dim);
		background: rgba(6, 10, 20, 0.66);
		border: 1px solid var(--line-faint);
		border-radius: 0.9rem;
		padding: 0.25rem 0.8rem;
		pointer-events: none;
		/* clear of the reset-view button in the corner; long stages wrap */
		width: max-content;
		max-width: calc(100% - 7rem);
		text-align: center;
		text-wrap: pretty;
	}
	.facts {
		margin: 0;
		display: grid;
		gap: 0.3rem;
		font-size: 0.78rem;
	}
	.facts div {
		display: grid;
		grid-template-columns: 4.6rem 1fr;
		align-items: baseline;
		gap: 0.5rem;
	}
	dt {
		color: var(--ink-faint);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-size: 0.66rem;
	}
	dd {
		margin: 0;
		color: var(--ink);
	}
	.rel {
		white-space: nowrap;
	}
	dd.no {
		color: var(--rose);
	}
	.dim {
		color: var(--ink-faint);
	}
	.dot {
		display: inline-block;
		width: 0.62rem;
		height: 0.62rem;
		border-radius: 50%;
		margin-right: 0.25rem;
		vertical-align: -0.05rem;
		box-shadow: 0 0 6px rgba(255, 255, 255, 0.35);
	}
	.bar {
		display: grid;
		gap: 0.7rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	@container figure (max-width: 700px) {
		.workshop {
			grid-template-columns: 1fr;
			padding: 0.5rem 0.4rem 0;
		}
		.panel2d {
			display: grid;
			grid-template-columns: 150px 1fr;
			align-items: center;
			padding: 0 0.4rem;
		}
	}
	@container figure (max-width: 520px) {
		.panel2d {
			grid-template-columns: 176px 1fr;
			padding: 0 0.2rem;
		}
		.facts div {
			grid-template-columns: 1fr;
			gap: 0;
		}
		/* too narrow to float over the scene: sit under it instead */
		.stage {
			position: static;
			transform: none;
			display: block;
			max-width: calc(100% - 1.6rem);
			margin: 0.2rem auto 0.7rem;
		}
	}
</style>
