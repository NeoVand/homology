<script lang="ts">
	// Build a topology on the three-point set X = {a, b, c}: click subsets to
	// declare them open; the checker tests the three axioms and names the culprit.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import Mark from '$lib/components/ui/Mark.svelte';

	// subsets as bit masks: a = 1, b = 2, c = 4
	const names = ['a', 'b', 'c'];
	function texOf(m: number) {
		if (m === 0) return '\\varnothing';
		if (m === 7) return 'X';
		return '\\{' + names.filter((_, i) => m & (1 << i)).join(',') + '\\}';
	}
	const pos: Record<number, [number, number]> = {
		0: [300, 296],
		1: [140, 210],
		2: [300, 210],
		4: [460, 210],
		3: [140, 124],
		5: [300, 124],
		6: [460, 124],
		7: [300, 38]
	};
	const order = [7, 3, 5, 6, 1, 2, 4, 0];
	const links: [number, number][] = [];
	for (const A of order)
		for (const B of order) if ((A & B) === A && A !== B && popcount(B) === popcount(A) + 1) links.push([A, B]);
	function popcount(m: number) {
		return (m & 1) + ((m >> 1) & 1) + ((m >> 2) & 1);
	}

	let open = $state<Set<number>>(new Set([0, 1, 3, 7]));
	const found = new SvelteSet<string>();

	function toggle(m: number) {
		const s = new Set(open);
		if (s.has(m)) s.delete(m);
		else s.add(m);
		open = s;
	}

	const check = $derived.by(() => {
		const S = [...open];
		const bad: number[] = [];
		let t1 = open.has(0) && open.has(7);
		let t2: { a: number; b: number; r: number } | null = null;
		let t3: { a: number; b: number; r: number } | null = null;
		for (const A of S)
			for (const B of S) {
				if (!t2 && !open.has(A | B)) t2 = { a: A, b: B, r: A | B };
				if (!t3 && !open.has(A & B)) t3 = { a: A, b: B, r: A & B };
			}
		if (!t1) bad.push(...[0, 7].filter((m) => !open.has(m)));
		if (t2) bad.push(t2.r);
		if (t3) bad.push(t3.r);
		const ok = t1 && !t2 && !t3;
		return { ok, t1, t2, t3, bad: new Set(bad), culprits: new Set(t2 ? [t2.a, t2.b] : t3 ? [t3.a, t3.b] : []) };
	});

	$effect(() => {
		if (check.ok) {
			const key = [...open].sort((x, y) => x - y).join(',');
			if (!found.has(key)) found.add(key);
		}
	});

	const nameOf = $derived.by(() => {
		if (!check.ok) return '';
		if (open.size === 8) return 'the discrete topology: every subset is open';
		if (open.size === 2) return 'the indiscrete topology: only the two compulsory sets';
		const S = [...open].sort((x, y) => popcount(x) - popcount(y));
		const chain = S.every((A, i) => i === 0 || (S[i - 1] & A) === S[i - 1]);
		if (chain) return 'a nested topology: each open set contains the smaller ones';
		return 'a perfectly good topology';
	});

	function key(e: KeyboardEvent, m: number) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggle(m);
		}
	}
</script>

<div class="tb">
	<Svg viewBox="0 0 600 330" maxHeight={360} label="The eight subsets of a three-point set arranged by inclusion; click a subset to make it open">
		{#each links as [A, B] (A + ':' + B)}
			<line
				x1={pos[A][0]}
				y1={pos[A][1] - 18}
				x2={pos[B][0]}
				y2={pos[B][1] + 18}
				stroke={open.has(A) && open.has(B) ? 'rgba(244,215,156,0.55)' : 'rgba(200,192,170,0.16)'}
				stroke-width={open.has(A) && open.has(B) ? 2 : 1.2}
			/>
		{/each}
		{#each order as m (m)}
			{@const [x, y] = pos[m]}
			{@const on = open.has(m)}
			{@const bad = check.bad.has(m)}
			{@const culprit = check.culprits.has(m)}
			<g
				class="node"
				class:on
				class:bad
				class:culprit
				role="checkbox"
				aria-checked={on}
				aria-label="the subset {texOf(m).replace(/\\/g, '')}"
				tabindex="0"
				onclick={() => toggle(m)}
				onkeydown={(e) => key(e, m)}
			>
				<rect x={x - 52} y={y - 19} width="104" height="38" rx="19" />
				<SvgTeX {x} {y} tex={texOf(m)} size={17} w={100} h={30} color={on ? '#1a1206' : bad ? 'var(--rose)' : 'var(--ink)'} />
			</g>
		{/each}
	</Svg>
	<div class="panel ui" aria-live="polite">
		<ol class="axioms">
			<li class:pass={check.t1} class:fail={!check.t1}>
				<span class="mark"><Mark ok={check.t1} /></span>
				<TeX tex={'\\varnothing'} /> and <TeX tex="X" /> are open
			</li>
			<li class:pass={!check.t2} class:fail={!!check.t2}>
				<span class="mark"><Mark ok={!check.t2} /></span>
				unions of open sets are open
				{#if check.t2}<span class="why"
						>— but <TeX tex={`${texOf(check.t2.a)} \\cup ${texOf(check.t2.b)} = ${texOf(check.t2.r)}`} /> is missing</span
					>{/if}
			</li>
			<li class:pass={!check.t3} class:fail={!!check.t3}>
				<span class="mark"><Mark ok={!check.t3} /></span>
				intersections of two open sets are open
				{#if check.t3}<span class="why"
						>— but <TeX tex={`${texOf(check.t3.a)} \\cap ${texOf(check.t3.b)} = ${texOf(check.t3.r)}`} /> is missing</span
					>{/if}
			</li>
		</ol>
		<p class="verdict">
			{#if check.ok}<strong class="ok">A topology!</strong> This is {nameOf}.{:else}<strong class="no">Not a topology yet.</strong>{/if}
		</p>
		<div class="foot">
			<span class="count">You have found <b>{found.size}</b> of the 29 topologies on three points.</span>
			<span class="btns">
				<Button variant="subtle" onclick={() => (open = new Set([0, 7]))}>Indiscrete</Button>
				<Button variant="subtle" onclick={() => (open = new Set([0, 1, 2, 3, 4, 5, 6, 7]))}>Discrete</Button>
				<Button variant="subtle" onclick={() => (open = new Set())}>Clear</Button>
			</span>
		</div>
	</div>
</div>

<style>
	.tb {
		padding: 0.6rem 0.6rem 0;
	}
	.node {
		cursor: pointer;
		outline: none;
	}
	.node rect {
		fill: rgba(255, 255, 255, 0.03);
		stroke: rgba(200, 192, 170, 0.35);
		stroke-width: 1.4;
		transition: all 0.18s var(--ease);
	}
	.node:hover rect {
		stroke: var(--gold);
		fill: rgba(216, 178, 110, 0.08);
	}
	.node:focus-visible rect {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.node.on rect {
		fill: url(#vertex-fill);
		stroke: var(--gold-bright);
		filter: drop-shadow(0 0 6px rgba(242, 208, 143, 0.55));
	}
	.node.bad rect {
		stroke: var(--rose);
		stroke-dasharray: 5 4;
		stroke-width: 2;
	}
	.node.culprit rect {
		stroke: var(--rose);
		stroke-width: 2.6;
	}
	.panel {
		padding: 0.7rem 1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
		font-size: 0.85rem;
		color: var(--ink-dim);
	}
	.axioms {
		list-style: none;
		margin: 0 0 0.4rem;
		padding: 0;
		display: grid;
		gap: 0.2rem;
	}
	.axioms li::before {
		display: none;
	}
	.mark {
		display: inline-block;
		width: 1.2rem;
		font-weight: 700;
	}
	.pass .mark {
		color: var(--green);
	}
	.fail {
		color: var(--ink);
	}
	.fail .mark {
		color: var(--rose);
	}
	.why {
		color: var(--rose);
	}
	.verdict {
		margin: 0.3rem 0 0.5rem;
		color: var(--ink);
	}
	.ok {
		color: var(--green);
	}
	.no {
		color: var(--rose);
	}
	.foot {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}
	.count b {
		color: var(--gold-bright);
	}
	.btns {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
</style>
