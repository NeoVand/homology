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
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import RubberSheet from '$lib/figures/topology/spaces/RubberSheet.svelte';
	import MetricBalls from '$lib/figures/topology/spaces/MetricBalls.svelte';
	import WiggleRoom from '$lib/figures/topology/spaces/WiggleRoom.svelte';
	import TopologyBuilder from '$lib/figures/topology/spaces/TopologyBuilder.svelte';
	import EpsilonDelta from '$lib/figures/topology/spaces/EpsilonDelta.svelte';
	import WrapTear from '$lib/figures/topology/spaces/WrapTear.svelte';
	import CupToDonut from '$lib/figures/topology/spaces/CupToDonut.svelte';
	import LetterLab from '$lib/figures/topology/spaces/LetterLab.svelte';

	const reading = [
		{
			title: 'Topology Without Tears',
			author: 'Sidney A. Morris',
			url: 'https://www.topologywithouttears.net/',
			note: 'A free, famously gentle book that starts exactly where this chapter does — topologies on small finite sets — and takes many small steps. The best next read.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Topology (2nd edition)',
			author: 'James R. Munkres',
			note: 'The standard university text on point-set topology (Prentice Hall, 2000). Chapters 2–3 cover everything here, with full proofs and many exercises. Precise and patient, but a real step up.',
			kind: 'book' as const
		},
		{
			title: 'How does a topologist classify the letters of the alphabet?',
			author: 'Rafael López (arXiv, 2014)',
			url: 'https://arxiv.org/abs/1410.3364',
			note: 'A short, playful paper that does for the whole alphabet what our Letter Lab does, and points out how much the answer depends on the font.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'What Does Compactness Really Mean?',
			author: 'Evelyn Lamb (Scientific American blog, 2017)',
			url: 'https://www.scientificamerican.com/blog/roots-of-unity/what-does-compactness-really-mean/',
			note: 'A friendly essay on the most slippery idea in this chapter, with good pictures in words: compact sets are like jelly, non-compact ones like rice pudding.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Topology vs “a” Topology',
			author: 'Kelsey Houston-Edwards (PBS Infinite Series)',
			url: 'https://www.pbs.org/video/topology-vs-a-topology-6onwsj/',
			note: 'A fifteen-minute video on why the axioms for open sets look the way they do — a good companion to our section on topological spaces.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Algebraic Topology, Chapter 0',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch0.pdf',
			note: 'Where we are heading: the opening chapter of the standard graduate text. Read it after the next two chapters of this book; it assumes this chapter as background.',
			kind: 'notes' as const,
			free: true
		}
	];
</script>

<Epigraph author="James Munkres" source="Topology, 2nd ed. (2000)">…a set can be open, or closed, or both, or neither!</Epigraph>

<p class="lead">
	The Prelude told the old joke that a topologist is someone who cannot tell a coffee cup from a doughnut. Behind the joke sits
	a real question. In what sense are a cup and a doughnut “the same”? And if they are, how could we ever <em>prove</em> that two shapes are
	<em>different</em>? This chapter builds the language that makes both questions precise.
</p>

<p>
	In <Ref to="prelude/shape-of-a-question" /> we met the idea informally: topology studies the properties of a shape that survive
	stretching, bending and squeezing, but not tearing or gluing. That slogan is a good start, but it is not yet mathematics. What,
	exactly, is a “shape”? What does it mean to stretch one without tearing it? Over the next pages we will answer both questions
	with two short definitions — <em>topological space</em> and <em>continuous map</em> — and we will get there by small steps,
	starting from something everyone already understands: distance.
</p>

<Ahead>
	<p>
		Everything in the rest of the book is built on this chapter. Homology, the subject of Part III, is a machine that turns a
		space into a list of numbers and groups; the whole point of the machine is that <strong>homeomorphic spaces give the same
		output</strong>. That makes homology a <em>topological invariant</em> — a tool for proving that two spaces are different. Along
		the way, three ideas from this chapter will come back again and again: <em>continuity defined through preimages</em> (the
		first appearance of the “reversed arrows” that drive cohomology in Part IV), <em>connectedness</em> (which becomes the
		zeroth homology group \(H_0\)), and <em>compactness</em> (which is why our spaces can be built from finitely many pieces).
	</p>
</Ahead>

<h2 id="rubber-sheet">Rubber-sheet geometry</h2>

<p>
	Imagine drawing on a sheet of very stretchy rubber. Draw a closed loop, put a dot inside it and another dot outside it, and
	draw a curve that crosses the loop. Now grab the sheet and pull. Lengths change. Areas change. Straight lines go wavy, circles
	turn into blobs, right angles open out. Almost everything a geometry teacher would measure is destroyed.
</p>
<p>
	And yet some things stubbornly refuse to change. The dot that was inside the loop is still inside it. The dot outside is
	still outside. The loop is still one closed curve, and the curve still crosses it the same number of times. No amount of
	stretching can change these facts — <em>unless</em> you tear the sheet, or press two parts of it together so hard that they
	stick. Try it in Figure 2.1.1.
</p>

<Figure size="wide" num="2.1.1" title="A rubber sheet" hint="Drag the gold pins to stretch · then try Tear and Glue">
	<RubberSheet />
	{#snippet caption()}
		Stretching changes every measurement in the left column, but none of the facts in the right column. Tearing the loop open
		destroys “inside”, and gluing two of its points together splits the inside in two. If you pull too hard the sheet folds over
		itself; that is not allowed either, because two different points would end up in the same place.
	{/snippet}
</Figure>

<p>
	This is the starting point of topology. We want to keep track of exactly the information that survives stretching, and
	deliberately forget everything else. The facts that survive are all about <em>nearness</em>: which points are close to which,
	which regions touch, what is surrounded by what. Distances themselves are forgotten — the rubber can stretch them — but
	“being close” is not forgotten, because stretching never pulls neighbouring points apart into separate pieces.
</p>
<p>
	So our plan is this. First we describe nearness with the help of distance, because distance is familiar. Then we notice that
	all the facts we care about can be phrased without mentioning any particular distance, using only certain sets called
	<em>open sets</em>. Finally we throw the distance away and keep only the open sets. What remains is a
	<strong>topological space</strong>: a set of points together with a precise notion of nearness, and nothing else.
</p>

<h2 id="distance">Measuring distance: metric spaces</h2>

<p>
	How far is it from \(A\) to \(B\)? On a map, you would lay a ruler between them. In a city laid out on a grid, a taxi driver
	would give you a different answer, because the taxi cannot drive through buildings: it must go along streets, east–west and
	north–south. Both answers are perfectly reasonable ways to measure distance. Let us write them down.
</p>
<p>
	A point of the plane is a pair of numbers \(x = (x_1, x_2)\). The <strong>straight-line distance</strong> between
	\(x\) and \(y = (y_1, y_2)\) comes from Pythagoras' theorem:
</p>
\[ d_2(x, y) = \sqrt{(x_1 - y_1)^2 + (x_2 - y_2)^2}. \]
<p>
	The <strong>taxicab distance</strong> adds up how far you must go east–west and how far north–south:
</p>
\[ d_1(x, y) = \abs{x_1 - y_1} + \abs{x_2 - y_2}. \]
<p>
	(Here \(\abs{t}\), read “the absolute value of \(t\)”, means \(t\) with its minus sign removed, if it has one: \(\abs{-3} = 3\)
	and \(\abs{3} = 3\).) There is even a third, the <strong>max distance</strong> \(d_\infty(x, y) = \max(\abs{x_1 - y_1},
	\abs{x_2 - y_2})\), which is how many moves a king needs on a chessboard. The little subscripts \(1, 2, \infty\) are just names.
</p>
<p>
	What do these three have in common? Mathematicians answer such a question by listing the properties that every sensible
	distance should have, and then calling anything with those properties a distance. The list is short.
</p>

<Definition title="Metric space" id="def-metric">
	<p>
		A <dfn>metric</dfn> on a set \(X\) is a rule \(d\) that gives, for every two points \(x, y \in X\), a real number
		\(d(x, y)\) — “the distance from \(x\) to \(y\)” — such that for all \(x, y, z \in X\):
	</p>
	<ol>
		<li><strong>Positivity:</strong> \(d(x, y) \ge 0\), and \(d(x, y) = 0\) exactly when \(x = y\).</li>
		<li><strong>Symmetry:</strong> \(d(x, y) = d(y, x)\).</li>
		<li><strong>Triangle inequality:</strong> \(d(x, z) \le d(x, y) + d(y, z)\).</li>
	</ol>
	<p>A set together with a metric is a <dfn>metric space</dfn>.</p>
</Definition>

<p>
	Each rule is common sense. Distances are never negative, and the only point at distance zero from you is yourself. The way
	there is as long as the way back. And the triangle inequality says that a detour through \(y\) can never be a shortcut: going
	from \(x\) to \(z\) directly is at most as long as going via \(y\). All three of our distances obey all three rules. So does
	the distance along a line, \(d(x, y) = \abs{x - y}\) for real numbers, and so does the straight-line distance in
	three-dimensional space or in any dimension \(n\), where \(\R^n\) (read “R n”) is the set of lists of \(n\) real numbers.
</p>
<p>
	A slightly mischievous example shows how loose the definition is. On <em>any</em> set, declare that the distance between two
	different points is always \(1\), and the distance from a point to itself is \(0\). You can check that the three rules hold.
	This is the <strong>discrete metric</strong>: every point is at arm's length from every other, and nothing is close to
	anything.
</p>

<Figure size="wide" num="2.1.2" title="Three rulers for the plane">
	<MetricBalls />
	{#snippet caption()}
		Left: from \(A\) to \(B\) it is \(5\) blocks as the crow flies but \(7\) by taxi, and every staircase route is equally long.
		Right: the points at distance less than \(1\) from \(x\) form a disk for the straight-line distance, a diamond for the
		taxicab distance and a square for the max distance. Each fits inside the next.
	{/snippet}
</Figure>

<p>
	The right half of Figure 2.1.2 introduces the most important shape in this chapter. The <dfn>open ball</dfn> of radius \(r\)
	around a point \(x\) is the set of all points less than \(r\) away from \(x\):
</p>
\[ B(x, r) = \setb{y \in X}{d(y, x) < r}. \]
<p>
	(Read this as “the set of all \(y\) in \(X\) such that the distance from \(y\) to \(x\) is less than \(r\)”.) With the
	straight-line distance in the plane, \(B(x, r)\) is a round disk without its rim — “open” because the rim, where the
	distance is exactly \(r\), is left out. With the taxicab distance the same formula gives a diamond, and with the max distance
	a square. On the real line, \(B(x, r)\) is the interval from \(x - r\) to \(x + r\), endpoints excluded. With the discrete
	metric, a ball of radius \(\tfrac12\) contains just its centre: everything else is at distance \(1\).
</p>

<h2 id="open-sets">Open sets: room to wiggle</h2>

<p>
	Here is the idea that unlocks everything. Think of a region of the plane — a pond, say — and a point inside it. Call the
	point <em>comfortably inside</em> if you can draw some disk around it, however small, that stays entirely in the pond. A frog
	sitting at such a point has room to wiggle in every direction without getting its feet wet.
</p>
<p>
	Points well inside the pond are comfortably inside. What about a point exactly on the shore? If the shore belongs to the
	region, then every disk around a shore point, no matter how tiny, pokes out over the land. Shore points have no wiggle room.
</p>

<Definition title="Open set" id="def-open">
	<p>
		A subset \(U\) of a metric space \(X\) is <dfn>open</dfn> if every point of \(U\) has some wiggle room: for every \(x \in U\)
		there is a radius \(r > 0\) with \(B(x, r) \subseteq U\).
	</p>
</Definition>

<p>
	Read the definition slowly, because its shape — “for every point there exists a radius” — will recur. The radius is allowed
	to depend on the point: points near the edge of \(U\) may need very small balls. What is <em>not</em> allowed is a point
	where no radius at all works. Play with Figure 2.1.3: drag the point \(x\) around different regions and watch the largest ball
	that fits.
</p>

<Figure size="wide" num="2.1.3" title="Wiggle room" hint="Drag x (or focus it and use the arrow keys) · switch regions and rulers">
	<WiggleRoom />
	{#snippet caption()}
		A solid edge belongs to the set; a dashed edge does not. A set is open when every one of its points has a ball around it
		inside the set — so a solid edge anywhere spoils openness. Now switch the ruler: the balls change shape, but which points
		have room never changes.
	{/snippet}
</Figure>

<Example title="Intervals">
	<p>
		On the real line, the open interval \((0, 1)\) (all numbers strictly between \(0\) and \(1\)) is open: a point \(x\) in it is
		at distance \(\min(x, 1 - x)\) from the nearer end, and the ball with that radius stays inside. The closed interval
		\([0, 1]\) (now \(0\) and \(1\) are included) is not open, because the point \(0\) has no room on its left. The half-open
		interval \([0, 1)\) is not open either, for the same reason.
	</p>
</Example>

<p>Two facts about open sets are easy to check, and they will turn out to be the whole story.</p>

<Proposition title="Unions and intersections" id="prop-union">
	<p>In a metric space:</p>
	<ol>
		<li>any union of open sets is open — even infinitely many of them;</li>
		<li>the intersection of <em>two</em> (hence of finitely many) open sets is open.</li>
	</ol>
</Proposition>

<Proof>
	<p>
		(1) If \(x\) lies in the union, it lies in one of the sets, say \(U\). Some ball around \(x\) fits in \(U\), and therefore
		in the union, which is bigger.
	</p>
	<p>
		(2) If \(x\) lies in both \(U\) and \(V\), there is a ball of radius \(r\) around \(x\) inside \(U\) and one of radius \(s\)
		inside \(V\). The ball of radius \(\min(r, s)\) — the smaller of the two — fits inside both.
	</p>
</Proof>

<Warning title="Infinitely many intersections can go wrong">
	<p>
		The trick in (2) is to take the smallest radius. With finitely many radii there is always a smallest one, and it is
		positive. With infinitely many radii, they can shrink to nothing. For example, the intervals \((-1, 1)\), \((-\tfrac12,
		\tfrac12)\), \((-\tfrac13, \tfrac13)\), … are all open, but the only number in all of them is \(0\). Their intersection is
		the single point \(\set{0}\), which is not open: it contains no interval at all around \(0\).
	</p>
</Warning>

<p>
	Now for the observation that justifies the whole programme. Look again at the three unit balls in Figure 2.1.2: the diamond
	sits inside the disk, which sits inside the square. In general,
</p>
\[ d_\infty(x, y) \;\le\; d_2(x, y) \;\le\; d_1(x, y) \;\le\; 2\, d_\infty(x, y). \]
<p>
	Read the middle inequality, \(d_2 \le d_1\), as a statement about balls: anything within taxicab distance \(r\) of \(x\) is
	also within straight-line distance \(r\), so the diamond of radius \(r\) sits inside the disk of radius \(r\). In the other
	direction, \(d_1 \le \sqrt2\, d_2\) (you will prove this in <a href="#ex-two-rulers">an exercise</a>), so anything within straight-line distance \(r/\sqrt2\)
	is within taxicab distance \(r\): a smaller disk sits inside every diamond. Either way, <em>whenever a ball of one kind fits
	around a point, a ball of the other kind fits too</em>.
</p>

<KeyIdea>
	<p>
		The straight-line, taxicab and max distances give the plane <strong>exactly the same open sets</strong>. They disagree about
		every distance, but they agree completely about wiggle room. So “open” is a more robust idea than “distance”: it is the
		part of the information that survives a change of ruler.
	</p>
</KeyIdea>

<h3>Closed sets</h3>

<p>
	What about sets like the closed disk, which contain their whole rim? They have their own name. The <dfn>complement</dfn> of a
	set \(A \subseteq X\) is everything in \(X\) that is not in \(A\); it is written \(X \setminus A\) (read “\(X\) minus
	\(A\)”).
</p>

<Definition title="Closed set" id="def-closed">
	<p>A subset \(A\) of \(X\) is <dfn>closed</dfn> if its complement \(X \setminus A\) is open.</p>
</Definition>

<p>
	The closed disk is closed because the part of the plane outside it is open: every point outside the disk has a little ball
	around it that stays outside. Intuitively, a set is closed when it contains its whole boundary — every point it gets
	arbitrarily close to. To say this precisely, call \(x\) a <dfn>limit point</dfn> of \(A\) if every ball around \(x\), however
	small, contains a point of \(A\) other than \(x\) itself. Then a set is closed exactly when it contains all of its limit
	points (<a href="#ex-limit-points">an exercise</a> asks you to see why). The closed interval \([0, 1]\) is closed; so is a single point; so is the set \(\Z\) of whole numbers.
</p>
<p>
	The words “open” and “closed” come from these examples, and they are a little unfortunate, because in everyday language a
	door that is not open is closed. Sets are not like doors: as the epigraph of this chapter warns, a set can be open, or closed,
	or both, or neither. The half-open interval \([0, 1)\) is neither: it is not open (no room at \(0\)) and not
	closed (it gets arbitrarily close to \(1\) without containing it). And the whole real line \(\R\) is both: it is open (every
	point has all the room in the world) and closed (its complement is the empty set \(\varnothing\), which is open because it
	has no points that could fail the test). Sets that are both are sometimes called <dfn>clopen</dfn>.
</p>

<Question>
	<p>
		Is the empty set open? The definition says: every point of \(\varnothing\) has a ball around it inside \(\varnothing\). Since
		\(\varnothing\) has no points, there is nothing to check, and the statement is true — <em>vacuously</em> true, as we said in
		<Ref to="prelude/reading-math" />. Make sure this feels right before you go on: it is exactly the reason \(\R\) is closed.
	</p>
</Question>

<Warning title="Open depends on where you stand">
	<p>
		Whether a set is open depends on the space it lives in. Inside the real line, \([0, \tfrac12)\) is not open: the point \(0\)
		has no room on its left. But if our whole universe is the interval \([0, 1]\), there <em>is</em> no left of \(0\): the
		“ball” of radius \(\tfrac14\) around \(0\) in the space \([0, 1]\) is \([0, \tfrac14)\), which fits inside \([0, \tfrac12)\).
		So \([0, \tfrac12)\) <em>is</em> open as a subset of \([0, 1]\). Always ask: open in what?
	</p>
</Warning>

<h2 id="topological-spaces">Forgetting the ruler: topological spaces</h2>

<p>
	We now have two kinds of information about the plane: distances, which stretching destroys, and open sets, which survive a
	change of ruler. Later in this chapter we will see that continuity, connectedness and compactness — all the concepts topology
	actually needs — can be described using open sets alone. So we make a bold move: we throw away the distance and keep only
	the list of open sets. To know which lists are allowed, we keep exactly the properties we proved above.
</p>

<Definition title="Topological space" id="def-topology">
	<p>
		A <dfn>topology</dfn> on a set \(X\) is a collection \(\mathcal T\) of subsets of \(X\), called the <dfn>open sets</dfn>,
		such that:
	</p>
	<ol>
		<li>\(\varnothing\) and \(X\) are open;</li>
		<li>any union of open sets is open (however many sets there are);</li>
		<li>the intersection of any two open sets is open (and so of any finite number of them).</li>
	</ol>
	<p>
		A <dfn>topological space</dfn> is a set together with a topology, written \((X, \mathcal T)\), or simply \(X\) when the
		topology is clear. Its elements are called <dfn>points</dfn>.
	</p>
</Definition>

<p>
	(The curly \(\mathcal T\) is just a capital T, for “topology”.) Notice what this definition does <em>not</em> say. It does not
	say what the points are: they can be numbers, pairs of numbers, letters, functions, anything. It does not mention distance,
	angles, straight lines or size. It describes a <em>role</em> — a list of sets that behaves like the open sets of a metric
	space — and anything that plays the role counts. The word “topology” is a little overloaded: “topology” is the subject, while
	“a topology on \(X\)” is a particular collection of open sets.
</p>

<h3>Why these rules?</h3>

<p>
	The first answer is the one we have already given: these are exactly the properties that the open sets of every metric space
	have, so every metric space is automatically a topological space. Any theorem we prove about topological spaces will apply to
	all of them at once.
</p>
<p>
	The second answer gives more insight into the strange asymmetry — any union, but only finite intersections. Think of an open
	set as a <em>property you can confirm by a finite measurement</em>. Suppose you want to know whether a number \(x\), which you
	can measure to any precision you like, lies in the open interval \((0, 1)\). If it does, then a precise enough measurement
	will eventually show it: once you know \(x\) to within a small enough error, you can be sure. (If \(x\) is exactly \(1\), on
	the other hand, no finite measurement can ever confirm that \(x < 1\) — which is why \((0, 1]\) is not open.) Now:
</p>
<ul>
	<li>
		To confirm “\(x\) has property \(P_1\) <em>or</em> \(P_2\) <em>or</em> \(P_3\) or …”, even infinitely many, it is enough to
		confirm <em>one</em> of them — a finite job. So unions of open sets are open.
	</li>
	<li>
		To confirm “\(P_1\) <em>and</em> \(P_2\)”, you confirm both, one after the other — still a finite job. But to confirm
		infinitely many properties at once you might need infinitely many measurements, which you can never finish. So only finite
		intersections are guaranteed to be open.
	</li>
</ul>
<p>
	This “observable properties” picture comes from computer science, where topology describes what a program can find out in
	finite time. It is worth keeping alongside the wiggle-room picture: both will help later.
</p>

<h3>Examples, from blurry to sharp</h3>

<Example title="The usual topologies">
	<p>
		The real line \(\R\), the plane \(\R^2\), space \(\R^3\) and every \(\R^n\) get their topology from the straight-line
		distance (or the taxicab distance — it gives the same open sets). This is called the <dfn>usual</dfn> or
		<dfn>standard</dfn> topology, and whenever we mention \(\R^n\) without saying more, this is the one we mean.
	</p>
</Example>

<p>
	Two extreme examples exist on every set, and they bracket all the others. In the <dfn>discrete topology</dfn>, <em>every</em>
	subset is open. It is the topology of the discrete metric (each single point is a ball of radius \(\tfrac12\), and any set is a
	union of single points), and it is the sharpest possible view: every point is isolated from every other. In the
	<dfn>indiscrete topology</dfn>, the only open sets are \(\varnothing\) and \(X\). It is the blurriest possible view: no open set
	can tell any two points apart. The rules of a topology are satisfied in both cases — check!
</p>
<p>
	Between the two extremes there are usually very many topologies. On a set with three points, \(X = \set{a, b, c}\), there are
	exactly \(29\). Figure 2.1.4 lets you hunt for them, and the checker tells you exactly which rule your collection breaks.
</p>

<Figure size="wide" num="2.1.4" title="Build a topology" hint="Click a subset to make it open (or Enter on the keyboard)">
	<TopologyBuilder />
	{#snippet caption()}
		The eight subsets of \(X = \set{a, b, c}\), each linked to the subsets one size bigger. Choose which ones are open. For
		instance \(\set{\varnothing, \set{a}, \set{b}, X}\) fails, because \(\set{a} \cup \set{b} = \set{a, b}\) is missing; add
		\(\set{a, b}\) and it becomes a topology.
	{/snippet}
</Figure>

<p id="neighbourhoods">
	A last piece of vocabulary. If \(x\) is a point of a topological space, an open set containing \(x\) is called a
	<dfn>neighbourhood</dfn> of \(x\). In a metric space, “\(U\) is a neighbourhood of \(x\)” means “\(U\) is open and contains a
	ball around \(x\)” — a region that gives \(x\) some room.
</p>

<h3>New spaces from old: subspaces and products</h3>

<p>
	The circle and the sphere are the most important spaces in this book, so we had better be able to say what their topologies
	are. They are not open subsets of anything; they are thin shapes sitting inside a bigger space. The rule is: <em>an open set
	of the small space is what you see of an open set of the big space when you look only at the small space</em>.
</p>

<Definition title="Subspace topology" id="def-subspace">
	<p>
		If \(A\) is a subset of a topological space \(X\), the <dfn>subspace topology</dfn> on \(A\) declares a set open when it is
		of the form \(U \cap A\) for some open set \(U\) of \(X\).
	</p>
</Definition>

<p>
	The unit circle \(S^1\) is the set of points \((x_1, x_2)\) in the plane with \(x_1^2 + x_2^2 = 1\). An open disk in the plane
	that crosses the circle meets it in an <em>open arc</em> — an arc without its two end points — and these open arcs (and their
	unions) are the open sets of \(S^1\). In the same way the sphere \(S^2\) sits in \(\R^3\), and its open sets are the open
	patches you cut out of it with open balls. The circle and the sphere are named after their dimension: \(S^1\) is
	one-dimensional (an ant on it can only walk forwards or backwards) and \(S^2\) is two-dimensional, a surface. The Warning box
	above was the same idea: \([0, \tfrac12)\) is open in the subspace \([0, 1]\) because it equals \((-\tfrac12, \tfrac12) \cap
	[0, 1]\).
</p>
<p>
	There is a similar recipe for building a space from two others. Recall from <Ref to="foundations/sets-and-functions" /> that the
	<Term t="cartesian-product">Cartesian product</Term> \(X \times Y\) is the set of all pairs \((x, y)\) with \(x \in X\) and
	\(y \in Y\). The <dfn>product topology</dfn> on \(X \times Y\) takes as its basic open sets the “open rectangles” \(U \times
	V\), with \(U\) open in \(X\) and \(V\) open in \(Y\), and calls a set open when it is a union of such rectangles. The product
	\(\R \times \R\) is the plane \(\R^2\) with its usual topology (an open disk is a union of tiny open rectangles). The product
	\(S^1 \times [0, 1]\) is a cylinder, and the product \(S^1 \times S^1\) of two circles is the surface of a doughnut — the
	<strong>torus</strong>, which we will meet again and again.
</p>

<h2 id="continuity">Continuity: no tearing</h2>

<p>
	We have a precise notion of space. Now we need a precise notion of “stretching without tearing”. In topology, a stretching is
	a <em>function</em> — a rule that sends each point of one space to a point of another — with a special property called
	continuity. Let us discover the property on the real line first, where we can draw graphs.
</p>
<p>
	Draw the graph of a function \(f\). Informally, \(f\) is continuous if you can draw its graph without lifting your pen. Look at
	the function with a jump in Figure 2.1.5. Near \(a = 2\), the inputs are very close to each other, but the outputs leap from
	about \(0.6\) to about \(1.7\). Points that were neighbours have been torn apart. Continuity is the promise that this never
	happens: <em>inputs that are close enough produce outputs that are close</em>.
</p>
<p>
	To make “close enough” precise, mathematicians play a game. A challenger names a tolerance \(\varepsilon\) (the Greek letter
	epsilon, by tradition a small positive number). You must reply with a window \(\delta\) (delta) so that every input within
	\(\delta\) of \(a\) produces an output within \(\varepsilon\) of \(f(a)\). If you can win, however small the challenger makes
	\(\varepsilon\), the function is continuous at \(a\).
</p>

<Definition title="Continuity (ε–δ)" id="def-continuity-epsilon">
	<p>
		A function \(f \colon \R \to \R\) is <dfn>continuous at</dfn> the point \(a\) if for every \(\varepsilon > 0\) there exists a
		\(\delta > 0\) such that
	</p>
	\[ \abs{x - a} < \delta \quad\text{implies}\quad \abs{f(x) - f(a)} < \varepsilon. \]
	<p>It is <dfn>continuous</dfn> if it is continuous at every point.</p>
</Definition>

<p>
	The order of the quantifiers matters, exactly as in the game: first the challenger picks \(\varepsilon\) (“for every
	\(\varepsilon\)”), then you answer with \(\delta\) (“there exists \(\delta\)”), and your \(\delta\) may depend on the
	\(\varepsilon\) you were given. Play the game below.
</p>

<Figure size="wide" num="2.1.5" title="The ε–δ game" hint="Choose ε, then find a δ that works · press “smaller ε!” to raise the stakes">
	<EpsilonDelta />
	{#snippet caption()}
		Teal: the band of outputs within \(\varepsilon\) of \(f(a)\). Violet: the window of inputs within \(\delta\) of \(a\). You win
		if the graph over the window stays in the band (green). At the jump, once \(\varepsilon\) is smaller than half the jump, no
		window works, however narrow; the steep function needs very narrow windows, but some window always works.
	{/snippet}
</Figure>

<h3>From the game to open sets</h3>

<p>
	The ε–δ definition speaks of distances, which we have promised to forget. Let us translate it. The inputs within \(\delta\)
	of \(a\) form the ball \(B(a, \delta)\); the outputs within \(\varepsilon\) of \(f(a)\) form the ball \(B(f(a), \varepsilon)\).
	So continuity at \(a\) says: for every ball around \(f(a)\), some ball around \(a\) is sent entirely inside it.
</p>
<p>
	Now bring in the <Term t="preimage">preimage</Term> from <Ref to="foundations/sets-and-functions" />. For a function \(f \colon X
	\to Y\) and a set \(V \subseteq Y\), the preimage \(f^{-1}(V)\) is the set of all points of \(X\) that \(f\) sends into \(V\):
</p>
\[ f^{-1}(V) = \setb{x \in X}{f(x) \in V}. \]
<p>
	(Despite the notation, this makes sense even when \(f\) has no inverse function: it simply asks “who lands in \(V\)?”) In this
	language, “\(B(a, \delta)\) is sent inside \(V\)” means “\(B(a, \delta) \subseteq f^{-1}(V)\)”. So a function is continuous
	exactly when, for every open \(V\) in the target, every point of \(f^{-1}(V)\) has a little ball around it inside
	\(f^{-1}(V)\) — that is, when <em>every preimage of an open set is open</em>.
</p>

<Theorem title="Continuity without distances" id="thm-preimage">
	<p>
		For a function \(f \colon X \to Y\) between metric spaces, the following are equivalent: (a) \(f\) satisfies the ε–δ
		condition at every point; (b) for every open set \(V \subseteq Y\), the preimage \(f^{-1}(V)\) is open in \(X\).
	</p>
</Theorem>

<Proof>
	<p>
		(a) ⇒ (b): let \(V\) be open and \(a \in f^{-1}(V)\). Since \(f(a) \in V\) and \(V\) is open, some ball \(B(f(a),
		\varepsilon)\) lies in \(V\). By (a) some ball \(B(a, \delta)\) is sent into \(B(f(a), \varepsilon)\), hence into \(V\); that
		is, \(B(a, \delta) \subseteq f^{-1}(V)\). So every point of \(f^{-1}(V)\) has room: it is open.
	</p>
	<p>
		(b) ⇒ (a): given \(a\) and \(\varepsilon\), the ball \(V = B(f(a), \varepsilon)\) is open, so by (b) its preimage is open
		and contains \(a\). Hence some ball \(B(a, \delta)\) lies inside \(f^{-1}(V)\), which is exactly the ε–δ condition.
	</p>
</Proof>

<p>
	Condition (b) mentions only open sets, so it makes sense in any topological space. We take it as the definition.
</p>

<Definition title="Continuous map" id="def-continuous">
	<p>
		A function \(f \colon X \to Y\) between topological spaces is <dfn>continuous</dfn> if the preimage \(f^{-1}(V)\) of every
		open set \(V \subseteq Y\) is open in \(X\). A continuous function is also called a <dfn>map</dfn>.
	</p>
</Definition>

<Intuition title="Why preimages, not images?">
	<p>
		It might seem more natural to ask that a continuous function send open sets to open sets. It does not work. The constant
		function \(f(x) = 7\) is as continuous as a function can be, yet it sends the open interval \((0, 1)\) to the single point
		\(\set{7}\), which is not open. And \(x \mapsto x^2\) sends \((-1, 1)\) to \([0, 1)\), not open either. Preimages behave
		perfectly; images do not. This is our first meeting with one of the four big ideas of the book, <strong>reversed
		arrows</strong>: \(f\) goes from \(X\) to \(Y\), but the information about open sets travels backwards, from \(Y\) to \(X\).
		The same reversal will define cohomology in <Ref to="cohomology/cochains" />.
	</p>
</Intuition>

<Example title="Continuous or not?">
	<ul>
		<li>
			The step function \(H(x) = 0\) for \(x < 0\) and \(H(x) = 1\) for \(x \ge 0\) is not continuous: the preimage of the open
			interval \((\tfrac12, \tfrac32)\) is \([0, \infty)\), which is not open (the point \(0\) has no room on its left).
		</li>
		<li>
			Constant functions and the identity \(x \mapsto x\) are continuous on any space. If \(f\) and \(g\) are continuous, so is the
			composite \(g \circ f\) (“\(g\) after \(f\)”), because \((g \circ f)^{-1}(W) = f^{-1}(g^{-1}(W))\): pull \(W\) back through
			\(g\), then through \(f\).
		</li>
		<li>
			Every function <em>out of</em> a discrete space is continuous (every set there is open), and every function <em>into</em> an
			indiscrete space is continuous (the only preimages we need are those of \(\varnothing\) and \(Y\)).
		</li>
		<li>
			Wrapping the real line around the circle, \(t \mapsto (\cos 2\pi t, \sin 2\pi t)\), is continuous — even though it sends
			infinitely many points to each point of the circle.
		</li>
	</ul>
</Example>

<Warning title="Continuous maps may glue, but never tear">
	<p>
		The last example shows that continuity forbids tearing but permits <em>gluing</em>: the wrapping map presses together points
		that were far apart, and that is fine. Squashing a whole sheet of rubber to a single point is continuous too. To capture
		“same shape” we will need to forbid gluing as well, by asking the stretch to be reversible. That is the next idea.
	</p>
</Warning>

<h2 id="homeomorphism">Homeomorphisms: the same space, up to stretching</h2>

<Definition title="Homeomorphism" id="def-homeomorphism">
	<p>
		A <dfn>homeomorphism</dfn> between spaces \(X\) and \(Y\) is a <Term t="bijective">bijection</Term> \(f \colon X \to Y\) such
		that both \(f\) and its inverse \(f^{-1} \colon Y \to X\) are continuous. If such an \(f\) exists, \(X\) and \(Y\) are
		<dfn>homeomorphic</dfn>, written \(X \cong Y\).
	</p>
</Definition>

<p>
	A bijection is a perfect matching: every point of \(X\) is paired with exactly one point of \(Y\) and vice versa, so nothing
	is glued. Continuity of \(f\) means no tearing on the way there; continuity of \(f^{-1}\) means no tearing on the way back —
	which is the same as no gluing on the way there. A homeomorphism is a stretching you can perfectly undo.
</p>
<p>
	Why insist that the inverse be continuous? Isn't a continuous bijection enough? Figure 2.1.6 shows why not.
</p>

<Figure size="wide" num="2.1.6" title="A continuous bijection that tears when reversed">
	<WrapTear />
	{#snippet caption()}
		Wrapping the half-open interval \([0, 1)\) once around the circle is continuous and pairs points perfectly. But the small
		open arc \(U\) around \(p\) comes from two separate pieces at opposite ends of the interval. Run backwards, the map would
		rip \(U\) in two at \(p\): its inverse is not continuous, and indeed \([0, 1)\) and the circle are not homeomorphic.
	{/snippet}
</Figure>

<Example title="Stretchings that work">
	<ul>
		<li>
			Any two open intervals are homeomorphic: \(x \mapsto c + (d - c)\,x\) stretches \((0, 1)\) onto \((c, d)\) and is undone by
			\(y \mapsto (y - c)/(d - c)\).
		</li>
		<li>
			Even more surprisingly, \((0, 1) \cong \R\). The function \(x \mapsto \tan\!\big(\pi(x - \tfrac12)\big)\) stretches the
			short interval along the entire line, faster and faster near the ends. Topology cannot see length — not even the
			difference between finite and infinite length.
		</li>
		<li>
			A square (with its inside) is homeomorphic to a disk: push each point towards or away from the centre until the square's
			edge lands on the circle. Corners mean nothing to a topologist.
		</li>
	</ul>
</Example>

<p>
	And now, finally, the mug. A coffee mug — a solid one, made of clay — has a body and a handle with a hole through it. In
	Figure 2.1.7 the mug deforms continuously into a doughnut: first the dent that holds the coffee fills in (a dent is not a hole —
	it does not go all the way through), then the body shrinks into the handle while the handle thickens. At every moment the
	deformation is a perfect, reversible stretching. The gold loop threading the handle is a hint of what is to come: it can
	never be pulled free, not by any stretching, because the hole it goes around is never destroyed.
</p>

<Figure size="wide" num="2.1.7" title="From coffee mug to doughnut" hint="Press Deform or drag the slider · drag the picture to turn it">
	<CupToDonut />
	{#snippet caption()}
		A solid mug becomes a solid doughnut (a <em>solid torus</em>) without tearing or gluing, so the two are homeomorphic. The
		same deformation takes the mug's surface to the doughnut's surface, the torus. The gold loop around the handle survives
		the whole way: holes, unlike dents, cannot be stretched away.
	{/snippet}
</Figure>

<Warning title="Homeomorphic does not mean “deformable inside space”">
	<p>
		Our mug-to-doughnut film happens inside ordinary three-dimensional space, but a homeomorphism need not. Tie a knot in a piece
		of string and glue its ends: you get a trefoil knot, which cannot be untangled into a round circle inside space without
		cutting it. Yet the knot and the circle <em>are</em> homeomorphic: walk along each and pair up the points in order. A
		homeomorphism compares the spaces themselves, not the way they happen to sit in the room. (How shapes sit inside space is
		the subject of knot theory.)
	</p>
</Warning>

<p>
	Being homeomorphic behaves like a sameness should. Every space is homeomorphic to itself (use the identity); if \(X \cong Y\)
	then \(Y \cong X\) (use the inverse); and if \(X \cong Y\) and \(Y \cong Z\) then \(X \cong Z\) (compose). So homeomorphism is
	an <Term t="equivalence-relation">equivalence relation</Term> in the sense of <Ref to="foundations/equivalence" />, and it sorts
	all spaces into classes of “the same shape”.
</p>

<History title="Rubber sheets and rulers">
	<p>
		Johann Listing coined the word <em>Topologie</em> in 1847. Abstract distance came in Maurice Fréchet's 1906 thesis, and Felix
		Hausdorff's <em>Grundzüge der Mengenlehre</em> (1914) gave a definition of topological space built on neighbourhoods. The open-set
		axioms in the form above became standard over the following decades — so the definitions in this chapter are younger than
		the motor car.
	</p>
</History>

<h2 id="invariants">How do you prove two spaces are different?</h2>

<p>
	To show that two spaces are homeomorphic, one good example is enough: exhibit a homeomorphism. To show that they are
	<em>not</em> homeomorphic is a completely different kind of problem. There are infinitely many functions from one to the other,
	and we would have to rule out every single one. We cannot try them all. We need a cleverer idea.
</p>
<p>
	The clever idea is the <dfn>topological invariant</dfn>: a property of spaces (or a number computed from them) that
	homeomorphic spaces always share. If \(X\) has the property and \(Y\) does not, then \(X\) and \(Y\) cannot be homeomorphic. This
	is the <Term t="contrapositive">contrapositive</Term> at work, as in <Ref to="prelude/reading-math" />: “homeomorphic ⇒ same
	invariant” is equivalent to “different invariant ⇒ not homeomorphic”. Here are the first few invariants. Each comes with a
	precise definition and a picture.
</p>

<h3>Connectedness</h3>

<Definition title="Connected" id="def-connected">
	<p>
		A space \(X\) is <dfn>connected</dfn> if it cannot be split into two disjoint, non-empty open sets. That is, there are no
		open sets \(U\) and \(V\), both non-empty, with \(U \cup V = X\) and \(U \cap V = \varnothing\).
	</p>
</Definition>

<p>
	The interval \([0, 1]\) is connected — this is really a deep fact about the real numbers, closely related to the
	intermediate value theorem. The space \([0, 1] \cup [2, 3]\) is not: the two intervals are open in it (subspace topology!) and
	split it in two. A space that is not connected falls apart into maximal connected pieces, its <dfn>connected
	components</dfn>, and the number of components is an invariant.
</p>
<p>
	Why is connectedness invariant? Suppose \(f \colon X \to Y\) is continuous and onto, and \(Y\) splits into open pieces \(U\)
	and \(V\). Then \(f^{-1}(U)\) and \(f^{-1}(V)\) are open (continuity!), disjoint, non-empty, and together they cover \(X\): so
	\(X\) splits too. Taking the contrapositive: <em>a continuous image of a connected space is connected</em>. In particular a
	homeomorphism cannot connect what was split, or split what was connected.
</p>
<p>
	There is a more hands-on version of the same idea. A <dfn>path</dfn> in \(X\) from \(x\) to \(y\) is a continuous map
	\(\gamma \colon [0, 1] \to X\) (gamma, a Greek letter often used for paths) with \(\gamma(0) = x\) and \(\gamma(1) = y\) — a
	journey through the space that starts at \(x\) at time \(0\) and arrives at \(y\) at time \(1\). A space is
	<dfn>path-connected</dfn> if any two of its points can be joined by a path. Every path-connected space is connected. The
	converse fails only for rather wild spaces (the standard example, the “topologist's sine curve”, wiggles infinitely fast), and
	for every space we will meet in this book the two notions agree.
</p>
<p id="path-components">
	A space that is not path-connected falls apart into <dfn>path components</dfn>: two points lie in the same path component when
	some path joins them. (Being joined by a path is an equivalence relation — run one path and then the other — and the path
	components are its classes.) A homeomorphism carries paths to paths, so it matches up the path components of the two spaces
	one for one: the number of path components is an invariant too.
</p>

<Remark title="A preview">
	<p>
		The number of path components will reappear in Part III as the first number homology computes: the group \(H_0(X)\) has one
		generator for each path component. Counting pieces is the simplest kind of hole-counting — counting the “gaps” between pieces.
	</p>
</Remark>

<h3>Compactness</h3>

<p>
	The open interval \((0, 1)\) and the closed interval \([0, 1]\) look almost identical: they differ by two points. Are they
	homeomorphic? There is a feeling that \((0, 1)\) is “leaky”: you can walk towards \(0\) forever, getting closer and closer,
	without ever arriving at a point of the space. The closed interval has no such escape routes. The property that captures this
	is called compactness. In the words of Evelyn Lamb, “Compact means small. It is a peculiar kind of small, but at its heart,
	compactness is a precise way of being small in the mathematical world.”
</p>
<p>
	Here is the precise definition, which takes some getting used to. An <dfn>open cover</dfn> of \(X\) is a collection of open
	sets whose union is all of \(X\) — a way of covering the space with open patches, possibly infinitely many.
</p>

<Definition title="Compact" id="def-compact">
	<p>
		A space \(X\) is <dfn>compact</dfn> if every open cover of \(X\) contains a finite subcollection that still covers \(X\).
	</p>
</Definition>

<p>
	The interval \((0, 1)\) is not compact: the open intervals \((\tfrac12, 1)\), \((\tfrac13, 1)\), \((\tfrac14, 1)\), … cover it
	(every point \(x > 0\) lies in one of them), but any finitely many of them only cover \((\tfrac1n, 1)\) for the largest
	\(n\) used, leaving out the points near \(0\). The leak lets the cover escape. For subsets of \(\R^n\) there is a simple test,
	the <strong>Heine–Borel theorem</strong>: a subset of \(\R^n\) is compact exactly when it is closed and bounded (fits inside
	some big ball). So \([0, 1]\), the circle, the sphere, the torus and the solid doughnut are compact; \((0, 1)\), \(\R\) and the
	open disk are not.
</p>
<p>
	Compactness is an invariant, because a continuous image of a compact space is compact. (Pull the cover back with preimages,
	choose finitely many, and push forward again.) So \((0, 1) \not\cong [0, 1]\). Notice that boundedness on its own is <em>not</em>
	an invariant: \((0, 1)\) is bounded and \(\R\) is not, and yet they are homeomorphic. What compactness detects is not size but
	the absence of escape routes — to infinity, or to a missing edge.
</p>

<h3>Cut points</h3>

<p>
	Our sharpest tool so far is very simple. Remove a single point from a space and count the pieces that are left.
</p>

<Definition title="Cut point" id="def-cut-point">
	<p>
		A point \(p\) of a connected space \(X\) is a <dfn>cut point</dfn> if \(X \setminus \set{p}\) is not connected.
	</p>
</Definition>

<p>
	If \(f \colon X \to Y\) is a homeomorphism, it restricts to a homeomorphism from \(X \setminus \set{p}\) to \(Y \setminus
	\set{f(p)}\). So \(f\) sends cut points to cut points, and a point whose removal leaves three pieces to a point whose removal
	leaves three pieces. This settles several questions at once:
</p>
<ul>
	<li>
		<strong>A circle is not an interval.</strong> Removing any point from a circle leaves it in one piece, but removing a middle
		point from an interval cuts it in two.
	</li>
	<li>
		<strong>A line is not a plane.</strong> Remove a point from \(\R\): two pieces. Remove a point from \(\R^2\): still one
		piece, because you can walk around the gap. So \(\R \not\cong \R^2\), as you would hope.
	</li>
	<li>
		<strong>\([0, 1)\) is not \((0, 1)\).</strong> If \(h\) were a homeomorphism, removing \(0\) from \([0, 1)\) leaves one piece,
		but removing \(h(0)\) from \((0, 1)\) leaves two.
	</li>
</ul>
<p>
	The alphabet is a perfect playground. Think of each capital letter as a space — a shape made of thin strokes. Which letters
	are homeomorphic? Removing points tells them apart: an end of a stroke is never a cut point; a point in the middle of a stroke
	that lies on no loop cuts the letter in two; a junction where three strokes meet can cut it into three. In Figure 2.1.8, snip
	points out of letters and count.
</p>

<Figure size="full" num="2.1.8" title="The Letter Lab" hint="Pick a letter · click a point of it to remove that point">
	<LetterLab />
	{#snippet caption()}
		Removing a junction of T leaves three pieces, but no single point of O leaves more than one. The numbers of free ends, of
		three-way and four-way junctions, and of loops are invariants, and in this font they sort the 26 capitals into eight
		classes. In other fonts the answer can change: if K's arms met its stem at two different points, K would be like H instead
		of X.
	{/snippet}
</Figure>

<h3>One more property: Hausdorff</h3>

<p>
	Some topologies are too blurry to be useful. In the indiscrete topology on two points, every neighbourhood of one point
	contains the other, so a sequence of points could “approach” both at once. Almost every space we care about has a property
	that rules this out.
</p>

<Definition title="Hausdorff space" id="def-hausdorff">
	<p>
		A space is <dfn>Hausdorff</dfn> if any two different points have disjoint neighbourhoods: open sets \(U \ni x\) and \(V \ni
		y\) with \(U \cap V = \varnothing\).
	</p>
</Definition>

<p>
	Every metric space is Hausdorff: if \(d(x, y) = r > 0\), the balls of radius \(r/2\) around \(x\) and \(y\) do not meet, by
	the triangle inequality. In a Hausdorff space a sequence of points can approach at most one limit. The property seems so
	obvious that you may wonder why we name it. The reason is that in the next chapter we will glue spaces together, and gluing
	carelessly can destroy it; and in <Ref to="topology/manifolds" /> it will be part of the very definition of a manifold.
</p>

<h3>Why we need more: holes</h3>

<p>
	Cut points distinguish letters and lines, but they are blunt instruments. Remove a point from a sphere: one piece. Remove a
	point from a torus: one piece. Remove any finite number of points from either: still one piece. Both are connected, compact,
	Hausdorff, and without cut points. Every invariant in this chapter fails to tell them apart — and yet surely a sphere is not
	a doughnut?
</p>
<p>
	The difference is a hole. On the torus there is a loop — the gold loop of Figure 2.1.7 — that cannot be shrunk away or
	pulled free, because it goes around the hole. On the sphere every loop can be shrunk to a point. Turning this observation
	into a rigorous, computable invariant is what the rest of this book is about. In <Ref to="topology/gluing" /> we will learn
	to build tori, spheres and stranger surfaces from simple pieces; in <Ref to="topology/homotopy" /> we will make
	“shrinking a loop” precise; and in Part III, homology will count holes of every dimension, with numbers that no homeomorphism
	can change.
</p>

<KeyIdea>
	<p>
		To prove two spaces are the same, find a homeomorphism. To prove they are different, find an <strong>invariant</strong> that
		tells them apart. Connectedness, compactness and cut points are the first invariants; holes, measured by homology, will be
		the great one.
	</p>
</KeyIdea>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Open, closed, both or neither?" id="ex-open-closed">
	<p>
		Classify each subset of \(\R\) as open, closed, both or neither: (a) \((0, 1)\); (b) \([0, 1]\); (c) \([0, 1)\); (d)
		\(\varnothing\); (e) \(\R\); (f) \(\set{0}\); (g) \(\Z\); (h) the union of the intervals \((\tfrac1n, 1)\) for \(n = 2, 3,
		4, \dots\); (i) the intersection of the intervals \((-\tfrac1n, \tfrac1n)\) for \(n = 1, 2, 3, \dots\).
	</p>
	{#snippet hint()}
		<p>For “closed”, look at the complement. For (h) and (i), work out what the union and the intersection actually are.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) open, not closed (it gets close to \(0\) without containing it). (b) closed, not open (\(0\) has no room). (c) neither.
			(d) and (e) both. (f) closed (its complement \((-\infty, 0) \cup (0, \infty)\) is open) but not open. (g) closed (the
			complement is a union of open intervals \((n, n+1)\)) but not open. (h) the union is \((0, 1)\): open, not closed. (i) the
			intersection is \(\set{0}\): closed, not open — an infinite intersection of open sets need not be open.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Two rulers, one topology" id="ex-two-rulers">
	<p>
		Show that \(d_2(x, y) \le d_1(x, y) \le \sqrt 2\, d_2(x, y)\) for points of the plane. Deduce that every taxicab ball around
		\(x\) contains a straight-line ball around \(x\), and vice versa, so the two metrics give the same open sets.
	</p>
	{#snippet hint()}
		<p>
			Write \(a = \abs{x_1 - y_1}\) and \(b = \abs{x_2 - y_2}\). Compare \((a + b)^2\) with \(a^2 + b^2\), and use \(2ab \le a^2 +
			b^2\), which holds because \((a - b)^2 \ge 0\).
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			With \(a, b\) as in the hint, \(d_1 = a + b\) and \(d_2 = \sqrt{a^2 + b^2}\). First, \((a + b)^2 = a^2 + 2ab + b^2 \ge a^2 +
			b^2\), so \(d_1 \ge d_2\). Second, \((a + b)^2 = a^2 + 2ab + b^2 \le 2(a^2 + b^2)\), so \(d_1 \le \sqrt2\, d_2\). Now if
			\(d_1(y, x) < r\) then \(d_2(y, x) < r\): the taxicab ball \(B_1(x, r)\) lies inside the round ball \(B_2(x, r)\). And if
			\(d_2(y, x) < r/\sqrt2\) then \(d_1(y, x) < r\): the round ball \(B_2(x, r/\sqrt2)\) lies inside \(B_1(x, r)\). So whenever
			a ball of one kind fits inside a set around \(x\), a smaller ball of the other kind fits too, and “open” means the same for
			both.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Closed sets keep their limit points" id="ex-limit-points">
	<p>
		Let \(A\) be a subset of a metric space \(X\). Recall that \(x\) is a limit point of \(A\) if every ball around \(x\)
		contains a point of \(A\) other than \(x\). Show that \(A\) is closed exactly when it contains all of its limit points.
	</p>
	{#snippet hint()}
		<p>
			Both directions are about a point \(x\) <em>outside</em> \(A\). If \(A\) is closed, its complement is open: what does
			that say about the balls around \(x\)?
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Suppose \(A\) is closed and \(x \notin A\). The complement \(X \setminus A\) is open, so some ball \(B(x, r)\) lies
			inside it. That ball contains no point of \(A\) at all, so \(x\) is not a limit point of \(A\). Hence every limit point
			of \(A\) lies in \(A\).
		</p>
		<p>
			Conversely, suppose \(A\) contains all of its limit points, and let \(x \notin A\). Then \(x\) is not a limit point, so
			some ball \(B(x, r)\) contains no point of \(A\) other than \(x\); and \(x\) itself is not in \(A\), so the ball misses
			\(A\) completely and lies inside \(X \setminus A\). Every point of the complement has room around it, so \(X \setminus
			A\) is open, and \(A\) is closed.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Topology or not?" id="ex-topology-or-not">
	<p>
		Let \(X = \set{a, b, c}\). Which of these collections are topologies on \(X\)? (a) \(\set{\varnothing, \set{a}, X}\); (b)
		\(\set{\varnothing, \set{a}, \set{b}, X}\); (c) \(\set{\varnothing, \set{a}, \set{b}, \set{a, b}, X}\); (d)
		\(\set{\varnothing, \set{a, b}, \set{b, c}, X}\).
	</p>
	{#snippet solution()}
		<p>
			(a) Yes. (b) No: \(\set{a} \cup \set{b} = \set{a, b}\) is missing. (c) Yes: all unions and intersections stay in the
			collection. (d) No: \(\set{a, b} \cap \set{b, c} = \set{b}\) is missing. You can check each in Figure 2.1.4.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Continuity, two ways" id="ex-continuity">
	<p>
		(a) For \(f(x) = 2x + 1\), compute the preimage of an open interval \((c, d)\), and conclude that \(f\) is continuous. (b)
		Find a \(\delta\) that works for a given \(\varepsilon\) in the ε–δ definition for the same \(f\). (c) Using preimages, show
		that the step function \(H\) (\(0\) for \(x < 0\), \(1\) for \(x \ge 0\)) is not continuous.
	</p>
	{#snippet solution()}
		<p>
			(a) \(2x + 1\) lies in \((c, d)\) exactly when \(x\) lies in \(\big(\tfrac{c - 1}2, \tfrac{d - 1}2\big)\), an open interval.
			Every open set is a union of open intervals, and preimages respect unions, so every preimage of an open set is open.
		</p>
		<p>(b) \(\abs{f(x) - f(a)} = 2\abs{x - a}\), so \(\delta = \varepsilon/2\) works.</p>
		<p>
			(c) \(H^{-1}\big((\tfrac12, \tfrac32)\big) = [0, \infty)\), which is not open: no interval around \(0\) fits inside it.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="An interval is as long as a line" id="ex-interval-line">
	<p>
		Show that every open interval \((c, d)\) is homeomorphic to \(\R\). Then explain why this shows that “being bounded” is not
		a topological invariant.
	</p>
	{#snippet hint()}
		<p>First stretch \((c, d)\) onto \((-\tfrac\pi2, \tfrac\pi2)\) with a function of the form \(x \mapsto kx + m\). Then use \(\tan\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The map \(g(x) = \pi\frac{x - c}{d - c} - \frac\pi2\) is a continuous bijection from \((c, d)\) onto \((-\tfrac\pi2,
			\tfrac\pi2)\) with continuous inverse \(y \mapsto c + (d - c)\frac{y + \pi/2}\pi\). Then \(\tan\) is a continuous bijection
			from \((-\tfrac\pi2, \tfrac\pi2)\) onto \(\R\), with continuous inverse \(\arctan\). The composite \(\tan \circ g\) is a
			homeomorphism \((c, d) \cong \R\). Since \((c, d)\) is bounded and \(\R\) is not, a property that one has and the other
			lacks cannot be preserved by homeomorphisms.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Snip and count" id="ex-snip">
	<p>
		Using cut points, show that (a) the letters T and X (in our font) are not homeomorphic; (b) the circle \(S^1\) is not
		homeomorphic to the figure-eight (two circles touching at one point). Then (c) explain why the letters E and T are
		homeomorphic.
	</p>
	{#snippet solution()}
		<p>
			(a) Removing the junction of X leaves four pieces; no single point of T leaves more than three (its junction leaves
			exactly three, any other point at most two). A homeomorphism would have to send X's junction to a point of T whose removal
			leaves four pieces, and there is none.
		</p>
		<p>
			(b) Removing the touching point of the figure-eight leaves two pieces, but removing any point of a circle leaves one piece.
		</p>
		<p>
			(c) E consists of one junction (on the stem, where the middle bar meets it) with three strokes coming out of it — up and
			along the top, out along the middle bar, down and along the bottom. The corners do not matter. So E is a “tripod”, exactly
			like T: stretch the three arms of one onto the three arms of the other.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Connectedness is an invariant" id="ex-connected">
	<p>
		Prove carefully: if \(f \colon X \to Y\) is continuous and \(X\) is connected, then the image \(f(X)\) is connected (with the
		subspace topology from \(Y\)). Deduce that a connected space cannot be homeomorphic to a disconnected one.
	</p>
	{#snippet hint()}
		<p>Suppose \(f(X)\) splits into two disjoint non-empty open pieces, and pull them back.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Suppose \(f(X) = A \cup B\) with \(A, B\) disjoint, non-empty and open in \(f(X)\). Then \(A = U \cap f(X)\) and \(B = V \cap
			f(X)\) for some open sets \(U, V\) of \(Y\). Their preimages \(f^{-1}(U)\) and \(f^{-1}(V)\) are open in \(X\) because \(f\)
			is continuous. They cover \(X\) (every \(f(x)\) lies in \(A\) or \(B\)), they are disjoint (a point in both would map into
			\(A \cap B = \varnothing\)), and both are non-empty (\(A\) and \(B\) contain values of \(f\)). That splits \(X\), contradicting
			connectedness. If \(h \colon X \to Y\) were a homeomorphism with \(X\) connected, then \(Y = h(X)\) would be connected; so a
			connected space is never homeomorphic to a disconnected one.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>A <strong>metric</strong> measures distance; balls \(B(x, r)\) are the points less than \(r\) away.</li>
		<li>
			A set is <strong>open</strong> if each of its points has some wiggle room; <strong>closed</strong> if its complement is open.
			Sets can be open, closed, both or neither — and the answer depends on the surrounding space.
		</li>
		<li>
			Different metrics can give the same open sets. A <strong>topology</strong> keeps only the open sets: \(\varnothing\) and
			\(X\) are open, unions are open, finite intersections are open.
		</li>
		<li>
			A map is <strong>continuous</strong> when preimages of open sets are open — the ε–δ idea without distances, and the first
			example of reversed arrows. Continuous maps may glue but never tear.
		</li>
		<li>
			A <strong>homeomorphism</strong> is a continuous bijection with continuous inverse. Homeomorphic spaces are “the same shape”:
			the mug and the doughnut, the interval and the line.
		</li>
		<li>
			To prove spaces <em>different</em>, use <strong>invariants</strong>: connectedness, compactness, cut points, the Hausdorff
			property. They tell the letters of the alphabet apart, but not the sphere from the torus — for that we need holes.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
