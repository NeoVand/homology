<script lang="ts">
	// A covector (a linear measurement) drawn as a stack of parallel level
	// lines; its value on a vector is the signed number of lines crossed.
	// mode "pullback": a map A: V → W, a measurement φ on W, and the pulled-back
	// measurement Aᵀφ = φ∘A on V, whose lines are the preimages of φ's lines.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Handle from './Handle.svelte';
	import Arrow from './Arrow.svelte';
	import { makeView, clipLine, snap2, clamp, tfmt, C, len, mul, type V2, type View } from './geom';

	let { mode = 'measure' }: { mode?: 'measure' | 'pullback' } = $props();

	const viewM = makeView(440, 340, 40, 190, 175);
	const viewP = makeView(300, 300, 34);

	let svgV = $state<SVGSVGElement>();
	let svgW = $state<SVGSVGElement>();

	// the measurement φ(x, y) = a·x + b·y, controlled through the point h where
	// the line φ = 1 is closest to the origin: φ = h / |h|²
	let h = $state<V2>([0.8, 0.4]);
	// (in pull-back mode v starts small, so that A v stays on the canvas for every map)
	// svelte-ignore state_referenced_locally
	let v = $state<V2>(mode === 'pullback' ? [1.5, 1] : [2.5, 1.5]);

	const phi = $derived.by<V2>(() => {
		const L2 = h[0] * h[0] + h[1] * h[1];
		return [h[0] / L2, h[1] / L2];
	});
	const ev = (f: V2, x: V2) => f[0] * x[0] + f[1] * x[1];

	type MapKey = 'shear' | 'stretch' | 'rotate' | 'flatten';
	let mapKey = $state<MapKey>('shear');
	// matrices by rows [[p, q], [r, s]]
	const maps: Record<MapKey, { label: string; M: [[number, number], [number, number]] }> = {
		shear: { label: 'shear', M: [[1, 1], [0, 1]] },
		stretch: { label: 'stretch', M: [[2, 0], [0, 0.5]] },
		rotate: { label: 'rotate', M: [[0, -1], [1, 0]] },
		flatten: { label: 'flatten (rank 1)', M: [[1, 0.5], [2, 1]] }
	};
	const M = $derived(maps[mapKey].M);
	const Av = $derived<V2>([M[0][0] * v[0] + M[0][1] * v[1], M[1][0] * v[0] + M[1][1] * v[1]]);
	// Aᵀφ = φ·A as a row vector
	const pull = $derived<V2>([phi[0] * M[0][0] + phi[1] * M[1][0], phi[0] * M[0][1] + phi[1] * M[1][1]]);

	const valueW = $derived(ev(phi, mode === 'pullback' ? Av : v));

	interface Stack {
		lines: { k: number; a: V2; b: V2 }[];
		ticks: { k: number; p: V2 }[];
	}
	/** the level lines f = k that cross the view, and number labels along a ruler */
	function stack(view: View, f: V2): Stack {
		const n2 = f[0] * f[0] + f[1] * f[1];
		const out: Stack = { lines: [], ticks: [] };
		if (n2 < 1e-10) return out;
		const nf = Math.sqrt(n2);
		const dir: V2 = [-f[1], f[0]];
		const R = Math.hypot(Math.max(-view.xmin, view.xmax), Math.max(-view.ymin, view.ymax));
		const kmax = Math.min(60, Math.ceil(R * nf));
		for (let k = -kmax; k <= kmax; k++) {
			const p: V2 = [(k * f[0]) / n2, (k * f[1]) / n2];
			const l = clipLine(view, p, dir, 0);
			if (l) out.lines.push({ k, a: l[0], b: l[1] });
		}
		// number the lines along one edge of the canvas, like the marks on a ruler:
		// the top edge for steep lines, the right edge for shallow ones
		const every = Math.max(1, Math.ceil(0.62 * nf));
		const steep = Math.abs(dir[1]) >= Math.abs(dir[0]);
		for (let k = -kmax; k <= kmax; k++) {
			if (k % every !== 0) continue;
			let p: V2;
			if (steep) {
				const yT = view.ymax - 0.32;
				p = [(k - f[1] * yT) / f[0], yT];
			} else {
				const xR = view.xmax - 0.32;
				p = [xR, (k - f[0] * xR) / f[1]];
			}
			if (p[0] < view.xmin + 0.3 || p[0] > view.xmax - 0.3 || p[1] < view.ymin + 0.3 || p[1] > view.ymax - 0.3) continue;
			out.ticks.push({ k, p });
		}
		return out;
	}
	const stackM = $derived(stack(viewM, phi));
	const stackW = $derived(stack(viewP, phi));
	const stackV = $derived(stack(viewP, pull));

	/** points along 0 → x where the measurement f passes a whole number */
	function crossings(f: V2, x: V2): V2[] {
		const val = ev(f, x);
		const out: V2[] = [];
		const n = Math.floor(Math.abs(val) + 1e-9);
		for (let k = 1; k <= Math.min(n, 60); k++) out.push(mul(k / Math.abs(val), x));
		return out;
	}
	const crossM = $derived(crossings(phi, v));
	const crossW = $derived(crossings(phi, Av));
	const crossV = $derived(crossings(pull, v));

	const setH = (w: V2, view: View) => {
		let p: V2 = [clamp(w[0], view.xmin + 0.3, view.xmax - 0.3), clamp(w[1], view.ymin + 0.3, view.ymax - 0.3)];
		p = snap2(p, 0.1);
		const L = len(p);
		if (L < 0.35) p = mul(0.35 / (L || 1), L ? p : [1, 0]);
		h = p;
	};
	const setV = (w: V2, view: View) => {
		v = snap2([clamp(w[0], view.xmin + 0.3, view.xmax - 0.3), clamp(w[1], view.ymin + 0.3, view.ymax - 0.3)], 0.25);
	};
	const seg = (view: View, a: V2, b: V2) => ({ x1: view.X(a[0]), y1: view.Y(a[1]), x2: view.X(b[0]), y2: view.Y(b[1]) });
	const paren = (x: number) => (x < 0 ? `(${tfmt(x)})` : tfmt(x));
	const rowTeX = (f: V2) => `\\begin{pmatrix} ${tfmt(f[0])} & ${tfmt(f[1])} \\end{pmatrix}`;
	const matTeX2 = $derived(`\\begin{pmatrix} ${tfmt(M[0][0])} & ${tfmt(M[0][1])} \\\\ ${tfmt(M[1][0])} & ${tfmt(M[1][1])} \\end{pmatrix}`);
	const grid = (view: View) => {
		const out: { x1: number; y1: number; x2: number; y2: number; axis: boolean }[] = [];
		for (let k = Math.ceil(view.xmin); k <= Math.floor(view.xmax); k++)
			out.push({ x1: view.X(k), y1: 0, x2: view.X(k), y2: view.h, axis: k === 0 });
		for (let k = Math.ceil(view.ymin); k <= Math.floor(view.ymax); k++)
			out.push({ x1: 0, y1: view.Y(k), x2: view.w, y2: view.Y(k), axis: k === 0 });
		return out;
	};
	const gridM = grid(viewM);
	const gridP = grid(viewP);
</script>

{#snippet stackLines(view: View, st: Stack)}
	{#each st.lines as s (s.k)}
		<line {...seg(view, s.a, s.b)} class="lvl" class:zero={s.k === 0} class:pos={s.k > 0} />
	{/each}
	{#each st.ticks as t (t.k)}
		<text x={view.X(t.p[0])} y={view.Y(t.p[1])} class="ktag" class:z={t.k === 0} text-anchor="middle" dominant-baseline="central"
			>{t.k < 0 ? '−' + -t.k : t.k}</text
		>
	{/each}
{/snippet}

{#snippet gridLines(g: { x1: number; y1: number; x2: number; y2: number; axis: boolean }[])}
	{#each g as l, i (i)}
		<line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} class="grid" class:axis={l.axis} />
	{/each}
{/snippet}

{#if mode === 'measure'}
	<div class="cs">
		<Svg viewBox="0 0 {viewM.w} {viewM.h}" maxHeight={380} bind:svg={svgW} label="A family of parallel blue lines, numbered 0, 1, 2 and so on, drawn evenly across the plane: the level lines of a measurement. A violet arrow v can be dragged; gold dots mark where it crosses the lines, and their count is the value of the measurement on v.">
			{@render gridLines(gridM)}
			{@render stackLines(viewM, stackM)}
			<Arrow view={viewM} to={v} color={C.violet} width={3} />
			{#each crossM as c, i (i)}
				<circle cx={viewM.X(c[0])} cy={viewM.Y(c[1])} r="4.2" class="cross" />
			{/each}
			<circle cx={viewM.X(0)} cy={viewM.Y(0)} r="3.5" class="origin" />
			<Handle view={viewM} svg={svgW} pos={v} color={C.violet} label="tip of the vector v" onmove={(w) => setV(w, viewM)} />
			<Handle view={viewM} svg={svgW} pos={h} color={C.blue} r={6} label="the measurement: drag the line marked 1" onmove={(w) => setH(w, viewM)} step={0.1} />
			<SvgTeX x={viewM.X(v[0]) + 18} y={viewM.Y(v[1]) - 16} tex={'\\mathbf v'} color={C.violet} size={17} w={24} />
		</Svg>
	</div>
	<div class="read ui">
		<div class="eqs">
			<TeX tex={`\\varphi = ${rowTeX(phi)},\\qquad \\varphi(\\mathbf v) = ${tfmt(phi[0])}\\cdot ${paren(v[0])} + ${tfmt(phi[1])}\\cdot ${paren(v[1])} = \\textcolor{${C.gold}}{${tfmt(valueW)}}`} />
		</div>
		<p>
			The arrow crosses <strong class="g">{Math.floor(Math.abs(valueW) + 1e-9)}</strong> whole line{Math.floor(Math.abs(valueW) + 1e-9) === 1 ? '' : 's'}
			{#if Math.abs(valueW) > 1e-9}going {valueW > 0 ? 'up' : 'down'} the numbering{/if}, and the measurement reads
			<TeX tex={tfmt(valueW)} />. Drag the small blue handle (on the line marked 1) to change the measurement: pulling it
			<em>out</em> spreads the lines and makes the measurement <em>smaller</em>.
		</p>
	</div>
	<Controls>
		<Button variant="subtle" onclick={() => (h = [0.8, 0.4])}>Reset</Button>
		<Button variant="subtle" onclick={() => (h = [h[0] / 2, h[1] / 2])}>Double φ (lines twice as dense)</Button>
		<Button variant="subtle" onclick={() => (v = [-v[1], v[0]])}>Turn v by 90°</Button>
	</Controls>
{:else}
	<div class="pb">
		<div class="pane">
			<div class="ttl ui">V, with the pulled-back measurement <TeX tex={'A^{\\mathsf T}\\varphi'} /></div>
			<Svg viewBox="0 0 {viewP.w} {viewP.h}" maxHeight={330} bind:svg={svgV} label="The space V, with a draggable violet vector v and the level lines of the pulled-back measurement A-transpose phi.">
				{@render gridLines(gridP)}
				{@render stackLines(viewP, stackV)}
				<Arrow view={viewP} to={v} color={C.violet} width={2.8} head={11} />
				{#each crossV as c, i (i)}
					<circle cx={viewP.X(c[0])} cy={viewP.Y(c[1])} r="3.8" class="cross" />
				{/each}
				<circle cx={viewP.X(0)} cy={viewP.Y(0)} r="3" class="origin" />
				<Handle view={viewP} svg={svgV} pos={v} color={C.violet} label="the vector v" onmove={(w) => setV(w, viewP)} />
				<SvgTeX x={viewP.X(v[0]) + 16} y={viewP.Y(v[1]) - 14} tex={'\\mathbf v'} color={C.violet} size={16} w={24} />
			</Svg>
		</div>
		<div class="mid ui" aria-hidden="true">
			<span class="fw"><span class="h">A ⟶</span><span class="v">A ↓</span></span>
			<span class="bw"><span class="h">⟵ Aᵀ</span><span class="v">↑ Aᵀ</span></span>
		</div>
		<div class="pane">
			<div class="ttl ui">W, with the measurement <TeX tex={'\\varphi'} /></div>
			<Svg viewBox="0 0 {viewP.w} {viewP.h}" maxHeight={330} bind:svg={svgW} label="The space W, with the image A v of the vector and the level lines of the measurement phi, whose spacing and direction can be dragged.">
				{@render gridLines(gridP)}
				{@render stackLines(viewP, stackW)}
				<Arrow view={viewP} to={Av} color={C.violet} width={2.8} head={11} />
				{#each crossW as c, i (i)}
					<circle cx={viewP.X(c[0])} cy={viewP.Y(c[1])} r="3.8" class="cross" />
				{/each}
				<circle cx={viewP.X(0)} cy={viewP.Y(0)} r="3" class="origin" />
				<Handle view={viewP} svg={svgW} pos={h} color={C.blue} r={6} step={0.1} label="the measurement phi: drag the line marked 1" onmove={(w) => setH(w, viewP)} />
				<SvgTeX x={viewP.X(Av[0]) + 18} y={viewP.Y(Av[1]) - 14} tex={'A\\mathbf v'} color={C.violet} size={15} w={36} />
			</Svg>
		</div>
	</div>
	<div class="read ui">
		<div class="eqs">
			<TeX tex={`A = ${matTeX2},\\quad \\varphi = ${rowTeX(phi)},\\quad A^{\\mathsf T}\\varphi = \\varphi A = ${rowTeX(pull)}`} />
		</div>
		<div class="eqs">
			<TeX tex={`\\varphi(A\\mathbf v) = \\textcolor{${C.gold}}{${tfmt(valueW)}} = (A^{\\mathsf T}\\varphi)(\\mathbf v)`} />
		</div>
		<p>
			Same number on both sides: measuring <TeX tex={'A\\mathbf v'} /> with <TeX tex={'\\varphi'} /> is the same as measuring
			<TeX tex={'\\mathbf v'} /> with the pulled-back <TeX tex={'A^{\\mathsf T}\\varphi'} />. Its lines on the left are exactly the
			points that <TeX tex={'A'} /> sends onto the lines on the right.
			{#if len(pull) < 1e-9}<strong class="r">Here <TeX tex={'A^{\\mathsf T}\\varphi = 0'} />:</strong> <TeX tex={'\\varphi'} />
				vanishes on everything <TeX tex={'A'} /> can reach, so nothing is left to measure on the left.{/if}
		</p>
	</div>
	<Controls>
		<Segmented
			bind:value={mapKey}
			label="the map A"
			options={(Object.keys(maps) as MapKey[]).map((k) => ({ value: k, label: maps[k].label }))}
		/>
		{#if mapKey === 'flatten'}
			<Button variant="subtle" onclick={() => (h = [0.8, -0.4])}>Make φ vanish on the image</Button>
		{/if}
	</Controls>
{/if}

<style>
	.cs {
		padding: 0.9rem 1rem 0.2rem;
	}
	.pb {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 0.6rem;
		padding: 1rem 1.1rem 0.4rem;
	}
	@media (max-width: 680px) {
		.pb {
			grid-template-columns: minmax(0, 1fr);
			max-width: 24rem;
			margin: 0 auto;
		}
		.mid {
			flex-direction: row !important;
			justify-content: center;
			gap: 1.4rem !important;
		}
		.mid .h {
			display: none;
		}
		.mid .v {
			display: inline;
		}
	}
	.mid .v {
		display: none;
	}
	/* long arrows (A v for a stretching map) must not escape their panel */
	.pane :global(svg) {
		overflow: hidden;
	}
	.pane {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		border-radius: 10px;
		background: radial-gradient(circle at 50% 45%, rgba(40, 56, 110, 0.3), rgba(5, 8, 18, 0.12) 75%);
		padding: 0.5rem 0.4rem 0.4rem;
	}
	.ttl :global(.katex) {
		text-transform: none;
		letter-spacing: normal;
		font-size: 1.2em;
	}
	.ttl {
		text-align: center;
		font-size: 0.68rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
		font-weight: 600;
	}
	.mid {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		align-items: center;
		font-size: 0.85rem;
	}
	.fw {
		color: var(--violet);
	}
	.bw {
		color: var(--blue);
	}
	.grid {
		stroke: rgba(235, 229, 213, 0.06);
	}
	.grid.axis {
		stroke: rgba(235, 229, 213, 0.22);
	}
	.lvl {
		stroke: rgba(116, 169, 255, 0.42);
		stroke-width: 1.3;
	}
	.lvl.pos {
		stroke: rgba(116, 169, 255, 0.62);
	}
	.lvl.zero {
		stroke: rgba(190, 215, 255, 0.95);
		stroke-width: 2;
	}
	.cs text.ktag,
	.pane text.ktag {
		font-family: var(--font-ui);
		font-size: 12.5px;
		font-weight: 600;
		fill: rgba(190, 215, 255, 0.95);
		paint-order: stroke;
		stroke: #0b1122;
		stroke-width: 4px;
		stroke-linejoin: round;
	}
	.cs text.ktag.z,
	.pane text.ktag.z {
		fill: #ffffff;
	}

	.cross {
		fill: var(--gold-bright);
		stroke: #0b1122;
		stroke-width: 1.2;
		filter: drop-shadow(0 0 4px rgba(242, 208, 143, 0.8));
	}
	.origin {
		fill: var(--ink-bright);
	}
	.read {
		padding: 0.4rem 1.3rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.eqs {
		text-align: center;
		color: var(--ink);
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0.15rem 0;
	}
	.read p {
		margin: 0.5rem 0 0;
	}
	.g {
		color: var(--gold-bright);
	}
	.r {
		color: var(--rose);
	}
</style>
