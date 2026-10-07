<script lang="ts">
	// The duality map D(φ) = [T²] ⌢ φ on the 3×3 torus: each triangle hands its
	// back edge the value of φ on its front edge. A fence becomes a loop running
	// right beside it. Tap vertices to add coboundaries: the loop changes, but
	// only by a boundary, so its homology class stays put.
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { squareModel, fenceCochain, type Pt } from '../cup-product/flat';
	import { boundary1, delta0, evaluate, orientTriangles } from '../cup-product/cup';
	import { boxMap, coChevrons, pathD } from '../cup-product/draw';
	import { cap21 } from './duality';

	const n = 3;
	const M = squareModel('torus', n);
	const D = M.D;
	const T = orientTriangles(D)!;
	const X = 70;
	const Y = 40;
	const S = 320;
	const map = boxMap(0, 1, 0, 1, X, Y, S, S);

	let which = $state<'a' | 'b' | 'ab'>('a');
	let f = $state<number[]>(Array.from({ length: D.nV }, () => 0));

	const alphaArc: Pt[] = [
		[0.5, 0],
		[0.5, 1]
	];
	const betaArc: Pt[] = [
		[1, 0.5],
		[0, 0.5]
	];
	const alpha = fenceCochain(M, [alphaArc]);
	const beta = fenceCochain(M, [betaArc]);
	const base = $derived(which === 'a' ? alpha : which === 'b' ? beta : alpha.map((x, e) => x + beta[e]));
	const phi = $derived(base.map((x, e) => x + delta0(D, f)[e]));
	const cap = $derived(cap21(D, T, phi));
	const isCycle = $derived(boundary1(D, cap).every((x) => x === 0));
	// class of the cycle in H₁ = ℤ⟨a, b⟩, read off by pairing with the dual classes α, β
	const ca = $derived(evaluate(alpha, cap));
	const cb = $derived(evaluate(beta, cap));
	const touched = $derived(f.some((x) => x !== 0));

	const term = (k: number, s: string) => (k === 0 ? '' : k === 1 ? `+${s}` : k === -1 ? `-${s}` : `${k > 0 ? '+' : ''}${k}${s}`);
	const classTeX = $derived.by(() => {
		const t = `${term(ca, 'a')}${term(cb, 'b')}`.replace(/^\+/, '');
		return t || '0';
	});
	const nameTeX = $derived(which === 'a' ? '\\alpha' : which === 'b' ? '\\beta' : '\\alpha+\\beta');
	const phiTeX = $derived(touched ? `${nameTeX}+\\delta f` : nameTeX);

	function toggle(v: number) {
		f[v] = f[v] ? 0 : 1;
	}
	const fmt = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
	const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
	/** an arrow at the middle of a flat edge, pointing along the chain's direction */
	function chainArrow(a: Pt, b: Pt, c: number): string {
		const A = map(c > 0 ? a : b);
		const B = map(c > 0 ? b : a);
		const L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
		const ux = (B[0] - A[0]) / L;
		const uy = (B[1] - A[1]) / L;
		const m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
		return `M${m[0] - ux * 9 - uy * 7} ${m[1] - uy * 9 + ux * 7} L${m[0] + ux * 5} ${m[1] + uy * 5} L${m[0] - ux * 9 + uy * 7} ${m[1] - uy * 9 - ux * 7}`;
	}
</script>

<div class="cg">
	<div class="pic">
		<Svg viewBox="0 0 460 400" maxHeight={420} label="The 3 by 3 torus grid with a fence and the loop produced from it by the cap product with the fundamental class; tapping vertices adds coboundaries to the cocycle.">
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
			{#each M.triPts as tri, t (t)}
				<polygon points={tri.map((p) => map(p).join(',')).join(' ')} class="tri" />
			{/each}
			<!-- the cocycle φ: edges where it is nonzero -->
			{#each M.edgeSegs as segs, e (e)}
				{#each segs as s, k (k)}
					{@const a = map(s.a)}
					{@const b = map(s.b)}
					<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="edge" class:on={phi[e] !== 0} />
				{/each}
			{/each}
			<!-- the original fences, faint once coboundaries have been added -->
			{#if which !== 'b'}
				<path d={pathD(alphaArc, map)} class="fence" style="--c:var(--gold-bright); opacity:{touched ? 0.3 : 0.95}" />
				<path d={coChevrons(alphaArc, map, { spacing: 60, size: 6 })} class="chev" style="--c:var(--gold-bright); opacity:{touched ? 0.3 : 0.95}" />
			{/if}
			{#if which !== 'a'}
				<path d={pathD(betaArc, map)} class="fence" style="--c:var(--teal); opacity:{touched ? 0.3 : 0.95}" />
				<path d={coChevrons(betaArc, map, { spacing: 60, size: 6 })} class="chev" style="--c:var(--teal); opacity:{touched ? 0.3 : 0.95}" />
			{/if}
			<!-- D(φ): the cap product, a 1-cycle -->
			{#each M.edgeSegs as segs, e (e)}
				{#if cap[e] !== 0}
					{#each segs as s, k (k)}
						{@const a = map(s.a)}
						{@const b = map(s.b)}
						<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="capline" />
						<path d={chainArrow(s.a, s.b, cap[e])} class="caparr" />
						{#if Math.abs(cap[e]) > 1}
							{@const m = map(mid(s.a, s.b))}
							<text x={m[0] + 9} y={m[1] - 7} class="mult">{Math.abs(cap[e])}</text>
						{/if}
					{/each}
				{/if}
			{/each}
			<!-- φ's values -->
			{#each M.edgeSegs as segs, e (e)}
				{#if phi[e] !== 0}
					{@const s = segs[0]}
					{@const m = map(mid(s.a, s.b))}
					<text x={m[0] - 9} y={m[1] + 14} class="phival">{fmt(phi[e])}</text>
				{/if}
			{/each}
			<!-- vertices: tap to add δ of an indicator function -->
			{#each M.vertexPts as ps, v (v)}
				{#each ps as p, k (k)}
					{@const A = map(p)}
					<circle
						cx={A[0]}
						cy={A[1]}
						r={f[v] ? 9 : 7}
						class="vert"
						class:on={f[v] !== 0}
						role="button"
						tabindex="0"
						aria-label="vertex {v}: add the coboundary of its indicator"
						onclick={() => toggle(v)}
						onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && toggle(v)}
					/>
				{/each}
			{/each}
		</Svg>
	</div>
	<div class="side ui">
		<Segmented
			bind:value={which}
			label="Which class"
			options={[
				{ value: 'a', label: 'α' },
				{ value: 'b', label: 'β' },
				{ value: 'ab', label: 'α + β' }
			]}
		/>
		<div class="read" aria-live="polite">
			<div class="k">the cocycle</div>
			<TeX tex={`\\varphi = ${phiTeX}`} />
			<div class="k">its dual, a 1-chain (rose)</div>
			<TeX tex={`D(\\varphi) = [T^2]\\frown\\varphi = \\textstyle\\sum_\\sigma \\pm\\,\\varphi(\\text{front})\\cdot\\text{back}`} />
			<div class="k">is it a cycle?</div>
			<div>{isCycle ? 'yes — its boundary is zero' : 'no'}</div>
			<div class="k">its homology class</div>
			<TeX tex={`[D(\\varphi)] = ${classTeX} \\in H_1(T^2)`} />
		</div>
		<div class="btns">
			<Button onclick={() => (f = f.map(() => 0))} variant="subtle" disabled={!touched}>Remove the coboundaries</Button>
		</div>
		<p class="lg">
			Tap vertices to add \(\delta f\), where \(f\) is \(1\) on the tapped vertices. The rose cycle changes, yet its
			class does not: duality is well defined on classes.
		</p>
	</div>
</div>

<style>
	.cg {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		padding: 0.6rem 1.1rem 1rem;
		align-items: center;
	}
	@container figure (max-width: 760px) {
		.cg {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.tri {
		fill: rgba(116, 169, 255, 0.05);
	}
	.edge {
		stroke: rgba(200, 192, 170, 0.3);
		stroke-width: 1.3;
	}
	.edge.on {
		stroke: rgba(242, 208, 143, 0.75);
		stroke-width: 2.2;
	}
	.fence {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.6;
		stroke-dasharray: 9 5;
		stroke-linecap: round;
	}
	.chev {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.capline {
		stroke: var(--rose);
		stroke-width: 4.2;
		stroke-linecap: round;
		opacity: 0.92;
	}
	.caparr {
		fill: none;
		stroke: #fff0f6;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.mult {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 13px;
		fill: var(--rose);
	}
	.phival {
		font-family: var(--font-ui);
		font-size: 11px;
		fill: var(--gold-pale);
		text-anchor: middle;
		pointer-events: none;
	}
	.vert {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.3;
		cursor: pointer;
		transition: r 0.15s;
	}
	.vert.on {
		fill: var(--violet);
		stroke: #fff;
		stroke-width: 2;
	}
	.side {
		display: grid;
		gap: 0.7rem;
		align-content: center;
	}
	.read {
		display: grid;
		gap: 0.2rem;
		color: var(--ink-bright);
		font-size: 0.9rem;
		overflow-x: auto;
	}
	.k {
		font-size: 0.64rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-top: 0.35rem;
	}
	.lg {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
</style>
