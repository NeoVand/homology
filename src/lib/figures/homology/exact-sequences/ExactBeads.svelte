<script lang="ts">
	// 0 → ℤ --×m--> ℤ --mod k--> ℤ/k → 0, drawn with beads. Teal beads are in the
	// kernel of the outgoing map; gold rings mark the image of the incoming map.
	// Exactness = every teal bead is ringed and every ring is teal. A teal bead with
	// no ring glows rose: it is a "gap", i.e. homology.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let m = $state(2);
	let k = $state(2);
	let hover = $state<number | null>(null);

	const LEFT = [-3, -2, -1, 0, 1, 2, 3];
	const MID = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6];
	const xL = 150;
	const xM = 330;
	const cR: [number, number] = [505, 200];
	const yMid = (i: number) => 200 - i * 24; // bead i of the middle ℤ
	const yLeft = (j: number) => 200 - j * 46;
	const mod = (a: number, b: number) => ((a % b) + b) % b;
	const ringPos = (r: number) => {
		const t = Math.PI / 2 - (2 * Math.PI * r) / k;
		return [cR[0] + 52 * Math.cos(t), cR[1] - 52 * Math.sin(t)] as [number, number];
	};

	const isComplex = $derived(m % k === 0);
	const exactLeft = $derived(m !== 0);
	const exactMid = $derived(m === k);
	const allExact = $derived(exactLeft && exactMid);
	const midGap = $derived.by(() => {
		if (!isComplex) return null;
		if (m === 0) return '\\mathbb Z'; // kℤ / 0
		const q = m / k;
		return q === 1 ? '0' : `\\mathbb Z/${q}`;
	});

	const presets = [
		{ m: 2, k: 2, label: '×2, mod 2' },
		{ m: 4, k: 2, label: '×4, mod 2' },
		{ m: 0, k: 3, label: '×0, mod 3' },
		{ m: 2, k: 4, label: '×2, mod 4' }
	];
</script>

<div class="beads">
	<Svg viewBox="0 0 640 400" maxHeight={430} label="Beads for the groups of the sequence 0, Z, Z, Z/k, 0 and the maps between them">
		<!-- column titles -->
		<SvgTeX x={52} y={22} tex={'0'} size={18} color="var(--ink-dim)" w={40} h={28} />
		<SvgTeX x={xL} y={22} tex={'\\mathbb Z'} size={19} color="var(--ink-bright)" w={40} h={28} />
		<SvgTeX x={xM} y={22} tex={'\\mathbb Z'} size={19} color="var(--ink-bright)" w={40} h={28} />
		<SvgTeX x={cR[0]} y={22} tex={`\\mathbb Z/${k}`} size={19} color="var(--ink-bright)" w={70} h={28} />
		<SvgTeX x={612} y={22} tex={'0'} size={18} color="var(--ink-dim)" w={40} h={28} />
		<line x1="68" y1="22" x2={xL - 22} y2="22" class="top" marker-end="url(#arrow-dim)" />
		<line x1={xL + 22} y1="22" x2={xM - 22} y2="22" class="top" marker-end="url(#arrow-ivory)" />
		<line x1={xM + 22} y1="22" x2={cR[0] - 40} y2="22" class="top" marker-end="url(#arrow-ivory)" />
		<line x1={cR[0] + 40} y1="22" x2="596" y2="22" class="top" marker-end="url(#arrow-dim)" />
		<SvgTeX x={(xL + xM) / 2} y={40} tex={`\\times ${m}`} size={15} color="var(--gold-bright)" w={60} h={22} />
		<SvgTeX x={(xM + cR[0]) / 2 - 8} y={40} tex={`\\text{mod } ${k}`} size={15} color="var(--teal)" w={80} h={22} />

		<!-- the map ×m: arrows from left beads to their images -->
		{#each LEFT as j (j)}
			{@const tgt = m * j}
			{#if Math.abs(tgt) <= 6}
				<path
					d="M {xL + 9} {yLeft(j)} C {xL + 80} {yLeft(j)} {xM - 80} {yMid(tgt)} {xM - 10} {yMid(tgt)}"
					class="map"
					class:hot={hover !== null && hover === tgt}
				/>
			{/if}
		{/each}
		<!-- the map mod k, for the hovered bead -->
		{#if hover !== null}
			{@const r = mod(hover, k)}
			{@const p = ringPos(r)}
			<path d="M {xM + 10} {yMid(hover)} C {xM + 80} {yMid(hover)} {p[0] - 60} {p[1]} {p[0] - 10} {p[1]}" class="map teal" />
		{/if}

		<!-- left ℤ -->
		<text x={xL} y={yLeft(3) - 22} class="dots" text-anchor="middle">⋮</text>
		<text x={xL} y={yLeft(-3) + 34} class="dots" text-anchor="middle">⋮</text>
		{#each LEFT as j (j)}
			{@const inKer = m === 0 || j === 0}
			{@const inIm = j === 0}
			{@const gap = inKer && !inIm}
			<circle cx={xL} cy={yLeft(j)} r={gap ? 13 : 0} class="gapglow" />
			<circle cx={xL} cy={yLeft(j)} r="8" class="bead" class:ker={inKer} class:gap />
			{#if inIm}<circle cx={xL} cy={yLeft(j)} r="12" class="ring" />{/if}
			<text x={xL - 22} y={yLeft(j) + 4} class="num" text-anchor="end">{j}</text>
		{/each}

		<!-- middle ℤ -->
		<text x={xM} y={yMid(6) - 16} class="dots" text-anchor="middle">⋮</text>
		<text x={xM} y={yMid(-6) + 28} class="dots" text-anchor="middle">⋮</text>
		{#each MID as i (i)}
			{@const inKer = i % k === 0}
			{@const inIm = m === 0 ? i === 0 : i % m === 0}
			{@const gap = inKer && !inIm}
			{@const bad = inIm && !inKer}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g onpointerenter={() => (hover = i)} onpointerleave={() => (hover = null)} class="hit">
				<circle cx={xM} cy={yMid(i)} r="12" fill="transparent" />
				<circle cx={xM} cy={yMid(i)} r={gap || bad ? 13 : 0} class="gapglow" class:bad />
				<circle cx={xM} cy={yMid(i)} r="7.5" class="bead" class:ker={inKer} class:gap class:bad class:hov={hover === i} />
				{#if inIm}<circle cx={xM} cy={yMid(i)} r="11.5" class="ring" />{/if}
			</g>
			<text x={xM + 24} y={yMid(i) + 4} class="num">{i}</text>
		{/each}

		<!-- ℤ/k as a clock -->
		<circle cx={cR[0]} cy={cR[1]} r="52" class="clock" />
		{#each Array.from({ length: k }, (_, r) => r) as r (r)}
			{@const p = ringPos(r)}
			<circle cx={p[0]} cy={p[1]} r="8" class="bead ker" class:hov={hover !== null && mod(hover, k) === r} />
			<circle cx={p[0]} cy={p[1]} r="12" class="ring" />
			<text x={cR[0] + (p[0] - cR[0]) * 1.42} y={cR[1] + (p[1] - cR[1]) * 1.42 + 4} class="num" text-anchor="middle">{r}</text>
		{/each}

		<!-- verdicts under each column -->
		<g class="verdicts">
			<text x={xL} y={388} text-anchor="middle" class:ok={exactLeft} class:no={!exactLeft}>{exactLeft ? 'exact ✓' : 'gap: ℤ'}</text>
			<text x={xM} y={388} text-anchor="middle" class:ok={exactMid} class:no={!exactMid}>{exactMid ? 'exact ✓' : isComplex ? 'gap' : 'not a complex'}</text>
			<text x={cR[0]} y={388} text-anchor="middle" class="ok">exact ✓</text>
		</g>
	</Svg>

	<div class="read ui">
		<span class="legend"><span class="b ker"></span>kernel of the next map</span>
		<span class="legend"><span class="b ring"></span>image of the previous map</span>
		<span class="legend"><span class="b gap"></span>in the kernel, not in the image</span>
	</div>
	<div class="verdict" class:yes={allExact}>
		{#if allExact}
			<TeX tex={`0 \\to \\mathbb Z \\xrightarrow{\\times ${m}} \\mathbb Z \\xrightarrow{\\bmod ${k}} \\mathbb Z/${k} \\to 0`} /> is <b>short exact</b>: nothing lost, nothing extra.
		{:else if !isComplex}
			Not even a chain complex: <TeX tex={`1 \\mapsto ${m} \\mapsto ${mod(m, k)} \\neq 0`} />, so “image ⊆ kernel” fails (amber beads).
		{:else}
			A chain complex, but not exact. The gap
			<TeX tex={m === 0 ? `\\ker/\\im = ${k}\\mathbb Z / 0 \\cong \\mathbb Z` : `\\ker/\\im = ${k}\\mathbb Z/${m}\\mathbb Z \\cong ${midGap}`} /> in the middle{#if !exactLeft}, and <TeX tex={'\\mathbb Z/0 \\cong \\mathbb Z'} /> on the left{/if} — a homology group.
		{/if}
	</div>
	<Controls>
		<Slider bind:value={m} min={0} max={6} step={1} label="first map: multiply by m" format={(v) => String(v)} />
		<Slider bind:value={k} min={1} max={6} step={1} label="second map: reduce mod k" format={(v) => String(v)} />
		{#each presets as p (p.label)}
			<Button variant="ghost" active={m === p.m && k === p.k} onclick={() => ((m = p.m), (k = p.k))}>{p.label}</Button>
		{/each}
	</Controls>
</div>

<style>
	.top {
		stroke: rgba(235, 229, 213, 0.55);
		stroke-width: 1.4;
	}
	.map {
		fill: none;
		stroke: rgba(242, 208, 143, 0.35);
		stroke-width: 1.4;
		transition: stroke 0.2s;
	}
	.map.hot {
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.map.teal {
		stroke: var(--teal);
		stroke-width: 2.2;
		stroke-dasharray: 5 4;
	}
	.bead {
		fill: rgba(235, 229, 213, 0.12);
		stroke: rgba(235, 229, 213, 0.45);
		stroke-width: 1.2;
		transition: all 0.3s var(--ease);
	}
	.bead.ker {
		fill: var(--teal);
		stroke: #0b1020;
	}
	.bead.gap {
		fill: var(--rose);
	}
	.bead.bad {
		fill: rgba(235, 229, 213, 0.12);
		stroke: var(--amber);
		stroke-width: 2;
	}
	.bead.hov {
		stroke: #fff;
		stroke-width: 2.4;
	}
	.ring {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.2;
	}
	.gapglow {
		fill: rgba(242, 141, 182, 0.28);
		filter: url(#glow-strong);
		transition: r 0.3s var(--ease);
	}
	.gapglow.bad {
		fill: rgba(244, 181, 95, 0.3);
	}
	.hit {
		cursor: pointer;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 11px;
		fill: var(--ink-faint) !important;
	}
	.dots {
		fill: var(--ink-faint) !important;
		font-size: 16px;
	}
	.clock {
		fill: rgba(95, 214, 207, 0.05);
		stroke: rgba(95, 214, 207, 0.35);
		stroke-width: 1.2;
		stroke-dasharray: 3 4;
	}
	.verdicts text {
		font-family: var(--font-ui);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		font-weight: 650;
	}
	.verdicts .ok {
		fill: var(--green) !important;
	}
	.verdicts .no {
		fill: var(--rose) !important;
	}
	.read {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem 1.2rem;
		font-size: 0.74rem;
		color: var(--ink-dim);
		padding: 0 1rem;
	}
	.legend {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.b {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		display: inline-block;
	}
	.b.ker {
		background: var(--teal);
	}
	.b.ring {
		border: 2px solid var(--gold-bright);
	}
	.b.gap {
		background: var(--rose);
		box-shadow: 0 0 8px var(--rose);
	}
	.verdict {
		text-align: center;
		padding: 0.7rem 1.2rem 0.8rem;
		font-size: 0.95rem;
		color: var(--ink-dim);
	}
	.verdict.yes {
		color: var(--ink-bright);
	}
	.verdict.yes b {
		color: var(--green);
	}
</style>
