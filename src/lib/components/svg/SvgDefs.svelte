<script lang="ts">
	// The book's shared SVG definitions, rendered once per page by the root
	// layout: arrowheads in every semantic colour (url(#arrow-gold),
	// url(#arrowmid-teal), …), two glow filters (url(#glow), url(#glow-strong))
	// and the gold vertex gradient (url(#vertex-fill)). Any SVG on the page can
	// refer to them. The holder is zero-sized rather than display:none, because
	// definitions inside an undisplayed SVG do not render.
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

<svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false">
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
</svg>

<style>
	.svg-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}
</style>
