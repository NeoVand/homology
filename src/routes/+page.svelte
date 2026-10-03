<script lang="ts">
	import Hero3D from '$lib/components/home/Hero3D.svelte';
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import { parts } from '$lib/content/toc';
	import { chapterHref, href } from '$lib/util/paths';
	import { progress } from '$lib/stores/progress.svelte';

	const totalMinutes = parts.flatMap((p) => p.chapters).reduce((a, c) => a + c.minutes, 0);
	const chapterCount = parts.flatMap((p) => p.chapters).length;

	let open = $state<Record<string, boolean>>({});
	const visitedCount = $derived(Object.keys(progress.visited).length);
</script>

<svelte:head>
	<title>Homology &amp; Cohomology — an illustrated journey</title>
	<meta
		name="description"
		content="An interactive, illustrated textbook that teaches homology and cohomology from first principles — every prerequisite included."
	/>
	<meta property="og:title" content="Homology & Cohomology — an illustrated journey" />
	<meta
		property="og:description"
		content="Holes, obstructions and duality: an interactive textbook from zero to cohomology."
	/>
</svelte:head>

<section class="hero">
	<div class="hero-art" aria-hidden="false">
		<Hero3D height={600} />
	</div>
	<div class="hero-text">
		<p class="eyebrow">An illustrated journey · from first principles</p>
		<h1 class="title">
			<span class="gold-text">Homology</span>
			<span class="amp">&amp;</span>
			<span class="gold-text">Cohomology</span>
		</h1>
		<p class="sub">
			How mathematics learned to count holes — and to measure what cannot be done. A complete course for the
			curious, with every prerequisite taught along the way.
		</p>
		<div class="ctas ui">
			<a class="btn gold" href={chapterHref('prelude/shape-of-a-question')}>
				{visitedCount ? 'Continue the journey' : 'Begin the journey'} <span aria-hidden="true">→</span>
			</a>
			<a class="btn ghost" href={href('/map/')}>See the map</a>
		</div>
		<div class="stats ui nums">
			<span><b>{chapterCount}</b> chapters</span>
			<span class="dot">·</span>
			<span>a prelude + <b>{parts.length - 1}</b> parts</span>
			<span class="dot">·</span>
			<span>about <b>{Math.round(totalMinutes / 60)}</b> hours</span>
			<span class="dot">·</span>
			<span>no background needed</span>
		</div>
	</div>
</section>

<section class="quote">
	<Ornament width={220} />
	<blockquote>
		<p>Mathematics is the art of giving the same name to different things.</p>
		<footer class="ui"><span class="who">Henri Poincaré</span>, <i>Science and Method</i> (1908)</footer>
	</blockquote>
</section>

<section class="two">
	<article class="card panel">
		<div class="kicker ui">Part III</div>
		<h2>What is homology?</h2>
		<svg viewBox="0 0 320 150" class="mini" role="img" aria-label="A surface with a hole: a gold loop goes around the hole, a teal loop encloses a shaded patch of the surface">
			<defs>
				<linearGradient id="home-surf" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.16" />
					<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.14" />
					<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.16" />
				</linearGradient>
			</defs>
			<path
				d="M30 18 H290 a18 18 0 0 1 18 18 V114 a18 18 0 0 1 -18 18 H30 a18 18 0 0 1 -18 -18 V36 a18 18 0 0 1 18 -18 Z M92 56 a19 19 0 1 0 0.01 0 Z"
				fill="url(#home-surf)"
				fill-rule="evenodd"
				stroke="rgba(216,178,110,0.3)"
			/>
			<circle cx="92" cy="75" r="19" fill="none" stroke="#f28db6" stroke-opacity="0.75" stroke-dasharray="3 4" />
			<ellipse cx="92" cy="75" rx="44" ry="38" fill="none" stroke="#f2d08f" stroke-width="3" />
			<ellipse cx="228" cy="73" rx="44" ry="34" fill="rgba(95,214,207,0.2)" stroke="#5fd6cf" stroke-width="3" />
			<text x="92" y="31" text-anchor="middle" class="lab rose">hole</text>
			<text x="92" y="128" text-anchor="middle" class="lab">a cycle around a hole</text>
			<text x="228" y="128" text-anchor="middle" class="lab">a cycle that bounds</text>
		</svg>
		<p>
			A loop drawn on a shape either encloses a region of that shape — it is a <em>boundary</em> — or it goes around
			something missing. <strong>Homology</strong> turns this into algebra: it collects all the loops (and their
			higher-dimensional cousins), declares the boundaries to be zero, and counts what is left. What is left are the
			holes.
		</p>
	</article>
	<article class="card panel">
		<div class="kicker ui">Part IV</div>
		<h2>What is cohomology?</h2>
		<svg viewBox="0 0 320 150" class="mini" role="img" aria-label="Four steps around a square, each going up, returning to the start">
			<rect x="8" y="10" width="304" height="130" rx="18" fill="rgba(164,147,255,0.07)" stroke="rgba(216,178,110,0.25)" />
			{#each [[110, 40], [210, 40], [210, 108], [110, 108]] as [x, y], i (i)}
				<circle cx={x} cy={y} r="7" fill="url(#vertex-fill-home)" stroke="#060912" />
			{/each}
			<defs>
				<radialGradient id="vertex-fill-home" cx="35%" cy="35%" r="70%">
					<stop offset="0" stop-color="#fffaf0" />
					<stop offset="0.55" stop-color="#f2d08f" />
					<stop offset="1" stop-color="#a5803f" />
				</radialGradient>
				<marker id="home-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
					<path d="M0,1 L9,5 L0,9 L2,5 Z" fill="#f28db6" />
				</marker>
			</defs>
			<path d="M120 40 H200" stroke="#f28db6" stroke-width="2.5" marker-end="url(#home-arrow)" />
			<path d="M210 50 V98" stroke="#f28db6" stroke-width="2.5" marker-end="url(#home-arrow)" />
			<path d="M200 108 H120" stroke="#f28db6" stroke-width="2.5" marker-end="url(#home-arrow)" />
			<path d="M110 98 V50" stroke="#f28db6" stroke-width="2.5" marker-end="url(#home-arrow)" />
			<text x="160" y="31" text-anchor="middle" class="lab rose">+1</text>
			<text x="232" y="78" text-anchor="middle" class="lab rose">+1</text>
			<text x="160" y="128" text-anchor="middle" class="lab rose">+1</text>
			<text x="88" y="78" text-anchor="middle" class="lab rose">+1</text>
			<text x="160" y="80" text-anchor="middle" class="lab">up, up, up, up…</text>
		</svg>
		<p>
			Now attach a <em>measurement</em> to every step — a height difference, a voltage, an exchange rate. Each step
			can be perfectly sensible on its own, yet going all the way around can leave you higher than you started, like
			Escher's impossible staircase. <strong>Cohomology</strong> measures exactly these obstructions: local data that
			cannot be made globally consistent.
		</p>
	</article>
</section>

<section class="features">
	<div class="feature">
		<div class="ficon" aria-hidden="true">
			<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="13" /><path d="M7 20h26M20 7c6 6 6 20 0 26M20 7c-6 6-6 20 0 26" /></svg>
		</div>
		<h3>Touch every idea</h3>
		<p>
			Rotate tori, glue squares into Klein bottles, click edges to build cycles, scrub numbers in the text, and watch
			homology groups computed live as you edit a shape.
		</p>
	</div>
	<div class="feature">
		<div class="ficon" aria-hidden="true">
			<svg viewBox="0 0 40 40"><path d="M8 32V12l12-6 12 6v20" /><path d="M8 12l12 6 12-6M20 18v14" /></svg>
		</div>
		<h3>Nothing assumed</h3>
		<p>
			Sets, groups, linear algebra, topology, manifolds, differential forms and categories are all taught here, slowly
			and from the beginning, exactly as far as the destination needs.
		</p>
	</div>
	<div class="feature">
		<div class="ficon" aria-hidden="true">
			<svg viewBox="0 0 40 40"><path d="M20 5l4 9 10 1-7.5 7 2 10L20 27l-8.5 5 2-10L6 15l10-1z" /></svg>
		</div>
		<h3>Honest and rigorous</h3>
		<p>
			Intuition first, but never at the price of truth: precise definitions, real proofs, worked examples, exercises
			with full solutions, and a glossary that is one hover away.
		</p>
	</div>
</section>

<section class="journey" aria-labelledby="journey-title">
	<div class="j-head">
		<p class="eyebrow">The road ahead</p>
		<h2 id="journey-title" class="gold-text">A prelude, five parts, one summit</h2>
		<p class="j-sub">Each part builds on the last. Read straight through, or follow the map to the ideas you need.</p>
	</div>
	<ol class="parts">
		{#each parts as part, pi (part.id)}
			<li class="part" style="--pc:{part.color}">
				<div class="rail" aria-hidden="true">
					<span class="node">{part.numeral}</span>
					{#if pi < parts.length - 1}<span class="line"></span>{/if}
				</div>
				<div class="pbody panel">
					<div class="ptop">
						<div>
							<div class="pnum ui">Part {part.numeral}</div>
							<h3 class="ptitle">{part.title}</h3>
							<p class="ptag">{part.tagline}</p>
						</div>
						<button
							class="toggle ui"
							aria-expanded={!!open[part.id]}
							onclick={() => (open[part.id] = !open[part.id])}
						>
							{part.chapters.length} chapters
							<span class="chev" class:up={open[part.id]} aria-hidden="true">⌄</span>
						</button>
					</div>
					{#if open[part.id]}
						<ol class="clist">
							{#each part.chapters as ch (ch.id)}
								<li>
									<a href={chapterHref(ch.id)}>
										<span class="cnum ui nums">{ch.num}</span>
										<span class="ctext">
											<span class="ctitle">{ch.title}</span>
											<span class="cblurb">{ch.blurb}</span>
										</span>
										{#if progress.visited[ch.id]}<span class="seen" aria-label="visited">✦</span>{/if}
									</a>
								</li>
							{/each}
						</ol>
					{:else}
						<div class="cchips">
							{#each part.chapters as ch (ch.id)}
								<a class="chip ui" href={chapterHref(ch.id)}><span class="nums">{ch.num}</span> {ch.title}</a>
							{/each}
						</div>
					{/if}
				</div>
			</li>
		{/each}
	</ol>
</section>

<section class="closing">
	<Ornament width={220} />
	<blockquote>
		<p>
			The measure of our success is whether what we do enables people to understand and think more clearly and
			effectively about mathematics.
		</p>
		<footer class="ui"><span class="who">William P. Thurston</span>, <i>On proof and progress in mathematics</i> (1994)</footer>
	</blockquote>
	<a class="btn gold ui" href={chapterHref('prelude/shape-of-a-question')}>Start with the first question →</a>
</section>

<footer class="site-foot ui">
	<span>Homology &amp; Cohomology — an illustrated journey</span>
	<span class="sep">·</span>
	<a href={href('/cheatsheet/')}>Cheat sheet</a>
	<span class="sep">·</span>
	<a href={href('/sources/')}>Sources &amp; further reading</a>
	<span class="sep">·</span>
	<a href="https://github.com/NeoVand/homology" target="_blank" rel="noopener noreferrer">Source code</a>
</footer>

<style>
	.hero {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		align-items: center;
		max-width: 86rem;
		margin: 0 auto;
		padding: 1rem 1.25rem 0;
		min-height: calc(100vh - var(--topbar-h));
	}
	.hero-art {
		order: 0;
		margin: 0 -1.25rem;
	}
	.hero-text {
		order: 1;
		position: relative;
		z-index: 2;
		text-align: center;
		padding-bottom: 3rem;
	}
	@media (min-width: 980px) {
		.hero {
			grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
			gap: 1rem;
		}
		.hero-text {
			order: 0;
			text-align: left;
			padding: 0 0 2rem 1.5rem;
		}
		.hero-art {
			order: 1;
			margin: 0;
		}
	}
	.title {
		font-family: var(--font-display);
		font-weight: 600;
		font-size: clamp(2.3rem, 9.2vw, 4.7rem);
		line-height: 1.02;
		letter-spacing: 0.03em;
		margin: 0.6rem 0 1.2rem;
		display: flex;
		flex-direction: column;
		filter: drop-shadow(0 4px 30px rgba(242, 205, 135, 0.22));
	}
	.amp {
		font-family: var(--font-elegant);
		font-style: italic;
		font-weight: 500;
		font-size: 0.62em;
		color: var(--ink-dim);
		line-height: 1.1;
		margin: 0.05em 0 0.1em 0.1em;
	}
	@media (min-width: 980px) {
		.title {
			font-size: clamp(2.3rem, 5.1vw, 4.7rem);
		}
	}
	@media (max-width: 979px) {
		.title {
			align-items: center;
		}
	}
	.sub {
		font-family: var(--font-elegant);
		font-size: clamp(1.25rem, 1.05rem + 0.7vw, 1.6rem);
		line-height: 1.45;
		color: var(--ink);
		max-width: 34rem;
		margin: 0 0 1.8rem;
	}
	@media (max-width: 979px) {
		.sub {
			margin-left: auto;
			margin-right: auto;
		}
	}
	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
	}
	@media (max-width: 979px) {
		.ctas {
			justify-content: center;
		}
	}
	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.85rem 1.4rem;
		border-radius: 12px;
		font-size: 0.92rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-decoration: none;
		transition: all 0.2s var(--ease);
	}
	.btn.gold {
		color: #1a1206;
		background: linear-gradient(180deg, #f8e2ab, #d1a65c);
		box-shadow:
			0 10px 30px -10px rgba(216, 178, 110, 0.8),
			inset 0 1px 0 rgba(255, 255, 255, 0.5);
	}
	.btn.gold:hover {
		transform: translateY(-1px);
		filter: brightness(1.06);
	}
	.btn.ghost {
		color: var(--gold-bright);
		border: 1px solid var(--line-strong);
		background: rgba(216, 178, 110, 0.05);
	}
	.btn.ghost:hover {
		background: rgba(216, 178, 110, 0.12);
	}
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.6rem;
		margin-top: 1.6rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	@media (max-width: 979px) {
		.stats {
			justify-content: center;
		}
	}
	.stats b {
		color: var(--gold);
		font-weight: 600;
	}
	.dot {
		opacity: 0.5;
	}

	.quote,
	.closing {
		max-width: 46rem;
		margin: 3rem auto 4rem;
		padding: 0 1.25rem;
		text-align: center;
	}
	.quote :global(.ornament),
	.closing :global(.ornament) {
		margin: 0 auto 1.6rem;
	}
	blockquote {
		margin: 0;
	}
	blockquote p {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: clamp(1.4rem, 1.1rem + 1vw, 1.9rem);
		line-height: 1.4;
		color: #ebdfc5;
		margin: 0 0 0.8rem;
	}
	blockquote footer {
		font-size: 0.82rem;
		color: var(--ink-faint);
	}
	.who {
		color: var(--gold);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		font-size: 0.74rem;
		font-weight: 600;
	}

	.two {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.4rem;
		max-width: 72rem;
		margin: 0 auto 4.5rem;
		padding: 0 1.25rem;
	}
	@media (min-width: 860px) {
		.two {
			grid-template-columns: 1fr 1fr;
		}
	}
	.card {
		padding: 1.6rem 1.7rem 1rem;
	}
	.kicker {
		font-size: 0.72rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.card h2 {
		font-family: var(--font-display);
		font-size: 1.6rem;
		letter-spacing: 0.04em;
		color: var(--gold-bright);
		margin: 0.35rem 0 1rem;
	}
	.card p {
		color: var(--ink-dim);
		font-size: 1.02rem;
		line-height: 1.65;
	}
	.card p strong {
		color: var(--ink-bright);
	}
	.mini {
		width: 100%;
		height: auto;
		display: block;
		margin-bottom: 0.6rem;
	}
	.mini .lab {
		font-family: var(--font-ui);
		font-size: 10.5px;
		letter-spacing: 0.06em;
		fill: var(--ink-dim);
	}
	.mini .lab.rose {
		fill: var(--rose);
		font-size: 12px;
		font-weight: 600;
	}

	.features {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 1.6rem 2.4rem;
		max-width: 72rem;
		margin: 0 auto 5rem;
		padding: 0 1.25rem;
	}
	@media (min-width: 860px) {
		.features {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.feature h3 {
		font-family: var(--font-elegant);
		font-size: 1.45rem;
		font-weight: 600;
		margin: 0.7rem 0 0.4rem;
	}
	.feature p {
		color: var(--ink-dim);
		font-size: 0.98rem;
		line-height: 1.65;
		margin: 0;
	}
	.ficon {
		width: 2.8rem;
		height: 2.8rem;
		border-radius: 12px;
		display: grid;
		place-items: center;
		background: radial-gradient(circle at 30% 30%, rgba(242, 208, 143, 0.25), rgba(242, 208, 143, 0.04));
		border: 1px solid var(--line);
	}
	.ficon svg {
		width: 1.6rem;
		height: 1.6rem;
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 1.6;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	.journey {
		max-width: 60rem;
		margin: 0 auto 5rem;
		padding: 0 1.25rem;
	}
	.j-head {
		text-align: center;
		margin-bottom: 2.6rem;
	}
	.j-head h2 {
		font-family: var(--font-display);
		font-size: clamp(2rem, 1.4rem + 2.4vw, 3rem);
		letter-spacing: 0.03em;
		margin: 0.6rem 0 0.6rem;
	}
	.j-sub {
		color: var(--ink-dim);
		font-family: var(--font-elegant);
		font-size: 1.25rem;
		font-style: italic;
		margin: 0;
	}
	.parts {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.part {
		display: grid;
		grid-template-columns: 3.4rem minmax(0, 1fr);
		gap: 0.9rem;
	}
	.rail {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.node {
		width: 3rem;
		height: 3rem;
		flex: none;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-family: var(--font-display);
		font-weight: 600;
		font-size: 1rem;
		color: var(--pc);
		border: 1px solid color-mix(in srgb, var(--pc) 60%, transparent);
		background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--pc) 25%, transparent), rgba(5, 8, 15, 0.9));
		box-shadow: 0 0 22px -4px color-mix(in srgb, var(--pc) 60%, transparent);
	}
	.line {
		flex: 1;
		width: 1px;
		margin: 0.3rem 0;
		background: linear-gradient(var(--pc), var(--line));
		min-height: 1.5rem;
	}
	.pbody {
		padding: 1.15rem 1.3rem 1.2rem;
		margin-bottom: 1.4rem;
	}
	.ptop {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start;
	}
	.pnum {
		font-size: 0.7rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--pc);
	}
	.ptitle {
		font-family: var(--font-display);
		font-size: 1.5rem;
		letter-spacing: 0.04em;
		margin: 0.2rem 0 0.25rem;
	}
	.ptag {
		margin: 0;
		color: var(--ink-dim);
		font-size: 0.98rem;
	}
	.toggle {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.74rem;
		color: var(--ink-dim);
		background: transparent;
		border: 1px solid var(--line-faint);
		border-radius: 999px;
		padding: 0.35rem 0.75rem;
		cursor: pointer;
	}
	.toggle:hover {
		color: var(--gold-bright);
		border-color: var(--line);
	}
	.chev {
		transition: transform 0.2s;
		display: inline-block;
	}
	.chev.up {
		transform: rotate(180deg);
	}
	.cchips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.9rem;
	}
	.chip {
		font-size: 0.76rem;
		padding: 0.28rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		color: var(--ink-dim);
		text-decoration: none;
		transition: all 0.2s var(--ease);
	}
	.chip span {
		color: var(--pc);
	}
	.chip:hover {
		color: var(--ink-bright);
		border-color: var(--line);
		background: rgba(216, 178, 110, 0.06);
	}
	.clist {
		list-style: none;
		margin: 0.9rem 0 0;
		padding: 0;
		border-top: 1px solid var(--line-faint);
	}
	.clist a {
		display: flex;
		gap: 0.9rem;
		padding: 0.75rem 0.2rem;
		border-bottom: 1px solid var(--line-faint);
		text-decoration: none;
		color: var(--ink);
	}
	.clist a:hover .ctitle {
		color: var(--gold-bright);
	}
	.cnum {
		color: var(--pc);
		font-size: 0.8rem;
		min-width: 2rem;
		padding-top: 0.2rem;
	}
	.ctext {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		flex: 1;
	}
	.ctitle {
		font-family: var(--font-elegant);
		font-size: 1.2rem;
		font-weight: 600;
		transition: color 0.2s;
	}
	.cblurb {
		font-size: 0.92rem;
		color: var(--ink-dim);
		line-height: 1.5;
	}
	.seen {
		color: var(--gold);
		font-size: 0.7rem;
	}
	.closing .btn {
		margin-top: 2rem;
	}
	.site-foot {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem 0.7rem;
		padding: 2rem 1.25rem 3rem;
		font-size: 0.78rem;
		color: var(--ink-faint);
		border-top: 1px solid var(--line-faint);
	}
	.site-foot a {
		color: var(--gold);
		text-decoration: none;
	}
	.site-foot a:hover {
		color: var(--gold-pale);
	}
	.sep {
		opacity: 0.4;
	}
</style>
