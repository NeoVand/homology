<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import StretchFigure from '$lib/figures/prelude/shape-of-a-question/StretchFigure.svelte';
	import HoleGallery from '$lib/figures/prelude/shape-of-a-question/HoleGallery.svelte';
	import EulerSolids from '$lib/figures/prelude/shape-of-a-question/EulerSolids.svelte';
	import RubberBands from '$lib/figures/prelude/shape-of-a-question/RubberBands.svelte';
	import FormulaDecoder from '$lib/figures/prelude/shape-of-a-question/FormulaDecoder.svelte';
	import StaircaseWalk from '$lib/figures/prelude/shape-of-a-question/StaircaseWalk.svelte';
	import ColorLegend from '$lib/figures/prelude/shape-of-a-question/ColorLegend.svelte';
	import Applications from '$lib/figures/prelude/shape-of-a-question/Applications.svelte';
	import { href } from '$lib/util/paths';
</script>

<Epigraph author="Henri Poincaré" source="Analysis Situs (1895), trans. John Stillwell"
	>… geometry is the art of reasoning well from badly drawn figures; however, these figures, if they are not to
	deceive us, must satisfy certain conditions; the proportions may be grossly altered, but the relative positions
	of the different parts must not be upset.</Epigraph
>

<p class="lead">
	Take a lump of clay and roll it into a ball. Squash it, stretch it, twist it into a lumpy potato. Its shape has
	changed completely, and yet in another sense nothing has happened: it is still one lump, and you still cannot see
	through it. Now push your thumb right through the middle and make a ring. <em>That</em> feels like a different kind
	of change. No amount of squashing will close the hole again, unless you glue the clay back together. This book is
	about that difference, and about the century of ideas it took to say precisely what it is.
</p>

<p>
	The branch of mathematics that studies such differences is called <strong>topology</strong>: it keeps track of
	whatever survives stretching, bending and squeezing, and forgets everything else. Inside topology runs a machine
	called <strong>homology</strong>, which turns the slippery idea of a “hole” into numbers you can calculate. Beside
	it runs its mirror image, <strong>cohomology</strong>, which detects something subtler: information that makes
	perfect sense in every small region and still cannot be fitted together into one consistent whole.
</p>

<p>
	This first chapter is a tour, and nothing in it has to be fully understood yet; every idea returns later, slowly,
	with all the background it needs. On the way you will meet a drinking straw that starts arguments, a count of
	corners that Euler noticed in 1750, a staircase that climbs for ever without getting anywhere, and a theorem which
	promises that however you stir a cup of coffee, some point of it ends exactly where it began.
</p>

<Ahead>
	<p>
		By the end of the chapter you will know, informally, what topology studies, what a topological invariant is, what
		homology counts and what cohomology measures. You will also know how the book is organised, how to use its
		figures, and what the colours in every picture mean.
	</p>
</Ahead>

<h2 id="a-doughnut-and-a-coffee-cup">A doughnut and a coffee cup</h2>

<p>
	There is an old joke that a topologist is someone who cannot tell a coffee cup from a doughnut. Like many jokes, it
	is secretly a definition.
</p>

<p>
	Imagine both objects are made of an infinitely soft, infinitely stretchable clay. Start with the doughnut. Push a
	dent into one side of it and deepen the dent into a bowl; the rest of the ring thins into a handle. With some
	patience you arrive at a coffee cup — and at no moment did you cut the clay or glue two separate parts of it
	together. Every point of the doughnut ended up at a point of the cup, nearby points stayed nearby, and the whole
	process could be run backwards.
</p>

<p>
	A topologist calls two shapes <em>the same</em> when one can be deformed into the other in this way. The precise
	word is <Term t="homeomorphism">homeomorphic</Term>, and it will be defined carefully in <Ref to="topology/spaces" />.
	For now, the rule of the game is:
</p>

<KeyIdea>
	<p>
		<strong>Stretching, bending, squeezing and twisting are allowed. Tearing, cutting, puncturing and gluing are
			not.</strong> Two shapes are topologically the same if one can be turned into the other using only the allowed
		moves.
	</p>
</KeyIdea>

<p>
	Under these rules, a ball and a cube are the same (round off the corners), a sphere and the surface of a potato are
	the same, and a doughnut and a coffee cup are the same. But a ball and a doughnut are <em>not</em> the same: to get
	from one to the other you would have to punch a hole through the ball, and punching is a kind of tearing. (In one
	way the rules are more generous than clay: a loop of string tied in a knot counts as the same shape as a plain
	ring, because topology cares about a shape itself and not about how it sits in the room. <Ref
		to="topology/spaces"
	/> explains.)
</p>

<p>
	At least, that is what our intuition says. But intuition is not proof. How could you ever be <em>sure</em> that no
	clever sequence of stretches, however complicated, turns a ball into a doughnut? You cannot try them all — there are
	infinitely many. This is the central difficulty of topology, and it is where our story really begins.
</p>

<Figure title="Stretch, don’t tear" hint="Press and hold a shape to pull it · drag around it to turn the view" num="0.1.1">
	<StretchFigure />
	{#snippet caption()}
		A sphere and a torus being kneaded like clay. Their geometry — lengths, angles, curvature — changes completely.
		But the sphere never acquires a tunnel, and the torus never loses its one. Features like these, which no allowed
		deformation can change, are what topology studies.
	{/snippet}
</Figure>

<h2 id="what-survives-stretching">What survives stretching</h2>

<p>
	The way out of the difficulty is a strategy that runs through all of mathematics. Instead of trying every
	deformation, find some property of a shape that <em>no</em> deformation can change, and that you can actually
	compute. Such a property is called a <Term t="invariant">topological invariant</Term>. If two shapes give different
	values of an invariant, they cannot be the same — whatever stretching you try.
</p>

<p>
	A simple example: the <strong>number of pieces</strong>. Two separate blobs can never be stretched into one,
	because joining them would take gluing; one blob can never be stretched into two, because separating them would
	take tearing. So “number of pieces” is an invariant. It already tells the letter <em>i</em> (two pieces: the dot and
	the stroke) from the letter <em>l</em> (one piece).
</p>

<p>
	A subtler example: the <strong>number of holes</strong>. The letter <em>O</em> has one hole, <em>B</em> has two,
	<em>C</em> has none. Since no stretching creates or destroys a hole, these letters really are topologically
	different. This sounds obvious until you try to say precisely what a hole <em>is</em>.
</p>

<Question>
	<p>
		How many holes does a drinking straw have? One, because you can see straight through it? Two, one at each end? Or
		zero, because a straw is only a rolled-up sheet of paper, and a sheet has no holes at all? People argue about
		this in earnest <Cite k="richeson2021" />, and the argument never ends, because the everyday word “hole” is not
		precise enough to settle it. Make your guess now: topology delivers a verdict before this section is over.
	</p>
</Question>

<p>
	The trouble is that a hole is not a <em>thing</em>. It is a place where something is missing, and it is
	surprisingly hard to point at an absence. Worse, holes come in different dimensions. A circle has a hole you can
	loop a string around. A hollow ball has no such hole — every loop drawn on its surface can be slid off and shrunk
	away — but it does enclose a hollow cavity, a different kind of hole. And the skin of a doughnut (think of an
	inflatable swimming ring rather than a cake) has two independent loop-holes <em>and</em> a cavity.
</p>

<p>
	Homology is the theory that sorts all of this out. It produces, for every shape and every dimension
	\(n = 0, 1, 2, \dots\), a count of the essentially different \(n\)-dimensional holes. These counts are called the
	<Term t="betti-number">Betti numbers</Term> of the shape, after the Italian mathematician Enrico Betti, and written
	\(b_0, b_1, b_2, \dots\) (pronounced “b-zero, b-one, b-two”):
</p>

<ul>
	<li>\(b_0\) counts the pieces (it is useful to think of separate pieces as “0-dimensional holes”: gaps between parts);</li>
	<li>\(b_1\) counts the independent loops that go around tunnels — loops that cannot be shrunk away;</li>
	<li>\(b_2\) counts the enclosed hollow cavities;</li>
	<li>and so on, in higher dimensions that we cannot picture but can compute.</li>
</ul>

<Figure title="A first gallery of holes" hint="Choose which holes to light up" num="0.1.2">
	<HoleGallery />
	{#snippet caption()}
		The Betti numbers of four basic shapes. The torus has \(b_1 = 2\): one loop around the central hole and one around
		the tube, and neither can be shrunk or turned into the other. Making “independent” and “essentially different”
		precise is the business of Part III.
	{/snippet}
</Figure>

<Intuition title="Necklaces and plugs">
	<p>
		Daniel Tubbenhauer offers two tests you can do at home <Cite k="tubbenhauer2021" />. For \(b_1\), count the
		necklaces you could thread onto the shape so that none can be slipped off and none is just a combination of the
		others; for \(b_2\), count the plugs you would need to inflate it. An inflatable swimming ring takes two necklaces —
		one through the middle, and one running round inside the air chamber — and one plug: \(b_0, b_1, b_2 = 1, 2, 1\). A
		doughnut from the bakery takes one necklace and no plug: \(1, 1, 0\). The two look alike but are different shapes,
		because the ring is a hollow skin and the doughnut is solid. And a drinking straw takes exactly one necklace, which
		settles the argument above: \(b_1 = 1\).
	</p>
	<p>
		Notice that both tests count things <em>outside</em> the shape. That they still measure the shape itself is a
		theorem in disguise, Alexander duality (<Ref to="cohomology/poincare-duality" hash="alexander" />), and it holds for
		reasonable shapes sitting in ordinary space.
	</p>
</Intuition>

<Warning title="Holes are scaffolding, not the definition">
	<p>
		The word “hole” is a helpful picture, but it will not survive close inspection unchanged. The swimming ring has
		one hole you can point at, yet it takes two necklaces. In the same way, the skin of a doughnut with \(g\) holes has
		\(b_1 = 2g\), not \(g\), because each handle carries two independent loops. The precise definition of homology
		replaces holes with something you can calculate with: <em>cycles that are not boundaries</em>. We will get there
		step by step.
	</p>
</Warning>

<h2 id="eulers-clue">Euler’s clue</h2>

<p>
	The first hint that something like homology exists came from an innocent-looking observation about solids with flat
	faces — polyhedra. Take any such solid: a cube, a pyramid, a football sewn from pentagons and hexagons. Count its
	corners (mathematicians say
	<em>vertices</em>), its edges, and its faces. Call these \(V\), \(E\) and \(F\). For a cube, \(V = 8\), \(E = 12\) and
	\(F = 6\). Now compute
</p>

\[ V - E + F = 8 - 12 + 6 = 2. \]

<p>
	Try it for the other solids in the figure below. A tetrahedron (triangular pyramid): \(4 - 6 + 4 = 2\). An
	icosahedron, with its twenty triangles: \(12 - 30 + 20 = 2\). The football, with 60 corners, 90 seams and 32
	panels: \(60 - 90 + 32 = 2\). Every time, the answer is 2. This is <strong>Euler’s polyhedron formula</strong>
	<Cite k="euler1758" />, and it holds for every polyhedron that is, topologically, a ball — however many faces it
	has, however irregular they are.
</p>

<Figure title="Counting corners, edges and faces" hint="Choose a solid · drag to rotate" num="0.1.3">
	<EulerSolids />
	{#snippet caption()}
		For every solid shaped like a ball, \(V - E + F = 2\). The picture frame has a tunnel through it, and the count
		drops to \(16 - 32 + 16 = 0\). The number \(V - E + F\) cannot see lengths or angles, but it can see tunnels.
	{/snippet}
</Figure>

<p>
	Why should such a crude count be so stable? Try to break it. Suppose you add a new edge across one of the faces,
	splitting it in two. You have added one edge and one face, so \(V - E + F\) changes by \(0 - 1 + 1 = 0\). Suppose
	you add a new vertex in the middle of an edge, splitting it in two: one more vertex and one more edge, change
	\(1 - 1 + 0 = 0\). Refining the picture never changes the answer. So \(V - E + F\) is not really a property of the
	particular way the solid was cut into faces at all. It is a property of the <em>shape</em> underneath. It is a
	topological invariant — today called the <Term t="euler-characteristic">Euler characteristic</Term> and written
	\(\chi\), the Greek letter chi.
</p>

<p>
	And then comes the surprise in the last example: the picture frame, a polyhedron with a tunnel through it, gives
	\(V - E + F = 0\). The formula “fails” — or rather, it succeeds spectacularly, because it has detected the tunnel.
	Every additional tunnel lowers the count by 2.
</p>

<History>
	<p>
		Leonhard Euler announced the formula in a letter to Christian Goldbach in November 1750 and published it in 1758.
		René Descartes had found facts from which it follows at once, around 1630, but his notebook had a rough life. It
		was found among his papers in Stockholm after his death in 1650, spent three days in the Seine when the boat
		carrying it to Paris sank, was copied by Gottfried Leibniz in 1676, and then vanished; Leibniz’s copy turned up in
		Hanover around 1860 <Cite k="federico1982" />. In 1813 Simon Lhuilier pointed out polyhedra with tunnels, where
		the count comes out as \(2 - 2g\) for a solid with \(g\) tunnels <Cite k="lhuilier1813" />. Then, in his 1895
		memoir <em>Analysis Situs</em> (“the analysis of position”), Henri Poincaré saw that Euler’s number is an
		alternating sum of hole-counts, \(\chi = b_0 - b_1 + b_2\), and founded what we now call algebraic topology <Cite
			k="poincare1895"
			loc="§16"
		/>.
	</p>
</History>

<p>
	Check it on the cube’s surface: \(b_0 = 1\) piece, \(b_1 = 0\) loop-holes, \(b_2 = 1\) cavity, and \(1 - 0 + 1 = 2\).
	For the picture frame, whose surface is a torus: \(1 - 2 + 1 = 0\). That Euler’s crude count equals this alternating
	sum of Betti numbers is a genuine theorem, and you will prove it in <Ref to="homology/homology-groups"
		hash="euler-poincare"
	/>. It is our first clue that the holes of a shape can be counted by finite, mechanical calculations.
</p>

<h2 id="loops-that-cannot-shrink">Loops that cannot shrink</h2>

<p>
	How do we detect a loop-hole precisely? Here is a physical test. Wrap a rubber band around a shape, keeping it on
	the surface, and let it contract. On a sphere, every rubber band can slide over the surface and shrink to a point.
	It never gets caught on anything. On a torus, some bands also shrink to a point; but a band that goes around the
	tube, or around the central hole, gets stuck. It can slide along the surface, but it can never become smaller than
	the hole it surrounds.
</p>

<Figure title="Rubber bands" hint="Play or scrub to pull the bands tight · drag to rotate" num="0.1.4">
	<RubberBands />
	{#snippet caption()}
		On the sphere, the band shrinks to a point, sweeping across the shaded cap — the region it <em>bounds</em>. On
		the torus, a small band also shrinks, but the band around the tube is stuck: there is no piece of the torus that it
		bounds.
	{/snippet}
</Figure>

<p>
	Look at the shaded region on the sphere. The band is the edge — mathematicians say the <strong>boundary</strong> —
	of a piece of the surface, the cap, and as it shrinks it sweeps across that cap. On the sphere, bounding and
	shrinking go together. The stuck band on the torus bounds no piece of the torus at all. Cut along it with scissors
	and the torus does not fall apart into an inside and an outside; it opens into a single tube. Of the two ideas,
	shrinking and bounding, it is bounding that becomes our precise definition of a hole:
</p>

<KeyIdea>
	<p>
		<strong>A hole is a loop that does not bound.</strong> More generally, an \(n\)-dimensional hole is an
		\(n\)-dimensional <em>cycle</em> (a closed loop, a closed surface, …) that is not the <em>boundary</em> of
		anything one dimension higher inside the shape.
	</p>
</KeyIdea>

<Warning title="Two definitions of a hole">
	<p>
		Look up “hole” in Wolfram MathWorld and you will read that a hole is “a topological structure which prevents the
		object from being continuously shrunk to a point” <Cite k="weisstein-hole" />. That is the rubber-band test, and
		most popular accounts teach it. Homology uses the more generous test of bounding: a loop goes around a hole if it is
		not the edge of any piece of the shape. On every shape in this chapter the two tests agree, but they are different
		tests. On a surface with two handles, a band around the waist cannot shrink — there is a handle in the way on each
		side — yet it is the edge of either half. Homology says it surrounds no hole. <Ref
			to="homology/invariance"
			hash="hurewicz"
		/> draws a loop like this and explains why the generous test is the one we can compute.
	</p>
</Warning>

<p>
	Bounding is the test we will use, but as it stands it is not yet mathematics: nobody can try every piece of
	surface that a loop might be the edge of. The great insight of homology is to replace searching with
	<em>bookkeeping</em>. We cut the shape into simple pieces — triangles, say — and record loops and surfaces as
	lists of pieces. Then the question “is this loop a boundary?”
	becomes a question about solving equations, which a computer (or a patient human) can always answer.
</p>

<h2 id="from-counting-to-algebra">From counting to algebra</h2>

<p>
	For thirty years after Poincaré, topologists treated Betti numbers as plain numbers, read off from large tables
	that record which pieces of a shape touch which. Then, in 1925, Emmy Noether, one of the great algebraists of the
	century, made an observation in her Göttingen lectures and in a report fourteen lines long. The loops and surfaces
	being counted are not a loose heap: they form <em>groups</em>. You can add two loops (travel one, then the other)
	and subtract them (travel one backwards), and the Betti numbers had been measuring these groups all along. It sounds like a change of vocabulary. But the young Heinz Hopf, visiting Göttingen that year, saw how much
	it bought, and the idea spread fast <Cite k="weibel1999" />: once holes form groups, the whole of algebra can be
	brought to bear on shape.
</p>

<p>
	The final form of the idea fits in one line. It is the destination of Part III of this book, and you are not
	expected to understand it yet — only to recognise it when it comes back:
</p>

\[ H_n(X) \;=\; \ker \partial_n \,\big/\, \im \partial_{n+1}. \]

<p>Read aloud: “the \(n\)-th homology of \(X\) is the kernel of \(\partial_n\) modulo the image of \(\partial_{n+1}\).” Here is what each piece means.</p>

<Figure title="The destination, decoded" hint="Hover or tap each piece of the formula" num="0.1.5">
	<FormulaDecoder />
	{#snippet caption()}
		Homology in one line: take all the cycles, and treat the ones that are boundaries as zero. What is left are the
		holes. Every symbol here will be built from scratch: kernels and images in <Ref to="foundations/groups" />,
		quotients (“modulo”) in <Ref to="foundations/equivalence" /> and <Ref to="foundations/abelian-groups" />, the
		boundary operator \(\partial\) in <Ref to="homology/chains" />.
	{/snippet}
</Figure>

<Intuition>
	<p>
		The slash “/” means <em>ignore the difference</em>. Two loops count as the same hole if together they form a
		boundary. This is exactly how a clock treats 13:00 and 1:00 as the same hour — they differ by a full turn, and a
		full turn is “treated as zero”. Homology treats boundaries the way a clock treats full turns.
	</p>
</Intuition>

<h2 id="measuring-instead-of-counting">Measuring instead of counting</h2>

<p>
	Homology counts holes by collecting loops and surfaces <em>inside</em> a shape. Cohomology looks at the same shape
	from the opposite direction. Instead of collecting pieces, it writes a <em>measurement</em> on each one: the climb
	along each trail of a hiking map, the voltage across each wire of a circuit, the exchange rate between two
	currencies, the ratio of depths where two parts of a drawing meet. Then it asks whether the measurements hang
	together.
</p>

<p>
	Take the hiking map. Suppose someone hands you the altitude change along every trail segment, and nothing else.
	Can you recover an altitude for every crossing, consistent with all those changes? Locally, the
	answer is always yes: near any one crossing, call its altitude zero and add up the changes as you walk outwards.
	Globally, the answer can be no.
</p>

<Figure title="An impossible staircase" hint="Walk around the loop · then make the staircase possible" num="0.1.6">
	<StaircaseWalk />
	{#snippet caption()}
		Every step says “up by one”, and each step on its own is perfectly reasonable. But after twelve steps up you are
		back at the start. No assignment of heights to the landings can agree with every step, because the steps add up to
		12 around the loop, not 0. Make the staircase possible and the sum around the loop becomes 0 — then heights exist.
	{/snippet}
</Figure>

<p>
	This is the logic of the <Term t="penrose-staircase">impossible staircase</Term> that the geneticist Lionel Penrose
	and his son Roger, then a young mathematician, published in 1958 <Cite k="penrose1958" />, and that M. C. Escher
	made famous two years later in his lithograph <em>Ascending and Descending</em>, where monks climb for ever around
	a square stairway. Every small part of the picture is a perfectly good staircase. The impossibility lives only in
	the whole loop. It is, quite literally, a nonzero cohomology class, and in 1992 Roger Penrose wrote a paper
	analysing impossible figures in exactly these terms <Cite k="penrose1992" />.
</p>

<KeyIdea>
	<p>
		<strong>Cohomology measures obstructions</strong>: ways in which data that is consistent in every small region fails
		to be consistent globally. The obstruction always lives around a hole — so cohomology, too, sees holes, but it sees
		them as <em>measurements that cannot be integrated</em> rather than as <em>loops that cannot be filled</em>.
	</p>
</KeyIdea>

<p>
	It turns out that cohomology carries more structure than homology. Measurements can be <em>multiplied</em>, and this
	product — the <em>cup product</em> of <Ref to="cohomology/cup-product" /> — can tell apart shapes that homology alone
	cannot. And when the shape is smooth, cohomology turns into calculus: the theory of differential forms, where the
	fundamental theorem of calculus, Green’s theorem and Stokes’ theorem all become a single statement about boundaries.
	That story is Part IV.
</p>

<h2 id="why-it-matters">Why it matters</h2>

<p>
	Counting holes may sound like a parlour game. It became one of the most useful ideas of twentieth-century
	mathematics, and in the twenty-first it has found a second career in science and engineering.
</p>

<Figure title="Where homology turns up" num="0.1.7">
	<Applications />
	{#snippet caption()}
		A few of the places where homology and cohomology do real work. Each is discussed in the chapter shown.
	{/snippet}
</Figure>

<p>
	Here is a taste of the very first great application, which you will prove yourself in <Ref
		to="homology/invariance"
	/>. Stir a cup of coffee and let it settle. However you stirred — as long as the coffee did not slosh out of the cup
	or splash apart — at least one point of the coffee is exactly where it started. This is <Term
		t="brouwer-fixed-point-theorem">Brouwer’s fixed point theorem</Term
	>, proved in full generality by the Dutch mathematician L. E. J. Brouwer in 1911 <Cite k="brouwer1911" />. For a
	flat disk of coffee, its proof is a two-line argument about holes: if no point stayed put, you could use the
	stirring to push the whole disk onto its rim without tearing, and that would destroy the rim’s hole — which homology
	says is impossible.
</p>

<p>
	The same theorem and its relatives guarantee that equilibria exist in economics and in games: John Nash’s proof
	that every finite game has an equilibrium is an application of it <Cite k="nash1951" />. Persistent homology (<Ref
		to="homology/persistence"
	/>) finds circles, voids and tunnels hidden in clouds of data points, from the shapes of proteins to the firing of
	neurons <Cite k="xia-wei2014,giusti2015" />. Homology detects gaps in the coverage of a network of sensors using
	only which sensors can hear each other <Cite k="desilva-ghrist2007" />. Cohomology explains why the Hall
	conductance of certain thin materials comes in perfectly whole-number steps <Cite k="tknn1982" />, part of the work
	on topological phases of matter recognised by the 2016 Nobel Prize in Physics <Cite k="nobel2016" />. And the
	cohomology of the space of all positions of a robot arm sets a lower limit on how many separate rules a program
	that plans its motions must switch between <Cite k="farber2003" />.
</p>

<h2 id="how-to-read-this-book">How to read this book</h2>

<p>
	This book assumes no mathematics beyond arithmetic and a willingness to think carefully. Everything else is built
	along the way:
</p>

<ul>
	<li>
		<strong>Prelude.</strong> This chapter, and <Ref to="prelude/reading-math" />, a gentle guide to mathematical notation
		and logic. If symbols like \(\forall\), \(\in\) or \(\Rightarrow\) are unfamiliar, read it next.
	</li>
	<li>
		<strong>Part I, Foundations.</strong> Sets and functions, equivalence and quotients, groups, abelian groups and
		linear algebra — exactly the algebra that homology needs, and no more.
	</li>
	<li>
		<strong>Part II, Shapes.</strong> Topological spaces, gluing, homotopy, manifolds, simplicial complexes and the
		Euler characteristic.
	</li>
	<li><strong>Part III, Homology.</strong> Cycles and boundaries, chains, homology groups, computation, invariance, exact sequences and persistence.</li>
	<li><strong>Part IV, Cohomology.</strong> Cochains, cohomology groups, differential forms, de Rham cohomology, cup products, Poincaré duality, sheaves and characteristic classes.</li>
	<li><strong>Part V, The Bigger Picture.</strong> Categories and functors, homological algebra, and where the road leads next.</li>
</ul>

<p>
	The chapters are meant to be read in order, but the <a href={href('/map/')}>map of the journey</a> shows which chapters
	each one depends on, if you prefer to jump ahead. A few conventions will help:
</p>

<ul>
	<li>
		<strong>Figures are meant to be touched.</strong> Most of them respond to dragging and tapping, and some play like short films; the
		small hint above each figure says how. On a phone, tap “Tap to rotate” before dragging a 3D figure, so that the page
		can still scroll.
	</li>
	<li>
		<strong>Dotted underlines are glossary terms.</strong> Hover over (or tap) a word like <Term t="invariant">invariant</Term>
		to see its definition without losing your place. The full <a href={href('/glossary/')}>glossary</a> and a
		<a href={href('/notation/')}>notation guide</a> are always one click away in the top bar.
	</li>
	<li>
		<strong>Names and years in brackets are references,</strong> like <Cite k="euler1758" />: a book or paper where
		you can check a fact or read a story in full. Hover over (or tap) one for the details. Each chapter ends with its
		list of references and a short guide to further reading.
	</li>
	<li>
		<strong>Boxes have meanings.</strong> Gold boxes are definitions, violet boxes are theorems, teal boxes give
		intuition, and amber boxes warn you where an intuition can mislead. Exercises have hints and full solutions,
		hidden until you ask for them.
	</li>
	<li><strong>Colours have meanings too,</strong> in every picture and many formulas:</li>
</ul>

<Figure title="The colours of this book" num="0.1.8">
	<ColorLegend />
	{#snippet caption()}
		The same colour always plays the same role, from the first chapter to the last.
	{/snippet}
</Figure>

<p>
	Finally, a word of encouragement. Mathematics is read slowly, with a pencil, by people who stop to try examples and
	who are not ashamed to read a paragraph three times. If something does not make sense, play with the figure, try the
	exercise, look the word up, and come back. Everything in this book was confusing to someone once — including to the
	people who discovered it.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise title="Letters as shapes" level={1}>
	<p>
		Treat the capital letters A, B, C, D, E, O, P, Q, R as shapes drawn with a thin line. How many loop-holes
		(\(b_1\)) does each one have? Which letters are topologically the same as the letter O?
	</p>
	{#snippet solution()}
		<p>
			A, D, O, P, Q and R each have one loop (\(b_1 = 1\)); B has two (\(b_1 = 2\)); C and E have none (\(b_1 = 0\)).
			Only D and O are topologically the same as O: each is just a closed loop. A, P and R have extra “legs”
			attached to the loop. Removing the single point where a leg meets the loop cuts such a letter into two
			pieces, whereas removing any one point from O leaves it in one piece — and no stretching can change how a shape
			falls apart when a point is removed. Q is never the same as O, whatever the font: its tail either touches the
			loop, or crosses it, or floats free as a second piece, and each version falls apart differently. This “cut
			point” invariant is made precise in <Ref to="topology/spaces" />.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Euler’s formula for a pyramid" level={1}>
	<p>
		A pyramid with a square base has how many vertices, edges and faces? Check that \(V - E + F = 2\). Then do the
		same for a prism whose two ends are pentagons.
	</p>
	{#snippet solution()}
		<p>
			The square pyramid has \(V = 5\) (four base corners and the apex), \(E = 8\) (four base edges and four slanted
			ones) and \(F = 5\) (the base and four triangles): \(5 - 8 + 5 = 2\). The pentagonal prism has \(V = 10\),
			\(E = 15\) (five on each end and five joining them) and \(F = 7\) (two pentagons and five rectangles):
			\(10 - 15 + 7 = 2\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="Splitting faces" level={2}>
	<p>
		Start from a cube and draw a diagonal across one face, splitting it into two triangles. Then put a new vertex in
		the middle of one of those triangles and join it to the triangle’s three corners. Keep track of \(V\), \(E\) and
		\(F\) after each step. What happens to \(V - E + F\), and why?
	</p>
	{#snippet hint()}
		<p>Count only what changes at each step.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Drawing the diagonal adds one edge and turns one face into two: \(\Delta V = 0\), \(\Delta E = 1\),
			\(\Delta F = 1\), so \(V - E + F\) changes by \(0 - 1 + 1 = 0\). Adding a vertex inside a triangle and joining it
			to the corners adds one vertex, three edges, and turns one face into three (two extra faces): the change is
			\(1 - 3 + 2 = 0\). Both steps refine the picture without changing the shape, and \(V - E + F\) stays at \(2\).
			This is the idea behind the invariance of the Euler characteristic, proved in
			<Ref to="topology/euler-characteristic" />.
		</p>
	{/snippet}
</Exercise>

<Exercise title="A staircase that might be possible" level={2}>
	<p>
		A loop of four flights of stairs has height changes \(+2\), \(-1\), \(+3\) and \(-4\) as you walk around it. Can you
		assign a height to each of the four landings so that every flight is correct? What if the changes were \(+2\),
		\(-1\), \(+3\), \(-3\)?
	</p>
	{#snippet solution()}
		<p>
			In the first case the changes add up to \(2 - 1 + 3 - 4 = 0\), so yes: put the first landing at height \(0\); then
			the others are at \(2\), \(1\) and \(4\), and the last flight goes from \(4\) back down to \(0\), a change of
			\(-4\), as required. In the second case the sum is \(1 \neq 0\): going once around would bring you back one unit
			higher than you started, so no consistent heights exist. The sum around the loop is the obstruction — a first
			taste of cohomology.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Holes in a pair of trousers" level={3}>
	<p>
		Think of a T-shirt and a pair of trousers as surfaces (ignore the thickness of the fabric). Can one be stretched
		into the other? Try to describe each as a sphere with some number of disks cut out of it.
	</p>
	{#snippet solution()}
		<p>
			No. A T-shirt has four openings (the neck, the waist and two sleeves), so it is a sphere with four disks
			removed. A pair of trousers has three openings (the waist and two legs), so it is a sphere with three disks
			removed. These are <em>not</em> the same: the number of boundary circles is a topological invariant, and
			\(4 \neq 3\). (Stretching cannot create or remove an edge of the fabric.) So the topologist <em>can</em> tell a
			T-shirt from a pair of trousers — though not, of course, a coffee cup from a doughnut. Topologists take this
			garment seriously: a sphere with three holes is officially called a <em>pair of pants</em>, and surfaces are
			routinely cut into pairs of pants to study them.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Topology studies the properties of shapes that survive stretching, bending and squeezing, but not tearing or
			gluing. Shapes related by such deformations are considered the same.
		</li>
		<li>
			To prove two shapes are <em>different</em>, we use invariants: computable quantities that no deformation can
			change, such as the number of pieces or the Euler characteristic \(V - E + F\).
		</li>
		<li>
			Homology turns “holes” into precise invariants. Its Betti numbers \(b_0, b_1, b_2, \dots\) count pieces,
			independent loops around tunnels, and enclosed cavities. The precise idea is: <em>a hole is a cycle that is not
			a boundary</em>, a test of bounding that is more generous than the popular test of shrinking.
		</li>
		<li>
			Cohomology measures obstructions: data that is consistent everywhere locally but not globally, like an
			impossible staircase.
		</li>
		<li>
			Both have many applications, from fixed-point theorems and economics to data analysis, sensor networks and
			physics.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Topology 101: The Hole Truth',
			author: 'David S. Richeson, Quanta Magazine (2021)',
			url: 'https://www.quantamagazine.org/topology-101-how-mathematicians-study-holes-20210126/',
			note: 'The straw debate, Riemann’s idea of counting holes by cutting, and how homology settles the argument. A ten-minute read for anyone.',
			kind: 'web',
			free: true
		},
		{
			title: 'What is…homology intuitively?',
			author: 'Daniel Tubbenhauer (VisualMath, YouTube)',
			url: 'https://www.youtube.com/watch?v=QanLUNiqZW0',
			note: 'A short video lecture in which he annotates his slides live: the swimming ring and the doughnut, the necklaces and plugs, and the shrinking definition of a hole quoted in this chapter. The slides are free at dtubbenhauer.com.',
			kind: 'video',
			free: true
		},
		{
			title: 'What is algebraic topology?',
			author: 'Aleph 0 (YouTube)',
			url: 'https://www.youtube.com/watch?v=5xLe77iTHuQ',
			note: 'Fifteen hand-drawn minutes covering the whole idea of Part III: cut a shape into cells, compute the circle and the torus by hand, then ask whether the answer depends on the cutting.',
			kind: 'video',
			free: true
		},
		{
			title: 'Euler’s Gem: The Polyhedron Formula and the Birth of Topology',
			author: 'David S. Richeson (Princeton, 2008)',
			url: 'https://doi.org/10.1515/9781400838561',
			note: 'A popular history of V − E + F, from Descartes’s waterlogged notebook to Poincaré and beyond. The best book-length companion to this chapter; no background needed.',
			kind: 'book'
		},
		{
			title: 'The Shape of Space (and the free Torus Games)',
			author: 'Jeffrey R. Weeks',
			url: 'https://www.geometrygames.org/TorusGames/',
			note: 'A wonderfully visual book on surfaces and three-dimensional spaces, written for readers with no background. The link goes to his free Torus Games, where you can play noughts and crosses, chess and pool on a torus.',
			kind: 'book'
		},
		{
			title: 'Elementary Applied Topology',
			author: 'Robert Ghrist (2014)',
			url: 'https://www2.math.upenn.edu/~ghrist/notes.html',
			note: 'Homology and cohomology at work in data analysis, sensor networks, robot motion and more, told with a light touch and dense pictures; free PDF chapters for personal use. For browsing now and reading properly after Part III.',
			kind: 'book',
			free: true
		},
		{
			title: 'Algebraic Topology, Chapter 0',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch0.pdf',
			note: 'The first chapter of the standard graduate textbook, free online. For later, when you want to see the destination in full.',
			kind: 'book',
			free: true
		}
	]}
/>
