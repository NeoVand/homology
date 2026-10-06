<script lang="ts">
	// Responsive SVG canvas. The shared definitions it can use (url(#arrow-gold),
	// url(#glow), …) live once per page in SvgDefs, rendered by the root layout.
	import type { Snippet } from 'svelte';

	let {
		viewBox = '0 0 600 360',
		maxHeight = 520,
		label = 'Diagram',
		class: cls = '',
		svg = $bindable(),
		onpointermove,
		onpointerdown,
		onpointerup,
		onpointerleave,
		children
	}: {
		viewBox?: string;
		/** cap the rendered height in px */
		maxHeight?: number;
		label?: string;
		class?: string;
		svg?: SVGSVGElement;
		onpointermove?: (e: PointerEvent) => void;
		onpointerdown?: (e: PointerEvent) => void;
		onpointerup?: (e: PointerEvent) => void;
		onpointerleave?: (e: PointerEvent) => void;
		children: Snippet;
	} = $props();
</script>

<svg
	bind:this={svg}
	class="svg {cls}"
	{viewBox}
	role="img"
	aria-label={label}
	style="max-height:{maxHeight}px"
	{onpointermove}
	{onpointerdown}
	{onpointerup}
	{onpointerleave}
	preserveAspectRatio="xMidYMid meet"
>
	{@render children()}
</svg>

<style>
	.svg {
		display: block;
		width: 100%;
		height: auto;
		margin: 0 auto;
		overflow: visible;
		font-family: var(--font-body);
		touch-action: manipulation;
	}
	.svg :global(text) {
		fill: var(--ink);
		font-size: 15px;
	}
	.svg :global(.t-ui) {
		font-family: var(--font-ui);
		font-size: 11px;
		letter-spacing: 0.08em;
		fill: var(--ink-faint);
	}
</style>
