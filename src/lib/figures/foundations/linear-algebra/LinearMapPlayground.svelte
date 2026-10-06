<script lang="ts">
	// Drag where the two basis vectors land; the whole grid follows.
	// When the two columns line up, the plane is flattened: the image (gold)
	// is a line and the kernel (teal) is a line that gets crushed to 0.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Handle from './Handle.svelte';
	import Arrow from './Arrow.svelte';
	import { makeView, clipLine, lerp2, snap2, clamp, matTeX, tfmt, C, easeInOut, len, mul, add, type V2 } from './geom';

	const view = makeView(480, 480, 52);
	let svg = $state<SVGSVGElement>();

	let c1 = $state<V2>([1.5, 0.5]);
	let c2 = $state<V2>([-0.5, 1]);
	// how far the map has been applied: 0 is the plane before, 1 after
	let t = $state(1);
	let playing = $state(false);

	let reduced = false;
	let raf = 0;
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		return () => cancelAnimationFrame(raf);
	});

	const EPS = 1e-6;
	const m1 = $derived(lerp2([1, 0], c1, t));
	const m2 = $derived(lerp2([0, 1], c2, t));
	const det = $derived(c1[0] * c2[1] - c1[1] * c2[0]);
	const zero1 = $derived(len(c1) < EPS);
	const zero2 = $derived(len(c2) < EPS);
	const rank = $derived(Math.abs(det) > EPS ? 2 : zero1 && zero2 ? 0 : 1);

	const unit = (v: V2): V2 => {
		const L = len(v);
		return L < EPS ? [0, 0] : [v[0] / L, v[1] / L];
	};
	// kernel direction for rank 1: a non-zero x with x₁·c₁ + x₂·c₂ = 0
	const kdir = $derived.by<V2>(() => {
		if (rank !== 1) return [0, 0];
		const a = c1[0];
		const b = c2[0];
		const c = c1[1];
		const d = c2[1];
		return unit(Math.hypot(a, b) > EPS ? [b, -a] : [d, -c]);
	});
	const idir = $derived(rank === 1 ? unit(zero1 ? c2 : c1) : ([0, 0] as V2));

	// the deformed grid: images of the lines x = k and y = k
	const K = 12;
	const gridLines = $derived.by(() => {
		const out: { a: V2; b: V2; axis: boolean }[] = [];
		for (let k = -K; k <= K; k++) {
			const l1 = clipLine(view, mul(k, m1), m2);
			if (l1) out.push({ a: l1[0], b: l1[1], axis: k === 0 });
			const l2 = clipLine(view, mul(k, m2), m1);
			if (l2) out.push({ a: l2[0], b: l2[1], axis: k === 0 });
		}
		return out;
	});
	const staticGrid = (() => {
		const out: { a: V2; b: V2; axis: boolean }[] = [];
		for (let k = -6; k <= 6; k++) {
			out.push({ a: [k, view.ymin], b: [k, view.ymax], axis: k === 0 });
			out.push({ a: [view.xmin, k], b: [view.xmax, k], axis: k === 0 });
		}
		return out;
	})();

	const ghostKernel = $derived(rank === 1 ? clipLine(view, [0, 0], kdir, 0) : null);
	const imageLine = $derived(rank === 1 ? clipLine(view, [0, 0], idir, 0) : null);
	// the kernel line, carried along by the map: it shrinks onto the origin
	const kernelNow = $derived.by(() => {
		if (rank !== 1) return null;
		const s = (1 - t) * 14;
		return [mul(-s, kdir), mul(s, kdir)] as [V2, V2];
	});
	const kernelDots = $derived(
		rank === 1 ? [-3, -2, -1, 1, 2, 3].map((j) => mul((1 - t) * j * 1.3, kdir)) : []
	);

	/** a point on a line through 0, pulled inside the canvas, for a label */
	const labelAt = (d: V2, r: number): V2 => {
		const p = mul(r, d);
		return [clamp(p[0], view.xmin + 0.9, view.xmax - 0.9), clamp(p[1], view.ymin + 0.5, view.ymax - 0.5)];
	};
	/** of the two ends of a line through 0, the one farther from the given points */
	const freeEnd = (d: V2, avoid: V2[]): V2 => {
		const a = labelAt(d, 4.4);
		const b = labelAt(d, -4.4);
		const gap = (p: V2) => Math.min(...avoid.map((q) => Math.hypot(p[0] - q[0], p[1] - q[1])));
		return gap(a) >= gap(b) ? a : b;
	};
	const imgTag = $derived(rank === 1 ? freeEnd(idir, [m1, m2]) : ([0, 0] as V2));
	const kerTag = $derived(rank === 1 ? freeEnd(kdir, [m1, m2, imgTag]) : ([0, 0] as V2));

	function setCol(which: 1 | 2, w: V2) {
		// the arrows are on the move while the map plays; take hold of them after
		if (playing) return;
		cancelAnimationFrame(raf);
		t = 1;
		const v = snap2([clamp(w[0], -4.5, 4.5), clamp(w[1], -4.5, 4.5)], 0.5);
		if (which === 1) c1 = v;
		else c2 = v;
	}

	function animateTo(n1: V2, n2: V2) {
		cancelAnimationFrame(raf);
		const f1: V2 = [...c1];
		const f2: V2 = [...c2];
		const f0 = t;
		// while the map plays, the timeline owns t; otherwise finish it along with the columns
		const ownT = !playing;
		const t0 = performance.now();
		const dur = reduced ? 0 : 750;
		const step = (now: number) => {
			const u = dur ? Math.min(1, (now - t0) / dur) : 1;
			const e = easeInOut(u);
			c1 = lerp2(f1, n1, e);
			c2 = lerp2(f2, n2, e);
			if (ownT) t = f0 + (1 - f0) * e;
			if (u < 1) raf = requestAnimationFrame(step);
			else {
				c1 = n1;
				c2 = n2;
			}
		};
		raf = requestAnimationFrame(step);
	}

	const presets: { label: string; c1: V2; c2: V2 }[] = [
		{ label: 'Identity', c1: [1, 0], c2: [0, 1] },
		{ label: 'Rotate 90°', c1: [0, 1], c2: [-1, 0] },
		{ label: 'Shear', c1: [1, 0], c2: [1, 1] },
		{ label: 'Stretch', c1: [2, 0], c2: [0, 0.5] },
		{ label: 'Reflect', c1: [0, 1], c2: [1, 0] },
		{ label: 'Flatten', c1: [1, 2], c2: [2, 4] },
		{ label: 'Zero', c1: [0, 0], c2: [0, 0] }
	];

	const matrixTeX = $derived('A = ' + matTeX(c1, c2, [C.violet, C.blue], 2));
	const detTeX = $derived(
		`\\det A = ${tfmt(c1[0])}\\cdot ${paren(c2[1])} - ${paren(c2[0])}\\cdot ${paren(c1[1])} = ${tfmt(det, 3)}`
	);
	function paren(x: number) {
		const s = tfmt(x);
		return x < 0 ? `(${s})` : s;
	}

	const tip = (v: V2, other: V2): V2 => {
		// place a label a little beyond the tip, away from the other vector
		const u = unit(v);
		const o = unit(other);
		const side: V2 = [u[0] - 0.35 * o[0], u[1] - 0.35 * o[1]];
		const s = unit(side);
		return add(v, mul(0.62, s[0] || s[1] ? s : [0.7, 0.7]));
	};
</script>

<div class="lmp">
	<div class="canvas">
		<Svg
			viewBox="0 0 {view.w} {view.h}"
			maxHeight={520}
			bind:svg
			label="A square grid in the plane, deformed by a linear map. Two draggable arrows show where the basis vectors e1 and e2 land; when they line up, the plane flattens onto a gold line and a teal line is crushed to the origin."
		>
			<defs>
				<radialGradient id="lmp-vignette" cx="50%" cy="50%" r="70%">
					<stop offset="0.6" stop-color="#000" stop-opacity="0" />
					<stop offset="1" stop-color="#000" stop-opacity="0.45" />
				</radialGradient>
			</defs>

			<!-- the original grid, faint -->
			<g class="static">
				{#each staticGrid as g, i (i)}
					<line x1={view.X(g.a[0])} y1={view.Y(g.a[1])} x2={view.X(g.b[0])} y2={view.Y(g.b[1])} class:axis={g.axis} />
				{/each}
			</g>

			{#if rank === 0}
				<rect x="0" y="0" width={view.w} height={view.h} fill={C.teal} opacity={0.1 * t} />
			{/if}

			<!-- the deformed grid -->
			<g class="moving">
				{#each gridLines as g, i (i)}
					<line x1={view.X(g.a[0])} y1={view.Y(g.a[1])} x2={view.X(g.b[0])} y2={view.Y(g.b[1])} class:axis={g.axis} />
				{/each}
			</g>

			<!-- image of the unit square -->
			<polygon
				class="square"
				class:flipped={det < 0}
				points="{view.P([0, 0])} {view.P(m1)} {view.P(add(m1, m2))} {view.P(m2)}"
			/>

			{#if rank === 1 && imageLine}
				<g style="opacity:{0.25 + 0.75 * t}">
					<line
						class="img-halo"
						x1={view.X(imageLine[0][0])}
						y1={view.Y(imageLine[0][1])}
						x2={view.X(imageLine[1][0])}
						y2={view.Y(imageLine[1][1])}
					/>
					<line
						class="img"
						x1={view.X(imageLine[0][0])}
						y1={view.Y(imageLine[0][1])}
						x2={view.X(imageLine[1][0])}
						y2={view.Y(imageLine[1][1])}
					/>
				</g>
				<text class="tag gold" x={view.X(imgTag[0])} y={view.Y(imgTag[1]) - 10} text-anchor="middle">image</text>
			{/if}

			{#if rank === 1 && ghostKernel && kernelNow}
				<line
					class="ker-ghost"
					x1={view.X(ghostKernel[0][0])}
					y1={view.Y(ghostKernel[0][1])}
					x2={view.X(ghostKernel[1][0])}
					y2={view.Y(ghostKernel[1][1])}
				/>
				<line
					class="ker-halo"
					x1={view.X(kernelNow[0][0])}
					y1={view.Y(kernelNow[0][1])}
					x2={view.X(kernelNow[1][0])}
					y2={view.Y(kernelNow[1][1])}
				/>
				<line
					class="ker"
					x1={view.X(kernelNow[0][0])}
					y1={view.Y(kernelNow[0][1])}
					x2={view.X(kernelNow[1][0])}
					y2={view.Y(kernelNow[1][1])}
				/>
				{#each kernelDots as d, i (i)}
					<circle class="ker-dot" cx={view.X(d[0])} cy={view.Y(d[1])} r="3.6" />
				{/each}
				<text class="tag teal" x={view.X(kerTag[0])} y={view.Y(kerTag[1]) + 18} text-anchor="middle">kernel</text>
			{/if}

			<!-- the origin: where the kernel goes -->
			<circle cx={view.X(0)} cy={view.Y(0)} r={rank < 2 ? 6 : 4} class="origin" class:crushed={rank < 2} />

			<Arrow {view} to={m2} color={C.blue} width={3.2} />
			<Arrow {view} to={m1} color={C.violet} width={3.2} />

			{#if len(m1) > 0.3}
				{@const p = tip(m1, m2)}
				<SvgTeX x={view.X(p[0])} y={view.Y(p[1])} tex={t > 0.5 ? 'A\\mathbf{e}_1' : '\\mathbf{e}_1'} color={C.violet} size={17} w={70} />
			{/if}
			{#if len(m2) > 0.3}
				{@const p = tip(m2, m1)}
				<SvgTeX x={view.X(p[0])} y={view.Y(p[1])} tex={t > 0.5 ? 'A\\mathbf{e}_2' : '\\mathbf{e}_2'} color={C.blue} size={17} w={70} />
			{/if}

			<rect x="0" y="0" width={view.w} height={view.h} fill="url(#lmp-vignette)" pointer-events="none" />

			<Handle {view} {svg} pos={m1} color={C.violet} label="where e1 lands: first column of A" onmove={(w) => setCol(1, w)} />
			<Handle {view} {svg} pos={m2} color={C.blue} label="where e2 lands: second column of A" onmove={(w) => setCol(2, w)} />
		</Svg>
	</div>

	<div class="side ui">
		<div class="mat"><TeX tex={matrixTeX} display /></div>
		<p class="cols">
			<span class="v">Column 1</span> = where <TeX tex={'\\mathbf e_1'} /> lands. <span class="b">Column 2</span> = where
			<TeX tex={'\\mathbf e_2'} /> lands.
		</p>
		<div class="det"><TeX tex={detTeX} /></div>

		<div class="dims" aria-label="rank {rank}, nullity {2 - rank}">
			<div class="dimrow">
				<span class="dimlbl">the two input directions:</span>
				{#each [0, 1] as i (i)}
					<span class="cell" class:img={i < rank} class:ker={i >= rank}>{i < rank ? 'survives' : 'crushed'}</span>
				{/each}
			</div>
			<div class="dimtext">
				<TeX tex={`2 = \\underbrace{${rank}}_{\\text{rank}} + \\underbrace{${2 - rank}}_{\\text{nullity}}`} />
			</div>
		</div>

		<p class="explain">
			{#if rank === 2}
				Nothing is flattened: different inputs land in different places. The kernel is just
				<TeX tex={'\\{\\mathbf 0\\}'} />, and the image is the whole plane.
				{#if det < 0}The determinant is negative: the map also flips the plane over, like a mirror.{/if}
			{:else if rank === 1}
				The columns lie on one line, so the whole plane is flattened onto the <span class="g">gold image line</span>. The
				<span class="t">teal kernel line</span> is crushed to the single point <TeX tex={'\\mathbf 0'} />. Play the map
				below to watch it happen.
			{:else}
				Every vector is sent to <TeX tex={'\\mathbf 0'} />: the image is a single point and the kernel is the whole plane.
			{/if}
		</p>
	</div>
</div>

<Controls>
	<div class="presets">
		{#each presets as p (p.label)}
			<Button variant="subtle" onclick={() => animateTo(p.c1, p.c2)}>{p.label}</Button>
		{/each}
	</div>
	<Timeline bind:value={t} bind:playing duration={1.4} from="before" to="after" label="Applying the map to the plane" />
</Controls>

<style>
	.lmp {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 1.2rem;
		align-items: center;
		padding: 1rem 1.2rem 0.6rem;
	}
	@container figure (max-width: 720px) {
		.lmp {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.6rem 0.6rem 0.4rem;
		}
	}
	.canvas {
		border-radius: 10px;
		overflow: hidden;
		background: radial-gradient(circle at 50% 45%, rgba(40, 56, 110, 0.35), rgba(5, 8, 18, 0.2) 70%);
	}
	.static line {
		stroke: rgba(235, 229, 213, 0.07);
		stroke-width: 1;
	}
	.static line.axis {
		stroke: rgba(235, 229, 213, 0.22);
	}
	.moving line {
		stroke: rgba(116, 169, 255, 0.3);
		stroke-width: 1.1;
	}
	.moving line.axis {
		stroke: rgba(190, 215, 255, 0.75);
		stroke-width: 1.6;
	}
	.square {
		fill: rgba(164, 147, 255, 0.16);
		stroke: rgba(164, 147, 255, 0.5);
		stroke-width: 1;
		stroke-linejoin: round;
	}
	.square.flipped {
		fill: rgba(242, 141, 182, 0.14);
		stroke: rgba(242, 141, 182, 0.5);
	}
	.img {
		stroke: var(--gold-bright);
		stroke-width: 3;
		stroke-linecap: round;
	}
	.img-halo {
		stroke: var(--gold-bright);
		stroke-width: 12;
		opacity: 0.18;
		stroke-linecap: round;
	}
	.ker-ghost {
		stroke: var(--teal);
		stroke-width: 1.5;
		stroke-dasharray: 5 6;
		opacity: 0.45;
	}
	.ker {
		stroke: var(--teal);
		stroke-width: 3;
		stroke-linecap: round;
	}
	.ker-halo {
		stroke: var(--teal);
		stroke-width: 12;
		opacity: 0.2;
		stroke-linecap: round;
	}
	.ker-dot {
		fill: #dffaf7;
		stroke: var(--teal);
		stroke-width: 1.5;
	}
	.origin {
		fill: var(--ink-bright);
	}
	.origin.crushed {
		fill: var(--teal);
		filter: drop-shadow(0 0 7px var(--teal));
	}
	.tag {
		font-family: var(--font-ui);
		font-size: 12px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		font-weight: 600;
	}
	.tag.gold {
		fill: var(--gold-bright);
	}
	.tag.teal {
		fill: var(--teal);
	}
	.side {
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.mat :global(.math-block) {
		margin: 0.2rem 0 0.4rem;
	}
	.mat :global(.katex-display > .katex) {
		font-size: 1.35em;
	}
	.cols {
		margin: 0 0 0.6rem;
	}
	.v {
		color: var(--violet);
		font-weight: 600;
	}
	.b {
		color: var(--blue);
		font-weight: 600;
	}
	.g {
		color: var(--gold-bright);
		font-weight: 600;
	}
	.t {
		color: var(--teal);
		font-weight: 600;
	}
	.det {
		color: var(--ink);
		margin-bottom: 0.8rem;
		overflow-x: auto;
	}
	.dims {
		display: flex;
		align-items: center;
		gap: 0.9rem;
		flex-wrap: wrap;
		margin-bottom: 0.6rem;
	}
	.dimrow {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.dimlbl {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.cell {
		padding: 0.1rem 0.6rem;
		border-radius: 999px;
		font-size: 0.74rem;
		font-weight: 600;
	}
	.cell.img {
		border: 1px solid rgba(242, 208, 143, 0.55);
		color: var(--gold-bright);
	}
	.cell.ker {
		border: 1px solid rgba(95, 214, 207, 0.55);
		color: var(--teal);
	}
	.dimtext {
		color: var(--ink);
	}
	.explain {
		margin: 0;
		color: var(--ink-dim);
		min-height: 5.5em;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		width: 100%;
	}
</style>
