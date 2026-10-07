<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
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
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import CycleExplorer from '$lib/figures/homology/cycles-and-boundaries/CycleExplorer.svelte';
	import SpanningTree from '$lib/figures/homology/cycles-and-boundaries/SpanningTree.svelte';
	import FillIn from '$lib/figures/homology/cycles-and-boundaries/FillIn.svelte';
	import TorusLoops from '$lib/figures/homology/cycles-and-boundaries/TorusLoops.svelte';
	import HomologousBand from '$lib/figures/homology/cycles-and-boundaries/HomologousBand.svelte';
	import SphereVoid from '$lib/figures/homology/cycles-and-boundaries/SphereVoid.svelte';
	import HoleGallery from '$lib/figures/homology/cycles-and-boundaries/HoleGallery.svelte';
	import HolesByDimension from '$lib/figures/homology/cycles-and-boundaries/HolesByDimension.svelte';
</script>

<Epigraph author="Robert Ghrist" source="Barcodes: The Persistent Topology of Data (2008)">…a hole is a hole no matter how fragile or fine.</Epigraph>

<p class="lead">
	Ever since the first page of this book we have been promising that homology “counts holes”. It is time to make good on that promise — and the
	first thing to admit is that nobody has yet told you what a hole is. That is not an oversight. It is the whole difficulty, and the way round it is the
	idea on which this entire part of the book rests.
</p>

<p>
	A hole is a strange kind of object: it is made of nothing. You cannot pick one up or weigh it. You know it is there only because of what surrounds it. So
	instead of pointing at holes, we will look at the <em>loops</em> that go around them, and ask one question of every loop: <em>is it the edge of
		something?</em> Draw a loop in pencil on a sheet of paper, and it is the edge of the patch of paper inside it. Now draw a loop on a flat metal washer,
	running once around the middle. The patch it ought to enclose has a piece missing — the hole itself — so the loop is the edge of no piece of the washer. A
	loop that is the edge of nothing is our witness that a hole is there.
</p>

<Ahead>
	<p>
		This chapter builds the central picture of homology with nothing but drawings and counting: <strong>cycles</strong> (closed loops),
		<strong>boundaries</strong> (loops that are the edge of something filled in), and <strong>holes</strong> (cycles that are not boundaries). The next two
		chapters turn the picture into algebra. <Ref to="homology/chains" /> makes “the edge of” into a precise operation, the boundary operator
		\(\partial\); <Ref to="homology/homology-groups" /> defines the homology groups \(H_k\), which count holes exactly. Every definition there is a careful
		restatement of something you will see and play with here — so time spent on these pictures is time saved later.
	</p>
</Ahead>

<h2 id="what-is-a-hole">What is a hole, really?</h2>

<p>
	Back in <Ref to="prelude/shape-of-a-question" /> we asked a question that sounds childish and is not: how many holes does a drinking straw have? In 2021
	the mathematician David Richeson opened an article in <em>Quanta Magazine</em> with it, alongside two other famous argument-starters: is Pluto a planet,
	and is a hot dog a sandwich? The first two, he noted, have people arguing yes or no. The straw question is worse: it produces confident answers of two,
	one, and even zero. Now we are ready to settle it.
</p>

<p>Each answer has a reasonable story behind it.</p>
<ul>
	<li>
		<strong>Zero.</strong> Roll up a rectangle of paper and tape it: you have made a straw without punching anything. A hole, on this view, is something you
		cut out of a solid object, and nothing was cut.
	</li>
	<li><strong>Two.</strong> Look at the straw: there is an opening at the top and an opening at the bottom.</li>
	<li>
		<strong>One.</strong> There is one tunnel. The top and the bottom are two ends of the <em>same</em> hole, just as a road tunnel has two entrances but is
		one tunnel.
	</li>
</ul>

<p>
	Nobody here is confused about the straw. They are disagreeing about the <em>word</em>. Everyday English uses “hole” for several different things: a dent
	(the inside of a cup), a tunnel (through a bead), an opening (the neck of a shirt), a puncture (in a tyre), a cavity (a bubble in bread). A word that
	means five things cannot be counted.
</p>

<p>
	Topologists side with the “one” camp, and they have a way to make the answer precise. Bernhard Riemann, in the 1850s, counted holes by <em>cutting</em>:
	how many cuts can you make, each running from an edge to an edge, without the object falling into two pieces? <Cite k="riemann1857" /> Slit a straw from
	end to end and it opens into a flat sheet, still in one piece; any second cut across the sheet splits it. One cut, so one hole. Richeson’s article puts the
	payoff memorably:
</p>

<blockquote>
	“If you want a mathematical justification that a T-shirt and a pair of pants are different, you should turn to a topologist, not a geometer. The
	explanation: They have different numbers of holes.” <Cite k="richeson2021" />
</blockquote>

<p>
	By the end of this chapter you will be able to say how many each has — three for the shirt, two for the trousers — and, more interestingly, why the
	shirt’s <em>four</em> openings make only three holes (Figure 3.1.8 lets you check).
</p>

<KeyIdea>
	<p>
		“Hole” is the word we want to explain; “loop” and “edge of” are words we can make exact. So we will never point at a hole. We will point at
		<strong>loops</strong> — and, in higher dimensions, at closed surfaces — and ask of each one whether it is the edge of something. The holes will reveal
		themselves as the loops that are the edge of nothing.
	</p>
</KeyIdea>

<p>
	To make “is it the edge of something?” into a question with a definite answer, we need shapes made of definite pieces. So we start where everything is as
	simple as possible: with graphs, which are shapes built from dots and lines and nothing else.
</p>

<h2 id="loops-in-a-graph">Loops in a graph</h2>

<p>
	A <dfn>graph</dfn> is a collection of dots, called <dfn>vertices</dfn>, together with lines, called <dfn>edges</dfn>, each joining two different vertices.
	In the language of <Ref to="topology/simplicial-complexes" />, a graph is a
	<Term t="simplicial-complex">simplicial complex</Term> with only vertices and edges: no triangles, nothing filled in. The graph we will play with is a little
	bow-tie with an arch on top, with eight vertices \(a, b, \dots, h\) and twelve edges. We name an edge by its two ends, so \(bc\) is the edge joining \(b\) and
	\(c\).
</p>

<p>
	A <dfn>closed walk</dfn> is what you would get by putting a pencil on a vertex, moving along edges, and stopping back where you started — for instance \(a
	\to b \to c \to a\), which runs around the left triangle. Closed walks are the obvious candidates for “loops”. But a walk carries baggage we do not want:
	a starting point, a direction, and the freedom to wander back and forth along the same edge. The walks \(a \to b \to c \to a\) and \(b \to c \to a \to b\)
	trace exactly the same loop, starting at different places. Allen Hatcher’s textbook describes what happens when you stop caring about where a loop starts:
	“Thus loops become cycles, without a chosen basepoint.” <Cite k="hatcher2002" loc="p. 99" />
</p>

<p>
	So let us throw away the baggage and remember only <em>which edges a loop uses</em>. In this chapter we will even forget how many times an edge is used and
	in which direction — we record each edge as merely <em>in</em> or <em>out</em>. That is a deliberate simplification (the box “What counting mod 2 forgets”,
	further on, is honest about what it costs), and it turns out to be exactly enough to count holes.
</p>

<h3>The parity test</h3>

<p>
	Here is the key observation. Follow a closed walk that never reuses an edge, and watch any one vertex \(v\). Every time the walk arrives at \(v\) along one
	edge, it leaves along another. Arrivals and departures come in pairs, so the walk uses an <em>even</em> number of the edges at \(v\): zero if it never
	visits, two if it passes through once, four if it passes through twice, and so on. The starting vertex is no exception — the first departure pairs up
	with the final arrival.
</p>

<Definition id="def-cycle" title="Degree, and cycles in a graph">
	<p>
		Let \(S\) be a set of edges of a graph. The <dfn>degree</dfn> of a vertex \(v\) in \(S\) is the number of edges of \(S\) that touch \(v\). A vertex of odd
		degree is a <dfn>loose end</dfn> of \(S\).
	</p>
	<p>
		A set of edges \(S\) is a <dfn>cycle</dfn> (more fully, a <em>1-cycle with coefficients mod 2</em>) if it has no loose ends: every vertex has even degree
		in \(S\).
	</p>
</Definition>

<p>
	Notice what this definition does <em>not</em> say. It does not ask for a walk, a starting point or a direction. It is a <strong>local</strong> test — you can
	check it one vertex at a time, without ever looking at the whole loop — and yet it captures a <strong>global</strong> property, closedness. Try it.
</p>

<Figure num="3.1.1" title="The parity test" hint="Tap edges to select · add face rims">
	<CycleExplorer />
	{#snippet caption()}
		Tap edges to choose a set \(S\). Vertices of odd degree — loose ends — glow red. When nothing glows, \(S\) is a cycle. Can you find a cycle that is
		<em>not</em> a single circle? The “add a face rim” chips add the three or four edges around a face \(f_i\): watch what happens to an edge that is added
		twice.
	{/snippet}
</Figure>

<p>
	A few things you may have discovered. A single edge is not a cycle: it has two loose ends, one at each end. A path \(a \to b \to d\) has loose ends
	exactly at its two endpoints, \(a\) and \(d\) — the middle vertex \(b\) has degree 2. Close the path up with the edges \(dc\) and \(ca\) and the loose ends
	vanish. And there are cycles that are not single circles: choose the rim of the left diamond (\(ab, bd, dc, ca\)) and the rim of the right diamond
	(\(de, eg, gf, fd\)) together. Every vertex has degree 2, except \(d\), which has degree 4 — even, so this “figure eight” passes the test.
</p>

<Question>
	<p>Is the empty set of edges a cycle?</p>
	<p>
		Yes. In the empty set every vertex has degree \(0\), which is even. It is a perfectly good cycle — the <em>zero cycle</em> — and we will need it, just
		as arithmetic needs the number \(0\).
	</p>
</Question>

<History title="The bridges of Königsberg">
	<p>
		The parity test is older than topology. In 1736 Leonhard Euler took up a puzzle from Königsberg: could anyone take a walk through the city crossing each
		of its seven bridges exactly once? He replaced the city by four land masses joined by seven bridges and noticed that a walker who passes through a land
		mass uses two of its bridges, one in and one out. So every land mass except the start and the finish must touch an even number of bridges, and a round
		trip needs all of them even. In Königsberg the counts were \(5, 3, 3, 3\): all odd. No such walk exists, round trip or not <Cite k="euler1741" />.
		Euler’s paper is often called the first paper of graph theory, and its central idea is exactly our test for being a cycle.
	</p>
</History>

<p>
	Is the parity test too generous? Could some set of edges pass the test without being made of closed loops? No. Euler claimed, and Carl Hierholzer proved
	(in a paper published in 1873, two years after his death), that every connected set of edges in which all degrees are even can be traced as a single
	closed walk using each edge exactly once <Cite k="hierholzer1873" />; a modern proof takes half a page <Cite k="diestel2025" loc="Thm 1.8.1" />. So a
	cycle in our sense is always a union of one or more closed walks with no edge repeated. The parity definition loses nothing.
</p>

<h2 id="adding-cycles">Adding cycles: the cycle space</h2>

<p>
	Cycles can be combined. Lay two cycles \(A\) and \(B\) on top of each other. An edge used by only one of them is used once; an edge used by both is used
	twice — and since we only record whether an edge is used an odd or even number of times, an edge used twice drops out. The result is the set of edges
	that lie in <em>exactly one</em> of \(A\) and \(B\).
</p>

<Definition id="def-symmetric-difference" title="Sum of edge sets (symmetric difference)">
	<p>
		For sets of edges \(A\) and \(B\), their <dfn>sum</dfn> \(A + B\) is the set of edges that belong to exactly one of them. This is the
		<Term t="symmetric-difference">symmetric difference</Term> of the two sets, also written \(A \mathbin{\triangle} B\): exactly the addition of vectors over
		\(\Z/2\) from <Ref to="foundations/linear-algebra" hash="vectors" />, with one switch for each edge.
	</p>
</Definition>

<Example title="Two triangles make a diamond">
	<p>
		In the bow-tie, \(f_1\) is the rim of the left triangle, \(f_1 = \set{ab, bc, ca}\), and \(f_2 = \set{bc, cd, db}\) is the rim of the triangle next to it.
		They share the edge \(bc\). So
	</p>
	\[ f_1 + f_2 = \set{ab, ca, cd, db}, \]
	<p>
		the rim of the whole diamond. The shared edge cancelled. Press the chips \(+f_1\) and then \(+f_2\) in Figure 3.1.1 to watch it happen: the edge \(bc\)
		flashes and disappears.
	</p>
</Example>

<p>
	Here is the first small miracle: <strong>the sum of two cycles is always a cycle.</strong> Watch one vertex \(v\). Suppose \(v\) has degree \(\alpha\) in
	\(A\), degree \(\beta\) in \(B\), and that \(\gamma\) of these edges belong to both. In \(A + B\) the shared edges disappear from both counts, so the degree
	of \(v\) is
</p>
\[ \alpha + \beta - 2\gamma. \]
<p>
	If \(\alpha\) and \(\beta\) are even, so is this number. No loose ends are created. (Try it in the figure: add face rims in any combination — you will never
	see a red vertex.)
</p>

<p>This addition obeys the rules you learnt at school, plus one that would get you marked wrong there:</p>
<ul>
	<li>\(A + B = B + A\) and \((A + B) + C = A + (B + C)\): the order and grouping do not matter;</li>
	<li>\(A + \varnothing = A\): adding the zero cycle changes nothing;</li>
	<li>\(A + A = \varnothing\): every cycle is its own opposite, because every edge of \(A\) is used twice.</li>
</ul>

<p>
	The strange last rule is ordinary arithmetic in the two-element number system \(\Z/2 = \set{0, 1}\), where \(1 + 1 = 0\): each edge is a switch, and
	flipping a switch twice leaves it where it was. All the rules together are those of a <Term t="vector-space">vector space</Term> over \(\Z/2\) (see
	<Ref to="foundations/linear-algebra" />; \(\Z/2\) is also written \(\F_2\)). Multiplying by a “scalar” is the simplest possible operation: \(0 \cdot A =
	\varnothing\) and \(1 \cdot A = A\). So the cycles of a graph form a vector space.
</p>

<Definition id="def-cycle-space" title="The cycle space">
	<p>
		The <dfn>cycle space</dfn> of a graph is the set of all its cycles, with the addition \(A + B\) above. It is a vector space over \(\Z/2\).
	</p>
</Definition>

<p>
	Every vector space has a dimension: the size of a <em>basis</em>, a list of elements from which everything can be built by adding, with no element of the
	list buildable from the others. In the bow-tie, the five face rims \(f_1, \dots, f_5\) form a basis. Every cycle is a sum of some of them — the outer rim,
	for instance, is \(f_1 + f_2 + f_3 + f_4 + f_5\), because every inner edge lies on exactly two faces and cancels. And no sum of face rims is empty unless
	you chose none of them. So the cycle space of the bow-tie has dimension \(5\), and it contains exactly \(2^5 = 32\) cycles, the empty one included: for
	each of the five faces, include its rim or not.
</p>

<Intuition>
	<p>
		Push the switch picture further: a set of edges is a pattern of switches turned on, and adding a cycle means <em>flipping</em> its switches. The
		cycles are the patterns with no loose ends, and they are closed under flipping: flip the switches of one cycle while another cycle is showing, and what
		you see is again a cycle.
	</p>
</Intuition>

<Warning title="What counting mod 2 forgets">
	<p>
		Recording each edge as merely “in” or “out” throws information away. Going twice around a loop gives \(A + A = \varnothing\), the same as not going at
		all; and a loop cannot tell clockwise from anticlockwise. For counting holes in this chapter that loss is harmless — but it is a real loss. Some shapes
		(the Klein bottle, the projective plane) have a kind of twisting that only shows up when you remember directions and multiplicities. <Ref
			to="homology/chains"
		/> brings both back with integer coefficients.
	</p>
</Warning>

<h2 id="counting-cycles">Trees, and how many cycles there are</h2>

<p>
	For the bow-tie we found a basis by looking at faces. But a graph need not be drawn in the plane, and then it has no faces to look at. Is there a way to
	count independent cycles that works for every graph? There is, and it was found by a physicist wiring up electrical circuits.
</p>

<Definition id="def-tree" title="Trees and spanning trees">
	<p>
		A <dfn>tree</dfn> is a connected graph with no cycles other than the empty one. A <dfn>spanning tree</dfn> of a connected graph is a tree made of some
		of its edges that reaches every vertex.
	</p>
</Definition>

<p>Trees are the graphs with no holes at all, and two facts about them do all the work.</p>

<p>
	First, <strong>a tree with \(V\) vertices has exactly \(V - 1\) edges.</strong> To see why, regrow the tree from a single vertex, one edge at a time,
	each edge reaching a vertex you have not visited yet. The tree is connected, so you can keep going until every vertex is reached; each edge brought
	exactly one new vertex with it, so by then you have used \(V - 1\) edges. None is left over: a leftover edge, together with the path you grew between its
	two ends, would be a nonempty cycle.
</p>

<p>
	Second, <strong>between any two vertices of a tree there is exactly one path.</strong> There is at least one because the tree is connected. There cannot
	be two, because two different paths between the same vertices would add up to a nonempty cycle.
</p>

<p>
	Every connected graph has a spanning tree, and a greedy recipe finds one: go through the edges one by one, keeping an edge whenever it joins two vertices
	not yet connected by kept edges. (Why the kept edges contain no cycle is a nice puzzle; the box after the proof below solves it.) Now look at an edge
	\(e\) that the tree leaves out. Its two ends are joined by exactly one path in the tree, and that path together with \(e\) is a cycle.
</p>

<Definition id="def-fundamental-cycle" title="Fundamental cycles">
	<p>
		Fix a spanning tree of a connected graph. For each edge \(e\) not in the tree, the <dfn>fundamental cycle</dfn> \(C_e\) consists of \(e\) together with
		the tree path joining the two ends of \(e\).
	</p>
</Definition>

<Figure num="3.1.2" title="Trees and fundamental cycles" hint="Tap a numbered edge · switch to “Cut edges”">
	<SpanningTree />
	{#snippet caption()}
		A spanning tree (blue) reaches every vertex using \(V - 1 = 7\) edges. Each of the \(5\) edges it leaves out (dashed, numbered) closes up exactly one
		fundamental cycle — tap one to see it. “Another spanning tree” changes which cycles you get, but never how many. In “Cut edges” mode, delete edges and
		watch the count \(E - V + c\): cutting an edge inside a loop removes a hole; cutting a bridge splits the graph instead.
	{/snippet}
</Figure>

<Theorem id="thm-kirchhoff" label="Theorem (Kirchhoff)">
	<p>
		The fundamental cycles of a spanning tree form a basis of the cycle space. Consequently a connected graph with \(V\) vertices and \(E\) edges has exactly
		\(E - V + 1\) independent cycles, and a graph with \(c\) connected pieces has
	</p>
	\[ b_1 = E - V + c. \]
</Theorem>

<Proof>
	<p>
		<em>Independent.</em> Each fundamental cycle \(C_e\) contains exactly one edge outside the tree, namely \(e\) itself. If we add up several different
		fundamental cycles, their outside edges are all different, so none of them can cancel: the sum is not empty.
	</p>
	<p>
		<em>Spanning.</em> Take any cycle \(Z\), and add to it the fundamental cycle \(C_e\) of each outside edge \(e\) that \(Z\) contains. Call the result
		\(D\). Every outside edge of \(Z\) now appears twice and cancels, and the \(C_e\) bring in no other outside edges, so \(D\) uses only tree edges. But \(D\)
		is a sum of cycles, hence a cycle — and a tree has no nonempty cycles. So \(D = \varnothing\), which says precisely that \(Z\) is the sum of those
		fundamental cycles.
	</p>
	<p>
		<em>Counting.</em> There is one fundamental cycle per edge outside the tree, and the tree has \(V - 1\) edges, so there are \(E - (V - 1)\) of them. A
		graph with \(c\) pieces has a spanning tree in each piece, with \(V - c\) edges in total, which gives \(E - V + c\). (For the same theorem in a graph
		theory textbook, see <Cite k="diestel2025" loc="Thm 1.9.5" text />.)
	</p>
</Proof>

<Remark title="The step we took on trust">
	<p>
		Why do the edges kept by the greedy recipe contain no nonempty cycle? Take a nonempty set of edges in which every degree is even, and walk along it
		without reusing an edge. Whenever you enter a vertex other than your starting point, you have used an odd number of its edges, so at least one unused
		edge remains to leave by. You can only get stuck back where you started: the walk closes up into a loop. Now suppose all the loop’s edges were kept by
		the recipe, and look at the one it kept last. When that edge was considered, the rest of the loop already joined its two ends, so the recipe would have
		thrown it away. Contradiction — the kept edges contain no nonempty cycle.
	</p>
</Remark>

<p>
	The number \(b_1\) is called the <dfn>first Betti number</dfn> of the graph (it also goes by the cycle rank or cyclomatic number); it is the number of
	independent holes. Its partner \(b_0 = c\), the number of connected pieces, is the zeroth Betti number. We will see in <a href="#every-dimension"
		>a later section</a
	> why the number of pieces deserves to sit in the same family as the number of holes. The complete definition of Betti numbers comes in <Ref
		to="homology/homology-groups"
	/>.
</p>

<History title="Kirchhoff’s loops">
	<p>
		In 1847 the young physicist Gustav Kirchhoff wanted to compute the currents in an electrical network. His voltage law gives one equation for every loop
		of wires — but loops that are sums of other loops give equations that are sums of other equations, and so carry no new information. Kirchhoff needed a
		set of independent loops, and he found it exactly as we did: remove wires until no closed loop is left (what remains is a spanning tree), and let each
		removed wire close up its own loop <Cite k="kirchhoff1847" />. He described the tree only through the wires he took away, and he never counted trees,
		although the theorem that counts them is often given his name; a recent study untangles what he did and did not do <Cite k="kirby2016" />.
	</p>
</History>

<p>
	Rearranging Kirchhoff’s formula gives something you have met before. Since \(b_1 = E - V + b_0\),
</p>
\[ V - E = b_0 - b_1. \]
<p>
	The left side is the <Term t="euler-characteristic">Euler characteristic</Term> of the graph, from <Ref to="topology/euler-characteristic" />. The right side
	counts pieces and holes. One side counts the building blocks, the other counts features of the shape that do not depend on how it was built. That
	coincidence is the first glimpse of a theorem (the Euler–Poincaré formula) that explains why \(V - E + F\) never changes when you subdivide.
</p>

<h2 id="filling-in">Filling in: cycles that bound</h2>

<p>
	In a graph every nonempty cycle encloses a hole, because nothing is filled in: there is only wire. Now we add the second ingredient of homology. Let us
	allow some triangles to be <em>filled</em>, like a membrane stretched across a frame. In the language of <Ref to="topology/simplicial-complexes" />, we are
	adding 2-simplices to the graph.
</p>

<p>
	Fill a triangle, and its three sides become the edge of something: the triangle itself. Fill several neighbouring triangles, and they form a region whose
	edge is its outer rim. Where two filled triangles meet, their shared side is <em>inside</em> the region and not on its rim — it is a side of two triangles,
	used twice, and it cancels. So the rim of a region is the sum of the rims of its triangles, with exactly the same addition as before.
</p>

<Definition id="def-boundary" title="Boundaries">
	<p>
		The <dfn>rim</dfn> of a set \(R\) of filled triangles is the set of edges that are sides of an odd number of triangles in \(R\) — equivalently, the sum
		of the rims of the triangles in \(R\). A cycle is a <dfn>boundary</dfn> if it is the rim of some set of filled triangles.
	</p>
</Definition>

<p>
	Every boundary is a cycle: the rim of a single triangle has no loose ends, and a sum of cycles is a cycle. (A rim is never ragged.) But the converse is
	false, and that is the whole point. Some cycles are the rim of nothing that is filled in.
</p>

<KeyIdea title="The definition of a hole">
	<p>
		<strong>A hole is a cycle that is not a boundary.</strong> In Jeremy Kun’s words: “The holes are all those cycles (loops) which don’t arise as the
		boundaries of higher-dimensional things.” <Cite k="kun2013" />
	</p>
</KeyIdea>

<Figure num="3.1.3" title="Fill it in" hint="Tap edges to draw a loop · switch mode to fill triangles">
	<FillIn />
	{#snippet caption()}
		A patch of ten triangles, two of them empty (\(\hole{h_1}\) and \(\hole{h_2}\)). Draw a loop, or pick one. If every triangle inside the loop is filled,
		the loop is the rim of that teal region: a boundary. If it surrounds an empty triangle, it bounds nothing. Then switch mode, fill \(h_1\), and look at the
		same loop again.
	{/snippet}
</Figure>

<p>
	Spend a minute with Figure 3.1.3. The “small loop” runs around one filled triangle: it glows teal — it is the boundary of that triangle. The “tight loop
	on the left” runs around the empty triangle \(h_1\): no set of filled triangles has it as a rim, so it is a hole. Now switch to filling mode, tap \(h_1\)
	to fill it, and look again. Same loop, new verdict: it has become a boundary. <strong>Filling in a triangle kills a hole.</strong> Empty a triangle and you
	create one.
</p>

<p>
	The figure also keeps count. With all its edges present, the patch has \(E - V + 1 = 19 - 10 + 1 = 10\) independent cycles, by Kirchhoff. Each filled
	triangle turns one of them into a boundary, and different triangles never conspire to make a rim vanish — a nonempty region of a flat patch always has an
	edge. So with \(F\) triangles filled,
</p>
\[ \text{number of holes} = \underbrace{(E - V + 1)}_{\text{independent cycles}} - \underbrace{F}_{\text{independent boundaries}}. \]
<p>
	That is the shape of the general formula: <strong>holes = cycles minus boundaries</strong>, counted as dimensions. In <Ref to="homology/homology-groups" /> this
	becomes a precise statement about vector spaces.
</p>

<Warning title="Bounding depends on the space">
	<p>
		“Does this loop bound?” only makes sense once we say <em>bound what, inside which space</em>. The tight loop around \(h_1\) bounds nothing in the patch
		with \(h_1\) empty, but it bounds the triangle \(h_1\) once that is filled. The loop has not changed; the space around it has. When we say a cycle is a
		boundary, we always mean the rim of something that is part of the space.
	</p>
</Warning>

<h2 id="homologous">Homologous cycles: the same hole, seen twice</h2>

<p>
	In Figure 3.1.3, choose the “wider loop on the left”. It also surrounds \(h_1\) — but it encloses three filled triangles as well. Is it a different hole
	from the tight loop, or the same hole seen from further away? Intuition says the same hole. Here is why the mathematics agrees. Add the two loops. Each
	edge they share cancels, and what is left is exactly the rim of the three filled triangles between them. The two loops <em>together</em> bound a region,
	even though neither bounds alone.
</p>

<Definition id="def-homologous" title="Homologous cycles">
	<p>
		Two cycles \(z\) and \(z'\) are <dfn>homologous</dfn>, written \(z \sim z'\), if \(z + z'\) is a boundary. Picture it this way: together, the two cycles
		are the rim of a filled region — they sweep out a surface between them.
	</p>
</Definition>

<p>
	A cycle is a boundary exactly when it is homologous to the empty cycle (since \(z + \varnothing = z\)); such a cycle is called <dfn>null-homologous</dfn>.
	With integer coefficients, in the next chapters, the definition will read “\(z - z'\) is a boundary”. Mod 2, plus and minus are the same thing, because \(1
	= -1\) in \(\Z/2\).
</p>

<p>
	Being homologous is an <Term t="equivalence-relation">equivalence relation</Term> (see <Ref to="foundations/equivalence" />), and checking this is a pleasant
	exercise in the arithmetic of rims:
</p>
<ul>
	<li><em>Reflexive:</em> \(z + z = \varnothing\), the rim of the empty region. So \(z \sim z\).</li>
	<li><em>Symmetric:</em> \(z + z' = z' + z\). So \(z \sim z'\) implies \(z' \sim z\).</li>
	<li>
		<em>Transitive:</em> if \(z + z'\) is the rim of a region \(R\) and \(z' + z''\) is the rim of a region \(R'\), then adding gives \(z + z'' = (z + z') +
		(z' + z'')\), the rim of \(R + R'\). Rims add!
	</li>
</ul>

<History title="Riemann’s lemma">
	<p>
		That last argument is older than the word “homology”. Riemann met it in 1857, while studying integrals along closed curves on a surface: such an integral
		vanishes when the curves form the complete boundary of a region. To show that his count of independent curves did not depend on which curves he chose,
		he needed a lemma. If curves \(A\) and \(B\) together bound one region, and \(A\) and \(C\) together bound another, then \(B\) and \(C\) together bound a
		third: the two regions added, with their overlap thrown away <Cite k="riemann1857" />. Charles Weibel’s history of homological algebra points out that
		this is, in modern terms, exactly addition of cycles mod 2 <Cite k="weibel1999" />.
	</p>
</History>

<p>
	So cycles fall into classes of mutually homologous cycles, and <strong>holes are counted by classes</strong>, not by individual loops. Two loops around the
	same hole are one hole. A loop around two holes is not a third hole: it is homologous to the sum of the loops around each. This is the heart of what
	<Ref to="homology/homology-groups" /> will call “cycles modulo boundaries”.
</p>

<p>Here is the same idea in three dimensions, on the most famous object in the hole debate.</p>

<Figure num="3.1.4" title="Homologous loops on a straw" hint="Drag to rotate · play or scrub loop B · wiggle it">
	<HomologousBand />
	{#snippet caption()}
		Loops \(\cyc{A}\) and \(\cyc{B}\) both go once around a straw. Neither is the rim of anything on the straw, but together they are the rim of the teal band
		between them, so \(A \sim B\). Wiggle \(B\) or slide it: the band follows. Straighten it and slide it all the way to the top, and the two
		<em>ends</em> of the straw turn out to be homologous — one hole, seen from two ends.
	{/snippet}
</Figure>

<Intuition title="Sweeping">
	<p>
		If you can slide a loop across a surface into another loop, the slide sweeps out a band whose rim is the two loops, so they are homologous. That is a
		good first picture. But homology is more generous than sliding: loops may also merge and split along the way. On a pair of trousers the waistband is
		homologous to the sum of the two cuffs — the fabric of the trousers is a region whose rim is all three — although no single loop slides onto two.
	</p>
	<p>
		The same generosity separates <em>bounding</em> from <em>shrinking</em>. Sliding a loop sweeps out a band; shrinking it to a point sweeps out a disk;
		bounding allows any surface at all. Draw a loop around the waist of a surface with two handles, between the handles. It bounds either half, since each
		half is a region whose whole rim is that loop, so homology counts it as zero. Yet it cannot be shrunk to a point: whichever way you pull it, a handle is
		in the way. (André Henriques draws this surface on the blackboard in his Oxford lecture on chains and cycles, with one half hatched.) The section
		<Ref to="homology/invariance" hash="hurewicz">“Homology versus homotopy”</Ref> of §3.5 makes the difference precise and lets you try both kinds of filling.
	</p>
</Intuition>

<h2 id="sphere-and-torus">Loops on the sphere and on the torus</h2>

<p>
	Graphs and flat patches were our training ground. Now for surfaces. Imagine a surface finely <Term t="triangulation">triangulated</Term>, with every triangle
	filled — it is a surface, after all, not a skeleton of wires. Which loops bound?
</p>

<p>
	On the <strong>sphere</strong>, all of them. A loop of latitude is the rim of the cap above it — and also of the cap below it. (Mod 2 the two caps add up to
	the whole sphere, and the sphere has no rim at all: that will matter in a moment.) Wiggly loops, loops that cross themselves, sums of several loops: on the
	sphere, every cycle is a boundary. The sphere has no 1-dimensional holes: \(b_1 = 0\).
</p>

<Figure num="3.1.5" title="The sphere: every loop bounds" hint="Drag to rotate · choose what to look at">
	<SphereVoid />
	{#snippet caption()}
		A loop on the sphere bounds the cap on either side of it. Switch to “the whole sphere”: the surface itself has no rim, so it is a cycle of a new kind, and
		nothing in the sphere fills its inside. “Fill the inside” adds the solid ball, and the sphere becomes a boundary.
	{/snippet}
</Figure>

<p>
	The <strong>torus</strong> — the surface of a doughnut — is different. A small loop drawn on it bounds a little disk, exactly as on the sphere. But a
	<dfn>meridian</dfn>, a loop going once around the tube, bounds nothing: there is no region of the torus whose whole rim is that loop. Here is a quick way to
	convince yourself. If a loop that does not cross itself is the rim of a region, then cutting along the loop cuts that region off: the surface falls into
	two pieces. Cut a torus along a meridian, though, and it stays in one piece — it opens into a tube. Cut it along a <dfn>longitude</dfn>, a loop going once
	around the central hole, and again it stays in one piece.
</p>

<Figure num="3.1.6" title="Loops on a torus" hint="Drag to rotate · choose a loop · cut along it">
	<TorusLoops />
	{#snippet caption()}
		A small loop is the rim of a teal disk; it can shrink away. The meridian, the longitude, and every \((p, q)\) loop (going \(p\) times around the hole and
		\(q\) times around the tube) bound nothing. Turn on “cut along the loop”: for the small loop the disk lifts off — two pieces — while for the others the
		torus stays in one piece.
	{/snippet}
</Figure>

<p>
	What about the meridian and the longitude <em>together</em>? Are they homologous — two views of one hole, like the two ends of the straw? No: no region of
	the torus has exactly those two loops as its rim, so their sum is not a boundary. Neither is the diagonal \((1, 1)\) loop, which goes around the tube
	and around the hole at once and is homologous to that sum. The meridian and the longitude are two genuinely independent holes. So the torus has
</p>
\[ b_1(T^2) = 2. \]

<p>
	This is the classic surprise. Ask anyone how many holes a doughnut has and they will say one. But the <em>surface</em> of a doughnut carries two
	independent non-bounding loops. One goes around the hole in the middle; the other goes around the tube, encircling the hole <em>inside</em> the tube where
	the dough would be. A doughnut’s surface is hollow, and its hollowness is a second hole.
</p>

<Warning title="b₁ is not the everyday number of holes">
	<p>
		A surface with \(g\) handles — a surface of <Term t="genus-g-surface">genus</Term> \(g\) (see <Ref to="topology/manifolds" />) — has \(b_1 = 2g\), not \(g\): each
		handle carries two independent loops, one going around the handle the way your fingers wrap around a mug’s handle, and one going through it. A pretzel
		surface with three handles has \(b_1 = 6\). This is why the honest answer to “is \(b_1\) the number of holes?” is “sometimes”. The precise statement is
		the one we have been building: \(b_1\) is the number of <em>independent cycles that are not boundaries</em>.
	</p>
</Warning>

<p>
	The torus loops in Figure 3.1.6 are drawn as smooth curves on a smooth surface, while our definitions are about edges and triangles. The two pictures agree:
	draw a fine triangulation on the torus, and any smooth loop can be nudged onto a nearby path of edges without changing which loops it is homologous to. A
	precise version of this — that the answer does not depend on how you triangulate — is one of the main theorems of <Ref to="homology/invariance" />.
</p>

<h2 id="every-dimension">Holes in every dimension</h2>

<p>
	Look again at the whole sphere in Figure 3.1.5. A loop on it always bounds. But the surface itself is a closed thing with no rim, and it surrounds an empty
	space. That empty space is a hole too — a hole of a different dimension, which no loop can detect. A loop is too thin to notice a cavity. To detect a
	cavity you need a surface that wraps around it.
</p>

<p>
	Everything we have done generalises by raising the dimension of the pieces by one. A set of triangles can have <em>loose edges</em>: edges that are sides
	of an odd number of its triangles. A single triangle has three loose edges; two triangles sharing a side have four. A set of triangles with no loose edges
	closes up like a surface without an edge — the four faces of a hollow tetrahedron, say, or the eight faces of an octahedron.
</p>

<Definition id="def-k-cycle" title="Cycles, boundaries and holes in each dimension">
	<p>
		A <dfn>2-cycle</dfn> is a set of triangles in which every edge is a side of an even number of them: no loose edges. A <dfn>2-boundary</dfn> is the
		outer skin of a set of filled solid tetrahedra. A <dfn>void</dfn>, or 2-dimensional hole, is a 2-cycle that is not a 2-boundary.
	</p>
	<p>
		In general, a <dfn>\(k\)-cycle</dfn> is a collection of \(k\)-dimensional pieces with no loose \((k-1)\)-dimensional pieces, a \(k\)-boundary is the rim of a
		collection of filled \((k+1)\)-dimensional pieces, and a \(k\)-dimensional hole is a \(k\)-cycle that is not a \(k\)-boundary.
	</p>
</Definition>

<p>
	The hollow sphere is a 2-cycle that is not a boundary, because the solid ball inside is not part of it: the sphere has one void, \(b_2 = 1\). Fill in the
	ball and the void disappears, just as filling a triangle killed a loop’s hole. The surface of a torus also encloses a void — the air in an inner tube — so
	\(b_2(T^2) = 1\) as well. A much-loved answer on Math StackExchange puts it memorably: \(b_2\) counts the separate plugs you would need to inflate the
	object <Cite k="mse40151" />. That is one half of Daniel Tubbenhauer’s “necklaces and plugs” test from <Ref to="prelude/shape-of-a-question" />
	<Cite k="tubbenhauer2021" />, and the other half now checks out too: a swimming ring takes two independent necklaces, one through the middle and one
	running round inside the air chamber, to match \(b_1(T^2) = 2\).
</p>

<p>
	What about dimension zero? The pieces are now single points, and a single point has no edge at all, so every set of points counts as a 0-cycle. A set of
	points is a 0-boundary if it is the set of loose ends of some set of edges. The two ends of a path from \(p\) to \(q\) form the pair \(\set{p, q}\), so
	<strong>two points bound exactly when a path joins them</strong>. Two points in different pieces of a space form a 0-cycle that bounds nothing: a
	0-dimensional hole is a <em>gap</em> between pieces. Counted carefully (see the last exercise of this chapter), the number of independent 0-cycles modulo 0-boundaries is the number
	of pieces, \(b_0 = c\). That is why the number of pieces belongs in the same family as the number of holes.
</p>

<Figure num="3.1.7" title="Holes in dimensions 0, 1 and 2">
	<HolesByDimension />
	{#snippet caption()}
		Dimension 0: \(p\) and \(q\) lie in different pieces, so no path has them as its ends — \(b_0\) counts the pieces. Dimension 1: a loop
		around an empty disk. Dimension 2: a closed surface around an empty ball. In each dimension a hole is detected by a cycle (gold) that is not the rim of anything in the space.
	{/snippet}
</Figure>

<p>Here are the Betti numbers of the shapes we have met. Every entry can be checked with the reasoning of this chapter.</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Shape</th><th class="m">\(b_0\)</th><th class="m">\(b_1\)</th><th class="m">\(b_2\)</th><th>In words</th></tr>
		</thead>
		<tbody>
			<tr><td>two points</td><td>2</td><td>0</td><td>0</td><td>two pieces</td></tr>
			<tr><td>circle (hollow triangle)</td><td>1</td><td>1</td><td>0</td><td>one loop that bounds nothing</td></tr>
			<tr><td>disk (filled triangle)</td><td>1</td><td>0</td><td>0</td><td>the loop is filled in</td></tr>
			<tr><td>sphere</td><td>1</td><td>0</td><td>1</td><td>every loop bounds; one void</td></tr>
			<tr><td>torus (surface)</td><td>1</td><td>2</td><td>1</td><td>meridian, longitude; one void</td></tr>
			<tr><td>solid torus (doughnut)</td><td>1</td><td>1</td><td>0</td><td>the meridian now bounds a slice</td></tr>
			<tr><td>surface of genus \(g\)</td><td>1</td><td>\(2g\)</td><td>1</td><td>two loops per handle</td></tr>
		</tbody>
	</table>
</div>

<h2 id="back-to-the-straw">Back to the straw</h2>

<p>
	We can now settle — or at least sharpen — the argument we began with. Figure 3.1.8 shows some everyday objects with their rims and loops. Select rims and
	ask the figure whether they bound.
</p>

<Figure num="3.1.8" title="How many holes?" hint="Choose an object · tap rims and loops">
	<HoleGallery />
	{#snippet caption()}
		Each opening of a straw, trousers or T-shirt has a rim, and every rim is a cycle that bounds nothing on its own. But all the rims of an object together
		are exactly the edge of the fabric — so one rim is always the sum of the others. That single relation is why there is one fewer independent hole than
		openings.
	{/snippet}
</Figure>

<p>
	<strong>The straw.</strong> Its two end-rims are cycles, and neither bounds anything on the straw. But together they are the rim of the straw’s wall, so they
	are homologous: they are one hole, seen from two ends. \(b_1 = 1\). The “two” camp was counting rims; the “one” camp was counting homology classes. And the
	“zero” camp was answering a different question — how the straw was <em>made</em>. Homology looks only at the finished shape, and gives the same answer
	for a sheet of paper rolled into a tube and for a rod with a tunnel drilled through it.
</p>

<p>
	<strong>Trousers and T-shirts.</strong> Trousers have three openings — waist and two cuffs — and the three rims together bound the fabric. So any one rim
	is homologous to the sum of the other two, and only two are independent: \(b_1 = 2\). A T-shirt has four openings — neck, waist and two sleeves — and \(b_1 =
	3\). In general, a sphere with \(k\) disks removed has \(b_1 = k - 1\). Different numbers of holes: Richeson’s justification that a shirt is not a pair of
	trousers.
</p>

<p>
	<strong>The mug.</strong> The rim of the cup bounds the inside surface of the cup, so the cavity you pour coffee into is a dent, not a hole. A ring drawn
	around the handle’s arm bounds a slice of solid ceramic. Only a loop going around the handle’s opening bounds nothing. One hole — exactly like a solid
	doughnut, whose meridian bounds a slice of dough while its longitude bounds nothing. That is the homology half of the old joke that a topologist cannot
	tell a coffee mug from a doughnut. (The joke claims more: that one can be squashed into the other. Equal numbers of holes are evidence of that, not proof.)
</p>

<p>
	Homology does not declare the “two” camp wrong. They are counting something real: openings. What homology offers is a family of numbers — \(b_0, b_1, b_2,
	\dots\) — each with an exact definition, which do not change when the object is stretched or bent. That last claim, that Betti numbers are
	<em>invariants</em>, is not obvious at all, and it takes up much of <Ref to="homology/invariance" />.
</p>

<h2 id="what-comes-next">From pictures to algebra</h2>

<p>
	Everything in this chapter was done by looking. To compute holes in shapes too complicated to look at — a 7-vertex torus with every pair of vertices joined,
	a Klein bottle, a cloud of ten thousand data points — we need to turn the looking into algebra. Here is precisely what the next two chapters do, item by
	item.
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>In this chapter</th><th>Formalised as</th><th>Where</th></tr>
		</thead>
		<tbody>
			<tr><td>a set of edges or triangles</td><td>a chain; the chain group \(C_k\)</td><td>§3.2</td></tr>
			<tr><td>adding sets (shared pieces cancel)</td><td>addition in \(C_k(K;\Z/2)\)</td><td>§3.2</td></tr>
			<tr><td>loose ends; the rim of a region</td><td>the boundary operator \(\partial_k\colon C_k \to C_{k-1}\)</td><td>§3.2</td></tr>
			<tr><td>“a rim is never ragged”</td><td>\(\partial_{k-1} \circ \partial_k = 0\)</td><td>§3.2</td></tr>
			<tr><td>cycles; boundaries</td><td>\(Z_k = \ker \partial_k\); \(B_k = \im \partial_{k+1}\)</td><td>§3.2</td></tr>
			<tr><td>homologous cycles; holes</td><td>the homology group \(H_k = Z_k / B_k\)</td><td>§3.3</td></tr>
			<tr><td>holes = cycles minus boundaries</td><td>\(b_k = \dim Z_k - \dim B_k\)</td><td>§3.3</td></tr>
			<tr><td>directions and multiplicities</td><td>integer chains, orientation, signs, torsion</td><td>§3.2–3.4</td></tr>
		</tbody>
	</table>
</div>

<p>
	The single most important fact on that list is the fourth one: the rim of a region never has loose ends. It is the reason every boundary is a cycle, the
	reason the quotient in \(H_k = Z_k / B_k\) makes sense, and — in Part IV — the reason the whole of cohomology works. The next chapter proves it, first by
	counting mod 2, then with signs.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Which sets are cycles?">
	<p>
		A square has vertices \(a, b, c, d\) and edges \(ab, bc, cd, da\), plus the diagonal \(ac\). Which of these edge sets are cycles? (i) \(\set{ab, bc,
		ca}\); (ii) \(\set{ab, bc, cd, da}\); (iii) \(\set{ab, bc, cd, da, ac}\); (iv) \(\set{ab, ac}\); (v) \(\varnothing\).
	</p>
	{#snippet hint()}
		<p>For each set, write down the degree of each of the four vertices.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(i) Degrees \(a{:}\,2, b{:}\,2, c{:}\,2, d{:}\,0\): a cycle (a triangle). (ii) All degrees \(2\): a cycle (the square). (iii) \(a\) and \(c\) have degree
			\(3\): not a cycle — the loose ends are \(a\) and \(c\). (iv) \(a\) has degree \(2\), but \(b\) and \(c\) have degree \(1\): not a cycle. (v) All degrees
			\(0\): the zero cycle. Notice that (ii) \(=\) (i) \(+\) \(\set{ac, cd, da}\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Counting with Kirchhoff">
	<p>
		Compute \(b_1 = E - V + c\) for: (a) the complete graph \(K_4\) (four vertices, every pair joined); (b) the edges of a cube; (c) two separate triangles;
		(d) a tree with \(10\) vertices; (e) the Königsberg bridge graph (four land masses, seven bridges — Kirchhoff’s count works for graphs with repeated edges
		too).
	</p>
	{#snippet solution()}
		<p>
			(a) \(6 - 4 + 1 = 3\). (b) \(12 - 8 + 1 = 5\) — the five faces other than one, matching the fact that the six face rims of a cube add up to \(\varnothing\).
			(c) \(6 - 6 + 2 = 2\). (d) \(9 - 10 + 1 = 0\): trees have no holes. (e) \(7 - 4 + 1 = 4\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="All the cycles of K₄">
	<p>
		By (a) above, the cycle space of \(K_4\) has dimension \(3\), so it should contain \(2^3 = 8\) cycles. List them all, and check that the sum of any two is
		in your list.
	</p>
	{#snippet hint()}
		<p>Draw \(K_4\) as a triangle with a vertex in the middle joined to all three corners. Count triangles and squares.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			With vertices \(1, 2, 3, 4\): the empty cycle; the four triangles \(\set{12, 23, 13}\), \(\set{12, 24, 14}\), \(\set{13, 34, 14}\), \(\set{23, 34, 24}\);
			and the three squares \(\set{12, 23, 34, 14}\), \(\set{12, 24, 34, 13}\), \(\set{13, 23, 24, 14}\). That is \(1 + 4 + 3 = 8\). For example, the first
			two triangles share the edge \(12\), and their sum is the square \(\set{23, 13, 24, 14}\). The sum of all four triangles is empty: every edge lies on
			exactly two of them.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Filling the square">
	<p>
		Return to the square with a diagonal from the first exercise, and fill the triangle \(abc\) but not \(acd\). Which of the cycles \(\set{ab, bc, ca}\), \(\set{ac,
		cd, da}\) and \(\set{ab, bc, cd, da}\) are boundaries? How many holes are there? Are the last two homologous?
	</p>
	{#snippet solution()}
		<p>
			\(\set{ab, bc, ca}\) is the rim of the filled triangle: a boundary. \(\set{ac, cd, da}\) is the rim of an empty triangle, and no other set of filled
			triangles has it as a rim: a hole. The square \(\set{ab, bc, cd, da}\) is not a boundary either (the only filled triangle has a different rim). There is
			one hole: \(E - V + 1 - F = 5 - 4 + 1 - 1 = 1\). And yes, the square and \(\set{ac, cd, da}\) are homologous: their sum is \(\set{ab, bc, ca}\), the rim
			of the filled triangle between them.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Two equators of a torus">
	<p>
		On a torus, the <em>outer equator</em> is the longitude running around the outside, farthest from the central hole, and the <em>inner equator</em> runs
		around the inside, nearest the hole. Explain why they are homologous. Is either of them a boundary?
	</p>
	{#snippet solution()}
		<p>
			Together they are the rim of the upper half of the torus — the band of surface running over the top from the outer equator to the inner one. (They are
			also the rim of the lower half.) So they are homologous. Neither is a boundary: each is a longitude, and cutting along a single longitude leaves the
			torus in one piece, a tube.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Openings and holes">
	<p>
		A sphere with \(k \geq 1\) small disks removed has \(k\) rims \(r_1, \dots, r_k\). Explain why \(r_1 + r_2 + \dots + r_k\) is a boundary, and why (granting
		that no smaller nonempty set of rims bounds) the surface has \(b_1 = k - 1\). What does this say about a disk (\(k = 1\))?
	</p>
	{#snippet hint()}
		<p>Which region of the surface has all the rims together as its edge? For the count, show that \(r_1, \dots, r_{k-1}\) are independent and that \(r_k\) is homologous to their sum.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The whole surface is a region, and its rim is the set of all its edge-circles: \(r_1 + \dots + r_k\). So that sum bounds. Since the sum bounds, \(r_k
			\sim r_1 + \dots + r_{k-1}\) — every rim is homologous to the sum of the others — so \(r_1, \dots, r_{k-1}\) already account for all the rims. They are
			independent because, by the assumption, no nonempty set of fewer than \(k\) rims bounds. (Every cycle on this surface is homologous to a sum of rims,
			which is plausible from the pictures and will follow from the methods of <Ref to="homology/exact-sequences" />.) So \(b_1 = k - 1\). For a disk,
			\(k = 1\): its single rim bounds the disk itself, and \(b_1 = 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Why b₀ counts pieces">
	<p>
		Call a set of vertices a 0-boundary if it is the set of loose ends of some set of edges. (a) Show that every 0-boundary has an even number of vertices in
		each connected piece. (b) Show that, conversely, any set of vertices with an even number in each piece is a 0-boundary. (c) Conclude that two sets of
		vertices are homologous exactly when they have the same parity in every piece, so that the classes are described by one bit per piece: \(b_0 = c\).
	</p>
	{#snippet hint()}
		<p>For (a), add up the degrees of all vertices of one piece. For (b), pair the chosen vertices up within each piece and join each pair by a path.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) Fix a set \(S\) of edges and a piece \(P\). The sum of the degrees in \(S\) of the vertices of \(P\) counts each edge of \(S\) inside \(P\) twice, so
			it is even. A sum of numbers is even only if an even number of them are odd: \(P\) contains an even number of loose ends. (b) Within each piece, pair
			the chosen vertices up and pick a path joining each pair. The sum of these paths (shared edges cancel) has loose ends exactly at the chosen vertices,
			because each path contributes loose ends at its two endpoints only. (c) Two sets \(X\) and \(Y\) are homologous when \(X + Y\) is a 0-boundary, i.e. by
			(a) and (b) when \(X + Y\) has an even number of vertices in each piece — when \(X\) and \(Y\) have the same parity in each piece. So a class is
			determined by \(c\) independent bits, one per piece, and \(b_0 = c\).
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>“Hole” is an everyday word with many meanings. Homology does not define holes directly: it detects them by cycles that bound nothing.</li>
		<li>In a graph, a <strong>cycle</strong> (mod 2) is a set of edges with no loose ends — every vertex has even degree. Closed walks give cycles, and every cycle is made of closed walks (Euler, Hierholzer).</li>
		<li>Cycles add by <strong>symmetric difference</strong>: shared edges cancel. They form a vector space over \(\Z/2\), the cycle space.</li>
		<li>A spanning tree has \(V - 1\) edges; each edge it leaves out closes one <strong>fundamental cycle</strong>, and these form a basis. So \(b_1 = E - V + c\) (Kirchhoff), and \(V - E = b_0 - b_1\).</li>
		<li>Filling triangles creates <strong>boundaries</strong>: rims of filled regions. Every boundary is a cycle. <strong>A hole is a cycle that is not a boundary.</strong></li>
		<li>Two cycles are <strong>homologous</strong> if together they bound: their sum is a boundary. Holes are counted by classes of homologous cycles.</li>
		<li>On the sphere every loop bounds; on the torus the meridian, the longitude and their sum do not, so \(b_1(T^2) = 2\). A genus-\(g\) surface has \(b_1 = 2g\).</li>
		<li>The same story runs in every dimension: \(b_0\) counts pieces, \(b_1\) independent loops, \(b_2\) voids — closed surfaces around cavities.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Topology 101: The Hole Truth',
			author: 'David S. Richeson (Quanta Magazine, 2021)',
			url: 'https://www.quantamagazine.org/topology-101-how-mathematicians-study-holes-20210126/',
			note: 'The straw debate, Riemann’s cuts and Betti numbers, for a general audience. A perfect companion to the opening of this chapter.',
			kind: 'web',
			free: true
		},
		{
			title: 'How Mathematicians Use Homology to Make Sense of Topology',
			author: 'Kelsey Houston-Edwards (Quanta Magazine, 2021)',
			url: 'https://www.quantamagazine.org/how-mathematicians-use-homology-to-make-sense-of-topology-20210511/',
			note: 'Holes of different dimensions — rubber bands and hollow balls — explained with pictures and no formulas.',
			kind: 'web',
			free: true
		},
		{
			title: 'Homology Theory — A Primer',
			author: 'Jeremy Kun (2013)',
			url: 'https://jeremykun.com/2013/04/03/homology-theory-a-primer/',
			note: 'A programmer’s introduction to cycles, boundaries and homology, with pictures; the source of the quotation in our key-idea box.',
			kind: 'web',
			free: true
		},
		{
			title: 'Algebraic Topology, Chapter 2: “The Idea of Homology”',
			author: 'Allen Hatcher (Cambridge, 2002)',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'Pages 98–102 tell this chapter’s story for a graph with two vertices and four edges, then glue in 2-cells and a 3-cell one at a time. Graduate level, but this opening is readable now.',
			kind: 'book',
			free: true
		},
		{
			title: 'What is…homology intuitively? Or: What is a hole?',
			author: 'Daniel Tubbenhauer (VisualMath, YouTube, 2021)',
			url: 'https://www.youtube.com/watch?v=QanLUNiqZW0',
			note: 'A short lecture over slides annotated live (the slides are free at dtubbenhauer.com/youtube.html): necklaces and plugs, chains on one triangle, and a loop around a hole in a subdivided triangle shrunk onto the hole one small triangle at a time. Pause on that slide.',
			kind: 'video',
			free: true
		},
		{
			title: 'You Could Have Invented Homology, Part 3: Boundaries & The Big Idea',
			author: 'Boarbarktree (David Farrell), YouTube, 2021',
			url: 'https://www.youtube.com/watch?v=j9JJJoTjIpY',
			note: 'Hand-animated and unhurried. The series stops before the formal definition, but this episode ends on the idea at the heart of this chapter: put the edge of a triangle into a space and ask whether it can be filled.',
			kind: 'video',
			free: true
		},
		{
			title: 'Graphs, Surfaces and Homology (3rd edition)',
			author: 'Peter Giblin (Cambridge, 2010)',
			url: 'https://doi.org/10.1017/CBO9780511779534',
			note: 'The classic undergraduate route from graphs (Chapter 1) to surfaces to homology, with a chapter on homology mod 2 and exercises throughout.',
			kind: 'book'
		},
		{
			title: 'Euler’s Formula and Graph Duality',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/eulers-characteristic-formula',
			note: 'An animated proof of V − E + F = 2 for drawings in the plane, built from a spanning tree and a second tree in the dual graph: the same trees that gave us Kirchhoff’s count.',
			kind: 'video',
			free: true
		},
		{
			title: 'Hodge Laplacians on Graphs',
			author: 'Lek-Heng Lim (SIAM Review, 2020)',
			url: 'https://arxiv.org/abs/1507.05379',
			note: 'Cycles, boundaries and much more done “entirely in terms of graphs” with linear algebra. For later, after §3.4.',
			kind: 'paper',
			free: true
		},
		{
			title: 'Euler’s Gem',
			author: 'David S. Richeson (Princeton, 2008)',
			note: 'A popular history of V − E + F, from Euler and Königsberg to modern topology.',
			kind: 'book'
		}
	]}
/>

<style>
	/* table headers are upper-cased by the house style; keep math letters as written */
	th.m {
		text-transform: none;
		font-size: 0.95rem;
		letter-spacing: 0;
	}
</style>
