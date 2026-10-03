<script lang="ts">
	// An inline number the reader can drag left/right (or use arrow keys) to change.
	let {
		value = $bindable(0),
		min = 0,
		max = 10,
		step = 1,
		format = (v: number) => String(v),
		label = 'value'
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		format?: (v: number) => string;
		label?: string;
	} = $props();

	let dragging = $state(false);
	let startX = 0;
	let startV = 0;

	function clamp(v: number) {
		const s = Math.round((v - min) / step) * step + min;
		return Math.min(max, Math.max(min, +s.toFixed(6)));
	}
	function down(e: PointerEvent) {
		dragging = true;
		startX = e.clientX;
		startV = value;
		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		const dx = e.clientX - startX;
		value = clamp(startV + (dx / 6) * step);
	}
	function up() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			value = clamp(value + step);
			e.preventDefault();
		} else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			value = clamp(value - step);
			e.preventDefault();
		}
	}
</script>

<span
	class="scrub nums"
	class:dragging
	role="slider"
	tabindex="0"
	aria-label={label}
	aria-valuemin={min}
	aria-valuemax={max}
	aria-valuenow={value}
	onpointerdown={down}
	onpointermove={move}
	onpointerup={up}
	onpointercancel={up}
	onkeydown={key}>{format(value)}</span
>

<style>
	.scrub {
		display: inline-block;
		cursor: ew-resize;
		color: var(--gold-bright);
		border-bottom: 1.5px dashed var(--gold);
		padding: 0 0.15em;
		border-radius: 3px;
		user-select: none;
		touch-action: none;
		transition: background 0.15s;
		font-family: var(--font-ui);
		font-size: 0.92em;
		font-weight: 600;
	}
	.scrub:hover,
	.scrub.dragging {
		background: rgba(216, 178, 110, 0.14);
	}
</style>
