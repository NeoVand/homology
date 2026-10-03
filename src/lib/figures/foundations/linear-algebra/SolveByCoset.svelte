<script lang="ts">
	// Solving A x = b for the rank-1 matrix A = [[1, 2], [2, 4]].
	// Left: the domain, with the kernel (teal) and — when b is reachable — the
	// solution set (gold), a copy of the kernel shifted off the origin.
	// Right: the codomain, with the image (gold line) and the target b.
	// When b is off the image, a "measurement" y with yA = 0 but y·b ≠ 0
	// certifies that there is no solution.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Handle from './Handle.svelte';
	import Arrow from './Arrow.svelte';
	import { makeView, clipLine, snap2, clamp, tfmt, C, type V2 } from './geom';

	const view = makeView(300, 300, 33);
	let svgL = $state<SVGSVGElement>();
	let svgR = $state<SVGSVGElement>();

	// A = [[1, 2], [2, 4]]: A x = (x₁ + 2x₂)·(1, 2)
	const Ax = (x: V2): V2 => [x[0] + 2 * x[1], 2 * x[0] + 4 * x[1]];
	const KER: V2 = [2, -1];
	const IMG: V2 = [1, 2];
	// y = (2, −1) satisfies yA = 0, so it measures 0 on the whole image
	const y = (v: V2) => 2 * v[0] - v[1];

	let b = $state<V2>([1.5, 3]);
	let x = $state<V2>([-0.5, 1]);

	const yb = $derived(y(b));
	const solvable = $derived(Math.abs(yb) < 1e-9);
	const s = $derived(b[0]); // when solvable, b = s·(1, 2)
	const xp = $derived<V2>([s, 0]); // a particular solution
	const ax = $derived(Ax(x));
	const hit = $derived(solvable && Math.abs(ax[0] - b[0]) < 1e-9 && Math.abs(ax[1] - b[1]) < 1e-9);

	const kerLine = clipLine(view, [0, 0], KER, 0);
	const imgLine = clipLine(view, [0, 0], IMG, 0);
	const solLine = $derived(solvable ? clipLine(view, xp, KER, 0) : null);
	// level lines of the measurement y: 2u − v = c
	const levels = Array.from({ length: 19 }, (_, i) => i - 9)
		.map((c) => ({ c, l: clipLine(view, [c / 2, 0], IMG, 0) }))
		.filter((o) => o.l);

	const grid = (() => {
		const out: { x1: number; y1: number; x2: number; y2: number; axis: boolean }[] = [];
		for (let k = -4; k <= 4; k++) {
			out.push({ x1: view.X(k), y1: 0, x2: view.X(k), y2: view.h, axis: k === 0 });
			out.push({ x1: 0, y1: view.Y(k), x2: view.w, y2: view.Y(k), axis: k === 0 });
		}
		return out;
	})();

	const lim = (v: V2): V2 => [clamp(v[0], -4, 4), clamp(v[1], -4, 4)];
	const setB = (w: V2) => (b = snap2(lim(w), 0.5));
	const setX = (w: V2) => (x = snap2(lim(w), 0.5));
	const snapB = () => {
		// project b onto the image line, then round
		const t = Math.round(((b[0] + 2 * b[1]) / 5) * 2) / 2;
		b = [t, 2 * t];
		if (Math.abs(b[1]) > 4) b = [1.5, 3];
	};
	const L = (l: [V2, V2] | null) =>
		l ? { x1: view.X(l[0][0]), y1: view.Y(l[0][1]), x2: view.X(l[1][0]), y2: view.Y(l[1][1]) } : null;
	const k1 = L(kerLine)!;
	const i1 = L(imgLine)!;
	const sl = $derived(L(solLine));
</script>

<div class="sbc">
	<div class="pane">
		<div class="ttl ui">input space: the <TeX tex={'\\mathbf x'} />’s</div>
		<Svg viewBox="0 0 {view.w} {view.h}" maxHeight={330} bind:svg={svgL} label="The input plane. A teal line through the origin is the kernel of A. When b is reachable, a gold line parallel to it holds all solutions of A x = b. A violet point x can be dragged.">
			{#each grid as g, i (i)}
				<line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} class="grid" class:axis={g.axis} />
			{/each}
			<line {...k1} class="ker-halo" />
			<line {...k1} class="ker" />
			{#if sl}
				<line {...sl} class="sol-halo" />
				<line {...sl} class="sol" />
				<circle cx={view.X(xp[0])} cy={view.Y(xp[1])} r="4.5" class="xp" />
			{/if}
			<SvgTeX x={view.X(-3.1)} y={view.Y(1.95)} tex={'\\ker A'} color={C.teal} size={14} w={60} />
			{#if solvable}
				<SvgTeX x={view.X(clamp(xp[0] + 2.6, -3.2, 3.4))} y={view.Y(-1.3 - 0.25)} tex={'\\text{solutions}'} color={C.gold} size={13} w={90} />
			{/if}
			<Arrow view={view} to={x} color={hit ? C.gold : C.violet} width={2.6} head={10} />
			<Handle view={view} svg={svgL} pos={x} color={hit ? C.gold : C.violet} label="the input vector x" onmove={setX} />
			<SvgTeX x={view.X(x[0]) + 16} y={view.Y(x[1]) - 14} tex={'\\mathbf x'} color={hit ? C.gold : C.violet} size={15} w={24} />
		</Svg>
	</div>

	<div class="mid ui" aria-hidden="true"><span class="a">A</span><span class="arr h">⟶</span><span class="arr v">↓</span></div>

	<div class="pane">
		<div class="ttl ui">output space: where <TeX tex={'A\\mathbf x'} /> lands</div>
		<Svg viewBox="0 0 {view.w} {view.h}" maxHeight={330} bind:svg={svgR} label="The output plane. The gold line through the origin is the image of A. A draggable target b is gold when it lies on the image and rose when it does not; then a family of rose level lines of the measurement y = 2u − v shows that b is out of reach.">
			{#each grid as g, i (i)}
				<line x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} class="grid" class:axis={g.axis} />
			{/each}
			{#if !solvable}
				{#each levels as o (o.c)}
					{@const ll = L(o.l)!}
					<line {...ll} class="lvl" class:zero={o.c === 0} />
				{/each}
			{/if}
			<line {...i1} class="img-halo" />
			<line {...i1} class="img" />
			<SvgTeX x={view.X(-2.25)} y={view.Y(-3.2)} tex={'\\operatorname{im} A'} color={C.gold} size={14} w={60} />
			<Arrow view={view} to={ax} color={C.violet} width={2.4} head={10} opacity={0.9} />
			<Arrow view={view} to={b} color={solvable ? C.gold : C.rose} width={2.6} head={10} dashed={!solvable} />
			<Handle view={view} svg={svgR} pos={b} color={solvable ? C.gold : C.rose} label="the target vector b" onmove={setB} />
			<SvgTeX x={view.X(b[0]) + 16} y={view.Y(b[1]) - 14} tex={'\\mathbf b'} color={solvable ? C.gold : C.rose} size={15} w={24} />
		</Svg>
	</div>
</div>

<div class="read ui">
	<div class="eq"><TeX tex={`A=\\begin{pmatrix}1&2\\\\2&4\\end{pmatrix},\\quad \\mathbf b = (${tfmt(b[0])},\\ ${tfmt(b[1])}),\\quad A\\mathbf x = (${tfmt(ax[0])},\\ ${tfmt(ax[1])})`} /></div>
	{#if solvable}
		<p class="ok">
			<strong>Solvable.</strong> One solution is <TeX tex={`\\mathbf x_p = (${tfmt(xp[0])},\\ 0)`} />, and
			<em>every</em> solution is <TeX tex={`\\mathbf x_p + t\\,(2,-1)`} />: the gold line, a copy of the teal kernel slid
			over to pass through <TeX tex={'\\mathbf x_p'} />. {#if hit}Your <TeX tex={'\\mathbf x'} /> is one of them.{:else}Drag
				<TeX tex={'\\mathbf x'} /> onto the gold line and watch <TeX tex={'A\\mathbf x'} /> land on <TeX tex={'\\mathbf b'} />.{/if}
		</p>
	{:else}
		<p class="no">
			<strong>No solution.</strong> Whatever <TeX tex={'\\mathbf x'} /> is, <TeX tex={'A\\mathbf x'} /> stays on the gold line.
			The measurement <TeX tex={'y(u,v) = 2u - v'} /> proves it: it gives 0 on both columns,
			<TeX tex={'y(1,2) = 0'} /> and <TeX tex={'y(2,4) = 0'} />, hence 0 on everything <TeX tex={'A'} /> can reach — but
			<TeX tex={`y(\\mathbf b) = ${tfmt(yb)} \\neq 0`} />. The rose lines are where <TeX tex={'y'} /> equals 0, ±1, ±2, …
		</p>
	{/if}
</div>
<Controls>
	<Button variant="subtle" onclick={snapB}>Put b on the image</Button>
	<Button variant="subtle" onclick={() => (b = [2, 1])}>Move b off the image</Button>
	<Button variant="subtle" onclick={() => (x = [...xp])} disabled={!solvable}>Jump x to a solution</Button>
</Controls>

<style>
	.sbc {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 0.6rem;
		padding: 1rem 1.1rem 0.4rem;
	}
	@media (max-width: 680px) {
		.sbc {
			grid-template-columns: minmax(0, 1fr);
			max-width: 24rem;
			margin: 0 auto;
		}
		.mid {
			flex-direction: row !important;
			justify-self: center;
			gap: 0.5rem !important;
		}
		.mid .arr.h {
			display: none;
		}
		.mid .arr.v {
			display: inline;
		}
	}
	.mid .arr.v {
		display: none;
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
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		font-weight: 600;
	}
	.mid {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--gold);
		gap: 0.1rem;
	}
	.mid .a {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 1.1rem;
	}
	.mid .arr {
		font-size: 1.5rem;
		line-height: 1;
	}
	.grid {
		stroke: rgba(235, 229, 213, 0.07);
	}
	.grid.axis {
		stroke: rgba(235, 229, 213, 0.26);
	}
	.ker {
		stroke: var(--teal);
		stroke-width: 2.4;
	}
	.ker-halo {
		stroke: var(--teal);
		stroke-width: 10;
		opacity: 0.14;
	}
	.sol {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.sol-halo {
		stroke: var(--gold-bright);
		stroke-width: 11;
		opacity: 0.18;
	}
	.xp {
		fill: var(--gold-bright);
	}
	.img {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.img-halo {
		stroke: var(--gold-bright);
		stroke-width: 11;
		opacity: 0.16;
	}
	.lvl {
		stroke: var(--rose);
		stroke-width: 1;
		opacity: 0.45;
	}
	.lvl.zero {
		opacity: 0;
	}
	.read {
		padding: 0.4rem 1.3rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.eq {
		text-align: center;
		color: var(--ink);
		overflow-x: auto;
		overflow-y: hidden;
		padding: 0.2rem 0;
	}
	.ok strong {
		color: var(--gold-bright);
	}
	.no strong {
		color: var(--rose);
	}
	.read p {
		margin: 0.5rem 0 0;
		min-height: 4.6em;
	}
</style>
