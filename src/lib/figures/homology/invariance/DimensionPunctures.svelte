<script lang="ts">
	// Remove a point from ℝ, ℝ² and ℝ³: what is left is homotopy equivalent to a
	// sphere of one dimension less (two points, a circle, a 2-sphere).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
</script>

<div class="three">
	<div class="panel">
		<Svg viewBox="0 0 220 220" maxHeight={240} label="A line with a point removed falls into two pieces; two points surround the gap">
			<line x1="14" y1="100" x2="98" y2="100" class="half a" />
			<line x1="122" y1="100" x2="206" y2="100" class="half b" />
			<circle cx="110" cy="100" r="7" class="gap" />
			<circle cx="82" cy="100" r="6.5" class="link" filter="url(#glow)" />
			<circle cx="138" cy="100" r="6.5" class="link" filter="url(#glow)" />
			<path d="M 84 82 Q 110 62 136 82" class="squeeze" marker-end="url(#arrow-dim)" />
			<path d="M 136 118 Q 110 138 84 118" class="squeeze" marker-end="url(#arrow-dim)" />
			<SvgTeX x={110} y={168} tex={'\\R\\setminus\\{0\\}\\simeq S^0'} size={17} color="var(--ink-bright)" w={200} h={30} />
			<SvgTeX x={110} y={198} tex={'\\tilde H_0 \\cong \\Z'} size={15} color="var(--gold-bright)" w={200} h={26} />
		</Svg>
	</div>
	<div class="panel">
		<Svg viewBox="0 0 220 220" maxHeight={240} label="A plane with a point removed: a loop around the puncture cannot be shrunk">
			<defs>
				<radialGradient id="dp-plane" cx="50%" cy="45%" r="60%">
					<stop offset="0" stop-color="#74a9ff" stop-opacity="0.16" />
					<stop offset="1" stop-color="#74a9ff" stop-opacity="0.02" />
				</radialGradient>
			</defs>
			<path d="M 30 140 L 70 50 L 196 50 L 156 140 Z" fill="url(#dp-plane)" stroke="rgba(116,169,255,0.35)" />
			{#each [0.2, 0.4, 0.6, 0.8] as s (s)}
				<line x1={30 + 126 * s} y1="140" x2={70 + 126 * s} y2="50" class="gridl" />
				<line x1={30 + 40 * s} y1={140 - 90 * s} x2={156 + 40 * s} y2={140 - 90 * s} class="gridl" />
			{/each}
			<ellipse cx="113" cy="95" rx="36" ry="17" class="loop" filter="url(#glow)" />
			<path d="M 140 87 L 148 95 L 138 101" class="loopArrow" />
			<circle cx="113" cy="95" r="5.5" class="gap" />
			<SvgTeX x={110} y={168} tex={'\\R^2\\setminus\\{0\\}\\simeq S^1'} size={17} color="var(--ink-bright)" w={200} h={30} />
			<SvgTeX x={110} y={198} tex={'\\tilde H_1 \\cong \\Z'} size={15} color="var(--gold-bright)" w={200} h={26} />
		</Svg>
	</div>
	<div class="panel">
		<Svg viewBox="0 0 220 220" maxHeight={240} label="Space with a point removed: a small sphere around the puncture cannot be shrunk">
			<defs>
				<radialGradient id="dp-ball" cx="38%" cy="35%" r="70%">
					<stop offset="0" stop-color="#fff1d0" stop-opacity="0.55" />
					<stop offset="0.45" stop-color="#f2d08f" stop-opacity="0.22" />
					<stop offset="1" stop-color="#a493ff" stop-opacity="0.12" />
				</radialGradient>
			</defs>
			<!-- a faint cube of space -->
			<path d="M 40 60 L 150 60 L 150 150 L 40 150 Z M 40 60 L 72 34 L 182 34 L 150 60 M 182 34 L 182 124 L 150 150" class="cube" />
			<path d="M 40 150 L 72 124 L 182 124 M 72 124 L 72 34" class="cube back" />
			<circle cx="110" cy="92" r="34" fill="url(#dp-ball)" class="sphere" filter="url(#glow)" />
			<ellipse cx="110" cy="92" rx="34" ry="10" class="equator" />
			<circle cx="110" cy="92" r="5.5" class="gap" />
			<SvgTeX x={110} y={168} tex={'\\R^3\\setminus\\{0\\}\\simeq S^2'} size={17} color="var(--ink-bright)" w={200} h={30} />
			<SvgTeX x={110} y={198} tex={'\\tilde H_2 \\cong \\Z'} size={15} color="var(--gold-bright)" w={200} h={26} />
		</Svg>
	</div>
</div>

<style>
	.three {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.2rem 0.6rem;
		padding: 0.8rem 0.6rem 0.4rem;
	}
	.panel {
		flex: 1 1 170px;
		max-width: 230px;
	}
	.half {
		stroke-width: 4;
		stroke-linecap: round;
	}
	.half.a {
		stroke: var(--blue);
	}
	.half.b {
		stroke: var(--violet);
	}
	.gap {
		fill: #070b15;
		stroke: var(--rose);
		stroke-width: 2.2;
	}
	.link {
		fill: var(--gold-bright);
	}
	.squeeze {
		fill: none;
		stroke: var(--ink-faint);
		stroke-width: 1.4;
		stroke-dasharray: 4 4;
	}
	.gridl {
		stroke: rgba(116, 169, 255, 0.16);
		stroke-width: 1;
	}
	.loop {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.loopArrow {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.cube {
		fill: none;
		stroke: rgba(116, 169, 255, 0.4);
		stroke-width: 1.2;
	}
	.cube.back {
		stroke-dasharray: 3 4;
		stroke: rgba(116, 169, 255, 0.25);
	}
	.sphere {
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.equator {
		fill: none;
		stroke: rgba(244, 215, 156, 0.6);
		stroke-width: 1.2;
		stroke-dasharray: 3 3;
	}
</style>
