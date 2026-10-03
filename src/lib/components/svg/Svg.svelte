<script lang="ts">
	// Responsive SVG canvas with the book's shared defs: arrowheads in every
	// semantic colour (url(#arrow-gold) etc.) and a soft glow filter (url(#glow)).
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

	const colors: Record<string, string> = {
		gold: '#f2d08f',
		teal: '#5fd6cf',
		violet: '#a493ff',
		rose: '#f28db6',
		blue: '#74a9ff',
		green: '#84d9a2',
		amber: '#f4b55f',
		ivory: '#ebe5d5',
		dim: '#8b8676'
	};
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
	<defs>
		{#each Object.entries(colors) as [name, c] (name)}
			<marker
				id="arrow-{name}"
				viewBox="0 0 10 10"
				refX="8.6"
				refY="5"
				markerWidth="7"
				markerHeight="7"
				orient="auto-start-reverse"
				markerUnits="userSpaceOnUse"
			>
				<path d="M0.6,1 L9.4,5 L0.6,9 L2.6,5 Z" fill={c} />
			</marker>
			<marker
				id="arrowmid-{name}"
				viewBox="0 0 10 10"
				refX="5"
				refY="5"
				markerWidth="11"
				markerHeight="11"
				orient="auto"
				markerUnits="userSpaceOnUse"
			>
				<path d="M1,1.4 L8.4,5 L1,8.6 L2.8,5 Z" fill={c} />
			</marker>
		{/each}
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="3" result="b" />
			<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
		</filter>
		<filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
			<feGaussianBlur stdDeviation="6" result="b" />
			<feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
		</filter>
		<radialGradient id="vertex-fill" cx="35%" cy="35%" r="70%">
			<stop offset="0" stop-color="#fffaf0" />
			<stop offset="0.55" stop-color="#f2d08f" />
			<stop offset="1" stop-color="#a5803f" />
		</radialGradient>
	</defs>
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
