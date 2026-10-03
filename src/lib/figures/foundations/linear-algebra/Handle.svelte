<script lang="ts">
	// A draggable point inside an SVG drawn with a `View` from geom.ts.
	// Large invisible hit area for fingers, arrow keys for keyboards.
	import { svgCoords, type V2, type View } from './geom';

	let {
		view,
		svg,
		pos,
		color = '#a493ff',
		label,
		r = 7,
		step = 0.5,
		onmove,
		ondragstart,
		ondragend
	}: {
		view: View;
		svg: SVGSVGElement | undefined;
		pos: V2;
		color?: string;
		/** accessible name, e.g. "tip of vector v" */
		label: string;
		r?: number;
		/** arrow-key nudge in world units */
		step?: number;
		onmove: (world: V2, e?: PointerEvent) => void;
		ondragstart?: () => void;
		ondragend?: () => void;
	} = $props();

	let dragging = $state(false);
	let focused = $state(false);

	function down(e: PointerEvent) {
		if (!svg) return;
		dragging = true;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
		ondragstart?.();
	}
	function move(e: PointerEvent) {
		if (!dragging || !svg) return;
		const [px, py] = svgCoords(svg, e);
		onmove(view.toWorld(px, py), e);
	}
	function up() {
		if (!dragging) return;
		dragging = false;
		ondragend?.();
	}
	function key(e: KeyboardEvent) {
		const d: Record<string, V2> = {
			ArrowLeft: [-step, 0],
			ArrowRight: [step, 0],
			ArrowUp: [0, step],
			ArrowDown: [0, -step]
		};
		const v = d[e.key];
		if (!v) return;
		e.preventDefault();
		onmove([pos[0] + v[0], pos[1] + v[1]]);
	}
</script>

<g
	class="handle"
	class:dragging
	class:focused
	role="slider"
	tabindex="0"
	aria-label={label}
	aria-roledescription="draggable point; arrow keys move it"
	aria-valuenow={pos[0]}
	aria-valuetext="({pos[0].toFixed(2)}, {pos[1].toFixed(2)})"
	style="--hc:{color}"
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onkeydown={key}
	onfocus={() => (focused = true)}
	onblur={() => (focused = false)}
>
	<circle class="hit" cx={view.X(pos[0])} cy={view.Y(pos[1])} r={Math.max(20, r + 12)} />
	<circle class="ring" cx={view.X(pos[0])} cy={view.Y(pos[1])} r={r + 5} />
	<circle class="dot" cx={view.X(pos[0])} cy={view.Y(pos[1])} {r} />
</g>

<style>
	.handle {
		cursor: grab;
		outline: none;
		touch-action: none;
	}
	.handle.dragging {
		cursor: grabbing;
	}
	.hit {
		fill: transparent;
	}
	.ring {
		fill: none;
		stroke: var(--hc);
		stroke-width: 1.5;
		opacity: 0.45;
		transition:
			opacity 0.2s,
			r 0.2s;
	}
	.dot {
		fill: var(--hc);
		stroke: #fffaf0;
		stroke-width: 1.5;
		filter: drop-shadow(0 0 6px var(--hc));
	}
	.handle:hover .ring,
	.handle.dragging .ring,
	.handle.focused .ring {
		opacity: 1;
	}
	.handle.focused .ring {
		stroke-dasharray: 3 3;
	}
</style>
