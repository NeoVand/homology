<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Notation from '$lib/components/prose/Notation.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import PotentialPainter from '$lib/figures/cohomology/cochains/PotentialPainter.svelte';
	import FindPotential from '$lib/figures/cohomology/cochains/FindPotential.svelte';
	import CurlTriangle from '$lib/figures/cohomology/cochains/CurlTriangle.svelte';
	import AnnulusCochain from '$lib/figures/cohomology/cochains/AnnulusCochain.svelte';
	import ImpossibleObjects from '$lib/figures/cohomology/cochains/ImpossibleObjects.svelte';
	import GearRing from '$lib/figures/cohomology/cochains/GearRing.svelte';
	import Arbitrage from '$lib/figures/cohomology/cochains/Arbitrage.svelte';
	import MirrorDiagram from '$lib/figures/cohomology/cochains/MirrorDiagram.svelte';
	import HodgeDecomposer from '$lib/figures/cohomology/cochains/HodgeDecomposer.svelte';

	const reading = [
		{
			title: 'Algebraic Topology, Chapter 3 (“The Idea of Cohomology”, pp. 186–189)',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The model for this chapter: trails on a mountain, voltages in a circuit, and the local and global obstructions — in four pages. The rest of the chapter is graduate level.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Hodge Laplacians on Graphs',
			author: 'Lek-Heng Lim (SIAM Review 62, 2020)',
			url: 'https://arxiv.org/abs/1507.05379',
			note: 'Cohomology and Hodge theory using nothing but matrices and graphs. Section 2 (“cohomology on a bumper sticker”) is the best next read after this chapter.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Discrete Differential Geometry: An Applied Introduction',
			author: 'Keenan Crane',
			url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
			note: 'Discrete differential forms as “integrated” measurements on meshes, the discrete exterior derivative, and a beautiful chapter on Hodge decomposition. Undergraduate level, wonderful pictures.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Statistical ranking and combinatorial Hodge theory',
			author: 'Xiaoye Jiang, Lek-Heng Lim, Yuan Yao, Yinyu Ye (Math. Programming 127, 2011)',
			url: 'https://arxiv.org/abs/0811.1067',
			note: 'HodgeRank: turning pairwise comparisons into a ranking (the gradient part) plus local and global inconsistencies (curl and harmonic parts).',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Obstructions to Reality: Torsors & Visual Paradox',
			author: 'Robert Ghrist & Zoe Cooperband (2025)',
			url: 'https://arxiv.org/abs/2507.01226',
			note: 'A gallery of impossible staircases on cylinders, Möbius bands, tori and Klein bottles, analysed with exactly the ideas of this chapter.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Impossible by Degrees: Cohomology & Bistable Visual Paradox',
			author: 'Lewis Ghrist & Robert Ghrist (2026)',
			url: 'https://arxiv.org/abs/2602.09313',
			note: 'Gears, Necker cubes and tilings with ℤ/2 coefficients, with a companion playlist of animations. The source of our gear ring.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'On the cohomology of impossible figures',
			author: 'Roger Penrose (Leonardo 25, 1992; first published 1991)',
			url: 'https://doi.org/10.2307/1575844',
			note: 'Penrose’s own short essay explaining the tribar as a cohomology class. For a gentle walk-through, read Phillips’s column below first.',
			kind: 'paper' as const
		},
		{
			title: 'The Topology of Impossible Spaces',
			author: 'Tony Phillips (AMS Feature Column, October 2014)',
			url: 'https://www.ams.org/publicoutreach/feature-column/fc-2014-10',
			note: 'A friendly, illustrated explanation of Penrose’s argument with depth ratios on overlapping pieces.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'This Week’s Finds in Mathematical Physics, Week 293',
			author: 'John Baez (2010)',
			url: 'https://math.ucr.edu/home/baez/week293.html',
			note: 'Electrical circuits through the eyes of homology: currents as chains, voltages as cochains, power as their pairing.',
			kind: 'web' as const,
			free: true
		}
	];
</script>

<Epigraph author="Robert Ghrist and Zoe Cooperband" source="Obstructions to Reality: Torsors & Visual Paradox (2025)"
	>Visual paradoxes like the Penrose staircase present a fundamental tension: locally coherent geometric relationships that cannot be realized globally.</Epigraph
>

<p class="lead">
	Everything in Part III was about <em>places</em>. A chain was an inventory of pieces of a shape — these edges, those triangles, each
	with a multiplicity — and homology asked which inventories go around holes. This chapter turns the telescope around. Instead of
	adding pieces up, we will <em>measure</em> them: write a number on every vertex, or on every edge, the way a hiker writes elevations
	on a trail map or an engineer writes voltages on a circuit diagram.
</p>
<p class="lead">
	A single, innocent question will then lead us straight back to the holes: when do numbers written on the edges come from numbers
	written on the vertices? The answer — “exactly when every loop adds up to zero” — sounds like accounting. It is the beginning of
	cohomology, and it explains impossible staircases, jammed gears and free money on the currency markets along the way.
</p>

<Ahead>
	<p>
		The numbers we write on simplices are called <em>cochains</em>, and the rule that turns numbers on vertices into numbers on edges
		(and numbers on edges into numbers on triangles) is the <em>coboundary</em> \(\delta\). In <Ref to="cohomology/cohomology-groups" /> they
		become a machine exactly parallel to homology, with groups \(H^k\). Everything else in Part IV grows from this chapter: differential
		forms (<Ref to="cohomology/differential-forms" />) are cochains for smooth spaces, de Rham cohomology is the calculus version of the
		staircase puzzle, the cup product multiplies measurements, and sheaves (<Ref to="cohomology/sheaves" />) are the general theory of
		“locally fine, globally impossible”.
	</p>
</Ahead>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="places-and-measurements">Places and measurements</h2>

<p>
	Here is a trail map of a small mountain. The dots are junctions, the lines are trails. In the language of
	<Ref to="topology/simplicial-complexes" /> this is a <Term t="simplicial-complex">simplicial complex</Term> of dimension one — a graph.
	Next to each junction is its elevation above sea level, in metres.
</p>
<p>
	A hiker does not really care about elevations; she cares about <em>climbs</em>. How much does the trail from the Spring to the Ridge go
	up? That is the elevation at the Ridge minus the elevation at the Spring: \(1780 - 1460 = 320\) metres. So the elevations on the
	junctions automatically produce a number on every trail. Play with this in the figure: drag a junction up or down and watch the
	numbers on the trails next to it change.
</p>

<Figure num="4.1.1" title="Heights make climbs" hint="Drag a junction up or down · tap a trail to flip its arrow">
	<PotentialPainter />
	{#snippet caption()}
		Heights on the junctions (gold) produce climbs on the trails (teal): each trail carries the height at its arrow’s head minus the
		height at its tail. Raising one junction changes only the trails that touch it. However you set the heights, the climbs around
		every closed loop add up to \(0\) — try the three loops with “Next loop”, and try the tilted terrain view.
	{/snippet}
</Figure>

<p>
	Let us write this down carefully, because every symbol in it will stay with us for the rest of the book.
</p>

<Definition id="def-potential" title="Potentials and their differences">
	<p>
		Let \(G\) be a graph with vertex set \(V\). A <dfn>potential</dfn> (or <em>height function</em>) is a function \(f\colon V \to \R\)
		that assigns a number \(f(v)\) to every vertex \(v\). For an edge \(e\) whose arrow points from \(u\) to \(v\), we define
	</p>
	\[ (\delta f)(e) \;=\; f(v) - f(u), \qquad \text{“head minus tail”}. \]
	<p>
		The function \(\delta f\), which assigns a number to every edge, is called the <dfn>discrete gradient</dfn> (or <em>difference</em>)
		of \(f\). The symbol \(\delta\) is the Greek letter <em>delta</em>, the traditional letter for “change in”.
	</p>
</Definition>

<p>
	The arrow on each edge matters. Walk the trail from the Spring to the Ridge and you climb \(320\) metres; walk it the other way and you
	“climb” \(-320\) metres. A number on an edge only makes sense once we have agreed which way the edge points. In this book every edge of
	a simplicial complex points from its lower-numbered vertex to its higher-numbered one (the convention of <Ref to="homology/chains" />),
	and in the figures the arrows are drawn. Tap a trail in Figure 4.1.1 to flip its arrow: the number on it changes sign, and nothing else
	changes. This is the same <Term t="orientation">orientation</Term> bookkeeping that gave chains their signs.
</p>

<h3>A second model: voltages</h3>
<p>
	Exactly the same arithmetic describes an electrical circuit. The vertices are the connection points, \(f(v)\) is the voltage (the
	electric potential) at \(v\), and \((\delta f)(e)\) is the voltage across the component sitting on the edge \(e\) — the thing a
	voltmeter clipped to its two ends would read. John Baez puts it in the language we are building:
	“it’s good to think of \(V\) as a 1-cochain, which assigns to each edge the voltage across that edge.” The word <em>cochain</em> is
	coming in a moment; for now, read it as “a number on every edge”.
</p>

<h3>Walking a path: the climbs telescope</h3>
<p>
	Suppose you walk from the Trailhead to the Summit by way of the Spring and the Ridge. Adding up the climbs along the way gives
</p>
\[ \underbrace{(1460 - 1200)}_{+260} + \underbrace{(1780 - 1460)}_{+320} + \underbrace{(1920 - 1780)}_{+140} \;=\; 1920 - 1200 \;=\; 720. \]
<p>
	Every intermediate height appears once with a plus sign and once with a minus sign, and cancels. Only the two ends survive. A sum that
	collapses like this is called <dfn>telescoping</dfn>, after the old folding telescope whose segments slide inside each other. In
	general, if a walk visits the vertices \(v_0, v_1, \dots, v_k\) in order, then
</p>
\[ \sum_{i=1}^{k} \big( f(v_i) - f(v_{i-1}) \big) \;=\; f(v_k) - f(v_0). \]
<p>
	(If the walk uses an edge against its arrow, the climb counts with a minus sign, which is exactly what the formula needs.) This is the
	<em>discrete fundamental theorem of calculus</em>: adding up the changes along a route gives the total change, and the total change
	depends only on where you start and where you finish — not on the route. The other route in the figure, Trailhead → Meadow → Lake →
	Hut → Summit, gives \(150 + 180 + 80 + 310 = 720\) as well.
</p>
<p>
	And here is the consequence that will drive the whole chapter. If the walk is a <em>closed loop</em>, so that it ends where it began,
	then \(v_k = v_0\) and the total is \(f(v_0) - f(v_0) = 0\). <strong>The climbs around any closed loop add up to zero</strong>: you
	cannot walk in a circle and end up higher than you started. In circuit language this is <em>Kirchhoff’s voltage law</em>: the
	voltages around any closed loop of a circuit sum to zero.
</p>

<Intuition title="Places versus measurements">
	<p>
		A walk is a <em>place</em>: a list of edges, each used forwards or backwards — in the language of <Ref to="homology/chains" />, a
		<Term t="chain">1-chain</Term> such as \(c = e_1 + e_2 - e_3\). A labelling of the edges is a <em>measurement</em>. Combining the two —
		adding up the measurement along the place, with signs — is like computing an integral: the integrand is the measurement, the region
		of integration is the chain. We will write the result as
	</p>
	\[ \ip{\psi}{c} \;=\; \sum_{\text{edges } e} c_e \, \psi(e), \]
	<p>
		read “psi paired with \(c\)”, where \(c_e\) is the coefficient of \(e\) in the chain \(c\). Telescoping says: for a gradient
		\(\psi = \delta f\), the pairing with a path only sees the path’s two ends.
	</p>
</Intuition>

<Question>
	<p>
		In Figure 4.1.1, put the Lake at 1700 m. Which trail numbers change? Now walk the loop Spring → Lake → Ridge → Spring in your head:
		why must the three climbs still add up to zero, whatever the Lake’s height?
	</p>
</Question>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="the-gradient-puzzle">The gradient puzzle</h2>

<p>
	Now run the story backwards. A hiker has kept a notebook: for every trail she walked, she wrote down how much it climbed. She never
	wrote down a single elevation. Can we reconstruct the elevations from her notebook?
</p>
<p>
	In symbols: we are handed a number \(\psi(e)\) on every edge \(e\) (the letter \(\psi\) is <em>psi</em>), and we ask whether there is
	a potential \(f\) with \(\delta f = \psi\). If there is, we call \(\psi\) a <dfn>gradient</dfn>. Sometimes the answer is yes and
	sometimes no, and the difference between the two is the first glimpse of cohomology. Try it yourself before reading on.
</p>

<Figure num="4.1.2" title="Find the potential" hint="Tap a vertex, set its height · or integrate from it">
	<FindPotential />
	{#snippet caption()}
		The gold numbers on the edges are given; your job is to put heights on the vertices so that every edge equals head minus tail.
		An edge turns green when it is satisfied and rose when it is not. “Integrate” does it systematically: start at one vertex, walk a
		spanning tree (teal), then test every leftover edge. The test fails exactly when the leftover edge closes a loop whose numbers do
		not add up to \(0\), and that whole loop turns rose.
	{/snippet}
</Figure>

<h3>On a tree, it always works</h3>
<p>
	If the graph is a tree — connected, with no loops at all — the puzzle always has a solution, and here is a recipe. Pick any vertex
	\(r\) (the <em>root</em>) and give it height \(0\). Every other vertex \(v\) is joined to \(r\) by exactly one path, because a tree has
	no loops to provide a second route. Walk that path and add up the numbers on its edges (with a minus sign for edges walked against
	their arrows); call the result \(f(v)\). Then every edge is satisfied: if an edge goes from \(u\) to \(v\), the path to \(v\) is the
	path to \(u\) followed by that edge, so \(f(v) = f(u) + \psi(e)\). Allen Hatcher, whose textbook this chapter follows, says it in one
	breath: once a value is chosen at a base vertex \(v_0\) and the change across each edge is specified, “this uniquely determines the
	value of \(\varphi\) at every other vertex \(v\) by induction along the unique path from \(v_0\) to \(v\) in the tree.” (Hatcher
	writes \(\varphi\) for the potential where we write \(f\).)
</p>

<h3>On a loop, the numbers must add up to zero</h3>
<p>
	The square puzzle “A loop that does not” in Figure 4.1.2 has \(+1\) on each of its four edges, all pointing the same way around. Say
	the bottom-left vertex has height \(h\). Following the arrows, the next vertex must be at \(h + 1\), the next at \(h + 2\), the next at
	\(h + 3\) — and the last edge leads back to the start, which would then have to be at \(h + 4\). But it is at \(h\). Since
	\(h \neq h + 4\), there is no solution, whatever \(h\) you choose.
</p>
<p>
	The culprit is the loop. We showed in the last section that any gradient sums to \(0\) around every loop; here the sum is
	\(1 + 1 + 1 + 1 = 4\). So a non-zero loop sum is a <em>certificate of impossibility</em>: one number that proves no potential can
	exist. The remarkable thing is that the converse also holds.
</p>

<Theorem id="gradient-test" label="Theorem (the gradient test)">
	<p>
		A labelling \(\psi\) of the edges of a graph is a gradient — that is, \(\psi = \delta f\) for some potential \(f\) — if and only
		if the sum of \(\psi\) around every closed loop is \(0\).
	</p>
</Theorem>
<Proof>
	<p>
		<em>Only if.</em> If \(\psi = \delta f\), the sum around a closed loop telescopes to \(f(v_0) - f(v_0) = 0\).
	</p>
	<p>
		<em>If.</em> Suppose every loop sum is \(0\). In each connected piece of the graph choose a root \(r\) and set
		\(f(v)\) = the sum of \(\psi\) along some path from \(r\) to \(v\). The answer does not depend on the path: if \(P\) and \(Q\) are
		two paths from \(r\) to \(v\), then “go along \(P\), come back along \(Q\) reversed” is a closed loop, its sum is
		\(\text{sum}(P) - \text{sum}(Q)\), and that is \(0\) by assumption. Now take an edge \(e\) from \(u\) to \(v\). A path to \(u\)
		followed by \(e\) is a path to \(v\), so \(f(v) = f(u) + \psi(e)\), which says precisely \((\delta f)(e) = \psi(e)\).
	</p>
</Proof>

<h3>How many loops must we check?</h3>
<p>
	A graph can have a great many loops, but we do not have to test them all. Recall from <Ref to="homology/cycles-and-boundaries" /> how
	a <Term t="spanning-tree">spanning tree</Term> organises the loops of a graph: the edges outside the tree are the troublemakers, and
	each one closes exactly one <em>fundamental loop</em> with the tree. Every loop of the graph is a combination of fundamental loops, and
	loop sums add up the same way, so it is enough to check the fundamental ones. That is exactly what “Integrate” does in Figure 4.1.2: it
	builds heights along a spanning tree (the tree edges are automatically satisfied) and then tests each leftover edge. The mismatch on a
	leftover edge, \(\psi(e) - (f(\text{head}) - f(\text{tail}))\), is precisely the sum of \(\psi\) around that edge’s fundamental loop.
</p>
<p>
	For a graph with \(V\) vertices, \(E\) edges and \(c\) connected pieces, a spanning forest has \(V - c\) edges, so the number of
	leftover edges — the number of independent checks — is
</p>
\[ E - V + c. \]
<p>
	You have seen this number before: it is the first <Term t="betti-number">Betti number</Term> \(b_1\) of the graph, the number of
	independent holes, from <Ref to="homology/cycles-and-boundaries" />. The trail map of Figure 4.1.1 has \(9 - 7 + 1 = 3\) of them, which
	is why “Next loop” cycles through three loops.
</p>

<KeyIdea>
	<p>
		The edge labellings of a graph form a space with \(E\) dimensions (one free number per edge). The gradients form a smaller space of
		dimension \(V - c\) (one height per vertex, minus one free constant per connected piece). What is left over — the room for
		obstructions — has dimension \(E - V + c = b_1\): <strong>one independent obstruction for each independent hole.</strong> The holes
		that homology counts are exactly the places where the gradient puzzle can fail.
	</p>
</KeyIdea>

<Example title="Two junctions, three trails">
	<p>
		Two junctions \(u\) and \(w\) joined by three different trails (put a midpoint on each trail if you want a simplicial complex: then
		\(V = 5\), \(E = 6\)). There are \(6 - 5 + 1 = 2\) independent loops: trail 1 out and trail 2 back, and trail 1 out and trail 3 back.
		A labelling is a gradient exactly when the total climb along each of the three trails is the same — two conditions, two numbers that
		measure the failure. (Trail 2 against trail 3 is then automatic: it is the difference of the other two loops.)
	</p>
</Example>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="what-never-changes">What never changes: \(H^0\)</h2>

<p>
	When the puzzle has a solution, how many solutions are there? If \(\delta f = \psi\) and \(\delta g = \psi\), then subtracting,
	\(\delta (f - g) = 0\). So the question is really: which potentials \(h\) have \(\delta h = 0\) — no climb on any edge at all?
</p>
<p>
	\(\delta h = 0\) means \(h(v) - h(u) = 0\) across every edge, so neighbours have equal heights. Walking along edges, the height never
	changes, so \(h\) is constant on each connected piece of the graph. But different pieces are free to sit at different heights: nothing
	connects them, so nothing forces them to agree. Such a function is called <dfn>locally constant</dfn>.
</p>

<Figure num="4.1.3" title="Islands" hint="Drag the vertices · flatten each island">
	<PotentialPainter mode="islands" />
	{#snippet caption()}
		A graph in three pieces. An edge glows rose whenever its two ends have different heights. \(\delta f = 0\) everywhere exactly when
		each island is flat — but the three islands can sit at three independent heights. The functions with \(\delta f = 0\) form a space of
		dimension \(3\), the number of islands.
	{/snippet}
</Figure>

<p>
	The space of locally constant functions has one dimension for each connected piece: choose one height per island. It is the first
	of the cohomology groups, and it gets the name
</p>
\[ H^0(G) \;=\; \setb{h\colon V \to \R}{\delta h = 0} \;=\; \{\text{locally constant functions on } G\}, \]
<p>and its dimension is the number of connected pieces:</p>
\[ \dim H^0(G) \;=\; c \;=\; b_0. \]
<p>
	So the solutions of the gradient puzzle, when they exist, are unique up to adding a locally constant function — exactly like the
	“\(+\,C\)” you add to an antiderivative in calculus, one constant per island. Hatcher makes the same comparison: solving
	\(\delta\varphi = \psi\) is “rather like the calculus problem of finding a function having a specified derivative, with the difference
	operator \(\delta\) playing the role of differentiation.”
</p>

<Remark>
	{#snippet head()}\(H^0\) versus \(H_0\){/snippet}
	<p>
		In <Ref to="homology/homology-groups" /> you met \(H_0\), whose elements are formal sums of points, one free generator per
		component. Here \(H^0\) consists of <em>functions</em> on the components. For a finite graph both have dimension \(c\); they are dual
		to each other, the way places and measurements are. (For infinitely many components they genuinely differ, but we will never need
		that.) The superscript in \(H^0\), as opposed to the subscript in \(H_0\), is the book’s signal that arrows have been reversed.
	</p>
</Remark>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="local-and-global">Local tests, global obstructions</h2>

<p>
	So far our shapes have been graphs. Now fill in some triangles. Picture the trail map again, but where three trails enclose a small
	meadow you can walk straight across, we fill the triangle in: it is now a 2-dimensional simplex of our complex. What does a filled
	triangle say about measurements on the edges?
</p>
<p>
	If the edge numbers come from heights, then walking once around the triangle must return you to your starting height. For a triangle
	with vertices \(a, b, c\) and edges pointing \(a \to b\), \(b \to c\) and \(a \to c\), walking \(a \to b \to c \to a\) uses the
	last edge against its arrow, so the test reads
</p>
\[ \psi(ab) + \psi(bc) - \psi(ac) \;=\; 0. \]
<p>
	The left-hand side is called the <dfn>circulation</dfn> of \(\psi\) around the triangle — or, borrowing a word from vector calculus,
	its <dfn>curl</dfn>. For a gradient \(\psi = \delta f\) the curl of every filled triangle is \((f(b)-f(a)) + (f(c)-f(b)) - (f(c)-f(a)) = 0\):
	every term cancels. That is the discrete version of a fact you may remember from calculus, “the curl of a gradient is zero”.
</p>

<Figure num="4.1.4" title="The local test" hint="Tap a vertex or an edge · use ±1">
	<CurlTriangle />
	{#snippet caption()}
		One filled triangle. When the edge numbers are differences of heights, the circulation in the middle is always \(0\), however you
		change the heights. When you choose the edge numbers yourself, the circulation can be anything — and a non-zero circulation proves,
		on the spot, that no heights can produce these numbers.
	{/snippet}
</Figure>

<p>
	The curl test is <em>local</em>: it looks at only three edges at a time. That makes it cheap, and it is a genuine necessary condition.
	The question is whether it is also sufficient: if a labelling passes the curl test on every filled triangle, must it be a gradient?
</p>

<h3>When there are no holes, local is enough</h3>
<p>
	Suppose the complex is a filled-in disk, triangulated. Take any loop in it. As we saw in <Ref to="homology/cycles-and-boundaries" />, a
	loop in a disk is a <Term t="boundary">boundary</Term>: it is the boundary of the union of the triangles it encloses. Add up the curls of
	all those triangles. Every edge inside the region is shared by two of them and is walked once in each direction, so it cancels; only the
	edges on the loop survive. So the loop sum equals the sum of the curls inside it. If every curl is \(0\), every loop sum is \(0\), and
	by the gradient test \(\psi\) is a gradient. In a region without holes, passing every local test is the same as being a gradient.
</p>

<h3>When there is a hole, it is not</h3>
<p>
	Now make a hole. The complex in the next figure is a triangulated <em>annulus</em> — a ring — with an inner triangle
	\(a_0 a_1 a_2\), an outer triangle \(b_0 b_1 b_2\), and six filled triangles between them. The labelling \(\psi\) has a \(1\) on the
	three edges \(a_0 \to a_1\), \(a_0 \to b_1\) and \(b_0 \to b_1\), and \(0\) everywhere else: a little “fence” of ones running from the
	hole out to the edge.
</p>

<Figure num="4.1.5" title="Closed but not exact" hint="Tap an edge (±1) or switch to bumps · try “Smooth it out”">
	<AnnulusCochain />
	{#snippet caption()}
		Every one of the six triangle tests passes (the green ticks), yet the loop around the hole sums to \(1\), so these numbers are not
		differences of heights. Add a bump at any vertex — that is, add a gradient — and the edge numbers change, but no triangle test and no
		loop sum changes. “Smooth it out” spreads the obstruction as evenly as possible: \(\tfrac13\) on every edge around the hole,
		\(\pm\tfrac16\) on the spokes, and still exactly \(1\) once around.
	{/snippet}
</Figure>

<p>
	Check the triangle \(a_0 a_1 b_1\) by hand: its edges carry \(\psi(a_0 a_1) = 1\), \(\psi(a_1 b_1) = 0\) and
	\(\psi(a_0 b_1) = 1\), and walking around it gives \(1 + 0 - 1 = 0\). The triangle \(a_0 b_0 b_1\) gives \(0 + 1 - 1 = 0\), and the
	other four triangles see only zeros. Every local test passes. But walk around the hole along the inner triangle:
	\(\psi(a_0 a_1) + \psi(a_1 a_2) + \psi(a_2 a_0) = 1 + 0 + 0 = 1 \neq 0\). So \(\psi\) is not a gradient. The loop around the hole is a
	<Term t="cycle">cycle</Term> that is not a boundary — the very definition of a hole in <Ref to="homology/cycles-and-boundaries" /> — and
	that is why no collection of triangle tests can reach it.
</p>
<p>
	Hatcher describes this situation with two phrases that are worth memorising. The curl of \(\psi\) — in his notation \(\delta\psi\),
	which we will justify shortly — is a <em>local</em> obstruction:
</p>
<blockquote>
	We can think of \(\delta\psi\) as a local obstruction to solving \(\psi = \delta\varphi\) since it depends only on the values of \(\psi\)
	within individual 2 simplices of \(X\). … This class in \(H^1(X; G)\) is thus the global obstruction to solving \(\psi = \delta\varphi\).
</blockquote>
<p>
	The “class in \(H^1\)” is what is left of \(\psi\) once we stop caring about bumps. Adding a bump at a vertex — that is, adding the
	gradient \(\delta g\) of a function \(g\) that is \(1\) at that vertex and \(0\) elsewhere — changes the edge numbers but cannot change any
	loop sum, because the loop sum of a gradient is \(0\). For the annulus, the only thing that survives is a single number, the loop sum
	around the hole.
</p>

<Definition id="def-closed-exact" title="Closed and exact">
	<p>
		An edge labelling \(\psi\) on a simplicial complex is <dfn>closed</dfn> if its curl is \(0\) on every filled triangle — it passes every
		local test. It is <dfn>exact</dfn> if it is a gradient, \(\psi = \delta f\). Every exact labelling is closed. The annulus shows that a
		closed labelling need not be exact, and the difference between “closed” and “exact” is what cohomology measures.
	</p>
</Definition>

<Warning>
	<p>
		The word “closed” is badly overloaded. A <em>closed</em> labelling (curl-free) has nothing to do with a <em>closed</em> loop (one that
		ends where it starts), a <em>closed</em> set in topology, or a <em>closed</em> surface (compact, no boundary). Mathematicians reuse
		good words shamelessly; the context always tells you which one is meant.
	</p>
</Warning>

<Intuition title="The same story in calculus">
	<p>
		A vector field in the plane is a little arrow at every point. It is a <em>gradient</em> (conservative) if it is the slope field of some
		height function, and it is <em>curl-free</em> if it has no infinitesimal swirl anywhere. Every gradient is curl-free. In a region
		without holes the converse holds; in the plane with a point removed it fails — the classic example swirls around the missing point,
		has curl \(0\) everywhere, and yet its integral around the puncture is \(2\pi\). Hatcher again: “The local obstruction here is the
		vanishing of the curl of the vector field, and the global obstruction is the vanishing of all line integrals around closed loops in
		the domain of the vector field.” Our annulus is the triangulated, whole-number version of that vortex; the smooth version is the star
		of <Ref to="cohomology/de-rham" />.
	</p>
</Intuition>

<Question>
	<p>
		In Figure 4.1.5, switch to “Add a bump at a vertex” and tap \(a_1\) a few times. The fence of ones moves and bends — can you make it run
		from the hole to the outside along a different route? Can you make it disappear altogether?
	</p>
</Question>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="impossible-figures">Impossible staircases and other paradoxes</h2>

<p>
	The pattern we have found — data that is perfectly consistent everywhere you look closely, yet impossible as a whole — turns up all
	over the place once you know its shape. Here are four instances: one from art, one from geometry, one from engineering and one from
	finance.
</p>

<h3>The staircase that climbs forever</h3>
<p>
	The <em>Penrose staircase</em> is a flight of stairs that goes around the four sides of a square courtyard, climbing at every step, and
	arrives back where it started. Look at any short stretch and it is an ordinary staircase; look at the whole and it is impossible. It
	comes from the work of the geneticist Lionel Penrose and his son, the mathematician Roger Penrose, on “impossible objects” in the late
	1950s, and M. C. Escher made it famous with his 1960 lithograph <em>Ascending and Descending</em>, in which a column of monks trudges
	around it for ever.
</p>
<p>
	In our language the staircase is an edge labelling. Make a graph with one vertex per step and one edge from each step to the next; the
	edges form a single loop. “Each step goes up by one” labels every edge \(+1\). If the staircase could exist, there would be a height
	function on the steps with these differences — but the loop sum is the number of steps, not \(0\), so by the gradient test no height
	function exists. The staircase is the “loop that does not close” from Figure 4.1.2, drawn by an artist.
</p>

<Figure num="4.1.6" title="Possible after all — from one direction" hint="Drag to turn · use the button to find the trick">
	<ImpossibleObjects />
	{#snippet caption()}
		These are real three-dimensional objects, seen through a camera without perspective. From one special direction the top of the
		staircase hides exactly in front of its bottom, so the walker seems to climb for ever; turn the object and the trick is revealed — the
		real staircase is a spiral with a cliff. The colours, which follow the true heights, must jump somewhere: that is where the cliff is.
		The tribar is built the same way.
	{/snippet}
</Figure>

<p>
	The real object in Figure 4.1.6 does have a height function: step \(i\) sits at height \(i\). Its differences are \(+1\) on every edge
	except the one that closes the loop, where it drops by \(N - 1\) — the cliff, hidden behind the camera angle. Compare that with the
	impossible labelling \(\psi\) that is \(+1\) everywhere: the two differ only on the cliff edge, by exactly \(N\), the loop sum. You may
	put the cliff wherever you like (that is adding a bump, changing \(f\)), but you cannot get rid of it, because the loop sum \(N\) does not
	change. The cliff is the obstruction, made of stone.
</p>

<h3>The tribar</h3>
<p>
	The <em>Penrose triangle</em>, or tribar, is three square beams joined at right angles into a triangle. Each corner is a perfectly good
	right-angled joint; the three together are impossible. (The Swedish artist Oscar Reutersvärd had drawn an impossible triangle made of
	cubes as early as 1934; Lionel and Roger Penrose published theirs in 1958.) In 1991 Roger Penrose wrote a short paper titled
	<em>On the cohomology of impossible figures</em>, explaining the tribar in exactly our terms. Cut the drawing into three overlapping
	pieces, each of which can be built. A drawing fixes each piece only up to its distance from your eye, so on each overlap the two pieces
	must be rescaled to match, by some positive factor. The figure can be built exactly when these factors come from one scale per piece —
	when they are “differences” — and that happens exactly when their product around the triangle is \(1\). For the tribar it is not.
	This is our gradient test again, with one change: the numbers on the edges are <em>multiplied</em> around the loop instead of added,
	because scale factors combine by multiplication. We will meet Penrose’s argument properly in <Ref to="cohomology/sheaves" />.
</p>

<History title="The paradox and the theory">
	<p>
		Escher learned of the Penroses’ impossible objects soon after their 1958 paper, and turned the staircase into
		<em>Ascending and Descending</em> (1960) and the tribar into the endless aqueduct of <em>Waterfall</em> (1961). It took more than thirty
		years for Roger Penrose to say out loud that the impossibility was a cohomology class. Today applied
		topologists build whole galleries of such figures; Ghrist and Cooperband’s phrase for the common principle is “the obstruction to
		globalizing locally consistent geometric relationships.”
	</p>
</History>

<h3>A ring of gears</h3>
<p>
	Arrange \(n\) identical gears in a ring, each meshing with its two neighbours. When two gears mesh, they turn in opposite directions.
	Lewis Ghrist and Robert Ghrist describe what happens:
	“If \(n\) is even, alternating spins around the loop satisfies all opposition constraints, and the system spins freely. If \(n\) is odd,
	no such alternation exists – the final gear must simultaneously agree and oppose its neighbor. The system locks: a mechanical paradox
	that we will identify as a nontrivial \(H^1\) class.”
</p>
<p>
	Let us identify it. Record the spin of each gear as an element of \(\Z/2 = \set{0, 1}\) — the integers mod 2, also written \(\mathbb F_2\) —
	with \(0\) for clockwise and \(1\) for anticlockwise. Each mesh says “the spins differ”, which in \(\Z/2\) reads
	\(s(v) - s(u) = 1\). So the meshes put the label \(1\) on every edge of the ring, and the gears can turn exactly when this labelling is a
	gradient: when it comes from spins on the gears. Around the ring the labels add up to \(n\), and in \(\Z/2\) that is \(0\) exactly when
	\(n\) is even.
</p>

<Figure num="4.1.7" title="A ring of gears" hint="Change the number of gears · follow the spins">
	<GearRing />
	{#snippet caption()}
		Every mesh carries the label \(1\) in \(\Z/2\): “turn the other way”. With an even number of gears the labels add up to \(0\) around
		the ring and the spins alternate consistently; with an odd number they add up to \(1\), the last mesh contradicts the first gear, and
		the ring locks. Locally every pair of gears is fine.
	{/snippet}
</Figure>

<p>
	Nothing in the gradient test used the fact that our numbers were real numbers; all we needed was to be able to add and subtract. So
	measurements may take values in any <Term t="abelian-group">abelian group</Term>: heights in \(\R\), counts in \(\Z\), spins in
	\(\Z/2\), scale factors in the positive real numbers under multiplication. The choice is called the <em>coefficients</em>, and changing
	it changes what the obstruction can see. Over \(\Z/2\), a loop of length \(n\) is impossible only when \(n\) is odd.
</p>

<h3>Free money</h3>
<p>
	Our last example is about currencies. Suppose dollars, euros, pounds and yen trade only around a square: dollars for euros, euros for
	pounds, pounds for yen, yen for dollars. Each edge carries an exchange rate \(r\), meaning one unit of the first currency buys \(r\) units
	of the second. Start with \$1000 and go once around. If you come back with more than \$1000, you have found an <dfn>arbitrage</dfn>: free
	money, from nothing but the rates.
</p>

<Figure num="4.1.8" title="An arbitrage loop" hint="Slide the pound–yen rate · open a euro–yen market">
	<Arbitrage />
	{#snippet caption()}
		Exchange rates multiply around a loop; their logarithms add. At £1 = ¥200 the loop is fair and the log loop sum is \(0\); at any other
		rate you can make money by going around. Open a direct euro–yen market and the square gets two filled triangles: now the arbitrage
		shows up inside a single triangle, where any trader checking three currencies at a time would spot it.
	{/snippet}
</Figure>

<p>
	Rates multiply around a loop, but logarithms turn multiplication into addition (\(\ln(xy) = \ln x + \ln y\)), so label each edge with
	\(\psi(e) = \ln r(e)\) instead. A market is <em>fair</em> if every currency has a “value” \(V\) (in some common unit) and every rate is the
	ratio of values, \(r(u \to v) = V(u)/V(v)\). Taking logarithms, \(\psi(u \to v) = \ln V(u) - \ln V(v)\): the log-rates are exactly the
	differences of the potential \(-\ln V\). So <em>fair market = gradient</em>, and the gradient test says: a market is fair if and only if
	no loop of trades makes money. In Figure 4.1.8 the log loop sum is \(\ln(r/200)\), zero only at the fair rate \(r = 200\).
</p>
<p>
	A trader who checks every three-currency triangle is running the local curl test. If all six pairs of currencies trade, every triangle is
	filled, the complex has no holes, and the local test is enough: no triangular arbitrage means no arbitrage at all. But in our square
	market there are no triangles to check, so a perfectly real arbitrage hides from every local inspection. Arbitrage can only hide in the
	holes.
</p>

<KeyIdea title="The universal pattern">
	<p>
		Staircases, tribars, gears and markets all share one shape. There is <strong>local data</strong> (a step height, a scale factor, a
		spin flip, an exchange rate) on the pieces of a space. There are <strong>local consistency checks</strong>, which the data passes. And
		there is a <strong>global obstruction</strong>: a quantity that adds up around a loop, cannot be detected by any local check, and
		prevents the local data from coming from a single global potential. That obstruction is a cohomology class.
	</p>
</KeyIdea>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="the-coboundary">The coboundary operator</h2>

<p>
	It is time to give our objects their proper names. Nothing new will happen mathematically; we will simply notice that the two
	operations of this chapter — “differences of heights” and “circulation around a triangle” — are one operation, and that it is the
	mirror image of the boundary operator of Part III.
</p>

<Definition id="def-cochains" title="Cochains">
	<p>
		Let \(K\) be a simplicial complex, with its simplices oriented as in <Ref to="homology/chains" /> (vertices listed in increasing
		order). A <dfn>\(k\)-cochain</dfn> on \(K\) is a function that assigns a number to every \(k\)-simplex. We write \(C^k(K)\) for the set of
		all \(k\)-cochains. So a \(0\)-cochain is a potential (numbers on vertices), a \(1\)-cochain is an edge labelling, and a \(2\)-cochain is
		a number on every triangle. A cochain is extended to chains by adding up: if \(c = \sum_i c_i \sigma_i\), then
		\(\varphi(c) = \sum_i c_i\, \varphi(\sigma_i)\). We also write this as \(\ip{\varphi}{c}\) and call it the <dfn>pairing</dfn> of the
		cochain \(\varphi\) (the Greek letter <em>phi</em>) with the chain \(c\).
	</p>
</Definition>

<p>
	Now look again at our two operations, side by side with the boundary formulas of <Ref to="homology/chains" />:
</p>
\[ \partial[u, v] = v - u, \qquad (\delta f)([u, v]) = f(v) - f(u) = f(\partial[u,v]), \]
\[ \partial[a, b, c] = [b, c] - [a, c] + [a, b], \qquad (\delta \psi)([a, b, c]) = \psi([b,c]) - \psi([a,c]) + \psi([a,b]) = \psi(\partial[a,b,c]). \]
<p>
	In both cases the new cochain is computed by <em>evaluating the old cochain on the boundary</em>. That is the definition in every degree.
</p>

<Definition id="def-coboundary" title="The coboundary operator">
	<p>
		The <dfn>coboundary</dfn> of a \(k\)-cochain \(\varphi\) is the \((k+1)\)-cochain \(\delta\varphi\) defined on each \((k+1)\)-simplex
		\(\sigma\) by
	</p>
	\[ (\delta\varphi)(\sigma) \;=\; \varphi(\partial\sigma). \]
	<p>
		Read: “delta phi of sigma equals phi of the boundary of sigma.” In degree \(0\), \(\delta\) is the discrete gradient; in degree \(1\) it
		is the discrete curl. (Some books put an extra sign \((-1)^{k+1}\) in front; we never do. The groups we will compute come out the same
		either way.)
	</p>
</Definition>

<Notation>
	<p>
		When we need to say which degree \(\delta\) starts from, we write \(\delta_k\colon C^k(K) \to C^{k+1}(K)\). Notice that \(\delta\)
		<em>raises</em> the degree by one, while \(\partial_k\colon C_k \to C_{k-1}\) lowers it: a \(k\)-cochain eats \(k\)-simplices, so its
		coboundary must eat \((k+1)\)-simplices, which it does by tasting their boundaries.
	</p>
</Notation>

<h3>The discrete Stokes theorem</h3>
<p>
	Since \((\delta\varphi)(\sigma) = \varphi(\partial\sigma)\) for each simplex, adding up over a chain gives the same identity for every chain
	\(c\):
</p>
\[ \ip{\delta\varphi}{c} \;=\; \ip{\varphi}{\partial c}. \]
<p>
	In words: <em>measuring the change of \(\varphi\) over a region is the same as measuring \(\varphi\) on the region’s edge.</em> In degree
	\(0\) this is telescoping: \(\ip{\delta f}{\text{path}} = f(\text{end}) - f(\text{start})\), because the boundary of a path is its end
	minus its start. In degree \(1\) it is the argument we used for the disk: the sum of the curls over a region equals the loop sum around
	its boundary. In calculus the same statement is called Stokes’ theorem, and it is no accident that it holds here by definition: the
	coboundary is <em>defined</em> to make Stokes’ theorem true.
</p>

<h3>The coboundary of a coboundary is zero</h3>
<p>
	We saw that the curl of a gradient vanishes. Here is the one-line reason, valid in every degree:
</p>
\[ (\delta\delta\varphi)(\sigma) \;=\; (\delta\varphi)(\partial\sigma) \;=\; \varphi(\partial\partial\sigma) \;=\; \varphi(0) \;=\; 0, \]
<p>
	using the fundamental fact \(\partial\partial = 0\) from <Ref to="homology/chains" />. So \(\delta \circ \delta = 0\): “the curl of a
	gradient is zero” is the shadow, in the world of measurements, of “the boundary of a boundary is zero” in the world of places.
</p>

<h3>A matrix picture: \(\delta\) is a transpose</h3>
<p>
	Take the hollow triangle with vertices \(0, 1, 2\) and edges \([0,1], [0,2], [1,2]\). The boundary matrix \(\partial_1\) from
	<Ref to="homology/chains" /> has a row for each vertex and a column for each edge, and the column of an edge lists its boundary. The
	coboundary \(\delta_0\) has a row for each edge and a column for each vertex, and the row of an edge lists how \(\delta f\) on that edge
	depends on the heights:
</p>
\[
\partial_1 = \begin{pmatrix} -1 & -1 & 0 \\ 1 & 0 & -1 \\ 0 & 1 & 1 \end{pmatrix}, \qquad
\delta_0 = \begin{pmatrix} -1 & 1 & 0 \\ -1 & 0 & 1 \\ 0 & -1 & 1 \end{pmatrix} = \partial_1^{\mathsf T}.
\]
<p>
	The second matrix is the first one flipped across its diagonal — its <Term t="transpose">transpose</Term>, from
	<Ref to="foundations/linear-algebra" />. That is not a coincidence of this example: the entry of \(\partial\) in row \(v\), column
	\(e\) is the coefficient of \(v\) in \(\partial e\), and the entry of \(\delta\) in row \(e\), column \(v\) is the change in \(\delta f\) on
	\(e\) when \(f\) is \(1\) at \(v\) and \(0\) elsewhere — which is the same coefficient. In every degree, \(\delta_k = \partial_{k+1}^{\mathsf T}\).
	Keenan Crane, comparing the two theories in his notes on discrete geometry, sums it up: “the only difference is a matrix transpose!”
	We will make full use of this in <Ref to="cohomology/cohomology-groups" />.
</p>

<Figure num="4.1.9" title="The mirror">
	<MirrorDiagram />
	{#snippet caption()}
		Chains (places) and cochains (measurements) sit in the same three columns. The boundary maps \(\partial\) lower the dimension; the
		coboundary maps \(\delta\) raise it, and each \(\delta\) is the transpose of the \(\partial\) next to it. The pairing joins each column,
		and Stokes’ formula \(\ip{\delta\varphi}{c} = \ip{\varphi}{\partial c}\) ties the two rows together.
	{/snippet}
</Figure>

<h3>The new vocabulary</h3>
<p>
	Everything we have discovered now has a name, built by putting “co-” in front of a word from homology. (The prefix means “dual”; the
	names are due to Hassler Whitney in the late 1930s, as we will see in the next chapter.)
</p>

<Definition id="def-cocycles" title="Cocycles and coboundaries">
	<p>
		A cochain \(\varphi\) is a <dfn>cocycle</dfn> (or <em>closed</em>) if \(\delta\varphi = 0\). It is a <dfn>coboundary</dfn> (or
		<em>exact</em>) if \(\varphi = \delta g\) for some cochain \(g\) one degree lower. Because \(\delta\delta = 0\), every coboundary is a
		cocycle.
	</p>
</Definition>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Homology: places</th><th>Cohomology: measurements</th><th>In this chapter</th></tr>
		</thead>
		<tbody>
			<tr><td>chain \(c \in C_k\)</td><td>cochain \(\varphi \in C^k\)</td><td>heights, edge labellings</td></tr>
			<tr><td>boundary operator \(\partial\) (lowers degree)</td><td>coboundary operator \(\delta\) (raises degree)</td><td>gradient, curl</td></tr>
			<tr><td>cycle: \(\partial c = 0\)</td><td>cocycle: \(\delta\varphi = 0\)</td><td>passes every local test</td></tr>
			<tr><td>boundary: \(c = \partial b\)</td><td>coboundary: \(\varphi = \delta g\)</td><td>comes from a potential</td></tr>
			<tr><td>\(\partial\partial = 0\)</td><td>\(\delta\delta = 0\)</td><td>curl of a gradient is zero</td></tr>
			<tr><td>\(H_k\) = cycles / boundaries</td><td>\(H^k\) = cocycles / coboundaries</td><td>the global obstructions</td></tr>
		</tbody>
	</table>
</div>

<p>
	The last row is a preview. In the language of <Ref to="foundations/abelian-groups" />, the cocycles form a group, the coboundaries form a
	subgroup inside it, and the <em>cohomology group</em> \(H^k(K)\) is the <Term t="quotient-group">quotient</Term>: cocycles, with two of
	them counted as the same when they differ by a coboundary. That is exactly the move we made when we decided that “adding a bump”
	should not count as a change. For the annulus, the cocycles modulo coboundaries form a single copy of \(\R\) (or \(\Z\), with
	whole-number labels), and the number that identifies a class is its loop sum around the hole. Lek-Heng Lim calls the general recipe —
	two matrices \(A\) and \(B\) with \(AB = 0\), and the quotient \(\ker A / \im B\) — “cohomology on a bumper sticker”. The precise
	definitions, and many computations, are the subject of <Ref to="cohomology/cohomology-groups" />.
</p>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="hodge-decomposition">Gradient, curl and harmonic: the Hodge decomposition</h2>

<p>
	Real data is never exactly a gradient. Suppose sports teams play each other and each match produces a number on an edge — how many
	points the winner won by. If there were a “true strength” for each team, the margins would be differences of strengths, a gradient.
	In practice the data is noisy and inconsistent: A beats B, B beats C, and C beats A. What is the best we can do?
</p>
<p>
	The answer is one of the most beautiful facts in the subject. Every edge labelling \(X\) (call it a <em>flow</em> when you think of the
	numbers as amounts flowing along the arrows) splits in exactly one way into three pieces,
</p>
\[ X \;=\; \underbrace{\delta f}_{\text{gradient}} \;+\; \underbrace{X_{\text{curl}}}_{\text{swirls around filled triangles}} \;+\; \underbrace{X_{\text{harm}}}_{\text{circulation around the holes}}, \]
<p>
	and the three pieces are perpendicular to each other, in the sense that \(\sum_e a(e) b(e) = 0\) for any two of them. This is the
	discrete <dfn>Hodge decomposition</dfn>, named after W. V. D. Hodge, who developed its smooth version, for differential forms, in the
	1930s.
</p>

<Figure num="4.1.10" title="Taking a flow apart" hint="Choose a flow · tap an edge in the first panel and use ±1">
	<HodgeDecomposer />
	{#snippet caption()}
		The upper triangle \(1, 2, 3\) is filled; the lower triangle \(1, 3, 4\) is a hole. Any flow (gold) is the sum of a gradient (teal:
		differences of the heights on the vertices), a curl part (violet: a pure swirl around the filled triangle) and a harmonic part (rose:
		a balanced circulation around the hole). The energies add like Pythagoras: for the example, \(35 = 8 + 3 + 24\).
	{/snippet}
</Figure>

<p>Look at the example in Figure 4.1.10, the flow \(X = (3, 3, 3, 2, -2)\) on the edges \(1\to2,\ 2\to3,\ 1\to3,\ 3\to4,\ 1\to4\).</p>
<ul>
	<li>
		The <strong>gradient part</strong> \(\delta f = (1, 1, 2, -1, 1)\) comes from the heights \(f = (0, 1, 2, 1)\) on vertices \(1, 2, 3, 4\).
		It is the gradient closest to \(X\) — the one that minimises the total squared error, the “least squares” fit. Read as a ranking, it
		says \(3 > 2 = 4 > 1\).
	</li>
	<li>
		The <strong>curl part</strong> \((1, 1, -1, 0, 0)\) is one unit of swirl around the filled triangle: \(+1\) along \(1 \to 2\) and
		\(2 \to 3\), and \(-1\) along \(1 \to 3\), so it goes once around \(1 \to 2 \to 3 \to 1\). It lives entirely on triangles that are
		filled, and it is what the local curl test detects.
	</li>
	<li>
		The <strong>harmonic part</strong> \((1, 1, 2, 3, -3)\) is what is left. It passes every local test (its curl on the filled triangle
		is \(1 + 1 - 2 = 0\)), and it is balanced: at every vertex, what flows in equals what flows out. Yet its sum around the hole is
		\(2 + 3 + 3 = 8\). It is the global obstruction, standing on its own.
	</li>
</ul>
<p>
	Check the energies: \(3^2+3^2+3^2+2^2+2^2 = 35\), while the parts have \(8\), \(3\) and \(24\), and \(8 + 3 + 24 = 35\). Because the
	pieces are perpendicular, their squared lengths add, just as for the sides of a right-angled triangle.
</p>
<p>
	This is not a toy. In 2011 Xiaoye Jiang, Lek-Heng Lim, Yuan Yao and Yinyu Ye proposed <em>HodgeRank</em>, which ranks items from
	pairwise comparisons — teams from match results, films from viewers’ preferences — in exactly this way: the gradient part is the
	ranking, the curl part records local three-way inconsistencies, and the harmonic part records inconsistencies that are, in their
	words, “globally cyclic but locally acyclic”. Those are the ones no amount of local checking will find.
</p>

<KeyIdea title="The harmonic part is the obstruction">
	<p>
		If \(X\) is closed (it passes every local test), its curl part is zero, and \(X = \delta f + X_{\text{harm}}\). The harmonic part is then
		a canonical representative of the obstruction: the unique labelling, among all \(X + \delta g\), that is spread out as evenly as
		possible. In the annulus of Figure 4.1.5 it is \(\tfrac13\) on every edge around the hole and \(\pm\tfrac16\) on the spokes — the jump of
		\(1\) shared out evenly around the ring. The harmonic labellings form a space whose dimension is the number of independent holes.
	</p>
</KeyIdea>

<Remark title="Where this continues">
	<p>
		The smooth version — every closed differential form has a unique harmonic representative — is Hodge’s theorem, which we meet again in
		<Ref to="cohomology/de-rham" /> and <Ref to="big-picture/horizons" />. The discrete version you have just used is pure linear algebra:
		it is what you get by solving two least-squares problems with the matrices \(\delta_0\) and \(\delta_1\).
	</p>
</Remark>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Climbs from heights">
	<p>
		A graph has vertices \(A, B, C, D\) with heights \(f(A) = 2\), \(f(B) = 5\), \(f(C) = 4\), \(f(D) = 9\), and edges
		\(A \to B\), \(B \to C\), \(C \to D\), \(A \to D\), \(B \to D\). Compute \(\delta f\) on every edge. Then check that the climbs add up to
		zero around the loop \(A \to B \to D \to A\). What is \((\delta f)(D \to B)\) if the arrow on the edge between \(B\) and \(D\) is reversed?
	</p>
	{#snippet hint()}
		<p>Head minus tail. A walk that uses an edge against its arrow subtracts the edge’s number.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			\((\delta f)(A\to B) = 5 - 2 = 3\), \((\delta f)(B \to C) = 4 - 5 = -1\), \((\delta f)(C \to D) = 9 - 4 = 5\),
			\((\delta f)(A \to D) = 9 - 2 = 7\), \((\delta f)(B \to D) = 9 - 5 = 4\). Around \(A \to B \to D \to A\): \(3 + 4 - 7 = 0\), using the
			edge \(A \to D\) backwards. With the arrow reversed, \((\delta f)(D \to B) = f(B) - f(D) = -4\): the same trail, the opposite sign.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Is it a gradient?">
	<p>
		The square with vertices \(P, Q, R, S\) has edges \(P \to Q\), \(Q \to R\), \(S \to R\), \(P \to S\) labelled \(4\), \(-1\), \(2\), \(1\).
		Is this labelling a gradient? If so, find the potential with \(f(P) = 0\). Then change the label on \(S \to R\) to \(3\) and answer again.
	</p>
	{#snippet hint()}
		<p>There is one loop. Walk \(P \to Q \to R \to S \to P\) and keep track of which edges you use backwards.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Around \(P \to Q \to R \to S \to P\): \(\psi(PQ) + \psi(QR) - \psi(SR) - \psi(PS) = 4 - 1 - 2 - 1 = 0\), so by the gradient test it
			is a gradient. Integrating from \(P\): \(f(P) = 0\), \(f(Q) = 4\), \(f(R) = 3\), \(f(S) = 1\), and as a check \(f(R) - f(S) = 2 = \psi(SR)\). With
			\(\psi(SR) = 3\) the loop sum becomes \(4 - 1 - 3 - 1 = -1 \neq 0\), so no potential exists: that loop sum is the certificate.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Counting gradients and obstructions">
	<p>
		A connected graph has \(V = 6\) vertices and \(E = 9\) edges. (a) What is the dimension of the space of all real edge labellings? (b) Of
		the space of gradients? (c) How many independent loop sums must vanish for a labelling to be a gradient? (d) The same questions if the
		graph instead falls into two pieces, still with \(V = 6\) and \(E = 9\).
	</p>
	{#snippet solution()}
		<p>
			(a) \(9\): one free number per edge. (b) \(V - c = 6 - 1 = 5\): six heights, but adding the same constant to all of them changes
			nothing. (c) \(E - V + c = 9 - 6 + 1 = 4\), and indeed \(5 + 4 = 9\). (d) With \(c = 2\): gradients have dimension \(6 - 2 = 4\)
			(one free constant per piece), and \(9 - 6 + 2 = 5\) loop sums must vanish; again \(4 + 5 = 9\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Bumps never change loop sums">
	<p>
		On the annulus of Figure 4.1.5, let \(g\) be the potential that is \(1\) at \(a_1\) and \(0\) at the other five vertices. The vertex
		\(a_1\) lies on four edges. Write down \(\delta g\) on each of them. Add \(\delta g\) to \(\psi\) and recompute the sum around the inner
		loop \(a_0 \to a_1 \to a_2 \to a_0\). Then explain, without computing, why adding \(\delta g\) can never change the sum of a labelling
		around any loop, on any complex.
	</p>
	{#snippet solution()}
		<p>
			The four edges at \(a_1\) are \(a_0 \to a_1\), where \(a_1\) is the head, so \(\delta g = 1 - 0 = +1\); and \(a_1 \to a_2\), the rung
			\(a_1 \to b_1\) and the diagonal \(a_1 \to b_2\), where \(a_1\) is the tail, so \(\delta g = 0 - 1 = -1\). On every other edge
			\(\delta g = 0\). The new inner loop sum is \((1 + 1) + (0 - 1) + (0 + 0) = 1\), unchanged. In general, the sum of \(\delta g\)
			around a closed loop telescopes to \(g(v_0) - g(v_0) = 0\), so the loop sums of \(\psi + \delta g\) equal those of \(\psi\). In the
			language of the coboundary section: \(\ip{\delta g}{z} = \ip{g}{\partial z} = 0\) for every cycle \(z\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Which gear trains can turn?">
	<p>
		Gears are placed at the vertices of a graph, and two gears mesh when they are joined by an edge. Which of these can turn? (a) Four
		gears at the corners of a square, each meshing with its two neighbours. (b) The same four gears, with one diagonal pair also meshing.
		(c) A \(3 \times 3\) grid of gears, each meshing with the gears directly left, right, above and below it. Find a general rule.
	</p>
	{#snippet hint()}
		<p>Label every edge \(1 \in \Z/2\) and look for loops with an odd number of edges.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The train turns exactly when the labelling “\(1\) on every edge” is a gradient over \(\Z/2\), i.e. when every loop has an even number
			of edges. (a) Turns: the only loop has length \(4\). (b) Locks: the diagonal creates two loops of length \(3\). (c) Turns: colour the
			grid like a chessboard and let the dark squares turn clockwise; every mesh joins a dark and a light square, so every loop is even.
			General rule: a gear train can turn if and only if its graph has no loop of odd length — such graphs are called <em>bipartite</em>.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Curl of a gradient, by hand">
	<p>
		For a filled triangle \([a, b, c]\) and any potential \(f\), compute \((\delta(\delta f))([a, b, c])\) directly from the formulas for
		\(\delta_0\) and \(\delta_1\), and show that it is \(0\). Which terms cancel against which? Explain how this cancellation is the same as
		the cancellation in \(\partial\partial[a,b,c] = 0\).
	</p>
	{#snippet solution()}
		<p>
			\((\delta\delta f)([a,b,c]) = (\delta f)([b,c]) - (\delta f)([a,c]) + (\delta f)([a,b]) = (f(c) - f(b)) - (f(c) - f(a)) + (f(b) - f(a))\).
			The two copies of \(f(c)\) cancel, as do the two of \(f(b)\) and the two of \(f(a)\): total \(0\). In \(\partial\partial[a,b,c] =
			\partial[b,c] - \partial[a,c] + \partial[a,b] = (c - b) - (c - a) + (b - a) = 0\), exactly the same vertices cancel in exactly the
			same pattern. Evaluating \(f\) on that vanishing sum is what \(\delta\delta f\) does.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="No hidden arbitrage in a complete market">
	<p>
		Four currencies, and every one of the six pairs trades, so every three-currency triangle is filled. Suppose no triangle offers an
		arbitrage (each triangle’s rates multiply to \(1\)). Prove that no loop of trades at all offers an arbitrage. Then explain why the
		square market of Figure 4.1.8, with only four trading pairs, does not have this property.
	</p>
	{#snippet hint()}
		<p>
			Work with log-rates, so “no triangular arbitrage” says the labelling is closed. Try to build the potential directly: fix the dollar at
			\(0\) and use the three edges at the dollar.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Let \(\psi = \ln r\). Set \(f(\$) = 0\) and, for each other currency \(x\), \(f(x) = \psi(\$ \to x)\) (using the direct dollar edge,
			with a minus sign if the arrow points into the dollar). Now take any edge \(x \to y\) between two non-dollar currencies. The triangle
			\(\$, x, y\) is filled and its curl is \(0\): \(\psi(\$ \to x) + \psi(x \to y) - \psi(\$ \to y) = 0\), so
			\(\psi(x \to y) = f(y) - f(x)\). Edges at the dollar are satisfied by construction. So \(\psi = \delta f\) is a gradient and, by the
			gradient test, every loop sum vanishes: no arbitrage anywhere. (Geometrically: the complex with all four triangles filled is a hollow
			tetrahedron, whose loops are all boundaries.) In the square market there are no filled triangles at all, so there is nothing for the
			curl test to check, and the loop around the square is a cycle that bounds nothing: its log-sum can be anything.
		</p>
	{/snippet}
</Exercise>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Chains are places; <strong>cochains</strong> are measurements: numbers on the \(k\)-simplices, extended to chains by adding up. The
			pairing \(\ip{\varphi}{c}\) “integrates” a measurement over a place.
		</li>
		<li>
			Heights \(f\) on vertices give climbs \((\delta f)(u \to v) = f(v) - f(u)\) on edges. Climbs telescope, so around any closed loop they
			sum to \(0\) (Kirchhoff’s voltage law).
		</li>
		<li>
			<strong>The gradient test:</strong> an edge labelling is a gradient if and only if its sum around every loop is \(0\). It suffices to
			check \(E - V + c = b_1\) fundamental loops: one independent obstruction per hole.
		</li>
		<li>\(H^0\) = functions with \(\delta f = 0\) = locally constant functions; its dimension is the number of components.</li>
		<li>
			On filled triangles the curl \(\psi(ab) + \psi(bc) - \psi(ac)\) is a <strong>local</strong> test. Without holes it is enough; around a
			hole (the annulus) a labelling can be <strong>closed but not exact</strong>, and the loop sum is the <strong>global</strong> obstruction.
		</li>
		<li>
			Impossible staircases, the tribar, odd rings of gears (\(\Z/2\) coefficients) and hidden arbitrage are all closed-but-not-exact
			labellings.
		</li>
		<li>
			The coboundary \((\delta\varphi)(\sigma) = \varphi(\partial\sigma)\) is the gradient in degree \(0\) and the curl in degree \(1\);
			\(\ip{\delta\varphi}{c} = \ip{\varphi}{\partial c}\) (discrete Stokes), \(\delta\delta = 0\), and \(\delta = \partial^{\mathsf T}\).
		</li>
		<li>
			Cocycles (\(\delta\varphi = 0\)) modulo coboundaries (\(\varphi = \delta g\)) give cohomology. Every flow splits as gradient + curl +
			harmonic; the harmonic part is the obstruction, spread out evenly.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>
<FurtherReading items={reading} />
