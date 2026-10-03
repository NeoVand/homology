<script lang="ts">
	// Figure: H* of the circle and of the torus, computed one step at a time:
	// cochains → coboundary matrices → cocycles → coboundaries → the quotient.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';

	let which = $state<'circle' | 'torus'>('circle');
	let step = $state(0);
	$effect(() => {
		void which;
		step = 0;
	});

	const circleLabels = ['The cochains', 'δ₀ as a matrix', 'H⁰: constants', 'Every 1-cochain is a cocycle', 'The coboundaries', 'H¹ ≅ ℤ'];
	const torusLabels = ['The cell structure', 'δ₀ = 0', 'δ₁ as a matrix', 'The cocycles', 'H¹ ≅ ℤ²', 'H² ≅ ℤ'];

	// circle picture
	const cp: [number, number][] = [
		[86, 236],
		[200, 52],
		[314, 236]
	];
	const cEdges: [number, number][] = [
		[0, 1],
		[0, 2],
		[1, 2]
	];
	const mid = (a: [number, number], b: [number, number], off = 0): [number, number] => {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const l = Math.hypot(dx, dy);
		return [(a[0] + b[0]) / 2 - (dy / l) * off, (a[1] + b[1]) / 2 + (dx / l) * off];
	};
	const delta0 = [
		[-1, 1, 0],
		[-1, 0, 1],
		[0, -1, 1]
	];
	const delta1T = [
		[1, 1, -1],
		[1, 1, -1]
	];
	// circle edge labels per step
	function cEdgeLabel(e: number): string | null {
		if (step === 0 || step === 1 || step === 3) return ['\\psi_{01}', '\\psi_{02}', '\\psi_{12}'][e];
		if (step === 4) return ['2', '5', '3'][e];
		if (step === 5) return ['1', '0', '0'][e];
		return null;
	}
	function cVertexLabel(v: number): string | null {
		if (step <= 1) return ['f_0', 'f_1', 'f_2'][v];
		if (step === 2) return 'c';
		if (step === 4) return ['0', '2', '5'][v];
		return null;
	}
	const cEdgeColor = (e: number) =>
		step === 4 ? 'var(--teal)' : step === 5 && e === 0 ? 'var(--rose)' : step === 3 ? 'var(--gold-bright)' : 'rgba(206,198,176,0.6)';

	// torus square: (x0, y0) top-left in SVG, size S
	const x0 = 90;
	const y0 = 40;
	const S = 210;
	const BL: [number, number] = [x0, y0 + S];
	const TR: [number, number] = [x0 + S, y0];
</script>

<Controls>
	<Segmented
		bind:value={which}
		options={[
			{ value: 'circle', label: 'The circle' },
			{ value: 'torus', label: 'The torus' }
		]}
		label="Which space"
	/>
</Controls>
<div class="steps">
	<div class="pic">
		{#if which === 'circle'}
			<Svg viewBox="40 20 320 260" maxHeight={300} label="A hollow triangle: the circle as a simplicial complex">
				{#each cEdges as [a, b], e (e)}
					{@const A = cp[a]}
					{@const B = cp[b]}
					{@const [mx, my] = mid(A, B)}
					{@const l = Math.hypot(B[0] - A[0], B[1] - A[1])}
					{@const ux = (B[0] - A[0]) / l}
					{@const uy = (B[1] - A[1]) / l}
					<line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} class="edge" style="stroke:{cEdgeColor(e)}" />
					<path d="M {mx - ux * 7 - uy * 6} {my - uy * 7 + ux * 6} L {mx + ux * 5} {my + uy * 5} L {mx - ux * 7 + uy * 6} {my - uy * 7 - ux * 6}" class="chev" style="stroke:{cEdgeColor(e)}" />
					{#if cEdgeLabel(e)}
						{@const [lx, ly] = mid(A, B, e === 1 ? -22 : 22)}
						<SvgTeX x={lx} y={ly} tex={cEdgeLabel(e) ?? ''} size={17} color={step === 4 ? 'var(--teal)' : step === 5 ? (e === 0 ? 'var(--rose)' : 'var(--ink-faint)') : 'var(--gold-bright)'} w={70} h={30} />
					{/if}
				{/each}
				{#if step === 5}
					<!-- the fence across edge [0,1] -->
					{@const [mx, my] = mid(cp[0], cp[1])}
					<line x1={mx - 34} y1={my - 20} x2={mx + 34} y2={my + 20} class="fence" />
				{/if}
				{#each cp as [x, y], v (v)}
					<circle cx={x} cy={y} r="9" class="vdot" class:green={step === 2} />
					<text {x} y={y + 1} class="vnum">{v}</text>
					{#if cVertexLabel(v)}
						<SvgTeX x={x + (v === 1 ? 0 : v === 0 ? -6 : 6)} y={y + (v === 1 ? -24 : 26)} tex={cVertexLabel(v) ?? ''} size={17} color={step === 2 ? 'var(--green)' : step === 4 ? 'var(--teal)' : 'var(--gold-bright)'} w={60} h={28} />
					{/if}
				{/each}
			</Svg>
		{:else}
			<Svg viewBox="40 0 320 300" maxHeight={300} label="The torus as a square with one vertex, three edges and two triangles">
				<GluingSquare preset="torus" x={x0} y={y0} size={S} fill={false} />
				<!-- triangles -->
				<polygon points="{BL.join(',')} {x0 + S},{y0 + S} {TR.join(',')}" class="tri" class:on={step === 5} />
				<polygon points="{BL.join(',')} {x0},{y0} {TR.join(',')}" class="tri" class:on={step === 5} />
				<!-- the diagonal c -->
				<line x1={BL[0]} y1={BL[1]} x2={TR[0]} y2={TR[1]} class="diag" />
				<path d="M {x0 + S / 2 - 9} {y0 + S / 2 + 1} L {x0 + S / 2 + 3} {y0 + S / 2 - 3} L {x0 + S / 2 - 1} {y0 + S / 2 + 9}" class="chev" style="stroke:var(--violet)" />
				<SvgTeX x={x0 + S / 2 + 18} y={y0 + S / 2 + 10} tex="c" size={18} color="var(--violet)" w={30} h={26} />
				<SvgTeX x={x0 + S * 0.73} y={y0 + S * 0.72} tex={step === 5 ? 'L: p' : 'L'} size={17} color={step === 5 ? 'var(--violet)' : 'var(--ink-dim)'} w={70} h={28} />
				<SvgTeX x={x0 + S * 0.27} y={y0 + S * 0.28} tex={step === 5 ? 'U: q' : 'U'} size={17} color={step === 5 ? 'var(--violet)' : 'var(--ink-dim)'} w={70} h={28} />
				{#if step === 3 || step === 4}
					<!-- α: a vertical fence, crossing a and c; β: a horizontal fence, crossing b and c -->
					<line x1={x0 + S * 0.42} y1={y0 - 8} x2={x0 + S * 0.42} y2={y0 + S + 8} class="fence" />
					<line x1={x0 - 8} y1={y0 + S * 0.36} x2={x0 + S + 8} y2={y0 + S * 0.36} class="fence b" />
					<SvgTeX x={x0 + S * 0.42 + 14} y={y0 - 12} tex="\alpha" size={18} color="var(--rose)" w={30} h={26} />
					<SvgTeX x={x0 + S + 22} y={y0 + S * 0.36 - 12} tex="\beta" size={18} color="var(--amber)" w={30} h={26} />
				{/if}
				{#each [BL, [x0 + S, y0 + S], TR, [x0, y0]] as c, i (i)}
					<circle cx={c[0]} cy={c[1]} r="7" class="vdot" />
				{/each}
				<SvgTeX x={x0 - 18} y={y0 + S + 16} tex="v" size={16} color="var(--gold-bright)" w={30} h={26} />
			</Svg>
		{/if}
	</div>
	<div class="text">
		{#if which === 'circle'}
			{#if step === 0}
				<p>
					The hollow triangle has three vertices, three edges and no triangles. A 0-cochain is three numbers \(f_0, f_1, f_2\), a 1-cochain is
					three numbers \(\psi_{01}, \psi_{02}, \psi_{12}\), and there are no 2-cochains:
				</p>
				<p class="eq">\(C^0 \cong \Z^3, \quad C^1 \cong \Z^3, \quad C^2 = 0.\)</p>
			{:else if step === 1}
				<p>Each row of \(\delta_0\) is an edge, and lists “head minus tail”. It is the transpose of the boundary matrix \(\partial_1\).</p>
				<MatrixView M={delta0} rowLabels={['[0,1]', '[0,2]', '[1,2]']} colLabels={['0', '1', '2']} caption={'\\delta_0 ='} />
			{:else if step === 2}
				<p>
					\(\delta f = 0\) says \(f_1 - f_0 = f_2 - f_0 = f_2 - f_1 = 0\): all three heights are equal. The 0-cocycles are the constants, so
				</p>
				<p class="eq">\(H^0 = Z^0 = \set{(c, c, c)} \cong \Z.\)</p>
			{:else if step === 3}
				<p>
					There are no triangles, so \(\delta_1\colon C^1 \to C^2 = 0\) is zero and every 1-cochain is a cocycle: \(Z^1 = C^1 \cong \Z^3\). Any
					three numbers will do.
				</p>
			{:else if step === 4}
				<p>
					The coboundaries are the gradients \(\delta f\). For the heights \(0, 2, 5\) they are \(2, 5, 3\). A labelling is a coboundary exactly
					when it goes around the loop to zero:
				</p>
				<p class="eq">\(B^1 = \setb{\psi}{\psi_{01} + \psi_{12} - \psi_{02} = 0}, \qquad 2 + 3 - 5 = 0.\)</p>
			{:else}
				<p>The loop sum \(\psi \mapsto \psi_{01} + \psi_{12} - \psi_{02}\) is zero exactly on \(B^1\) and takes every integer value, so it identifies</p>
				<p class="eq">\(H^1 = Z^1 / B^1 \cong \Z,\)</p>
				<p>generated by the class of “\(1\) on \([0,1]\), \(0\) elsewhere”: a fence across one edge.</p>
			{/if}
		{:else if step === 0}
			<p>
				Glue the square’s edges in pairs (\(a\) to \(a\), \(b\) to \(b\)) and draw the diagonal \(c\). All four corners become one vertex
				\(v\); there are three edges and two triangles \(L\) (lower) and \(U\) (upper):
			</p>
			<p class="eq">\(C^0 \cong \Z, \quad C^1 \cong \Z^3, \quad C^2 \cong \Z^2.\)</p>
		{:else if step === 1}
			<p>
				Every edge starts and ends at the single vertex \(v\), so \((\delta f)(e) = f(v) - f(v) = 0\): \(\delta_0 = 0\). Hence
				\(H^0 = C^0 \cong \Z\), and there are no coboundaries in degree 1: \(B^1 = 0\).
			</p>
		{:else if step === 2}
			<p>\(\partial L = \partial U = a + b - c\), so both rows of \(\delta_1 = \partial_2^{\mathsf T}\) read “\(\varphi(a) + \varphi(b) - \varphi(c)\)”:</p>
			<MatrixView M={delta1T} rowLabels={['L', 'U']} colLabels={['a', 'b', 'c']} caption={'\\delta_1 ='} />
		{:else if step === 3}
			<p>A 1-cochain is a cocycle exactly when \(\varphi(c) = \varphi(a) + \varphi(b)\). Two free choices, so \(Z^1 \cong \Z^2\), with basis</p>
			<p class="eq">\(\alpha = (1, 0, 1), \qquad \beta = (0, 1, 1)\)</p>
			<p>(values on \(a, b, c\)). Drawn as fences: \(\alpha\) crosses \(a\) and \(c\); \(\beta\) crosses \(b\) and \(c\).</p>
		{:else if step === 4}
			<p>Since \(B^1 = 0\), nothing is divided out:</p>
			<p class="eq">\(H^1 = Z^1 \cong \Z^2 = \Z\alpha \oplus \Z\beta.\)</p>
			<p>\(\alpha\) counts how often a loop crosses the vertical fence — trips in the \(a\) direction; \(\beta\) counts trips in the \(b\) direction.</p>
		{:else}
			<p>
				A 2-cochain is a pair \((p, q)\): values on \(L\) and \(U\). Every 2-cochain is a cocycle (there are no 3-cells), and the coboundaries
				\(\delta_1\varphi = (t, t)\) are the pairs with \(p = q\). So \((p, q) \mapsto p - q\) identifies
			</p>
			<p class="eq">\(H^2 = \Z^2 / \set{(t, t)} \cong \Z,\)</p>
			<p>and \(p - q\) is the value on the fundamental cycle \([T] = L - U\).</p>
		{/if}
	</div>
</div>
<Controls>
	<StepControls bind:step count={6} labels={which === 'circle' ? circleLabels : torusLabels} interval={3800} />
</Controls>

<style>
	.steps {
		display: grid;
		grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
		gap: 0.4rem 1.2rem;
		padding: 0.8rem 1.1rem 0.7rem;
		align-items: center;
		min-height: 330px;
	}
	@media (max-width: 760px) {
		.steps {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.text {
		font-size: 0.95rem;
		line-height: 1.6;
	}
	.text p {
		margin: 0 0 0.6em;
	}
	.eq {
		text-align: center;
		color: var(--ink-bright);
		font-size: 1.05rem;
	}
	.edge {
		stroke-width: 2.6;
		stroke-linecap: round;
		transition: stroke 0.35s var(--ease);
	}
	.chev {
		fill: none;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.vdot {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.4;
		transition: fill 0.3s;
	}
	.vdot.green {
		fill: var(--green);
	}
	.vnum {
		font-family: var(--font-ui);
		font-size: 10px !important;
		font-weight: 700;
		fill: #1a1206 !important;
		text-anchor: middle;
		dominant-baseline: middle;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.07);
		stroke: none;
		transition: fill 0.3s;
	}
	.tri.on {
		fill: rgba(164, 147, 255, 0.18);
	}
	.diag {
		stroke: var(--violet);
		stroke-width: 2.4;
		stroke-linecap: round;
	}
	.fence {
		stroke: var(--rose);
		stroke-width: 3;
		stroke-linecap: round;
		filter: drop-shadow(0 0 4px rgba(242, 141, 182, 0.7));
	}
	.fence.b {
		stroke: var(--amber);
		filter: drop-shadow(0 0 4px rgba(244, 181, 95, 0.7));
	}
</style>
