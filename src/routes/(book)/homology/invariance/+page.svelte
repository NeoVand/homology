<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Lemma from '$lib/components/prose/Lemma.svelte';
	import Corollary from '$lib/components/prose/Corollary.svelte';
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
	import HexagonMap from '$lib/figures/homology/invariance/HexagonMap.svelte';
	import ChainLadder from '$lib/figures/homology/invariance/ChainLadder.svelte';
	import PrismSweep from '$lib/figures/homology/invariance/PrismSweep.svelte';
	import PrismDiagram from '$lib/figures/homology/invariance/PrismDiagram.svelte';
	import BrouwerStir from '$lib/figures/homology/invariance/BrouwerStir.svelte';
	import DimensionPunctures from '$lib/figures/homology/invariance/DimensionPunctures.svelte';
	import DegreeHelix from '$lib/figures/homology/invariance/DegreeHelix.svelte';
	import HairyBall from '$lib/figures/homology/invariance/HairyBall.svelte';
	import CommutatorTorus from '$lib/figures/homology/invariance/CommutatorTorus.svelte';
	import JordanProbe from '$lib/figures/homology/invariance/JordanProbe.svelte';
</script>

<Epigraph author="Allen Hatcher" source="Algebraic Topology (2002), Chapter 2"
	>An interesting feature of homology that begins to emerge after one has worked with it for a while is that it is the basic properties of homology that are used most often, and not the actual definition itself.</Epigraph
>

<p class="lead">
	Stir a cup of coffee — gently or wildly, as you like — and let it settle. Is there a drop that ends up exactly where it started? Crumple a map of the room you are sitting in and drop it on the floor. Is there a point of the map lying exactly above the spot it depicts? Try to comb the fuzz of a tennis ball flat all over. Must there be a cowlick somewhere? These sound like questions for a physicist, a surveyor and a hairdresser. They are really questions about <em>continuous maps</em>, and homology answers all three: yes, yes, and yes.
</p>

<p>
	Until now we have used homology like a census: take one space, count its holes, write down the groups. This chapter lets spaces talk to each other. A continuous map from one space to another turns out to push cycles forward, so it carries holes to holes, and it does so by a <em>homomorphism</em> of homology groups. The rules this obeys are so rigid that they force fixed points to exist, forbid certain combings, and prove that a line, a plane and space are genuinely different shapes. On the way we finally earn the right to say “the homology of the torus” without adding “…as computed from this particular triangulation”.
</p>

<Ahead>
	<p>
		Maps are where homology starts paying its way. The induced homomorphisms \(f_*\) built here make homology into what mathematicians call a <em>functor</em> — a faithful translation of shapes and maps into groups and homomorphisms — and that idea runs through the rest of the book. Homotopy invariance (Section 4) is what makes homology an honest invariant of spaces. The exact sequences of <Ref to="homology/exact-sequences" /> are built entirely out of induced maps. In Part IV the arrows reverse: cohomology is pulled back, \(f^*\), instead of pushed forward. And <Ref to="big-picture/categories" /> gives “functor” its formal definition.
	</p>
</Ahead>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="maps-push-cycles">Maps push cycles forward</h2>

<p>
	Start with a post and two rubber bands. Loop the first band once around the post. Wind the second, longer band twice around it before letting the ends meet. Both bands are circles, so as spaces they are identical. What differs is the <em>way</em> each circle sits around the post — a map from the band to the circle around the post — and the number “twice” is something that map does to a hole. This section makes that precise for the simplest kind of map there is: one that sends vertices to vertices.
</p>

<h3>Simplicial maps, remembered</h3>

<p>
	Recall from <Ref to="topology/simplicial-complexes" /> that a <Term t="simplicial-map">simplicial map</Term> \(f\colon K \to L\) between simplicial complexes is determined by what it does to vertices. Each vertex of \(K\) goes to a vertex of \(L\), subject to one rule: whenever \(v_0, \dots, v_k\) span a simplex of \(K\), their images \(f(v_0), \dots, f(v_k)\) must span a simplex of \(L\). The images are allowed to coincide. Each point inside a simplex is then sent to the matching weighted average of the image vertices. A simplicial map can therefore squash a triangle onto an edge, or an edge onto a single vertex, but it never tears anything. It is continuous.
</p>

<p>
	Here is the example we will live with for a while. Let \(K\) be a <strong>hexagon</strong>: six vertices \(v_0, \dots, v_5\) joined in a ring by six edges. It is a triangulated circle. Let \(L\) be the <strong>hollow triangle</strong> from <Ref to="homology/homology-groups" />, with vertices \(0, 1, 2\) and three edges — another triangulated circle. Every pair of vertices of \(L\) spans an edge, so <em>any</em> way of labelling the hexagon's vertices with \(0, 1, 2\) is a simplicial map. An edge whose endpoints get different labels lands on an edge of the triangle. An edge whose endpoints get the same label is squashed onto a single vertex.
</p>

<p>
	Label the hexagon \(0, 1, 2, 0, 1, 2\) as you go around. Walking once around the hexagon, your image walks \(0 \to 1 \to 2 \to 0 \to 1 \to 2 \to 0\): twice around the triangle. This is the rubber band wound twice. We now teach algebra to see it.
</p>

<h3>What a simplicial map does to chains</h3>

<p>
	A chain is a formal sum of oriented simplices (<Ref to="homology/chains" />). Since \(f\) sends simplices to simplices, it ought to send chains to chains. On a single oriented simplex, apply \(f\) to its vertices:
</p>
\[ f_\#[v_0,\dots,v_k] \;=\; \begin{cases} [f(v_0),\dots,f(v_k)] & \text{if the } f(v_i) \text{ are all different,}\\[2pt] 0 & \text{if two of them coincide.} \end{cases} \]
<p>
	Then extend to sums by \(f_\#\bigl(\sum n_i \sigma_i\bigr) = \sum n_i\, f_\#(\sigma_i)\). The symbol \(f_\#\) is read “\(f\) sharp”; the sharp sign marks a map on <em>chains</em>, as opposed to the map \(f_*\) (“\(f\) lower star”) on homology that we are about to build.
</p>

<p>
	The second line is the real decision. When two vertices of a \(k\)-simplex land on the same point, the simplex is flattened into something of lower dimension — a <dfn>degenerate</dfn> simplex. A flattened triangle has no area left, so as a \(2\)-chain it should count for nothing. We send it to \(0\).
</p>

<p>
	The first line hides a little bookkeeping. The list \([f(v_0),\dots,f(v_k)]\) might not have its vertices in increasing order, which our convention for writing simplices demands. We fix that with the rule from <Ref to="homology/chains" />: swapping two vertices of an oriented simplex changes its sign. For instance \([2,0] = -[0,2]\): an edge walked from \(2\) to \(0\) is the edge \([0,2]\) walked backwards.
</p>

<Example title="Wrapping the hexagon twice">
	<p>The \(1\)-cycle that walks once around the hexagon is</p>
	\[ z = [v_0v_1] + [v_1v_2] + [v_2v_3] + [v_3v_4] + [v_4v_5] - [v_0v_5]. \]
	<p>
		(The last edge is walked from \(v_5\) back to \(v_0\), against its orientation, hence the minus sign.) With the labels \(0,1,2,0,1,2\), the six edges go to
	</p>
	\[ [01],\quad [12],\quad [20] = -[02],\quad [01],\quad [12],\quad [02]. \]
	<p>Adding up, with the minus sign on the last term,</p>
	\[ f_\#(z) = [01] + [12] - [02] + [01] + [12] - [02] = 2\bigl([01] + [12] - [02]\bigr) = 2\,z', \]
	<p>where \(z' = [01] + [12] - [02]\) is the loop once around the triangle. The algebra has counted the winding for us.</p>
</Example>

<Figure num="3.5.1" title="Wrapping a hexagon around a triangle" hint="Click a vertex to change its image · hover an edge or a matrix column">
	<HexagonMap />
	{#snippet caption()}
		A simplicial map from the hexagon \(K\) to the hollow triangle \(L\). Each hexagon vertex is labelled with the triangle vertex it goes to. Gold edges step forwards around the triangle, rose edges step backwards, and dashed edges are squashed to a point (so \(f_\#\) sends them to \(0\)). The bead shows the map in motion. On homology, \(f_*\) is multiplication by the net number of turns. Try “There and back”: the forward and backward steps cancel, and the image cycle is zero.
	{/snippet}
</Figure>

<Question>
	<p>
		Can you label the hexagon so that \(f_\#(z) = 3z'\)? And can you make \(f_\#(z) = 0\) while squashing <em>no</em> edge? Answer: going three times around the triangle takes nine forward steps, but the hexagon only has six edges, so with this \(K\) the winding number lies between \(-2\) and \(2\). The labels \(0,1,0,1,0,1\) squash nothing and give \(f_\#(z) = 3[01] - 3[01] = 0\): the band just slides back and forth along one edge.
	</p>
</Question>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="induced-maps">Chain maps and induced maps</h2>

<p>
	The chain map \(f_\#\) moves chains. Homology, however, is built from <em>cycles</em> modulo <em>boundaries</em>. For \(f_\#\) to move homology classes too, it must send cycles to cycles and boundaries to boundaries. Both facts follow from one innocent-looking identity: <strong>\(f_\#\) commutes with \(\partial\)</strong>. Taking the boundary and then applying \(f\) gives the same chain as applying \(f\) and then taking the boundary.
</p>

<p>
	Check it on one edge \(e = [v_0 v_1]\). Boundary first: \(\partial e = v_1 - v_0\), and then \(f_\#(v_1 - v_0) = f(v_1) - f(v_0)\). Map first: if \(f(v_0)\) comes before \(f(v_1)\), then \(f_\#e = [f(v_0) f(v_1)]\), whose boundary is \(f(v_1) - f(v_0)\). If they come the other way round, \(f_\# e = -[f(v_1) f(v_0)]\), whose boundary is \(-(f(v_0) - f(v_1)) = f(v_1) - f(v_0)\). Same answer either way. Finally, if the edge is squashed, so that \(f(v_0) = f(v_1)\), then \(f_\#e = 0\) has boundary \(0\), while \(f_\#(\partial e) = f(v_1) - f(v_0) = 0\) as well. That last line is exactly why squashed simplices must go to \(0\) and not to anything else.
</p>

<Lemma id="lemma-commutes">
	{#snippet head()}Simplicial maps commute with \(\partial\){/snippet}
	<p>For a simplicial map \(f\colon K\to L\) and every \(k\): \(\;\partial_k \circ f_\# = f_\# \circ \partial_k\) as maps \(C_k(K) \to C_{k-1}(L)\).</p>
</Lemma>

<Proof>
	<p>
		It suffices to check one oriented simplex \(\sigma = [v_0,\dots,v_k]\). If the images \(f(v_i)\) are all different, \(f\) just renames the vertices, and the boundary formula \(\partial\sigma = \sum_i (-1)^i [v_0,\dots,\widehat{v_i},\dots,v_k]\) is renamed with it. (If renaming spoils the order, re-sorting multiplies \(\sigma\) and all of its faces consistently by the same sign.)
	</p>
	<p>
		Now suppose two images coincide, \(f(v_i) = f(v_j)\) with \(i \lt j\). Then \(f_\#\sigma = 0\), so we must show \(f_\#(\partial\sigma) = 0\). Every face that keeps both \(v_i\) and \(v_j\) is squashed too, so it goes to \(0\). Only the two faces that drop \(v_i\) or drop \(v_j\) survive. They have the same image vertices, listed in two orders that differ by moving one vertex across \(j-1-i\) others. That move costs \(j-1-i\) swaps, so the images are equal up to the sign \((-1)^{j-1-i}\). Together with their boundary signs \((-1)^i\) and \((-1)^j\), the two terms are \((-1)^i(-1)^{j-1-i}\tau + (-1)^j\tau = \bigl((-1)^{j-1} + (-1)^j\bigr)\tau = 0\). (If even more vertices coincide, both of those faces are squashed as well, and everything is \(0\).)
	</p>
</Proof>

<p>This property deserves a name of its own, because it is exactly what makes a map between chain groups useful for homology.</p>

<Definition id="def-chain-map">
	{#snippet head()}Chain map{/snippet}
	<p>
		Let \(C_\bullet\) and \(C'_\bullet\) be <Term t="chain-complex">chain complexes</Term>. A <dfn>chain map</dfn> \(\varphi\colon C_\bullet \to C'_\bullet\) is a homomorphism \(\varphi_k\colon C_k \to C'_k\) for every \(k\), such that
	</p>
	\[ \partial'_k \circ \varphi_k = \varphi_{k-1} \circ \partial_k \quad\text{for every } k. \]
</Definition>

<p>
	The bullet in \(C_\bullet\) is a placeholder meaning “the whole sequence of groups \(C_0, C_1, C_2, \dots\) together with its boundary maps”. It is easiest to <em>see</em> a chain map as a ladder. The two chain complexes are the rails, the maps \(\varphi_k\) are the rungs, and the condition says that in every square of the ladder the two routes from the top-left corner to the bottom-right corner agree. Mathematicians call such a diagram <dfn>commutative</dfn>. That has nothing to do with \(ab = ba\); it means “all routes give the same result”.
</p>

<Figure num="3.5.2" title="A chain map is a ladder" hint="Hover a square">
	<ChainLadder />
	{#snippet caption()}
		The chain map \(f_\#\) joins the chain complex of \(K\) (top) to that of \(L\) (bottom). In each square, going across and then down (gold) equals going down and then across (teal): \(\partial \circ f_\# = f_\# \circ \partial\).
	{/snippet}
</Figure>

<Lemma id="lemma-cycles-to-cycles">
	{#snippet head()}Chain maps respect cycles and boundaries{/snippet}
	<p>A chain map sends cycles to cycles and boundaries to boundaries.</p>
</Lemma>

<Proof>
	<p>
		If \(z\) is a cycle, \(\partial z = 0\), then \(\partial(\varphi z) = \varphi(\partial z) = \varphi(0) = 0\), so \(\varphi z\) is a cycle. If \(b\) is a boundary, \(b = \partial c\), then \(\varphi b = \varphi(\partial c) = \partial(\varphi c)\) is the boundary of the chain \(\varphi c\).
	</p>
</Proof>

<Definition id="def-induced-map">
	{#snippet head()}The induced homomorphism \(f_*\){/snippet}
	<p>For a chain map \(\varphi\) (for instance \(\varphi = f_\#\)), define \(\varphi_*\colon H_k(C) \to H_k(C')\) by</p>
	\[ \varphi_*[z] = [\varphi z]. \]
	<p>For a map of spaces \(f\) we write \(f_*\) for \((f_\#)_*\) and call it the homomorphism <dfn>induced</dfn> by \(f\).</p>
</Definition>

<p>
	We must check that this is <Term t="well-defined">well defined</Term>: a homology class \([z]\) has many representatives, and the answer must not depend on which one we use. If \([z] = [z']\), then \(z - z' = \partial c\) for some chain \(c\). Applying \(\varphi\) gives \(\varphi z - \varphi z' = \varphi(\partial c) = \partial(\varphi c)\), a boundary, so \([\varphi z] = [\varphi z']\). It is a homomorphism because \(\varphi\) is additive. So the hexagon example says precisely this:
</p>
\[ f_*\colon H_1(K) \cong \Z \;\longrightarrow\; H_1(L) \cong \Z, \qquad [z] \longmapsto 2[z'], \]
<p>
	that is, <strong>multiplication by \(2\)</strong>. The rubber band wound twice has become the number \(2\). In degree \(0\) the same map sends the class of a vertex \([v]\) to \([f(v)]\). Both complexes are connected, so that is the identity \(\Z \to \Z\).
</p>

<h3>Functoriality</h3>

<p>Two more facts are so easy to prove that it is easy to miss how much they say.</p>

<Theorem id="thm-functoriality" label="Theorem (functoriality)">
	<p>For maps \(f\colon K \to L\) and \(g\colon L \to M\),</p>
	\[ (g\circ f)_* = g_* \circ f_* \qquad\text{and}\qquad (\id_K)_* = \id_{H_k(K)}. \]
</Theorem>

<Proof>
	<p>
		On chains, \((g\circ f)_\# = g_\# \circ f_\#\): both apply \(f\) and then \(g\) to the vertices of a simplex. If either step squashes the simplex, both sides give \(0\). Otherwise the sorting signs multiply, because sorting in two stages is the same as sorting once. The identity map renames nothing, so \((\id)_\# = \id\). Now pass to homology classes: \((g\circ f)_*[z] = [g_\# f_\# z] = g_*\bigl(f_*[z]\bigr)\).
	</p>
</Proof>

<KeyIdea>
	<p>
		Homology turns <strong>spaces into groups</strong> and <strong>maps into homomorphisms</strong>, and it respects composition and identities. Mathematicians call a translation with these properties a <dfn>functor</dfn>; <Ref to="big-picture/categories" /> makes the word precise. Think of a camera that photographs not only objects but also movements, and never garbles the order of the movements. A question about continuous maps can now be translated into a question about homomorphisms of abelian groups — where it can often be settled by arithmetic.
	</p>
</KeyIdea>

<Corollary id="cor-iso">
	{#snippet head()}Isomorphic shapes, isomorphic homology{/snippet}
	<p>If \(f\colon K \to L\) has an inverse simplicial map \(g\), then \(f_*\colon H_k(K)\to H_k(L)\) is an isomorphism for every \(k\).</p>
</Corollary>

<Proof>
	<p>\(g_*\circ f_* = (g\circ f)_* = (\id_K)_* = \id\), and in the same way \(f_*\circ g_* = \id\). So \(g_*\) is an inverse for \(f_*\).</p>
</Proof>

<Warning>
	<p>
		The induced map remembers a lot, but not everything. Different maps can induce the same homomorphism: “there and back” and the constant map both induce \(0\) on \(H_1\). And \(f_*\) can be an isomorphism without \(f\) being anything like a homeomorphism: the inclusion of a circle into an annulus induces isomorphisms on all homology groups.
	</p>
</Warning>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="singular-homology">Singular homology: any space, any map</h2>

<p>
	There is a weakness in everything so far. Simplicial maps are rare. A typical continuous map between two triangulated spaces sends vertices to points that are not vertices, and edges to wiggly curves crossing many triangles. Worse, our homology groups were defined from a <em>chosen</em> triangulation. We have checked by example that different triangulations of the torus give the same groups, but we have not proved that they always will. What we want is a version of homology that
</p>
<ol>
	<li>is defined for <em>every</em> space, with no triangulation chosen;</li>
	<li>lets <em>every</em> continuous map induce homomorphisms, functorially;</li>
	<li>agrees with everything we have already computed.</li>
</ol>
<p>Singular homology does all three. The price is that it is gigantic.</p>

<p>
	Recall the standard \(n\)-simplex \(\Delta^n\): the point for \(n = 0\), a segment for \(n = 1\), a filled triangle for \(n = 2\), a solid tetrahedron for \(n = 3\), with vertices labelled \(e_0, \dots, e_n\).
</p>

<Definition id="def-singular">
	{#snippet head()}Singular simplices and singular homology{/snippet}
	<p>
		A <dfn>singular \(n\)-simplex</dfn> in a space \(X\) is any continuous map \(\sigma\colon \Delta^n \to X\). The group of <dfn>singular \(n\)-chains</dfn> \(C_n(X)\) consists of finite formal sums \(\sum_i n_i\sigma_i\) with integer coefficients. The boundary of a singular simplex is the alternating sum of its restrictions to the faces of \(\Delta^n\):
	</p>
	\[ \partial\sigma = \sum_{i=0}^{n} (-1)^i\, \sigma\big|_{[e_0,\dots,\widehat{e_i},\dots,e_n]}. \]
	<p>
		Here each face is identified with \(\Delta^{n-1}\) by keeping its vertices in order. The same cancellation as in <Ref to="homology/chains" /> gives \(\partial\circ\partial = 0\), and the <dfn>singular homology</dfn> of \(X\) is \(H_n(X) = \ker\partial_n / \im\partial_{n+1}\).
	</p>
</Definition>

<p>
	Why “singular”? In Hatcher's words, the word is “used here to express the idea that σ need not be a nice embedding but can have ‘singularities’ where its image does not look at all like a simplex.” A singular triangle can be crumpled, folded onto a curve, or collapsed to a single point. All that is required is continuity.
</p>

<p>
	This definition is enormous. A singular \(1\)-simplex in the circle is <em>any</em> continuous path \([0,1] \to S^1\), and there are uncountably many of them, so \(C_1(S^1)\) is a free abelian group with uncountably many generators. Nobody computes singular homology straight from the definition. Its virtue is theoretical. Functoriality is now automatic: a map \(f\colon X\to Y\) acts on singular simplices simply by composition, \(f_\#(\sigma) = f\circ\sigma\). No exceptions are needed for squashed simplices, because a squashed singular simplex is still a singular simplex. And \(f_\#\) commutes with \(\partial\) because restricting to a face commutes with composing with \(f\).
</p>

<Theorem id="thm-singular-simplicial" label="Theorem (simplicial = singular)">
	<p>
		If \(X\) is the geometric realization of a simplicial complex \(K\), then the simplicial homology of \(K\) is isomorphic to the singular homology of \(X\): \(H_n^{\Delta}(K) \cong H_n(X)\) for all \(n\). In particular, any two triangulations of the same space have isomorphic homology.
	</p>
</Theorem>

<p>
	We will not prove this. The proof is not deep, but it is long; it is Theorem 2.27 in Hatcher's <em>Algebraic Topology</em>, and it uses the tools of the next chapter. Its practical meaning is the important thing. From now on, \(H_n(X)\) means singular homology, a property of the space \(X\) alone, and we may <em>compute</em> it from any triangulation we like, as in <Ref to="homology/computing" />, or from a cell structure, as in <Ref to="homology/exact-sequences" />.
</p>

<Example title="Two computations straight from the definition">
	<p>
		<strong>\(H_0\) counts path components.</strong> A singular \(0\)-simplex is just a point of \(X\). A singular \(1\)-simplex is a path \(\gamma\), and \(\partial\gamma = \gamma(1) - \gamma(0)\). So two points are homologous exactly when some path joins them, and \(H_0(X)\) is the free abelian group with one generator for each path component of \(X\).
	</p>
	<p>
		<strong>The homology of a point.</strong> If \(X\) is a single point, there is exactly one singular \(n\)-simplex \(\sigma_n\) in every dimension: the constant map. Its boundary has \(n+1\) terms, all equal to \(\sigma_{n-1}\), with alternating signs. They cancel completely when \(n\) is odd and leave one copy when \(n\) is even (and \(n \gt 0\)). So the chain complex is
	</p>
	\[ \cdots \xrightarrow{\ \cong\ } \Z \xrightarrow{\ 0\ } \Z \xrightarrow{\ \cong\ } \Z \xrightarrow{\ 0\ } \Z \to 0, \]
	<p>
		with \(\Z\) in every degree and the maps alternating between “isomorphism” and “zero”. Every group except the last is killed: \(H_0(\text{point}) = \Z\) and \(H_n(\text{point}) = 0\) for \(n \gt 0\). In reduced homology (<Ref to="homology/homology-groups" />) a point has nothing at all: \(\tilde H_n(\text{point}) = 0\) for every \(n\).
	</p>
</Example>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="homotopy-invariance">Homotopy invariance</h2>

<p>
	Recall from <Ref to="topology/homotopy" /> that two maps \(f, g\colon X \to Y\) are <Term t="homotopy">homotopic</Term>, written \(f\simeq g\), if one can be continuously deformed into the other. Formally, there is a continuous \(H\colon X \times [0,1] \to Y\) with \(H(x,0) = f(x)\) and \(H(x,1) = g(x)\). Think of \(H\) as a <em>movie of maps</em>: frame \(t\) is the map \(x \mapsto H(x,t)\), the movie starts at \(f\) and ends at \(g\).
</p>

<Theorem id="thm-homotopy-invariance" label="Theorem (homotopy invariance)">
	<p>If \(f \simeq g\colon X\to Y\), then \(f_* = g_*\colon H_n(X) \to H_n(Y)\) for every \(n\).</p>
</Theorem>

<p>
	Here is the idea. Take a cycle \(z\) in \(X\) — picture a loop. Under \(f\) it becomes the loop \(f_\#(z)\), and under \(g\) the loop \(g_\#(z)\). As the movie plays, the loop slides from one to the other and sweeps out a tube. That tube is a \(2\)-chain; call it \(P(z)\). The boundary of a tube is its two ends, so
</p>
\[ \partial P(z) = g_\#(z) - f_\#(z). \]
<p>The two image cycles differ by a boundary. They are homologous, so \(f_*[z] = g_*[z]\).</p>

<Figure num="3.5.3" title="A homotopy sweeps out a prism" hint="Drag to rotate · move the time slider">
	<PrismSweep />
	{#snippet caption()}
		A loop on a torus slides and ripples along a homotopy. The swept band (violet) is the chain \(P(z)\). Its boundary is the final loop \(g_\#(z)\) (teal) minus the initial loop \(f_\#(z)\) (gold), so the two loops are homologous.
	{/snippet}
</Figure>

<p>
	To turn this into a proof we must say exactly which chain the tube is, and handle chains that are not cycles, whose tubes also have <em>sides</em>. Take a single singular \(n\)-simplex \(\sigma\). The homotopy sweeps it into a <dfn>prism</dfn>: the map \(\Delta^n \times [0,1] \to Y\), \((p,t)\mapsto H(\sigma(p),t)\). A prism is not a simplex, but it can be cut into \(n+1\) simplices of dimension \(n+1\). Call the bottom vertices \(v_0,\dots,v_n\) and the top ones \(w_0,\dots,w_n\); then
</p>
\[ P(\sigma) = \sum_{i=0}^{n} (-1)^i\, \bigl[v_0,\dots,v_i,\,w_i,\dots,w_n\bigr] \]
<p>
	(each bracket stands for the restriction of the prism map to that simplex). For an edge, \(n = 1\), this is the square cut along a diagonal into two triangles. Computing the boundary carefully gives the formula at the heart of the proof:
</p>
\[ \partial P(\sigma) \;=\; g_\#\sigma \;-\; f_\#\sigma \;-\; P(\partial\sigma). \]
<p>In words: the boundary of a prism is its top, minus its bottom, minus the prisms over its own boundary (the sides).</p>

<Figure num="3.5.4" title="The prism operator, step by step" hint="Use the arrows or press play">
	<PrismDiagram />
	{#snippet caption()}
		Above an edge \(\sigma\), the prism is a square cut into two triangles. With their signs, both circulate the same way, so the diagonal they share cancels. What is left is top \(-\) bottom \(-\) sides. Above a cycle \(z\) the prisms form an annulus, and each side is shared by two neighbouring prisms with opposite signs. Only the two rims survive: \(\partial P(z) = g_\#z - f_\#z\).
	{/snippet}
</Figure>

<p>Rearranged, the prism formula says \(\partial P + P\partial = g_\# - f_\#\). Relations of this shape come up again and again, so they have a name.</p>

<Definition id="def-chain-homotopy">
	{#snippet head()}Chain homotopy{/snippet}
	<p>
		Two chain maps \(\varphi, \psi\colon C_\bullet \to C'_\bullet\) are <dfn>chain homotopic</dfn> if there are homomorphisms \(P\colon C_n \to C'_{n+1}\) (one for each \(n\)) with
	</p>
	\[ \partial P + P\partial = \psi - \varphi. \]
	<p>The maps \(P\) are a <dfn>chain homotopy</dfn>; the prism construction is the example that names it.</p>
</Definition>

<Lemma id="lemma-chain-homotopic">
	{#snippet head()}Chain homotopic maps agree on homology{/snippet}
	<p>If \(\varphi\) and \(\psi\) are chain homotopic, then \(\varphi_* = \psi_*\).</p>
</Lemma>

<Proof>
	<p>
		Let \(z\) be a cycle. Then \(\psi z - \varphi z = \partial(Pz) + P(\partial z) = \partial(Pz) + P(0) = \partial(Pz)\). The two images differ by a boundary, so \([\psi z] = [\varphi z]\). Applying this with \(\varphi = f_\#\), \(\psi = g_\#\) and the prism operator proves the theorem.
	</p>
</Proof>

<p>The most important consequence needs one more definition from <Ref to="topology/homotopy" />.</p>

<Corollary id="cor-he">
	{#snippet head()}Homotopy equivalent spaces have isomorphic homology{/snippet}
	<p>If \(f\colon X \to Y\) is a <Term t="homotopy-equivalence">homotopy equivalence</Term>, then \(f_*\colon H_n(X) \to H_n(Y)\) is an isomorphism for every \(n\).</p>
</Corollary>

<Proof>
	<p>
		By definition there is a map \(g\colon Y\to X\) with \(g\circ f\simeq \id_X\) and \(f\circ g \simeq \id_Y\). By functoriality and homotopy invariance, \(g_*\circ f_* = (g\circ f)_* = (\id_X)_* = \id\), and likewise \(f_*\circ g_* = \id\). So \(f_*\) has an inverse.
	</p>
</Proof>

<Example title="Homology for free">
	<ul>
		<li><strong>Contractible spaces</strong> — a disk, a solid ball, all of \(\R^n\), a tree, a cone — are homotopy equivalent to a point, so their homology is \(\Z\) in degree \(0\) and \(0\) elsewhere. Every reduced group vanishes.</li>
		<li>The <strong>annulus</strong> and the <strong>Möbius band</strong> deformation retract onto their core circles, so both have \(H_0 \cong H_1 \cong \Z\) and nothing else.</li>
		<li>The <strong>punctured torus</strong> (a torus with a small disk removed) deformation retracts onto the wedge of two circles \(a\vee b\), so \(H_1 \cong \Z^2\) and \(H_2 = 0\). The torus itself had \(H_2\cong\Z\); punching the hole destroyed it.</li>
		<li>\(\R^n\setminus\{0\}\) deformation retracts onto the unit sphere \(S^{n-1}\) (slide each point along its ray), so it has the homology of \(S^{n-1}\). We will use this in Section 6.</li>
	</ul>
</Example>

<KeyIdea>
	<p>
		A <Term t="homeomorphism">homeomorphism</Term> is in particular a homotopy equivalence. So <strong>homeomorphic spaces have isomorphic homology groups</strong>: Betti numbers and torsion are properties of the space itself, not of the way we chose to cut it into triangles. This is the promise the book made back in <Ref to="homology/cycles-and-boundaries" />, now kept.
	</p>
</KeyIdea>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="brouwer">First triumph: Brouwer's fixed point theorem</h2>

<h3>Spheres are not contractible</h3>

<p>
	In <Ref to="homology/homology-groups" /> we computed that the hollow tetrahedron, a triangulated \(2\)-sphere, has \(H_2 \cong \Z\). The same computation for the boundary of an \((n+1)\)-simplex shows that \(\tilde H_n(S^n) \cong \Z\) and \(\tilde H_k(S^n) = 0\) for \(k \ne n\), for every \(n \ge 0\). (We will recompute this more cleverly in the next chapter.) The closed disk \(D^n\), on the other hand, is contractible, so all its reduced homology groups vanish. Homotopy invariance immediately gives:
</p>

<Corollary id="cor-spheres">
	{#snippet head()}Spheres are genuinely different{/snippet}
	<p>\(S^n\) is not contractible, and \(S^n\) is not homotopy equivalent to \(S^m\) when \(m\neq n\).</p>
</Corollary>

<p>
	These sound obvious. But try proving even the first one for \(S^2\) with bare hands: you would have to rule out every conceivable continuous way of shrinking the sphere to a point. Homology turns “every conceivable deformation” into one algebraic fact, \(\Z \neq 0\). (And the obvious-sounding \(S^2\) case is genuinely subtle: every <em>loop</em> on \(S^2\) can be shrunk, so the fundamental group cannot tell \(S^2\) from a point. We need \(H_2\).)
</p>

<h3>You cannot pull a drumskin onto its rim</h3>

<Definition id="def-retraction">
	{#snippet head()}Retraction{/snippet}
	<p>
		If \(A\) is a subspace of \(X\), a <dfn>retraction</dfn> of \(X\) onto \(A\) is a continuous map \(r\colon X\to A\) that fixes every point of \(A\): \(r(a) = a\) for all \(a\in A\). Equivalently \(r\circ i = \id_A\), where \(i\colon A \to X\) is the inclusion.
	</p>
</Definition>

<Theorem id="thm-no-retraction" label="Theorem (no retraction)">
	<p>There is no retraction of the disk \(D^n\) onto its boundary sphere \(S^{n-1}\).</p>
</Theorem>

<Proof>
	<p>Suppose \(r\colon D^n\to S^{n-1}\) were a retraction. Then the composite</p>
	\[ S^{n-1} \xrightarrow{\;i\;} D^n \xrightarrow{\;r\;} S^{n-1} \]
	<p>is the identity. Apply reduced homology in degree \(n-1\). By functoriality we get</p>
	\[ \underbrace{\tilde H_{n-1}(S^{n-1})}_{\cong\,\Z} \xrightarrow{\;i_*\;} \underbrace{\tilde H_{n-1}(D^n)}_{=\,0} \xrightarrow{\;r_*\;} \underbrace{\tilde H_{n-1}(S^{n-1})}_{\cong\,\Z}, \]
	<p>
		and the composite \(r_*\circ i_* = (r\circ i)_* = \id\) must be the identity of \(\Z\). But it passes through the zero group, so it sends everything to \(0\). The identity of \(\Z\) is not the zero map. This contradiction shows that \(r\) cannot exist.
	</p>
</Proof>

<Intuition>
	<p>
		Think of a drumskin stretched over its rim. A retraction would have to keep the rim fixed and move every point of the skin out onto the rim, continuously. Somewhere the skin would have to tear. For \(n = 1\) this is something you already believe: \(D^1\) is the interval \([-1,1]\), its “boundary sphere” \(S^0\) is the two endpoints, and a continuous map from an interval onto two points that fixes both ends would have to jump. Homology makes the same argument work in every dimension.
	</p>
</Intuition>

<h3>Brouwer's theorem</h3>

<Theorem id="thm-brouwer" label="Theorem (Brouwer's fixed point theorem)">
	<p>Every continuous map \(f\colon D^n \to D^n\) has a <dfn>fixed point</dfn>: a point \(x\) with \(f(x) = x\).</p>
</Theorem>

<Proof>
	<p>
		Suppose, for contradiction, that \(f(x)\neq x\) for every \(x\). Then for each \(x\) there is a well-defined ray that starts at \(f(x)\) and passes through \(x\). Follow it until it leaves the disk, and call the exit point \(r(x)\). Three facts:
	</p>
	<ul>
		<li><strong>\(r(x)\) lies on the boundary sphere</strong>, by construction.</li>
		<li>
			<strong>\(r\) is continuous.</strong> Write \(u(x) = \dfrac{x - f(x)}{\abs{x - f(x)}}\) for the unit direction of the ray. It is continuous because \(f\) is and the denominator is never \(0\). The exit point is \(r(x) = x + t(x)\,u(x)\), where \(t(x) \ge 0\) solves \(\abs{x + t\,u}^2 = 1\). Explicitly,
			\(t(x) = -x\cdot u + \sqrt{(x\cdot u)^2 + 1 - \abs{x}^2}\), a continuous formula.
		</li>
		<li><strong>\(r\) fixes the boundary.</strong> If \(x\) is already on the sphere, the ray from \(f(x)\), which lies in the disk, leaves the disk exactly at \(x\). So \(r(x) = x\).</li>
	</ul>
	<p>So \(r\) is a retraction of \(D^n\) onto \(S^{n-1}\), which the previous theorem says cannot exist. Therefore \(f\) has a fixed point.</p>
</Proof>

<Figure num="3.5.5" title="Stirring a disk" hint="Drag the gold handle · move the sliders · try the retraction view">
	<BrouwerStir />
	{#snippet caption()}
		A “stirring” map of the disk: swirl it, squeeze it, and slide its centre to the gold handle. Each point is coloured by the <em>direction</em> it moves (arrows), and darkened where it barely moves. Going once around the rim, the colours run once through the whole wheel, so somewhere inside they must all meet — at a fixed point (glowing). With strong stirring several fixed points appear, but their indices always add up to \(1\). Turn on the retraction view: the rays from \(f(x)\) through \(x\) push the disk onto its rim, and near a fixed point they spin in every direction. That is where the would-be retraction tears.
	{/snippet}
</Figure>

<p>
	The colouring in Figure 3.5.5 is itself a proof, in two dimensions, using the <em>degree</em> we meet in Section 7. If \(f\) had no fixed point, the direction of \(f(x) - x\) would be a continuous map from the whole disk to the circle of directions. Restricted to any small loop, it would wind zero times. On the rim it winds once, because \(f(x)\) lies inside the disk, so \(f(x) - x\) always points “inwards”. Shrinking the rim continuously to a tiny loop cannot change a winding number. Contradiction.
</p>

<Example title="Coffee, and a crumpled map">
	<p>
		<strong>Coffee.</strong> Idealize the coffee in your cup as a solid ball of liquid that moves continuously and stays in the cup. Comparing where each drop started with where it ends up, after any amount of stirring, gives a continuous map \(D^3 \to D^3\). By Brouwer, some drop is exactly where it began. (Real coffee is made of molecules and can splash, so this is a theorem about the idealization. It is still a striking one.)
	</p>
	<p>
		<strong>The crumpled map.</strong> Take a map of the room you are in, crumple it, and drop it on the floor. For each point \(p\) of the paper, look straight down to find the spot of the floor it lies above. Then find the point of the map that <em>depicts</em> that spot. This gives a continuous function from the sheet of paper to itself. The paper is a rectangle, which is homeomorphic to a disk, so Brouwer applies: some point of the map lies exactly above the spot it depicts.
	</p>
</Example>

<Warning title="What Brouwer does not say">
	<ul>
		<li>It does not tell you <em>where</em> the fixed point is, or how to find it. The proof is by contradiction.</li>
		<li>It needs <strong>continuity</strong>. Cut the disk in half and swap the halves: no point stays put, but the map tears.</li>
		<li>It needs the <strong>disk</strong>, or a space homeomorphic to it (a square, a triangle, a solid cube). Rotating an annulus or a circle fixes nothing. On the <em>open</em> disk, the map \(x \mapsto \tfrac12(x + e_1)\) pulls everything halfway towards the boundary point \(e_1 = (1,0,\dots,0)\); its only candidate fixed point is \(e_1\) itself, which is not in the open disk.</li>
	</ul>
</Warning>

<History>
	<p>
		L. E. J. Brouwer proved the fixed point theorem, together with the invariance of dimension and the theory of degree we meet below, in a burst of papers around 1910–1912. There is an irony here. Brouwer later championed <em>intuitionism</em>, a philosophy of mathematics that rejects proofs of existence that do not show how to find the object — exactly the kind of proof given above.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="dimension-and-jordan">The shape of \(\R^n\): dimension and the Jordan curve</h2>

<h3>Is dimension a topological property?</h3>

<p>
	Surely a line, a plane and space are different shapes? As <em>sets</em> they are not: in 1877 Georg Cantor found a one-to-one correspondence between the points of a segment and the points of a square. Continuity does not obviously save us either: in 1890 Giuseppe Peano constructed a continuous curve that passes through every point of a filled square, a space-filling curve. So counting coordinates is not obviously a topological invariant. Could some cleverer map be continuous in both directions?
</p>

<Theorem id="thm-invariance-dimension" label="Theorem (invariance of dimension)">
	<p>If \(\R^m\) and \(\R^n\) are homeomorphic, then \(m = n\).</p>
</Theorem>

<Proof>
	<p>
		If one of \(m, n\) is \(0\), then that space is a single point, and the other must be too. So suppose \(m,n\geq 1\) and let \(h\colon \R^m \to \R^n\) be a homeomorphism. Remove a point: \(h\) restricts to a homeomorphism \(\R^m\setminus\{0\} \to \R^n\setminus\{h(0)\}\). By the examples of Section 4 these spaces are homotopy equivalent to \(S^{m-1}\) and \(S^{n-1}\). So \(S^{m-1}\) and \(S^{n-1}\) are homotopy equivalent, and their reduced homology groups agree in every degree. In degree \(m-1\) the first is \(\Z\), and the second is nonzero only in degree \(n-1\). Hence \(m-1 = n-1\).
	</p>
</Proof>

<Figure num="3.5.6" title="Puncture a line, a plane, a space">
	<DimensionPunctures />
	{#snippet caption()}
		Removing a point from \(\R^n\) leaves something that shrinks onto a small sphere \(S^{n-1}\) around the puncture: two points for a line, a circle for a plane, a \(2\)-sphere for space. Homology sees the dimension of that sphere, and hence the dimension of the space.
	{/snippet}
</Figure>

<Remark title="Local versions">
	<p>
		The same idea, applied near a single point, shows that a nonempty open subset of \(\R^m\) can only be homeomorphic to an open subset of \(\R^n\) if \(m = n\). This uses the <em>local homology</em> groups \(H_k(U, U\setminus\{x\})\), defined in the next chapter, which equal \(\Z\) exactly when \(k = m\). It is what makes the <em>dimension of a manifold</em> (<Ref to="topology/manifolds" />) well defined. A deeper cousin is Brouwer's <dfn>invariance of domain</dfn>: a continuous one-to-one map from an open subset of \(\R^n\) to \(\R^n\) has open image. One consequence: a continuous bijection \(\R^n \to \R^n\) automatically has a continuous inverse.
	</p>
</Remark>

<h3>The Jordan curve theorem</h3>

<Theorem id="thm-jordan" label="Theorem (Jordan curve theorem)">
	<p>
		Every simple closed curve \(C\) in the plane — a subset homeomorphic to a circle — separates the plane into exactly two connected pieces: a bounded “inside” and an unbounded “outside”. The curve is the boundary of each piece.
	</p>
</Theorem>

<p>
	For a circle or a triangle this is obvious. But a simple closed curve can be fractal like the Koch snowflake, nowhere smooth, or so wiggly that it has positive area. The statement is easy to believe and slippery to prove. Camille Jordan stated and proved it in 1887, but his proof was long considered incomplete, and Oswald Veblen's proof of 1905 is often credited as the first rigorous one. Homology gives a clean proof. It shows that for any embedded circle \(C\) in the sphere \(S^2\) (the plane plus one point at infinity),
</p>
\[ \tilde H_0\bigl(S^2\setminus C\bigr) \cong \Z, \]
<p>
	which says exactly “two path components”. The proof (Hatcher, Proposition 2B.1) chops the curve into smaller and smaller arcs and applies the Mayer–Vietoris sequence of the next chapter at each step. We will not reproduce it, but the tool it needs will be fully explained there.
</p>

<Figure num="3.5.7" title="Inside or outside?" hint="Drag the probe (or use arrow keys)">
	<JordanProbe />
	{#snippet caption()}
		A Jordan curve shaped like a serpent. Is the probe inside? Count where the dashed ray to the right crosses the curve: odd means inside, even means outside. The <Term t="winding-number">winding number</Term> of the curve around the probe — how many times the curve turns around it — is \(\pm 1\) inside and \(0\) outside. It is the degree of a map of circles (Section 7), so it cannot change while the probe moves without touching the curve.
	{/snippet}
</Figure>

<p>
	In higher dimensions the separation part survives: an embedded \((n-1)\)-sphere in \(S^n\) splits it into exactly two pieces (the Jordan–Brouwer separation theorem, proved the same way). The rest can fail. In 1924 J. W. Alexander built a wildly tangled “horned sphere” in \(\R^3\) whose outside is not simply connected: a loop there can be caught on the horns and never pulled free.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="degree">Degree: how many times does a sphere wrap?</h2>

<p>
	The hexagon map multiplied \(H_1\) by \(2\) because it wrapped one circle twice around another. For maps from a sphere to itself, this number is always there, waiting to be read off.
</p>

<Definition id="def-degree">
	{#snippet head()}Degree{/snippet}
	<p>
		Let \(f\colon S^n\to S^n\) be continuous, with \(n\ge 1\). The induced map \(f_*\colon H_n(S^n)\to H_n(S^n)\) is a homomorphism \(\Z \to \Z\), so it is multiplication by a single integer \(d\). This integer is the <dfn>degree</dfn> of \(f\), written \(\deg f\).
	</p>
</Definition>

<p>
	Why must a homomorphism \(\varphi\colon\Z\to\Z\) be “multiplication by \(d\)”? Because \(\varphi(k) = \varphi(1 + 1 + \dots + 1) = \varphi(1) + \dots + \varphi(1) = k\,\varphi(1)\) for \(k\) positive (and similarly for negative \(k\)). So \(d = \varphi(1)\). The degree is just “where the generator goes”.
</p>

<p>
	For \(n = 1\), the degree is the <strong>winding number</strong> of <Ref to="topology/homotopy" />. Think of \(S^1\) as the unit complex numbers. The map \(z\mapsto z^k\) multiplies angles by \(k\), so it wraps the circle \(k\) times around itself and has degree \(k\); for \(k = -1\) it runs once around backwards. The hexagon map with labels \(0,1,2,0,1,2\) is a combinatorial version of \(z \mapsto z^2\).
</p>

<p>
	There is also a way to <em>count</em> the degree. Pick a point \(y\) of the target sphere and look at all the points \(x\) that land on it — the preimages \(f^{-1}(y)\). For a reasonably nice (smooth) map and a typical \(y\), there are finitely many. Near each one, \(f\) either preserves orientation (\(+1\)) or reverses it (\(-1\)), and
</p>
\[ \deg f = \sum_{x\in f^{-1}(y)} \pm 1. \]
<p>
	The individual preimages come and go as \(y\) moves, but the signed count never changes. Milnor's little book <em>Topology from the Differentiable Viewpoint</em> builds the whole theory from this formula. Figure 3.5.8 lets you watch it happen.
</p>

<Figure num="3.5.8" title="Counting preimages with signs" hint="Drag to rotate · change the degree, the wobble and the target">
	<DegreeHelix />
	{#snippet caption()}
		The graph of \(f(\theta) = n\theta + a\sin\theta\), a map from the circle to the circle, drawn on a glass cylinder. Height is the position on the domain circle; angle is where \(f\) sends it. Its shadow on the blue target circle winds \(n\) times. The white line rises from a target point and meets the graph at every preimage: green where \(f\) runs forwards, rose where it runs backwards. Add wobble and preimages appear in pairs, one of each sign, so the count \(\#(+) - \#(-)\) stays \(n\).
	{/snippet}
</Figure>

<Proposition id="prop-degree">
	{#snippet head()}Properties of degree{/snippet}
	<ol>
		<li>\(\deg(\id) = 1\).</li>
		<li>\(\deg(f\circ g) = \deg f\cdot\deg g\).</li>
		<li>Homotopic maps have the same degree.</li>
		<li>If \(f\) is not surjective, then \(\deg f = 0\).</li>
		<li>A reflection, such as \((x_1,x_2,\dots,x_{n+1})\mapsto(-x_1,x_2,\dots,x_{n+1})\), has degree \(-1\).</li>
		<li>The antipodal map \(a(x) = -x\) has degree \((-1)^{n+1}\).</li>
		<li>If \(f\) has no fixed point, then \(\deg f = (-1)^{n+1}\).</li>
	</ol>
</Proposition>

<Proof>
	<p>
		(1)–(3) are functoriality and homotopy invariance. (4): if \(f\) misses a point \(p\), it factors as \(S^n \to S^n\setminus\{p\}\hookrightarrow S^n\). The middle space is homeomorphic to \(\R^n\) (stereographic projection), which is contractible, so \(f_*\) factors through \(H_n(\R^n) = 0\).
	</p>
	<p>
		(5): build \(S^n\) from two \(n\)-simplices \(\Delta_1, \Delta_2\) — the northern and southern hemispheres — glued along their common boundary. Then \(\Delta_1-\Delta_2\) is a cycle generating \(H_n(S^n)\). A reflection across the equator swaps the hemispheres and sends \(\Delta_1-\Delta_2\) to \(\Delta_2 - \Delta_1\), its negative. Any reflection is conjugate to this one by a rotation, and a rotation is homotopic to the identity, so every reflection has degree \(-1\).
	</p>
	<p>
		(6): the antipodal map flips all \(n+1\) coordinates, so it is a composite of \(n+1\) reflections. By (2) its degree is \((-1)^{n+1}\).
	</p>
	<p>
		(7): if \(f(x)\neq x\) for all \(x\), the formula \(H(x,t) = \dfrac{(1-t)f(x) - t\,x}{\abs{(1-t)f(x) - t\,x}}\) is a homotopy from \(f\) to the antipodal map. The denominator could only vanish if \((1-t)f(x) = t\,x\); taking lengths forces \(t = \tfrac12\) and then \(f(x) = x\), which we excluded. Now apply (3) and (6).
	</p>
</Proof>

<Remark title="A check by computer">
	<p>
		For \(S^2\), property (6) says the antipodal map reverses orientation: degree \(-1\). This book's test suite checks it with nothing but the recipe of Section 1. Triangulate \(S^2\) as an octahedron, with vertices \(\pm e_1,\pm e_2,\pm e_3\). The antipodal map is the simplicial map swapping each vertex with its opposite. Applying \(f_\#\) to the fundamental cycle, the sum of all eight oriented triangles, returns exactly its negative.
	</p>
</Remark>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="hairy-ball">You can't comb a hairy ball</h2>

<p>
	A <dfn>tangent vector field</dfn> on the sphere \(S^n\subset\R^{n+1}\) assigns to each point \(x\) a vector \(v(x)\) that is tangent to the sphere there — perpendicular to \(x\), so \(x\cdot v(x) = 0\) — and varies continuously with \(x\). Picture hair lying flat on a scalp: \(v(x)\) is the direction the hair at \(x\) points. A <em>zero</em> of the field, where \(v(x) = 0\), is a cowlick or a bald spot.
</p>

<Theorem id="thm-hairy-ball" label="Theorem (the hairy ball theorem)">
	<p>\(S^n\) has a continuous tangent vector field that is nowhere zero if and only if \(n\) is odd. In particular, every continuous tangent vector field on the ordinary sphere \(S^2\) vanishes somewhere.</p>
</Theorem>

<Proof>
	<p>
		<strong>Even \(n\): no such field.</strong> Suppose \(v\) is a tangent field with no zeros. Dividing by its length, we may assume \(\abs{v(x)} = 1\) for all \(x\). Define
	</p>
	\[ H(x,t) = \cos(\pi t)\,x + \sin(\pi t)\,v(x). \]
	<p>
		Because \(x\) and \(v(x)\) are perpendicular unit vectors, \(\abs{H(x,t)}^2 = \cos^2(\pi t) + \sin^2(\pi t) = 1\), so \(H(x,t)\) stays on the sphere. At \(t = 0\) it is \(x\), and at \(t = 1\) it is \(-x\). Each point walks half way around a great circle, in the direction its hair points, to its antipode. So the identity is homotopic to the antipodal map, and their degrees agree: \(1 = (-1)^{n+1}\). That forces \(n+1\) to be even, so \(n\) is odd.
	</p>
	<p>
		<strong>Odd \(n\): here is one.</strong> Write \(n + 1 = 2m\) and set \(v(x_1,x_2,\dots,x_{2m-1},x_{2m}) = (-x_2,\,x_1,\,\dots,\,-x_{2m},\,x_{2m-1})\). Then \(x\cdot v(x) = -x_1x_2 + x_2x_1 + \dots = 0\) and \(\abs{v(x)} = \abs{x} = 1\). On \(S^1\) this is the field that pushes every point counterclockwise.
	</p>
</Proof>

<Figure num="3.5.9" title="A hairy ball and a combed doughnut" hint="Drag to rotate · choose a combing">
	<HairyBall />
	{#snippet caption()}
		Tangent vector fields made visible as flowing streaks. However you comb the sphere, a calm spot appears where the field is zero (rose): two for a whirl, two for a north-flowing field, and one — but a doubly strong one — for the cleverest combing. The <em>indices</em> of the zeros always add up to \(2 = \chi(S^2)\), a fact explained in <Ref to="cohomology/characteristic-classes" />. The torus, whose Euler characteristic is \(0\), can be combed with no calm spot at all.
	{/snippet}
</Figure>

<p>
	So a coconut cannot be combed, and at every moment there is somewhere on Earth where the horizontal wind is calm (assuming the wind is a continuous tangent field on a round Earth). A doughnut, on the other hand, can be combed perfectly, as the last option in Figure 3.5.9 shows. Brush every hair around the hole, all in the same direction.
</p>

<h3>A glimpse of Lefschetz's fixed point theorem</h3>

<p>
	Brouwer's theorem and the hairy ball theorem look like cousins: one is about points that do not move, the other about directions that cannot be chosen. They are both shadows of one theorem. For a linear map, the <dfn>trace</dfn> \(\operatorname{tr}\) is the sum of the diagonal entries of its matrix; it does not depend on the basis chosen.
</p>

<Theorem id="thm-lefschetz" label="Theorem (Lefschetz fixed point theorem)">
	<p>
		Let \(X\) be a finite simplicial complex — or, more generally, a retract of one, which includes every compact manifold and every finite cell complex — and let \(f\colon X\to X\) be continuous. Its <dfn>Lefschetz number</dfn> is
	</p>
	\[ \tau(f) = \sum_{n} (-1)^n \operatorname{tr}\bigl(f_*\colon H_n(X;\Q)\to H_n(X;\Q)\bigr). \]
	<p>If \(\tau(f)\neq 0\), then \(f\) has a fixed point.</p>
</Theorem>

<p>
	(We use rational coefficients so that the groups are vector spaces and traces make sense.) Compactness matters: a translation of the line \(\R\) has \(\tau = 1\) and no fixed point. We will not prove the theorem, but its corollaries are worth savouring:
</p>
<ul>
	<li><strong>Contractible \(X\):</strong> only \(H_0 = \Q\) survives, and \(f_*\) is the identity there, so \(\tau(f) = 1 \neq 0\). Every self-map of a contractible finite complex has a fixed point — Brouwer, generalized.</li>
	<li><strong>Spheres:</strong> \(\tau(f) = 1 + (-1)^n\deg f\). So a map of \(S^2\) with no fixed point must have degree \(-1\), matching property (7) above.</li>
	<li><strong>Maps homotopic to the identity:</strong> then \(\tau(f) = \tau(\id) = \sum(-1)^n b_n = \chi(X)\), the Euler characteristic. On any space with \(\chi\neq 0\), every map that can be deformed to the identity has a fixed point.</li>
</ul>

<p>
	The last bullet gives a second proof of the hairy ball theorem on \(S^2\). If \(v\) were a nowhere-zero tangent field, the map \(x\mapsto (x + \varepsilon v(x))/\abs{x + \varepsilon v(x)}\) — nudge each point a little along its hair — would be homotopic to the identity (let \(\varepsilon\) shrink to \(0\)). It would also have no fixed point, because \(x + \varepsilon v(x)\) is never a multiple of \(x\). But \(\chi(S^2) = 2\neq 0\). On the torus, \(\chi = 0\), so there is no contradiction: indeed, spinning a doughnut about its axis moves every point.
</p>

<Example title="Fixed points of a cat">
	<p>
		An integer matrix \(A\) defines a map of the torus \(\R^2/\Z^2\) by \(x\mapsto Ax\) (mod \(1\)). On \(H_1(T^2;\Q) = \Q^2\) it acts by \(A\) itself, on \(H_0\) and \(H_2\) by \(1\) and \(\det A\), so \(\tau = 1 - \operatorname{tr}A + \det A = \det(I - A)\). For Arnold's “cat map” \(A = \left(\begin{smallmatrix}2&1\\1&1\end{smallmatrix}\right)\), \(\tau = -1\): there must be a fixed point, and in fact there is exactly one, the corner \((0,0)\). For \(A = -I\), the half-turn \(x\mapsto -x\), \(\tau = 4\), and there are exactly four fixed points: \((0,0)\), \((\tfrac12,0)\), \((0,\tfrac12)\) and \((\tfrac12,\tfrac12)\).
	</p>
</Example>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="hurewicz">Homology versus homotopy</h2>

<p>
	Both the <Term t="fundamental-group">fundamental group</Term> \(\pi_1\) of <Ref to="topology/homotopy" /> and the first homology group \(H_1\) study loops. How are they related?
</p>

<p>
	<strong>Every loop is a cycle.</strong> A loop \(\gamma\colon[0,1]\to X\) with \(\gamma(0) = \gamma(1)\) is a singular \(1\)-simplex (identify \([0,1]\) with \(\Delta^1\)), and its boundary is \(\gamma(1) - \gamma(0) = 0\). Homotopic loops are homologous: the homotopy sweeps out a tube, just as in Section 4. And composing loops corresponds to adding cycles. The loop “\(\gamma\) then \(\delta\)” differs from \(\gamma + \delta\) by the boundary of a singular triangle whose three sides are \(\gamma\), \(\delta\) and \(\gamma\cdot\delta\). So there is a homomorphism
</p>
\[ h\colon \pi_1(X,x_0)\to H_1(X),\qquad [\gamma]\mapsto[\gamma]. \]

<p>
	But \(H_1\) is abelian and \(\pi_1\) need not be. In \(H_1\), \([\gamma] + [\delta] = [\delta] + [\gamma]\). So the loops \(\gamma\delta\) and \(\delta\gamma\) have the same image, and the loop \(\gamma\delta\gamma^{-1}\delta^{-1}\) goes to \([\gamma] + [\delta] - [\gamma] - [\delta] = 0\).
</p>

<Definition id="def-abelianization">
	{#snippet head()}Commutators and abelianization{/snippet}
	<p>
		In a group \(G\), the <dfn>commutator</dfn> of \(g\) and \(h\) is \([g,h] = ghg^{-1}h^{-1}\). It equals the identity exactly when \(g\) and \(h\) commute. The <dfn>commutator subgroup</dfn> \([G,G]\) is the subgroup generated by all commutators. The <dfn>abelianization</dfn> of \(G\) is the quotient group
	</p>
	\[ G^{\mathrm{ab}} = G/[G,G]: \]
	<p>
		“\(G\) with every pair of elements forced to commute”, the largest abelian group that \(G\) maps onto. (For the quotient to be a group, \([G,G]\) must be a <em>normal</em> subgroup, which it always is. You may take this fine print on trust; the <Term t="quotient-group">quotient groups</Term> of <Ref to="foundations/abelian-groups" /> are the abelian special case.)
	</p>
</Definition>

<Theorem id="thm-hurewicz" label="Theorem (Hurewicz, in dimension 1)">
	<p>If \(X\) is path-connected, then \(h\colon\pi_1(X,x_0)\to H_1(X)\) is surjective and its kernel is the commutator subgroup. Hence</p>
	\[ H_1(X)\cong \pi_1(X,x_0)^{\mathrm{ab}}. \]
</Theorem>

<p>
	Hatcher puts the geometric meaning in one sentence. Abelianizing lets you rotate the letters of a loop's word cyclically, which is the same as choosing a different starting point: “Thus loops become cycles, without a chosen basepoint.”
</p>

<Example title="Abelianizing some fundamental groups">
	<ul>
		<li>
			<strong>Figure eight.</strong> \(\pi_1(S^1\vee S^1)\) is the free group on \(a, b\), where \(ab\neq ba\). Abelianizing remembers only the total exponent of \(a\) and of \(b\) in a word: \(\Z^2 = H_1\).
		</li>
		<li><strong>Torus.</strong> \(\pi_1(T^2) = \Z^2\) is already abelian, so \(H_1(T^2) = \Z^2\).</li>
		<li>
			<strong>Klein bottle.</strong> \(\pi_1(K)\) is generated by \(a, b\) with the single relation \(abab^{-1} = 1\). Abelianizing turns the relation into \(a + b + a - b = 2a = 0\), so \(\pi_1(K)^{\mathrm{ab}} = \Z\oplus\Z/2\) — exactly the \(H_1(K)\) that the Smith normal form found in <Ref to="homology/computing" />.
		</li>
	</ul>
</Example>

<p>
	The kernel of \(h\) is not just an algebraic curiosity; you can see it. Punch a hole in a torus. The punctured torus deformation retracts onto the figure eight \(a\vee b\), so its \(\pi_1\) is the free group on \(a\) and \(b\). The loop that runs around the edge of the gluing square, \(aba^{-1}b^{-1}\), is a commutator. It can be slid onto the rim of the hole. There it is the <em>boundary of the whole punctured torus</em>, so in \(H_1\) it is zero. But in \(\pi_1\) it is not the identity: the hole is in the way, and no amount of sliding will shrink it to a point.
</p>

<Figure num="3.5.10" title="A loop that bounds but cannot shrink" hint="Drag to rotate · slide the loop">
	<CommutatorTorus />
	{#snippet caption()}
		On a torus with a hole (rim in rose), the teal loop runs along \(a\), then \(b\), then \(a\) backwards, then \(b\) backwards — follow the white bead. Slide it towards the hole. At every stage it is the boundary of the shaded teal surface, so it is \(0\) in \(H_1\). Yet it is the commutator \(aba^{-1}b^{-1}\neq 1\) in \(\pi_1\): it hugs the hole and cannot be shrunk.
	{/snippet}
</Figure>

<Intuition>
	<p>
		Homotopy lets a loop <strong>shrink</strong>; homology also lets it <strong>sweep across a surface and cancel</strong>. That extra freedom makes homology coarser, but also far more computable. For instance, the homotopy groups \(\pi_i(S^2)\) are nonzero for infinitely many \(i\), and most of them are still unknown, while \(H_i(S^2) = 0\) for every \(i \gt 2\).
	</p>
</Intuition>

<Warning>
	<p>
		Homology is a powerful invariant, but not a complete one: spaces can have identical homology and still be different. Poincaré's <em>homology sphere</em> (1904) has exactly the homology of \(S^3\), but its fundamental group has \(120\) elements. And \(\CP^2\) and \(S^2\vee S^4\) have the same homology groups (\(\Z, 0, \Z, 0, \Z\)) but are not homotopy equivalent. The cup product of <Ref to="cohomology/cup-product" /> tells them apart.
	</p>
</Warning>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Reading off a winding number">
	<p>
		Label the hexagon of Section 1 by \(0,2,1,0,2,1\). Compute \(f_\#(z)\) edge by edge, and say what \(f_*\) does to \(H_1\). Then do the same for \(0,1,1,2,2,0\).
	</p>
	{#snippet hint()}
		<p>Write each image edge as \(\pm\) one of \([01],[02],[12]\), remembering that \([ba] = -[ab]\) and that the last edge of \(z\) carries a minus sign.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			For \(0,2,1,0,2,1\) the six edges go to \([02]\), \([21] = -[12]\), \([10] = -[01]\), \([02]\), \(-[12]\) and \([01]\), and the last of these enters \(z\) with a minus sign. So \(f_\#(z) = 2[02] - 2[12] - 2[01] = -2\bigl([01]+[12]-[02]\bigr) = -2z'\), and \(f_*\) is multiplication by \(-2\): twice around, backwards.
		</p>
		<p>
			For \(0,1,1,2,2,0\): the edges go to \([01]\), \(0\) (squashed), \([12]\), \(0\), \([20] = -[02]\), and \(f_\#[v_0v_5] = [00] = 0\). So \(f_\#(z) = [01] + [12] - [02] = z'\), and \(f_*\) is the identity \(\Z\to\Z\): once around.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="The identity is not null-homotopic">
	<p>Use homology to prove that the identity map of \(S^1\) is not homotopic to a constant map. What does this say about rotating a rubber band on a post?</p>
	{#snippet solution()}
		<p>
			The identity induces the identity on \(H_1(S^1)\cong\Z\), which is multiplication by \(1\). A constant map factors through a point, and \(H_1(\text{point}) = 0\), so it induces \(0\). Homotopic maps induce the same homomorphism (Section 4), and \(1\neq 0\). So the two maps are not homotopic. A rubber band wound once around a post cannot be slid off the post, however you wiggle it, without cutting it or lifting it over the top.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Brouwer in dimension one">
	<p>
		(a) Prove directly that every continuous \(f\colon[0,1]\to[0,1]\) has a fixed point, using the function \(g(x) = f(x) - x\) and the intermediate value theorem. (b) Explain how the homological proof in the text specializes to this case: what are \(D^1\), \(S^0\) and \(\tilde H_0\) here?
	</p>
	{#snippet solution()}
		<p>
			(a) \(g(0) = f(0)\ge 0\) and \(g(1) = f(1) - 1\le 0\). A continuous function that changes sign (or vanishes at an end) has a zero in between, and a zero of \(g\) is a fixed point of \(f\).
		</p>
		<p>
			(b) Here \(D^1\) is an interval, \(S^0\) is its two endpoints, and \(\tilde H_0\) counts path components minus one. So \(\tilde H_0(S^0) = \Z\) and \(\tilde H_0(D^1) = 0\). A retraction \(D^1\to S^0\) would make the identity of \(\Z\) factor through \(0\). Concretely: a continuous map from the connected interval onto the two-point set fixing both endpoints would have to jump. If \(f\) had no fixed point, the “ray” from \(f(x)\) through \(x\) would point left or right, and following it would give exactly such a jump.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Where Brouwer fails">
	<p>
		For each space, find a continuous map of it to itself with no fixed point, and say which hypothesis of Brouwer's theorem is missing: (a) the circle \(S^1\); (b) the annulus \(1\le\abs{x}\le 2\) in the plane; (c) the open interval \((0,1)\); (d) the plane \(\R^2\).
	</p>
	{#snippet solution()}
		<p>
			(a) Rotation by any angle that is not a whole turn. (b) The same rotation, applied to the annulus. Neither space is homeomorphic to a disk: both have \(H_1\cong\Z\neq 0\), so they are not even contractible. (c) \(x\mapsto x/2\): its would-be fixed point \(0\) is missing, because the interval is not closed (not compact). (d) A translation \(x\mapsto x + (1,0)\): the plane is contractible but not bounded (not compact). Brouwer needs a space homeomorphic to the <em>closed</em> disk.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Degrees, and a dichotomy for the sphere">
	<p>
		(a) Find the degrees of \(z\mapsto\bar z\) and \(z\mapsto\bar z^3\) on the unit circle, where \(\bar z\) is the complex conjugate. (b) Show that every continuous map \(f\colon S^2\to S^2\) has a point \(x\) with \(f(x) = x\) or \(f(x) = -x\).
	</p>
	{#snippet hint()}
		<p>For (b), apply property (7) of degree to \(f\) and to \(a\circ f\), where \(a\) is the antipodal map.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) Conjugation is the reflection \((x,y)\mapsto(x,-y)\), so it has degree \(-1\). Then \(\bar z^3\) is “cube, then conjugate”, so its degree is \(3\cdot(-1) = -3\).
		</p>
		<p>
			(b) Suppose \(f(x)\neq x\) for all \(x\). By (7), \(\deg f = (-1)^3 = -1\). Suppose also \(f(x)\neq -x\) for all \(x\). Then \(a\circ f\) has no fixed point, so \(\deg(a\circ f) = -1\). But \(\deg(a\circ f) = \deg a\cdot\deg f = (-1)(-1) = 1\). Contradiction.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Abelianize">
	<p>
		The fundamental group of the projective plane \(\RP^2\) is generated by one loop \(a\) with the relation \(a^2 = 1\). The fundamental group of the genus-\(2\) surface is generated by \(a_1,b_1,a_2,b_2\) with the single relation \(a_1b_1a_1^{-1}b_1^{-1}a_2b_2a_2^{-1}b_2^{-1} = 1\). Abelianize both, and compare with the homology computed in <Ref to="homology/computing" />.
	</p>
	{#snippet solution()}
		<p>
			For \(\RP^2\): \(\pi_1\) is already abelian (it is \(\Z/2\)), so \(H_1(\RP^2) \cong \Z/2\), as computed before. For the genus-\(2\) surface, abelianizing turns the relation into \(a_1 + b_1 - a_1 - b_1 + a_2 + b_2 - a_2 - b_2 = 0\), which holds automatically. So no relation survives and \(H_1\cong\Z^4\), matching \(b_1 = 2g = 4\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Combing the 3-sphere, and four fixed points">
	<p>
		(a) Check that \(v(x_1,x_2,x_3,x_4) = (-x_2,x_1,-x_4,x_3)\) is a nowhere-zero tangent vector field on \(S^3\subset\R^4\), and describe its flow lines. (b) For the torus map \(x\mapsto -x\) (mod \(1\)), compute the Lefschetz number from the action on homology, and list the fixed points.
	</p>
	{#snippet solution()}
		<p>
			(a) \(x\cdot v(x) = -x_1x_2 + x_2x_1 - x_3x_4 + x_4x_3 = 0\), so \(v\) is tangent, and \(\abs{v(x)}^2 = x_2^2+x_1^2+x_4^2+x_3^2 = 1\), so it never vanishes. In complex coordinates \(z = x_1 + ix_2\), \(w = x_3 + ix_4\), the field is \((iz, iw)\). Its flow is \((z,w)\mapsto(e^{it}z, e^{it}w)\): every point travels around a great circle, and these circles fill \(S^3\) without crossing — the famous <em>Hopf fibration</em>.
		</p>
		<p>
			(b) On \(H_0\) the map acts by \(1\); on \(H_1 = \Q^2\) by \(-I\), with trace \(-2\); on \(H_2\) by \(\det(-I) = 1\). So \(\tau = 1 - (-2) + 1 = 4\). Fixed points solve \(-x\equiv x\), that is \(2x\equiv 0\) mod \(1\): the four points \((0,0)\), \((\tfrac12,0)\), \((0,\tfrac12)\), \((\tfrac12,\tfrac12)\).
		</p>
	{/snippet}
</Exercise>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>A simplicial map \(f\) induces a <strong>chain map</strong> \(f_\#\): apply \(f\) to vertices, re-sort with signs, and send squashed simplices to \(0\). It commutes with \(\partial\).</li>
		<li>Chain maps send cycles to cycles and boundaries to boundaries, so they induce homomorphisms \(f_*[z] = [f_\#z]\) on homology. Wrapping a circle twice induces multiplication by \(2\).</li>
		<li><strong>Functoriality:</strong> \((g\circ f)_* = g_*\circ f_*\) and \(\id_* = \id\). Homology is a functor.</li>
		<li><strong>Singular homology</strong> uses all continuous maps \(\Delta^n\to X\). It is defined for every space, every map induces homomorphisms, and it agrees with simplicial homology on triangulated spaces.</li>
		<li><strong>Homotopy invariance:</strong> homotopic maps induce equal maps (a homotopy sweeps out a prism, \(\partial P + P\partial = g_\# - f_\#\)). Homotopy equivalent, and in particular homeomorphic, spaces have isomorphic homology.</li>
		<li>Payoffs: \(S^n\) is not contractible; there is <strong>no retraction</strong> \(D^n\to S^{n-1}\); <strong>Brouwer:</strong> every map \(D^n\to D^n\) has a fixed point; <strong>invariance of dimension:</strong> \(\R^m\cong\R^n\Rightarrow m = n\).</li>
		<li>The <strong>degree</strong> of \(f\colon S^n\to S^n\) is the integer by which \(f_*\) multiplies; it counts preimages with signs. The antipodal map has degree \((-1)^{n+1}\).</li>
		<li><strong>Hairy ball:</strong> \(S^n\) has a nowhere-zero tangent field iff \(n\) is odd. <strong>Lefschetz:</strong> \(\tau(f)\neq 0\) forces a fixed point.</li>
		<li><strong>Hurewicz:</strong> \(H_1 \cong \pi_1^{\mathrm{ab}}\). The commutator loop on a punctured torus bounds a surface but cannot shrink. <strong>Jordan:</strong> a simple closed curve splits the plane in two.</li>
	</ul>
</Recap>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Algebraic Topology, Chapter 2',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard reference for everything here: singular homology and homotopy invariance (§2.1, with Brouwer and invariance of dimension), degree and the hairy ball (§2.2), Hurewicz (§2.A), Jordan and invariance of domain (§2.B), Lefschetz (§2.C). Rigorous but generous with pictures.',
			kind: 'book',
			free: true
		},
		{
			title: 'Topology from the Differentiable Viewpoint',
			author: 'John Milnor',
			url: 'https://press.princeton.edu/books/paperback/9780691048338/topology-from-the-differentiable-viewpoint',
			note: 'Sixty-odd perfect pages: degree defined by counting preimages with signs, Brouwer, the hairy ball theorem and the Poincaré–Hopf theorem, all with calculus instead of homology.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology: A First Course',
			author: 'William Fulton',
			url: 'https://link.springer.com/book/10.1007/978-1-4612-4180-5',
			note: 'Builds topology up from winding numbers of plane curves; beautiful chapters on the Jordan curve theorem and on fixed points.',
			kind: 'book'
		},
		{
			title: 'Homology Theory: An Introduction to Algebraic Topology',
			author: 'James W. Vick',
			url: 'https://link.springer.com/book/10.1007/978-1-4612-0881-5',
			note: 'A friendly, efficient account of singular homology and its applications (fixed points, degree, Lefschetz), at the level of a first graduate course.',
			kind: 'book'
		},
		{
			title: 'Topology and Geometry',
			author: 'Glen E. Bredon',
			url: 'https://link.springer.com/book/10.1007/978-1-4757-6848-0',
			note: 'Chapter IV develops singular homology with many applications, including a careful treatment of degree and the Lefschetz theorem.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology (video lectures)',
			author: 'N. J. Wildberger',
			url: 'https://www.youtube.com/playlist?list=PL41FDABC6AA085E78',
			note: 'A visual, unhurried lecture series; the later lectures on homology are a good companion to this part of the book.',
			kind: 'video',
			free: true
		}
	]}
/>
