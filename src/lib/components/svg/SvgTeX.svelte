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
		text-shadow: 0 0 6px rgba(0, 0, 0, 0.9);
	}
	.svgtex :global(.katex) {
		font-size: 1em;
	}
</style>
