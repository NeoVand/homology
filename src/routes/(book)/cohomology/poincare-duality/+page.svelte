<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Corollary from '$lib/components/prose/Corollary.svelte';
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
	import BettiMirror from '$lib/figures/cohomology/poincare-duality/BettiMirror.svelte';
	import DualCells from '$lib/figures/cohomology/poincare-duality/DualCells.svelte';
	import LoopFence from '$lib/figures/cohomology/poincare-duality/LoopFence.svelte';
	import CapGrid from '$lib/figures/cohomology/poincare-duality/CapGrid.svelte';
	import IntersectionGame from '$lib/figures/cohomology/poincare-duality/IntersectionGame.svelte';
	import KnotLink from '$lib/figures/cohomology/poincare-duality/KnotLink.svelte';
	import AnnulusDuality from '$lib/figures/cohomology/poincare-duality/AnnulusDuality.svelte';

	const reading = [
		{
			title: 'Algebraic Topology, §3.3 “Poincaré Duality”',
			author: 'Allen Hatcher (2002)',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'Fundamental classes, the cap product, the duality theorem for all closed manifolds (Theorem 3.30), the odd-dimensional Euler characteristic, and the Lefschetz and Alexander duality theorems. The section opens with exactly the dual-cell picture of this chapter.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Cup product and intersections',
			author: 'Michael Hutchings (2011)',
			url: 'https://math.berkeley.edu/~hutching/teach/215b-2011/cup.pdf',
			note: 'A short handout proving that the cup product is Poincaré dual to intersection, with careful signs, the torus and ℂPⁿ — and the warning that the dual of a loop is not the dual-basis class.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring Tu (Springer GTM 82, 1982)',
			url: 'https://books.google.com/books/about/Differential_Forms_in_Algebraic_Topology.html?id=COuPBAAAQBAJ',
			note: 'Poincaré duality for smooth manifolds via forms: the pairing (α, β) ↦ ∫ α∧β, Poincaré duals of submanifolds as forms concentrated near them, and the Thom class.',
			kind: 'book' as const
		},
		{
			title: 'Characteristic Classes',
			author: 'John Milnor and James Stasheff (Princeton, 1974)',
			note: 'The classic source for the Thom isomorphism and the duality between submanifolds and cohomology classes that underlies the Euler class of §4.8. Graduate level, wonderfully written.',
			kind: 'book' as const
		},
		{
			title: 'Poincaré duality',
			author: 'Wikipedia',
			url: 'https://en.wikipedia.org/wiki/Poincar%C3%A9_duality',
			note: 'A compact overview with the history — Poincaré’s 1895 statement, Heegaard’s criticism, the dual-triangulation proof — and the modern cap-product formulation.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'The Essence of de Rham Cohomology',
			author: 'Anton Petrov (2024)',
			url: 'https://arxiv.org/abs/2411.06296',
			note: 'Student-level notes that reach Poincaré duality through differential forms; a good complement to the combinatorial route taken here.',
			kind: 'paper' as const,
			free: true
		}
	];
</script>

<Epigraph author="Henri Poincaré" source="Analysis Situs (1895), translated by John Stillwell">…geometry is the art of reasoning well from badly drawn figures; however, these figures, if they are not to deceive us, must satisfy certain conditions; the proportions may be grossly altered, but the relative positions of the different parts must not be upset.</Epigraph>

<p class="lead">
	Write down the Betti numbers of the torus: \(1, 2, 1\). Of the sphere: \(1, 0, 1\). Of the surface
	with two handles: \(1, 4, 1\). They read the same forwards and backwards. Henri Poincaré noticed in
	the 1890s that this is no accident: for every closed, orientable manifold of dimension \(n\), the
	\(k\)-th Betti number equals the \((n-k)\)-th.
</p>

<p class="lead">
	Behind the numerical palindrome hides a structural one: a second way of cutting a manifold into
	cells, in which every \(k\)-dimensional piece is traded for an \((n-k)\)-dimensional one — and in
	which homology and cohomology trade places. This chapter builds that mirror.
</p>

<Ahead>
	<p>
		Poincaré duality says that on a closed oriented manifold every cohomology class is a homology class
		in disguise: a fence <em>is</em> a loop. It explains the symmetry of Betti numbers and forces the Euler
		characteristic of every closed odd-dimensional manifold to vanish. It turns the cup products of
		<Ref to="cohomology/cup-product" /> into intersections of cycles. It gives every four-dimensional
		manifold an "intersection form" that is the starting point of the modern classification of such
		spaces. Its cousins, the Lefschetz and Alexander duality theorems, handle manifolds with boundary and
		the complements of knots. And in <Ref to="cohomology/characteristic-classes" /> the Euler class will turn
		out to be the Poincaré dual of the zeros of a vector field.
	</p>
</Ahead>

<h2 id="palindromes">Betti numbers that read the same backwards</h2>

<p>
	Recall from <Ref to="homology/homology-groups" /> that the <Term t="betti-number">Betti number</Term>
	\(b_k\) counts the independent \(k\)-dimensional holes of a space: \(b_0\) counts pieces, \(b_1\)
	independent loops, \(b_2\) enclosed voids, and so on. Make a list of them for a few familiar spaces
	and something odd jumps out. Try it in the figure.
</p>

<Figure num="4.6.1" title="The Betti mirror" hint="Pick a space · reflect it in the mirror">
	<BettiMirror />
	{#snippet caption()}
		Bars show the Betti numbers \(b_0,\dots,b_n\); dashed outlines show the same list read backwards.
		For closed orientable manifolds the outlines fit exactly. The Klein bottle and \(\RP^2\) fit only over
		\(\Z/2\); the last two spaces (dashed buttons) are not closed manifolds at all, and the mirror breaks.
	{/snippet}
</Figure>

<p>
	Every closed surface you can build with handles — the sphere, the torus, \(\Sigma_g\) — has Betti
	numbers \(1, 2g, 1\). The 3-sphere \(S^3\) has \(1,0,0,1\); the 3-dimensional torus \(T^3\) has
	\(1,3,3,1\); the complex projective plane \(\CP^2\), a four-dimensional space, has \(1,0,1,0,1\). All
	palindromes.
</p>

<p>
	The failures are just as instructive. The wedge \(S^2\vee S^2\) of two spheres touching at a point has
	\(1,0,2\) — but it is not a <Term t="manifold">manifold</Term>: near the touching point it does not look
	like a flat plane. The disk has \(1,0,0\) — it is a manifold, but it has a boundary, a rim where it stops.
	And the <Term t="klein-bottle">Klein bottle</Term> has rational Betti numbers \(1,1,0\): it is a closed manifold, but it is not
	<Term t="orientable">orientable</Term> — an ant walking around it can come back mirror-reversed
	(<Ref to="topology/manifolds" />). Strikingly, the Klein bottle's Betti numbers <em>mod 2</em> are
	\(1,2,1\), a palindrome again.
</p>

<Question>
	<p>
		Three conditions keep appearing: <em>manifold</em> (it looks like \(\R^n\) everywhere),
		<em>closed</em> (compact, no boundary) and <em>orientable</em> (or else work mod 2). What could
		connect the \(k\)-dimensional holes of such a space to its \((n-k)\)-dimensional ones?
	</p>
</Question>

<h2 id="fundamental-class">The fundamental class</h2>

<p>
	Start with the top dimension. Take a closed manifold \(M\) of dimension \(n\), cut into \(n\)-simplices
	(triangles for a surface, tetrahedra for a 3-manifold). Because \(M\) is a manifold without boundary,
	every \((n-1)\)-dimensional face — every edge of a triangulated surface — is shared by
	<em>exactly two</em> top simplices, one on each side.
</p>

<p>
	Now try to orient all the top simplices compatibly, as in <Ref to="homology/computing" />: neighbouring
	simplices should induce <em>opposite</em> orientations on the face they share, so that in the
	boundary of the sum, every face appears once with a plus sign and once with a minus sign. If this can
	be done, the sum
</p>
\[ [M] \;=\; \sum_{\sigma \text{ top-dimensional}} \pm\,\sigma \]
<p>
	has boundary zero: it is an \(n\)-cycle, and it uses every top simplex exactly once. Being able to choose
	the signs consistently is exactly what it means for the triangulated manifold to be orientable.
</p>

<Definition id="def-fundamental-class" title="Fundamental class">
	<p>
		Let \(M\) be a closed, connected, orientable \(n\)-manifold. The <dfn>fundamental class</dfn>
		\([M]\in H_n(M;\Z)\) is the class of the sum of all its top simplices, <Term t="coherent-orientation">coherently oriented</Term>. It
		generates \(H_n(M;\Z)\cong\Z\). Choosing the other coherent orientation replaces \([M]\) by \(-[M]\).
	</p>
</Definition>

<Example title="The torus and the projective plane">
	<p>
		For the \(3\times3\) torus of <Ref to="cohomology/cup-product" />, the counterclockwise orientation
		gives \([T^2]=\sum L-\sum U\) — we used it to read off cup products. For the six-vertex projective plane
		of <Ref to="homology/computing" />, no choice of signs works: orienting five triangles around one vertex
		and continuing as best one can, the boundary of the sum comes out as \(2c\) for a loop \(c\), never
		\(0\). So \(\RP^2\) has no fundamental class over \(\Z\), and indeed \(H_2(\RP^2;\Z)=0\).
	</p>
</Example>

<p>
	Mod 2 the sign problem disappears. With \(\Z/2\) coefficients every face is counted twice, and
	\(1+1=0\), so the plain sum of all top simplices is always a cycle. Every closed manifold, orientable or
	not, has a <dfn>mod-2 fundamental class</dfn> \([M]_2\in H_n(M;\Z/2)\).
</p>

<p>
	The fundamental class is the "whole manifold" as a cycle, and measuring a top-dimensional cochain on
	it means integrating over all of \(M\). That is how, in the previous chapter, we turned a 2-cochain on
	the torus into a number: \(H^n(M;\Z)\cong\Z\) by \(\omega\mapsto\ip{\omega}{[M]}\) for closed, connected,
	orientable \(M\).
</p>

<h2 id="dual-cells">Cutting a manifold the other way</h2>

<p>
	Here is Poincaré's key idea, and the picture to keep in mind for the rest of the chapter. Take a
	triangulated surface and build a <em>second</em> decomposition of it into cells, as follows.
</p>

<ul>
	<li>
		In the middle of each triangle, put a <strong>dual vertex</strong> — the triangle's centre of mass, its
		barycentre.
	</li>
	<li>
		Across each edge, draw a <strong>dual edge</strong>: it runs from the centre of the triangle on one side,
		through the midpoint of the edge, to the centre of the triangle on the other side. It crosses the
		original edge exactly once.
	</li>
	<li>
		Around each vertex, the dual edges of the edges at that vertex close up into a polygon: the
		<strong>dual face</strong> of the vertex. It has one side for each edge at the vertex and one corner
		for each triangle at the vertex.
	</li>
</ul>

<Figure num="4.6.2" title="Dual cells" hint="Point at any cell · slide between the two worlds">
	<DualCells />
	{#snippet caption()}
		A triangulation (ivory) and its dual (violet). Point at a vertex, an edge or a triangle and its partner
		lights up: a dual face, a dual edge crossing it, a dual vertex inside it. The slider decides which of
		the two decompositions you are pointing at. In the plane the dual of the triangular grid is the
		honeycomb; on the torus every dual face is a (slanted) hexagon.
	{/snippet}
</Figure>

<p>
	The dual cells again cut the surface into vertices, edges and faces — just not triangles any more:
	the faces are polygons. And the counts are swapped:
</p>
\[ V^* = F, \qquad E^* = E, \qquad F^* = V. \]
<p>
	For the \(3\times 3\) torus that is \(18\) dual vertices, \(27\) dual edges and \(9\) hexagonal dual faces.
	For an octahedron (\(6\) vertices, \(12\) edges, \(8\) faces) it is \(8, 12, 6\): the dual of the octahedron
	is the cube. The seven-vertex torus has a dual with seven hexagons, famous in geometry as the Szilassi
	polyhedron. Since the alternating sum \(V-E+F\) on a surface reads the same in both directions, the Euler
	characteristic does not notice the swap.
</p>

<Definition id="def-dual-cells" title="Dual cell decomposition">
	<p>
		Let \(M\) be a triangulated closed \(n\)-manifold. The <dfn>dual cell</dfn> \(\sigma^*\) of a
		\(k\)-simplex \(\sigma\) is the union of the small simplices of the barycentric subdivision whose first
		corner is the barycentre of \(\sigma\) and which then run "outwards" through barycentres of larger and
		larger simplices containing \(\sigma\). It is a cell of dimension \(n-k\), and it meets \(\sigma\) in exactly
		one point, the barycentre of \(\sigma\), crossing it transversally. The dual cells form a new cell
		decomposition \(K^*\) of \(M\).
	</p>
</Definition>

<p>
	(The <Term t="barycentric-subdivision">barycentric subdivision</Term> was met in <Ref to="topology/simplicial-complexes" />; on a surface, it cuts
	each triangle into six small triangles, and the dual face of a vertex is the union of the small
	triangles touching it — exactly the shaded region in the figure.)
</p>

<p>The most important property of the construction is that it reverses the face relation:</p>

<KeyIdea>
	<p>
		\(\sigma\) is a face of \(\tau\) \(\iff\) \(\tau^*\) is a face of \(\sigma^*\). Bigger simplices have smaller
		duals: a vertex sits on edges, which sit on triangles; dually a dual vertex sits on dual edges, which
		sit on dual faces — in the opposite order.
	</p>
</KeyIdea>

<h2 id="duality-theorem">The duality theorem</h2>

<p>
	Now watch what the reversal does to the algebra. Recall from <Ref to="cohomology/cohomology-groups" />
	that a \(k\)-<Term t="cochain">cochain</Term> is an assignment of a number to each \(k\)-simplex, and that the coboundary of the
	cochain that is \(1\) on a single simplex \(\sigma\) and \(0\) elsewhere is a signed sum of the
	\((k+1)\)-simplices that have \(\sigma\) as a face:
</p>
\[ \delta(\mathbb 1_\sigma) = \sum_{\tau \supset \sigma} \pm\,\mathbb 1_\tau. \]
<p>
	On the dual side, the cells \(\tau^*\) of those bigger simplices are exactly the faces of \(\sigma^*\). So the
	<em>boundary</em> of the dual cell \(\sigma^*\) is a signed sum of the same things:
</p>
\[ \partial(\sigma^*) = \sum_{\tau\supset\sigma} \pm\,\tau^*. \]

<p>
	Match each \(k\)-cochain \(\varphi\) with the dual \((n-k)\)-chain \(\sum_\sigma \varphi(\sigma)\,\sigma^*\). The two
	displays say that, under this matching, <strong>the coboundary map \(\delta\) of the original
	triangulation becomes the boundary map \(\partial\) of the dual decomposition</strong> — as long as the signs
	agree. Cocycles become cycles, coboundaries become boundaries, and therefore
</p>
\[ H^k(K) \;\cong\; H_{n-k}(K^*) \;\cong\; H_{n-k}(M), \]
<p>
	where the last step holds because homology does not depend on how the manifold is cut into cells
	(<Ref to="homology/exact-sequences" />).
</p>

<p>
	Where do the signs come from? Each dual cell needs an orientation, and it has to be chosen in a way
	that fits with the orientation of \(\sigma\) <em>and</em> the orientation of the manifold. On an oriented
	surface there is a natural recipe: the dual edge \(e^*\) is the edge \(e\) turned a quarter-turn
	counterclockwise, and each dual face is oriented counterclockwise. A direct computation on the \(3\times3\)
	torus confirms that this works: with these choices the boundary matrices of the dual complex are exactly the
	transposes of the original ones (one of them up to an overall minus sign), that is, the coboundary matrices. On a
	<em>non-orientable</em> surface "counterclockwise" cannot be chosen consistently, and the signs cannot be
	made to match — except mod 2, where signs do not matter.
</p>

<Theorem id="poincare-duality" label="Theorem (Poincaré duality)">
	<p>Let \(M\) be a closed \(n\)-manifold.</p>
	<ul>
		<li>If \(M\) is orientable, then \(H^k(M;\Z)\cong H_{n-k}(M;\Z)\) for every \(k\).</li>
		<li>Whether or not \(M\) is orientable, \(H^k(M;\Z/2)\cong H_{n-k}(M;\Z/2)\) for every \(k\).</li>
	</ul>
</Theorem>

<Proof label="Proof sketch">
	<p>
		For a triangulated manifold, the argument above is the proof: the matching of cochains with dual chains
		turns \(\delta\) into \(\pm\partial\), with the orientation of \(M\) fixing the signs (and nothing to fix mod 2).
		Not every manifold can be triangulated, and the modern proof (Hatcher, Theorem 3.30) avoids triangulations
		altogether: it uses the cap product of the next section and builds the isomorphism one small open set at a
		time. We do not reproduce it.
	</p>
</Proof>

<p>
	The duality is not just an abstract isomorphism; it has a very concrete face on surfaces. A degree-1
	cohomology class can be drawn as a <Term t="fence">fence</Term>, as in <Ref to="cohomology/cup-product" />. Poincaré duality
	says that the fence, read as a loop, is the dual homology class.
</p>

<Definition id="def-poincare-dual" title="The Poincaré dual of a loop">
	<p>
		Let \(C\) be an oriented closed curve on an oriented surface. Its <dfn>Poincaré dual</dfn>
		\(\mathrm{PD}[C]\in H^1\) is the class of the fence along \(C\) that counts \(+1\) each time you cross \(C\)
		from its left side to its right side (and \(-1\) the other way).
	</p>
</Definition>

<Figure num="4.6.3" title="Loop and fence" hint="Drag to rotate · switch views · choose the curves">
	<LoopFence />
	{#snippet caption()}
		The same curve \(C\), seen as a loop (gold, with beads showing its direction) or as a fence (teal, with
		chevrons pointing from its left to its right). The fence measures the violet test loop \(\gamma\) by
		counting signed crossings, and the answer is the intersection number \(\gamma\cdot C\), which depends only
		on the classes of the two curves.
	{/snippet}
</Figure>

<h3 id="consequences">Three consequences</h3>

<Corollary title="Betti numbers are palindromes">
	<p>
		For a closed orientable \(n\)-manifold, \(b_k = b_{n-k}\) for all \(k\) (Betti numbers over \(\Q\)). For every
		closed \(n\)-manifold, the same holds for Betti numbers over \(\Z/2\).
	</p>
</Corollary>

<Proof>
	<p>
		Over a field such as \(\Q\), cohomology has the same dimension as homology in each degree (the
		<Term t="universal-coefficient-theorem">Universal Coefficient Theorem</Term>): \(\dim H^k = b_k\). Poincaré duality, which also holds with \(\Q\) coefficients,
		says \(\dim H^k = \dim H_{n-k} = b_{n-k}\). Mod 2, use the \(\Z/2\) version of the theorem.
	</p>
</Proof>

<Corollary title="The top class">
	<p>
		For a closed, connected, orientable \(n\)-manifold, \(H_n(M;\Z)\cong H^0(M;\Z)=\Z\), generated by the
		fundamental class. (For a non-orientable closed \(M\), \(H_n(M;\Z)=0\), while \(H_n(M;\Z/2)=\Z/2\).)
	</p>
</Corollary>

<Corollary id="odd-euler" title="Odd dimensions have zero Euler characteristic">
	<p>Every closed manifold of odd dimension has \(\chi(M)=0\).</p>
</Corollary>

<Proof>
	<p>
		Compute \(\chi\) with mod-2 Betti numbers (the <Term t="euler-poincare-formula">Euler–Poincaré formula</Term> of
		<Ref to="homology/homology-groups" /> works over any field): \(\chi = \sum_k (-1)^k b_k\). Pair the term
		for \(k\) with the term for \(n-k\). They have equal Betti numbers by the first corollary, but since \(n\)
		is odd, \(k\) and \(n-k\) have opposite parity, so the two terms have opposite signs and cancel. For
		\(n=3\): \(\chi = b_0 - b_1 + b_2 - b_3 = (b_0-b_3) - (b_1-b_2) = 0\).
	</p>
</Proof>

<Example title="The projective plane, both ways">
	<p>
		Over \(\Z\), \(\RP^2\) has \(H^0=\Z\) and \(H_2=0\): duality fails, as it must for a non-orientable
		surface. Over \(\Z/2\), every group in sight is \(\Z/2\), and \(H^k(\RP^2;\Z/2)\cong H_{2-k}(\RP^2;\Z/2)\) holds
		for \(k=0,1,2\). Geometrically: the six-vertex projective plane has \(6\) vertices, \(15\) edges and \(10\)
		triangles, each vertex surrounded by five triangles. Its dual has \(10\) vertices, \(15\) edges and \(6\)
		pentagons — half of a dodecahedron, just as the original is half of an icosahedron.
	</p>
</Example>

<Remark>
	<p>
		Combining duality with the Universal Coefficient Theorem also pairs up <Term t="torsion-subgroup">torsion</Term>: in a closed
		orientable \(n\)-manifold, the torsion of \(H_k\) matches the torsion of \(H_{n-k-1}\). For instance the
		3-dimensional projective space has \(H_1(\RP^3)=\Z/2\), and \(n-k-1 = 3-1-1 = 1\): it is matched with itself.
	</p>
</Remark>

<h2 id="cap-product">The cap product: duality as a machine</h2>

<p>
	Dual cells explain <em>why</em> duality holds. To compute with it, there is a formula that turns a cochain into a
	chain directly, without building the dual decomposition. It is the sibling of the <Term t="cup-product">cup product</Term>.
</p>

<Definition id="def-cap" title="Cap product">
	<p>
		For an ordered \(n\)-simplex \(\sigma=[v_0,\dots,v_n]\) and a \(p\)-cochain \(\varphi\) (with \(p\le n\)), the
		<dfn>cap product</dfn> is the \((n-p)\)-chain
	</p>
	\[ \sigma\frown\varphi = \varphi([v_0,\dots,v_p])\cdot[v_p,\dots,v_n], \]
	<p>
		read "sigma cap phi", extended to all chains by linearity. The cochain eats the front face; the back face
		is what is left over.
	</p>
</Definition>

<p>
	Compare with the cup product: there both factors were measurements, read on the front and the back face.
	Here one factor is a measurement and the other a place; the measurement is spent on the front face, and
	the back face survives as a smaller place. The two are tied together by the identity
	\(\ip{\psi}{c\frown\varphi} = \ip{\varphi\smile\psi}{c}\) (check it on a single triangle: both sides are
	\(\varphi([v_0,v_1])\,\psi([v_1,v_2])\)).
</p>

<Definition title="The duality map">
	<p>
		For a closed oriented \(n\)-manifold with fundamental class \([M]\), the map
		\(D(\varphi) = [M]\frown\varphi\) sends \(p\)-cochains to \((n-p)\)-chains.
	</p>
</Definition>

<p>
	Hatcher's formula \(\partial(\sigma\frown\varphi) = \pm(\partial\sigma\frown\varphi - \sigma\frown\delta\varphi)\) shows
	that since \(\partial[M]=0\), cocycles go to cycles and coboundaries go to boundaries. So \(D\) is defined
	on classes, \(D\colon H^p(M)\to H_{n-p}(M)\). The modern statement of Poincaré duality is that
	<strong>this map is an isomorphism</strong>.
</p>

<p>
	Let us run it on the torus. Every lower triangle \(L\) of our grid hands its back edge (vertical) the value
	of \(\varphi\) on its front edge (horizontal); every upper triangle \(U\), counted with a minus sign, hands
	its back edge (horizontal) the value of \(\varphi\) on its front edge (vertical). Take \(\varphi=\alpha\), the
	vertical fence: it is \(1\) exactly on the horizontal edges of its column (and on the diagonals, which are
	never front edges here). So \(D(\alpha)\) is the sum of the vertical back edges of the lower triangles in
	that column — <strong>a vertical loop running right beside the fence</strong>. Similarly \(D(\beta)\) is the
	horizontal loop just above the fence \(\beta\), traversed backwards: \(D(\beta)=-a\).
</p>

<Figure num="4.6.4" title="The cap product at work" hint="Choose a class · tap vertices to add coboundaries">
	<CapGrid />
	{#snippet caption()}
		\(D(\varphi)=[T^2]\frown\varphi\) on the \(3\times3\) torus: the rose 1-chain. For the fence \(\alpha\) it is the
		vertical loop beside the fence, of class \(b\); for \(\beta\) it is \(-a\). Tap vertices to change \(\varphi\) by a
		coboundary: the rose chain changes — sometimes into something that hardly looks like a loop — but it is
		always a cycle, and its homology class never moves.
	{/snippet}
</Figure>

<p>
	Notice how this matches the fence picture. In <Ref to="cohomology/cup-product" />, \(\alpha\) was the fence of the
	vertical loop \(b\) running upwards, so \(\alpha=\mathrm{PD}[b]\); and \(\beta\) was the fence of the horizontal
	loop running leftwards, \(\beta=\mathrm{PD}[-a]\). The cap product undoes exactly this: \(D(\alpha) = b\) and
	\(D(\beta)=-a\). The fence and the loop really are two faces of one object.
</p>

<Warning title="Dual, but not the dual basis">
	<p>
		It is tempting to guess that the Poincaré dual of the loop \(a\) is the class that takes the value \(1\) on
		\(a\). It is not. The class with \(\alpha(a)=1\) is \(\alpha=\mathrm{PD}[b]\) — the fence of the <em>other</em> loop,
		since that is the fence \(a\) crosses. The Poincaré dual of \(a\) counts crossings with \(a\), and \(a\) does not
		cross itself (push it off itself and the copy runs parallel). Hutchings makes the same point with the same
		example.
	</p>
</Warning>

<h2 id="intersections">Intersection numbers</h2>

<p>
	We have been counting crossings with signs all along; let us make it official. Take two oriented closed
	curves \(C_1, C_2\) on an oriented surface, in general position — they cross at finitely many points, each
	crossing a clean "×", never a tangency.
</p>

<Definition id="def-intersection-number" title="Intersection number">
	<p>
		At each crossing point, record \(+1\) if \(C_2\) passes from the right of \(C_1\) to its left (equivalently: the
		direction of \(C_1\) followed by the direction of \(C_2\) turns counterclockwise), and \(-1\) otherwise. The
		<dfn>intersection number</dfn> \(C_1\cdot C_2\) is the sum of these signs.
	</p>
</Definition>

<p>
	The crucial fact is that the intersection number depends only on the homology classes of the two curves.
	Slide one curve across the other and crossings are created or destroyed in pairs with opposite signs — you
	saw this in the bent fence of Figure 4.5.4, which crossed three times with signs \(+1,-1,+1\). Two
	consequences are immediate: \(C_2\cdot C_1 = -\,C_1\cdot C_2\) (swapping the order reverses every turn), and
	\(C\cdot C = 0\) on an orientable surface (push \(C\) off itself to a parallel copy that never meets it).
</p>

<p>
	On the torus, write \((p,q)\) for the class \(pa+qb\) of a curve that winds \(p\) times around horizontally and
	\(q\) times vertically. Straight curves of two classes cross in exactly \(|p_1q_2-p_2q_1|\) points, all with the
	same sign, and in general
</p>
\[ (p_1,q_1)\cdot(p_2,q_2) = p_1q_2 - p_2q_1 = \det\begin{pmatrix}p_1&q_1\\p_2&q_2\end{pmatrix}. \]

<Figure num="4.6.5" title="The intersection game" hint="Change the classes · slide the teal curve">
	<IntersectionGame />
	{#snippet caption()}
		Two straight closed curves on the torus, their crossings marked \(+\) (filled) or \(-\) (hollow). However you
		slide them, the signed count is the determinant \(p_1q_2-p_2q_1\). The last line computes, by front face ×
		back face on a hidden \(7\times7\) triangulation, the cup product of the two fences — the same number.
	{/snippet}
</Figure>

<Theorem id="cup-intersection" label="Theorem (cup product = intersection)">
	<p>For oriented closed curves \(C_1, C_2\) on a closed oriented surface \(M\),</p>
	\[ \ip{\mathrm{PD}[C_1]\smile\mathrm{PD}[C_2]}{[M]} = C_1\cdot C_2, \qquad\text{and}\qquad \ip{\mathrm{PD}[C]}{\gamma} = \gamma\cdot C. \]
</Theorem>

<p>
	This is the precise form of the slogan at the end of the previous chapter, with our sign conventions (other
	books use others; the content is the same). It holds in every dimension: on a closed oriented \(n\)-manifold,
	the Poincaré dual of a \(p\)-dimensional submanifold is a class of degree \(n-p\), and the cup product of two
	such classes is dual to the intersection of the submanifolds. The last line of Figure 4.6.5 is the surface
	version at work: it computes the cup product by front face × back face, without looking at a single crossing,
	and always lands on the same number as the count.
</p>

<p>
	Poincaré duality can also be phrased entirely in terms of intersections. The <dfn>intersection pairing</dfn>
	between \(H_k(M)\) and \(H_{n-k}(M)\) counts the signed intersections of a \(k\)-cycle with an \((n-k)\)-cycle, and
	it is <em>perfect</em> (with coefficients in a field, or over \(\Z\) once torsion is ignored): for every class that
	is not zero (or torsion) there is a class of complementary dimension that it meets a nonzero number of times
	(Hatcher, Proposition 3.38, phrased there with cup products). In other words, a hole in one dimension can always
	be detected by a hole in the complementary dimension that passes through it.
</p>

<h2 id="intersection-form">The intersection form and the signature</h2>

<p>
	When the manifold has even dimension \(n=2m\), the middle dimension pairs with itself, and the cup product
	gives a square table of integers.
</p>

<Definition id="def-intersection-form" title="Intersection form">
	<p>
		For a closed oriented \(2m\)-manifold, the <dfn>intersection form</dfn> is the pairing
		\(Q(\alpha,\beta) = \ip{\alpha\smile\beta}{[M]}\) on \(H^m(M;\Z)\) (modulo torsion), written as a matrix in a
		basis. By <Term t="graded-commutativity">graded commutativity</Term> it is antisymmetric when \(m\) is odd and symmetric when \(m\) is even, and by
		Poincaré duality it is <dfn>unimodular</dfn>: its determinant is \(\pm1\).
	</p>
</Definition>

<p>
	For a surface (\(m=1\)) we have met it already: the torus gives \(\left(\begin{smallmatrix}0&1\\-1&0\end{smallmatrix}\right)\),
	and the genus-\(g\) surface gives \(g\) copies of that block — the multiplication table of Figure 4.5.6. For
	four-dimensional manifolds (\(m=2\)) the form is symmetric, and it carries a great deal of information.
</p>

<ul>
	<li>
		\(\CP^2\): \(H^2=\Z\), and \(Q=(1)\). The class is dual to a complex projective line inside \(\CP^2\), and two
		such lines always meet in exactly one point — so a line meets a pushed-off copy of itself once.
	</li>
	<li>
		\(S^2\times S^2\): \(H^2=\Z^2\), dual to the two spheres \(S^2\times\{\text{pt}\}\) and \(\{\text{pt}\}\times S^2\).
		They meet once, and each can be pushed off itself, so
		\(Q=\left(\begin{smallmatrix}0&1\\1&0\end{smallmatrix}\right)\).
	</li>
	<li>
		Reversing the orientation of \(\CP^2\) gives a manifold, usually written \(\overline{\CP^2}\), with \(Q=(-1)\).
	</li>
</ul>

<p>
	The <dfn>signature</dfn> of a symmetric form is the number of positive eigenvalues minus the number of
	negative ones; for \(\CP^2\) it is \(1\), for \(S^2\times S^2\) it is \(0\). The signature, the rank, and whether
	\(Q(x,x)\) is always even are invariants that already distinguish many 4-manifolds with the same Betti numbers
	(see the exercises).
</p>

<Remark title="Why 4-manifolds care">
	<p>
		Two celebrated results of the early 1980s put the intersection form at the centre of four-dimensional
		topology. Michael Freedman showed (1982) that a closed simply connected topological 4-manifold is
		determined, up to homeomorphism, by its intersection form together with one extra mod-2 invariant, and that
		every unimodular symmetric form occurs. Simon Donaldson showed (1983) that for <em>smooth</em> such manifolds
		with a definite form (all eigenvalues of one sign), the form must be equivalent to \(\pm\) the identity matrix.
		Together they imply, for example, that the topological 4-manifold whose form is the famous
		eight-dimensional "\(E_8\) form" admits no smooth structure at all. We only glimpse this world; it lies far
		beyond this book.
	</p>
</Remark>

<History>
	<p>
		Poincaré announced the symmetry of Betti numbers in 1893 and tried to prove it in his 1895 memoir
		<em>Analysis Situs</em>, by intersecting cycles with one another. Poul Heegaard's criticism of 1898 showed
		that the argument had a serious gap. In the first two supplements to the memoir Poincaré gave a new proof,
		built on the dual decomposition of this chapter and on tables of incidence numbers — the ancestors of our
		boundary matrices. The modern statement had to wait: as the Wikipedia account puts it, "Poincaré duality did
		not take on its modern form until the advent of cohomology in the 1930s, when Eduard Čech and Hassler Whitney
		invented the cup and cap products and formulated Poincaré duality in these new terms."
	</p>
</History>

<h2 id="boundaries-and-complements">Boundaries and complements: Lefschetz and Alexander</h2>

<p>
	Poincaré duality needs a closed manifold. Two classical variations relax this, and both are worth
	knowing.
</p>

<h3 id="lefschetz">Manifolds with boundary</h3>

<p>
	For a compact manifold \(M\) with boundary \(\partial M\), duality survives if one side of the mirror is taken
	<em>relative to the boundary</em>. <Term t="relative-homology">Relative homology</Term> \(H_k(M,\partial M)\) was introduced in
	<Ref to="homology/exact-sequences" />: its cycles are chains whose boundary lies in \(\partial M\) — paths
	allowed to end on the rim. Its cohomological twin uses cochains that vanish on every simplex of
	\(\partial M\): measurements that ignore the rim. They form the <dfn>relative cohomology</dfn>
	groups \(H^k(M,\partial M)\).
</p>

<Theorem label="Theorem (Lefschetz duality)">
	<p>
		For a compact orientable \(n\)-manifold \(M\) with boundary,
		\(H^k(M,\partial M;\Z)\cong H_{n-k}(M;\Z)\) and \(H^k(M;\Z)\cong H_{n-k}(M,\partial M;\Z)\).
	</p>
</Theorem>

<p>
	The annulus \(A\) (a ring) shows the two halves beautifully. Its absolute \(H_1\) is generated by the core
	circle. A measurement that ignores the rim and detects the core circle must be a fence that stays away from
	the boundary — a circle itself, concentric with the core — and a path crossing the ring from rim to rim
	meets it once. In the other direction, the measurement that detects the core circle (it counts how many times
	you go around) has as its fence a <em>rung</em>, a radial segment from the inner rim to the outer one; read as
	a relative cycle, that rung is the dual class in \(H_1(A,\partial A)\).
</p>

<Figure num="4.6.6" title="Lefschetz duality on the annulus" hint="Switch between the two pairings">
	<AnnulusDuality />
	{#snippet caption()}
		The core circle and a radial rung trade places. A loop in the interior is dual to a fence that runs from
		rim to rim; a path from rim to rim, read as a relative cycle, is dual to a fence that is a loop. Either way
		the two curves meet exactly once, at the rose point.
	{/snippet}
</Figure>

<h3 id="alexander">Complements: knots in space</h3>

<p>
	Now take a shape \(K\) sitting inside a sphere \(S^n\) (think of \(S^3\) as ordinary space \(\R^3\) with one point
	at infinity added) and ask about the space around it, the complement \(S^n\setminus K\). Remarkably, its
	homology is determined by the cohomology of \(K\) alone — no matter how \(K\) is tangled up inside.
</p>

<Theorem label="Theorem (Alexander duality)">
	<p>
		If \(K\) is a compact, locally contractible, nonempty subspace of \(S^n\) other than all of \(S^n\), then
		\(\tilde H_i(S^n\setminus K;\Z)\cong\tilde H^{n-i-1}(K;\Z)\) for every \(i\). (The tildes denote <Term t="reduced-homology">reduced</Term>
		(co)homology, which only changes degree \(0\).)
	</p>
</Theorem>

<p>Two examples show its reach.</p>

<ul>
	<li>
		<strong>Curves in the plane.</strong> A circle \(C\) drawn in \(S^2\) (the plane with a point at infinity), however
		wiggly, has \(\tilde H_0(S^2\setminus C)\cong\tilde H^1(C)=\Z\): the complement has exactly two pieces, an inside and
		an outside. This is the <Term t="jordan-curve-theorem">Jordan curve theorem</Term>, met in <Ref to="homology/invariance" />.
	</li>
	<li>
		<strong>Knots in space.</strong> A knot \(K\) is a circle embedded in \(S^3\). Then
		\(H_1(S^3\setminus K)\cong H^1(K)=H^1(S^1)=\Z\): every knot complement has the first homology of a circle,
		generated by a small loop around the knot's strand, its <dfn>meridian</dfn>. Removing the single point at
		infinity does not change \(H_1\), so the same is true in ordinary space \(\R^3\).
	</li>
</ul>

<p>
	A loop \(\gamma\) in the complement is therefore some multiple \(n\,[m]\) of the meridian class, and the number
	\(n\) is the <dfn>linking number</dfn> of \(\gamma\) with \(K\): how many times \(\gamma\) winds around the knot. Gauss
	found an integral formula for it in 1833, and the figure computes that integral numerically. Dually,
	\(H^1(S^3\setminus K)\cong\Z\) is generated by the measurement "linking number with \(K\)", and that measurement has
	a fence — now a surface, since we are in three dimensions: a <dfn>Seifert surface</dfn>, an oriented surface whose
	boundary is the knot. For the unknot it is simply a disk, and the linking number of a loop is the signed number
	of times it pierces the disk.
</p>

<Figure num="4.6.7" title="Loops around a knot" hint="Drag to rotate · choose the knot and the loop · slide the loop">
	<KnotLink />
	{#snippet caption()}
		The complement of any knot has \(H_1\cong\Z\), generated by a meridian \(m\). The class of a loop is its linking
		number with the knot, computed here by the Gauss linking integral: \(1\) for a meridian, \(2\) for a loop going
		twice around the strand, \(0\) for a loop that does not link. For the unknot, the glassy disk is a fence for the
		class "linking number": the signed piercings agree with the integral.
	{/snippet}
</Figure>

<Warning title="Homology cannot tell knots apart">
	<p>
		Alexander duality cuts both ways: since \(H_*(S^3\setminus K)\) is the same for every knot, homology alone cannot
		distinguish a trefoil from an unknot. Knot theorists use finer invariants — the fundamental group of the
		complement (the "knot group"), and polynomial invariants descended from Alexander's own 1928 polynomial.
	</p>
</Warning>

<Intuition title="Why the dimensions add up to n − 1">
	<p>
		In Alexander duality the degrees \(i\) and \(n-i-1\) add up to \(n-1\), not \(n\). Picture a knot in 3-space: the
		knot is 1-dimensional, and the loop that detects it is also 1-dimensional; \(1+1=2=3-1\). The missing
		dimension is the "linking" direction: a loop and a knot can link in \(\R^3\) precisely because their dimensions
		add up to one less than the dimension of the space — the same reason two points can be "linked" on a circle (they
		cut it into two arcs) and two circles can link in space.
	</p>
</Intuition>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="A mystery 3-manifold">
	<p>
		A closed orientable 3-manifold is connected and has \(b_1=2\). What are \(b_0,b_2,b_3\) and \(\chi\)?
	</p>
	{#snippet solution()}
		<p>
			Connected gives \(b_0=1\), and duality gives \(b_3=b_0=1\) and \(b_2=b_1=2\). So the Betti numbers are \(1,2,2,1\) and
			\(\chi = 1-2+2-1=0\), as it must be in odd dimension.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Duals of the Platonic solids">
	<p>
		The surface of a cube has \(8\) vertices, \(12\) edges and \(6\) square faces. Describe its dual cell decomposition:
		how many dual vertices, edges and faces, and what do the dual faces look like? What is the dual of the
		tetrahedron?
	</p>
	{#snippet solution()}
		<p>
			Dual vertices \(=6\) (one per square), dual edges \(=12\), dual faces \(=8\) (one per vertex); each vertex of the
			cube touches three squares, so each dual face is a triangle — the dual of the cube is the octahedron. The
			tetrahedron (\(4,6,4\)) is its own dual: each vertex touches three triangles. The duality construction works the
			same with squares as with triangles.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Intersections on the torus">
	<p>
		Compute \((1,2)\cdot(3,1)\) and \((3,1)\cdot(1,2)\). Show that \((p,q)\cdot(p,q)=0\) for every class, both from the
		formula and by a picture.
	</p>
	{#snippet solution()}
		<p>
			\((1,2)\cdot(3,1) = 1\cdot1-3\cdot2 = -5\), and \((3,1)\cdot(1,2)=3\cdot2-1\cdot1 = 5\). The formula gives
			\(pq-pq=0\). In a picture, a straight \((p,q)\) curve and a parallel copy of it (the same line moved sideways) never
			meet.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Is the Klein bottle a counterexample?">
	<p>
		The Klein bottle has rational Betti numbers \(1,1,0\). Explain why this does not contradict Poincaré duality, and
		check the \(\Z/2\) version of the theorem for it.
	</p>
	{#snippet solution()}
		<p>
			The integral and rational versions of the theorem require an orientable manifold, and the Klein bottle is not
			orientable. The \(\Z/2\) version applies to every closed manifold: the mod-2 Betti numbers are \(1,2,1\), and indeed
			\(H^k(K;\Z/2)\cong H_{2-k}(K;\Z/2)\) — \(\Z/2,\ (\Z/2)^2,\ \Z/2\) read the same backwards.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Why χ = 0 in odd dimensions">
	<p>
		Write out the cancellation in \(\chi=\sum_k(-1)^kb_k\) for a closed 5-manifold. Why does the argument fail for a
		closed 4-manifold, and what is \(\chi(\CP^2)\)?
	</p>
	{#snippet solution()}
		<p>
			For \(n=5\): \(\chi = (b_0-b_5) - (b_1-b_4) + (b_2-b_3) = 0\), each bracket vanishing by duality. For \(n=4\) the terms
			for \(k\) and \(4-k\) have the <em>same</em> sign, so they add instead of cancelling, and the middle term \(b_2\) has no
			partner. For \(\CP^2\), \(\chi=1-0+1-0+1=3\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Two circles in space">
	<p>
		Use Alexander duality to compute the reduced homology of the complement of two disjoint circles \(K\) in \(S^3\)
		(linked or not). Interpret each group.
	</p>
	{#snippet solution()}
		<p>
			Here \(n=3\), so \(\tilde H_i(S^3\setminus K)\cong\tilde H^{2-i}(K)\). The space \(K\) has two components, so
			\(\tilde H^0(K)=\Z\), and \(H^1(K)=\Z^2\). Hence \(\tilde H_0=\tilde H^2(K)=0\) (the complement is connected),
			\(H_1=H^1(K)=\Z^2\) (one meridian around each circle), and \(H_2=\tilde H^0(K)=\Z\) (a sphere enclosing one circle
			but not the other). Notice the answer is the same whether the circles are linked or not.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Forms that tell 4-manifolds apart">
	<p>
		The manifolds \(S^2\times S^2\) and \(\CP^2\#\overline{\CP^2}\) (the <Term t="connected-sum">connected sum</Term> of \(\CP^2\) and its mirror image)
		both have Betti numbers \(1,0,2,0,1\). Their intersection forms are \(\left(\begin{smallmatrix}0&1\\1&0\end{smallmatrix}\right)\)
		and \(\left(\begin{smallmatrix}1&0\\0&-1\end{smallmatrix}\right)\). Show that no change of basis turns one form into
		the other, and conclude that the two manifolds are not <Term t="homotopy-equivalence">homotopy equivalent</Term>.
	</p>
	{#snippet hint()}
		<p>Look at the numbers \(Q(x,x)\) for integer vectors \(x\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			For the first form, \(Q(x,x) = 2x_1x_2\) is always even. For the second, \(Q((1,0),(1,0)) = 1\) is odd. A change of
			basis over \(\Z\) replaces \(x\) by another integer vector but does not change the set of values \(Q(x,x)\), so an
			"even" form cannot become an "odd" one. A homotopy equivalence would induce an isomorphism of cohomology rings
			preserving the fundamental class up to sign, hence an equivalence of the forms up to sign — and \(-Q\) is even exactly
			when \(Q\) is. So the manifolds are not homotopy equivalent. (Both forms have signature \(0\); evenness is what tells
			them apart.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Lefschetz duality on the annulus">
	<p>
		Let \(A\) be an annulus. Compute \(H_1(A)\), \(H^1(A,\partial A)\), \(H^1(A)\) and \(H_1(A,\partial A)\) from Lefschetz duality and
		the fact that \(A\) <Term t="deformation-retraction">deformation retracts</Term> onto a circle. Describe a generator of each by a picture.
	</p>
	{#snippet solution()}
		<p>
			\(A\simeq S^1\), so \(H_1(A)=\Z\) (the core circle) and \(H^1(A)=\Z\) (the measurement counting how often you go
			around, whose fence is a radial rung). Lefschetz duality with \(n=2\) gives \(H^1(A,\partial A)\cong H_1(A)=\Z\),
			generated by a fence that avoids the rim — a circle parallel to the core, which every rim-to-rim path crosses once —
			and \(H_1(A,\partial A)\cong H^1(A)=\Z\), generated by the rung read as a path from the inner rim to the outer rim. This is
			Figure 4.6.6.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A closed orientable \(n\)-manifold has a fundamental class \([M]\in H_n(M;\Z)\cong\Z\): all top simplices, coherently
			oriented. Every closed manifold has one mod 2.
		</li>
		<li>
			The dual cell decomposition trades each \(k\)-simplex for an \((n-k)\)-cell that crosses it once; it reverses the face
			relation and turns coboundary maps into boundary maps (up to sign).
		</li>
		<li>
			Poincaré duality: \(H^k(M;\Z)\cong H_{n-k}(M;\Z)\) for closed orientable \(M\), and \(H^k(M;\Z/2)\cong H_{n-k}(M;\Z/2)\) for
			every closed \(M\). The map is the cap product with the fundamental class, \(D(\varphi)=[M]\frown\varphi\).
		</li>
		<li>
			Consequences: \(b_k=b_{n-k}\); \(H_n\cong\Z\); \(\chi(M)=0\) in odd dimensions; torsion pairs up in complementary degrees.
		</li>
		<li>
			On a surface, the Poincaré dual of a loop is its fence; intersection numbers count signed crossings, and
			\(\ip{\mathrm{PD}[C_1]\smile\mathrm{PD}[C_2]}{[M]}=C_1\cdot C_2\). On the torus, \((p_1,q_1)\cdot(p_2,q_2)=p_1q_2-p_2q_1\).
		</li>
		<li>
			In dimension \(4\), the cup product on \(H^2\) is the intersection form; its rank, signature and parity are powerful
			invariants of 4-manifolds.
		</li>
		<li>
			Lefschetz duality handles boundaries (\(H^k(M,\partial M)\cong H_{n-k}(M)\)); Alexander duality handles complements
			(\(\tilde H_i(S^n\setminus K)\cong\tilde H^{n-i-1}(K)\)) — every knot complement has \(H_1\cong\Z\), generated by a meridian,
			and the class of a loop is its linking number.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
