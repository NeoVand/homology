<script lang="ts">
	// Two straight closed curves on the flat torus; count their crossings with
	// signs. The answer is always the determinant p₁q₂ − p₂q₁ — and it equals
	// the cup product of their Poincaré duals, computed on a triangulation.
	// Drag the teal curve (or its bead) to slide it across the torus.
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Handle from '$lib/components/svg/Handle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { untrack } from 'svelte';
	import { arcCrossings, fenceCochain, squareModel, torusLine, type Pt } from '../cup-product/flat';
	import { cup11, evaluate, orientTriangles } from '../cup-product/cup';
	import { boxMap, pathD } from '../cup-product/draw';

	let p1 = $state(1);
	let q1 = $state(2);
	let p2 = $state(2);
	let q2 = $state(1);
	// a point the teal curve passes through, in the unit square
	let at = $state<Pt>([0.793, 0.457]);

	const X = 70;
	const Y = 40;
	const S = 320;
	const map = boxMap(0, 1, 0, 1, X, Y, S, S);
	const grid = squareModel('torus', 7);
	const T = orientTriangles(grid.D)!;

	const C1 = $derived(torusLine(p1, q1, 0.137, 0.291));
	// (the tiny irrational offset keeps the curve off the vertices of the hidden 7 × 7 triangulation)
	const C2 = $derived(torusLine(p2, q2, at[0] + 0.000731, at[1] + 0.000419));
	const cross = $derived(arcCrossings(C1, C2));
	const signedSum = $derived(cross.reduce((s, c) => s + c.sign, 0));
	const det = $derived(p1 * q2 - p2 * q1);
	const cupValue = $derived(p1 || q1 ? (p2 || q2 ? evaluate(cup11(grid.D, fenceCochain(grid, C1), fenceCochain(grid, C2)), T) : 0) : 0);
	const pos = $derived(cross.filter((c) => c.sign > 0).length);
	const neg = $derived(cross.length - pos);

	// dragging: the square is the torus, so positions wrap around
	const frac = (x: number) => x - Math.floor(x);
	const wrap = (d: number) => d - Math.round(d);
	function nudge(dx: number, dy: number) {
		at = [frac(at[0] + dx / S), frac(at[1] - dy / S)];
	}

	// the bead rides the teal curve at at + s·(p₂, q₂)/g, where it hides no
	// crossing, arrowhead or edge; s is chosen afresh only when the classes change
	const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a));
	const run2 = $derived.by((): Pt => {
		const g = gcd(p2, q2) || 1;
		return [p2 / g, q2 / g];
	});
	const beadAt = (s: number): Pt => [frac(at[0] + s * run2[0]), frac(at[1] + s * run2[1])];
	const beadS = $derived.by(() => {
		void [p1, q1, p2, q2];
		return untrack(() => {
			const mid = (a: Pt[]): Pt => [(a[0][0] + a[a.length - 1][0]) / 2, (a[0][1] + a[a.length - 1][1]) / 2];
			const avoid = [...cross.map((c) => c.p), ...C1.map(mid), ...C2.map(mid)];
			let best = 0;
			let top = -1;
			for (let i = 0; i < 120; i++) {
				const [x, y] = beadAt(i / 120);
				let clear = 1.5 * Math.min(x, 1 - x, y, 1 - y);
				for (const a of avoid) clear = Math.min(clear, Math.hypot(x - a[0], y - a[1]));
				if (clear > top) ((top = clear), (best = i / 120));
			}
			return best;
		});
	});
	function dragBead([px, py]: [number, number]) {
		const [hx, hy] = beadAt(beadS);
		at = [frac(at[0] + wrap((px - X) / S - hx)), frac(at[1] + wrap(1 - (py - Y) / S - hy))];
	}

	// each crossing's sign sits in the wider gap between the two curves, above the crossing
	const signDir = $derived.by((): [number, number] => {
		const unit = (v: [number, number]): [number, number] => {
			const L = Math.hypot(v[0], v[1]) || 1;
			return [v[0] / L, v[1] / L];
		};
		const d1 = unit([p1, -q1]);
		const d2 = unit([p2, -q2]);
		const acute = d1[0] * d2[0] + d1[1] * d2[1] > 0;
		const b = unit(acute ? [d1[0] - d2[0], d1[1] - d2[1]] : [d1[0] + d2[0], d1[1] + d2[1]]);
		return b[1] > 1e-9 || (Math.abs(b[1]) <= 1e-9 && b[0] < 0) ? [-b[0], -b[1]] : b;
	});
	let last: [number, number] | null = null;
	let held = $state(false);
	function svgPoint(e: PointerEvent): [number, number] | null {
		const m = (e.currentTarget as SVGGElement).ownerSVGElement?.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [p.x, p.y];
	}
	function grab(e: PointerEvent) {
		if (e.button !== 0) return;
		e.preventDefault();
		(e.currentTarget as SVGGElement).setPointerCapture(e.pointerId);
		last = svgPoint(e);
		held = true;
	}
	function drag(e: PointerEvent) {
		const p = last && svgPoint(e);
		if (!last || !p) return;
		nudge(p[0] - last[0], p[1] - last[1]);
		last = p;
	}
	function drop() {
		last = null;
		held = false;
	}

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
	const zero1 = $derived(p1 === 0 && q1 === 0);
	const zero2 = $derived(p2 === 0 && q2 === 0);
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
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g class="grab" class:held onpointerdown={grab} onpointermove={drag} onpointerup={drop} onpointercancel={drop}>
				{#each C2 as arc, k (k)}
					<path d={pathD(arc, map)} />
				{/each}
			</g>
			{#each cross as c, k (k)}
				{@const pt = map(c.p)}
				<circle cx={pt[0]} cy={pt[1]} r="10" class="halo" />
				<circle cx={pt[0]} cy={pt[1]} r="4.8" class="dot" class:neg={c.sign < 0} />
				<text x={pt[0] + 15 * signDir[0]} y={pt[1] + 15 * signDir[1]} class="sgn" class:neg={c.sign < 0}>{c.sign > 0 ? '+' : '−'}</text>
			{/each}
			{#if !zero2}
				{@const h = map(beadAt(beadS))}
				<Handle
					x={h[0]}
					y={h[1]}
					color="var(--teal)"
					r={8}
					label="Teal curve C₂: drag or use the arrow keys to slide it"
					valuetext={zero1 ? undefined : `${cross.length} ${cross.length === 1 ? 'crossing' : 'crossings'}, signed sum ${fmt(signedSum)}`}
					ondrag={dragBead}
					onkey={(dx, dy) => nudge(dx * 4, dy * 4)}
				/>
			{/if}
		</Svg>
	</div>
	<div class="side ui">
		<div class="steppers">
			<Stepper bind:value={p1} min={-3} max={3} label="p₁" />
			<Stepper bind:value={q1} min={-3} max={3} label="q₁" />
			<Stepper bind:value={p2} min={-3} max={3} label="p₂" color="var(--teal)" />
			<Stepper bind:value={q2} min={-3} max={3} label="q₂" color="var(--teal)" />
		</div>
		<p class="lg">
			<span class="gold">Gold</span> curve \(C_1\) goes \(p_1\) times around horizontally and \(q_1\) times vertically;
			<span class="teal">teal</span> \(C_2\) likewise with \(p_2, q_2\). Drag the teal curve to slide it around the torus.
		</p>
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
	@container figure (max-width: 760px) {
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
	.grab path {
		fill: none;
		stroke: transparent;
		stroke-width: 18;
		stroke-linecap: round;
		pointer-events: stroke;
		cursor: grab;
		touch-action: none;
	}
	.grab.held path {
		cursor: grabbing;
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
		text-anchor: middle;
		dominant-baseline: central;
		pointer-events: none;
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
