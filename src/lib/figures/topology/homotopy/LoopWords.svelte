<script lang="ts">
	// Build loops on the figure eight from the letters a, b, a⁻¹, b⁻¹.
	// Left: the loop itself. Middle: its walk on the tree of reduced words
	// (π₁ remembers the order). Right: its walk on the grid ℤ² (H₁ only counts).
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { ClearIcon, PlayIcon, PlusIcon, TightenIcon, UndoIcon } from '$lib/icons';
	import { abelianize, abelianTeX, cancellingIndices, inverseLetter, pathD, reduceWord, wordTeX, type Letter, type Pt } from './geom';

	const MAX = 12;
	let word = $state<Letter[]>(['a', 'b']);
	let tau = $state(1);
	let raf = 0;
	let example = $state('ab');

	const reduced = $derived(reduceWord(word));
	const ab = $derived(abelianize(word));
	const gone = $derived(cancellingIndices(word));
	const isComm = $derived(word.join('') === 'abAB');

	const isA = (x: Letter) => x === 'a' || x === 'A';
	const inv = (x: Letter) => x === 'A' || x === 'B';
	const colorOf = (x: Letter) => (isA(x) ? 'var(--gold-bright)' : 'var(--teal)');
	const letterTeX: Record<Letter, string> = { a: 'a', b: 'b', A: 'a^{-1}', B: 'b^{-1}' };

	// ── the figure eight ──
	const R = 70;
	const FX = 180;
	const FY = 122;
	/** point on the petal of letter x, in lane `lane`, at fraction f of the traversal */
	function petal(x: Letter, lane: number, f: number): Pt {
		const lam = 0.1 + 0.085 * (lane % 7);
		const ff = inv(x) ? 1 - f : f;
		const phi = 2 * Math.PI * ff;
		const r = R * (1 - lam * Math.sin(phi / 2) ** 2);
		if (isA(x)) return [FX - R + r * Math.cos(phi), FY - r * Math.sin(phi)];
		return [FX + R + r * Math.cos(Math.PI + phi), FY - r * Math.sin(Math.PI + phi)];
	}
	const petals = $derived(
		word.map((x, i) => {
			const pts: Pt[] = [];
			for (let k = 0; k <= 64; k++) pts.push(petal(x, i, k / 64));
			const f = 0.5 + 0.11 * ((i % 3) - 1);
			return { x, i, d: pathD(pts), mid: petal(x, i, inv(x) ? 1 - f : f), arrow: [petal(x, i, 0.24), petal(x, i, 0.28)] as [Pt, Pt] };
		})
	);

	// ── the tree of reduced words (the Cayley graph of the free group) ──
	const TC = 150;
	const L0 = 62;
	const step: Record<Letter, Pt> = { a: [1, 0], A: [-1, 0], b: [0, -1], B: [0, 1] };
	const treeEdges: { x1: number; y1: number; x2: number; y2: number; h: boolean; depth: number }[] = [];
	(function grow(p: Pt, depth: number, last: Letter | null) {
		if (depth >= 4) return;
		const L = L0 * Math.pow(0.5, depth);
		for (const x of ['a', 'A', 'b', 'B'] as Letter[]) {
			if (last && x === inverseLetter(last)) continue;
			const q: Pt = [p[0] + step[x][0] * L, p[1] + step[x][1] * L];
			treeEdges.push({ x1: p[0], y1: p[1], x2: q[0], y2: q[1], h: isA(x), depth });
			grow(q, depth + 1, x);
		}
	})([TC, TC], 0, null);

	/** the vertices the word visits on the tree; beyond the drawn depth the steps keep halving */
	const treeWalk = $derived.by(() => {
		const pts: Pt[] = [[TC, TC]];
		const stack: Letter[] = [];
		for (const x of word) {
			if (stack.length && stack[stack.length - 1] === inverseLetter(x)) stack.pop();
			else stack.push(x);
			let p: Pt = [TC, TC];
			stack.forEach((y, d) => {
				const L = L0 * Math.pow(0.5, d);
				p = [p[0] + step[y][0] * L, p[1] + step[y][1] * L];
			});
			pts.push(p);
		}
		return pts;
	});

	// ── the grid ℤ² ──
	const GC = 150;
	const G = 26;
	const span = 5;
	const latticeWalk = $derived.by(() => {
		const pts: Pt[] = [[GC, GC]];
		let m = 0;
		let n = 0;
		for (const x of word) {
			if (x === 'a') m++;
			else if (x === 'A') m--;
			else if (x === 'b') n++;
			else n--;
			pts.push([GC + G * Math.max(-span, Math.min(span, m)), GC - G * Math.max(-span, Math.min(span, n))]);
		}
		return pts;
	});
	const ints = Array.from({ length: 2 * span + 1 }, (_, k) => k - span);

	// ── one bead per panel, all at the same moment of the trip ──
	function along(pts: Pt[], t: number): Pt {
		const n = pts.length - 1;
		if (n <= 0) return pts[0];
		const x = Math.min(n - 1e-9, Math.max(0, t * n));
		const i = Math.floor(x);
		const f = x - i;
		return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
	}
	const bead8 = $derived.by((): Pt => {
		const n = word.length;
		if (!n) return [FX, FY];
		const x = Math.min(n - 1e-9, tau * n);
		const i = Math.floor(x);
		return petal(word[i], i, x - i);
	});
	const beadTree = $derived(along(treeWalk, tau));
	const beadGrid = $derived(along(latticeWalk, tau));
	const treeEnd = $derived(treeWalk[treeWalk.length - 1]);
	const gridEnd = $derived(latticeWalk[latticeWalk.length - 1]);

	const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
	/** animate the bead from `from` (a fraction of the trip) to the end */
	function run(from = 0) {
		cancelAnimationFrame(raf);
		if (!word.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			tau = 1;
			return;
		}
		tau = from;
		const t0 = performance.now();
		const dur = 650 * word.length * (1 - from) + 250;
		const tick = (now: number) => {
			const x = Math.min(1, (now - t0) / dur);
			tau = from + (1 - from) * ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	function push(x: Letter) {
		if (word.length >= MAX) return;
		example = '';
		const before = word.length;
		word = [...word, x];
		run(before / word.length);
	}
	function removeAt(i: number) {
		example = '';
		word = word.filter((_, k) => k !== i);
		cancelAnimationFrame(raf);
		tau = 1;
	}
	function setWord(w: string) {
		word = w.split('') as Letter[];
		run(0);
	}
	function pullTight() {
		example = '';
		word = reduceWord(word);
		run(0);
	}
	const keys: { x: Letter; label: string }[] = [
		{ x: 'a', label: 'a' },
		{ x: 'b', label: 'b' },
		{ x: 'A', label: 'a^{-1}' },
		{ x: 'B', label: 'b^{-1}' }
	];
</script>

<div class="panels">
	<div class="pane p8">
		<div class="ptitle ui">the loop on <TeX tex={String.raw`S^1 \vee S^1`} /></div>
		<Svg viewBox="0 0 360 244" maxHeight={300} label="The figure eight with the current loop drawn as nested petals, one per letter">
			<circle cx={FX - R} cy={FY} r={R} fill="none" stroke="rgba(242,208,143,0.16)" stroke-width="8" />
			<circle cx={FX + R} cy={FY} r={R} fill="none" stroke="rgba(95,214,207,0.16)" stroke-width="8" />
			<SvgTeX x={FX - 2 * R - 18} y={FY} tex="a" size={20} color="var(--gold-bright)" w={24} h={26} />
			<SvgTeX x={FX + 2 * R + 18} y={FY} tex="b" size={20} color="var(--teal)" w={24} h={26} />
			{#each petals as p (p.i)}
				{@const off = gone.has(p.i)}
				<path d={p.d} fill="none" stroke={colorOf(p.x)} stroke-width="2.2" stroke-opacity={off ? 0.4 : 1} stroke-dasharray={off ? '5 4' : undefined} filter={off ? undefined : 'url(#glow)'} />
				<line x1={p.arrow[0][0]} y1={p.arrow[0][1]} x2={p.arrow[1][0]} y2={p.arrow[1][1]} stroke={colorOf(p.x)} stroke-width="2" marker-end="url(#arrow-{isA(p.x) ? 'gold' : 'teal'})" />
				{#if word.length <= 8}
					<circle cx={p.mid[0]} cy={p.mid[1]} r="8" fill="#0b1122" stroke={colorOf(p.x)} stroke-width="1.2" />
					<text x={p.mid[0]} y={p.mid[1] + 3.6} text-anchor="middle" class="num">{p.i + 1}</text>
				{/if}
			{/each}
			<circle cx={FX} cy={FY} r="5.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.2" />
			<SvgTeX x={FX} y={FY + 50} tex="x_0" size={14} w={30} h={20} />
			{#if word.length}
				<circle cx={bead8[0]} cy={bead8[1]} r="5.5" fill="#fff8e6" stroke="#060912" stroke-width="1.2" filter="url(#glow)" />
			{/if}
		</Svg>
	</div>
	<div class="pane">
		<div class="ptitle ui"><TeX tex={String.raw`\pi_1`} />: a walk on the tree of words</div>
		<Svg viewBox="0 0 300 300" maxHeight={300} label="The tree of reduced words with the current word's walk; its end is the reduced word">
			{#each treeEdges as e, k (k)}
				<line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={e.h ? 'rgba(242,208,143,0.22)' : 'rgba(95,214,207,0.22)'} stroke-width={1.6 - e.depth * 0.3} />
			{/each}
			<path d={pathD(treeWalk)} fill="none" stroke="rgba(251,246,232,0.16)" stroke-width="7" stroke-linejoin="round" stroke-linecap="round" />
			<path d={pathD(treeWalk)} fill="none" stroke="#fbf6e8" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" />
			<circle cx={TC} cy={TC} r="4.5" fill="url(#vertex-fill)" stroke="#060912" />
			<SvgTeX x={TC - 11} y={TC + 13} tex="e" size={13} w={18} h={18} color="var(--ink-dim)" />
			{#if reduced.length}
				<circle cx={treeEnd[0]} cy={treeEnd[1]} r="7" fill="none" stroke="var(--rose)" stroke-width="1.8" />
			{/if}
			<circle cx={beadTree[0]} cy={beadTree[1]} r="4.5" fill="#fff8e6" filter="url(#glow)" />
		</Svg>
	</div>
	<div class="pane">
		<div class="ptitle ui"><TeX tex={String.raw`H_1`} />: a walk on the grid <TeX tex={String.raw`\Z^2`} /></div>
		<Svg viewBox="0 0 300 300" maxHeight={300} label="The integer grid with the current word's walk; its end is the class of the loop in H1">
			{#each ints as k (k)}
				<line x1={GC + G * k} x2={GC + G * k} y1={GC - G * span} y2={GC + G * span} stroke={k === 0 ? 'rgba(95,214,207,0.3)' : 'rgba(95,214,207,0.09)'} />
				<line y1={GC + G * k} y2={GC + G * k} x1={GC - G * span} x2={GC + G * span} stroke={k === 0 ? 'rgba(242,208,143,0.3)' : 'rgba(242,208,143,0.09)'} />
			{/each}
			<SvgTeX x={GC + G * span + 10} y={GC} tex="a" size={14} w={20} h={20} color="var(--gold-bright)" />
			<SvgTeX x={GC} y={GC - G * span - 12} tex="b" size={14} w={20} h={20} color="var(--teal)" />
			{#each latticeWalk.slice(1) as p, i (i)}
				{@const q = latticeWalk[i]}
				<line x1={q[0]} y1={q[1]} x2={p[0]} y2={p[1]} stroke={colorOf(word[i])} stroke-width="2.6" stroke-linecap="round" />
			{/each}
			<circle cx={GC} cy={GC} r="4.5" fill="url(#vertex-fill)" stroke="#060912" />
			<SvgTeX x={GC - 11} y={GC + 13} tex="0" size={13} w={18} h={18} color="var(--ink-dim)" />
			{#if ab[0] || ab[1]}
				<circle cx={gridEnd[0]} cy={gridEnd[1]} r="7" fill="none" stroke="var(--rose)" stroke-width="1.8" />
			{/if}
			<circle cx={beadGrid[0]} cy={beadGrid[1]} r="4.5" fill="#fff8e6" filter="url(#glow)" />
		</Svg>
	</div>
</div>

<div class="composer ui">
	<span class="k">word</span>
	<div class="chips" aria-label="The word; select a letter to remove it">
		{#each word as x, i (i)}
			<button
				type="button"
				class="chip"
				class:a={isA(x)}
				class:off={gone.has(i)}
				title="Remove this letter"
				aria-label="Remove letter {i + 1}, {x === 'A' ? 'a inverse' : x === 'B' ? 'b inverse' : x}"
				onclick={() => removeAt(i)}><TeX tex={letterTeX[x]} /></button
			>
		{:else}
			<span class="empty">the empty word: stay at <TeX tex="x_0" /></span>
		{/each}
	</div>
	<div class="keys">
		{#each keys as k (k.x)}
			<button type="button" class="key" class:a={isA(k.x)} disabled={word.length >= MAX} aria-label="Append {k.x === 'A' ? 'a inverse' : k.x === 'B' ? 'b inverse' : k.x}" onclick={() => push(k.x)}
				><Icon icon={PlusIcon} size={11} stroke={2} /><TeX tex={k.label} /></button
			>
		{/each}
		<button type="button" class="key tool" disabled={!word.length} title="Remove the last letter" aria-label="Remove the last letter" onclick={() => removeAt(word.length - 1)}
			><Icon icon={UndoIcon} size={16} /></button
		>
		<button
			type="button"
			class="key tool"
			disabled={!word.length}
			title="Clear the word"
			aria-label="Clear the word"
			onclick={() => {
				example = '';
				word = [];
				tau = 1;
			}}><Icon icon={ClearIcon} size={16} /></button
		>
	</div>
</div>

<dl class="readout ui" aria-live="polite">
	<div class="row">
		<dt>in <TeX tex={String.raw`\pi_1`} /></dt>
		<dd>
			<TeX tex={wordTeX(reduced)} />
			<span class="note">{reduced.length < word.length ? 'after cancelling the dashed petals' : 'already reduced'}</span>
		</dd>
	</div>
	<div class="row">
		<dt>in <TeX tex={String.raw`H_1`} /></dt>
		<dd><TeX tex={abelianTeX(ab)} /> <span class="note">only the net counts survive</span></dd>
	</div>
	{#if isComm}
		<p class="hl">
			The commutator goes once round each circle in each direction. Its counts are zero, so in <TeX tex={String.raw`H_1`} /> it is 0; but on
			the tree it ends four steps from home: as a loop it cannot be shrunk.
		</p>
	{/if}
</dl>

<Controls>
	<Segmented
		bind:value={example}
		label="Example words"
		options={[
			{ value: 'ab', label: 'ab' },
			{ value: 'ba', label: 'ba' },
			{ value: 'abAB', label: 'aba⁻¹b⁻¹' },
			{ value: 'abBaA', label: 'abb⁻¹aa⁻¹' }
		]}
		onchange={setWord}
	/>
	<Button icon={TightenIcon} onclick={pullTight} disabled={reduced.length === word.length}>Pull tight</Button>
	<Button variant="gold" icon={PlayIcon} onclick={() => run(0)} disabled={!word.length}>Trace</Button>
</Controls>

<style>
	.panels {
		display: grid;
		grid-template-columns: 1.2fr 1fr 1fr;
		gap: 0.25rem 0.75rem;
		padding: 0.6rem 1rem 0;
		align-items: start;
	}
	@container figure (max-width: 46rem) {
		.panels {
			grid-template-columns: 1fr 1fr;
		}
		.p8 {
			grid-column: 1 / -1;
		}
	}
	@container figure (max-width: 30rem) {
		.panels {
			grid-template-columns: 1fr;
		}
	}
	.pane {
		min-width: 0;
	}
	.ptitle {
		margin-bottom: 0.15rem;
		text-align: center;
		font-size: 0.74rem;
		letter-spacing: 0.04em;
		color: var(--ink-dim);
	}
	.num {
		font-family: var(--font-ui);
		font-size: 10px;
		font-weight: 600;
		fill: var(--ink-bright);
	}
	.composer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 0.9rem;
		padding: 0.7rem 1.25rem 0.2rem;
	}
	.k,
	dt {
		min-width: 3.4rem;
		font-size: 0.74rem;
		letter-spacing: 0.06em;
		color: var(--ink-faint);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		flex: 1;
		min-width: 10rem;
		min-height: 2rem;
		align-items: center;
	}
	/* the word: letters set like type, each one removable */
	.chip {
		min-width: 1.6rem;
		height: 1.9rem;
		padding: 0 0.25rem;
		border: 0;
		border-bottom: 2px solid rgba(95, 214, 207, 0.6);
		border-radius: 2px;
		background: transparent;
		color: var(--teal);
		font-size: 1rem;
		cursor: pointer;
		transition:
			background 0.15s var(--ease),
			border-color 0.15s var(--ease);
	}
	.chip.a {
		border-bottom-color: rgba(242, 208, 143, 0.6);
		color: var(--gold-bright);
	}
	.chip.off {
		border-bottom-style: dashed;
		opacity: 0.55;
	}
	.chip:hover {
		border-bottom-color: var(--rose);
		background: rgba(242, 141, 182, 0.1);
	}
	.empty {
		font-size: 0.82rem;
		color: var(--ink-faint);
	}
	.keys {
		display: flex;
		gap: 0.3rem;
	}
	.key {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		min-width: 2.25rem;
		height: 2.1rem;
		padding: 0 0.45rem;
		border-radius: 8px;
		border: 1px solid rgba(95, 214, 207, 0.4);
		background: transparent;
		color: var(--teal);
		font-size: 0.86rem;
		cursor: pointer;
		transition:
			background 0.15s var(--ease),
			border-color 0.15s var(--ease);
	}
	.key.a {
		border-color: rgba(242, 208, 143, 0.4);
		color: var(--gold-bright);
	}
	.key.tool {
		border-color: var(--line-faint);
		color: var(--ink-dim);
	}
	.key:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.05);
		border-color: currentColor;
	}
	.key:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.readout {
		margin: 0;
		padding: 0.35rem 1.25rem 0.75rem;
		font-size: 0.88rem;
		color: var(--ink);
	}
	.row {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		margin: 0.25rem 0;
	}
	dd {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.7rem;
	}
	.note {
		font-size: 0.76rem;
		color: var(--ink-faint);
	}
	.hl {
		margin: 0.5rem 0 0.1rem;
		padding-left: 0.7rem;
		border-left: 2px solid var(--rose);
		color: var(--ink-dim);
	}
	@media (pointer: coarse) {
		.chip {
			height: 2.3rem;
			min-width: 2.3rem;
		}
		.key {
			height: 2.5rem;
			min-width: 2.6rem;
		}
	}
</style>
