<script lang="ts">
	// Build loops on the figure eight from the letters a, b, a⁻¹, b⁻¹.
	// Left: the loop itself. Middle: its walk on the tree of reduced words
	// (π₁ remembers the order). Right: its walk on the grid ℤ² (H₁ only counts).
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import {
		abelianize,
		abelianTeX,
		cancellingIndices,
		pathD,
		reduceWord,
		wordTeX,
		type Letter,
		type Pt
	} from './geom';

	let word = $state<Letter[]>(['a', 'b']);
	let tau = $state(1);
	let playing = $state(false);
	let raf = 0;
	const MAX = 12;

	const reduced = $derived(reduceWord(word));
	const ab = $derived(abelianize(word));
	const gone = $derived(cancellingIndices(word));

	// ── the figure eight ──
	const R = 74;
	const FX = 180;
	const FY = 120;
	const isA = (x: Letter) => x === 'a' || x === 'A';
	const inv = (x: Letter) => x === 'A' || x === 'B';
	/** point on petal i (lane i) at fraction f ∈ [0,1] of the traversal */
	function petal(x: Letter, lane: number, f: number): Pt {
		const lam = 0.1 + 0.085 * (lane % 7);
		const ff = inv(x) ? 1 - f : f;
		const phi = 2 * Math.PI * ff;
		const r = R * (1 - lam * Math.sin(phi / 2) ** 2);
		if (isA(x)) {
			// left circle, centre (−R, 0); base point at angle 0; counter-clockwise
			return [FX - R + r * Math.cos(phi), FY - r * Math.sin(phi)];
		}
		// right circle, centre (+R, 0); base point at angle π; counter-clockwise
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

	// ── the tree (Cayley graph of the free group) ──
	const TC = 160;
	const L0 = 70;
	const dir: Record<Letter, Pt> = { a: [1, 0], A: [-1, 0], b: [0, -1], B: [0, 1] };
	interface Edge {
		x1: number;
		y1: number;
		x2: number;
		y2: number;
		h: boolean;
		depth: number;
	}
	const treeEdges: Edge[] = [];
	(function grow(p: Pt, depth: number, last: Letter | null) {
		if (depth >= 5) return;
		const L = L0 * Math.pow(0.5, depth);
		for (const x of ['a', 'A', 'b', 'B'] as Letter[]) {
			if (last && x === ({ a: 'A', A: 'a', b: 'B', B: 'b' } as const)[last]) continue;
			const q: Pt = [p[0] + dir[x][0] * L, p[1] + dir[x][1] * L];
			treeEdges.push({ x1: p[0], y1: p[1], x2: q[0], y2: q[1], h: x === 'a' || x === 'A', depth });
			grow(q, depth + 1, x);
		}
	})([TC, TC], 0, null);

	/** vertices visited by the (unreduced) word on the tree */
	const treeWalk = $derived.by(() => {
		const pts: Pt[] = [[TC, TC]];
		const stack: Letter[] = [];
		for (const x of word) {
			const top = stack[stack.length - 1];
			if (top && top === ({ a: 'A', A: 'a', b: 'B', B: 'b' } as const)[x]) {
				stack.pop();
			} else stack.push(x);
			// position of the current reduced word
			let p: Pt = [TC, TC];
			stack.forEach((y, d) => {
				const L = L0 * Math.pow(0.5, d);
				p = [p[0] + dir[y][0] * L, p[1] + dir[y][1] * L];
			});
			pts.push(p);
		}
		return pts;
	});

	// ── the lattice ℤ² ──
	const GC = 160;
	const G = 30;
	const latticeWalk = $derived.by(() => {
		const pts: Pt[] = [[GC, GC]];
		let m = 0;
		let n = 0;
		for (const x of word) {
			if (x === 'a') m++;
			else if (x === 'A') m--;
			else if (x === 'b') n++;
			else n--;
			pts.push([GC + G * Math.max(-5, Math.min(5, m)), GC - G * Math.max(-5, Math.min(5, n))]);
		}
		return pts;
	});

	// ── animation: one bead per panel ──
	function along(pts: Pt[], t: number): Pt {
		const n = pts.length - 1;
		if (n <= 0) return pts[0];
		const x = Math.min(n - 1e-9, Math.max(0, t * n));
		const i = Math.floor(x);
		const f = x - i;
		return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f];
	}
	const bead8 = $derived.by(() => {
		const n = word.length;
		if (!n) return [FX, FY] as Pt;
		const x = Math.min(n - 1e-9, tau * n);
		const i = Math.floor(x);
		return petal(word[i], i, x - i);
	});
	const beadTree = $derived(along(treeWalk, tau));
	const beadGrid = $derived(along(latticeWalk, tau));

	const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
	function play() {
		cancelAnimationFrame(raf);
		if (!word.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			tau = 1;
			playing = false;
			return;
		}
		playing = true;
		const t0 = performance.now();
		const dur = 700 + 650 * word.length;
		const tick = (now: number) => {
			const x = Math.min(1, (now - t0) / dur);
			tau = ease(x);
			if (x < 1) raf = requestAnimationFrame(tick);
			else playing = false;
		};
		raf = requestAnimationFrame(tick);
	}
	onMount(() => () => cancelAnimationFrame(raf));

	function push(x: Letter) {
		if (word.length >= MAX) return;
		word = [...word, x];
		play();
	}
	function set(w: string) {
		word = w.split('') as Letter[];
		play();
	}
	function pullTight() {
		word = reduceWord(word);
		play();
	}

	const letterTeX: Record<Letter, string> = { a: 'a', b: 'b', A: 'a^{-1}', B: 'b^{-1}' };
	const colorOf = (x: Letter) => (isA(x) ? '#f2d08f' : '#5fd6cf');
	const ints = Array.from({ length: 11 }, (_, k) => k - 5);
	const isComm = $derived(word.join('') === 'abAB');
</script>

<div class="panels">
	<div class="panel p8">
		<div class="ptitle ui">the loop on <TeX tex={String.raw`S^1 \vee S^1`} /></div>
		<Svg viewBox="0 0 360 240" maxHeight={300} label="The figure eight with the current loop drawn as nested petals">
			<!-- the space -->
			<circle cx={FX - R} cy={FY} r={R} fill="none" stroke="rgba(242,208,143,0.25)" stroke-width="7" />
			<circle cx={FX + R} cy={FY} r={R} fill="none" stroke="rgba(95,214,207,0.25)" stroke-width="7" />
			<SvgTeX x={FX - 2 * R - 16} y={FY} tex="a" size={20} color="var(--gold-bright)" w={24} h={26} />
			<SvgTeX x={FX + 2 * R + 16} y={FY} tex="b" size={20} color="var(--teal)" w={24} h={26} />
			<!-- the loop: one petal per letter -->
			{#each petals as p (p.i)}
				<path
					d={p.d}
					fill="none"
					stroke={colorOf(p.x)}
					stroke-width="2.3"
					stroke-opacity={gone.has(p.i) ? 0.38 : 1}
					stroke-dasharray={gone.has(p.i) ? '5 4' : undefined}
					filter={gone.has(p.i) ? undefined : 'url(#glow)'}
				/>
				<line
					x1={p.arrow[0][0]}
					y1={p.arrow[0][1]}
					x2={p.arrow[1][0]}
					y2={p.arrow[1][1]}
					stroke={colorOf(p.x)}
					stroke-width="2"
					marker-end="url(#arrow-{isA(p.x) ? 'gold' : 'teal'})"
				/>
				{#if word.length <= 8}
					<circle cx={p.mid[0]} cy={p.mid[1]} r="8" fill="#0b1122" stroke={colorOf(p.x)} stroke-width="1.2" />
					<text x={p.mid[0]} y={p.mid[1] + 3.6} text-anchor="middle" class="num">{p.i + 1}</text>
				{/if}
			{/each}
			<circle cx={FX} cy={FY} r="5.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.2" />
			<SvgTeX x={FX} y={FY + 26} tex="x_0" size={14} w={30} h={20} />
			{#if word.length}
				<circle cx={bead8[0]} cy={bead8[1]} r="6" fill="#fff8e6" filter="url(#glow-strong)" />
			{/if}
		</Svg>
	</div>
	<div class="panel">
		<div class="ptitle ui"><TeX tex={String.raw`\pi_1`} />: a walk on the tree of words</div>
		<Svg viewBox="0 0 320 320" maxHeight={300} label="The tree of reduced words with the current word's walk highlighted">
			{#each treeEdges as e, k (k)}
				<line
					x1={e.x1}
					y1={e.y1}
					x2={e.x2}
					y2={e.y2}
					stroke={e.h ? 'rgba(242,208,143,0.32)' : 'rgba(95,214,207,0.32)'}
					stroke-width={Math.max(0.6, 2.2 - e.depth * 0.4)}
				/>
			{/each}
			<path d={pathD(treeWalk)} fill="none" stroke="rgba(251,246,232,0.22)" stroke-width="8" stroke-linejoin="round" stroke-linecap="round" />
			<path d={pathD(treeWalk)} fill="none" stroke="#fbf6e8" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round" />
			<circle cx={TC} cy={TC} r="5" fill="url(#vertex-fill)" stroke="#060912" />
			<SvgTeX x={TC - 12} y={TC + 13} tex="e" size={13} w={18} h={18} color="var(--ink-dim)" />
			{@const end = treeWalk[treeWalk.length - 1]}
			<circle cx={end[0]} cy={end[1]} r="7.5" fill="none" stroke="#f28db6" stroke-width="2" />
			<circle cx={beadTree[0]} cy={beadTree[1]} r="5" fill="#fff8e6" filter="url(#glow-strong)" />
		</Svg>
	</div>
	<div class="panel">
		<div class="ptitle ui"><TeX tex={String.raw`H_1`} />: a walk on the grid <TeX tex={String.raw`\Z^2`} /></div>
		<Svg viewBox="0 0 320 320" maxHeight={300} label="The integer grid with the current word's walk; its endpoint is the abelianized class">
			{#each ints as k (k)}
				<line x1={GC + G * k} x2={GC + G * k} y1={GC - G * 5} y2={GC + G * 5} stroke="rgba(95,214,207,0.14)" />
				<line y1={GC + G * k} y2={GC + G * k} x1={GC - G * 5} x2={GC + G * 5} stroke="rgba(242,208,143,0.14)" />
			{/each}
			{#each latticeWalk.slice(1) as p, i (i)}
				{@const q = latticeWalk[i]}
				<line x1={q[0]} y1={q[1]} x2={p[0]} y2={p[1]} stroke={colorOf(word[i])} stroke-opacity="0.25" stroke-width="9" stroke-linecap="round" />
				<line x1={q[0]} y1={q[1]} x2={p[0]} y2={p[1]} stroke={colorOf(word[i])} stroke-width="3" stroke-linecap="round" />
			{/each}
			<circle cx={GC} cy={GC} r="5" fill="url(#vertex-fill)" stroke="#060912" />
			<SvgTeX x={GC - 12} y={GC + 13} tex="0" size={13} w={18} h={18} color="var(--ink-dim)" />
			{@const gend = latticeWalk[latticeWalk.length - 1]}
			<circle cx={gend[0]} cy={gend[1]} r="7.5" fill="none" stroke="#f28db6" stroke-width="2" />
			<circle cx={beadGrid[0]} cy={beadGrid[1]} r="5" fill="#fff8e6" filter="url(#glow-strong)" />
			<SvgTeX x={GC + G * 5 - 6} y={GC - G * 5 - 2} tex="a \to" size={12} w={40} h={18} color="var(--gold-bright)" anchor="end" />
			<SvgTeX x={GC - G * 5 + 4} y={GC - G * 5 - 2} tex={String.raw`b \uparrow`} size={12} w={40} h={18} color="var(--teal)" anchor="start" />
		</Svg>
	</div>
</div>

<div class="readout ui" aria-live="polite">
	<div class="row"><span class="k">word</span><TeX tex={word.length ? word.map((x) => letterTeX[x]).join('\\,') : 'e \\text{ (empty: stay at } x_0)'} /></div>
	<div class="row">
		<span class="k">in <TeX tex={String.raw`\pi_1`} /></span><TeX tex={wordTeX(reduced)} />
		<span class="note">{reduced.length < word.length ? 'after cancelling the dashed petals' : 'already reduced'}</span>
	</div>
	<div class="row"><span class="k">in <TeX tex={String.raw`H_1`} /></span><TeX tex={abelianTeX(ab)} /><span class="note">only the net counts survive</span></div>
	{#if isComm}
		<p class="hl">
			The commutator goes once round each circle in each direction. Its counts are zero, so in <TeX tex={String.raw`H_1`} /> it is 0 — but on the tree it ends four steps from home: as a loop it cannot be shrunk.
		</p>
	{/if}
</div>

<Controls>
	<div class="keys">
		<button class="key a" onclick={() => push('a')} aria-label="append a"><TeX tex="a" /></button>
		<button class="key b" onclick={() => push('b')} aria-label="append b"><TeX tex="b" /></button>
		<button class="key a" onclick={() => push('A')} aria-label="append a inverse"><TeX tex={'a^{-1}'} /></button>
		<button class="key b" onclick={() => push('B')} aria-label="append b inverse"><TeX tex={'b^{-1}'} /></button>
		<button class="key" onclick={() => ((word = word.slice(0, -1)), (tau = 1))} aria-label="delete last letter">⌫</button>
		<button class="key" onclick={() => ((word = []), (tau = 1))} aria-label="clear">clear</button>
	</div>
	<div class="presets">
		<Button onclick={() => set('ab')}><TeX tex="ab" /></Button>
		<Button onclick={() => set('ba')}><TeX tex="ba" /></Button>
		<Button onclick={() => set('abAB')}><TeX tex={'aba^{-1}b^{-1}'} /></Button>
		<Button onclick={() => set('abBaA')}><TeX tex={'abb^{-1}aa^{-1}'} /></Button>
		<Button onclick={pullTight} disabled={reduced.length === word.length}>Pull tight</Button>
		<Button variant="gold" onclick={play}>{playing ? 'Playing…' : 'Trace'}</Button>
	</div>
</Controls>

<style>
	.panels {
		display: grid;
		grid-template-columns: 1.25fr 1fr 1fr;
		gap: 0.4rem;
		padding: 0.9rem 0.8rem 0.2rem;
		align-items: start;
	}
	@media (max-width: 880px) {
		.panels {
			grid-template-columns: 1fr 1fr;
		}
		.p8 {
			grid-column: 1 / -1;
		}
	}
	@media (max-width: 480px) {
		.panels {
			grid-template-columns: 1fr;
		}
	}
	.panel {
		min-width: 0;
	}
	.ptitle {
		text-align: center;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		color: var(--ink-faint);
		margin-bottom: 0.2rem;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 10px;
		font-weight: 600;
		fill: var(--ink-bright);
	}
	.readout {
		padding: 0.5rem 1.2rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.8rem;
		margin: 0.2rem 0;
	}
	.k {
		min-width: 3.6rem;
		color: var(--ink-faint);
		font-size: 0.78rem;
		letter-spacing: 0.06em;
	}
	.note {
		color: var(--ink-faint);
		font-size: 0.76rem;
	}
	.hl {
		margin: 0.5rem 0 0.2rem;
		color: var(--ink-dim);
		border-left: 2px solid var(--rose);
		padding-left: 0.7rem;
	}
	.keys,
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	.key {
		min-width: 2.6rem;
		height: 2.3rem;
		padding: 0 0.6rem;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.06);
		color: var(--ink-bright);
		cursor: pointer;
		font-size: 0.82rem;
		transition: all 0.18s var(--ease);
	}
	.key:hover {
		background: rgba(216, 178, 110, 0.16);
		border-color: var(--gold);
	}
	.key.a {
		color: var(--gold-bright);
		border-color: rgba(242, 208, 143, 0.45);
	}
	.key.b {
		color: var(--teal);
		border-color: rgba(95, 214, 207, 0.45);
	}
</style>
