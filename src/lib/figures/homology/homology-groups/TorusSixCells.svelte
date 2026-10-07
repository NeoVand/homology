<script lang="ts">
	// The torus from six cells — one vertex v, three edges a, b, c and two
	// triangles L, U (Hatcher's Δ-complex, with the labels of Figures 2.5.11 and
	// 4.2.3) — and its homology computed entirely by hand, one idea per step.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Handle from '$lib/components/svg/Handle.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Timeline from '$lib/components/ui/Timeline.svelte';

	type P = [number, number];

	let step = $state(0);
	let lit = $state<'L' | 'U'>('L');
	/** step 4: how far the diagonal c has been pushed across L (0 = c, 1 = a then b) */
	let t = $state(0);

	const labels = ['Six cells', '∂₁ = 0', 'One rim, twice', 'H₁ ≅ ℤ²', 'H₂ ≅ ℤ'];

	// the square, in SVG units (y grows downward)
	const x0 = 70;
	const y0 = 34;
	const S = 220;
	const BL: P = [x0, y0 + S];
	const BR: P = [x0 + S, y0 + S];
	const TR: P = [x0 + S, y0];
	const TL: P = [x0, y0];
	const mid: P = [(BL[0] + TR[0]) / 2, (BL[1] + TR[1]) / 2];
	const lerp = (p: P, q: P, s: number): P => [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
	const pts = (...ps: P[]) => ps.map((p) => p.join(',')).join(' ');

	/** a chevron at fraction `at` along p→q, pointing towards q */
	function chev(p: P, q: P, s = 7, at = 0.5): string {
		const L = Math.hypot(q[0] - p[0], q[1] - p[1]) || 1;
		const ux = (q[0] - p[0]) / L;
		const uy = (q[1] - p[1]) / L;
		const [mx, my] = lerp(p, q, at);
		const cx = mx + ux * s * 0.4;
		const cy = my + uy * s * 0.4;
		return `M ${cx - ux * s - uy * s * 0.85} ${cy - uy * s + ux * s * 0.85} L ${cx} ${cy} L ${cx - ux * s + uy * s * 0.85} ${cy - uy * s - ux * s * 0.85}`;
	}
	/** a polygon pulled towards its centroid, so a rim drawn on it sits inside the triangle */
	function inset(ps: P[], k = 0.2): P[] {
		const c: P = [ps.reduce((s, p) => s + p[0], 0) / ps.length, ps.reduce((s, p) => s + p[1], 0) / ps.length];
		return ps.map((p) => lerp(p, c, k));
	}

	/** a counterclockwise (on screen) circular arrow around the incentre-ish of a triangle */
	function arc(ps: P[]) {
		const c: P = [(ps[0][0] + ps[1][0] + ps[2][0]) / 3, (ps[0][1] + ps[1][1] + ps[2][1]) / 3];
		const r = 26;
		const a0 = -Math.PI / 2;
		const sweep = 1.5 * Math.PI;
		const N = 20;
		const at = (k: number): P => {
			const th = a0 - sweep * (k / N);
			return [c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)];
		};
		const path = 'M ' + Array.from({ length: N + 1 }, (_, k) => at(k).map((v) => v.toFixed(1)).join(' ')).join(' L ');
		const e = at(N);
		const th = a0 - sweep;
		// direction of travel at the end (decreasing angle)
		const tx = Math.sin(th);
		const ty = -Math.cos(th);
		const s = 8;
		const head = `M ${e[0] - tx * s - ty * s * 0.8} ${e[1] - ty * s + tx * s * 0.8} L ${e[0] + tx * 2} ${e[1] + ty * 2} L ${e[0] - tx * s + ty * s * 0.8} ${e[1] - ty * s - tx * s * 0.8}`;
		return { path, head };
	}

	// the rims, walked in each triangle's vertex order (∂ = a + b − c for both)
	const rimL = inset([BL, BR, TR]); // along a, up b, back down c
	const rimU = inset([BL, TL, TR]); // up b, along a, back down c
	const rimColors = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)'];
	const rimTeX = { L: '\\partial L = a + b - c', U: '\\partial U = b + a - c = a + b - c' };

	// step 4: the loop c, pushed across L; its middle slides from the centre to the corner BR
	const M = $derived(lerp(mid, BR, t));
	function dragPush([x, y]: P) {
		// project onto the segment mid → BR
		const dx = BR[0] - mid[0];
		const dy = BR[1] - mid[1];
		t = Math.max(0, Math.min(1, ((x - mid[0]) * dx + (y - mid[1]) * dy) / (dx * dx + dy * dy)));
	}

	const d1 = [[0, 0, 0]];
	const d2 = [
		[1, 1],
		[1, 1],
		[-1, -1]
	];

	const results = [
		{ k: 0, tex: 'H_0 \\cong \\Z', from: 1 },
		{ k: 1, tex: 'H_1 \\cong \\Z^2', from: 3 },
		{ k: 2, tex: 'H_2 \\cong \\Z', from: 4 }
	];
</script>

<div class="six">
	<div class="pic">
		<Svg viewBox="0 0 360 296" maxHeight={330} label="The torus as a square with opposite sides glued, cut by its diagonal c into a lower triangle L and an upper triangle U. All four corners are the single vertex v.">
			<GluingSquare preset="torus" x={x0} y={y0} size={S} fill={false} />
			<!-- the two triangles -->
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<polygon
				points={pts(BL, BR, TR)}
				class="tri"
				class:on={(step === 2 && lit === 'L') || step === 4}
				class:clickable={step === 2}
				role={step === 2 ? 'button' : undefined}
				tabindex={step === 2 ? 0 : undefined}
				aria-label={step === 2 ? 'Light the rim of L' : undefined}
				onclick={() => step === 2 && (lit = 'L')}
				onkeydown={(e) => step === 2 && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (lit = 'L'))}
			/>
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<polygon
				points={pts(BL, TL, TR)}
				class="tri"
				class:on={(step === 2 && lit === 'U') || step === 4}
				class:clickable={step === 2}
				role={step === 2 ? 'button' : undefined}
				tabindex={step === 2 ? 0 : undefined}
				aria-label={step === 2 ? 'Light the rim of U' : undefined}
				onclick={() => step === 2 && (lit = 'U')}
				onkeydown={(e) => step === 2 && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (lit = 'U'))}
			/>

			<!-- step 4: the region of L swept so far -->
			{#if step === 3 && t > 0}
				<polygon points={pts(BL, M, TR)} class="swept" />
			{/if}

			<!-- the diagonal c -->
			<line x1={BL[0]} y1={BL[1]} x2={TR[0]} y2={TR[1]} class="diag" class:faded={step === 4} />
			{#if step === 4}
				<!-- L − U crosses the diagonal once each way -->
				<path d={chev(TR, BL, 7, 0.38)} class="chev" style="stroke:var(--violet)" />
				<path d={chev(BL, TR, 7, 0.62)} class="chev" style="stroke:var(--violet)" />
			{:else}
				<path d={chev(BL, TR)} class="chev" style="stroke:var(--violet)" />
			{/if}
			<SvgTeX x={mid[0] + 16} y={mid[1] + 12} tex="c" size={18} color="var(--violet)" w={30} h={26} />

			<!-- triangle names -->
			{#if step !== 3}
				<!-- in step 5 the spin arrows sit at the centroids, so the names move out towards the far corners -->
				<SvgTeX x={x0 + S * (step === 4 ? 0.86 : 0.74)} y={y0 + S * (step === 4 ? 0.85 : 0.7)} tex="L" size={19} color={step === 4 || (step === 2 && lit === 'L') ? 'var(--violet)' : 'var(--ink-dim)'} w={30} h={28} />
			{/if}
			<SvgTeX x={x0 + S * (step === 4 ? 0.15 : 0.26)} y={y0 + S * (step === 4 ? 0.15 : 0.3)} tex={step === 4 ? '-U' : 'U'} size={19} color={step === 4 || (step === 2 && lit === 'U') ? 'var(--violet)' : 'var(--ink-dim)'} w={40} h={28} />

			<!-- step 5: L − U, both triangles turning counterclockwise -->
			{#if step === 4}
				{#each [arc([BL, BR, TR]), arc([BL, TR, TL])] as A, i (i)}
					<path d={A.path} class="arc" />
					<path d={A.head} class="arc" />
				{/each}
			{/if}

			<!-- step 3: the rim of the chosen triangle -->
			{#if step === 2}
				{@const rim = lit === 'L' ? rimL : rimU}
				{@const cols = lit === 'L' ? rimColors : [rimColors[1], rimColors[0], rimColors[2]]}
				{#each [0, 1, 2] as i (i)}
					{@const p = rim[i]}
					{@const q = rim[(i + 1) % 3]}
					<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="rim" style="stroke:{cols[i]}" />
					<path d={chev(p, q, 7)} class="chev" style="stroke:{cols[i]}" />
				{/each}
			{/if}

			<!-- step 4: the loop c being pushed across L onto a then b -->
			{#if step === 3}
				<path d="M {BL[0]} {BL[1]} L {M[0]} {M[1]} L {TR[0]} {TR[1]}" class="pushed" />
				<path d={chev(BL, M, 7)} class="chev" style="stroke:var(--violet)" />
				<path d={chev(M, TR, 7)} class="chev" style="stroke:var(--violet)" />
				<Handle
					x={M[0]}
					y={M[1]}
					r={8}
					color="var(--violet)"
					label="Push the loop c across the triangle L"
					valuetext={t >= 0.999 ? 'c has become a followed by b' : `pushed ${Math.round(t * 100)} percent of the way`}
					ondrag={dragPush}
					onkey={(dx, dy) => (t = Math.max(0, Math.min(1, t + (dx + dy) / 60)))}
				/>
			{/if}

			<!-- the single vertex, at all four corners -->
			{#each [BL, BR, TR, TL] as c, i (i)}
				<circle cx={c[0]} cy={c[1]} r={step === 1 ? 8 : 6.5} class="vdot" class:glow={step === 1} />
			{/each}
			<SvgTeX x={BL[0] - 16} y={BL[1] + 16} tex="v" size={16} color="var(--gold-bright)" w={24} h={24} />
			<SvgTeX x={BR[0] + 16} y={BR[1] + 16} tex="v" size={16} color="var(--gold-bright)" w={24} h={24} />
			<SvgTeX x={TR[0] + 16} y={TR[1] - 14} tex="v" size={16} color="var(--gold-bright)" w={24} h={24} />
			<SvgTeX x={TL[0] - 16} y={TL[1] - 14} tex="v" size={16} color="var(--gold-bright)" w={24} h={24} />
		</Svg>
		<div class="tally ui">
			{#each results as r (r.k)}
				<span class="res" class:on={step >= r.from}><TeX tex={r.tex} /></span>
			{/each}
		</div>
	</div>

	<div class="text">
		<div class="kicker ui">Step {step + 1} of {labels.length} · {labels[step]}</div>
		{#if step === 0}
			<p>
				Cut the square along its diagonal \(c\) and glue opposite sides. What is left is six cells: one vertex \(v\) (all four corners are glued
				into one point), three edges \(a, b, c\) and two triangles \(L\) and \(U\).
			</p>
			<!-- one unbreakable piece per group, so a narrow plate wraps between them -->
			<p class="eq">
				<span class="nw">\(C_0 = \Z\langle v\rangle,\)</span>
				<span class="nw">\(C_1 = \Z\langle a, b, c\rangle,\)</span>
				<span class="nw">\(C_2 = \Z\langle L, U\rangle.\)</span>
			</p>
			<p>As a check, \(\chi = 1 - 3 + 2 = 0\), the same as the 3×3 grid’s \(9 - 27 + 18\).</p>
		{:else if step === 1}
			<p>
				Every edge starts and ends at the one vertex, so \(\partial a = v - v = 0\), and the same for \(b\) and \(c\). The whole of \(\partial_1\) is
				zero:
			</p>
			<MatrixView M={d1} rowLabels={['v']} colLabels={['a', 'b', 'c']} caption={'\\partial_1 ='} />
			<p>
				So every 1-chain is a cycle, \(Z_1 = C_1 \cong \Z^3\), and nothing in degree 0 is a boundary: \(H_0 = C_0 \cong \Z\).
			</p>
		{:else if step === 2}
			<p>
				Tap a triangle to walk its rim. \(L\): along \(a\), up \(b\), back down the diagonal. \(U\): up \(b\), along \(a\), back down the
				diagonal. The same rim, twice:
			</p>
			<MatrixView M={d2} rowLabels={['a', 'b', 'c']} colLabels={['L', 'U']} caption={'\\partial_2 ='} highlightCols={[lit === 'L' ? 0 : 1]} />
			<p class="eq"><TeX tex={rimTeX[lit]} /></p>
			<p>So the boundaries are the multiples of one chain: \(B_1 = \Z\,(a + b - c)\).</p>
		{:else if step === 3}
			<p>
				\(H_1 = \Z^3 / \Z(a + b - c)\). In the quotient \(c = a + b\): drag the diagonal across \(L\) and it becomes \(a\) followed by \(b\). So every
				class is \(x[a] + y[b]\), and the map \((x, y, z) \mapsto (x + z,\, y + z)\), which is onto with kernel exactly \(\Z(1, 1, -1)\), shows that
				all of these are different:
			</p>
			<p class="eq">\(H_1 \cong \Z^2, \text{ with basis } [a], [b].\)</p>
			<p class="read" class:done={t >= 0.999}>
				{#if t >= 0.999}
					<TeX tex={'c - (a + b) = -\\partial L, \\text{ so } [c] = [a] + [b]'} />
				{:else}
					Drag the violet bead, or press play.
				{/if}
			</p>
		{:else}
			<p>
				\(\partial(pL + qU) = (p + q)(a + b - c)\) is zero exactly when \(q = -p\). So the 2-cycles are the multiples of \(L - U\), and with no
				3-cells there is nothing to divide by:
			</p>
			<p class="eq">\(H_2 = \Z\,(L - U) \cong \Z.\)</p>
			<p>
				In \(L - U\) both triangles turn the same way. The diagonal is crossed once in each direction and cancels; \(a\) runs forwards along the
				bottom and backwards along the top, the very same edge, and cancels; so does \(b\). Nothing is left over: the whole torus, with no edge.
			</p>
		{/if}
	</div>
</div>
<Controls align="between">
	<StepControls bind:step count={labels.length} {labels} interval={4200} />
	{#if step === 2}
		<Segmented
			bind:value={lit}
			options={[
				{ value: 'L', label: 'rim of L' },
				{ value: 'U', label: 'rim of U' }
			]}
			label="Which triangle's rim"
		/>
	{:else if step === 3}
		<div class="tl">
			<Timeline bind:value={t} from="c" to="a then b" label="Pushing the loop c across the triangle L" duration={2.6} />
		</div>
	{/if}
</Controls>

<style>
	.six {
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
		gap: 0.4rem 1.3rem;
		padding: 0.8rem 1.1rem 0.7rem;
		align-items: center;
		min-height: 360px;
	}
	@container figure (max-width: 46rem) {
		.six {
			grid-template-columns: minmax(0, 1fr);
			min-height: 0;
			padding: 0.6rem 0.8rem 0.6rem;
		}
	}
	.tally {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.3rem 1.1rem;
		font-size: 0.92rem;
		margin-top: 0.15rem;
	}
	.res {
		color: var(--ink-faint);
		opacity: 0.35;
		transition:
			opacity 0.4s var(--ease),
			color 0.4s var(--ease);
	}
	.res.on {
		opacity: 1;
		color: var(--gold-bright);
	}
	.text {
		font-size: 0.95rem;
		line-height: 1.6;
		min-height: 15.5rem;
	}
	@container figure (max-width: 46rem) {
		.text {
			min-height: 0;
		}
	}
	.text p {
		margin: 0 0 0.6em;
	}
	.kicker {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 0.45rem;
	}
	.eq {
		text-align: center;
		color: var(--ink-bright);
		font-size: 1.04rem;
	}
	.read {
		font-size: 0.86rem;
		color: var(--ink-faint);
		text-align: center;
	}
	.read.done {
		color: var(--violet);
		font-size: 0.98rem;
	}
	.tl {
		flex: 1 1 15rem;
		min-width: 0;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.07);
		stroke: none;
		transition: fill 0.3s var(--ease);
	}
	.tri.on {
		fill: rgba(164, 147, 255, 0.2);
	}
	.tri.clickable {
		cursor: pointer;
	}
	.tri.clickable:hover {
		fill: rgba(164, 147, 255, 0.14);
	}
	.tri:focus {
		outline: none;
	}
	.tri:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.swept {
		fill: rgba(164, 147, 255, 0.26);
		stroke: none;
	}
	.diag {
		stroke: var(--violet);
		stroke-width: 2.6;
		stroke-linecap: round;
		transition: opacity 0.3s;
	}
	.diag.faded {
		opacity: 0.55;
	}
	.rim {
		stroke-width: 3;
		stroke-linecap: round;
		filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.6));
	}
	.pushed {
		fill: none;
		stroke: var(--violet);
		stroke-width: 3.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		filter: drop-shadow(0 0 5px rgba(164, 147, 255, 0.6));
	}
	.chev {
		fill: none;
		stroke-width: 2.3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.arc {
		fill: none;
		stroke: var(--violet);
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.95;
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.4;
		transition: r 0.3s;
	}
	.vdot.glow {
		fill: var(--gold-bright);
		filter: drop-shadow(0 0 6px rgba(242, 208, 143, 0.9));
	}
	.eq .nw {
		white-space: nowrap;
		margin: 0 0.5em;
	}
</style>
