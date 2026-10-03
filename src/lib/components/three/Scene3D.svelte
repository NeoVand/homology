<script lang="ts" module>
	import type * as THREE_NS from 'three';
	import type { OrbitControls as OrbitControlsT } from 'three/addons/controls/OrbitControls.js';

	export interface LabelHandle {
		el: HTMLDivElement;
		position: THREE_NS.Vector3;
		/** optional outward normal: label fades when it faces away from the camera */
		normal?: THREE_NS.Vector3;
		set(html: string): void;
		show(on: boolean): void;
		remove(): void;
	}

	export interface SceneContext {
		THREE: typeof THREE_NS;
		scene: THREE_NS.Scene;
		camera: THREE_NS.PerspectiveCamera;
		renderer: THREE_NS.WebGLRenderer;
		controls: OrbitControlsT | null;
		canvas: HTMLCanvasElement;
		container: HTMLElement;
		reducedMotion: boolean;
		/** request one render (for scenes that only change on input) */
		invalidate(): void;
		/** run a callback every frame while visible; returns an unsubscribe */
		onFrame(cb: (t: number, dt: number) => void): () => void;
		/** an HTML label (may contain KaTeX HTML) pinned to a 3D point */
		label(
			pos: THREE_NS.Vector3 | [number, number, number],
			html: string,
			opts?: { className?: string; normal?: THREE_NS.Vector3 | [number, number, number] }
		): LabelHandle;
		/** raycast from a pointer event against objects (recursive) */
		pick(e: PointerEvent | MouseEvent, objects: THREE_NS.Object3D[]): THREE_NS.Intersection[];
		/** screen position (CSS px within the figure) of a world point */
		project(v: THREE_NS.Vector3): { x: number; y: number; behind: boolean };
	}

	export interface SceneHandle {
		update?(t: number, dt: number): void;
		dispose?(): void;
	}

	export type SetupFn = (ctx: SceneContext) => SceneHandle | void | Promise<SceneHandle | void>;
</script>

<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { register, unregister, wake, type LiveScene } from '$lib/three/manager';
	import { disposeTree, tickMaterials } from '$lib/three/materials';

	let {
		setup,
		height = 420,
		camera: camOpts = {},
		controls: ctlOpts = {},
		label = 'Interactive 3D figure',
		animate = false,
		children
	}: {
		setup: SetupFn;
		/** height in CSS px (capped to 78% of the viewport) */
		height?: number;
		camera?: { position?: [number, number, number]; target?: [number, number, number]; fov?: number };
		/** false disables orbiting entirely */
		controls?:
			| false
			| {
					autoRotate?: boolean;
					autoRotateSpeed?: number;
					zoom?: boolean;
					pan?: boolean;
					minDistance?: number;
					maxDistance?: number;
					minPolarAngle?: number;
					maxPolarAngle?: number;
			  };
		/** describe the figure for screen readers and as a no-WebGL fallback */
		label?: string;
		/** keep rendering every frame (for shimmering materials / animations) */
		animate?: boolean;
		/** overlay content (HTML) on top of the canvas */
		children?: Snippet;
	} = $props();

	let container: HTMLDivElement;
	let host: HTMLDivElement;
	let labelLayer: HTMLDivElement;
	let status = $state<'idle' | 'live' | 'error'>('idle');
	let coarse = $state(false);
	let engaged = $state(false);
	let resetView: (() => void) | null = null;
	let setEngaged: ((on: boolean) => void) | null = null;

	onMount(() => {
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		coarse = window.matchMedia('(pointer: coarse)').matches;

		let live: LiveScene | null = null;
		let destroyFn: (() => void) | null = null;
		let creating = false;
		let visible = false;

		async function create() {
			if (creating || live) return;
			creating = true;
			let renderer: THREE.WebGLRenderer;
			try {
				renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
			} catch (e) {
				console.warn('[Scene3D] WebGL unavailable', e);
				status = 'error';
				creating = false;
				return;
			}
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
			renderer.setClearColor(0x000000, 0);
			renderer.outputColorSpace = THREE.SRGBColorSpace;
			renderer.localClippingEnabled = true;
			const canvas = renderer.domElement;
			canvas.setAttribute('role', 'img');
			canvas.setAttribute('aria-label', label);
			host.appendChild(canvas);

			const scene = new THREE.Scene();
			const cam = new THREE.PerspectiveCamera(camOpts.fov ?? 40, 1, 0.05, 400);
			const p0 = new THREE.Vector3(...(camOpts.position ?? [0, 2.2, 7]));
			const t0 = new THREE.Vector3(...(camOpts.target ?? [0, 0, 0]));
			cam.position.copy(p0);
			cam.lookAt(t0);

			let controls: OrbitControls | null = null;
			if (ctlOpts !== false) {
				controls = new OrbitControls(cam, canvas);
				controls.target.copy(t0);
				controls.enableDamping = true;
				controls.dampingFactor = 0.08;
				controls.enableZoom = ctlOpts.zoom ?? false;
				controls.enablePan = ctlOpts.pan ?? false;
				controls.rotateSpeed = 0.7;
				controls.autoRotate = (ctlOpts.autoRotate ?? false) && !reducedMotion;
				controls.autoRotateSpeed = ctlOpts.autoRotateSpeed ?? 0.6;
				if (ctlOpts.minDistance) controls.minDistance = ctlOpts.minDistance;
				if (ctlOpts.maxDistance) controls.maxDistance = ctlOpts.maxDistance;
				if (ctlOpts.minPolarAngle !== undefined) controls.minPolarAngle = ctlOpts.minPolarAngle;
				if (ctlOpts.maxPolarAngle !== undefined) controls.maxPolarAngle = ctlOpts.maxPolarAngle;
				controls.update();
				if (coarse) {
					// On touch screens, let the page scroll until the reader taps to engage.
					controls.enabled = false;
					canvas.style.touchAction = 'pan-y';
				}
			}
			resetView = () => {
				cam.position.copy(p0);
				controls?.target.copy(t0);
				cam.lookAt(t0);
				controls?.update();
				needs = true;
				wake();
			};
			setEngaged = (on: boolean) => {
				if (!controls) return;
				controls.enabled = on;
				canvas.style.touchAction = on ? 'none' : 'pan-y';
			};

			let needs = true;
			const frameCbs = new Set<(t: number, dt: number) => void>();
			const labels = new Set<LabelHandle>();
			const raycaster = new THREE.Raycaster();
			const ndc = new THREE.Vector2();
			let width = 1;
			let heightPx = 1;
			const tmp = new THREE.Vector3();
			const camDir = new THREE.Vector3();

			const project = (v: THREE.Vector3) => {
				tmp.copy(v).project(cam);
				return { x: ((tmp.x + 1) / 2) * width, y: ((1 - tmp.y) / 2) * heightPx, behind: tmp.z > 1 };
			};

			const ctx: SceneContext = {
				THREE,
				scene,
				camera: cam,
				renderer,
				controls,
				canvas,
				container,
				reducedMotion,
				invalidate: () => {
					needs = true;
					wake();
				},
				onFrame(cb) {
					frameCbs.add(cb);
					wake();
					return () => frameCbs.delete(cb);
				},
				label(pos, html, opts = {}) {
					const el = document.createElement('div');
					el.className = 'lbl3d ' + (opts.className ?? '');
					el.innerHTML = html;
					labelLayer.appendChild(el);
					const position = Array.isArray(pos) ? new THREE.Vector3(...pos) : pos;
					const normal = opts.normal
						? Array.isArray(opts.normal)
							? new THREE.Vector3(...opts.normal)
							: opts.normal
						: undefined;
					let shown = true;
					const h: LabelHandle = {
						el,
						position,
						normal,
						set: (s) => (el.innerHTML = s),
						show: (on) => {
							shown = on;
							el.style.display = on ? '' : 'none';
						},
						remove: () => {
							el.remove();
							labels.delete(h);
						}
					};
					void shown;
					labels.add(h);
					needs = true;
					return h;
				},
				pick(e, objects) {
					const r = canvas.getBoundingClientRect();
					ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
					raycaster.setFromCamera(ndc, cam);
					return raycaster.intersectObjects(objects, true);
				},
				project
			};

			function placeLabels() {
				cam.getWorldDirection(camDir);
				for (const l of labels) {
					const p = project(l.position);
					let op = p.behind ? 0 : 1;
					if (l.normal) {
						tmp.copy(cam.position).sub(l.position).normalize();
						const facing = tmp.dot(l.normal);
						op *= Math.max(0, Math.min(1, (facing + 0.15) * 3));
					}
					l.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
					l.el.style.opacity = String(op);
				}
			}

			const resize = () => {
				const r = container.getBoundingClientRect();
				width = Math.max(1, r.width);
				heightPx = Math.max(1, r.height);
				// big canvases at full retina resolution are costly for the shimmer shaders
				const dprCap = width * heightPx > 600_000 ? 1.5 : 2;
				renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
				renderer.setSize(width, heightPx, false);
				canvas.style.width = '100%';
				canvas.style.height = '100%';
				cam.aspect = width / heightPx;
				cam.updateProjectionMatrix();
				needs = true;
				wake();
			};
			const ro = new ResizeObserver(resize);
			ro.observe(container);
			resize();

			let handle: SceneHandle | void = undefined;
			try {
				handle = await setup(ctx);
			} catch (e) {
				console.error('[Scene3D] setup failed', e);
			}

			let elapsed = 0;
			live = {
				visible,
				lastVisible: performance.now(),
				frame: (_t, dt) => {
					elapsed += dt;
					const moved = controls ? controls.update(dt) : false;
					const animating = animate || frameCbs.size > 0 || !!handle?.update;
					if (!(needs || moved || animating)) return;
					needs = false;
					for (const cb of frameCbs) cb(elapsed, dt);
					handle?.update?.(elapsed, dt);
					if (animate) tickMaterials(scene, elapsed);
					renderer.render(scene, cam);
					placeLabels();
				},
				evict: () => destroy()
			};

			const destroy = () => {
				ro.disconnect();
				try {
					handle?.dispose?.();
				} catch (e) {
					console.warn(e);
				}
				for (const l of [...labels]) l.remove();
				disposeTree(scene);
				controls?.dispose();
				renderer.dispose();
				renderer.forceContextLoss();
				canvas.remove();
				if (live) unregister(live);
				live = null;
				destroyFn = null;
				resetView = null;
				setEngaged = null;
				status = 'idle';
				engaged = false;
			};
			destroyFn = destroy;
			register(live);
			status = 'live';
			creating = false;
			wake();
		}

		const io = new IntersectionObserver(
			([e]) => {
				visible = e.isIntersecting;
				if (visible && !live) create();
				if (live) {
					live.visible = visible;
					live.lastVisible = performance.now();
					if (visible) wake();
				}
				if (!visible && engaged) {
					engaged = false;
					setEngaged?.(false);
				}
			},
			{ rootMargin: '160px 0px' }
		);
		io.observe(container);

		return () => {
			io.disconnect();
			destroyFn?.();
		};
	});
</script>

<div class="scene3d" bind:this={container} style="height:{height}px">
	<div class="host" bind:this={host}></div>
	<div class="labels" bind:this={labelLayer} aria-hidden="true"></div>
	{#if status === 'error'}
		<div class="fallback ui">
			<p>This interactive figure needs WebGL, which your browser could not start.</p>
			<p class="what">{label}</p>
		</div>
	{/if}
	{#if status === 'live' && ctlOpts !== false}
		<div class="tools ui">
			{#if coarse}
				<button
					class="tool"
					class:on={engaged}
					onclick={() => {
						engaged = !engaged;
						setEngaged?.(engaged);
					}}>{engaged ? 'Done' : 'Tap to rotate'}</button
				>
			{/if}
			<button class="tool" title="Reset view" aria-label="Reset view" onclick={() => resetView?.()}>
				<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"
					><path
						d="M4 10a6 6 0 1 0 2-4.5M4 4v3.5h3.5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/></svg
				>
			</button>
		</div>
	{/if}
	{#if children}
		<div class="overlay">{@render children()}</div>
	{/if}
</div>

<style>
	.scene3d {
		position: relative;
		width: 100%;
		max-height: 78vh;
		overflow: hidden;
		user-select: none;
	}
	.host,
	.labels {
		position: absolute;
		inset: 0;
	}
	.host :global(canvas) {
		display: block;
		outline: none;
		cursor: grab;
	}
	.host :global(canvas:active) {
		cursor: grabbing;
	}
	.labels {
		pointer-events: none;
		overflow: hidden;
	}
	.labels :global(.lbl3d) {
		position: absolute;
		left: 0;
		top: 0;
		white-space: nowrap;
		font-family: var(--font-body);
		font-size: 1rem;
		color: var(--ink-bright);
		text-shadow:
			0 0 10px rgba(0, 0, 0, 0.95),
			0 0 3px rgba(0, 0, 0, 0.9);
		transition: opacity 0.15s linear;
		will-change: transform;
	}
	.labels :global(.lbl3d.gold) {
		color: var(--gold-bright);
	}
	.labels :global(.lbl3d.teal) {
		color: var(--teal);
	}
	.labels :global(.lbl3d.violet) {
		color: var(--violet);
	}
	.labels :global(.lbl3d.rose) {
		color: var(--rose);
	}
	.labels :global(.lbl3d.blue) {
		color: var(--blue);
	}
	.labels :global(.lbl3d.small) {
		font-size: 0.8rem;
	}
	.labels :global(.lbl3d.tag) {
		font-family: var(--font-ui);
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.fallback {
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		text-align: center;
		padding: 2rem;
		color: var(--ink-dim);
		font-size: 0.86rem;
	}
	.fallback .what {
		color: var(--ink-faint);
		font-style: italic;
	}
	.tools {
		position: absolute;
		right: 0.7rem;
		bottom: 0.7rem;
		display: flex;
		gap: 0.4rem;
		z-index: 4;
	}
	.tool {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2rem;
		padding: 0 0.6rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: rgba(6, 10, 20, 0.7);
		backdrop-filter: blur(6px);
		color: var(--gold-bright);
		font-size: 0.72rem;
		letter-spacing: 0.05em;
		cursor: pointer;
		opacity: 0.75;
		transition: opacity 0.2s;
	}
	.tool:hover,
	.tool.on {
		opacity: 1;
		border-color: var(--gold);
	}
	.overlay {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 3;
	}
	.overlay :global(> *) {
		pointer-events: auto;
	}
</style>
