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
	import BundleSections from '$lib/figures/cohomology/characteristic-classes/BundleSections.svelte';
	import CombBall from '$lib/figures/cohomology/characteristic-classes/CombBall.svelte';
	import IndexExplorer from '$lib/figures/cohomology/characteristic-classes/IndexExplorer.svelte';
	import TriangulationFlow from '$lib/figures/cohomology/characteristic-classes/TriangulationFlow.svelte';
	import TurningCurve from '$lib/figures/cohomology/characteristic-classes/TurningCurve.svelte';
	import AngleExcess from '$lib/figures/cohomology/characteristic-classes/AngleExcess.svelte';
	import GaussBonnetSculptor from '$lib/figures/cohomology/characteristic-classes/GaussBonnetSculptor.svelte';
	import MonopolePatches from '$lib/figures/cohomology/characteristic-classes/MonopolePatches.svelte';

	const reading = [
		{
			title: 'Visual Differential Geometry and Forms',
			author: 'Tristan Needham (Princeton University Press, 2021)',
			url: 'https://doi.org/10.1515/9780691219899',
			note: 'A gloriously geometric, picture-first account of curvature, the Theorema Egregium, geodesic triangles and Gauss–Bonnet, written for readers who want to see why. Undergraduate level.',
			kind: 'book' as const
		},
		{
			title: 'General Investigations of Curved Surfaces',
			author: 'Carl Friedrich Gauss (1827), translated by J. C. Morehead and A. M. Hiltebeitel (1902)',
			url: 'https://www.gutenberg.org/ebooks/36856',
			note: 'Gauss’s own paper: the measure of curvature, the Theorema Egregium (article 12) and the angle-excess theorem (article 20). Surprisingly readable, and free.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Discrete Differential Geometry: An Applied Introduction',
			author: 'Keenan Crane (lecture notes)',
			url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
			note: 'Curvature on triangle meshes, angle defects and the discrete Gauss–Bonnet theorem — the mathematics behind the sculptor figure — with beautiful illustrations.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Characteristic Classes',
			author: 'John Milnor and James Stasheff (Princeton, 1974)',
			url: 'https://doi.org/10.1515/9781400881826',
			note: 'The classic reference for Stiefel–Whitney, Euler, Chern and Pontryagin classes. Graduate level, famously clear.',
			kind: 'book' as const
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring Tu (Springer GTM 82, 1982)',
			url: 'https://doi.org/10.1007/978-1-4757-3951-0',
			note: 'Euler and Thom classes, Chern classes via the splitting principle, and the Čech–de Rham viewpoint of the previous chapter. First-year graduate level.',
			kind: 'book' as const
		},
		{
			title: 'Cup product and intersections',
			author: 'Michael Hutchings (lecture handout, 2011)',
			url: 'https://math.berkeley.edu/~hutching/teach/215b-2011/cup.pdf',
			note: 'Short notes explaining, among other things, why the Euler class is Poincaré dual to the zero set of a section.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Geometry, Topology and Physics',
			author: 'Mikio Nakahara (2nd edition, CRC Press)',
			url: 'https://doi.org/10.1201/9781315275826',
			note: 'The standard bridge for physicists: bundles, connections, characteristic classes, the Dirac monopole and Berry’s phase.',
			kind: 'book' as const
		},
		{
			title: 'The Geometry of Physics',
			author: 'Theodore Frankel (3rd edition, Cambridge University Press, 2011)',
			url: 'https://doi.org/10.1017/CBO9781139061377',
			note: 'A rich, physically motivated tour of forms, curvature, bundles and characteristic classes, including monopoles and gauge fields.',
			kind: 'book' as const
		},
		{
			title: 'Quantised singularities in the electromagnetic field',
			author: 'Paul Dirac (Proc. R. Soc. A 133, 1931)',
			url: 'https://doi.org/10.1098/rspa.1931.0130',
			note: 'The paper in which the magnetic monopole and the quantisation of electric charge first appear.',
			kind: 'paper' as const
		},
		{
			title: 'Concept of nonintegrable phase factors and global formulation of gauge fields',
			author: 'Tai Tsun Wu and Chen Ning Yang (Phys. Rev. D 12, 1975)',
			url: 'https://doi.org/10.1103/PhysRevD.12.3845',
			note: 'The two-patch description of the monopole, and the dictionary between gauge fields and bundles.',
			kind: 'paper' as const
		},
		{
			title: 'Quantized Hall Conductance in a Two-Dimensional Periodic Potential',
			author: 'D. J. Thouless, M. Kohmoto, M. P. Nightingale, M. den Nijs (Phys. Rev. Lett. 49, 1982)',
			url: 'https://doi.org/10.1103/PhysRevLett.49.405',
			note: 'The “TKNN” paper: the integers of the quantum Hall effect computed as topological invariants of electron bands.',
			kind: 'paper' as const
		},
		{
			title: 'Holonomy, the Quantum Adiabatic Theorem, and Berry’s Phase',
			author: 'Barry Simon (Phys. Rev. Lett. 51, 1983)',
			url: 'https://doi.org/10.1103/PhysRevLett.51.2167',
			note: 'A short classic identifying Berry’s phase as holonomy and the TKNN integers as Chern numbers.',
			kind: 'paper' as const
		}
	];
</script>

<Epigraph author="Carl Friedrich Gauss" source="abstract of General Investigations of Curved Surfaces (1827), trans. Morehead &amp; Hiltebeitel"
	>The excess of the sum of the angles of a triangle formed by shortest lines over two right angles is equal to the total
	curvature of the triangle.</Epigraph
>

<p class="lead">
	Try to comb the hair on a coconut so that it lies flat everywhere. You will fail: somewhere a tuft will stand up, or the
	hair will swirl around a bald spot. Now take a lump of clay shaped like a ball and squash it, dent it, pull out a nose.
	Its curvature changes everywhere — yet, added up over the whole surface, it is always exactly the same number.
</p>

<p>
	Both facts are instances of one theme: <em>local geometry knows global topology</em>. A vector field is a choice of arrow
	at every point; curvature is a measurement at every point. Neither seems to know anything about the overall shape. Yet the
	zeros of every vector field, counted properly, add up to the Euler characteristic, and so does the total curvature,
	divided by \(2\pi\). The bookkeeping that makes these facts precise is a family of cohomology classes, the
	<em>characteristic classes</em>, which measure how a family of vector spaces twists over a space. They also turn out to
	explain why electric charge comes in whole units and why certain electrical measurements are exact integers.
</p>

<Ahead>
	<p>
		This chapter gathers threads from all over the book: the Euler characteristic (<Ref to="topology/euler-characteristic"
		/>), the hairy ball theorem (<Ref to="homology/invariance" />), de Rham cohomology (<Ref to="cohomology/de-rham" />),
		Poincaré duality (<Ref to="cohomology/poincare-duality" />) and the Čech cocycles of the previous chapter (<Ref
			to="cohomology/sheaves"
		/>). Characteristic classes are the obstructions of cohomology at their most concrete: they are where cohomology
		touches geometry and physics, and the road from here leads to K-theory, gauge theory and topological phases of matter
		(<Ref to="big-picture/horizons" />).
	</p>
</Ahead>

<h2 id="vector-bundles">Families of vector spaces</h2>

<p>
	Stand at a point \(p\) of a sphere. The directions in which you can walk without leaving the surface form a flat plane
	touching the sphere at \(p\): the <Term t="tangent-space">tangent plane</Term> \(T_pS^2\) of <Ref to="topology/manifolds"
	/>. Every point has its own tangent plane, and as \(p\) moves the plane tilts with it. Each one is a copy of \(\R^2\), a
	<Term t="vector-space">vector space</Term> in which arrows can be added and scaled, but there is no single, natural way to
	identify the plane at the north pole with the plane at the equator. This collection of planes, one attached at every
	point and varying continuously, is called the <dfn>tangent bundle</dfn> \(TS^2\).
</p>

<p>
	A simpler example lives over a circle. Attach to every point of a circle a short segment, a copy of the real line \(\R\)
	(we draw only a piece of it). If all the segments stand upright, they sweep out a <strong>cylinder</strong>. If instead
	they turn slowly as we go round, so that after one full turn the segment has turned upside down, they sweep out a
	<strong>Möbius band</strong>. Look at either one near any point and you see the same thing — a little strip, a piece of
	circle times a piece of line. The difference is only global.
</p>

<Definition title="Vector bundle (informally, but honestly)" id="def-vector-bundle">
	<p>
		A <dfn>vector bundle of rank \(n\)</dfn> over a space \(B\) (the <em>base</em>) is a space \(E\) (the <em>total
		space</em>) with a continuous map \(\pi\colon E\to B\) such that
	</p>
	<ul>
		<li>
			each <dfn>fibre</dfn> \(E_b = \pi^{-1}(b)\), the part of \(E\) sitting over the point \(b\), is a vector space of
			dimension \(n\);
		</li>
		<li>
			\(E\) is <em>locally trivial</em>: every point of \(B\) has an open neighbourhood \(U\) over which \(E\) looks like a
			product, \(\pi^{-1}(U)\cong U\times\R^n\), by a homeomorphism that is linear on each fibre.
		</li>
	</ul>
	<p>
		A bundle of rank \(1\) is a <dfn>line bundle</dfn>. The bundle \(B\times\R^n\) itself is the <dfn>trivial bundle</dfn>;
		a bundle is called trivial if it is isomorphic to it.
	</p>
</Definition>

<p>
	The cylinder \(S^1\times\R\) is the trivial line bundle over the circle. The Möbius band is a line bundle over the circle
	too, and we are about to prove that it is not trivial. The tangent bundle of a surface is a bundle of rank \(2\).
</p>

<p>
	Local triviality is where the previous chapter comes in. Cover the base by open sets \(U_i\) over which the bundle is a
	product, with coordinates chosen on each. On an overlap \(U_i \cap U_j\) a fibre gets two coordinate systems, related by an
	invertible linear map \(g_{ij}(b)\), an invertible \(n\times n\) matrix depending continuously on \(b\). These <dfn
		>transition functions</dfn
	> satisfy \(g_{ik} = g_{ij}\,g_{jk}\) on triple overlaps — a Čech cocycle condition, written multiplicatively. For a line
	bundle each \(g_{ij}(b)\) is a nonzero number. For the Möbius band, covered by two arcs whose overlap has two pieces, we
	can take \(g = +1\) on one piece and \(g = -1\) on the other; for the cylinder, \(+1\) on both. Changing coordinates on
	the pieces changes \(g\) by a coboundary, exactly as in <Ref to="cohomology/sheaves" />.
</p>

<KeyIdea>
	<p>
		A vector bundle is assembled from trivial pieces glued by transition functions, and the transition functions form a Čech
		cocycle. Twisting is a cohomology class.
	</p>
</KeyIdea>

<h2 id="sections">Sections: choosing a vector at every point</h2>

<Definition title="Section" id="def-section">
	<p>
		A <dfn>section</dfn> of a vector bundle \(\pi\colon E \to B\) is a continuous map \(s\colon B\to E\) with \(\pi(s(b)) =
		b\) for every \(b\): a continuous choice of one vector \(s(b)\) in each fibre \(E_b\). The <dfn>zero section</dfn> picks
		the zero vector everywhere. A section of the tangent bundle of a surface is a <dfn>vector field</dfn>: an arrow tangent
		to the surface at every point.
	</p>
</Definition>

<p>
	Every bundle has the zero section. The interesting question is the opposite one:
</p>

<Question>
	<p>Does a given bundle have a section that is <em>nowhere zero</em>?</p>
</Question>

<p>
	For a trivial bundle the answer is yes: take a constant nonzero vector in \(B\times\R^n\). So whenever the answer is no,
	the bundle must be twisted. Try it on the cylinder and on the Möbius band.
</p>

<Figure num="4.8.1" size="wide" title="Sections of the cylinder and the Möbius band" hint="Drag the gold points in the strip · switch bundles · drag the 3D view">
	<BundleSections />
	{#snippet caption()}
		Above, the bundle: each blue segment is a fibre, a copy of \(\R\) whose midpoint is \(0\); the golden curve is a
		section. Below, the same band cut open along one fibre and laid flat. For the cylinder the two cut edges are glued
		directly; for the Möbius band they are glued upside down, so a curve that starts above the middle must arrive below it.
		Zeros of the section glow red.
	{/snippet}
</Figure>

<Proposition title="Every section of the Möbius band has a zero" id="prop-mobius">
	<p>
		Every section of the Möbius line bundle vanishes somewhere. Hence the Möbius band is not a trivial bundle.
	</p>
</Proposition>

<Proof>
	<p>
		Cut the band open along the fibre over one point of the circle, as in the strip of the figure. A section becomes a
		continuous function \(s\colon[0,2\pi]\to\R\), the height of the curve above the middle, and the upside-down gluing says
		\(s(2\pi) = -s(0)\). If \(s(0) = 0\) we have found a zero. Otherwise \(s(0)\) and \(s(2\pi)\) have opposite signs, and
		by the intermediate value theorem the continuous function \(s\) is zero somewhere in between.
	</p>
</Proof>

<p>
	For line bundles the question is decisive: a line bundle has a nowhere-zero section exactly when it is trivial. (Given
	such a section \(s\), every vector in the fibre over \(b\) is \(t\,s(b)\) for exactly one number \(t\), and \((b,t)\) are
	coordinates making the bundle a product.) So the Möbius band is the simplest twisted bundle, and the circle carries
	exactly two line bundles up to isomorphism: the cylinder and the Möbius band.
</p>

<p>
	There is a cohomology class that tells them apart. Only the <em>sign</em> of a transition function matters
	topologically (a positive number can be slid continuously to \(1\), but never through \(0\) to a negative one), so a line
	bundle gives a Čech cocycle of signs \(\pm1\), and its class lives in \(\check H^1(B;\{\pm1\}) = H^1(B;\Z/2)\).
</p>

<Definition title="The first Stiefel–Whitney class" id="def-w1">
	<p>
		The <dfn>first Stiefel–Whitney class</dfn> \(w_1(E)\in H^1(B;\Z/2)\) of a real vector bundle is the class of the signs
		of the determinants of its transition functions. It vanishes exactly when the bundle can be oriented — when the fibres
		can be given orientations that vary continuously. For a surface \(M\), \(w_1(TM) = 0\) exactly when \(M\) is <Term
			t="orientable">orientable</Term
		>.
	</p>
</Definition>

<p>
	For the Möbius band, \(w_1\) is the nonzero element of \(H^1(S^1;\Z/2)\cong\Z/2\) — the very class you met as the
	orientation sheaf's obstruction in <Ref to="cohomology/sheaves" />. In fact real line bundles over a reasonable space
	\(B\) correspond exactly to elements of \(H^1(B;\Z/2)\): there are \(2\) over a circle, \(4\) over a torus (\(H^1(T^2;\Z/2)
	\cong (\Z/2)^2\)), and only the trivial one over a sphere.
</p>

<Warning title="Where does the twist live?">
	<p>
		The Möbius band, as a space, has the same cohomology as a circle — it deformation retracts onto its core circle (<Ref
			to="topology/homotopy"
		/>). The twist is not visible in the cohomology of the band. It lives in the cohomology of the <em>base</em>, as the
		class \(w_1\in H^1(S^1;\Z/2)\) of the bundle.
	</p>
</Warning>

<h2 id="hairy-balls">Combing a hairy ball</h2>

<p>
	Now take the tangent bundle of the sphere. A nowhere-zero section would be a way to comb hair on a ball with no cowlick
	and no bald spot. In <Ref to="homology/invariance" /> you proved, using homology, that this is impossible: <Term
		t="hairy-ball-theorem">every continuous tangent vector field on \(S^2\) vanishes somewhere</Term
	>. On a torus, by contrast, you can comb the hair flat around the hole. Here is the picture, and in the next two sections
	we will find out exactly <em>how many</em> zeros a field must have, and why.
</p>

<Figure num="4.8.2" size="wide" title="Combing the sphere and the torus" hint="Choose a field · drag to rotate">
	<CombBall />
	{#snippet caption()}
		Hairs combed along a tangent vector field, with particles drifting along it. Every field on the sphere has zeros —
		two centres, a source and a sink, or a single double cowlick — and their indices always add up to \(2\). On the torus
		the hair can lie flat; a steady wind blowing across a doughnut creates four zeros, whose indices add up to \(0\).
	{/snippet}
</Figure>

<h3>The index of a zero</h3>

<p>
	A zero of a vector field can look like many things: a <em>source</em> (everything flows out), a <em>sink</em>
	(everything flows in), a <em>centre</em> (everything circulates), a <em>saddle</em> (flowing in along one line and out
	along another). To measure a zero by a single number, draw a small loop around it that encloses no other zero, walk
	once around the loop anticlockwise, and watch the arrow of the field. It comes back to where it started, so it has
	turned a whole number of times: the <Term t="winding-number">winding number</Term> of <Ref to="topology/homotopy" />,
	now applied to the direction of the field.
</p>

<Definition title="Index of a zero" id="def-index">
	<p>
		The <dfn>index</dfn> of an isolated zero of a vector field in the plane is the number of anticlockwise turns made by
		the field's arrow as you go once anticlockwise around a small loop enclosing the zero (and no other). On a surface, use
		coordinates near the zero and do the same.
	</p>
</Definition>

<p>
	Walking around a source, the arrow always points away from the centre, so it turns once with you: index \(+1\). The same
	happens for a sink (the arrow points inwards and still turns once) and for a centre (the arrow points sideways, and again
	turns once). At a saddle the arrow turns once the <em>other</em> way: index \(-1\). There are zeros of index \(+2\)
	(a <em>dipole</em>, like the field lines of a bar magnet seen from far away) and \(-2\) (a <em>monkey saddle</em>), and of
	every other integer. The index does not depend on the size of the loop: shrinking it changes the winding number
	continuously, and an integer that changes continuously does not change.
</p>

<Figure num="4.8.3" size="wide" title="Index explorer" hint="Choose a zero and walk around it · in the playground, drag zeros and the loop">
	<IndexExplorer />
	{#snippet caption()}
		The colour shows the direction of the field (gold points right, violet up-left, teal down-left…), so around a zero of
		index \(k\) the colours go round \(k\) times — backwards for negative \(k\). In the playground, the winding number of
		the dashed loop is always the sum of the indices of the zeros inside it, and a zero at infinity tops the total up to
		\(2\).
	{/snippet}
</Figure>

<p>
	The playground reveals the key additivity property. A big loop around several zeros has winding number equal to the
	<em>sum</em> of their indices: cut the region inside the loop into small pieces, each around one zero, and the turnings
	along the interior cuts cancel because each cut is walked twice, in opposite directions. It also reveals something
	stranger. Think of the plane as a sphere with one point missing — stereographic projection from <Ref
		to="topology/manifolds"
	/> — and fill that point back in. The field acquires one more zero, at infinity, and its index is \(2 - w\) where \(w\) is
	the sum of the finite indices. However you arrange the zeros, the total on the sphere is \(2\).
</p>

<h2 id="poincare-hopf">Poincaré–Hopf: the zeros know the shape</h2>

<Theorem label="Theorem (Poincaré–Hopf)" id="thm-poincare-hopf">
	<p>
		Let \(M\) be a closed surface and \(v\) a continuous tangent vector field on \(M\) with finitely many zeros. Then the sum
		of the indices of the zeros is the Euler characteristic of \(M\):
		\[ \sum_{v(p) = 0} \operatorname{ind}_p(v) = \chi(M). \]
	</p>
</Theorem>

<p>
	(The same statement holds for closed manifolds of any dimension, with the index defined using spheres instead of
	loops.) Henri Poincaré proved the theorem for surfaces in 1885; Heinz Hopf proved the general version in the 1920s. Check it
	against the figures:
</p>

<ul>
	<li>
		<strong>Sphere</strong>, \(\chi(S^2) = 2\): spinning about an axis gives two centres, \(1 + 1 = 2\); flowing from pole
		to pole gives a source and a sink, \(1 + 1 = 2\); the dipole field has a single zero of index \(2\).
	</li>
	<li>
		<strong>Torus</strong>, \(\chi(T^2) = 0\): the field “around the hole” has no zeros at all; the wind blowing across the
		doughnut has a source and a sink on the outside and two saddles on the inside, \(1 + 1 - 1 - 1 = 0\).
	</li>
	<li>
		<strong>Double torus</strong>, \(\chi = -2\): stand it on end and let water run down it. There is a source at the top,
		a sink at the bottom and four saddles, one at the top and bottom of each hole: \(1 + 1 - 4 = -2\).
	</li>
</ul>

<h3>Why it is true: a sketch</h3>

<p>
	A proof has two parts. First, <strong>the total index is the same for every vector field</strong> on \(M\). Two fields can
	be deformed into each other; during the deformation the zeros move, and they can collide, merge or split, but the total
	index never jumps — a loop surrounding all the zeros involved in a collision has a winding number that changes
	continuously, hence not at all. (Making this airtight takes care, but this is the heart of it.) Second, <strong
		>compute the total for one cleverly chosen field</strong
	>. Triangulate \(M\) (<Ref to="topology/simplicial-complexes" />) and let everything flow away from the vertices, along
	the edges to the midpoints of the edges, and then into the middles of the triangles.
</p>

<Figure num="4.8.4" title="The field that counts V − E + F">
	<TriangulationFlow />
	{#snippet caption()}
		On a triangulated surface, put a source at every vertex (index \(+1\)), a saddle at the middle of every edge (index
		\(-1\): flow arrives from the two ends and leaves towards the two neighbouring faces) and a sink at the centre of every
		face (index \(+1\)). The total index is \(V - E + F = \chi(M)\).
	{/snippet}
</Figure>

<p>
	This field has one zero at each vertex with index \(+1\), one at each edge with index \(-1\) and one at each face with
	index \(+1\). So its total
	index is \(V - E + F\), which is \(\chi(M)\) by <Ref to="topology/euler-characteristic" />. By the first part, every field
	has the same total. That is Poincaré–Hopf.
</p>

<Example title="Consequences">
	<ul>
		<li>
			<strong>The hairy ball theorem</strong> again: \(\chi(S^2) = 2\neq 0\), so every field on the sphere has at least one
			zero. At every moment there is a point on the Earth where the horizontal wind is still.
		</li>
		<li>
			<strong>The converse:</strong> on a closed connected surface (indeed manifold) with \(\chi = 0\) — the torus, the Klein
			bottle — there is a field with no zeros at all (Hopf).
		</li>
		<li>
			<strong>A surface with \(\chi \lt 0\)</strong> needs zeros of negative index, saddles: a double torus cannot be combed
			without at least one saddle-like parting.
		</li>
	</ul>
</Example>

<h3>The Euler class</h3>

<p>
	Poincaré–Hopf says that the number “sum of indices of a section” does not depend on the section. That number is the first
	example of a characteristic class. Here is the general idea, stated for oriented bundles of rank \(2\) over a closed
	oriented surface \(M\) (the tangent bundle of an orientable surface is one).
</p>

<Definition title="Euler class (for rank-2 bundles over surfaces)" id="def-euler-class">
	<p>
		Choose a section \(s\) with finitely many zeros and count them with their indices. The total does not depend on \(s\),
		and it defines the <dfn>Euler class</dfn> \(e(E)\in H^2(M;\Z)\cong \Z\) of the bundle. If \(E\) has a nowhere-zero
		section, then \(e(E) = 0\) (count the zeros of that section: there are none); over a surface the converse holds too. For
		the tangent bundle, Poincaré–Hopf says
		\[ e(TM) = \chi(M). \]
	</p>
</Definition>

<p>
	Two more descriptions show why \(e\) deserves to be a cohomology class. First, it is an <em>obstruction cocycle</em>:
	try to build a nowhere-zero section one cell at a time. Over the vertices and edges of a triangulation it is easy. Over
	each triangle, the section is already defined on the boundary loop, and it extends without zeros across the triangle
	exactly when its winding number around that loop is \(0\). Those winding numbers form a \(2\)-cochain, in fact a
	\(2\)-cocycle, and its class is \(e(E)\). Second, by Poincaré duality (<Ref to="cohomology/poincare-duality" />), the
	Euler class is the cohomology class dual to the zero set of a generic section, counted with signs. In every dimension,
	an oriented bundle of rank \(n\) has an Euler class in \(H^n\), and the same three descriptions apply.
</p>

<h2 id="curvature">Curvature from scratch</h2>

<p>
	The second half of our theme starts with a more elementary notion. How curved is a curve?
</p>

<h3>Curves: turning per unit length</h3>

<p>
	Drive along a road. On a straight stretch your steering wheel is centred; on a bend you turn it. The <dfn
		>curvature</dfn
	> \(\kappa\) of a curve at a point is the rate at which its direction turns, per unit of distance travelled:
	\[ \kappa = \frac{d\theta}{ds}, \]
	where \(\theta\) is the angle of the tangent direction and \(s\) is arc length. A straight line has \(\kappa = 0\). A
	circle of radius \(r\) turns through \(2\pi\) radians in a length of \(2\pi r\), so \(\kappa = 1/r\): small circles are
	very curved, huge ones nearly straight. For a plane curve we keep a sign: positive for left turns, negative for right.
</p>

<p>
	Add up the curvature all the way around a closed curve and you get the total angle through which its tangent turns,
	\(\oint \kappa\, ds\). Since the direction returns to where it started, the total is a whole number of full turns.
</p>

<Figure num="4.8.5" size="wide" title="The total turning of a closed curve" hint="Drag the gold points · try the presets">
	<TurningCurve />
	{#snippet caption()}
		The comb shows the curvature along the curve: gold teeth where it turns left, teal where it turns right, longer where
		it turns more sharply. However you drag the points, the dial shows a whole number of turns: \(+1\) for a simple loop
		traversed anticlockwise, \(0\) for a figure eight, \(2\) with an extra loop.
	{/snippet}
</Figure>

<Theorem label="Theorem (total turning)">
	<p>
		For a smooth closed plane curve, \(\oint \kappa\,ds = 2\pi k\), where the <dfn>turning number</dfn> \(k\) is an
		integer. If the curve is simple (does not cross itself), then \(k = \pm 1\) (Hopf's <em>Umlaufsatz</em>, 1935).
	</p>
</Theorem>

<p>
	This is a one-dimensional preview of Gauss–Bonnet: a local quantity, \(\kappa\), adds up to a topological one. For a
	polygon, all the turning happens at the corners, and the theorem becomes a school fact: the exterior angles of a convex
	polygon add up to \(360^\circ\).
</p>

<h3>Surfaces: two curvatures and their product</h3>

<p>
	At a point \(p\) of a surface, slice the surface with planes that contain the normal line at \(p\). Each slice is a curve
	through \(p\) with its own curvature, the <dfn>normal curvature</dfn> in that direction (counted positive if the curve
	bends towards the chosen normal). As the slicing plane turns around the normal, the normal curvature varies between a
	largest value \(k_1\) and a smallest \(k_2\), the <dfn>principal curvatures</dfn>; Leonhard Euler showed in 1760 that they
	occur in perpendicular directions.
</p>

<Definition title="Gaussian curvature" id="def-gaussian-curvature">
	<p>
		The <dfn>Gaussian curvature</dfn> of a surface at a point is the product of the principal curvatures,
		\[ K = k_1\,k_2. \]
	</p>
</Definition>

<ul>
	<li>
		<strong>Sphere of radius \(r\)</strong>: every slice is a great circle, \(k_1 = k_2 = 1/r\), so \(K = 1/r^2 \gt 0\).
	</li>
	<li>
		<strong>Cylinder of radius \(r\)</strong>: around the cylinder \(k = 1/r\), along it \(k = 0\) (a straight line); so
		\(K = 0\). A cylinder is a rolled-up sheet of paper, and curvature in only one direction does not count.
	</li>
	<li>
		<strong>Saddle</strong> (a mountain pass, or a Pringle): it curves up in one direction and down in the perpendicular
		one, so \(k_1 \gt 0 \gt k_2\) and \(K \lt 0\).
	</li>
	<li>
		<strong>Torus</strong>: the outer half is curved like a ball (\(K \gt 0\)), the inner half, around the hole, like a
		saddle (\(K \lt 0\)), and the top and bottom circles have \(K = 0\).
	</li>
</ul>

<p>
	Flipping the normal changes the sign of both \(k_1\) and \(k_2\), so their product \(K\) does not care which side is
	which: it makes sense even on a non-orientable surface. In 1827 Gauss discovered something much deeper about it.
</p>

<blockquote>
	“If a curved surface is developed upon any other surface whatever, the measure of curvature in each point remains
	unchanged.” — Gauss, <em>General Investigations of Curved Surfaces</em>, article 12 (trans. Morehead and Hiltebeitel)
</blockquote>

<p>
	“Developed” means bent without stretching, as you can bend paper but not a ping-pong ball. Gauss's <dfn
		>Theorema Egregium</dfn
	> (“remarkable theorem”) says that \(K\), although we defined it by looking at the surface from outside, can be measured
	by an ant who lives <em>in</em> the surface and only measures lengths and angles there. It explains why a slice of pizza
	stiffens when you fold it across (once bent one way, \(K = 0\) forbids bending the other way too), and why no flat map of
	the Earth can be perfect: the sphere has \(K \gt 0\), the paper \(K = 0\), and no amount of bending without stretching can
	change that.
</p>

<h3>Triangles on curved surfaces</h3>

<p>
	How could the ant measure \(K\)? With triangles. On a surface, the straightest possible paths are called <dfn
		>geodesics</dfn
	>; on a sphere they are arcs of great circles, like the routes of long-distance flights. A triangle whose sides are
	geodesics is a <dfn>geodesic triangle</dfn>. In the plane its angles add up to \(\pi\) (180°). On a sphere they add up to
	more.
</p>

<Figure num="4.8.6" size="wide" title="Angle excess on a sphere" hint="Drag the gold corners · drag elsewhere to turn the sphere">
	<AngleExcess />
	{#snippet caption()}
		A geodesic triangle on a sphere of radius \(R\). Its angles add up to more than \(180^\circ\), and the excess
		\(\alpha + \beta + \gamma - \pi\) equals the area divided by \(R^2\), which is the curvature \(K = 1/R^2\) integrated
		over the triangle. The octant triangle has three right angles: excess \(\pi/2\), and area one eighth of \(4\pi R^2\).
	{/snippet}
</Figure>

<Theorem label="Theorem (Gauss, 1827)" id="thm-angle-excess">
	<p>For a geodesic triangle \(T\) on a surface,</p>
	<p>
		\[ \alpha + \beta + \gamma - \pi = \iint_T K\, dA. \]
	</p>
	<p>
		On a sphere of radius \(R\), where \(K = 1/R^2\), the excess is the area of the triangle divided by \(R^2\). On a
		saddle-shaped surface (\(K \lt 0\)) the angles add up to <em>less</em> than \(\pi\).
	</p>
</Theorem>

<p>
	The symbol \(\iint_T K\,dA\) means: chop \(T\) into tiny pieces, multiply the curvature at each piece by its area, and
	add up — the <dfn>total curvature</dfn> of \(T\). Gauss wrote that this theorem, “if we mistake not, ought to be counted
	among the most elegant in the theory of curved surfaces.” It is the local seed of everything that follows.
</p>

<History title="A triangle in Hanover">
	<p>
		Gauss spent years surveying the Kingdom of Hanover, measuring the angles of enormous triangles between hilltops. In the
		abstract of his 1827 paper he reports that in the greatest triangle of his survey, whose longest side is almost fifteen
		geographical miles, the excess of the sum of the angles over two right angles “amounts almost to fifteen seconds” — the
		curvature of the Earth, visible in three angles.
	</p>
</History>

<h2 id="gauss-bonnet">The Gauss–Bonnet theorem</h2>

<p>
	Now cover a whole closed surface with geodesic triangles and add up Gauss's formula over all of them. The answer turns out
	not to depend on the shape at all.
</p>

<Theorem label="Theorem (Gauss–Bonnet)" id="thm-gauss-bonnet">
	<p>For every closed surface \(M\) with a smooth way of measuring lengths,</p>
	<p>
		\[ \iint_M K\, dA = 2\pi\,\chi(M). \]
	</p>
</Theorem>

<ul>
	<li>
		<strong>Round sphere</strong> of radius \(r\): \(K = 1/r^2\) and the area is \(4\pi r^2\), so the total is \(4\pi =
		2\pi\cdot 2\).
	</li>
	<li>
		<strong>Any deformed sphere</strong> — a potato, an egg, a dumbbell with a thin neck — also has total curvature exactly
		\(4\pi\). Where you add positive curvature by pulling out a bump, negative curvature appears around its base to
		compensate.
	</li>
	<li>
		<strong>Torus</strong>: the positive curvature of the outer half and the negative curvature of the inner half cancel
		exactly, \(2\pi\cdot 0 = 0\).
	</li>
	<li><strong>Surface of genus \(g\)</strong>: \(2\pi(2 - 2g)\); for the double torus, \(-4\pi\).</li>
</ul>

<h3>The polyhedral version, proved</h3>

<p>
	For surfaces made of flat triangles, all the curvature is concentrated at the vertices, and Gauss–Bonnet becomes exact
	arithmetic. At a vertex of a polyhedron, the triangles meeting there have angles adding up to less than \(2\pi\) (on a
	convex corner) or more (on a saddle-like corner).
</p>

<Definition title="Angle defect" id="def-angle-defect">
	<p>The <dfn>angle defect</dfn> at a vertex \(v\) of a triangulated surface is</p>
	<p>
		\[ \delta(v) = 2\pi - \big(\text{sum of the angles at } v \text{ of the triangles containing } v\big). \]
	</p>
</Definition>

<p>
	A cube has three right angles at each corner, defect \(2\pi - 3\pi/2 = \pi/2\), and eight corners: total \(4\pi\). René
	Descartes noticed, around 1630, that the total defect of every convex polyhedron is \(4\pi\) (in his units, eight right
	angles). Here is the general statement, with its complete proof.
</p>

<Theorem label="Theorem (discrete Gauss–Bonnet)" id="thm-discrete-gb">
	<p>For every closed surface made of flat triangles, of any shape,</p>
	<p>
		\[ \sum_{\text{vertices } v} \delta(v) = 2\pi\,(V - E + F) = 2\pi\,\chi(M). \]
	</p>
</Theorem>

<Proof>
	<p>
		Add up the defects: \(\sum_v \delta(v) = 2\pi V - (\text{sum of all angles of all triangles})\). Each flat triangle has
		angles adding up to \(\pi\), so the second term is \(\pi F\). On a closed surface every triangle has three edges and
		every edge lies in exactly two triangles, so \(3F = 2E\), that is \(F = 2E - 2F\). Therefore
		\[ \sum_v \delta(v) = 2\pi V - \pi F = 2\pi V - 2\pi E + 2\pi F = 2\pi(V - E + F), \]
		which is \(2\pi\chi(M)\) by the definition of the Euler characteristic.
	</p>
</Proof>

<p>
	Nothing in the proof used the shape: only that the triangles are flat and fit together into a closed surface. The angle
	defect at a vertex, divided by the area around the vertex, is a good estimate of the Gaussian curvature there, and as the
	triangles get finer the sum of defects becomes the integral \(\iint K\,dA\). Now play.
</p>

<Figure num="4.8.7" size="full" title="The Gauss–Bonnet sculptor" hint="Sliders reshape · click the surface to push or pull it · drag to rotate">
	<GaussBonnetSculptor />
	{#snippet caption()}
		A sphere made of 20,480 flat triangles (or a torus of 28,800), coloured by curvature — angle defect per unit area:
		gold where the surface curves like a ball, teal where it curves like a saddle, a bright line where the curvature
		changes sign. Pull out bumps, ripple it, squash it, twist it: the colours change everywhere, the positive and negative
		parts swell and shrink, and the total stays exactly \(2\pi\chi\): \(4\pi\) for the sphere, where \(\chi = 2\), and \(0\) for the torus.
	{/snippet}
</Figure>

<p>
	Watch the two bars under the figure. Pulling out a bump adds positive curvature at its tip and creates a ring of negative
	curvature around its base; the two changes cancel exactly, to the last decimal place. Only a change of topology — which
	no slider can make — could change the total.
</p>

<Remark title="With a boundary">
	<p>
		For a surface with boundary, Gauss–Bonnet picks up the turning of the boundary curve:
		\[ \iint_M K\,dA + \oint_{\partial M} k_g\,ds = 2\pi\chi(M), \]
		where \(k_g\) is the geodesic curvature (how much the boundary bends within the surface); if the boundary has
		corners, their exterior angles join the left-hand side. For a geodesic triangle, a disk with \(\chi = 1\) and
		straight sides, this is Gauss's angle-excess theorem:
		\[ \iint_T K\,dA + (\pi - \alpha) + (\pi - \beta) + (\pi - \gamma) = 2\pi. \]
		For a flat region it is the total turning theorem. Gauss proved the triangle version in 1827; Pierre Ossian Bonnet
		published the version for regions with curved boundaries in 1848.
	</p>
</Remark>

<h3>Why curvature is a cohomology class</h3>

<p>
	Here is the point of view that generalises. The expression \(K\,dA\) is a <Term t="k-form">\(2\)-form</Term> on
	\(M\) (<Ref to="cohomology/differential-forms" />). On a surface every \(2\)-form is closed, so it has a de Rham
	cohomology class in \(H^2_{\dR}(M)\) (<Ref to="cohomology/de-rham" />). Changing the shape (the way lengths are measured)
	changes \(K\,dA\) only by an exact form \(d\eta\), and by Stokes' theorem an exact form integrates to zero over a closed
	surface. So the <em>class</em> of \(\tfrac{1}{2\pi}K\,dA\) does not depend on the shape at all: it is the Euler class of
	the tangent bundle, and Gauss–Bonnet says \(\tfrac{1}{2\pi}\iint_M K\,dA = e(TM) = \chi(M)\).
</p>

<p>
	This idea — <em>curvature, a local quantity, represents a characteristic class, a global one</em> — is called <dfn
		>Chern–Weil theory</dfn
	>. In 1944 Shiing-Shen Chern gave an intrinsic proof of the Gauss–Bonnet formula for manifolds of every even dimension,
	and in 1946 he introduced the characteristic classes of complex vector bundles that now bear his name.
</p>

<h2 id="characteristic-classes">Characteristic classes</h2>

<p>
	We have met three cohomology classes attached to bundles: \(w_1\), which detects orientability; the Euler class \(e\),
	which obstructs nowhere-zero sections; and, through Gauss–Bonnet, \(e\) again, computed from curvature. They are members
	of a family.
</p>

<Definition title="Characteristic class (the idea)" id="def-characteristic-class">
	<p>
		A <dfn>characteristic class</dfn> assigns to every vector bundle \(E\to B\) (of a given kind) a cohomology class
		\(c(E) \in H^*(B)\) such that
	</p>
	<ul>
		<li>isomorphic bundles get the same class;</li>
		<li>
			it is <em>natural</em>: if \(f\colon B'\to B\) is a map and \(f^*E\) is the bundle over \(B'\) whose fibre over
			\(b'\) is the fibre of \(E\) over \(f(b')\), then \(c(f^*E) = f^*c(E)\) (cohomology pulls back, as in <Ref
				to="cohomology/cohomology-groups"
			/>);
		</li>
		<li>it vanishes on trivial bundles (at least in positive degrees).</li>
	</ul>
	<p>So a nonzero characteristic class proves that a bundle is twisted.</p>
</Definition>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>class</th><th>for</th><th>lives in</th><th>measures</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>Stiefel–Whitney \(w_1\)</td>
				<td>real bundles</td>
				<td>\(H^1(B;\Z/2)\)</td>
				<td>orientability (the Möbius band)</td>
			</tr>
			<tr>
				<td>Euler \(e\)</td>
				<td>oriented real bundles of rank \(n\)</td>
				<td>\(H^n(B;\Z)\)</td>
				<td>nowhere-zero sections; \(e(TM) = \chi\) (hairy ball)</td>
			</tr>
			<tr>
				<td>Chern \(c_1\)</td>
				<td>complex line bundles</td>
				<td>\(H^2(B;\Z)\)</td>
				<td>twisting of phases (monopoles, quantum Hall effect)</td>
			</tr>
		</tbody>
	</table>
</div>

<p>
	There are higher Stiefel–Whitney classes \(w_i\), higher Chern classes \(c_i\) and Pontryagin classes \(p_i\); Milnor
	and Stasheff's book is the classic guide. We look more closely at the one that physics needs most, \(c_1\).
</p>

<h3>Complex line bundles and the first Chern class</h3>

<p>
	A <dfn>complex line bundle</dfn> has fibres that are copies of the complex numbers \(\C\). Its transition functions are
	nonzero complex numbers \(g_{ij}(b)\), and topologically only their direction matters — a point of the unit circle,
	\(e^{i\alpha}\), a <em>phase</em>. Over the sphere, cover \(S^2\) by a northern patch \(U_N\) and a southern patch
	\(U_S\), each a disk, overlapping in a band around the equator. Over each disk the bundle is trivial (a disk is
	contractible), so the whole bundle is described by a single transition function on the band, which up to deformation
	is a map from the equator to the circle of phases,
	\[ g_{NS}(\varphi) = e^{in\varphi}, \]
	where \(\varphi\) is the longitude and \(n\) is an integer: the number of times the phase winds around as you go once
	around the equator. It must be an integer because \(g_{NS}\) has to return to its starting value after a full turn.
</p>

<Definition title="First Chern class and Chern number" id="def-chern">
	<p>
		The <dfn>first Chern class</dfn> \(c_1(L)\in H^2(B;\Z)\) of a complex line bundle \(L\) is its basic characteristic
		class. Over a closed oriented surface such as \(S^2\), it is a single integer, the <dfn>Chern number</dfn>; for the
		bundle built from \(g_{NS}(\varphi) = e^{in\varphi}\) it is \(n\). Complex line bundles over a reasonable space
		correspond exactly to elements of \(H^2(B;\Z)\) — over the sphere, one for each integer.
	</p>
</Definition>

<p>
	The tangent bundle of the sphere, with each tangent plane regarded as a copy of \(\C\) (rotating by \(90^\circ\) is
	multiplying by \(i\)), is a complex line bundle with Chern number \(2\) — once more, \(\chi(S^2)\). And Chern–Weil theory
	says that \(c_1\) can be computed from a curvature, just as Gauss–Bonnet computes \(e\): a way of comparing phases in
	nearby fibres (a <em>connection</em>) has a curvature \(2\)-form \(F\), and \(\frac{1}{2\pi}\iint F\) is the Chern number.
	We have not defined connections in this book; think of \(F\) as a curvature density, like \(K\,dA\). Physicists know it
	better as a magnetic field.
</p>

<h2 id="physics">Monopoles, Berry phases and topological matter</h2>

<p>
	This section is a guided tour rather than a course: it summarises some of the most celebrated appearances of
	characteristic classes in physics, with simplifications flagged as we go.
</p>

<h3>Dirac's monopole and the quantisation of charge</h3>

<p>
	A magnet always has two poles; cut it in half and you get two smaller magnets. But nothing in the equations of
	electromagnetism forbids an isolated magnetic pole, a <dfn>magnetic monopole</dfn>, whose field points straight out like
	the electric field of a point charge:
	\[ \mathbf B = g\,\frac{\hat{\mathbf r}}{r^2}, \qquad \text{flux through any sphere around it} = 4\pi g. \]
	Away from the monopole \(\mathbf B\) has zero divergence, so as a \(2\)-form it is closed — exactly the non-exact form
	on \(\R^3\setminus\{0\}\) that you met in <Ref to="cohomology/de-rham" />.
</p>

<p>
	Quantum mechanics describes magnetism not by \(\mathbf B\) but by a <em>vector potential</em> \(\mathbf A\) with
	\(\operatorname{curl}\mathbf A = \mathbf B\): the potential is what shifts the phase of a charged particle's
	wavefunction. But no such \(\mathbf A\) can exist on a whole sphere around the monopole. If it did, Stokes' theorem would
	give \(\iint_{S^2}\mathbf B\cdot d\mathbf S = \iint_{S^2}\operatorname{curl}\mathbf A\cdot d\mathbf S = 0\) (a closed
	surface has no boundary), contradicting the flux \(4\pi g\). In 1931 Paul Dirac found a way around this. In 1975 Tai Tsun
	Wu and Chen Ning Yang gave it its cleanest form, with two patches: use one potential \(\mathbf A_N\) on the northern patch
	and another, \(\mathbf A_S\), on the southern patch. On the overlap, the two describe the same field, so they differ by a
	gradient,
	\[ \mathbf A_N - \mathbf A_S = \nabla\chi, \qquad \chi = 2g\varphi, \]
	(here \(\chi\) is a function, not the Euler characteristic) and the wavefunctions of a particle of charge \(q\) in the two
	descriptions differ by the phase \(e^{iq\chi/\hbar}\) (in units where the speed of light is \(1\)).
</p>

<Figure num="4.8.8" size="wide" title="A monopole in two patches" hint="Change the charge · let it take any value · drag to rotate">
	<MonopolePatches />
	{#snippet caption()}
		Field lines stream out of the monopole. The northern patch (violet) and southern patch (teal) overlap in a band where
		the two descriptions are related by the phase \(e^{in\varphi}\), drawn as a ribbon that twists \(n\) times around the
		equator. For a whole number \(n\) the ribbon closes up; let \(n\) take other values and it tears — the phase is no longer
		single-valued.
	{/snippet}
</Figure>

<p>
	A wavefunction must have a single value at each point, so the phase \(e^{iq\chi/\hbar} = e^{i(2qg/\hbar)\varphi}\) must
	come back to itself after one turn around the equator. That forces
	\[ \frac{2qg}{\hbar} = n \in \Z. \]
	This is <dfn>Dirac's quantisation condition</dfn>, and it is exactly the statement that the transition function is a
	map of winding number \(n\): the monopole is a complex line bundle over the sphere with Chern number \(n\). Its
	consequence is remarkable. If a single magnetic monopole exists anywhere in the universe, every electric charge \(q\)
	must be a whole multiple of \(\hbar/2g\): <em>electric charge is quantised</em>, as it is observed to be. No monopole has
	ever been found; the argument remains one of the most beautiful explanations of why charges come in whole units.
</p>

<Warning title="Simplifications">
	<p>
		We used units with the speed of light equal to \(1\) and have not distinguished between conventions (Gaussian, SI) or
		tracked signs, which vary between books; in Gaussian units the condition reads \(qg = n\hbar c/2\). The phase
		\(e^{iq\chi/\hbar}\) is the essential physics, but deriving it properly needs the gauge principle of quantum mechanics.
	</p>
</Warning>

<h3>Berry's phase</h3>

<p>
	Take a quantum system that depends on some external knobs — a spin sitting in a magnetic field whose direction you can
	turn. Turn the knobs slowly around a loop and back. The system ends where it started, except for a phase, and in 1984
	Michael Berry showed that part of this phase is <em>geometric</em>: it depends only on the loop of knob settings, not on
	how fast you went around. For a spin-\(\frac12\) particle it is half the solid angle swept out by the direction of the
	field. Barry Simon recognised in 1983, having seen Berry's work before publication, that this phase is the holonomy of a
	connection on a complex line bundle over the space of knob settings — the phase picked up by going around a loop,
	exactly like the transition function of the monopole. Its curvature, the <dfn>Berry curvature</dfn>, integrates over a
	closed surface of settings to \(2\pi\) times a Chern number. For the spin it is the field of a monopole of strength
	\(\frac12\) sitting at the setting where the field vanishes: Dirac's monopole, reappearing in the space of parameters.
</p>

<h3>The quantum Hall effect and topological matter</h3>

<p>
	In 1980 Klaus von Klitzing measured the Hall resistance of a thin layer of electrons in a strong magnetic field at very
	low temperature and found plateaus at the values \(h/(\nu e^2)\), with \(\nu\) a whole number, so precisely
	reproducible that the effect now serves as the international standard of electrical resistance. In 1982 David Thouless,
	Mahito Kohmoto, Peter Nightingale and Marcel den Nijs (TKNN) explained the integers: the possible momenta of an electron
	in a crystal form a torus (the <em>Brillouin zone</em>), each filled band of electron states is a complex line bundle over
	that torus, and the Hall conductance is
	\[ \sigma_{xy} = \frac{e^2}{h}\sum_{\text{filled bands}} C_n, \]
	where \(C_n\) is the Chern number of the \(n\)-th band (signs depend on conventions). In units of \(e^2/h\), a number
	read off a laboratory instrument is a sum of characteristic numbers.
</p>

<p>
	In 1988 Duncan Haldane showed that a suitably designed crystal could have bands with nonzero Chern number even without
	an overall magnetic field — a <em>Chern insulator</em>. Since about 2005, related invariants (not Chern numbers, but
	\(\Z/2\)-valued cousins suited to materials with time-reversal symmetry) have been found and observed in the materials
	called <dfn>topological insulators</dfn>, which insulate in their interior but conduct along their surfaces. In 2016 the
	Nobel Prize in Physics went to Thouless, Haldane and J. Michael Kosterlitz for theoretical discoveries of topological
	phase transitions and topological phases of matter.
</p>

<KeyIdea title="Why physicists care">
	<p>
		An integer cannot change a little. If a physical quantity is a characteristic class — a Chern number, a winding number
		— then impurities, imperfections and noise, which deform the system only slightly, cannot change it at all. That is why
		the quantum Hall plateaus are exact, and why topology has become a design principle for robust physics.
	</p>
</KeyIdea>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Indices by hand">
	<p>
		Write a vector field \((P, Q)\) in the plane as the complex number \(P + iQ\), and \(z = x + iy\). Find the index at
		the origin of: (a) \((x, -y)\); (b) \((-y, x)\); (c) \((x^2 - y^2,\ 2xy)\); (d) \((x^2 - y^2,\ -2xy)\).
	</p>
	{#snippet hint()}
		<p>
			Write each field as \(z\), \(iz\), \(z^2\), \(\bar z\) or \(\bar z^2\) and follow its angle as \(z = e^{it}\) goes
			around the unit circle.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) \(x - iy = \bar z\); on the circle \(\bar z = e^{-it}\) turns once clockwise: index \(-1\) (a saddle). (b) \(-y +
			ix = iz = e^{i(t + \pi/2)}\): index \(+1\) (a centre). (c) \(x^2 - y^2 + 2ixy = z^2 = e^{2it}\): index \(+2\) (a
			dipole). (d) \(\bar z^2 = e^{-2it}\): index \(-2\) (a monkey saddle).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Water running down a double torus">
	<p>
		Stand a torus on its end (its hole facing you) and let water run down it; then do the same with a double torus. Find the
		zeros of the flow, their indices, and check Poincaré–Hopf.
	</p>
	{#snippet solution()}
		<p>
			The flow runs from the highest point (a source, \(+1\)) to the lowest point (a sink, \(+1\)). Each hole contributes
			two saddles, one at its top edge and one at its bottom edge (\(-1\) each). Torus: \(1 + 1 - 2 = 0 = \chi(T^2)\).
			Double torus: \(1 + 1 - 4 = -2 = \chi(\Sigma_2)\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Defects of polyhedra">
	<p>
		(a) Check that the total angle defect of a regular octahedron and of a regular icosahedron is \(4\pi\). (b) A “picture
		frame” torus is made by cutting a square hole through a thick square slab. Its outer box has 8 corners, each with three
		right angles; at each of the 8 corners of the hole, two faces of the hole meet the top or bottom face, which has an
		angle of \(270^\circ\) there. Find the total defect.
	</p>
	{#snippet solution()}
		<p>
			(a) Octahedron: 6 vertices, four equilateral triangles each, defect \(2\pi - 4\pi/3 = 2\pi/3\), total \(4\pi\).
			Icosahedron: 12 vertices, five triangles each, defect \(2\pi - 5\pi/3 = \pi/3\), total \(4\pi\).
		</p>
		<p>
			(b) Outer corners: defect \(2\pi - 3\cdot\pi/2 = \pi/2\) each, \(8\cdot\pi/2 = 4\pi\). Inner corners: angles
			\(\pi/2 + \pi/2 + 3\pi/2 = 5\pi/2\), defect \(-\pi/2\) each, \(8\cdot(-\pi/2) = -4\pi\). Total \(0 = 2\pi\chi(T^2)\).
			(The faces here are not all triangles, and the top face is not even a disk, but cutting the faces into flat triangles
			does not change the angle sums at the corners, and any new vertices inside a face or on an edge have angles adding up
			to exactly \(2\pi\), defect \(0\).)
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Curvature you can measure">
	<p>
		(a) On a sphere of radius \(R\), what is the area of a geodesic triangle with three right angles? (b) The Earth has
		radius about \(6371\) km. By how much does the angle sum of a geodesic triangle enclosing \(1\) million square
		kilometres exceed \(180^\circ\)?
	</p>
	{#snippet solution()}
		<p>
			(a) Excess \(3\cdot\pi/2 - \pi = \pi/2\), so the area is \(\frac{\pi}{2}R^2\) — one eighth of the sphere's area
			\(4\pi R^2\). (b) Excess \(= \text{area}/R^2 = 10^6 / 6371^2 \approx 0.0246\) radians \(\approx 1.41^\circ\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Zeros of sections">
	<p>
		Suppose a section of a line bundle over the circle crosses zero transversally — changing sign — at each of its zeros.
		Show that it has an even number of zeros on the cylinder and an odd number on the Möbius band.
	</p>
	{#snippet solution()}
		<p>
			Cut the circle open and write the section as a function \(s\) on \([0, 2\pi]\) with \(s(0)\ne 0\). Each zero is a
			change of sign, so the number of zeros is even exactly when \(s(2\pi)\) has the same sign as \(s(0)\). On the
			cylinder \(s(2\pi) = s(0)\): even. On the Möbius band \(s(2\pi) = -s(0)\): odd — in particular, never zero.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Total curvature">
	<p>
		(a) What is the total curvature of a closed orientable surface of genus \(3\)? (b) A dumbbell — two balls joined by a
		thin neck — is a deformed sphere. Where on it is the curvature negative, and why must there be such a place?
	</p>
	{#snippet solution()}
		<p>
			(a) \(\chi = 2 - 2\cdot 3 = -4\), so \(\iint K\,dA = -8\pi\). (b) Around the neck the surface curves like a saddle:
			around the neck it is bent one way and along it the other, so \(K \lt 0\). It must happen somewhere: the two nearly
			round balls already contribute almost \(4\pi\) each, but the total must be exactly \(4\pi\), so the neck must
			contribute about \(-4\pi\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Dirac's argument">
	<p>
		Suppose a monopole of strength \(g\) exists and particles of charges \(q_1\) and \(q_2\) both satisfy Dirac's condition
		\(2q_k g/\hbar \in \Z\). Show that every charge is a whole multiple of a smallest unit, and identify the unit. Why does
		the argument need only <em>one</em> monopole in the whole universe?
	</p>
	{#snippet solution()}
		<p>
			Dirac's condition says \(q_k = n_k\cdot\frac{\hbar}{2g}\) with \(n_k\in\Z\). So every charge is an integer multiple of
			\(q_0 = \hbar/(2g)\), and the ratio \(q_1/q_2 = n_1/n_2\) of any two charges is a rational number. (The charges
			that actually occur may all be multiples of a larger unit, but that unit is then itself a multiple of \(q_0\).) The
			condition comes from the requirement that each particle's wavefunction be single-valued
			around a sphere enclosing the monopole, and such spheres exist wherever the particle is; so the existence of a
			single monopole anywhere constrains every charge everywhere.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Turning numbers">
	<p>
		(a) Explain why the exterior angles of a convex polygon add up to \(360^\circ\). (b) What is the turning number of a
		figure eight, and why?
	</p>
	{#snippet solution()}
		<p>
			(a) Walking around the polygon anticlockwise, you turn left by the exterior angle at each corner and go straight along
			each side; after one lap you face your original direction, having turned exactly once: \(360^\circ\). (b) \(0\). The
			two lobes are mirror images of each other in the vertical line through the crossing, and the curve runs through the
			second lobe as the mirror image of how it ran through the first. A reflection swaps left turns and right turns, so
			whatever the first lobe turns (\(-270^\circ\) for the curve \((\sin t, \sin t\cos t)\), starting at the crossing),
			the second lobe turns the opposite amount, and the total is \(0\).
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>vector bundle</strong> is a continuously varying family of vector spaces, locally a product; its transition
			functions form a Čech cocycle. The cylinder is trivial; the Möbius band is twisted.
		</li>
		<li>
			A <strong>section</strong> chooses a vector in every fibre. Every section of the Möbius band vanishes somewhere
			(intermediate value theorem); a line bundle is trivial exactly when it has a nowhere-zero section. Its twist is
			<span class="nw">\(w_1\in H^1(B;\Z/2)\)</span>.
		</li>
		<li>
			Zeros of vector fields have <strong>indices</strong> (winding numbers): source, sink, centre \(+1\), saddle \(-1\).
			<strong>Poincaré–Hopf</strong>: the indices of any field on a closed surface add up to \(\chi(M)\); proof idea: a
			triangulation flow has total <span class="nw">\(V - E + F\)</span>. The <strong>Euler class</strong> packages this as a cohomology class.
		</li>
		<li>
			<strong>Curvature</strong>: \(\kappa = d\theta/ds\) for curves, \(K = k_1k_2\) for surfaces (intrinsic, by the Theorema
			Egregium). Geodesic triangles have angle excess \(\iint_T K\,dA\).
		</li>
		<li>
			<strong>Gauss–Bonnet</strong>: \(\iint_M K\,dA = 2\pi\chi(M)\), exactly true for angle defects of any triangulated
			surface; curvature represents the Euler class (Chern–Weil).
		</li>
		<li>
			<strong>Chern classes</strong>: complex line bundles over \(S^2\) are classified by the winding number \(n\) of a
			transition function \(e^{in\varphi}\). Physics: Dirac's monopole (charge quantisation), Berry's phase, and the quantum
			Hall effect, where the measured conductance, in units of \(e^2/h\), is a sum of Chern numbers.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />

<style>
	/* keep short formulas on one line */
	.nw {
		white-space: nowrap;
	}
</style>
