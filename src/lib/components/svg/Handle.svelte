<script lang="ts">
	// A draggable bead for SVG figures: a coloured ring around a bright core, a
	// generous invisible hit area, a focus ring, and arrow-key support. It reports
	// positions in the user units of the SVG it sits in; the figure decides what
	// a position means (and clamps it).
	let {
		x,
		y,
		color = 'var(--gold-bright)',
		r = 9,
		label,
		valuetext,
		ondrag,
		onkey,
		onend
	}: {
		x: number;
		y: number;
		color?: string;
		/** radius of the ring, in user units */
		r?: number;
		/** what the bead controls, for screen readers */
		label: string;
		valuetext?: string;
		/** pointer drag: the new position under the pointer, in user units */
		ondrag?: (p: [number, number]) => void;
		/** arrow keys: a unit step (shift: a big step), in user units */
		onkey?: (dx: number, dy: number) => void;
		onend?: () => void;
	} = $props();

	let g: SVGGElement | undefined = $state();
	let dragging = $state(false);

	function toUser(e: PointerEvent): [number, number] | null {
		const svg = g?.ownerSVGElement;
		const m = svg?.getScreenCTM();
		if (!svg || !m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [p.x, p.y];
	}
	function down(e: PointerEvent) {
		if (e.button !== 0) return;
		e.preventDefault();
		e.stopPropagation();
		g?.setPointerCapture(e.pointerId);
		dragging = true;
		const p = toUser(e);
		if (p) ondrag?.(p);
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		const p = toUser(e);
		if (p) ondrag?.(p);
	}
	function up(e: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		g?.releasePointerCapture(e.pointerId);
		onend?.();
	}
	function key(e: KeyboardEvent) {
		const s = e.shiftKey ? 10 : 1;
		const d: Record<string, [number, number]> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
		const v = d[e.key];
		if (!v || !onkey) return;
		e.preventDefault();
		onkey(v[0], v[1]);
	}
</script>

<g
	bind:this={g}
	class="handle"
	class:dragging
	style="--c:{color}"
	transform="translate({x} {y})"
	role="button"
	aria-roledescription="draggable point"
	tabindex="0"
	aria-label={valuetext ? `${label} (${valuetext})` : label}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onkeydown={key}
>
	<circle class="hit" r={Math.max(22, r + 12)} />
	<circle class="focus" r={r + 5} />
	<circle class="ring" {r} />
	<circle class="core" r={Math.max(2.5, r * 0.38)} />
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
		transform-box: fill-box;
		transform-origin: center;
		fill: color-mix(in srgb, var(--c) 18%, transparent);
		stroke: var(--c);
		stroke-width: 2;
		transition:
			fill 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.core {
		fill: color-mix(in srgb, var(--c) 30%, #ffffff);
		pointer-events: none;
	}
	.handle:hover .ring,
	.handle.dragging .ring {
		fill: color-mix(in srgb, var(--c) 30%, transparent);
	}
	.handle.dragging .ring {
		transform: scale(1.12);
	}
	.focus {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 1.5;
		opacity: 0;
		pointer-events: none;
	}
	.handle:focus-visible .focus {
		opacity: 1;
	}
</style>
