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
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import GenusSurfaces from '$lib/figures/topology/manifolds/GenusSurfaces.svelte';
	import SphereCharts from '$lib/figures/topology/manifolds/SphereCharts.svelte';
	import LinkProbe from '$lib/figures/topology/manifolds/LinkProbe.svelte';
	import OrientationWalk from '$lib/figures/topology/manifolds/OrientationWalk.svelte';
	import TangentPlane from '$lib/figures/topology/manifolds/TangentPlane.svelte';
	import ConnectedSum from '$lib/figures/topology/manifolds/ConnectedSum.svelte';
	import StereoCircle from '$lib/figures/topology/manifolds/StereoCircle.svelte';
	import BoundaryChart from '$lib/figures/topology/manifolds/BoundaryChart.svelte';
	import TwoOrigins from '$lib/figures/topology/manifolds/TwoOrigins.svelte';
	import PlaneOrientation from '$lib/figures/topology/manifolds/PlaneOrientation.svelte';

	const reading = [
		{
			title: 'The Shape of Space',
			author: 'Jeffrey Weeks',
			note: 'The friendliest book about surfaces and 3-manifolds ever written. Flatlanders explore tori, Klein bottles and projective planes from the inside — exactly the ant’s-eye view of this chapter. No prerequisites.',
			kind: 'book' as const
		},
		{
			title: 'Torus Games',
			author: 'Jeffrey Weeks',
			url: 'https://www.geometrygames.org/TorusGames/index.html.en',
			note: 'Play chess, mazes and jigsaws on a torus and a Klein bottle, and feel the difference between them with your hands. Free.',
			kind: 'interactive' as const,
			free: true
		},
		{
			title: 'Conway’s ZIP Proof',
			author: 'George K. Francis and Jeffrey R. Weeks',
			url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/francisweeks.pdf',
			note: 'A short, picture-filled proof of the classification of surfaces (American Mathematical Monthly, 1999). Read it after this chapter.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Introduction to Topological Manifolds',
			author: 'John M. Lee',
			note: 'The standard graduate textbook: careful definitions, the classification of surfaces with full proofs, and a gentle path into homology. Its sequel, Introduction to Smooth Manifolds, does the same for tangent spaces and forms.',
			kind: 'book' as const
		},
		{
			title: 'Differentiable Manifolds (lecture notes)',
			author: 'Nigel Hitchin',
			url: 'https://people.maths.ox.ac.uk/~joyce/Nairobi2019/Hitchin-DifferentiableManifolds.pdf',
			note: 'Oxford lecture notes that go from charts and atlases to tangent bundles, differential forms and de Rham cohomology in about a hundred pages.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'On the Hypotheses which lie at the Bases of Geometry',
			author: 'Bernhard Riemann, translated by W. K. Clifford',
			url: 'https://www.emis.de/classics/Riemann/WKCGeom.pdf',
			note: 'The 1854 lecture in which manifolds were born, in Clifford’s translation of 1873. Ten pages, almost without formulas.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'This open problem taught me what topology is',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/inscribed-rect-v2/',
			note: 'A beautiful animated lesson in which a Möbius band, and the fact that it cannot sit in space in a certain way, solves a geometry puzzle.',
			kind: 'video' as const,
			free: true
		}
	];
</script>

<Epigraph author="Bernhard Riemann" source="On the Hypotheses which lie at the Bases of Geometry (1854), translated by W. K. Clifford (1873)"
	>…the specialisations passed over form a simply extended manifoldness, whose true character is that in it a continuous progress from a
	point is possible only on two sides, forwards or backwards.</Epigraph
>

<p class="lead">
	Stand in a field and the Earth looks flat: as far as you can tell, the ground around you is a piece of a plane. Many early cultures
	pictured the world that way, and it took careful reasoning to see past it — Aristotle noticed that the shadow the Earth casts on the
	Moon during an eclipse is always round — before people understood that the whole thing curves round and closes up into a ball. This chapter is about spaces with exactly that property: every small piece looks
	like flat space, while the whole may be curved, twisted or closed up in surprising ways. They are called <em>manifolds</em>. Spheres,
	tori, Klein bottles, the space we live in and the spacetime of relativity are all manifolds, and they are the natural home of homology
	and cohomology.
</p>

<p>
	We will make “looks flat up close” precise, and learn how mathematicians describe a curved space by a collection of flat maps, the way
	cartographers describe the Earth with an atlas. Along the way we meet three new ideas — edges, tangent planes, and orientation, the
	question of whether “clockwise” makes sense on a surface — and we finish with one of the jewels of topology: a complete list of all
	closed surfaces.
</p>

<Ahead>
	<p>
		Manifolds are where the theory in this book is at its most beautiful. The boundary operator \(\partial\) of homology (<Ref
			to="homology/chains"
		/>) is a combinatorial shadow of the boundary of a manifold, and its basic law \(\partial\partial = 0\) echoes this chapter's slogan
		“a boundary has no boundary”. Orientation decides whether the top homology group of a closed surface is \(\Z\) or \(0\) (<Ref
			to="homology/computing"
		/>). Differential forms and de Rham cohomology (<Ref to="cohomology/differential-forms" />, <Ref to="cohomology/de-rham" />) live on
		the smooth manifolds and tangent spaces built here. Poincaré duality (<Ref to="cohomology/poincare-duality" />) is a symmetry that
		only closed manifolds possess. And the classification of surfaces gives us a complete catalogue of two-dimensional test cases, on
		which homology will rediscover the classification all by itself.
	</p>
</Ahead>

<h2 id="looking-flat">Spaces that look flat up close</h2>

<p>
	Start with the flat spaces themselves. The line \(\R\) is the set of real numbers. The plane \(\R^2\) is the set of pairs \((x, y)\) of
	real numbers, and ordinary space \(\R^3\) is the set of triples \((x, y, z)\). In general, \(\R^n\) (read “R n”) is the set of lists
	\((x_1, x_2, \dots, x_n)\) of \(n\) real numbers, with the usual distance between two lists,
	\(\sqrt{(x_1 - y_1)^2 + \dots + (x_n - y_n)^2}\). We call it <dfn>\(n\)-dimensional Euclidean space</dfn>, after Euclid, whose
	geometry it is. Nobody can picture \(\R^4\), but every question about it is a question about lists of four numbers, and that is enough
	to do mathematics there.
</p>

<p>
	A manifold of dimension \(n\) is a space in which every point has a small neighbourhood that looks like \(\R^n\) — not in size or
	shape, but up to <Term t="homeomorphism">homeomorphism</Term> (<Ref to="topology/spaces" />): a rubber-sheet copy. The surface of the
	Earth is a 2-dimensional manifold, because around each point there is a patch that can be flattened onto a piece of the plane without
	tearing. A circle is a 1-dimensional manifold: magnify any point and you see a short arc, which straightens out into an interval of the
	line.
</p>

<Intuition title="The ant’s-eye view">
	<p>
		Imagine a tiny ant living <em>in</em> a surface, who can see only a little way around itself. On a sphere, a torus or a Klein bottle,
		the ant's world looks like a flat plane in every direction; only by going on long journeys can it discover the global shape. This
		view from the inside is the point of view of manifold theory. The definition will talk only about small neighbourhoods, and it will
		never mention a bigger space in which the manifold might sit.
	</p>
</Intuition>

<p>
	“Small neighbourhood” sounds like a weakening, but in topology small pieces are as good as big ones. The open interval
	\((-1, 1)\) and the whole line are homeomorphic: the map \(t \mapsto t/(1 - \abs{t})\) stretches the interval over the entire line,
	pushing the two ends off to infinity, and \(s \mapsto s/(1 + \abs{s})\) undoes it. In the same way \(x \mapsto x/(1 - \abs{x})\) is a
	homeomorphism from the open unit ball of \(\R^n\) onto all of \(\R^n\), where \(\abs{x}\) is the distance from \(x\) to the origin.
	So “every point has a neighbourhood homeomorphic to \(\R^n\)”, “… to an open ball in \(\R^n\)” and “… to an open subset of
	\(\R^n\)” all say the same thing.
</p>

<h3 id="small-sphere-test">The small-sphere test</h3>

<p>
	Which spaces are <em>not</em> manifolds? Here is a test you can do by eye. Put a small sphere around a point \(p\) and look at where it
	meets the space, like a radar picture of the neighbourhood of \(p\). If \(p\) lies on a curve, the small sphere meets the curve in two
	points, one on each side — Riemann's “forwards or backwards”. If \(p\) lies in the middle of a surface, the sphere meets it in a closed
	loop: a circle's worth of directions in which you can walk away from \(p\). Any other answer is a warning sign.
</p>

<Figure size="wide" num="2.4.1" title="The small-sphere test" hint="Pick a space · click it to move the probe · resize the sphere">
	<LinkProbe />
	{#snippet caption()}
		A glass probe sphere around a point, and in teal the set where it meets the shape. Ordinary points of a curve give two points;
		ordinary points of a surface give one circle. The crossing of the figure eight, the tip of the double cone and the line where two
		planes cross give something else however small the sphere, so these spaces are not manifolds. The tip of a single cone passes:
		topologically it is an ordinary point. Points on the rim of the disk give an arc, the mark of a boundary point.
	{/snippet}
</Figure>

<p>
	The small-sphere picture depends on how the space sits in \(\R^3\), so it is a guide rather than a proof. To prove that a point is
	special we use something homeomorphisms must preserve. The simplest such thing is the number of pieces a space falls into when you
	remove a point, which you met as <Term t="cut-point">cut points</Term> in <Ref to="topology/spaces" />.
</p>

<Proposition title="Two spaces that are not manifolds">
	<p>
		The figure eight is not a 1-manifold, and the double cone \(\setb{(x, y, z)}{z^2 = x^2 + y^2}\) is not a 2-manifold.
	</p>
</Proposition>

<Proof>
	<p>
		Let \(x\) be the crossing point of the figure eight, and suppose some neighbourhood \(U\) of \(x\) were homeomorphic to an open
		interval, by a homeomorphism \(h\). Near \(x\) the figure eight looks like the letter X, so inside \(U\) we can find a smaller open
		neighbourhood \(V\) of \(x\) shaped like an X: four short arms meeting at \(x\). Its image \(h(V)\) is an open, connected piece of the
		interval containing \(h(x)\), so it is itself an open interval. Now remove the middle points. \(V\) minus \(x\) falls into four pieces,
		the four arms; an open interval minus one of its points falls into two. But \(h\) restricts to a homeomorphism between these two
		spaces, and homeomorphic spaces have the same number of pieces. Four is not two, so no such \(h\) exists.
	</p>
	<p>
		The double cone works the same way. A small neighbourhood of the tip, minus the tip, falls into two pieces, the upper and the lower
		cone. A connected open piece of the plane minus one point stays connected, because a path can always walk around the missing point.
		Two is not one.
	</p>
</Proof>

<p>
	For two planes crossing along a line the cut-point trick is too weak: remove a point of the crossing line and what is left is still in
	one piece. The small-sphere picture — two circles that cross, instead of one circle — is the right instinct, and in
	<Ref to="homology/invariance" /> a tool called local homology turns that instinct into a proof.
</p>

<Warning title="Corners are invisible">
	<p>
		The tip of a single cone passes the test. Squash the cone flat, by projecting it straight down onto the plane, and it becomes a disk,
		tip and all. In the same way the surface of a cube is homeomorphic to a sphere: blow it up like a balloon. Topology cannot see corners
		or creases. Whether a point is <em>sharp</em> is a question about smoothness, which we take up later in this chapter.
	</p>
</Warning>

<h2 id="definition">The definition of a manifold</h2>

<p>
	Here is the official definition. The first condition is the one we have been discussing; the other two are housekeeping, which rule
	out pathological spaces that nobody wants to call manifolds.
</p>

<Definition title="Manifold" id="def-manifold">
	<p>A <dfn>manifold of dimension \(n\)</dfn>, or <dfn>\(n\)-manifold</dfn>, is a topological space \(M\) such that:</p>
	<ol>
		<li>
			\(M\) is <dfn>locally Euclidean</dfn> of dimension \(n\): every point \(p \in M\) has an open
			<Term t="neighbourhood">neighbourhood</Term> \(U\) that is homeomorphic to an open subset of \(\R^n\);
		</li>
		<li>\(M\) is <Term t="hausdorff">Hausdorff</Term>: any two distinct points have disjoint open neighbourhoods;</li>
		<li>\(M\) is <dfn>second countable</dfn>: it can be covered by countably many neighbourhoods \(U\) as in condition 1.</li>
	</ol>
	<p>A 2-manifold is called a <dfn>surface</dfn>, and a 1-manifold a <dfn>curve</dfn>.</p>
</Definition>

<p>
	Condition 1 is the heart of the matter. Condition 2 rules out a strange creature that you met while gluing spaces in
	<Ref to="topology/gluing" />.
</p>

<Figure size="wide" num="2.4.2" title="The line with two origins">
	<TwoOrigins />
	{#snippet caption()}
		Take two copies of \(\R\) and glue each point \(x \neq 0\) of the first to the same point of the second, leaving the two zeros
		unglued. Each origin has neighbourhoods that are open intervals (\(U_1\) in gold, \(U_2\) in teal), so the space is locally
		Euclidean. But any neighbourhood of \(0_1\) meets any neighbourhood of \(0_2\): they cannot be separated.
	{/snippet}
</Figure>

<Warning title="Locally Euclidean is not enough">
	<p>
		The line with two origins passes condition 1 at every point, but fails condition 2. One symptom: the sequence \(1, \tfrac12,
		\tfrac13, \dots\) converges to <em>both</em> origins at once, since every neighbourhood of either origin contains all but finitely
		many of its terms. In a Hausdorff space a sequence has at most one limit, and calculus would be a mess without that. So we insist on
		it.
	</p>
</Warning>

<Remark title="Why second countable?">
	<p>
		Condition 3 says the manifold is not too big. (The usual definition says that \(M\) has a countable collection of open sets from
		which every open set can be built as a union; for locally Euclidean spaces this is the same as our version.) It excludes monsters
		such as the <em>long line</em>, made by laying uncountably many intervals end to end: near each point it looks like \(\R\), but it is
		far too long to be covered by countably many intervals. Every subspace of some \(\R^N\) is automatically Hausdorff and second
		countable, so for nearly every example in this book conditions 2 and 3 come for free.
	</p>
</Remark>

<p>
	Could a space be a 2-manifold and a 3-manifold at the same time? Intuition says no — a sheet of paper is not a block of wood — but
	remember that continuous maps can do wild things: Giuseppe Peano found in 1890 a continuous map from an interval <em>onto</em> a whole
	square. The reassuring answer is a famous theorem.
</p>

<Theorem label="Theorem (invariance of dimension)" id="thm-invariance-of-dimension">
	<p>
		If a nonempty open subset of \(\R^m\) is homeomorphic to an open subset of \(\R^n\), then \(m = n\). Consequently every nonempty
		manifold has a well-defined dimension.
	</p>
</Theorem>

<p>
	L. E. J. Brouwer proved this in 1911. It is surprisingly hard to prove from scratch, and becomes easy with homology: we will prove it in
	<Ref to="homology/invariance" />.
</p>

<Example title="Manifolds in every dimension">
	<ul>
		<li>
			<strong>Dimension 0.</strong> Any set of isolated points: each point is its own neighbourhood, and \(\R^0\) is a single point.
		</li>
		<li>
			<strong>Dimension 1.</strong> The line, any open interval, the circle \(S^1\). In fact every connected 1-manifold is homeomorphic
			either to \(\R\) or, if it is compact, to \(S^1\).
		</li>
		<li>
			<strong>Dimension 2.</strong> The plane, the open disk, the <Term t="sphere">sphere</Term> \(S^2\), the
			<Term t="torus">torus</Term> \(T^2\), and the <Term t="klein-bottle">Klein bottle</Term> \(K\) and the
			<Term t="real-projective-plane">projective plane</Term> \(\RP^2\), which <Ref to="topology/gluing" /> built abstractly by gluing.
			The definition never asks a manifold to sit inside \(\R^3\), so the Klein bottle's difficulties with ordinary space are no obstacle.
		</li>
		<li>
			<strong>Dimension 3.</strong> Ordinary space \(\R^3\); the 3-sphere \(S^3\), the points of \(\R^4\) at distance 1 from the
			origin; the 3-torus, a cube whose opposite faces are glued, so that leaving through one wall brings you back through the opposite
			one — the world of old video games, upgraded to three dimensions.
		</li>
		<li><strong>Dimension 4.</strong> The spacetime of general relativity: three dimensions of space and one of time.</li>
	</ul>
</Example>

<p>
	Two constructions make new manifolds from old. An <Term t="open-set">open subset</Term> of an \(n\)-manifold is again an
	\(n\)-manifold: just shrink the neighbourhoods. And the product \(M \times N\) of an \(m\)-manifold and an \(n\)-manifold is an
	\((m+n)\)-manifold, because a product of an open ball in \(\R^m\) with one in \(\R^n\) is an open subset of \(\R^{m+n}\). The torus is
	the product \(S^1 \times S^1\). Manifolds also arise as spaces of <em>states</em>, just as Riemann foresaw: the two angles of a double
	pendulum can each be anything on a circle, so the positions of the pendulum form a torus.
</p>

<Question>
	<p>
		Which capital letters, drawn as thin curves in a plain font, are 1-manifolds? Which fail, and at which points? (You will check your
		answer in the exercises.)
	</p>
</Question>

<h2 id="charts-and-atlases">Charts, atlases and transition maps</h2>

<p>
	A manifold is defined by its small neighbourhoods. To compute anything on it we need coordinates on those neighbourhoods, and
	cartography supplies the vocabulary. No flat map shows the whole Earth faithfully, so an atlas uses many maps, each covering part of the
	globe, overlapping at their edges. On an overlap the same town appears on two pages with different coordinates, and a good atlas tells
	you how to convert from one to the other.
</p>

<Definition title="Chart and atlas" id="def-chart">
	<p>
		Let \(M\) be an \(n\)-manifold. A <dfn>chart</dfn> on \(M\) is a pair \((U, \varphi)\), where \(U \subseteq M\) is open and
		\(\varphi\colon U \to \varphi(U)\) is a homeomorphism onto an open subset of \(\R^n\). For \(p \in U\), the \(n\) numbers
		\(\varphi(p) = (x_1, \dots, x_n)\) are the <dfn>coordinates</dfn> of \(p\) in this chart. An <dfn>atlas</dfn> is a collection of
		charts whose domains \(U\) together cover \(M\).
	</p>
</Definition>

<p>
	Read \(\varphi\) (“phi”) as the map that prints one page of the atlas: it turns points of \(M\) into coordinates. Its inverse
	\(\varphi^{-1}\) reads the page back, turning coordinates into points. Condition 1 of the definition of a manifold says precisely that
	\(M\) has an atlas.
</p>

<Example title="Six charts for the sphere">
	<p>
		Let \(S^2 = \setb{(x, y, z) \in \R^3}{x^2 + y^2 + z^2 = 1}\). On the open northern hemisphere, where \(z > 0\), define
		\(\varphi(x, y, z) = (x, y)\): forget the height. This is like photographing the hemisphere from far above. Every point lands in the
		open unit disk \(u^2 + v^2 < 1\), and no two points land on the same spot, because the height can be recovered as
		\(z = \sqrt{1 - u^2 - v^2}\). So \(\varphi\) is a homeomorphism from the hemisphere onto the open disk, with inverse
	</p>
	\[ \varphi^{-1}(u, v) = \bigl(u,\ v,\ \sqrt{1 - u^2 - v^2}\,\bigr). \]
	<p>
		Do the same for the hemispheres \(z < 0\), \(x > 0\), \(x < 0\), \(y > 0\) and \(y < 0\), each time forgetting the coordinate that
		defines the hemisphere. Every point of the sphere has at least one nonzero coordinate, so it lies in at least one of the six open
		hemispheres: the six charts form an atlas.
	</p>
</Example>

<Figure size="wide" num="2.4.3" title="An atlas of the sphere" hint="Hover or tap the globe · click a map">
	<SphereCharts />
	{#snippet caption()}
		The six hemisphere charts of the sphere. The gold point lies in two or three of them (the coloured caps), and each of those flat maps
		shows its coordinates. A point on the rim of a hemisphere is missing from that chart — every chart is an open set — but another
		chart always picks it up. The readout shows the transition map between two charts that both contain the point.
	{/snippet}
</Figure>

<Definition title="Transition map" id="def-transition-map">
	<p>
		If \((U, \varphi)\) and \((V, \psi)\) are charts whose domains overlap, the <dfn>transition map</dfn> from \(\varphi\) to \(\psi\) is
	</p>
	\[ \psi \circ \varphi^{-1}\colon\ \varphi(U \cap V) \longrightarrow \psi(U \cap V). \]
	<p>It takes the coordinates of a point on the first page and returns the coordinates of the same point on the second.</p>
</Definition>

<p>
	For example, take the northern chart (\(z > 0\)) and the eastern one (\(x > 0\)), which keeps \((y, z)\). A point with northern
	coordinates \((u, v)\) is the point \(\bigl(u, v, \sqrt{1 - u^2 - v^2}\bigr)\) of the sphere, and the eastern chart keeps its last two
	coordinates. So the transition map is
</p>

\[ (u, v) \longmapsto \bigl(v,\ \sqrt{1 - u^2 - v^2}\,\bigr), \]

<p>
	defined on the half-disk where \(u > 0\) (the points that are in both hemispheres). Check it against Figure 2.4.3: the typical point has
	northern coordinates \((0.50, -0.45)\), and \(\sqrt{1 - 0.25 - 0.2025} \approx 0.74\), so its eastern coordinates are
	\((-0.45, 0.74)\), just as the eastern map shows. Being a composite of homeomorphisms, every transition map is a homeomorphism between
	open subsets of \(\R^n\).
</p>

<Proposition title="One chart is not enough">
	<p>The sphere cannot be covered by a single chart.</p>
</Proposition>

<Proof>
	<p>
		Suppose \(\varphi\colon S^2 \to V\) were a homeomorphism onto an open subset \(V\) of the plane. The sphere is
		<Term t="compact">compact</Term>, and a continuous image of a compact space is compact, so \(V\) is a compact subset of \(\R^2\),
		which means it is closed and bounded. So \(V\) is a nonempty subset of the plane that is both open and closed. The plane is
		<Term t="connected">connected</Term>, so its only such subset is the whole plane (<Ref to="topology/spaces" />). But the whole plane
		is not bounded. This contradiction shows that no such \(\varphi\) exists.
	</p>
</Proof>

<p>
	The same argument shows that no compact manifold of positive dimension fits on a single page. Every flat map of the whole Earth must
	cheat somewhere; the Mercator projection, for instance, leaves out the poles.
</p>

<h3 id="stereographic">Stereographic projection: two charts are enough</h3>

<p>
	Six charts are more than we need. A classical construction, used since antiquity to draw maps of the stars, covers the sphere with two.
	Start one dimension down, with the circle \(S^1 = \setb{(x, y)}{x^2 + y^2 = 1}\). Stand at the north pole \(N = (0, 1)\) and shine a
	light through a point \(P\) of the circle. The ray hits the horizontal line \(y = 0\) at a single point, and the position of that point
	is a number \(\varphi_N(P)\): the coordinate of \(P\) as seen from the north pole.
</p>

<Figure size="wide" num="2.4.4" title="Stereographic projection" hint="Drag P around the circle">
	<StereoCircle />
	{#snippet caption()}
		Projection from the north pole (gold) and from the south pole (teal). Each is a chart that covers all of the circle except its own
		pole. As \(P\) approaches the north pole, \(\varphi_N(P)\) runs off to infinity, while \(\varphi_S(P)\) approaches \(0\). Wherever
		both are defined, the two coordinates multiply to \(1\).
	{/snippet}
</Figure>

<Example title="The formulas">
	<p>
		The points on the line through \(N = (0, 1)\) and \(P = (x, y)\) are \(N + s(P - N) = \bigl(sx,\ 1 + s(y - 1)\bigr)\) for real
		numbers \(s\). The second coordinate is zero when \(s = 1/(1 - y)\), and then the first coordinate is
	</p>
	\[ \varphi_N(x, y) = \frac{x}{1 - y} \qquad (P \neq N). \]
	<p>
		Projecting from the south pole \(S = (0, -1)\) instead gives \(\varphi_S(x, y) = x/(1 + y)\), defined for \(P \neq S\). Where both
		are defined and nonzero (everywhere except at the poles), multiply them:
	</p>
	\[ \varphi_N \cdot \varphi_S = \frac{x^2}{1 - y^2} = \frac{x^2}{x^2} = 1, \]
	<p>
		because \(x^2 + y^2 = 1\). So the transition map from the northern chart to the southern one is \(t \mapsto 1/t\) on
		\(\R \setminus \set{0}\). The chart \(\varphi_N\) is a homeomorphism from \(S^1 \setminus \set{N}\) onto the <em>whole</em> line,
		with inverse \(t \mapsto \bigl(2t/(t^2 + 1),\ (t^2 - 1)/(t^2 + 1)\bigr)\).
	</p>
</Example>

<p>
	Notice what this says: <em>a circle with one point removed is homeomorphic to a line</em>. Conversely, adding a single point “at
	infinity” to the line closes it up into a circle.
</p>

<p>
	The same construction works one dimension up. Projecting the sphere from its north pole \(N = (0, 0, 1)\) onto the plane \(z = 0\)
	gives
</p>

\[ \varphi_N(x, y, z) = \left(\frac{x}{1 - z},\ \frac{y}{1 - z}\right), \]

<p>
	a homeomorphism from \(S^2 \setminus \set{N}\) onto the whole plane. Projecting from the south pole gives
	\(\varphi_S(x, y, z) = \bigl(x/(1 + z),\ y/(1 + z)\bigr)\), and a short calculation, like the one for the circle, shows that the
	transition map is
</p>

\[ (u, v) \longmapsto \frac{(u, v)}{u^2 + v^2}, \]

<p>
	called <em>inversion in the unit circle</em>: it turns the punctured plane inside out, swapping the inside of the unit circle with the
	outside and fixing the circle itself. In particular, <em>a sphere with one point removed is homeomorphic to the plane</em>. We used this
	in <Ref to="topology/homotopy" /> to show that every loop on the sphere shrinks to a point, and we will use it again in
	<Ref to="cohomology/characteristic-classes" />.
</p>

<Remark title="Many atlases, one manifold">
	<p>
		A manifold has many atlases: six hemispheres, two stereographic projections, projections from any pair of opposite points, and
		countless others. None of them is the “right” one. The definitions of manifold theory are arranged so that nothing important depends
		on the choice of atlas, and checking this is a recurring theme: whenever we define something using charts, we must check that
		another chart gives the same answer. Transition maps are exactly the tool for that check.
	</p>
</Remark>

<h2 id="boundary">Edges: manifolds with boundary</h2>

<p>
	The closed disk \(D^2 = \setb{(x, y)}{x^2 + y^2 \le 1}\), the <Term t="cylinder">cylinder</Term> \(S^1 \times [0, 1]\) and the
	<Term t="mobius-band">Möbius band</Term> are not manifolds in the sense above. At a point of the rim, no neighbourhood looks like the
	plane; the small-sphere test returns an arc instead of a circle. But they fail in a gentle and useful way: near a rim point they look
	like a <em>half</em>-plane. We enlarge the definition to allow this.
</p>

<p>
	The <dfn>\(n\)-dimensional half-space</dfn> is \(\mathbb H^n = \setb{(x_1, \dots, x_n) \in \R^n}{x_n \ge 0}\), the points on or
	above the hyperplane \(x_n = 0\). That hyperplane is its edge, written \(\partial \mathbb H^n\). For \(n = 2\), \(\mathbb H^2\) is the
	upper half-plane and its edge is the horizontal axis.
</p>

<Definition title="Manifold with boundary" id="def-manifold-with-boundary">
	<p>
		An <dfn>\(n\)-manifold with boundary</dfn> is a Hausdorff, second countable space \(M\) in which every point has an open
		neighbourhood homeomorphic to an open subset of the half-space \(\mathbb H^n\). A point that some such chart sends onto the edge
		\(\partial \mathbb H^n\) is a <dfn>boundary point</dfn>; the set of all boundary points is the <dfn>boundary</dfn> \(\partial M\).
		The remaining points are <dfn>interior points</dfn>.
	</p>
</Definition>

<Figure size="wide" num="2.4.5" title="Interior and boundary points">
	<BoundaryChart />
	{#snippet caption()}
		In the closed disk, an interior point \(p\) has a neighbourhood that a chart \(\varphi\) flattens onto an open disk inside the
		half-plane, away from its edge. A boundary point \(q\) only has neighbourhoods shaped like half-disks, and a chart \(\psi\) sends
		\(q\) to the edge of the half-plane. The boundary of the disk is the circle: \(\partial D^2 = S^1\).
	{/snippet}
</Figure>

<p>
	Could one point be a boundary point for one chart and an interior point for another? No; but proving it needs the same machinery as
	invariance of dimension, so it too waits for <Ref to="homology/invariance" />. Granting it, a manifold in the earlier sense is exactly a
	manifold with boundary whose boundary is empty. Some examples:
</p>

<ul>
	<li>the interval \([0, 1]\) is a 1-manifold with boundary \(\partial [0, 1] = \set{0, 1}\), two points;</li>
	<li>the closed disk has boundary \(\partial D^2 = S^1\), and the solid ball \(D^3\) has boundary \(\partial D^3 = S^2\);</li>
	<li>the cylinder \(S^1 \times [0, 1]\) has two boundary circles, its top and bottom;</li>
	<li>
		the Möbius band has <em>one</em> boundary circle: run your finger along its edge and you go twice around the band before coming
		back (<Ref to="topology/gluing" />).
	</li>
</ul>

<KeyIdea title="A boundary has no boundary">
	<p>
		The boundary of an \(n\)-manifold with boundary is an \((n-1)\)-manifold with <em>no</em> boundary of its own:
		\(\partial(\partial M) = \varnothing\). The rim of a disk is a circle, which has no endpoints; the surface of a ball is a sphere,
		which has no edge. Keep this slogan in mind. In <Ref to="homology/chains" /> we build the boundary operator \(\partial\) of homology,
		which sends a triangle to its three edges and an edge to its two endpoints, and its basic law \(\partial \circ \partial = 0\) is the
		combinatorial echo of this fact.
	</p>
</KeyIdea>

<Definition title="Closed manifold" id="def-closed-manifold">
	<p>
		A <dfn>closed manifold</dfn> is a compact manifold with empty boundary. The closed surfaces we know are the sphere, the torus, the
		Klein bottle, the projective plane and the surfaces \(\Sigma_g\) with \(g\) handles.
	</p>
</Definition>

<Warning title="Two meanings of “closed”">
	<p>
		The plane \(\R^2\) is a closed subset of itself, but it is not a closed manifold, because it is not compact. The closed disk is
		compact, but it is not a closed manifold either, because it has a boundary. “Closed manifold” means <em>compact and edgeless</em>, and
		has nothing to do with the closed sets of <Ref to="topology/spaces" />.
	</p>
</Warning>

<h2 id="smooth">Smooth manifolds and tangent spaces</h2>

<p>
	Topology cannot see corners: the surface of a cube and the round sphere are the same topological manifold. Calculus can. To speak of
	velocities, derivatives and integrals on a manifold we must know which functions on it are smooth, and the definition of a topological
	manifold does not tell us.
</p>

<p>
	The natural idea is to declare a function \(f\colon M \to \R\) <em>smooth</em> if it is smooth in coordinates, that is, if
	\(f \circ \varphi^{-1}\) is smooth for every chart \(\varphi\). Here “smooth” means infinitely differentiable: all partial derivatives
	of all orders exist and are continuous. But there is a catch. If \(f\) looks smooth on one page of the atlas, does it look smooth on an
	overlapping page \(\psi\)? On the second page,
</p>

\[ f \circ \psi^{-1} = \bigl(f \circ \varphi^{-1}\bigr) \circ \bigl(\varphi \circ \psi^{-1}\bigr), \]

<p>
	and a composite of smooth maps is smooth (that is the chain rule). So the answer is yes, <em>provided the transition map
	\(\varphi \circ \psi^{-1}\) is itself smooth</em>. That is the condition we impose.
</p>

<Definition title="Smooth manifold" id="def-smooth-manifold">
	<p>
		A <dfn>smooth atlas</dfn> is an atlas whose transition maps are all smooth. A <dfn>smooth manifold</dfn> is a manifold together with
		a smooth atlas. (Strictly, one takes all charts that are smoothly compatible with the given ones, so that equivalent atlases define
		the same smooth manifold; we will not need this refinement.)
	</p>
</Definition>

<Example title="The sphere is smooth">
	<p>
		The hemisphere transition maps, such as \((u, v) \mapsto \bigl(v, \sqrt{1 - u^2 - v^2}\bigr)\), are smooth on their domains,
		because the square root is smooth wherever its argument is positive, and inside the open disk \(1 - u^2 - v^2 > 0\). The
		stereographic transition map \((u, v) \mapsto (u, v)/(u^2 + v^2)\) is smooth away from the origin, which is exactly where it is
		defined. Both atlases make the sphere a smooth manifold — the same one, in fact.
	</p>
</Example>

<p>Most smooth manifolds you will meet arrive as solution sets of equations, and there is a convenient test for those.</p>

<Theorem title="Regular level sets" id="thm-level-sets">
	<p>
		Let \(F\colon \R^3 \to \R\) be smooth and let \(c\) be a number. If the gradient
		\(\nabla F = \bigl(\tfrac{\partial F}{\partial x}, \tfrac{\partial F}{\partial y}, \tfrac{\partial F}{\partial z}\bigr)\) is nonzero
		at every point where \(F = c\), then the level set \(\setb{(x, y, z)}{F(x, y, z) = c}\) is a smooth surface. (The same holds one
		dimension up: a level set in \(\R^{n+1}\) with nonzero gradient is a smooth \(n\)-manifold.)
	</p>
</Theorem>

<p>
	This is a form of the implicit function theorem from calculus. Near each point of the level set, the equation \(F = c\) can be solved
	for one of the three coordinates as a smooth function of the other two, which presents the surface locally as a graph — and a graph is a
	chart, as the northern hemisphere was. The sphere is the level set \(x^2 + y^2 + z^2 = 1\), and \(\nabla F = (2x, 2y, 2z)\) is
	nonzero on it. The torus is the level set \(\bigl(\sqrt{x^2 + y^2} - R\bigr)^2 + z^2 = r^2\), with \(0 < r < R\): the points at
	distance \(r\) from a circle of radius \(R\). The pretzel surfaces in the gallery at the end of this chapter were drawn by the computer in
	exactly this way, as the level set \(F = 0\) of a function that blends several tori together.
</p>

<Warning title="The cone, revisited">
	<p>
		The cone \(z = \sqrt{x^2 + y^2}\) is a topological manifold — vertical projection is a homeomorphism onto the plane — but as it sits
		in \(\R^3\) it is not smooth at its tip, where there is no tangent plane. Smoothness is extra structure, not a topological property,
		and it can behave strangely: some topological manifolds admit no smooth atlas at all, and in 1956 John Milnor discovered that the
		seven-dimensional sphere carries several genuinely different smooth structures. Surfaces are tame: every surface admits a smooth
		structure, and it is essentially unique.
	</p>
</Warning>

<h3 id="tangent-spaces">Tangent spaces: the microscope view</h3>

<p>
	Zoom in on a point of a smooth surface with a powerful microscope, and the surface looks more and more like a flat plane: the
	<em>tangent plane</em> at that point. Unlike the neighbourhoods of a topological manifold, which are flat only up to rubber-sheet
	deformation, the tangent plane is flat in the honest, linear sense: it is a <Term t="vector-space">vector space</Term>, in which arrows
	can be added and scaled (<Ref to="foundations/linear-algebra" />).
</p>

<p>
	The cleanest way to define it is through motion. Let \(M\) be a smooth surface in \(\R^3\) and \(p\) a point of \(M\). A
	<em>smooth curve in \(M\) through \(p\)</em> is a smooth map \(\gamma\) from a small interval \((-\varepsilon, \varepsilon)\) to
	\(\R^3\) with \(\gamma(t) \in M\) for every \(t\) and \(\gamma(0) = p\): a particle moving on the surface, passing through \(p\) at
	time \(0\). Its velocity at that moment is the vector \(\gamma'(0)\) of the derivatives of its three coordinates.
</p>

<Definition title="Tangent space" id="def-tangent-space">
	<p>
		The <dfn>tangent space</dfn> \(T_pM\) of a smooth surface \(M \subset \R^3\) at a point \(p\) is the set of all velocities
		\(\gamma'(0)\) of smooth curves \(\gamma\) in \(M\) with \(\gamma(0) = p\). Its elements are <dfn>tangent vectors</dfn> at \(p\).
		It is a 2-dimensional vector space, a plane through the origin of \(\R^3\); drawn with its origin moved to \(p\), it is the familiar
		tangent plane.
	</p>
</Definition>

<p>
	Why is \(T_pM\) a plane? Use a chart. Near \(p\), write the surface as \(X(u, v)\), a smooth parametrization with
	\(X(u_0, v_0) = p\) (the inverse of a chart, made smooth). A curve in the surface is \(\gamma(t) = X\bigl(u(t), v(t)\bigr)\), and by the
	chain rule its velocity at time \(0\) is
</p>

\[ \gamma'(0) = u'(0)\,\frac{\partial X}{\partial u} + v'(0)\,\frac{\partial X}{\partial v}. \]

<p>
	So every velocity is a combination of the two <em>coordinate velocities</em> \(\partial X/\partial u\) and \(\partial X/\partial v\),
	and every combination occurs (take \(u(t) = u_0 + at\) and \(v(t) = v_0 + bt\)). Hence \(T_pM\) is the plane spanned by these two
	vectors, which are linearly independent because \(X\) is a genuine parametrization.
</p>

<Example title="Tangent planes of the sphere">
	<p>
		If \(\gamma(t)\) stays on the unit sphere, then \(\gamma(t) \cdot \gamma(t) = 1\) for all \(t\). Differentiate both sides:
		\(2\,\gamma(t) \cdot \gamma'(t) = 0\), so at \(t = 0\), \(p \cdot \gamma'(0) = 0\). Every velocity at \(p\) is perpendicular to the
		radius through \(p\), and in fact
	</p>
	\[ T_pS^2 = \setb{v \in \R^3}{v \cdot p = 0}, \]
	<p>
		the plane perpendicular to \(p\). At the north pole \(p = (0, 0, 1)\), the tangent plane is the horizontal plane
		\(\setb{(a, b, 0)}{a, b \in \R}\).
	</p>
</Example>

<Figure size="wide" num="2.4.6" title="Tangent planes" hint="Click the surface to move the point · turn the direction · try the microscope">
	<TangentPlane />
	{#snippet caption()}
		A curve (teal) through a point \(p\) of a sphere or a torus, and its velocity arrow, which always lies in the glassy tangent plane.
		Turn the direction of the curve and the arrow sweeps out the whole plane; on the sphere the readout checks that each velocity is
		perpendicular to the radius, and on the torus it writes the velocity as a combination of the two coordinate velocities. The
		microscope zooms in until the surface and its tangent plane can no longer be told apart.
	{/snippet}
</Figure>

<Remark title="Tangent vectors without a surrounding space">
	<p>
		Our definition used the surrounding \(\R^3\). For an abstract manifold, tangent vectors are defined intrinsically — for instance as
		velocities of curves written in a chart, with the velocities in two charts identified by the derivative of the transition map. All the
		standard definitions give an \(n\)-dimensional vector space \(T_pM\) at each point of an \(n\)-manifold. A smooth map
		\(f\colon M \to N\) carries curves through \(p\) to curves through \(f(p)\), and so it carries velocities to velocities. The result is
		a linear map \(df_p\colon T_pM \to T_{f(p)}N\), the <dfn>differential</dfn> of \(f\) at \(p\): the best linear approximation to
		\(f\) near \(p\). It pushes vectors forward, which is why it is also written \(f_*\), with a lower star. Together, all the tangent
		spaces form the <em>tangent bundle</em> \(TM\), which returns in <Ref to="cohomology/characteristic-classes" />; and differential
		forms (<Ref to="cohomology/differential-forms" />) are devices that measure tangent vectors.
	</p>
</Remark>

<h2 id="orientation">Orientation: which way is anticlockwise?</h2>

<p>
	Draw a small circle on a sheet of paper, with an arrow running anticlockwise. You can draw the same arrow at every point of the sheet,
	consistently. Can you do the same on every surface? To answer, we first need to say precisely what a “sense of rotation” is, and linear
	algebra does it with a single number: the <Term t="determinant">determinant</Term>.
</p>

<p>
	An <em>ordered basis</em> of \(\R^2\) is a pair \((u, v)\) of vectors that do not lie on a common line. Turning \(u\) towards \(v\) the
	short way is either anticlockwise or clockwise, and the determinant tells you which:
</p>

\[ \det(u, v) = u_1 v_2 - u_2 v_1 \]

<p>
	is positive for anticlockwise pairs and negative for clockwise ones. Its absolute value is the area of the parallelogram spanned by \(u\)
	and \(v\).
</p>

<Figure size="wide" num="2.4.7" title="Orienting the plane" hint="Drag the tips of u and v">
	<PlaneOrientation />
	{#snippet caption()}
		The parallelogram is green when the pair \((u, v)\) is positive (turning from \(u\) to \(v\) is anticlockwise) and rose when it is
		negative. Swapping the two vectors, reversing one of them, or reflecting the whole picture in a line flips the sign of the
		determinant; rotating the pair does not.
	{/snippet}
</Figure>

<Definition title="Orientation of a vector space" id="def-orientation">
	<p>
		Two ordered bases of \(\R^n\) have the <dfn>same orientation</dfn> if the matrix that changes one into the other has positive
		determinant. This is an <Term t="equivalence-relation">equivalence relation</Term> with exactly two classes, and an
		<dfn>orientation</dfn> of \(\R^n\) — or of any \(n\)-dimensional real vector space — is a choice of one of the two classes, whose
		members are then called <em>positive</em>.
	</p>
</Definition>

<p>
	In \(\R^2\) the two classes are “anticlockwise” and “clockwise”; in \(\R^3\) they are “right-handed” and “left-handed”. Why is this an
	equivalence relation? A basis is related to itself by the identity matrix, of determinant \(1 > 0\). If \(A\) changes the first basis
	into the second, then \(A^{-1}\) changes the second into the first, and \(\det A^{-1} = 1/\det A\) has the same sign. If \(A\) and then
	\(B\) are changes of basis, the composite \(BA\) has \(\det(BA) = \det B \cdot \det A\), positive when both are. Orientation is yet
	another quotient: all the bases of a space, with everything forgotten except a sign.
</p>

<h3 id="orienting-surfaces">Orienting a surface</h3>

<p>
	An <dfn>orientation of a surface</dfn> is a choice of orientation of each tangent plane — a choice of “anticlockwise” at every point —
	that varies continuously as the point moves. For a topological surface, which has no tangent planes, one instead chooses a sense of
	rotation on each small disk, consistently where the disks overlap. For a manifold given by an atlas, the same idea becomes an
	<dfn>oriented atlas</dfn>: one whose transition maps all have positive Jacobian determinant (the determinant of their matrix of partial
	derivatives), so that “anticlockwise” on one page of the atlas means “anticlockwise” on every other.
</p>

<Definition title="Orientable" id="def-orientable">
	<p>
		A manifold is <dfn>orientable</dfn> if it admits an orientation, and <dfn>non-orientable</dfn> otherwise. A connected orientable
		manifold has exactly two orientations.
	</p>
</Definition>

<p>
	The plane is orientable: use the same “anticlockwise” everywhere. So is the sphere: at each point, call a rotation positive if it looks
	anticlockwise to someone standing outside the sphere. The surprise is that not every surface is orientable.
</p>

<Figure size="wide" num="2.4.8" title="A walk round a band" hint="Choose a band · walk a lap · drag to rotate">
	<OrientationWalk />
	{#snippet caption()}
		A flat creature — the letter F with a turning arrow — walks once around the middle of a band, while a faint ghost stays at the start.
		On the cylinder it comes home unchanged. On the Möbius band it comes home as its own mirror image: the F is reversed and its arrow
		turns the other way. A second lap undoes the reflection.
	{/snippet}
</Figure>

<Proposition title="The Möbius band is not orientable">
	<p>No continuous choice of “anticlockwise” exists on the Möbius band.</p>
</Proposition>

<Proof>
	<p>
		Suppose we had chosen an orientation, and let the creature walk once around the central circle, carrying its arrow. At the start, its
		arrow agrees with the chosen orientation. As it walks, its arrow and the orientation at its current position both vary continuously,
		and there are only two possible orientations at each point, so they cannot drift apart without a jump. (Precisely: the set of moments
		at which the two agree is both open and closed in the time interval, so by connectedness it is the whole interval.) Hence they still
		agree when the creature arrives home. But the creature arrives home mirror-reversed, with its arrow turning the opposite way from the
		arrow it set off with — and both arrows are supposed to agree with the single orientation chosen at the starting point. This is
		impossible, so no orientation exists.
	</p>
</Proof>

<p>
	A loop along which a traveller comes home mirror-reversed is called an <dfn>orientation-reversing loop</dfn>. A thin strip around such
	a loop is a Möbius band. Conversely, on a connected surface on which no loop reverses orientation, choose an orientation at one point and carry it along paths to
	every other point; two paths to the same point together form a loop, which does not reverse orientation, so the result does not depend on
	the path, and we have built an orientation. This gives a practical test.
</p>

<Proposition title="The Möbius band test" id="prop-mobius-test">
	<p>
		A surface is non-orientable if and only if it contains an orientation-reversing loop — equivalently, if and only if it contains a
		Möbius band.
	</p>
</Proposition>

<h3 id="words">Reading orientability from a gluing word</h3>

<p>
	For surfaces made from a single polygon by an <Term t="edge-word">edge word</Term> (<Ref to="topology/gluing" />), orientability can be
	read off the word. Orient the polygon anticlockwise. If a letter appears once as \(a\) and once as \(a^{-1}\), the two edges are glued
	the way neighbouring floor tiles meet, and a creature crossing from one to the other keeps its orientation. If a letter appears twice
	the <em>same</em> way round, as \(\dots a \dots a \dots\), then the strip of the polygon joining the two edges becomes a Möbius band
	when they are glued.
</p>

<Proposition title="The word test" id="prop-word-test">
	<p>
		A surface made from one polygon is non-orientable if and only if some letter of its edge word appears twice with the same exponent.
	</p>
</Proposition>

<p>
	So the torus \(aba^{-1}b^{-1}\), the sphere \(aa^{-1}\) and the surfaces \(\Sigma_g\) with words
	\(a_1b_1a_1^{-1}b_1^{-1}\cdots a_gb_ga_g^{-1}b_g^{-1}\) are orientable, while the Klein bottle \(abab^{-1}\) (the letter \(a\)
	appears twice as \(a\)) and the projective plane \(aa\) are not.
</p>

<KeyIdea title="The torus and the Klein bottle are different">
	<p>
		Orientability is a topological property: a homeomorphism carries Möbius bands to Möbius bands. The Klein bottle contains a Möbius
		band and the torus does not, so they are not homeomorphic — even though both are made from one square, both have Euler characteristic
		\(0\) (<Ref to="topology/euler-characteristic" />) and, as <Ref to="homology/homology-groups" /> will show, both have the same
		homology mod 2. That the torus contains no Möbius band <em>anywhere</em>, and not just none that we have spotted, is guaranteed by
		its orientation: the anticlockwise arrows drawn on the square survive the gluing \(aba^{-1}b^{-1}\). A second proof comes from homology
		over the integers in <Ref to="homology/computing" />, where the top homology group of the torus is \(\Z\) and that of the Klein
		bottle is \(0\).
	</p>
</KeyIdea>

<h3 id="sides">One-sided surfaces, and the space around them</h3>

<p>
	In <Ref to="topology/gluing" /> the Möbius band was called <em>one-sided</em>: an ant walking along it reaches the back of its starting
	point without crossing the edge. Sidedness is a property of a surface sitting in a surrounding space, which supplies the “back”;
	orientability belongs to the surface alone — the creature in Figure 2.4.8 never leaves the band. For surfaces in ordinary space the two
	notions agree: a surface in \(\R^3\) is two-sided exactly when it is orientable. And closed surfaces in space have no choice.
</p>

<Theorem label="Theorem (Jordan–Brouwer separation)" id="thm-jordan-brouwer">
	<p>
		A closed connected surface sitting in \(\R^3\) without crossing itself divides space into two regions, a bounded inside and an
		unbounded outside. Consequently it is two-sided, and therefore orientable.
	</p>
</Theorem>

<p>
	Its one-dimension-lower cousin, the Jordan curve theorem, appears in <Ref to="homology/invariance" />, and both can be proved with
	homology. The consequence is striking: the Klein bottle and the projective plane cannot be built in ordinary space without passing
	through themselves. Every glass Klein bottle you have seen is an <Term t="immersion">immersion</Term>, with a circle along which the
	surface crosses itself, and <Term t="boys-surface">Boy's surface</Term> is an immersion of the projective plane. With a fourth
	dimension to move in, the crossings can be avoided: the Klein bottle embeds in \(\R^4\). Hassler Whitney proved in 1944 that every
	smooth \(n\)-manifold can be embedded in \(\R^{2n}\) — so every surface fits in \(\R^4\) — and immersed in \(\R^{2n-1}\) when
	\(n \ge 2\). The definition of a manifold never needed a surrounding space; Whitney's theorem says that one can always be found.
</p>

<h2 id="connected-sum">Connected sums: building surfaces like Lego</h2>

<p>
	How many different closed surfaces are there? To find out, we need a way of building new surfaces from old ones.
</p>

<Definition title="Connected sum" id="def-connected-sum">
	<p>
		Let \(M\) and \(N\) be connected surfaces. Cut a small open disk out of each (the inside of a little closed disk lying in a chart),
		leaving two surfaces with one boundary circle each. Glue the two boundary circles together by a homeomorphism. The result is the
		<dfn>connected sum</dfn> \(M \mathbin{\#} N\), read “\(M\) connect \(N\)”.
	</p>
</Definition>

<Figure size="wide" num="2.4.9" title="Connected sum" hint="Step through · drag to rotate">
	<ConnectedSum />
	{#snippet caption()}
		The connected sum of two tori in four steps: cut a small disk out of each (the gold circles), join the two holes by a tube, and smooth
		the result. A tube is only a thickened circle, so joining by a tube is the same as gluing the circles directly. The connected sum
		\(T^2 \mathbin{\#} T^2\) is the surface of genus two.
	{/snippet}
</Figure>

<p>
	It takes some work to show that the result does not depend on where the disks are cut or how the circles are glued, so that
	\(M \mathbin{\#} N\) is well defined up to homeomorphism. Granting that, connected sum behaves very much like addition.
</p>

<ul>
	<li>
		It is commutative and associative: \(M \mathbin{\#} N \cong N \mathbin{\#} M\) and
		\((L \mathbin{\#} M) \mathbin{\#} N \cong L \mathbin{\#} (M \mathbin{\#} N)\).
	</li>
	<li>
		The sphere is its zero: \(S^2 \mathbin{\#} M \cong M\). Removing a disk from a sphere leaves a disk, and gluing a disk into the hole
		in \(M\) just fills the hole back in.
	</li>
	<li>
		Adding a torus adds a <dfn>handle</dfn>: \(M \mathbin{\#} T^2\) is \(M\) with a handle attached. In particular
		\(\Sigma_g = T^2 \mathbin{\#} \cdots \mathbin{\#} T^2\), with \(g\) tori, is the <Term t="genus-g-surface">surface of genus \(g\)</Term>.
	</li>
	<li>
		Adding a projective plane adds a <Term t="cross-cap">cross-cap</Term>. The projective plane with a disk removed is a Möbius band, so
		\(M \mathbin{\#} \RP^2\) is \(M\) with a disk cut out and a Möbius band sewn into the hole along its single edge.
	</li>
</ul>

<Example title="Two projective planes make a Klein bottle">
	<p>
		By the last item, \(\RP^2 \mathbin{\#} \RP^2\) is two Möbius bands glued along their boundary circles. That is the Klein bottle: cut a
		Klein bottle along a suitable circle and it falls apart into two Möbius bands. (Try it on the gluing square: cut along the two lines
		that run from one twisted edge to the other, a third and two thirds of the way across. The middle strip and the two outer strips,
		which join up across the straight gluing, each have their ends glued with a twist.) So \(K \cong \RP^2 \mathbin{\#} \RP^2\).
	</p>
</Example>

<Theorem label="Theorem (Dyck, 1888)" id="thm-dyck">
	<p>
		\(T^2 \mathbin{\#} \RP^2 \cong \RP^2 \mathbin{\#} \RP^2 \mathbin{\#} \RP^2\). In the presence of a cross-cap, a handle can be
		traded for two more cross-caps.
	</p>
</Theorem>

<p>
	Dyck's theorem means that mixing handles and cross-caps never produces anything new: any mixture with at least one cross-cap is a
	connected sum of projective planes alone.
</p>

<Remark title="Euler characteristic almost adds">
	<p>
		Cutting a disk out of each surface and gluing along a circle changes the
		<Term t="euler-characteristic">Euler characteristic</Term> in a simple way:
		\(\chi(M \mathbin{\#} N) = \chi(M) + \chi(N) - 2\). The proof, by counting vertices, edges and faces, is in
		<Ref to="topology/euler-characteristic" />. For example \(\chi(\Sigma_2) = 0 + 0 - 2 = -2\).
	</p>
</Remark>

<h2 id="classification">The classification of closed surfaces</h2>

<p>
	We can now state the theorem promised in <Ref to="topology/gluing" />. It says that the closed surfaces we already know are all the
	closed surfaces there are.
</p>

<Theorem title="Classification of closed surfaces" id="thm-classification">
	<p>Every closed connected surface is homeomorphic to exactly one of the following:</p>
	<ul>
		<li>the sphere \(S^2\);</li>
		<li>
			a connected sum of \(g \ge 1\) tori, \(\Sigma_g = T^2 \mathbin{\#} \cdots \mathbin{\#} T^2\): the orientable surface of genus \(g\);
		</li>
		<li>a connected sum of \(k \ge 1\) projective planes, \(N_k = \RP^2 \mathbin{\#} \cdots \mathbin{\#} \RP^2\), which is non-orientable.</li>
	</ul>
	<p>
		Equivalently, it is given by exactly one of the edge words \(aa^{-1}\), \(a_1b_1a_1^{-1}b_1^{-1} \cdots a_gb_ga_g^{-1}b_g^{-1}\) or
		\(a_1a_1a_2a_2 \cdots a_ka_k\).
	</p>
</Theorem>

<p>
	The number \(g\) of handles is the <dfn>genus</dfn> of an orientable surface; the sphere has genus \(0\). For \(N_k\), the number
	\(k\) of cross-caps is sometimes called its non-orientable genus.
</p>

<Figure size="wide" num="2.4.10" title="Closed surfaces" hint="Choose a surface · drag to rotate">
	<GenusSurfaces />
	{#snippet caption()}
		The classification as a gallery. The orientable surfaces are spheres with \(g\) handles; each handle carries a gold loop around its
		tube and a teal loop around its hole. The non-orientable surfaces cannot be built in \(\R^3\) without crossing themselves, so they
		are drawn as immersions: the projective plane as Boy's surface and the Klein bottle as the classic bottle.
	{/snippet}
</Figure>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Surface</th><th>Orientable</th><th>\(\chi\)</th><th>Edge word</th><th>\(H_1\) (§3.4)</th></tr>
		</thead>
		<tbody>
			<tr><td>sphere \(S^2\)</td><td>yes</td><td>\(2\)</td><td>\(aa^{-1}\)</td><td>\(0\)</td></tr>
			<tr><td>torus \(T^2 = \Sigma_1\)</td><td>yes</td><td>\(0\)</td><td>\(aba^{-1}b^{-1}\)</td><td>\(\Z^2\)</td></tr>
			<tr><td>genus \(g\), \(\Sigma_g\)</td><td>yes</td><td>\(2 - 2g\)</td><td>\(a_1b_1a_1^{-1}b_1^{-1}\cdots\)</td><td>\(\Z^{2g}\)</td></tr>
			<tr><td>projective plane \(\RP^2 = N_1\)</td><td>no</td><td>\(1\)</td><td>\(aa\)</td><td>\(\Z/2\)</td></tr>
			<tr><td>Klein bottle \(K = N_2\)</td><td>no</td><td>\(0\)</td><td>\(aabb\)</td><td>\(\Z \oplus \Z/2\)</td></tr>
			<tr><td>\(k\) cross-caps, \(N_k\)</td><td>no</td><td>\(2 - k\)</td><td>\(a_1a_1\cdots a_ka_k\)</td><td>\(\Z^{k-1} \oplus \Z/2\)</td></tr>
		</tbody>
	</table>
</div>

<p>
	Why “exactly one”? Two different surfaces in the list are never homeomorphic: orientability separates the two families, and within
	each family the Euler characteristic, \(2 - 2g\) or \(2 - k\), pins down the number of handles or cross-caps
	(<Ref to="topology/euler-characteristic" />). The last column of the table, computed with homology in <Ref to="homology/computing" />,
	separates them too: homology alone recovers the whole classification.
</p>

<Remark title="How the proof goes">
	<ol>
		<li>
			<strong>Triangulate.</strong> Cut the surface into triangles that meet edge to edge. That every surface can be triangulated was
			proved by Tibor Radó in 1925; it is the hard, analytic step. For surfaces given by gluing diagrams it comes for free.
		</li>
		<li>
			<strong>Make one polygon.</strong> Glue the triangles together one at a time, each along a single edge, so that the growing
			piece stays a disk, until every triangle is used. The surface is now one polygon whose edges are glued in pairs: an edge word.
		</li>
		<li>
			<strong>Simplify the word.</strong> Cut-and-paste moves change the polygon without changing the surface: cancel a pair
			\(aa^{-1}\) that sits side by side (a fold), bring the two letters of a pair \(\dots a \dots a \dots\) together into a cross-cap
			\(aa\), gather interlocked pairs into handles \(aba^{-1}b^{-1}\), and use Dyck's theorem to turn handles into cross-caps when a
			cross-cap is present.
		</li>
		<li><strong>Read off the answer.</strong> The final word is one of the normal forms in the theorem.</li>
	</ol>
	<p>
		John Conway found a slicker argument, the “ZIP proof”, in which a surface is assembled from disks joined by zips; the write-up by
		Francis and Weeks in Further reading is short and full of pictures.
	</p>
</Remark>

<History title="From Riemann to Conway">
	<p>
		The word “manifold” comes from Bernhard Riemann's <em>Mannigfaltigkeit</em>, in the lecture he gave at Göttingen on 10 June 1854 to
		qualify as a university teacher. Riemann had offered three topics, and Carl Friedrich Gauss, who was in the audience, chose the one on
		the foundations of geometry. The lecture was published only in 1868, two years after Riemann's death; Hermann Weyl gave the first
		modern, intrinsic definition — for surfaces, by neighbourhoods and coordinate charts — in 1913. Surfaces were classified long before the definition was settled. August Möbius
		classified the closed orientable surfaces in 1863, and Camille Jordan did so independently in 1866; Walther von Dyck added the
		non-orientable ones in 1888, proving the theorem that bears his name along the way. The first proof that meets modern standards
		was given by Max Dehn and Poul Heegaard in 1907, for surfaces built from polygons, and Radó's triangulation theorem closed the last gap
		in 1925. Around 1992 John Conway found the ZIP proof — the name stands for “zero irrelevancy proof”.
	</p>
</History>

<Remark title="Higher dimensions">
	<p>
		Closed curves are easy: every connected one is a circle. Closed surfaces are decided by two pieces of data. In dimension three the
		story is far harder. In 1904 Henri Poincaré asked whether a closed 3-manifold in which every loop can be shrunk to a point
		(<Term t="simply-connected">simply connected</Term>, <Ref to="topology/homotopy" />) must be the 3-sphere. The question became the
		Poincaré conjecture, and it was settled only in 2003 by Grigori Perelman, as part of William Thurston's programme for describing all
		3-manifolds by geometry. In dimension four no complete list is possible, in a precise sense: in 1958 A. A. Markov proved that no
		algorithm can decide whether two given 4-manifolds are homeomorphic. Algebraic topology was invented to bring order to this zoo, and
		homology is its first and most useful tool.
	</p>
</Remark>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Letters as curves">
	<p>
		Draw the capital letters C, D, L, O, T and X as thin curves in a plain sans-serif font. Which are 1-manifolds, which are
		1-manifolds with boundary, and which are neither?
	</p>
	{#snippet hint()}
		Remove a point from a small neighbourhood and count the pieces. For an interior point of a curve you get 2 pieces; for an endpoint
		(a boundary point) you get 1.
	{/snippet}
	{#snippet solution()}
		<p>
			D and O are closed curves, each homeomorphic to a circle: 1-manifolds without boundary. C and L are arcs, homeomorphic to
			\([0, 1]\): 1-manifolds with boundary, each with two boundary points (the ends). T is neither: removing the junction point from a
			small neighbourhood of it leaves 3 pieces, whereas an interior point gives 2 and a boundary point gives 1. X is neither: its
			crossing gives 4 pieces.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Coordinates on the circle">
	<p>
		Let \(P = \bigl(\tfrac35, \tfrac45\bigr)\), a point of the unit circle. Compute \(\varphi_N(P)\) and \(\varphi_S(P)\) and check
		that their product is \(1\). Which point \(Q\) of the circle has \(\varphi_N(Q) = 1\)?
	</p>
	{#snippet solution()}
		<p>
			\(\varphi_N(P) = \frac{3/5}{1 - 4/5} = \frac{3/5}{1/5} = 3\) and \(\varphi_S(P) = \frac{3/5}{1 + 4/5} = \frac{3/5}{9/5} = \frac13\),
			and \(3 \cdot \frac13 = 1\). Using the inverse map \(t \mapsto \bigl(2t/(t^2+1),\ (t^2-1)/(t^2+1)\bigr)\) with \(t = 1\) gives
			\(Q = (1, 0)\): the ray from the north pole through \((1, 0)\) meets the line \(y = 0\) at \(x = 1\), as it should.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="No compact manifold fits on one page">
	<p>
		Show that a nonempty compact manifold of dimension \(n \ge 1\) cannot be covered by a single chart. Is the same true of the open
		disk?
	</p>
	{#snippet solution()}
		<p>
			Suppose \(\varphi\colon M \to V\) is a homeomorphism onto an open subset \(V\) of \(\R^n\). As \(M\) is compact, so is \(V\), hence
			\(V\) is closed and bounded. Then \(V\) is nonempty, open and closed in the connected space \(\R^n\), so \(V = \R^n\), which is not
			bounded (here \(n \ge 1\) is used: \(\R^0\) is a single point, and is bounded). Contradiction. The open disk is not compact, and one
			chart does cover it: the identity map onto itself, an open subset of \(\R^2\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Boundaries">
	<p>
		Describe the boundary of each of these manifolds with boundary: (a) the closed annulus \(\setb{(x, y)}{1 \le x^2 + y^2 \le 4}\);
		(b) the solid torus \(D^2 \times S^1\); (c) the closed square \([0, 1] \times [0, 1]\). In (c), are the corners a problem?
	</p>
	{#snippet solution()}
		<p>
			(a) Two circles, of radius 1 and 2. (b) \(\partial(D^2 \times S^1) = S^1 \times S^1\), the torus: the solid torus is a doughnut
			and its boundary is the doughnut's skin. (c) The perimeter of the square, which is homeomorphic to a circle. The corners are no
			problem for topology: a small neighbourhood of a corner is a quarter-disk, which is homeomorphic to a half-disk (open it out like
			a fan, doubling every angle), so the square is a 2-manifold with boundary. They would matter for smoothness.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="A tangent plane of the torus">
	<p>
		The torus can be parametrized by
		\(X(u, v) = \bigl((R + r\cos v)\cos u,\ (R + r\cos v)\sin u,\ r\sin v\bigr)\) with \(0 < r < R\). Compute the coordinate
		velocities \(\partial X/\partial u\) and \(\partial X/\partial v\) at \((u, v) = (0, 0)\), and describe the tangent plane at the
		point \(p = X(0, 0) = (R + r, 0, 0)\).
	</p>
	{#snippet solution()}
		<p>
			\(\partial X/\partial u = \bigl(-(R + r\cos v)\sin u,\ (R + r\cos v)\cos u,\ 0\bigr)\), which is \((0, R + r, 0)\) at \((0, 0)\);
			and \(\partial X/\partial v = (-r\sin v\cos u,\ -r\sin v\sin u,\ r\cos v)\), which is \((0, 0, r)\). They span the plane of vectors
			\((0, a, b)\), so \(T_pT^2 = \setb{(0, a, b)}{a, b \in \R}\). Drawn at \(p\), the tangent plane is the vertical plane
			\(x = R + r\), touching the torus at its outermost point, as it should.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Orientability from words">
	<p>
		Which of these single-polygon words give orientable surfaces? (a) \(abcabc\); (b) \(abca^{-1}b^{-1}c^{-1}\); (c) \(abab\);
		(d) \(aba^{-1}b^{-1}cc\).
	</p>
	{#snippet solution()}
		<p>
			(a) Non-orientable: every letter appears twice with the same exponent. (b) Orientable: each letter appears once with each
			exponent. (c) Non-orientable: this is another word for the projective plane. (d) Non-orientable, because of \(cc\). It is a torus
			with a cross-cap, \(T^2 \mathbin{\#} \RP^2\), which by Dyck's theorem is \(N_3\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Counting with connected sums">
	<p>
		Using \(\chi(M \mathbin{\#} N) = \chi(M) + \chi(N) - 2\), \(\chi(S^2) = 2\), \(\chi(T^2) = 0\) and \(\chi(\RP^2) = 1\), show that
		\(\chi(\Sigma_g) = 2 - 2g\) and \(\chi(N_k) = 2 - k\). Then check that both sides of Dyck's theorem have the same Euler
		characteristic.
	</p>
	{#snippet solution()}
		<p>
			By induction on \(g\): \(\chi(\Sigma_1) = 0 = 2 - 2\), and
			\(\chi(\Sigma_{g+1}) = \chi(\Sigma_g \mathbin{\#} T^2) = (2 - 2g) + 0 - 2 = 2 - 2(g + 1)\). Likewise \(\chi(N_1) = 1 = 2 - 1\) and
			\(\chi(N_{k+1}) = (2 - k) + 1 - 2 = 2 - (k + 1)\). For Dyck's theorem, \(\chi(T^2 \mathbin{\#} \RP^2) = 0 + 1 - 2 = -1\) and
			\(\chi(N_3) = 2 - 3 = -1\). (Equal Euler characteristics alone prove nothing — the torus and the Klein bottle share one too. With the fact that both sides
			are non-orientable, the classification confirms Dyck's theorem; but that is a consistency check, not a proof, since the proof of the
			classification uses Dyck's theorem.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Orienting the hemisphere atlas">
	<p>
		Take the northern chart \((x, y, z) \mapsto (x, y)\) on \(z > 0\), the eastern chart \((x, y, z) \mapsto (y, z)\) on \(x > 0\), and
		the chart \((x, y, z) \mapsto (x, z)\) on \(y > 0\). Compute the Jacobian determinants of the transition maps from the northern chart
		to the other two. Is the six-chart atlas oriented as it stands? If not, how can you repair it?
	</p>
	{#snippet hint()}
		Write \(w = \sqrt{1 - u^2 - v^2}\). The transition maps are \((u, v) \mapsto (v, w)\) and \((u, v) \mapsto (u, w)\), and
		\(\partial w/\partial u = -u/w\), \(\partial w/\partial v = -v/w\).
	{/snippet}
	{#snippet solution()}
		<p>
			For \((u, v) \mapsto (v, w)\) the Jacobian matrix has rows \((0,\ 1)\) and \((-u/w,\ -v/w)\), with determinant \(u/w\), positive on
			the overlap, where \(u = x > 0\). For \((u, v) \mapsto (u, w)\) the rows are \((1,\ 0)\) and \((-u/w,\ -v/w)\), with determinant
			\(-v/w\), negative on the overlap, where \(v = y > 0\). So the atlas is not oriented as it stands. Repair it by listing each chart's
			two coordinates in an order that looks anticlockwise from outside the sphere: keep \((x, y)\) on \(z > 0\), \((y, z)\) on
			\(x > 0\) and \((x, z)\) on \(y < 0\), but use \((z, x)\) on \(y > 0\), \((y, x)\) on \(z < 0\) and \((z, y)\) on \(x < 0\).
			Swapping two coordinates is a reflection, which changes the sign of every Jacobian determinant involving that chart. With these
			choices all transition maps have positive Jacobian determinant, which shows again that the sphere is orientable.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			An \(n\)-manifold is a Hausdorff, second countable space in which every point has a neighbourhood homeomorphic to \(\R^n\) — or,
			equivalently, to an open ball or an open subset of \(\R^n\). Its dimension is well defined (invariance of dimension).
		</li>
		<li>
			Points that are not manifold points, such as the crossing of a figure eight or the tip of a double cone, can be detected by
			removing them and counting pieces. Corners are invisible to topology.
		</li>
		<li>
			A chart \((U, \varphi)\) gives coordinates on an open set; an atlas covers the manifold; transition maps \(\psi \circ \varphi^{-1}\)
			convert coordinates. The sphere needs at least two charts, and stereographic projection provides two, with transition map
			\(t \mapsto 1/t\) for the circle and \(w \mapsto w/\abs{w}^2\) for the sphere.
		</li>
		<li>
			Manifolds with boundary are modelled on the half-space \(\mathbb H^n\). A boundary has no boundary: \(\partial(\partial M) =
			\varnothing\). A closed manifold is compact with empty boundary.
		</li>
		<li>
			A smooth manifold has smooth transition maps; level sets with nonzero gradient are smooth. The tangent space \(T_pM\) is the
			vector space of velocities of curves through \(p\), and a smooth map pushes tangent vectors forward by its differential.
		</li>
		<li>
			An orientation of a vector space is a class of ordered bases up to positive determinant; an orientation of a manifold is a
			continuous choice of these. A surface is non-orientable if and only if it contains a Möbius band; for one-polygon words, if and only
			if some letter appears twice with the same exponent. Closed surfaces in \(\R^3\) are orientable, so the Klein bottle and
			\(\RP^2\) only immerse there; they embed in \(\R^4\).
		</li>
		<li>
			Connected sum: \(S^2\) is the zero, \(T^2\) adds a handle, \(\RP^2\) adds a cross-cap; \(\RP^2 \mathbin{\#} \RP^2 \cong K\) and
			\(T^2 \mathbin{\#} \RP^2 \cong \RP^2 \mathbin{\#} \RP^2 \mathbin{\#} \RP^2\).
		</li>
		<li>
			Classification: every closed connected surface is exactly one of \(S^2\), \(\Sigma_g\) or \(N_k\), told apart by orientability
			and Euler characteristic — and, as we will see, by homology.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
