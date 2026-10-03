// Keep a 3D scene inside narrow (portrait) figures: zoom the camera out when
// the container is narrower than the aspect ratio the scene was composed for.
import type * as THREE from 'three';

export function fitToWidth(
	ctx: { camera: THREE.PerspectiveCamera; container: HTMLElement; invalidate(): void },
	minAspect = 1.1
): () => void {
	const { camera, container, invalidate } = ctx;
	const fit = () => {
		const w = container.clientWidth;
		const h = container.clientHeight;
		if (!w || !h) return;
		const z = Math.min(1, w / h / minAspect);
		if (Math.abs(camera.zoom - z) > 1e-3) {
			camera.zoom = z;
			camera.updateProjectionMatrix();
			invalidate();
		}
	};
	const ro = new ResizeObserver(fit);
	ro.observe(container);
	fit();
	return () => ro.disconnect();
}
