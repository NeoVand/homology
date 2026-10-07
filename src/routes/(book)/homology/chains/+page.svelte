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
	import Notation from '$lib/components/prose/Notation.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import ChainPlayground from '$lib/figures/homology/chains/ChainPlayground.svelte';
	import TriangleBoundary from '$lib/figures/homology/chains/TriangleBoundary.svelte';
	import TetraCascade from '$lib/figures/homology/chains/TetraCascade.svelte';
	import OrientationSigns from '$lib/figures/homology/chains/OrientationSigns.svelte';
	import ModTwoVsIntegers from '$lib/figures/homology/chains/ModTwoVsIntegers.svelte';
	import BoundaryMatrices from '$lib/figures/homology/chains/BoundaryMatrices.svelte';
	import ConveyorBelt from '$lib/figures/homology/chains/ConveyorBelt.svelte';
</script>

<Epigraph author="Jeremy Kun" source="Homology Theory — A Primer (2013)">A boundary itself has no boundary.</Epigraph>

<p class="lead">
	In the last chapter we played with edges and triangles by hand. We added sets of edges, cancelling whatever they shared; we took the rim of a filled
	region; and we noticed that a rim never has loose ends. This chapter turns those three observations into a machine — the machine that every computation of
	homology runs on.
</p>

<p>
	The machine has two parts and one law. The parts are <strong>chains</strong>, which are things made of simplices that we can add, and the
	<strong>boundary operator</strong> \(\partial\), which takes a chain to its edge. The law is that the boundary of a boundary is zero:
	\(\partial \circ \partial = 0\). We will build everything twice. First with arithmetic mod 2, where a chain is a plain set of simplices and there are no signs
	to worry about. Then with integers, where chains remember directions and multiplicities — which costs us some careful bookkeeping with plus and minus signs,
	and buys us the ability to see twisting that mod 2 is blind to.
</p>

<Ahead>
	<p>
		Chains, the boundary operator, \(\partial\partial = 0\) and chain complexes are the skeleton of everything that follows. <Ref
			to="homology/homology-groups"
		/> defines homology as the cycles modulo the boundaries, \(H_k = \ker\partial_k / \im\partial_{k+1}\) — a definition that only makes sense because
		\(\partial\partial = 0\). <Ref to="homology/computing" /> computes it with the boundary matrices introduced here. And in Part IV the same matrices reappear
		transposed: cohomology is built from \(\partial^{\mathsf T}\), and the law \(\partial\partial = 0\) becomes \(\delta\delta = 0\) and, for differential
		forms, \(d\,d = 0\).
	</p>
</Ahead>

<h2 id="chains-mod-2">Chains: inventories of simplices</h2>

<p>
	Start with a question that sounds too easy: what is the edge of a triangle? Not a segment, but three segments. And the skin of a solid tetrahedron is not
	a triangle but four triangles. David Farrell’s video series <em>You Could Have Invented Homology</em> draws the skin of a tetrahedron beside a triangle
	with the verdict \(\partial\Delta^3 \not\approx \Delta^2\): the boundary of the solid tetrahedron \(\Delta^3\) is not a triangle \(\Delta^2\), or any
	other single simplex <Cite k="farrell2021" />. So if “take the edge” is to be an operation we can apply, and then apply again — and this whole chapter is
	about applying it again — we need objects made of <em>several</em> simplices, which we can add together. Those objects are chains.
</p>

<p>
	First, some notation. Throughout this chapter \(K\) is a <Term t="simplicial-complex">simplicial complex</Term> (see <Ref to="topology/simplicial-complexes" />): a collection of
	vertices, edges, triangles, tetrahedra and their higher-dimensional cousins, glued along shared faces. A <dfn>\(k\)-simplex</dfn> has \(k + 1\) vertices: a
	0-simplex is a vertex, a 1-simplex an edge, a 2-simplex a triangle, a 3-simplex a solid tetrahedron. We label vertices by whole numbers and write a simplex
	by listing its vertices in increasing order inside square brackets, so \([0,2,3]\) is the triangle with vertices \(0\), \(2\) and \(3\). We write \(n_k\) for
	the number of \(k\)-simplices of \(K\).
</p>

<p>
	In <Ref to="homology/cycles-and-boundaries" /> we collected edges into sets and added the sets, with anything shared cancelling. Nothing about that idea is
	special to edges.
</p>

<Definition id="def-chain-mod-2" title="Chains with coefficients mod 2">
	<p>
		A <dfn>\(k\)-chain</dfn> of \(K\) with coefficients in \(\Z/2\) is a set of \(k\)-simplices of \(K\). Two chains are added by <em>symmetric difference</em>:
		\(c + c'\) consists of the simplices that lie in exactly one of \(c\) and \(c'\). The empty chain is written \(0\).
	</p>
</Definition>

<p>
	It is convenient to write a chain as a sum of its simplices: the chain consisting of the triangles \([0,1,2]\) and \([0,2,3]\) is written \([0,1,2] +
	[0,2,3]\). In this notation the cancellation rule reads
</p>
\[ \sigma + \sigma = 0 \qquad\text{for every simplex } \sigma, \]
<p>
	which is the arithmetic of \(\Z/2\), where \(1 + 1 = 0\). Each \(k\)-simplex carries a coefficient, \(1\) if it is in the chain and \(0\) if it is out, and
	adding chains adds the coefficients, mod 2.
</p>

<Definition id="def-chain-group-mod-2">
	{#snippet head()}The chain space \(C_k(K;\Z/2)\){/snippet}
	<p>
		The set of all \(k\)-chains of \(K\) with coefficients in \(\Z/2\) is written \(C_k(K;\Z/2)\). With the addition above it is a
		<Term t="vector-space">vector space</Term> over \(\Z/2\) (see <Ref to="foundations/linear-algebra" />). The single simplices form a basis, so its dimension
		is \(n_k\), and it contains \(2^{n_k}\) chains.
	</p>
</Definition>

<p>
	If we list the \(k\)-simplices in a fixed order, a \(k\)-chain becomes a column of \(n_k\) zeros and ones, and adding chains is adding columns entry by entry,
	mod 2. The fan of Figure 3.2.1 below has \(n_0 = 7\) vertices, \(n_1 = 12\) edges and \(n_2 = 5\) triangles, so it has \(2^5 = 32\) different 2-chains and
	\(2^{12} = 4096\) different 1-chains. For completeness, \(C_k(K;\Z/2) = 0\) whenever \(K\) has no \(k\)-simplices — in particular for negative \(k\).
</p>

<Intuition title="Three ways to picture a chain">
	<ul>
		<li><em>An inventory:</em> a list saying, for each \(k\)-simplex, whether it is taken. This is the picture for definitions.</li>
		<li><em>A column of zeros and ones:</em> a vector in \((\Z/2)^{n_k}\). This is the picture for computation.</li>
		<li>
			<em>A shape drawn on the complex:</em> a 2-chain is a patchwork region of triangles, a 1-chain a collection of paths and loops, a 0-chain a sprinkle of
			points. This is the picture for intuition.
		</li>
	</ul>
	<p>All three describe the same object; good topologists switch between them without noticing.</p>
</Intuition>

<Question>
	<p>The hollow triangle has three vertices and three edges. How many 1-chains mod 2 does it have, and which of them have no loose ends?</p>
	<p>
		There are \(2^3 = 8\): the empty chain, three single edges, three pairs of edges, and all three edges. A single edge has two loose ends, and a pair of
		edges is a path with two loose ends; only the empty chain and the whole triangle have none.
	</p>
</Question>

<Remark title="Why “chain”?">
	<p>
		The name suggests simplices strung together like the links of a necklace, and in the simplest examples — a path of edges — that is exactly what a chain
		looks like. But the meaning is more relaxed: any collection of simplices of one dimension, connected or not, is a chain. A chain is a <em>formal sum</em>
		— one of the four ideas this book keeps returning to (with quotients, kernels and images, and reversed arrows). We add simplices without ever “computing”
		the sum; the sum is the inventory.
	</p>
</Remark>

<h2 id="boundary-mod-2">The boundary of a chain, mod 2</h2>

<p>
	A \(k\)-simplex \([v_0, \dots, v_k]\) has \(k + 1\) faces of one dimension less, obtained by deleting one vertex at a time. We call them its
	<dfn>codimension-one faces</dfn>, or its \((k-1)\)-faces. A triangle has three edges; a tetrahedron has four triangles; an edge has two endpoints. (Some
	books call these faces <em>facets</em>; in this book a <Term t="facet">facet</Term> is a maximal simplex of a complex, so we avoid the word here.) The
	boundary of a simplex is the chain made of its codimension-one faces.
</p>

<Definition id="def-boundary-mod-2" title="The boundary operator, mod 2">
	<p>The <dfn>boundary</dfn> of a simplex is the sum of its codimension-one faces:</p>
	\[
	\begin{aligned}
	\partial[v_0] &= 0, \\
	\partial[v_0, v_1] &= [v_0] + [v_1], \\
	\partial[v_0, v_1, v_2] &= [v_1, v_2] + [v_0, v_2] + [v_0, v_1], \\
	\partial[v_0, v_1, v_2, v_3] &= [v_1, v_2, v_3] + [v_0, v_2, v_3] \\
	&\quad + [v_0, v_1, v_3] + [v_0, v_1, v_2].
	\end{aligned}
	\]
	<p>
		The boundary of a chain is the sum of the boundaries of its simplices, added mod 2 — that is, the set of faces that occur an
		<strong>odd</strong> number of times. This defines a function \(\partial_k\colon C_k(K;\Z/2) \to C_{k-1}(K;\Z/2)\) for every \(k\).
	</p>
</Definition>

<p>
	The subscript \(k\) on \(\partial_k\) records which chains it eats; we drop it when the dimension is clear. A vertex has no faces at all, so \(\partial_0 =
	0\). Read \(\partial\) aloud as “boundary of”, or simply “del”.
</p>

<Example title="Two triangles">
	<p>Take \(c = [0,1,2] + [0,2,3]\), two triangles sharing the edge \([0,2]\). Add up their boundaries:</p>
	\[ \partial c = \big([1,2] + [0,2] + [0,1]\big) + \big([2,3] + [0,3] + [0,2]\big) = [0,1] + [1,2] + [2,3] + [0,3]. \]
	<p>The shared edge \([0,2]\) occurs twice and cancels; what remains is the rim of the four-sided region the triangles fill.</p>
</Example>

<p>
	Because the boundary of a chain is defined simplex by simplex and then added up, it respects addition:
</p>
\[ \partial(c + c') = \partial c + \partial c'. \]
<p>
	(Counting how often a face occurs in \(c + c'\) gives the count for \(c\) plus the count for \(c'\), minus twice the count for the simplices they share —
	and minus twice anything is invisible mod 2.) A function between vector spaces that respects addition in this way is <em>linear</em>; so \(\partial_k\) is a
	linear map, and like every linear map it can be written as a matrix. We will do that in <a href="#boundary-matrices">a later section</a>.
</p>

<p>Now look at what \(\partial\) does to the objects of the last chapter.</p>
<ul>
	<li>
		For a 1-chain — a set of edges — \(\partial c\) is the set of vertices touched an odd number of times: exactly the <Term t="loose-end">loose ends</Term>.
		So <strong>\(c\) is a cycle precisely when \(\partial c = 0\)</strong>.
	</li>
	<li>
		For a 2-chain — a set of triangles — \(\partial c\) is the set of edges that are sides of an odd number of the triangles: exactly the
		<Term t="rim">rim</Term>. So <strong>a 1-chain \(b\) is a boundary precisely when \(b = \partial c\) for some 2-chain \(c\)</strong>.
	</li>
</ul>
<p>Both of the central notions of the last chapter have become statements about one map.</p>

<Example title="Paths and loops, mod 2">
	<p>Along the path \(0 \to 1 \to 2 \to 3\), every inner vertex is the end of two edges and cancels:</p>
	\[ \partial\big([0,1] + [1,2] + [2,3]\big) = [0] + [1] + [1] + [2] + [2] + [3] = [0] + [3]. \]
	<p>
		The boundary of a path is its pair of endpoints. Close the path into a loop and the two endpoints become the same vertex, which then cancels too:
		\(\partial\big([0,1] + [1,2] + [0,2]\big) = 0\).
	</p>
</Example>

<Figure num="3.2.1" title="A ℤ/2 chain playground" hint="Tap triangles (or edges) · take the boundary again">
	<ChainPlayground />
	{#snippet caption()}
		Tap triangles to build a 2-chain \(\chn{c}\); its boundary \(\bdy{\partial c}\) — the edges used an odd number of times — glows teal. Press “take the
		boundary again”: the gold numbers count how many edges of \(\partial c\) meet at each vertex, and they are always even. Switch to 1-chains and find a
		cycle that is not a boundary.
	{/snippet}
</Figure>

<h2 id="boundary-of-a-boundary">The boundary of a boundary</h2>

<p>
	If you played with Figure 3.2.1 you will have noticed something that never fails. Build any 2-chain \(c\), take its boundary \(\partial c\), then take the
	boundary of <em>that</em>: you always get \(0\). The rim of a region never has loose ends. The same is true in every dimension, and the reason is a small
	piece of counting.
</p>

<Theorem id="thm-dd-mod-2">
	{#snippet head()}\(\partial \circ \partial = 0\), mod 2{/snippet}
	<p>For every \(k\) and every chain \(c \in C_k(K;\Z/2)\), \(\;\partial_{k-1}(\partial_k c) = 0\).</p>
</Theorem>

<Proof>
	<p>
		Since \(\partial\) respects addition, it is enough to check the claim for a single simplex \(\sigma = [v_0, \dots, v_k]\); a chain is a sum of simplices,
		and a sum of zeros is zero.
	</p>
	<p>
		Every term of \(\partial\partial\sigma\) is a face \(\tau\) of \(\sigma\) of dimension \(k - 2\): it is \(\sigma\) with <em>two</em> vertices removed, say
		\(v_i\) and \(v_j\). How many times does \(\tau\) occur? Once for each codimension-one face of \(\sigma\) that contains \(\tau\). Such a face leaves out
		exactly one vertex of \(\sigma\), and if it is to contain \(\tau\), the vertex it leaves out must be \(v_i\) or \(v_j\). So exactly two of them contain
		\(\tau\): the one without \(v_i\) and the one without \(v_j\). Every \(\tau\) therefore occurs exactly twice in \(\partial\partial\sigma\), and \(\tau + \tau = 0\).
	</p>
</Proof>

<Figure num="3.2.2" title="∂∂ of a triangle">
	<TriangleBoundary />
	{#snippet caption()}
		The triangle \(\chn{\sigma}\) has three edges; together they have six endpoints, and each vertex is an endpoint of exactly two of them. Mod 2 the pairs
		cancel. (The signs show the integer version of the same picture, which we reach in a moment: each pair is a \(+\) and a \(-\).)
	{/snippet}
</Figure>

<p>
	For a triangle, the two-line proof is the picture above: three edges, six endpoints, every vertex counted twice. For a solid tetrahedron the boundary is
	four triangles; the boundaries of those are twelve edge-copies; and since a tetrahedron has only six edges, each edge must appear exactly twice — once in
	each of the two triangles that share it. Step through it in three dimensions.
</p>

<Figure num="3.2.3" title="The boundary of a boundary, in 3D" hint="Step through · drag to rotate · mod 2 or with signs">
	<TetraCascade />
	{#snippet caption()}
		A solid tetrahedron explodes into its four faces (\(\partial\sigma\), teal), and each face shows its three edges (\(\partial\partial\sigma\)). Every edge
		turns up in two faces — the matching colours — and the two copies cancel. With signs on, the two copies of each edge point in opposite directions.
	{/snippet}
</Figure>

<KeyIdea title="Every boundary is a cycle">
	<p>
		If \(b = \partial c\), then \(\partial b = \partial\partial c = 0\). So every boundary is a cycle: the rim of anything has no rim of its own. In Kun’s
		phrase, which heads this chapter: “A boundary itself has no boundary.” <Cite k="kun2013" />
	</p>
	<p>
		This is the single fact that makes homology possible. Homology asks which cycles are <em>not</em> boundaries, and counts what is left when the
		boundaries are discarded. That subtraction only makes sense because the boundaries sit inside the cycles to begin with — the filled-in loops are some of
		the loops. If a rim could have loose ends, “cycles minus boundaries” would be like taking the fish out of a basket of apples.
	</p>
</KeyIdea>

<History title="Dropping the signs, on purpose">
	<p>
		Homology was born with whole-number coefficients: Poincaré’s “homologies” of 1895 related integer combinations of oriented pieces of a space, and could
		be added like ordinary equations <Cite k="poincare1895,weibel1999" />. Coefficients mod 2 came later, in a 1908 paper of Heinrich Tietze <Cite k="tietze1908" />, and soon earned their
		keep. In 1913 Oswald Veblen and James Alexander used them to extend Poincaré duality to every closed manifold, orientable or not
		<Cite k="veblen-alexander1913" />. Alexander explained the appeal in 1922, in the paper that introduced what we now call Alexander duality: “The theory
		of connectivity may be approached from two different angles depending on whether or not the notion of sense is developed and taken into consideration.
		We have adopted the second and somewhat simpler point of view…” <Cite k="alexander1922" />. “Connectivity” was his word for homology, and “sense” means
		orientation. Jean-Claude Hausmann quotes the passage at the start of his modern textbook on homology mod 2 <Cite k="hausmann2014" />.
	</p>
</History>

<h2 id="orientation">Directions: why mod 2 is not enough</h2>

<p>
	Mod 2 arithmetic gave us clean definitions and a two-line proof. It also throws away information, and some of that information is exactly what we will
	later want to measure.
</p>

<h3>What mod 2 cannot see</h3>

<p>
	A chain mod 2 cannot say “twice”. Go around a loop on a torus twice, and mod 2 the result is \(\sigma + \sigma = 0\) for every edge: the same as not moving
	at all. Nor can a chain mod 2 say “backwards”. Those sound like small losses, but they have a large consequence. In <Ref to="homology/homology-groups" /> we
	will find that mod 2 counting gives the torus and the Klein bottle exactly the same numbers of holes in every dimension, \(1, 2, 1\) — even though they are
	different surfaces. What tells them apart is a loop on the Klein bottle that bounds nothing, although going around it twice <em>does</em> bound. Mod 2 sees
	“twice” as “zero” and so cannot notice. Seeing such twisting — called <em>torsion</em> — requires chains that count with whole numbers and keep track of
	direction (<Ref to="homology/computing" />).
</p>

<p>
	There is also a reason from calculus. Think of a chain as something you integrate over. If you integrate a quantity along a path \(C\) and then along a
	path \(D\), the total is the integral along “\(C + D\)”; integrate along \(C\) twice and you get twice the answer; walk \(C\) backwards and the answer
	changes sign. Paths that can be added, doubled and reversed are chains with integer coefficients. (Integrals are where the subject began: Riemann started
	counting curves that bound because integrals around such curves vanish, as the history box of <Ref to="homology/cycles-and-boundaries" hash="homologous"
		>the last chapter</Ref
	> recalls. Part IV makes the link exact.)
</p>

<h3>Oriented simplices</h3>

<p>
	To reverse things we first need a direction to reverse, and <Ref to="topology/simplicial-complexes" hash="orientation" /> supplied one. Recall that an
	<Term t="orientation-of-a-simplex">orientation</Term> of a simplex is a choice of the order of its vertices, where two orders count as the same
	orientation if one can be turned into the other by an even number of swaps of two vertices. Every simplex with at least two vertices has exactly two
	orientations.
</p>

<ul>
	<li>
		For an <strong>edge</strong>, \([v_0, v_1]\) means “the edge travelled from \(v_0\) to \(v_1\)”, drawn with an arrow. Reversing it gives \([v_1, v_0]\), and
		we declare \([v_1, v_0] = -[v_0, v_1]\).
	</li>
	<li>
		For a <strong>triangle</strong>, the order \([v_0, v_1, v_2]\) gives a sense of rotation: \(v_0 \to v_1 \to v_2 \to v_0\). Rotating the list,
		\([v_1, v_2, v_0]\), describes the same rotation (two swaps); swapping two vertices, \([v_1, v_0, v_2]\), reverses it (one swap). So
		\([v_1, v_2, v_0] = [v_0, v_1, v_2]\) and \([v_1, v_0, v_2] = -[v_0, v_1, v_2]\).
	</li>
	<li>
		In general, reordering the vertices of an oriented simplex multiplies it by \(+1\) if the reordering takes an even number of swaps and by \(-1\) if it
		takes an odd number.
	</li>
</ul>

<Notation title="Our standing convention">
	<p>
		As in <Ref to="topology/simplicial-complexes" hash="orientation" />, vertices are labelled by integers, and every simplex is written with its labels in
		<strong>increasing</strong> order, \([v_0, v_1, \dots, v_k]\) with
		\(v_0 \lt  v_1 \lt  \dots \lt  v_k\). This choice orients every simplex once and for all: in pictures, every edge carries an arrow from its lower label to
		its higher label. Anything written in another order is converted back with a sign; for instance \([2,0,1] = [0,1,2]\) (two swaps) and \([0,2,1] = -[0,1,2]\)
		(one swap).
	</p>
</Notation>

<Figure num="3.2.4" title="Orientation and signs" hint="Flip the edge · choose a vertex order · multiply by c">
	<OrientationSigns />
	{#snippet caption()}
		The edge: flipping it negates it, and its boundary is always <em>head minus tail</em>. The triangle: the six ways of writing the triangle \([0,1,2]\) — solid chips
		have the standard orientation, dashed chips the opposite one. Whatever order you choose, the boundary formula produces arrows that run around the triangle
		in its direction of rotation, and multiplying the chain by \(c\) multiplies every coefficient of the boundary by \(c\).
	{/snippet}
</Figure>

<h2 id="integer-chains">Integer chains and the signed boundary</h2>

<p>
	With orientations in hand, a chain can learn to say “twice” and “backwards”: we let its coefficients be any whole numbers.
</p>

<Definition id="def-integer-chain" title="Chains with integer coefficients">
	<p>
		A <dfn>\(k\)-chain</dfn> of \(K\) (with integer coefficients) is a formal sum
	</p>
	\[ c = \sum_{\sigma} a_\sigma\, \sigma, \]
	<p>
		one integer coefficient \(a_\sigma\) for each oriented \(k\)-simplex \(\sigma\) of \(K\) (written in increasing order). Chains are added coefficient by
		coefficient. The set of all \(k\)-chains is written \(C_k(K)\), or \(C_k(K;\Z)\) when we want to stress the integers.
	</p>
</Definition>

<p>
	Here \(-\sigma\) means \(\sigma\) traversed the other way, \(2\sigma\) means \(\sigma\) traversed twice, and \(0\sigma\) means \(\sigma\) not at all. For
	example, \((2[0,1] - [1,2]) + ([0,1] + [1,2]) = 3[0,1]\). Since a chain is determined by its list of \(n_k\) coefficients, \(C_k(K)\) is the
	<Term t="free-abelian-group">free abelian group</Term> with basis the \(k\)-simplices (see <Ref to="foundations/abelian-groups" />) — in down-to-earth terms,
	the integer vectors of length \(n_k\), with named coordinates. Reducing every coefficient mod 2 turns an integer chain into the mod-2 chain of the earlier
	sections: the integer version remembers everything the mod-2 version knew, and more.
</p>

<Warning title="Three common confusions">
	<ul>
		<li>
			<em>\([1,0]\) is not a new simplex.</em> It is the edge \([0,1]\) with the opposite orientation, and it is equal to \(-[0,1]\). The group \(C_1(K)\) still
			has exactly one basis element per edge.
		</li>
		<li>
			<em>Coefficients are not lengths or weights.</em> \(3[0,1]\) means “traverse \([0,1]\) three times”, and \(-[0,1]\) means “traverse it backwards”.
			Nothing is stretched.
		</li>
		<li>
			<em>A formal sum is never “simplified” geometrically.</em> The chain \([0,1] + [1,2]\) is not equal to \([0,2]\), even though both run from \(0\) to
			\(2\). They do have the same boundary, \(2 - 0\); whether they count as “the same” is a question of <em>homology</em>, for the next chapter.
		</li>
	</ul>
</Warning>

<p>
	Now the boundary. For an oriented edge there is only one sensible choice: <strong>head minus tail</strong>.
</p>
\[ \partial[v_0, v_1] = v_1 - v_0. \]
<p>
	(We write a vertex \(v\) rather than \([v]\) when it appears in a 0-chain.) This is consistent with orientation: \(\partial[v_1, v_0] = v_0 - v_1 = -\partial
	[v_0, v_1]\), just as \([v_1, v_0] = -[v_0, v_1]\). And on paths it does exactly what we want. Along the path \(0 \to 1 \to 2\),
</p>
\[ \partial\big([0,1] + [1,2]\big) = (1 - 0) + (2 - 1) = 2 - 0: \]
<p>
	the middle vertex cancels and only the endpoints survive, the end with a plus sign and the start with a minus sign. Close the path up with the edge from
	\(2\) back to \(0\), which is \([2,0] = -[0,2]\):
</p>
\[ \partial\big([0,1] + [1,2] - [0,2]\big) = (1 - 0) + (2 - 1) - (2 - 0) = 0. \]
<p>
	A closed path has boundary zero because it enters every vertex exactly as often as it leaves it. The integer cycles are the chains with this balance at
	every vertex — Kirchhoff’s current law, if you think of the coefficients as currents.
</p>

<p>
	For a triangle we want \(\partial[v_0, v_1, v_2]\) to be the loop running around it in its direction of rotation, \(v_0 \to v_1 \to v_2 \to v_0\). That loop is
	\([v_0, v_1] + [v_1, v_2] + [v_2, v_0]\), and rewriting the last edge in increasing order gives
</p>
\[ \partial[v_0, v_1, v_2] = [v_1, v_2] - [v_0, v_2] + [v_0, v_1]. \]
<p>
	Notice where the minus sign came from. Nobody put it there: it appeared the moment we wrote the edge from \(v_2\) back to \(v_0\) in increasing order. The
	signs in homology are the bookkeeping of direction, nothing more. Now look at the pattern: the \(i\)-th term leaves out the vertex \(v_i\), and
	the signs alternate \(+, -, +\). The same pattern defines the boundary in every dimension.
</p>

<Definition id="def-signed-boundary" title="The boundary operator">
	<p>The boundary of an oriented \(k\)-simplex is</p>
	\[ \partial[v_0, \dots, v_k] = \sum_{i=0}^{k} (-1)^i\, [v_0, \dots, \hat v_i, \dots, v_k], \]
	<p>
		where the hat over \(v_i\) means “leave \(v_i\) out”. The boundary of a chain is defined by \(\partial\big(\sum a_\sigma \sigma\big) = \sum a_\sigma \,
		\partial\sigma\). This gives homomorphisms \(\partial_k\colon C_k(K) \to C_{k-1}(K)\), with \(\partial_0 = 0\).
	</p>
</Definition>

<Remark title="Computing a boundary, step by step">
	<ol>
		<li>Write every simplex of the chain with its vertices in increasing order (adjusting its sign if you had to reorder it).</li>
		<li>For each simplex \([v_0, \dots, v_k]\), write down its \(k + 1\) faces: delete \(v_0\), then \(v_1\), …, then \(v_k\).</li>
		<li>Give the faces the signs \(+, -, +, -, \dots\) in that order, and multiply by the simplex’s coefficient.</li>
		<li>Collect equal faces and add their coefficients; drop anything that comes to \(0\). (Mod 2: drop anything that occurs an even number of times.)</li>
	</ol>
	<p>The faces produced in step 2 are automatically in increasing order, so no further signs are needed.</p>
</Remark>

<p>
	Read the formula aloud as: “the boundary of a simplex is the alternating sum of its faces, where the \(i\)-th face is what you get by deleting the \(i\)-th
	vertex.” For a solid tetrahedron it gives
</p>
\[ \partial[0,1,2,3] = [1,2,3] - [0,2,3] + [0,1,3] - [0,1,2]. \]

<Example title="A 2-chain with coefficients">
	<p>Linearity lets us take boundaries of any chain, one simplex at a time. For \(c = 2[0,1,2] + [1,2,3]\),</p>
	\[
	\begin{aligned}
	\partial c &= 2\big([1,2] - [0,2] + [0,1]\big) \\
	&\quad + \big([2,3] - [1,3] + [1,2]\big) \\
	&= 2[0,1] - 2[0,2] + 3[1,2] \\
	&\quad - [1,3] + [2,3].
	\end{aligned}
	\]
	<p>
		Reduce everything mod 2: the chain becomes \([1,2,3]\) (since \(2 \equiv 0\)), and its boundary becomes \([1,2] + [1,3] + [2,3]\), the rim of
		\([1,2,3]\) — the same answer the mod-2 boundary gives directly. Reducing mod 2 and taking boundaries can be done in either order.
	</p>
</Example>

<p>
	Two quick checks that the formula deserves its name. First, it reduces mod 2 to the earlier definition: forget the signs and you get the plain sum of the
	faces. Second, it respects orientation: if you write a simplex in a different vertex order, the formula produces the boundary multiplied by the sign of the
	reordering (Figure 3.2.4 shows all six orders of a triangle, and the last exercise asks you to prove it in general). So it does not matter how we write a
	simplex down — only its orientation matters, as it should.
</p>

<Figure num="3.2.5" title="Mod 2 versus integers" hint="Choose coefficients · switch between mod 2 and integers">
	<ModTwoVsIntegers />
	{#snippet caption()}
		Two triangles share the diagonal \([1,2]\). Mod 2, taking both always cancels the diagonal. With integers, \(\partial(a[0,1,2] + b[1,2,3])\) gives the
		diagonal the coefficient \(a + b\): it cancels only when the two triangles turn the same way (here \(a = -b\)), and doubles when they turn opposite ways.
	{/snippet}
</Figure>

<p>
	Figure 3.2.5 is worth a careful look, because it shows the one genuinely new phenomenon that integers bring. As drawn, \([0,1,2]\) turns anticlockwise and
	\([1,2,3]\) clockwise. With \(a = b = 1\) they cross their shared edge in the <em>same</em> direction, and its coefficient is \(2\). With \(a = 1, b = -1\) the
	second triangle is reversed; now both turn anticlockwise, they cross the shared edge in <em>opposite</em> directions, and it cancels:
</p>
\[ \partial\big([0,1,2] - [1,2,3]\big) = [0,1] - [0,2] + [1,3] - [2,3], \]
<p>
	the loop \(0 \to 1 \to 3 \to 2 \to 0\) around the outside. Triangles that turn the same way are
	<Term t="coherent-orientation">coherently oriented</Term>, in the language of <Ref to="topology/simplicial-complexes" hash="orientation" />, and for
	coherently oriented triangles, inner edges cancel and only the outer rim survives — exactly what mod 2 gave us for free. Whether a whole surface can be oriented
	coherently is the question of orientability from <Ref to="topology/manifolds" />. On a Möbius band it cannot. In <Ref to="homology/computing" /> the same
	failure, on closed surfaces such as the Klein bottle and the projective plane, surfaces as a coefficient \(2\) that refuses to cancel — and produces
	torsion.
</p>

<h2 id="boundary-squared">\(\partial \circ \partial = 0\), with signs</h2>

<p>
	Mod 2, the faces of a face cancelled because each one was counted twice. With integers, counting twice is not enough — \(2\tau\) is not zero. For the law to
	survive, the two occurrences of each face must come with opposite signs. Let us check the smallest cases by hand. For an edge there is nothing to do:
	\(\partial\partial[v_0, v_1] = \partial(v_1 - v_0) = 0\), because \(\partial_0 = 0\). For a triangle,
</p>
\[
\begin{aligned}
\partial\partial[0,1,2] &= \partial[1,2] - \partial[0,2] + \partial[0,1] \\
&= (2 - 1) - (2 - 0) + (1 - 0) \\
&= 2 - 1 - 2 + 0 + 1 - 0 = 0.
\end{aligned}
\]
<p>
	Each vertex appears twice, once with each sign — exactly the pairing in Figure 3.2.2. The alternating signs are not decoration: they are precisely what makes
	the two copies cancel. Here is the general argument, which is also the one in Hatcher’s textbook <Cite k="hatcher2002" loc="Lemma 2.1" />.
</p>

<Theorem id="thm-dd">
	{#snippet head()}\(\partial \circ \partial = 0\){/snippet}
	<p>For every \(k \geq 1\), the composite \(\partial_{k-1} \circ \partial_k\colon C_k(K) \to C_{k-2}(K)\) is zero.</p>
</Theorem>

<Proof>
	<p>
		As before it suffices to check a single oriented simplex \(\sigma = [v_0, \dots, v_k]\), because \(\partial\) respects sums. Every term of
		\(\partial\partial\sigma\) is \(\sigma\) with two vertices removed, say \(v_j\) and \(v_i\) with \(j \lt  i\); call that face \(\tau_{ji}\). It arises in
		exactly two ways.
	</p>
	<ul>
		<li>
			<em>Remove \(v_i\) first, then \(v_j\).</em> Removing \(v_i\) contributes the sign \((-1)^i\). In the face that remains, \(v_j\) still sits in position
			\(j\) (only later vertices moved), so removing it contributes \((-1)^j\). Total sign: \((-1)^{i+j}\).
		</li>
		<li>
			<em>Remove \(v_j\) first, then \(v_i\).</em> Removing \(v_j\) contributes \((-1)^j\). But now every vertex after \(v_j\) has moved one place to the left, so
			\(v_i\) sits in position \(i - 1\), and removing it contributes \((-1)^{i-1}\). Total sign: \((-1)^{i+j-1}\).
		</li>
	</ul>
	<p>
		The two signs are opposite, so the two copies of \(\tau_{ji}\) cancel. This happens for every pair \(j \lt  i\), so every term of \(\partial\partial\sigma\)
		cancels and \(\partial\partial\sigma = 0\).
	</p>
</Proof>

<p>
	Turn on “with signs” in Figure 3.2.3 and you can watch the proof happen. The four faces of \(\partial[0,1,2,3] = [1,2,3] - [0,2,3] + [0,1,3] - [0,1,2]\) come out
	coherently oriented: seen from outside, they all turn the same way. Two neighbouring faces that turn the same way cross their shared edge in opposite
	directions — the same thing we saw for the square in Figure 3.2.5 — so every edge is traversed once each way, and the twelve edge-copies cancel in six pairs.
</p>

<p>
	The consequence is the same as before, now with integers: <strong>every boundary is a cycle</strong>. If \(b = \partial c\) then \(\partial b = 0\).
</p>

<Question title="Why not just use plus signs?">
	<p>
		Suppose we tried the “all plus” boundary over the integers: \(\partial^+[a,b] = a + b\) and \(\partial^+[0,1,2] = [1,2] + [0,2] + [0,1]\). What is
		\(\partial^+\partial^+[0,1,2]\)?
	</p>
	<p>
		It is \((1 + 2) + (0 + 2) + (0 + 1) = 2\cdot 0 + 2\cdot 1 + 2\cdot 2\) — not zero. Each vertex is still counted twice, but now the two copies add
		instead of cancelling. Mod 2 this is zero, which is why the mod-2 theory needs no signs at all; over the integers, the alternating signs are exactly what is
		needed.
	</p>
</Question>

<Intuition title="Three ways to say ∂∂ = 0">
	<ul>
		<li><em>Geometrically:</em> the edge of a region has no edge. A rim is a closed loop; the skin of a solid is a closed surface.</li>
		<li><em>By counting:</em> each face of a face lies in exactly two faces, so it is counted twice — and with orientations, once each way.</li>
		<li>
			<em>Algebraically:</em> applying the boundary matrix twice gives the zero matrix, as we are about to see. Every entry of the product is a sum of terms
			that cancel in pairs.
		</li>
	</ul>
</Intuition>

<h2 id="boundary-matrices">Boundary matrices</h2>

<p>
	Because \(\partial_k\) respects sums, it is completely determined by what it does to each single \(k\)-simplex — and that can be written down as a table of
	numbers. List the \(k\)-simplices in a fixed order (we always use dictionary order of their labels, so \([0,1]\) before \([0,2]\) before \([1,2]\)), and
	likewise the \((k-1)\)-simplices.
</p>

<Definition id="def-boundary-matrix" title="Boundary matrix">
	<p>
		The <dfn>boundary matrix</dfn> of \(\partial_k\) has one <em>row</em> for each \((k-1)\)-simplex and one <em>column</em> for each \(k\)-simplex. Column
		\(j\) lists the coefficients of the boundary of the \(j\)-th \(k\)-simplex: the entry in row \(i\) is the coefficient of the \(i\)-th \((k-1)\)-simplex in
		it — that is, \(\pm 1\) if it is a codimension-one face, with the sign from the boundary formula, and \(0\) otherwise.
	</p>
</Definition>

<Example title="A filled triangle">
	<p>
		For the filled triangle \(\set{[0,1,2]}\) with all its faces, order the edges \([0,1], [0,2], [1,2]\). The boundaries \(\partial[0,1] = 1 - 0\),
		\(\partial[0,2] = 2 - 0\) and \(\partial[1,2] = 2 - 1\) become the columns of \(\partial_1\), and \(\partial[0,1,2] = [1,2] - [0,2] + [0,1]\) becomes the
		single column of \(\partial_2\):
	</p>
	\[
	\partial_1 = \begin{pmatrix} -1 & -1 & 0 \\ 1 & 0 & -1 \\ 0 & 1 & 1 \end{pmatrix}, \qquad
	\partial_2 = \begin{pmatrix} 1 \\ -1 \\ 1 \end{pmatrix}, \qquad
	\partial_1 \partial_2 = \begin{pmatrix} -1 + 1 + 0 \\ 1 + 0 - 1 \\ 0 - 1 + 1 \end{pmatrix} = \begin{pmatrix} 0 \\ 0 \\ 0 \end{pmatrix}.
	\]
	<p>(Rows of \(\partial_1\) are the vertices \(0, 1, 2\); rows of \(\partial_2\) are the three edges in the order above.)</p>
</Example>

<p>
	A chain is now a column vector of coefficients, and applying \(\partial_k\) to it is multiplying by the matrix. Composing two linear maps corresponds to
	multiplying their matrices (<Ref to="foundations/linear-algebra" />), so the law \(\partial_{k-1} \circ \partial_k = 0\) says that the
	<strong>product of two consecutive boundary matrices is the zero matrix</strong>. Explore it on a slightly bigger complex: two filled triangles forming a
	square, plus an empty triangle on top.
</p>

<Figure num="3.2.6" title="Boundary matrices" hint="Hover or tap any entry · reduce mod 2">
	<BoundaryMatrices />
	{#snippet caption()}
		Each column of \(\partial_1\) (\(5 \times 7\)) and \(\partial_2\) (\(7 \times 2\)) is the boundary of one simplex: hovering an entry lights up the column’s
		simplex in violet, its faces in teal and the row’s simplex in gold. The product \(\partial_1\partial_2\) is the \(5 \times 2\) zero matrix; hover one of its
		entries to see the two terms that cancel.
	{/snippet}
</Figure>

<p>
	Mod 2 the same matrices are used with every \(-1\) replaced by \(1\), and the product is still zero: each entry of \(\partial_1\partial_2\) is a sum of two
	products \(1 \cdot 1\), and \(1 + 1 = 0\).
</p>

<History title="Poincaré’s tables">
	<p>
		Boundary matrices are almost as old as homology. In 1898 the Danish mathematician Poul Heegaard found a gap in Poincaré’s first paper, and Poincaré’s
		answer, the next year, was to cut his manifolds into simplices and record how they fit together in tables of \(+1\), \(-1\) and \(0\): one table for each
		dimension, saying which simplices lie on the boundary of which, and with which orientation. On the page after he defines the tables he checks that
		consecutive tables multiply to zero <Cite k="poincare1899,weibel1999" />. The name “chain complex” arrived thirty years later; the thing itself was
		already there, as a stack of matrices.
	</p>
</History>

<Question title="Reading the rows">
	<p>
		In \(\partial_2\) of Figure 3.2.6, the row of the diagonal \([1,2]\) has two nonzero entries, the rows of \([0,1], [0,2], [1,3], [2,3]\) have one each, and the
		rows of \([2,4]\) and \([3,4]\) are entirely zero. What do these three kinds of rows mean geometrically?
	</p>
	<p>
		A nonzero entry in row \(e\) means “\(e\) is a side of this triangle”. So the diagonal is shared by both triangles; the four outer edges of the square lie on
		exactly one triangle each — they form its rim; and the two slanting edges of the empty triangle on top lie on no filled triangle at all. Rows of a
		boundary matrix tell you how each face sits among the simplices above it.
	</p>
</Question>

<p>
	In the language of matrices, the cycles and boundaries of the last chapter become two of the most familiar objects of linear algebra. A \(k\)-chain \(z\) is a
	<em>cycle</em> when \(\partial_k z = 0\): the cycles are the null space, or kernel, of the matrix \(\partial_k\). A \(k\)-chain is a <em>boundary</em> when it
	equals \(\partial_{k+1} c\) for some \(c\): the boundaries are the column space, or image, of \(\partial_{k+1}\). Over \(\Z/2\) or the rational numbers we can
	measure both with ranks (rank–nullity, from <Ref to="foundations/linear-algebra" />):
</p>
\[ \dim(\text{cycles in } C_k) = n_k - \rank \partial_k, \qquad \dim(\text{boundaries in } C_k) = \rank \partial_{k+1}. \]
<p>
	For the complex of Figure 3.2.6: \(\partial_1\) has rank \(4\), so the 1-cycles form a space of dimension \(7 - 4 = 3\); \(\partial_2\) has rank \(2\), so the
	1-boundaries form a space of dimension \(2\). Three independent cycles, two independent boundaries: one hole, the empty triangle at the top. Computing ranks
	efficiently, by row reduction, is the business of <Ref to="homology/computing" />.
</p>

<h2 id="chain-complexes">Chain complexes, cycles and boundaries</h2>

<p>
	Step back and look at the shape of what we have built. There is a group of chains in each dimension, and boundary maps carrying each one into the next one
	down:
</p>
\[ \cdots \xrightarrow{\;\partial_4\;} C_3(K) \xrightarrow{\;\partial_3\;} C_2(K) \xrightarrow{\;\partial_2\;} C_1(K) \xrightarrow{\;\partial_1\;} C_0(K)
\xrightarrow{\;\partial_0\;} 0, \]
<p>
	with any two consecutive maps composing to zero. This shape turns out to be so useful, in so many places, that it has its own name — and from now on we will
	use it as a definition in its own right, forgetting where it came from.
</p>

<Definition id="def-chain-complex" title="Chain complex">
	<p>
		A <dfn>chain complex</dfn> \(C_\bullet\) is a sequence of abelian groups (or vector spaces) \(C_k\), one for each integer \(k\), together with
		homomorphisms (or linear maps) \(\partial_k\colon C_k \to C_{k-1}\), called <dfn>boundary maps</dfn> or <dfn>differentials</dfn>, such that
	</p>
	\[ \partial_{k-1} \circ \partial_k = 0 \qquad\text{for every } k. \]
</Definition>

<p>
	For a simplicial complex \(K\), the groups \(C_k(K)\) with the boundary maps form the <dfn>simplicial chain complex</dfn> of \(K\); with coefficients mod 2,
	the spaces \(C_k(K;\Z/2)\) form another. In both, \(C_k = 0\) when \(k \lt  0\) or \(k\) exceeds the dimension of \(K\). We can now give the cycles and boundaries
	of the last chapter their official names. Recall from <Ref to="foundations/groups" /> that the <Term t="kernel">kernel</Term> of a homomorphism is what it
	sends to zero, and its <Term t="image">image</Term> is what it reaches.
</p>

<Definition id="def-cycles-boundaries" title="Cycles and boundaries">
	<p>In a chain complex,</p>
	\[ Z_k = \ker \partial_k = \setb{c \in C_k}{\partial_k c = 0} \qquad\text{and}\qquad B_k = \im \partial_{k+1} = \setb{\partial_{k+1} c}{c \in C_{k+1}}. \]
	<p>
		Elements of \(Z_k\) are called <dfn>\(k\)-cycles</dfn> and elements of \(B_k\) are called <dfn>\(k\)-boundaries</dfn>. (The letter \(Z\) comes from the
		German word <em>Zyklus</em>, “cycle”.)
	</p>
</Definition>

<p>
	Both are subgroups of \(C_k\), because a kernel and an image are always subgroups. Since \(\partial_0 = 0\), every 0-chain is a cycle: \(Z_0 = C_0\). And the
	law \(\partial\partial = 0\) can now be said in a way that will matter enormously:
</p>

<Proposition id="prop-b-in-z">
	{#snippet head()}Boundaries are cycles: \(B_k \subseteq Z_k\){/snippet}
	<p>In any chain complex, \(\im\partial_{k+1} \subseteq \ker\partial_k\) for every \(k\). Conversely, this inclusion for every \(k\) says exactly that \(\partial_k \circ \partial_{k+1} = 0\).</p>
</Proposition>

<Proof>
	<p>
		An element of \(B_k\) has the form \(\partial_{k+1} c\), and \(\partial_k(\partial_{k+1} c) = 0\), so it lies in \(Z_k\). Conversely, if every
		\(\partial_{k+1} c\) lies in \(\ker\partial_k\), then \(\partial_k \partial_{k+1} c = 0\) for every \(c\), which is the statement \(\partial_k \circ
		\partial_{k+1} = 0\).
	</p>
</Proof>

<Figure num="3.2.7" title="A chain complex as a conveyor belt" hint="Step through">
	<ConveyorBelt />
	{#snippet caption()}
		Chains travel along the belt, losing a dimension at each \(\partial\). The teal region \(\bdy{B_1}\) is everything \(\partial_2\) produces; the gold
		region \(\cyc{Z_1}\) is everything \(\partial_1\) crushes to \(0\). The law \(\partial\partial = 0\) puts the teal inside the gold, and the rose gap between
		them is what homology measures.
	{/snippet}
</Figure>

<p>
	So in every dimension we have a nested pair \(B_k \subseteq Z_k \subseteq C_k\). The cycles are the candidates for holes; the boundaries are the cycles that
	are filled in; and the holes are what is left when the boundaries are “set to zero” — when two cycles that differ by a boundary are regarded as the same.
	That is a <em>quotient</em>, the first of our four recurring ideas, and it is the definition with which the next chapter begins:
</p>
\[ H_k = Z_k / B_k = \ker\partial_k / \im\partial_{k+1}. \]

<Example title="One hole or none: the hollow and the filled triangle">
	<p>
		The hollow triangle has the chain complex \(0 \to C_1 \xrightarrow{\partial_1} C_0 \to 0\) with \(C_1 \cong \Z^3\) (edges) and \(C_0 \cong \Z^3\)
		(vertices). As in the exercise below, its 1-cycles are the multiples of the loop \(z = [0,1] + [1,2] - [0,2]\), and there are no 2-simplices, so \(B_1 =
		0\). In dimension 0, \(Z_0 = C_0\), while \(B_0\) consists of the 0-chains \(a\cdot 0 + b\cdot 1 + c\cdot 2\) with \(a + b + c = 0\) (by the coefficient-sum
		argument of the exercise “Why a single point never bounds”, and every such chain is reached).
	</p>
	<p>
		Fill the triangle in. Now \(C_2 \cong \Z\), generated by \([0,1,2]\), and \(\partial_2[0,1,2] = [1,2] - [0,2] + [0,1] = z\). Nothing else changes, except
		that \(B_1\) has grown from \(0\) to all multiples of \(z\): now \(B_1 = Z_1\), and every cycle bounds. The whole difference between “one hole” and “no
		hole” is the difference between \(B_1 = 0\) and \(B_1 = Z_1\) — a difference that the quotient \(Z_1 / B_1\) will measure as \(\Z\) versus \(0\).
	</p>
</Example>

<Warning title="A cycle is not a loop, and a chain complex is not a complex">
	<p>
		From now on “cycle” means an element of \(Z_k\): any chain with zero boundary. A 1-cycle may be several loops at once, a loop traversed three times, or a
		combination like \(2a - 5b\) of loops \(a\) and \(b\). And a <em>chain complex</em> is a purely algebraic object — groups and maps with \(\partial\partial =
		0\) — while a <em>simplicial complex</em> is a shape. The word “complex” is shared for historical reasons; every simplicial complex gives a chain complex,
		but chain complexes arise in many other ways too.
	</p>
</Warning>

<Remark title="Why the abstraction pays">
	<p>
		The same structure — groups in a row, maps between them, any two in a row composing to zero — turns up again and again in this book: for cochains, where
		\(\delta\delta = 0\) (<Ref to="cohomology/cochains" />); for differential forms, where \(d\,d = 0\) (<Ref to="cohomology/differential-forms" />); and in
		homological algebra, which studies chain complexes for their own sake (<Ref to="big-picture/homological-algebra" />). Treating chain complexes as objects in
		their own right, as Walther Mayer did in 1929 <Cite k="mayer1929,weibel1999" />, means that everything we prove about them is proved for all of these
		at once.
	</p>
</Remark>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Boundaries mod 2">
	<p>
		Working mod 2, compute \(\partial c\) for \(c = [0,1,2] + [0,2,3] + [0,3,4]\) (three triangles in a fan around the vertex \(0\)), and then compute
		\(\partial\partial c\).
	</p>
	{#snippet solution()}
		<p>Adding the three boundaries, the edges \([0,2]\) and \([0,3]\) each occur twice and cancel:</p>
		\[ \partial c = [0,1] + [1,2] + [2,3] + [3,4] + [0,4]. \]
		<p>
			That is the rim of the fan, a closed loop \(0 \to 1 \to 2 \to 3 \to 4 \to 0\). Its boundary lists each vertex once per edge touching it: every vertex is
			touched by exactly two rim edges, so \(\partial\partial c = 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Signed boundaries of 1-chains">
	<p>
		Compute \(\partial[2,5]\) and \(\partial\big(3[0,1] - 2[1,2]\big)\). In each case, add up the coefficients of the answer. What do you notice?
	</p>
	{#snippet solution()}
		<p>
			\(\partial[2,5] = 5 - 2\). And \(\partial(3[0,1] - 2[1,2]) = 3(1 - 0) - 2(2 - 1) = -3\cdot 0 + 5\cdot 1 - 2\cdot 2\). The coefficients add up to
			\(1 - 1 = 0\) and \(-3 + 5 - 2 = 0\). This always happens: the boundary of each edge, head minus tail, has coefficient sum \(0\), and sums of zeros are
			zero. (The last exercise uses this.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Reordering a triangle">
	<p>
		Use the boundary formula directly on the ordered simplex \([1,0,2]\) — leave out the vertex in position \(0\), then position \(1\), then position \(2\),
		with signs \(+, -, +\) — and rewrite every edge in increasing order. Check that the result is \(-\partial[0,1,2]\), as it must be if \([1,0,2] = -[0,1,2]\).
	</p>
	{#snippet solution()}
		<p>The formula gives</p>
		\[ \partial[1,0,2] = [0,2] - [1,2] + [1,0] = [0,2] - [1,2] - [0,1] = -\big([1,2] - [0,2] + [0,1]\big) = -\partial[0,1,2]. \]
	{/snippet}
</Exercise>

<Exercise level={2} title="∂∂ of a tetrahedron, term by term">
	<p>
		Starting from \(\partial[0,1,2,3] = [1,2,3] - [0,2,3] + [0,1,3] - [0,1,2]\), compute \(\partial\partial[0,1,2,3]\) and watch all twelve terms cancel. Which two
		faces contribute the two copies of the edge \([0,1]\)?
	</p>
	{#snippet solution()}
		<p>Applying \(\partial\) to each face:</p>
		\[
		\begin{aligned}
		\partial[1,2,3] &= [2,3] - [1,3] + [1,2],\\
		-\partial[0,2,3] &= -[2,3] + [0,3] - [0,2],\\
		\partial[0,1,3] &= [1,3] - [0,3] + [0,1],\\
		-\partial[0,1,2] &= -[1,2] + [0,2] - [0,1].
		\end{aligned}
		\]
		<p>
			Every edge appears once with \(+\) and once with \(-\), so the total is \(0\). The two copies of \([0,1]\) come from \([0,1,3]\) (with sign \(+\)) and from
			\(-[0,1,2]\) (with sign \(-\)) — the two faces of the tetrahedron that contain the edge \([0,1]\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The hollow tetrahedron">
	<p>
		The hollow tetrahedron is the four triangles \([0,1,2], [0,1,3], [0,2,3], [1,2,3]\) and their faces, but not the solid inside. Find all integer 2-chains
		\(x = p[0,1,2] + q[0,1,3] + r[0,2,3] + s[1,2,3]\) with \(\partial x = 0\). What are the 2-cycles mod 2? Are any of them boundaries?
	</p>
	{#snippet hint()}
		<p>Each edge lies in exactly two of the triangles. Look at the coefficient of \([0,1]\) in \(\partial x\), then of \([0,2]\), and so on.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			The edge \([0,1]\) lies in \([0,1,2]\) (where \(\partial\) gives it coefficient \(+1\)) and in \([0,1,3]\) (also \(+1\)), so its coefficient in
			\(\partial x\) is \(p + q\); hence \(q = -p\). Similarly \([0,2]\) gives \(-p + r = 0\), and \([1,2]\) gives \(p + s = 0\). The remaining three edges then
			cancel automatically. So \(x = p\big([0,1,2] - [0,1,3] + [0,2,3] - [1,2,3]\big)\) for some integer \(p\), and every such chain is indeed a cycle: it is
			\(-p\,\partial[0,1,2,3]\). Mod 2 the cycles are \(0\) and the set of all four triangles. None of the nonzero cycles is a boundary, because the hollow
			tetrahedron has no 3-simplices at all: \(B_2 = 0\). This is the void of the sphere, now as algebra.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Boundary matrices of a hollow triangle">
	<p>
		The hollow triangle has vertices \(0, 1, 2\) and edges \([0,1], [0,2], [1,2]\), but no 2-simplex. Write down \(\partial_1\), find all integer 1-cycles,
		and decide which of them are boundaries.
	</p>
	{#snippet solution()}
		<p>
			\(\partial_1\) is the same \(3 \times 3\) matrix as for the filled triangle above. A 1-chain \(x[0,1] + y[0,2] + z[1,2]\) has boundary \((-x - y)\cdot 0 +
			(x - z)\cdot 1 + (y + z)\cdot 2\), which vanishes exactly when \(z = x\) and \(y = -x\). So \(Z_1\) consists of the multiples of \([0,1] - [0,2] + [1,2]\),
			the loop around the triangle. There are no 2-simplices, so \(B_1 = 0\): no nonzero cycle is a boundary. Filling the triangle in adds
			\(\partial[0,1,2] = [0,1] - [0,2] + [1,2]\) as a boundary, and then every cycle bounds.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Why a single point never bounds">
	<p>
		(a) Show that for every integer 1-chain \(c\), the coefficients of \(\partial c\) add up to \(0\). Deduce that a single vertex \(v\) is never a boundary, while
		\(v - w\) is a boundary whenever an edge path joins \(w\) to \(v\). (b) Mod 2, show that a 0-boundary contains an even number of vertices from each
		connected piece of \(K\). How does this match the last exercise of <Ref to="homology/cycles-and-boundaries" />?
	</p>
	{#snippet solution()}
		<p>
			(a) The coefficient sum is additive, and for a single edge \(\partial[v_0,v_1] = v_1 - v_0\) has sum \(1 - 1 = 0\). So every boundary has coefficient sum
			\(0\), while \(v\) has sum \(1\): it is not a boundary. If \(w = u_0, u_1, \dots, u_m = v\) is an edge path, the chain made of its edges, each with sign
			\(\pm 1\) to point forwards, has boundary \(v - w\) (the middle vertices telescope away). (b) The same argument applied within one piece shows that the
			coefficients of \(\partial c\) at the vertices of that piece add up to \(0\), which mod 2 means the piece contains an even number of vertices of
			\(\partial c\). This is exactly the parity count that showed \(b_0\) is the number of pieces.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="The boundary formula respects orientation">
	<p>
		Show that swapping two <em>neighbouring</em> vertices \(v_m\) and \(v_{m+1}\) in \([v_0, \dots, v_k]\) changes the boundary formula’s output by a factor
		\(-1\) (after every face is rewritten in increasing order). Since every reordering is a sequence of neighbouring swaps, conclude that \(\partial\) of a
		reordered simplex is the sign of the reordering times \(\partial\) of the original.
	</p>
	{#snippet hint()}
		<p>Compare the terms that leave out some vertex other than \(v_m, v_{m+1}\) with the two terms that leave out \(v_m\) or \(v_{m+1}\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Write \(\sigma'\) for the swapped list. A term that leaves out \(v_i\) with \(i \neq m, m+1\) has the same sign in both formulas (\(v_i\) is in the same
			position), but the face it produces in \(\sigma'\) still has \(v_m\) and \(v_{m+1}\) swapped, so it is \(-1\) times the corresponding face of \(\sigma\).
			The term of \(\sigma'\) that leaves out \(v_{m+1}\) (now in position \(m\)) has sign \((-1)^m\) and face equal to the face of \(\sigma\) that leaves out
			\(v_{m+1}\), which there had sign \((-1)^{m+1}\); likewise the term of \(\sigma'\) leaving out \(v_m\) (now in position \(m+1\)) has sign \((-1)^{m+1}\) where
			\(\sigma\) had \((-1)^m\). Every term has flipped sign, so \(\partial\sigma' = -\partial\sigma\). A reordering made of \(s\) neighbouring swaps therefore
			multiplies the boundary by \((-1)^s\), the sign of the reordering.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>A <strong>\(k\)-chain</strong> is an inventory of \(k\)-simplices: mod 2 a set of them, added by symmetric difference; over \(\Z\) a formal sum \(\sum a_\sigma \sigma\) of oriented simplices. They form \(C_k(K;\Z/2) \cong (\Z/2)^{n_k}\) and \(C_k(K) \cong \Z^{n_k}\).</li>
		<li>The <strong>boundary</strong> of a simplex is the sum of its codimension-one faces — mod 2 plainly, over \(\Z\) with alternating signs: \(\partial[v_0, \dots, v_k] = \sum_i (-1)^i [v_0, \dots, \hat v_i, \dots, v_k]\). It extends to chains by linearity.</li>
		<li>For edges, \(\partial\) is “head minus tail”; for 1-chains, \(\partial\) finds the loose ends; for 2-chains, the rim.</li>
		<li><strong>\(\partial \circ \partial = 0\)</strong>: each face of a face is counted twice — mod 2 that cancels, and with signs the two copies have opposite signs. So every boundary is a cycle.</li>
		<li>Reordering a simplex multiplies it, and its boundary, by the sign of the reordering. Coherently oriented neighbours cancel along shared edges.</li>
		<li>Each \(\partial_k\) is a <strong>boundary matrix</strong> (rows: \((k-1)\)-simplices; columns: \(k\)-simplices), and consecutive boundary matrices multiply to zero.</li>
		<li>A <strong>chain complex</strong> is a sequence of groups and maps with \(\partial\partial = 0\). Its cycles \(Z_k = \ker\partial_k\) contain its boundaries \(B_k = \im\partial_{k+1}\); the gap between them is homology.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Algebraic Topology, §2.1 “Simplicial and Singular Homology”',
			author: 'Allen Hatcher (Cambridge, 2002)',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'Chains, the boundary formula and Lemma 2.1 (∂∂ = 0) with the picture of coherently oriented faces. Read after this chapter; graduate level but very clear.',
			kind: 'book',
			free: true
		},
		{
			title: 'Computing Homology',
			author: 'Jeremy Kun (2013)',
			url: 'https://jeremykun.com/2013/04/10/computing-homology/',
			note: 'Boundary matrices and row reduction, with Python — a programmer’s companion to this chapter and the next two.',
			kind: 'web',
			free: true
		},
		{
			title: 'Homology Theory — A Primer',
			author: 'Jeremy Kun (2013)',
			url: 'https://jeremykun.com/2013/04/03/homology-theory-a-primer/',
			note: 'Chains, boundaries and the boundary of a boundary in a friendly informal style; the source of this chapter’s epigraph.',
			kind: 'web',
			free: true
		},
		{
			title: 'Graphs, Surfaces and Homology (3rd edition)',
			author: 'Peter Giblin (Cambridge, 2010)',
			note: 'Chains and boundaries for graphs and surfaces, with both mod 2 and integer coefficients, at a gentle undergraduate pace.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology: Chains, Cycles, and Homology Classes',
			author: 'André Henriques (Oxford Mathematics, YouTube, 2025)',
			url: 'https://www.youtube.com/watch?v=1f9D7cZSm74',
			note: 'An hour of a real fourth-year lecture at the blackboard: homology at an intuitive level first, then slowly formalised into chains, cycles and homology classes, with many examples drawn on surfaces.',
			kind: 'video',
			free: true
		},
		{
			title: 'Mod Two Homology and Cohomology',
			author: 'Jean-Claude Hausmann (Springer Universitext, 2014)',
			url: 'https://www.unige.ch/math/folks/hausmann/hausmannBook.pdf',
			note: 'A whole book that never needs a sign: the case for doing homology mod 2 first. Graduate level; its introduction contains the Alexander quotation above. The author keeps a corrected 2022 version free on his web page.',
			kind: 'book',
			free: true
		},
		{
			title: 'Computational Topology: An Introduction',
			author: 'Herbert Edelsbrunner and John Harer (AMS, 2010)',
			note: 'Chain complexes and boundary matrices mod 2 as the engine of algorithms, leading to persistent homology.',
			kind: 'book'
		},
		{
			title: 'Hodge Laplacians on Graphs',
			author: 'Lek-Heng Lim (SIAM Review, 2020)',
			url: 'https://arxiv.org/abs/1507.05379',
			note: 'Shows how much of (co)homology is “the linear algebra of matrices satisfying AB = 0” — boundary matrices on graphs and beyond.',
			kind: 'paper',
			free: true
		}
	]}
/>
