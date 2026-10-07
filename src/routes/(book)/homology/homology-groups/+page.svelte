<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Lemma from '$lib/components/prose/Lemma.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Notation from '$lib/components/prose/Notation.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import ChainComplexDiagram from '$lib/figures/homology/homology-groups/ChainComplexDiagram.svelte';
	import HomologousCycles from '$lib/figures/homology/homology-groups/HomologousCycles.svelte';
	import ComputationPlayer from '$lib/figures/homology/homology-groups/ComputationPlayer.svelte';
	import TorusGenerators3D from '$lib/figures/homology/homology-groups/TorusGenerators3D.svelte';
	import TorusSixCells from '$lib/figures/homology/homology-groups/TorusSixCells.svelte';
	import ComponentCounter from '$lib/figures/homology/homology-groups/ComponentCounter.svelte';
	import EulerPoincare from '$lib/figures/homology/homology-groups/EulerPoincare.svelte';
	import TorusKleinPair from '$lib/figures/homology/homology-groups/TorusKleinPair.svelte';
	import Gallery from '$lib/figures/homology/homology-groups/Gallery.svelte';
	import FlatComplex from '$lib/figures/homology/homology-groups/FlatComplex.svelte';
	import { hollowTriangle, filledTriangle, hollowTetrahedron, torusGrid, kleinGrid } from '$lib/figures/homology/homology-groups/complexes';

	const tri = hollowTriangle();
	const disk = filledTriangle();
	const tet = hollowTetrahedron();
	const torus = torusGrid();
	const klein = kleinGrid();
	const lab = (s: number[]) => `[${s.join(',')}]`;
	const d1tri = tri.K.boundaryMatrix(1);
	const d2disk = disk.K.boundaryMatrix(2);
	const d2tet = tet.K.boundaryMatrix(2);
	const [ta, tb] = torus.cycles!.map((c) => c.chain);
	const [ka, kb] = klein.cycles!.map((c) => c.chain);
</script>

<Epigraph author="Pavel Alexandroff and Heinz Hopf" source="Topologie I (1935), preface; translated from the German">The tendency toward a strong algebraisation of topology on a group-theoretic basis, which we follow in our presentation, goes back entirely to Emmy Noether.</Epigraph>

<p class="lead">Draw a loop once around the hole of a washer. Draw another a little further out, then a wiggly one, then one that goes round twice. Four loops, and still only one hole. The first three are the drinking-straw puzzle of <Ref to="homology/cycles-and-boundaries" /> again, and that chapter settled it with a word: they are <em>homologous</em>, because any two of them together are the edge of something, the strip of washer between them. The fourth is a new wrinkle. It is not the same loop as the first, yet it is no new hole either: it is the old hole, counted twice.</p>

<p class="lead">This chapter turns both observations into arithmetic. The machine is already assembled: <Ref to="homology/chains" /> gave us chains, the boundary operator \(\partial\), and the one law that makes everything work, \(\partial\partial = 0\). What we have not yet done is turn the crank. The result is the <em>homology group</em>, and its definition fits on one line: \(H_k = Z_k / B_k\), “cycles modulo boundaries”.</p>

<p>Once that line makes sense in pictures, the rest is payoff. The holes of a space become the elements of a group, and counting them, twice-round loops and all, becomes computing the ranks of matrices. Seven test spaces, from a single point to a torus, give up their homology to a few lines of arithmetic. The Euler characteristic of <Ref to="topology/euler-characteristic" /> turns out to have been homology in disguise. And the last surface we try sets a puzzle that only the integers can solve.</p>

<Ahead>
	<p>This is the central definition of the book, and every later chapter leans on it. In <Ref to="homology/invariance" /> continuous maps push homology classes around, which proves the fixed-point theorems. In <Ref to="homology/exact-sequences" /> we compute homology by cutting spaces into pieces. Persistent homology (<Ref to="homology/persistence" />) watches classes being born and dying as data grows. And all of cohomology, Part IV, is this same construction with the arrows reversed. If you read one chapter of the book slowly, make it this one.</p>
</Ahead>

<h2 id="cycles-and-boundaries">Two subgroups of chains</h2>

<p>First, a quick reminder of the setting. Fix a simplicial complex \(K\) (<Ref to="topology/simplicial-complexes" />), with its vertices labelled by whole numbers. Its \(k\)-chains, the elements of the <Term t="chain-group">chain group</Term> \(C_k(K)\), are formal sums of oriented \(k\)-simplices with integer coefficients, such as \(3[0,1] - [1,2]\). Each simplex is written with its vertices in increasing order, and that order is its orientation. The boundary operator</p>

\[ \partial_k[v_0, v_1, \dots, v_k] \;=\; \sum_{i=0}^{k} (-1)^i\, [v_0, \dots, \hat v_i, \dots, v_k] \]

<p>(the hat means “leave this vertex out”) lowers the dimension by one, and the chain groups and boundary maps line up into the <Term t="chain-complex">chain complex</Term> of <Ref to="homology/chains" />,</p>

\[ \cdots \xrightarrow{\;\partial_3\;} C_2(K) \xrightarrow{\;\partial_2\;} C_1(K) \xrightarrow{\;\partial_1\;} C_0(K) \xrightarrow{\;\partial_0\;} 0, \]

<p>with \(\partial_0 = 0\) (a vertex has no boundary) and \(\partial_{k-1} \circ \partial_k = 0\) at every step. Inside each chain group sit the two collections this whole chapter is about. You have met them twice already, in pictures in <Ref to="homology/cycles-and-boundaries" /> and in symbols in <Ref to="homology/chains" />; here they are once more, for reference.</p>

<Definition id="def-cycles-boundaries">
	{#snippet head()}Cycles \(Z_k\) and boundaries \(B_k\){/snippet}
	<p>Let \(K\) be a simplicial complex and \(k \ge 0\).</p>
	<ul>
		<li>A <dfn>\(k\)-cycle</dfn> is a \(k\)-chain whose boundary is zero. The \(k\)-cycles form the <dfn>cycle group</dfn> \[ Z_k(K) = \ker \partial_k = \setb{z \in C_k(K)}{\partial_k z = 0}. \]</li>
		<li>A <dfn>\(k\)-boundary</dfn> is a \(k\)-chain that is the boundary of some \((k+1)\)-chain. The \(k\)-boundaries form the <dfn>boundary group</dfn> \[ B_k(K) = \im \partial_{k+1} = \setb{\partial_{k+1} c}{c \in C_{k+1}(K)}. \]</li>
	</ul>
</Definition>

<p>Read \(Z_k\) as “zee \(k\)” (from the German <em>Zyklus</em>) and \(B_k\) as “bee \(k\)”. Mind the shift in the indices: cycles in dimension \(k\) are tested by \(\partial_k\), the map going <em>out</em> of \(C_k\), while boundaries in dimension \(k\) are produced by \(\partial_{k+1}\), the map coming <em>in</em> from one dimension up. Both are subgroups of \(C_k\), since kernels and images of homomorphisms always are (<Ref to="foundations/groups" />). At the two ends of the complex they are extreme: every 0-chain is a cycle (\(Z_0 = C_0\), since \(\partial_0 = 0\)), and in the top dimension \(n\) of \(K\) nothing is a boundary (\(B_n = 0\), since there are no \((n+1)\)-simplices to fill anything).</p>

<Example title="The hollow and the filled triangle">
	<p>Our running example is the walk \(0 \to 1 \to 2 \to 0\) around a triangle. As a chain it is \(z = [0,1] + [1,2] - [0,2]\), with a minus sign because the edge \([0,2]\) is walked from \(2\) back to \(0\), against its orientation. Its boundary is</p>
	\[ \partial z = ([1]-[0]) + ([2]-[1]) - ([2]-[0]) = 0, \]
	<p>so \(z\) is a 1-cycle. On the hollow triangle there are no triangles to fill it, so \(B_1 = \set{0}\) and \(z\) is a cycle that is not a boundary: the hole. Fill the triangle in, and \(z = \partial[0,1,2]\) becomes a boundary: no hole.</p>
</Example>

<p>Finally, the containment that <Ref to="homology/chains" /> called the engine of the subject.</p>

<Lemma id="lem-boundaries-are-cycles">
	{#snippet head()}Every boundary is a cycle: \(B_k \subseteq Z_k\){/snippet}
	<p>For every \(k\), each \(k\)-boundary is a \(k\)-cycle.</p>
</Lemma>

<Proof>
	<p>Let \(b \in B_k\). By definition there is a \((k+1)\)-chain \(c\) with \(b = \partial_{k+1} c\). Then \(\partial_k b = \partial_k \partial_{k+1} c = 0\), because the boundary of a boundary is zero. So \(b\) has zero boundary: \(b \in Z_k\).</p>
</Proof>

<p>The converse is false, and the hollow triangle’s \(z\) is the witness: a cycle that is the rim of nothing. That gap between “cycle” and “boundary” is what homology measures. Figure 3.3.1 draws the whole situation at once.</p>

<Figure num="3.3.1" title="The anatomy of a chain complex">
	<ChainComplexDiagram />
	{#snippet caption()}Each chain group \(C_k\) (violet) contains the cycles \(Z_k\) (gold, dashed), which in turn contain the boundaries \(B_k\) (teal). The map \(\partial_{k+1}\) sends all of \(C_{k+1}\) into \(B_k\) (the teal funnel) and crushes the cycles \(Z_{k+1}\) to \(0\) (the gold arrows). The rose ring between \(Z_k\) and \(B_k\), cycles that are not boundaries, is what homology measures.{/snippet}
</Figure>

<h2 id="cycles-modulo-boundaries">Cycles modulo boundaries</h2>

<p>We want to measure the cycles that are not boundaries. The obvious first attempt is to collect them into a set, \(Z_k\) with \(B_k\) removed. That attempt fails in three different ways, and each failure teaches us something.</p>

<ol>
	<li><strong>It is not a group.</strong> It does not contain \(0\). Worse, on an annulus (a ring-shaped region) the inner rim and the outer rim, run in opposite directions, are both cycles that bound nothing on their own; but their sum is the full boundary of the annulus, which bounds. Adding two “holes” produced a non-hole.</li>
	<li><strong>It is far too big.</strong> On the hollow triangle, \(z, 2z, -z, 3z, \dots\) are all cycles that are not boundaries: infinitely many, although there is only one hole.</li>
	<li><strong>It over-counts.</strong> On the straw of <Ref to="homology/cycles-and-boundaries" />, the circles at the two ends are different cycles. Neither bounds, yet both go around the same hole, and the tube between them says so.</li>
</ol>

<p>All three failures have the same cure, the one <Ref to="homology/cycles-and-boundaries" /> found with pictures: two loops are the same hole when together they are the edge of something. In symbols, we <em>ignore</em> boundaries, since they enclose nothing, and regard two cycles as <em>the same</em> whenever they differ by a boundary. You have seen this move before. On a clock, 13 o’clock and 1 o’clock are the same hour because they differ by 12: clock arithmetic ignores multiples of 12 (<Ref to="foundations/equivalence" />). In <Ref to="foundations/abelian-groups" /> the same idea became the <Term t="quotient-group">quotient group</Term> \(G/H\): the elements of \(G\), where two elements count as equal when their difference lies in the subgroup \(H\). Homology is this construction with \(G = Z_k\) and \(H = B_k\), and it is the decisive appearance of the first of the book’s four recurring ideas, <strong>quotients</strong>.</p>

<Definition id="def-homology">
	{#snippet head()}The homology group \(H_k(K)\){/snippet}
	<p>Let \(K\) be a simplicial complex and \(k \ge 0\). The <dfn>\(k\)-th homology group</dfn> of \(K\) is the quotient group</p>
	\[ H_k(K) \;=\; \frac{Z_k(K)}{B_k(K)} \;=\; \frac{\ker \partial_k}{\im \partial_{k+1}}. \]
	<p>Its elements are the cosets \([z] = z + B_k\) of \(k\)-cycles \(z\), called <dfn>homology classes</dfn>. Two cycles \(z\) and \(z'\) are <dfn>homologous</dfn>, written \(z \sim z'\), if their difference is a boundary: \(z - z' = \partial c\) for some \((k+1)\)-chain \(c\). Homologous cycles have the same class: \([z] = [z']\).</p>
</Definition>

<p>Read \(H_k(K)\) aloud as “H \(k\) of \(K\)”, and \(Z_k/B_k\) as “Z \(k\) modulo B \(k\)”. Over the integers, “together they bound” needs a direction, and the minus sign supplies it: \(z - z'\) is \(z\) run forwards and \(z'\) run backwards. Take the annulus, with its outer rim \(z\) and inner rim \(z'\) both running counterclockwise. Reverse the inner one, and the pair is exactly the rim of the ring between them: \(z - z' = \partial(\text{ring})\). So the two rims are homologous, and \([z] = [z']\). One hole, seen twice.</p>

<KeyIdea>
	<p>Two \(k\)-cycles are the same element of \(H_k\) when, with one of them reversed, together they are the rim of something: \(z - z' = \partial c\). A cycle that is a rim all by itself is the zero class. Each non-zero class is a hole, or a combination of holes, and it is never a single cycle but a whole family of them, any two of which cobound.</p>
</KeyIdea>

<Warning title="Cycles first, then divide">
	<p>A tempting shortcut is to divide all the chains by the boundaries, \(C_k/B_k\). Try it on the filled triangle. There \(C_1 \cong \Z^3\) and \(B_1 = \Z z\), so \(C_1/B_1 \cong \Z^2\): two “holes” in a disk. The impostors are open paths such as the single edge \([0,1]\). It is not zero modulo \(B_1\), but it is not a cycle either, so it was never a candidate for a hole. Homology keeps only the cycles first, and then divides. The slip is natural enough that a popular video on the subject makes it, twelve minutes in, and carries the correction in its description: “You take n-cycles/(n+1)-boundaries not n-chains” <Cite k="aleph0-2025" />.</p>
</Warning>

<p>The group operation is inherited from chains: \([z] + [z'] = [z + z']\). This is <em>well defined</em> (<Ref to="prelude/reading-math" />): if we replace \(z\) by a homologous cycle \(z + \partial c\) and \(z'\) by \(z' + \partial c'\), the sum changes by \(\partial(c + c')\), another boundary, so its class does not change. That is precisely the reason \(B_k\) had to be a subgroup, and the reason the general construction of quotient groups in <Ref to="foundations/abelian-groups" /> works. The zero element is the class \([0] = B_k\) of all boundaries, and the negative of \([z]\) is \([-z]\), the same cycle run backwards.</p>

<p>Figure 3.3.2 lets you feel the definition with your hands. The gold cycle runs around a triangulated annulus. Clicking a triangle \(t\) <em>pushes</em> the cycle across it: the figure adds \(+\partial t\) or \(-\partial t\), whichever cancels the edges the cycle shares with \(t\). The edges you crossed disappear, and the triangle’s other edges take their place. This is the elementary move of homology. If a filled triangle has rim \(a + b + c\), then \(a + b\) and \(-c\) differ by that rim, so \(a + b \sim -c\): two sides of a filled triangle can always be swapped for the third side, walked the other way. The cycle changes shape, but its class does not.</p>

<Figure num="3.3.2" title="Cycles modulo boundaries" hint="Click triangles · switch spaces">
	<HomologousCycles />
	{#snippet caption()}Pushing a cycle \(z\) across triangles. After any number of pushes the new cycle is \(z' = z + \partial c\), where the violet 2-chain \(c\) records every triangle you crossed (darker means a larger coefficient: crossed more often in the same direction). Since \(z' - z = \partial c\) is a boundary, \([z'] = [z]\), and the badge never changes. On the annulus, start from “Inner − outer” to meet two loops that together bound. On the triangle with a hole, shrink-wrap the rim \(\rho\) onto the three-edge loop \(\eta\) around the hole; when you arrive, \(c\) is all fifteen triangles, and \(\rho - \eta\) is the boundary of the whole region.{/snippet}
</Figure>

<p>Play with it for a minute. Three things stand out. However wildly you push, the badge stays the same, because every push adds a boundary. The violet region \(c\) is the surface swept out between the old cycle and the new one: \(z' - z = \partial c\) says that \(z\) and \(z'\) together form the rim of \(c\). And no amount of pushing makes “once around” zero. To collapse the loop you would have to push it across the hole, and the hole contains no triangles.</p>

<p>Now switch to the triangle with a hole, a picture borrowed from Daniel Tubbenhauer’s short video lecture <em>What is…homology intuitively?</em> <Cite k="tubbenhauer2021" />. Start from the rim, twelve edges long, and shrink-wrap it onto the hole one push at a time, until it is a loop of three edges. It takes at least fifteen pushes, one for each triangle: when you arrive, the violet chain covers every triangle exactly once, so rim minus hug is the boundary of everything in between. Then try to make the little loop vanish. You cannot, and the hole is the reason.</p>

<p>So there are three ways to hold a homology class in your head, and each is useful at different moments.</p>

<ul>
	<li><strong>Algebra:</strong> a coset \(z + B_k\), one cycle together with everything obtained from it by adding boundaries.</li>
	<li><strong>Geometry:</strong> homologous cycles <em>cobound</em>. If \(z' - z = \partial c\), the chain \(c\) fills the space between them, like the tube of the straw between its two end circles.</li>
	<li><strong>Bookkeeping:</strong> boundaries are noise. Anything that is the rim of a filled-in region becomes invisible, and the class is what survives.</li>
</ul>

<Warning title="Homologous is not the same as deformable">
	<p>It is tempting to think of homologous cycles as “loops that can be slid into each other”. Sliding is one way to be homologous, but not the only one. Homology lets cycles split and merge: the inner rim minus the outer rim of an annulus is homologous to zero, although it consists of two separate loops that cannot shrink to nothing. And a single loop can bound without being shrinkable: the rim of a torus with a disk cut out (the commutator loop \(aba^{-1}b^{-1}\) of <Ref to="topology/gluing" />) bounds the whole punctured torus, yet it cannot be contracted within it. Homology is coarser than homotopy (<Ref to="topology/homotopy" />): to shrink, a loop must be filled by a disk, while to bound, it may be filled by any 2-chain, such as a surface with a handle. That coarseness is the price of being computable. <Ref to="homology/invariance" hash="hurewicz">Section 3.5</Ref> works out exactly what it costs.</p>
</Warning>

<Notation title="Coefficients">
	<p>Everything above works word for word if the coefficients are taken in \(\Z/2\) (also written \(\F_2\)) instead of \(\Z\). Then a chain is a set of simplices and \(\partial\) keeps the faces that appear an odd number of times (<Ref to="homology/chains" />). It works equally well with rational coefficients \(\Q\). We write \(H_k(K;\Z/2)\), \(H_k(K;\Q)\), and in general \(H_k(K;G)\) for “homology with coefficients in \(G\)”. Plain \(H_k(K)\) always means integer coefficients. Over \(\Z/2\) and \(\Q\) the chain groups are vector spaces and the quotient is a quotient vector space (<Ref to="foundations/linear-algebra" />), which, as we are about to see, makes counting easy.</p>
</Notation>

<Question>
	<p>On the hollow triangle, is \(2z\) homologous to \(z\)? What about on the filled triangle? (On the hollow triangle, \(2z - z = z\) is not a boundary, so \([2z] = 2[z] \ne [z]\). On the filled triangle every 1-cycle is a boundary, so \([2z] = [z] = 0\).)</p>
</Question>

<History title="Numbers become groups">
	<p>For thirty years after Poincaré’s <em>Analysis Situs</em> <Cite k="poincare1895" />, topologists computed Betti numbers and “torsion coefficients” as numbers read off from matrices. The step to groups was taken in the mid-1920s, by Emmy Noether in Göttingen and, independently, by Leopold Vietoris in Vienna, who defined homology groups in his lectures of 1926–27 and in print <Cite k="vietoris1927" />. Noether never wrote a paper about it. Her ideas spread by conversation: on the “algebraic-topological” walks she led, which Pavel Alexandroff remembered fondly, and from the audience of the lectures that Alexandroff and Heinz Hopf, her young colleagues, gave in Göttingen. Friedrich Hirzebruch summed it up: “She published half a sentence and has an everlasting effect” <Cite k="hirzebruch1999" />. Not everyone was convinced at once. In 1930 Solomon Lefschetz wrote that translating everything into the theory of groups “is of course a mere question of a different terminology” <Cite k="lefschetz1930" loc="p. 29" />. Five years later, closing the first international conference on topology in Moscow, he stressed, in the words of Noether’s biographer Auguste Dick, “the great value that Emmy Noether’s ideas had for the development of modern topology”.</p>
</History>

<h2 id="betti-numbers">Betti numbers and the rank formula</h2>

<p>Now back to the washer’s twice-round loop. How many holes does a space have? Not the number of classes: even the hollow triangle has infinitely many, \([z], 2[z], -[z], \dots\), all made from the single class \([z]\). \(2[z]\) is the old hole walked twice, \(-[z]\) the old hole walked backwards. On a figure eight, the loop that goes around both lobes is not a third hole either: it is the sum of the loops around each, as <Ref to="homology/cycles-and-boundaries" /> found for the diagonal loop on the torus. Classes add up, and so the honest count of holes is the number of classes you need to build all the others: the size of a basis. For every space in this chapter, each homology group will turn out to be a <Term t="free-abelian-group">free abelian group</Term> \(\Z^b\): a lattice of \(b\) independent directions (<Ref to="foundations/abelian-groups" />), one for each independent hole.</p>

<Definition id="def-betti">
	{#snippet head()}Betti numbers \(b_k\){/snippet}
	<p>The <dfn>\(k\)-th Betti number</dfn> of \(K\) is \(b_k(K) = \rank H_k(K)\), the number of independent copies of \(\Z\) in \(H_k(K)\). With coefficients in a field \(F\) (such as \(\Q\) or \(\Z/2\)), \(b_k(K;F) = \dim_F H_k(K;F)\).</p>
</Definition>

<p>In data science the Betti numbers are often written \(\beta_k\). Roughly: \(b_0\) counts pieces, \(b_1\) counts independent loops that bound nothing, \(b_2\) counts enclosed cavities, and so on up the dimensions.</p>

<Warning title="Groups are not always lattices">
	<p>In general \(H_k(K) \cong \Z^{b_k} \oplus T\), where \(T\) is a finite group called the <em>torsion</em> (recall the classification of finitely generated abelian groups in <Ref to="foundations/abelian-groups" />). Torsion never appears in this chapter’s examples, but it is the star of the next one, where it is exactly what tells a torus from a Klein bottle. The rank \(b_k\) ignores \(T\).</p>
</Warning>

<p>Over a field, computing Betti numbers needs nothing but the ranks of the boundary matrices. Write \(n_k\) for the number of \(k\)-simplices of \(K\).</p>

<Theorem id="thm-rank-formula" label="Theorem (rank formula)">
	<p>With coefficients in a field \(F\),</p>
	\[ b_k \;=\; n_k \;-\; \rank \partial_k \;-\; \rank \partial_{k+1}, \]
	<p>where the ranks are computed over \(F\), with the conventions \(\partial_0 = 0\) and \(\partial_{k} = 0\) above the top dimension. With ranks computed over \(\Q\), the same formula gives the rank of the integer homology group \(H_k(K)\).</p>
</Theorem>

<Proof>
	<p>Over a field, \(C_k\) is a vector space whose basis is the set of \(k\)-simplices, so \(\dim C_k = n_k\). The rank–nullity theorem of <Ref to="foundations/linear-algebra" />, applied to \(\partial_k\colon C_k \to C_{k-1}\), says \(\dim \ker\partial_k + \rank \partial_k = n_k\); hence \(\dim Z_k = n_k - \rank\partial_k\). By definition \(\dim B_k = \dim \im \partial_{k+1} = \rank \partial_{k+1}\). Finally, the dimension of a quotient space is the difference of the dimensions: \(\dim (Z_k/B_k) = \dim Z_k - \dim B_k\). Putting the three facts together gives the formula. (The statement about \(\Z\) is proved in <Ref to="homology/computing" />.)</p>
</Proof>

<Intuition title="A budget">
	<p>Read the formula as a budget. You have \(n_k\) independent directions in \(C_k\), one per \(k\)-simplex. Exactly \(\rank\partial_k\) of them are “spent going down”: they have a non-zero boundary, so they are not cycles. Of the \(\dim Z_k\) directions that remain, exactly \(\rank \partial_{k+1}\) are “filled in from above”: they are boundaries. What is left over, \(b_k\) directions, are the holes.</p>
</Intuition>

<p>The formula is older than the groups. Poincaré wrote it down in 1899 in terms of the ranks of his incidence matrices, which are our boundary matrices; his Betti number \(P_k\) is our \(b_k + 1\) <Cite k="poincare1899" loc="p. 299" />.</p>

<p>For the hollow triangle, \(n_0 = 3\), \(n_1 = 3\), and the boundary matrix \(\partial_1\) has rank \(2\), so \(b_0 = 3 - 0 - 2 = 1\) and \(b_1 = 3 - 2 - 0 = 1\). Fill the triangle in and \(\partial_2\) has rank \(1\), so \(b_1 = 3 - 2 - 1 = 0\) and \(b_2 = 1 - 1 - 0 = 0\). Computing Betti numbers is nothing more than computing ranks of matrices, something you practised in <Ref to="foundations/linear-algebra" /> and something a computer does in a blink. Next, we do it by hand.</p>

<h2 id="computations">Seven complete computations</h2>

<p>Here are seven test spaces, from a single point to a torus. For each one we write down the chain groups and the boundary matrices, find the cycles and the boundaries, and take the quotient. Read the first three slowly; after that the pattern repeats.</p>

<Figure num="3.3.3" title="Seven test complexes">
	<Gallery />
	{#snippet caption()}The complexes computed in this section, with their homology. Labels on the torus repeat because the square’s opposite sides are glued: the four corners are all vertex \(0\). The hollow tetrahedron is drawn as its net; fold the three flaps up and their tips meet at vertex \(3\).{/snippet}
</Figure>

<h3>A point</h3>

<p>The complex has one vertex \([0]\) and nothing else. So \(C_0 \cong \Z\), whose elements are the multiples \(n[0]\), and every other chain group is \(0\). Since \(\partial_0 = 0\), every 0-chain is a cycle: \(Z_0 = C_0 \cong \Z\). There are no edges, so nothing is a boundary: \(B_0 = \im\partial_1 = 0\). Therefore</p>

\[ H_0(\text{point}) = \Z / 0 \cong \Z, \qquad H_k(\text{point}) = 0 \text{ for } k \ge 1. \]

<p>The generator of \(H_0\) is the class \([[0]]\) of the vertex itself, and the Betti numbers are \(1, 0, 0, \dots\). A point has one piece and no holes, yet \(H_0\) is \(\Z\) rather than \(0\). Keep that in mind; we will tidy it up with reduced homology.</p>

<h3>Two points</h3>

<p>Now take two vertices \([0]\) and \([1]\) and no edge. Then \(C_0 \cong \Z^2\), with elements \(a[0] + b[1]\). Again every 0-chain is a cycle, and again there are no edges, so \(B_0 = 0\). Hence \(H_0 \cong \Z^2\), with basis \([[0]]\) and \([[1]]\), and \(b_0 = 2\). Without an edge between them, nothing can make the two vertices homologous: there is no 1-chain whose boundary is \([1] - [0]\). Two pieces, two independent classes.</p>

<h3>The circle: a hollow triangle</h3>

<p>Vertices \(0, 1, 2\), edges \([0,1], [0,2], [1,2]\), no triangle. The chain groups are</p>

\[ C_0 \cong \Z^3 \;(\text{basis } [0],[1],[2]), \qquad C_1 \cong \Z^3 \;(\text{basis } [0,1],[0,2],[1,2]), \qquad C_2 = 0. \]

<p>The boundary of an edge is \(\partial[i,j] = [j] - [i]\). Writing each edge’s boundary as a column, in the vertex basis, gives the boundary matrix:</p>

<MatrixView M={d1tri} rowLabels={tri.K.simplices[0].map(lab)} colLabels={tri.K.simplices[1].map(lab)} caption={'\\partial_1 ='} />

<p><strong>Cycles.</strong> A 1-chain \(x = x_{01}[0,1] + x_{02}[0,2] + x_{12}[1,2]\) is a cycle when \(\partial_1 x = 0\). Reading the matrix row by row, that means three equations, one per vertex:</p>

\[ -x_{01} - x_{02} = 0, \qquad x_{01} - x_{12} = 0, \qquad x_{02} + x_{12} = 0. \]

<p>Each equation says that the cycle arrives at a vertex as often as it leaves. The solutions are \(x_{01} = x_{12} = t\) and \(x_{02} = -t\) for any integer \(t\). So \(Z_1 \cong \Z\), generated by \(z = [0,1] - [0,2] + [1,2]\), the walk \(0 \to 1 \to 2 \to 0\).</p>

<p><strong>Boundaries.</strong> There are no triangles, so \(B_1 = \im\partial_2 = 0\), and</p>

\[ H_1 = Z_1 / B_1 = Z_1 \cong \Z, \quad \text{generated by } [z]. \]

<p><strong>Dimension 0.</strong> Every 0-chain is a cycle, so \(Z_0 = C_0 \cong \Z^3\). The boundaries \(B_0 = \im\partial_1\) are the integer combinations of the columns \([1]-[0]\), \([2]-[0]\), \([2]-[1]\). These are exactly the 0-chains \(a[0] + b[1] + c[2]\) whose coefficients add up to zero. Each column has coefficient sum \(0\), so all their combinations do; conversely, if \(a + b + c = 0\) then \(a[0]+b[1]+c[2] = b([1]-[0]) + c([2]-[0])\). Now consider the homomorphism</p>

\[ \varepsilon\colon \Z^3 \to \Z, \qquad \varepsilon(a[0] + b[1] + c[2]) = a + b + c. \]

<p>It is onto, and its kernel is exactly \(B_0\). By the first isomorphism theorem (<Ref to="foundations/abelian-groups" />), \(H_0 = \Z^3/B_0 \cong \Z\). Concretely, \([0] = [1] = [2]\) in \(H_0\), because \([1] - [0] = \partial[0,1]\) is a boundary, and the class of a 0-chain remembers only the sum of its coefficients.</p>

<p><strong>Result:</strong> \(H_0 \cong \Z\) and \(H_1 \cong \Z\). One piece, one hole.</p>

<h3>The disk: a filled triangle</h3>

<p>Add the triangle \([0,1,2]\). Now \(C_2 \cong \Z\), and its single basis element has boundary</p>

\[ \partial_2[0,1,2] = [1,2] - [0,2] + [0,1] = z. \]

<MatrixView M={d2disk} rowLabels={disk.K.simplices[1].map(lab)} colLabels={disk.K.simplices[2].map(lab)} caption={'\\partial_2 ='} />

<p>The single column of \(\partial_2\) is exactly the cycle we found before. So now \(B_1 = \im\partial_2 = \set{nz : n \in \Z} = Z_1\), and</p>

\[ H_1 = Z_1 / B_1 = 0. \]

<p>Filling the triangle killed the hole: the loop \(z\) is now the rim of something. In dimension 2, \(\partial_2(n[0,1,2]) = nz\), which is zero only for \(n = 0\); so \(Z_2 = 0\) and \(H_2 = 0\). Dimension 0 is unchanged, because \(\partial_1\) did not change. <strong>Result:</strong> \(H_0 \cong \Z\), \(H_1 = 0\), \(H_2 = 0\), the same as a point. That is no coincidence. A disk can be shrunk continuously to a point (<Ref to="topology/homotopy" />), and in <Ref to="homology/invariance" /> we will prove that homology cannot tell such spaces apart.</p>

<p>Before the bigger examples, step through the computations in Figure 3.3.4. Hovering over a column of a boundary matrix lights up its simplex in the picture; hovering over an entry lights up the face it records.</p>

<Figure num="3.3.4" title="Computing homology, step by step" hint="Step through · hover the matrix">
	<ComputationPlayer />
	{#snippet caption()}The computation of \(H_*\) for the circle, the disk, the sphere and the torus, one idea per step. The matrices are the boundary matrices \(\partial_k\), with rows indexed by \((k-1)\)-simplices and columns by \(k\)-simplices; each column lists the boundary of one simplex.{/snippet}
</Figure>

<h3>The sphere: a hollow tetrahedron</h3>

<p>Take all the vertices, edges and triangles of a tetrahedron with vertices \(0, 1, 2, 3\), but not the solid inside. There are \(4\) vertices, \(6\) edges and \(4\) triangles, so \(C_0 \cong \Z^4\), \(C_1 \cong \Z^6\), \(C_2 \cong \Z^4\). The second boundary matrix is</p>

<MatrixView M={d2tet} rowLabels={tet.K.simplices[1].map(lab)} colLabels={tet.K.simplices[2].map(lab)} caption={'\\partial_2 ='} />

<p>For instance the first column says \(\partial[0,1,2] = [0,1] - [0,2] + [1,2]\). Row reduction (or the player above) shows that \(\rank\partial_1 = 3\) and \(\rank\partial_2 = 3\). The rank formula then gives</p>

\[ b_0 = 4 - 0 - 3 = 1, \qquad b_1 = 6 - 3 - 3 = 0, \qquad b_2 = 4 - 3 - 0 = 1. \]

<p><strong>The 2-cycle.</strong> Four columns of rank three must satisfy one relation, and here it is: the first column minus the second plus the third minus the fourth is zero. In chain language,</p>

\[ S = [0,1,2] - [0,1,3] + [0,2,3] - [1,2,3] \quad\text{satisfies}\quad \partial S = 0. \]

<p>Check one edge to see why: \([0,1]\) appears in \(\partial[0,1,2]\) with coefficient \(+1\) and in \(\partial[0,1,3]\) with coefficient \(+1\), and \(S\) takes these two triangles with opposite signs, so \([0,1]\) cancels. Geometrically, \(S\) is the whole shell with every face oriented consistently (all counterclockwise in the net of Figure 3.3.3), so every edge is crossed once in each direction. Since there are no 3-simplices, \(B_2 = 0\) and</p>

\[ H_2 = Z_2 = \Z S \cong \Z. \]

<p>The hollow tetrahedron encloses a cavity, and \(H_2\) detects it. If we added the solid tetrahedron \([0,1,2,3]\), its boundary \(\partial[0,1,2,3] = -S\) would make \(S\) a boundary and the cavity would disappear from \(H_2\).</p>

<p><strong>Loops on a sphere.</strong> We found \(\rank Z_1 = 6 - 3 = 3\) and \(\rank B_1 = 3\). In fact \(B_1 = Z_1\): every 1-cycle on the sphere is the boundary of some collection of faces. For example, the square \(0 \to 1 \to 3 \to 2 \to 0\) equals \(\partial([0,1,3] - [0,2,3])\). So \(H_1 = 0\): there is no way to lasso a sphere. <strong>Result:</strong> \(H_0 \cong \Z\), \(H_1 = 0\), \(H_2 \cong \Z\).</p>

<Warning title="Equal ranks do not quite mean equal groups">
	<p>Over a field, a subspace with the same dimension as the whole space is the whole space, so equal ranks would settle \(B_1 = Z_1\) immediately. Over \(\Z\) they do not: the even integers \(2\Z\) have the same rank as \(\Z\) but are smaller, and the quotient \(\Z/2\Z\) is not zero. When that happens it produces exactly the torsion of the next chapter. For the sphere it does not happen, and the Smith normal form of <Ref to="homology/computing" /> confirms it.</p>
</Warning>

<h3>A wedge of two circles</h3>

<p>Two hollow triangles that share one vertex form a figure eight, the wedge \(S^1 \vee S^1\) of <Ref to="topology/gluing" />. Take vertices \(0, \dots, 4\) and edges \([0,1], [1,2], [0,2], [0,3], [3,4], [0,4]\). There are no triangles, so \(B_1 = 0\) and \(H_1 = Z_1\). The graph is connected, so \(\rank\partial_1 = 5 - 1 = 4\), giving \(b_0 = 1\) and \(b_1 = 6 - 4 = 2\). Two independent cycles are</p>

\[ z_1 = [0,1] + [1,2] - [0,2], \qquad z_2 = [0,3] + [3,4] - [0,4], \]

<p>and every 1-cycle is uniquely \(m z_1 + n z_2\) for integers \(m, n\). (A cycle must use the edge \([0,1]\) as often as \([1,2]\), as often as \(-[0,2]\), and similarly in the second lobe.) So \(H_1 \cong \Z^2\), with basis \([z_1], [z_2]\).</p>

<Remark title="Homology forgets the order">
	<p>The fundamental group of the figure eight (<Ref to="topology/homotopy" />) is not abelian: going around the first lobe and then the second is a different loop from going around the second and then the first. Homology cannot see the difference, because chains add commutatively: both loops give \(z_1 + z_2\). Homology keeps only the net number of times each lobe is traversed. Allen Hatcher puts it neatly: “loops become cycles, without a chosen basepoint” <Cite k="hatcher2002" loc="p. 99" />. The precise relationship between the two, \(H_1 = \pi_1\) made abelian, is in <Ref to="homology/invariance" />.</p>
</Remark>

<h3>The torus</h3>

<p>Finally the 3×3 torus of <Ref to="topology/simplicial-complexes" />: a square divided into nine small squares, each cut into two triangles, with opposite sides glued. The vertex at grid position \((i, j)\) has label \(i + 3j\) (\(i\) counts columns, \(j\) counts rows from the bottom), and labels repeat around the rim because those points are glued. There are \(9\) vertices, \(27\) edges and \(18\) triangles. The boundary matrices are \(9 \times 27\) and \(27 \times 18\), too big to row-reduce comfortably by hand. A computer (or the player in Figure 3.3.4) finds the ranks; a cleverer cutting, after this subsection, will let us do without one.</p>

\[ \rank\partial_1 = 8, \qquad \rank\partial_2 = 17, \]

\[ b_0 = 9 - 0 - 8 = 1, \qquad b_1 = 27 - 8 - 17 = 2, \qquad b_2 = 18 - 17 - 0 = 1. \]

<p><strong>Two loops.</strong> Let \(a = [0,1] + [1,2] - [0,2]\) be the bottom row, walked left to right (it runs once around the hole of the doughnut), and \(b = [0,3] + [3,6] - [0,6]\) the left column, walked upward (once around the tube). Both are cycles. They are not boundaries, and no combination \(ma + nb\) other than \(0\) is a boundary either. Here is a pleasant way to see it.</p>

<Proof title="Why a and b are independent">
	<p>For a 1-chain \(x\), let \(\varphi(x)\) be the signed number of times \(x\) crosses the right-hand seam of the square: each edge leaving column \(2\) to the right counts \(+1\) for each time \(x\) runs along it rightward and \(-1\) for each time leftward. Define \(\psi(x)\) the same way for the top seam, counting upward crossings. Both are homomorphisms to \(\Z\). The boundary of any triangle crosses each seam either not at all or once in each direction, so \(\varphi(\partial t) = \psi(\partial t) = 0\), and therefore \(\varphi\) and \(\psi\) vanish on every boundary. But \(\varphi(a) = 1\), \(\psi(a) = 0\), \(\varphi(b) = 0\), \(\psi(b) = 1\). If \(ma + nb = \partial c\), applying \(\varphi\) gives \(m = 0\) and applying \(\psi\) gives \(n = 0\).</p>
</Proof>

<p>So \([z] \mapsto (\varphi(z), \psi(z))\) is a homomorphism \(H_1 \to \Z^2\) that sends \([a]\) and \([b]\) to the two basis vectors. It is onto, and since \(H_1\) has rank \(2\) and no torsion (the Smith normal form check of <Ref to="homology/computing" />), it is an isomorphism:</p>

\[ H_1(T^2) \;=\; \Z[a] \oplus \Z[b] \;\cong\; \Z^2. \]

<p>The seam-crossing counts \(\varphi\) and \(\psi\) deserve a second look: they are functions on edges that vanish on every boundary. They are our first <em>cocycles</em>, and Part IV is built on them.</p>

<p><strong>The whole surface.</strong> Orient all 18 triangles counterclockwise in the picture and add them up: \(T = \sum \pm t\), with the signs that make each triangle counterclockwise. Every interior edge is shared by two triangles that run along it in opposite directions, so it cancels. The rim edges cancel too, because the glued sides of the square are traversed in opposite directions (the bottom left to right, the top right to left). So \(\partial T = 0\). The 2-cycles form a group of rank \(18 - 17 = 1\), generated by \(T\), and \(B_2 = 0\), so</p>

\[ H_0(T^2) \cong \Z, \qquad H_1(T^2) \cong \Z^2, \qquad H_2(T^2) \cong \Z. \]

<Figure num="3.3.5" title="The torus and its generators" hint="Drag to rotate · pick a view">
	<TorusGenerators3D />
	{#snippet caption()}The 3×3 torus wrapped onto a doughnut. The gold loop \(a\) runs once around the hole and the rose loop \(b\) once around the tube; their classes generate \(H_1 \cong \Z^2\). “Slide \(a\) to \(a'\)” shows the middle row \(a'\) and the strip of six triangles between the two rows: \(a - a' = \partial(\text{strip})\), so \([a'] = [a]\). “The 2-cycle” orients all 18 triangles coherently; their sum \(T\) has no boundary and generates \(H_2 \cong \Z\).{/snippet}
</Figure>

<h3 id="six-cells">The torus again, from six cells</h3>

<p>Fifty-four simplices is a lot of bookkeeping for one doughnut, and “a computer finds” is an unsatisfying end to a computation. So cut the same torus more cleverly. Glue the square’s opposite sides as before, but cut it along one diagonal only. All four corners become a single vertex \(v\). The sides become two edges, \(a\) along the bottom and top and \(b\) up the left and right, and the diagonal is a third edge \(c\). There are two triangles, \(L\) below the diagonal and \(U\) above it: six cells in all. This is not a simplicial complex, since all three corners of each triangle are the same point, but it is a Δ-complex (<Ref to="topology/simplicial-complexes" hash="delta-complexes" />), and chains, boundaries and homology work exactly as before <Cite k="hatcher2002" loc="Example 2.3" />. Here is the whole computation; Figure 3.3.6 takes it one step at a time.</p>

<p><strong>Degree 0.</strong> Every edge starts and ends at \(v\), so \(\partial a = v - v = 0\), and the same goes for \(b\) and \(c\). So \(\partial_1 = 0\): every 1-chain is a cycle, \(Z_1 = C_1 \cong \Z^3\), and \(H_0 = C_0 \cong \Z\).</p>

<p><strong>Degree 1.</strong> Walk around \(L\): along \(a\), up \(b\), back down the diagonal. Walk around \(U\): up \(b\), along \(a\), back down the diagonal. The two triangles have the same rim,</p>

\[ \partial L \;=\; a + b - c \;=\; \partial U, \]

<p>so the boundaries are the multiples of a single chain, \(B_1 = \Z\,(a + b - c)\), and \(H_1 = \Z^3 / \Z\,(a + b - c)\). To recognise this group, send \(xa + yb + zc\) to \((x + z,\, y + z)\). This homomorphism \(C_1 \to \Z^2\) is onto, and its kernel is exactly the multiples of \(a + b - c\), because \(x + z = y + z = 0\) forces \(x = y = -z\). By the first isomorphism theorem, \(H_1 \cong \Z^2\), with basis \([a]\) and \([b]\).</p>

<p><strong>Degree 2.</strong> \(\partial(pL + qU) = (p + q)(a + b - c)\), which vanishes exactly when \(q = -p\). There are no 3-cells, so \(H_2 = Z_2 = \Z\,(L - U) \cong \Z\). In \(L - U\) both triangles turn the same way round; the diagonal is crossed once in each direction, each pair of glued sides cancels, and what is left is the whole torus.</p>

<Figure num="3.3.6" title="The torus by hand" hint="Step through · drag the diagonal">
	<TorusSixCells />
	{#snippet caption()}Hatcher’s two-triangle torus, labelled as in Figures 2.5.11 and 4.2.3. One vertex makes \(\partial_1\) zero; the two triangles share one rim, so \(\partial_2\) has two equal columns; one relation turns \(\Z^3\) into \(\Z^2\). In step 4, push the diagonal \(c\) across \(L\) and it becomes \(a\) followed by \(b\): \([c] = [a] + [b]\).{/snippet}
</Figure>

<p>Six cells, a few lines, and the same answer as fifty-four simplices: \(\Z, \Z^2, \Z\). The single relation deserves a picture of its own. In \(H_1\) it says \([c] = [a] + [b]\). The diagonal loop, which goes once around the hole and once around the tube, is homologous to “once around \(a\), then once around \(b\)”, because \(c - (a + b) = -\partial L\): push \(c\) across \(L\) and it becomes \(a\) followed by \(b\). That settles the claim about the \((1, 1)\) loop in <Ref to="homology/cycles-and-boundaries" />.</p>

<p>Two different cuttings of one torus gave the same groups. Luck? No: in <Ref to="homology/invariance" /> we will see that homology depends only on the space, never on how it was cut, and that is what licenses shortcuts like this one. Aleph 0’s fourteen-minute video <em>What is algebraic topology?</em> does this computation on a single notebook page and then turns to exactly that worry <Cite k="aleph0-2025" />.</p>

<p>Look at the seven results side by side (they are under the pictures in Figure 3.3.3). A point and a disk: \(\Z, 0, 0\). Two points: \(\Z^2\). A circle: \(\Z, \Z\). A figure eight: \(\Z, \Z^2\). A sphere: \(\Z, 0, \Z\). A torus: \(\Z, \Z^2, \Z\). In every case the numbers match what the eye sees: pieces, loops, cavities. The difference is that now they are theorems, computed by a procedure that works for any complex whatsoever.</p>

<h2 id="h0-counts-pieces">\(H_0\) counts the pieces</h2>

<p>In every example, \(H_0\) was \(\Z^c\), with \(c\) the number of pieces. That is a theorem <Cite k="munkres1984" loc="Thm 7.1" />, and its proof shows in miniature how homology arguments go.</p>

<p>Recall from <Ref to="topology/spaces" /> that two points of a space lie in the same <Term t="path-component">path component</Term> when some path joins them. In a simplicial complex, every point lies in some simplex and can be joined to a vertex by a straight segment inside it; and two vertices lie in the same path component exactly when they are joined by an <em>edge path</em>, a sequence of edges each sharing an endpoint with the next. So the path components of \(K\) are the pieces of its edge graph.</p>

<Theorem id="thm-h0">
	{#snippet head()}\(H_0\) is free on the pieces{/snippet}
	<p>If \(K\) has \(c\) path components, then \(H_0(K) \cong \Z^c\). A basis is given by the classes of \(c\) vertices, one chosen in each component.</p>
</Theorem>

<Proof>
	<p><em>Step 1: vertices in the same piece are homologous.</em> If \([u,v]\) is an edge, then \([v] - [u] = \partial[u,v]\) is a boundary, so \([u] = [v]\) in \(H_0\). Along an edge path \(u = v_0, v_1, \dots, v_m = w\) we get \([u] = [v_1] = \cdots = [w]\). Choose a vertex \(p_i\) in each component \(K_i\). Every vertex is then homologous to the chosen vertex of its component, so every 0-chain is homologous to some combination \(n_1[p_1] + \cdots + n_c[p_c]\).</p>
	<p><em>Step 2: different pieces are independent.</em> For each component \(K_i\) let \(\varepsilon_i\) be “the sum of the coefficients on \(K_i\)”: \(\varepsilon_i\big(\sum_v a_v [v]\big) = \sum_{v \in K_i} a_v\). Each edge lies inside a single component, and \(\partial[u,v] = [v] - [u]\) has coefficient sum \(0\) there, so every \(\varepsilon_i\) vanishes on \(B_0\). Hence \(\varepsilon = (\varepsilon_1, \dots, \varepsilon_c)\) gives a well-defined homomorphism \(H_0(K) \to \Z^c\). It sends \([p_i]\) to the \(i\)-th basis vector, so it is onto. And it is one-to-one: by Step 1 every class is \(\sum n_i [p_i]\), whose image is \((n_1, \dots, n_c)\), which is zero only if every \(n_i = 0\).</p>
</Proof>

<Figure num="3.3.7" title="H₀ counts pieces" hint="Click edges · click two vertices">
	<ComponentCounter />
	{#snippet caption()}Each piece of the graph gets its own colour, and \(H_0 \cong \Z^c\). The rank formula agrees: \(b_0 = n_0 - \rank\partial_1\). Click two vertices in the same piece and the figure shows an edge path between them, a 1-chain whose boundary is their difference; in different pieces no such chain exists.{/snippet}
</Figure>

<p>As you add and remove edges, watch the second line of the readout too. For a graph, \(b_1 = n_1 - \rank\partial_1\), and since \(\rank\partial_1 = n_0 - c\) this is \(b_1 = E - V + c\), Kirchhoff’s count of independent loops from <Ref to="homology/cycles-and-boundaries" />. Every edge you add either joins two pieces (and \(b_0\) drops by one) or closes a loop (and \(b_1\) rises by one). Never both, never neither. Hold on to that observation: it is the heart of the Euler–Poincaré formula below.</p>

<h2 id="reduced-homology">Reduced homology</h2>

<p>A point has \(H_0 \cong \Z\). Nothing is wrong with that, since the \(\Z\) counts the single piece, but it means that “a space with no holes at all” does not have all its homology groups equal to zero. Many statements become cleaner if we shift \(H_0\) down by one copy of \(\Z\). The tool is the map \(\varepsilon\) we already used for the triangle.</p>

<Definition id="def-reduced">
	{#snippet head()}Reduced homology \(\tilde H_k\){/snippet}
	<p>The <dfn>augmentation</dfn> of a non-empty complex \(K\) is the homomorphism \(\varepsilon\colon C_0(K) \to \Z\), \(\varepsilon\big(\sum_v a_v[v]\big) = \sum_v a_v\). Attaching it to the end of the chain complex gives the <dfn>augmented chain complex</dfn></p>
	\[ \cdots \xrightarrow{\;\partial_2\;} C_1(K) \xrightarrow{\;\partial_1\;} C_0(K) \xrightarrow{\;\varepsilon\;} \Z \to 0, \]
	<p>and its homology is the <dfn>reduced homology</dfn>: \(\tilde H_0(K) = \ker\varepsilon / \im\partial_1\), and \(\tilde H_k(K) = H_k(K)\) for \(k \ge 1\).</p>
</Definition>

<p>Read \(\tilde H_k\) as “H tilde \(k\)”. For this to be a chain complex we need \(\varepsilon \circ \partial_1 = 0\), and indeed \(\varepsilon(\partial[u,v]) = \varepsilon([v] - [u]) = 1 - 1 = 0\). The only change from ordinary homology is in degree 0, where we now count only those 0-cycles whose coefficients add up to zero.</p>

<Proposition id="prop-reduced">
	<p>\(H_0(K) \cong \tilde H_0(K) \oplus \Z\). In particular, if \(K\) has \(c\) pieces then \(\tilde H_0(K) \cong \Z^{c-1}\).</p>
</Proposition>

<Proof>
	<p>The augmentation induces an onto homomorphism \(\varepsilon\colon H_0(K) \to \Z\) (it vanishes on boundaries), whose kernel is \(\tilde H_0(K)\). Pick any vertex \(v\). The map \(\Z \to H_0(K)\), \(n \mapsto n[v]\), undoes \(\varepsilon\) on the \(\Z\) side, which splits \(H_0(K)\) as \(\tilde H_0(K) \oplus \Z\). The count follows from the theorem on components <Cite k="munkres1984" loc="Thm 7.2" />.</p>
</Proof>

<p>Now the examples read more naturally.</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>space</th><th>\(\tilde H_0\)</th><th>\(\tilde H_1\)</th><th>\(\tilde H_2\)</th><th>in words</th></tr>
		</thead>
		<tbody>
			<tr><td>point, disk</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>no holes at all</td></tr>
			<tr><td>two points \(S^0\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(0\)</td><td>one gap between pieces</td></tr>
			<tr><td>circle \(S^1\)</td><td>\(0\)</td><td>\(\Z\)</td><td>\(0\)</td><td>one loop</td></tr>
			<tr><td>sphere \(S^2\)</td><td>\(0\)</td><td>\(0\)</td><td>\(\Z\)</td><td>one cavity</td></tr>
			<tr><td>figure eight \(S^1 \vee S^1\)</td><td>\(0\)</td><td>\(\Z^2\)</td><td>\(0\)</td><td>two loops</td></tr>
		</tbody>
	</table>
</div>

<p>Two patterns stand out. A sphere has exactly one hole, in its own dimension: \(\tilde H_k(S^n) \cong \Z\) when \(k = n\) and \(0\) otherwise. We have checked it for \(n = 0, 1, 2\), using the hollow \((n+1)\)-simplex as a model of \(S^n\); the general case is proved in <Ref to="homology/exact-sequences" />. And wedging adds reduced homology: the figure eight is two circles joined at a point, and its \(\tilde H_1 = \Z \oplus \Z\) is the sum of theirs. Reduced homology is mostly a convenience for stating results like these cleanly. Nothing is lost by using it, since ordinary homology is recovered by adding back one \(\Z\) in degree 0.</p>

<h2 id="euler-poincare">The Euler–Poincaré formula</h2>

<p>In <Ref to="topology/euler-characteristic" /> you met the Euler characteristic</p>

\[ \chi(K) = n_0 - n_1 + n_2 - n_3 + \cdots, \]

<p>vertices minus edges plus triangles, and so on. It was a mystery why this alternating count does not depend on how a space is triangulated: subdividing changes every \(n_k\), yet the alternating sum stays put. That chapter hinted that a deeper theory was hiding underneath. Here it is <Cite k="hatcher2002" loc="Thm 2.44" />.</p>

<Theorem id="thm-euler-poincare" label="Theorem (Euler–Poincaré)">
	<p>For a finite simplicial complex \(K\) and Betti numbers taken over any field (for instance \(\Q\) or \(\Z/2\)),</p>
	\[ \chi(K) \;=\; \sum_k (-1)^k\, n_k \;=\; \sum_k (-1)^k\, b_k. \]
</Theorem>

<Proof>
	<p>Write \(r_k = \rank\partial_k\). The rank formula says \(b_k = n_k - r_k - r_{k+1}\), that is, \(n_k = b_k + r_k + r_{k+1}\) for every \(k\). Multiply by \((-1)^k\) and add over all \(k\):</p>
	\[ \sum_k (-1)^k n_k = \sum_k (-1)^k b_k + \sum_k (-1)^k (r_k + r_{k+1}). \]
	<p>In the last sum each \(r_j\) appears exactly twice: once as \(r_k\) with \(k = j\), with sign \((-1)^j\), and once as \(r_{k+1}\) with \(k = j - 1\), with sign \((-1)^{j-1}\). The two cancel. The end terms vanish too, since \(r_0 = 0\) and \(r_{N+1} = 0\) beyond the top dimension \(N\). So the last sum is \(0\).</p>
</Proof>

<p>The proof is pure bookkeeping, and Figure 3.3.8 turns the bookkeeping into a picture. Build a complex one simplex at a time, always adding faces before the simplices they bound. Each new \(k\)-simplex does exactly one of two things. Either its boundary was already a boundary, and then it creates a new \(k\)-cycle (\(b_k\) goes up by one), or its boundary was a cycle that did not yet bound, and then it fills that cycle in (\(b_{k-1}\) goes down by one). In both cases \(\chi\) changes by \((-1)^k\), and so does \(b_0 - b_1 + b_2 - \cdots\). The two alternating sums start equal (both \(0\) for the empty complex) and change in lockstep, so they are always equal.</p>

<p>The ledger is also an algorithm. Cecil Delfinado and Herbert Edelsbrunner used it to compute Betti numbers one simplex at a time <Cite k="delfinado-edelsbrunner1995" />, and pairing each killer with the class it kills is where persistent homology begins (<Ref to="homology/persistence" />).</p>

<Figure num="3.3.8" title="Euler–Poincaré as a ledger" hint="Play or drag · hover the squares">
	<EulerPoincare />
	{#snippet caption()}Building a complex one simplex at a time. Each square in row \(C_k\) is one \(k\)-simplex. A gold square created a new class; a teal square killed a class one dimension lower. A creator that was later killed is drawn hollow, and hovering over it shows the teal simplex that killed it. Each such pair cancels in the alternating sum, and the solid gold squares that remain are exactly the Betti numbers.{/snippet}
</Figure>

<p>Some consequences, each a small triumph.</p>

<ul>
	<li><strong>The numbers agree.</strong> Sphere: \(4 - 6 + 4 = 2 = 1 - 0 + 1\). Torus: \(9 - 27 + 18 = 0 = 1 - 2 + 1\). Figure eight: \(5 - 6 = -1 = 1 - 2\).</li>
	<li><strong>The mystery of §2.6 is explained.</strong> In <Ref to="homology/invariance" /> we will see that the Betti numbers of a space do not depend on the triangulation. Then the alternating sum of Betti numbers is independent of the triangulation, and therefore so is \(\chi\). Subdividing a triangle changes \(n_0, n_1, n_2\) wildly but cannot change a single Betti number.</li>
	<li><strong>Lhuilier’s picture frame, explained.</strong> The frame of <Ref to="topology/euler-characteristic" /> is a torus, and \(1 - 2 + 1 = 0\) is why its \(V - E + F\) is \(0\) rather than \(2\). More generally, a closed orientable surface of genus \(g\) has \(b_0 = 1\), \(b_1 = 2g\), \(b_2 = 1\) (we computed \(g = 1\); the general case is in <Ref to="homology/exact-sequences" />), so \(\chi = 2 - 2g\). A doughnut “has one hole” but two independent loops; that is why \(\chi\) drops by \(2\) per handle.</li>
</ul>

<History title="A proof made simpler">
	<p>Poincaré proved the formula \(\sum (-1)^k n_k = \sum (-1)^k b_k\) in 1899, working with his incidence matrices <Cite k="poincare1899" />. In the summer of 1928 Heinz Hopf lectured in Göttingen on a generalisation of it, a first step towards counting the fixed points of a map, and Emmy Noether sat in. Under her influence, he wrote, his proof became “wesentlich durchsichtiger und einfacher”, considerably more transparent and simpler, once it was phrased with groups: the bookkeeping above, with the traces of a map in place of ranks. Decades later Hopf recalled how new this basis-free view had been. He was not even sure, he wrote, whether the concept of a “homology group” had yet appeared anywhere “schwarz auf weiß”, in black and white <Cite k="hirzebruch1999" />.</p>
</History>

<h2 id="cliffhanger">A cliffhanger: two surfaces, one set of numbers</h2>

<p>Let us compute one more surface, and to keep the work light, let us do it over \(\Z/2\). There a chain is a set of simplices, the boundary keeps the faces that appear an odd number of times, and orientations never matter (<Ref to="homology/chains" />).</p>

<p>Take the 3×3 grid again, but this time glue the top of the square to the bottom <em>with a flip</em>: the top row reads \(0, 2, 1, 0\) instead of \(0, 1, 2, 0\). The left and right sides are still glued straight. The result is the <Term t="klein-bottle">Klein bottle</Term> \(K\) of <Ref to="topology/gluing" />, the surface that cannot be built in ordinary space without passing through itself.</p>

<Figure num="3.3.9" title="The Klein bottle grid">
	<div class="kgrid">
		<div>
			<Svg viewBox={torus.L.viewBox} maxHeight={250} label="The 3 by 3 torus grid">
				<FlatComplex L={torus.L} edgeCoef={(e) => ta[e] || tb[e]} coefColor={(e) => (ta[e] ? 'var(--gold-bright)' : 'var(--rose)')} labelSize={1.1} />
			</Svg>
			<p class="kcap ui">torus: top row 0 1 2 0</p>
		</div>
		<div>
			<Svg viewBox={klein.L.viewBox} maxHeight={250} label="The 3 by 3 Klein bottle grid; the top row is the bottom row reversed">
				<FlatComplex L={klein.L} edgeCoef={(e) => ka[e] || kb[e]} coefColor={(e) => (ka[e] ? 'var(--gold-bright)' : 'var(--rose)')} labelSize={1.1} />
			</Svg>
			<p class="kcap ui">Klein bottle: top row 0 2 1 0</p>
		</div>
	</div>
	{#snippet caption()}Two gluings of the same grid. In the first the top row repeats the bottom row, giving the torus; in the second it repeats it backwards, giving the Klein bottle. Gold: the bottom row \(a\). Rose: the left column \(b\).{/snippet}
</Figure>

<p>The counts are the same as for the torus: \(9\) vertices, \(27\) edges, \(18\) triangles, and you can check that every edge still lies in exactly two triangles. Over \(\Z/2\) the ranks are the same too: \(\rank\partial_1 = 8\) and \(\rank\partial_2 = 17\). So the mod-2 Betti numbers are</p>

\[ b_0 = 9 - 8 = 1, \qquad b_1 = 27 - 8 - 17 = 2, \qquad b_2 = 18 - 17 = 1, \]

<p>exactly the torus’s \(1, 2, 1\). The bottom row \(a\) and the left column \(b\) generate \(H_1(K;\Z/2) \cong (\Z/2)^2\), and the set of all 18 triangles is a mod-2 2-cycle, because every edge is a face of exactly two of them, an even number. Even the Euler characteristics agree: \(\chi = 0\) for both.</p>

<Figure num="3.3.10" title="Same numbers, different surfaces" hint="Drag to rotate">
	<TorusKleinPair lens="Z2" />
	{#snippet caption()}The torus and the Klein bottle, each built from the 3×3 grid. Through the \(\Z/2\) lens they look identical: one piece, two independent loops \(a\) and \(b\), and the sum of all triangles (violet) as a 2-cycle. Yet one surface is orientable and the other is not.{/snippet}
</Figure>

<p>So here are two surfaces that <Ref to="topology/manifolds" /> proved to be different. One is orientable and the other is not; one sits happily in space and the other cannot. And yet they have the same Euler characteristic and the same mod-2 Betti numbers. Has homology failed us?</p>

<p>Not quite. Working mod 2, we threw away the signs, and the signs are exactly where orientation lives. In the next chapter we redo the Klein bottle over the integers, where we are no longer allowed to divide, and something new appears: a class that is not zero, but whose double is. Homology will tell the torus and the Klein bottle apart after all.</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="A single edge">
	<p>Let \(K\) consist of one edge \([0,1]\) and its two vertices. Write down \(\partial_1\) as a matrix, and compute \(H_0(K)\) and \(H_1(K)\). Which vertices are homologous?</p>
	{#snippet solution()}
		<p>\(C_0 \cong \Z^2\), \(C_1 \cong \Z\), and \(\partial[0,1] = [1] - [0]\), so \(\partial_1\) is the column \((-1, 1)\) of rank \(1\). Since \(\partial_1(n[0,1]) = n([1]-[0])\) is zero only for \(n = 0\), \(Z_1 = 0\) and \(H_1 = 0\). In degree 0, \(B_0 = \Z\,([1]-[0])\), and \(a[0] + b[1] \mapsto a + b\) identifies \(H_0 = \Z^2/B_0\) with \(\Z\). The two vertices are homologous because their difference is the boundary of the edge. Betti numbers: \(b_0 = 2 - 0 - 1 = 1\), \(b_1 = 1 - 1 - 0 = 0\).</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Filling one triangle at a time">
	<p>Take a square with vertices \(0, 1, 2, 3\) (in order around it), its four sides \([0,1], [1,2], [2,3], [0,3]\), and the diagonal \([0,2]\). Compute \(b_1\) in three cases: (a) no triangles; (b) only the triangle \([0,1,2]\); (c) both triangles \([0,1,2]\) and \([0,2,3]\). Describe a generator of \(H_1\) in case (b).</p>
	{#snippet hint()}
		<p>The graph is connected, so \(\rank\partial_1 = 4 - 1 = 3\). Each added triangle raises \(\rank\partial_2\) by one, because the triangles’ boundaries are independent.</p>
	{/snippet}
	{#snippet solution()}
		<p>Here \(n_0 = 4\), \(n_1 = 5\) and \(\rank\partial_1 = 3\). (a) No triangles: \(b_1 = 5 - 3 - 0 = 2\), the two triangular loops. (b) \(\rank\partial_2 = 1\): \(b_1 = 5 - 3 - 1 = 1\). The surviving hole is the loop \(0 \to 2 \to 3 \to 0\), that is \([0,2] + [2,3] - [0,3]\); the other loop, around \([0,1,2]\), is now a boundary. (c) \(\rank\partial_2 = 2\): \(b_1 = 5 - 3 - 2 = 0\), and \(b_2 = 2 - 2 = 0\). The filled square is a disk.</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Homologous or not?">
	<p>On the 3×3 torus, let \(a\) be the bottom row and \(b\) the left column, as in the text. (a) Is the middle row \(a' = [3,4] + [4,5] - [3,5]\) homologous to \(a\)? (b) Is \(a + b\) homologous to \(a - b\)? (c) Is the loop \(0 \to 1 \to 4 \to 0\) homologous to zero?</p>
	{#snippet solution()}
		<p>(a) Yes. The six triangles of the bottom strip, each oriented counterclockwise in the picture, form a 2-chain whose boundary is \(a - a'\): the vertical and diagonal edges inside the strip cancel in pairs, the strip’s two short sides are glued and cancel, and what is left is the bottom row run rightward and the middle row run leftward. (Figure 3.3.5 shows this strip.) (b) No. Their difference is \(2b\), and the seam-crossing count \(\psi\) gives \(\psi(2b) = 2\), while \(\psi\) of every boundary is \(0\). (c) Yes: it is \(\partial[0,1,4]\), the boundary of a single triangle. As a chain it is \([0,1] + [1,4] - [0,4]\), exactly \(\partial[0,1,4]\).</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The 3-sphere">
	<p>The boundary of a 4-simplex, \(\partial\Delta^4\), has vertices \(0, \dots, 4\) and every simplex on at most four of them; it is a triangulated 3-sphere. (a) Check that its f-vector is \((5, 10, 10, 5)\). (b) Explain why \(\rank\partial_1 = 4\). (c) Given that \(\rank\partial_2 = 6\) and \(\rank\partial_3 = 4\), find all its Betti numbers and check the Euler–Poincaré formula.</p>
	{#snippet solution()}
		<p>(a) The number of \((k+1)\)-element subsets of a 5-element set is \(\binom{5}{k+1}\): \(5, 10, 10, 5\) for \(k = 0, 1, 2, 3\). (b) The complex is connected, so \(b_0 = 1\), and \(b_0 = n_0 - \rank\partial_1\) forces \(\rank\partial_1 = 5 - 1 = 4\). (c) \(b_1 = 10 - 4 - 6 = 0\), \(b_2 = 10 - 6 - 4 = 0\), \(b_3 = 5 - 4 - 0 = 1\). Euler–Poincaré: \(5 - 10 + 10 - 5 = 0 = 1 - 0 + 0 - 1\). One 3-dimensional cavity, as a 3-sphere should have. (The relation among the five tetrahedra is \(\partial[0,1,2,3,4]\), the boundary of the missing solid 4-simplex, which is why \(\rank\partial_3 = 5 - 1\).)</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Kirchhoff from Euler–Poincaré">
	<p>Let \(G\) be a graph with \(V\) vertices, \(E\) edges and \(c\) connected pieces. Use the Euler–Poincaré formula, with no further computation, to show that \(b_1(G) = E - V + c\).</p>
	{#snippet solution()}
		<p>A graph has no simplices of dimension \(2\) or more, so \(b_k = 0\) for \(k \ge 2\), and \(b_0 = c\) by the theorem on components. Euler–Poincaré reads \(V - E = b_0 - b_1 = c - b_1\), so \(b_1 = E - V + c\).</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Reduced Euler–Poincaré">
	<p>Write \(\tilde b_k = \rank\tilde H_k(K)\). Show that \(\sum_k (-1)^k \tilde b_k = \chi(K) - 1\). Deduce that every complex with all reduced homology zero, such as a point, a disk or a solid tetrahedron, has \(\chi = 1\).</p>
	{#snippet solution()}
		<p>By the proposition on reduced homology, \(\tilde b_0 = b_0 - 1\), while \(\tilde b_k = b_k\) for \(k \ge 1\). So \(\sum (-1)^k \tilde b_k = \sum (-1)^k b_k - 1 = \chi(K) - 1\) by Euler–Poincaré. If all \(\tilde b_k = 0\), then \(\chi(K) = 1\). Check: the solid tetrahedron has \(4 - 6 + 4 - 1 = 1\).</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Why the signs matter">
	<p>Suppose we tried a sign-free “boundary” with integer coefficients, \(\partial'[i,j] = [i] + [j]\) and \(\partial'[i,j,k] = [j,k] + [i,k] + [i,j]\). Compute \(\partial'\partial'[0,1,2]\), and explain why “\(\ker\partial' / \im\partial'\)” would not make sense. What happens to this computation over \(\Z/2\)?</p>
	{#snippet solution()}
		<p>\(\partial'\partial'[0,1,2] = ([1]+[2]) + ([0]+[2]) + ([0]+[1]) = 2[0] + 2[1] + 2[2] \ne 0\). So the 1-chain \(\partial'[0,1,2]\) lies in the image of \(\partial'\) but not in the kernel: the “boundaries” are not all “cycles”, and a quotient of the kernel by the image is not even defined, because the image does not sit inside the kernel. Over \(\Z/2\), however, \(2 = 0\) and signs do not matter, so \(\partial' = \partial\) and the problem disappears. That is why mod-2 homology can ignore orientations, while integer homology needs the alternating signs.</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>Inside the chain group \(C_k\) sit the cycles \(Z_k = \ker\partial_k\) and the boundaries \(B_k = \im\partial_{k+1}\). Because \(\partial\partial = 0\), every boundary is a cycle: \(B_k \subseteq Z_k\).</li>
		<li>The homology group is the quotient \(H_k = Z_k/B_k\): cycles, where two cycles count as the same when they differ by a boundary. Its elements are classes \([z]\); homologous cycles cobound a chain.</li>
		<li>The Betti number \(b_k\) is the rank of \(H_k\). Over a field it is computed by the rank formula \(b_k = n_k - \rank\partial_k - \rank\partial_{k+1}\), a consequence of rank–nullity.</li>
		<li>Point \(\Z\); two points \(\Z^2\); circle \(\Z, \Z\); disk \(\Z, 0, 0\); sphere \(\Z, 0, \Z\); figure eight \(\Z, \Z^2\); torus \(\Z, \Z^2, \Z\).</li>
		<li>\(H_0 \cong \Z^c\), where \(c\) is the number of pieces. Reduced homology removes one \(\Z\) from \(H_0\), so that a point has no homology at all and \(\tilde H_k(S^n)\) is \(\Z\) exactly in degree \(n\).</li>
		<li>Euler–Poincaré: \(\chi = \sum (-1)^k n_k = \sum (-1)^k b_k\). Every simplex either creates or kills one class.</li>
		<li>Mod 2, the torus and the Klein bottle both have Betti numbers \(1, 2, 1\). Telling them apart needs integer coefficients and torsion, the subject of the next chapter.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Algebraic Topology, Chapter 2',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard graduate text, free online. Section 2.1 motivates homology with graphs and then defines simplicial and singular homology; Theorem 2.44 is Euler–Poincaré.',
			kind: 'book',
			free: true
		},
		{
			title: 'Graphs, Surfaces and Homology',
			author: 'Peter Giblin',
			url: 'https://doi.org/10.1017/CBO9780511779534',
			note: 'The gentlest complete textbook: graphs, then surfaces, then homology, with hundreds of exercises. Third edition, Cambridge 2010.',
			kind: 'book'
		},
		{
			title: 'Elements of Algebraic Topology',
			author: 'James R. Munkres',
			url: 'https://doi.org/10.1201/9780429493911',
			note: 'A careful, classic treatment of simplicial homology with oriented simplices, reduced homology and many worked computations (chapter 1).',
			kind: 'book'
		},
		{
			title: 'Homology Theory — A Primer',
			author: 'Jeremy Kun',
			url: 'https://jeremykun.com/2013/04/03/homology-theory-a-primer/',
			note: 'A programmer-friendly introduction: cycles, boundaries and Betti numbers by row reduction, with code.',
			kind: 'web',
			free: true
		},
		{
			title: 'Computational Topology: An Introduction',
			author: 'Herbert Edelsbrunner and John Harer',
			url: 'https://doi.org/10.1090/mbk/069',
			note: 'Homology from the algorithmic side (chapters IV–V), leading into persistence; includes the incremental "creator or destroyer" view of Figure 3.3.7.',
			kind: 'book'
		},
		{
			title: 'Emmy Noether and Topology',
			author: 'Friedrich Hirzebruch',
			url: 'https://hirzebruch.mpim-bonn.mpg.de/98/6/preprint_1997_34.pdf',
			note: 'A short, charming lecture on how Betti numbers became homology groups in Göttingen in the 1920s, with letters from Hopf and Vietoris.',
			kind: 'paper',
			free: true
		},
		{
			title: 'An introduction to homology (Algebraic Topology 30)',
			author: 'N. J. Wildberger',
			url: 'https://www.youtube.com/watch?v=ShWdSNJeuOg',
			note: 'A visual, example-first video lecture at a beginner pace.',
			kind: 'video',
			free: true
		}
	]}
/>

<style>
	.kgrid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem 1rem;
		padding: 1rem 1.1rem 0.6rem;
	}
	@media (max-width: 520px) {
		.kgrid {
			grid-template-columns: 1fr;
		}
	}
	.kcap {
		text-align: center;
		font-size: 0.78rem;
		color: var(--ink-faint);
		margin: 0.3rem 0 0 !important;
		letter-spacing: 0.06em;
	}
</style>
