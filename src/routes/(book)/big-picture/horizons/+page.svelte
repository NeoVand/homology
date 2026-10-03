<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import HodgeDecomp from '$lib/figures/big-picture/horizons/HodgeDecomp.svelte';
	import HodgeRank from '$lib/figures/big-picture/horizons/HodgeRank.svelte';
	import CircularCoords from '$lib/figures/big-picture/horizons/CircularCoords.svelte';
	import HopfFibration from '$lib/figures/big-picture/horizons/HopfFibration.svelte';
	import SubjectMap from '$lib/figures/big-picture/horizons/SubjectMap.svelte';

	const pure = [
		{
			title: 'Algebraic Topology',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard first graduate text, free online. Having read this book you can read Chapters 2 and 3 straight through; Chapter 4 is homotopy theory, including the Hopf fibration and Eilenberg–MacLane spaces.',
			kind: 'book',
			free: true
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring W. Tu',
			note: 'Springer GTM 82. De Rham cohomology, Čech cohomology, spectral sequences and characteristic classes, all with differential forms — the natural sequel to Part IV of this book.',
			kind: 'book'
		},
		{
			title: 'Characteristic Classes',
			author: 'John Milnor and James Stasheff',
			note: 'Princeton, 1974. Vector bundles and the cohomology classes that measure their twisting; a model of clear writing.',
			kind: 'book'
		},
		{
			title: 'Vector Bundles and K-Theory',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/VBKT/VBpage.html',
			note: 'An unfinished but very readable introduction to topological K-theory and Bott periodicity, free online.',
			kind: 'book',
			free: true
		},
		{
			title: 'K-Theory',
			author: 'Michael Atiyah',
			note: 'The founder’s own lecture notes (1967; reprinted by Addison-Wesley, 1989). Short and direct.',
			kind: 'book'
		},
		{
			title: 'An Introduction to Homological Algebra',
			author: 'Charles A. Weibel',
			note: 'Cambridge University Press, 1994: derived functors, spectral sequences, group cohomology.',
			kind: 'book'
		},
		{
			title: 'The Rising Sea: Foundations of Algebraic Geometry',
			author: 'Ravi Vakil',
			url: 'https://math.stanford.edu/~vakil/216blog/',
			note: 'Algebraic geometry in Grothendieck’s style, with sheaf cohomology as a main character; free online and named after the image in this chapter.',
			kind: 'book',
			free: true
		},
		{
			title: 'Category Theory in Context',
			author: 'Emily Riehl',
			url: 'https://emilyriehl.github.io/files/context.pdf',
			note: 'For the categorical road: universal properties, adjunctions, limits, and the Yoneda lemma.',
			kind: 'book',
			free: true
		}
	] as const;

	const applied = [
		{
			title: 'Elementary Applied Topology',
			author: 'Robert Ghrist',
			url: 'https://www2.math.upenn.edu/~ghrist/notes.html',
			note: 'Homology, cohomology, sheaves and persistence through applications — sensor networks, robotics, data, economics — with hundreds of figures. Chapters are available on the author’s page.',
			kind: 'book'
		},
		{
			title: 'Hodge Laplacians on Graphs',
			author: 'Lek-Heng Lim',
			url: 'https://arxiv.org/abs/1507.05379',
			note: 'Cohomology and Hodge theory as “the linear algebra of matrices satisfying AB = 0”, written for readers who know linear algebra and graphs. The perfect companion to the first half of this chapter.',
			kind: 'paper',
			free: true
		},
		{
			title: 'Statistical Ranking and Combinatorial Hodge Theory',
			author: 'Xiaoye Jiang, Lek-Heng Lim, Yuan Yao and Yinyu Ye',
			url: 'https://arxiv.org/abs/0811.1067',
			note: 'The HodgeRank paper (Mathematical Programming, 2011).',
			kind: 'paper',
			free: true
		},
		{
			title: 'Persistent Cohomology and Circular Coordinates',
			author: 'Vin de Silva, Dmitriy Morozov and Mikael Vejdemo-Johansson',
			url: 'https://arxiv.org/abs/0905.4887',
			note: 'Where the circular-coordinates figure comes from (Discrete & Computational Geometry, 2011).',
			kind: 'paper',
			free: true
		},
		{
			title: 'A Roadmap for the Computation of Persistent Homology',
			author: 'Nina Otter, Mason A. Porter, Ulrike Tillmann, Peter Grindrod and Heather A. Harrington',
			url: 'https://arxiv.org/abs/1506.08903',
			note: 'A practical tutorial: from data to barcodes, with software comparisons (EPJ Data Science, 2017).',
			kind: 'paper',
			free: true
		},
		{
			title: 'Computational Topology: An Introduction',
			author: 'Herbert Edelsbrunner and John Harer',
			note: 'American Mathematical Society, 2010. Algorithms for homology and persistence, with proofs.',
			kind: 'book'
		},
		{
			title: 'Sheaf Theory through Examples',
			author: 'Daniel Rosiak',
			url: 'https://direct.mit.edu/books/oa-monograph/5460/Sheaf-Theory-through-Examples',
			note: 'An open-access, example-first introduction to sheaves and their cohomology (MIT Press, 2022).',
			kind: 'book',
			free: true
		},
		{
			title: 'Discrete Differential Geometry: An Applied Introduction',
			author: 'Keenan Crane',
			url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
			note: 'Discrete differential forms and the Hodge decomposition on meshes, for graphics and geometry processing.',
			kind: 'notes',
			free: true
		}
	] as const;

	const physics = [
		{
			title: 'Geometry, Topology and Physics',
			author: 'Mikio Nakahara',
			note: 'The standard bridge text for physicists: homology, cohomology, fibre bundles and characteristic classes with physical applications.',
			kind: 'book'
		},
		{
			title: 'The Geometry of Physics',
			author: 'Theodore Frankel',
			note: 'Differential forms, bundles and gauge theory, from a geometer who writes for physicists (Cambridge University Press).',
			kind: 'book'
		},
		{
			title: 'Gauge Fields, Knots and Gravity',
			author: 'John Baez and Javier P. Muniain',
			note: 'A friendly path from Maxwell’s equations through de Rham cohomology to gauge theory and knot invariants (World Scientific, 1994).',
			kind: 'book'
		},
		{
			title: 'Periodic Table for Topological Insulators and Superconductors',
			author: 'Alexei Kitaev',
			url: 'https://arxiv.org/abs/0901.2686',
			note: 'How K-theory and Bott periodicity organise topological phases of matter (2009). Advanced, but short.',
			kind: 'paper',
			free: true
		},
		{
			title: 'On Khovanov’s Categorification of the Jones Polynomial',
			author: 'Dror Bar-Natan',
			url: 'https://arxiv.org/abs/math/0201043',
			note: 'The most accessible account of Khovanov homology, with computations (Algebraic & Geometric Topology, 2002).',
			kind: 'paper',
			free: true
		}
	] as const;
</script>

<Epigraph author="William P. Thurston" source="On proof and progress in mathematics (1994)"
	>The measure of our success is whether what we do enables people to understand and think more clearly and effectively about
	mathematics.</Epigraph
>

<p class="lead">
	This is the last chapter of the book, and the first chapter of everything that comes after it. We have built homology and
	cohomology from scratch, and in the last two chapters we stepped back to see the machinery as a whole. Now we look outward: at the
	places where these ideas lead — some of them in pure mathematics, some in physics, some in the analysis of data — and at how you
	might travel there next.
</p>

<p>
	The tour has three kinds of stop. In the first, we go deeper into things you already know: the <em>best</em> representative of a
	cohomology class (Hodge theory), and two of its applications — ranking sports teams and finding angles in data. In the second, we
	meet theories that look like homology but are not: generalized cohomology, homotopy groups, sheaf cohomology. In the third, we look
	at a map of the subject and a guide for further study. Not everything here is proved; some of it is only described. When that
	happens we will say so.
</p>

<h2 id="hodge">Hodge theory: the best representative</h2>

<p>
	A cohomology class is a whole family of cochains: any <Term t="cocycle">cocycle</Term> plus any <Term t="coboundary">coboundary</Term>
	represents the same class (<Ref
		to="cohomology/cohomology-groups"
	/>). In <Ref to="cohomology/cochains" /> you saw the staircase cochain that climbs around a loop; adding the gradient of any height
	function gives another staircase with the same total climb. Is one of them <em>best</em>? Hodge theory says yes, and the answer is
	beautifully concrete.
</p>

<h3 id="hodge-smooth">The smooth version</h3>

<p>
	On a closed manifold with a way to measure lengths and angles (a <em>Riemannian metric</em>), every differential form has a size,
	and forms have an inner product. The <dfn>Hodge Laplacian</dfn> \(\Delta = dd^* + d^*d\) combines the exterior derivative \(d\) of
	<Ref to="cohomology/differential-forms" /> with its adjoint \(d^*\), which goes the other way. A form is <dfn>harmonic</dfn> if
	\(\Delta\omega = 0\), which turns out to mean that it is both closed (\(d\omega = 0\)) and co-closed (\(d^*\omega = 0\)).
</p>

<Theorem id="thm-hodge" label="Theorem (Hodge, 1941)">
	<p>
		On a closed oriented Riemannian manifold, every de Rham cohomology class contains exactly one harmonic form, and the space of
		\(k\)-forms splits orthogonally as
		\[ \Omega^k = d\,\Omega^{k-1}\;\oplus\; d^*\Omega^{k+1}\;\oplus\;\mathcal H^k , \]
		where \(\mathcal H^k\) is the space of harmonic \(k\)-forms. In particular \(\dim\mathcal H^k = b_k\).
	</p>
</Theorem>

<p>
	On the flat square torus, for example, the harmonic 1-forms are exactly the constant combinations \(a\,dx + b\,dy\): one harmonic
	form for each element of \(H^1_{\dR}(T^2)\cong\R^2\). The cohomology class is an abstract equivalence class; the harmonic form is a
	single, canonical object you can draw. We will not prove Hodge’s theorem in the smooth setting — it needs analysis (elliptic partial
	differential equations) — but its discrete version is pure linear algebra, and you can prove it yourself.
</p>

<h3 id="hodge-discrete">The discrete version is least squares</h3>

<p>
	Work on a simplicial complex \(K\) with real coefficients, and think of a 1-cochain as a <em>flow</em> on the edges: a number on each
	oriented edge, as in <Ref to="cohomology/cochains" />. Write \(\delta_0\colon C^0\to C^1\) for the gradient (a function on vertices
	goes to its differences along edges) and \(\delta_1\colon C^1\to C^2\) for the curl (a flow goes to its circulation around each
	triangle). With the standard inner products, their transposes \(\delta_0^{\mathsf T}\) and \(\delta_1^{\mathsf T}\) are “divergence”
	and “spread a circulation around a triangle’s edges”.
</p>

<Definition id="def-hodge-laplacian" title="Hodge Laplacian on edges">
	<p>The <dfn>Hodge 1-Laplacian</dfn> of \(K\) is the square matrix (one row and column per edge)</p>
	\[ L_1 = \delta_0\,\delta_0^{\mathsf T} + \delta_1^{\mathsf T}\,\delta_1 . \]
	<p>
		A flow \(h\) is <dfn>harmonic</dfn> if \(L_1 h = 0\), which happens exactly when \(h\) is curl-free (\(\delta_1 h = 0\)) and
		divergence-free (\(\delta_0^{\mathsf T}h = 0\)).
	</p>
</Definition>

<p>
	(Why exactly when? Because \(h^{\mathsf T}L_1h = \|\delta_0^{\mathsf T}h\|^2 + \|\delta_1h\|^2\), a sum of two squares, and it is zero
	only if both terms are.) Since \(\delta_1\delta_0 = 0\) — “curl of a gradient is zero” — the image of \(\delta_0\) (gradients) and the
	image of \(\delta_1^{\mathsf T}\) (curls) are perpendicular, and what is perpendicular to both is exactly the harmonic flows.
</p>

<Theorem id="thm-hodge-discrete" label="Theorem (discrete Hodge decomposition)">
	<p>Every flow \(f\) on the edges of \(K\) splits uniquely as an orthogonal sum</p>
	\[ f \;=\; \underbrace{\delta_0 s}_{\text{gradient}} \;+\; \underbrace{\delta_1^{\mathsf T}\varphi}_{\text{curl}} \;+\; \underbrace{h}_{\text{harmonic}}, \qquad \|f\|^2 = \|\delta_0s\|^2 + \|\delta_1^{\mathsf T}\varphi\|^2 + \|h\|^2, \]
	<p>and the harmonic flows form a space isomorphic to \(H^1(K;\R)\): there are exactly \(b_1\) independent ones, one per hole.</p>
</Theorem>

<p>
	This is the <Term t="hodge-decomposition">Hodge decomposition</Term> previewed in <Ref to="cohomology/cochains" />, now with its
	third piece explained: the <Term t="harmonic-flow">harmonic flows</Term> are exactly the cohomology.
</p>

<Question>
	<p>
		On a complex with no holes — a triangulated disk, say — what can the harmonic part of a flow be? And what does that say about a
		flow that has zero curl around every triangle?
	</p>
</Question>

<p>
	Each piece is found by <strong>least squares</strong>. The gradient part is the gradient closest to \(f\): choose the potential \(s\)
	to minimise \(\|\delta_0s - f\|^2\), which means solving the normal equations \(\delta_0^{\mathsf T}\delta_0\,s = \delta_0^{\mathsf
	T}f\) — the graph Laplacian of <Ref to="cohomology/cochains" /> appears. The curl part is found the same way, and the harmonic part is
	what is left. And if \(f\) is a cocycle, its harmonic part is the <em>smallest</em> cocycle in its cohomology class: Hodge’s “best
	representative” is the one of least energy.
</p>

<Example title="A decomposition with clean numbers">
	<p>
		Take four vertices \(1,2,3,4\) and edges \(12, 23, 13, 34, 14\), and fill in the triangle \(123\) but not \(134\) — so there is one
		hole, surrounded by \(1\to 3\to 4\to 1\). The flow \(f = (3, 3, 3, 2, -2)\) on \((12, 23, 13, 34, 14)\) splits as
	</p>
	<div class="table-wrap">
		<table>
			<thead><tr><th>part</th><th>on 12, 23, 13, 34, 14</th><th>what it is</th></tr></thead>
			<tbody>
				<tr><td>gradient</td><td>\((1, 1, 2, -1, 1)\)</td><td>differences of the potential \(s = (0, 1, 2, 1)\)</td></tr>
				<tr><td>curl</td><td>\((1, 1, -1, 0, 0)\)</td><td>one unit circulating around the filled triangle \(1\to 2\to 3\to 1\)</td></tr>
				<tr><td>harmonic</td><td>\((1, 1, 2, 3, -3)\)</td><td>a flow around the hole: its total around \(1\to3\to4\to1\) is \(8\)</td></tr>
			</tbody>
		</table>
	</div>
	<p>
		Check the Pythagoras identity: \(\|f\|^2 = 9+9+9+4+4 = 35\), and \(8 + 3 + 24 = 35\). (These numbers are recomputed by the book’s
		test suite.) The harmonic flow is divergence-free at every vertex and has zero circulation around the filled triangle, but goes
		around the hole: no local test can detect it.
	</p>
</Example>

<Figure size="full" num="1" title="Gradient + curl + harmonic" hint="Click edges to add flow · choose a complex and a starting flow">
	<HodgeDecomp />
	{#snippet caption()}
		A flow on a triangulated annulus (or a disk with two holes) and its three Hodge parts, drawn as arrows whose thickness shows their
		size. The gradient part (teal) flows downhill from high potential to low; the curl part (violet) circulates around individual
		triangles; the harmonic part (rose) circulates around the holes. Click edges to change the flow and watch the energy split \(\|f\|^2
		= \|\text{grad}\|^2 + \|\text{curl}\|^2 + \|\text{harm}\|^2\). However you edit, the harmonic part stays in a space of dimension
		\(b_1\): one pattern for the annulus, two for the disk with two holes.
	{/snippet}
</Figure>

<Intuition title="Spreading the jump evenly">
	<p>
		Recall the staircase cochain of <Ref to="cohomology/cochains" />: all the climbing happens on one “fence” of edges, and it is a
		cocycle that is not a coboundary. Its harmonic representative spreads the same total climb as evenly as possible around the hole —
		on the smallest symmetric triangulated annulus, with three vertices on each ring, exactly a third on each step of the inner and
		outer rings (the test suite checks this too). That is the visual moral of Hodge theory: among all the ways to represent a class,
		the harmonic one is the most spread out.
	</p>
</Intuition>

<h3 id="hodgerank">Ranking with cohomology: HodgeRank</h3>

<p>
	Here is an application that needs nothing beyond what we just did. Five teams play some games — not every pair meets — and we know
	the score margins. Who is best? If every result were consistent with some underlying strengths \(s_i\) (team \(j\) beats team \(i\) by
	exactly \(s_j - s_i\)), the margins would form a gradient flow and we could read off the strengths. Real results are never that
	tidy: Aurora beats Boreal, Boreal beats Cygnus, and then Cygnus beats Aurora.
</p>

<p>
	<Term t="hodgerank">HodgeRank</Term>, introduced by Xiaoye Jiang, Lek-Heng Lim, Yuan Yao and Yinyu Ye, treats the margins as a flow on
	the graph of games, with
	every triangle of mutually played games filled in, and takes its Hodge decomposition. The gradient part is the best global ranking,
	found by least squares. What is left over is inconsistency, and it comes in two kinds: a curl part made of “locally cyclic
	inconsistencies” (rock–paper–scissors among three teams that all played each other), and a harmonic part of “globally cyclic but
	locally acyclic inconsistencies” — cycles around longer loops of games, invisible to any check on three teams at a time.
</p>

<Figure size="full" num="2" title="HodgeRank: who is best?" hint="Change the score margins · switch what is drawn">
	<HodgeRank />
	{#snippet caption()}
		Each game’s margin is a number on an edge, drawn as an arrow towards the team that did better. Aurora, Boreal and Cygnus all played
		each other, so their triangle is filled; the loop Aurora–Cygnus–Draco–Electra has no diagonals, so it surrounds a hole. In the
		starting season, Cygnus comes first even though it lost to Boreal: a little over half of the “energy” of the results is explained
		by the ranking, about a third is a local cycle in the triangle, and about a tenth circulates around the long loop. Try the presets:
		a consistent season is pure gradient, rock–paper–scissors is pure curl, and “round the houses” is pure harmonic.
	{/snippet}
</Figure>

<p>
	The harmonic part has a meaning worth pausing on. It is a cohomology class of the comparison graph — a nonzero element of \(H^1\) — and
	it is precisely the inconsistency that no amount of local checking will find. Each team’s results look fine against its neighbours;
	only by going all the way around the loop do you discover that there is no consistent ranking. That is the local-versus-global
	obstruction of <Ref to="cohomology/cochains" />, this time in a sports league.
</p>

<h2 id="circular-coordinates">Circular coordinates from data</h2>

<p>
	<Term t="persistent-homology">Persistent homology</Term> (<Ref to="homology/persistence" />) can tell you that a cloud of data points
	has a loop in it. It cannot, by
	itself, tell you <em>where along the loop</em> each point sits. For that you need cohomology — and the reason is one of the prettiest
	facts in the subject.
</p>

<KeyIdea>
	<p>
		For reasonable spaces, an integer cohomology class in degree 1 is the same thing as a map to the circle, up to homotopy:
		\[ H^1(X;\Z)\;\cong\;[X, S^1]. \]
		Homology classes are things you can <em>put in</em> a space (loops); degree-1 cohomology classes are ways of <em>mapping the space
		onto a circle</em> — angles.
	</p>
</KeyIdea>

<p>
	Vin de Silva, Dmitriy Morozov and Mikael Vejdemo-Johansson turned this into an algorithm. Build a <Term t="vietoris-rips-complex">Vietoris–Rips complex</Term> of the data at
	a scale where a persistent loop is alive. Persistent cohomology hands you an integer cocycle \(\alpha\) representing it — typically a
	“fence” of edges, each counting \(\pm1\) for crossing a cut, just like the staircase cochain. A fence gives a terrible coordinate: it
	jumps by a whole turn across one set of edges and stays constant elsewhere. So smooth it, by exactly the least squares of the previous
	section: find the real function \(f\) on the vertices that makes \(\bar\alpha = \alpha + \delta f\) as small as possible. Then
	\(\bar\alpha\) is the harmonic representative of the class, and the angle of a data point \(v\) is
	\[ \theta(v) = f(v) \bmod 1 . \]
	Since \(\alpha\) takes integer values, \(\delta\theta\) agrees with \(\bar\alpha\) up to whole turns: the angle changes along each
	edge by the small amount \(\bar\alpha\), and goes once around in total.
</p>

<Figure size="wide" num="3" title="Angles from cohomology" hint="Slide the scale · pick another cocycle · new data">
	<CircularCoords />
	{#snippet caption()}
		Forty noisy points near a loop. The figure starts in the middle of the range of scales where the Rips complex has exactly one loop
		(\(b_1 = 1\)); there, linear algebra finds an integer cocycle — the rose fence, normalised to vanish on a spanning tree — and least
		squares smooths it into an angle for every point, shown as colour. The plot on the right compares that angle with each point’s true position: a straight band that wraps once.
		“Pick another cocycle” changes the fence but not the result (beyond a rotation or reflection), because the harmonic representative
		depends only on the cohomology class.
	{/snippet}
</Figure>

<Remark title="An honest shortcut">
	<p>
		The figure uses persistence only to choose its starting scale: the barcode shows the range of scales at which the complex is
		connected with a single loop, and the figure starts in the middle of it. After that it computes \(H^1\) of
		the single Rips complex at the scale you choose, rather than running the full persistent-cohomology algorithm, which would pick out
		the longest-lived class automatically and work with coefficients mod a prime before lifting to the integers. For one clean loop the outcome is the same; for messy data, persistence is what tells you which loops are worth
		coordinates.
	</p>
</Remark>

<h2 id="generalized-cohomology">Generalized cohomology theories</h2>

<p>
	In <Ref to="big-picture/homological-algebra" hash="axioms" /> we met the five Eilenberg–Steenrod axioms and the theorem that they
	determine homology on cell complexes. Drop the dimension axiom — allow a point to have nonzero groups in degrees other than zero — and
	you get <dfn>generalized (co)homology theories</dfn>. They keep the long exact sequences, Mayer–Vietoris and spectral sequences, but
	they see different things. Here are the two most famous, followed by the idea that unifies them.
</p>

<h3 id="k-theory">K-theory: counting vector bundles</h3>

<p>
	A vector bundle over a space \(X\) is a family of vector spaces, one for each point, varying continuously — like the tangent planes
	of a surface, or the Möbius band viewed as a family of lines over a circle (<Ref to="cohomology/characteristic-classes" />). Two
	bundles can be added (put the fibres side by side), but not subtracted. Topological K-theory, created by Michael Atiyah and Friedrich
	Hirzebruch around 1961 after Grothendieck’s algebraic version, does what we do to build the integers from the natural numbers: it
	allows formal differences \([E]-[F]\) of
	complex vector bundles, and declares bundles the same if they become isomorphic after adding a trivial bundle (“stable
	equivalence”). The result is an abelian group \(K^0(X)\), and it extends to a whole cohomology theory \(K^n\).
</p>

<p>
	K-theory violates the dimension axiom in a spectacular, regular way. Bott periodicity, proved by Raoul Bott in 1959, says that
	complex K-theory repeats with period two: \(K^n(\mathrm{pt})\) is \(\Z\) for every even \(n\) and \(0\) for every odd \(n\). Among its
	triumphs: a famously short proof, by Frank Adams and Michael Atiyah (1966), of the theorem that \(\R^n\) can be given a
	multiplication with division (like the real numbers, complex numbers, quaternions and octonions) only when \(n = 1, 2, 4\) or \(8\)
	— the first proofs, a few years earlier, had also rested on Bott periodicity; and the language of the
	Atiyah–Singer index theorem, which computes analytic invariants of differential operators from topology.
</p>

<h3 id="cobordism">Cobordism: homology made of manifolds</h3>

<p>
	When Poincaré invented homology, his cycles were pieces of manifolds, and two cycles were “homologous” when together they formed the
	boundary of something (<Ref to="homology/cycles-and-boundaries" />). Cobordism takes that literally. Two closed \(n\)-manifolds \(M\)
	and \(N\) are <dfn>cobordant</dfn> if together they are the boundary of a compact \((n+1)\)-manifold: \(\partial W = M\sqcup N\). The
	cobordism classes form a group, and René Thom computed them in 1954 for unoriented manifolds — work for which he received the Fields
	Medal. Every closed 1-manifold is a union of circles, and each circle bounds a disk, so in dimension 1 everything is cobordant to
	nothing. In dimension 2, a closed surface bounds a 3-manifold exactly when its Euler characteristic is even: the torus and the Klein
	bottle bound, but the projective plane \(\RP^2\) (with \(\chi = 1\)) does not. So the cobordism group of a point in dimension 2 is
	\(\Z/2\), generated by \(\RP^2\) — another failure of the dimension axiom.
</p>

<h3 id="spectra">The unifying idea: representability and spectra</h3>

<p>
	Here is the deepest reason cohomology is contravariant. For any abelian group \(G\) and any \(n\ge1\) there is a space \(K(G,n)\),
	an <dfn>Eilenberg–MacLane space</dfn>, whose only nonzero homotopy group (next section) is \(\pi_n = G\), and for cell complexes \(X\)
	\[ H^n(X;G)\;\cong\;[X, K(G,n)], \]
	the set of homotopy classes of maps from \(X\) into \(K(G,n)\). The circle is \(K(\Z,1)\) — that was the circular-coordinates fact
	above — and infinite complex projective space \(\CP^\infty\) is \(K(\Z,2)\), which is why the first Chern class of <Ref
		to="cohomology/characteristic-classes"
	/> lives in \(H^2(X;\Z)\). A cohomology class <em>is</em> a map into a special space: maps pull back, so cohomology pulls back.
</p>

<p>
	Edgar Brown proved in 1962 that every generalized cohomology theory is representable in the same way, by a sequence of spaces
	\(E_0, E_1, E_2, \dots\), each the loop space of the next: a <dfn>spectrum</dfn>. Ordinary cohomology, K-theory and cobordism are each
	represented by their own spectrum, and the study of spectra — stable homotopy theory — is one of the most active areas of modern
	topology. We can only point at the door.
</p>

<h2 id="homotopy-groups">Homotopy groups: the harder cousin</h2>

<p>
	The <Term t="fundamental-group">fundamental group</Term> \(\pi_1\) of <Ref to="topology/homotopy" /> records loops up to deformation. Replace loops by spheres and you get
	the <dfn>homotopy groups</dfn>: \(\pi_n(X)\) is the set of homotopy classes of maps from the \(n\)-sphere into \(X\) (sending a chosen
	point to a chosen point), with a group structure defined much as for loops. For \(n\ge 2\) these groups are abelian. They are the most
	natural “higher-dimensional holes” one could imagine — and they are far harder to compute than homology.
</p>

<p>
	For a first taste, compare spheres. Homology is simple: \(H_k(S^n)\) is \(\Z\) for \(k = 0, n\) and zero otherwise. Homotopy starts
	the same way — \(\pi_k(S^n) = 0\) for \(k < n\), and \(\pi_n(S^n)\cong\Z\), detected by <Term t="degree">degree</Term> (<Ref
		to="homology/invariance"
	/>); indeed the <Term t="hurewicz-theorem">Hurewicz theorem</Term> says the first nonzero homotopy group of a simply connected space agrees with its first nonzero homology
	group. But then the two part ways completely:
</p>

<div class="table-wrap">
	<table class="spheres">
		<thead>
			<tr><th>\(k\)</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr>
		</thead>
		<tbody>
			<tr><td>\(H_k(S^2)\)</td><td>\(0\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td></tr>
			<tr class="pi"><td>\(\pi_k(S^2)\)</td><td>\(0\)</td><td>\(\Z\)</td><td>\(\Z\)</td><td>\(\Z/2\)</td><td>\(\Z/2\)</td><td>\(\Z/12\)</td><td>\(\Z/2\)</td><td>\(\Z/2\)</td><td>\(\Z/3\)</td><td>\(\Z/15\)</td></tr>
		</tbody>
	</table>
</div>

<p>
	The 2-sphere has no homology above degree 2, but it has nonzero homotopy groups in infinitely many degrees (a theorem of Jean-Pierre
	Serre, proved with the spectral sequences of <Ref to="big-picture/homological-algebra" hash="spectral-sequences" />), and nobody knows
	them all. The first surprise is \(\pi_3(S^2)\cong\Z\), discovered by Heinz Hopf in 1931. It is generated by a map from the 3-sphere to
	the 2-sphere that you can actually see.
</p>

<History title="Hopf’s surprise">
	<p>
		Heinz Hopf found his map in 1931, four years before Witold Hurewicz defined the higher homotopy groups in general. Homology sees
		nothing between \(S^3\) and \(S^2\) — \(H_3(S^2) = 0\) — so it would be reasonable to guess that every map from the 3-sphere to the
		2-sphere can be squashed to a point. Hopf showed instead that there are infinitely many essentially different such maps, told
		apart by an integer, his invariant. The tool he used was linking, an idea as old as Gauss.
	</p>
</History>

<h3 id="hopf-fibration">The Hopf fibration</h3>

<p>
	Think of the 3-sphere as the pairs of complex numbers \((z_1, z_2)\) with \(|z_1|^2 + |z_2|^2 = 1\), and of the 2-sphere as the complex
	numbers together with a point at infinity. The <dfn>Hopf map</dfn> sends \((z_1, z_2)\) to the ratio \(z_1/z_2\). Multiplying both
	\(z_1\) and \(z_2\) by the same unit complex number \(e^{it}\) does not change the ratio, so the points of \(S^3\) that map to any one
	point of \(S^2\) form a whole circle — a <em>fibre</em>. The 3-sphere is a union of circles, one over each point of the 2-sphere,
	none of them intersecting.
</p>

<Figure size="full" num="4" title="The Hopf fibration" hint="Drag to rotate · scroll or pinch to zoom · change the number of circles">
	<HopfFibration />
	{#snippet caption()}
		The fibres of the Hopf map, drawn in ordinary space by stereographic projection from the 3-sphere. Each coloured circle sits over
		the point of the same colour on the little base sphere: the circles over one circle of latitude fill a torus (switch on “Show the
		tori”), and the tori are nested. The two white fibres sit over the poles (the white dots): over the north pole, the flat circle at
		the core of every torus; over the south pole, the vertical axis — a circle through the point at infinity. The gold and teal circles
		are two fibres over far-apart points, and like every pair of fibres, they are linked exactly once.
	{/snippet}
</Figure>

<p>
	Why does this show that \(\pi_3(S^2)\neq 0\)? If the Hopf map could be deformed to a constant map, one could also deform away the
	pattern of its fibres; but the preimages of any two points of \(S^2\) are two circles that link once, and Hopf showed that this
	<em>linking number</em> — now called the Hopf invariant — cannot change under deformation. The book’s test suite computes the linking
	number of pairs of these fibres numerically (by Gauss’s double integral) and gets \(\pm1\) every time. A linked pair of circles, a
	whole space filled with them, and an integer that refuses to change: that is \(\pi_3(S^2)\cong\Z\).
</p>

<Warning title="Why homotopy is so much harder">
	<p>
		Homology satisfies <Term t="excision">excision</Term>: you can cut a space into pieces, compute each piece, and glue the answers
		with <Term t="mayer-vietoris-sequence">Mayer–Vietoris</Term>. That is
		what made the computations of Part III possible. Homotopy groups have no excision. A sphere can be built from two disks, each with
		no homotopy at all, glued along their rims, yet \(\pi_3(S^2)\neq0\): the higher homotopy is created by the gluing in a way no local
		bookkeeping can track. Even the homotopy groups of spheres are still not known in general; recent record computations of the
		“stable” ones, by Daniel Isaksen, Guozhen Wang and Zhouli Xu, reach dimension 90 using spectral sequences and computer assistance.
	</p>
</Warning>

<h2 id="sheaves">Sheaf cohomology and the rising sea</h2>

<p>
	In <Ref to="cohomology/sheaves" /> you met <Term t="sheaf">sheaves</Term> — data attached to the open sets of a space, with rules for
	restricting and gluing — and <Term t="cech-cohomology">Čech cohomology</Term>, which measures how local data fails to glue into global data. In the 1950s this became the language of a
	revolution in algebraic geometry, the study of shapes defined by polynomial equations.
</p>

<p>
	The tools were those of the last two chapters. Jean-Pierre Serre’s 1955 paper “Faisceaux algébriques cohérents” brought sheaf
	cohomology into algebraic geometry. Alexander Grothendieck’s Tôhoku paper of 1957 then did two things at once: it set out the axioms of
	abelian categories (<Ref to="big-picture/categories" hash="abelian-categories" />) and defined sheaf cohomology as the derived functors (<Ref
		to="big-picture/homological-algebra"
		hash="tor-and-ext"
	/>) of “take global sections”. Global sections are left exact but not exact, and cohomology measures the failure — the same story as
	Hom and Ext.
</p>

<Example title="Riemann–Roch: topology inside algebra">
	<p>
		On a compact Riemann surface of genus \(g\) — a doughnut with \(g\) holes, given the structure of a complex curve — let \(L\) be a
		line bundle of degree \(d\) (for example, \(H^0(L)\) can be the space of meromorphic functions allowed simple poles at \(d\)
		chosen points and nowhere else). The Riemann–Roch theorem, in its cohomological
		form, says
		\[ \dim H^0(L) - \dim H^1(L) = d + 1 - g . \]
		The left side counts global solutions and the obstructions to finding more; the right side contains the genus, a purely topological
		number. Counting holes tells you how many functions with prescribed poles exist.
	</p>
</Example>

<p>
	Grothendieck and his school went on to build étale cohomology, a cohomology theory for shapes defined over finite fields, where
	ordinary topology makes no sense. With it, Pierre Deligne proved the last of the Weil conjectures in 1974: the number of solutions of
	polynomial equations over finite fields is governed by “Betti numbers”, exactly as a <Term t="lefschetz-fixed-point-theorem">Lefschetz fixed-point formula</Term> would predict. The
	method was the one Grothendieck described with an image — not cracking a hard problem with a hammer, but surrounding it with theory
	until it dissolves. In Colin McLarty’s translation, his first analogy for that approach was “immersing the nut in some softening
	liquid, and why not simply water?”; the second became the epigraph of <Ref to="big-picture/homological-algebra" />: the rising sea.
</p>

<h2 id="applications">Homology at work</h2>

<p>
	Homology was invented to answer questions in pure mathematics. A century later it turns up in laboratories, in robots and in the
	theory of materials. Here is a quick, honest tour; the map below collects these and more, with references for each.
</p>

<ul>
	<li>
		<strong>Physics.</strong> The integer quantum Hall effect, in which the electrical conductance of a two-dimensional material comes
		in exact integer steps, is explained by a Chern number — a characteristic class (<Ref to="cohomology/characteristic-classes" />)
		— as shown by Thouless, Kohmoto, Nightingale and den Nijs in 1982. Topological insulators and superconductors are organised by
		K-theory and Bott periodicity (Kitaev, 2009). Topological quantum field theories were axiomatised by Atiyah in 1988 as, in effect,
		functors from a category of cobordisms to vector spaces; and physicists use cohomology and cobordism invariants to describe the
		“anomalies” that can obstruct a quantum field theory from being consistently defined.
	</li>
	<li>
		<strong>Data.</strong> Persistent homology (<Ref to="homology/persistence" />) finds shape in point clouds — loops in the space of
		natural image patches, voids in materials, cycles in evolutionary histories. Sensors that only know which neighbours they can hear
		can certify, with homology, that a region is fully covered (de Silva and Ghrist, 2007).
	</li>
	<li>
		<strong>Neuroscience.</strong> The topology of correlations between neurons can reveal geometric structure in their activity
		(Giusti, Pastalkova, Curto and Itskov, 2015), and the <Term t="nerve-theorem">nerve theorem</Term> of <Ref
			to="cohomology/sheaves"
		/> explains how overlapping
		“place fields” of neurons could encode the shape of an environment.
	</li>
	<li>
		<strong>Robotics.</strong> The positions of a robot form a configuration space. Michael Farber’s <em>topological complexity</em>
		uses cohomology (its <Term t="cup-product">cup products</Term>, in fact) to bound from below how many separate continuous rules any motion planner must use;
		a single continuous rule exists only when the configuration space is contractible.
	</li>
	<li>
		<strong>Knots.</strong> Khovanov homology (2000) assigns to each knot a family of homology groups whose graded Euler characteristic
		is the Jones polynomial, a famous knot invariant — the polynomial is a “shadow” of the homology, as \(\chi\) is a shadow of the
		Betti numbers. Promoting a number or polynomial to a homology theory in this way is called <dfn>categorification</dfn>, and the
		extra information pays: Kronheimer and Mrowka showed in 2011 that Khovanov homology recognises the unknot, something not known for
		the Jones polynomial itself.
	</li>
</ul>

<Figure size="full" num="5" title="A map of the subject" hint="Select a star to read about that field">
	<SubjectMap />
	{#snippet caption()}
		Some of the fields that grew out of homology and cohomology, grouped as pure mathematics (violet), applications (teal) and physics
		(rose), with lines for strong connections. Each star has a short description and references to start from. The map is a sketch, not
		a census — every field here has neighbours that did not fit.
	{/snippet}
</Figure>

<h2 id="explorations">Explorations</h2>

<p>
	Instead of exercises, three open-ended explorations. Each has a discussion rather than a solution: there is more than one good
	answer, and the point is to think.
</p>

<Exercise level={2} title="Rank something you care about">
	<p>
		Choose a small league or tournament where not every pair has played (or any set of pairwise preferences: films, foods, chess
		openings). Enter five of the teams and six of the games into Figure 2. How much of the result is explained by a ranking? Is the
		inconsistency local (curl) or global (harmonic)? What would it mean, practically, if the harmonic part were large?
	</p>
	{#snippet solution()}
		<p>
			A large gradient share means the results are close to consistent with a single strength per team. A large curl share means there
			are genuine three-way cycles among teams that all played each other — perhaps styles of play that beat each other in a circle. A
			large harmonic share is the most interesting: the results are consistent on every triangle you can check, yet impossible to
			explain by a ranking, because the cycle runs around a loop of games with no shortcuts. Two practical readings: the schedule has a
			“hole” (some teams never meet), so the league cannot be ranked without more games; and the cheapest new game to schedule is one
			that fills the hole, turning the harmonic part into curl you can see. This is the local-versus-global theme of <Ref
				to="cohomology/cochains"
			/> in a new costume.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Linked circles everywhere">
	<p>
		In Figure 4, switch on the tori and watch a single torus while you rotate. (a) Convince yourself that each fibre on a torus winds
		once around in each direction, so that any two fibres on the same torus are linked once. (b) Why are two fibres on <em>different</em>
		tori also linked? (c) What would it mean for \(\pi_3(S^2)\) if some pair of fibres were unlinked?
	</p>
	{#snippet solution()}
		<p>
			(a) On the torus over a latitude, a fibre is a curve of type \((1,1)\): it goes once around the hole and once around the tube.
			Two disjoint \((1,1)\) curves on a torus in space link once — you can see one passing through the other’s disk. (b) The tori are
			nested, and every fibre on an inner torus passes once through the disk bounded by any fibre on an outer torus; equivalently, the
			linking number is a continuous integer-valued function of the pair of base points, so it is constant, and we just computed it is 1.
			The extreme cases are instructive: the fibre over the north pole is the central unit circle, and the fibre over the south pole is
			the vertical axis (a circle through infinity), and these visibly link. (c) The Hopf invariant would be zero, and Hopf’s argument
			would give no obstruction to deforming the map to a constant; in fact the invariant is 1, so the Hopf map generates \(\pi_3(S^2)\cong\Z\).
			Going further: the same construction with quaternions gives a map \(S^7\to S^4\) whose fibres are 3-spheres, and shows that
			\(\pi_7(S^4)\) contains a copy of \(\Z\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Design your own homology theory">
	<p>
		The Eilenberg–Steenrod axioms leave room for theories in which a point has homology in many degrees. Suppose you wanted a theory
		whose “cycles” are closed manifolds mapped into a space, and whose “boundaries” are the manifolds that bound. What should the groups
		of a point be in dimensions 0, 1 and 2? Which of the five axioms would you expect to survive?
	</p>
	{#snippet solution()}
		<p>
			This is (unoriented) cobordism. For a point, a “cycle” of dimension \(n\) is just a closed \(n\)-manifold, and it is zero when it
			bounds. In dimension 0 a closed manifold is a finite set of points, which bounds exactly when the number of points is even
			(pairs of points bound arcs), so the group is \(\Z/2\). In dimension 1 every closed manifold is a union of circles, each bounding a
			disk, so the group is \(0\). In dimension 2 it is \(\Z/2\), generated by \(\RP^2\), since a closed surface bounds exactly when its
			Euler characteristic is even. Homotopy invariance, exactness, excision and additivity all survive — Thom’s work shows this is a
			genuine generalized homology theory — but the dimension axiom fails, because the point has a nonzero group in dimension 2.
		</p>
	{/snippet}
</Exercise>

<h2 id="study-guide">Where to go next: a study guide</h2>

<p>
	Where you go from here depends on what drew you to this book. Three paths, each with a short annotated list. (If you read only one
	thing next, make it Hatcher’s <em>Algebraic Topology</em>: after this book, its Chapters 2 and 3 will feel like coming home.)
</p>

<h3>The pure path: topology, geometry, algebra</h3>
<p>
	Read Hatcher to consolidate, then Bott–Tu for the differential-forms viewpoint and spectral sequences, then Milnor–Stasheff for
	characteristic classes. K-theory and homological algebra open up from there, and category theory runs alongside everything.
</p>
<FurtherReading items={[...pure]} />

<h3>The applied path: data, networks, computation</h3>
<p>
	Start with Ghrist for breadth and Lim for the linear algebra of cohomology and Hodge theory; then the original papers behind this
	chapter’s figures, and a computational text for algorithms.
</p>
<FurtherReading items={[...applied]} />

<h3>The physics path: fields, phases, knots</h3>
<p>
	Physicists usually meet cohomology through differential forms and gauge fields. These books build that bridge, and the two papers
	show where current research has taken it.
</p>
<FurtherReading items={[...physics]} />

<h2 id="closing">The shape of a question, revisited</h2>

<p>
	This book began, in <Ref to="prelude/shape-of-a-question" />, with two questions: what does it mean for two shapes to be “the
	same”, and why would anyone count holes?
</p>

<p>
	To the first question we now have a layered answer. Two shapes can be equal, homeomorphic, or homotopy equivalent — and each of these
	is “isomorphic” in a suitable category. Homology and cohomology are functors: they cannot see the difference between equivalent shapes,
	so whenever they report a difference, the difference is real. That is why a computation with matrices can prove that a coffee cup is
	not a sphere, that every map of a disk to itself has a fixed point, and that you cannot comb a hairy ball.
</p>

<p>
	To the second question the answer has grown in the telling. A hole turned out to be a cycle that bounds nothing; counting holes became
	computing \(\ker\partial/\im\partial\); and the same pattern — something that is locally fine but globally obstructed — reappeared as
	an impossible staircase, a vortex, a twisted bundle, a sensor network with a gap, a ranking that cannot be made consistent, a knot that
	cannot be untied. Cohomology is the general measure of that gap between local and global. Counting holes, it turns out, is a way of
	understanding why things that work everywhere locally can fail to work everywhere at once.
</p>

<p>
	Along the way the book kept restaging four ideas: <strong>quotients</strong> (identify things — cycles modulo boundaries),
	<strong>kernels and images</strong> (what is crushed, what is reached), <strong>formal sums</strong> (chains as inventories of
	pieces), and <strong>reversed arrows</strong> (preimages, transposes, pullbacks, cochains). If those four ideas now feel like old
	friends, then the book has done what Thurston asked of mathematics in the epigraph: helped you understand and think more clearly.
	The rest of the subject is waiting — and you already speak its language.
</p>

<Recap title="This chapter in brief">
	<ul>
		<li>
			<strong>Hodge theory</strong>: each cohomology class has a unique harmonic representative; on a complex, \(L_1 = \delta_0\delta_0^{\mathsf
			T} + \delta_1^{\mathsf T}\delta_1\), flows split as gradient + curl + harmonic by least squares, and the harmonic flows form a
			space of dimension \(b_1\).
		</li>
		<li><strong>HodgeRank</strong> ranks from pairwise comparisons and splits inconsistency into local cycles (curl) and global cycles (harmonic).</li>
		<li>
			<strong>Circular coordinates</strong>: \(H^1(X;\Z)\cong[X,S^1]\); an integer cocycle smoothed by least squares gives every data
			point an angle.
		</li>
		<li>
			<strong>Generalized cohomology</strong> drops the dimension axiom: K-theory (vector bundles, Bott periodicity) and cobordism
			(manifolds up to bounding); cohomology theories are represented by spaces and spectra, \(H^n(X;G)\cong[X,K(G,n)]\).
		</li>
		<li>
			<strong>Homotopy groups</strong> are much harder than homology: \(\pi_3(S^2)\cong\Z\), generated by the Hopf fibration, whose
			circle fibres are linked in pairs.
		</li>
		<li>
			<strong>Sheaf cohomology</strong>, defined by derived functors in abelian categories, became the language of algebraic geometry
			(Riemann–Roch, étale cohomology, the Weil conjectures).
		</li>
		<li>
			Homology is at work in physics (Chern numbers, K-theory of materials, TQFT), data science, neuroscience, robotics and knot theory.
		</li>
	</ul>
</Recap>

<style>
	.spheres td,
	.spheres th {
		text-align: center !important;
		white-space: nowrap;
	}
	.spheres tr.pi td {
		color: var(--gold-bright);
	}
</style>