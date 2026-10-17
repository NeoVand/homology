<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import { parts, chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { progress } from '$lib/stores/progress.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { VisitedIcon } from '$lib/icons';
	import { W, H, ROW, TOP, LABEL_Y, LINE, stations, route, edges, upstream, downstream, nextChapter } from '$lib/components/map/layout';
	import StationCard from '$lib/components/map/StationCard.svelte';
	import Journey from '$lib/components/map/Journey.svelte';

	// ── what is in focus ─────────────────────────────────────────────────────
	// A mouse previews a station by pointing at it (a click opens the chapter);
	// the keyboard by tabbing to it (Enter opens it); a finger by tapping it once
	// (a second tap opens it).
	let hover = $state<string | null>(null);
	let kbd = $state<string | null>(null);
	let pinned = $state<string | null>(null);
	const focus = $derived(hover ?? kbd ?? pinned);
	const mode = $derived(hover ? 'hover' : kbd ? 'key' : 'tap');
	const up = $derived(focus ? upstream(focus) : new Map<string, number>());
	const down = $derived(focus ? downstream(focus) : new Map<string, number>());
	const focusPart = $derived(focus ? chapterById.get(focus)?.part.id : undefined);

	// stepping from one station to the next should not flash the map back to rest
	let leaving: ReturnType<typeof setTimeout> | undefined;
	function enter(e: PointerEvent, id: string) {
		if (e.pointerType !== 'mouse') return;
		clearTimeout(leaving);
		hover = id;
	}
	function leave(e: PointerEvent) {
		if (e.pointerType !== 'mouse') return;
		clearTimeout(leaving);
		leaving = setTimeout(() => (hover = null), 120);
	}

	let pointer = 'mouse';
	function tap(e: MouseEvent, id: string) {
		if (pointer !== 'touch' && pointer !== 'pen') return;
		if (pinned !== id) {
			e.preventDefault();
			pinned = id;
		}
	}
	function down_(e: PointerEvent) {
		pointer = e.pointerType;
		const t = e.target as Element | null;
		if (pinned && !t?.closest('.station, .dock')) pinned = null;
	}

	// progress lives in this browser only: show it once the page is live, so
	// that the prerendered page and the hydrated one agree
	let ready = $state(false);
	onMount(() => (ready = true));
	const visited = $derived(ready ? progress.visited : {});
	const next = $derived(ready && Object.keys(visited).length ? nextChapter(visited) : undefined);

	// ── the light spreading through the graph ───────────────────────────────
	// From the station in focus, the light runs back along what it builds on and
	// on along what builds on it, one step of the graph every STEP ms.
	const STEP = 70;
	const lit = (d: number) => (d ? Math.min(d, 10) * STEP + 60 : 0);
	const active = $derived.by(() => {
		if (!focus) return [];
		const out: { key: string; d: string; line: string; kind: 'anc' | 'desc'; t: number }[] = [];
		for (const e of edges) {
			if (e.to === focus || up.has(e.to))
				out.push({ key: e.key + ':a', d: e.d, line: e.back, kind: 'anc', t: Math.min(up.get(e.to) ?? 0, 10) * STEP });
			else if (e.from === focus || down.has(e.from))
				out.push({ key: e.key + ':d', d: e.d, line: e.d, kind: 'desc', t: Math.min(down.get(e.from) ?? 0, 10) * STEP });
		}
		return out;
	});
	function stateOf(id: string) {
		if (!focus) return '';
		return id === focus ? 'focus' : up.has(id) ? 'anc' : down.has(id) ? 'desc' : 'dim';
	}

	// Below the widest layout the panel floats over the map: keep it on the other
	// half of the screen from the station it describes.
	let place = $state<'top' | 'bottom'>('bottom');
	$effect(() => {
		if (!focus) return;
		const r = document.querySelector(`[data-station="${focus}"] .dot`)?.getBoundingClientRect();
		if (r) place = r.top + r.height / 2 > window.innerHeight * 0.5 ? 'top' : 'bottom';
	});
</script>

<svelte:head>
	<title>Map of the journey · Homology &amp; Cohomology</title>
	<meta name="description" content="Every chapter of the book and how the ideas depend on one another." />
</svelte:head>

<svelte:window
	onpointerdown={down_}
	onkeydown={(e) => {
		pointer = 'key';
		if (e.key === 'Escape') pinned = hover = null;
	}}
/>

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Overview</p>
		<h1 class="gold-text">The Map of the Journey</h1>
		<p class="sub">
			<span class="on-map">
				The golden line is the reading order. Point at a station (or tap it) to light up everything it builds on, and everything
				that builds on it.
			</span>
			<span class="on-list">Every chapter in reading order, with the chapters each one builds on.</span>
		</p>
		<Ornament width={200} />
	</header>

	<div class="strip panel">
		<Journey strip />
	</div>

	<div class="atlas">
		<div class="metro">
			<div class="legend ui" aria-hidden="true">
				<span><i class="sw gold"></i>builds on</span>
				<span><i class="sw teal"></i>leads to</span>
				<span><Icon icon={VisitedIcon} size={14} stroke={2} class="sw-seen" />visited</span>
				<span><i class="sw-next"></i>read next</span>
			</div>

			<svg viewBox="0 0 {W} {H}" role="group" aria-label="A map of all chapters and their prerequisites">
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
					<g class="band" class:lit={focusPart === p.id} style="--pc:{p.color}">
						<rect x="12" y={TOP + r * ROW - 80} width={W - 24} height={ROW - 14} rx="22" />
						<text x={W / 2} y={TOP + r * ROW - 52} text-anchor="middle" class="pname">
							{p.numeral === '0' ? 'Prelude' : `Part ${p.numeral} · ${p.title}`}
						</text>
					</g>
				{/each}

				<path d={route} class="route-glow" class:quiet={!!focus} filter="url(#soft)" />
				<path d={route} class="route" class:quiet={!!focus} />

				<g class="deps">
					{#each active as e (e.key)}
						<g class="dep {e.kind}" style="--t:{e.t}ms" out:fade={{ duration: 140 }}>
							<path class="line" d={e.line} pathLength="1" />
							<path class="pulse" d={e.d} />
						</g>
					{/each}
				</g>

				{#each stations as s (s.id)}
					{@const depth = up.get(s.id) ?? down.get(s.id) ?? 0}
					<a
						href={chapterHref(s.id)}
						aria-label="{s.num} {s.title}"
						onclick={(e) => tap(e, s.id)}
						onfocus={(e) => e.currentTarget.matches(':focus-visible') && (kbd = s.id)}
						onblur={() => (kbd = null)}
					>
						<g
							class="station {stateOf(s.id)}"
							class:seen={visited[s.id] !== undefined}
							class:next={s.id === next}
							style="--pc:{s.color}; --t:{lit(depth)}ms"
							data-station={s.id}
							role="presentation"
							onpointerenter={(e) => enter(e, s.id)}
							onpointerleave={leave}
						>
							<!-- one unbroken target for the dot and its label -->
							<rect
								class="hit"
								x={s.x - s.half}
								y={s.y - 34}
								width={2 * s.half}
								height={34 + LABEL_Y + (s.lines.length - 1) * LINE + 8}
							/>
							<circle cx={s.x} cy={s.y} r="30" class="halo" />
							{#if s.id === next}<circle cx={s.x} cy={s.y} r="27.5" class="beacon" />{/if}
							{#if s.id === focus}<circle cx={s.x} cy={s.y} r="21" class="ping" />{/if}
							<circle cx={s.x} cy={s.y} r="21" class="dot" />
							<text x={s.x} y={s.y + 4.5} text-anchor="middle" class="num">{s.num}</text>
							{#each s.lines as line, li (li)}
								<text x={s.x} y={s.y + LABEL_Y + li * LINE} text-anchor="middle" class="title" class:dense={s.dense}>{line}</text>
							{/each}
							{#if visited[s.id] !== undefined}
								<g class="tick" transform="translate({s.x + 11} {s.y - 29})"><Icon icon={VisitedIcon} size={15} stroke={2.2} /></g>
							{/if}
						</g>
					</a>
				{/each}
			</svg>
		</div>

		<aside class="dock panel" class:live={!!focus} class:held={!!focus && mode === 'tap'} data-place={place}>
			{#if focus}
				{#key focus}
					<div in:fade={{ duration: 150 }}>
						<StationCard id={focus} {up} {down} visited={visited[focus] !== undefined} {mode} onclose={() => (pinned = null)} />
					</div>
				{/key}
			{:else}
				<div class="idle" in:fade={{ duration: 150 }}>
					<Journey />
					<p class="hint ui">Point at any station to see the chapters it builds on, and the chapters that build on it.</p>
				</div>
			{/if}
		</aside>
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
						<li class:lnext={c.id === next}>
							<a href={chapterHref(c.id)}>
								<span class="cn ui nums">{c.num}</span>
								<span class="ct">{c.title}</span>
								{#if visited[c.id] !== undefined}<Icon icon={VisitedIcon} size={14} stroke={2} class="seen2" label="visited" />{/if}
							</a>
							<div class="pre ui">
								{#if c.id === next}<span class="lnext-tag">read next</span>{/if}
								{c.prereqs.length ? `builds on ${c.prereqs.map((id) => chapterById.get(id)?.num).join(', ')} · ` : ''}about
								{c.minutes} min
							</div>
						</li>
					{/each}
				</ol>
			</li>
		{/each}
	</ol>
</main>

<style>
	.wrap {
		max-width: 86rem;
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

	/* ── layout ── */
	.strip {
		max-width: 52rem;
		margin: 1.6rem auto 0;
		padding: 0.9rem 1.2rem;
	}
	.atlas {
		display: none;
	}
	.on-map {
		display: none;
	}
	@media (min-width: 760px) {
		.atlas,
		.on-map {
			display: block;
		}
		.list,
		.on-list {
			display: none;
		}
	}
	/* wide: the panel stands beside the map, always there */
	@media (min-width: 1280px) {
		.strip {
			display: none;
		}
		.atlas {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 19.5rem;
			gap: 2.4rem;
			align-items: start;
			margin-top: 1.2rem;
		}
		.dock {
			position: sticky;
			top: calc(var(--topbar-h) + 1.4rem);
			margin-top: 0.6rem;
			padding: 1.15rem 1.25rem 1.2rem;
		}
	}
	/* narrower: the panel floats over the map while a station is in focus, on the
	   other half of the screen from it, and takes no part in the page's layout */
	@media (min-width: 760px) and (max-width: 1279.98px) {
		.dock {
			position: fixed;
			z-index: 30;
			left: 50%;
			bottom: 1rem;
			width: min(46rem, calc(100vw - 2rem));
			max-height: calc(100vh - var(--topbar-h) - 2rem);
			overflow: auto;
			padding: 0.9rem 1.15rem 1rem;
			transform: translate(-50%, 0.5rem);
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			background: var(--panel-solid);
			transition:
				opacity 0.18s,
				transform 0.18s var(--ease),
				visibility 0s 0.18s;
		}
		.dock[data-place='top'] {
			bottom: auto;
			top: calc(var(--topbar-h) + 0.8rem);
		}
		.dock.live {
			opacity: 1;
			visibility: visible;
			transform: translate(-50%, 0);
			transition:
				opacity 0.18s,
				transform 0.18s var(--ease);
		}
		.dock.held {
			pointer-events: auto;
		}
		.dock .idle {
			display: none;
		}
		/* side by side: the chapter, and its neighbours in the graph */
		.dock :global(.sc) {
			grid-template-columns: minmax(0, 1fr) minmax(0, 15rem);
			column-gap: 1.4rem;
			align-items: start;
		}
		.dock :global(.rel) {
			margin-top: 1.6rem;
			padding: 0 0 0 1.3rem;
			border-top: 0;
			border-left: 1px solid var(--line-faint);
		}
	}
	.hint {
		margin: 1rem 0 0;
		padding-top: 0.9rem;
		border-top: 1px solid var(--line-faint);
		font-size: 0.78rem;
		line-height: 1.55;
		color: var(--ink-faint);
	}

	/* ── legend ── */
	.legend {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.6rem 1.6rem;
		font-size: 0.78rem;
		color: var(--ink-faint);
		margin: 1.2rem 0 0.4rem;
	}
	.legend span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.sw {
		display: inline-block;
		width: 1.4rem;
		height: 2px;
		border-radius: 2px;
	}
	.sw.gold {
		background: var(--gold-bright);
		box-shadow: 0 0 6px var(--gold-glow);
	}
	.sw.teal {
		background: var(--teal);
		box-shadow: 0 0 6px rgba(95, 214, 207, 0.4);
	}
	.legend :global(.sw-seen) {
		color: var(--gold);
	}
	.sw-next {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 50%;
		border: 1.5px dashed var(--gold-bright);
	}

	/* ── the map ── */
	svg {
		width: 100%;
		height: auto;
		display: block;
		overflow: visible;
		-webkit-tap-highlight-color: transparent;
	}
	.band rect {
		fill: var(--pc);
		opacity: 0.035;
		transition: opacity 0.3s;
	}
	.band.lit rect {
		opacity: 0.075;
	}
	.pname {
		font-family: var(--font-display);
		font-size: 15px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		fill: var(--pc);
		opacity: 0.85;
		paint-order: stroke;
		stroke: #080c17;
		stroke-width: 5px;
		stroke-linejoin: round;
	}
	.route {
		fill: none;
		stroke: url(#route);
		stroke-width: 3;
		stroke-linecap: round;
		opacity: 0.85;
		transition: opacity 0.3s;
	}
	.route-glow {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 8;
		opacity: 0.25;
		transition: opacity 0.3s;
	}
	.route.quiet {
		opacity: 0.2;
	}
	.route-glow.quiet {
		opacity: 0.04;
	}

	/* the dependencies: a line drawn out from the station in focus, then light
	   running along it from each chapter to the chapters that build on it */
	.dep {
		pointer-events: none;
	}
	.dep .line {
		fill: none;
		stroke-width: 1.8;
		opacity: 0.62;
		stroke-dasharray: 1 1;
		stroke-dashoffset: 1;
		animation: draw 0.16s var(--t) cubic-bezier(0.3, 0.6, 0.5, 1) forwards;
	}
	.dep .pulse {
		fill: none;
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-dasharray: 8 64;
		opacity: 0;
		animation:
			flow 1.2s linear infinite,
			appear 0.35s calc(var(--t) + 0.12s) ease forwards;
	}
	.dep.anc .line {
		stroke: var(--gold-bright);
	}
	.dep.anc .pulse {
		stroke: #fff1cf;
	}
	.dep.desc .line {
		stroke: var(--teal);
	}
	.dep.desc .pulse {
		stroke: #c9fbf7;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes flow {
		from {
			stroke-dashoffset: 72;
		}
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes appear {
		to {
			opacity: 0.9;
		}
	}

	/* the stations */
	.station {
		cursor: pointer;
		transition: opacity 0.25s var(--t);
	}
	.hit {
		fill: none;
		pointer-events: all;
	}
	.station .halo {
		fill: var(--pc);
		opacity: 0.12;
		transition:
			opacity 0.25s var(--t),
			fill 0.25s var(--t);
	}
	.station .dot {
		fill: #0b1122;
		stroke: var(--pc);
		stroke-width: 2;
		transition:
			stroke 0.25s var(--t),
			stroke-width 0.25s var(--t),
			fill 0.25s var(--t);
	}
	.station.seen .dot {
		fill: color-mix(in srgb, var(--pc) 17%, #0b1122);
	}
	.station .num {
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: 600;
		fill: var(--ink-bright);
		pointer-events: none;
	}
	.station .title {
		font-family: var(--font-body);
		font-size: 14px;
		fill: var(--ink-dim);
		paint-order: stroke;
		stroke: #080c17;
		stroke-width: 4px;
		stroke-linejoin: round;
		transition: fill 0.25s var(--t);
	}
	.station .title.dense {
		font-size: 13px;
	}
	.station .tick {
		color: var(--gold);
	}
	.beacon {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 1.4;
		stroke-dasharray: 3 4.2;
		animation: turn 9s linear infinite;
	}
	@keyframes turn {
		to {
			stroke-dashoffset: -72;
		}
	}
	.station:hover .halo,
	.station.focus .halo {
		opacity: 0.38;
	}
	.station.focus .dot {
		fill: #1b2442;
		stroke-width: 3;
	}
	.station.focus .title {
		fill: var(--ink-bright);
	}
	.ping {
		fill: none;
		stroke: var(--pc);
		stroke-width: 2;
		transform-box: fill-box;
		transform-origin: center;
		animation: ping 1.8s cubic-bezier(0.2, 0.6, 0.35, 1) infinite;
		pointer-events: none;
	}
	@keyframes ping {
		from {
			transform: scale(1);
			opacity: 0.7;
		}
		to {
			transform: scale(1.75);
			opacity: 0;
		}
	}
	.station.anc .dot {
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.station.anc .halo {
		fill: var(--gold-bright);
		opacity: 0.2;
	}
	.station.anc .title {
		fill: var(--gold-pale);
	}
	.station.desc .dot {
		stroke: var(--teal);
		stroke-width: 3;
	}
	.station.desc .halo {
		fill: var(--teal);
		opacity: 0.2;
	}
	.station.desc .title {
		fill: #c4f0ec;
	}
	.station.dim {
		opacity: 0.28;
	}
	svg a {
		outline: none;
	}
	a:focus-visible .dot {
		stroke: var(--ink-bright);
		stroke-width: 3;
	}

	@media (prefers-reduced-motion: reduce) {
		.dep .line {
			animation: none;
			stroke-dasharray: none;
		}
		.dep .pulse,
		.ping {
			display: none;
		}
		.beacon {
			animation: none;
		}
		.station,
		.station * {
			transition-delay: 0s !important;
		}
	}

	/* ── the list, on small screens ── */
	.list {
		list-style: none;
		padding: 0;
		margin: 1.8rem 0 0;
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
	.lpart ol li.lnext {
		border-left-color: var(--gold-bright);
		background: linear-gradient(90deg, rgba(216, 178, 110, 0.08), transparent 70%);
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
	.lnext-tag {
		color: var(--gold-bright);
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-size: 0.64rem;
		margin-right: 0.5rem;
	}
</style>
