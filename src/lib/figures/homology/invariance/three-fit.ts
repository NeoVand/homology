// Keep 3D figures framed on narrow (phone) screens: pull the camera back along
// its line of sight when the canvas is taller-and-narrower than the design.
import type { SceneContext } from '$lib/components/three/Scene3D.svelte';

/**
 * Call inside a Scene3D setup. `designAspect` is the width/height ratio the
 * camera position was chosen for; narrower canvases get a proportionally more
 * distant camera (damped so the subject does not become tiny).
 * Returns a function that stops listening for resizes.
 */
export function fitCamera(ctx: SceneContext, designAspect = 1.5, damping = 0.62): () => void {
	const { camera, controls, container, invalidate, THREE } = ctx;
	const target = controls ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
	const offset = camera.position.clone().sub(target);
	let lastK = 1;
	const apply = () => {
		const r = container.getBoundingClientRect();
		if (!r.width || !r.height) return;
		const aspect = r.width / r.height;
		const k = aspect < designAspect ? Math.pow(designAspect / aspect, damping) : 1;
		if (Math.abs(k - lastK) < 0.01) return;
		// keep whatever direction the reader has rotated to; only change the distance
		const dir = camera.position.clone().sub(controls ? controls.target : target);
		const len = dir.length() || 1;
		camera.position.copy(controls ? controls.target : target).addScaledVector(dir, (offset.length() * k) / len);
		lastK = k;
		controls?.update();
		invalidate();
	};
	lastK = -1;
	apply();
	const ro = new ResizeObserver(apply);
	ro.observe(container);
	return () => ro.disconnect();
}

/** A reactive-friendly check for phone-width screens (call in onMount / effects). */
export function isNarrow(px = 560): boolean {
	return typeof window !== 'undefined' && window.matchMedia(`(max-width: ${px}px)`).matches;
}
