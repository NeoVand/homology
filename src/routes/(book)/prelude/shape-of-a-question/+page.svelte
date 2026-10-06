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

<Epigraph author="Henri Poincaré" source="Analysis Situs (1895), trans. J. Stillwell"
	>Geometry is the art of reasoning well from badly drawn figures; however, these figures, if they are not to
	deceive us, must satisfy certain conditions; the proportions may be grossly altered, but the relative positions
	of the different parts must not be upset.</Epigraph
>

<p class="lead">
	Take a lump of clay and roll it into a ball. Now squash it, stretch it, twist it into a lumpy potato. Has anything
	about it really changed? Its shape, certainly — but something deeper has stayed exactly the same. Now push your
	thumb all the way through it, making a ring. <em>That</em> change feels different in kind. This book is about the
	difference.
</p>

<p>
	There is a branch of mathematics, called <strong>topology</strong>, that studies exactly those features of a shape
	that survive stretching, bending and squeezing — but not tearing or gluing. And inside topology there is a
	remarkable machine, called <strong>homology</strong>, that turns the vague idea of a “hole” into precise numbers and
	algebra, together with its mirror image, <strong>cohomology</strong>, which measures something just as
	fundamental: the ways in which information that is perfectly consistent in every small region can fail to fit
	together as a whole.
</p>

<p>
	This first chapter is a tour. Nothing here needs to be fully understood yet; every idea will come back later,
	slowly and carefully, with all the background you need. The goal for now is to see the landscape — to know what
	questions we are trying to answer, why the answers are beautiful, and why they turn out to be useful in places as
	far apart as data science, robotics and the physics of new materials.
</p>

<Ahead>
	<p>
		By the end of this chapter you will know, informally, what topology studies, what a topological invariant is, what
		homology counts, and what cohomology measures. You will also know how the book is organised, how its
		interactive figures work, and what the colours in every picture mean.
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
	from one to the other you would have to punch a hole through the ball, and punching is a kind of tearing.
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
	A simple example: the <strong>number of pieces</strong>. A shape made of two separate blobs can never be stretched
	into a shape made of one, because joining them would require gluing, and stretching never separates one piece into
	two without tearing. So “number of pieces” is an invariant. It already tells apart the letter <em>i</em> (two
	pieces: the dot and the stroke) from the letter <em>l</em> (one piece).
</p>

<p>
	A subtler example: the <strong>number of holes</strong>. The letter <em>O</em> has one hole, <em>B</em> has two,
	<em>C</em> has none. Since no stretching creates or destroys a hole, these letters really are topologically
	different. This sounds obvious until you try to say precisely what a hole <em>is</em>.
</p>

<Question>
	<p>
		How many holes does a drinking straw have? One, because you can see straight through it? Two, one at each end? Or
		zero, because a straw is just a rolled-up sheet of paper, and a sheet has no holes at all? People argue about this
		in earnest. The argument goes on because the everyday word “hole” is not precise enough to settle it.
	</p>
</Question>

<p>
	The trouble is that a hole is not a <em>thing</em>. It is a place where something is missing, and it is
	surprisingly hard to point at an absence. Worse, holes come in different dimensions. A circle has a hole you can
	loop a string around. A hollow ball has no such hole — every loop drawn on its surface can be slid off and shrunk
	away — but it does enclose a hollow cavity, a different kind of hole. A doughnut, as we will see, has two
	independent loop-holes <em>and</em> a cavity.
</p>

<p>
	Homology is the theory that sorts all of this out. It produces, for every shape and every dimension
	\(n = 0, 1, 2, \dots\), a count of the essentially different \(n\)-dimensional holes. These counts are called the
	<strong>Betti numbers</strong> of the shape, written \(b_0, b_1, b_2, \dots\) (pronounced “b-zero, b-one, b-two”):
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

<Warning title="Holes are scaffolding, not the definition">
	<p>
		The word “hole” is a helpful picture, but it will not survive close inspection unchanged. A surface with \(g\)
		handles — a doughnut with \(g\) holes — has \(b_1 = 2g\), not \(g\), because each handle carries two independent
		loops. The precise definition of homology replaces holes with something you can calculate with:
		<em>cycles that are not boundaries</em>. We will get there step by step.
	</p>
</Warning>

<h2 id="eulers-clue">Euler’s clue</h2>

<p>
	The first hint that something like homology exists came from an innocent-looking observation about solids with flat
	faces — polyhedra. Take any such solid: a cube, a pyramid, a soccer ball. Count its corners (mathematicians say
	<em>vertices</em>), its edges, and its faces. Call these \(V\), \(E\) and \(F\). For a cube, \(V = 8\), \(E = 12\) and
	\(F = 6\). Now compute
</p>

\[ V - E + F = 8 - 12 + 6 = 2. \]

<p>
	Try it for the other solids in the figure below. A tetrahedron (triangular pyramid): \(4 - 6 + 4 = 2\). An
	icosahedron, with its twenty triangles: \(12 - 30 + 20 = 2\). Every time, the answer is 2. This is
	<strong>Euler’s polyhedron formula</strong>, and it holds for every polyhedron that is, topologically, a ball — no
	matter how many faces it has, how irregular they are, or how it is drawn.
</p>

<Figure title="Counting corners, edges and faces" hint="Choose a solid · drag to rotate" num="0.1.3">
	<EulerSolids />
	{#snippet caption()}
		For every solid shaped like a ball, \(V - E + F = 2\). The picture frame has a tunnel through it, and the count
		drops to \(16 - 32 + 16 = 0\). The number \(V - E + F\) cannot see lengths or angles, but it can see tunnels.
	{/snippet}
</Figure>

<p>
	Why should such a crude count be so stable? Here is the key. Suppose you add a new edge across one of the faces,
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
		Leonhard Euler described the formula around 1750; René Descartes had found closely related facts in notes that
		were lost and only rediscovered much later. In 1813 Simon Lhuilier pointed out polyhedra with tunnels where the
		formula gives other values — the first glimpse of a topological invariant. A century later Henri Poincaré, in
		his 1895 memoir <em>Analysis Situs</em> (“the analysis of position”), saw that Euler’s number is an alternating sum
		of hole-counts, \(\chi = b_0 - b_1 + b_2\), and founded what we now call algebraic topology.
	</p>
</History>

<p>
	For the cube: \(b_0 = 1\) piece, \(b_1 = 0\) loop-holes, \(b_2 = 1\) cavity, and \(1 - 0 + 1 = 2\). For the picture
	frame, whose surface is a torus: \(1 - 2 + 1 = 0\). That Euler’s crude count equals this alternating sum of Betti
	numbers is a genuine theorem — you will prove it in <Ref to="homology/homology-groups" />. It is our first clue that
	the holes of a shape can be counted by finite, mechanical calculations.
</p>

<h2 id="loops-that-cannot-shrink">Loops that cannot shrink</h2>

<p>
	How do we detect a loop-hole precisely? Here is a physical test. Wrap a rubber band around a shape, keeping it on
	the surface, and let it contract. On a sphere, every rubber band can slide over the surface and shrink to a point.
	It never gets caught on anything. On a doughnut, some bands also shrink to a point; but a band that goes around the
	tube, or around the central hole, gets stuck. It can slide along the surface, but it can never become smaller than
	the hole it surrounds.
</p>

<Figure title="Rubber bands" hint="Pull the bands tight · drag to rotate" num="0.1.4">
	<RubberBands />
	{#snippet caption()}
		On the sphere, the band shrinks to a point, sweeping across the shaded cap — the region it <em>bounds</em>. On
		the torus, a small band also shrinks, but the band around the tube is stuck: there is no piece of the torus that it
		bounds.
	{/snippet}
</Figure>

<p>
	Notice the shaded region on the sphere. The band shrinks because it is the edge — mathematicians say the
	<strong>boundary</strong> — of a piece of the surface, the cap, and the band can slide across that cap. The stuck
	band on the torus is not the boundary of any piece of the torus. And this, finally, is the idea that will become our
	precise definition of a hole:
</p>

<KeyIdea>
	<p>
		<strong>A hole is a loop that does not bound.</strong> More generally, an \(n\)-dimensional hole is an
		\(n\)-dimensional <em>cycle</em> (a closed loop, a closed surface, …) that is not the <em>boundary</em> of
		anything one dimension higher inside the shape.
	</p>
</KeyIdea>

<p>
	The rubber band test is beautiful, but it is not yet mathematics: we cannot try every way of sliding a band. The
	great insight of homology is to replace sliding with <em>bookkeeping</em>. We cut the shape into simple pieces —
	triangles, say — and record loops and surfaces as lists of pieces. Then the question “is this loop a boundary?”
	becomes a question about solving equations, which a computer (or a patient human) can always answer.
</p>

<h2 id="from-counting-to-algebra">From counting to algebra</h2>

<p>
	For about thirty years after Poincaré, mathematicians worked with Betti numbers as plain numbers. Then, in the
	mid-1920s, Emmy Noether — one of the great algebraists of the century — pointed out to the topologists around her
	that the loops and surfaces they were counting naturally form <em>groups</em>: you can add two loops (travel one and
	then the other), subtract them (travel one backwards), and the numbers they had been computing were just sizes of
	these groups. It sounds like a change of vocabulary. It was a revolution. Once holes form groups, the whole power of
	algebra can be brought to bear on shape.
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
	Homology counts holes by looking at loops and surfaces <em>inside</em> a shape. Cohomology looks at the same shape
	from the opposite direction: instead of collecting pieces, it attaches <em>measurements</em> to them. A measurement
	might be the change in altitude along each edge of a hiking map, the voltage across each wire of a circuit, the
	exchange rate between two currencies, or the ratio of depths between neighbouring parts of a drawing.
</p>

<p>
	Here is the kind of question cohomology answers. Suppose someone hands you the altitude change along every trail
	segment on a map. Can you recover an altitude for every crossing, consistent with all those changes? Locally, the
	answer is always yes: near any one crossing you can just start from zero and add up the changes. Globally, the answer
	can be no.
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
	This is the logic of the famous <em>impossible staircase</em> of Lionel and Roger Penrose, made immortal by M. C.
	Escher’s lithograph <em>Ascending and Descending</em>, where monks climb forever around a square stairway. Every small
	part of the picture is a perfectly good staircase. The impossibility lives only in the whole loop. It is, quite
	literally, a nonzero cohomology class — and Roger Penrose later wrote a paper analysing impossible figures in exactly
	these terms.
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
	Counting holes may sound like a game. It is also one of the most useful ideas of twentieth-century mathematics, and
	it has found a remarkable second life in science and technology in the twenty-first.
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
	or splash apart — at least one point of the coffee is exactly where it started. This is <strong>Brouwer’s fixed
		point theorem</strong>, proved by the Dutch mathematician L. E. J. Brouwer in the early 1910s. Its proof is a
	two-line argument about holes: if there were no fixed point, you could use the stirring to push the disk onto its
	boundary circle without tearing, and that would destroy the circle’s hole — which homology says is impossible.
</p>

<p>
	Brouwer’s theorem underlies the existence of equilibria in economics. Persistent homology (<Ref to="homology/persistence" />)
	finds circles, voids and tunnels hidden in clouds of data points, from protein structures to the activity of
	neurons. Homology detects gaps in the coverage of a sensor network using only which sensors can see each other.
	Cohomology explains why the Hall conductance of certain thin materials comes in perfectly whole-number steps —
	part of the work on topological phases of matter recognised by the 2016 Nobel Prize in Physics. And the
	configuration spaces of robot arms are studied with exactly the tools of this book.
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
		<strong>Part I, Foundations.</strong> Sets and functions, equivalence and quotients, groups, and linear algebra —
		exactly the algebra that homology needs, and no more.
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
		<strong>Figures are meant to be touched.</strong> Most of them respond to dragging, clicking, sliders or buttons; the
		small hint above each figure says how. On a phone, tap “Tap to rotate” before dragging a 3D figure, so that the page
		can still scroll.
	</li>
	<li>
		<strong>Dotted underlines are glossary terms.</strong> Hover over (or tap) a word like <Term t="invariant">invariant</Term>
		to see its definition without losing your place. The full <a href={href('/glossary/')}>glossary</a> and a
		<a href={href('/notation/')}>notation guide</a> are always one click away in the top bar.
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
			falls apart when a point is removed. (Q depends on the font: does its tail cross the loop or just touch it?)
			This “cut point” invariant is made precise in <Ref to="topology/spaces" />.
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
			Yes. A T-shirt has four openings (the neck, the waist and two sleeves), so it is a sphere with four disks
			removed. A pair of trousers has three openings (the waist and two legs), so it is a sphere with three disks
			removed. These are <em>not</em> the same: the number of boundary circles is a topological invariant, and
			\(4 \neq 3\). (Stretching cannot create or remove an edge of the fabric.) So the topologist <em>can</em> tell a
			T-shirt from a pair of trousers — though not, of course, a coffee cup from a doughnut.
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
			Homology turns “holes” into precise invariants. Its Betti numbers \(b_0, b_1, b_2, \dots\) count pieces, loops
			that cannot be shrunk, and enclosed cavities. The precise idea is: <em>a hole is a cycle that is not a
			boundary</em>.
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
			author: 'David Richeson, Quanta Magazine (2021)',
			url: 'https://www.quantamagazine.org/topology-101-how-mathematicians-study-holes-20210126/',
			note: 'The straw debate, and why mathematicians needed a precise definition of a hole.',
			kind: 'web',
			free: true
		},
		{
			title: 'Euler’s Gem',
			author: 'David Richeson (Princeton, 2008)',
			note: 'A popular history of V − E + F and the birth of topology.',
			kind: 'book'
		},
		{
			title: 'The Shape of Space',
			author: 'Jeffrey Weeks',
			url: 'https://www.geometrygames.org/TorusGames/',
			note: 'A wonderfully visual introduction to surfaces and three-dimensional spaces; try the free Torus Games.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology, Chapter 0',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch0.pdf',
			note: 'The first chapter of the standard textbook — for later, when you want to see the destination in full.',
			kind: 'book',
			free: true
		}
	]}
/>
