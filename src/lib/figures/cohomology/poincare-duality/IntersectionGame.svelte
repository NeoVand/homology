<script lang="ts">
	// Two straight closed curves on the flat torus; count their crossings with
	// signs. The answer is always the determinant p₁q₂ − p₂q₁ — and it equals
	// the cup product of their Poincaré duals, computed on a triangulation.
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { arcCrossings, fenceCochain, squareModel, torusLine, type Pt } from '../cup-product/flat';
	import { cup11, evaluate, orientTriangles } from '../cup-product/cup';
	import { boxMap, pathD } from '../cup-product/draw';

	let p1 = $state(1);
	let q1 = $state(2);
	let p2 = $state(2);
	let q2 = $state(1);
	let shift = $state(0.18);

	const X = 70;
	const Y = 40;
	const S = 320;
	const map = boxMap(0, 1, 0, 1, X, Y, S, S);
	const grid = squareModel('torus', 7);
	const T = orientTriangles(grid.D)!;

	const C1 = $derived(torusLine(p1, q1, 0.137, 0.291));
	// (the tiny irrational offset keeps the curve off the vertices of the hidden 7 × 7 triangulation)
	const C2 = $derived(torusLine(p2, q2, 0.613 + shift + 0.000731, 0.457));
	const cross = $derived(arcCrossings(C1, C2));
	const signedSum = $derived(cross.reduce((s, c) => s + c.sign, 0));
	const det = $derived(p1 * q2 - p2 * q1);
	const cupValue = $derived(p1 || q1 ? (p2 || q2 ? evaluate(cup11(grid.D, fenceCochain(grid, C1), fenceCochain(grid, C2)), T) : 0) : 0);
	const pos = $derived(cross.filter((c) => c.sign > 0).length);
	const neg = $derived(cross.length - pos);

	/** arrowheads along a curve, showing its direction of travel */
	function arrows(arcs: Pt[][]): string {
		const out: string[] = [];
		for (const arc of arcs) {
			const a = map(arc[0]);
			const b = map(arc[arc.length - 1]);
			const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
			if (L < 40) continue;
			const ux = (b[0] - a[0]) / L;
			const uy = (b[1] - a[1]) / L;
			const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
			out.push(
				`M${m[0] - ux * 8 - uy * 6} ${m[1] - uy * 8 + ux * 6} L${m[0] + ux * 4} ${m[1] + uy * 4} L${m[0] - ux * 8 + uy * 6} ${m[1] - uy * 8 - ux * 6}`
			);
		}
		return out.join(' ');
	}
	function bump(which: 'p1' | 'q1' | 'p2' | 'q2', d: number) {
		const clamp = (v: number) => Math.max(-3, Math.min(3, v + d));
		if (which === 'p1') p1 = clamp(p1);
		if (which === 'q1') q1 = clamp(q1);
		if (which === 'p2') p2 = clamp(p2);
		if (which === 'q2') q2 = clamp(q2);
	}
	const zero1 = $derived(!p1 && !q1);
	const zero2 = $derived(!p2 && !q2);
	const steppers = [
		{ k: 'p1' as const, lbl: 'p_1', col: 'gold' },
		{ k: 'q1' as const, lbl: 'q_1', col: 'gold' },
		{ k: 'p2' as const, lbl: 'p_2', col: 'teal' },
		{ k: 'q2' as const, lbl: 'q_2', col: 'teal' }
	];
	const val = (k: 'p1' | 'q1' | 'p2' | 'q2') => (k === 'p1' ? p1 : k === 'q1' ? q1 : k === 'p2' ? p2 : q2);
	const fmt = (v: number) => (v < 0 ? `−${-v}` : `${v}`);
	const detTeX = $derived(
		`C_1\\cdot C_2 = \\det\\begin{pmatrix} ${p1} & ${q1}\\\\ ${p2} & ${q2}\\end{pmatrix} = ${p1}\\cdot${q2 < 0 ? `(${q2})` : q2} - ${p2}\\cdot${q1 < 0 ? `(${q1})` : q1} = ${det}`
	);
</script>

<div class="ig">
	<div class="pic">
		<Svg viewBox="0 0 460 400" maxHeight={420} label="The torus as a square with opposite sides glued, carrying two straight closed curves, a gold one and a teal one. Their crossing points are marked with plus or minus signs.">
			<defs>
				<filter id="ig-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="460" height="400">
					<feGaussianBlur stdDeviation="2.4" result="g" />
					<feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
			</defs>
			<GluingSquare
				preset="torus"
				x={X}
				y={Y}
				size={S}
				sides={{
					bottom: { label: 'a', dir: 1, marks: 1, color: 'rgba(235,229,213,0.75)' },
					top: { label: 'a', dir: 1, marks: 1, color: 'rgba(235,229,213,0.75)' },
					left: { label: 'b', dir: 1, marks: 2, color: 'rgba(235,229,213,0.75)' },
					right: { label: 'b', dir: 1, marks: 2, color: 'rgba(235,229,213,0.75)' }
				}}
			/>
			{#each C1 as arc, k (k)}
				<path d={pathD(arc, map)} class="curve" style="--c:var(--gold-bright)" filter="url(#ig-glow)" />
			{/each}
			<path d={arrows(C1)} class="arr" style="--c:var(--gold-bright)" />
			{#each C2 as arc, k (k)}
				<path d={pathD(arc, map)} class="curve" style="--c:var(--teal)" filter="url(#ig-glow)" />
			{/each}
			<path d={arrows(C2)} class="arr" style="--c:var(--teal)" />
			{#each cross as c, k (k)}
				{@const pt = map(c.p)}
				<circle cx={pt[0]} cy={pt[1]} r="10" class="halo" />
				<circle cx={pt[0]} cy={pt[1]} r="4.8" class="dot" class:neg={c.sign < 0} />
				<text x={pt[0] + 8} y={pt[1] - 8} class="sgn" class:neg={c.sign < 0}>{c.sign > 0 ? '+' : '−'}</text>
			{/each}
		</Svg>
	</div>
	<div class="side ui">
		<div class="steppers">
			{#each steppers as s (s.k)}
				<div class="st {s.col}">
					<span class="nm"><TeX tex={s.lbl} /></span>
					<button aria-label="decrease {s.k}" onclick={() => bump(s.k, -1)}>−</button>
					<span class="n nums">{fmt(val(s.k))}</span>
					<button aria-label="increase {s.k}" onclick={() => bump(s.k, 1)}>+</button>
				</div>
			{/each}
		</div>
		<p class="lg">
			<span class="gold">Gold</span> curve \(C_1\) goes \(p_1\) times around horizontally and \(q_1\) times vertically;
			<span class="teal">teal</span> \(C_2\) likewise with \(p_2, q_2\).
		</p>
		<Slider bind:value={shift} min={0} max={0.999} step={0.001} label="slide the teal curve" format={(v) => v.toFixed(2)} />
		{#if zero1 || zero2}
			<p class="warn">Choose a nonzero class for both curves.</p>
		{:else}
			<div class="read" aria-live="polite">
				<div class="k">crossings</div>
				<div>{cross.length} in all: <span class="pos">{pos} positive</span>, <span class="negc">{neg} negative</span> → signed sum <strong>{fmt(signedSum)}</strong></div>
				<div class="k">intersection number</div>
				<TeX tex={detTeX} />
				<div class="k">cup product of the duals (7 × 7 triangulation)</div>
				<TeX tex={`\\langle \\mathrm{PD}[C_1]\\smile\\mathrm{PD}[C_2],\\,[T^2]\\rangle = ${cupValue}`} />
			</div>
		{/if}
	</div>
</div>

<style>
	.ig {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		padding: 0.6rem 1.1rem 1rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.ig {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.curve {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.8;
		stroke-linecap: round;
	}
	.arr {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.halo {
		fill: var(--rose);
		opacity: 0.28;
		filter: blur(3px);
	}
	.dot {
		fill: var(--rose);
		stroke: #fff4f8;
		stroke-width: 1.1;
	}
	.dot.neg {
		fill: #0c1222;
		stroke: var(--rose);
		stroke-width: 2;
	}
	.sgn {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 15px;
		fill: var(--rose);
	}
	.side {
		display: grid;
		gap: 0.7rem;
		align-content: center;
	}
	.steppers {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, max-content));
		gap: 0.45rem 1rem;
	}
	.st {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		border: 1px solid var(--line-faint);
		border-radius: 10px;
		padding: 0.15rem 0.25rem 0.15rem 0.6rem;
	}
	.st.gold .nm {
		color: var(--gold-bright);
	}
	.st.teal .nm {
		color: var(--teal);
	}
	.nm {
		min-width: 1.6rem;
	}
	.st button {
		width: 2rem;
		height: 2rem;
		border: 0;
		border-radius: 8px;
		background: rgba(216, 178, 110, 0.08);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1rem;
	}
	.st button:hover {
		background: rgba(216, 178, 110, 0.2);
	}
	.n {
		min-width: 1.7rem;
		text-align: center;
		font-weight: 650;
		color: var(--ink-bright);
	}
	.lg {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
	.gold {
		color: var(--gold-bright);
	}
	.teal {
		color: var(--teal);
	}
	.read {
		display: grid;
		gap: 0.2rem;
		color: var(--ink-bright);
		font-size: 0.88rem;
		overflow-x: auto;
	}
	.k {
		font-size: 0.64rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-top: 0.35rem;
	}
	.pos {
		color: var(--rose);
	}
	.negc {
		color: var(--ink-dim);
	}
	.warn {
		margin: 0;
		color: var(--amber);
		font-size: 0.85rem;
	}
</style>
