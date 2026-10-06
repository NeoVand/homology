<script lang="ts">
	// Figure: a triangulated annulus. Numbers on the edges can pass the local test
	// on every filled triangle and still fail the global test around the hole.
	// Edit edges, add a "bump" at a vertex (a gradient — changes nothing that
	// matters), or relax to the harmonic representative (1/3 and ±1/6).
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import OGraphView from './OGraphView.svelte';
	import { curl, pathSum, findEdge, fracText, fracTeX, clean, snap, hodge } from './graph';
	import { annulus } from './presets';
	import Mark from '$lib/components/ui/Mark.svelte';

	const A = annulus();
	const E = A.edges.length;

	let psi = $state<number[]>([...A.psi]);
	let mode = $state<'edit' | 'bump'>('edit');
	let selE = $state<number | null>(0);
	let loopId = $state<'inner' | 'outer' | 'bounds'>('inner');
	let smoothed = $state(false);

	const loops: Record<string, number[]> = {
		inner: [0, 1, 2, 0],
		outer: [3, 4, 5, 3],
		bounds: [0, 3, 4, 1, 0]
	};
	const loopNames: Record<string, string> = {
		inner: 'a₀ → a₁ → a₂ → a₀',
		outer: 'b₀ → b₁ → b₂ → b₀',
		bounds: 'a₀ → b₀ → b₁ → a₁ → a₀'
	};

	const curls = $derived((A.tris ?? []).map((t) => clean(curl(A, psi, t))));
	const nPass = $derived(curls.filter((c) => Math.abs(c) < 1e-9).length);
	const loop = $derived(loops[loopId]);
	const loopEdges = $derived.by(() => {
		const s = new Set<number>();
		for (let i = 0; i + 1 < loop.length; i++) s.add(findEdge(A, loop[i], loop[i + 1])!.e);
		return s;
	});
	const terms = $derived.by(() => {
		const out: number[] = [];
		for (let i = 0; i + 1 < loop.length; i++) out.push(clean(pathSum(A, psi, [loop[i], loop[i + 1]])));
		return out;
	});
	const loopTotal = $derived(clean(terms.reduce((a, b) => a + b, 0)));
	const loopTeX = $derived(
		terms.map((x, i) => (i === 0 ? fracTeX(x) : x < 0 ? '- ' + fracTeX(-x) : '+ ' + fracTeX(x))).join(' ') + ' = ' + fracTeX(loopTotal)
	);
	const allPass = $derived(nPass === curls.length);

	function bumpAt(v: number) {
		psi = psi.map((x, e) => {
			const [t, h] = A.edges[e];
			return clean(x + (h === v ? 1 : 0) - (t === v ? 1 : 0));
		});
		smoothed = false;
	}
	function nudge(d: number) {
		if (selE === null) return;
		psi[selE] = clean(psi[selE] + d);
		smoothed = false;
	}
	function reset() {
		psi = [...A.psi];
		smoothed = false;
	}
	function smooth() {
		const H = hodge(A, psi);
		// remove the gradient part: what is left has the same triangle tests and loop sums,
		// spread out as evenly as possible (for a cocycle: the harmonic representative)
		psi = H.harmonic.map((h, e) => snap(h + H.curl[e]));
		smoothed = true;
	}
	function zero() {
		psi = new Array(E).fill(0);
		smoothed = false;
	}
	const isZeroEdge = (e: number) => Math.abs(psi[e]) < 1e-9;
	function edgeColor(e: number) {
		if (loopEdges.has(e)) return loopTotal === 0 ? 'var(--green)' : 'var(--rose)';
		if (selE === e && mode === 'edit') return 'var(--gold-bright)';
		return isZeroEdge(e) ? 'rgba(206,198,176,0.45)' : 'rgba(242,208,143,0.85)';
	}
	const cx = 240;
	const cy = 226;
</script>

<Controls>
	<div class="row">
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'edit', label: 'Edit an edge' },
				{ value: 'bump', label: 'Add a bump at a vertex' }
			]}
			label="What a tap does"
		/>
		<Segmented
			bind:value={loopId}
			options={[
				{ value: 'inner', label: 'Inner loop' },
				{ value: 'outer', label: 'Outer loop' },
				{ value: 'bounds', label: 'A loop that bounds' }
			]}
			label="Which loop to test"
		/>
	</div>
</Controls>
<div class="ann">
	<Svg viewBox="34 2 412 356" maxHeight={430} label="A triangulated annulus with numbers on its edges; the triangle tests pass but the loop around the hole sums to 1">
		<defs>
			<radialGradient id="ann-hole" cx="50%" cy="58%" r="60%">
				<stop offset="0" stop-color="#f28db6" stop-opacity="0.22" />
				<stop offset="1" stop-color="#f28db6" stop-opacity="0" />
			</radialGradient>
		</defs>
		<polygon points={[0, 1, 2].map((v) => A.pos[v].join(',')).join(' ')} fill="url(#ann-hole)" />
		<text x={cx} y={cy + 12} class="hole-lbl">hole</text>
		<OGraphView
			pos={A.pos}
			edges={A.edges}
			tris={A.tris}
			vertexRadius={11}
			triFill={(t) => (Math.abs(curls[t]) < 1e-9 ? 'rgba(132,217,162,0.1)' : 'rgba(242,141,182,0.2)')}
			triLabel={(t) => (Math.abs(curls[t]) < 1e-9 ? '✓' : fracText(curls[t]))}
			triLabelColor={(t) => (Math.abs(curls[t]) < 1e-9 ? 'var(--green)' : 'var(--rose)')}
			edgeColor={edgeColor}
			edgeWidth={(e) => (loopEdges.has(e) ? 3.6 : 2.4)}
			edgeLabel={(e) => (smoothed ? null : isZeroEdge(e) ? '0' : fracText(psi[e]))}
			edgeLabelTeX={(e) => (smoothed ? fracTeX(psi[e]) : null)}
			edgeLabelColor={(e) => (loopEdges.has(e) ? (loopTotal === 0 ? 'var(--green)' : 'var(--rose)') : isZeroEdge(e) ? 'var(--ink-faint)' : 'var(--gold-bright)')}
			edgeLabelSide={(e) => (e < 3 ? 1 : e < 6 ? -1 : e < 9 ? 1 : -1)}
			edgeLabelOffset={(e) => (e < 3 ? 0 : e < 6 ? 17 : 13)}
			arrowAt={(e) => (e < 3 ? 0.8 : 0.5)}
			vertexText={(v) => A.names?.[v] ?? ''}
			selectedEdge={mode === 'edit' ? selE : null}
			clickEdge={mode === 'edit'}
			clickVertex={mode === 'bump'}
			onedge={(e) => (selE = e)}
			onvertex={bumpAt}
		/>
	</Svg>
</div>
<Controls>
	<div class="row">
		{#if mode === 'edit'}
			<span class="ui lbl">Selected edge:</span>
			<Button onclick={() => nudge(-1)} disabled={selE === null}>−1</Button>
			<Button onclick={() => nudge(1)} disabled={selE === null}>+1</Button>
		{:else}
			<span class="ui lbl">Tap a vertex: +1 on arrows into it, −1 on arrows out of it.</span>
		{/if}
		<span class="sp"></span>
		<Button variant="gold" onclick={smooth}>Smooth it out</Button>
		<Button variant="subtle" onclick={reset}>Start over</Button>
		<Button variant="subtle" onclick={zero}>All zero</Button>
	</div>
	<div class="row tests ui">
		<span class="t" class:ok={allPass} class:bad={!allPass}>
			Local tests: {nPass} of {curls.length} triangles pass <Mark ok={allPass} />
		</span>
		<span class="t" class:ok={loopTotal === 0} class:bad={loopTotal !== 0}>
			{loopNames[loopId]}: <TeX tex={loopTeX} />
		</span>
	</div>
</Controls>

<style>
	.ann {
		padding: 0.4rem 0.6rem 0.2rem;
	}
	.hole-lbl {
		font-family: var(--font-ui);
		font-size: 11px !important;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		fill: rgba(242, 141, 182, 0.75) !important;
		text-anchor: middle;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.7rem;
		width: 100%;
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.sp {
		flex: 1;
	}
	.tests {
		border-top: 1px solid var(--line-faint);
		padding-top: 0.6rem;
		font-size: 0.82rem;
		gap: 0.4rem 1.4rem;
	}
	.t.ok {
		color: var(--green);
	}
	.t.bad {
		color: var(--rose);
	}
	.t :global(.katex) {
		font-size: 1.02em;
	}
</style>
