<script lang="ts">
	// Figure: the Poincaré lemma. On a star-shaped region, integrating a closed
	// 1-form along the rays from the centre builds a potential (animated as a
	// growing coloured map with level lines, played or scrubbed). On an annulus with dθ the rays from
	// a centre are blocked by the hole, and the two ways around it disagree by 2π.
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { clamp, fmt, type Vec2 } from '$lib/figures/cohomology/differential-forms/calc';
	import { TAU, conePotential, hiddenPQ, segmentAvoidsDisk, starR } from './derham';

	const W = 640;
	const H = 400;
	const S = 104; // px per world unit
	const px = (p: Vec2): Vec2 => [W / 2 + p[0] * S, H / 2 - p[1] * S];
	const wx = (x: number, y: number): Vec2 => [(x - W / 2) / S, (H / 2 - y) / S];
	const R0 = 0.55;
	const R1 = 1.85;

	let mode = $state<'star' | 'annulus'>('star');
	let reveal = $state(1);
	let c = $state<Vec2>([1.15, 0.1]); // annulus centre
	let q = $state<Vec2>([-1.25, -0.2]); // annulus target

	let canvas: HTMLCanvasElement | undefined = $state();
	const CW = 400;
	const CH = 250;
	let field: Float32Array | null = null; // potential per canvas pixel (NaN outside / blocked)
	let shadow: Uint8Array | null = null;

	function palette(t: number): [number, number, number] {
		// deep blue → violet → rose → gold
		const stops: [number, number, number][] = [
			[22, 36, 96],
			[96, 72, 196],
			[214, 112, 168],
			[246, 214, 150]
		];
		const x = clamp(t, 0, 1) * 3;
		const i = Math.min(2, Math.floor(x));
		const f = x - i;
		const a = stops[i];
		const b = stops[i + 1];
		return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
	}

	function compute() {
		const n = CW * CH;
		field = new Float32Array(n).fill(NaN);
		shadow = new Uint8Array(n);
		for (let j = 0; j < CH; j++)
			for (let i = 0; i < CW; i++) {
				const p = wx(((i + 0.5) / CW) * W, ((j + 0.5) / CH) * H);
				const r = Math.hypot(p[0], p[1]);
				const k = j * CW + i;
				if (mode === 'star') {
					if (r < starR(Math.atan2(p[1], p[0]))) field[k] = conePotential(hiddenPQ, [0, 0], p);
				} else if (r > R0 && r < R1) {
					if (segmentAvoidsDisk(c, p, R0)) {
						// ∫ dθ along the straight segment c → p is the angle it subtends
						const a = Math.atan2(c[0] * p[1] - c[1] * p[0], c[0] * p[0] + c[1] * p[1]);
						field[k] = a;
					} else shadow[k] = 1;
				}
			}
	}

	function paint() {
		if (!canvas || !field || !shadow) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		const img = ctx.createImageData(CW, CH);
		let lo = Infinity;
		let hi = -Infinity;
		for (const v of field) if (!isNaN(v)) ((lo = Math.min(lo, v)), (hi = Math.max(hi, v)));
		if (mode === 'annulus') ((lo = -Math.PI), (hi = Math.PI));
		const sp = mode === 'star' ? 0.2 : TAU / 24;
		const pxw = W / CW / S; // world size of a canvas pixel
		for (let j = 0; j < CH; j++)
			for (let i = 0; i < CW; i++) {
				const k = j * CW + i;
				const o = 4 * k;
				const v = field[k];
				const p = wx(((i + 0.5) / CW) * W, ((j + 0.5) / CH) * H);
				if (!isNaN(v)) {
					// reveal: points whose ray fraction ≤ reveal
					const frac =
						mode === 'star' ? Math.hypot(p[0], p[1]) / starR(Math.atan2(p[1], p[0])) : Math.hypot(p[0] - c[0], p[1] - c[1]) / 3.6;
					if (frac > reveal) continue;
					const [rr, gg, bb] = palette((v - lo) / (hi - lo || 1));
					// level lines (distance in pixels via the size of the form)
					const g = mode === 'star' ? Math.hypot(...hiddenPQ(p[0], p[1])) : 1 / Math.hypot(p[0], p[1]);
					const d = (Math.abs((((v / sp) % 1) + 1.5) % 1 - 0.5) * sp) / Math.max(1e-6, g * pxw);
					const line = 1 - Math.min(1, Math.max(0, (d - 0.4) / 1.0));
					const edge = Math.min(1, (reveal - frac) * 40);
					img.data[o] = rr + (95 - rr) * line * 0.75;
					img.data[o + 1] = gg + (214 - gg) * line * 0.75;
					img.data[o + 2] = bb + (207 - bb) * line * 0.75;
					img.data[o + 3] = 255 * (0.55 + 0.45 * edge);
				} else if (shadow[k]) {
					const hatch = (i + j) % 8 < 2;
					img.data[o] = hatch ? 242 : 40;
					img.data[o + 1] = hatch ? 141 : 20;
					img.data[o + 2] = hatch ? 182 : 40;
					img.data[o + 3] = hatch ? 150 : 90;
				}
			}
		ctx.putImageData(img, 0, 0);
	}

	// recompute when the mode or the annulus centre changes; repaint as the rays grow
	let lastKey = '';
	$effect(() => {
		const k = `${mode}|${c[0].toFixed(3)},${c[1].toFixed(3)}`;
		void reveal;
		if (!canvas) return;
		if (k !== lastKey) {
			lastKey = k;
			compute();
		}
		paint();
	});

	// rays from the centre (star) or from c (annulus)
	const rays = $derived.by(() => {
		const out: { d: string; blocked: boolean }[] = [];
		const n = 36;
		for (let k = 0; k < n; k++) {
			const a = (TAU * k) / n + 0.05;
			const u: Vec2 = [Math.cos(a), Math.sin(a)];
			if (mode === 'star') {
				const R = starR(a) * reveal;
				const p = px([u[0] * R, u[1] * R]);
				const o = px([0, 0]);
				out.push({ d: `M ${o[0]} ${o[1]} L ${p[0]} ${p[1]}`, blocked: false });
			} else {
				// ray from c until it leaves the outer circle
				const b = c[0] * u[0] + c[1] * u[1];
				const cc = c[0] * c[0] + c[1] * c[1] - R1 * R1;
				const t = -b + Math.sqrt(b * b - cc);
				const end: Vec2 = [c[0] + u[0] * t, c[1] + u[1] * t];
				const blocked = !segmentAvoidsDisk(c, end, R0);
				const a0 = px(c);
				const a1 = px(end);
				out.push({ d: `M ${a0[0]} ${a0[1]} L ${a1[0]} ${a1[1]}`, blocked });
			}
		}
		return out;
	});

	// two routes from c to q around the hole (annulus mode)
	function route(dir: 1 | -1) {
		const rc = Math.hypot(c[0], c[1]);
		const rq = Math.hypot(q[0], q[1]);
		const tc = Math.atan2(c[1], c[0]);
		let dth = Math.atan2(q[1], q[0]) - tc;
		if (dir > 0) while (dth <= 0) dth += TAU;
		else while (dth >= 0) dth -= TAU;
		const pts: string[] = [];
		for (let i = 0; i <= 80; i++) {
			const t = i / 80;
			const r = rc + (rq - rc) * t;
			const th = tc + dth * t;
			const p = px([r * Math.cos(th), r * Math.sin(th)]);
			pts.push(`${p[0].toFixed(1)} ${p[1].toFixed(1)}`);
		}
		return { d: 'M ' + pts.join(' L '), value: dth };
	}
	const up = $derived(route(1));
	const down = $derived(route(-1));

	let svg: SVGSVGElement | undefined = $state();
	let drag: 'c' | 'q' | null = null;
	function toW(e: PointerEvent): Vec2 {
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg!.getScreenCTM()!.inverse());
		return wx(p.x, p.y);
	}
	function keepInAnnulus(p: Vec2): Vec2 {
		const r = Math.hypot(p[0], p[1]);
		const rr = clamp(r, R0 + 0.12, R1 - 0.08);
		return r > 0 ? [(p[0] / r) * rr, (p[1] / r) * rr] : [rr, 0];
	}
	function pdown(e: PointerEvent, w: 'c' | 'q') {
		drag = w;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function pmove(e: PointerEvent) {
		if (!drag) return;
		const p = keepInAnnulus(toW(e));
		if (drag === 'c') c = p;
		else q = p;
	}
	function key(e: KeyboardEvent, w: 'c' | 'q') {
		const s = 0.08;
		const m: Record<string, Vec2> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] };
		const d = m[e.key];
		if (!d) return;
		e.preventDefault();
		if (w === 'c') c = keepInAnnulus([c[0] + d[0], c[1] + d[1]]);
		else q = keepInAnnulus([q[0] + d[0], q[1] + d[1]]);
	}
	const starOutline = (() => {
		let d = '';
		for (let k = 0; k <= 360; k++) {
			const a = (TAU * k) / 360;
			const p = px([starR(a) * Math.cos(a), starR(a) * Math.sin(a)]);
			d += `${k ? 'L' : 'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)} `;
		}
		return d + 'Z';
	})();
	const o = px([0, 0]);
</script>

<div class="poincare">
	<div class="stage">
		<canvas bind:this={canvas} width={CW} height={CH} aria-hidden="true"></canvas>
		<svg bind:this={svg} viewBox="0 0 {W} {H}" role="img" aria-label="A region coloured by a potential built along rays from a centre point.">
			{#if mode === 'star'}
				<path d={starOutline} class="outline" />
				{#each rays as r, i (i)}
					<path d={r.d} class="ray" />
				{/each}
				<circle cx={o[0]} cy={o[1]} r="5" class="centre" />
			{:else}
				{@const cp = px(c)}
				{@const qp = px(q)}
				<circle cx={o[0]} cy={o[1]} r={R0 * S} class="outline" />
				<circle cx={o[0]} cy={o[1]} r={R1 * S} class="outline" />
				<circle cx={o[0]} cy={o[1]} r={R0 * S - 2} class="holefill" />
				{#each rays as r, i (i)}
					<path d={r.d} class="ray" class:blocked={r.blocked} />
				{/each}
				<path d={up.d} class="route up" />
				<path d={down.d} class="route down" />
				<g
					class="handle"
					transform="translate({cp[0]} {cp[1]})"
					role="slider"
					tabindex="0"
					aria-label="The centre c (arrow keys move it)"
					aria-valuenow={c[0]}
					onpointerdown={(e) => pdown(e, 'c')}
					onpointermove={pmove}
					onpointerup={() => (drag = null)}
					onpointercancel={() => (drag = null)}
					onkeydown={(e) => key(e, 'c')}
				>
					<circle r="17" class="hit" />
					<circle r="7" class="cknob" />
					<text x="10" y="-10" class="lbl">c</text>
				</g>
				<g
					class="handle"
					transform="translate({qp[0]} {qp[1]})"
					role="slider"
					tabindex="0"
					aria-label="The point q (arrow keys move it)"
					aria-valuenow={q[0]}
					onpointerdown={(e) => pdown(e, 'q')}
					onpointermove={pmove}
					onpointerup={() => (drag = null)}
					onpointercancel={() => (drag = null)}
					onkeydown={(e) => key(e, 'q')}
				>
					<circle r="17" class="hit" />
					<circle r="7" class="qknob" />
					<text x="10" y="-10" class="lbl">q</text>
				</g>
			{/if}
		</svg>
	</div>
	<Controls>
		<Segmented
			bind:value={mode}
			label="Region"
			options={[
				{ value: 'star', label: 'Star-shaped region' },
				{ value: 'annulus', label: 'Annulus with dθ' }
			]}
		/>
		<Timeline bind:value={reveal} duration={3} from="centre" to="whole region" label="Integrating outwards along the rays" />
	</Controls>
	<div class="readout">
		{#if mode === 'star'}
			<div class="eqs">
				<span><TeX tex={String.raw`f(p) = \int_0^1 \omega_{tp}(p)\,dt`} /></span>
				<span><TeX tex={String.raw`\Longrightarrow\quad df = \omega \ \ \text{(because } d\omega = 0\text{)}`} /></span>
			</div>
			<p class="note">Each point gets the integral of ω along the straight ray from the centre. The coloured map is the resulting potential, with its level lines; since every ray stays inside the region, every point gets a value.</p>
		{:else}
			<div class="routes">
				<span class="r up"><TeX tex={String.raw`\int_{\text{counterclockwise}} d\theta = ${fmt(up.value, 3).replace('−', '-')}`} /></span>
				<span class="r down"><TeX tex={String.raw`\int_{\text{clockwise}} d\theta = ${fmt(down.value, 3).replace('−', '-')}`} /></span>
				<span class="r diff"><TeX tex={String.raw`\text{difference} = ${fmt(up.value - down.value, 4)} = 2\pi`} /></span>
			</div>
			<p class="note">Rays from c that would cross the hole are blocked (hatched shadow). Going around instead, the two routes from c to q disagree by exactly 2π, wherever you put c and q — so no single potential can exist.</p>
		{/if}
	</div>
</div>

<style>
	.stage {
		position: relative;
		width: 100%;
		max-width: 46rem;
		margin: 0 auto;
		aspect-ratio: 640 / 400;
	}
	canvas,
	svg {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	canvas {
		image-rendering: auto;
	}
	.outline {
		fill: none;
		stroke: rgba(235, 229, 213, 0.5);
		stroke-width: 1.4;
	}
	.holefill {
		fill: rgba(10, 15, 34, 0.9);
		stroke: var(--rose);
		stroke-width: 1.6;
	}
	.ray {
		stroke: rgba(246, 220, 160, 0.38);
		stroke-width: 1;
	}
	.ray.blocked {
		stroke: rgba(242, 141, 182, 0.55);
		stroke-dasharray: 3 4;
	}
	.centre {
		fill: var(--gold-bright);
		stroke: #0a0f22;
		stroke-width: 1.5;
	}
	.route {
		fill: none;
		stroke-width: 3;
		stroke-linecap: round;
	}
	.route.up {
		stroke: var(--gold-bright);
	}
	.route.down {
		stroke: var(--teal);
		stroke-dasharray: 7 5;
	}
	.handle {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.cknob {
		fill: var(--gold-bright);
		stroke: #0a0f22;
		stroke-width: 1.5;
	}
	.qknob {
		fill: #0a0f22;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.handle:focus-visible .cknob,
	.handle:focus-visible .qknob {
		stroke: #fff;
	}
	.lbl {
		fill: var(--ink-bright);
		font-family: var(--font-body);
		font-style: italic;
		font-size: 16px;
		paint-order: stroke;
		stroke: rgba(4, 6, 14, 0.9);
		stroke-width: 3px;
	}
	.readout {
		padding: 0.8rem 1.2rem 0.4rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1rem;
		overflow-x: auto;
	}
	.eqs {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 1.6rem;
	}
	.eqs span {
		white-space: nowrap;
	}
	.routes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.6rem;
	}
	.r.up {
		color: var(--gold-bright);
	}
	.r.down {
		color: var(--teal);
	}
	.r.diff {
		color: var(--rose);
	}
	.note {
		margin: 0.4rem 0 0.4rem;
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
</style>
