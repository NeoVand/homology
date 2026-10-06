<script lang="ts">
	// KaTeX inside SVG via <foreignObject>, centred on (x, y).
	import { tex as render } from '$lib/katex/render';

	let {
		x,
		y,
		tex,
		size = 16,
		color = 'var(--ink)',
		w = 160,
		h = 40,
		anchor = 'middle'
	}: {
		x: number;
		y: number;
		tex: string;
		/** font size in SVG user units */
		size?: number;
		color?: string;
		/** box size reserved for the label (user units) */
		w?: number;
		h?: number;
		anchor?: 'start' | 'middle' | 'end';
	} = $props();

	const html = $derived(render(tex));
	const left = $derived(anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2);
</script>

<foreignObject x={left} y={y - h / 2} width={w} height={h} style="overflow: visible; pointer-events: none">
	<div
		class="svgtex"
		style="font-size:{size}px; color:{color}; justify-content:{anchor === 'start'
			? 'flex-start'
			: anchor === 'end'
				? 'flex-end'
				: 'center'}"
	>
		{@html html}
	</div>
</foreignObject>

<style>
	.svgtex {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		line-height: 1;
		white-space: nowrap;
		/* a halo in the plate colour, so a label stays legible where a curve passes under it */
		text-shadow:
			0 0 1px #090e1b,
			0 0 2px #090e1b,
			0 0 4px #090e1b,
			0 0 8px rgba(9, 14, 27, 0.85);
	}
	.svgtex :global(.katex) {
		font-size: 1em;
	}
</style>
