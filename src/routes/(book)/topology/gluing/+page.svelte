<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
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
	import Cite from '$lib/components/prose/Cite.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingWorkshop from '$lib/figures/topology/gluing/GluingWorkshop.svelte';
	import FlatTorusGame from '$lib/figures/topology/gluing/FlatTorusGame.svelte';
	import IntervalCircle from '$lib/figures/topology/gluing/IntervalCircle.svelte';
	import Immersions from '$lib/figures/topology/gluing/Immersions.svelte';
	import CollapseLab from '$lib/figures/topology/gluing/CollapseLab.svelte';
	import Constructions from '$lib/figures/topology/gluing/Constructions.svelte';
	import OctagonGenus2 from '$lib/figures/topology/gluing/OctagonGenus2.svelte';

	const reading = [
		{
			title: 'Torus Games',
			author: 'Jeff Weeks',
			url: 'https://www.geometrygames.org/TorusGames/index.html.en',
			note: 'Free apps with nine familiar games — chess, mazes, jigsaws, tic-tac-toe — played on a torus or a Klein bottle. The fastest way to get the feel of a glued square in your fingers; our flight game is a small homage.',
			kind: 'interactive' as const,
			free: true
		},
		{
			title: 'The Shape of Space',
			author: 'Jeffrey R. Weeks',
			note: 'A wonderful, gently paced book (3rd ed., CRC Press, 2020) about two- and three-dimensional universes built by gluing, with exercises and many pictures. Written for curious beginners.',
			kind: 'book' as const
		},
		{
			title: 'This open problem taught me what topology is',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/inscribed-rect-v2/',
			note: 'An animated lesson in which a torus and a Möbius strip appear, by cutting and gluing, as spaces of pairs of points on a loop — and then solve a geometry puzzle about rectangles. No prerequisites.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Algebraic Topology, Chapter 0',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch0.pdf',
			note: 'The standard graduate text. Its opening chapter covers quotient spaces, cell complexes, cones, suspensions, wedge sums and the polygon pictures of surfaces — everything in this chapter, at a brisker pace.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Topology (2nd edition), §22',
			author: 'James R. Munkres',
			note: 'A careful treatment of the quotient topology, with the precise statements behind our “look back before the glue” rule. For when you want every proof.',
			kind: 'book' as const
		},
		{
			title: 'Klein Bottles',
			author: 'Numberphile, with Cliff Stoll',
			url: 'https://www.youtube.com/watch?v=AAsICMPwGPY',
			note: 'Cliff Stoll, who makes Klein bottles out of glass, shows real ones and talks about what makes them strange. Short and light-hearted: a good antidote to all the formulas.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Klein bottle',
			author: 'Wikipedia',
			url: 'https://en.wikipedia.org/wiki/Klein_bottle',
			note: 'Good pictures of several immersions of the Klein bottle, its parametrizations, and its four-dimensional embedding. Its sister article on Boy’s surface does the same for the projective plane.',
			kind: 'web' as const,
			free: true
		}
	];
</script>

<Epigraph author="Leo Moser" source="a limerick"
	>A mathematician named Klein<br />Thought the Möbius band was divine.<br />Said he: ‘If you glue<br />The edges of two,<br />You’ll
	get a weird bottle like mine.’</Epigraph
>

<p class="lead">
	In the old arcade game, a little spaceship flies off the right-hand edge of the screen and reappears on the left; it leaves
	through the top and comes back through the bottom. The game never says so, but the ship lives on a doughnut. This chapter is
	about building spaces by <em>gluing</em>: declaring that certain points are to be regarded as the same. From a single square
	we will make a cylinder, a Möbius band, a torus, a sphere, a Klein bottle and a projective plane — and find that two of them
	cannot be built in our three-dimensional world without passing through themselves.
</p>

<p>
	Gluing is the topological version of an idea you have met before. In <Ref to="foundations/equivalence" /> we glued the two ends
	of an interval together — as a <em>set</em> — by declaring \(0 \sim 1\), and called the result a circle. Now that we know what a
	topological space is (<Ref to="topology/spaces" />), we can finish the job: give the glued set a topology, so that it really
	<em>is</em> a circle, and then do the same in two dimensions, where far stranger things can happen.
</p>

<Ahead>
	<p>
		Gluing is how this book builds every space it studies. In <Ref to="topology/simplicial-complexes" /> spaces are made from
		triangles glued along their edges; in homology the gluing instructions become algebra. The words we write around the edges of
		a square in this chapter — like \(aba^{-1}b^{-1}\) for the torus — will turn, almost literally, into the boundary formulas that
		compute homology in <Ref to="homology/computing" />. The twist in the Klein bottle’s word \(abab^{-1}\) will reappear there as a
		mysterious \(\Z/2\). And gluing is an instance of one of the book’s four big ideas: <strong>quotients</strong>, making new
		things by declaring different things the same.
	</p>
</Ahead>

<h2 id="wrap-around">A screen that wraps around</h2>

<p>
	Fly the ship in Figure 2.2.1 (it will fly itself until you take the controls). Leave through the right edge and you reappear
	on the left, at the same height. Leave through the top and you come back through the bottom, at the same distance from the
	left. As far as the pilot is concerned, there are no edges at all. The universe is finite — its whole area is one screen — yet
	it has no boundary anywhere: wherever the ship is, space continues in every direction.
</p>

<Figure num="2.2.1" title="Flight on a glued square" hint="Arrow keys or the buttons to steer · try all three gluings">
	<FlatTorusGame />
	{#snippet caption()}
		The arrows on the edges say which edges are glued, and which way round. In torus mode, opposite edges are glued straight
		across; the faint neighbouring copies show what the pilot would see — the same square repeated forever. In the other two
		modes some gluings flip the ship over, and it comes back as its own mirror image.
	{/snippet}
</Figure>

<p>
	What shape is this universe? Picture the screen as a sheet of rubber. Gluing the top edge to the bottom edge rolls the sheet
	into a tube. Gluing the left edge to the right edge then bends the tube round until its two end circles meet. The result is the
	surface of a doughnut, the <strong>torus</strong>. The ship’s straight flight paths become loops wound around the doughnut.
</p>
<p>
	There is another way to see the same thing, and the neighbouring copies in the figure show it. Instead of gluing, imagine the
	square repeated in every direction, like tiles on a floor, with a copy of the ship in every tile. Looking right, the pilot sees
	the back of their own ship one tile away. This tiled picture is often the easiest way to think about straight lines on a torus,
	and it is how a flat torus appears from the inside.
</p>
<p>
	The other two modes of the game change the gluing instructions slightly — crossing certain edges now flips you over. We will
	come back to them once we have the language to say what is going on.
</p>

<h2 id="quotient-topology">Gluing, made precise: the quotient topology</h2>

<p>
	Let us recall the set-theoretic part of gluing from <Ref to="foundations/equivalence" />. To glue, we choose an
	<Term t="equivalence-relation">equivalence relation</Term> \(\sim\) on a space \(X\): \(x \sim y\) means “\(x\) and \(y\) are to
	become the same point”. The glued set is the <Term t="quotient-set">quotient set</Term> \(X/{\sim}\), whose elements are the
	equivalence classes \([x]\) (read “the class of \(x\)”: the pile of all points glued to \(x\)). And there is the
	<Term t="quotient-projection">projection</Term>
</p>
\[ q \colon X \to X/{\sim}, \qquad q(x) = [x], \]
<p>
	which sends every point to its pile (\(q\) for “quotient”). Gluing the ends of the interval \(X = [0, 1]\) means declaring \(0 \sim 1\) and nothing else. Then the
	class \([0] = [1] = \set{0, 1}\) has two points, every other class has just one, and \(X/{\sim}\) is a set that should be a
	circle.
</p>
<p>
	But a set is not yet a space. Which subsets of \(X/{\sim}\) should be open? There is a natural answer: look back at what the set
	was <em>before</em> the glue was applied.
</p>

<Definition title="Quotient topology" id="def-quotient">
	<p>
		Let \(X\) be a topological space and \(\sim\) an equivalence relation on it. The <dfn>quotient topology</dfn> on \(X/{\sim}\)
		declares a set \(U \subseteq X/{\sim}\) open exactly when its preimage
	</p>
	\[ q^{-1}(U) = \setb{x \in X}{[x] \in U} \]
	<p>is open in \(X\). With this topology, \(X/{\sim}\) is called a <dfn>quotient space</dfn> of \(X\).</p>
</Definition>

<p>
	In words: <em>a set of glued points is open if, before the gluing, the same points formed an open set</em>. The
	<Term t="preimage">preimage</Term> does the looking back, exactly as in the definition of continuity — another reversed arrow.
	Figure 2.2.2 shows the rule at work on the interval; <Cite k="munkres2000" loc="§22" text /> develops the whole theory, with
	every proof.
</p>

<Figure num="2.2.2" title="Looking back before the glue" hint="Play or scrub the gluing · compare the two sets">
	<IntervalCircle />
	{#snippet caption()}
		A little arc around the glued point is open, because before gluing it was \([0, \varepsilon) \cup (1 - \varepsilon, 1]\), two
		pieces each with room inside \([0, 1]\). A one-sided arc that ends at the glued point is not open: before gluing it was
		\([0, \varepsilon) \cup \set{1}\), and the lonely point \(1\) has no room at all. The quotient topology agrees with our eyes.
	{/snippet}
</Figure>

<p>Two facts make the quotient topology the right one.</p>

<Proposition title="The projection is continuous" id="prop-projection">
	<p>
		With the quotient topology, \(q \colon X \to X/{\sim}\) is continuous. In fact the quotient topology is the largest
		collection of open sets that makes \(q\) continuous.
	</p>
</Proposition>

<p>
	Continuity of \(q\) is immediate: preimages of open sets are open by definition. And we could not declare any more sets open
	without some preimage failing to be open. Gluing should be continuous — continuous maps are allowed to glue, as we saw in
	<Ref to="topology/spaces" /> — but beyond that, the glued space should have as many open sets as possible, so that it does
	not get blurrier than it needs to be.
</p>

<Proposition title="Maps out of a glued space" id="prop-descend">
	<p>
		A function \(g \colon X/{\sim} \to Y\) is continuous exactly when \(g \circ q \colon X \to Y\) is continuous.
	</p>
</Proposition>

<Proof>
	<p>
		For an open \(V \subseteq Y\), the preimage \((g \circ q)^{-1}(V)\) equals \(q^{-1}(g^{-1}(V))\). By the definition of the
		quotient topology, \(g^{-1}(V)\) is open in \(X/{\sim}\) exactly when \(q^{-1}(g^{-1}(V))\) is open in \(X\). So
		“\(g^{-1}(V)\) is always open” and “\((g \circ q)^{-1}(V)\) is always open” say the same thing.
	</p>
</Proof>

<p>
	This is the topological version of the “well-defined” principle from <Ref to="foundations/equivalence" />: <strong>a continuous
	function on a glued space is the same thing as a continuous function on the original space that gives glued points the same
	value</strong>. Functions that respect the glue pass through it unharmed.
</p>

<Example title="The interval really becomes a circle">
	<p>
		The wrapping function \(f(t) = (\cos 2\pi t, \sin 2\pi t)\) sends \([0, 1]\) continuously onto the circle \(S^1\), and it
		respects the glue: \(f(0) = f(1) = (1, 0)\). By the proposition it passes to a continuous function \(g \colon [0,1]/{\sim} \to
		S^1\), \(g([t]) = f(t)\), and \(g\) is a bijection. Is it a homeomorphism? In <Ref to="topology/spaces" /> we saw that a
		continuous bijection need not be. Here we are rescued by a theorem that will save us work again and again.
	</p>
</Example>

<Theorem title="Compact to Hausdorff" id="thm-compact-hausdorff">
	<p>
		A continuous bijection from a compact space to a Hausdorff space is a homeomorphism. <Cite k="munkres2000" loc="Thm 26.6" />
	</p>
</Theorem>

<Proof>
	<p>
		Call the bijection \(g\). Its inverse is continuous exactly when \(g\) carries closed sets to closed sets, because the preimage
		of a set \(C\) under \(g^{-1}\) is \(g(C)\). Now chain three standard facts: a closed piece of a compact space is compact; a
		continuous image of a compact set is compact; and a compact set inside a Hausdorff space is closed.
	</p>
</Proof>

<p>
	The quotient \([0,1]/{\sim}\) is compact (a continuous image of the compact interval, via \(q\)) and the circle is Hausdorff
	(it is a metric space), so \(g\) is a homeomorphism: \([0, 1]/(0 \sim 1) \cong S^1\). The same theorem, applied again and again,
	tells us that the surfaces we glue in this chapter really are the surfaces we draw. The failure in Figure 2.1.6 came from the
	half-open interval \([0, 1)\), which is not compact.
</p>

<Warning title="Gluing can make monsters">
	<p>
		Quotients of perfectly nice spaces can be badly behaved. Take two copies of the real line and glue every point \(x \neq 0\) of
		the first to the same point of the second, but leave the two zeros unglued. The result looks like a line everywhere, but it
		has two origins that cannot be separated by disjoint open sets: it is not Hausdorff. All the gluings in this chapter are of the
		well-behaved kind, but “glued” does not automatically mean “nice”. (We will meet this example again in
		<Ref to="topology/manifolds" />.)
	</p>
</Warning>

<h3>Glue spreads</h3>

<p>
	In practice we rarely list the whole equivalence relation. We give a few gluing instructions — “glue this edge to that edge” —
	and let them generate the rest, exactly as in <Ref to="foundations/equivalence" />: the equivalence relation generated by some
	pairs is the smallest one containing them. The important consequence is that glue spreads by <em>transitivity</em>. If \(p\) is
	glued to \(q\) and \(q\) is glued to \(r\), then \(p\) is glued to \(r\), even though no instruction mentioned them together.
	This is why, when we glue the edges of a square in a moment, the corners can end up glued in surprising ways.
</p>

<h2 id="gluing-diagrams">Gluing diagrams: a square with arrows</h2>

<p>
	A <dfn>gluing diagram</dfn> is a polygon whose edges carry letters and arrows. The rule is simple: <em>edges with the same letter
	are glued, matching the arrows</em> — tail to tail, head to head — so that a point a quarter of the way along one arrow is glued
	to the point a quarter of the way along the other. Edges without a letter are left free; they will form the boundary of the
	surface.
</p>
<p>
	Here is the torus. Its bottom and top edges, both called \(a\), point to the right; its left and right edges, both called
	\(b\), point up.
</p>

<Figure num="2.2.3" title="The torus as a square">
	<Svg viewBox="0 0 520 250" maxHeight={250} label="A square with both horizontal edges labelled a pointing right, and both vertical edges labelled b pointing up; all four corners marked as the same point">
		<GluingSquare preset="torus" x={70} y={30} size={170} corners />
		<text x={320} y={72} class="t-ui">BOTTOM TO TOP</text>
		<SvgTeX x={320} y={98} anchor="start" tex={'(x, 0) \\sim (x, 1)'} size={17} w={180} h={28} color="var(--gold-bright)" />
		<text x={320} y={150} class="t-ui">LEFT TO RIGHT</text>
		<SvgTeX x={320} y={176} anchor="start" tex={'(0, y) \\sim (1, y)'} size={17} w={180} h={28} color="var(--teal)" />
	</Svg>
	{#snippet caption()}
		The square is \([0,1] \times [0,1]\), with \((x, y)\) meaning “\(x\) across, \(y\) up”. The arrows say: glue \((x, 0)\) to
		\((x, 1)\) and \((0, y)\) to \((1, y)\). These are exactly the flight rules of torus mode in Figure 2.2.1.
	{/snippet}
</Figure>

<p>
	Two pieces of notation make diagrams easy to talk about. First, the <dfn>edge word</dfn>: start at the bottom-left corner and
	walk once around the square anticlockwise. Write down each letter you pass, as \(x\) if you walk along its arrow and as \(x^{-1}\)
	(“\(x\) inverse”) if you walk against it. For the torus: along the bottom \(a\) (with the arrow), up the right side \(b\) (with
	the arrow), back along the top \(a^{-1}\) (against it), down the left side \(b^{-1}\) (against it). The torus is
	\(aba^{-1}b^{-1}\). The word records the whole diagram in one line.
</p>
<p>
	Second, the <dfn>corners</dfn>. Gluing edges glues their end points, so corners get glued too — and glue spreads. In the torus,
	the bottom-left corner is the tail of the bottom \(a\), so it is glued to the tail of the top \(a\), the top-left corner. Both
	are also ends of the \(b\) edges… follow the arrows and you will find that <em>all four corners become a single point</em>.
	Counting these <dfn>corner classes</dfn> will matter a great deal later, when we compute the Euler characteristic and
	homology.
</p>

<h3>The gluing workshop</h3>

<p>
	Figure 2.2.4 is the heart of this chapter. Pick a gluing; the square on the left shows the diagram, its equivalence relation,
	its word and its corner classes. On the right, a rubber sheet with the same grid and the same coloured edges bends — never
	tearing — into the glued surface. Watch for the moment when edges of the same colour meet: their chevrons line up, because the
	arrows match.
</p>

<Figure num="2.2.4" title="The gluing workshop" hint="Pick a surface · play or scrub the gluing · drag the picture to turn it">
	<GluingWorkshop />
	{#snippet caption()}
		Six surfaces from one square. Gold edges are called \(a\), teal edges \(b\); dashed ivory edges are free and become the
		boundary. Corners of the same colour end up at the same point. The Klein bottle and the projective plane cannot be finished
		without the sheet passing through itself; the crossing is drawn in rose.
	{/snippet}
</Figure>

<h3>One pair of edges: the cylinder and the Möbius band</h3>

<p>
	Glue just the left and right edges, straight across: \((0, y) \sim (1, y)\). The square rolls into a <strong>cylinder</strong>
	(the product \(S^1 \times [0, 1]\) of <Ref to="topology/spaces" />). The top and bottom edges stay free and become two
	boundary circles.
</p>
<p>
	Now glue them with a twist: \((0, y) \sim (1, 1 - y)\), so the arrow on the right points down. To match the arrows, the sheet
	must turn over before its ends meet — try it with a strip of paper, giving one end half a turn before taping. The result is the
	<strong>Möbius band</strong>. Something remarkable has happened to the free edges: the top edge runs into the bottom edge, and the
	two together form a <em>single</em> boundary circle. A Möbius band has one edge — and, if you run a finger along its surface,
	only one side. (One-sidedness has an intrinsic cousin, <em>non-orientability</em>, which a creature living inside the band could
	detect without ever leaving it; it is studied properly in <Ref to="topology/manifolds" />.) The corners make two classes in both
	cases, but paired differently: in the cylinder the two bottom corners are glued to each other, and so are the two top corners;
	in the Möbius band each bottom corner is glued to the top corner diagonally opposite.
</p>

<Remark title="Stretching allowed">
	<p>
		You cannot make a Möbius band from a <em>square</em> of real paper without crumpling it: the strip must be long and narrow.
		How long was an open question for almost fifty years, until Richard Schwartz proved in 2023 that a smooth paper Möbius band
		must be more than \(\sqrt3 \approx 1.73\) times as long as it is wide <Cite k="schwartz2025" />. In the workshop the sheet
		stretches as it rolls. Topology does not mind: in the words of Poincaré quoted at the start of
		<Ref to="prelude/shape-of-a-question" />, “the proportions may be grossly altered”.
	</p>
</Remark>

<h3>Both pairs: the torus and the Klein bottle</h3>

<p>
	Gluing both pairs straight across gives the torus \(aba^{-1}b^{-1}\): roll the square into a tube (gluing the \(b\) edges), then
	bend the tube round (gluing the end circles \(a\)). In the finished doughnut the gold edge \(a\) has become a loop around the
	tube and the teal edge \(b\) a loop around the hole, crossing at the single corner point.
</p>
<p>
	Now reverse just one arrow: let the top edge point left. The rule becomes \((x, 0) \sim (1 - x, 1)\) together with \((0, y) \sim
	(1, y)\), and the word becomes \(abab^{-1}\). This is the <strong>Klein bottle</strong> \(K\). Roll the square into a tube as
	before. Now the two end circles must be glued, but with their directions reversed. Bending the tube round as for the torus would
	match them the wrong way. The only way to make the arrows agree is to bring one end <em>inside</em> the tube and meet the other
	end from within — and in our three-dimensional space, getting inside means passing through the tube’s own wall. Watch the
	workshop: the rose circle is where the surface crosses itself.
</p>
<p>
	Go back to Figure 2.2.1 and switch to Klein bottle mode. Fly through the top edge: you come back through the bottom, but
	mirror-reversed — the rose stripe that was on your left wing is now on your right. The space itself has turned you over. Fly
	through the top edge again and you are restored. All four corners of the Klein bottle square are glued to one point, just as for
	the torus.
</p>

<h3>Neighbouring edges: the sphere</h3>

<p>
	A gluing diagram may also glue edges that meet at a corner. Glue the bottom edge to the left edge, and the top edge to the right
	edge, as in the envelope-shaped word \(abb^{-1}a^{-1}\): \((x, 0) \sim (0, x)\) and \((x, 1) \sim (1, x)\). Fold the square along
	the diagonal from its bottom-left to its top-right corner: the two triangles lie on top of each other, the bottom edge on the
	left edge and the right edge on the top. Zip the matching edges together and inflate, and you get a <strong>sphere</strong>
	\(S^2\), with the zip running from pole to pole. This time the corners form three classes: the two corners on the fold stay
	separate (they become the poles), while the other two are glued together, halfway along the zip.
</p>
<p>
	The same idea works with fewer edges. A polygon with only two edges, \(a\) and then \(a^{-1}\) — picture a coin purse, or a
	lens shape whose two curved edges are zipped together — is also a sphere. Its word is \(aa^{-1}\).
</p>

<h3>Twisting both pairs: the projective plane</h3>

<p>
	Finally, reverse both: \((x, 0) \sim (1 - x, 1)\) and \((0, y) \sim (1, 1 - y)\), with word \(abab\). Notice what these rules
	do: every point of the boundary is glued to the point <em>diametrically opposite</em> it, through the centre of the square. Round
	the square off into a disk and the description becomes beautifully simple: <em>a disk with each point of its rim glued to the
	opposite point of the rim</em>. This is the <strong>real projective plane</strong> \(\RP^2\). Its corners form two classes.
</p>
<p>
	The projective plane has another life, which explains its name. Every line through the centre of a ball pierces the ball’s
	surface in two opposite points. So the set of lines through a point of space is the sphere with opposite points glued — and the
	upper half of the sphere already contains one point of every line, except that opposite points of its rim (the equator) still
	need gluing. That is our disk with opposite rim points glued. The same space turns up in perspective drawing, where parallel
	railway lines meet at a vanishing point on the horizon. Add to the plane one such “point at infinity” for every direction, and
	squash the whole plane into an open disk: the points at infinity become the rim, with opposite rim points glued, because a
	line runs off to infinity in two opposite directions yet has only one vanishing point. The result is \(\RP^2\) once more.
</p>
<p>
	In the workshop, the disk grows into a famous surface called Boy’s surface. It crosses itself along three rose loops, which meet
	at a single <em>triple point</em> where three sheets pass through each other. Fly in projective-plane mode in Figure 2.2.1: every
	edge you cross flips you over.
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Surface</th><th>Rule</th><th>Word</th><th>Corners</th><th>In 3D</th></tr>
		</thead>
		<tbody>
			<tr><td>Cylinder</td><td>\((0,y)\sim(1,y)\)</td><td>—</td><td>2</td><td>yes</td></tr>
			<tr><td>Möbius band</td><td>\((0,y)\sim(1,1-y)\)</td><td>—</td><td>2</td><td>yes</td></tr>
			<tr><td>Torus \(T^2\)</td><td>straight, straight</td><td>\(aba^{-1}b^{-1}\)</td><td>1</td><td>yes</td></tr>
			<tr><td>Klein bottle \(K\)</td><td>flip, straight</td><td>\(abab^{-1}\)</td><td>1</td><td>no</td></tr>
			<tr><td>Sphere \(S^2\)</td><td>neighbours</td><td>\(abb^{-1}a^{-1}\)</td><td>3</td><td>yes</td></tr>
			<tr><td>Projective plane \(\RP^2\)</td><td>flip, flip</td><td>\(abab\)</td><td>2</td><td>no</td></tr>
		</tbody>
	</table>
</div>

<Question>
	<p>
		The torus and the Klein bottle both have one corner class, two edge classes and one face. Count “corners minus edges plus
		faces” for each: \(1 - 2 + 1 = 0\). For the sphere, \(3 - 2 + 1 = 2\); for the projective plane, \(2 - 2 + 1 = 1\). These
		numbers are the <em>Euler characteristics</em> of the surfaces, the first invariant of <Ref to="topology/euler-characteristic" />.
		Notice that they cannot tell the torus from the Klein bottle. What could?
	</p>
</Question>

<h2 id="embedding">Why the Klein bottle will not fit in our space</h2>

<p>
	The torus sits comfortably in ordinary space; the Klein bottle and the projective plane do not. Every picture of them crosses
	itself somewhere. Is that our fault, for not being clever enough, or is it a fact about the surfaces? To answer, we need two
	words for “putting a space into another space”.
</p>

<Definition title="Embedding and immersion" id="def-embedding">
	<p>
		An <dfn>embedding</dfn> of a space \(X\) in a space \(Y\) is a continuous, one-to-one map \(e \colon X \to Y\) that is a
		homeomorphism onto its image \(e(X)\) (with the subspace topology): a faithful copy of \(X\) sitting inside \(Y\). An
		<dfn>immersion</dfn> of a surface in \(\R^3\) is a smooth map that is an embedding <em>near each point</em> — every point has
		a small neighbourhood that is placed faithfully, as a smooth patch with a tangent plane — but different parts of the surface
		may pass through each other. (Precisely: a smooth map whose derivative is one-to-one at every point.) The places where
		different parts meet form the <dfn>double curve</dfn> of the immersion.
	</p>
</Definition>

<p>
	The pictures in the workshop are immersions. Each little patch of the Klein bottle looks just like a patch of a smooth surface,
	but the neck passes through the wall. The crossing is a defect of the picture, not of the surface: an ant living on the Klein
	bottle would never notice it, any more than the pilot in the game notices an edge.
</p>

<Theorem title="No room in three dimensions" id="thm-no-embedding">
	<p>
		The Klein bottle and the projective plane cannot be embedded in \(\R^3\). Both can be embedded in \(\R^4\).
	</p>
</Theorem>

<p>
	We will not prove the first statement here, but here is the idea. A closed surface sitting in \(\R^3\) without crossing itself
	always divides space into an inside and an outside. (This is the Jordan–Brouwer separation theorem, a three-dimensional relative
	of the fact that a loop drawn in the plane without crossing itself has an inside and an outside.) A surface with an inside and an
	outside has two sides: you could paint the inside red and the outside blue. But the Klein bottle and the projective plane
	contain Möbius bands — look at the vertical strip in the middle of the Klein bottle’s square, glued with a flip — so they have
	only one side, and cannot have an inside and an outside. The full proof, when it comes, is startlingly algebraic: the
	\(\Z/2\) in the Klein bottle’s homology, promised above, is exactly what forbids it a place in ordinary space
	<Cite k="hatcher2002" loc="Cor. 3.46" />.
</p>
<p>
	The second statement has a lovely picture. A fourth dimension means a fourth number attached to every point. Show it as a
	colour. In Figure 2.2.5, turn on the colour for one of the Klein bottles: at the rose curve, the two sheets that cross have
	<em>different</em> colours. In four dimensions they are at different “heights” and do not meet at all, just as a bridge does not
	meet the road it crosses, although on a map the two lines intersect.
</p>

<Figure num="2.2.5" title="Surfaces that must cross themselves" hint="Pick a surface · drag to turn it · try the fourth coordinate">
	<Immersions />
	{#snippet caption()}
		Two pictures of the Klein bottle and two of the projective plane, each with its double curve in rose. Boy’s surface is a
		smooth immersion with a single triple point; the cross-cap is simpler to describe but has two pinch points, where it fails to
		be smooth. With colour as a fourth coordinate, the sheets crossing at each rose point get different colours: in four
		dimensions they never touch.
	{/snippet}
</Figure>

<History title="Bottles, bands and Boy">
	<p>
		August Möbius and Johann Listing independently discovered the one-sided band in 1858; Listing published first, in 1861, but
		the band carries Möbius’s name. Felix Klein described his bottle in 1882, in words rather than pictures: take a piece of rubber
		tubing, turn it inside out, and let it pass through itself so that when the ends are bent together the outside meets the inside
		<Cite k="klein1882" loc="§23" />. The English name may come from a pun or a mistranslation of the German <em>Fläche</em>
		(surface) as <em>Flasche</em> (bottle), though the story is hard to pin down. David Hilbert set his doctoral student Werner Boy
		the task of proving that the projective plane cannot be immersed in space without singular points. In 1901 Boy found an
		immersion instead <Cite k="boy1903" />. The formula we use to draw Boy’s surface is much younger: it comes from work of Robert Bryant and Rob
		Kusner in the 1980s <Cite k="kusner1987" />.
	</p>
</History>

<h2 id="more-gluings">Wedges, cones, suspensions and collapsing</h2>

<p>
	Squares are not the only things we can glue. Here are four constructions that appear constantly in topology, all of them
	quotient spaces. First, a way to put two spaces side by side.
</p>

<Definition title="Disjoint union and wedge sum" id="def-wedge">
	<p>
		The <dfn>disjoint union</dfn> \(X \sqcup Y\) of two spaces is the two of them side by side, not touching: a set is open when
		its part in \(X\) and its part in \(Y\) are both open. If \(x_0 \in X\) and \(y_0 \in Y\) are chosen points, the <dfn>wedge
		sum</dfn> \(X \vee Y\) (read “\(X\) wedge \(Y\)”) is the quotient of \(X \sqcup Y\) obtained by gluing \(x_0\) to \(y_0\).
	</p>
</Definition>

<p>
	The wedge of two circles, \(S^1 \vee S^1\), is the figure eight: two loops sharing one point. It is not homeomorphic to a
	circle — removing the shared point leaves two pieces, while removing any point of a circle leaves one (a cut point argument from
	<Ref to="topology/spaces" />). The wedge \(S^2 \vee S^1\) is a balloon with a loop of string attached at one point.
</p>

<Definition title="Collapsing a subspace" id="def-collapse">
	<p>
		If \(A\) is a subset of \(X\), the space \(X/A\) is the quotient in which all the points of \(A\) are glued to one another (and
		nothing else is glued). We say \(A\) has been <dfn>collapsed</dfn> to a point.
	</p>
</Definition>

<p>
	The most important example: take a disk \(D^2\) and collapse its boundary circle, written \(\partial D^2\) (the symbol
	\(\partial\), “boundary”, will become one of the heroes of this book). Picture a cloth bag with a drawstring around its rim:
	pull the string tight, so the whole rim shrinks to a point, and the bag closes up into a ball. So
</p>
\[ D^2/\partial D^2 \cong S^2. \]
<p>
	The same is true in every dimension, with \(D^n\) the solid ball and \(S^n\) the sphere bounding a ball in one dimension higher:
	\(D^n/\partial D^n \cong S^n\). Collapsing the rim of a segment \([0, 1]\) (its two end points) gives a circle, the case \(n = 1\)
	— our very first gluing. Figure 2.2.6 shows the disk and four more collapses.
</p>

<Figure num="2.2.6" title="Collapsing a subspace" hint="Pick an example · play or scrub the collapse · drag to turn">
	<CollapseLab />
	{#snippet caption()}
		In each example the gold set \(A\) shrinks to a single point. Collapsing the rim of a disk gives a sphere. Collapsing the top
		circle of a cylinder gives a cone; collapsing both ends gives a sphere again. Collapsing the equator of a sphere pinches it
		into two spheres touching at a point, \(S^2 \vee S^2\). Collapsing one circle around the tube of a torus gives a “pinched
		torus”, which is a sphere with its north and south poles glued together.
	{/snippet}
</Figure>

<Definition title="Cone and suspension" id="def-cone">
	<p>
		The <dfn>cone</dfn> on a space \(X\) is \(CX = (X \times [0,1]) / (X \times \set{1})\): take the cylinder \(X \times [0, 1]\)
		and collapse its top to a point. The <dfn>suspension</dfn> \(\Sigma X\) (also written \(SX\)) collapses the top to one point
		and the bottom to another.
	</p>
</Definition>

<p>
	The cone on a circle is an ice-cream cone, which is homeomorphic to a disk: \(CS^1 \cong D^2\). The suspension of a circle is a
	double cone, which is homeomorphic to a sphere: \(\Sigma S^1 \cong S^2\). The suspension of two points \(S^0\) — two segments with
	their tops glued and their bottoms glued — is a circle. In general \(\Sigma S^n \cong S^{n+1}\): suspension climbs up the
	dimensions. Every cone, on the other hand, can be squashed down to its tip, a fact we will make precise in
	<Ref to="topology/homotopy" />. As Allen Hatcher remarks, “Suspension becomes increasingly important the farther one goes into
	algebraic topology, though why this should be so is certainly not evident in advance” <Cite k="hatcher2002" loc="p. 9" />.
</p>

<Figure num="2.2.7" title="Three constructions" hint="Pick a construction and a space · play or scrub the gluing">
	<Constructions />
	{#snippet caption()}
		A wedge sum glues two spaces at a single point. A cone collapses the top \(X \times \set{1}\) of the cylinder over \(X\); a
		suspension collapses the bottom as well. The cone on anything is “solid” — a disk, a triangle, a filled shape — while the
		suspension of a sphere is a sphere one dimension up.
	{/snippet}
</Figure>

<h2 id="polygon-words">Every closed surface from a single polygon</h2>

<p>
	A square with four edges gave us the torus, a doughnut with one hole. What about a doughnut with two holes — the surface of a
	pretzel? Take an <em>octagon</em> and label its eight edges, going anticlockwise,
</p>
\[ a_1\, b_1\, a_1^{-1}\, b_1^{-1}\; a_2\, b_2\, a_2^{-1}\, b_2^{-1}. \]
<p>
	The word is two copies of the torus word, one after the other. Figure 2.2.8 shows why the result has two holes. Cut the octagon
	along a diagonal \(c\) that separates the first four edges from the last four. Each half is a pentagon with word
	\(a_1b_1a_1^{-1}b_1^{-1}c^{-1}\) or \(c\,a_2b_2a_2^{-1}b_2^{-1}\): a torus diagram with an extra free edge. Gluing its \(a\) and
	\(b\) edges gives a torus with a hole cut out, the hole’s rim being \(c\). Glue the two holes together along \(c\), undoing the
	cut, and you have a surface with two handles: the genus-two surface \(\Sigma_2\).
</p>

<Figure num="2.2.8" title="From an octagon to a two-holed doughnut" hint="Step through with the arrows, or press play">
	<OctagonGenus2 />
	{#snippet caption()}
		The octagon \(a_1b_1a_1^{-1}b_1^{-1}a_2b_2a_2^{-1}b_2^{-1}\) is cut along the diagonal \(c\), each half is glued into a torus
		with a hole, and the two holes are sewn back together. Each pair of edges becomes a loop on the finished surface: \(a_i\)
		around a tube, \(b_i\) around a hole, as for the torus in Figure 2.2.4. All eight corners of the octagon become a single point
		of the surface, where all four loops meet; the picture slides the loops apart to keep them readable.
	{/snippet}
</Figure>

<p>
	The pattern continues. A polygon with \(4g\) edges labelled \(a_1b_1a_1^{-1}b_1^{-1} \cdots a_gb_ga_g^{-1}b_g^{-1}\) glues
	up into the surface \(\Sigma_g\) with \(g\) handles — a doughnut with \(g\) holes <Cite k="hatcher2002" loc="p. 5" />. The
	number \(g\) is called the <em>genus</em>. Following the arrows shows that all \(4g\) corners become a single point, so counting
	corners minus edges plus faces gives
</p>
\[ 1 - 2g + 1 = 2 - 2g. \]
<p>
	For the sphere (\(g = 0\)) that is \(2\), for the torus \(0\), for the pretzel \(-2\). Words in which a letter appears twice
	the <em>same</em> way round give one-sided surfaces: \(aa\) (a lens whose two curved edges are glued with a twist, another
	picture of \(\RP^2\)), or \(aabb\), which turns out to be another picture of the Klein bottle
	<Cite k="hatcher2002" loc="pp. 51–52" />. A famous theorem, the <em>classification of surfaces</em>, says that every connected
	closed surface is homeomorphic to exactly one of these: a sphere, a surface \(\Sigma_g\) with \(g\) handles, or a one-sided
	surface built from projective planes. We will meet it properly in
	<Ref to="topology/manifolds" />. For now, the remarkable fact is that a single word written around a single polygon is enough to
	describe any of them.
</p>

<KeyIdea>
	<p>
		To glue is to take a quotient: \(U\) is open in \(X/{\sim}\) exactly when \(q^{-1}(U)\) is open in \(X\). A polygon whose edges
		carry letters and arrows is a complete recipe for a surface — and the word around its edges, with its \(a\)’s and
		\(a^{-1}\)’s, is a first glimpse of the algebra that homology will make of it.
	</p>
</KeyIdea>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Count the corners" id="ex-count-corners">
	<p>
		For each word, label the corners of the polygon and find which are glued together: (a) the torus \(aba^{-1}b^{-1}\); (b) the
		projective plane \(abab\); (c) the hexagon \(abca^{-1}b^{-1}c^{-1}\). Then compute corners − edges + faces for each.
	</p>
	{#snippet hint()}
		<p>
			Each edge glues its tail to the tail and its head to the head of its partner. Write down the pairs of corners this
			produces, then let the glue spread.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) One class (all four corners), and \(1 - 2 + 1 = 0\). (b) Two classes: the bottom-left corner is glued to the top-right,
			and the bottom-right to the top-left; \(2 - 2 + 1 = 1\). (c) Number the corners \(0, 1, \dots, 5\) anticlockwise, with edge
			\(a\) running from corner \(0\) to corner \(1\). The second \(a\) runs from corner \(4\) to corner \(3\), so \(0 \sim 4\) and
			\(1 \sim 3\); the \(b\)’s give \(1 \sim 5\) and \(2 \sim 4\); the \(c\)’s give \(2 \sim 0\) and \(3 \sim 5\). The classes are
			\(\set{0, 2, 4}\) and \(\set{1, 3, 5}\): two corners, three edges, one face, \(2 - 3 + 1 = 0\). (The hexagon with opposite
			sides glued is another picture of the torus.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Open or not, after gluing?" id="ex-open-after-gluing">
	<p>
		In the circle \([0, 1]/(0 \sim 1)\), which of these sets are open: (a) the image of \((\tfrac14, \tfrac12)\); (b) the image of
		\([0, \tfrac14)\); (c) the image of \([0, \tfrac14) \cup (\tfrac34, 1]\)?
	</p>
	{#snippet solution()}
		<p>
			Use the definition: look at the preimage, remembering that a set containing the glued point \([0] = [1]\) has both \(0\) and
			\(1\) in its preimage. (a) The preimage is \((\tfrac14, \tfrac12)\), open: yes. (b) The image contains the glued point, so
			its preimage is \([0, \tfrac14) \cup \set{1}\), and \(1\) has no room: not open. (c) The preimage is \([0, \tfrac14) \cup
			(\tfrac34, 1]\), which is open in \([0, 1]\): yes.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Which surface?" id="ex-which-surface">
	<p>
		Identify the space obtained from the square by: (a) gluing only the bottom edge to the top edge, with a flip, \((x, 0) \sim
		(1 - x, 1)\); (b) collapsing the whole boundary of the square to a single point; (c) gluing the bottom edge to the top edge
		straight across, and then collapsing the left edge to a point and the right edge to another point.
	</p>
	{#snippet solution()}
		<p>
			(a) A Möbius band: one pair of edges glued with a twist. (It is the band of the workshop turned on its side.) (b) A sphere:
			the square is homeomorphic to a disk, and collapsing the rim of a disk gives \(D^2/\partial D^2 \cong S^2\). (c) Gluing the
			bottom to the top gives a cylinder whose two boundary circles come from the left and right edges; collapsing each of those
			circles to a point gives the suspension of a circle, a sphere.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Cutting a Möbius band" id="ex-cut-mobius">
	<p>
		Use the square diagram \((0, y) \sim (1, 1 - y)\) to predict what happens when a Möbius band is cut along its centre line \(y =
		\tfrac12\). How many pieces? How many boundary circles?
	</p>
	{#snippet hint()}
		<p>Cutting along \(y = \tfrac12\) splits the square into a bottom half and a top half. Where does the gluing rule send the left edge of the bottom half?</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The bottom half \([0,1] \times [0, \tfrac12]\) has its left edge \((0, y)\), \(y \le \tfrac12\), glued to \((1, 1 - y)\),
			which lies on the right edge of the <em>top</em> half. Likewise the top half’s left edge is glued to the bottom half’s right
			edge. So the two halves join end to end into one long strip, glued at both ends without a net flip: a single piece, a band
			with two boundary circles — topologically a cylinder. (In space it comes out with two full twists, which is why it surprises
			people.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Wedges and suspensions" id="ex-wedges">
	<p>
		(a) Explain why the figure eight \(S^1 \vee S^1\) is not homeomorphic to the circle. (b) Draw the suspension \(\Sigma S^0\) of
		two points and explain why it is a circle. (c) Why is the cone on a circle homeomorphic to a disk?
	</p>
	{#snippet solution()}
		<p>
			(a) Removing the wedge point from the figure eight leaves two pieces; removing any point from a circle leaves one. (b)
			\(S^0 \times [0, 1]\) is two vertical segments. Collapsing their tops to one point and their bottoms to another joins them
			into a closed loop — a diamond shape, which is a circle. (c) Flatten the cone into the plane by pushing the tip down: the
			circle \(S^1 \times \set{t}\) at height \(t\) becomes the circle of radius \(1 - t\), and the tip becomes the centre. Every
			point of the disk is hit exactly once, continuously in both directions.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Unglued corners" id="ex-unglued-corners">
	<p>
		Using the table in this chapter, show that no homeomorphism can turn the sphere’s square into the torus’s square <em>edge by
		edge and corner by corner</em>. Then explain why this alone does not prove that the sphere and torus are different surfaces.
	</p>
	{#snippet solution()}
		<p>
			The sphere’s diagram has three corner classes and the torus’s has one, so no matching of diagrams sends corners to corners.
			But a surface can be drawn by many different diagrams — the torus is also a hexagon with two corner classes (<a href="#ex-count-corners">the first exercise</a>). Corner
			counts belong to the diagram, not the surface. What <em>is</em> a property of the surface is the combination corners − edges +
			faces (\(2\) versus \(0\)), but proving that this does not depend on the diagram is real work, done in
			<Ref to="topology/euler-characteristic" /> and, more powerfully, by homology.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="A Klein bottle is two Möbius bands" id="ex-two-mobius">
	<p>
		In the Klein bottle square, with \((x, 0) \sim (1 - x, 1)\) and \((0, y) \sim (1, y)\), cut along the vertical lines \(x =
		\tfrac14\) and \(x = \tfrac34\). Show that each of the two resulting pieces is a Möbius band, and that the two bands are glued
		along their boundary circles.
	</p>
	{#snippet hint()}
		<p>The middle strip is \([\tfrac14, \tfrac34] \times [0, 1]\). Where does the rule \((x, 0) \sim (1 - x, 1)\) send it? The two outer strips are joined by \((0, y) \sim (1, y)\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The middle strip’s bottom edge \((x, 0)\), \(\tfrac14 \le x \le \tfrac34\), is glued to \((1 - x, 1)\), and \(1 - x\) is also
			between \(\tfrac14\) and \(\tfrac34\): the strip’s top is glued to its own bottom with a flip, which is a Möbius band. The outer
			strips \([0, \tfrac14]\) and \([\tfrac34, 1]\) are joined by \((0, y) \sim (1, y)\) into one strip; its bottom is glued to its top
			by \(x \mapsto 1 - x\), which swaps the two parts — again with a flip, so another Möbius band. The cut lines \(x = \tfrac14\)
			and \(x = \tfrac34\) are glued end to end (the top of one to the bottom of the other) into a single circle, which is the
			boundary of both bands. So \(K\) is two Möbius bands sewn together along their edges — the “weird bottle” of the limerick
			at the top of this chapter.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			To <strong>glue</strong> is to pass to a quotient \(X/{\sim}\). Its topology looks back before the glue: \(U\) is open exactly
			when \(q^{-1}(U)\) is open. Continuous functions on \(X/{\sim}\) are continuous functions on \(X\) that respect the glue.
		</li>
		<li>
			A <strong>gluing diagram</strong> labels edges with letters and arrows; its <strong>word</strong> reads them anticlockwise,
			and glue spreads to the <strong>corners</strong>.
		</li>
		<li>
			One square gives the cylinder, Möbius band, torus \(aba^{-1}b^{-1}\), Klein bottle \(abab^{-1}\), sphere \(abb^{-1}a^{-1}\)
			and projective plane \(abab\) — a disk with opposite rim points glued.
		</li>
		<li>
			The Klein bottle and \(\RP^2\) are one-sided, so they cannot be <strong>embedded</strong> in \(\R^3\); they can only be
			<strong>immersed</strong>, crossing themselves. In \(\R^4\) they fit.
		</li>
		<li>
			<strong>Wedge sums</strong> join spaces at a point; <strong>collapsing</strong> \(A\) gives \(X/A\), with \(D^2/\partial D^2 \cong
			S^2\); <strong>cones</strong> are solid and <strong>suspensions</strong> raise dimension: \(\Sigma S^n \cong S^{n+1}\).
		</li>
		<li>
			A \(4g\)-gon with word \(a_1b_1a_1^{-1}b_1^{-1}\cdots a_gb_ga_g^{-1}b_g^{-1}\) gives the surface with \(g\) holes, and
			corners − edges + faces \(= 2 - 2g\).
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
