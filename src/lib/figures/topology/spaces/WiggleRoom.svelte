<script lang="ts">
	// Wiggle room: drag a point around a region of the plane; the largest ball
	// (in the chosen way of measuring distance) that fits inside the region is drawn.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	type RegionId = 'open' | 'closed' | 'half' | 'punct' | 'plane';
	type MetricId = 'euclid' | 'taxi' | 'max';

	let region = $state<RegionId>('closed');
	let metric = $state<MetricId>('euclid');
	let px = $state(372);
	let py = $state(150);
	let svg = $state<SVGSVGElement>();
	let dragging = false;
	// on narrow plates the drawing is at about half size, so the label of x grows
	let cw = $state(800);
	const lk = $derived(cw < 520 ? 1.7 : 1);

	const U = 100; // pixels per unit
	const CX = 300;
	const CY = 190;
	const RAD = 140;
	const SQ = { x0: 170, x1: 430, y0: 60, y1: 320 };

	interface Piece {
		pts: [number, number][];
		included: boolean;
	}
	interface Region {
		label: string;
		pieces: Piece[];
		contains(x: number, y: number): boolean;
		open: boolean;
		closed: boolean;
		why: string;
		holes?: [number, number][];
	}

	function circlePts(n = 360): [number, number][] {
		return Array.from({ length: n + 1 }, (_, i) => {
			const a = (i / n) * Math.PI * 2;
			return [CX + RAD * Math.cos(a), CY + RAD * Math.sin(a)];
		});
	}
	function segPts(x0: number, y0: number, x1: number, y1: number, n = 120): [number, number][] {
		return Array.from({ length: n + 1 }, (_, i) => [x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
	}
	const inDisk = (x: number, y: number) => Math.hypot(x - CX, y - CY) < RAD;
	const onCircle = (x: number, y: number) => Math.abs(Math.hypot(x - CX, y - CY) - RAD) < 0.5;

	const regions: Record<RegionId, Region> = {
		open: {
			label: 'Open disk',
			pieces: [{ pts: circlePts(), included: false }],
			contains: inDisk,
			open: true,
			closed: false,
			why: 'Every point inside has a little ball around it; the rim is not part of the set.'
		},
		closed: {
			label: 'Closed disk',
			pieces: [{ pts: circlePts(), included: true }],
			contains: (x, y) => inDisk(x, y) || onCircle(x, y),
			open: false,
			closed: true,
			why: 'The rim belongs to the set, and rim points have no wiggle room.'
		},
		half: {
			label: 'Half-open square',
			pieces: [
				{ pts: segPts(SQ.x0, SQ.y1, SQ.x1, SQ.y1), included: true },
				{ pts: segPts(SQ.x0, SQ.y0, SQ.x0, SQ.y1), included: true },
				{ pts: segPts(SQ.x0, SQ.y0, SQ.x1, SQ.y0), included: false },
				{ pts: segPts(SQ.x1, SQ.y0, SQ.x1, SQ.y1), included: false }
			],
			contains: (x, y) => x >= SQ.x0 - 0.5 && x < SQ.x1 && y > SQ.y0 && y <= SQ.y1 + 0.5,
			open: false,
			closed: false,
			why: 'Neither: it contains some edge points (so it is not open) but misses others (so it is not closed).'
		},
		punct: {
			label: 'Disk minus centre',
			pieces: [{ pts: circlePts(), included: false }],
			contains: (x, y) => inDisk(x, y) && Math.hypot(x - CX, y - CY) > 0.5,
			open: true,
			closed: false,
			holes: [[CX, CY]],
			why: 'Still open: removing a single point leaves every remaining point some room.'
		},
		plane: {
			label: 'Whole plane',
			pieces: [],
			contains: () => true,
			open: true,
			closed: true,
			why: 'Both! Every point has room, and there is no edge to leave out.'
		}
	};

	const R = $derived(regions[region]);

	function dist(ax: number, ay: number, bx: number, by: number, m: MetricId) {
		const dx = Math.abs(ax - bx);
		const dy = Math.abs(ay - by);
		return m === 'euclid' ? Math.hypot(dx, dy) : m === 'taxi' ? dx + dy : Math.max(dx, dy);
	}

	const inside = $derived(R.contains(px, py));
	// the largest radius that fits: the distance to the nearest boundary point (or hole)
	const fit = $derived.by(() => {
		let best = Infinity;
		let at: [number, number] | null = null;
		const consider = (q: [number, number]) => {
			const d = dist(px, py, q[0], q[1], metric);
			if (d < best) {
				best = d;
				at = q;
			}
		};
		for (const pc of R.pieces) for (const q of pc.pts) consider(q);
		for (const h of R.holes ?? []) consider(h);
		// keep the ball on the canvas for the whole plane
		if (region === 'plane') best = Math.min(110, best);
		return { r: best, at: at as [number, number] | null };
	});
	const onEdge = $derived(inside && fit.r < 2.5 && region !== 'plane');

	function ballPath(r: number) {
		const rr = Math.max(0, r);
		if (metric === 'euclid') return `M ${px - rr} ${py} a ${rr} ${rr} 0 1 0 ${2 * rr} 0 a ${rr} ${rr} 0 1 0 ${-2 * rr} 0`;
		if (metric === 'taxi') return `M ${px - rr} ${py} L ${px} ${py - rr} L ${px + rr} ${py} L ${px} ${py + rr} Z`;
		return `M ${px - rr} ${py - rr} H ${px + rr} V ${py + rr} H ${px - rr} Z`;
	}

	function toLocal(e: PointerEvent) {
		if (!svg) return null;
		const m = svg.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return p;
	}
	function snap(x: number, y: number): [number, number] {
		// make it easy to land exactly on an edge
		let best: [number, number] = [x, y];
		let bd = 7;
		for (const pc of R.pieces)
			for (const q of pc.pts) {
				const d = Math.hypot(x - q[0], y - q[1]);
				if (d < bd) {
					bd = d;
					best = q;
				}
			}
		return best;
	}
	function down(e: PointerEvent) {
		dragging = true;
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		move(e);
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		const p = toLocal(e);
		if (!p) return;
		const [x, y] = snap(Math.max(10, Math.min(590, p.x)), Math.max(10, Math.min(370, p.y)));
		px = x;
		py = y;
	}
	function up() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		const k = e.shiftKey ? 1 : 6;
		if (e.key === 'ArrowLeft') px -= k;
		else if (e.key === 'ArrowRight') px += k;
		else if (e.key === 'ArrowUp') py -= k;
		else if (e.key === 'ArrowDown') py += k;
		else return;
		e.preventDefault();
		[px, py] = snap(px, py);
	}

	const metricNames: Record<MetricId, string> = { euclid: 'straight-line', taxi: 'taxicab', max: 'max' };
</script>

<div class="wig" bind:clientWidth={cw}>
	<Svg bind:svg viewBox="0 0 600 380" maxHeight={420} label="A region of the plane with a draggable point and the largest ball around it that stays inside the region" onpointermove={move} onpointerup={up} onpointerleave={up}>
		<defs>
			<pattern id="wig-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
				<rect width="8" height="8" fill="rgba(116,169,255,0.07)" />
				<line x1="0" y1="0" x2="0" y2="8" stroke="rgba(116,169,255,0.18)" stroke-width="2" />
			</pattern>
		</defs>
		<!-- the set -->
		{#if region === 'plane'}
			<rect x="0" y="0" width="600" height="380" fill="url(#wig-hatch)" />
		{:else if region === 'half'}
			<rect x={SQ.x0} y={SQ.y0} width={SQ.x1 - SQ.x0} height={SQ.y1 - SQ.y0} fill="url(#wig-hatch)" />
		{:else}
			<circle cx={CX} cy={CY} r={RAD} fill="url(#wig-hatch)" />
		{/if}
		{#each R.pieces as pc, i (i)}
			<polyline
				points={pc.pts.map((q) => q.join(',')).join(' ')}
				fill="none"
				stroke={pc.included ? '#74a9ff' : 'rgba(116,169,255,0.75)'}
				stroke-width={pc.included ? 3.2 : 2}
				stroke-dasharray={pc.included ? undefined : '7 6'}
				stroke-linecap="round"
			/>
		{/each}
		{#each R.holes ?? [] as h, i (i)}
			<circle cx={h[0]} cy={h[1]} r="5" fill="#0b1020" stroke="#74a9ff" stroke-width="2" />
		{/each}

		<!-- the ball -->
		{#if inside && !onEdge}
			<path d={ballPath(fit.r * 0.985)} fill="rgba(95,214,207,0.16)" stroke="var(--teal)" stroke-width="2" filter="url(#glow)" />
			{#if fit.at && region !== 'plane'}
				<line x1={px} y1={py} x2={fit.at[0]} y2={fit.at[1]} stroke="var(--teal)" stroke-width="1.4" stroke-dasharray="3 4" />
			{/if}
		{/if}
		{#if onEdge}
			<circle cx={px} cy={py} r="16" fill="none" stroke="var(--rose)" stroke-width="2" stroke-dasharray="4 4" />
		{/if}

		<!-- the point -->
		<g
			class="handle"
			role="button"
			tabindex="0"
			aria-label="The point x ({inside ? 'in the set' : 'outside the set'}{onEdge ? ', on its edge' : ''}); drag it, or use the arrow keys"
			onpointerdown={down}
			onkeydown={key}
		>
			<circle cx={px} cy={py} r="18" fill="transparent" />
			<circle cx={px} cy={py} r="7" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.5" filter="url(#glow)" />
		</g>
		<SvgTeX x={px + 14 * lk} y={py - 14 * lk} tex="x" color="var(--gold-bright)" size={17 * lk} w={20 * lk} h={22 * lk} anchor="start" />
	</Svg>

	<div class="panel ui">
		<div class="row">
			<Segmented bind:value={region} options={(Object.keys(regions) as RegionId[]).map((k) => ({ value: k, label: regions[k].label }))} label="Region" />
		</div>
		<div class="row">
			<span class="lab">Measure distance</span>
			<Segmented bind:value={metric} options={[{ value: 'euclid', label: 'Straight line' }, { value: 'taxi', label: 'Taxicab' }, { value: 'max', label: 'Max' }]} label="Metric" />
		</div>
		<div class="read" aria-live="polite">
			{#if !inside}
				<p><strong class="dim">x is not in the set.</strong> Drag it inside.</p>
			{:else if onEdge}
				<p><strong class="rose">No ball fits:</strong> x sits on an edge that belongs to the set, so every ball around x, however small, pokes outside.</p>
			{:else}
				<p>
					<strong class="teal">Wiggle room.</strong> The largest {metricNames[metric]} ball around x that stays inside has radius
					<TeX tex={`r \\approx ${region === 'plane' && fit.r >= 110 ? '\\infty' : (fit.r / U).toFixed(2)}`} />.
				</p>
			{/if}
			<p class="verdict">
				Open? <b class={R.open ? 'yes' : 'no'}>{R.open ? 'yes' : 'no'}</b> · Closed? <b class={R.closed ? 'yes' : 'no'}>{R.closed ? 'yes' : 'no'}</b>
				<span class="why">— {R.why}</span>
			</p>
		</div>
	</div>
</div>

<style>
	.wig {
		padding: 0.5rem 0.5rem 0;
	}
	.handle {
		cursor: grab;
		outline: none;
	}
	.handle:focus-visible circle:last-child {
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.8rem 0.9rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
		font-size: 0.84rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.8rem;
	}
	.lab {
		color: var(--ink-faint);
		font-size: 0.74rem;
		letter-spacing: 0.05em;
	}
	.read p {
		margin: 0.15rem 0;
		color: var(--ink-dim);
		line-height: 1.5;
	}
	.teal {
		color: var(--teal);
	}
	.rose {
		color: var(--rose);
	}
	.dim {
		color: var(--ink-faint);
	}
	.verdict {
		color: var(--ink);
	}
	.yes {
		color: var(--green);
	}
	.no {
		color: var(--rose);
	}
	.why {
		color: var(--ink-faint);
	}
</style>
