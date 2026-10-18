<script lang="ts">
	// The octagon a₁b₁a₁⁻¹b₁⁻¹a₂b₂a₂⁻¹b₂⁻¹ becomes a two-holed doughnut, in one continuous motion: cut along
	// the diagonal c, each half curls round until c closes up into a hole, rolls and bends into a torus
	// with that hole, and the two holes are drawn out into a neck whose waist is c. The geometry is in
	// genus2.ts (whose tests check that the glued edges really meet and that nothing passes through
	// itself); this draws it, with each edge as a thin line carrying half of its arrowhead, so that the
	// arrowheads close up as the edges meet.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import { tex } from '$lib/katex/render';
	import { ParamSheet, sheetMesh, CurveLines, type P3 } from './sheet';
	import { G2, Genus2, genus2Stages } from './genus2';
	import { seg } from './morphs';
	import type { PaletteName } from '$lib/three/materials';

	let t = $state(0);
	// a narrow plate gets a shorter picture: the shape is wide, and would leave the rest empty
	let cw = $state(800);

	const stage = $derived.by(() => {
		const s = genus2Stages(t);
		if (t < 0.05) return 'The octagon, and its diagonal c';
		if (s.ring <= 0) return 'Cut it along c';
		if (s.curl <= 0) return 'Bend each half round until its edge c closes up into a circle';
		if (s.roll <= 0) return '…and open each circle out into a hole';
		if (s.bend <= 0) return 'Roll: each b meets its partner — a tube';
		if (s.join <= 0) return 'Bend: each a meets its partner — a torus with a hole';
		if (t < 0.985) return 'Draw the two holes out into a neck, and glue along c…';
		return '…a surface with two handles, Σ₂';
	});

	let api: { render(t: number): void } | null = null;

	// the edges of each half, in order round it (a, b, a⁻¹, b⁻¹ at r = 1, then c at r = 0): which way along s
	// its arrow points, how many barbs it carries, and its colour
	const halves: { name: string; color: PaletteName; dir: 1 | -1; marks: number; s0: number; s1: number }[][] = [0, 1].map((h) => [
		{ name: `a_${h + 1}`, color: h ? 'violet' : 'gold', dir: 1, marks: 1, s0: 0, s1: 0.25 },
		{ name: `b_${h + 1}`, color: h ? 'rose' : 'teal', dir: 1, marks: 2, s0: 0.25, s1: 0.5 },
		{ name: `a_${h + 1}`, color: h ? 'violet' : 'gold', dir: -1, marks: 1, s0: 0.5, s1: 0.75 },
		{ name: `b_${h + 1}`, color: h ? 'rose' : 'teal', dir: -1, marks: 2, s0: 0.75, s1: 1 }
	]);

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, invalidate } = ctx;
		const morph = new Genus2();
		const holder = new THREE.Group();
		scene.add(holder);
		const NU = 144;
		const NV = 40;
		const sheets = [0, 1].map(() => {
			const sheet = new ParamSheet(NU, NV);
			sheet.setUV((s, g) => morph.gridUV(s, g));
			const mesh = sheetMesh(sheet.geometry, { opacity: 0.8, grid: [4, 8], gridStrength: 0 });
			mesh.setEdges([{ on: 0 }, { on: 0 }, { on: 0 }, { on: 0 }]);
			holder.add(mesh.group);
			return { sheet, mesh };
		});
		const RADIUS = 0.016;
		const lines = new Map<string, CurveLines>();
		const lineFor = (c: PaletteName) => {
			let l = lines.get(c);
			if (!l) {
				l = new CurveLines({ color: c, radius: RADIUS, segments: 200 });
				holder.add(l.group);
				lines.set(c, l);
			}
			return l;
		};
		for (const c of ['gold', 'teal', 'violet', 'rose', 'blue'] as const) lineFor(c);

		// one label for each edge; the second of each glued pair fades out as the pair meets
		const mk = (name: string, cls: string) => ctx.label([0, 0, 0], `<span>${tex(name)}</span>`, { className: cls });
		const labels = halves.map((edges) => edges.map((e) => mk(e.name, e.color)));
		const labC = mk('c', 'blue');
		const fadeLabel = (l: LabelHandle, a: number) => {
			l.show(a > 0.02);
			(l.el.firstElementChild as HTMLElement).style.opacity = String(a);
		};

		const p: P3 = { x: 0, y: 0, z: 0 };
		const q: P3 = { x: 0, y: 0, z: 0 };
		let scale = 1;
		/** a polyline along the sheet of half h, from (s0, r0) to (s1, r1) */
		const path = (h: number, s0: number, r0: number, s1: number, r1: number, n: number) => {
			const out = new Float64Array(3 * (n + 1));
			for (let i = 0; i <= n; i++) {
				morph.point(h, s0 + ((s1 - s0) * i) / n, r0 + ((r1 - r0) * i) / n, p);
				out[3 * i] = p.x;
				out[3 * i + 1] = p.y;
				out[3 * i + 2] = p.z;
			}
			return out;
		};
		/** how far the surface moves per unit of s and of r at (s, r) */
		const speed = (h: number, s: number, r: number): [number, number] => {
			const e = 1e-4;
			morph.point(h, s, r, p);
			morph.point(h, Math.min(1, s + e), r, q);
			const ds = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) / (Math.min(1, s + e) - s);
			const r2 = r < 0.5 ? r + e : r - e;
			morph.point(h, s, r2, q);
			const dr = Math.hypot(q.x - p.x, q.y - p.y, q.z - p.z) / e;
			return [ds || 1, dr || 1];
		};
		/**
		 * The barbs of an edge: each half an arrowhead, a short stroke from the edge back into the sheet (as
		 * the material's edges in the gluing workshop), so that its partner's barb completes it.
		 */
		const barbs = (h: number, s0: number, s1: number, r: number, dir: number, marks: number) => {
			const out: { pts: Float64Array; closed: boolean }[] = [];
			const mid = (s0 + s1) / 2;
			const len = 0.26 / scale;
			const [vs, vr] = speed(h, mid, r);
			const inward = r > 0.5 ? -1 : 1;
			const back = (len * 0.8) / vs;
			const into = (len * 0.6) / vr;
			for (let m = 0; m < marks; m++) {
				const apex = mid + dir * ((m - (marks - 1) / 2) * 1.5 * back + 0.45 * back);
				out.push({ pts: path(h, apex, r, apex - dir * back, r + inward * into, 6), closed: false });
			}
			return out;
		};

		function place(l: LabelHandle, h: number, s: number, r: number, push: number, w: number) {
			// beside the edge, away from the sheet: across the edge while it is flat, along the surface's normal
			// (away from the middle of the whole shape) once it has curled up
			const e = 1e-3;
			morph.point(h, s, r, p);
			const x = new THREE.Vector3(p.x, p.y, p.z);
			morph.point(h, s, r < 0.5 ? r + e : r - e, q);
			const across = x.clone().sub(new THREE.Vector3(q.x, q.y, q.z)).normalize();
			morph.point(h, Math.min(1, s + e), r, q);
			const along = new THREE.Vector3(q.x, q.y, q.z).sub(x);
			const n = along.clone().cross(across).normalize();
			const mid = new THREE.Vector3((h ? 1 : -1) * G2.Dx * w, 0, 0);
			if (n.dot(x.clone().sub(mid)) < 0) n.negate();
			const d = across.multiplyScalar(1 - w).add(n.multiplyScalar(w)).normalize();
			l.position.copy(x.addScaledVector(d, push / scale));
			l.position.applyMatrix4(holder.matrixWorld);
		}
		api = {
			render(tt) {
				morph.setTime(tt);
				const st = genus2Stages(tt);
				for (const [h, { sheet, mesh }] of sheets.entries()) {
					sheet.update((s, g, o) => morph.gridPoint(h, s, g, o), st.roll > 0);
					mesh.setOutward(sheet.outward);
					mesh.setUniform('uGridStrength', 0.22 * st.place);
				}
				// keep it framed
				let lo = [Infinity, Infinity, Infinity];
				let hi = [-Infinity, -Infinity, -Infinity];
				for (const { sheet } of sheets) {
					const a = sheet.geometry.attributes.position.array as Float32Array;
					for (let i = 0; i < a.length; i += 3)
						for (let k = 0; k < 3; k++) {
							lo[k] = Math.min(lo[k], a[i + k]);
							hi[k] = Math.max(hi[k], a[i + k]);
						}
				}
				const cx = (lo[0] + hi[0]) / 2;
				const cy = (lo[1] + hi[1]) / 2;
				const cz = (lo[2] + hi[2]) / 2;
				const aspect = camera.aspect || 1.6;
				const half = Math.max((hi[1] - lo[1]) / 2, (hi[0] - lo[0]) / 2 / Math.min(1.5, aspect * 0.92));
				scale = 1.75 / Math.max(half, 1e-3);
				holder.scale.setScalar(scale);
				holder.position.set(-cx * scale, -cy * scale, -cz * scale);
				holder.updateMatrixWorld();

				// the edges and their barbs
				const byColor = new Map<string, { pts: Float64Array; closed: boolean }[]>();
				const add = (c: string, x: { pts: Float64Array; closed: boolean }[]) => byColor.set(c, [...(byColor.get(c) ?? []), ...x]);
				for (const [h, edges] of halves.entries()) {
					for (const e of edges) {
						add(e.color, [{ pts: path(h, e.s0, 1, e.s1, 1, 48), closed: false }]);
						add(e.color, barbs(h, e.s0, e.s1, 1, e.dir, e.marks));
					}
					add('blue', [{ pts: path(h, 0, 0, 1, 0, 160), closed: false }]);
					add('blue', barbs(h, 0, 1, 0, h ? -1 : 1, 1));
				}
				for (const [c, l] of lines) l.show(byColor.get(c) ?? [], 1 / scale);

				// labels: they step aside while the halves bend round (they would crowd where the corners meet),
				// and the second edge of each pair fades as the two meet; c's waits for the neck
				const away = 1 - seg(tt, 0.15, 0.2) + seg(tt, 0.4, 0.46);
				for (const [h, edges] of halves.entries())
					edges.forEach((e, k) => {
						const glued = k % 2 === 0 ? st.bend : st.roll;
						place(labels[h][k], h, (e.s0 + e.s1) / 2, 1, 0.32, st.place);
						fadeLabel(labels[h][k], away * (k < 2 ? 1 : 1 - Math.min(1, Math.max(0, (glued - 0.6) / 0.3))));
					});
				place(labC, 0, 0.5, 0, 0.3, st.place);
				fadeLabel(labC, 1 - seg(tt, 0.15, 0.2) + seg(tt, 0.84, 0.9));
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
		const tt = t;
		api?.render(tt);
	});
</script>

<div class="g2" bind:clientWidth={cw}>
	<Scene3D
		{setup}
		height={cw < 520 ? 320 : 440}
		camera={{ position: [0, 0.6, 9], fov: 36 }}
		controls={{ autoRotate: false }}
		label="An octagon with edges a1, b1, a1 inverse, b1 inverse, a2, b2, a2 inverse, b2 inverse is cut along a diagonal c; each half curls up, rolls and bends into a torus with a hole, and the two holes are joined by a neck whose waist is c: a surface with two handles"
	/>
	<div class="stage ui" aria-live="polite">{stage}</div>
</div>
<div class="bar ui">
	<Timeline bind:value={t} duration={13} from="octagon" to="two handles" label="Gluing the octagon into a surface with two handles" />
</div>

<style>
	.g2 {
		position: relative;
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
		width: max-content;
		max-width: calc(100% - 7rem);
		text-align: center;
		text-wrap: pretty;
	}
	.bar {
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	@container figure (max-width: 520px) {
		.stage {
			position: static;
			transform: none;
			display: block;
			max-width: calc(100% - 1.6rem);
			margin: 0.2rem auto 0.7rem;
		}
	}
</style>
