<script lang="ts" module>
	export type Kind = 'tri' | 'edge' | 'vertex';
</script>

<script lang="ts">
	// Draws a FlatLayout (a cut-open picture of a complex) inside <Svg>.
	// Every drawn copy of an abstract simplex is coloured, highlighted and
	// picked together, so a torus drawn as a square behaves like a torus.
	import type { FlatLayout, Pt } from './flat';

	let {
		L,
		triFill,
		triOpacity,
		triOrient,
		orientColor = 'var(--violet)',
		edgeCoef,
		coefColor = 'var(--gold-bright)',
		edgeColor,
		edgeWidth,
		edgeDash,
		showOrientation = false,
		vertexColor,
		showLabels = true,
		labelSize = 1,
		vertexRadius,
		interactive = [],
		onpick,
		onhover,
		hiddenTris,
		hiddenEdges,
		hiddenVerts,
		pulseTri = null,
		pulseKey = 0,
		ariaName = 'simplex'
	}: {
		L: FlatLayout;
		/** fill colour of abstract triangle t (null = default faint fill) */
		triFill?: (t: number) => string | null | undefined;
		triOpacity?: (t: number) => number | undefined;
		/** orientation coefficient (±1 relative to increasing labels, 0 = none) drawn as a circular arrow */
		triOrient?: (t: number) => number;
		orientColor?: string | ((t: number) => string);
		/** an integer 1-chain: coefficient of abstract edge e (drawn with arrows) */
		edgeCoef?: (e: number) => number;
		coefColor?: string | ((e: number) => string);
		/** highlight colour of abstract edge e (without arrows) */
		edgeColor?: (e: number) => string | null | undefined;
		edgeWidth?: (e: number) => number | undefined;
		edgeDash?: (e: number) => boolean;
		/** faint arrows on every edge, from lower to higher label */
		showOrientation?: boolean;
		vertexColor?: (i: number) => string | null | undefined;
		showLabels?: boolean;
		labelSize?: number;
		vertexRadius?: number;
		interactive?: Kind[];
		onpick?: (kind: Kind, index: number) => void;
		onhover?: (kind: Kind | null, index: number) => void;
		hiddenTris?: Set<number>;
		hiddenEdges?: Set<number>;
		hiddenVerts?: Set<number>;
		/** abstract triangle to flash (changes of pulseKey restart the flash) */
		pulseTri?: number | null;
		pulseKey?: number;
		ariaName?: string;
	} = $props();

	const u = $derived(L.scale / 60);
	const R = $derived(vertexRadius ?? 6.2 * u);
	let hover = $state<{ kind: Kind; i: number } | null>(null);

	const center = $derived.by((): Pt => {
		const n = L.verts.length || 1;
		return [L.verts.reduce((s, v) => s + v.p[0], 0) / n, L.verts.reduce((s, v) => s + v.p[1], 0) / n];
	});

	function setHover(kind: Kind | null, i = -1) {
		hover = kind ? { kind, i } : null;
		onhover?.(kind, i);
	}
	const isOn = (k: Kind) => interactive.includes(k);
	const P = (j: number) => L.verts[j].p;
	function key(e: KeyboardEvent, kind: Kind, i: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onpick?.(kind, i);
		}
	}
	const col = (c: string | ((x: number) => string), x: number) => (typeof c === 'function' ? c(x) : c);

	/** chevron at the midpoint of a→b pointing towards b */
	function chevron(a: Pt, b: Pt, size: number, along = 0.5) {
		const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const ux = (b[0] - a[0]) / len;
		const uy = (b[1] - a[1]) / len;
		const mx = a[0] + (b[0] - a[0]) * along + ux * size * 0.45;
		const my = a[1] + (b[1] - a[1]) * along + uy * size * 0.45;
		return `M ${mx - ux * size - uy * size * 0.8} ${my - uy * size + ux * size * 0.8} L ${mx} ${my} L ${mx - ux * size + uy * size * 0.8} ${my - uy * size - ux * size * 0.8}`;
	}

	/** circular arrow inside a drawn triangle; dir +1 = counterclockwise on screen */
	function orientArc(a: Pt, b: Pt, c: Pt, dir: number) {
		const cx = (a[0] + b[0] + c[0]) / 3;
		const cy = (a[1] + b[1] + c[1]) / 3;
		// inradius-ish: distance from centroid to the nearest side
		const dist = (p: Pt, q: Pt) => {
			const len = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
			return Math.abs((q[0] - p[0]) * (p[1] - cy) - (p[0] - cx) * (q[1] - p[1])) / len;
		};
		const r = Math.min(dist(a, b), dist(b, c), dist(a, c)) * 0.52;
		// screen angles: y grows downward, so counterclockwise means decreasing SVG angle
		const start = -Math.PI / 2;
		const sweep = 1.55 * Math.PI;
		const pts: string[] = [];
		const N = 18;
		for (let k = 0; k <= N; k++) {
			const t = start - dir * sweep * (k / N);
			pts.push(`${(cx + r * Math.cos(t)).toFixed(2)},${(cy + r * Math.sin(t)).toFixed(2)}`);
		}
		const tEnd = start - dir * sweep;
		const ex = cx + r * Math.cos(tEnd);
		const ey = cy + r * Math.sin(tEnd);
		// tangent direction of motion at the end
		const tx = -Math.sin(tEnd) * -dir;
		const ty = Math.cos(tEnd) * -dir;
		const s = Math.max(2.2, r * 0.55);
		const head = `M ${ex - tx * s - ty * s * 0.75} ${ey - ty * s + tx * s * 0.75} L ${ex + tx * s * 0.35} ${ey + ty * s * 0.35} L ${ex - tx * s + ty * s * 0.75} ${ey - ty * s - tx * s * 0.75}`;
		return { path: 'M ' + pts.join(' L '), head, r };
	}

	const maxDist = $derived(Math.max(1e-6, ...L.verts.map((v) => Math.hypot(v.p[0] - center[0], v.p[1] - center[1]))));
	function labelPos(p: Pt): Pt {
		let dx = p[0] - center[0];
		let dy = p[1] - center[1];
		const len = Math.hypot(dx, dy);
		if (len < 0.55 * maxDist) {
			// interior vertex: a fixed upper-left offset reads best in grids and fans
			dx = -0.62;
			dy = -0.78;
		} else {
			dx /= len;
			dy /= len;
		}
		const off = R + 9 * u * labelSize;
		return [p[0] + dx * off, p[1] + dy * off];
	}
</script>

<g class="flat">
	<!-- triangles -->
	{#each L.tris as d, j (j)}
		{#if !hiddenTris?.has(d.t)}
			{@const fill = triFill?.(d.t)}
			{@const hot = hover?.kind === 'tri' && hover.i === d.t}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<polygon
				points="{P(d.a).join(',')} {P(d.b).join(',')} {P(d.c).join(',')}"
				class="tri"
				class:on={!!fill}
				class:hot
				class:clickable={isOn('tri')}
				style={fill ? `--tc:${fill}; --to:${triOpacity?.(d.t) ?? 0.3}` : ''}
				role={isOn('tri') ? 'button' : undefined}
				tabindex={isOn('tri') ? 0 : undefined}
				aria-label={isOn('tri') ? `${ariaName} triangle ${L.K.simplices[2][d.t].join(',')}` : undefined}
				onclick={() => isOn('tri') && onpick?.('tri', d.t)}
				onkeydown={(e) => isOn('tri') && key(e, 'tri', d.t)}
				onpointerenter={() => isOn('tri') && setHover('tri', d.t)}
				onpointerleave={() => isOn('tri') && setHover(null)}
			/>
			{#if pulseTri === d.t}
				{#key pulseKey}
					<polygon points="{P(d.a).join(',')} {P(d.b).join(',')} {P(d.c).join(',')}" class="pulse" />
				{/key}
			{/if}
		{/if}
	{/each}

	<!-- triangle orientations -->
	{#if triOrient}
		{#each L.tris as d, j (j)}
			{@const s = hiddenTris?.has(d.t) ? 0 : triOrient(d.t)}
			{#if s}
				{@const arc = orientArc(P(d.a), P(d.b), P(d.c), s * d.screen)}
				<g class="orient-arc" style="--oc:{col(orientColor, d.t)}">
					<path d={arc.path} class="arc" style="stroke-width:{Math.max(1.3, 1.7 * u)}" />
					<path d={arc.head} class="arc-head" style="stroke-width:{Math.max(1.3, 1.7 * u)}" />
				</g>
			{/if}
		{/each}
	{/if}

	<!-- edges -->
	{#each L.edges as d, j (j)}
		{#if !hiddenEdges?.has(d.e)}
			{@const a = P(d.a)}
			{@const b = P(d.b)}
			{@const x = edgeCoef?.(d.e) ?? 0}
			{@const hc = edgeColor?.(d.e)}
			{@const c = x ? col(coefColor, d.e) : hc}
			{@const w = edgeWidth?.(d.e) ?? (c ? 3.4 * u : 1.7 * u)}
			{@const hot = hover?.kind === 'edge' && hover.i === d.e}
			<g class="edge" class:on={!!c}>
				{#if c}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="halo" style="stroke:{c}; stroke-width:{w * 3}" />
				{/if}
				<line
					x1={a[0]}
					y1={a[1]}
					x2={b[0]}
					y2={b[1]}
					class="stroke"
					style="stroke:{c ?? 'rgba(200,192,170,0.5)'}; stroke-width:{hot ? w + 1.6 * u : w}; {edgeDash?.(d.e)
						? `stroke-dasharray:${5 * u} ${5 * u}`
						: ''}"
				/>
				{#if x}
					{@const [from, to] = x > 0 ? [a, b] : [b, a]}
					<path d={chevron(from, to, 6 * u)} class="chev" style="stroke:{c}; stroke-width:{2.3 * u}" />
					{#if Math.abs(x) > 1}
						{@const mx = (a[0] + b[0]) / 2}
						{@const my = (a[1] + b[1]) / 2}
						{@const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1}
						<text
							x={mx + (-(b[1] - a[1]) / len) * 13 * u}
							y={my + ((b[0] - a[0]) / len) * 13 * u + 4 * u}
							class="mult"
							style="fill:{c}; font-size:{12.5 * u}px">{Math.abs(x)}</text
						>
					{/if}
				{:else if showOrientation}
					<path d={chevron(a, b, 4.2 * u)} class="chev faint" style="stroke-width:{1.4 * u}" />
				{/if}
				{#if isOn('edge')}
					<line
						x1={a[0]}
						y1={a[1]}
						x2={b[0]}
						y2={b[1]}
						class="hit"
						style="stroke-width:{16 * u}"
						role="button"
						tabindex="0"
						aria-label="{ariaName} edge {L.K.simplices[1][d.e].join(',')}"
						onclick={() => onpick?.('edge', d.e)}
						onkeydown={(ev) => key(ev, 'edge', d.e)}
						onpointerenter={() => setHover('edge', d.e)}
						onpointerleave={() => setHover(null)}
					/>
				{/if}
			</g>
		{/if}
	{/each}

	<!-- vertices -->
	{#each L.verts as d, j (j)}
		{#if !hiddenVerts?.has(d.i)}
			{@const c = vertexColor?.(d.i)}
			{@const hot = hover?.kind === 'vertex' && hover.i === d.i}
			<g class="vertex">
				{#if c}
					<circle cx={d.p[0]} cy={d.p[1]} r={R + 6 * u} class="vhalo" style="fill:{c}" />
				{/if}
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<circle
					cx={d.p[0]}
					cy={d.p[1]}
					r={hot ? R + 1.5 * u : R}
					class="vdot"
					class:colored={!!c}
					style={c ? `fill:${c}` : ''}
					role={isOn('vertex') ? 'button' : undefined}
					tabindex={isOn('vertex') ? 0 : undefined}
					aria-label={isOn('vertex') ? `${ariaName} vertex ${d.v}` : undefined}
					onclick={() => isOn('vertex') && onpick?.('vertex', d.i)}
					onkeydown={(ev) => isOn('vertex') && key(ev, 'vertex', d.i)}
					onpointerenter={() => isOn('vertex') && setHover('vertex', d.i)}
					onpointerleave={() => isOn('vertex') && setHover(null)}
				/>
				{#if isOn('vertex')}
					<circle
						cx={d.p[0]}
						cy={d.p[1]}
						r={R + 9 * u}
						class="vhit"
						onclick={() => onpick?.('vertex', d.i)}
						onpointerenter={() => setHover('vertex', d.i)}
						onpointerleave={() => setHover(null)}
					/>
				{/if}
				{#if showLabels}
					{@const [lx, ly] = labelPos(d.p)}
					<text x={lx} y={ly + 4.5 * u * labelSize} class="vlab" style="font-size:{13 * u * labelSize}px">{d.v}</text>
				{/if}
			</g>
		{/if}
	{/each}
</g>

<style>
	.tri {
		fill: rgba(116, 169, 255, 0.075);
		stroke: none;
		transition: fill 0.35s var(--ease);
	}
	.tri.on {
		fill: color-mix(in srgb, var(--tc) calc(var(--to) * 100%), transparent);
	}
	.tri.clickable {
		cursor: pointer;
	}
	/* SVG shapes: show keyboard focus on the shape, never as a bounding-box ring */
	.tri:focus,
	.hit:focus,
	.vdot:focus {
		outline: none;
	}
	.tri:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 2.5;
	}
	.hit:focus-visible {
		stroke: rgba(244, 215, 156, 0.35);
	}
	.vdot:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.tri.clickable:hover,
	.tri.hot {
		fill: rgba(164, 147, 255, 0.2);
	}
	.tri.on.hot,
	.tri.on.clickable:hover {
		fill: color-mix(in srgb, var(--tc) calc(var(--to) * 100% + 14%), transparent);
	}
	.pulse {
		fill: var(--violet);
		opacity: 0;
		pointer-events: none;
		animation: pulse 0.8s var(--ease);
	}
	@keyframes pulse {
		0% {
			opacity: 0.55;
		}
		100% {
			opacity: 0;
		}
	}
	.arc,
	.arc-head {
		fill: none;
		stroke: var(--oc);
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.9;
		pointer-events: none;
	}
	.stroke {
		stroke-linecap: round;
		transition:
			stroke 0.3s var(--ease),
			stroke-width 0.15s;
	}
	.halo {
		opacity: 0.2;
		stroke-linecap: round;
		filter: blur(2px);
		pointer-events: none;
	}
	.chev {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.chev.faint {
		stroke: rgba(220, 210, 185, 0.55);
	}
	.mult {
		font-family: var(--font-ui);
		font-weight: 700;
		text-anchor: middle;
		paint-order: stroke;
		stroke: rgba(4, 6, 12, 0.95);
		stroke-width: 3px;
		pointer-events: none;
	}
	.hit {
		stroke: transparent;
		cursor: pointer;
		stroke-linecap: round;
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.4;
		transition:
			r 0.15s,
			fill 0.3s;
	}
	.vdot.colored {
		stroke: rgba(255, 255, 255, 0.55);
	}
	.vdot[role='button'] {
		cursor: pointer;
	}
	.vhit {
		fill: transparent;
		cursor: pointer;
	}
	.vhalo {
		opacity: 0.26;
		filter: blur(3px);
		pointer-events: none;
	}
	.vlab {
		font-family: var(--font-ui);
		font-weight: 600;
		text-anchor: middle;
		fill: var(--ink-dim) !important;
		paint-order: stroke;
		stroke: rgba(4, 6, 12, 0.92);
		stroke-width: 3px;
		pointer-events: none;
	}
</style>
