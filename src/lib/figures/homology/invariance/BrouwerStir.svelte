<script lang="ts">
	// Stir the disk: f(p) = shift + scale · (rotate p by twist·(1 − |p|²)).
	// Colour = direction of the displacement f(p) − p; fixed points are where every
	// colour meets. The "retraction" view shows the ray from f(p) through p.
	import { onMount } from 'svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { clampShift, retractionPoint, stir, stirFixedPoints, type StirParams } from './maps';

	let twist = $state(9);
	let scale = $state(0.9);
	let shift = $state<[number, number]>([-0.05, 0.05]);
	let rays = $state(false);
	let probe = $state<[number, number]>([-0.45, -0.3]);

	const P = $derived<StirParams>(clampShift({ twist, scale, cx: shift[0], cy: shift[1] }));
	const fps = $derived(stirFixedPoints(P));
	const indexSum = $derived(fps.reduce((s, p) => s + p.index, 0));

	let canvas: HTMLCanvasElement;
	let svg: SVGSVGElement;
	const N = 280; // canvas resolution

	function palette(t: number): [number, number, number] {
		const c = (o: number) => 0.52 + 0.48 * Math.cos(2 * Math.PI * (t + o));
		return [c(0.02), c(0.36), c(0.62)];
	}
	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const img = ctx.createImageData(N, N);
		const d = img.data;
		for (let j = 0; j < N; j++) {
			const y = 1.15 - (2.3 * (j + 0.5)) / N;
			for (let i = 0; i < N; i++) {
				const x = -1.15 + (2.3 * (i + 0.5)) / N;
				const k = 4 * (j * N + i);
				const r2 = x * x + y * y;
				if (r2 > 1.0) {
					d[k + 3] = 0;
					continue;
				}
				const [fx, fy] = stir(P, x, y);
				const dx = fx - x;
				const dy = fy - y;
				const m = Math.hypot(dx, dy);
				const [r, g, b] = palette(Math.atan2(dy, dx) / (2 * Math.PI));
				const v = 0.16 + 0.84 * (1 - Math.exp(-m / 0.09));
				// soften towards the rim for a vignette
				const edge = Math.min(1, (1 - Math.sqrt(r2)) * 60);
				d[k] = 255 * r * v;
				d[k + 1] = 255 * g * v;
				d[k + 2] = 255 * b * v;
				d[k + 3] = 255 * (0.82 * edge + 0.0);
			}
		}
		ctx.putImageData(img, 0, 0);
	}
	onMount(() => {
		draw();
	});
	$effect(() => {
		void P;
		draw();
	});

	// arrows of the displacement field on a grid
	const grid = (() => {
		const out: [number, number][] = [];
		const n = 11;
		for (let i = 0; i < n; i++)
			for (let j = 0; j < n; j++) {
				const x = -1 + (2 * (i + 0.5)) / n;
				const y = -1 + (2 * (j + 0.5)) / n;
				if (x * x + y * y < 0.9) out.push([x, y]);
			}
		return out;
	})();
	const arrows = $derived(
		grid.map(([x, y]) => {
			const [fx, fy] = stir(P, x, y);
			let dx = fx - x;
			let dy = fy - y;
			const m = Math.hypot(dx, dy);
			const L = Math.min(m, 0.13);
			if (m > 1e-9) {
				dx = (dx / m) * L;
				dy = (dy / m) * L;
			}
			return { x, y, dx, dy, m };
		})
	);
	const imageOfRim = $derived(
		Array.from({ length: 181 }, (_, i) => {
			const a = (i / 180) * Math.PI * 2;
			const [x, y] = stir(P, Math.cos(a), Math.sin(a));
			return `${x.toFixed(4)},${(-y).toFixed(4)}`;
		}).join(' ')
	);
	const rayList = $derived(
		rays
			? Array.from({ length: 18 }, (_, i) => {
					const a = (i / 18) * Math.PI * 2 + 0.1;
					const x = 0.62 * Math.cos(a);
					const y = 0.62 * Math.sin(a);
					const f = stir(P, x, y);
					const r = retractionPoint(P, x, y);
					return { x, y, f, r };
				})
			: []
	);
	const probeRay = $derived.by(() => {
		const [x, y] = probe;
		const f = stir(P, x, y);
		return { f, r: retractionPoint(P, x, y) };
	});

	// dragging: the shift handle (where the centre goes) or the probe
	let drag: 'shift' | 'probe' | null = null;
	function toLocal(e: PointerEvent): [number, number] {
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const q = pt.matrixTransform(svg.getScreenCTM()!.inverse());
		return [q.x, -q.y];
	}
	function down(e: PointerEvent, what: 'shift' | 'probe') {
		drag = what;
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		let [x, y] = toLocal(e);
		if (drag === 'shift') {
			const lim = 1 - scale;
			const d = Math.hypot(x, y);
			if (d > lim) {
				x = (x / d) * lim;
				y = (y / d) * lim;
			}
			shift = [x, y];
		} else {
			const d = Math.hypot(x, y);
			if (d > 0.995) {
				x = (x / d) * 0.995;
				y = (y / d) * 0.995;
			}
			probe = [x, y];
		}
	}
	function up() {
		drag = null;
	}
	function key(e: KeyboardEvent, what: 'shift' | 'probe') {
		const step = 0.03;
		const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] };
		const v = d[e.key];
		if (!v) return;
		e.preventDefault();
		if (what === 'shift') {
			const P2 = clampShift({ twist, scale, cx: shift[0] + v[0], cy: shift[1] + v[1] });
			shift = [P2.cx, P2.cy];
		} else probe = [probe[0] + v[0], probe[1] + v[1]];
	}
	$effect(() => {
		// keep the handle legal when the squeeze changes
		const P2 = clampShift({ twist, scale, cx: shift[0], cy: shift[1] });
		if (P2.cx !== shift[0] || P2.cy !== shift[1]) shift = [P2.cx, P2.cy];
	});
	// the legend wheel, generated from the same palette as the canvas
	// (CSS conic gradients run clockwise from the top; math angles run counterclockwise from the east)
	const wheel = (() => {
		const stops: string[] = [];
		for (let k = 0; k <= 24; k++) {
			const [r, g, b] = palette(1 - k / 24);
			stops.push(`rgb(${Math.round(255 * r)},${Math.round(255 * g)},${Math.round(255 * b)}) ${(k / 24) * 360}deg`);
		}
		return `conic-gradient(from 90deg, ${stops.join(', ')})`;
	})();
	const sumTeX = $derived(
		fps.length ? fps.map((p) => (p.index > 0 ? '+1' : p.index < 0 ? '-1' : '0')).join(' ') + ` = ${indexSum}` : '\\text{(none found)}'
	);
</script>

<div class="brouwer">
	<div class="stage">
		<div class="square">
			<canvas bind:this={canvas} width={N} height={N} aria-hidden="true"></canvas>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<svg
				bind:this={svg}
				viewBox="-1.15 -1.15 2.3 2.3"
				role="img"
				aria-label="The unit disk coloured by the direction in which each point moves under the stirring map; fixed points glow"
				onpointermove={move}
				onpointerup={up}
				onpointercancel={up}
			>
				<defs>
					<marker id="bs-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto">
						<path d="M0,1 L9,5 L0,9 L2.5,5 Z" fill="rgba(255,252,240,0.92)" />
					</marker>
					<filter id="bs-glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="0.03" result="b" />
						<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
					</filter>
				</defs>
				<circle cx="0" cy="0" r="1" class="rim" />
				<polyline points={imageOfRim} class="imrim" />
				{#each arrows as a, i (i)}
					{#if a.m > 0.012}
						<line x1={a.x} y1={-a.y} x2={a.x + a.dx} y2={-(a.y + a.dy)} class="arr" marker-end="url(#bs-arrow)" />
					{/if}
				{/each}
				{#each rayList as r, i (i)}
					{#if r.r}
						<line x1={r.f[0]} y1={-r.f[1]} x2={r.r[0]} y2={-r.r[1]} class="ray" />
						<circle cx={r.r[0]} cy={-r.r[1]} r="0.022" class="rdot" />
					{/if}
				{/each}
				{#if rays}
					{@const pr = probeRay}
					{#if pr.r}
						<line x1={pr.f[0]} y1={-pr.f[1]} x2={pr.r[0]} y2={-pr.r[1]} class="ray strong" />
						<circle cx={pr.f[0]} cy={-pr.f[1]} r="0.025" class="fdot" />
						<circle cx={pr.r[0]} cy={-pr.r[1]} r="0.035" class="rdot strong" />
					{/if}
					<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
					<circle
						cx={probe[0]}
						cy={-probe[1]}
						r="0.05"
						class="probe"
						role="slider"
						tabindex="0"
						aria-label="probe point (drag, or use the arrow keys)"
						aria-valuenow={0}
						onpointerdown={(e) => down(e, 'probe')}
						onkeydown={(e) => key(e, 'probe')}
					/>
				{/if}
				{#each fps as p, i (i)}
					<circle cx={p.x} cy={-p.y} r="0.075" class="fphalo" />
					<circle cx={p.x} cy={-p.y} r="0.032" class="fp" filter="url(#bs-glow)" />
					<text x={p.x + 0.07} y={-p.y - 0.06} class="idx">{p.index > 0 ? '+1' : p.index < 0 ? '−1' : '0'}</text>
				{/each}
				<!-- shift handle: the image of the centre -->
				<line x1="0" y1="0" x2={P.cx} y2={-P.cy} class="shiftline" />
				<circle cx="0" cy="0" r="0.018" class="centre" />
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<g
					class="handle"
					role="slider"
					tabindex="0"
					aria-label="where the centre is carried (drag, or use the arrow keys)"
					aria-valuenow={0}
					onpointerdown={(e) => down(e, 'shift')}
					onkeydown={(e) => key(e, 'shift')}
				>
					<circle cx={P.cx} cy={-P.cy} r="0.09" fill="transparent" />
					<circle cx={P.cx} cy={-P.cy} r="0.04" class="hdot" />
				</g>
			</svg>
		</div>
		<div class="side ui">
			<div class="stat">
				<div class="k">fixed points</div>
				<div class="v">{fps.length}</div>
			</div>
			<div class="stat">
				<div class="k">their indices</div>
				<div class="v small"><TeX tex={sumTeX} /></div>
			</div>
			<div class="legend">
				<div class="wheel" aria-hidden="true" style="background:{wheel}"></div>
				<p>Colour = the direction in which a point is moved. Dark = barely moved. Around the rim the colours run once through the whole rainbow, so somewhere inside they must all meet: <b>a fixed point</b>.</p>
			</div>
		</div>
	</div>
	<Controls>
		<Slider bind:value={twist} min={-12} max={12} step={0.1} label="stir (twist at the centre)" format={(v) => v.toFixed(1) + ' rad'} />
		<Slider bind:value={scale} min={0.3} max={0.95} step={0.01} label="squeeze" format={(v) => v.toFixed(2)} />
		<Toggle bind:checked={rays} label="Try to retract (rays from f(x) through x)" />
		<Button
			variant="subtle"
			onclick={() => {
				twist = 9;
				scale = 0.9;
				shift = [-0.05, 0.05];
			}}>Reset</Button
		>
	</Controls>
</div>

<style>
	.stage {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.6rem 1.6rem;
		padding: 1rem 1rem 0.6rem;
	}
	.square {
		position: relative;
		width: min(100%, 420px);
		aspect-ratio: 1;
		flex: 0 1 420px;
	}
	canvas,
	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	canvas {
		border-radius: 50%;
		filter: saturate(0.9);
	}
	svg {
		overflow: visible;
		touch-action: none;
	}
	.rim {
		fill: none;
		stroke: rgba(251, 246, 232, 0.85);
		stroke-width: 0.012;
	}
	.imrim {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 0.01;
		stroke-dasharray: 0.03 0.025;
		opacity: 0.9;
	}
	.arr {
		stroke: rgba(255, 252, 240, 0.82);
		stroke-width: 0.0085;
		stroke-linecap: round;
	}
	.ray {
		stroke: rgba(164, 147, 255, 0.55);
		stroke-width: 0.007;
	}
	.ray.strong {
		stroke: var(--violet);
		stroke-width: 0.014;
	}
	.rdot {
		fill: var(--violet);
	}
	.rdot.strong {
		fill: #fff;
		stroke: var(--violet);
		stroke-width: 0.012;
	}
	.fdot {
		fill: var(--violet);
		opacity: 0.8;
	}
	.probe {
		fill: #fff;
		stroke: var(--violet);
		stroke-width: 0.018;
		cursor: grab;
	}
	.fphalo {
		fill: rgba(244, 215, 156, 0.18);
		stroke: rgba(244, 215, 156, 0.5);
		stroke-width: 0.006;
	}
	.fp {
		fill: #fff6dc;
		stroke: var(--gold-bright);
		stroke-width: 0.012;
	}
	.idx {
		font-family: var(--font-ui);
		font-size: 0.085px;
		font-weight: 700;
		fill: var(--gold-pale);
		paint-order: stroke;
		stroke: rgba(4, 6, 12, 0.85);
		stroke-width: 0.025px;
	}
	.shiftline {
		stroke: rgba(244, 215, 156, 0.55);
		stroke-width: 0.008;
		stroke-dasharray: 0.02 0.02;
	}
	.centre {
		fill: rgba(255, 255, 255, 0.7);
	}
	.handle {
		cursor: grab;
	}
	.hdot {
		fill: var(--gold-bright);
		stroke: #1a1206;
		stroke-width: 0.012;
	}
	.handle:focus-visible .hdot,
	.handle:hover .hdot {
		stroke: #fff;
	}
	.side {
		flex: 1 1 200px;
		max-width: 260px;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
	}
	.stat .k {
		font-size: 0.68rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.stat .v {
		font-size: 1.8rem;
		color: var(--gold-bright);
		font-weight: 600;
		line-height: 1.2;
	}
	.stat .v.small {
		font-size: 1.05rem;
	}
	.legend {
		display: flex;
		gap: 0.7rem;
		align-items: flex-start;
	}
	.legend p {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
	.wheel {
		flex: none;
		width: 2.2rem;
		height: 2.2rem;
		border-radius: 50%;
		box-shadow: 0 0 12px rgba(143, 124, 247, 0.4);
	}
</style>
