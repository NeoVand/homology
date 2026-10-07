<script lang="ts">
	// Excision: cutting out a piece Z that sits deep inside A does not change H(X, A).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const blobX = 'M 40 120 C 30 50 110 20 180 34 C 250 48 290 90 282 150 C 274 214 210 250 140 244 C 72 238 48 190 40 120 Z';
	const blobA = 'M 150 76 C 200 64 250 96 252 142 C 254 192 208 222 168 214 C 124 206 104 172 110 132 C 114 102 126 82 150 76 Z';
	const blobZ = 'M 176 122 C 196 116 214 130 212 150 C 210 170 190 178 174 170 C 158 162 156 130 176 122 Z';
</script>

<div class="exc">
	<div class="panel">
		<Svg viewBox="0 0 320 290" maxHeight={300} label="A space X containing a region A, with a smaller region Z deep inside A">
			<path d={blobX} class="x" />
			<path d={blobA} class="a" />
			<path d={blobZ} class="z" />
			<SvgTeX x={78} y={80} tex={'X'} size={20} color="var(--blue)" w={30} h={28} />
			<SvgTeX x={232} y={104} tex={'A'} size={20} color="var(--teal)" w={30} h={28} />
			<SvgTeX x={186} y={148} tex={'Z'} size={18} color="var(--rose)" w={30} h={28} />
			<SvgTeX x={160} y={272} tex={'H_n(X,\\,A)'} size={18} color="var(--ink-bright)" w={160} h={30} />
		</Svg>
	</div>
	<div class="iso"><span>≅</span></div>
	<div class="panel">
		<Svg viewBox="0 0 320 290" maxHeight={300} label="The same picture with Z cut out of both X and A">
			<defs>
				<mask id="exc-cut">
					<rect x="0" y="0" width="320" height="290" fill="white" />
					<path d={blobZ} fill="black" />
				</mask>
			</defs>
			<g mask="url(#exc-cut)">
				<path d={blobX} class="x" />
				<path d={blobA} class="a" />
			</g>
			<path d={blobZ} class="hole" />
			<SvgTeX x={78} y={80} tex={'X\\setminus Z'} size={18} color="var(--blue)" w={70} h={28} />
			<SvgTeX x={236} y={104} tex={'A\\setminus Z'} size={17} color="var(--teal)" w={70} h={28} />
			<SvgTeX x={160} y={272} tex={'H_n(X\\setminus Z,\\,A\\setminus Z)'} size={18} color="var(--ink-bright)" w={240} h={30} />
		</Svg>
	</div>
</div>

<style>
	.exc {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0 0.4rem;
		padding: 0.8rem 0.6rem 0.4rem;
	}
	.panel {
		flex: 1 1 220px;
		max-width: 320px;
	}
	.iso {
		font-size: 2rem;
		color: var(--gold-bright);
		font-family: var(--font-body);
		padding: 0 0.4rem;
	}
	/* a phone: the two pictures one above the other, the ≅ between them */
	@container figure (max-width: 30rem) {
		.exc {
			flex-direction: column;
			flex-wrap: nowrap;
		}
		.panel {
			flex: none;
			width: 100%;
			max-width: 300px;
		}
		.iso {
			line-height: 1;
			padding: 0.1rem 0 0.3rem;
		}
	}
	.x {
		fill: rgba(116, 169, 255, 0.12);
		stroke: rgba(116, 169, 255, 0.6);
		stroke-width: 2;
	}
	.a {
		fill: rgba(95, 214, 207, 0.2);
		stroke: var(--teal);
		stroke-width: 2;
	}
	.z {
		fill: rgba(242, 141, 182, 0.35);
		stroke: var(--rose);
		stroke-width: 1.8;
	}
	.hole {
		fill: none;
		stroke: var(--rose);
		stroke-width: 1.6;
		stroke-dasharray: 4 4;
	}
</style>
