<script lang="ts">
	// Figure (3D): the divergence theorem. A glowing blob is a source (div F > 0
	// there and ≈ 0 elsewhere); particles stream out of it. Drag the glass
	// sphere along its axis, or its rim to resize it: the flux out through its
	// surface always equals the total divergence inside — even with a wind
	// blowing through.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowPoint, pointCloud } from '$lib/three/materials';
	import { sphere, surfaceGeometry } from '$lib/three/surfaces';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { BLOB_S, ballDivergence, field, sphereFlux, type V3 } from './flux3d';
	import { fmtTeX } from './calc';
	import { mulberry } from './flow';

	const WIND = 0.32;
	const CX_MIN = -0.6;
	const CX_MAX = 2.8;
	const R_MIN = 0.4;
	const R_MAX = 1.6;
	let cx = $state(0.8);
	let R = $state(1.15);
	const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
	let wind = $state(false);
	let innerWidth = $state(1000);

	const flux = $derived(sphereFlux([cx, 0, 0], R, wind ? WIND : 0));
	const inside = $derived(ballDivergence([cx, 0, 0], R));

	let api: { set(cx: number, R: number, wind: boolean): void } | null = null;

	function setup(ctx: SceneContext) {
		const { THREE, scene, reducedMotion, invalidate, label } = ctx;
		const rand = mulberry(5);
		const gauss = () => {
			// Box–Muller
			const u = Math.max(1e-9, rand());
			const v = rand();
			return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
		};
		const sigma = BLOB_S / Math.SQRT2;

		// the source blob
		const blob = new Float32Array(1600 * 3);
		for (let i = 0; i < 1600; i++) {
			blob[3 * i] = gauss() * sigma;
			blob[3 * i + 1] = gauss() * sigma;
			blob[3 * i + 2] = gauss() * sigma;
		}
		scene.add(pointCloud(blob, { color: 'gold', size: 0.06, opacity: 0.55 }));
		scene.add(glowPoint([0, 0, 0], { color: 'gold', size: 0.05, halo: 14 }));
		label([0, -0.55, 0], 'source', { className: 'gold small tag' });

		// the glass sphere
		const sph = glassMesh(surfaceGeometry(sphere(1), 96, 48), { opacity: 0.32, grid: [24, 12], gridStrength: 0.22 });
		scene.add(sph);

		// flux arrows on the sphere (Fibonacci points)
		const NA = 300;
		const dirs: V3[] = [];
		const ga = Math.PI * (3 - Math.sqrt(5));
		for (let i = 0; i < NA; i++) {
			const y = 1 - (2 * (i + 0.5)) / NA;
			const r = Math.sqrt(1 - y * y);
			dirs.push([r * Math.cos(ga * i), y, r * Math.sin(ga * i)]);
		}
		const aPos = new Float32Array(NA * 2 * 3);
		const aCol = new Float32Array(NA * 2 * 3);
		const tipPos = new Float32Array(NA * 3);
		const tipCol = new Float32Array(NA * 3);
		const arrowGeo = new THREE.BufferGeometry();
		arrowGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
		arrowGeo.setAttribute('color', new THREE.BufferAttribute(aCol, 3));
		const arrows = new THREE.LineSegments(
			arrowGeo,
			new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false })
		);
		arrows.renderOrder = 4;
		scene.add(arrows);
		const tips = pointCloud(tipPos, { size: 0.07, colors: tipCol });
		tips.renderOrder = 4;
		scene.add(tips);
		// pointCloud copies positions: write into the geometry's own buffer
		const tipArr = tips.geometry.attributes.position.array as Float32Array;
		const gold = new THREE.Color(0xf6d394);
		const teal = new THREE.Color(0x5fd6cf);

		// streaming particles
		const NP = reducedMotion ? 0 : 520;
		const K = 7;
		const hist = new Float32Array(NP * K * 3);
		const age = new Float32Array(NP);
		const life = new Float32Array(NP);
		const pPos0 = new Float32Array(NP * 3);
		const tPos = new Float32Array(NP * (K - 1) * 2 * 3);
		const tCol = new Float32Array(NP * (K - 1) * 2 * 3);
		const tGeo = new THREE.BufferGeometry();
		tGeo.setAttribute('position', new THREE.BufferAttribute(tPos, 3));
		tGeo.setAttribute('color', new THREE.BufferAttribute(tCol, 3));
		const heads = pointCloud(pPos0, { color: 'goldPale', size: 0.055, opacity: 0.95 });
		const pPos = heads.geometry.attributes.position.array as Float32Array;
		const trails = new THREE.LineSegments(
			tGeo,
			new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
		);
		if (NP) scene.add(trails, heads);

		let windOn = false;
		function spawn(i: number) {
			let p: V3;
			if (windOn && rand() < 0.45) p = [-3.2, (rand() - 0.5) * 3.2, (rand() - 0.5) * 3.2];
			else p = [gauss() * sigma, gauss() * sigma, gauss() * sigma];
			for (let k = 0; k < K; k++) hist.set(p, 3 * (i * K + k));
			age[i] = 0;
			life[i] = 2.5 + 3 * rand();
		}
		for (let i = 0; i < NP; i++) {
			spawn(i);
			age[i] = rand() * life[i];
		}

		function setArrows(c: number, rad: number, w: number) {
			sph.position.set(c, 0, 0);
			sph.scale.setScalar(rad);
			for (let i = 0; i < NA; i++) {
				const n = dirs[i];
				const base: V3 = [c + rad * n[0], rad * n[1], rad * n[2]];
				const F = field(base, w);
				const fn = F[0] * n[0] + F[1] * n[1] + F[2] * n[2];
				const L = 0.5 * Math.tanh(fn * 7);
				const tip: V3 = [base[0] + n[0] * L, base[1] + n[1] * L, base[2] + n[2] * L];
				aPos.set(base, 6 * i);
				aPos.set(tip, 6 * i + 3);
				const col = fn >= 0 ? gold : teal;
				const fade = Math.min(1, Math.abs(fn) * 18);
				aCol.set([col.r * 0.25 * fade, col.g * 0.25 * fade, col.b * 0.25 * fade], 6 * i);
				aCol.set([col.r * fade, col.g * fade, col.b * fade], 6 * i + 3);
				tipArr.set(tip, 3 * i);
				tipCol.set([col.r * fade, col.g * fade, col.b * fade], 3 * i);
			}
			arrowGeo.attributes.position.needsUpdate = true;
			arrowGeo.attributes.color.needsUpdate = true;
			tips.geometry.attributes.position.needsUpdate = true;
			tips.geometry.attributes.color.needsUpdate = true;
		}

		api = {
			set(c, rad, w) {
				windOn = w;
				setArrows(c, rad, w ? WIND : 0);
				invalidate();
			}
		};
		api.set(cx, R, wind);

		const step = (dt: number) => {
			const w = windOn ? WIND : 0;
			let li = 0;
			for (let i = 0; i < NP; i++) {
				const b = 3 * i * K;
				for (let k = K - 1; k > 0; k--) {
					hist[b + 3 * k] = hist[b + 3 * (k - 1)];
					hist[b + 3 * k + 1] = hist[b + 3 * (k - 1) + 1];
					hist[b + 3 * k + 2] = hist[b + 3 * (k - 1) + 2];
				}
				const p: V3 = [hist[b], hist[b + 1], hist[b + 2]];
				const v1 = field(p, w);
				const sp = 3.2;
				const mid: V3 = [p[0] + v1[0] * sp * dt * 0.5, p[1] + v1[1] * sp * dt * 0.5, p[2] + v1[2] * sp * dt * 0.5];
				const v2 = field(mid, w);
				p[0] += v2[0] * sp * dt;
				p[1] += v2[1] * sp * dt;
				p[2] += v2[2] * sp * dt;
				hist[b] = p[0];
				hist[b + 1] = p[1];
				hist[b + 2] = p[2];
				age[i] += dt;
				if (age[i] > life[i] || Math.abs(p[0]) > 3.6 || Math.abs(p[1]) > 2.6 || Math.abs(p[2]) > 2.6) spawn(i);
				const t = age[i] / life[i];
				const A = Math.min(1, t * 4) * Math.min(1, (1 - t) * 3);
				pPos[3 * i] = hist[b];
				pPos[3 * i + 1] = hist[b + 1];
				pPos[3 * i + 2] = hist[b + 2];
				for (let k = 0; k < K - 1; k++) {
					const fa = A * (1 - k / (K - 1)) * 0.7;
					const fb = A * (1 - (k + 1) / (K - 1)) * 0.7;
					tPos.set([hist[b + 3 * k], hist[b + 3 * k + 1], hist[b + 3 * k + 2]], 3 * li);
					tCol.set([0.96 * fa, 0.86 * fa, 0.6 * fa], 3 * li);
					li++;
					tPos.set([hist[b + 3 * k + 3], hist[b + 3 * k + 4], hist[b + 3 * k + 5]], 3 * li);
					tCol.set([0.96 * fb, 0.86 * fb, 0.6 * fb], 3 * li);
					li++;
				}
			}
			heads.geometry.attributes.position.needsUpdate = true;
			tGeo.attributes.position.needsUpdate = true;
			tGeo.attributes.color.needsUpdate = true;
		};

		// ── drag the sphere along its axis, or its rim to resize it ──
		const { canvas, camera, controls, project } = ctx;
		// the rim: a thin ring on the sphere's silhouette, shown while it can be grabbed
		const rimMat = new THREE.MeshBasicMaterial({
			color: 0xf6d394,
			transparent: true,
			opacity: 0,
			depthTest: false,
			depthWrite: false,
			blending: THREE.AdditiveBlending
		});
		const rim = new THREE.Mesh(new THREE.RingGeometry(0.99, 1.01, 160), rimMat);
		rim.renderOrder = 6;
		scene.add(rim);
		let rimR = 0;
		let rimGlow = 0;
		const toCam = new THREE.Vector3();
		const right = new THREE.Vector3();
		/** the silhouette circle of the sphere: its centre, and its radius in world units */
		function silhouette() {
			toCam.copy(camera.position).sub(sph.position);
			const D = toCam.length();
			const rad = sph.scale.x;
			const centre = sph.position.clone().addScaledVector(toCam.normalize(), (rad * rad) / D);
			return { centre, rs: rad * Math.sqrt(Math.max(0, 1 - (rad * rad) / (D * D))) };
		}
		/** the silhouette on screen, in CSS px of the canvas */
		function onScreen() {
			const { centre, rs } = silhouette();
			right.setFromMatrixColumn(camera.matrixWorld, 0);
			const c = project(centre);
			const e = project(centre.clone().addScaledVector(right, rs));
			const ax = project(new THREE.Vector3(sph.position.x + 1, 0, 0));
			const o = project(sph.position);
			return { c, r: Math.hypot(e.x - c.x, e.y - c.y), axis: { x: ax.x - o.x, y: ax.y - o.y } };
		}
		const pointer = (e: PointerEvent) => {
			const b = canvas.getBoundingClientRect();
			return { x: e.clientX - b.left, y: e.clientY - b.top };
		};
		function hitTest(e: PointerEvent): 'rim' | 'body' | null {
			const q = pointer(e);
			const s = onScreen();
			const d = Math.hypot(q.x - s.c.x, q.y - s.c.y);
			if (Math.abs(d - s.r) < 12) return 'rim';
			return d < s.r ? 'body' : null;
		}
		const resizeCursor = (e: PointerEvent) => {
			const q = pointer(e);
			const c = onScreen().c;
			const a = ((Math.atan2(q.y - c.y, q.x - c.x) * 180) / Math.PI + 180) % 180;
			return a < 22.5 || a >= 157.5 ? 'ew-resize' : a < 67.5 ? 'nwse-resize' : a < 112.5 ? 'ns-resize' : 'nesw-resize';
		};
		let held: 'rim' | 'body' | null = null;
		let hover: 'rim' | 'body' | null = null;
		let last = { x: 0, y: 0 };
		let controlsWere = true;
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0) return;
			held = hitTest(e);
			if (!held) return;
			last = pointer(e);
			controlsWere = controls?.enabled ?? false;
			if (controls) controls.enabled = false;
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = held === 'rim' ? resizeCursor(e) : 'grabbing';
			invalidate();
		};
		const onMove = (e: PointerEvent) => {
			if (!held) {
				if (e.pointerType !== 'mouse') return;
				const h = hitTest(e);
				if (h !== hover) invalidate();
				hover = h;
				canvas.style.cursor = h === 'rim' ? resizeCursor(e) : h === 'body' ? 'grab' : '';
				return;
			}
			const q = pointer(e);
			const s = onScreen();
			if (held === 'rim') {
				// scale the radius until the rim on screen sits under the pointer
				const d = Math.hypot(q.x - s.c.x, q.y - s.c.y);
				if (s.r > 1) R = clamp(R * (d / s.r), R_MIN, R_MAX);
			} else {
				// along the sphere's axis: the pointer's motion projected on the axis as drawn
				const a = s.axis;
				const L2 = Math.max(a.x * a.x + a.y * a.y, 400);
				cx = clamp(cx + ((q.x - last.x) * a.x + (q.y - last.y) * a.y) / L2, CX_MIN, CX_MAX);
			}
			last = q;
		};
		const onUp = () => {
			if (!held) return;
			held = null;
			if (controls) controls.enabled = controlsWere;
			canvas.style.cursor = '';
			invalidate();
		};
		const onLeave = () => {
			if (held || !hover) return;
			hover = null;
			invalidate();
		};
		// capture phase: runs before OrbitControls, which then finds itself disabled
		canvas.addEventListener('pointerdown', onDown, { capture: true });
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		canvas.addEventListener('pointerleave', onLeave);

		function placeRim(dt: number) {
			const { centre, rs } = silhouette();
			rim.position.copy(centre);
			rim.quaternion.copy(camera.quaternion);
			if (Math.abs(rs - rimR) > 1e-3) {
				rimR = rs;
				rim.geometry.dispose();
				rim.geometry = new THREE.RingGeometry(rs - 0.012, rs + 0.012, 160);
			}
			const want = held === 'rim' ? 0.9 : hover === 'rim' ? 0.6 : 0;
			rimGlow += (want - rimGlow) * Math.min(1, dt * 14);
			rimMat.opacity = rimGlow;
			rim.visible = rimGlow > 0.01;
		}

		return {
			update: (_t: number, dt: number) => {
				placeRim(dt);
				if (NP) step(Math.min(dt, 1 / 30));
			},
			dispose: () => {
				api = null;
				rim.geometry.dispose();
				rimMat.dispose();
				canvas.removeEventListener('pointerdown', onDown, { capture: true });
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
				canvas.removeEventListener('pointerleave', onLeave);
			}
		};
	}

	// the keyboard way: focus the picture and use the arrow keys
	function keyFor(set: (d: number) => void) {
		return (e: KeyboardEvent) => {
			const k = ({ ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 } as Record<string, number>)[e.key];
			if (!k) return;
			e.preventDefault();
			set((e.shiftKey ? 10 : 1) * k);
		};
	}
	const keyMove = keyFor((d) => (cx = clamp(cx + 0.02 * d, CX_MIN, CX_MAX)));
	const keySize = keyFor((d) => (R = clamp(R + 0.02 * d, R_MIN, R_MAX)));

	$effect(() => {
		// read the state first: `api?.` would short-circuit and skip subscribing
		const c = cx;
		const r = R;
		const w = wind;
		api?.set(c, r, w);
	});
</script>

<svelte:window bind:innerWidth />

<div class="flux3d">
	<div class="stage">
		<Scene3D
			{setup}
			height={innerWidth < 640 ? 380 : 470}
			camera={{ position: [1.0, 1.55, 4.7], target: [0.75, 0, 0], fov: 40 }}
			controls={{ minPolarAngle: 0.3, maxPolarAngle: 2.6 }}
			animate
			label="A glowing source of fluid with particles streaming out of it, and a transparent sphere, which can be dragged along its axis and resized by its rim, whose surface is pierced by arrows showing the flux."
		/>
		<div
			class="keys"
			role="slider"
			tabindex="0"
			aria-label="Position of the sphere: arrow keys move it along its axis"
			aria-valuemin={CX_MIN}
			aria-valuemax={CX_MAX}
			aria-valuenow={cx}
			aria-valuetext={cx.toFixed(2)}
			onkeydown={keyMove}
		></div>
		<div
			class="keys"
			role="slider"
			tabindex="0"
			aria-label="Radius of the sphere: arrow keys resize it"
			aria-valuemin={R_MIN}
			aria-valuemax={R_MAX}
			aria-valuenow={R}
			aria-valuetext={R.toFixed(2)}
			onkeydown={keySize}
		></div>
	</div>
	<Controls>
		<Toggle bind:checked={wind} label="Add a wind" />
	</Controls>
	<div class="readout">
		<div class="side">
			<div class="cap ui gold">Flux out through the sphere</div>
			<TeX tex={String.raw`\textstyle\iint_{S} \mathbf F\cdot\mathbf n\,dA = ${fmtTeX(flux, 3)}`} />
		</div>
		<div class="equals" aria-hidden="true">=</div>
		<div class="side">
			<div class="cap ui violet">Total divergence inside</div>
			<TeX tex={String.raw`\textstyle\iiint_{B} \operatorname{div}\mathbf F\,dV = ${fmtTeX(inside, 3)}`} />
		</div>
	</div>
</div>

<style>
	.stage {
		position: relative;
	}
	.keys {
		position: absolute;
		inset: 0;
		pointer-events: none;
		outline: none;
	}
	.keys:focus-visible {
		outline: 2px solid var(--gold-bright);
		outline-offset: -4px;
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.4rem 1rem;
		padding: 0.9rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1.05rem;
	}
	.side {
		text-align: center;
	}
	.cap {
		font-size: 0.68rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		margin-bottom: 0.3rem;
	}
	.gold {
		color: var(--gold);
	}
	.violet {
		color: var(--violet);
	}
	.equals {
		font-size: 1.5rem;
		color: var(--gold-bright);
	}
	@media (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
		.equals {
			display: none;
		}
	}
</style>
