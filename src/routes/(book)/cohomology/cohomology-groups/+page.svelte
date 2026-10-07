<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
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
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import PairingPlayground from '$lib/figures/cohomology/cohomology-groups/PairingPlayground.svelte';
	import MatrixDuality from '$lib/figures/cohomology/cohomology-groups/MatrixDuality.svelte';
	import CohomologySteps from '$lib/figures/cohomology/cohomology-groups/CohomologySteps.svelte';
	import TorusFences from '$lib/figures/cohomology/cohomology-groups/TorusFences.svelte';
	import Contravariance from '$lib/figures/cohomology/cohomology-groups/Contravariance.svelte';
	import TorsionShift from '$lib/figures/cohomology/cohomology-groups/TorsionShift.svelte';
	import CoefficientTable from '$lib/figures/cohomology/cohomology-groups/CoefficientTable.svelte';

	const reading = [
		{
			title: 'Algebraic Topology, Chapter 3, §3.1',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard graduate treatment: “The Idea of Cohomology” (pp. 186–189), then the Universal Coefficient Theorem with full proofs, Ext, and the examples of this chapter. Read the opening pages first; the rest assumes more algebra.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Hodge Laplacians on Graphs',
			author: 'Lek-Heng Lim (SIAM Review 62, 2020)',
			url: 'https://arxiv.org/abs/1507.05379',
			note: 'Cohomology as “ker A / im B whenever AB = 0”, with real coefficients, harmonic representatives, and a dictionary of the jargon. The gentlest rigorous companion to this chapter.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Discrete Differential Geometry: An Applied Introduction',
			author: 'Keenan Crane',
			url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
			note: 'Discrete forms and the discrete exterior derivative on meshes: the same transposed boundary matrices, put to work in geometry processing.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'What, and why, is coHomology',
			author: 'K-Theory (YouTube channel)',
			url: 'https://www.youtube.com/watch?v=irv1qm_WMRY',
			note: 'Just over half an hour, algebra first: the (co)homology of tiny complexes as the failure of maps to be one-to-one or onto, with topology only at the end. A good companion to the “verdict on one map” view of this chapter.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'What is…cohomology? Or: Reversing arrows',
			author: 'Daniel Tubbenhauer',
			url: 'https://www.dtubbenhauer.com/slides/algebraic-topology/15-cohomology.pdf',
			note: 'Slides for a short video in his “What is…?” series on YouTube (index at dtubbenhauer.com/youtube.html): homology and cohomology as two ladders of arrows pointing opposite ways, and the solid tetrahedron worked mod 2 in both directions. The source of this chapter’s tetrahedron.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'History of Homological Algebra',
			author: 'Charles Weibel',
			url: 'https://metaphor.ethz.ch/x/2025/hs/401-3132-00L/ex/historyweibel.pdf',
			note: 'How cohomology was discovered in 1935, who named the coboundary, and how the universal coefficient problem was solved. Readable history with exact references.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Obstructions to Reality: Torsors & Visual Paradox',
			author: 'Robert Ghrist & Zoe Cooperband (2025)',
			url: 'https://arxiv.org/abs/2507.01226',
			note: 'Impossible figures on cylinders, Möbius bands, tori and Klein bottles: a playful place to see first cohomology with different coefficients at work.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Impossible by Degrees: Cohomology & Bistable Visual Paradox',
			author: 'Lewis Ghrist & Robert Ghrist (2026)',
			url: 'https://arxiv.org/abs/2602.09313',
			note: 'Cohomology with ℤ/2 coefficients from H⁰ to H², through gears, Necker cubes and tilings, with animations.',
			kind: 'paper' as const,
			free: true
		}
	];
</script>

<Epigraph author="Lek-Heng Lim" source="Hodge Laplacians on Graphs (2020)"
	>We have also isolated the algebra from the topology to show that a large part of cohomology and Hodge theory is nothing more than the
	linear algebra of matrices satisfying AB = 0.</Epigraph
>

<p class="lead">
	In the last chapter, measurements arrived as answers to puzzles: heights on a trail map, climbs on its trails, a staircase that could not
	exist. Now we build the machine. It will look almost exactly like homology — groups of cochains, a coboundary map, cocycles and coboundaries,
	and their quotient — and for good reason: it is homology run through a mirror.
</p>
<p class="lead">
	If the reflection were perfect, there would be little reason to build it. It is not, and the flaws are the reward. Maps between spaces
	will act on cohomology <em>backwards</em>. The twisted, finite part of homology — the torsion that made the projective plane strange in
	Part III — will reappear one floor higher than you would expect. And measurements, unlike places, can be multiplied, which later in this
	part lets cohomology tell apart spaces whose homology is identical.
</p>

<Ahead>
	<p>
		Cohomology groups are the stage for the rest of Part IV. De Rham’s theorem (<Ref to="cohomology/de-rham" />) will say that differential
		forms compute exactly the groups \(H^k(M;\R)\) of this chapter. The cup product (<Ref to="cohomology/cup-product" />) multiplies
		cohomology classes — something homology cannot do — and Poincaré duality (<Ref to="cohomology/poincare-duality" />) matches \(H^k\) with
		\(H_{n-k}\) on a manifold. The algebra behind this chapter’s last theorem, the Ext groups, is developed in
		<Ref to="big-picture/homological-algebra" />.
	</p>
</Ahead>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="cochain-groups">Cochain groups: measurements as homomorphisms</h2>

<p>
	A cochain is still what it was in the last chapter: a number on every simplex. This section only dresses that idea in the formal
	clothes the rest of Part IV expects, starting from the chains of <Ref to="homology/chains" />. For a simplicial complex \(K\), the
	group \(C_k(K)\) consists of formal sums
	\(c = \sum_i c_i\, \sigma_i\) of oriented \(k\)-simplices with integer coefficients — inventories of places, with multiplicities. Its
	elements add coefficient by coefficient, and the \(k\)-simplices themselves form a basis: \(C_k(K)\) is a
	<Term t="free-abelian-group">free abelian group</Term>, with one copy of \(\Z\) for each \(k\)-simplex.
</p>
<p>
	A measurement assigns a value to each \(k\)-simplex. The values can live in any abelian group \(G\) — the real numbers \(\R\), the
	integers \(\Z\), or the two-element group \(\Z/2\) of the gear ring — and the choice is called the <dfn>coefficients</dfn>. Once we know
	the value \(\varphi(\sigma)\) of a measurement on every simplex, there is only one sensible way to measure a chain: add up, with the
	multiplicities,
</p>
\[ \varphi\Big(\sum_i c_i\, \sigma_i\Big) \;=\; \sum_i c_i\, \varphi(\sigma_i). \]
<p>
	(Here \(c_i\, \varphi(\sigma_i)\) means \(\varphi(\sigma_i)\) added to itself \(c_i\) times, or subtracted if \(c_i\) is negative; that
	makes sense in any abelian group.) This rule respects addition, \(\varphi(c + c') = \varphi(c) + \varphi(c')\), and a function between
	groups that respects addition is a <Term t="homomorphism">homomorphism</Term>. Conversely, because the simplices form a basis, a homomorphism out of \(C_k(K)\) can take
	<em>any</em> values on the simplices, and those values determine it. So “a value on every \(k\)-simplex” and “a homomorphism
	\(C_k(K) \to G\)” are two descriptions of the same thing.
</p>

<Definition id="def-cochain-group">
	{#snippet head()}The cochain group \(C^k(K; G)\){/snippet}
	<p>The group of \(k\)-cochains of \(K\) with coefficients in \(G\) is</p>
	\[ C^k(K; G) \;=\; \Hom\big(C_k(K),\, G\big), \]
	<p>
		the set of all homomorphisms from \(C_k(K)\) to \(G\), added value by value: \((\varphi + \varphi')(c) = \varphi(c) + \varphi'(c)\).
		Read \(\Hom(A, B)\) aloud as “homs from \(A\) to \(B\)”. When \(G = \Z\) we often just write \(C^k(K)\).
	</p>
</Definition>

<p>
	Concretely, a \(k\)-cochain is a list of \(n_k\) values in \(G\), one for each of the \(n_k\) simplices of dimension \(k\), so
	\(C^k(K; G) \cong G^{n_k}\). The hollow triangle has \(C^1(K;\Z) \cong \Z^3\): three integers, one per edge. The simplest cochains are the
	<dfn>indicator cochains</dfn>: for a \(k\)-simplex \(\tau\), the cochain \(\mathbf 1_\tau\) is \(1\) on \(\tau\) and \(0\) on every other
	\(k\)-simplex. Every cochain is a combination of them, \(\varphi = \sum_\tau \varphi(\tau)\, \mathbf 1_\tau\).
</p>
<p>
	With real coefficients this is a familiar construction: \(C^k(K; \R)\) is the <Term t="dual-space">dual space</Term> of the vector space
	\(C_k(K;\R)\) from <Ref to="foundations/linear-algebra" />, its elements are the linear functionals on chains, and the indicator
	cochains form the dual basis. Cochains are to chains what row vectors are to column vectors.
</p>
<p>
	The value of a cochain on a chain gets its own notation, the <Term t="pairing">pairing</Term> of <Ref to="cohomology/cochains" />:
</p>
\[ \ip{\varphi}{c} \;=\; \varphi(c) \;\in\; G. \]
<p>Think of it as integrating the measurement \(\varphi\) over the place \(c\). Try it.</p>

<Figure num="4.2.1" title="Measuring a chain" hint="Tap an edge, then ±1 to change its coefficient · try the presets">
	<PairingPlayground />
	{#snippet caption()}
		A cochain \(\varphi\) is a number on each edge (gold); a chain \(c\) is a combination of edges (violet, with its coefficients). The
		pairing \(\ip{\varphi}{c}\) multiplies and adds. Switch to \(\varphi = \delta f\): now the pairing depends only on the boundary of the
		chain, \(\ip{\delta f}{c} = \ip{f}{\partial c}\), so it is \(0\) on every loop.
	{/snippet}
</Figure>

<Remark title="Why insist on homomorphisms?">
	<p>
		If a cochain is “just a list of values”, why dress it up as \(\Hom(C_k(K), G)\)? Because the second description does not depend on
		choosing the simplices as a basis, and because it tells us at once how cochains behave under maps: a homomorphism can be composed
		with other homomorphisms. That composition is where the reversal of arrows will come from, later in this chapter.
	</p>
</Remark>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="the-coboundary-map">The coboundary map is a transpose</h2>

<p>
	In <Ref to="cohomology/cochains" /> we met the coboundary as the discrete gradient and the discrete curl, and noticed that both are
	“evaluate on the boundary”. Here is the definition in every degree and for every coefficient group.
</p>

<Definition id="def-coboundary-map" title="The coboundary map">
	<p>For a \(k\)-cochain \(\varphi \in C^k(K; G)\), its coboundary \(\delta\varphi \in C^{k+1}(K; G)\) is the composite</p>
	\[ \delta\varphi \;=\; \varphi \circ \partial_{k+1}, \qquad\text{that is,}\qquad (\delta\varphi)(\sigma) = \varphi(\partial\sigma). \]
	<p>For a \((k+1)\)-simplex \(\sigma = [v_0, \dots, v_{k+1}]\) this reads</p>
	\[ (\delta\varphi)\big([v_0, \dots, v_{k+1}]\big) \;=\; \sum_{i=0}^{k+1} (-1)^i\, \varphi\big([v_0, \dots, \hat v_i, \dots, v_{k+1}]\big), \]
	<p>
		where the hat over \(v_i\) means “leave \(v_i\) out”. On an edge \([v_0, v_1]\) this is \(\varphi(v_1) - \varphi(v_0)\), the “head
		minus tail” of the last chapter; on a triangle it is the circulation \(\varphi([v_1,v_2]) - \varphi([v_0,v_2]) + \varphi([v_0,v_1])\).
	</p>
</Definition>

<Warning title="Other sign conventions">
	<p>
		Some books, especially in homological algebra, define the coboundary with an extra sign, \(\delta\varphi = (-1)^{k+1}\varphi\circ\partial\).
		Changing the sign of a map changes neither its kernel nor its image, so every cocycle, coboundary and cohomology group comes out the
		same. Signs only start to matter for products and duality, and this book always uses Hatcher’s convention above: no extra sign.
	</p>
</Warning>

<h3>The matrix of \(\delta\)</h3>
<p>
	Choose the simplices as bases: \(k\)-simplices for \(C_k\) and their indicator cochains for \(C^k\). Then \(\partial_{k+1}\) is a matrix with
	a row for each \(k\)-simplex and a column for each \((k+1)\)-simplex; column \(\sigma\) lists the faces of \(\sigma\) with their signs. What
	is the matrix of \(\delta_k\colon C^k \to C^{k+1}\)? Its column for \(\tau\) is \(\delta \mathbf 1_\tau\), and its entry in row \(\sigma\) is
</p>
\[ (\delta\mathbf 1_\tau)(\sigma) \;=\; \mathbf 1_\tau(\partial\sigma) \;=\; \text{the coefficient of } \tau \text{ in } \partial\sigma \;=\; \text{the entry of } \partial_{k+1} \text{ in row } \tau,\ \text{column } \sigma. \]
<p>Rows and columns have swapped places:</p>

<Proposition id="prop-transpose">
	{#snippet head()}\(\delta\) is the transpose of \(\partial\){/snippet}
	<p>In the bases of simplices and indicator cochains, the matrix of \(\delta_k\colon C^k(K) \to C^{k+1}(K)\) is the transpose of the boundary matrix:</p>
	\[ \delta_k \;=\; \partial_{k+1}^{\mathsf T}. \]
</Proposition>

<p>
	Read the formula both ways. A column of \(\partial\) answers “what are the faces of this simplex?”. The same numbers, read as a row of
	\(\delta\), answer “which values does \(\delta\varphi\) on this simplex look at?”. And a column of \(\delta\) — the coboundary of an
	indicator \(\mathbf 1_\tau\) — answers “which simplices have \(\tau\) as a face?”: \(\delta\mathbf 1_\tau\) is \(\pm 1\) on the simplices one
	dimension up that contain \(\tau\), its <em>cofaces</em>. The boundary looks down to faces; the coboundary looks up to cofaces.
</p>
<p>
	Daniel Tubbenhauer, in his video <em>What is…cohomology? Or: Reversing arrows</em>, watches this happen on the solid tetrahedron with
	vertices \(0, 1, 2, 3\), working mod 2 so that every sign disappears. Going down, the tetrahedron has four triangles as its boundary, a
	triangle has three edges and an edge has two ends. Going up, a vertex reaches the three edges that leave it, an edge the two
	triangles that contain it, and a triangle the one solid it bounds:
</p>
\[ \delta\mathbf 1_{[0]} = \mathbf 1_{[0,1]} + \mathbf 1_{[0,2]} + \mathbf 1_{[0,3]}, \qquad \delta\mathbf 1_{[0,1]} = \mathbf 1_{[0,1,2]} + \mathbf 1_{[0,1,3]}, \qquad \delta\mathbf 1_{[0,1,2]} = \mathbf 1_{[0,1,2,3]}. \]
<p>His slogan fits on one line: “Homology goes down, cohomology goes up.”</p>

<Figure num="4.2.2" title="One matrix, read two ways" hint="Hover a matrix entry · tap a vertex or edge">
	<MatrixDuality />
	{#snippet caption()}
		The boundary matrix \(\partial\) and the coboundary matrix \(\delta = \partial^{\mathsf T}\) of two triangles sharing an edge. Hover an
		entry: it lights up the same pair (face, coface) in the picture and the mirrored entry in the other matrix. Tap a vertex (or an edge) to
		put a \(1\) on it: its coboundary is \(\pm 1\) on the edges (or triangles) it borders — a column of \(\delta\), a row of \(\partial\).
	{/snippet}
</Figure>

<h3>The coboundary of a coboundary</h3>
<p>For every cochain \(\varphi\) and every simplex \(\sigma\),</p>
\[ (\delta\delta\varphi)(\sigma) \;=\; (\delta\varphi)(\partial\sigma) \;=\; \varphi(\partial\partial\sigma) \;=\; \varphi(0) \;=\; 0, \]
<p>
	so \(\delta \circ \delta = 0\), as a direct consequence of \(\partial \circ \partial = 0\). In matrices it is one line of
	<Ref to="foundations/linear-algebra" />: \(\delta_{k+1}\delta_k = \partial_{k+2}^{\mathsf T}\partial_{k+1}^{\mathsf T} = (\partial_{k+1}\partial_{k+2})^{\mathsf T} = 0\),
	because the transpose of a product is the product of the transposes in the opposite order.
</p>
<p>
	The tetrahedron shows the same thing without matrices. Climb twice from the vertex \(0\): first to its three edges, then from each
	edge to its two triangles. Every triangle at \(0\) contains exactly two edges at \(0\), so it is reached twice — \([0,1,2]\) by way of
	\([0,1]\) and by way of \([0,2]\) — and mod 2 the two arrivals cancel. (With integers they arrive with opposite signs.) A coface of a
	coface is always reached along two routes, which is \(\partial\partial = 0\) read upside down.
</p>
<p>The cochain groups and coboundary maps form a sequence in which each map raises the degree:</p>
\[ 0 \lra C^0(K;G) \xto{\delta_0} C^1(K;G) \xto{\delta_1} C^2(K;G) \xto{\delta_2} \cdots, \qquad \delta_{k+1}\circ\delta_k = 0. \]
<p>
	Such a sequence is a <dfn>cochain complex</dfn>. Compare the <Term t="chain-complex">chain complex</Term> of Part III,
	\(\cdots \to C_2 \to C_1 \to C_0 \to 0\), whose maps lower the degree: same groups, arrows reversed. Why did homology point its
	arrows downwards in the first place? “For no good reason,” says Tubbenhauer: as a bare sequence of groups and maps, a cochain complex
	is a chain complex numbered the other way. The surprises of this chapter come from somewhere else, from the fact that its groups
	<em>measure</em> chains.
</p>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="cohomology-groups-defined">Cocycles, coboundaries and cohomology</h2>

<p>
	Everything is now in place to copy the definition of homology from <Ref to="homology/homology-groups" />, with every arrow reversed.
</p>

<Definition id="def-cohomology">
	{#snippet head()}Cohomology groups{/snippet}
	<p>Let \(K\) be a simplicial complex and \(G\) an abelian group.</p>
	<ul>
		<li>
			The <dfn>\(k\)-cocycles</dfn> are the cochains with zero coboundary: \(Z^k = \ker \delta_k = \setb{\varphi \in C^k(K;G)}{\delta\varphi = 0}\).
		</li>
		<li>
			The <dfn>\(k\)-coboundaries</dfn> are the coboundaries of \((k-1)\)-cochains: \(B^k = \im \delta_{k-1} = \setb{\delta g}{g \in C^{k-1}(K;G)}\),
			with \(B^0 = 0\).
		</li>
	</ul>
	<p>
		Because \(\delta\delta = 0\), every coboundary is a cocycle: \(B^k \subseteq Z^k\). The <dfn>\(k\)-th cohomology group</dfn> is the
		quotient
	</p>
	\[ H^k(K; G) \;=\; Z^k / B^k \;=\; \frac{\ker \delta_k}{\im \delta_{k-1}}. \]
	<p>
		Its elements are <dfn>cohomology classes</dfn> \([\varphi] = \varphi + B^k\). Two cocycles in the same class are called
		<dfn>cohomologous</dfn>: they differ by a coboundary.
	</p>
</Definition>

<Notation>
	<p>
		Upper indices for cohomology, lower indices for homology: \(H^k\) and \(H_k\), \(C^k\) and \(C_k\), with \(\delta\) raising the degree
		and \(\partial\) lowering it. With integer coefficients we drop the coefficients, \(H^k(K) = H^k(K;\Z)\), and \(H^*(K)\) means all the
		groups \(H^0(K), H^1(K), \dots\) together. For a space \(X\) triangulated by \(K\) we write \(H^k(X)\): as with homology, the answer does
		not depend on the triangulation.
	</p>
</Notation>

<p>
	Every word has a picture from the last chapter. A 1-cocycle is an edge labelling that passes every local test (zero curl on every filled
	triangle). A 1-coboundary is a gradient. Two 1-cocycles are cohomologous when one turns into the other by adding bumps at vertices, so a
	class in \(H^1\) is a global obstruction with all the irrelevant detail forgotten. In degree 0 there are no coboundaries, so
	\(H^0 = Z^0\) is the group of locally constant functions. In degree 2 the question is “is this measurement on triangles the curl of
	something?”, and \(H^2\) collects the answers “no”.
</p>

<h3>Counting dimensions over a field</h3>
<p>
	When the coefficients form a field \(F\) — the real numbers, the rationals, or \(\Z/2\) — every group above is a vector space and we can
	count dimensions with rank–nullity from <Ref to="foundations/linear-algebra" />. Writing \(n_k\) for the number of \(k\)-simplices,
	\(\dim Z^k = n_k - \rank \delta_k\) and \(\dim B^k = \rank \delta_{k-1}\), so
</p>
\[ \dim H^k(K; F) \;=\; n_k - \rank \delta_k - \rank \delta_{k-1} \;=\; n_k - \rank \partial_{k+1} - \rank \partial_k \;=\; \dim H_k(K; F), \]
<p>
	because a matrix and its transpose have the same rank. <strong>Over a field, cohomology and homology have the same dimensions</strong>:
	the Betti numbers count both. (In fact \(H^k(K;F)\) is the dual vector space of \(H_k(K;F)\), as we will see.) In particular the Euler
	characteristic can be read off either: \(\chi(K) = \sum_k (-1)^k \dim H^k(K; F)\). The integers will be more interesting.
</p>

<Question>
	<p>
		The definition of \(H^k\) is the definition of \(H_k\) with \(\partial\) replaced by \(\delta = \partial^{\mathsf T}\). Before reading on,
		guess: is \(H^1(K;\Z)\) always the same group as \(H_1(K;\Z)\)? (The projective plane will answer.)
	</p>
</Question>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="first-computations">First computations: graph, circle, sphere, torus</h2>

<h3>Graphs</h3>
<p>
	A graph has no triangles, so \(\delta_1 = 0\) and every 1-cochain is a cocycle. The last chapter did the rest: \(H^0 = G^{c}\), one value
	per connected piece, and \(H^1 = C^1/\im\delta_0 \cong G^{E - V + c}\), one free value per edge outside a spanning tree — the loop sums of
	the fundamental loops. With \(G = \Z\): \(H^0 \cong \Z^{b_0}\) and \(H^1 \cong \Z^{b_1}\).
</p>
<p>
	Read the graph case as a verdict on one map. The cochain complex is \(0 \to C^0 \xto{\delta} C^1 \to 0\), so \(H^0 = \ker\delta\) measures
	how far \(\delta\) is from being one-to-one (the “\(+\,C\)”: different heights with the same climbs), and \(H^1 = C^1/\im\delta\)
	measures how far it is from being onto (the climbs that no heights produce: the obstructions). Every cohomology group asks the same
	question of the \(\delta\) on either side of it: what is left over that the maps fail to account for? The YouTube channel K-Theory, in
	<em>What, and why, is coHomology</em>, works through such tiny complexes (one term, two terms, a short exact sequence) and turns to
	spaces only at the end.
</p>

<h3>The circle and the torus, step by step</h3>
<p>
	The next figure computes the cohomology of the circle (as a hollow triangle) and of the torus. For the torus we use Hatcher’s small model:
	a square whose opposite sides are glued, cut along a diagonal into two triangles. All four corners become a single vertex, so this is not
	a simplicial complex but a <Term t="delta-complex">Δ-complex</Term> (<Ref to="topology/simplicial-complexes" />); chains, cochains and
	(co)boundary matrices work exactly the same way, and the answers agree with those of genuine triangulations.
</p>

<Figure num="4.2.3" title="Computing H* step by step" hint="Use ‹ › to step · switch between circle and torus">
	<CohomologySteps />
	{#snippet caption()}
		Cohomology in four moves: write down the cochains, write down \(\delta\) as a transposed boundary matrix, find the cocycles (the kernel)
		and the coboundaries (the image), and take the quotient. The circle gives \(H^0 = H^1 = \Z\); the torus gives \(H^0 = \Z\),
		\(H^1 = \Z^2\) and \(H^2 = \Z\).
	{/snippet}
</Figure>

<p>
	For the circle, \(\delta_0\) has rank 2, its kernel is the constants (\(H^0 \cong \Z\)), and since there are no triangles,
	\(H^1 = C^1/\im\delta_0\). The loop sum \(\psi \mapsto \psi_{01} + \psi_{12} - \psi_{02}\) vanishes exactly on the image and takes every
	integer value, so it identifies \(H^1 \cong \Z\). A generator is the cochain that is \(1\) on a single edge: a fence across the loop.
</p>
<p>
	For the torus, the single vertex makes \(\delta_0 = 0\). Both triangles have boundary \(a + b - c\), so the cocycle condition is
	\(\varphi(c) = \varphi(a) + \varphi(b)\), with two free choices; nothing is divided out, and \(H^1 \cong \Z^2\), with basis
</p>
\[ \alpha = (1, 0, 1), \qquad \beta = (0, 1, 1) \qquad (\text{values on } a, b, c). \]
<p>
	In degree 2 the two triangles carry values \(p\) and \(q\); the coboundaries are exactly the pairs with \(p = q\), and \((p, q) \mapsto p - q\)
	identifies \(H^2 \cong \Z\). The number \(p - q\) is the value on \(L - U\), the 2-cycle that represents the whole torus.
</p>

<h3>The sphere</h3>
<p>
	Take the hollow tetrahedron, with four triangles, six edges and four vertices. It is connected, so \(H^0 \cong \Z\). Every 1-cocycle is a
	coboundary: a 1-cocycle passes every local test, and every loop on the sphere is the boundary of a union of triangles, so all its loop
	sums vanish and the gradient test of <Ref to="cohomology/cochains" /> makes it a gradient. Hence \(H^1 = 0\). In degree 2 every cochain is
	a cocycle (there are no 3-simplices). Let \([S^2] = \partial[0,1,2,3]\) be the 2-cycle made of all four triangles with their signs. The map
	\(\varphi \mapsto \ip{\varphi}{[S^2]}\) kills every coboundary, by Stokes: \(\ip{\delta\psi}{[S^2]} = \ip{\psi}{\partial [S^2]} = 0\). It
	takes the value \(\pm 1\) on each triangle indicator, so it hits every integer. Its kernel is exactly the coboundaries, and you can
	see why by pushing weight around. Any two triangles of the tetrahedron share an edge, and adding a multiple of the coboundary of that
	edge’s indicator moves weight between those two triangles and touches no others (the exercise “Two triangles of the sphere” makes one
	such move). Three moves pile all of a cochain’s weight onto a single triangle without changing its value on \([S^2]\). If that value
	was \(0\), nothing is left on the pile, so the cochain was a coboundary all along. So
</p>
\[ H^0(S^2) \cong \Z, \qquad H^1(S^2) = 0, \qquad H^2(S^2) \cong \Z, \]
<p>
	and any single triangle indicator generates \(H^2\): a measurement that puts all its weight on one tiny triangle is, up to coboundaries,
	the same as one spread evenly over the sphere — only the total \(\ip{\varphi}{[S^2]}\) matters.
</p>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="fences-and-pairing">Fences: what a 1-cocycle measures</h2>

<p>
	Here is the most useful picture of a 1-cocycle on a surface. Hatcher describes it for coefficients \(\Z/2\): if \(\psi\) is a cocycle, then
	on each triangle it takes the value \(1\) on an even number of edges, so we can draw short arcs inside each triangle joining the edges with
	value \(1\) in pairs. The arcs link up into curves — in his words, “a collection \(C_\psi\) of disjoint curves in \(X\) crossing the
	1-skeleton transversely, such that the number of intersections of \(C_\psi\) with each edge is equal to the value of \(\psi\) on that edge.”
	With integer coefficients the curves get a direction, and crossings count with signs.
</p>
<p>
	Call such curves a <dfn>fence</dfn>. Then the value of the cocycle on a closed loop is the number of times the loop crosses the
	fence, counted with sign. And if \(\psi = \delta f\), Hatcher notes, the curves are “something like level curves for a function \(\varphi\)
	with \(\delta\varphi = \psi\)”: \(f\) jumps by one every time you step across the fence, so a fence coming from a function must separate
	the surface into regions at different heights.
</p>

<Figure num="4.2.4" title="Fences on a torus" hint="Drag to rotate · choose a fence and a loop · play the wiggle">
	<TorusFences />
	{#snippet caption()}
		A 1-cocycle drawn as a fence standing on the torus. Its value on the golden loop is the number of crossings, counted with sign. The fence
		\(\alpha\), across the tube, counts trips around the hole; \(\beta\), along the tube, counts trips around the tube. Wiggling a fence adds a
		coboundary: crossings may appear, but only in cancelling pairs. A fence around a little disk is a coboundary, and every loop crosses it
		a net zero times.
	{/snippet}
</Figure>

<p>
	The figure is the torus computation made visible. The cocycle \(\alpha = (1, 0, 1)\) is \(1\) on the edges \(a\) and \(c\) and \(0\) on
	\(b\): as a fence, it is a circle running across the square in the \(b\) direction, which the loop \(a\) crosses once and the loop \(b\) never
	crosses. So \(\ip{\alpha}{a} = 1\) and \(\ip{\alpha}{b} = 0\); likewise \(\ip{\beta}{a} = 0\) and \(\ip{\beta}{b} = 1\). The two classes
	\(\alpha, \beta\) are exactly the measurements “how many times around in direction \(a\)” and “how many times around in direction \(b\)”.
</p>

<h3>Measuring classes with classes</h3>
<p>
	The figure also shows that wiggling the fence does not change the count on a closed loop, and that moving the loop does not either.
	Both facts are Stokes’ formula \(\ip{\delta\varphi}{c} = \ip{\varphi}{\partial c}\) from the last chapter.
</p>

<Proposition id="prop-pairing" title="The pairing is defined on classes">
	<p>
		If \(\varphi\) is a cocycle and \(z\) is a cycle, the value \(\ip{\varphi}{z}\) depends only on the cohomology class \([\varphi]\) and the
		homology class \([z]\). So there is a well-defined pairing
	</p>
	\[ H^k(K; G) \times H_k(K) \lra G, \qquad \big\langle [\varphi], [z] \big\rangle = \varphi(z). \]
</Proposition>
<Proof>
	<p>
		Change the cocycle by a coboundary: \(\ip{\varphi + \delta g}{z} = \ip{\varphi}{z} + \ip{g}{\partial z} = \ip{\varphi}{z}\), because
		\(\partial z = 0\). Change the cycle by a boundary: \(\ip{\varphi}{z + \partial c} = \ip{\varphi}{z} + \ip{\delta\varphi}{c} = \ip{\varphi}{z}\),
		because \(\delta\varphi = 0\).
	</p>
</Proof>

<p>
	This is often called the Kronecker pairing. So cohomology classes are measurements of homology classes: each \([\varphi] \in H^k\) gives
	a homomorphism \(H_k(K) \to G\). For the
	torus, \(\alpha\) and \(\beta\) are the “dual basis” to the loops \(a\) and \(b\), and every class in \(H^1(T^2)\) is determined by its two
	values \(\ip{\varphi}{a}\) and \(\ip{\varphi}{b}\). Whether a class is <em>always</em> determined by its values on cycles is the question
	the Universal Coefficient Theorem answers, at the end of this chapter: almost, but not quite.
</p>

<Warning title="“Cohomology classes are loops”">
	<p>
		You may read that on the torus, cohomology classes “are” loops. On a closed oriented surface each fence is itself a loop, so there is a
		correspondence — it is Poincaré duality, the subject of <Ref to="cohomology/poincare-duality" />. But notice which loop: the class
		\(\alpha\) that <em>measures</em> the loop \(a\) is a fence running <em>across</em> \(a\), parallel to \(b\). It is easy to get this the wrong
		way round, and the correspondence needs an orientation (or \(\Z/2\) coefficients) to make sense at all.
	</p>
</Warning>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="contravariance">Arrows reverse: pulling measurements back</h2>

<p>
	In <Ref to="homology/invariance" /> a map of spaces \(f\colon X \to Y\) pushed chains forward: a simplex of \(X\) is sent to its image in
	\(Y\), giving a chain map \(f_\sharp\colon C_k(X) \to C_k(Y)\) and an <Term t="induced-map">induced map</Term>
	\(f_*\colon H_k(X) \to H_k(Y)\). Places travel in the direction of the map.
</p>
<p>
	Measurements travel the other way. Your drive to work is a map from the half-hour of the journey into the country; a weather map is a
	measurement on the country. The weather map gives you a temperature for every minute of the drive — read it off wherever you happen
	to be — but no record of the drive will ever produce a weather map. A map \(X \to Y\) carries measurements on \(Y\) back to
	\(X\), and not the other way. In symbols: if \(\varphi\) measures chains of \(Y\), we can measure a chain \(c\) of \(X\) by first
	pushing it into \(Y\) and then measuring there. That defines a cochain on \(X\),
</p>
\[ f^*\varphi \;=\; \varphi \circ f_\sharp, \qquad (f^*\varphi)(c) = \varphi\big(f_\sharp(c)\big), \]
<p>
	called the <dfn>pullback</dfn> of \(\varphi\). Note the direction: \(f\) goes from \(X\) to \(Y\), but \(f^*\) goes from cochains on \(Y\) to
	cochains on \(X\). You have seen this reversal twice before. The <Term t="preimage">preimage</Term> of <Ref to="foundations/sets-and-functions" />
	takes subsets of \(Y\) back to subsets of \(X\), and the transpose of <Ref to="foundations/linear-algebra" /> turns a matrix from
	\(\R^m\) to \(\R^n\) into one from \(\R^n\) to \(\R^m\). A pullback is both at once: \(f^*\mathbf 1_\tau\) is \(\pm 1\) on the simplices
	that land on \(\tau\) (the sign records whether the orientation is kept) and \(0\) elsewhere, and the matrix of \(f^*\) is the transpose of
	the matrix of \(f_\sharp\).
</p>

<Theorem id="thm-pullback" title="Pullback in cohomology">
	<p>
		A simplicial map \(f\colon K \to L\) induces homomorphisms \(f^*\colon H^k(L; G) \to H^k(K; G)\) for every \(k\), by
		\(f^*[\varphi] = [\varphi\circ f_\sharp]\). They satisfy \((g \circ f)^* = f^* \circ g^*\), \(\id^* = \id\), and
	</p>
	\[ \ip{f^*\varphi}{c} \;=\; \ip{\varphi}{f_* c} \qquad \text{for all } [\varphi] \in H^k(L;G),\ [c] \in H_k(K). \]
</Theorem>
<Proof>
	<p>
		Because \(f_\sharp\) is a chain map, \(\partial f_\sharp = f_\sharp \partial\). Hence
		\(\delta(f^*\varphi) = \varphi\circ f_\sharp\circ\partial = \varphi\circ\partial\circ f_\sharp = f^*(\delta\varphi)\): pullback commutes with
		\(\delta\). So it takes cocycles to cocycles and coboundaries to coboundaries (\(f^*\delta g = \delta f^* g\)), and passes to the
		quotients. The rule \((g\circ f)^* = f^*\circ g^*\) is “socks and shoes”: \(\varphi\circ(g\circ f)_\sharp = (\varphi \circ g_\sharp)\circ f_\sharp\).
		The formula for the pairing is the definition of \(f^*\) evaluated on \(c\).
	</p>
</Proof>

<p>
	A rule that turns spaces into groups and maps into homomorphisms <em>in the same direction</em>, like \(H_k\), is called covariant; one
	that reverses the direction, like \(H^k\), is called <dfn>contravariant</dfn>. (The precise language of functors waits for
	<Ref to="big-picture/categories" />.) Hatcher puts the whole distinction in one sentence: “The basic distinction between homology and
	cohomology is thus that cohomology groups are contravariant functors while homology groups are covariant.”
</p>

<Example title="Wrapping a circle around itself twice">
	<p>
		The map \(f(z) = z^2\) on the unit circle doubles every angle. As a simplicial map, send a hexagon (vertices \(0, \dots, 5\)) to a
		triangle (vertices \(0, 1, 2\)) by \(i \mapsto i \bmod 3\). The hexagon’s loop of six edges is pushed to the triangle’s loop traversed
		twice: \(f_*[S^1] = 2[S^1]\). Now take the triangle’s fence cochain \(\varphi = \mathbf 1_{[0,1]}\). Its pullback is \(1\) on the two
		hexagon edges that land on \([0,1]\), namely \([0,1]\) and \([3,4]\), and \(0\) elsewhere: one fence on \(Y\) has become two fences on \(X\).
		So \(\ip{f^*\varphi}{[S^1]} = 2 = \ip{\varphi}{f_*[S^1]}\), and on \(H^1 \cong \Z\) the pullback is multiplication by \(2\) as well.
	</p>
</Example>

<Figure num="4.2.5" title="Forward and back" hint="Choose k · drag the rose fence around the right-hand circle">
	<Contravariance />
	{#snippet caption()}
		The map \(z \mapsto z^k\). The point on the left goes around once while its image on the right goes around \(k\) times: chains are
		pushed forward, \(f_*[S^1] = k[S^1]\). The fence \(\varphi\) on the right pulls back to \(|k|\) fences on the left, each crossed with sign
		\(\operatorname{sign} k\): measurements are pulled back, \(f^*[\varphi] = k[\varphi]\). The two arrows point in opposite directions and
		agree on the pairing.
	{/snippet}
</Figure>

<History title="Why “co”, and when">
	<p>
		Cohomology was found twice in one week. At the first international topology conference, in Moscow in September 1935, James Alexander and
		Andrei Kolmogorov independently presented what we now call cohomology and its product; Alexander’s talk was titled “On the ring of a
		complex and the combinatory theory of integration” <Cite k="apushkinskaya2019" />. Charles Weibel’s history calls it “the fourth great advance in 1935 … the discovery
		of cohomology theory and cup products, simultaneously and independently by Alexander and Kolmogoroff.” The names came a little later:
		Hassler Whitney’s 1938 paper “introduced the modern ‘co’ terminology: coboundary (δ) and cocycle”, the “co” standing for the duality
		with boundaries and cycles <Cite k="weibel1999,whitney1938" />.
	</p>
</History>

<Intuition title="Why reversing arrows is a gift">
	<p>
		Measurements can be multiplied: two functions on the same space give a product function, because you can evaluate both at the same
		point. Places cannot be multiplied that way. Hatcher: “What is a little surprising is that contravariance leads to extra structure in
		cohomology.” That extra structure is the cup product of <Ref to="cohomology/cup-product" />, which will distinguish spaces whose
		homology groups are identical.
	</p>
</Intuition>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="torsion-moves-up">Torsion moves up: the projective plane and the Klein bottle</h2>

<p>
	Now the promised surprise. In <Ref to="homology/computing" /> you met the real projective plane \(\RP^2\), a square whose opposite sides are
	glued with a twist, and found \(H_0 = \Z\), \(H_1 = \Z/2\) and \(H_2 = 0\): there is a loop that is not a boundary while twice it is —
	<Term t="torsion-subgroup">torsion</Term>. What does cohomology make of it?
</p>

<Figure num="4.2.6" title="The torsion shift" hint="Use ‹ › to step through the computation">
	<TorsionShift />
	{#snippet caption()}
		The projective plane as a Δ-complex: two vertices \(v, w\), edges \(a, b, c\), triangles \(T_1, T_2\). Homology has its \(\Z/2\) in degree
		1; integer cohomology has \(H^1 = 0\) and its \(\Z/2\) in degree 2. The same “2” causes both: it sits in \(\partial_2\), and transposed, in
		\(\delta_1\). With \(\Z/2\) coefficients every group is \(\Z/2\).
	{/snippet}
</Figure>

<p>
	Here is the computation of the figure in words. The triangles have \(\partial T_1 = a - b + c\) and \(\partial T_2 = -a + b + c\). A
	1-cocycle \(\varphi\) must therefore satisfy \(\varphi(a) - \varphi(b) + \varphi(c) = 0\) and \(-\varphi(a) + \varphi(b) + \varphi(c) = 0\).
	Adding the two equations gives \(2\varphi(c) = 0\). With integer values that forces \(\varphi(c) = 0\), and then \(\varphi(a) = \varphi(b)\).
	But those are exactly the coboundaries: \(\delta f\) has the value \(f(w) - f(v)\) on both \(a\) and \(b\) (each runs from \(v\) to \(w\)) and \(0\)
	on \(c\) (which runs from \(w\) to \(w\)). So
</p>
\[ H^1(\RP^2; \Z) = 0. \]
<p>
	No integer measurement can detect the twisted loop \(c\). The reason is visible in the equation \(2\varphi(c) = 0\): because \(2c\) is a
	boundary, any cocycle must give it the value \(0\), and the only integer whose double is \(0\) is \(0\). In algebraic terms, there is no
	non-zero homomorphism from \(\Z/2\) to \(\Z\).
</p>
<p>
	The torsion has not vanished, though. In degree 2 a cochain is a pair \((p, q)\) of values on \(T_1, T_2\), and a coboundary
	\(\delta\varphi = (x - y + z,\; -x + y + z)\) always has an even total \(p + q = 2z\). Every pair with an even total is a coboundary, and the
	parity of \(p + q\) can never be changed, so
</p>
\[ H^2(\RP^2; \Z) \;\cong\; \Z/2, \qquad H^0(\RP^2; \Z) \cong \Z. \]
<p>
	Homology had \(\Z/2\) in degree 1; cohomology has it in degree 2. <strong>The torsion has moved up one degree.</strong> Notice that
	\(H^2 \ne 0\) even though \(H_2 = 0\): cohomology is not just homology with a superscript.
</p>

<KeyIdea title="One “2”, two places">
	<p>
		Where does a \(\Z/2\) in homology come from? From an entry \(2\) in the <Term t="smith-normal-form">Smith normal form</Term> of a boundary
		matrix \(\partial_{k+1}\): the cokernel of \(\partial_{k+1}\) (cycles modulo boundaries in degree \(k\)) gets a \(\Z/2\). The coboundary
		\(\delta_k = \partial_{k+1}^{\mathsf T}\) has the same Smith normal form, but its cokernel lives in degree \(k+1\). The simplest case is
		the \(1 \times 1\) matrix \((2)\): the map \(\Z \xto{\times 2} \Z\) has cokernel \(\Z/2\) at its target. Transposing does not change the
		matrix, but it swaps which end counts as the target — and so the \(\Z/2\) moves to the other end of the arrow, one degree up.
	</p>
</KeyIdea>

<h3>With \(\Z/2\) coefficients</h3>
<p>
	Rerun the computation with values in \(\Z/2\), where \(1 + 1 = 0\). Now \(2\varphi(c) = 0\) holds for every \(\varphi(c)\), so the cocycle
	\(\varphi = (1, 0, 1)\) — a fence crossing the twisted loop once — is allowed, and it is not a coboundary (those are \((0,0,0)\) and
	\((1,1,0)\)). So \(H^1(\RP^2; \Z/2) \cong \Z/2\), and in fact every group of \(\RP^2\) with \(\Z/2\) coefficients is \(\Z/2\), in homology
	and cohomology alike. Mod-2 measurements can see one-sidedness that integer measurements cannot.
</p>

<h3>The Klein bottle</h3>
<p>
	The Klein bottle \(K\) — a square with one pair of sides glued straight and the other with a flip — has
	\(H_0 = \Z\), \(H_1 = \Z \oplus \Z/2\), \(H_2 = 0\) (<Ref to="homology/computing" hash="six-cells" />). The same computation as for the
	torus, with the twisted boundary formulas \(\partial L = a + b - c\) and \(\partial U = c + a - b\) of that section, gives cocycles with
	\(\varphi(a) = 0\) and \(\varphi(c) = \varphi(b)\):
</p>
\[ H^0(K;\Z) \cong \Z, \qquad H^1(K;\Z) \cong \Z, \qquad H^2(K;\Z) \cong \Z/2. \]
<p>
	Again the free part matches homology and the \(\Z/2\) has climbed from degree 1 to degree 2. With \(\Z/2\) coefficients the Klein bottle has
	groups \(\Z/2,\ (\Z/2)^2,\ \Z/2\) — exactly the same as the torus. Cohomology groups alone cannot tell the two surfaces apart mod 2; the cup
	product will (<Ref to="cohomology/cup-product" />). In general, a closed connected surface has \(H^2(\Sigma;\Z) \cong \Z\) when it is
	<Term t="orientable">orientable</Term> and \(\Z/2\) when it is not.
</p>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="universal-coefficients">The Universal Coefficient Theorem</h2>

<p>
	The examples suggest a rule: integer cohomology in degree \(k\) has the free part of \(H_k\) together with the torsion of \(H_{k-1}\).
	That rule is a theorem, and it says that homology determines cohomology completely.
</p>

<Theorem id="thm-uct" label="Theorem (Universal Coefficient Theorem)">
	<p>For every simplicial complex \(K\) and every \(k \ge 0\) (with \(H_{-1}(K) = 0\)),</p>
	\[ H^k(K;\Z) \;\cong\; \Hom\big(H_k(K), \Z\big) \;\oplus\; \Ext\big(H_{k-1}(K), \Z\big). \]
</Theorem>

<p>
	Hatcher proves it as Theorem 3.2 <Cite k="hatcher2002" loc="§3.1" />. Let us read the two pieces, for finitely generated groups (the
	only kind our complexes produce).
</p>
<ul>
	<li>
		\(\Hom(H_k(K), \Z)\) is the group of homomorphisms from \(H_k\) to \(\Z\) — the “measurements of homology classes” from the pairing.
		If \(H_k \cong \Z^r \oplus T\) with \(T\) finite, a homomorphism to \(\Z\) must kill \(T\) (an element of finite order can only go to the
		only integer of finite order, \(0\)), and it can do anything on \(\Z^r\). So \(\Hom(H_k, \Z) \cong \Z^r\): <strong>the free part of
		\(H_k\)</strong>.
	</li>
	<li>
		\(\Ext(H_{k-1}(K), \Z)\) is a new construction, defined properly in <Ref to="big-picture/homological-algebra" />. For finitely generated
		groups it can be computed with three rules: \(\Ext(\Z, \Z) = 0\), \(\Ext(\Z/n, \Z) \cong \Z/n\), and \(\Ext\) of a direct sum is the direct
		sum. So \(\Ext(H_{k-1}, \Z) \cong\) <strong>the torsion of \(H_{k-1}\)</strong>.
	</li>
</ul>
<p>In short:</p>
\[ H^k(K;\Z) \;\cong\; \big(\text{free part of } H_k\big) \;\oplus\; \big(\text{torsion of } H_{k-1}\big). \]
<p>
	Check it on \(\RP^2\): \(H^1 = \Hom(\Z/2, \Z) \oplus \Ext(\Z, \Z) = 0\) and \(H^2 = \Hom(0, \Z) \oplus \Ext(\Z/2, \Z) = \Z/2\). On the Klein
	bottle: \(H^1 = \Hom(\Z \oplus \Z/2, \Z) = \Z\) and \(H^2 = \Ext(\Z \oplus \Z/2, \Z) = \Z/2\). The “one 2, two places” picture is the reason
	the formula is true; the proof makes that picture precise.
</p>

<h3>Other coefficients</h3>
<p>The theorem holds for any coefficient group \(G\), with \(G\) in place of the second \(\Z\):</p>
\[ H^k(K; G) \;\cong\; \Hom\big(H_k(K), G\big) \;\oplus\; \Ext\big(H_{k-1}(K), G\big), \qquad \Ext(\Z/n, G) \cong G/nG. \]
<p>
	With \(G = \Z/2\) and \(K = \RP^2\): \(H^1 = \Hom(\Z/2, \Z/2) \oplus \Ext(\Z, \Z/2) = \Z/2\) and
	\(H^2 = \Hom(0, \Z/2) \oplus \Ext(\Z/2, \Z/2) = \Z/2\), as we computed by hand. When the coefficients form a field \(F\), there is
	also a version of the theorem that uses homology with coefficients in \(F\) itself; over a field every vector space is free, the
	\(\Ext\) term disappears, and \(H^k(K;F)\) is the dual vector space of \(H_k(K;F)\): same dimension, as we found by counting ranks.
	(With integer homology the \(\Ext\) term does not vanish in general: for \(\RP^2\) and \(F = \Z/2\) it is the whole of \(H^2\).)
</p>

<Figure num="4.2.7" title="Three kinds of measurement" hint="Choose a space">
	<CoefficientTable />
	{#snippet caption()}
		Homology with integer coefficients, and cohomology with integer, mod-2 and real coefficients, computed live from a triangulation of each
		space. Torsion glows rose: wherever homology has a \(\Z/2\) in degree \(k\), integer cohomology has it in degree \(k + 1\). Real
		coefficients see only the free part; \(\Z/2\) coefficients see the twisting in every degree.
	{/snippet}
</Figure>

<Warning title="Determined, but not naturally">
	<p>
		The Universal Coefficient Theorem says that the groups \(H^k(K; G)\) are determined by homology. It does not say that cohomology is
		“just homology in disguise”. The isomorphism involves a choice that cannot be made compatibly with all maps (the splitting is not
		natural), and more importantly cohomology carries structure that homology lacks — the cup product, coming next — which can tell apart
		spaces with identical homology groups.
	</p>
</Warning>

<Remark title="Which coefficients should I use?">
	<p>
		Use \(\R\) when you want calculus: de Rham’s theorem (<Ref to="cohomology/de-rham" />) computes \(H^k(M;\R)\) with differential forms, and
		real coefficients make everything linear algebra. Use \(\Z\) when you want the full information, torsion included. Use \(\Z/2\) when
		orientation is not available — on one-sided surfaces, for parity problems like the gear ring — or when you want the simplest possible
		arithmetic. The same complex, three different instruments.
	</p>
</Remark>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="A path">
	<p>
		The path graph has vertices \(0, 1, 2\) and edges \([0,1], [1,2]\). Write down \(\partial_1\) and \(\delta_0 = \partial_1^{\mathsf T}\), and
		compute \(H^0\) and \(H^1\) with integer coefficients.
	</p>
	{#snippet solution()}
		<p>
			\(\partial_1 = \begin{pmatrix} -1 & 0 \\ 1 & -1 \\ 0 & 1 \end{pmatrix}\) (rows \(0,1,2\); columns \([0,1],[1,2]\)), so
			\(\delta_0 = \begin{pmatrix} -1 & 1 & 0 \\ 0 & -1 & 1 \end{pmatrix}\). The kernel of \(\delta_0\) is the constant functions, so
			\(H^0 \cong \Z\). There are no triangles, so \(H^1 = C^1/\im\delta_0\); but every edge labelling \((\psi_{01}, \psi_{12})\) is a gradient
			(take \(f(0) = 0\), \(f(1) = \psi_{01}\), \(f(2) = \psi_{01} + \psi_{12}\)), so \(H^1 = 0\). A tree has no global obstructions.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Finding the class">
	<p>
		On the hollow triangle, let \(\psi = (\psi_{01}, \psi_{02}, \psi_{12}) = (2, -1, 3)\). Show that \(\psi\) is not a coboundary, and find the
		integer \(m\) for which \(\psi\) is cohomologous to \(m\,\mathbf 1_{[0,1]}\).
	</p>
	{#snippet solution()}
		<p>
			The loop sum is \(\psi_{01} + \psi_{12} - \psi_{02} = 2 + 3 + 1 = 6 \neq 0\), so \(\psi\) is not a coboundary. The loop sum of
			\(m\,\mathbf 1_{[0,1]}\) is \(m\), and two cocycles are cohomologous exactly when their loop sums agree, so \(m = 6\). Indeed
			\(\psi - 6\,\mathbf 1_{[0,1]} = (-4, -1, 3)\) has loop sum \(-4 + 3 + 1 = 0\): it is \(\delta f\) for \(f = (0, -4, -1)\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Two triangles of the sphere">
	<p>
		On the hollow tetrahedron, show that the indicator cochains \(\mathbf 1_{[0,1,3]}\) and \(-\mathbf 1_{[0,1,2]}\) are cohomologous, by
		computing \(\delta\mathbf 1_{[0,1]}\).
	</p>
	{#snippet hint()}
		<p>\(\delta\mathbf 1_{[0,1]}\) is \(\pm 1\) on the triangles that have \([0,1]\) as a face, with the sign of \([0,1]\) in their boundary.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The triangles containing \([0,1]\) are \([0,1,2]\) and \([0,1,3]\). In \(\partial[0,1,2] = [1,2] - [0,2] + [0,1]\) and
			\(\partial[0,1,3] = [1,3] - [0,3] + [0,1]\) the edge \([0,1]\) has coefficient \(+1\). So
			\(\delta\mathbf 1_{[0,1]} = \mathbf 1_{[0,1,2]} + \mathbf 1_{[0,1,3]}\), that is,
			\(\mathbf 1_{[0,1,3]} = -\mathbf 1_{[0,1,2]} + \delta\mathbf 1_{[0,1]}\). Both cochains have the same value \(+1\) on
			\([S^2] = [1,2,3] - [0,2,3] + [0,1,3] - [0,1,2]\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The Klein bottle by hand">
	<p>
		Using \(\partial L = a + b - c\) and \(\partial U = c + a - b\) (one vertex, so \(\delta_0 = 0\)), find all integer 1-cocycles of the
		Klein bottle and show \(H^1(K;\Z) \cong \Z\). Explain why every integer cocycle vanishes on \(a\), using \(\partial(L + U)\).
	</p>
	{#snippet solution()}
		<p>
			The cocycle conditions are \(x + y - z = 0\) and \(x - y + z = 0\) for \((x, y, z) = (\varphi(a), \varphi(b), \varphi(c))\). Adding gives
			\(2x = 0\), so \(x = 0\), and then \(z = y\): the cocycles are the multiples of \((0, 1, 1)\), and since \(B^1 = 0\),
			\(H^1 \cong \Z\). Directly: \(\partial(L + U) = 2a\), so for a cocycle \(2\varphi(a) = \varphi(\partial(L + U)) = (\delta\varphi)(L + U) = 0\),
			and in \(\Z\) that forces \(\varphi(a) = 0\). The loop \(a\) has order 2 in homology; integer measurements cannot see it.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Tripling">
	<p>
		For \(f\colon S^1 \to S^1\), \(f(z) = z^3\), what are \(f_*\) on \(H_1 \cong \Z\) and \(f^*\) on \(H^1 \cong \Z\)? In the fence picture, how
		many fences does one fence pull back to, and with which signs? What changes for \(f(z) = z^{-3}\)?
	</p>
	{#snippet solution()}
		<p>
			\(f_*\) is multiplication by \(3\): the loop is wrapped three times around. One fence at angle \(\theta\) pulls back to the three points
			with angles \(\theta/3 + 2\pi j/3\), each crossed positively, so \(f^*\) is multiplication by \(3\) too, and
			\(\ip{f^*\varphi}{[S^1]} = 3 = \ip{\varphi}{f_*[S^1]}\). For \(z^{-3}\) the image runs the other way: still three preimage fences, each
			crossed negatively, and both maps are multiplication by \(-3\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="δ is ∂ transposed, entry by entry">
	<p>
		For the filled triangle \([0,1,2]\) with edges \([0,1], [0,2], [1,2]\), write the \(3\times 1\) matrix \(\partial_2\) and the
		\(1 \times 3\) matrix \(\delta_1\) (computed directly from \((\delta\psi)(\sigma) = \psi(\partial\sigma)\)), and check that one is the
		transpose of the other. Then check \(\delta_1\delta_0 = 0\) by multiplying matrices.
	</p>
	{#snippet solution()}
		<p>
			\(\partial[0,1,2] = [1,2] - [0,2] + [0,1]\), so \(\partial_2 = \begin{pmatrix} 1 \\ -1 \\ 1 \end{pmatrix}\) in the order \([0,1],[0,2],[1,2]\).
			Directly, \((\delta\psi)([0,1,2]) = \psi_{12} - \psi_{02} + \psi_{01}\), so \(\delta_1 = \begin{pmatrix} 1 & -1 & 1\end{pmatrix} = \partial_2^{\mathsf T}\).
			With \(\delta_0\) from the hollow triangle, \(\delta_1\delta_0 = \begin{pmatrix} 1 & -1 & 1 \end{pmatrix}\begin{pmatrix} -1 & 1 & 0 \\ -1 & 0 & 1 \\ 0 & -1 & 1\end{pmatrix} = \begin{pmatrix} 0 & 0 & 0 \end{pmatrix}\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Cohomology from homology">
	<p>
		Suppose a space \(X\) has \(H_0 = \Z\), \(H_1 = \Z^2 \oplus \Z/3\), \(H_2 = \Z/2\) and \(H_k = 0\) for \(k \ge 3\). Use the Universal Coefficient
		Theorem to find \(H^k(X;\Z)\) for all \(k\), and the dimensions of \(H^k(X;\Z/2)\). Check your answer with the Euler characteristic.
	</p>
	{#snippet hint()}
		<p>For \(\Z/2\) coefficients use \(\Hom(\Z/n, \Z/2) \cong \Z/2\) if \(n\) is even and \(0\) if \(n\) is odd, and \(\Ext(\Z/n, \Z/2) \cong (\Z/2)/n(\Z/2)\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Integer coefficients, “free part of \(H_k\) plus torsion of \(H_{k-1}\)”: \(H^0 = \Z\), \(H^1 = \Z^2\), \(H^2 = 0 \oplus \Z/3 = \Z/3\),
			\(H^3 = \Z/2\), and \(H^k = 0\) for \(k \ge 4\). Mod 2: \(H^0 = \Hom(\Z, \Z/2) = \Z/2\); \(H^1 = \Hom(\Z^2 \oplus \Z/3, \Z/2) = (\Z/2)^2\) (the
			\(\Z/3\) contributes nothing) plus \(\Ext(\Z, \Z/2) = 0\); \(H^2 = \Hom(\Z/2, \Z/2) \oplus \Ext(\Z^2\oplus\Z/3, \Z/2) = \Z/2 \oplus 0\), because
			\(3\) is invertible mod 2; \(H^3 = \Ext(\Z/2, \Z/2) = \Z/2\). Dimensions \(1, 2, 1, 1\). Euler characteristic: over \(\Q\) the Betti numbers
			are \(1, 2, 0, 0\), giving \(\chi = -1\); mod 2, \(1 - 2 + 1 - 1 = -1\). They agree, as they must.
		</p>
	{/snippet}
</Exercise>

<!-- ═══════════════════════════════════════════════════════════════════════ -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			\(C^k(K;G) = \Hom(C_k(K), G)\): a \(k\)-cochain is a value in \(G\) on each \(k\)-simplex, extended to chains by linearity. The pairing
			\(\ip{\varphi}{c} = \varphi(c)\) measures a place.
		</li>
		<li>
			The coboundary \((\delta\varphi)(\sigma) = \varphi(\partial\sigma)\) raises degree; as a matrix \(\delta_k = \partial_{k+1}^{\mathsf T}\); and
			\(\delta\delta = 0\) because \(\partial\partial = 0\).
		</li>
		<li>
			\(H^k = Z^k/B^k\) = cocycles (\(\delta\varphi = 0\)) modulo coboundaries (\(\varphi = \delta g\)). Over a field, \(\dim H^k = \dim H_k\).
		</li>
		<li>
			Circle: \(\Z, \Z\). Sphere: \(\Z, 0, \Z\). Torus: \(\Z, \Z^2, \Z\), with \(H^1\) generated by two fences dual to the two loops.
		</li>
		<li>
			A 1-cocycle on a surface is a fence; its value on a loop counts signed crossings. The pairing \(H^k \times H_k \to G\) is well defined,
			by Stokes.
		</li>
		<li>
			Maps act backwards: \(f\colon X \to Y\) gives \(f^*\colon H^k(Y) \to H^k(X)\), with \((g\circ f)^* = f^* g^*\) and
			\(\ip{f^*\varphi}{c} = \ip{\varphi}{f_*c}\).
		</li>
		<li>
			Torsion moves up: \(\RP^2\) has \(H_1 = \Z/2\), \(H_2 = 0\) but \(H^1 = 0\), \(H^2 = \Z/2\); the Klein bottle has \(H^* = \Z, \Z, \Z/2\).
			With \(\Z/2\) coefficients, both see their one-sidedness.
		</li>
		<li>
			Universal Coefficient Theorem: \(H^k(K;\Z) \cong \Hom(H_k, \Z) \oplus \Ext(H_{k-1}, \Z)\) = free part of \(H_k\) ⊕ torsion of \(H_{k-1}\).
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>
<FurtherReading items={reading} />
