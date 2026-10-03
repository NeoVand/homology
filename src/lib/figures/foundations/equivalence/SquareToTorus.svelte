<script lang="ts">
	// Teaser for §2.2: identify opposite sides of a square and you get a torus.
	// Matching symbols mark points that become one point; all four corners
	// become a single point (transitivity at work).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';

	let width = $state(720);
	const narrow = $derived(width < 560);

	// square position/size and torus centre for both layouts
	const L = $derived(
		narrow
			? { W: 360, H: 560, X: 92, Y: 54, S: 176, tx: 180, ty: 448, ax0: 180, ay0: 300, ax1: 180, ay1: 352, rx: 128, ry: 70 }
			: { W: 640, H: 330, X: 62, Y: 58, S: 190, tx: 488, ty: 158, ax0: 300, ay0: 150, ax1: 352, ay1: 150, rx: 120, ry: 70 }
	);
</script>

<div bind:clientWidth={width}>
	<Svg viewBox="0 0 {L.W} {L.H}" maxHeight={narrow ? 620 : 360} label="A square whose opposite sides are glued, and the torus it becomes">
		<defs>
			<radialGradient id="tor-fill" cx="50%" cy="38%" r="70%">
				<stop offset="0" stop-color="#8f7cf7" stop-opacity="0.32" />
				<stop offset="0.55" stop-color="#6fd6e8" stop-opacity="0.16" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.08" />
			</radialGradient>
		</defs>

		<GluingSquare preset="torus" x={L.X} y={L.Y} size={L.S} corners />

		<!-- a pair of points on the left/right sides (glued) -->
		<circle cx={L.X} cy={L.Y + L.S * 0.35} r="6" class="p rose" />
		<circle cx={L.X + L.S} cy={L.Y + L.S * 0.35} r="6" class="p rose" />
		<SvgTeX x={L.X + 18} y={L.Y + L.S * 0.35} tex="p" color="var(--rose)" size={16} w={24} h={24} />
		<SvgTeX x={L.X + L.S - 18} y={L.Y + L.S * 0.35} tex="p" color="var(--rose)" size={16} w={24} h={24} />
		<!-- a pair on the bottom/top sides (glued) -->
		<rect x={L.X + L.S * 0.68 - 5.5} y={L.Y - 5.5} width="11" height="11" class="p violet" transform="rotate(45 {L.X + L.S * 0.68} {L.Y})" />
		<rect x={L.X + L.S * 0.68 - 5.5} y={L.Y + L.S - 5.5} width="11" height="11" class="p violet" transform="rotate(45 {L.X + L.S * 0.68} {L.Y + L.S})" />
		<SvgTeX x={L.X + L.S * 0.68} y={L.Y + 18} tex="q" color="var(--violet)" size={16} w={24} h={24} />
		<SvgTeX x={L.X + L.S * 0.68} y={L.Y + L.S - 18} tex="q" color="var(--violet)" size={16} w={24} h={24} />
		<SvgTeX x={L.X + L.S / 2} y={L.Y + L.S + 50} tex={String.raw`\text{all four corners} \;\to\; \text{one point } v`} color="var(--gold-bright)" size={14} w={260} h={26} />

		<!-- arrow to the torus -->
		<line x1={L.ax0} y1={L.ay0} x2={L.ax1} y2={L.ay1} class="go" marker-end="url(#arrow-gold)" />
		{#if narrow}
			<text x={L.ax0 + 34} y={(L.ay0 + L.ay1) / 2 + 4} class="go-lbl">glue</text>
		{:else}
			<text x={(L.ax0 + L.ax1) / 2} y={L.ay0 - 12} class="go-lbl">glue</text>
		{/if}

		<!-- the torus -->
		<g>
			<ellipse cx={L.tx} cy={L.ty} rx={L.rx} ry={L.ry} class="tor" />
			<path d="M {L.tx - 58} {L.ty - 4} Q {L.tx} {L.ty + 30} {L.tx + 58} {L.ty - 4}" class="hole" />
			<path d="M {L.tx - 46} {L.ty + 6} Q {L.tx} {L.ty - 18} {L.tx + 46} {L.ty + 6}" class="hole" />
			<!-- a: around the hole (gold) -->
			<ellipse cx={L.tx} cy={L.ty + 2} rx={L.rx - 28} ry={L.ry - 24} class="loop gold" />
			<!-- b: around the tube (teal) -->
			<path
				d="M {L.tx - (L.rx - 28)} {L.ty + 2} C {L.tx - (L.rx - 10)} {L.ty + 2}, {L.tx - (L.rx - 6)} {L.ty + 46}, {L.tx - (L.rx - 18)} {L.ty + 56} C {L.tx - (L.rx - 30)} {L.ty + 64}, {L.tx - (L.rx - 46)} {L.ty + 36}, {L.tx - (L.rx - 28)} {L.ty + 2}"
				class="loop teal"
			/>
			<circle cx={L.tx - (L.rx - 28)} cy={L.ty + 2} r="6.5" class="p corner" />
			<SvgTeX x={L.tx - (L.rx - 10)} y={L.ty - 14} tex="v" color="var(--gold-bright)" size={16} w={24} h={24} />
			<SvgTeX x={L.tx + 4} y={L.ty + 64} tex="a" color="var(--gold-bright)" size={17} w={24} h={24} />
			<SvgTeX x={L.tx - (L.rx + 14)} y={L.ty + 46} tex="b" color="var(--teal)" size={17} w={24} h={24} />
			<circle cx={L.tx + 70} cy={L.ty - 30} r="6" class="p rose" />
			<SvgTeX x={L.tx + 86} y={L.ty - 42} tex="p" color="var(--rose)" size={16} w={24} h={24} />
			<rect x={L.tx + 34 - 5.5} y={L.ty + 46 - 5.5} width="11" height="11" class="p violet" transform="rotate(45 {L.tx + 34} {L.ty + 46})" />
			<SvgTeX x={L.tx + 50} y={L.ty + 58} tex="q" color="var(--violet)" size={16} w={24} h={24} />
		</g>
	</Svg>
</div>

<style>
	div > :global(svg) {
		padding: 0.6rem 0.4rem 0.4rem;
	}
	.p {
		stroke: #060912;
		stroke-width: 1.3;
	}
	.p.rose {
		fill: var(--rose);
	}
	.p.violet {
		fill: var(--violet);
	}
	.p.corner {
		fill: url(#vertex-fill);
	}
	.go {
		stroke: var(--gold);
		stroke-width: 1.6;
		stroke-dasharray: 5 5;
	}
	.go-lbl {
		font-family: var(--font-ui);
		font-size: 11px !important;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		fill: var(--gold) !important;
		text-anchor: middle;
	}
	.tor {
		fill: url(#tor-fill);
		stroke: rgba(200, 192, 255, 0.55);
		stroke-width: 1.5;
	}
	.hole {
		fill: none;
		stroke: rgba(200, 192, 255, 0.6);
		stroke-width: 1.5;
		stroke-linecap: round;
	}
	.loop {
		fill: none;
		stroke-width: 2.4;
	}
	.loop.gold {
		stroke: var(--gold-bright);
	}
	.loop.teal {
		stroke: var(--teal);
	}
</style>
