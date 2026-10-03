<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Lemma from '$lib/components/prose/Lemma.svelte';
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
	import ExactBeads from '$lib/figures/homology/exact-sequences/ExactBeads.svelte';
	import ZigZag from '$lib/figures/homology/exact-sequences/ZigZag.svelte';
	import CrushDisk from '$lib/figures/homology/exact-sequences/CrushDisk.svelte';
	import ExcisionPicture from '$lib/figures/homology/exact-sequences/ExcisionPicture.svelte';
	import CircleArcs from '$lib/figures/homology/exact-sequences/CircleArcs.svelte';
	import MVSphere from '$lib/figures/homology/exact-sequences/MVSphere.svelte';
	import MVSquares from '$lib/figures/homology/exact-sequences/MVSquares.svelte';
	import MobiusDouble from '$lib/figures/homology/exact-sequences/MobiusDouble.svelte';
	import CellularCalc from '$lib/figures/homology/exact-sequences/CellularCalc.svelte';
</script>

<Epigraph author="Allen Hatcher" source="Algebraic Topology (2002), Chapter 2"
	>The maximally efficient method is known as cellular homology, whose power comes perhaps from the fact that it is ‘homology squared’ — homology defined in terms of homology.</Epigraph
>

<p class="lead">
	Nobody computes the homology of a space by writing down every simplex. A torus triangulated finely enough to look smooth has thousands of triangles, and singular homology has uncountably many singular simplices. Instead, mathematicians compute the way engineers build bridges: cut the problem into pieces small enough to understand, then keep careful track of how the pieces are joined.
</p>

<p>
	You already know the simplest version of this idea. If a space \(X\) is the union of two pieces \(U\) and \(V\), its Euler characteristic obeys an inclusion–exclusion rule, \(\chi(X) = \chi(U) + \chi(V) - \chi(U\cap V)\), just like counting the people in two overlapping clubs. This chapter upgrades that rule from <em>numbers</em> to <em>groups</em>. The upgrade is called the Mayer–Vietoris sequence. To state it we first need the language it is written in — exact sequences — and two companions: relative homology, which ignores part of a space, and excision, which says that ignoring is harmless. We finish with cellular homology, the workhorse that turns a picture of a space into its homology in a few lines.
</p>

<Ahead>
	<p>
		These are the tools homology is actually computed with, in research and in the rest of this book. Long exact sequences reappear in cohomology (<Ref to="cohomology/cohomology-groups" />) and in the Ext and Tor of <Ref to="big-picture/homological-algebra" />, where the zig-zag of Section 2 becomes the snake lemma. Relative homology and excision underlie Poincaré duality (<Ref to="cohomology/poincare-duality" />). Mayer–Vietoris has twins for de Rham cohomology (<Ref to="cohomology/de-rham" />) and for Čech cohomology (<Ref to="cohomology/sheaves" />). And the cell structures of this chapter are the scaffolding for cup products (<Ref to="cohomology/cup-product" />).
	</p>
</Ahead>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="exactness">Exactness: nothing lost, nothing extra</h2>

<p>
	Recall from <Ref to="foundations/abelian-groups" /> that a sequence of homomorphisms \(A\xrightarrow{\,f\,}B\xrightarrow{\,g\,}C\) is <Term t="exact-sequence">exact</Term> at \(B\) if
</p>
\[ \im f = \ker g. \]
<p>
	Read the two halves separately. \(\im f\subseteq\ker g\) says that \(g\) kills everything \(f\) produces: \(g\circ f = 0\). And \(\ker g\subseteq\im f\) says that everything \(g\) kills was produced by \(f\). <strong>Nothing lost, nothing extra:</strong> what one map hands forward is exactly what the next map throws away. A longer sequence \(\cdots\to A_{k+1}\to A_k\to A_{k-1}\to\cdots\) is exact if it is exact at every inner group.
</p>

<p>Short sequences carry familiar facts in this new language. Here \(0\) is the group with one element, and the maps to and from it are the only ones possible.</p>
<ul>
	<li>\(0\to A\xrightarrow{f} B\) is exact exactly when \(f\) is <strong>injective</strong>: the kernel of \(f\) must equal the image of the zero group, which is \(\{0\}\).</li>
	<li>\(A\xrightarrow{f} B\to 0\) is exact exactly when \(f\) is <strong>surjective</strong>: the kernel of the map to \(0\) is all of \(B\), and it must equal the image of \(f\).</li>
	<li>\(0\to A\xrightarrow{f}B\to 0\) is exact exactly when \(f\) is an <strong>isomorphism</strong>.</li>
	<li>
		\(0\to A\xrightarrow{f}B\xrightarrow{g}C\to 0\) is a <Term t="short-exact-sequence">short exact sequence</Term>: \(f\) is injective, \(g\) is surjective, and \(\im f = \ker g\). Then \(A\) sits inside \(B\) as a subgroup and \(C\cong B/A\), by the first isomorphism theorem. You can think of \(B\) as “built from” \(A\) and \(C\).
	</li>
</ul>

<Example title="Two short exact sequences">
	<p>
		\(0\to\Z\xrightarrow{\ \times2\ }\Z\xrightarrow{\ \bmod 2\ }\Z/2\to 0\): doubling is injective, reducing mod \(2\) is surjective, and the even numbers are both the image of doubling and the kernel of reduction.
	</p>
	<p>
		\(0\to\Z\xrightarrow{\ x\mapsto(x,0)\ }\Z\oplus\Z/2\xrightarrow{\ (x,y)\mapsto y\ }\Z/2\to0\): the first factor goes in, and the second factor comes out. This sequence has the same two ends as the first one, \(\Z\) and \(\Z/2\), but a different middle: \(\Z\oplus\Z/2\) has an element of order two, and \(\Z\) does not. So the ends of a short exact sequence do not always determine the middle. That subtlety will matter in Section 6.
	</p>
</Example>

<p>
	A chain complex \(\cdots\xrightarrow{\partial}C_{n+1}\xrightarrow{\partial}C_n\xrightarrow{\partial}C_{n-1}\to\cdots\) is a sequence with \(\im\partial\subseteq\ker\partial\) everywhere, because \(\partial\circ\partial = 0\). It is exact when the reverse inclusion holds too. The difference between the two is precisely the homology group \(\ker\partial/\im\partial\).
</p>

<KeyIdea>
	<p>
		A chain complex is exact exactly when all its homology groups are zero. <strong>Homology measures the failure of exactness</strong>: the gap between “killed by the next map” and “produced by the previous one”. In Figure 3.6.1, teal beads are killed and gold rings are produced. Exactness means every teal bead wears a ring and every ring sits on a teal bead.
	</p>
</KeyIdea>

<Figure size="wide" num="3.6.1" title="Exactness, bead by bead" hint="Change m and k · hover a bead in the middle column">
	<ExactBeads />
	{#snippet caption()}
		The sequence \(0\to\Z\xrightarrow{\times m}\Z\xrightarrow{\bmod k}\Z/k\to0\), with each group drawn as beads. Teal beads lie in the <em>kernel</em> of the next map, and gold rings mark the <em>image</em> of the previous one. With \(m = k\) the sequence is exact. With \(m = 4\), \(k = 2\) the beads \(\pm2,\pm6\) are teal but unringed: a gap \(2\Z/4\Z\cong\Z/2\), which is a homology group. With \(m = 2\), \(k = 4\) the ringed bead \(2\) is not even in the kernel, so this is not a chain complex at all.
	{/snippet}
</Figure>

<p>
	One numerical consequence is used constantly. If \(0\to A_m\to\cdots\to A_1\to A_0\to0\) is an exact sequence of finitely generated abelian groups, then
</p>
\[ \sum_i (-1)^i\,\rank A_i = 0. \]
<p>
	The reason is rank–nullity (<Ref to="foundations/linear-algebra" />) applied at each spot: each group's rank splits into the part killed by the next map and the part that survives, and exactness makes these pieces cancel in the alternating sum. For example, \(0\to\Z\to\Z^3\to\Z^2\to0\) is consistent, \(1 - 3 + 2 = 0\), while no exact sequence \(0\to\Z\to\Z^3\to\Z\to0\) can exist.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="long-exact-sequence">From short to long: the zig-zag</h2>

<p>
	The engine of this chapter turns <em>short</em> exact sequences of chain complexes into <em>long</em> exact sequences of homology groups. Suppose we have three chain complexes and two <Term t="chain-map">chain maps</Term> between them (<Ref to="homology/invariance" />),
</p>
\[ 0 \to A_\bullet \xrightarrow{\ i\ } B_\bullet \xrightarrow{\ j\ } C_\bullet \to 0, \]
<p>
	such that in every degree \(n\) the sequence \(0\to A_n\to B_n\to C_n\to 0\) is short exact. Picture three columns of groups, \(A\), \(B\) and \(C\), with the boundary maps running down each column and the maps \(i\) and \(j\) running across. Every square commutes, and every row is short exact.
</p>

<Theorem id="thm-zigzag" label="Theorem (the zig-zag lemma)">
	<p>
		A short exact sequence of chain complexes \(0\to A_\bullet\to B_\bullet\to C_\bullet\to 0\) gives a long exact sequence of homology groups
	</p>
	\[ \cdots \to H_n(A)\xrightarrow{\ i_*\ } H_n(B)\xrightarrow{\ j_*\ } H_n(C)\xrightarrow{\ \partial_*\ } H_{n-1}(A)\xrightarrow{\ i_*\ } H_{n-1}(B)\to\cdots \]
	<p>The maps \(\partial_*\colon H_n(C)\to H_{n-1}(A)\) are called <dfn>connecting homomorphisms</dfn>.</p>
</Theorem>

<p>
	The maps \(i_*\) and \(j_*\) are the induced maps of the last chapter. The surprise is \(\partial_*\), which <em>lowers</em> the degree by one and jumps from the right-hand column back to the left. It is built by a four-step chase through the diagram, the <dfn>zig-zag</dfn>. Start with a homology class in \(H_n(C)\), represented by a cycle \(c\in C_n\).
</p>
<ol>
	<li><strong>Lift.</strong> \(j\) is surjective, so choose \(b\in B_n\) with \(j(b) = c\).</li>
	<li><strong>Take the boundary.</strong> Form \(\partial b\in B_{n-1}\).</li>
	<li>
		<strong>Notice it dies.</strong> \(j(\partial b) = \partial(j b) = \partial c = 0\), because \(j\) is a chain map and \(c\) is a cycle. So \(\partial b\) lies in the kernel of \(j\), which by exactness is the image of \(i\).
	</li>
	<li><strong>Pull back.</strong> So \(\partial b = i(a)\) for some \(a\in A_{n-1}\), and \(a\) is unique because \(i\) is injective.</li>
</ol>
<p>
	Then \(a\) is a cycle: \(i(\partial a) = \partial(i a) = \partial\partial b = 0\), and \(i\) is injective, so \(\partial a = 0\). Define \(\partial_*[c] = [a]\). Different choices of the lift \(b\), or of the representative \(c\), change \(a\) only by a boundary, so the class \([a]\) is well defined.
</p>

<Figure size="wide" num="3.6.2" title="The zig-zag, with real chains" hint="Step through, or press play">
	<ZigZag />
	{#snippet caption()}
		The connecting map for \(X\) = a filled triangle and \(A\) = its boundary circle, where \(C_n(X,A) = C_n(X)/C_n(A)\) (Section 3). Start with the whole triangle, a relative cycle in the top-right cell. Lift it, take its boundary, and pull back to \(A\). The answer is the loop around the triangle. So \(\partial_*\) sends “the disk” to “its rim”, giving \(H_2(X,A)\cong H_1(A)\cong\Z\).
	{/snippet}
</Figure>

<Proof>
	{#snippet head()}Exactness at \(H_n(B)\), as a sample{/snippet}
	<p>
		<em>Image inside kernel:</em> \(j_*\circ i_* = (j\circ i)_* = 0\), because \(j\circ i = 0\) already on chains. <em>Kernel inside image:</em> suppose \(j_*[b] = 0\), so \(j(b) = \partial c'\) for some \(c'\in C_{n+1}\). Lift \(c' = j(b')\) and look at \(b - \partial b'\). Then \(j(b - \partial b') = \partial c' - \partial j(b') = 0\), so \(b-\partial b' = i(a)\) for some \(a\). This \(a\) is a cycle, and \(i_*[a] = [b - \partial b'] = [b]\). Exactness at the other two spots is proved by similar chases. Hatcher (Theorem 2.16) gives all of them, and <Ref to="big-picture/homological-algebra" /> revisits the argument as the snake lemma.
	</p>
</Proof>

<Intuition>
	<p>
		A long exact sequence is a conveyor belt in which every group is squeezed between its neighbours. If you know most of the groups and maps along the belt, exactness lets you solve for the rest — the way you solve for one unknown in a chain of equations. Two patterns do most of the work:
	</p>
	<ul>
		<li>\(0\to G\to H\to0\) exact forces \(G\cong H\).</li>
		<li>\(0\to G\to 0\) exact forces \(G = 0\).</li>
	</ul>
</Intuition>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="relative-homology">Relative homology: homology after crushing</h2>

<p>
	Sometimes we want homology to ignore part of a space: to focus on what happens near one point, or to study \(X\) with a subspace \(A\) squashed flat. The algebra for this is a quotient, the first of the book's recurring ideas.
</p>

<Definition id="def-relative">
	{#snippet head()}Relative homology \(H_n(X,A)\){/snippet}
	<p>
		Let \(A\) be a subspace of \(X\). The <dfn>relative chains</dfn> are the quotient groups \(C_n(X,A) = C_n(X)/C_n(A)\): chains in \(X\), where any chain lying entirely in \(A\) counts as zero. The boundary map passes to the quotient, because \(\partial\) sends chains in \(A\) to chains in \(A\). The <dfn>relative homology</dfn> groups \(H_n(X,A)\) are the homology of this chain complex.
	</p>
</Definition>

<p>Unwinding the quotient gives two concrete descriptions:</p>
<ul>
	<li>a <dfn>relative cycle</dfn> is a chain in \(X\) whose boundary lies in \(A\) (it need not be zero; it only has to vanish once \(A\) is ignored);</li>
	<li>a <dfn>relative boundary</dfn> is a chain of the form \(\partial d + a\), with \(a\) a chain in \(A\).</li>
</ul>

<Example title="A disk relative to its rim">
	<p>
		Let \(X\) be a filled triangle and \(A\) its boundary, the hollow triangle. Every vertex and every edge lies in \(A\), so \(C_0(X,A) = C_1(X,A) = 0\). Only the triangle survives: \(C_2(X,A)\cong\Z\), generated by \([012]\). Its boundary lies in \(A\), so it is a relative cycle, and there is nothing in degree \(3\) for it to be the boundary of. Hence
	</p>
	\[ H_0(X,A) = 0,\qquad H_1(X,A) = 0,\qquad H_2(X,A)\cong\Z. \]
	<p>
		These are exactly the reduced homology groups of the sphere. That is no accident: crush the rim of a disk to a single point and the disk closes up into a sphere.
	</p>
</Example>

<Figure size="wide" num="3.6.3" title="Crushing the rim" hint="Drag the slider, or press Crush · drag to rotate">
	<CrushDisk />
	{#snippet caption()}
		A disk \(D^2\) whose gold boundary circle \(A = S^1\) is squeezed to a single point. The disk curls up into a sphere, \(D^2/S^1\cong S^2\). The whole disk, a relative \(2\)-cycle of \((D^2,S^1)\), becomes the \(2\)-cycle that fills the sphere. Relative homology is homology after crushing: \(H_n(D^2,S^1)\cong\tilde H_n(S^2)\).
	{/snippet}
</Figure>

<Theorem id="thm-good-pairs" label="Theorem (good pairs)">
	<p>
		Call \((X,A)\) a <dfn>good pair</dfn> if \(A\) is a nonempty closed subspace that is a deformation retract of some neighbourhood of itself in \(X\). (For example, a subcomplex of a simplicial or cell complex.) Then crushing \(A\) to a point induces isomorphisms
	</p>
	\[ H_n(X,A)\;\cong\;\tilde H_n(X/A)\quad\text{for all } n. \]
</Theorem>

<p>
	The neighbourhood condition is a technicality that rules out pathological subspaces. The relative groups behave as if \(A\) had been crushed, and, as we will see in a moment, also as if a small neighbourhood of \(A\) had been thrown away. That is Hatcher's Proposition 2.22, and it rests on excision.
</p>

<h3>The long exact sequence of a pair</h3>

<p>
	The relative chains fit into a short exact sequence of chain complexes, \(0\to C_\bullet(A)\to C_\bullet(X)\to C_\bullet(X,A)\to0\): include, then divide out. The zig-zag lemma turns it into the <dfn>long exact sequence of the pair</dfn>,
</p>
\[ \cdots\to H_n(A)\to H_n(X)\to H_n(X,A)\xrightarrow{\ \partial_*\ }H_{n-1}(A)\to H_{n-1}(X)\to\cdots\to H_0(X,A)\to0. \]
<p>
	Here the connecting map is as concrete as it could be. A relative cycle has its boundary in \(A\), and \(\partial_*\) <em>takes that boundary</em>, which is a cycle in \(A\). The same sequence holds with reduced homology in place of \(H_n(A)\) and \(H_n(X)\), which is often tidier.
</p>

<Example title="Disks relative to their boundary spheres">
	<p>
		Take \(X = D^n\) and \(A = S^{n-1}\). The disk is contractible, so \(\tilde H_k(D^n) = 0\) for all \(k\), and the reduced long exact sequence breaks into pieces
	</p>
	\[ 0 = \tilde H_k(D^n)\to H_k(D^n,S^{n-1})\xrightarrow{\ \partial_*\ }\tilde H_{k-1}(S^{n-1})\to\tilde H_{k-1}(D^n) = 0. \]
	<p>
		By the first pattern in the conveyor-belt box, \(\partial_*\) is an isomorphism: \(H_k(D^n,S^{n-1})\cong\tilde H_{k-1}(S^{n-1})\). In particular \(H_n(D^n,S^{n-1})\cong\Z\), generated by the whole disk, whose boundary is the whole sphere.
	</p>
</Example>

<Remark title="Local homology, and a promise kept">
	<p>
		The groups \(H_k(\R^n,\R^n\setminus\{0\})\) are the <dfn>local homology</dfn> of \(\R^n\) at a point. By the same long exact sequence they equal \(\tilde H_{k-1}(\R^n\setminus\{0\})\cong\tilde H_{k-1}(S^{n-1})\), which is \(\Z\) for \(k = n\) and \(0\) otherwise. Local homology only depends on a neighbourhood of the point (by excision, next). So a homeomorphism between open subsets of \(\R^m\) and \(\R^n\) forces \(m = n\) — the local version of invariance of dimension promised in <Ref to="homology/invariance" hash="dimension-and-jordan" />.
	</p>
</Remark>

<h3>Excision</h3>

<Theorem id="thm-excision" label="Theorem (excision)">
	<p>
		Let \(Z\subseteq A\subseteq X\), with the closure of \(Z\) contained in the interior of \(A\). Then the inclusion \((X\setminus Z,\,A\setminus Z)\hookrightarrow(X,A)\) induces isomorphisms
	</p>
	\[ H_n(X\setminus Z,\,A\setminus Z)\;\cong\;H_n(X,A)\quad\text{for all } n. \]
</Theorem>

<Figure num="3.6.4" title="Excision">
	<ExcisionPicture />
	{#snippet caption()}
		Relative homology ignores everything in \(A\). So cutting out a piece \(Z\) that sits deep inside \(A\), away from its edge, changes nothing: \(H_n(X\setminus Z, A\setminus Z)\cong H_n(X,A)\).
	{/snippet}
</Figure>

<p>
	Intuitively this is almost a tautology. Relative chains already count anything inside \(A\) as zero, so whatever happens deep inside \(A\) is invisible. The proof has one genuine idea. A singular simplex may be large, straddling both \(Z\) and the outside of \(A\). But it can be chopped by repeated barycentric subdivision into simplices so small that each one lies either inside \(A\) or outside \(Z\), and chopping does not change homology classes. That is <em>an honest sketch</em>; the details take a few pages in Hatcher (Theorem 2.20).
</p>

<Warning>
	<p>
		The hypothesis matters: \(Z\) must stay away from the edge of \(A\). If you excise a set that touches the frontier of \(A\), you can change the relative homology. Excision is what makes homology <em>local</em>: it lets us study a space one region at a time. That is exactly what the next section exploits.
	</p>
</Warning>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="mayer-vietoris">The Mayer–Vietoris sequence</h2>

<p>
	Now the main tool. Suppose a space is covered by two open sets, \(X = U\cup V\). (More generally it is enough that the <em>interiors</em> of \(U\) and \(V\) cover \(X\).) Four inclusions connect the pieces: \(U\cap V\) sits inside both \(U\) and \(V\), and each of those sits inside \(X\).
</p>

<Theorem id="thm-mv" label="Theorem (Mayer–Vietoris)">
	<p>There is a long exact sequence</p>
	\[ \cdots\to H_n(U\cap V)\xrightarrow{\ \Phi\ }H_n(U)\oplus H_n(V)\xrightarrow{\ \Psi\ }H_n(X)\xrightarrow{\ \partial\ }H_{n-1}(U\cap V)\xrightarrow{\ \Phi\ }\cdots\to H_0(X)\to0, \]
	<p>where</p>
	<ul>
		<li>\(\Phi(x) = (x,\,-x)\): a cycle in the overlap, seen once in \(U\) and once, with a minus sign, in \(V\);</li>
		<li>\(\Psi(u,v) = u + v\): cycles of \(U\) and of \(V\) added together in \(X\);</li>
		<li>\(\partial[z] = [\partial u]\), where the cycle \(z\) of \(X\) has been cut as \(z = u + v\) with \(u\) a chain in \(U\) and \(v\) a chain in \(V\).</li>
	</ul>
	<p>The same holds with reduced homology throughout, provided \(U\cap V\) is not empty.</p>
</Theorem>

<p>
	(Strictly speaking, \(\Phi(x) = (i_*x, -j_*x)\) and \(\Psi(u,v) = k_*u + l_*v\), where \(i,j,k,l\) are the four inclusions. We drop them from the notation.) The minus sign in \(\Phi\) is there to make \(\Psi\circ\Phi = 0\): a cycle in the overlap, added to its own negative, is zero.
</p>

<p>
	The connecting map is the heart of the matter, so read it slowly. A cycle \(z\) in \(X\) can be cut into a piece \(u\) inside \(U\) and a piece \(v\) inside \(V\). The pieces need not be cycles: they have loose ends. But \(\partial u + \partial v = \partial z = 0\), so \(\partial u = -\partial v\). This chain lies in \(U\) (it is the boundary of \(u\)) and in \(V\) (it is minus the boundary of \(v\)), so it lies in \(U\cap V\). It is the record of <em>where the cut was made</em>, and it is a cycle there.
</p>

<p>
	Where does the sequence come from? Let \(C_n(U+V)\) be the chains in \(X\) that are sums of chains in \(U\) and chains in \(V\). There is a short exact sequence of chain complexes
</p>
\[ 0\to C_\bullet(U\cap V)\xrightarrow{\ x\mapsto(x,-x)\ }C_\bullet(U)\oplus C_\bullet(V)\xrightarrow{\ (u,v)\mapsto u+v\ }C_\bullet(U+V)\to0. \]
<p>
	The zig-zag lemma makes it long. Then the subdivision argument behind excision shows that the “small” chains \(C_\bullet(U+V)\) have the same homology as all of \(C_\bullet(X)\). Again, that last step is a sketch; the full proof is in Hatcher §2.2.
</p>

<Example title="The circle, from two arcs">
	<p>
		Cover the circle by an upper arc \(U\) and a lower arc \(V\), each a bit more than half the circle. Both arcs are contractible, and their overlap consists of two short arcs, one around a point \(p\) on the left and one around \(q\) on the right. So \(H_*(U)\) and \(H_*(V)\) are \(\Z\) in degree \(0\) and zero above, while \(H_0(U\cap V)\cong\Z^2\), generated by \([p]\) and \([q]\). The end of the sequence reads
	</p>
	\[ \underbrace{H_1(U)\oplus H_1(V)}_{0}\to H_1(S^1)\xrightarrow{\ \partial\ }\underbrace{H_0(U\cap V)}_{\Z^2}\xrightarrow{\ \Phi\ }\underbrace{H_0(U)\oplus H_0(V)}_{\Z^2}\to H_0(S^1)\to 0. \]
	<p>
		Each of \(p\) and \(q\) is a point of \(U\) and of \(V\), so \(\Phi(x[p] + y[q]) = (x+y,\,-(x+y))\). Its kernel consists of the multiples of \([p]-[q]\), a copy of \(\Z\). Exactness on the left makes \(\partial\) injective, and exactness in the middle makes its image equal to \(\ker\Phi\). Therefore
	</p>
	\[ H_1(S^1)\;\cong\;\ker\Phi\;\cong\;\Z. \]
	<p>
		The generator is the loop \(z\) that runs up through \(U\) and back down through \(V\): cutting it as \(z = u + v\) gives \(\partial u = p - q\). The circle's hole is detected as “the two overlap pieces, which are not connected inside the overlap, are joined around the other side”.
	</p>
</Example>

<Figure num="3.6.5" title="A circle from two arcs">
	<CircleArcs />
	{#snippet caption()}
		The upper arc \(U\) (blue) and the lower arc \(V\) (violet) overlap in two short pieces (gold). The loop \(z\) splits as \(u + v\). The loose ends of \(u\) are the points \(p\) and \(q\), in different pieces of the overlap, and the connecting map sends \([z]\) to \([\partial u] = [p] - [q]\).
	{/snippet}
</Figure>

<Remark title="The Euler characteristic, recovered">
	<p>
		Apply the rank rule of Section 1 to the Mayer–Vietoris sequence, with rational coefficients. The alternating sum of ranks along the whole sequence is zero, and regrouping by columns gives \(\chi(X) = \chi(U) + \chi(V) - \chi(U\cap V)\). The inclusion–exclusion count from the opening of the chapter is the numerical shadow of the sequence.
	</p>
</Remark>

<History>
	<p>
		The sequence is named after Walther Mayer and Leopold Vietoris, who developed the method of computing homology from a decomposition in 1929–1930. That was only a few years after Emmy Noether had persuaded topologists to treat Betti numbers and torsion as properties of <em>groups</em>, and the new language made such sequences possible. Hatcher calls Mayer–Vietoris “the analog for homology of van Kampen's theorem” for the fundamental group.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="spheres">Spheres, one dimension at a time</h2>

<p>
	Here is the cleanest application, and the promised recomputation of the homology of spheres. Cover \(S^n\) by two caps: \(U\), everything north of a latitude a little below the equator, and \(V\), everything south of a latitude a little above it. Each cap is a disk, hence contractible. Their overlap is a band around the equator, which deformation retracts onto the equator, an \(S^{n-1}\).
</p>

<p>
	Use the reduced sequence. All the reduced groups of \(U\) and \(V\) vanish, so every segment of the sequence looks like
</p>
\[ 0\to\tilde H_k(S^n)\xrightarrow{\ \partial\ }\tilde H_{k-1}(U\cap V)\to0, \]
<p>and \(\partial\) is an isomorphism:</p>
\[ \tilde H_k(S^n)\;\cong\;\tilde H_{k-1}(S^{n-1}). \]
<p>
	Each step down in dimension also steps down in degree. Start from \(S^0\), which is two points, so \(\tilde H_0(S^0)\cong\Z\) and every other group vanishes. Then, \(n\) steps later:
</p>

<Theorem id="thm-spheres" label="Theorem (homology of spheres)">
	<p>\(\tilde H_k(S^n)\cong\Z\) if \(k = n\), and \(\tilde H_k(S^n) = 0\) otherwise.</p>
</Theorem>

<Figure size="wide" num="3.6.6" title="Mayer–Vietoris on the sphere" hint="Step through · drag to rotate">
	<MVSphere />
	{#snippet caption()}
		The sphere as two caps \(U\) (blue) and \(V\) (violet), overlapping in a band (gold) that shrinks to the equator. The table fills in as you step. The connecting map takes the \(2\)-cycle “whole sphere” \(=\) “north cap \(u\)” \(+\) “south cap \(v\)” to \(\partial u\), the equator: this is the isomorphism \(H_2(S^2)\cong H_1(U\cap V)\cong\Z\).
	{/snippet}
</Figure>

<p>
	The geometry of the connecting map is worth a second look. The generator of \(H_2(S^2)\) is the whole sphere. Cut it along the overlap into a northern piece \(u\) and a southern piece \(v\). The boundary of the northern piece is the equator, which generates \(H_1\) of the band. Going up one dimension, a sphere is literally two disks glued along their boundary sphere, and the connecting map remembers the gluing.
</p>

<Question>
	<p>
		The same argument works for any space \(X\) in place of \(S^{n-1}\). The <em>suspension</em> \(SX\) (<Ref to="topology/gluing" />) is two cones on \(X\) glued along \(X\). Each cone is contractible and their overlap deformation retracts to \(X\). What does Mayer–Vietoris say about \(\tilde H_{k+1}(SX)\)? (Answer: \(\tilde H_{k+1}(SX)\cong\tilde H_k(X)\). Suspension shifts homology up by one, and \(S^n\) is the \(n\)-fold suspension of \(S^0\).)
	</p>
</Question>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="torus-and-klein">Doughnuts and bottles</h2>

<p>
	The torus and the Klein bottle are made from the same square, with the left and right sides glued straight for the torus and with a flip for the Klein bottle (<Ref to="topology/gluing" />). Mayer–Vietoris sees the difference through one tiny number.
</p>

<p>
	Cut both the same way. Let \(U\) be a horizontal strip through the middle of the square, and \(V\) the strips along the top and bottom edges, which the gluing \(a\) joins into a single strip. Then:
</p>
<ul>
	<li>for the torus, \(U\) and \(V\) are cylinders, and \(U\cap V\) is <strong>two</strong> separate thin annuli;</li>
	<li>
		for the Klein bottle, the flip turns \(U\) and \(V\) into Möbius bands. It also joins the two thin strips of the overlap into <strong>one</strong> annulus, which runs around twice. Leave the square on the right at height \(\tfrac14\) and you come back on the left at height \(\tfrac34\).
	</li>
</ul>
<p>In both cases each of \(U\), \(V\) and each piece of \(U\cap V\) deformation retracts onto a circle.</p>

<Figure size="wide" num="3.6.7" title="Cutting a torus and a Klein bottle" hint="Choose a surface · step through">
	<MVSquares />
	{#snippet caption()}
		The same cut on the same square. \(U\) is the middle strip (blue), \(V\) is the top and bottom strips (violet), and the overlap is two thin strips (gold). For the torus the overlap is two circles. For the Klein bottle the flip joins them (matching dots are the same point) into one circle that goes twice around. In the table, everything but the last column is known, and exactness does the rest.
	{/snippet}
</Figure>

<h3>The torus</h3>

<p>
	For the torus, \(H_1(U\cap V)\cong\Z^2\), one generator for each overlap circle, and \(H_1(U)\oplus H_1(V)\cong\Z\oplus\Z\), generated by the two core circles. Each overlap circle runs once around each core, so with suitable orientations \(\Phi(x,y) = (x+y,\,-x-y)\) in degree \(1\), and the same formula holds in degree \(0\), where it counts components. The relevant part of the sequence is
</p>
\[ 0\to H_2(T^2)\xrightarrow{\partial}\underbrace{\Z^2}_{H_1(U\cap V)}\xrightarrow{\Phi_1}\underbrace{\Z^2}_{H_1(U)\oplus H_1(V)}\xrightarrow{\Psi}H_1(T^2)\xrightarrow{\partial}\underbrace{\Z^2}_{H_0(U\cap V)}\xrightarrow{\Phi_0}\underbrace{\Z^2}_{H_0(U)\oplus H_0(V)}. \]
<ul>
	<li>\(H_2(T^2)\cong\ker\Phi_1\), the multiples of \((1,-1)\), so \(H_2(T^2)\cong\Z\). Its generator is the whole torus, cut into its two halves.</li>
	<li>
		\(H_1(T^2)\) is caught between \(\operatorname{coker}\Phi_1 = \Z^2/\im\Phi_1\cong\Z\) and \(\ker\Phi_0\cong\Z\). That is, there is a short exact sequence \(0\to\Z\to H_1(T^2)\to\Z\to0\).
	</li>
</ul>
<p>
	A short exact sequence ending in \(\Z\) always <em>splits</em>: choose any element mapping to the generator of the right-hand \(\Z\), and it generates a second copy of \(\Z\) alongside the first. So \(H_1(T^2)\cong\Z^2\). The first generator is a core circle; the second, born from \(\ker\Phi_0\), is a loop that crosses both overlap strips — a loop that goes “around the other way”.
</p>

<h3>The Klein bottle</h3>

<p>
	Now \(U\cap V\) is a single annulus, so \(H_1(U\cap V)\cong\Z\) and \(H_0(U\cap V)\cong\Z\). The key fact is geometric: <strong>the boundary of a Möbius band wraps twice around its core</strong>. The overlap annulus is a thickening of a circle parallel to the boundary of \(U\), and also of \(V\). So the generator of \(H_1(U\cap V)\) is twice the core in each:
</p>
\[ \Phi_1\colon\Z\to\Z^2,\qquad 1\mapsto(2,\,-2). \]

<Figure size="wide" num="3.6.8" title="The boundary of a Möbius band goes around twice" hint="Drag to rotate · walk along the boundary">
	<MobiusDouble />
	{#snippet caption()}
		A bead walks once along the teal boundary of a Möbius band, which is a single closed curve. Its shadow on the gold core circle goes around <em>twice</em>. That factor \(2\) is the \(\Phi_1(1) = (2,-2)\) of the Klein bottle computation, and it is where the torsion \(\Z/2\) comes from.
	{/snippet}
</Figure>

<p>Now read the sequence.</p>
<ul>
	<li>\(\Phi_1\) is injective, so \(H_2(K)\cong\ker\Phi_1 = 0\). The Klein bottle has no \(2\)-dimensional class, just as orientability predicted in <Ref to="homology/computing" />.</li>
	<li>In degree \(0\), \(\Phi_0(1) = (1,-1)\) is injective, so \(\ker\Phi_0 = 0\), and \(H_1(K)\cong\operatorname{coker}\Phi_1 = \Z^2/\langle(2,-2)\rangle\).</li>
</ul>
<p>
	To recognize this quotient, change basis: \((1,-1)\) and \((0,1)\) also form a basis of \(\Z^2\), and in that basis we are dividing out by twice the first vector. So
</p>
\[ H_1(K)\;\cong\;\Z/2\oplus\Z, \]
<p>
	in agreement with the Smith normal form computation of <Ref to="homology/computing" />. We have <em>seen</em> the torsion: the element of order two is “once around the core”, whose double is homologous to the boundary circle of a Möbius band.
</p>

<Remark title="These computations were checked by machine">
	<p>
		The groups in both tables were confirmed by this book's homology engine on triangulated models, with the strips as actual subcomplexes. In the Klein bottle the overlap circle comes out as exactly twice the core of each Möbius band, in homology.
	</p>
</Remark>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="cellular-homology">Cellular homology: homology squared</h2>

<p>
	Mayer–Vietoris is flexible, but for spaces built from cells there is something faster still. Recall the <Term t="cw-complex">CW complexes</Term> of <Ref to="topology/simplicial-complexes" />: start with points, attach edges by their endpoints, attach disks by maps of their boundary circles, attach balls by maps of their boundary spheres, and so on. The \(n\)-skeleton \(X^n\) is everything built after the \(n\)-dimensional cells have been attached. A torus needs only one vertex, two edges and one face; a triangulation needs at least \(7 + 21 + 14\) simplices.
</p>

<p>The theory of this chapter gives two facts about skeleta:</p>
<ol>
	<li>
		\(H_k(X^n,X^{n-1})\) is zero unless \(k = n\), and \(H_n(X^n,X^{n-1})\) is free abelian with one generator for each \(n\)-cell. The pair is good, and \(X^n/X^{n-1}\) is a wedge of \(n\)-spheres, one for each \(n\)-cell, whose homology we now know.
	</li>
	<li>Gluing on cells of dimension higher than \(n+1\) does not change \(H_n\).</li>
</ol>

<Definition id="def-cellular">
	{#snippet head()}The cellular chain complex{/snippet}
	<p>
		Let \(C_n^{\mathrm{CW}}(X) = H_n(X^n,X^{n-1})\), the free abelian group on the \(n\)-cells. Its boundary map \(d_n\) is the composite
	</p>
	\[ H_n(X^n,X^{n-1})\xrightarrow{\ \partial_*\ }H_{n-1}(X^{n-1})\to H_{n-1}(X^{n-1},X^{n-2}) \]
	<p>
		of a connecting map and an induced map. The homology of \((C^{\mathrm{CW}}_\bullet, d)\) is the <dfn>cellular homology</dfn> of \(X\).
	</p>
</Definition>

<p>
	This is Hatcher's “homology squared”: the chain groups are themselves homology groups, and the boundary maps are built from the long exact sequences of pairs. The punchline is that it gives the right answer.
</p>

<Theorem id="thm-cellular" label="Theorem (cellular homology)">
	<p>\(H_n^{\mathrm{CW}}(X)\cong H_n(X)\) for every CW complex \(X\) and every \(n\).</p>
</Theorem>

<p>
	To use it, we need to compute \(d_n\) on each cell. The answer is a degree, in the sense of <Ref to="homology/invariance" hash="degree" />. The <dfn>cellular boundary formula</dfn> says
</p>
\[ d_n(e^n_\alpha) = \sum_\beta d_{\alpha\beta}\,e^{n-1}_\beta, \]
<p>
	where \(d_{\alpha\beta}\) is the degree of the map \(S^{n-1}\to S^{n-1}\) obtained by first attaching the boundary of \(e_\alpha\) to \(X^{n-1}\), and then collapsing everything except the cell \(e_\beta\) to a point. In words: <strong>how many times, counted with signs, the boundary of \(e_\alpha\) runs over \(e_\beta\)</strong>.
</p>

<p>In low dimensions this needs no topology at all.</p>
<ul>
	<li><strong>Edges:</strong> \(d_1(e) = (\text{end}) - (\text{start})\), exactly as for simplices.</li>
	<li>
		<strong>Faces glued along a word:</strong> if a disk is attached along a word in the edge letters, then the coefficient of an edge \(a\) in \(d_2(\text{face})\) is the <dfn>exponent sum</dfn> of \(a\) in the word. Each occurrence of \(a\) counts \(+1\), and each \(a^{-1}\) counts \(-1\).
	</li>
</ul>

<p>Two corollaries come for free.</p>
<Corollary id="cor-cellular">
	{#snippet head()}Reading homology off the cells{/snippet}
	<p>
		If \(X\) has no \(n\)-cells, then \(H_n(X) = 0\). If \(X\) has no two cells in adjacent dimensions, then every \(d\) is zero, and \(H_n(X)\) is free abelian on the \(n\)-cells.
	</p>
</Corollary>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="cellular-examples">A gallery of cellular computations</h2>

<h3>Spheres, again</h3>
<p>
	\(S^n\) is one \(0\)-cell with one \(n\)-cell attached by the constant map. For \(n\ge2\) the cells are not in adjacent dimensions, so \(H_0\cong H_n\cong\Z\) and all else vanishes. For \(n = 1\), the single edge has both ends at the single vertex, so \(d_1 = (\text{end}) - (\text{start}) = 0\), and again \(H_0\cong H_1\cong\Z\). Two lines, compared with a whole section of Mayer–Vietoris.
</p>

<h3>Surfaces from words</h3>
<p>
	Every closed surface is a polygon with its sides glued in pairs according to a word (<Ref to="topology/gluing" />). Its cell structure has one face, one edge for each letter, and one vertex for each class of corners that the gluing identifies. Then:
</p>
<ul>
	<li>
		<strong>Orientable genus \(g\)</strong>, with word \(a_1b_1a_1^{-1}b_1^{-1}\cdots a_gb_ga_g^{-1}b_g^{-1}\): all corners become one vertex, so \(d_1 = 0\). Every letter appears once with exponent \(+1\) and once with \(-1\), so \(d_2 = 0\). Hence \(H_0\cong\Z\), \(H_1\cong\Z^{2g}\) and \(H_2\cong\Z\), the last generated by the face.
	</li>
	<li>
		<strong>The projective plane</strong>, \(aa\): one vertex, one edge, and \(d_2(\text{face}) = 2a\). So \(H_1\cong\Z/2\) and \(H_2 = \ker d_2 = 0\). The chain complex is the shortest possible picture of torsion: \(0\to\Z\xrightarrow{\times2}\Z\xrightarrow{0}\Z\to0\).
	</li>
	<li>
		<strong>The Klein bottle</strong>, \(abab^{-1}\): exponent sums \(2\) for \(a\) and \(0\) for \(b\), so \(d_2 = 2a\), \(H_1\cong\Z^2/\langle 2a\rangle\cong\Z\oplus\Z/2\) and \(H_2 = 0\). Two lines again.
	</li>
	<li>
		<strong>\(k\) cross-caps</strong>, \(a_1a_1\cdots a_ka_k\): \(d_2 = (2,\dots,2)\). Replacing the basis vector \(a_k\) by \(a_1+\dots+a_k\) turns this into \(2(a_1 + \dots + a_k)\), so \(H_1\cong\Z^{k-1}\oplus\Z/2\) and \(H_2 = 0\).
	</li>
</ul>

<Warning>
	<p>
		Count the vertices honestly. The projective plane can also be written \(abab\), a square with both pairs of sides flipped. Then the four corners fall into <strong>two</strong> classes, not one. Forgetting this gives the wrong \(H_1\). The calculator below does the bookkeeping with the same rule you would use by hand: glue the tails of matching arrows together, and their heads together.
	</p>
</Warning>

<Figure size="full" num="3.6.9" title="A cellular homology calculator" hint="Type a word or pick a preset · switch modes for ℝPⁿ and ℂPⁿ">
	<CellularCalc />
	{#snippet caption()}
		Type any word in edge letters (a capital letter or a <code>^-1</code> marks an inverse). The polygon is drawn with its arrows, and its corners are coloured by which vertex of the glued space they become. Alongside it are the cellular chain complex — \(\partial_2\) holds the exponent sums, \(\partial_1\) the ends minus the starts — and the homology, computed with the Smith normal form. Rose groups contain torsion. Try the dunce cap \(aaa^{-1}\): the space is contractible. The second mode shows the cell ladders of \(\RP^n\), \(\CP^n\) and \(S^n\).
	{/snippet}
</Figure>

<h3>Real projective space</h3>
<p>
	The real projective space \(\RP^n\) is the sphere \(S^n\) with each pair of opposite points identified, or equivalently the set of lines through the origin in \(\R^{n+1}\). We met \(\RP^2\) in <Ref to="topology/gluing" />. Building it up one dimension at a time gives a cell structure with exactly one cell in each dimension \(0,1,\dots,n\). The \(k\)-cell is attached by the map \(S^{k-1}\to\RP^{k-1}\) that identifies opposite points.
</p>
<p>
	To find \(d_k\), apply the cellular boundary formula. After collapsing \(\RP^{k-2}\), the attaching map covers the \(k-1\) sphere twice: once by its northern hemisphere, which is the identity, and once by its southern hemisphere, which differs from the northern one by the antipodal map of \(S^{k-1}\), of degree \((-1)^k\). So
</p>
\[ d_k = 1 + (-1)^k = \begin{cases} 2 & k \text{ even},\\ 0 & k\text{ odd}.\end{cases} \]
<p>The cellular chain complex alternates between \(\times2\) and \(0\):</p>
\[ \cdots\xrightarrow{\ \times 2\ }\Z\xrightarrow{\ 0\ }\Z\xrightarrow{\ \times2\ }\Z\xrightarrow{\ 0\ }\Z\to0, \]
<p>which gives</p>
\[ H_k(\RP^n) \cong \begin{cases} \Z & k = 0, \text{ or } k = n \text{ odd},\\ \Z/2 & k \text{ odd},\ 0 \lt k \lt n,\\ 0 & \text{otherwise.}\end{cases} \]
<p>
	So \(\RP^3\) has \(H_3\cong\Z\): it is orientable, like every odd-dimensional projective space. With \(\Z/2\) coefficients every \(d_k\) becomes \(0\), and \(H_k(\RP^n;\Z/2)\cong\Z/2\) for every \(0\le k\le n\). Try both in the second mode of the calculator.
</p>

<h3>Complex projective space</h3>
<p>
	The complex projective space \(\CP^n\) is the set of complex lines through the origin in \(\C^{n+1}\), a space of real dimension \(2n\). Its natural cell structure has one cell in each <em>even</em> dimension \(0,2,4,\dots,2n\), and no others. Since no two cells sit in adjacent dimensions, every boundary map is zero. So
</p>
\[ H_{2k}(\CP^n)\cong\Z\ \ (0\le k\le n),\qquad H_{\text{odd}}(\CP^n) = 0, \]
<p>
	with no computation at all. (\(\CP^1\) is the sphere \(S^2\), the Riemann sphere of complex analysis.) As the previous chapter warned, \(\CP^2\) has the same homology as the wedge \(S^2\vee S^4\), yet the two spaces are different. Telling them apart needs the cup product of <Ref to="cohomology/cup-product" />.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Exact or not?">
	<p>
		(a) Is \(0\to\Z\xrightarrow{\times3}\Z\xrightarrow{\bmod3}\Z/3\to0\) exact? What about \(0\to\Z\xrightarrow{\times6}\Z\xrightarrow{\bmod3}\Z/3\to0\)? (b) If \(0\to\Z^3\to B\to\Z^2\to0\) is exact, what is the rank of \(B\)? (c) Explain why \(0\to\Z/2\to\Z\) can never be exact.
	</p>
	{#snippet solution()}
		<p>
			(a) The first is exact: \(\times3\) is injective, reduction is surjective, and \(\im(\times3) = 3\Z = \ker(\bmod3)\). The second is a chain complex (\(6\Z\subseteq3\Z\)) but not exact in the middle: the gap \(3\Z/6\Z\cong\Z/2\).
		</p>
		<p>(b) By the rank rule, \(3 - \rank B + 2 = 0\), so \(\rank B = 5\).</p>
		<p>(c) Exactness would make \(\Z/2\to\Z\) injective. But a homomorphism sends the element of order \(2\) to an element \(x\) with \(2x = 0\), and in \(\Z\) only \(x = 0\) qualifies. So the map is zero, which is not injective.</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="A pair from a long exact sequence">
	<p>
		Use the long exact sequence of the pair to compute \(H_k([0,1],\{0,1\})\) for all \(k\), and check your answer against \(\tilde H_k\) of the space obtained by gluing \(0\) to \(1\).
	</p>
	{#snippet solution()}
		<p>
			The interval is contractible, and \(\{0,1\}\) is two points, with \(\tilde H_0 = \Z\) and nothing else. The reduced sequence gives \(H_1([0,1],\{0,1\})\cong\tilde H_0(\{0,1\})\cong\Z\), generated by the whole interval, whose boundary \(1 - 0\) is the generator of \(\tilde H_0\). All other relative groups are \(0\). Gluing \(0\) to \(1\) gives a circle, with \(\tilde H_1(S^1)\cong\Z\) and nothing else. They match, as the good-pair theorem promises.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The figure eight by Mayer–Vietoris">
	<p>
		Let \(X = S^1\vee S^1\), two circles joined at a point. Take \(U\) to be the first circle together with a short open stretch of the second near the join, and \(V\) the same with the roles swapped. Compute \(H_*(X)\).
	</p>
	{#snippet solution()}
		<p>
			\(U\) and \(V\) each deformation retract to a circle, and \(U\cap V\) is a small open cross around the join point, which is contractible. In reduced homology the sequence reads \(0 = \tilde H_1(U\cap V)\to\tilde H_1(U)\oplus\tilde H_1(V)\to\tilde H_1(X)\to\tilde H_0(U\cap V) = 0\). So \(H_1(X)\cong\Z\oplus\Z = \Z^2\), and \(H_0(X)\cong\Z\) since \(X\) is connected. The same argument shows that, for any reasonable wedge, \(\tilde H_n(X\vee Y)\cong\tilde H_n(X)\oplus\tilde H_n(Y)\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Suspension">
	<p>
		The suspension \(SX\) is the union of two cones \(C_+X\) and \(C_-X\) on \(X\), glued along their bases. Show that \(\tilde H_{k+1}(SX)\cong\tilde H_k(X)\) for every \(k\), and deduce the homology of spheres again.
	</p>
	{#snippet solution()}
		<p>
			Thicken the two cones slightly so that their interiors cover \(SX\). Each cone is contractible (slide everything to the tip), and their intersection deformation retracts onto the base, a copy of \(X\). In the reduced Mayer–Vietoris sequence the cone terms vanish, so \(0\to\tilde H_{k+1}(SX)\xrightarrow{\partial}\tilde H_k(X)\to0\), and \(\partial\) is an isomorphism. Since \(S^{n} = S(S^{n-1})\), induction from \(\tilde H_0(S^0) = \Z\) gives \(\tilde H_n(S^n)\cong\Z\) and all other reduced groups zero.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Hats and caps">
	<p>
		Compute the cellular homology of the spaces given by the words (a) \(aaa^{-1}\), the <em>dunce cap</em>, and (b) \(aaa\). Check your answers with the calculator.
	</p>
	{#snippet solution()}
		<p>
			Both words have a single letter, and all corners are identified to one vertex, so \(d_1 = 0\). (a) The exponent sum is \(1 + 1 - 1 = 1\), so \(d_2 = 1\): it is an isomorphism \(\Z\to\Z\). Hence \(H_1 = \Z/1 = 0\) and \(H_2 = \ker d_2 = 0\): the dunce cap has the homology of a point (in fact it is contractible, although it cannot be collapsed onto a point face by face). (b) The exponent sum is \(3\), so \(H_1\cong\Z/3\) and \(H_2 = 0\). This space is a “mod 3 projective plane”: a loop that must be traversed three times before it bounds.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Real projective 3-space">
	<p>Write down the cellular chain complex of \(\RP^3\), with integer and with \(\Z/2\) coefficients, and compute both homologies. Which tells you that \(\RP^3\) is orientable?</p>
	{#snippet solution()}
		<p>
			With integers: \(0\to\Z\xrightarrow{d_3 = 0}\Z\xrightarrow{d_2 = \times2}\Z\xrightarrow{d_1 = 0}\Z\to0\). So \(H_0 = \Z\), \(H_1 = \Z/2\), \(H_2 = \ker(\times2)/\im 0 = 0\) and \(H_3 = \ker d_3 = \Z\). Mod \(2\) every map becomes \(0\), so all four groups are \(\Z/2\). The integral top group \(H_3\cong\Z\) is the sign of orientability, as \(H_2\cong\Z\) was for closed surfaces. Mod \(2\) the top group is \(\Z/2\) for every closed manifold, orientable or not, so it cannot tell.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Products of spheres">
	<p>
		For \(n\ge2\), the product \(S^n\times S^n\) has a cell structure with one cell in each of the dimensions \(0\), \(n\), \(n\) and \(2n\). Compute its homology. Then explain why the same shortcut does not apply when \(n = 1\), and what the right answer is in that case.
	</p>
	{#snippet solution()}
		<p>
			For \(n\ge2\) the dimensions \(0, n, n, 2n\) contain no adjacent pair, so all boundary maps vanish: \(H_0\cong\Z\), \(H_n\cong\Z^2\), \(H_{2n}\cong\Z\), and all others are \(0\). For \(n = 1\) the cells have dimensions \(0, 1, 1, 2\), which are adjacent, so the corollary does not apply and we must compute. This is the torus, with word \(aba^{-1}b^{-1}\): \(d_2 = 0\) (exponent sums zero) and \(d_1 = 0\) (one vertex). So the answer has the same shape: \(\Z,\ \Z^2,\ \Z\).
		</p>
	{/snippet}
</Exercise>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li><strong>Exactness</strong>, \(\im = \ker\), means nothing lost and nothing extra. A chain complex is exact exactly when its homology vanishes; homology measures the failure of exactness.</li>
		<li>A short exact sequence of chain complexes gives a <strong>long exact sequence</strong> in homology. The connecting map \(\partial_*\) is the zig-zag: lift, take the boundary, pull back.</li>
		<li><strong>Relative homology</strong> \(H_n(X,A)\) uses chains modulo chains in \(A\). For good pairs it equals \(\tilde H_n(X/A)\): homology after crushing \(A\). The pair gives a long exact sequence \(\cdots\to H_n(A)\to H_n(X)\to H_n(X,A)\to H_{n-1}(A)\to\cdots\).</li>
		<li><strong>Excision:</strong> cutting out a piece deep inside \(A\) does not change \(H_n(X,A)\). Homology is local.</li>
		<li><strong>Mayer–Vietoris:</strong> for \(X = U\cup V\), the sequence \(\cdots\to H_n(U\cap V)\to H_n(U)\oplus H_n(V)\to H_n(X)\to H_{n-1}(U\cap V)\to\cdots\) is exact. It is inclusion–exclusion for holes.</li>
		<li>Worked out: \(\tilde H_k(S^n)\cong\tilde H_{k-1}(S^{n-1})\); the torus from two cylinders; the Klein bottle from two Möbius bands, where \(1\mapsto 2\) produces the \(\Z/2\).</li>
		<li><strong>Cellular homology</strong> (“homology squared”) uses one generator per cell, and boundary maps given by degrees. For words, \(\partial_2\) holds the exponent sums. \(\RP^n\) has \(d_k = 1 + (-1)^k\); \(\CP^n\) has no adjacent cells, so \(H_{2k}\cong\Z\).</li>
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
			note: 'Exact sequences, relative homology and excision in §2.1; cellular homology and Mayer–Vietoris in §2.2, including the sphere and Klein bottle examples (Examples 2.46–2.47) and projective spaces. The source of “homology squared”.',
			kind: 'book',
			free: true
		},
		{
			title: 'A Concise Course in Algebraic Topology',
			author: 'J. Peter May',
			url: 'https://www.math.uchicago.edu/~may/CONCISE/ConciseRevised.pdf',
			note: 'A brisk, axiomatic treatment: homology characterized by its properties (exactness, excision, homotopy invariance), then computed with cellular chains. Best read after this chapter.',
			kind: 'book',
			free: true
		},
		{
			title: 'An Introduction to Algebraic Topology',
			author: 'Joseph J. Rotman',
			url: 'https://link.springer.com/book/10.1007/978-1-4612-4576-6',
			note: 'Unusually patient with diagram chasing: exact sequences, the zig-zag lemma and Mayer–Vietoris are all done in full detail.',
			kind: 'book'
		},
		{
			title: 'Homology Theory: An Introduction to Algebraic Topology',
			author: 'James W. Vick',
			url: 'https://link.springer.com/book/10.1007/978-1-4612-0881-5',
			note: 'Clear chapters on exact sequences, Mayer–Vietoris and the homology of CW complexes, with many computations.',
			kind: 'book'
		},
		{
			title: 'Topology and Geometry',
			author: 'Glen E. Bredon',
			url: 'https://link.springer.com/book/10.1007/978-1-4757-6848-0',
			note: 'Chapter IV treats CW complexes and cellular homology carefully, including the degree computation behind the boundary of real projective space.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology I (lectures)',
			author: 'Pierre Albin',
			url: 'https://www.youtube.com/playlist?list=PLjuyMEhIbRmBixjg0ZeRvWBQx_KMGC5Tv',
			note: 'A graduate course that follows Hatcher closely; the lectures on Mayer–Vietoris and on the homology of cell complexes are a rigorous companion to this chapter.',
			kind: 'video',
			free: true
		}
	]}
/>
