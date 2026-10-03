<script lang="ts">
	// Figure 3.1.7 (static) — holes in dimensions 0, 1 and 2: points in
	// different pieces, a loop around an empty disk, a sphere around an empty
	// ball. Three panels that sit in a row on wide screens and wrap on phones.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
</script>

<div class="panels">
	<div class="dimpanel">
		<Svg viewBox="0 0 220 250" maxHeight={300} label="Dimension 0: a triangle and a separate edge; a gold point p in the triangle and a gold point q on the edge cannot be joined by a path.">
			<line x1="34" y1="150" x2="82" y2="104" class="e" />
			<line x1="82" y1="104" x2="106" y2="160" class="e" />
			<line x1="34" y1="150" x2="106" y2="160" class="e" />
			<line x1="146" y1="112" x2="186" y2="164" class="e" />
			<path d="M 113 154 Q 148 152 144 120" class="gap" />
			<path d="M 129 132 l 8 8 m 0 -8 l -8 8" class="cross" />
			<circle cx="34" cy="150" r="6" class="v" />
			<circle cx="82" cy="104" r="6" class="v" />
			<circle cx="106" cy="160" r="10" class="halo" />
			<circle cx="106" cy="160" r="6.5" class="v gold" />
			<circle cx="146" cy="112" r="10" class="halo" />
			<circle cx="146" cy="112" r="6.5" class="v gold" />
			<circle cx="186" cy="164" r="6" class="v" />
			<SvgTeX x={106} y={186} tex="p" color="var(--gold-bright)" size={19} />
			<SvgTeX x={146} y={88} tex="q" color="var(--gold-bright)" size={19} />
			<SvgTeX x={110} y={32} tex={String.raw`\text{dimension }0`} color="var(--ink-dim)" size={17} w={200} />
			<SvgTeX x={110} y={222} tex={String.raw`b_0 = 2 \text{ pieces}`} color="var(--ink)" size={19} w={210} />
		</Svg>
	</div>
	<div class="dimpanel">
		<Svg viewBox="0 0 220 250" maxHeight={300} label="Dimension 1: a gold loop around an empty disk.">
			<circle cx="110" cy="128" r="58" fill="url(#hbd-disk)" />
			<circle cx="110" cy="128" r="64" class="ring-halo" />
			<circle cx="110" cy="128" r="64" class="ring" />
			<SvgTeX x={110} y={128} tex={String.raw`\text{empty}`} color="var(--rose)" size={17} />
			<SvgTeX x={110} y={32} tex={String.raw`\text{dimension }1`} color="var(--ink-dim)" size={17} w={200} />
			<SvgTeX x={110} y={222} tex={String.raw`b_1 = 1 \text{ loop}`} color="var(--ink)" size={19} w={210} />
			<defs>
				<radialGradient id="hbd-disk" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stop-color="#f28db6" stop-opacity="0.22" />
					<stop offset="1" stop-color="#f28db6" stop-opacity="0.04" />
				</radialGradient>
			</defs>
		</Svg>
	</div>
	<div class="dimpanel">
		<Svg viewBox="0 0 220 250" maxHeight={300} label="Dimension 2: a gold sphere around an empty glowing ball.">
			<defs>
				<radialGradient id="hbd-void" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stop-color="#f28db6" stop-opacity="0.34" />
					<stop offset="0.7" stop-color="#f28db6" stop-opacity="0.12" />
					<stop offset="1" stop-color="#f28db6" stop-opacity="0" />
				</radialGradient>
				<radialGradient id="hbd-sphere" cx="0.36" cy="0.32" r="0.75">
					<stop offset="0" stop-color="#fff1c8" stop-opacity="0.35" />
					<stop offset="0.45" stop-color="#d8b26e" stop-opacity="0.16" />
					<stop offset="1" stop-color="#8f7cf7" stop-opacity="0.12" />
				</radialGradient>
			</defs>
			<circle cx="110" cy="128" r="64" fill="url(#hbd-sphere)" />
			<circle cx="110" cy="128" r="52" fill="url(#hbd-void)" />
			<ellipse cx="110" cy="120" rx="64" ry="18" class="lat" />
			<circle cx="110" cy="128" r="64" class="ring-halo" />
			<circle cx="110" cy="128" r="64" class="ring" />
			<SvgTeX x={110} y={156} tex={String.raw`\text{void}`} color="var(--rose)" size={17} />
			<SvgTeX x={110} y={32} tex={String.raw`\text{dimension }2`} color="var(--ink-dim)" size={17} w={200} />
			<SvgTeX x={110} y={222} tex={String.raw`b_2 = 1 \text{ void}`} color="var(--ink)" size={19} w={210} />
		</Svg>
	</div>
</div>

<style>
	.panels {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 0.5rem;
		padding: 0.6rem 0.8rem 0.2rem;
	}
	.dimpanel {
		flex: 1 1 150px;
		max-width: 230px;
	}
	.e {
		stroke: rgba(206, 198, 176, 0.55);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.v {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.4;
	}
	.v.gold {
		fill: var(--gold-bright);
	}
	.halo {
		fill: var(--gold-bright);
		opacity: 0.3;
		filter: blur(3px);
	}
	.gap {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2;
		stroke-dasharray: 2 5;
		stroke-linecap: round;
	}
	.cross {
		stroke: var(--rose);
		stroke-width: 2.2;
		stroke-linecap: round;
	}
	.ring {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 3.4;
	}
	.ring-halo {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 11;
		opacity: 0.22;
		filter: blur(3px);
	}
	.lat {
		fill: none;
		stroke: rgba(244, 215, 156, 0.4);
		stroke-width: 1.2;
		stroke-dasharray: 4 4;
	}
</style>
