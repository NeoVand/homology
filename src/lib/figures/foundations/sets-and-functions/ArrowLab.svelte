<script lang="ts">
	// The arrow-diagram lab: draw arrows from X to Y, see whether you have drawn a
	// function (and whether it is injective / surjective / bijective), then explore
	// images f(A) and preimages f⁻¹(B) — which exist even when f has no inverse.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { classify, image, preimage, type Arrow } from './maps';

	type Mode = 'draw' | 'image' | 'preimage';
	let mode = $state<Mode>('draw');
	let m = $state(4);
	let n = $state(4);
	let arrows = $state<Arrow[]>([
		[0, 1],
		[1, 0],
		[2, 1],
		[3, 3]
	]);
	let pending = $state<number | null>(null);
	let A = $state<number[]>([0, 2]);
	let B = $state<number[]>([1]);

	const xs = ['1', '2', '3', '4', '5', '6'];
	const ys = ['a', 'b', 'c', 'd', 'e', 'f'];

	const live = $derived(arrows.filter(([x, y]) => x < m && y < n));
	const cls = $derived(classify(live, m, n));
	const fA = $derived(image(live, A.filter((x) => x < m)));
	const pB = $derived(preimage(live, B.filter((y) => y < n)));

	const LX = 96;
	const RX = 284;
	const DY = 50;
	const rows = $derived(Math.max(m, n));
	const H = $derived(84 + (rows - 1) * DY + 50);
	const yX = (i: number) => 74 + ((rows - m) * DY) / 2 + i * DY;
	const yY = (j: number) => 74 + ((rows - n) * DY) / 2 + j * DY;

	function path(x: number, y: number) {
		const x1 = LX + 15;
		const y1 = yX(x);
		const x2 = RX - 18;
		const y2 = yY(y);
		const mx = (x1 + x2) / 2;
		return `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
	}

	function has(x: number, y: number) {
		return arrows.some(([a, b]) => a === x && b === y);
	}
	function toggleArrow(x: number, y: number) {
		arrows = has(x, y) ? arrows.filter(([a, b]) => !(a === x && b === y)) : [...arrows, [x, y]];
	}
	function clickX(i: number) {
		if (mode === 'draw') pending = pending === i ? null : i;
		else if (mode === 'image') A = A.includes(i) ? A.filter((x) => x !== i) : [...A, i];
	}
	function clickY(j: number) {
		if (mode === 'draw') {
			if (pending !== null) {
				toggleArrow(pending, j);
				pending = null;
			}
		} else if (mode === 'preimage') B = B.includes(j) ? B.filter((y) => y !== j) : [...B, j];
	}
	function key(e: KeyboardEvent, f: () => void) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			f();
		}
	}

	const presets: { id: string; label: string; m: number; n: number; arrows: Arrow[] }[] = [
		{ id: 'nf', label: 'not a function', m: 4, n: 4, arrows: [[0, 0], [1, 1], [1, 2], [3, 3]] },
		{ id: 'inj', label: 'injective', m: 3, n: 5, arrows: [[0, 1], [1, 3], [2, 4]] },
		{ id: 'sur', label: 'surjective', m: 5, n: 3, arrows: [[0, 0], [1, 2], [2, 1], [3, 2], [4, 0]] },
		{ id: 'bij', label: 'bijective', m: 4, n: 4, arrows: [[0, 2], [1, 0], [2, 3], [3, 1]] },
		{ id: 'nei', label: 'neither', m: 4, n: 4, arrows: [[0, 1], [1, 0], [2, 1], [3, 3]] }
	];
	function load(p: (typeof presets)[number]) {
		m = p.m;
		n = p.n;
		arrows = p.arrows.map((a) => [a[0], a[1]] as Arrow);
		pending = null;
	}

	const nameX = (i: number) => xs[i];
	const nameY = (j: number) => ys[j];
	const setTeX = (els: string[]) => (els.length ? String.raw`\{${els.join(',')}\}` : String.raw`\varnothing`);

	const badges = $derived.by(() => {
		const fn = cls.isFunction
			? { ok: true, why: 'every element of X has exactly one arrow' }
			: {
					ok: false,
					why: cls.noArrow.length
						? `${cls.noArrow.map(nameX).join(', ')} ${cls.noArrow.length === 1 ? 'has' : 'have'} no arrow`
						: `${cls.manyArrows.map(nameX).join(', ')} ${cls.manyArrows.length === 1 ? 'has' : 'have'} two arrows`
				};
		const inj = !cls.isFunction
			? { ok: null, why: 'only asked of functions' }
			: cls.injective
				? { ok: true, why: 'no two arrows land together' }
				: { ok: false, why: `${nameX(cls.collision![0])} and ${nameX(cls.collision![1])} both go to ${nameY(cls.collision![2])}` };
		const sur = !cls.isFunction
			? { ok: null, why: 'only asked of functions' }
			: cls.surjective
				? { ok: true, why: 'every element of Y is hit' }
				: { ok: false, why: `${cls.missed.map(nameY).join(', ')} ${cls.missed.length === 1 ? 'is' : 'are'} never hit` };
		const bij = !cls.isFunction
			? { ok: null, why: 'only asked of functions' }
			: cls.bijective
				? { ok: true, why: 'a perfect matching' }
				: { ok: false, why: 'needs both of the above' };
		return [
			{ name: 'Function', ...fn },
			{ name: 'Injective', ...inj },
			{ name: 'Surjective', ...sur },
			{ name: 'Bijective', ...bij }
		];
	});

	const readout = $derived.by(() => {
		if (mode === 'draw')
			return pending === null
				? 'Tap an element of \\(X\\), then an element of \\(Y\\), to draw (or erase) an arrow.'
				: `Now tap where \\(${nameX(pending)}\\) should go.`;
		if (!cls.isFunction) return 'This diagram is not a function yet: every element of \\(X\\) needs exactly one arrow. Fix it in “Draw” mode, or load a preset.';
		if (mode === 'image') {
			const a = A.filter((x) => x < m).sort((p, q) => p - q).map(nameX);
			return String.raw`Tap elements of \(X\) to choose \(A\). \(f(A) = f(${setTeX(a)}) = ${setTeX(fA.map(nameY))}\): where the elements of \(A\) land.`;
		}
		const b = B.filter((y) => y < n).sort((p, q) => p - q).map(nameY);
		const extra = cls.bijective ? '' : ' This \\(f\\) has no inverse function, yet the preimage makes perfect sense.';
		return String.raw`Tap elements of \(Y\) to choose \(B\). \(f^{-1}(B) = f^{-1}(${setTeX(b)}) = ${setTeX(pB.map(nameX))}\): everyone who lands in \(B\).${extra}`;
	});
</script>

<div class="lab">
	<div class="badges">
		{#each badges as b (b.name)}
			<div class="badge" class:ok={b.ok === true} class:no={b.ok === false} class:na={b.ok === null}>
				<span class="ic">{b.ok === true ? '✓' : b.ok === false ? '✗' : '–'}</span>
				<span class="nm ui">{b.name}</span>
				<span class="why">{b.why}</span>
			</div>
		{/each}
	</div>

	<Svg viewBox="0 0 380 {H}" maxHeight={460} label="An arrow diagram from the set X on the left to the set Y on the right">
		<rect x={LX - 30} y="30" width="60" height={H - 50} rx="30" class="set" />
		<rect x={RX - 30} y="30" width="60" height={H - 50} rx="30" class="set" />
		<text x={LX} y="22" class="sname">X</text>
		<text x={RX} y="22" class="sname">Y</text>

		{#each live as a (a[0] + ',' + a[1])}
			{@const fromA = mode === 'image' && A.includes(a[0])}
			{@const intoB = mode === 'preimage' && B.includes(a[1])}
			{@const doubled = mode === 'draw' && cls.manyArrows.includes(a[0])}
			{@const collides = mode === 'draw' && cls.isFunction && !cls.injective && cls.collision !== null && a[1] === cls.collision[2]}
			<g class="arrow" class:gold={fromA} class:teal={intoB} class:amber={doubled || collides}>
				<path d={path(a[0], a[1])} class="hit" role="button" tabindex="-1" aria-label="arrow from {nameX(a[0])} to {nameY(a[1])}" onclick={() => mode === 'draw' && toggleArrow(a[0], a[1])} />
				<path
					d={path(a[0], a[1])}
					class="line"
					marker-end={fromA ? 'url(#arrow-gold)' : intoB ? 'url(#arrow-teal)' : doubled || collides ? 'url(#arrow-amber)' : 'url(#arrow-ivory)'}
				/>
			</g>
		{/each}

		{#each Array(m) as _, i (i)}
			{@const inA = mode === 'image' && A.includes(i)}
			{@const inPre = mode === 'preimage' && cls.isFunction && pB.includes(i)}
			{@const bad = mode === 'draw' && (cls.noArrow.includes(i) || cls.manyArrows.includes(i))}
			<g
				class="pt"
				class:pending={pending === i && mode === 'draw'}
				class:violet={inA}
				class:teal={inPre}
				class:bad
				role="button"
				tabindex="0"
				aria-label="element {nameX(i)} of X"
				onclick={() => clickX(i)}
				onkeydown={(e) => key(e, () => clickX(i))}
			>
				<circle cx={LX} cy={yX(i)} r="22" class="hit" />
				<circle cx={LX} cy={yX(i)} r="14" class="dot" />
				<text x={LX} y={yX(i) + 5} class="lb">{nameX(i)}</text>
			</g>
		{/each}
		{#each Array(n) as _, j (j)}
			{@const inB = mode === 'preimage' && B.includes(j)}
			{@const inImg = mode === 'image' && cls.isFunction && fA.includes(j)}
			{@const missed = mode === 'draw' && cls.isFunction && cls.missed.includes(j)}
			{@const hitTwice = mode === 'draw' && cls.isFunction && cls.collision !== null && cls.collision[2] === j}
			<g
				class="pt"
				class:teal={inB}
				class:gold={inImg}
				class:missed
				class:twice={hitTwice}
				class:target={mode === 'draw' && pending !== null}
				role="button"
				tabindex="0"
				aria-label="element {nameY(j)} of Y"
				onclick={() => clickY(j)}
				onkeydown={(e) => key(e, () => clickY(j))}
			>
				<circle cx={RX} cy={yY(j)} r="22" class="hit" />
				<circle cx={RX} cy={yY(j)} r="14" class="dot" />
				<text x={RX} y={yY(j) + 5} class="lb">{nameY(j)}</text>
			</g>
		{/each}
	</Svg>

	<p class="readout" aria-live="polite">{@html renderMathInText(readout)}</p>

	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'draw', label: 'Draw & classify' },
				{ value: 'image', label: 'Image f(A)' },
				{ value: 'preimage', label: 'Preimage f⁻¹(B)' }
			]}
			label="Mode"
			onchange={() => (pending = null)}
		/>
		<div class="sizes">
			<div class="sl"><Slider bind:value={m} min={1} max={6} step={1} label="size of X" /></div>
			<div class="sl"><Slider bind:value={n} min={1} max={6} step={1} label="size of Y" /></div>
		</div>
		<div class="presets">
			<span class="pl ui">Load:</span>
			{#each presets as p (p.id)}
				<Button variant="ghost" onclick={() => load(p)}>{p.label}</Button>
			{/each}
			<Button variant="subtle" onclick={() => ((arrows = []), (pending = null))}>clear</Button>
		</div>
	</Controls>
</div>

<style>
	.badges {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 0.45rem;
		padding: 1rem 1.1rem 0.2rem;
	}
	.badge {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 0.5rem;
		align-items: center;
		padding: 0.4rem 0.6rem;
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.02);
	}
	.badge.ok {
		border-color: rgba(132, 217, 162, 0.45);
		background: rgba(132, 217, 162, 0.07);
	}
	.badge.no {
		border-color: rgba(242, 141, 182, 0.4);
		background: rgba(242, 141, 182, 0.06);
	}
	.ic {
		grid-row: span 2;
		display: grid;
		place-items: center;
		width: 1.45rem;
		height: 1.45rem;
		border-radius: 50%;
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.78rem;
		background: rgba(255, 255, 255, 0.1);
		color: var(--ink-dim);
	}
	.badge.ok .ic {
		background: var(--green);
		color: #07140c;
	}
	.badge.no .ic {
		background: var(--rose);
		color: #1a0d14;
	}
	.nm {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-bright);
	}
	.why {
		font-size: 0.8rem;
		color: var(--ink-dim);
		line-height: 1.3;
	}
	.badge.na .why,
	.badge.na .nm {
		color: var(--ink-faint);
	}
	.lab > :global(svg) {
		padding: 0.2rem 0.5rem 0;
	}
	.set {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(116, 169, 255, 0.3);
		stroke-width: 1.2;
	}
	.sname {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 20px !important;
		fill: var(--gold) !important;
		text-anchor: middle;
	}
	.arrow .hit {
		fill: none;
		stroke: transparent;
		stroke-width: 14;
		cursor: pointer;
	}
	.arrow .line {
		fill: none;
		stroke: rgba(235, 229, 213, 0.75);
		stroke-width: 1.8;
		pointer-events: none;
		transition: stroke 0.2s;
	}
	.arrow:hover .line {
		stroke: #fff;
	}
	.arrow.gold .line {
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.arrow.teal .line {
		stroke: var(--teal);
		stroke-width: 2.4;
	}
	.arrow.amber .line {
		stroke: var(--amber);
		stroke-width: 2.2;
	}
	.pt {
		cursor: pointer;
	}
	.pt:focus {
		outline: none;
	}
	.pt .hit {
		fill: transparent;
	}
	.pt .dot {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
		transition: all 0.2s;
	}
	.pt:hover .dot,
	.pt:focus-visible .dot {
		stroke: #fff;
		stroke-width: 2;
	}
	.lb {
		font-family: var(--font-ui);
		font-size: 12.5px !important;
		font-weight: 700;
		fill: #120d05 !important;
		text-anchor: middle;
		pointer-events: none;
	}
	.pt.pending .dot {
		stroke: var(--gold-bright);
		stroke-width: 3;
		filter: drop-shadow(0 0 8px rgba(242, 208, 143, 0.9));
	}
	.pt.target .dot {
		stroke: var(--gold-bright);
		stroke-dasharray: 3 3;
	}
	.pt.bad .dot {
		fill: var(--rose);
	}
	.pt.violet .dot {
		fill: var(--violet);
		stroke: #ece8ff;
	}
	.pt.teal .dot {
		fill: var(--teal);
		stroke: #e3fffb;
		filter: drop-shadow(0 0 8px rgba(95, 214, 207, 0.8));
	}
	.pt.gold .dot {
		fill: #f2d08f;
		stroke: #fff;
		filter: drop-shadow(0 0 8px rgba(242, 208, 143, 0.9));
	}
	.pt.missed .dot {
		fill: rgba(20, 28, 52, 0.95);
		stroke: var(--violet);
		stroke-dasharray: 3 2.5;
		stroke-width: 2;
	}
	.pt.missed .lb {
		fill: var(--violet) !important;
	}
	.pt.twice .dot {
		stroke: var(--amber);
		stroke-width: 3;
	}
	.readout {
		margin: 0.4rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
	.sizes {
		display: flex;
		gap: 1rem;
		flex: 1 1 16rem;
	}
	.sl {
		flex: 1;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		width: 100%;
	}
	.pl {
		font-size: 0.74rem;
		color: var(--ink-faint);
		margin-right: 0.2rem;
	}
</style>
