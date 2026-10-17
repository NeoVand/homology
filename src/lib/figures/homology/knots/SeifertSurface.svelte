<script lang="ts">
	// Seifert's algorithm, step by step, on a knot drawn as a closed braid.
	// (1) Orient the diagram: every strand runs the same way round the centre.
	// (2) Smooth each crossing the way the strands run: one circle per strand.
	// (3) Fill each circle with a disk, the disks stacked one above the next.
	// (4) Join the two disks at each crossing by a band with a half twist, one
	//     way or the other as the crossing is positive or negative.
	// (5) The result is an orientable surface whose boundary is the knot, with
	//     χ = s − c and genus g = (1 − s + c)/2. Everything is built in space
	//     from one family of curves (seifert.ts), so the boundary drawn at the
	//     end is exactly the closed braid drawn at the start, lifted.
	import { untrack } from 'svelte';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glassMesh, glowCore, glowHalo, ghostCore, setGlassFade, shaderColor, disposeTree } from '$lib/three/materials';
	import { diagramOf } from '$lib/knots/diagram';
	import { seifertCircles, seifertGenus } from '$lib/knots/invariants';
	import { knotById } from '$lib/knots/table';
	import { bandPoint, closedBraid, crossingAngle, knotAt, seifertCounts, slotAt, type ClosedBraid } from '$lib/knots/seifert';
	import { tex } from '$lib/katex/render';
	import { fitCamera } from '$lib/figures/homology/invariance/three-fit';
	import type { BufferGeometry } from 'three';

	type Id = '3_1' | '4_1' | '5_1' | '5_2';
	let id = $state<Id>('3_1');
	let step = $state(0);
	let width = $state(800);
	const steps = ['Oriented diagram', 'Seifert circles', 'Disks, stacked', 'Twisted bands', 'The surface'];

	const info = $derived.by(() => {
		const k = knotById.get(id)!;
		const [n, word] = k.braid!;
		const B = closedBraid(n, word, { d: 0.85 });
		// the numbers the reader sees come from the diagram itself (the tests check they match the braid's)
		const D = diagramOf(knotAt(B, 0));
		const plus = D.signs.filter((x) => x > 0).length;
		return { k, n, word, B, s: seifertCircles(D), c: D.pd.length, g: seifertGenus(D), plus, minus: D.pd.length - plus, counts: seifertCounts(n, word) };
	});

	// ── TeX and words ────────────────────────────────────────────────────────
	function wordTeX(w: number[]): string {
		let s = '';
		for (let k = 0; k < w.length; ) {
			let j = k;
			while (j < w.length && w[j] === w[k]) j++;
			const p = (j - k) * Math.sign(w[k]);
			s += `\\sigma_{${Math.abs(w[k])}}${p === 1 ? '' : `^{${p}}`}`;
			k = j;
		}
		return s;
	}
	// a formula in the running text: never broken across lines
	const T = (s: string) => `<span class="nw">${tex(s)}</span>`;
	const say = $derived.by(() => {
		const { k, n, word, s, c, g, plus, minus } = info;
		const name = `${k.common ?? ''} ${T(k.name)}`.trim();
		const signs = minus === 0 ? `all ${c} of them positive` : plus === 0 ? `all ${c} of them negative` : `${plus} positive and ${minus} negative`;
		switch (step) {
			case 0:
				return `${name[0].toUpperCase() + name.slice(1)}, drawn as the closure of the braid ${T(`${wordTeX(word)}`)} on ${n} strands. Oriented, every strand runs the same way round the centre. It crosses itself ${c} times, ${signs}.`;
			case 1:
				return `Smooth each crossing the way the strands run: <span class="x">✕</span> becomes <span class="x">)(</span>. What is left is ${T(`s = ${s}`)} disjoint oriented circles, one for each strand: the <em>Seifert circles</em>.`;
			case 2:
				return `Each circle bounds a disk. The circles are nested, so lift them to different heights and the disks are stacked without meeting. Orient each disk by its circle: <span class="teal">teal side</span> up, <span class="violet">violet side</span> down.`;
			case 3:
				return `At each of the ${T(`c = ${c}`)} crossings, join the two disks by a band with a half twist, one way for a positive crossing and the other way for a negative one. The half twist takes the teal side of one disk to the teal side of the next.`;
			default:
				return `A surface with one side teal and the other violet (orientable), whose boundary is the knot. ${T(`\\chi = s - c = ${s} - ${c} = ${s - c}`)}, and ${T(`\\chi = 1 - 2g`)} gives genus ${T(`g = ${g}`)}.${
					id === '5_2' ? ` This diagram has 6 crossings. ${T('5_2')} itself bounds a surface of genus 1, which Seifert’s algorithm finds on its 5-crossing diagram.` : ''
				}`;
		}
	});
	const stats = $derived.by(() => {
		const { s, c, g } = info;
		const out = [`c = ${c}`];
		if (step >= 1) out.unshift(`s = ${s}`);
		if (step >= 3) out.push(`\\chi = s - c = ${s - c}`);
		if (step >= 4) out.push(`g = \\tfrac{1 - \\chi}{2} = ${g}`);
		return out;
	});

	// ── the scene ────────────────────────────────────────────────────────────
	const TAU = Math.PI * 2;
	const clamp = (x: number) => Math.min(1, Math.max(0, x));
	const ease = (x: number) => {
		const t = clamp(x);
		return t * t * (3 - 2 * t);
	};
	/** everything on screen is a function of the phase φ ∈ [0, 4], which runs towards the step */
	function stage(phi: number) {
		const lambda = ease((phi - 1) / 0.7); // the circles lift and spread to one radius
		return {
			lambda,
			fill: ease((phi - 1.45) / 0.55), // the disks fill in from their rims
			grow: ease((phi - 2) / 0.9), // the bands reach down from disk to disk
			circles: ease(phi / 0.6) * (1 - 0.7 * ease((phi - 2.1) / 0.6)) * (1 - ease((phi - 3.05) / 0.6)),
			knot: 1 - 0.55 * ease(phi / 0.6) + 0.55 * ease((phi - 3.05) / 0.7),
			polar: 0.62 + 0.56 * ease((phi - 1) / 0.85) // from looking down on the diagram to looking at the stack
		};
	}

	let api: { build(): void; wake(): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, THREE, camera, controls } = ctx;
		type V = InstanceType<typeof THREE.Vector3>;
		const root = new THREE.Group();
		scene.add(root);
		const unfit = fitCamera(ctx, 1.25, 0.6);
		const reduced = ctx.reducedMotion;

		// engine (x, y, z) with z up → scene (x, z, −y), as kit.flat
		const put = (arr: Float32Array, o: number, x: number, y: number, z: number) => {
			arr[o] = x;
			arr[o + 1] = z;
			arr[o + 2] = -y;
		};

		// ── glowing tubes we can bend in place (the knot and the circles move every frame of a step) ──
		interface Tube {
			group: InstanceType<typeof THREE.Group>;
			set(pts: Float32Array): void;
			fade(x: number): void;
		}
		function tube(count: number, radius: number, color: string, o: { haloScale?: number; order?: number } = {}): Tube {
			const RAD = 10;
			const make = () => {
				const g = new THREE.BufferGeometry();
				const nv = (count + 1) * (RAD + 1);
				g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
				g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
				const idx: number[] = [];
				for (let i = 0; i < count; i++)
					for (let j = 0; j < RAD; j++) {
						const a = i * (RAD + 1) + j;
						const b = (i + 1) * (RAD + 1) + j;
						// wound so that the faces look outwards
						idx.push(a, a + 1, b, b, a + 1, b + 1);
					}
				g.setIndex(idx);
				return g;
			};
			const core = make();
			const halo = make();
			const mCore = glowCore(color, 1, 1);
			mCore.transparent = true;
			const mHalo = glowHalo(color, 1);
			const mGhost = ghostCore(color, 0.28);
			const group = new THREE.Group();
			const a = new THREE.Mesh(core, mCore);
			const b = new THREE.Mesh(halo, mHalo);
			const c = new THREE.Mesh(core, mGhost);
			a.renderOrder = o.order ?? 5;
			b.renderOrder = 6;
			c.renderOrder = 9;
			for (const m of [a, b, c]) m.frustumCulled = false;
			group.add(a, b, c);
			// scratch frames, reused
			const Tn = new Float32Array(count * 3);
			const Nn = new Float32Array(count * 3);
			function fill(g: BufferGeometry, pts: Float32Array, r: number) {
				const P = g.attributes.position.array as Float32Array;
				const Nr = g.attributes.normal.array as Float32Array;
				for (let i = 0; i <= count; i++) {
					const k = i % count;
					const t = 3 * k;
					const nx = Nn[t];
					const ny = Nn[t + 1];
					const nz = Nn[t + 2];
					// B = T × N
					const bx = Tn[t + 1] * nz - Tn[t + 2] * ny;
					const by = Tn[t + 2] * nx - Tn[t] * nz;
					const bz = Tn[t] * ny - Tn[t + 1] * nx;
					for (let j = 0; j <= RAD; j++) {
						const v = (TAU * j) / RAD;
						const cs = Math.cos(v);
						const sn = Math.sin(v);
						const ex = cs * nx + sn * bx;
						const ey = cs * ny + sn * by;
						const ez = cs * nz + sn * bz;
						const q = 3 * (i * (RAD + 1) + j);
						P[q] = pts[t] + r * ex;
						P[q + 1] = pts[t + 1] + r * ey;
						P[q + 2] = pts[t + 2] + r * ez;
						Nr[q] = ex;
						Nr[q + 1] = ey;
						Nr[q + 2] = ez;
					}
				}
				g.attributes.position.needsUpdate = true;
				g.attributes.normal.needsUpdate = true;
			}
			return {
				group,
				set(pts) {
					// tangents, and a normal carried along the curve without twisting (the
					// mismatch on coming home is spread evenly, so the closed tube has no seam)
					for (let i = 0; i < count; i++) {
						const p = 3 * ((i + count - 1) % count);
						const q = 3 * ((i + 1) % count);
						let x = pts[q] - pts[p];
						let y = pts[q + 1] - pts[p + 1];
						let z = pts[q + 2] - pts[p + 2];
						const l = Math.hypot(x, y, z) || 1;
						Tn[3 * i] = x / l;
						Tn[3 * i + 1] = y / l;
						Tn[3 * i + 2] = z / l;
					}
					// a first normal: perpendicular to the first tangent
					let [nx, ny, nz] = Math.abs(Tn[1]) < 0.9 ? [-Tn[2], 0, Tn[0]] : [0, Tn[2], -Tn[1]];
					for (let i = 0; i <= count; i++) {
						const t = 3 * (i % count);
						const d = nx * Tn[t] + ny * Tn[t + 1] + nz * Tn[t + 2];
						nx -= d * Tn[t];
						ny -= d * Tn[t + 1];
						nz -= d * Tn[t + 2];
						const l = Math.hypot(nx, ny, nz) || 1;
						nx /= l;
						ny /= l;
						nz /= l;
						if (i < count) {
							Nn[t] = nx;
							Nn[t + 1] = ny;
							Nn[t + 2] = nz;
						}
					}
					// the angle from the first normal to the carried-round one, about the first tangent
					const cx = ny * Nn[2] - nz * Nn[1];
					const cy = nz * Nn[0] - nx * Nn[2];
					const cz = nx * Nn[1] - ny * Nn[0];
					const ang = Math.atan2(cx * Tn[0] + cy * Tn[1] + cz * Tn[2], nx * Nn[0] + ny * Nn[1] + nz * Nn[2]);
					for (let i = 1; i < count; i++) {
						const t = 3 * i;
						const a = (ang * i) / count;
						const cs = Math.cos(a);
						const sn = Math.sin(a);
						const [x, y, z] = [Nn[t], Nn[t + 1], Nn[t + 2]];
						// rotate N about T by a (T ⟂ N): N cos a + (T × N) sin a
						Nn[t] = x * cs + (Tn[t + 1] * z - Tn[t + 2] * y) * sn;
						Nn[t + 1] = y * cs + (Tn[t + 2] * x - Tn[t] * z) * sn;
						Nn[t + 2] = z * cs + (Tn[t] * y - Tn[t + 1] * x) * sn;
					}
					fill(core, pts, radius);
					fill(halo, pts, radius * (o.haloScale ?? 2.4));
				},
				fade(x) {
					mCore.uniforms.uOpacity.value = x;
					mHalo.uniforms.uIntensity.value = x;
					mGhost.uniforms.uOpacity.value = 0.28 * x;
					group.visible = x > 0.01;
				}
			};
		}

		// ── everything for the current knot ──
		let B: ClosedBraid;
		let knotPts: Float32Array;
		let knotTube: Tube;
		let circleTubes: Tube[] = [];
		let circlePts: Float32Array;
		const CIRC = 160;
		let arrows: InstanceType<typeof THREE.Mesh>[] = [];
		let arrowSlots: { k: number; th: number }[] = [];
		let arrowMat: ReturnType<typeof glowCore>;
		const gold = shaderColor('gold');
		const teal = shaderColor('teal');
		const up = new THREE.Vector3(0, 1, 0);
		let diskGeo: BufferGeometry;
		let disks: InstanceType<typeof THREE.Group>;
		let bandGeo: BufferGeometry;
		let bands: InstanceType<typeof THREE.Group>;
		let labels: LabelHandle[] = [];
		const IA = 96;
		const JR = 6;
		const S = 32;
		const U = 10;
		let phi = step;
		let scale = 1;
		let flatScale = 1;
		let stackScale = 1;

		// nPieces patches of (a + 1) × (b + 1) points, triangles wound by (∂/∂i, ∂/∂j): that winding is the
		// orientation of the Seifert surface, which the material shows as its teal (front) side
		function grid(nPieces: number, a: number, b: number, uv: (i: number, j: number) => [number, number]) {
			const g = new THREE.BufferGeometry();
			const nv = nPieces * (a + 1) * (b + 1);
			g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
			g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nv * 3), 3));
			const uvs = new Float32Array(nv * 2);
			const idx: number[] = [];
			for (let p = 0; p < nPieces; p++)
				for (let i = 0; i <= a; i++)
					for (let j = 0; j <= b; j++) {
						const o = p * (a + 1) * (b + 1) + i * (b + 1) + j;
						const [u, v] = uv(i, j);
						uvs[2 * o] = u;
						uvs[2 * o + 1] = v;
						if (i < a && j < b) {
							const A = o;
							const Bi = o + (b + 1); // (i + 1, j)
							idx.push(A, Bi, A + 1, Bi, Bi + 1, A + 1);
						}
					}
			g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
			g.setIndex(idx);
			// our winding is the orientation of the Seifert surface: glassMesh must not turn it round
			g.userData.oriented = true;
			return g;
		}
		const glass = (g: BufferGeometry, gridLines: [number, number]) => {
			const m = glassMesh(g, {
				opacity: 0.6,
				grid: gridLines,
				gridStrength: 0.22,
				film: 0.9,
				tint: 'teal',
				tintMix: 0.42,
				inner: { tint: 'violet', tintMix: 0.62, brightness: 0.95 }
			});
			m.traverse((o) => (o.frustumCulled = false));
			return m;
		};

		function build() {
			for (const l of labels) l.remove();
			labels = [];
			disposeTree(root);
			root.clear();
			B = info.B;
			const { n, word } = B;
			// every knot the same size on screen, whatever its number of strands: the flat diagram
			// and the stack of disks each framed for itself (scaling as it lifts changes nothing)
			flatScale = 1.75 / (B.R0 + B.gap * (n - 1));
			stackScale = 1.6 / B.R;
			// the knot: its point count never changes with λ
			const first = knotAt(B, 0)[0];
			knotPts = new Float32Array(first.length * 3);
			knotTube = tube(first.length, 0.052, 'gold');
			root.add(knotTube.group);
			// the Seifert circles, a touch thicker so that they sheathe the knot where they run along it
			// (drawn after it, so that where they do the circles are teal, not teal over gold)
			circlePts = new Float32Array(CIRC * 3);
			circleTubes = Array.from({ length: n }, () => {
				const t = tube(CIRC, 0.064, 'teal', { haloScale: 2.1, order: 5.5 });
				root.add(t.group);
				return t;
			});
			// arrowheads between the crossings (every other gap when there are many)
			const c = word.length;
			arrowSlots = [];
			for (let m = 0; m < c; m += c > 3 ? 2 : 1) for (let k = 0; k < n; k++) arrowSlots.push({ k, th: (TAU * m) / c });
			// (made afresh with each knot: disposeTree takes the old ones with the rest)
			arrowMat = glowCore('gold', 1.15);
			const coneGeo = new THREE.ConeGeometry(0.09, 0.24, 18);
			arrows = arrowSlots.map(() => {
				const a = new THREE.Mesh(coneGeo, arrowMat);
				a.renderOrder = 7;
				root.add(a);
				return a;
			});
			// disks: (radial, around), so that the front is up
			diskGeo = grid(n, JR, IA, (i, j) => [j / IA, i / JR]);
			disks = glass(diskGeo, [24, 3]);
			root.add(disks);
			// bands: (along, across), wound by (s, u), as the tests check against the disks
			bandGeo = grid(c, S, U, (i, j) => [j / U, i / S]);
			bands = glass(bandGeo, [4, 8]);
			root.add(bands);
			// the sign of each crossing, shown on the diagram and on the bands
			labels = word.map((g) => ctx.label([0, 0, 0], g > 0 ? '+' : '−', { className: `sgn ${g > 0 ? 'pos' : 'neg'}` }));
			pose();
		}

		const tmp = new THREE.Vector3();
		const v3 = new Float32Array(3);
		function pose() {
			const st = stage(phi);
			const { n, word } = B;
			scale = flatScale + (stackScale - flatScale) * st.lambda;
			root.scale.setScalar(scale);
			// the knot
			const K = knotAt(B, st.lambda)[0];
			K.forEach((p, i) => put(knotPts, 3 * i, p[0], p[1], p[2]));
			knotTube.set(knotPts);
			knotTube.fade(st.knot);
			// the circles
			for (let k = 0; k < n; k++) {
				const [r, z] = slotAt(B, k, st.lambda);
				for (let j = 0; j < CIRC; j++) put(circlePts, 3 * j, r * Math.cos((TAU * j) / CIRC), r * Math.sin((TAU * j) / CIRC), z);
				circleTubes[k].set(circlePts);
				circleTubes[k].fade(st.circles);
			}
			// arrows: gold on the knot, teal while the circles are the story
			arrowMat.uniforms.uColor.value.copy(gold).lerp(teal, ease((st.circles - 0.4) * 3));
			arrowSlots.forEach(({ k, th }, i) => {
				const [r, z] = slotAt(B, k, st.lambda);
				put(v3, 0, r * Math.cos(th), r * Math.sin(th), z);
				arrows[i].position.set(v3[0], v3[1], v3[2]);
				// every strand runs counterclockwise round the axis (seen from above)
				put(v3, 0, -Math.sin(th), Math.cos(th), 0);
				arrows[i].quaternion.setFromUnitVectors(up, tmp.set(v3[0], v3[1], v3[2]));
			});
			// the disks fill in from their rims
			const dp = diskGeo.attributes.position.array as Float32Array;
			const dn = diskGeo.attributes.normal.array as Float32Array;
			for (let k = 0; k < n; k++) {
				const [r, z] = slotAt(B, k, st.lambda);
				for (let i = 0; i <= JR; i++) {
					const v = 1 - st.fill + (st.fill * i) / JR;
					for (let j = 0; j <= IA; j++) {
						const o = 3 * (k * (JR + 1) * (IA + 1) + i * (IA + 1) + j);
						put(dp, o, r * v * Math.cos((TAU * j) / IA), r * v * Math.sin((TAU * j) / IA), z);
						put(dn, o, 0, 0, 1);
					}
				}
			}
			diskGeo.attributes.position.needsUpdate = true;
			diskGeo.attributes.normal.needsUpdate = true;
			setGlassFade(disks, ease(st.fill * 3));
			// the bands reach from the upper disk towards the lower one
			if (st.grow > 0.001) {
				const bp = bandGeo.attributes.position.array as Float32Array;
				word.forEach((_, m) => {
					for (let i = 0; i <= S; i++)
						for (let j = 0; j <= U; j++) {
							const p = bandPoint(B, m, (st.grow * i) / S, -1 + (2 * j) / U, 1);
							put(bp, 3 * (m * (S + 1) * (U + 1) + i * (U + 1) + j), p[0], p[1], p[2]);
						}
				});
				bandGeo.attributes.position.needsUpdate = true;
				bandGeo.computeVertexNormals();
			}
			setGlassFade(bands, ease(st.grow * 4));
			// the signs, beside each crossing
			const showSigns = Math.abs(phi) < 0.35 || Math.abs(phi - 3) < 0.35;
			labels.forEach((l, m) => {
				// flat: in the empty gap between the two rings just after the crossing; stacked: just outside the band
				const i = Math.abs(word[m]) - 1;
				const [r0, z0] = slotAt(B, i, st.lambda);
				const [r1, z1] = slotAt(B, i + 1, st.lambda);
				const th = crossingAngle(B, m) + 1.45 * B.delta * (1 - st.lambda);
				const r = (r0 + r1) / 2 + 0.5 * st.lambda;
				put(v3, 0, r * Math.cos(th), r * Math.sin(th), (z0 + z1) / 2);
				l.position.set(v3[0] * scale, v3[1] * scale, v3[2] * scale);
				l.show(showSigns);
			});
		}

		// the reader may be turning the view: leave the camera alone then
		let dragging = false;
		const onStart = () => (dragging = true);
		const onEnd = () => (dragging = false);
		controls?.addEventListener('start', onStart);
		controls?.addEventListener('end', onEnd);
		const target = controls ? controls.target : new THREE.Vector3();
		const sph = new THREE.Spherical();
		const off3: V = new THREE.Vector3();
		function aim() {
			if (dragging) return;
			off3.copy(camera.position).sub(target);
			sph.setFromVector3(off3);
			sph.phi = stage(phi).polar;
			off3.setFromSpherical(sph);
			camera.position.copy(target).add(off3);
			camera.lookAt(target);
		}
		aim();

		const offFrame = ctx.onFrame((_t, dt) => {
			const goal = step;
			if (phi === goal) return false;
			const gap = goal - phi;
			if (reduced) phi = goal;
			else {
				// about a second a step; a long jump goes faster, but never takes more than ~2.5 s
				const rate = Math.max(1 / 1.15, Math.abs(gap) / 2.4);
				phi += Math.sign(gap) * Math.min(Math.abs(gap), rate * dt);
			}
			pose();
			aim();
			return true;
		});

		api = {
			build() {
				build();
				ctx.invalidate();
			},
			wake: () => ctx.invalidate()
		};
		build();
		return {
			dispose() {
				offFrame();
				unfit();
				api = null;
				for (const l of labels) l.remove();
				controls?.removeEventListener('start', onStart);
				controls?.removeEventListener('end', onEnd);
			}
		};
	}

	$effect(() => {
		void info;
		untrack(() => api?.build());
	});
	$effect(() => {
		void step;
		untrack(() => api?.wake());
	});
</script>

<div class="ss" bind:clientWidth={width}>
	<Scene3D
		{setup}
		height={width < 560 ? 380 : 430}
		animate
		camera={{ position: [0, 2.9, 4.5], fov: 40 }}
		controls={{ autoRotate: true, autoRotateSpeed: 0.4 }}
		label="Seifert’s algorithm on a closed braid: the knot drawn flat with its strands oriented, smoothed into nested circles, the circles lifted into a stack of glassy disks, and the disks joined by half-twisted bands into one surface, teal on one side and violet on the other, whose edge is the gold knot."
	/>
	<div class="read ui" aria-live="polite">
		<p class="say">{@html say}</p>
		<p class="stats">
			{#each stats as s (s)}<span class="chip"><TeX tex={s} /></span>{/each}
		</p>
	</div>
	<div class="ctl ui">
		<StepControls bind:step count={steps.length} labels={steps} interval={2800} />
		<Segmented
			bind:value={id}
			label="Which knot"
			options={[
				{ value: '3_1', label: 'Trefoil 3₁' },
				{ value: '4_1', label: 'Figure-eight 4₁' },
				{ value: '5_1', label: 'Cinquefoil 5₁' },
				{ value: '5_2', label: 'Three-twist 5₂' }
			]}
		/>
	</div>
</div>

<style>
	.ss {
		display: grid;
	}
	.ss :global(.lbl3d.sgn) {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.8rem;
		line-height: 1;
		padding: 0.12rem 0.38rem 0.16rem;
		border-radius: 999px;
		background: rgba(7, 11, 21, 0.78);
		text-shadow: none;
	}
	.ss :global(.lbl3d.sgn.pos) {
		color: var(--teal);
		border: 1px solid rgba(95, 214, 207, 0.55);
	}
	.ss :global(.lbl3d.sgn.neg) {
		color: var(--rose);
		border: 1px solid rgba(242, 141, 182, 0.55);
	}
	.read {
		padding: 0.7rem 1.2rem 0.6rem;
		border-top: 1px solid var(--line-faint);
	}
	.say {
		margin: 0;
		min-height: 4.2em;
		font-size: 0.88rem;
		line-height: 1.5;
		color: var(--ink);
		text-wrap: pretty;
	}
	.say :global(.nw) {
		white-space: nowrap;
	}
	.say :global(.x) {
		font-family: var(--font-body);
		color: var(--gold-bright);
		letter-spacing: 0.08em;
	}
	.say :global(.teal) {
		color: var(--teal);
	}
	.say :global(.violet) {
		color: var(--violet);
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		margin: 0.55rem 0 0;
		min-height: 1.9rem;
	}
	.chip {
		padding: 0.12rem 0.6rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		background: rgba(216, 178, 110, 0.06);
		color: var(--gold-pale);
		font-size: 0.9rem;
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.7rem 1rem;
		padding: 0.8rem 1.1rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
