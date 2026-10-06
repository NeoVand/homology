<script lang="ts">
	// Figure: indices of zeros of a planar vector field. The background colour
	// shows the direction of the field (one colour per direction), so around a
	// zero of index k the colours cycle k times. A draggable test loop reports
	// its winding number: the sum of the indices of the zeros inside it.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { circleLoop, fieldAt, indexOf, windingAlong, type Zero, type ZeroKind } from './fields';
	import { svgPoint } from '../sheaves/svgutil';

	type Mode = 'gallery' | 'play';
	let mode = $state<Mode>('gallery');
	let kind = $state<ZeroKind>('source');
	let zs = $state<Zero[]>([
		{ x: -1.7, y: 0.5, kind: 'source' },
		{ x: 0.3, y: -0.6, kind: 'saddle' },
		{ x: 2.0, y: 0.7, kind: 'centre' }
	]);
	let loop = $state({ x: -0.6, y: 0, r: 1.55 });
	let walk = $state(0.0);

	const W = 640;
	const H = 400;
	const S = 80; // pixels per unit
	const toX = (x: number) => W / 2 + x * S;
	const toY = (y: number) => H / 2 - y * S;
	const fromX = (px: number) => (px - W / 2) / S;
	const fromY = (py: number) => (H / 2 - py) / S;

	const zeros = $derived<Zero[]>(mode === 'gallery' ? [{ x: 0, y: 0, kind }] : zs);
	const L = $derived(mode === 'gallery' ? { x: 0, y: 0, r: 1.6 } : loop);

	// cyclic palette through the book's colours: direction angle → colour
	const stops = ['#f2d08f', '#f28db6', '#a493ff', '#74a9ff', '#5fd6cf', '#84d9a2'].map((h) => [
		parseInt(h.slice(1, 3), 16),
		parseInt(h.slice(3, 5), 16),
		parseInt(h.slice(5, 7), 16)
	]);
	function colourOf(theta: number, dim = 1): [number, number, number] {
		let t = ((theta / (2 * Math.PI)) % 1 + 1) % 1;
		t *= stops.length;
		const i = Math.floor(t);
		const f = t - i;
		const a = stops[i % stops.length];
		const b = stops[(i + 1) % stops.length];
		return [0, 1, 2].map((k) => (a[k] + (b[k] - a[k]) * f) * dim) as [number, number, number];
	}
	const css = (c: [number, number, number]) => `rgb(${c.map((v) => Math.round(v)).join(',')})`;

	// background image of directions
	let bg = $state('');
	let cnv: HTMLCanvasElement | null = null;
	function paint() {
		if (typeof document === 'undefined') return;
		const w = 160;
		const h = 100;
		cnv ??= document.createElement('canvas');
		cnv.width = w;
		cnv.height = h;
		const ctx = cnv.getContext('2d');
		if (!ctx) return;
		const img = ctx.createImageData(w, h);
		for (let j = 0; j < h; j++)
			for (let i = 0; i < w; i++) {
				const x = fromX(((i + 0.5) / w) * W);
				const y = fromY(((j + 0.5) / h) * H);
				const [vx, vy] = fieldAt(zeros, x, y);
				const c = colourOf(Math.atan2(vy, vx), 0.42);
				const k = 4 * (j * w + i);
				img.data[k] = c[0];
				img.data[k + 1] = c[1];
				img.data[k + 2] = c[2];
				img.data[k + 3] = 255;
			}
		ctx.putImageData(img, 0, 0);
		bg = cnv.toDataURL();
	}
	let raf = 0;
	$effect(() => {
		void zeros;
		void zeros.map((z) => z.x + z.y);
		cancelAnimationFrame(raf);
		raf = requestAnimationFrame(paint);
	});
	onMount(() => {
		paint();
		return () => cancelAnimationFrame(raf);
	});

	// arrow grid
	const arrows = $derived.by(() => {
		let d = '';
		const nx = 24;
		const ny = 15;
		for (let j = 0; j < ny; j++)
			for (let i = 0; i < nx; i++) {
				const px = ((i + 0.5) / nx) * W;
				const py = ((j + 0.5) / ny) * H;
				const [vx, vy] = fieldAt(zeros, fromX(px), fromY(py));
				const m = Math.hypot(vx, vy);
				if (m < 1e-9) continue;
				const ux = vx / m;
				const uy = -vy / m; // screen y is down
				const len = 15;
				const x0 = px - (ux * len) / 2;
				const y0 = py - (uy * len) / 2;
				const x1 = px + (ux * len) / 2;
				const y1 = py + (uy * len) / 2;
				const hx = -uy * 3.6;
				const hy = ux * 3.6;
				d += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
				d += `M${(x1 - ux * 5 + hx).toFixed(1)} ${(y1 - uy * 5 + hy).toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}L${(x1 - ux * 5 - hx).toFixed(1)} ${(y1 - uy * 5 - hy).toFixed(1)}`;
			}
		return d;
	});

	const angleAt = (x: number, y: number) => {
		const [a, b] = fieldAt(zeros, x, y);
		return Math.atan2(b, a);
	};
	const loopWinding = $derived(Math.round(windingAlong(angleAt, circleLoop(L.x, L.y, L.r, 720))));
	const total = $derived(zeros.reduce((s, z) => s + indexOf[z.kind], 0));

	// little arrows along the loop
	const loopArrows = $derived.by(() =>
		Array.from({ length: 28 }, (_, k) => {
			const t = (2 * Math.PI * k) / 28;
			const x = L.x + L.r * Math.cos(t);
			const y = L.y + L.r * Math.sin(t);
			const a = angleAt(x, y);
			return { x: toX(x), y: toY(y), a, c: css(colourOf(a)) };
		})
	);

	// the walker (gallery mode): accumulated turning so far
	const walker = $derived.by(() => {
		const n = 400;
		const steps = Math.max(1, Math.round(walk * n));
		const pts: [number, number][] = [];
		for (let k = 0; k <= steps; k++) {
			const t = (2 * Math.PI * k) / n;
			pts.push([L.x + L.r * Math.cos(t), L.y + L.r * Math.sin(t)]);
		}
		let acc = 0;
		let prev = angleAt(pts[0][0], pts[0][1]);
		for (let k = 1; k < pts.length; k++) {
			const a = angleAt(pts[k][0], pts[k][1]);
			let d = a - prev;
			while (d > Math.PI) d -= 2 * Math.PI;
			while (d < -Math.PI) d += 2 * Math.PI;
			acc += d;
			prev = a;
		}
		const last = pts[pts.length - 1];
		return { x: toX(last[0]), y: toY(last[1]), a: prev, turns: acc / (2 * Math.PI) };
	});

	// dragging
	let svgEl = $state<SVGSVGElement>();
	let drag: { kind: 'zero' | 'loop' | 'radius'; i: number; dx: number; dy: number } | null = null;
	function start(kindOf: 'zero' | 'loop' | 'radius', i: number, e: PointerEvent) {
		if (!svgEl) return;
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		const p = svgPoint(svgEl, e);
		const ox = kindOf === 'zero' ? toX(zs[i].x) : toX(loop.x);
		const oy = kindOf === 'zero' ? toY(zs[i].y) : toY(loop.y);
		drag = { kind: kindOf, i, dx: ox - p.x, dy: oy - p.y };
	}
	function move(e: PointerEvent) {
		if (!drag || !svgEl) return;
		const p = svgPoint(svgEl, e);
		const cx = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
		if (drag.kind === 'zero') {
			zs[drag.i] = { ...zs[drag.i], x: cx(fromX(p.x + drag.dx), -3.8, 3.8), y: cx(fromY(p.y + drag.dy), -2.3, 2.3) };
		} else if (drag.kind === 'loop') {
			loop = { ...loop, x: cx(fromX(p.x + drag.dx), -3.6, 3.6), y: cx(fromY(p.y + drag.dy), -2.2, 2.2) };
		} else {
			loop = { ...loop, r: cx(Math.hypot(fromX(p.x) - loop.x, fromY(p.y) - loop.y), 0.3, 3.4) };
		}
	}
	function end() {
		drag = null;
	}
	function add(k: ZeroKind) {
		if (zs.length >= 8) return;
		const spots = [
			[2.6, -1.4],
			[-2.8, -1.3],
			[-0.6, 1.6],
			[1.2, 1.7],
			[-3.0, 1.5],
			[3.1, 1.6]
		];
		const s = spots[zs.length % spots.length];
		zs = [...zs, { x: s[0], y: s[1], kind: k }];
	}
	const zeroColour: Record<ZeroKind, string> = {
		source: 'var(--gold-bright)',
		sink: 'var(--gold-bright)',
		centre: 'var(--gold-bright)',
		saddle: 'var(--teal)',
		dipole: 'var(--rose)',
		monkey: 'var(--blue)'
	};
	const sgn = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '0');
</script>

<div class="wrap">
	<Svg
		bind:svg={svgEl}
		viewBox="0 0 {W} {H}"
		maxHeight={460}
		label="A vector field in the plane, coloured by direction, with its zeros marked by their indices and a test loop whose winding number is shown."
		onpointermove={move}
		onpointerup={end}
		onpointerleave={end}
	>
		{#if bg}<image href={bg} x="0" y="0" width={W} height={H} preserveAspectRatio="none" />{/if}
		<path d={arrows} stroke="rgba(251,246,232,0.78)" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />

		<!-- the test loop -->
		<circle cx={toX(L.x)} cy={toY(L.y)} r={L.r * S} fill="none" stroke="#fff6dc" stroke-width="2" stroke-dasharray="6 5" opacity="0.9" />
		{#each loopArrows as a, k (k)}
			<g transform="translate({a.x} {a.y}) rotate({(-a.a * 180) / Math.PI})">
				<line x1="-9" y1="0" x2="9" y2="0" stroke={a.c} stroke-width="3.2" stroke-linecap="round" />
				<path d="M4 -5 L10 0 L4 5" fill="none" stroke={a.c} stroke-width="3" stroke-linejoin="round" stroke-linecap="round" />
			</g>
		{/each}
		{#if mode === 'play'}
			<circle cx={toX(loop.x)} cy={toY(loop.y)} r="9" class="handle" role="button" tabindex="-1" aria-label="Move the loop" onpointerdown={(e) => start('loop', 0, e)} />
			<circle cx={toX(loop.x) + loop.r * S} cy={toY(loop.y)} r="9" class="handle r" role="button" tabindex="-1" aria-label="Resize the loop" onpointerdown={(e) => start('radius', 0, e)} />
		{:else}
			<!-- the walker -->
			<g transform="translate({walker.x} {walker.y})">
				<circle r="7" fill="#fff6dc" />
				<g transform="rotate({(-walker.a * 180) / Math.PI})">
					<line x1="0" y1="0" x2="34" y2="0" stroke="#fff6dc" stroke-width="3.4" stroke-linecap="round" />
					<path d="M26 -7 L35 0 L26 7" fill="none" stroke="#fff6dc" stroke-width="3.2" stroke-linejoin="round" />
				</g>
			</g>
		{/if}

		<!-- zeros -->
		{#each zeros as z, i (i)}
			<g transform="translate({toX(z.x)} {toY(z.y)})">
				{#if mode === 'play'}
					<circle r="24" fill="transparent" class="hit" role="button" tabindex="-1" aria-label="Move this zero" onpointerdown={(e) => start('zero', i, e)} />
				{/if}
				<circle r="13" fill="rgba(6,10,20,0.85)" stroke={zeroColour[z.kind]} stroke-width="2.4" pointer-events="none" />
				<text y="5" text-anchor="middle" class="idx" fill={zeroColour[z.kind]} pointer-events="none">{sgn(indexOf[z.kind])}</text>
			</g>
		{/each}
	</Svg>

	<div class="readout ui" aria-live="polite">
		{#if mode === 'gallery'}
			<div>
				Walking once around the loop, the field arrow turns
				<strong class="tx">{walker.turns >= 0 ? '' : '−'}{Math.abs(walker.turns).toFixed(2)}</strong> times so far — a full walk gives the
				index, <TeX tex={`\\operatorname{ind} = ${loopWinding}`} />.
			</div>
		{:else}
			<div><TeX tex={`\\text{winding number of the loop} = ${loopWinding}`} /> = the sum of the indices of the zeros inside it.</div>
			<div><TeX tex={`\\text{all zeros: } \\textstyle\\sum \\operatorname{ind} = ${total}`} /></div>
			<div class="sphere">
				On a sphere (the plane plus one point at infinity) the field has one more zero, at ∞, of index
				<TeX tex={`2 - (${total}) = ${2 - total}`} />, so the total is <TeX tex={'2 = \\chi(S^2)'} /> whatever you do.
			</div>
		{/if}
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'gallery', label: 'One zero' },
				{ value: 'play', label: 'Playground' }
			]}
			label="Mode"
		/>
		{#if mode === 'gallery'}
			<Segmented
				bind:value={kind}
				options={[
					{ value: 'source', label: 'Source' },
					{ value: 'sink', label: 'Sink' },
					{ value: 'centre', label: 'Centre' },
					{ value: 'saddle', label: 'Saddle' },
					{ value: 'dipole', label: 'Dipole' },
					{ value: 'monkey', label: 'Monkey saddle' }
				]}
				label="Kind of zero"
			/>
			<Timeline bind:value={walk} duration={4} from="start" to="once around" label="Walking around the loop" />
		{:else}
			<Button onclick={() => add('source')}>+ index +1</Button>
			<Button onclick={() => add('saddle')}>+ saddle (−1)</Button>
			<Button onclick={() => add('dipole')}>+ dipole (+2)</Button>
			<Button onclick={() => (zs = zs.slice(0, -1))} disabled={zs.length === 0}>Remove last</Button>
		{/if}
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.5rem;
	}
	.handle {
		fill: #fff6dc;
		stroke: rgba(6, 10, 20, 0.8);
		stroke-width: 2;
		cursor: grab;
		touch-action: none;
	}
	.handle.r {
		fill: var(--gold);
	}
	.hit {
		cursor: grab;
		touch-action: none;
	}
	.idx {
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 700;
	}
	.readout {
		display: grid;
		gap: 0.35rem;
		padding: 0.5rem 1.2rem 0.7rem;
		font-size: 0.84rem;
		color: var(--ink);
		line-height: 1.5;
	}
	.tx {
		color: var(--gold-bright);
	}
	.sphere {
		color: var(--ink-dim);
	}
</style>
