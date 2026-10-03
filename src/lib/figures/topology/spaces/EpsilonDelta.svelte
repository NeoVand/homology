<script lang="ts">
	// The ε–δ game: the challenger picks ε (a band around f(a)); you answer with δ
	// (a window around a). You win if the whole graph over the window stays in the band.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
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

	const fa = $derived(F(a));

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
		<rect x={X0} y={sy(fa + eps)} width={X1 - X0} height={sy(fa - eps) - sy(fa + eps)} fill="rgba(95,214,207,0.1)" />
		<line x1={X0} y1={sy(fa + eps)} x2={X1} y2={sy(fa + eps)} stroke="var(--teal)" stroke-dasharray="6 5" stroke-width="1.4" />
		<line x1={X0} y1={sy(fa - eps)} x2={X1} y2={sy(fa - eps)} stroke="var(--teal)" stroke-dasharray="6 5" stroke-width="1.4" />
		<!-- δ window -->
		<rect x={sx(Math.max(0, a - delta))} y={Y1} width={sx(Math.min(4, a + delta)) - sx(Math.max(0, a - delta))} height={Y0 - Y1} fill="rgba(164,147,255,0.1)" />
		<line x1={sx(a - delta)} y1={Y1} x2={sx(a - delta)} y2={Y0} stroke="var(--violet)" stroke-dasharray="6 5" stroke-width="1.4" />
		<line x1={sx(a + delta)} y1={Y1} x2={sx(a + delta)} y2={Y0} stroke="var(--violet)" stroke-dasharray="6 5" stroke-width="1.4" />
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
		<SvgTeX x={X0 - 26} y={sy(fa)} tex="f(a)" color="var(--gold-bright)" size={15} w={46} h={22} />
		<SvgTeX x={X1 - 14} y={sy(fa + eps) - 12} tex={'f(a)+\\varepsilon'} color="var(--teal)" size={13} w={80} h={20} anchor="end" />
		<SvgTeX x={sx(a + delta) + 6} y={Y1 + 12} tex={'a+\\delta'} color="var(--violet)" size={13} w={50} h={20} anchor="start" />
	</Svg>
	<div class="panel ui">
		<div class="row">
			<Segmented bind:value={fn} options={(Object.keys(fns) as FnId[]).map((k) => ({ value: k, label: fns[k].label }))} label="Function" />
			<Button variant="ghost" onclick={challenge}>Challenger: smaller ε!</Button>
		</div>
		<div class="row sliders">
			<Slider bind:value={a} min={0.3} max={3.7} step={0.01} label="Point a" />
			<Slider bind:value={eps} min={0.05} max={0.8} step={0.01} label="ε (challenger)" />
			<Slider bind:value={delta} min={0.01} max={1} step={0.005} label="δ (your answer)" />
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
	.sliders {
		gap: 0.8rem 1.4rem;
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
