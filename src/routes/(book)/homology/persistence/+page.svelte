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
	import TorusCloud from '$lib/figures/homology/persistence/TorusCloud.svelte';
	import GrowingBalls from '$lib/figures/homology/persistence/GrowingBalls.svelte';
	import CechVsRips from '$lib/figures/homology/persistence/CechVsRips.svelte';
	import FlipBook from '$lib/figures/homology/persistence/FlipBook.svelte';
	import WaterLevel from '$lib/figures/homology/persistence/WaterLevel.svelte';
	import Playground from '$lib/figures/homology/persistence/Playground.svelte';
	import ReductionStepper from '$lib/figures/homology/persistence/ReductionStepper.svelte';
	import StabilityDemo from '$lib/figures/homology/persistence/StabilityDemo.svelte';
	import AppGallery from '$lib/figures/homology/persistence/AppGallery.svelte';
	import HexagonSphere from '$lib/figures/homology/persistence/HexagonSphere.svelte';
	import { readings } from '$lib/figures/homology/persistence/readings';
</script>

<Epigraph author="Robert Ghrist" source="Barcodes: The Persistent Topology of Data (2008)"
	>In the context of high-dimensional data, algebraic topology works like a telescope, revealing objects and features not visible to the
	naked eye.</Epigraph
>

<p class="lead">
	Every measurement is a point. A weather station that logs temperature, pressure and humidity once an hour turns each hour into a point
	with three coordinates. A photograph cut into tiny tiles turns each tile into a point with one coordinate per pixel. A molecule is a
	handful of points — its atoms — floating in space. Collect enough measurements and you hold a <em>cloud</em> of points, and somewhere in
	that cloud there may be a shape: separate clumps, a loop, a hollow. Homology was built to count exactly such features. Yet a cloud of
	points, taken literally, has no shape at all: it is dust.
</p>

<p>
	This chapter shows how to ask homology about data at <em>every scale at once</em>, how to read its answer — a picture called a
	<em>barcode</em> — why that answer can be trusted when the data are noisy, and how a computer finds it using nothing more than the column
	operations you already met in <Ref to="homology/computing" />.
</p>

<Ahead>
	<p>
		This chapter is the bridge from pure to applied mathematics. It reuses almost everything from Parts II and III: simplicial complexes
		(<Ref to="topology/simplicial-complexes" />), cycles and boundaries (<Ref to="homology/cycles-and-boundaries" />), chains with
		\(\Z/2\) coefficients (<Ref to="homology/chains" />), Betti numbers (<Ref to="homology/homology-groups" />) and the reduction of
		boundary matrices (<Ref to="homology/computing" />). It adds one new idea: instead of a single photograph, watch a whole <em>film</em>
		of complexes, and follow each hole from the frame where it is born to the frame where it dies. The <em>nerve</em> of a cover, which you
		meet here, returns in <Ref to="cohomology/sheaves" /> as the backbone of Čech cohomology; and the habit of comparing invariants by a
		<em>distance</em>, instead of only asking whether they are equal, is one of the quiet revolutions of modern applied topology.
	</p>
</Ahead>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="point-clouds">Dots that want to be a shape</h2>

<p>
	Let us fix the vocabulary. A <dfn>point cloud</dfn> is a finite set of points
	\[ P = \set{p_1, p_2, \dots, p_n} \]
	in some space \(\R^d\), together with the distances between them. Here \(\R^d\) (read “R d”) is the space of lists of \(d\) real
	numbers: a point of \(\R^2\) is a pair \((x, y)\), a point of \(\R^3\) a triple, and a point of \(\R^{9}\) a list of nine numbers. The
	distance between two points is computed by Pythagoras’ theorem, one coordinate at a time:
	\[ \abs{p - q} = \sqrt{(p_1 - q_1)^2 + (p_2 - q_2)^2 + \dots + (p_d - q_d)^2}, \]
	read “the distance from \(p\) to \(q\)”. (Distances, balls and metric spaces were introduced in <Ref to="topology/spaces" />.) Point
	clouds are everywhere:
</p>
<ul>
	<li>
		<strong>Sensor readings.</strong> A station measuring \(d\) quantities at regular times produces one point of \(\R^d\) per time.
	</li>
	<li>
		<strong>Images.</strong> A \(3 \times 3\) patch of a grey photograph is nine brightness values, so it is a point of \(\R^{9}\). A
		thousand photographs give millions of such points.
	</li>
	<li><strong>Molecules and materials.</strong> The atoms of a protein or of a piece of glass are points of \(\R^3\).</li>
	<li>
		<strong>Brains.</strong> If you record the firing rates of \(N\) neurons, every moment of time becomes a point of \(\R^N\).
	</li>
</ul>

<p>
	Now look at <a href="#fig-torus">Figure 3.7.1</a>. It shows a few hundred points in space, slowly turning. Raise the number of points and,
	somewhere along the way, you stop seeing dots and start seeing a <em>doughnut</em> — a torus, with a hole through the middle and a
	tunnel running round inside it. Nobody drew the surface. Your visual system invented it.
</p>

<Figure size="wide" id="fig-torus" num="3.7.1" title="Dots in space" hint="Drag to rotate · slide the number of points">
	<TorusCloud />
	{#snippet caption()}
		Points sampled at random from the surface of a torus in \(\R^3\), with a little noise. With 40 points you see a scatter; with a few
		hundred you see a doughnut. The surface itself never appears in the data — switch it on to check your eye.
	{/snippet}
</Figure>

<p>
	The mathematician Shmuel Weinberger put this beautifully, thinking of the paintings of Georges Seurat, which are made of thousands of
	separate dots of colour:
</p>
<blockquote>
	“The eye, or the brain, performs the marvelous task of taking the sense data of individual points and assembling them into a coherent
	image of a continuum — it infers the continuous from the discrete.”
	<br /><span class="ui cite">— S. Weinberger, “What is … persistent homology?”, Notices of the AMS (2011)</span>
</blockquote>

<p>
	Here is the catch. In three dimensions you can turn the cloud and look. In nine, or twenty thousand, you cannot: there is no way to see
	\(\R^{9}\). We need an <em>algorithmic</em> eye — a procedure that takes a list of points and reports the shape they suggest, in any
	dimension, without anybody looking.
</p>

<p>
	Homology looks like exactly the right tool: it counts pieces (\(b_0\)), loops (\(b_1\)) and hollows (\(b_2\)), and it can be computed
	by a machine. But ask it about the cloud <em>as it stands</em> and the answer is disappointing. A set of \(n\) separate points has
	\(n\) components and nothing else: \(b_0 = n\), and every other <Term t="betti-number">Betti number</Term> is \(0\). As Otter and
	colleagues put it in their survey of the subject, “from a topological point of view, finite metric spaces do not contain any interesting
	information.” The shape is not <em>in</em> the points; it is in how the points sit relative to one another. We have to supply the glue.
</p>

<Remark title="A word about β">
	<p>
		In this book Betti numbers are written \(b_k\). In data science you will very often see \(\beta_k\) (beta) instead; it means the same
		thing.
	</p>
</Remark>

<Question>
	<p>
		Before reading on: the computer sees only a list of coordinates. How would <em>you</em> convince it that the points of Figure 3.7.1 lie on a
		doughnut — or, more modestly, that 26 points in the plane lie on a circle?
	</p>
</Question>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="thickening">Thickening the dots</h2>

<p>
	The simplest glue is blur. Replace every point by a small disc around it. If two points are close, their discs overlap and the two
	points become part of one blob; if the points lie around a circle, the discs join up into a ring. Formally, for a radius \(r \ge 0\),
	the <dfn>closed ball</dfn> of radius \(r\) around \(p\) is
	\[ B(p, r) = \setb{x \in \R^d}{\abs{x - p} \le r}, \]
	“the set of all points within distance \(r\) of \(p\)”. In the plane it is a disc; in space, a solid ball. The cloud
	<em>thickened by \(r\)</em> is the union of all these balls:
	\[ U_r = B(p_1, r) \cup B(p_2, r) \cup \dots \cup B(p_n, r). \]
	Unlike the bare cloud, \(U_r\) is a genuine shape, with genuine homology. When do two balls touch? Two discs of radius \(r\) around
	\(p\) and \(q\) overlap exactly when the gap between their centres is at most twice the radius:
	\[ B(p, r) \cap B(q, r) \neq \varnothing \iff \abs{p - q} \le 2r. \]
	Keep this “\(2r\)” in mind; it will come back many times.
</p>

<Figure id="fig-balls" num="3.7.2" title="Grow the balls" hint="Drag the slider or the strip below the picture">
	<GrowingBalls />
	{#snippet caption()}
		Eighteen points with a disc of radius \(r\) around each. The strip underneath records, for every \(r\), the number of pieces \(b_0\)
		and of holes \(b_1\) of the union \(U_r\). Small radii give dust, middle radii a ring, large radii a blob.
	{/snippet}
</Figure>

<p>Drag the radius in <a href="#fig-balls">Figure 3.7.2</a> from left to right and watch three regimes go by.</p>
<ul>
	<li>
		<strong>Dust.</strong> For tiny \(r\) every disc is alone: eighteen pieces, no holes, \(b_0 = 18\) and \(b_1 = 0\). This is just the
		bare cloud again.
	</li>
	<li>
		<strong>A ring.</strong> As \(r\) grows, neighbouring discs touch and pieces merge. Around \(r = 0.36\) the last gap in the necklace
		closes and the union becomes an annulus: \(b_1\) jumps to \(1\). (One straggler, up and to the right, stays on its own a little
		longer, until \(r \approx 0.46\).)
	</li>
	<li>
		<strong>A blob.</strong> Keep going and the discs crowd into the middle; near \(r = 0.95\) they cover the centre, the hole fills, and
		\(b_1\) drops back to \(0\). From then on it is one featureless blob.
	</li>
</ul>

<p>
	So which radius tells the truth? The honest answer is: none of them on its own. Too small and we see dust; too big and we see a blob;
	and in a less tidy cloud, middle radii also show small accidental holes, where three or four discs happen to leave a gap between them.
	Robert Ghrist, in a survey that brought the subject to many mathematicians, was blunt: the homology of the complex at any single scale
	is insufficient, and
</p>
<blockquote>
	“… it is a mistake to ask which value of ε is optimal. Nor does it suffice to know a simple ‘count’ of the number and types of holes
	appearing at each parameter value ε. Betti numbers are not enough.”
	<br /><span class="ui cite">— R. Ghrist, “Barcodes: The Persistent Topology of Data” (2008); his ε is a scale, like our \(r\)</span>
</blockquote>
<p>
	Homology alone has no sense of proportion. In Ghrist’s words, “the standard topological constructs of homology and homotopy offer no
	such slack in their strident rigidity: a hole is a hole no matter how fragile or fine.” The tiny accidental gap between three discs
	counts exactly as much as the big ring. Persistence is the missing sense of proportion.
</p>

<KeyIdea>
	<p>
		Do not choose a scale. Let \(r\) run through <em>all</em> values, watch the shape change, and record how long each feature lives.
		Features that persist over a long range of scales are good candidates for real structure; features that flicker in and out are
		candidates for noise.
	</p>
</KeyIdea>

<p>
	The strip under Figure 3.7.2 is a first step: it records the Betti numbers at every scale. But Ghrist’s warning applies to it too. Suppose
	the strip showed \(b_1 = 1\) from \(r = 0.2\) to \(r = 0.9\). That could be one hole that lives the whole time — or one hole on
	\([0.2, 0.5)\) handing over to a different hole on \([0.5, 0.9)\). (An interval written \([a, b)\) contains its left end \(a\) but
	not its right end \(b\); we will use such <em>half-open</em> intervals throughout.) The counts cannot tell these apart. We must keep track of
	<em>which</em> hole is which as \(r\) changes. For that, the computer needs something it can compute with: a simplicial complex.
</p>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="cech-and-rips">From balls to complexes: Čech and Vietoris–Rips</h2>

<p>
	A computer cannot store a union of discs — it is an infinite set of points. What it <em>can</em> do, very well, is compute the homology
	of a simplicial complex, by reducing boundary matrices as in <Ref to="homology/computing" />. So we want a
	<Term t="simplicial-complex">simplicial complex</Term> built from the points that “is” the union of balls, as far as homology can tell.
	There are two standard choices.
</p>

<h3>The nerve: recording who overlaps whom</h3>

<p>
	Here is a general recipe for turning a family of sets into a complex. Suppose you have sets \(U_1, \dots, U_n\). Make one vertex for each
	set, and fill in a simplex on a group of vertices whenever the corresponding sets have at least one point in common. Two overlapping
	sets give an edge; three sets with a common point give a triangle; and so on.
</p>

<Definition id="def-nerve" title="Nerve">
	<p>
		The <dfn>nerve</dfn> of a finite family of sets \(U_1, \dots, U_n\) is the abstract simplicial complex with vertices \(1, \dots, n\)
		in which \(\set{i_0, \dots, i_k}\) is a simplex exactly when
		\[ U_{i_0} \cap U_{i_1} \cap \dots \cap U_{i_k} \neq \varnothing. \]
	</p>
</Definition>

<p>
	This really is a simplicial complex in the sense of <Ref to="topology/simplicial-complexes" />: if a group of sets has a common point,
	so does every smaller group, so every face of a simplex is again a simplex. Apply the recipe to the balls of a point cloud and you get
	the first of our two complexes.
</p>

<Definition id="def-cech" title="Čech complex">
	<p>
		The <dfn>Čech complex</dfn> of a point cloud \(P\) at radius \(r\), written \(\check C_r(P)\), is the nerve of the balls
		\(B(p_1, r), \dots, B(p_n, r)\). So a set of points \(\set{p_{i_0}, \dots, p_{i_k}}\) spans a simplex exactly when their balls of
		radius \(r\) share at least one point.
	</p>
</Definition>

<p>
	(Čech is pronounced roughly “check”, after the Czech mathematician Eduard Čech.) There is a handy way to test the condition. The balls of radius
	\(r\) around some points share a point \(x\) exactly when one ball of radius \(r\) — the ball around \(x\) — contains all of those
	points. So a group of points enters the Čech complex at the radius of the <em>smallest disc that encloses them</em>. For two points that
	is half their distance, as we saw. For three points it depends on the shape of their triangle: for an acute triangle it is the radius of
	the circle through all three corners; for an obtuse one it is half the longest side.
</p>

<p>Why go to the trouble? Because of a classical theorem, which we state without proof.</p>

<Theorem id="thm-nerve" title="The nerve theorem">
	<p>
		Let \(U_1, \dots, U_n\) be closed convex sets in \(\R^d\) — or, in another common version, open sets in \(\R^d\) forming a <dfn>good cover</dfn>: every
		nonempty intersection of some of them is contractible. Then the nerve of the family has the same homotopy type as the union
		\(U_1 \cup \dots \cup U_n\). In particular, since balls are convex, for every point cloud \(P\), radius \(r\) and dimension \(k\),
		\[ H_k\big(\check C_r(P)\big) \;\cong\; H_k(U_r). \]
	</p>
</Theorem>

<p>
	Let us unpack the words. A set is <em>convex</em> if it contains the straight segment between any two of its points; balls are convex,
	and so is any intersection of balls. A space is <Term t="contractible">contractible</Term> if it can be shrunk continuously to a single point inside itself;
	a convex set is, since you can slide every point along a straight line to one fixed point. “The same homotopy type” (see
	<Ref to="topology/homotopy" />) means that the two spaces are <Term t="homotopy-equivalence">homotopy equivalent</Term>: one can be deformed into the other, allowing collapses but no tearing; such spaces have
	the same homology (<Ref to="homology/invariance" />). So the Čech complex, a finite list of simplices, has exactly the pieces, loops and
	hollows of the union of balls. Ghrist describes it as an object that, “though an abstract simplicial complex of potentially high
	dimension, behaves exactly like a subset of” Euclidean space.
</p>

<Warning title="The good-cover condition matters">
	<p>
		Cover a circle by two overlapping arcs, like two hands cupping a ring. Each arc is contractible, but the two arcs meet in
		<em>two</em> separate pieces, and two separate pieces are not contractible. The nerve has two vertices and one edge (the arcs do
		overlap): a segment, with no hole. The union is the whole circle, with a hole. The nerve theorem does not apply, and indeed its
		conclusion fails. With balls in \(\R^d\) this cannot happen: intersections of balls are convex.
	</p>
</Warning>

<h3>The Vietoris–Rips complex: only pairs matter</h3>

<p>
	The Čech complex is faithful but fussy: to decide whether ten points form a simplex you must find their smallest enclosing ball, which
	needs their coordinates and some geometry. The second construction asks a much cheaper question — only about <em>pairs</em>.
</p>

<Definition id="def-rips" title="Vietoris–Rips complex">
	<p>
		The <dfn>Vietoris–Rips complex</dfn> of \(P\) at radius \(r\), written \(\mathrm{VR}_r(P)\), has a simplex on
		\(\set{p_{i_0}, \dots, p_{i_k}}\) exactly when every two of these points are within distance \(2r\) of each other:
		\[ \abs{p_{i_a} - p_{i_b}} \le 2r \quad \text{for all } a, b. \]
		In words: the balls of radius \(r\) meet <em>in pairs</em>.
	</p>
</Definition>

<p>
	Notice what this means. Once you know the edges, you know everything: a simplex is present precisely when all of its edges are. Such a
	complex is called a <dfn>flag complex</dfn> (or clique complex). Ghrist again: for the Rips complex, “the combinatorics of the
	1-skeleton completely determines the complex”. The two complexes have the same vertices and the same edges — in both, an edge appears
	at the moment the two balls touch — but they can disagree about triangles and everything above.
</p>

<Notation title="Radius or diameter? Check before you compare">
	<p>
		In this book \(r\) is always the <strong>radius</strong> of the balls, so a Rips edge appears when two points are at distance at most
		\(2r\). Many books and programs instead use a “diameter” or “proximity” parameter \(\varepsilon = 2r\): an edge when the distance is
		at most \(\varepsilon\). Ghrist and Chazal–Michel use that convention for Rips, and at least one survey uses both. Our numbers are
		half of theirs. Every readout in this chapter shows both \(r\) and \(2r\), and bars are half-open intervals \([b, d)\).
	</p>
</Notation>

<Figure id="fig-cech-rips" num="3.7.3" title="Čech versus Rips" hint="Drag the points · slide r · try the other configurations">
	<CechVsRips />
	{#snippet caption()}
		The same points at the same radius, completed in two ways. Three points at mutual distance 2: for \(1 \le r \lt 2/\sqrt3 \approx
		1.155\) the discs meet in pairs but leave a tiny gap in the middle (rose dot). The Čech complex is a hollow triangle with
		\(b_1 = 1\), matching the union; the Rips complex fills the triangle in.
	{/snippet}
</Figure>

<p>
	Let us check the three-point picture by hand. Put three points at the corners of an equilateral triangle with side \(2\). The distance
	from each corner to the centre is \(2/\sqrt3 \approx 1.155\). All three edges appear at \(r = 1\), in both complexes. The Rips complex
	fills the triangle at the same moment, since all three edges are present. The Čech complex waits until the three discs share a point.
	The best candidate is the centre, which the discs reach only at \(r = 2/\sqrt 3\). So for \(1 \le r \lt 1.155\) the Čech complex is a
	hollow triangle with \(b_1 = 1\) — and the union of discs really does have a tiny hole in the middle. Čech is right about the union, as
	the nerve theorem promises. Rips is not.
</p>

<p>Fortunately, the two complexes can never drift far apart.</p>

<Proposition id="prop-sandwich" title="Rips is sandwiched between two Čech complexes">
	<p>For a point cloud \(P\) in \(\R^d\) and any \(r \ge 0\),</p>
	\[ \check C_r(P) \;\subseteq\; \mathrm{VR}_r(P) \;\subseteq\; \check C_{\sqrt2\, r}(P). \]
	<p>In the plane the second inclusion even holds with \(2r/\sqrt3 \approx 1.155\,r\) in place of \(\sqrt2\, r \approx 1.414\,r\).</p>
</Proposition>

<Proof>
	<p>
		The first inclusion is the triangle inequality. If the balls around some points share a point \(x\), then every two of them,
		\(p\) and \(q\), satisfy \(\abs{p - q} \le \abs{p - x} + \abs{x - q} \le r + r = 2r\), so they span a Rips simplex. The second
		inclusion says that points which are pairwise within \(2r\) always fit inside one ball of radius \(\sqrt 2\, r\); this is a classical
		fact of Euclidean geometry (Jung’s theorem), whose sharpest form gives \(2r/\sqrt3\) in the plane — exactly the equilateral triangle
		we just met. We omit its proof.
	</p>
</Proof>

<p>
	Why would anyone use the less faithful complex? Because it needs so little. To build \(\mathrm{VR}_r(P)\) you only need the table of
	distances between pairs of points — no coordinates, no geometry. That makes Rips usable for data that is not naturally a set of points
	in space at all, as long as you can say how far apart two items are: genomes, documents, people in a network. It is also cheap to store
	(the edges determine everything) and quick to build in any dimension. The price is that Rips can disagree with the union of balls, and
	occasionally it invents features that are not there. Ghrist warns that the Rips complex “is neither a subcomplex of” Euclidean space
	“nor does it necessarily behave like an \(n\)-dimensional space at all”. The sandwich above is the reassurance: a feature that survives
	in Rips from \(r\) all the way to \(\sqrt2\, r\) is a genuine feature of the union of balls of radius \(\sqrt2\, r\), because the map
	from \(\mathrm{VR}_r\) to \(\mathrm{VR}_{\sqrt2 r}\) passes through \(\check C_{\sqrt2 r}\).
</p>

<Question>
	<p>
		In Figure 3.7.3, choose <em>Hexagon</em> and set \(r = 0.93\). Six points in a flat plane — and the Rips complex reports \(b_2 = 1\): a
		hollow, two-dimensional void, like the inside of a ball. How can a flat picture enclose a void? Keep the question; we answer it in
		<a href="#caveats">the last section</a>.
	</p>
</Question>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="filtrations">Filtrations: a film instead of a photograph</h2>

<p>
	As \(r\) increases, simplices are added and never removed: if points are within \(2r\) of each other, they are certainly within \(2s\)
	for every \(s \ge r\). So the Rips complexes form a growing family, each containing the one before. This is the structure persistence
	works with.
</p>

<Definition id="def-filtration" title="Filtration">
	<p>
		A <dfn>filtration</dfn> of a finite simplicial complex \(K\) is a nested family of subcomplexes, one for each value of a parameter
		\(r\), such that
		\[ K_r \subseteq K_s \quad \text{whenever } r \le s, \]
		and \(K_r = K\) once \(r\) is large enough. In practice a filtration is described by giving every simplex \(\sigma\) of \(K\) an
		<dfn>entrance time</dfn> \(f(\sigma)\), with a face never entering after the simplices it belongs to; then \(K_r\) consists of the
		simplices with \(f(\sigma) \le r\).
	</p>
</Definition>

<Example title="The Rips and Čech filtrations">
	<p>
		In the Vietoris–Rips filtration of a point cloud, the entrance time of a simplex is half the largest distance between two of its
		points:
		\[ f(\sigma) = \tfrac12 \max_{p, q \in \sigma} \abs{p - q}, \qquad \mathrm{VR}_r(P) = \setb{\sigma}{f(\sigma) \le r}. \]
		A face involves fewer pairs, so it never enters later. In the Čech filtration the entrance time is the radius of the smallest ball
		enclosing the simplex’s points.
	</p>
</Example>

<p>
	Although \(r\) varies continuously, the complex changes only at the finitely many entrance times. A filtration is therefore like a film
	with finitely many distinct frames. We can even slow it down so that only one simplex arrives at a time: list the simplices as
	\(\sigma_1, \sigma_2, \dots, \sigma_m\) in order of entrance time, breaking ties by putting lower-dimensional simplices first and then
	using the labels. In this list every simplex comes after all of its faces, so each initial segment is a complex.
</p>

<h3>Every simplex either creates or destroys</h3>

<p>
	Something pleasantly rigid happens each time one simplex arrives: <em>exactly one</em> Betti number changes, by exactly one. To see why,
	work with \(\Z/2\) <Term t="chain">chains</Term>, where a chain is just a set of simplices and adding two chains keeps the simplices that occur an odd number
	of times (<Ref to="homology/chains" />). Suppose a \(k\)-simplex \(\sigma\) arrives. Its boundary \(\partial\sigma\) — the set of its
	faces of dimension \(k-1\) — was already present, and it is a <Term t="cycle">cycle</Term>, because \(\partial\partial = 0\). There are two cases.
</p>
<ul>
	<li>
		<strong>\(\partial\sigma\) was already a <Term t="boundary">boundary</Term></strong>, say \(\partial\sigma = \partial c\) for a chain \(c\) of the old complex.
		Then \(\sigma + c\) is a cycle, because \(\partial(\sigma + c) = \partial\sigma + \partial c = 2\,\partial\sigma = 0\) mod 2. It is a
		brand-new \(k\)-dimensional class: it contains \(\sigma\), and it is not a boundary, since no \((k+1)\)-simplex containing
		\(\sigma\) exists yet. So \(b_k\) goes up by one, and we call \(\sigma\) <dfn>positive</dfn>: it creates.
	</li>
	<li>
		<strong>\(\partial\sigma\) was not a boundary</strong> — it was a genuine \((k-1)\)-dimensional hole. Now it is the boundary of
		\(\sigma\), so that hole is filled: \(b_{k-1}\) goes down by one, and we call \(\sigma\) <dfn>negative</dfn>: it destroys. No new
		\(k\)-cycle appears, because any new one would have the form \(\sigma + c\) with \(\partial\sigma = \partial c\), which is the first
		case.
	</li>
</ul>
<p>
	Vertices are always positive: each new point is a new piece. An edge joining two different pieces is negative (two components become
	one), while an edge inside one piece is positive (it closes a loop). A triangle filling a loop that was still open is negative; a
	triangle whose boundary was already a boundary — the last face of a hollow tetrahedron, say — is positive: it closes a hollow. Notice
	that adding a \(k\)-simplex changes the alternating sum of Betti numbers \(\sum_i (-1)^i b_i\) by exactly \((-1)^k\), in both cases —
	and it changes \(\sum_i (-1)^i n_i\), where \(n_i\) is the number of \(i\)-simplices, by the same \((-1)^k\). Building any complex
	one simplex at a time, the two sums therefore stay equal, which proves the Euler–Poincaré formula \(\chi = \sum_i (-1)^i b_i\) of
	<Ref to="homology/homology-groups" /> over \(\Z/2\).
</p>

<Figure id="fig-flipbook" num="3.7.4" title="A filtration, one simplex at a time" hint="Press play, or step with the arrows">
	<FlipBook />
	{#snippet caption()}
		The Vietoris–Rips filtration of five points, one simplex per step. Teal steps destroy a class (two pieces merge, or a loop is
		filled); gold steps create one (a new loop). The barcode grows with the film: a bar starts when its class is born and stops when it
		dies.
	{/snippet}
</Figure>

<p>
	Step through <a href="#fig-flipbook">Figure 3.7.4</a>. First the five points appear: five pieces, five bars. Then the edges arrive in order
	of length. The first four join pieces together; then the edge \(04\) closes a loop around the middle, and a gold bar starts. Next the
	diagonal \(02\) closes a small loop, but the triangle \(012\) arrives in the very same instant and fills it — a class born and killed at
	once, a bar of length zero that we simply do not draw. The same happens with \(03\) and \(023\). Finally the triangle \(034\) fills the
	last gap, the big loop becomes the boundary of three triangles, and its bar ends.
</p>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="birth-and-death">Births, deaths and the elder rule</h2>

<p>
	We can now say precisely what it means for a hole to persist. The key fact is that inclusions carry homology classes forward. If
	\(r \le s\), every cycle of \(K_r\) is still a cycle of \(K_s\), and every boundary of \(K_r\) is still a boundary of \(K_s\) (the same
	chain still has the same boundary). So each class of \(H_k(K_r)\) has a well-defined <em>future</em> in \(H_k(K_s)\): the class of the
	same cycle. (This is the <Term t="induced-map">map induced</Term> by the inclusion, as in <Ref to="homology/invariance" />.) As \(r\) grows, a class can stay
	alive, it can become zero (its cycles become boundaries), or it can become equal to another class (the two merge).
</p>

<Definition id="def-birth-death" title="Birth, death, persistence">
	<p>
		A class \(\gamma\) in \(H_k(K_b)\) is <dfn>born</dfn> at \(b\) if it is not the future of any class that existed before \(b\). It
		<dfn>dies</dfn> at \(d \gt b\) if at \(d\) it becomes zero or merges into a class that was born earlier — an older class. Its
		<dfn>persistence</dfn> (or lifetime) is \(d - b\). A class that never dies has death \(d = \infty\).
	</p>
</Definition>

<p>
	The phrase “merges into an older class” hides a convention, and it is worth seeing why it is the right one. When two classes merge,
	only one of them can continue. Which one should we say has died? Herbert Edelsbrunner and John Harer gave the rule a name:
</p>
<blockquote>
	“Elder Rule. At a juncture, the older of the two merging paths continues and the younger path ends.”
	<br /><span class="ui cite">— H. Edelsbrunner &amp; J. Harer, Computational Topology (2010)</span>
</blockquote>
<p>
	The cleanest place to watch it is not a point cloud but a landscape. Take a function \(f\) of one variable — the height of a mountain
	range — and let water rise to level \(t\). The flooded part \(\setb{x}{f(x) \le t}\) (a <dfn>sublevel set</dfn>) falls into separate
	lakes. As \(t\) increases these sets grow, so they form a filtration, and their \(H_0\) — the lakes — has a barcode.
</p>

<Figure id="fig-elder" num="3.7.5" title="The elder rule" hint="Drag the water level up and down in the picture, or use the slider">
	<WaterLevel />
	{#snippet caption()}
		Lakes in a landscape. A lake is born when the water reaches a valley floor and dies when it spills over a pass into a lake with a
		<em>lower</em> floor — the elder rule. Each bar runs from a floor height to a pass height and is coloured like its lake; when two lakes
		merge, the merged lake keeps the colour of the older one.
	{/snippet}
</Figure>

<p>
	Raise the water in <a href="#fig-elder">Figure 3.7.5</a>. Valley \(B\) is the deepest, so its lake is born first; then \(D\), \(A\) and
	\(C\) follow, each born when the water reaches its floor. At the pass between \(B\) and \(C\) the two lakes merge. Lake \(C\) is the
	younger — its floor is higher, so it was born later — and by the elder rule its bar ends there; the merged lake carries on as \(B\).
	The rule is not arbitrary. It is exactly what makes the bars count correctly: for any two levels \(t \le u\), the number of bars that
	cover the whole stretch from \(t\) to \(u\) equals the number of lakes at level \(u\) that already contained water at level \(t\).
	Kill the older lake instead, and that count goes wrong.
</p>

<p>
	In a Rips filtration every point is born at the same moment, \(r = 0\), so “older” is a tie. We break ties by the labels: smaller
	label, older piece. You saw this in the flip-book: when the pieces \(\set{0,1,2}\) and \(\set{3,4}\) met, the piece whose oldest point
	is \(3\) was declared the younger, and its bar ended.
</p>

<Remark title="Single-linkage clustering in disguise">
	<p>
		Each finite \(H_0\) bar of a Rips filtration ends at an edge that joins two pieces, and the edges that do so are exactly the edges of
		a <em>minimum spanning tree</em> of the points — the cheapest network of edges connecting all of them. So the \(H_0\) barcode lists
		the lengths of the minimum spanning tree (halved, in our radius convention). Statisticians know this picture as single-linkage
		hierarchical clustering. Persistence in dimension 0 is clustering at every scale.
	</p>
</Remark>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="barcodes">Barcodes and persistence diagrams</h2>

<p>
	Births and deaths can be drawn. Give every class an interval from its birth to its death, and stack the intervals.
</p>

<Definition id="def-barcode" title="Barcode and persistence diagram">
	<p>
		The <dfn>barcode</dfn> of a filtration in dimension \(k\) is the collection (with repetitions allowed) of the intervals
		\([b, d)\) of the \(k\)-dimensional classes, drawn as horizontal bars. The <dfn>persistence diagram</dfn> records the same
		information as points \((b, d)\) of the plane, birth across and death up. Since \(d \gt b\), every point lies above the diagonal
		\(d = b\); classes that never die are drawn on a separate line marked \(\infty\) at the top.
	</p>
</Definition>

<p>
	That such intervals exist at all is a theorem, not a definition. Classes can merge in complicated ways, so it is not obvious that one
	can always find a set of classes each with a single birth and a single death. Over a field such as \(\Z/2\) one can.
</p>

<Theorem id="thm-structure" title="Persistence splits into bars">
	<p>
		For a filtration of a finite simplicial complex, with coefficients in a field such as \(\Z/2\), one can choose a basis of every
		\(H_k(K_r)\) in a compatible way, so that each basis class is born at one value of \(r\) and dies at a later one (or never). The
		resulting multiset of intervals \([b, d)\) does not depend on the choices made.
	</p>
</Theorem>

<p>
	This was proved by Afra Zomorodian and Gunnar Carlsson in 2005. The algebra behind it is a structure theorem very much like the
	classification of finitely generated abelian groups in <Ref to="foundations/abelian-groups" />, and the next section turns its proof
	into an algorithm. Ghrist sums up the meaning: “A barcode is best thought of as the persistence analogue of a Betti number.” Here is
	how to read one.
</p>
<ul>
	<li>
		<strong>Betti numbers at a single scale.</strong> \(b_k(K_r)\) is the number of \(k\)-bars that contain \(r\). Draw a vertical line
		at \(r\) and count the bars it crosses. In the diagram, count the points with \(b \le r \lt d\): the points in the upper-left quadrant
		with its corner on the diagonal at \((r, r)\).
	</li>
	<li>
		<strong>What survives from one scale to another.</strong> The number of bars that contain the whole interval \([r, s]\) is the number
		of independent classes alive at \(r\) that are still alive at \(s\). It is called a <dfn>persistent Betti number</dfn>
		\(b_k^{r,s}\), and in the language of <Ref to="foundations/linear-algebra" /> it is the rank of the map
		\(H_k(K_r) \to H_k(K_s)\).
	</li>
	<li>
		<strong>Long and short.</strong> A long bar, or a point far above the diagonal, is a feature that survives over a wide range of
		scales. A short bar, or a point hugging the diagonal, flickers in and out.
	</li>
</ul>

<p>
	Now you can play. <a href="#fig-playground">Figure 3.7.6</a> computes the full Vietoris–Rips barcode of a point cloud — every triangle is
	allowed to appear eventually, so every loop eventually dies — and links three views of it: the cloud with its balls and complex at the
	current radius, the barcode, and the diagram.
</p>

<Figure
	size="wide"
	id="fig-playground"
 num="3.7.6"
	title="The persistence playground"
	hint="Drag points · switch to Add or Erase to edit · drag across the barcode · hover or tap a bar"
>
	<Playground />
	{#snippet caption()}
		The barcode (\(H_0\) teal, \(H_1\) gold) and persistence diagram of the Vietoris–Rips filtration of the cloud above, with the
		current radius \(r\) marked in both. Hover over or tap a gold bar to see the loop it tracks: the white edge that closes it at its
		birth and the teal triangle that fills it at its death. A teal bar shows the piece that dies.
	{/snippet}
</Figure>

<p>Some things to try:</p>
<ul>
	<li>
		<strong>Noisy circle.</strong> One long gold bar, and a crowd of short teal bars plus one teal bar that never ends. Slide \(r\) into
		the long gold bar and the canvas shows a ring with \(b_1 = 1\). Hover over the bar to see its loop.
	</li>
	<li>
		<strong>Two circles.</strong> Two long gold bars — the small circle’s loop dies first — and one long teal bar: the two clusters stay
		apart until the balls bridge the gap between them.
	</li>
	<li><strong>Figure eight.</strong> Two long gold bars, for the two lobes.</li>
	<li><strong>Blob.</strong> Only short gold bars: this is what “no robust loop” looks like.</li>
	<li>
		<strong>Random.</strong> A scatter of short and medium bars. Random points do leave empty patches, some of them fairly large, but none
		as dominant as the circle’s hole. Press <em>New sample</em> a few times and compare.
	</li>
	<li>
		<strong>Break it.</strong> Load the noisy circle, choose <em>Add</em>, and put one point in the middle of the circle. Watch the long
		gold bar shrink. Then <em>Clear</em> and draw your own shapes.
	</li>
</ul>

<p>
	Reading the picture as “long bars are signal, short bars are noise” is the standard first step, and Ghrist states it plainly: features
	“which persist over a significant parameter range are to be considered as signal with short-lived features as noise.” It is a good
	rule of thumb, but only that. Edelsbrunner and Harer are more cautious: “noise is in the eye of the beholder, and even if we agreed on
	the distinction, the de-noising effort would be made difficult by dependencies that frequently lead to unintended side-effects.” And
	Otter and colleagues add that the interpretation, “while widespread, … is not correct in general”: in some applications the small,
	short-lived rings are precisely the structure being studied. Persistence <em>measures</em>; deciding what matters is still your job.
</p>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="reduction">How the computer finds the bars</h2>

<p>
	You could compute the homology of every frame of the film separately, with the methods of <Ref to="homology/computing" />. The hard
	part is matching classes between frames — deciding which hole at \(r = 0.4\) is “the same” as which hole at \(r = 0.5\). The standard
	algorithm, due to Edelsbrunner, Letscher and Zomorodian (2002), does everything in a single left-to-right sweep through a single matrix.
</p>

<p>
	List all simplices in filtration order, \(\sigma_1, \dots, \sigma_m\), faces before cofaces. The <dfn>filtration boundary matrix</dfn>
	\(D\) is the \(m \times m\) matrix over \(\Z/2\) with
	\[ D[i, j] = \begin{cases} 1 & \text{if } \sigma_i \text{ is a face of } \sigma_j \text{ of one dimension less}, \\ 0 & \text{otherwise}. \end{cases} \]
	So column \(j\) lists the boundary of \(\sigma_j\). It is just the boundary matrices \(\partial_1, \partial_2, \dots\) of
	<Ref to="homology/computing" /> glued into one, with rows and columns in order of arrival. For a nonzero column, define
	\[ \mathrm{low}(j) = \text{the row of the lowest } 1 \text{ in column } j, \]
	the most recently arrived simplex in the boundary of column \(j\).
</p>

<Definition id="def-reduction" title="The reduction algorithm">
	<p>Work through the columns from left to right. For each \(j = 1, 2, \dots, m\):</p>
	<ul>
		<li>
			while column \(j\) is nonzero and some earlier column \(j' \lt j\) has \(\mathrm{low}(j') = \mathrm{low}(j)\), add column \(j'\)
			to column \(j\) (mod 2).
		</li>
	</ul>
	<p>Then read off the answer:</p>
	<ul>
		<li>
			if column \(j\) ends nonzero with \(\mathrm{low}(j) = i\), then \(\sigma_i\) created a class and \(\sigma_j\) killed it: a bar
			\([f(\sigma_i), f(\sigma_j))\) in dimension \(\dim \sigma_i\);
		</li>
		<li>
			if column \(j\) ends zero, \(\sigma_j\) is positive; if moreover \(j\) is nobody’s low, its class never dies: a bar
			\([f(\sigma_j), \infty)\).
		</li>
	</ul>
</Definition>

<p>
	That is the whole algorithm: Gaussian elimination over \(\Z/2\) (<Ref to="foundations/linear-algebra" />), with one restriction — you
	may only add a column to a column on its <em>right</em>, that is, an older simplex to a younger one. <a href="#fig-reduction">Figure 3.7.7</a>
	runs it on the smallest interesting filtration: three vertices at time \(0\), the edges \(01\), \(12\), \(02\) at times \(1\), \(2\),
	\(3\), and the triangle \(012\) at time \(4\).
</p>

<Figure size="wide" id="fig-reduction" num="3.7.7" title="The reduction algorithm, step by step" hint="Press play, or step with the arrows">
	<ReductionStepper />
	{#snippet caption()}
		The filtration boundary matrix of a triangle being built. Shaded cells mark each column’s low; rose cells have just changed. Column
		\(02\) clashes twice, becomes zero, and so creates the loop; the triangle’s column then has its low at \(02\), so the triangle kills
		that loop. The result is the barcode \(H_0\colon [0,\infty), [0,1), [0,2)\) and \(H_1\colon [3,4)\).
	{/snippet}
</Figure>

<p>
	In the example, columns \(01\) and \(12\) have lows \(1\) and \(2\): the edges kill the pieces born with vertices \(1\) and \(2\)
	(ties broken by labels, so the younger vertex dies). Column \(02\) has low \(2\), which column \(12\) already owns, so we add column
	\(12\); now the low is \(1\), owned by column \(01\), so we add that too, and the column becomes zero. The edge \(02\) therefore created
	something — and the columns we added, \(01 + 12 + 02\), are exactly the loop it closed. The triangle’s column has its low at \(02\),
	which nobody owns: the triangle kills the loop born with \(02\), giving the bar \([3, 4)\).
</p>

<Intuition title="Why does it work?">
	<p>
		Adding an earlier column to a later one replaces \(\sigma_j\) by “\(\sigma_j\) plus older simplices”, which does not change anything
		about <em>when</em> things become available. After the sweep, column \(j\) is the boundary of a chain whose newest simplex is
		\(\sigma_j\). If that boundary is zero, the chain is a new cycle: \(\sigma_j\) created a class. If it is not zero, its lowest entry
		\(i\) tells you that this boundary — a cycle — was completed exactly when \(\sigma_i\) arrived, and was filled in exactly when
		\(\sigma_j\) arrived. Because all the lows end up different, each death is assigned to the youngest class that could have died:
		the elder rule is built into the word “lowest”. A theorem of Edelsbrunner and Harer guarantees that the pairs do not depend on the
		order in which you perform the additions.
	</p>
</Intuition>

<h3>Computational reality</h3>

<p>
	For a handful of points this is instant. For real data it is a serious computation, for two reasons.
</p>
<ul>
	<li>
		<strong>Size.</strong> A Rips complex on \(n\) points can have \(\binom n2\) edges and \(\binom n3\) triangles. For \(n = 1000\)
		points that is \(499{,}500\) edges and \(166{,}167{,}000\) triangles — and computing \(H_k\) needs all simplices up to dimension
		\(k + 1\).
	</li>
	<li>
		<strong>Time.</strong> In the worst case the standard algorithm takes time proportional to the cube of the number of simplices, and
		examples are known where the worst case really happens.
	</li>
</ul>
<p>
	In practice it runs far faster, thanks to a series of tricks: <em>clearing</em> (a column known to become zero need not be reduced),
	reducing the <em>coboundary</em> matrix instead, never storing the matrix at all but generating its columns on the fly, and spotting
	pairs that need no work. Ulrich Bauer’s program <strong>Ripser</strong> combines them; in the 2017 benchmark of Otter and colleagues,
	“ripser is the best-performing library currently available for the computation of PH with the Vietoris–Rips complex”, followed by
	<strong>GUDHI</strong> and DIPHA. Figure 3.7.6 uses the same strategy as Ripser on a small scale: it reduces the coboundary matrix (columns
	are edges, rows are triangles) with clearing, and finds the whole barcode of 64 points — about forty thousand triangles — in a fraction
	of a second, in your browser.
</p>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="stability">Stability: why barcodes can be trusted</h2>

<p>
	Real measurements are never exact. If a tiny wobble of the data could change the barcode completely, barcodes would be useless. The
	most important theorem about persistence says that this cannot happen — provided we measure the change in the right way.
</p>

<p>
	How far apart are two persistence diagrams? Try to <em>match</em> their points one to one, moving each point as little as possible. To
	move \((b, d)\) to \((b', d')\) costs \(\max(\abs{b - b'}, \abs{d - d'})\), the larger of the two shifts. There is one more option, and
	it is essential: a point may instead be matched to the diagonal, at a cost equal to its distance from the diagonal, \((d - b)/2\). This
	lets short bars appear or disappear cheaply, as they should — a bar of length zero is no bar at all.
</p>

<Definition id="def-bottleneck" title="Bottleneck distance">
	<p>
		The <dfn>bottleneck distance</dfn> \(d_B(\mathcal D, \mathcal D')\) between two persistence diagrams is the smallest number
		\(\delta\) for which there is a matching — each point of either diagram paired with a point of the other or with the diagonal — in
		which no point moves by more than \(\delta\).
	</p>
</Definition>

<Theorem id="thm-stability" title="Stability">
	<p>
		If every point of a cloud \(P\) is moved by at most \(\delta\), giving a cloud \(P'\), then in every dimension \(k\) the persistence
		diagrams of the Vietoris–Rips filtrations of \(P\) and \(P'\) satisfy
		\[ d_B\big(\mathcal D_k(P), \mathcal D_k(P')\big) \;\le\; \delta, \]
		and the same holds for the Čech filtrations. (In the diameter convention \(\varepsilon = 2r\), the bound reads \(2\delta\).)
	</p>
</Theorem>

<p>
	For functions this is the theorem of David Cohen-Steiner, Herbert Edelsbrunner and John Harer (2007): if two functions differ by at
	most \(\delta\) everywhere, their diagrams are within bottleneck distance \(\delta\). The version for point clouds follows from it and
	from later work of Chazal, de Silva and Oudot. The reason it is true is easy to see. Moving each point by at most \(\delta\) changes
	every distance by at most \(2\delta\) (triangle inequality again), so it changes the entrance radius of every simplex by at most
	\(\delta\). The film stays the same film; every event is merely re-timed by at most \(\delta\). The theorem says that re-timing by at
	most \(\delta\) moves every feature by at most \(\delta\).
</p>

<Figure size="wide" id="fig-stability" num="3.7.8" title="Stability" hint="Slide the noise · press New noise for a different jiggle">
	<StabilityDemo />
	{#snippet caption()}
		Every point is pushed a random distance of at most \(\delta\) (rose segments). Hollow markers show the original diagram, solid ones
		the new diagram, joined by the best matching. Each long-lived point stays inside its dashed box of half-width \(\delta\); points may
		only appear or vanish inside the pink band near the diagonal. The computed bottleneck distances never exceed \(\delta\).
	{/snippet}
</Figure>

<p>Read the theorem from the point of view of a single bar.</p>
<ul>
	<li>
		A bar longer than \(2\delta\) cannot disappear: matching it to the diagonal would cost more than \(\delta\). It survives, and each of
		its ends moves by at most \(\delta\).
	</li>
	<li>A bar shorter than \(2\delta\) may vanish, and new bars shorter than \(2\delta\) may appear.</li>
</ul>
<p>
	That is the precise sense in which “long bars are robust”. Weinberger suggests a thought experiment: compare the function \(x^2\) with
	\(x^2 + \sin(10000x)\). They never differ by more than \(1\), so their diagrams are within distance \(\delta = 1\): the big valley is
	still there, its floor moved by at most \(1\). But the second function wiggles about sixteen hundred times per unit of length, and almost
	every wiggle makes a small valley of its own — a flood of new bars, each of length at most about \(2 = 2\delta\), exactly the
	most the theorem allows to appear out of nothing.
</p>

<Warning title="Moving points is not adding points">
	<p>
		The theorem controls clouds whose points move a little. It says nothing reassuring about adding a single far-flung point, or a point
		in the middle of a circle: such an outlier is far from every original point, so it is a large change in the sense of the theorem. You
		saw in the playground what one point at the centre does to a circle’s bar.
	</p>
</Warning>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="applications">What persistence has found</h2>

<p>
	Since the early 2000s persistent homology has become a standard tool of <em>topological data analysis</em>. A few examples show the
	range; <a href="#fig-gallery">Figure 3.7.9</a> sketches six of them.
</p>

<Figure size="wide" id="fig-gallery" num="3.7.9" title="A gallery of applications" hint="Schematic pictures, not data">
	<AppGallery />
	{#snippet caption()}
		Six fields where persistence has found structure. The pictures are schematic sketches of the idea, not the data of the cited studies.
	{/snippet}
</Figure>

<ul>
	<li>
		<strong>Sensor networks.</strong> Vin de Silva and Robert Ghrist (2007) considered sensors scattered over a region, each able to
		detect what is near it and to hear nearby sensors, but with no idea where anything is. From the “who can hear whom” graph alone they
		built Rips complexes and proved that, under suitable assumptions on the sensing and communication ranges, a homology computation —
		relative to the sensors on the fence around the region — certifies that the sensing discs leave no gap.
	</li>
	<li>
		<strong>Natural images.</strong> Gunnar Carlsson, Tigran Ishkhanov, Vin de Silva and Afra Zomorodian (2008) studied millions of
		\(3 \times 3\) patches cut from photographs, normalised for brightness and contrast, and kept the densest ones. The \(H_1\) barcode
		has one long bar: the patches crowd around a circle of “edge” patches, one for each angle of a straight light–dark edge. At finer
		density settings three circles appear, and \(H_2\), computed with \(\Z/2\) and \(\Z/3\) coefficients, points to a Klein bottle
		containing them. A curious by-product, in Ghrist’s words: “the axis of pixellation appears less relevant than the axis of gravity in
		natural image data” — horizontal and vertical edges are special because of the world, not because of the camera.
	</li>
	<li>
		<strong>Evolution.</strong> Joseph Chan, Gunnar Carlsson and Raul Rabadán (2013) observed that pure descent draws a tree, and a tree
		has no loops. Loops in the persistent \(H_1\) of genetic-distance data therefore signal reassortment and recombination, where
		lineages exchange genetic material.
	</li>
	<li>
		<strong>Neuroscience.</strong> Chad Giusti, Eva Pastalkova, Carina Curto and Vladimir Itskov (2015) computed Betti curves of the
		clique complexes of neural correlation matrices, and could tell activity organised by an underlying geometry — such as hippocampal
		place cells — from random structure.
	</li>
	<li>
		<strong>Materials.</strong> Yasuaki Hiraoka and colleagues (2016) used persistence diagrams of atomic configurations to distinguish
		liquid, glass and crystal, and to describe the hierarchy of rings formed by the atoms of amorphous solids.
	</li>
	<li>
		<strong>Cosmology and biology.</strong> Pratyush Pranav and colleagues (2017) measured the “cosmic web” of galaxies — clusters,
		filaments and voids — with persistent Betti numbers. Kelin Xia and Guo-Wei Wei (2014) analysed protein structure, flexibility and
		folding with persistent homology. Other studies range from “political islands” in voting maps (Feng and Porter, 2021) to the shape of
		brain arteries and the flocking of animals.
	</li>
</ul>

<Remark title="Not every topological data analysis is persistence">
	<p>
		A well-known result that identified a subgroup of breast cancers (Nicolau, Levine and Carlsson, 2011) used a different topological
		tool called <em>Mapper</em>, which builds a graph summarising the data, not persistent homology. The field of topological data
		analysis is broader than this chapter.
	</p>
</Remark>

<History title="Three discoveries at once">
	<p>
		The idea of persistence emerged around the turn of the century in three places independently: with Patrizio Frosini, Massimo Ferri
		and collaborators in Bologna, in the doctoral work of Vanessa Robins in Boulder, and in Herbert Edelsbrunner’s group at Duke. As
		Edelsbrunner and Harer recall, “all three developments happened roughly simultaneously”. The complex itself is much older: Leopold
		Vietoris used it in 1927, in the early days of homology theory; the name of Eliyahu Rips was attached later, after he used it in
		geometric group theory.
	</p>
</History>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="caveats">Caveats: what persistence cannot do</h2>

<h3>Rips can invent shapes</h3>

<p>
	Here is the answer to the hexagon puzzle of Figure 3.7.3. Put six points evenly around a circle of radius \(1\). Neighbours are at distance
	\(1\), points two apart at distance \(\sqrt 3 \approx 1.73\), and opposite points at distance \(2\). For
	\(\sqrt3/2 \le r \lt 1\), the Rips complex contains every edge except the three long diagonals. Now notice: the three opposite pairs
	\(\set{0,3}\), \(\set{1,4}\), \(\set{2,5}\) are not joined, and every other pair is. That is exactly the pattern of an octahedron, whose
	six corners come in three opposite pairs. The flag complex fills in the eight triangles that use one point from each pair, and there it
	stops, since no four points are joined to one another. The result is a hollow octahedron — a 2-sphere — with \(b_2 = 1\).
</p>

<Figure id="fig-hexagon" num="3.7.10" title="A void that is not there">
	<HexagonSphere />
	{#snippet caption()}
		Six evenly spaced points at radius \(r = 0.9\). Drawn in the plane, the Rips complex looks like a filled hexagon; as an abstract
		complex it is a hollow octahedron (\(b_0 = 1, b_1 = 0, b_2 = 1\)). The union of discs instead has a hole in the middle (\(b_1 = 1\),
		\(b_2 = 0\)), which the Čech complex correctly reports.
	{/snippet}
</Figure>

<p>
	The data have no void; the union of discs has a hole in the middle instead, uncovered until \(r = 1\). The \(H_2\) bar
	\([\sqrt3/2, 1)\) is an artefact of the Rips construction. This is not a curiosity of six points. Michał Adamaszek and Henry Adams proved
	(2017) that the Rips complexes of a whole circle pass through the homotopy types of the spheres \(S^1, S^3, S^5, \dots\) as the scale
	grows. The sandwich proposition limits the damage, but the moral stands: the Rips complex is a convenient approximation, not “the
	shape of the data”.
</p>

<h3>Outliers</h3>

<p>
	One misplaced point can do a lot. A point in the middle of a ring of radius \(R\) connects to everything at once and fills the hole
	early: at \(r = R/2\) instead of at about \(0.87R\) (Exercise 7). A point far from everything else produces a long \(H_0\) bar that says nothing
	about the shape. The stability theorem offers no protection, because adding a point is not a small move. In practice data are often
	cleaned first, for instance by keeping only points in dense regions — exactly what Carlsson and colleagues did with the image patches.
</p>

<h3>What the barcode forgets</h3>

<p>
	A barcode records when features are born and when they die, and nothing else. It does not say where a hole is, how many points it
	involves, or what the cloud looks like away from its holes. Rotating or moving a cloud does not change its barcode at all (distances are
	unchanged), and quite different clouds can share a barcode. It is a summary — a very good one — and summaries lose information.
</p>

<h3>Cost and dimension</h3>

<p>
	Finally, everything grows quickly: the number of simplices with the number of points, and the work with the dimension of homology you
	ask for. Most applications compute \(H_0\), \(H_1\) and perhaps \(H_2\), on thousands rather than millions of points, or on carefully
	chosen subsamples.
</p>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Four points on a square">
	<p>
		Compute by hand the Vietoris–Rips barcode, in dimensions 0 and 1, of the four corners \((0,0)\), \((1,0)\), \((1,1)\), \((0,1)\) of
		a unit square. Use the radius convention.
	</p>
	{#snippet hint()}
		<p>
			There are only two different distances: \(1\) for the sides and \(\sqrt2\) for the diagonals. Edges appear at half the distance.
			What happens at the moment the four sides appear together, and at the moment the diagonals appear?
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			At \(r = 0\) there are four pieces. At \(r = \tfrac12\) all four sides appear at once. Three of them join the four pieces into
			one, so three \(H_0\) bars end there; the fourth side closes the square, so an \(H_1\) bar begins. At
			\(r = \sqrt2/2 \approx 0.707\) the two diagonals appear, and with them all four triangles (and the tetrahedron), so the square is
			filled and its loop dies. The barcode is
			\[ H_0\colon\ [0, \infty),\ [0, \tfrac12),\ [0, \tfrac12),\ [0, \tfrac12); \qquad H_1\colon\ [\tfrac12, \tfrac{\sqrt2}{2}). \]
			(In the diameter convention, these become \([0, 1)\) and \([1, \sqrt2)\).) The four triangles also make a hollow tetrahedron for
			an instant, but the solid tetrahedron arrives at the same radius, so that \(H_2\) bar has length zero.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Čech and Rips disagree">
	<p>
		Three points form an equilateral triangle with side \(2\). Write down the \(H_1\) barcode of the Čech filtration and of the
		Vietoris–Rips filtration. Which one describes the union of discs?
	</p>
	{#snippet solution()}
		<p>
			In both filtrations the three edges appear at \(r = 1\). In Rips the triangle appears at \(r = 1\) as well, so the loop closed by
			the last edge is filled instantly: the \(H_1\) barcode is empty. In Čech the triangle appears only when the three discs share a
			point, at the circumradius \(2/\sqrt3 \approx 1.155\). So the Čech \(H_1\) barcode is the single bar \([1, 2/\sqrt3)\). By the
			nerve theorem the Čech filtration describes the union of discs, which indeed has a small hole in the middle for
			\(1 \le r \lt 1.155\). Both have the same \(H_0\) bars: \([0,\infty)\) and two copies of \([0, 1)\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Run the algorithm yourself">
	<p>
		A filtration on the vertices \(0, 1, 2, 3\) (all at time \(0\)) adds the edges \(01\) and \(12\) at time \(1\), \(23\) at time
		\(2\), \(03\) at time \(3\), then \(02\) and the triangle \(012\) at time \(4\), and finally the triangle \(023\) at time \(5\). Write
		the \(11 \times 11\) filtration boundary matrix (or just its columns), run the reduction algorithm, and read off the barcode.
	</p>
	{#snippet hint()}
		<p>
			Columns of vertices are zero. Process the edges in order; the column of \(03\) will clash three times. The triangle \(023\) will
			clash once.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Columns \(01\), \(12\), \(23\) have lows \(1\), \(2\), \(3\): they kill the pieces born with vertices \(1\), \(2\), \(3\) at times
			\(1\), \(1\), \(2\). Column \(03 = \set{0, 3}\) clashes with \(23\) (sum \(\set{0, 2}\)), then with \(12\) (sum \(\set{0,1}\)),
			then with \(01\) (sum \(0\)): the edge \(03\) creates the square loop at time \(3\). Column \(02 = \set{0,2}\) clashes with \(12\),
			then with \(01\), and becomes zero: \(02\) creates a second loop at time \(4\). Column \(012 = \set{01, 12, 02}\) has low \(02\),
			unowned, so the triangle \(012\) kills the class born with \(02\), at once: a pair of length zero. Column
			\(023 = \set{02, 23, 03}\) has low \(02\), now owned by \(012\); adding gives \(\set{01, 12, 23, 03}\) — the square — with low
			\(03\). So \(023\) kills the class born with \(03\). The barcode:
			\[ H_0\colon\ [0, \infty),\ [0, 1),\ [0, 1),\ [0, 2); \qquad H_1\colon\ [3, 5). \]
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="The elder rule by hand">
	<p>
		A mountain profile has, from left to right, valley floors at heights \(1\), \(2\) and \(0\), separated by a pass of height \(5\)
		(between the first two valleys) and a pass of height \(6\) (between the last two). Its ends are higher than everything else. Find
		the \(H_0\) barcode of the rising water level.
	</p>
	{#snippet solution()}
		<p>
			Lakes are born at \(t = 0\), \(1\), \(2\) (the third, first and second valleys). At \(t = 5\) the first two lakes meet; the one
			with floor \(2\) is younger and dies, giving \([2, 5)\). At \(t = 6\) the merged lake (floor \(1\)) meets the lake with floor
			\(0\), which is older, so the bar \([1, 6)\) ends. The deepest lake never dies. The barcode is \([0, \infty)\), \([1, 6)\),
			\([2, 5)\). Notice that the bar that ends at the higher pass belongs to the <em>first</em> valley, not to the valley next to that
			pass.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Reading a diagram">
	<p>
		The \(H_1\) persistence diagram of a filtration consists of the four points \((0.1, 0.15)\), \((0.2, 0.9)\), \((0.3, 0.5)\) and
		\((0.6, 0.65)\). (a) What is \(b_1\) at \(r = 0.4\)? (b) How many independent loops alive at \(r = 0.4\) are still alive at
		\(r = 0.7\)? (c) Which loops would you call robust?
	</p>
	{#snippet solution()}
		<p>
			(a) Count the points with birth \(\le 0.4 \lt\) death: \((0.2, 0.9)\) and \((0.3, 0.5)\), so \(b_1 = 2\). (b) Count the bars that
			contain all of \([0.4, 0.7]\): only \([0.2, 0.9)\), so the persistent Betti number \(b_1^{0.4,\,0.7}\) is \(1\). (c) The bar
			\([0.2, 0.9)\) lives for \(0.7\), far longer than the others (\(0.05\), \(0.2\), \(0.05\)); it is the only clearly robust loop.
			The bar \([0.3, 0.5)\) is borderline — whether it matters depends on the application.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="What stability guarantees">
	<p>
		A cloud has \(H_1\) diagram \(\set{(0.20, 1.10),\ (0.30, 0.38)}\). You move every point by at most \(0.05\). What can you say about
		the new \(H_1\) diagram?
	</p>
	{#snippet solution()}
		<p>
			By the stability theorem there is a matching in which nothing moves by more than \(0.05\). The point \((0.20, 1.10)\) is at
			distance \(0.45\) from the diagonal, so it cannot be matched to the diagonal: the new diagram has a point with birth between
			\(0.15\) and \(0.25\) and death between \(1.05\) and \(1.15\) — the big loop survives. The point \((0.30, 0.38)\) is only \(0.04\)
			from the diagonal, so it may disappear. Any other new point must lie within \(0.05\) of the diagonal, so it represents a bar of
			length at most \(0.1\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="An outlier at the centre">
	<p>
		Many points are spread evenly around a circle of radius \(R\). Explain why the \(H_1\) bar of the circle ends at about
		\(r = \tfrac{\sqrt3}{2} R \approx 0.87R\). Now add one point at the centre. Show that the bar now ends at \(r = R/2\).
	</p>
	{#snippet hint()}
		<p>
			Without the centre, think about which triangles could possibly help to fill the hole: those lying on one side of the centre, or
			those that surround it? With the centre, look at the triangles formed by the centre and two neighbouring points.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Without the centre. A triangle whose three corners lie within half of the circle stays on one side of the centre. As long as
			every triangle is of this kind, one can map the whole Rips complex onto the circle — send each point to its own position and each
			simplex onto the short arc between its corners — and the big loop goes once around the circle, so it cannot be a boundary. The
			loop can therefore only die once triangles that surround the centre appear. Among triangles inscribed in a circle and surrounding
			its centre, the one whose longest side is shortest is the equilateral triangle, with side \(\sqrt3 R\), so it appears at
			\(r = \sqrt3 R/2 \approx 0.87R\). For points evenly spaced, with their number divisible by 3, the loop dies exactly then; for
			other samples, close to it.
		</p>
		<p>
			With the centre \(c\). Every point of the circle is at distance \(R\) from \(c\), so all the edges from \(c\) appear at
			\(r = R/2\), while the edges between neighbours on the circle are much shorter and appeared long before. So at \(r = R/2\) all the
			triangles formed by \(c\) and two neighbours appear at once; together they fill the disc like the spokes of a wheel, and the loop
			dies. Its bar shrinks from ending near \(0.87R\) to ending at \(0.5R\). Try it in the playground.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Six points, one sphere">
	<p>
		For six evenly spaced points on the unit circle and \(\sqrt3/2 \le r \lt 1\), show that the Rips complex has 6 vertices, 12 edges and 8
		triangles, and no larger simplices. Compute its Euler characteristic and check that it agrees with the Betti numbers
		\((b_0, b_1, b_2) = (1, 0, 1)\) of a hollow octahedron. Then explain why the Čech complex at the same radius has \(b_1 = 1\) instead.
	</p>
	{#snippet solution()}
		<p>
			Every pair is joined except the three opposite pairs: \(15 - 3 = 12\) edges. A triangle needs three pairwise-joined points, so it
			uses one point from each opposite pair: \(2 \times 2 \times 2 = 8\) triangles. Four points would contain an opposite pair, so there
			are no tetrahedra. Then \(\chi = 6 - 12 + 8 = 2\), the Euler characteristic of a sphere, and indeed
			\(b_0 - b_1 + b_2 = 1 - 0 + 1 = 2\): the complex is the octahedron of Figure 3.7.10, one piece enclosing one hollow. For Čech, a set of points enters when its smallest enclosing
			disc has radius at most \(r\). The disc around the centre of the circle needs radius \(1\), so for \(r \lt 1\) the centre is
			uncovered and the union of discs has a hole: \(b_1 = 1\), \(b_2 = 0\). The “three consecutive points” triangles do enter at
			\(\sqrt3/2\) (half their longest side), but the triangles \(024\) and \(135\), whose enclosing disc is the whole unit disc, do not.
		</p>
	{/snippet}
</Exercise>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>point cloud</strong> has no interesting homology by itself. Thicken it: grow balls of radius \(r\) around the points.
		</li>
		<li>
			The <strong>Čech complex</strong> \(\check C_r(P)\) is the nerve of the balls; by the <strong>nerve theorem</strong> it has the
			homology of their union. The <strong>Vietoris–Rips complex</strong> \(\mathrm{VR}_r(P)\) only asks that points be pairwise within
			\(2r\); it is cheaper, and \(\check C_r \subseteq \mathrm{VR}_r \subseteq \check C_{\sqrt2 r}\).
		</li>
		<li>
			As \(r\) grows, the complexes form a <strong>filtration</strong>. Each new simplex either creates a class or destroys one.
		</li>
		<li>
			Classes are <strong>born</strong> and <strong>die</strong>; when two merge, the <strong>elder rule</strong> says the younger dies.
			The result is a <strong>barcode</strong> of intervals \([b, d)\), or a <strong>persistence diagram</strong> of points \((b, d)\).
		</li>
		<li>
			The barcode is computed by the <strong>reduction algorithm</strong>: add earlier columns to later ones over \(\Z/2\) until all the
			lows differ, then pair \(\mathrm{low}(j)\) with \(j\).
		</li>
		<li>
			<strong>Stability:</strong> moving the points by at most \(\delta\) moves the diagram by at most \(\delta\) in bottleneck distance,
			so bars longer than \(2\delta\) are robust.
		</li>
		<li>
			Long bars suggest real structure, but noise is in the eye of the beholder; Rips can invent features, outliers can destroy them,
			and the barcode is a summary, not the shape itself.
		</li>
	</ul>
</Recap>

<!-- ─────────────────────────────────────────────────────────────────────── -->
<h2 id="further-reading">Further reading</h2>

<FurtherReading items={readings} />

<style>
	.cite {
		display: inline-block;
		margin-top: 0.4rem;
		font-size: 0.74rem;
		font-style: normal;
		letter-spacing: 0.03em;
		color: var(--ink-faint);
	}
</style>
