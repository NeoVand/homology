<script lang="ts">
	// The cup product on the 3×3 torus, triangle by triangle: every triangle
	// multiplies the left factor on its front edge by the right factor on its back edge.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { squareModel, fenceCochain, type Pt } from './flat';
	import { cup11 } from './cup';
	import { boxMap, coChevrons, midArrow, pathD } from './draw';

	const n = 3;
	const M = squareModel('torus', n);
	const D = M.D;
	const eps = M.triFlatSign;

	type Mode = 'ab' | 'ba' | 'aa' | 'bb';
	let mode = $state<Mode>('ab');
	let col = $state(1);
	let row = $state(1);
	let picked = $state<number | null>(null);

	const X = 70;
	const Y = 46;
	const S = 300;
	const map = boxMap(0, 1, 0, 1, X, Y, S, S);

	const alphaArc = $derived<Pt[]>([
		[(col + 0.5) / n, 0],
		[(col + 0.5) / n, 1]
	]);
	const betaArc = $derived<Pt[]>([
		[1, (row + 0.5) / n],
		[0, (row + 0.5) / n]
	]);
	const alpha = $derived(fenceCochain(M, [alphaArc]));
	const beta = $derived(fenceCochain(M, [betaArc]));
	const L = $derived(mode === 'ab' || mode === 'aa' ? alpha : beta);
	const R = $derived(mode === 'ab' || mode === 'bb' ? beta : alpha);
	const Lname = $derived(mode === 'ab' || mode === 'aa' ? '\\alpha' : '\\beta');
	const Rname = $derived(mode === 'ab' || mode === 'bb' ? '\\beta' : '\\alpha');
	const Lcol = $derived(Lname === '\\alpha' ? 'var(--gold-bright)' : 'var(--teal)');
	const Rcol = $derived(Rname === '\\alpha' ? 'var(--gold-bright)' : 'var(--teal)');
	const prod = $derived(cup11(D, L, R));
	const showAlpha = $derived(mode !== 'bb');
	const showBeta = $derived(mode !== 'aa');

	// default selection: a triangle where the product is nonzero, else the crossing cell's lower triangle
	const sel = $derived(picked ?? (prod.findIndex((x) => x !== 0) >= 0 ? prod.findIndex((x) => x !== 0) : 2 * (row * n + col)));
	const sumL = $derived(prod.reduce((s, x, t) => s + (eps[t] > 0 ? x : 0), 0));
	const sumU = $derived(prod.reduce((s, x, t) => s + (eps[t] < 0 ? x : 0), 0));
	const total = $derived(sumL - sumU);

	const selTeX = $derived.by(() => {
		const t = sel;
		const [f, b] = D.tris[t];
		const kind = eps[t] > 0 ? 'L' : 'U';
		return `(${Lname}\\smile${Rname})(\\sigma_{${kind}}) = ${Lname}(\\text{front})\\cdot${Rname}(\\text{back}) = ${L[f]}\\cdot ${R[b]} = ${prod[t]}`;
	});
	const totalTeX = $derived(
		`\\langle ${Lname}\\smile${Rname},[T^2]\\rangle = \\textstyle\\sum_{L}-\\sum_{U} = ${sumL} - ${sumU} = ${total > 0 ? '+' : ''}${total}`
	);

	const center = (t: number): Pt => {
		const [a, b, c] = M.triPts[t];
		return [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
	};
	const edgeKind = (e: number) => {
		const s = M.edgeSegs[e][0];
		return s.a[1] === s.b[1] ? 'h' : s.a[0] === s.b[0] ? 'v' : 'd';
	};
	// drag a fence sideways (α) or up and down (β); it snaps to the middle of a column or row
	let svg: SVGSVGElement | undefined = $state();
	let held = $state<'a' | 'b' | null>(null);
	function toUser(e: PointerEvent): [number, number] | null {
		const m = svg?.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [p.x, p.y];
	}
	const clampCell = (k: number) => Math.max(0, Math.min(n - 1, k));
	function grab(e: PointerEvent, which: 'a' | 'b') {
		held = which;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function slide(e: PointerEvent) {
		const p = held && toUser(e);
		if (!p) return;
		if (held === 'a') col = clampCell(Math.floor(((p[0] - X) / S) * n));
		else row = clampCell(Math.floor(((Y + S - p[1]) / S) * n));
	}
	function key(e: KeyboardEvent, which: 'a' | 'b') {
		const d = which === 'a' ? (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0) : e.key === 'ArrowUp' ? 1 : e.key === 'ArrowDown' ? -1 : 0;
		if (!d) return;
		e.preventDefault();
		if (which === 'a') col = clampCell(col + d);
		else row = clampCell(row + d);
	}

	$effect(() => {
		// reset the manual selection when the configuration changes
		void mode;
		void col;
		void row;
		picked = null;
	});
</script>

<div class="gc">
	<div class="pic">
		<Svg bind:svg viewBox="0 0 440 400" maxHeight={420} label="The torus as a square cut into 3 by 3 cells, each cell split into a lower triangle L and an upper triangle U. A gold vertical fence alpha and a teal horizontal fence beta cross in one cell; the cup product is nonzero only on one triangle there.">
<defs>
				<filter id="gc-glow" filterUnits="userSpaceOnUse" x="-40" y="-40" width="520" height="480">
					<feGaussianBlur stdDeviation="2.6" result="b" />
					<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
			</defs>
			<GluingSquare
				preset="torus"
				x={X}
				y={Y}
				size={S}
				sides={{
					bottom: { label: 'a', dir: 1, marks: 1, color: 'rgba(235,229,213,0.8)' },
					top: { label: 'a', dir: 1, marks: 1, color: 'rgba(235,229,213,0.8)' },
					left: { label: 'b', dir: 1, marks: 2, color: 'rgba(235,229,213,0.8)' },
					right: { label: 'b', dir: 1, marks: 2, color: 'rgba(235,229,213,0.8)' }
				}}
			/>
			{#each M.triPts as tri, t (t)}
				{@const v = prod[t]}
				<polygon
					points={tri.map((p) => map(p).join(',')).join(' ')}
					class="tri"
					class:hot={v !== 0}
					class:neg={v < 0}
					class:sel={t === sel}
					role="button"
					tabindex="0"
					aria-label="triangle {t}: product {v}"
					onclick={() => (picked = t)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (picked = t)}
				/>
			{/each}
			<!-- edges, coloured where the fences cross them -->
			{#each M.edgeSegs as segs, e (e)}
				{#each segs as s, k (k)}
					{@const a = map(s.a)}
					{@const b = map(s.b)}
					{@const onA = showAlpha && alpha[e] !== 0}
					{@const onB = showBeta && beta[e] !== 0}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="edge" class:ea={onA && !onB} class:eb={onB && !onA} class:eab={onA && onB} />
					{#if edgeKind(e) !== 'd' || onA || onB}
						<path d={midArrow(a, b, 4.5)} class="arr" class:ea={onA && !onB} class:eb={onB && !onA} class:eab={onA && onB} />
					{/if}
				{/each}
			{/each}
			<!-- the selected triangle's front and back faces -->
			{#if sel !== null}
				{@const [P0, P1, P2] = M.triPts[sel].map(map) as [number, number][]}
				<line x1={P0[0]} y1={P0[1]} x2={P1[0]} y2={P1[1]} stroke={Lcol} stroke-width="5" stroke-linecap="round" opacity="0.9" />
				<line x1={P1[0]} y1={P1[1]} x2={P2[0]} y2={P2[1]} stroke={Rcol} stroke-width="5" stroke-linecap="round" opacity="0.9" />
				<circle cx={P0[0]} cy={P0[1]} r="4" fill="#fff6dc" />
				<text x={P0[0] + (P0[0] < 200 ? -14 : 14)} y={P0[1] + 16} class="t-ui vl">v₀</text>
				<text x={P1[0] + 8} y={P1[1] - 8} class="t-ui vl">v₁</text>
				<text x={P2[0] + 8} y={P2[1] - 6} class="t-ui vl">v₂</text>
			{/if}
			<!-- fences -->
			{#if showAlpha}
				<g
					class="grab"
					class:held={held === 'a'}
					role="slider"
					tabindex="0"
					aria-label="Fence α: drag it sideways, or use the left and right arrow keys"
					aria-valuemin={1}
					aria-valuemax={n}
					aria-valuenow={col + 1}
					aria-valuetext="column {col + 1}"
					onpointerdown={(e) => grab(e, 'a')}
					onpointermove={slide}
					onpointerup={() => (held = null)}
					onpointercancel={() => (held = null)}
					onkeydown={(e) => key(e, 'a')}
					style="cursor: ew-resize"
				>
					<path d={pathD(alphaArc, map)} class="hit" />
				</g>
				<path d={pathD(alphaArc, map)} class="fence fa" />
				<path d={coChevrons(alphaArc, map, { spacing: 60, size: 6 })} class="chev fa" />
				<SvgTeX x={map(alphaArc[1])[0] - 16} y={Y + 16} tex={'\\alpha'} color="var(--gold-bright)" size={19} w={30} h={24} />
			{/if}
			{#if showBeta}
				<g
					class="grab"
					class:held={held === 'b'}
					role="slider"
					tabindex="0"
					aria-label="Fence β: drag it up or down, or use the up and down arrow keys"
					aria-valuemin={1}
					aria-valuemax={n}
					aria-valuenow={row + 1}
					aria-valuetext="row {row + 1}"
					onpointerdown={(e) => grab(e, 'b')}
					onpointermove={slide}
					onpointerup={() => (held = null)}
					onpointercancel={() => (held = null)}
					onkeydown={(e) => key(e, 'b')}
					style="cursor: ns-resize"
				>
					<path d={pathD(betaArc, map)} class="hit" />
				</g>
				<path d={pathD(betaArc, map)} class="fence fb" />
				<path d={coChevrons(betaArc, map, { spacing: 60, size: 6 })} class="chev fb" />
				<SvgTeX x={X + 16} y={map(betaArc[0])[1] - 16} tex={'\\beta'} color="var(--teal)" size={19} w={30} h={24} />
			{/if}
			<!-- products -->
			{#each M.triPts as _, t (t)}
				{@const c = map(center(t))}
				<text x={c[0]} y={c[1] + 4} class="val" class:nz={prod[t] !== 0}>{prod[t] < 0 ? '−' + -prod[t] : prod[t]}</text>
			{/each}
		</Svg>
	</div>
	<div class="side ui">
		<Segmented
			bind:value={mode}
			label="Which product"
			options={[
				{ value: 'ab', label: 'α ⌣ β' },
				{ value: 'ba', label: 'β ⌣ α' },
				{ value: 'aa', label: 'α ⌣ α' },
				{ value: 'bb', label: 'β ⌣ β' }
			]}
		/>
		<div class="read">
			<div class="k">selected triangle</div>
			<TeX tex={selTeX} />
			<div class="k">the whole torus</div>
			<TeX tex={totalTeX} />
		</div>
		<p class="legend">
			Gold edges cross α (value 1), teal edges cross β (value 1). Every lower triangle L runs
			right then up; every upper triangle U runs up then right. Drag a fence to another column or
			row, or tap any triangle.
		</p>
	</div>
</div>

<style>
	.gc {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		padding: 0.6rem 1.1rem 1rem;
		align-items: center;
	}
	@container figure (max-width: 760px) {
		.gc {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.tri {
		fill: rgba(116, 169, 255, 0.05);
		stroke: none;
		cursor: pointer;
		transition: fill 0.25s var(--ease);
	}
	.tri:hover {
		fill: rgba(164, 147, 255, 0.14);
	}
	.tri.hot {
		fill: rgba(242, 141, 182, 0.32);
	}
	.tri.sel {
		fill: rgba(164, 147, 255, 0.2);
	}
	.tri.hot.sel {
		fill: rgba(242, 141, 182, 0.45);
	}
	.edge {
		stroke: rgba(200, 192, 170, 0.32);
		stroke-width: 1.4;
	}
	.arr {
		fill: none;
		stroke: rgba(200, 192, 170, 0.45);
		stroke-width: 1.3;
		stroke-linecap: round;
	}
	.edge.ea,
	.arr.ea {
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.edge.eb,
	.arr.eb {
		stroke: var(--teal);
		stroke-width: 2.4;
	}
	.edge.eab,
	.arr.eab {
		stroke: #d9ecd0;
		stroke-width: 2.4;
	}
	.fence {
		fill: none;
		stroke-width: 3;
		stroke-dasharray: 9 5;
		stroke-linecap: round;
		filter: url(#gc-glow);
		pointer-events: none;
	}
	.fence.fa,
	.chev.fa {
		stroke: var(--gold-bright);
	}
	.fence.fb,
	.chev.fb {
		stroke: var(--teal);
	}
	.chev {
		fill: none;
		pointer-events: none;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.val {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-size: 13px;
		fill: var(--ink-ghost);
		pointer-events: none;
	}
	.val.nz {
		fill: var(--rose);
		font-size: 20px;
		font-weight: 700;
	}
	.vl {
		font-size: 13px;
		fill: var(--ink-bright);
		pointer-events: none;
	}
	.side {
		display: grid;
		gap: 0.7rem;
		align-content: center;
	}
	.grab {
		outline: none;
		touch-action: none;
	}
	.hit {
		fill: none;
		stroke: transparent;
		stroke-width: 22;
		pointer-events: stroke;
	}
	.grab:hover .hit,
	.grab:focus-visible .hit,
	.grab.held .hit {
		stroke: rgba(255, 244, 218, 0.1);
	}
	.read {
		display: grid;
		gap: 0.25rem;
		font-size: 0.92rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.k {
		font-size: 0.64rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-top: 0.3rem;
	}
	.legend {
		margin: 0;
		font-size: 0.78rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
</style>
