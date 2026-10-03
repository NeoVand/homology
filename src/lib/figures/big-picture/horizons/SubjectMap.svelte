<script lang="ts">
	// Figure: a constellation of the fields that grew out of homology. Click a
	// star for a paragraph and references. On narrow screens the stars become a
	// list of chips.
	import Svg from '$lib/components/svg/Svg.svelte';

	type Group = 'core' | 'pure' | 'applied' | 'physics';
	interface Node {
		id: string;
		label: string;
		x: number;
		y: number;
		/** label alignment (default: centred under the star) and horizontal shift */
		anchor?: 'start' | 'middle' | 'end';
		dx?: number;
		group: Group;
		text: string;
		refs: { title: string; url?: string }[];
	}
	const nodes: Node[] = [
		{
			id: 'core',
			label: 'Homology & cohomology',
			x: 500,
			y: 300,
			group: 'core',
			text: 'Where this book lives: chains and cochains, cycles modulo boundaries, and the long exact sequences, products and dualities that make them computable. Every other star on this map is reached from here.',
			refs: [{ title: 'Hatcher, Algebraic Topology (free)', url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf' }]
		},
		{
			id: 'homalg',
			label: 'Homological algebra',
			x: 330,
			y: 165,
			group: 'pure',
			text: 'The algebra of chain complexes, exact sequences and derived functors such as Ext and Tor, extracted from topology in the 1940s and now used across algebra, geometry and representation theory (§5.2).',
			refs: [{ title: 'Weibel, An Introduction to Homological Algebra (CUP 1994)' }, { title: 'Chow, You Could Have Invented Spectral Sequences', url: 'https://www.ams.org/notices/200601/fea-chow.pdf' }]
		},
		{
			id: 'cat',
			label: 'Category theory',
			x: 120,
			y: 95,
			group: 'pure',
			text: 'Objects, arrows, functors and natural transformations — invented by Eilenberg and Mac Lane to say precisely what “natural” means in homology, and now a common language for mathematics and parts of computer science (§5.1).',
			refs: [{ title: 'Leinster, Basic Category Theory', url: 'https://arxiv.org/abs/1612.09375' }, { title: 'Riehl, Category Theory in Context', url: 'https://emilyriehl.github.io/files/context.pdf' }]
		},
		{
			id: 'homotopy',
			label: 'Homotopy theory',
			x: 560,
			y: 95,
			group: 'pure',
			text: 'Spaces up to deformation, studied through the homotopy groups πₙ. They are far harder than homology: the homotopy groups of spheres are still not known in general. Modern homotopy theory works with spectra, the objects that represent cohomology theories.',
			refs: [{ title: 'Hatcher, Algebraic Topology, Chapter 4', url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf' }]
		},
		{
			id: 'gencoh',
			label: 'K-theory & cobordism',
			x: 800,
			y: 120,
			group: 'pure',
			text: 'Generalized cohomology theories: all the Eilenberg–Steenrod axioms except dimension. Topological K-theory (Atiyah and Hirzebruch, 1961) is built from vector bundles; cobordism (Thom, 1954) from manifolds. Each is represented by a spectrum.',
			refs: [{ title: 'Hatcher, Vector Bundles and K-Theory (free)', url: 'https://pi.math.cornell.edu/~hatcher/VBKT/VBpage.html' }, { title: 'Atiyah, K-Theory (1967 lecture notes)' }]
		},
		{
			id: 'sheaf',
			label: 'Sheaves & algebraic geometry',
			x: 150,
			y: 290,
			group: 'pure',
			text: 'Grothendieck recast cohomology as the derived functors of “global sections” (Tôhoku, 1957), and it became the backbone of algebraic geometry. Étale cohomology led to Deligne’s proof of the Weil conjectures (1974).',
			refs: [{ title: 'Vakil, The Rising Sea: Foundations of Algebraic Geometry (free)', url: 'https://math.stanford.edu/~vakil/216blog/' }]
		},
		{
			id: 'charclass',
			label: 'Characteristic classes & index theory',
			x: 850,
			y: 280,
			anchor: 'end',
			dx: 40,
			group: 'pure',
			text: 'Cohomology classes that measure how a vector bundle twists — Stiefel–Whitney, Euler, Chern, Pontryagin (§4.8). The Atiyah–Singer index theorem (1963) computes analytic invariants of differential operators from them.',
			refs: [{ title: 'Milnor and Stasheff, Characteristic Classes (Princeton 1974)' }]
		},
		{
			id: 'hodge',
			label: 'Hodge theory',
			x: 370,
			y: 450,
			group: 'pure',
			text: 'Every de Rham class on a closed Riemannian manifold has exactly one harmonic representative (Hodge, 1941). On graphs and complexes the same statement is a least-squares problem for the Hodge Laplacian (§5.3).',
			refs: [{ title: 'Lim, Hodge Laplacians on Graphs', url: 'https://arxiv.org/abs/1507.05379' }]
		},
		{
			id: 'knots',
			label: 'Knot homologies & Floer theory',
			x: 610,
			y: 450,
			group: 'pure',
			text: 'Khovanov homology (2000) assigns to a knot a homology theory whose graded Euler characteristic is the Jones polynomial — a categorification; it detects the unknot (Kronheimer–Mrowka, 2011). Floer homologies, an infinite-dimensional Morse theory, play a similar role for 3- and 4-manifolds.',
			refs: [{ title: 'Bar-Natan, On Khovanov’s categorification of the Jones polynomial', url: 'https://arxiv.org/abs/math/0201043' }, { title: 'Khovanov, A categorification of the Jones polynomial', url: 'https://arxiv.org/abs/math/9908171' }]
		},
		{
			id: 'groupcoh',
			label: 'Group cohomology & number theory',
			x: 160,
			y: 450,
			group: 'pure',
			text: 'Cohomology of groups — Ext over a group ring — classifies group extensions; even “carrying” in school arithmetic is a 2-cocycle (Isaksen, 2002). Galois cohomology is a basic tool of modern number theory.',
			refs: [{ title: 'Brown, Cohomology of Groups (Springer GTM 87)' }, { title: 'Isaksen, A cohomological viewpoint on elementary school arithmetic (Amer. Math. Monthly 2002)' }]
		},
		{
			id: 'tda',
			label: 'Persistent homology & TDA',
			x: 520,
			y: 640,
			group: 'applied',
			text: 'Homology across scales, recorded as barcodes, and stable under noise (§3.7). Applied to proteins, materials, images, voting maps and more; persistent cohomology gives circular coordinates for data (§5.3).',
			refs: [{ title: 'Ghrist, Barcodes: the persistent topology of data', url: 'https://www.ams.org/journals/bull/2008-45-01/S0273-0979-07-01191-3/' }, { title: 'Otter et al., A roadmap for the computation of persistent homology', url: 'https://arxiv.org/abs/1506.08903' }]
		},
		{
			id: 'sensors',
			label: 'Sensor networks',
			x: 400,
			y: 585,
			group: 'applied',
			text: 'Sensors that only know which neighbours they can hear can still certify, using homology of a Rips complex, that a region is covered without gaps (de Silva and Ghrist, 2007).',
			refs: [{ title: 'de Silva and Ghrist, Coverage in sensor networks via persistent homology', url: 'https://msp.org/agt/2007/7-1/p16.xhtml' }]
		},
		{
			id: 'neuro',
			label: 'Neuroscience',
			x: 640,
			y: 585,
			group: 'applied',
			text: 'Topology of the correlations between neurons can reveal geometric structure that ordinary statistics misses (Giusti, Pastalkova, Curto and Itskov, “Clique topology reveals intrinsic geometric structure in neural correlations”, PNAS 2015).',
			refs: [{ title: 'Giusti et al., PNAS 112 (2015) 13455–13460' }]
		},
		{
			id: 'robots',
			label: 'Robotics & motion planning',
			x: 780,
			y: 640,
			group: 'applied',
			text: 'A robot’s possible positions form a configuration space. Farber’s topological complexity (2003) uses cohomology to bound how many continuous rules any motion planner needs; for a space as simple as a circle, one rule is never enough.',
			refs: [{ title: 'Farber, Topological complexity of motion planning', url: 'https://arxiv.org/abs/math/0111197' }]
		},
		{
			id: 'rank',
			label: 'Rankings & networks',
			x: 90,
			y: 585,
			group: 'applied',
			text: 'HodgeRank splits pairwise comparisons into a global ranking plus local and global inconsistencies, using the Hodge decomposition on a graph (Jiang, Lim, Yao and Ye, 2011).',
			refs: [{ title: 'Jiang, Lim, Yao, Ye, Statistical ranking and combinatorial Hodge theory', url: 'https://arxiv.org/abs/0811.1067' }]
		},
		{
			id: 'dec',
			label: 'Geometry processing',
			x: 260,
			y: 640,
			group: 'applied',
			text: 'Cochains are discrete differential forms (§4.1–4.4), and the resulting “discrete exterior calculus” runs simulations, mesh processing and computer graphics.',
			refs: [{ title: 'Crane, Discrete Differential Geometry: An Applied Introduction', url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf' }]
		},
		{
			id: 'phases',
			label: 'Topological phases of matter',
			x: 920,
			y: 400,
			anchor: 'end',
			dx: 30,
			group: 'physics',
			text: 'Materials whose properties are protected by topology. In the integer quantum Hall effect the Hall conductance is a Chern number (Thouless, Kohmoto, Nightingale and den Nijs, 1982); topological insulators and superconductors are organised by K-theory (Kitaev’s “periodic table”, 2009).',
			refs: [{ title: 'Kitaev, Periodic table for topological insulators and superconductors', url: 'https://arxiv.org/abs/0901.2686' }]
		},
		{
			id: 'tqft',
			label: 'Topological quantum field theory',
			x: 910,
			y: 560,
			anchor: 'end',
			dx: 30,
			group: 'physics',
			text: 'Atiyah (1988) axiomatised topological quantum field theories as rules that assign vector spaces to manifolds and linear maps to cobordisms between them — in category language, functors. Physicists also describe “anomalies” of quantum field theories with cohomology and cobordism invariants.',
			refs: [{ title: 'Atiyah, Topological quantum field theories (Publ. Math. IHÉS 68, 1988)' }]
		}
	];
	const links: [string, string][] = [
		['core', 'homalg'],
		['core', 'homotopy'],
		['core', 'gencoh'],
		['core', 'sheaf'],
		['core', 'charclass'],
		['core', 'hodge'],
		['core', 'knots'],
		['core', 'groupcoh'],
		['core', 'tda'],
		['core', 'phases'],
		['homalg', 'cat'],
		['homalg', 'sheaf'],
		['homalg', 'groupcoh'],
		['cat', 'homotopy'],
		['homotopy', 'gencoh'],
		['gencoh', 'charclass'],
		['gencoh', 'phases'],
		['gencoh', 'tqft'],
		['charclass', 'phases'],
		['hodge', 'rank'],
		['hodge', 'dec'],
		['tda', 'sensors'],
		['tda', 'neuro'],
		['tda', 'robots'],
		['knots', 'tqft'],
		['knots', 'cat'],
		['tqft', 'phases']
	];
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const colors: Record<Group, string> = { core: '#f2d08f', pure: '#a493ff', applied: '#5fd6cf', physics: '#f28db6' };
	const groupNames: Record<Group, string> = { core: 'This book', pure: 'Pure mathematics', applied: 'Applications', physics: 'Physics' };

	let active = $state('core');
	const cur = $derived(byId.get(active)!);
	const neighbours = $derived(new Set(links.filter(([a, b]) => a === active || b === active).flatMap(([a, b]) => [a, b])));

	// a fixed field of faint background stars
	const stars = Array.from({ length: 90 }, (_, i) => {
		const r = (k: number) => {
			const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
			return x - Math.floor(x);
		};
		return { x: r(1) * 1000, y: r(2) * 700, s: 0.4 + r(3) * 1.3, o: 0.15 + r(4) * 0.45 };
	});
	const labelSide = (n: Node) => n.anchor ?? 'middle';
</script>

<div class="map">
	<div class="sky">
		<Svg viewBox="0 30 1000 650" maxHeight={560} label="A constellation of fields that grew out of homology; select a star to read about it">
			{#each stars as s, i (i)}
				<circle cx={s.x} cy={s.y} r={s.s} fill="#fff6dc" opacity={s.o} />
			{/each}
			{#each links as [a, b], i (i)}
				{@const A = byId.get(a)!}
				{@const B = byId.get(b)!}
				<line x1={A.x} y1={A.y} x2={B.x} y2={B.y} class="link" class:lit={a === active || b === active} />
			{/each}
			{#each nodes as n (n.id)}
				{@const on = n.id === active}
				{@const near = neighbours.has(n.id)}
				<g
					class="star"
					class:on
					class:near
					role="button"
					tabindex="0"
					aria-label={n.label}
					aria-pressed={on}
					onclick={() => (active = n.id)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (active = n.id))}
				>
					<circle cx={n.x} cy={n.y} r={n.group === 'core' ? 26 : 18} fill={colors[n.group]} class="halo" />
					<circle cx={n.x} cy={n.y} r={n.group === 'core' ? 9 : 6} fill={colors[n.group]} class="core" />
					<circle cx={n.x} cy={n.y} r="22" class="hit" />
					<text
						x={n.x + (n.dx ?? 0)}
						y={n.y + (n.group === 'core' ? 44 : 34)}
						text-anchor={labelSide(n)}
						class="lbl"
						style="fill:{on ? colors[n.group] : ''}">{n.label}</text
					>
				</g>
			{/each}
		</Svg>
	</div>
	<div class="chips ui" role="group" aria-label="Topics on the map">
		{#each nodes as n (n.id)}
			<button class="chip" class:on={n.id === active} aria-pressed={n.id === active} style="--c:{colors[n.group]}" onclick={() => (active = n.id)}>{n.label}</button>
		{/each}
	</div>
	<div class="detail" aria-live="polite">
		<div class="dhead">
			<span class="dot" style="background:{colors[cur.group]}"></span>
			<span class="dtitle">{cur.label}</span>
			<span class="dgroup ui">{groupNames[cur.group]}</span>
		</div>
		<p>{cur.text}</p>
		<ul class="refs ui">
			{#each cur.refs as r (r.title)}
				<li>{#if r.url}<a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>{:else}{r.title}{/if}</li>
			{/each}
		</ul>
	</div>
	<div class="legend ui">
		{#each Object.entries(groupNames) as [g, name] (g)}
			<span><i style="background:{colors[g as Group]}"></i>{name}</span>
		{/each}
	</div>
</div>

<style>
	.map {
		padding-top: 0.6rem;
	}
	.sky {
		padding: 0 0.6rem;
	}
	.link {
		stroke: rgba(242, 208, 143, 0.14);
		stroke-width: 1.2;
		transition: all 0.3s var(--ease);
	}
	.link.lit {
		stroke: rgba(242, 208, 143, 0.6);
		stroke-width: 1.8;
	}
	.star {
		cursor: pointer;
		outline: none;
	}
	.star .halo {
		opacity: 0.12;
		transition: opacity 0.3s;
	}
	.star.near .halo {
		opacity: 0.22;
	}
	.star.on .halo {
		opacity: 0.4;
	}
	.star .core {
		stroke: #fff6dc;
		stroke-width: 1.2;
	}
	.star:hover .halo,
	.star:focus-visible .halo {
		opacity: 0.45;
	}
	.hit {
		fill: transparent;
	}
	.lbl {
		font-family: var(--font-ui) !important;
		font-size: 15px !important;
		fill: var(--ink-dim) !important;
		letter-spacing: 0.02em;
		transition: fill 0.3s;
		paint-order: stroke;
		stroke: rgba(8, 12, 26, 0.92);
		stroke-width: 5px;
		stroke-linejoin: round;
	}
	.star.on .lbl {
		font-weight: 650;
	}
	.chips {
		display: none;
		flex-wrap: wrap;
		gap: 0.4rem;
		padding: 0 1rem;
	}
	.chip {
		border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
		background: color-mix(in srgb, var(--c) 8%, transparent);
		color: var(--ink);
		border-radius: 999px;
		padding: 0.4rem 0.75rem;
		font-size: 0.78rem;
		cursor: pointer;
		min-height: 2rem;
	}
	.chip.on {
		background: color-mix(in srgb, var(--c) 30%, transparent);
		color: var(--ink-bright);
	}
	@media (max-width: 640px) {
		.sky {
			display: none;
		}
		.chips {
			display: flex;
		}
	}
	.detail {
		margin: 0.6rem 1rem 0.4rem;
		padding: 0.8rem 1rem 0.4rem;
		border-radius: 12px;
		border: 1px solid var(--line-faint);
		background: rgba(5, 9, 18, 0.5);
		min-height: 9.5rem;
	}
	.dhead {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.dot {
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		box-shadow: 0 0 10px currentColor;
	}
	.dtitle {
		font-family: var(--font-elegant);
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--ink-bright);
	}
	.dgroup {
		font-size: 0.68rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.detail p {
		margin: 0.4rem 0 0.4rem;
		font-size: 0.95rem;
	}
	.refs {
		margin: 0 0 0.4rem !important;
		padding-left: 1.1rem !important;
		font-size: 0.8rem;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.2rem;
		justify-content: center;
		font-size: 0.74rem;
		color: var(--ink-dim);
		padding: 0 1rem 0.8rem;
	}
	.legend i {
		display: inline-block;
		width: 0.6rem;
		height: 0.6rem;
		border-radius: 50%;
		margin-right: 0.35rem;
	}
</style>
