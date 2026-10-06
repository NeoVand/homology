<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
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
	import CoverNerve from '$lib/figures/cohomology/sheaves/CoverNerve.svelte';
	import CechCircle from '$lib/figures/cohomology/sheaves/CechCircle.svelte';
	import RestrictionMaps from '$lib/figures/cohomology/sheaves/RestrictionMaps.svelte';
	import BoundedGluing from '$lib/figures/cohomology/sheaves/BoundedGluing.svelte';
	import BranchSurface from '$lib/figures/cohomology/sheaves/BranchSurface.svelte';
	import MobiusOrientation from '$lib/figures/cohomology/sheaves/MobiusOrientation.svelte';
	import TribarCocycle from '$lib/figures/cohomology/sheaves/TribarCocycle.svelte';
	import TribarEye from '$lib/figures/cohomology/sheaves/TribarEye.svelte';
	import GraphSheaf from '$lib/figures/cohomology/sheaves/GraphSheaf.svelte';

	const reading = [
		{
			title: 'Sheaf Theory through Examples',
			author: 'Daniel Rosiak (MIT Press, 2022)',
			url: 'https://direct.mit.edu/books/oa-monograph/5460/Sheaf-Theory-through-Examples',
			note: 'The gentlest book-length introduction: sheaves met through colourings, data, chess and music before any formalism. Open access.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Sheaves, Cosheaves and Applications',
			author: 'Justin Curry (PhD thesis, 2014)',
			url: 'https://arxiv.org/abs/1303.3255',
			note: 'Where cellular sheaves on graphs and cell complexes are developed as a computational tool for data, networks and sensors. Graduate level, but the early chapters are very readable.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Toward a Spectral Theory of Cellular Sheaves',
			author: 'Jakob Hansen and Robert Ghrist (J. Appl. Comput. Topology, 2019)',
			url: 'https://arxiv.org/abs/1808.01513',
			note: 'Clean definitions of cellular sheaves, the sheaf Laplacian, and the heat flow that settles on global sections — the mathematics behind the currency figure.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Elementary Applied Topology',
			author: 'Robert Ghrist (2014)',
			note: 'Chapter 9 is a lively, picture-rich tour of cellular sheaves and their cohomology with applications to networks, flows and sensing; chapter 5 covers nerves and coverage.',
			kind: 'book' as const
		},
		{
			title: 'Coverage in sensor networks via persistent homology',
			author: 'Vin de Silva and Robert Ghrist (Algebr. Geom. Topol. 7, 2007)',
			url: 'https://doi.org/10.2140/agt.2007.7.339',
			note: 'How to certify that a region is covered by sensors using only who-can-hear-whom information — nerves and homology at work.',
			kind: 'paper' as const
		},
		{
			title: 'On the Cohomology of Impossible Figures',
			author: 'Roger Penrose (Structural Topology 17, 1991; reprinted in Leonardo 25, 1992)',
			url: 'https://doi.org/10.2307/1575844',
			note: 'Penrose’s own short paper: impossible figures as Čech cohomology classes with coefficients in the positive reals.',
			kind: 'paper' as const
		},
		{
			title: 'The Topology of Impossible Spaces',
			author: 'Tony Phillips (AMS Feature Column, October 2014)',
			url: 'https://www.ams.org/publicoutreach/feature-column/fc-2014-10',
			note: 'A careful, illustrated walk through Penrose’s argument with the distance ratios d₁₂, d₂₃, d₃₁. (The column prints the year of Penrose’s paper as 1961; it is 1991.)',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Obstructions to Reality: Torsors & Visual Paradox',
			author: 'Robert Ghrist and Zoe Cooperband (2025)',
			url: 'https://arxiv.org/abs/2507.01226',
			note: 'A gallery of impossible staircases on cylinders, Möbius bands, tori and Klein bottles, classified by sheaf cohomology.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring Tu (Springer GTM 82, 1982)',
			url: 'https://doi.org/10.1007/978-1-4757-3951-0',
			note: 'The classic route from good covers and the Čech–de Rham complex to de Rham’s theorem and characteristic classes. First-year graduate level; chapter II is the reference for this chapter.',
			kind: 'book' as const
		},
		{
			title: 'Contextuality, Cohomology and Paradox',
			author: 'Samson Abramsky, Rui Soares Barbosa, Kohei Kishida, Raymond Lal, Shane Mansfield (2015)',
			url: 'https://arxiv.org/abs/1502.03097',
			note: 'For the adventurous: the same local-to-global obstructions detect “contextuality” in quantum mechanics and logical paradoxes.',
			kind: 'paper' as const,
			free: true
		}
	];
</script>

<Epigraph author="Robert Ghrist and Zoe Cooperband" source="Obstructions to Reality: Torsors &amp; Visual Paradox (2025)"
	>Visual paradoxes like the Penrose staircase present a fundamental tension: locally coherent geometric relationships that
	cannot be realized globally.</Epigraph
>

<p class="lead">
	An atlas of the Earth is a book of flat maps. Every page is perfectly trustworthy, and where two pages overlap they agree.
	Yet no single flat page can show the whole globe without tearing or stretching it. Local truth, global impossibility.
</p>

<p>
	This tension between <em>local</em> and <em>global</em> has followed us through the whole of Part IV. In <Ref
		to="cohomology/cochains"
	/> an impossible staircase was a set of step heights that looked fine around every corner but could not come from any
	actual height. In <Ref to="cohomology/de-rham" /> the angle around the origin was a perfectly good function near every
	point of the punctured plane but not on the plane as a whole. Both times, cohomology measured exactly how the local
	pieces failed to fit together. This chapter turns that theme into a definition. We will learn to describe a space by
	how it is <em>covered</em> by small pieces, to describe data by how it lives on those pieces, and to compute — with
	nothing but the overlaps — whether the pieces can be glued.
</p>

<Ahead>
	<p>
		Three tools come out of this chapter. <strong>Nerves</strong> turn a cover of a space into a simplicial complex with
		the same holes, which is how sensor networks detect gaps in coverage and how persistent homology (<Ref
			to="homology/persistence"
		/>) builds shapes from data. <strong>Čech cohomology</strong> computes the cohomology groups you already know using
		only overlaps. <strong>Sheaves</strong> let the coefficients change from place to place, so that cohomology can
		measure the failure of square roots, orientations, depth readings or currency prices to glue. In the next chapter (<Ref
			to="cohomology/characteristic-classes"
		/>) the same Čech cocycles, now with values in groups such as \(\{\pm 1\}\) and the circle of phases, classify twisted
		families of vector spaces — from the Möbius band to the magnetic monopole.
	</p>
</Ahead>

<h2 id="local-and-global">Local pieces, global questions</h2>

<p>
	Imagine a circular ridge trail around a crater lake, and three hikers who split it between them. Each carries an
	altimeter that has not been calibrated: it measures heights correctly, but from its own arbitrary zero. So each hiker
	can draw a perfect height profile of her own stretch of trail, but her numbers mean “metres above <em>my</em> zero”.
</p>

<p>
	Their stretches overlap a little, so on each shared bit of trail two hikers can compare readings. “On our common stretch
	your numbers are always 40 higher than mine.” Since both altimeters measure differences correctly, the offset between
	two readings is the same all along a shared stretch: it is a single number per overlap. Now the question:
</p>

<Question>
	<p>
		Can the three hikers agree on <em>one</em> zero — that is, can they shift their readings so that all three profiles
		join into a single, consistent height map of the whole ring?
	</p>
</Question>

<p>
	If the three offsets add up to zero as you go around the ring, yes: fix one hiker’s zero and the other two are forced.
	If they do not add up to zero, no shifting can ever make the readings consistent; the trail would be an Escher staircase,
	climbing forever and yet returning to its start. You met exactly this test in <Ref to="cohomology/cochains" />: a labelling
	of the edges of a loop is a gradient exactly when its sum around the loop is zero.
</p>

<p>The example has three ingredients, and each will get its own section.</p>

<ol>
	<li>
		<strong>A space covered by overlapping pieces</strong> — the ring, covered by three stretches of trail. This is an
		<em>open cover</em>, and the pattern of overlaps is recorded by its <em>nerve</em>.
	</li>
	<li>
		<strong>Data on the pieces, with a rule for comparing data on overlaps</strong> — height profiles that can be cut down
		to smaller stretches. This is a <em>sheaf</em>.
	</li>
	<li>
		<strong>Bookkeeping that decides whether local data assemble into global data</strong> — the offsets and their sum
		around the ring. This is <em>Čech cohomology</em>.
	</li>
</ol>

<KeyIdea>
	<p>
		Cohomology measures the failure of local solutions to glue into a global one. Zero means “everything glues”; a nonzero
		class is a precise, computable certificate that it cannot.
	</p>
</KeyIdea>

<h2 id="covers-and-nerves">Covers and their nerves</h2>

<h3>Open covers</h3>

<p>
	Recall from <Ref to="topology/spaces" /> that the <Term t="open-set">open sets</Term> of a space are the sets that contain
	a little elbow room around each of their points: an open interval of the line, an open disk in the plane, an open arc of
	a circle (an arc without its two endpoints). Open sets are the natural “pieces” of a space because they have no hard
	edges; two of them can overlap in a set that is again open.
</p>

<Definition title="Open cover" id="def-open-cover">
	<p>
		An <dfn>open cover</dfn> of a space \(X\) is a family \(\mathcal U = \{U_i\}_{i \in I}\) of open subsets of \(X\)
		whose union is all of \(X\): every point lies in at least one \(U_i\). The sets \(U_i\) are the <em>pieces</em> of the
		cover; \(I\) is just a set of labels, usually \(\{0, 1, \dots, n\}\).
	</p>
</Definition>

<Notation>
	<p>
		We shorten intersections by stringing indices together:
		\[ U_{ij} = U_i \cap U_j, \qquad U_{ijk} = U_i \cap U_j \cap U_k, \]
		and in general \(U_{i_0 i_1 \cdots i_p} = U_{i_0}\cap U_{i_1}\cap\cdots\cap U_{i_p}\). Read \(U_{ij}\) aloud as
		“U i j, the overlap of \(U_i\) and \(U_j\)”.
	</p>
</Notation>

<p>Some covers we will use again and again:</p>
<ul>
	<li>
		The circle covered by <strong>three open arcs</strong>, each a bit more than a third of the circle, so that
		neighbouring arcs overlap in a short arc and no point lies in all three.
	</li>
	<li>
		The sphere covered by <strong>two caps</strong>: everything except the south pole, and everything except the north
		pole. They overlap in a wide band around the equator.
	</li>
	<li>
		A region of the plane covered by <strong>disks</strong> — think of the ranges of radio sensors scattered over a field.
	</li>
	<li>
		A manifold covered by the domains of its <Term t="chart">charts</Term> (<Ref to="topology/manifolds" />): an atlas is
		an open cover with a coordinate system on each piece.
	</li>
</ul>

<h3>The nerve</h3>

<p>
	A cover is a lot of information. Here is a way to throw almost all of it away and keep only the <em>pattern of
	overlaps</em>. Draw one dot for each piece. Join two dots by an edge if the two pieces overlap. Fill in a triangle
	whenever three pieces have a point in common, a solid tetrahedron whenever four do, and so on.
</p>

<Definition title="Nerve of a cover" id="def-nerve">
	<p>
		The <dfn>nerve</dfn> \(N(\mathcal U)\) of a cover \(\mathcal U = \{U_i\}_{i\in I}\) is the <Term
			t="abstract-simplicial-complex">abstract simplicial complex</Term
		> whose vertices are the labels \(i \in I\), and in which a set of labels \(\{i_0, \dots, i_p\}\) spans a
		\(p\)-simplex exactly when
		\[ U_{i_0 i_1 \cdots i_p} = U_{i_0}\cap U_{i_1} \cap\cdots\cap U_{i_p} \neq \varnothing. \]
	</p>
</Definition>

<p>
	Why is this a simplicial complex (<Ref to="topology/simplicial-complexes" />)? The one rule to check is that every face
	of a simplex is again a simplex. If some point lies in all of \(U_{i_0}, \dots, U_{i_p}\), it certainly lies in any
	smaller selection of them; so every subset of a simplex spans a simplex. That is all.
</p>

<Example title="Nerves of familiar covers">
	<p>
		<strong>Three arcs on a circle.</strong> Each pair overlaps, but no point lies in all three. So the nerve has three
		vertices, three edges, and no triangle: a hollow triangle — which is a circle!
	</p>
	<p>
		<strong>Two caps on a sphere.</strong> Two vertices, joined by one edge (the caps overlap). That nerve is a segment,
		which has no holes at all. Hold on to your suspicion: we will see in a moment what went wrong.
	</p>
	<p>
		<strong>Three disks with a common point.</strong> Three vertices, three edges and a filled triangle: a solid triangle,
		with no holes.
	</p>
</Example>

<Figure num="4.7.1" title="A cover and its nerve" hint="Drag the disks · change their range · add or remove sensors">
	<CoverNerve />
	{#snippet caption()}
		Each disk is a piece of the cover. The nerve is drawn on top: a gold dot for each disk, an edge for each overlap, and a
		shaded triangle for each triple overlap. Rose regions are holes in the covered area. Move the disks: every time a hole
		opens or closes, \(b_1\) of the nerve changes with it.
	{/snippet}
</Figure>

<p>
	Play with the figure. Pull one disk out of the ring and the hole opens out to the outside: the cycle of edges breaks
	and \(b_1\) drops to zero. Push the disks together until three of them share a point and a gold triangle appears, filling
	in a little loop of the nerve before it can be counted as a hole. In the readout, the number of holes is computed directly
	from the shape of the covered region, and \(b_1\) from the nerve alone. They always agree. That is no accident.
</p>

<h3>The nerve theorem</h3>

<p>
	For the agreement to be guaranteed, the pieces and their overlaps must themselves have no holes. Recall from <Ref
		to="topology/homotopy"
	/> that a space is <Term t="contractible">contractible</Term> if it can be shrunk continuously to a point: disks, intervals,
	arcs and convex sets are contractible; circles, annuli and spheres are not.
</p>

<Definition title="Good cover" id="def-good-cover">
	<p>
		An open cover is <dfn>good</dfn> if every nonempty finite intersection \(U_{i_0\cdots i_p}\) of its pieces is
		contractible. (Bott and Tu’s book, the standard reference, asks a little more for covers of manifolds: every
		nonempty finite intersection should look like a copy of \(\R^n\). For our purposes contractible is what matters.)
	</p>
</Definition>

<Theorem label="Theorem (the nerve theorem)" id="thm-nerve">
	<p>
		If \(\mathcal U\) is a good open cover of a reasonable space \(X\) — a manifold, a simplicial complex, or a subset of
		\(\R^n\) covered by finitely many open sets — then the nerve \(N(\mathcal U)\) is <Term t="homotopy-equivalence"
			>homotopy equivalent</Term
		> to \(X\). In particular \(N(\mathcal U)\) and \(X\) have the same homology and cohomology groups.
	</p>
</Theorem>

<p>
	We will not prove it; versions of it go back to Jean Leray and to Karol Borsuk (1948). But the idea is easy to believe.
	If every piece and every overlap is a featureless blob, then the only way the space can have a hole is for the pieces to
	be arranged <em>around</em> it — and the arrangement is precisely what the nerve records. You already met the theorem in
	<Ref to="homology/persistence" />: the Čech complex of a point cloud is the nerve of the disks around the points, and
	disks are convex, so every intersection of disks is convex and therefore contractible.
</p>

<Warning title="The hypothesis matters">
	<p>
		For the two caps on the sphere, the overlap is a band around the equator, which contains a loop that cannot be shrunk:
		the cover is not good. Its nerve is a segment — contractible — while the sphere is not. The theorem says nothing here,
		and indeed it would be wrong. A good cover of the sphere needs more pieces: thicken the four faces of a tetrahedron
		drawn on the sphere. Any three of them meet near a corner, but no point is near all four faces, so the nerve is the
		hollow tetrahedron — a sphere, as it should be (Exercise 2).
	</p>
</Warning>

<h3>Holes in sensor networks</h3>

<p>
	Scatter cheap radio sensors over a field. Each one can detect intruders within some range, a disk around itself, and
	can talk to the sensors whose disks overlap its own. Nobody knows where the sensors are. Can the network decide, from who
	can talk to whom, whether there is a hole in its coverage — a pocket where an intruder could hide?
</p>

<p>
	The nerve theorem says that the information needed is exactly the nerve: record which pairs of disks overlap and which
	triples share a point, compute \(b_1\) of the resulting simplicial complex, and you know how many holes the covered region
	has — without knowing a single position. In practice sensors cannot easily tell whether <em>three</em> of them share a
	point; they only know pairs. Vin de Silva and Robert Ghrist showed in 2007 how to certify coverage of a whole region from
	pairwise information alone, using the homology of a related complex (the Vietoris–Rips complex of <Ref
		to="homology/persistence"
	/>) together with a little extra knowledge about the sensors along the border of the region.
</p>

<h2 id="cech-cohomology">Čech cohomology: bookkeeping on overlaps</h2>

<p>
	The nerve keeps the <em>shape</em> of a cover. Now we attach <em>numbers</em> to it, exactly as cochains attached numbers
	to the simplices of a complex in <Ref to="cohomology/cochains" />. The new point of view is that the numbers live on the
	pieces of the space and on their overlaps.
</p>

<h3>Back to the hikers</h3>

<p>
	Cover the ring trail \(X = S^1\) by three open arcs \(U_0, U_1, U_2\), the stretches of the three hikers. Fix a group of
	values \(G\) — the real numbers \(\R\), or the integers \(\Z\). Hiker \(i\) shifts her readings by some amount
	\(f_i \in G\) (moving her zero). On the overlap \(U_{ij}\) of two stretches, with \(i \lt j\), let \(c_{ij}\) be the
	offset: how much higher hiker \(j\)’s zero sits than hiker \(i\)’s. Shifting the zeros by \(f\) removes the offsets
	exactly when
	\[ c_{ij} = f_j - f_i \quad\text{on every overlap } U_{ij}. \]
	That is a system of three equations in three unknowns — and a familiar one.
</p>

<Definition title="Čech cochains and coboundary (constant coefficients)" id="def-cech">
	<p>
		Let \(\mathcal U = \{U_0, \dots, U_n\}\) be an open cover of \(X\) and \(G\) an abelian group. A <dfn
			>Čech \(0\)-cochain</dfn
		> assigns an element \(f_i \in G\) to each piece; a <dfn>Čech \(1\)-cochain</dfn> assigns an element \(c_{ij}\in G\) to
		each overlap \(U_{ij}\) with \(i \lt j\); a <dfn>Čech \(2\)-cochain</dfn> assigns an element \(a_{ijk}\) to each triple
		overlap with \(i \lt j \lt k\); and so on. They form groups \(\check C^0(\mathcal U;G)\), \(\check C^1(\mathcal U;G)\)
		and so on. The <dfn>Čech coboundary</dfn> \(\delta\) is
		\[ (\delta f)_{ij} = f_j - f_i, \qquad (\delta c)_{ijk} = c_{jk} - c_{ik} + c_{ij}, \]
		and in general \((\delta c)_{i_0\cdots i_{p+1}} = \sum_{k=0}^{p+1} (-1)^k\, c_{i_0 \cdots \widehat{i_k} \cdots
		i_{p+1}}\), where the hat means “leave this index out”.
	</p>
</Definition>

<p>
	Look closely: these are word for word the formulas for simplicial cochains on the nerve (<Ref
		to="cohomology/cohomology-groups"
	/>), with “piece” for “vertex”, “overlap” for “edge”, and “triple overlap” for “triangle”. In particular
	\(\delta\circ\delta = 0\): for instance
	\[ (\delta\delta f)_{ijk} = (f_k - f_j) - (f_k - f_i) + (f_j - f_i) = 0. \]
	So we may take cohomology, cocycles modulo coboundaries, just as before.
</p>

<Definition title="Čech cohomology of a cover">
	<p>
		The <dfn>Čech cohomology</dfn> of the cover is
		\[ \check H^p(\mathcal U; G) = \frac{\ker\big(\delta\colon \check C^p \to \check C^{p+1}\big)}{\im\big(\delta\colon
		\check C^{p-1} \to \check C^{p}\big)}. \]
		The little accent on \(\check H\) (a háček, an upside-down hat) is read “Čech”, after the Czech mathematician Eduard
		Čech.
	</p>
</Definition>

<p>
	What do the first two groups say? A \(0\)-cochain \(f\) is a <em>cocycle</em> when \(\delta f = 0\), that is \(f_i =
	f_j\) on every overlap: the local numbers agree wherever they can be compared. A \(1\)-cochain \(c\) is a <em>coboundary</em>
	when \(c = \delta f\): the offsets come from shifting local zeros. And a \(1\)-cochain is a <em>cocycle</em> when
	\(c_{ik} = c_{ij} + c_{jk}\) on every triple overlap — the offsets are consistent wherever three pieces meet, which is
	the least we could ask of honest data.
</p>

<Figure num="4.7.2" title="Čech cohomology of the circle" hint="Use − and + to set the offsets · switch between three and two arcs">
	<CechCircle />
	{#snippet caption()}
		Three arcs cover the circle; the gold arcs are their overlaps, labelled with the offsets \(c_{ij}\). On the right, the
		nerve: the figure tries \(f_0 = 0\), \(f_1 = c_{01}\), \(f_2 = c_{02}\), which fixes two overlaps, and checks the
		third. The loop glows green when the offsets come from a global zero and rose when a class survives in
		\(\check H^1\). Switch to two arcs to see the overlap fall apart into two pieces.
	{/snippet}
</Figure>

<h3>The circle, computed</h3>

<p>
	For the three arcs there are no triple overlaps, so \(\check C^2 = 0\) and every \(1\)-cochain is automatically a cocycle.
	Order the overlaps as \(U_{01}, U_{02}, U_{12}\). Then \(\delta\colon G^3 \to G^3\) is the matrix
	\[ \delta = \begin{pmatrix} -1 & 1 & 0 \\ -1 & 0 & 1 \\ 0 & -1 & 1 \end{pmatrix}, \qquad \delta\begin{pmatrix} f_0 \\
	f_1 \\ f_2\end{pmatrix} = \begin{pmatrix} f_1 - f_0 \\ f_2 - f_0 \\ f_2 - f_1\end{pmatrix}. \]
</p>

<ul>
	<li>
		<strong>\(\check H^0\).</strong> The cocycles are the \(f\) with \(f_0 = f_1 = f_2\): the constant choices. So
		\(\check H^0(\mathcal U; G) \cong G\) — one free choice, because the circle is connected.
	</li>
	<li>
		<strong>\(\check H^1\).</strong> Define the <em>loop test</em>, or <dfn>holonomy</dfn>, of a \(1\)-cochain:
		\[ h(c) = \cyc{c_{01} + c_{12} - c_{02}}. \]
		It is the total offset accumulated by walking once around the circle (the minus sign because \(U_{02}\) is crossed
		from \(2\) back to \(0\)). For a coboundary, \(h(\delta f) = (f_1 - f_0) + (f_2 - f_1) - (f_2 - f_0) = 0\).
		Conversely, if \(h(c) = 0\), then \(f = (0, c_{01}, c_{02})\) satisfies \(\delta f = c\). So the coboundaries are
		exactly the cochains with zero holonomy, and \(h\) gives an isomorphism
		\[ \check H^1(\mathcal U; G) = G^3/\im\delta \;\xrightarrow{\;\cong\;}\; G, \qquad [c] \mapsto c_{01} + c_{12} -
		c_{02}. \]
	</li>
</ul>

<p>
	These are \(H^0(S^1;G) = G\) and \(H^1(S^1;G) = G\), the cohomology of the circle from <Ref
		to="cohomology/cohomology-groups"
	/>. And the matrix is the very one you met there for the hollow triangle — of course: the nerve <em>is</em> a hollow
	triangle. This is the nerve theorem doing its job.
</p>

<Theorem label="Theorem (Čech = simplicial, for good covers)">
	<p>
		If \(\mathcal U\) is a good cover of \(X\), then \(\check H^p(\mathcal U;G)\) is the simplicial cohomology of the nerve,
		and therefore (by the nerve theorem) it is the cohomology \(H^p(X;G)\) you already know.
	</p>
</Theorem>

<h3>Two arcs: a cautionary tale</h3>

<p>
	Why not cover the circle with just <em>two</em> arcs, \(U\) (the top, a bit more than half) and \(V\) (the bottom)? Look
	at the overlap: \(U\cap V\) is not one arc but <em>two</em>, one on the left and one on the right. Call them \(W_1\) and
	\(W_2\). The nerve has only two vertices and one edge, and a segment has no holes; if we trusted it, we would conclude
	that \(\check H^1 = 0\). Wrong!
</p>

<p>
	The repair is to remember what a \(1\)-cochain really is: <em>data on the overlap</em>. An offset is a constant on each
	connected stretch of overlap, and the two stretches \(W_1\) and \(W_2\) are free to carry different offsets
	\(c_1, c_2\). So \(\check C^1 = G^2\), not \(G\), and
	\[ \delta(f_U, f_V) = (f_V - f_U,\; f_V - f_U). \]
	The image is the diagonal \(\{(a,a)\}\), so \(\check H^0 \cong G\) and \(\check H^1 = G^2/\{(a,a)\} \cong G\) via
	\((c_1, c_2)\mapsto c_2 - c_1\). The correct answer again. Try it in the figure: whenever \(c_{W_1} \neq c_{W_2}\) the
	two hikers’ zeros disagree on one side or the other, however they shift.
</p>

<Warning title="Data on overlaps, not on edges of the nerve">
	<p>
		The Čech complex is built from the actual overlaps, with one copy of \(G\) for each connected piece of each overlap,
		and it gets the right answer for the two-arc cover. The <em>nerve</em> forgets that \(U\cap V\) has two pieces, so it
		gets the wrong shape: the two-arc cover is not good, and the nerve theorem does not apply. Leray’s theorem, below, says
		precisely when a cover’s Čech complex can be trusted.
	</p>
</Warning>

<Remark title="Refinements">
	<p>
		For an arbitrary space there may be no good cover at all, and different covers can give different answers. The Čech
		cohomology \(\check H^p(X;G)\) of the <em>space</em> is defined by passing to finer and finer covers — a limit over
		refinements. For manifolds and simplicial complexes nothing changes after the first good cover, so you may always
		compute with one good cover.
	</p>
</Remark>

<History title="Nerves and Čech">
	<p>
		The nerve of a cover was introduced by Pavel Alexandrov in the late 1920s. In 1932 Eduard Čech used the nerves of finer
		and finer covers to define homology for arbitrary spaces, however wild — spaces that cannot be triangulated at all.
		Cohomology itself would only be invented three years later; the Čech theory we use today is its dual, built on the same
		nerves.
	</p>
</History>

<h2 id="presheaves-and-sheaves">Presheaves and sheaves</h2>

<p>
	So far the data on every piece was a single number. Most interesting data are richer: a height profile on a stretch of
	trail, a temperature field on a region, a solution of a differential equation on an interval, a choice of square root of
	\(z\) near some point. What all of these share is that data on a set can be <em>cut down</em> to data on any smaller set.
</p>

<h3>Data that can be restricted</h3>

<Definition title="Presheaf" id="def-presheaf">
	<p>
		A <dfn>presheaf</dfn> \(F\) on a space \(X\) assigns
	</p>
	<ul>
		<li>to every open set \(U\subseteq X\) a set \(F(U)\), whose elements are called <dfn>sections</dfn> of \(F\) over \(U\);</li>
		<li>
			to every inclusion of open sets \(V \subseteq U\) a <dfn>restriction map</dfn> \(F(U) \to F(V)\), written \(s
			\mapsto s|_V\) (“\(s\) restricted to \(V\)”),
		</li>
	</ul>
	<p>
		such that restricting to the same set does nothing, \(s|_U = s\), and restricting in two steps is the same as
		restricting in one: \((s|_V)|_W = s|_W\) whenever \(W\subseteq V \subseteq U\). When every \(F(U)\) is an abelian group
		and the restrictions are homomorphisms, \(F\) is a presheaf <em>of abelian groups</em>.
	</p>
</Definition>

<Figure num="4.7.3" title="A presheaf in one picture">
	<RestrictionMaps />
	{#snippet caption()}
		Open sets shrink as you go down the page, \(W \subseteq V\subseteq U\); a section \(s\) over \(U\) restricts to sections
		over \(V\) and \(W\). The inclusions point up, the restrictions point down: a presheaf reverses arrows.
	{/snippet}
</Figure>

<p>
	Here is the fourth of the book’s recurring ideas, <strong>reversed arrows</strong>, in its purest form. Sets get smaller
	along inclusions \(W\to V \to U\), but data travels the other way, \(F(U)\to F(V)\to F(W)\). That is the same reversal
	as cochains pulling back along maps, and it is why cohomology, not homology, is the natural home for local data.
</p>

<Example title="Presheaves everywhere">
	<ul>
		<li>
			<strong>Continuous functions.</strong> \(C(U)\) = all continuous real-valued functions on \(U\), restricted in the
			ordinary sense. Likewise smooth functions, or polynomial functions on open subsets of \(\R\).
		</li>
		<li>
			<strong>Solutions of an equation.</strong> \(F(U)\) = the functions \(f\) on \(U\subseteq \R\) with \(f'' + f = 0\).
			The restriction of a solution is a solution.
		</li>
		<li>
			<strong>Locally constant functions.</strong> \(F(U)\) = the functions \(U\to G\) that are constant near every point,
			that is, constant on each connected piece of \(U\). These are the solutions of \(f' = 0\), and they are what
			\(H^0\) counted in <Ref to="cohomology/cochains" />.
		</li>
		<li>
			<strong>Constant functions.</strong> \(F(U)\) = the functions \(U\to G\) that take a single value on all of \(U\).
		</li>
		<li><strong>Bounded functions.</strong> \(F(U)\) = the continuous functions \(f\) on \(U\) with \(|f|\) bounded.</li>
		<li>
			<strong>Square roots.</strong> On open subsets \(U\) of the punctured plane, \(F(U)\) = the continuous functions
			\(g\colon U\to\C\) with \(g(z)^2 = z\) for every \(z\) in \(U\). (More about these soon.)
		</li>
	</ul>
</Example>

<h3>The sheaf axioms</h3>

<p>
	Some of these presheaves are better behaved than others. The good ones are those for which <em>local knowledge is
	enough</em>: a section is determined by its pieces, and compatible pieces can always be assembled.
</p>

<Definition title="Sheaf" id="def-sheaf">
	<p>
		A presheaf \(F\) is a <dfn>sheaf</dfn> if, for every open set \(U\) and every open cover \(\{U_i\}\) of \(U\), the
		following two axioms hold.
	</p>
	<ol>
		<li>
			<strong>Locality.</strong> If two sections \(s, t\in F(U)\) agree on every piece, \(s|_{U_i} = t|_{U_i}\) for all
			\(i\), then \(s = t\).
		</li>
		<li>
			<strong>Gluing.</strong> If sections \(s_i \in F(U_i)\) agree on every overlap,
			\[ s_i|_{U_{ij}} = s_j|_{U_{ij}} \quad \text{for all } i, j, \]
			then there is a section \(s\in F(U)\) with \(s|_{U_i} = s_i\) for every \(i\).
		</li>
	</ol>
	<p>By locality, the glued section \(s\) is unique.</p>
</Definition>

<p>
	Continuous functions form a sheaf. Locality is clear: functions that agree on every piece agree everywhere. For gluing,
	define \(s(x) = s_i(x)\) for any \(i\) with \(x\in U_i\); this does not depend on the choice of \(i\), because the
	pieces agree on overlaps, and \(s\) is continuous because continuity can be checked near each point, where \(s\) is just
	one of the continuous \(s_i\). The same argument works for smooth functions and for solutions of a differential equation,
	because <em>being a solution</em> is also checked point by point. The square roots form a sheaf too, and so do the locally
	constant functions.
</p>

<p>Two presheaves on the list fail.</p>

<ul>
	<li>
		<strong>Bounded functions.</strong> Cover the line by the intervals \(U_n = (n-1, n+1)\) and let \(s_n(x) = x\) on
		\(U_n\). Each \(s_n\) is bounded (by \(|n| + 1\)), and they agree on overlaps. The only function they could glue to is
		\(x\mapsto x\) on the whole line, which is not bounded. Gluing fails.
	</li>
	<li>
		<strong>Constant functions.</strong> Let \(U\) be two disjoint intervals, covered by themselves. The constant \(0\) on
		one and the constant \(1\) on the other agree on the overlap — vacuously, since there is no overlap — but no constant
		function on \(U\) restricts to both. Gluing fails again; the sheafy version is “locally constant”.
	</li>
</ul>

<Figure num="4.7.4" title="Bounded, versus bounded by 1" hint="Add pieces · switch the property">
	<BoundedGluing />
	{#snippet caption()}
		The line is covered by overlapping intervals \(U_n\). Each piece of \(x\mapsto x\) is bounded, but the bound grows with
		the piece and the glued function is unbounded. A bound fixed in advance, such as \(|f|\le 1\), can be checked point by
		point, so it survives gluing.
	{/snippet}
</Figure>

<Intuition title="A sheafy property is a local one">
	<p>
		Ask of any property: <em>can I check it by looking near each point separately?</em> Continuity, differentiability,
		“satisfies this differential equation”, “\(|f|\le 1\)”, “is a square root of \(z\)” — yes, and the corresponding
		presheaves are sheaves. Boundedness, “is constant”, “integrates to zero over \(U\)” — no, and gluing fails. A sheaf is
		the mathematical shape of <em>data whose correctness is local</em>.
	</p>
</Intuition>

<h3>Sections and global sections</h3>

<p>
	The word <em>section</em> comes from a picture you will see properly in <Ref to="cohomology/characteristic-classes" />:
	above each point of \(X\) stands a “stalk” of possible values, and a section over \(U\) slices through the stalks above
	\(U\), picking one value above each point. (The French word Leray chose, <em>faisceau</em>, is a sheaf of wheat: a bundle
	of stalks tied together.)
</p>

<Definition title="Global sections">
	<p>
		A <dfn>global section</dfn> of \(F\) is a section over the whole space, an element of \(F(X)\). The set of global
		sections is also written \(\Gamma(X;F)\).
	</p>
</Definition>

<p>
	The sheaf axioms say something sharp in the language of Čech cochains. With a presheaf \(F\) in place of the constant
	group \(G\), a Čech \(0\)-cochain is a family of local sections \(s_i\in F(U_i)\), and \(\delta s = 0\) says that they
	agree on all overlaps. Locality and gluing say that such families correspond exactly to global sections:
</p>

<KeyIdea>
	<p>For a sheaf \(F\) and any open cover \(\mathcal U\) of \(X\),</p>
	<p>
		\[ \check H^0(\mathcal U; F) = \Gamma(X; F) = F(X). \]
	</p>
	<p>
		Zeroth cohomology <em>is</em> the space of global solutions. The interesting question is what \(\check H^1\) records
		when global solutions do not exist.
	</p>
</KeyIdea>

<h2 id="when-gluing-fails">When local solutions refuse to glue</h2>

<p>
	A sheaf guarantees that <em>compatible</em> local sections glue. Very often, though, we can find local sections
	everywhere and yet cannot make them compatible. Here are three classic cases, and the cohomology class that measures each
	failure.
</p>

<h3>Square roots and logarithms</h3>

<p>
	A complex number \(z\neq 0\) can be written in polar form as \(z = r e^{i\theta}\): \(r \gt 0\) is its distance from
	\(0\) and \(\theta\) the angle it makes with the positive real axis. Multiplying complex numbers multiplies distances and
	adds angles, so \(z\) has exactly two square roots,
	\[ \pm\sqrt{r}\, e^{i\theta/2}. \]
	On a small disk away from \(0\) we can choose one of them continuously — say the one with positive real part near
	\(z = 1\). So the sheaf of square roots has sections over every small disk: two of them, \(g\) and \(-g\).
</p>

<p>
	Now walk once around the origin, following your chosen root continuously. The angle \(\theta\) grows from \(0\) to
	\(2\pi\), so \(\theta/2\) grows from \(0\) to \(\pi\): you come back to the same point \(z\) holding \(\sqrt r e^{i\pi} =
	-\sqrt r\), the <em>other</em> square root. Walk around again and you return to where you began. This phenomenon —
	following a local solution around a loop and coming back to a different one — is called <dfn>monodromy</dfn>.
</p>

<Figure num="4.7.5" title="Following a branch around the puncture" hint="Drag to rotate · slide or press Walk">
	<BranchSurface />
	{#snippet caption()}
		The walker circles the origin in the plane below. Above it, its chosen value is followed continuously on the
		<em>Riemann surface</em> of the function. For \(\sqrt z\) (height = real part) the surface has two sheets, and one
		turn moves you from one to the other; the dial shows the value turning only half a turn. For \(\log z\) the surface is
		a spiral ramp, and every turn adds \(2\pi i\).
	{/snippet}
</Figure>

<p>
	So the sheaf of square roots on \(\C\setminus\{0\}\) has local sections everywhere but <strong>no global section</strong>:
	there is no continuous square root on the whole punctured plane (or even on a circle around \(0\)). Čech cohomology says
	why, in numbers. Cover a circle around \(0\) by three arcs and choose a root \(g_i\) on each arc. On each overlap two
	choices are either equal or opposite: \(g_j = \varepsilon_{ij}\, g_i\) with \(\varepsilon_{ij}\in\{+1,-1\}\). Changing
	the choice on arc \(i\) flips the signs of both overlaps at that arc, and therefore cannot change the product around the
	loop,
	\[ \varepsilon_{01}\,\varepsilon_{12}\,\varepsilon_{02}^{-1} = -1. \]
	This is the multiplicative version of the loop test: a class in \(\check H^1(S^1;\{\pm1\})\), and it is not the trivial
	one.
</p>

<p>
	The logarithm behaves the same way with a different group. Its values on a small disk are \(\ln r + i\theta\) with
	\(\theta\) determined up to adding a multiple of \(2\pi\). Two local choices differ by a constant \(2\pi i k\) with
	\(k\in\Z\), and the loop test gives \(2\pi i\) times the number of times the loop winds around \(0\): a class in
	\(\check H^1(S^1; 2\pi i\,\Z)\cong \Z\). The imaginary part of \(\log z\) is the angle \(\theta\), and this class is our
	old friend from <Ref to="cohomology/de-rham" />, the class of \(d\theta\).
</p>

<Remark title="Riemann surfaces">
	<p>
		Bernhard Riemann’s response to monodromy (1851) was to change the space rather than the function: glue together all the
		local branches into a new surface lying over the plane, on which the branch becomes an honest single-valued function.
		The spiral ramp of \(\log z\) and the two-sheeted surface of \(\sqrt z\) in the figure are those surfaces. (The two
		sheets of \(\sqrt z\) seem to pass through each other along the negative real axis only because we drew them in
		three dimensions; the surface itself does not cross itself.)
	</p>
</Remark>

<h3>Orientations of a Möbius band</h3>

<p>
	Recall from <Ref to="topology/manifolds" /> that an <Term t="orientation">orientation</Term> of a small patch of surface
	is a choice of which way is “anticlockwise” there; equivalently, by the right-hand rule, a choice of which side the normal
	arrow points to. Every small patch has exactly two orientations, and orientations restrict to smaller patches, so they
	form a sheaf: the <dfn>orientation sheaf</dfn>. A global section is an orientation of the whole surface, so a surface is
	<Term t="orientable">orientable</Term> exactly when its orientation sheaf has a global section.
</p>

<Figure num="4.7.6" title="The orientation sheaf of the Möbius band" hint="Drag to rotate · flip patches · carry the arrow">
	<MobiusOrientation />
	{#snippet caption()}
		Three overlapping patches cover the band; each has its own consistent choice of normal arrow. On each overlap the two
		choices agree (\(+1\)) or disagree (\(-1\)). Flipping a patch changes two signs at once, so the product of the three
		signs never changes: \(-1\) on the Möbius band, \(+1\) on the cylinder. The gold arrow, carried once around, comes back
		upside down.
	{/snippet}
</Figure>

<p>
	The figure computes the Čech cocycle of this sheaf. On each patch \(U_i\) choose an orientation \(o_i\); on an overlap,
	\(o_j = g_{ij}\, o_i\) for a sign \(g_{ij}\in\{\pm1\}\). These signs satisfy the cocycle condition (on a triple overlap,
	comparing \(i\) with \(k\) directly or via \(j\) gives the same answer), and changing the choice on one patch multiplies
	\(g\) by a coboundary. The product around the core circle is \(-1\) for the Möbius band whatever you do: the orientation
	sheaf has no global section, and the obstruction is a nonzero class in \(\check H^1(S^1;\{\pm 1\})\). In <Ref
		to="cohomology/characteristic-classes"
	/> this class gets a name, the first Stiefel–Whitney class \(w_1\).
</p>

<h3>The impossible triangle</h3>

<p>
	In 1958 the psychiatrist and geneticist Lionel Penrose and his son Roger, then a young mathematician, published a drawing of an
	impossible object: a triangle of three square beams, each meeting the next at a right angle (the Swedish artist Oscar
	Reutersvärd had drawn a version made of cubes in 1934). Every corner of the drawing is a perfectly ordinary corner. The
	whole thing cannot exist. In 1991 Roger Penrose explained why, in a short paper titled <em>On the cohomology of impossible
	figures</em>.
</p>

<p>
	Cover the drawing by three overlapping pieces \(U_1, U_2, U_3\), each containing one corner. Each piece on its own is a
	drawing of a real three-dimensional object: an L-shaped corner. But a drawing never tells you how far away an object is.
	If you double every distance from your eye, the object grows to twice the size and looks <em>exactly</em> the same. So
	each piece determines a real object only up to a scale factor \(\lambda_i \gt 0\), its distance from the eye.
</p>

<p>
	On an overlap, say \(U_1\cap U_2\), both pieces show the same stretch of beam, and the two interpretations put it at
	distances whose ratio is some number \(d_{12} \gt 0\). Rescaling the pieces changes the ratios — rescaling piece \(i\)
	by \(\lambda_i\) multiplies \(d_{ij}\) by \(\lambda_i/\lambda_j\) — and the three pieces fit together into one real
	object exactly when we can make every ratio equal to \(1\), that is, when \(d_{ij} = \lambda_j/\lambda_i\) for some
	choice of the \(\lambda\)’s. In the language of this chapter, \(d\) is a Čech \(1\)-cochain with values in the group
	\((\R_{\gt 0},\times)\) of positive numbers under multiplication, and the figure is realizable exactly when \(d\) is a
	coboundary. The loop test, written multiplicatively, is
	\[ d_{12}\, d_{23}\, d_{31} = 1. \]
</p>

<Figure num="4.7.7" title="Penrose’s cocycle" hint="Pull the pieces apart · rescale them">
	<TribarCocycle />
	{#snippet caption()}
		The impossible triangle is three overlapping pieces, each a genuine corner — pull them apart to check. Rescaling a piece
		about the eye does not change its drawing, but it changes the depth ratios on its two overlaps. You can make any two
		overlaps agree; the product \(d_{12}d_{23}d_{31}\) stays put, so the third overlap always disagrees.
	{/snippet}
</Figure>

<p>
	For the tribar the product is not \(1\). Going around the triangle, each corner tells you that the next beam recedes from
	you, so the depth ratios compound instead of cancelling. The drawing is a nonzero class in \(\check H^1\) of an annulus
	(the shape of the drawing) with coefficients in the positive real numbers. Penrose’s analysis gives a new meaning to the
	slogan of this chapter: an impossible figure is a <em>locally consistent</em> picture whose consistency fails to glue.
</p>

<p>
	There is a beautiful way to see the class in three dimensions. Build the three beams for real, as an open chain, and
	look at it from exactly the right point: the end of the last beam then sits in front of the start of the first, and the
	gap closes.
</p>

<Figure num="4.7.8" title="Possible — from one eye only" hint="Step aside, or drag to look from elsewhere · zoom">
	<TribarEye />
	{#snippet caption()}
		Three real beams. From the eye (where the view starts) they form a closed triangle; step aside and the gap opens. The rose
		line is the line of sight through the start of beam A and the end of beam C. The gold ghost is how piece \(U_3\) reads beam
		A, as a genuine corner: beam A shrunk towards the eye by the factor \(\mu\). In this model that single factor is the
		product \(d_{12}d_{23}d_{31}\), and it is why no single object fits all three pieces.
	{/snippet}
</Figure>

<KeyIdea title="One pattern, three disguises">
	<p>
		Square roots, orientations and depth readings all share one structure: on each piece there are local solutions, any two
		of which differ by an element of a group (\(\{\pm 1\}\), \(\{\pm1\}\), \(\R_{\gt 0}\)); comparing choices on overlaps
		gives a Čech \(1\)-cocycle; and a global solution exists exactly when that cocycle is a coboundary. The class in
		\(\check H^1\) is the obstruction.
	</p>
</KeyIdea>

<h2 id="sheaf-cohomology">Sheaf cohomology: measuring the failure to glue</h2>

<h3>Čech cochains with values in a sheaf</h3>

<p>
	Everything in the Čech complex works with a sheaf of abelian groups \(F\) in place of the constant group \(G\): put
	sections of \(F\) on the pieces and on their overlaps, and restrict before you subtract.
</p>

<Definition title="Čech cohomology with coefficients in a sheaf">
	<p>
		For a cover \(\mathcal U = \{U_i\}\) with ordered labels and a sheaf (or presheaf) of abelian groups \(F\),
		\[ \check C^p(\mathcal U;F) = \prod_{i_0 \lt i_1 \lt \cdots \lt i_p} F(U_{i_0 i_1\cdots i_p}), \]
		with coboundary
		\[ (\delta c)_{i_0\cdots i_{p+1}} = \sum_{k=0}^{p+1}(-1)^k\, c_{i_0\cdots\widehat{i_k}\cdots
		i_{p+1}}\big|_{U_{i_0\cdots i_{p+1}}}. \]
		Again \(\delta\circ\delta = 0\), and \(\check H^p(\mathcal U;F) = \ker\delta/\im\delta\).
	</p>
</Definition>

<p>
	(The symbol \(\prod\) means a list with one entry for each choice of indices — one section on each \(p\)-fold overlap.)
	With the constant sheaf of locally constant \(G\)-valued functions we recover exactly the previous section: a locally
	constant function on an overlap is one element of \(G\) per connected piece, which is the repair we needed for the two
	arcs.
</p>

<h3>What the groups mean</h3>

<ul>
	<li>
		<strong>\(\check H^0(X;F) = F(X)\)</strong>: the global sections, the global solutions of whatever problem \(F\)
		encodes.
	</li>
	<li>
		<strong>\(\check H^1(X;F)\)</strong>: the obstructions. A \(1\)-cocycle is a recipe for comparing local data on
		overlaps that is consistent on triple overlaps; it is a coboundary when the comparisons can be absorbed by changing the
		local data. Nonzero classes are “twisted” versions of the trivial situation: twisted line bundles in the next chapter,
		impossible figures here.
	</li>
	<li>
		<strong>Higher \(\check H^p\)</strong>: obstructions to resolving the obstructions — inconsistencies on triple overlaps
		that cannot be absorbed by changing the data on pairs, and so on.
	</li>
</ul>

<p>
	A beautiful special case shows how \(\check H^1\) arises from a <em>failure to glue</em>. Suppose every point has a
	neighbourhood on which some equation can be solved, and any two local solutions differ by an element of a sheaf of
	abelian groups \(A\). Pick local solutions \(s_i\) on a cover; on each overlap \(s_j - s_i = c_{ij}\) is a section of
	\(A\); these differences automatically satisfy \(c_{ik} = c_{ij} + c_{jk}\), so \(c\) is a cocycle; and a global solution
	exists exactly when \([c] = 0\) in \(\check H^1(X; A)\). The hikers, the logarithm and the depth readings are all
	instances.
</p>

<h3>Leray’s theorem: when one cover is enough</h3>

<p>
	The true sheaf cohomology \(H^p(X;F)\) is defined without choosing any cover, either as the limit of
	\(\check H^p(\mathcal U;F)\) over finer and finer covers, or through the machinery of derived functors that Alexander
	Grothendieck introduced in 1957. For the spaces in this book every reasonable definition gives the same groups. To
	compute them, one well-chosen cover suffices.
</p>

<Theorem label="Theorem (Leray)" id="thm-leray">
	<p>
		If every finite intersection \(U_{i_0\cdots i_p}\) of the pieces of \(\mathcal U\) has no higher cohomology with
		coefficients in \(F\) — that is, \(H^q(U_{i_0\cdots i_p}; F) = 0\) for all \(q\ge 1\) — then
		\[ \check H^p(\mathcal U; F) \cong H^p(X;F) \quad \text{for every } p. \]
	</p>
</Theorem>

<p>
	Such a cover is called a <dfn>Leray cover</dfn> for \(F\). For constant coefficients it is enough that every intersection
	be a disjoint union of contractible pieces — which explains the cautionary tale: the overlap of the two arcs is two
	contractible pieces, so the two-arc cover is a Leray cover, and its Čech complex (done honestly, one number per piece)
	computes \(H^1(S^1) = G\) correctly, even though its nerve does not look like a circle.
</p>

<h3>de Rham, revisited</h3>

<p>
	Here is the bridge between this chapter and <Ref to="cohomology/de-rham" />. Let \(\omega\) be a <Term t="closed-form"
		>closed</Term
	> \(1\)-form on a manifold \(M\), and take a good cover. On each contractible piece \(U_i\) the Poincaré lemma gives a
	function \(f_i\) with \(df_i = \omega\). On an overlap, \(d(f_j - f_i) = \omega - \omega = 0\), so \(f_j - f_i\) is a
	constant \(c_{ij}\) on each (connected) overlap — a Čech \(1\)-cocycle with values in \(\R\). Changing the local
	primitives by constants changes \(c\) by a coboundary, and \(\omega\) is exact exactly when the local primitives can be
	chosen to agree, that is, when \([c] = 0\). This defines an isomorphism
	\[ H^1_{\dR}(M) \;\cong\; \check H^1(M;\R). \]
	For the angle form on the circle with our three arcs, the local primitives are three branches of the angle, and the
	offsets are \(0, 0\) and \(2\pi\): holonomy \(-2\pi \ne 0\), the class of \(d\theta\). The same argument in every degree,
	organised by Bott and Tu into the “tic-tac-toe” Čech–de Rham complex, proves de Rham’s theorem.
</p>

<History title="A topologist in captivity">
	<p>
		Jean Leray was a French expert on fluid dynamics when he was captured in 1940 and sent to a prisoner-of-war camp in
		Austria, where he remained until 1945. The MacTutor biography records the reason for his change of field: “Not wishing
		the Germans to know that he was an expert in hydrodynamics, since he feared that if they found out he would be forced
		to undertake war work for them, Leray claimed to be a topologist.” In the camp he and his fellow prisoners organised a
		university in captivity, with Leray as its rector, and in topology lectures there he developed the ideas he published in
		1946: sheaves and spectral sequences. Henri Cartan’s seminar reworked sheaf cohomology around 1950; Jean-Pierre Serre
		made sheaves the language of algebraic geometry in 1955; Grothendieck’s 1957 paper made sheaf cohomology a derived
		functor.
	</p>
</History>

<h2 id="cellular-sheaves">Sheaves on graphs: local data, global consensus</h2>

<p>
	Sheaves can sound forbiddingly abstract. In applied topology they are now a practical tool, thanks to a combinatorial
	version that lives on graphs and cell complexes. Justin Curry, who developed it in his 2014 thesis, describes cellular
	sheaves as “finite families of vector spaces and maps parametrized by a cell complex”. Here is the version on a graph.
</p>

<Definition title="Cellular sheaf on a graph" id="def-cellular-sheaf">
	<p>
		A <dfn>cellular sheaf</dfn> \(F\) on a graph assigns a vector space \(F(v)\) to every vertex \(v\) and a vector space
		\(F(e)\) to every edge \(e\) (the <dfn>stalks</dfn>), and for every vertex \(v\) at an end of an edge \(e\) a linear map
		\(F_{v\trianglelefteq e}\colon F(v)\to F(e)\) (the <dfn>restriction maps</dfn>, read “from \(v\) to \(e\)”). A choice of
		vector \(x_v \in F(v)\) at every vertex is a <dfn>global section</dfn> if, for every edge \(e\) from \(u\) to \(v\),
		\[ F_{u\trianglelefteq e}\,x_u = F_{v\trianglelefteq e}\,x_v. \]
	</p>
</Definition>

<p>
	The data at a vertex restrict to its edges just as data on an open set restrict to smaller sets. (Think of a vertex as
	standing for the little star-shaped open set around it, and an edge for the smaller open set around the edge’s middle.)
	The cochains are \(C^0 = \bigoplus_v F(v)\) and \(C^1 = \bigoplus_e F(e)\), and the coboundary measures disagreement on
	each edge \(e\) from \(u\) to \(v\):
	\[ (\delta x)_e = F_{v\trianglelefteq e}\,x_v - F_{u\trianglelefteq e}\,x_u, \]
	and as always
	\[ H^0(F) = \ker\delta = \{\text{global sections}\}, \qquad H^1(F) = C^1/\im\delta. \]
	With every stalk equal to \(\R\) and every map the identity, this is exactly the graph cohomology of <Ref
		to="cohomology/cochains"
	/>. The point of a sheaf is that the maps need not be identities.
</p>

<Figure num="4.7.9" title="A sheaf of prices" hint="Change prices with − and + · let them settle · try both rate tables">
	<GraphSheaf />
	{#snippet caption()}
		Each vertex holds the price of the same coffee in its own currency; each edge converts one price into the other’s
		currency and compares. A global section is a consistent price list. With honest rates there is a one-dimensional space
		of them; with an arbitrage loop, only the zero price list is consistent. “Let prices settle” runs the sheaf heat
		equation, which slides to the nearest consistent list.
	{/snippet}
</Figure>

<Example title="Currencies as a sheaf">
	<p>
		In the figure, the stalk at every vertex and edge is \(\R\). The edge from the euro vertex to the dollar vertex compares
		prices in euros: the restriction map from the euro vertex is \(1\), and the one from the dollar vertex is
		\(1/1.10\), which converts dollars into euros. A global section is a price list such that every conversion agrees.
	</p>
	<p>
		Count dimensions. \(C^0 = \R^4\) (four prices) and \(C^1 = \R^4\) (four comparisons). With honest rates — the
		conversion around the triangle multiplies money by \(1.10\times 0.80\div 0.88 = 1\) — choosing the euro price forces
		all the others, so \(\dim H^0 = 1\), the rank of \(\delta\) is \(3\), and \(\dim H^1 = 4 - 3 = 1\). Change one rate so
		that going around the triangle multiplies money by \(1.257\) and the only consistent price list is \(0\): \(\dim H^0 =
		0\), and then \(\dim H^1 = 0\) too. In both cases \(\dim H^0 - \dim H^1 = \dim C^0 - \dim C^1 = 0\): the
		<em>Euler characteristic</em> of a sheaf on a graph does not depend on its maps (Exercise 7).
	</p>
</Example>

<h3>Consensus and data fusion</h3>

<p>
	The same pattern describes many problems where local measurements must be fused into a global picture: sensors measuring
	one quantity in different units or coordinate frames, cameras that see overlapping parts of a scene, agents in a network
	trying to agree. The global sections are the consistent global pictures, \(H^0\); edge data that cannot be explained by
	any vertex data are the classes in \(H^1\).
</p>

<p>
	There is even a natural way for a network to <em>find</em> a global section using only local communication. The <dfn
		>sheaf Laplacian</dfn
	> \(L = \delta^{\mathsf T}\delta\) generalises the graph Laplacian, and the heat equation \(\frac{dx}{dt} = -Lx\) lets
	every vertex nudge its value to reduce its disagreement with its neighbours. Since the flow never increases the total
	disagreement \(\norm{\delta x}^2\), the flow settles on the global section closest to the starting data — consensus, when
	every map is the identity. Jakob Hansen and Robert Ghrist call the study of such Laplacians “spectral sheaf theory — an
	extension of spectral graph theory to cellular sheaves”. Press “Let prices settle” in the figure to watch it work: with
	honest rates the prices converge to a consistent list; with an arbitrage loop they drain away to zero, the only
	consistent list there is.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Four arcs">
	<p>
		Cover the circle by four open arcs \(U_0, U_1, U_2, U_3\), arranged in order around the circle, each overlapping only
		its two neighbours. Draw the nerve. Write down the Čech coboundary \(\delta\colon G^4 \to G^4\) and find a loop test
		\(h\) with \(\check H^1 \cong G\).
	</p>
	{#snippet hint()}
		<p>The overlaps are \(U_{01}, U_{12}, U_{23}\) and \(U_{03}\). Walk around the circle \(0\to1\to2\to3\to0\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The nerve has four vertices and the four edges \(01, 12, 23, 03\), and no triangles: a square, which is a circle.
			\(\delta f = (f_1 - f_0,\; f_2 - f_1,\; f_3 - f_2,\; f_3 - f_0)\). Walking around, the offsets accumulate to
			\[ h(c) = c_{01} + c_{12} + c_{23} - c_{03}, \]
			with a minus sign on \(c_{03}\) because that overlap is crossed from \(3\) back to \(0\). For a coboundary the sum
			telescopes to \(0\); conversely if \(h(c) = 0\), then \(f = (0,\, c_{01},\, c_{01}+c_{12},\, c_{03})\) satisfies
			\(\delta f = c\). So \(\im\delta = \ker h\), \(h\) is onto \(G\), and \(\check H^1 \cong G\). Also \(\ker\delta\) is
			the constants, so \(\check H^0\cong G\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Covering the sphere">
	<p>
		(a) Cover the sphere by two caps, each missing one pole. What is the nerve, and why does the nerve theorem not apply?
		(b) Draw a tetrahedron on the sphere (four vertices, six great-circle edges, four triangular faces) and let \(U_i\) be a
		slightly enlarged copy of face \(i\). What is the nerve now? What does the nerve theorem say?
	</p>
	{#snippet hint()}
		<p>In (b), which collections of faces share a point? Faces that share an edge; three faces at a vertex; and all four?</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) Two vertices and one edge: a segment, which is contractible. The overlap of the caps is a band around the equator,
			which is not contractible (it contains a loop that cannot be shrunk), so the cover is not good and the theorem does
			not apply; indeed the sphere is not contractible.
		</p>
		<p>
			(b) Every two faces of a tetrahedron share an edge and every three share a vertex, so enlarged slightly, every pair
			and every triple of pieces overlaps; but no point is close to all four faces, so there is no \(3\)-simplex. The nerve
			is the boundary of a tetrahedron: four vertices, six edges, four triangles. All the intersections are small disks, so
			the cover is good and the nerve theorem says the sphere is homotopy equivalent to the hollow tetrahedron — which has
			\(H^0 = \Z\), \(H^1 = 0\), \(H^2 = \Z\), the cohomology of \(S^2\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Sheaf or not?">
	<p>
		Which of these presheaves on \(\R\) are sheaves? (a) Continuous functions with \(f(x)\ge 0\) for all \(x\). (b)
		Continuous functions with \(|f(x)|\le 1\) for all \(x\). (c) Bounded continuous functions. (d) Constant functions. (e)
		Differentiable functions with \(f' = f\). (f) Continuous functions with \(\int_U f = 0\) (for bounded \(U\)).
	</p>
	{#snippet hint()}
		<p>Ask whether the defining property can be checked near each point separately.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a), (b) and (e) are sheaves: each property is checked point by point, so glued functions still have it (for (e),
			the glued function is differentiable near each point, with \(f' = f\) there). (c) is not (the pieces of \(x\mapsto
			x\) on \((n-1,n+1)\) glue to an unbounded function). (d) is not (two different constants on two disjoint intervals).
			(f) is not: on \((0,2)\) and \((1,3)\) take \(f(x) = \sin(\pi x)\); its integral over each interval is \(0\), the
			pieces agree on the overlap, but the integral of the glued function over \((0,3)\) is \(2/\pi \neq 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Cube roots">
	<p>
		Every \(z\neq 0\) has three cube roots. Describe what happens to a continuously chosen cube root as you walk once,
		twice and three times around the origin. Which group do the transition factors \(g_j = \varepsilon_{ij} g_i\) live in,
		and what is their product around the loop?
	</p>
	{#snippet solution()}
		<p>
			The cube roots of \(re^{i\theta}\) are \(r^{1/3}e^{i\theta/3}\) times \(1\), \(\omega = e^{2\pi i/3}\) and
			\(\omega^2\). Following one continuously, the angle \(\theta/3\) grows by \(2\pi/3\) per turn, so one walk multiplies
			the root by \(\omega\), two by \(\omega^2\), and three bring it back. The factors \(\varepsilon_{ij}\) are cube roots
			of unity, a group \(\{1,\omega,\omega^2\}\cong\Z/3\) under multiplication, and the product around the loop is
			\(\omega \neq 1\) whatever local choices are made: a nonzero class in \(\check H^1(S^1;\Z/3)\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The Möbius band with two patches">
	<p>
		Cover the Möbius band by two patches \(U\) and \(V\) whose overlap consists of two pieces \(W_1\) and \(W_2\) (like the
		two arcs of the circle). Choose an orientation on \(U\) and one on \(V\), and let \(g_1, g_2\in\{\pm 1\}\) record
		whether they agree on \(W_1\) and on \(W_2\). Show that \(g_1 g_2 = -1\) for every choice, and that \(g_1g_2 = +1\) for
		the cylinder.
	</p>
	{#snippet solution()}
		<p>
			Flipping the orientation on \(U\) (or on \(V\)) flips both \(g_1\) and \(g_2\), so \(g_1g_2\) does not depend on the
			choices. To compute it, carry an orientation from \(W_1\) through \(U\) to \(W_2\), and back through \(V\) to
			\(W_1\): this is carrying it once around the core circle. On the Möbius band it comes back reversed, which means the
			two comparisons differ: \(g_1 g_2 = -1\). On the cylinder it comes back unchanged, so \(g_1g_2 = +1\). This is the
			class in \(\check H^1(S^1;\{\pm1\}) \cong \Z/2\) computed with the two-piece overlap, just as for the two arcs.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Penrose’s invariant">
	<p>
		Show that rescaling the three pieces of the tribar by \(\lambda_1,\lambda_2,\lambda_3 \gt 0\) does not change
		\(d_{12}d_{23}d_{31}\). Conclude that the three pieces can be assembled into one real object only if this product is
		\(1\), and conversely that if it is \(1\) they can.
	</p>
	{#snippet solution()}
		<p>
			Rescaling multiplies \(d_{ij}\) by \(\lambda_i/\lambda_j\), so the product is multiplied by
			\((\lambda_1/\lambda_2)(\lambda_2/\lambda_3)(\lambda_3/\lambda_1) = 1\). A real object fitting all three pieces would
			make every ratio \(1\), hence the product \(1\); since the product never changes, it must have been \(1\) to begin
			with. Conversely, if \(d_{12}d_{23}d_{31} = 1\), choose \(\lambda_1 = 1\), \(\lambda_2 = d_{12}\), \(\lambda_3 =
			d_{12}d_{23}\); then the new ratios are \(d_{12}\cdot\lambda_1/\lambda_2 = 1\), \(d_{23}\cdot \lambda_2/\lambda_3 =
			1\) and \(d_{31}\cdot\lambda_3/\lambda_1 = d_{31}d_{12}d_{23} = 1\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Sheaves on graphs: trees, loops and the Euler characteristic">
	<p>
		Consider a cellular sheaf on a graph in which every stalk is \(\R\) and every restriction map is multiplication by a
		nonzero number. (a) Show that if the graph is a tree, then \(\dim H^0 = 1\) and \(\dim H^1 = 0\). (b) Show that for any
		graph with \(V\) vertices and \(E\) edges, \(\dim H^0 - \dim H^1 = V - E\). (c) For a triangle, show that \(\dim H^0 =
		1\) if the product of the “conversion factors” around the loop is \(1\), and \(0\) otherwise.
	</p>
	{#snippet hint()}
		<p>For (b), use rank–nullity for \(\delta\colon \R^V\to\R^E\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) Choose \(x\) at one vertex. Each edge condition \(F_{u\trianglelefteq e}x_u = F_{v\trianglelefteq e}x_v\)
			determines the value at the far end from the near end, and in a tree each vertex is reached along exactly one path, so
			every section is determined by one number and every number works: \(\dim H^0 = 1\). Then \(\dim H^1 = E - \rank\delta
			= (V-1) - (V - 1) = 0\).
		</p>
		<p>
			(b) By rank–nullity, \(\dim H^0 = \dim\ker\delta = V - \rank\delta\) and \(\dim H^1 = E - \rank\delta\); subtract.
		</p>
		<p>
			(c) Going around the triangle, the edge conditions force \(x_1 = a\,x_0\), \(x_2 = b\, x_1\) and \(x_0 = c\, x_2\) for
			the three conversion factors \(a, b, c\); so \(x_0 = abc\, x_0\). If \(abc = 1\) any \(x_0\) works and \(\dim H^0 =
			1\); otherwise \(x_0 = 0\), hence everything is \(0\), and \(\dim H^0 = 0\). By (b), \(\dim H^1\) is then \(1\) or
			\(0\) respectively.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Refining the two arcs">
	<p>
		Cut the bottom arc \(V\) of the two-arc cover into two overlapping arcs \(V_1, V_2\), so that \(U, V_1, V_2\) is a
		three-arc cover. Explain how a Čech \(1\)-cocycle \((c_1, c_2)\) for the two-arc cover gives one for the three-arc
		cover, and check that its loop test equals \(c_2 - c_1\) (up to sign).
	</p>
	{#snippet solution()}
		<p>
			Label the new pieces \(U_0 = U\), \(U_1 = V_1\) (containing \(W_1\)), \(U_2 = V_2\) (containing \(W_2\)). On
			\(U_{01} = W_1\) use \(c_1\); on \(U_{02} = W_2\) use \(c_2\); and on \(U_{12}\), which lies inside \(V\) where the
			old cochain has a single zero, use \(0\). The loop test is \(c_{01} + c_{12} - c_{02} = c_1 + 0 - c_2 = -(c_2 -
			c_1)\). So the two covers give the same group \(G\), and the classes match up to the orientation of the loop: refining
			a Leray cover does not change Čech cohomology.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			An <strong>open cover</strong> splits a space into overlapping pieces; its <strong>nerve</strong> records which pieces
			overlap. For a <strong>good cover</strong> (contractible overlaps), the nerve has the same shape as the space — the
			nerve theorem, used to find holes in sensor networks.
		</li>
		<li>
			<strong>Čech cochains</strong> put data on pieces and overlaps; the coboundary \((\delta f)_{ij} = f_j - f_i\) is the
			simplicial coboundary of the nerve. For three arcs on a circle, \(\check H^0 = \check H^1 = G\), detected by the loop
			test \(c_{01} + c_{12} - c_{02}\).
		</li>
		<li>
			With two arcs the overlap has two pieces: the Čech complex (one value per piece) still gives the right answer, but the
			one-edge nerve does not. <strong>Leray’s theorem</strong> says when a cover computes true cohomology.
		</li>
		<li>
			A <strong>presheaf</strong> is data on open sets with restriction maps (arrows reversed); a <strong>sheaf</strong>
			also satisfies locality and gluing. Continuous functions and solutions of equations form sheaves; bounded and constant
			functions do not. For a sheaf, \(\check H^0 = F(X)\), the global sections.
		</li>
		<li>
			Monodromy of \(\sqrt z\) and \(\log z\), the orientation sheaf of the Möbius band, and Penrose’s impossible triangle
			are all nonzero classes in \(\check H^1\): local solutions exist, but their comparisons on overlaps do not come from a
			global choice.
		</li>
		<li>
			<strong>Cellular sheaves</strong> on graphs bring all this to data: \(H^0\) is the space of consistent global pictures,
			and the sheaf Laplacian’s heat flow finds them by local averaging.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
