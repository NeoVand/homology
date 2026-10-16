<script lang="ts">
	// The landing page's centrepiece: an iridescent torus you can throw around and
	// stretch like rubber. Its two fundamental cycles never sit still — the loop a
	// rolls around the tube and ripples, the loop b sweeps around the ring — and
	// every few seconds a third loop winds itself across the surface p times one
	// way and q times the other, with its homology class written underneath.
	// Everything moves by small steps each frame (never by absolute time), so
	// nothing jumps when the scene wakes up again.
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, glowCore, glowHalo, ghostCore, dotTexture, color } from '$lib/three/materials';
	import { torus, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import type * as THREE_NS from 'three';

	let { height = 560 }: { height?: number } = $props();

	// the overlay: the class of the winding loop, and a hint that goes once used
	let classHtml = $state('');
	let classOn = $state(false);
	let hintOn = $state(true);

	const R = 1.55; // ring radius
	const r = 0.6; // tube radius
	const TAU = Math.PI * 2;

	// coprime windings (p around the hole, q around the tube): each is one closed loop
	const KNOTS: [number, number][] = [
		[1, 1],
		[2, 1],
		[1, 2],
		[3, 2],
		[2, 3],
		[3, 1],
		[1, 3],
		[5, 2],
		[2, 5],
		[4, 3]
	];
	const GROW = 2.6;
	const HOLD = 4.6;
	const FADE = 1.7;
	const REST = 1.1;
	const CYCLE = GROW + HOLD + FADE + REST;

	const classOf = (p: number, q: number) => tex(`[\\gamma] = ${p === 1 ? '' : p}a + ${q === 1 ? '' : q}b`);

	function setup(ctx: SceneContext) {
		const { THREE, scene, camera, canvas, container, label, reducedMotion } = ctx;
		const V3 = THREE.Vector3;

		// ── the torus ─────────────────────────────────────────────────────────
		const root = new THREE.Group();
		scene.add(root);
		const body = glassMesh(surfaceGeometry(torus(R, r), 220, 90), {
			opacity: 0.86,
			grid: [64, 24],
			gridStrength: 0.22,
			film: 1.25,
			rim: 0.75,
			pull: true
		});
		root.add(body);
		const face = (body.userData.materials as THREE_NS.ShaderMaterial[])[0];
		const pullAt = face.uniforms.uPullAt.value as THREE_NS.Vector3;
		const pullV = face.uniforms.uPullV.value as THREE_NS.Vector3;
		const visibleMesh = body.children[1];

		// the same deformation as the shader, so curves stay on the stretched surface
		const dq = new V3();
		const gg = new V3();
		function surface(u: number, v: number, P: THREE_NS.Vector3, N: THREE_NS.Vector3) {
			const th = TAU * u;
			const ph = TAU * v;
			const c = Math.cos(ph);
			const w = R + r * c;
			P.set(w * Math.cos(th), r * Math.sin(ph), w * Math.sin(th));
			N.set(c * Math.cos(th), Math.sin(ph), c * Math.sin(th));
			const R2 = face.uniforms.uPullR.value * face.uniforms.uPullR.value;
			dq.subVectors(P, pullAt);
			const g = Math.exp(-dq.lengthSq() / R2);
			if (g > 1e-5 && pullV.lengthSq() > 1e-10) {
				gg.copy(dq).multiplyScalar((-2 * g) / R2);
				const den = Math.max(1 + gg.dot(pullV), 0.05);
				const vn = pullV.dot(N);
				P.addScaledVector(pullV, g);
				N.addScaledVector(gg, -vn / den).normalize();
			}
		}

		// ── glowing loops whose shape is recomputed every frame ────────────────
		const inflateVertex = /* glsl */ `
			uniform float uInflate;
			varying vec3 vNormal;
			varying vec3 vWorldPos;
			void main() {
				vec4 wp = modelMatrix * vec4(position + normal * uInflate, 1.0);
				vWorldPos = wp.xyz;
				vNormal = normalize(mat3(modelMatrix) * normal);
				gl_Position = projectionMatrix * viewMatrix * wp;
			}
		`;
		type Tube = {
			segs: number;
			geo: THREE_NS.BufferGeometry;
			pts: Float32Array;
			nrm: Float32Array;
			core: THREE_NS.ShaderMaterial;
			halo: THREE_NS.ShaderMaterial;
			ghost: THREE_NS.ShaderMaterial;
			group: THREE_NS.Group;
			radius: number;
		};
		function makeTube(segs: number, radius: number, col: string, haloScale = 2.7, rs = 9): Tube {
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segs * rs * 3), 3));
			geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(segs * rs * 3), 3));
			const idx: number[] = [];
			for (let j = 0; j < segs; j++) {
				const j1 = (j + 1) % segs;
				for (let i = 0; i < rs; i++) {
					const i1 = (i + 1) % rs;
					const a = j * rs + i;
					const b = j1 * rs + i;
					const c = j1 * rs + i1;
					const d = j * rs + i1;
					idx.push(a, b, d, b, c, d);
				}
			}
			geo.setIndex(idx);
			geo.userData.rs = rs;
			const core = glowCore(col, 1.05, 1);
			core.transparent = true;
			const halo = glowHalo(col, 1);
			halo.vertexShader = inflateVertex;
			halo.uniforms.uInflate = { value: radius * (haloScale - 1) };
			const ghost = ghostCore(col, 0.26);
			const group = new THREE.Group();
			for (const [m, order] of [
				[core, 5],
				[halo, 6],
				[ghost, 9]
			] as const) {
				const mesh = new THREE.Mesh(geo, m);
				mesh.renderOrder = order;
				mesh.frustumCulled = false;
				group.add(mesh);
			}
			root.add(group);
			return { segs, geo, pts: new Float32Array(segs * 3), nrm: new Float32Array(segs * 3), core, halo, ghost, group, radius };
		}
		const P = new V3();
		const N = new V3();
		const T = new V3();
		const B = new V3();
		const D = new V3();
		/** lay the tube along s ↦ (u, v), lifted just off the surface */
		function layTube(t: Tube, path: (s: number) => [number, number]) {
			const { segs, pts, nrm, radius } = t;
			const rs = t.geo.userData.rs as number;
			for (let j = 0; j < segs; j++) {
				const [u, v] = path(j / segs);
				surface(u, v, P, N);
				P.addScaledVector(N, radius + 0.006);
				pts[j * 3] = P.x;
				pts[j * 3 + 1] = P.y;
				pts[j * 3 + 2] = P.z;
				nrm[j * 3] = N.x;
				nrm[j * 3 + 1] = N.y;
				nrm[j * 3 + 2] = N.z;
			}
			const pos = t.geo.attributes.position.array as Float32Array;
			const nor = t.geo.attributes.normal.array as Float32Array;
			for (let j = 0; j < segs; j++) {
				const a = ((j - 1 + segs) % segs) * 3;
				const b = ((j + 1) % segs) * 3;
				T.set(pts[b] - pts[a], pts[b + 1] - pts[a + 1], pts[b + 2] - pts[a + 2]).normalize();
				N.set(nrm[j * 3], nrm[j * 3 + 1], nrm[j * 3 + 2]);
				B.crossVectors(T, N).normalize();
				N.crossVectors(B, T).normalize();
				for (let i = 0; i < rs; i++) {
					const ang = (TAU * i) / rs;
					D.copy(N).multiplyScalar(Math.cos(ang)).addScaledVector(B, Math.sin(ang));
					const k = (j * rs + i) * 3;
					pos[k] = pts[j * 3] + D.x * radius;
					pos[k + 1] = pts[j * 3 + 1] + D.y * radius;
					pos[k + 2] = pts[j * 3 + 2] + D.z * radius;
					nor[k] = D.x;
					nor[k + 1] = D.y;
					nor[k + 2] = D.z;
				}
			}
			t.geo.attributes.position.needsUpdate = true;
			t.geo.attributes.normal.needsUpdate = true;
		}
		/** point at fraction s of a laid tube (interpolated) */
		function along(t: Tube, s: number, out: THREE_NS.Vector3) {
			const x = (((s % 1) + 1) % 1) * t.segs;
			const j = Math.floor(x) % t.segs;
			const j1 = (j + 1) % t.segs;
			const f = x - Math.floor(x);
			out.set(
				t.pts[j * 3] + (t.pts[j1 * 3] - t.pts[j * 3]) * f,
				t.pts[j * 3 + 1] + (t.pts[j1 * 3 + 1] - t.pts[j * 3 + 1]) * f,
				t.pts[j * 3 + 2] + (t.pts[j1 * 3 + 2] - t.pts[j * 3 + 2]) * f
			);
			return out;
		}
		const setTubeAlpha = (t: Tube, a: number) => {
			t.core.uniforms.uOpacity.value = a;
			t.core.uniforms.uIntensity.value = 1.05 * a;
			t.halo.uniforms.uIntensity.value = a;
			t.ghost.uniforms.uOpacity.value = 0.26 * a;
			t.group.visible = a > 0.002;
		};

		const loopA = makeTube(360, 0.034, 'gold');
		const loopB = makeTube(180, 0.034, 'gold');
		const knot = makeTube(960, 0.027, 'rose', 2.9, 8);
		setTubeAlpha(knot, 0);

		// light pulses running along a and b, and a bright head on the winding loop
		const sprite = (hex: number, size: number) => {
			const s = new THREE.Sprite(
				new THREE.SpriteMaterial({ map: dotTexture(), color: hex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })
			);
			s.scale.setScalar(size);
			s.renderOrder = 10;
			root.add(s);
			return s;
		};
		const pulses = [
			{ tube: loopA, s: 0, speed: 0.07, sp: sprite(0xfff1cf, 0.3) },
			{ tube: loopA, s: 0.5, speed: 0.07, sp: sprite(0xfff1cf, 0.3) },
			{ tube: loopB, s: 0.25, speed: 0.15, sp: sprite(0xfff1cf, 0.3) }
		];
		const head = sprite(0xffe2ef, 0.42);
		head.visible = false;

		// the letters a and b ride along their loops, on the side facing the reader
		const labA: LabelHandle = label([0, 0, 0], tex('a'), { className: 'hero-loop', normal: [0, 0, 1] });
		const labB: LabelHandle = label([0, 0, 0], tex('b'), { className: 'hero-loop', normal: [0, 0, 1] });
		const labState = [
			{ h: labA, tube: loopA, at: new V3(), init: false },
			{ h: labB, tube: loopB, at: new V3(), init: false }
		];
		const camLocal = new V3();
		const cand = new V3();
		const candN = new V3();
		function placeLetters() {
			camLocal.copy(camera.position);
			root.worldToLocal(camLocal);
			for (const L of labState) {
				// the sample nearest the camera, pushed out along its normal
				let best = -Infinity;
				let bj = 0;
				const n = L.tube.segs;
				for (let j = 0; j < n; j += 6) {
					cand.set(L.tube.pts[j * 3], L.tube.pts[j * 3 + 1], L.tube.pts[j * 3 + 2]);
					const d = -cand.distanceToSquared(camLocal);
					if (d > best) [best, bj] = [d, j];
				}
				cand.set(L.tube.pts[bj * 3], L.tube.pts[bj * 3 + 1], L.tube.pts[bj * 3 + 2]);
				candN.set(L.tube.nrm[bj * 3], L.tube.nrm[bj * 3 + 1], L.tube.nrm[bj * 3 + 2]);
				cand.addScaledVector(candN, 0.3);
				if (!L.init) [L.at, L.init] = [L.at.copy(cand), true];
				else L.at.lerp(cand, 0.12);
				L.h.position.copy(L.at);
				root.localToWorld(L.h.position);
				L.h.normal!.copy(candN).transformDirection(root.matrixWorld);
			}
		}

		// ── a cloud of points orbiting in a ring: the shape of data ────────────
		const orbit = new THREE.Group();
		orbit.rotation.set(0.32, 0, -0.12);
		scene.add(orbit);
		const NP = 1300;
		const ang = new Float32Array(NP);
		const rad = new Float32Array(NP);
		const hgt = new Float32Array(NP);
		const spd = new Float32Array(NP);
		const ppos = new Float32Array(NP * 3);
		const pcol = new Float32Array(NP * 3);
		const palette = [color('gold'), color('violet'), color('teal')];
		for (let i = 0; i < NP; i++) {
			ang[i] = Math.random() * TAU;
			const spread = (Math.random() + Math.random() + Math.random() - 1.5) * 0.55;
			rad[i] = 3.15 + spread + Math.sin(ang[i] * 5) * 0.08;
			hgt[i] = (Math.random() - 0.5) * 0.36 * (1 - Math.abs(spread));
			spd[i] = (0.05 + 0.03 * Math.random()) * (3.15 / rad[i]) ** 1.5;
			const c = Math.random() < 0.55 ? palette[0] : palette[1 + (Math.random() < 0.5 ? 0 : 1)];
			const k = 0.45 + Math.random() * 0.75;
			pcol[i * 3] = c.r * k;
			pcol[i * 3 + 1] = c.g * k;
			pcol[i * 3 + 2] = c.b * k;
		}
		const cloudGeo = new THREE.BufferGeometry();
		cloudGeo.setAttribute('position', new THREE.BufferAttribute(ppos, 3));
		cloudGeo.setAttribute('color', new THREE.BufferAttribute(pcol, 3));
		const cloud = new THREE.Points(
			cloudGeo,
			new THREE.PointsMaterial({
				size: 0.09,
				map: dotTexture(),
				vertexColors: true,
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		cloud.frustumCulled = false;
		orbit.add(cloud);
		function placeCloud() {
			for (let i = 0; i < NP; i++) {
				ppos[i * 3] = rad[i] * Math.cos(ang[i]);
				ppos[i * 3 + 1] = hgt[i];
				ppos[i * 3 + 2] = rad[i] * Math.sin(ang[i]);
			}
			cloudGeo.attributes.position.needsUpdate = true;
		}
		placeCloud();

		// soft glow behind the torus
		const halo = new THREE.Sprite(
			new THREE.SpriteMaterial({ map: dotTexture(), color: 0x6d5bd0, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending })
		);
		halo.scale.set(9, 9, 1);
		halo.position.set(0, 0, -2.5);
		halo.renderOrder = -1;
		scene.add(halo);

		camera.position.set(0, 0.4, 8.2);
		camera.lookAt(0, 0, 0);
		const baseDist = camera.position.length();

		// ── orientation: thrown by the reader, then gently righting itself ─────
		const Y = new V3(0, 1, 0);
		const prefAxis = new V3(-0.13, 0.82, 0.56).normalize();
		const q = new THREE.Quaternion().setFromUnitVectors(Y, prefAxis);
		root.quaternion.copy(q);
		const omega = new V3(); // the reader's throw (world angular velocity), decaying
		const dqRot = new THREE.Quaternion();
		const axisW = new V3();
		const wantAxis = new V3();
		const tmp = new V3();
		const spinBy = (w: THREE_NS.Vector3, dt: number, target: THREE_NS.Quaternion) => {
			const a = w.length() * dt;
			if (a < 1e-7) return;
			dqRot.setFromAxisAngle(tmp.copy(w).normalize(), a);
			target.premultiply(dqRot);
		};

		// ── pulling the surface ───────────────────────────────────────────────
		const pullVel = new V3();
		const pullTarget = new V3();
		const plane = new THREE.Plane();
		const ray = new THREE.Raycaster();
		const ndc = new THREE.Vector2();
		const hitW = new V3();
		const toRay = (x: number, y: number) => {
			const rc = canvas.getBoundingClientRect();
			ndc.set(((x - rc.left) / rc.width) * 2 - 1, -((y - rc.top) / rc.height) * 2 + 1);
			ray.setFromCamera(ndc, camera);
		};
		const hitTorus = (x: number, y: number) => {
			toRay(x, y);
			return ray.intersectObject(visibleMesh, false)[0] ?? null;
		};

		// ── interaction ──────────────────────────────────────────────────────
		let mode: 'none' | 'spin' | 'pull' = 'none';
		let pid = -1;
		let lastX = 0;
		let lastY = 0;
		let lastMoveT = 0;
		let lastActive = performance.now();
		let releasedAt = -1e9;
		let motion = reducedMotion ? 0 : 1; // ambient motion, eased to rest after a long idle
		const awake = () => {
			lastActive = performance.now();
		};
		const onDown = (e: PointerEvent) => {
			if (e.button !== 0 || mode !== 'none') return;
			awake();
			hintOn = false;
			pid = e.pointerId;
			lastX = e.clientX;
			lastY = e.clientY;
			lastMoveT = performance.now();
			const hit = hitTorus(e.clientX, e.clientY);
			if (hit) {
				mode = 'pull';
				root.updateMatrixWorld();
				pullAt.copy(root.worldToLocal(hit.point.clone()));
				pullV.set(0, 0, 0);
				pullVel.set(0, 0, 0);
				pullTarget.set(0, 0, 0);
				face.uniforms.uPullR.value = 0.62;
				camera.getWorldDirection(tmp);
				plane.setFromNormalAndCoplanarPoint(tmp, hit.point);
				omega.set(0, 0, 0);
			} else {
				mode = 'spin';
				omega.set(0, 0, 0);
			}
			canvas.setPointerCapture(e.pointerId);
			canvas.style.cursor = 'grabbing';
		};
		const onMove = (e: PointerEvent) => {
			awake();
			if (mode === 'none') {
				if (e.pointerType === 'mouse') canvas.style.cursor = 'grab';
				return;
			}
			if (e.pointerId !== pid) return;
			const now = performance.now();
			// the torus turns to follow the hand: fully when the background is
			// dragged, partly when the surface is held (the rest of the motion stretches it)
			const dx = e.clientX - lastX;
			const dy = e.clientY - lastY;
			const len = Math.hypot(dx, dy);
			if (len > 0) {
				const angle = len * 0.0072 * (mode === 'spin' ? 1 : 0.55);
				tmp.set(dy / len, dx / len, 0).applyQuaternion(camera.quaternion);
				dqRot.setFromAxisAngle(tmp, angle);
				q.premultiply(dqRot);
				orbit.quaternion.premultiply(dqRot.setFromAxisAngle(tmp, angle * 0.25));
				const dtm = Math.max((now - lastMoveT) / 1000, 1 / 120);
				omega.lerp(tmp.multiplyScalar(Math.min(angle / dtm, 9)), 0.5);
			}
			if (mode === 'pull') {
				root.quaternion.copy(q);
				toRay(e.clientX, e.clientY);
				if (ray.ray.intersectPlane(plane, hitW)) {
					root.updateMatrixWorld();
					root.worldToLocal(hitW);
					pullTarget.subVectors(hitW, pullAt);
					if (pullTarget.length() > 2.4) pullTarget.setLength(2.4);
				}
			}
			lastX = e.clientX;
			lastY = e.clientY;
			lastMoveT = now;
		};
		const onUp = (e: PointerEvent) => {
			if (e.pointerId !== pid) return;
			// a throw only counts if the pointer was still moving when let go
			if (performance.now() - lastMoveT > 90) omega.multiplyScalar(0.15);
			if (mode === 'pull') pullTarget.set(0, 0, 0);
			mode = 'none';
			pid = -1;
			releasedAt = performance.now();
			canvas.style.cursor = 'grab';
			awake();
		};
		// on touch screens the page scrolls vertically over the background; a touch
		// that lands on the torus is a pull, so it keeps the page still
		const onTouchStart = (e: TouchEvent) => {
			const t0 = e.touches[0];
			if (t0 && hitTorus(t0.clientX, t0.clientY)) e.preventDefault();
		};
		canvas.style.cursor = 'grab';
		canvas.style.touchAction = 'pan-y';
		canvas.addEventListener('pointerdown', onDown);
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		canvas.addEventListener('touchstart', onTouchStart, { passive: false });
		container.addEventListener('pointerenter', awake);

		// ── the clock of the animation (advances only while it plays) ─────────
		let clock = 0;
		let knotI = 0;
		let knotT = reducedMotion ? GROW + 0.01 : 0;
		const setClass = (i: number) => {
			const [p, qq] = KNOTS[i % KNOTS.length];
			classHtml = classOf(p, qq);
		};
		setClass(0);

		const vA = { v0: 0.18 };
		const uB = { u0: 0.07 };
		const kp = { du: 0, dv: 0 };
		const pv = new V3();
		let drewStill = false;

		return {
			update(_t: number, rawDt: number) {
				const dt = Math.min(rawDt, 1 / 20);
				const now = performance.now();
				const idle = (now - lastActive) / 1000;
				const holding = mode !== 'none';
				// ambient motion eases away after a long idle, and back when the reader returns
				const wantMotion = reducedMotion ? 0 : idle < 40 || holding ? 1 : 0;
				motion += (wantMotion - motion) * (1 - Math.exp(-dt * (wantMotion > motion ? 2.5 : 0.6)));
				if (motion < 1e-3 && wantMotion === 0) motion = 0;
				const m = motion;

				// keep the whole torus in frame on narrow (portrait) screens
				const halfV = (camera.fov * Math.PI) / 360;
				const halfH = Math.atan(Math.tan(halfV) * camera.aspect);
				const want = Math.max(baseDist, 2.55 / Math.tan(halfH));
				if (Math.abs(camera.position.length() - want) > 1e-3) {
					camera.position.setLength(want);
					camera.lookAt(0, 0, 0);
				}

				// fully at rest (and the rest already drawn): nothing to do this frame
				const quiet =
					m === 0 && mode === 'none' && omega.lengthSq() < 1e-8 && pullV.lengthSq() < 1e-6 && pullVel.lengthSq() < 1e-5;
				if (quiet && drewStill) return false;
				drewStill = quiet;

				// rotation: the throw decays; the torus turns about its own axis and,
				// a moment after being let go, rights itself towards a slow sway
				let rotating = false;
				if (mode !== 'spin' && mode !== 'pull') {
					axisW.copy(Y).applyQuaternion(q);
					if (omega.lengthSq() > 1e-8) {
						spinBy(omega, dt, q);
						omega.multiplyScalar(Math.exp(-dt * 1.5));
						rotating = true;
					} else omega.set(0, 0, 0);
					if (m > 0) {
						spinBy(tmp.copy(axisW).multiplyScalar(0.16 * m), dt, q);
						const since = (now - releasedAt) / 1000;
						const pull = Math.min(1, Math.max(0, (since - 1.2) / 2)) * m;
						if (pull > 0) {
							const sway = 0.22 * Math.sin(clock * 0.21);
							wantAxis.copy(prefAxis).applyAxisAngle(Y, sway);
							axisW.copy(Y).applyQuaternion(q);
							tmp.crossVectors(axisW, wantAxis);
							const s = tmp.length();
							if (s > 1e-5) {
								const err = Math.atan2(s, axisW.dot(wantAxis));
								dqRot.setFromAxisAngle(tmp.divideScalar(s), err * (1 - Math.exp(-dt * 0.9 * pull)));
								q.premultiply(dqRot);
							}
						}
						rotating = true;
					}
					q.normalize();
				}
				root.quaternion.copy(q);
				root.updateMatrixWorld();

				// the pull: snappy while held, a jelly wobble when let go
				const k = mode === 'pull' ? 230 : 75;
				const zeta = mode === 'pull' ? 0.85 : 0.17;
				const c = 2 * zeta * Math.sqrt(k);
				const sub = 4;
				for (let i = 0; i < sub; i++) {
					const h = dt / sub;
					pv.subVectors(pullTarget, pullV).multiplyScalar(k).addScaledVector(pullVel, -c);
					pullVel.addScaledVector(pv, h);
					pullV.addScaledVector(pullVel, h);
				}
				const pulling = mode === 'pull' || pullV.lengthSq() > 1e-6 || pullVel.lengthSq() > 1e-5;
				if (!pulling) {
					pullV.set(0, 0, 0);
					pullVel.set(0, 0, 0);
				}
				face.uniforms.uPullR.value = Math.max(0.62, pullV.length() / 1.05);

				// the loops move along with the ambient clock
				clock += dt * m;
				vA.v0 += dt * m * 0.034;
				uB.u0 += dt * m * 0.021;
				const wig = 0.5 + 0.5 * Math.sin(clock * 0.37);
				const vaw = 0.045 * wig;
				layTube(loopA, (s) => [s, vA.v0 + vaw * Math.sin(TAU * 3 * s + clock * 1.3)]);
				const ubw = 0.04 * (1 - wig);
				layTube(loopB, (s) => [uB.u0 + ubw * Math.sin(TAU * 2 * s - clock * 1.1), s]);

				// the winding loop: grows, flows, fades; then the next class
				if (!reducedMotion) knotT += dt * m;
				if (knotT >= CYCLE) {
					knotT -= CYCLE;
					knotI = (knotI + 1) % KNOTS.length;
					setClass(knotI);
					kp.du = Math.random();
					kp.dv = Math.random();
				}
				const [kpP, kpQ] = KNOTS[knotI];
				let grown = 1;
				let alpha = 1;
				if (knotT < GROW) grown = 1 - Math.pow(1 - knotT / GROW, 2.2);
				else if (knotT > GROW + HOLD + FADE) alpha = 0;
				else if (knotT > GROW + HOLD) alpha = 1 - (knotT - GROW - HOLD) / FADE;
				kp.du += dt * m * 0.012;
				layTube(knot, (s) => [kpP * s + kp.du, kpQ * s + kp.dv]);
				const rs = knot.geo.userData.rs as number;
				knot.geo.setDrawRange(0, Math.max(0, Math.floor(grown * knot.segs)) * rs * 6);
				setTubeAlpha(knot, alpha);
				head.visible = grown < 1 && alpha > 0;
				if (head.visible) along(knot, grown, head.position);
				const show = alpha > 0.5 && knotT > GROW * 0.6;
				if (show !== classOn) classOn = show;

				for (const p of pulses) {
					p.s += dt * m * p.speed;
					along(p.tube, p.s, p.sp.position);
					p.sp.scale.setScalar(0.28 * (0.85 + 0.15 * Math.sin(clock * 6 + p.speed * 40)));
				}
				placeLetters();

				// the data cloud keeps orbiting
				if (m > 0) {
					for (let i = 0; i < NP; i++) ang[i] += spd[i] * dt * m;
					placeCloud();
				}
				for (const mm of body.userData.materials ?? []) mm.uniforms.uTime.value = clock;

				return m > 0 || rotating || pulling || holding;
			},
			dispose() {
				canvas.removeEventListener('pointerdown', onDown);
				canvas.removeEventListener('pointermove', onMove);
				canvas.removeEventListener('pointerup', onUp);
				canvas.removeEventListener('pointercancel', onUp);
				canvas.removeEventListener('touchstart', onTouchStart);
				container.removeEventListener('pointerenter', awake);
			}
		};
	}
</script>

<div class="hero3d">
	<Scene3D
		{setup}
		{height}
		controls={false}
		camera={{ position: [0, 0.4, 8.2], fov: 38 }}
		label="An iridescent torus with its two fundamental loops, a and b, glowing in gold, and a third loop winding around it; drag to spin it, or grab the surface to stretch it"
	>
		<div class="cls" class:on={classOn} aria-live="polite">{@html classHtml}</div>
		<div class="hint ui" class:on={hintOn}>Drag to spin it · grab the surface to stretch it</div>
	</Scene3D>
</div>

<style>
	.hero3d {
		position: relative;
		width: 100%;
	}
	.hero3d :global(.scene3d) {
		max-height: none;
	}
	@media (max-width: 979px) {
		.hero3d :global(.scene3d) {
			height: min(600px, 50vh) !important;
		}
	}
	.hero3d :global(.lbl3d.hero-loop) {
		font-size: 1.75rem;
		color: var(--gold-bright);
		text-shadow:
			0 0 10px rgba(4, 6, 12, 0.95),
			0 0 22px rgba(4, 6, 12, 0.8);
		pointer-events: none;
	}
	.cls,
	.hint {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		pointer-events: none !important;
		white-space: nowrap;
		opacity: 0;
		transition: opacity 0.9s var(--ease);
	}
	.cls {
		bottom: 3%;
		font-size: 1.45rem;
		color: #f6c6d8;
		text-shadow: 0 0 18px rgba(4, 6, 12, 0.95);
	}
	.hint {
		top: 2.5%;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		color: var(--ink-faint);
	}
	.cls.on,
	.hint.on {
		opacity: 1;
	}
	@media (max-width: 979px) {
		.cls {
			font-size: 1.2rem;
		}
	}
</style>
