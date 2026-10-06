<script lang="ts">
	// Interior points and boundary points of the closed disk. A chart sends a
	// small neighbourhood of an interior point onto an open disk inside the
	// half-plane, and a small neighbourhood of a boundary point onto a half-disk
	// whose flat side lies on the edge of the half-plane. On narrow screens the
	// half-plane is drawn below the disk instead of beside it.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	let cw = $state(0);
	const narrow = $derived(cw > 0 && cw < 560);

	const D = { x: 160, y: 130, r: 92 };
	const p = { x: 128, y: 112 };
	const a = (20 * Math.PI) / 180;
	const q = { x: D.x + D.r * Math.cos(a), y: D.y + D.r * Math.sin(a) };
	const nr = 27;
	// the half-plane panel: its left edge, top, width and the height of its edge line
	const H = $derived(narrow ? { x: 25, y: 290, w: 270, ax: 450 } : { x: 360, y: 20, w: 270, ax: 196 });
	const P2 = $derived({ x: H.x + 92, y: H.ax - 84 });
	const Q2 = $derived({ x: H.x + 206, y: H.ax });
	const phiPath = $derived(
		narrow
			? `M ${p.x - 30} ${p.y + 22} C 40 230, 60 300, ${P2.x - 30} ${P2.y - 22}`
			: `M ${p.x + 34} ${p.y - 18} C 260 40, 360 40, ${P2.x - 36} ${P2.y - 14}`
	);
	const psiPath = $derived(
		narrow
			? `M ${q.x + 18} ${q.y + 26} C 300 250, 310 340, ${Q2.x + 34} ${Q2.y - 26}`
			: `M ${q.x + 30} ${q.y + 22} C 340 250, 470 250, ${Q2.x - 34} ${Q2.y + 10}`
	);
</script>

<div bind:clientWidth={cw}>
	<Svg
		viewBox={narrow ? '0 0 320 490' : '0 0 640 262'}
		maxHeight={narrow ? 560 : 330}
		label="A closed disk with an interior point and a boundary point, and their neighbourhoods drawn again in the upper half-plane: a full disk and a half-disk"
	>
		<defs>
			<clipPath id="bc-disk"><circle cx={D.x} cy={D.y} r={D.r} /></clipPath>
			<clipPath id="bc-half"><rect x={H.x} y={H.y} width={H.w} height={H.ax - H.y} /></clipPath>
		</defs>
		<!-- the closed disk -->
		<circle cx={D.x} cy={D.y} r={D.r} class="disk" />
		<circle cx={D.x} cy={D.y} r={D.r} class="rim" />
		<circle cx={p.x} cy={p.y} r={nr} class="nb violet" />
		<circle cx={q.x} cy={q.y} r={nr} class="nb amber" clip-path="url(#bc-disk)" />
		<circle cx={p.x} cy={p.y} r="4.5" class="pt violet" />
		<circle cx={q.x} cy={q.y} r="4.5" class="pt amber" />
		<SvgTeX x={p.x - 6} y={p.y - 40} tex="p" size={15} color="var(--violet)" w={20} h={20} />
		<SvgTeX x={q.x + 26} y={q.y + 6} tex="q" size={15} color="var(--amber)" w={20} h={20} />
		<SvgTeX x={narrow ? D.x + 36 : D.x - 64} y={D.y + D.r + (narrow ? 14 : 4)} tex={'\\partial D^2 = S^1'} size={13} color="var(--gold-bright)" w={90} h={20} />
		<text x={D.x} y="22" class="t-ui">THE CLOSED DISK D²</text>

		<!-- the half-plane -->
		<rect x={H.x} y={H.y} width={H.w} height={H.ax - H.y} class="half" />
		<line x1={H.x} y1={H.ax} x2={H.x + H.w} y2={H.ax} class="edge" />
		<circle cx={P2.x} cy={P2.y} r={nr} class="nb violet" />
		<circle cx={Q2.x} cy={Q2.y} r={nr} class="nb amber" clip-path="url(#bc-half)" />
		<circle cx={P2.x} cy={P2.y} r="4.5" class="pt violet" />
		<circle cx={Q2.x} cy={Q2.y} r="4.5" class="pt amber" />
		<SvgTeX x={P2.x} y={P2.y - 40} tex={'\\varphi(p)'} size={14} color="var(--violet)" w={50} h={20} />
		<SvgTeX x={Q2.x} y={Q2.y - 40} tex={'\\psi(q)'} size={14} color="var(--amber)" w={50} h={20} />
		<SvgTeX x={H.x + H.w - 24} y={H.ax + 20} tex={'\\partial\\mathbb H^2'} size={13} color="var(--gold-bright)" w={50} h={22} />
		<text x={H.x + H.w / 2} y={H.y - 6} class="t-ui">THE HALF-PLANE ℍ²</text>

		<!-- the charts -->
		<path d={phiPath} class="map" marker-end="url(#arrow-violet)" />
		<SvgTeX x={narrow ? 26 : 300} y={narrow ? 262 : 50} tex={'\\varphi'} size={14} color="var(--violet)" w={20} h={20} />
		<path d={psiPath} class="map" marker-end="url(#arrow-amber)" />
		<SvgTeX x={narrow ? 300 : 402} y={narrow ? 286 : 238} tex={'\\psi'} size={14} color="var(--amber)" w={20} h={20} />
	</Svg>
</div>

<style>
	.disk {
		fill: rgba(116, 169, 255, 0.1);
	}
	.rim {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.half {
		fill: rgba(116, 169, 255, 0.1);
	}
	.edge {
		stroke: var(--gold-bright);
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.nb {
		stroke-width: 1.4;
	}
	.nb.violet {
		fill: rgba(164, 147, 255, 0.22);
		stroke: var(--violet);
	}
	.nb.amber {
		fill: rgba(244, 181, 95, 0.22);
		stroke: var(--amber);
	}
	.pt.violet {
		fill: var(--violet);
	}
	.pt.amber {
		fill: var(--amber);
	}
	.map {
		fill: none;
		stroke: var(--ink-dim);
		stroke-width: 1.3;
		stroke-dasharray: 4 4;
	}
	.t-ui {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 10px;
		letter-spacing: 0.14em;
		text-anchor: middle;
	}
</style>
