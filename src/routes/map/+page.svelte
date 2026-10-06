<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import { parts, chapters, chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { progress } from '$lib/stores/progress.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { VisitedIcon } from '$lib/icons';

	// ── layout: one row per part, snaking left→right then right→left ──────────
	const W = 1000;
	const ROW = 190;
	const TOP = 120;
	const PAD = 150;

	type Node = {
		id: string;
		x: number;
		y: number;
		row: number;
		num: string;
		title: string;
		color: string;
		/** label above the station */
		above: boolean;
		/** crowded row: narrower, smaller labels */
		dense: boolean;
		/** characters per label line, from the space between neighbouring stations */
		cap: number;
	};
	const nodes: Node[] = [];
	parts.forEach((p, r) => {
		const n = p.chapters.length;
		const span = W - 2 * PAD;
		p.chapters.forEach((c, i) => {
			const t = n === 1 ? 0.5 : i / (n - 1);
			const along = r % 2 === 0 ? t : 1 - t;
			const x = n === 1 ? W / 2 : PAD + span * (n <= 3 ? 0.2 + 0.6 * along : along);
			nodes.push({ id: c.id, x, y: TOP + r * ROW, row: r, num: c.num, title: c.title, color: p.color, above: false, dense: n >= 7, cap: n >= 8 ? 14 : n === 7 ? 16 : 15 });
		});
	});
	const pos = new Map(nodes.map((n) => [n.id, n]));
	const H = TOP + (parts.length - 1) * ROW + 120;

	// the reading path through every station, with rounded turns between rows
	const path = (() => {
		let d = `M ${nodes[0].x} ${nodes[0].y}`;
		for (let i = 1; i < nodes.length; i++) {
			const a = nodes[i - 1];
			const b = nodes[i];
			if (a.row === b.row) d += ` L ${b.x} ${b.y}`;
			else {
				const side = a.row % 2 === 0 ? 1 : -1; // turn on the right for even rows
				const cx = side > 0 ? Math.max(a.x, b.x) + 105 : Math.min(a.x, b.x) - 105;
				d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
			}
		}
		return d;
	})();

	// prerequisite graph
	const prereqEdges = chapters.flatMap((c) => c.prereqs.map((p) => ({ from: p, to: c.id })));
	function ancestors(id: string, acc = new Set<string>()) {
		for (const p of chapterById.get(id)?.prereqs ?? []) {
			if (!acc.has(p)) {
				acc.add(p);
				ancestors(p, acc);
			}
		}
		return acc;
	}
	function descendants(id: string, acc = new Set<string>()) {
		for (const c of chapters) if (c.prereqs.includes(id) && !acc.has(c.id)) (acc.add(c.id), descendants(c.id, acc));
		return acc;
	}

	let hover = $state<string | null>(null);
	let pinned = $state<string | null>(null);
	const focus = $derived(hover ?? pinned);
	const anc = $derived(focus ? ancestors(focus) : new Set<string>());
	const desc = $derived(focus ? descendants(focus) : new Set<string>());
	const focusCh = $derived(focus ? chapterById.get(focus) : undefined);

	function arc(a: Node, b: Node) {
		const mx = (a.x + b.x) / 2;
		const my = (a.y + b.y) / 2;
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const len = Math.hypot(dx, dy) || 1;
		const bend = Math.min(120, len * 0.25);
		return `M ${a.x} ${a.y} Q ${mx - (dy / len) * bend} ${my + (dx / len) * bend} ${b.x} ${b.y}`;
	}
	// Break a title into as few lines as greedy filling needs (at most `max`
	// characters each), then even the lines out, so that no word is left alone.
	function wrap(t: string, max = 16): string[] {
		const words = t.split(' ');
		let count = 0;
		let cur = '';
		for (const w of words) {
			if ((cur + ' ' + w).trim().length > max && cur) {
				count++;
				cur = w;
			} else cur = (cur + ' ' + w).trim();
		}
		if (cur) count++;
		const n = Math.min(4, count);
		let best: string[] = [t];
		let bestScore = Infinity;
		// try every way of cutting the words into n lines (titles are short)
		const cut = (start: number, left: number, acc: string[]) => {
			if (left === 1) {
				const lines = [...acc, words.slice(start).join(' ')];
				const score = Math.max(...lines.map((l) => l.length));
				if (score < bestScore) [best, bestScore] = [lines, score];
				return;
			}
			for (let k = start + 1; k <= words.length - left + 1; k++) cut(k, left - 1, [...acc, words.slice(start, k).join(' ')]);
		};
		cut(0, n, []);
		return best;
	}
</script>

<svelte:head>
	<title>Map of the journey · Homology &amp; Cohomology</title>
	<meta name="description" content="Every chapter of the book and how the ideas depend on one another." />
</svelte:head>

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Overview</p>
		<h1 class="gold-text">The Map of the Journey</h1>
		<p class="sub">
			The golden line is the reading order. Hover over (or tap) a station to light up everything it builds on, and
			everything that builds on it.
		</p>
		<Ornament width={200} />
	</header>

	<div class="legend ui">
		<span><i class="sw gold"></i> builds on (prerequisites)</span>
		<span><i class="sw teal"></i> leads to</span>
		<span><Icon icon={VisitedIcon} size={14} stroke={2} class="sw-seen" /> visited</span>
	</div>

	<div class="metro">
		<svg viewBox="0 0 {W} {H}" role="img" aria-label="A map of all chapters and their prerequisites">
			<defs>
				<linearGradient id="route" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stop-color="#f6dca0" />
					<stop offset="0.5" stop-color="#d8b26e" />
					<stop offset="1" stop-color="#b58a46" />
				</linearGradient>
				<filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="5" />
				</filter>
			</defs>

			{#each parts as p, r (p.id)}
				<g class="band">
					<rect x="12" y={TOP + r * ROW - 80} width={W - 24} height={ROW - 14} rx="22" fill={p.color} opacity="0.035" />
					<text x={W / 2} y={TOP + r * ROW - 52} text-anchor="middle" class="pname" fill={p.color}>
						{p.numeral === '0' ? 'Prelude' : `Part ${p.numeral} · ${p.title}`}
					</text>
				</g>
			{/each}

			<path d={path} class="route-glow" filter="url(#soft)" />
			<path d={path} class="route" />

			{#if focus}
				{#each prereqEdges as e (e.from + '>' + e.to)}
					{@const a = pos.get(e.from)}
					{@const b = pos.get(e.to)}
					{#if a && b}
						{#if (e.to === focus || anc.has(e.to)) && (anc.has(e.from) || e.from === focus)}
							<path d={arc(a, b)} class="dep anc" />
						{:else if (e.from === focus || desc.has(e.from)) && desc.has(e.to)}
							<path d={arc(a, b)} class="dep desc" />
						{/if}
					{/if}
				{/each}
			{/if}

			{#each nodes as n (n.id)}
				{@const state = !focus ? '' : n.id === focus ? 'focus' : anc.has(n.id) ? 'anc' : desc.has(n.id) ? 'desc' : 'dim'}
				{@const lines = wrap(n.title, n.cap)}
				<a href={chapterHref(n.id)} aria-label="{n.num} {n.title}">
					<g
						class="station {state}"
						role="presentation"
						onpointerenter={() => (hover = n.id)}
						onpointerleave={() => (hover = null)}
						onfocusin={() => (hover = n.id)}
						onfocusout={() => (hover = null)}
					>
						<circle cx={n.x} cy={n.y} r="30" class="halo" style="fill:{n.color}" />
						<circle cx={n.x} cy={n.y} r="21" class="dot" style="stroke:{n.color}" />
						<text x={n.x} y={n.y + 4.5} text-anchor="middle" class="num">{n.num}</text>
						{#each lines as line, li (li)}
							<text
								x={n.x}
								y={n.above ? n.y - 34 - (lines.length - 1 - li) * 16 : n.y + 44 + li * 16}
								text-anchor="middle"
								class="title"
								class:dense={n.dense}>{line}</text
							>
						{/each}
						{#if progress.visited[n.id]}
							<g class="seen" transform="translate({n.x + 11} {n.y - 29})"><Icon icon={VisitedIcon} size={15} stroke={2} /></g>
						{/if}
					</g>
				</a>
			{/each}
		</svg>

		{#if focusCh}
			<aside class="card panel ui">
				<div class="c-num">Chapter {focusCh.num} · about {focusCh.minutes} min</div>
				<div class="c-title">{focusCh.title}</div>
				<div class="c-sub">{focusCh.subtitle}</div>
				<p class="c-blurb">{focusCh.blurb}</p>
				<div class="c-meta">
					{anc.size} chapter{anc.size === 1 ? '' : 's'} lead here · {desc.size} build on it
				</div>
			</aside>
		{/if}
	</div>

	<!-- compact list for small screens -->
	<ol class="list">
		{#each parts as p (p.id)}
			<li class="lpart" style="--pc:{p.color}">
				<div class="lhead">
					<span class="lnum">{p.numeral}</span>
					<span class="ltitle">{p.title}</span>
				</div>
				<ol>
					{#each p.chapters as c (c.id)}
						<li>
							<a href={chapterHref(c.id)}>
								<span class="cn ui nums">{c.num}</span>
								<span class="ct">{c.title}</span>
								{#if progress.visited[c.id]}<Icon icon={VisitedIcon} size={14} stroke={2} class="seen2" label="visited" />{/if}
							</a>
							{#if c.prereqs.length}
								<div class="pre ui">
									builds on {c.prereqs.map((id) => chapterById.get(id)?.num).join(', ')}
								</div>
							{/if}
						</li>
					{/each}
				</ol>
			</li>
		{/each}
	</ol>
</main>

<style>
	.wrap {
		max-width: 68rem;
		margin: 0 auto;
		padding: 0 1.25rem 5rem;
	}
	.head {
		text-align: center;
		padding: 3.5rem 0 1rem;
	}
	.head h1 {
		font-family: var(--font-display);
		font-size: clamp(2.1rem, 1.4rem + 2.8vw, 3.3rem);
		letter-spacing: 0.04em;
		margin: 0.6rem 0;
	}
	.sub {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 1.25rem;
		color: var(--ink-dim);
		max-width: 40rem;
		margin: 0 auto 1.4rem;
	}
	.head :global(.ornament) {
		margin: 0 auto;
	}
	.legend {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.6rem 1.6rem;
		font-size: 0.78rem;
		color: var(--ink-faint);
		margin: 1rem 0 0.5rem;
	}
	.sw {
		display: inline-block;
		width: 1.4rem;
		height: 3px;
		border-radius: 2px;
		vertical-align: middle;
		margin-right: 0.35rem;
	}
	.sw.gold {
		background: var(--gold-bright);
	}
	.sw.teal {
		background: var(--teal);
	}
	.legend :global(.sw-seen) {
		margin-right: 0.3rem;
		color: var(--gold);
	}
	.metro {
		position: relative;
		display: none;
	}
	@media (min-width: 760px) {
		.metro {
			display: block;
		}
		.list {
			display: none;
		}
	}
	svg {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
	}
	.pname {
		font-family: var(--font-display);
		font-size: 15px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		opacity: 0.85;
	}
	.route {
		fill: none;
		stroke: url(#route);
		stroke-width: 3;
		stroke-linecap: round;
		opacity: 0.85;
	}
	.route-glow {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 8;
		opacity: 0.25;
	}
	.dep {
		fill: none;
		stroke-width: 2;
		stroke-dasharray: 5 6;
		opacity: 0.9;
		animation: dash 1.2s linear infinite;
	}
	.dep.anc {
		stroke: var(--gold-bright);
	}
	.dep.desc {
		stroke: var(--teal);
	}
	@keyframes dash {
		to {
			stroke-dashoffset: -22;
		}
	}
	.station {
		cursor: pointer;
		transition: opacity 0.2s;
	}
	.station .halo {
		opacity: 0.12;
		transition: opacity 0.2s;
	}
	.station .dot {
		fill: #0b1122;
		stroke-width: 2;
		transition: all 0.2s;
	}
	.station .num {
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 600;
		fill: var(--ink-bright);
	}
	.station .title {
		font-family: var(--font-body);
		font-size: 14px;
		fill: var(--ink-dim);
	}
	.station .title.dense {
		font-size: 13px;
	}
	.station .seen {
		color: var(--gold);
	}
	.station:hover .halo,
	.station.focus .halo {
		opacity: 0.4;
	}
	.station.focus .dot {
		fill: #1b2442;
		stroke-width: 3;
	}
	.station.focus .title {
		fill: var(--ink-bright);
	}
	.station.anc .dot {
		stroke: var(--gold-bright) !important;
		stroke-width: 3;
	}
	.station.anc .title {
		fill: var(--gold-pale);
	}
	.station.desc .dot {
		stroke: var(--teal) !important;
		stroke-width: 3;
	}
	.station.desc .title {
		fill: #bdeeea;
	}
	.station.dim {
		opacity: 0.32;
	}
	.card {
		position: sticky;
		bottom: 1rem;
		margin: 1rem auto 0;
		max-width: 34rem;
		padding: 1rem 1.2rem;
		pointer-events: none;
	}
	.c-num {
		font-size: 0.72rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.c-title {
		font-family: var(--font-display);
		font-size: 1.3rem;
		color: var(--gold-bright);
		margin: 0.2rem 0 0.1rem;
	}
	.c-sub {
		font-family: var(--font-elegant);
		font-style: italic;
		color: var(--ink-dim);
		font-size: 1.05rem;
	}
	.c-blurb {
		font-family: var(--font-body);
		font-size: 0.92rem;
		color: var(--ink);
		margin: 0.5rem 0;
		line-height: 1.55;
	}
	.c-meta {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0 0;
	}
	.lpart {
		margin-bottom: 1.6rem;
	}
	.lhead {
		display: flex;
		gap: 0.7rem;
		align-items: baseline;
		border-bottom: 1px solid var(--line-faint);
		padding-bottom: 0.4rem;
		margin-bottom: 0.4rem;
	}
	.lnum {
		font-family: var(--font-display);
		color: var(--pc);
		font-weight: 600;
	}
	.ltitle {
		font-family: var(--font-display);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		font-size: 0.85rem;
		color: var(--ink-dim);
	}
	.lpart ol {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.lpart ol li {
		padding: 0.5rem 0 0.5rem 0.9rem;
		border-left: 2px solid color-mix(in srgb, var(--pc) 50%, transparent);
		margin-left: 0.3rem;
	}
	.lpart a {
		display: flex;
		gap: 0.6rem;
		text-decoration: none;
		color: var(--ink);
	}
	.cn {
		color: var(--pc);
		font-size: 0.8rem;
		min-width: 2rem;
		padding-top: 0.15rem;
	}
	.ct {
		font-family: var(--font-elegant);
		font-weight: 600;
		font-size: 1.12rem;
	}
	.list :global(.seen2) {
		align-self: center;
		color: var(--gold);
		opacity: 0.7;
	}
	.pre {
		font-size: 0.72rem;
		color: var(--ink-faint);
		margin: 0.15rem 0 0 2.6rem;
	}
</style>
