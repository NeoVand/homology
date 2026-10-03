<script lang="ts">
	// A maze-like Jordan curve. Drag the probe: count where a ray to the right crosses
	// the curve (odd = inside), and compare with the winding number of the curve
	// around the probe (±1 inside, 0 outside).
	import Svg from '$lib/components/svg/Svg.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { mazeCurve, rayCrossings, windingNumber, type Pt } from './maps';

	const poly = mazeCurve();
	const d = 'M ' + poly.map((p) => p.join(' ')).join(' L ') + ' Z';
	let probe = $state<Pt>([300, 215]);
	let reveal = $state(false);
	let svg = $state<SVGSVGElement>();
	let dragging = false;

	const crossings = $derived(rayCrossings(poly, probe));
	const w = $derived(windingNumber(poly, probe));
	const inside = $derived(w !== 0);

	function toLocal(e: PointerEvent): Pt {
		if (!svg) return probe;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const q = pt.matrixTransform(svg.getScreenCTM()!.inverse());
		return [Math.max(8, Math.min(592, q.x)), Math.max(8, Math.min(392, q.y))];
	}
	function down(e: PointerEvent) {
		dragging = true;
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		probe = toLocal(e);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (dragging) probe = toLocal(e);
	}
	function up() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		const s = 8;
		const m: Record<string, Pt> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
		const v = m[e.key];
		if (!v) return;
		e.preventDefault();
		probe = [Math.max(8, Math.min(592, probe[0] + v[0])), Math.max(8, Math.min(392, probe[1] + v[1]))];
	}
</script>

<div class="jordan">
	<Svg
		bind:svg
		viewBox="0 0 600 400"
		maxHeight={420}
		label="A serpentine closed curve; a draggable probe with a ray to the right"
		onpointermove={move}
		onpointerup={up}
		onpointerleave={up}
	>
		<defs>
			<linearGradient id="jp-in" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.22" />
				<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.2" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.22" />
			</linearGradient>
		</defs>
		<!-- a click target covering the whole canvas -->
		<rect x="0" y="0" width="600" height="400" fill="transparent" onpointerdown={down} />
		<path {d} class="inside" class:show={reveal} />
		<path {d} class="curve" />
		<!-- the ray -->
		<line x1={probe[0]} y1={probe[1]} x2="600" y2={probe[1]} class="ray" />
		{#each crossings as c, i (i)}
			<circle cx={c[0]} cy={c[1]} r="6" class="cross" />
			<text x={c[0]} y={c[1] - 11} text-anchor="middle" class="num">{i + 1}</text>
		{/each}
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<g class="probe" role="slider" tabindex="0" aria-label="probe point; drag it or use the arrow keys" aria-valuenow={crossings.length} onpointerdown={down} onkeydown={key}>
			<circle cx={probe[0]} cy={probe[1]} r="18" fill="transparent" />
			<circle cx={probe[0]} cy={probe[1]} r="11" class="halo" class:in={inside} />
			<circle cx={probe[0]} cy={probe[1]} r="6" class="dot" class:in={inside} />
		</g>
	</Svg>
	<Controls>
		<div class="read ui">
			<span class="pill">{crossings.length} crossing{crossings.length === 1 ? '' : 's'}: {crossings.length % 2 === 1 ? 'odd' : 'even'}</span>
			<span class="pill"><TeX tex={`\\text{winding number} = ${w}`} /></span>
			<span class="verdict" class:in={inside}>{inside ? 'inside' : 'outside'}</span>
		</div>
		<Toggle bind:checked={reveal} label="Reveal the inside" />
	</Controls>
</div>

<style>
	.inside {
		fill: url(#jp-in);
		opacity: 0;
		transition: opacity 0.5s var(--ease);
	}
	.inside.show {
		opacity: 1;
	}
	.curve {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 3;
		stroke-linejoin: round;
		filter: url(#glow);
		pointer-events: none;
	}
	.ray {
		stroke: rgba(251, 246, 232, 0.6);
		stroke-width: 1.6;
		stroke-dasharray: 6 5;
		pointer-events: none;
	}
	.cross {
		fill: var(--violet);
		stroke: #fff;
		stroke-width: 1.5;
		pointer-events: none;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 11px;
		fill: var(--violet) !important;
		font-weight: 700;
		pointer-events: none;
	}
	.probe {
		cursor: grab;
	}
	.halo {
		fill: rgba(242, 141, 182, 0.2);
		stroke: rgba(242, 141, 182, 0.6);
		transition: all 0.3s;
	}
	.halo.in {
		fill: rgba(132, 217, 162, 0.22);
		stroke: rgba(132, 217, 162, 0.7);
	}
	.dot {
		fill: var(--rose);
		stroke: #fff;
		stroke-width: 1.6;
		transition: fill 0.3s;
	}
	.dot.in {
		fill: var(--green);
	}
	.read {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.8rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.pill {
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
	}
	.verdict {
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-size: 0.74rem;
		color: var(--rose);
	}
	.verdict.in {
		color: var(--green);
	}
</style>
