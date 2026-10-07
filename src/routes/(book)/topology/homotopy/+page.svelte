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
	import Cite from '$lib/components/prose/Cite.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import PathHomotopy from '$lib/figures/topology/homotopy/PathHomotopy.svelte';
	import LetterMelter from '$lib/figures/topology/homotopy/LetterMelter.svelte';
	import DeformationRetract from '$lib/figures/topology/homotopy/DeformationRetract.svelte';
	import Timetable from '$lib/figures/topology/homotopy/Timetable.svelte';
	import LoopShrink from '$lib/figures/topology/homotopy/LoopShrink.svelte';
	import WindingNumber from '$lib/figures/topology/homotopy/WindingNumber.svelte';
	import LoopWords from '$lib/figures/topology/homotopy/LoopWords.svelte';

	const reading = [
		{
			title: 'Algebraic Topology, Chapter 0: Some Underlying Geometric Notions',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch0.pdf',
			note: 'The source of this chapter’s thick letters, deformation retractions and homotopy equivalence, with many more pictures. Informal and short; read it next.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Algebraic Topology, Chapter 1: The Fundamental Group',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/ATch1.pdf',
			note: 'The full story of π₁: the complete proof that π₁(S¹) ≅ ℤ by lifting to the real line, van Kampen’s theorem (which proves the figure eight’s group is free), and covering spaces. A step up in rigour.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Topology (2nd edition), Chapter 9',
			author: 'James R. Munkres',
			note: 'Sections 51–60 do paths, the fundamental group, covering spaces, π₁(S¹) ≅ ℤ and deformation retracts with complete, careful proofs. The standard undergraduate text.',
			kind: 'book' as const
		},
		{
			title: 'Algebraic Topology: An Introduction',
			author: 'William S. Massey',
			note: 'A classic, patient textbook built around surfaces and the fundamental group. Good if you want every detail of π₁ and covering spaces done carefully.',
			kind: 'book' as const
		},
		{
			title: 'Topology & Geometry (lecture course)',
			author: 'Tadashi Tokieda',
			url: 'https://av.tib.eu/series/549',
			note: 'A course recorded at the African Institute for Mathematical Sciences in 2014 (35 videos): the topology most useful in practice, taught with pictures instead of algebraic machinery. Its motto could be this chapter’s — look at the generic case, spot an invariant, solve the problem by deformation.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Winding numbers and domain coloring',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/winding-numbers',
			note: 'An animated lesson that uses winding numbers to solve two-dimensional equations — the homotopy invariance of the winding number put to work. No prerequisites beyond this chapter.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'How does a topologist classify the letters of the alphabet?',
			author: 'Rafael López',
			url: 'https://arxiv.org/abs/1410.3364',
			note: 'A friendly short paper sorting letters up to homeomorphism — the finer cousin of this chapter’s sorting up to homotopy.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Picture-Hanging Puzzles',
			author: 'E. D. Demaine, M. L. Demaine, Y. N. Minsky, J. S. B. Mitchell, R. L. Rivest, M. Pătraşcu',
			url: 'https://arxiv.org/abs/1203.3602',
			note: 'Hang a picture on nails so that it falls when any one nail is pulled: the solutions are words in free groups, like the commutator of the last exercise.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Algebraic Topology: a beginner’s course',
			author: 'N. J. Wildberger',
			url: 'https://www.youtube.com/playlist?list=PL41FDABC6AA085E78',
			note: 'A long, gentle video course that draws everything, including loops, homotopies and surfaces.',
			kind: 'video' as const,
			free: true
		}
	];
</script>

<Epigraph author="Allen Hatcher" source="Algebraic Topology (2002), Chapter 0"
	>One of the main ideas of algebraic topology is to consider two spaces to be equivalent if they have ‘the same shape’ in a sense that
	is much broader than homeomorphism.</Epigraph
>

<p class="lead">
	A rubber band is wrapped once around a flagpole. You may slide it up and down, twist it, stretch it into strange shapes — but as long
	as you are not allowed to lift it over the top, you will never get it off. The pole is a hole in the space the band lives in, and the
	band can <em>feel</em> it. This chapter turns that feeling into mathematics. We will learn to deform not spaces but <em>maps</em>,
	continuously, like frames of a film; to call two spaces the same when one can be squashed onto the other; and to build our first
	algebraic invariant of a space, a group made of loops.
</p>

<p>
	In <Ref to="topology/spaces" /> we called two spaces the same when there is a <Term t="homeomorphism">homeomorphism</Term> between
	them: a continuous bijection with a continuous inverse, a perfect rubber-sheet correspondence. That notion is exact, but for counting
	holes it is too fussy. A thick ring and a thin circle are not homeomorphic (one is two-dimensional, the other one-dimensional), yet
	anyone can see that they have “the same hole”. A solid disk and a single point are not homeomorphic either, yet neither has any hole at all.
	Homotopy is the coarser, more forgiving notion of sameness that sees holes and nothing else.
</p>

<Ahead>
	<p>
		Homology, the hero of this book, cannot tell apart spaces that are homotopy equivalent. That sounds like a weakness; it is the
		opposite. It means that to compute the homology of a complicated space we may first squash it onto a much simpler one — a punctured
		torus onto a figure eight, a thick letter onto a thin one — and compute there. This <em>homotopy invariance</em> is proved in
		<Ref to="homology/invariance" />. The fundamental group built in this chapter is also the ancestor of the first homology group: there
		we will see that \(H_1\) is exactly the fundamental group “made commutative” (the Hurewicz theorem). And the winding number reappears
		in <Ref to="cohomology/de-rham" /> as an integral.
	</p>
</Ahead>

<h2 id="paths">Paths: journeys inside a space</h2>

<p>
	Everything in this chapter is built out of one simple object, which you met in <Ref to="topology/spaces" />: the path. We write
	\(I = [0,1]\) for the unit interval, the set of real numbers between \(0\) and \(1\) inclusive. Think of \(I\) as a clock: \(0\) is the
	moment we set off and \(1\) the moment we arrive.
</p>

<Definition title="Path" id="def-path">
	<p>
		A <dfn>path</dfn> in a space \(X\) is a <Term t="continuous-map">continuous map</Term> \(\gamma\colon I \to X\). Its
		<dfn>starting point</dfn> is \(\gamma(0)\) and its <dfn>endpoint</dfn> is \(\gamma(1)\); we say \(\gamma\) is a path
		<em>from</em> \(\gamma(0)\) <em>to</em> \(\gamma(1)\).
	</p>
</Definition>

<p>
	Read \(\gamma\) (“gamma”) as a traveller’s itinerary: at each moment \(s \in I\) it tells you <em>where</em> the traveller is,
	\(\gamma(s) \in X\). Continuity says the traveller never teleports. Two features of this definition will matter again and again.
</p>

<ul>
	<li>
		<strong>A path is the whole journey, timing included</strong>, not just the trail it leaves. Walking along a road at a steady pace and
		walking along the same road while stopping for lunch halfway are different paths with the same trail (the same image \(\gamma(I)\)).
		Re-timing a path without changing its trail is called <dfn>reparametrising</dfn> it.
	</li>
	<li>
		<strong>A path may cross itself, double back, or stand still.</strong> The constant path \(c_x(s) = x\) for all \(s\), which never
		leaves the point \(x\), is a perfectly good path. So is a path that runs around a circle five times.
	</li>
</ul>

<p>
	A space is <Term t="path-connected">path-connected</Term> when any two of its points can be joined by a path. The plane is
	path-connected; so is the plane with a point removed (walk around the missing point); two disjoint disks are not.
</p>

<Example title="Paths in the plane">
	<p>
		The straight segment from \(p\) to \(q\) in \(\R^2\) is the path \(\gamma(s) = (1-s)\,p + s\,q\). At \(s = 0\) it is at \(p\), at
		\(s = 1\) at \(q\), and at \(s = \tfrac12\) at the midpoint. The formula \((1-s)p + sq\) — “a weighted average of \(p\) and \(q\),
		with the weight sliding from \(p\) to \(q\)” — will be our main tool for building films in a moment.
	</p>
</Example>

<h2 id="homotopy">Homotopy: a movie of maps</h2>

<p>
	Here is the question that drives the chapter. In the plane with a hole punched in it, take two paths from a point \(x_0\) to a point
	\(x_1\). <em>Can one path be continuously slid onto the other, keeping its ends pinned down, without ever passing through the
	hole?</em> Try it below: the gold path \(\gamma_0\) stays put; drag the teal bead to reshape \(\gamma_1\), then drag the white bead
	along its track to run the movie that slides one onto the other.
</p>

<Figure num="2.3.1" title="Paths around a hole" hint="Drag the teal bead to reshape γ₁ · drag the white bead to run the movie">
	<PathHomotopy />
	{#snippet caption()}
		The straight-line movie \(H(s,t) = (1-t)\,\gamma_0(s) + t\,\gamma_1(s)\): every point of \(\gamma_0\) slides along a straight
		track (the faint lines) to the matching point of \(\gamma_1\), and the dashed curves are frames of the movie. When both paths pass on
		the same side of the puncture, the movie never touches it. When they pass on opposite sides, the frames are forced across the puncture
		(the pink dashed frame), and no other movie can do better: the two paths are not homotopic.
	{/snippet}
</Figure>

<p>
	Let us describe the sliding precisely. At each <em>moment of the film</em> \(t \in I\) we have a whole path, which we may call
	\(H_t\); at \(t = 0\) it is \(\gamma_0\), at \(t = 1\) it is \(\gamma_1\), and in between it changes gradually. A path is a function of
	one time variable \(s\) (where the traveller is during the trip), and now the trip itself evolves in a second time variable \(t\) (which
	frame of the film we are watching). Packaging the two together gives a single function of two variables, \(H(s,t) = H_t(s)\). The
	continuity of this function in both variables at once is what makes the film smooth: no frame jumps, and no frame tears.
</p>

<p>Nothing here is special to paths. Any continuous map can be the subject of such a film.</p>

<Definition title="Homotopy" id="def-homotopy">
	<p>
		Let \(f, g\colon X \to Y\) be continuous maps. A <dfn>homotopy</dfn> from \(f\) to \(g\) is a continuous map
		\(H\colon X \times I \to Y\) such that, for every \(x \in X\),
		\[ H(x, 0) = f(x) \qquad\text{and}\qquad H(x,1) = g(x). \]
		If such an \(H\) exists we say \(f\) and \(g\) are <dfn>homotopic</dfn> and write \(f \simeq g\). For each \(t\), the map
		\(H_t\colon X \to Y\), \(H_t(x) = H(x,t)\), is the <dfn>frame</dfn> of the homotopy at time \(t\).
	</p>
</Definition>

<p>
	Let us read every symbol. \(X \times I\) is the <Term t="product-topology">product</Term> of the space \(X\) with the time interval:
	its points are pairs \((x, t)\) — “the point \(x\), at time \(t\)”. The homotopy \(H\) takes such a pair and says where \(x\) has been
	sent at that moment. The two equations pin down the first and last frames: at time \(0\) the film shows \(f\), at time \(1\) it shows
	\(g\). The symbol \(\simeq\) is read “is homotopic to”.
</p>

<Warning title="It is the map that moves, not the space">
	<p>
		A homotopy deforms a <em>map</em> \(f\colon X \to Y\) inside the fixed space \(Y\). The space \(Y\) does not change at all during the
		film — in the figure above, the hole is always there, and every frame has to be a path in the punctured plane. That is precisely why a
		hole can obstruct a homotopy: every frame must avoid it.
	</p>
</Warning>

<p>
	For paths we usually want more: the ends should stay pinned down for the whole film, otherwise every path could be reeled in to a
	single point by sliding its endpoints together.
</p>

<Definition title="Homotopy of paths (relative to the endpoints)" id="def-path-homotopy">
	<p>
		Two paths \(\gamma_0, \gamma_1\colon I \to X\) with the same starting point \(x_0\) and the same endpoint \(x_1\) are
		<dfn>path-homotopic</dfn> if there is a homotopy \(H\colon I \times I \to X\) from \(\gamma_0\) to \(\gamma_1\) that keeps both
		ends still: for every \(t \in I\),
		\[ H(0, t) = x_0 \qquad\text{and}\qquad H(1,t) = x_1. \]
		We write \(\gamma_0 \simeq \gamma_1\) and say the homotopy is <dfn>relative to the endpoints</dfn>.
	</p>
</Definition>

<Example title="The straight-line homotopy">
	<p>
		If \(Y \subseteq \R^n\) contains the segment between any two of its points (we say \(Y\) is <dfn>convex</dfn>; a disk or all of
		\(\R^n\) are examples), then any two maps \(f, g\colon X \to Y\) are homotopic via
		\[ H(x,t) = (1-t)\,f(x) + t\,g(x). \]
		Each point \(f(x)\) slides along the straight segment to \(g(x)\), at constant speed, arriving at time \(1\). The frames stay in \(Y\)
		because \(Y\) contains those segments, and \(H\) is continuous because it is built from \(f\), \(g\) and \(t\) by additions and
		multiplications. In the figure above this is exactly the movie being played — and it fails precisely when the punctured plane stops
		being convex in the relevant spot, when some segment from \(\gamma_0(s)\) to \(\gamma_1(s)\) runs through the hole.
	</p>
</Example>

<h3>Homotopy is an equivalence relation</h3>

<p>
	“Is homotopic to” behaves like a sameness relation, in the precise sense of <Ref to="foundations/equivalence" />: it is an
	<Term t="equivalence-relation">equivalence relation</Term>. Each of the three properties is an operation on films.
</p>

<ul>
	<li><strong>Reflexive</strong> (\(f \simeq f\)): the <em>still film</em> \(H(x,t) = f(x)\), which shows \(f\) in every frame.</li>
	<li>
		<strong>Symmetric</strong> (if \(f \simeq g\) then \(g \simeq f\)): play the film <em>backwards</em>, \(\bar H(x,t) = H(x, 1-t)\).
	</li>
	<li>
		<strong>Transitive</strong> (if \(f \simeq g\) and \(g \simeq h\) then \(f \simeq h\)): show the first film and then the second, each
		at double speed. If \(H\) runs from \(f\) to \(g\) and \(K\) from \(g\) to \(h\), the joined film is \(H(x, 2t)\) for
		\(t \le \tfrac12\) and \(K(x, 2t-1)\) for \(t \ge \tfrac12\). At \(t = \tfrac12\) both formulas give \(g(x)\), so the two halves meet
		without a jump.
	</li>
</ul>

<p>
	The equivalence classes are called <dfn>homotopy classes</dfn>; the class of \(f\) is written \([f]\). The same three films, with ends
	held still, show that path homotopy is an equivalence relation too.
</p>

<h2 id="homotopy-equivalence">The same shape in a broader sense</h2>

<p>
	Now we use films to compare <em>spaces</em>. The example with which Hatcher opens his book, right after this chapter’s epigraph, is the
	alphabet <Cite k="hatcher2002" loc="pp. 1–2" />. Write each capital letter in two ways: as a thin skeleton of curves, and as a fat, inflated version of itself. The thin letter
	sits inside the fat one, and the fat one can be squashed onto it by sliding each point straight in towards the skeleton.
</p>

<Figure num="2.3.2" title="Thick letters, thin letters" hint="Tap a letter to shrink it · sort them">
	<LetterMelter />
	{#snippet caption()}
		Each thick letter shrinks onto its gold skeleton without tearing. Sorted by homotopy type, the letters fall into just three families:
		those that can be shrunk to a point, those with one loop (like a circle \(S^1\)), and \(\mathsf B\), with two loops (like the figure
		eight \(S^1 \vee S^1\)). Homeomorphism would tell many of these apart; homotopy only sees the loops.
	{/snippet}
</Figure>

<p>
	What exactly is the relationship between a fat letter \(X\) and its thin skeleton \(A\)? There are two natural maps between them. One is
	the <dfn>inclusion</dfn> \(i\colon A \to X\), which regards each point of the thin letter as a point of the fat one. The other is the
	<dfn>squash</dfn> \(r\colon X \to A\), which sends every point of the fat letter to where it ends up after the shrinking. Neither is a
	homeomorphism. But each undoes the other <em>up to homotopy</em>:
</p>

<ul>
	<li>squashing a point of the thin letter does nothing (it is already on the skeleton), so \(r \circ i = \id_A\) exactly;</li>
	<li>
		including after squashing, \(i \circ r\colon X \to X\), is not the identity of the fat letter — it crushes everything onto the
		skeleton — but the shrinking film itself is a homotopy from \(\id_X\) to \(i \circ r\).
	</li>
</ul>

<p>That is the pattern we make into a definition.</p>

<Definition title="Homotopy equivalence" id="def-homotopy-equivalence">
	<p>
		A continuous map \(f\colon X \to Y\) is a <dfn>homotopy equivalence</dfn> if there is a continuous map \(g\colon Y \to X\) going back
		such that
		\[ g \circ f \simeq \id_X \qquad\text{and}\qquad f \circ g \simeq \id_Y. \]
		Then \(X\) and \(Y\) are <dfn>homotopy equivalent</dfn>, or have the same <dfn>homotopy type</dfn>; we write \(X \simeq Y\).
	</p>
</Definition>

<p>
	Compare this with a homeomorphism, where we demand \(g \circ f = \id_X\) and \(f \circ g = \id_Y\) on the nose. A homotopy equivalence
	only asks the round trips to be <em>deformable</em> to the identity. Every homeomorphism is a homotopy equivalence (take the still
	films), but the converse fails wildly, as the letters show. With the same three film operations as before one checks that \(\simeq\) is
	an equivalence relation on spaces (one of the exercises does the transitive step).
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Space</th><th>is homotopy equivalent to</th><th>but not homeomorphic to it, because</th></tr>
		</thead>
		<tbody>
			<tr><td>a solid disk \(D^2\), or all of \(\R^n\)</td><td>a point</td><td>a point is a single point: there is not even a bijection</td></tr>
			<tr><td>a thick ring (annulus)</td><td>the circle \(S^1\)</td><td>removing two points disconnects \(S^1\) but not the ring</td></tr>
			<tr><td>the plane minus a point \(\R^2\setminus\set{0}\)</td><td>the circle \(S^1\)</td><td>\(S^1\) is compact, the punctured plane is not</td></tr>
			<tr><td>the Möbius band</td><td>the circle \(S^1\)</td><td>removing two points disconnects \(S^1\) but not the band</td></tr>
			<tr><td>the torus with one point removed</td><td>the figure eight \(S^1 \vee S^1\)</td><td>removing its crossing point disconnects the figure eight; no single point disconnects the punctured torus</td></tr>
			<tr><td>the letter \(\mathsf A\)</td><td>the letter \(\mathsf O\)</td><td>\(\mathsf A\) has points where three strokes meet</td></tr>
		</tbody>
	</table>
</div>

<Intuition title="What survives a homotopy equivalence">
	<p>
		Thickness, dimension, length and the number of “branches” at a point are all forgotten. What survives is the pattern of holes: how
		many independent loops cannot be shrunk, how many hollow chambers cannot be filled, and how the space falls into pieces. That is
		exactly the information homology will measure.
	</p>
</Intuition>

<h2 id="deformation-retractions">Deformation retractions</h2>

<p>
	All the examples in the table above are of one convenient kind: the bigger space can be squashed onto a subspace while the subspace
	itself stays perfectly still.
</p>

<Definition title="Deformation retraction" id="def-deformation-retraction">
	<p>
		Let \(A\) be a subspace of \(X\). A <dfn>deformation retraction</dfn> of \(X\) onto \(A\) is a homotopy \(H\colon X \times I \to X\)
		such that, writing \(f_t(x) = H(x,t)\),
	</p>
	<ol>
		<li>\(f_0 = \id_X\) (the film starts with everything where it is);</li>
		<li>\(f_1(X) \subseteq A\) (at the end, everything has arrived in \(A\));</li>
		<li>\(f_t(a) = a\) for every \(a \in A\) and every \(t\) (the points of \(A\) never move).</li>
	</ol>
	<p>We then say \(X\) <dfn>deformation retracts</dfn> onto \(A\). <Cite k="hatcher2002" loc="p. 2" /></p>
</Definition>

<p>
	Explore four of them below. Pick a space, then play or scrub through time: you are watching the frames \(f_t\) of the film, and the faint grid
	lines are painted on the space so that you can see every point travel. The inset shows the same film drawn flat.
</p>

<Figure num="2.3.3" title="Deformation retractions" hint="Choose a space · play or scrub time · drag to rotate">
	<DeformationRetract />
	{#snippet caption()}
		A disk shrinks to its centre; an annulus is squeezed onto its middle circle; a Möbius band is squeezed onto its gold core circle (watch
		its single teal edge, which runs round <em>twice</em>, collapse onto the core); and a torus with one puncture is pushed outward from
		the puncture until only the gold circle \(a\) and the teal circle \(b\) remain. In the last one, the pink rim of the puncture ends up
		running along \(a\), then \(b\), then \(a\) backwards, then \(b\) backwards: the loop \(aba^{-1}b^{-1}\), which will be important
		later.
	{/snippet}
</Figure>

<Example title="The punctured plane retracts onto a circle">
	<p>
		Let \(X = \R^2 \setminus \set{0}\), the plane with the origin removed, and \(A = S^1\), the unit circle. Define
		\[ H(x,t) = (1-t)\,x + t\,\frac{x}{\abs{x}}, \]
		where \(\abs{x}\) is the distance from \(x\) to the origin, so \(x/\abs{x}\) is the point of the circle in the direction of \(x\). At
		\(t = 0\) this is \(x\); at \(t = 1\) it is \(x/\abs{x} \in S^1\); and if \(x\) is already on the circle then \(\abs{x} = 1\) and
		\(H(x,t) = x\) for all \(t\). Each point slides along its ray straight to the circle. The film never hits the forbidden origin, because
		\(H(x,t)\) is the positive number \((1-t) + t/\abs{x}\) times \(x\), and \(x \neq 0\). The annulus in the figure is the same film,
		aimed at the middle circle instead.
	</p>
</Example>

<Example title="The other three">
	<ul>
		<li>
			<strong>\(\R^n\) onto a point.</strong> \(H(x,t) = (1-t)\,x\) slides everything to the origin, which stays put. The disk in the
			figure is the same film.
		</li>
		<li>
			<strong>The Möbius band onto its core circle.</strong> Each segment across the band (a <em>fibre</em>) is squeezed to its midpoint.
			Because the squeezing treats both ends of a segment alike, it does not care that the band is glued with a twist.
		</li>
		<li>
			<strong>The punctured torus onto a figure eight.</strong> Draw the torus as a square with opposite sides glued, as in
			<Ref to="topology/gluing" />, and put the puncture in the middle. Push every point straight away from the puncture until it hits the
			edge of the square. The edges of the square, after gluing, form two circles meeting at a point — the corner — which is the
			<Term t="wedge-sum">wedge</Term> \(S^1 \vee S^1\), the figure eight.
		</li>
	</ul>
</Example>

<Proposition title="A deformation retraction gives a homotopy equivalence" id="prop-dr-he">
	<p>If \(X\) deformation retracts onto \(A\), then the inclusion \(i\colon A \to X\) is a homotopy equivalence, so \(A \simeq X\).</p>
</Proposition>

<Proof>
	<p>
		Let \(r = f_1\), viewed as a map \(X \to A\) (allowed, since \(f_1(X) \subseteq A\)). For \(a \in A\), \(r(i(a)) = f_1(a) = a\)
		because points of \(A\) never move; so \(r \circ i = \id_A\). And \(i \circ r = f_1\) is joined to \(f_0 = \id_X\) by the film
		itself, so \(i \circ r \simeq \id_X\).
	</p>
</Proof>

<Warning title="Retracting is a one-way street; equivalence is not">
	<p>
		A disk deformation retracts onto a point, but a point certainly does not deformation retract onto a disk (it does not even contain
		one). Deformation retraction is a lopsided relationship between a space and a subspace. Homotopy equivalence is the symmetric notion
		it produces, and it can hold between two spaces neither of which fits inside the other. The letter \(\theta\) — a circle with a bar
		across it — is homotopy equivalent to the figure eight (squash the bar to a point). Yet neither fits inside the other: the figure
		eight needs a point where four strands meet, which \(\theta\) lacks, and \(\theta\) needs two points where three strands meet,
		which the figure eight lacks.
	</p>
</Warning>

<h2 id="contractible">Contractible spaces, and why homotopy is the right lens</h2>

<Definition title="Contractible" id="def-contractible">
	<p>
		A space \(X\) is <dfn>contractible</dfn> if it is homotopy equivalent to a one-point space. Equivalently, the identity map of \(X\) is
		homotopic to a constant map: there is a film that starts with every point where it is and ends with every point at one place.
	</p>
</Definition>

<p>
	\(\R^n\), every disk and ball, every convex set, every tree (a graph without cycles) and the letters \(\mathsf C, \mathsf E, \mathsf T,
	\mathsf X\) are contractible. A contractible space is always path-connected: if \(H\) contracts \(X\) to the point \(x_0\), then for
	each \(x\) the map \(t \mapsto H(x,t)\) is a path from \(x\) to \(x_0\). So any two points can be joined through \(x_0\).
</p>

<Question>
	<p>
		Is the circle \(S^1\) contractible? It certainly <em>looks</em> as if it is not: shrinking the whole circle to a point would seem to
		require tearing it, or pulling it off itself. But “it looks impossible” is not a proof — perhaps some ingenious film manages it. Keep
		this question in mind: by the end of the chapter we will have a tool that settles it.
	</p>
</Question>

<p>
	This is the moment to say why homotopy is the right lens for this book. We are looking for <dfn>invariants</dfn>: numbers, or groups,
	attached to spaces in such a way that equal spaces get equal labels. The finer the notion of “equal”, the more labels are allowed and
	the harder they are to compute. Homotopy is the coarse, generous notion — and invariants that do not change under homotopy equivalence
	have a superpower.
</p>

<KeyIdea>
	<p>
		An invariant that is the same for homotopy-equivalent spaces may be computed on the <em>simplest</em> space of the homotopy type.
		Want to know something about a fat, punctured, embedded-in-space torus? Squash it to a figure eight and ask there. Want to know about
		the plane with a hole? Ask the circle.
	</p>
</KeyIdea>

<History>
	<p>
		The idea of studying a space through the loops in it, and of declaring two loops the same when one can be deformed into the other,
		goes back to Henri Poincaré’s founding paper <em>Analysis Situs</em> of 1895, where the fundamental group of the next sections first
		appears <Cite k="poincare1895" />. Poincaré used it to tell apart three-dimensional spaces that his numerical invariants (the Betti
		numbers, ancestors of homology) could not distinguish.
	</p>
</History>

<h2 id="loops">Loops, and how to compose them</h2>

<p>
	Fix a point \(x_0\) of a space \(X\), and call it the <dfn>basepoint</dfn>: a home from which all our journeys start and to which they
	return.
</p>

<Definition title="Loop" id="def-loop">
	<p>A <dfn>loop</dfn> based at \(x_0\) is a path \(\alpha\colon I \to X\) with \(\alpha(0) = \alpha(1) = x_0\).</p>
</Definition>

<p>
	Two loops at the same basepoint can be done one after the other: first take trip \(\alpha,\) then trip \(\beta.\) But our trips must
	fit into the single time interval \(I\), so each is run at double speed.
</p>

<Definition title="Concatenation and inverse" id="def-concatenation">
	<p>
		The <dfn>concatenation</dfn> of loops \(\alpha\) and \(\beta\) at \(x_0\) is the loop
		\[ (\alpha\cdot\beta)(s) = \begin{cases} \alpha(2s) & 0 \le s \le \tfrac12, \\ \beta(2s-1) & \tfrac12 \le s \le 1. \end{cases} \]
		The <dfn>inverse</dfn> (or reverse) of \(\alpha\) is the loop \(\bar\alpha(s) = \alpha(1-s)\), the same trip taken backwards. The
		<dfn>constant loop</dfn> \(c(s) = x_0\) stays at home.
	</p>
</Definition>

<p>
	At \(s = \tfrac12\) the first formula gives \(\alpha(1) = x_0\) and the second gives \(\beta(0) = x_0\), so the two halves join up.
	(The same formulas concatenate any two <em>paths</em>, provided the first ends where the second starts.) The order matters: in
	\(\alpha \cdot \beta\) we do \(\alpha\) <em>first</em>.
</p>

<p>
	Is concatenation associative? Not quite, if we are strict. In \((\alpha\cdot\beta)\cdot\gamma\) the trip \(\alpha\) is done at
	quadruple speed during the first quarter of the time, \(\beta\) during the second quarter and \(\gamma\) at double speed during the
	second half; in \(\alpha\cdot(\beta\cdot\gamma)\) it is \(\alpha\) that gets the first half. Same trails, same order, different
	timetables. The difference is only one of timing, and timing can be changed continuously.
</p>

<Figure num="2.3.4" title="Timetables" hint="Drag the point in the square · run the trip">
	<Timetable />
	{#snippet caption()}
		Left: the square of a homotopy \(H\), with trip time \(s\) running across and movie time \(t\) running up. Right: the space, three
		loops at \(x_0\). Each point \((s,t)\) of the square is a position \(H(s,t)\) in the space: the white bead. Sliding the two
		breakpoints from \(\tfrac14, \tfrac12\) to \(\tfrac12, \tfrac34\) turns \((\alpha\cdot\beta)\cdot\gamma\) into
		\(\alpha\cdot(\beta\cdot\gamma)\). Choose “Inverses” to see \(\alpha\cdot\bar\alpha\) shrink to the constant loop by turning back
		earlier and earlier.
	{/snippet}
</Figure>

<p>Three facts make loops, up to homotopy, behave like the elements of a group:</p>

<ol>
	<li>
		<strong>Associativity up to homotopy:</strong> \((\alpha\cdot\beta)\cdot\gamma \simeq \alpha\cdot(\beta\cdot\gamma)\), by sliding the
		breakpoints, as in the figure.
	</li>
	<li>
		<strong>The constant loop does nothing, up to homotopy:</strong> \(c\cdot\alpha \simeq \alpha \simeq \alpha\cdot c\). The loop
		\(c\cdot\alpha\) waits at home for half the time and then rushes round \(\alpha\); shrinking the waiting time to zero is a homotopy.
	</li>
	<li>
		<strong>A loop and its reverse cancel, up to homotopy:</strong> \(\alpha\cdot\bar\alpha \simeq c\). Go out along \(\alpha\) and come
		straight back; at stage \(t\) of the film, turn back after only the fraction \(1-t\) of the way. At \(t = 1\) you never leave home.
	</li>
</ol>

<Remark title="Loops may run through themselves">
	<p>
		In the film for \(\alpha\cdot\bar\alpha\), the outward and return journeys run along the same trail in opposite directions. If you
		imagine loops as bits of string, give the string the magic power of passing through itself; what is forbidden is passing through the
		<em>holes of the space</em>, not through the loop.
	</p>
</Remark>

<h2 id="fundamental-group">The fundamental group</h2>

<p>
	We are ready for the chapter’s main construction. Up to homotopy, loops compose associatively, have an identity and have inverses — so
	homotopy <em>classes</em> of loops form a <Term t="group">group</Term>, in the sense of <Ref to="foundations/groups" />.
</p>

<Definition title="Fundamental group" id="def-fundamental-group">
	<p>
		Let \(x_0\) be a point of a space \(X\). The <dfn>fundamental group</dfn> \(\pi_1(X, x_0)\) is the set of path-homotopy classes
		\([\alpha]\) of loops based at \(x_0\), with the operation
		\[ [\alpha]\,[\beta] = [\alpha\cdot\beta]. \]
		Its identity element is the class \([c]\) of the constant loop, and the inverse of \([\alpha]\) is \([\bar\alpha]\).
	</p>
</Definition>

<p>
	Read \(\pi_1\) as “pi one”; the “1” is there because there are higher versions \(\pi_2, \pi_3, \dots\) built from spheres instead of
	loops, which we will only mention. Remember that a homotopy of loops keeps the basepoint fixed for the whole film: the loop may wriggle
	as it likes, but it is always anchored at home.
</p>

<p>
	One point needs checking before this is a definition at all. The product is defined by choosing loops from the two classes; what if we
	had chosen others? This is the “is it well-defined?” question from <Ref to="prelude/reading-math" />. Suppose \(\alpha \simeq \alpha'\)
	by a film \(F\) and \(\beta \simeq \beta'\) by a film \(G\). Then running \(F\) and \(G\) side by side — \(F\) in the first half of each
	frame, \(G\) in the second — is a film from \(\alpha\cdot\beta\) to \(\alpha'\cdot\beta'\). So the class of the product depends only on
	the classes we started with, and the three facts of the previous section become the group axioms.
</p>

<Remark title="Does the basepoint matter?">
	<p>
		If \(X\) is path-connected, no: a path \(h\) from \(x_0\) to \(x_1\) turns each loop \(\alpha\) at \(x_1\) into the loop
		\(h\cdot\alpha\cdot\bar h\) at \(x_0\) (walk over, do \(\alpha\), walk back), and this gives an
		<Term t="isomorphism">isomorphism</Term> \(\pi_1(X, x_1) \cong \pi_1(X, x_0)\). So for path-connected spaces one often writes simply
		\(\pi_1(X)\), meaning the group “up to isomorphism”.
	</p>
</Remark>

<p>
	The fundamental group is an invariant in exactly the sense we wanted. A continuous map \(f\colon X \to Y\) carries loops at \(x_0\) to
	loops at \(f(x_0)\) and homotopies to homotopies, so it gives a <Term t="homomorphism">homomorphism</Term>
	\(f_*\colon \pi_1(X, x_0) \to \pi_1(Y, f(x_0))\), \([\alpha] \mapsto [f \circ \alpha]\). With a little more work one shows:
</p>

<Theorem title="Homotopy invariance of the fundamental group">
	<p>
		If \(f\colon X \to Y\) is a homotopy equivalence, then \(f_*\colon \pi_1(X, x_0) \to \pi_1(Y, f(x_0))\) is an isomorphism. In
		particular, homeomorphic spaces, and more generally homotopy-equivalent spaces, have isomorphic fundamental groups.
		<Cite k="hatcher2002" loc="Prop. 1.18" />
	</p>
</Theorem>

<Definition title="Simply connected" id="def-simply-connected">
	<p>
		A space is <dfn>simply connected</dfn> if it is path-connected and its fundamental group is trivial: every loop can be shrunk to the
		constant loop.
	</p>
</Definition>

<p>
	Every convex set is simply connected: the straight-line film \(H(s,t) = (1-t)\,\alpha(s) + t\,x_0\) shrinks any loop \(\alpha\) to
	\(x_0\), and the basepoint never moves because \(\alpha(0) = \alpha(1) = x_0\). By homotopy invariance, so is every contractible space.
	Now compare a sphere with a torus.
</p>

<Figure num="2.3.5" title="Loops on a sphere and on a torus" hint="Pull the loops tight · drag to rotate">
	<LoopShrink />
	{#snippet caption()}
		Pull the loops tight. On the sphere \(S^2\) the gold loop slides over the top and shrinks to a point. On the torus \(T^2\) the gold loop
		round the tube and the teal loop round the hole straighten into clean circles — the teal one slides to the inner equator, where it is
		shortest — and then they are stuck: shrinking further would mean leaving the surface.
	{/snippet}
</Figure>

<Proposition title="The sphere is simply connected">
	<p>\(\pi_1(S^2) = 0\): every loop on the sphere can be shrunk to a point.</p>
</Proposition>

<Proof>
	<p>
		Take a loop on \(S^2\), and suppose first that it misses some point \(p\) of the sphere. Removing a point from a sphere leaves something
		homeomorphic to the plane (stereographic projection from \(p\) flattens the rest of the sphere onto \(\R^2\), as we will see in
		<Ref to="topology/manifolds" />), and in the plane the straight-line film shrinks any loop. So our loop shrinks inside
		\(S^2 \setminus \set{p}\), hence inside \(S^2\).
	</p>
	<p>
		The honest difficulty is the first step. There are continuous loops that pass through <em>every</em> point of the sphere — “space-filling
		curves”, relatives of the famous curves of Peano and Hilbert — so “pick a point the loop misses” is not always possible. The fix is
		to first replace the loop by a homotopic one that does miss a point: chop it into short arcs, each lying in a small cap of the sphere,
		and replace each arc by the shortest great-circle arc with the same ends (a homotopy inside the cap). The new loop is made of finitely
		many great-circle arcs, and those cannot cover the whole sphere. Hatcher dodges the difficulty differently: he chops the loop into
		pieces that each miss the north pole or the south pole, and shrinks them one at a time
		<Cite k="hatcher2002" loc="Prop. 1.14" />.
	</p>
</Proof>

<Warning title="Simply connected does not mean contractible">
	<p>
		The sphere \(S^2\) is simply connected: no loop can feel its hollow interior, because a loop can always slip off the side of a balloon.
		But \(S^2\) is <em>not</em> contractible: there is no film that shrinks the whole sphere to a point inside itself. Proving that needs a
		tool that can see two-dimensional holes. The fundamental group cannot; the second homology group \(H_2\) can, and in
		<Ref to="homology/invariance" /> we will use \(H_2(S^2) \ne 0 = H_2(\text{point})\) to settle it. Loops see one kind of hole only.
	</p>
</Warning>

<h2 id="circle">Winding numbers: the fundamental group of the circle</h2>

<p>
	Now for the torus’s stuck loops, and the rubber band on the flagpole. The simplest space with a hole is the circle \(S^1\), or
	equivalently (by the deformation retraction above) the punctured plane \(\R^2 \setminus \set{0}\). A loop in the punctured plane can wind
	around the hole some whole number of times. Let us measure it.
</p>

<p>
	Imagine standing at the hole and watching a traveller go round the loop, always turning to face them. Count the total angle you turn
	through — counter-clockwise turns counting as positive, clockwise as negative — and divide by a full turn, \(2\pi\). When the traveller
	gets home you are facing the same way you started, so the total must be a whole number of turns. That whole number is the
	<dfn>winding number</dfn> of the loop.
</p>

<Figure num="2.3.6" title="Winding number" hint="Reshape the loop · drag the puncture · drag the teal probe along the loop">
	<WindingNumber />
	{#snippet caption()}
		As the probe runs round the loop, the dashed ray from the puncture turns; the teal spiral records the total angle so far, and the
		graph on the right plots it in turns. This graph is the loop <em>lifted</em> to the real line. It always ends on a whole number — the
		winding number. Deform the loop however you like: the end value cannot change unless you drag the loop across the puncture, where it
		jumps.
	{/snippet}
</Figure>

<p>
	The graph on the right deserves a name. The angle of a point of the circle is only defined up to adding whole turns: “a quarter turn”
	and “one and a quarter turns” are the same direction. Following the traveller continuously picks out one consistent value at each
	moment, a function \(\tilde\alpha\colon I \to \R\) (read “alpha tilde”) with no jumps. It is called the <dfn>lift</dfn> of the loop:
	picture the real line wound into an endless spiral staircase above the circle, one storey per turn, and \(\tilde\alpha\) as the route
	of someone walking up and down the staircase while their shadow traces the loop.
</p>

<Definition title="Winding number" id="def-winding-number">
	<p>
		The <dfn>winding number</dfn> of a loop \(\alpha\) in \(S^1\) (or in \(\R^2\setminus\set{0}\)) is
		\(\tilde\alpha(1) - \tilde\alpha(0)\), the total change of its lifted angle, measured in turns. It is an integer.
	</p>
</Definition>

<Theorem title="The fundamental group of the circle" id="thm-pi1-circle">
	<p>
		The winding number gives an isomorphism \(\pi_1(S^1) \cong \Z\). Explicitly, every loop at \((1,0)\) is homotopic to exactly one of
		the loops \(\omega_n(s) = (\cos 2\pi n s, \sin 2\pi n s)\), \(n \in \Z\), which goes \(n\) times round counter-clockwise.
		<Cite k="hatcher2002" loc="Thm 1.7" />
	</p>
</Theorem>

<Proof>
	<p>Here is the shape of the argument; Hatcher’s proof of Theorem 1.7 fills in every detail. There are three steps.</p>
	<ol>
		<li>
			<strong>Lifts exist and are unique.</strong> Every path in the circle has exactly one lift to the spiral staircase starting at a
			chosen storey. Every homotopy of paths lifts too, frame by frame, and continuously.
		</li>
		<li>
			<strong>The winding number is a homotopy invariant.</strong> Lift a homotopy of loops. During the film the lifted endpoint can only
			move continuously, yet at every moment it must sit on a whole number (the loop ends at home). A continuously varying whole number is
			constant. So homotopic loops have equal winding numbers — and the winding number is defined on \(\pi_1(S^1)\).
		</li>
		<li>
			<strong>It is a bijective homomorphism.</strong> Lifting \(\alpha\cdot\beta\) means climbing the stairs for \(\alpha\) and then for
			\(\beta\), so winding numbers add: the map is a homomorphism. It is onto, because \(\omega_n\) has winding number \(n\). And it is
			one-to-one, because a loop with winding number \(n\) can be slid onto \(\omega_n\): straighten its lift into a straight ramp from
			\(0\) to \(n\) — the staircase is a line, so the straight-line film works there — and project the film back down. In particular only
			the class of the constant loop \(\omega_0\) goes to \(0\).
		</li>
	</ol>
</Proof>

<p>
	Three dividends arrive at once. First, the rubber band on the flagpole really is stuck: its winding number is \(1\), the shrunken band
	would have winding number \(0\), and winding numbers do not change under homotopy. Second, the question we left open has its answer: the
	circle is not contractible, because a contractible space has trivial fundamental group and \(\pi_1(S^1) \cong \Z\) is not trivial.
	Third, since the punctured plane deformation retracts onto the circle, \(\pi_1(\R^2 \setminus \set{0}) \cong \Z\) as well.
</p>

<Example title="The torus: two independent windings">
	<p>
		The torus is a product of two circles, \(T^2 = S^1 \times S^1\), and a loop in a product is the same thing as a pair of loops, one in each factor.
		So a loop on the torus has two winding numbers — how many times it goes round the hole (the teal direction) and how many times round
		the tube (the gold direction) — and \(\pi_1(T^2) \cong \Z \times \Z = \Z^2\) <Cite k="hatcher2002" loc="Prop. 1.12" />. In particular, the order of trips does not matter on the
		torus: if \(a\) goes round the tube and \(b\) round the hole, then \(ab \simeq ba\). You can see why in the gluing square: the loop
		\(aba^{-1}b^{-1}\) runs round the boundary of the square, and the whole square is there to shrink it across. Remember this; in a
		moment the square will be punctured.
	</p>
</Example>

<h2 id="figure-eight">When order matters: the figure eight</h2>

<p>
	Every fundamental group so far has been <Term t="abelian-group">abelian</Term>: the order of composing loops did not matter. The
	figure eight changes that, and in doing so reveals what homology will keep and what it will throw away.
</p>

<p>
	Let \(X = S^1 \vee S^1\) be two circles joined at one point, which we take as the basepoint \(x_0\). Let \(a\) be the loop once round
	the left circle and \(b\) once round the right one, both counter-clockwise, and write \(a^{-1}, b^{-1}\) for their reverses. Any loop
	can be pulled tight into a sequence of these four moves, recorded as a <dfn>word</dfn> such as \(a\,b\,a^{-1}\,b^{-1}\) or \(a^3 b^{-2}
	a\) (read left to right: first \(a\) three times, and so on). Some words visibly describe the same loop: \(a\,a^{-1}\) goes round and
	straight back, and shrinks to nothing. Cancelling every such adjacent pair until none is left produces a <dfn>reduced word</dfn>.
</p>

<Theorem title="The fundamental group of the figure eight">
	<p>
		\(\pi_1(S^1 \vee S^1)\) is the <dfn>free group</dfn> on \(a\) and \(b\): its elements are the reduced words in \(a, a^{-1}, b,
		b^{-1}\) (the empty word is the identity), multiplied by writing one word after another and cancelling. Two loops are homotopic exactly
		when they have the same reduced word.
	</p>
</Theorem>

<p>
	That different reduced words give non-homotopic loops is the hard part; it is usually proved with van Kampen’s theorem or with covering
	spaces <Cite k="hatcher2002" loc="Example 1.21, §1.3" />, and we shall take it on trust. The figure below shows the idea behind the covering-space proof. Build your
	own loops from the four letters and watch three pictures at once.
</p>

<Figure num="2.3.7" title="Loops on the figure eight" hint="Build a word from the letter keys · tap a letter to remove it · pull it tight">
	<LoopWords />
	{#snippet caption()}
		Left: the loop, one petal per letter, numbered in order (dashed petals cancel). Middle: the same trip as a walk on an infinite tree,
		one direction per letter — this tree is the “staircase” of the figure eight, and the walk’s end point is the reduced word. Right: the
		walk on the grid \(\Z^2\), which only remembers how many steps went each way. Compare \(ab\) with \(ba\): different ends on the tree,
		the same end on the grid.
	{/snippet}
</Figure>

<p>
	Try \(ab\) and then \(ba\). As loops, they go round the two circles in opposite orders; as reduced words they are different, so they
	are <em>not</em> homotopic: \(ab \ne ba\) in \(\pi_1\). The fundamental group of the figure eight is not abelian. Now try the
	<dfn>commutator</dfn> \(aba^{-1}b^{-1}\). Each circle is traversed once in each direction, so every “net count” is zero, and the grid walk
	returns home. Yet the word is already reduced, the tree walk ends four steps away, and the loop cannot be shrunk.
</p>

<p>
	Here, finally, is the punctured torus again. It deformation retracts onto the figure eight, so its fundamental group is free on \(a\)
	and \(b\) too — and the rim of the puncture, which the film of the earlier figure carried onto \(aba^{-1}b^{-1}\), is a loop that cannot
	be shrunk. Fill the puncture back in and the square reappears to shrink it: the torus’s \(ab = ba\) is precisely the effect of the one
	missing disk.
</p>

<Remark title="A puzzle with a picture">
	<p>
		The commutator has a famous party trick. Hang a picture on two nails with a string wound as \(aba^{-1}b^{-1}\): round the first nail,
		then the second, then the first the other way, then the second the other way. With both nails in, the string is a non-trivial loop in
		the plane minus two points, which is homotopy equivalent to a figure eight, and the picture hangs. Pull out either nail — say the second
		— and every \(b\) in the word becomes trivial, leaving \(a\,a^{-1}\), which cancels: the picture falls. Demaine and five co-authors
		turned this into a whole theory, with pictures that fall when any one of \(n\) nails is pulled <Cite k="demaine2014" />.
	</p>
</Remark>

<h3>Forgetting the order: a preview of homology</h3>

<p>
	The grid on the right of the figure is a picture of what happens if we <em>insist</em> that loops commute, declaring \(ab = ba\) for all
	elements. A word then only remembers its <dfn>exponent sums</dfn>: the total number of \(a\)’s (counting \(a^{-1}\) as \(-1\)) and the
	total number of \(b\)’s. The non-abelian free group collapses to the abelian group \(\Z^2\), written additively as \(m\,a + n\,b\). This
	process — forcing a group to become commutative in the most economical way — is called <dfn>abelianization</dfn>. (Precisely, one
	divides the group by the subgroup generated by all commutators; for free groups the result is always “count each letter”.)
</p>

<KeyIdea>
	<p>
		The first homology group is the abelianized fundamental group: for a path-connected space,
		\[ H_1(X) \;\cong\; \pi_1(X)^{\mathrm{ab}}. \]
		This is the Hurewicz theorem in dimension one, proved in <Ref to="homology/invariance" /> <Cite k="hatcher2002" loc="Thm 2A.1" />. Homology keeps the net count of how often a
		loop goes round each hole and forgets the order — exactly the information on the grid. For the figure eight, \(H_1 \cong \Z^2\); for
		the circle and the torus, whose fundamental groups were already abelian, \(H_1\) is \(\Z\) and \(\Z^2\).
	</p>
</KeyIdea>

<p>
	Why trade the richer group for the poorer one? Because the fundamental group is hard. Its words can be arbitrarily complicated, and
	there are spaces built from finitely many cells for which no computer program can decide whether two words describe the same loop:
	the problem is provably unsolvable <Cite k="boone1958" />, <Cite k="hatcher2002" loc="Cor. 1.28" />. The higher homotopy groups
	\(\pi_n\) are wilder still: even for the 2-sphere, \(\pi_n(S^2)\) is non-zero for infinitely many \(n\)
	<Cite k="hatcher2002" loc="p. 98" />, and nobody knows them all. Homology
	gives up the order of loops, and in exchange becomes <em>computable</em> — by the linear algebra of <Ref to="foundations/linear-algebra" />
	— in every dimension at once, detecting the sphere’s hollow along the way. Hatcher’s way of putting the bridge: abelianizing frees loops
	from their basepoint, so that “loops become cycles” <Cite k="hatcher2002" loc="p. 99" />. Cycles are where Part III begins.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Everything is homotopic in ℝⁿ">
	<p>Show that any two continuous maps \(f, g\colon X \to \R^n\) are homotopic, whatever the space \(X\).</p>
	{#snippet hint()}
		<p>Write down the straight-line film and check the three things a homotopy needs.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Let \(H(x,t) = (1-t)\,f(x) + t\,g(x)\). It is continuous, because it is built from the continuous functions \(f\), \(g\) and
			\((x,t) \mapsto t\) by multiplying and adding coordinates. Its values lie in \(\R^n\) (there is nothing to avoid). And
			\(H(x,0) = f(x)\), \(H(x,1) = g(x)\). So \(f \simeq g\). The same argument works for maps into any convex subset of \(\R^n\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Contractible spaces are path-connected">
	<p>
		Let \(H\colon X \times I \to X\) be a homotopy from \(\id_X\) to the constant map with value \(x_0\). Use it to join any two points
		\(x, y \in X\) by a path.
	</p>
	{#snippet solution()}
		<p>
			The map \(\gamma_x(t) = H(x,t)\) is continuous (a restriction of \(H\)), with \(\gamma_x(0) = x\) and \(\gamma_x(1) = x_0\): a path
			from \(x\) to \(x_0\). Likewise \(\gamma_y\) runs from \(y\) to \(x_0\). Then \(\gamma_x\) followed by the reverse of \(\gamma_y\) is a
			path from \(x\) to \(y\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The punctured plane onto the circle">
	<p>
		For \(x \in \R^2 \setminus \set{0}\) let \(H(x,t) = (1-t)\,x + t\,x/\abs{x}\). Check carefully that \(H\) is a deformation retraction of
		the punctured plane onto the unit circle: (a) \(H(x,0) = x\); (b) \(H(x,1) \in S^1\); (c) \(H(a,t) = a\) for \(a \in S^1\); (d) the film
		never passes through the origin.
	</p>
	{#snippet solution()}
		<p>
			(a) At \(t = 0\), \(H(x,0) = x\). (b) At \(t = 1\), \(H(x,1) = x/\abs{x}\), which has length \(1\). (c) If \(\abs{a} = 1\) then
			\(a/\abs{a} = a\) and \(H(a,t) = (1-t)a + ta = a\). (d) \(H(x,t) = \bigl((1-t) + t/\abs{x}\bigr)\,x\) is a positive number times the
			non-zero vector \(x\), so it is never \(0\). Finally, \(H\) is continuous because \(x \mapsto \abs{x}\) is continuous and non-zero on
			the punctured plane.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The alphabet up to homotopy">
	<p>
		Sort the 26 capital letters, written in a plain sans-serif font as thin curves, by homotopy type. Then find two letters that are
		homotopy equivalent but not homeomorphic.
	</p>
	{#snippet hint()}
		<p>Count the independent loops. For homeomorphism, count the pieces left when you remove a well-chosen point.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Contractible (no loops): C E F G H I J K L M N S T U V W X Y Z. One loop, \(\simeq S^1\): A D O P Q R. Two loops,
			\(\simeq S^1 \vee S^1\): B. (Fonts matter: in some fonts the tail of Q only touches the circle, in others it crosses it; the loop count
			does not change, but the branch points do. The answer depends on the shapes, not the names.) For a pair: \(\mathsf T\) and \(\mathsf X\)
			are both contractible, but removing the crossing point of \(\mathsf X\) leaves four pieces, while no point of \(\mathsf T\) does that —
			its junction leaves three. A homeomorphism would carry the special point of one to a point of the other with the same property, so they
			are not homeomorphic.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Winding numbers add">
	<p>
		(a) What is the winding number of the loop \(\alpha(s) = (\cos 4\pi s, -\sin 4\pi s)\)? (b) What is the winding number of
		\(\omega_3 \cdot \omega_{-1}\)? (c) Why does (b) illustrate that the winding number turns concatenation into addition?
	</p>
	{#snippet solution()}
		<p>
			(a) As \(s\) runs from \(0\) to \(1\), the angle \(-4\pi s\) decreases by \(4\pi\): two full turns clockwise. The winding number is
			\(-2\). (b) The lift climbs \(3\) storeys during the first half of the time and descends \(1\) during the second, a total of \(2\). (c)
			In general the lift of \(\alpha\cdot\beta\) is the lift of \(\alpha\) followed by the lift of \(\beta\) shifted to start where the first
			ended, so the total climbs add: the winding number of \(\alpha\cdot\beta\) is the winding number of \(\alpha\) plus that of
			\(\beta\). This is the homomorphism property in the proof of \(\pi_1(S^1) \cong \Z\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Homotopy equivalence is transitive">
	<p>
		Suppose \(f\colon X \to Y\) and \(h\colon Y \to Z\) are homotopy equivalences, with homotopy inverses \(g\colon Y \to X\) and
		\(k\colon Z \to Y\). Show that \(h \circ f\colon X \to Z\) is a homotopy equivalence.
	</p>
	{#snippet hint()}
		<p>
			The candidate inverse is \(g \circ k\). You may use that if \(u \simeq v\) then \(p \circ u \circ q \simeq p \circ v \circ q\) (apply
			\(p\) to every frame of the film, and feed it points through \(q\)).
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			\((g \circ k) \circ (h \circ f) = g \circ (k \circ h) \circ f \simeq g \circ \id_Y \circ f = g \circ f \simeq \id_X\), using
			\(k \circ h \simeq \id_Y\) and the hint. Similarly \((h \circ f) \circ (g \circ k) = h \circ (f \circ g) \circ k \simeq h \circ k \simeq
			\id_Z\). Both steps chain homotopies together, which is allowed because \(\simeq\) is transitive for maps.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Reducing words">
	<p>
		In the free group on \(a, b\): (a) reduce \(a\,b\,b^{-1}a\,b^{-1}a^{-1}a\,b\); (b) compute its exponent sums and check they match;
		(c) is \(a\,b\,a^{-1}\) equal to \(b\) in \(\pi_1(S^1 \vee S^1)\)? Are they equal after abelianizing?
	</p>
	{#snippet solution()}
		<p>
			(a) Cancel \(b\,b^{-1}\): \(a\,a\,b^{-1}a^{-1}a\,b\). Cancel \(a^{-1}a\): \(a\,a\,b^{-1}b\). Cancel \(b^{-1}b\): \(a^2\). (b) The
			exponent sum of \(a\) in the original word is \(1 + 1 - 1 + 1 = 2\) and that of \(b\) is \(1 - 1 - 1 + 1 = 0\), matching \(a^2\).
			Cancelling never changes exponent sums, since it removes one \(+1\) and one \(-1\). (c) \(a\,b\,a^{-1}\) is reduced and differs from
			\(b\), so they are different elements of \(\pi_1\): going round \(a\), then \(b\), then back round \(a\) is a different loop from just
			\(b\). After abelianizing both become \(0\,a + 1\,b = b\): equal.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Two nails">
	<p>
		The plane with two points removed, \(P = \R^2 \setminus \set{p, q}\), deformation retracts onto a figure eight, so \(\pi_1(P)\) is free
		on the loops \(a\) (round \(p\)) and \(b\) (round \(q\)). (a) Compute the winding numbers of the commutator \(aba^{-1}b^{-1}\) around
		\(p\) and around \(q\). (b) Explain why it is nevertheless not homotopic to a constant loop in \(P\), but becomes homotopic to one if
		\(q\) is filled back in.
	</p>
	{#snippet solution()}
		<p>
			(a) Around \(p\), only the \(a\)’s wind: \(+1 - 1 = 0\). Around \(q\), only the \(b\)’s: \(+1 - 1 = 0\). (b) In \(\pi_1(P)\) the word
			\(aba^{-1}b^{-1}\) is reduced and non-empty, so it is not the identity: winding numbers, being abelian, are blind to it. If \(q\) is
			filled in, the space becomes \(\R^2 \setminus \set{p}\), whose fundamental group is \(\Z\), generated by \(a\); the loop \(b\) now
			shrinks to the constant loop, so the word becomes \(a\,a^{-1}\), which cancels. This is the picture-hanging puzzle, and a first
			example of a loop that homology cannot see but homotopy can.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>homotopy</strong> \(H\colon X \times I \to Y\) is a continuous film of maps from \(f\) to \(g\); “homotopic” (\(\simeq\)) is
			an equivalence relation. For paths we keep the ends fixed.
		</li>
		<li>
			Spaces are <strong>homotopy equivalent</strong> (\(X \simeq Y\)) when maps both ways compose to something homotopic to the identity.
			This is much coarser than homeomorphism: it forgets thickness and dimension and keeps the pattern of holes.
		</li>
		<li>
			A <strong>deformation retraction</strong> squashes a space onto a subspace that stays still: the annulus and punctured plane onto a
			circle, the Möbius band onto its core, the punctured torus onto a figure eight, \(\R^n\) onto a point (so \(\R^n\) is
			<strong>contractible</strong>).
		</li>
		<li>
			Homotopy classes of loops at a basepoint form the <strong>fundamental group</strong> \(\pi_1(X, x_0)\); composition is “one loop then
			the other”, inverses run backwards. It is a homotopy invariant.
		</li>
		<li>
			\(\pi_1(S^1) \cong \Z\) via the <strong>winding number</strong>; \(\pi_1(T^2) \cong \Z^2\); \(\pi_1(S^2) = 0\), yet \(S^2\) is not
			contractible — loops cannot see the sphere’s hollow.
		</li>
		<li>
			\(\pi_1(S^1 \vee S^1)\) is <strong>free</strong> on \(a, b\) and non-abelian: \(ab \ne ba\). Abelianizing keeps only the net counts
			and gives \(\Z^2\) — a preview of \(H_1(X) \cong \pi_1(X)^{\mathrm{ab}}\).
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
