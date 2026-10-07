<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
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
	import SimplexGallery from '$lib/figures/topology/simplicial-complexes/SimplexGallery.svelte';
	import Barycentric from '$lib/figures/topology/simplicial-complexes/Barycentric.svelte';
	import NonExamples from '$lib/figures/topology/simplicial-complexes/NonExamples.svelte';
	import ComplexBuilder from '$lib/figures/topology/simplicial-complexes/ComplexBuilder.svelte';
	import TorusGrid from '$lib/figures/topology/simplicial-complexes/TorusGrid.svelte';
	import MobiusTorus from '$lib/figures/topology/simplicial-complexes/MobiusTorus.svelte';
	import ProjectivePlane6 from '$lib/figures/topology/simplicial-complexes/ProjectivePlane6.svelte';
	import Orientation from '$lib/figures/topology/simplicial-complexes/Orientation.svelte';
	import SimplicialMap from '$lib/figures/topology/simplicial-complexes/SimplicialMap.svelte';
	import Subdivision from '$lib/figures/topology/simplicial-complexes/Subdivision.svelte';
	import DeltaComplexes from '$lib/figures/topology/simplicial-complexes/DeltaComplexes.svelte';
	import CWBuild from '$lib/figures/topology/simplicial-complexes/CWBuild.svelte';

	const reading = [
		{
			title: 'Algebraic Topology, §2.1 (Δ-complexes) and Chapter 0 (cell complexes)',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard graduate text, free online. Its pictures of Δ-complexes (the two-triangle torus) and of cells being attached are the models for this chapter. Read after this book, or alongside it once you are comfortable.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Graphs, Surfaces and Homology',
			author: 'Peter Giblin',
			url: 'https://doi.org/10.1017/CBO9780511779534',
			note: 'The gentlest real textbook on this material: simplicial complexes, surfaces and their homology, with hundreds of exercises. Undergraduate level.',
			kind: 'book' as const
		},
		{
			title: 'Basic Topology, Chapter 6 (Triangulations)',
			author: 'M. A. Armstrong',
			url: 'https://doi.org/10.1007/978-1-4757-1793-8',
			note: 'A classic undergraduate text. Its chapter on triangulations treats simplicial complexes, barycentric subdivision and simplicial approximation with full proofs; the next chapter uses them to classify surfaces.',
			kind: 'book' as const
		},
		{
			title: 'You Could Have Invented Homology, Part 2: Some Simple Spaces',
			author: 'Boarbarktree (video)',
			url: 'https://www.youtube.com/watch?v=JTTDmE_bBtM',
			note: 'An animated build-up from segments and triangles, through convex combinations, to the standard simplices: our barycentric coordinates, reached through convex sets.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'You Could Have Invented Homology, Part 3: Boundaries & The Big Idea',
			author: 'Boarbarktree (video)',
			url: 'https://www.youtube.com/watch?v=j9JJJoTjIpY',
			note: 'Boundaries and interiors of simplices, why one builds with simplices rather than balls, and the first question of homology: can a loop be filled in? The series stops before the formal definition, which is where Part III of this book takes over.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Computational Topology: An Introduction',
			author: 'Herbert Edelsbrunner and John Harer',
			url: 'https://doi.org/10.1090/mbk/069',
			note: 'Simplicial complexes as a computer scientist uses them: data structures, subdivisions, and the algorithms of later chapters. Clear and practical.',
			kind: 'book' as const
		},
		{
			title: 'Homology Theory — A Primer',
			author: 'Jeremy Kun',
			url: 'https://www.jeremykun.com/2013/04/03/homology-theory-a-primer/',
			note: 'A programmer-friendly blog post that starts from simplicial complexes as lists of vertex sets — exactly the point of view of this chapter — and goes straight on to homology.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Enumeration and random realization of triangulated surfaces',
			author: 'Frank H. Lutz',
			url: 'https://arxiv.org/abs/math/0506316',
			note: 'Where the coordinates of Császár’s polyhedron in our figure come from, plus a tour of minimal triangulations of surfaces and how to find them by computer. Research level, but the pictures and tables are approachable.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'The Manifold Page',
			author: 'Frank H. Lutz',
			url: 'https://www3.math.tu-berlin.de/IfM/Nachrufe/Frank_Lutz/stellar/',
			note: 'Lists of all small triangulated surfaces and 3-manifolds, as plain vertex lists — abstract simplicial complexes in the wild.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Császár polyhedron',
			author: 'Wikipedia',
			url: 'https://en.wikipedia.org/wiki/Cs%C3%A1sz%C3%A1r_polyhedron',
			note: 'A short article with rotating pictures of Császár’s polyhedron and its dual, the Szilassi polyhedron.',
			kind: 'web' as const,
			free: true
		}
	];
</script>

<Epigraph author="Hermann Weyl" source="“Invariants”, Duke Mathematical Journal (1939)"
	>In these days the angel of topology and the devil of abstract algebra fight for the soul of each individual mathematical
	domain.</Epigraph
>

<p class="lead">
	A sphere has infinitely many points. So do a doughnut, a coffee cup and the surface of the Earth. Yet if we want to <em>count</em>
	things about a shape — how many pieces it has, how many loops, how many hollows — or ask a computer to do the counting for us,
	infinitely many points is far too many. The way out is to build every shape from a few of the simplest possible pieces — points,
	line segments, triangles and their higher-dimensional cousins — glued together by two strict rules. The whole shape then becomes a
	finite list you could write on a napkin, and questions about holes become questions about the list.
</p>

<Ahead>
	<p>
		These pieces are the raw material of homology. In <Ref to="homology/chains" /> each piece becomes a symbol you can add and
		subtract, and the <em>orientations</em> you will meet here supply the plus and minus signs of the boundary operator. In the very
		next chapter, <Ref to="topology/euler-characteristic" />, counting the pieces of a shape gives a number that refuses to change
		however you cut the shape up — and in <Ref to="homology/homology-groups" /> that number turns out to be built from holes. The
		cell complexes at the end of this chapter are what make the big computations of <Ref to="homology/exact-sequences" /> short.
	</p>
</Ahead>

<h2 id="shapes-as-lists">From shapes to lists</h2>

<p>
	Look at any animated film or video game and you are looking at triangles. A dragon, a face, a waving flag: each is stored in the
	computer as a <em>mesh</em> — a long list of corner points, and a list saying which three corners make up each little triangle.
	The computer never stores “a smooth surface”. It stores finitely many numbers, and the smooth-looking surface is something your eye
	assembles from them.
</p>

<p>
	Topology can do the same thing, and for a better reason than convenience. Remember that topology does not care about lengths,
	angles or curvature: a shape may be stretched and bent as much as you like, so long as nothing is torn and nothing new is glued (a
	<Term t="homeomorphism">homeomorphism</Term>, in the language of <Ref to="topology/spaces" />). So when we chop a shape into
	triangles, the exact sizes and angles of the triangles cannot matter. What survives every stretch is only <em>which pieces touch
	which</em>. Poincaré said it in the sentence that opens <Ref to="prelude/shape-of-a-question" />: a drawing may distort the
	proportions as much as it likes, as long as the relative positions of the parts are right.
</p>

<p>
	This suggests a plan. If we glue simple pieces together under rules strict enough that the gluing is completely described by a
	list — “these three corners form a triangle, these two corners form an edge” — then the list <em>is</em> the shape, as far as
	topology is concerned. Everything we want to know about holes must be readable from the list. In <Ref to="topology/gluing" /> you
	already built a torus by <Term t="gluing">gluing</Term> the sides of a square. This chapter makes that kind of gluing systematic and
	finite.
</p>

<p>Here is the route we will take.</p>

<ol>
	<li>The pieces: <em>simplices</em> (point, edge, triangle, tetrahedron, and so on), their faces, and coordinates inside them.</li>
	<li>The two rules for gluing simplices into a <em>simplicial complex</em>, and why each rule is there.</li>
	<li>The discovery that the geometry is redundant: a complex is just a list of vertex sets.</li>
	<li>Triangulations of the shapes we know: circle, sphere, torus, projective plane — including two famous small ones.</li>
	<li><em>Orientations</em>: giving each simplex a direction, which homology will need for its signs.</li>
	<li>Maps between complexes, and <em>subdivision</em>, which cuts a complex into finer pieces.</li>
	<li>Two looser ways of gluing — <em>Δ-complexes</em> and <em>CW complexes</em> — that build the same shapes from far fewer pieces.</li>
</ol>

<h2 id="simplices">Simplices: points, edges, triangles and beyond</h2>

<p>
	Let us meet the pieces one dimension at a time. In each dimension we want the simplest possible solid shape: the one with the fewest
	corners.
</p>

<ul>
	<li>
		In dimension 0, the simplest shape is a single <strong>point</strong>. It has one corner: itself.
	</li>
	<li>
		In dimension 1, it is a <strong>line segment</strong>, an <em>edge</em>, with two corners (its endpoints). One corner is not enough
		to make anything one-dimensional.
	</li>
	<li>
		In dimension 2, it is a filled-in <strong>triangle</strong>, with three corners. Two corners only span a segment; three corners,
		if they are not in a line, span a flat region.
	</li>
	<li>
		In dimension 3, it is a solid <strong>tetrahedron</strong> — a pyramid with a triangular base — with four corners.
	</li>
</ul>

<p>
	The pattern is: <em>a simplest shape of dimension \(n\) has \(n+1\) corners.</em> Each such shape is called a
	<dfn>simplex</dfn> (plural <dfn>simplices</dfn>; the word is Latin for “simple”). A point is a 0-simplex, an edge a 1-simplex, a
	triangle a 2-simplex, a tetrahedron a 3-simplex. The pattern does not stop at three. A 4-simplex has five corners and lives in
	four-dimensional space; we cannot see it, but we can describe it perfectly well, and we can draw its shadow.
</p>

<p>
	There is one catch. Three points in a row do not span a triangle — they span only a segment — and four points lying in one plane do
	not span a tetrahedron. So we insist that the corners are in <dfn>general position</dfn> (mathematicians also say
	<em>affinely independent</em>): no corner lies on the line, plane or flat space passing through the others. With that proviso, the
	corners determine the simplex completely: it is everything you can reach by “filling in” between them.
</p>

<Definition id="def-simplex">
	{#snippet head()}The \(n\)-simplex{/snippet}
	<p>
		Let \(v_0, v_1, \dots, v_n\) be \(n+1\) points in general position in some \(\R^N\). The <strong>\(n\)-simplex</strong> they
		span is the set of all points you can reach by filling in between them — precisely, the points
		\[ t_0 v_0 + t_1 v_1 + \dots + t_n v_n \qquad\text{with every } t_i \ge 0 \text{ and } t_0 + t_1 + \dots + t_n = 1. \]
		The points \(v_i\) are its <strong>vertices</strong> (the corners), and \(n\) is its <strong>dimension</strong>. We name the
		simplex by listing its vertices, \([v_0, v_1, \dots, v_n]\), and use Greek letters such as \(\sigma\) (“sigma”) or \(\tau\)
		(“tau”) for simplices in general.
	</p>
</Definition>

<p>
	Do not worry about the formula with the \(t_i\) yet; the next section is devoted to it. For now, notice the off-by-one that trips
	everybody up at first: an \(n\)-simplex has \(n+1\) vertices. A triangle is two-dimensional but has three corners.
</p>

<h3 id="faces">Faces, and Pascal’s triangle</h3>

<p>
	Look at a tetrahedron. Its boundary is made of four triangles; the triangles meet along six edges; the edges meet at four corners.
	Each of these smaller pieces is itself a simplex, spanned by <em>some</em> of the tetrahedron’s vertices. That is the general
	pattern.
</p>

<Definition id="def-face">
	{#snippet head()}Faces{/snippet}
	<p>
		A <strong>face</strong> of a simplex \(\sigma\) is a simplex spanned by some (at least one) of the vertices of \(\sigma\). A face
		of dimension \(k\) is called a <strong>\(k\)-face</strong>. The simplex counts as a face of itself; the others are its
		<em>proper</em> faces.
	</p>
</Definition>

<p>
	So the faces of a triangle \([v_0, v_1, v_2]\) are its three vertices \([v_0]\), \([v_1]\), \([v_2]\); its three edges \([v_0,
	v_1]\), \([v_0, v_2]\), \([v_1, v_2]\); and the triangle itself. How many \(k\)-faces does an \(n\)-simplex have? A \(k\)-face is
	determined by choosing which \(k+1\) of the \(n+1\) vertices it uses, and every choice works (any vertices of a simplex are in
	general position). So the number of \(k\)-faces is the number of ways to choose \(k+1\) things from \(n+1\):
</p>
\[ \#\{k\text{-faces of an } n\text{-simplex}\} \;=\; \binom{n+1}{k+1}, \]
<p>
	read “\(n+1\) choose \(k+1\)”. For the tetrahedron (\(n = 3\)) this gives \(\binom{4}{1} = 4\) vertices, \(\binom{4}{2} = 6\)
	edges, \(\binom{4}{3} = 4\) triangles and \(\binom{4}{4} = 1\) tetrahedron. These binomial numbers are exactly the entries of
	<em>Pascal’s triangle</em>, in which every number is the sum of the two above it. Counting the single 1 at the top as row 0, row
	\(n+1\) of Pascal’s triangle lists the faces of the \(n\)-simplex, dimension by dimension. Try it in the figure.
</p>

<Figure num="2.5.1" title="The simplices and their faces" hint="Drag to rotate · tap a count or an entry">
	<SimplexGallery />
	{#snippet caption()}
		Choose a simplex \(\Delta^0, \dots, \Delta^4\) below, then a kind of face; the faces light up one at a time while they are
		counted, and the count appears in Pascal’s triangle. (\(\Delta^4\) does not fit in space: what you see is its shadow, and the
		edge through the middle does not really meet the triangle it passes.)
	{/snippet}
</Figure>

<p>
	Adding up a whole row gives the total number of faces. Each vertex is either used or not used — two choices per vertex, \(2^{n+1}\)
	choices in all — but the choice “use nothing” is not a face, so an \(n\)-simplex has \(2^{n+1} - 1\) faces altogether. The
	tetrahedron has \(4 + 6 + 4 + 1 = 15 = 2^4 - 1\).
</p>

<Remark title="The empty face">
	<p>
		Each row of Pascal’s triangle begins with an extra 1, drawn faintly in the figure. It counts the one way of choosing <em>no</em>
		vertices. Some authors include the empty set as a “face of dimension \(-1\)”; it is a useful bookkeeping trick in later chapters
		(reduced homology, in <Ref to="homology/homology-groups" />), but in this chapter faces always have at least one vertex.
	</p>
</Remark>

<Question>
	<p>
		How many edges does a 5-simplex have? How many triangles? (Answer: \(\binom{6}{2} = 15\) edges and \(\binom{6}{3} = 20\)
		triangles — row 6 of Pascal’s triangle is 1, 6, 15, 20, 15, 6, 1.)
	</p>
</Question>

<h2 id="barycentric-coordinates">Barycentric coordinates: an address for every point</h2>

<p>
	Now the formula from the definition. Pick a triangle with corners \(v_0, v_1, v_2\), and imagine hanging weights at the corners: a
	weight \(t_0\) at \(v_0\), \(t_1\) at \(v_1\), \(t_2\) at \(v_2\), with the weights adding up to \(1\). The triangle would balance on
	a pin placed at one particular point — the centre of mass of the weights — and that point is
	\[ p \;=\; t_0 v_0 + t_1 v_1 + t_2 v_2. \]
	(To add points and multiply them by numbers, read each point as its list of coordinates and do the arithmetic coordinate by
	coordinate.) Heavy weight at \(v_0\) pulls the balance point towards \(v_0\); equal weights put it in the middle.
</p>

<p>
	Every point of the triangle arises this way, from exactly one choice of weights. The three numbers \((t_0, t_1, t_2)\) are called
	the <dfn>barycentric coordinates</dfn> of \(p\) (from the Greek <em>barys</em>, heavy: they describe a centre of weight). There is a
	second, purely geometric way to see them: join \(p\) to the three corners, cutting the triangle into three smaller triangles. The
	small triangle <em>opposite</em> \(v_0\) takes up exactly the fraction \(t_0\) of the whole area, and likewise for the others.
</p>

<Figure num="2.5.2" title="Barycentric coordinates" hint="Drag the point · use arrow keys">
	<Barycentric />
	{#snippet caption()}
		Drag \(p\) around. The discs at the corners show the weights \(t_0, t_1, t_2\); the shaded pieces show the same numbers as shares
		of the area. Slide \(p\) onto an edge and the coordinate of the opposite corner becomes \(0\); push it outside and a coordinate
		turns negative.
	{/snippet}
</Figure>

<p>Barycentric coordinates tell you at a glance where a point is.</p>

<ul>
	<li>All three coordinates positive: the point is strictly <em>inside</em> the triangle.</li>
	<li>
		Exactly one coordinate zero, say \(t_2 = 0\): the point lies on the edge \([v_0, v_1]\) opposite \(v_2\). The coordinates that
		are not zero name the face the point lives in.
	</li>
	<li>Two coordinates zero: the point is a corner.</li>
	<li>A negative coordinate: the point is outside the triangle altogether — it is not in the simplex.</li>
</ul>

<p>
	The same works in any dimension: a point of an \(n\)-simplex has \(n+1\) barycentric coordinates, all at least \(0\) and adding up
	to \(1\), and the coordinates that are not zero name the smallest face containing it. The special point where all coordinates are
	equal, \(t_0 = t_1 = \dots = t_n = \tfrac{1}{n+1}\), is the <dfn>barycentre</dfn> of the simplex: the midpoint of an edge, the
	centre of a triangle. It will be the star of the section on subdivision.
</p>

<p>
	Barycentric coordinates also show that all \(n\)-simplices are really the same. Take the \(n+1\) points of \(\R^{n+1}\) with a
	single coordinate equal to \(1\) and the rest \(0\): for \(n = 2\), these are \((1,0,0)\), \((0,1,0)\) and \((0,0,1)\). The simplex
	they span is the <dfn>standard \(n\)-simplex</dfn>
	\[ \Delta^n = \setb{(t_0, \dots, t_n) \in \R^{n+1}}{\text{all } t_i \ge 0,\ \textstyle\sum_i t_i = 1}, \]
	read “the set of all lists \((t_0, \dots, t_n)\) of real numbers such that every \(t_i\) is at least zero and they add up to one”.
	A point of \(\Delta^n\) <em>is</em> its own list of barycentric coordinates. Any other \(n\)-simplex \([v_0, \dots, v_n]\) is a
	copy of it: send \((t_0, \dots, t_n)\) to \(t_0 v_0 + \dots + t_n v_n\). That is why the gallery above could call its shapes
	\(\Delta^0\) to \(\Delta^4\).
</p>

<History title="A geometer’s weights">
	<p>
		Barycentric coordinates were introduced by August Ferdinand Möbius in his book <em>Der barycentrische Calcul</em> (“The
		barycentric calculus”) of 1827 <Cite k="mobius1827" />. His idea was the one we just used: describe a point by the weights
		that, hung at the corners of a fixed triangle, would make it the balance point. It is the same Möbius whose one-sided band you met in
		<Ref to="topology/gluing" />, and, as we shall see in a moment, the first person known to have written down the smallest
		triangulated torus.
	</p>
</History>

<Intuition title="Why simplices, and not balls?">
	<p>
		Up to homeomorphism a simplex is nothing new: it is a ball. Stand at the barycentre and slide every point along its ray from
		there, stretching or shrinking each ray so that the boundary lands on a round sphere; the filled triangle becomes a disk, the
		solid tetrahedron a solid ball. So why build with simplices at all? Look at the boundaries. The boundary of a ball is a sphere,
		which is not a ball, and nothing about it says how to cut it into pieces. The boundary of an \(n\)-simplex comes already cut: it is
		\(n+1\) simplices of dimension \(n-1\), one opposite each vertex, and their boundaries are cut in the same way, all the way down
		to points. Simplices stay simplices when you take boundaries, and that is what will let a whole shape, boundaries and all, be
		written down as a list. (Notice that the boundary of a simplex is <em>several</em> simplices, not one: the hollow tetrahedron is
		a sphere, not a triangle in disguise. The third part of Boarbarktree’s video series <em>You Could Have Invented Homology</em>
		also asks why simplices rather than balls.)
	</p>
</Intuition>

<h2 id="simplicial-complexes">Gluing simplices: the two rules</h2>

<p>
	A single simplex is a rather boring shape: every simplex can be squashed continuously down to a point, so as far as holes are
	concerned it has none. Interesting shapes come from gluing many simplices together — but carefully. We want the gluing to be so
	tidy that knowing <em>which</em> simplices we used tells us everything. Two rules achieve this.
</p>

<Definition id="def-simplicial-complex">
	{#snippet head()}Simplicial complex{/snippet}
	<p>
		A <strong>simplicial complex</strong> \(K\) is a finite collection of simplices (all in the same \(\R^N\)) such that
	</p>
	<ol>
		<li><strong>Rule 1 (faces).</strong> Every face of a simplex in \(K\) is also in \(K\).</li>
		<li>
			<strong>Rule 2 (clean meetings).</strong> Any two simplices of \(K\) either do not meet at all, or meet in a single face that
			is a face of both.
		</li>
	</ol>
</Definition>

<p>
	Rule 1 says the collection is complete: if a triangle is in it, so are its three edges and three vertices. It would be strange to
	have a triangle but not its edges, and the rule forbids it. Rule 2 says that simplices may only touch “corner to corner, edge to
	edge”: two triangles may share a whole edge, or a single vertex, but they may not overlap, cross, or have the corner of one resting
	in the middle of an edge of the other. Here are the possibilities side by side.
</p>

<Figure num="2.5.3" title="Which gluings are allowed?">
	<NonExamples />
	{#snippet caption()}
		The two pictures on top obey both rules. The others each break one: a missing face breaks rule 1; a corner resting on an edge,
		an overlap or a crossing breaks rule 2, because the two pieces meet in something that is not a face of both.
	{/snippet}
</Figure>

<Warning title="“A common face” means a face of both">
	<p>
		In the “corner on an edge” picture the two triangles do meet in a single point, and that point is a vertex — of one of them. Rule
		2 requires more: the meeting must be a face of <em>both</em> simplices. A point in the middle of an edge is not a face of that
		edge (faces are spanned by vertices), so the picture is ruled out. To repair it, add the touching point as a vertex of the long
		edge, splitting it into two edges — and the big triangle into two triangles.
	</p>
</Warning>

<p>
	A little vocabulary, which we will use constantly. The <strong>dimension</strong> of a complex is the largest dimension of its
	simplices: a complex made of edges and vertices is 1-dimensional (a <Term t="graph">graph</Term>, the main character of
	<Ref to="homology/cycles-and-boundaries" />); a surface made of triangles is 2-dimensional. The number of \(k\)-simplices of \(K\) is written \(n_k\), and the list
	\[ (n_0, n_1, n_2, \dots) \]
	is the <dfn>f-vector</dfn> of \(K\): the number of vertices, edges, triangles, and so on. The union of all the simplices — the actual
	set of points in space — is the <dfn>underlying space</dfn> of \(K\), written \(\abs{K}\). A sub-collection that obeys the rules by
	itself is a <dfn>subcomplex</dfn>; the most useful ones are the <dfn>skeletons</dfn>: the <em>\(k\)-skeleton</em> \(K^{(k)}\)
	consists of all simplices of dimension at most \(k\). The 1-skeleton of a hollow tetrahedron is a graph with 4 vertices and 6 edges;
	its 0-skeleton is just its 4 vertices.
</p>

<p>
	Now build some complexes yourself. The figure checks both rules as you go.
</p>

<Figure num="2.5.4" title="Build a simplicial complex" hint="Pick a tool · tap to add · drag to move">
	<ComplexBuilder />
	{#snippet caption()}
		Add vertices, edges and triangles, or drag vertices around. With “fill in missing faces” switched on, rule 1 is enforced for you
		(new edges flash teal); switch it off and missing faces show up as dashed amber lines. Anything that breaks rule 2 is circled in
		rose. Try to make a crossing, then drag a vertex until it disappears.
	{/snippet}
</Figure>

<Question>
	<p>
		In the builder, start from “Corner on an edge” and repair it so that it obeys rule 2. (The quick fix is to drag the corner away.
		The fix that keeps the shape makes the corner a vertex <em>of</em> the long edge: erase that edge, which takes its triangle
		with it, then draw two triangles that each use the corner and fill the gap. The big triangle has become two, as the warning
		above describes.)
	</p>
</Question>

<h2 id="abstract-complexes">Abstract simplicial complexes: shapes as lists</h2>

<p>
	Here is the payoff of the two rules. Because simplices only meet in common faces, and because every simplex is determined by its
	vertices, a simplicial complex is completely described by saying which sets of vertices span simplices. The positions of the
	vertices in space add nothing that topology cares about. So we can throw the positions away.
</p>

<Definition id="def-abstract">
	{#snippet head()}Abstract simplicial complex{/snippet}
	<p>
		An <strong>abstract simplicial complex</strong> is a finite set \(V\) of <em>vertices</em> together with a collection \(K\) of
		non-empty subsets of \(V\), the <em>simplices</em>, such that
	</p>
	<ul>
		<li>every single vertex \(\set{v}\) is in \(K\), and</li>
		<li>every non-empty subset of a simplex in \(K\) is also in \(K\).</li>
	</ul>
	<p>A simplex with \(k+1\) vertices has dimension \(k\).</p>
</Definition>

<p>
	Rule 1 has become the second bullet (“subsets of simplices are simplices”), and rule 2 has disappeared — there is nothing left that
	could overlap or cross, because there are no positions any more. For example, with vertices \(0, 1, 2\), the hollow triangle is the
	list
	\[ K = \Big\{ \set{0}, \set{1}, \set{2}, \set{0,1}, \set{0,2}, \set{1,2} \Big\}, \]
	and the filled triangle is the same list with \(\set{0,1,2}\) added. Since rule 1 fills in all the faces automatically, it is enough
	to list the <dfn>facets</dfn> — the simplices that are not faces of any bigger simplex. The hollow triangle has facets
	\(\set{0,1}, \set{0,2}, \set{1,2}\); the filled triangle has the single facet \(\set{0,1,2}\).
</p>

<KeyIdea>
	<p>
		A shape, for the purposes of topology, can be stored as a short list of vertex sets. This is literally how the math engine
		behind this book stores shapes: the hollow triangle is the list <code>[[0,1],[1,2],[0,2]]</code>, and in
		<Ref to="homology/computing" /> you will type such lists into a homology calculator.
	</p>
</KeyIdea>

<p>
	This is the moment when, in Hermann Weyl’s image at the top of the chapter <Cite k="weyl1939" loc="p. 500" />, the devil of
	algebra gets its foot in the door of topology. A list can be counted, sorted, fed to a computer and turned into matrices — and that is exactly what Part III will do.
	The angel need not worry: we will keep checking that every count means something you can see.
</p>

<p>
	Going back from a list to a shape in space is called <dfn>geometric realisation</dfn>: choose a point for each vertex, and draw the
	simplex spanned by the points of each set in the list. Can that always be done without breaking rule 2? Yes — and there is a simple
	recipe.
</p>

<Theorem title="Every abstract complex can be realised">
	<p>
		Let \(K\) be an abstract simplicial complex with vertices \(v_1, \dots, v_m\). Put vertex \(v_i\) at the point \(e_i\) of
		\(\R^m\) whose \(i\)-th coordinate is \(1\) and all others \(0\), and draw the simplex spanned by each set in \(K\). The result
		is a simplicial complex (it obeys rules 1 and 2) whose simplices correspond exactly to the sets in \(K\). Any two realisations of
		the same abstract complex are homeomorphic.
	</p>
</Theorem>

<p>
	Why does this recipe never create a bad crossing? Points of the drawn simplices can be described by barycentric coordinates: a point
	of the simplex on \(\set{v_1, v_2, v_5}\) is \(t_1 e_1 + t_2 e_2 + t_5 e_5\), whose coordinates in \(\R^m\) are just
	\((t_1, t_2, 0, 0, t_5, 0, \dots)\). So each point of the drawing remembers, in its coordinates, exactly which vertices it uses; two
	simplices can only share points that use vertices common to both, which is to say points of a common face. The price is a lot of
	dimensions — one for every vertex. Far fewer are enough: a complex of dimension \(d\) can always be realised in
	\(\R^{2d+1}\) <Cite k="edelsbrunnerharer2010" loc="ch. III" />. For instance every graph (\(d = 1\)) can be drawn in ordinary space without crossings, even though some graphs cannot
	be drawn in the plane without crossings — a fact we will prove in <Ref to="topology/euler-characteristic" />.
</p>

<p>
	Finally, relabelling the vertices does not change the shape: two abstract complexes are <em>isomorphic</em> if there is a
	one-to-one correspondence between their vertices that matches simplices with simplices. The hollow triangle on \(0, 1, 2\) and the
	one on \(a, b, c\) are isomorphic.
</p>

<Question>
	<p>
		Is \(\Big\{ \set{0,1,2},\allowbreak \set{0,1},\allowbreak \set{1,2},\allowbreak \set{0},\allowbreak \set{1},\allowbreak \set{2} \Big\}\) an abstract simplicial complex? (No: the subset
		\(\set{0,2}\) of the simplex \(\set{0,1,2}\) is missing. Add it and you have the filled triangle.)
	</p>
</Question>

<h2 id="triangulations">Triangulations of familiar shapes</h2>

<p>
	A simplicial complex is only useful to a topologist if it <em>is</em> the shape we care about, up to homeomorphism.
</p>

<Definition id="def-triangulation">
	{#snippet head()}Triangulation{/snippet}
	<p>
		A <strong>triangulation</strong> of a space \(X\) is a simplicial complex \(K\) together with a homeomorphism \(\abs{K} \cong
		X\) between its underlying space and \(X\).
	</p>
</Definition>

<p>
	Let us triangulate the spine examples of this book, starting small.
</p>

<p>
	<strong>The circle.</strong> The hollow triangle — three vertices, three edges — is a circle: inflate it like a balloon, and its
	three straight sides round out into a circle without tearing. Could two vertices do? With two vertices there is only one possible
	edge (an edge is determined by its two endpoints), and one edge is a segment, not a circle. So three vertices is the minimum. This
	“hollow triangle” is the first spine example of the book, and it will reappear in almost every chapter as the simplest shape with a
	hole.
</p>

<p>
	<strong>The disk and the sphere.</strong> The filled triangle is a disk. The hollow tetrahedron — 4 vertices, 6 edges, 4 triangles,
	with no solid interior — is a sphere: imagine a light at its centre projecting each point outward onto a surrounding globe. The
	hollow octahedron (6 vertices, 12 edges, 8 triangles) is another triangulation of the same sphere. One shape, many triangulations:
	that observation will drive the whole of the next chapter.
</p>

<h3 id="torus-grid">The torus, and why a 2 × 2 grid is not enough</h3>

<p>
	In <Ref to="topology/gluing" /> you made a <Term t="torus">torus</Term> from a square by gluing the left side to the right and the
	bottom to the top (the gluing word \(aba^{-1}b^{-1}\)). To triangulate it, cut the square into a grid of little squares and cut
	each little square along a diagonal. After gluing, points on opposite sides of the big square are the same point of the torus, so
	they get the same label.
</p>

<Figure num="2.5.5" title="The square torus, cut into triangles" hint="Hover or tap a label · switch grids">
	<TorusGrid />
	{#snippet caption()}
		Left: the square with its sides glued as the arrows show; a label appears twice (or four times, at the corners) when the gluing
		makes those points one. Right: the same triangles drawn on a torus, where every label appears once. With a \(3 \times 3\) grid
		this is a simplicial complex. Switch to \(2 \times 2\): two <em>different</em> edges (rose and violet) join the same two
		vertices.
	{/snippet}
</Figure>

<p>
	With a \(3 \times 3\) grid we get \(9\) vertices, \(27\) edges (each little square owns its bottom edge, its left edge and its
	diagonal: \(3 \times 9\)) and \(18\) triangles (two per square). Every edge joins its own pair of vertices, and every triangle has
	its own three corners, so the list of vertex sets describes the torus faithfully. This is the second spine example of the book.
</p>

<p>
	A \(2 \times 2\) grid seems simpler, but it fails, and the reason is a counting argument. After gluing it has \(4\) vertices, yet
	it needs \(12\) edges and \(8\) triangles. Four vertices only have \(\binom{4}{2} = 6\) pairs and \(\binom{4}{3} = 4\) triples.
	Twelve edges on six pairs means some pairs of vertices are joined by two different edges — and in a simplicial complex an edge is
	determined by its endpoints, so the list cannot tell those edges apart. Likewise each triple of vertices would have to carry two
	different triangles. The \(2 \times 2\) grid is a perfectly good way to <em>glue</em> a torus, just not a simplicial complex. (We
	will meet a framework that allows it — Δ-complexes — at the end of the chapter.)
</p>

<h3 id="seven-vertex-torus">The smallest torus: seven vertices</h3>

<p>
	Nine vertices is not the record. The torus can be triangulated with just <strong>seven</strong> vertices, \(21\) edges and \(14\)
	triangles, using the triangles
	\[ \set{i,\, i+1,\, i+3} \quad\text{and}\quad \set{i,\, i+2,\, i+3} \qquad\text{for } i = 0, 1, \dots, 6, \]
	where the labels are read modulo 7 (on a 7-hour clock: \(5 + 3 = 1\), as in <Ref to="foundations/equivalence" />). It is found in
	the notes of August Möbius, published after his death <Cite k="lutz2008" />. It has a remarkable property: <em>every</em> pair of its seven vertices is joined by an
	edge, since \(\binom{7}{2} = 21\). And seven is the minimum — you will prove that with the next chapter’s tools.
</p>

<p>
	The easiest way to see it is to tile the whole plane with equilateral triangles and label the lattice point \(a\) steps along one
	direction and \(b\) steps along the other with \((a + 3b) \bmod 7\). The labels repeat, and rolling the plane up so that equal
	labels coincide wraps it exactly once around a torus. Around any point, the six neighbours carry the six other labels — which is
	why every pair of vertices ends up joined.
</p>

<Figure num="2.5.6" title="Seven vertices, every pair joined" hint="Tap a vertex · drag to rotate">
	<MobiusTorus />
	{#snippet caption()}
		Left: the labelled triangular tiling; the 14 shaded triangles form one complete copy of the torus. Tap a vertex: each of its
		copies is joined to the six others. Right: the same seven vertices on a torus in space — or as Császár’s polyhedron, built from
		14 flat triangles with no self-crossings. The counter shows that all 21 pairs are edges.
	{/snippet}
</Figure>

<p>
	Can the seven-vertex torus be built in space from <em>flat</em> triangles and straight edges, without crossing itself? Yes: in 1949
	the Hungarian mathematician Ákos Császár found coordinates for its seven vertices that do it <Cite k="csaszar1949" />, and the
	result is called
	<dfn>Császár’s polyhedron</dfn> — a polyhedron with a hole through it and no diagonals at all, since every pair of corners is
	already joined by an edge. (The coordinates in our figure are those listed by Frank Lutz <Cite k="lutz2008" />, squashed
	vertically to fit the screen — a stretch or squash cannot create crossings — and we checked by computer that no two triangles
	cross.) Its dual, found by Lajos Szilassi in 1977, has seven hexagonal faces, each touching all six others. Colour its faces so
	that neighbours differ and you need seven colours: a map drawn on a torus can need seven colours, not the four that always
	suffice on a sphere.
</p>

<h3 id="projective-plane">The projective plane in six vertices</h3>

<p>
	The <Term t="real-projective-plane">real projective plane</Term> \(\RP^2\) of <Ref to="topology/gluing" /> — a disk whose opposite
	boundary points are glued — has a famous small triangulation too: \(6\) vertices, \(15\) edges and \(10\) triangles. Again
	\(\binom{6}{2} = 15\), so every pair of vertices is an edge. One way to build it is to take a regular icosahedron (20 triangles) and
	glue each point to the diametrically opposite point; that halves everything, so it is also called the <em>hemi-icosahedron</em>.
	Here it is drawn as a disk: one vertex in the middle, and the other five each appearing twice on the boundary circle, at opposite
	points, because opposite points are glued.
</p>

<Figure num="2.5.7" title="ℝP² with six vertices" hint="Tap a vertex">
	<ProjectivePlane6 />
	{#snippet caption()}
		The 6-vertex projective plane. Boundary arcs of the same colour, with matching arrows, are glued. Tap a vertex to light up all its
		copies and edges.
	{/snippet}
</Figure>

<p>
	For the <Term t="klein-bottle">Klein bottle</Term>, seven vertices are not enough. A seven-vertex triangulation of it would also
	have to join every pair of vertices (the next chapter’s counting shows why), and Philip Franklin proved in 1934 that seven
	points cannot all be joined to each other on a Klein bottle without crossings <Cite k="franklin1934" />. Eight vertices is the
	minimum <Cite k="lutz2008" />, and the \(3 \times 3\) grid with one pair of sides glued with a twist gives a simple nine-vertex
	triangulation.
</p>

<Remark title="Can everything be triangulated?">
	<p>
		Every surface can, as Tibor Radó proved in 1925 <Cite k="rado1925" />, and so can every shape in this book. But not every
		space: there are manifolds, in every dimension from four up, that admit no triangulation at all — the last dimensions were
		settled only in 2016 <Cite k="manolescu2016" />. This is one reason later chapters develop homology for spaces that are not
		given to us in pieces.
	</p>
</Remark>

<h2 id="orientation">Orientation: giving simplices a direction</h2>

<p>
	In <Ref to="homology/chains" /> we will add and subtract simplices like numbers. To subtract, you need a sense of direction: walking
	along an edge from \(v_0\) to \(v_1\) should be the opposite of walking from \(v_1\) to \(v_0\). An <em>orientation</em> is that
	sense of direction.
</p>

<p>
	For an edge it is just an arrow. Writing \([v_0, v_1]\) means the edge traversed from \(v_0\) to \(v_1\); writing \([v_1, v_0]\)
	means the same edge traversed backwards, and we will write \([v_1, v_0] = -[v_0, v_1]\).
</p>

<p>
	For a triangle, an orientation is a direction of travel around it. The order \([v_0, v_1, v_2]\) means “go from \(v_0\) to \(v_1\)
	to \(v_2\) and back to \(v_0\)”. Starting the same tour at a different corner — \([v_1, v_2, v_0]\) or \([v_2, v_0, v_1]\) — goes
	round in the same direction, so these three orders give the same orientation. The other three orders, such as \([v_1, v_0, v_2]\),
	go round the other way. In a picture, one orientation is anticlockwise and the other clockwise.
</p>

<p>
	There is a neat way to tell the two kinds of order apart without drawing anything. Starting from \([v_0, v_1, v_2]\), count how many
	swaps of two neighbouring entries it takes to reach the order you have. Rotating, \([v_0, v_1, v_2] \to [v_1, v_0, v_2] \to [v_1,
	v_2, v_0]\), takes two swaps; reversing a pair takes one. An even number of swaps keeps the orientation, an odd number reverses it.
	Different routes to the same order may use different numbers of swaps, but the parity (even or odd) always comes out the same —
	the hint to the exercise “Same orientation or opposite?” below explains why.
</p>

<Definition id="def-orientation">
	{#snippet head()}Orientation of a simplex{/snippet}
	<p>
		Two orderings of the vertices of a simplex are <strong>equivalent</strong> if one can be turned into the other by an even number of
		swaps. An <strong>orientation</strong> of the simplex is a choice of one of the equivalence classes. Every simplex of dimension
		\(\ge 1\) has exactly two orientations; a vertex has only one. An <strong>oriented simplex</strong> is written \([v_0, \dots,
		v_n]\), and the same simplex with the other orientation is written \(-[v_0, \dots, v_n]\).
	</p>
</Definition>

<Figure num="2.5.8" title="Orientations" hint="Press the buttons">
	<Orientation />
	{#snippet caption()}
		Rearrange the vertices of the edge and the triangle. The arrows show the direction each order describes: an even number of swaps
		(gold) keeps the triangle anticlockwise, an odd number (violet) turns it clockwise. Notice that a rotation is two swaps.
	{/snippet}
</Figure>

<p>
	For a tetrahedron \([v_0, v_1, v_2, v_3]\), the two orientations are the two “handednesses” of a screw: curl the fingers of your
	right hand around the face \([v_1, v_2, v_3]\) in the direction \(v_1 \to v_2 \to v_3\); your thumb then points either towards
	\(v_0\) or away from it, and swapping any two vertices switches which. You will not need to picture higher orientations; the
	swap-counting rule handles every dimension at once.
</p>

<Notation title="The book’s convention">
	<p>
		We label vertices by whole numbers and, unless we say otherwise, write every simplex with its labels in increasing order:
		\([0,1]\), \([0,2,5]\), \([1,3,4,6]\). In particular every edge points from its lower label to its higher label. This is the
		orientation the book’s figures and calculators use by default.
	</p>
</Notation>

<p>
	An oriented simplex hands a direction down to its edges. Travelling around \([v_0, v_1, v_2]\) runs along \(v_0 \to v_1\), then
	\(v_1 \to v_2\), then \(v_2 \to v_0\). Two of these agree with the default directions \([v_0, v_1]\) and \([v_1, v_2]\), but the
	third goes against \([v_0, v_2]\). Keeping track of exactly this kind of agreement and disagreement will give the formula
	\[ \partial [v_0, v_1, v_2] \;=\; [v_1, v_2] - [v_0, v_2] + [v_0, v_1] \]
	for the boundary of a triangle in <Ref to="homology/chains" />, the minus sign marking the edge travelled backwards.
</p>

<p>
	Finally, orientations connect to <Term t="orientable">orientability</Term> from <Ref to="topology/manifolds" />. Orient every
	triangle of a triangulated surface. The orientations are <dfn>coherent</dfn> if, wherever two triangles share an edge, they run along
	it in opposite directions. Draw two triangles side by side on paper and orient both anticlockwise: along their shared edge one goes
	up and the other comes down, automatically. Coherence asks for the same thing all over a surface that need not lie flat. A surface
	can be coherently oriented exactly when it is orientable: the torus triangulations above can be, the projective plane cannot. On
	\(\RP^2\), however you orient the ten triangles, somewhere two neighbours will run along their shared edge in the same direction.
</p>

<h2 id="maps-and-subdivision">Simplicial maps and subdivision</h2>

<p>
	Shapes are more interesting with maps between them. Since a simplicial complex is “vertices plus which sets span simplices”, the
	natural maps between complexes send vertices to vertices and respect those sets.
</p>

<Definition id="def-simplicial-map">
	{#snippet head()}Simplicial map{/snippet}
	<p>
		A <strong>simplicial map</strong> \(f\colon K \to L\) is a function from the vertices of \(K\) to the vertices of \(L\) such
		that, whenever \(v_0, \dots, v_k\) span a simplex of \(K\), their images \(f(v_0), \dots, f(v_k)\) span a simplex of \(L\).
		(The images may repeat, so a simplex may be squashed to a smaller one.)
	</p>
</Definition>

<p>
	A simplicial map is really a continuous map in disguise: extend it to every point using barycentric coordinates,
	\[ f\big(t_0 v_0 + \dots + t_k v_k\big) \;=\; t_0\, f(v_0) + \dots + t_k\, f(v_k), \]
	so each simplex is carried straight onto its image, stretching or squashing as needed. Nearby points go to nearby points, so the
	result is continuous.
</p>

<Figure num="2.5.9" title="Simplicial maps" hint="Pick an example · play or scrub the map">
	<SimplicialMap />
	{#snippet caption()}
		Carry each vertex to its image and the edges follow. A hexagon wraps twice around a triangle (its second lap is dashed); a
		triangle collapses onto an edge.
	{/snippet}
</Figure>

<p>
	The “wrap twice” map is a good example to keep in mind: it is the combinatorial version of the map that winds a circle twice around
	another, and in <Ref to="homology/invariance" /> such maps will acquire a <em>degree</em> (here, 2). Simplicial maps are the
	stand-ins for continuous maps throughout the simplicial theory of homology.
</p>

<h3 id="barycentric-subdivision">Barycentric subdivision</h3>

<p>
	Often we want a finer triangulation of the same shape — smaller pieces, more of them. The standard way to get one uses barycentres.
	Put a new vertex at the barycentre of every simplex of \(K\): the old vertices stay, every edge gets its midpoint, every triangle
	its centre, and so on. Then join them up: a set of new vertices spans a new simplex exactly when the old simplices they came from
	are nested, each a face of the next. A new triangle, for example, has corners at the barycentres of a vertex, an edge containing that
	vertex, and a triangle containing that edge — a <em>flag</em> \(v \subset e \subset t\).
</p>

<Figure num="2.5.10" title="Barycentric subdivision" hint="Step forward · hover a small triangle">
	<Subdivision />
	{#snippet caption()}
		A triangle with an edge attached, subdivided once and twice. Each triangle becomes six and each edge two. Hover a small triangle to
		see the flag — vertex, edge, triangle — it was built from. The quantity \(V - E + F\) never changes.
	{/snippet}
</Figure>

<p>
	The result is the <dfn>barycentric subdivision</dfn> \(\operatorname{sd} K\): a new simplicial complex with the same underlying
	space, so it triangulates the same shape. Counting flags tells you how many pieces you get. In a triangle a flag is a choice of a
	vertex (3 ways), then an edge containing it (2 ways), so a triangle splits into \(3 \times 2 = 6\) small triangles; a tetrahedron
	splits into \(4 \times 3 \times 2 = 24\), and an \(n\)-simplex into \((n+1)!\). The subdivided triangle has \(7\) vertices, \(12\)
	edges and \(6\) triangles.
</p>

<p>Subdivision earns its keep in three ways.</p>

<ul>
	<li>It makes pieces as small as we like: each subdivision shrinks every simplex by a definite factor.</li>
	<li>
		It repairs looser gluings: subdividing a Δ-complex (next section) twice always produces an honest simplicial complex
		<Cite k="hatcher2002" loc="§2.1, Exercise 23" />.
	</li>
	<li>
		It lets simplicial maps imitate any continuous map. The <em>simplicial approximation theorem</em> says that any continuous map
		between triangulated spaces can be deformed into a simplicial map, provided the domain is subdivided finely enough
		<Cite k="hatcher2002" loc="Theorem 2C.1" />.
	</li>
</ul>

<p>
	Did you notice the readout in the figure? The f-vector changes from \((4, 4, 1)\) to \((9, 14, 6)\) to \((29, 64, 36)\), yet
	\(V - E + F\) stays at \(1\). Hold that thought for one chapter.
</p>

<h2 id="delta-and-cw">Looser gluings: Δ-complexes and CW complexes</h2>

<p>
	Simplicial complexes are concrete, but they are expensive. The smallest simplicial torus needs \(7\) vertices, \(21\) edges and
	\(14\) triangles — \(42\) simplices — although the gluing square of <Ref to="topology/gluing" /> used a single square. Relax the
	rules a little and the numbers collapse; topologists use two such relaxations all the time.
</p>

<h3 id="delta-complexes">Δ-complexes</h3>

<p>
	A <dfn>Δ-complex</dfn> (“delta complex”) is built from simplices too, but they may be glued more freely: the faces of a single
	simplex may be glued to each other, and several simplices may share exactly the same vertices. The only requirement is that faces
	are glued to faces matching the order of their vertices, so the gluing is still recorded by a finite list of which face goes where.
	The \(2 \times 2\) grid torus, illegal before, is a perfectly good Δ-complex — and so is something much smaller.
</p>

<Figure num="2.5.11" title="Three Δ-complexes">
	<DeltaComplexes />
	{#snippet caption()}
		Not simplicial complexes, but legitimate Δ-complexes. A circle from one edge whose two ends are the same vertex. A sphere from two
		triangles glued along their whole boundaries, so they have the same three corners. A torus from two triangles \(U\) and \(L\): the
		square cut by one diagonal \(c\), with all four corners glued into one vertex.
	{/snippet}
</Figure>

<p>
	The two-triangle torus has \(1\) vertex, \(3\) edges and \(2\) triangles. Hatcher’s standard textbook computes the homology of the
	torus with exactly these six pieces <Cite k="hatcher2002" loc="§2.1, Example 2.3" />, and everything in Part III works for
	Δ-complexes as well as for simplicial complexes.
</p>

<h3 id="cw-complexes">CW complexes</h3>

<p>
	The second relaxation goes further: drop the triangles altogether and build with <em>cells</em>. An \(n\)-cell is an
	\(n\)-dimensional disk: a 0-cell is a point, a 1-cell an arc (an open interval), a 2-cell an open disk, a 3-cell an open ball. We
	build a space in stages, one dimension at a time.
</p>

<ol>
	<li>Start with some points: the 0-cells.</li>
	<li>Attach 1-cells: take arcs, and glue the two ends of each arc to points already there.</li>
	<li>
		Attach 2-cells: take disks, and glue the boundary circle of each disk to the part already built, by a continuous map called its
		<dfn>attaching map</dfn>. The inside of the disk stays as it was.
	</li>
	<li>And so on in higher dimensions, gluing the boundary sphere of each \(n\)-ball to what has been built so far.</li>
</ol>

<p>
	The result is a <dfn>CW complex</dfn>. (The letters stand for two technical conditions, “closure-finite” and “weak topology”,
	from J. H. C. Whitehead’s original definition of 1949 <Cite k="whitehead1949" />; Hatcher explains them in an appendix
	<Cite k="hatcher2002" loc="Appendix, p. 520" />. For the finite complexes in this book both hold automatically.) The space built after the
	\(k\)-th stage is the <em>\(k\)-skeleton</em>, just as for simplicial complexes. Let us see how few cells our favourite shapes need.
</p>

<ul>
	<li>
		<strong>Circle:</strong> one point and one arc, with both ends of the arc glued to the point.
	</li>
	<li>
		<strong>Sphere:</strong> one point and one disk, with the <em>whole</em> boundary circle of the disk glued to the point — like
		pulling the drawstring of a bag tight. No edges at all.
	</li>
	<li>
		<strong>Torus:</strong> one point \(v\); two loops \(a\) and \(b\) attached at \(v\); and one disk, attached along the loop that runs
		around \(a\), then \(b\), then \(a\) backwards, then \(b\) backwards — the gluing word \(aba^{-1}b^{-1}\) of the square, read as
		an instruction for the disk’s edge. That is \(1 + 2 + 1 = 4\) cells instead of \(42\) simplices.
	</li>
	<li>
		<strong>Projective plane:</strong> one point, one loop \(a\), and one disk attached along \(aa\) (the edge goes round the loop
		twice). <strong>Klein bottle:</strong> one point, two loops, and a disk attached along \(abab^{-1}\).
	</li>
</ul>

<Figure num="2.5.12" title="Building a torus from cells" hint="Step through · drag to rotate">
	<CWBuild />
	{#snippet caption()}
		Step through the construction. A single point; a gold loop \(a\) and a teal loop \(b\), both attached at it; then a disk whose edge
		is glued along \(a\), \(b\), \(a^{-1}\), \(b^{-1}\) — watch it grow from the far side until it closes up on the two loops, then
		follow the glowing point around its rim. Switch to the sphere to see a disk closing up like a drawstring bag.
	{/snippet}
</Figure>

<Intuition title="Why cells are efficient">
	<p>
		A simplicial complex must spell out every little triangle; a CW complex only records what is topologically essential — here a point,
		two independent loops and one sheet of surface. Every simplicial complex and every Δ-complex is also a CW complex (its cells are
		the open simplices), so nothing is lost by switching. Homology computed from cells, in <Ref to="homology/exact-sequences" />, is
		usually the quickest way to compute it by hand.
	</p>
</Intuition>

<Warning title="Cells are not glued along faces">
	<p>
		The boundary of a cell can be glued on in a very crumpled way: the sphere’s single disk has its entire boundary circle crushed to one
		point, and the projective plane’s disk wraps its edge twice around one loop. That flexibility is what makes CW complexes small —
		and it is also why they cannot be stored as a plain list of vertex sets. For computations we will need to record, for each cell,
		how its attaching map runs over the cells below it.
	</p>
</Warning>

<p>
	Here is something to wonder about before the next chapter. Count the pieces of each torus we have built, alternating signs by
	dimension:
	\[ 9 - 27 + 18 \;=\; 7 - 21 + 14 \;=\; 1 - 3 + 2 \;=\; 1 - 2 + 1 \;=\; 0. \]
	Four very different ways of cutting up a torus, and the same answer every time. The sphere gives \(4 - 6 + 4 = 6 - 12 + 8 = 1 - 0 +
	1 = 2\). Coincidence? <Ref to="topology/euler-characteristic" /> explains.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise title="Faces of the 4-simplex" level={1}>
	<p>
		How many vertices, edges, triangles, tetrahedra and 4-simplices does the 4-simplex \(\Delta^4\) have? Check that the total is
		\(2^5 - 1\).
	</p>
	{#snippet hint()}
		<p>Use row 5 of Pascal’s triangle, or count how to choose \(k+1\) of the 5 vertices.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			\(\binom{5}{1} = 5\) vertices, \(\binom{5}{2} = 10\) edges, \(\binom{5}{3} = 10\) triangles, \(\binom{5}{4} = 5\) tetrahedra and
			\(\binom{5}{5} = 1\) four-simplex. Total \(5 + 10 + 10 + 5 + 1 = 31 = 2^5 - 1\): each of the 5 vertices is in or out
			(\(2^5\) ways), minus the empty choice.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Lists or not?" level={1}>
	<p>Which of these are abstract simplicial complexes? Describe the shape of those that are.</p>
	<ol>
		<li>\(\set{0},\allowbreak \set{1},\allowbreak \set{2},\allowbreak \set{0,1},\allowbreak \set{1,2}\)</li>
		<li>\(\set{0},\allowbreak \set{1},\allowbreak \set{0,1},\allowbreak \set{0,2},\allowbreak \set{1,2},\allowbreak \set{0,1,2}\)</li>
		<li>\(\set{0},\allowbreak \set{1},\allowbreak \set{2},\allowbreak \set{3},\allowbreak \set{0,1},\allowbreak \set{0,2},\allowbreak \set{1,2},\allowbreak \set{0,1,2}\)</li>
	</ol>
	{#snippet solution()}
		<ol>
			<li>Yes: a path of two edges, \(0 - 1 - 2\). (Shape: an interval.)</li>
			<li>No: \(\set{2}\) is a subset of \(\set{0,2}\) (and of \(\set{0,1,2}\)) but is missing.</li>
			<li>Yes: a filled triangle on \(0,1,2\), plus a separate point \(3\). (Shape: a disk and a point — two pieces.)</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise title="Reading barycentric coordinates" level={1}>
	<p>
		In the triangle \([v_0, v_1, v_2]\), where are the points with barycentric coordinates \((\tfrac12, \tfrac12, 0)\), \((0, 0, 1)\),
		\((\tfrac13, \tfrac13, \tfrac13)\) and \((\tfrac12, \tfrac14, \tfrac14)\)? Is \((\tfrac12, \tfrac34, -\tfrac14)\) in the
		triangle?
	</p>
	{#snippet solution()}
		<p>
			\((\tfrac12, \tfrac12, 0)\) is the midpoint of the edge \([v_0, v_1]\). \((0,0,1)\) is the vertex \(v_2\). \((\tfrac13, \tfrac13,
			\tfrac13)\) is the barycentre, the centre of the triangle. \((\tfrac12, \tfrac14, \tfrac14)\) is inside the triangle (all
			positive), closer to \(v_0\) than to the other corners — in fact halfway between \(v_0\) and the midpoint of \([v_1, v_2]\). The
			last point has a negative coordinate, so it lies outside the triangle (beyond the edge \([v_0, v_1]\)), although its coordinates
			still add up to 1.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Grids on the torus" level={2}>
	<p>
		(a) In the \(2 \times 2\) grid on the square torus, find two different edges with the same two endpoints. (b) What goes wrong with a
		\(1 \times 1\) grid (the square cut by one diagonal)? (c) Show that an \(n \times n\) grid has \(n^2\) vertices, \(3n^2\) edges
		and \(2n^2\) triangles after gluing.
	</p>
	{#snippet hint()}
		<p>Use the labels of the figure: the vertex in column \(i\), row \(j\) is \(i + nj\), reading \(i\) and \(j\) modulo \(n\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) With labels \(0, 1\) on the bottom row (and \(2, 3\) above), the bottom edge of the left square runs from \(0\) to \(1\),
			and the bottom edge of the right square runs from \(1\) to the corner, which is glued to \(0\). Two different edges, both joining
			\(0\) and \(1\). (b) With a \(1 \times 1\) grid all four corners are the same vertex, so every edge — the sides \(a\), \(b\) and the
			diagonal — starts and ends at that one vertex, which no simplex can do, and the two triangles have the “same” three corners. (It
			is the two-triangle Δ-complex torus.) (c) Each of the \(n^2\) small squares contributes its bottom-left corner, three edges
			(bottom, left, diagonal) and two triangles, and after gluing every vertex, edge and triangle is counted exactly once.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Same orientation or opposite?" level={2}>
	<p>
		Which of these orders give the same orientation as \([0,1,2]\): \([2,0,1]\), \([1,0,2]\), \([2,1,0]\)? Which give the same
		orientation as the tetrahedron \([0,1,2,3]\): \([1,0,3,2]\), \([1,2,3,0]\), \([3,2,1,0]\)?
	</p>
	{#snippet hint()}
		<p>
			Count the pairs that are “out of order” (a larger label before a smaller one). Each swap of neighbours changes that count by one,
			so its parity is the parity of the number of swaps.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			For the triangle: \([2,0,1]\) has 2 out-of-order pairs (2 before 0, 2 before 1): same orientation. \([1,0,2]\) has 1: opposite.
			\([2,1,0]\) has 3: opposite. For the tetrahedron: \([1,0,3,2]\) has 2: same. \([1,2,3,0]\) has 3 (each of 1, 2, 3 before 0):
			opposite. \([3,2,1,0]\) has all 6 pairs out of order: same. (Note that a “rotation” of four labels is three swaps, so unlike for a
			triangle it reverses the orientation.)
		</p>
	{/snippet}
</Exercise>

<Exercise title="Subdividing a tetrahedron" level={2}>
	<p>
		Find the f-vector \((n_0, n_1, n_2, n_3)\) of the barycentric subdivision of a solid tetrahedron, and compute \(n_0 - n_1 + n_2 -
		n_3\).
	</p>
	{#snippet hint()}
		<p>
			New vertices are the 15 faces of the tetrahedron. A new edge is a pair “face inside a bigger face”; a new tetrahedron is a full
			flag \(v \subset e \subset t \subset T\).
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Vertices: one per face, \(4 + 6 + 4 + 1 = 15\). Edges: one per pair \(\sigma \subsetneq \tau\) of faces; a face with \(m\)
			vertices has \(2^m - 2\) proper faces, so the count is \(6 \cdot 2 + 4 \cdot 6 + 1 \cdot 14 = 50\). Tetrahedra: one per full flag
			\(v \subset e \subset t \subset T\), so \(4 \times 3 \times 2 = 24\). Triangles: one per flag with one step missing. Missing
			\(T\): \(v \subset e \subset t\), \(4 \cdot 3 \cdot 2 = 24\). Missing \(t\): \(v \subset e \subset T\), \(4 \cdot 3 = 12\).
			Missing \(e\): \(v \subset t \subset T\), \(4 \cdot 3 = 12\). Missing \(v\): \(e \subset t \subset T\), \(6 \cdot 2 = 12\).
			That is \(60\) in all. So the f-vector is \((15, 50, 60, 24)\) and \(15 - 50 + 60 - 24 = 1\) — the same as for the tetrahedron
			itself, \(4 - 6 + 4 - 1 = 1\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="Cell counts" level={3}>
	<p>
		Describe CW structures, with as few cells as you can, for (a) the Klein bottle, (b) the projective plane, and (c) the sphere using
		two points, two arcs and two disks. In each case compute \(c_0 - c_1 + c_2\), where \(c_k\) is the number of \(k\)-cells.
	</p>
	{#snippet solution()}
		<p>
			(a) One point, two loops \(a, b\), one disk attached along \(abab^{-1}\): \(1 - 2 + 1 = 0\). (b) One point, one loop \(a\), one
			disk attached along \(aa\): \(1 - 1 + 1 = 1\). (c) Two points on the equator, the two arcs of the equator between them, and the
			northern and southern hemispheres as two disks, each attached along the whole equator: \(2 - 2 + 2 = 2\). Compare with the
			single-point-and-disk structure, \(1 - 0 + 1 = 2\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="How few vertices?" level={3}>
	<p>
		Show that a simplicial complex homeomorphic to a circle needs at least 3 vertices, and one homeomorphic to a sphere needs at least
		4.
	</p>
	{#snippet hint()}
		<p>
			With 3 vertices, how many different triangles can there be? Can a single triangle, possibly with extra edges, be a sphere?
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			<em>Circle.</em> With 1 vertex there are no edges at all; with 2 vertices there is at most one edge (an edge is determined by its
			endpoints). So the complex is a point, two points, or a segment — never a circle. Three vertices suffice: the hollow triangle.
		</p>
		<p>
			<em>Sphere.</em> A sphere is two-dimensional, so the complex must contain a triangle. (That a one-dimensional complex — a graph —
			cannot be homeomorphic to a sphere is believable, and it is proved properly in <Ref to="homology/invariance" />.) With only 3
			vertices there is at most one triangle, \(\set{0,1,2}\), and rule 1 forces in its edges and vertices: the complex is a filled
			triangle, which is a disk. But a disk has a rim — the points in the middle of its three edges sit on the edge of the shape, with
			surface on one side only — while a sphere has no rim anywhere. So at least 4 vertices are needed, and the hollow tetrahedron shows
			that 4 suffice.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			An \(n\)-simplex is the filled-in shape spanned by \(n+1\) points in general position: point, edge, triangle, tetrahedron, ….
			It has \(\binom{n+1}{k+1}\) faces of dimension \(k\) — row \(n+1\) of Pascal’s triangle.
		</li>
		<li>
			Barycentric coordinates \((t_0, \dots, t_n)\), all \(\ge 0\) and adding to \(1\), locate every point of a simplex; the non-zero
			ones name the face it lies in. The standard simplex \(\Delta^n\) is the set of all such lists.
		</li>
		<li>
			A simplicial complex is a collection of simplices closed under taking faces (rule 1) in which any two meet in a common face or not
			at all (rule 2). Its f-vector \((n_0, n_1, n_2, \dots)\) counts simplices by dimension.
		</li>
		<li>
			An abstract simplicial complex is just a list of vertex sets closed under taking subsets; every one can be realised in space.
			For topology, the list <em>is</em> the shape.
		</li>
		<li>
			Triangulations: the hollow triangle (circle), hollow tetrahedron (sphere), the \(3 \times 3\) grid torus (the \(2 \times 2\)
			grid fails), Möbius’s 7-vertex torus and Császár’s polyhedron, the 6-vertex projective plane.
		</li>
		<li>
			An orientation is an ordering of the vertices up to an even number of swaps; each simplex has two. Default: increasing labels.
		</li>
		<li>
			Simplicial maps send simplices to simplices; barycentric subdivision refines a complex without changing its shape.
		</li>
		<li>
			Δ-complexes and CW complexes glue more freely and need far fewer pieces: the torus is 1 point, 2 loops and 1 disk attached along
			\(aba^{-1}b^{-1}\).
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
