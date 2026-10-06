<script lang="ts">
	// The ε–δ game: the challenger picks ε (a band around f(a)); you answer with δ
	// (a window around a). You win if the whole graph over the window stays in the band.
	// a, ε and δ are all dragged in the picture: a along the x-axis, ε by an edge of
	// the band on the y-axis, δ by an edge of the window along the top.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Handle from '$lib/components/svg/Handle.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	type FnId = 'smooth' | 'jump' | 'steep';
	let fn = $state<FnId>('jump');
	let a = $state(2);
	let eps = $state(0.3);
	let delta = $state(0.35);

	const fns: Record<FnId, { label: string; f: (x: number) => number; tex: string }> = {
		smooth: { label: 'Smooth', f: (x) => 1 + 0.55 * Math.sin(1.3 * x) + 0.12 * x, tex: 'f \\text{ smooth}' },
		jump: { label: 'With a jump', f: (x) => (x < 2 ? 0.55 + 0.18 * Math.sin(1.5 * x) : 1.6 + 0.18 * Math.sin(1.5 * x)), tex: 'f \\text{ jumps at } 2' },
		steep: { label: 'Steep but unbroken', f: (x) => 1.1 + 0.75 * Math.tanh(5 * (x - 2)), tex: 'f \\text{ steep}' }
	};
	const F = $derived(fns[fn].f);

	// plot frame: x ∈ [0, 4] → [60, 580], y ∈ [−0.2, 2.4] → [330, 20]
	const X0 = 60,
		X1 = 580,
		Y0 = 330,
		Y1 = 20;
	const sx = (x: number) => X0 + ((X1 - X0) * x) / 4;
	const sy = (y: number) => Y0 + ((Y1 - Y0) * (y + 0.2)) / 2.6;
	const ux = (px: number) => ((px - X0) * 4) / (X1 - X0);
	const uy = (py: number) => ((py - Y0) * 2.6) / (Y1 - Y0) - 0.2;
	const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
	const snap = (v: number, step: number) => Math.round(v / step) * step;

	const fa = $derived(F(a));

	// each handle rides the edge with more room, so it never leaves the frame:
	// ε on the top edge of the band when f(a) is low, the bottom edge when it is high;
	// δ on the right edge of the window when a is left of centre, the left edge otherwise
	const epsUp = $derived(fa <= 1.1);
	const deltaRight = $derived(a <= 2);
	const epsY = $derived(sy(epsUp ? fa + eps : fa - eps));
	const deltaX = $derived(sx(deltaRight ? a + delta : a - delta));
	// the band and the window, cut off at the edges of the frame
	const bandTop = $derived(Math.max(Y1, sy(fa + eps)));
	const bandBot = $derived(Math.min(Y0, sy(fa - eps)));
	const winL = $derived(sx(Math.max(0, a - delta)));
	const winR = $derived(sx(Math.min(4, a + delta)));
	const setA = (v: number) => (a = clamp(snap(v, 0.01), 0.3, 3.7));
	const setEps = (v: number) => (eps = clamp(snap(v, 0.01), 0.05, 0.8));
	const setDelta = (v: number) => (delta = clamp(snap(v, 0.005), 0.01, 1));

	// sample the graph in pieces (break the curve at the jump)
	const curve = $derived.by(() => {
		const segs: [number, number][][] = [[]];
		let prev = F(0);
		for (let i = 0; i <= 400; i++) {
			const x = (4 * i) / 400;
			const y = F(x);
			if (Math.abs(y - prev) > 0.3) segs.push([]);
			segs[segs.length - 1].push([sx(x), sy(y)]);
			prev = y;
		}
		return segs;
	});

	// the part of the graph over the δ-window, split into "inside the band" and "escaped"
	const windowPts = $derived.by(() => {
		let worst = 0;
		const lo = Math.max(0, a - delta);
		const hi = Math.min(4, a + delta);
		const h = (hi - lo) / 160;
		let cur: [number, number][] = [];
		const runs: { ok: boolean; pts: [number, number][] }[] = [];
		let curOk: boolean | null = null;
		for (let i = 1; i < 160; i++) {
			const x = lo + h * i;
			const y = F(x);
			const ok = Math.abs(y - fa) < eps;
			worst = Math.max(worst, Math.abs(y - fa));
			// start a new run when the colour changes, or across the jump
			if (curOk === null || ok !== curOk || Math.abs(y - F(x - h)) > 0.3) {
				if (cur.length) runs.push({ ok: curOk!, pts: cur });
				cur = [];
				curOk = ok;
			}
			cur.push([sx(x), sy(y)]);
		}
		if (cur.length) runs.push({ ok: curOk!, pts: cur });
		return { runs, worst, ok: worst < eps };
	});

	// the largest δ that works (searching on a fine grid), or none
	const bestDelta = $derived.by(() => {
		let best = 0;
		for (let k = 1; k <= 400; k++) {
			const d = k * 0.005;
			let ok = true;
			for (let i = 1; i < 120 && ok; i++) {
				const x1 = a - d + (2 * d * i) / 120;
				if (x1 < 0 || x1 > 4) continue;
				if (Math.abs(F(x1) - fa) >= eps) ok = false;
			}
			if (!ok) break;
			best = d;
		}
		return best;
	});

	function challenge() {
		eps = Math.max(0.05, Math.round(eps * 0.6 * 100) / 100);
	}
</script>

<div class="ed">
	<Svg viewBox="0 0 600 374" maxHeight={410} label="The graph of a function with a horizontal epsilon band around f(a) and a vertical delta window around a">
		<!-- axes -->
		<line x1={X0} y1={Y0} x2={X1 + 8} y2={Y0} stroke="rgba(200,192,170,0.45)" stroke-width="1.4" marker-end="url(#arrow-dim)" />
		<line x1={X0} y1={Y0} x2={X0} y2={Y1 - 6} stroke="rgba(200,192,170,0.45)" stroke-width="1.4" marker-end="url(#arrow-dim)" />
		{#each [0, 1, 2, 3, 4] as k (k)}
			<line x1={sx(k)} y1={Y0} x2={sx(k)} y2={Y0 + 5} stroke="rgba(200,192,170,0.5)" />
			<text x={sx(k)} y={Y0 + 20} text-anchor="middle" class="t-ui">{k}</text>
		{/each}
		<!-- ε band -->
		<rect x={X0} y={bandTop} width={X1 - X0} height={bandBot - bandTop} fill="rgba(95,214,207,0.1)" />
		{#each [fa + eps, fa - eps] as edge (edge)}
			{#if sy(edge) >= Y1 && sy(edge) <= Y0}
				<line x1={X0} y1={sy(edge)} x2={X1} y2={sy(edge)} stroke="var(--teal)" stroke-dasharray="6 5" stroke-width="1.4" />
			{/if}
		{/each}
		<!-- δ window -->
		<rect x={winL} y={Y1} width={winR - winL} height={Y0 - Y1} fill="rgba(164,147,255,0.1)" />
		{#each [a - delta, a + delta] as edge (edge)}
			{#if edge >= 0 && edge <= 4}
				<line x1={sx(edge)} y1={Y1} x2={sx(edge)} y2={Y0} stroke="var(--violet)" stroke-dasharray="6 5" stroke-width="1.4" />
			{/if}
		{/each}
		<!-- the graph -->
		{#each curve as seg, i (i)}
			<polyline points={seg.map((p) => p.join(',')).join(' ')} fill="none" stroke="rgba(235,229,213,0.55)" stroke-width="2.2" />
		{/each}
		{#each windowPts.runs as run, i (i)}
			<polyline
				points={run.pts.map((p) => p.join(',')).join(' ')}
				fill="none"
				stroke={run.ok ? 'var(--green)' : 'var(--rose)'}
				stroke-width="4"
				stroke-linecap="round"
				filter="url(#glow)"
			/>
		{/each}
		{#if fn === 'jump'}
			<circle cx={sx(2)} cy={sy(F(1.9999))} r="4.5" fill="#0b1020" stroke="rgba(235,229,213,0.8)" stroke-width="1.6" />
			<circle cx={sx(2)} cy={sy(F(2))} r="4.5" fill="rgba(235,229,213,0.9)" />
		{/if}
		<!-- the point (a, f(a)) -->
		<line x1={sx(a)} y1={Y0} x2={sx(a)} y2={sy(fa)} stroke="rgba(244,215,156,0.4)" stroke-dasharray="2 4" />
		<line x1={X0} y1={sy(fa)} x2={sx(a)} y2={sy(fa)} stroke="rgba(244,215,156,0.4)" stroke-dasharray="2 4" />
		<circle cx={sx(a)} cy={sy(fa)} r="6.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" filter="url(#glow)" />
		<SvgTeX x={sx(a)} y={Y0 + 34} tex="a" color="var(--gold-bright)" size={16} w={30} h={22} />
		<SvgTeX x={X0 - 32} y={sy(fa)} tex="f(a)" color="var(--gold-bright)" size={15} w={46} h={22} />
		<!-- the ε label sits on the side of the frame away from the window -->
		<SvgTeX
			x={deltaRight ? X1 - 14 : X0 + 18}
			y={epsY + (epsUp ? -12 : 12)}
			tex={epsUp ? 'f(a)+\\varepsilon' : 'f(a)-\\varepsilon'}
			color="var(--teal)"
			size={13}
			w={80}
			h={20}
			anchor={deltaRight ? 'end' : 'start'}
		/>
		<SvgTeX x={deltaX + (deltaRight ? 16 : -16)} y={Y1} tex={deltaRight ? 'a+\\delta' : 'a-\\delta'} color="var(--violet)" size={13} w={50} h={20} anchor={deltaRight ? 'start' : 'end'} />
		<!-- the three handles -->
		<Handle
			x={X0}
			y={epsY}
			r={7.5}
			color="var(--teal)"
			label="ε, the challenger’s tolerance: drag the edge of the band up or down, or use the arrow keys"
			valuetext={`ε = ${eps.toFixed(2)}`}
			ondrag={([, py]) => setEps(Math.abs(uy(py) - fa))}
			onkey={(_, dy) => setEps(eps + (epsUp ? -dy : dy) * 0.01)}
		/>
		<Handle
			x={deltaX}
			y={Y1}
			r={7.5}
			color="var(--violet)"
			label="δ, your window: drag the edge of the window left or right, or use the arrow keys"
			valuetext={`δ = ${delta.toFixed(3)}`}
			ondrag={([px]) => setDelta(Math.abs(ux(px) - a))}
			onkey={(dx) => setDelta(delta + (deltaRight ? dx : -dx) * 0.005)}
		/>
		<Handle
			x={sx(a)}
			y={Y0}
			r={7.5}
			label="The point a: drag it along the x-axis, or use the arrow keys"
			valuetext={`a = ${a.toFixed(2)}`}
			ondrag={([px]) => setA(ux(px))}
			onkey={(dx) => setA(a + dx * 0.01)}
		/>
	</Svg>
	<div class="panel ui">
		<div class="row">
			<Segmented bind:value={fn} options={(Object.keys(fns) as FnId[]).map((k) => ({ value: k, label: fns[k].label }))} label="Function" />
			<Button variant="ghost" onclick={challenge}>Challenger: smaller ε!</Button>
			<span class="vals nums" aria-hidden="true">
				<span><i class="a">a</i> = {a.toFixed(2)}</span>
				<span><i class="e">ε</i> = {eps.toFixed(2)}</span>
				<span><i class="d">δ</i> = {delta.toFixed(3)}</span>
			</span>
		</div>
		<p class="verdict" aria-live="polite">
			{#if windowPts.ok}
				<strong class="ok">You win this round:</strong> every input within <TeX tex={'\\delta'} /> of <TeX tex="a" /> lands within
				<TeX tex={'\\varepsilon'} /> of <TeX tex="f(a)" />.
			{:else}
				<strong class="no">Not this δ:</strong> part of the graph over the window escapes the band (shown in rose).
			{/if}
			{#if bestDelta > 0}
				<span class="hint">The largest δ that works here is about <TeX tex={bestDelta.toFixed(3)} />.</span>
			{:else}
				<span class="hint bad">No δ at all works for this ε: arbitrarily close to <TeX tex="a" /> the graph jumps away. The function is not continuous at <TeX tex="a" />.</span>
			{/if}
		</p>
	</div>
</div>

<style>
	.ed {
		padding: 0.6rem 0.6rem 0;
	}
	.panel {
		padding: 0.75rem 1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
		font-size: 0.85rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-bottom: 0.6rem;
	}
	.vals {
		display: flex;
		gap: 1.1rem;
		margin-left: auto;
		color: var(--ink-dim);
		white-space: nowrap;
	}
	.vals i {
		font-family: var(--font-body);
		font-size: 1.08em;
	}
	.vals .a {
		color: var(--gold-bright);
	}
	.vals .e {
		color: var(--teal);
	}
	.vals .d {
		color: var(--violet);
	}
	.verdict {
		margin: 0.2rem 0 0;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.ok {
		color: var(--green);
	}
	.no {
		color: var(--rose);
	}
	.hint {
		display: block;
		margin-top: 0.25rem;
		color: var(--ink-faint);
	}
	.hint.bad {
		color: var(--rose);
	}
</style>
