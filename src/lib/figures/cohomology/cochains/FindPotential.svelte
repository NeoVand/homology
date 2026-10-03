<script lang="ts">
	// Figure: the gradient puzzle. Numbers are given on the edges; find heights on
	// the vertices whose differences produce them — by hand, or by letting the
	// app "integrate" along a spanning tree and then test the leftover edges.
	import { onMount, onDestroy } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import OGraphView from './OGraphView.svelte';
	import { integrate, cycleRank, signed, type Integration } from './graph';
	import { puzzles } from './presets';

	let pid = $state('staircase');
	const P = $derived(puzzles.find((p) => p.id === pid)!);

	let f = $state<(number | null)[]>([]);
	let selected = $state<number | null>(null);
	let run = $state<{ k: number; I: Integration; phase: 'tree' | 'check' | 'done'; checked: number } | null>(null);
	let reduced = false;
	let timer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));
	onDestroy(() => clearTimeout(timer));

	// reset whenever the puzzle changes
	$effect(() => {
		const n = P.n;
		clearTimeout(timer);
		f = new Array(n).fill(null);
		selected = 0;
		run = null;
	});

	function nudge(d: number) {
		if (selected === null) return;
		run = null;
		const cur = f[selected];
		f[selected] = cur === null ? 0 : cur + d;
	}
	function setZero() {
		if (selected === null) return;
		run = null;
		f[selected] = 0;
	}
	function clearAll() {
		clearTimeout(timer);
		run = null;
		f = new Array(P.n).fill(null);
	}

	// edge status from the reader's heights
	type Status = 'idle' | 'ok' | 'bad';
	const status = $derived(
		P.edges.map(([t, h], e): Status => {
			const a = f[t];
			const b = f[h];
			if (a === null || b === null) return 'idle';
			return b - a === P.psi[e] ? 'ok' : 'bad';
		})
	);
	const nOk = $derived(status.filter((s) => s === 'ok').length);
	const allAssigned = $derived(f.every((x) => x !== null));

	// integration (animated)
	function integrateNow() {
		clearTimeout(timer);
		const root = selected ?? 0;
		const I = integrate(P, P.psi, [root], 0);
		f = new Array(P.n).fill(null);
		run = { k: 0, I, phase: 'tree', checked: 0 };
		advance();
	}
	function advance() {
		if (!run) return;
		const r = run;
		if (r.phase === 'tree') {
			if (r.k < r.I.order.length) {
				const { v } = r.I.order[r.k];
				f[v] = r.I.f[v];
				r.k++;
				run = { ...r };
				timer = setTimeout(advance, reduced ? 0 : 520);
				return;
			}
			run = { ...r, phase: 'check' };
			timer = setTimeout(advance, reduced ? 0 : 400);
			return;
		}
		if (r.phase === 'check') {
			if (r.checked < r.I.defects.length) {
				run = { ...r, checked: r.checked + 1 };
				timer = setTimeout(advance, reduced ? 0 : 900);
				return;
			}
			run = { ...r, phase: 'done' };
		}
	}

	const current = $derived(run ? run.I.order[run.k - 1] : null);
	const treeShown = $derived.by(() => {
		const s = new Set<number>();
		if (!run) return s;
		for (let i = 0; i < run.k; i++) {
			const via = run.I.order[i].via;
			if (via !== null) s.add(via);
		}
		return s;
	});
	const checkedDefects = $derived(run ? run.I.defects.slice(0, run.checked) : []);
	const badDefect = $derived(checkedDefects.find((d) => d.value !== 0) ?? null);
	const loopEdges = $derived.by(() => {
		const s = new Set<number>();
		if (!badDefect) return s;
		const L = badDefect.loop;
		for (let i = 0; i + 1 < L.length; i++) {
			const e = P.edges.findIndex(([a, b]) => (a === L[i] && b === L[i + 1]) || (b === L[i] && a === L[i + 1]));
			if (e >= 0) s.add(e);
		}
		return s;
	});
	const loopSumOf = (d: { value: number }) => d.value;

	function edgeColor(e: number) {
		if (loopEdges.has(e)) return 'var(--rose)';
		if (run) {
			if (treeShown.has(e)) return 'var(--teal)';
			const d = checkedDefects.find((x) => x.e === e);
			if (d) return d.value === 0 ? 'var(--green)' : 'var(--rose)';
			return 'rgba(206,198,176,0.4)';
		}
		const s = status[e];
		return s === 'ok' ? 'var(--green)' : s === 'bad' ? 'var(--rose)' : 'rgba(206,198,176,0.45)';
	}
	const message = $derived.by(() => {
		if (run) {
			if (run.phase === 'tree') return 'Walking a spanning tree from the root: each new height = old height + the number on the edge.';
			if (badDefect)
				return `The leftover edge disagrees. Its loop sums to ${signed(loopSumOf(badDefect))}, not 0 — so no heights can ever work.`;
			if (run.phase === 'done') return run.I.defects.length ? 'Every leftover edge agrees: every loop sums to 0, so these numbers are a gradient.' : 'A tree: every edge was used to integrate, so nothing could go wrong.';
			return 'Now test each leftover edge against the heights we built…';
		}
		if (allAssigned && nOk === P.edges.length) return 'Solved! Every edge is the difference of its endpoints’ heights.';
		return P.note;
	});
	const tone = $derived(badDefect ? 'bad' : run?.phase === 'done' || (allAssigned && nOk === P.edges.length) ? 'ok' : 'neutral');
</script>

<Controls>
	<Segmented bind:value={pid} options={puzzles.map((p) => ({ value: p.id, label: p.label }))} label="Choose a puzzle" />
</Controls>
<div class="board">
	<Svg viewBox="30 30 440 300" maxHeight={400} label="A graph with numbers on its edges; find heights on the vertices that produce them">
		<OGraphView
			pos={P.pos}
			edges={P.edges}
			vertexRadius={13}
			edgeColor={edgeColor}
			edgeWidth={(e) => (loopEdges.has(e) || treeShown.has(e) ? 3.6 : 2.6)}
			edgeLabel={(e) => signed(P.psi[e])}
			edgeLabelColor={(e) => (loopEdges.has(e) ? 'var(--rose)' : 'var(--gold-bright)')}
			edgeClass={(e) => (loopEdges.has(e) ? 'flash' : treeShown.has(e) ? 'glow' : '')}
			vertexFill={(v) => (f[v] === null ? 'rgba(40,50,80,0.95)' : current?.v === v ? 'var(--teal)' : undefined)}
			vertexStroke={(v) => (f[v] === null ? 'rgba(206,198,176,0.6)' : undefined)}
			vertexText={(v) => (f[v] === null ? '?' : null)}
			vertexLabel={(v) => (f[v] === null ? null : String(f[v]))}
			vertexLabelColor={(v) => (current?.v === v ? 'var(--teal)' : 'var(--gold-bright)')}
			selectedVertex={run ? null : selected}
			clickVertex={true}
			onvertex={(v) => (selected = v)}
		/>
	</Svg>
	<p class="msg ui {tone}">{message}</p>
</div>
<Controls>
	<div class="row">
		<span class="ui lbl">Selected vertex:</span>
		<Button onclick={() => nudge(-1)} disabled={selected === null}>−1</Button>
		<Button onclick={setZero} disabled={selected === null}>0</Button>
		<Button onclick={() => nudge(1)} disabled={selected === null}>+1</Button>
		<span class="sp"></span>
		<Button variant="gold" onclick={integrateNow}>Integrate from the selected vertex</Button>
		<Button variant="subtle" onclick={clearAll}>Clear</Button>
	</div>
	<div class="row stats ui">
		<span><b class="nums">{nOk}</b> of {P.edges.length} edges satisfied</span>
		<span class="dot">·</span>
		<span>loops to check: E − V + c = {P.edges.length} − {P.n} + 1 = <b class="nums">{cycleRank(P)}</b></span>
	</div>
</Controls>

<style>
	.board {
		padding: 0.5rem 0.6rem 0;
	}
	.msg {
		margin: 0.2rem auto 0.9rem;
		max-width: 36rem;
		text-align: center;
		font-size: 0.86rem;
		line-height: 1.5;
		min-height: 2.6em;
		color: var(--ink-dim);
		transition: color 0.3s var(--ease);
	}
	.msg.ok {
		color: var(--green);
	}
	.msg.bad {
		color: var(--rose);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.6rem;
		width: 100%;
	}
	.lbl {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.sp {
		flex: 1;
	}
	.stats {
		font-size: 0.78rem;
		color: var(--ink-dim);
		border-top: 1px solid var(--line-faint);
		padding-top: 0.6rem;
	}
	.stats b {
		color: var(--gold-bright);
	}
	.dot {
		color: var(--ink-ghost);
	}
</style>
